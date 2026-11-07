# Journey succession r151 — Lane B, leg 7 (succession) — PREREGISTRATION (adoption run)

Written before any after-leg play. This run ADOPTS r147-succession's
unfinished branch (see below); it does not re-ask r147's question, it
finishes it. Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout, and VERIFIES the file reads 4 afterwards.

## Adoption record

- r147-succession (Lane B, leg 7) timed out before closeout; the main
  session closed it out in evidence/2026-11-07/journey-succession-r147-closeout.md:
  branch journey2-succession kept at d47b76e23, tree released
  done-abandoned, rotation left at 7.
- This run (r151 — next Lane B number after r150 crisis) registered
  the same slug journey2-succession and adopted the branch: rebased
  onto current master b0340ad11 (explicit SHA, read in the main tree
  immediately before the rebase; clean single-pick rebase, no
  conflicts), new tip de35f1450. Worktree verified clean before the
  rebase; no stashes touched (17 pre-existing, left alone).
- Proof re-runs on the rebased tip (before this prereg, regression
  proofs only, not judged play): scripts/test-journey-succession-r147-askfavor-engage.js
  ALL GREEN; scripts/test-journey-succession-r146-askfavor.js ALL GREEN.
- r147's question, fix, and bars are adopted verbatim from
  evidence/2026-11-07/journey-succession-r147-prereg.md (including
  Amendment 2's two-routes correction and the proof-test-shape
  amendment). Nothing is re-scored; the only new instrument is the
  r147→r151 filename clone below, which changes no logic.

## The fix under test (r147, preserved on the branch)

Source-level guard in src/js/convo-wants.js ask_favor.engageBeat
(+23/-1): when the single favor.whyLine is ledger-blocked, return
convoFavorNeedLine (the live need named fresh) when that itself is
not blocked; otherwise return the whyLine and let the caller's
existing fallback answer. Same shape as r146's dlg:details guard,
moved to the source so no caller (dlg:details any stage, dlg:help,
dlg:comfort-completing, conversation.js engage paths) can miss it.
Ledgers untouched; no trust/consequence flow changes; no new favor
state transitions. water_haul got NO new variants (r147 prereg
correction: it already carries 3 hash variants; the guard covers it).

## Before-leg denominator (verified from the committed r147 files, not re-asserted)

The r147 before-leg (unfixed code, r147 driver, seeds 33803/33806)
reproduced ONE engageBeat-class dry turn in the driven transcripts:

- 33806 d+30 Katarina (water_haul): ask stated, [dlg:details]
  ("Tell me why you need this.") -> "...Sorry, lost my train of
  thought." SAYTRACE: key = the water_haul whyLine ("Do the math
  with me: 0 liters, 8 people..."), preSelf=False, preRun=True,
  fellBack=True. Route (a) of Amendment 2 (dlg:details at stage 0
  via the else-if engageBeat call).

