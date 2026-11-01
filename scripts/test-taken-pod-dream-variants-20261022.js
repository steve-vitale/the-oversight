#!/usr/bin/env node
// TAKEN POD-DREAM TAIL VARIANTS (journey establishment r25, 2026-10-22):
// The seek_taken engageBeat tail ("Some nights I dream about the pods --
// rows of them, humming. I wake up and I can't tell if it was a dream or a
// broadcast.") was byte-identical for every villager — r25 transcripts had
// Ursula, James, Lillian AND Erin saying it verbatim. A real village doesn't
// speak with one mouth.
// FIX: want def gains takenPodDreamTail(vid) — 3 variants, deterministic
// per vid hash (no RNG; a person tells their own story the same way).
// Meaning preserved: every tail names the pods and the dream/broadcast
// ambiguity. The repeat-ack ledger is untouched.
// Usage: node scripts/test-taken-pod-dream-variants-20261022.js
'use strict';
// A harness owns process globals. Preserve the six-seed proof, with ONE
// shared harness per child rather than loading six runtimes into one process.
if(!process.env.OVERSIGHT_TAKEN_PROOF_SEED){
  const cp=require('child_process'),tails=new Set();let passed=0,failed=0;
  for(const seed of[61,82,103,124,7,42]){
    const r=cp.spawnSync(process.execPath,[__filename],{env:{...process.env,OVERSIGHT_TAKEN_PROOF_SEED:String(seed)},encoding:'utf8'});
    process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');
    if(r.status!==0)failed++;
    passed+=((r.stdout||'').match(/^  PASS /gm)||[]).length;
    const line=(r.stdout||'').split(/\r?\n/).find(l=>l.startsWith('@@TAKEN_TAILS@@'));
    if(!line){failed++;continue;}for(const t of JSON.parse(line.slice('@@TAKEN_TAILS@@'.length)))tails.add(t);
  }
  if(tails.size>=2){passed++;console.log('  PASS CROSS-VILLAGER VARIETY: at least2 distinct tails across isolated seeds');}
  else{failed++;console.log('  FAIL CROSS-VILLAGER VARIETY');}
  console.log(`${passed} passed, ${failed} failed`);process.exit(failed?1:0);
}
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function ok(cond, label) {
  if (cond) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}

function takenWant(Game) {
  // scan the roster until a villager draws seek_taken (the repeat-meeting
  // trick: 3.1 floor only applies on repeat sittings; see the r18 proof)
  const roster = (Game.state.village || {}).roster || [];
  for (const id of roster) {
    if (!id || id === Game.villagerId) continue;
    let p = null;
    try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    if (!p || p.dead) continue;
    if (!(Game.takenKinOf && Game.takenKinOf(id).length)) continue;
    try { Game.startConvo(id); Game.endConvo(id, 'done'); Game.startConvo(id); Game.endConvo(id, 'done'); } catch (e) {}
    let sel = null;
    try { sel = Game.convoSelectWant ? Game.convoSelectWant(id) : null; } catch (e) {}
    if (sel && sel.id === 'seek_taken') {
      const d2 = sel.def || sel;
      if (d2 && typeof d2.takenPodDreamTail === 'function') return { def: d2, vid: id };
    }
  }
  return null;
}

(async () => {
  const SEEDS = [Number(process.env.OVERSIGHT_TAKEN_PROOF_SEED)];
  const tails = new Set();
  const perVid = {};
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed });
    await setupGame(Game);
    const roster = (Game.state.village || {}).roster || [];
    const got = takenWant(Game);
    if (!got) { console.log(`  SKIP seed ${seed}: no seek_taken def found`); continue; }
    const { def, vid } = got;
    // unit: tail is deterministic per vid, no RNG path
    const t1 = def.takenPodDreamTail(vid);
    const t2 = def.takenPodDreamTail(vid);
    ok(t1 === t2, `seed ${seed}: tail deterministic for one villager (no RNG)`);
    ok(/pod/i.test(t1) && /dream|sleep|hear/i.test(t1),
       `seed ${seed}: tail keeps the pods dream/broadcast meaning`);
    perVid[vid] = t1; tails.add(t1);
    // sweep the whole roster for any villager with taken kin: collect all tails
    for (const id of roster) {
      try {
        if (id && Game.takenKinOf && Game.takenKinOf(id).length) {
          tails.add(def.takenPodDreamTail(id));
        }
      } catch (e) {}
    }
    // integration: first telling carries the kin name and the villager's own tail
    let beat = null;
    try { beat = def.engageBeat.call(Game, vid); } catch (e) { beat = 'ERROR ' + e.message; }
    const kin = (Game.takenKinOf(vid) || [])[0] || {};
    const first = (kin.name || 'they').split(' ')[0];
    ok(String(beat).indexOf(first) >= 0, `seed ${seed}: first telling names the taken kin (${first})`);
    ok(String(beat).indexOf(t1) >= 0, `seed ${seed}: first telling uses that villager's tail variant`);
    ok(/^"[\s\S]*"$/.test(beat), `seed ${seed}: actual kin speech retains its closing quotation mark`);
    // repeat-ack path unaffected
    let beat2 = null;
    try { beat2 = def.engageBeat.call(Game, vid); } catch (e) { beat2 = 'ERROR ' + e.message; }
    ok(/still nothing|told you/i.test(String(beat2)),
       `seed ${seed}: repeat telling still acknowledges the earlier tell (ledger intact)`);
  }
  console.log(`\ndistinct tails across ${SEEDS.length} seeds: ${tails.size}`);
  for (const t of tails) console.log('  - ' + t.slice(0, 90) + '...');
  console.log('@@TAKEN_TAILS@@'+JSON.stringify([...tails]));
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
