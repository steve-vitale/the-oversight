# sim-takeseat-b — the sit drive: the seat is taken, the doors open, the village lives on — GO

**Arm:** sim-takeseat-b (run fleshout-loop-b-20261107T1330Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** New
composite policy (`scripts/policies/competent-linkfeast-b.js`:
frozen staged + linkdrive + feastdrive, both unmodified) + sit
drive (`TAKESEAT_B=1`, default OFF). **Verdict: GO — primary
5/8 sat vs 0/8 baseline, substrate guard 8/8, cost bar passed.**
**Band:** 53001–53008 DELIBERATELY REUSED · **Horizon:** 150d
death-aware · **Legs:** baseline composite (sit OFF) + armed
composite (sit ON), 8 files each · **Corpus:**
`evidence/2026-11-07/perseed-takeseat-b-baseline/` and
`perseed-takeseat-b-armed/` (base a78938a0b, 0 instrument errors
across all 16 files) · **Prereg:**
`evidence/2026-11-07/sim-takeseat-b-prereg.md` (committed
a6c3f3955 before any judged sim) · **Proof:**
`scripts/test-takeseat-b-20261107.js` 23/23 green before the
judged run and re-run green after the tooling commit · **Analyzer:**
`scripts/takeseat-b-analyze-20261107.js` (analysis at
`/tmp/takeseat-b-analysis.json` — working copy, the evidence file
is the record) · **Panel:** `evidence/2026-11-07/takeseat-panel.md`
(+ `.json`, `-before/-after.json.gz`), decision
`review_required`, no regression signal.

**The one-line result, plainly:** the seat is earned on five
seeds, the policy sits on all five — day 90, 90, 90, 93, 94 — the
table reads the village's real deeds aloud, opens five or six
doors, and then waits, unanswered, while the village lives on
around it: four of the five live to day 150 under the table's
quiet (sanctity), one dies a week after sitting exactly as it
would have anyway, and two of them go on to kill wave-5 monsters
in feast-draw fights after the sitting — including one fight that
kills the Bearer himself, with succession carrying the sitting
on. Sitting works. Nobody has won yet, because nobody has walked
a door — that is the next arm, not this one.

## The sit, per seed

| Seed | First seat day | First ready day* | Sit day | Seat | Doors offered | Days after sit | End | Standing |
|---|---|---|---|---|---|---|---|---|
| 53003 | d60 | d90† | **d90** | lesser | 6 | 60 | survived 150d | 344 (base 310) |
| 53004 | d73 | d91 | **d94** | lesser | 5 | 56 | survived 150d | 260 (base 285) |
| 53005 | d85 | d90 | **d90** | lesser | 6 | 7 | village-lost d97 | 230 (= base) |
| 53006 | d59 | d92 | **d93** | lesser | 6 | 57 | survived 150d | 834 (base 199) |
| 53008 | d72 | d90 | **d90** | lesser | 6 | 60 | survived 150d | 199 (= base) |
| 53001/02/07 | — (no seat) | — | — | none | — | — | as baseline | exact |

\* First ready day from the BASELINE daily snapshots (the armed
leg's snapshots show few ready rows because the sit consumes the
first ready day at an upkeep, before the snapshot — see below).
† 53003's preview was ready at a d90 upkeep even though the d90
daily snapshot (taken after `policy.daily`) shows it blocked: the
encounter block is transient within a day, and the drive samples
at the decision point, 3× a day. This is the sitstep2 metric
review §2 fix, working as designed.

**The wait, honestly:** the drive sat on the first ready
decision-point on 3/5 seeds (53003/53005/53008, all day 90) and
waited encounters out on the other two — 53004 sat d94 after 11
encounter-blocked attempts + 1 live-fight skip; 53006 sat d93
after 8 encounter-blocked attempts + 6 live-fight skips. The
baseline's 115 snapshot-ready days (22+20+8+28+37) are the
opportunity; the drive needed at most 3 days of it. The
encounter block is real but transient — never the binding
mechanism once the drive samples per part instead of per day.

**Doors offered (earned paths at the sit):** 6, 5, 6, 6, 6.
Names survive for the two seeds whose sit waited past the first
ready day (a pre-sit preview row exists): 53006 offered the
Feared, the Beloved, the Witness, the Assimilated, the Defiant,
the Relay — the Indispensable missing, correctly (FULL seat
only). 53004 offered the Feared, the Beloved, the Assimilated,
the Defiant, the Relay — the Witness and the Indispensable
missing. The other three sat on the first ready day, before any
daily preview row existed, so only the count survives in the
corpus. **Doors entered: 0/5 by design** — the arm never answers
the modal. **Wins: 0/8** — a win needs a door walked and played;
this arm measures the sitting, not the winning.

**The modal does not stall the run.** After every sit the run
continued to its death-aware end: 60, 56, 7, 57, 60 days after
the sit, with `tableChoices` surfaced on every post-sit day
(58–62 snapshot days per sat seed). The 2026-10-17 takeseat
finding (13/16 sat, modal harmless in node sims) reproduces on
the current substrate, 5/5.

## Judged bars (frozen prereg)

| Bar | Baseline | Armed | Result |
|---|---|---|---|
| Tables sat ≥ 3/8 vs 0/8 | 0/8 | **5/8** (lesser, all) | PASS |
| Baseline earns lesser ≥ 3/8 (substrate sanity) | **5/8** | — | PASS |
| Per-seed exact reproduction ≥ 6/8 (substrate guard) | — | **8/8** | PASS |
| Starvation ≤ control + 2 total AND arm-only ≤ 2 | 3 | **1**, arm-only 0 | PASS |
| Median survival ≥ 0.8× control | 116.5d | **150d** (1.29×) | PASS |
| Pair days ≥ feastdrive-armed 14 | 17 | **65** | PASS |

**Substrate guard detail (8/8):** the three never-sat seeds
reproduce the baseline whole-run EXACTLY (53001 150d/175,
53002 79d/125, 53007 86d/99 — days, end, standing, maxWave,
wave-4+ kills, final seat all identical). The five sat seeds
reproduce the baseline EXACTLY on every daily row before the
sit day (87, 91, 87, 90, 87 days compared per seed — standing,
roster, living, wave-4 kills, seat, feast deeds, pair-day flag,
preview ready/why, scholar at Haven). Post-sit trajectories
diverge by design (sanctity + the overtime clock stopping), which
is why the guard judges pre-sit exactness — and the guard passes
with margin. The sit drive's preview reads are trajectory-neutral
in practice, as the proof's live 53001 check predicted.

**Cost bar detail:** starvation deaths fall 3 → 1 (baseline:
53004, 53007, 53008; armed: 53007 only — the two villages that
sat and survived stopped starving; arm-only 0). Median survival
rises 116.5d → 150d because four sat villages live to the
horizon instead of dying at 115–130d. Pair days rise 17 → 65 —
sitting BANKS pairs: 53004 1 → 17, 53006 0 → 32 (sanctity keeps
the two living wave-4 killers alive together; the pair-day flag
is living-veterans ≥ 2). The pair cost the feast drive paid
(62 → 14) is not re-paid here — it is partly RECOVERED by the
sitting itself. That recovery is a property of sanctity, not of
the drive's tuning, and it belongs in the cost-taming
conversation (see Next blanks).

## The composite substrate (new — what the baseline IS)

The linkfeast composite is a new composition, so its baseline
has no prior corpus to reproduce — it is reported on its own,
with the two halves sanity-checked against their corpora:

- **Links:** 43 formed (linkdrive corpus: 41) — propose-accepted
  + counter-answers + raise-links per seed 8/6/5/5/6/5/4/4.
- **Feast surge:** spent on 5/8 (53003/04/05/06/08) —
  feastdrive-armed also 5/8, different seeds (53003 gained,
  53007 lost). `foodDeeds` complete on the same 5/8.
- **Seats earned:** 5/8 lesser (vs linkdrive 4/8, feastdrive-armed
  5/8 foodDeeds) — the composite earns MORE seats than either
  drive alone: 53006, dead at d89 with 0 ready days under
  linkdrive alone, survives to d127 with 28 ready days under the
  composite; 53008, seatless under linkdrive (feast surge missing),
  earns a lesser seat with 37 ready days once the feast drive
  buys the surge. The drives compose constructively on this band:
  the feast drive fixes the surge half, the link drive fixes the
  scale half, and neither undoes the other. Feasts hosted 11
  total; donations 8,810–18,060 kcal on the feast seeds.
- **Per-seed vs sitstep2's linkdrive replay:** 53001/53002
  identical (150/175, 79/125); 53003–53006/53008 all move —
  the composition is a genuinely new trajectory set, not a
  re-run of either parent. That is expected and disclosed, not
  drift: the guard that matters (armed vs baseline) is 8/8.

## What happens AFTER the sit (the world does not freeze)

- **Sanctity holds, and it is load-bearing.** Four sat villages
  survive to 150d where their baselines died at 115–130d.
  53006's standing climbs 399 → 834 across the sitting (baseline
  collapses 399 → 435 with roster 10 → 0) — standing keeps
  accruing because people keep living, not because the table
  grants it. Roster holds 7–11 alive to d149 where the baseline
  empties by d127. The overtime tier at every sit is 0 (sat
  within 4 days of the floor), so the overtime stop is not what
  saves them — the ambient-pressure suspension is.
