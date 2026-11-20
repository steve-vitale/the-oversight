# sim-dmgcheck-b — decisive check on finding #2627 (the launch drought)

**Verdict: BAND VARIANCE — the 1530Z launch collapse was band variance. The launch engine did not move with the base.**

- Prereg: `evidence/2026-11-20/sim-dmgcheck-b-prereg.md` (first frozen 2026-11-20 ~18:47 UTC on `e103a64cc`; base updated to `d352834ef` by coordinator direction before the judged leg completed — see §0)
- Survey JSON: `evidence/2026-11-20/dmgcheck-b-survey.json` (analyzer exit 0)
- Base: master `d352834ef` (sim-lend-a coordinator addendum) — zero `src/js` changes (instrument-only arm)
- Policy: competent verbatim, sha256 `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0` (first 12 `1884c8852d38`, git blob `aaf5e31ac`)
- Horizon: 150d, death-aware, MODE=vre, recorder ON, 1 leg × 8 seeds = 8 villages
- Instrument: `scripts/dmgcheck-driver-b.js` + `scripts/analyze-dmgcheck-b.js` (commit `28811d9da`); proof test `scripts/test-dmgcheck-b.js` **34/34 green** (re-run after the rebase, also 34/34), analyzer selftest **26/26 green**

## 0. Base update mid-run (coordinator-directed, before the judged leg completed)

The prereg was first frozen on master `e103a64cc`. Master moved during
registration (Loop A landed sim-lend-a, NO-GO PARTICIPATION, lever
reverted) and the coordinator directed a rebase onto `d352834ef`
before any judged leg finished. The diff `e103a64cc..d352834ef` was
verified independently here: 4 commits, all sim-lend-a, touching
only `evidence/` + `scripts/` — zero `src/js`, zero
`scripts/policies/` — so the launch/fight substrate is identical
(policy sha still `1884c8852d38`, ALLYSLOT3 still unlanded). The
judged leg had run 3 of 8 seeds on the old base when the rebase was
ordered; the leg was killed (SIGTERM) and those 3 corpora discarded,
and the leg was re-run in full on the new base. The decision bars,
band, substrate, and counting are unchanged by this update — only
the recorded base moved. The rebase itself was clean (both arm
commits replayed, no conflicts).

## 1. Judged numbers (frozen decision bars, vs the dmgsurvey designation on the same band)

Designation reference (dmgsurvey-b, base `c75503d6f`, policy
`150229eda010`): **16 launches, 9 first-fights (6 distinct), 6 fled.**

| Metric | This check (base `d352834ef`, policy `1884c8852d38`) | Designation | Bar |
|---|---|---|---|
| Launches | **16** | 16 | BAND VARIANCE needs ≥ 12 |
| First-fights (counted / distinct) | **9 / 6** | 9 / 6 | BAND VARIANCE needs ≥ 6 |
| Fled first-fights | **6** | 6 | — |
| Killed / died first-fights | 0 / 3 | 0 / 3 | — |
| No-fight launches | 7 | 7 | — |
| Quad launches | 9 | 9 | — |
| Trio launches | 12 | 12 | — |
| Instances opened | 18 | 18 | — |
| Binding funnel stage | plan-churned-before-dawn (5) | plan-churned-before-dawn (5) | — |
| Funnel taxonomy unknown | 0 | 0 | 0 |
| Instrument errors / files | 0 / 8 | 0 / 8 | 0 / 8 |

**DMGCHECK: BAND VARIANCE (launches>=12 AND firstFights>=6).**
The survey bars also all PASS (firstFightRich, taxonomy,
instrument). The verdict is not a near-miss on either bar: both
numbers land exactly on the designation.

## 2. The reproduction is exact, not just aggregate-equal

The numbers above are not merely equal in total — the corpora are
the same trajectories. A direct comparison of this check's corpora
against the dmgsurvey corpora on the same band shows, for every
seed, `v4departs` and `v4encounters` **byte-identical**
(`JSON.stringify` equal), with identical days, deaths, and standing:

