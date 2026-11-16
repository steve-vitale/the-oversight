# sim-tricklearn-b — DIAG-NO-GO (on power): trick learning on pure master

Run: fleshout-20261116T1515Z (Loop A), axis winnability chain,
tracker blank #2 DIAG — trick learning. Arm sim-tricklearn-b.
Branch `sim-tricklearn-b` (worktree
`~/workspace/worktrees/sim-tricklearn-b`). Base at arm start:
master `5eedd695b` (prereg). Prereg:
`evidence/2026-11-16/sim-tricklearn-b-prereg.md` (frozen before
any judged sim). DIAG, instrument-only: NO src/js change in this
arm (`git diff HEAD -- src/` empty at closeout).

**Adoption note:** this run adopts the 1315Z run, which died
(timeout + host write flap) with the arm barely started. The
1315Z worker's driver copy had failed mid-flap (0 bytes on disk);
the driver was rebuilt here from the killfail driver per the
frozen prereg, verified against the prereg design, and proven
green (80/80) before the judged legs ran. No number below comes
from the 1315Z run: every judged number is from this run's own
main + replication legs. Master has since moved to `ef8bd7177`;
this arm did NOT rebase (the coordinator owns the rebase at
landing) — report your base: `0054c9d45`.

## Verdict: DIAG-NO-GO (bar 5 fails on power)

Five of the six frozen bars pass. The instrument is valid, the
pipeline is fully decomposed, and the wait question is
under-powered: only **2 wait-window episodes** opened on the
whole band (bar 5 needs ≥ 3), so the window question cannot be
judged — the counts are reported plainly, not re-scored.

| Bar | Result |
|---|---|
| 1. Corpus 16/16 complete | 8/8 main + 8/8 replication parse, 0 instrument errors — PASS |
| 2. Classification coverage: zero unclassified | 0 unclassified events, 0 unclassified learns, 0 `other`-source rows — PASS |
| 3. Neutrality proven (D1 + D2 green, panel no material signal) | D1 true, D2 true, §15 panel no material signal, replication identical — PASS |
| 4. Proof test green | `scripts/test-tricklearn-b.js` 80/80 — PASS |
| 5. Distinguishing power (episodes ≥ 3 AND wave-4+ obs events ≥ 5) | episodes **2**, wave-4+ observation events 126 — **FAIL on power** |
| 6. Population floor (≥ 10 wave-4+ fieldFight rows, main) | 150 fights (1 launched, 149 wild) — PASS |

Proof test `scripts/test-tricklearn-b.js`: **80/80 green** on
this tip (incl. D1 repeatability + D2 wrap neutrality, seed
102141 60d, competent verbatim). D3 drift check
(`scripts/vetparty-drift-check.js`, main vs replication):
**IDENTICAL on all 8 seeds, NO PRE-LEVER DRIFT**. §15 panel
compare main→replication: **review_required, no material
signal** — before=after identical on all 8 paired seeds (every
metric delta 0). The two legs are the same policy on identical
seeds, so the compare is a replication/neutrality check, and it
passes.

## The answer, in plain words

Tricks DO get learned on pure master — 37 of them, including 19
wave-4 tricks and 4 wave-5 tricks, every one at exactly two
observations, exactly as the code promises. But the learning
happens through wild fights, on a timescale of weeks to months
per beast — and the 7-day wait almost never gets a chance to
matter, because the gate almost never holds on the trick at all.

Only two wait windows opened in eight villages over 150 days,
both for the same beast (The Audit), and both expired. In the
first, the village got zero Audit observations in the window —
the one Audit meeting inside it was an evade, and evades record
no observation at all (confirmed live, not just read in code).
In the second, Hannah Kim survived a 10-round fight with The
Audit on the very day the hold opened — observation 1 of 2 —
and the second observation did not arrive for another 59 days.
The wait expired one observation short, 52 days before the
village finally learned the trick.

The deeper starvation is at the gate, not at the observation
step. The gate was consulted only 29 times in 8 villages, and
the trick was unknown in all 29 — yet only 2 of those rows were
trick-holds. Twenty-two rows were 'avoid' (outmatched) while the
village's plan was still in its gathering stage, and 5 of the 7
null rows failed on target, not on trick: the plan named no
beast, or named the wrong wave. A 7-day wait cannot rescue a
hold that never opens. The sibling lever arm
(sim-trickteach-b, Loop B, band 102201–102208) is already
building the threshold 2→1 candidate; these numbers are its
DIAG baseline — but note the baseline's warning: even one
observation per learn would not have saved either window here
(the first window had zero observations; the second had one,
and it was already the first of two under the current rule —
under 2→1 it WOULD have learned on day 49, inside the window).

