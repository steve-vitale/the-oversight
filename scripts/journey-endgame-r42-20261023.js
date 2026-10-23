// journey-endgame-r42-20261023.js — LANE B leg 4 (endgame), run 42.
//
// Leg question (pre-registered): THE NETWORK KEY, SECOND MEASUREMENT.
// r19 (2026-10-18) found: overtime fully voiced + tier 6 reachable; the titan
// chain council->call->commit plays, but the FIGHT is muster-blocked at the
// bot's diplomacy depth (5/10 herald, 3/12 nielsen); key path unwinnable 0/4;
// deferral lethal-by-design (all four villages starved in the wait).
// r20 (2026-10-19) then BUILT the missing verb: `titan:standdown:<tid>`
// breaks an unfillable muster — the exit r19's death spiral needed.
// Question now: (a) can the muster FIGHT gate be reached on current master
// at all? (b) does the stand-down verb make key-deferral survivable — does
// the village live through the wait instead of bleeding out?
// Interesting-finding bar: a fight-ready muster (first titan fight in sims);
// a stand-down fired + village alive >=20d after; or the same muster-block
// with fresh numbers (the design blank persists — Steve's tuning call).
//
// Binding metrics (a miss is NO-GO, never re-scored mid-run):
//   M1 reach GO: >=3/4 seeds reach table announcement.
//   M2 overtime GO: >=1 seed reaches overtime tier >=3 unseated.
//   M3 muster GO: >=1 titan muster reaches fight-ready (titanMusterReady)
//                on any seed — the gate that missed in r19.
//   M4 stand-down GO: >=1 unfillable muster stood down via the verb with
//                outcome 'stood-down' recorded, village alive >=20d after.
//   M5 people GO: >=2 beats sense-read (war council / stand-down / a tier
//                rise), 0 senseless flags.
//   M6 census GO: clean ends, no crash/softlock; <=10d tail on dead villages.
//
// Seeds: fresh 84011-84014. PILOT: seed 84011 only first; expand if the chain
// shows any life (a fight-ready muster or a stand-down).
// Horizon: DAYCAP=260, death-aware. Env BEFORE any require (r18 lesson):
// belongseek reads BELONG_V3 at load; feastscale gates on FEASTSCALE_R13.
// The driver only calls verbs a player can call (council/call/commit/
// standdown via titanSelfDo), marches honestly, lets the fight engine decide.
// Stand-down rule (competent-player logic, said aloud by the verb itself):
// after call+commit, if the muster hasn't grown for 15 days and is below
// half the gate, or the call has stood 45 days unanswered, the player breaks
// it — retreat is not resolution (r20's design), but it stops the bleed.
// belongseek reads BELONG_V3 at load; feastscale gates on FEASTSCALE_R13.
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.BELONG_V3 = '1';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-23');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [84011]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '260', 10);
const SIT_FALLBACK_DAY = DAYS - 15; // if the key chain never completes, sit and win normally

const DOORS = ['feared', 'defiant', 'beloved', 'witness', 'assimilated', 'relay', 'indispensable'];

const { loadGame, setupGame, runDays } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const CMP = require('./policies/competent');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// minAllies per titan id, from src/data/titans.json (finale 20, nielsen 12,
// herald 10, network 20). The driver reads the muster against the same bar
// the game enforces in titanMusterReady.
var MIN_ALLIES = { finale: 20, nielsen: 12, herald: 10, the_network: 20 };
function musterBlades(G, tid) {
  try {
    const st = G._titanTest && G._titanTest.titanState ? G._titanTest.titanState() : null;
    const mu = st && st.musters ? st.musters[tid] : null;
    if (!mu) return { haven: 0, allied: 0, total: 0 };
    const haven = (mu.haven || []).length;
    const allied = (mu.allies || []).length;
    return { haven, allied, total: haven + allied };
  } catch (e) { return { haven: 0, allied: 0, total: 0 }; }
}

// ---- transcript capture (r18 pattern) ----
function attachTranscript(G, m) {
  const t = m.trans = { say: [], frames: [], lastFrameSig: null };
  const osay = G.say, osys = G.sysSay;
  const push = (tag, x) => {
    try {
      const s = stripHtml(x).slice(0, 500);
      if (s) t.say.push(`[d${day(G)}] ${tag}: ${s}`);
    } catch (e) {}
  };
  G.say = function (x) { push('SAY', x); try { return osay.call(this, x); } catch (e) {} };
  G.sysSay = function (x) { push('SYS', x); try { return osys.call(this, x); } catch (e) {} };
  return t;
}

