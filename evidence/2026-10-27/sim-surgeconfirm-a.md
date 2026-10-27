# sim-surgeconfirm-a — confirming measurement for the wave-4 arrival surge attribution (axis scale-onramp)

Run: fleshout loop A, run fleshout-20261027T1121Z, arm sim-surgeconfirm-a.
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no lever proposal. No [needs-eyes] flag applies:
measurement only, no feel/combat/UI change — stated explicitly, as
assigned.

## PRE-REGISTRATION

Full text, committed FIRST before any sweep:
evidence/2026-10-27/sim-surgeconfirm-a-prereg.md (commit d0bd3a6c9).
Judged only against it — in particular the BINDING PROMOTION RULE
below, quoted verbatim.

## VERDICT: INCONCLUSIVE — neither promoted nor demoted, never re-scored

Staffing fallbacks stay CONTRIBUTES. They are NOT promoted to
EXPLAINS, and they are NOT demoted to survival-only contributors.
The rule decides this, not the analyst:

- EXPLAINS requires BOTH fallback-off total arrivals ≤ 18 AND
  median first-standing-100 day ≥ control median + 5 days.
  Arrivals leg: PASS (17 ≤ 18). Timing leg: FAIL (fallback-off
  median 68 vs control median 66; EXPLAINS needs ≥ 71).
- DEMOTE requires fallback-off arrivals ≥ 24. FAIL (17).
- Otherwise INCONCLUSIVE. That is the verdict.

What this means, in plain words: taking the fallbacks away DID
cut wave-4 arrivals nearly in half (31 → 17) — but NOT by
pushing standing-100 later. Villages without the fallbacks
reached standing 100 just as fast (median 68 days vs 66).
The arrival drop came from somewhere else in the chaotic
trajectories — two villages' whole stories changed (73675
never reached standing 100 at all without fallbacks; 73677
won early at day 90 before wave 4 could open) — while one
village actually gained an arrival (73671: 13 → 14). A cause
that cuts the count without moving the clock it was supposed
to move is not yet an explanation, and a count of 17 is not
close enough to the old 11 to call it noise either. So the
attribution share stays unsettled, exactly where the
arrivalsurge arm left it — with one new hard fact: the
standing-100 timing mechanism is ruled OUT as the channel.

## BINDING PROMOTION RULE (verbatim from the prereg)

EXPLAINS (staffing fallbacks promoted from CONTRIBUTES to
EXPLAINS) iff fallback-off total arrivals ≤ 18 AND median
first-standing-100 day ≥ control median + 5 days. DEMOTE
(surge is chaotic-trajectory noise; fallbacks are a survival
contributor, not an arrivals cause) iff fallback-off arrivals
≥ 24. Otherwise INCONCLUSIVE — neither promoted nor demoted,
never re-scored mid-run.

Applied: fallback-off arrivals 17 (≤ 18 ✓); fallback-off median
first-standing-100 day 68, control median 66, required ≥ 71 ✗;
fallback-off arrivals 17, demote bar 24 ✗. → INCONCLUSIVE.
Medians are over seeds reaching standing ≥ 100 within their run
(control 7/8, fallback-off 6/8; never-reached seeds listed in
the per-seed table, never imputed).

## CONTROL REPRODUCTION GATE (report-only, judged within-run)

CONTROL reproduces the repin table on every trajectory field
and on arrivals — with ONE explained exception that is NOT
base movement:

| field | control | repin | match |
|---|---|---|---|
| wins | 4/8 | 4/8 | ✓ |
| national-ever | 7/8 | 7/8 | ✓ |
| national-final | 5/8 | 5/8 | ✓ |
| table entered | 4/8 | 4/8 | ✓ |
| wave-4 | 5/8 | 5/8 | ✓ |
| wave-5 | 0/8 | 0/8 | ✓ |
| median survival | 130d | 130d | ✓ |
| deaths | 284 | 284 | ✓ |
| starvation | 2 | 2 | ✓ |
| wave-4 arrivals | 31 | 31 | ✓ |
| tile-entry / scripted-titan | 28 / 3 | 28 / 3 | ✓ |
| table invited (transient flag) | 2/8 | 5/8 | ✗ artifact, see below |

