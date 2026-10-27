# sim-socialD-a — PRE-REGISTRATION (binding, written BEFORE any sweep)

Run: fleshout loop A, run fleshout-20261027T1215Z, axis scale-onramp.
Arm: sim-socialD-a — SOCIAL-FAMILY (D) SEPARATION arm, sequenced after
the 1121Z fallback report (sim-scale-onramp-round-1121.md).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no lever proposal. No [needs-eyes] flag applies:
measurement only, no feel/combat/UI change.

## CANON READ FIRST

- docs/CANON.md, docs/MONSTER-WAVES.md, docs/CONVERSATIONS.md.
  Wave law used here, read from canon + code (never invented):
  wave 4 = The Mirror Draft, standing >= 100 (blood / bonds / bread,
  pure or hybrid); wave 5 = The Producers, standing >= 200 AND
  wave-4 faced. Readiness gates hold waves 4-5
  (src/js/standing.js waveCombatReadiness()).
- No canon doc covers the ask:others visibility family itself — it
  lives in journey evidence (r54/r55/r59), not in a canon doc.
  Stated here instead of inventing canon for it.

## CONTEXT READ FIRST

- evidence/2026-10-27/sim-arrivalsurge-a.md + its prereg:
  family D = the SOCIAL / CONVERSATION VISIBILITY family, secondary
  CONTRIBUTES to the wave-4 arrival surge (11 -> 31). Its five
  commits, all in src/js/conversation.js except the last in
  src/js/party-formal.js:
  (1) 92fa1c799 (journey-social r54): subject-menu discussed-
  'others' re-list + ask:others pager rank 4 -> 3 (rides with the
  other social verbs instead of paging away);
  (2) 6fdee4d5a (Lane B social r55): main-menu discussed-'others'
  exemption (rides past the topic cap, bounded by MAXC);
  (3) c509ec15a (journey social r59): party-menu trim protects
  ask:others (trim victims skip it);
  (4) 1377d03c3 (journey deepening r53): stage-0 ask_favor re-ask
  guard (engine-internal, carried as negligible within D by
  arrivalsurge);
  (5) de87ffe79 (journey-landing r54): winddown grace beat as
  the closing line (voice-adjacent, carried as negligible).
  Mechanism as claimed: ask:others picked more often -> more
  village talk -> more gossip/trust -> seasoned links sooner ->
  diplomacy standing (+34 per seasoned regional+ link) sooner ->
  wave 4 earlier, at an unchanged spawn rate.
- evidence/2026-10-27/sim-surgeconfirm-a.md + its prereg +
  evidence/2026-10-27/sim-scale-onramp-round-1121.md: the fallback
  arm reported INCONCLUSIVE — fallback-off arrivals 17 vs
  control 31 (count leg for EXPLAINS, <= 18, PASSED); median
  first-standing-100 day fallback-off 68 vs control 66 (timing
  leg, >= control + 5 = 71, FAILED). Fallbacks stay CONTRIBUTES;
  standing-100 timing is ruled OUT as the fallback channel. The
  1121Z report sequences D as the next attribution step and
  demands this arm fix whether D is measured against control or
  against fallback-off. THIS PREREG FIXES IT: see PRIMARY
  COMPARISON below. The residual to explain is the fallback-off
  band's 17 arrivals (tile-entry 15 + scripted-titan 2), not the
  control band's 31.
- Fallback-off reference numbers (surgeconfirm, within-run):
  arrivals 17; median first-standing-100 day 68 (reached 6/8);
  wins 3/8; national-ever 5/8; national-final 4/8; entered 3/8;
  wave-4 3/8; wave-5 0/8; median survival 137d; deaths 295;
  starvation 1. Control reference (secondary only): arrivals 31;
  median standing-100 day 66 (reached 7/8); wins 4/8;
  national-ever 7/8; national-final 5/8; entered 4/8; wave-4 5/8;
  wave-5 0/8; median 130d; deaths 284; starvation 2.