// ---- table + network instrument ----
function attachKey(G, m) {
  const t = m.key = {
    doorPicks: [], doorEntries: [], sceneFires: [], failEvents: [], frames: [],
    announceDay: null, tierHist: [], titans: {}, network: { summoned: false, fallen: false, lost: false },
    seatHeld: [], sitDay: null, wonTele: null, hostsOffered: 0, hostsTaken: 0,
    standdowns: [], // r42: {day, tid, blades, need, reason}
  };
  try {
    const otele = G.tele;
    G.tele = function (ev, data) {
      try {
        if (ev === 'table_won') t.wonTele = { day: day(G), data: JSON.parse(JSON.stringify(data || {})) };
        if (ev === 'network_summoned') t.network.summoned = true;
        if (ev === 'network_fallen') t.network.fallen = true;
        if (ev === 'network_lost') t.network.lost = true;
      } catch (e) {}
      return otele.call(this, ev, data);
    };
  } catch (e) {}
  const origChoose = G.chooseTableOption;
  if (typeof origChoose === 'function') {
    G.chooseTableOption = function (id) {
      try {
        const T = (G.tableState ? G.tableState() : {}) || {};
        const tc = (G.state.scholar || {}).tableChoices;
        const opts = (tc && tc.options) || [];
        const ids = new Set(opts.map(o => String((o && o.id) || '')));
        const phase = T.phase || '';
        // DOOR STEER: pick the first earned door on the preference list.
        if (phase === 'paths' && !T.path && opts.length &&
            opts.every(o => String((o && o.id) || '').indexOf('path:') === 0)) {
          const have = new Set(opts.map(o => String(o.id).slice(5)));
          const want = DOORS.find(p => have.has(p));
          if (want) {
            t.doorPicks.push({ day: day(G), want, offer: opts.map(o => String(o.id).slice(5)) });
            id = 'path:' + want;
          }
        }
        // FINALS STEER: take THE HOSTS when the key's ending is on the menu.
        if (phase === 'finals' && ids.has('final:hosts')) {
          t.hostsTaken++;
          t.hostsOffered++;
          id = 'final:hosts';
        } else if (phase === 'finals' && ids.has('final:hosts') === false) {
          // count offerings that weren't taken (other final options listed)
        }
      } catch (e) {}
      return origChoose.call(this, id);
    };
  }
  const origStart = G.tableStartPath;
  if (typeof origStart === 'function') {
    G.tableStartPath = function (pid2) {
      const r = origStart.apply(this, arguments);
      try {
        const T = (G.tableState ? G.tableState() : {}) || {};
        t.doorEntries.push({ day: day(G), path: T.path || pid2 || null, branch: T.branch || T.band || null });
      } catch (e) {}
      return r;
    };
  }
  const origScene = G.tableScene;
  if (typeof origScene === 'function') {
    G.tableScene = function () {
      try { t.sceneFires.push({ day: day(G) }); if (t.sitDay == null) t.sitDay = day(G); } catch (e) {}
      return origScene.apply(this, arguments);
    };
  }
  const origPrompt = G.tablePrompt;
  if (typeof origPrompt === 'function') {
    G.tablePrompt = function (html, options, frame) {
      try {
        const T = (G.tableState ? G.tableState() : {}) || {};
        const optIds = (options || []).map(o => String(o.id));
        if (optIds.indexOf('final:hosts') >= 0) t.hostsOffered++;
        t.frames.push({
          day: day(G), frame: frame || '', phase: T.phase || '',
          path: T.path || null, beat: T.beat == null ? null : T.beat,
          prompt: stripHtml(html || '').slice(0, 1500),
          options: (options || []).map(o => `${o.id} :: ${stripHtml(o.label || '').slice(0, 160)}`),
        });
      } catch (e) {}
      return origPrompt.apply(this, arguments);
    };
  }
  return t;
}

