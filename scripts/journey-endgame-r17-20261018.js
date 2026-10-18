#!/usr/bin/env node
// journey-endgame-r17-20261018.js — ENDGAME leg (leg 4), 2026-10-18 playtest loop r17.
// PRE-REGISTERED (MEASUREMENT.md §§9-12, 14 — written before the pilot ran;
// see evidence/2026-10-18/journey-endgame-r17.md):
//
// Leg question: r16's 8 runs ALL took feared/light. TABLE.md law 2 says all 7
//   paths are "equally tempting, all engaging to play... a different game,"
//   law 6 says light/dark branches are "earned through play, never a menu
//   choice." Does the table OFFER a spread across varied policy flavors —
//   or does every run collapse to feared/light? Do offered paths resolve via
//   played challenges?
//
// Arms (identical belongseat base; flavor layers + door picks differ):
//   CONTROL   = r16's stack as-is; door pick options[0] (feared) — pins baseline.
//   DARK      = + steal only when hungry (pilot: scheduled theft triggered a
//               moot cascade, village died d68), never donate, relay dark
//               verbs (claim when available; reroute 'efficient' — lean −2;
//               deepen — grounding erosion). Door: RELAY first (its branch
//               resolves on the leaning meter — the earned-dark experiment);
//               feared fallback (pilot showed feared-dark is tyrant-gated:
//               killed/betrayed count villager harm, unreachable competently).
//   COMMUNITY = + share surplus (donateToPantry over cap), facilitate (appoint
//               a competent villager to the relay, not the Bearer). Door:
//               BELOVED first (variety finale = the most distinct played
//               challenge), fallback witness/assimilated/defiant/relay/feared.
//
// Binding metrics:
//   M1 reach:  >=3/4 seeds invited per arm.
//   M2 spread: >=2 distinct paths offered or taken across the seed×flavor matrix.
//   M3 played: every firing challenge resolves via played mechanics;
//              single-outcome-roll resolution = FAIL LOUDLY (canon violation).
//   M4 people: >=2 transcripts sense-read (offer, sit, finals), 0 senseless flags.
//   M5 census: post-table census real on all arms; no crash/softlock.
//
// Interesting-finding bar: a non-feared path offered AND completable as a
//   played challenge; OR a path unfireable/unreachable (blank); OR total
//   collapse to feared/light with the offer surface never showing the other 6.
//
// Seeds: 8951-8954 (fresh; r16 used 8931-8934). Pilot: 8951 × control,dark.
// Horizon: DAYCAP=210, death-aware (+10d tail).
// Policy: belongseat stack (TRIBFLOOR=1 + WINDEFER=1 + FEASTSCALE_R13=1 +
//   BELONG_V3=1); flavor layers recompose it exactly as r16 did.
// SEATDRIVE default-ON applies to all arms (r16 control semantics).
//
// TOOLING ONLY — no game balance changes. Policy behaves as pinned.
'use strict';
// Env BEFORE any require: belongseek reads BELONG_V3 at module load;
// feastscale gates its feast/devotion layer on FEASTSCALE_R13.
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.BELONG_V3 = '1';
// SEATDRIVE unset = default-ON (all arms drive the seat).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-18');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [8951, 8952, 8953, 8954]).filter(Number.isFinite);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',') : ['control', 'dark', 'community']);
const DAYS = parseInt(process.env.DAYS || '210', 10);

// Door preference orders. [] = options[0] (r16 semantics — control pins it).
const DOORS = {
  control: [],
  // dark: relay first — the relay branch resolves on the leaning meter and
  // the dark flavor pushes it negative (earned dark through play); feared
  // second (pilot showed feared-dark is tyrant-gated: killed/betrayed are
  // villager-harm counters a competent run never moves — see run note).
  dark: ['relay', 'feared', 'defiant', 'assimilated', 'beloved', 'witness', 'indispensable'],
  community: ['beloved', 'witness', 'assimilated', 'defiant', 'relay', 'feared', 'indispensable'],
};

