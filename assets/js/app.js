
(function(){
  "use strict";
  var TOPICS = [
  {
    "id": "00-overview",
    "title": "總覽",
    "subtitle": "UI 設計不是裝飾，是工作流程的空間安排",
    "src": "assets/ajax/00-overview.html"
  },
  {
    "id": "01-layout",
    "title": "版面配置",
    "subtitle": "頁型、容器寬度與資訊階層",
    "src": "assets/ajax/01-layout.html"
  },
  {
    "id": "02-header",
    "title": "Header",
    "subtitle": "頁首不是控制台，是方向感與身份識別",
    "src": "assets/ajax/02-header.html"
  },
  {
    "id": "03-footer",
    "title": "Footer",
    "subtitle": "頁尾與 runtime 狀態：低調但可信",
    "src": "assets/ajax/03-footer.html"
  },
  {
    "id": "04-table",
    "title": "Table 應用",
    "subtitle": "表格不是 Excel：管理清單、報表與 detail 分層",
    "src": "assets/ajax/04-table.html"
  },
  {
    "id": "05-buttons",
    "title": "按鈕樣式",
    "subtitle": "按鈕不是顏色集合，是動作層級",
    "src": "assets/ajax/05-buttons.html"
  },
  {
    "id": "06-forms",
    "title": "表單設計",
    "subtitle": "表單的節奏、錯誤提示與填寫心理",
    "src": "assets/ajax/06-forms.html"
  },
  {
    "id": "07-cards",
    "title": "卡片與區塊",
    "subtitle": "卡片是分組，不是到處包框",
    "src": "assets/ajax/07-cards.html"
  },
  {
    "id": "08-density",
    "title": "資訊密度",
    "subtitle": "一眼望穿：主資訊、次資訊與藏起來的資訊",
    "src": "assets/ajax/08-density.html"
  },
  {
    "id": "09-mobile",
    "title": "手機操作",
    "subtitle": "手機不是縮小桌機，而是重排任務",
    "src": "assets/ajax/09-mobile.html"
  },
  {
    "id": "10-motion",
    "title": "動效與回饋",
    "subtitle": "動畫要幫助理解，不是表演",
    "src": "assets/ajax/10-motion.html"
  },
  {
    "id": "11-color",
    "title": "色彩與狀態",
    "subtitle": "低彩度系統裡，顏色要拿來表達狀態",
    "src": "assets/ajax/11-color.html"
  },
  {
    "id": "12-accessibility",
    "title": "可讀性與可用性",
    "subtitle": "看得懂、點得到、知道發生什麼事",
    "src": "assets/ajax/12-accessibility.html"
  },
  {
    "id": "13-skhps-rules",
    "title": "SKHPS 規範草案",
    "subtitle": "把上面全部收斂成可執行規則",
    "src": "assets/ajax/13-skhps-rules.html"
  }
];

  function $(sel){ return document.querySelector(sel); }
  function $all(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function setStatus(text){
    var el = $("#smokeStatus");
    if (el) el.textContent = text;
  }

  function findTopic(id){
    return TOPICS.find(function(t){ return t.id === id; }) || TOPICS[0];
  }

  function renderNav(){
    var nav = $("#topicNav");
    if (!nav) return;
    nav.innerHTML = TOPICS.map(function(t, idx){
      var num = String(idx).padStart(2, "0");
      return '<button class="sk-topic-btn" type="button" data-topic-id="' + t.id + '">' +
        '<span class="sk-topic-num">' + num + '</span>' +
        '<span>' + t.title + '</span>' +
      '</button>';
    }).join("");
    nav.addEventListener("click", function(e){
      var btn = e.target.closest("[data-topic-id]");
      if (!btn) return;
      loadTopic(btn.getAttribute("data-topic-id"), true);
    });
  }

  function setActive(id){
    $all("[data-topic-id]").forEach(function(btn){
      btn.classList.toggle("is-active", btn.getAttribute("data-topic-id") === id);
    });
  }

  function updateHero(topic){
    var title = $("#heroTitle");
    var sub = $("#heroSub");
    if (title) title.textContent = topic.title;
    if (sub) sub.textContent = topic.subtitle;
  }

  function loadTopic(id, push){
    var topic = findTopic(id);
    var content = $("#articleContent");
    if (!content) return;
    setActive(topic.id);
    updateHero(topic);
    setStatus("載入中：" + topic.title);
    content.innerHTML = '<div class="sk-loading">載入文章中…</div>';

    fetch(topic.src + "?v=" + encodeURIComponent(Date.now()), { cache:"no-store" })
      .then(function(res){
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function(html){
        content.innerHTML = html;
        setStatus("目前閱讀：" + topic.title);
        if (push) {
          history.replaceState(null, "", "#" + topic.id);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch(function(err){
        content.innerHTML = '<div class="sk-callout danger"><strong>文章載入失敗</strong><br>' + 
          String(err && err.message ? err.message : err) + '</div>';
        setStatus("載入失敗：" + topic.title);
      });
  }

  function init(){
    renderNav();
    var initial = location.hash ? location.hash.replace(/^#/, "") : TOPICS[0].id;
    loadTopic(initial, false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
