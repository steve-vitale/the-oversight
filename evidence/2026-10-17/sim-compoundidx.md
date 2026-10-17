# sim-compoundidx — hostile-region compound index (2026-10-17)

Run: flesh-out loop arm sim-compoundidx, scale-onramp axis, findings #459/#460.
Read-only diagnostic (new instrument + proof, scripts/ only; ZERO src/js
changes, ZERO policy changes, ZERO behavior change). Canon: docs/CANON.md,
docs/SCALE.md (raids, tribute, the scale ladder), docs/PROGRESSION.md §6/§10
(other villages splinter — cannibal factions split; PROGRESSION.md is the only
canon doc covering village schisms; no dedicated raiding/splinter canon doc
exists — per the assignment I note this instead of inventing canon).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the census)

**Question (findings #459/#460, named next from sim-hardseed):** seed 1940809's
villages collapsed by ~d50 under the HOSTILE-REGION COMPOUND — five
interlocking parts (forage-ground competition, raid hemorrhage ~8,100 kcal,
grief-leveraged tribute 3k→11.25k kcal/week, wave-3/contest meatgrinder, pantry
death spiral 40k→0 in ~8d) — before the win-side stack's d90 operating window.
Is the compound SYSTEMATIC across village-lost runs (candidate pre-seat
levers), or SEED-SPORADIC (needs a per-seed detector, not a general lever)?

**Corpus:** fresh 16-run census — 8 fresh seeds × {leadfeast, belongfeast},
180d death-aware, base courtship SEATDRIVE=0. Substrate:
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=0, ALLOWGATE2 unset, tree base c477ba34. Seed-collision assertion
before the first run (no seed literal may already exist in evidence/
filenames). Extension rule: 4-seed blocks until ≥ 16 village-lost runs, cap
40 runs total. (Prior corpus check: wincensus-c control side (SEATDRIVE=0)
was 19/32 village-lost ≈ 59%, so 16 seeds were expected to yield ≥ 16 lost;
the instrument's data — raid events, tribute trajectory, pantry series,
splinter scans — exists nowhere in prior corpora, so a fresh instrumented
corpus was required, not a reuse.)

**PRIMARY (diagnostic GO):** share of village-lost runs with ≥ 3 of the five
compound parts present. GO (compound is systematic) iff ≥ 8/16. A miss is
NO-GO, never re-scored against a friendlier metric mid-run — the finding is
then "seed-sporadic — the compound needs a per-seed detector, not a general
lever." Metric binding (§14) holds for diagnostics.

**Classification thresholds (pre-registered, in THRESHOLDS):**
- forage: any other-village commons rumorStage ≥ 1 during the run
- raid: ≥ 2,000 kcal extracted from Haven's pantry by raid channels
- tribute: ≥ 1 grief-leverage grab AND max weekly terms ≥ 6,000 kcal
  (courtship base 4,000 × 1.5)
- meatgrinder: wave-3 released AND ≥ 2 combat-family villager deaths on/after
  wave-3 day AND those deaths ≥ 50% of all villager deaths
- spiral: pantry peak ≥ 20,000 kcal AND pantry fell below 2,000 within ≤ 10
  days of the peak day (hardseed: 40k→0 in ~8d)

**Proof:** scripts/test-compoundidx-20261017.js — synthetic fixtures for each
part present/absent + boundary RED checks (near-misses classify absent).
RED→GREEN recorded (see Proof section).

## Method

Instrument: scripts/census-compoundidx-20261017.js. Per run, on the same
policy stack the sweeps use (seatdrive leadseat/belongseat with SEATDRIVE=0 —
pure delegation to the windefer-wrapped tribfloor courtship base):

- `Game.registerDeath` wrapper → named death log {day, kind, vid, name, cause}
- `Game.say` wrapper → raid say-lines carry exact kcal ("carried off ~X kcal
  from the pantry", "melted back into the dark with X kcal"), garden-trample
  counts, plus a beat buffer for the assessment
- `Game.commonsRaid` wrapper → exact pantry delta around the call (the 500–
  1,500 kcal direct raid channel needs no policy answer)
- `Game.answerRaidDefense` wrapper → answer + pantry delta (insurance; the
  census policies leave treeline raids unanswered — the engine auto-resolves
  them for 800 kcal)
- `Game.payTribute` wrapper → tribute outflow per link
- daily state scan (read-only): pantry kcal, otherVillages hostile-splinter
  set (isSplinter && cause hardline/cannibal, ever-seen), commons rumorStage
  max, hierarchyState() links (tributeKcalPerWeek max, griefGrabs max),
  Game.unlockedWave() → wave-3 release day, per-day hash (reproducibility)

Raid-kcal hemorrhage = sum over commons + treeline + defense-answer channels
(preferring the exact pantry-delta where available). The classifier
(classifyParts) is a pure function over the per-run record — the proof test
exercises it without running the game.

## Results

Corpus: 32 runs (16 fresh seeds × {leadfeast, belongfeast}, 180d death-aware,
substrate FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=0, tree c477ba34). Seed-collision assertion clean
(32/32). No extension needed: 17 village-lost runs ≥ the 16 minimum.
Per-run JSONs: evidence/2026-10-17/perseed-compoundidx/compound-*.json.

**PRIMARY: 10/17 village-lost runs compound (≥3 parts) = 0.588 → DIAGNOSTIC-GO.**
The hostile-region compound is SYSTEMATIC, not seed-sporadic.

Per-part prevalence (village-lost runs, n=17):
- forage (forage-ground competition): 16/17
- raid (raid-kcal hemorrhage ≥ 2,000): 17/17 — median 27,157 kcal/run
- tribute (grief-leveraged, grab + terms ≥ 6,000/wk): 8/17
- meatgrinder (wave-3/contest death share ≥ 50%, ≥ 2 deaths): 4/17
- spiral (pantry ≥ 20k → < 2k within ≤ 10d): 0/17

By policy: belongfeast 7/7 compound (median survival 126d), leadfeast 3/10
(median 138d). The tribute part is the policy discriminator: belongfeast
walks the subordinate road, so grief has tribute terms to grab (terms reached
7,500–11,250 kcal/week on 7 seeds); leadfeast holds primacy — its links pay
it, so grief finds nothing to leverage (only 1/10 tribute parts).

Hostile splinters are NOT the driver: compound rate by splinter bucket is
4/8 (0 splinters), 4/6 (1–2), 2/3 (3+) — flat. A 4-part compound run
(s2821609 belongfeast: forage+raid+tribute+meatgrinder) had ZERO hostile
splinters: ordinary neighbors (Thornfield, Stonebridge, Emberhold, Ashford)
raided night after night, 600–1,800 kcal per raid, d91–d141. The "hostile
region" is the ordinary region under pressure.

The fast pantry death spiral (the hardseed's 40k→0 in ~8d) fired 0/17 —
collapse tempo in this corpus is slow (pantry peak→<2k took 27–147d, median
~72d). The hardseed's d50 collapse is the fast tail, not the mode.

Two collapse faces in the corpus:
1. The slow grind (d100–d175): forage competition + raids bleed the pantry
   while tribute terms ratchet up on grief; villagers die in wave-3/contest
   combat or to attrition. 10/17.
2. The fast fall (d40–d82, 4 runs): dead before/at wave-3 release (two runs
   never saw wave 3). Early combat attrition + raids strip a never-large
   pantry; the last villager starves. Parts present: forage+raid(+tribute).

Death-cause shares (219 villager deaths, village-lost runs): combat 40.6%,
monster 35.2%, starvation 7.8%, sickness 5.5%, unclosed wounds 3.7%. Three
quarters of villager deaths are violence, not hunger — the compound kills
through the spear and the treeline, and starvation finishes the remnant.

## Compound verdict

**DIAGNOSTIC-GO (10/17 = 0.588 ≥ 0.5).** The hostile-region compound is
systematic across village-lost runs on the courtship road. Its systematic
core is THREE parts, not five: forage-ground competition (16/17),
raid-kcal hemorrhage (17/17, median ~27k kcal/run — an order of magnitude
above the 2,000 bar), and grief-leveraged tribute (8/17, terms 7,500–11,250
kcal/week, concentrated on the belongfeast/subordinate road). The
wave-3/contest meatgrinder is real but conditional (4/17 — needs wave 3
released AND combat to dominate the death ledger). The fast pantry death
spiral is the hardseed's seed-specific extreme (0/17 here).

Consequence for the pre-seat wall question: the seat stack's operating
window starts at the d90 seat floor; these villages die at median d131 with
the compound already at 3+ parts by ~d60–90 — the compound has causal
contact with the whole pre-seat game, and candidate levers are pre-seat:
raid defense (the treeline answer the census policies never give —
unanswered raids auto-resolve for 800 kcal and commons raids need no
answer at all), tribute negotiation / grief-leverage caps on the
subordinate road, and splinter diplomacy. Hostile splinters specifically
are NOT required for the compound — levers aimed only at splinters will
miss the ordinary-neighbor raids that carry most of the hemorrhage.

## Metric review

1. The meatgrinder's combat-family causes {'combat','villager combat',
   'patrol combat','raid-defense'} exclude the engine's literal 'contest'
   death cause (10 such deaths corpus-wide; 3 village-lost runs had
   post-wave-3 'contest' deaths). Impact if added: exactly one run
   (s2601421 leadfeast, 7/17→9/17 combat share) would flip 2→3 parts, moving
   PRIMARY 10/17→11/17 (0.588→0.647) — the GO verdict is robust either way.
   NOT re-scored (§14); proposed for the NEXT run: add 'contest' to the
   combat family.
2. The raid bar (2,000 kcal) is far below observed values (min 7,440,
   median 27,157) — the part is near-ubiquitous, so it discriminates
   nothing. For future levers, raid SEVERITY (kcal/run or raids/week) is
   the informative metric, not presence. Proposed for the next run.
3. The spiral bar (≤10d) correctly isolated the hardseed's fast collapse as
   the extreme — 0/17 with slow declines at 27–147d. No change proposed;
   the bar did its job.

## Village assessment (plain words)

**What the villages looked like.** Days 1–30 on most seeds: a working Haven,
pantry climbing toward 40–110k kcal, fighters standing down wave-1/2
monsters cleanly ("Ruby stood down the Big Thing and kept walking — 9
rounds, bloodied but breathing"). The neighbors are already on the shared
ground by the first month — "Fresh-cut stems on the northwest ground —
someone else is working turf your crews use" fires on 16/17 lost runs.
Days 30–90: the compound closes. The raid say-lines become a drumbeat —
"🌙 Raid — Thornfield came in the night from the southwest. They carried
off ~1,800 kcal from the pantry. Nobody's dead, but the message is clear."
Night after night, different names, same dark. On the belongfeast road the
deaths start shaking the young links and the neighbors press tribute up:
4,000 → 6,000 → 7,500 → 11,250 kcal/week, each grab said aloud as grief
being monetized. The fighters who won contests on camera die in the
wave-3 meatgrinder anyway. The village keeps FEASTING while dying — the
feast layers fire, the pantry bleeds out the back door.

**Who thrived.** The fighters, briefly — wave-1/2 is their season, and the
death logs show 6+ villager-combat monster kills on the healthy seeds.
The teachers taught (plants drawn in dirt appear in beats across seeds).
Nobody thrives to the end; the village-as-protagonist dies of compound
pressure. On the fast-fall seeds (d40–d61) there is no thriving at all —
the village never gets past its first pantry.

**Who died and why.** Three-quarters violence (combat 40.6%, monster 35.2%
of 219 villager deaths): wave-3/contest fights, treeline-adjacent combat,
monsters in the wild. Starvation (7.8%) is the finisher, not the killer —
it takes the remnant after the fighters are gone ("Theo — starvation"
closes the d40 run; the village is 3, then 0). Sickness and unclosed
wounds take the slow attrition share. The scholar lives through most of it.

**What was missing.** A treeline answer: the census policies never answer
raid defense — unanswered raids auto-resolve (800 kcal) and commons raids
(500–1,500 kcal, no answer exists) are the entire hemorrhage channel. A
grief-leverage answer on the subordinate road: nothing in the policy
negotiates tribute down or refuses the grab; terms ratchet 4,000→11,250
while the village grieves. Splinter diplomacy existed nowhere in the
policies' verb set — and the census shows it wouldn't have been enough
anyway, since ordinary neighbors carry the compound without splinters.

**Which blank was filled.** The instrument itself: the first compound-index
census tooling (scripts/census-compoundidx-20261017.js +
scripts/analyze-compoundidx-20261017.js), reusable for future scale-onramp
arms. The diagnostic verdict: the compound is systematic (DIAGNOSTIC-GO),
its core is forage+raid+tribute (not five parts, not splinter-driven), and
candidate levers are pre-seat — raid defense, tribute/grief negotiation,
and the fast-fall face (d40–d61, pre-wave-3) as a separate wall from the
slow grind.

## Proof

- scripts/test-compoundidx-20261017.js: 18/18 pass (RED→GREEN — the initial
  run failed at require: the census module did not exist; after the module
  landed, all classifier fixtures pass, including boundary RED checks that
  near-misses classify absent).
- Instrument smoke: 1-seed run (s2271117 leadfeast) completed village-lost
  d138 with all five instrument channels firing (splinters, forage stage 3,
  raid events, wave-3 day, pantry series); classification sane
  (forage+raid+meatgrinder = 3 parts → compound).

## Blanks filled / documented

- This run is a DIAGNOSTIC (per the assignment: document precisely, do NOT
  build a lever). The instrument itself is the blank filled: the first
  compound-index census tooling (reusable for future scale-onramp arms).
- Canon gap noted: no canon doc covers inter-village raiding or splinter
  mechanics beyond docs/SCALE.md's raid/tribute tuning notes and
  docs/PROGRESSION.md's schism lines — the hostile splinter lifecycle
  (hardliner raidP 0.8, the schism beat) lives only in code comments
  (villageAgency.js header). If the compound is systematic, a canon doc for
  the hostile region is owed.
