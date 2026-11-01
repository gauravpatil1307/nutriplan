"use strict";
/*
  NutriPlan app logic
  Created by Gaurav Patil. © 2026 Gaurav Patil. All rights reserved.
  Foods, settings and affiliate links live in data.js.
*/

/* ============ 2. HELPERS ============ */
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const fmt = (n) => Math.round(n * 10) / 10;
// Builds elements with textContent only, so user input can never inject HTML.
function el(tag, cls, text, kids) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  (kids || []).forEach((k) => e.append(k));
  return e;
}
const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem("nutriplan:" + k);
      return v ? JSON.parse(v) : d;
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem("nutriplan:" + k, JSON.stringify(v));
    } catch (e) {
      /* storage unavailable */
    }
  },
};

/* ============ 3. CALCULATIONS (pure functions, no DOM) ============ */
function calculate(p) {
  const sq = (p.h / 100) ** 2;
  const lo = 18.5 * sq,
    hi = 24.9 * sq,
    ideal = 22 * sq; // healthy BMI range, optimal = BMI 22
  const goal = p.goal || ideal,
    diff = goal - p.w;
  const mode = Math.abs(diff) < 0.5 ? "maintain" : diff < 0 ? "lose" : "gain";
  const tdee =
    (10 * p.w + 6.25 * p.h - 5 * p.age + (p.sex === "m" ? 5 : -161)) * p.act; // Mifflin–St Jeor × activity
  const change = Math.min(p.pace * 1100, 1000); // 1 kg ≈ 7700 kcal
  const raw =
    mode === "lose" ? tdee - change : mode === "gain" ? tdee + change : tdee;
  const floor = p.sex === "m" ? 1500 : 1200; // never go below a safe minimum
  const target = Math.round(Math.max(raw, floor) / 10) * 10;
  const gap = mode === "lose" ? tdee - target : target - tdee;
  const weeks =
    mode === "maintain" || gap < 100
      ? 0
      : Math.ceil((Math.abs(diff) * 1100) / gap);
  const pro = Math.min(1.6 * goal, (0.3 * target) / 4),
    fat = (0.25 * target) / 9;
  const bmi = p.w / sq;
  return {
    lo,
    hi,
    ideal,
    goal,
    mode,
    target,
    weeks,
    bmi,
    floored: raw < floor,
    bmiLabel:
      bmi < 18.5
        ? "Underweight"
        : bmi < 25
          ? "Healthy"
          : bmi < 30
            ? "Overweight"
            : "Obese",
    macros: [
      ["Protein", pro, 4],
      ["Carbs", (target - pro * 4 - fat * 9) / 4, 4],
      ["Fat", fat, 9],
    ],
  };
}
const allowed = (f) =>
  f[4] <= S.diet && !f[5].split(",").some((a) => S.allergies.includes(a));
const pick = (arr, n) =>
  arr
    .map((v) => [Math.random(), v])
    .sort((a, b) => a[0] - b[0])
    .slice(0, n)
    .map((x) => x[1]);

/* ============ 4. STATE ============ */
let S = null; // the person's profile
let C = null; // calculated results
let log = []; // today's eaten foods
let P = []; // meals currently shown in the plan (used by Share and PDF)
const todayKey = () => new Date().toLocaleDateString("en-CA");
const saveLog = () => store.set("log", { date: todayKey(), items: log });
function loadLog() {
  const d = store.get("log", {});
  log =
    d.date === todayKey() && Array.isArray(d.items)
      ? d.items.map((x) => ({
          n: String(x.n).slice(0, 40),
          k: Number(x.k) || 0,
        }))
      : [];
}

/* ============ 5. RENDERING ============ */
function refresh() {
  C = calculate(S);
  renderStats();
  renderMacros();
  renderPlan();
  renderTracker();
}

