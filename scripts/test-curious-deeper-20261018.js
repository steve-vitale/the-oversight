// test-curious-deeper-20261018.js -- RED->GREEN proof for #541 content fix
// (playtest deepening r18, 2026-10-18).
//
// #541 (landing r22): the "curious" want at low stages produced filler loops —
// the NPC asked a real question, the player answered, and the middle was
// empty ("That's... pretty much all of it, honestly." / "So." / "Well." /
// "Anyway."), yet the want resolved "engaged". The engine wasn't broken; the
// pool was thin — no substantive post-answer material existed.
//
// The fix: every curious bespoke question in src/data/characterGen.json now
// carries a `deeper` beat — the NPC's own substantive stake in their question
// (their reflection, their experience). The answer handler queues it
// RELIABLY (not the 50% follow lottery), so answering a real question earns
// a real exchange and the thread continues on the continuer.
//
// RED: questions lack `deeper` / the handler never queues it.
// GREEN: all 36 questions have substantive deeper beats; a live answered
// curious question delivers the deeper beat (no dry-pool filler in its place).
//
// Usage: node scripts/test-curious-deeper-20261018.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const DRY = ["That's... pretty much all of it", "I wish there was more to tell", "That's the whole of it. Sorry"];

async function main() {
  const { Game } = await loadGame({ seed: 777001, mode: 'test-curious-deeper-20261018' });
  await setupGame(Game);
  let fails = 0;
  const check = (name, fn) => {
    try { fn(); console.log('  PASS ' + name); }
    catch (e) { fails++; console.log('  FAIL ' + name + ' :: ' + (e && e.message)); }
  };

  const qs = ((Game.data.characterGen || {}).convo || {}).questions || [];
  check('36 questions exist', () => assert.ok(qs.length >= 36, 'found ' + qs.length));
  check('every question has a deeper beat', () => {
    const missing = qs.filter(q => !q.deeper).map(q => q.id);
    assert.strictEqual(missing.length, 0, 'missing deeper: ' + missing.join(','));
  });
  check('deeper beats are substantive (not filler)', () => {
    for (const q of qs) {
      const d = String(q.deeper || '');
      assert.ok(d.length > 40, q.id + ' too short: ' + d);
      for (const f of DRY) assert.ok(!d.includes(f), q.id + ' contains dry-pool filler');
      assert.ok(!/^(So|Well|Anyway)\./.test(d.replace(/^"/, '')), q.id + ' is a generic react');
    }
  });
  check('deeper beats fillTalkLine-clean (no raw placeholders)', () => {
    for (const q of qs) {
      const filled = Game.fillTalkLine(String(q.deeper), { name: 'Test Person', formerOccupation: 'baker', homeRegion: 'Ohio' });
      assert.ok(!/\{(occ|an_occ|Occ|first|origin|skill)\}/.test(filled), q.id + ' unfilled: ' + filled.slice(0, 80));
    }
  });

  // INTEGRATION: drive a live curious conversation to an answered question and
  // verify the deeper beat is queued/delivered (not the dry pool).
  const said = [];
  const _say = Game.say;
  Game.say = function (...a) { said.push(String(a[0])); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  let delivered = null;
  try {
    const roster = ((Game.state.village || {}).roster || []).slice(0, 14);
    for (const vid of roster) {
      if (delivered) break;
      try {
        const r0 = Game.startConvo(vid);
        if (!r0) continue;
        const c = Game.convoGet(vid);
        // find a hanging bespoke question (curious want opened)
        for (let turn = 0; turn < 3 && !delivered; turn++) {
          const cc = Game.convoGet(vid);
          const pq = cc && cc.pendingQ;
          let choices = null;
          try { choices = Game.convoChoices(vid) || []; } catch (e) { choices = []; }
          if (pq && pq.id) {
            const ans = choices.find(x => x && x.id && x.id.indexOf('ans:' + pq.id) === 0);
            if (ans) {
              const qd = qs.find(q => q.id === pq.id);
              Game.convoTurn(vid, ans.id);
              const c2 = Game.convoGet(vid);
              const held = (c2.heldBeats || []).map(h => String(h.text || ''));
              const deeperText = qd && qd.deeper ? String(Game.fillTalkLine(qd.deeper, Game.vpOf(vid))).replace(/^"|"$/g, '') : null;
              // the deeper should be queued as a held beat (goon continuer)
              const queued = deeperText && held.some(h => h.includes(deeperText.slice(1, 30)));
              // or delivered immediately in the answer's line
              const inSaid = deeperText && said.some(s => s.includes(deeperText.slice(1, 30)));
              if (queued || inSaid) delivered = { qid: pq.id, via: queued ? 'heldBeat' : 'said' };
              break;
            }
          }
          // no question yet: take the continuer or leave
          const goon = choices.find(x => x && x.id === 'goon') || choices.find(x => x && x.id === 'dlg:more');
          if (!goon) break;
          Game.convoTurn(vid, goon.id);
        }
        try { Game.endConvo(vid, 'done'); } catch (e) {}
      } catch (e) { /* try next villager */ }
    }
  } finally { Game.say = _say; }
  check('live curious answer delivers the deeper beat', () =>
    assert.ok(delivered, 'no curious question answered across 14 villagers; deeper never observed. ' +
      'If the pool is exhausted this seed, the unit checks above still bind the content.'));

  console.log(fails === 0 ? '\nALL GREEN' : `\n${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
}
main().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