const { loadGame, setupGame, runDays } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---- transcript capture (same as r16) ----
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
function snapshotFrame(G, m) {
  try {
    const s = G.state.scholar || {};
    const tc = s.tableChoices;
    if (!tc || !tc.options || !tc.options.length) return;
    const sig = (tc.frame || '') + '|' + tc.options.map(o => o.id).join(',');
    if (sig === m.trans.lastFrameSig) return;
    m.trans.lastFrameSig = sig;
    m.trans.frames.push({
      day: day(G), frame: tc.frame || '',
      prompt: stripHtml(tc.prompt || '').slice(0, 1200),
      options: tc.options.map(o => `${o.id} :: ${stripHtml(o.label || '').slice(0, 160)}`),
    });
  } catch (e) {}
}

// ---- flavor layers (policy-side only) ----
// DARK: steal only when hungry (pilot: the day%5 schedule triggered a moot
// cascade and the village died d68 — too hot), never donate surplus,
// relay dark verbs (claim; reroute 'efficient'; deepen).
function darkDaily(G, ctx) {
  try {
    const s = G.state.scholar || {};
    const d = s.day || 0;
    const cap = G.kcalCap ? G.kcalCap() : 2000;
    const hungry = (s.kcal || 0) < cap * 0.5;
    if (hungry && G.stealFrom) {
      const me = G.villagerId;
      let mark = null;
      try {
        for (const id of (G.state.village.roster || [])) {
          if (id === me) continue;
          const p = G.getPerson ? G.getPerson(id) : null;
          if (p && !p.dead) { mark = id; break; }
        }
      } catch (e) {}
      if (mark) { try { const r = G.stealFrom(mark); if (r) ctx.darkThefts = (ctx.darkThefts | 0) + 1; } catch (e) {} }
    }
    try {
      const held = G.relayHeldByBearer ? G.relayHeldByBearer() : false;
      if (!held && G.claimRelay) {
        let roster = 0;
        try { roster = (G.state.village.roster || []).filter(id => !(G.getPerson(id) || {}).dead).length; } catch (e) {}
        const pk = G.pantryKcal ? G.pantryKcal() : 0;
        if (pk > 30000 && roster >= 6) { try { if (G.claimRelay() === 'claimed') ctx.darkRelayClaimed = 1; } catch (e) {} }
      } else if (held) {
        if (d % 2 === 0 && G.relayReroute) {
          try { G.relayReroute('efficient'); ctx.darkReroutes = (ctx.darkReroutes | 0) + 1; } catch (e) {}
        }
        let stage = 0;
        try { stage = G.integrationStage ? G.integrationStage() : 0; } catch (e) {}
        if (d % 5 === 0 && stage >= 1 && G.relayDeepen) {
          try { G.relayDeepen(); ctx.darkDeepens = (ctx.darkDeepens | 0) + 1; } catch (e) {}
        }
      }
    } catch (e) {}
  } catch (e) {}
}
// COMMUNITY: share surplus, facilitate (hand the relay to a competent
// villager — never the Bearer), comfort is in the convo driver.
function shareSurplus(G, ctx) {
  try {
    const s = G.state.scholar || {};
    const cap = G.kcalCap ? G.kcalCap() : 2000;
    if ((s.kcal || 0) <= cap * 1.0) return;
    const inv = s.inventory || [];
    for (let i = inv.length - 1; i >= 0; i--) {
      const it = inv[i];
      if ((it.kcalEach || 0) > 0 && it.foodState !== 'raw' && G.donateToPantry) {
        try { G.donateToPantry(i); ctx.commShared = (ctx.commShared | 0) + 1; break; } catch (e) {}
      }
    }
  } catch (e) {}
}
function communityDaily(G, ctx) {
  shareSurplus(G, ctx);
  try {
    const hasSw = G.switchboard ? G.switchboard() : null;
    const avail = G.switchboardAvailable ? G.switchboardAvailable() : false;
    if (avail && !hasSw && G.appointSwitchboard) {
      const me = G.villagerId;
      let cand = null;
      try {
        for (const id of (G.state.village.roster || [])) {
          if (id === me) continue;
          const p = G.getPerson ? G.getPerson(id) : null;
          if (p && !p.dead) { cand = id; break; }
        }
      } catch (e) {}
      if (cand) { try { if (G.appointSwitchboard(cand)) ctx.commRelayAppointed = 1; } catch (e) {} }
    }
  } catch (e) {}
}

