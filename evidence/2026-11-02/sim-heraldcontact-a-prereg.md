# sim-heraldcontact-a — PREREGISTRATION (committed BEFORE any judged sim)

Run: fleshout-loop-a-20261102T0725Z, arm sim-heraldcontact-a, axis scale-onramp.
Worktree branch: sim-heraldcontact-a. POLICY/INSTRUMENT SIDE ONLY — zero
`src/js` changes, no gates, stages, deed bars, trustedAt / trustedOpinion /
quota / need values, or win prices touched. This arm sounds NOTHING and
defers nothing: it is a pure diagnosis of the contact gap. No [needs-eyes]
(policy measurement only, nothing player-facing ships). Sibling Loop B
trees/branches NOT touched (sim-jumpfaithful-b, sim-stayhome-b).
No hidden_files (tracker/claims/findings — coordinator-owned).

## Canon read

docs/CANON.md first, then docs/SCALE.md (scale ladder) and
docs/SCALE-DISCOVERY.md (discoverability). There is NO titan-specific
canon doc in docs/ — stated here instead of inventing one (same
finding as the 0445Z and 0605Z rounds). The in-code design source is
`src/js/titans.js` plus `src/data/titans.json` (herald def, minAllies
10) and the deployed faithful rule `Game.titanCallReadiness('herald')`.
The herald pipeline in code (titans.js, titanDawnTick /
titanAdvanceOmen / titanPlace) is:

1. OMEN GATE: unlockedWave >= 4 AND scaleRank in {regional, national,
   global} — then 10%/day to start omen stage 0.