Per-seed, control matches the repin armed row EXACTLY on every
trajectory field (days, gameDays, endReason, won, waveReach,
maxArc, finalRank, maxRank, nationalEver, nationalFinal,
entered, deathTotal, starvationDeaths), on faced, on waveKillLog
entries, and on the full ts record — all 8 seeds. The ONLY
differing field is the `table` (invited) flag, on 3 seeds
(73674, 73676, 73677: repin 1, control 0). That is a snap-timing
capture artifact, proven, not base movement: this sweep's
wrapper snaps AFTER base.daily, while the repin's snapped
BEFORE it, and tableWaiting is set overnight and consumed by
the next day's seat leg before this sweep's snap. On all three
seeds the control row still shows entered=1 with ts seat
records byte-identical to the repin (73674 seat day 118,
73676 day 144, 73677 day 130; all lesser, all path 'feared',
all 5 table answers) — the villages WERE invited and took
the seat identically; only the transient ever-observed flag
missed the overnight window. The repin table is therefore
NOT flagged superseded on trajectories: it stands, with the
invited-flag capture difference documented here. The fallback
verdict is judged WITHIN-RUN (control vs fallback-off, same
wrapper, same capture bias) regardless.

## PER-SEED METRICS (all five, every seed, both arms)

Control (fallback-on) — arrivals 31, median standing-100 day 66
(reached 7/8):

| seed | end | arrivals | standing100d | readinessd | open day | feasts | cook/fish staffed (cookFB/fishFB) |
|---|---|---|---|---|---|---|---|
| 73671 | survived 180d, wave 4 | 13 | 81 | 112 | 112 | 1 | 64/284 (2/12) |
| 73672 | won 118d, wave 4 | 1 | 57 | 96 | 96 | 5 | 87/149 (2/0) |
| 73673 | lost 32d, wave 3 | 0 | — | — | — | 1 | 5/78 (1/4) |
| 73674 | won 118d, wave 3 | 0 | 71 | — | — | 1 | 94/164 (1/2) |
| 73675 | lost 169d, wave 4 | 13 | 68 | 86 | 86 | 6 | 80/170 (1/8) |
| 73676 | won 144d, wave 4 | 0 | 58 | 143 | 143 | 3 | 98/304 (5/11) |
| 73677 | won 130d, wave 4 | 4 | 66 | 87 | 87 | 1 | 87/175 (3/0) |
| 73678 | lost 122d, wave 3 | 0 | 58 | — | — | 2 | 39/127 (10/2) |

Fallback-off — arrivals 17 (tile-entry 15, scripted-titan 2),
median standing-100 day 68 (reached 6/8):

| seed | end | arrivals | standing100d | readinessd | open day | feasts | cook/fish staffed (cookFB/fishFB) |
|---|---|---|---|---|---|---|---|
| 73671 | lost 164d, wave 4 | 14 | 65 | 90 | 90 | 0 | 69/164 (0/0) |
| 73672 | lost 137d, wave 4 | 3 | 57 | 103 | 103 | 0 | 109/231 (0/0) |
| 73673 | won 90d, wave 3 | 0 | 72 | — | — | 4 | 61/199 (0/0) |
| 73674 | won 118d, wave 4 | 0 | 68 | 117 | 117 | 3 | 92/225 (0/0) |
| 73675 | lost 173d, wave 3 | 0 | — | 111 | — | 3 | 113/403 (0/0) |
| 73676 | lost 40d, wave 2 | 0 | — | — | — | 0 | 14/80 (0/0) |
| 73677 | won 90d, wave 3 | 0 | 66 | 45 | 66 | 4 | 67/166 (0/0) |
| 73678 | lost 167d, wave 3 | 0 | 155 | — | — | 1 | 62/336 (0/0) |

Reading the table (no re-score — these are the rule's inputs
plus context):
- The arrival drop is NOT uniform: 73671 rises 13 → 14, 73672
  rises 1 → 3, while 73675 falls 13 → 0 and 73677 falls 4 → 0.
  The band total moves because two villages' stories flip,
  not because every village births fewer monsters.
- Standing-100 days barely move: per-seed control vs
  fallback-off: 81→65, 57→57, —→72, 71→68, 68→—, 58→—,
  66→66, 58→155. Median 66 → 68 (+2, not +5). The one big
  delay (73678: 58 → 155) is a single seed, and it still
  births zero wave-4 monsters in both arms.
- Readiness (wave-4-open) days move both ways: 112→90,
  96→103, 86→—, 143→—, 87→66. No systematic delay.
- Feasts fall 20 → 15 in total, but no arm's feast count
  explains its arrivals (73671 fallback-off has 0 feasts yet
  14 arrivals; 73673 control has 1 feast and 0 arrivals).