## QUESTION (fixed before sweeping)

Does family D explain the RESIDUAL wave-4 arrivals (17) and/or
the residual standing-100 timing (median 68d) that remain AFTER
staffing fallbacks are removed? In plain words: with the cooks
and fishers already taken away, does taking the village-talk
verb away too cut arrivals further, or was D's share already
spent inside the fallback effect / never live on this band?

## PRIMARY COMPARISON (binding — fixed by this prereg)

PRIMARY: D-OFF measured against FALLBACK-OFF — i.e. the arm is
fallback-off + D-off versus fallback-off alone. The question is
whether D explains the residual arrivals/timing after fallbacks
are removed, so the fallback-off band is the only valid base.
Plain control (surgeconfirm control, arrivals 31) is a SECONDARY
REFERENCE ONLY and NEVER the judge: a D-off-vs-control drop
proves nothing about D, because it would re-count the fallback
effect. Every verdict below is computed from fallback-off vs
D-off numbers only.

## SUBSTRATE (fixed before sweeping)

- Seeds 73671-73678 (the repin band, identical seeds, always).
- Policy chain: tableseat-nowait -> leanlinkrescue -> competent
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1), NEVER edited in place.
- Horizon: 180d death-aware (runDays stops on death/win; 180 is
  the cap, not a fixed horizon — MEASUREMENT §10), same as
  surgeconfirm.
- Two sweeps on current master, same seeds, same substrate,
  both with the same five recorders reused VERBATIM from
  current master (raftdraft-diag, spawnsrc-diag, oldcore-diag,
  w5births-diag, defwound-diag) plus the same sweep-side pure
  reads (Game.villageStanding() raw breakdown +
  Game.waveCombatReadiness(4); the gated villageStandingTotal()
  is NEVER called daily — it writes peak state and fires beats).
  - FALLBACK-OFF (baseline): the surgeconfirm fallback-off
    chain (tableseat-nowait-nofallback -> leanlinkrescue-
    nofallback -> competent-nofallback), re-run, not assumed.
  - D-OFF: fallback-off + the D-off filter (see VARIANT).
- COMPETENT_TALK is UNSET in both arms, exactly as in
  surgeconfirm. Deliberate: setting it would change the
  substrate and break comparability to the surgeconfirm
  fallback-off numbers this arm is judged against. See
  CHANNEL HONESTY below for what this implies.
- Plain control is NOT re-run: its surgeconfirm numbers above
  are the secondary reference. Re-running it would spend a
  third arm on a comparison the prereg forbids judging by.

## VARIANT (D-off policy files, sweep-side only)

- scripts/policies/competent-nofallback-socialD.js: a copy of
  scripts/policies/competent-nofallback.js differing ONLY in:
  (1) a header comment naming this arm; (2) pickTalkChoice
  filters out any choice with id 'ask:others' BEFORE the
  ans/teach/gq/ask priorities and before the live[0] fallback
  (so ask:others is never returned), counting each filtered
  candidate in ctx.askOthersFiltered (a counter only — it
  changes no behavior beyond the filter). No other byte
  differs. Proof, checked by scripts/test-socialD-a.js:
  (a) `git diff` between competent-nofallback.js and
  competent-nofallback-socialD.js contains ONLY the header +
  the filter hunks; (b) unit test: pickTalkChoice on the OLD
  function returns 'ask:others' for a single-choice menu
  [{id:'ask:others'}] (fail-on-old), on the NEW function
  returns null (pass-on-new); and on a mixed menu the new
  function returns the next-best choice, never 'ask:others'.
- scripts/policies/leanlinkrescue-nofallback-socialD.js: a copy
  of leanlinkrescue-nofallback.js differing ONLY in the require
  line ('./competent-nofallback' ->
  './competent-nofallback-socialD') and the policy id/desc
  strings.
- scripts/policies/tableseat-nowait-nofallback-socialD.js: a
  copy of tableseat-nowait-nofallback.js differing ONLY in the
  require line ('./leanlinkrescue-nofallback' ->
  './leanlinkrescue-nofallback-socialD').