2. STAGE 0 -> 1 (named): >= 4 days after omen start, 35%/day.
3. STAGE 1 -> 2 (located): >= 9 days after omen start, 40%/day —
   titanPlace puts the herald monster on a map tile and says the
   lair line ("Scouts found its lair ... It is WAITING. You cannot
   face it alone. Sound the call.").
4. ENGAGEMENT: only then can a startCombat call on the herald happen
   (titans never wander — monsterWavePool excludes them; they arrive
   by omen only). A refused engagement is the MUSTER-GATE hard gate
   (no solo titans); a fought engagement is a coalition fight.

## Starting point (0605Z arrears-route round, evidence/2026-11-02/sim-arrears-route-a.md)

On two fresh pilot bands (97101–97108, 97201–97208, DAYS=180) 12/16
villages never attempted the herald at all — including a 181-day
survivor and a 138-day winner — and the 4 that did attempt were all
READY at first readiness check (totals 15, 16, 16, 16) with zero
arrears. The arrears-route arm was therefore UNDER-POWERED (0/16
arrears blocks) and killed. This arm diagnoses the 12/16, not the
arrears: on unselected bands the binding constraint is CONTACT, not
debt. The readiness recorder pattern (Game.titanCallReadiness
('herald') at refused attempts, via a startCombat interceptor) is
reused from the arrears replay; the deferral/sound machinery is NOT
reused — this arm intervenes in nothing.

## Definition of 'herald attempt' (grounded, stated before the run)

A herald attempt is ONE ROW of the deployed herald instrument
(`scripts/herald-instrument-20261030.js`, `t.attempts` filtered to
`mid === 'herald'`) — i.e. the game/policy actually called
`Game.startCombat` on the herald, classified by the instrument as
FOUGHT, REFUSED (with reason code), or THROW. It is NOT the
readiness check and NOT the sound, for two stated reasons: (1) a
readiness row exists only at REFUSED attempts (the arrears replay
computes it inside the refusal interceptor), so defining attempt as
readiness-check would misclassify every FOUGHT attempt as no
contact; (2) the sound is a later policy act (sumtrigger/arrears
arms sound via interceptor) that this diagnosis arm never performs,
so counting sounds would measure the intervention, not the village.
First-readiness-check day per seed = the day of the readiness row
computed at the seed's FIRST refused herald attempt, if any; FOUGHT
first attempts and non-attempters have none (recorded as null, not
as zero).

## Instrument (adapted from the arrears replay, intervention removed)

`scripts/heraldcontact-replay-20261102.js` — adapts
`scripts/arrears-route-replay-20261102.js` (itself adapted from the
sumtrigger replay) UNMODIFIED in policy stack, env flags (minus
MUSTER — see below), transcript capture, and wall fields. Behavior
changes, all pre-registered here: (1) NO deferral, NO sound, NO
stand-down, NO armed/baseline split — one run per seed, because
there is no intervention to compare; the run IS the baseline; (2)
the wrapped daily samples the herald pipeline EVERY day before the
base policy's daily and records transitions: first day wave >= 4,
first day scaleRank >= regional, omen stage per day (first day of
each stage 0/1/2), first/last day the herald monster is present in
`Game.worldMonsters()`, pendingEncounter / pendingMonsterId at end;
(3) the startCombat interceptor records, at every herald attempt
row, a readiness row IF the attempt is REFUSED (same deployed
`Game.titanCallReadiness('herald')`, same per-link fields as the
arrears replay); FOUGHT attempts record no readiness row; (4) the
Game.say wrapper additionally captures every line matching
/herald|titan|omen|lair/i (capped, first + last retained) for the
sense test, alongside the instrument's own first/late refusal
transcript snapshots; (5) muster-diag is NOT installed — its
same-day-snapshot role is replaced by direct joins to instrument
attempt rows, which carry day + cls + reason themselves.
`scripts/heraldcontact-split-20261102.js` (idle, no game load)
splits the stdout runner output into per-seed corpus files.
Validator/analyzer: `scripts/test-heraldcontact-a.js` — reproduces
the verdict from the corpus alone (no game load): per-seed
classification, reason split, wall numbers, transcript-line
presence, and the GO bars below. Unit proof:
`scripts/test-heraldcontact-classify.js` — the classifier on stub
recorder rows (every code, the decision order, UNCLASSIFIED only
when no row explains the seed).
STDOUT-RUNNER PATTERN: the replay prints one JSON line per seed
and writes NOTHING itself; the splitter runs in a foreground exec,
never a backgrounded pipe.

## Policy stack (exact names, frozen from sumtrigger/arrears)

`tribfloor` leadfeast + `windefer` withWinDefer + `seatdrive`
withSeatDrive + `fullseat-diag` withFullseatDiag, with herald-v1
(`herald-instrument-20261030`) recorder. Env: FEASTSCALE_R13=1
TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
HERALD=1. (MUSTER=1 is NOT required: muster-diag is not installed
in this arm; see above.) Switching stacks mid-run would break
comparability, so the stack is frozen here.

## Seeds / baseline (fresh band, verified unspent)

Pilot seeds (8): 97301, 97302, 97303, 97304, 97305, 97306, 97307,
97308. Fresh-band verification, done BEFORE this prereg was
committed (same method as the arrears prereg): no file named
`*9730*` under evidence/ or scripts/; no 97301–97308 token (word
boundary) in any `*.md` evidence file, in any script, or in any
`SEEDS=` list; no live claim file names the band; the 971xx and
972xx bands are NOT reused. (The one substring hit — `3a97301eb`
inside a commit hash in evidence/2026-10-31/sim-food-economy-round-0537-a.md
— is a hash fragment, not a seed assignment, and word-boundary
grep confirms zero true seed assignments.) DAYS=180 death-aware cap
(same rationale as arrears: 150–200d reachability band; herald
contact ran ~day 70–115 in prior bands, plus omen stages need
~13+ days after the gate opens and escalation needs a tail; a cap,
not a target — dead villages stop simulating). BASELINE = this
pilot itself: a diagnosis arm has no intervention, so there is no
second arm to drift from; wall numbers are reported per seed and
compared DESCRIPTIVELY to the 0605Z bands (never pooled).

## Classification codes (decision order — first match wins)

For every NON-ATTEMPTER, exactly one code, from the recorder rows
(samples + attempts + endReason). A seed is UNCLASSIFIED only if no
recorder row explains it (e.g. missing samples with zero attempts
and no end data) — never as a bucket for "didn't look".

- ATTEMPTED — >= 1 herald attempt row. Not a blocker; record first
  attempt day, cls, reason, and first-readiness-check day/total if
  the first attempt was REFUSED.
- LOCATED_NO_ENGAGE — omen stage 2 reached (placement day recorded)
  and zero attempts. The monster was placed and the village never
  engaged it: the contact failure is at engagement, not arrival.
- OMEN_STUCK — omen stage 0/1 at end, zero attempts. Record stage,
  omen start day, and days stuck. The omen started but never
  located.
- NO_OMEN — wave-4 day AND regional day both recorded, omen never
  started, zero attempts. The gate opened but the 10%/day start
  never fired in the window.
- NEVER_REGIONAL — wave 4 reached, regional never reached,
  endReason 'survived'. The scale gate never opened.
- DIED_BEFORE_REGIONAL — wave 4 reached, regional never reached,
  endReason 'over-other' (Game.over, village not lost — the
  scholar-death game-over in this harness). Covers the task's
  DIED_BEFORE_CHECK: the run ended before any check was possible.
- LOST_BEFORE_REGIONAL — wave 4 reached, regional never reached,
  endReason 'village-lost'. Covers the task's
  VILLAGE_LOST_BEFORE_CHECK on the regional leg.
- NEVER_WAVE4 — wave 4 never reached, endReason 'survived'.
- DIED_BEFORE_WAVE4 — wave 4 never reached, endReason
  'over-other'. Covers DIED_BEFORE_CHECK on the wave leg.
- LOST_BEFORE_WAVE4 — wave 4 never reached, endReason
  'village-lost'. Covers VILLAGE_LOST_BEFORE_CHECK on the wave leg.
- UNCLASSIFIED — none of the above applies (missing recorder rows).

Death/loss is therefore a code leg (DIED_/LOST_BEFORE_*) when it
truncates the pipeline BEFORE the gates, and endReason context
otherwise — not a competing free-text bucket. Every code's
supporting rows (gate days, omen days, endReason, gameDays) are in
the corpus; the analyzer derives the code from the corpus alone.

## PRIMARY METRIC

Classification coverage + reason split: among the 8 pilot seeds,
the share classified with a named reason, and the split of codes
among non-attempters.

## GO (DIAG-GO — all must hold)

(a) COVERAGE: >= 7/8 seeds classified with a named reason, <= 1
    UNCLASSIFIED. A miss on (a) is NO-GO, not a re-score.
(b) SPLIT: a dominant reason covering >= 50% of non-attempters,
    OR a full split table with counts if no dominant reason
    exists (the split table is itself the deliverable then).
(c) PROOF: unit proof (classifier on stubs) AND corpus validator
    green; validator reproduces the verdict from the corpus alone.
(d) PURITY: zero `src/js` changes (git diff on src/ empty at
    report time); this arm sounds, defers, and mutates nothing.
(e) WALLS: wall numbers reported per seed (national/table/wins,
    wave reach, median survival, death-cause shares, endReason
    mix) — never pooled with other bands.

A miss on any bar is NO-GO, never re-scored against a friendlier
metric mid-run (MEASUREMENT §14). Doubts go under "metric review".

## PILOT GATE / CONFIRM

Pilot = 8 seeds (above). There is no confirm: a diagnosis arm
either classifies the gap (DIAG-GO) or it does not (NO-GO). A
follow-up arm (screen, intervention, or deeper instrument) is a
new prereg, not an extension of this one.

## KILL RULE

On NO-GO: the replay, split, and test scripts are DELETED in the
closing commit. Evidence, prereg, corpus, and analyzer output
stay committed. The report states "killed, nothing to merge". On
DIAG-GO: the scripts stay (they are the reusable contact
instrument), and the report states "ready for coordinator merge".

## PANEL (§15)

Balanced panel (scripts/balance-panel.js) does NOT apply: this is
a trigger-moment census with no intervention and no sweep-compare
policy run — same declaration class as quotatrigger / muster3 /
sumtrigger / sumconfirm / arrears-route. Before/after is not
applicable (no lever); wall metrics are reported per band, NEVER
pooled. No panel fabricated.

## Wall metrics reported (per band, never pooled)

Win rate, national(end) / table reach, wave-4 / wave-5 reach,
median / max survival (gameDays), death-cause shares (from the
per-seed deaths arrays), endReason mix, herald attempt rate.

## OUT OF SCOPE (task bounds)

No game-code change. No sound/defer/stand-down intervention, no
tribute/arrears rule change, no gate/stage/deed-bar/win-price
retunes, no new tribute-payment verb. No sibling trees or branches
touched. No hidden_files (tracker/claims/findings —
coordinator-owned).

## Metric review

(To be filled at end of run. Doubts about the bars above go here
and apply to the NEXT run, never to this run's verdict.)
