/* ================== 基本設定 ================== */
const cid = "CL2449";
const DATE_FMT = new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" });
document.getElementById("generatedAt").textContent = DATE_FMT.format(new Date());

/* ================== 工具與共用 ================== */
const loadJSON = (p) => fetch(p).then(r => { if (!r.ok) throw new Error(p); return r.json(); });
const br = (s) => (s || "").toString().replace(/\n/g, "<br>");

const scoreBadge = (s) => {
  if (s >= 4) {
    return { txt: `${s} 分｜高潛力`, cls: "badge high" };
  } else if (s >= 3) {
    return { txt: `${s} 分｜中等`, cls: "badge medium" };
  } else if (s >= 1) {
    return { txt: `${s} 分｜待提升`, cls: "badge low" };
  } else {
    return { txt: `${s} 分`, cls: "badge" };
  }
};

/* ================== 讀取基本資料 ================== */
loadJSON(`data/${cid}_info.json`).then(data => {
  if (document.getElementById("position")) {
    document.getElementById("position").textContent = data["應徵職位"] || "—";
  }
  if (document.getElementById("interviewId")) {
    document.getElementById("interviewId").textContent = data["面試代號"] || "—";
  }
  if (document.getElementById("reportId")) {
    document.getElementById("reportId").textContent = data["面試代號"] || "—";
  }
}).catch(err => {
  console.error("無法讀取基本資料檔案:", err);
});

/* ---------- 智能長文摺疊 ---------- */
function makeCollapsible(el) {
  const html = el.innerHTML;
  const wrap = document.createElement("div");
  wrap.className = "collapsible";
  wrap.innerHTML = html;
  const t = document.createElement("span");
  t.className = "toggle";
  t.textContent = "更多▼";
  t.onclick = () => {
    wrap.classList.toggle("expanded");
    t.textContent = wrap.classList.contains("expanded") ? "收起 ▲" : "更多▼";
  };
  el.innerHTML = "";
  el.appendChild(wrap);
  el.appendChild(t);
}

function applySmartCollapsible(container) {
  const targets = container.querySelectorAll(".longtext");
  targets.forEach(el => {
    requestAnimationFrame(() => {
      const text = el.textContent.trim();
      const tooLong = text.length > 140;
      const tooTall = el.scrollHeight > 120;
      if (tooLong || tooTall) makeCollapsible(el);
    });
  });
}

/* ---------- 大區塊滑順展開 ---------- */
function openSmooth(id) { const el = document.getElementById(id); if (!el) return; el.classList.add("open"); }
function closeSmooth(id) { const el = document.getElementById(id); if (!el) return; el.classList.remove("open"); }

/* ================== PDF 匯出 ================== */
document.getElementById("exportPdfBtn").addEventListener("click", () => {
  // 功能還未串接
  console.log("匯出PDF");
});

/* ================== 聚合指標 ================== */
const averages = { completeness: null, quality: null, communication: null, overall: null, potential: null };
function setKPI(id, val) {
  const el = document.getElementById(id);
  const descEl = document.getElementById(id + "Desc");
  if (val == null) {
    el.textContent = "—";
    descEl.textContent = "—";
    return;
  }
  el.textContent = Number(val).toFixed(1);
  descEl.textContent = "—";
}

