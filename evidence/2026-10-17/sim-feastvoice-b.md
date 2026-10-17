# sim-feastvoice-b — food-axis HUMANITY census (flesh-out loop B, 2026-10-17)

**Axis:** food-economy. **Arm:** sim-feastvoice-b (evidence-only villager-humanity census).
**Run:** fleshout-b-2026-10-17T11-06-35Z. **Worker branch:** sim-feastvoice-b.
**Census verdict:** PASS — 6/6 sense-reads human-plausible, 0 repetition-ceiling violations.
Zero src/js, zero policy changes — scripts + evidence only.

## Pre-registered header (binding, MEASUREMENT.md §14)

- **Primary (a) — sense PASS/FAIL per beat.** 4–6 transcript sense-reads as a
  reader: meaning (who wants what), coherence (follows the day's events),
  relevance (why said now), consequences (does anything follow). Bar: **≥4 of
  6 reads PASS as human-plausible**.
- **Primary (b) — repetition ceiling.** No eating beat fires verbatim >3x per
  villager per 10 days. Bar: **0 violations**.
- **Substrate:** 16 runs = 8 fresh seeds (6101–6108) × {leadfeast, belongfeast},
  FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT (pre-seat), 180d death-aware
  (+10d engine tail in runDays). Competent-player policy via
  scripts/policies/feastscale. Instrument: scripts/census-feastvoice-b.js
  (read-only wraps: ambientLine, say/sysSay food-filter, feastEmotionBit,
  villageMeal, tele deaths). Analyzer: scripts/analyze-feastvoice-b.js.
- **Determinism:** instrument verified byte-identical across re-runs
  (belongfeast-s6102 30d ×2; leadfeast-s6101 180d ×2 — identical feast
  sequences), and trajectory-neutral vs bare (fingerprint-equal at 60d across
  every instrument combo; policy.daily wall-extras also neutral at 150d).
- **Instrument gap found mid-run (documented, fixed, re-run):** the first
  sweep's FOOD_BEAT_RE missed the pilot-food gossip V2 variant ("Found a
  parcel by the hollow. Dried meat, clean water. That has Wren written all
  over it.") — the line carries no food|meal|feast token, so 0/120 gossip
  firings captured it. Root-caused via in-situ probe (the variant fires fine;
  the filter was blind), fixed (added `parcel|hollow|mutter`), full 16-run
  sweep re-ran on identical seeds — all numbers below are the fixed corpus.
  Lesson: a variant pool is only as observable as its least keyword-dense
  member — future beat filters must be validated per-variant.

## Wall numbers (the sweep substrate — Steve's standing scale-wall report)

| metric | result (16 runs) |
|---|---|
| wins | 0/16 |
| national reach | 11/16 |
| table | 13/16 |
| wave 4 / wave 5 | 0/16 / 0/16 (max wave seen: 3) |
| Arc 2 / 3 / 4 | 16/16 / 16/16 / 13/16 |
| four-realm formation | 0/16 |
| exiled | 0/16 |
| median / max survival | 145d / 182d |
| half-ration regime | 25.8% of meal-days (575/2227) |
| starvation deaths | 7 of 742 total deaths (0.9%) |

Death-cause shares: combat 470, villager combat 124, monster 78, expedition 35,
contest 14; sickness 4, dehydration 3, lockjaw 2, the night 1, wound 9.
The wall reads as before: villages reach national and the table, but waves 4–5
stay shut on the pre-seat substrate — the scale wall is a wave wall, not a
food wall.

## Repetition census (primary b)

EAT-class beats (ambientLine key='eat', exact speaker attribution): 353 beats
across 16 runs. Per (villager, template) sliding 10-day window, max verbatim
count: **0 violations of the >3/10d ceiling. PASS.**

Cross-speaker verbatim (context, not the bar): 47 template-instances voiced by
≥3 distinct speakers in a run — inherent to 3-template pools; the ambient-b
rotation keeps every single villager under the ceiling.

## Fictiongate check

"I know why" (dishonest assert): 0 firings. "I don't know why — I've eaten
only what was set before me." (honest meal-line): 0 firings. The cold-shoulder
never armed on this 16-run substrate — no dishonest testimony observed. The
sim-fictiongate-b gate holds vacuously here. Separately: the pilot-food gossip
never testifies to a motive the engine doesn't support (Wren's cache notes
precede it; food actually appears) — the fictiongate class is clean on the
food axis.

## Sense reads (primary a — 6/6 PASS)

