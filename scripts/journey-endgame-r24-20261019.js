#!/usr/bin/env node
// journey-endgame-r24-20261019.js — LANE B leg 4 (endgame), run 24.
//
// Leg question (pre-registered): BELOVED-LIGHT via the protection-first
// playbook — r23's named next. r23 wired arenaAct (heroic contest picks ->
// protected +1..+3) and fixed nothing about the party channel; this run
// fixes ledger.js's party-present kill channel (state.village.party, was
// the never-written state.party) and composes:
//   (1) HEROIC=1: pick heroic contest choices (notability sacrifice/gallant/
//       principled -> protected +3/+2/+1 via arenaAct); REFUSE optional
//       contests with no heroic option (QUIET-style, keeps showmanship low).
//   (2) party maintenance: invite 2 trusted villagers, placePartyAtPlayer()
//       daily so party-present kills accrue protected+1 via the fixed channel.
//   (3) PATHFORCE=beloved — door steering.
//
// Stack: r23's proven seat-driver tip + titan driver with stand-down hook
// (TRIBFLOOR=1 WINDEFER=1 FEASTSCALE_R13=1 BELONG_V3=1).
//
// Env: PATHFORCE=beloved HEROIC=1 SEEDS=csv DAYS=260 (default).
// DAYS=260, DAYCAP=260, death-aware.
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.BELONG_V3 = '1';

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-19');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const HEROIC = process.env.HEROIC === '1';
const PATHFORCE = String(process.env.PATHFORCE || '').toLowerCase();
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9031, 9032]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '260', 10);
const ARM_TAG = 'r24' + (HEROIC ? '-heroic' : '') + (PATHFORCE ? '-' + PATHFORCE : '');
const STANDDOWN_AFTER = 5;

const DOORS = ['feared', 'defiant', 'beloved', 'witness', 'assimilated', 'relay', 'indispensable'];
// heroic notability order: sacrifice(+3) > gallant(heroics +2) > principled(mercy +1)
const HEROIC_ORDER = ['sacrifice', 'gallant', 'principled'];

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

