#!/usr/bin/env node
// scripts/journey-scale-r9-20261019.js — journey leg SCALE (days 80–140) R9:
// the REFUSE-road verdict on the current tip (PILOT: 3 seeds).
//
// R1/R2 measured LEAD shape (scale-wall found + fixed 2026-10-12), R3
// COVENANT, R4 BELONG, R5 TRADE (all GO). R6 measured the conquest road
// shape, R7 rendered the conquest verdict + fixed the Iron Court MERCY trap
// (58179595e). R8 re-measured the LEAD road on the tip. R9 verdicts the
// SIXTH road: REFUSE — a competent player who reaches a national beat and
// refuses the scale itself (answerNationalChoice('refuse')). Mechanics in
// src/js/hierarchy.js (refuseTheScale, the offer on every national beat)
// have a unit proof (test-national-shapes-20261010.js section D) but NO
// journey verdict — no full run, no census, no people check. This pilot
// runs 3 seeds; the full 8-seed run is a coordinator call on the pilot.
//
// Policy: policies/refusecourt.js — leadcourt-identical courtship
// (propose/tend subordinates, answer accord/counter), but the
// pendingNational branch ALWAYS answers 'refuse'. A competent player
// answers the mail — never leaves pendingNational pending.
//
// PRE-REGISTER (2026-10-19, MEASUREMENT.md §§9–12, 14):
//   Leg question: does the REFUSE road stage, play, and hold as a lived
//   path in days 80–140? A competent player courts a national beat and
//   refuses the scale itself — do the offer and refusal play aloud, does
//   the refusal hold permanently (no re-offer), do bilateral relationships
//   survive, and does the village survive/thrive as a free fire at
//   regional?
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     M1 staging — ≥2/8 seeds stage a national beat (pendingNational) inside
//       game-day 140.
//     M2 refuse mechanics — on every seed staging a national beat,
//       answerNationalChoice('refuse') returns 'refused', scaleRefused=true
//       with day+shape recorded, no second national offer afterward,
//       scaleRank stays regional through run end.
//     M3 bilateral survival — refusal does not break the beat's bilateral
//       links (active at d140 or ended only by normal causes).
//     M4 people — ≥8 transcripts sense-read (coordinator), 0 senseless flags.
//     M5 survival — ≥4/8 seeds reach d100+ (death-aware).
//   Interesting-finding bar: the refuse beat's exact copy per shape (does it
//   name the shape refused?); a refused village's pantry economy (no polity
//   drains — verified); foreign polities climbing off-screen while Haven
//   stays regional; wave-4 arrival at regional post-refusal; any post-refusal
//   scale nagging; how the table reads to a refused village
//   (arc4_deed_gate needs national+ — verify no crash/softlock on a
//   permanently refused run).
//   Horizon: DAYCAP=185 loop-days targeting ~140 game-days, death-aware stop
//   (+10d tail max). The leg window (80–140) is read in game-days.
//   Seeds: 9701–9708 (fresh). Policy: refusecourt.
// Usage: SEEDS=9701,9702 node scripts/journey-scale-r9-20261019.js

'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9701, 9702, 9703, 9704, 9705, 9706, 9707, 9708]);
const DAYCAP = parseInt(process.env.DAYCAP || '185', 10);

const { mulberry32, loadGame, setupGame, runDays, driveFights, driveContests } = require('./sim-harness');
const { refusecourt } = require('./policies/refusecourt');
const POLICY = 'refusecourt';
const BASE = refusecourt;