// NON-CREATING omen read: G._titanTest.titanOmen(tid) CREATES the omen
// entry ({stage:0, day:0}) when missing, and titanAdvanceOmen then stages it
// forward every dawn — the r19 pilot summoned both titans ~50 days early
// by reading the omen. Always read the raw state instead.
function omenOf(G, tid) {
  try {
    const st = G._titanTest && G._titanTest.titanState ? G._titanTest.titanState() : null;
    return (st && st.omens && st.omens[tid]) || null;
  } catch (e) { return null; }
}
function slainOf(G, tid) {
  try {
    const st = G._titanTest && G._titanTest.titanState ? G._titanTest.titanState() : null;
    return !!(st && st.slain && st.slain[tid]);
  } catch (e) { return false; }
}
function titanIds(G) {
  const ids = [];
  try {
    const cast = G.titanCast ? G.titanCast() : null;
    if (cast) {
      if (cast.herald && ids.indexOf(cast.herald) < 0) ids.push(cast.herald);
      if (cast.apocalypse && ids.indexOf(cast.apocalypse) < 0) ids.push(cast.apocalypse);
    }
  } catch (e) {}
  try {
    const third = G.overtimeThirdTitan ? G.overtimeThirdTitan() : null;
    if (third && ids.indexOf(third) < 0) ids.push(third);
  } catch (e) {}
  // the Network joins the drive list once summoned
  try {
    const pg = (G.progState && G.progState()) || {};
    if (pg.networkSummoned && !pg.networkFallen && !pg.networkLost && ids.indexOf('the_network') < 0) ids.push('the_network');
  } catch (e) {}
  return ids;
}

// which world monster the driver marches on for this titan id
function titanMonsterId(G, tid) {
  try {
    if (tid === 'finale') {
      const c = G.finaleCampaign ? G.finaleCampaign() : null;
      if (!c || !c.crew) return 'finale_crew';
      if (!c.opening) return 'finale_opening';
      return 'finale';
    }
    if (tid === 'the_network') {
      const cur = G.networkCurrentNode ? G.networkCurrentNode() : null;
      return cur ? cur.monster : null;
    }
    return tid; // herald / nielsen: monster id == titan id
  } catch (e) { return null; }
}

function findWorldMonster(G, mid) {
  try {
    const list = G.worldMonsters ? G.worldMonsters() : [];
    for (const w of list) {
      if (!w) continue;
      if (w.id === mid || w.monster === mid) return w;
    }
  } catch (e) {}
  return null;
}

