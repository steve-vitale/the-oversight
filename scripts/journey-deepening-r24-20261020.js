// journey-deepening-r24-20261020.js -- DEEPENING leg R24: the trick funnel —
// knowledge → PERFORMANCE in real play (r23 named-next).
// Base: master@1fff16631 (r23 landed 560ac7861).
// R24 question (r23 metric-review, BINDING):
//   The knowledge economy breathes (r23: 15-20 counters known/seed, channels
//   observed/taught/trick/scholar-observed) — but does knowledge ever become
//   PERFORMANCE? The abstract field model actuates only TWO wave-1/2 counter
//   kinds (fieldFights.js documented): shout (belltoad, hummice, sanjun) and
//   offer_food (lockpick_raccoon); the other 13 kinds are un-actuatable,
//   never faked (deliberate boundary, Steve declined gate alignment).
//   (a) SHOUT/OFFER_FOOD FUNNEL: on competent fight-avoidant play, how many
//       opportunities arise (field fight vs a shoutable/offerable monster
//       where the villager KNOWS the counter at fight time and gets >=1 turn),
//       and how many PERFORM it (trickLog 'shout'/'offer_food')?
//   (b) TEACH CHANNEL: does beasttricks ask/teach transmit counters
//       (counter_discovered via='taught', teach chains >=2 links), or is all
//       knowledge personal observation?
//   (c) w2Missed FIX (r23 metric review): only count fights where the
//       villager had >=1 turn (actionKinds.length>=1) — rounds=0 flee-before-
//       action was over-counted.
//   (d) PEOPLE report-only: >=6 transcripts sense-read, 0 senseless.
// PRE-REGISTER (2026-10-20, MEASUREMENT.md 9-12, 14 - BINDING):
//   R1: sig end-state proof 9/9 GREEN pre-run (scripts/test-w3-sig-endstates-r23.js).
//   R2 (TIGHTENED funnel): >=2/4 pilot seeds with >=1 villager-PERFORMED
//       wave-1/2 counter trick ('shout' or 'offer_food') in a real field
//       fight = GO. 0 performances on >=3/4 seeds = NO-GO (the knowledge
//       economy teaches tricks the field model cannot use).
//   R3 (teach channel): report-only — beasttricks taught events, via='taught'
//       discoveries, teach-chain depth.
//   M1: >=6 transcripts, 0 senseless (report-only). M2: >=3/4 alive at d80.
//   Seeds: fresh 9701-9704 competent (pilot 9701-9703; 9704 iff interesting).
//   DAYCAP=100, death-aware stop.
// RACE GUARDS: no pacing lever (flesh-out territory); no dialogue changes
//   (social loop's lane); wave-3 gate is Steve's design, measured never moved
//   (unlock tracked report-only).
// Canon: CANON.md, MONSTER-WAVES.md (2026-10-20). No new canon.
// Interesting-finding bar: >=1 performed shout/offer_food with a named
// villager and honest narration, or a beasttricks teach chain >=2 links, =
// the trick channel breathes. Zero on both = the blank: counters known but
// the performance/teach loop never closes in play.
// Usage: POLICY=competent SEEDS=9701,9702 node scripts/journey-deepening-r24-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9701, 9702, 9703, 9704]);
const DAYCAP = parseInt(process.env.DAYCAP || '100', 10);
const PROBE_W3 = process.env.PROBE_W3 === '1';

