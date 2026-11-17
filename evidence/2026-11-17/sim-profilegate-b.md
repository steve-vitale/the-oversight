# sim-profilegate-b — EVIDENCE (adoption fill; verdict NO-GO)

**Arm:** sim-profilegate-b · **Loop A run:** fleshout-20261117T1820Z · **Axis:** scale-onramp
**Type:** LEVER, game code, default-OFF env flag (`PROFILEGATE=1`).
**Branch:** `sim-profilegate-b` · **Worktree:** `~/workspace/worktrees/sim-profilegate-b`
**Base at arm start:** master `eb2d3714f` · **Rebased onto:** master `db8a289bf`
(sim-fightallycap-b pilot GO landed; journey-scale r236 + journey-succession
r231 + coordinator closeout 1aba45367 in between; rebase clean, no conflicts,
none of the 9 in-between commits touch `villager-brain.js` / `win-plan.js`).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.
**Prereg:** `evidence/2026-11-17/sim-profilegate-b-prereg.md` (frozen).
**Verdict: NO-GO** — B1 PASS, B2 PASS, B3 FAIL (median survival only),
B5 PASS (analyzer checks), B4 tracked. The lever is REVERTED in this tree
(see Disposition); instrument + evidence + corpora stay.

## Adoption note

The first worker died mid-corpus: only the OFF leg's first 4 seeds existed
(103411–103414), no ON/REC/REC0 legs, no analysis, no panel, no evidence.
This run adopted the arm, verified the committed work, completed all four
legs on the frozen driver, and judged against the frozen B1–B5 bars.
Two instrument bugs the dead worker never tripped (the analyzer had never
run end-to-end) were fixed during adoption — see Instrument fixes below.
Nothing in the frozen prereg (bars, legs, instrument definitions) was
re-scored or redefined.

## The lever (exact sites, unchanged from prereg)

The profile check `if (prof !== 'wanderer' && prof !== 'explorer') continue;`
in the two `findCompanion` twins — `src/js/villager-brain.js:129` (dawn bid)
and `src/js/win-plan.js:208` (legacy depart) — is skipped when
`PROFILEGATE=1`. Every other check unchanged: alive, away flag, trust ≥ 15,
at Haven, engaged, on-expedition. Default OFF; off in the browser too
(`process` undefined). Commit `6bb3375a1` (post-rebase; was `dfc4d3be6`),
`[needs-eyes]`. Reverted by disposition — see below.

## Before / after (identical seeds, balanced panel §15)

| Metric | OFF (control) | ON (PROFILEGATE=1) | Bar | Result |
| --- | --- | --- | --- | --- |
| Scored dawns / empty | 87 / 81 (0.931) | 99 / 3 (0.0303) | empty ≤ 0.46 | **PASS** |
| Mean eligible / dawn | 0.08 | 2.98 | ≥ 1.5 | **PASS** |
| Launched instances (any-commit) | 3 | 7 | ≥ 5 and > OFF | **PASS** |
| Wave-4+ launch events (secondary) | 8 | 38 | reported | — |
| Starvation deaths, total | 5 | 3 | ON ≤ OFF+2 | pass |
| Starvation deaths, arm-only | 5 | 3 | ON ≤ OFF+2 | pass |
| Median survival (gameDays) | 147.5 | 116.5 | ON ≥ 0.8×OFF = 118.0 | **FAIL by 1.5d** |
| Total deaths (all causes) | 517 | 786 | reported | +269 (+52%) |
| Launched-party damage share (B4) | — | 0.0577 (138/2391, 2 meetings) | tracked vs 0.085 | — |

**B1 pool fills — PASS.** The pool fills far beyond the bar: 3 empty dawns
in 99 vs 81 in 87, mean eligible 2.98 (poolshape's counterfactual predicted
2.36). Picked companions ON: forager 50, homebody 43, wanderer 3 (96 picks,
replica/real agree 96/96, 0 disagreements). OFF picks: wanderer 4, explorer 2.
Would-be-notRanger members: 511 ON, 400 OFF. The gate widened and the pool
filled — that half of the question is answered yes, decisively.