## Population

- Seeds 102141–102148 (fresh band, verified fresh per prereg),
  150d death-aware, policy competent verbatim (no flags, both
  legs). Anchor `0054c9d45`, policy sha `74a890f0844e`.
- Observation events recorded: **250** (all waves). Wave-3/4/5:
  190. Wave-4+: **126**. Of the 190, **99 progressed the shared
  bar** (58 wave-4/5 + 41 wave-3); the other 91 are non-progressing
  calls — mostly post-learn no-ops (the observation function is
  still called after the trick is known; the bar stays flat).
- Wave-4+ fieldFight rows: **150** (1 launched, 149 wild).
- Gate rows (wave 4/5): **29**.
- Wait-window episodes: **2** (0 learned, 2 expired).
- Tricks learned: **37** (wave-3: 14, wave-4: 19, wave-5: 4).

## The observation pipeline, decomposed (tables (a)–(e))

### (a) Observation counts per villager per monster type, by source

Sources over the 190 wave-3/4/5 events: **fight-observed 184,
scholar-observed 6, taught 0, node-witnessed 0, other 0**.
Every event carries a named source; every learn has a matching
observation trail. The taught channel is dead exactly as the
code reading said: `discoverMonsterCounter` was never called
for a wave-3/4/5 species at all in 150 days on 8 seeds — the
beasttricks topic was never even asked about one, let alone
taught. NODEWITNESS is off by default and stayed off (0
node-witnessed, as expected). The scholar contributed 6
observations; villagers contributed the other 184.

Top contributing villagers (wave-4/5, raw call counts —
including post-learn no-op calls, see the caveat below):

| Villager | Seed | Beast | Calls |
|---|---|---|---|
| Jesse Cortez | 102141 | eulogy | 13 |
| Jesse Cortez | 102141 | eater | 5 |
| Sigrun Eiriksdottir | 102146 | editor | 4 |
| Dale Hoffman | 102147 | suburb | 4 |
| Jesse Cortez | 102141 | cancellation | 3 |
| visjoin_79 | 102144 | eulogy | 3 |
| Sigrun Eiriksdottir | 102146 | reunion | 3 |

76 per-villager wave-4/5 rows across 31 distinct villagers.
Caveat (metric review): raw call counts overstate learning
activity. Jesse Cortez's 13 eulogy calls are 2 progressing
observations (both by Sanne Bakker on the learn day, d97) plus
11 post-learn no-ops — after the village knows the trick, the
observation function keeps being called on every survived
encounter and records obs 2→2. The progressing counts in the
starvation table below are the honest learning measure.

### Observations-to-learn distribution

All 37 learns at exactly **obs 2** (distribution: {2: 37}).
No learn ever took 1 or 3+ observations; no learn lacked a
trail. The threshold-2 rule holds exactly, on every seed, for
every wave. Unlearned species at run end: ad_break reached 4
progressing observations pooled across seeds but never 2 on
any single seed — observations spread thin across seeds is
itself a starvation shape (see the starvation table).

Learn days: wave-3 learns d30–d141, wave-4 learns d79–d144,
wave-5 learns d123–d141. The earliest wave-4 learn is strike
on 102147 (d79); the latest is algorithm on 102142 (d144).
Wave-5 tricks are learned only on the two richest seeds
(102141: cancellation d141; 102146: editor d123; 102147:
editor d126, spoiler d137).

### Trick-known rate at gate checks and at launched fights

Gate checks (wave 4/5, main): **0/29 known** — the village
knew the trick in none of the 29 gate consultations.

| Gate result | n | Known |
|---|---|---|
| avoid (outmatched) | 22 | 0 |
| null | 7 | 0 |
| seek | 0 | — |

By wave: wave-4 gates 28 rows, 0 known; wave-5 gates 1 row
(cancellation, 102147 d124), 0 known.

Launched fights: **0/1 known** (denominator named: exactly
one launched wave-4+ party fight occurred on the band — see
below). Wild comparison: **81/149 known (54.4%)** — wave-4
71/129, wave-5 10/21. Wild fights mostly happen AFTER the
village learned the trick, through the same wild encounters
that taught it; the gate almost never sees a known trick
because it almost never sees a meeting at all.

