# sim-vetfinish-b — verify the landed committed finish on the grind band + build the constructed wall-delivery instrument

- Arm: sim-vetfinish-b (Loop B, BUILD arm, run fleshout-loop-b-20261109T2330Z)
- Branch: sim-vetfinish-b; base anchor `65fef6d7e` (worktree `~/workspace/worktrees/sim-vetfinish-b`)
- Prereg: evidence/2026-11-09/sim-vetfinish-b-prereg.md (committed `9e7e8478d`
  BEFORE any judged computation in this run). Instruments:
  `scripts/vetfinish-instrument-20261109.js` (harvest),
  `scripts/test-vetfinish-b.js` (proof, **39 passed, 0 failed**).
- Master moved under the branch after start: `65fef6d7e` → `0b2e37220`
  (foodrung adoption, DIAG zero src/js; intervening src/js change is
  journey-succession r166 askfavor dialogue only). The coordinator rebases
  at landing; this run did NOT rebase or merge.
- Verdict: **primary NO-GO (narrow, metric-confounded) — 0.48 vs the 0.50
  bar — on a lever that converts 91% of what it accepts.** The wild
  question closes as engine-proven / field-unmeasurable, same as adopt-a.
  Zero src/js changes in this arm (instrument + proof + evidence + corpora
  only). No gate / price / deed / readyDemand / win-price change; no
  rounds-cap or armor-piercing change.

## Premise correction (the headline — read this first)

The COMMITTED field finish named in sim-findings.md #1841 is ALREADY BUILT
and landed: commit `8a4ce0eab` (sim-finishersize-a, 2026-11-06) is an
ancestor of this branch's base. It was proven 89/89 at engine level and
adopted by sim-finishersize-adopt-a (2026-11-07). This arm did NOT rebuild
it. It did the adopt arm's named next step instead: it built the
constructed wall-delivery instrument (harvest + re-drive through the real
engine) and judged the committed finish on the addressable-window
conversion rate — plus a verification leg of the landed finish on the
grind band. #1841 should be marked built-and-measured, not re-assigned.

## The band does not reproduce (reported, not hidden)

The before-leg re-ran band 99641–99648 on current master (base `65fef6d7e`,
FS landed). Same seeds, different master — the sims diverged hard:

| Measure | grind-a (anchor `2d05b64e330c`, 2026-11-06) | vetfinish before-leg (anchor `9e7e8478d861`) |
|---|---|---|
| Wave-4 field fights | 128 | 168 |
| Field wave-4 kills | 1 | 9 |
| Below-break meetings (entry < 15%) | 1 | 11 |
| Below-break kills | 1 | 8 |
| Contact finishes attempted / kills | 1 / 1 | 8 / 4 |
| FS met-below-break commits | 0 (no rule) | 0 |
| Wave-4 kills, all channels | 18 | 27 |
| Wave-5 unlocks | 1/8 | 4/8 |
| Wave-5 kills | 2 | 0 |
| Median survival | 128.5d | 116.5d |
| Scholar deaths | 70 | 86 |
| Scale rank | village 8/8 | regional 8/8 |

The 1/128 baseline that motivated this arm does not exist on current
master: the field now kills 9/168 on the same seeds, with 11 below-break
meetings. The rank change is a MEASUREMENT-SYSTEM change, not villages
climbing: the Standing ladder (leg 1, live 2026-11-08) re-cut the rank
thresholds — seed 99648 reads 'regional' at standing 100 here, where
grind-a read 'village' at standing 150. Rank fields are not comparable
across the two masters; standing, kills, and survival are. Per the
coordinator's note, this shift is reported here rather than silently
re-run: the before-leg numbers ARE the current-master numbers, anchored
to `65fef6d7e`.

## Before-leg (wild verification, current master, FS landed)

Analyzer: `scripts/finishersize-analyze-20261106.js` on
`evidence/2026-11-09/perseed-vetfinish-b/*vetfinish-before.json`
(8 files, instrument errors 0). Competent policy verbatim, 150d
death-aware, seeds 99641–99648 (re-used grind band, never claimed fresh).