function renderStats() {
  const stat = (l, v, s) =>
    el("div", "card stat", null, [
      el("small", null, l),
      el("strong", null, v),
      el("span", null, s),
    ]);
  $("#stats").replaceChildren(
    stat("BMI", fmt(C.bmi), C.bmiLabel),
    stat(
      "Optimal weight",
      fmt(C.ideal) + " kg",
      "Healthy range " + fmt(C.lo) + "–" + fmt(C.hi) + " kg",
    ),
    stat(
      "Daily calories",
      C.target + " kcal",
      {
        lose: "to lose weight",
        gain: "to gain weight",
        maintain: "to maintain weight",
      }[C.mode],
    ),
    stat(
      "Time to goal",
      C.mode === "maintain"
        ? "Maintain"
        : C.weeks
          ? "≈ " + C.weeks + " weeks"
          : "–",
      "Goal: " + fmt(C.goal) + " kg",
    ),
  );
  $("#goalText").textContent =
    "Your optimal weight is " +
    fmt(C.ideal) +
    " kg. Want a different target? Enter it below. Leave it empty to use the optimal weight.";
  $("#goal").placeholder = "Optimal: " + fmt(C.ideal) + " kg";
  $("#goal").value = S.goal || "";
  const notes = [];
  if (C.floored)
    notes.push(
      "Your calories were raised to a safe minimum, so reaching your goal may take longer.",
    );
  if (C.goal < C.lo)
    notes.push(
      "Your goal weight is below the healthy range for your height. Please speak to a doctor or dietitian first.",
    );
  $("#notes").replaceChildren(...notes.map((t) => el("div", "note", t)));
}

function renderMacros() {
  $("#macros").replaceChildren(
    el("h2", null, "Daily macros"),
    ...C.macros.map(([n, g, k]) => {
      const pct = Math.round(((g * k) / C.target) * 100),
        i = el("i");
      i.style.width = pct + "%";
      return el("div", "mac", null, [
        el(
          "span",
          null,
          n + ": " + Math.round(g) + " g · " + pct + "% of calories",
        ),
        el("div", "bar", null, [i]),
      ]);
    }),
  );
}

function renderPlan() {
  const btn = (cls, text, fn) => {
    const b = el("button", cls, text);
    b.onclick = fn;
    return b;
  };
  const actions = el("div", "actions", null, [
    btn("btn", "🔀 Shuffle ideas", renderPlan),
    btn("btn alt", "📤 Share", sharePlan),
    btn("btn alt", "📄 Download PDF", downloadPDF),
  ]);
  P = [];
  const cards = MEALS.map(([name, key, share, icon]) => {
    const kcal = Math.round(C.target * share),
      meal = { name, kcal, items: [] };
    P.push(meal);
    const items = pick(
      FOODS.filter((f) => f[0] === key && allowed(f)),
      3,
    ).map((f) => {
      const qty = Math.max(0.5, Math.round((kcal / f[3]) * 2) / 2),
        cal = Math.round(qty * f[3]);
      meal.items.push({
        n: f[1],
        q: (qty === 1 ? "" : qty + " × ") + f[2],
        k: cal,
      });
      const add = el("button", "x", "+");
      add.title = "Add to today’s log";
      add.setAttribute("aria-label", "Log " + f[1]);
      add.onclick = () => {
        addLog(f[1], cal);
        add.textContent = "✓";
        setTimeout(() => {
          add.textContent = "+";
        }, 1200);
      };
      return el("li", null, null, [
        el("div", null, null, [
          el("b", null, f[1]),
          el(
            "small",
            null,
            (qty === 1 ? "" : qty + " × ") + f[2] + " · ≈ " + cal + " kcal",
          ),
        ]),
        add,
      ]);
    });
    return el("div", "card", null, [
      el("div", "row", null, [
        el("h3", null, icon + " " + name),
        el("small", "muted", "≈ " + kcal + " kcal"),
      ]),
      items.length
        ? el("ul", null, null, items)
        : el("p", "muted", "No matching foods. Try removing an allergy."),
    ]);
  });
  $("#plan").replaceChildren(
    el("div", "row", null, [
      el("h2", null, "3 · Your daily meal plan"),
      actions,
    ]),
    el("div", "meals", null, cards),
  );
}

function renderTracker() {
  const eaten = log.reduce((s, x) => s + x.k, 0),
    left = C.target - eaten;
  $("#trkSummary").textContent =
    eaten +
    " of " +
    C.target +
    " kcal eaten · " +
    (left >= 0 ? left + " kcal left" : -left + " kcal over");
  const bar = $("#trkBar");
  bar.style.width = Math.min(100, (eaten / C.target) * 100) + "%";
  bar.classList.toggle("over", left < 0);
  $("#trkList").replaceChildren(
    ...log.map((x, i) => {
      const del = el("button", "x", "✕");
      del.setAttribute("aria-label", "Remove " + x.n);
      del.onclick = () => {
        log.splice(i, 1);
        saveLog();
        renderTracker();
      };
      return el("li", null, null, [
        el("span", null, x.n),
        el("span", null, x.k + " kcal"),
        del,
      ]);
    }),
  );
}

