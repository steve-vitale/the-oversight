# sim-winnability-round-0030 — Loop B 0030Z adoption

**Run:** `fleshout-loop-b-20261123T0030Z`, axis winnability-chain. The occurrence
timed out ~02:29Z Nov 23 with no commits, no merges, no verdicts. Adopted and
finished by the adoption coordinator; both arms verified from git/files, not
from worker reports.

**Verdicts:**
- **sim-gateavoid-b — NO-GO (D1, kind METRIC-BROKEN).** The durable gate-avoid
  log is PROVEN (D6 passes; the armed leg's 'proj' avoid on the only pool door
  is attributed from the log — zero surviving notes for it), but the D1 bar
  (−20pp on the bad-outcome rate) is mathematically unpassable on this band:
  the control pool collapsed to a single door that was already GOOD (vKill).
  D2–D6 all PASS; M5 PASS. Next run needs a door-richer band.
- **sim-launchfield-horizon-b — DIAG-NO-GO (completeness).** Pilot band
  DIAG-GO on every bar; confirm band fails by exactly one instance-day (seed
  107447, visjoin_134/editor, day 150, parts 0–3, all `no-rows`) — the
  holder-state sampler writes zero rows village-wide on the final day, so the
  frozen horizon clause (which needs ≥1 row that day) cannot fire. Mechanism
  DENIED on both bands. Next run's question: extend the clause to the
  zero-row final day, or fix the sampler to sample the final day.

**Merges (ff-only, exit codes verified directly):**
- sim-gateavoid-b: commit 2e8f95216 → rebased ed728ad09 (onto 658d6c561) →
  e9a51b601 (onto 8a032676f) → **a8ff84fd8** (onto c2c6ed9eb) → merged
  (MERGE EXIT=0). Master moved twice more during the adoption (r155
  `658d6c561`, 0215Z round record `8a032676f`, endgame r270 `c2c6ed9eb`);
  each rebase was clean and the arm content was verified byte-identical
  across rebases.
- sim-launchfield-horizon-b: commit be4461d82 → rebased 33bde8a5b (onto
  658d6c561) → 75c281057 (onto 8a032676f) → e53ade737 (onto c2c6ed9eb) →
  **86e5bd38e** (onto a8ff84fd8, after the arm-1 merge moved master) →
  merged (MERGE EXIT=0; the first merge attempt correctly failed ff-only
  with exit 128 on the diverged base, and the rebase-then-merge fixed it).

**Rebased-tip proof re-runs:**
- Arm 2: proof test 51/53 on every rebased tip (33bde8a5b, 75c281057,
  e53ade737, 86e5bd38e). The 2 failures are BOTH §1 freeze-time assertions
  that MUST fail after any rebase, by design: (1) merge-base is the current
  master tip, not the frozen base 4e805681a050 (the anchor tripwire doing
  its job — the driver refuses legs on a non-frozen base, exit 2); (2)
  src/js differs from the frozen base (r155's `villager-build.js` +10,
  then the gateavoid `villager-agency.js` change after the arm-1 merge) —
  this arm contributes zero src changes. Everything else passes: analyzer
  selftest 71/71, §3b old-band regression, §6 anchor literal, §6b tripwire
  (incl. the genuine-rebase comparison). The legs were NOT re-run after any
  rebase; the instrument merges as-is with the literal anchor.
- Arm 1: full proof battery re-run on the rebased tip ed728ad09 — node-check
  green ×4; 18/18, 35/35, 16/16, 29/29, 49/49, 25/25, 48/48, 43/43, 50/50,
  55/55, M3j 36/36, analyzer selftest 39/39 (the selftest ran separately —
  the battery script omitted the `--selftest` flag the first time; the
  analyzer with no args prints usage). Smoke re-runs on the later tips
  (e9a51b601, a8ff84fd8): M3j 36/36 + selftest 39/39 — the intervening
  commits were evidence-only (0215Z round record) or unrelated scripts
  (endgame r270), and the arm content was verified byte-identical across
  each rebase, so the full battery was not re-run for those.

