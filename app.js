(function(){
"use strict";
const $ = (s, r=document) => r.querySelector(s);
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const secById = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const REPO_URL = "https://github.com/" + SITE.repo;
const NOTES_URL = REPO_URL + "/issues/" + SITE.notesIssue;

/* ---------- storage ---------- */
const KEY = "purrview_v1";
const store = { get(k, d){ try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch(e){ return d; } }, set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} } };
const state = Object.assign({ xp:0, known:{}, hands:{}, plan:{}, secBest:{}, mockBest:null, badges:{}, days:[], opened:{}, bestStreak:0, tab:"home", awarded:{} }, store.get(KEY, {}));
const save = () => store.set(KEY, state);
const todayISO = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };

/* ---------- render mode (same key as the purr-folio) ---------- */
const body = document.body;
function setMode(m){ body.classList.toggle("writer", m === "writer"); $("#modeLabel").textContent = "render_mode: " + (m === "writer" ? "creative-writer" : "data-engineer"); store.set("purr_mode", m); }
$("#switch").addEventListener("click", () => setMode(body.classList.contains("writer") ? "engineer" : "writer"));
setMode(store.get("purr_mode", "engineer"));

/* ---------- art ---------- */
const PAW = (fill) => `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="42" rx="14" ry="12" fill="${fill}"/><circle cx="15" cy="27" r="6" fill="${fill}"/><circle cx="25" cy="17" r="6" fill="${fill}"/><circle cx="39" cy="17" r="6" fill="${fill}"/><circle cx="49" cy="27" r="6" fill="${fill}"/></svg>`;
function mascot(mood){
  const eyes = mood === "happy"
    ? `<path d="M33 52 q5 -6 10 0" stroke="var(--bg)" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M57 52 q5 -6 10 0" stroke="var(--bg)" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    : mood === "shock"
    ? `<circle cx="38" cy="51" r="6" fill="var(--bg)"/><circle cx="62" cy="51" r="6" fill="var(--bg)"/>`
    : `<g class="blink" style="transform-origin:50px 51px"><ellipse cx="38" cy="51" rx="4" ry="5.5" fill="var(--bg)"/><ellipse cx="62" cy="51" rx="4" ry="5.5" fill="var(--bg)"/></g>`;
  const mouth = mood === "shock" ? `<ellipse cx="50" cy="67" rx="4" ry="5" fill="var(--bg)"/>` : `<path d="M44 64 q3 4 6 0 q3 4 6 0" stroke="var(--bg)" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  return `<svg class="mascot" viewBox="0 0 100 100" aria-hidden="true">
    <path class="tail" d="M78 78 q18 -4 12 -26" stroke="var(--accent)" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M18 40 L22 10 L42 26 Z M82 40 L78 10 L58 26 Z" fill="var(--accent)"/>
    <path d="M24 34 L25 18 L36 27 Z M76 34 L75 18 L64 27 Z" fill="var(--pop)" opacity=".7"/>
    <circle cx="50" cy="56" r="34" fill="var(--accent)"/>
    ${eyes}
    <path d="M47 58 L53 58 L50 61 Z" fill="var(--pop)"/>
    ${mouth}
    <path d="M20 58 L36 60 M20 66 L36 64 M80 58 L64 60 M80 66 L64 64" stroke="var(--bg)" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>
  </svg>`;
}

/* ---------- levels, badges, xp ---------- */
const LEVELS = [[0,"Stray Kitten"],[200,"Curious Kitten"],[600,"Alley Cat"],[1200,"House Cat"],[2000,"Lakehouse Tabby"],[3200,"Delta Tomcat"],[4800,"Unity Lion"]];
const BADGES = [
  ["first_pounce","First Pounce","Answer your first question right","#5DFF87"],
  ["curious","Curiosity Unlocked","Open the study notes for all 7 sections","#4A82FF"],
  ["whisker","Whisker Wise","Know every flashcard in one section","#2BE3DF"],
  ["nine_lives","Nine Lives","Get 9 questions right in a row","#FFC61A"],
  ["clean_sweep","Clean Sweep","Score 100% on a section quiz","#A98BFF"],
  ["paws_on","Paws On","Finish 5 hands-on tasks","#FF8A5B"],
  ["on_schedule","On Schedule","Tick off 7 days of the study calendar","#FF69B4"],
  ["mock_ready","Mock Ready","Score 80% or more on a timed mock exam","#5DFF87"]
];
const levelOf = xp => { let i = 0; LEVELS.forEach((l, k) => { if (xp >= l[0]) i = k; }); return i; };
let mood = "idle", sayLine = "";
function toast(msg){ const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; $("#toast").appendChild(t); setTimeout(() => t.remove(), 2700); }
function pawBurst(x, y){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 10; i++) {
    const p = document.createElement("div"); p.className = "paw-burst";
    p.innerHTML = PAW(["var(--accent)","var(--pop)","var(--third)"][i % 3]);
    const a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 80;
    p.style.left = (x - 11) + "px"; p.style.top = (y - 11) + "px";
    p.style.setProperty("--dx", Math.cos(a) * r + "px"); p.style.setProperty("--dy", Math.sin(a) * r + "px"); p.style.setProperty("--rot", (Math.random() * 180 - 90) + "deg");
    document.body.appendChild(p); setTimeout(() => p.remove(), 1200);
  }
}
function markDay(){ const t = todayISO(); if (!state.days.includes(t)) { state.days.push(t); state.days = state.days.slice(-60); } }
function dayStreak(){
  const set = new Set(state.days); let n = 0; const d = new Date();
  if (!set.has(todayISO())) d.setDate(d.getDate() - 1);
  while (true) { const iso = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); if (set.has(iso)) { n++; d.setDate(d.getDate() - 1); } else break; }
  return n;
}
function award(xp, why, at){
  const before = levelOf(state.xp);
  state.xp += xp; markDay(); save();
  toast("+" + xp + " XP  " + why);
  const after = levelOf(state.xp);
  if (after > before) { toast("Level up: " + LEVELS[after][1]); const r = (at || $("#hud")).getBoundingClientRect(); pawBurst(r.left + r.width/2, r.top + r.height/2); }
  checkBadges(); renderHud();
}
function unlock(id){
  if (state.badges[id]) return;
  state.badges[id] = todayISO(); save();
  const b = BADGES.find(x => x[0] === id); toast("Badge unlocked: " + b[1]);
  pawBurst(innerWidth/2, innerHeight - 90);
}
function checkBadges(){
  if (Object.keys(state.opened).length >= SECTIONS.length) unlock("curious");
  if (SECTIONS.some(s => { const cs = CARDS.map((c,i)=>({c,i})).filter(x => x.c[0] === s.id); return cs.length && cs.every(x => state.known[x.i]); })) unlock("whisker");
  if (state.bestStreak >= 9) unlock("nine_lives");
  if (Object.values(state.hands).filter(Boolean).length >= 5) unlock("paws_on");
  if (Object.values(state.plan).filter(Boolean).length >= 7) unlock("on_schedule");
  if (state.mockBest != null && state.mockBest >= 80) unlock("mock_ready");
  if (Object.values(state.secBest).some(v => v === 100)) unlock("clean_sweep");
}
function daysToExam(){
  const [y,m,d] = SITE.examDay.split("-").map(Number);
  const exam = new Date(y, m-1, d), now = new Date(); now.setHours(0,0,0,0);
  return Math.round((exam - now) / 86400000);
}
function setMood(m, line){ mood = m; sayLine = line || ""; renderHud(); }

