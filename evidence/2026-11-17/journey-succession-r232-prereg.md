# Journey succession r232 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r232 play or fix. Rotation-b read 7 at run start; this run
writes 4 (endgame next) at closeout and VERIFIES the file reads 4
afterwards. Run number r232: follows crisis r238 (today, 2026-11-17).
Base: master 7cbef877e at run start. Lock: playtest-loop-2.lock run_id
loop2-20261118-0401Z (own, created at run start; no prior lock present —
the stale winnability evidence file in the main tree was committed by a
recovered closeout, commit 7cbef877e, at 04:00:25Z; status re-checked
clean before the lock was created).

## Standing state (why this run plays leg 7, and what it builds)

r231 succession (2026-11-17) passed every bar and landed the
MOURN-TEMPLATE fix: mourning templates dedupe by template, not by dead
person's name (9-shape spread, 0 repeats on the panel). Its filed next
build, carried here, is **relationship-aware mourning lines
(bond/kin/shared-deed variants)**: "the lines are now varied, but they
are still one generic voice per template, not the dead person's
relationship to the speaker."

r231 also left two items this run adjudicates:
- **Habit-collision watch item**: Werner (34334) and Austin (34333) both
  used `part:habit-for` with the same habit text ("clean up other
  people's messes quietly"). RESOLVED BY INSPECTION this run, before the
  panel (see Signal audit). Not a build item.
- **F5 metric revision** (r231 metric review): the wild-exercise bar
  becomes a rolling 3-panel window. ADOPTED this run (question 10).

## Signal audit (traced before the fix, not guessed)

Three of the filed brief's four relationship signals exist in live state;
one does not. The build uses only what the game actually records.

- **BOND — exists.** `v.bonds["a|b"] = {v, depth, day, dayGain}` via
  `bondGet(a, b)` (betrayal.js:147-155). `bondAdd` refuses dead pairs
  (betrayal.js:161-164: "no bonds with the dead or the gone"), so the
  record at death is frozen and stays readable after it. The r231 corpus
  proves the signal is dense, not rare: 14–26 close bonds (v>=20 or
  depth>=1) per panel seed at relPre, and the scripted bearer is heavily
  bonded (34331 Pablo: Brunhilde–Pablo 42/1, Elijah–Brunhilde 54/2,
  Pablo–Miguel 22/0; 34332 Eric–Sam 96/3; 34333 Aaron–Leroy 50/2;
  34334 Olivia–Sean 80/3). The "close" threshold reuses the
  successor-grief push's established line (v>=20 or depth>=1,
  convoTopics.js:1323) — no new threshold invented.
- **SHARED DEED (veteran) — exists.** `state.waveKillLog` rows carry
  `{d, mid, w, by, via, trick}` (game.js:34952, 35127); `by` is the
  killer villager id. Speaker-veteran = a row with `by=vid`;
  dead-veteran = a row with `by=deadId`. The log cannot prove a SHARED
  fight (same day + same monster is suggestive, not proof), so the
  veteran variant claims shared standing ("we both stood"), never a
  shared fight. No new record needed.
- **WITNESS — exists, sparsely.** `corpse.witnesses[]` is stored
  (corpses.js:239-244) and seeds death gossip; populated on some death
  paths (patrol combat `witnesses:[vid]`, game.js:8181). Wild rate
  unknown — the panel measures it; a vacuous witness arm is a finding,
  not a failure (bar written accordingly).
- **KIN — does NOT exist between villagers.** Kin lives only as
  generation-time relations to the scholar (`genKinPerson`,
  game.js:1897) and the Taken/stasis fiction (docs/KIN.md). No kin map,
  no spouse/sibling record between two villagers exists anywhere in
  `src/js` (grep: kinMap/kinOf/relatives/isKin/familyOf — 0 hits). The
  kin variant of the filed brief is NOT built; recorded as unavailable,
  not invented. If Steve wants kin mourning, kin tracking is a separate
  build, not a line fix.
- **HABIT COLLISION — resolved by inspection.** Habits are deduped per
  expedition: `_usedTraits` resets per roster (game.js:1667-1670) and
  `pickFresh` draws the 22-habit pool (characterGen.json:4777) without
  replacement (game.js:1114-1122), falling back to the full pool only on
  exhaustion (22 habits vs ~12 villagers — exhaustion effectively never
  happens). Werner (34334) and Austin (34333) were DIFFERENT seeds —
  different villages. A cross-panel artifact no single player can ever
  hear. Within one village habits are unique by construction. Descriptive
  check on the r232 panel: 0 same-seed same-habit servings. No code
  change.

