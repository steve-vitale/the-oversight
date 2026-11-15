# sim-funeral-mend-b — BUILD the funeral mend: the rite that mends every shaken link

Loop B run `fleshout-loop-b-20261115T0411Z`, axis winnability chain. Arm sim-funeral-mend-b.
Prereg: `evidence/2026-11-14/sim-funeral-mend-b-prereg.md` (committed `0404fe1b7` — binds).
Branch: `sim-funeral-mend-b`. Base master `7ba58d326` (fast-forwarded from `652979c54`; no src/ changes in between).

## The lever, in plain words

Every time Haven's speaker dies, every link Haven has loses 8 trust at
once — and the realm falls apart the same day a link drops under 40.
The last arm proved the tending machinery works but the villages still
die in combat while national; the deaths themselves were the dissolver.
This build puts the repair where the damage happens: at the funeral.
The village mourns together, opens a funeral feast from the pantry —
1,500 kcal of grain per shaken link, the same price as a tend — and the
feast buys the −8 haircut back on every link the funeral shook. The
funeral says so aloud: it names the dead, names every mended fire, and
states the feast's cost. Nothing is free — a thin pantry mends in
proportion, an empty pantry mends nothing and says so — and nothing else
about the funeral changes: the 7-day mourning, the tribute moves, and
the neglect snap all stand exactly as before.

The build (in `src/js/hierarchy.js`, the one place the funeral shakes
links — see diagnosis below) does one thing: after `onLeaderDeath`
shakes the links, the rite mends every link `successionCrisis`
returned `'shaken'` for — 1,500 kcal each via `_removePantryKcal`,
trust back through `_trustGain` with the mourning window lifted for the
rite itself (the SUCCGRACE-beat pattern), counters at
`state.village.funeralMendStats`. Links with a staged beat (young-link
grace, SUCCGRACE), peer-league links (their crisis beat is their
repair), already-grieving links (no new haircut), and broken links are
skipped — a link gets the beat OR the mend, never both. Flag
`FUNERALMEND`, default ON; `'0'` restores the old funeral exactly.

## Where the funeral shakes links (diagnosis)

