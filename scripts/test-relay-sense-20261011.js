#!/usr/bin/env node
// test-relay-sense-20261011.js — PROOF (journey sense pass 2026-10-11):
// relay dialogue scenes are WORLD-HONEST. Before the fix, scenes asserted
// things that weren't true of the Bearer <redacted> a locket that wasn't there,
// a Sanctuary never learned, rewrites never made, a "River Crossing" that
// doesn't exist, a "regional moot" that never happens, and a sister never
// born. Now scenes carry `needs` gates and {tokens} resolved against live
// world state.
//
// Proves on fixed seeds:
//   R1 bare Bearer <redacted> locket, no sanctuary, no rewrite): 24 communes —
//      light-locket / chk-sanctuary / chk-argument NEVER fire; no fabricated
//      nouns/history in ANY transcript ('River Crossing', "my sister's",
//      'seven villages', 'regional moot', unsubstituted {tokens}).
//   R2 kitted Bearer <redacted> in pack, sanctuary learned+used, rewrite used):
//      light-locket / chk-sanctuary / chk-argument DO fire; dark-intercept
//      names a REAL village from state.otherVillages; chk-cup names the real
//      keepsake; no unsubstituted tokens.
//   R3 the commune machinery still resolves: every commune opens exactly one
//      pending scene, every answer clears it, lean moves.
// Exit 0 = green, 1 = failure.
// Usage: [SEED=424242] node scripts/test-relay-sense-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '424242', 10);
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function setupRelay(Game) {
  Game.state.switchboard = {
    holderId: Game.villagerId, bearerHeld: true, stage: 'village relay',
    routed: 0, delayed: 0, edited: 0, skimmed: 0, log: [],
  };
  Game.state.scholar.relay = {
    lean: 0, communes: 0, checkins: 0, sceneIdx: 0, lightIdx: 0, darkIdx: 0,
    probes: 0, reroutes: 0, deepens: 0, holderDays: 0, backfires: 0,
    translated: [], systemWantsTalk: false,
  };
}

async function walk(profile) {
  const { Game, loadFails } = await loadGame({ seed: SEED, mode: 'relay-sense-' + profile });
  await setupGame(Game);
  setupRelay(Game);
  if (profile === 'kitted') {
    Game.state.scholar.inventory = Game.state.scholar.inventory || [];
    Game.state.scholar.inventory.push({ itemId: 'locket', units: 1 });
    Game.state.scholar.relayAbils = {
      sanctuary: { unlocked: true, uses: 1 },
      rewrite: { unlocked: true, uses: 2 },
    };
  }
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  const fired = [];
  let leanMoved = 0;
  for (let i = 1; i <= 24; i++) {
    const leanBefore = Game.relayLean();
    const id = Game.relayCommuneScene();
    const pend = Game.pendingRelayScene();
    const answered = pend ? Game.relayAnswer(i % 2 === 1 ? 'engage' : 'deflect') : null;
    const leanAfter = Game.relayLean();
    fired.push({ id, pend: !!pend, answered, leanMoved: leanAfter !== leanBefore });
    if (leanAfter !== leanBefore) leanMoved++;
    if (!pend || answered !== 'answered' || Game.pendingRelayScene()) {
      return { Game, said: said.join('\n'), fired, broken: i };
    }
  }
  return { Game, said: said.join('\n'), fired, broken: 0, leanMoved };
}

const FABRICATED = [
  [/river crossing/i, '"River Crossing" (no such village)'],
  [/my sister's/i, '"my sister\'s" (invented kinship)'],
  [/seven villages/i, '"seven villages" (invented count)'],
  [/regional moot/i, '"regional moot" (no such mechanic)'],
  [/\{[a-z0-9]+\}/, 'unsubstituted {token}'],
];

(async () => {
  // ---- R1: bare bearer ----
  {
    const r = await walk('bare');
    ok('R1 bare: machinery intact (24 communes, all answered, pending cleared)', r.broken === 0, r.broken ? 'broke at commune ' + r.broken : '');
    const ids = r.fired.map(f => f.id);
    ok('R1 bare: light-locket never fires without a locket', !ids.includes('light-locket'), ids.filter(i => i === 'light-locket').length + 'x');
    ok('R1 bare: chk-sanctuary never fires without sanctuary', !ids.includes('chk-sanctuary'));
    ok('R1 bare: chk-argument never fires without rewrite uses', !ids.includes('chk-argument'));
    for (const [re, label] of FABRICATED) ok('R1 bare: no fabricated ' + label, !re.test(r.said));
    ok('R1 bare: lean moved on answers', r.leanMoved > 10, r.leanMoved + '/24');
  }
  // ---- R2: kitted bearer ----
  {
    const r = await walk('kitted');
    ok('R2 kitted: machinery intact', r.broken === 0, r.broken ? 'broke at commune ' + r.broken : '');
    const ids = r.fired.map(f => f.id);
    ok('R2 kitted: light-locket fires with a locket', ids.includes('light-locket'));
    ok('R2 kitted: chk-sanctuary fires with sanctuary', ids.includes('chk-sanctuary'));
    ok('R2 kitted: chk-argument fires with rewrite uses', ids.includes('chk-argument'));
    for (const [re, label] of FABRICATED) ok('R2 kitted: no fabricated ' + label, !re.test(r.said));
    const villages = (r.Game.state.otherVillages || []).map(v => v.name).filter(Boolean);
    const namedReal = villages.some(n => new RegExp(n, 'i').test(r.said));
    ok('R2 kitted: dark scenes name a REAL village', namedReal, 'villages: ' + villages.join(','));
    // The scene must name a keepsake the Bearer <redacted> carries (any of them).
    const items = (r.Game.data.items || []);
    const byId = {}; items.forEach(d => { byId[d.id] = d; });
    const keepsakes = (r.Game.state.scholar.inventory || [])
      .map(i => i && (i.itemId || i.id)).filter(id => id && byId[id] && byId[id].class === 'sentimental')
      .map(id => byId[id].name);
    const namedKeepsake = keepsakes.some(n => n && r.said.includes(n));
    ok('R2 kitted: chk-cup names a REAL keepsake from the pack', namedKeepsake, 'keepsakes: ' + keepsakes.join(','));
  }
  // ---- R3: gradient law still holds on scene data ----
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'relay-sense-r3' });
    await setupGame(Game);
    const ids = Game.relayAllScenes();
    let maxN = 0;
    ids.forEach(id => {
      const sc = Game.relaySceneById(id);
      (sc.choices || []).forEach(c => { maxN = Math.max(maxN, Math.abs(c.lean || 0)); });
    });
    ok('R3 gradient law: max |nudge| <= 10 across all scenes', maxN <= 10, 'max=' + maxN);
    ok('R3 all 18 scenes registered', ids.length === 18, ids.length + '');
  }
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
