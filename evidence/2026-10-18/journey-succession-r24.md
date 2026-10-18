# Journey-succession r24 — "the sentence dies with the bearer" (2026-10-18)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question:** the bearer <redacted> EXILED. Does the sentence end with the old
body, or does the innocent successor inherit the exile machinery — and with
Steve's 2026-10-17 cold-shoulder ruling (journey-social r20b) now live, would
the successor be socially cut, pantry-denied, and uprising-targeted for a
crime they didn't commit?

**Prior art:**
- 2026-10-06 BUG 1 (filed, never verified fixed): dying mid-arc → mantle to
  an exiler NPC, `scholar.exiled` stayed true, "exile died with the old body
  but mechanics keep running."
- The uprising-'lost' path ALREADY implements the design (brawler loop
  2026-10-08, justice.js ~880): when the village kills the bearer, "the
  crimes died with the criminal" — the formal docket (stage, exile, crimes,
  heat flags) resets and `s.exiled=false`, because "the successor must not
  inherit the dead bearer's exile." The village remembers socially (gossip,
  fallen roll, lineage); the machinery stands down.
- r20b (2026-10-17) implemented Steve's exile ruling (cold shoulders via
  `justiceExiled()`) and ASSUMED "post-succession the docket resets anyway"
  — unverified in code. `playerDeath` (ledger.js 622–1092) never touches
  `s.exiled`, `s.drifting`, `s.founding`, `s.exileStartDay`, or `v.justice`.
