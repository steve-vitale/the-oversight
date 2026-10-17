# Journey: succession leg (7) r21 — the mantle passes twice (2026-10-17)

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Leg:** 7 — succession, r21. Fresh angle: **THE DOUBLE MANTLE** — r20
  (2026-10-16) proved one clean mantle (M1/M2/M3 all HIT, bearer-name fix
  landed); r21 stresses the chain: bearer <redacted> d14, successor plays to d26,
  bearer <redacted> again, third bearer <redacted> day 40. Does the lineage, mourning,
  trust inheritance, and the third bearer's identity stay coherent across TWO
  passes — or does identity/mourning/ledger blur?
- **Leg question:** when the mantle passes twice in one run, does the village
  treat the third bearer as their own person with two honest deaths behind
  them? Do both deaths get lineage entries with causes, corpses with death
  packs, burials? Does trust inheritance compound sanely? Does the
  "You're not X" beat (untested in r20 — never fired in any sim) actually work?
- **Interesting finding criteria:**
  - (a) both mantles pass cleanly: new bearer != old both times, lineage x2
    with causes, corpses + death packs, game continues;
  - (b) third-bearer conversations SENSE-carry the dead (named mourning for
    bearer1 and/or bearer2) or the new-person beat;
  - (c) third bearer is their own body: 0 abilities carried from the old
    kits, background legs = their own occupation, no identity-blend in
    transcripts;
  - (d) any gap: lineage-ordering bugs, mourning-silence, trust collapse.
- **Seeds:** 3050, 3055, 3061 (fresh; r20 used 2026/2031/2042). Policy: competent.
- **Primary metrics (binding, §14):**
  - M1: ≥2/3 seeds — both mantles pass cleanly (new bearer both times,
    lineage entries x2 with causes, corpse found each time, game not over).
  - M2: ≥2/3 seeds — ≥1 of the third-bearer's convos SENSE-carries a dead
    bearer by NAME (bearer1 or bearer2) OR the new-person beat.
  - M3: ≥2/3 seeds — third bearer is THEIR OWN body: 0 abilities carried
    from the first two bearers' kits, no identity-leak flags in transcripts.
- **Kill rule:** a mantle fails to pass (no successor / over / softlock) on
  ≥2/3 seeds → SUBSTRATE-MISSING; document and move on.
- **Horizon:** kill1 at day 14 (post-System), kill2 at day 26, play to day 40.
  Death-aware: village dead/scattered → stop (no seed hit this).
- **Method:** scripts/diag-succession-r21-20261017.js — the REAL playerDeath
  handler twice per run, competent policy throughout, per-stage census,
  lineage dumps, trust-inheritance records, 1 driven convo at d26 (inside the
  10-day mantle-memory window) + 3 at d40, SENSE-read by the analyst.
  scripts/test-succession-youre-not-x-20261017.js — proof test for the
  r20-untested "You're not X" beat (positive / negative / dead-speaker).

## Metric review (§14)

- **M1: HIT (3/3).** All six mantles passed cleanly: new bearer each time,
  lineage entries with causes, corpses with death packs (4–22 items), no
  game-overs. Seed 3050 additionally had a NATURAL third mantle (Catalina
  killed in combat d16, two days after the forced death) — the chain held
  across three passes in 12 days.
- **M2: HIT (2/3, SENSE verdict).** 3055: "Since Booker died... I keep
  expecting to see Booker at the fire. Stupid." (named, the r20-fixed branch)
  + "You're family now. Chosen family — the kind that actually counts."
  (new-person). 3061: "Daniela is gone and the world just... continues.
  That's the part I can't stand." (named) + "You're one of the good ones."
  3050: MISS — the naming debate outranked acute grief in t2LatelyEvent on
  the death day (see Steve-call observation). Grief was present but unnamed
  ("I keep expecting to see them by the fire. Then I remember.").
