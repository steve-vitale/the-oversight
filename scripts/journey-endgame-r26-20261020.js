#!/usr/bin/env node
// journey-endgame-r26-20261020.js — LANE B leg 4 (endgame), run 26.
//
// Leg question (pre-registered): PATH VARIETY — r25 showed 6 of 7 doors are
// offered on every competent seat, but the r25 driver always picked
// feared-first, so every win ran feared/light. Are the other doors'
// challenges playable and winnable, or is the table a one-track game in
// practice? This run forces each of the 5 other lesser-seat doors
// (beloved, witness, assimilated, defiant, relay) when offered and plays
// the challenge through. Indispensable is FULL-seat-only; the seatdriver
// stack earns lesser, so it stays out of scope (expected: never offered).
//
// Interesting-finding bar: (a) all 5 doors resolve through their
// challenges (win / downgrade / failure-resolution) -> variety is REAL;
// (b) any door whose challenge stalls, fails to resolve, or wipes the run
// -> named bug/blank with the phase identified.
//
// Binding metrics (a miss is NO-GO, never re-scored mid-run):
// - M1 instrument GO: 100% of runs complete (win / honest loss / resolved
//   downgrade); no crash, no softlock, no unresolved table phase at end.
// - M2 door GO: for each of the 5 forced doors, the challenge runs its
//   beats to a terminal outcome (win / downgrade / failure) — no stall
//   (same beat repeating >40 frames), no phase that never advances.
// - M3 people GO: 1 sense-read of a challenge beat per forced door
//   (5 reads); 0 senseless flags.
// - M4 failure-resolution GO: canon law 4 — if a path fails, a downgrade
//   is OFFERED (assimilated/defiant/witness/relay re-path), never a wipe.
// - M5 guardrail GO: table announce rate consistent with r25 shape
//   (8/10 seated); no instrument perturbation.
// - M6 census GO: all runs end cleanly; roster snapshot recorded.
//
// Stack: identical to r25 (seat-driver tip + titan driver with stand-down
// hook; TRIBFLOOR=1 WINDEFER=1 FEASTSCALE_R13=1 BELONG_V3=1 set BEFORE any
// require — r18's lesson). The ONLY change vs r25 is door steering: the
// table wrapper forces FORCEDOOR (env) on the FIRST paths-phase entry only;
// downgrade re-entries follow the driver's natural first-in-offer choice.
// This is a playability probe, not a preference measurement — r25's
// natural-order wrapper stands as the preference record.
//
// Env: SEEDS=csv (default per-door pairs, fresh). DAYS=260 (default).
//   FORCEDOOR=<door> — the door to force when offered (one per process).
// Horizon: DAYCAP=260, death-aware.
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.BELONG_V3 = '1';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-20');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9055, 9056, 9057, 9058]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '260', 10);
const FORCEDOOR = process.env.FORCEDOOR || 'beloved';
const ARM_TAG = 'r26-door-' + FORCEDOOR;
const STANDDOWN_AFTER = 5; // dawns a muster stands unfillable before the player breaks it

const DOORS = ['feared', 'defiant', 'beloved', 'witness', 'assimilated', 'relay', 'indispensable'];

const { loadGame, setupGame, runDays } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const CMP = require('./policies/competent');
const TF = require('./policies/tribfloor');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---- transcript capture (r18/r19 pattern) ----
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

