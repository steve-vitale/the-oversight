# Journey-succession r30 (lane B) — "THE CLOSE ON THE TIP" (2026-10-20)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question:** does the proven r27/r28 close (re-ask → commit → fulfill →
repay gratitude → favor 'thanked', promise kept=true, trust moved, no
zombies) still hold on the current tip? r28 (2026-10-19) found the
silent-thanks bug and landed the settle-on-speak fix (convo-wants.js); since
then ~1 day of sibling commits landed on master. This run replays the EXACT
r27/r28 profile (same forcing, same means gate, same trust rule, same
horizon) on fresh seeds 9501–9505.

**Prior art:** r20–r24 (names, double mantle, death pack, grief, exile
docket), r25 (open-book beat), r26 (re-ask fires 1/4 organic; the close
unproven — poverty break), r27 (close PROVEN 3/3 + promisee-heir moot fix),
r28 (regression watch: 3/4 closes + the silent-thanks REAL BUG → fixed),
r29 (chains hold across 3–4 deaths).

**Interesting-finding criteria:**
(a) closes hold at r28's rate → machinery stable; roll telemetry baseline;
(b) a close breaks at a named link → REAL BUG (regression);
(c) gratitude TEXT materially changed → content change documented (the r28
    fix's spoken-gratitude path is the thing under test);
(d) <2 seeds reach attempt → means-reachability finding (never re-scored).

**Seeds:** 9501–9505 (fresh). **Policy:** competent + honest convo driver,
ORCHESTRATE=1 (documented). **Horizon:** kill d16 via real `playerDeath`;
successor plays to d30–31. Death-aware: village dead/scattered → stop (no
seed hit this).
**Binding metrics:**
- M1: ≥3/5 mantles pass cleanly. **M2:** ≥2/5 reach the fulfill attempt.
- **M3:** ≥1 FULL CLOSE — and the gratitude must be SPOKEN (in transcript);
  silent settle = REGRESSION of r28's fix.
- **M4:** ≥2 repay/gratitude transcripts meet the quality bar.
**Kill rule:** mantle fails on ≥2/5 → SUBSTRATE-MISSING.

## What happened

**M1: 5/5 GO** — Rafael→Robin, Jose→Hank, Pearl→Quinn, Peyton→Willow,
Jason→Malik. Lineage entries with cause on all 5; villages alive at end
(9–11 living).

**M2: 3/5 GO** — 9501, 9502, 9503 reached the fulfill attempt. The two
misses have documented, distinct, honest causes (same classes as r25–r28):
- **9504:** the forced Devon/heal_help need DIED overnight (wound resolved —
  needLive=false by d19), so no re-ask could fire; Ursula's forage_help was
  live but the successor's pack was empty (0 edible units — the means gate
  correctly refused). The open-book beat fired and did its job: "📜 Peyton's
  book stays open on the table: one promise unkept — Devon — help Devon
  with their injury. The promises died with their maker; the needs didn't."
- **9505:** 0 setup-eligible needs in the 4-day forcing window (the village
  was healthy — no acute need). Clean book at death; open-book correctly
  silent. Same as r27/r28's finding (e).

**M3: 3/3 closes GO — all with gratitude SPOKEN in-transcript.**
- 9501: Aria, forage_help → "You came through on the pantry run. I won't
  forget it." favor 'thanked', promise kept=true, trust 54→66, 0 zombies.
- 9502: Lena, sick_help → "You came through on the sickness I'm fighting.
  I won't forget it." + "You kept your word. That's rare out here." +
  "Good — that favor, settled. Feels better said out loud." trust 86→89,
  0 zombies.
- 9503: Jesse, heal_help → "You came through on this wound. I won't
  forget it." trust 40→52, 0 zombies.
The r28 settle-on-speak fix holds on the tip: every close's gratitude was
spoken aloud, none settled silently, no replant needed. No regression.