Read first, before building. `onLeaderDeath(vid)` (hierarchy.js:1845,
wired into `registerDeath`) says the funeral line and loops over
Haven's links, calling `successionCrisis` per vassal/lead link and
`covenantCrisis` per peer link. `successionCrisis` per link: −8 trust,
7-day mourning (gagging all gains via `_trustGain`), tribute moves
(grief leverage ×1.5 up when Haven is subordinate, tribute pressed down
×0.75 when Haven is primary), neglect snap only for trust < 20 with no
upkeep for 14+ days. The realm dissolves later, in the daily national
check, when no qualifying polity remains and no beat is pending — so a
mend that restores trust inside the funeral itself, before the next
daily check, can keep the realm from ever falling. Counted on the pilot
OFF leg: Haven funerals 50 across 8 seeds (3, 5, 5, 4, 13, 8, 5, 7);
their-speaker deaths 0 — the funeral is where the shakes live on this
band. `theirLeaderDied` shakes (word of another village's speaker) are
out of scope by design: no funeral at Haven.

## SUCCGRACE / SUCCPOLITY state in the corpus env (verified, not assumed)

The per-seed corpus files carry NO `env` field (checked: no `env` key,
no SUCCGRACE/SUCCPOLITY strings in any file under
perseed-answercourt-confirm-b or perseed-holdbuild-b-pilot-off).
Verified instead from the drivers + the gates: the corpus drivers set
NO SUCCGRACE/SUCCPOLITY env vars, and both gates are opt-in
(`process.env.SUCCGRACE === '1'` / `SUCCPOLITY === '1'`,
hierarchy.js:311/320; browser `process` undefined → OFF). The corpus
therefore ran with BOTH OFF, and this arm's legs run the same way.
Composition is designed in anyway: the mend skips any link with
`pendingRenegotiation` (beat OR mend, never both), and SUCCPOLITY adds
zero trust — it only changes which number the polity bars read for 14
days — so the two never stack.

## Baseline (committed corpus)

`evidence/2026-11-14/perseed-answercourt-confirm-b/` — 16 seeds × armed
competent-answercourt-b, 150 days. Armed leg: national ever 13/16;
national held-days per seed 90, 0, 28, 71, 7, 72, 30, 57, 0, 0, 68, 77,
43, 19, 58, 34 (median 38.5); dissolutions 7 (series-counted); re-climbs
2 (100208 d113, 100211 d127); starvation armed 6 vs baseline 3; median
survival armed 121.5d. Pilot band (100201–100208) corpus median national
held-days 43.5; dissolutions 4.

## Stage 0 — reproduction (PASS 3/3, twice)

Re-ran seeds 100201, 100203, 100212 armed with the UNMODIFIED recovered
driver (scripts/repro-holdbuild-driver.js) and FUNERALMEND=0: every
judged field identical to the corpus files (only `anchorCommit` differs
by construction). Then re-ran the same three seeds with the NEW driver
(scripts/repro-funeralmend-driver.js, with the additive `fm` raw field):
PASS 3/3 again, zero field diffs — the `fm` raw read does not diverge
the run (recorder lesson honored: `state.village.funeralMendStats`
read raw, never through a method).

## Proof test — scripts/test-funeral-mend-b.js (7/7)

Static leg (diff confined to src/js/hierarchy.js) + game legs on the
holdbuild fixture pattern (`Game.mshipState()` links, stocked pantry,
`Game.onLeaderDeath` driven directly with the player's id; links
seasoned, 40+ days old, at encounter-realistic trust 42/45/48):
mend-on (three shaken links all mended +8 at one funeral, 4,500 kcal
charged, counters 1/3/4500, voiced line names the dead + all three
villages; mourning day+7 and the tribute press-down 4000→3000 still
land), mend-off (FUNERALMEND=0: trusts 34/37/40, pantry untouched, no
counters, no mend line — the funeral line itself still fires),
mend-thin (2,000 kcal pantry: A +8, B +3, C unmended; shortfall line
names C's fire aloud), mend-beat-skipped (young link's grace beat
staged, mend skips it while the others mend), mend-grieving (no new
haircut, no mend inside the mourning window), mend-covenant-skipped
(covenant link shakes −10 through its own crisis beat; the mend never
touches it). Run on the branch tip after every rebase; 7/7 at commit
`4a3c0cfd`.

## Pilot (8 seeds 100201–100208, armed policy, 150d)

Pilot gate (all three, from the prereg): (i) mechanism fires (mend
counter > 0 AND at least one funeral mends ALL shaken links on the
band); (ii) cost bar clean (starvation pooled ON ≤ OFF + 2 AND median
survival ON ≥ 0.8× OFF); (iii) dissolutions ON < OFF AND pilot median
national held-days ON ≥ 48 (corpus pilot median 43.5 × 1.1).

### Pilot OFF leg (control — re-validates the driver vs corpus)

The OFF leg reproduces the corpus EXACTLY on the pilot band: national
held-days per seed 90, 0, 28, 71, 7, 72, 30, 57 (median 43.5), the
100208 re-climb at d113, national-ever 7/8, dissolutions 4, starvation
3, median survival 134.5d. The instrument is sound.

| seed | days | end | maxWave | scale end | natDay | held-days | dissolutions | re-climb | starv | combat deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100201 | 150 | survived | 4 | national | 62 | 90 | — | — | 0 | 47 |
| 100202 | 120 | village-lost | 5 | regional | — | 0 | — | — | 0 | 104 |
| 100203 | 150 | survived | 5 | regional | 62 | 28 | d90 | — | 1 | 68 |
| 100204 | 140 | village-lost | 4 | regional | 68 | 71 | d139 | — | 1 | 86 |
| 100205 | 68 | village-lost | 4 | national | 62 | 7 | — | — | 0 | 43 |
| 100206 | 137 | village-lost | 5 | regional | 62 | 72 | d134 | — | 0 | 59 |
| 100207 | 103 | village-lost | 4 | national | 74 | 30 | — | — | 1 | 62 |
| 100208 | 132 | village-lost | 5 | national | 64 | 57 | d101 | d113 | 0 | 55 |

OFF aggregates: national-ever 7/8; median survival 134.5d; starvation
pooled 3; total deaths 608 (villager combat deaths 524); dissolutions 4;
re-climbs 1; funerals 50 (linkLines); mend counters 0/0/0; engine tends
31; policy tends 72; wave-5 unlocked 4/8; wave-4 8/8; wins 0; table 0.

### Pilot ON leg

| seed | days | end | maxWave | scale end | natDay | held-days | dissolutions | re-climb | starv | combat deaths | mend funerals/links/kcal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100201 | 150 | survived | 5 | national | 62 | 89 | — | — | 0 | 56 | 4 / 15 / 22,500 |
| 100202 | 80 | village-lost | 4 | regional | — | 0 | — | — | 0 | 57 | 2 / 4 / 6,000 |
| 100203 | 112 | village-lost | 5 | national | 63 | 50 | — | — | 0 | 82 | 5 / 15 / 22,140 |
| 100204 | 150 | survived | 4 | national | 68 | 83 | — | — | 0 | 101 | 5 / 14 / 21,000 |
| 100205 | 68 | village-lost | 4 | national | 62 | 7 | — | — | 0 | 43 | 2 / 6 / 9,000 |
| 100206 | 137 | village-lost | 5 | national | 62 | 76 | — | — | 0 | 75 | 5 / 17 / 25,500 |
| 100207 | 133 | village-lost | 5 | national | 74 | 60 | — | — | 0 | 88 | 3 / 10 / 15,000 |
| 100208 | 133 | village-lost | 4 | national | 64 | 70 | — | — | 0 | 40 | 4 / 12 / 18,000 |

ON aggregates: national-ever 7/8; median national held-days **65**
(89, 0, 50, 83, 7, 76, 60, 70 → median (60+70)/2); median survival
133d; starvation pooled **0**; total deaths 629 (villager combat deaths
542); **dissolutions 0**; re-climbs 0 (nothing dissolved, so nothing to
re-climb); mend counters: 30 mending funerals, **93 links mended**,
139,140 kcal of funeral feast; mend-all funerals 18 of 18 mend lines
(every funeral that mended anything mended ALL its shaken links);
shortfall lines 0; end-state national 7/8 (vs 4/8 OFF); engine tends 21;
policy tends 67; wave-5 unlocked 4/8; wave-4 8/8; wins 0; table 0.

### Pilot verdict — GO (gate passes 3/3)

- (i) Mechanism fires: 93 links mended across 30 funerals, 18
  mend-all funerals observed in linkLines — **PASS**, and not
  marginally: every mend line on the band is a mend-all.
- (ii) Cost bar: starvation ON 0 ≤ OFF 3 + 2 = 5 ✓; median survival ON
  133 ≥ 0.8 × 134.5 = 107.6 ✓ — **PASS**. The feast is a real cost
  (139,140 kcal band-wide, ~17k per seed) yet starvation FELL to zero.
- (iii) Dissolutions ON 0 < OFF 4 ✓ AND median held-days ON 65 ≥ 48
  ✓ — **PASS**. The dissolution companion bar works as designed: the
  realm never fell apart on any pilot seed, and held-days rose 43.5 →
  65 at the same time.

The gate passes on all three → proceed to confirm. Per-seed pairing
is approximate, not exact (the mend changes the RNG stream: the feast
spends pantry food and changes fights — 100202 ON died at day 80 vs
120 OFF; 100203 ON died at 112 while national vs survived 150 OFF).
The gate compares band medians, which absorbs that, but per-seed
stories must not be read as paired counterfactuals.

## Confirm (16 seeds 100201–100216, 150d, ON + OFF, 32 runs)

Confirm GO (all three, on the 16-seed confirm):
- P1 DISSOLUTIONS: dissolutions ON **0** < OFF 7 — **PASS**.
- P2 HOLD: median national held-days ON **63.5** ≥ 47 (corpus median
  38.5 × 1.2 = 46.2) — **PASS**.
- COST: starvation pooled ON **0** ≤ OFF 6 + 2 = 8 ✓ (arm-only
  per-seed: ON is 0 on every seed) AND median survival ON **130d** ≥
  0.8 × 121.5 = 97.2 ✓ — **PASS**.

### Confirm OFF leg (control — reproduces the committed corpus exactly)

The OFF leg reproduces the corpus on the FULL 16-seed band, not just
the pilot: national-ever 13/16, median held-days 38.5, dissolutions 7,
re-climbs 2, starvation 6, median survival 121.5d — every number
identical to the holdbuild prereg's corpus numbers. The first 8 seeds
also reproduce the pilot OFF files exactly (determinism check: held-days
and deaths identical per seed). The control is rock solid.

| seed | days | end | maxWave | scale end | natDay | held-days | dissolutions | re-climb | starv | combat deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100201 | 150 | survived | 4 | national | 62 | 90 | — | — | 0 | 47 |
| 100202 | 120 | village-lost | 5 | regional | — | 0 | — | — | 0 | 104 |
| 100203 | 150 | survived | 5 | regional | 62 | 28 | d90 | — | 1 | 68 |
| 100204 | 140 | village-lost | 4 | regional | 68 | 71 | d139 | — | 1 | 86 |
| 100205 | 68 | village-lost | 4 | national | 62 | 7 | — | — | 0 | 43 |
| 100206 | 137 | village-lost | 5 | regional | 62 | 72 | d134 | — | 0 | 59 |
| 100207 | 103 | village-lost | 4 | national | 74 | 30 | — | — | 1 | 62 |
| 100208 | 132 | village-lost | 5 | national | 64 | 57 | d101 | d113 | 0 | 55 |
| 100209 | 91 | village-lost | 5 | regional | — | 0 | — | — | 0 | 60 |
| 100210 | 121 | village-lost | 4 | regional | — | 0 | — | — | 0 | 57 |
| 100211 | 150 | survived | 4 | national | 63 | 68 | d107 | d127 | 0 | 74 |
| 100212 | 150 | survived | 5 | regional | 65 | 77 | d142 | — | 0 | 47 |
| 100213 | 104 | village-lost | 5 | national | 62 | 43 | — | — | 0 | 76 |
| 100214 | 80 | village-lost | 5 | national | 62 | 19 | — | — | 0 | 80 |
| 100215 | 122 | village-lost | 4 | national | 65 | 58 | — | — | 0 | 74 |
| 100216 | 105 | village-lost | 4 | regional | 63 | 34 | d97 | — | 3 | 69 |

OFF aggregates: national-ever 13/16; end-state national 8/16; median
survival 121.5d; starvation pooled 6; total deaths 1225 (villager
combat deaths 1061); dissolutions 7; re-climbs 2; funerals 95;
engine tends 58; policy tends 188; wave-5 unlocked 8/16; wave-4 16/16;
wins 0; table 0.

### Confirm ON leg

| seed | days | end | maxWave | scale end | natDay | held-days | dissolutions | re-climb | starv | combat deaths | mend funerals/links/kcal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100201 | 150 | survived | 5 | national | 62 | 89 | — | — | 0 | 56 | 4 / 15 / 22,500 |
| 100202 | 80 | village-lost | 4 | regional | — | 0 | — | — | 0 | 57 | 2 / 4 / 6,000 |
| 100203 | 112 | village-lost | 5 | national | 63 | 50 | — | — | 0 | 82 | 5 / 15 / 22,140 |
| 100204 | 150 | survived | 4 | national | 68 | 83 | — | — | 0 | 101 | 5 / 14 / 21,000 |
| 100205 | 68 | village-lost | 4 | national | 62 | 7 | — | — | 0 | 43 | 2 / 6 / 9,000 |
| 100206 | 137 | village-lost | 5 | national | 62 | 76 | — | — | 0 | 75 | 5 / 17 / 25,500 |
| 100207 | 133 | village-lost | 5 | national | 74 | 60 | — | — | 0 | 88 | 3 / 10 / 15,000 |
| 100208 | 133 | village-lost | 4 | national | 64 | 70 | — | — | 0 | 40 | 4 / 12 / 18,000 |
| 100209 | 109 | village-lost | 4 | national | 84 | 26 | — | — | 0 | 59 | 5 / 15 / 22,500 |
| 100210 | 150 | survived | 5 | national | 70 | 82 | — | — | 0 | 66 | 6 / 16 / 24,000 |
| 100211 | 124 | village-lost | 4 | national | 63 | 62 | — | — | 0 | 68 | 4 / 13 / 17,813 |
| 100212 | 150 | survived | 5 | national | 65 | 88 | — | — | 0 | 43 | 5 / 20 / 30,000 |
| 100213 | 117 | village-lost | 5 | national | 62 | 56 | — | — | 0 | 82 | 4 / 16 / 24,000 |
| 100214 | 62 | village-lost | 4 | regional | — | 0 | — | — | 0 | 64 | 2 / 7 / 10,500 |
| 100215 | 134 | village-lost | 4 | national | 65 | 70 | — | — | 0 | 85 | 4 / 20 / 30,000 |
| 100216 | 127 | village-lost | 4 | national | 63 | 65 | — | — | 0 | 92 | 5 / 17 / 25,064 |

ON aggregates: national-ever **14/16** (vs 13/16 OFF); end-state
national **14/16** (vs 8/16); median national held-days **63.5**
(89, 0, 50, 83, 7, 76, 60, 70, 26, 82, 62, 88, 56, 0, 70, 65 → median
(62+65)/2); median survival 130d (vs 121.5d); starvation pooled **0**
(vs 6); total deaths 1273 (villager combat deaths 1101, vs 1061);
**dissolutions 0** (vs 7); re-climbs 0 (nothing dissolved, so nothing
to re-climb); mend counters: **65 mending funerals, 217 links mended,
323,017 kcal** of funeral feast; mend-all funerals 41 of 41 mend lines;
shortfall lines 0; engine tends 40; policy tends 160; wave-5 unlocked
7/16 (vs 8/16); wave-4 16/16; wins 0; table 0. The first 8 seeds
reproduce the pilot ON files exactly (determinism check).

Per-seed stories worth naming: 100209 ON reached national at day 84
(OFF never reached it — died day 91 regional); 100210 ON survived 150
with 82 held-days (OFF died day 121, never national); 100211 ON held
62 with no dissolution (OFF dissolved d107, re-climbed d127, held 68);
100212 ON survived 150 with 88 held-days and no dissolution (OFF
dissolved d142, held 77); 100216 ON held 65 with no dissolution (OFF
dissolved d97, held 34, starved 3). The two seeds that never reached
national ON (100202, 100214) died early in combat (80d, 62d) before
the court could sit — the mend cannot fix a village that dies before
national exists.

### Confirm verdict — GO

All three pre-registered bars pass: dissolutions 0 < 7, median
held-days 63.5 ≥ 47, cost clean (starvation 0 ≤ 8, median survival
130 ≥ 97.2). The build stays live as default game behavior. The
balanced-panel compare (`evidence/2026-11-14/funeralmend-panel.{json,md}`
+ `-before`/`-after` `.json.gz`) says **review_required**; the only
material signals are villageDeaths per run (76.56 → 79.56, delta +3,
95% CI [−7.44, +12.44]) and per 100 days (+2.23, CI [−2.77, +8.36]) —
both intervals include zero, and both are the same combat-death
confound as holdbuild (total deaths ON 1273 vs OFF 1225 while
starvation fell 6 → 0 — the extra deaths are combat, not feast cost).
National scale access 0.5 → 0.875, no material signal. The panel is the
instrument; the pre-registered bars are the judge, and they say GO.

Death-cause shares (from the per-seed `deaths` arrays): OFF — villager
combat 46.8%, combat 19.7%, expedition 15.3%, the wild 11.4%,
starvation 0.5% (6/1225); ON — villager combat 44.5%, combat 20.0%,
expedition 16.8%, the wild 11.6%, starvation 0.0% (0/1273). Combat and
the wild dominate both legs; starvation is a rounding error OFF and
absent ON.

## Sense-testing — do the funerals say why the fire holds?

Yes — and the lines name the dead, every mended fire, and the feast's
cost, in the same breath. From the ON leg linkLines:

> "🕯️ Consuelo's funeral feast: 4,500 kcal from the pantry, and every
> shaken fire is fed — Emberhold, Ashford, Stonebridge. The village
> mourns together, and the links hold because the dead are honored, not
> because the grief was forgotten. (Trust mended — the -8 bought back
> with grain.)" (100201 d54)
>
> "🕯️ Carmen's funeral feast: 6,000 kcal from the pantry, and every
> shaken fire is fed — Emberhold, Ashford, Stonebridge, Thornfield. The
> village mourns together, and the links hold because the dead are
> honored, not because the grief was forgotten." (100201 d78)
>
> "🕯️ Theo's funeral feast: 4,140 kcal from the pantry, and every
> shaken fire is fed — Emberhold, Stonebridge, Thornfield." (100203 d82)

The holdbuild sense gap is closed: the mend is voiced at the funeral
itself, with the dead named first and the reason given ("the links hold
because the dead are honored"). One honesty wrinkle, recorded not
hidden: the d82 line's 4,140 kcal is a partial payment (one link paid
less than the full 1,500 — its gain was +6, not +8), yet the line still
says "every shaken fire is fed". That is true — every fire got grain —
but the line does not distinguish a full mend from a partial one; the
per-link note carries the exact gain. A follow-up polish could state
partial gains in the line itself. No shortfall line fired on the pilot
band (0 shortfall lines): no funeral ever found the pantry empty for a
shaken link.

The 100203 story in full (ON): Wyatt dies d35, feast 4,500, all three
fires fed → realm holds; Rubel dies d63, feast 4,500 → holds; Theo
dies d82, feast 4,140 (partial) → holds to day 112, when the village
dies out in combat while national (held 50 days). Compare OFF, where
the same seed dissolved at d90 and survived to 150 regional. The mend
does not save the village from combat — it saves the realm from the
funeral.

## Reachability verdict (confirm)

Waves 1–5 reachable on both legs (wave-5 unlocked OFF 8/16, ON 7/16;
wave-4 16/16 both). Regional 16/16 both legs. National-ever OFF 13/16,
ON 14/16; national at end-state OFF 8/16, ON 14/16. Global 0/16 both
(viewership bar never met in 150d on this band). The table: 0/16 both,
no seat takes, no table choices. Wins: 0/16 both. Arc reach (series
`arc` max): Arc IV on all 32 confirm runs. Four-realm formation /
vesting: not instrumented by this driver — not observed, not claimed.
The scale wall moves one notch: national now HOLDS (0 dissolutions on
16 seeds) and ends the run standing on 14 of 16 villages, but the table
is still unreached and nothing has won.

## Village assessment (plain words)

Eight villages, two versions of each. Without the mend, the realm is a
fair-weather thing: it stands until someone important dies, and then a
single funeral can knock a link under the line and the whole realm
falls apart the same day — four times in eight villages. With the mend,
every funeral becomes a feast instead of a collapse: thirty funerals
fed ninety-three shaken links, and not one realm fell apart. The
villages still die at the same rate — dying in combat while national is
what now ends most holds, not dissolution — and the feast costs real
food, about seventeen thousand kcal per village over the season, yet no
one starved for it. The people who thrive are still the ones who
survive the fights: the two survivors held national 89 and 83 days.
What was missing was not tending — it was a funeral that repairs
instead of only wounding. The blank this arm filled is the rite itself:
the dead are honored, the fires are fed, and the realm holds through
the grief. The blank it documents for the next arm is combat survival
while national — the villages now die holding their realm, and the
table is still a season away.

## Metric review

The bars measured the hold, and the dissolution companion bar earned
its keep. P1 (dissolutions) and P2 (median held-days) moved TOGETHER —
dissolutions 7 → 0, held-days 38.5 → 63.5 — so the holdbuild conflation
(held-days dragged by combat deaths while the hold itself worked) did
not recur: the build stops realms falling apart AND the holds lengthen.
The cost bar held with room to spare (starvation 6 → 0, median survival
121.5 → 130). Three notes for the next arm: (1) the per-funeral feast
cost (1,500 kcal/link, ~20k/seed on the confirm band) was affordable —
starvation fell to zero — so cost was not the binding constraint; the
binding constraint is now combat survival while national (villages die
holding their realm: 100203 ON died at 112 national, 100207 at 133
national). (2) The mend-line/linkLines 600 cap: only 41 of 65 mending
funerals have a mend line in the files (the cap fills on talkative
seeds), so line counts understate funerals — the `fm` counters are
authoritative, the lines are the sense-test. (3) The partial-payment
honesty wrinkle (100203 d82: 4,140 kcal line still says "every shaken
fire is fed" — true, each got grain, but the partial gain lives only in
the per-link note). A follow-up polish could state partial gains in the
line itself. The OFF leg reproduced the corpus exactly on all 16 seeds
and both legs reproduced their pilot files exactly on the shared 8 —
the instrument is deterministic and the verdict rests on a solid
control. The panel's villageDeaths regression_watch is the combat-death
confound, not a build cost: total deaths rose 1225 → 1273 while
starvation fell 6 → 0, and both panel intervals include zero.

## Wall numbers (confirm)

Confirm OFF: national-ever 13/16, end-state national 8/16, table 0/16,
wins 0/16, wave-4 unlocked 16/16, wave-5 8/16, median survival 121.5d.
Confirm ON: national-ever 14/16, end-state national 14/16, table 0/16,
wins 0/16, wave-4 16/16, wave-5 7/16, median survival 130d. The wall
moves one notch: national now holds through funerals (0 dissolutions on
16 seeds) and ends the run standing on 14 of 16 villages; the table is
still unreached and nothing has won. The next binding constraint is
combat survival while national, not the realm falling apart.

## Files changed (branch `sim-funeral-mend-b`)

- `src/js/hierarchy.js` — the build only (committed `4a3c0cfd`).
- `scripts/test-funeral-mend-b.js` — proof test: 7/7 PASS.
- `scripts/funeralmend-driver-20261114.js` — judged driver (copy of the
  holdbuild FIXED driver + `fm` raw field).
- `scripts/analyze-funeralmend-b.js` — analyzer (mend attribution).
- `scripts/build-funeralmend-panels-20261114.js` — panel builder.
- `scripts/repro-funeralmend-driver.js` — driver verification (3/3).
- `evidence/2026-11-14/sim-funeral-mend-b-prereg.md` — the binding
  prereg (committed `0404fe1b7`).
- `evidence/2026-11-14/perseed-funeralmend-b-pilot-off/` — pilot OFF leg
  (8 files, 100201–100208).
- `evidence/2026-11-14/perseed-funeralmend-b-pilot-on/` — pilot ON leg
  (8 files, 100201–100208).
- `evidence/2026-11-14/funeralmend-b-analysis-pilot-off.json`,
  `funeralmend-b-analysis-pilot-on.json` — analyzer output per pilot leg.
- `evidence/2026-11-14/perseed-funeralmend-b-off/` — confirm OFF leg
  (16 files, 100201–100216).
- `evidence/2026-11-14/perseed-funeralmend-b-on/` — confirm ON leg
  (16 files, 100201–100216).
- `evidence/2026-11-14/funeralmend-b-analysis-off.json`,
  `funeralmend-b-analysis-on.json` — analyzer output per confirm leg.
- `evidence/2026-11-14/funeralmend-panel.{json,md}`,
  `funeralmend-panel-before.json.gz`,
  `funeralmend-panel-after.json.gz` — §15 pseudo-panel compare
  (decision review_required; only signals villageDeaths regression_watch,
  both intervals include zero — the combat-death confound, not a build
  cost).

## Final checks

- `scripts/test-funeral-mend-b.js`: 7/7 (on the branch tip; re-run after
  the final rebase — see below).
- `node scripts/check.js --quick`: once at the end on the branch (see
  below).