- Staffed-count caution (read this before comparing the
  cook/fish columns): under the OLD code, ctx staffed
  counters count REFUSALS as staffed (old assignAnother
  returns true without checking {ok:false}; old cook pick
  counts on assignTask regardless of ok). So fallback-off
  staffed totals (cook 587, fish 1804) are NOT comparable to
  control totals (cook 554, fish 1451) as "more staffing" —
  they are counter artifacts. The meaningful cross-arm reads
  are arrivals, standing days, readiness days, and feasts;
  the fallback counters themselves (control: cookFB 25,
  fishFB 39 across the band; fallback-off: 0/0, as expected
  — the code does not exist there) prove the variant ran the
  intended code on both sides.
- Wave-4 kills: 2 in each arm (control: 73671 congregation,
  73677 influencer; fallback-off: 73671 strike, 73672
  influencer), all log-matched to arrivals.

## WALL NUMBERS (both arms)

Control: wins 4/8, national-ever 7/8, national-final 5/8,
table invited-flag 2/8 (artifact, see above), entered 4/8,
wave-4 5/8, wave-5 0/8, median 130d, deaths 284, starvation 2.
Fallback-off: wins 3/8, national-ever 5/8, national-final 4/8,
invited-flag 4/8, entered 3/8, wave-4 3/8, wave-5 0/8,
median 137d, deaths 295, starvation 1.
Death-cause shares — control (284): villager combat 43.3%,
villager-vs-villager 24.6%, player arena 12.0%, expedition
7.0%, sickness 3.5%, wound that wouldn't close 2.5%, ambush
2.1%, villager monster 1.8%, dehydration 0.7%, starvation
0.7% (1 villager + 1 player), singles: lockjaw, The Redactor.
Fallback-off (295): villager combat 39.0%, villager-vs-
villager 22.7%, player arena 19.0%, expedition 5.8%, monster
3.4%, ambush 2.0%, sickness 1.7%, wound 1.4%, dehydration
1.0%, lockjaw 1.0%, contest 0.7%, Choir Toad 0.3%.

## PREMISE VERIFICATION (before sweeping — passed)

Code chain read before any sweep: tableseat-nowait daily →
leanlinkrescue.daily → competent.daily → counterPlay (cook
pick + fish loop). Empirical probe: control seed 73671
reproduced the repin 73671 row exactly on every shared field
(days 180, survived, wave 4, regional, deaths 45, faced/log/ts
identical) AND showed the fallback code executing on this band
(cook staffed 64, fish staffed 284, cook fallbacks 2, fish
fallbacks 12; 13 wave-4 spawns; standing-100 day 81,
readiness day 112). Premise held; the sweep proceeded.

## SENSE-TESTING READ (color, clearly labeled — replay text never enters any count)

Sense seed by the pre-registered rule: most wave-4 arrivals in
the CONTROL corpus — 73671 and 73675 tie at 13; 73671 wins the
tiebreak with 1 kill against 73675's 0. Census thread (authoritative):
73671 control births 13 Mirror Draft monsters from day 116 to
day 180, fights and kills its Congregation on day 121, watches
a Eulogy depart after three lost fights, a Reunion melt, and
finishes day 180 with ten wave-4 monsters still standing.
Fallback-off 73671 census thread: 14 arrivals from day 90 to
day 163, a Strike killed, two melts, and the village lost on
day 164 — one day short of the control's 180-day survival, with
MORE arrivals, not fewer.

NON-MEASURED replays (wording/meaning only, trajectories
shifted as disclosed): control 73671's replay shows the d151
beat — "FINALES need a LEGEND... look the Mirror Draft in the
eye. The producers are WAITING" — and late turn-based fighting
(d160, d167 x4, d179 x2), including a Suburb struck for 48
with a Machete on d179 — the same beats the repin replay
showed, so the fiction still names the Mirror Draft as the
bar. Fallback-off 73671's replay is busier and darker: fight
starts d134, d145, d156 x2, d161–d164, ending on the last day
inside a Eulogy fight it is losing (Final Chapter hits of 28,
29, 54, 65). Plain-words contrast: the fallback-off village
does not look starved or idle — it looks like a village that
met the Mirror Draft earlier (open day 90 vs 112), fought it
more, and died in it sooner. That is color, not a count: the
census says the band total fell while this village's count
rose, and the replay agrees that this village's story is not
the band's story. Replay text saved alongside the corpus:
perseed-surgeconfirm-a/sense-73671-control.txt and
sense-73671-fallbackoff.txt.

## WHAT WAS NOT RUN