/* ---------- HUD ---------- */
function renderHud(){
  const i = levelOf(state.xp), cur = LEVELS[i], next = LEVELS[i+1];
  const pct = next ? ((state.xp - cur[0]) / (next[0] - cur[0]) * 100) : 100;
  const dte = daysToExam();
  const badgeN = Object.keys(state.badges).length;
  const defaultLine = dte > 0 ? `${dte} days to exam day. One section at a time.` : dte === 0 ? "Exam day. You have got this." : "Exam day has passed. Keep the streak for recertification.";
  $("#hud").innerHTML = `${mascot(mood)}
    <div class="hud-main">
      <div class="rank-row"><span class="rank">${esc(cur[1])}</span><span class="mono small soft">level ${i+1} of ${LEVELS.length}${next ? `  |  ${next[0] - state.xp} XP to ${esc(next[1])}` : "  |  max level"}</span></div>
      <div class="xpbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><i style="width:${pct.toFixed(1)}%"></i></div>
      <div class="hud-stats"><span>xp <b>${state.xp}</b></span><span>day streak <b>${dayStreak()}</b></span><span>badges <b>${badgeN}/${BADGES.length}</b></span><span>exam day <b>${esc(SITE.examDayLabel.replace(/^\w+, /,""))}</b></span></div>
      <div class="say">&gt; ${esc(sayLine || defaultLine)}</div>
    </div>`;
}

/* ---------- tabs ---------- */
const TABS = [["home","home"],["plan","calendar"],["tips","exam_tips"],["study","study"],["cards","flashcards"],["quiz","quiz"],["notes","notes_wall"],["renamed","renamed"],["hands","hands_on"],["resources","resources"]];
$("#tabs").innerHTML = TABS.map(([id,l]) => `<button class="tab" role="tab" id="tab-${id}" aria-controls="p-${id}" data-tab="${id}">${l}</button>`).join("");
$("#panels").innerHTML = TABS.map(([id]) => `<section class="panel" role="tabpanel" id="p-${id}" aria-labelledby="tab-${id}" hidden></section>`).join("");
const RENDER = {};
function show(id){
  if (!TABS.some(t => t[0] === id)) id = "home";
  state.tab = id; save();
  document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === id ? "true" : "false"));
  document.querySelectorAll("section.panel").forEach(p => p.hidden = p.id !== "p-" + id);
  RENDER[id] && RENDER[id]();
}
$("#tabs").addEventListener("click", e => { const b = e.target.closest(".tab"); if (b) { show(b.dataset.tab); try { history.replaceState(null, "", "#" + b.dataset.tab); } catch(err){} } });
const goTo = id => { show(id); scrollTo({ top: 0, behavior: "smooth" }); };

/* ---------- mastery ---------- */
function mastery(sid){
  const cs = CARDS.map((c,i)=>({c,i})).filter(x => x.c[0] === sid);
  const k = cs.length ? cs.filter(x => state.known[x.i]).length / cs.length : 0;
  const q = (state.secBest[sid] || 0) / 100;
  return Math.round((k * 0.5 + q * 0.5) * 100);
}
const ring = p => { const c = 2 * Math.PI * 24; return `<svg class="ring" viewBox="0 0 58 58" aria-hidden="true"><circle class="bg" cx="29" cy="29" r="24" fill="none" stroke-width="6"/><circle class="fg" cx="29" cy="29" r="24" fill="none" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p/100)}" transform="rotate(-90 29 29)"/><text x="29" y="33" text-anchor="middle">${p}%</text></svg>`; };