- scripts/policies/competent.js, competent-nofallback.js,
  leanlinkrescue-nofallback.js, tableseat-nowait-nofallback.js
  are NEVER edited in this run; `git status` / `git diff` for
  them must stay empty.
- SCOPE LIMIT (honest, fixed now): D-off as built here covers
  the ask:others VISIBILITY sub-family — the r54 rank lift, the
  r54 subject-menu re-list, the r55 main-menu exemption, and
  the r59 party-trim protection — as expressed through the
  policy's choice picker, which is the only policy-side
  expression of D. The r53 ask_favor re-ask guard and the r54
  winddown grace beat are engine-internal and NOT policy-
  expressible; they are NOT removed, and are carried as
  negligible per the arrivalsurge disposition. A RULED-OUT
  verdict therefore rules out the visibility sub-family on
  this band, not those two voice/guard bits. A future arm
  that wants the full family removed needs a game-code
  revert, which is out of this measurement-only arm's scope.

## CHANNEL HONESTY (fixed now, not a post-hoc excuse)

The band policy's ONLY choice-picking path is holdConversation
(competent.daily -> deepTalk -> holdConversation ->
chooseConversationChoice -> pickTalkChoice), and deepTalk is
gated by COMPETENT_TALK=1, which is UNSET in this substrate.
talkRound (the path that DOES run daily) opens a conversation
and leaves immediately with zero exchanges — it picks NO
choice. leanlinkrescue.daily and tableseat-nowait.daily pick
no conversation choice at all (grep-verified: zero talk/convo
code in either file). The a priori expectation is therefore
that the D-off filter may fire ZERO times on this band: D's
menu-visibility changes can only act when a choice is picked,
and this band's policy picks none. That expectation is TESTED,
not assumed, by the talk census in every row (see METRICS):
if both arms show talked > 0 but deepConvos = deepTurns =
askOthersFiltered = 0, the channel is empirically dormant and
an exact-equality result IS the D-RULED-OUT outcome on this
band — not a failed run, not an idle-policy artifact. The
filter's liveness is proven independently by the unit test
above, so a zero-fire result cannot be dismissed as a no-op
variant (the 1121Z renamed-export trap guard: the sweep
aliases the REAL export name and THROWS on a missing base
instead of running idle; staffed counters must be non-zero
on every row or the row is rejected — see IDLE GUARDS).

## PREMISE VERIFICATION (before sweeping — report, not stop)

Probe: fallback-off seed 73671 must show cookStaffed +
fishStaffed > 0 (fallback-off chain actually runs staffing)
and cookStaffFallback = fishStaffFallback = 0 (fallback code
absent on both sides). If the probe shows zero staffing,
STOP: the premise fails and no sweep is run (idle-policy
signature). The talk census is REPORTED on the probe, not
gated: a zero talk-pick count is the channel-honesty finding
above, and the sweep still runs to prove it band-wide.

## IDLE GUARDS (1121Z lesson, enforced in the sweep)

- Sweep throws on a missing base export (aliased real export
  name, never a renamed destructure).
- Every row must have cookStaffed + fishStaffed > 0, else the
  row is rejected and the sweep fails loudly (idle signature).
- Every row must have cookStaffFallback = fishStaffFallback
  = 0 in BOTH arms (fallback-off code on both sides).
- askOthersFiltered is reported per row (0 expected on this
  substrate; a non-zero value is a surprise to investigate,
  not a failure — it would mean held conversations ran).

## INSTRUMENTS (recorders reused VERBATIM, never edited)