**Arm 1 — sim-gateavoid-b (durable gate-avoid log + leaderproj re-judge)**
- Frozen base `0b3993e80`; band 107391–107398 (leaderproj band, reused
  deliberately). Control: substrate + DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1;
  armed: control + LEADERPROJ=1. Policy `1884c8852d38`, 150d death-aware.
- Build: `src/js/villager-agency.js` +40/−3 (three gate-fire blocks append to
  lazily-created `st.gateAvoids`; no RNG drawn); driver stamps `gateAvoidLog`.
- Proof battery (adoption re-run, pre-commit): node-check green ×4;
  18/18, 35/35, 16/16, 29/29, 49/49, 25/25, 48/48, 43/43, 50/50, 55/55,
  M3j test-gateavoid-b 36/36, analyzer selftest 39/39. Log:
  `~/workspace/proof-battery-gateavoid-0030.log`.
- Probe (control config, this base): fought 2 (vKill 2); pool 1 door
  (107394 d113 rerun vKill, leader 38), bad 0/1 = 0%. The leaderproj probe
  table MOVED: the 107391 d98 reunion vDie door is gone on this base;
  divergence localized to a d40 extra `party_launch` depart — needwave
  guarded copy (`054f525bc`) is the named suspect. Tripwire HOLDS: judged
  control reproduced the probe door table exactly (7/8 files byte-identical;
  107398 differs only in the per-process `seq` counter, a resume artifact).
- Judged legs: control fought 2 (107391 d148 eater vKill, leader 95, safe;
  107394 d113 rerun vKill, leader 38, dead2); armed fought 1 (107391 d148
  eater, identical). The armed leg's 107394 d113 rerun was avoided by the
  projection gate: log entry "gave rerun room — Jovan is too hurt to lead a
  door (projected 38 HP, -12 HP in two rounds)". Armed fires: leaderproj 1,
  hpgate 2; log 3 entries = 3 fires (D6 PASS). The 'proj' entry has NO
  surviving note — the log is the only record (S8c gap 1, exactly the blind
  channel this arm fixes).
- Analyzer: D1 FAIL (pool 1, controlBad 0, armedBad 0, rateDrop 0pp,
  projAvoids 1, "bad-rate drop below 20pp"); D2 PASS (kill rate 1.0 vs 1.0);
  D3 PASS (dmg/door 1082 vs 1196 = 0.905×); D4 PASS (projFires 1 vs 0);
  D5 PASS; D6 PASS. M5 panel: `review_required`, no `regression_signal`
  (deaths/run 97.75 → 96.5); starvation 1 vs 2; median survival 150 vs 150.
- Sense-test: control d113 rerun, 6 rounds — Jovan drops to 16 HP by R4,
  the Rerun rewinds at R5, Jovan lands the killing blow R6, then dies in the
  victory. The projection forecast was right about the leader. Armed 107394
  village-lost d120, 7 days after the avoid, with no deaths after d114 —
  trajectory divergence, not a causal chain; single-seed observation.
- check.js --quick in the worktree (post-src-change, serialized): 339
  passed, 5 failed in 654s — all 5 the standing set (measurement-proof
  staleness pair, phone-frame stale receipt, 2× deed-attainment 120s
  timeouts). The worker's claimed "6 check.js failures" was NOT reproduced
  (no check.js log existed on disk before the adoption run); the 2 timeouts
  were not re-run standalone because the Loop A 0215Z gate started
  immediately after and a standalone re-run would load-share with it.
- Evidence: `evidence/2026-11-23/sim-gateavoid-b.md` (+ analysis JSON,
  panel, corpora probe/control/armed).

