// journey-endgame-r18-20261018.js — LANE B leg 4 (endgame), run 18.
//
// Leg question (pre-registered): two documented endgame mechanics have NEVER
// completed in sims —
//   (1) the relay GREY-band finals ("both-hands" / "the-contract") — the
//       pragmatist's endings (TABLE.md GRADIENT law). r17's grey-band walks
//       all failed in the cockpit. Can a competent grey-balanced walk
//       complete the merge and play both grey finals to their endings?
//   (2) TRIAL BY COMBAT (feared beat 2) — the single opt-in existential
//       risk. Does the champion fight resolve blow-by-blow? On loss does
//       the mantle pass mid-table and the table continue (no softlock)?
//       On win does terror max?
//
// Arms (identical belongseat stack — TRIBFLOOR=1 + WINDEFER=1 + FEASTSCALE_R13=1 +
// BELONG_V3=1, set as env BEFORE any require):
//   GREY  = control + Bearer claims relay (pk>30000, roster>=6), daily
//           reroute alternating honest(+2)/efficient(-2) to hold lean ~ 0,
//           never deepen/probe pre-table (grounding/backfire protection).
//           Door: relay-first. Cockpit steer: efficient x4 (merge 8, lean -8,
//           zero backfire rolls). Finals steer: 'final:both-hands' on
//           8961/8963, 'final:the-contract' on 8962/8964.
//   TRIAL = control. Door: feared-first. Beat-2 steer: 'trial'.
//           Finals: scorer's pick (expected light 'mercy').
//
// Binding metrics (a miss is NO-GO, never re-scored mid-run):
//   M1 reach GO: >=3/4 seeds reach table announcement per arm.
//   M2 grey  GO: >=1 seed completes a grey final (outcome voiced, won).
//   M3 trial GO: >=1 trial fight resolves blow-by-blow to win or loss;
//                on loss the table continues (no softlock); on win terror
//                maxes (10).
//   M4 people GO: >=2 transcripts sense-read, 0 senseless flags.
//   M5 census GO: post-table census real on all seated runs; no crash/softlock.
//
// Interesting-finding bar: a grey final COMPLETED (first time); a trial
// fought to a result (first time); or a blank discovered (unfireable).
//
// Seeds: fresh 8961-8964. Pilot: 1 seed (8961) x 2 arms; expand if it works.
// Horizon: DAYCAP=210, death-aware (+10d tail max). Conversation driver =
// r17's pinned fresh-first driver, unchanged.
// Env BEFORE any require: belongseek reads BELONG_V3 at module load;
// feastscale gates its feast/devotion layer on FEASTSCALE_R13; tribfloor
// and windefer gate on theirs. (r18 pilot ran WITHOUT these — 0/9 reached
// the table vs r17's 9/12; the r17x control rerun on the same tree went
// 3/4. Instrument bug, not a game regression.)
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.BELONG_V3 = '1';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-18');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [8961, 8962, 8963, 8964]).filter(Number.isFinite);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',') : ['grey', 'trial']);
const DAYS = parseInt(process.env.DAYS || '210', 10);

const DOORS = {
  grey: ['relay', 'feared', 'beloved', 'defiant', 'assimilated', 'witness', 'indispensable'],
  trial: ['feared', 'beloved', 'witness', 'assimilated', 'defiant', 'relay', 'indispensable'],
};
// Grey finals choice per seed (the leg's core observable).
const GREY_FINAL = { 8961: 'final:both-hands', 8962: 'final:the-contract', 8963: 'final:both-hands', 8964: 'final:the-contract' };

const { loadGame, setupGame, runDays } = require('./sim-harness');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };
function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---- transcript capture ----
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