The r146-named turns (Omar d+14, Ivy d+7, David d+45/d+53) did NOT
reproduce under the r147 driver: the driver drives different convo
partners on these seeds (33803: Lorenzo/Victor; 33806: Katarina/Badr/
Elif), so those villagers never appear at those checkpoints. Per the
r147 prereg ("a dry turn that does not reproduce drops out of the
denominator, recorded, NOT re-scored"), they are OUT of the
ENGAGEBEAT-GUARD denominator.

Three other dry lines in the before-leg driven transcripts are NOT
the engageBeat class and are CONTROLS (the fix must not change them):
- 33803 d+14 Lorenzo: [dlg:subject] after "Are you going to stay?"
  -> dry (subject-change dry).
- 33803 d+4 Paisley: [dlg:doubt] after "Are you angry?" -> dry
  (doubt-challenge dry).
- 33806 d+8 Badr: "What places have you found out there?" -> dry
  (knowledge-question dry).

## Instrument (r147 driver/analyzer verbatim + filenames only)

- Driver: scripts/journey-succession-r151-20261107.js = r147 driver
  with ONLY r147->r151 renames (filename, mode string kept
  'succession-r123', transcript/tele filename patterns, EVID_DIR
  evidence/2026-11-07). No logic change: the r147 before-leg files
  stay intact under their r147 names, and the after-leg writes r151
  names. Re-running the r147 driver itself would overwrite the
  committed before-leg evidence, so the clone is required, not
  cosmetic.
- Analyzer: scripts/analyze-journey-succession-r151-20261107.js =
  r147 analyzer with ONLY r147->r151 renames (CAP-NC scoring
  unchanged).
- POST_DAYS=70, EARLY_KILL_DAY=40, controls (no forced kills — the
  r147 before-leg ran as controls; the after-leg matches it).
  CONVO_DAYS unchanged.

## After-leg (fixed code, same seeds, r151 driver)

Re-run 33803 + 33806 through the r151 driver on fixed code. The
Katarina d+30 turn must carry a real need-naming line (no dry line,
no self-repeat deflection, at that turn). The three control dries
must read identically (the fix touches no path that produces them).
Determinism note: the fix consumes no RNG, but the need-line it
speaks IS ledgered where the dry line was exempt, so transcript
bytes after the fixed turn inside the same conversation may diverge
from the before-leg; the death/chain/pick records must still match
(r119 determinism leg).

## CAP-NC regression panel (fixed code, fresh band)

After the fix, the r143 CAP-NC panel re-runs on fresh band 33901–
33908 with the r143 stop rule (run in order, stop at 3 eligible or
after 33908). Smoke seed 33999 proves the r151 driver first
(EARLY_KILL_DAY=5, POST_DAYS=25). The panel judges whether the
dialogue fix regressed the succession capacity r143 established.
Panel order: fix proof first (repro seeds), CAP-NC panel second.

## Seed-band freshness (skill: local_seed_band_freshness)

- Repro seeds 33803 + 33806: DELIBERATE REUSE of the r146 panel band
  for a same-seed before/after comparison. Not a fresh-band claim.
- CAP-NC panel band 33901–33908 + smoke 33999: RESERVED by r147's
  prereg (evidence/2026-11-07/journey-succession-r147-prereg.md,
  "Band FRESH" after searching ALL dated preregs). This run
  re-verified: grep over evidence/*/​*-prereg.md for 3390[1-9] and
  33999 returns ZERO matches outside r147's own prereg; the only
  files naming the band are r147's prereg + this adoption's prereg.
  Forbidden bands named in Nov preregs (73641–73648, 73671–73678,
  78201–78208, 99351–99358, 99401–99412) and the r112 contaminated
  list (897–906, 1301–1304, 917–926, 1001–1010, 1101–1110, 1201–1210,
  2001–2010, 3001–3010, 1033–1042, 1043–1052, 1053–1062) do not
  intersect. Band FRESH (r147's reservation, executed here).

## Bars (binding, §14 — adopted from r147, unchanged)

- ENGAGEBEAT-GUARD (binding): on fixed code, the reproducing dry
  turn (Katarina d+30, 33806) carries a real need-naming line at
  that turn — no dry line, no self-repeat deflection. The turn must
  pass; the three control dries must read identically.
- DRY CENSUS (binding, r146 metric review): across ALL driven
  transcripts on the after-leg + panel seeds, ZERO dry lines at
  ask/details turns attributable to a favor whyLine via engageBeat
  (SAYTRACE preRun/preSelf RUN/SELF-BLOCKED on a whyLine key at an
  ask/details turn). A dry at an ask/details turn through any other
  mechanism is reported with its attribution, not counted against
  this bar — but a new engageBeat-class dry anywhere FAILS it.
- CAP-NC REGRESSION (binding, carried from r143): PASS = ≥3 eligible
  seeds AND ≥3 bonded by the deadline AND bonded/eligible ≥ 2/3.
  INSUFFICIENT-DATA / CAPACITY DEFECT per r143's definitions. A miss
  is a regression note + fix-or-revert decision, never a re-score.
- PROOF TEST (binding for the fix claim): the r147 proof test
  (scripts/test-journey-succession-r147-askfavor-engage.js) + the
  r146 proof test, both re-run GREEN on the rebased tip (done before
  this prereg; re-run again at the gate after the panel, before any
  merge).
- SELF-REQUEST REGRESSION CHECK (reported, not scored): r133 ledger
  purge holds — selfReqDayEntries == 0 on every panel seed.
- CARRIED (reported, not scored): pick-time rank == 1 on every first
  handoff with npcCalls; funeral INCALL beat present on every leg
  death. A miss is a regression note, not a re-score of r123/r127.
- PEOPLE CHECK (sense, not a count): read the fixed d+14 transcripts
  in full plus one d+14 successor transcript per CAP-NC panel seed.
  Bar: conversations have meaning per the sense-testing law; the fix
  must not introduce a new filler or a line that promises a need that
  isn't there.

## What would count as an interesting finding

- The Katarina turn still drying or deflecting on fixed code (the
  guard missing a route after all).
- A NEW engageBeat-class dry anywhere on the panel (a third route).
- A control dry changing (the fix leaking into unrelated paths).
- A need-line that promises a need that isn't there (the fallback
  lying).
- A CAP-NC regression from a dialogue-only fix.

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions (r117 precedent).
Per the r147 prereg: run the check, investigate any LOUD line, and
re-seed the baseline BY HAND from this panel's per-seed means if the
LOUD lines are the summation artifact; the checker itself is NOT
changed in this run. The baseline is NOT rolled forward from sums.

## Fix policy

No new game change is pre-planned: the fix is r147's, preserved on
the branch. If the after-leg or panel finds the guard insufficient,
the fix is extended same-run only if the extension is small, safe,
and provably a defect (transcript/copy only, r146/r147 class) with
its own proof test; otherwise the finding is documented with
evidence for the owning builder lane and the branch merges only if
the binding bars pass. No gate, deed, wave, or table change under
any reading of a finding (freeze stands).

## AMENDMENT (mid-run, 2026-11-07 ~07:50Z — after the first after-leg, before any panel)

The first after-leg (r147 code, r151 driver) PASSES the ENGAGEBEAT-GUARD
bar on the reproducing turn (33806 d+30 Katarina: "I still need help with
the creek water run.") but FAILS the DRY CENSUS bar: a NEW engageBeat-class
dry appears on 33806 d+45 Katarina. The d+45 [dlg:details] turn dried
through engageBeat (SAYTRACE: water_haul whyLine "Do the math with me: 0
liters, 7 people...", preRun=True, fellBack=True; transcript shows the
second deflection-pool line "Hm. Never mind — go on."). This bar is NOT
re-scored: the first after-leg is recorded as DRY CENSUS NO-GO on r147's
code, and the fix is extended below. The panel below judges the EXTENDED
code against the same unchanged bar.

Mechanism (proven by unit probe /tmp/probe-bothblocked.js on the rebased
tip, not by speculation): the BOTH-BLOCKED case. The r147 guard returns the
need-line only when it is unblocked; when the need-line is ALSO
run-ledger-blocked it returns the blocked whyLine and the turn dries. At
d+45 the need-line ("I still need help with the creek water run.") was
still in the 48-entry run ledger from its own d+30 speaking 15 days
earlier — the ledger window spans weeks at the sim's speaking rate. The
probe poisons whyLine + need-line and confirms: engageBeat returns the
blocked whyLine, sayLine dry-replaces it. The r147 prereg anticipated
exactly this ("Only when that too is blocked does the whyLine go back to
the caller") and accepted the dry as the fallback; the panel proves one
fresh phrasing is not enough.

Extension (small, same class, transcript/copy only — per this prereg's fix
policy): convoFavorNeedLine gains two more fresh phrasings of the same live
need (v1, v2), all built from favor.short only, all distinct in first
chunk; the engageBeat guard AND the dlg:details handler guard try v0, v1,
v2 in order and return the first unblocked one. Only when ALL THREE are
blocked does the whyLine go back to the caller (the honest exhaustion
case, documented, not claimed fixed). No RNG anywhere in the guard (the
extension consumes none, so trajectories stay comparable); ledgers
untouched; no trust/consequence changes. The stage-0 ladder is NOT
touched: it already tries opener→followup→whyLine→need-line and its
all-blocked dry is its documented accepted fallback.

Proof: new scripts/test-journey-succession-r151-askfavor-bothblocked.js
(engage-bothblocked, engage-allblocked last-resort, details-bothblocked,
backward-compat control). It runs RED on r147's code (verified before the
extension lands) and GREEN after. The r146 + r147 proof tests must stay
green.

Re-verification: the first after-leg's 33806 files are preserved with a
-v1-r147code suffix before any re-run (the d+45 dry evidence must survive).
Smoke 33999 + after-leg 33803/33806 re-run on the extended code; the
DRY CENSUS bar is judged on the re-run. CAP-NC panel 33901–33908 runs on
the extended code. The three control dries must still read identically.

## Expansion trigger

Instrument failure only: talkRequests unreadable, bondDaily empty on
a seed with a recorded handoff, bondDaily entries missing bearerId,
newcomer detection never recording _newcomerSeen, or SAYTRACE
recording no fellBack on a seed whose transcript shows a dry line
(fix instrument, re-run that seed once). A CAP-NC miss, a
no-newcomer-arrival seed, a village ending before the deadline, or a
skipped seed never triggers expansion alone — the stop rule bounds
the panel at 8 seeds.

## Metric review (to be filled after the panel)

- Canon note: no canon doc covers mantle/bond formation specifically
  (r127's standing note, unchanged). Governing rules used: ledger.js
  "successor: the village chooses. Trust decides"; party-bond.js
  "v.bonds built by meals/visits/feasts, +6/pair/day cap, no bonds
  with the dead or gone"; CONVERSATIONS.md structural contract ("The
  repeat ledger must not replace a successful promise with 'lost my
  train of thought.'"); CANON.md "No silent actions". Nothing
  invented, nothing changed.
- The r119 bond-calibration question (0 new bonds in 14 days) was
  answered by r123-calibration (analyzer
  scripts/analyze-journey-succession-r123-calibration-20261104.js);
  not re-litigated here.
- The mantle 2-day latency owed item (r112 landing note) is still
  open and is NOT this run's question; it stays carried.
- Finding line 1827 (sim-findings.md) closes only when this run's
  ENGAGEBEAT-GUARD + DRY CENSUS bars pass; a fail leaves it open
  with the new mechanism cited.