**B2 launches rise — PASS.** Launched instances 7 vs 3 (bar ≥ 5 and > OFF).
Funnel buckets ON: launched-killed 0, launched-fought-no-kill 2,
launched-no-meeting 5, selected-blocked 12, plan-churned-before-dawn 3,
candidate-not-bid 3, unknown 0. OFF: launched-fought-no-kill 1,
launched-no-meeting 2, plan-churned-before-dawn 1, candidate-not-bid 8.
The filled pool converts into launched parties — but note the new binding
stage: 12 instances now die at `selected-blocked` (OFF: 0). Filling the pool
moved the jam downstream; the next question is what blocks a selected party,
not the pool.

**B3 cost — FAIL on the median-survival clause only.** Starvation is fine
both ways (totals 3 vs 5, arm-only 3 vs 5 — the widened gate starves nobody
extra). But median survival falls to 116.5 days against a bar of 118.0
(0.8 × 147.5) — a miss by 1.5 days on an 8-seed median. The miss is real,
not an instrument artifact: medians recomputed from the raw per-seed
`gameDays` (ON: 62, 57, 151, 151, 115, 118, 151, 103 → 116.5; OFF: 106, 62,
151, 150, 145, 151, 151, 143 → 147.5). And the total-death count tells the
same story from the other side: 786 deaths ON vs 517 OFF. More parties walk
the road, and more villagers die on it — the launches cost lives faster
than they buy kills (0 launched kills on either leg). The balanced panel
agrees: village deaths per run 64.6 → 98.25 (paired delta +33.6,
`regression_signal`); deaths per 100 days 51.1 → 89.2 (also
`regression_signal`); community loss 0.5 → 0.625 (watch); first-bearer
survival through day 60: 1 → 0.875 (watch). Panel decision:
`review_required`.

**B4 damage wall — TRACKED, not judged.** Pooled share 0.0577 (138/2391
across 2 fought meetings) vs launchfunnel's 0.085 (single meeting, 77/909).
Per meeting: day 41, Nikos Papadopoulos vs The Suburb, 138 of 1391 HP
(9.9%, log-derived: "R1: Nikos strikes for 14 (x1.3) (1415 left)");
day 111, Devon Okafor vs Eulogy, 0 dealt (range-mid fallback, max HP 1000).
Filling the pool bought launches, not kills — as the prereg said it would.

**B5 instrument — PASS on the frozen base; proof 49/50 on the rebased tip
(see Rebase note).** Proof test `scripts/test-profilegate-b.js`: 50 passed,
0 failed on the frozen base `eb2d3714f` (pre-rebase run). D1 repeatability +
D2 wrap neutrality green at 60d, seed 103411, both PROFILEGATE states. D2
full-band: `rec` ≡ `on` 0 divergences, `rec0` ≡ `off` 0 divergences (all 8
seeds). Wave-4 IDs match the frozen list. Instrument errors: 0 on all four
legs. File counts 8/8/8/8. Classified share 1.0, unknown 0.
D3 drift check: 6/8 seeds CLEAN; seeds 103415 and 103417 flagged DRIFT
(first divergence day 54 / 46, first-lever-day 83 / 89 by the script's
definition). Investigated by hand — both flags are genuine lever action,
not substrate drift (see D3 investigation). The D3 script's first-lever-day
definition is too narrow for this lever; recorded under Metric review, not
re-scored: the verdict is NO-GO on B3 regardless.

**OFF-leg replication — EXACT MATCH.** The OFF leg reproduces poolshape's
`vre` leg row for row: 87 pool rows, 81 empty, per-seed
0/0/25/0/37/25/0/0 (empty per-seed 0/0/22/0/37/22/0/0). Base drift since
poolshape (conversation.js 7eb8ffc22 + the journey-scale/succession commits
+ the fightallycap landing) moved no trajectory on this band. Comparability
with the priced counterfactual stands.

## Wall numbers (scale-onramp axis)

| | OFF | ON |
| --- | --- | --- |
| National standing (≥200) | 1/8 (seed 103416, 430) | 1/8 (seed 103413, 340) |
| National rank | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 1/8 | 1/8 |
| Median survival | 147.5d | 116.5d |
| Villages surviving to 150d | 4/8 | 3/8 |

