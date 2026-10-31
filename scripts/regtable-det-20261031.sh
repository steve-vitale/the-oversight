#!/usr/bin/env bash
# regtable-det-20261031.sh — det-gate for the regtable-diag recorder.
#
# Runs seeds 87103 and 87121 twice each (REGTABLE=1 ON vs unset OFF;
# the rest of the stack identical, wavegate recorder ON in both legs)
# through the stdout runner + idle splitter into worktree scratch
# dirs (scratch-regtable-det/, NEVER the judged corpus, never /tmp),
# then compares dayHash arrays + end fields. Requirement:
# byte-identical hashes and identical end fields on both seeds.
# Usage: bash scripts/regtable-det-20261031.sh
set -u
cd "$(dirname "$0")/.." || exit 2
SCRATCH="scratch-regtable-det"
rm -rf "$SCRATCH"
mkdir -p "$SCRATCH"
export FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 WAVEGATE=1
export SEEDS="87103,87121"
export DAYS=200
export REGTABLE=1
node scripts/regtable-sweep-20261031.js > "$SCRATCH/on.jsonl" 2> "$SCRATCH/on.log" || { echo "DET STOP: ON sweep failed"; tail -20 "$SCRATCH/on.log"; exit 2; }
node scripts/regtable-split-20261031.js "$SCRATCH/on.jsonl" "$SCRATCH/on" || exit 2
unset REGTABLE
node scripts/regtable-sweep-20261031.js > "$SCRATCH/off.jsonl" 2> "$SCRATCH/off.log" || { echo "DET STOP: OFF sweep failed"; tail -20 "$SCRATCH/off.log"; exit 2; }
node scripts/regtable-split-20261031.js "$SCRATCH/off.jsonl" "$SCRATCH/off" || exit 2
node - "$SCRATCH" <<'EOF'
const fs = require('fs');
const dir = process.argv[2];
let fail = 0;
for (const seed of ['87103', '87121']) {
  const on = JSON.parse(fs.readFileSync(`${dir}/on/leadfeast/s${seed}.json`, 'utf8'));
  const off = JSON.parse(fs.readFileSync(`${dir}/off/leadfeast/s${seed}.json`, 'utf8'));
  const hashEq = JSON.stringify(on.hashes) === JSON.stringify(off.hashes);
  const fields = ['gameDays', 'won', 'national', 'table', 'maxWave', 'endScaleRank', 'endReason'];
  const fieldEq = fields.every(f => JSON.stringify(on[f]) === JSON.stringify(off[f]));
  console.log(`s${seed}: hashes ${hashEq ? 'IDENTICAL' : 'DIFFER'} (${on.hashes.length} vs ${off.hashes.length}) fields ${fieldEq ? 'IDENTICAL' : 'DIFFER'} gameDays=${on.gameDays} won=${on.won} nat=${on.national} table=${on.table} maxWave=${on.maxWave} rank=${on.endScaleRank} end=${on.endReason}`);
  if (!hashEq || !fieldEq) { fail = 1; for (const f of fields) { if (JSON.stringify(on[f]) !== JSON.stringify(off[f])) console.log(`  field ${f}: ON=${JSON.stringify(on[f])} OFF=${JSON.stringify(off[f])}`); } }
}
process.exit(fail);
EOF
