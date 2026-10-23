#!/usr/bin/env node
// diag-splitclose-fights-20261022.js — fight-outcome diagnostic for sim-splitclose.
//
// Re-runs ONE deterministic config (the policy is deterministic per E4/D2)
// capturing TB fight outcomes + per-round HP traces for wave-4 fights, to
// answer: why do wave-4 fights end without the discipline ever holding?
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 SPLITCLOSE=1 SEED=65611 BASE=lead \
//   node scripts/diag-splitclose-fights-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE', 'KILLDISC', 'SPLITCLOSE']) {
  if (process.env[k] !== '1') { console.error(`DIAG STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('DIAG STOP: SEATDRIVE=0 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const SC = require(path.join(REPO, 'scripts', 'policies', 'splitclose'));

const SEED = parseInt(process.env.SEED || '65611', 10);
const BASE = (process.env.BASE || 'lead').toLowerCase().startsWith('b') ? 'belongfeast' : 'leadfeast';

function waveOf(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.wave) || 1; }
  catch (e) { return 1; }
}
function midOf(m) { try { return m.monsterId || (m.mdef || {}).id || m.id || null; } catch (e) { return null; } }

async function main() {
  const policy = SC.armedFor(BASE);
  const { Game } = await loadGame({ seed: SEED, mode: 'splitclose-diag', fullTelemetry: false });
  const traces = [];
  let cur = null;
  const oStart = Game.startCombat;
  if (typeof oStart === 'function') {
    Game.startCombat = function (mid) {
      const r = oStart.apply(this, arguments);
      try {
        const f = Game.tbfight;
        if (f && (waveOf(Game, mid) | 0) === 4) {
          cur = { day: ((Game.state || {}).scholar || {}).day || 0, mid, id: f.id, rounds: [], outcome: null };
          traces.push(cur);
        } else cur = null;
      } catch (e) { cur = null; }
      return r;
    };
  }
  const oDmg = Game.tbDamage;
  if (typeof oDmg === 'function') {
    Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey) {
      const r = oDmg.apply(this, arguments);
      try {
        if (cur && Game.tbfight && String(Game.tbfight.id) === String(cur.id)) {
          const tgt = Game.tbFighter ? Game.tbFighter(targetKey) : null;
          if (tgt && tgt.kind === 'monster') {
            cur.rounds.push({ round: Game.tbfight.round || 0, tgtHp: Math.round(tgt.hp || 0), tgtMax: Math.round(tgt.maxHp || tgt.hp || 0), dmg: Math.round(+r || 0), src: String(sourceLabel || '').slice(0, 24), skey: String(sourceKey || '') });
          }
        }
      } catch (e) {}
      return r;
    };
  }
  const oEnd = Game.tbEnd;
  if (typeof oEnd === 'function') {
    Game.tbEnd = function (res) {
      try {
        if (cur && Game.tbfight && String(Game.tbfight.id) === String(cur.id)) cur.outcome = String(res);
      } catch (e) {}
      return oEnd.apply(this, arguments);
    };
  }
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`diag: seed=${SEED} base=${BASE} wave-4 TB fights=${traces.length}`);
  for (const t of traces) {
    const maxHp = t.rounds.length ? t.rounds[0].tgtMax : '?';
    const lastHp = t.rounds.length ? t.rounds[t.rounds.length - 1].tgtHp : '?';
    console.log(`\nd${t.day} ${t.mid} maxHp=${maxHp} outcome=${t.outcome} dmgEvents=${t.rounds.length}`);
    // compact per-round: scholar turn target-HP + total dmg that round
    const byRound = {};
    for (const e of t.rounds) {
      const b = byRound[e.round] || (byRound[e.round] = { hp: [], dmg: 0, scholarDmg: 0 });
      b.hp.push(e.tgtHp); b.dmg += e.dmg;
      if (e.skey === 'p' || /^(you|your)\b/i.test(e.src)) b.scholarDmg += e.dmg;
    }
    for (const rn of Object.keys(byRound).sort((a, b) => a - b).slice(0, 12)) {
      const b = byRound[rn];
      console.log(`  round ${rn}: tgtHp ${Math.max(...b.hp)}->${Math.min(...b.hp)} roundDmg=${b.dmg} scholarDmg=${b.scholarDmg}`);
    }
  }
}
main().catch(e => { console.error('DIAG FAIL: ' + (e && e.stack || e)); process.exit(1); });