### Read 1 — feast emotion registers (leadfeast-s6101, 180d)
d27–d76: seven feasts, all the harvest line ("Somebody laughs so hard they
cry. For one evening, nobody is surviving — they're just together.") at
pantry 62k–106k kcal. d90/d118: thin-table register ("Nobody talks much. It
isn't plenty — but it's warm, and everybody's here.") at quality 0. d131:
grieving register ("The laughter stays low — somebody's seat is empty, and
everybody sees it.") — fired on a day with FIVE combat deaths (alien_tick,
ducks_in_a_row ×4, gen_cmig4u1, ruby_callaghan), deaths d129/d133/d134
bracketing it. MEANING: the village names its own condition — plenty, thin,
grief. COHERENCE: the register shift is earned; the d131 feast does not laugh
the harvest line over fresh graves. RELEVANCE: evening feast after a massacre
day. (Monster names are descriptors — knowledge gating intact.) **PASS.**

### Read 2 — half-ration regime (#385 class: does it acknowledge rationing honestly?)
The daily village-meal beat: "Village meal: +X kcal, +1L water from the
communal pantry. (Half ration — they don't trust you yet.)" Corpus: 4 distinct
templates across 2000 firings (full/half × water/no-water). The half-ration
line (566 firings) names the TRUE cause (trust, not scarcity theater) and the
TRUE number (kcal varies). MEANING: honest — the kitchen tells you why your
bowl is light. COHERENCE: fires exactly on half-ration regime days (25.8% of
meal-days). Caveat: byte-identical day after day — the #436 static-prose
class — but a mess line repeating daily is what a mess line does; it reads as
routine, not robotic. **PASS** (repetition noted, not filed — the static-prose
class is already covered by #436/#437).

### Read 3 — spoil voicing (#439 fix in the wild)
16/16 runs: exactly ONE full teaching per run ("Owen mutters: 'Should've
smoked that. Fresh stuff keeps a day or two on the shelf — the smoke rack is
right there.'"), then 737 condensed repeats (thrown-out list only). The
preservation ladder is taught at the moment of loss, once, then the game
stops nagging. MEANING: the mutter has a named speaker, a named loss, a named
remedy. **PASS.**

### Read 4 — aid / sharing beats
Aid quests are named, numbered, consequential ("GREEN THINGS, EDIBLE — hand
over 5 units of plant food"; the begging beat: "If they once fed you, refusing
costs double" — the ledger remembers). The audience color beats are on-thesis
and funny: "They cooked it. They did not have to cook it. They cooked it
anyway and now they are SHARING it. I need to sit down." / "They share food
VOLUNTARILY. No cameras forced this." — the aliens baffled by food-sharing is
the game's core dramatic irony, voiced as comedy. They repeat verbatim
(145x/50x across 16 runs — the static class), but each is a one-line audience
reaction; acceptable. **PASS.**

### Read 5 — pilot-food gossip variants (the #440 follow-up)
All four variants fire in the wild: V0 40.0%, V1 21.3%, V2 19.5%, V3 19.3%
(483 firings; V0 inflated by the dedup overflow — when a villager's hash-pick
lands on an already-said variant it advances to the next, and V0 collects
V3's overflow; benign). Per-speaker dedup works across days (Zoltan:
V0→V1→V1→V2→V3, never repeats himself). Cross-speaker same-variant repeats are
spaced (V3 5× over 55 days with other variants between — not a wall).
Crucially, the gossip is HONEST: Wren's own cache notes precede it ("Cache by
the hollow. Dried meat, clean water. I can't stay. — W." — canon data,
alienPlayers.json), and food actually appears. **PASS.**

### Read 6 — deprivation honesty
"Half rations for three days, voted and held — or a hard hunt now, hungry, to
fill the bins before it's choosing-who-eats." (25 deprivation beats) — the
ration vote names its own stakes. "Anh went to sleep hungry. Nobody says
anything." fires at pantry fresh-days = 0, the day after the vote, with
Relief options open and fish trickling in (+720, +1020 kcal days). The village
can see the gap and doesn't close it — guilt, avoidance, voiced as silence.
The scholar's own hunger ("Your stomach is a fist. Eat — anything real, now.")
is visceral and honest. **PASS.**

**Primary (a): 6/6 ≥ 4 — PASS.**

## New findings (sim-findings format)

- [open] 2026-10-17 — narration/food — THE "NOTHING EDIBLE" PACK BEAT SPAMS UP
  TO 105x PER DAY (loop B sim-feastvoice-b, run fleshout-b-2026-10-17T11-06-35Z,
  evidence/2026-10-17/sim-feastvoice-b.md, instrument scripts/census-feastvoice-b.js):
  the scholar pack-eat flow's "Nothing edible. (<inventory list> — not food
  yet: <prep hint>.)" beat (src/js/game.js:25082) fires byte-identical up to
  105 times in a single day (belongfeast-s6101 d143; 272 beats that run; also
  leadfeast-s6104 d-max 63, belongfeast-s6103 d-max 83). Same guard-loop spam
  class as #363 (sim-dawnrefuse-b fixed the pantry-fallback variant policy-side
  with a per-dawn flag) — the competent policy re-attempts pack-eating many
  times on a starvation day and the engine voices the full inventory list every
  time. Needs the same per-dawn/per-day voice gate, but the locus is engine-side
  (game.js), so it's out of scope for a scripts+evidence census arm — documenting
  for a future narration arm.

## Metric review

- Primary (a): MET — 6/6 sense-reads PASS as human-plausible.
- Primary (b): MET — 0 violations of the >3/10d verbatim ceiling (353 EAT beats).
- Instrument lesson (not a metric miss): the beat filter must be validated
  per-variant against the pools it claims to observe. The V2 gap would have
  produced a false "variant never fires" finding — caught by the in-situ probe
  before filing, fixed, full sweep re-run on identical seeds.
- No gameplay-behavior change anywhere: voice/instrument only. All beats
  observed read as people — the week's voice fixes (#363, #385, #394, #407,
  #437, #438, #439, #440) hold in the wild on the fixed corpus.

## Convergence

converging (humanity census delivered: food-axis voice reads as people;
one new finding filed — the nothing-edible guard-loop spam, engine-side,
queued for a future narration arm).