function keyTitanDaily(G, ctx, m) {
  const k = ctx._r42k = ctx._r42k || {};
  const TT = G._titanTest || {};
  let tier = 0;
  try { tier = G.overtimeTier ? G.overtimeTier() : 0; } catch (e) {}
  const dNow = day(G);
  for (const tid of titanIds(G)) {
    const s = k[tid] = k[tid] || { stage: 0, council: false, called: false, callDay: null, commits: 0, fights: 0, slain: false, ready: false, musterSnap: null, bladeHist: [], stoodDown: null };
    if (s.stoodDown != null) continue; // muster broken by the player — no re-calling
    if (slainOf(G, tid)) { s.slain = true; continue; }
    const o = omenOf(G, tid); // non-creating read (r19 fix)
    const stage = o ? (o.stage | 0) : 0;
    s.stage = stage;
    if (stage < 2) continue;
    if (!s.council) {
      try { G.titanWarCouncil(tid); } catch (e) { s.councilErr = String(e && e.message || e).slice(0, 120); }
      s.council = true;
    }
    if (!s.called) {
      try { G.soundTitanCall(tid); s.callDay = dNow; } catch (e) { s.callErr = String(e && e.message || e).slice(0, 120); }
      s.called = true;
    }
    // commit Haven's own (two taps; up to 3)
    try {
      let blades = 0;
      const st2 = TT.titanState ? TT.titanState() : null;
      const muster = st2 && st2.musters ? st2.musters[tid] : null;
      blades = muster ? ((muster.haven || []).length) : 0;
      s.havenBlades = blades;
      if (blades < 3 && s.commits < 8) {
        const r = TT.titanCommitOwn ? TT.titanCommitOwn(tid) : null;
        s.commits++;
        if (r === 'confirm') { try { TT.titanCommitOwn(tid); } catch (e) {} }
      }
    } catch (e) { s.commitErr = String(e && e.message || e).slice(0, 120); }
    let ready = false;
    try { ready = G.titanMusterReady ? !!G.titanMusterReady(tid) : false; } catch (e) {}
    s.ready = ready;
    if (!ready) {
      // r42: the stand-down rule (competent-player logic, r20's verb).
      // The muster bleeds upkeep every day it stands unanswered; a player
      // who sees no growth breaks it instead of watching the village starve.
      try {
        const mb = musterBlades(G, tid);
        const need = MIN_ALLIES[tid] || 12;
        if (s.bladeHist.length === 0 || s.bladeHist[s.bladeHist.length - 1].day < dNow) {
          s.bladeHist.push({ day: dNow, blades: mb.total });
          if (s.bladeHist.length > 60) s.bladeHist.shift();
        }
        const daysHeld = s.callDay != null ? dNow - s.callDay : 0;
        const recent = s.bladeHist.filter(h => h.day >= dNow - 15);
        const maxRecent = recent.length ? Math.max.apply(null, recent.map(h => h.blades)) : 0;
        const stalled = daysHeld >= 20 && mb.total < need && mb.total <= maxRecent && mb.total < Math.ceil(need / 2);
        const hardStop = daysHeld >= 45 && mb.total < need;
        if ((stalled || hardStop) && typeof G.titanSelfDo === 'function') {
          const acts = (G.titanSelfActions ? G.titanSelfActions() : []) || [];
          if (acts.some(a => a && a.id === 'titan:standdown:' + tid)) {
            try {
              G.titanSelfDo('titan:standdown:' + tid);
              s.stoodDown = dNow;
              s.stoodDownBlades = mb.total;
              s.stoodDownReason = stalled ? 'stalled-15d-below-half-gate' : 'held-45d-unanswered';
              if (m && m.key && m.key.standdowns) m.key.standdowns.push({ day: dNow, tid, blades: mb.total, need, reason: s.stoodDownReason });
            } catch (e) { s.standdownErr = String(e && e.message || e).slice(0, 120); }
          }
        }
        s.musterSnap = JSON.stringify({ blades: mb.total, need, daysHeld }) + ' ' + (s.musterSnap || '').slice(0, 200);
      } catch (e) {}
      continue;
    }
    // march + fight: find the piece, walk to its tile, startCombat.
    // The harness's fight loop drives the blow-by-blow afterwards.
    if (s.fights >= 8) continue; // don't churn on a hard gate
    if (G.tbfight && !G.tbfight.over) continue;
    const mid = titanMonsterId(G, tid);
    if (!mid) { s.noMonster = (s.noMonster | 0) + 1; continue; }
    const w = findWorldMonster(G, mid);
    if (!w) { s.noMonster = (s.noMonster | 0) + 1; continue; }
    try {
      if (G.map.px !== w.tx || G.map.py !== w.ty) CMP.walkTo(G, w.tx, w.ty);
    } catch (e) { s.walkErr = String(e && e.message || e).slice(0, 120); }
    if (G.over) return;
    if (G.tbfight && !G.tbfight.over) continue; // something found us
    let here = null;
    try { here = (G.monsterAt ? G.monsterAt(G.map.px, G.map.py) : null) || (G.playerMonster ? G.playerMonster() : null); } catch (e) {}
    if (!here || (here.id !== mid && here.monster !== mid)) {
      // it wandered or is the next node now; re-resolve next dawn
      s.noMonster = (s.noMonster | 0) + 1;
      continue;
    }
    try {
      G.startCombat(mid);
      s.fights++;
    } catch (e) { s.fightErr = String(e && e.message || e).slice(0, 120); }
  }
}

// ---- seat deferral: hold the seat until the key chain completes or fallback ----
function keyDone(G) {
  try { const pg = (G.progState && G.progState()) || {}; if (pg.networkFallen) return true; } catch (e) {}
  return false;
}