| Primary (FS funnel) | Value |
|---|---|
| Below-break meetings (wave-4 field) | 11 |
| Below-break kills | 8 (vKill 8, vFlee 2, vDie 1) |
| Committable meetings | 8 |
| FS met-below-break commits | **0** |
| FS committed kills | **0** |
| Twoblow commits (kind 'two-blow') | 1 |
| Above-tail meetings / above-tail commits | 4 / 0 |
| No-commit reasons | above-tail 4, volley-damage 1, no-instrument 1 |
| Field-fighter deaths (wave-4+ field vDie) | 15 |
| Addressable \|A\| (adopt-a definition) | 2 |
| Addressable convertible \|C\| | **0** |
| Addressable committed / committed kills | 0 / 0 |
| Conversion rate (wild) | unjudgeable (0 convertible) |

The 2 addressable wild meetings both killed WITHOUT the FS commit:

| Meeting | Shape | Outcome |
|---|---|---|
| 99643 d112 influencer, 76 HP | contact 14 (post 62 > 3×14), engage, 100% HP | vKill in 9 rounds, 84 dealt — twoblow took the commit over mid-fight (kind 'two-blow'); Wei worked the trick on rounds 2–3 and finished it |
| 99645 d85 herald, 89 HP | contact 22 (post 67 > 3×22=66, by 1 HP), engage, 97% HP | vKill in 5 rounds, 107 dealt — ordinary rounds; the beast never fled (see the mCanFlee finding below) |

The other below-break meetings: 4 killed by the contact strike outright
(1-HP wall-delivered heralds, 4 seeds), 1 volley kill (99644 d104 herald,
1 HP, 0 rounds), 1 no-instrument, 1 volley-damage exclusion, 2 fighter
flights (99643 d112 influencer 118 HP, 99646 d127 reunion 128 HP — the
fighter fled with 12–14 HP left; the commit correctly declined, post >
3× strike, and holding would have killed the fighter).

Per-seed before-leg (analyzer):

| Seed | Days | End | MaxWave | Standing | Rank | W4 kills | W4 field | Scholar deaths |
|---|---|---|---|---|---|---|---|---|
| 99641 | 103 | lost | 5 | 300 | regional | 6 | 15 | 13 |
| 99642 | 150 | survived | 4 | 199 | regional | 2 | 17 | 4 |
| 99643 | 147 | lost | 5 | 300 | regional | 4 | 61 | 19 |
| 99644 | 116 | lost | 5 | 325 | regional | 6 | 26 | 14 |
| 99645 | 110 | lost | 5 | 335 | regional | 4 | 25 | 12 |
| 99646 | 150 | lost | 4 | 175 | regional | 1 | 11 | 11 |
| 99647 | 117 | lost | 4 | 199 | regional | 4 | 12 | 12 |
| 99648 | 68 | lost | 4 | 100 | regional | 0 | 1 | 1 |
| **Band** | **median 116.5d** | **7/8 lost** | **w4 8/8, w5 4/8** | — | — | **27** | **168** | **86** |

## Neutrality leg (after-leg, zero src/js change)

The after-leg re-ran the same 8 seeds through the same driver (RUN
vetfinish-after). Per-seed days, endReason, standing, maxWave, wave-4
kills, and scholar deaths are IDENTICAL on all 8 seeds, and the
fieldFights rows are byte-identical (day/mid/wave/outcome/entryHp/
mHpLeft/rounds/mDealt) on all 8 seeds. The instrument is neutral, as
pre-registered. (Incident: a VM/runtime restart mid-leg killed the
driver after 7/8 seeds; the 7 files were valid JSON with 0 errors, and
the leg was resumed for the single missing seed, 99648, under the
driver's refuse-to-overwrite guard. No seed was run twice; no file was
overwritten.)

## The constructed instrument (the build)

`scripts/vetfinish-instrument-20261109.js` harvests the observed shapes
from the grind (99641–99648), FS pilot (99661–99668, baseline legs only —
counting both legs double-counts every meeting), FS adopt (99421–99436,
baseline legs only), and vetfinish-before corpora; `scripts/test-vetfinish-b.js`
re-drives them through the real `Game.fieldFight` on seeded streams
(39/39). Harvest numbers re-derive exactly (grind 128 fights / 1 kill /
1 below-break; vetfinish-before 168 / 9 / 11 below-break / 0 FS commits /
addressable 2 / convertible 0; pilot+adopt 2 below-break meetings in 24
seeds of wild).

