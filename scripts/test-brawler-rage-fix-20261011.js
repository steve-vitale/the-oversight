// FIX-VERIFICATION: rage/cornered_rat card-honesty (brawler playtest 2026-10-11).
// BEFORE (demonstrated by test-brawler-rage-honesty-20261011.js): mere
// possession of rage doubled every strike below 50% HP; cornered_rat doubled
// below 30% HP with no enemy check and no dodge — contradicting both cards.
// AFTER: rage works only via unleash_rage (3 strikes, honest); cornered_rat
// fires only when surrounded by 3+ living enemies (+100% dmg AND +50% dodge).
// Run: node scripts/test-persist-harness.js scripts/test-brawler-rage-fix-20261011.js
//      SEED=<n> for the x3-seed convention.
'use strict';
let fails = 0, passes = 0;
function check(name, cond, extra) {
  if (!cond) { fails++; console.log('FAIL:', name, extra === undefined ? '' : JSON.stringify(extra).slice(0, 300)); }
  else { passes++; console.log('ok:', name); }
}
function grantAbilities() {
  G.state.scholar.abilities = G.state.scholar.abilities || [];
  if (!G.hasAbility('rage')) G.state.scholar.abilities.push({ id: 'rage', name: 'Rage', level: 1, xp: 0 });
  if (!G.hasAbility('cornered_rat')) G.state.scholar.abilities.push({ id: 'cornered_rat', name: 'Cornered Rat', level: 1, xp: 0 });
}

function playerTurn(f) {
  // force the player's turn regardless of initiative order
  f.turnIdx = f.order.indexOf('p');
  try { if (G.tbBeginTurn) G.tbBeginTurn(); } catch (e) {}
  const p = G.tbFighter('p'); p.acted = false;
}

function quiet() { const o = G.say; const log = []; G.say = function (m) { log.push(String(m)); }; return { restore() { G.say = o; }, log }; }

// ---- 1. rage possession no longer doubles at low HP ----
storage.clear(); freshGame(); G.tbfight = null; grantAbilities();
const vid1 = (G.state.village.roster || []).filter(id => id !== G.villagerId)[0];
G.playerAttacks(vid1);
const f1 = G.tbfight;
const h1 = f1.fighters.find(x => x.kind === 'hostile');
h1.hp = 500; h1.maxHp = 500;
const p1 = G.tbFighter('p'); p1.maxHp = 100; p1.hp = 30; // below 50%: the old exploit zone
playerTurn(f1);
const q1 = quiet();
p1.acted = false; p1.mx = h1.mx; p1.my = h1.my - 1;
G.tbPlayerStrike(h1.key);
const dmgLow = 500 - h1.hp;
const rageLine = q1.log.some(s => s.indexOf('RAGE:') >= 0);
q1.restore();
console.log('1: strike at 30% HP, rage UNactivated ->', dmgLow, 'dmg, legacy RAGE line:', rageLine);
check('1: unactivated rage no longer doubles strikes at low HP', !rageLine && dmgLow < 18, { dmgLow });
// honest path still works: unleash_rage -> next 3 strikes x2
G.state.scholar.rageActive = { rounds: 3, dmgMult: 2.0 }; // as rage.unleash_rage sets it
h1.hp = 500;
const q1b = quiet();
p1.acted = false;
G.tbPlayerStrike(h1.key);
const dmgRage = 500 - h1.hp;
const rageRoundsLeft = (G.state.scholar.rageActive || {}).rounds;
q1b.restore();
console.log('1b: strike with unleash_rage active ->', dmgRage, 'dmg, rageActive.rounds left:', rageRoundsLeft);
check('1b: unleash_rage still doubles strikes (honest path preserved)', dmgRage > dmgLow && rageRoundsLeft === 2, { dmgLow, dmgRage, rageRoundsLeft });
G.tbfight = null;