/* ================== 目標 1：回答完整性 ================== */
loadJSON(`data/${cid}_goal1.json`).then(data => {
  const c = document.getElementById("g1content");
  let total = 0, n = 0;
  Object.keys(data).forEach(key => {
    const q = data[key];
    const qValues = Object.values(q);
    const coreCompetency = qValues[0] || "-"; // "問題核心職能"
    const score = qValues[1] || 0;            // "評分"
    const summary = qValues[2];               // "摘要分析結論"
    const evidence = qValues[3];              // "證據"
    const risk = qValues[4];                  // "風險與改善建議"

    const b = scoreBadge(score); total += score; n++; // 使用索引讀取到的 score
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${key} <span class="${b.cls}" style="margin-left:8px">${b.txt}</span></h3>
      <p><span class="label">問題核心職能：</span>${coreCompetency}</p>
      <div class="bar-container"><div class="bar" style="width:${score * 20}%"></div></div>
      <p><b>摘要：</b><span class="longtext">${br(summary)}</span></p>
      <p><b>關鍵證據：</b><span class="longtext">${br(evidence)}</span></p>
      ${risk ? `<p><b>風險與改善建議：</b><span class="longtext">${br(risk)}</span></p>` : ""}
    `;
    c.appendChild(div);
    applySmartCollapsible(div);
  });
  openSmooth("g1content");
  averages.completeness = n ? Number((total / n).toFixed(2)) : null;
}).catch(console.error);

/* ================== 目標 2：內容品質 ================== */
loadJSON(`data/${cid}_goal2.json`).then(data => {
  const c = document.getElementById("g2content");
  let total = 0, n = 0;
  Object.keys(data).forEach(k => {
    const q = data[k];
    // 假設 goal2 結構同 goal1，但沒有"風險" (共 4 個鍵)
    const qValues = Object.values(q);
    const coreCompetency = qValues[0] || "-"; // "問題核心職能"
    const score = qValues[1] || 0;            // "評分"
    const summary = qValues[2];               // "摘要分析結論"
    const evidence = qValues[3];              // "關鍵證據"
    const risk = qValues[4];                  // "風險與改善建議"

    const b = scoreBadge(score); total += score; n++; // 使用索引讀取到的 score
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${k} <span class="${b.cls}" style="margin-left:8px">${b.txt}</span></h3>
      <p><span class="label">問題核心職能：</span>${coreCompetency}</p>
      <div class="bar-container"><div class="bar" style="width:${score * 20}%"></div></div>
      <p><b>摘要：</b><span class="longtext">${br(summary)}</span></p>
      <p><b>關鍵證據：</b><span class="longtext">${br(evidence)}</span></p>
      ${risk ? `<p><b>風險與改善建議：</b><span class="longtext">${br(risk)}</span></p>` : ""}`;
    c.appendChild(div);
    applySmartCollapsible(div);
  });
  openSmooth("g2content");
  averages.quality = n ? Number((total / n).toFixed(2)) : null;
}).catch(console.error);