Same five recorders as surgeconfirm (sha256 identical to the
surgeconfirm prereg; re-checked by the proof validator).
Analyzer reused VERBATIM: scripts/test-w4funnel-diag.js (via
its exported analyzeW4funnel, applied per row).
New this run (sweep-side only, pure reads, no recorder):
scripts/test-socialD-diag-sweep.js — the surgeconfirm sweep
adapted: two arms (fallbackoff / socialDoff) writing
evidence/2026-10-27/perseed-socialD-a/s<seed>-<arm>.json,
plus the same daily pure reads (standing + readiness) and
final ctx counters (cook/fish staffed + fallback counters)
PLUS the talk census (talked / deepConvos / deepTurns /
askOthersFiltered) read at row-build time from the shared
run ctx. No new read draws RNG or writes state.
New proof validator: scripts/test-socialD-a.js (pure corpus
analysis + unit checks, no harness, no RNG): re-derives the
fallback-off band, the fallback-off-vs-surgeconfirm
comparison, the corpus-error counts, the per-seed metrics,
the talk census, and the binding verdict from the corpus
files, and unit-tests the D-off filter boundaries (fail on
old pickTalkChoice, pass on new) and the cost bar. Written
before the sweep; run after. Exit non-zero on any mismatch
with the evidence numbers it is given.
New sense script: scripts/test-socialD-sense.js (parameterized
by SEED/ARM/DAYS; NON-MEASURED replay only).

## DEFINITIONS (verbatim from surgeconfirm unless noted)

- ARRIVAL, OUTCOME, FOUGHT, LIVING, CUMULATIVE, DIVERGENCE:
  exactly as in the repin/surgeconfirm preregs (arrival =
  wave-4 world-monster birth joined on seq; fled-recovery
  re-entry a NEW arrival; outcome precedence still-present >
  pending > last-removal-kind mapping; fought = resolve row
  or tbEnd for the seq).
