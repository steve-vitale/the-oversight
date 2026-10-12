#!/usr/bin/env node
// test-bearer-recovery-20261012.js — PROOF for journey-succession r9.
//
// BLANK: the death beat says "Somebody else starts digging" — but NOBODY
// ever dug. buried=true was reachable ONLY through the player's own Bury
// button, so the dead bearer's corpse rotted where it fell while a village
// of grieving people never lifted a spade. The fix: the village recovers
// its dead Bearer <redacted> (recoverBearer, fired from endDay) — body
// home to the fire, grave dug, burial left to the successor.
//
// RED on pristine HEAD: no pendingBurials recorded, no recoverBearer, the
// corpse sits at the death node unburied forever.
// GREEN post-fix: overnight recovery say-line, corpse at the haven node,
// recovered=true, still unburied, death pack intact (loot-as-action: take,
// leave, or use — nothing auto-transfers), and the successor's funeral
// beat (payRespects + buryCorpse) still works end to end.
//
// Usage: node scripts/test-bearer-recovery-20261012.js
'use strict';
const { loadGame, setupGame, runDays, mulberry32 } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  Math.random = mulberry32(777);
  const { Game } = await loadGame({ seed: 777, mode: 'bearer-recovery', fullTelemetry: false });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);

  await runDays(Game, competent, { days: 6 });
  const s0 = Game.state.scholar, v0 = Game.state.village;
  const oldId = Game.villagerId;
  const oldName = ((Game.data.villagers || []).find(x => x.id === oldId) || {}).name || 'bearer';
  // plant one honest non-sentimental item: it must ride home on the corpse
  // (lootable death pack) and never auto-transfer to the successor.
  s0.inventory.push({ itemId: 'spare_hatchet', name: 'a spare hatchet', units: 1, kg: 1.0, kcalEach: 0 });
  const oldInvIds = new Set((s0.inventory || []).map(i => i.itemId || i.id || i.name));
  console.log(`bearer: ${oldName}, day ${s0.day}, roster ${(v0.roster || []).length}`);

  const hasRecover = typeof Game.recoverBearer === 'function';

  // ---- the death ----
  const sayMark = says.length;
  Game.playerDeath('the hunt');
  const beat = says.slice(sayMark).join('\n');
  const s1 = Game.state.scholar, v1 = Game.state.village;
  const newId = Game.villagerId;
  check('mantle-passes', !Game.over && newId !== oldId, `over=${Game.over}`);

  const pend = v1.pendingBurials || [];
  check('pending-burial-recorded', hasRecover && pend.length === 1 && pend[0].villagerId === oldId,
    hasRecover ? `pending=${JSON.stringify(pend).slice(0, 120)}` : 'Game.recoverBearer missing (pristine HEAD?)');

  const corpse = (Game.corpses() || []).find(c => c.villagerId === oldId);
  check('corpse-made', !!corpse, corpse ? `node=${JSON.stringify(corpse.node)} buried=${corpse.buried}` : 'none');
  const deathNode = corpse ? JSON.stringify(corpse.node) : null;

  // ---- overnight: the village acts ----
  const recMark = says.length;
  await runDays(Game, competent, { days: 2 });
  const recLines = says.slice(recMark).join('\n');
  const c2 = (Game.corpses() || []).find(x => x && x.id === (corpse && corpse.id));
  const hx = (Game.state.village.px != null ? Game.state.village.px : 4);
  const hy = (Game.state.village.py != null ? Game.state.village.py : 4);
  check('recovery-say-line', hasRecover && /bring .* home/i.test(recLines) && /grave is dug/i.test(recLines),
    hasRecover ? recLines.slice(0, 200) : 'no recoverBearer');
  check('body-brought-home', hasRecover && !!c2 && c2.node && c2.node.x === hx && c2.node.y === hy && c2.mx === 4 && c2.my === 4,
    hasRecover && c2 ? `node=${JSON.stringify(c2.node)} was ${deathNode}` : 'n/a');
  check('grave-dug-not-filled', hasRecover && !!c2 && c2.recovered === true && c2.buried !== true,
    hasRecover && c2 ? `recovered=${c2.recovered} buried=${c2.buried}` : 'n/a');
  check('pending-cleared', hasRecover && ((Game.state.village.pendingBurials || []).length === 0),
    `pending=${JSON.stringify(Game.state.village.pendingBurials)}`);

  // ---- loot-as-action: the pack rode home, nothing auto-transferred ----
  const pack = (c2 && c2.items) || [];
  check('death-pack-intact', hasRecover ? pack.some(i => (i.itemId || i.id) === 'spare_hatchet') : true,
    hasRecover ? `pack=[${pack.map(i=>i.itemId||i.id).join(',')}]` : 'skipped (pristine)');
  const carriedOver = ((Game.state.scholar.inventory || []) || []).filter(i => oldInvIds.has(i.itemId || i.id || i.name) && !i.bonded);
  check('no-auto-transfer', carriedOver.length === 0, `old gear in successor inventory: ${carriedOver.length}`);
  const packSent = pack.filter(i => i.bonded || i.sentimental);
  check('sentimentals-not-lootable', packSent.length === 0, `bonded on corpse: ${packSent.length}`);

  // ---- the funeral: the successor's act ----
  if (hasRecover && c2) {
    const tr0 = Game.state.scholar.trauma || 0;
    const rMark = says.length;
    const pr = Game.payRespects(c2.id);
    const prLine = says.slice(rMark).join(' ');
    check('pay-respects', pr === true && c2.respectsPaid === true && /say a few words/i.test(prLine),
      prLine.slice(0, 160));
    check('respects-steadies', (Game.state.scholar.trauma || 0) <= tr0, `trauma ${tr0} -> ${Game.state.scholar.trauma}`);
    const bMark = says.length;
    const br = Game.buryCorpse(c2.id);
    const bLine = says.slice(bMark).join(' ');
    check('bury-them', br === true && c2.buried === true && /You bury/i.test(bLine), bLine.slice(0, 160));
    check('marker-word', /marker/i.test(bLine), 'burial names the marker');
  } else {
    console.log('  (funeral checks skipped — pristine HEAD)');
  }

  // ---- gate probes: villager-kind death systems (same bug class) ----
  // On pristine HEAD all three gates used bare kind==='person', so every
  // villager death (kind 'villager') silently skipped: no death gossip, no
  // closed person-book, no posthumous reveal. The probes run mid-run while
  // the roster is intact.
  {
    console.log('--- gate probes ---');
    const vv = Game.state.village;
    const npcs = (vv.roster || []).filter(id => id !== Game.villagerId);
    if (npcs.length >= 3) {
      const victim = npcs[0], wit1 = npcs[1], wit2 = npcs[2];
      const seeded = [];
      const _sg = Game.seedGossip;
      Game.seedGossip = function (action, dims, heardBy, noTrust) {
        seeded.push(String(action));
        return _sg ? _sg.call(this, action, dims, heardBy, noTrust) : null;
      };
      const gMark = says.length;
      Game.registerDeath({ kind: 'villager', villagerId: victim, name: 'probe victim', mx: 4, my: 4, cause: 'a fall', witnesses: [wit1, wit2] });
      Game.seedGossip = _sg;
      check('death-gossip-seeded', seeded.some(a => a.indexOf('death:') === 0), `seeded=[${seeded.join(',')}]`);
      const bookLine = says.slice(gMark).join(' ');
      check('person-book-closed', /is finished/.test(bookLine) && /No more pages/.test(bookLine), bookLine.slice(0, 160));
      // reveal gate: pristine rejects kind 'villager' before touching the
      // corpse; fixed passes the gate (sets posthumousRolled) even when the
      // depth guards later decline. A monster corpse must still be rejected.
      const fakeV = { kind: 'villager', villagerId: wit1 };
      Game.posthumousReveal(fakeV);
      check('reveal-gate-open', fakeV.posthumousRolled === true, `rolled=${fakeV.posthumousRolled}`);
      const fakeM = { kind: 'monster', monsterId: 'hushwolf' };
      Game.posthumousReveal(fakeM);
      check('reveal-still-rejects-monster', fakeM.posthumousRolled !== true, `rolled=${fakeM.posthumousRolled}`);
    } else {
      console.log('  (gate probes skipped: roster too small)');
    }
  }

  // ---- second path: player buries same-day, recovery must no-op cleanly ----
  if (hasRecover) {
    const sN = Game.state.scholar;
    const oldId2 = Game.villagerId;
    Game.playerDeath('a boar');
    const c3 = (Game.corpses() || []).find(c => c.villagerId === oldId2);
    if (c3) Game.buryCorpse(c3.id);
    let threw = null;
    try { await runDays(Game, competent, { days: 2 }); } catch (e) { threw = e.message; }
    check('already-buried-noop', !threw && ((Game.state.village.pendingBurials || []).length === 0),
      threw || `pending=${JSON.stringify(Game.state.village.pendingBurials)}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('THREW: ' + e.stack); process.exit(2); });
