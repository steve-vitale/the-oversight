# Conversation rebuild — evidence (2026-10-11)

## Background audit

Worker B — villager background/personality/voice **generator** audit (Steve: "backgrounds have a lot of errors yet"). Fixed generators, not instances.

### Proof script
`scripts/test-background-audit-20261011.js` — seeded (mulberry32, default seed 20261011, `SEED` env/argv override), generates N villagers across ≥4 origins via `Game.genRoster`, runs automated checks, prints per-villager report (`VERBOSE=1`) + PASS/FAIL summary. Check classes:
- **E1-slot**: unresolved `{tokens}` in any stored text (backstory, talk, quest, assessment, wound/want/event/places/people, keepsake resolve)
- **E2-dup**: verbatim sentence (≥45 chars) shared by 2+ villagers **within one roster** (one expedition); **E2-street**: shared lifeseed place name within a roster
- **E3-***: grammar heuristics — articles (`a`/`an` w/ silent-h + letter-name exemptions), doubled words, learn/learn echo, spacing, capitalization after `. ` (ellipsis-exempt), quote balance
- **E4-***: contradictions — pronoun, maritime (sailor w/o water), occupation-trade (data-derived distinctive words), kin, region, kin-name gender vs relation
- **E5-***: voice/personality mismatch — temperament without voice profile, without assessment-pool coverage (verified against `src/js/game.js` source), System assessment contradicting temperament

### Before/after
- **Before** (seed 20261011, 30 villagers): **278 errors**; seed 777: **309 errors**
- **After**: **0 errors** — 12 seeds × 30 villagers (360 villagers) all PASS, plus negative control (old generators → 174 errors incl. the new check classes)

### Error classes found & fixed (all in generators)
1. **Leaked `{kin}` slots** (52–60/30 villagers) — wounds, events, places referenced `{kin}` but `fillBasic` never resolved it. Fix: `fillBasic` resolves `{kin}`; places get a second pass (`src/js/lifeseed.js`).
2. **Leaked `{an_occ}`/`{Occ}`/`{hope}` in stored talk/quest** — `fill` in `genCharacter`/`hydrateSeed` didn't cover them (only `fillTalkLine` at render did). Fix: extended both `fill` closures; mirrors in `src/js/game.js`.
3. **"the the {workplace}"** — article collapse. Fix in `fillBasic`.
4. **Hardcoded "5th" street** — every villager's street. Fix: 12-name `{street}` pool; `"the depot on 5th"` → `"the depot on {street}"` (`src/data/lifeseeds.json`).
5. **Identical 6-line `quest` arrays on every villager** (147–152 dup hits) — quest is dead data (no consumers in src/js or docs) but the unique-person law still applies to stored text. Fix: rewrote all 6 templates so every sentence carries identity (`{first}`/`{an_occ}`/`{occ}`/`{hope}`/`{origin}`); no sharable sentence >45 chars remains.
6. **"What X wants now is simple:" boilerplate** (Steve-flagged) — replaced with a natural third want variant.
7. **Pronoun bugs** — wound `themself` → herself/himself/themself by `char.pro`; want "longer than they do" pronoun-aware; `synthPrototype` Know lines pronoun-neutral (`src/js/conversation.js`).
8. **"ashley's level"** — `howLower` lowercased leading kin names. Fix: keep leading capitals.
9. **6 temperaments with no voice profile/assessment** (sardonic, earnest, fidgety, stoic, mischievous + anxious talk) — added 6 voice profiles (`characterGen.json`), `feelByTemp` + `_assessPool`/`_assessClose` + `tempSec` + `REG_BY_TEMP` coverage (`game.js`, `conversation.js`, `journal.js`); anxious `temperamentTalk` brought to 8 lines.
10. **Per-expedition duplicates**: talk lines, assessment openers/closers (sentence-level), backstories, wants, secrets, event+frame combos, place names, polyglot-language reasons ("learned English for work — the job demanded it" → "learned English on the job as a pilot") — all deduped via per-roster registries reset in `genRoster`.
11. **Shared lifeseed events verbatim** — same event + same frame = identical sentence. Fix: 6 event frames (2 `{first}`-anchored), prefer unused event+frame combos per expedition (shared history preserved, verbatim never repeats).
12. **Place-kind monotony** — generator only ever used kinds home+cache (12 names for the whole cast). Fix: draw 2 random kinds from all 14.
13. **`{skill}` sentence-initial lowercase** ("currency. making do today") — template recast with em-dash.
14. **Skill-how framing** (sense-read): "learned canning learning the pop" (learn/learn echo) → "the hard way: the pop…"; "learned husbandry Seamus's rule" → "from Seamus's rule"; "learned never getting lost the constellations" → "from the constellations…".
15. **"Priya's father Joseph his chair's been empty"** — fate reworded to "hasn't sat in his chair since the sky changed".
16. **"Larry — Joshua's niece"** — kin gender filter missed niece/nephew/older/younger siblings. Fixed.
17. **Owner-gendered item flavors** (rope_50ft, whetstone, bus_map, tasting_spoon, reading_glasses) neutralized; wrote `memory` text for the 8 sentimental items lacking it; fixed double-escaped `\u2014` and leftover "He's never"/"His father" tails (`src/data/items.json` — also fixed 10 pre-existing `test-lifeseed.js` failures).

### Existing suite results (post-fix)
- `test-lifeseed.js`: 329 pass / 100 fail — baseline (stashed) was 320/109; remaining 100 fail identically pre-fix (95 alien-loot "semantic link", 5 sentimental `reveals:null` — a pre-existing flashback-system data gap, out of scope; inventing flashback reveals is a content-design call)
- `test-character-gen.js`: 8/0 ✓
- `test-charactergen-depth-20261007.js`: 1 pre-existing FAIL (`goals[2]` fields — fails on stashed tree too); updated its stale quest-fill model (`{an_occ}`/`{hope}` are real consumer tokens)
- `test-lifeseeds-expansion-20261007.js`: ALL GREEN ✓
- `test-lifeseed-identity-20261007.js`: throws pre-existing (both trees)
- `test-lifeseeds-kin-regions-20261007.js`: 9 failures pre-existing (compares against its own 2026-10-07 HEAD snapshot; repo HEAD has since added regions — fails identically on stashed tree)

### Known remaining / out of scope
- The 5 `reveals:null` sentimental items (documented above).
- `quest` remains dead data — now unique per villager, ready if Worker A's rebuild wires it up.
- Sense-reading is sampling-based by nature; the audit's heuristics can't catch everything (e.g. it needed a human read to find the learn/learn echo class). Re-run `VERBOSE=1` periodically.
