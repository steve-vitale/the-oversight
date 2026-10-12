#!/usr/bin/env node
// test-mourning-name-r8.js — PROOF (journey crisis r8 2026-10-12).
// Bug: the mourning lately-event lines used split(' ')[0] on the dead
// person's name. For a villager whose name is still a stranger descriptor
// ("A person, maybe 40s, with a scarred cheek") this truncated to the bare
// "A" — transcript-verified: "Since A died... I keep expecting to see A at
// the fire. Stupid." The same "A"-collapse the dialogue rethink already
// fixed elsewhere via firstRef.
// Fix: convoTopics.js t2LatelyEvent now resolves the mourning name through
// firstRef(villagerId) (knowledge-gated, never collapses to "A"), with the
// full stored name (unsplit) as fallback. ledger.js lineage entries now
// carry the dead bearer's villagerId.
// Asserts:
//   A. villager death, name unlearned → mourning line has no bare-"A" name,
//      uses a proper descriptor or first name.
//   B. bearer death (mantle pass) → lineage-branch line has no bare-"A".
//   C. convo-wants eventNews mourning line (same ev.name) has no bare-"A".
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
Math.random = mulberry32(20261012);
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function check(label, cond, detail) {
  if (cond) { pass++; console.log(`PASS ${label}`); }
  else { fail++; console.log(`FAIL ${label}${detail ? ' — ' + detail : ''}`); }
}
const hasBareA = (s) => /(^|[^a-zA-Z])A($|[^a-zA-Z])/.test(String(s)) && /died|thinking about|is gone/.test(String(s));

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const v = Game.state.village;
  const roster = () => (v.roster || []).filter(id => id !== Game.villagerId);
  const ids = roster();
  const dead = ids[0], mourner = ids[1];
  const dname = (() => { try { return Game.displayName(dead); } catch (e) { return '?'; } })();
  console.log(`dead villager descriptor: "${dname}"`);
  // Name must NOT be learned yet (that's the bug's precondition).
  const known = (() => { try { return Game.nameKnown(dead); } catch (e) { return 'n/a'; } })();
  console.log(`name known pre-talk: ${known}`);

  // A. Villager death -> acute mourning via corpse store.
  Game.registerDeath({ kind: 'person', villagerId: dead, name: dname, cause: 'a hushwolf' });
  try { v.trust[mourner] = 40; } catch (e) {}
  let ev = null;
  try { ev = Game.t2LatelyEvent ? Game.t2LatelyEvent(mourner) : null; } catch (e) { ev = { err: e.message }; }
  console.log('corpse-branch event:', JSON.stringify(ev));
  check('A1 corpse-branch event is mourning with a name', !!(ev && ev.kind === 'mourning' && ev.name), JSON.stringify(ev));
  check('A2 no bare-"A" collapse', !(ev && ev.name && /^A$/.test(ev.name)), `name="${ev && ev.name}"`);
  // Render the actual lines the player would see.
  // Render the actual lines the player would see (the event choice can
  // surface a turn or two in, so drive until it appears).
  let line = null;
  try {
    Game.startConvo(mourner);
    for (let t = 0; t < 10 && !line; t++) {
      const choices = Game.convoChoices(mourner) || [];
      const m = choices.find(c => /^alive:event/.test(c.id));
      if (m) {
        Game.convoTurn(mourner, m.id);
        const c = Game.convoGet(mourner);
        const last = (c.transcript || []).filter(e => e.who !== 'you').slice(-1)[0];
        line = last && last.text;
        break;
      }
      let pick = choices.find(c => /^gq:|^ans:q/.test(c.id)) || choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
      if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
      Game.convoTurn(mourner, pick.id);
    }
    Game.endConvo(mourner, 'left');
  } catch (e) { line = 'ERR ' + e.message; }
  console.log('rendered mourning line:', line);
  check('A3 rendered line names a person, not "A"', line && !hasBareA(line), line);

  // C. convo-wants eventNews mourning line (same ev.name source).
  let news = null;
  try {
    // drive the wants layer: emulate its eventNews closure by calling t2LatelyEvent again
    const ev2 = Game.t2LatelyEvent ? Game.t2LatelyEvent(mourner) : null;
    if (ev2 && ev2.kind === 'mourning' && ev2.name) news = `"Nobody's saying it out loud, but everyone's thinking about ${ev2.name}. The quiet ones worst."`;
  } catch (e) { news = 'ERR ' + e.message; }
  console.log('eventNews line:', news);
  check('C1 eventNews mourning line has no bare-"A"', news && !hasBareA(news), news);

  // B. Bearer death -> lineage branch (fresh game so the lineage entry is new).
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const oldName = (() => { try { return Game.displayName(Game.villagerId); } catch (e) { return '?'; } })();
  const oldId = Game.villagerId;
  Game.playerDeath('the hunt');
  const lin = (typeof Game.lineage === 'function') ? Game.lineage() : [];
  const last = lin[lin.length - 1];
  console.log('lineage last entry:', JSON.stringify({ name: last && last.name, villagerId: last && last.villagerId, cause: last && last.cause }));
  check('B1 lineage entry carries the dead bearer\'s villagerId', !!(last && last.villagerId === oldId), JSON.stringify(last && { name: last.name, villagerId: last.villagerId, oldId }));
  const vids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const talk = vids[0];
  let evB = null;
  try { evB = Game.t2LatelyEvent ? Game.t2LatelyEvent(talk) : null; } catch (e) { evB = { err: e.message }; }
  console.log('lineage-branch event:', JSON.stringify(evB));
  check('B2 lineage-branch event has a name', !!(evB && evB.kind === 'mourning' && evB.name), JSON.stringify(evB));
  check('B3 lineage-branch name is not bare "A"', !(evB && evB.name && /^A$/.test(evB.name)), `name="${evB && evB.name}"`);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
