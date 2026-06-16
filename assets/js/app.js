/*
檔案位置：skhps-smoke/assets/js/app.js
時間戳記：2026-06-16 17:30 UTC+8
用途：SKHPS Smoke 專案 bootstrap；初始化 Theme40 fragment playground，最後只回報 smoke-app，不接管水庫 runtime。

分工：
- skhpsv2：共通 entry / loading gate / CSS runtime / header / footer / diagnostics。
- app.json：Smoke 公文，宣告 fragments / afterScripts / loadingTasks。
- ajax.js：fragment loader 工具。
- app.js：Smoke 自己的 bootstrap。
*/

(function () {
  "use strict";

  var READY_TASK = "smoke-app";

  var FALLBACK_FRAGMENTS = [
  {
    "id": "00-overview",
    "title": "總覽",
    "label": "總覽",
    "src": "assets/ajax/00-overview.html",
    "default": true
  },
  {
    "id": "01-tokens",
    "title": "Tokens",
    "label": "Tokens",
    "src": "assets/ajax/01-tokens.html"
  },
  {
    "id": "02-typography-buttons-cards",
    "title": "Typography / Buttons / Cards",
    "label": "Typography / Buttons / Cards",
    "src": "assets/ajax/02-typography-buttons-cards.html"
  },
  {
    "id": "03-forms",
    "title": "Forms",
    "label": "Forms",
    "src": "assets/ajax/03-forms.html"
  },
  {
    "id": "04-tables-summary",
    "title": "Tables Summary",
    "label": "Tables Summary",
    "src": "assets/ajax/04-tables-summary.html"
  },
  {
    "id": "05-swipe-table",
    "title": "Swipe Action Table",
    "label": "Swipe Action Table",
    "src": "assets/ajax/05-swipe-table.html"
  },
  {
    "id": "06-expand-table",
    "title": "Expand Detail Table",
    "label": "Expand Detail Table",
    "src": "assets/ajax/06-expand-table.html"
  },
  {
    "id": "07-feedback",
    "title": "Feedback",
    "label": "Feedback",
    "src": "assets/ajax/07-feedback.html"
  },
  {
    "id": "08-loading-modal",
    "title": "Loading / Modal",
    "label": "Loading / Modal",
    "src": "assets/ajax/08-loading-modal.html"
  },
  {
    "id": "09-timer-media",
    "title": "Timer / QR / Media",
    "label": "Timer / QR / Media",
    "src": "assets/ajax/09-timer-media.html"
  },
  {
    "id": "10-kanban",
    "title": "Drag & Drop",
    "label": "Drag & Drop",
    "src": "assets/ajax/10-kanban.html"
  },
  {
    "id": "11-header",
    "title": "Header",
    "label": "Header",
    "src": "assets/ajax/11-header.html"
  },
  {
    "id": "12-footer",
    "title": "Footer",
    "label": "Footer",
    "src": "assets/ajax/12-footer.html"
  },
  {
    "id": "13-rules",
    "title": "Rules",
    "label": "Rules",
    "src": "assets/ajax/13-rules.html"
  }
];

  function getManifest() {
    return (
      window.SKHPS_APP_MANIFEST ||
      window.SKHPS_APP_CONFIG ||
      window.SKHPS_APP_CARD ||
      window.SKHPSExternalAppManifest ||
      window.SKHPS_EXTERNAL_APP_MANIFEST ||
      {}
    );
  }

  function getFragments() {
    var manifest = getManifest();
    var list = manifest.fragments;

    if (Array.isArray(list) && list.length) {
      return list.map(function (item) {
        return {
          id: item.id || item.key || item.name || item.src || item.path,
          title: item.title || item.label || item.name || item.id || item.src || item.path,
          label: item.label || item.title || item.name || item.id || item.src || item.path,
          src: item.src || item.path || item.href,
          path: item.path || item.src || item.href,
          default: !!item.default
        };
      }).filter(function (item) {
        return !!(item.src || item.path);
      });
    }

    return FALLBACK_FRAGMENTS.slice();
  }

  function getAppTitle() {
    var manifest = getManifest();
    var html = document.documentElement;

    return (
      manifest.title ||
      manifest.name ||
      html.getAttribute("data-loading-title") ||
      html.getAttribute("data-skhps-page-map-current") ||
      document.title ||
      "SKHPS Smoke"
    );
  }

  function getStatusEl() {
    return document.getElementById("smokeAjaxStatus") || document.querySelector("[data-app-status]");
  }

  function getContentEl() {
    return document.getElementById("smokeAjaxContent") || document.querySelector("[data-smoke-ajax-content]");
  }

  function getTabsEl() {
    return document.querySelector("[data-smoke-tabs]") || document.querySelector(".skhps-smoke-toolbar");
  }

  function setStatus(text) {
    var el = getStatusEl();
    if (el) {
      el.textContent = text;
    }
  }

  function getFragmentSrc(item) {
    return item && (item.src || item.path || item.href);
  }

  function setActiveButton(src) {
    document.querySelectorAll("[data-smoke-fragment]").forEach(function (button) {
      var matched = button.getAttribute("data-smoke-fragment") === src;

      button.classList.toggle("skhps-btn-primary", matched);
      button.classList.toggle("skhps-btn-secondary", !matched);
      button.classList.toggle("is-active", matched);
      button.setAttribute("aria-current", matched ? "page" : "false");
    });
  }

  function ensureTabs(fragments) {
    var tabsEl = getTabsEl();

    if (!tabsEl) {
      return;
    }

    /*
      若 index.html 已經有靜態 button，就只補綁定。
      若未來改成空容器，app.js 會依 app.json fragments 產生 button。
    */
    if (!tabsEl.querySelector("[data-smoke-fragment]")) {
      tabsEl.innerHTML = "";

      fragments.forEach(function (item) {
        var src = getFragmentSrc(item);
        var button = document.createElement("button");

        button.type = "button";
        button.className = "skhps-btn skhps-btn-secondary";
        button.setAttribute("data-smoke-fragment", src);
        button.textContent = item.label || item.title || item.id || src;

        tabsEl.appendChild(button);
      });
    }
  }

  function loadFragment(itemOrSrc) {
    var src = typeof itemOrSrc === "string" ? itemOrSrc : getFragmentSrc(itemOrSrc);
    var contentEl = getContentEl();

    if (!src) {
      return Promise.reject(new Error("Smoke fragment src missing"));
    }

    if (!contentEl) {
      return Promise.reject(new Error("smokeAjaxContent not found"));
    }

    if (!window.SKHPSSmokeAjax || typeof window.SKHPSSmokeAjax.loadFragment !== "function") {
      return Promise.reject(new Error("SKHPSSmokeAjax.loadFragment is not available"));
    }

    setStatus("載入中：" + src);
    setActiveButton(src);

    return window.SKHPSSmokeAjax.loadFragment(src, contentEl)
      .then(function (result) {
        setStatus("已載入：" + src);
        return result;
      })
      .catch(function (error) {
        setStatus("載入失敗：" + src);
        throw error;
      });
  }

  function bindTabs() {
    document.querySelectorAll("[data-smoke-fragment]").forEach(function (button) {
      if (button.getAttribute("data-smoke-bound") === "true") {
        return;
      }

      button.setAttribute("data-smoke-bound", "true");
      button.addEventListener("click", function () {
        loadFragment(button.getAttribute("data-smoke-fragment")).catch(function (error) {
          console.error("[skhps-smoke] fragment load failed", error);
        });
      });
    });
  }

  function reportDone() {
    document.documentElement.setAttribute("data-skhps-page-ready", "true");
    document.documentElement.setAttribute("data-skhps-app-ready", "true");
    document.documentElement.setAttribute("data-skhps-smoke-ready", "true");

    if (window.SKHPSLoading && typeof window.SKHPSLoading.done === "function") {
      window.SKHPSLoading.done(READY_TASK);
      return;
    }

    /*
      只有 standalone / 水庫未載入時才做 fallback。
      正常水庫流程不由 app.js release all-ready。
    */
    document.documentElement.classList.remove("skhps-loading");
    document.documentElement.classList.remove("skhps-main-loading");
  }

  function reportFail(error) {
    document.documentElement.setAttribute("data-skhps-page-ready", "false");
    document.documentElement.setAttribute("data-skhps-app-ready", "false");
    document.documentElement.setAttribute("data-skhps-smoke-ready", "false");

    if (window.SKHPSLoading && typeof window.SKHPSLoading.fail === "function") {
      window.SKHPSLoading.fail(READY_TASK, error);
      return;
    }

    document.documentElement.classList.remove("skhps-loading");
    document.documentElement.classList.remove("skhps-main-loading");
  }

  function boot() {
    var appTitle = getAppTitle();
    var fragments = getFragments();
    var defaultFragment =
      fragments.find(function (item) { return item.default; }) ||
      fragments[0];

    console.log("[skhps-smoke] app bootstrap", {
      title: appTitle,
      fragments: fragments.length,
      hasSmokeAjax: !!(window.SKHPSSmokeAjax && window.SKHPSSmokeAjax.loadFragment),
      hasLoadingGate: !!(window.SKHPSLoading && window.SKHPSLoading.done),
      manifest: getManifest()
    });

    setStatus(appTitle + " 啟動中。");

    ensureTabs(fragments);
    bindTabs();

    if (!defaultFragment) {
      setStatus(appTitle + " 已初始化；沒有 fragments。");
      reportDone();
      return;
    }

    loadFragment(defaultFragment)
      .catch(function (error) {
        console.error("[skhps-smoke] default fragment failed", error);
      })
      .finally(function () {
        /*
          Smoke 的目的不是因為某個 demo fragment 404 就卡死整個水庫。
          fragment 載入失敗會顯示在內容區，但 smoke-app 仍回報完成。
        */
        reportDone();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
