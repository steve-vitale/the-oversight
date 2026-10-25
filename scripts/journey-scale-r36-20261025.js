// scripts/journey-scale-r36-20261025.js — journey leg SCALE (days 80-140) R36:
// BOOK-THE-MOVES ARM, MATCHED WORLDS: r35 proved every trust move routes
// through a logged setter and named all 112 drops ≤ −4, but two move
// classes are voiced in the moment and never booked: titan night-strikes
// (−5, titans.js titanEscalate) and league-pool shortfall charges (−4,
// hierarchy.js covenantTick). r36 runs r35's seeds (85001-85004) on the
// PATCHED build (one _linkNote per move, no number changes) with the
// driver UNCHANGED except labels/EVIDIR/mode: same trust-setter
// instrument, same betrayal picker handling, same DRIVER DROP marker,
// same DAYCAP 180. Policy UNCHANGED (scalecourt-nogate); standing
// scalecourt.js untouched.
// PRE-REGISTER: evidence/2026-10-25/journey-scale-r36-prereg.md (binding;
// BOOK-TITAN, BOOK-POOL, NO-NUMBER-CHANGE parity, PICK-G guard, BETRAY,
// BONDS/NATIONAL report-only).
//   Horizon: DAYCAP=180 loop-days, death-aware stop.
//   PILOT GATE: seed 85001 runs first; if it crashes or pilgrimages == 0, STOP.
//   Policy: scalecourt-nogate. Seeds: matched 85001-85004.
// Usage: SEEDS=85001 node scripts/journey-scale-r36-20261025.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [85001, 85002, 85003, 85004]);
const DAYCAP = parseInt(process.env.DAYCAP || '180', 10);
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-25', 'journey-scale-r36-trustset');
fs.mkdirSync(EVIDIR, { recursive: true });

const { mulberry32, loadGame, setupGame, runDays } = require('./sim-harness');
const { scalecourt } = require('./policies/scalecourt-nogate');

let _G = null, _currentSeed = null, capture = [];
// R24 table-approach instruments: weekly seat samples + global-answer notes,
// reset per seed in playSeed().
let seatWatch = [], globalNotes = [], poolWatch = []; // R31: weekly league-pool samples {day, pool, pantry}
let villageWatch = []; // R31: weekly village census {day, villages:[{id,name,dist,known,rumored,generated,opinion,codexGiven,linkKind,linkTrust,linkAge}]}
let trustWatch = [], trustEvents = [], prevHist = {}; // R34: DAILY link-trust snapshots + new link.history entries as they appear (history is capped at 40, so daily diffing preserves the engine's own book)

// R27 dedup instrument (journey-scale r27 2026-10-24): day-attributed capture
// of the two BIGGER-STAGE beat classes — game.js Beat 4 (scalePointerW4) vs
// scaleDiscovery._sdNextAct. Both fire = the pre-fix double-pitch signature.
let beatWatch = []; // {day, cls, line}
const BEAT4_RX = /cleared the board!|get me standing/i;
const SDNEXTACT_RX = /can't stage what's coming|get me a network/i;

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
  } catch (e) {}
}
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
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