// ---- table instrument: door steer + beat steer + finals steer + events ----
function attachTable(G, m, arm, seed) {
  const t = m.table = {
    doorPicks: [], doorEntries: [], sceneFires: [], failEvents: [], frames: [],
    challengeBeats: [], ladder: [], trialEvents: [], finals: [],
    announceDay: null, waitingEver: false, waitingDay: null, doneDay: null,
    seatDriveErr: null, flavorErr: null, atAnnounce: null, atSit: null,
    ledgerAtSit: null, sitSceneDay: null, rosterAtSit: null, leanAtDoor: null,
    won: 0, wonTele: null, entered: null,
  };
  // telemetry (r17: wrap G.tele — teleMilestone emits table_entered/table_won
  // through tele, NOT through G.telemetry)
  try {
    const otele = G.tele;
    G.tele = function (ev, data) {
      try {
        if (ev === 'table_entered') t.entered = { day: day(G), data: JSON.parse(JSON.stringify(data || {})) };
        if (ev === 'table_won') { t.won = 1; t.wonTele = { day: day(G), data: JSON.parse(JSON.stringify(data || {})) }; }
      } catch (e) {}
      return otele.call(this, ev, data);
    };
  } catch (e) {}
  // trial events
  for (const [fn, tag] of [['tableTrialByCombat', 'start'], ['tableTrialResume', 'resume']]) {
    const orig = G[fn];
    if (typeof orig === 'function') {
      G[fn] = function (...a) {
        try {
          const T = (G.tableState ? G.tableState() : {}) || {};
          t.trialEvents.push({
            tag, day: day(G), bearer: G.villagerId,
            result: tag === 'resume' ? String(a[0]) : undefined,
            weakened: T.weakened | 0, beat: T.beat | 0, phase: T.phase || null,
            terror: ((T.meters || {}).terror | 0),
          });
        } catch (e) {}
        return orig.apply(this, a);
      };
    }
  }
  const origChoose = G.chooseTableOption;
  if (typeof origChoose === 'function') {
    G.chooseTableOption = function (id) {
      try {
        const T = (G.tableState ? G.tableState() : {}) || {};
        const tc = (G.state.scholar || {}).tableChoices;
        const opts = (tc && tc.options) || [];
        const ids = new Set(opts.map(o => String((o && o.id) || '')));
        const phase = T.phase || '';
        // DOOR STEER (r17): at the door offer, pick the flavor's preference.
        if (phase === 'paths' && !T.path && opts.length &&
            opts.every(o => String((o && o.id) || '').indexOf('path:') === 0)) {
          const have = new Set(opts.map(o => String(o.id).slice(5)));
          const want = (DOORS[arm] || []).find(p => have.has(p));
          if (want) {
            t.doorPicks.push({ day: day(G), want, offer: opts.map(o => String(o.id).slice(5)) });
            id = 'path:' + want;
          }
        }
        // BEAT STEER — GREY: the cockpit, efficient x4 (merge 8, lean -8,
        // no backfire rolls). Option ids carry the 'beat:' prefix
        // (tableChoose strips it) — matching on the bare id never fires.
        if (arm === 'grey' && phase === 'challenge' && T.path === 'relay' && ids.has('beat:efficient')) {
          t.beatSteers = t.beatSteers || [];
          t.beatSteers.push({ day: day(G), beat: T.beat | 0, pick: 'beat:efficient' });
          id = 'beat:efficient';
        }
        // BEAT STEER — TRIAL: feared beat 2, demand the champion.
        if (arm === 'trial' && phase === 'challenge' && T.path === 'feared' && ids.has('beat:trial')) {
          t.beatSteers = t.beatSteers || [];
          t.beatSteers.push({ day: day(G), beat: T.beat | 0, pick: 'beat:trial' });
          id = 'beat:trial';
        }
        // FINALS STEER — GREY: per-seed final choice when offered.
        if (arm === 'grey' && phase === 'finals' && T.path === 'relay') {
          const want = GREY_FINAL[seed];
          if (want && ids.has(want)) {
            t.finals.push({ day: day(G), pick: want, offer: opts.map(o => String(o.id)) });
            id = want;
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
        let lean = null, grounding = null;
        try { lean = (typeof G.relayLean === 'function') ? G.relayLean() : null; } catch (e) {}
        try { grounding = (typeof G.grounding === 'function') ? G.grounding() : null; } catch (e) {}
        t.leanAtDoor = { lean, grounding };
        t.doorEntries.push({
          day: day(G), path: T.path || pid2 || null, branch: T.branch || null,
          band: T.band || null, lean, grounding,
          notes: ((T.branchNotes || []).slice(0, 14)),
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
        const T = (G.tableState ? G.tableState() : {}) || {};
        t.frames.push({
          day: day(G), frame: frame || '', phase: T.phase || '',
          path: T.path || null, beat: T.beat == null ? null : T.beat,
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
  try { const pv = G.tablePreview ? G.tablePreview() : null; if (pv) s.standingCost = pv.standingCost | 0; } catch (e) {}
  try { const se = G.tableSeat ? G.tableSeat() : null; if (se) s.seat = se.seat || 'none'; } catch (e) {}
  try {
    for (const p of (G.tableEarnedPaths() || [])) {
      if (p) s.doors[p.id] = { earned: !!p.earned, strength: p.strength | 0, why: (p.why || '').slice(0, 120) };
    }
  } catch (e) {}
  return s;
}
function ledgerSnapshot(G) {
  const out = {};
  try {
    const L = G.ledger ? G.ledger() : {};
    for (const k of ['killed', 'protected', 'betrayed', 'foodShared', 'foodHoarded', 'might', 'showmanship', 'exposed', 'embrace', 'defiance']) out[k] = (L && L[k]) | 0;
  } catch (e) {}
  return out;
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
  const out = { phase: null, path: null, branch: null, doors: [], weakened: 0 };
  try {
    const pg = (G.progState && G.progState()) || {};
    const T = pg.table || {};
    out.phase = T.phase || null; out.path = T.path || null; out.branch = T.branch || T.band || null;
    out.doors = (T.doors || []).slice(); out.weakened = T.weakened | 0;
  } catch (e) {}
  return out;
}

// ---- flavor layers (policy-side only) ----
// GREY: claim the relay, then hold lean near 0 with alternating reroutes.
// Never deepen/probe pre-table (grounding + backfire protection). The
// alternation is the pragmatist's instrument: honest (+2), efficient (-2).
function greyDaily(G, ctx) {
  try {
    const held = G.relayHeldByBearer ? G.relayHeldByBearer() : false;
    if (!held && G.claimRelay) {
      let roster = 0;
      try { roster = (G.state.village.roster || []).filter(id => !(G.getPerson(id) || {}).dead).length; } catch (e) {}
      const pk = G.pantryKcal ? G.pantryKcal() : 0;
      if (pk > 30000 && roster >= 6) { try { if (G.claimRelay() === 'claimed') ctx.greyRelayClaimed = 1; } catch (e) {} }
    } else if (held && G.relayReroute) {
      const n = ctx.greyReroutes | 0;
      const mode = (n % 2 === 0) ? 'honest' : 'efficient';
      try { G.relayReroute(mode); ctx.greyReroutes = n + 1; } catch (e) {}
    }
  } catch (e) {}
}

// ---- conversation driver (r17 pinned fresh-first driver, unchanged) ----
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
  const pid = 'belongseat-flavors-r18';
  const TF = require('./policies/tribfloor');
  const drainBase = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer',
    'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const flavorDaily = arm === 'grey' ? greyDaily : null;
  const myDaily = (G, ctx) => {
    const m = ctx._r18m;
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
    desc: 'belongseat recomposed (driveSeat + flavor + windefer drain), arm=' + arm,
    daily: myDaily,
  });
  const { Game } = await loadGame({ seed, mode: 'endgame-r18-' + pid + '-' + arm });
  await setupGame(Game);
  const m = { ctx: null };
  attachTranscript(Game, m);
  attachTable(Game, m, arm, seed);
  const ctx = { _r18m: m };
  let harnessCtx = null; // runDays passes its own ctx to policy.daily — the
  // real counters live there, not on this object.
  const rungHistory = [];
  const wrappedDaily = policy.daily;
  policy.daily = (G, c2) => {
    c2._r18m = m;
    harnessCtx = c2;
    const d = day(G);
    try {
      const pg = (G.progState && G.progState()) || {};
      if (pg.tableWaiting && !m.table.waitingEver) { m.table.waitingEver = true; m.table.waitingDay = d; }
      if (pg.table && pg.table.phase === 'done' && m.table.doneDay == null) m.table.doneDay = d;
      if (m.table.announceDay == null) {
        try {
          const pv = G.tablePreview ? G.tablePreview() : null;
          if (pv) { m.table.announceDay = d; m.table.atAnnounce = seatSnapshot(G); }
        } catch (e) {}
      }
    } catch (e) {}
    if (d % 10 === 0 || (d >= 80 && d % 5 === 0)) {
      const s = seatSnapshot(G);
      m.table.ladder.push({ day: s.day, seat: s.seat, tier: s.overtimeTier });
      if (s.seat !== 'none') rungHistory.push({ day: d, seat: s.seat, tier: s.overtimeTier, doors: Object.keys(s.doors).filter(k => s.doors[k].earned).join(',') });
    }
    return wrappedDaily(G, c2);
  };
  const res = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  const hc = harnessCtx || {};
  // convo probe on a run alive past d130
  let convos = [];
  try {
    const alive = (Game.state.village.roster || []).filter(id => !(Game.getPerson(id) || {}).dead);
    if (day(Game) >= 130 && alive.length > 1) {
      const other = alive.find(id => id !== Game.villagerId) || alive[0];
      convos = runConversation(Game, other, 130);
    }
  } catch (e) { convos = ['(convo probe failed: ' + String(e && e.message || e).slice(0, 120) + ')']; }
  const out = {
    seed, arm, days: res.days, over: !!Game.over, won: !!(Game.won || (m.table.won | 0)),
    endDay: day(Game), table: tableSummary(Game), m: {
      doorPicks: m.table.doorPicks, doorEntries: m.table.doorEntries,
      beatSteers: m.table.beatSteers || [], trialEvents: m.table.trialEvents,
      finals: m.table.finals, failEvents: m.table.failEvents,
      announceDay: m.table.announceDay, waitingDay: m.table.waitingDay,
      doneDay: m.table.doneDay, atSit: m.table.atSit, atAnnounce: m.table.atAnnounce,
      ledgerAtSit: m.table.ledgerAtSit, sitSceneDay: m.table.sitSceneDay,
      leanAtDoor: m.table.leanAtDoor, rungHistory,
      flavor: {
        greyRelayClaimed: !!(hc.greyRelayClaimed), greyReroutes: hc.greyReroutes | 0,
      },
      wonTele: m.table.wonTele || null, entered: m.table.entered || null,
      challengeBeats: m.table.challengeBeats,
    },
    census: census(Game),
  };
  // evidence
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r18-${arm}-s${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r18-transcript-${arm}-s${seed}.txt`), (m.trans.say || []).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r18-frames-${arm}-s${seed}.json`), JSON.stringify(m.table.frames, null, 1));
  if (convos.length) fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r18-convos-${arm}-s${seed}.txt`), convos.join('\n'));
  return out;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    for (const arm of ARMS) {
      console.log(`[r18] seed ${seed} arm ${arm} ...`);
      try {
        const r = await runOne(seed, arm);
        results.push({ seed, arm, ok: true, days: r.days, won: r.won, table: r.table });
        console.log(`[r18] seed ${seed} arm ${arm} DONE days=${r.days} won=${r.won} path=${r.table.path}/${r.table.branch} phase=${r.table.phase}`);
      } catch (e) {
        results.push({ seed, arm, ok: false, err: String(e && e.message || e).slice(0, 300) });
        console.log(`[r18] seed ${seed} arm ${arm} FAILED: ${String(e && e.message || e).slice(0, 200)}`);
      }
    }
  }
  console.log(JSON.stringify(results, null, 1));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
