# sim-seedattach-a — DIAG: why hunt-stage plans go target-null

**Arm:** sim-seedattach-a (Loop A, run `fleshout-20261116T0446Z`, axis scale-onramp).
**Claims:** tracker blank 3. **Prereg:** `evidence/2026-11-15/sim-seedattach-a-prereg.md`
(frozen, Correction 1 applied before any judged sim).
**Prior art:** `evidence/2026-11-15/sim-dawnbid-a.md` (the 9-bounce control leg —
all 9 seed calls bounced off hunt-stage target-null plans).
**Type:** DIAG — instrument + measured decomposition. No game change, no default flipped.
**Seeds:** 100871–100878 (8-seed pilot, 150d death-aware, policy competent verbatim,
sha `74a890f0844e`; baseline leg tableseat-nowait, sha `a11a1abc672e`).
**Branch:** `sim-seedattach-a`. **Worktree:** `~/workspace/worktrees/sim-seedattach-a`.

## GO verdict: DIAG-GO — instrument valid, all four prereg bars pass

1. **Classification:** 10/10 target-null hunt-stage plan instances classified, unknown **0** (share 1.0 ≥ 0.90).
2. **Corpus:** 8/8 files parse (main leg) + 8/8 (baseline leg).
3. **Neutrality:** D1/D2 green (proof test), D3 drift smoke clean on all 8 seeds (IDENTICAL trajectories across both full 150d corpora).
4. **Proof:** `scripts/test-seedattach-a.js` **62/62**.

**The verdict the DIAG was built to give (frozen rule): seed-attach CANNOT help the
dominant shape.** 9/10 instances are haven-born-never-seeded, and 8 of those 9 are
`heard-at-fire` — the plan was born from fire talk (the village had slain beasts;
the holder had fought none), so no beast was ever met to attach. The one
`fought-personally` case fought only low-wave beasts (voice_mimic_radio,
speedbump_turtle) — no wave-3+ beast to attach at creation either. The one
companion-inherited case traces back to an inviter whose own plan is haven-born
heard-at-fire. **The next arm must aim elsewhere** — the candidates are named
below, not decided here.

## Instrument built

`scripts/seedattach-driver-20261115.js` extends the dawnbid driver: same vetfirst
T-class instrument, same `v4seeds` / `v4departs` / `v4gates` / `v4encounters`
recorder, same dawnbid capture, PLUS the seedattach capture — `seedattachBounces`
(every `winPlanSeedFromFight` call with BEFORE/AFTER plan state; the dawnbid
recorder kept after-state only, which cannot prove a bounce), `seedattachCreations`
(every plan creation via `winPlanOf` / `winPlanHavenTick`, with creator site +
engagement reads: `know.fought` list, `villageSlain` total), `seedattachLaunches`
(every `winPlanDepart` / `vbrainExecuteDepart` launch: inviter + companion targets
before/after), and `seedattachCensus` (daily, EVERY live winPlan entry — the
dawnbid census filtered to wave-4 plans only, which MISSES target-null plans
because `needWave` is unset until a seed sets it). `scripts/analyze-seedattach-a.js`
is the epoch classifier; `scripts/test-seedattach-a.js` is the proof. No game-code
hook and NO src change: `git diff master...HEAD -- src/` is empty. Errors are
REPORTED into `instrumentErrors` (named, not swallowed — the dawnbid empty-catch
deviation is not repeated).

**Commits on this branch:** `992ab8f2b` (prereg), `59ea81e79` (instrument, anchor),
`7aeeace90` (analyzer corpus-bar fix; proof 62/62). Ready to merge, pending ship.

## Both legs on identical seeds

| | Main leg (competent) | Baseline leg (tableseat-nowait) |
|---|---|---|
| Seeds / files | 8 / 8 | 8 / 8 |
| Instrument errors | 0 | 0 |
| Seed calls wave-4 / wave-3 | 14 / 58 | 14 / 58 |
| Plan instances opened | **10** | **10** |
| National / table / wins | 2 / 0 / 0 | 2 / 0 / 0 |
| Wave-4 reached / wave-5 reached | 8 / 2 | 8 / 2 |
| Median survival (gameDays) | 151d | 151d |