### Wait-window episode table (every episode)

| Seed | Species | D (first hold) | Outcome | Obs | Fights | Launches | Gate rows |
|---|---|---|---|---|---|---|---|
| 102142 | audit | d94 | expired | 0 | 1 | 0 | 1 |
| 102147 | audit | d49 | expired | 1 | 2 | 0 | 2 |

Both episodes are the same beast, both expired, neither
learned. Within-window activity is nearly empty: no launches
targeted the held species in either window (the launches
column is 0 in both — nobody was sent after the beast the
village was waiting to learn about).

- **102142, audit, D94:** the single in-window fight was an
  evade (Theo Lindqvist, d94, 0 rounds) — and an evade
  records no observation. Zero audit observation events exist
  on this seed at any day. The wait expired with literally
  nothing happening.
- **102147, audit, D49:** Hannah Kim survived a 10-round
  fight (vFlee) on the hold day itself — observation 1 of 2.
  The second observation arrived on d108 (Dale Hoffman) — 59
  days later; the trick was learned d108/109, 52 days after
  the window closed. The other in-window fight (d56) was
  another evade (Tebogo/gen_ccsnxl6, 0 rounds, no
  observation).

### TrickAfter transitions + the starvation table

**23 fights** flipped trickBefore false → trickAfter true —
fights do teach, when the second observation lands inside
one. The teaching fights are wild fights, not launched ones.

Starvation table (fights vs progressing observations per
species, pooled across seeds; fight counts cover wave-4/5
only — the instrument records no wave-3 fights, so wave-3
fight counts are 0 by design, not by absence):

| Species | Wave | Fights | Progressing obs | Learned |
|---|---|---|---|---|
| eulogy | 4 | 30 | 9 | yes |
| reunion | 4 | 14 | 9 | yes |
| buffering | 3 | 0 | 8 | yes |
| callback | 3 | 0 | 7 | yes |
| redactor | 3 | 0 | 7 | yes |
| herald | 4 | 15 | 6 | yes |
| spool | 3 | 0 | 6 | yes |
| suburb | 4 | 24 | 5 | yes |
| algorithm | 4 | 6 | 5 | yes |
| audit | 4 | 16 | 4 | yes |
| eater | 4 | 9 | 4 | yes |
| editor | 5 | 8 | 4 | yes |
| terms_of_service | 3 | 0 | 4 | yes |
| ad_break | 3 | 0 | 4 | **no** |
| cancellation | 5 | 7 | 3 | yes |
| strike | 4 | 5 | 3 | yes |
| focus_group | 3 | 0 | 3 | yes |
| spoiler | 5 | 6 | 2 | yes |
| congregation | 4 | 5 | 2 | yes |
| influencer | 4 | 5 | 2 | yes |
| gavel | 3 | 0 | 2 | yes |

Every wave-4 species was learned on at least one seed, and 3
of 10 wave-5 species. The pipeline is not starved at the
observation step in the aggregate — it is starved at the
gate (few holds) and at the clock (observations arrive weeks
apart per species per seed).

### The one launched fight

Exactly one launched wave-4+ party fight occurred on the
band (102147, d56): Tebogo (gen_ccsnxl6) vs The Audit —
**evade, 0 rounds, 0 damage**, trick unknown before and
after. The fight log's only line: *"Tebogo saw The Audit in
time and gave it room."* The launch left Haven two-strong
(party 2, gate bar 3); the meeting never made contact. This
is the launched-fight story in miniature: the gate's party
bar and the evade path together mean launched wave-4 fights
almost never happen, and when they do they often end before
they begin.

Wild fight outcomes (149 fights): vFlee 106, mFlee 18, vDie
14, vKill 8, evade 4. Eight wild kills — 3 of them with the
trick unknown (herald ×3), so the trick is not a kill
prerequisite. Fourteen villagers died in wild wave-4/5
fights.

## Per-seed table (main leg)

