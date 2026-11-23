# Journey succession r268 — Lane B, leg 7 (succession) — RUN NOTE

Run: `journey2-7-20261123T1355Z`. Panel 14:26:33Z–14:42:17Z Nov 23, 2026.
Base: master `a6cb127cc` at registration. Closeout by finisher (the 1355Z
occurrence timed out before closeout; the panel, proof tests, and
adjudication below were verified from the files, not taken on report).
Rotation-b read 7 at run start; this run writes 4 at closeout.

## Pre-registered question + bars

r267 ended with ONE FAIL, table-pool exhaustion: 1 dry hit, other-class
(non-mourning) — seed 34512 d86, Lokman, pick `alive:event:table`, the
2-candidate waiting pool exhausted on its third serving across a 70-day
post-phase. This run carries TWO filed items, on separate bars, with
separate variables (see the prereg): Variable 1, the STAGE-2 PREFIXED
RETRY in `topic2Ask` (the fix — when every bare alternate is blocked too,
retry each candidate with a fresh generic preamble as first chunk;
mourning carve-out: stage 2 never engages for mourning); Variable 2,
WIT-SIT v3 staging, driver-only (post-phase-only, single-fresh-only —
to raise single-fresh draws for REL-WIT; stated before play, total
sittings will very likely FALL below r267's 5 — draw quality over
quantity; if single-fresh draws come in below 3, REL-WIT returns
INSUFFICIENT-DATA again and the staging design gets revisited next run).

