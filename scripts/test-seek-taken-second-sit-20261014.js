#!/usr/bin/env node
// Proof test: the seek_taken want (KIN canon, convo-wants.js) — does the
// machinery fire on a repeat sitting with a taken-kin villager?
// Journey landing r15 (2026-10-14): 4 seeds x 14 days, 48 conversations,
// seek_taken fired ZERO times (want engagement: curious 35, seek_comfort 3,
// ask_favor 2, none 2). 2-4 villagers/seed HAVE taken kin. The want pick()
// returns weight 2 for them; the first-meeting rule boosts curious to >=3.
// This test verifies the beat works at all: sit with a taken-kin villager,
// sit again (count=2, no longer firstMeeting), and check the want.
// RED (broken): second sitting still draws curious (or anything but seek_taken).
// GREEN (works): second sitting draws seek_taken with the opener referencing
//   the taken kin by name/relation, and the engage beat names their fate.

const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '45', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

async function main() {
  const lg = await loadGame({ seed: SEED, fullTelemetry: true });
  const Game = lg.Game;
  if (lg.loadFails && lg.loadFails.length) console.log('LOAD FAILS: ' + JSON.stringify(lg.loadFails));
  await setupGame(Game);

  // find a living villager with taken kin
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  let target = null, kin = [];
  for (const id of roster) {
    let k = [];
    try { k = Game.takenKinOf(id) || []; } catch (e) {}
    if (k.length) { target = id; kin = k; break; }
  }
  ok(!!target, `a villager with taken kin exists on seed ${SEED}`);
  if (!target) { console.log(`\nRESULT: ${pass} pass, ${fail} fail`); process.exit(fail ? 1 : 0); }
  let nm = '?';
  try { nm = Game.displayName(target) || target; } catch (e) {}
  console.log(`  target: ${nm} (${target}) — taken kin: ${kin.map(k => `${k.name} (${k.relation})`).join(', ')}`);

  // first sitting
  let r0;
  try { r0 = Game.startConvo(target); } catch (e) { console.log('  startConvo ERROR: ' + e.message); }
  const want1 = ((Game.convoGet(target) || {}).want || {}).id || 'none';
  console.log(`  first sitting want: ${want1}`);
  ok(want1 !== 'seek_taken', 'first sitting does NOT draw seek_taken (first-meeting curiosity rule)');
  try { Game.endConvo(target, 'done'); } catch (e) {}
  const countAfter = ((Game.convoGet(target) || {}).count || 0);
  console.log(`  convo count after first sitting: ${countAfter}`);

  // second sitting — no longer a first meeting
  let r1;
  try { r1 = Game.startConvo(target); } catch (e) { console.log('  startConvo(2) ERROR: ' + e.message); }
  const c2 = Game.convoGet(target) || {};
  const want2 = (c2.want || {}).id || 'none';
  console.log(`  second sitting want: ${want2}`);
  ok(want2 === 'seek_taken', 'second sitting draws seek_taken');
  if (want2 === 'seek_taken') {
    const line = String(r1.line || '');
    const first = (kin[0].name || '').split(' ')[0];
    ok(/taken|pods/i.test(line), 'opener references the taken/pods: ' + line.slice(0, 120));
    // engage: pick a deepen choice and verify the engage beat names the kin's fate
    const choices = r1.choices || [];
    const more = choices.find(x => x && x.id === 'dlg:more');
    if (more) {
      const r2 = Game.convoTurn(target, 'dlg:more');
      const line2 = String(r2.line || '');
      console.log('  engage line: ' + line2.slice(0, 200));
      const fateWords = String(kin[0].fate || '').split(/\s+/).slice(0, 4).join(' ');
      ok(line2.indexOf(first) >= 0 || new RegExp(fateWords.split(' ')[0], 'i').test(line2),
        'engage beat names the taken kin or their fate');
    } else {
      console.log('  (no dlg:more offered — skipping engage check)');
    }
    try { Game.endConvo(target, 'done'); } catch (e) {}
  }
  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
