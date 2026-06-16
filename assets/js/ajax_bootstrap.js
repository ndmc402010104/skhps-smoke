/*
檔案位置：skhps-smoke/assets/js/ajax_bootstrap.js
時間戳記：2026-06-16 16:45 UTC+8
用途：SKHPS Smoke AJAX bootstrap；獨立啟動 assets/js/ajax.js，不把 AJAX 功能塞進 app.js。

分工：
- app.js：最小業務入口與 app-ready 回報。
- ajax_bootstrap.js：載入並啟動 ajax.js。
- ajax.js：唯一 AJAX controller。
- assets/ajax/*.html：只能放 AJAX 載入用 HTML fragment。
*/

(function () {
  "use strict";

  var AJAX_CONTROLLER_URL = "assets/js/ajax.js";

  function assetVersion() {
    return (
      window.SKHPS_ENTRY_VERSION ||
      (window.SKHPS_VERSION && window.SKHPS_VERSION.buildTime) ||
      String(Date.now())
    );
  }

  function withVersion(path) {
    return String(path || "") + "?v=" + encodeURIComponent(assetVersion());
  }

  function loadScriptOnce(path, markerAttr) {
    return new Promise(function (resolve, reject) {
      var existed = document.querySelector("script[" + markerAttr + "]");

      if (existed) {
        resolve(path);
        return;
      }

      var script = document.createElement("script");
      script.src = withVersion(path);
      script.async = false;
      script.setAttribute(markerAttr, "true");

      script.onload = function () {
        resolve(path);
      };

      script.onerror = function () {
        reject(new Error("Script load failed: " + path));
      };

      document.head.appendChild(script);
    });
  }

  function boot() {
    return loadScriptOnce(AJAX_CONTROLLER_URL, "data-skhps-smoke-ajax-controller")
      .then(function () {
        if (!window.SKHPSSmokeAjax || typeof window.SKHPSSmokeAjax.init !== "function") {
          throw new Error("SKHPSSmokeAjax.init is not available");
        }

        return window.SKHPSSmokeAjax.init();
      })
      .catch(function (error) {
        console.error("[skhps-smoke] ajax bootstrap failed", error);

        var statusEl = document.getElementById("smokeAjaxStatus") || document.querySelector("[data-app-status]");
        if (statusEl) {
          statusEl.textContent = "AJAX 初始化失敗：" + (error && error.message ? error.message : error);
        }
      });
  }

  window.SKHPSSmokeAjaxBootstrap = window.SKHPSSmokeAjaxBootstrap || {};
  window.SKHPSSmokeAjaxBootstrap.boot = boot;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
