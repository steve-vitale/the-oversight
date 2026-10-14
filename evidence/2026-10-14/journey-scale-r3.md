# Journey SCALE r3 — run note (2026-10-14, oversight-playtest-loop)

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sim

- **Leg:** 3 (scale) — days 80–140: regional → national, hierarchy, the table
  approach. Base: master HEAD `44da35cf` (journey deepening r10).
- **Question:** On the current tip, does the scale window now PLAY for a
  competent player? R1 (2026-10-13, tip f02e5f0b) found competent scale-blind:
  0 links, 0 national/table mentions in 128 days — the leg didn't play. Since
  then: (a) deepening r10 (2026-10-14, THIS tip) measured competent seasoning
  links on 4/8 seeds by day 70–85 and an ORGANIC competent wave-4 unlock
  (8106, war path); (b) blitz simpolicy (f85ec644) landed COMPETENT_TALK +
  COMPETENT_SURPLUS_FEAST policy layers — the load-bearing conversation verb
  R1 flagged missing. R2 answered the courtship-policy question (national
  beats play, 3/5, diplomacy road works). R3 asks whether COMPETENT now
  climbs the ladder — the policy real players run.
- **Interesting bar:** ANY of (a) a seasoned link (age≥30d, trust≥40) held
  into day 100+ on any competent run; (b) a national beat staged/answered on
  any competent run; (c) a table-approach event; (d) a new scale-window
  failure mode (realm dissolves silently, tribute starvation, beat never
  answerable). If NONE fire across 8 runs, the leg still doesn't play for
  competent — document and move on (§9), no expansion burn.
- **Metric binding (§14):** assessment run, not a lever run. Binding metrics:
  `beats` array length per run (R2's metric-review correction — markerCounts
  reads 0 on staging copy), rank trajectory (rankDays), seasoned-link count
  at day-100 snap, nationalLive/globalLive end flags, exile events. A miss is
  NO-GO, never re-scored; metric doubts go under "metric review" for the next
  run. Deliverable = the sense-tested assessment + blanks.
- **Seeds:** 11, 22, 33, 44 (house convention). **Policies:** competent
  (pinned, gates OFF) × 4; competent-armed (COMPETENT_TALK=1,
  COMPETENT_SURPLUS_FEAST=1) × 4 — a policy split, not a lever; both are
  shipped competent.js code paths. **Horizon:** 150d, death-aware
  (+10d tail max on dead/scattered villages).
- **Harness:** `scripts/journey-scale-r3-20261014.js` (r2's beat-watching +
  convo driver, + link-seasoning snaps at days 70/85/100/120, + POLICY_TAG
  output naming). Reuse, not reinvention.

## Pilot results (8 runs, tip 44da35cf)

| seed | arm | days | end | rank trajectory | beats | links (d70/85/100/120) | villager deaths |
|---|---|---|---|---|---|---|---|
| 11 | baseline | 152 | survived | village | 0 | none | 15 |
| 22 | baseline | 152 | survived | village | 0 | none | 7 |
| 33 | baseline | 36 | village-lost | village | 0 | none | 9 |
| 44 | baseline | 152 | survived | village | 0 | none | 4 |
| 11 | armed | 79 | survived | village | 0 | none | 13 |
| 22 | armed | 78 | village-lost | village | 0 | none | 11 |
| 33 | armed | 65 | village-lost | village | 0 | none | 9 |
| 44 | armed | 73 | village-lost | village | 0 | none | 15 |

Wall numbers: national 0/8, table 0/8, wins 0/8, exiled 0/8, beats 0/8,
rank never left `village` on any run (rankDays={} everywhere), zero links at
every snap, zero tribute/national/watchers/wave4/wave5 markers. Median
survival 76d. Moot markers 2 (petitioner moots the policy never called —
R1's finding reprised).

**Interesting bar: NOT MET.** The leg still does not play for a competent
player on this tip — no expansion per §9. But the pilot produced a clean,
important reconciliation (see below).

## The reconciliation finding (the run's real result)

R1 said competent was scale-blind (0 links). Deepening r10 then reported
competent seasoning links on 4/8 seeds — apparently contradicting. Both are
true, and the mechanism is now pinned:

- **competent.js never calls proposeLink** (verified: the only callers are
  app.js's player UI buttons and the courtship policies
  belongseek/leadcourt/winseek/scalecourt/killroad/fourthlink). There is NO
  inbound formation path — `_formLink` is the single birthplace; its only
  non-proposeLink callers are the raid-conquest answers. Villagers never
  propose. The engine offers no link that the policy didn't ask for.
- **Deepening r10's "competent seasons links" was harness-assisted:**
  `journey-deepening-r10-20261014.js:174` sets
  `allowPropose = POLICY !== 'belongseek'` and lines 217–236 drive
  `proposeLink` from day 25 on the policy's behalf (plus answerDemand +
  payTribute for formed links). The 4/8 seasoning measures
  competent-plus-propose-driver, not the bare policy. The r10 note's M2
  verdict stands on its own terms — but it does not contradict R1.