## Fix arm (src/js/convoTopics.js ONLY — REL-MOURN)

1. `t2LatelyEvent` mourning branches carry the dead's id. Fresh
   single-name branch: add `deadId` (corpse.villagerId) and `witnesses`
   (corpse.witnesses || []). Mantle-memory branch: set
   `deadId = bearerId` (bearerId already carried). Multi-name branch
   unchanged: relationship variants are single-name only — a pair-loss
   line would need its own voice; recorded as open.
2. `t2gen_lately` 'mourning', single-name branch: after the 5 generic
   `{mname}` templates, push relationship-conditional variants, each
   carrying `{mname}`, filled AFTER the pick per r231 (the new shapes
   dedupe by template like the generics):
   - bond (`bondGet(vid, deadId)` depth>=1 or v>=20): 2 openers.
   - veteran (speaker AND dead each hold a waveKillLog row): 2 openers.
   - witness (`vid` in `ev.witnesses`): 2 openers.
   Variants are ADDITIONS to the pool, never replacements: a 1-variant
   pool would re-serve one template across sittings and trip
   MOURN-EXHAUST (the r230 failure mode). The picker (village-fresh +
   run-ledger) spreads them.
3. `t2fol_lately` mourning follow-ups: 1 bond variant per level
   (cope/next/part = 3 lines), same gating, same `{mname}` discipline.
   Veteran/witness follow-ups stay generic this run: the openers carry
   those kinds, and 6 more variants would dilute the pool past the
   picker's ability to show any one kind. Revisit if the panel shows the
   openers landing.
4. Unchanged by design: multi-name, nameless, sick-death push,
   successor-grief push (player-bond-gated, bearer-only). No game rule,
   price, gate, or balance number changes — line-selection only.

Line drafts (final wording set in the fix; voice = plainspoken
grief-through-routine, R34):
- bond opener 1: `"{mname} was my person at this fire. I keep turning to the wrong empty spot."`
- bond opener 2: `"I knew {mname}. Really knew them, not the fire's version. Mine. And now there's just the fire's."`
- veteran opener 1: `"We both stood at the treeline. {mname} held it. I keep replaying my part, looking for the step I missed."`
- veteran opener 2: `"{mname} killed the things that come at night. I did too. That's a small club, and it's smaller now."`
- witness opener 1: `"I was there when {mname} fell. I keep seeing it when I blink, and blinking doesn't help."`
- witness opener 2: `"I saw {mname} go down. I did what I could. It wasn't enough, and I carry that now."`
- bond cope: `"I {habitI} the way {mname} used to, when they were the one keeping me steady. It doesn't work the same. I do it anyway."`
- bond next: `"{mname} knew things about me nobody else does. That's gone now, and I keep catching myself about to tell them something."`
- bond part: `"My part? I carry what {mname} carried. Not their work. Their watch. Someone they trusted should hold it."`

Risk, named in advance: (a) a relationship variant could fire for a
speaker whose relationship predates the death — but the bond record is
frozen at death (bondAdd refuses dead pairs), so the frozen value IS
the at-death value; no staleness. (b) If a fresh corpse lacks a
villagerId (stranger corpses), the variants simply don't gate in and
the generic pool serves. (c) Witness lists are sparsely populated —
the witness variant may be vacuous on the panel; that is a finding,
not a failure.

## Questions (r232)

(1) REL-BOND (binding, new): the bond variants fire when the speaker is
    close to the dead, and never when not close. PASS = (a) >=1
    bond-variant serving on the panel where relMap shows close (v>=20
    or depth>=1), AND (b) 0 bond-variant servings where relMap shows
    NOT close. The proof test is the deterministic negative guard; the
    panel is the wild positive plus a second negative check.
(2) REL-VET (binding, new): the veteran variants fire when speaker AND
    dead are both veterans, and never otherwise. PASS = (a) >=1 serving
    where relMap shows both veterans, AND (b) 0 servings where either is
    not a veteran. If no both-veteran convo occurs on the panel, (a) is
    INSUFFICIENT-DATA (finding, not pass) — the veteran rate depends on
    wild kills by day 40–110.
(3) REL-WIT (binding, new): the witness variants fire when the speaker
    witnessed the death, and never otherwise. PASS = (a) >=1 serving
    where relMap shows witnessed, AND (b) 0 servings where not
    witnessed. If no witnessed death occurs on the panel, (a) is
    INSUFFICIENT-DATA.
(4) MOURN-TEMPLATE (binding, carried): 0 same-speaker same-shape
    firings for different dead AND 0 different-speaker same-shape
    same-dead firings within 5 days. Shapes now number 19 (10 carried +
    6 new openers + 3 new bond follow-ups); the scan covers all 19.
