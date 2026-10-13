#!/usr/bin/env node
// journey-endgame-r8-20261013.js — ENDGAME leg (leg 4), 2026-10-13 playtest loop.
// PRE-REGISTERED (MEASUREMENT.md §11):
//   question: on 150d death-aware horizons, with the best scale-push policies
//     (belongseek, leadcourt), does any sim approach the table (tableSeat()
//     lesser/full) or fire tableScene? Which lesser-seat rungs fill, which bind?
//   primary metric: runs with seat != 'none' (table approach) OR tableScene fired.
//   GO (interesting): >=1/4 pilot seeds (belongseek × 11/22/33/44) shows a table
//     approach or a fired tableScene. On GO: expand to leadcourt × same seeds.
//     On NO-GO: document, move on — deliverables become the people check + one blank.
//   horizon: 150d, death-aware (+10d tail). Reason: reachability lever (§10).
//   seeds: 11,22,33,44. policies: belongseek pilot, leadcourt on GO.
// TOOLING ONLY — no game balance changes. Policy behaves as pinned.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-13');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [11, 22, 33, 44]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['belongseek']).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '150', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const fc = require('./food-coupling-20261013');
const POLICY_REGISTRY = { belongseek, leadcourt };

const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

// ---- conversation driver (from journey-scale-r1-20261013.js) ----
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
  const yn = list.find(x => x && x.id === 'gq:yn:unsure') || list.find(x => x && x.id === 'gq:yn:yes') || list.find(x => x && x.id === 'gq:yn:no');
  if (yn) return yn;
  const bdec = list.find(x => x && x.id === 'betrayal:decline');
  if (bdec) return bdec;
  const nv = list.find(x => x && x.id === 'nv:listen') || list.find(x => x && x.id === 'nv:nod') || list.find(x => x && x.id && x.id.indexOf('nv:') === 0);
  if (nv) return nv;
  return list.find(x => x && x.id === 'leave') || list[0] || null;
}
let _G = null, _seed = null, _pol = null;
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function runConversation(gday, vid, tag) {
  const fp = path.join(EVIDIR, `journey-endgame-r8-transcript-${_pol}-s${_seed}-day${gday}-${tag}.txt`);
  const L = [];
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    L.push(`=== seed ${_seed} policy ${_pol} day ${gday} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = _G.npcMood ? _G.npcMood(vid) : '?'; } catch (e) {}
    L.push(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood}`);
    L.push(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    L.push('');
    L.push(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      const pick = pickChoice(choices, turn);
      if (!pick) { L.push('YOU: (no usable choice; ending)'); break; }
      if (pick.id === 'leave') { L.push('YOU: (leave)'); break; }
      L.push(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) L.push(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      L.push(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { L.push('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { L.push('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) L.push(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    L.push(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) L.push(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    L.push('CONVO ERROR: ' + (e && e.stack || e));
  }
  fs.writeFileSync(fp, L.join('\n'));
  return fp;
}
function pickConvoVillager() {
  try {
    const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
    const alive = roster.filter(id => !person(id).dead);
    const scored = alive.map(id => {
      let cnt = 999;
      try { const c0 = _G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
      let commOk = true;
      try { const comm = _G.npcComm ? _G.npcComm(id) : { level: 'full' }; commOk = comm.level !== 'none'; } catch (e) {}
      return { id, cnt, commOk };
    }).filter(x => x.commOk).sort((a, b) => a.cnt - b.cnt);
    return scored.length ? scored[0].id : null;
  } catch (e) { return null; }
}

// ---- table ladder instrument ----
function attachTable(G, m) {
  const t = m.table = { ladder: [], sceneFires: [] };
  const safe = (fn, wrap) => {
    if (typeof fn !== 'function') return fn;
    return function (...a) {
      let r;
      try { r = fn.apply(this, a); } catch (e) { throw e; }
      try { wrap(r, a); } catch (e) {}
      return r;
    };
  };
  if (typeof G.tableScene === 'function') G.tableScene = safe(G.tableScene, () => {
    t.sceneFires.push({ day: day(G) });
  });
  return t;
}
function sampleSeat(G) {
  const s = { day: 0, seat: 'none', w1: 0, w2: 0, w3: 0, contests: 0, crises: 0, rank: 'village', stage: 0, foodDeeds: false };
  try { s.day = day(G); } catch (e) {}
  try {
    const r = G.tableSeat ? G.tableSeat() : null;
    if (r) {
      s.seat = r.seat || 'none';
      const d = r.detail || {};
      s.w1 = d.w1 | 0; s.w2 = d.w2 | 0; s.w3 = d.w3 | 0;
      s.contests = d.contestsN | 0; s.crises = d.crisesN | 0;
      s.rank = d.rank || 'village'; s.stage = d.stage | 0; s.foodDeeds = !!d.foodDeeds;
    }
  } catch (e) {}
  return s;
}
function finalizeTable(m) {
  const t = m.table, out = {};
  out.tableSceneFires = t.sceneFires.length;
  out.tableSceneFireDays = t.sceneFires.map(x => x.day);
  const order = { none: 0, lesser: 1, full: 2 };
  let best = 'none', bestD = null;
  const maxes = { w1: 0, w2: 0, w3: 0, contests: 0, crises: 0, stage: 0, foodDeeds: 0 };
  for (const s of t.ladder) {
    if ((order[s.seat] || 0) > (order[best] || 0)) { best = s.seat; bestD = s; }
    maxes.w1 = Math.max(maxes.w1, s.w1); maxes.w2 = Math.max(maxes.w2, s.w2); maxes.w3 = Math.max(maxes.w3, s.w3);
    maxes.contests = Math.max(maxes.contests, s.contests); maxes.crises = Math.max(maxes.crises, s.crises);
    maxes.stage = Math.max(maxes.stage, s.stage); if (s.foodDeeds) maxes.foodDeeds = 1;
  }
  out.seatBest = best; out.seatBestDetail = bestD;
  out.seatApproach = (best !== 'none' || t.sceneFires.length > 0) ? 1 : 0;
  out.rungMaxes = maxes;
  out.ladder = t.ladder.filter((_, i) => i % 3 === 0); // sampled
  return out;
}

function census(G) {
  try {
    return (G.state.village.roster || []).map(id => {
      const p = person(id);
      return { name: vname(id), alive: !p.dead, occ: p.formerOccupation || p.occupation || null };
    });
  } catch (e) { return []; }
}
function exiledEver(G, m) {
  try {
    return ((m.daily || []).some(r => r.exiled)) ? 1 : 0;
  } catch (e) { return 0; }
}
// scale-row needs exiled flag in fc.dailyRow? use scholar directly
function scaleExiledDaily(G, m) { /* recorded via table daily below */ }

async function runOne(pid, seed) {
  const base = POLICY_REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  _seed = seed; _pol = pid;
  const { Game } = await loadGame({ seed, mode: 'endgame-r7-' + pid });
  _G = Game;
  await setupGame(Game);
  const m = fc.attachInstruments(Game);
  attachTable(Game, m);
  const convoDays = { 60: false, 100: false, 140: false };
  const convoFiles = [];
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  const rungHistory = [];
  policy.daily = (G, ctx) => {
    const d = day(G);
    try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
    try {
      if (G.state && G.state.scholar && G.state.scholar.exiled && !m.table.exiledEver) {
        m.table.exiledEver = true; m.table.exileDay = d;
      }
    } catch (e) {}
    if (d % 10 === 0) {
      const s = sampleSeat(G);
      m.table.ladder.push(s);
      if (s.seat !== 'none') rungHistory.push({ day: d, seat: s.seat, detail: `${s.w1}/${s.w2}/${s.w3}w c${s.contests} cr${s.crises} ${s.rank} st${s.stage} fd${s.foodDeeds ? 1 : 0}` });
    }
    // CONVO PROBE DISABLED in the measurement loop (2026-10-13): driving a
    // conversation from inside policy.daily completes the transcript but
    // leaves the day loop wedged after day 60 (no day-70 sampleSeat; 20+ min
    // CPU with no advance). Transcripts are captured by separate
    // convo-probe runs (load, run to day X, converse, exit) instead.
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
  const frow = fc.finalize(Game, m, result);
  const trow = finalizeTable(m);
  const out = {
    label: 'journey-endgame-r7', policy: pid, seed,
    days: result.days, endReason: result.endReason,
    national: frow.national, rank: frow.rank, maxWave: frow.maxWave,
    table: frow.table, tableWaiting: !!frow.tableWaiting,
    won: frow.won ? 1 : 0, wins: frow.won ? 1 : 0,
    vests: frow.vests,
    exiled: exiledOf(m), seatApproach: trow.seatApproach,
    seatBest: trow.seatBest, rungMaxes: trow.rungMaxes,
    rungHistory, ladder: trow.ladder,
    tableSceneFires: trow.tableSceneFires, tableSceneFireDays: trow.tableSceneFireDays,
    census: census(Game),
    deaths: (result.samples && result.samples.deaths) || [],
    convoFiles,
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-endgame-r8-${pid}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  const pop = out.census.filter(c => c.alive).length;
  console.log(`[${pid} s${seed}] d=${out.days} ${out.endReason} rank=${out.rank} nat=${out.national} wave=${out.maxWave} seat=${out.seatBest} sceneFires=${out.tableSceneFires} won=${out.won} pop=${pop}/${out.census.length} exiled=${out.exiled} rungs=${out.rungMaxes.w1}/${out.rungMaxes.w2}/${out.rungMaxes.w3}w c${out.rungMaxes.contests} cr${out.rungMaxes.crises} st${out.rungMaxes.stage} fd${out.rungMaxes.foodDeeds}`);
  return out;
}
function exiledOf(m) {
  // exiled-ever across the run, from the table instrument's daily check
  try { return m.table.exiledEver ? 1 : 0; } catch (e) { return 0; }
}

async function main() {
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      try { rows.push(await runOne(pid, seed)); }
      catch (e) { console.log(`[${pid} s${seed}] FATAL: ` + (e && e.stack || e)); rows.push({ policy: pid, seed, fatal: String(e && e.message || e) }); }
    }
  }
  const agg = (fn) => rows.reduce((t, r) => t + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const s = {
    runs: rows.length,
    national: agg(r => r.national), table: agg(r => r.table), wins: agg(r => r.wins),
    seatApproach: agg(r => r.seatApproach),
    exiled: agg(r => r.exiled),
    medianDays: med(rows.map(r => r.days || 0)),
  };
  console.log(`\n=== journey-endgame-r8 pilot === policies=[${POLICIES.join(',')}] seeds=[${SEEDS.join(',')}] days=${DAYS}`);
  console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.wins}/${s.runs} seatApproach ${s.seatApproach}/${s.runs} medianDays ${s.medianDays} exiled ${s.exiled}/${s.runs}`);
  console.log(`GO check (pilot): ${s.seatApproach >= 1 ? 'GO — expand to leadcourt' : 'NO-GO — document and move on'}`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
