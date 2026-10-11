#!/usr/bin/env node
// journey-crisis-convo-20261011.js — PEOPLE CHECK for the crisis leg.
// Dumps FULL conversation transcripts in four crisis contexts:
//   A. famine    — pantry empty, villager starving; talk to them
//   B. disease   — villager has gutrot (mundane pool); talk to them
//   C. grief     — a villager just died (monster); talk to a mourner
//   D. succession — the player just died; the NEW bearer talks to a villager
// Each run: fresh game, deterministic SEED, a natural choice path
// (answer their question, ask about the crisis, then leave).
// Usage: node scripts/journey-crisis-convo-20261011.js [A|B|C|D|all]
// Output goes to stdout (markdown-ish, full transcripts).
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
const SEED = parseInt(process.env.SEED || '20261011', 10);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window;
const Game = globalThis.Scattering.Game;

const says = [];
function setup() {
  says.length = 0;
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = (t) => { says.push(String(t)); };
  Game.state.scholar.kcal = 50000;
  Game.state.village.trust = Game.state.village.trust || {};
}
const roster = () => (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
const personObj = (vid) => ((Game.state.village || {}).rosterChars || {})[vid] || {};
const pname = (vid) => { try { return Game.displayName(vid); } catch (e) { return String(vid).slice(0, 10); } };

// Natural-path driver: answer their hanging question, then engage the want,
// then ask about the crisis situation, then leave. Prints every turn.
function drive(vid, tag, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [];
  out.push(`## ${tag} — talking to ${pname(vid)}\n`);
  Game.startConvo(vid);
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
    // 1. answer their question first (gq: = generic question they asked me)
    let pick = choices.find(c => /^gq:/.test(c.id));
    // 2. engage the want (help/details/want)
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    // 3. ask about them / situation
    if (!pick) pick = choices.find(c => /how|feeling|holding|news|day|worried|afraid|hungry|sick/i.test(c.text || ''));
    // 4. anything but leave/repeat-bye
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
  out.push(`FINAL: want=${(c.want && c.want.id) || 'none'} resolution=${(c.want && c.want.resolution) || 'n/a'}`);
  out.push(`seed planted: ${JSON.stringify((Game.state.village.convoSeeds || {})[vid] || null)}`);
  out.push(`obligation: ${JSON.stringify((Game.state.village.promises || {})[vid] || null)}`);
  out.push(`\n### FULL TRANSCRIPT (${(c.transcript || []).length} exchanges)`);
  for (const e of (c.transcript || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
  return out.join('\n');
}

async function scenarioA() {
  setup();
  const v = Game.state.village;
  v.pantry = []; // the pantry is an echo
  try { (Game.progState().hungryStreak = 3); } catch (e) {}
  const ids = roster();
  for (const id of ids) { try { Game.npcNeeds(id).hunger = 90; } catch (e) {} }
  try { Game.state.village.trust[ids[0]] = 40; } catch (e) {}
  return drive(ids[0], 'A. FAMINE — the pantry is empty, they are starving');
}

async function scenarioB() {
  setup();
  const ids = roster();
  const vid = ids[1] || ids[0];
  // the engine's own villager-disease path: v.sick records (dirty water,
  // wounds, ticks) — NOT a player-style status effect
  const v = Game.state.village;
  v.sick = v.sick || {};
  v.sick[vid] = { name: 'gut rot', daysLeft: 4, severity: 2 };
  try { Game.state.village.trust[vid] = 30; } catch (e) {}
  return drive(vid, 'B. DISEASE — they have gut rot (mundane pool, v.sick record)');
}

async function scenarioC() {
  setup();
  const ids = roster();
  const dead = ids[0], mourner = ids[1] || ids[2];
  Game.registerDeath({ kind: 'person', villagerId: dead, name: pname(dead), cause: 'a hushwolf' });
  try { Game.state.village.trust[mourner] = 40; } catch (e) {}
  return drive(mourner, `C. GRIEF — ${pname(dead)} just died (monster); talking to ${pname(mourner)}`);
}

async function scenarioD() {
  setup();
  const before = pname(Game.villagerId);
  const ids = roster();
  const friend = ids[0];
  try { Game.state.village.trust[friend] = 70; } catch (e) {}
  Game.playerDeath('the hunt');
  const after = pname(Game.villagerId);
  const talkTo = roster().find(id => id !== friend) || roster()[0];
  return `(${before} died; the mantle passed to ${after})\n\n` + drive(talkTo, 'D. SUCCESSION — the new bearer talks to a villager');
}

(async () => {
  await Game.init();
  const which = process.argv[2] || 'all';
  const parts = [];
  if (which === 'all' || which === 'A') parts.push(await scenarioA());
  if (which === 'all' || which === 'B') parts.push(await scenarioB());
  if (which === 'all' || which === 'C') parts.push(await scenarioC());
  if (which === 'all' || which === 'D') parts.push(await scenarioD());
  console.log(`# Crisis-leg conversation transcripts (seed ${SEED})\n`);
  console.log(parts.join('\n\n---\n\n'));
})();
