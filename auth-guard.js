/* Protect Vidyasutra dashboard and handle clean logout to index.html */
"use strict";
(function () {
  const auth = window.VidyaSutraAuth || window.SkillSwapAuth;
  const user = auth ? auth.getSession() : null;

  if (!user) {
    window.location.replace("login.html?required=1");
    return;
  }

  window.vidyaSutraCurrentUser = user;

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      auth.clearSession();
      window.location.replace("index.html");
    });
  }
})();