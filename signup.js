/* Vidyasutra — Student Registration Controller */
(function () {
  "use strict";

  const auth = window.VidyaSutraAuth;
  if (!auth) return;

  const form = document.getElementById("signupForm");
  const statusEl = document.getElementById("signupStatus");

  function showStatus(message, type = "info") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = `status-banner ${type}`;
    statusEl.classList.remove("hidden");
  }

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName")?.value.trim() || "";
    const email = auth.normalizedEmail(document.getElementById("email")?.value);
    const teachSkills = document.getElementById("teachSkills")?.value.trim() || "";
    const learnSkills = document.getElementById("learnSkills")?.value.trim() || "";
    const password = document.getElementById("password")?.value || "";
    const confirmPassword = document.getElementById("confirmPassword")?.value || "";
    const agreeTerms = document.getElementById("agreeTerms")?.checked;

    if (!fullName || !email || !teachSkills || !learnSkills) {
      showStatus("Please complete all required profile fields.", "error");
      return;
    }

    if (password.length < 6) {
      showStatus("Password must be at least 6 characters long.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showStatus("Passwords do not match. Please double-check.", "error");
      return;
    }

    if (!agreeTerms) {
      showStatus("Please accept the peer learning community guidelines.", "error");
      return;
    }

    if (auth.getAccountByEmail(email)) {
      showStatus("An account with this email already exists. Please log in instead.", "error");
      return;
    }

    try {
      const { salt, passwordHash } = await auth.hashPassword(password);
      const accounts = auth.readAccounts();
      const newAccount = {
        fullName,
        email,
        teachSkills,
        learnSkills,
        salt,
        passwordHash,
        createdAt: new Date().toISOString()
      };
      accounts.push(newAccount);
      auth.writeAccounts(accounts);

      // Automatically sign the student in and redirect to workspace
      auth.setSession(
        {
          fullName,
          email,
          teachSkills,
          learnSkills
        },
        true
      );

      showStatus("Account created! Entering your Vidyasutra workspace…", "success");
      setTimeout(() => {
        window.location.replace("dashboard.html");
      }, 350);
    } catch (err) {
      showStatus(err.message || "Could not save account.", "error");
    }
  });
})();