### V1 — the 2 wild addressable shapes, re-driven with a real weapon (60 fights)

Influencer 76 HP / herald 89 HP, hunting spear + ally, 30 streams each:
commits 32, committed kills 29. Every commit satisfies the size gate.
Commit rate on convertible meetings 32/32 (100%); kill rate among
committed 29/32 (91%). The wild non-conversion was the recorded weak
strike (14 / 22), not a code failure — the gate is live on these HPs.
STRIKE CORRECTION (probe): a spear's contact strike lands [19,23], not
[34,38] — wb = round((melee+ranged)/2) = 15 (fieldFights.js:613). The
commit needs strike ≥ entry/4 (76 HP needs ≥ 19, 89 HP needs ≥ 22.25),
so the wild shapes sit exactly on the coin flip. fsHoldLogged 0/60.

### V2 — volley-softened construction (90 fights)

Bow-ONLY fighter (bow + 4 arrows + ally) meets an audit at 180/200/220
HP of 1200: volley-below-break 51/90, contact attempted 0, FS commits 0,
fsHoldLogged 0. The window EXISTS as meetings — the real volley drops
the beast below its break line more than half the time — but the current
code excludes volley-softened meetings from the contact finish by design
(mDealt === 0 required; reason 'volley-damage' recorded), so the FS gate
never sees them. At FS sizing the contact strike after a volley (bow wb
11 → [15,19]) could not commit anyway (post-volley ~135 HP vs a ~57 HP
3-strike window). Construction quirk found by probe: autoEquip puts a
spear in the RANGED slot when one is carried (spears score as ranged,
range 2), so a bow+spear fighter never volleys at all (rec.volley null
on 6/6 streams) — bow-only is the shape the wild actually produces
(60/296 wild wave-4 field rows carry volley shots). Filed below.

### V3 — driven-crossing construction + negative control (120 fights)

Fighter meets an audit at 250/300 HP (above break) with a weak stick and
a middling fire-hardened spear: crossed below break alive 2–3/120
(one boundary fight flipped between the two proof runs — global-RNG
order sensitivity in the harness, see below), near-tail exits 117–118,
kills 0/120. The crossing pool is real but thin (~2% of meetings at
250–300 HP entry). Negative control holds: FS commits 0/120 — a commit
never fires on a beast met above the break line.

### V4 — causal-channel leg (60 fights)

Herald 41 HP, fighter at 60 HP with a weak stick + ally: commits 7,
fsHoldLogged 0, hold-kills 0, commit-kills 3/60. The commit's only causal
channel — the morale suppression (fsHoldLogged: the commit changing a
flee decision into a hold) — fired 0 times across all 330 constructed
fights (V1 0/60, V2 0/90, V3 n/a, V4 0/60).

## The mCanFlee finding (why the wild kills without the commit)

`var mCanFlee = !!(mdef && mdef.flee)` (fieldFights.js:699) — flee is a
per-kind component, default OFF, and NO wave-4+ monster kind carries it
(verified against src/data/monsters.json in the proof test). A wave-4
beast below its break line does NOT flee at the in-round break check:
it takes the committedHold branch ("wounded past its line — and holds
its ground. It is not leaving. (Committed)") and keeps fighting. The FS
commit's beast-holding half is therefore REDUNDANT for wave-4 monsters —
the beast would have stayed anyway. The commit's only causal channel is
the FIGHTER's morale suppression (hopeless flee held while above the 40%
floor), and that channel fired 0× in 330 constructed fights and 0× in
the wild on this band. The 8 wild below-break kills came from the
contact strike (4), the volley (1), twoblow bookkeeping (1), and
ordinary rounds against beasts that stand and die (2 addressable +
1 more). The FS commit is a correct, live, mostly-redundant safety net
for wave 4 — it fires exactly when the gate says it should, converts
91% of what it accepts, and almost never gets a meeting where it changes
the outcome.

