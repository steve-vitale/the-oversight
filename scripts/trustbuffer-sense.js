// trustbuffer-sense.js — sense-reading for the trustbuffer lever
// (sim-trustbuffer, axis scale-onramp, run fleshout-20261023T2217Z).
//
// SENSE-TESTING LAW: on the highest-dip armed config, read the link/dip
// beats for MEANING — never just counts. Re-runs the identical armed
// policy + env on the given seed (deterministic) and prints the
// link-history beat transcript in chronological order: formations,
// seasonings, accords, national beats, funerals, dissolutions — the fiction
// the numbers rode on.
//
// Namespace trustbuffer-*. Read-only: no game code touched, no new per-seed
// corpus (prints to stdout; the evidence file quotes it).
//
// Usage (pinned substrate):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 LINKFORM=2 TRUSTBUFFER=1 \
//   node scripts/trustbuffer-sense.js <seed> <leadfeast|belongfeast>
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TB = require(path.join(REPO, 'scripts', 'policies', 'trustbuffer'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0' || process.env.LINKFORM !== '2' || process.env.TRUSTBUFFER !== '1') {
  console.error('STOP: SEATDRIVE=0, LINKFORM=2 and TRUSTBUFFER=1 required.'); process.exit(2);
}
const SEED = parseInt(process.argv[2] || '69001', 10);
const POLICY = process.argv[3] || 'leadfeast';
if (!['leadfeast', 'belongfeast'].includes(POLICY)) { console.error('STOP: POLICY must be leadfeast|belongfeast.'); process.exit(2); }

if (require.main === module) {
  (async () => {
    const policy = POLICY === 'leadfeast' ? TB.trustbufferArmedFor() : TB.trustbufferBelongArmedFor();
    const { Game } = await loadGame({ seed: SEED, mode: 'trustbuffer-sense', fullTelemetry: false });
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
    let dipLine = [];
    try {
      const st = Game.villageStanding ? Game.villageStanding() : null;
      dipLine.push('end dip=' + (st ? st.diplomacy : '?') + ' links=' + (st ? st.links : '?'));
    } catch (e) {}
    console.log(`sense s${SEED} armed-${POLICY}: ` + dipLine.join(' '));
    for (const b of beats) console.log(`d${b.d} [${b.k}] (${b.link}) ${b.n}`);
  })().catch(e => { console.error(e && e.stack || e); process.exit(1); });
}
