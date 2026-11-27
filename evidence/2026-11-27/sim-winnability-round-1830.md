# Loop B round record — run fleshout-loop-b-20261127T1830Z (winnability chain)

## Run
- Loop B, scheduled Fri 2026-11-27 12:30 CST (18:30Z). Axis: winnability chain.
- Stale-lock recovery of the 2030Z B run at run start: dead (no live coordinator/workers,
  last muster heartbeat 2026-11-25T04:47:43Z, machine restarted). The 2030Z muster arm had
  already landed (NO-GO on B4 cost bars, master c1ff05ed6). Lock + claim retired correctly.
- Master start c1ff05ed6 → master end 61fca5dd6. Both arms merged locally, pending ship.
  No push, no version bump, no live verification (ship loop owns deploys).

## Arm 1 — sim-launchfit-b: DIAG-GO (all 4 frozen bars pass)
- Question: do launched parties depart spent? Departure-stamping driver on fresh band
  111101–111108 (8 seeds, 150d, death-aware, competent verbatim). Prereg 1b683ec6f;
  instrument+driver+analyzer+proof 43eda02c9; driver fix 8268385f5; evidence+corpus 1d266ccf9.
- B1 stamp coverage 1.0 (232/232 departures stamped). B2 220 launches, 489 members.
  B3 verdict stated. B4 0 errors; seed 111101 determinism re-run byte-identical.
- Answer splits the ragecarry lead in two:
  - HP: Alberto is the outlier, not the pattern. Median departure HP 85 (q1 71, q3 98);
    10.8% under 50 HP, 1.8% under 25 HP, 1.2% at Alberto's ≤ 20 HP.
  - Loadout: the half-armed shape does NOT confirm — it was a holder-exclusion
    accounting artifact (honest armed share median 1.0, 3 unarmed of 489; recomputed
    the launchready way the median is exactly 0.5). The unloaded-weapons half DOES
    confirm as a village-level ammo famine: 105/245 ranged carriers (43%) depart
    with 0 ammo — seed 111101 loads 0/47, 111108 loads 1/12, while 111102/111104
    load 19/20 and 26/30.
- Named next fix (NOT built here — this arm measures only): a departure-fitness check
  (arm + load before launch), aimed at ammunition, not HP.
- Wall numbers (this band): wins 0/8, national 0/8, table 8/8 (waiting state, none
  seated), wave-5 unlocked 4/8, median survival 150d (6/8 survive; 111103 lost d83,
  111108 lost d128).
- Proof test 5/5 green, re-run by the coordinator on the branch tip before merging.
- Incidents: first full-band exec SIGTERMed by the runtime at ~13 min with 6/8 seeds
  written; seeds 111107–111108 re-run in a second exec (no seed ran twice, no file
  overwritten). Safe-commit index clobber struck 3 times on this tree (repaired via
  the ls-tree -r / update-index pipe each time; commits verified correct). Machine
  restarted ~19:06Z mid-run (uptime 12 min at 19:18:52Z); nothing lost — corpus was
  complete and committed after the restart. No write-flap window hit this run.

## Arm 2 — sim-samelabel-b: GO (CANON NOTE, not a fix)
- Question (wilddeath blank #3): in ONE fight — Sam Wilson, seed 109448, day 88, four
  people vs three wave-4 Reunions — the scholar dies "the wild" while companions
  Olivia Bennett and Caleb Jones die "combat". Prereg c35a265e5 (rebased 9379a60d0);
  canon note + proof test b4a6bba90; evidence 61fca5dd6.
- B1 Sam-fight repro 7/7 PASS (re-run by the coordinator on the rebased tip).
  B2 partial: wilddeath 11/11, arenalabel 13/13, arenafallback 32/32 green;
  check.js --quick 339/344 with 5 failures — all 5 verified pre-existing on the
  tip by the coordinator (the 3 fast ones reproduce identically on master without
  this arm; the 2 deed-attainment timeouts are box load; the arm touches no src/js).
  B3 pass: wilddeath analyzer re-run reproduces the frozen verdict (95 wild, 18/18
  WILD-TB-FIGHT, 0 unclassified); determinism replay identical on all 5 streams.
- Decision: BOTH labels are true — the scholar's is PLACE, the companion's is MANNER —
  so neither pipeline is wrong and no unifying relabel is safe (scholar → 'combat'
  would silence the standing.js:704 wave-5 voice and break the arenalabel design;
  companions → 'the wild' would relocate the inconsistency and change the frozen
  census). Documented in docs/MONSTER-WAVES.md §"Death causes in wild fights" +
  CANON.md change log, pinned by the proof test. Wilddeath blank #3 closed.
- Wall numbers: no sims staged by this arm; the wilddeath corpus stands (wins 0/16,
  national 0/16, table 0/16, wave-5 9/16, median survival 150d censored).
- The 5 check.js failures were filed in sim-findings.md (retained proofs stale on
  the tip; proof-refresh arm owed — do not loosen the proofs to go green).

## Telemetry deviation check (coordinator, on the merged tip)
- `node scripts/telemetry-check.js --allow-recorder-corpus --baseline
  hidden_files/telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-27/perseed-launchfit-b/*.json' --metrics national,table,wins,exiled`
  (the per-seed corpus is recorder rows, so the bare form refuses it; the
  --allow-recorder-corpus form is the tool's own same-shape path).
- LOUD: national 12 → 0, wins 16 → 0. Documented regime artifact per the baseline's
  own `_regime` note (baseline is the win-seat full-stack regime; this band is
  competent verbatim with no seat stack, where wins are structurally ~0).
  No investigation item. Table and exiled did not fire.

## Findings backlog
- sim-findings.md line 2748 (ragecarry launch lead) annotated ANSWERED by this run's
  launchfit arm; next step is now the departure-fitness check BUILD aimed at ammo.
- Stale retained proofs on the tip filed as open (2026-11-27 entry): proof-refresh arm owed.

## Convergence state
- Winnability chain: **converging**. Launch fitness is answered (ammo famine is the
  departure failure, not HP or arming); the same-fight label wart is documented and
  pinned. The next work on this chain is the departure-fitness check build and the
  fight itself (win-fielddmg lane, persistent parties), not attribution.
- Next blanks for the following run (from the 0130Z/2030Z list, updated): (1) the
  departure-fitness check build (arm + load before launch, ammo-first) — named by
  sim-launchfit-b; (2) Reunionwild findings (herald never enters TB, bloodcluster
  per-seed table mismatch, Eulogy armor-absorb print, same-day succession deaths);
  (3) muster findings (titanroute march failure, mustergap zero-allies, musterclose
  arrears, sounding policy costs villages); (4) the stale-proof refresh arm.
- The 3 failing check.js scripts' identities from the 0130Z run remain uncaptured —
  superseded: this run captured the current 5 (3 stale proofs + 2 load timeouts).