/* ================== 目標 3：優勢/不足/追問 ================== */
loadJSON(`data/${cid}_goal3.json`).then(data => {
  // 獲取頂層的三個物件，依照JSON檔案中的順序
  const topLevelValues = Object.values(data);

  // 1. 處理 "優勢"
  const strengthContainer = document.getElementById("g3優勢");
  const strengthItems = topLevelValues[0] || {}; // 第一個物件
  Object.keys(strengthItems).forEach(k => {
    const q = strengthItems[k];
    const qValues = Object.values(q);
    const name = qValues[0] || k;      // "名稱"
    const analysis = qValues[1];       // "分析"
    const evidence = qValues[2];       // "證據"
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${name}</h3>
      <p><b>分析：</b><span class="longtext">${br(analysis)}</span></p>
      <p><b>證據：</b><span class="longtext">${br(evidence)}</span></p>`;
    if (strengthContainer) strengthContainer.appendChild(div);
    applySmartCollapsible(div);
  });
  openSmooth("g3優勢");

  // 2. 處理 "不足"
  const weaknessContainer = document.getElementById("g3不足");
  const weaknessItems = topLevelValues[1] || {}; // 第二個物件
  Object.keys(weaknessItems).forEach(k => {
    const q = weaknessItems[k];
    const qValues = Object.values(q);
    const name = qValues[0] || k;      // "名稱"
    const analysis = qValues[1];      // "分析"
    const evidence = qValues[2];      // "證據"
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${name}</h3>
      <p><b>分析：</b><span class="longtext">${br(analysis)}</span></p>
      <p><b>證據：</b><span class="longtext">${br(evidence)}</span></p>`;
    if (weaknessContainer) weaknessContainer.appendChild(div);
    applySmartCollapsible(div);
  });
  openSmooth("g3不足");

  // 3. 處理 "追問建議"
  const probeContainer = document.getElementById("g3追問建議");
  const probeItems = topLevelValues[2] || {}; // 第三個物件
  Object.keys(probeItems).forEach(k => {
    const q = probeItems[k];
    const qValues = Object.values(q);
    const questionDesign = qValues[0];          // "問題設計"
    const correspondingDeficiency = qValues[1]; // "對應缺失職能與題號"
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${k}</h3>
      <p><b>問題設計：</b><span class="longtext">${br(questionDesign)}</span></p>
      ${correspondingDeficiency ? `<p><b>對應缺失：</b>${br(correspondingDeficiency)}</p>` : ""}`;
    if (probeContainer) probeContainer.appendChild(div);
    applySmartCollapsible(div);
  });
  openSmooth("g3追問建議");

}).catch(console.error);

/* ================== 目標 4：人格 + 圖表（雷達 ================== */
loadJSON(`data/${cid}_goal4.json`).then(data => {
  const labels = Object.keys(data).filter(k => k !== "總結" && k.toLowerCase() !== "summary");

  // 根據模板順序，"評分" 是第 1 個鍵 (index 0)
  const scores = labels.map(k => Object.values(data[k])[0]);

  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  averages.potential = avg ? Number(avg.toFixed(2)) : null;

  const rctx = document.getElementById("radarChart").getContext("2d");
  new Chart(rctx, {
    type: "radar",
    data: {
      labels, datasets: [{
        label: '人格特質得分', data: scores,
        backgroundColor: "rgba(75,108,183,.18)", borderColor: "#4B6CB7", pointBackgroundColor: "#1E2A5E", borderWidth: 2
      }]
    },
    options: {
      scales: {
        r: {
          beginAtZero: true, min: 0, max: 5, ticks: { stepSize: 1 }, angleLines: { color: "#d9e1ef" }, grid: { color: "#d9e1ef" },
          pointLabels: { color: "#1E2A5E", font: { size: 12, weight: "600" } }
        }
      }, plugins: { legend: { labels: { color: "#2b2b2b" } } }
    }
  });

  const g4c = document.getElementById("g4traits");
  g4c.innerHTML = '';

  labels.forEach(traitName => {
    const traitData = data[traitName];
    if (!traitData) return;

    const traitValues = Object.values(traitData);
    const score = traitValues[0] || 0;        // "評分"
    const meaning = traitValues[1];           // "核心涵義"
    const observation = traitValues[2];       // "行為觀察"
    const impact = traitValues[3];            // "職位影響與風險"
    const evidence = traitValues[4];          // "證據"

    const b = scoreBadge(score);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${traitName} <span class="${b.cls}" style="margin-left:8px">${b.txt}</span></h3>
      <div class="bar-container"><div class="bar" style="width:${score * 20}%"></div></div>
      <p><b>核心涵義：</b><span class="longtext">${br(meaning)}</span></p>
      <p><b>行為觀察：</b><span class="longtext">${br(observation)}</span></p>
      <p><b>職位影響與風險：</b><span class="longtext">${br(impact)}</span></p>
      <p><b>證據：</b><span class="longtext">${br(evidence)}</span></p>
    `;
    g4c.appendChild(card);
    applySmartCollapsible(card);
  });

  openSmooth("g4traits");

  if (data["總結"]) {
    const g4Section = document.getElementById('g4');
    if (!g4Section.querySelector('.insight')) {
      const insightDiv = document.createElement('blockquote');
      insightDiv.className = 'insight';
      insightDiv.innerHTML = `<b>總結：</b>${br(data["總結"])}`;
      g4Section.appendChild(insightDiv);
    }
  }
}).catch(console.error);

/* ================== 目標 5：溝通技巧 ================== */
loadJSON(`data/${cid}_goal5.json`).then(data => {

  const dataValues = Object.values(data);
  const score = dataValues[0] ?? null;      // 第 1 個鍵："g5評分"
  const meaning = dataValues[1];            // 第 2 個鍵："g5核心涵義"
  const observation = dataValues[2];        // 第 3 個鍵："g5行為觀察"
  const impact = dataValues[3];             // 第 4 個鍵："g5職位影響與風險"
  const evidence = dataValues[4];           // 第 5 個鍵："g5證據"

  document.getElementById("g5評分").textContent = score ?? "-";
  document.getElementById("g5核心涵義").innerHTML = br(meaning);
  document.getElementById("g5行為觀察").innerHTML = br(observation);
  document.getElementById("g5職位影響與風險").innerHTML = br(impact);
  document.getElementById("g5證據").innerHTML = br(evidence);
  applySmartCollapsible(document.getElementById("g5"));
  averages.communication = score;
}).catch(console.error);