let toastTimer;
function toast(text, viewLog) {
  $("#toastText").textContent = text;
  $("#toastBtn").hidden = !viewLog;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3500);
}

function addLog(name, kcal) {
  log.push({ n: String(name).slice(0, 40), k: Math.round(kcal) });
  saveLog();
  renderTracker();
  const eaten = log.reduce((s, x) => s + x.k, 0);
  toast(
    "✓ Added " +
      String(name).slice(0, 40) +
      " · " +
      eaten +
      " of " +
      C.target +
      " kcal today",
    true,
  );
}

function renderTools() {
  const live = TOOLS.filter((t) => /^https:\/\//.test(t.link)); // https only, so a bad link can never run code
  $("#tools").hidden = !live.length;
  $("#affFooter").hidden = !live.length;
  $("#affFooter").textContent = DISCLOSURE;
  $("#disclosure").textContent =
    "Affiliate disclosure: " +
    DISCLOSURE +
    " Some links here are affiliate links, so I may earn a small commission at no extra cost to you. These tools do not change your meal plan.";
  $("#toolList").replaceChildren(
    ...live.map((t) => {
      const a = el("a", "tool", null, [
        el("b", null, t.icon + " " + t.name),
        el("small", null, t.why),
        el("span", null, "View product"),
      ]);
      a.href = t.link;
      a.target = "_blank";
      a.rel = "sponsored noopener noreferrer";
      return a;
    }),
  );
}

/* ============ 5b. SHARE & PDF (built on the device; only the meal plan, no personal details) ============ */
const GOAL_TEXT = {
  lose: "to lose weight",
  gain: "to gain weight",
  maintain: "to maintain weight",
};
const siteUrl = () =>
  /^https?:/.test(location.protocol) ? location.origin + location.pathname : "";
const macroText = () =>
  C.macros.map(([n, g]) => n + " " + Math.round(g) + " g").join(" · ");

function planText() {
  const lines = [
    "🥗 My NutriPlan daily meal plan",
    C.target + " kcal a day " + GOAL_TEXT[C.mode] + " · " + macroText(),
    "",
  ];
  P.forEach((m, i) => {
    lines.push(MEALS[i][3] + " " + m.name + " (≈ " + m.kcal + " kcal)");
    m.items.forEach((x) =>
      lines.push("• " + x.n + " – " + x.q + " · ≈ " + x.k + " kcal"),
    );
    if (!m.items.length) lines.push("• No matching foods");
    lines.push("");
  });
  lines.push(
    "Pick one option per meal. General guidance only, not medical advice.",
  );
  return lines.join("\n");
}

async function sharePlan() {
  const data = { title: "My NutriPlan meal plan", text: planText() },
    url = siteUrl();
  if (url) data.url = url;
  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(data.text + (url ? "\n" + url : ""));
    toast("✓ Meal plan copied – paste it anywhere to share");
  } catch (e) {
    toast("Sharing isn’t available in this browser");
  }
}

