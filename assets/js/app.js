/*
檔案位置：skhps-smoke/assets/js/app.js
時間戳記：2026-06-16 15:30 UTC+8
用途：SKHPS Smoke 外部專案最小業務入口；只處理本頁內容初始化與 app-ready 回報，不管理水庫 runtime。
*/

(function () {
  "use strict";

  var READY_TASK = "app-ready";

  function getAppTitle() {
    var config = window.SKHPS_APP_CONFIG || window.SKHPS_APP_CARD || {};
    var html = document.documentElement;

    return (
      config.title ||
      config.name ||
      html.getAttribute("data-loading-title") ||
      html.getAttribute("data-skhps-page-map-current") ||
      document.title ||
      "SKHPS 外部 App"
    );
  }

  function setStatus(text) {
    var el = document.querySelector("[data-app-status]");
    if (el) {
      el.textContent = text;
    }
  }

  function loadingDone() {
    document.documentElement.setAttribute("data-skhps-page-ready", "true");
    document.documentElement.setAttribute("data-skhps-app-ready", "true");

    if (window.SKHPSLoading && typeof window.SKHPSLoading.done === "function") {
      window.SKHPSLoading.done(READY_TASK);
      return;
    }

    document.documentElement.classList.remove("skhps-loading");
    document.documentElement.classList.remove("skhps-main-loading");
  }

  function loadingFail(error) {
    document.documentElement.setAttribute("data-skhps-page-ready", "false");
    document.documentElement.setAttribute("data-skhps-app-ready", "false");

    if (window.SKHPSLoading && typeof window.SKHPSLoading.fail === "function") {
      window.SKHPSLoading.fail(READY_TASK, error);
      return;
    }

    document.documentElement.classList.remove("skhps-loading");
    document.documentElement.classList.remove("skhps-main-loading");
  }

  function init() {
    var appTitle = getAppTitle();

    try {
      setStatus(appTitle + " 已初始化。");

      /*
        Smoke 頁目前不接後端、不載 ajax module。
        這裡只驗證：
        - app-entry.js 有載入
        - entry-core.js 有接手
        - CSS runtime / header / footer 由水庫處理
        - 外部 app.js 可以回報 app-ready
      */

      loadingDone();
    } catch (error) {
      console.error("[skhps-smoke] init failed", error);
      setStatus(appTitle + " 初始化失敗。");
      loadingFail(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();