// The hall is at Haven; a successful crossing must precede the wild-door test.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('enter-building-guard');
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED || 20261017), narration: true });
  K.newRun(G);
  const s = G.state.scholar;
  T.ok('starts at Haven', G.playerTile().type === 'haven');
  s.insideHaven = false; // prepared on the grounds, outside the hall
  T.ok('enterBuilding works at Haven', G.enterBuilding() === true && s.insideHaven === true);
  const home = { x: G.map.px, y: G.map.py };
  T.ok('actual hall exit works', G.exitBuilding() === true && s.insideHaven === false);
  const target = G.travelTargets().find(t => t.d === 1 && G.tileAt(t.x, t.y).type !== 'haven' && !G.travelBlockage(t.x, t.y));
  T.ok('a legal adjacent wild destination exists', !!target);
  if (!target) throw new Error('Cannot prepare legal crossing');
  T.ok('crossing starts outside combat and ending', !G.over && !G.inCombat());
  const result = G.travelTo(target.x, target.y);
  T.ok('real travel reaches selected adjacent destination', G.map.px === target.x && G.map.py === target.y && !(result && result.kind === 'blockage'));
  T.ok('left Haven', G.playerTile().type !== 'haven' && (G.map.px !== home.x || G.map.py !== home.y));
  T.ok('arrival is outside the hall and combat', !s.insideHaven && !G.inCombat() && !G.over);
  const at = { x: G.map.px, y: G.map.py, mx: s.mx, my: s.my };
  T.ok('enterBuilding refuses in the wild', G.enterBuilding() === false);
  T.ok('insideHaven stays false in the wild', s.insideHaven === false);
  T.ok('refusal does not reposition the scholar', JSON.stringify(at) === JSON.stringify({ x:G.map.px, y:G.map.py, mx:s.mx, my:s.my }));
  T.ok('pantry gate remains closed in the wild', G.havenStoresAccess() === 'none' || G.havenStoresAccess() === 'outside');
  T.done();
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; });
