# sim-sitstep-b — the sit step: why a village that banks a living pair never sits — DIAG-GO

**Arm:** sim-sitstep-b (run fleshout-loop-b-20261107T0530Z, axis
scale-onramp / winnability chain) · **DIAG only, zero src/js, zero
policy edits:** replay the frozen staged policy
(`scripts/policies/competent-stageally-a.js`, unmodified) on band
53001–53008 with a seat-gate recorder reading the live sit chain
every day. **Verdict: DIAG-GO** — by the preregged bar: a single
named ordered set of gates explains the no-sit on 42/42 (100%) of
53006's pair days (bar ≥ 80%), with per-day gate state shown in the
corpus.
**Band:** 53001–53008 DELIBERATELY REUSED (a re-run, not a fresh
band) · **Horizon:** 150d death-aware · **Legs:** staged replay only
(DIAG — no baseline leg; the comparison is replay vs the confirm2
staged headlines) · **Corpus:**
`evidence/2026-11-07/perseed-sitstep-b/` (8 files) · **Prereg:**
`evidence/2026-11-07/sim-sitstep-b-prereg.md` (committed 30f364275
before any judged sim) · **Proof:**
`scripts/test-sitstep-20261107.js` 23/23 green before the judged
run (fixtures + fake-Game sit-wrap test + live 53006 determinism
leg) · **Analyzer:** `scripts/sitstep-analyze-20261107.js`
(analysis at `/tmp/sitstep-analysis.json`, working copy).

**The one-line result, plainly:** the village never sat because the
seat was never earned — not because anyone refused it, and not
because the bot failed to sit. On all 42 days the village held two
living wave-4 killers, exactly two of the lesser seat's bars were
missing and only two: the village was still just a village (no
regional standing — scale never moved on any seed, on any day),
and the feast surge was never spent in a real fight. Everything
else the seat asks for had been met for weeks. The game itself
said so, out loud, on day 90, on both pair seeds. And the sit
action was never even reachable: the table preview was null on
every day of every seed, so no policy — competent or otherwise —
could have sat, and the "bot never sits" question is untested, not
answered.

## The gate, as measured (53006, 42 pair days)

Per-day classification by the first failing link in the sit chain
(seat → preview → entry → action → sit), same rule in the recorder
and the analyzer:

| Gate | Pair days | Share |
|---|---|---|
| no-seat | 42 | 100% |
| no-preview / entry-blocked / offer-not-taken / sat | 0 | 0% |

The missing bars on those 42 days — the same ordered set, every day,
no variation:

| Missing bar | Pair days | First met (if ever) |
|---|---|---|
| scale `village` (lesser seat needs regional+) | 42 | never — `village` on all 150 days |
| food deed: feast surge never spent | 42 | never — `feastSurgeUsed` false on all 150 days |

Every other bar was met, and had been met long before the pair
formed (pair days run 89–126, then 148–151 after Sari's death broke
the pair on day 126 and the day-147 kill re-formed it):

| Bar | Value on pair days | First met |
|---|---|---|
| wave-1 faced (need 4 distinct) | 14–15 | day 20 |
| wave-2 faced (need 4) | 9–10 | day 22 |
| wave-3 faced (need 3) | 4–5 | day 37 |
| contests survived (need 2) | 9–16 | day 27 |
| crises weathered (need 2) | 2–3 | day 8 |
| integration stage (need 2) | 3 | day 8 |
| sentiment taught (food-deed half 1) | true | — |
| readiness-5 release | ready (veterans 2–3, armor 5/4, weapons 6/6, tricks 24/3) | day 98 |
| arc | 3 (never 4 — Arc IV needs the seat) | day 9 |
| tableWaiting / tableAnnounced | false / false, all 150 days | never |

The full-seat shortfall at the end names the same two bars, in the
game's own words: "standing is village — the full seat asks for
national standing or higher" and "a feast surge has not yet been
spent in a real fight" (53006's wave-4/5 faced counts, 7 and 3,
already clear the full seat's 3/2 bars — the full seat is blocked
on scale and the surge too, not on deeds).

## The game said it first (day-90 beats, both pair seeds)

The seat-waiting honesty beat fires once per run at day 90 when the
village sits at arc 3 with no seat. On both pair seeds it named the
same two bars the classifier found — two independent instruments in
agreement:

