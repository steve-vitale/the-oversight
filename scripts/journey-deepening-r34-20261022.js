// journey-deepening-r34-20261022.js -- DEEPENING leg R34:
// THE ALIEN-POOL ABILITY PROOF, wild end-to-end. P1 (probe-alien-abilities)
// proved each ability fires on its real trigger path (13/13). This is P2:
// 4 competent seeds, DAYCAP=100 — do natural alien-pool infections land, and
// do the abilities then fire in the wild? Plus the standard leg census:
// village assessment, people check (transcripts), death census.
//
// Instruments: harness-only wraps, zero src/js.
// Usage: SEEDS=9971,9972,9973,9974 node scripts/journey-deepening-r34-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [9971, 9972, 9973, 9974]);
const DAYCAP = parseInt(process.env.DAYCAP || '100', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { census, r21Misread } = require('./lib/death-census');

const EVIDIR = path.join(ROOT, 'evidence', '2026-10-22');
const ALIEN_STATUSES = ['eurika', 'east_nile', 'lemons'];
const ABILITY_RX = {
  crow: /crows are screaming/i,
  sense: /skin prickles before your eyes catch up|no ambush [—-] your skin knew first|no ambush [—-] the hairs knew first/i,
  engorge: /occupied joints drink deeper/i,
};

let capture = [];
let abilityLines = [];
let _G = null;
let _currentSeed = null;
let alienInfections = [];  // natural applyStatus hits for the 3 alien-pool statuses
let abilityFires = [];     // narration lines matching ABILITY_RX
let deathReg = [];
let transcriptFiles = [];

function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  for (const k of Object.keys(ABILITY_RX)) {
    if (ABILITY_RX[k].test(s)) { abilityFires.push({ day: gday(), kind: k, line: s.slice(0, 160) }); abilityLines.push(`[d${gday()}] ${s}`); break; }
  }
}
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }
function popAlive() { try { return (_G.state.village.roster || []).filter(id => !person(id).dead).length; } catch (e) { return null; } }
function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    // ARRAY-AWARE (r31/r32 bug fixed): villager statuses are a list, not a map
    let statuses = [];
    try {
      const sts = (p.statuses || p.conditions || []);
      statuses = (Array.isArray(sts) ? sts : Object.keys(sts)).map(s => (s && s.id) || String(s)).filter(s => ALIEN_STATUSES.indexOf(s) >= 0);
    } catch (e) {}
    return { id, name: vname(id), alive: !p.dead, occupation: p.formerOccupation || p.occupation || null,
      trust: (trust[id] !== undefined) ? trust[id] : null, plantsKnown: plants, alienStatuses: statuses };
  });
}

// ---- conversation driver (engage-first, 8 turns; r30 behavior, r32b filenames) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
const GQYN = ['gq:yn:unsure', 'gq:yn:honest_pass', 'gq:yn:no', 'gq:yn:yes'];
function pickChoice(choices, turn) {
  const list = choices || [];
  if (turn === 0) {
    const acc = list.find(x => x && x.id === 'betrayal:accept');
    if (acc) return acc;
    const dec = list.find(x => x && x.id === 'betrayal:decline');
    if (dec && list.every(x => !x || !ENGAGE.includes(x.id))) return dec;
  }
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of GQYN) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(day, vid, tag) {
  // PER-VILLAGER filenames (r32b fix adopted): the r32 sampler overwrote one
  // file per seed — only 1 transcript/seed survived.
  const safeVid = String(vid).replace(/[^a-zA-Z0-9_-]/g, '');
  const fp = path.join(EVIDIR, `journey-deepening-r34-transcript-competent-${_currentSeed}-day${day}-${safeVid}${tag || ''}.txt`);
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
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      if (turn === 0) log(`(turn0 choices: ${(choices || []).map(c => c && c.id).join(', ') || 'NONE'})`);
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
  } catch (e) { log('CONVO ERROR: ' + (e && e.stack || e)); }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  transcriptFiles.push(fp);
  return fp;
}