// ---- conversation driver (r18's pinned fresh-first driver, unchanged) ----
function pickChoice(list, turn, used) {
  if (!list || !list.length) return null;
  used = used || new Set();
  const fresh = (id) => !used.has(id);
  const byIdFresh = (id) => list.find(x => x && x.id === id && fresh(id));
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === 0 && fresh(x.id));
  if (ans) return ans;
  for (const id of ['dlg:engage', 'dlg:ask', 'dlg:comfort', 'dlg:share', 'dlg:teach', 'dlg:listen', 'ask:teach_me', 'want:ask']) {
    const c = byIdFresh(id); if (c) return c;
  }
  for (const id of ['dlg:encourage', 'dlg:reassure', 'dlg:joke', 'dlg:smalltalk']) {
    const c = byIdFresh(id); if (c) return c;
  }
  const react = list.find(x => x && x.id === 'dlg:react' && fresh('dlg:react'));
  if (react && turn < 6) return react;
  const stay = list.find(x => x && x.id && x.id !== 'leave' && x.id.indexOf('leave') !== 0 && fresh(x.id));
  if (stay && turn < 5) return stay;
  const anyStay = list.find(x => x && x.id && x.id !== 'leave' && x.id.indexOf('leave') !== 0);
  if (anyStay && turn < 10) return anyStay;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(G, vid, dayNum) {
  const L = [];
  try {
    let cur = G.startConvo(vid);
    if (!cur) { L.push(`(startConvo returned null for ${vid})`); return L; }
    const nm = (() => { try { return G.displayName(vid) || vid; } catch (e) { return vid; } })();
    L.push(`=== day ${dayNum} — conversation with ${nm} ===`);
    L.push(`THEM: ${stripHtml(cur.line || '(no line)')}`);
    let turn = 0;
    const used = new Set();
    while (turn < 12 && cur && !cur.ended) {
      const opts = cur.choices || [];
      const c = pickChoice(opts, turn, used);
      if (!c) { L.push('(no choice matched — menu exhausted)'); break; }
      used.add(c.id);
      L.push(`YOU [${c.id}]: ${stripHtml(c.label || c.id)}`);
      const isLeave = String(c.id).indexOf('leave') === 0;
      try { cur = G.convoTurn(vid, c.id); } catch (e) { L.push(`(convoTurn threw: ${String(e && e.message || e).slice(0, 120)})`); break; }
      if (!cur) { L.push('(convoTurn returned null)'); break; }
      if (cur.ended) { L.push('(conversation ended)'); break; }
      L.push(`THEM: ${stripHtml(cur.line || '(no line)')}`);
      if (isLeave) break;
      turn++;
    }
    L.push(`(turns: ${turn})`);
  } catch (e) { L.push(`(conversation failed: ${String(e && e.message || e).slice(0, 160)})`); }
  return L;
}
function census(G) {
  try {
    return (G.state.village.roster || []).map(id => {
      let p = {}; try { p = G.getPerson(id) || {}; } catch (e) {}
      let nm = id; try { nm = G.displayName(id) || id; } catch (e) {}
      return { id, name: nm, alive: !p.dead, occ: p.formerOccupation || p.occupation || null };
    });
  } catch (e) { return []; }
}

