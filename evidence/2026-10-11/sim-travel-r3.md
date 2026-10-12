# Long-run sim: TRAVEL & REGIONAL lever r3 (2026-10-11)

Lever 8, round 3. Worktree `sim-travel-r3`. Canon read first: CANON.md, SCALE.md.
Builds on r1 (grief-coalescing, commit 1a7a742c) and r2 (viewership retune).
The break-it r13 travel/map surface was explicitly not redone.

## The lever: unambiguous village names (r2's documented blank — FILLED)

**The blank:** duplicate-ish village names ("Emberhold" / "Emberhold the Red
Table") confused rumors and first-sight lines. Root cause: `_vaMakeSplinterVillage`
(`src/js/villageAgency.js`) named splinters `<parent name> <suffix>` while the
parent kept its name in `state.otherVillages`; a second schism of the same cause
made an EXACT duplicate. `genNameForOrigin('village', true)` (game.js:375) was
audited per the brief — its two call sites (7649: roster, 7825: babies) name
PERSONS, not villages; no village-name collision path there. No change needed;
documented.

**Design call** (Steve 2026-10-07: figure it out yourself, document it, he can
overrule): the splinter takes the cause's banner as a standalone proper name —
"The Red Table", "The Hungry Road", "The Bloodied", "The Quiet Ones",
"The Cast Out" — never "<parent> <banner>". The lineage stays in the rumor
copy, which already carries it ("A faction of Emberhold has split — …
they call the new fire The Red Table"). Uniqueness is enforced at creation
against every name in `state.otherVillages`: exact duplicates and
near-duplicates (one name containing the other, case-insensitive) retry with
the sanctioned ordinal mark — "The Red Table II", "III", … — so a second
schism of the same cause is numbered kin, not a twin. Exact numbers: 9 roman
marks (II–X), then `#11`+; old-scheme names in old saves ("Emberhold the Red
Table") still collide-correctly against new banners via the substring rule.

## Before/after on IDENTICAL seeds (schism storm: every cause × every village × 2, seeds 4242/7/99)

| measure | before | after |
|---|---|---|
| exact-duplicate name pairs | 15 / 20 / 15 | **0 / 0 / 0** |
| ambiguous near-duplicate pairs | 30 / 40 / 30 | **0 / 0 / 0** |
| splinter names carrying the parent's name | 30 / 40 / 30 | **0 / 0 / 0** |
| sanctioned ordinal-kin pairs ("X" vs "X II") | — | 35 / 70 / 35 |

Proof: `scripts/test-village-name-unique-20261011.js` — 24/24 × 3 seeds after
(12/24 before, failing exactly the uniqueness assertions).
Before-output archived: `scripts/test-village-name-unique-before-20261011.txt`.

The rumor now reads: *"Emberhold has split — the eaters walked. They call the
new fire The Red Table. Half of them were headed this way, or so the traveler
says."* — lineage legible, name unambiguous. Wrong-variant, journal note,
discovery rumor, and first-sight line all verified per-cause (sense script).

## Two small beat bugs found by this round's measurement (same area, fixed)

**1. Exiled answerer stalled a staged beat 47 days (hierarchy.js — FILLED).**
Seed 1's replay: the scholar was cast out by their own moot on day 37 (played
CRISIS beat, not silent). On day 63 a foreign 4-realm formed and the Binding
beat staged ("Emberhold's court summons Haven's speaker"). The winseek policy
then called `answerNationalChoice('swear')` 48 times over 47 days — every call
blocked by `_blockIfNotHaven` ("Haven's council doesn't take orders from the
road"), the beat never resolving, the block line spamming twice daily. A beat
that cannot be answered now dies aloud at the next day boundary — like every
other unanswerable beat — and no beat stages while the answerer is exiled (the
rung waits; staging resumes when someone can answer):
*"📯 The Binding never happens — Haven's voice walks the road in exile, and no
court waits on an outcast. The offer dies unmade; the climb can begin again."*
Same treatment for a pending Watchers. Proof:
`scripts/test-exiled-beat-dies-20261011.js` — 33/33 × 3 seeds (kill-aloud,
no stage/kill loop, no re-stage while exiled, non-exiled beats untouched,
security wrap still blocks).

**2. "A walks into the light" (hierarchy.js beat copy — FILLED).** The Watchers'
champion line took `displayName(rep).split(' ')[0]` — but an unnamed
representative's displayName is a stranger descriptor ("A person, maybe 30s,
with a limp"), yielding *"A walks into the light"*. New `_repName()` helper:
known people read as first names, descriptors are used whole —
*"A person, maybe 30s, with a limp walks into the light for seven days"*.
Applied to all 6 representative-naming sites in hierarchy.js beat copy.

Also: winseek policy's `nationalAnswered` counter now counts only real answers
(it was counting blocked calls — the 48 phantom "answers").

## Baseline reachability (12 seeds × 200d, winseek — before vs after, identical seeds)

| measure | before (pre-fix engine) | after (fixed engine) |
|---|---|---|
| survival median / max | 32d / 110d | 32d / 110d (identical trajectories) |
| village-lost | 12/12 | 12/12 |
| death causes | — | **10/12 starvation-scattering, 2/12 no-successor** |
| first contact (rumor) | day 2–9 (2 seeds: none before death) | same |
| regional (Dawn) | 8/12, day 24–29 | 8/12, day 24–29 |
| national staged | 1 (the unanswerable exiled Binding) | **0** (no staging while exiled — intended) |
| national reached | 0/12 | 0/12 |
| global (Watchers) | 0/12 | 0/12 |
| foreign 4-realm formed | 1/12 (seed 1) | 1/12 |
| max wave reached | 3 (seeds 1, 9) | 3 |
| wave deed bars (best) | 14/8/3/0/0 | same |
| Arc reach (6 sampled seeds) | — | **II + III all six; IV 0/6** |
| table / won | 0 / 0 | 0 / 0 |

Data: `scripts/sweep-travel-r3-baseline-s1.json`, `scripts/sweep-travel-r3-after-s1.json`.
The naming change is display-only (no system reads village names for logic —
the one name-keyed lookup is the drifter loop's `pastVillages`, unrelated), so
reachability is unaffected; the exile-beat change only kills beats that were
previously stalled, never answered ones.

**Reachability verdict:** the ladder's rungs are all mechanically walkable
(regional healthy; national staged organically; beats answerable by script;
Watchers staged+answered by script), but organic reach stalls at regional —
the binding constraint is survival (median 32d vs the ladder's ~100d pacing),
not the beat mechanics. 10/12 villages starve ("The scattering, again").
National/global/table stay decoration until villages live past ~day 60.

## Sense-testing (transcripts read — Steve 2026-10-11)

- **Schism, all 5 causes:** *"💔 A faction of Emberhold has turned cannibal —
  and split. The eaters walked. The Red Table is a new fire in the world now —
  2 people under Maya."* Journal: *"Emberhold split (cannibal). The Red Table
  formed; 3 petition at Haven's fire."* Every parent/splinter pair now reads as
  two fires. The hardline schism correctly petitions 0.
- **Organic proof:** the seed-1 replay (post-fix engine) grew a schism on its
  own — *"a village to the southeast called The Bloodied"* and *"The Hungry
  Road has bound itself to Emberhold"* appear in real rumor traffic.
- **The Binding as a moment:** the trader news lands first — *"Word comes late,
  through traders: Thornfield has bound itself to Emberhold. The region's map is
  being redrawn — not by Haven."* — then the System: *"You are not the head of
  this. That is the point. A realm of 4 fires — and Emberhold wants Haven's
  oath. The audience LOVES a binding."* — then the summons with real choices
  (swear/serve/walk/refuse-the-scale). It feels like a moment because the
  region moved first and Haven is reacting.
- **The Watchers as a moment:** *"Forty. You see the number. THE WORLD IS
  WATCHING. Broadcast tier: planetary… This is not the table. The table comes
  later."* + *"The feed floods in — fan art, messages in languages nobody
  speaks, a countdown that isn't yours."* Champion and decline answers both
  land (decline: *"The galaxy watches you say no — and remembers.
  (Viewership -10.)"*).
- **Villagers act like people:** *"A runner from The Red Table, dusty and
  direct: 'Your foragers are stripping our side of the southwest ground. Back
  off — or we'll talk with teeth.' (Trust -3. The commons cuts both ways.)"*
  A 2-day-old cannibal splinter disputing the commons — alive.
- **Copy wrinkle (documented, not fixed — r13's surface, lever discipline):**
  the first-sight template says "They've been here the whole time." even for
  9-day-old splinters. The template doesn't know the fire is new.

## Village assessment (plain words)

The winseek villages court hard and die young — first links by day 3–8, the
Dawn at day 24–29 once the 21-day bond matures, then starvation by ~day 32.
Seed 1 is the type specimen of the new world: its scholar was cast out by
their own moot on day 37 ("CRISIS — THE SCHISM. You are cast out."), walked
the road while the region climbed without them (a foreign 4-realm, an organic
schism), got summoned to a Binding they couldn't answer, and starved on day
110. The region lives: pairs become realms, schisms fire, traders carry the
news late and sometimes wrong. What's missing is still time — nobody lives
long enough to finish the climb, and food, not monsters, is what kills them.

## Blanks filled vs documented

- FILLED: duplicate-ish village names (r2's documented blank) — engine fix +
  proof test + before/after on identical seeds.
- FILLED: exiled-answerer beat stall (found this round via the seed-1 replay) —
  engine fix + proof test; organic replay confirms one clean death, no loop.
- FILLED: "A walks into the light" rep-name bug (found this round via the
  Watchers sense read) — `_repName()` + all 6 beat call sites.
- FILLED (drive-by): winseek `nationalAnswered` counted blocked calls.
- DOCUMENTED: national/global/table/Arc IV/waves 4–5 unreachable organically —
  survival (median 32d) is the binding constraint, not mechanics.
- DOCUMENTED: first-sight "They've been here the whole time." on young
  splinters (r13 surface area).
- DOCUMENTED (pre-existing, verified identical on pristine HEAD):
  test-scale-ladder-20261010 24 failures (stale vs the 21-day Dawn pacing —
  current test-scale-pacing.js ALL GREEN), test-national-shapes 3 wave-5-gate,
  test-ledger 93/2 mantle, test-viewership-deed-20261011 2 (polity-qualify
  cascade).

## Files

- `src/js/villageAgency.js` — splinter banner naming + `_vaUniqueVillageName` /
  `_vaNameAmbiguous` / `_vaStripNameMark` (+ontology rule + provides)
- `src/js/hierarchy.js` — exiled-answerer beat death + no-stage-while-exiled
  (`_checkNational`, `_checkGlobal`), `_repName()` + 6 call sites (+2 ontology
  rules + provides)
- `scripts/policies/winseek.js` — `nationalAnswered` counts real answers only
- `docs/ONTOLOGY.md` — regenerated (83/83 validated)
- `scripts/test-village-name-unique-20261011.js` — 24/24 ×3 seeds (proof)
- `scripts/test-village-name-unique-before-20261011.txt` — before-state archive
- `scripts/test-exiled-beat-dies-20261011.js` — 33/33 ×3 seeds (proof)
- `scripts/sense-travel-r3-20261011.js` — transcript capture (schism ×5,
  seed-1 replay, Watchers)
- `scripts/measure-deathcause-20261011.js` — death-cause shares
- `scripts/sweep-travel-r3-{baseline,after}-s1.json` — 12-seed before/after data

`[needs-eyes]`: copy changes throughout (village names in rumors, beat death
lines, representative naming) — Steve should read "The Red Table" in a rumor
and the exile-beat death line on his phone.