- **53006 (reactor variant, day 90):** "◈ THE TABLE — the ring of
  pale light flickers at the edge of the sky... and does not come.
  The System does not apologize this time. 'WE PRICED THE RUN. NO
  HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD BE.
  NO FEAST, NO SURGE, NOTHING HERE WE CAN PRICE. A COLD SPOT AT
  EVERY TABLE: THE WORDS WERE ON THE WRAPPER.' The ledger still
  wants: a regional standing; the food-thesis deeds (no feast can
  carry the surge while the pellet hums). The mantle may pass to
  hungrier hands; the table will still be here."
- **53007 (ordinary variant, day 90):** "◈ THE TABLE — the ring of
  pale light flickers at the edge of the sky... and does not come.
  Not yet. The table is being set for those whose deeds are done,
  and yours are not done. The ledger still wants: a regional
  standing; the food-thesis deeds. The climb is not over."

The beat is honest and complete: it names the two missing bars and
none of the met ones. A player on either seed heard exactly what
stood in the way, on day 90, seventy days before the horizon.

## The two gates, each in its own terms

**1. Scale is not standing.** `scaleRank()` (`hierarchy.js`) reads
three flags and nothing else: `globalLive` → global, `nationalLive`
→ national, `networkLive` → regional, else village. Standing points
do not enter it — 53006 ended on standing 440, the highest on the
band, and stayed `village` on all 150 days. Regional needs the
Regional Dawn: a first accord with another fire, then a bond 21+
days old (`stageFirstAccord`, `hierarchy.js`). `networkLive` never
fired on ANY seed on ANY day of the band — no seed's village ever
grew past one fire. The lever that opens this door is therefore
not "more standing" (440 already exceeds anything a threshold could
plausibly ask) but a link-forming drive: a first accord that lives
three weeks. Whether the competent policy even attempts accords is
not in this corpus — the recorder shows the outcome (no Dawn), not
the attempts. Next-run question, not a claim.

**2. The feast surge is a deed the village never does.**
`feastSurgeUsed` marks when an ability resolves while feasted in
combat (`feastBuff.js` `_spendFeastedPower`). The competent policy
banked it on 1 of 8 seeds — 53005, which never reached wave 4
(maxWave 3, died day 89) — and on 0 of the 7 seeds that reached
wave 4. Sentiment was taught on all 8 seeds (the keepsake lesson
lands); the surge half is the missing one everywhere it matters.
The lever: a feast drive — hold a feast and spend the surge in a
real fight (the leadfeast policy family already plays this shape;
a policy-side arm can carry it).

**The reactor subplot (53006 only).** The pellet went into the
bearer (Larry, gen_k1j6fdz) on day 74; while it hummed he could
never feast, so the surge deed was unbankable by design and the
day-90 beat said so. The bearer died on day 110 ("The warm hum
behind your ribs is gone. The reactor went with Larry's body — it
does not come out, and it does not pass on. Hunger is back on the
table."), the mantle passed to hungrier hands — exactly the out the
beat named — and the village still never banked the deed in the 40
days that remained. The pellet is not the binding explanation for
the no-sit: it blocked the deed for 36 of the 150 days, and the
deed stayed unbanked for the 40 days after it was gone. The binding
explanation is the feast drive itself, pellet or no pellet. One
recorder note: the reactor beat sets `reactorSeatTold`, which
permanently suppresses the ordinary seat-waiting beat — 53006 heard
the table's price once, on day 90, and never again; 53007 (no
reactor) heard the ordinary beat. That is the code working as
written, not a defect claim.

## The sit action itself: untested, not failed

The prereg's critical question — does the competent bot ever issue
or attempt the sit? — resolves as: **it never got the chance.**
`tablePreview()` was null on every day of every seed (0 preview
days band-wide, 0 ready days), because `tableWaiting` never fired
(Arc IV needs the seat) and the seat was never earned. Sit attempts
(wrapped `tableTakeSeat` / `tableOfferSeatTaker` /
`tableChooseSeatTaker` / `chooseTableOption`): 0 on all 8 seeds.
`tableChoices` never surfaced. Seat-taker options existed whenever
the recorder looked (2–10 living villagers per day on 53006, best
ascension score 35–47) — the choice would have had real candidates.
So the "policy never sits" hypothesis is not confirmed and not
refuted by this run: there was never an offer to take or refuse.
Any future sit-drive arm (takeseat policy family) must first earn
a seat — or be tested on a seed where one is earned — before its
sit count means anything.