The wall did not move: no village reaches national rank, the table, or a
win on either leg. The widened gate buys launches at the cost of lives and
buys no scale.

## Village assessment (plain words)

Eight villages, same eight on both legs. On the control leg they mostly
sit: plans are held, nobody walks, the pool at dawn is empty 93% of the
time, and the village dies slowly — of monsters at the door, of thirst,
of starvation in the last days. On the widened leg the same villages
stir: foragers and homebodies get picked, parties leave Haven, and the
villages die faster. Yara Haddad's village (seed 103411) is the clearest
picture: she bids with forager Quinn Murphy on day 46, Quinn walks, and
over the next twelve days Quinn fights three wave-4 monsters, leads a
hunt of her own, and watches a companion die beside her — the village
is lost by day 63, where the control leg held it to day 107. The gate
works as a door. What walks through it is not yet strong enough to come
back. Nobody on either leg kills a wave-4 monster from a launched party;
the two fought meetings end in flight. The knowledge is there (tricks
known, parties armed and armored); the damage is not (5.8% of a monster's
health per fought meeting). The blank this arm filled is the pool: it is
no longer the binding stage. The blank it exposed is twofold — what
blocks 12 selected parties after selection, and why launched parties
deal so little damage that walking out costs more lives than staying
home. Both go to the findings backlog, not into this arm.

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts. The fiction is alive in the small moments and
silent exactly where this lever acts.

**A forager companion walking the road reads as a person choosing to go.**
Seed 103411, day 46: holder Yara Haddad bids at dawn with forager Quinn
Murphy, and the depart row shows Quinn leaving with her — not a roster
slot filling, a named forager walking out of Haven. Quinn then acts like
a person with her own standing in the world: the same day she fights The
Congregation as Nikos Papadopoulos's ally, leads her own party against
Eulogy ("outcome: evade"), fights The Suburb on day 47 (the gate itself
says 'seek', trick known), and on day 56 fights Reunion beside
gen_n7welm4, who dies taking 91 damage while Quinn survives. The fight
log gives her a voice of a kind: "R1: Yara walks in open-handed — and it
goes wrong. It doesn't want peace. They're exposed, off-balance."
And Nikos: "Nikos walks straight into The Suburb. No avoiding it."
These read as people making choices and paying for them — including the
bad choice to parley with something that does not want peace.

**The fiction says nothing when a picked homebody stays home.** Seed
103414, day 78: holder Giulia Bianchi bids at dawn with homebody Jesse
Cortez. Giulia does not depart as holder that day at all — the only
depart is a different villager, visjoin_74, taking Giulia herself as
companion. Jesse stays home, and no line in the corpus marks it: zero
`vetSays` lines on days 77–79 on that seed. Nobody says "Jesse stayed",
nobody says "Jesse couldn't walk that far", nobody says anything. Jesse
later dies on day 137 "in the wild" — as the player character (he is
inherited as the scholar somewhere along the way) — so he does walk
eventually, just never as anyone's picked companion that day. The
range-0 block is mechanically honest (a homebody cannot launch) and
fictionally mute. If homebodies are to be picked at dawn, the game owes
the player a line when the pick cannot walk — otherwise the bid reads as
a promise the morning breaks silently. Logged to the findings backlog.

**What the villagers actually say.** The `vetSays` stream is coherent
and specific where it speaks: "SYSTEM: 'Oh — OH. Everybody saw that,
right? Scott just put down The Terms of Service... on CAMERA. That's a
veteran kill, folks. REMEMBER the name.'" (seed 103411, day 27). Teaching
reads as teaching: "Ella has been asking about the strange leaves all
week — 'but what IS it?' Tonight, an answer. Fireside lesson: Owen
passes around European Elder. Someone asks a dumb question. Nobody
minds. That's how you learn." (seed 103412, day 15). And the daily grind
has a voice: "A person, maybe 40s, with a scarred cheek heads out for
water. 'Water first. Everything else waits.' The pantry won't fill
itself." (seed 103415, day 1). The repeated "met them at the door — N
put down" lines are formulaic but honest: they name the hurt. The gap is
not the voice; it is the silence around the dawn bid itself — no line
ever says who was picked, who walked, or who stayed.

