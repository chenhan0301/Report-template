/* ================== 基本設定 ================== */
const cid = "CL2449";
const DATE_FMT = new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" });
document.getElementById("generatedAt").textContent = DATE_FMT.format(new Date());

/* ================== 工具與共用 ================== */
const loadJSON = (p) => fetch(p).then(r => { if (!r.ok) throw new Error(p); return r.json(); });
const br = (s) => (s || "").toString().replace(/\n/g, "<br>");

const scoreBadge = (s) => {
  if (s >= 4) {
    return {txt: `${s} 分｜高潛力`, cls: "badge high"};
  } else if (s >= 3) {
    return {txt: `${s} 分｜中等`, cls: "badge medium"};
  } else if (s >= 1) {
    return {txt: `${s} 分｜待提升`, cls: "badge low"};
  } else {
    return {txt: `${s} 分`, cls: "badge"};
  }
};

/* ================== 讀取基本資料 ================== */
loadJSON(`data/CL2449_info.json`).then(data => {
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
function openSmooth(id){ const el=document.getElementById(id); if(!el) return; el.classList.add("open"); }
function closeSmooth(id){ const el=document.getElementById(id); if(!el) return; el.classList.remove("open"); }

/* ================== PDF 匯出 ================== */
document.getElementById("exportPdfBtn").addEventListener("click", () => {
  // 功能已移除
  console.log("匯出PDF");
});

/* ================== 聚合指標 ================== */
const averages = { completeness:null, quality:null, communication:null, overall:null, potential:null };
function setKPI(id, val){
  const el = document.getElementById(id);
  const descEl = document.getElementById(id+"Desc");
  if(val==null){
    el.textContent="—";
    descEl.textContent = "—";
    return;
  }
  el.textContent = Number(val).toFixed(1);
  descEl.textContent = "—";
}

/* ================== 目標 1：回答完整性 ================== */
loadJSON(`data/${cid}_goal1.json`).then(data=>{
  const c = document.getElementById("g1content");
  let total=0,n=0;
  Object.keys(data).forEach(key=>{
    const q=data[key]; const b=scoreBadge(q["評分"]); total+=(q["評分"]||0); n++;
    const div=document.createElement("div");
    div.className="card";
    div.innerHTML = `
      <h3>${key} <span class="${b.cls}" style="margin-left:8px">${b.txt}</span></h3>
      <p><span class="label">核心職能：</span>${q["問題核心職能"]||"-"}</p>
      <div class="bar-container"><div class="bar" style="width:${(q["評分"]||0)*20}%"></div></div>
      <p><b>摘要：</b><span class="longtext">${br(q["摘要分析結論"])}</span></p>
      <p><b>關鍵證據：</b><span class="longtext">${br(q["關鍵證據"])}</span></p>
      ${q["風險提示與改進建議"]?`<p><b>風險與建議：</b><span class="longtext">${br(q["風險提示與改進建議"])}</span></p>`:""}
    `;
    c.appendChild(div);
    applySmartCollapsible(div);
  });
  openSmooth("g1content");
  averages.completeness = n? Number((total/n).toFixed(2)) : null;
}).catch(console.error);

/* ================== 目標 2：內容品質 ================== */
loadJSON(`data/${cid}_goal2.json`).then(data=>{
  const c=document.getElementById("g2content");
  let total=0,n=0;
  Object.keys(data).forEach(k=>{
    const q=data[k]; const b=scoreBadge(q["評分"]); total+=(q["評分"]||0); n++;
    const div=document.createElement("div");
    div.className="card";
    div.innerHTML=`
      <h3>${k} <span class="${b.cls}" style="margin-left:8px">${b.txt}</span></h3>
      <p><span class="label">核心職能：</span>${q["問題核心職能"]||"-"}</p>
      <div class="bar-container"><div class="bar" style="width:${(q["評分"]||0)*20}%"></div></div>
      <p><b>摘要：</b><span class="longtext">${br(q["摘要分析結論"])}</span></p>
      <p><b>關鍵證據：</b><span class="longtext">${br(q["關鍵證據"])}</span></p>`;
    c.appendChild(div);
    applySmartCollapsible(div);
  });
  openSmooth("g2content");
  averages.quality = n? Number((total/n).toFixed(2)) : null;
}).catch(console.error);

/* ================== 目標 3：優勢/不足/追問 ================== */
loadJSON(`data/${cid}_goal3.json`).then(data=>{
  ["優勢","不足"].forEach(type=>{
    const c=document.getElementById("g3"+type);
    const items=data[type]||{};
    Object.keys(items).forEach(k=>{
      const q=items[k];
      const div=document.createElement("div");
      div.className="card";
      div.innerHTML=`
        <h3>${q["名稱"]||k}</h3>
        <p><b>分析：</b><span class="longtext">${br(q["分析"])}</span></p>
        <p><b>證據：</b><span class="longtext">${br(q["證據"])}</span></p>`;
      c.appendChild(div);
      applySmartCollapsible(div);
    });
    openSmooth("g3"+type);
  });
  const sug=data["追問建議"]||{}; const sc=document.getElementById("g3追問建議");
  Object.keys(sug).forEach(k=>{
    const q=sug[k];
    const div=document.createElement("div");
    div.className="card";
    div.innerHTML=`
      <h3>${k}</h3>
      <p><b>問題設計：</b><span class="longtext">${br(q["問題設計"])}</span></p>
      ${q["對應缺失職能與題號"]?`<p><b>對應缺失：</b>${br(q["對應缺失職能與題號"])}</p>`:""}`;
    sc.appendChild(div);
    applySmartCollapsible(div);
  });
  openSmooth("g3追問建議");
}).catch(console.error);

/* ================== 目標 4：人格 + 圖表（雷達） ================== */
loadJSON(`data/${cid}_goal4.json`).then(data=>{
  const labels = Object.keys(data).filter(k => k !== "總結" && k.toLowerCase() !== "summary");
  const scores = labels.map(k => data[k]["評分"]);
  const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : null;
  averages.potential = avg ? Number(avg.toFixed(2)) : null;

  const rctx = document.getElementById("radarChart").getContext("2d");
  new Chart(rctx,{
    type:"radar",
    data:{labels,datasets:[{label:'人格特質得分',data:scores,
      backgroundColor:"rgba(75,108,183,.18)",borderColor:"#4B6CB7",pointBackgroundColor:"#1E2A5E",borderWidth:2}]},
    options:{scales:{r:{beginAtZero:true,min:0,max:5,ticks:{stepSize:1},angleLines:{color:"#d9e1ef"},grid:{color:"#d9e1ef"},
      pointLabels:{color:"#1E2A5E",font:{size:12,weight:"600"}}}},plugins:{legend:{labels:{color:"#2b2b2b"}}}}
  });

  const g4c = document.getElementById("g4traits");
  g4c.innerHTML = '';

  labels.forEach(traitName => {
    const traitData = data[traitName];
    if (!traitData) return;
    const b = scoreBadge(traitData["評分"]);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${traitName} <span class="${b.cls}" style="margin-left:8px">${b.txt}</span></h3>
      <div class="bar-container"><div class="bar" style="width:${(traitData["評分"] || 0) * 20}%"></div></div>
      <p><b>核心涵義：</b><span class="longtext">${br(traitData["核心涵義"])}</span></p>
      <p><b>行為觀察：</b><span class="longtext">${br(traitData["行為觀察"])}</span></p>
      <p><b>職位影響與風險：</b><span class="longtext">${br(traitData["職位影響與風險"])}</span></p>
      <p><b>證據：</b><span class="longtext">${br(traitData["證據"])}</span></p>
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
loadJSON(`data/${cid}_goal5.json`).then(data=>{
  document.getElementById("g5評分").textContent = data["評分"] ?? "-";
  document.getElementById("g5核心涵義").innerHTML = br(data["核心涵義"]);
  document.getElementById("g5行為觀察").innerHTML = br(data["行為觀察"]);
  document.getElementById("g5職位影響與風險").innerHTML = br(data["職位影響與風險"]);
  document.getElementById("g5證據").innerHTML = br(data["證據"]);
  applySmartCollapsible(document.getElementById("g5"));
  averages.communication = data["評分"] ?? null;
}).catch(console.error);

/* ================== 目標 6：整體適任性 ================== */
let matchForKPI=null;
loadJSON(`data/${cid}_goal6.json`).then(data=>{
  const c=document.getElementById("g6content");
  averages.overall = data["整體適任性分數"] ?? null;

  let html=`<div class="card"><h3>整體適任性</h3>`;
  if(averages.overall!=null){
    const b=scoreBadge(averages.overall);
    html+=`<p><b>分數：</b><span class="${b.cls}">${b.txt}</span></p>`;
  }
  ["職能適配性","應對策略","語意邏輯性"].forEach(sec=>{
    if(!data[sec]) return;
    html+=`<h3>${sec}</h3>`;
    Object.entries(data[sec]).forEach(([k,v])=>{
      html+=`<p><b>${k}：</b><span class="longtext">${br(v)}</span></p>`;
    });
  });

  if(data["風險與發展建議"]){
    const risk=data["風險與發展建議"]["錄用風險"];
    const devO=data["風險與發展建議"]["發展建議"]?.["O"];
    const devKR=data["風險與發展建議"]["發展建議"]?.["KR"];
    html+=`<h3>風險與發展建議</h3>`;
    if(risk){ html+=`<p><b>錄用風險：</b></p>`; Object.keys(risk).forEach(k=>html+=`<p>・${k}：${risk[k]}</p>`); }
    if(devO || devKR){
      html+=`<p><b>OKR：</b></p>`;
      if(devO) html+=`<p>O：${devO}</p>`;
      if(devKR) Object.keys(devKR).forEach(k=>html+=`<p>${k}：${devKR[k]}</p>`);
    }
  }

  if(data["錄用決策建議"]){
    const rec=data["錄用決策建議"];
    html+=`<h3>錄用決策建議</h3>`;
    if(rec["建議類型"]) html+=`<p><b>建議類型：</b>${rec["建議類型"]}</p>`;
    if(rec["推薦理由"]){ html+=`<p><b>推薦理由：</b></p>`;
      Object.keys(rec["推薦理由"]).forEach(k=>html+=`<p>・${k}：${rec["推薦理由"][k]}</p>`); }
    if(rec["追加面試問題"]){ html+=`<p><b>追加面試問題：</b></p>`;
      Object.keys(rec["追加面試問題"]).forEach(k=>html+=`<p>・${k}：${rec["追加面試問題"][k]}</p>`); }
  }

  html+=`</div>`;
  c.innerHTML=html;
  applySmartCollapsible(c);
  openSmooth("g6content");

  const fitObj=data["職能適配性"]||{};
  matchForKPI=Math.min(5, Math.max(1, Object.keys(fitObj).length?3.8:3.0));
}).catch(console.error);

/* ================== 儀表板 ================== */
Promise.allSettled([
  loadJSON(`data/${cid}_goal1.json`),
  loadJSON(`data/${cid}_goal2.json`),
  loadJSON(`data/${cid}_goal4.json`),
  loadJSON(`data/${cid}_goal5.json`),
  loadJSON(`data/${cid}_goal6.json`)
]).then(([p1,p2,p4,p5,p6])=>{
  const avgFromObj=(obj)=>{ const vals=Object.values(obj||{}).map(x=>x["評分"]).filter(x=>typeof x==="number"); return vals.length? vals.reduce((a,b)=>a+b,0)/vals.length : null; };
  if(averages.completeness==null && p1.status==="fulfilled"){ const v=avgFromObj(p1.value); averages.completeness=v?Number(v.toFixed(2)):null; }
  if(averages.quality==null && p2.status==="fulfilled"){ const v=avgFromObj(p2.value); averages.quality=v?Number(v.toFixed(2)):null; }
  if(averages.potential==null && p4.status==="fulfilled"){ const v=avgFromObj(p4.value); averages.potential=v?Number(v.toFixed(2)):null; }
  if(averages.communication==null && p5.status==="fulfilled"){ const v=p5.value["評分"]; averages.communication=typeof v==="number"?v:null; }
  if(averages.overall==null && p6.status==="fulfilled"){ const v=p6.value["整體適任性分數"]; averages.overall=typeof v==="number"?v:null; }

  setKPI("kpiOverall", averages.overall);
  setKPI("kpiComm", averages.communication);
  const match = (()=>{
    const nums=[averages.overall,averages.quality,averages.completeness].filter(x=>typeof x==="number");
    return nums.length? nums.reduce((a,b)=>a+b,0)/nums.length : (matchForKPI ?? 3.5);
  })();
  setKPI("kpiMatch", match);

  const bctx=document.getElementById("barChart").getContext("2d");
  new Chart(bctx,{
    type:"bar",
    data:{
      labels: ["整體適任性","內容品質","回答完整性","溝通與邏輯性","潛能（特質）"],
      datasets:[{label:"Score (1~5)",data:[
        averages.overall ?? null, averages.quality ?? null, averages.completeness ?? null, averages.communication ?? null, averages.potential ?? null
      ],backgroundColor:"rgba(75,108,183,.65)",borderColor:"#4B6CB7",borderWidth:1}]
    },
    options:{scales:{y:{beginAtZero:true,min:0,max:5,ticks:{stepSize:1},grid:{color:"#e5e7eb"}},x:{grid:{display:false}}},
      plugins:{legend:{display:false}}}
  });

/* ================== 潛能 × 表現（Heatmap Matrix 版本） ================== */
const ctxHeat = document.getElementById("nineBoxChart").getContext("2d");
document.getElementById("nineBoxChart").height = 420;

const candidate = { performance: 3.6, potential: 4.1 };
const heatData = [];
for (let i = 1; i <= 5; i++) {
  for (let j = 1; j <= 5; j++) {
    heatData.push({ x: i, y: j, v: Math.round((i + j) / 10 * 100) / 100 });
  }
}

function heatColor(v){
  const c1 = [230,240,255], c2 = [30,42,94];
  const mix = (a,b,r)=>Math.round(a+(b-a)*r);
  const r = mix(c1[0],c2[0],v), g = mix(c1[1],c2[1],v), b = mix(c1[2],c2[2],v);
  return `rgba(${r},${g},${b},0.85)`;
}

new Chart(ctxHeat, {
  type: "matrix",
  data: {
    datasets: [{
      label: "潛能 × 表現矩陣",
      data: heatData.map(d => ({x: d.x, y: d.y, v: d.v})),
      backgroundColor: ctx => heatColor(ctx.dataset.data[ctx.dataIndex].v),
      borderWidth: 1, borderColor: "#fff",
      width: ctx => 70, height: ctx => 70,
    },
    {
      label: "候選人",
      type: "scatter",
      data: [{x: candidate.performance, y: candidate.potential}],
      pointBackgroundColor: "#ff5252", pointRadius: 10, pointHoverRadius: 12
    }]
  },
  options: {
    aspectRatio: 1,
    scales: {
      x: {
        min: 0.5, max: 5.5, ticks: {stepSize: 1},
        title: {display: true, text: "表現", font:{weight:"bold"}},
        grid: {display: false}
      },
      y: {
        min: 0.5, max: 5.5, ticks: {stepSize: 1},
        title: {display: true, text: "潛能", font:{weight:"bold"}},
        grid: {display: false}
      }
    },
    plugins: {
      legend: {display: false},
      tooltip: { callbacks: { label: ctx => `(${ctx.raw.x}, ${ctx.raw.y})` } },
      title: {
        display: true, text: "潛能 × 表現熱度矩陣",
        font: {size: 18, weight: "bold"}, color: "#1E2A5E",
        padding: {top: 10, bottom: 20}
      }
    }
  }
});

}).catch(console.error);

/* ================== 進場觀察（提升體感） ================== */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add("visible"); });
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

window.addEventListener("load", ()=>{
  ["g1content","g2content","g3優勢","g3不足","g3追問建議","g4traits","g6content"].forEach(openSmooth);
});