| Seed | Launches | First-fights | Days | Deaths | Standing | Max wave |
|---|---|---|---|---|---|---|
| 106181 | 0 | 0 | 150 / 150 | 81 / 81 | 199 / 199 | 4 |
| 106182 | 1 | 1 | 150 / 150 | 115 / 115 | 425 / 425 | 5 |
| 106183 | 0 | 0 | 150 / 150 | 92 / 92 | 199 / 199 | 4 |
| 106184 | 6 | 4 | 150 / 150 | 121 / 121 | 199 / 199 | 4 |
| 106185 | 0 | 0 | 117 / 117 | 56 / 56 | 155 / 155 | 4 |
| 106186 | 2 | 2 | 145 / 145 | 81 / 81 | 199 / 199 | 4 |
| 106187 | 0 | 0 | 60 / 60 | 49 / 49 | 99 / 99 | 3 |
| 106188 | 7 | 2 | 150 / 150 | 118 / 118 | 515 / 515 | 5 |

(Two columns per cell: this check / dmgsurvey.) The policy change
between the strikeband base and this base (the r149 fight-step
helpers — no-path skips and a reachability pre-check in the
scholar's dodge/close/strike helpers) moved **nothing** in these
trajectories: not one launch, not one fight, not one death, not
one standing point. That is the launch-neutrality the prereg
predicted for a fight-step change, now proven on the band rather
than argued. It also means the lend-a landing between `e103a64cc`
and `d352834ef` (evidence + scripts only) moved nothing either —
as expected, and as the killed first leg's 3 seeds had already
shown (identical per-seed summaries on the old base too).

## 3. Per-seed map (launches / first-fights / fled / killed / died / no-fight)

Band 106181–106188 — launches 16, first-fights 9 (6 distinct):

- 106181 (survived 150d, standing 199, wave 4): 0 / 0.
- 106182 (survived 150d, standing 425, wave 5): 1 / 1 / 1 / 0 / 0 / 0 — the Hassan vs Eulogy fight (§5).
- 106183 (survived 150d, standing 199, wave 4): 0 / 0.
- 106184 (survived 150d, standing 199, wave 4): 6 / 4 / 3 / 0 / 1 / 2 — engine seed: 4 first-fights, all vs The Eulogy.
- 106185 (lost d117, standing 155, wave 4): 0 / 0.
- 106186 (lost d145, standing 199, wave 4): 2 / 2 / 0 / 0 / 2 / 0 — both first-fights ended in a villager death.
- 106187 (lost d60, standing 99, wave 3): 0 / 0 — never reached wave 4.
- 106188 (survived 150d, standing 515, wave 5): 7 / 2 / 2 / 0 / 0 / 5 — launched most, met least: 5 no-fight launches, all re-launches against 'audit'.

First-fight rows (launch → fight, from the survey JSON):

- 106182 d114 eulogy (trio) → d114 eulogy, expedition, vFlee, 5 rounds, 329 dealt (same day).
- 106184 d102 eulogy (quad) → d102 eulogy, world-tick, vFlee, 2 rounds, 16 dealt (same day).
- 106184 d106 eulogy (quad) → d110 eulogy, world-tick, vFlee, 3 rounds, 0 dealt.
- 106184 d106 eulogy (quad) → d110 eulogy, world-tick, vFlee, 3 rounds, 0 dealt (second launch shares the fight).
- 106184 d116 eulogy (quad) → d120 eulogy, aid, vDie, 3 rounds, 20 dealt.
- 106184 d144 eulogy (quad) → NO FIGHT. 106184 d147 eulogy (quad) → NO FIGHT.
- 106186 d47 eater (quad) → d50 eater, expedition, vDie, 2 rounds, 0 dealt.
- 106186 d49 eater (pair) → d50 eater, expedition, vDie, 2 rounds, 0 dealt (second launch shares the fight).
- 106188 d125 network_note (pair, wave 5) → d130 network_note, world-tick, vFlee, 10 rounds, 504 dealt.
- 106188 d129 network_note (pair, wave 5) → d130 network_note, world-tick, vFlee, 10 rounds, 504 dealt (second launch shares the fight).
- 106188 d132/d135/d138/d140/d143 audit → NO FIGHT (five re-launches, no meeting — the 'audit' churn).

Same-day first-fights: 2 (106182 d114, 106184 d102). Distinct
first-fights: 6 — exactly the dmgsurvey floor.

## 4. Wall numbers

| Wins | National (scaleRank ≥ 2) | National (standing ≥ 200) | Table seats | Wave 5 reached | Wave 4 reached | Median survival (d) | Survived (days ≥ 150) | Total deaths | Starvation deaths | Standing 199 |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | 2 | 0 | 2/8 | 7/8 | 150 | 5/8 | 713 | 4 | 4/8 |

Identical to the dmgsurvey band's wall on every column (0 wins, 0
national, 2/8 wave 5, 7/8 wave 4, 713 deaths, 4 starvation, 4/8
at exactly 199). Deaths are overwhelmingly combat: `villager
combat` 290 + `expedition` 199 + `combat` 105 = 594/713 (83%);
starvation is 4 of 713 (0.6%). The villages are not starving —
they are being killed, mostly by monsters, mostly on expeditions
and in village defense. The 199 stall is still the visible
ceiling: 4 of 8 villages end at exactly standing 199.