## Before / after (replay vs confirm2 staged headlines)

The replay reproduces the confirm2 staged leg EXACTLY on all 8
seeds (same band, same frozen policy, same master family — the
master moved only by Loop A's evidence-only landing since the
confirm2 base):

| Seed | Confirm2 staged (days, end, w4+k) | This replay (days, end, w4+k) | Pair days |
|---|---|---|---|
| 53001 | 106, lost, 1 | 106, lost, 1 | 0 |
| 53002 | 150, survived, 1 | 150, survived, 1 | 0 |
| 53003 | 92, lost, 2 | 92, lost, 2 | 0 |
| 53004 | 88, lost, 1 | 88, lost, 1 | 0 |
| 53005 | 89, lost, 0 | 89, lost, 0 | 0 |
| 53006 | 150, survived, 11 (6 w4 + 5 w5) | 150, survived, 11 | 42 |
| 53007 | 150, survived, 4 | 150, survived, 4 | 11 |
| 53008 | 123, lost, 0 | 123, lost, 0 | 0 |

Guard holds: the replay is deterministic on this master (53006:
150d, standing 440, 11 wave-4+ kills, wave 5 unlocked, 42 pair
days — identical to confirm2 and to the trajfrag unperturbed leg).
Instrument errors: 0 on all 8 seeds.

## The 53007 contrast (secondary)

Same gate, same ordered set, on its 11 pair days (141–151): `no-seat`
11/11, missing bars "scale village (needs regional+)" 11/11 and
"food deed: feast surge never spent" 11/11. 53007's wave-5 door
stayed shut by one standing point (199 vs the 200 gate — readiness-5
short on weapons 5/6), so it never even reached the wave-5 facing
link; but its seat bars are the same two. The contrast confirms the
finding is not a one-seed story: on both pair seeds, the seat fails
on scale + surge and nothing else.

## Per-seed table (staged replay)

| Seed | Days | End | Standing | Scale | Max wave | Pair days | Final seat | Preview days | Sit attempts |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 106 | village-lost | 199 | village | 4 | 0 | none | 0 | 0 |
| 53002 | 150 | survived | 150 | village | 4 | 0 | none | 0 | 0 |
| 53003 | 92 | village-lost | 199 | village | 4 | 0 | none | 0 | 0 |
| 53004 | 88 | village-lost | 199 | village | 4 | 0 | none | 0 | 0 |
| 53005 | 89 | village-lost | 70 | village | 3 | 0 | none | 0 | 0 |
| 53006 | 150 | survived | 440 | village | 5 | 42 | none | 0 | 0 |
| 53007 | 150 | survived | 199 | village | 4 | 11 | none | 0 | 0 |
| 53008 | 123 | village-lost | 150 | village | 4 | 0 | none | 0 | 0 |

Band-wide: scale `village` on every day of every seed; food deeds
banked on 1/8 seeds (53005 only, which never reached wave 4);
sentiment taught on 8/8; `feastSurgeUsed` false on 7/8. The
lesser seat's other bars (waves faced, contests, crises, stage)
were met at end-state on 7/8 seeds (53005 short only on wave-4
faced, which the lesser bar does not check).

## Wall numbers (this run)

National / table / wins: **0 / 0 / 0** · Wave 4 unlocks 7/8 ·
Wave 5 unlocks 1/8 (53006), faced 1/8, kills on 1 seed (5 kills,
53006) · Median survival **114.5d** (survivals 88, 89, 92, 106,
123, 150, 150, 150) · Max survival 150d (3 seeds). The scale wall
is the wall: the chain now runs wild ally-join → wave-4 kills →
veterans → readiness-5 release → wave-5 facing, and stops at the
seat on scale + the feast deed. No village on this band has ever
been regional, let alone national.

## Village assessment (plain words)