(5) MOURN-EXHAUST (binding, carried): 0 servings of the exhausted line
    in a mourning sitting.
(6) MANTLE-FINE (binding, carried, gap-subtraction): 0
    flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2,
    0 unexplained fineLatency==1, 0 day-skips.
(7) DRY CENSUS (binding, carried): 0 dry hits of any class. Any hit
    fails the run — the new variants' emission cost would land here.
(8) WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
    C3c/F2/C3d and the carried landed-fix surfaces.
(9) C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
(10) F5 WILD EXERCISE (binding, REVISED per r231 metric review):
    the settled-favor branch fires >=1x across the rolling 3-panel
    window (r230 fired 2x, r231 vacuous, r232 counts) AND 0 F5-class
    dry hits. Targeted harness (r225 proof test) re-run on this base.
(11) CONTROLS (binding, smoke bar S_fixed from r230): smoke 33998
    at-death snapshot = d6 Grace 11/1/43 + machinery (pick rank 1,
    funeral INCALL true, selfReq 0 on every seed). If the smoke
    snapshot moves, it is base drift since r230, recorded as such and
    the bar re-baselines by measurement, not adoption.
(12) Descriptive: CAP-NC bonded-by-deadline among eligible;
    denominator < 3 stays INSUFFICIENT-DATA. HABIT-COLLISION: 0
    same-seed same-habit servings. Per-kind relationship-variant
    serving counts; witness-populated corpse count; both-veteran convo
    count.
(13) Watch: day-skips stay at zero (seventeenth straight panel watch).

## Panel

- Driver: scripts/journey-succession-r232-20261117.js (r231 driver,
  rename only, PLUS the relMap instrument: at each driven convo,
  record {dplus, speakerVid, speakerName, deadId, deadName, bondV,
  bondDepth, speakerVet, deadVet, witnessed} into the stdout JSON
  top-level `relMap`, keyed for the analyzer join on (dplus,
  speakerName)). Seeds below.
- Analyzer: scripts/analyze-journey-succession-r232-20261117.js
  (r231 analyzer, rename only, PLUS the REL scan: 19 mourning shapes,
  per-serving relationship join via relMap, and the HABIT-COLLISION
  descriptive).
- Panel runner: scripts/run-journey-succession-r232-panel.sh (r231
  runner, rename only).
- Proof test: scripts/test-journey-succession-r232-relationship-mourning-20261117.js
  (new): stages deaths with each relationship state and asserts (a) a
  bond variant fires iff the speaker is bonded to the dead, (b) a
  veteran variant fires iff both are veterans, (c) a witness variant
  fires iff the speaker witnessed the death, (d) no served line
  contains a literal '{mname}', (e) no exhausted line is served while
  variants remain. RED on the pre-fix code (no variants exist), GREEN
  on the fix.
- Seeds: FRESH BAND 34341–34344 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25 — the standing
  control). Pilot first: seed 34341 alone to verify the driver runs
  clean on this base; then the remaining 3 seeds sequentially, then
  smoke. The panel runner is launched with nohup so it survives the
  coordinator's execution limit.

## Seed-band freshness (local_seed_band_freshness)

- Word-boundary grep for 34341/34342/34343/34344 over evidence/**/*.md:
  0 hits. Same grep over prereg .md files only: 0 hits. Same grep over
  the goal hidden_files .md files: 0 hits. (A broad substring grep hit
  only "34341L" = 34,341 liters in evidence/2026-10-16/sim-thirstinst2-b.md
  — a volume, not a seed.) No forbidden/contaminated band list names
  3434x.
- Band 34341–34344 is FRESH. The smoke seed 33998 is a re-run of the
  standing control, not a fresh reservation. (Comparison: 34331–34334
  = r231 panel; 34321–34324 = r230; 34311–34314 = r229; 34301–34304 =
  r224; 34291–34294 = r218; 34281–34284 = r209; 34271–34274 = r202;
  34261–34264 = r197; 34251–34254 = r193; 34241–34244 = r187;
  34231–34234 = r183; 34221–34224 = r181; 34211–34218 = r177;
  34201–34208 = r169; 34011–34018 = r169; 33998 = standing smoke
  control.)

## Bars (binding, §14)

- REL-BOND (binding, NEW r232): PASS — >=1 bond-variant serving
  where close AND 0 servings where not close.
- REL-VET (binding, NEW r232): PASS — >=1 both-veteran serving AND 0
  servings where either is not a veteran; no both-veteran convo =
  INSUFFICIENT-DATA on arm (a).