## 5. Sense-testing

The transcripts are the same trajectories the survey read, and
they read the same way — the System's voice is intact and the
villages' days cohere. Quotes below are from THIS check's corpora
(not copied from the survey evidence):

- Seed 106182, day 26: 📺 "Oh, you survived the AUDIENCE NOTES? Cute. We've stopped
  pretending these are animals now. That was the FINAL DRAFT, folks — what comes out of
  the treeline next was never alive the way you mean it."
- Seed 106182, day 26: 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Milo just put down
  Spool... on CAMERA. That's a veteran kill, folks. REMEMBER the name."
- Seed 106182, day 33: 📺 "We've been watching you for a LONG time. Your faiths. Your formats.
  Your little institutions. So we built something out of... well. Out of YOU. Say hello to the
  MIRROR DRAFT."
- Seed 106182, day 9: 🛡️ "Jaxon, Robin, Si-chan and Nikos met them at the door — 4 put down.
  Jaxon, Robin, Si-chan, Nikos are hurt."
- Seed 106182, day 53: ◈ ARC IV — THE INEFFICIENCY. SYSTEM: "ROUNDING ERROR RECLASSIFIED:
  ANOMALY. Organic consumption yields impossible output. Recalculating. Recalculating." — They
  finally see it. The thing they laughed at — needing to EAT — is the engine.

### One launched first-fight end to end (seed 106182, The Eulogy, day 114 — from this check's corpus)

Day 114, a trio launches from the brain: Frank leads Si-chan and
Hassan Ali after The Eulogy (wave 4). The same day, Hassan walks
straight into it — the fight the launch was for:

- "Hassan walks straight into Ugly-Eyes. No avoiding it."
- "Hassan sees Ugly-Eyes coming and nocks an arrow — the fight opens at range (4 shots)."
  Three of four arrows land (22, 24, 25 damage); one buries itself in the dirt.
- "R1: Hassan strikes for 36 (x1.2) (916 left)" — Final Chapter hits Hassan for 21.
- "R2: Hassan strikes for 36 (x1.2) (880 left)" — Epitaph hits Hassan for 13.
  "Hassan is losing — shouts for help! Frank charges in!"
- "R3: Hassan strikes for 38 (x1.3) (842 left)" — "R3: Frank strikes for 11 (831 left)"
  — Epitaph hits Hassan for 15. "Hassan is still losing — shouts again! Si-chan charges in!"
- "R4: Hassan stops mid-fight and binds the wound — field medicine, +20 HP."

Five rounds, 329 damage dealt to a ~1,023-HP monster, 79 taken, and Hassan runs at 36% HP.
The launched party found its monster, fought it properly — bow opening, called help twice,
field medicine mid-fight — and still dealt about a third of its health before fleeing.
That is the damage gap, in one fight, on the designated band — and it is the same fight,
line for line, that the survey read on the old base. The fight-step policy change did not
alter a single strike in it.

Instrumentation note: the fight log text in the corpus truncates after R4 (rounds 5,
mDealt 329, fled at 36% HP come from the encounter row, not the log text) — same as the
survey noted. Counts in this file rest on the encounter rows, which is what the prereg's
definition uses.

## 6. Village assessment, in plain words

