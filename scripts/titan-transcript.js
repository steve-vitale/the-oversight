// TITAN CLASS — sense-read transcript (evidence/2026-10-11/titan-class.md)
// Plays a full herald-titan arc and prints the narration log for human reading.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ a >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
Math.random = mulberry32(20261011);
global.SCATTER_DATA = {};
for (const f of fs.readdirSync(path.join(ROOT, 'src/data'))) {
  if (!f.endsWith('.json')) continue;
  try { global.SCATTER_DATA[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); } catch (e) {}
}
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.window = global;
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const SKIP_DOM = /app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/;
const files = [];
for (const m of html.matchAll(/src="([^"?]+)\?v=/g)) { const f = m[1]; if (f.endsWith('.js') && !SKIP_DOM.test(f)) files.push(f); }
const gameIdx = files.indexOf('src/js/game.js');
eval(fs.readFileSync(path.join(ROOT, files[gameIdx]), 'utf8'));
global.Game = globalThis.Scattering.Game;
files.forEach((f, i) => { if (i !== gameIdx) eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window;
Game.data = global.SCATTER_DATA;

Game.state = Game.state || {};
Game.state.scholar = { day: 55, hp: 220, maxHp: 220, inventory: [
  { id: 'worldbreaker_maul', itemId: 'worldbreaker_maul', name: 'Worldbreaker Maul', units: 1 },
  { id: 'cooked_venison', itemId: 'cooked_venison', name: 'Cooked Venison', units: 4, kcalEach: 900 },
] };
Game.state.otherVillages = [
  { id: 'ashford', name: 'Ashford', opinion: 30, roster: [
    { id: 'ash_speaker', name: 'Mara Voss', alive: true },
    { id: 'ash_fighter', name: 'Tomm Rill', alive: true },
  ]},
  { id: 'cinder', name: 'Cinder Hollow', opinion: 5, roster: [
    { id: 'cin_speaker', name: 'Drell Kaan', alive: true },
    { id: 'cin_fighter', name: 'Sella Bryn', alive: true },
  ]},
];
const linkAsh = { primary: 'haven', subordinate: 'ashford', status: 'active', trust: 65, theirSpeaker: { id: 'ash_speaker', name: 'Mara Voss' }, arrears: 0 };
const linkCin = { primary: 'haven', subordinate: 'cinder', status: 'active', trust: 12, theirSpeaker: { id: 'cin_speaker', name: 'Drell Kaan' }, arrears: 0 };
Game.mshipState = () => ({ links: [linkAsh, linkCin] });
Game.unlockedWave = () => 5;
Game.scaleRank = () => 'national';
Game._availableRepresentative = () => null;
Game.recordMoment = () => {};
Game.ledgerAdd = () => {};
const log = [];
Game.say = (t) => { log.push(String(t)); };
Game.sysSay = (t) => { log.push('[SYSTEM] ' + String(t)); };
Game.map = { px: 4, py: 4 };

function section(title) { log.push('\n===== ' + title + ' ====='); }

// 1. the omen arrives (stage 0)
section('DAY 55 — SOMETHING STIRS');
Game.state.titans = null;
Game.titanCast();
Game.state.titans.omens['eater'] = { stage: 0, day: 55, warned: {} };
Game.say('🔭 Scouts come back pale. Something big is moving in the treeline — too big for the treeline.');

// 2. named (stage 1)
section('DAY 60 — THEY NAME IT');
Game.state.scholar.day = 60;
Game.state.titans.omens['eater'] = { stage: 1, day: 55, warned: {} };
Game.say('📻 ' + Game.titanDef('eater').omen1);

// 3. located (stage 2) — the lair
section('DAY 66 — LOCATED');
Game.state.scholar.day = 66;
Game.worldMonsters = Game.worldMonsters || [];
Game.state.worldMonsters = [];
Game.state.titans.omens['eater'] = { stage: 2, day: 66, warned: {} };
Game.spawnWorldMonster = Game.spawnWorldMonster || function (id, tx, ty, opts) { const m = { id, tx, ty }; Game.state.worldMonsters.push(m); return m; };
try { Game.touchTileScene = () => {}; Game.syncMonsterAlias = () => {}; } catch (e) {}
const def = Game.titanDef('eater');
Game.state.worldMonsters.push({ id: 'eater', tx: 7, ty: 4, titan: true });
Game.say('🗺️ Scouts found its lair — 3 east of here. ' + def.title + ' — ' + def.epithet + '. It is WAITING. You cannot face it alone. Sound the call.');

// 4. solo attempt — refused
section('THE PLAYER TRIES ALONE — REFUSED');
const rr = Game.startCombat('eater');
log.push('(startCombat returned ' + rr + ')');

// 5. war council
section('WAR COUNCIL');
Game.titanWarCouncil('eater');

// 6. the call
section('THE CALL TO ARMS');
Game.soundTitanCall('eater');

// 7. outfitting — real gear leaves
section('OUTFITTING ASHFORD');
const before = Game.state.scholar.inventory.length;
Game.titanOutfit('eater', 'ashford', [0]);
log.push('(inventory: ' + before + ' -> ' + Game.state.scholar.inventory.length + ' items — the maul is GONE from your pack)');

// 8. the turn telegraph — cinder is hungry-eyed
section('GOSSIP — THE TURN IS TELEGRAPHED');
const t = Game.titanTemptation('cinder');
log.push('(cinder temptation ' + t.temptation + ' vs loyalty ' + t.loyalty + ': ' + t.verdict + ')');
Game.state.titans.omens['eater'].warned['cinder'] = 1;
Game.say('👀 Gossip at the fire: "Drell Kaan has been looking at your armory the way you look at a full pantry."');

// 9. the fight — blow by blow, one allied death
section('THE FIGHT — THE EATER FALLS, MARA DOES NOT GET UP');
Game._titanTest.titanResolveFight({
  titan: 'eater', result: 'won',
  allies: [
    { key: 'a_ash_speaker', name: 'Mara Voss', villageId: 'ashford', vid: 'ash_speaker', alive: false },
    { key: 'a_ash_fighter', name: 'Tomm Rill', villageId: 'ashford', vid: 'ash_fighter', alive: true },
  ],
});

console.log(log.join('\n'));
