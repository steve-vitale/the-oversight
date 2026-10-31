#!/usr/bin/env bash
# wavegate-det-20261031.sh — sim-wavegate-a trajectory-neutrality det-gate.
#
# Runs 2 pilot seeds twice each — recorder ON vs recorder OFF (same
# stack, same seeds) — to scratch dirs under /tmp (never the judged
# corpus), then compares dayHash arrays + end fields. Requirement:
# byte-identical hashes and identical end fields on both seeds.
# A mismatch stops the run on instrument grounds (see prereg).
set -e
cd "$(dirname "$0")/.."
export FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
for SEED in 87104 87127; do
  echo "=== det seed $SEED: ON ==="
  WAVEGATE=1 EVID=/tmp/wavegate-det/on SEEDS="$SEED" node scripts/wavegate-sweep-20261031.js
  echo "=== det seed $SEED: OFF ==="
  WAVEGATE=0 EVID=/tmp/wavegate-det/off SEEDS="$SEED" node scripts/wavegate-sweep-20261031.js
done
node -e '
const fs = require("fs");
let ok = true;
for (const s of [87104, 87127]) {
  const on = JSON.parse(fs.readFileSync(`/tmp/wavegate-det/on/leadfeast/s${s}.json`, "utf8"));
  const off = JSON.parse(fs.readFileSync(`/tmp/wavegate-det/off/leadfeast/s${s}.json`, "utf8"));
  const hashEq = JSON.stringify(on.hashes) === JSON.stringify(off.hashes);
  const fields = ["gameDays", "won", "national", "table", "maxWave", "endScaleRank", "endReason"];
  const fieldEq = fields.every(f => JSON.stringify(on[f]) === JSON.stringify(off[f]));
  console.log(`s${s}: hashes ${hashEq ? "IDENTICAL" : "DIFFER"} (${on.hashes.length} vs ${off.hashes.length}); end fields ${fieldEq ? "IDENTICAL" : "DIFFER"}`);
  if (!hashEq || !fieldEq) { ok = false; for (const f of fields) if (JSON.stringify(on[f]) !== JSON.stringify(off[f])) console.log(`  field ${f}: on=${JSON.stringify(on[f])} off=${JSON.stringify(off[f])}`); }
}
if (!ok) { console.error("DET-GATE FAILED"); process.exit(1); }
console.log("DET-GATE PASSED: recorder is trajectory-neutral on both seeds.");
'