Eight villages lived 150 days on the current base, and the picture
is the survey's picture, unchanged: the villages survive or die at
regional standing, four of them parked at exactly 199, none of them
anywhere near the endgame — zero wins, zero national standing, zero
seats at the table. Two reached wave 5; one died at wave 3 on day
60. The villages do launch hunting parties — sixteen times across
the eight — but they cluster: two villages (106184, 106188) do
thirteen of the sixteen launches, and three villages never launch
once. When a party sets out after a wave-4 monster it usually does
meet it — nine first-fights from sixteen launches — but the meeting
usually ends badly: six run away, three end with a villager dead,
none ends with the monster killed. Seven launches go nowhere at
all, five of them one village chasing 'audit' over and over without
ever meeting it. The damage gap is still the story of the fights
themselves: a launched party fights properly and deals a third of
a monster's health before running. But the question this check was
asked to answer is upstream of all that — did the base move the
launch engine? — and the answer is no. The engine is exactly where
the survey left it, on the same seeds, down to the same strikes.

## 7. Metric review

- **The verdict is exact, not marginal.** Both judged numbers land
  exactly on the designation (16 launches, 9 first-fights), not
  just above the bars (12 and 6). The bars were not lowered, moved,
  or re-scored after seeing the numbers; the INCONCLUSIVE middle
  was never entered.
- **Stronger than the bars require.** The prereg's bars judge
  counts. The corpora deliver more: identical `v4departs` and
  `v4encounters` arrays on all 8 seeds, identical per-seed days /
  deaths / standing. The check proves the trajectories did not move
  at all, which is a stronger claim than "launches held" — it rules
  out a compensating change (e.g. fewer launches but more fights
  per launch) as well as a collapse.
- **What BAND VARIANCE does and does not prove.** It proves this
  band still launches on this base, with this policy — so the
  1530Z collapse (9 launches / 24 seeds on fresh bands) was the
  seed draw, not the base. It does NOT prove the launch engine is
  healthy: the engine's band-to-band variance is still unmeasured
  (dmgsurvey bands ranged 6–16 launches; strikeband bands 1–6),
  and this band's own richness is still lumpy (two engine seeds
  carry 13/16 launches; three seeds launch nothing). A 4th-band
  screen is still a lottery ticket for a richer pool, not a plan —
  but it is now a lottery ticket drawn against a working engine,
  not a broken one.
- **The policy change is launch-neutral, proven not argued.** The
  r149 fight-step helpers touch only the scholar's in-fight
  movement. The prereg predicted launch counts and first-fight
  existence would be unaffected; the exact reproduction confirms
  it — including fight OUTCOMES (the same 6 fled / 3 died / 0
  killed split), which the prereg allowed might move. The
  scholar's saved refused turns did not change a single fight
  outcome on this band.
- **Counted vs distinct.** As in the survey, 9 counted first-fights
  are 6 distinct (three second launches share an already-counted
  fight). The distinct count (6) meets the floor of 6 exactly. The
  next dmgshape run should still plan its pool on the distinct
  number.
- **Fled is the pool.** 6 fled, 3 died, 0 killed — the same split
  as the designation. The next run should expect fled fights, not
  kills.
- **No-fight launches are still common.** 7 of 16 launches (44%)
  produce no fight in the window; 5 of the 7 are seed 106188
  re-launching 'audit'. Same churn the survey documented.

## 8. Findings notes for the coordinator

- **Finding #2627 — RESOLVED as band variance.** The 1530Z launch
  collapse (9 launches / 24 seeds on fresh bands) was the seed
  draw, not the base. Evidence: the dmgsurvey instrument re-run
  verbatim on its designated band on the current base reproduces
  the designation exactly (16 launches, 9 first-fights, 6 fled)
  and the corpora's launch/fight rows are byte-identical to the
  survey's on all 8 seeds. No bisect is owed.
  (Update to be filed to `sim-findings.md` by the coordinator —
  this worker's branch carries evidence only; findings file lives
  in goal `hidden_files/`.)