// Minimal A4 PDF writer using the built-in Helvetica fonts, so no external library is needed.
function makePDF(lines) {
  const W = 595,
    H = 842,
    M = 50,
    WIN = {
      "–": 150,
      "—": 151,
      "’": 146,
      "‘": 145,
      "“": 147,
      "”": 148,
      "•": 149,
      "…": 133,
      "≈": 126,
    };
  const enc = (t) =>
    [...t]
      .map((ch) => {
        const c = WIN[ch] || ch.charCodeAt(0);
        return c < 256 && ch.length === 1 ? String.fromCharCode(c) : "";
      })
      .join("")
      .trim()
      .replace(/[\\()]/g, "\\$&");
  const wrap = (t, size) => {
    // rough Helvetica width ≈ 0.5em per character
    const max = Math.floor((W - 2 * M - 20) / (size * 0.5)),
      out = [];
    let cur = "";
    t.split(" ").forEach((w) => {
      if (cur && (cur + " " + w).length > max) {
        out.push(cur);
        cur = w;
      } else cur = cur ? cur + " " + w : w;
    });
    return out.concat(cur);
  };
  const pages = [];
  let ops = null,
    y = 0;
  const newPage = () => {
    ops = [
      "0.078 0.639 0.498 rg 0 " + (H - 70) + " " + W + " 70 re f",
      "BT 1 1 1 rg /F2 22 Tf " +
        M +
        " " +
        (H - 45) +
        " Td (" +
        enc("NutriPlan") +
        ") Tj ET",
      "BT 1 1 1 rg /F1 10 Tf " +
        (W - M - 140) +
        " " +
        (H - 43) +
        " Td (" +
        enc(
          new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        ) +
        ") Tj ET",
    ];
    pages.push(ops);
    y = H - 105;
  };
  newPage();
  lines.forEach(
    ({ t, size = 11, bold, color = "0.11 0.14 0.19", gap = 6, indent = 0 }) => {
      wrap(t, size).forEach((part) => {
        if (y < M + size) newPage();
        ops.push(
          "BT " +
            color +
            " rg /F" +
            (bold ? 2 : 1) +
            " " +
            size +
            " Tf " +
            (M + indent) +
            " " +
            y +
            " Td (" +
            enc(part) +
            ") Tj ET",
        );
        y -= size + 4;
      });
      y -= gap;
    },
  );
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ];
  const kids = pages.map((p) => {
    const body = p.join("\n");
    objs.push(
      "<< /Length " + body.length + " >>\nstream\n" + body + "\nendstream",
    );
    objs.push(
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
        W +
        " " +
        H +
        "] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents " +
        objs.length +
        " 0 R >>",
    );
    return objs.length + " 0 R";
  });
  objs[1] =
    "<< /Type /Pages /Kids [" +
    kids.join(" ") +
    "] /Count " +
    kids.length +
    " >>";
  let pdf = "%PDF-1.4\n";
  const offs = objs.map((o, i) => {
    const at = pdf.length;
    pdf += i + 1 + " 0 obj\n" + o + "\nendobj\n";
    return at;
  });
  const xref = pdf.length;
  pdf +=
    "xref\n0 " +
    (objs.length + 1) +
    "\n0000000000 65535 f \n" +
    offs.map((o) => String(o).padStart(10, "0") + " 00000 n \n").join("");
  pdf +=
    "trailer\n<< /Size " +
    (objs.length + 1) +
    " /Root 1 0 R >>\nstartxref\n" +
    xref +
    "\n%%EOF";
  return new Blob([Uint8Array.from(pdf, (c) => c.charCodeAt(0))], {
    type: "application/pdf",
  });
}

function downloadPDF() {
  const muted = "0.4 0.44 0.52",
    brand = "0.078 0.639 0.498";
  const lines = [
    { t: "Your daily meal plan", size: 18, bold: true, gap: 4 },
    {
      t:
        C.target +
        " kcal a day " +
        GOAL_TEXT[C.mode] +
        " · Goal weight " +
        fmt(C.goal) +
        " kg",
      color: muted,
      gap: 2,
    },
    { t: "Daily macros: " + macroText(), color: muted, gap: 16 },
  ];
  P.forEach((m) => {
    lines.push({
      t: m.name + "   (≈ " + m.kcal + " kcal)",
      size: 14,
      bold: true,
      color: brand,
      gap: 2,
    });
    m.items.forEach((x) =>
      lines.push({
        t: "• " + x.n + " – " + x.q + " · ≈ " + x.k + " kcal",
        indent: 10,
        gap: 2,
      }),
    );
    if (!m.items.length)
      lines.push({
        t: "No matching foods. Try removing an allergy.",
        indent: 10,
        color: muted,
      });
    lines.push({ t: "", size: 6, gap: 8 });
  });
  lines.push({
    t: "Pick one option for each meal. Calories are approximate.",
    color: muted,
    size: 10,
    gap: 2,
  });
  lines.push({
    t: "NutriPlan gives general guidance and is not medical advice. Talk to a doctor or dietitian if you have a health condition or are pregnant. Always check food labels for allergens.",
    color: muted,
    size: 9,
    gap: 10,
  });
  lines.push({
    t:
      "Created by Gaurav Patil · © 2026 Gaurav Patil. All rights reserved." +
      (siteUrl() ? " · " + siteUrl() : ""),
    color: muted,
    size: 9,
  });
  const a = el("a");
  a.href = URL.createObjectURL(makePDF(lines));
  a.download = "nutriplan-meal-plan-" + todayKey() + ".pdf";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  toast("✓ Meal plan PDF downloaded");
}