- **The feast road keeps fighting — including wave-5, after the
  sitting.** The feast drive keeps hosting feasts post-sit
  (53006: 7 feasts after d93), and every fresh armed grant draws
  a wave-appropriate scavenger the policy faces. 53003 kills The
  Rerun (wave 5, 1200–1500 HP) on d113 — the same day it hosts a
  feast — won in 5 rounds with 2 allies. 53006 kills The Spoiler
  (wave 5) on d121, then faces Timeslot (wave 5) on d123 and
  LOSES: the scholar dies (hp −0.03, 24 rounds), succession
  carries the village on to 150d. The table's sanctity suspends
  AMBIENT pressure; a feast draw is invited, not ambient — so
  the sitting does not make the village safe, and the sitter can
  die before choosing a door. The sitting survives its sitter:
  `tableDone` stays true, the 6 doors stay open, the village
  plays on under a successor. (Finding appended to
  sim-findings.md — the sitter-dies-mid-sitting case, and the
  feast-draw-after-sitting case, are design questions for Steve,
  not defects claimed here.)
- **53005: sitting does not save a village already gone.** It sat
  d90 and died d97 exactly as the baseline did (same days, same
  standing 230, same kills) — its last recorded death predates
  the sit (d88), its roster already 4 and falling, and the sit
  changed nothing about its fate. The table waits; the village
  still has to live. This is the honest bound on what sitting
  buys: it stops the ambient bleeding, not the bleeding already
  done.
