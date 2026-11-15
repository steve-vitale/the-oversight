// probe-pilgrim4-b.js — DIAGNOSTIC ONLY (no corpus written). On each
// pilgrimage day, BEFORE the policy runs, replicate walkTo's target
// choice and check EVERY blockage travelTo would check: destination
// blockage AND intermediate-tile blockages on all shortest paths.
// Names the exact blocking tile. Logs via stdout (quietLog silences
// console.log inside runDays). Usage: node scripts/probe-pilgrim4-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { courtshipPolicy, resetCourtshipStats, courtshipStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-courtship-b'));

const SEED = parseInt(process.argv[2] || '100604', 10);
const DAYS = parseInt(process.argv[3] || '200', 10);

function out(s) { process.stdout.write(s + '\n'); }

(async function () {
  resetCourtshipStats();
  const { Game } = await loadGame({ seed: SEED, mode: 'probe-pilgrim4-b', fullTelemetry: false });
  const tally = {};
  let printed = 0;
  const rec = Object.assign({}, courtshipPolicy, {
    daily: function (G, ctx) {
      const day = ((G.state || {}).scholar || {}).day || 0;
      if (ctx._pilgrim) {
        const pg = ctx._pilgrim;
        const tv = ((G.state || {}).otherVillages || []).find(function (v) { return v && v.id === pg.vid; });
        const px = G.map.px, py = G.map.py;
        const targets = (G.travelTargets && G.travelTargets()) || [];
        let best = null, bd = 1e9;
        if (tv) {
          for (const tt of targets) {
            const d = Math.abs(tt.x - tv.x) + Math.abs(tt.y - tv.y);
            if (d < bd) { bd = d; best = tt; }
          }
        }
        // Replicate travelTo's checks for best: destination blockage +
        // intermediate blockages on every shortest path (same scan as
        // game.js travelTo: tiles on a shortest path, entry from the
        // tile before it on the path).
        let destBlock = null;
        let interBlocks = [];
        if (best) {
          try { destBlock = G.travelBlockage(best.x, best.y); } catch (e) {}
          const dTot = Math.abs(best.x - px) + Math.abs(best.y - py);
          if (dTot > 1) {
            for (let ty = Math.min(py, best.y) - 1; ty <= Math.max(py, best.y) + 1; ty++) {
              for (let tx = Math.min(px, best.x) - 1; tx <= Math.max(px, best.x) + 1; tx++) {
                if ((tx === px && ty === py) || (tx === best.x && ty === best.y)) continue;
                const dS = Math.abs(tx - px) + Math.abs(ty - py);
                const dT = Math.abs(best.x - tx) + Math.abs(best.y - ty);
                if (dS === 0 || dS + dT !== dTot) continue;
                for (const o of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                  const ex = tx + o[0], ey = ty + o[1];
                  const dE = Math.abs(ex - px) + Math.abs(ey - py);
                  if (dE !== dS - 1 || dE + 1 + dT !== dTot) continue;
                  let ib = null;
                  try { ib = G.travelBlockage(tx, ty, ex, ey); } catch (e) {}
                  if (ib) interBlocks.push({ tile: tx + ',' + ty, from: ex + ',' + ey, type: ib.blockType });
                }
              }
            }
          }
        }
        // Would ANY offered target move the scholar closer AND pass?
        let altOk = null;
        if (tv) {
          for (const tt of targets) {
            const d = Math.abs(tt.x - tv.x) + Math.abs(tt.y - tv.y);
            const dNow = Math.abs(tv.x - px) + Math.abs(tv.y - py);
            if (d >= dNow) continue;
            let b = null;
            try { b = G.travelBlockage(tt.x, tt.y); } catch (e) {}
            if (!b) { altOk = tt; break; }
          }
        }
        const reason = !best ? 'no-best' : (destBlock ? 'dest-blocked:' + destBlock.blockType : (interBlocks.length ? 'inter-blocked:' + interBlocks[0].type + '@' + interBlocks[0].tile : 'CLEAR'));
        tally[reason] = (tally[reason] || 0) + 1;
        if (printed < 6) {
          printed++;
          out('DAY ' + day + ' ->' + pg.vid + ' at ' + (tv ? tv.x + ',' + tv.y : '?') + ' from ' + px + ',' + py +
            ' dist ' + (tv ? Math.abs(tv.x - px) + Math.abs(tv.y - py) : '?') +
            ' offered=' + targets.length + ' best=' + JSON.stringify(best) + ' bestDist=' + bd);
          out('  reason=' + reason + ' destBlock=' + JSON.stringify(destBlock) +
            ' interBlocks=' + JSON.stringify(interBlocks) + ' altPassingTarget=' + JSON.stringify(altOk));
          out('  offered=' + JSON.stringify(targets.map(function (t) { return [t.x, t.y]; })));
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
  out('DAYS ' + result.days + ' end ' + result.endReason + ' stats ' + JSON.stringify({ pilgrimages: courtshipStats().pilgrimages, pilgrimDays: courtshipStats().pilgrimDays, studies: courtshipStats().studies, aids: courtshipStats().aids }));
  out('WALKTO-CHOICE TALLY (pre-walk, per pilgrim-day): ' + JSON.stringify(tally));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