const { mulberry32, loadGame, setupGame, runDays, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { belongseek } = require('./policies/belongseek');
const { deedSeeking } = require('./policies/deed-seeking');
// R20: multi-policy loader. Deed-seeking (competent + encounter patrols) is
// the second policy isolating "a player who seeks fights".
const POLICY = ['belongseek', 'deed-seeking'].indexOf(process.env.POLICY) >= 0 ? process.env.POLICY : 'competent';
const BASE = POLICY === 'belongseek' ? belongseek : POLICY === 'deed-seeking' ? deedSeeking : competent;

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-20');

// ---- per-seed globals (reset per seed) ----
let capture = [];
let _currentSeed = null;
let _G = null;
// R14 instrument arrays (module-level: policy ctx doesn't exist at wrap time)
let fieldFights14 = [];
let aidCrises14 = [];
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

// R14 (counterwire 44de021d): the 6 newly-wired wave-3 tricks. A field fight
// vs one of these monsters with a non-empty trickLog = the village KNEW the
// trick (villageKnowsTrick gate) and a villager PERFORMED it.
const NEW_W3_TRICKS = ['redactor', 'gavel', 'focus_group', 'terms_of_service', 'callback', 'ad_break'];
const OLD_W3_TRICKS = ['spool', 'buffering', 'chorus_line'];
const HOLD_LINE_MARK = 'holds the line \u2014 working the trick';

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
  const allowPropose = POLICY !== 'belongseek'; // BELONG courtship owns proposing on its arm
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
    if (st.pendingNational) {
      const shape = st.pendingNational.shape;
      const pick = { lead: 'feast', conquest: 'mercy', belong: 'swear', covenant: 'pact', trade: 'sign' }[shape] || 'feast';
      try { _G.answerNationalChoice(pick); note({ ev: 'national', shape, how: pick, scale: scaleNow() }); } catch (e) { note({ ev: 'national', shape, how: pick, err: String(e && e.message) }); }
    }
    if (st.pendingGlobal) {
      try { _G.answerGlobalChoice('feast'); note({ ev: 'global', how: 'feast', scale: scaleNow() }); } catch (e) { note({ ev: 'global', how: 'feast', err: String(e && e.message) }); }
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
        fs.writeFileSync(`/tmp/journey-deep-r5-w3leadup-${_currentSeed}-day${rec.day}.txt`, pre + '\n\n===== FIGHT START =====\n' + capture.slice(rec.capStart, rec.capStart + 60).join('\n'));
      } catch (e) {}
    }
    // W3FULL: full fight text for wave-3 fights (r4 signature-mechanics honesty audit)
    // ALLFIGHTS=1: dump every fight (r4 stall investigation)
    if ((process.env.W3FULL && rec.monsters.some(m => (m.wave || 1) === 3)) || process.env.ALLFIGHTS) {
      try {
        const mids = rec.monsters.map(m => m.mid).join('-');
        let txt = capture.slice(rec.capStart).join('\n');
        if (txt.length > 500 * 1024) txt = txt.slice(0, 500 * 1024) + '\n[TRUNCATED at 500KB]';
        fs.writeFileSync(`/tmp/journey-deep-r5-fight-${_currentSeed}-day${rec.day}-${mids}.txt`, txt);
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
  policy.id = 'journey-deepening-r24-' + POLICY;
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
    // R15: pantry-min tracker (C5 report-only: does any seed dip < 5000?)
    try { const _pk = pantryKcal(); if (ctx._pantryMin == null || _pk < ctx._pantryMin) ctx._pantryMin = _pk; } catch (e2) {}
    // R19: daily pantry atom scan (D2) — any atom > 500 kcal, with item detail.
    try {
      ctx.atomViolations = ctx.atomViolations || [];
      const _pan = ((_G.state || {}).village || {}).pantry || [];
      for (const _p of _pan) {
        const _ke = _p.kcalEach || 0;
        if (_ke > 500) ctx.atomViolations.push({ day: gday(), name: _p.name, plantId: _p.plantId,
          foodKind: _p.foodKind, foodState: _p.foodState, kcalEach: _ke, units: _p.units || 1, edible: !!_p.edible });
      }
      const _mx = _pan.reduce(function (m, _p) { return Math.max(m, _p.kcalEach || 0); }, 0);
      if (ctx._maxAtom == null || _mx > ctx._maxAtom) ctx._maxAtom = _mx;
    } catch (e2) {}
    // R16: scale-ladder trace -- scale rank + active inter-village links
    // every 10 days (does the scale lane move in the deepening window?)
    try {
      const _d = gday();
      if (_d % 10 === 0 && (ctx._scaleTraceLast || 0) !== _d) {
        ctx._scaleTraceLast = _d;
        ctx.scaleTrace = ctx.scaleTrace || [];
        let _nl = 0;
        try { _nl = (_G.hierarchyState() || []).filter(l => l && l.status === 'active').length; } catch (e3) {}
        ctx.scaleTrace.push({ day: _d, scale: scaleNow(), activeLinks: _nl, pop: popAlive() });
      }
    } catch (e2) {}
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
    // PROBE_W3: at day 45, if wave 3 not yet unlocked, simulate the 4
    // wave-2 kills through the honest ledger path, then watch the pipeline.
    if (PROBE_W3 && !ctx.probed && gday() >= 45 && w < 3) {
      ctx.probed = true;
      const ids = ['bright_idea', 'giant_mosquito', 'warranty_caller', 'understudy'];
      for (const id of ids) { try { _G.scoreLedgerKill(id); } catch (e) {} }
      ctx.waveLog.push({ day: gday(), probe: 'w3-injected', w2points: waveLedgerPoints(2), wave: waveNow() });
    }
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
    if (gd === 50 || gd === 70 || gd === 85 || gd === 100) {
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
      ctx.deedLog.push({ day: gd, engaged: eng, wave: w, pop: popAlive(), pantry: pantryKcal(), w3fights: (ctx.fightsByWave || {})[3] || 0,
        scale: scaleNow(), exiled: !!((_G.state.scholar || {}).exiled), links: linkSnap, takeRate7, codexMonsters });
      try {
        const td = JSON.parse(JSON.stringify((_G.state.village || {}).traderDeep || {}));
        ctx.traderDeepSnaps.push({ day: gd, deep: td });
      } catch (e) {}
      // R22: audit-at-final-day (r14 metric review) — record whether gd=100
      // fired; the fallback (after runDays) covers short seeds.
      if (gd === 100) {
        try { ctx.moodAudit100 = moodAudit(); } catch (e) { ctx.moodAudit100 = { err: String(e && e.message) }; }
        ctx._auditFired100 = true;
      }
    }
    // R12: teachableDays sampler DROPPED (r10 metric review — empty 8/8;
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
    // R13: show-memory probe — the day after a televised grab, talk to a
    // participant (their first-person line) or a villager (bystander line).
    // M8 can't fire on fixed convo days alone: pilot grabs landed d88–98,
    // after the day-80 transcript, so the beat was never in the corpus.
    try {
      const lc = ((_G.state || {}).village || {}).lastContest;
      // Fire on first OBSERVATION of a new grab, not exact-day equality:
      // fireContest plants lastContest after the day callback has run for
      // the grab day, so lc.day === gd never matches (probe never fired
      // on the pilot re-run — 8601 grab d88, 0 probes).
      if (lc && (lc.day || 0) > (ctx._lcSeenDay || 0)) {
        ctx._lcSeenDay = lc.day;
        ctx._showProbeDay = gd + 1; ctx._showProbeIds = (lc.ids || []).slice();
      }
    } catch (e) {}
    if (ctx._showProbeDay === gd) {
      ctx._showProbeDay = null;
      let vid = null;
      try {
        const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
        const ids = ctx._showProbeIds || [];
        for (const id of ids) { if (roster.indexOf(id) >= 0 && !person(id).dead) { vid = id; break; } }
        if (!vid) for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = _G.npcComm ? _G.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          vid = id; break;
        }
      } catch (e) {}
      if (vid) {
        try {
          const fp = runConversation(gd, vid, '-showprobe', true);
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
          fs.writeFileSync(`/tmp/journey-deep-r5-stall-${_currentSeed}.json`, JSON.stringify(dump, null, 1));
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
              fs.appendFileSync(`/tmp/journey-deep-r5-stalltrace-${_currentSeed}.txt`,
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
// R12 (2026-10-15, ported from scale r1): the want's menu is suppressed while
// a generic question hangs (convoWantMenu returns [] when c.genericQ is set).
// Fresh-ask wants whose opener is classified yes/no offer only gq:yn:* at
// turn 0 — the want menu (dlg:commit) appears on turn 1 after answering.
// 'unsure' is the honest default; bailing here strands the want unengaged.
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
const CONVO_DAYS = [45, 60, 80];
function runConversation(day, vid, tag, probeMode) {
  const fp = path.join(EVIDIR, `journey-deepening-r24-transcript-${POLICY}-${_currentSeed}-day${day}${tag || ''}.txt`);
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
      // R13 show-probe mode: the point is the lately topic, not the want.
      // Route: dlg:subject (the topic menu) -> ask:lately (the live event).
      // Fall back to the natural driver if the topic menu never appears.
      let pick = null;
      if (probeMode) {
        pick = (choices || []).find(x => x && x.id === 'ask:lately') ||
               (choices || []).find(x => x && x.id === 'dlg:subject');
      }
      if (!pick) pick = pickChoice(choices, turn);
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

// ---- R12 M7 mood-honesty audit ----
// Per living roster villager: the census mood, the needs snapshot npcMood
// actually consults, the 10-day memory history (gift/saved/ignored/
// promise_broken...), their own 10-day disease/cured/trust events, plus the
// village-wide 10-day death and contest context and the village grief/cheer
// fields that npcMood consults. Verdicts are a human sense-read afterwards.
function moodAudit() {
  const day = gday();
  const v = (_G.state && _G.state.village) || {};
  const tel = (_G.state && _G.state.telemetry) || [];
  const in10 = (e) => e && (day - ((e.day || 0))) <= 10;
  const deaths10 = tel.filter(e => e && e.type === 'death' && in10(e))
    .map(e => ({ day: e.day, who: e.who, cause: String(e.cause || '').slice(0, 80), kind: e.kind, player: !!e.player }));
  const contests10 = tel.filter(e => e && (e.type === 'contest_fired' || e.type === 'contest_end') && in10(e))
    .map(e => ({ day: e.day, type: e.type, id: e.contestId || e.id }));
  return (v.roster || []).map(id => {
    const p = person(id);
    let mood = null, n = null;
    try { mood = _G.npcMood ? _G.npcMood(id) : null; } catch (e) {}
    try { const nn = _G.npcNeeds(id); n = { hunger: nn.hunger, fear: nn.fear, social: nn.social, energy: nn.energy }; } catch (e) {}
    const mem = (((v.memory || {})[id] || []).filter(in10))
      .map(m => ({ t: m.t, day: m.day, note: String(m.note || '').slice(0, 120) }));
    const mine = (e) => e && e.target === id;
    return {
      id, name: vname(id), alive: !p.dead, mood, needs: n,
      trust: (v.trust || {})[id],
      memories10d: mem,
      disease10d: tel.filter(e => e && e.type === 'disease' && in10(e) && mine(e)).map(e => ({ day: e.day, id: e.id, pool: e.pool })),
      cured10d: tel.filter(e => e && e.type === 'cured' && in10(e) && mine(e)).map(e => ({ day: e.day, id: e.id })),
      trust10d: tel.filter(e => e && e.type === 'trust' && in10(e) && e.who === id).map(e => ({ day: e.day, delta: e.delta, reason: String(e.reason || '').slice(0, 60) })),
      deaths10d: deaths10, contests10d: contests10,
      villageGrief: v.grief || 0, villageCheer: v.cheer || 0,
    };
  });
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  console.log(`\n########## SEED ${seed} POLICY=${POLICY} (PROBE_W3=${PROBE_W3}) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r24-POLICYX', fullTelemetry: true });
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
  // R14 (counterwire/crisistier): wrap Game.fieldFight + Game.raiseAidCrisis
  // to record trick performances, trick-aware morale beats, flee-mid-trick,
  // and raid aid-crisis tiers. Instrument only — return values untouched.
  fieldFights14 = []; aidCrises14 = [];
  try {
    if (typeof Game.fieldFight === 'function') {
      const _ff = Game.fieldFight.bind(Game);
      Game.fieldFight = function (vid, mdef, m, opts) {
        let rec = null;
        try { rec = _ff(vid, mdef, m, opts); } catch (e) { rec = null; }
        try {
          const md = mdef || {};
          const logTxt = ((rec && rec.log) || []).join('\n');
          fieldFights14.push({
            day: gday(), vid: vid || null,
            vname: (function () { try { return vname(vid); } catch (e) { return vid; } })(),
            mid: md.id || null, mwave: md.wave || 1,
            trickLog: ((rec && rec.trickLog) || []).slice(),
            actionKinds: ((rec && rec.actionKinds) || []).slice(),
            outcome: rec ? rec.outcome : null, rounds: rec ? rec.rounds : 0,
            vHpLeft: rec ? rec.vHpLeft : null, mHpLeft: rec ? rec.mHpLeft : null,
            intent: rec ? rec.intent : null, intentWhy: rec ? rec.intentWhy : null,
            holdLine: logTxt.indexOf(HOLD_LINE_MARK) >= 0,
            fledHopeless: !!(rec && rec.fleeHopeless), fleeHpFrac: rec ? rec.fleeHpFrac : null,
            minHpFrac: rec ? rec.minHpFrac : null,
          });
        } catch (e2) {}
        return rec;
      };
    }
  } catch (e) { console.log('fieldFight wrap ERROR: ' + (e && e.message)); }
  try {
    if (typeof Game.raiseAidCrisis === 'function') {
      const _rac = Game.raiseAidCrisis.bind(Game);
      Game.raiseAidCrisis = function (name, wave) {
        const r = _rac(name, wave);
        try { aidCrises14.push({ day: gday(), name: String(name || '?').slice(0, 80), wave: wave || 1 }); } catch (e) {}
        return r;
      };
    }
  } catch (e) { console.log('raiseAidCrisis wrap ERROR: ' + (e && e.message)); }

  // R19: expedition/HAUL meat deposit instrumentation (D1/D2). Wrap the two
  // villager return-to-pantry legs + the known-meat stockPantry calls.
  // Instrument only — return values and game state untouched.
  var depositEvents19 = [], stockMeat19 = [];
  function pantrySnap19() {
    try {
      return ((Game.state.village || {}).pantry || []).map(function (p) {
        return { name: p.name, plantId: p.plantId, foodKind: p.foodKind, foodState: p.foodState,
          kcalEach: p.kcalEach || 0, units: p.units || 1, hiddenKcal: p.hiddenKcal || 0, edible: !!p.edible };
      });
    } catch (e) { return []; }
  }
  function ufUnits19(snap) {
    return snap.filter(function (p) { return p.foodKind === 'meat' && !p.edible && (p.kcalEach || 0) === 0; })
      .reduce(function (t, p) { return t + (p.units || 1); }, 0);
  }
  function maxAtom19(snap) { return snap.reduce(function (m, p) { return Math.max(m, p.kcalEach || 0); }, 0); }
  try {
    if (typeof Game.expeditionReturn === 'function') {
      const _er = Game.expeditionReturn.bind(Game);
      Game.expeditionReturn = function (vid, playerAtHaven) {
        const before = pantrySnap19();
        const r = _er(vid, playerAtHaven);
        try {
          const after = pantrySnap19();
          depositEvents19.push({ day: gday(), path: 'expedition', vid: vid || null,
            ufBefore: ufUnits19(before), ufAfter: ufUnits19(after),
            maxAtomAfter: maxAtom19(after), pantryPieces: after.length });
        } catch (e2) {}
        return r;
      };
    }
  } catch (e) { console.log('expeditionReturn wrap ERROR: ' + (e && e.message)); }
  try {
    if (typeof Game.objReturnEffect === 'function') {
      const _ore = Game.objReturnEffect.bind(Game);
      Game.objReturnEffect = function (vid, purpose) {
        const before = pantrySnap19();
        const r = _ore(vid, purpose);
        try {
          if (purpose === 'haul') {
            const after = pantrySnap19();
            depositEvents19.push({ day: gday(), path: 'haul', vid: vid || null,
              ufBefore: ufUnits19(before), ufAfter: ufUnits19(after),
              maxAtomAfter: maxAtom19(after), pantryPieces: after.length });
          }
        } catch (e2) {}
        return r;
      };
    }
  } catch (e) { console.log('objReturnEffect wrap ERROR: ' + (e && e.message)); }
  try {
    if (typeof Game.stockPantry === 'function') {
      const _sp = Game.stockPantry.bind(Game);
      Game.stockPantry = function (kcal, name, opts) {
        const r = _sp(kcal, name, opts);
        try {
          if (/expedition|haul/i.test(String(name || ''))) stockMeat19.push({ day: gday(), name: String(name || ''), kcal: Math.round(kcal || 0) });
        } catch (e2) {}
        return r;
      };
    }
  } catch (e) { console.log('stockPantry wrap ERROR: ' + (e && e.message)); }
  await setupGame(Game);
  // W3TRACE: log exactly how each wave-3 startCombat is reached (to a FILE —
  // runDays silences console.log inside the day loop)
  if (process.env.W3TRACE) {
    const _sc = Game.startCombat;
    const traceFp = `/tmp/journey-deep-r5-w3trace-${seed}.txt`;
    try { fs.writeFileSync(traceFp, ''); } catch (e) {}
    const tlog = (s) => { try { fs.appendFileSync(traceFp, s + '\n'); } catch (e) {} };
    Game.startCombat = function (mid) {
      try {
        if (waveOf(mid) === 3) {
          const s = Game.state.scholar || {};
          let tileType = '?';
          try { tileType = (Game.playerTile() || {}).type || '?'; } catch (e) {}
          const wm = (Game.worldMonsters ? Game.worldMonsters() : []).map(m => `${m.id}@${m.tx},${m.ty}`);
          tlog(`### W3 startCombat: ${mid} day=${s.day} map=${Game.map.px},${Game.map.py} tileType=${tileType} exiled=${!!s.exiled} insideHaven=${!!s.insideHaven} insideTent=${!!s.insideTent}`);
          tlog('    wanderer: ' + JSON.stringify(Game.wanderer || null));
          tlog('    activeContest: ' + (Game.state.activeContest ? (Game.state.activeContest.contestId + ' suspended=' + !!Game.state.activeContest.arenaSuspended) : null));
          tlog('    pendingEncounter: ' + !!Game.pendingEncounter + ' pendingId: ' + Game.pendingMonsterId);
          tlog('    worldMonsters: ' + JSON.stringify(wm));
          tlog('    stack: ' + new Error('trace').stack.split('\n').slice(2, 10).join(' | '));
        }
      } catch (e) { tlog('wtrace err ' + e.message); }
      return _sc.call(this, mid);
    };
  }
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r24-POLICYX', date: new Date().toISOString().slice(0, 10), node: process.version, probe: PROBE_W3 } });
  if (policy._ctx && policy._ctx._fr) finalizeFight(policy._ctx);
  const ctx = policy._ctx || {};
  // R22: audit-at-final-day fallback — seeds that never hit gd=100 still
  // count in the census (r14 documented 5/8 seeds missing the day-100 audit).
  if (!ctx._auditFired100) {
    try { ctx.moodAuditFinal = { day: result.gameDays, rows: moodAudit() }; }
    catch (e) { ctx.moodAuditFinal = { day: result.gameDays, err: String(e && e.message) }; }
  }
  // wave-3 kills (player + villager, by type) and fights-by-wave summary
  let waveKills = null;
  try { waveKills = JSON.parse(JSON.stringify(Game.state.waveKills || {})); } catch (e) {}
  let villageSlain = null;
  try { villageSlain = JSON.parse(JSON.stringify(Game.state.villageSlain || {})); } catch (e) {}
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
  // R12 (r10 metric review): the ledger is authoritative — state.waveKills
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
  // R13: M7' win-side inertness under seatdefault-ON. In the day 40–80
  // window the win-side stack should be INERT: no table/deedgate telemetry
  // rows, tableSeat() 'none', no Watchers staged. Viewership REPORTED only
  // (r12 metric review: the contest lane builds an audience independently).
  let winSide = { tableTele: [], tableSeat: null, viewership: null, watchersStaged: 0, watchersOfferDays: [] };
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (!e || !e.type) continue;
      if (/table|deedgate/i.test(e.type)) winSide.tableTele.push({ day: e.day, type: e.type });
    }
  } catch (e3) {}
  try { winSide.tableSeat = ((_G.tableSeat ? _G.tableSeat() : null) || {}).seat || 'none'; } catch (e3) {}
  try { const vv = ((_G.state || {}).village || {}).viewership; winSide.viewership = (vv == null ? null : Math.round(vv)); } catch (e3) {}
  try {
    // regionalPlay answers pendingGlobal immediately (competent play), so a
    // staged-then-answered offer shows up in the regional log, not state.
    const gl = (ctx.regionalLog || []).filter(e => e && e.ev === 'global');
    winSide.watchersStaged = gl.length;
    winSide.watchersOfferDays = gl.map(e => e.day);
    if (_G.state && (_G.state.pendingGlobal || _G.state.globalLive)) winSide.watchersStaged += 100; // left unanswered at seed end
  } catch (e3) {}
  // R13: M8 show-memory (crisis r17 2026-10-15). The 'show' lately topic fires
  // in conversations within a 7d window of a televised grab (village.lastContest).
  // Scan the seed's conversation transcripts for its lines (distinctive:
  // 'on the screens', 'whole fire watched', 'They took me. ', 'imagine the
  // lights', 'Came back like nothing happened').
  const SHOW_MARKERS = ['on the screens', 'whole fire watched', 'They took me. ', 'imagine the lights', 'Came back like nothing happened'];
  const REALM_MARKERS = ['We swore to ', 'The relationship holds', "The pool's open", 'Signed the charter', 'We\'re somebody\'s now'];
  let showBeats = [], realmBeats = [];
  try {
    for (const fp of (ctx.convoFiles || [])) {
      let txt = ''; try { txt = fs.readFileSync(fp, 'utf8'); } catch (e4) { continue; }
      const base = path.basename(fp);
      for (const ln of txt.split('\n')) {
        if (SHOW_MARKERS.some(m => ln.indexOf(m) >= 0)) showBeats.push(base + ' :: ' + ln.trim().slice(0, 160));
        if (REALM_MARKERS.some(m => ln.indexOf(m) >= 0)) realmBeats.push(base + ' :: ' + ln.trim().slice(0, 160));
      }
    }
  } catch (e3) {}
  let lastContest = null;
  try { const lc = ((_G.state || {}).village || {}).lastContest; if (lc) lastContest = { day: lc.day, name: lc.name }; } catch (e3) {}
  const showMemory = { showBeats, realmBeats, lastContest, grabContests: (ctx.contestCalls || 0) };
  try { villageCounterObs = JSON.parse(JSON.stringify(Game.state.villageCounterObs || {})); } catch (e2) {}
  try { monsterCountersKnown = Object.keys(Game.state.monsterCounters || {}); } catch (e2) {}
  try { villagerTricks = Object.keys(Game.state.villagerTricks || {}); } catch (e2) {}
  // R14: counterwire (44de021d) + trick-aware morale (18de8459) + tricktag
  // (de49bea3) + crisistier (f6cecf3c) + meat-haul (76a40da5) + granularity
  // (0152a2ce) + mourning/healer (069af4f3/6d63efe8) analysis.
  const ff14 = fieldFights14 || [];
  const ffW3 = ff14.filter(f => (f.mwave || 1) === 3);
  const ffW3Trick = ffW3.filter(f => (f.trickLog || []).length > 0);
  const newTrickFights = {};
  for (const mid of NEW_W3_TRICKS) newTrickFights[mid] = ffW3Trick.filter(f => f.mid === mid).map(f => ({ day: f.day, who: f.vname, tricks: f.trickLog, outcome: f.outcome, rounds: f.rounds, holdLine: f.holdLine }));
  const oldTrickFights = {};
  for (const mid of OLD_W3_TRICKS) oldTrickFights[mid] = ffW3Trick.filter(f => f.mid === mid).length;
  const holdLineBeats = ff14.filter(f => f.holdLine).map(f => ({ day: f.day, who: f.vname, mid: f.mid, tricks: f.trickLog, minHpFrac: f.minHpFrac, outcome: f.outcome }));
  // flee-mid-trick: villager fled a fight where they had performed a trick
  // (outcome 'vFlee' with non-empty trickLog — the C2 bar is 0 of these)
  const fleeMidTrick = ff14.filter(f => ((f.trickLog || []).length > 0) && (f.outcome === 'vFlee')).map(f => ({ day: f.day, who: f.vname, mid: f.mid, tricks: f.trickLog, fleeHpFrac: f.fleeHpFrac, minHpFrac: f.minHpFrac, fledHopeless: !!f.fledHopeless, fleeLearn: !!f.fleeLearn, holdLine: !!f.holdLine }));
  // R15 C2'': design-honest bar -- hopeless-path violations above the 25%
  // hold-line floor. Floor-path (vBreak) withdrawals are normal morale.
  const fleeMidTrickHopelessOver = fleeMidTrick.filter(f => f.fledHopeless && (f.minHpFrac || 0) > 0.25);
  // R15 C2' (r14 metric review): events above the 25% threshold (all paths).
  const fleeMidTrickOver = fleeMidTrick.filter(f => (f.minHpFrac || 0) > 0.25);
  // C4: waveKillLog tricktag attribution — by=<vid> non-null, via='companion'
  // R22: widened kill-source attribution — the game keeps the FULL
  // waveKillLog (capped at 1000) + waveKillByChannel counters keyed
  // via.w+wave, so no sampling is needed. by: 'p' = the scholar's TB kill;
  // non-null other = a villager/person; null = no recorded killer.
  let killLog = [], killByNonNull = 0, killByPlayer = 0, killByVillager = 0, killViaCompanion = 0, killWithTrick = 0, killByChannel = {};
  try {
    killLog = (Game.state.waveKillLog || []);
    for (const k of killLog) {
      if (k && k.by) { killByNonNull++; if (k.by === 'p') killByPlayer++; else killByVillager++; }
      if (k && k.via === 'companion') killViaCompanion++;
      if (k && k.trick) killWithTrick++;
    }
    killByChannel = JSON.parse(JSON.stringify(Game.state.waveKillByChannel || {}));
  } catch (e2) {}
  // C3: aid-crisis tiers (raid aid-crisis should now raise at real wave)
  const aidCrises = aidCrises14 || [];
  // C5: pantry scan — unknown flesh + granularity guardrail
  let unknownFleshItems = [], unknownFleshUnits = 0, maxPieceKcal = 0, pantryPieces = 0;
  const biggestPieces = [];
  try {
    for (const it of (((_G.state || {}).village || {}).pantry || [])) {
      const ke = (it.kcalEach || 0);
      if (ke > 0) {
        pantryPieces++; if (ke > maxPieceKcal) maxPieceKcal = ke;
        biggestPieces.push({ name: String(it.name || '?').slice(0, 60), kcalEach: ke, units: it.units, foodKind: it.foodKind || null, foodState: it.foodState || null, prep: String(it.prep || '').slice(0, 80) });
      }
      const isUF = (it.name === 'Unknown flesh') || String(it.plantId || '').indexOf('meat_') === 0;
      if (isUF) { unknownFleshItems.push({ name: it.name, plantId: it.plantId, units: it.units, kcalEach: it.kcalEach, hiddenKcal: it.hiddenKcal }); unknownFleshUnits += (it.units == null ? 1 : it.units); }
    }
  } catch (e2) {}
  // R14 text markers: meat-haul, healer memory, multi-name mourning
  const R14_MARKERS = {
    meatHaul: ['is back with strange meat', 'Unknown flesh, heading home'],
    healerMemory: ['sat with me through the worst of it', 'through the fever'],
    // R15: crisis r19 wound-care memories -- combat-wound tending surfaces via
    // the care lately kind, wound-flavored lines (exact beat text from
    // convoTopics.js care/wound branch)
    woundTending: ['bound up my cut', 'wrapped it tight', 'did the work', 'bound up the cut'],
    // R15: succession r20 true-name mourning -- mantle-memory t2LatelyEvent
    // resolves the bearer's recorded name ("their name already carried");
    // "Nobody says X's name right yet" (successor as a new person)
    trueNameMourning: ['their name already carried', 'nobody says', 'name right yet', 'before the Codex did'],
    mourning: ['mourn', 'burial', 'laid to rest', 'we buried'],
    holdLineText: ['holds the line \\u2014 working the trick'],
  };
  const r14MarkerCounts = {}, r14MarkerLines = {};
  for (const [k, marks] of Object.entries(R14_MARKERS)) {
    r14MarkerCounts[k] = 0; r14MarkerLines[k] = [];
    for (const mk of marks) {
      let ix = 0; const low = capText.toLowerCase(), mkl = mk.toLowerCase();
      while ((ix = low.indexOf(mkl, ix)) >= 0) {
        r14MarkerCounts[k]++;
        if (r14MarkerLines[k].length < 6) r14MarkerLines[k].push(capText.slice(Math.max(0, ix - 60), ix + mkl.length + 120).replace(/\n/g, ' '));
        ix += mkl.length;
      }
    }
  }
  // multi-name mourning: mourning lines naming 2+ currently-dead villagers
  const deadNames = new Set();
  try { for (const d of (deathsSoFar() || [])) { const nm = String(d.who || '').split(' ')[0]; if (nm) deadNames.add(nm.toLowerCase()); } } catch (e2) {}
  const multiNameMourning = [];
  try {
    for (const ln of capText.split('\n')) {
      const l = ln.toLowerCase();
      if (l.indexOf('mourn') < 0 && l.indexOf('burial') < 0 && l.indexOf('we buried') < 0 && l.indexOf('laid to rest') < 0) continue;
      const hits = [...deadNames].filter(n => n.length > 2 && l.indexOf(n) >= 0);
      if (hits.length >= 2) multiNameMourning.push(ln.trim().slice(0, 220));
    }
  } catch (e2) {}


  // R15 E1: execution-window resolution census -- do performed tricks RESOLVE?
  // Channels: vKill (monster dead), mFlee (monster fled -- includes
  // trick-dismissals), evade (fight avoided), vFlee (villager fled),
  // vDie (villager died), alreadyDead.
  const OUTCOMES = ['vKill', 'mFlee', 'evade', 'vFlee', 'vDie', 'alreadyDead', 'other'];
  const ocDist = (rows) => {
    const d = {}; for (const o of OUTCOMES) d[o] = 0;
    for (const f of rows) { const o = OUTCOMES.indexOf(f.outcome) >= 0 ? f.outcome : 'other'; d[o]++; }
    return d;
  };
  const ffW3NoTrick = ffW3.filter(f => (f.trickLog || []).length === 0);
  const resolution = { trickFights: ocDist(ffW3Trick), noTrickFights: ocDist(ffW3NoTrick) };
  const trickFightDetails = ffW3Trick.map(f => ({ day: f.day, who: f.vname, mid: f.mid, tricks: f.trickLog, outcome: f.outcome, rounds: f.rounds, minHpFrac: f.minHpFrac, mHpLeft: f.mHpLeft }));
  // R15: missed-opportunity census -- w3 field fights with NO trick performed:
  // which monsters, and did the village know their trick at fight time?
  // (villageKnows snapshot at analysis = end of run; day vs discovery day
  // would be exact, but end-of-run knowledge is the honest upper bound.)
  let villageKnows = {};
  try { villageKnows = Game.state.villagerTricks || {}; } catch (e2) {}
  const noTrickFightDetails = ffW3NoTrick.map(f => ({ day: f.day, who: f.vname, mid: f.mid, outcome: f.outcome, rounds: f.rounds, villageKnowsTrick: !!villageKnows[f.mid] }));

  // R16: WAVE-2 CONTENT census -- the deepening leg's middle fauna.
  // Distinct types faced (player TB fights + villager field fights),
  // ledger kills by type, counter discoveries (via channels) and
  // performances in real fights.
  let w2Ids = new Set();
  try { for (const m of (_G.data.monsters || [])) { if ((m.wave | 0) === 2) w2Ids.add(m.id); } } catch (e2) {}
  const ffW2 = ff14.filter(f => (f.mwave || 1) === 2);
  const ffW2Trick = ffW2.filter(f => (f.trickLog || []).length > 0);
  const w2FacedField = [...new Set(ffW2.map(f => f.mid).filter(id => id && w2Ids.has(id)))];
  const w2FacedPlayer = [...new Set((ctx.fightsLog || []).flatMap(f => (f.monsters || []).filter(m => (m.wave || 1) === 2).map(m => m.id).filter(id => id && w2Ids.has(id))))];
  const w2Faced = [...new Set(w2FacedField.concat(w2FacedPlayer))];
  const w2killsByType = {};
  try {
    const L2 = (Game.ledgerState && Game.ledgerState()[2]) || {};
    for (const [mid, pts] of Object.entries(L2.perType || {})) w2killsByType[mid] = pts;
  } catch (e2) {}
  const w2Discoveries = (counterDiscoveredEvents || []).filter(e => w2Ids.has(e.id));
  const w2Known = (monsterCountersKnown || []).filter(id => w2Ids.has(id));
  const w2ObservedEvents = (counterObservedEvents || []).filter(e => w2Ids.has(e.id));
  const w2TrickFights = ffW2Trick.map(f => ({ day: f.day, who: f.vname, mid: f.mid, tricks: f.trickLog, outcome: f.outcome, rounds: f.rounds, minHpFrac: f.minHpFrac, holdLine: !!f.holdLine }));
  const w2ByType = {};
  for (const id of w2Ids) {
    w2ByType[id] = {
      faced: w2Faced.indexOf(id) >= 0,
      fieldFights: ffW2.filter(f => f.mid === id).length,
      trickFights: ffW2Trick.filter(f => f.mid === id).length,
      ledgerPts: w2killsByType[id] || 0,
      discovered: w2Known.indexOf(id) >= 0,
      via: (w2Discoveries.find(e => e.id === id) || {}).via || null,
    };
  }
  // R16: wave-2 missed-opportunity census -- no-trick field fights where
  // the village ALREADY knew the counter (end-of-run monsterCounters as the
  // honest upper bound, same convention as r15's E1). Plus intent split:
  // how many no-trick w2 fights had intent 'engage' via trick-known.
  // R24 (r23 metric review): only count fights where the villager had >=1
  // turn (actionKinds.length>=1) — rounds=0 flee-before-action was over-counted.
  let w2KnownSet = {};
  try { w2KnownSet = Game.state.monsterCounters || {}; } catch (e2) {}
  const ffW2NoTrick = ffW2.filter(f => (f.trickLog || []).length === 0);
  const w2Missed = ffW2NoTrick.filter(f => f.mid && w2KnownSet[f.mid] && (f.actionKinds || []).length >= 1);
  const w2MissedDetail = w2Missed.map(f => ({ day: f.day, who: f.vname, mid: f.mid, outcome: f.outcome, rounds: f.rounds, intent: f.intent, intentWhy: f.intentWhy }));
  const w2MissedRaw = ffW2NoTrick.filter(f => f.mid && w2KnownSet[f.mid]);
  const w2NoTrickIntent = {};
  for (const f of ffW2NoTrick) { const k = (f.intentWhy || 'unknown'); w2NoTrickIntent[k] = (w2NoTrickIntent[k] || 0) + 1; }
  // R24: THE TRICK FUNNEL (tightened R2). Actuable wave-1/2 counter kinds per
  // fieldFights.js (deliberate boundary: the other 13 kinds are un-actuatable,
  // never faked): shout (belltoad, hummice, sanjun), offer_food (lockpick_raccoon).
  // Opportunity = field fight vs one of these mids where the counter was known
  // at fight time (first counterDiscovered day <= fight day) and the villager
  // had >=1 turn. Performance = trickLog contains the kind. Teaching =
  // counter_discovered via='taught' (+ teach-chain depth from consecutive days).
  const ACTUABLE_W12 = { belltoad: 'shout', hummice: 'shout', sanjun: 'shout', lockpick_raccoon: 'offer_food' };
  const discoveryDay = {};
  for (const e of (counterDiscoveredEvents || [])) {
    if (e && e.id && (discoveryDay[e.id] === undefined || e.day < discoveryDay[e.id])) discoveryDay[e.id] = e.day;
  }
  const ffActuable = (fieldFights14 || []).filter(f => f.mid && ACTUABLE_W12[f.mid] && (f.actionKinds || []).length >= 1);
  const funnelOpportunities = ffActuable.filter(f => discoveryDay[f.mid] !== undefined && discoveryDay[f.mid] <= f.day);
  const funnelPerformed = funnelOpportunities.filter(f => ((f.trickLog || []).indexOf(ACTUABLE_W12[f.mid]) >= 0));
  const funnelUnknown = ffActuable.filter(f => !(discoveryDay[f.mid] !== undefined && discoveryDay[f.mid] <= f.day));
  const funnelDetail = funnelOpportunities.map(f => ({ day: f.day, who: f.vname, mid: f.mid, kind: ACTUABLE_W12[f.mid], performed: (f.trickLog || []).indexOf(ACTUABLE_W12[f.mid]) >= 0, tricks: f.trickLog, outcome: f.outcome, rounds: f.rounds, intent: f.intent }));
  const actuableFightsRaw = ffActuable.map(f => ({ day: f.day, who: f.vname, mid: f.mid, kind: ACTUABLE_W12[f.mid], knownAtFight: discoveryDay[f.mid] !== undefined && discoveryDay[f.mid] <= f.day, tricks: f.trickLog, outcome: f.outcome, rounds: f.rounds }));
  // Teach channel: via='taught' discoveries + consecutive-day teach chains.
  const taughtEvents = (counterDiscoveredEvents || []).filter(e => e.via === 'taught');
  const teachChains = {};
  for (const e of taughtEvents) { teachChains[e.id] = (teachChains[e.id] || 0) + 1; }
  const trickFunnel = {
    actuableKinds: ACTUABLE_W12,
    fightsVsActuableMids: ffActuable.length,
    opportunities: funnelOpportunities.length,   // known at fight time, >=1 turn
    performed: funnelPerformed.length,           // trick fired
    unknownAtFight: funnelUnknown.length,        // fought the monster, didn't know the trick
    opportunitiesDetail: funnelDetail,
    actuableFightsRaw,
    taughtDiscoveries: taughtEvents.length,
    taughtByMid: teachChains,
    beasttricksAsked: ctx.beasttricksAsked || 0, beasttricksTaught: ctx.beasttricksTaught || 0,
  };
  // R16: regional/scale summary from the scale trace + regionalLog.
  const scaleTrace = ctx.scaleTrace || [];
  const regionalEvents = (ctx.regionalLog || []).map(e => ({ day: e.day, ev: e.ev, target: e.target || e.name || null, how: e.how || e.result || null }));
  const linkEvents = regionalEvents.filter(e => ['propose', 'counter', 'accord', 'national'].indexOf(e.ev) >= 0);
  const maxScale = scaleTrace.length ? scaleTrace[scaleTrace.length - 1].scale : scaleNow();
  const out = {
    seed, policy: POLICY, probe: PROBE_W3, maxGameDay: result.gameDays, endReason: result.endReason,
    exileLog: ctx.exileLog || [], exiledAtEnd: !!((Game.state.scholar || {}).exiled),
    deathHonesty: { causes: DEATHS.causes, playerDeaths: DEATHS.playerDeaths, mislabels: DEATHS.mislabels },
    counterParity: { observedEvents: counterObservedEvents, discoveredEvents: counterDiscoveredEvents,
      obsBar: villageCounterObs, known: monsterCountersKnown, villagerTricks },
    markerCounts,
    waveLog: ctx.waveLog || [], deedLog: ctx.deedLog || [],
    moodAudit100: ctx.moodAudit100 || null, moodAuditFinal: ctx.moodAuditFinal || null,
    finalWave: waveNow(), finalScale: scaleNow(), probed: !!ctx.probed,
    w3unlock: (() => { const e = (ctx.waveLog || []).find(x => x && (x.wave || 0) >= 3); return e ? { day: e.day, w2pointsAtUnlock: e.w2points } : { day: null }; })(),
    engaged: { w1: waveEngaged(1), w2: waveEngaged(2), w3: waveEngaged(3), w4: waveEngaged(4), w5: waveEngaged(5) },
    wavesFaced,
    winSide,
    showMemory,
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
    // R14: new-system instruments
    counterwire: {
      fieldFightsTotal: ff14.length,
      fieldFightsW3: ffW3.length,
      fieldFightsW3WithTricks: ffW3Trick.length,
      newTrickFights, oldTrickW3Fights: oldTrickFights,
      holdLineBeats, fleeMidTrick, fleeMidTrickOver, fleeMidTrickHopelessOver,
      resolution, trickFightDetails, noTrickFightDetails,
    },
    killAttribution: { logSampled: killLog.length, byNonNull: killByNonNull, byPlayer: killByPlayer, byVillager: killByVillager,
      byNull: killLog.length - killByNonNull, viaCompanion: killViaCompanion, withTrick: killWithTrick, byChannel: killByChannel,
      companionSample: killLog.filter(k => k && k.via === 'companion').slice(0, 5) },
    aidCrises,
    expeditionMeat: { deposits: depositEvents19, stockPantryMeat: stockMeat19,
      atomViolations: ctx.atomViolations || [], maxAtomKcal: ctx._maxAtom || 0,
      contactDays: depositEvents19.filter(function (d) { return d.ufAfter > d.ufBefore; }).length,
      knownMeatKcal: stockMeat19.reduce(function (t, e) { return t + (e.kcal || 0); }, 0) },
    pantry: { unknownFleshItems, unknownFleshUnits, maxPieceKcal, pantryPieces, pantryMin: (ctx._pantryMin == null ? null : Math.round(ctx._pantryMin)),
      biggestPieces: biggestPieces.sort((a, b) => b.kcalEach - a.kcalEach).slice(0, 5) },
    r14Markers: { counts: r14MarkerCounts, lines: r14MarkerLines, multiNameMourning },
    // R16: wave-2 content census + regional/scale
    wave2: {
      distinctFaced: w2Faced.length, facedList: w2Faced,
      facedField: w2FacedField, facedPlayer: w2FacedPlayer,
      fieldFights: ffW2.length, trickFights: ffW2Trick.length,
      discoveries: w2Discoveries, observedEvents: w2ObservedEvents.length,
      known: w2Known, byType: w2ByType, killsByType: w2killsByType,
      trickFightDetails: w2TrickFights,
      missedOpportunities: w2Missed.length, missedDetail: w2MissedDetail,
      missedRawPreFix: w2MissedRaw.length,   // r24: over-counted instrument for comparison
      noTrickIntent: w2NoTrickIntent, noTrickFights: ffW2NoTrick.length,
    },
    // R24: the trick funnel (tightened R2) + teach channel (R3)
    trickFunnel,
    regional: { scaleTrace, regionalEvents, linkEvents, maxScale },
  };
  const fp = path.join(EVIDIR, `journey-deepening-r24-${POLICY}-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  if (process.env.CAPTURE_DUMP) {
    try {
      let txt = capture.join('\n');
      if (txt.length > 1500 * 1024) txt = txt.slice(0, 1500 * 1024) + '\n[TRUNCATED at 1.5MB]';
      fs.writeFileSync(`/tmp/r9-cap-${POLICY}-${seed}.txt`, txt);
    } catch (e) {}
  }
  const w3n = w3fights.length;
  const ws = winSide || { tableTele: [], tableSeat: null, viewership: null };
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} w3fights=${w3n} engagedW3=${waveEngaged(3)} pop=${popAlive()} seat=${ws.tableSeat} watchers=${ws.watchersStaged} viewers=${ws.viewership} tableRows=${ws.tableTele.length} showBeats=${showBeats.length} realmBeats=${realmBeats.length} ffW3=${ffW3.length} ffW3trick=${ffW3Trick.length} newTrick=${Object.values(newTrickFights).reduce((a,b)=>a+b.length,0)} holdLine=${holdLineBeats.length} fleeMidTrick=${fleeMidTrick.length} fleeOver=${fleeMidTrickOver.length} hopelessOver=${fleeMidTrickHopelessOver.length} res=${JSON.stringify(resolution.trickFights)} aidC=${aidCrises.length} comp=${killViaCompanion} uFlesh=${unknownFleshUnits} maxPiece=${maxPieceKcal} w2faced=${w2Faced.length} w2disc=${w2Discoveries.length} w2trick=${ffW2Trick.length} scale=${maxScale} links=${linkEvents.length} ms=${result.ms} dep=${depositEvents19.length} depUF=${depositEvents19.filter(d=>d.ufAfter>d.ufBefore).length} viol=${(ctx.atomViolations||[]).length} maxAtom=${ctx._maxAtom||0} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const s of summary) {
    const par = s.counterParity || {};
    const obsN = (par.observedEvents || []).length, discN = (par.discoveredEvents || []).length;
    const dh = (s.deathHonesty || {}).mislabels || [];
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} wave=${s.finalWave} w3fights=${(s.w3fights || []).length} engagedW3=${(s.engaged || {}).w3} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} counterObs=${obsN} counterDisc=${discN} mislabels=${dh.length} ffW3trick=${((s.counterwire || {}).fieldFightsW3WithTricks) || 0} newTrick=${Object.values(((s.counterwire || {}).newTrickFights) || {}).reduce((a,b)=>a+(b||[]).length,0)} holdLine=${(((s.counterwire || {}).holdLineBeats) || []).length} aidC=${((s.aidCrises) || []).length} comp=${(((s.killAttribution) || {}).viaCompanion) || 0} w2=${(((s.wave2) || {}).distinctFaced) || 0} w2d=${(((s.wave2) || {}).discoveries || []).length} w2t=${(((s.wave2) || {}).trickFights) || 0} scale=${(((s.regional) || {}).maxScale) || '?'} links=${(((s.regional) || {}).linkEvents || []).length}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
