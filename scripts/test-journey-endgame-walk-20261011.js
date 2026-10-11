#!/usr/bin/env node
// test-journey-endgame-walk-20261011.js — endgame-leg SENSE walkthrough (2026-10-11).
// Walks the table's played challenges beat-by-beat on constructed lesser-seat
// games and dumps FULL transcripts for sense-reading (SENSE-TESTING LAW).
// Covers the paths the win-path e2e didn't: beloved/light (variety finale),
// relay/dark (the merge), relay hollow->quarantine->downgrade->assimilated
// (failure resolution), witness/light (villager testimony = people check),
// feared/dark curdle->downgrade, and the ARCHITECT/PANTHEON/OUTSHONE epilogues.
// Sense instrument, not a pass/fail gate: exits 0 when every chain completes.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(parseInt(process.env.SEED || '20261011', 10));
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

let transcript = [];
Game.say = function (t) { transcript.push(String(t)); };
Game.sysSay = function (t) { transcript.push('SYS: ' + String(t)); };
Game.wipe = function () { transcript.push('(wipe — run ends)'); };
Game.save = function () {};
Game.startCombat = function () {};

function setupGame(opts) {
  opts = opts || {};
  transcript = [];
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null; pg.sysBond = opts.sysBond || 0;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
  Game.state.scholar.day = 105;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = opts.integration || 55;
  Game.state.networkLive = true;
  Game.state.scholar.grounding = (opts.grounding != null ? opts.grounding : 100);
  pg.sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  const faced = {};
  const bars = opts.fullSeat ? [[1, 5], [2, 5], [3, 4], [4, 3], [5, 2]] : [[1, 4], [2, 4], [3, 3]];
  bars.forEach(([w, n]) => { for (let i = 0; i < n; i++) faced['w' + w + 'm' + i] = w; });
  pg.deeds = { wavesFaced: faced, contestsSurvived: opts.fullSeat ? 3 : 2 };
  pg.crises = opts.fullSeat ? { c1: 1, c2: 1, c3: 1 } : { c1: 1, c2: 1 };
  pg.ledger = opts.ledger;
  Game.state.village.promises = opts.promises || {};
  Game.state.village.favorLedger = {};
  Game.state.village.trust = {};
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  roster.forEach((id, i) => { Game.state.village.trust[id] = 40 + (i * 5) % 40; });
  Game.state.village.viewership = 20;
  // Reset relay/office state between scenarios (fresh game each walk).
  Game.state.switchboard = null;
  Game.state.pendingSwitchboard = null;
  Game.state.scholar.relay = null;
  Game.state.scholar.relayAbils = null;
  if (opts.relayAbils) Game.state.scholar.relayAbils = Object.assign({}, opts.relayAbils);
  if (opts.claimRelay) Game.claimRelay();
  // texture: two dead villagers
  Game.state.village.dead = Game.state.village.dead || {};
  if (roster[8]) Game.state.village.dead[roster[8]] = { cause: 'combat', day: 61 };
  if (roster[9]) Game.state.village.dead[roster[9]] = { cause: 'starvation', day: 77 };
  return roster;
}
function fireTable() {
  const pg = Game.progState();
  pg.arc = 3; pg.arcSeen = { 1: true, 2: true, 3: true };
  Game.checkArc();
  Game.tableScene();
}
// Ascension scaffolding: returns {facilitatedId, unbackedId}
function setupAscension(roster, facilitate) {
  const mk = (idx, nAbil, trust, bold, kb) => {
    const vid = roster[idx];
    const v = (Game.data.villagers || []).find(x => x.id === vid) || {};
    v.abilities = []; for (let i = 0; i < nAbil; i++) v.abilities.push({ id: 'abil' + i });
    v.knowledgeBreadth = kb;
    if (bold) v.traits = Object.assign({}, v.traits, { bold: true });
    Game.state.village.trust[vid] = trust;
    return vid;
  };
  const a = mk(2, 3, 55, true, 12);
  const b = mk(3, 2, 45, false, 22);
  if (facilitate) { Game.tableFacilitate('teach', a); Game.tableFacilitate('shield', a); }
  return { a, b };
}
function stripHtml(h) {
  return String(h || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
function walkPath(pathId, beatPicks, finalPick) {
  // beatPicks: array of choice-id preference lists, one per beat.
  // finalPick: preferred final id.
  Game.chooseTableOption('path:' + pathId);
  let guard = 0;
  while (guard++ < 40) {
    const T = Game.tableState();
    if (T.phase === 'done') break;
    if (T.phase === 'downgrade') {
      const tc = Game.state.scholar.tableChoices;
      const opts = (tc && tc.options) || [];
      transcript.push(`(DOWNGRADE offered: ${opts.map(o => o.id).join(', ')})`);
      const pick = opts.find(o => o.id === 'downgrade:assimilated') || opts[0];
      if (!pick) { transcript.push('!! no downgrade options'); break; }
      transcript.push(`(taking downgrade: ${pick.id})`);
      Game.chooseTableOption(pick.id);
      continue;
    }
    if (T.phase === 'finals') {
      const tc = Game.state.scholar.tableChoices;
      const opts = (tc && tc.options) || [];
      transcript.push(`(FINALS: ${(opts.map(o => o.id)).join(', ')})`);
      const pick = opts.find(o => o.id === 'final:' + finalPick) || opts[0];
      if (!pick) { transcript.push('!! no final options'); break; }
      transcript.push(`(final choice: ${pick.id})`);
      Game.chooseTableOption(pick.id);
      continue;
    }
    if (T.phase !== 'challenge') { transcript.push('!! unexpected phase ' + T.phase); break; }
    const tc = Game.state.scholar.tableChoices;
    // Capture the beat's modal prompt (the beat say text lives here, not in say()).
    if (tc && tc.prompt) transcript.push('[PROMPT beat ' + T.beat + '] ' + stripHtml(tc.prompt).slice(0, 900));
    const opts = (tc && tc.options) || [];
    const prefs = beatPicks[T.beat] || beatPicks[beatPicks.length - 1] || [];
    let pick = null;
    for (const id of prefs) { pick = opts.find(o => o.id === 'beat:' + id); if (pick) break; }
    if (!pick) pick = opts[0];
    if (!pick) { transcript.push('!! no options at beat ' + T.beat); break; }
    transcript.push(`(beat ${T.beat} choice: ${pick.id} — ${pick.label})`);
    Game.chooseTableOption(pick.id);
  }
  const T = Game.tableState();
  return { phase: T.phase, path: T.path, branch: T.branch, won: !!Game.won, over: !!Game.over };
}
function lightLedger() {
  return { might: 4, brokerage: 2, showmanship: 8, embrace: 0, defiance: 0, exposed: 4, unified: 3, fractured: 0, foodShared: 6, foodHoarded: 0, protected: 7, killed: 2, betrayed: 0 };
}
function darkLedger() {
  return { might: 8, brokerage: 1, showmanship: 6, embrace: 1, defiance: 2, exposed: 5, unified: 0, fractured: 2, foodShared: 1, foodHoarded: 4, protected: 1, killed: 12, betrayed: 1 };
}

const summary = [];
async function main() {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  // 1. BELOVED/light — the variety finale + ARCHITECT/PANTHEON
  {
    const roster = setupGame({ ledger: lightLedger(), promises: { p1: { kept: true } } });
    setupAscension(roster, true);
    transcript.push('########## 1. BELOVED / light ##########');
    fireTable();
    const r = walkPath('beloved', [['hunter'], ['song'], ['quiet']], 'quiet');
    summary.push(['beloved/light', r]);
    fs.writeFileSync('/tmp/endgame-walk-beloved-light.txt', transcript.join('\n\n'));
  }
  // 2. RELAY/dark — the merge
  {
    const roster = setupGame({
      ledger: darkLedger(), claimRelay: true, grounding: 45, sysBond: 2,
      relayAbils: { rewriteUses: 3, skimUses: 2, translateUses: 1 },
    });
    transcript.push('########## 2. RELAY / dark ##########');
    fireTable();
    const r = walkPath('relay', [['deepen'], ['efficient'], ['probe'], ['commune']], 'voice');
    summary.push(['relay/dark', r]);
    fs.writeFileSync('/tmp/endgame-walk-relay-dark.txt', transcript.join('\n\n'));
  }
  // 3. RELAY hollow -> quarantine -> downgrade -> assimilated
  {
    const roster = setupGame({
      ledger: darkLedger(), claimRelay: true, grounding: 28, sysBond: 2,
      relayAbils: { rewriteUses: 2 },
    });
    transcript.push('########## 3. RELAY hollow -> downgrade ##########');
    fireTable();
    const r = walkPath('relay', [['deepen'], ['deepen'], ['probe'], ['commune']], 'grief');
    summary.push(['relay/hollow->assimilated', r]);
    fs.writeFileSync('/tmp/endgame-walk-relay-hollow.txt', transcript.join('\n\n'));
  }
  // 4. WITNESS/light — testimony (people check)
  {
    const roster = setupGame({ ledger: lightLedger(), promises: { p1: { kept: true } } });
    const { b } = setupAscension(roster, false); // unbacked ascension -> OUTSHONE
    transcript.push('########## 4. WITNESS / light ##########');
    fireTable();
    const r = walkPath('witness', [['cold'], ['let'], ['public']], 'charges');
    summary.push(['witness/light+outshone', r]);
    fs.writeFileSync('/tmp/endgame-walk-witness-light.txt', transcript.join('\n\n'));
  }
  // 5. FEARED/dark curdle -> downgrade
  {
    const roster = setupGame({ ledger: darkLedger() });
    transcript.push('########## 5. FEARED / dark curdle ##########');
    fireTable();
    const r = walkPath('feared', [['kill'], ['lean'], ['name']], 'example');
    summary.push(['feared/dark->downgrade', r]);
    fs.writeFileSync('/tmp/endgame-walk-feared-dark.txt', transcript.join('\n\n'));
  }
  // 6. DEFIANT poor-state stall -> downgrade
  // long-road (shared) covers the FIRST unpaid price; the second one stalls.
  {
    const roster = setupGame({ ledger: Object.assign(darkLedger(), { defiance: 6 }) });
    Game.state.village.pantry = []; // too thin for the harvest tribute
    Game.state.village.trust = {}; // no one left to name for the relay
    transcript.push('########## 6. DEFIANT stall ##########');
    fireTable();
    const r = walkPath('defiant', [['harvest'], ['name'], ['overlay'], ['notwice']], 'walk');
    summary.push(['defiant/stall->downgrade', r]);
    fs.writeFileSync('/tmp/endgame-walk-defiant-stall.txt', transcript.join('\n\n'));
  }

  console.log('=== WALKTHROUGH SUMMARY ===');
  for (const [name, r] of summary) {
    console.log(`${name}: phase=${r.phase} path=${r.path} branch=${r.branch} won=${r.won}`);
  }
  const incomplete = summary.filter(([n, r]) => r.phase !== 'done');
  if (incomplete.length) { console.log('INCOMPLETE: ' + incomplete.map(([n]) => n).join(', ')); process.exit(1); }
  console.log('All chains completed. Transcripts in /tmp/endgame-walk-*.txt');
}
main().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