// ---- 2. cornered_rat: surrounded (3 enemies) -> bonus; 1 enemy -> none ----
storage.clear(); freshGame(); G.tbfight = null; grantAbilities();
G.state.systemArrived = true;
// synthetic betrayal-flagged fight with 3 hostiles
const vids = (G.state.village.roster || []).filter(id => id !== G.villagerId).slice(0, 3);
G.tbfight = {
  id: 'f-rat', round: 1, turnIdx: 0, over: false, betrayal: true,
  order: ['p', 'h1', 'h2', 'h3'],
  fighters: [
    { key: 'p', kind: 'player', name: 'You', hp: 100, maxHp: 100, mx: 4, my: 4, alive: true, acted: false, moveLeft: 1 },
    { key: 'h1', kind: 'hostile', villagerId: vids[0], name: 'A', hp: 500, maxHp: 500, mx: 5, my: 4, alive: true, acted: false },
    { key: 'h2', kind: 'hostile', villagerId: vids[1], name: 'B', hp: 500, maxHp: 500, mx: 3, my: 4, alive: true, acted: false },
    { key: 'h3', kind: 'hostile', villagerId: vids[2], name: 'C', hp: 500, maxHp: 500, mx: 4, my: 5, alive: true, acted: false },
  ],
};
const p2 = G.tbFighter('p'); p2.hp = 25; // low HP: old engine would fire here regardless
playerTurn(G.tbfight);
const q2 = quiet();
p2.acted = false;
G.tbPlayerStrike('h1');
const dmgSurr = 500 - G.tbFighter('h1').hp;
const ratLine = q2.log.some(s => s.indexOf('CORNERED RAT') >= 0);
q2.restore();
console.log('2: strike at 25% HP surrounded by 3 ->', dmgSurr, 'dmg, CORNERED RAT line:', ratLine);
check('2: cornered_rat fires when surrounded by 3+ enemies', ratLine && dmgSurr >= 16, { dmgSurr });
// dodge half: tbDamage vs player with 3 enemies -> +0.5 dodge chance observed over trials
let dodges = 0, trials = 300;
for (let i = 0; i < trials; i++) {
  // reset player hp each trial; hostile strikes the player
  p2.hp = 100;
  const before = p2.hp;
  G.tbDamage('p', 10, 'test', { quiet: true });
  if (p2.hp === before) dodges++;
}
console.log(`2b: dodge rate surrounded (300 trials, 10-dmg hits): ${dodges}/${trials}`);
check('2b: cornered_rat grants the promised +50% dodge when surrounded', dodges / trials >= 0.35, { dodges, trials });
G.tbfight = null;

// ---- 3. cornered_rat: 1 enemy -> NO bonus even at low HP ----
storage.clear(); freshGame(); G.tbfight = null; grantAbilities();
const vid3 = (G.state.village.roster || []).filter(id => id !== G.villagerId)[0];
G.playerAttacks(vid3);
const f3 = G.tbfight;
const h3 = f3.fighters.find(x => x.kind === 'hostile');
h3.hp = 500; h3.maxHp = 500;
const p3 = G.tbFighter('p'); p3.maxHp = 100; p3.hp = 20;
playerTurn(f3);
const q3 = quiet();
p3.acted = false; p3.mx = h3.mx; p3.my = h3.my - 1;
G.tbPlayerStrike(h3.key);
const dmgSolo = 500 - h3.hp;
const ratLineSolo = q3.log.some(s => s.indexOf('CORNERED RAT') >= 0);

q3.restore();
console.log('3: strike at 20% HP vs ONE enemy ->', dmgSolo, 'dmg, CORNERED RAT line:', ratLineSolo);
check('3: cornered_rat does NOT fire vs a single enemy (card: 3+ enemies)', !ratLineSolo && dmgSolo < 30, { dmgSolo });
G.tbfight = null;

console.log(`\nRESULT: ${passes} ok, ${fails} FAIL`);
if (fails) process.exitCode = 1;
