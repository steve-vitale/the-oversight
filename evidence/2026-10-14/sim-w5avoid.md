# sim-w5avoid — W5-AVOIDANCE DOCTRINE (RAID-CHANNEL REMAINDER blank)

Arm: `sim-w5avoid` (oversight-flesh-out-loop, run 2026-10-14, axis scale-onramp).
Type: POLICY LEVER (scripts/policies/w5avoid.js, W5AVOID=1, default OFF —
DELETED per kill protocol; no trace in the tree).
Scripts: `scripts/test-w5avoid-20261014.js` (proof, 99/99 GREEN pre-kill),
`scripts/det-gate-w5avoid-20261014.js` (det-gate 16/16),
`scripts/sweep-w5avoid-20261014.js` (pilot sweep),
`scripts/probe-w5avoid-sense-20261014.js` (sense probe).
Data: `evidence/2026-10-14/w5avoid-pilot.json`,
`evidence/2026-10-14/w5avoid-per-seed/` (16 per-seed files).
Claims: sim-findings RAID-CHANNEL REMAINDER (from the siegedef3 kill;
the r35 raiddef arm claimed it and was killed — this arm is its named
successor: the documented-but-unbuilt w5-avoidance doctrine).

## The doctrine (design)

sim-raiddef.md's explicit lesson: AVOID wave-5 threats, don't engage them.
The layer wrapped leadfeast and did three things:
1. NEVER engage wave-5 — no triggerEncounter marches on w5 lingerers, no
   scholar marches on w5 threats at the treeline. w5 threats are named,
   counted, and narrated ("The Editor holds the treeline — no one answers
   that. The village gives it the night."). A travel guard wraps
   Game.travelTo during the parent's daily and refuses marches onto tiles
   holding a LIVE wave-5 monster (null + honest beat, the engine's own
   refusal convention); the haven tile itself, combatExit barrier exits,
   and mid-combat are never refused.
2. Keep the dawn watch + non-w5 clearing — the raid-channel work that
   produced the r35 survival lift (raiders/lingerers/followers of wave ≤4
   answered proactively via honest Game.triggerEncounter).
3. The dawn clearing is gated to non-w5 threats, with the raiddef judgment
   gates: table sanctity, HP ≥60% for w3-4, never w4-alone when villagers
   are home (HOLD if invites refuse), one answer per threat per day, never
   clobber a live fight/pending encounter.
Honest verbs only, no silent branches — every avoidance and hold is counted
in ctx and narrated. Design calls (Steve can overrule): avoidance governs
the LAYER's choices, not engine-initiated haven defense (sanctuary
semantics); unknown-wave threats are not treated as w5 ("if you don't know,
it doesn't show" cuts both ways).

## Pre-registration (MEASUREMENT.md §§9–12, 14) — written BEFORE the sweep

- PRIMARY METRIC: median survival across the 8-seed suite.
  GO = armed ≥ control + 20d.
- GUARDRAILS: national ≥ control−2; table ≥ control−1; no new death mode
  (cause-family level, count/seed floor n≥2 per r34 metric review);
  wave-4/5 unlocks report-only. A miss on any is NO-GO — never re-scored.
- POLICY: control = leadfeast + FEASTSCALE_R13=1 (W5AVOID unset);
  armed = leadfeast+w5avoid + FEASTSCALE_R13=1 + W5AVOID=1.
- SEEDS: 11/22/33/44/55/66/77/88 (the plentycost road, 8-seed pilot).
- HORIZON: 180d death-aware (runDays stops on Game.over / village-dead tail).
  Why 180: the r35 kill showed the w5 spiral is a late phenomenon; shorter
  caps truncate exactly the long survivors the doctrine protects.
- Why +20d: r35's killed arm lifted median 101→177d (+76d) on survival via
  the same raid-channel work; +20d is the honest bar for "the avoidance
  doctrine keeps the lift without the spiral."

## Proof (REAL RED → GREEN, pre-kill)

`scripts/test-w5avoid-20261014.js`: 99/99 GREEN across seeds 11/42/99.
- RED (gate off): injected w5 lingerer + wrapped daily → inert
  (no pendingEncounter, no avoidance counts, travelTo untouched).
- NON-AGGRESSION: 20d same-seed hashes identical (leadfeast == wrapped).
- GREEN avoidance: w5 follower (editor, wave-5 follows) at the treeline →
  NO engagement, w5Avoided=1; travel guard refuses the march (null, orig not
  called, w5MarchRefused=1), haven tile and w5-free tiles pass through,
  guard restores after use.
- GREEN non-w5: w4 raider (reunion) on the haven tile, scholar alone →
  triggerEncounter sets pendingEncounter; one-answer-per-day holds.
- JUDGMENT: tableActive → heldTable; HP 40% on w4 → heldHp; w4 + villagers
  home + invites impossible → HOLD + heldAlone; live pendingEncounter never
  clobbered (blockedLive).
- RAID WATCH: ripe-or-threats → w5WatchDays counted.
- SMOKE=1: named-export unwrap honest (id leadfeast+w5avoid), daily is a
  function, harness drives the armed policy (mean 6 calls/day).
`scripts/det-gate-w5avoid-20261014.js`: 8/8 seeds bit-identical across runs
(16/16) on 180d — no entropy-hunt divergence this time.

## Results — KILLED AT PILOT (primary missed by 3d)

8-seed identical-seed pilot (leadfeast control vs w5avoid armed, 180d):

| metric | control | armed | GO / guardrail | verdict |
|---|---|---|---|---|
| median survival | 103d | 120d | ≥ 123d | **NO-GO (−3d)** |
| national | 2/8 | 2/8 | ≥ 0 | PASS |
| table | 1/8 | 2/8 | ≥ 0 | PASS |
| wave-4 unlocks | 6/8 | 5/8 | report-only | — |
| wave-5 unlocks | 4/8 | 3/8 | report-only | — |
| won | 0/8 | 0/8 | — | — |
| exiled | 1/8 | 0/8 | — | — |
| new death mode (n-floor 2 seeds) | — | none | none | PASS |

Layer telemetry (armed, 8 seeds): watchDays 367, w5Avoided 8 (ALL followers —
0 raiders, 0 lingerers), w5MarchRefused 16, w5Engagements 220 (19 raider,
201 follower, 0 lingerer), heldHp 2, heldAlone 0, heldTable 55, repeatSkip
63, blockedLive 345, invitesOk 66 / invitesRefused 1524.

Post-unlock Haven combat channel split (raiddef instrument, report-only):
control draw 1 / raid-night 7 / lingerer 0 / other 4 (non-draw/unlocker 2.75);
armed draw 0 / raid-night 1 / lingerer 0 / other 6 (non-draw/unlocker 2.33).
Raid-night 7→1 repeats the r35 win; "other" 4→6 does NOT repeat the spiral —
the w5 engagements are gone.

Per-seed (armed vs control): s11 180 survived vs 170 lost (table d68,
avoid 1, refuse 8); s22 69 vs 86; s33 180 survived vs 128 lost (table d50,
avoid 7, refuse 6, heldTable 50); s44 52 vs 103; s55 120 vs 168; s66 38 vs
54; s77 180 survived vs 75; s88 34 vs 58. Three 180d survivals on armed —
but five regressions.

## Why it missed — the mechanism (not noise)

The w5-avoidance half barely fired: 8 avoidances + 16 march refusals across
8 seeds — the w5 threat surface is small on this pilot (armed wave-5 only
3/8). Where it fired it worked (s33's editor(w5) treeline-holder: 7
avoidances, 6 refusals, village survived 180d with the table — the exact
s33 story from r35, now answered with avoidance instead of the
successor-feed).

The miss comes from the INHERITED half — the non-w5 dawn clearing. Ported
from raiddef's late-game raid channel to ALL waves, it engages w1/w2
threats with no readiness gate (the HP gate only covers w3+). s44 is the
clean causal case: control's scholar ignored the early hushwolf packs at
Haven, reached wave 5 d59 and the table d74 (103d). Armed's layer engaged
them at dawn (23 engagements) and fed 8 successive scholars d9–d27 to the
same packs — the successor-feed spiral recreated at WAVE 1. s55 (14 deaths,
55 engagements, eater(w4) + paparazzo(w2) haven grind), s66, s88 show the
same shape. The clearing doctrine needs a wave floor (w3+) or a readiness
gate before it answers — answering everything is the raiddef spiral with
the serial numbers filed off.

Per §14 the primary miss is NO-GO; the arm is killed, the layer deleted.

## Village assessment

s33 is the doctrine's vindication and its epitaph in one seed: the village
that r35 lost three scholars in three days to the editor(w5) now names it
at the treeline and gives it the night — 7 avoidances, 6 march refusals,
table at d50, 180d survived. The avoidance beats read as village prudence
(see sense notes). But s44 is the honest counterweight: the same dawn
courage that answers a reunion(w4) on the village's terms also marches a
day-9 scholar into four hushwolves because the threat was "answerable" by
wave number alone. The doctrine knows which fights it cannot win at w5,
but not which fights it cannot win at w1.

## Sense-test notes (SENSE-TESTING LAW — transcripts read)

Probe: `scripts/probe-w5avoid-sense-20261014.js`, seed 33, 180d, 221
doctrine beats captured. The avoidance reads in-fiction and legible:
"d67: The Editor holds the treeline — no one answers that. The village
gives it the night." / "d62: The Spoiler is out there — the scholar holds,
and walks around." A player understands exactly what happened and why.
The table-sanctity holds ("The table sits — no blood tonight. The Big Ugly
keeps its ground.") fire heavily while the table sits (50 on s33) —
narratively coherent, high volume. BLANK (would fix if the arm lived):
double-"The" in the beats ("The The Editor") — monsterDisplayName already
carries the article; the layer's prefix duplicates it. Cosmetic, in the
layer's say strings only. The engagement beats ("At dawn the village
answers the Hushpuppy — on its own terms, together.") read as communal
courage; on s44's hushwolf packs they read as communal suicide — the
transcript judges the mechanism before the numbers do.

## Blanks filled / documented

- CLAIMED: sim-findings RAID-CHANNEL REMAINDER (this arm — killed, not fixed;
  the raid-night win 7→1 repeats, but the remainder needs a wave-floored
  clearing doctrine, not this one).
- FILLED (measured): the w5-avoidance doctrine fires rarely on the
  plentycost road (8 avoidances + 16 march refusals / 8 seeds) — w5 threats
  at the treeline are a late, thin surface; the doctrine's value concentrates
  in the seeds that reach it (s33, s11).
- DOCUMENTED (design): proactive clearing of w1/w2 haven threats feeds
  scholars — the successor-feed spiral is not wave-specific. Any future
  clearing doctrine needs a wave floor (w3+) or a readiness gate. The
  inherited raiddef remainder was calibrated on a late-game threat surface;
  porting it to all waves is the bug.
- DOCUMENTED (instrument): invitesRefused 1524 vs invitesOk 66 — the dawn
  watch re-asks every dawn while the System hasn't arrived / trust <20;
  harmless but noisy; a future arm should gate the watch pass on
  party-possibility (systemArrived && partyUnlocked) before counting.

## Metric review (§14)

Primary missed cleanly (120 vs 123) — no re-score, no metric doubt. Two
proposals for the NEXT run, not this one:
1. The +20d absolute bar under-measures heterogeneous effects: three armed
   seeds hit 180d (ceiling) while five regressed — the median moves on the
   middle seeds only. A stratified (hard/easy regime) or proportional bar
   would judge the doctrine more honestly (cf. sim-recoverylever.md).
2. The no-new-death-mode guardrail's n-floor held, but sickness/starvation
   appeared armed-only at n=1 each — the longevity confound again (armed
   lives longer on winning seeds); the rate-based form proposed in
   sim-raiddef.md is still needed.

## Wall numbers (this pilot, 8 seeds)

Control: national 2/8, table 1/8, won 0/8, wave-4 6/8, wave-5 4/8,
median 103d, max 170d, exiled 1/8.
Armed: national 2/8, table 2/8, won 0/8, wave-4 5/8, wave-5 3/8,
median 120d, max 180d, exiled 0/8.
(The wall didn't move: +17d median, table +1, but the primary bar missed
and the clearing half shows active harm on early-threat seeds.)