**Arm 2 — sim-launchfield-horizon-b (horizon-exclusion re-judge)**
- Frozen base `4e805681a050f22672d479cf5e02b0d5700eb2c7`. Instrument-only,
  zero `src/` changes. Pilot 8 fresh seeds 107439–107446; confirm 8 fresh
  seeds 107447–107454 (run only because the pilot GOed). Substrate
  SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1
  ALLYSLOT3=1 LAUNCHSURVIVE=1, policy `1884c8852d38`, 150d death-aware.
- Proof test: first post-freeze run 50/53 — 3 §1 failures, all instrument
  defects caught by the test (analyzer EXPECTED.seeds stale copy
  [107439, 107400–107406]; test §1 screen checks stale copies from the
  re-judge test contradicting the frozen no-screen design). Fixed with NO
  prereg change; re-run 53/53 green, analyzer selftest 71/71.
- Pilot: DIAG-GO. Files 8, errors 0, unknown 0 (B-unknown 3, H-explained 3),
  Leg S parts 268 / scored 41 / explained 227 / unexplained 0,
  horizonTruncated 0 (clause never fired), repro exact 10/10. Wall: wins 0,
  nationalRank 0, nationalStanding 3, table 0, wave4 8, wave5 3,
  medianDays 150, survived 4 (gameDays ≥150; driver log 5×150d — 107443
  gameDays 149), deaths 812, starvation 1, standing199 3.
- Confirm: DIAG-NO-GO on completeness. Files 8, errors 0, unknown 1
  (B-unknown 9, H-explained 8), Leg S parts 404 / scored 79 / explained
  321 / unexplained 4, horizonTruncated 0, repro exact 10/10. The 4
  unexplained parts are one instance-day: seed 107447, visjoin_134/editor,
  d150 p0–p3, all `no-rows`. The holder was alive through d150 (111 holder
  rows, last d149), but the sampler writes zero holder-state rows
  village-wide on day 150 — the frozen clause needs ≥1 row that day and
  cannot fire. Wall: wins 0, nationalRank 0, nationalStanding 2, table 0,
  wave4 8, wave5 2, medianDays 148, survived 4, deaths 853, starvation 2,
  standing199 6.
- Field-encounter fires (reported, not gating): pilot day-level 2
  (107439 app_mgpspkk2515/spoiler; 107445 vasyl_shevchenko/reunion),
  confirm day-level 1 (107454 visjoin_105/algorithm); part-level 0 on both
  bands — no mid-run part ever needed the fallback.
- The pilot ran across a VM replacement (~03:23Z Nov 23, killed the
  detached driver after seed 107439); seeds 107440–107446 resumed after the
  restart with no seed re-run and nothing lost.
- Seed-band note: the Loop A homebody re-judge landed during this adoption
  using seeds 107431–107446, overlapping the pilot band 107439–107446.
  Post-freeze, different lever/substrate/question; no contamination.
- Anchor: driver records the frozen base literal and refuses (exit 2)
  unless the run-time merge-base IS the frozen base — the rebase trips it by
  design, so the legs were NOT re-run after the rebase; the instrument
  merges as-is with the literal anchor.
- Evidence: `evidence/2026-11-23/sim-launchfield-horizon-b.md` (+ analysis
  JSONs, corpora, legs logs).

**Gate on the merged tip (master 86e5bd38e):** check.js --quick, serialized,
from a script file, dedicated --cacheDirectory /tmp/jest-cache-0030-merged.
**339 passed, 5 failed in 511s** — the exact standing set (measurement-proof
staleness pair, phone-frame stale receipt, 2× deed-attainment 120s
timeouts), 0 attributable. Log: `~/workspace/check-merged-0030.log`.

**Telemetry deviation check (coordinator level):**

Ran `node scripts/telemetry-check.js --baseline <goal>/hidden_files/
telemetry-baselines/scale-wall.json --current <glob> --metrics
national,table,wins --sweep-rows --allow-recorder-corpus` against both
gateavoid corpora globs:

- Control leg (8 seeds): 3 LOUD lines — national 12 → 0, table 16 → 0,
  wins 16 → 0.