| Seed | Days | End | Standing | Rank | Max wave | Tricks (w4/w5) | Obs events (w4+) | Episodes | Launched / wild fights | Kills |
|---|---|---|---|---|---|---|---|---|---|---|
| 102141 | 150 | survived | 375 | regional | 5 | 4 (2/1) | 30 | 0 | 0 / 33 | 0 |
| 102142 | 151 | survived | 545 | regional | 5 | 3 (2/0) | 8 | 1 exp | 0 / 11 | 0 |
| 102143 | 144 | village-lost | 199 | regional | 4 | 4 (2/0) | 7 | 0 | 0 / 10 | 0 |
| 102144 | 89 | village-lost | 150 | regional | 4 | 3 (1/0) | 5 | 0 | 0 / 6 | 0 |
| 102145 | 151 | survived | 199 | regional | 4 | 2 (0/0) | 0 | 0 | 0 / 0 | 0 |
| 102146 | 133 | village-lost | 490 | regional | 5 | 7 (5/1) | 27 | 0 | 0 / 30 | 0 |
| 102147 | 151 | survived | 440 | regional | 5 | 13 (7/2) | 47 | 1 exp | 1 / 58 | 0 |
| 102148 | 152 | survived | 199 | regional | 4 | 1 (0/0) | 2 | 0 | 0 / 1 | 0 |