**M4: GO (3/3).** All three repay transcripts meet the bar. Best — 9503's
commit scene, where the re-ask named the dead bearer honestly ("I asked
Pearl about this wound — Pearl's gone"), the commit transcript carried
specific grief ("Pearl is gone and the world just... continues"), and Jesse
honored Pearl with a real deed: "I taste the water before the others drink
for Pearl, now. Feels right. Feels like the least I can do." The NPC
wanted something real, the options engaged, the ending resolved. When the
loop closes, the village remembers the dead bearer by name AND by deed.

## Village assessment (plain words)

Five villages, all alive at day 30–31 (9–11 living each). The mantles all
passed cleanly — new bearers stepped into functioning villages and kept
them functioning. Three successors took up dead bearers' debts and the
villages heard the thanks spoken aloud, trust moving (+12, +3, +12). On two
seeds the villages were healthy or the needs churned before the successor
could act — clean books, no forcing, the open-book beat naming what was owed
anyway. Nothing was lost that the village didn't mark.

## People check

Full transcripts on every attempt plus the re-ask watches. The close
scenes keep their r27/r28 quality: specific gratitude, visible relief, the
kept-word memory firing. One composition note (documented, not fixed): 9503's
gratitude carries a trailing "...never mind" ("You came through on this
wound. I won't forget it. ...never mind.") — reads as the NPC trailing off,
not parroting, but it's a slightly awkward tail on the beat. Social-loop
territory if they want it. 9501's driver wandered through the usual
grief-pool exchanges (fine, honest filler, not fabricated history).

## Blanks filled / documented

1. **Observed, known class (no game change): the Jason Giordano stamp.**
   9503: Deirdre's 'asked' favor carries `inhFrom: Jason Giordano` — an
   NPC-side release (a promise released when the VILLAGER, not the bearer,
   died — betrayal.js r9 path, same class as r26's documented census-key
   conflation). The favor sat 'asked' with a live need; the driver correctly
   withheld commit (means absent — pack empty). Inert, no UI surface reads
   it, correctly unstamped-as-new-ask behavior per the r26 stamp-wipe
   finding. Documented, not a bug.
2. **No new blanks.** The r28 fix's whole purpose — gratitude that must be
   heard, not just ledgered — survived a day of sibling commits untouched.

## Metric roll-up

- M1: 5/5 GO. M2: 3/5 GO (2 documented misses, never re-scored).
- M3: 3/3 closes GO, gratitude spoken on all three (the r28 regression
  watch's actual question — answered GO).
- M4: 3/3 GO.

## Metric review

The bars did their job without revision. M2's "documented, never re-scored"
held: 9504's need-death and 9505's healthy-village misses are findings
about the re-ask window, not failures of the close. M3's added spoken-
gratitude clause (new for r30) is the instrument r28's fix deserves — it
fires exactly when the bug would have. No revision proposed.

## Findings for Steve (design calls)

1. **The close holds on the tip.** The settle-on-speak fix is doing its job
   a day later with zero drift: 3/3 closes, every thanks spoken aloud. No
   design call — confirmation.
2. **The re-ask window stays narrow** (needs churn in 1–2 days; 2/5 seeds
   never reached attempt for honest reasons). The open-book beat remains the
   guaranteed-delivery surface. No change proposed — the two beats are
   complementary, and the misses are the game being honest, not broken.
3. r29's open items stand: the Simone zombie (inert, your call on a daily
   sweep) and the gratitude-template variation question.

## Reachable / fun / winnable

- **Reachable:** the mantle is (5/5). The full close is reachable when an
  acute need survives the death (3/3 attempts closed; the 2 misses were
  honest non-attempts).
- **Fun:** the close scenes remain the emotional peak of the leg — the
  village HEARING the thanks, not just ledgering it, is the whole point,
  and the fix protects exactly that beat.
- **Winnable:** neutral — succession is continuity machinery, and it held.

## Telemetry

telemetry-check vs telemetry-baselines/succession.json: **quiet** (5 files,
5 metrics, no large deviations). Baseline ROLLED FORWARD per criterion (a):
{deaths.bearer: 5, census.alive: 49, census.fallen: 10,
census.integrationStage: 15, week2.deadBearerMentions: 3} (was 46/11/14/3
from r27's roll; the deltas are seed variance on an identical profile).

## Regression

- New script: scripts/journey-succession-r30-20261020.js (r28 rig, fresh
  seeds, r30 pre-registration header).
- Per-seed tele JSONs: evidence/2026-10-20/journey-succession-r30-tele-950{1..5}.json.
- Succession proof suites (run next; zero src/js changes this run):
  test-succession-open-book, test-succession-seed-inherit,
  test-succession-exile-docket, test-succession-grief,
  test-promise-maker-succession, test-settle-on-speak.
- No src/js changes → nothing for the green list to catch; check.js --quick
  not re-run (r28 ran it 96/96 on the same src tree; this run's tree adds
  only the script + evidence + tele JSONs).

## Landing

- Commit: scripts/journey-succession-r30-20261020.js + 5 tele JSONs +
  evidence/2026-10-20/journey-succession-r30-laneb.md.
- rotation-b: 7 → 4 (endgame next). Lock deleted.
- Report: "merged locally, pending ship" — no version tag; the ship job
  reports the tag when it goes live.