A village that fought its way to the fifth wave, killed five of
those monsters, held two living veterans for forty-two days, and
ended with the highest standing on the band still could not sit
down — because sitting was never about how hard it fought. The
table wants two things fighting cannot give it: a neighbor it has
actually joined hands with for three weeks, and a feast whose fire
was spent in a real fight. The village had neither. It had raids
instead — Thornfield and Stonebridge came in the night on days 95
and 96 and carried off the pantry while Haven sat alone with no
links at all — and it had a pellet in its bearer's chest that made
hunger itself impossible for a month, so the feast deed could not
even be attempted. When the bearer died and hunger came back, the
village had forty days to hold a feast and spend it, and never did.
The game told them once, on day 90, exactly what was missing, and
then — because the pellet's warning counts as the telling — never
told them again. The village is not being punished for losing
fights. It is alone, and it has never feasted for a fight. Those
are the two blanks.

## Sense-test read (53006 pair window, days 89–151)

**The pair forms, and the game marks the wrong kill.** Day 89,
Greta kills the Algorithm (a real wave-4 kill, the pair snapshot
day) — and the same day the System announces on camera that
"Greta just put down The Ugly Beast... That's a veteran kill,
folks. REMEMBER the name." The Ugly Beast is not a wave-4 monster.
The announcement fires for both real wave-4 kills and ordinary
beasts, so it cannot be read as a wave-4 signal — fourth sighting
of the backlog item (killconv-a entry; confirm2 called it the third
sighting). The fiction is lively and the kill itself reads as a
person doing a desperate thing; the label is the lie, not the fight.

**The village teaches, constantly, and it reads as people.** Days
90–92: "Rosa was watching. Now they know Deadly Nightshade too."
"Larry showed Greta the Deadly Nightshade — 'remember it.' The
haven hears about it by supper." "Liam showed Jamie the Deadly
Nightshade — 'remember it.' Word travels before the lesson cools."
Teaching propagates villager to villager with names attached and
different phrasings — this is villagers acting like people, and it
kept happening through the pair window.

**The neighbors raid while Haven stands alone.** Days 95–96:
"🌙 Raid — Thornfield came in the night from the northwest. They
carried off ~1000 kcal from the pantry. Nobody's dead, but the
message is clear: the ground is theirs too, and they're done
asking. (Trust -10.)" Stonebridge follows the same night from the
west. Two raids in two days, from two different neighbors, while
Haven holds no link with either — the scale wall in fiction terms:
the village's neighbors know it only as a pantry to rob, not as a
partner. The lines are coherent and consequential (trust -10 each),
not noise.

**The reactor's death reads as a loss, not a release.** Day 110:
"The warm hum behind your ribs is gone. The reactor went with
Larry's body — it does not come out, and it does not pass on.
Hunger is back on the table. (One reactor per world, and the world
already spent its one.)" The mantle passed the same day, and the
village kept living — but the feast deed stayed unbanked. The beat
is honest about the cost (one reactor per world, spent) and about
the opening (hunger is back). What it does not do — and no beat
does — is tell the new bearer to feast. The village was told once
what it lacked, and then left to remember on its own.

## Metric review

Pre-registered metrics bind this run (prereg 30f364275). Primary:
DIAG-GO iff a single named gate (or a named ordered set) explains
the no-sit on ≥ 80% of 53006's pair days, with per-day gate state
shown. HELD: the ordered set {scale village, feast surge unspent}
explains 42/42 (100%) of pair days, with the full per-day
classification in the corpus (`gate` field on every daily row; the
pair-day gate sequence is 89–126 + 148–151, all `no-seat`). The
secondary (53007 contrast) agrees exactly: 11/11 `no-seat` on the
same two bars. The guard (replay reproduces confirm2 staged
headlines on 53006) HELD exactly on all 8 seeds. No metric was
swapped, re-cut, or re-thresholded after the run. The proof live
leg is not evidence; only the judged 8-seed replay above is.
- Instrument notes: the `tableLines` capture regex is noisy — its
  "does not come" / "still be here" alternatives match unrelated
  lines (91 of 53006's 95 captured lines are not table beats; the
  real beats were filtered by requiring `◈ THE TABLE` / the seat
  phrasings, leaving 4). The gate classification itself does not
  depend on the say-capture (it reads live `tableSeat()` /
  `tablePreview()` state), so no verdict rests on the noisy lines.
  The analyzer's median was fixed during the run (upper-median →
  proper even-n median, 123 → 114.5, matching the confirm2
  convention) before the evidence was written; the fix touches only
  the summary statistic, not any classified row.
