window.DPRO_DISPOSAL_CONFIG = Object.freeze({
  API_BASE: "https://dpro-disposal-line-api.dpromstk2000.workers.dev",
  COMPANY_CODE: "dpro_disposal_demo",
  VERSION: "DISPOSAL-8-R2-DEMO-AUTO-LOGIN-20260717",
  DEFAULT_LINE_USER_ID: ""
});

/*
 * STEP DISPOSAL-8-R2
 * 営業デモURL（demo=1）の管理画面だけ、管理コード1234で自動ログインします。
 * 通常URLでは従来どおり管理コード入力画面を表示します。
 */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") !== "1") return;

  const page = window.location.pathname.split("/").pop();
  if (!["owner.html", "staff.html"].includes(page)) return;

  const adminCode = document.getElementById("adminCode");
  const loginButton = document.getElementById("loginBtn");
  const appView = document.getElementById("appView");

  if (!adminCode || !loginButton) return;
  if (appView && !appView.classList.contains("hidden")) return;

  adminCode.value = "1234";

  window.setTimeout(() => {
    if (appView && !appView.classList.contains("hidden")) return;
    loginButton.click();
  }, 80);
});