## D3 investigation (seeds 103415, 103417)

The drift script defines first-lever-day as the first `world-tick` v4
seed row on the ON leg — the first wave-4 plan planted. On 103415 that
is day 83, but the legs diverge on day 54; on 103417 it is day 89, but
they diverge on day 46. Both divergences are lever action before any
wave-4 plan exists, because the gate acts at ANY dawn bid for ANY plan
holder, not only wave-4 holders:

- Seed 103415, day 53: holder Catalina Reyes departs with Nino
  Kapanadze on the ON leg; on the OFF leg she departs alone that day.
  Nino is a forager (pool-row member records on the OFF leg show
  `profile: forager`, first-fail `notRanger` on days 107/110/118) —
  admitted only by the widened gate. Trajectories were identical until
  that depart (first fingerprint divergence day 54).
- Seed 103417, days 43–45: holder gen_zeekgsu departs with Giulia
  Bianchi on the ON leg (eight depart rows, days 43–45); on the OFF leg
  the same holder departs alone (days 50/56). The two legs run identical
  code except the gate and identical state until then, so a companion
  picked ON where OFF picked none is a non-ranger admitted by the gate.

No substrate drift: both legs share the same base, the OFF leg replicates
poolshape exactly, and every divergence follows a lever-changed depart.
The D3 script's first-lever-day is too narrow for a gate that acts on
any plan holder's dawn bid — the instrument limitation, not the lever,
is what flagged. (See Metric review.)

## Instrument fixes (adoption)

The analyzer had never run end-to-end before adoption and crashed on
first run (`ReferenceError: onPool is not defined`, line 613). Two bugs,
both in `main()` of `scripts/analyze-profilegate-b.js`, both fixed in the
corpus commit `9309712e9` (post-rebase; was `214c9e786`):

1. `onPool` is defined only inside `computeBars()`; `main()` built the
   `bars.poolFill` output from it. Fixed to `onSummary.poolShape`.
2. File-count check read `on.files.length` where `summarizeLeg` returns
   `files` as a NUMBER (so `on.files.length` is `undefined`, failing B5
   against a real 8/8/8/8), and `rec`/`rec0` counts were read off the
   summary object, which carries no `files` field at all (vacuous pass).
   Fixed to keep the full `summarizeLeg` returns and use their `.files`
   numbers; console line fixed the same way.

`computeBars()` itself is untouched, so the proof test's F4 fixture
judgements are unaffected. After the fix the analyzer reports the true
state: B5 PASS (8 files/leg, 0 errors, D2 0/0, wave-4 IDs match,
classified 1.0). The numbers in this evidence come from the fixed
analyzer run; the B3 miss is in the frozen bar, not the instrument.

## Metric review

- **B3's median clause is the whole verdict, and it is a thin miss.**
  116.5 vs a bar of 118.0 — 1.5 days on an 8-seed median, with the
  starvation clauses passing comfortably. A confirm band (12–16 seeds,
  fresh band, re-prereg) could move this either way; on this band, as
  frozen, it is a miss, and a miss is NO-GO. The direction of the
  supporting evidence (total deaths +52%, panel regression_signal on
  deaths/run) argues the miss is not noise: the cost is real even if the
  median margin is thin. A re-test that only re-rolls seeds to chase the
  median would be metric shopping; the honest next step is a lever that
  addresses the cost (launched-party damage, or the selected-blocked
  stage), not a re-roll.
- **D3's first-lever-day needs widening for gate levers.** The script
  assumes the lever can first act at a wave-4 plan planting. A companion
  gate acts at any holder's dawn bid. Next arm that reuses this drift
  check should define first-lever-day as the first dawn bid (any plan)
  on the ON leg — or accept pre-v4 divergence as lever action by
  construction and check only that no divergence precedes the first
  differing depart.
- **B1's bar was set against the OFF population; the ON population
  diverged as predicted.** ON scored 99 dawns vs OFF's 87 (launches
  change who is at Haven, so more dawns get scored). The bar held
  anyway (0.0303 vs 0.46). No revision needed.
- **The panel's `review_required` is consistent with B3**, not a
  second verdict: the deaths/run regression is the same cost the median
  clause prices.