- r22 (death-pack voice), r23 (successor's own grief) — neither touched exile.

**The mechanical suspicion (code-read, to be proven in sim):** bearer exiled
via moot (`j = {stage:3, exiled:true, exileDay, crimes}`, `s.exiled=true`),
walks off, dies in the wild. Mantle passes. Successor wakes at Haven
(`s.insideHaven=true`, mx=4,my=4) with `s.exiled` still true and the docket
live. Next `justiceTick`: `j.stage===3 && j.exiled && atHaven &&
today>exileDay` → `startVillageUprising('defied exile')` against a successor
who was never sentenced, never defied anything. Meanwhile
`justiceExiled()` gates r20b's cold shoulders, the pantry (justice.js:1183),
and contest casting (contests.js) — all misfiring on the new body.

**Interesting-finding criteria:**
(a) `s.exiled` true on the successor and/or `v.justice` still live
    (stage 3, exiled, crimes) after the mantle → BUG CONFIRMED (the 10-06
    class). Fix: reset the docket + clear the exile-family flags on mantle,
    per the uprising precedent.
(b) `justiceTick` fires `startVillageUprising('defied exile')` against the
    innocent successor in the post-mantle window → the bug has teeth
    (mechanical, not cosmetic).
(c) the successor's convos resolve as cold-shoulder refusals via
    `justiceExiled()` → the r20b ruling misfires through the mantle.
(d) `recoverBearer` brings the exiled bearer's body home with the standard
    "nobody asks you to help carry" line → sense question: does the village
    that cast them out carry them home? Document either way (Steve-call on
    whether the fiction should differ).
(e) the handoff/grief beats mourn-by-name with zero acknowledgment of the
    exile → sense question (document).

**Seeds:** 6101, 6102 (exile d20, kill same-day at Haven — the grace window
avoids a pre-kill uprising); 6103, 6104 (exile d20, walked off Haven ground,
killed d21 in the wild — the realistic path).
**Policy:** competent. **Horizon:** successor plays to d35 (covers the
overnight recovery beat, the d+1 justiceTick window, and cold-shoulder
checks).
**Binding metrics:**
- M1: ≥3/4 mantles pass cleanly (new bearer, lineage entry, game continues).
- M2 (mechanism): on all exiled-bearer deaths, by d22: successor
  `s.exiled === false` AND `v.justice` = {stage 0, exiled false, crimes []}.
  <3/4 → BUG CONFIRMED → fix justified.
- M3: no `startVillageUprising` against the successor in the d20–d35 window
  (a firing is the bug's teeth — document, don't re-score).
- M4 (people): ≥2/4 seeds — a full grief transcript sense-read; does anyone
  name the exile, or does the village mourn-by-name blindly?
**Kill rule:** mantle fails on ≥2/4 → SUBSTRATE-MISSING.

## What happened

**M2: BUG CONFIRMED on all 4 pre-fix seeds (0/4).** The 2026-10-06 BUG 1 class
is live: `playerDeath` never clears the exile machinery.

Pre-fix pilot (seeds 6101/6102 bare exilePlayer at Haven; 6103/6104
WALKOFF=1 + MOOTSYNC=1 full moot-exile, stage 3, wild death):

| seed | variant | post-mantle s.exiled | post-mantle v.justice | uprising | convos |
|------|---------|---------------------|----------------------|----------|--------|
| 6101 | bare, Haven | **true** | {stage:1, exiled:true} | none (stage≠3) | 2/2 REFUSED |
| 6102 | bare, Haven | **true** | {stage:0, exiled:true} | none | 2/2 REFUSED |
| 6103 | moot, wild | **true** | {stage:3, exiled:true} | **FIRED 'defied exile' d23 vs Elijah** | 2 opened* |
| 6104 | moot, wild | **true** | {stage:3, exiled:true} | **FIRED 'defied exile' d23 vs Benjamin** | 2/2 REFUSED |

\* 6103's convos opened only because the d23 uprising's chaos reshuffled
social state; the docket was still live (`justiceExiled()=true`).

The teeth, in the successor's own words (6101, d22–23, pre-fix): the village
brings the exiled bearer's body home and digs the grave — while telling the
innocent successor "The pantry is not yours anymore. Exile means exile" and
"Nobody meets your eyes." The machinery punished; the fiction mourned. Total
contradiction, textual.

Proof test `scripts/test-succession-exile-docket-20261018.js` on the pre-fix
tree: **11 failed** — including the teeth assertion ("no uprising against
the successor post-mantle (got 'defied exile')") with the faithful
moot-exile fixture.

## Village assessment (plain words)

Four villages, all alive at d35 post-fix (8–10 living each). The successions
worked — new bearers stepped into functioning villages and kept them
functioning. What changed with the fix: the successor is no longer a
non-person. Pre-fix, Erich (6101) woke up cold-shouldered by the whole
village, pantry-denied, contest-ineligible, for a crime Dmitri committed —
and on the moot-exile seeds the village literally rose against Elijah and
Benjamin the day after they took the office. Post-fix, the villages treat
the new bearer as a new person: convos open, the pantry is theirs, no
uprising. The dead are still mourned by name; the sentence just doesn't
cross the grave anymore.

## People check

8/8 post-fix grief convos opened (vs 0/4 pre-fix on the bare-exile seeds —
the bug was eating the people check itself). 6/8 name the deceased; all
meet the mechanical bar. Best (6101, Gus, d23): "Since Dmitri died... I
keep expecting to see Dmitri at the fire. Stupid." / "Dmitri is gone and
the world just... continues. That's the part I can't stand." Genuine.
**0/8 name the exile.** Dmitri was exiled the same day he died and his
closest friend mourns him like any dead villager — no "they cast him out,"
no "the sentence." The village's grief vocabulary has no words for the
exiled dead. (6103's Aki convo is the r23-Phumzile class: grief without a
name — "They'd tell me to keep working" — but that convo followed a
seek_comfort want elsewhere, not an exile-specific blank.)

## Blanks filled

**1. THE SENTENCE DIES WITH THE BEARER <redacted> 35, fiction-led, one voice line):**
in `playerDeath`, on the mantle: reset the formal docket (field list mirrors
the uprising-'lost' reset in justice.js — stage, exiled, exileDay, crimes,
confront/moot/amends flags) and clear the exile-family flags
(`s.exiled=false`, `s.drifting=false`, `s.founding=null`,
`s.exileStartDay=null`). When the docket was live, the handoff names it once:
"The village's quarrel was with {old} — and {old} is dead. The sentence
doesn't cross the grave. You're someone else now; the docket is empty, but
the village remembers." Clean-docket deaths: mechanical no-op, no voice
(old behavior preserved). The design precedent is the codebase's own:
"the crimes died with the criminal... the successor must not inherit the
dead bearer's exile" (justice.js, brawler loop 2026-10-08) — this extends
that precedent from the uprising-kill path to the exile-then-die-in-the-wild
path. It also repairs r20b's unverified assumption ("post-succession the
docket resets anyway") — now it actually does.
**Proof:** `scripts/test-succession-exile-docket-20261018.js` — RED 11 fails
pre-fix (patch verified), GREEN 21/21 post-fix. Covers: exiled→clean
successor (s.exiled/drifting/founding/exileStartDay + full docket field
list), docket-voice fires exactly once and names the dead, clean death→
no-op + silence, the teeth (justiceTick post-mantle fires no uprising),
regression (r23's grief beat still fires, trauma still 15 on close bond).
**Wild confirmation:** all 4 pilot seeds re-run post-fix — M2 4/4 GO,
M3 4/4 GO (no uprising), cold-shoulder checks open with
`justiceExiled()=false`.

**2. THE VOICE LIED ABOUT THE NUMBER (src/js/corpses.js, +8, r22 follow-up):**
regression hunt while verifying — `test-deathpack-voice-20261017.js` was
16/16 at r22, now 15/16 on pristine too. Root cause: r22's voice line
recomputes `corpseTrauma(c,{})` AFTER the take, but `_corpseFirstTouch`
fires `addTrauma` and then `observe('loot_corpse')` moves trust — so the
recompute names a smaller number than the one that actually landed
(9 fired, line said 6; trust 13→1 across the loot). Fix: compute the trauma
once, before the take, on both the per-item and batch paths — restoring
r22's documented contract ("the trauma number is the same one
_corpseFirstTouch already added — now it's named"). Proof: the r22 test
itself, back to 16/16 GREEN.

## Metric roll-up

- M1: 4/4 GO (pre and post) — Dmitri→Erich, Moshe→Oscar, Frieda→Elijah,
  Gina→Benjamin; lineage entries with cause on all 4.
- M2: 0/4 pre-fix → **BUG CONFIRMED** → fix → 4/4 post-fix GO.
- M3: pre-fix 2/4 (uprising fired on both moot-exile seeds); post-fix 4/4 GO.
- M4: 8/8 convos opened post-fix, 6/8 name the deceased, 0/8 name the exile
  → GO with the exile-silence documented below (Steve-call).

## Metric review

M2's `<3/4 → BUG CONFIRMED` trigger worked exactly as designed — the metric
did its job. No revision proposed. For the next succession run: the exile
path is now covered; the open thread is the fiction question below —
whether the village's mourning should ever name the exile.

## Findings for Steve (design calls)

1. **Should the village's mourning name the exile?** 0/8 transcripts mention
   it. The machinery now says "the sentence doesn't cross the grave" and the
   fiction mourns-by-name — coherent. But a case exists for one
   acknowledging beat when the deceased died exiled ("We cast them out, and
   then they died out there. That sits wrong.") — the r22/r23 pattern was
   "mechanics honest, fiction silent → add voice." Not built: it needs your
   taste call on whether the village speaks of the exiled dead warmly or
   with complexity.
2. **recoverBearer vs the exile:** "That night, they bring {first} home...
   the grave is dug by the fire" fires for exiled bearers too. Under the
   "death ends the sentence" design this reads as the village's humanity,
   not a bug — documented, no change.
3. **Trust inheritance after an exile:** the successor still gets the
   three-channel office-residue math (40% of the exiled bearer's trust +
   own + vouching, floor 10). The exiled bearer's trust is ~cratered, so the
   successor starts near the floor — "a hearing." Left alone deliberately;
   flagging in case you want the office's post-exile standing to work
   differently.

## Reachable / fun / winnable

- **Reachable:** yes — exile is a live path (moot, defiance) and bearers die
  in the wild constantly. Every exiled-bearer death hit this.
- **Fun:** strictly better — pre-fix, inheriting an exile was a softlock of
  the social game (every convo refused) or a death sentence (uprising d23).
  The sentence ending with the old body is the only playable outcome.
- **Winnable:** improved — the successor keeps the village's social game
  instead of inheriting a war.

## Telemetry

telemetry-check vs telemetry-baselines/succession.json: **1 LOUD line** —
`census.fallen` 6 → 13 (+117%). Investigated same-run: EXPLAINED, not a
regression. The pre-fix pilot on identical seeds already had 14 fallen —
the fix is mortality-neutral (13 post-fix). The delta vs the r23 baseline
is pilot design, not code: r23 ran no exile to d28; r24 exiles at d20
(`exilePlayer` fires the schism crisis) and runs to d35. All four villages
ended healthy (8–10 alive). Baseline NOT rolled forward.

## Files

- Pilot: scripts/diag-succession-r24-20261018.js
  (SEED=6101/6102 bare exile; SEED=6103/6104 WALKOFF=1 MOOTSYNC=1)
- Proof: scripts/test-succession-exile-docket-20261018.js (21/21 GREEN)
- Per-seed: evidence/2026-10-18/journey-succession-r24-tele-610{1,2,3,4}.json
  (+ r24-610{1,2,3,4}.log pre-fix, r24f-610{1,2,3,4}.log post-fix)
- Fix: src/js/ledger.js (+35, docket reset + voice), src/js/corpses.js (+8,
  trauma-at-fire)
- Patch backup: ~/workspace/patches/succession-docket-r24.patch

No metric revision proposed this run. M2's binding trigger fired correctly.
Next succession run: the exile path is covered — pick up the fiction
question (finding 1) only if Steve rules on it.
