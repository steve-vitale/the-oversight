#!/bin/bash
# vet2-det-20261031.sh — sim-vet2-a det-gate: vet2 recorder ON vs OFF
# must not move trajectories (byte-identical hashes + end fields) on 2
# pilot seeds (87115, 87126). Scratch dirs live in the worktree
# (scratch-vet2-det/, deleted before commit) — NEVER the judged corpus,
# NEVER /tmp (sibling cleanup wipes /tmp mid-run).
set -e
cd "$(dirname "$0")/.."
mkdir -p scratch-vet2-det
export FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 WAVEGATE=1
for SEED in 87115 87126; do
  echo "== det seed $SEED: ON =="
  VET2=1 SEEDS=$SEED node scripts/vet2-sweep-20261031.js > scratch-vet2-det/on-$SEED.jsonl 2> scratch-vet2-det/on-$SEED.err
  echo "== det seed $SEED: OFF =="
  SEEDS=$SEED node scripts/vet2-sweep-20261031.js > scratch-vet2-det/off-$SEED.jsonl 2> scratch-vet2-det/off-$SEED.err
  node scripts/vet2-det-compare-20261031.js scratch-vet2-det/on-$SEED.jsonl scratch-vet2-det/off-$SEED.jsonl $SEED
done
echo "DET-GATE COMPLETE"
