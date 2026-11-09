#!/bin/bash
# flap-waiter-r121: wait for the EPERM write flap to clear, then preserve
# the pre-fix AFTER corpus (landing-r121-after) as landing-r121-after-prefix.
# Probe design (per AGENTS.md flap lesson): unique O_EXCL file per attempt,
# unlink on EVERY outcome (a failed write must not leave a 0-byte file that
# blinds later probes). Require 2 consecutive successes 10s apart before
# copying, so a seconds-long blip does not start a copy that dies midway.
# Exits 0 with the copy done, 1 on timeout (40 min).
SRC=~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-09/landing-r121-after
DST=~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-09/landing-r121-after-prefix
ok=0
for i in $(seq 1 120); do
  f="/tmp/flapwait-r121-$RANDOM.tmp"
  if (set -o noclobber; echo ok > "$f") 2>/dev/null; then
    rm -f "$f"
    ok=$((ok+1))
    echo "$(date -u +%H:%M:%S) probe OK ($ok/2)"
    if [ "$ok" -ge 2 ]; then
      echo "$(date -u +%H:%M:%S) sustained window — copying corpus"
      rm -rf "$DST"
      if cp -r "$SRC" "$DST" 2>/tmp/flapwait-cp.err; then
        echo "$(date -u +%H:%M:%S) COPY DONE: $(ls "$DST" | wc -l) files"
        exit 0
      else
        echo "$(date -u +%H:%M:%S) copy failed mid-window — resuming probe"
        rm -rf "$DST"
        ok=0
      fi
    fi
  else
    rm -f "$f"
    ok=0
  fi
  sleep 20
done
echo "TIMEOUT after 40 min — flap still active"
exit 1
