// scripts/journey-scale-r125-20261110.js — journey-scale r123 driver cloned,
// labels/EVIDIR only, PLUS the r125 death-cause census instrument:
//   scripts/policies/scalecourt-traderoad-r113-linkraise-sit.js (require —
//   not a copy): trade-first peer proposals, covenant walks while trade
//   is viable, sub-cap 2 on raise-answers (POLICY-SIDE, zero src/js).
//   scripts/ladder-instrument-20261109.js (require — not a copy): the r112
//   Standing-ladder trace (read-only daily snapshot + delegating
//   wrappers + veteran-attribution fields).
//   scripts/traderoad-instrument-20261109.js (require — not a copy):
//   the r122 trade-road trace (answerNationalChoice wrapper + daily
//   trade snapshot) and the wild wave-4 watch (fieldFight wrapper).
//   scripts/deathcensus-instrument-20261110.js (require — not a copy):
//   the r125 death-cause census (fallen + telemetry diffs, daily
//   context, reconciliation — read-only, no wrappers).
//   PLUS the pre-registered delivery verb: after the daily snapshot, if
//   ladderStage() >= 3 and no capstone is delivered, the driver attempts
//   delivery in the order trade_charter -> feast_embassy ->
//   military_tribute (free deeds first, the costly tribute last) — a
//   competent player at National with a ready capstone delivers it; the
//   delivery entry point is wired-exempt (app.js panelHaven only), so
//   without this driver verb the full seat is untestable in sims.
// The regionalstep recorder (scripts/regionalstep-instrument-20261107.js,
// require — not a copy) stays attached as a read-only daily instrument.
// PRE-REGISTER: evidence/2026-11-10/journey-scale-r125-prereg.md
// (binding; Q1: ATTRIBUTION — did the wideduty medic-duty widening
//   cause r123's survival collapse? Arm A = r123's published band
//   (reused, not re-run); Arm B = this driver's band on the reverted
//   base (17777346b minus the wideduty game.js hunk). Q2: the census
//   itself — every death attributed, books close. Q3: mechanism.
//   Q4: people check. Q5: census.)
//   Horizon: DAYCAP=180 loop-days, death-aware stop.
//   Seeds: MATCHED PANEL 97901-97904 (the r112/r113/r122/r123 band —
//   before = r123's published band; after = this run's Arm B on the
//   reverted base; NOT a fresh band — see prereg for the reuse note).
//   Pilot: seed 97904 first; if it crashes or the recorder errors, STOP.
//   Pilot also gates the new instrument: census errors > 0, 0 census
//   rows, reconciliation residual != 0, or 0 studies by d60 means
//   STOP and diagnose (INCOMPLETE, not a verdict).
// Usage: SEEDS=97901 node scripts/journey-scale-r125-20261110.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [97901, 97902, 97903, 97904]);
const DAYCAP = parseInt(process.env.DAYCAP || '180', 10);
const SUBJECT_FIRST = process.env.WANT_SUBJECT === '1';
const GOSSIP_FIRST = process.env.GOSSIP_FIRST === '1';
// R55 PROBE: extra talks with a pinned NPC on extra days (probe-only runs;
// inert before the first probe day, so a probe run matches the quad run
// through day 90).
const PROBE_VID = process.env.PROBE_VID || null;
const PROBE_DAYS = (process.env.PROBE_DAYS || '').split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n));
const PROBE_SEED = parseInt(process.env.PROBE_SEED || '85003', 10);
const EVIDIR = process.env.EVIDIR ? path.resolve(process.env.EVIDIR) : path.join(ROOT, 'evidence', '2026-11-10', 'journey-scale-r125');
const PELLET_DECLINE = process.env.PELLET_DECLINE === '1';
const TEND_PEER = process.env.TEND_PEER === '1'; // r92 Q2b: press tendLink on below-40 peer links after courtship (offered verb only)
fs.mkdirSync(EVIDIR, { recursive: true });

const { mulberry32, loadGame, setupGame, runDays } = require('./sim-harness');
const REGINST = require('./regionalstep-instrument-20261107'); // r107 Q1: regional-gate recorder (require, not a copy)
const LIINST = require('./ladder-instrument-20261109'); // r112 Q1: Standing-ladder trace (require, not a copy)
const TRINST = require('./traderoad-instrument-20261109'); // r122 Q1+Q2: trade-road trace + wild wave-4 watch (require, not a copy)
const DCINST = require('./deathcensus-instrument-20261110'); // r125 Q2: death-cause census (require, not a copy)
const FILL_ARM = process.env.FILL_ARM === '1'; // r105 Q1: select the r102 narrowed-fill policy variant; unset = r104 control policy
// r122: SINGLE LEG (a BUILD + MEASURE of the trade road and the
// wild-w4 question — the policy is the new lever, the ladder is the
// same ladder r112 measured). The sit layer is OFF for this run
// (PILOT ADDENDUM — see the prereg): the table offer is STANDING
// (Steve 2026-11-06), so a competent player chasing the FULL seat lets
// the lesser seat wait instead of taking it at d90 and ending the run
// before a charter could seal (~d95+ on the pilot's pace). The modal
// layer stays armed but is inert without a sit. Q3 is re-scoped to
// lesser-seat PRICED, not taken (the offer stands; the price is the
// measurable half).
const SIT = false;
process.env.SEATDRIVE = '0'; process.env.MODALPLAY = '1';
const LR = require('./policies/scalecourt-traderoad-r113-linkraise-sit');
const scalecourt = LR.sitPolicy;

let _G = null, _currentSeed = null, capture = [];
// R24 table-approach instruments: weekly seat samples + global-answer notes,
// reset per seed in playSeed().
let seatWatch = [], globalNotes = [], poolWatch = []; // R31: weekly league-pool samples {day, pool, pantry}
let villageWatch = []; // R31: weekly village census {day, villages:[{id,name,dist,known,rumored,generated,opinion,codexGiven,linkKind,linkTrust,linkAge}]}
let trustWatch = [], trustEvents = [], prevHist = {}; // R34: DAILY link-trust snapshots + new link.history entries as they appear (history is capped at 40, so daily diffing preserves the engine's own book)
let betrayWatch = [], betraySubjects = {}; // R42: accepted-betrayal subjects + daily person snapshots
let hungerWatch = []; // R42: daily hunger-window instrument (READ-ONLY — every field is a read)
let tableWatch = []; // R42: daily table-approach instrument (READ-ONLY — every field is a read; tableSeat() is the same call progression.js makes at arc transitions, seatSample already calls it weekly)
let dutyWatch = []; // R65 Q2: daily duty-gate instrument (READ-ONLY — every field is a read)
let wsplitWatch = []; // R66 Q1: daily weaponless-split instrument (READ-ONLY — every field is a read)
let fusionWatch = []; // R90 Q2: daily fusion-reactor instrument (READ-ONLY — every field is a read)
let fusionFeast = []; // R90 Q2: day-attributed feast grant/refusal lines from capture (READ-ONLY)
let natGateWatch = []; // R103 Q1: daily national-staging gate snapshot (READ-ONLY — every field is a read; polityOf / foreignPolities / hierarchyState are the engine's own read APIs)
let mornTrace = []; // R97 Q1: overnight-window position snapshots (READ-ONLY)

// R27 dedup instrument (journey-scale r27 2026-10-24): day-attributed capture
// of the two BIGGER-STAGE beat classes — game.js Beat 4 (scalePointerW4) vs
// scaleDiscovery._sdNextAct. Both fire = the pre-fix double-pitch signature.
let beatWatch = []; // {day, cls, line}
const BEAT4_RX = /cleared the board!|get me standing/i;
const SDNEXTACT_RX = /can't stage what's coming|get me a network/i;

// R99 water-refusal instrument (driver-only, prereg Q1): day-attribute the
// two fillWater refusal lines — "The cistern is dry" (cistern clean < 1)
// and "Your pack is full" (canCarry(1) false) — so the walk-out classifier
// can corroborate a cistern-dry vs pack-full separator per day. Read-only
// classification of the say capture, same pattern as govWatch.
let waterWatch = []; // {day, cls, line}
const WATER_DRY_RX = /cistern is dry/i;
const WATER_FULL_RX = /pack is full.*water is heavy/i;

// R29 governance instrument: day-attributed capture of the three mechanisms
// the LEAD national beat names — tribute routing, court calendar, famine
// reserves — plus the first-court staging itself. Classes:
//   govAnnounce — the GOVERNANCE LAYER line (first-court staging)
//   tribArrive  — subordinate tribute arrives in Haven's pantry (linkTick)
//   tribShort   — tribute short / light / arrears (shortfall said aloud)
//   courtPost   — any court/calendar line AFTER the govAnnounce day (the
//                 classifier marks candidates; the analyzer splits pre/post
//                 by firstCourtDay, since cap() cannot know the future)
//   granaryDraw — league-granary / pool draw lines (famine relief)
//   feastCourt  — the first-court granary feast payout line
let govWatch = [];
const GOV_RX = /governance layer: online/i;
const TRIB_ARRIVE_RX = /tribute from .* arrives|tribute .* arrives —|their fields, our fire/i;
const TRIB_SHORT_RX = /tribute (short|arrives light)|arrears/i;
const COURT_RX = /court|calendar/i;
const GRANARY_DRAW_RX = /league granary opens|draws .* from the league granary|pantry stands empty — and the league granary/i;
const FEAST_RX = /shared granary opens/i;
function govClass(s) {
  if (GOV_RX.test(s)) return 'govAnnounce';
  if (TRIB_ARRIVE_RX.test(s)) return 'tribArrive';
  if (TRIB_SHORT_RX.test(s)) return 'tribShort';
  if (GRANARY_DRAW_RX.test(s)) return 'granaryDraw';
  if (FEAST_RX.test(s)) return 'feastCourt';
  if (COURT_RX.test(s)) return 'courtLine';
  return null;
}

