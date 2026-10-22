#!/usr/bin/env node
// probe-splitkill-fight2 — replicate layer reads exactly.
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13','TRIBFLOOR','SUCCGRACE','RAIDDENSITY','WINPURSUIT','WINDEFER','NODEWITNESS','KILLDISC']) {
  if (process.env[k] !== '1') { console.error('PROOF STOP: '+k+'=1 required.'); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0.'); process.exit(2); }
process.env.SPLITKILL = '1';
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const SK = require(path.join(REPO, 'scripts', 'policies', 'splitkill'));
var TITANS = { herald: true, nielsen: true, finale: true };
function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }
function beastWaveOf(Game, mid) {
  try { const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid); return (def && def.wave) || 1; } catch (e) { return 1; }
}
function stackFor(base, tag) {
  const r = RP.withReposition(base, tag + '-reposition', tag + ' reposition');
  const v = VR.withVetrel(r, tag + '-vetrel', tag + ' vetrel');
  const w = WD.withWinDefer(v, tag + '-windefer', tag + ' windefer');
  const s = SD.withSeatDrive(w, tag + '-seatdrive', tag + ' seatdrive');
  return SK.withSplitkill(s, tag + '-splitkill', tag + ' + splitkill');
}
async function main() {
  const policy = stackFor(TF.belongfeast, 'belongfeast');
  const { Game } = await loadGame({ seed: 65501, mode: 'splitkill-probe2', fullTelemetry: false });
  const origFight = policy.fight;
  let dumped = 0, seenFights = 0;
  const BUF = [];
  const seen = new Set();
  policy.fight = function (G, ctx) {
    try {
      const f = G.tbfight;
      if (f && !f.over) {
        const id = f.id || '?';
        if (!seen.has(id)) {
          seen.add(id); seenFights++;
          const w4 = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled &&
            !TITANS[beastMidOf(x)] && beastWaveOf(G, beastMidOf(x)) === 4);
          if (w4.length && dumped < 2) {
            dumped++;
            BUF.push(`=== new TB fight id=${id} d${((G.state || {}).scholar || {}).day} round ${f.round} ===`);
            BUF.push('tbIsPlayerTurn: ' + (!!(G.tbIsPlayerTurn && G.tbIsPlayerTurn())));
            let party = null;
            try { party = G.partyMembers ? G.partyMembers() : null; } catch (e) { party = 'ERR:' + (e && e.message); }
            BUF.push('partyMembers: ' + JSON.stringify(party));
            for (const x of (f.fighters || [])) {
              const mid = beastMidOf(x);
              BUF.push(`  key=${x.key} kind=${x.kind} vid=${x.villagerId || '-'} hp=${Math.round(x.hp || 0)}/${Math.round(x.maxHp || 0)} mid=${mid} wave=${x.kind==='monster'?beastWaveOf(G, mid):'-'} fled=${!!x.fled} alive=${!!x.alive}`);
            }
          }
        }
      }
    } catch (e) { console.log('probe err', e && e.message); }
    return origFight.call(policy, G, ctx);
  };
  SK.resetTele();
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(BUF.join('\n'));
  console.log('seenFights:', seenFights, 'dumped:', dumped, 'tele:', JSON.stringify(SK.tele()));
}
main().catch(e => { console.error('PROBE FAIL:', e && e.stack || e); process.exit(1); });