No social-family (D) third arm. The arrivalsurge evidence
sequences it AFTER this arm reports, and this arm's verdict is
INCONCLUSIVE — the D arm is the coordinator's next sequencing
call, not a run this arm starts. Nothing here pre-judges it:
if D moves arrivals with standing timing intact, the same
promotion-rule shape can judge it; if D also fails the timing
leg, the surge's channel is neither family alone.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No metric was re-scored. The run was judged exactly against
its prereg: the control reproduction gate (report-only, with
the transient-flag artifact documented, not adjusted away),
the five per-seed metrics, and the binding promotion rule
(EXPLAINS / DEMOTE / INCONCLUSIVE). Two method notes, neither
a revision:
(1) The control-vs-repin invited-flag difference (2/8 vs 5/8)
is a snap-timing artifact of this sweep's after-daily snap vs
the repin's before-daily snap, proven per seed by identical
trajectories + identical ts seat records + entered=1 on all
three differing seeds. It is reported as an instrument
difference, not as base movement and not as a gate failure;
a future sweep that wants the invited flag to match should
snap BEFORE base.daily like the repin did (the pure standing/
readiness reads stay after daily, as here).
(2) The staffed counters are not cross-arm comparable under
the old code (refusals counted as staffed) — the prereg's
metric (v) is reported in full, but the evidence does not use
it to argue magnitude; the verdict rests on arrivals +
standing timing, as the rule specifies. A future run that
wants a clean staffing comparison should count accepted
assignments from the game side, not the policy ctx counters.
The balanced panel / telemetry check were NOT run, per the
standing exception for recorder rows (panel cannot ingest
per-seed recorder corpora — twelfth sighting). The sweep
summary + analyzer output are the comparison of record. No
telemetry baseline was rolled. No game code changed in this
run; no [needs-eyes] flag applies (measurement only).

## Infrastructure notes

- Proof: scripts/test-surgeconfirm-a.js — ALL CHECKS PASS
  (unit boundaries for the promotion rule + median, recorder
  sha256, variant diffs, corpus errors 0, per-seed repin
  comparison, verdict re-derivation). Sweep:
  scripts/test-surgeconfirm-diag-sweep.js (CORPUS: PASS).
  Analyzer: scripts/test-w4funnel-diag.js reused verbatim via
  its exported analyzeW4funnel. Sense:
  scripts/test-surgeconfirm-sense.js (NON-MEASURED replay only).
- Variant files: scripts/policies/competent-nofallback.js
  (byte-identical to the pre-fallback competent.js blob
  908ad0f12^), leanlinkrescue-nofallback.js (require + id
  only), tableseat-nowait-nofallback.js (require line only).
  scripts/policies/competent.js NEVER edited (validator check
  passes; git status for it empty throughout).
- LOUD FAILURE FOUND AND FIXED MID-RUN (disclosed, not
  hidden): the first fallback-off sweep ran an IDLE policy —
  the variant file exports its policy under the ORIGINAL name
  (tableseatNowait), and the sweep destructured a renamed
  export, getting undefined, which the diag wrappers silently
  wrapped into a no-op (cook=fish=0 on all 8 seeds, villages
  idle for 180 days). Those rows were DELETED uncommitted,
  never counted, never committed. Fix: the sweep aliases the
  real export name and now THROWS on a missing base instead
  of running idle; the sense script got the same fix after
  it crashed the same way (runDays reading policy.id of
  undefined). Lesson for the next arm: never trust a sweep
  whose staffed counters read zero everywhere — that is the
  idle-policy signature, and the guard now fails loudly on it.
- Safe-commit index clobber hit the prereg commit (d0bd3a6c9)
  — the known class: commit correct, main index showing a
  bogus staged deletion after. Repaired via HEAD-blob
  cacheinfo, verified with `git status --short` empty +
  `git diff HEAD` empty + worktree files intact, before any
  further work. Same repair to be verified after the final
  commit below.
- No EPERM flap blocked this run's writes; all 16 valid rows
  wrote first try. First sweep run ~5.5 min (7 control + 8 idle
  fallback-off rows); fallback-off re-run ~2.5 min for 8 seeds;
  validator seconds.
- Commits: prereg d0bd3a6c9 (alone, before sweeping); this
  evidence + scripts + variants + corpus to follow in the
  run's second commit (hash in the coordinator report).
  Ready for coordinator merge; NOT pushed, NOT bumped, live
  NOT verified (coordinator/ship-loop line, not this arm's).
  No [needs-eyes] flag: measurement only.
