// scripts/journey-scale-r17-20261021.js — journey leg SCALE (days 80–140) R17:
// THE TABLE APPROACH. r16 reached a lesser seat + announce on 5/10 seeds —
// and in every one, tableWaiting stayed true and nobody ever sat. The
// journey-scale harness never takes the seat, so the announce → seat-take →
// pricing audit → 7-door offer sequence is entirely unplayed in journey sims.
// This run plays the approach and stops at the doors (path play is lane B).
//
// PRE-REGISTER (2026-10-21, MEASUREMENT.md sections 9-12, 14):
//   Leg question: after the table is announced on the national belong road,
//   what does the table approach really play — "THE TABLE IS SET" → seat-take
//   from Haven → tableScene's pricing audit → the 7-door offer: does every
//   beat stage aloud, is the audit honest about the seat and the run, are
//   earned/unearned doors shown and priced (never hidden), and is any part
//   a trap, a silent flip, or unfireable?
//   Driver: when tableAnnounced && !tableDone, the competent player sits —
//   the harness calls tableTakeSeat() daily until it commits (tableDone),
//   capturing preview, scene text, the audit line, and the door offer from
//   scholar.tableChoices. The 7-door modal is left OPEN (a player reading
//   the offer); path entry is lane B's domain and is not touched.
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     M1 staging — the table is announced (tableAnnounced) on >=2/4 pilot
//       seeds (substrate established: r16 reached announce on 5/10 with this
//       policy). A seed that never announces is replaced, never a miss.
//     M2 the approach fires aloud — on every announced, alive-at-d90+ seed:
//       the competent seat-take commits (tableDone=true), the scene's spoken
//       text is captured (set + audit + door offer), and every audit number
//       is state-verified against the seat detail (copy is never trusted).
//       NO-GO if the seat takes silently or any audit number != state. The
//       door offer must show unearned doors priced (never hidden).
//     M3 people — >=4 full transcripts sense-read (announce day, sitting day,
//       two ordinary scale days), 0 senseless flags.
//     M4 survival — >=2/4 reach d120 (death-aware; dead/scattered stops).
//     M5 instrument-honesty — tablePreview() is a pure read: two consecutive
//       calls return deep-equal results with no progState mutation between
//       them (r1 instrument-honesty, the havenViewership() lesson).
//   Interesting-finding bar: the real table-approach ledger — what the scene
//   stages and when; which doors a lesser-seat run earns and what the
//   unearned ones cost; whether the overtime clock's announce-origin changes
//   the price by waiting; any silent flip (a seat that takes with no text, a
//   withdrawal without the beat, an unearned door hidden); any unfireable
//   beat in the approach.
//   Horizon: DAYCAP=185 loop-days, death-aware stop (+10d tail max).
//   PILOT FIRST: 4 seeds 17001-17004 (fresh, disjoint from r9-r16).
//   Policy: belongseek + feast layer (FEASTSCALE_R13=1; r16's proven staging
//   instrument). The Binding answered 'swear'; the Watchers answered 'feast'.
//   Telemetry: compare against the belong-shaped baseline
//   (telemetry-baselines/scale-belong.json), same as r14/r15/r16.
// Usage: SEEDS=17001,17002 node scripts/journey-scale-r17-20261021.js
//   R15_WATCHERS_ANSWER=feast (r15's env name kept; feast is the default).
//   R15_FEAST=1|0 (default: 1) — feast layer on/off.
//   R14_BINDING_ANSWER=swear|serve|walk (default: swear).

'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [17001, 17002, 17003, 17004]);
const DAYCAP = parseInt(process.env.DAYCAP || '185', 10);

const { mulberry32, loadGame, setupGame, runDays, driveFights, driveContests } = require('./sim-harness');
// BELONG_V3 is read at require time in belongseek.js (2026-10-12 v3:
// exile-aware switch + score-gated break; the r4 whole-run policy).
process.env.BELONG_V3 = '1';
const { belongseek } = require('./policies/belongseek');
const { belongfeast } = require('./policies/feastscale');
// R15: the feast layer (r13's proven viewership instrument — 7/8 lesser
// seats on the belong road; the Watchers needs viewership >= 32).
// R15_FEAST=1 default ON. FEASTSCALE_R13 is read dynamically by layerOn().
const R15_FEAST = process.env.R15_FEAST === '0' ? '0' : '1';
if (R15_FEAST === '1') process.env.FEASTSCALE_R13 = '1';
// R14 blank-fill probe (r13's named-next): R14_BINDING_ANSWER selects the
// harness's answer at The Binding. All arms are unlayered belongseek — the
// walk/serve paths are engine-side, so no layer is needed. The POLICY name
// carries the answer for evidence namespacing (r10's policy-name lesson).
const R14_BINDING_ANSWER = (process.env.R14_BINDING_ANSWER || 'swear').toLowerCase();
if (!['swear', 'serve', 'walk'].includes(R14_BINDING_ANSWER)) {
  throw new Error('R14_BINDING_ANSWER must be swear|serve|walk, got: ' + process.env.R14_BINDING_ANSWER);
}
const R15_WATCHERS_ANSWER = (process.env.R15_WATCHERS_ANSWER || 'feast').toLowerCase();
if (!['feast', 'champion', 'decline'].includes(R15_WATCHERS_ANSWER)) {
  throw new Error('R15_WATCHERS_ANSWER must be feast|champion|decline, got: ' + process.env.R15_WATCHERS_ANSWER);
}
const POLICY = (R15_FEAST === '1' ? 'belongfeast' : 'belongseek') + '-watch' + R15_WATCHERS_ANSWER;
const BASE = R15_FEAST === '1' ? belongfeast : belongseek;

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-21');

// ---- per-seed globals (reset per seed) ----
let capture = [];
let _currentSeed = null;
let _G = null;
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}

