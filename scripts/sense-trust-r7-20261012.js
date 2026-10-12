// sense-trust-r7-20261012.js — SENSE-TESTING LAW: read the promise
// transcripts. Drives: discovery -> vow -> keep -> break, capturing every
// said line. Judge meaning, coherence, relevance, consequences.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const lines = [];
function capture(Game) {
  const origSay = Game.say;
  Game.say = function (t) { lines.push(String(t)); return origSay.call(this, t); };
}
function dump(n, tag) {
  console.log('--- ' + tag + ' ---');
  lines.splice(0).slice(-n).forEach(l => console.log('  | ' + l.replace(/\n/g, ' ').slice(0, 170)));
}
function drive(Game, vid, maxTurns) {
  // Two-pass: first conversation deepens the goal thread (sets the sticky
  // opened-up flag); the fresh second conversation offers the vow.
  // Returns true if offer_help was taken.
  function pass() {
    for (let t = 0; t < (maxTurns || 18); t++) {
      const ch = (Game.convoChoices(vid) || []).map(c => c.id);
      if (ch.includes('offer_help')) { Game.convoTurn(vid, 'offer_help'); return true; }
      const pk = ch.find(id => id === 'ask:goal') || ch.find(id => id.indexOf('follow:goal') === 0)
        || ch.find(id => id.indexOf('ans:') === 0) || ch.find(id => id.indexOf('gq:') === 0)
        || ch.find(id => id === 'deflect_q') || ch.find(id => id === 'dlg:more')
        || ch.find(id => id === 'more' || id === 'goon') || ch.find(id => id === 'dlg:subject')
        || ch.find(id => id === 'dlg:react');
      if (!pk) return false;
      Game.convoTurn(vid, pk);
    }
    return false;
  }
  Game.talkTo(vid);
  pass();
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  Game.talkTo(vid);
  const took = pass();
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return took;
}

(async () => {
  const { Game } = await loadGame({ seed: 11, mode: 'sense-r7', fullTelemetry: false });
  await setupGame(Game);
  capture(Game);
  Game.state.scholar.day = 40;
  Game.state.systemArrived = true;
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const keeper = roster.find(id => Game.promiseKeepKind(Game.npcGoal(id)) === 'food');
  const breaker = roster.find(id => id !== keeper && Game.npcGoal(id) && Game.promiseKeepKind(Game.npcGoal(id)));
  if (!keeper || !breaker) { console.log('roster lacks keepable goals — abort'); process.exit(2); }
  for (const vid of [keeper, breaker]) Game.state.village.trust[vid] = 85;

  console.log('### 1. THE VOW — ' + Game.displayName(keeper) + ' (goal: ' + Game.npcGoal(keeper) + ')');
  console.log('(vow made via promiseHelp — the menu path is proven in test-promise-discovery; here we read the words)');
  lines.splice(0);
  const vr = Game.promiseHelp(keeper);
  console.log('vow made:', !!(vr && vr.ok));
  dump(6, 'vow beat');

  console.log('\n### 2. THE KEEP — real food, real deed');
  Game.state.scholar.inventory = Game.state.scholar.inventory || [];
  Game.state.scholar.inventory.push({ name: 'hearty stew', kcalEach: 900, units: 5 });
  lines.splice(0);
  Game.giveFood(keeper);
  const pv = (Game.state.village.promises || {})[keeper];
  console.log('promise state after giveFood:', pv && pv.kept === true ? 'KEPT' : JSON.stringify(pv));
  dump(6, 'keep beat');

  console.log('\n### 3. THE BREAK — ' + Game.displayName(breaker) + ' (goal: ' + Game.npcGoal(breaker) + ')');
  lines.splice(0);
  const r = Game.promiseHelp(breaker);
  console.log('vow made:', !!(r && r.ok));
  dump(4, 'vow beat');
  lines.splice(0);
  Game.state.scholar.day += 9;
  Game.checkPromises('no_such_kind');
  const pb = (Game.state.village.promises || {})[breaker];
  console.log('promise state after 9 days:', pb && pb.kept);
  dump(4, 'break beat');

  console.log('\n### 4. THE DAY AFTER — does the keeper remember?');
  lines.splice(0);
  Game.talkTo(keeper);
  // ask about the vow via memory topic if offered
  for (let t = 0; t < 12; t++) {
    const ch = (Game.convoChoices(keeper) || []).map(c => c.id);
    const mem = ch.find(id => id.indexOf('alive:memory') === 0);
    if (mem) { Game.convoTurn(keeper, mem); break; }
    const pk = ch.find(id => id.indexOf('ans:') === 0) || ch.find(id => id === 'dlg:subject') || ch.find(id => id === 'dlg:more');
    if (!pk) break;
    Game.convoTurn(keeper, pk);
  }
  try { Game.endConvo(keeper, 'left'); } catch (e) {}
  dump(8, 'day-after conversation (tail)');

  console.log('\nSENSE NOTES: read the lines above for meaning/coherence.');
})().catch(e => { console.error('ERR', e.stack); process.exit(1); });