- **Next step (per the brief's frozen bars): the 4th-band screen
  106241–106248** — coordinator-authorized, fresh prereg. The
  strikeband evidence's caveat stands: three screened bands maxed
  at 2 first-fights against a floor of 6, so a 4th band is a
  lottery ticket, not a plan — but the engine is now proven
  working on the designated band, so the screen is worth the one
  leg it costs.
- **Designation stands.** Band 106181–106188 remains the
  designated band for the next dmgshape run: 9 first-fights (6
  distinct), 16 launches, 9 quad launches, on the current base
  and policy. The next dmgshape run must still port ALLYSLOT3
  first (as dmgshape-rerun-b did) and re-verify its pool on
  arrival.
- **Expect a fled pool, not a kill pool.** Designated band: 6 fled,
  3 died, 0 killed. Plan the decomposition around fled fights.
- **Plan on 6 distinct fights, not 9.** Three of the nine counted
  first-fights are second launches sharing an already-counted
  fight.
- **The 'audit' churn on 106188 is a lever candidate, not check
  noise.** Five launches against one target type in 11 days with
  no meeting, on a seed that otherwise launches well. If the next
  run wants more pool, the cheapest place to look is why a launched
  party never meets its target — not more seeds.
- **The 199 stall deserves its own line in the next executive
  update.** 4 of 8 villages end at exactly standing 199. Villages
  survive to regional and stop.
- **The policy change (r149 fight-step helpers) is launch-neutral.**
  No bisect, no revert, no follow-up needed on that diff from the
  launch side.

## 9. Infrastructure notes

- **Write flap:** QUIET this run — the prereg, instrument, all 8
  corpora, and the survey JSON wrote on first attempt (0
  `@@FALLBACK` in the legs log). The VM did not restart during
  the run.
- **Safe-commit index clobber struck three times** on this branch
  (after the prereg commit `a048c262b`, the instrument commit
  `28811d9da`, and the base-update commit `c71ce5000` — the third
  strike showed the `MM` staged+unstaged variant). Repaired each
  time with the documented `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe; verified by `git
  status` empty + `git diff HEAD` empty + hash-object == HEAD
  blob per file. The corpora/evidence commit below must be
  checked the same way.
- **Leg runtimes:** the completed leg ran ~3.4 min for 8 seeds
  (150d). The first leg (killed by the rebase order) had run 3
  seeds in ~5.5 min before the SIGTERM; its per-seed summaries
  matched the completed leg's exactly.
- **Legs log:** `evidence/2026-11-20/dmgcheck-b-legs.log` holds
  the 8 driver JSON lines plus `LEG_EXIT=0` (this time the exit
  echo went through the tee, unlike the dmgsurvey legs log).
- **No `check.js` gate was run** — this step is an evidence-only
  survey instrument, never to be merged as a game change; the
  proof tests (34/34, twice) + analyzer selftest (26/26) are the
  gate for this step.
- **No panel compare / telemetry was run** — there is no
  before/after here (a check re-runs one band; it does not
  compare) and the survey corpora are recorder corpora, which
  the telemetry check refuses (the dmgshape-b precedent). Wall
  numbers above are reported directly.

## Files

- `evidence/2026-11-20/sim-dmgcheck-b-prereg.md` — frozen prereg + coordinator-directed base update (commit `c71ce5000`)
- `evidence/2026-11-20/sim-dmgcheck-b.md` — this file
- `evidence/2026-11-20/dmgcheck-b-survey.json` — analyzer output, verdict BAND VARIANCE (exit 0)
- `evidence/2026-11-20/dmgcheck-b-legs.log` — 8 driver JSON lines + LEG_EXIT=0
- `evidence/2026-11-20/perseed-dmgcheck-b-106181-106188/` — 8 corpora
- `scripts/dmgcheck-driver-b.js` — survey driver (commit `28811d9da`)
- `scripts/analyze-dmgcheck-b.js` — survey analyzer + three-way dmgcheck verdict (commit `28811d9da`)
- `scripts/test-dmgcheck-b.js` — proof test, 34/34 green (commit `28811d9da`; re-run green after the rebase)

## Proof recap

- Proof test `scripts/test-dmgcheck-b.js`: **34/34 green** — frozen base resolves to
  `d352834ef`, src diff 0, substrate env gates present, ALLYSLOT3 absent from src verified,
  analyzer selftest green, live 5d shape run on seed 106181 (0 errors), D1 repeatability +
  D2 wrap neutrality at 30d on 106181, policy sha `1884c8852d38`. Re-run after the rebase:
  **34/34 green** again.
- Analyzer selftest: **26/26 green** (incl. §D three-way verdict fixtures).
- Instrument bars: 8/8 files parse, 0 instrument errors, taxonomy 0 `unknown`.
- Observable effect (not just green assertions): the band's corpora contain 16 real launches
  and 9 counted launched first-fights — e.g. seed 106182 day 114, Hassan vs The Eulogy, 5
  rounds, 329 damage dealt, fled at 36% HP — counted from the corpora by the frozen
  definition, with the survey JSON as the record. The `v4departs` and `v4encounters` arrays
  are byte-identical to the dmgsurvey corpora on all 8 seeds.