// ---- table instrument (r22/r23 pattern: PATHFORCE steering + door entries) ----
function attachTable(G, m) {
  const t = m.tab = {
    doorPicks: [], doorEntries: [], sceneFires: [], failEvents: [], frames: [],
    announceDay: null, sitDay: null, wonTele: null, tierHist: [],
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
      try {
        const T = (G.tableState ? G.tableState() : {}) || {};
        const opts = (((G.state.scholar || {}).tableChoices) || {}).options || [];
        const phase = T.phase || '';
        if (phase === 'paths' && !T.path && opts.length &&
            opts.every(o => String((o && o.id) || '').indexOf('path:') === 0)) {
          const have = new Set(opts.map(o => String(o.id).slice(5)));
          let want = DOORS.find(p => have.has(p));
          if (PATHFORCE) { if (have.has(PATHFORCE)) want = PATHFORCE; }
          if (want) {
            t.doorPicks.push({ day: day(G), want, offer: opts.map(o => String(o.id).slice(5)),
              forced: PATHFORCE && want === PATHFORCE ? 1 : 0,
              pathNotOffered: PATHFORCE && !have.has(PATHFORCE) ? PATHFORCE : null });
            id = 'path:' + want;
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
          branch: T.branch || T.band || null, branchSignals, ledger });
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
    for (const l of links) {
      if (!l || l.status !== 'active') continue;
      out.push({ id: l.id, other: linkOtherOf(G, l), trust: l.trust || 0,
        primary: l.primary, tribute: l.tributeKcalPerWeek || 0 });
    }
  } catch (e) {}
  return out;
}
function attachCoal(G, m) {
  m.coal = {};
  try {
    const orig = G.soundTitanCall;
    if (typeof orig !== 'function') { m.coalErr = 'soundTitanCall missing'; return; }
    G.soundTitanCall = function (tid) {
      const linksAtCall = linksSnapshot(G);
      let r = null;
      try { r = orig.call(this, tid); } catch (e) { m.coal[tid] = m.coal[tid] || {}; m.coal[tid].callErr = String(e && e.message || e).slice(0, 160); throw e; }
      try {
        const st = (G.state || {}).titans || {};
        const muster = (st.musters || {})[tid] || null;
        const allies = (muster && muster.allies) || [];
        const seen = {};
        for (const a of allies) if (a && a.villageId) seen[a.villageId] = (seen[a.villageId] || 0) + 1;
        const answered = Object.keys(seen);
        const refused = linksAtCall.filter(l => answered.indexOf(l.other) < 0)
          .map(l => ({ other: l.other, trust: l.trust, tendable: l.primary === 'haven' }));
        const havenBlades = (muster && muster.haven ? muster.haven.length : 0);
        const total = allies.length + havenBlades;
        let minAllies = 0, ready = false;
        try { minAllies = ((G.data || {}).titans || {})[tid].minAllies || 0; } catch (e) {}
        if (!minAllies) { try { minAllies = (G._titanTest && G._titanTest.titanDefs ? G._titanTest.titanDefs() : {})[tid].minAllies || 0; } catch (e) {} }
        try { ready = G.titanMusterReady ? !!G.titanMusterReady(tid) : (total >= minAllies); } catch (e) { ready = total >= minAllies; }
        m.coal[tid] = Object.assign(m.coal[tid] || {}, {
          callDay: day(G), linksAtCall, nLinksAtCall: linksAtCall.length,
          answeredFires: answered, nAnswered: answered.length,
          refused, nRefused: refused.length,
          allyBlades: allies.length, havenBladesAtCall: havenBlades,
          totalBlades: total, minAllies, gateReady: ready,
        });
      } catch (e) {}
      return r;
    };
  } catch (e) { m.coalErr = String(e && e.message || e).slice(0, 160); }
}

// ---- titan driver with stand-down hook (r23, unchanged) ----
function titanDaily(G, ctx, m) {
  for (const tid of titanIds(G)) {
    const s = (m._titan = m._titan || {}); const st = (s[tid] = s[tid] || { unfillDays: 0 });
    const omen = omenOf(G, tid);
    if (!omen) continue;
    if (slainOf(G, tid)) continue;
    const muster = musterOf(G, tid);
    if (muster) {
      st.unfillDays = muster ? (st.unfillDays + 1) : 0;
      if (muster && !st.stoodDown && st.unfillDays >= STANDDOWN_AFTER) {
        let r = null;
        try { r = G.titanSelfDo ? G.titanSelfDo('titan:standdown:' + tid) : null; } catch (e) { st.sdErr = String(e && e.message || e).slice(0, 120); }
        st.stoodDown = { day: day(G), returned: r === true, unfillDays: st.unfillDays };
        try { (m.sdEvents = m.sdEvents || []).push({ seed: m.seed, tid, day: day(G), unfillDays: st.unfillDays, returned: r === true }); } catch (e) {}
        st.unfillDays = 0;
      }
      continue;
    }
    if (st.fights >= 8) continue;
    if (G.tbfight && !G.tbfight.over) continue;
    const mid = titanMonsterId(G, tid);
    if (!mid) { st.noMonster = (st.noMonster | 0) + 1; continue; }
    const w = findWorldMonster(G, mid);
    if (!w) { st.noMonster = (st.noMonster | 0) + 1; continue; }
    try {
      if (G.map.px !== w.tx || G.map.py !== w.ty) CMP.walkTo(G, w.tx, w.ty);
    } catch (e) { st.walkErr = String(e && e.message || e).slice(0, 120); }
    if (G.over) return;
    if (G.tbfight && !G.tbfight.over) continue;
    let here = null;
    try { here = (G.monsterAt ? G.monsterAt(G.map.px, G.map.py) : null) || (G.playerMonster ? G.playerMonster() : null); } catch (e) {}
    if (!here || (here.id !== mid && here.monster !== mid)) {
      st.noMonster = (st.noMonster | 0) + 1; continue;
    }
    try {
      G.startCombat(mid);
      st.fights++;
    } catch (e) { st.fightErr = String(e && e.message || e).slice(0, 120); }
  }
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

// ---- HEROIC contest wrapper (r24): heroic picks, else QUIET-style refuse ----
function attachHeroic(G, m) {
  m.heroic = { heroics: 0, refusals: 0, invited: 0, partyDays: 0 };
  if (typeof G.contestChoose !== 'function') { m.heroic.noHook = 1; return; }
  const origChoose = G.contestChoose;
  G.contestChoose = function (idx) {
    try {
      const ac = G.state && G.state.activeContest;
      const phase = ac && (ac.phases || [])[ac.phaseIdx || 0];
      const choices = (phase && phase.choices) || [];
      for (const nota of HEROIC_ORDER) {
        const hIdx = choices.findIndex(ch => ch && ch.do && ch.do.notability === nota);
        if (hIdx >= 0) {
          m.heroic.heroics++;
          try { m.heroic.pickLog = (m.heroic.pickLog || []); m.heroic.pickLog.push({ day: day(G), nota, label: String((choices[hIdx] || {}).label || '').slice(0, 80) }); } catch (e) {}
          return origChoose.call(this, hIdx);
        }
      }
      const rIdx = choices.findIndex(ch => ch && ch.next === 'REFUSE');
      if (rIdx >= 0 && (!ac.participant || ac.participant === 'player')) {
        m.heroic.refusals++;
        idx = rIdx;
      }
    } catch (e) {}
    return origChoose.call(this, idx);
  };
}

// ---- party maintenance (r24): staff 2, keep them placed at the player ----
function partyDaily(G, m) {
  try {
    if (!G.state.systemArrived) return;
    if (typeof G.partyState !== 'function') { m.heroic.noParty = 1; return; }
    const vs = G.partyState();
    if (!vs) return;
    let party = vs.party || [];
    party = party.filter(id => { try { return !(G.getPerson(id) || {}).dead; } catch (e) { return true; } });
    if (party.length < 2 && typeof G.inviteToParty === 'function' && !G.partyFull()) {
      const roster = (G.state.village.roster || []).filter(id => id !== G.villagerId && party.indexOf(id) < 0);
      for (const id of roster) {
        if (party.length >= 2) break;
        let trust = 10; try { trust = ((G.state.village.trust || {})[id]) || 10; } catch (e) {}
        if (trust >= 25) {
          try { const r = G.inviteToParty(id); if (r && r.ok) { party.push(id); m.heroic.invited++; } } catch (e) {}
        }
      }
    }
    vs.party = party;
    if (party.length) {
      m.heroic.partyDays++;
      if (typeof G.placePartyAtPlayer === 'function') { try { G.placePartyAtPlayer(); } catch (e) {} }
    }
  } catch (e) {}
}

async function runOne(seed) {
  const drainBase = WD.withWinDefer(TF.belongfeast, 'belongfeast-windefer',
    'belongfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  const myDaily = (G, ctx) => {
    const m = ctx._r24m;
    try { titanDaily(G, ctx, m); } catch (e) { if (m) m.titanErr = String(e && e.message || e).slice(0, 160); }
    try {
      const pv = G.tablePreview ? G.tablePreview() : null;
      if (pv && pv.ready) { try { SD.driveSeat(G, ctx); } catch (e) { if (m) m.seatDriveErr = String(e && e.message || e).slice(0, 160); } }
    } catch (e) {}
    try { partyDaily(G, m); } catch (e) { if (m) m.partyErr = String(e && e.message || e).slice(0, 160); }
    return drainBase.daily(G, ctx);
  };
  const policy = Object.assign({}, SD.belongseat, {
    id: 'belongseat-' + ARM_TAG,
    desc: 'belongseat + titan driver with stand-down hook + r24 heroic/party, ' + ARM_TAG,
    daily: myDaily,
  });
  const { Game } = await loadGame({ seed, mode: 'endgame-r24-' + ARM_TAG });
  await setupGame(Game);
  const m = { ctx: null, seed };
  attachTranscript(Game, m);
  attachTable(Game, m);
  attachCoal(Game, m);
  attachHeroic(Game, m);
  const ctx = { _r24m: m };
  let harnessCtx = null;
  const wrappedDaily = policy.daily;
  policy.daily = (G, c2) => {
    c2._r24m = m;
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
  const k = (harnessCtx && harnessCtx._r24k) || {};
  const out = {
    seed, days: res.days, over: !!Game.over, won: !!Game.won,
    endDay: day(Game),
    table: {
      announceDay: m.tab.announceDay, sitDay: m.tab.sitDay, wonTele: m.tab.wonTele,
      tierHist: m.tab.tierHist, doorPicks: m.tab.doorPicks, doorEntries: m.tab.doorEntries,
    },
    seatAtAnnounce: m.seatAtAnnounce || null,
    seatAtEnd: m.seatAtEnd || null,
    heroic: m.heroic || null,
    titans: k, sdEvents: m.sdEvents || [], titanErr: m.titanErr, seatDriveErr: m.seatDriveErr,
    partyErr: m.partyErr, coalErr: m.coalErr,
    coal: (function(){ const c = Object.assign({}, m.coal || {}); delete c._censusDays; return c; })(),
    census: census(Game),
  };
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r24-${ARM_TAG}-s${seed}.json`), JSON.stringify(out, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r24-${ARM_TAG}-s${seed}.txt`), (m.trans.say || []).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r24-${ARM_TAG}-s${seed}-frames.json`), JSON.stringify(m.tab.frames, null, 1));
  if (convos.length) fs.writeFileSync(path.join(EVIDIR, `journey-endgame-r24-${ARM_TAG}-convos-s${seed}.txt`), convos.join('\n'));
  return out;
}

async function main() {
  const results = [];
  for (const seed of SEEDS) {
    console.log(`--- r24 ${ARM_TAG} seed ${seed} ---`);
    try {
      const out = await runOne(seed);
      results.push({ seed, ok: true, out });
      const L = (out.seatAtEnd && out.seatAtEnd.ledger) || {};
      const branch = (out.table.doorEntries && out.table.doorEntries.length) ? out.table.doorEntries[out.table.doorEntries.length - 1].branch : 'n/a';
      console.log(`seed ${seed}: days=${out.endDay} won=${out.won} branch=${branch} showmanship=${L.showmanship} protected=${L.protected} heroics=${out.heroic && out.heroic.heroics} refusals=${out.heroic && out.heroic.refusals} invited=${out.heroic && out.heroic.invited}`);
    } catch (e) {
      results.push({ seed, ok: false, err: String(e && e.stack || e).slice(0, 500) });
      console.log(`seed ${seed}: FATAL ${String(e && e.message || e).slice(0, 200)}`);
    }
  }
  fs.writeFileSync(path.join(EVIDIR, 'journey-endgame-r24-' + ARM_TAG + '-summary.json'),
    JSON.stringify(results.map(r => ({ seed: r.seed, ok: r.ok, err: r.err,
      days: r.out && r.out.endDay, won: r.out && r.out.won,
      branch: r.out && r.out.table.doorEntries && r.out.table.doorEntries.length ? r.out.table.doorEntries[r.out.table.doorEntries.length - 1].branch : null,
      ledger: r.out && r.out.seatAtEnd && r.out.seatAtEnd.ledger,
      heroic: r.out && r.out.heroic })), null, 1));
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
