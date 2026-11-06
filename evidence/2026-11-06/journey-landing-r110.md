# Journey — Landing r110 (2026-11-06, Lane A leg 0)

Run id `laneA-20261106T1245Z`, scheduled Fri 2026-11-06 06:45 CST, started ~13:39Z.
Leg 0 LANDING. Branch `journey-landing`, base `079b7ede2` (master at run start).
Rotation 0→1 written at run start, verified by read-back (see discrepancy note).

## Prereg (committed 67f19496a, before any seed ran)

Question: thread-gate watch (Q1 — r107 seed 1010 d12, n=1) and flesh-channel
post-fix (Q2 — does the r109 poison-retest fix hold in the wild?). Seeds
1033–1042 (fresh band — full-scope grep over ALL dated preregs plus the
forbidden-band files; only incidental numbers hit). DAYS=28. Policies:
competent-player driver, r109-verbatim except seeds/OUTDIR. Carried bindings:
M1 ALIVE-D14, M2 SYSTEM CONTACT, M3 FIGHT-LOG, M5 PEOPLE, Q3 M-PR1/M-PR2
REVISED per r109's metric review (per-panel M-PR1 bar retired; M-PR2 excludes
away-guard refusals), Q4 M7 goaround, Q5 M6 doorstep, Q6 water. Bars: M-TG
≥2 picked-but-stage-1 sharing a non-null thread = real mechanism; M-FLESH
poison re-test count 0 = fix holds, ≥3 stuck seeds sharing one cause = named
defect; M-PR1-per-seed ≤1 on ≥8/10; M-PR2-revised ≥80%; M7 ≥80%; M6 clauses
hold. Metric binding applies: a miss is NO-GO, never re-scored mid-run.

## Infrastructure notes (loud first)

- **Registration took ~83s (single attempt).** Worktree
  `~/workspace/worktrees/journey-landing`. Heartbeat at registration + 10-min
  loop (PID 40690).
