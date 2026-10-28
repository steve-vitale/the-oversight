#!/usr/bin/env bash
# run-eggomen-cohorts-20261026.sh — staged cohort + taunt sweep driver.
# One harness per child process (sequential). Appends one JSON line per
# staged village to the two evidence JSONL files (created fresh each run).
# Usage: bash scripts/run-eggomen-cohorts-20261026.sh
set -u
cd "$(dirname "$0")/.." || exit 1
OMEN_OUT="evidence/2026-10-26/sim-eggomen-cohorts.jsonl"
TAUNT_OUT="evidence/2026-10-26/sim-eggomen-taunt.jsonl"
: > "$OMEN_OUT"
: > "$TAUNT_OUT"
for seed in 88201 88202 88203 88204 88205 88206 88207 88208; do
  STAGE_SEED=$seed STAGE_WAVE=5 STAGE_RANK=regional STAGE_APOC=finale STAGE_TID=finale node scripts/stage-eggomen-a-20261026.js >> "$OMEN_OUT"
  STAGE_SEED=$seed STAGE_WAVE=5 STAGE_RANK=national STAGE_APOC=finale STAGE_TID=finale node scripts/stage-eggomen-a-20261026.js >> "$OMEN_OUT"
  STAGE_SEED=$seed STAGE_WAVE=5 STAGE_RANK=regional STAGE_APOC=nielsen STAGE_TID=nielsen node scripts/stage-eggomen-a-20261026.js >> "$OMEN_OUT"
  STAGE_SEED=$seed STAGE_WAVE=4 STAGE_RANK=regional STAGE_APOC=finale STAGE_TID=finale node scripts/stage-eggomen-a-20261026.js >> "$OMEN_OUT"
done
# Taunt curve: trusted links 0..5 (trust 71, opinion 10, 10 adults/village).
for n in 0 1 2 3 4 5; do
  TAUNT_SEED=88301 TAUNT_LINKS=$n TAUNT_TRUST=71 TAUNT_OPINION=10 node scripts/stage-eggomen-taunt-20261026.js >> "$TAUNT_OUT"
done
# Pilot-typical bands: 3 base-trust links; 3 refusal-trust links;
# the 88111 diagnostic profile (trusts 71/38/35, opinions 10/0/0 —
# expected 6+2+2 = 10 blades, the herald's exact gate).
TAUNT_SEED=88301 TAUNT_LINKS=3 TAUNT_TRUST=38 TAUNT_OPINION=0 node scripts/stage-eggomen-taunt-20261026.js >> "$TAUNT_OUT"
TAUNT_SEED=88301 TAUNT_LINKS=3 TAUNT_TRUST=20 TAUNT_OPINION=0 node scripts/stage-eggomen-taunt-20261026.js >> "$TAUNT_OUT"
TAUNT_SEED=88301 TAUNT_LINKS=3 TAUNT_TRUSTS=71,38,35 TAUNT_OPINIONS=10,0,0 node scripts/stage-eggomen-taunt-20261026.js >> "$TAUNT_OUT"
# Seed stability on the key threshold profile (3 trusted).
TAUNT_SEED=88302 TAUNT_LINKS=3 TAUNT_TRUST=71 TAUNT_OPINION=10 node scripts/stage-eggomen-taunt-20261026.js >> "$TAUNT_OUT"
echo "omen lines: $(wc -l < "$OMEN_OUT"), taunt lines: $(wc -l < "$TAUNT_OUT")"
