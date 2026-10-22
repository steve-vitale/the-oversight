#!/usr/bin/env node
// probe-splitkill-fight-20261022.js — dumps real TB wave-4 fight state the
// layer sees: fighters, partyMembers, tbIsPlayerTurn, engagedCompanions
// decision. Seed 65501 belongfeast had w4Fights=10, softens=0.
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

function stackFor(base, tag) {
  const r = RP.withReposition(base, tag + '-reposition', tag + ' reposition');
  const v = VR.withVetrel(r, tag + '-vetrel', tag + ' vetrel');
  const w = WD.withWinDefer(v, tag + '-windefer', tag + ' windefer');
  const s = SD.withSeatDrive(w, tag + '-seatdrive', tag + ' seatdrive');
  return SK.withSplitkill(s, tag + '-splitkill', tag + ' + splitkill');
}

async function main() {
  const policy = stackFor(TF.belongfeast, 'belongfeast');
  const { Game } = await loadGame({ seed: 65501, mode: 'splitkill-probe', fullTelemetry: false });
  const origFight = policy.fight;
  let dumped = 0;
  policy.fight = function (G, ctx) {
    try {
      const f = G.tbfight;
      if (f && !f.over) {
        const mids = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
        const mids4 = mids.filter(x => {
          const mid = x.monsterId || (x.mdef || {}).id || x.id;
          const def = ((G.data || {}).monsters || []).find(d => d && d.id === mid);
          return def && def.wave === 4 && !/herald|nielsen|finale/.test(mid);
        });
        if (mids4.length && dumped < 3) {
          dumped++;
          console.log(`--- TB fight d${((G.state || {}).scholar || {}).day} round ${f.round} ---`);
          console.log('tbIsPlayerTurn:', !!(G.tbIsPlayerTurn && G.tbIsPlayerTurn()));
          let party = null;
          try { party = G.partyMembers ? G.partyMembers() : null; } catch (e) { party = 'ERR'; }
          console.log('partyMembers:', JSON.stringify(party));
          for (const x of (f.fighters || [])) {
            console.log(`  key=${x.key} kind=${x.kind} villagerId=${x.villagerId || '-'} hp=${Math.round(x.hp || 0)}/${Math.round(x.maxHp || 0)} mid=${x.monsterId || '-'} fled=${!!x.fled}`);
          }
        }
      }
    } catch (e) { console.log('probe err', e && e.message); }
    return origFight.call(policy, G, ctx);
  };
  SK.resetTele();
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log('tele:', JSON.stringify(SK.tele()));
}
main().catch(e => { console.error('PROBE FAIL:', e && e.stack || e); process.exit(1); });