/* ================== 目標 6：整體適任性 ================== */
let matchForKPI = null;
loadJSON(`data/${cid}_goal6.json`).then(data => {
  const c = document.getElementById("g6content");

  const dataValues = Object.values(data);
  const dataKeys = Object.keys(data); // 我們仍然需要鍵名作為標題

  // 第1個鍵: 整體適任性分數
  averages.overall = dataValues[0] ?? null;

  // 第2個鍵: 職能適配性 (物件)
  const fitData = dataValues[1];
  const fitTitle = dataKeys[1]; // "職能適配性"

  // 第3個鍵: 應對策略 (物件)
  const strategyData = dataValues[2];
  const strategyTitle = dataKeys[2]; // "應對策略"

  // 第4個鍵: 語意邏輯性 (物件)
  const logicData = dataValues[3];
  const logicTitle = dataKeys[3]; // "語意邏輯性"

  // 第5個鍵: 風險與發展建議 (物件)
  const riskAndDev = dataValues[4];
  const riskAndDevTitle = dataKeys[4]; // "風險與發展建議"
  const riskAndDevValues = riskAndDev ? Object.values(riskAndDev) : [];
  const riskAndDevKeys = riskAndDev ? Object.keys(riskAndDev) : [];

  // 第5-1鍵: 錄用風險 (物件)
  const risk = riskAndDevValues[0];
  const riskTitle = riskAndDevKeys[0]; // "錄用風險"

  // 第5-2鍵: 發展建議 (物件)
  const dev = riskAndDevValues[1];
  const devTitle = riskAndDevKeys[1]; // "發展建議" (sub-header)
  const devValues = dev ? Object.values(dev) : [];
  const devKeys = dev ? Object.keys(dev) : [];

  // 第5-2-1鍵: O (值)
  const devO = devValues[0];
  const devOTitle = devKeys[0]; // "O"

  // 第5-2-2鍵: KR (物件)
  const devKR = devValues[1];
  const devKRTitle = devKeys[1]; // "KR"

  // 第6個鍵: 錄用決策建議 (物件)
  const decision = dataValues[5];
  const decisionTitle = dataKeys[5]; // "錄用決策建議"
  const decisionValues = decision ? Object.values(decision) : [];
  const decisionKeys = decision ? Object.keys(decision) : [];

  // 第6-1鍵: 建議類型 (值)
  const recType = decisionValues[0];
  const recTypeTitle = decisionKeys[0]; // "建議類型"

  // 第6-2鍵: 推薦理由 (物件)
  const recReason = decisionValues[1];
  const recReasonTitle = decisionKeys[1]; // "推薦理由"

  // 第6-3鍵: 追加面試問題 (物件)
  const recFollowUp = decisionValues[2];
  const recFollowUpTitle = decisionKeys[2]; // "追加面試問題"


  let html = `<div class="card"><h3>${dataKeys[0] || '整體適任性'}</h3>`;
  if (averages.overall != null) {
    const b = scoreBadge(averages.overall);
    html += `<p><b>分數：</b><span class="${b.cls}">${b.txt}</span></p>`;
  }

  // 循環遍歷第 2, 3, 4 個鍵對應的物件
  [
    { title: fitTitle, data: fitData },
    { title: strategyTitle, data: strategyData },
    { title: logicTitle, data: logicData }
  ].forEach(sec => {
    if (!sec.data) return;
    html += `<h3>${sec.title}</h3>`; // 使用從 dataKeys 獲取到的標題
    // 內部的"遞迴讀取" (Object.entries) 保持不變，因為需要 k, v 作為標籤
    Object.entries(sec.data).forEach(([k, v]) => {
      html += `<p><b>${k}：</b><span class="longtext">${br(v)}</span></p>`;
    });
  });

  if (riskAndDev) {
    html += `<h3>${riskAndDevTitle}</h3>`;
    if (risk) { html += `<p><b>${riskTitle}：</b></p>`; Object.keys(risk).forEach(k => html += `<p>・${k}：${risk[k]}</p>`); }
    if (devO || devKR) {
      html += `<p><b>${devTitle} (OKR)：</b></p>`;
      if (devO) html += `<p>${devOTitle}：${devO}</p>`;
      if (devKR) {
        html += `<p><b>${devKRTitle}：</b></p>`;
        Object.keys(devKR).forEach(k => html += `<p>${k}：${devKR[k]}</p>`);
      }
    }
  }

  if (decision) {
    html += `<h3>${decisionTitle}</h3>`;
    if (recType) html += `<p><b>${recTypeTitle}：</b>${recType}</p>`;
    if (recReason) {
      html += `<p><b>${recReasonTitle}：</b></p>`;
      Object.keys(recReason).forEach(k => html += `<p>・${k}：${recReason[k]}</p>`);
    }
    if (recFollowUp) {
      html += `<p><b>${recFollowUpTitle}：</b></p>`;
      Object.keys(recFollowUp).forEach(k => html += `<p>・${k}：${recFollowUp[k]}</p>`);
    }
  }

  html += `</div>`;
  c.innerHTML = html;
  applySmartCollapsible(c);
  openSmooth("g6content");

  const fitObj = dataValues[1] || {};
  matchForKPI = Math.min(5, Math.max(1, Object.keys(fitObj).length ? 3.8 : 3.0));
}).catch(console.error);

