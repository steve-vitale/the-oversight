#!/usr/bin/env node
// journey-succession.js — SUCCESSION LEG (7): death of the player character,
// the mantle passing, the new bearer's life.
//
// Plays a COMPETENT 22-day run (established village: knowledge, trust,
// pantry, specialists), then kills the player through the REAL death handler
// (Game.playerDeath — the same function combat loss, starvation, encounters,
// contests and the pit trap all call), then plays 18 more days as the
// SUCCESSOR. Answers:
//   1. Does the mantle pass sensically? (full death-beat transcript)
//   2. Do the invariants hold? (own kit, fresh body, Codex/progression kept)
//   3. Does the new bearer's life work? (census after, conversations, gossip)
//   4. Does the village-lost path fire when nobody is left? (separate game)
//   5. Do villagers treat the successor as a NEW person? (transcript sense)
// Usage: SEEDS=101-105 node scripts/journey-succession.js
//        DAYS1=22 DAYS2=18 node scripts/journey-succession.js
// Output: one JSON line per seed to stdout; transcripts + census to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DAYS1 = parseInt(process.env.DAYS1 || '22', 10);
const DAYS2 = parseInt(process.env.DAYS2 || '18', 10);
function parseSeeds() {
  const s = process.env.SEEDS || '101-105';
  const out = [];
  for (const part of s.split(',')) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else if (/^\d+$/.test(part)) out.push(+part);
  }
  return out;
}

function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function occOf(Game, vid) {
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid] || {};
    return rc.occupationId || rc.occupation || '?';
  } catch (e) { return '?'; }
}
function census(Game, label) {
  const v = Game.state.village || {}, s = Game.state.scholar || {};
  const lines = [`--- CENSUS (${label}), day ${s.day || 0}, Bearer: ${rawName(Game, Game.villagerId)} ---`];
  for (const vid of (v.roster || [])) {
    const alive = (v.roster || []).includes(vid);
    const trust = ((v.trust || {})[vid] == null ? '?' : (v.trust[vid]));
    lines.push(`  ${alive ? 'alive' : 'DEAD '} ${rawName(Game, vid)} [${occOf(Game, vid)}] trust=${trust}`);
  }
  const fallen = (v.fallen || []).map(f => `${rawName(Game, f.villagerId) || f.name || '?'} d${f.day} (${f.cause})`);
  lines.push(`  fallen: ${fallen.length ? fallen.join('; ') : 'none'}`);
  lines.push(`  codex breadth: ${Object.keys((Game.state.codex || {}).plants || {}).length} plants, ` +
    `${Object.keys((Game.state.codex || {}).skills || {}).length} skills, ` +
    `${Object.keys((Game.state.codex || {}).monsters || {}).length} monsters`);
  lines.push(`  pantry: ${Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)))} kcal`);
  lines.push(`  slots: ${Game.abilitySlots ? Game.abilitySlots() : '?'} abilities held: ${((s.abilities || []).length)}`);
  return lines.join('\n');
}

