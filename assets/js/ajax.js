/*
檔案位置：skhps-smoke/assets/js/ajax.js
時間戳記：2026-06-16 17:30 UTC+8
用途：SKHPS Smoke fragment loader 工具；只負責載入 assets/ajax/*.html fragment，不自行 boot、不回報 loading gate。

分工：
- app.json：宣告 fragments / afterScripts / loadingTasks。
- app.js：Smoke 專案唯一 bootstrap，建立 tab、綁定事件、呼叫本工具、回報 smoke-app。
- ajax.js：只提供 SKHPSSmokeAjax.loadFragment() 工具。
- assets/ajax/*.html：只放 AJAX 載入用 HTML fragment。
*/

(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeTarget(target) {
    if (!target) {
      return null;
    }

    if (typeof target === "string") {
      return document.querySelector(target);
    }

    return target;
  }

  function setLoading(targetEl, src) {
    targetEl.innerHTML =
      '<section class="skhps-card skhps-smoke-loading-card">' +
      '<p class="skhps-page-subtitle">載入中：' +
      escapeHtml(src) +
      '</p>' +
      '</section>';
  }

  function setError(targetEl, src, error) {
    targetEl.innerHTML =
      '<section class="skhps-card skhps-smoke-error-card">' +
      '<h2 class="skhps-section-title">Fragment 載入失敗</h2>' +
      '<p class="skhps-page-subtitle">' + escapeHtml(src) + '</p>' +
      '<pre class="skhps-code-block">' +
      escapeHtml(error && error.message ? error.message : error) +
      '</pre>' +
      '</section>';
  }

  function loadFragment(src, target, options) {
    var targetEl = normalizeTarget(target);
    var opts = options || {};
    var path = String(src || "").trim();

    if (!path) {
      return Promise.reject(new Error("SKHPSSmokeAjax.loadFragment missing src"));
    }

    if (!targetEl) {
      return Promise.reject(new Error("SKHPSSmokeAjax.loadFragment missing target"));
    }

    if (opts.showLoading !== false) {
      setLoading(targetEl, path);
    }

    return fetch(path, { cache: opts.cache || "no-store" })
      .then(function (res) {
        return res.text().then(function (text) {
          return {
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            text: text
          };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          throw new Error("HTTP " + result.status + " " + result.statusText);
        }

        targetEl.innerHTML = result.text;
        document.documentElement.setAttribute("data-skhps-smoke-fragment", path);

        return {
          ok: true,
          src: path,
          html: result.text
        };
      })
      .catch(function (error) {
        setError(targetEl, path, error);
        throw error;
      });
  }

  window.SKHPSSmokeAjax = {
    loadFragment: loadFragment,
    escapeHtml: escapeHtml
  };
})();