/* ================== 儀表板 ================== */
Promise.allSettled([
  loadJSON(`data/${cid}_goal1.json`),
  loadJSON(`data/${cid}_goal2.json`),
  loadJSON(`data/${cid}_goal4.json`),
  loadJSON(`data/${cid}_goal5.json`),
  loadJSON(`data/${cid}_goal6.json`)
]).then(([p1, p2, p4, p5, p6]) => {
  const avgFromObj = (obj) => { const vals = Object.values(obj || {}).map(x => x["評分"]).filter(x => typeof x === "number"); return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; };
  if (averages.completeness == null && p1.status === "fulfilled") { const v = avgFromObj(p1.value); averages.completeness = v ? Number(v.toFixed(2)) : null; }
  if (averages.quality == null && p2.status === "fulfilled") { const v = avgFromObj(p2.value); averages.quality = v ? Number(v.toFixed(2)) : null; }
  if (averages.potential == null && p4.status === "fulfilled") { const v = avgFromObj(p4.value); averages.potential = v ? Number(v.toFixed(2)) : null; }
  if (averages.communication == null && p5.status === "fulfilled") { const v = p5.value["評分"]; averages.communication = typeof v === "number" ? v : null; }
  if (averages.overall == null && p6.status === "fulfilled") { const v = p6.value["整體適任性分數"]; averages.overall = typeof v === "number" ? v : null; }

  setKPI("kpiOverall", averages.overall);
  setKPI("kpiComm", averages.communication);
  const match = (() => {
    const nums = [averages.overall, averages.quality, averages.completeness].filter(x => typeof x === "number");
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : (matchForKPI ?? 3.5);
  })();
  setKPI("kpiMatch", match);

  const bctx = document.getElementById("barChart").getContext("2d");
  new Chart(bctx, {
    type: "bar",
    data: {
      labels: ["整體適任性", "內容品質", "回答完整性", "溝通與邏輯性", "潛能（特質）"],
      datasets: [{
        label: "Score (1~5)", data: [
          averages.overall ?? null, averages.quality ?? null, averages.completeness ?? null, averages.communication ?? null, averages.potential ?? null
        ], backgroundColor: "rgba(75,108,183,.65)", borderColor: "#4B6CB7", borderWidth: 1
      }]
    },
    options: {
      scales: { y: { beginAtZero: true, min: 0, max: 5, ticks: { stepSize: 1 }, grid: { color: "#e5e7eb" } }, x: { grid: { display: false } } },
      plugins: { legend: { display: false } }
    }
  });

}).catch(console.error);

/* ================== 進場觀察（提升體感） ================== */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

window.addEventListener("load", () => {
  ["g1content", "g2content", "g3優勢", "g3不足", "g3追問建議", "g4traits", "g6content"].forEach(openSmooth);
});