- What the metric did not cover, honestly: the prereg's "name the
  lever that would open it" is answered for both gates (link-forming
  drive for scale; feast drive for the surge), but neither lever was
  tested here — this is a DIAG, and the levers are the next arms'
  work. The sit-action question is answered as "untested" rather
  than "failed": the preview never existed, so no sit count could
  have been measured. That is the correct reading of the prereg's
  critical question, not a dodge of it.

## Balanced panel (§15) and telemetry

DIAG arms take no panel — the comparison here is per-day gate
state inside one replayed leg, not a before/after lever
comparison. No compare `.md` is fabricated, as the prereg
declared. No Game-root change exists in this arm (frozen policy +
pure-read recorder), so no telemetry deviation check applies; the
wall numbers above are the instrument's own.

## What this arm does NOT claim

- Not a "bot never sits" finding: the sit was never reachable, so
  the competent policy's sit behavior is unmeasured. A takeseat
  arm needs a seat-earning seed first.
- Not a "scale is broken" finding: `networkLive` never firing on
  this band is a measurement of this policy on this band, not a
  verdict on the accord system — whether the policy attempts
  accords at all is not in this corpus.
- Not a "feast deed is unearnable" finding: 53005 banked it. The
  deed is earnable; the wave-4-reaching seeds never earned it.
- Not a pellet defect: the reactor beat worked as written (named
  the block, named the out, fired once); the deed stayed unbanked
  for 40 days after the pellet died, which points at the feast
  drive, not the pellet.
- Not a win, not a table, not a seat: 0/8 on all three, same as
  every prior arm on this band.

## Next blanks (for the loop, not this arm)

1. **The regional step, as a lever** — a link-forming drive arm:
   first accord + 21-day seasoning → `networkLive` → regional.
   This is now the binding blank on the winnability chain: the
   pair forms, wave 5 is faced and killed, and the seat still fails
   on scale. Standing points cannot open this door (440 did not).
2. **The feast drive** — hold a feast and spend the surge in a real
   fight on a wave-4-reaching seed (leadfeast family). The deed is
   the second half of the seat, and the competent policy banks it
   on 0/7 wave-4 seeds.
3. **The sit action, once a seat exists** — a takeseat arm on a
   seed (or a lever) that actually earns a seat, so the sit count
   and the seat-taker choice can finally be measured. Until a seat
   is earned, every sit count is 0 by construction.
4. **Why no accord ages 21 days** — accord attempts (or their
   absence) are not in this corpus; a recorder that watches link
   formation would say whether the policy never asks or asks and
   fails.
5. **The veteran-kill announcement** — fourth sighting (day 89,
   The Ugly Beast announced as a veteran kill): the backlog item
   stands; the announcement still cannot be read as a wave-4 signal.

## Proof and commits

- Proof `scripts/test-sitstep-20261107.js`: 23/23 green on this
  worktree before the judged run (12 classifyGate fixtures, 6
  fake-Game sit-wrap checks, 5 live-leg checks: 53006 staged 150d
  reproduces 42 pair days, standing 440, 11 wave-4+ kills, 0 sit
  attempts, 0 instrument errors).
- Prereg committed 30f364275 before any judged sim. The safe-commit
  index clobber hit on the prereg commit and on the proof commit
  (files shown staged-as-deleted after correct commits); repaired
  with HEAD-blob cacheinfo, verified `git status` empty +
  `git diff HEAD` empty + hash-object matches, both times.
- Judged corpus: `evidence/2026-11-07/perseed-sitstep-b/` (8 files,
  staged replay, 0 instrument errors). Analyzer output saved at
  `/tmp/sitstep-analysis.json` (working copy; the evidence file
  above is the record).

## Convergence

**scale-onramp: converging, NOT converged.** The sit step is now
DIAGNOSED, not just observed: the pair-to-seat link fails on two
named gates — scale (never regional on this band) and the feast
surge (never spent on any wave-4 seed) — with the game itself
naming both on day 90. The chain runs end to end through wave-5
kills and stops at the seat. The next work is building, not
measuring: a link-forming drive and a feast drive, then a sit
drive once a seat exists. Until a village is regional and has
spent a surge, the table will keep not coming — and it will keep
saying exactly why.