/* ============ 6. EVENTS ============ */
function start() {
  const num = (id) => parseFloat($("#" + id).value);
  const p = {
    age: num("age"),
    h: num("h"),
    w: num("w"),
    sex: $("#sex").value,
    act: +$("#act").value,
    pace: +$("#pace").value,
    diet: +($("input[name=diet]:checked") || {}).value,
    allergies: $$("input[name=allergy]:checked").map((i) => i.value),
    goal: null,
  };
  const bad = Object.entries(LIMITS).find(
    ([k, [a, b]]) => !(p[k] >= a && p[k] <= b),
  );
  if (bad) {
    $("#err").textContent =
      bad[1][2] + " must be between " + bad[1][0] + " and " + bad[1][1] + ".";
    return;
  }
  if (Number.isNaN(p.diet)) {
    $("#err").textContent = "Please choose what you eat.";
    return;
  }
  $("#err").textContent = "";
  S = p;
  store.set("profile", S);
  loadLog();
  $("#result").hidden = false;
  refresh();
  $("#result").scrollIntoView({ behavior: "smooth" });
}

function setGoal() {
  const v = $("#goal").value.trim(),
    g = v ? parseFloat(v) : null;
  if (g !== null && !(g >= 30 && g <= 300)) {
    $("#goalErr").textContent = "Enter a goal between 30 and 300 kg.";
    return;
  }
  $("#goalErr").textContent = "";
  S.goal = g;
  store.set("profile", S);
  refresh();
}

function addCustom() {
  const n = $("#fName").value.trim(),
    k = parseFloat($("#fKcal").value);
  if (!n || !(k > 0 && k <= 3000)) {
    $("#fErr").textContent = "Enter a food name and calories (1–3000).";
    return;
  }
  $("#fErr").textContent = "";
  addLog(n, k);
  $("#fName").value = "";
  $("#fKcal").value = "";
}

function restore(p) {
  ["age", "h", "w", "sex"].forEach((k) => {
    $("#" + k).value = p[k];
  });
  $("#act").value = p.act;
  $("#pace").value = p.pace;
  $$("input[name=diet]").forEach((i) => {
    i.checked = +i.value === p.diet;
  });
  $$("input[name=allergy]").forEach((i) => {
    i.checked = p.allergies.includes(i.value);
  });
}

/* ============ 7. START-UP ============ */
function chips(box, name, type, items) {
  $(box).replaceChildren(
    ...items.map(([v, t]) => {
      const i = el("input");
      i.type = type;
      i.name = name;
      i.value = v;
      return el("label", "chip", null, [i, el("span", null, t)]);
    }),
  );
}
chips(
  "#diets",
  "diet",
  "radio",
  DIETS.map((t, i) => [i, t]),
);
chips("#allergies", "allergy", "checkbox", ALLERGENS);
$("#act").replaceChildren(
  ...ACTIVITY.map(([t, v], i) => new Option(t, v, false, i === 1)),
);
$("#pace").replaceChildren(
  ...PACE.map(([t, v], i) => new Option(t, v, false, i === 1)),
);

$("#go").onclick = start;
$("#setGoal").onclick = setGoal;
$("#addBtn").onclick = addCustom;
$("#clearBtn").onclick = () => {
  log = [];
  saveLog();
  renderTracker();
};
$("#toastBtn").onclick = () =>
  $("#tracker").scrollIntoView({ behavior: "smooth" });
$("#termsLink").onclick = () => {
  $("#legalTerms").open = true;
  $("#legal").scrollIntoView({ behavior: "smooth" });
};
$("#wipe").onclick = (e) => {
  const b = e.target;
  if (b.dataset.sure !== "1") {
    b.dataset.sure = "1";
    b.textContent = "Click again to confirm";
    return;
  }
  try {
    localStorage.removeItem("nutriplan:profile");
    localStorage.removeItem("nutriplan:log");
  } catch (err) {
    /* storage unavailable */
  }
  S = null;
  log = [];
  $("#result").hidden = true;
  $$(
    "input[type=number],input[type=text],input[type=radio],input[type=checkbox]",
  ).forEach((i) => {
    i.value = i.type === "radio" || i.type === "checkbox" ? i.value : "";
    i.checked = false;
  });
  b.dataset.sure = "";
  b.textContent = "✓ Saved data deleted";
  window.scrollTo({ top: 0, behavior: "smooth" });
};
// Pressing Enter in a field clicks that section's main button
$$("input[type=number],input[type=text]").forEach((i) => {
  i.onkeydown = (e) => {
    if (e.key === "Enter") i.closest("section").querySelector(".btn").click();
  };
});

renderTools();

const saved = store.get("profile", null);
if (saved && Array.isArray(saved.allergies) && saved.h) {
  S = saved;
  restore(S);
  loadLog();
  $("#result").hidden = false;
  refresh();
}
