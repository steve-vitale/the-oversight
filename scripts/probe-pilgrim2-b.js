// probe-pilgrim2-b.js — DIAGNOSTIC ONLY (no corpus written). WHY does
// walkTo refuse every hop? On each pilgrimage day, BEFORE the policy
// runs, read (pure reads only): the travelTargets list, walkTo's best
// target, travelBlockage(best), the tile types on the shortest path,
// and whether the best target is even offered. Prints the first 3
// pilgrim days in full + a refusal-reason tally over the whole run.
// Usage: node scripts/probe-pilgrim2-b.js [seed] [days]
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { courtshipPolicy, resetCourtshipStats, courtshipStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-courtship-b'));

const SEED = parseInt(process.argv[2] || '100604', 10);
const DAYS = parseInt(process.argv[3] || '200', 10);

(async function () {
  resetCourtshipStats();
  const { Game } = await loadGame({ seed: SEED, mode: 'probe-pilgrim2-b', fullTelemetry: false });
  const tally = {};
  let printed = 0;
  const rec = Object.assign({}, courtshipPolicy, {
    daily: function (G, ctx) {
      const day = ((G.state || {}).scholar || {}).day || 0;
      if (ctx._pilgrim) {
        const pg = ctx._pilgrim;
        const tv = ((G.state || {}).otherVillages || []).find(function (v) { return v && v.id === pg.vid; });
        const px = G.map.px, py = G.map.py;
        let targets = [];
        try { targets = (G.travelTargets && G.travelTargets()) || []; } catch (e) { targets = 'ERR ' + e.message; }
        let best = null, bd = 1e9;
        if (Array.isArray(targets) && tv) {
          for (const tt of targets) {
            const d = Math.abs(tt.x - tv.x) + Math.abs(tt.y - tv.y);
            if (d < bd) { bd = d; best = tt; }
          }
        }
        let block = null;
        try { block = best ? G.travelBlockage(best.x, best.y) : null; } catch (e) { block = 'ERR ' + e.message; }
        // Tile types on the shortest path px,py -> tv.
        let pathTiles = null;
        if (tv) {
          pathTiles = [];
          let cx = px, cy = py;
          let guard = 0;
          while ((cx !== tv.x || cy !== tv.y) && guard++ < 12) {
            if (cx !== tv.x) cx += Math.sign(tv.x - cx); else cy += Math.sign(tv.y - cy);
            let t = null;
            try { t = G.tileAt(cx, cy); } catch (e) {}
            pathTiles.push({ x: cx, y: cy, type: t ? t.type : '?', revealed: !!(t && t.revealed), blockFrom: t && t.blockFrom ? t.blockFrom.type : null });
          }
        }
        const reason = !tv ? 'no-target-village' : (!Array.isArray(targets) ? 'targets-err' : (targets.length === 0 ? 'no-targets-offered' : (!best ? 'no-best' : (block ? 'blocked:' + (block.blockType || block.kind) : 'CLEAR'))));
        tally[reason] = (tally[reason] || 0) + 1;
        if (printed < 3) {
          printed++;
          console.log('DAY ' + day + ' pilgrim->' + pg.vid + ' from ' + px + ',' + py + ' target ' + (tv ? tv.x + ',' + tv.y : '?') +
            ' dist ' + (tv ? Math.abs(tv.x - px) + Math.abs(tv.y - py) : '?'));
          console.log('  targetsOffered=' + (Array.isArray(targets) ? targets.length : targets) +
            ' best=' + JSON.stringify(best) + ' bestDistToTarget=' + bd + ' blockage=' + JSON.stringify(block) + ' reason=' + reason);
          console.log('  pathTiles=' + JSON.stringify(pathTiles));
          console.log('  scholarTile=' + JSON.stringify((function () { try { const t = G.tileAt(px, py); return t ? { type: t.type, revealed: !!t.revealed } : null; } catch (e) { return 'ERR'; } })()));
        }
      }
      return courtshipPolicy.daily(G, ctx);
    },
  });
  await setupGame(Game);
  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, rec, { days: DAYS, manifest: undefined, sampleEvery: 1 });
  });
  console.log('DAYS ' + result.days + ' end ' + result.endReason + ' stats ' + JSON.stringify({ pilgrimages: courtshipStats().pilgrimages, pilgrimDays: courtshipStats().pilgrimDays, studies: courtshipStats().studies, aids: courtshipStats().aids }));
  console.log('REFUSAL TALLY (pre-walk read, per pilgrim-day): ' + JSON.stringify(tally));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
