window.DPRO_DISPOSAL_CONFIG = Object.freeze({
  API_BASE: "https://cbknucemarcpbscirzyv.supabase.co/functions/v1/dpro-disposal-control-adapter",
  COMPANY_CODE: "dpro_disposal_demo",
  VERSION: "DISPOSAL-PR2-FRONTEND-20260824",
  FRONTEND_VERSION: "DISPOSAL-PR2-FRONTEND-20260824",
  ADAPTER_VERSION: "DPRO-CONTROL-ADAPTER-1.0-DISPOSAL-20260824-R2",
  DATABASE_VERSION: "DISPOSAL-DB-PR2-20260824",
  LIFF_ID: "",
  DEFAULT_LINE_USER_ID: ""
});

/* DPRO DISPOSAL PRODUCT READY R2 SECURITY BRIDGE */
(() => {
  "use strict";
  const CFG = window.DPRO_DISPOSAL_CONFIG;
  const API_BASE = String(CFG.API_BASE || "").replace(/\/$/, "");
  const COMPANY_CODE = CFG.COMPANY_CODE || "dpro_disposal_demo";
  const RAW_FETCH = window.fetch.bind(window);
  const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const IS_DEMO = params.get("demo") === "1" || COMPANY_CODE.includes("demo");
  const ROLE = page === "staff.html" ? "staff" : (["owner.html", "system-check.html"].includes(page) ? "owner" : "public");
  const SESSION_KEY = ROLE === "staff" ? "dpro_disposal_staff_session" : "dpro_disposal_owner_session";
  let authPromise = null;
  let liffInitPromise = null;

  function normalizePhone(value) {
    let s = String(value || "").normalize("NFKC").replace(/[ー－―‐ｰ]/g, "-").replace(/[^0-9+]/g, "");
    if (s.startsWith("+81")) s = "0" + s.slice(3);
    if (s.startsWith("0081")) s = "0" + s.slice(4);
    return s.replace(/\D/g, "");
  }
  function sessionToken() { return sessionStorage.getItem(SESSION_KEY) || ""; }
  function staffCode() { return String(document.getElementById("dproStaffCode")?.value || "").trim(); }

  async function secureLogin(adminCode) {
    const existing = sessionToken();
    if (existing) return existing;
    if (!adminCode) return "";
    if (authPromise) return authPromise;
    authPromise = (async () => {
      const endpoint = ROLE === "staff" ? "/api/auth/staff/login" : "/api/auth/owner/login";
      const body = ROLE === "staff" ? { code: adminCode, staff_code: staffCode() } : { code: adminCode };
      if (ROLE === "staff" && !body.staff_code) throw new Error("スタッフコードを入力してください。");
      const u = new URL(API_BASE + endpoint);
      u.searchParams.set("company_code", COMPANY_CODE);
      const r = await RAW_FETCH(u.toString(), { method: "POST", headers: { "content-type": "application/json", "accept": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.ok === false || !data.session?.token) throw new Error(data?.error?.message || "ログインを確認できませんでした。");
      sessionStorage.setItem(SESSION_KEY, data.session.token);
      window.setTimeout(() => { sessionStorage.removeItem("dpro_disposal_admin"); sessionStorage.removeItem("dpro_disposal_staff_admin"); }, 600);
      return data.session.token;
    })();
    try { return await authPromise; } finally { authPromise = null; }
  }

  async function revokeSecureSession() {
    const token = sessionToken();
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("dpro_disposal_admin");
    sessionStorage.removeItem("dpro_disposal_staff_admin");
    if (!token) return;
    try {
      const u = new URL(API_BASE + "/api/auth/session/revoke");
      u.searchParams.set("company_code", COMPANY_CODE);
      await RAW_FETCH(u.toString(), { method: "POST", headers: { "content-type": "application/json", "authorization": "Bearer " + token }, body: "{}", cache: "no-store" });
    } catch (_) {}
  }

  function loadLiffScript() {
    if (window.liff) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-dpro-liff="1"]');
      if (existing) { existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", reject, { once: true }); return; }
      const s = document.createElement("script");
      s.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
      s.async = true; s.dataset.dproLiff = "1"; s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
    });
  }
  async function lineIdToken() {
    if (!CFG.LIFF_ID) return "";
    if (!liffInitPromise) liffInitPromise = (async () => { await loadLiffScript(); await window.liff.init({ liffId: CFG.LIFF_ID }); return true; })();
    try { await liffInitPromise; return window.liff.isLoggedIn() ? (window.liff.getIDToken() || "") : ""; } catch (_) { return ""; }
  }

  function scrubJsonBody(body) {
    if (!body || typeof body !== "object") return body;
    if (Object.prototype.hasOwnProperty.call(body, "line_user_id")) delete body.line_user_id;
    if (body.customer && typeof body.customer === "object") {
      if (Object.prototype.hasOwnProperty.call(body.customer, "line_user_id")) delete body.customer.line_user_id;
      if (typeof body.customer.phone === "string") body.customer.phone = normalizePhone(body.customer.phone);
    }
    if (typeof body.phone === "string") body.phone = normalizePhone(body.phone);
    return body;
  }

  window.fetch = async function dproDisposalSecureFetch(resource, options = {}) {
    const sourceUrl = resource instanceof Request ? resource.url : String(resource || "");
    let url;
    try { url = new URL(sourceUrl, window.location.href); } catch { return RAW_FETCH(resource, options); }
    if (!url.toString().startsWith(API_BASE)) return RAW_FETCH(resource, options);
    const next = { ...options };
    const headers = new Headers(resource instanceof Request ? resource.headers : undefined);
    new Headers(options.headers || {}).forEach((v, k) => headers.set(k, v));
    headers.set("X-DPRO-Frontend-Version", CFG.FRONTEND_VERSION);
    if (IS_DEMO) headers.set("X-DPRO-Demo", "1");
    if (ROLE !== "public") headers.set("X-DPRO-Client-Role", ROLE);
    if (ROLE === "staff" && staffCode()) headers.set("X-DPRO-Staff-Id", staffCode());
    if (url.searchParams.has("line_user_id")) url.searchParams.delete("line_user_id");
    if (url.pathname.endsWith("/api/admin/customers/search") && url.searchParams.has("q")) {
      const q = url.searchParams.get("q") || "", n = normalizePhone(q); if (n.length >= 10) url.searchParams.set("q", n);
    }
    const contentType = String(headers.get("content-type") || "").toLowerCase();
    if (typeof next.body === "string" && contentType.includes("application/json")) { try { next.body = JSON.stringify(scrubJsonBody(JSON.parse(next.body))); } catch (_) {} }
    const idToken = await lineIdToken(); if (idToken) headers.set("X-Line-ID-Token", idToken);
    if (url.pathname.includes("/api/admin/")) {
      let token = sessionToken();
      const rawAdmin = String(headers.get("x-admin-code") || "").trim();
      if (!token && rawAdmin && ROLE !== "public") token = await secureLogin(rawAdmin);
      if (token) { headers.delete("x-admin-code"); headers.set("authorization", "Bearer " + token); }
    }
    next.headers = headers;
    return RAW_FETCH(url.toString(), next);
  };

  function injectStaffCodeField() {
    if (page !== "staff.html" || document.getElementById("dproStaffCode")) return;
    const admin = document.getElementById("adminCode"), field = admin?.closest(".field");
    if (!field?.parentElement) return;
    const wrap = document.createElement("div"); wrap.className = "field"; wrap.style.marginBottom = "12px";
    const label = document.createElement("label"); label.htmlFor = "dproStaffCode"; label.textContent = "スタッフコード";
    const input = document.createElement("input"); input.id = "dproStaffCode"; input.autocomplete = "username"; input.maxLength = 50; input.placeholder = "例：FIELD-01"; if (IS_DEMO) input.value = "FIELD-01";
    const help = document.createElement("div"); help.className = "help"; help.textContent = "スタッフごとの権限で安全にログインします。";
    wrap.append(label, input, help); field.parentElement.insertBefore(wrap, field);
  }

  const replacements = new Map([
    ["API接続中", "接続確認中"], ["API接続OK", "接続正常"], ["API接続エラー", "接続を確認"], ["APIエラー", "接続を確認"],
    ["APIへ接続できないため、画面確認用データを表示しています。", "最新情報を取得できないため、画面確認用データを表示しています。"],
    ["API応答を取得できなかったため、画面確認用データを表示しています。", "最新情報を取得できないため、画面確認用データを表示しています。"]
  ]);
  function cleanVisibleTechnicalText(root = document.body) {
    if (!root || page === "system-check.html") return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) { const text = node.nodeValue || ""; let next = text; replacements.forEach((to, from) => { next = next.split(from).join(to); }); if (next !== text) node.nodeValue = next; }
  }

  window.addEventListener("DOMContentLoaded", () => {
    injectStaffCodeField(); cleanVisibleTechnicalText();
    if (page !== "system-check.html") {
      const observer = new MutationObserver(mutations => { for (const m of mutations) m.addedNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE && n.parentElement) cleanVisibleTechnicalText(n.parentElement); else if (n.nodeType === Node.ELEMENT_NODE) cleanVisibleTechnicalText(n); }); });
      observer.observe(document.body, { childList: true, subtree: true });
    } else document.querySelectorAll("footer").forEach(f => { f.textContent = f.textContent.replace("DISPOSAL-7-R1", CFG.FRONTEND_VERSION); });
    const logout = document.getElementById("logoutBtn"); if (logout) logout.addEventListener("click", () => { revokeSecureSession(); }, { capture: true });
    if (!IS_DEMO || !["owner.html", "staff.html"].includes(page)) return;
    const adminCode = document.getElementById("adminCode"), loginButton = document.getElementById("loginBtn"), appView = document.getElementById("appView");
    if (!adminCode || !loginButton || (appView && !appView.classList.contains("hidden"))) return;
    adminCode.value = "1234";
    window.setTimeout(() => { if (appView && !appView.classList.contains("hidden")) return; loginButton.click(); }, 120);
  });
})();

/* DPRO TUTORIAL / DISPOSAL / BATCH-09 / R3 LOADER */
(() => {
  "use strict";
  const page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (page !== "owner.html") return;
  window.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector('script[data-dpro-tutorial-r3="1"]')) return;
    const s = document.createElement("script");
    s.src = "dpro-tutorial-r3.js";
    s.async = true;
    s.dataset.dproTutorialR3 = "1";
    document.head.appendChild(s);
  }, { once: true });
})();