Per-seed (main leg): 100871 survived 151d standing 350, 0 instances;
100872 lost d137 standing 125, 0; 100873 survived 151d standing 199, 0;
100874 survived 151d standing 199, 5; 100875 survived 151d standing 199, 0;
100876 survived 151d standing 199, 5; 100877 lost d146 standing 225, 0;
100878 survived 150d standing 199, 0. (Median by run-days is 150d; the
analyzer's 151d is scholar.day, the same basis dawnbid used for its 138.5d.)

### The baseline leg collapsed into the main leg — reported, not hidden

The two legs' trajectories are IDENTICAL on all 8 seeds (deaths, daily
fingerprints, samples, and every seedattach row byte-identical). Root cause,
verified in the policy source and by a live divergence check: `tableseat-nowait`
is env-gated — with `TABLESEATNOWAIT` unset its daily delegates to
`leanlinkrescue.daily`, and with `LEANLINKRESCUE` unset that delegates to
`competent.daily` (both policies say so in their own headers: "default off =
competent"). The baseline as specified (policy file, default env) IS competent.
A 60d diagnostic with both flags ON diverges (fingerprint `8d37ad0bb8cf15b5`
vs `dafbb362710f2529`, same standing 100) — so the collapse is the gating, not
a driver bug. The baseline therefore adds no independent wall numbers, but it
is a second full 150d determinism data point: two independently executed legs,
identical trajectories. A future arm that wants a REAL tableseat-nowait baseline
must set `TABLESEATNOWAIT=1 LEANLINKRESCUE=1`; that configuration is NOT what
this run's frozen legs specified, so it was not run as a judged leg.

## The classified decomposition (main leg, 10 instances)

| Bucket | n | Share | Sub-reasons |
|---|---|---|---|
| haven-born-never-seeded | 9 | 0.90 | **heard-at-fire 8**, fought-personally 1 |
| companion-inherited | 1 | 0.10 | brain mirror, inviter gen_gbpdfz2 |
| seeded-then-lost | 0 | 0 | — (no clearing write exists, as the code read said) |
| unknown | 0 | 0 | — |

Secondary counts (all 72 seed calls): opened at gear/party 5, no-plan creates 1,
hunt-null bounces 61 (wave-4 and wave-3 together; the 10 instances group 14
wave-4 bounces — the rest are repeats), already-targeted bounces 5, other 0.
The 10 instances live on only 2 seeds (100874: 5, 100876: 5). The other 6 seeds
opened none: three had zero seed calls of any wave (100871, 100873, 100878) and
two had only wave-3 calls (100875: 3, 100877: 5).

Every instance had `node: null` at its first bounce — no location is known for
a target that was never named. Plan ages at first bounce run 13–111 days
(creation day to first wave-4 bounce); the plans are old and settled, not fresh.

### What the sub-reasons actually contain

- **heard-at-fire (8):** the plan was created by `winPlanHavenTick` with
  `fought: []` and `villageSlainTotal` 7–45. The villager never fought a beast;
  the village had kills to talk about around the fire, and that was enough for
  the plan to be born — gear first, then party, then hunt — with no beast named.
  Two holders (carlos_diaz, gen_91e19p9 on 100874) carry TWO epochs each off the
  same day-50 / day-11 plan: the plan leaves hunt (back to party), re-enters
  hunt, and bounces again. Mateo_alvarez's plan sat 89 days before its first
  wave-4 bounce (created day 12, first bounce day 101).
- **fought-personally (1):** gen_u9jax0c (100876), created day 31 with fought
  `[voice_mimic_radio, speedbump_turtle]` — two low-wave beasts. He went on to
  evade/flee SEVEN beasts over 40 days (days 33–71, incl. the wave-4 algorithm
  on day 54), every seed bouncing off the same hunt-null plan. Even the one
  personally-fought provenance names no wave-3+ beast to attach at creation.
- **companion-inherited (1):** diana_osei (100876), created day 25 by the brain
  mirror (`winPlanOf` at villager-brain.js:1048) as gen_gbpdfz2's companion, with
  the inviter's null target. She was then launched as a companion FOUR more
  times by four different inviters (days 30, 44, 44, 46), always target-null,
  her party rotating gen_gbpdfz2 → hannah_kim → gen_q3mgjcg → gen_l9li34v →
  gen_u9jax0c. Her plan even flips hunt → standing → hunt (days 33–35, 44–45)
  with the target still null. The inviter gen_gbpdfz2's own plan was created
  the same day 25 by HavenTick with `fought: []`, villageSlainTotal 17 — heard-
  at-fire himself. There is no beast anywhere in this chain to attach.
  (Instrument note: companion plans carry `sinceDay: 0` — the `winPlanOf`
  default — so the analyzer's "plan age 46" for Diana is day-minus-0, not a
  real age; her real age at first bounce is 21 days since creation.)

## The answer, in the frozen rule's own terms

- Dominant `haven-born-never-seeded` + `heard-at-fire` → **seed-attach cannot
  help.** Attaching a seed at plan creation would need a beast to attach, and
  the plan was born from rumor, not from a meeting. Relaxing the
  `winPlanSeedFromFight` early return would change nothing for these 8: there
  is no target to retarget TO — the bounce is not the seed refusing a known
  beast, it is the plan never having had one.
- The single `fought-personally` case does not save the lever either: the
  attach point (`winPlanHavenTick` engagement creation) would attach the most
  recent fought beast, and his were wave-1/2. Attaching a wave-1 target to a
  wave-4 hunting plan is not the chain dawnbid needed.
- The `companion-inherited` case applies only through its inviter, and the
  inviter is heard-at-fire too.

**Candidates for the next arm (named, not decided):** (1) the plan should not
reach `hunt` on rumor alone — HavenTick engagement via `villageSlain` creates
targetless plans that launch and hunt nothing in particular; (2) the seed's
coverage is expedition-only (see below) — most wave-4 meetings never reach a
seed site at all; (3) the seed DOES attach at party stage (see the Carlos
natural experiment) — the mechanism works when the plan is at the right stage,
so the failure is plans reaching hunt before ever being seeded.

## The Carlos natural experiment (seed 100874 — before/after inside one seed)

Carlos Diaz's day-50 plan is the clearest single case in the corpus. Created
day 50 at Haven by HavenTick (heard-at-fire, villageSlainTotal 45), already
armed/armored so it opens at party stage, target null, node null. He launches
with it on days 51, 57, 62, 65, 70, 76, 78, 85, 88, 92, 97, 101, 104, 109,
115, 122, 124 — seventeen brain-mirror launches, every one with inviter target
null and companion target null. He evades the gavel (wave 3, day 57), the Audit
(wave 4, day 63), terms_of_service (day 67), the influencer (day 93), the
Suburb (day 103) — every seed bounces: stage hunt, target null, before and
after. Then the old plan is deleted, a fresh plan opens (sinceDay 127), and the
seed DOES attach: day 127 he evades terms_of_service at party stage and the
seed sets target terms_of_service + node (2,2); day 128 he evades the strike
(wave 4) at party stage and the seed RETARGETS to strike; day 135 he launches
with target strike; days 145/148/149 he bounces at hunt stage WITH target
strike (already-targeted — the seed cannot retarget a hunt plan, but this one
already has its beast). Same villager, same band, same mechanism: the seed
works at party stage and is inert at hunt stage. The null-target hunt plan is
the only shape that bounces — and it is the shape 8 of 10 instances take.

## The seed's coverage gap (secondary finding)

107 wave-4 encounters across the main leg, 78 ending flee/evade — but only 14
wave-4 seed calls. Joining encounters to seed calls on (day, vid, monster):
**64 of 78 wave-4 flee/evade encounters (82%) produced NO seed call.** The seed
sites on current master live only in the expedition handler
(`villager-agency.js:643` evaded, `:726` fled) and the fight-gate 'avoided' path
(`win-plan.js:512`); the world-tick path (`resolveWildMonsterEncounter` in
game.js) has no seed call — dawnbid reverted it and this arm re-landed nothing.
Seed 100871 is the extreme: 31 wave-4 encounters, 23 flee/evade, 0 seed calls.
Even a perfect attach-at-creation lever would only ever see the expedition
minority of meetings.

## Reachability verdict for the wave-4 chain

**The chain is reachable but starved at both ends.** At the near end, plans are
born targetless from rumor and launch anyway; at the far end, most wave-4
meetings never reach a seed site. Net in this panel: 72 seed calls, 6 opens
(5 at gear/party + 1 no-plan create), 10 hunt-null epochs, 0 wave-4 kills
through a seeded plan (the 2 national villages reached national some other way
— standing 350 and 225 with no wave-4 plan instance on either seed). The
dawnbid decomposition still stands downstream (profile gate, companion pool);
this DIAG adds the upstream cause: the plans that reach the dawn scorer usually
never had a beast to hunt in the first place.

## Village assessment, in plain words

Villagers hear about the monsters around the fire — the village has killed
enough for everyone to know something big is out there — and they start making
plans. But a plan born from talk has no name in it: no beast, no place. They
still go out together, again and again — Carlos went out seventeen times with
a plan that named nothing — and when they meet the thing itself and run, the
meeting leaves no mark on the plan, because the plan was never about that
beast. The one time a plan did get a name, it worked at once: Carlos met a
beast while his new plan was still being put together, the plan took its name,
and he went back after it. The wanting is real and the going is real. What is
missing is the name — and the name only ever gets written down while the plan
is young.

## Sense-testing (read the lines, not just the counts)

**The target-null case end to end — Carlos Diaz, seed 100874.** What he
planned: a gameplan born day 50 at Haven from fire talk (villageSlainTotal 45;
he had fought nothing), opening at party stage because he was already armed
and armored, target null, node null. What the target was: nothing — the plan
never named a beast. What happened at dawn: the dawn scorer kept offering the
trip anyway — midday day 61 and day 62 the commit is `party_wait` (stage
party, no companion yet); day 64 part 3 the commit is `party_launch` with
companion mateo_alvarez while the plan sits at stage hunt, target null. He
launches, meets the Audit on day 63 while out with gen_91e19p9, and the fight
line is one flat sentence:
> "Carlos saw The Audit in time and gave it room."
The encounter ends `evade`; the seed call bounces (stage hunt, target null,
before and after); the plan is unchanged. He does the same with the influencer
on day 93 and the Suburb on day 103. The plan outlives the meetings.

**The companion case — Diana Osei, seed 100876.** Created day 25 as a
companion, launched five times by five inviters, her plan flipping hunt →
standing → hunt with the target null throughout; her first wave-4 bounce is
day 46, fleeing the influencer. She is passed from party to party like a spare
pair of hands, and no party ever hunts anything in particular.

**Wave-4 fights overall (main leg):** 107 encounters; the flee/evade share is
78/107. Fleeing is the normal outcome, and on this band it usually leaves no
trace on any plan.

## Blanks filled or documented

- **Why hunt-stage plans go target-null (this arm's question): ANSWERED —
  9/10 haven-born from fire talk, 1/10 companion-inherited from a heard-at-
  fire inviter.** Seed-attach cannot help the dominant shape.
- **Why the seed bounces on target-null plans (dawnbid control leg):** the
  seed only retargets gear/party plans; a hunt plan keeps whatever target it
  has — null included. Confirmed on 61 hunt-null bounces this run.
- **The world-tick seed gap:** 64/78 wave-4 flee/evade encounters never reach
  a seed site. Documented above; the fix (if any) is a design call about
  whether wild meetings should seed — NOT this arm's, and not a silent
  re-landing: dawnbid reverted that call deliberately and this arm kept it
  reverted.
- **Baseline collapse:** tableseat-nowait (default env) IS competent on this
  band. Documented above with the divergence proof. A future arm wanting a
  real tableseat-nowait baseline must set `TABLESEATNOWAIT=1
  LEANLINKRESCUE=1`.
- **Analyzer bug found and fixed this run:** the corpus bar read
  `baseSummary.files.length` where `summarize()` returns files as a COUNT —
  the bar failed with 8/8 files present (the same class as the dawnbid
  summarize-shape bug). Fixed by extracting `corpusBarPass()` (count
  comparison) with regression checks; proof is 62/62 after the fix.
- **Instrument note:** companion plans carry `sinceDay: 0` (the `winPlanOf`
  default), so "plan age" for companion-inherited instances is day-minus-0,
  not a real age. Reported with the real age (21 days for Diana) in the
  decomposition.
- **Table count is carried over, not measured:** the wall table's `table: 0`
  uses dawnbid's definition (no table-state signal in the per-seed files),
  not a live table check. Same limitation as dawnbid; a table-aware recorder
  is a future instrument, not this arm's.

## Metric review

- The frozen definitions held — no mid-run re-scoring. The decomposition
  landed where the prereg's verdict rule anticipated a decision: dominant
  heard-at-fire, so the rule says "seed-attach cannot help" and that IS the
  answer, not a failed run.
- Instances opened on only 2/8 seeds (100874, 100876); the other 6 opened
  none because they had few or no seed calls (3 seeds had zero seed calls of
  any wave despite 31/0/16 wave-4 encounters — the world-tick gap, above).
  The decomposition is judged on the 10 instances that opened, per the prereg.
- The `seeded-then-lost` bucket stayed 0, as the code read predicted (no
  clearing write exists). The `unknown` bucket stayed 0 with the
  census-only fallback never needed (all 10 instances had launch or creation
  evidence; the fallback fired on 0 instances — the synthetic fixture proves
  the path, the corpus never took it).
- The baseline leg's collapse (identical trajectories) is a property of the
  policy's env-gating, not a measurement failure; it is reported as a finding
  with its divergence proof rather than re-run under different flags, because
  the frozen legs specified the policy as-is.
- The primary metric (classified share) passed at 1.0. The interesting result
  is the decomposition itself, which answers the DIAG's question in the
  negative: the seed is not the fix for these plans.

## Neutrality evidence

- **D1** (proof test): main-leg tip, seed 100871, 60d, recorder ON twice —
  identical full corpus.
- **D2** (proof test): same, recorder ON vs OFF (`SEEDATTACH_RECORDER=off`) —
  identical trajectories.
- **D3** (drift smoke, `scripts/vetparty-drift-check.js` over the main vs
  baseline corpora): IDENTICAL on all 8 seeds, NO PRE-LEVER DRIFT. First
  seed days 44/13/17/25/28/118 (seeds 100871/100873 have no seed calls).
- **Proof:** 62/62 on the instrument tip (58/58 before the analyzer
  corpus-bar fix; 62/62 after, with the 4 new regression checks).

## Files

- Prereg: `evidence/2026-11-15/sim-seedattach-a-prereg.md`
- Instrument: `scripts/seedattach-driver-20261115.js`, `scripts/analyze-seedattach-a.js`,
  `scripts/test-seedattach-a.js`
- Corpora: `evidence/2026-11-15/perseed-seedattach-a-competent/` (8 files),
  `evidence/2026-11-15/perseed-seedattach-a-tableseat-nowait/` (8 files)
- Analysis: `evidence/2026-11-15/seedattach-a-analysis.json`
- This evidence file: `evidence/2026-11-15/sim-seedattach-a.md`

## Next diagnostic (named, not done)

1. **Rumor-born plans as a design call:** should a HavenTick engagement via
   `villageSlain` alone be allowed to carry a plan all the way to `hunt`?
   (Or should a plan need a named beast — a fought one — before it launches?)
   This is the 8/10 shape; it is a design question, not a measurement.
2. **World-tick seeding as a design call:** should a wild meeting (flee/evade
   on the world tick) seed a plan the way an expedition meeting does? 64/78
   wave-4 flees currently leave no trace. Dawnbid reverted that call
   deliberately; re-landing it is a Steve/coordinator call, not a silent fix.
3. **The party-stage attach point is proven working** (Carlos days 127–128):
   any follow-up lever that names a beast should attach while the plan is at
   gear/party, before the first launch — after the launch the seed is inert.
