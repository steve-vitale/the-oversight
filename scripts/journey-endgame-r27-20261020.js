#!/usr/bin/env node
// journey-endgame-r27-20261020.js — LANE B leg 4 (endgame), run 27.
//
// Leg question (pre-registered): RELAY/DARK COMPLETION — "become its voice".
// The dark band of the flagship path has NEVER completed in sims: r17's dark
// arm reached lean -82 via 42 efficient reroutes + 10 deepens, then failed on
// the designed quarantine machinery (3 backfires from the deepens' 25% roll,
// grounding hollow from -1/day holding + -3/deepen). r26 forced every lesser
// door and won 10/10 — but relay landed GREY x2 ("the seatdriver's ledger
// shape sits in the leaning-meter middle"); dark was not attempted. TABLE.md
// describes the dark merge as a real ending ("become its voice... Power
// immense. Self eroded. The System finally says your name right."). This run
// tests whether a CAREFUL dark playbook can complete it, or whether the dark
// band is a designed failure funnel (completable in prose, uncompletable in
// numbers).
//
// THE CAREFUL-DARK PLAYBOOK (all honest player verbs, no cheats):
//   pre-table: claim the relay office (~day 55-65, needs linked village +
//     roster >= 6 + pantry > 25000), then relayReroute('efficient') DAILY
//     until lean <= -44 (margin past the -40 dark threshold). NO deepens
//     (25% backfire, -3 grounding), NO probes (50% backfire), NO communes
//     (scene lean drift). Holding costs -1 grounding/day -> ~-25 over the
//     playbook, landing ~75 (GROUNDED/FRAYING, nowhere near hollow).
//   table: PATHFORCE=relay (prereq: stage>=2 + office held, or stage 3).
//   cockpit (4 beats): 'beat:efficient' x4 -> merge 8, lean -8 more, zero
//     backfire risk, zero grounding cost. mergeCheck passes every beat.
//   conscript: ACCEPT (conscript:yes) — the dark playbook takes the army;
//     the consequence is recorded, not dodged.
//   finals (dark): 'final:voice' — become its voice.
// Interesting-finding bar: the first completed relay/dark merge in sims —
// or the exact quarantine that fires, on exact numbers (which of the two
// failure modes, at what lean/grounding/backfires).
//
// Binding metrics (a miss is NO-GO, never re-scored mid-run):
//   M1 setup GO: >=2/4 pilot seeds reach the table with lean <= -40 AND
//     grounding >= 50 at door entry (the dark-completion setup stages).
//   M2 complete GO: >=1 seed completes relay/dark (dark final chosen,
//     table_won fires with moral 'dark').
//   M3 people GO: >=2 relay beats sense-read (cockpit beats + dark final),
//     0 senseless flags.
//   M4 census GO: all runs end cleanly (win / honest loss); no crash/softlock.
//   M5 guardrail GO: table announce ~d90, seat shape consistent with
//     r19-r26 (no instrument perturbation).
//
// Seeds: fresh 9051-9054. PILOT: seed 9051 first; expand iff M1 shows life
// (the setup staging on >=1 seed).
// Horizon: DAYCAP=260, death-aware (+10d tail max).
// Stack: r26's proven seat-driver tip (TRIBFLOOR=1 WINDEFER=1 FEASTSCALE_R13=1
// BELONG_V3=1, set BEFORE any require — r18's lesson). No PATHFORCE env,
// no HEROIC, no party steering — the darkmerge flavor is this script.
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.BELONG_V3 = '1';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-20');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9051, 9052, 9053, 9054]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '260', 10);
const ARM_TAG = 'r27-darkmerge';
const LEAN_TARGET = -44;      // margin past the -40 dark threshold
const CLAIM_DAY = 55;         // earliest claim day
const CLAIM_PANTRY = 25000;   // don't cripple the village taking the office
const CLAIM_ROSTER = 6;

