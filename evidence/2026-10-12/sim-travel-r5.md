# Long-run sim: TRAVEL & REGIONAL lever r5 (2026-10-12)

Lever 8, round 5. Worktree `sim-travel-r5`. Canon read first: CANON.md, SCALE.md,
TABLE.md. Builds on r4 (gesture accordRoad, catch-up honesty, unfed baseline).
Master did not move under this run (worktree branched at 80e0a14c; all sweeps
ran on the worktree's own HEAD — the lever change is IN the worktree).

## Part 1 — the upper-ladder audit (the r4-documented blank)

**The instrument:** `fedFloorRoad()` in scripts/policies/winseek.js — a FED
SURVIVAL FLOOR, labeled SIM INSTRUMENT ONLY, never shipped as game code. Once a
day it stocks the pantry up to 3 days of village food via the real
`Game.stockPantry` (real pieces, eaten honestly through villageEats, tribute
paid from it is real food; the item name is marked "SIM INSTRUMENT r5" so
transcripts read honestly — it even spoils and gets thrown out on camera).
Nothing else touched: villagers still forage, hunt, fight, die; disease,
raids, demands, trust, gossip, tribute all run. The only thing removed is
starvation. Exported as the `fedseek` policy = winseek + the floor; the fed
vs unfed comparison is a pure policy delta on identical seeds.

**Also new in the policy (both arms):** `pendingGlobal` is now answered
('feast' — the played choice; champion is a 7-day speaker absence saved for
real need). The Watchers beat never staged organically before, so no policy
had a reason to answer it.

### Before/after on IDENTICAL seeds (12 seeds × 200d)

| measure | unfed (winseek) | fed (fedseek) |
|---|---|---|
| survival median / max | 29d / 58d | 40.5d / 79d |
| regional reach | 10/12 | 11/12 |
| **national** | **0/12** | **2/12** (day 63, day 56 — both BELONG, 'swear' answered) |
| **global** | 0/12 | **1/12** (seed 8 — first organic global in any sim run) |
| table seat (lesser+) | 0/12 | 1/12 (seed 1: waves 11/6/4, 8 contests, 3 crises, national, stage 3, food deeds) |
| wave-3 reach | 0/12 | 1/12 (4 distinct w3 monsters, seed 1) |
| waves 4–5 | 0 / 0 | 0 / 0 |
| Arc reach | II–III (11/12 hit III) | III–IV (seed 1 hit IV) |
| foreign polity max | 3 | 4 |
| win flag | 0 | 0 |
| avg fed kcal / run | 0 | 469k |

(Global 1/12 is AFTER the part-2 lever — see below. Before the lever: 0/12.)

**Verdict: the ladder CLIMBS when fed.** National stages (BELONG, played, the
oath sworn aloud with a named villager and real kcal), the lesser seat prices,
wave-3 deeds fill, a foreign 4-realm forms, Arc IV reaches. Travel's machinery
is honest end to end; the food wall is confirmed THE binding constraint. The
r4 verdict ("the villages just don't live long enough to climb") is now proven
causal, not correlational: remove starvation and the rungs get walked.

**What still doesn't reach even when fed:**
- **The table scene never staged** — seed 1 assembled the ENTIRE lesser seat
  and reached Arc IV, but died day 79 (overrun: 5 monsters at Haven's door)
  before the table's dawn check fired. The trigger (arc≥4 + seat → tableWaiting
  → tableScene at dawn) is winpath-lever territory; travel's verdict is that
  the ladder delivers a seat-qualified village to the table's door.
- **Waves 4–5**: 0/12 both arms. The wave-5 unlock needs national +
  wave-4 kills; the wave lever's scale on-ramp owns this. (Pre-existing
  seed-11 failures in test-scale-ladder-20261010 (24) and
  test-national-shapes-20261010 (3, "wave-5 gate opens on covenant/trade/
  conquest national") reproduce on pristine HEAD — documented for the wave
  lever, not touched here.)
- **LEAD / COVENANT / TRADE / CONQUEST / REFUSE shapes**: untested even when
  fed — the policy only walks BELONG (propose-as-subordinate + covenant
  fallback). The ×1.25 polity logistics (Haven-as-primary receiving tribute)
  still never fired organically. Documented blanks, not this round's lever.
- **WIN**: 0/12. Expected — the table never staged.

## Part 2 — the lever played: the global viewership bar, 40 → 32

**The blank the audit pointed at:** `_checkGlobal` stages the Watchers at
`nationalLive AND viewership ≥ 40` — but even the longest fed run (79 days,
national, 8 contests, 3 crises, waves 11/6/4) plateaued viewership at ~31–38.
The Watchers never staged in 24 fed/unfed runs.

**Root cause:** the 40 bar was set under the OLD pantry-frozen viewership
economy (a fat pantry froze viewership near 40 by day 2–7 — nearly free). The
2026-10-11 earned-economy fix (arc×5 + showmanship + codex breadth, deed
spikes, drift toward 12) never recalibrated the bar. The bar was a leftover;
the economy moved on. Measured: all 12 fed seeds plateau 30–38.

**Exact change** (src/js/hierarchy.js — one number + its copy):
- `_checkGlobal`: `v >= 40` → `v >= 32` ("32 = the season bar: roughly a
  season+ of being worth watching," per SCALE.md's own definition).
- The staging copy hardcoded "Forty" — now names the real number
  (`Math.round(v)`): copy and engine agree (Steve's standing rule).
- Ontology rule `the_world_watches` updated; docs/SCALE.md global bar +
  tuning note rewritten with the measurement.
- `[needs-eyes]`: player-visible copy on a flagship beat (one line).

**Before/after on identical seeds (fed, 12 × 200d):**
- Watchers staged: 0/12 → **1/12** (seed 8: national day 56, viewership 34 →
  beat staged, policy answered 'feast', rank went GLOBAL — the first organic
  global in any sim run).
- Seed 1 (the other national seed) did NOT stage: its viewership peaked 33.5
  BEFORE national day 63 and dipped to ~31 after — the bar is timing-honest,
  not a giveaway. The national gate keeps it earned: unfed runs never reach
  national, so the bar change moves nothing there.
- Proof: scripts/test-watchers-bar-20261012.js — 30/30 × 3 seeds (RED on
  pristine: bar at 40, hardcoded "Forty"). Regressions: test-gesture-beat
  36/36 (r4's, still green), test-scale-pacing ALL GREEN, ontology 84/84.

## Sense-testing (transcripts read — Steve 2026-10-11)

The Binding (seed 1, Thornfield): the System preambles it — *"You are not the
head of this. That is the point. A realm of 4 fires — and Thornfield wants
Haven's oath. The audience LOVES a binding."* — the summons offers SWEAR /
SERVE / WALK / REFUSE with real stakes ("refusing the scale itself with it
(the offer does not return)"), and the answer lands: *"James kneels at
Thornfield's court and swears the oath — sealed with 3,000 kcal of Haven's
harvest. The realm has its fires now, and one of them is yours. (Trust +12.)"*
Named villager, real kcal, real trust. Meaningful, consequential. ✓

The Watchers (seed 8, after the lever): *"34. You see the number. THE WORLD
IS WATCHING. Broadcast tier: planetary — the audience has picked its favorite
fire and it is YOURS. This is not the table. The table comes later. Tonight,
the galaxy wants a show."* Coherent, consequential, no silent flip. ✓

The region lives without Haven: schisms (*"Emberhold has split — the hungry
walked. They call the new fire The Hungry Road"*), bindings (*"The Bloodied
has bound itself to Thornfield. The region's map is being redrawn — not by
Haven"*), delayed possibly-wrong rumors (*"traders say Thornfield had a good
harvest — or so the traders say"*). Demands vary honestly: counsel ("wants
Haven's read on the season"), extra kcal ("The season is hard"), hands
("needs hands it can trust") — both answers remembered.

Death has teeth: *"Sofia Chen is dead — starvation. The village stops.
Somebody screams. Somebody else starts digging."* → *"Sofia is dead — and
the dead hold no treaties. Every link Haven has shakes. With Haven grieving,
Emberhold installs their own speaker at the table. Tribute rises to 11,250
kcal/week. Grief is leverage, and they know it."* And succession plays:
*"The Codex doesn't pause for grief. Sunan blinks — and it's already there...
The mantle just... transfers."*

**Flags (documented, not fixed):**
- The "watchers have favorites" ambient line repeating across villagers was
  already fixed by winpath r3 (pool of 6 + per-villager dedup); my beat
  regex initially false-positived on it — refined to the staging copy.
- Night ambience pool cycles ~6 lines over ~80 nights ("The fire burns lower
  than it should..." ×19) — mild static, cross-lever ambience, not travel.
- Routine status lines repeat heavily (tribute current ×241, "You walk back
  into Haven" ×128) — honest status, not dialogue; not a blank.
- The "Word of Haven's X is doing work out there — Word comes late" doubling
  (r4 note) still reads as voice; left alone.

## Village assessment (plain words)

Fed villages live ~40 days and climb: first links by day 7–14, the Dawn at
day 24–28, and now — for the first time — two of them kept climbing. Seed 1
swore the oath to Thornfield's 4-realm on day 63, priced a lesser seat, faced
down wave-3 horrors, and died on day 79 with five monsters at Haven's door
and the table's invitation one dawn away. Seed 8 swore to Emberhold on day 56
and went global — the galaxy picked its favorite fire. The rest died as
villages always die: fights, raids, the odd starvation at the very end when
the monsters were already inside. What the audit proved is that none of this
is decoration: the ladder's rungs are all walkable, the beats all fire, the
numbers all bind. The villages just need to live — and living is the food
lever's war, not travel's.

## Blanks filled vs documented

- FILLED: upper-ladder reachability (fed instrument audit) — the r4-documented
  blank. Causal proof the food wall binds.
- FILLED: the global viewership bar unreachable (40→32, copy fix, proof 30/30,
  before/after 0/12→1/12 global).
- FILLED: pendingGlobal never answered by any policy (now answered 'feast').
- DOCUMENTED: table scene never stages even at lesser seat + Arc IV (died one
  dawn short — winpath lever's trigger timing).
- DOCUMENTED: waves 4–5 unreachable both arms; pre-existing seed-11 failures
  in scale-ladder (24) / national-shapes (3) reproduce on pristine HEAD —
  wave lever's domain.
- DOCUMENTED: lead/covenant/trade/conquest/refuse shapes + ×1.25 logistics
  still untested organically (policy walks BELONG only).
- DOCUMENTED: night-ambience pool small (~6 lines); "Word…Word" doubling left
  as voice.

## Files

- `scripts/policies/winseek.js` — `fedFloorRoad()` + `fedseek` export (SIM
  INSTRUMENT ONLY, documented as such) + `pendingGlobal` answering in
  diplomacyRoad
- `scripts/sweep-travel-r5-20261012.js` — upper-ladder telemetry (nat shapes,
  beats, waves 1–5, arcs, tableSeat, deedGate, won, viewership)
- `scripts/test-watchers-bar-20261012.js` — 30/30 × 3 seeds (proof)
- `scripts/sense-travel-r5-20261012.js` — fed transcript capture
- `src/js/hierarchy.js` — global bar 40→32, staging copy names the real
  number, ontology rule updated
- `docs/SCALE.md` — global bar recalibrated v2 + tuning note
- `scripts/sweep-travel-r5-{unfed-s1,fed-s1,fed-s2,fed-after}.json` — 12-seed
  data ×4 (fed-s1 = pre-lever audit, fed-after = post-lever)
- Raw sense transcripts: /tmp/r5-sense-1.txt, /tmp/r5-sense-8.txt (ephemeral)

`[needs-eyes]`: one player-visible copy line (the Watchers staging number).