function makePolicy() {
  const policy = Object.create(competent);
  policy.id = 'journey-deepening-r34-competent';
  return policy;
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = []; abilityLines = [];
  alienInfections = []; abilityFires = [];
  deathReg = []; transcriptFiles = [];
  console.log(`\n########## SEED ${seed} (alien-pool wild end-to-end) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r34', fullTelemetry: true });
  _G = Game;

  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }

  // applyStatus wrap: natural alien-pool infections (target, status, source, day)
  try {
    if (typeof Game.applyStatus === 'function') {
      const _as = Game.applyStatus.bind(Game);
      Game.applyStatus = function (target, id, opts) {
        try {
          if (ALIEN_STATUSES.indexOf(String(id)) >= 0) {
            const tdesc = (target === 'scholar' || target === 'p') ? 'scholar'
              : (target && typeof target === 'object' ? (target.name || target.vid || target.id || '?') : String(target)).slice(0, 40);
            alienInfections.push({ day: gday(), target: tdesc, id: String(id), source: String((opts && opts.source) || '').slice(0, 120) });
            console.log(`*** ALIEN-INFECTION d${gday()}: ${tdesc} <- ${id} (src: ${String((opts && opts.source) || '').slice(0, 60)})`);
          }
        } catch (e0) {}
        return _as.apply(this, arguments);
      };
    }
  } catch (e) { console.log('applyStatus wrap ERROR: ' + (e && e.message)); }

  // registerDeath wrap: kind-aware death census (r27 lib)
  try {
    if (typeof Game.registerDeath === 'function') {
      const _rd = Game.registerDeath.bind(Game);
      Game.registerDeath = function (opts) {
        try {
          const o = opts || {};
          deathReg.push({ day: gday(), kind: o.kind || '?', cause: o.cause || '?',
            killerId: (o.killerId == null ? null : String(o.killerId)),
            vid: o.villagerId != null ? String(o.villagerId) : null,
            monsterId: o.monsterId != null ? String(o.monsterId) : null,
            who: o.villagerId || o.monsterId || o.name || '?', name: o.name || null, player: !!o.player });
        } catch (e0) {}
        return _rd.apply(this, arguments);
      };
    }
  } catch (e) { console.log('registerDeath wrap ERROR: ' + (e && e.message)); }

  await setupGame(Game);
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r34', date: new Date().toISOString().slice(0, 10), node: process.version } });

  // people check: up to 3 living villagers, end-state conversations
  try {
    const living = ((_G.state.village.roster || []).filter(id => !person(id).dead)).slice(0, 3);
    for (const vid of living) runConversation(result.gameDays, vid, '-end');
  } catch (e) { console.log('convo sampling ERROR: ' + (e && e.message)); }

  const endCensus = buildCensus();
  const alienHolders = endCensus.filter(c => (c.alienStatuses || []).length > 0);
  // scholar statuses: ARRAY-AWARE read (r31 bug: Object.keys on an array)
  let scholarAlien = [];
  try {
    const s = _G.state.scholar || {};
    const sts = s.statuses || s.conditions || [];
    scholarAlien = (Array.isArray(sts) ? sts : Object.keys(sts)).map(x => (x && x.id) || String(x)).filter(id => ALIEN_STATUSES.indexOf(id) >= 0);
  } catch (e) {}

  const rosterIds = (((Game.state || {}).village || {}).roster || []);
  const dcFull = census(deathReg, { playerId: 'p', roster: rosterIds });
  const dcWindow = census(deathReg.filter(d => (d.day || 0) >= 40), { playerId: 'p', roster: rosterIds });

  const fires = { crow: 0, sense: 0, engorge: 0 };
  for (const f of abilityFires) fires[f.kind] = (fires[f.kind] || 0) + 1;
  const out = {
    seed, policy: 'competent', maxGameDay: result.gameDays, endReason: result.endReason, finalWave: waveNow(),
    alienInfections,
    abilityFires: { crow: fires.crow, sense: fires.sense, engorge: fires.engorge, events: abilityFires },
    wildEndToEnd: alienInfections.length > 0 && (fires.crow + fires.sense + fires.engorge) > 0,
    holdersAtEnd: { villagers: alienHolders.map(c => ({ id: c.id, name: c.name, statuses: c.alienStatuses })), scholar: scholarAlien },
    census: endCensus,
    deathCensus: { full: dcFull, window: dcWindow, windowFloor: 40, records: deathReg.length },
    deaths: deathReg.map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    transcripts: transcriptFiles,
    pacing: result.pacing || null,
  };
  const fp = path.join(EVIDIR, `journey-deepening-r34-competent-${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  try { fs.writeFileSync(path.join(EVIDIR, `journey-deepening-r34-abilitylines-competent-${seed}.txt`), abilityLines.join('\n')); }
  catch (e) { console.log('abilitylines dump ERROR: ' + (e && e.message)); }
  try {
    let txt = capture.join('\n');
    if (txt.length > 1024 * 1024) txt = '[HEAD TRUNCATED — see abilitylines file]\n' + txt.slice(-1024 * 1024);
    fs.writeFileSync(path.join(EVIDIR, `journey-deepening-r34-capture-competent-${seed}.txt`), txt);
  } catch (e) { console.log('capture dump ERROR: ' + (e && e.message)); }
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} pop=${popAlive()} ` +
    `alienInf=${alienInfections.length} abilityFires=${JSON.stringify(fires)} wildE2E=${out.wildEndToEnd} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  let totInf = 0, totCrow = 0, totSense = 0, totEng = 0, alive = 0, e2e = 0;
  for (const s of summary) {
    const af = s.abilityFires || {};
    totInf += (s.alienInfections || []).length;
    totCrow += af.crow || 0; totSense += af.sense || 0; totEng += af.engorge || 0;
    if (!s.fatal && s.endReason === 'survived') alive++;
    if (s.wildEndToEnd) e2e++;
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} ` +
      `alienInf=${(s.alienInfections || []).length} crow=${af.crow || 0} sense=${af.sense || 0} engorge=${af.engorge || 0} e2e=${!!s.wildEndToEnd}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
  console.log(`TOTALS: alienInfections=${totInf} crow=${totCrow} sense=${totSense} engorge=${totEng} wildE2E=${e2e}/${summary.length} alive=${alive}/${summary.length}`);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
