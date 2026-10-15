# Assumption Review — god paths, levers, and the Table

*2026-10-14 · Steve asked: "Question every assumption. Don't base everything
off of something that doesn't bear load, or that isn't an explicit quote from
me. Is the endgame table even designed in a satisfying way?"*

Every fact below was checked against code or data on `master` (`4536a706`).
Verbatim Steve quotes are marked **[Steve]**; everything else is
measurement or my reading.

---

## 1. The brief is not Steve's words

`opus-brief-ability-system.md` is headed "Design Goals (From Steve)" but
contains **no quotation marks**. It's a paraphrase by whoever wrote it. My
v2 proposal and `docs/godpath/PLAN.md` treated it as law. Things in it that
have no verbatim Steve source:

| Brief says | Verbatim support? | Conflict |
|---|---|---|
| "No new currencies or meters" | None found | The Table already has ~12 path meters; a stasis-pods quote says "a weight, not a meter" **[Steve]** (one system, not a rule) |
| "Points-based god meter: REJECTED" | None | — |
| "Fiction-first design: REJECTED" | None | Same day, Steve wrote the opposite instinct: "Why does phase blade mean hogtie costs no rope? … Need to consider deeply not just knee jerk" **[Steve]** (`design-methodology.md:3`) |
| "6 slots … the commitment device" | Slots exist; the phrase isn't Steve's | — |
| "Fights are 2-4 turns" and "2-8 turns" | None | Measured: median 5, mean 7, p90 17 rounds (§3) |
| "No victory before day 90" and "around day 70+" | Day-90 floor is attributed to Steve 10-13 (paraphrase) | The brief contradicts itself |
| "Solo a titan is an achievement, not a victory" | None | Code hard-blocks solo titans |

