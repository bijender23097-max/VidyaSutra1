/* Vidyasutra Campus — Authentication & Session Engine
   Supports both local browser storage (including file:// protocol) and optional REST API. */
(function () {
  "use strict";

  const ACCOUNTS_KEY = "vidyasutra-local-accounts-v1";
  const LEGACY_ACCOUNTS_KEY = "skillswap-local-accounts-v1";
  const SESSION_KEY = "vidyasutra-auth-session-v1";
  const LEGACY_SESSION_KEY = "skillswap-auth-session-v1";
  const ITERATIONS = 120000;

  // Migrate any legacy SkillSwap data seamlessly
  try {
    if (!localStorage.getItem(ACCOUNTS_KEY) && localStorage.getItem(LEGACY_ACCOUNTS_KEY)) {
      localStorage.setItem(ACCOUNTS_KEY, localStorage.getItem(LEGACY_ACCOUNTS_KEY));
    }
    if (!localStorage.getItem(SESSION_KEY) && localStorage.getItem(LEGACY_SESSION_KEY)) {
      localStorage.setItem(SESSION_KEY, localStorage.getItem(LEGACY_SESSION_KEY));
    }
  } catch (_) {}

  function bytesToHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  // Fallback hash when opened directly via file:// where crypto.subtle is restricted
  function fallbackHash(password, salt) {
    const combined = `${salt}:${password}:vidyasutra-salt`;
    let h1 = 0xdeadbeef ^ combined.length;
    let h2 = 0x41c6ce57 ^ combined.length;
    for (let i = 0; i < combined.length; i++) {
      const ch = combined.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
  }

  async function hashPassword(password, existingSalt) {
    const salt = existingSalt || bytesToHex(
      window.crypto && window.crypto.getRandomValues
        ? window.crypto.getRandomValues(new Uint8Array(16))
        : Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256))
    );

    if (window.crypto && window.crypto.subtle) {
      try {
        const key = await window.crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(password),
          "PBKDF2",
          false,
          ["deriveBits"]
        );
        const derivedBits = await window.crypto.subtle.deriveBits(
          { name: "PBKDF2", salt: hexToBytes(salt), iterations: ITERATIONS, hash: "SHA-256" },
          key,
          256
        );
        return { salt, passwordHash: bytesToHex(new Uint8Array(derivedBits)) };
      } catch (_) {
        return { salt, passwordHash: fallbackHash(password, salt) };
      }
    }
    return { salt, passwordHash: fallbackHash(password, salt) };
  }

  function readAccounts() {
    try {
      const raw = window.localStorage.getItem(ACCOUNTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeAccounts(accounts) {
    try {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      return true;
    } catch (_) {
      throw new Error("Browser storage is disabled. Please enable localStorage.");
    }
  }

  function getSession() {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try {
        const raw = storage.getItem(SESSION_KEY) || storage.getItem(LEGACY_SESSION_KEY);
        if (raw) {
          const session = JSON.parse(raw);
          if (session && session.email) return session;
        }
      } catch (_) {}
    }
    return null;
  }

  function setSession(user, remember = true) {
    clearSession();
    const storage = remember ? window.localStorage : window.sessionStorage;
    try {
      storage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (_) {}
  }

  function clearSession() {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      try {
        storage.removeItem(SESSION_KEY);
        storage.removeItem(LEGACY_SESSION_KEY);
      } catch (_) {}
    }
  }

  function normalizedEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function getAccountByEmail(email) {
    const target = normalizedEmail(email);
    return readAccounts().find((acc) => normalizedEmail(acc.email) === target) || null;
  }

  const api = Object.freeze({
    accountsKey: ACCOUNTS_KEY,
    sessionKey: SESSION_KEY,
    hashPassword,
    readAccounts,
    writeAccounts,
    getSession,
    setSession,
    clearSession,
    getAccountByEmail,
    normalizedEmail
  });

  window.VidyaSutraAuth = api;
  window.SkillSwapAuth = api; // Backward compatibility alias
})();