function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  // day-attribute the two beat classes (the r26 say/emit wrapper calls cap)
  try {
    if (BEAT4_RX.test(s)) beatWatch.push({ day: gday(), cls: 'beat4', line: s.slice(0, 160) });
    else if (SDNEXTACT_RX.test(s)) beatWatch.push({ day: gday(), cls: 'sdNextAct', line: s.slice(0, 160) });
    const gc = govClass(s);
    if (gc) govWatch.push({ day: gday(), cls: gc, line: s.slice(0, 200) });
    if (WATER_DRY_RX.test(s)) waterWatch.push({ day: gday(), cls: 'cistern-dry', line: s.slice(0, 200) });
    else if (WATER_FULL_RX.test(s)) waterWatch.push({ day: gday(), cls: 'pack-full', line: s.slice(0, 200) });
    if (/FEASTED ×/.test(s)) fusionFeast.push({ day: gday(), cls: 'feast-grant', line: s.slice(0, 200) });
    else if (/reactor hums its steady note/.test(s)) fusionFeast.push({ day: gday(), cls: 'feast-refusal-reactor', line: s.slice(0, 200) });
    else if (/Feast buff refused: devotion gate/.test(s)) fusionFeast.push({ day: gday(), cls: 'feast-refusal-devotion', line: s.slice(0, 200) });
    else if (/FUSION REACTOR: the pellet goes in/.test(s)) fusionFeast.push({ day: gday(), cls: 'pellet-installed', line: s.slice(0, 200) });
  } catch (e) {}
}
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
// R39 betrayal instrument (READ-ONLY): snapshot an accepted-betrayal
// subject's person state so the run can tell whether an accept changed
// anything after the talk. No engine input is touched.
function personSnap(vid) { try { const p = person(vid); const roster = (_G.state.village || {}).roster || []; return { dead: !!p.dead, trust: ((_G.state.village.trust || {})[vid] ?? null), inRoster: roster.indexOf(vid) !== -1 }; } catch (e) { return { err: String(e && e.message) }; } }
function pantryKcal() {
  try {
    return ((_G.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
function links() { try { return _G.hierarchyState ? (_G.hierarchyState() || []) : []; } catch (e) { return []; } }
function linkOther(l) { try { if (l.a && l.b) return l.a === 'haven' ? l.b : l.a; return l.primary === 'haven' ? l.subordinate : (l.primary || l.a); } catch (e) { return null; } }
function snapshotTrust() {
  try {
    const day = gday();
    for (const l of links()) {
      if (!l || l.status !== 'active') continue;
      const other = linkOther(l);
      trustWatch.push({ day, other, kind: l.kind || (l.primary ? 'primary-sub' : '?'), trust: l.trust | 0, formedDay: l.day | 0, poolLive: !!l.poolLive, chartered: !!l.chartered, lastKeptDay: l.lastKeptDay ?? null, mourningUntil: l.mourningUntil ?? null, arrears: l.arrears || 0, pendingDefense: !!l.pendingDefense, pendingCrisis: !!l.pendingCovenantCrisis });
      const key = (l.id || (other + '|' + (l.kind || '')));
      const seen = prevHist[key] || (prevHist[key] = new Set());
      const hist = Array.isArray(l.history) ? l.history : [];
      for (const h of hist) { const k = (h.day + '|' + h.kind + '|' + h.note); if (!seen.has(k)) { seen.add(k); trustEvents.push({ day: h.day, snapDay: day, other, kind: l.kind || (l.primary ? 'primary-sub' : '?'), noteKind: h.kind, note: h.note }); } }
    }
  } catch (e) {}
}


// R39 trust-setter instrument: redefine every active link's `trust` as an
// accessor (backing value in a WeakMap, so no extra key lands on the link
// object and JSON/save shape is unchanged) that logs every NONZERO
// assignment with the day, the link, before/after, and the call stack.
// Gains routed through _trustGain and direct-assignment drops both pass
// through the setter, so the stack names the writer in both cases. Install
// is idempotent per link object (a replaced link object installs fresh at
// its current trust, never logging a phantom delta). Driver-only.
let trustSetLog = [];
// R52 BARRIER instrument (driver-only, prereg Q2): log EVERY sayOncePerFight
// call — day, message, inCombat() at call time, tbfight present/over, and
// caller stack — so the r50→r51 barrier-line loss can be pinned to a call
// path (no-attempt vs dedup vs broken guard) instead of hypothesized.
// No engine input is touched; the wrapper forwards to the original.
let barrierLog = [];
const _trustVals = new WeakMap();
function installTrustSetters() {
  try {
    for (const l of links()) {
      if (!l || l.status !== 'active') continue;
      if (_trustVals.has(l)) continue;
      _trustVals.set(l, l.trust);
      Object.defineProperty(l, 'trust', {
        configurable: true, enumerable: true,
        get: function () { return _trustVals.get(l); },
        set: function (v) {
          const ov = _trustVals.get(l);
          _trustVals.set(l, v);
          if (v !== ov) {
            let st = '';
            try { st = (new Error().stack || '').split('\n').slice(0, 6).join(' | '); } catch (e) {}
            trustSetLog.push({ day: gday(), other: linkOther(l), kind: l.kind || (l.primary ? 'primary-sub' : '?'), before: ov, after: v, delta: v - ov, stack: st });
          }
        }
      });
    }
  } catch (e) {}
}

const CONVO_DAYS = [90, 120];
const convoFiles = [];
// conversation driver — engage-first (from journey-scale r19/r20).
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious',
  'nv:nod', 'nv:smile', 'nv:pointself', 'nv:listen', 'betrayal:accept'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass', 'betrayal:decline'];
const GQYN = ['gq:yn:unsure', 'gq:yn:honest_pass', 'gq:yn:no', 'gq:yn:yes'];
// R33 picker cap: at most ONE consecutive dlg:more/goon press (a real player
// does not press "go on" 8 times running), and NEVER goon after a deflect
// in the same conversation (r32's Domfeh defect: the picker re-asked after
// the NPC's no). st = {consec, deflected}, maintained by runConversation.
function pickChoice(choices, turn, st) {
  const list = choices || [];
  // R40 WANT-SUBJECT variant: at turn 0, take dlg:subject (the subject menu,
  // where alive want items are offered) instead of the usual first engage
  // choice. Later turns are unchanged, so any want surfacing is attributable
  // to reaching the subject menu, not to a different picker throughout.
  if (SUBJECT_FIRST && turn === 0) { const subj = list.find(x => x && x.id === 'dlg:subject'); if (subj) return subj; }
  if (GOSSIP_FIRST && st && !st.gossipDone) { const g = list.find(x => x && x.id === 'ask:gossip'); if (g) { st.gossipDone = true; return g; } }
  const stretchBlocked = !!(st && st.consec >= 1);
  const goonBlocked = !!(st && st.deflected);
  const skip = (id) => (stretchBlocked && (id === 'dlg:more' || id === 'goon')) || (goonBlocked && id === 'goon');
  for (const id of ENGAGE) { if (skip(id)) continue; const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of GQYN) { const c = list.find(x => x && x.id === id); if (c) return c; }
  // R30 picker fix (Keisha confession case): dlg:react engages the NPC's own want;
  // teach (in ENGAGE2) hijacked it into a 5-plant lecture. React first, teach after.
  const reactFirst = list.find(x => x && x.id === 'dlg:react');
  if (reactFirst && turn < 6) return reactFirst;
  for (const id of ENGAGE2) { if (skip(id)) continue; const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(day, vid) {
  const fp = path.join(EVIDIR, `journey-scale-r125-transcript-${_currentSeed}-day${day}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  let gossipPicks = 0; // r70 fix: MUST live outside the try — the try-scoped let was invisible at the post-try log line, throwing ReferenceError and losing every transcript.
  try {
    const nm = vname(vid);
    const p = person(vid);
    // R55 open-thread logging (read-only): what unfinished business, if
    // any, is planted for this NPC before the talk starts.
    try { const sd = ((_G.state.village || {}).convoSeeds || {})[vid]; const cc0 = _G.convoGet(vid); log(`(pre-talk seed: ${sd ? (sd.wantId + ' planted d' + sd.day) : 'none'}; takenWantDay=${(cc0 && cc0.takenWantDay) || 0}; convoCount=${(cc0 && cc0.count) || 0})`); } catch (e) { log('(pre-talk seed: unreadable)'); }
    const r0 = _G.startConvo(vid);
    if (!r0) { log(`THEM: (no line — startConvo returned null for ${vid})`); fs.writeFileSync(fp, L.join('\n')); return fp; }
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0})`);
    log(`open thread: ${(c && c.thread) || '?'} fromSeed=${!!(want && want.fromSeed)}`);
    log(`picker: ${SUBJECT_FIRST ? 'subject-first' : 'control'}${GOSSIP_FIRST ? ' gossip-first' : ''}`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    const pickSt = { consec: 0, deflected: false, gossipDone: false }; // R33 picker-cap state (+r70 gossip-first flag)
    const convoAccepts = []; // R46: one entry per betrayal:accept pick IN THIS CONVO, armed captured BEFORE the pick is played
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      if (turn === 0) log(`(turn0 choices: ${(choices || []).map(x => x && x.id).join(', ') || 'NONE'})`);
      if (process.env.CHOICELOG === '1') log(`(turn${turn} choices: ${(choices || []).map(x => x && x.id).join(', ') || 'NONE'})`);
      const pick = pickChoice(choices, turn, pickSt);
      if (!pick || pick.id === 'leave') { if (!pick) log(`!! DRIVER DROP: unhandled choices: ${(choices || []).map(x => x && x.id).join(', ') || 'NONE'}`); log('YOU: (leave)'); break; }
      // R34: update cap state from the pick just made.
      if (pick.id === 'dlg:more' || pick.id === 'goon') pickSt.consec += 1; else pickSt.consec = 0;
      if (DEFLECT.indexOf(pick.id) !== -1) pickSt.deflected = true;
      if (pick.id === 'ask:gossip') gossipPicks += 1;
      log(`YOU: [${pick.id}] ${pick.label}`);
      // R46: armed/ordinary split — same predicate as acceptInvite's ambush
      // branch (active unsprung plot naming this villager as inviter with the
      // player as target). Read BEFORE convoTurn consumes the pending invite;
      // null only if the betrayal state is unreadable.
      if (pick.id === 'betrayal:accept') {
        let armed = null;
        try {
          const bs = (typeof _G.betrayalState === 'function') ? _G.betrayalState() : null;
          const plots = (bs && bs.plots) || [];
          const me = _G.villagerId;
          armed = plots.some(q => q.active && !q.sprung && q.inviter === vid && (me == null || q.target === me));
        } catch (e) { armed = null; }
        convoAccepts.push({ armed });
      }
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    // R55: want stage/thread just before close (endConvo may clear the want).
    try { const cw = _G.convoGet(vid); const wpre = (cw && cw.want) || {}; log(`pre-close: want ${wpre.id || 'none'} stage ${wpre.stage || 0} thread ${cw.thread || '?'}`); } catch (e) {}
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    // R46: EVERY accept is recorded (r44's first-accept-only guard undercounted
    // 85003 2->1). Daily snapshots stay keyed by first-registered subject.
    // Fallback: if the pick-time capture missed (e.g. an accept path outside
    // the turn loop), one accept with armed=null is recorded from the transcript.
    if (!betraySubjects[vid] && (convoAccepts.length || L.join('\n').indexOf('[betrayal:accept]') !== -1)) {
      betraySubjects[vid] = { day, vid, name: nm, want: want.id || null, stage: want.stage || 0 };
    }
    const _accs = convoAccepts.length ? convoAccepts : (L.join('\n').indexOf('[betrayal:accept]') !== -1 ? [{ armed: null }] : []);
    for (const _a of _accs) {
      betrayWatch.push(Object.assign({ day, vid, name: nm, event: 'accept', armed: _a.armed }, personSnap(vid)));
    }
    const c2 = _G.convoGet(vid);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  log(`(gossip picks this sitting: ${gossipPicks})`);
  fs.writeFileSync(fp, L.join('\n'));
  return fp;
}

function seatSample() {
  try {
    const seat = (_G.tableSeat ? _G.tableSeat() : {}) || {};
    const pg = (_G.progState ? _G.progState() : {}) || {};
    return {
      day: gday(),
      seat: seat.seat || 'none',
      detail: seat.detail || null,
      arc: pg.arc || 0,
      tableWaiting: !!pg.tableWaiting,
      tableAnnounced: !!pg.tableAnnounced,
      nationalLive: !!_G.state.nationalLive,
      globalLive: !!_G.state.globalLive,
      viewership: (_G.state.village || {}).viewership == null ? null : Math.round(_G.state.village.viewership),
    };
  } catch (e) { return { day: gday(), err: String(e && e.message) }; }
}

function census() {
  const L = links();
  const day = gday();
  const active = L.filter(l => l && l.status === 'active');
  const lead = active.filter(l => l.primary === 'haven');
  const seasoned = lead.filter(l => ((day - (l.day | 0)) >= 30) && (l.trust | 0) >= 40);
  const capText = capture.join('\n');
  const countMark = (re) => { const m = capText.match(re); return m ? m.length : 0; };
  const rank = (() => { try { return _G.scaleRank(); } catch (e) { return '?'; } })();
  return {
    seed: _currentSeed,
    day: day,
    over: !!_G.over,
    overCause: _G.overCause || null,
    popAlive: (_G.state.village.roster || []).filter(id => !person(id).dead).length,
    popTotal: (_G.state.village.roster || []).length,
    pantryKcal: Math.round(pantryKcal()),
    links: active.map(l => ({ kind: l.kind || (l.primary ? 'primary-sub' : '?'), primary: l.primary === 'haven', other: (l.a && l.b) ? (l.a === 'haven' ? l.b : l.a) : (l.primary === 'haven' ? l.subordinate : (l.primary || l.a)), trust: l.trust, ageDays: day - (l.day | 0), status: l.status })),
    leadActive: lead.length,
    leadSeasoned: seasoned.length,
    scaleRank: rank,
    nationalLive: (rank === 'national' || rank === 'global'),
    nationalDay: (() => { try { return _G.state.nationalDay || null; } catch (e) { return null; } })(),
    globalDay: (() => { try { return _G.state.globalDay || null; } catch (e) { return null; } })(),
    networkLiveDay: (() => { try { return _G.state.networkLiveDay || null; } catch (e) { return null; } })(),
    // the actual voicing markers of the national/global transitions (r21 metric
    // review: "GOVERNANCE LAYER: online" stages the realm, "The shared granary
    // opens" resolves the court — the old /rises national/ markers matched
    // only drama-card text that never reaches the say-capture)
    nationalVoiced: /governance layer: online|the shared granary opens/i.test(capText),
    globalVoiced: /species agency: unlocked/i.test(capText),
    primaryDemandsFired: countMark(/demand|tribute/gi),
    defenseFired: countMark(/defense call|call for aid|defend us/gi),
    maxWave: (() => { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } })(),
    tableSeat: (() => { try { return (_G.tableSeat ? _G.tableSeat() : {}).seat || null; } catch (e) { return 'err'; } })(),
    tableSeatDetail: (() => { try { return (_G.tableSeat ? _G.tableSeat() : {}).detail || null; } catch (e) { return null; } })(),
    arcNow: (() => { try { return (_G.progState ? _G.progState().arc : null); } catch (e) { return null; } })(),
    tableWaiting: (() => { try { return !!_G.progState().tableWaiting; } catch (e) { return null; } })(),
    tableAnnounced: (() => { try { return !!_G.progState().tableAnnounced; } catch (e) { return null; } })(),
    seatWatch: seatWatch.slice(),
    poolWatch: poolWatch.slice(),
    villageWatch: villageWatch.slice(),
    trustWatch: trustWatch.slice(),
    trustSetLog: trustSetLog.slice(),
    trustEvents: trustEvents.slice(),
    betrayWatch: betrayWatch.slice(),
    betraySubjects: Object.assign({}, betraySubjects),
    hungerWatch: hungerWatch.slice(),
    tableWatch: tableWatch.slice(),
    villageTotal: (() => { try { return (_G.state.otherVillages || []).length; } catch (e) { return null; } })(),
    villageKnownEnd: (() => { try { return (_G.state.otherVillages || []).filter(v => _G.knowsVillage ? _G.knowsVillage(v) : (v.generated || v.rumored)).length; } catch (e) { return null; } })(),
    poolEverMax: poolWatch.reduce((m, x) => Math.max(m, x.pool || 0), 0),
    covLinks: links().filter(l => l && (l.kind === 'covenant') && l.status === 'active').map(l => ({ other: (l.a === 'haven' ? l.b : l.a), trust: l.trust, ageDays: day - (l.day | 0), poolLive: !!l.poolLive })),
    globalNotes: globalNotes.slice(),
    convoFiles: convoFiles.slice(),
    // R27 dedup instrument: day-attributed BIGGER-STAGE beats + scaleDiscovery state
    beatWatch: beatWatch.slice(),
    natGateWatch: natGateWatch.slice(),
    // R29 governance instrument: day-attributed mechanism lines + link tribute state
    govWatch: govWatch.slice(),
    firstCourtDay: (() => { const g = govWatch.find(x => x.cls === 'govAnnounce'); return g ? g.day : null; })(),
    leaguePoolKcal: (() => { try { return _G.leaguePool ? _G.leaguePool() : null; } catch (e) { return null; } })(),
    linkTribute: L.map(l => ({ other: l.primary === 'haven' ? l.subordinate : (l.primary || l.a), primaryHaven: l.primary === 'haven', tributePerWeek: l.tributeKcalPerWeek || 0, tributePaidWeek: l.tributePaidWeek ?? null, arrears: l.arrears || 0, trust: l.trust })),
    scalePtrW4: (() => { try { return !!_G.state._scalePtrW4; } catch (e) { return null; } })(),
    scalePtrW5: (() => { try { return !!_G.state._scalePtrW5; } catch (e) { return null; } })(),
    sdState: (() => {
      try {
        const sd = (typeof _G.scaleDiscovery === 'function') ? _G.scaleDiscovery() : null;
        if (!sd) return null;
        const out = {};
        for (const k of Object.keys(sd)) {
          const v = sd[k];
          out[k] = (v && typeof v === 'object') ? { day: v.day, via: v.via } : v;
        }
        return out;
      } catch (e) { return null; }
    })(),
  };
}

async function playSeed(seed) {
  _currentSeed = seed;
  if (LR) LR.resetLinkraiseStats();
  capture = [];
  beatWatch = [];
  govWatch = [];
  waterWatch = [];
  convoFiles.length = 0;
  seatWatch = [];
  poolWatch = [];
  villageWatch = [];
  globalNotes = [];
  trustWatch = [];
  trustEvents = [];
  trustSetLog = [];
  barrierLog = [];
  prevHist = {};
  betrayWatch = [];
  betraySubjects = {};
  hungerWatch = [];
  tableWatch = [];
  dutyWatch = [];
  wsplitWatch = [];
  fusionWatch = [];
  fusionFeast = [];
  posTrace = [];
  mornTrace = [];
  natGateWatch = []; // R103: reset per seed like every other watch (r103 fix — the first panel run accumulated rows across seeds)
  console.log(`\n===== SEED ${seed} (trade road — charter pursuit) =====`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r125-want' });
  _G = Game;
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { cap(a[0]); try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.sayOncePerFight === 'function') {
    const _sopf = Game.sayOncePerFight.bind(Game);
    Game.sayOncePerFight = function (...a) {
      try {
        let st = '';
        try { st = (new Error().stack || '').split('\n').slice(1, 7).join(' | '); } catch (e) {}
        let inC = null, tb = null, tbOver = null;
        try { inC = Game.inCombat(); } catch (e) {}
        try { tb = !!Game.tbfight; tbOver = !!(Game.tbfight && Game.tbfight.over); } catch (e) {}
        barrierLog.push({ day: gday(), msg: a[0], inCombat: inC, tbfight: tb, tbfightOver: tbOver, stack: st });
      } catch (e) {}
      return _sopf(...a);
    };
  }
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { cap(a[0]); try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const regInst = REGINST.install(Game); // r107 Q1: regional-gate recorder (read-only; wraps diplomacy verbs, snapshots daily)
  const liInst = LIINST.install(Game); // r112 Q1: Standing-ladder trace (read-only snapshot + delegating wrappers)
  const trInst = TRINST.install(Game); // r122 Q1+Q2: trade-road trace + wild wave-4 watch (read-only snapshot + delegating wrappers)
  const dcInst = DCINST.install(Game); // r125 Q2: death-cause census (read-only snapshot, no wrappers)
  let regLastSnapDay = -1;
  const policy = Object.create(scalecourt);
  policy.id = 'journey-scale-r125-want-scalecourt';
  policy._ctx = null;
  const baseDaily = scalecourt.daily.bind(scalecourt);
  const baseSetup = scalecourt.setup ? scalecourt.setup.bind(scalecourt) : null;
  policy.setup = function (G, ctx) { if (baseSetup) baseSetup(G, ctx); policy._ctx = ctx; };
  policy.daily = function (G, ctx) {
    const hadPendingGlobal = !!((G.state || {}).pendingGlobal);
    installTrustSetters(); // R42: catch links formed during the day's actions, before the policy step moves them
    // R55 PELLET-DECLINE arm (measurement only): hide ONLY the fusion_reactor
    // offer from competent's take step; restore the pending offer afterwards
    // so the player passes on the pellet day after day. Other offers pass
    // through untouched. When PELLET_DECLINE is unset this block is inert.
    // R56 FIX (journey-scale r57 Q2 — r55 nopellet duplicates): the r55
    // wrapper restored the WHOLE pre-daily sheet after daily, even when
    // the policy had consumed it (chooseAbility clears the sheet) — so
    // the same sheet came back the next day and the unguarded push in
    // chooseAbility stacked a second entry (r55 nopellet: survivor x3,
    // green_thumb x2). A consumed sheet must never return its taken
    // choices: untouched sheet -> full restore (pellet pending again);
    // consumed sheet -> ONLY the fusion entry stays pending; a fresh
    // pump-opened sheet after a take is left alone (the engine moved on).
    let savedChoices = null, filteredChoices = null;
    if (PELLET_DECLINE) { try { const sc = G.state && G.state.scholar; if (sc && Array.isArray(sc.abilityChoices)) { savedChoices = sc.abilityChoices; filteredChoices = savedChoices.filter(c => ((c && c.id) || c) !== 'fusion_reactor'); sc.abilityChoices = filteredChoices; } } catch (e) {} }
    try { baseDaily(G, ctx); } finally { if (PELLET_DECLINE && savedChoices !== null) { try { const sc = G.state && G.state.scholar; if (sc) { const fusion = savedChoices.find(c => ((c && c.id) || c) === 'fusion_reactor'); const cur = sc.abilityChoices; if (cur === filteredChoices) { sc.abilityChoices = savedChoices; } else if ((cur === null || cur === undefined) && fusion) { sc.abilityChoices = [fusion]; } } } catch (e) {} } }
    // R92 Q2b TEND-ARM (instrument only, TEND_PEER=1): after courtship, press
    // the offered Haven-panel verb tendLink on each active PEER link below
    // the seasoned trust bar, pantry-gated like the courtship block. On base
    // code this refuses every peer (primary null); on fixed code it tends.
    // LEAD links are untouched here (win-plan may tend them in-game).
    if (TEND_PEER) { try { const _links = (typeof G.hierarchyState === 'function' ? G.hierarchyState() : []); for (const _l of _links) { if (!_l || _l.status !== 'active') continue; const _isPeer = (_l.kind === 'covenant' || _l.kind === 'trade') && (_l.primary == null); if (!_isPeer) continue; if ((_l.trust || 0) >= 40) continue; if (pantryKcal() <= 12000) continue; try { const _paid = G.tendLink(_l.id); if (_paid > 0) ctx.tendPeer = (ctx.tendPeer || 0) + 1; } catch (e) {} } } catch (e) {} }
    installTrustSetters(); // R42: catch links formed during the policy step, for tomorrow's actions
    snapshotTrust(); // R42: daily trust snapshot AFTER the day's policy step, so the snapshot is the day's closing trust
    const gd = gday();
    // R42: daily person snapshot for every accepted-betrayal subject (read-only).
    for (const vid of Object.keys(betraySubjects)) { try { betrayWatch.push(Object.assign({ day: gd, vid, name: betraySubjects[vid].name, event: 'daily' }, personSnap(vid))); } catch (e) {} }
    // R39 hunger-window instrument (READ-ONLY): opening state for this day —
    // hungryDays here is the count AFTER yesterday's endDay, so the row for
    // the scatter day itself carries opening hungryDays 4 and the four rows
    // before it carry 0..3 (a fed day resets the count to 0, visible here).
    try { if (ctx && ctx.posTrace) posTrace = ctx.posTrace.slice(); } catch (e) {}
    try { if (ctx && ctx.mornTrace) mornTrace = ctx.mornTrace.slice(); } catch (e) {}
    try { hungerWatch.push({ day: gd, pantry: Math.round(pantryKcal()), hungryDays: ((_G.state.village || {}).hungryDays || 0), pilgrim: !!(ctx && ctx._pilgrim), pilgrimVid: (ctx && ctx._pilgrim) ? ctx._pilgrim.vid : null, returning: !!(ctx && ctx._returning), pilgrimages: (ctx && ctx.pilgrimages) | 0, climbStudies: (ctx && ctx.climbStudies) | 0, proposedPeer: (ctx && ctx.proposedPeer) | 0, courtPoorDays: (ctx && ctx.courtPoorDays) | 0, pool: (_G.leaguePool ? _G.leaguePool() : null) }); } catch (e) {}
    // R39 table-approach instrument (READ-ONLY): the seat priced daily, so
    // the run can name exactly which lesser bar fails at global and when
    // (if ever) arc 4 / tableWaiting / tableAnnounced arrive. tableSeat()
    // detail for a full seat is the deedGate object, not the lesser
    // w1/w2/w3 shape — the analyzer reads both shapes.
    try { const _seat = (_G.tableSeat ? _G.tableSeat() : {}) || {}; const _pg = (_G.progState ? _G.progState() : {}) || {}; tableWatch.push({ day: gd, seat: _seat.seat || 'none', detail: _seat.detail || {}, arc: _pg.arc || 0, tableWaiting: !!_pg.tableWaiting, tableAnnounced: !!_pg.tableAnnounced, tableDone: !!_pg.tableDone, scaleRank: (() => { try { return _G.scaleRank(); } catch (e) { return '?'; } })(), globalLive: !!_G.state.globalLive, overtimeTier: (_G.overtimeTier ? _G.overtimeTier() : null) }); } catch (e) {}
    // R113 Q1 ladder snapshot (READ-ONLY): one row per policy day.
    try { if (liInst) liInst.snapshot(ctx); } catch (e) {}
    // R113 Q1+Q2 trade-road snapshot (READ-ONLY): one row per policy day.
    try { if (trInst) trInst.snapshot(ctx); } catch (e) {}
    // R125 Q2 death-census snapshot (READ-ONLY): fallen + telemetry
    // diffs and the daily context row, one row per policy day.
    try { if (dcInst) dcInst.snapshot(ctx); } catch (e) {}
    // R113 Q1 DELIVERY VERB (pre-registered in the prereg — a competent
    // player at National with a ready capstone delivers it; the delivery
    // entry point is wired-exempt, app.js panelHaven only, so no sim
    // policy ever calls it). Free deeds first, the costly tribute last.
    // The attempt is logged by the instrument's ladderDeliverCapstone
    // wrapper AND counted here, so a silent non-attempt is visible.
    try {
      if (liInst) {
        const _rows = (liInst.t && liInst.t.daily) || [];
        const _last = _rows[_rows.length - 1];
        if (_last && (_last.stage | 0) >= 3 && !_last.delivered) {
          const _kind = LIINST.pickCapstoneOrder(_last.capstones);
          if (_kind) {
            ctx.capstoneAttempts = (ctx.capstoneAttempts | 0) + 1;
            try { _G.ladderDeliverCapstone(_kind); } catch (e) { ctx.capstoneAttemptErrors = (ctx.capstoneAttemptErrors | 0) + 1; }
          }
        }
      }
    } catch (e) {}
    // R103 Q1 national-gate instrument (READ-ONLY): the exact staging gates
    // from hierarchy.js _checkNational + polityOf/_belongPolity/_covenantPolity/
    // _tradePolity, snapshotted daily so the run can name which gate blocks the
    // national beat and for how long. Seasoned mirrors _linkSeasoned exactly:
    // 30+ days old AND trust 40+ (conquered: the season, not the trust; MERCY
    // grace counts while mercyUntil holds). Belong's candidate is the best
    // Haven-subordinate link by (good-standing, realm size).
    try {
      const _day = gd;
      const _links = links();
      const _seasoned = (l) => { try { if (!l || l.status !== 'active') return false; if ((_day - (l.day | 0)) < 30) return false; if (l.conquered) return true; if (l.mercyUntil && _day < l.mercyUntil) return true; return (l.trust | 0) >= 40; } catch (e) { return false; } };
      const _lead = _links.filter(l => l && l.status === 'active' && l.primary === 'haven');
      const _cov = _links.filter(l => l && l.status === 'active' && l.kind === 'covenant');
      const _trd = _links.filter(l => l && l.status === 'active' && l.kind === 'trade');
      let _belong = null;
      try {
        for (const l of _links) {
          if (!l || l.status !== 'active' || l.subordinate !== 'haven' || !l.primary) continue;
          let _realm = null; try { const _bp = _G.polityOf ? _G.polityOf(l.primary) : null; _realm = _bp ? _bp.size : null; } catch (e) {}
          let _fps = 0; try { const _all = _G.foreignPolities ? _G.foreignPolities() : []; for (const _f of _all) if (_f.primary === l.primary) _fps = (_f.subs || []).length; } catch (e) {}
          const _cand = { other: l.primary, trust: l.trust | 0, arrears: l.arrears || 0, age: _day - (l.day | 0), realm: _realm, foreignSubs: _fps, good: ((l.trust | 0) >= 50 && (l.arrears || 0) === 0 && (_day - (l.day | 0)) >= 14) };
          const _better = !_belong || (_cand.good && !_belong.good) || (_cand.good === _belong.good && (_cand.realm || 0) > (_belong.realm || 0));
          if (_better) _belong = _cand;
        }
      } catch (e) {}
      let _foreignMax = 0;
      try { const _all = _G.foreignPolities ? _G.foreignPolities() : []; for (const _f of _all) _foreignMax = Math.max(_foreignMax, 1 + ((_f.subs || []).length)); } catch (e) {}
      let _leadPol = null, _belPol = null, _covPol = null, _trdPol = null;
      try { _leadPol = _G.polityOf ? _G.polityOf('haven') : null; } catch (e) {}
      try { _belPol = _G._belongPolity ? _G._belongPolity() : null; } catch (e) {}
      try { _covPol = _G._covenantPolity ? _G._covenantPolity() : null; } catch (e) {}
      try { _trdPol = _G._tradePolity ? _G._tradePolity() : null; } catch (e) {}
      const _netDay = (() => { try { return _G.state.networkLiveDay || null; } catch (e) { return null; } })();
      natGateWatch.push({ day: _day, rank: (() => { try { return _G.scaleRank(); } catch (e) { return '?'; } })(), nationalLive: !!_G.state.nationalLive, globalLive: !!_G.state.globalLive,
        networkLive: !!_G.state.networkLive, networkLiveDay: _netDay, rungReady: (!!_G.state.networkLive && _netDay != null && (_day - _netDay) >= 30),
        exiled: !!((_G.state.scholar || {}).exiled), scaleRefused: !!_G.state.scaleRefused,
        pendingShape: (_G.state.pendingNational || {}).shape || null, pendingDay: (_G.state.pendingNational || {}).day ?? null,
        leadActive: _lead.length, leadSeasoned: _lead.filter(_seasoned).length,
        covActive: _cov.length, covSeasoned: _cov.filter(_seasoned).length,
        tradeActive: _trd.length, tradeSeasoned: _trd.filter(_seasoned).length,
        belong: _belong, foreignMax: _foreignMax,
        leadPolity: _leadPol ? { shape: _leadPol.shape, size: _leadPol.size } : null,
        belongPolity: _belPol ? { shape: _belPol.shape, size: _belPol.size } : null,
        covPolity: _covPol ? { shape: _covPol.shape, size: _covPol.size } : null,
        tradePolity: _trdPol ? { shape: _trdPol.shape, size: _trdPol.size } : null,
        defer: (() => { try { return Object.assign({}, _G.state._natDefer || {}); } catch (e) { return {}; } })(),
        viewership: (_G.state.village || {}).viewership == null ? null : Math.round(_G.state.village.viewership) });
    } catch (e) {}
    // R90 Q2 fusion instrument (READ-ONLY): the pellet's installed/online/ability
    // triple that fusionReactorOnline() ANDs together, snapshotted AFTER baseDaily
    // but BEFORE endDay's build tick — same point as dutyWatch. A flip in the
    // online() value with no change in these three fields would falsify the
    // mechanism reading; a flip WITH a field change names the transition.
    try { const _sc = (_G.state.scholar || {}); const _fr = _sc.fusionReactor || {}; let _on = null, _has = null; try { _on = (typeof _G.fusionReactorOnline === 'function') ? !!_G.fusionReactorOnline() : null; } catch (e) {} try { _has = (typeof _G.hasAbility === 'function') ? !!_G.hasAbility('fusion_reactor') : null; } catch (e) {} fusionWatch.push({ day: gd, scholarVid: _G.villagerId || null, installed: !!_fr.installed, onlineFlag: (_fr.online === undefined ? null : !!_fr.online), sinceDay: (_fr.sinceDay === undefined ? null : _fr.sinceDay), online: _on, hasAbility: _has, holder: (_G.state.fusionReactorHolder || null), abilities: (_sc.abilities || []).map(a => ((a && a.id) || a)) }); } catch (e) {}
    // R65 Q2 duty-gate instrument (READ-ONLY): the weaponCraft knowledge map
    // (vid -> {recipeId: level}), the weaponCraftCd last-attempt-day map,
    // the assignments map's deadfall entries, roster size, and whether the
    // player is at Haven (the witness gate for the counted craft line).
    // Snapshotted AFTER baseDaily but BEFORE endDay runs the build tick,
    // so the maps carry attempts through the previous day's endDay — the
    // analyzer derives attempt days from the raw maps, never from this
    // row's day alone.
    try { const _v = (_G.state.village || {}); const _wc = _v.weaponCraft || {}; const _wcd = _v.weaponCraftCd || {}; const _asg = _v.assignments || {}; let _ah = null; try { _ah = (_G.playerAtHaven ? _G.playerAtHaven() : null); } catch (e) {} dutyWatch.push({ day: gd, roster: (_v.roster || []).length, weaponCraft: JSON.parse(JSON.stringify(_wc)), weaponCraftCd: Object.assign({}, _wcd), deadfallAssigned: Object.keys(_asg).filter(vid => _asg[vid] && _asg[vid].task === 'deadfall'), atHaven: _ah }); } catch (e) {}
    // R66 Q1 weaponless-split instrument (READ-ONLY): per home-roster
    // villager, own equipped/pack/stashed itemIds, weaponCraft record,
    // weaponCraftCd value, away/dead flags; plus the camp-pile materials
    // snapshot. Same point as dutyWatch (after baseDaily, before endDay's
    // build tick); gearDay arming inside the tick is handled by the
    // prereg's transition rule, not by this snapshot.
    try { const _v2 = (_G.state.village || {}); let _mats = null; try { const _st = (_G.stashState ? _G.stashState() : null); _mats = (_st && _st.materials) || null; } catch (e) {} if (!_mats) _mats = ((_v2.stash && _v2.stash.materials) || {}); const _rows = []; for (const _vid of (_v2.roster || [])) { if (_vid === _G.villagerId) continue; let _p = null; try { _p = _G.getPerson ? _G.getPerson(_vid) : null; } catch (e) {} if (!_p) { _rows.push({ vid: _vid, missing: true }); continue; } const _idOf = (e) => (e && (e.itemId || e.id)) || e; _rows.push({ vid: _vid, dead: !!_p.dead, away: !!((_v2.away || {})[_vid]), equipped: Object.values(_p.equipped || {}).map(e => e && e.itemId).filter(Boolean), pack: (_p.items || []).map(_idOf).filter(Boolean), stashed: (_p.stashed || []).map(_idOf).filter(Boolean), wc: JSON.parse(JSON.stringify(((_v2.weaponCraft || {})[_vid] || {}))), cd: ((_v2.weaponCraftCd || {})[_vid] ?? null) }); } wsplitWatch.push({ day: gd, pile: JSON.parse(JSON.stringify(_mats)), rows: _rows }); } catch (e) {}
    // R24: detect the Watchers answer (scalecourt answers 'feast' in baseDaily)
    if (hadPendingGlobal && !(G.state || {}).pendingGlobal) {
      globalNotes.push({ day: gd, how: 'feast', globalLive: !!G.state.globalLive, viewership: (G.state.village || {}).viewership });
    }
    // R24: weekly seat sample for the table-approach arm
    if (gd % 7 === 0) { seatWatch.push(seatSample()); try { poolWatch.push({ day: gd, pool: _G.leaguePool ? _G.leaguePool() : null, pantry: Math.round(pantryKcal()) }); } catch (e) {}
      try {
        const lk = {}; for (const l of links()) { const oid = l.primary === 'haven' ? l.subordinate : (l.primary || l.a); if (l.a && l.b) { const oid2 = l.a === 'haven' ? l.b : l.a; lk[oid2] = l; } lk[oid] = l; }
        villageWatch.push({ day: gd, villages: ((_G.state.otherVillages || []).map(v => {
          const l = lk[v.id]; const known = _G.knowsVillage ? _G.knowsVillage(v) : !!(v.generated || v.rumored);
          return { id: v.id, name: v.name, dist: Math.abs((v.x||4)-4)+Math.abs((v.y||4)-4), known: !!known, rumored: !!v.rumored, generated: !!v.generated, rumorDay: v.rumorDay || null, opinion: v.opinion || 0, codexGiven: !!v._codexOpinionGiven, linkKind: l ? (l.kind || (l.primary ? 'primary-sub' : null)) : null, linkTrust: l ? (l.trust||0) : null, linkAge: l ? (gd - (l.day|0)) : null };
        })) });
      } catch (e) {} }
    if (CONVO_DAYS.includes(gd)) {
      let vid = null;
      try {
        const roster = (G.state.village.roster || []).filter(id => id !== G.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = G.npcComm ? G.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          let cnt = -1;
          try { const c0 = G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          if (cnt < 2) { vid = id; break; }
        }
        if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
      } catch (e) {}
      if (vid) { try { convoFiles.push(runConversation(gd, vid)); } catch (e) {} }
    }
    // R55 PROBE: extra talks with a pinned NPC on extra days (probe-only).
    if (PROBE_VID && PROBE_DAYS.includes(gd) && _currentSeed === PROBE_SEED) {
      try { convoFiles.push(runConversation(gd, PROBE_VID)); } catch (e) {}
    }
    // R107 Q1: regional-gate snapshot for this day (read-only; one row per day).
    try { const _rgd = gday(); if (_rgd !== regLastSnapDay) { regLastSnapDay = _rgd; regInst.snapshot(); } } catch (e) {}
  };
  const result = await runDays(Game, policy, {
    days: DAYCAP,
    manifest: { seed, mode: 'journey-scale-r125-want', date: new Date().toISOString().slice(0, 10), node: process.version },
  });
  // R107 Q1: finalize the regional-gate recorder (read-only) and emit the corpus.
  let regFin = null;
  try { regInst.snapshot(); } catch (e) {}
  try { regFin = regInst.finalize(); } catch (e) {}
  try { regInst.uninstall(); } catch (e) {}
  // R113 Q1: finalize the ladder trace (read-only) and emit the corpus.
  let liFin = null;
  try { liFin = liInst.finalize(); } catch (e) { liFin = { daily: [], deliveries: [], fights: [], errors: [{ day: -1, where: 'finalize', err: String(e && e.message) }] }; }
  try { liInst.uninstall(); } catch (e) {}
  // R113 Q1+Q2: finalize the trade-road trace + wild watch (read-only).
  let trFin = null;
  try { trFin = trInst.finalize(); } catch (e) { trFin = { daily: [], beatAnswers: [], wildFights: [], errors: [{ day: -1, where: 'finalize', err: String(e && e.message) }] }; }
  try { trInst.uninstall(); } catch (e) {}
  // R125 Q2: finalize the death-cause census (read-only).
  let dcFin = null;
  try { dcFin = dcInst.finalize(); } catch (e) { dcFin = { daily: [], deaths: [], teleDeaths: [], joins: [], leavers: [], errors: [{ day: -1, where: 'finalize', err: String(e && e.message) }], summary: { deaths: 0, byCause: {}, multiDeathDays: [], teleDeaths: 0, telePerson: 0, teleMonster: 0, joins: 0, leavers: 0, deathDepartures: 0, initialRosterLen: 0, finalRosterLen: null, booksClose: false, unattributed: -1 } }; }
  try { dcInst.uninstall(); } catch (e) {}
  const ctx = policy._ctx || {};
  const c = census();
  // R113 Q1: ladder summary on the census (the analyzer reads the
  // daily/event files for the stage table; this is the seed-end rollup).
  c.ladderChain = {
    rows: (liFin.daily || []).length, errors: (liFin.errors || []).length,
    peakStage: (liFin.daily || []).reduce((m, x) => Math.max(m, (x.peakStage == null ? 0 : x.peakStage) | 0), 0),
    stage1Day: (() => { const r = (liFin.daily || []).find(x => (x.stage | 0) >= 1); return r ? r.day : null; })(),
    stage2Day: (() => { const r = (liFin.daily || []).find(x => (x.stage | 0) >= 2); return r ? r.day : null; })(),
    stage3Day: (() => { const r = (liFin.daily || []).find(x => (x.stage | 0) >= 3); return r ? r.day : null; })(),
    countedEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return r ? r.counted : null; })(),
    shortfallEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return r ? r.shortfall : null; })(),
    cappedEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return r ? r.capped : null; })(),
    tracksEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return r ? r.tracks : null; })(),
    bundleStages: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return (r && r.detail) ? (r.detail.bundleStages || []) : []; })(),
    bundleBonusEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return (r && r.detail) ? (r.detail.bundleBonus | 0) : 0; })(),
    capstoneReady: (() => { const out = {}; for (const k of ['trade_charter', 'feast_embassy', 'military_tribute']) { const r = (liFin.daily || []).find(x => x.capstones && x.capstones[k] && x.capstones[k].ready); out[k] = r ? r.day : null; } return out; })(),
    capstoneDelivered: (() => { const r = (liFin.daily || []).find(x => x.delivered); return r ? { kind: r.delivered, day: r.day } : null; })(),
    deliveries: (liFin.deliveries || []).length,
    deliveriesOk: (liFin.deliveries || []).filter(x => x.ok).length,
    deliveryAttempts: (ctx.capstoneAttempts | 0),
    deliveryAttemptErrors: (ctx.capstoneAttemptErrors | 0),
    seatLesserDay: (() => { const r = (liFin.daily || []).find(x => x.seat === 'lesser' || x.seat === 'full'); return r ? r.day : null; })(),
    seatFullDay: (() => { const r = (liFin.daily || []).find(x => x.seat === 'full'); return r ? r.day : null; })(),
    fights: (liFin.fights || []).length,
    fightsByWave: (() => { const m = {}; for (const f of (liFin.fights || [])) { if (f.wave != null) m[f.wave] = (m[f.wave] | 0) + 1; } return m; })(),
    // R113 Q1: sentiment-taught day (r111 metric review — the exact day
    // the lesser seat's slow leg lands) + end-of-run kill attribution.
    sentimentTaughtDay: (() => { const r = (liFin.daily || []).find(x => x.sentimentTaught === true); return r ? r.day : null; })(),
    killAttrEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return (r && r.killAttr) ? r.killAttr : null; })(),
    vetkillRows: ((liFin.waveKillLog || []).length),
    bankedHeadStartEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return (r && r.detail && r.detail.bankedHeadStart != null) ? r.detail.bankedHeadStart : 0; })(),
  };
  // R113 Q1: trade-road rollup (the analyzer reads the daily/event
  // files for the step table; this is the seed-end summary).
  c.tradeRoad = {
    rows: (trFin.daily || []).length, errors: (trFin.errors || []).length,
    firstTradeProposalDay: (() => { const r = (trFin.daily || []).find(x => (x.trN | 0) >= 1); return r ? r.day : null; })(),
    maxTradeLinks: (trFin.daily || []).reduce((m, x) => Math.max(m, (x.trN | 0)), 0),
    maxTradeSeasoned: (trFin.daily || []).reduce((m, x) => Math.max(m, (x.trSeasoned | 0)), 0),
    firstSeasonedTradeDay: (() => { const r = (trFin.daily || []).find(x => (x.trSeasoned | 0) >= 3); return r ? r.day : null; })(),
    maxSubs: (trFin.daily || []).reduce((m, x) => Math.max(m, (x.subs | 0)), 0),
    subCapSkips: (LR ? (LR.linkraiseStats().raisesSkippedSubCap | 0) : null),
    beatAnswers: (trFin.beatAnswers || []).map(b => `${b.shape}:${b.how}@d${b.day}`).join(','),
    charterStagedDay: (() => { const r = (trFin.beatAnswers || []).find(b => b.shape === 'trade'); return r ? r.day : null; })(),
    covenantWalks: (trFin.beatAnswers || []).filter(b => b.shape === 'covenant' && b.how === 'walk').length,
    sealedDay: (() => { const r = (trFin.daily || []).find(x => (x.charteredLinks | 0) >= 1); return r ? r.day : null; })(),
  };
  // R113 Q2: wild wave-4 rollup (villager-class field fights by outcome).
  c.wildW4 = {
    rows: (trFin.wildFights || []).length, errors: (trFin.errors || []).length,
    villagerW4Calls: (trFin.wildFights || []).filter(f => f.cls === 'villager' && (f.wave | 0) >= 4).length,
    villagerW4ByOutcome: (() => { const m = {}; for (const f of (trFin.wildFights || [])) { if (f.cls === 'villager' && (f.wave | 0) >= 4) m[f.outcome || '?'] = (m[f.outcome || '?'] | 0) + 1; } return m; })(),
    villagerW4Deaths: (trFin.wildFights || []).filter(f => f.cls === 'villager' && (f.wave | 0) >= 4 && f.outcome === 'vDie').length,
    scholarW4Calls: (trFin.wildFights || []).filter(f => f.cls === 'scholar' && (f.wave | 0) >= 4).length,
    villagerW1_3: (() => { const m = {}; for (const f of (trFin.wildFights || [])) { if (f.cls === 'villager' && (f.wave | 0) >= 1 && (f.wave | 0) <= 3) m[f.outcome || '?'] = (m[f.outcome || '?'] | 0) + 1; } return m; })(),
  };
  // R125 Q2: death-cause census rollup (the analyzer reads the
  // deathcensus corpus for the cause tables; this is the seed-end
  // summary with the reconciliation verdict on it).
  c.deathCensus = {
    rows: (dcFin.daily || []).length, errors: (dcFin.errors || []).length,
    deaths: ((dcFin.summary || {}).deaths | 0),
    byCause: ((dcFin.summary || {}).byCause || {}),
    multiDeathDays: ((dcFin.summary || {}).multiDeathDays || []),
    telePerson: ((dcFin.summary || {}).telePerson | 0),
    teleMonster: ((dcFin.summary || {}).teleMonster | 0),
    joins: ((dcFin.summary || {}).joins | 0),
    leavers: ((dcFin.summary || {}).leavers | 0),
    booksClose: !!((dcFin.summary || {}).booksClose),
    unattributed: ((dcFin.summary || {}).unattributed | 0),
    dutyDays: (dcFin.daily || []).filter(d => d.dutyHolder != null).length,
    healerDays: (dcFin.daily || []).filter(d => d.healerId != null).length,
  };
  c.proposedLead = (ctx.proposedLead | 0) || (ctx.proposed | 0);
  c.linkraise = LR ? LR.linkraiseStats() : null; // r108 Q1: raise ledger (null on the baseline leg)
  c.sit = SIT; // r109 Q1: which leg this seed ran (true = sit+modal live)
  c.won = !!_G.won; // r109 Q1: a table terminal sets Game.over + Game.won (table.js x4)
  c.tableState = (() => { try { const T = (_G.tableState ? _G.tableState() : null) || null; if (!T) return null; return { phase: T.phase || null, path: T.path || null, branch: T.branch || null, seat: T.seat || null, seatTaker: T.seatTaker || null, failedDoors: (T.failedDoors || []).slice() }; } catch (e) { return null; } })();
  // r109 Q1: sit + modal counters off the policy ctx (seatdrive sd*, modalplay mp*), plus the modalplay door/beat records.
  c.sitStats = { previewSeen: ctx.sdPreviewSeen | 0, attempts: ctx.sdSeatAttempts | 0, taken: ctx.sdSeatTaken | 0, takenDay: ctx.sdSeatDay || null, takenKind: ctx.sdSeatKind || null, failed: ctx.sdSeatFailed | 0, guardRefused: ctx.sdGuardRefused | 0, noScholar: ctx.sdNoScholar | 0, driveError: ctx.sdDriveError | 0 };
  c.modalStats = { doorsPlayed: ctx.mpDoorsPlayed | 0, answers: ctx.mpAnswers | 0, drained: !!ctx.mpDrained, doorNoHonest: ctx.mpDoorNoHonest | 0, witnessTaken: ctx.mpWitnessTaken | 0, trialSkipped: ctx.mpTrialSkipped | 0, conscriptRefused: ctx.mpConscriptRefused | 0, driveError: ctx.mpDriveError | 0,
    doors: (ctx._modalplay && ctx._modalplay.doors) ? ctx._modalplay.doors.slice() : [],
    beats: (ctx._modalplay && ctx._modalplay.beats) ? ctx._modalplay.beats.slice() : [] };
  c.raiseTalks = c.linkraise ? (c.linkraise.raiseTalks || []) : [];
  c.proposedPeer = ctx.proposedPeer | 0;
  c.pilgrimages = ctx.pilgrimages | 0;
  c.climbStudies = ctx.climbStudies | 0;
  c.courtPoorDays = ctx.courtPoorDays | 0;
  c.pilgrimagesPoor = ctx.pilgrimagesPoor | 0;
  c.proposedPeerPoor = ctx.proposedPeerPoor | 0;
  c.courtCounters = ctx.courtCounters | 0;
  // R55: fusion/ability reads (read-only, seed end).
  try { const sc = Game.state.scholar || {}; c.fusionInstalled = !!((sc.fusionReactor || {}).installed); c.fusionHolder = (Game.state.fusionReactorHolder || null); c.abilitiesHeld = (sc.abilities || []).map(a => ((a && a.id) || a)); c.choseAbility = ctx.choseAbility | 0; c.pelletDeclineArm = PELLET_DECLINE; } catch (e) { c.fusionInstalled = null; }
  c.courtAccords = ctx.courtAccords | 0;
  c.tended = ctx.tended | 0;
  c.tendPeer = ctx.tendPeer | 0;
  c.fillTopUps = ctx.fillTopUps | 0;
  c.fillTopUpLiters = ctx.fillTopUpLiters | 0;
  c.fillUnloads = ctx.fillUnloads | 0;
  c.fillSkipStudy = ctx.fillSkipStudy | 0;
  c.fillSkipFull = ctx.fillSkipFull | 0;
  c.defenseCalls = ctx.defenseCalls | 0;
  c.courtNational = ctx.courtNational | 0;
  const deaths = [];
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (e && e.type === 'death') deaths.push({ day: e.day, who: e.who, cause: e.cause, player: !!e.player });
    }
  } catch (e2) {}
  c.deathLog = deaths;
  const out = { census: c, notes: (ctx.notes || []).slice(-20),
    // R113 telemetry fix (r110 metric review): the scale driver's census
    // never emitted these keys, so telemetry-check's fightsTotal /
    // fightsByWave.4 / maxGameDay always read 0. fightsTotal counts
    // startCombat-called fights (uprising/party-betrayal direct builds
    // bypass startCombat and are excluded — same scope as the ladder
    // instrument); fightsByWave keys are wave numbers as strings.
    fightsTotal: (liFin.fights || []).length,
    fightsByWave: (() => { const m = {}; for (const f of (liFin.fights || [])) { if (f.wave != null) m[String(f.wave)] = (m[String(f.wave)] | 0) + 1; } return m; })(),
    maxGameDay: c.day }; 
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-trust-${seed}.json`), JSON.stringify(out, null, 1));
  // R109: one file per raise-answer talk (the r108 blank — the talks were
  // invisible to the instruments). Read by the people check in full.
  try {
    (c.raiseTalks || []).forEach((t, i) => {
      const nm = (() => { try { return vname(t.vid) || t.vid; } catch (e) { return t.vid; } })();
      const lines = (t.lines || []).map(l => `${l.who === 'them' ? 'THEM' : 'YOU'}: ${l.text}`).join('\n');
      fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-raisetalk-${seed}-${i + 1}.txt`),
        `=== seed ${seed} day ${t.day} — raise-answer talk with ${nm} (${t.vid}), village ${t.village}, outcome ${t.outcome} ===\n${lines || '(no lines recorded — the conversation opened no transcript)'}\n`);
    });
  } catch (e) { console.log(`  raise-talk emit error seed ${seed}: ${e && e.message}`); }
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-capture-${seed}.txt`), capture.join('\n'));
  const beatLines = capture.filter(s => /lead|subordinate|tribute|national|defense|feast|primary|demand|swear|allegiance|granary|court/i.test(s)).slice(0, 120);
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-beats-${seed}.txt`), beatLines.join('\n'));
  const momentLines = capture.filter(s => /governance layer: online|the shared granary opens|species agency: unlocked|one fire was a village|coordination layer: online/i.test(s));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-moments-${seed}.txt`), momentLines.join('\n'));
  // R24 table-approach arm: every line that voices the approach (or its absence)
  const tableLines = capture.filter(s => /table is being set|ARC IV|the ledger still wants|lesser seat|full seat|the table has your name|does not come|NO HUNGER ON THE RECORD|THE DEEDS ARE NOT|priced for what you built|the ring of pale light/i.test(s));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-want-${seed}.txt`), tableLines.join('\n'));
  // R29 governance dump: every classified mechanism line, day-attributed
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-gov-${seed}.txt`), govWatch.map(g => `d${g.day} [${g.cls}] ${g.line}`).join('\n'));
  // R103 nat-gate dump: one row per policy day (the staging gates, read-only).
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-natgate-${seed}.txt`), natGateWatch.map(n => `d${n.day} rank=${n.rank} nat=${n.nationalLive} glob=${n.globalLive} netLive=${n.networkLive} netDay=${n.networkLiveDay} rung=${n.rungReady} exiled=${n.exiled} refused=${n.scaleRefused} pend=${n.pendingShape || '-'}@${n.pendingDay == null ? '-' : n.pendingDay} lead=${n.leadSeasoned}/${n.leadActive} cov=${n.covSeasoned}/${n.covActive} trade=${n.tradeSeasoned}/${n.tradeActive} belong=${n.belong ? (n.belong.other + ':t' + n.belong.trust + '/a' + n.belong.arrears + '/age' + n.belong.age + '/realm' + n.belong.realm + '/good' + (n.belong.good ? 1 : 0)) : '-'} foreignMax=${n.foreignMax} polities=${JSON.stringify({ lead: n.leadPolity, belong: n.belongPolity, cov: n.covPolity, trade: n.tradePolity })} defer=${JSON.stringify(n.defer)} view=${n.viewership}`).join('\n'));
  // R107 Q1 regional-gate dump: one row per policy day + the per-seed corpus JSON
  // (same shape as the regionalstep corpus — daily rows with .gate — so
  // regionalstep-analyze-20261107.js reads it directly).
  try {
    const _regDaily = ((regInst.t && regInst.t.daily) || []).slice();
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-reggate-${seed}.txt`), _regDaily.map(d => `d${d.day} gate=${d.gate || '?'} rank=${d.scale || d.scaleRankSnap || '?'} netLive=${d.networkLive ? 1 : 0} known=${d.knownCount} bestDet=${d.bestDet} bestVill=${d.bestVillageId || '-'} propose=${d.proposeCalls} raisesAcc=${d.acceptLinkRaiseCalls} counters=${d.proposeCounter} links=${d.activeLinks}/${d.everLinks} oldestAge=${d.oldestActiveAge} firstLink=${d.firstLinkDay} accord=${d.firstAccordDay}`).join('\n'));
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-regional-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r125', policy: 'scalecourt', daily: _regDaily, regionalAttempts: (regFin && regFin.regionalAttempts) || [], talkCalls: (regFin && regFin.talkCalls) || [], firstLinkDay: (regFin && regFin.firstLinkDay) || null, firstAccordDay: (regFin && regFin.firstAccordDay) || null, instrumentErrors: ((regInst.t && regInst.t.instrumentErrors) || []).slice() }, null, 1));
    const _gateTally = {};
    _regDaily.forEach(d => { _gateTally[d.gate || '?'] = (_gateTally[d.gate || '?'] | 0) + 1; });
    console.log(`  regGate seed ${seed}: rows=${_regDaily.length} gates=${JSON.stringify(_gateTally)} propose=${(_regDaily.length ? _regDaily[_regDaily.length - 1].proposeCalls : 0)} links=${(_regDaily.length ? _regDaily[_regDaily.length - 1].activeLinks : 0)}/${(_regDaily.length ? _regDaily[_regDaily.length - 1].everLinks : 0)} errors=${(((regInst.t && regInst.t.instrumentErrors) || []).length)}`);
  } catch (e) { console.log(`  regGate seed ${seed}: EMIT-ERROR ${e && e.message}`); }
  // R99 water-refusal dump: every cistern-dry / pack-full fill refusal, day-attributed
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-water-${seed}.txt`), waterWatch.map(w => `d${w.day} [${w.cls}] ${w.line}`).join('\n'));
  // R34 trust dump: daily snapshots + engine-book events, human-readable
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-trust-${seed}.txt`), trustWatch.map(t => `d${t.day} ${t.kind} ${t.other} trust=${t.trust} formed=d${t.formedDay} poolLive=${t.poolLive} lastKept=${t.lastKeptDay} mournUntil=${t.mourningUntil} arrears=${t.arrears} pendDef=${t.pendingDefense} pendCrisis=${t.pendingCrisis}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-trustevents-${seed}.txt`), trustEvents.map(e => `d${e.day} ${e.kind} ${e.other} [${e.noteKind}] ${e.note}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-trustset-${seed}.txt`), trustSetLog.map(e => `d${e.day} ${e.kind} ${e.other} ${e.before}->${e.after} (delta ${e.delta}) :: ${e.stack}`).join('\n'));
  // R39 hunger-window dump: one row per policy day (opening state).
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-morntrace3-${seed}.txt`), mornTrace.map(r => `d${r.day} ${r.stage} at=(${r.px},${r.py}) hyd=${r.hyd} pilgrim=${r.pilgrim || '-'} ret=${r.returning ? 1 : 0} packW=${r.packWater} tile=${r.tileType} tent=${r.insideTent ? 1 : 0} wx=${r.weather} ticks=${r.dayTicks} drank=${r.drank} packKg=${r.packKg} cap=${r.carryCap} cist=${r.cistClean}/${r.cistDirty} top=${r.packTop}` + (r.dThirst != null ? ` dThirst=${r.dThirst} dForage=${r.dForage} dStanding=${r.dStanding} dDetours=${r.dDetours} dDrank=${r.dDrank}` : '')).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-postrace-${seed}.txt`), posTrace.map(r => `d${r.day} ${r.stage} ${r.vid} at=(${r.px},${r.py}) target=(${r.tx},${r.ty}) dist=${r.dist}` + (r.stage === 'walk' ? ` after=(${r.px2},${r.py2}) dist2=${r.dist2}` : '') + (r.reason ? ` reason=${r.reason}` : '')).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-hungerwatch-${seed}.txt`), hungerWatch.map(h => `d${h.day} pantry=${h.pantry} hungryDays=${h.hungryDays} pilgrim=${h.pilgrim ? h.pilgrimVid : '-'} returning=${h.returning} pilg=${h.pilgrimages} studies=${h.climbStudies} propPeer=${h.proposedPeer} courtPoor=${h.courtPoorDays} pool=${h.pool}`).join('\n'));
  // R39 table-approach dump: one row per policy day (opening seat price).
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-wantwatch-${seed}.txt`), tableWatch.map(t => `d${t.day} seat=${t.seat} arc=${t.arc} wait=${t.tableWaiting} ann=${t.tableAnnounced} done=${t.tableDone} rank=${t.scaleRank} glob=${t.globalLive} ot=${t.overtimeTier} detail=${JSON.stringify(t.detail)}`).join('\n'));
  // R39 betrayal dump: accept + daily person snapshots for accepted subjects.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-betray-${seed}.txt`), betrayWatch.map(b => `d${b.day} ${b.event} ${b.name} (${b.vid})` + (b.event === 'accept' ? ` armed=${b.armed === null ? 'unknown' : (b.armed ? 'armed' : 'ordinary')}` : '') + ` dead=${b.dead} trust=${b.trust} inRoster=${b.inRoster}`).join('\n'));
  // R52 barrier dump: every sayOncePerFight call, day-attributed.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-barrier-${seed}.txt`), barrierLog.map(b => `d${b.day} inCombat=${b.inCombat} tbfight=${b.tbfight} over=${b.tbfightOver} msg=${b.msg} :: ${b.stack}`).join('\n'));
  // R52 armor dump: every capture line mentioning armor/craft/bark, for the
  // armor-move pin (Q1). Read-only extraction from the say capture.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-armor-${seed}.txt`), capture.filter(s => /armor|bark|craft/i.test(s)).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-duty-${seed}.txt`), dutyWatch.map(d => `d${d.day} roster=${d.roster} atHaven=${d.atHaven} deadfall=[${d.deadfallAssigned.join(',')}] wcd=${JSON.stringify(d.weaponCraftCd)} wc=${JSON.stringify(d.weaponCraft)}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-wsplit-${seed}.json`), JSON.stringify(wsplitWatch, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-fusion-${seed}.txt`), fusionWatch.map(f => `d${f.day} scholar=${f.scholarVid} installed=${f.installed} onlineFlag=${f.onlineFlag} sinceDay=${f.sinceDay} online=${f.online} hasAbility=${f.hasAbility} holder=${JSON.stringify(f.holder)} abilities=[${(f.abilities || []).join(',')}]`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-fusionfeast-${seed}.txt`), fusionFeast.map(f => `d${f.day} [${f.cls}] ${f.line}`).join('\n'));
  // R113 Q1 ladder dumps: one daily row per policy day + the wrapper
  // event logs (capstone deliveries, fights with wave attribution).
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-ladder-${seed}.txt`), (liFin.daily || []).map(d => {
    const tr = d.tracks ? `fight=${d.tracks.fight} forage=${d.tracks.forage} craft=${d.tracks.craft} talk=${d.tracks.talk} explore=${d.tracks.explore}` : 'tracks=-';
    const ct = d.countedTracks ? `cfight=${d.countedTracks.fight} cforage=${d.countedTracks.forage} ccraft=${d.countedTracks.craft} ctalk=${d.countedTracks.talk} cexplore=${d.countedTracks.explore}` : 'ctracks=-';
    const caps = d.capstones ? Object.keys(d.capstones).map(k => `${k}=${d.capstones[k] ? (d.capstones[k].ready ? 'ready' : d.capstones[k].reason) : '?'}`).join(',') : 'caps=-';
    // Mechanism counts (r122 fix — the pilot showed the reasons alone
    // cannot say HOW short the tribute/charter are): living wave-4+
    // veterans on hand, sealed chartered trade links, bundle done.
    const mech = d.capstones ? `vets=${(d.capstones.military_tribute && d.capstones.military_tribute.veterans != null) ? d.capstones.military_tribute.veterans : '-'} charterLinks=${(d.capstones.trade_charter && d.capstones.trade_charter.charteredLinks != null) ? d.capstones.trade_charter.charteredLinks : '-'} bundle=${(d.capstones.feast_embassy && d.capstones.feast_embassy.bundle != null) ? (d.capstones.feast_embassy.bundle ? 1 : 0) : '-'}` : 'mech=-';
    const det = d.detail ? `led=${d.detail.fightLedger} fXp=${d.detail.fieldXp} cXp=${d.detail.craftXp} links=${d.detail.links} cont=${d.detail.contests} disc=${d.detail.discovery} brd=${d.detail.breadth} aLinks=${d.detail.activeLinks} bb=${d.detail.bundleBonus} bStages=[${(d.detail.bundleStages || []).join(',')}] banked=${d.detail.bankedHeadStart == null ? 0 : d.detail.bankedHeadStart}` : 'detail=-';
    // R113 attribution columns: today's scholar vid, sentiment taught
    // yet, and the running wave-4+ kill attribution (same-day scholar
    // rule; the analyzer's day-joined join is authoritative).
    const attr = `scholar=${d.scholarVid || '-'} sent=${d.sentimentTaught == null ? '-' : (d.sentimentTaught ? 1 : 0)}` + (d.killAttr ? ` kAttr=w4:${d.killAttr.w4total}/sch:${d.killAttr.w4scholar}/vil:${d.killAttr.w4villager}/null:${d.killAttr.w4null}/dist:${d.killAttr.w4distinctVillagers}/liv:${d.killAttr.w4livingVillagers}` : ' kAttr=-');
    return `d${d.day} stage=${d.stage} peak=${d.peakStage} counted=${d.counted} cap=${d.cap} next=${d.nextThreshold == null ? '-' : d.nextThreshold} ${d.nextStageName || '-'} short=${d.shortfall} ${tr} ${ct} capped=[${(d.capped || []).join(',')}] ${det} caps: ${caps} ${mech} delivered=${d.delivered || '-'} seat=${d.seat} ${attr}`;
  }).join('\n'));
  // R113 Q1 veteran-attribution corpus: the waveKillLog rows (wave >= 3),
  // the per-channel counters, and the daily scholar-vid map — the
  // analyzer attributes every kill and every killer's fate from this.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-vetkill-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r125', waveKillLog: (liFin.waveKillLog || []), waveKillByChannel: (liFin.waveKillByChannel || {}), scholarVidsByDay: (liFin.scholarVidsByDay || {}), deaths: (liFin.deaths || []), finalRoster: (liFin.finalRoster || []), instrumentErrors: (liFin.errors || []).slice() }, null, 1));
  // R125 Q2 death-census corpus: the daily context rows, the fallen
  // deaths with causes, the telemetry death rows, joins/leavers, and
  // the reconciliation summary — the analyzer scores the attribution
  // from this.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-deathcensus-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r125', daily: (dcFin.daily || []), deaths: (dcFin.deaths || []), teleDeaths: (dcFin.teleDeaths || []), joins: (dcFin.joins || []), leavers: (dcFin.leavers || []), summary: (dcFin.summary || {}), instrumentErrors: (dcFin.errors || []).slice() }, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-deathcensus-${seed}.txt`), (dcFin.deaths || []).map(d => `d${d.day} ${d.name || d.vid} (${d.vid}) cause=${d.cause || '?'}${d.monsterName ? ' monster=' + d.monsterName : ''}`).join('\n'));
  // R113 Q1+Q2 trade-road corpus: the daily trade snapshots, the beat
  // answers, the wild-fight log, and the scholar-vid map — the analyzer
  // scores the trade road and the wild wave-4 question from this.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-traderoad-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r125', policy: 'scalecourt-traderoad-r122', daily: (trFin.daily || []), beatAnswers: (trFin.beatAnswers || []), wildFights: (trFin.wildFights || []), scholarVidsByDay: (trFin.scholarVidsByDay || {}), instrumentErrors: (trFin.errors || []).slice() }, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-traderoad-${seed}.txt`), (trFin.daily || []).map(d => `d${d.day} subs=${d.subs} trade=${d.trSeasoned}/${d.trN} cov=${d.covN} viable=${d.viable} sealed=${d.sealed} chartered=${d.charteredLinks} cand=${d.candidates} pool=${d.pool == null ? '-' : d.pool} pendCtr=${d.pendingCounter ? 1 : 0} pend=${d.pendingShape || '-'}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-wildfights-${seed}.txt`), (trFin.wildFights || []).map(f => `d${f.day} ${f.cls} ${f.vid || '-'} ${f.mid || '?'} w${f.wave == null ? '?' : f.wave} ${f.outcome || '?'} rounds=${f.rounds == null ? '-' : f.rounds}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-beatanswers-${seed}.txt`), (trFin.beatAnswers || []).map(b => `d${b.day} ${b.shape || '?'} -> ${b.how} (${b.out || '-'})`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r125-ladderevents-${seed}.txt`), [
    ...((liFin.deliveries || []).map(x => `d${x.day} DELIVER ${x.kind || '?'} ok=${x.ok ? 1 : 0} reason=${x.reason ? String(x.reason).replace(/\s+/g, '_') : 'none'}`)),
    ...((liFin.fights || []).map(x => `d${x.day} FIGHT ${x.monsterId || '?'} wave=${x.wave == null ? '?' : x.wave}`)),
    ...((liFin.errors || []).map(x => `d${x.day} INSTRUMENT-ERROR ${x.where}: ${x.err}`)),
  ].join('\n'));
  const govCount = (cls) => govWatch.filter(g => g.cls === cls).length;
  console.log(`seed ${seed}: day=${c.day} over=${c.over} won=${c.won} pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} lead=${c.leadActive}/${c.leadSeasoned} rank=${c.scaleRank} natVoiced=${c.nationalVoiced} globVoiced=${c.globalVoiced} proposed=${ctx.proposed|0} lrAns=${LR ? (LR.linkraiseStats().raisesAnswered + '/' + LR.linkraiseStats().raisesSeen) : '-'} lrErr=${LR ? LR.linkraiseStats().errors : '-'} lrTalks=${(c.raiseTalks||[]).length} tended=${ctx.tended|0} defense=${ctx.defenseCalls|0} seat=${c.tableSeat} arc=${c.arcNow} tW=${c.tableWaiting} tDone=${c.tableState ? (c.tableState.phase || '-') : '-'} sit=${c.sitStats.taken}/${c.sitStats.previewSeen} sdFail=${c.sitStats.failed} sdGuard=${c.sitStats.guardRefused} door=${(c.modalStats.doors||[]).map(d=>d.door).join(',')||'-'} mpAns=${c.modalStats.answers} govAnn=${govCount('govAnnounce')} tribArr=${govCount('tribArrive')} tribShort=${govCount('tribShort')} courtLines=${govCount('courtLine')} granDraw=${govCount('granaryDraw')} feast=${govCount('feastCourt')} fusion=${c.fusionInstalled} abilities=${(c.abilitiesHeld||[]).join(',')}`);
  // R113 Q1: one-line ladder rollup per seed (the analyzer prints the stage table).
  try { const _l = c.ladderChain || {}; console.log(`  ladder: rows=${_l.rows} err=${_l.errors} peak=${_l.peakStage} s1=${_l.stage1Day == null ? '-' : 'd' + _l.stage1Day} s2=${_l.stage2Day == null ? '-' : 'd' + _l.stage2Day} s3=${_l.stage3Day == null ? '-' : 'd' + _l.stage3Day} countedEnd=${_l.countedEnd} shortEnd=${_l.shortfallEnd} capped=[${(_l.cappedEnd || []).join(',')}] tracks=${JSON.stringify(_l.tracksEnd)} bundleStages=[${(_l.bundleStages || []).join(',')}] bb=${_l.bundleBonusEnd} banked=${_l.bankedHeadStartEnd} sent=${_l.sentimentTaughtDay == null ? '-' : 'd' + _l.sentimentTaughtDay} kAttr=${JSON.stringify(_l.killAttrEnd)} vetkillRows=${_l.vetkillRows} ready=${JSON.stringify(_l.capstoneReady)} delivered=${_l.capstoneDelivered ? (_l.capstoneDelivered.kind + '@d' + _l.capstoneDelivered.day) : '-'} deliv=${_l.deliveriesOk}/${_l.deliveries} attempts=${_l.deliveryAttempts} lesser=${_l.seatLesserDay == null ? '-' : 'd' + _l.seatLesserDay} full=${_l.seatFullDay == null ? '-' : 'd' + _l.seatFullDay} fights=${_l.fights} byWave=${JSON.stringify(_l.fightsByWave)}`); } catch (e) {}
  // R113 Q1+Q2: one-line trade-road + wild-w4 rollup per seed.
  // R125 Q2: one-line death-census rollup per seed.
  try { const _d = c.deathCensus || {}; console.log(`  deathCensus: rows=${_d.rows} err=${_d.errors} deaths=${_d.deaths} byCause=${JSON.stringify(_d.byCause)} multi=${JSON.stringify(_d.multiDeathDays)} teleP=${_d.telePerson} teleM=${_d.teleMonster} joins=${_d.joins} leavers=${_d.leavers} booksClose=${_d.booksClose} unattributed=${_d.unattributed} dutyDays=${_d.dutyDays} healerDays=${_d.healerDays}`); } catch (e) {}
  try { const _t = c.tradeRoad || {}; const _w = c.wildW4 || {}; console.log(`  trade: rows=${_t.rows} err=${_t.errors} firstTrade=${_t.firstTradeProposalDay == null ? '-' : 'd' + _t.firstTradeProposalDay} maxTrade=${_t.maxTradeLinks} maxSeasoned=${_t.maxTradeSeasoned} seasoned3=${_t.firstSeasonedTradeDay == null ? '-' : 'd' + _t.firstSeasonedTradeDay} maxSubs=${_t.maxSubs} subCapSkips=${_t.subCapSkips} covWalks=${_t.covenantWalks} charterStaged=${_t.charterStagedDay == null ? '-' : 'd' + _t.charterStagedDay} sealed=${_t.sealedDay == null ? '-' : 'd' + _t.sealedDay} beats=[${_t.beatAnswers || '-'}]`); console.log(`  wildW4: fights=${_w.rows} err=${_w.errors} villW4=${_w.villagerW4Calls} byOutcome=${JSON.stringify(_w.villagerW4ByOutcome)} villW4Deaths=${_w.villagerW4Deaths} scholW4=${_w.scholarW4Calls} villW1-3=${JSON.stringify(_w.villagerW1_3)}`); } catch (e) {}
  try { const _ng = natGateWatch[natGateWatch.length - 1] || {}; console.log(`  natGate final: d${_ng.day} rank=${_ng.rank} rung=${_ng.rungReady} lead=${_ng.leadSeasoned}/${_ng.leadActive} cov=${_ng.covSeasoned}/${_ng.covActive} trade=${_ng.tradeSeasoned}/${_ng.tradeActive} belong=${_ng.belong ? (_ng.belong.other + ':t' + _ng.belong.trust + '/realm' + _ng.belong.realm + '/good' + (_ng.belong.good ? 1 : 0)) : '-'} pend=${_ng.pendingShape || '-'} foreignMax=${_ng.foreignMax} rows=${natGateWatch.length}`); } catch (e) {}
  return c;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    try {
      results.push(await playSeed(seed));
    } catch (e) {
      console.log(`SEED ${seed} CRASH: ${e && e.stack || e}`);
      results.push({ seed, crash: String(e && e.message || e) });
    }
  }
  console.log('\n===== R125 SUMMARY =====');
  for (const r of results) {
    if (r.crash) { console.log(`seed ${r.seed}: CRASH ${r.crash}`); continue; }
    console.log(`seed ${r.seed}: day=${r.day} over=${r.over} won=${r.won} pop=${r.popAlive}/${r.popTotal} lead=${r.leadActive}/${r.leadSeasoned} rank=${r.scaleRank} natV=${r.nationalVoiced} globV=${r.globalVoiced} proposed=${r.proposedLead} lr=${r.linkraise ? (r.linkraise.raisesAnswered + '/' + r.linkraise.raisesSeen + ' err' + r.linkraise.errors) : '-'} lrTalks=${(r.raiseTalks||[]).length} tended=${r.tended} defense=${r.defenseCalls} seat=${r.tableSeat} arc=${r.arcNow} tW=${r.tableWaiting} sit=${r.sitStats ? (r.sitStats.taken + '/' + r.sitStats.previewSeen) : '-'} door=${r.modalStats ? ((r.modalStats.doors||[]).map(d=>d.door).join(',')||'-') : '-'} gAns=${(r.globalNotes||[]).length}`);
  }
})().catch(e => { console.error('DRIVER ERROR:', e && e.stack || e); process.exit(2); });
