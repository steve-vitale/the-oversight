// overcourtrestage-sense.js — sense-reading for the overcourt confirm
// (sim-overcourt-restage, axis scale-onramp, run fleshout-20261023T2015Z).
//
// SENSE-TESTING LAW: on the highest-dip armed config (s68912, armed-leadfeast:
// end dip 170, 5 links, survived 180d), read the link/dip beats for MEANING —
// never just counts. Re-runs the identical armed policy + env on seed 68912
// (deterministic) and prints the link-history beat transcript in
// chronological order: formations, seasonings, accords, national beats,
// funerals, dissolutions — the fiction the numbers rode on.
//
// Namespace overcourtrestage-*. Read-only: no game code touched, no new
// per-seed corpus (prints to stdout; the evidence file quotes it).
//
// Usage (pinned substrate):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 LINKFORM=2 node scripts/overcourtrestage-sense.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const LF = require(path.join(REPO, 'scripts', 'policies', 'linkform'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0' || process.env.LINKFORM !== '2') { console.error('STOP: SEATDRIVE=0 and LINKFORM=2 required.'); process.exit(2); }

function gday(Game) { try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; } }

if (require.main === module) {
  (async () => {
    const policy = LF.linkformArmedFor();
    const { Game } = await loadGame({ seed: 68912, mode: 'overcourtrestage-sense', fullTelemetry: false });
    await setupGame(Game);
    const seen = new Set();
    const beats = [];
    const wrapped = Object.assign({}, policy, {
      daily(Gm, ctx) {
        let r;
        try { r = policy.daily(Gm, ctx); } finally {
          try {
            const links = (typeof Gm.hierarchyState === 'function') ? (Gm.hierarchyState() || []) : [];
            for (const l of links) {
              const other = l.primary === 'haven' ? l.subordinate : (l.subordinate === 'haven' ? l.primary : null);
              if (!other) continue;
              for (const h of (l.history || [])) {
                const key = h.day + '|' + h.kind + '|' + h.note;
                if (seen.has(key)) continue;
                seen.add(key);
                let ov = String(other);
                try { ov = Game._ovName ? Game._ovName(other) : ov; } catch (e) {}
                beats.push({ d: h.day | 0, link: ov, k: String(h.kind || ''), n: String(h.note || '') });
              }
            }
          } catch (e) {}
        }
        return r;
      },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: 180, manifest: undefined, sampleEvery: 30 }); });
    beats.sort((a, b) => a.d - b.d);
    // dip trajectory for anchoring
    let dipLine = [];
    try {
      const st = Game.villageStanding ? Game.villageStanding() : null;
      dipLine.push('end dip=' + (st ? st.diplomacy : '?') + ' links=' + (st ? st.links : '?'));
    } catch (e) {}
    console.log('sense s68912 armed-leadfeast: ' + dipLine.join(' '));
    for (const b of beats) console.log(`d${b.d} [${b.k}] (${b.link}) ${b.n}`);
  })().catch(e => { console.error(e && e.stack || e); process.exit(1); });
}
