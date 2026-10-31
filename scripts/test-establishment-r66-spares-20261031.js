// Proof for r66 SPARES-BUG: census-start bark/hide pieces held as raw
// strings are invisible to the r65 spares filter (it.itemId only).
// Pass: >=1 string-form armor piece found at setup on seed 341.
const { loadGame, setupGame } = require('./sim-harness');
(async () => {
  const { Game } = await loadGame({ seed: 341, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  console.log('armorSeedVid:', v.armorSeedVid);
  for (const id of (v.roster || [])) {
    const p = Game.getPerson ? Game.getPerson(id) : null; if (!p) continue;
    const raw = (p.items || []).filter(it => (typeof it === 'string' ? it : (it.itemId || it.id)) === 'bark_armor' || (typeof it === 'string' ? it : (it.itemId || it.id)) === 'hide_armor');
    if (raw.length) console.log(id, 'rawArmorItems:', JSON.stringify(raw), 'worn:', JSON.stringify(Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean)));
    const oldMiss = raw.filter(it => typeof it === 'string').length;
    if (oldMiss) console.log('  -> string-form pieces the r65 filter would miss:', oldMiss);
  }
  let stringPieces = 0;
  for (const id of (v.roster || [])) {
    const p = Game.getPerson ? Game.getPerson(id) : null; if (!p) continue;
    for (const it of (p.items || [])) if (typeof it === 'string' && (it === 'bark_armor' || it === 'hide_armor')) stringPieces++;
  }
  console.log('STRING_FORM_ARMOR_PIECES=' + stringPieces);
  if (stringPieces < 1) { console.error('FAIL: no string-form armor piece at census start'); process.exit(1); }
  console.log('PASS: r65 filter misses ' + stringPieces + ' string-form armor piece(s) at census start');
})();