// wave of a monster id
function waveOf(mid) {
  try {
    const d = (_G.data.monsters || []).find(m => m.id === mid);
    return (d && d.wave) || 1;
  } catch (e) { return 1; }
}
function monsterDisplay(mid) {
  try {
    const d = (_G.data.monsters || []).find(m => m.id === mid);
    return (d && (d.displayName || d.name)) || mid;
  } catch (e) { return mid; }
}
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }
function scaleNow() { try { return _G.scaleRank ? _G.scaleRank() : null; } catch (e) { return null; } }
function pantryKcal() {
  try {
    return ((_G.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
function waveEngaged(w) { try { return _G.waveEngaged ? _G.waveEngaged(w) : 0; } catch (e) { return 0; } }

// ---- scale-window instruments (r1) ----
function scaleSnap() {
  const gd = gday();
  let links = [];
  try {
    links = (_G.hierarchyState() || []).map(l => {
      const other = (l.primary === 'haven' ? l.subordinate : l.primary) || (l.a === 'haven' ? l.b : l.a) || '?';
      // R2 (2026-10-16): record link DIRECTION — r1's 8307 and r2's 8402
      // both held 3 seasoned links without staging national, and the
      // census couldn't tell primary from subordinate. The LEAD bar needs
      // Haven primary-of-3; subordinate-shaped courtship is a different road.
      const dir = (l.primary === 'haven') ? 'primary' : (l.subordinate === 'haven') ? 'subordinate' : (l.kind === 'covenant' || l.kind === 'trade') ? 'peer' : '?';
      const age = gd - (l.day || 0);
      return { id: String(l.id).slice(-6), kind: l.kind || 'hier', other, dir, status: l.status,
               trust: Math.round(l.trust || 0), age, arrears: l.arrears || 0,
               seasoned: age >= 30 && (l.trust || 0) >= 40 };
    });
  } catch (e) {}
  let viewership = null, tableSeat = null, deedGate = null, nationalLive = false, globalLive = false, scaleRefused = false;
  // R1 INSTRUMENT-HONESTY FIX (2026-10-15): havenViewership() is NOT a pure
  // read — it LAZILY INITIALIZES state.village.viewership on first call (base
  // = arc*5 + showmanship + codex breadth, floored at 12). Calling it from the
  // harness daily contaminated the run: v.viewership went 12 from day 1
  // instead of null-until-engine-init, lifting contest eligibility
  // (contests.js reads havenViewership||0; the show-is-watching threshold is
  // 12) and flipping trajectories (8301: d98 village-lost -> d142 global).
  // The honest read is the engine's own slot WITHOUT the call: null until the
  // engine itself initializes it.
  try { const vv = (((_G.state || {}).village || {}).viewership); viewership = (vv == null ? null : Math.round(vv)); } catch (e) {}
  try { tableSeat = ((_G.tableSeat ? _G.tableSeat() : null) || {}).seat || null; } catch (e) {}
  try { deedGate = !!(_G.deedGateReady && _G.deedGateReady()); } catch (e) {}
  try { nationalLive = !!_G.state.nationalLive; globalLive = !!_G.state.globalLive; scaleRefused = !!_G.state.scaleRefused; } catch (e) {}
  let pendingNational = null, pendingGlobal = null;
  try { pendingNational = _G.state.pendingNational ? _G.state.pendingNational.shape : null; } catch (e) {}
  try { pendingGlobal = !!_G.state.pendingGlobal; } catch (e) {}
  return { day: gd, scale: scaleNow(), nationalLive, globalLive, scaleRefused,
           viewership, tableSeat, deedGate, pendingNational, pendingGlobal, links };
}
// ---- TABLE-AUDIT INSTRUMENT (r10): the Arc IV seat bar, read honestly ----
// Pure reads (no gameplay effect). Tracks the lesser-seat sub-gates
// (table.js tableSeat: w1/w2/w3 distinct faced, contests, crises, scale,
// stage, food deeds) + the full-seat gate (deedGateReady) + the arc and
// the announce flags, daily, so the binding gate can be named per seed.
function tableAuditSnap() {
  const gd = gday();
  const out = { day: gd };
  try {
    const pg = (_G.progState ? _G.progState() : {}) || {};
    out.arc = pg.arc || 1;
    out.tableWaiting = !!pg.tableWaiting;
    out.tableAnnounced = !!pg.tableAnnounced;
    out.tableDone = !!pg.tableDone;
    out.sentimentTaught = !!pg.sentimentTaught;
    out.crisesN = Object.keys(pg.crises || {}).length;
    out.crises = Object.keys(pg.crises || {});
    try { const seat = _G.tableSeat ? _G.tableSeat() : null; out.seat = (seat && seat.seat) || 'none'; out.seatDetail = (seat && seat.detail) || null; } catch (e) { out.seat = 'none'; }
    try { const dg = _G.deedGateReady ? _G.deedGateReady() : null; out.deedOk = !!(dg && dg.ok); out.deedDetail = dg || null; } catch (e) {}
    try { const d = _G.deedState ? _G.deedState() : {}; out.contestsSurvived = d.contestsSurvived || 0; } catch (e) {}
    try { out.stage = _G.integrationStage ? _G.integrationStage() : 0; } catch (e) {}
    try { const sch = (_G.state || {}).scholar || {}; out.feastSurgeUsed = !!(sch.prog && sch.prog.feastSurgeUsed); } catch (e) {}
    try { out.dayFloorOk = !!(_G.winDayFloorOk ? _G.winDayFloorOk() : true); } catch (e) {}
    try { out.scaleRank = _G.scaleRank ? _G.scaleRank() : null; } catch (e) {}
  } catch (e) { out.err = String(e && e.message); }
  return out;
}
const SCALE_MARKERS = {
  national: ['national'], tribute: ['tribute'],
  // SHAPE-AWARE BEATS (r6 metric review revision): per-shape staging counts,
  // not the LEAD-shaped markerCounts.firstCourt.
  firstCourt: ['first court'], ironCourt: ['iron court', 'the yoke', 'yoke eases', 'opens the cages'],
  foundingCouncil: ['founding council'], theCharter: ['the charter'], theBinding: ['the binding'],
  binding: ['binding', 'swear the oath'], watchers: ['watcher'], table: ['the table', 'lesser seat', 'being set', 'reschedule', 'ninety days', 'come back when the village'],
  // R17: the table approach — announce, audit, door offer
  tableApproach: ['TABLE IS SET', 'it is not a table', 'THE AUDIT', 'seven doors',
    'walk the path of', 'the ring waits', 'the ring of pale light'],
  polityDissolve: ['dissolves', 'realm dissolves', 'realm came apart'],
  // R6: conquest-road mechanics (copy grounded in src/js/hierarchy.js)
  raid: ['war party musters', 'burns, and then it kneels', 'chooses the tribute over the pyre',
         'The war party stands down', 'Taken by force', 'under duress'],
  revolt: ['thrown off', 'revolt', 'sabotage', 'lost on the road'],
  duressTribute: ['7,000 kcal', '5,000 kcal/week'],
};
function waveLedgerPoints(w) { try { return _G.waveLedgerPoints ? (_G.waveLedgerPoints(w) | 0) : 0; } catch (e) { return 0; } }

// knowledge-economy markers (r7): experiment beats, trader deepening, moots
const KNOW_MARKERS = {
  experiment: ['spends the afternoon with the'],
  traderDeep: ['knows it deep enough to teach'],
  moot: ["There's going to be a moot", ' convenes a moot', 'The village gathers', 'moot'],
};

// signature-mechanic markers for wave-3 monsters (r2 list)
const SIG_MARKERS = {
  spool: ['reel', 'RECORD', 'REPLAY', 'the tape'],
  terms_of_service: ['clause', 'fine print', '§0', 'termination'],
  redactor: ['REDACT', 'redact'],
  callback: ['funeral', 'goodbye', 'NOT '],
  buffering: ['afterimage', 'will step', '3 seconds'],
  ad_break: ['ad break', 'SKIP', 'sponsor'],
  chorus_line: ['downbeat', '4/4'],
  focus_group: ['LOVED', 'HATED', 'murmur'],
  gavel: ['trial', 'verdict', 'ACCUS', 'OBJECT'],
};

// ---- goInside (r2 fix): travelTo leaves the scholar outside the hall ----
function goInside() {
  try {
    const t = _G.playerTile ? _G.playerTile() : null;
    if (t && t.type === 'haven') {
      const s = _G.state.scholar;
      if (s && !s.insideHaven && !s.insideTent && _G.enterBuilding) _G.enterBuilding();
    }
  } catch (e) {}
}

// ---- leg extensions (from r2) ----
function gearUp(ctx) {
  try {
    if ((ctx._gearDay || 0) === gday()) return;
    ctx._gearDay = gday();
    const inv = _G.state.scholar.inventory || [];
    const defs = _G.data.items || [];
    const defOf = (it) => defs.find(d => d.id === (it.itemId || it.id));
    let best = -1, bestBonus = -999, bestSlot = 'melee';
    inv.forEach((it, i) => {
      const d = defOf(it); if (!d || d.class !== 'weapon') return;
      const w = d.weapon || {};
      const b = w.bonus || 0;
      if (b > bestBonus) { bestBonus = b; best = i; bestSlot = (w.range > 1 || /bow|sling/i.test(w.type || '')) ? 'ranged' : 'melee'; }
    });
    if (best >= 0) {
      const eq = _G.state.scholar.equipped || {};
      const cur = eq[bestSlot];
      const curId = cur && (cur.itemId || cur.id);
      const it = inv[best];
      const bestId = it.itemId || it.id;
      if (curId !== bestId) {
        try { _G.equip(best, bestSlot); ctx.geared = (ctx.geared || 0) + 1; } catch (e) {}
      }
    }
    try { _G.craft('fire_hardened_spear'); } catch (e) {}
    try {
      const worn = new Set(Object.values(_G.state.scholar.equipped || {}).map(e => e && (e.itemId || e.id)));
      for (let i = 0; i < inv.length; i++) {
        const d = defOf(inv[i]); if (!d || !d.armor) continue;
        const id = inv[i].itemId || inv[i].id;
        if (worn.has(id)) continue;
        try { _G.equip(i, 'armor'); ctx.armored = (ctx.armored || 0) + 1; break; } catch (e) {}
      }
    } catch (e) {}
  } catch (e) {}
}

function regionalPlay(ctx) {
  const allowPropose = false; // warcourt owns the war road; harness only answers beats
  const day = gday();
  const reg = ctx.regionalLog;
  const note = (ev) => reg.push(Object.assign({ day }, ev));
  try {
    const st = _G.state;
    if (st.pendingCounter) {
      try { _G.answerCounter('accept'); note({ ev: 'counter', how: 'accept' }); } catch (e) { note({ ev: 'counter', how: 'accept', err: String(e && e.message) }); }
    }
    if (st.pendingAccord) {
      const cap0 = capture.length;
      try { _G.answerAccord('gift'); note({ ev: 'accord', how: 'gift', scale: scaleNow() }); } catch (e) { note({ ev: 'accord', how: 'gift', err: String(e && e.message) }); }
      note({ ev: 'accord-text', lines: capture.slice(cap0, cap0 + 6) });
    }
    // R6: the warcourt policy owns the conquest beat (per-seed IRONCOURT_ANSWER).
    // The harness only answers non-conquest beats as a backstop.
    if (st.pendingNational && st.pendingNational.shape !== 'conquest') {
      const shape = st.pendingNational.shape;
      // R14: the walk/serve probe overrides the belong pick. All other
      // shapes keep r13's backstop picks.
      const pick = { lead: 'feast', belong: R14_BINDING_ANSWER, covenant: 'pact', trade: 'sign' }[shape] || 'feast';
      try { _G.answerNationalChoice(pick); note({ ev: 'national', shape, how: pick, scale: scaleNow() }); } catch (e) { note({ ev: 'national', shape, how: pick, err: String(e && e.message) }); }
    }
    if (st.pendingGlobal) {
      // R15: the Watchers probe — champion/decline unexercised on the tip.
      try { _G.answerGlobalChoice(R15_WATCHERS_ANSWER); note({ ev: 'global', how: R15_WATCHERS_ANSWER, scale: scaleNow() }); } catch (e) { note({ ev: 'global', how: R15_WATCHERS_ANSWER, err: String(e && e.message) }); }
    }
    if (st.pendingSwitchboard) {
      try {
        const cands = _G.switchboardCandidates ? _G.switchboardCandidates() : [];
        if (cands.length && _G.appointSwitchboard) { _G.appointSwitchboard(cands[0].id); note({ ev: 'switchboard', who: cands[0].id }); }
      } catch (e) { note({ ev: 'switchboard', err: String(e && e.message) }); }
    }
    let links = [];
    try { links = _G.hierarchyState() || []; } catch (e) {}
    for (const link of links) {
      if (!link || link.status !== 'active' || link.subordinate !== 'haven') continue;
      if (link.pendingDemand) {
        const rich = pantryKcal() > 12000;
        try { _G.answerDemand(link.id, rich); note({ ev: 'demand', link: link.id, how: rich ? 'honor' : 'refuse' }); }
        catch (e) { note({ ev: 'demand', link: link.id, err: String(e && e.message) }); }
      }
      const week = (_G._week ? _G._week() : 0);
      if (link.tributePaidWeek !== week && pantryKcal() > 15000) {
        try { const paid = _G.payTribute(link.id); note({ ev: 'tribute', link: link.id, paid }); }
        catch (e) { note({ ev: 'tribute', link: link.id, err: String(e && e.message) }); }
      }
    }
    if (allowPropose && day >= 25 && !st.pendingCounter && !st.pendingAccord && pantryKcal() > 12000) {
      const hasActive = links.some(l => l && l.status === 'active');
      if (!hasActive) {
        const ovs = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && _G.knowsVillage(v) && !_G.linkWith(v.id));
        if (ovs.length) {
          const t = ovs[0];
          ctx._propCool = ctx._propCool || {};
          if ((ctx._propCool[t.id] || 0) + 7 <= day) {
            ctx._propCool[t.id] = day;
            try {
              const r = _G.proposeLink(t.id);
              note({ ev: 'propose', target: t.id, name: t.name, result: r == null ? 'declined' : (r === 'counter' ? 'counter' : 'linked') });
            } catch (e) { note({ ev: 'propose', target: t.id, err: String(e && e.message) }); }
          }
        }
      }
    }
  } catch (e) {}
}

// ---- R17: THE TABLE APPROACH (competent player sits when the table is set) ----
// tablePreview()/tableTakeSeat() are the Haven-panel actions driven directly
// (node has no app.js). The 7-door modal is read via scholar.tableChoices;
// path entry (chooseTableOption) is NOT touched — lane B's domain.
function stampTableAnnounce(ctx) {
  try {
    const pg = (_G.progState ? _G.progState() : {}) || {};
    if (!ctx.tableAnnounceDay && pg.tableAnnounced) {
      ctx.tableAnnounceDay = gday();
      // R17b: the announce fires in the dawn wrap, before daily — the -12
      // slice missed it on all 4 pilot seeds (dawn news > 12 lines). Widen.
      ctx.tableAnnounceText = capture.slice(-40)
        .filter(x => /TABLE IS SET|table is being set/i.test(String(x)))
        .map(String).slice(0, 6);
    }
  } catch (e) {}
}
function driveTableApproach(ctx) {
  const tlog = (ctx.tableApproach = ctx.tableApproach || []);
  try {
    const pg = (_G.progState ? _G.progState() : {}) || {};
    if (!pg.tableAnnounced || pg.tableDone) return;
    const day = gday();
    if (ctx._taDrvDay === day) return; ctx._taDrvDay = day;
    let pv = null;
    try { pv = _G.tablePreview ? _G.tablePreview() : null; }
    catch (e) { tlog.push({ day, ev: 'preview-err', err: String(e && e.message) }); return; }
    if (!pv) {
      let floor = null;
      try { floor = !!(_G.winDayFloorOk && _G.winDayFloorOk()); } catch (e) {}
      tlog.push({ day, ev: 'preview-null', waiting: !!pg.tableWaiting, dayFloor: floor });
      return;
    }
    const rec = { day, ev: 'preview', seat: pv.seat, doors: pv.doors || [],
      ready: !!pv.ready, why: pv.why || null,
      overtime: pv.overtime || 0, standingCost: pv.standingCost || 0,
      losses: pv.losses || 0, key: !!pv.key };
    // M5 instrument-honesty: preview must be a pure read — two consecutive
    // calls deep-equal, no progState mutation between them.
    try {
      const before = JSON.stringify(_G.progState());
      const pv2 = _G.tablePreview();
      const after = JSON.stringify(_G.progState());
      rec.pure = JSON.stringify(pv) === JSON.stringify(pv2);
      rec.progMutated = before !== after;
    } catch (e2) { rec.pureErr = String(e2 && e2.message); }
    tlog.push(rec);
    if (!pv.ready) return; // blocked aloud (contest, combat, access) — retry next day
    // Competent player: go sit. Capture the scene + audit + doors.
    const cap0 = capture.length;
    let res = null, takeErr = null;
    try { res = _G.tableTakeSeat(); }
    catch (e3) { takeErr = String(e3 && e3.message); }
    let seatNow = null, pg2 = {};
    try { pg2 = _G.progState ? _G.progState() : {}; } catch (e) {}
    try { seatNow = (((typeof _G.tableSeat === 'function') ? _G.tableSeat() : null) || {}).seat || null; } catch (e4) {}
    const scene = capture.slice(cap0)
      .filter(x => /table|audit|doors|ring|watch|sitting|priced/i.test(String(x)));
    // The audit line (copy) vs the seat detail (state) — verified in analysis.
    let auditLine = null;
    for (const s of scene.map(String)) {
      if (/lesser seat —|A full seat\./.test(s)) { auditLine = s; break; }
    }
    let detail = {};
    try { detail = (((typeof _G.tableSeat === 'function') ? _G.tableSeat() : null) || {}).detail || {}; } catch (e5) {}
    // The 7-door offer: the modal the live player sees.
    let doorOffer = null;
    try {
      const tc = ((_G.state || {}).scholar || {}).tableChoices || null;
      const T = (_G.tableState ? _G.tableState() : {}) || {};
      const paths = (_G.tableEarnedPaths ? _G.tableEarnedPaths() : []) || [];
      doorOffer = {
        phase: T.phase, path: T.path || null,
        promptHtml: tc ? String(tc.prompt || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 800) : null,
        options: tc ? (tc.options || []).map(o => ({ id: o.id, label: String(o.label).slice(0, 120) })) : [],
        earned: paths.filter(p => p.earned).map(p => ({ id: p.id, name: p.name, strength: p.strength || null })),
        priced: paths.filter(p => !p.earned).map(p => ({ id: p.id, name: p.name, why: String(p.why || '').slice(0, 200) })),
      };
    } catch (e6) { doorOffer = { err: String(e6 && e6.message) }; }
    tlog.push({ day, ev: 'take-seat',
      ok: !!(res && res.ok), msg: res ? res.msg : null, takeErr,
      tableDone: !!pg2.tableDone, seat: seatNow,
      sceneLines: scene.map(String).slice(0, 24),
      auditLine, auditDetail: detail, doorOffer });
  } catch (e) { tlog.push({ day: gday(), ev: 'driver-err', err: String(e && e.message) }); }
}

function knowledgePlay(ctx) {
  const day = gday();
  if ((ctx._btDay || 0) === day) return;
  ctx._btDay = day;
  if (day % 5 !== 0) return;
  try {
    const slain = _G.state.villageSlain || {};
    const known = _G.state.monsterCounters || {};
    for (const type of Object.keys(slain)) {
      if ((slain[type] || 0) >= 1 && !known[type]) { // r7: matches the 1+ counterTeachable lever (2026-10-11)
        const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
        const vid = roster.find(id => { try { return !_G.getPerson(id).dead; } catch (e) { return false; } });
        if (vid) {
          const r = _G.askAbout(vid, 'beasttricks');
          ctx.beasttricksTaught = (ctx.beasttricksTaught || 0) + ((r && r.taught) ? 1 : 0);
          ctx.beasttricksAsked = (ctx.beasttricksAsked || 0) + 1;
          break;
        }
      }
    }
  } catch (e) {}
}

// ---- fight driver (r2 deepening version): record every fight with wave ----
function finalizeFight(ctx) {
  const rec = ctx._fr;
  ctx._fr = null;
  if (!rec) return;
  try {
    const f = rec.obj;
    rec.rounds = f.round;
    rec.result = f.result;
    rec.over = !!f.over;
    rec.endHp = (f.fighters || []).map(x => ({ key: x.key, kind: x.kind, mid: x.monsterId || null, hp: Math.round(x.hp || 0), fled: !!x.fled }));
    const slice = capture.slice(rec.capStart).join('\n');
    rec.dmgLines = (slice.match(/\(\d+ damage\)/g) || []).length;
    rec.lines = slice.split('\n').filter(l => /damage|STRIKE|strikes|hits|miss|dodge|flee/i.test(l)).slice(0, 40);
    rec.sigHits = {};
    for (const m of rec.monsters) {
      const marks = SIG_MARKERS[m.mid] || [];
      const hits = marks.filter(mk => slice.toLowerCase().indexOf(mk.toLowerCase()) >= 0);
      if (hits.length) rec.sigHits[m.mid] = hits;
    }
    // wave tally for the r3 question
    for (const m of rec.monsters) {
      const w = m.wave || 1;
      ctx.fightsByWave = ctx.fightsByWave || {};
      ctx.fightsByWave[w] = (ctx.fightsByWave[w] || 0) + 1;
    }
    // W3DUMP: lead-up context for wave-3 fights (how did it reach the player?)
    if (process.env.W3DUMP && rec.monsters.some(m => (m.wave || 1) === 3)) {
      try {
        const pre = capture.slice(Math.max(0, rec.capStart - 80), rec.capStart).join('\n');
        fs.writeFileSync(`/tmp/journey-scale-r14-w3leadup-${_currentSeed}-day${rec.day}.txt`, pre + '\n\n===== FIGHT START =====\n' + capture.slice(rec.capStart, rec.capStart + 60).join('\n'));
      } catch (e) {}
    }
    // W3FULL: full fight text for wave-3 fights (r4 signature-mechanics honesty audit)
    // ALLFIGHTS=1: dump every fight (r4 stall investigation)
    if ((process.env.W3FULL && rec.monsters.some(m => (m.wave || 1) === 3)) || process.env.ALLFIGHTS) {
      try {
        const mids = rec.monsters.map(m => m.mid).join('-');
        let txt = capture.slice(rec.capStart).join('\n');
        if (txt.length > 500 * 1024) txt = txt.slice(0, 500 * 1024) + '\n[TRUNCATED at 500KB]';
        fs.writeFileSync(`/tmp/journey-scale-r14-fight-${_currentSeed}-day${rec.day}-${mids}.txt`, txt);
      } catch (e) {}
    }
    ctx.fightsLog.push(rec);
  } catch (e) {
    ctx.fightsLog.push({ id: rec.id, err: String(e && e.message), monsters: rec.monsters });
  }
}

// ---- policy: competent base + deepening leg extensions + r3 instrumentation ----
function makePolicy() {
  const policy = Object.create(BASE);
  policy.id = 'journey-scale-r17-' + POLICY;
  policy.setup = function (G, ctx) {
    BASE.setup(G, ctx);
    policy._ctx = ctx; // runDays doesn't return ctx; stash it here
    ctx.fightsLog = [];
    ctx.regionalLog = [];
    ctx.waveLog = [];
    ctx.deedLog = [];
    ctx._fr = null;
    ctx.lastWave = null;
    ctx.lastDeeds = {};
    ctx.convoFiles = [];
    ctx.probed = false;
    ctx.fightsByWave = {};
    ctx.contestCalls = 0;
    ctx.contestStuck = 0;
    ctx.scaleLog = [];
    ctx._nl = null;
    ctx._wasExiled = false;
    ctx.exileLog = [];
    // R7 KNOWLEDGE TELEMETRY (harness-only wraps; zero gameplay effect)
    ctx.counterEvents = [];      // {day, mid, via} — every discoverMonsterCounter
    ctx.combineFires = [];       // {day, pid} — every combineKnowledge call
    ctx.teachableDays = [];      // days when counterTeachable() was non-null
    ctx.traderDeepSnaps = [];    // traderDeep snapshot diffs at deed checkpoints
    try {
      const _dmc = G.discoverMonsterCounter;
      G.discoverMonsterCounter = function (mid, via) {
        const r = _dmc.apply(this, arguments);
        try { ctx.counterEvents.push({ day: gday(), mid, via: via || '?' }); } catch (e) {}
        return r;
      };
    } catch (e) {}
    try {
      const _ck = G.combineKnowledge;
      G.combineKnowledge = function (pid) {
        try { ctx.combineFires.push({ day: gday(), pid: String(pid) }); } catch (e2) {}
        return _ck.apply(this, arguments);
      };
    } catch (e) {}
    // R6: conquest war-verb telemetry (pure counters + logs; zero gameplay effect)
    ctx.conquestEvents = [];     // {day, verb, link, how, res}
    const _wrapCov = (name) => {
      try {
        const _f = G[name];
        if (typeof _f !== 'function') return;
        G[name] = function () {
          const r = _f.apply(this, arguments);
          try {
            ctx.conquestEvents.push({ day: gday(), verb: name,
              link: String(arguments[0] || '').slice(-8), how: String(arguments[1] || ''),
              res: r == null ? String(r) : String(r.id || r) });
          } catch (e2) {}
          return r;
        };
      } catch (e) {}
    };
    _wrapCov('raidVillage'); _wrapCov('answerRaid');
    _wrapCov('tendLink'); _wrapCov('answerNationalChoice');
    // R13: BELONG-road mechanics wraps (pure logs; zero gameplay effect) —
    // The Binding beat text (staging copy + answer copy), tribute weeks
    // (real food out, honest arrears), demands answered, consolidator
    // switches, the Watchers beat.
    ctx.belongLog = [];       // {day, verb, link, how, res, note}
    ctx.bindingDay = null; ctx.bindingBeatText = []; ctx.bindingAnswer = null;
    ctx.watchersDay = null; ctx.watchersBeatText = [];
    const _wrapBelong = (name, note) => {
      try {
        const _f = G[name];
        if (typeof _f !== 'function') return;
        G[name] = function () {
          const r = _f.apply(this, arguments);
          try {
            const rec = { day: gday(), verb: name,
              link: String(arguments[0] || '').slice(-8), how: String(arguments[1] || ''),
              res: r == null ? String(r) : (typeof r === 'object' ? JSON.stringify(r).slice(0, 200) : String(r)) };
            if (name === 'payTribute' && typeof r === 'number') rec.kcalPaid = r;
            if (note) rec.note = note;
            ctx.belongLog.push(rec);
          } catch (e2) {}
          return r;
        };
      } catch (e) {}
    };
    _wrapBelong('payTribute'); _wrapBelong('answerDemand');
    _wrapBelong('breakLink'); _wrapBelong('proposeLink', 'belongseek courtship verb');
    // The Binding beat: stamp the day + capture the beat's own spoken text.
    // R14: extended to state-verify the unexercised walk/serve consequences.
    // R14 probe fix: belongseek inherits scalecourt's national-beat answers,
    // which fire 'swear' inside the POLICY drive — before the harness's
    // backstop at line ~279 ever sees the beat. Substitute the probed answer
    // here (outer wrap) so the walk/serve engine paths actually fire, and
    // the stamp records the answer that really went through.
    try {
      const _anc = G.answerNationalChoice;
      if (typeof _anc === 'function') {
        G.answerNationalChoice = function (how) {
          let shape = 'unknown';
          try { shape = (G.state.pendingNational && G.state.pendingNational.shape) || 'unknown'; } catch (e2) {}
          if (shape === 'belong' && (R14_BINDING_ANSWER === 'serve' || R14_BINDING_ANSWER === 'walk')) {
            how = R14_BINDING_ANSWER;
          }
          const r = _anc.call(this, how);
          try {
            if (shape === 'belong') {
              ctx.bindingDay = gday();
              ctx.bindingAnswer = String(how);
              const tail = capture.slice(-160).filter(x => /the binding|swear the oath|oath|sealed with|kneels|their court|walks away|free fire|refuses the scale|rides to|seven days|no speaker to send|withdrawn — permanently/i.test(String(x)));
              ctx.bindingBeatText = tail.map(String).slice(-20);
              // R14 M2: state-verify the consequences the copy promises.
              let conseq = null;
              if (String(how) === 'walk') {
                let linkState = null;
                try { linkState = (G.hierarchyState() || []).map(l => ({ id: l.id, status: l.status, sub: l.subordinate })); } catch (e4) {}
                conseq = {
                  returnVal: r,
                  scaleRefused: !!(G.state && G.state.scaleRefused),
                  scaleRefusedShape: (G.state && G.state.scaleRefusedShape) || null,
                  scaleRefusedDay: (G.state && G.state.scaleRefusedDay) || null,
                  links: linkState,
                };
                ctx.walkResult = conseq;
              }
              if (String(how) === 'serve') {
                let loaned = null;
                try { const m = G.mshipState ? G.mshipState() : null; loaned = m && m.loaned ? JSON.parse(JSON.stringify(m.loaned)) : null; } catch (e4) {}
                conseq = {
                  returnVal: r,
                  loaned: loaned,
                  answerDay: ctx.bindingDay,
                  loanExpectedUntil: loaned ? loaned.untilDay : null,
                  loanVid: loaned ? loaned.vid : null,
                };
                ctx.serveResult = conseq;
              }
              // Accumulate every Binding (a realm can dissolve and re-form —
              // 14003 served twice); the last-one fields stay for compat.
              ctx.bindingLog = ctx.bindingLog || [];
              ctx.bindingLog.push({ day: ctx.bindingDay, answer: ctx.bindingAnswer, conseq: conseq });
            }
          } catch (e3) {}
          return r;
        };
      }
    } catch (e) {}
    // The Watchers beat: stamp + spoken text (r12).
    // R15 probe fix (r14 lesson): belongseek inherits scalecourt's global-beat
    // answer, which fires 'feast' inside BASE.daily — before the harness's
    // regionalPlay backstop ever sees the beat. Substitute the probed answer
    // here (outer wrap) so the champion/decline engine paths actually fire,
    // and the stamp records the answer that really went through.
    try {
      const _ag = G.answerGlobalChoice;
      if (typeof _ag === 'function') {
        G.answerGlobalChoice = function (how) {
          if (R15_WATCHERS_ANSWER === 'champion' || R15_WATCHERS_ANSWER === 'decline') {
            how = R15_WATCHERS_ANSWER;
          }
          // R16: feast honesty — pantry and viewership-slot reads around the
          // answer. pantryBefore/After use the raw pantry array (safe). The
          // viewership read is the raw slot ONLY (r1 instrument-honesty:
          // never call havenViewership() before the engine initializes it).
          var _feastBefore = null, _viewBefore = null;
          if (how === 'feast') {
            try {
              _feastBefore = (((G.state || {}).village || {}).pantry || [])
                .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || i.count || 1); }, 0);
            } catch (e0) {}
            try { _viewBefore = ((G.state || {}).village || {}).viewership; } catch (e0b) {}
          }
          const r = _ag.call(this, how);
          try {
            if (ctx.watchersDay == null) {
              ctx.watchersDay = gday();
              ctx.watchersAnswer = String(how);
              const tail = capture.slice(-60).filter(x => /watcher|broadcast|champion|theater|decline|planetary|world feed|species agency/i.test(String(x)));
              ctx.watchersBeatText = tail.map(String).slice(-10);
              // R15 M2: state-verify the consequences the copy promises.
              const wc = { answer: String(how) };
              try {
                const m = G.mshipState ? G.mshipState() : null;
                wc.loaned = (m && m.loaned) ? JSON.parse(JSON.stringify(m.loaned)) : null;
                wc.globalLive = !!(G.state && G.state.globalLive);
                wc.globalDay = (G.state && G.state.globalDay) || null;
                wc.viewership = (typeof G.havenViewership === 'function') ? Math.round(G.havenViewership()) : null;
                // R16: feast ledger — the real price and what it bought.
                if (String(how) === 'feast') {
                  try {
                    wc.pantryBefore = Math.round(_feastBefore || 0);
                    wc.pantryAfter = Math.round((((G.state || {}).village || {}).pantry || [])
                      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || i.count || 1); }, 0));
                    wc.pantryDelta = wc.pantryBefore - wc.pantryAfter;
                    var _fl = capture.slice(-8).join('\n');
                    var _pm = _fl.match(/([\d,]+) kcal of theater/);
                    wc.paidSpoken = _pm ? parseInt(_pm[1].replace(/,/g, ''), 10) : null;
                    wc.paidLine = _fl.split('\n').filter(function (l) { return /kcal of theater/.test(l); }).slice(-1)[0] || null;
                    wc.viewershipBefore = (_viewBefore == null ? null : Math.round(_viewBefore));
                    wc.viewershipDelta = (wc.viewership == null || wc.viewershipBefore == null) ? null : (wc.viewership - wc.viewershipBefore);
                    var _pg = null;
                    try { _pg = (G.progState ? G.progState() : null) || {}; } catch (e4f) {}
                    var _moms = (_pg && _pg.moments) || [];
                    wc.momentLogged = _moms.some(function (mo) { return mo && /feasted the world feed/.test(mo.text || ''); });
                    wc.momentDay = (_moms.filter(function (mo) { return mo && /feasted the world feed/.test(mo.text || ''); })[0] || {}).day;
                  } catch (e6) { wc.feastErr = String(e6 && e6.message); }
                }
                const led = (G.ledger && G.ledger()) || {};
                wc.ledgerDefiance = led.defiance || 0;
                let pg = null;
                try { pg = (G.progState ? G.progState() : null) || {}; } catch (e4) {}
                const evs = (pg && pg.ledgerEvents) || [];
                wc.globalDeclinedLogged = evs.some(e => e && e.sys === 'hierarchy' && e.ev === 'global-declined');
              } catch (e5) { wc.err = String(e5 && e5.message); }
              ctx.watchersConseq = wc;
              ctx.watchersLog = ctx.watchersLog || [];
              ctx.watchersLog.push({ day: ctx.watchersDay, answer: ctx.watchersAnswer, conseq: wc });
            }
          } catch (e2) {}
          return r;
        };
      }
    } catch (e) {}
  };
  policy.upkeep = function (G, ctx) {
    goInside();
    BASE.upkeep(G, ctx);
  };
  policy.daily = function (G, ctx) {
    goInside();
    BASE.daily(G, ctx);
    gearUp(ctx);
    regionalPlay(ctx);
    stampTableAnnounce(ctx); // R17: the table's announce day + spoken text
    driveTableApproach(ctx); // R17: a competent player sits when the table is set
    knowledgePlay(ctx);
    // wave-unlock transitions
    const w = waveNow();
    if (w !== ctx.lastWave) {
      ctx.waveLog.push({
        day: gday(), wave: w,
        w2points: waveLedgerPoints(2),
        standing: (() => { try { return JSON.parse(JSON.stringify(_G.villageStanding())); } catch (e) { return null; } })(),
        villageSlain: JSON.parse(JSON.stringify(_G.state.villageSlain || {})),
        engaged: { w1: waveEngaged(1), w2: waveEngaged(2), w3: waveEngaged(3), w4: waveEngaged(4), w5: waveEngaged(5) },
      });
      ctx.lastWave = w;
    }
    // SCALE R1: national is a live state — watch it stage and dissolve
    // R8 HOLD INSTRUMENT (r7 open item): stamp the first staging day and
    // count every loop-day the realm is live — hold durations were unmeasured
    // through r7; the verdict now carries days, not just on/off.
    try {
      const nl = !!((_G.state || {}).nationalLive);
      if (ctx._nl !== nl) {
        ctx._nl = nl;
        if (nl && ctx.nationalFirstDay == null) ctx.nationalFirstDay = gday();
        (ctx.scaleLog = ctx.scaleLog || []).push(Object.assign({ ev: nl ? 'national-on' : 'national-off' }, scaleSnap()));
      }
      if (nl) ctx.nationalHeldDays = (ctx.nationalHeldDays || 0) + 1;
    } catch (e) {}
    // R10 TABLE TRACK: first-day each Arc IV element flips, seat changes, checkpoints
    try {
      const ta = tableAuditSnap();
      const prev = ctx._taPrev || {};
      if (!ctx.tableFirstDay) ctx.tableFirstDay = {};
      const mark = (name, cond) => { if (cond && ctx.tableFirstDay[name] == null) ctx.tableFirstDay[name] = ta.day; };
      const sd = ta.seatDetail || {};
      mark('seatAny', ta.seat && ta.seat !== 'none');
      mark('waiting', ta.tableWaiting);
      mark('announced', ta.tableAnnounced);
      mark('w1', (sd.w1 || 0) >= 4);
      mark('w2', (sd.w2 || 0) >= 4);
      mark('w3', (sd.w3 || 0) >= 3);
      mark('contests', (sd.contestsN || 0) >= 2);
      mark('crises', (sd.crisesN || 0) >= 2);
      mark('scaleOk', !!(sd.rank === 'regional' || sd.rank === 'national' || sd.rank === 'global'));
      mark('stageOk', (sd.stage || 0) >= 2);
      mark('foodDeeds', !!sd.foodDeeds);
      mark('dayFloor', !!ta.dayFloorOk);
      if (prev.seat !== ta.seat) (ctx.tableTransitions = ctx.tableTransitions || []).push({ day: ta.day, from: prev.seat || 'none', to: ta.seat });
      ctx._taPrev = ta;
      if ([90, 100, 120, 140].includes(ta.day)) (ctx.tableSnaps = ctx.tableSnaps || []).push(ta);
    } catch (e) {}
    // deed checkpoints (the endgame currency)
    const gd = gday();
    // R9: exile-transition watch (fair-share fix measurement)
    try {
      const exNow = !!((_G.state.scholar || {}).exiled);
      if (ctx._wasExiled !== exNow) {
        (ctx.exileLog = ctx.exileLog || []).push({ day: gd, exiled: exNow, vilId: _G.villagerId });
        ctx._wasExiled = exNow;
      }
    } catch (e) {}
    if (gd === 100 || gd === 120 || gd === 140) {
      const eng = { w1: waveEngaged(1), w2: waveEngaged(2), w3: waveEngaged(3), w4: waveEngaged(4), w5: waveEngaged(5) };
      let linkSnap = [];
      try {
        const links = _G.hierarchyState() || [];
        linkSnap = links.map(l => {
          const other = (l.primary === 'haven' ? l.subordinate : l.primary) || (l.a === 'haven' ? l.b : l.a) || '?';
          const age = gd - (l.day || 0);
          return { id: String(l.id).slice(-6), kind: l.kind || 'hier', other, status: l.status,
                   trust: Math.round(l.trust || 0), age, arrears: l.arrears || 0,
                   seasoned: age >= 30 && (l.trust || 0) >= 40 };
        });
      } catch (e) {}
      let takeRate7 = null;
      try { takeRate7 = _G.takeRate7 ? +(_G.takeRate7(_G.villagerId) || 0).toFixed(0) : null; } catch (e) {}
      let codexMonsters = null;
      try { codexMonsters = Object.keys((_G.state.codex || {}).monsters || {}).length; } catch (e) {}
      ctx.deedLog.push(Object.assign({ day: gd, engaged: eng, wave: w, pop: popAlive(), pantry: pantryKcal(), w3fights: (ctx.fightsByWave || {})[3] || 0,
        exiled: !!((_G.state.scholar || {}).exiled), takeRate7, codexMonsters }, scaleSnap()));
      try {
        const td = JSON.parse(JSON.stringify((_G.state.village || {}).traderDeep || {}));
        ctx.traderDeepSnaps.push({ day: gd, deep: td });
      } catch (e) {}
    }
    // R11: teachableDays sampler DROPPED (r10 metric review — empty 8/8;
    // discovery via taught/observed fires faster than the sampling cadence.
    // Intent covered by counterEvents + beasttricksAsked/Taught.)
    // conversations on leg days (people check)
    if (CONVO_DAYS.includes(gd)) {
      let vid = null;
      try {
        const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = _G.npcComm ? _G.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          let cnt = -1;
          try { const c0 = _G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          if (cnt < 2) { vid = id; break; }
        }
        if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
      } catch (e) {}
      if (vid) {
        try {
          const fp = runConversation(gd, vid);
          ctx.convoFiles.push(fp);
        } catch (e) {}
      }
    }
  };
  // deepening fight: take wave 2-3 fights at decent health, walk away from
  // bad ones; record every fight with wave + sig markers (r3).
  policy.fight = function (G, ctx) {
    try {
      const f = G.tbfight;
      if (ctx._fr && (!f || f.id !== ctx._fr.id)) finalizeFight(ctx);
      if (!f || f.over || !G.tbIsPlayerTurn()) return false;
      if (!ctx._fr || ctx._fr.id !== f.id) {
        const mons = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
        let tileType = '?';
        try { const t = G.playerTile ? G.playerTile() : null; tileType = t ? t.type : '?'; } catch (e) {}
        ctx._fr = {
          id: f.id, obj: f, day: gday(), capStart: capture.length, tileType,
          startRound: f.round || 0,
          hp0Total: mons.reduce((t, m) => t + (m.maxHp || m.hp || 0), 0),
          monsters: mons.map(m => ({ key: m.key, mid: m.monsterId, wave: waveOf(m.monsterId), name: monsterDisplay(m.monsterId), hp0: m.maxHp || m.hp })),
        };
        ctx.fightsStarted = (ctx.fightsStarted || 0) + 1;
      }
      const p = G.tbFighter('p');
      const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
      // STALLDUMP: if a fight exceeds 300 rounds, dump the full fighter state once
      if (process.env.STALLDUMP && f.round > 300 && !ctx._stallDumped) {
        ctx._stallDumped = true;
        try {
          const fs = require('fs');
          const dump = {
            day: gday(), round: f.round, result: f.result, over: !!f.over,
            playerTurn: G.tbIsPlayerTurn(),
            player: { hp: p.hp, maxHp: p.maxHp, mx: p.mx, my: p.my, moveLeft: p.moveLeft, acted: p.acted, stunned: p.stunned, status: p.status },
            monsters: f.fighters.filter(x => x.kind === 'monster').map(m => ({
              mid: m.monsterId, hp: m.hp, maxHp: m.maxHp, mx: m.mx, my: m.my,
              stunned: m.stunned, acted: m.acted, moveLeft: m.moveLeft,
              extraKeys: Object.keys(m).filter(k => /sp|reel|tape|replay|record/i.test(k)),
              spRecLen: (m.spRec || []).length, spReplayLen: (m.spReplay || []).length,
            })),
          };
          try {
            const w = G.equippedWeapon ? G.equippedWeapon() : null;
            dump.weapon = w && { name: w.name, range: w.range };
          } catch (e) {}
          fs.writeFileSync(`/tmp/journey-scale-r14-stall-${_currentSeed}.json`, JSON.stringify(dump, null, 1));
        } catch (e) {}
      }
      const endTurn = () => {
        try { const q = G.tbFighter('p'); q.moveLeft = 0; q.acted = true; G.tbAfterPlayerAction(); } catch (e) {}
      };
      const flee = () => {
        try {
          const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
          // On a grid edge? Push THROUGH the barrier — tbBarrierExit is the
          // real flee (r3 fix: the old code parked at the edge via
          // tbPlayerMove and never exited — 5455 futile "flees" in one stall).
          // Try every available edge direction: one way may be blocked
          // (creek/rubble on the far side).
          const dirs = [];
          if (px === 0) dirs.push([-1, 0]);
          if (px === 8) dirs.push([1, 0]);
          if (py === 0) dirs.push([0, -1]);
          if (py === 8) dirs.push([0, 1]);
          if (G.tbBarrierExit) {
            for (const [dx, dy] of dirs) {
              try {
                if (G.tbBarrierExit(dx, dy)) { ctx.fled = (ctx.fled || 0) + 1; return true; }
              } catch (e) {}
            }
          }
          // Not on a pushable edge (or all pushes blocked): take ONE step
          // toward the nearest corner along the current edge — the push
          // comes when a pushable edge is reached. (Single step: moveLeft
          // is ~3, a full-edge jump fails path-cost.)
          // R5 SMARTER FLEE (harness-only tooling fix, journey deepening r5):
          // the r4 harness retried one blocked tile 20k times (player at
          // (4,1), flee target (4,0), findPath null — "No path there"; the
          // hummice couldn't path either). A real player tries another
          // direction instead of hammering the blocked tile. Remember the
          // last target: if it failed to move the player, rotate through
          // the other 7 adjacent tiles (path-checked); if none path, pass
          // the turn (endTurn below) instead of retrying — the stall was
          // the RETRY, not the pass.
          try {
            let sx = px, sy = py;
            if (py === 0 || py === 8) sx = px <= 4 ? Math.max(0, px - 1) : Math.min(8, px + 1);
            else sy = py <= 4 ? Math.max(0, py - 1) : Math.min(8, py + 1);
            if (sx === px && sy === py) sx = px <= 4 ? 0 : 8;
            const lastT = ctx._fleeT, lastPx = ctx._fleePx, lastPy = ctx._fleePy;
            const stuck = lastT === (sx + ',' + sy) && lastPx === px && lastPy === py;
            const tryStep = (tx, ty) => {
              try {
                if (tx < 0 || tx > 8 || ty < 0 || ty > 8) return false;
                let path = null;
                try { path = G.findPath ? G.findPath(px, py, tx, ty) : [1]; } catch (e2) { path = null; }
                if (!path) return false;
                const before = p.mx + ',' + p.my;
                G.tbPlayerMove(tx, ty);
                return (p.mx + ',' + p.my) !== before;
              } catch (e2) { return false; }
            };
            let moved = false;
            if (!stuck) moved = tryStep(sx, sy);
            if (!moved) {
              for (let dx = -1; dx <= 1 && !moved; dx++) for (let dy = -1; dy <= 1 && !moved; dy++) {
                if (!dx && !dy) continue;
                if (dx === sx - px && dy === sy - py) continue; // primary already tried
                moved = tryStep(px + dx, py + dy);
              }
              if (!moved) ctx.fleeBoxed = (ctx.fleeBoxed || 0) + 1;
            }
            ctx._fleeT = sx + ',' + sy; ctx._fleePx = p.mx; ctx._fleePy = p.my;
          } catch (e) {}
        } catch (e) {}
        endTurn();
        return true;
      };
      if (ctx._fightObjD !== f) {
        ctx._fightObjD = f;
        try {
          const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
          let totalMhp = 0, maxWave = 1;
          for (const m of monsters) {
            totalMhp += m.maxHp || m.hp || 0;
            maxWave = Math.max(maxWave, waveOf(m.monsterId));
          }
          const pmax = p.maxHp || 100;
          const outmatched = (totalMhp > 4 * pmax ||
            (maxWave >= 3 && hpPct < 0.6) ||
            (maxWave >= 2 && hpPct < 0.5) ||
            hpPct < 0.5);
          if (outmatched && monsters.length) {
            ctx.fledDeepening = (ctx.fledDeepening || 0) + 1;
            return flee();
          }
        } catch (e) {}
      }
      if (hpPct < 0.35) return flee();
      const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
      if (!alive.length) return false;
      // STALEMATE FLEE (r3): a competent player disengages from an unwinnable
      // chase. 40+ rounds with monster HP still >=90% of fight start = not
      // winnable (bare-handed vs kiter). Flee via the barrier like a player.
      // STANDOFF (r5): in a sealed/boxed fight flee is impossible and nobody
      // can reach anybody — the r4 20k-round hummice freeze. At 120+ rounds
      // with zero damage dealt AND flee boxed/sealed, stop handling turns
      // for this fight (return false): the shared driver's no-progress
      // breaker then exits each day's drive quickly instead of spinning.
      // The fight stays open (honest — the game never resolved it) and the
      // sim moves on. Loudly noted in telemetry.
      if (ctx._standoff === f.id) return false; // declared standoff: hands off
      if (ctx._fr && (f.round || 0) - (ctx._fr.startRound || 0) > 40) {
        const curHp = alive.reduce((t, m) => t + (m.hp || 0), 0);
        if (curHp >= (ctx._fr.hp0Total || 1) * 0.9) {
          const sealed = !!(f.noFlee || (G.state || {}).arenaContest);
          const roundsIn = (f.round || 0) - (ctx._fr.startRound || 0);
          if (roundsIn > 120 && (sealed || (ctx.fleeBoxed || 0) > 20)) {
            ctx._standoff = f.id;
            ctx.standoffs = (ctx.standoffs || 0) + 1;
            try { (ctx.notes || (ctx.notes = [])).push(`standoff: fight ${f.id} day ${gday()} round ${f.round} sealed=${sealed} fleeBoxed=${ctx.fleeBoxed || 0} — hands off, no-progress breaker will exit`); } catch (e2) {}
            return false;
          }
          ctx.stalemateFled = (ctx.stalemateFled || 0) + 1;
          // STALEMATE-TRACE (r4): log the trap signature
          if (process.env.STALLTRACE && ctx.stalemateFled % 500 === 1) {
            try {
              const fs = require('fs');
              let probe = '';
              // on the 1st trace, probe why the player isn't moving
              if (ctx.stalemateFled === 1 || ctx.stalemateFled === 501) {
                const said0 = [];
                const _s = _G.say;
                _G.say = function (...a) { said0.push(String(a[0])); return _s.apply(this, a); };
                let mvRet = null;
                try {
                  const px0 = p.mx, py0 = p.my;
                  let sx = px0, sy = py0;
                  if (py0 === 0 || py0 === 8) sx = px0 <= 4 ? Math.max(0, px0 - 1) : Math.min(8, px0 + 1);
                  else sy = py0 <= 4 ? Math.max(0, py0 - 1) : Math.min(8, py0 + 1);
                  mvRet = _G.tbPlayerMove(sx, sy);
                  probe = ` probeMove(${sx},${sy})=${mvRet} said=[${said0.slice(-3).join('|')}] pNow=${p.mx},${p.my} moveLeft=${p.moveLeft}`;
                  // undo the probe move so the trace doesn't perturb the run
                  p.mx = px0; p.my = py0;
                } catch (e) { probe = ' probe threw: ' + e.message; }
                _G.say = _s;
                probe += ' pstatus=' + JSON.stringify({ stunned: p.stunned, status: p.status, blindTurns: p.blindTurns, acted: p.acted, moveLeft: p.moveLeft });
                try { probe += ' path=' + JSON.stringify(_G.findPath(p.mx, p.my, p.mx, 0)); } catch (e) { probe += ' pathErr=' + e.message; }
              }
              fs.appendFileSync(`/tmp/journey-scale-r14-stalltrace-${_currentSeed}.txt`,
                `stalemate#${ctx.stalemateFled} day=${gday()} fight=${f.id} round=${f.round} startRound=${ctx._fr.startRound} ` +
                `mons=${alive.map(m => m.monsterId + ':' + Math.round(m.hp) + '@' + m.mx + ',' + m.my).join('|')} ` +
                `p@${p.mx},${p.my} hp=${Math.round(p.hp)} map=${_G.map.px},${_G.map.py} noFlee=${!!f.noFlee} over=${!!f.over}${probe}\n`);
            } catch (e) {}
          }
          return flee();
        }
      }
      alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
      const tgt = alive[0];
      const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
      const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
      try {
        const w = (G.equippedWeapon && G.equippedWeapon()) || { range: 1 };
        const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
        if (d0 > (w.range || 1)) {
          const occupied = new Set(f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
          let bx = null, by = null, bd = 1e9;
          for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
            if (!dx && !dy) continue;
            const cx = tmx + dx, cy = tmy + dy;
            if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
            if (occupied.has(cx + ',' + cy)) continue;
            const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
            if (dd < bd) { bd = dd; bx = cx; by = cy; }
          }
          if (bx != null) { try { G.tbPlayerMove(bx, by); } catch (e) {} ctx.closed = (ctx.closed || 0) + 1; }
          endTurn();
          return true;
        }
      } catch (e) {}
      try { G.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
      endTurn();
      return true;
    } catch (e) { return false; }
  };
  // smart contest driver: advance; when a choice doesn't advance the phase
  // (blocked aloud, e.g. ratings summons "Eat first"), rotate indices like a
  // real player would ("Phone it in" / "Refuse on camera"). Cap calls.
  policy.contest = function (G, ctx) {
    try {
      const ac = G.state && G.state.activeContest;
      if (!ac || ac.phase === 'done' || ac.arenaSuspended) return false;
      ctx.contestCalls = (ctx.contestCalls || 0) + 1;
      if (ctx.contestCalls > 600) { ctx.contestNote = 'contest call cap hit'; return false; }
      const phases = ac.phases || [];
      const pi = ac.phaseIdx || 0;
      const nChoices = ((phases[pi] || {}).choices || []).length;
      if (!nChoices) return false;
      ctx._cxIdx = ctx._cxIdx == null ? 0 : ctx._cxIdx;
      const idx = ctx._cxIdx % nChoices;
      let ret;
      try { ret = G.contestChoose(idx); } catch (e) { ctx._cxIdx++; return true; }
      const ac2 = G.state && G.state.activeContest;
      if (ac2 && ac2.phase !== 'done' && (ac2.phaseIdx || 0) === pi) {
        ctx._cxStuck = (ctx._cxStuck || 0) + 1;
        if (ctx._cxStuck >= 3) { ctx._cxIdx++; ctx._cxStuck = 0; ctx.contestStuck = (ctx.contestStuck || 0) + 1; }
      } else {
        ctx._cxStuck = 0;
      }
      return true;
    } catch (e) { return false; }
  };
  return policy;
}