const { loadGame, setupGame, runDays } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const TF = require('./policies/tribfloor');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim();
}
function relaySnap(G) {
  const o = {};
  try { o.lean = G.relayLean ? G.relayLean() : null; } catch (e) { o.lean = 'err'; }
  try { o.grounding = G.grounding ? G.grounding() : null; } catch (e) { o.grounding = 'err'; }
  try { o.tier = G.groundingTier ? G.groundingTier() : null; } catch (e) { o.tier = 'err'; }
  try { o.bond = G.sysBond ? G.sysBond() : null; } catch (e) { o.bond = 'err'; }
  try { o.backfires = (((G.state.scholar || {}).relay) || {}).backfires | 0; } catch (e) { o.backfires = 'err'; }
  try { o.held = G.relayHeldByBearer ? !!G.relayHeldByBearer() : null; } catch (e) { o.held = 'err'; }
  try { o.stage = G.integrationStage ? G.integrationStage() : null; } catch (e) { o.stage = 'err'; }
  try { const T = G.tableState ? G.tableState() : {}; o.merge = (T.meters || {}).merge | 0; o.branch = T.branch || T.band || null; } catch (e) {}
  return o;
}

// ---- transcript capture (r18/r19/r24 pattern) ----
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

// ---- table instrument + darkmerge steering (r22/r23/r24/r26 pattern) ----
function attachTable(G, m) {
  const t = m.tab = {
    doorPicks: [], doorEntries: [], sceneFires: [], failEvents: [], frames: [],
    announceDay: null, sitDay: null, wonTele: null, tierHist: [],
    beats: [], conscripts: [], finalsPicks: [],
  };
  try {
    const otele = G.tele;
    G.tele = function (ev, data) {
      try {
        if (ev === 'table_won') t.wonTele = { day: day(G), data: JSON.parse(JSON.stringify(data || {})) };
      } catch (e) {}
      return otele.call(this, ev, data);
    };
  } catch (e) {}
  const origChoose = G.chooseTableOption;
  if (typeof origChoose === 'function') {
    G.chooseTableOption = function (id) {
      let steered = null;
      try {
        const T = (G.tableState ? G.tableState() : {}) || {};
        const opts = (((G.state.scholar || {}).tableChoices) || {}).options || [];
        const ids = opts.map(o => String((o && o.id) || ''));
        const phase = T.phase || '';
        // DOOR STEER: relay if offered, else first offered (recorded).
        if (phase === 'paths' && !T.path && ids.length && ids.every(x => x.indexOf('path:') === 0)) {
          const want = ids.includes('path:relay') ? 'path:relay' : ids[0];
          t.doorPicks.push({ day: day(G), want: want.slice(5), offer: ids.map(x => x.slice(5)),
            relayOffered: ids.includes('path:relay'), pre: relaySnap(G) });
          steered = want; id = want;
        }
        // CONSCRIPT: dark playbook accepts (record the answer).
        else if (phase === 'conscript') {
          const pick = ids.includes('conscript:yes') ? 'conscript:yes' : ids[0];
          t.conscripts.push({ day: day(G), pick, offer: ids, pre: relaySnap(G) });
          steered = pick; id = pick;
        }
        // COCKPIT: efficient x4 — merge+2, lean-2, no backfire, no grounding.
        else if (phase === 'challenge' && T.path === 'relay') {
          const pre = relaySnap(G);
          const pick = ids.includes('beat:efficient') ? 'beat:efficient' : ids[0];
          t.beats.push({ day: day(G), beat: T.beat, pick, offer: ids, pre });
          steered = pick; id = pick;
        }
        // FINALS: voice when dark (the authored dark flagship).
        else if (phase === 'finals' && T.path === 'relay') {
          const pick = ids.includes('final:voice') ? 'final:voice' : ids[0];
          t.finalsPicks.push({ day: day(G), pick, offer: ids, branch: T.branch || T.band || null, pre: relaySnap(G) });
          steered = pick; id = pick;
        }
        // DOWNGRADE: record (a finding if it fires on this playbook).
        else if (phase === 'downgrade') {
          t.failEvents.push({ day: day(G), path: T.path || '?', offer: ids, pre: relaySnap(G) });
        }
      } catch (e) {}
      const r = origChoose.call(this, id);
      try {
        // post-pick snapshot for cockpit beats (did the verb fire clean?)
        const T2 = (G.tableState ? G.tableState() : {}) || {};
        if (steered && String(steered).indexOf('beat:') === 0 && t.beats.length) {
          t.beats[t.beats.length - 1].post = relaySnap(G);
          t.beats[t.beats.length - 1].toPhase = T2.phase || null;
          t.beats[t.beats.length - 1].toBeat = T2.beat == null ? null : T2.beat;
        }
      } catch (e) {}
      return r;
    };
  }
  const origStart = G.tableStartPath;
  if (typeof origStart === 'function') {
    G.tableStartPath = function (pid2) {
      const r = origStart.apply(this, arguments);
      try {
        const T = (G.tableState ? G.tableState() : {}) || {};
        t.doorEntries.push({ day: day(G), path: T.path || pid2 || null,
          branch: T.branch || T.band || null, pre: relaySnap(G) });
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
  try {
    const L = G.ledger ? G.ledger() : {};
    const keys = ['showmanship', 'protected', 'killed', 'might', 'brokerage', 'exposed',
      'embrace', 'defiance', 'betrayed', 'foodShared', 'foodHoarded'];
    out.ledger = {};
    for (const k of keys) out.ledger[k] = (L && L[k]) | 0;
  } catch (e) { out.ledgerErr = String(e && e.message || e).slice(0, 120); }
  return out;
}

// ---- DARKMERGE pre-table playbook (policy-side only) ----
// Claim the relay office, then efficient-reroute daily to lean <= -44.
// No deepens (25% backfire, -3 grounding), no probes (50% backfire),
// no communes (scene lean drift). Holding costs -1 grounding/day.
function darkmergeDaily(G, m) {
  const dm = m.darkmerge;
  try {
    const d = day(G);
    // stop once the table has started (branch resolved at entry)
    try {
      const pg = (G.progState && G.progState()) || {};
      if (pg.table && pg.table.phase && pg.table.phase !== 'done') { dm.tableStarted = true; return; }
    } catch (e) {}
    if (d < CLAIM_DAY) return;
    const held = G.relayHeldByBearer ? G.relayHeldByBearer() : false;
    if (!held) {
      let avail = false;
      try { avail = G.switchboardAvailable ? !!G.switchboardAvailable() : false; } catch (e) {}
      if (!avail) { if (!dm.noNet) { dm.noNet = true; dm.series.push({ day: d, note: 'switchboard unavailable (no linked village)' }); } return; }
      let roster = 0;
      try { roster = (G.state.village.roster || []).filter(id => !(G.getPerson(id) || {}).dead).length; } catch (e) {}
      let pk = 0;
      try { pk = G.pantryKcal ? G.pantryKcal() : 0; } catch (e) {}
      if (roster >= CLAIM_ROSTER && pk > CLAIM_PANTRY && G.claimRelay) {
        try {
          const r = G.claimRelay();
          if (r === 'claimed') { dm.claimDay = d; dm.series.push(Object.assign({ day: d, note: 'relay claimed' }, relaySnap(G))); }
          else if (!dm.claimFail) { dm.claimFail = String(r); dm.series.push({ day: d, note: 'claim failed: ' + dm.claimFail }); }
        } catch (e) { if (!dm.claimErr) { dm.claimErr = String(e && e.message || e).slice(0, 120); } }
      } else if (!dm.waitNote || d - dm.waitNote > 10) {
        dm.waitNote = d;
        dm.series.push({ day: d, note: `waiting to claim (roster ${roster}, pantry ${pk})` });
      }
      return;
    }
    // held: reroute efficient daily until the lean target
    let lean = 0;
    try { lean = G.relayLean ? G.relayLean() : 0; } catch (e) {}
    if (lean > LEAN_TARGET && G.relayReroute) {
      try { G.relayReroute('efficient'); dm.reroutes = (dm.reroutes | 0) + 1; } catch (e) { dm.rerouteErr = String(e && e.message || e).slice(0, 120); }
    } else if (!dm.targetHit) {
      dm.targetHit = d;
      dm.series.push(Object.assign({ day: d, note: `lean target hit (${lean} <= ${LEAN_TARGET})` }, relaySnap(G)));
    }
    if (d % 5 === 0 || (dm.series.length && d - dm.series[dm.series.length - 1].day >= 5)) {
      dm.series.push(Object.assign({ day: d }, relaySnap(G), { reroutes: dm.reroutes | 0 }));
    }
  } catch (e) { dm.err = String(e && e.message || e).slice(0, 160); }
}

// ---- conversation probe (r17/r24 pattern) ----
function pickChoice(list, turn, used) {
  const fresh = (id) => !used.has(id);
  const byIdFresh = (id) => list.find(x => x && x.id === id && fresh(id));
  for (const id of ['dlg:help', 'dlg:commit']) {
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
  const drainBase = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer',
    'belongseat + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const myDaily = (G, ctx) => {
    const m = ctx._r27m;
    try {
      const pv = G.tablePreview ? G.tablePreview() : null;
      if (pv && pv.ready) { try { SD.driveSeat(G, ctx); } catch (e) { if (m) m.seatDriveErr = String(e && e.message || e).slice(0, 160); } }
    } catch (e) {}
    try { darkmergeDaily(G, m); } catch (e) { if (m) m.dmErr = String(e && e.message || e).slice(0, 160); }
    return drainBase.daily(G, ctx);
  };
  const policy = Object.assign({}, SD.belongseat, {
    id: 'belongseat-' + ARM_TAG,
    desc: 'belongseat + r27 careful-dark relay playbook (claim + efficient reroutes to lean -44), ' + ARM_TAG,
    daily: myDaily,
  });
  const { Game } = await loadGame({ seed, mode: 'endgame-r27-' + ARM_TAG });
  await setupGame(Game);
  const m = { ctx: null, seed, darkmerge: { reroutes: 0, series: [] } };
  attachTranscript(Game, m);
  attachTable(Game, m);
  const ctx = { _r27m: m };
  let harnessCtx = null;
  const wrappedDaily = policy.daily;
  policy.daily = (G, c2) => {
    c2._r27m = m;
    harnessCtx = c2;
    const d = day(G);
    try {
      if (m.tab.announceDay == null) {
        const pv = G.tablePreview ? G.tablePreview() : null;
        if (pv) {
          m.tab.announceDay = d;
          m.seatAtAnnounce = seatSnapshot(G);
          m.darkmerge.atAnnounce = relaySnap(G);
        }
      }
      const tier = (() => { try { return G.overtimeTier ? G.overtimeTier() : 0; } catch (e) { return 0; }; })();
      if (d % 5 === 0 || tier > (m.tab.tierHist.length ? m.tab.tierHist[m.tab.tierHist.length - 1].tier : -1)) {
        m.tab.tierHist.push({ day: d, tier });
      }
      // PEOPLE CHECK at day 80 (pre-table): two full villager conversations.
      if (d === 80 && !m.convosDone) {
        m.convosDone = true;
        try {
          const living = (G.state.village.roster || []).filter(id => { try { return !(G.getPerson(id) || {}).dead; } catch (e) { return false; } });
          const others = living.filter(id => id !== G.villagerId).slice(0, 2);
          m.convos = [];
          for (const vid of others) m.convos.push(runConversation(G, vid, 80).join('\n'));
        } catch (e) { m.convos = ['(people check failed: ' + String(e && e.message || e).slice(0, 160) + ')']; }
      }
    } catch (e) {}
    return wrappedDaily(G, c2);
  };
  const res = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  m.seatAtEnd = seatSnapshot(Game);
  m.darkmerge.atEnd = relaySnap(Game);
  const out = {
    seed, days: res.days, over: !!Game.over, won: !!Game.won,
    endDay: day(Game),
    table: {
      announceDay: m.tab.announceDay, sitDay: m.tab.sitDay, wonTele: m.tab.wonTele,
      tierHist: m.tab.tierHist, doorPicks: m.tab.doorPicks, doorEntries: m.tab.doorEntries,
      beats: m.tab.beats, conscripts: m.tab.conscripts, finalsPicks: m.tab.finalsPicks,
      failEvents: m.tab.failEvents,
    },
    seatAtAnnounce: m.seatAtAnnounce || null,
    seatAtEnd: m.seatAtEnd || null,
    darkmerge: m.darkmerge,
    seatDriveErr: m.seatDriveErr || null, dmErr: m.dmErr || null,
    census: census(Game),
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r27-${ARM_TAG}-s${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r27-${ARM_TAG}-s${seed}.txt`), (m.trans.say || []).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r27-${ARM_TAG}-s${seed}-frames.json`), JSON.stringify(m.tab.frames, null, 1));
  if (m.convos && m.convos.length) fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r27-${ARM_TAG}-convos-s${seed}.txt`), m.convos.join('\n\n'));
  return out;
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`--- r27 ${ARM_TAG} seed ${seed} ---`);
    try {
      const out = await runOne(seed);
      results.push({ seed, ok: true, out });
      const de = (out.table.doorEntries && out.table.doorEntries.length) ? out.table.doorEntries[out.table.doorEntries.length - 1] : {};
      const dm = out.darkmerge || {};
      const wt = out.table.wonTele;
      console.log(`seed ${seed}: days=${out.endDay} won=${out.won} door=${de.path || 'n/a'}/${de.branch || '?'} ` +
        `lean@entry=${de.pre ? de.pre.lean : '?'}/@end=${dm.atEnd ? dm.atEnd.lean : '?'} ` +
        `ground@entry=${de.pre ? de.pre.grounding : '?'}/@end=${dm.atEnd ? dm.atEnd.grounding : '?'} ` +
        `backfires=${dm.atEnd ? dm.atEnd.backfires : '?'} reroutes=${dm.reroutes} ` +
        `finals=${(out.table.finalsPicks[0] || {}).pick || 'n/a'} ` +
        `wonTele=${wt ? ('moral=' + (wt.data.moral || '?') + ' path=' + (wt.data.tablePath || '?')) : 'no'}`);
    } catch (e) {
      results.push({ seed, ok: false, err: String(e && e.stack || e).slice(0, 500) });
      console.log(`seed ${seed}: FATAL ${String(e && e.message || e).slice(0, 200)}`);
    }
  }
  fs.writeFileSync(path.join(EVIDIR, 'journey-endgame-r27-' + ARM_TAG + '-summary.json'),
    JSON.stringify(results.map(r => ({ seed: r.seed, ok: r.ok, err: r.err,
      days: r.out && r.out.endDay, won: r.out && r.out.won,
      doorEntries: r.out && r.out.table.doorEntries,
      finalsPicks: r.out && r.out.table.finalsPicks,
      wonTele: r.out && r.out.table.wonTele,
      darkmerge: r.out && { reroutes: r.out.darkmerge.reroutes, claimDay: r.out.darkmerge.claimDay,
        targetHit: r.out.darkmerge.targetHit, atAnnounce: r.out.darkmerge.atAnnounce,
        atEnd: r.out.darkmerge.atEnd, noNet: !!r.out.darkmerge.noNet } })), null, 1));
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