- **53003: the sitter dies the day he sits.** David Kim sits on
  d90 — the audit reads his deeds, the village grieves him the
  same day ("a stranger"), keepsakes buried, the grave dug by
  the fire — and his successor (gen_38wegb6) carries the sitting
  and kills the wave-5 Rerun as the player on d113. See the
  sense-test read below.

## Wall numbers (this run)

National / table-sat / wins: baseline **0 / 0 / 0** → armed
**0 / 5 / 0** · Wave 4 unlocks 7/8 → 7/8 · Wave 5 unlocks 3/8 →
4/8 (53006 joins) · Wave-5 kills 0 → 2 seeds (53003, 53006) ·
Lesser seats earned 5/8 → 5/8, sat 0/8 → 5/8 · Full seat 0/8 →
0/8 · Median survival **116.5d → 150d** · Max 150d both. The
scale wall's next rung is unchanged in kind — national is still
0/8, and the full seat still names national — but the table rung
is now BUILT past: villages sit. The chain runs end to end
through the sitting. What remains is the door: walking one, and
the national Binding behind the full seat.

## Per-seed table

| Seed | Leg | Days | End | Standing | Scale | Max wave | Seat | Sat | Pair days | Starv | w4 / w5 kills |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | base/armed | 150/150 | survived | 175/175 | regional | 4/4 | none | — | 0/0 | 0/0 | 0/0 |
| 53002 | base/armed | 79/79 | village-lost | 125/125 | regional | 4/4 | none | — | 0/0 | 0/0 | 0/0 |
| 53003 | base/armed | 118/150 | lost/survived | 310/344 | regional | 5/5 | lesser | d90 | 2/2 | 0/0 | 2/3, 0/1 |
| 53004 | base/armed | 115/150 | lost/survived | 285/260 | regional | 5/5 | lesser | d94 | 1/17 | 1/0 | 3/2, 0/0 |
| 53005 | base/armed | 97/97 | village-lost | 230/230 | regional | 5/5 | lesser | d90 | 14/14 | 0/0 | 3/3, 0/0 |
| 53006 | base/armed | 127/150 | lost/survived | 199/834 | regional | 4/5 | lesser | d93 | 0/32 | 0/0 | 5/7, 0/1 |
| 53007 | base/armed | 86/86 | village-lost | 99/99 | regional | 3/3 | none | — | 0/0 | 1/1 | 0/0 |
| 53008 | base/armed | 130/150 | lost/survived | 199/199 | regional | 4/4 | lesser | d90 | 0/0 | 1/0 | 0/0 |

