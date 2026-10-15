#!/usr/bin/env node
// sweep-journeyscale-20261015.js — JOURNEY SCALE leg r1 PILOT (2026-10-15).
//
// PRE-REGISTRATION (measurement staged, MEASUREMENT.md §§9–12, §14 binding):
// - Question: On current master (win-side stack), do full runs crossing days
//   80–140 register the regional → national scale transition as a FELT moment
//   (hierarchy friction, rival leaders, coalition logistics, table approach as
//   ceremony, not a number)?
// - Interesting finding: villages reaching the table without ever meaningfully
//   leaving regional; national transitions passing silently (no System moment,
//   no villager reactions, no UI beat); hierarchy/coalition content unfireable;
//   table approach feeling like a threshold, not a moment.
// - Method: PILOT on 4 seeds × {leadseat, belongseat} (8 runs), 180d
//   death-aware, armed win-side stack only (own baseline not needed — the
//   question is about the moment, not a lever). If the pilot shows nothing
//   interesting, document and stop — no full multi-seed run.
// - Binding metrics:
//   M1: >=3/4 seeds reach regional (networkLive) by day <=140.
//   M2: on seeds reaching national, >=1 captured System-scale beat at the
//       regional→national transition (national beat staged/answered/refused —
//       something with shape, not a silent rank flip).
//   M3: on seeds sitting the table, >=1 played beat at approach (invitation/
//       pricing read aloud) — ceremony, not threshold.
//   M4: >=2/4 seeds show >=1 post-transition villager reaction (gossip/journal/
//       beats naming court/realm/polity/tribute within ±7d of nationalDay).
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//   WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 node scripts/sweep-journeyscale-20261015.js
// Targeted re-runs: SEEDS="1414" ONLY="leadseat"
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [1414, 1515, 1616, 1717]).filter(Number.isFinite);
const ONLY = (process.env.ONLY || 'leadseat,belongseat').split(',').map(s => s.trim()).filter(Boolean);
const DAYS = parseInt(process.env.DAYCAP || '180', 10);
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-15', 'journey-scale-perseed');
const TRANSCRIPTS = path.join(ROOT, 'evidence', '2026-10-15', 'journey-scale-transcripts');
fs.mkdirSync(EVID, { recursive: true });
fs.mkdirSync(TRANSCRIPTS, { recursive: true });

function policyFor(id) { return id === 'leadseat' ? SD.leadseat : SD.belongseat; }
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Beat capture: System-scale + table + death language for the SENSE read.
// Ring buffer (sim-findings #303 lesson — fixed caps bias against late events).
const BEAT_RE = /GOVERNANCE|regional dawn|first court|iron court|founding council|the charter|the binding|court\b|realm\b|polity\b|national\b|regional\b|tribute|summons|invitation|table|seat|ring of pale|path of|ascend|treaty|covenant|league pool|war-pact|famine reserve|renegotiat|bid for primacy|defense call|trade call|died|dead|starv|exile|crisis|wave [345]/i;
function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 6000) t.beats.splice(0, 1000);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys(msg); };
}

function attachDeaths(Game, t) {
  t.deaths = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 600) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 80),
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

