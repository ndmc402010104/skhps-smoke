/*
檔案位置：skhps-smoke/assets/js/ajax.js
時間戳記：2026-06-16 16:45 UTC+8
用途：SKHPS Smoke AJAX controller；負責載入 assets/ajax/*.html fragment。

分工：
- app.js：外部專案最小業務入口與 app-ready 回報。
- ajax_bootstrap.js：啟動本檔。
- ajax.js：唯一 AJAX controller。
- assets/ajax/*.html：只能放 AJAX 載入用 HTML fragment。
*/

(function () {
  "use strict";

  var DEFAULT_FRAGMENT = "assets/ajax/00-overview.html";

  var FRAGMENTS = [
    { id: "00-overview", title: "總覽", path: "assets/ajax/00-overview.html" },
    { id: "01-tokens", title: "Tokens", path: "assets/ajax/01-tokens.html" },
    { id: "02-typography-buttons-cards", title: "Typography / Buttons / Cards", path: "assets/ajax/02-typography-buttons-cards.html" },
    { id: "03-forms", title: "Forms", path: "assets/ajax/03-forms.html" },
    { id: "04-tables-summary", title: "Tables Summary", path: "assets/ajax/04-tables-summary.html" },
    { id: "05-swipe-table", title: "Swipe Action Table", path: "assets/ajax/05-swipe-table.html" },
    { id: "06-expand-table", title: "Expand Detail Table", path: "assets/ajax/06-expand-table.html" },
    { id: "07-feedback", title: "Feedback", path: "assets/ajax/07-feedback.html" },
    { id: "08-loading-modal", title: "Loading / Modal", path: "assets/ajax/08-loading-modal.html" },
    { id: "09-timer-media", title: "Timer / QR / Media", path: "assets/ajax/09-timer-media.html" },
    { id: "10-kanban", title: "Drag & Drop", path: "assets/ajax/10-kanban.html" },
    { id: "11-header", title: "Header", path: "assets/ajax/11-header.html" },
    { id: "12-footer", title: "Footer", path: "assets/ajax/12-footer.html" },
    { id: "13-rules", title: "Rules", path: "assets/ajax/13-rules.html" }
  ];

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getStatusEl() {
    return document.getElementById("smokeAjaxStatus") || document.querySelector("[data-app-status]");
  }

  function getContentEl() {
    return document.getElementById("smokeAjaxContent") || document.querySelector("[data-smoke-ajax-content]");
  }

  function setStatus(message) {
    var el = getStatusEl();
    if (el) {
      el.textContent = message;
    }
  }

  function setActiveButton(path) {
    document.querySelectorAll("[data-smoke-fragment]").forEach(function (button) {
      var matched = button.getAttribute("data-smoke-fragment") === path;

      button.classList.toggle("skhps-btn-primary", matched);
      button.classList.toggle("skhps-btn-secondary", !matched);
      button.classList.toggle("is-active", matched);
    });
  }

  function initLoadedFragment(path) {
    document.documentElement.setAttribute("data-skhps-smoke-fragment", path);
  }

  function loadFragment(path) {
    var contentEl = getContentEl();

    if (!contentEl) {
      return Promise.reject(new Error("smokeAjaxContent not found"));
    }

    var targetPath = path || DEFAULT_FRAGMENT;

    setStatus("載入中：" + targetPath);
    setActiveButton(targetPath);

    return fetch(targetPath, { cache: "no-store" })
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

        contentEl.innerHTML = result.text;
        setStatus("已載入：" + targetPath);
        initLoadedFragment(targetPath);

        contentEl.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        return {
          ok: true,
          path: targetPath
        };
      })
      .catch(function (error) {
        contentEl.innerHTML =
          '<section class="skhps-card skhps-smoke-error-card">' +
          '<h2 class="skhps-section-title">載入失敗</h2>' +
          '<pre class="skhps-code-block">' +
          escapeHtml(error && error.message ? error.message : error) +
          '</pre>' +
          '</section>';

        setStatus("載入失敗：" + targetPath);
        throw error;
      });
  }

  function bindControls() {
    document.querySelectorAll("[data-smoke-fragment]").forEach(function (button) {
      if (button.getAttribute("data-smoke-bound") === "true") {
        return;
      }

      button.setAttribute("data-smoke-bound", "true");
      button.addEventListener("click", function () {
        loadFragment(button.getAttribute("data-smoke-fragment"));
      });
    });
  }

  function init(options) {
    var opts = options || {};

    bindControls();
    document.documentElement.setAttribute("data-skhps-smoke-ajax-ready", "true");

    return loadFragment(opts.defaultFragment || DEFAULT_FRAGMENT);
  }

  window.SKHPSSmokeAjax = window.SKHPSSmokeAjax || {};
  window.SKHPSSmokeAjax.fragments = FRAGMENTS;
  window.SKHPSSmokeAjax.init = init;
  window.SKHPSSmokeAjax.loadFragment = loadFragment;
})();