## Disposition: NO-GO — lever REVERTED

Per the frozen prereg, a NO-GO reverts the `src/` change in this tree
before reporting. The revert commit is `ea3d3eabe` (post-rebase lever
commit `6bb3375a1`, `[needs-eyes]` kept on the revert per the adoption
brief). Net `src/` diff vs master after the revert: zero (verified:
`git diff db8a289bf -- src/` empty). The instrument
(driver, analyzer, drift check, panel builder, proof test), the four
corpora, the analysis, the panel, the prereg, and this evidence stay —
the measurement stands as the record, and the next arm (selected-blocked,
or launched-party damage) starts from it, not from re-measuring the pool.

## Rebase note

Rebased cleanly onto master `db8a289bf` (4 commits replayed, 0 conflicts;
none of the 9 in-between commits touch `villager-brain.js` /
`win-plan.js`). Proof test re-run on the rebased tip (lever intact):
**49 passed, 1 failed** — the `gate-act` check fails (log:
`/tmp/profilegate-proof-rebased.log`, not committed). On the new base,
seed 103413 scores ZERO pool rows on both legs (OFF pool
`{dawns: 0, emptyShare: null}`, ON the same), where the frozen base scored
25 OFF / 25 ON. Diagnosed by hand: on the new base the 103413 village
plants no plans at all (150d, survived, standing 199, maxWave 4, but
`planSeeds: 0`, `v4seeds: 0`, `dawnbidScores: 0`, all `winPlanStats` 0),
while the frozen base had `planSeeds: 4`, `v4seeds: 9`, `dawnbidScores: 60`
on the same seed. The plan system itself is alive on the new base — seed
103411 reproduces its frozen-base trajectory exactly on the new base
(107d, village-lost, 53 deaths, `v4seeds: 9`, `planSeeds: 5`) — so this
is seed-103413 trajectory drift from one of the 9 in-between commits
(most plausibly the fight-engine second-ally change moving the wave-4
encounters that used to seed Devon's plan on day 77), not a broken
instrument or a dead plan system. The gate-act fixture seed is dead on
the new base: it exercises nothing. The fixture seed was NOT swapped —
that would be re-scoring the instrument after the fact. Consequence for
the coordinator: the verdict above was measured on the frozen base, where
the proof was 50/50 and the corpus is valid; the rebased branch carries
a proof test that fails its gate-act check on the new base (and, after
the NO-GO revert below, its lever-presence checks too). Follow-ups are a
coordinator call: retire the proof test with the reverted lever, refresh
the gate-act fixture seed on the new base, or re-run the arm on the new
base. `check.js --quick` after the `src/` change: **INCOMPLETE — killed
by a 20-minute timeout (exit 124), never green.** The run reached ~330
of 340 scripts with several `F` marks visible but no summary, so the
failures cannot be attributed from this run; one of them is expected to
be `test-profilegate-b.js` itself, which fails its lever-presence checks
now that the lever is reverted by disposition. Log:
`/tmp/profilegate-check-quick.log` (not committed). Same shape as
poolshape's note in the prereg: this box cannot finish the quick check
in ~20 minutes.

## Files

- Prereg: `evidence/2026-11-17/sim-profilegate-b-prereg.md`
- Lever (reverted): `src/js/villager-brain.js`, `src/js/win-plan.js`
- Instrument: `scripts/profilegate-driver-20261117.js`,
  `scripts/analyze-profilegate-b.js`,
  `scripts/profilegate-drift-check.js`,
  `scripts/build-profilegate-panels-20261117.js`,
  `scripts/test-profilegate-b.js`
- Corpora: `evidence/2026-11-17/perseed-profilegate-b-off/`,
  `perseed-profilegate-b-on/`, `perseed-profilegate-b-rec/`,
  `perseed-profilegate-b-rec0/` (8 files each)
- Analysis: `evidence/2026-11-17/profilegate-b-analysis.json`
- Panel: `evidence/2026-11-17/profilegate-b-panel.{json,md}`
  (+ before/after `.json.gz`)
- Evidence: `evidence/2026-11-17/sim-profilegate-b.md` (this file)