// ---- table instrument (r25 pattern + FORCEDOOR on first paths entry) ----
function attachTable(G, m) {
  const t = m.tab = {
    doorPicks: [], doorEntries: [], sceneFires: [], failEvents: [], frames: [],
    announceDay: null, sitDay: null, wonTele: null, tierHist: [],
    beatVisits: {}, // "path/beat/frame" -> count, for stall detection
  };
  try {
    const otele = G.tele;
    G.tele = function (ev, data) {
      try {
        if (ev === 'table_won') t.wonTele = { day: day(G), data: JSON.parse(JSON.stringify(data || {})) };
        if (ev === 'table_failed' || ev === 'table_fail') t.failEvents.push({ day: day(G), ev, data: JSON.parse(JSON.stringify(data || {})) });
      } catch (e) {}
      return otele.call(this, ev, data);
    };
  } catch (e) {}
  const origChoose = G.chooseTableOption;
  if (typeof origChoose === 'function') {
    G.chooseTableOption = function (id) {
      try {
        const T = (G.tableState ? G.tableState() : {}) || {};
        const opts = (((G.state.scholar || {}).tableChoices) || {}).options || [];
        const phase = T.phase || '';
        if (phase === 'paths' && !T.path && opts.length &&
            opts.every(o => String((o && o.id) || '').indexOf('path:') === 0)) {
          const have = new Set(opts.map(o => String(o.id).slice(5)));
          const forcedFirst = t.doorPicks.length === 0 && have.has(FORCEDOOR);
          const want = forcedFirst ? FORCEDOOR : DOORS.find(p => have.has(p));
          if (want) {
            t.doorPicks.push({ day: day(G), want, offer: opts.map(o => String(o.id).slice(5)),
              forced: forcedFirst ? 1 : 0, pathNotOffered: (t.doorPicks.length === 0 && !have.has(FORCEDOOR)) ? FORCEDOOR : null });
            id = 'path:' + want;
          }
        }
        // stall detector: count beat/frame visits per path
        try {
          const Ts = (G.tableState ? G.tableState() : {}) || {};
          if (Ts.path && (Ts.phase === 'challenge' || Ts.phase === 'final')) {
            const k = `${Ts.path}/${Ts.beat == null ? 'x' : Ts.beat}/${Ts.frame || ''}`;
            t.beatVisits[k] = (t.beatVisits[k] || 0) + 1;
          }
        } catch (e) {}
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
        let branchSignals = null;
        try { branchSignals = G.tableBranch ? G.tableBranch(T.path || pid2) : null; } catch (e) {}
        let ledger = null;
        try {
          const L = G.ledger ? G.ledger() : {};
          const keys = ['showmanship', 'protected', 'killed', 'might', 'brokerage', 'exposed',
            'embrace', 'defiance', 'betrayed', 'foodShared', 'foodHoarded'];
          ledger = {};
          for (const k of keys) ledger[k] = (L && L[k]) | 0;
        } catch (e) {}
        t.doorEntries.push({ day: day(G), path: T.path || pid2 || null,
          branch: T.branch || T.band || null, branchSignals, ledger,
          forced: (t.doorEntries.length === 0 && (T.path || pid2) === FORCEDOOR) ? 1 : 0 });
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

// ---- seat snapshot (r23) ----
function seatSnapshot(G) {
  const out = {};
  try { out.seat = JSON.parse(JSON.stringify(G.tableSeat ? G.tableSeat() : null)); } catch (e) { out.seatErr = String(e && e.message || e).slice(0, 120); }
  try { out.full = JSON.parse(JSON.stringify(G.deedGateReady ? G.deedGateReady() : null)); } catch (e) { out.fullErr = String(e && e.message || e).slice(0, 120); }
  try {
    const L = G.ledger ? G.ledger() : {};
    const keys = ['showmanship', 'protected', 'killed', 'might', 'brokerage', 'exposed',
      'embrace', 'defiance', 'betrayed', 'foodShared', 'foodHoarded'];
    out.ledger = {};
    for (const k of keys) out.ledger[k] = (L && L[k]) | 0;
  } catch (e) { out.ledgerErr = String(e && e.message || e).slice(0, 120); }
  return out;
}

// NON-CREATING omen read (r19 fix): G._titanTest.titanOmen(tid) CREATES the omen.
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
function musterOf(G, tid) {
  try {
    const st = G._titanTest && G._titanTest.titanState ? G._titanTest.titanState() : null;
    return (st && st.musters && st.musters[tid]) || null;
  } catch (e) { return null; }
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
  return ids;
}
function titanMonsterId(G, tid) {
  try {
    if (tid === 'finale') {
      const c = G.finaleCampaign ? G.finaleCampaign() : null;
      if (!c || !c.crew) return 'finale_crew';
      if (!c.opening) return 'finale_opening';
      return 'finale';
    }
    return tid;
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

// ---- coalition instrumentation (r21, unchanged) ----
function linkOtherOf(G, link) {
  try { if (G._linkOther) return G._linkOther(link, 'haven'); } catch (e) {}
  try { return link.primary === 'haven' ? link.subordinate : link.primary; } catch (e) { return null; }
}
function linksSnapshot(G) {
  let out = [];
  try {
    const links = (G.hierarchyState ? G.hierarchyState() : []) || [];
    for (const l of links) out.push({ other: linkOtherOf(G, l), kind: l.kind || l.relation || '', trust: l.trust });
  } catch (e) { out = []; }
  return out;
}
function attachCoal(G, m) {
  m.coal = { joins: 0, chafes: 0, _censusDays: [] };
  try {
    const otele = G.tele;
    if (typeof otele === 'function') {
      G.tele = function (ev, data) {
        try {
          if (ev === 'coalition_formed' || ev === 'link_formed') m.coal.joins++;
          if (ev === 'coalition_chafe') m.coal.chafes++;
        } catch (e) {}
        return otele.call(this, ev, data);
      };
    }
  } catch (e) {}
  return m.coal;
}

// ---- titan driver (r25, unchanged) ----
function titanDaily(G, ctx, m) {
  const k = (ctx._r25k = ctx._r25k || { musters: [], stands: [], standdowns: 0, fights: 0, kills: 0, losses: 0, musterFull: 0, musterShort: 0 });
  try {
    const pv = G.tablePreview ? G.tablePreview() : null;
    if (pv && pv.ready) return k;
    const ids = titanIds(G);
    for (const tid of ids) {
      if (slainOf(G, tid)) continue;
      const omen = omenOf(G, tid);
      if (!omen) continue;
      const mid = titanMonsterId(G, tid);
      const wm = findWorldMonster(G, mid);
      if (!wm) continue;
      if (!k.musters.some(x => x.tid === tid)) k.musters.push({ tid, day: day(G), muster: musterOf(G, tid) });
      const muster = musterOf(G, tid);
      const full = muster && muster.full;
      if (full) { k.musterFull++; } else { k.musterShort++; }
      const key = tid + '@' + day(G);
      if ((k._stood && k._stood[key]) || 0) return;
      (k._stood = k._stood || {})[key] = 1;
      k.stands.push({ tid, day: day(G), full: !!full });
      if (!full) {
        const streak = k.stands.length;
        if (streak >= STANDDOWN_AFTER) { k.standdowns++; return; }
        return;
      }
    }
  } catch (e) { if (m) m.titanErr = String(e && e.message || e).slice(0, 160); }
}

// ---- conversation driver (r18's pinned fresh-first driver, from r25) ----
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
// ---- census (r25, unchanged) ----
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
  const drainBase = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer',
    'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const myDaily = (G, ctx) => {
    const m = ctx._r26m;
    try { titanDaily(G, ctx, m); } catch (e) { if (m) m.titanErr = String(e && e.message || e).slice(0, 160); }
    try {
      const pv = G.tablePreview ? G.tablePreview() : null;
      if (pv && pv.ready) { try { SD.driveSeat(G, ctx); } catch (e) { if (m) m.seatDriveErr = String(e && e.message || e).slice(0, 160); } }
    } catch (e) {}
    return drainBase.daily(G, ctx);
  };
  const policy = Object.assign({}, SD.belongseat, {
    id: 'belongseat-' + ARM_TAG,
    desc: 'belongseat + titan driver with stand-down hook + r26 door-forcing probe, ' + ARM_TAG,
    daily: myDaily,
  });
  const { Game } = await loadGame({ seed, mode: 'endgame-r26-' + ARM_TAG });
  await setupGame(Game);
  const m = { ctx: null, seed };
  attachTranscript(Game, m);
  attachTable(Game, m);
  attachCoal(Game, m);
  const ctx = { _r26m: m };
  let harnessCtx = null;
  const wrappedDaily = policy.daily;
  policy.daily = (G, c2) => {
    c2._r26m = m;
    harnessCtx = c2;
    const d = day(G);
    try {
      if (m.tab.announceDay == null) {
        const pv = G.tablePreview ? G.tablePreview() : null;
        if (pv) {
          m.tab.announceDay = d;
          m.seatAtAnnounce = seatSnapshot(G);
        }
      }
      const tier = (() => { try { return G.overtimeTier ? G.overtimeTier() : 0; } catch (e) { return 0; }; })();
      if (d % 5 === 0 || tier > (m.tab.tierHist.length ? m.tab.tierHist[m.tab.tierHist.length - 1].tier : -1)) {
        m.tab.tierHist.push({ day: d, tier });
      }
    } catch (e) {}
    return wrappedDaily(G, c2);
  };
  const res = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  m.seatAtEnd = seatSnapshot(Game);
  // convo probe on a run alive past d130
  let convos = [];
  try {
    const alive = (Game.state.village.roster || []).filter(id => !(Game.getPerson(id) || {}).dead);
    if (day(Game) >= 130 && alive.length > 1) {
      const other = alive.find(id => id !== Game.villagerId) || alive[0];
      convos = runConversation(Game, other, 130);
    }
  } catch (e) { convos = ['(convo probe failed: ' + String(e && e.message || e).slice(0, 120) + ')']; }
  const k = (harnessCtx && harnessCtx._r26k) || {};
  const out = {
    seed, days: res.days, over: !!Game.over, won: !!Game.won,
    endDay: day(Game), forceDoor: FORCEDOOR,
    table: {
      announceDay: m.tab.announceDay, sitDay: m.tab.sitDay, wonTele: m.tab.wonTele,
      tierHist: m.tab.tierHist, doorPicks: m.tab.doorPicks, doorEntries: m.tab.doorEntries,
      failEvents: m.tab.failEvents, sceneFires: m.tab.sceneFires,
      beatVisits: m.tab.beatVisits,
    },
    seatAtAnnounce: m.seatAtAnnounce || null,
    seatAtEnd: m.seatAtEnd || null,
    titans: k, sdEvents: m.sdEvents || [], titanErr: m.titanErr, seatDriveErr: m.seatDriveErr,
    coalErr: m.coalErr,
    coal: (function(){ const c = Object.assign({}, m.coal || {}); delete c._censusDays; return c; })(),
    census: census(Game),
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r26-${ARM_TAG}-s${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r26-${ARM_TAG}-s${seed}.txt`), (m.trans.say || []).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r26-${ARM_TAG}-s${seed}-frames.json`), JSON.stringify(m.tab.frames, null, 1));
  if (convos.length) fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r26-${ARM_TAG}-convos-s${seed}.txt`), convos.join('\n'));
  return out;
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`--- r26 ${ARM_TAG} seed ${seed} ---`);
    try {
      const out = await runOne(seed);
      results.push({ seed, ok: true, out });
      const picks = (out.table.doorPicks || []).map(p => (p.forced ? 'F:' : '') + p.want).join('>');
      const entries = (out.table.doorEntries || []).map(e => e.path + '/' + (e.branch || '-')).join('>');
      const won = out.table.wonTele && out.table.wonTele.data;
      console.log(`seed ${seed}: days=${out.endDay} won=${out.won} picks=${picks} entries=${entries} wonPath=${won ? (won.tablePath || won.path) + '/' + won.moral + '/' + won.endingKind : 'n/a'} fails=${(out.table.failEvents || []).length}`);
    } catch (e) {
      results.push({ seed, ok: false, err: String(e && e.stack || e).slice(0, 500) });
      console.log(`seed ${seed}: FATAL ${String(e && e.message || e).slice(0, 200)}`);
    }
  }
  fs.writeFileSync(path.join(EVIDIR, 'journey-endgame-r26-' + ARM_TAG + '-summary.json'),
    JSON.stringify(results.map(r => ({ seed: r.seed, ok: r.ok, err: r.err,
      days: r.out && r.out.endDay, won: r.out && r.out.won,
      picks: r.out && (r.out.table.doorPicks || []).map(p => (p.forced ? 'F:' : '') + p.want),
      entries: r.out && (r.out.table.doorEntries || []).map(e => e.path + '/' + (e.branch || '-')),
      wonTele: r.out && r.out.table.wonTele })), null, 1));
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