- **Pre-flight clean.** Main tree clean, disk 22%, `git pull` already up to
  date. Reaper removed nothing; LOUD lines only about other owners' dirty
  trees (never touched). Active trees 3/16 at pre-flight (plus this run's).
- **Safe-commit index clobber struck** on the prereg commit (67f19496a, known
  class): committed file showed staged-as-deleted + untracked after commit.
  Repaired per the recorded recipe (`git update-index --add --cacheinfo` with
  HEAD blob); verified `git status` clean (0 lines), `git diff HEAD` empty.
- **Rotation-write discrepancy, 7th sighting.** r109's note verified the file
  read `1` at its closeout, but the file read `0` again at this run's start —
  and its mtime was 13:36:32Z, ~3 min BEFORE this run started (13:39:08Z).
  Something rewrote it to `0` shortly before this run; no lock existed and no
  other Lane A run note exists between r109's closeout and this start. The
  0→1 write is verified at run start above and will be re-verified at
  closeout. The discrepancy remains unexplained.
- **MEMORY.md changed externally mid-run** (system file-watcher notice): the
  sim-intelligence direction now records the first wave-5 kill ever (panel
  2026-11-06, 72 villages: day 78, lesser seat only; full seat 1, lesser 25,
  wave-5 reached 5, wave-5 kills 4; no village has banked two living wave-4
  killers and sat). Not this run's work — noted as context for the winnable
  verdict: the wall has its first crack, at the far end of the chain, while
  this leg's funnel (below) is unchanged.
- **No lock existed at start.** Lock created 13:39Z, run_id
  `2026-11-06T13:39:08Z`. Delete at closeout after read-back of run_id.

## Panel

Pilot: 3 seeds (1033–1035), DAYS=28, exit 0 in ~11s. All 3 alive, systemDay
8, ask_favor sittings present, flesh arrivals populate. Pilot gates passed →
expanded to full panel. Full panel: 10 seeds 1033–1042, DAYS=28, exit 0 in
~27s. 10 census files in goal hidden_files `evidence/2026-11-06/landing-r110/`.
Logs: `landing-r110-pilot.log`, `landing-r110-panel.log` (same dir).
Analysis: `landing-r110-panel-analysis.txt`, `landing-r110-commit-offer.txt`,
`landing-r110-fights.txt` (same dir).

## Panel verdicts

- **Q1 M-TG (thread-gate): CLOSED AS A NON-MECHANISM — the question is
  answered, n=3 pooled.** Engagement `[alive:want:ask_favor]` offered in 5
  transcripts, picked in 2 (1038 d10 Leo, 1041 d11 Stephen); both picked cases
  left the want at stage 1. Both share thread='want' — an ALLOWED thread
  (convo-dialogue.js:293/404/423 gate only when the thread is NOT
  null/'want'/'small') — and both NPCs withdrew the want in the opener
  ("Never mind the food I needed — we got it handled"). The r107 case
  (1010 d12 Nino) was re-read for this run: identical shape — withdrawn in
  the opener, engagement picked, "No, really — it's handled", thread='want'.
  All three pooled cases are the same withdrawn-want deflection (the want
  def's deflect beat, conversation.js:6771), not a thread block. The
  thread-gate hypothesis is NOT supported: no case has a non-null/non-'want'
  thread, and the gate code paths (dlg:more etc.) are a different pick from
  the engagement option. No code change — the behavior is correct and reads
  human. Retire M-TG as a watch (see Metric review).
- **Q2 M-FLESH (post-fix): FIX HOLDS — 0 poison re-tests.** arrivalSeeds=6/10,
  testSeeds=10, exitSeeds=6, stuckSeeds=0, openSeeds=6. CHANNEL OPENS.
  Poison verdicts: 2 (1035 belltoad d9 Manish; 1042 "The Loud Beast" d? Sophia).
  Each poison mid was tested exactly once — zero re-tests of known-poison
  flesh on the panel (no duplicate mid in any seed's fleshArc transitions;
  7 experiments on 1042 = 6 safe reveals + 1 poison). The r109 fix
  (`monsterFoodPoisoned` guard) holds in the wild. The 4 NO-ARRIVAL seeds
  (1037/1038/1039/1040) are a LABEL artifact, not stuck channel: each tested
  2–3 mids and revealed them all safe — the flesh was tested from pack/counter
  before it ever sat unknown in the pantry, so the pantry-unknown series
  (peak=0) never saw it. The channel's test stage works on all 10 seeds;
  only the pantry-unknown stage is bypassed on 4. Telemetry gap noted (see
  Blank filled): 1042's poison test has an experiment line + poisonVerdicts=1
  but NO fleshArc transition, so the mid is unrecorded in the census — the
  analyzer's transition-based poison check cannot name it. Driver-instrument
  gap, not a game defect; no fix this run.
- **Q3 engagement lines (REVISED metrics — first run under the new bars):**
  sittings=30, offered(commit)=22, picked=22, promised=14, statedAfterPick=8,
  neverOffered(commit)=8.
  - **M-PR2 revised: 14/(22−8) = 100% ≥ 80% — LINE HOLDS.** All 8 stated
    refusals are the R72 away-guard line ("Wait — I'm out on the road…").
    Away-guard share: 8/22 = 36% of picks.
  - **M-PR1 per-seed: ≤1 on 8/10 seeds — PASS exactly at bar** (1035:2,
    1040:2). Pooled never-offered rate 8/30 = 26.7% (reported for the record;
    per-panel bar retired per r109's review).
  - Transcript adjudication of all 8 never-offered-commit sittings (read in
    full, below): 3 withdrawn wants, 3 probe-leaves-early, 1 no-want-voiced,
    1 stated favor that routes through outing/invite — zero live cases of
    the game hiding engagement or commit.
- **Q4 M7 goaround: GOAROUND-HOLDS (3/3).** R85 RESCUE kcal skips=3,
  complete=3 (1037, 1038, 1040, one each). R85 water: 0 cases.
- **Q5 M6 doorstep: DOORSTEP-GO.** Checks=280, triggered=3, ate=3, drank=0,
  doorRefused=0, noGainEat=0. (r109: 282/4/4.)
- **Q6 water: UNTESTED (22nd run).** Wild outing iterations=0, hydUnder25=0,
  minHyd=null, waterSkips=0. R84/R85 water both UNTESTED, 0 skips.
- **M1 ALIVE-D14: 10/10 PASS.** No village lost by d14 (none lost at all;
  lowest popEnd 9).
- **M2 SYSTEM CONTACT: 10/10 PASS.** systemDay 8 on nine seeds, 9 on 1039.
- **M3 FIGHT-LOG: PASS.** 32 hunt fights, 32 complete, 3 fatal, 0 with
  unknown/mixed trigger. All 3 fatals are the SCHOLAR dying solo in the wild
  (allies 0), each with the beast nearly dead (Spool w3 at 2 HP, Highbeam Deer
  w1 at 1 HP, Spool w3 at 27 HP); triggers: pending-face (feast fight), 
...[truncated 13571 chars]