// ---- table ladder / seat instrument (r16 + door-steer + branch/ledger capture) ----
function ledgerSnapshot(G) {
  const out = {};
  try {
    const L = G.ledger ? G.ledger() : {};
    for (const k of ['killed', 'protected', 'betrayed', 'foodShared', 'foodHoarded', 'might',
      'brokerage', 'showmanship', 'exposed', 'embrace', 'defiance', 'unified', 'fractured',
      'contestsSurvived', 'waveDeeds']) out[k] = (L[k] | 0);
  } catch (e) {}
  try { out.relayLean = G.relayLean ? G.relayLean() : null; } catch (e) {}
  try { out.grounding = G.grounding ? G.grounding() : null; } catch (e) {}
  try { out.groundingTier = G.groundingTier ? G.groundingTier() : null; } catch (e) {}
  try { out.switchTally = G.tableSwitchTally ? G.tableSwitchTally() : null; } catch (e) {}
  try { out.promiseTally = G.tablePromiseTally ? G.tablePromiseTally() : null; } catch (e) {}
  return out;
}
function attachTable(G, m, doorOrder) {
  m.doorOrder = doorOrder || [];
  const t = m.table = {
    ladder: [], sceneFires: [], doors: [], downgrades: [], failEvents: [],
    failSteer: [], beats: 0, finals: 0,
    seatTakes: [], won: 0, wonDetail: null, teleTable: [],
    announceCount: 0, announceDay: null, atAnnounce: null, atSit: null,
    ledgerAtSit: null, tierTicks: [], doorPicks: [], doorEntries: [],
    challengeBeats: [],
  };
  const otele = G.tele;
  if (typeof otele === 'function') {
    G.tele = function (ev, data) {
      try {
        if (String(ev).indexOf('table') === 0 || ev === 'overtime_tier') {
          t.teleTable.push({ day: day(G), ev, data: JSON.parse(JSON.stringify(data || {})) });
          if (ev === 'table_won') { t.won = 1; t.wonDetail = data; }
          if (ev === 'overtime_tier') t.tierTicks.push({ day: day(G), tier: (data || {}).tier });
        }
      } catch (e) {}
      return otele.call(this, ev, data);
    };
  }
  // DOOR STEER: at the 7-door offer (phase 'paths', every option a 'path:'),
  // pick the flavor's preferred door instead of options[0]. Every other
  // modal passes through untouched — never re-picks, never stalls.
  const origChoose = G.chooseTableOption;
  if (typeof origChoose === 'function') {
    G.chooseTableOption = function (id) {
      try {
        if (m.doorOrder && m.doorOrder.length) {
          const T = (G.tableState ? G.tableState() : {}) || {};
          const tc = (G.state.scholar || {}).tableChoices;
          const opts = (tc && tc.options) || [];
          if ((T.phase || '') === 'paths' && !T.path && opts.length &&
              opts.every(o => String((o && o.id) || '').indexOf('path:') === 0)) {
            const have = new Set(opts.map(o => String(o.id).slice(5)));
            const want = m.doorOrder.find(p => have.has(p));
            if (want) {
              t.doorPicks.push({ day: day(G), want, offer: opts.map(o => String(o.id).slice(5)) });
              id = 'path:' + want;
            }
          }
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
        t.doorEntries.push({
          day: day(G), path: T.path || pid2 || null, branch: T.branch || null,
          band: T.band || null, notes: ((T.branchNotes || []).slice(0, 14)),
        });
      } catch (e) {}
      return r;
    };
  }
  const origScene = G.tableScene;
  if (typeof origScene === 'function') {
    G.tableScene = function () {
      try {
        t.sceneFires.push({ day: day(G) });
        // roster + seat + ledger snapshot AT SIT TIME (pre-scene).
        if (t.rosterAtSit == null) {
          t.rosterAtSit = rosterIds(G); t.atSit = seatSnapshot(G);
          t.ledgerAtSit = ledgerSnapshot(G); t.sitSceneDay = day(G);
        }
      } catch (e) {}
      return origScene.apply(this, arguments);
    };
  }
  const origFail = G.tableFail;
  if (typeof origFail === 'function') {
    G.tableFail = function (reason) {
      try {
        const T = (G.tableState ? G.tableState() : {}) || {};
        t.failEvents.push({ day: day(G), path: T.path || '?', reason: String(reason).slice(0, 300) });
      } catch (e) {}
      return origFail.apply(this, arguments);
    };
  }
  const origPrompt = G.tablePrompt;
  if (typeof origPrompt === 'function') {
    G.tablePrompt = function (html, options, frame) {
      try {
        t.frames = t.frames || [];
        const T = (G.tableState ? G.tableState() : {}) || {};
        t.frames.push({
          day: day(G), frame: frame || '', phase: T.phase || '',
          path: T.path || null,
          prompt: stripHtml(html || '').slice(0, 1500),
          options: (options || []).map(o => `${o.id} :: ${stripHtml(o.label || '').slice(0, 160)}`),
        });
        if (T.phase === 'challenge' && T.path) {
          t.challengeBeats.push({ day: day(G), path: T.path, beat: T.beat, frame: frame || '' });
        }
      } catch (e) {}
      return origPrompt.apply(this, arguments);
    };
  }
  return t;
}
function seatSnapshot(G) {
  const s = { day: day(G), seat: 'none', doors: {}, standingCost: 0, overtimeTier: 0 };
  try { s.overtimeTier = (typeof G.overtimeTier === 'function') ? G.overtimeTier() : 0; } catch (e) {}
  try {
    const pv = G.tablePreview ? G.tablePreview() : null;
    if (pv) { s.standingCost = pv.standingCost | 0; }
  } catch (e) {}
  try {
    const se = G.tableSeat ? G.tableSeat() : null;
    if (se) s.seat = se.seat || 'none';
  } catch (e) {}
  try {
    for (const p of (G.tableEarnedPaths() || [])) {
      if (p) s.doors[p.id] = { earned: !!p.earned, strength: p.strength | 0, why: (p.why || '').slice(0, 120) };
    }
  } catch (e) {}
  return s;
}
function rosterIds(G) {
  try {
    const r = G.state.village.roster || [];
    const out = [];
    for (const id of r) { try { out.push({ id, dead: !!(G.getPerson(id) || {}).dead }); } catch (e) {} }
    return out;
  } catch (e) { return []; }
}
function tableSummary(G) {
  const out = { phase: null, path: null, branch: null, doors: [], weakened: 0, ascensions: [], facilitated: null };
  try {
    const pg = (G.progState && G.progState()) || {};
    const T = pg.table || {};
    out.phase = T.phase || null; out.path = T.path || null; out.branch = T.branch || T.band || null;
    out.doors = (T.doors || []).slice(); out.weakened = T.weakened | 0;
  } catch (e) {}
  try {
    const asc = (typeof G.tableAscended === 'function') ? G.tableAscended() : [];
    out.ascensions = asc.map(a => ({ name: a.name || a.id, score: a.score | 0, facilitated: !!a.facilitated }));
  } catch (e) {}
  try {
    const pg = (G.progState && G.progState()) || {};
    out.facilitated = (pg.table && pg.table.facilitated) || null;
  } catch (e) {}
  return out;
}

// ---- conversation driver (r16 fresh-first driver, PINNED — see r16 note) ----
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

async function runOne(seed, arm) {
  const pid = 'belongseat-flavors-r17';
  const doorOrder = DOORS[arm] || [];
  const TF = require('./policies/tribfloor');
  const drainBase = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer',
    'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const flavorDaily = arm === 'dark' ? darkDaily : arm === 'community' ? communityDaily : null;
  const myDaily = (G, ctx) => {
    const m = ctx._r17m;
    try { SD.driveSeat(G, ctx); }
    catch (e) { if (m) m.table.seatDriveErr = String(e && e.message || e).slice(0, 160); }
    if (flavorDaily) { try { flavorDaily(G, ctx); } catch (e) { if (m) m.table.flavorErr = String(e && e.message || e).slice(0, 160); } }
    return drainBase.daily(G, ctx);
  };
  // Object.assign copies setup/upkeep/fight/contest from the landed stack —
  // only daily is overridden (r14 fix: a bare {id,desc,daily} dropped the
  // fight/upkeep verbs and all four villages died).
  const policy = Object.assign({}, SD.belongseat, {
    id: pid + '-' + arm,
    desc: 'belongseat recomposed (driveSeat + flavor + windefer drain), arm=' + arm +
      (doorOrder.length ? ' door order ' + doorOrder.join('>') : ' (options[0] door, r16)'),
    daily: myDaily,
  });
  const { Game } = await loadGame({ seed, mode: 'endgame-r17-' + pid + '-' + arm });
  await setupGame(Game);
  const m = { ctx: null };
  attachTranscript(Game, m);
  attachTable(Game, m, doorOrder);
  const ctx = { _r17m: m };
  let harnessCtx = null; // runDays passes its own ctx to policy.daily — the
  // real counters live there, not on this object.
  const rungHistory = [];
  const wrappedDaily = policy.daily;
  policy.daily = (G, c2) => {
    c2._r17m = m;
    harnessCtx = c2;
    const d = day(G);
    try {
      const pg = (G.progState && G.progState()) || {};
      if (pg.tableWaiting && !m.table.waitingEver) { m.table.waitingEver = true; m.table.waitingDay = d; }
      if (pg.table && pg.table.phase === 'done' && m.table.doneDay == null) m.table.doneDay = d;
      snapshotFrame(G, m);
      // ANNOUNCEMENT: first day a table preview exists = invited.
      if (m.table.announceDay == null) {
        try {
          const pv = G.tablePreview ? G.tablePreview() : null;
          if (pv) { m.table.announceDay = d; m.table.atAnnounce = seatSnapshot(G); }
        } catch (e) {}
      }
    } catch (e) {}
    if (d % 10 === 0 || (d >= 80 && d % 5 === 0)) {
      const s = seatSnapshot(G);
      m.table.ladder.push({ day: s.day, seat: s.seat, w1: 0, w2: 0, w3: 0 });
      if (s.seat !== 'none') rungHistory.push({ day: d, seat: s.seat, tier: s.overtimeTier, doors: Object.keys(s.doors).filter(k => s.doors[k].earned).join(',') });
    }
    // PEOPLE CHECK at day 80 (pre-table): two full villager conversations.
    if (d === 80 && !m.convosDone) {
      m.convosDone = true;
      m.convos = probeConvos(Game, 80, 2);
    }
    // One conversation at day 130 (table-era, pre- or post-sit): the village
    // talking about the table.
    if (d === 130 && !m.convos130Done) {
      m.convos130Done = true;
      m.convos130 = probeConvos(Game, 130, 1);
    }
    return wrappedDaily(G, c2);
  };
  function probeConvos(G, dayNum, n) {
    try {
      const living = (G.state.village.roster || []).filter(id => { try { return !(G.getPerson(id) || {}).dead; } catch (e) { return false; } });
      const scholarId = G.villagerId;
      const others = living.filter(id => id !== scholarId).slice(0, n);
      const out = [];
      for (const vid of others) out.push(runConversation(G, vid, dayNum));
      return out;
    } catch (e) { return [['(people check failed: ' + String(e && e.message || e).slice(0, 160) + ')']]; }
  }
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  const hc = harnessCtx || {};
  const convos = m.convos || [['(people check never ran — run ended before day 80)']];
  const tsum = tableSummary(Game);
  const order = { none: 0, lesser: 1, full: 2 };
  let best = 'none';
  for (const s of m.table.ladder) if ((order[s.seat] || 0) > (order[best] || 0)) best = s.seat;
  const de = m.table.doorEntries[0] || {};
  const out = {
    label: 'journey-endgame-r17', policy: pid, seed, arm,
    days: result.days, endReason: result.endReason,
    seatBest: best, sceneFired: m.table.sceneFires.length, sceneFireDays: m.table.sceneFires.map(x => x.day),
    announceDay: m.table.announceDay, sitDay: m.table.sitSceneDay || null,
    rosterAtSitN: (m.table.rosterAtSit || []).length,
    atSit: m.table.atSit, ledgerAtSit: m.table.ledgerAtSit,
    doorPicks: m.table.doorPicks, doorEntries: m.table.doorEntries,
    doorPath: de.path || null, doorBranch: de.branch || de.band || null, doorNotes: de.notes || [],
    challengeBeats: m.table.challengeBeats.length,
    challengeBeatLog: m.table.challengeBeats,
    doneDay: m.table.doneDay != null ? m.table.doneDay : null,
    doors: m.table.doors, downgrades: m.table.downgrades,
    failEvents: m.table.failEvents, failSteer: m.table.failSteer,
    driverErr: m.table.driverErr || null, seatDriveErr: m.table.seatDriveErr || null,
    flavorErr: m.table.flavorErr || null,
    sdSeatAttempts: hc.sdSeatAttempts | 0, sdSeatTaken: hc.sdSeatTaken | 0, sdSeatDay: hc.sdSeatDay || null,
    darkThefts: hc.darkThefts | 0, darkReroutes: hc.darkReroutes | 0, darkDeepens: hc.darkDeepens | 0,
    darkRelayClaimed: hc.darkRelayClaimed | 0,
    commShared: hc.commShared | 0, commRelayAppointed: hc.commRelayAppointed | 0,
    won: m.table.won, wonDetail: m.table.wonDetail,
    table: tsum,
    teleTable: m.table.teleTable,
    rungHistory, ladder: m.table.ladder.filter((_, i) => i % 2 === 0),
    census: census(Game),
    deaths: (result.samples && result.samples.deaths) || [],
    ms: result.ms,
  };
  // announceDay: the r16 instrument tracked it via the wait gate; here the
  // first rungHistory/ladder entry with seat !== 'none' approximates it.
  try {
    const first = rungHistory.find(r => r.seat && r.seat !== 'none');
    if (first) out.announceDayApprox = first.day;
  } catch (e) {}
  const fp = path.join(EVIDIR, `journey-endgame-r17-${arm}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  const tx = [];
  tx.push(`# journey-endgame-r17 table transcript — seed ${seed} (${arm})`);
  tx.push(`days=${out.days} end=${out.endReason} seat=${out.seatBest} ann≈${out.announceDayApprox != null ? 'd' + out.announceDayApprox : '—'} sit=${out.sitDay != null ? 'd' + out.sitDay : '—'} door=${out.doorPath || '—'}/${out.doorBranch || '—'} done=${out.doneDay != null ? 'd' + out.doneDay : '—'} won=${out.won} finalpath=${tsum.path || '—'}/${tsum.branch || '—'} weakened=${tsum.weakened} asc=${tsum.ascensions.length}`);
  tx.push(`branch notes: ${JSON.stringify(out.doorNotes)}`);
  tx.push(`ledger@sit: ${JSON.stringify(out.ledgerAtSit)}`);
  tx.push(`flavor counters: thefts=${out.darkThefts} reroutes=${out.darkReroutes} deepens=${out.darkDeepens} relayClaimed=${out.darkRelayClaimed} shared=${out.commShared} relayAppointed=${out.commRelayAppointed}`);
  tx.push('');
  tx.push('## frames (audit / door offer / beats / finals / epilogue prompts)');
  for (const f of (m.table.frames || [])) {
    tx.push(`--- d${f.day} [${f.frame}] phase=${f.phase} path=${f.path || '—'} ---`);
    tx.push(f.prompt);
    for (const o of f.options) tx.push(`  > ${o}`);
    tx.push('');
  }
  tx.push('## table say/sysSay lines');
  tx.push(m.trans.say.join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r17-transcript-${arm}-s${seed}.txt`), tx.join('\n'));
  const cx = [`# journey-endgame-r17 conversations — seed ${seed} (${arm})`, ''];
  for (const c of convos) { cx.push(c.join('\n')); cx.push(''); }
  if (m.convos130) { cx.push(`# — day-130 conversations (table-era) —`); for (const c of m.convos130) { cx.push(c.join('\n')); cx.push(''); } }
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r17-convos-${arm}-s${seed}.txt`), cx.join('\n'));
  const pop = out.census.filter(c => c.alive).length;
  console.log(`[s${seed}/${arm}] d=${out.days} ${out.endReason} seat=${out.seatBest} sit=${out.sitDay != null ? 'd' + out.sitDay : '—'} door=${out.doorPath || '—'}/${out.doorBranch || '—'} beats=${out.challengeBeats} done=${out.doneDay != null ? 'd' + out.doneDay : '—'} won=${out.won} weak=${tsum.weakened} pop=${pop}/${out.census.length} thefts=${out.darkThefts} reroutes=${out.darkReroutes} deepens=${out.darkDeepens} shared=${out.commShared} ms=${out.ms}`);
  return out;
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    for (const arm of ARMS) {
      try { rows.push(await runOne(seed, arm)); }
      catch (e) { console.log(`[s${seed}/${arm}] FATAL: ` + (e && e.stack || e)); rows.push({ seed, arm, fatal: String(e && e.message || e) }); }
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + (fn(r) || 0), 0);
  const invited = (arm) => agg(r => (r.arm === arm && (r.announceDay != null || r.sitDay != null || (r.sceneFireDays || []).length)) ? 1 : 0);
  const seated = (arm) => agg(r => (r.arm === arm && r.sitDay != null) ? 1 : 0);
  const pairs = SEEDS.length;
  console.log(`\n=== journey-endgame-r17 PILOT === seeds=[${SEEDS.join(',')}] arms=[${ARMS.join(',')}] days=${DAYS}`);
  console.log(`invited control ${invited('control')}/${pairs} dark ${invited('dark')}/${pairs} community ${invited('community')}/${pairs}`);
  console.log(`seated control ${seated('control')}/${pairs} dark ${seated('dark')}/${pairs} community ${seated('community')}/${pairs}`);
  for (const arm of ARMS) {
    console.log(`[${arm}] invited ${invited(arm)}/${pairs} won ${agg(r => (r.arm === arm && r.won) ? 1 : 0)}/${pairs} paths ${rows.filter(r => r.arm === arm).map(r => (r.doorPath || '—') + '/' + (r.doorBranch || '—')).join(', ')}`);
  }
  const paths = new Set(rows.filter(r => r.doorPath).map(r => r.doorPath));
  const branches = new Set(rows.filter(r => r.doorBranch).map(r => r.doorBranch));
  console.log(`M1 reach (>=3/4 seeds invited per arm): ${ARMS.every(a => invited(a) >= 3) ? 'GO' : 'NO-GO (pilot)'}`);
  console.log(`M2 spread (>=2 distinct paths): ${paths.size >= 2 ? 'GO [' + [...paths].join(',') + ']' : 'NO-GO (pilot): ' + [...paths].join(',')}`);
  console.log(`branches seen: ${[...branches].join(',')}`);
  console.log(`M5 no-crash: ${!agg(r => r.fatal ? 1 : 0) ? 'GO' : 'NO-GO'}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