## Village assessment (plain words)

Five villages earned the right to sit, and this time somebody
walked over to the ring. Three of them sat on the first morning
it was allowed — the ninetieth dawn, the day the table finally
exists — and the other two waited out a fight or two and sat
within three days. The table read each village's life back to
it, out loud, with the real numbers in it, and opened five or
six doors. Then it waited. It is still waiting, on all five:
nobody has walked a door yet, because this arm does not walk
doors. What happened instead is the honest surprise of the run:
sitting changed the villages that sat. The world held its breath
the way the table promises — four villages that were going to
die in the next month lived to the end of the season instead,
their people staying alive long enough to keep building standing
and keep killing. One village sat and died anyway, a week later,
because it was already gone when it sat. One Bearer sat and died
the same day, killed by a stranger, and his village buried him
and carried the sitting on without him — his successor killed a
wave-5 monster at the table's doorstep three weeks later. And the
feasts kept coming, even at the table: the smoke kept drawing
monsters, and the villagers kept facing them, because a feast is
an invitation, not weather, and the table's quiet does not cover
invitations. The chain now runs all the way to a taken seat. The
last link is no longer a decision nobody makes. It is a door
nobody has walked — yet.

## Sense-test read (sat seeds)

**The announcement, the audit, and the sitting collapse into
one morning — and it reads right.** On 53003/53005/53008 the
seat was earned days before the floor (d60/d85/d72), so day 90
carries the announcement ("◈ THE TABLE IS SET. A ring of pale
light waits...") and the sitting in the same dawn. The audit
names the run's real deeds every time — 53003: "waves 1–3 faced
(13/10/5), with 3 wave-4 and 1 wave-5 fought, 8 contests
survived, 4 crises weathered"; 53006: "(14/11/7), with 3 wave-4
fought, 4 contests survived, 3 crises weathered" plus the
ascension note ("1 ascension from one village — its terms improve
accordingly") and the honest overtime note ("0 weeks kept
waiting, 1 of Haven lost meanwhile. Every door's standing −3").
53004's deed-voice line names the village's own kills: "They
faced Loud-Eyes and lived to sit here. They faced The Audit and
lived to sit here." The fiction is specific, grounded, and
varies by run. Nothing reads as a template with the numbers
left blank.

**The village talks about the table — including, once, before
it is supposed to exist.** 53005, day 89: "🗣️ Dina to Cecilia,
by the fire: 'The table's set. The ring of pale light — it's
just sitting there. Waiting on them. What do you think they'll
tell it?'" The seat was earned d85; the day-90 floor gates the
announcement and the preview, but not villager table-talk — the
villagers discuss the ring a day before the player is allowed to
know it exists. That is a floor leak in conversation content,
filed as a finding (sim-findings.md), not chased here. The
d90 talk itself reads as people living with an open invitation:
riders bring news, tribute arrives, the doors are discussed.

**The world reacts to the sitting.** 53004 d96: "◈ WORD
TRAVELS — riders from The Red Table II bring talk of Haven. Out
there they call you the Feared." 53003 d90: three link-holding
lines fire at once as Emberhold, Ashford, and Stonebridge each
install their own speaker and reach for the grief card — the
same sentence three times, village name swapped ("The table has
heard it before: the grief card is spent. Tribute stays at 9,000
kcal/week."). True to the fiction (three links grieving the same
dead Bearer at once) but verbatim-repetitive as dialogue — it
reads as a system announcement, not three villages speaking.
Noted, not a defect claim.

**The death of a sitter reads as a village grieving, not a
missing trigger.** 53003 d90–91: "📖 The Codex turns a page on
its own. David Kim is dead. You didn't ask. It knew." / "🕯️
David is dead — and the dead hold no treaties. Every link Haven
has shakes." / "At the grave, Victor, Nikolai, Sanne speak for
Rodrigue — 'David trusted them. We saw it. Give them the fire's
hearing.'" The sitting, the death, the grief, and the succession
all land in the same two days and the transcript stays coherent:
the table sat, the Bearer died, the village buried him and kept
the seat. The 53006 reactor line lands the same way ("The warm
hum behind your ribs is gone. The reactor went with Jamie's
body — it does not come out, and it does not pass on. Hunger is
back on the table.").

## Metric review

Pre-registered metrics bind this run (prereg a6c3f3955). GO
required ALL of: primary (≥3/8 sat vs 0/8) ✓ 5/8; substrate
sanity (baseline lesser ≥3/8) ✓ 5/8; substrate guard (≥6/8
per-seed exact) ✓ 8/8; cost bar (starvation ≤ +2 AND arm-only,
median ≥0.8×, pairs ≥14) ✓ 1 vs 3 / arm-only 0, median 150 vs
116.5, pairs 65. No metric was swapped, re-cut, or
re-thresholded after the run.
- What the metric did not cover, honestly: (1) The arm-only
  starvation cap (≤2) is the inherited feastdrive/linkdrive
  convention — the prereg says "AND arm-only" without a number,
  and the analyzer applies ≤2 as the prior arms did. It did not
  decide the verdict (arm-only 0), but the next prereg should
  state the number. (2) The guard judges pre-sit exactness on a
  fixed daily-row field list; it does not compare the post-sit
  trajectory at all — by design (sanctity diverges it), but a
  future arm that wants to claim "sitting is safe" needs a
  post-sit comparison, not this guard. (3) The primary counts
  any `tableTakeSeat` ok as a sit; it does not check the sitting
  SURVIVES (53003's sitter dies the same day — the sitting
  survives, verified, but the bar as written would pass a sit
  that immediately unraveled; the corpus shows it did not).
  (4) The daily snapshot is taken after `policy.daily`, so a sit
  that fires at a d90 upkeep leaves no pre-sit preview row —
  door NAMES are unrecoverable for 3/5 sits (only counts). A
  future door arm should record the offered doors in the sit
  event itself.
- Instrument notes: 0 instrument errors on all 16 files. The
  sit-drive skip tallies are large by design (3 upkeep attempts
  per day: ~265 'not-announced' skips per no-seat seed, ~170
  'already-done' per sat seed) — they are the per-part sampling
  the encounter wait needs, not noise. The analyzer's `linksEver`
  field is not used; link totals come from `linkdriveStats`
  (proposeAccepted + counterAnswers + raisesLinked = 43) and
  reconcile with the per-seed stats.

## Balanced panel (§15) and telemetry

Panel `evidence/2026-11-07/takeseat-panel.md`: decision
`review_required` (the 8-seed screen's standard cautious
verdict). Neutral metrics: won 0 → 0, national 0 → 0,
survival30/60 1 → 1 (no movement); villageDeaths −5.375/run
(65.25 → 59.875, 95% interval −11.75 to −0.5),
villageDeaths/100d −9.39, communityLost 0.875 → 0.375 (−0.5).
No LOUD regression signal; the movement is in the expected
direction (sitting keeps villages alive). The panel does not
observe the sit rate (contract has no tableDone mapping) — the
sit is judged from the analyzer, as the prereg states. Telemetry
deviation check: `scripts/telemetry-check.js` REFUSES
recorder-corpus input (same refusal as sitstep2/feastdrive —
"all 8 --current rows carry top-level anchorCommit"). No LOUD
line, no deviation signal; zero src/js changed, so no
Game-telemetry baseline exists to deviate from.

## What this arm does NOT claim

- Not a win: 0/8 wins. Sitting opens the doors; walking one is
  unmeasured. A win needs the door arm.
- Not a "bots should sit" finding: the policy is a measurement
  instrument standing in for the player (Steve-call). Whether
  any bot should sit in real play is still the player's call.
- Not a full seat: 0/8 full, national 0/8. The full seat still
  names national standing.
- Not "sitting is safe": one village died a week after sitting,
  one sitter died the day he sat, one successor died in a
  post-sit feast-draw fight. Sitting stops ambient pressure, not
  mortality.
- Not a recorder artifact: the guard is 8/8 exact (never-sat
  whole-run, sat pre-sit), the baseline sat 0/8 with the gate
  off (the RED pin, live), and the proof's 53001 live check
  reproduces the baseline exactly armed-vs-baseline.

## Next blanks (for the loop, not this arm)

1. **The door arm (walk a door)** — the next rung, now the
   binding blank: choose an earned door per sat seed (a
   pre-registered door policy, separate from the sit drive) and
   measure whether a path can be played to a win. The sitting
   is built; the winning is unmeasured.
2. **The sitter-dies-mid-sitting case** — 53003 (sitter dies the
   sit day) and 53006 (successor dies in a post-sit fight): what
   SHOULD happen to a sitting when its sitter dies? Filed as a
   finding (Steve-call territory — only the player chooses the
   sitter; a dead sitter has no player to re-choose).
3. **Feast draws after sitting** — the feast road keeps drawing
   wave-5 scavengers under sanctity (53003 d113, 53006 d121/d123).
   Sanctity's letter covers ambient pressure; the draw is
   invited. Steve-call whether invited fights should pause while
   the table sits, or whether the risk is the price of the wait.
4. **Villager table-talk before day 90** — 53005 d89: villagers
   discuss the ring before the floor. Filed as a finding (the
   floor gates the announcement/preview, not the talk).
5. **The national Binding** — unchanged: national is the only
   missing full-seat item on the sat seeds. (Linkdrive's next
   blank, unchanged.)
6. **Feast-drive cost taming** — the sibling arm owns it; note
   this run's twist: sitting partly RECOVERS the pair cost
   (17 → 65 pair days), so the taming variant should be judged
   with sitting in the loop, not without it.

## Proof and commits

- Proof `scripts/test-takeseat-b-20261107.js`: 23/23 green on
  this worktree before the judged run (RED phase with a
  throwing engine stub, 10 GREEN fixtures, composition
  exactly-once fixtures on a real loaded game, live 53001
  baseline-vs-armed exact reproduction, analyzer pure-function
  fixtures) and re-run green after the tooling commit.
- Prereg committed a6c3f3955 before any judged sim. Tooling
  committed 9dc8a5d60 (composite + sit drive, driver, analyzer,
  panel builder, proof 23/23, sweep-compare registration; zero
  src/js, zero policy edits). The safe-commit index clobber hit
  on both commits (files shown staged-as-deleted after correct
  commits); repaired with HEAD-blob cacheinfo, verified `git
  status` empty + `git diff HEAD` empty + hash-object matches,
  each time.
- Judged corpus: `evidence/2026-11-07/perseed-takeseat-b-baseline/`
  and `perseed-takeseat-b-armed/` (8 files each, base a78938a0b,
  0 instrument errors). Analyzer output saved at
  `/tmp/takeseat-b-analysis.json` (working copy; the evidence
  file above is the record). Panel
  `evidence/2026-11-07/takeseat-panel.md` (+ `.json`,
  `-before/-after.json.gz`).
- Base note: the branch was fast-forwarded to current master
  a78938a0b at run start (prior arms' commits were already
  ancestors); no rebase was needed, no proof re-run was owed to
  a rebase.

## Convergence

**scale-onramp: converging, NOT converged.** The sit step is now
BUILT, not just diagnosed: 5/8 lesser seats taken on the first
ready day (or within 3), the modal harmless, the guard 8/8. But
no village has walked a door (0/8 entered), no win exists (0/8),
national is 0/8, the full seat is 0/8. The chain runs end to end
through the sitting; the next rung is the door.