- Per-seed metrics (all, every seed, both arms):
  (i) wave-4 arrivals (analyzer count from the arm's rows);
  (ii) first day standing >= 100 = first daily wrapper point
  at which Game.villageStanding().total >= 100 (RAW total,
  ungated; null if never reached, never imputed);
  (iii) first day readiness-met for wave 4 = first daily
  wrapper point at which Game.waveCombatReadiness(4).ready
  is true (null if never met); derived wave-4-open day =
  first day BOTH (ii) and (iii) hold;
  (iv) major-feast counts = final Game.villageStanding().feasts;
  (v) cook/fish staffed counts = final ctx cookStaffed /
  fishStaffed, plus fallback counts (must be 0/0 both arms);
  (vi) TALK CENSUS (new): final ctx talked / deepConvos /
  deepTurns / askOthersFiltered.
- Median first-standing-100 day: median over seeds that REACH
  standing >= 100 within their run in that arm; reaching
  count reported alongside; never-reached seeds listed, never
  imputed.

## FALLBACK-OFF REPRODUCTION GATE (report-only, never a stop)

The re-run fallback-off arm must reproduce the surgeconfirm
fallback-off table: arrivals 17 (tile-entry 15 + scripted-
titan 2); wins 3/8; national-ever 5/8; national-final 4/8;
entered 3/8; wave-4 3/8; wave-5 0/8; median 137d; deaths 295;
starvation 1; median first-standing-100 day 68 (reached 6/8).
If it differs, report base movement field by field; the D
verdict is then judged WITHIN-RUN (fallback-off vs D-off,
same wrapper) and the surgeconfirm table is flagged
superseded — never re-judged, never silently adjusted. A
difference is NOT a gate failure and does NOT stop the run.

## BINDING VERDICT RULE (verbatim — judge only against this)

Let F = fallback-off band, D = D-off band (fallback-off +
ask:others filter), both on identical seeds.

COST BAR (deciding, from sim-scalemetric — applies FIRST):
D starvation deaths <= F starvation deaths + 2 AND D median
survival >= 0.8 x F median survival. With the surgeconfirm
reference (F starvation 1, F median 137d) the bar is:
starvation <= 3 AND median >= 109.6d. If the cost bar FAILS,
the verdict is NO-GO (attribution rejected — an arrival drop
bought by villages starving or dying sooner is a survival
confound, not a D effect), regardless of arrival numbers.

If the cost bar PASSES:
- D-EXPLAINS (residual fully explained; GO for D as the
  residual explainer) iff D total arrivals <= 12 (the
  fallback-off residual 17 back to the October 25 level 11,
  +/-1: the excess over 11 removed) AND D median
  first-standing-100 day >= F median + 5 days (68 + 5 = 73,
  the same +5 timing leg shape as surgeconfirm).
- D-CONTRIBUTES (partial; NOT a full explanation) iff D
  total arrivals <= 14 (a drop of >= 3 from 17 — material
  against single-seed noise; surgeconfirm showed per-seed
  swings of +1/-3 and whole-story flips) AND NOT D-EXPLAINS.
- D-RULED-OUT (NO-GO for D as a residual explainer) iff D
  total arrivals >= 15 (a drop of <= 2 — within chaotic-
  trajectory noise), including exact equality (17 = 17).
  With a zero talk census in both arms, exact equality
  additionally proves the channel dormant on this band.
- The three count bands (<= 12, 13-14, >= 15) are exhaustive;
  no other verdict exists when the cost bar passes. Timing
  is reported as a secondary metric in all cases; a count
  drop without a timing move does NOT re-score a verdict —
  it is stated as the channel note (as surgeconfirm did for
  fallbacks), and only the rule above decides.

## SENSE PLAN (selection rule fixed before sweeping)

- Sense seed = the seed with the richest wave-4 thread in the
  FALLBACK-OFF corpus: most wave-4 arrivals, ties broken by
  most wave-4 kills, then lowest seed number. Its census
  timeline is the authoritative thread. A NON-MEASURED
  narration replay (seed + arm + end day, say/sysSay taps)
  is run for wording/meaning only, for BOTH arms on the sense
  seed; if a replay's trajectory shifts past the census
  thread, the divergence is disclosed, not hidden, and the
  replay proves wording only. Replay text never enters any
  count.
- D-specific sense read: do any conversation lines in the
  replays mention other villagers, gossip about others, or
  ask-about-others turns? Does village talk read as people
  talking about each other, or as generic lines? Flag
  anything robotic, static, or repeated in the evidence; a
  counts-only report is incomplete.
- Plus the mandatory plain-words reading: what D-off villages
  look like versus fallback-off (one thread, clearly labeled
  as color if from a non-measured replay).

## METRIC REVIEW (mandatory section in the evidence file)

Pre-registered metrics bind the run — a miss is NO-GO, never
re-scored against a friendlier metric mid-run. Metric doubts
go here for the NEXT run. No metric is re-scored in this run.
In particular: plain control is never substituted as the
judge (see PRIMARY COMPARISON); the timing leg is never
dropped to promote a count-only drop to EXPLAINS; the cost
bar is never waived because a drop looks large.

## BALANCED-PANEL / TELEMETRY NOTE (standing exception, carried)

scripts/balance-panel.js cannot ingest per-seed recorder
corpora (carried from surgeconfirm/repin) — the sweep-compare
table + analyzer output are attached instead, and
telemetry-check is NOT run on recorder rows. No panel file
is faked and no telemetry baseline is rolled on recorder
rows.

## WALL NUMBERS TO REPORT (every run)

national-ever / national-final, table invited / entered,
wins, wave 4-5 unlocks, median survival, deaths, starvation
deaths, wave-4 kills total + per seed, death-cause shares,
plus the six per-seed metrics above for both arms.

## KILLED-ARM RULE (variant files)

If the probe fails (idle fallback-off chain) or the sweep
fails loudly, the arm is KILLED: variant files are deleted
uncommitted and no policy file is committed — no trace
remains, per the task's killed-arm rule. If the sweep
COMPLETES, the variant files commit as instruments (the
surgeconfirm precedent: the measurement is only reproducible
with the variant that produced it) — a completed measurement
is not a killed arm, and nothing here is a landing candidate
(measurement only, default-OFF variant files under
scripts/policies/, excluded from the PWA deploy).
