'use strict';
// Corpus for #697: literal "{kin}" leaking into the arm-surge devotion beat.
//
// Drives the ACTUAL beat code path (Game.channelSentiment with dog_tags in
// the devotion lane), not string inspection. 16 seeded fixtures.
// MODE=red   -> exit 0 iff literal "{kin}" appears 16/16 (RED phase).
// MODE=green -> exit 0 iff 0/16 contain "{kin}" AND every message holds the
//               scholar's real resolved kin first name (GREEN phase).
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const SEEDS = [5601, 5602, 5603, 5604, 5605, 5606, 5607, 5608,
               5609, 5610, 5611, 5612, 5613, 5614, 5615, 5616];

async function driveBeat(seed) {
  const { Game } = await quietLog(async () => loadGame({ seed }));
  await quietLog(async () => setupGame(Game));
  const s = Game.state.scholar, pg = Game.progState();
  pg.sentimentTaught = true;
  s.trauma = 0;
  pg.surgeResonance = 35; // DEVOTION lane (>=35, <3 mastered)
  s.abilities = [
    { id: 'a1', name: 'Gift One', level: 1, xp: 0 },
    { id: 'a2', name: 'Gift Two', level: 2, xp: 0 },
  ];
  s.backgroundAbilities = [];
  s.inventory = [{ itemId: 'dog_tags', name: 'Dog Tags', sentimental: true }];
  pg.chanDay = {};
  const said = [];
  const oSay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return oSay.apply(this, arguments); };
  let msg;
  try { msg = Game.channelSentiment(0); } finally { Game.say = oSay; }
  const holder = ((Game.data.villagers || []).find(v => v.id === Game.villagerId)) || {};
  const holderOk = !!(holder && holder.name && holder.lifeseed && Array.isArray(holder.lifeseed.people));
  const kin = Game.lifeseedKin(holder, 'friend');
  return { msg: String(msg || ''), holderOk, kin, holderName: holder.name };
}

async function main() {
  const mode = process.env.MODE || 'red';
  let leaks = 0, kinPresent = 0, bad = 0;
  let firstMsg = '';
  for (const seed of SEEDS) {
    let r;
    try { r = await driveBeat(seed); }
    catch (e) { console.log(`seed ${seed}: THREW ${e.message}`); bad++; continue; }
    if (seed === SEEDS[0]) firstMsg = r.msg;
    const leak = r.msg.includes('{kin}');
    if (leak) leaks++;
    const hasKin = r.kin && r.kin !== 'someone' && r.msg.includes(r.kin);
    if (!leak && hasKin) kinPresent++;
    console.log(`seed ${seed}: leak=${leak} holderOk=${r.holderOk} kin="${r.kin}" hasKin=${hasKin}`);
  }
  console.log(`--- SUMMARY mode=${mode}: leak=${leaks}/16 kinPresent=${kinPresent}/16 threw=${bad}`);
  console.log(`--- SAMPLE msg (seed ${SEEDS[0]}): ${firstMsg.slice(0, 320)}`);
  let pass;
  if (mode === 'red') pass = (leaks === 16 && bad === 0);
  else pass = (leaks === 0 && kinPresent === 16 && bad === 0);
  console.log(pass ? 'CORPUS ' + mode.toUpperCase() + ' AS EXPECTED' : 'CORPUS UNEXPECTED RESULT');
  process.exit(pass ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