async function runOne(seed) {
  const TF = require('./policies/tribfloor');
  const drainBase = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer',
    'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const myDaily = (G, ctx) => {
    const m = ctx._r42m;
    // 1. the key driver: titans + network march (before seat logic)
    try { keyTitanDaily(G, ctx, m); } catch (e) { if (m) m.key.driveErr = String(e && e.message || e).slice(0, 160); }
    // 2. the seat: HELD until the key chain completes (networkFallen) or the
    //    fallback day — the overtime clock needs unseated days to reach tier 3.
    const d = day(G);
    try {
      const pv = G.tablePreview ? G.tablePreview() : null;
      if (pv && pv.ready && (keyDone(G) || d >= SIT_FALLBACK_DAY)) {
        try { SD.driveSeat(G, ctx); } catch (e) { if (m) m.key.seatDriveErr = String(e && e.message || e).slice(0, 160); }
      } else if (pv && pv.ready) {
        if (m && m.key.seatHeld.length < 40) m.key.seatHeld.push({ day: d, tier: (() => { try { return G.overtimeTier(); } catch (e) { return null; } })() });
      }
    } catch (e) {}
    return drainBase.daily(G, ctx);
  };
  const policy = Object.assign({}, SD.belongseat, {
    id: 'belongseat-key-r42',
    desc: 'belongseat + key driver (titans/network march) + deferred seat + standdown, r42',
    daily: myDaily,
  });
  const { Game } = await loadGame({ seed, mode: 'endgame-r42-key' });
  await setupGame(Game);
  const m = { ctx: null };
  attachTranscript(Game, m);
  attachKey(Game, m);
  const ctx = { _r42m: m };
  let harnessCtx = null;
  const wrappedDaily = policy.daily;
  policy.daily = (G, c2) => {
    c2._r42m = m;
    harnessCtx = c2;
    const d = day(G);
    try {
      if (m.key.announceDay == null) {
        const pv = G.tablePreview ? G.tablePreview() : null;
        if (pv) m.key.announceDay = d;
      }
      const tier = (() => { try { return G.overtimeTier ? G.overtimeTier() : 0; } catch (e) { return 0; } })();
      if (d % 5 === 0 || tier > (m.key.tierHist.length ? m.key.tierHist[m.key.tierHist.length - 1].tier : -1)) {
        m.key.tierHist.push({ day: d, tier });
      }
      // per-dawn titan ledger snapshot (non-creating reads only — r19 fix)
      if (d % 5 === 0) {
        const snap = {};
        for (const tid of titanIds(G)) {
          const o = omenOf(G, tid);
          snap[tid] = { stage: o ? (o.stage | 0) : null, slain: slainOf(G, tid) };
        }
        // r42: outcome-log snapshot — the end-of-run read can return null on
        // dead runs, so capture the log mid-run (refused/fought/stood-down).
        try {
          const tt = G._titanTest;
          if (tt && tt.titanOutcomeLog) snap._outcomes = JSON.parse(JSON.stringify(tt.titanOutcomeLog() || []));
        } catch (e) { snap._outcomes = null; }
        // coalition depth: active hierarchy links, wave, rank (muster-gate context)
        try {
          const links = (G.hierarchyState ? G.hierarchyState() : []).filter(l => l && l.status === 'active');
          snap._links = links.length;
        } catch (e) { snap._links = null; }
        try { snap._wave = G.unlockedWave ? G.unlockedWave() : null; } catch (e) {}
        try { snap._rank = G.scaleRank ? G.scaleRank() : null; } catch (e) {}
        m.key.titans['d' + d] = snap;
      }
    } catch (e) {}
    return wrappedDaily(G, c2);
  };
  const res = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  // convo probe on a run alive past d130
  let convos = [];
  try {
    const alive = (Game.state.village.roster || []).filter(id => !(Game.getPerson(id) || {}).dead);
    if (day(Game) >= 130 && alive.length > 1) {
      const other = alive.find(id => id !== Game.villagerId) || alive[0];
      convos = runConversation(Game, other, 130);
    }
  } catch (e) { convos = ['(convo probe failed: ' + String(e && e.message || e).slice(0, 120) + ')']; }
  const k = (harnessCtx && harnessCtx._r42k) || {};
  let outcomes = null;
  try { outcomes = (G._titanTest && G._titanTest.titanOutcomeLog) ? G._titanTest.titanOutcomeLog() : null; } catch (e) {}
  const out = {
    seed, days: res.days, over: !!Game.over, won: !!Game.won,
    endDay: day(Game),
    key: {
      announceDay: m.key.announceDay, sitDay: m.key.sitDay, seatHeld: m.key.seatHeld,
      tierHist: m.key.tierHist, titans: m.key.titans, driverState: k,
      network: m.key.network, hostsOffered: m.key.hostsOffered, hostsTaken: m.key.hostsTaken,
      wonTele: m.key.wonTele, doorPicks: m.key.doorPicks, doorEntries: m.key.doorEntries,
      failEvents: m.key.failEvents, driveErr: m.key.driveErr, seatDriveErr: m.key.seatDriveErr,
      standdowns: m.key.standdowns, outcomes: outcomes,
    },
    census: census(Game),
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r42-key-s${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r42-transcript-key-s${seed}.txt`), (m.trans.say || []).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r42-frames-key-s${seed}.json`), JSON.stringify(m.key.frames, null, 1));
  if (convos.length) fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r42-convos-key-s${seed}.txt`), convos.join('\n'));
  return out;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`[r42] seed ${seed} pilot ...`);
    try {
      const r = await runOne(seed);
      results.push({ seed, ok: true, days: r.days, won: r.won, key: { announce: r.key.announceDay, sit: r.key.sitDay, network: r.key.network, hostsTaken: r.key.hostsTaken } });
      console.log(`[r42] seed ${seed} DONE days=${r.days} won=${r.won} announce=${r.key.announceDay} sit=${r.key.sitDay} net=${JSON.stringify(r.key.network)} hosts=${r.key.hostsTaken}`);
      console.log(`[r42] seed ${seed} titans:`, JSON.stringify(Object.keys(r.key.driverState).map(t => ({ t, stage: r.key.driverState[t].stage, slain: r.key.driverState[t].slain, fights: r.key.driverState[t].fights, ready: r.key.driverState[t].ready }))));
    } catch (e) {
      results.push({ seed, ok: false, err: String(e && e.message || e).slice(0, 300) });
      console.log(`[r42] seed ${seed} FAILED: ${String(e && e.message || e).slice(0, 200)}`);
    }
  }
  console.log(JSON.stringify(results, null, 1));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