// R36 trust-setter instrument: redefine every active link's `trust` as an
// accessor (backing value in a WeakMap, so no extra key lands on the link
// object and JSON/save shape is unchanged) that logs every NONZERO
// assignment with the day, the link, before/after, and the call stack.
// Gains routed through _trustGain and direct-assignment drops both pass
// through the setter, so the stack names the writer in both cases. Install
// is idempotent per link object (a replaced link object installs fresh at
// its current trust, never logging a phantom delta). Driver-only.
let trustSetLog = [];
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
  const fp = path.join(EVIDIR, `journey-scale-r36-transcript-${_currentSeed}-day${day}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    if (!r0) { log(`THEM: (no line — startConvo returned null for ${vid})`); fs.writeFileSync(fp, L.join('\n')); return fp; }
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    const pickSt = { consec: 0, deflected: false }; // R33 picker-cap state
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      if (turn === 0) log(`(turn0 choices: ${(choices || []).map(x => x && x.id).join(', ') || 'NONE'})`);
      const pick = pickChoice(choices, turn, pickSt);
      if (!pick || pick.id === 'leave') { if (!pick) log(`!! DRIVER DROP: unhandled choices: ${(choices || []).map(x => x && x.id).join(', ') || 'NONE'}`); log('YOU: (leave)'); break; }
      // R34: update cap state from the pick just made.
      if (pick.id === 'dlg:more' || pick.id === 'goon') pickSt.consec += 1; else pickSt.consec = 0;
      if (DEFLECT.indexOf(pick.id) !== -1) pickSt.deflected = true;
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
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
    villageTotal: (() => { try { return (_G.state.otherVillages || []).length; } catch (e) { return null; } })(),
    villageKnownEnd: (() => { try { return (_G.state.otherVillages || []).filter(v => _G.knowsVillage ? _G.knowsVillage(v) : (v.generated || v.rumored)).length; } catch (e) { return null; } })(),
    poolEverMax: poolWatch.reduce((m, x) => Math.max(m, x.pool || 0), 0),
    covLinks: links().filter(l => l && (l.kind === 'covenant') && l.status === 'active').map(l => ({ other: (l.a === 'haven' ? l.b : l.a), trust: l.trust, ageDays: day - (l.day | 0), poolLive: !!l.poolLive })),
    globalNotes: globalNotes.slice(),
    convoFiles: convoFiles.slice(),
    // R27 dedup instrument: day-attributed BIGGER-STAGE beats + scaleDiscovery state
    beatWatch: beatWatch.slice(),
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
  capture = [];
  beatWatch = [];
  govWatch = [];
  convoFiles.length = 0;
  seatWatch = [];
  poolWatch = [];
  villageWatch = [];
  globalNotes = [];
  trustWatch = [];
  trustEvents = [];
  trustSetLog = [];
  prevHist = {};
  console.log(`\n===== SEED ${seed} (covenant road — third-bond) =====`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r36-trustset' });
  _G = Game;
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { cap(a[0]); try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { cap(a[0]); try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const policy = Object.create(scalecourt);
  policy.id = 'journey-scale-r36-trust-scalecourt';
  policy._ctx = null;
  const baseDaily = scalecourt.daily.bind(scalecourt);
  const baseSetup = scalecourt.setup ? scalecourt.setup.bind(scalecourt) : null;
  policy.setup = function (G, ctx) { if (baseSetup) baseSetup(G, ctx); policy._ctx = ctx; };
  policy.daily = function (G, ctx) {
    const hadPendingGlobal = !!((G.state || {}).pendingGlobal);
    installTrustSetters(); // R36: catch links formed during the day's actions, before the policy step moves them
    baseDaily(G, ctx);
    installTrustSetters(); // R36: catch links formed during the policy step, for tomorrow's actions
    snapshotTrust(); // R36: daily trust snapshot AFTER the day's policy step, so the snapshot is the day's closing trust
    const gd = gday();
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
  };
  const result = await runDays(Game, policy, {
    days: DAYCAP,
    manifest: { seed, mode: 'journey-scale-r36-trustset', date: new Date().toISOString().slice(0, 10), node: process.version },
  });
  const ctx = policy._ctx || {};
  const c = census();
  c.proposedLead = (ctx.proposedLead | 0) || (ctx.proposed | 0);
  c.proposedPeer = ctx.proposedPeer | 0;
  c.pilgrimages = ctx.pilgrimages | 0;
  c.climbStudies = ctx.climbStudies | 0;
  c.courtPoorDays = ctx.courtPoorDays | 0;
  c.pilgrimagesPoor = ctx.pilgrimagesPoor | 0;
  c.proposedPeerPoor = ctx.proposedPeerPoor | 0;
  c.courtCounters = ctx.courtCounters | 0;
  c.courtAccords = ctx.courtAccords | 0;
  c.tended = ctx.tended | 0;
  c.defenseCalls = ctx.defenseCalls | 0;
  c.courtNational = ctx.courtNational | 0;
  const deaths = [];
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (e && e.type === 'death') deaths.push({ day: e.day, who: e.who, cause: e.cause, player: !!e.player });
    }
  } catch (e2) {}
  c.deathLog = deaths;
  const out = { census: c, notes: (ctx.notes || []).slice(-20) };
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r36-trust-${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r36-capture-${seed}.txt`), capture.join('\n'));
  const beatLines = capture.filter(s => /lead|subordinate|tribute|national|defense|feast|primary|demand|swear|allegiance|granary|court/i.test(s)).slice(0, 120);
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r36-beats-${seed}.txt`), beatLines.join('\n'));
  const momentLines = capture.filter(s => /governance layer: online|the shared granary opens|species agency: unlocked|one fire was a village|coordination layer: online/i.test(s));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r36-moments-${seed}.txt`), momentLines.join('\n'));
  // R24 table-approach arm: every line that voices the approach (or its absence)
  const tableLines = capture.filter(s => /table is being set|ARC IV|the ledger still wants|lesser seat|full seat|the table has your name|does not come|NO HUNGER ON THE RECORD|THE DEEDS ARE NOT|priced for what you built|the ring of pale light/i.test(s));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r36-table-${seed}.txt`), tableLines.join('\n'));
  // R29 governance dump: every classified mechanism line, day-attributed
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r36-gov-${seed}.txt`), govWatch.map(g => `d${g.day} [${g.cls}] ${g.line}`).join('\n'));
  // R34 trust dump: daily snapshots + engine-book events, human-readable
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r36-trust-${seed}.txt`), trustWatch.map(t => `d${t.day} ${t.kind} ${t.other} trust=${t.trust} formed=d${t.formedDay} poolLive=${t.poolLive} lastKept=${t.lastKeptDay} mournUntil=${t.mourningUntil} arrears=${t.arrears} pendDef=${t.pendingDefense} pendCrisis=${t.pendingCrisis}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r36-trustevents-${seed}.txt`), trustEvents.map(e => `d${e.day} ${e.kind} ${e.other} [${e.noteKind}] ${e.note}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r36-trustset-${seed}.txt`), trustSetLog.map(e => `d${e.day} ${e.kind} ${e.other} ${e.before}->${e.after} (delta ${e.delta}) :: ${e.stack}`).join('\n'));
  const govCount = (cls) => govWatch.filter(g => g.cls === cls).length;
  console.log(`seed ${seed}: day=${c.day} over=${c.over} pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} lead=${c.leadActive}/${c.leadSeasoned} rank=${c.scaleRank} natVoiced=${c.nationalVoiced} globVoiced=${c.globalVoiced} proposed=${ctx.proposedLead|0} tended=${ctx.tended|0} defense=${ctx.defenseCalls|0} seat=${c.tableSeat} arc=${c.arcNow} tW=${c.tableWaiting} govAnn=${govCount('govAnnounce')} tribArr=${govCount('tribArrive')} tribShort=${govCount('tribShort')} courtLines=${govCount('courtLine')} granDraw=${govCount('granaryDraw')} feast=${govCount('feastCourt')}`);
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
  console.log('\n===== R36 SUMMARY =====');
  for (const r of results) {
    if (r.crash) { console.log(`seed ${r.seed}: CRASH ${r.crash}`); continue; }
    console.log(`seed ${r.seed}: day=${r.day} over=${r.over} pop=${r.popAlive}/${r.popTotal} lead=${r.leadActive}/${r.leadSeasoned} rank=${r.scaleRank} natV=${r.nationalVoiced} globV=${r.globalVoiced} proposed=${r.proposedLead} tended=${r.tended} defense=${r.defenseCalls} seat=${r.tableSeat} arc=${r.arcNow} tW=${r.tableWaiting} gAns=${(r.globalNotes||[]).length}`);
  }
})().catch(e => { console.error('DRIVER ERROR:', e && e.stack || e); process.exit(2); });