/* ---------- HOME ---------- */
RENDER.home = function(){
  const dte = daysToExam();
  $("#p-home").innerHTML = `
    <div class="card" style="display:grid;gap:10px">
      <div class="eyebrow">The exam</div>
      <h2>Databricks Certified Data Engineer Associate</h2>
      <div class="facts">
        <span class="fact"><b>45</b> scored questions</span><span class="fact"><b>90</b> minutes</span><span class="fact"><b>${esc(EXAM.fee)}</b></span>
        <span class="fact">valid <b>${esc(EXAM.validity)}</b></span><span class="fact">${esc(EXAM.delivery)}</span>
        <span class="fact">FTW exam day <b>${esc(SITE.examDayLabel)}</b>${dte > 0 ? `, ${dte} days away` : ""}</span>
      </div>
      <p class="soft small">${esc(EXAM.note)}</p>
    </div>
    <div class="card" style="display:grid;gap:12px">
      <div class="row" style="justify-content:space-between"><div><div class="eyebrow">The cat tree</div><h2>Seven sections, one ring each</h2></div><span class="soft small mono">ring = half flashcards known, half best section quiz</span></div>
      <div class="tree">${SECTIONS.map(s => `
        <button class="room" data-s="${s.id}">${ring(mastery(s.id))}<span><span class="w">Section ${s.n}  |  ${s.weight}%  |  about ${Math.round(45*s.weight/100)} questions</span><b>${esc(s.name)}</b></span></button>`).join("")}</div>
    </div>
    <div class="grid2">
      <div class="card" style="display:grid;gap:10px">
        <div class="eyebrow">How XP works</div>
        <ul class="clean small">
          <li>Flashcard marked known: <b>10 XP</b></li>
          <li>Correct quiz answer: <b>20 XP</b>, plus up to 25 more for a streak</li>
          <li>Calendar day ticked off: <b>30 XP</b></li>
          <li>Hands-on task done: <b>50 XP</b></li>
        </ul>
        <p class="small soft">Seven ranks from Stray Kitten to Unity Lion. Reach Unity Lion and score 80% on a mock before you sit the real thing.</p>
      </div>
      <div class="card" style="display:grid;gap:10px">
        <div class="eyebrow">Save on the fee</div>
        <p class="small">Finish these four Databricks Academy courses between Sep 16 and Oct 14, 2026 for 50% off a certification:</p>
        <ul class="clean small">${ACADEMY.map(a => `<li>${esc(a)}</li>`).join("")}</ul>
        <p class="small"><b>Timing:</b> vouchers are emailed on Oct 19, after the Oct 17 exam day. If you want the discount, book your exam after you receive it.</p>
      </div>
    </div>
    <div class="card" style="display:grid;gap:12px">
      <div class="eyebrow">Badges</div>
      <div class="badges">${BADGES.map(b => `<div class="badge ${state.badges[b[0]] ? "got" : ""}">${PAW(b[3])}<b>${esc(b[1])}</b><span>${esc(b[2])}</span></div>`).join("")}</div>
    </div>`;
  $("#p-home").querySelectorAll(".room").forEach(r => r.onclick = () => { studySec = r.dataset.s; goTo("study"); });
};