// Natural-path conversation driver (same policy as crisis-convo): answer
// their question, engage the want, ask about the situation, then leave.
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [];
  out.push(`## ${tag} — talking to ${rawName(Game, vid)} [${occOf(Game, vid)}]`);
  try { Game.startConvo(vid); } catch (e) { return out.join('\n') + ' (startConvo threw: ' + e.message + ')'; }
  const snap = (label) => {
    const c = Game.convoGet(vid);
    out.push(`--- ${label} ---`);
    for (const e of (c.transcript || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
    const ch = (Game.convoChoices(vid) || []).map(x => `[${x.id}] ${x.text || ''}`.slice(0, 110));
    out.push(`CHOICES (${ch.length}): ${ch.slice(0, 8).join(' | ')}`);
    out.push('');
  };
  snap('opening');
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => /how|feeling|holding|news|day|worried|afraid|hungry|miss|died|gone|grief|sad|angry/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${pick.text || ''}`);
    try { Game.convoTurn(vid, pick.id); }
    catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  out.push(`FINAL: want=${(c && c.want && c.want.id) || 'none'} resolution=${(c && c.want && c.want.resolution) || 'n/a'}`);
  out.push('\n### FULL TRANSCRIPT');
  for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
  return out.join('\n');
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession', fullTelemetry: true });
  // transcript capture: wrap say AFTER loadGame (it no-ops it), before play
  const says = [];
  const keepSay = (t) => { says.push(String(t)); if (says.length > 4000) says.splice(0, 1000); };
  Game.say = keepSay;
  Game.sysSay = keepSay;
  await setupGame(Game);
  const rec = { seed, pre: {}, death: {}, post: {}, convo: [], checks: [] };
  const check = (id, ok, detail) => rec.checks.push({ id, ok: !!ok, detail: detail || '' });

  // ---- PART 1: a real village for DAYS1 days ----
  await runDays(Game, competent, { days: DAYS1 });
  const s0 = Game.state.scholar, v0 = Game.state.village;
  rec.pre = {
    day: s0.day, bearer: rawName(Game, Game.villagerId), Bearer: Game.villagerId,
    roster: (v0.roster || []).length,
    codex: Object.keys((Game.state.codex || {}).plants || {}).length,
    skills: Object.keys((Game.state.codex || {}).skills || {}).length,
    slots: Game.abilitySlots(), abilities: (s0.abilities || []).map(a => a.id || a),
    inventory: (s0.inventory || []).map(i => i.itemId || i.id || i.name),
    trustMean: (() => { const t = Object.values(v0.trust || {}); return t.length ? +(t.reduce((a, b) => a + b, 0) / t.length).toFixed(1) : null; })(),
  };
  rec.censusPre = census(Game, 'BEFORE DEATH');
  const sayMark = says.length;

  // ---- PART 2: the death ----
  const oldId = Game.villagerId;
  const oldName = rawName(Game, oldId);
  const oldTrust = (v0.trust || {})[oldId];
  const oldInvIds = new Set((s0.inventory || []).map(i => i.itemId || i.id || i.name));
  const sentimentalsBefore = (s0.inventory || []).filter(i => i.bonded || i.sentimental).length;
  const codexBreadthBefore = JSON.stringify({
    p: Object.keys((Game.state.codex || {}).plants || {}).sort(),
    m: Object.keys((Game.state.codex || {}).monsters || {}).sort(),
    sk: Object.keys((Game.state.codex || {}).skills || {}).sort(),
  });
  const abilitiesBefore = (s0.abilities || []).map(a => a.id || a).sort().join(',');
  const lineageBefore = Game.lineage().length;
  Game.playerDeath('the hunt'); // the real handler every death path calls
  const s1 = Game.state.scholar, v1 = Game.state.village;
  const newId = Game.villagerId;
  const newName = rawName(Game, newId);
  rec.death = {
    day: s1.day, oldBearer: oldName, newBearer: newName, over: !!Game.over, villageLost: !!Game.villageLost,
    beat: says.slice(sayMark), // FULL death-beat transcript
  };
  // ---- invariants ----
  check('lineage-entry', Game.lineage().length === lineageBefore + 1,
    `lineage ${lineageBefore} -> ${Game.lineage().length}`);
  const lin = Game.lineage()[Game.lineage().length - 1] || {};
  check('lineage-cause', (lin.cause || lin.note || '').includes('hunt') || JSON.stringify(lin).includes('hunt'), JSON.stringify(lin).slice(0, 160));
  check('fallen-roll', (v1.fallen || []).some(f => f.villagerId === oldId), JSON.stringify((v1.fallen || []).slice(-1)));
  const corpses = (Game.state.corpses || []);
  const corpse = corpses.find(c => (c.villagerId === oldId) || (c.name || '').includes(oldName.split(' ')[0]));
  check('corpse-made', !!corpse, corpse ? `${corpse.name} pack=${(corpse.items || []).length}` : 'no corpse found');
  if (corpse) {
    const packIds = new Set((corpse.items || []).map(i => i.itemId || i.id || i.name));
    const carriedOver = (s1.inventory || []).filter(i => oldInvIds.has(i.itemId || i.id || i.name) && !i.bonded);
    check('no-auto-transfer', carriedOver.length === 0, `old gear in new inventory: ${carriedOver.length}`);
    const packSent = (corpse.items || []).filter(i => i.bonded || i.sentimental);
    check('sentimentals-buried', packSent.length === 0, `bonded items on corpse: ${packSent.length}`);
  }
  check('fresh-kcal', s1.kcal === 1500, `kcal=${s1.kcal}`);
  let mh = 100; try { mh = Game.maxHealth(); } catch (e) {}
  check('fresh-health', s1.health === mh, `health=${s1.health} max=${mh}`);
  check('fresh-afflictions', (s1.statuses || []).length === 0 && (s1.diseases || []).length === 0 && (s1.poisons || []).length === 0,
    `statuses=${(s1.statuses || []).length} diseases=${(s1.diseases || []).length} poisons=${(s1.poisons || []).length}`);
  check('body-counters-reset', !s1.feastBuff && !s1.rageActive && !s1.bloodPriceWound, 'feast/rage/bloodprice cleared');
  // successor's OWN kit, <= 5, bonded
  const inv = s1.inventory || [];
  check('own-kit', inv.length <= 5 && inv.every(i => i.bonded), `inv=${inv.length} allBonded=${inv.every(i => i.bonded)}`);
  // background abilities match THEIR occupation
  try {
    const newChar = (Game.data.villagers || []).find(x => x.id === newId) || {};
    const occ = ((Game.data.characterGen || {}).occupations || []).find(o => o.id === newChar.occupationId) || {};
    const granted = (occ.granted || []);
    const bg = (s1.backgroundAbilities || []).map(a => a.id || a);
    check('background-abilities', granted.length === 0 || granted.every(g => bg.includes(g)),
      `occ=${newChar.occupationId} granted=[${granted}] bg=[${bg}]`);
  } catch (e) { check('background-abilities', false, 'threw: ' + e.message); }
  // progression passes: codex + system abilities + slots
  const codexBreadthAfter = JSON.stringify({
    p: Object.keys((Game.state.codex || {}).plants || {}).sort(),
    m: Object.keys((Game.state.codex || {}).monsters || {}).sort(),
    sk: Object.keys((Game.state.codex || {}).skills || {}).sort(),
  });
  check('codex-kept', codexBreadthBefore === codexBreadthAfter, 'breadth identical');
  const abilitiesAfter = (s1.abilities || []).map(a => a.id || a).sort().join(',');
  check('system-abilities-kept', abilitiesBefore === abilitiesAfter, `before=[${abilitiesBefore}] after=[${abilitiesAfter}]`);
  check('trust-discounted', (v1.trust || {})[newId] === Math.round((oldTrust == null ? 20 : oldTrust) * 0.6),
    `oldTrust=${oldTrust} new=${(v1.trust || {})[newId]}`);
  check('identity-sync', s1.villagerId === newId, `s.villagerId=${s1.villagerId}`);
  check('at-hall', s1.mx === 4 && s1.my === 4 && s1.insideHaven === true, `mx=${s1.mx} my=${s1.my} insideHaven=${s1.insideHaven}`);
  check('mantle-continues', !Game.over && !Game.villageLost, `over=${Game.over} villageLost=${Game.villageLost}`);

  // ---- PART 3: the new bearer's life ----
  rec.censusPost = census(Game, 'AFTER DEATH (new bearer)');
  await runDays(Game, competent, { days: DAYS2 });
  rec.post = {
    day: s1.day, bearer: rawName(Game, newId),
    roster: ((Game.state.village || {}).roster || []).length,
    codex: Object.keys((Game.state.codex || {}).plants || {}).length,
    stillBearer: Game.villagerId === newId,
  };
  rec.censusLater = census(Game, 'SUCCESSOR +18 DAYS');
  // conversations: the mourner + one other villager
  try {
    const roster = (Game.state.village.roster || []).filter(id => id !== newId);
    const trust = Game.state.village.trust || {};
    const byTrust = roster.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
    if (byTrust[0]) rec.convo.push(driveConvo(Game, byTrust[0], 'SUCCESSION — successor talks to highest-trust villager'));
    if (byTrust[1]) rec.convo.push(driveConvo(Game, byTrust[1], 'SUCCESSION — successor talks to a second villager'));
  } catch (e) { rec.convo.push('(convo drive threw: ' + e.message + ')'); }
  return rec;
}

// village-lost path: only the player left, nobody to take the mantle
async function villageLostTest() {
  const { Game } = await loadGame({ seed: 999, mode: 'journey-succession-lost', fullTelemetry: false });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const ids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  for (const id of ids) { try { Game.removeVillager(id, 'test'); } catch (e) {} }
  const before = (Game.state.village.roster || []).length;
  let threw = null;
  try { Game.playerDeath('the last hunt'); } catch (e) { threw = e.message; }
  return {
    rosterBefore: before, rosterAfter: (Game.state.village.roster || []).length,
    over: !!Game.over, villageLost: !!Game.villageLost, threw,
  };
}

(async () => {
  const seeds = parseSeeds();
  const out = [];
  for (const seed of seeds) {
    try {
      const rec = await playSeed(seed);
      out.push(rec);
      console.error(`\n===== SEED ${seed} =====`);
      console.error(rec.censusPre);
      console.error('\n--- DEATH BEAT (full transcript) ---');
      for (const t of rec.death.beat) console.error('  ' + t.replace(/\n/g, '\n  '));
      console.error('\n' + rec.censusPost);
      console.error('\n' + rec.censusLater);
      console.error('\n--- CHECKS ---');
      for (const c of rec.checks) console.error(`  [${c.ok ? 'OK' : 'FAIL'}] ${c.id}${c.detail ? ' — ' + c.detail : ''}`);
      for (const c of rec.convo) { console.error('\n' + c); }
      console.log(JSON.stringify({ seed, pre: rec.pre, death: { day: rec.death.day, oldBearer: rec.death.oldBearer, newBearer: rec.death.newBearer, over: rec.death.over }, post: rec.post, checks: rec.checks }));
    } catch (e) {
      console.error(`SEED ${seed} THREW: ${e.stack}`);
      console.log(JSON.stringify({ seed, error: e.message }));
    }
  }
  try {
    const lost = await villageLostTest();
    console.error('\n===== VILLAGE-LOST TEST =====');
    console.error(JSON.stringify(lost));
    console.log(JSON.stringify({ villageLostTest: lost }));
  } catch (e) { console.error('VILLAGE-LOST TEST THREW: ' + e.stack); }
})();