- Armed leg (8 seeds): same 3 LOUD lines.
- Investigation: these are the SAME 3 lines the 1630Z round got on the
  profilegate ON corpus — a regime difference between the scale-wall
  baseline (a scale-run regime where villages reach national/table/wins)
  and these recorder corpora (0 wins/national/table on every leg, per the
  arms' own wall numbers). No src/js change on master this round caused
  them (the only src change is the gateavoid log appends, which cannot move
  wins). **Baseline NOT rolled forward.** The launchfield arm is
  instrument-only (zero src changes) and carries no telemetry expectation;
  no check was run on its corpora.

**Infrastructure notes (adoption):**
- Write-flap windows during the adoption (Nov 23, all EPERM at write()):
  02:01:54Z–~02:27Z (~25 min, cleared before the adoption's writes);
  ~04:25Z–~05:24Z (~58 min — first observed 04:27:44Z on a heartbeat
  EPERM, last write success 04:15Z); ~05:45Z–~07:27Z (~102 min — first
  observed 05:45:28Z, ended by a VM replacement at ~07:27Z). Only ~21 min
  of clear writes separated the last two windows. Nothing was lost; both
  arms were committed before the windows and all post-window work
  (rebases, proof re-runs, merges) waited for verified-clear writes.
- VM replacements: ~03:23Z Nov 23 (killed both detached drivers silently —
  gateavoid probe 7/8, launchfield pilot 1/8; recovered from disk, no work
  lost); ~05:22Z Nov 23 (uptime reset; no adoption work detached at the
  time); ~07:27Z Nov 23 (ended the 102-min flap window; no adoption work
  detached at the time).
- Master moved twice during the adoption: `a4603add1` → `3fd09decc` (Loop A
  re-judges: wornstack fix `ff17699c7`, dawnchoke re-judge `30c490779`+
  `895f7a6ee`, homebody re-judge `3fd09decc`), then `3fd09decc` →
  `658d6c561` (journey-landing r155: `78b6c54c4` + `658d6c561`). Both arms
  were rebased onto `3fd09decc` first, then re-rebased onto `658d6c561`
  after the r155 landing — clean both times. origin/master lags local
  (last ship `52b71428f-20261122-232453`).
- Gate serialization: the adoption's own gateavoid check.js (339/5 in 654s)
  ran 03:59–04:10Z; the Loop A 0215Z gate ran 04:10–04:15Z (first attempt,
  died mid-run with no summary — 4 failures visible, cause unknown) and
  again 05:23–05:45Z (retry, 329/15 in 1293s — 10 extra failures, likely
  load/flap-tail artifacts; the 0215Z run's business, not this adoption's);
  the journey-landing r155 gate ran 04:14–04:29Z (339/5 in 758s). No two
  gates ever overlapped except ~19s at the 04:10 handover.
- Index clobber struck on BOTH safe-commits (all files staged-as-deleted;
  arm-1 also showed MM on the two modified files); repaired both times via
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`
  and verified status clean + diff HEAD empty + hash-object == HEAD blob.
- Heartbeats: gateavoid fresh 05:25:38Z, then both fresh 07:28:18Z after
  the VM replacement. The launchfield heartbeat sat stale 03:41–07:28Z
  (~3h47m) across the two flap windows + registry-lock starvation; never
  near the ~4h reaper threshold, and the branch was committed throughout.
- Findings updates: lines 2695 (GATE-AVOID NOTES UNDERCOUNT) + 2696
  (LEADER-PROJECTION GATE) as the re-judge lands, plus an [UPDATE] on the
  horizon-truncation entry (line 2700) for the 107447 zero-row final day.
  #2698 needs NO update from this adoption — the Loop A wornstack arm
  already wrote its own FIXED update (commit `ff17699c7`).
- Telemetry: baseline NOT rolled on mismatch (TBD — check).
- Do NOT push, do NOT bump versions. Ship loop owns the next ship.