/* ---------- PLAN / CALENDAR ---------- */
const TYPE = { study:["study","var(--accent)"], check:["check-in","var(--third)"], mock:["mock exam","var(--pop)"], rest:["rest","var(--ink-soft)"], exam:["exam day","var(--bad)"], deadline:["deadline","var(--warn)"] };
function monthGrid(y, m){
  const first = new Date(y, m, 1), days = new Date(y, m+1, 0).getDate(), lead = first.getDay();
  const byDate = Object.fromEntries(PLAN.map(p => [p[0], p]));
  const t = todayISO();
  let cells = "";
  for (let i = 0; i < lead; i++) cells += `<div></div>`;
  for (let d = 1; d <= days; d++) {
    const iso = y + "-" + String(m+1).padStart(2,"0") + "-" + String(d).padStart(2,"0");
    const p = byDate[iso], col = p ? TYPE[p[1]][1] : null;
    const done = p && state.plan[iso];
    cells += `<button class="day${p ? " has" : ""}${iso === t ? " today" : ""}${done ? " done" : ""}" ${p ? `data-d="${iso}" title="${esc(p[2])}"` : "disabled"} style="${col ? `--dc:${col}` : ""}"><span>${d}</span>${p ? `<i></i>` : ""}</button>`;
  }
  const name = first.toLocaleString("en", { month: "long", year: "numeric" });
  return `<div class="month"><div class="mname">${esc(name)}</div><div class="dow">${["S","M","T","W","T","F","S"].map(x => `<span>${x}</span>`).join("")}</div><div class="days">${cells}</div></div>`;
}
let planPick = null;
RENDER.plan = function(){
  const dte = daysToExam(), t = todayISO();
  const next = PLAN.find(p => p[0] >= t) || PLAN[PLAN.length-1];
  const pick = planPick || next[0];
  const pp = PLAN.find(p => p[0] === pick);
  const doneN = Object.values(state.plan).filter(Boolean).length;
  $("#p-plan").innerHTML = `
    <div class="grid2">
      <div class="card countdown">
        <div class="eyebrow">Countdown</div>
        <div class="bignum">${Math.max(dte,0)}</div>
        <div class="mono">${dte > 0 ? "days until" : dte === 0 ? "today is" : "days since"} FTW exam day</div>
        <h3 style="margin-top:6px">${esc(SITE.examDayLabel)}</h3>
        <p class="small soft">Calendar days ticked off: ${doneN} of ${PLAN.length}. Each one is 30 XP.</p>
      </div>
      <div class="card" style="display:grid;gap:10px">
        <div class="eyebrow">${pp[0] === t ? "Today" : "Selected day"}  |  ${esc(new Date(pp[0] + "T00:00").toLocaleDateString("en", { weekday:"long", month:"short", day:"numeric" }))}</div>
        <div class="row"><span class="legend" style="--dc:${TYPE[pp[1]][1]}">${TYPE[pp[1]][0]}</span></div>
        <h3>${esc(pp[2])}</h3>
        <label class="check ${state.plan[pp[0]] ? "done" : ""}" style="margin-top:4px"><input type="checkbox" id="planToday" ${state.plan[pp[0]] ? "checked" : ""}><span>Done for this day</span></label>
      </div>
    </div>
    <div class="card" style="display:grid;gap:14px">
      <div class="row" style="justify-content:space-between"><h2>Study calendar to exam day</h2>
        <div class="row">${Object.entries(TYPE).map(([k,v]) => `<span class="legend" style="--dc:${v[1]}">${v[0]}</span>`).join("")}</div></div>
      <div class="months">${monthGrid(2026, 8)}${monthGrid(2026, 9)}</div>
      <p class="small soft">Tap a marked day to see its task. The plan studies by weight: the two biggest sections first, mock exams in the last week, a rest day before the exam.</p>
    </div>
    <div class="card" style="display:grid;gap:8px"><h3>The whole plan</h3>
      ${PLAN.map(p => `<label class="check ${state.plan[p[0]] ? "done" : ""}"><input type="checkbox" data-d="${p[0]}" ${state.plan[p[0]] ? "checked" : ""}><span><b class="mono small">${esc(new Date(p[0] + "T00:00").toLocaleDateString("en", { weekday:"short", month:"short", day:"numeric" }))}</b>  <span class="legend small" style="--dc:${TYPE[p[1]][1]}">${TYPE[p[1]][0]}</span><br>${esc(p[2])}</span></label>`).join("")}
    </div>`;
  const tick = (iso, on, el) => { const was = !!state.plan[iso]; state.plan[iso] = on; save(); if (on && !was && !state.awarded["plan_" + iso]) { state.awarded["plan_" + iso] = 1; award(30, "calendar day done", el); } RENDER.plan(); };
  $("#planToday").onchange = e => tick(pp[0], e.target.checked, e.target);
  $("#p-plan").querySelectorAll("input[data-d]").forEach(c => c.onchange = () => tick(c.dataset.d, c.checked, c));
  $("#p-plan").querySelectorAll(".day.has").forEach(d => d.onclick = () => { planPick = d.dataset.d; RENDER.plan(); });
};