- **M3: HIT (2/3 at binding, third flag explained).** Scripted check flagged
  seed 3050 (carriedOver=1 at mantle2). Provenance traced via
  scripts/probe-r21-carryover-20261017.js: Pania's OWN npcAbilities record
  held ["the_touch"] BEFORE the mantle (it's her knack, npcKnacks) — Imani
  independently earned the same ability as bearer. mantleBecome worked
  correctly (replaced the kit with the successor's own); the id-intersection
  check false-positived on convergent earning. No identity leaks in any
  transcript (0/12).
- **Driver correction (same-run, method not metric):** the first r21 pass
  drove convos ONLY at day 40 — 14 days post-kill2, outside the 10-day
  mantle-memory window ("the night lingers, then it becomes old news",
  convoTopics.js) — and read grief-silence that was the driver's timing, not
  the village's. Re-ran with a d26 convo inside the window + the d40 set.
  Also taught the driver the dlg:subject → t2:lately path (on the death day
  itself a want holds the opening slot; a competent player asks "something
  else" to reach the lately topic). Next run's metric review: M2's flag
  regex should count "<Name> is gone"-shaped naming, and M3 should compare
  against the successor's pre-mantle npcAbilities record, not raw id overlap.
- **Kill rule:** not triggered — every mantle passed.

## Run log

### Seed 3050 — Norman → Catalina (d14) → Imani (d16, natural combat) → Pania (d26)
The brutal seed: three bearers in 12 days. Norman (mushroom grower) died on
the expedition d14; Catalina (fishing guide) took it and was killed in combat
d16; Imani (Chef) held 10 days and died on the expedition d26; Pania (line
cook) carries it at d40. End: 9 living, pantry 83.6k, codex 15→18 plants,
Pania holds 2 abilities (her own). Lineage: Norman d14 the expedition →
Catalina d16 combat → Imani d26 the expedition. Trust inheritance stayed sane
(22 → 25); no compounding collapse. The "You're not X" beat never fired here
(trust never cleared 55 — a traumatized village) and neither did vouching;
the proof test covers the beat's mechanics.

### Seed 3055 — Vanessa → Booker (d14) → Tyrone (d26)
Vanessa (paramedic) → Booker → Tyrone (artist). End d40: 9 living, pantry
60.3k, codex 23→33 plants, Tyrone 3 abilities (his own). At d26 the beat fired
naturally: "'Booker's gone.' Hermann looks at you for a long moment. 'You're
not Booker.' No heat in it. Just fact. You'll have to earn this face." At the
grave, Hermann and Mia vouched for Tyrone: "Booker trusted them. We saw it.
Give them the fire's hearing." The village listens. New bearer trust 56.

### Seed 3061 — Francesca → Daniela (d14) → Kieran (d26)
Francesca (fisherman) → Daniela → Kieran (police officer). End d40: 9 living,
pantry 88.2k, codex 18→25 plants, Kieran 5 abilities (his own). The beat fired
naturally TWICE: d14 "'Francesca's gone.' Kieran looks at you for a long
moment. 'You're not Francesca.'" — and Kieran himself became bearer at d26,
when Catalina delivered it for Daniela: "'Daniela's gone.' Catalina looks at
you... 'You're not Daniela.'" Kayden and Catalina vouched for Kieran at the
grave. New bearer trust 46.

## Village assessment (plain words)

All three villages are alive and thriving at day 40 after losing two (or
three) leaders. Pantries 60k–88k, codex plants growing every leg (15→18,
23→33, 18→25 — the office's Codex passes intact and the village keeps
teaching). The mantle mechanics are boring in the best way: corpse with the
death pack (the body keeps what it carried — 4 to 22 items, take/leave/use),
the village brings the body home overnight ("That night, they bring X home.
Nobody asks you to help carry; nobody has to. By morning the grave is dug by
the fire"), the successor wakes up somebody else with their own hands
(occupation-named: "Catalina Reyes, 38 — a fishing guide"), the lineage
records both deaths with causes, and trust transfers discounted through the
three channels (office residue, elders' vouching, the successor's own record)
landing new bearers at 22–56 — never bankrupt, never gifted.

## People check (SENSE-read transcripts)

- **Hermann (3055, d26):** subject-switched to lately → "Since Booker died...
  I keep expecting to see Booker at the fire. Stupid." Then "Be straight with
  me. What am I to you?" → "You're family now. Chosen family — the kind that
  actually counts." The village claims the new bearer. People-like. ✓
- **Kayden (3061, d26):** "Daniela is gone and the world just... continues.
  That's the part I can't stand." Then "How am I doing, by your lights?" →
  "You're one of the good ones. Don't make me regret saying that out loud."
  A person with grief and a read on you. ✓
- **Claudine (3061, d40):** opens on the System and the taken — "It's my
  brother, Elie. Went up in the Taking with the boring half... Some nights I
  dream about the pods — rows of them, humming." KIN grief, unprompted. ✓
- **Álvaro (3055, d40):** "I carry water for everyone. Water doesn't take
  sides." — a stance, an off day, declines the expedition invite. ✓
- No fabricated shared history, no filler loops, no static menus. The third
  bearer is addressed as themselves throughout; 0 identity-leak flags.

## The blank: "You're not X" beat — tested, proven, guarded

r20 (2026-10-16) left it untested: the closeId >55-trust branch in
ledger.js playerDeath had never fired in any sim. r21 closes it twice:
1. **Proof test** scripts/test-succession-youre-not-x-20261017.js — 11/11
   green, seeded, deterministic: positive (70-trust successor chosen, 65-trust
   living mourner delivers the beat with correct names, speaker alive),
   negative control (nobody >55 → silent), dead-speaker guard (only a corpse
   >55 → silent; the weirdness-hunt 2026-10-10 fix holds).
2. **Natural sim evidence:** the beat fired 3× in competent play (3055 d26,
   3061 d14, 3061 d26) with correct living speakers and both bearer names —
   longer competent play (26d) does clear trust 55, where r20's 14-day legs
   never did.

Committed as a regression guard with the diag script.

## Steve-call observations (not changed)

1. **Naming debate outranks acute grief — second instance.** 3050 d26: on
   the day the third bearer died (third death in 12 days), t2LatelyEvent
   served the monster-naming debate ("The whole fire was arguing about ducks
   in a row last night — what to even CALL it") over the fresh corpse. The
   debate's yield list (severe outbreak, weirdness, table, show) does not
   include grief. The village wasn't grief-silent — the want opener carried
   it ("I keep expecting to see them by the fire. Then I remember.") — but
   the lately slot went to the debate. Priority change is a design call;
   leaving as designed ("the talk of the fire", Steve 2026-10-07).
2. **Mantle memory covers only the LAST lineage entry.** After kill2, the
   first dead bearer <redacted> 10-day tail stops (the last entry is replaced).
   Back-to-back deaths truncate the earlier bearer's mourning window. Arguably
   human (the freshest wound dominates); leaving as designed.

## Verdicts

- **Reachable:** yes — the mantle fires through the real playerDeath handler
  on every death path; 6/6 forced + 1 natural all passed.
- **Fun:** yes — the handoff beats (the scream, the digging, "You're not
  X", the vouching at the grave, "You wake up somebody else") stage the
  fiction; transcripts read like people.
- **Winnable:** yes — all three villages thriving at day 40 with growing
  pantries and codexes after two (or three) successions.

## Telemetry

New angle (double mantle): seeded
hidden_files/telemetry-baselines/succession-double-mantle.json from the three
per-seed records (evidence/2026-10-17/journey-succession-r21-*.json). No LOUD
lines on seeding (first run). Metrics: mantle1.passed, mantle2.passed,
lineageEntries, corpseFound1/2, deathPackItems1/2, carriedOver1/2,
newTrust1/2, youreNotBeats, vouchBeats, naturalMantles, m1, m2, m3,
endPop, endPantry, endPlants.