Bars (binding, §14, carried from r267): DRY CENSUS 0 dry hits any class
(the proof test carries the fix verdict — the panel alone is weak
evidence: r267's rate was 1 dry in ~200+ servings, so a 0 here could
also be luck); MOURN-TEMPLATE 0 repeats (amended r263, double-stage-pair
exemption untested; a repeat ABOVE r267's 0 would indict the carve-out);
SUPPLY ≥1 witnessed person corpse = SUPPLY-PRESENT; MONSTER-WITNESS ≥90%;
STAGE ≥1 staged wit-sit fires on a supplied seed with a living witness
speaker, inside the fresh window; REL-WIT PASS = ≥1 judged witness-variant
serving with rel.witnessed true AND 0 where not witnessed, <3 single-fresh
draws = INSUFFICIENT-DATA, wrong-dead serving = fabrication FAIL LOUDLY;
REL-BOND; REL-VET (≥10 opener draws arm a); MOURN-EXHAUST 0; MANTLE-FINE
0 flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2, 0
unexplained fineLatency==1, 0 day-skips; WILD CHECK 0 regressions on
F4a/F4b/F4c/F5/F6/C3c/F2/C3d + landed-fix surfaces; C3d WILD HOLD 0
erasures; F5 WILD EXERCISE descriptive; CONTROLS smoke 33998 snapshot
matches r267 — if the snapshot moves, it is base drift since r267,
recorded as such and the bar re-baselines by measurement, not adoption.

## Panel

- Driver `scripts/journey-succession-r268-20261123.js` (r267 driver +
  WIT-SIT v3: post-phase-only, single-fresh-only), analyzer
  `scripts/analyze-journey-succession-r268-20261123.js` (r267 analyzer,
  rename-only fork + v3 label), runner
  `scripts/run-journey-succession-r268-panel.sh`.
- Fresh band 34518–34541 (24 seeds, EARLY_KILL_DAY=40, POST_DAYS=70) +
  positive control 34403 (same config, replay) + smoke 33998
  (EARLY_KILL_DAY=5, POST_DAYS=25). Band verified fresh before play
  (word-boundary grep, 0 seed-uses).
- All 26 seeds exit=0. Panel complete 14:42:16Z, analyzer exit=0.
  (`evidence/2026-11-23/journey-succession-r268-panel.log`).

## Results — adjudication per bar

| Bar | Verdict | Number |
|---|---|---|
| DRY CENSUS (binding, THE fix bar) | **PASS** | 0 dry hits (binding-class 0, other-class 0; honest fallbacks 45; null-return silences 0) on 190 driven mourning servings |
| MOURN-TEMPLATE (binding) | **PASS** | 190 servings, 0 same-speaker repeats, 0 village-window repeats, 0 double-stage exemptions |
| MOURN-EXHAUST (binding) | **PASS** | 0 exhausted-line servings |
| SUPPLY (binding) | **SUPPLY-PRESENT** | 3 witnessed person corpses (see below) |
| MONSTER-WITNESS (binding, instrument) | **PASS** | 883/883 = 100% |
| STAGE (binding) | **PASS** | 1/1 staged sitting fired on a supplied seed with a living witness speaker, inside the fresh window |
| REL-WITNESS (binding) | **INSUFFICIENT-DATA** | 1 single-fresh draw (floor is 3); 0 judged servings; no wrong-dead serving (see below) |
| REL-BOND (binding) | **PASS** | 15/15 held, 0 unheld |
| REL-VETERAN (binding) | **PASS** | 23/23 held, 0 unheld; 85 opener draws in both-veteran convos |
| MANTLE-FINE (binding) | **PASS** | 106 deaths; 0 flippedImmediate=false, 0 fineLatency>=2, 0 unexplained fineLatency==1, 0 day-skips |
| WILD CHECK (binding) | **PASS** | carried proofs re-run GREEN (see below); DRY wild check deflect_q 0, dlg:doubt 0, other-class 0; no regression observed in the panel transcripts |
| C3d WILD HOLD (binding) | **PASS** | 0 erasures in the transcripts read |
| F5 WILD EXERCISE (descriptive) | 0 firings | 18 "settled" lines, all ambush/murder-case or wind-down, none settled-favor; rolling window r233+r245+r248+r254+r258+r263+r266+r267+r268 stays 0 |
| CONTROLS (binding) | **MOVED — BASE DRIFT, RE-BASELINED** | smoke snapshot moved (see below); handoff, bonds-at-death, mourning, selfId, machinery all match |
| CAP-NC (descriptive) | PASS | bonded-by-deadline 7/7 eligible seeds |
| POSITIVE CONTROL (descriptive) | 0 witnessed | replay divergence, not instrument failure |
| HABIT-COLLISION | **PASS** | 0 same-seed collisions (5 habit-for servings) |

## The fix — proven by the proof test, wild-confirmed by the panel

New `scripts/test-journey-succession-r268-table-dry.js` (modeled on
r267's proof test; same harness, same staging helpers). Three cases,
each in its own process:

- **table-exhaustion**: stage the table waiting event, poison the run
  ledger with BOTH filled table lines, drive `[alive:event:table]`.
  FIXED: the served line is a preamble-prefixed alternate —
  `"Good question." "Have you felt it? Like the air before a storm,
  but — bigger. Something's on its way."` — no dry line anywhere in
  the transcript. All 10 checks PASS.
- **control**: same staging, NO poisoning. The pick serves honestly,
  one of the two table lines, plain, none dry — the fix changes no
  unblocked path. All 8 checks PASS.
- **mourning-all-blocked** (descriptive, the carve-out check): poison
  ALL 5 filled mourning generics, drive `[alive:event:mourning]`. The
  line dries exactly as on base (`"...Sorry, lost my train of thought."`),
  no preamble-prefixed mourning line, no wrong-dead line. All 8 checks
  PASS. The carve-out holds.

Verified by the finisher in-run, RED before the fix and GREEN after:
with `src/js/convoTopics.js` restored to the base (`a6cb127cc`) version,
table-exhaustion fails 4 checks (the dry line is served); with the fix
restored (sha256 verified identical to the worker's file), all three
cases are ALL GREEN. The fix is 54 added lines in `topic2Ask`, after
the r267 stage-1 retry — nothing else in the game changed.

The panel wild-confirms: DRY CENSUS 0 on 190 driven mourning servings
(r267: 1 dry in ~200+). As the prereg says, the panel alone is weak
evidence — a 0 could also be luck — but the proof test carries the
verdict and the panel does not contradict it. Two candidate stage-2
servings in the wild (34538 d+45 Dieter, 34528 d+65 Tobias — a generic
preamble leading the table line) are NOT attributable to stage 2: the
same shapes occur on r267's panel, which ran without the fix — the
generic preambles are also served as ordinary ack chunks on other
topics. Preamble counts are comparable across runs (r267: 86,
r268: 74), so stage 2 did not spray preambles. Whether stage 2 fired
at all in the wild is unproven from the transcripts; the proof test is
the evidence it works, the panel is the evidence nothing dried.

## REL-WITNESS INSUFFICIENT-DATA — the v3 trade, as predicted

Single-fresh draws: 1 (floor is 3). Total sittings: 1 (r267: 5) — the
fall the prereg predicted. The one staged sitting:

- 34522 d+18, dead Somchai, cause combat, witnesses Yanina, Aria,
  Ruth, Esteban, Cameron. Speaker Yanina (a witness), latelyDead =
  Somchai, latelyWitnessed = true. witnessServing = none.

Why no serving: the sitting was NONVERBAL. Yanina speaks only Spanish
— no shared words at all, just eyes, hands, and patience — and the
whole exchange is gestures. A witness-variant mourning line cannot be
served in a sitting with no words. The v3 staging picks the first
unused living witness and never checks whether the speaker shares a
language with the scholar, so the panel's only draw was unservable
from the start. FILED for the next run's staging design: stage only
when the speaker shares a language (or count nonverbal draws
separately — they are not draws on the variant at all).

The other two witnessed corpses produced no staged sitting and no
record: Rosa (34529, combat, witnesses Thilo/Tariq/Luke) and Ava
(34531, combat, witnesses Nurdaulet/Vy). The v3 driver returns
silently when freshPersonN ≠ 1 (multi-fresh window — out of scope by
design) or when no candidate is within 0–1 days, and pushes no record
for a skipped death — so post-hoc the reason cannot be told apart
(multi-fresh vs scan-timing). FILED: record skip reasons next run,
so the next panel can say which gate spent the supply. (Note the
analyzer's "lately named the staged dead on 1/1 fired sittings" means
the lately EVENT named the staged dead, not the served words — the
Yanina transcript names no one, being nonverbal.)

Per the prereg, INSUFFICIENT-DATA on count is a staging result, not a
game failure. No wrong-dead serving, no fabrication. The 3-draw floor
stands. The staging design (not the game) gets revisited next run:
post-phase-only + single-fresh-only bought draw purity at the cost of
draw count (5 sittings → 1), and the one draw it bought was
nonverbal. r267's v2 (5 sittings, 3 single-fresh draws, 1 serving)
outperformed v3 on every count that matters.

## SUPPLY-PRESENT — 3 witnessed person corpses, all combat

- 34522 Somchai, combat, 5 witnesses (Yanina, Aria, Ruth, Esteban,
  Cameron).
- 34529 Rosa, combat, 3 witnesses (Thilo, Tariq, Luke).
- 34531 Ava, combat, 2 witnesses (Nurdaulet, Vy).

Person corpses panel-wide: 147 (monster 883). No witnessed corpse
with a cause outside combat/ambush — the corrected witness map holds;
no third witness path appeared. The census count stays a lower bound
(40-entry cap; r266: Sari hidden the same way). Positive control
34403: 0 witnessed (4 person corpses, 0 witnessed) — replay
divergence (proven r262), NOT instrument failure; MONSTER-WITNESS
883/883 = 100% is the binding instrument check.

## People check (transcripts read in full)

Transcripts read: the witness sitting (34522 d+18 Yanina, nonverbal —
see above), the REL-BOND serving (34518 d+64 Wei, opener:bond-knew-
things, dead Kate, bondV=100 depth=3 both veterans — "Kate always
took the burnt piece. Said someone had to. I take it now."), the
MOURN-HIT (34525 d+3 Brian, opener:owed-favor, dead Kurt), and a
further mourning serving (34540 d+54 Mia, opener:bond-knew, dead
Brunhilde — "I knew Brunhilde. Really knew them, not the fire's
version. Mine. And now there's just the fire's.").

Conversations cohere; mourning lines name real dead with appropriate
relationships (Wei/Kate bondV=100, Mia/Brunhilde bondV=48); no
fabricated shared history observed; no wrong-dead line served
anywhere on the panel (REL-WIT, REL-BOND, REL-VET all 0 unheld).
The villages are socially dense: 100 NPC-NPC new bonds, 66 newcomer
arrivals, 23 FIRST-bearer newcomer bonds on undriven days, 4 unbonded
talk-requests, selfReqDayEntries 0 (r133 purge regression check
holds). CAP-NC bonded-by-deadline 7/7 eligible; descriptive
bondedEver 15/17 probe-opened seeds.

Village assessment: talkative, feast-heavy villages with a dense
social fabric — same shape as r267/r268 social. The outward life
(outings, trail) is not this leg's question. Nothing in the
transcripts read suggests the stage-2 fix changed how people talk:
preamble counts match r267, and the mourning lines read the same.

## Controls — smoke moved: base drift, re-baselined

Smoke 33998 vs the r267 snapshot (handoff d6 Heinrich → Grace,
relPost bonds 33, relD14 45, relEnd 47, mourning servings 0,
NPC-NPC bonds 12, selfId grace_obi):

- handoff d6 Heinrich → Grace ✓ (scripted, unchanged)
- relPost bonds 33 ✓
- relD14 **47** (was 45)
- relEnd **48** (was 47)
- mourning servings 0 ✓
- NPC-NPC bonds **13** (was 12)
- selfId grace_obi ✓
- machinery: pick rank 1 ✓, funeral INCALL true ✓, selfReq 0 on
  every seed ✓ (OPP totals: selfReqDayEntries total 0)

Investigated as staging-vs-drift, per the prereg (not assumed): the
smoke seed has exactly 1 person corpse (cause: the expedition,
witnessed 0) in this run — no witnessed death, so no wit-sit could
fire on it under v2 or v3 staging. The v3 staging change cannot
explain the move. The base moved between r267's base and this run's
base (`a6cb127cc`, which includes the social r268 convoLiveBeat fix
and the gone-bearer lines, both of which touch conversation serving)
plus the stage-2 fix in the worktree. The move is base drift: +2
bonds by d14, +1 by end, +1 NPC-NPC bond — small, same direction,
no machinery moved. Per the prereg, the bar re-baselines by
measurement: the smoke snapshot is now handoff d6 Heinrich → Grace,
relPost bonds 33, relD14 47, relEnd 48, mourning servings 0,
NPC-NPC bonds 13, selfId grace_obi.

## WILD CHECK

Carried proofs re-run GREEN (see Gate section for the rebased-tip
re-run): r262 escalator-cap, r254 multiwit, r232 relationship-
mourning, r225 F5 harness (22/22), r258 selfwit, r267 mourning-dry.
Analyzer DRY wild check: deflect_q 0, dlg:doubt 0, other-class 0.
No F4a/F4b/F4c/F5/F6/C3c/F2/C3d regression observed in the panel
transcripts. C3d: 0 erasures in the transcripts read. F5 WILD
EXERCISE: 0 firings — 18 "settled" lines in the transcripts (11×
"Good — what's been happening, settled. Feels better said out loud."
wind-down; 5× "There's still the matter of the murder/ambush of X.
Nobody's settled it." ambush/murder-case; 2× other wind-down), none
settled-favor. Rolling window r233+r245+r248+r254+r258+r263+r266+
r267+r268 stays 0.

## Telemetry

`node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/succession.json --current
'evidence/2026-11-23/journey-succession-r268-tele-*.json' --metrics
deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`
— 2 LOUD lines, both forced-chain regime, investigated, no real bug
shown (same two lines as r266/r267, same cause):

- deaths.bearer: baseline 7.6 → current 106 (n=26 files). The panel
  forces a bearer death on day 40 of every seed (EARLY_KILL_DAY=40)
  plus the scripted smoke death; 106 bearer deaths across 26 seeds is
  the forced chain doing its job (r267: 99, r266: 87). Per-file mean
  ≈ 4.1 — the LOUD is the tool's sum-vs-mean mismatch (unresolved
  since r229), not drift.
- census.fallen: baseline 14.3 → 179. Same regime — forced chain +
  110-day panel horizon (r267: 193, r266: 175).
- census.alive, census.integrationStage, week2.deadBearerMentions:
  quiet.

Per the prereg rule (a forced-chain panel must NOT roll the unforced
baseline forward), **the baseline is NOT rolled**. The LOUD lines are
regime, not drift.

## Reachable / fun / winnable

This run's lever is a conversation-feel fix, not a winnability lever:
no one wins or loses a run over a dry line, but a villager who loses
their train of thought mid-sentence about the table coming is a crack
in the thing the player is asked to believe in — and the table is the
endgame. The fix is small, honest (a thinking pause, never a false
history claim), and proven by its proof test. It changes nothing else
in the game: no standing, no gear, no fight, no veteran count moves
on this run. REL-WIT stays unmeasured — the witness-variant serving
is still a real, unproven piece of the succession story, and the
staging instrument needs a redesign before the next succession run
asks the question again. The succession leg's wall is now the
instrument, not the game.

## Metric review (carried + filed)

- REL-WIT: v3 staging (post-phase-only, single-fresh-only) is THIS
  run's instrument change. It did NOT raise draws: 1 single-fresh
  draw (r267: 3), 1 sitting (r267: 5), 0 servings (r267: 1). The
  3-draw floor stands. Next run's staging design must (a) filter for
  a shared language — a nonverbal sitting cannot serve the variant;
  (b) record skip reasons — silent returns hide whether supply was
  spent by the multi-fresh gate or by scan timing; (c) decide whether
  to revert to v2's phase-A scan (r267's 3 draws came with 2
  multi-fresh sittings, but 5 sittings beat 1).
- MOURN-TEMPLATE double-stage-pair exemption: still untested in the
  wild (0 double-stage pairs sharing a shape; double-staged deaths 0).
  Stands.
- F5 WILD EXERCISE stays DESCRIPTIVE; rolling window advances one
  panel (r233+r245+r248+r254+r258+r263+r266+r267+r268), stays 0.
- Proof refresh rounds 11 + 12 remain owed (measurement-proof track,
  carried since r192/r194/r195).
- Day-skip watch: twenty-ninth straight panel watch, 0 skips.
- Scout-role ping-pong / driver re-ask pestering: carried, unchanged.
- Multi-name relationship mourning stays open (not built). KIN
  mourning stays unavailable (no kin signal). BOWCRAFT bisect for the
  34362 drift stays open (not this run's). Outing-chain re-tune stays
  open (conversion 12.9%, r260).
- **Filed (this run, instrument):** v3 staging spends draws on
  nonverbal speakers — the speaker must share a language with the
  scholar for the witness variant to be servable.
- **Filed (this run, instrument):** v3 silent skip returns leave no
  trace — record why a witnessed death got no sitting (multi-fresh
  gate vs scan timing vs no living witness).
- **Filed (instrument, carried):** the 40-entry corpse-census cap can
  hide witnessed corpses (r266: Sari, 34435); the census also
  undercounts ambush-witnessed deaths systematically (r267). The
  census verdict stays a lower bound; the wit-sit live scan stays the
  backstop.
- **Filed (diagnostic, carried):** the witness-population map is
  corrected (r266) — ambush is a second witness path (bystander
  within 6 tiles). The `hurtVillager` fix proposal stays filed for
  Steve, NOT built (a game change to grief/gossip/murder gating,
  needs his call).
- **Filed (this run, carried):** `topic2Beat` follow-ups share the
  template-vs-filled gap — a mourning follow-up whose filled line is
  run-blocked would dry the same way. No wild hit on this panel; fix
  only if a panel shows one.
- **Filed (this run, carried):** mourning total pool exhaustion still
  dries by design (the stage-2 carve-out) — a larger single-name pool
  or a last-resort structural serve would close it; neither is built
  here.

## Adoption notes

- The run timed out before closeout; this note was written by the
  finisher from the panel evidence, the analyzer, and the proof-test
  runs — every number above was re-read from the files.
- The stage-2 fix is the only game-code change. The driver/analyzer/
  runner forks are evidence/tooling, committed with the panel.
- Next succession run: revisit the WIT-SIT staging design before
  playing (language filter + skip reasons + v2-vs-v3 call); the
  REL-WIT question is unanswered, not failed.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
in the worktree on the rebased tip (HEAD `c84b0d188`), run via
`/tmp/r268-gate.sh` (detached, after a first gate run was killed at
~335/344 by a runtime restart of the exec service — the detached
re-run is the complete record). **338 passed, 6 failed in 1154s.**
Gate start 16:09:25Z, end 16:28:41Z. (`evidence/2026-11-23/
journey-succession-r268-gate.log`.)

The 6 failures, all attributed, 0 attributable to this run:

- `scripts/godpath/test-measurement-proof-update.js` (exit 1, 3.7s)
  — "Proof source inputs are not current": the measurement-proof
  staleness pair, standing family (the fix changes Game inputs;
  the retained neutrality proof refresh is rounds 11+12, owed
  since r192, not this run's job).
- `scripts/godpath/test-measurement-workflow.js` (exit 1, 4.0s) —
  "retained neutrality proof covers the current Game/controller/
  harness inputs" FAIL: the other half of the staleness pair.
  Same standing cause.
- `scripts/godpath/test-phone-frame-proof.js` (exit 1, 4.7s) —
  retained receipt hash 736; stale inputs (index.html,
  alienPlayers.json, build-notes.json, foreignSpeech.json,
  regions.json, statusEffects.js): the phone-frame stale receipt,
  standing family. This run touches no phone-frame input.
- `scripts/godpath/test-living-garden-deed-attainment.js` (exit
  null, 120.1s), `test-one-person-army-deed-attainment.js` (exit
  null, 120.1s), `test-trust-observer-neutrality.js` (exit null,
  120.1s) — all three are 120s timeouts under load (load average
  18–21 during the gate). Re-run standalone, serialized, on the
  same tip: living-garden 8 passed / 0 failed, one-person-army 7
  passed / 0 failed, trust-observer-neutrality 6 passed / 0 failed
  — all EXIT=0. (`evidence/2026-11-23/
  journey-succession-r268-gate-standalone.log`.) Confirmed load
  flakes, not defects.

No new failure. The gate is the standing set (2 staleness + 1
phone-frame + 3 load-flake timeouts, all re-proven green
standalone) and nothing else. 0 attributable.
