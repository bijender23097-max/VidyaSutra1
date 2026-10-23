/* Vidyasutra — Login & Instant Demo Controller */
(function () {
  "use strict";

  const auth = window.VidyaSutraAuth;
  if (!auth) return;

  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberInput = document.getElementById("rememberMe");
  const toggleBtn = document.getElementById("togglePassword");
  const demoBtn = document.getElementById("instantDemoBtn");
  const statusEl = document.getElementById("authStatus");

  function showStatus(message, type = "info") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = `status-banner ${type}`;
    statusEl.classList.remove("hidden");
  }

  function startDemoSession() {
    const demoUser = {
      fullName: "Aarav Kumar",
      email: "aarav@vidyasutra.edu",
      teachSkills: "Git & GitHub, Python, HTML & CSS",
      learnSkills: "LLMs, Ethical Hacking, UI/UX Design",
      github: "https://github.com",
      createdAt: new Date().toISOString()
    };
    auth.setSession(demoUser, true);
    window.location.replace("dashboard.html");
  }

  // Handle URL parameters (?demo=1, ?registered=1, ?required=1)
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") === "1") {
    startDemoSession();
    return;
  }
  if (params.get("registered") === "1") {
    showStatus("Account created! Please log in with your email and password.", "success");
    const prefill = params.get("email");
    if (prefill && emailInput) emailInput.value = prefill;
  } else if (params.get("required") === "1") {
    showStatus("Please log in or launch the Instant Demo to open the Vidyasutra workspace.", "info");
  }

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      toggleBtn.textContent = isHidden ? "Hide" : "Show";
      toggleBtn.setAttribute("aria-pressed", String(isHidden));
    });
  }

  if (demoBtn) {
    demoBtn.addEventListener("click", startDemoSession);
  }

  document.querySelectorAll("[data-social-provider]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const provider = btn.getAttribute("data-social-provider");
      showStatus(
        `${provider} OAuth requires a backend server. Use your local account or click "Instant Demo Account" below.`,
        "info"
      );
    });
  });

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = auth.normalizedEmail(emailInput?.value);
      const password = passwordInput?.value || "";

      if (!email || !password) {
        showStatus("Please enter both your email and password.", "error");
        return;
      }

      const account = auth.getAccountByEmail(email);
      if (!account) {
        showStatus("No account found for this email. Create an account or use the Instant Demo button.", "error");
        return;
      }

      const { passwordHash } = await auth.hashPassword(password, account.salt);
      if (passwordHash !== account.passwordHash) {
        showStatus("Incorrect password. Please try again or reset your password.", "error");
        return;
      }

      auth.setSession(
        {
          fullName: account.fullName,
          email: account.email,
          teachSkills: account.teachSkills,
          learnSkills: account.learnSkills,
          github: account.github || "",
          linkedin: account.linkedin || ""
        },
        Boolean(rememberInput?.checked)
      );

      showStatus("Welcome back! Opening Vidyasutra workspace…", "success");
      setTimeout(() => window.location.replace("dashboard.html"), 250);
    });
  }
})();