/* ---------- TIPS ---------- */
RENDER.tips = function(){
  $("#p-tips").innerHTML = `
    <div><div class="eyebrow">What we know about passing</div><h2 style="margin-top:6px">Exam tips</h2>
      <p class="soft" style="max-width:68ch;margin-top:6px">From the Databricks certification page, the exam guide, the certification FAQ and the AI Prep Guide, plus what works for timed multiple choice exams.</p></div>
    <div class="grid2">${TIPS.map(g => `<div class="card"><h3>${esc(g.title)}</h3><ul class="clean small" style="margin-top:8px">${g.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}</div>
    <div class="row"><a class="btn" href="https://www.kryterion.com/systemcheck/" target="_blank" rel="noopener">Kryterion system check</a><a class="btn ghost" href="https://www.databricks.com/learn/certification/faq" target="_blank" rel="noopener">Certification FAQ</a><a class="btn ghost" href="http://webassessor.com/databricks" target="_blank" rel="noopener">Register on Webassessor</a></div>`;
};

/* ---------- STUDY ---------- */
let studySec = "s3";
RENDER.study = function(){
  const s = secById[studySec];
  if (!state.opened[s.id]) { state.opened[s.id] = 1; save(); checkBadges(); renderHud(); }
  $("#p-study").innerHTML = `
    <div class="chips" id="studyChips">${SECTIONS.map(x => `<button class="chip" data-s="${x.id}" aria-pressed="${x.id === studySec}">${x.n}. ${esc(x.name)}</button>`).join("")}</div>
    <div class="card" style="display:grid;gap:16px">
      <div class="row" style="justify-content:space-between;gap:12px">
        <div class="row" style="gap:12px">${ring(mastery(s.id))}<div><div class="eyebrow">Section ${s.n}  |  ${s.weight}% of the exam</div><h2 style="margin-top:4px">${esc(s.name)}</h2></div></div>
      </div>
      <div><div class="eyebrow" style="margin-bottom:6px">What the guide says you must do</div><ul class="clean">${s.objectives.map(o => `<li>${esc(o)}</li>`).join("")}</ul></div>
      <div><div class="eyebrow" style="margin-bottom:6px">Know this</div><ul class="clean know">${s.know.map(o => `<li>${esc(o)}</li>`).join("")}</ul></div>
      <div><div class="eyebrow" style="margin-bottom:6px">Read in the docs</div><div class="docs">${s.docs.map(([t,u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join("")}</div></div>
      <div class="row"><button class="btn ghost" data-go="cards">flashcards for this section</button><button class="btn" data-go="quiz">quiz this section</button></div>
    </div>`;
  $("#studyChips").onclick = e => { const b = e.target.closest(".chip"); if (b) { studySec = b.dataset.s; RENDER.study(); } };
  $("#p-study").querySelectorAll("[data-go]").forEach(b => b.onclick = () => {
    if (b.dataset.go === "cards") { cardFilter = s.id; resetDeck(); goTo("cards"); }
    else { startQuiz("section", s.id); goTo("quiz"); }
  });
};

/* ---------- FLASHCARDS ---------- */
let cardFilter = "all", deck = [], deckPos = 0, flipped = false, onlyUnknown = false, deckReady = false;
function resetDeck(){
  const pool = CARDS.map((c,i) => ({c,i})).filter(x => cardFilter === "all" || x.c[0] === cardFilter).filter(x => !onlyUnknown || !state.known[x.i]);
  deck = shuffle(pool); deckPos = 0; flipped = false; deckReady = true;
}
RENDER.cards = function(){
  if (!deckReady) resetDeck();
  const inSet = CARDS.map((c,i) => ({c,i})).filter(x => cardFilter === "all" || x.c[0] === cardFilter);
  const knownIn = inSet.filter(x => state.known[x.i]).length;
  const cur = deck[deckPos];
  $("#p-cards").innerHTML = `
    <div class="chips" id="cardChips"><button class="chip" data-s="all" aria-pressed="${cardFilter === "all"}">all sections</button>${SECTIONS.map(x => `<button class="chip" data-s="${x.id}" aria-pressed="${x.id === cardFilter}">${x.n}. ${esc(x.name)}</button>`).join("")}</div>
    <div class="row"><label class="row small" style="gap:6px"><input type="checkbox" id="onlyUnknown" ${onlyUnknown ? "checked" : ""}> only cards I do not know yet</label><button class="btn small ghost" id="reshuffle">shuffle</button><span class="soft small mono">${knownIn}/${inSet.length} known</span></div>
    <div class="deck">
      <div class="bar"><i style="width:${inSet.length ? knownIn/inSet.length*100 : 0}%"></i></div>
      ${cur ? `
        <button class="flip ${flipped ? "is-back" : ""}" id="flip" aria-label="Flashcard, press to flip">
          <span class="sec">section ${secById[cur.c[0]].n}</span>
          <span class="side">${flipped ? "answer" : "term or question"}</span>
          ${flipped ? `<span class="back">${esc(cur.c[2])}</span>` : `<span class="front">${esc(cur.c[1])}</span>`}
          <span class="soft small mono">${flipped ? "" : "click or press space to flip"}</span>
        </button>
        <div class="row" style="justify-content:center"><button class="btn ghost" id="again">again</button><button class="btn" id="gotit">got it</button></div>
        <div class="soft small mono">card ${deckPos+1} of ${deck.length}</div>`
      : `<div class="card" style="width:min(640px,100%);text-align:center;display:grid;gap:10px;justify-items:center">${mascot("happy")}<h3>Deck finished</h3><p class="soft small">Shuffle to go again, or turn off the filter to see every card.</p><button class="btn" id="restart">start again</button></div>`}
    </div>`;
  $("#cardChips").onclick = e => { const b = e.target.closest(".chip"); if (b) { cardFilter = b.dataset.s; resetDeck(); RENDER.cards(); } };
  $("#onlyUnknown").onchange = e => { onlyUnknown = e.target.checked; resetDeck(); RENDER.cards(); };
  $("#reshuffle").onclick = () => { resetDeck(); RENDER.cards(); };
  const f = $("#flip"); if (f) f.onclick = () => { flipped = !flipped; RENDER.cards(); const nf = $("#flip"); nf && nf.focus(); };
  const g = $("#gotit"); if (g) g.onclick = () => { const first = !state.known[cur.i]; state.known[cur.i] = true; save(); if (first && !state.awarded["card_" + cur.i]) { state.awarded["card_" + cur.i] = 1; award(10, "flashcard known", g); } next(); };
  const a = $("#again"); if (a) a.onclick = () => { state.known[cur.i] = false; save(); deck.push(cur); next(); };
  const r = $("#restart"); if (r) r.onclick = () => { resetDeck(); RENDER.cards(); };
  function next(){ deckPos++; flipped = false; RENDER.cards(); }
};
document.addEventListener("keydown", e => {
  if (state.tab !== "cards" || e.code !== "Space") return;
  const ae = document.activeElement;
  if (ae && /INPUT|TEXTAREA|BUTTON|SELECT/.test(ae.tagName)) return;
  const f = $("#flip"); if (f) { e.preventDefault(); f.click(); }
});

/* ---------- QUIZ ---------- */
let quiz = null, timerId = null, streak = 0;
const ZOOM_SECONDS = 30;
function pickMock(){ let out = []; SECTIONS.forEach(s => { out = out.concat(shuffle(QUESTIONS.map((q,i) => ({q,i})).filter(x => x.q[0] === s.id)).slice(0, s.mock)); }); return shuffle(out); }
function startQuiz(mode, sec){
  clearInterval(timerId); streak = 0;
  let items;
  if (mode === "mock") items = pickMock();
  else if (mode === "zoomies") items = shuffle(QUESTIONS.map((q,i) => ({q,i}))).slice(0, 10);
  else items = shuffle(QUESTIONS.map((q,i) => ({q,i})).filter(x => x.q[0] === sec));
  items = items.map(x => Object.assign(x, { order: shuffle([0,1,2,3]) }));
  quiz = { mode, sec, items, pos:0, answers:[], picked:null, xp:0, endAt: mode === "mock" ? Date.now() + EXAM.minutes * 60000 : null, qEnd: null, done:false };
  if (mode === "zoomies") quiz.qEnd = Date.now() + ZOOM_SECONDS * 1000;
  timerId = setInterval(tick, 250);
  setMood("idle", mode === "mock" ? "45 questions, 90 minutes. Pace yourself: about 2 minutes each." : mode === "zoomies" ? "Zoomies: 30 seconds a question. Go." : "Section practice. Aim for 80% or more.");
}
function tick(){
  if (!quiz || quiz.done) { clearInterval(timerId); return; }
  if (quiz.endAt) {
    const left = quiz.endAt - Date.now(), el = $("#clock");
    if (left <= 0) { finishQuiz(); return; }
    if (el) { const m = Math.floor(left/60000), s = Math.floor(left % 60000 / 1000); el.textContent = `${m}:${String(s).padStart(2,"0")} left`; el.classList.toggle("low", left < 5*60000); }
  }
  if (quiz.qEnd && quiz.picked == null) {
    const left = quiz.qEnd - Date.now(), bar = $("#tbar");
    if (bar) bar.style.width = Math.max(0, left / (ZOOM_SECONDS * 1000) * 100) + "%";
    if (left <= 0) answer(-1);
  }
}
function answer(oi){
  if (!quiz || quiz.picked != null) return;
  const it = quiz.items[quiz.pos], q = it.q, ok = oi === q[3];
  quiz.picked = oi;
  quiz.answers.push({ i: it.i, sec: q[0], pick: oi < 0 ? null : oi, ok });
  if (ok) {
    streak++; state.bestStreak = Math.max(state.bestStreak, streak);
    const gain = 20 + Math.min(streak - 1, 5) * 5; quiz.xp += gain;
    if (!state.badges.first_pounce) unlock("first_pounce");
    award(gain, streak > 1 ? `streak ${streak}` : "correct", $("#qcard"));
    setMood("happy", streak >= 3 ? `${streak} in a row. Purring.` : "Correct.");
  } else {
    streak = 0; save();
    setMood("shock", oi < 0 ? "Time is up on that one." : "Not quite. Read why below.");
  }
  RENDER.quiz();
}
function finishQuiz(){
  clearInterval(timerId);
  if (!quiz) return;
  quiz.done = true;
  const total = quiz.items.length, right = quiz.answers.filter(a => a.ok).length, pct = total ? Math.round(right / total * 100) : 0;
  if (quiz.mode === "mock" && quiz.answers.length) state.mockBest = Math.max(state.mockBest || 0, pct);
  if (quiz.mode === "section" && quiz.answers.length === total) state.secBest[quiz.sec] = Math.max(state.secBest[quiz.sec] || 0, pct);
  save(); checkBadges();
  setMood(pct >= 80 ? "happy" : "idle", pct >= 80 ? `${pct}%. That is a pass-level run.` : `${pct}%. Review the misses, then go again.`);
  if (state.tab === "quiz") RENDER.quiz();
}
RENDER.quiz = function(){
  const P = $("#p-quiz");
  if (!quiz) {
    P.innerHTML = `
      <div><div class="eyebrow">Scratching post</div><h2 style="margin-top:6px">Practice quiz</h2><p class="soft" style="max-width:70ch;margin-top:6px">Every question has one best answer and an explanation. Correct answers earn XP, and streaks earn more.</p></div>
      <div class="modes">
        <button class="mode" data-m="mock"><b>mock_exam</b><span class="soft small">45 questions weighted like the real exam, 90 minute clock${state.mockBest != null ? `. Best so far ${state.mockBest}%` : ""}</span></button>
        <button class="mode" data-m="zoomies"><b>zoomies</b><span class="soft small">10 random questions, 30 seconds each. Fast practice for pacing</span></button>
      </div>
      <div class="card" style="display:grid;gap:10px"><h3>Practice one section</h3>
        <div class="chips">${SECTIONS.map(s => `<button class="chip" data-m="section" data-s="${s.id}">${s.n}. ${esc(s.name)} (${QUESTIONS.filter(q => q[0] === s.id).length})${state.secBest[s.id] != null ? `  best ${state.secBest[s.id]}%` : ""}</button>`).join("")}</div></div>
      <p class="soft small">Practice questions written from the exam guide objectives, plus the official sample questions. They are not real exam questions. Want to add one? See CONTRIBUTING.md in the repo.</p>`;
    P.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { startQuiz(b.dataset.m, b.dataset.s); RENDER.quiz(); });
    return;
  }
  if (quiz.done) {
    const total = quiz.items.length, right = quiz.answers.filter(a => a.ok).length, pct = total ? Math.round(right / total * 100) : 0;
    const bySec = SECTIONS.map(s => { const a = quiz.answers.filter(x => x.sec === s.id); return { s, n: a.length, ok: a.filter(x => x.ok).length }; }).filter(x => x.n);
    const wrong = quiz.answers.filter(a => !a.ok);
    P.innerHTML = `
      <div class="card" style="display:grid;gap:14px">
        <div class="eyebrow">${quiz.mode === "mock" ? "mock exam result" : quiz.mode === "zoomies" ? "zoomies result" : "section result"}</div>
        <div class="row" style="gap:16px">${mascot(pct >= 80 ? "happy" : "idle")}<div><div class="score">${pct}%</div><div class="soft mono small">${right} of ${total} correct${quiz.answers.length < total ? `, ${total - quiz.answers.length} unanswered` : ""}  |  +${quiz.xp} XP</div></div></div>
        <div class="bd">${bySec.map(x => `<div class="r"><span><span class="num">${x.s.n}</span> ${esc(x.s.name)}</span><span>${x.ok}/${x.n}</span></div>`).join("")}</div>
        <div class="row"><button class="btn" id="again">new quiz</button>${wrong.length ? `<button class="btn ghost" id="toReview">review ${wrong.length} missed</button>` : ""}</div>
      </div>
      ${wrong.length ? `<div class="card review" id="reviewList"><h3>What you missed</h3>${wrong.map(a => { const q = QUESTIONS[a.i]; return `<div class="item"><span class="soft small mono">section ${secById[q[0]].n}</span><b>${esc(q[1])}</b><span>Your answer: <span class="no">${a.pick == null ? "No answer" : esc(q[2][a.pick])}</span></span><span>Correct: <span class="ok">${esc(q[2][q[3]])}</span></span><span class="soft">${esc(q[4])}</span></div>`; }).join("")}</div>` : ""}`;
    $("#again").onclick = () => { quiz = null; setMood("idle"); RENDER.quiz(); };
    const tr = $("#toReview"); if (tr) tr.onclick = () => $("#reviewList").scrollIntoView({ behavior: "smooth" });
    return;
  }
  const it = quiz.items[quiz.pos], q = it.q, answered = quiz.picked != null;
  P.innerHTML = `
    <div class="card" id="qcard" style="display:grid;gap:14px">
      <div class="qtop"><span>${quiz.mode === "mock" ? "mock_exam" : quiz.mode === "zoomies" ? "zoomies" : "section " + secById[quiz.sec].n}  |  question <b>${quiz.pos+1}</b>/${quiz.items.length}  |  streak <b>${streak}</b>  |  xp <b>+${quiz.xp}</b></span>
        <span class="row">${quiz.endAt ? `<span class="clock" id="clock"></span>` : ""}<button class="btn small ghost" id="quit">end quiz</button></span></div>
      ${quiz.qEnd ? `<div class="tbar"><i id="tbar" style="width:100%"></i></div>` : ""}
      <div class="soft small"><span class="num">${secById[q[0]].n}</span> ${esc(secById[q[0]].name)}</div>
      <p class="qtext">${esc(q[1])}</p>
      <div class="opts">${it.order.map((oi,k) => { let cls = ""; if (answered) { if (oi === q[3]) cls = "right"; else if (oi === quiz.picked) cls = "wrong"; } return `<button class="opt ${cls}" data-o="${oi}" ${answered ? "disabled" : ""}><span class="l">${"ABCD"[k]}</span><span>${esc(q[2][oi])}</span></button>`; }).join("")}</div>
      ${answered ? `<div class="why"><span class="${quiz.picked === q[3] ? "ok" : "no"}">${quiz.picked === q[3] ? "Correct." : quiz.picked < 0 ? "Time is up." : "Not quite."}</span> ${esc(q[4])}</div>
        <div class="row"><button class="btn" id="next">${quiz.pos+1 < quiz.items.length ? "next question" : "see results"}</button></div>` : ""}
    </div>`;
  tick();
  P.querySelectorAll(".opt").forEach(b => b.onclick = () => answer(+b.dataset.o));
  const n = $("#next"); if (n) n.onclick = () => { quiz.picked = null; quiz.pos++; if (quiz.mode === "zoomies") quiz.qEnd = Date.now() + ZOOM_SECONDS * 1000; if (quiz.pos >= quiz.items.length) finishQuiz(); else RENDER.quiz(); };
  $("#quit").onclick = () => finishQuiz();
};

/* ---------- NOTES WALL ---------- */
let notesCache = null;
RENDER.notes = function(){
  $("#p-notes").innerHTML = `
    <div class="card" style="display:grid;gap:10px">
      <div class="eyebrow">Encouragement wall</div>
      <h2>Pin a note for the batch</h2>
      <p class="soft" style="max-width:70ch">Leave a note for your classmates: your exam date, a tip that helped, or just a push to keep going. Notes are comments on one GitHub issue, so you need a GitHub account to pin one. Everyone can read them here.</p>
      <div class="row"><a class="btn" href="${NOTES_URL}#new_comment_field" target="_blank" rel="noopener">pin a note on GitHub</a><button class="btn ghost" id="refreshNotes">refresh wall</button></div>
      <p class="soft small">Keep it kind and about the exam. The repo owner can remove notes that are not.</p>
    </div>
    <div class="wall" id="wall"><p class="soft mono small">loading notes...</p></div>`;
  $("#refreshNotes").onclick = () => { notesCache = null; loadNotes(); };
  loadNotes();
};
async function loadNotes(){
  const wall = $("#wall"); if (!wall) return;
  try {
    if (!notesCache) {
      const r = await fetch(`https://api.github.com/repos/${SITE.repo}/issues/${SITE.notesIssue}/comments?per_page=100`, { headers: { "Accept": "application/vnd.github+json" } });
      if (!r.ok) throw new Error("status " + r.status);
      notesCache = await r.json();
    }
    const notes = notesCache.slice().reverse();
    if (!notes.length) { wall.innerHTML = `<div class="card" style="grid-column:1/-1;text-align:center;display:grid;gap:8px;justify-items:center">${mascot("idle")}<h3>The wall is empty</h3><p class="soft small">Be the first to pin a note.</p></div>`; return; }
    const tilt = [-2, 1.5, -1, 2, -1.5, 1];
    wall.innerHTML = notes.map((n, k) => `
      <article class="note" style="--tilt:${tilt[k % tilt.length]}deg">
        <span class="pin">${PAW("var(--accent-deep)")}</span>
        <p>${esc(n.body || "").slice(0, 600).replace(/\n/g, "<br>")}</p>
        <footer><img src="${esc(n.user.avatar_url)}&s=48" alt="" width="24" height="24" loading="lazy"><a href="${esc(n.html_url)}" target="_blank" rel="noopener">@${esc(n.user.login)}</a><span>${esc(new Date(n.created_at).toLocaleDateString("en", { month:"short", day:"numeric" }))}</span></footer>
      </article>`).join("");
  } catch (e) {
    wall.innerHTML = `<div class="card" style="grid-column:1/-1;display:grid;gap:8px;justify-items:start">${mascot("shock")}<h3>The wall could not load here</h3><p class="soft small">Open the notes directly on GitHub instead. If you are on the live site, GitHub may be limiting requests for a few minutes.</p><a class="btn" href="${NOTES_URL}" target="_blank" rel="noopener">open the notes on GitHub</a></div>`;
  }
}

/* ---------- RENAMED ---------- */
RENDER.renamed = function(){
  $("#p-renamed").innerHTML = `
    <div><div class="eyebrow">Old names, new names</div><h2 style="margin-top:6px">Renamed terms</h2><p class="soft" style="max-width:70ch;margin-top:6px">Many mock exams and videos still use names Databricks has changed. The current exam uses the new ones. If a practice question uses an old name, check whether its answer is still true.</p></div>
    <div class="tablewrap"><table><thead><tr><th>Older name</th><th>Current name</th><th>Note</th></tr></thead><tbody>
      ${RENAMES.map(r => `<tr><td class="old">${esc(r[0])}</td><td><b>${esc(r[1])}</b></td><td class="soft">${esc(r[2])}</td></tr>`).join("")}
    </tbody></table></div>`;
};

/* ---------- HANDS-ON ---------- */
RENDER.hands = function(){
  const done = HANDSON.filter((_,i) => state.hands[i]).length;
  $("#p-hands").innerHTML = `
    <div><div class="eyebrow">Paws on keyboard</div><h2 style="margin-top:6px">Hands-on checklist</h2><p class="soft" style="max-width:70ch;margin-top:6px">Do each task once in Databricks Free Edition. ${done} of ${HANDSON.length} done. Each one is 50 XP.</p></div>
    <div style="display:grid;gap:8px">${HANDSON.map((h,i) => `<label class="check ${state.hands[i] ? "done" : ""}"><input type="checkbox" id="h${i}" data-i="${i}" ${state.hands[i] ? "checked" : ""}><span>${esc(h)}</span></label>`).join("")}</div>
    <div class="row"><a class="btn" href="https://www.databricks.com/learn/free-edition" target="_blank" rel="noopener">open Databricks Free Edition</a></div>`;
  $("#p-hands").querySelectorAll("input[type=checkbox]").forEach(c => c.onchange = () => {
    state.hands[c.dataset.i] = c.checked; save();
    if (c.checked && !state.awarded["hands_" + c.dataset.i]) { state.awarded["hands_" + c.dataset.i] = 1; award(50, "hands-on task", c); }
    checkBadges(); RENDER.hands();
  });
};

/* ---------- RESOURCES ---------- */
RENDER.resources = function(){
  $("#p-resources").innerHTML = `
    <div class="grid2">
      ${RESOURCES.map(g => `<div class="card res"><h3>${esc(g.group)}</h3>${g.items.map(([t,u,d]) => `<div class="item"><a class="title" href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>${d ? `<span class="soft small">${esc(d)}</span>` : ""}</div>`).join("")}</div>`).join("")}
      <div class="card res"><h3>Recommended Academy courses</h3><ul class="clean small">${["Data Engineering with Databricks (instructor led)"].concat(ACADEMY, ["Data Interoperability with Unity Catalog","Get Started with Data Governance on Databricks"]).map(a => `<li>${esc(a)}</li>`).join("")}</ul></div>
      <div class="card res"><h3>Help improve this reviewer</h3><p class="small">Found a wrong answer or have a good question to add? Open an issue or a pull request.</p><div class="row"><a class="btn small" href="${REPO_URL}" target="_blank" rel="noopener">repo on GitHub</a><a class="btn small ghost" href="${REPO_URL}/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">how to contribute</a></div></div>
    </div>
    <div class="card" style="display:grid;gap:14px"><h3>Docs by section</h3>
      ${SECTIONS.map(s => `<div style="display:grid;gap:6px"><div><span class="num">${s.n}</span> <b>${esc(s.name)}</b></div><div class="docs">${s.docs.map(([t,u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join("")}</div></div>`).join("")}
    </div>`;
};

/* ---------- boot ---------- */
$("#footLinks").innerHTML = `<a href="${REPO_URL}" target="_blank" rel="noopener">source on GitHub</a>  |  <a href="${NOTES_URL}" target="_blank" rel="noopener">notes wall</a>  |  made by <a href="https://czekinah.github.io/" target="_blank" rel="noopener">Czekinah Tolentino</a> for FTW Foundation`;
markDay(); save(); checkBadges(); renderHud();
show((location.hash || "").replace("#", "") || state.tab || "home");
})();