- REL-WIT (binding, NEW r232): PASS — >=1 witnessed serving AND 0
  servings where not witnessed; no witnessed death =
  INSUFFICIENT-DATA on arm (a).
- MOURN-TEMPLATE (binding, carried): PASS — 0 same-speaker
  same-shape firings for different dead AND 0 different-speaker
  same-shape same-dead firings within 5 days (19 shapes).
- MOURN-EXHAUST (binding, carried): PASS — 0 exhausted-line servings
  in a mourning sitting.
- MANTLE-FINE (binding, carried, gap-subtraction): PASS — 0
  flippedImmediate=false rows outside VILLAGE-OVER, 0
  fineLatency>=2 (gap-adjusted), 0 unexplained fineLatency==1,
  0 day-skips.
- DRY CENSUS (binding, carried): 0 dry hits of any class.
- WILD CHECK (binding, carried): 0 regressions on F4a/F4b/F4c/F5/F6/
  C3c/F2/C3d and the carried landed-fix surfaces.
- C3d WILD HOLD (binding, carried): 0 C3d-class erasures.
- F5 WILD EXERCISE (binding, REVISED): settled-favor branch fires
  >=1x across the rolling 3-panel window (r230+r231+r232) AND 0
  F5-class dry hits. Targeted harness (r225 proof test) green on this
  base.
- CONTROLS (binding, smoke bar S_fixed): smoke 33998 at-death
  snapshot = d6 Grace 11/1/43 + MANTLE-FINE clean + pick rank 1,
  funeral INCALL true, selfReq 0 on every seed.
- CAP-NC (descriptive, not binding): bonded-by-deadline among
  eligible; denominator < 3 stays INSUFFICIENT-DATA. bondedEver
  reported descriptively.
- DAY-SKIP WATCH (metric review, not a bar): record day-skips; any
  non-zero count re-opens the build question.

## What would count as interesting

- A relationship variant served WITHOUT the relationship (a
  fabrication — the new generic voice wearing a personal line).
  FAIL LOUDLY.
- A bond variant never firing despite 14–26 close bonds per seed (the
  build doesn't engage where it should).
- A witness variant firing with witnesses=[] (instrument bug — the
  gate read a stale event).
- Zero both-veteran convos on the panel (veteran variant unmeasurable
  in the wild — finding, not failure).
- Zero witnessed deaths on the panel (witness variant unmeasurable —
  finding, not failure).
- A MOURN-TEMPLATE repeat through the new shapes (the r231 fix's
  template dedupe not covering the additions).
- A DRY hit on ask:lately (the new variants' emission-block cost,
  realized — FAIL LOUDLY).
- A C3d-class erasure on the panel (r231 fix regression — FAIL LOUDLY).
- An F5-class dry hit on the panel (r225 fix regression — FAIL LOUDLY).
- A stale-favor resume opener (r228 C3c fix regression — FAIL LOUDLY).
- A narration quote in a resume opener (r228 F2 fix regression).
- A NEW dry line on an unpooled surface (the next fix item — filed).
- Any MANTLE-FINE miss on the fresh band (regression).
- A live-want recap serving (convoRecapLiveLine firing in the wild —
  positive evidence the C3d fix engages, not just holds; r230 and r231
  could not produce one).
- Smoke snapshot move vs S_fixed (base drift since r230).
- CAP-NC denominator >= 3 for the first time in several runs.

## Metric review (carried)

- r229's telemetry baseline was NOT rolled (means-vs-sum mismatch
  documented in their run notes). This run runs telemetry-check
  against the succession baseline and reports LOUD lines; it does
  NOT roll the baseline forward until the mismatch is resolved.
- F5 WILD EXERCISE revised this run to the rolling 3-panel window
  (r231 proposal, adopted): a quiet panel no longer fails the bar
  when the branch fired on a neighbouring panel; the harness remains
  the functional proof.
- DRY CENSUS amendment stands (any dry hit fails).
- MANTLE-FINE stays the gap-subtraction revision (r230); no further
  revision proposed.
- C3d wild hold: the fix's live-want path never engaged on r230 or
  r231 (no recap while a live want was open). The bar stays; a future
  panel with a live-want recap would give the positive evidence
  neither could.
- CAP-NC: no revision — the denominator stays starved by design.
- Day-skip watch: seventeenth straight panel watch.
- Proof refresh rounds 11 + 12 remain owed (not this run's).
- KIN mourning: NOT in this run's scope — no signal exists; a
  kin-tracking build would be needed first. The filed brief's kin
  variant stays open, explicitly unbuilt.
- Multi-name relationship mourning (bond variant for losing two at
  once): open, not built — the multi-name pool keeps its own voice.
