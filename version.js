/*
檔案位置：skhps-smoke/version.js
時間戳記：2026-06-16 17:30 UTC+8
用途：SKHPS Smoke 外部專案版本宣告。
*/
(function () {
  "use strict";

  var versionInfo = {
    appId: "skhps-smoke",
    version: "v0.3.2-202606210144",
    major: 0,
    minor: 3,
    patch: 2,
    buildTime: "202606210144",
    updatedAt: "2026-06-21T01:44:07+08:00",
    source: "version.js"
  };

  /*
    SKHPS_VERSION：保留既有外部專案版本變數。
    SKHPS_APP_VERSION：提供 app.json manifest 新標準別名。
  */
  window.SKHPS_VERSION = versionInfo;
  window.SKHPS_APP_VERSION = versionInfo;
})();



