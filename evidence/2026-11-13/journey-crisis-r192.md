# Journey crisis r192 — Lane B, leg 6 (adoption closeout)

Run timed out at the cron deadline; adopted 2026-11-13 by the adoption
coordinator. Base master 6a16152d5. Seeds 14431–14435 (fresh band),
DAYS 150, all five villages game-over (75 / 59 / 91 / 73 / 148 days).
Raw panel data lives outside the repo in goal
hidden_files/evidence/2026-11-13/journey-crisis-r192-* (prereg,
pilot-analysis, full-analysis, 5 delayed seed JSONs, per-seed logs).

## Verdicts (carried from the run, not re-judged)

- **Q6 re-judge NO-GO** — gorge-after-clear, id-matched: 0/5
  (gorgeAfterIdMatched=0, gorgeAfterReturn=0; name-matched=1 for
  comparison). The gorge-after-clear pattern still does not fire on
  id-matched evidence.
- **RUINROAD cumulative 0/301 medicines — structural threshold.**
  This run: 150 forced ruin searches (0/39/0/39/110 per seed),
  0 medicine acquisitions, 0 pharmacy deposits, 0 medicine cures.
  Cumulative with r186's 151 searches: 301 searches, 0 medicines.
  The regional-medicine fix is not reachable end-to-end through any
  existing play pattern (search → rare roll → acquisition → deposit
  → cure); the break is at the rare-roll/acquisition step, not at
  searching. Medic-duty cures this run: 59 via ability, 0 via
  medicine.
- **A7 not judged (VACUOUS)** — 0 alien kills on all 5 seeds, so the
  "a stranger" cluster legibility question could not be exercised.
- **DRY CENSUS deflect_q GO** — 0 deflect_q dry hits across 39
  transcripts; exactly 1 dry line total (dlg:doubt, seed 14432 d26,
  June Cohen) — the F3 target below.
- **Telemetry check quiet.**

## Fixes landed (all dialogue/narration, no RNG on any path)

Same defect class as warn-details (r186) and confront (r187): a single
fixed line dry-replaced by "...Sorry, lost my train of thought." (or
silence on a same-sitting re-press) whenever the run ledger already
held it. Each fix is an ordered pool-picker, original line first,
first variant the no-repeat ledger would not block; all-blocked falls
to an honest fallback, never the dry line.

- **F1 deflect_q dry line** (conversation.js: `convoDeflectQLine`,
  8 shutter variants; handler at :6650). Closes the r187 Lane B
  carried item (succession r187 seed 34234, Desmond d48).
- **F2 refusal line** (truth.js: `refused` pool, 8 variants, drawn
  via `drawTruthLineUnblocked` at both confrontDoubt and
  confrontTheft guards; original line is the all-blocked fallback).
- **F3 dlg:doubt dry line** (convo-dialogue.js: per-prod-branch
  pools of 3, originals first; honest stonewall fallback).
- **F4 monsterNoun clause-verb gap** (game.js: past-tense verbs
  added to the clause-head guard — went/came/stood/moved/ran/fell/
  rose/sank/crept/crawled/walked/stopped/started/turned/looked/
  sounded/smelled/felt/hung/lay/sat. Audit: flips exactly 1 of 72
  monster defs — living_wire's "the creek went still, and your
  arm-hairs stood up", which had composed as "I put down creek went
  still at the treeline" (pilot seed 14432 d8).
- **F5 question-shaped thread labels** (conversation.js:
  `convoThreadAbout` — a label ending in "?" renders as "that
  question", so closing frames stay grammatical; pilot seed 14433
  d24: "We still owe What season is it here, do you think? a proper
  ending, too.").

## Proofs (re-run by the adoption coordinator on the fixed code)

- test-journey-crisis-r192-deflectq-dry-20261113.js — 10 pass, 0 fail
- test-journey-crisis-r192-doubt-dry-20261113.js — 9 pass, 0 fail
- test-journey-crisis-r192-monsternoun-clause-20261113.js — 3 pass, 0 fail
- test-journey-crisis-r192-refusal-dry-20261113.js — 11 pass, 0 fail
- test-journey-crisis-r192-threadabout-question-20261113.js — 7 pass, 0 fail
- Total 40 pass, 0 fail. (RED-first verification is worker-claimed;
  the coordinator re-ran GREEN only, plus on the rebased tip.)

## Gate

`node scripts/check.js --quick` re-run by the adoption coordinator
in the worktree after Lane A's r135 gate finished (never two
check.js at once). Result: **327 passed, 13 failed in 1799s — GO
after adjudication, 0 failures attributable to the r192 fixes.**
Full log: evidence/2026-11-13/journey-crisis-r192-gate.log;
standalone re-run logs:
evidence/2026-11-13/r192-reruns/.

Adjudication (all 13):
- 9 × exact-120s spawn timeouts (living-garden, occupation-panels,
  one-person-army, phase-shawl, solo-campaign-endings,
  time-save-crashes, synergy-stall, capable-bot + trust-observer in
  the r135 gate): **LOAD**. Gate log shows ZERO "not ok" assertion
  lines in any of the 9 blocks — passing assertions right up to the
  kill. Five of them failed identically in Lane A's r135 gate minutes
  earlier (different branch, no r192 code); the other three passed
  there and timed out in mine on a more loaded box.
- measurement-proof-update + measurement-workflow: **STALENESS
  PAIR, expected** ("Proof source inputs are not current"). Any
  src/ change stales the proof; refresh is owed as round 11/12, not
  a regression. Failed identically in the r135 gate.
- test-phone-frame-proof: **STALE RECEIPT, standing known** (needs
  a browser refresh; already owed from the r134 adoption). Failed
  identically in the r135 gate.
- test-measurement-cache-flags 0/4: **LOAD**. Failed identically
  (same 4 sub-checks) in the r135 gate on a branch without the r192
  fixes, and standalone — the discriminating A/B the r187 lesson
  requires. Panel completion under the spawn/timeout budget tracks
  box load, not this change.
- test-trust-observer-neutrality: exit 1 in the gate (bare Error,
  no assertion message, 111.1s), **exit 0 standalone** — load flake.
  It timed out at 120.1s in the r135 gate too.

No failing test touches the conversation/dialogue/truth paths or
the monsterNoun guard the fixes change.

## Village assessment (plain words)

All five villages died — none bent and survived. Crisis still fires
(raids, gorge nights, sorties, mourning all present), but the
villages break the same way: game-over between day 59 and day 148,
with medicine never reaching anyone through found supplies (every
cure that happened came from a healer's ability, never from a bottle).
The conversation fixes above are small honesty repairs: villagers
who dodge, refuse, or are pressed now say a real shuttering line
instead of losing their train of thought mid-sentence.

## Metric review

Q6-as-written keeps missing: the gorge-after-clear pattern may need
its bar re-scoped (name-matched fired once; id-matched never) or
the driver may need longer post-clear windows. Proposed for the next
crisis run, not re-scored here. RUINROAD's structural 0/301 is the
standing medicine-supply question — it now belongs to the Decisions
#17 re-analysis (medcure-b corpus), not to another ruin-search arm.