Replication leg: identical on every seed (trajectories,
trick rows, wall numbers — see the analyzer's bar 3).

## Wall numbers (both legs, identical)

| Metric | Main | Replication |
|---|---|---|
| Wins (`won`, seat-taken under the policy) | 0/8 | 0/8 |
| National by rank (scaleRank ≥ national) | 0/8 | 0/8 |
| National by standing (≥ 200) | 4/8 | 4/8 |
| Wave-4 unlocks | 8/8 | 8/8 |
| Wave-5 unlocks | 4/8 | 4/8 |
| Median survival | 150.5d | 150.5d |
| Deaths | 612 | 612 |

The scale wall stands in a new shape: standing reaches 200+
on half the band (max 545, seed 102142) and wave 5 unlocks on
4/8, yet scaleRank never leaves regional on any seed — the
standing number and the rank do not move together. Wins 0/8
on both legs.

## What the village looked like

Five of eight villages survived the full 150 days; three
were lost (d89, d133, d144). The villages are not starving:
2 starvation deaths in 612. They are dying in fights — 510
of 612 deaths are monster-kind, and 'villager combat' (296)
plus 'expedition' (98) plus 'combat' (116) account for nearly
all of it. The scholar died 69 times across the band (2–13
per seed) — succession churn is the norm, not the exception,
and every successor inherits the same trick-less gate.

Who thrived: Jesse Cortez (102141) survived thirteen
eulogy encounters and lived to see the village learn it;
Sanne Bakker taught eulogy with two observations on a single
day (d97); Sigrun Eiriksdottir (102146) carried the editor,
reunion, and influencer observations and killed a herald on
d114; Dale Hoffman (102147) killed a strike on d100 and
supplied the Audit's second observation on d108; Hannah Kim
(102147) survived the 10-round Audit fight that opened the
only standing-stage wait window. Who died and why: fourteen
villagers died in wild wave-4/5 fights, and hundreds more in
the ordinary fighting that fills every day — the villages
fight constantly (150 wave-4+ fights, 78 kill-calls on
102141 alone) and mostly flee (106 of 149 wild fights end
vFlee).

What knowledge/capabilities were missing: at the gate, the
trick — 0/29 known. In the field, the second observation —
the villages get the first survived encounter and then wait
weeks for the second (audit: 59 days). As a capability, the
villages lack any way to SEEK the second encounter: no launch
targeted a held species in either window, no plan named the
beast the gate was holding on, and the taught channel (ask
about beasttricks) never fired once. The blank this arm
documents, not fills (DIAG): the wait has nothing to wait
with — no targeted second encounter, no teaching channel,
and a gate that holds on the trick only twice in 1,200
village-days.

## Sense check

The prereg asked for one trick-relevant passage end to end.
The corpus itself carries two, and the contrast between them
is the finding.

First, the learn that did land — seed 102147, day 51, the
Redactor (shown as "Big-Eyes"), via Regina, reproduced from
the identical deterministic trajectory (same seed + policy,
60-day probe; the main leg's say-recorder only captures
veteran lines, so this beat was re-read from the same run):

> 💡 COUNTER LEARNED — Big-Eyes: Go quiet — starve the
> redaction. It redacts the loudest thing first, and the
> handles point a full round before the redaction lands. Go
> quiet for two turns and its attacks come thin; a third
> quiet turn starves it out of the fight. (Striking feeds it
> — every wound gets un-written.) (Regina lived to tell it,
> twice — the village pieced it together.)

That reads like a village piecing a trick together: a named
villager, a twice-lived telling, a concrete counter. Second,
the observation that did NOT land — seed 102147, day 49,
Hannah Kim vs The Audit, 10 rounds, fled alive, observation
1 of 2: there is no line for it at all. The villager's first
observation is silent in the fiction — only the scholar's
own notebook line exists, and only for the scholar. The
Audit's own mechanic did speak that day ("🧾 Audit day —
Hannah's best trick is taxed. Half strength."), so the fight
is narrated and the learning is not. A village that learns by
surviving should be able to hear itself learning the first
time, not only the second. (Appended to the findings
backlog: the silent first observation.)

And the launched fight, end to end — seed 102147, day 56,
Tebogo vs The Audit: *"Tebogo saw The Audit in time and
gave it room."* One line, zero rounds, trick still unknown.
That is what a launched wave-4 meeting looks like when the
gate lets it through.

## Metric review

Pre-registered in the prereg, answered here — no re-scoring:

- Wave-4+ observation events are NOT 0 (126): the pipeline
  is measured, not unmeasured. Bar 5 fails on the episode
  count, not the event count.
- Episodes are 2, not 0: the gate DID hold on the trick
  twice, so the wait question arises — it is under-powered
  (2 < 3), not absent. Both episodes expired; neither learned.
- The launched-fight denominator is 1, not 0: the 0/1
  trick-known rate at launched fights is a finding about the
  competent policy on this band (launches almost never produce
  a wave-4 meeting), not a 0% rate.
- The wild comparison does NOT show wild fights learning
  tricks at the same rate as launched fights: wild fights are
  fought with the trick known 54.4% of the time, launched
  0/1. The starvation is gate/launch-specific, not
  wave-4-wide — the trick pipeline works through wild fights
  and barely exists at the gate.
- Instrument notes (for the next run, not a re-score): (1)
  the trick census is sparse — some days have no row (e.g.
  a 10-day probe gave 8 rows for 11 game-days) — so the
  window-close read uses the first census day ≥ D+7, not a
  literal D+7 row; both episodes had a close census row, so
  no classification was affected. (2) Per-villager
  observation counts include post-learn no-op calls; the
  progressing counts are the learning measure. (3) The
  vetSays recorder does not capture COUNTER LEARNED beats
  (its pattern doesn't match them); the sense-check quote
  above was re-read from the identical deterministic
  trajectory instead.

## Proof, neutrality, panel

- Proof test `scripts/test-tricklearn-b.js`: 80/80 green —
  static (no src change, wave-3/4/5 id sets match the data,
  all five taxonomy anchors hold), source/observations-to-
  learn/trick-hold/wait-window/TrickAfter unit fixtures,
  live recorder shape on 5d + 150d runs, D1 + D2 at 60d on
  seed 102141 under competent verbatim.
- D3 drift check: IDENTICAL on all 8 seeds.
- §15 panel compare: `evidence/2026-11-16/tricklearn-b-panel.md`
  (before/after gzipped panels alongside it). Decision
  review_required with no material signal — every metric
  delta 0; the "review" is the scorecard's default for
  descriptive/not-observed metrics, not a signal.
- Analyzer: `scripts/analyze-tricklearn-b.js` →
  `evidence/2026-11-16/tricklearn-b-analysis.json` (exit 1,
  bar 5 only). Corpora:
  `evidence/2026-11-16/perseed-tricklearn-b-main/` and
  `.../perseed-tricklearn-b-replication/` (8 files each).
- Canon gap (recorded, not invented): no canon doc covers
  trick-learning rates — how fast observations accumulate,
  how often a trick is learned, or what a trick-wait should
  cost. This arm measured the rates (37 learns, all at obs
  2; second observations weeks apart) without inventing canon
  for them.

## Lever candidate handoff (named, NOT built)

Per the prereg, the next round's lever is pre-registered only
as a candidate here: the pipeline's dominant starvation point
is the gate, not the observation step — holds open twice in
1,200 village-days, and the second observation takes weeks.
The sibling Loop B arm (sim-trickteach-b, band 102201–102208)
is already building the threshold 2→1 candidate; this arm's
numbers are its DIAG baseline (launched wave-4+ party kill
rate on this band: 0/1 launched fights, 8/149 wild kills).
The baseline's warning to that arm: 2→1 would have saved
exactly one of the two windows here (102147 audit, whose
single in-window observation was already obs 1/2) and none
of the gate's missing holds — a threshold cut treats the
clock, not the gate. If the follow-up arm wants the gate
question, the episode table above is its input: 22/29 gate
rows avoid from 'party' stage, 5/7 nulls fail on target.
