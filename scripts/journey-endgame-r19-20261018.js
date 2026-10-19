// journey-endgame-r19-20261018.js — LANE B leg 4 (endgame), run 19.
//
// Leg question (pre-registered): THE NETWORK KEY — the last un-measured
// endgame design (TABLE.md: "Rarity is a target, not a measurement yet:
// 'almost impossible', well under 1% of strong runs — the playing bot will
// measure it."). Gates:
//   G1: the table announces; the bot holds unseated to overtime tier >= 3
//       (21+ unseated days) while surviving.
//   G2: herald slain via the played chain (war council -> call -> commit ->
//       blow-by-blow coalition fight).
//   G3: nielsen slain (or finale, whichever the run casts as apocalypse).
//   G4: the third titan (overtime tier>=2 brings the uncast one) slain — the
//       finale arrives as a three-node march.
//   G5: networkKeyReady() -> engine summons the Network -> the 9-node march
//       is fought (or the key is lost aloud).
//   G6: the bot sits; THE HOSTS is offered on the path; table_won carries
//       key:'network'.
// Interesting-finding bar: the FIRST gate that completes, or the first that
// provably breaks (documented; no cheats — the driver only calls the verbs
// a player can call, marches honestly, and lets the fight engine decide).
//
// Binding metrics (a miss is NO-GO, never re-scored mid-run):
//   M1 reach GO: >=3/4 seeds reach table announcement.
//   M2 overtime GO: >=1 seed reaches overtime tier >=3 unseated.
//   M3 coalition GO: >=1 titan chain completes (council->call->commit->
//                    fight resolves blow-by-blow).
//   M4 slain: per-titan slain flags recorded across seeds (measurement).
//   M5 people GO: >=2 titan beats sense-read (war council / call / a node
//                 fight), 0 senseless flags.
//   M6 census GO: post-run census real on all runs; no crash/softlock.
//
// Seeds: fresh 8971-8974. PILOT: seed 8971 only first; expand if the chain
// shows any life (any of G2/G3 completing).
// Horizon: DAYCAP=260, death-aware. Env BEFORE any require (r18 lesson):
// belongseek reads BELONG_V3 at load; feastscale gates on FEASTSCALE_R13.
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.BELONG_V3 = '1';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-18');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [8971]).filter(Number.isFinite);
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
  const k = ctx._r19k = ctx._r19k || {};
  const TT = G._titanTest || {};
  let tier = 0;
  try { tier = G.overtimeTier ? G.overtimeTier() : 0; } catch (e) {}
  for (const tid of titanIds(G)) {
    const s = k[tid] = k[tid] || { stage: 0, council: false, called: false, commits: 0, fights: 0, slain: false, ready: false, musterSnap: null };
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
      try { G.soundTitanCall(tid); } catch (e) { s.callErr = String(e && e.message || e).slice(0, 120); }
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
      try { const ms = G.titanMusterState ? G.titanMusterState(tid) : null; s.musterSnap = JSON.stringify(ms || {}).slice(0, 300); } catch (e) {}
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
    const m = ctx._r19m;
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
    id: 'belongseat-key-r19',
    desc: 'belongseat + key driver (titans/network march) + deferred seat, r19',
    daily: myDaily,
  });
  const { Game } = await loadGame({ seed, mode: 'endgame-r19-key' });
  await setupGame(Game);
  const m = { ctx: null };
  attachTranscript(Game, m);
  attachKey(Game, m);
  const ctx = { _r19m: m };
  let harnessCtx = null;
  const wrappedDaily = policy.daily;
  policy.daily = (G, c2) => {
    c2._r19m = m;
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
  const k = (harnessCtx && harnessCtx._r19k) || {};
  const out = {
    seed, days: res.days, over: !!Game.over, won: !!Game.won,
    endDay: day(Game),
    key: {
      announceDay: m.key.announceDay, sitDay: m.key.sitDay, seatHeld: m.key.seatHeld,
      tierHist: m.key.tierHist, titans: m.key.titans, driverState: k,
      network: m.key.network, hostsOffered: m.key.hostsOffered, hostsTaken: m.key.hostsTaken,
      wonTele: m.key.wonTele, doorPicks: m.key.doorPicks, doorEntries: m.key.doorEntries,
      failEvents: m.key.failEvents, driveErr: m.key.driveErr, seatDriveErr: m.key.seatDriveErr,
    },
    census: census(Game),
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r19-key-s${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r19-transcript-key-s${seed}.txt`), (m.trans.say || []).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r19-frames-key-s${seed}.json`), JSON.stringify(m.key.frames, null, 1));
  if (convos.length) fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r19-convos-key-s${seed}.txt`), convos.join('\n'));
  return out;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`[r19] seed ${seed} pilot ...`);
    try {
      const r = await runOne(seed);
      results.push({ seed, ok: true, days: r.days, won: r.won, key: { announce: r.key.announceDay, sit: r.key.sitDay, network: r.key.network, hostsTaken: r.key.hostsTaken } });
      console.log(`[r19] seed ${seed} DONE days=${r.days} won=${r.won} announce=${r.key.announceDay} sit=${r.key.sitDay} net=${JSON.stringify(r.key.network)} hosts=${r.key.hostsTaken}`);
      console.log(`[r19] seed ${seed} titans:`, JSON.stringify(Object.keys(r.key.driverState).map(t => ({ t, stage: r.key.driverState[t].stage, slain: r.key.driverState[t].slain, fights: r.key.driverState[t].fights, ready: r.key.driverState[t].ready }))));
    } catch (e) {
      results.push({ seed, ok: false, err: String(e && e.message || e).slice(0, 300) });
      console.log(`[r19] seed ${seed} FAILED: ${String(e && e.message || e).slice(0, 200)}`);
    }
  }
  console.log(JSON.stringify(results, null, 1));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