// Conversation driver: engage-first, 8 turns (journey-scale5-20261012 pattern).
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function vname(G, vid) { try { return G.displayName(vid) || vid; } catch (e) { return vid; } }
function aliveRoster(G) {
  try {
    const roster = (G.state.village || {}).roster || [];
    return roster.filter(id => { try { const p = G.getPerson(id) || {}; return !p.dead; } catch (e) { return false; } });
  } catch (e) { return []; }
}
function runConversation(Game, seed, policyId, day, tag) {
  const fp = path.join(TRANSCRIPTS, `${seed}-${policyId}-day${day}-${tag}.txt`);
  const L = [];
  try {
    const roster = aliveRoster(Game).filter(id => {
      try { return !((Game.state.scholar || {}).id === id); } catch (e) { return true; }
    });
    if (!roster.length) { L.push('(no living villagers to talk to)'); }
    else {
      const vid = roster[day % roster.length];
      const nm = vname(Game, vid);
      let p = {};
      try { p = Game.getPerson(vid) || {}; } catch (e) {}
      const r0 = Game.startConvo(vid);
      const c = Game.convoGet(vid);
      const want = (c && c.want) || {};
      L.push(`=== seed ${seed} ${policyId} day ${day} [${tag}] — conversation with ${nm} ===`);
      let pmood = '?';
      try { pmood = Game.npcMood ? Game.npcMood(vid) : '?'; } catch (e) {}
      L.push(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} mood=${pmood} scale=${(() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })()}`);
      L.push(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
      L.push('');
      L.push(`THEM: ${r0.line || '(no line)'}`);
      let r = r0;
      for (let turn = 0; turn < 8; turn++) {
        let choices = (r.choices && r.choices.length) ? r.choices : null;
        if (!choices) { try { choices = Game.convoChoices(vid); } catch (e) { choices = []; } }
        const pick = pickChoice(choices, turn);
        if (!pick || pick.id === 'leave') { L.push('YOU: (leave)'); break; }
        L.push(`YOU: [${pick.id}] ${pick.label}`);
        r = Game.convoTurn(vid, pick.id);
        if (r.line) L.push(`THEM: ${r.line}`);
        const w = (Game.convoGet(vid).want) || {};
        L.push(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
        if (r.ended) { L.push('(ended by engine)'); break; }
      }
      let endR = null;
      try { endR = Game.endConvo(vid, 'done'); } catch (e) { L.push('endConvo ERROR: ' + (e && e.message)); }
      if (endR && endR.line) L.push(`closing line: ${endR.line}`);
      const c2 = Game.convoGet(vid);
      const w2 = (c2 && c2.want) || {};
      L.push(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
      const t = (c2 && c2.transcript) || [];
      const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
      const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
      if (dupes.length) L.push(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
    }
  } catch (e) {
    L.push('CONVO ERROR: ' + (e && e.stack || e));
  }
  fs.writeFileSync(fp, L.join('\n'));
  return fp;
}

function census(Game) {
  const out = { alive: [], dead: [], leader: '?', speaker: '?', breadth: 0, stage: 0, waves: 0, arc: 1 };
  try {
    const roster = (Game.state.village || {}).roster || [];
    for (const id of roster) {
      let p = {};
      try { p = Game.getPerson(id) || {}; } catch (e) {}
      const nm = vname(Game, id);
      if (p.dead) out.dead.push(nm);
      else {
        out.alive.push(nm);
        let trust = '?';
        try { trust = ((Game.state.village || {}).trust || {})[id]; } catch (e) {}
        out[nm] = { occupation: p.formerOccupation || p.occupation || '?', trust };
      }
    }
  } catch (e) {}
  try { out.breadth = Game.codexBreadth ? Game.codexBreadth() : 0; } catch (e) {}
  try { out.stage = Game.integrationStage ? Game.integrationStage() : 0; } catch (e) {}
  try { out.waves = Game.unlockedWave ? Game.unlockedWave() : 0; } catch (e) {}
  try { out.arc = (Game.progState ? Game.progState() : {}).arc || 1; } catch (e) {}
  try { const sp = (Game.state.village || {}).speaker; if (sp) out.speaker = vname(Game, sp); } catch (e) {}
  return out;
}

function linksSnapshot(Game) {
  try {
    const ls = Game.hierarchyState ? Game.hierarchyState() : [];
    return ls.map(l => ({
      kind: l.kind, status: l.status, primary: l.primary, subordinate: l.subordinate,
      trust: l.trust, age: l.age, tributeKcalPerWeek: l.tributeKcalPerWeek || 0,
      arrears: l.arrears || 0, seasonal: l.seasonal || null,
    }));
  } catch (e) { return []; }
}

async function oneRun(seed, policyId) {
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `journeyscale-${policyId}`, fullTelemetry: false });
  await setupGame(Game);
  const t = { beats: [], scaleEvents: [], rankTimeline: [] };
  const deathsT = { deaths: [] };
  attachBeats(Game, t);
  attachDeaths(Game, deathsT);

  const hist = { maxRank: 0, everTable: false, exiled: false, sittings: 0, regionalDay: null, nationalDay: null, globalDay: null };
  let prevRank = 'village';
  let convoDays = { national: false, d130: false };
  const oDaily = base.daily;
  const policy = Object.assign({}, base);
  policy.daily = (G, ctx) => {
    let r;
    try {
      const day = gday(G);
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if (rank !== prevRank) {
        t.scaleEvents.push({ day, from: prevRank, to: rank, rank });
        if (rank === 'regional' && !hist.regionalDay) hist.regionalDay = day;
        if (rank === 'national' && !hist.nationalDay) hist.nationalDay = day;
        if (rank === 'global' && !hist.globalDay) hist.globalDay = day;
        prevRank = rank;
      }
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      // conversation windows: morning-after the national transition + the
      // table-approach window at day 130 (death-aware: village must be alive).
      if (!convoDays.national && hist.nationalDay && day >= hist.nationalDay + 3) {
        convoDays.national = true;
        try { runConversation(G, seed, policyId, day, 'post-national'); } catch (e) {}
      }
      if (!convoDays.d130 && day >= 130) {
        convoDays.d130 = true;
        try { runConversation(G, seed, policyId, day, 'd130'); } catch (e) {}
      }
      if (day % 10 === 0) t.rankTimeline.push({ day, rank });
    } catch (e) {}
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };

  // post-run link state + tribute flows
  const links = linksSnapshot(Game);
  let tributePaidTotal = 0;
  try {
    const ls = Game.hierarchyState ? Game.hierarchyState() : [];
    for (const l of ls) tributePaidTotal += (l.tributePaidWeek || 0);
  } catch (e) {}
  let nationalShape = null, nationalAnswered = null, nationalRefused = false;
  try {
    const pn = (Game.state || {}).pendingNational;
    if (pn) nationalShape = pn.shape;
  } catch (e) {}
  try {
    const hist2 = (Game.state || {}).history || {};
    // answered beats land in the journal/ledger; infer shape from beats
    for (const b of t.beats) {
      if (/first court/i.test(b.text)) nationalShape = nationalShape || 'lead';
      if (/iron court/i.test(b.text)) nationalShape = nationalShape || 'conquest';
      if (/founding council/i.test(b.text)) nationalShape = nationalShape || 'covenant';
      if (/charter/i.test(b.text)) nationalShape = nationalShape || 'trade';
      if (/oath of the realm/i.test(b.text)) nationalShape = nationalShape || 'belong';
    }
  } catch (e) {}
  // Did a national beat get answered? nationalLive + no pending = answered (or realm lost)
  try { nationalAnswered = !!Game.state.nationalLive && !Game.state.pendingNational; } catch (e) { nationalAnswered = null; }

  const out = {
    seed, policyId, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    wins: endInfo.won ? 1 : 0,
    national: hist.maxRank >= 2 ? 1 : 0,
    regional: hist.maxRank >= 1 ? 1 : 0,
    global: hist.maxRank >= 3 ? 1 : 0,
    table: hist.everTable ? 1 : 0,
    exiled: hist.exiled ? 1 : 0,
    regionalDay: hist.regionalDay, nationalDay: hist.nationalDay, globalDay: hist.globalDay,
    nationalShape, nationalAnswered,
    scaleEvents: t.scaleEvents,
    rankTimeline: t.rankTimeline,
    links, tributePaidTotal,
    deaths: deathsT.deaths,
    census: census(Game),
    beats: t.beats,
  };
  const fp = path.join(EVID, `${seed}-${policyId}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  return out;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    for (const policyId of ONLY) {
      console.log(`--- seed ${seed} policy ${policyId} ---`);
      try {
        const r = await oneRun(seed, policyId);
        results.push(r);
        console.log(`  days=${r.days} end=${r.endReason} regionalDay=${r.regionalDay} nationalDay=${r.nationalDay} wins=${r.wins} table=${r.table}`);
      } catch (e) {
        console.error(`  RUN FAILED seed=${seed} policy=${policyId}: ${e && e.stack || e}`);
      }
    }
  }
  const summary = {
    seeds: SEEDS, policies: ONLY, runs: results.length,
    regional: results.filter(r => r.regional).length,
    national: results.filter(r => r.national).length,
    global: results.filter(r => r.global).length,
    table: results.filter(r => r.table).length,
    wins: results.filter(r => r.wins).length,
    exiled: results.filter(r => r.exiled).length,
    perRun: results.map(r => ({ seed: r.seed, policyId: r.policyId, days: r.days, endReason: r.endReason, regionalDay: r.regionalDay, nationalDay: r.nationalDay, wins: r.wins, table: r.table })),
  };
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(summary.perRun, null, 1));
  console.log(`regional ${summary.regional}/${results.length} national ${summary.national}/${results.length} table ${summary.table}/${results.length} wins ${summary.wins}/${results.length}`);
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
