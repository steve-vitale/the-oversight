#!/bin/bash
# leg2drift-adopt-run.sh — ADOPTION runner for the sim-leg2drift-b sweep (NOT committed).
# Adapted from the dead arm's leg2drift-run.sh: WT = adopt tree, plus the
# 12th reference anchor 141126b07 (current master at adoption; run in this
# worktree directly, no scratch tree). Subsets: gate9 | gate141 | pairs | refs | placeholders
# NEVER writes to /tmp. Outputs land in the adopt corpus dir only.
# Sweep stdout/stderr stream to the caller's pipe (never redirected to a file).
set -u
WT=~/workspace/worktrees/sim-leg2drift-adopt-b
CORPUS="$WT/evidence/2026-10-24/leg2drift-b-corpus"
SEEDS="9250 9251 9252 9253 9254 9255 9256 9257"
MASTER9=9ad6ef81fc9550fb6edd1f93567e32ad3d0c572e
MASTER141=141126b07eb55ef6e0993f8edbf3ecfb7b0dd232

run_one() { # $1=anchor_sha $2=dir $3=side(pd0|pd1) $4=pd $5=seed
  local sha="$1" dir="$2" side="$3" pd="$4" seed="$5"
  local short="${sha:0:8}"
  local out="$CORPUS/leg2drift-b-${short}-${side}-dg1-leadfeast-s${seed}.json"
  if python3 -c "import json,sys; d=json.load(open('$out')); assert d['anchorCommit']=='$sha' and d['seed']==$seed" 2>/dev/null; then
    echo "SKIP $short $side s$seed (already valid)"
    return 0
  fi
  echo "START $short $side s$seed"
  ( cd "$dir" && FEASTSCALE_R13=1 SEATDRIVE=0 ANCHOR="$sha" SIDE="$side" PLENTYDEPRI="$pd" DEPOSITGATE=1 POLICY=leadfeast SEEDS="$seed" DAYS=100 PERSEED_DIR="$CORPUS" OUT="$CORPUS/sweep-${short}-${side}-dg1-leadfeast.json" node scripts/sweep-leg2drift-b.js )
  local rc=$?
  echo "DONE $short $side s$seed rc=$rc"
  return $rc
}

run_anchor() { # $1=sha $2=dir
  local sha="$1" dir="$2"
  for side_pd in "pd0 0" "pd1 1"; do
    set -- $side_pd
    for seed in $SEEDS; do run_one "$sha" "$dir" "$1" "$2" "$seed" || echo "WARN $sha $1 s$seed failed"; done
  done
}

gate_check() { # $1=short
  python3 - "$CORPUS" "$1" <<'EOF'
import json, glob, sys
def side(pd):
    rot = days = 0
    for f in glob.glob(sys.argv[1] + '/leg2drift-b-' + sys.argv[2] + '-' + pd + '-dg1-leadfeast-s*.json'):
        d = json.load(open(f)); rot += d['rotFreshKcal'] + d['rotPreservedKcal']; days += d['daysAlive']
    return rot / days * 100 if days else 0
r0, r1 = side('pd0'), side('pd1')
ratio = r1 / r0 if r0 else 0
print(f'GATE {sys.argv[2]} pd0={r0:.0f} pd1={r1:.0f} ratio={ratio:.3f}')
sys.exit(0 if ratio <= 0.75 else 3)
EOF
}

SUBSET="${1:-all}"
echo "RUNNER START subset=$SUBSET pid=$$"
case "$SUBSET" in
  gate9)
    run_anchor "$MASTER9" "$WT/bisect-scratch/$MASTER9"
    if gate_check 9ad6ef81; then echo "GATE9 PASS (OLD)"; else echo "GATE9 STOP (not OLD)"; exit 3; fi
    ;;
  gate141)
    run_anchor "$MASTER141" "$WT"
    if gate_check 141126b0; then echo "GATE141 PASS (OLD)"; else echo "GATE141 NOT-OLD (reported, changes no pair verdict)"; fi
    ;;
  pairs)
    run_anchor 07a3ede32d8c0eb38588994ddcd61baca1c92889 "$WT/bisect-scratch/07a3ede32d8c0eb38588994ddcd61baca1c92889"
    run_anchor fa10e1ca8870096936f1007ad86076ae5dc2fa02 "$WT/bisect-scratch/fa10e1ca8870096936f1007ad86076ae5dc2fa02"
    run_anchor 0b151e0e163b21f07606f9cd06dd9d675e6225d2 "$WT/bisect-scratch/0b151e0e163b21f07606f9cd06dd9d675e6225d2"
    run_anchor 2c2336dd9e254406dd3db9e39cac319068c357ff "$WT/bisect-scratch/2c2336dd9e254406dd3db9e39cac319068c357ff"
    run_anchor 1f24a4ef04a857d33138fd0845cfa83df688285c "$WT/bisect-scratch/1f24a4ef04a857d33138fd0845cfa83df688285c"
    run_anchor 75fdd92587ad9d83bb12f05da535cdfb49255835 "$WT/bisect-scratch/75fdd92587ad9d83bb12f05da535cdfb49255835"
    run_anchor be55cfc2c927d77a0099264019ea299c86488c6c "$WT/bisect-scratch/be55cfc2c927d77a0099264019ea299c86488c6c"
    ;;
  refs)
    run_anchor 6722215c6263fc0a4a364b2981cab56883e29523 "$WT/bisect-scratch/6722215c6263fc0a4a364b2981cab56883e29523"
    run_anchor 795156dcd052bd9578009ca3a5ba64a2875d0524 "$WT/bisect-scratch/795156dcd052bd9578009ca3a5ba64a2875d0524"
    run_anchor 1a4c9b696978ac2a099cd6b40bdfb010c9de0137 "$WT/bisect-scratch/1a4c9b696978ac2a099cd6b40bdfb010c9de0137"
    ;;
  placeholders)
    for sha in 9ad6ef81fc9550fb6edd1f93567e32ad3d0c572e 141126b07eb55ef6e0993f8edbf3ecfb7b0dd232 07a3ede32d8c0eb38588994ddcd61baca1c92889 fa10e1ca8870096936f1007ad86076ae5dc2fa02 0b151e0e163b21f07606f9cd06dd9d675e6225d2 2c2336dd9e254406dd3db9e39cac319068c357ff 1f24a4ef04a857d33138fd0845cfa83df688285c 75fdd92587ad9d83bb12f05da535cdfb49255835 be55cfc2c927d77a0099264019ea299c86488c6c 6722215c6263fc0a4a364b2981cab56883e29523 795156dcd052bd9578009ca3a5ba64a2875d0524 1a4c9b696978ac2a099cd6b40bdfb010c9de0137; do
      short="${sha:0:8}"
      for side in pd0 pd1; do
        for seed in $SEEDS; do
          f="$CORPUS/leg2drift-b-${short}-${side}-dg1-leadfeast-s${seed}.json"
          [ -e "$f" ] || : > "$f" || echo "PLACEHOLDER-FAIL $f"
        done
        sf="$CORPUS/sweep-${short}-${side}-dg1-leadfeast.json"
        [ -e "$sf" ] || : > "$sf" || echo "PLACEHOLDER-FAIL $sf"
      done
    done
    echo "PLACEHOLDERS DONE"
    ;;
  all)
    bash "$0" gate9 || exit $?
    bash "$0" gate141
    bash "$0" pairs
    bash "$0" refs
    ;;
  *) echo "unknown subset $SUBSET"; exit 2 ;;
esac
echo "RUNNER DONE subset=$SUBSET"