const EVIDIR = process.env.EVIDIR || path.join(ROOT, 'evidence', '2026-10-19');

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
const SCALE_MARKERS = {
  national: ['national'], tribute: ['tribute'],
  // SHAPE-AWARE BEATS (r6 metric review revision): per-shape staging counts,
  // not the LEAD-shaped markerCounts.firstCourt.
  firstCourt: ['first court'], ironCourt: ['iron court', 'the yoke', 'yoke eases', 'opens the cages'],
  foundingCouncil: ['founding council'], theCharter: ['the charter'], theBinding: ['the binding'],
  binding: ['binding', 'swear the oath'], watchers: ['watcher'], table: ['the table'],
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
    // R9: the harness's backstop for a pending national the policy missed.
    // The refuse road ALWAYS refuses — a competent player answers the mail.
    if (st.pendingNational) {
      const shape = st.pendingNational.shape;
      try { _G.answerNationalChoice('refuse'); note({ ev: 'national', shape, how: 'refuse', scale: scaleNow() }); } catch (e) { note({ ev: 'national', shape, how: 'refuse', err: String(e && e.message) }); }
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
        fs.writeFileSync(`/tmp/journey-scale-r9-w3leadup-${_currentSeed}-day${rec.day}.txt`, pre + '\n\n===== FIGHT START =====\n' + capture.slice(rec.capStart, rec.capStart + 60).join('\n'));
      } catch (e) {}
    }
    // W3FULL: full fight text for wave-3 fights (r4 signature-mechanics honesty audit)
    // ALLFIGHTS=1: dump every fight (r4 stall investigation)
    if ((process.env.W3FULL && rec.monsters.some(m => (m.wave || 1) === 3)) || process.env.ALLFIGHTS) {
      try {
        const mids = rec.monsters.map(m => m.mid).join('-');
        let txt = capture.slice(rec.capStart).join('\n');
        if (txt.length > 500 * 1024) txt = txt.slice(0, 500 * 1024) + '\n[TRUNCATED at 500KB]';
        fs.writeFileSync(`/tmp/journey-scale-r9-fight-${_currentSeed}-day${rec.day}-${mids}.txt`, txt);
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
  policy.id = 'journey-scale-r9-' + POLICY;
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
    // R9: REFUSE-road instrumentation (harness-only wraps; zero gameplay effect)
    ctx.nationalStagings = [];   // {day, shape, villages} — every stageNationalBeat that fires
    ctx.nationalAnswers = [];    // {day, how, res} — every answerNationalChoice call
    ctx.reOfferLog = [];         // distinct post-refusal re-stagings (must stay empty)
    try {
      const _snb = G.stageNationalBeat;
      if (typeof _snb === 'function') {
        G.stageNationalBeat = function (polity) {
          const r = _snb.apply(this, arguments);
          try {
            if (r) {
              const pn = this.state.pendingNational || {};
              ctx.nationalStagings.push({ day: gday(), shape: pn.shape || '?', villages: (pn.villages || []).length });
            }
          } catch (e2) {}
          return r;
        };
      }
    } catch (e) {}
    try {
      const _anc = G.answerNationalChoice;
      if (typeof _anc === 'function') {
        G.answerNationalChoice = function (how) {
          const r = _anc.apply(this, arguments);
          try { ctx.nationalAnswers.push({ day: gday(), how, res: String(r) }); } catch (e2) {}
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
    // R9: refusal bookkeeping + re-offer watch (a re-staging post-refusal is a bug — loud)
    try {
      const sr = !!((_G.state || {}).scaleRefused);
      if (sr && ctx.refuseDay == null) {
        ctx.refuseDay = gday();
        try { ctx.refuseShape = _G.state.scaleRefusedShape || '?'; } catch (e2) { ctx.refuseShape = '?'; }
        // bilateral links standing at refusal time — M3: the refusal must
        // not break them (only the polity is refused)
        try {
          ctx.refuseLinks = (_G.hierarchyState() || []).filter(l => l && l.status === 'active')
            .map(l => String(l.id).slice(-6));
        } catch (e2) { ctx.refuseLinks = []; }
      }
      if (sr) {
        const pn = _G.state.pendingNational;
        if (pn && !ctx._sawPendingPostRefuse) {
          ctx.reOfferCount = (ctx.reOfferCount || 0) + 1;
          ctx.reOfferLog.push({ day: gday(), shape: pn.shape });
          console.log(`*** RE-OFFER day ${gday()}: pendingNational staged post-refusal (shape=${pn.shape}) — BUG`);
        }
        ctx._sawPendingPostRefuse = !!pn;
      }
    } catch (e) {}
    // deed checkpoints (the endgame currency)
    const gd = gday();
    // exile-transition watch (fair-share fix measurement, legacy)
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
        exiled: !!((_G.state.scholar || {}).exiled), takeRate7, codexMonsters,
        // R9: the region climbs without you — foreign polities off-screen while Haven stays regional
        foreignPolities: (() => { try { return (_G.foreignPolities() || []).map(p => ({ primary: p.primary, subs: (p.subs || []).length, day: p.day })); } catch (e) { return null; } })(),
      }, scaleSnap()));
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
          fs.writeFileSync(`/tmp/journey-scale-r9-stall-${_currentSeed}.json`, JSON.stringify(dump, null, 1));
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
              fs.appendFileSync(`/tmp/journey-scale-r7-stalltrace-${_currentSeed}.txt`,
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
  const fp = path.join(EVIDIR, `journey-scale-r9-transcript-${_currentSeed}-day${day}.txt`);
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
  // R9: the refuse road courts lead-shaped links — no raids (warcourt owns the war road).
  delete process.env.WARCOURT_RAID;
  console.log(`\n########## SEED ${seed} POLICY=${POLICY} SCALE-R9 ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r9-refuse', fullTelemetry: true });
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
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-scale-r9-refuse', date: new Date().toISOString().slice(0, 10), node: process.version } });
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
  // social/text markers over captured text (pre-r9 legacy name kept on the variable)
  const TEXT_MARKERS = { exile: ['cast out', 'exiled', 'exile'], moot: ['moot'], theft: ['theft', 'stealing', 'stole'], confrontation: ['confront'] };
  const markerCounts = {};
  for (const [k, marks] of Object.entries(TEXT_MARKERS)) {
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
    .filter(l => /first court|the binding|swear the oath|opens the cages|the yoke|yoke eases|founding council|the charter|renegotiat|seasoned/i.test(l))
    .slice(0, 60);
  // R9: the REFUSE road's own beat text — the staging copy carrying
  // 'REFUSE the scale' (one per shape) and refuseTheScale's two say lines.
  const refuseBeatText = capText.split('\n')
    .filter(l => /REFUSE the scale|Noted\. The offer is withdrawn|refuses the scale\. Every kcal/i.test(l))
    .slice(0, 30);
  // R9: end-state instruments
  const scaleRefused = !!((_G.state || {}).scaleRefused);
  let scaleRefusedDay = null, scaleRefusedShape = null;
  try { scaleRefusedDay = _G.state.scaleRefusedDay != null ? _G.state.scaleRefusedDay : null; } catch (e) {}
  try { scaleRefusedShape = _G.state.scaleRefusedShape || null; } catch (e) {}
  let leaguePoolKcalEnd = null;
  try { leaguePoolKcalEnd = Math.round(_G.state.leaguePoolKcal || 0); } catch (e) {}
  let deedGateEnd = null;
  try { deedGateEnd = _G.deedGateReady ? _G.deedGateReady() : null; } catch (e) { deedGateEnd = { err: String(e && e.message) }; }
  // M3: bilateral links at refusal vs at end — dissolved post-refusal are a finding.
  // R9 blank #1 fix: the break's day+cause live on the link's own history
  // (_linkNote stamps {day, kind:'broken', note:'Link broken (<how>)'}) —
  // project them here so the census reads when and why, not just the id.
  let linksDissolvedPostRefusal = null;
  try {
    const atRefusal = ctx.refuseLinks || null;
    if (atRefusal) {
      const byId = {};
      ((_G.hierarchyState() || [])).forEach(function (l) { if (l && l.id) byId[String(l.id).slice(-6)] = l; });
      const endActive = new Set(Object.keys(byId).filter(function (k) { return byId[k].status === 'active'; }));
      linksDissolvedPostRefusal = atRefusal.filter(function (id) { return !endActive.has(id); }).map(function (id) {
        const l = byId[id];
        const brk = l && (l.history || []).filter(function (h) { return h && h.kind === 'broken'; });
        const last = brk && brk.length ? brk[brk.length - 1] : null;
        return { id: id, day: last ? last.day : null, cause: last ? last.note : null };
      });
    }
  } catch (e) { linksDissolvedPostRefusal = null; }
  // pantry tribute items at end — incoming tribute must arrive whole (never ×1.25 post-refusal)
  let tributeInEnd = [];
  try {
    tributeInEnd = ((_G.state.village || {}).pantry || [])
      .filter(it => /Tribute grain from/i.test(it.name || ''))
      .map(it => ({ name: it.name, kcalEach: it.kcalEach, units: it.units || 1 }));
  } catch (e) {}
  const out = {
    seed, policy: POLICY, maxGameDay: result.gameDays, endReason: result.endReason,
    nationalFirstDay: ctx.nationalFirstDay == null ? null : ctx.nationalFirstDay,
    nationalHeldDays: ctx.nationalHeldDays || 0,
    scaleBeatText,
    // R9 REFUSE-road instruments
    scaleRefused, scaleRefusedDay, scaleRefusedShape,
    refuseOfferDay: (ctx.nationalStagings || [])[0] ? ctx.nationalStagings[0].day : null,
    reOfferCount: ctx.reOfferCount || 0, reOfferLog: ctx.reOfferLog || [],
    nationalStagings: ctx.nationalStagings || [],
    nationalAnswers: ctx.nationalAnswers || [],
    refuseDay: ctx.refuseDay == null ? null : ctx.refuseDay,
    refuseShape: ctx.refuseShape || null,
    refuseLinksAtRefusal: ctx.refuseLinks || null,
    linksDissolvedPostRefusal,
    refuseBeatText,
    pantryEnd: pantryKcal(),
    leaguePoolKcalEnd,
    deedGateEnd,
    tributeInEnd: tributeInEnd.slice(0, 20),
    refuseAnswerLog: ctx.refuseAnswerLog || [],
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
  out.finalSnap = scaleSnap();
  const fp = path.join(EVIDIR, `journey-scale-r9-${POLICY}-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  if (process.env.CAPTURE_DUMP) {
    try {
      let txt = capture.join('\n');
      if (txt.length > 1500 * 1024) txt = txt.slice(0, 1500 * 1024) + '\n[TRUNCATED at 1.5MB]';
      fs.writeFileSync(`/tmp/r9-cap-${POLICY}-${seed}.txt`, txt);
    } catch (e) {}
  }
  const w3n = w3fights.length;
  const r9line = scaleRefused
    ? ` refused=d${scaleRefusedDay} shape=${scaleRefusedShape} reOffers=${ctx.reOfferCount || 0} linksBrokenPostRefuse=${(linksDissolvedPostRefusal || []).length} poolEnd=${leaguePoolKcalEnd}`
    : ' refused=NO(never staged)';
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} scale=${scaleNow()} national=${out.finalSnap.nationalLive ? 'ON' : 'off'}${r9line} viewers=${out.finalSnap.viewership} seat=${out.finalSnap.tableSeat || 'none'} pop=${popAlive()} ms=${result.ms} -> ${fp}`);
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
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} wave=${s.finalWave} w3fights=${(s.w3fights || []).length} engagedW3=${(s.engaged || {}).w3} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} counterObs=${obsN} counterDisc=${discN} mislabels=${dh.length}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