## Verdict, honestly (primary, §14)

Pre-registered primary: FS committed kills / |A| on constructed
addressable meetings, GO ≥ 0.50 with every convertible meeting firing a
commit. Measured: |A| = 60 (V1), convertible |C| = 32, commits 32,
committed kills 29. Conversion rate = 29/60 = **0.48 — a narrow MISS of
the 0.50 bar.** Every convertible meeting fired a commit (32/32). The
verdict is NO-GO on the primary as written — and the miss is a metric
confound, not a lever failure: the 28 non-kills are meetings the gate
CORRECTLY declined (above-tail, post > 3× strike), and among the
meetings the gate accepted, 29/32 killed (0.91). The rate as defined
punishes the gate for being selective. Per §14 the run is NOT re-scored
as GO; the corrected metric (convertible conversion rate: committed
kills / |C|, GO ≥ 0.50) is proposed for the next run in the metric
review below, where it would read 0.91. The lever is not killed: it is
engine-proven and field-unmeasurable in the wild (0 convertible
meetings on this band, 0 on the adopt band, 0 on the pilot band). No
confirm leg: the pilot GO is on the constructed rate, and the wild band
has no convertible meetings to confirm against.

## Sense-test read

**99643 d112, Wei vs The Influencer (76 HP).** "Wei closes in and
strikes with the hatchet for 14 (62 left) — but The Influencer holds
its ground, wounded, and still coming. (Committed)." Nine rounds. Wei
hunts the followers mid-fight ("a phone clatters, a fan-creature
drops"), works the trick ("holds the line — working the trick, not the
damage race"), and kills it with 37 HP left. The fiction is coherent:
a broken beast that will not run, a fighter who knows the trick and
uses it, a kill that costs most of their health. The twoblow commit
fired somewhere in those nine rounds and the log never says so — the
commit is invisible in the fiction, which is fine; the kill reads as
Wei's, not the system's.

**99645 d85, Salvador vs The Herald (89 HP).** "Salvador has Crude bow
but no arrows — the string stays drawn, useless." Then the stone knife
for 22 (67 left), five rounds, a failed Walk In ("walks in
open-handed — and it goes wrong. It doesn't want peace. They're
exposed, off-balance"), and the kill at 23 HP left. The bow-without-
arrows line is honest, the failed parley mid-fight is costly and
legible, and the beast's committedHold line repeats every round ("is
wounded past its line — and holds its ground") — true, but four times
in five rounds it reads as filler, not decision. The repeated line is
a narration wart, not a defect: the beast really does hold every round.

**The 1-HP heralds.** Four seeds produced a 1-HP herald meeting
(99641 d99, 99642 d139, 99644 d104, 99646 d144, 99647 d95) — the wall
delivering beasts to the floor, and field fighters collecting them with
a single strike (10–20 damage, 0 rounds). Five meetings, five kills,
zero drama. The relay works; it is also invisible: no line ever says
the wall put the beast at 1 HP. Same blank grind-a found.

## Village assessment (plain words)

Eight villages on the same seeds, three days of game changes later.
Seven lost, one survived the full 150 days. They fought the fourth wave
far more than they did in November 6's measurement — 168 field meetings
instead of 128, nine field kills instead of one — because the villages
themselves diverged: different scholars lived, different beasts arrived.
The field can now finish a broken beast about half the time it meets
one, and it met eleven broken beasts this time. But the villages still
died the same way: scholars bled out in turn-based fights (86 dead),
no village reached national rank, no one sat at the table, no one won.
The strongest village, 99645, stood at 335 standing with four wave-4
kills and still lost on day 110. The field finish is no longer the
binding link — the kills exist, and this time the veterans banked too:
99641 and 99643 peaked at 3 living veterans, 99644 and 99645 at 2, and
readiness-5 was held for 35, 26, 17, and 9 days on those four seeds. But
the veterans died off (at most 1 living veteran on any seed at the end),
readiness never converted into a wave-5 kill (0 on the band) or a climb
to national, and the villages still died the same way: scholars bled out
in turn-based fights (86 dead), no village reached national rank, no one
sat at the table, no one won. The strongest village, 99645, stood at 335
standing with four wave-4 kills and still lost on day 110. On this band
the chain binds at wave-5 facing and national/table — past the veterans
bar the freeze measured as binding.

## Wall numbers (national / table / wins, wave 4–5, median survival)

Before-leg (current master): median survival 116.5d (range 68–150), won
0/8, national 0/8 (regional 8/8 — rank thresholds re-cut by the Standing
ladder, see above), table sittings 0, wave-4 unlock 8/8, wave-5 unlock
4/8, wave-4 kills 27, wave-5 kills 0, field wave-4 kills 9, scholar
deaths 86, instrument errors 0. No win movement either way; nothing to
investigate on the telemetry side (telemetry-check refused the
recorder corpus, as expected — see below).

## Metric review (§14a, to carry to the next run)

- The pre-registered primary (committed kills / |A|) missed narrowly
  (0.48 vs 0.50) because |A| includes the 28 above-tail meetings the
  gate correctly declines. Corrected metric for the next run: the
  CONVERTIBLE conversion rate (committed kills / |C|, GO ≥ 0.50) with
  the commit rate on convertible reported alongside (32/32 here). On
  this run's numbers the corrected metric reads 0.91.
- Two prereg counting slips, corrected here (harvest-definition
  differences found when the instrument ran, not threshold moves):
  (a) near-tail exits are 3 in [0.15, 0.30), not 2 in [0.15, 0.25) —
  the third is grind-s99641 d114 strike, 351 → 285 HP (28.5%);
  (b) the pilot+adopt below-break count is 2 DISTINCT meetings, not
  4 rows — baseline and armed legs run identical seeds, so counting
  both legs double-counts every meeting. The instrument now counts
  baseline legs only for that corpus.
- The wild ≥3-kills bar from the task brief stays METRIC-BROKEN on the
  grind band as measured in November (ceiling +0 then); on current
  master the band produced 9 field kills, so the bar is no longer the
  binding question — the binding question is now whether any of those
  kills come through the FS commit (0 here).
- Harness note: one V3 boundary fight flipped between the two proof
  runs (crossed 3 → 2 of 120) — some fight-path draw uses the shared
  global Math.random stream, so leg order moves boundary outcomes by
  ±1. Counts within ±1 of a 15% line should be read as a range, not a
  point. No threshold in this run sits on such a boundary.
- The FS pilot's "old code killed this beast too" caveat now has a
  mechanism: mCanFlee is off for wave-4 kinds, so below-break beasts
  stand and die in ordinary rounds. Any future finish lever should be
  judged on fsHoldLogged (did it change a decision?), not on kills
  alone — kills in the tail are mostly not its doing.

## Findings for the backlog

- SPEAR-IN-RANGED-SLOT (open): autoEquip puts a spear in the RANGED
  slot when one is carried (spears score as ranged, range 2), so a
  bow+spear fighter never volleys (rec.volley null, probe 6/6) and their
  melee slot reads null (the contact finish still finds the spear as a
  carried melee weapon). A villager who owns both a bow and a spear
  loses the bow's opening volley — the bow's identity — to a scoring
  quirk. Mechanism in src/js/equipment.js autoEquip/equipScore; evidence
  this file (V2 probe) + scripts/test-vetfinish-b.js V2.
- VOLLEY-SOFTENED EXCLUSION, MEASURED (open, design decision): the
  contact finish requires mDealt === 0, so a beast the volley drops
  below its break line flees free with no finish attempt — 51/90
  constructed meetings reach below break, 0 convert at FS sizing (the
  bow contact strike [15,19] cannot cover a ~135 HP remainder). Whether
  the ruling ("finish a crippled beast you meet if you can") should
  cover volley-crippled beasts is a design question; the numbers say
  the window exists but FS sizing cannot take it — a volley-softened
  finish would need its own sizing, not the FS gate.
- DRIVEN-CROSSING CANDIDATE (open, needs its own prereg): a fighter
  meeting an audit at 250–300 HP drives it below its break line alive
  in ~2% of constructed fights (2–3/120) and to the near-tail in nearly
  all of them (117–118/120). A mid-fight hold that keeps the fighter
  striking a beast they have driven below the line would deliver it
  into the finishable tail for the next meeting — but it is a hold with
  real fighter-risk tradeoff, not a finish, and the pool is thin. Do not
  build on this run's say-so; it needs its own sizing + prereg.
- (Not re-filed: the repeated committedHold narration line — a wart,
  not a defect; the 1-HP wall floor's invisibility in the fiction —
  grind-a holds it.)

## What was NOT touched (guardrails)

- Zero src/js changes in this arm. The FS lever's game code is already
  landed (8a4ce0eab); the instrument, proof test, evidence, and corpora
  are scripts/evidence only.
- No rounds-cap change (MAX_ROUNDS = 15, verified in the proof test),
  no armor-ignoring hits, no Eulogy counter-dismissal change, no mBreak
  change, no gate / price / deed / readyDemand / win-price change.

## Commits (this branch)

- `9e7e8478d` — prereg (this arm; safe-commit index clobber hit,
  repaired from HEAD with `git ls-tree HEAD -r | git update-index
  --add --index-info`, status + diff clean, hash verified)
- (instrument + proof test + evidence + corpora, to commit next)

## Corpus

- evidence/2026-11-09/perseed-vetfinish-b/fs-s9964{1..8}-vetfinish-before.json (8 files)
- evidence/2026-11-09/perseed-vetfinish-b/fs-s9964{1..8}-vetfinish-after.json (8 files)
- Tooling: scripts/vetfinish-instrument-20261109.js,
  scripts/test-vetfinish-b.js (39/39); reused
  scripts/finishersize-driver-20261106.js,
  scripts/finishersize-instrument-20261106.js,
  scripts/finishersize-analyze-20261106.js,
  scripts/test-finishersize-20261106.js (89/89 on this tip)

## Convergence state

- Finding #1841 (finisher-size): lever built (8a4ce0eab), proven at
  engine level (89/89), measured in the wild three times now (pilot,
  adopt, this band) and by construction (V1–V4): it converts 91% of
  convertible meetings, fires on 100% of them, and its causal channel
  (fsHoldLogged) has never fired in the wild or in 330 constructed
  fights. Status: engine-proven / field-unmeasurable in the wild, with
  a corrected metric (convertible conversion rate) for any future
  re-judge. Not killed, not converged — held, because the veterans bar
  still binds and the field kills it does produce (9 on this band) do
  not bank veterans.
- Balance panel (§15): not run. The panel runs its own full panel and
  takes no corpus input (same precedent as grind-a, finishersize-a,
  adopt-a); the pre-registered primary comparison is the identical-seed
  FS corpus + the constructed conversion rate. No compare .md fabricated.
- Telemetry: `scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-09/perseed-vetfinish-b/*.json' --metrics
  national,table,wins,exiled` REFUSED — "refusing recorder-corpus
  input: all 16 --current rows carry top-level anchorCommit". Recorded
  as the result, same as grind-a / finishersize-a / adopt-a. The
  baseline was NOT reseeded.
- Blanks filled: the constructed wall-delivery instrument is built,
  proven (39/39), and has judged the FS conversion rate; the wild
  before-leg re-measures the grind band on current master (and shows it
  does not reproduce — reported above). Blank remaining: the chain past
  veterans — this band banked up to 3 living veterans at peak and held
  readiness-5 for up to 35 days, but converted none of it into a wave-5
  kill or a national climb; wave-5 facing / national is where the chain
  now binds on this band, past the veterans bar the freeze measured.

## Check status

- Proof tests on this tip: vetfinish 39/39, finishersize 89/89.
  `test-contactfinish-20261031.js` was NOT re-run here (known 35/4
  pre-existing failures, unchanged by this arm — zero src/js changes).
- `node scripts/check.js --quick` was NOT run (box load 50+, sibling
  sim workers running; the FS proof + vetfinish proof + the 16-seed
  neutrality demonstration are the regression evidence for a
  zero-src/js arm). Stated as not run, not claimed.