**What *is* verbatim and bears load** (the short list I'd now build on):
- "Paint a path towards functional godhood. If they learn and experiment enough, people can get there and it's scary good. Most game wins look like that, but not all." **[Steve]** 10-07
- "I love the broken builds component of roguelites." **[Steve]** 10-03
- "the table prices the run, never gates on godhood; reachable by competent non-god play" **[Steve]** 10-11
- "Gear changing abilities should be one of our least frequent levers. Gear is more likely to grant another type of action in certain scenarios." **[Steve]** 10-14
- "control must change the board, not the numbers" **[Steve]** 10-14
- "Abilities should be stronger, and they were always meant to be powered by food." **[Steve]** 10-14
- "does this let you skip dinner?" **[Steve]** 10-03, vs. Fusion Reactor "that one person doesn't have to eat" **[Steve]** 10-12 (a contradiction; is the Reactor the one deliberate exception?)
- "Why are you treating monster encounters like rng? It should be a fight. A hard one." **[Steve]** 10-08
- "No, contests are to be played, not as RNG." **[Steve]** 10-08
- "Decisions, not chores." **[Steve]**
- "If you don't know, it doesn't show." **[Steve]**
- "You shouldn't be able to beat the game without going through a majority of game content." **[Steve]** 10-10
- "the member of the species worth inheriting the earth and taking a seat at the council." **[Steve]** 10-03

---

## 2. The "clear jobs" table was aspirational, not grounded

My v2 claimed: abilities = verbs, synergies = rules, gear = magnitude,
keepsakes = guarantees. Against today's code:

| Lever | What it actually does today | Verdict on my claim |
|---|---|---|
| **Abilities** (118) | **41 have a button**; 36 are modifier-only; 41 have neither, working via scattered `hasAbility` checks. 8 of 10 build-around payoffs are wired; `crowd_favorite` and `cornucopia` are dead | "Verbs": true for a third |
| **Synergies** (57) | **48 are pure stat modifiers.** The `flags` arrays are never read by any code; behaviour is keyed by id in ~8 places. `blood_tracker` is inert. Sims have discovered **6 distinct synergies, ever** | "Rules": true for ~8 |
| **Gear** (215) | Weapons = flat `+bonus` on a 10–16 roll. Armor = a mitigation curve. **No shield item, no block action exists.** Gear-granted actions: Bind (rope), Gravity Well, Offer Food. The gear audit says gear stops deciding fights at waves 4–5 *by design* | "Magnitude": true, and it fades on purpose. My P1 gear makers (shield Block, spyglass Scout) **don't exist**, so I invented them |
| **Keepsakes** (38) | 0 have armor and 0 have a slot, so the bonded-beam-armor rule is **dead in data**. What's live: bond offers (non-combat: forage, hunt, cook, travel), `channelSentiment` (trauma relief / XP / arms feast surge), feast surge (×1.2–1.5 for 2 dawns) | "Guarantees": not a thing today. Real job: **fuel for the feast surge**, plus memory |

The deeper problem: the **sim bots never press ability buttons**. The
competent policy made 0 ability uses in 60 runs (panel, 240 runs total,
0.29 uses/run overall), and villagers made 0. So:
- Every sim-based god-path target in my PLAN (ascension rate 5–15%, path
  spread, god-fight length) **measures nothing** until a bot plays a build.
- The "ascension 12.5%" from 10-13 measured *holding* abilities, not using
  them.

---

## 3. Fight length

Measured on 107 baseline fights (waves 1–2, `sim-scale-wall-r16-dmgmath`):

| Mean | Median | p75 | p90 | Max |
|---|---|---|---|---|
| 7.1 | 5 | 9 | 17 | 37 |

- 46% of fights end in ≤4 rounds.
- Lost fights run long (median 8).
- Canon targets: wave 4 = 4–6 rounds, wave 5 = 7–10 rounds, "for a godhood build".

My v2 framing ("one decision per turn in a 2–4 turn fight: set up or cash
in") was built on the brief's number, not the game's.

---

## 4. The Table: is it satisfying? Not yet.

Verified in code:

- **It's a menu.** Path door → 3–4 beats of 2–3 options each, each nudging a
  path meter → 2 finals that only change closing text. 5–6 taps; a chain
  exercise walked all 7 paths with "zero failures" (`journey-endgame-r10.md:42`).
- **The build doesn't matter at the Table.** No `table*.js` file reads
  abilities, synergies, gear, equipped items or godhood. Combat counts only as
  ledger tallies.
  - The real tactical climax, the finale campaign (20 blades vs. a
    1,800–2,200 HP titan), only feeds a full-seat wave count.
  - So "godhood is how you win" (brief) has no wire to the win.
- **Light/dark is decided before you sit.** `tableBranch()` runs at entry
  from the ledger. Choices at the Table decide only fail vs. no-fail.
- **Light can't fail in 5 of 7 paths** (e.g. Feared fails at horror ≥5;
  light halves horror gains; the worst light walk peaks at 3).
  Assimilated has no fail check at all.
- **Dark fails by playing dark** (picking the in-character dark option),
  which punishes committing to the branch.
- **Feared dominates.** A first-option walker always got Feared; "All 8
  runs read as 'feared'". Meanwhile TABLE.md law 2 says "all seven equally
  tempting".
- **Trial by combat** (the one existential risk) is a solo duel against a
  monster built for 20 allies. Winning sets `terror = 10`, which no outcome
  reads.
- **Bug: an early Table soft-locks the win.**
  - Finishing before day 90 plays the full ending and epilogue, then
    `winDayFloorDefer` sets `phase = 'paths'`.
  - `tableOfferPaths` has exactly one caller (`table.js:410`, at entry), so
    the paths are never offered again.
  - `tableActive()` stays true, so ambient threats stay suspended for the
    rest of the run.
- **Reach:** 0–1 wins per sim suite (1/145 in `win-stats-deep`, a 0-blow
  run). No human has reached the Table on record.

**Reading:** the Table writes beautifully and prices the run honestly, but
as play it's a short, mostly unloseable menu whose outcome was fixed before
you sat down. Meanwhile the god-path work assumes the endgame rewards
builds. Right now it doesn't, at all. Designing god paths before deciding
what the climax *is* risks building another layer nobody's win depends on.

---

## 5. Questions only Steve can answer

1. **The brief:** did you write or approve it line by line, or is it someone's summary? Specifically "no new meters", "fiction-first rejected", "fights 2–4 turns".
2. **The climax:** what should the last hour feel like?
   - (a) the Table as a menu (fix bugs only)
   - (b) the Table as a played challenge where your build matters
   - (c) the finale campaign / titan fight as the climax, with the Table as the pricing epilogue
   - (d) something else
3. **Branch timing:** should Table choices be able to change light/dark, or is "earned before, voiced at the Table" the intent?
4. **Light-branch failure:** should it be possible to lose on the light branch?
5. **Day 90:** if the Table is ready early, should it (a) not convene until day 90, or (b) convene, then reopen at day 90?
6. **Fight length:** the median is 5, p90 is 17. What's the target, and is the long tail (lost fights grinding 8–37 rounds) a problem?
7. **Bots and builds:** should we build a sim bot that actually plays abilities (so sims can judge builds), or judge god paths by human playtests through debug scenarios?
8. **Keepsakes:** the "bonded sentimental vest blocks beams" rule exists in code but no keepsake has armor. Add keepsake armor, or drop the rule?
9. **Fusion Reactor vs. "does this let you skip dinner?":** is the Reactor the one deliberate exception?
10. **Muse's push:** I don't see it on GitHub. Every branch's newest commit is mine or older. Which branch/remote?