// ---- conversation driver (r2, engage-first, 8 turns) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
// R1 (2026-10-15): the want's menu is suppressed while a generic question
// hangs (convoWantMenu returns [] when c.genericQ is set). Fresh-ask wants
// whose opener is classified yes/no (e.g. seek_taken's "Have you ever
// asked?") offer only gq:yn:* at turn 0 — the want menu (dlg:commit)
// appears on turn 1 after answering. 'unsure' is the honest default;
// bailing here strands the want unengaged (the r1 turn-0 bail pattern).
const GQYN = ['gq:yn:unsure', 'gq:yn:honest_pass', 'gq:yn:no', 'gq:yn:yes'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of GQYN) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
const CONVO_DAYS = [80, 100, 120, 140];
function runConversation(day, vid) {
  // R10 appendix lesson: namespace transcripts by policy (A/B filename collisions).
  const fp = path.join(EVIDIR, `journey-scale-r17-${POLICY}-transcript-${_currentSeed}-day${day}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    if (!r0) {
      // HARNESS GAP FIX (deepening r11 2026-10-13): startConvo legitimately
      // returns null for an un-talkable roster id (phantom-talk guard). Log
      // it as a finding, not a crash — a null here in a sim is exactly the
      // recruit-ghost signal the game fix above addresses.
      log(`THEM: (no line — startConvo returned null for ${vid}; un-talkable roster id)`);
      log('want final: id=none stage=0 resolution=none (conversation never opened)');
      fs.writeFileSync(fp, L.join('\n'));
      return fp;
    }
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = _G.npcMood ? _G.npcMood(vid) : '?'; } catch (e) {}
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      if (turn === 0) log(`(turn0 choices: ${(choices || []).map(c => c && c.id).join(', ') || 'NONE'})`);
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

// ---- census ----
function popAlive() {
  try { return (_G.state.village.roster || []).filter(id => !person(id).dead).length; } catch (e) { return null; }
}
function deathsSoFar() {
  try { return (_G.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    let ax = null;
    try { ax = _G.agencyOf ? _G.agencyOf(id) : null; } catch (e) {}
    let mood = null;
    try { mood = _G.npcMood ? _G.npcMood(id) : null; } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      temperament: (p.personality && p.personality.temperament) || p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
    };
  });
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  // R6: the raid layer is env-gated; the Iron Court answer is per-seed (pre-registered).
  delete process.env.WARCOURT_RAID; // lead road: no raids
  delete process.env.IRONCOURT_ANSWER;
  console.log(`\n########## SEED ${seed} POLICY=${POLICY} SCALE-R17 watchers=${R15_WATCHERS_ANSWER} feast=${R15_FEAST} ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r17-belong', fullTelemetry: true });
  _G = Game;
  // wrap say/sysSay/emit for text capture (sim-harness silences say/sysSay)
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  // R10 death-honesty (carried from landing r14): wrap playerDeath on the
  // instance, record the cause, verify the epitaph line carries it.
  const DEATHS = { causes: {}, playerDeaths: [], mislabels: [] };
  try {
    if (typeof Game.playerDeath === 'function') {
      const _pd = Game.playerDeath.bind(Game);
      Game.playerDeath = function (cause) {
        const c = String(cause || 'the wild');
        const mark = capture.length;
        const r = _pd(cause);
        DEATHS.playerDeaths.push({ day: gday(), cause: c });
        DEATHS.causes[c] = (DEATHS.causes[c] || 0) + 1;
        const epitaph = capture.slice(mark, mark + 14).map(x => String(x));
        const epLine = epitaph.find(x => /is dead —/.test(x)) || '';
        const honest = !/starvat/i.test(epLine) || /starvat/i.test(c);
        if (!honest) {
          DEATHS.mislabels.push({ day: gday(), recorded: c, epitaph: epLine.slice(0, 200) });
          console.log(`*** MISLABEL day ${gday()}: recorded=${c} epitaph=${epLine.slice(0, 120)}`);
        } else {
          console.log(`*** PLAYER DEATH day ${gday()}: cause=${c} epitaph=${epLine.slice(0, 120)}`);
        }
        return r;
      };
    }
  } catch (e) { console.log('playerDeath wrap ERROR: ' + (e && e.message)); }
  await setupGame(Game);
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-scale-r17-belong', date: new Date().toISOString().slice(0, 10), node: process.version } });
  if (policy._ctx && policy._ctx._fr) finalizeFight(policy._ctx);
  const ctx = policy._ctx || {};
  // wave-3 kills (player + villager, by type) and fights-by-wave summary
  let waveKills = null;
  try { waveKills = JSON.parse(JSON.stringify(Game.state.waveKills || {})); } catch (e) {}
  let villageSlain = null;
  try { villageSlain = JSON.parse(JSON.stringify(Game.state.villageSlain || {})); } catch (e) {}
  // SCALE R1: table-approach telemetry rows
  let tableTele = [];
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (!e || !e.type) continue;
      if (/table|deedgate/i.test(e.type)) tableTele.push({ day: e.day, type: e.type });
    }
  } catch (e2) {}
  let wavesFaced = null;
  try {
    const ds = Game.deedState ? Game.deedState() : null;
    wavesFaced = JSON.parse(JSON.stringify((ds && ds.wavesFaced) || {}));
  } catch (e) {}
  // r7: knowledge-economy markers over the captured text
  const capText = capture.join('\n');
  const knowCounts = {};
  for (const [k, marks] of Object.entries(KNOW_MARKERS)) {
    knowCounts[k] = 0;
    for (const mk of marks) {
      let ix = 0, n = 0;
      const low = capText.toLowerCase(), mkl = mk.toLowerCase();
      while ((ix = low.indexOf(mkl, ix)) >= 0) { n++; ix += mkl.length; }
      knowCounts[k] += n;
    }
  }
  const w3fights = (ctx.fightsLog || []).filter(f => (f.monsters || []).some(m => (m.wave || 1) === 3));
  // R11 (r10 metric review): the ledger is authoritative — state.waveKills
  // missed player wave-3 wins in r10. Read ledgerState()[3].perType directly.
  const w3killsByType = {};
  try {
    const L3 = (Game.ledgerState && Game.ledgerState()[3]) || {};
    for (const [mid, pts] of Object.entries(L3.perType || {})) w3killsByType[mid] = pts;
    const L3x = L3.perTypeX || {};
    for (const [mid, pts] of Object.entries(L3x)) {
      if (pts) w3killsByType[mid + '+x'] = pts;
    }
  } catch (e) {}
  const sigFired = {};
  for (const f of w3fights) {
    for (const mid of Object.keys(f.sigHits || {})) {
      sigFired[mid] = (sigFired[mid] || []).concat(f.sigHits[mid]);
    }
  }
  // R9: social/text markers over captured text
  const R9_MARKERS = { exile: ['cast out', 'exiled', 'exile'], moot: ['moot'], theft: ['theft', 'stealing', 'stole'], confrontation: ['confront'] };
  const markerCounts = {};
  for (const [k, marks] of Object.entries(R9_MARKERS)) {
    markerCounts[k] = 0;
    for (const mk of marks) {
      let ix = 0; const low = capText.toLowerCase(), mkl = mk.toLowerCase();
      while ((ix = low.indexOf(mkl, ix)) >= 0) { markerCounts[k]++; ix += mkl.length; }
    }
  }
  // SCALE R1: polity-beat markers over captured text
  for (const [k, marks] of Object.entries(SCALE_MARKERS)) {
    markerCounts[k] = 0;
    for (const mk of marks) {
      let ix = 0; const low = capText.toLowerCase(), mkl = mk.toLowerCase();
      while ((ix = low.indexOf(mkl, ix)) >= 0) { markerCounts[k]++; ix += mkl.length; }
    }
  }
  // R10: counter-parity telemetry — the engine teles counter_observed (bar
  // fills) and counter_discovered (trick learned, via=trick|taught|
  // scholar-observed|observed). 'observed' = villager non-lethal path.
  let counterObservedEvents = [];
  let counterDiscoveredEvents = [];
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (!e || !e.type) continue;
      if (e.type === 'counter_observed') counterObservedEvents.push({ day: e.day, id: e.id, n: e.n, vid: e.vid });
      else if (e.type === 'counter_discovered') counterDiscoveredEvents.push({ day: e.day, id: e.id, via: e.via });
    }
  } catch (e2) {}
  let villageCounterObs = null, monsterCountersKnown = null, villagerTricks = null;
  try { villageCounterObs = JSON.parse(JSON.stringify(Game.state.villageCounterObs || {})); } catch (e2) {}
  try { monsterCountersKnown = Object.keys(Game.state.monsterCounters || {}); } catch (e2) {}
  try { villagerTricks = Object.keys(Game.state.villagerTricks || {}); } catch (e2) {}
  const scaleBeatText = capText.split('\n')
    .filter(l => /first court|the binding|swear the oath|opens the cages|the yoke|yoke eases|founding council|the charter|renegotiat|seasoned|the table|lesser seat|being set|walks away|free fire|refuses the scale|seven days|withdrawn — permanently/i.test(l))
    .slice(0, 60);
  const out = {
    seed, policy: POLICY, maxGameDay: result.gameDays, endReason: result.endReason,
    nationalFirstDay: ctx.nationalFirstDay == null ? null : ctx.nationalFirstDay,
    nationalHeldDays: ctx.nationalHeldDays || 0,
    scaleBeatText,
    bindingDay: ctx.bindingDay == null ? null : ctx.bindingDay,
    bindingAnswer: ctx.bindingAnswer || null,
    bindingBeatText: ctx.bindingBeatText || [],
    walkResult: ctx.walkResult || null,
    serveResult: ctx.serveResult || null,
    bindingLog: ctx.bindingLog || [],
    watchersDay: ctx.watchersDay == null ? null : ctx.watchersDay,
    watchersAnswer: ctx.watchersAnswer || null,
    watchersBeatText: ctx.watchersBeatText || [],
    watchersConseq: ctx.watchersConseq || null,
    watchersLog: ctx.watchersLog || [],
    tableAnnounceDay: ctx.tableAnnounceDay == null ? null : ctx.tableAnnounceDay,
    tableAnnounceText: ctx.tableAnnounceText || [],
    tableApproach: ctx.tableApproach || [],
    belongLog: ctx.belongLog || [],
    ctxSwitches: ctx._switched || null,
    fsFeasts: ctx.fsFeasts || 0,
    exileLog: ctx.exileLog || [], exiledAtEnd: !!((Game.state.scholar || {}).exiled),
    deathHonesty: { causes: DEATHS.causes, playerDeaths: DEATHS.playerDeaths, mislabels: DEATHS.mislabels },
    counterParity: { observedEvents: counterObservedEvents, discoveredEvents: counterDiscoveredEvents,
      obsBar: villageCounterObs, known: monsterCountersKnown, villagerTricks },
    markerCounts,
    waveLog: ctx.waveLog || [], deedLog: ctx.deedLog || [],
    finalWave: waveNow(), finalScale: scaleNow(),
    engaged: { w1: waveEngaged(1), w2: waveEngaged(2), w3: waveEngaged(3), w4: waveEngaged(4), w5: waveEngaged(5) },
    wavesFaced,
    tableTele,
    w3fights: w3fights.map(f => ({
      day: f.day, rounds: f.rounds, result: f.result, tileType: f.tileType,
      monsters: f.monsters, endHp: f.endHp, sigHits: f.sigHits,
      sample: (f.lines || []).slice(0, 12),
    })),
    w3killsByType,
    sigFired,
    fightsByWave: ctx.fightsByWave || {},
    fightsTotal: (ctx.fightsLog || []).length,
    foughtWaves: (ctx.fightsLog || []).map(f => ({ day: f.day, waves: (f.monsters || []).map(m => m.wave || 1), result: f.result })),
    census: buildCensus(),
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    regionalLog: ctx.regionalLog || [],
    scaleLog: ctx.scaleLog || [],
    conquestEvents: ctx.conquestEvents || [],
    convoFiles: ctx.convoFiles || [],
    contestStuck: ctx.contestStuck || 0, contestCalls: ctx.contestCalls || 0, contestNote: ctx.contestNote || null,
    ctxSummary: {
      struck: ctx.struck || 0, fled: ctx.fled || 0, fledDeepening: ctx.fledDeepening || 0,
      stalemateFled: ctx.stalemateFled || 0,
      fightsStarted: ctx.fightsStarted || 0, geared: ctx.geared || 0, armored: ctx.armored || 0,
      beasttricksAsked: ctx.beasttricksAsked || 0, beasttricksTaught: ctx.beasttricksTaught || 0,
    },
    // r7 knowledge economy
    counterEvents: ctx.counterEvents || [],
    combineFires: ctx.combineFires || [],
    teachableDays: ctx.teachableDays || [],
    traderDeepSnaps: ctx.traderDeepSnaps || [],
    knowCounts,
    pacing: result.pacing,
    ms: result.ms,
  };
  const _taFinal = tableAuditSnap();
  out.tableAudit = {
    firstDay: ctx.tableFirstDay || {},
    transitions: ctx.tableTransitions || [],
    snaps: ctx.tableSnaps || [],
    final: _taFinal,
    unmetAtEnd: (() => {
      const sd = _taFinal.seatDetail || {};
      const miss = [];
      if ((sd.w1 || 0) < 4) miss.push('w1=' + (sd.w1 || 0) + '/4');
      if ((sd.w2 || 0) < 4) miss.push('w2=' + (sd.w2 || 0) + '/4');
      if ((sd.w3 || 0) < 3) miss.push('w3=' + (sd.w3 || 0) + '/3');
      if ((sd.contestsN || 0) < 2) miss.push('contests=' + (sd.contestsN || 0) + '/2');
      if ((sd.crisesN || 0) < 2) miss.push('crises=' + (sd.crisesN || 0) + '/2');
      if (!(sd.rank === 'regional' || sd.rank === 'national' || sd.rank === 'global')) miss.push('scale=' + (sd.rank || '?'));
      if ((sd.stage || 0) < 2) miss.push('stage=' + (sd.stage || 0) + '/2');
      if (!sd.foodDeeds) miss.push('foodDeeds=false');
      if (!_taFinal.dayFloorOk) miss.push('dayFloor=false');
      return miss;
    })(),
  };
  out.finalSnap = scaleSnap();
  const fp = path.join(EVIDIR, `journey-scale-r17-${POLICY}-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  if (process.env.CAPTURE_DUMP) {
    try {
      let txt = capture.join('\n');
      if (txt.length > 1500 * 1024) txt = txt.slice(0, 1500 * 1024) + '\n[TRUNCATED at 1.5MB]';
      fs.writeFileSync(`/tmp/r16-cap-${POLICY}-${seed}.txt`, txt);
    } catch (e) {}
  }
  const w3n = w3fights.length;
  const satRec=(out.tableApproach||[]).filter(e=>e.ev==='take-seat'&&e.tableDone)[0];
  console.log(`SEED ${seed} [${POLICY}] DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} scale=${scaleNow()} national=${out.finalSnap.nationalLive ? 'ON' : 'off'}(held=${out.nationalHeldDays}d first=${out.nationalFirstDay == null ? '-' : out.nationalFirstDay}) viewers=${out.finalSnap.viewership} seat=${out.finalSnap.tableSeat || 'none'} arc=${out.tableAudit.final.arc} ann=${out.tableAudit.final.tableAnnounced ? 'YES' : '-'} sat=${satRec ? 'YES@d'+satRec.day : '-'} unmet=[${(out.tableAudit.unmetAtEnd || []).join(' ')}] pop=${popAlive()} ms=${result.ms} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE (POLICY=' + POLICY + ') ##########');
  for (const s of summary) {
    const par = s.counterParity || {};
    const obsN = (par.observedEvents || []).length, discN = (par.discoveredEvents || []).length;
    const dh = (s.deathHonesty || {}).mislabels || [];
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} wave=${s.finalWave} w3fights=${(s.w3fights || []).length} engagedW3=${(s.engaged || {}).w3} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} counterObs=${obsN} counterDisc=${discN} mislabels=${dh.length}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