- **R3's armed arm sharpens it:** COMPETENT_TALK + COMPETENT_SURPLUS_FEAST
  add conversation and feasting — not proposing. 0 links on 8/8.

So: the competent scale silence is a **verb gap, not a survival gap**.
Villages now survive into the window (3/4 baseline runs lived the full
152d; deaths 4–15, combat-attrition profile). Links season fine once they
exist (r10). The beats play well when they stage (R2). The discovery
pointers are built (blitz-scaledisc, scaleDiscovery.js, beats 4–6 — R1's
blank 1, now [needs-eyes]). But the policy has no verb that forms a link,
and the engine forms no link unasked. The whole ladder is unreachable for a
player who never presses propose — which is every competent-policy run, and
arguably every real player who doesn't already know the diplomacy game
exists. The discovery beats are the engine's answer (beat 4 fires at
wave-3-points-at-bar + sub-regional); none of these runs reached its
trigger. Whether a *pointer* suffices where no *verb* is exercised is the
open design question — for Steve, not for this loop to build.

## Village assessment (plain words)

**Seed 11 baseline — the 152-day village that never left home.** Twelve
started; seven remain at day 152: **Ruby** the lifeguard (trust 80, 28
plants — the knot's heart), **Nadia** the radio DJ (trust 90, 20 plants),
**Omar** the piano tuner (77), Giulia, Rafael, Cole, Fatima. Fifteen dead:
Chloe to a Choir Toad on day 10, Katarina of thirst on day 13, lockjaw took
Davut, two died in contests, the rest to combat and monsters — including
five on a single day-60 fight. Several died as "Someone" — strangers never
named, the fog-of-war working as designed. This village lived a full,
attritional, entirely village-scale life: it fought, grieved, taught,
mourned, and never once heard the word "realm." The scale window passed
overhead like weather on another continent.

**Seed 44 armed — the collapse.** The feast+talk layers didn't starve it
(death causes: combat 4, monster 7, Choir Toad, wounds — no starvation
signal; the 3/4 armed village-lost vs 1/4 baseline is n=4 noise, watched
not claimed). Fifteen dead by day 73, the village bled out through
wave-1/2 attrition before any link could have seasoned anyway. On these
seeds the combat baseline still decides who gets to play the diplomacy
game at all.

**Seed 33 baseline — the early collapse (d36).** Thirst, sickness,
starvation (2), wounds that wouldn't close. The attrition cluster persists
on this tip.

Leadership across the survivors is trust, not title: Nadia and Ruby at
trust 80–90 hold the remnant together. Misery reads as grief (Ruby,
Wolfgang) more than hunger. What's missing: any sense of the wider world —
no traveler rumor turned into a knock, no trader became a bond, no beat
pointed at the ladder.

## People check (SENSE-TESTING LAW — 4 full transcripts read, 16 captured)

Baseline runs (the armed runs died before day 85, so no transcripts — the
convo driver fires at 85/105/125).

- **Ruby d85 (seek_comfort, grieving):** opens with cross-death continuity —
  "Carlos and I never did finish talking about that favor — that was 12 days
  back. You're not Carlos. Still on your mind?" Comfort stages 0→2→3,
  resolution=comforted. A person grieving. ✓
- **Rafael d125 (ask_favor, stage 2 fromSeed):** "About the food I needed —
  still need hands. Are you in?" → commit → "Thank you. I won't forget who
  fed me when it mattered." Then four plant teachings with varied, human
  responses ("And I've been walking past it for weeks."). resolution=promised.
  ✓
- **Carlos d85 (curious, trust 90):** the standout — "Do you still sing?
  ...Sorry — weird question. I just realized I haven't heard anyone sing."
  → "Ha! The creek concerts. I've heard those. Keep going." → gossip plants
  a live thread: "Watch yourself around Zoe. I can't tell you why. Just...
  watch." → honest "That's... pretty much all of it, honestly." → the
  player declines an invite, "Another time, then. A small thing, pocketed."
  resolution=engaged. Wants, humor, a planted hook. ✓✓
- **Wolfgang d105 (seek_comfort, grieving, trust 90):** real grief and a
  good closing line ("I'll be okay. Don't worry about me. Worry about...
  actually, don't worry at all.") — BUT the comfort-stage responses are
  VERBATIM the same four lines Ruby produced on d85 in the same order
  ("Good. Company's company." / "Stay as long as you like." / "Nice. Sit.
  The fire's warm." / "You know what's worst? The quiet parts."). The
  comfort response pool is shared and small — comforting two villagers
  back-to-back recites the same script. Same class as the mourning-pool
  blank (fixed deepening r9). DOCUMENTED below, not fixed.

Verdict: scale-era villagers act like people — wants are real, options
engage honestly, endings resolve/plant/owe. No fabricated shared history,
no filler loops, no static menus. One content-thinness blank.

## Blanks

DOCUMENTED (not fixed — content/design, outside this run's binding question):

1. **The propose verb gap (this run's headline, for Steve):** competent has
   no link-forming verb; the engine forms no unasked link. Options: (a) a
   competent-policy propose layer (policy-side, e.g. propose when pantry
   strong + village known + trust signals — mirrors r10's harness driver);
   (b) villager-initiated proposals (design — villagers as diplomats);
   (c) rely on the scaleDiscovery beat-4 pointer alone. Steve's call.
2. **Comfort-pool thinness:** seek_comfort stage responses repeat verbatim
   across villagers (Ruby d85 ≡ Wolfgang d105, same pick sequence). Needs
   pool variants — the mourning-pool fix is the template.
3. **R10 note correction (filed):** deepening r10's "competent seasons
   links 4/8" was measured with the harness's propose driver
   (allowPropose, scripts/journey-deepening-r10-20261014.js:174,217–236) —
   not the bare policy. Future citations should carry the caveat.
4. **Rotted scale regression scripts (R2's metric-review, reprised):**
   `test-scale-ladder-20261010.js` (24 failures) and
   `test-national-shapes-20261010.js` (3 failures) fail identically on
   pristine code — tooling backlog.

FILLED (tooling): `scripts/journey-scale-r3-20261014.js` — r2's harness +
link-seasoning timeline snaps (70/85/100/120, SCALE.md seasoned =
age≥30d && trust≥40) + POLICY_TAG output naming. Syntax-checked, smoke-run
(25d, seed 11) green, 8-run pilot clean.

## Reachable / fun / winnable (scale leg, days 80–140, competent policy)

- **Reachable:** NO for a competent player — 0/8 runs formed a link, 0/8
  reached regional, national/table never staged. Reachable only on
  courtship policies (R2: 3/5 national) or with a propose driver (r10).
  The gate is a missing verb, not a missing ladder.
- **Fun:** YES where it fires (R2's beats; R3's transcripts — Carlos's
  singing question, Ruby's grief). The village-scale life is rich; the
  scale content simply never intersects it for this policy.
- **Winnable:** NO on competent — 0/8 national, 0/8 table, 0/8 wins.
  Unchanged from R1. The wall for competent is now precisely located:
  survival-to-90 is largely solved on these seeds (3/4 full-horizon
  survivals); the remaining wall is the propose verb.

## Metric review (§14)

- The `beats`-array primary held: 0/8, honest. rankDays={} on all runs is
  itself the finding (no rank movement at all).
- The day-70/85/100/120 link snaps were the right instrument — they show
  the absence cleanly (not "links formed and died," but "links never
  formed"). Keep for future competent runs.
- Armed-vs-baseline survival (3/4 vs 1/4 village-lost) is n=4 noise;
  death causes don't implicate the feast/talk layers (no starvation
  signal). Not a finding; watched.
- Next run: if a propose layer is ever added to competent, the same 8
  seeds are the clean before/after.

## Telemetry deviation check

`telemetry-check.js` vs `telemetry-baselines/scale.json` (seeded from R2's
5 courtship-policy runs): 3 LOUD lines, all EXPLAINED, no baseline roll
(policy-split convention):
- `beats 5→0`: courtship proposes links → beats stage; competent proposes
  0 → none. Expected — this IS the R3 finding.
- `markerCounts.tribute 10→0`: tribute flows only on active links;
  competent has none. Expected.
- `monsterSlain 78→135 (+73%)`: file-count sum artifact (n=8 vs n=5);
  per-run 16.9 vs 15.6 — flat. Explained, same class as R2's sum artifact.

## Convergence update

scale-onramp: CONVERGING (unchanged). Competent national 0/8 on the current
tip; the wall's current face for the competent policy is the propose-verb
gap — survival-to-90 is no longer the binding constraint on these seeds
(3/4 full-horizon survivals). Courtship roads remain the only measured
path to national (R2 3/5). The axis moves only when a non-courtship policy
reaches national organically.

## Files

- Harness: `scripts/journey-scale-r3-20261014.js` (r2-derived + link snaps
  + POLICY_TAG)
- Evidence JSONs (repo): `evidence/2026-10-14/journey-scale-r3-competent-{11,22,33,44}.json`,
  `evidence/2026-10-14/journey-scale-r3-competent-armed-{11,22,33,44}.json`
- Transcripts: /tmp/journey-scale-r3-competent-{11,22,44}-day{85,105,125}-v{0,1}.txt
  (16; ephemeral — 4 sense-read for this note)
- Run logs: /tmp/journey-scale-r3-baseline.log, /tmp/journey-scale-r3-armed.log
- This note: `evidence/2026-10-14/journey-scale-r3.md`
