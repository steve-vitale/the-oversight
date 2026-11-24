# sim-departteach-a — PREREG (frozen)

**Arm:** sim-departteach-a · **Loop A run:** fleshout-20261124T0715Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** the
departname-a §8 follow-up — departure beats now name companions by
true first name, but the scholar learns nothing from hearing them
(`evidence/2026-11-23/sim-departname-a.md` §8; round record
`evidence/2026-11-24/sim-scale-onramp-round-0215.md` §8, item 3:
"whether the departure beat should teach the scholar the name
(design call — `overheard` channel exists; UI-wide effects)")
**Type:** LEVER (one game-code change in `src/js/win-plan.js`, NOT
flag-gated — the coordinator's design call makes teaching the
behavior, not a tunable — + driver + analyzer + proof test) ·
**Base master:** `a77a5a749` (worktree
`~/workspace/worktrees/sim-departteach-a`, branch
`sim-departteach-a`; verified `git log --oneline -1` + clean
`git status --short` at run start. FROZEN_BASE below is this
prereg commit, filled in §0 once committed.)
**Frozen:** 2026-11-24 ~03:00 UTC, before any judged run. No judged
run has run.

## 0. Why this run (read first)

sim-departname-a (GO, landed) fixed the fireside voice: a departure
beat now speaks "Sean sets out with Ethan — the fire marks the
trail" instead of naming Ethan by his stranger descriptor. But the
scholar standing at the fire hears a name spoken and learns nothing
— on every other surface Ethan still renders as "A person, maybe
40s, with deep-set eyes" until the scholar formally meets him or
the System arrives on day 7 and labels everyone. That is
incoherent in the other direction now: the village announced Ethan
by name in the scholar's hearing, and the scholar's knowledge
pretends it never happened. The fiction already has the channel
for exactly this — the `overheard` reveal (`revealName 'overheard'`:
"A name drifts over from the fire: X. That's the … — now they have
a name."), used today when a villager mentions someone by name in
an overheard fireside chat (game.js:19504). This arm wires the
departure beat into that channel.

## 1. Design call (coordinator, Steve can overrule — recorded here)

YES — when a departure beat names a companion, the scholar learns
that companion's name (identity/knowledge entry) through the
`overheard` channel. SCOPE IS NARROW, frozen here:

- **Companions only.** The teach fires for each companion vid in
  the beat's `launched` party. The HOLDER is named by the beat too
  but is NOT taught by this arm — the brief's call says
  "companion", and the holder is usually already known (they drive
  the plan; the repro beats' holders were known). Teaching the
  holder's name is a follow-up, recorded in §8, not snuck in here.
- **The departure beat only** (`departLaunchBeat`, the ordinary
  wave-4+ launch). The re-seed / expiry / re-seed-launch beats name
  only the holder, so they have no companion to teach; the
  homebody-handoff line names a new leader, which is a different
  beat class (a handoff, not a departure) and stays untouched.
- **The NAME only.** `revealName` writes exactly one thing:
  `village.knownNames[vid] = true` (game.js:17797-17813). No stats,
  no trust change, no role/standing reveal, no goal knowledge.
  The journal wrapper (journal.js:1224-1236) adds a name-only
  journal entry ("overheard by the fire"). The drift say line is
  the channel's own voice, not new prose.
- **Only what the scholar could have heard.** The teach fires
  inside `departLaunchBeat`, which fires only when the beat itself
  speaks — one beat per launch, holder + party + target, at the
  fire. A companion not named in the spoken line is not taught.
  (The beat is stamped day+target, so a re-entrant call the same
  day for the same target is silent — and teaches nothing, because
  there is no second hearing.)
- **Post-System is a no-op by construction.** `revealName`
  returns false when `systemArrived` (the overlay already gave
  the scholar every name; game.js:25962-63 mass-fills knownNames
  at arrival), and when the name is already known (idempotent —
  no duplicate drift line). So the teach can only fire in the
  pre-System window (days 5–7 departures), exactly the window
  where the departname defect lived.

## 2. The overheard channel — verified to exist (not invented)

Read from the code on this base (2026-11-24 ~02:55 UTC), not
assumed:

- `revealName(vid, how)` — game.js:17797-17813. Guards: returns
  false if `knownNames[vid]` already set or `systemArrived`;
  else sets `knownNames[vid] = true` and says one line per `how`
  (`'overheard'`: "A name drifts over from the fire: ${first}.
  That's the ${descriptorBase(vid)} — now they have a name.").
  Nameless records fall back to `'Someone'`; never throws.
- Existing `overheard` caller — game.js:19504, in
  `overheardDiscussion`: a villager mentions someone by name in
  the scholar's hearing ("The speaker knows the other's name —
  villagers know each other. YOU might not. That's the gap the
  overheard line closes.") → `this.revealName(otherId,
  'overheard')`. This arm extends the SAME channel to the same
  shape of event (a name spoken in the scholar's hearing), it does
  not invent a channel.
- Other `revealName` callers sharing the store: `'intro'`
  (conversation.js:6267, first meeting), `'gesture'`
  (game.js:3062, no-common-language first meeting;
  conversation.js:6268), the wake-up finder (game.js:6220, the
  finder introduces themself), System-arrival mass reveal
  (game.js:25962-63), game-start pre-known shuffle
  (game.js:26028-32). All write the same `knownNames` store, all
  name-only. Named in full so the evidence can say what shares
  the store.

## 3. UI-consequence audit — frozen (read from the code, 2026-11-24 ~03:00 UTC)

Knowledge controls what the UI reveals ("If you don't know, it
doesn't show"). What learning a name reveals, and what it does
NOT:

- `canShow('npc', vid, 'name')` (game.js:49866) reads ONLY
  `knownNames[vid]`; `nameKnown(vid)` is that gate.
  `displayName(vid)` (game.js:17906 area) returns the true name
  iff `systemArrived || nameKnown(vid)`, else the descriptor.
  So a taught name flips exactly one rendering per person:
  descriptor → true first name, on the surfaces that call
  `displayName` / `nameKnown` / `firstRef`.
- `canShow('npc', vid, 'mechanics')` (game.js:49868) reads
  `systemArrived || goalsKnown[vid]` — a SEPARATE store
  (`goalsKnown`), never written by `revealName`. A taught
  companion's goals, stats, occupation, and backstory stay
  hidden exactly as before. The proof test pins this
  (nameKnown true, mechanics false after a teach).
- Every `nameKnown` consumer found by grep is a name-rendering
  surface only: app.js person cards (13387, 13685), ally lists
  (18711, 18836), corpses.js labels (570, 623, 775, 810, 822,
  890, 907 — "known" decides name vs descriptor on a corpse
  marker), betrayal.js:253, havenGrowth.js:368/453, game.js
  askAbout (4621), `firstRef` (18059). No combat, trust,
  planning, or fight-gate decision reads `nameKnown` — EXCEPT
  two narrow couplings, named here so the pilot can watch them:
  - (a) `useNameAvailable` (naming-rite.js:61): the naming rite
    (player bestows a use-name) requires nameKnown AND trust
    ≥ 75. A taught name can make a companion eligible for the
    rite sooner — but only once trust ≥ 75 is independently
    earned, and only via a player-initiated bestowal. This is a
    name-only downstream opportunity, not an over-reveal of
    stats or goals. The competent policy does not bestow
    use-names, so it cannot move the sim; recorded here, not
    hidden.
  - (b) The gesture first-meeting path (game.js:3061): `if
    (!systemArrived && !nameKnown(vid) && Math.random() < 0.5)`
    → `revealName(vid, 'gesture')`. A companion taught by a
    beat skips this branch on a later first meeting — one fewer
    `Math.random()` draw, which shifts the seeded RNG stream
    for subsequent draws. That is a REAL coupling: it cannot
    change any decision (the name is already known either
    way — the branch only re-says the name), but a shifted RNG
    stream could in principle move a later random outcome. Bar
    2 is therefore frozen as EXACT per-seed identity (see §6):
    if the pilot shows movement, the mechanism is investigated
    in the evidence and the verdict is NO-GO at pilot — the bar
    is not re-scored, and the RNG-shift coupling is the
    candidate metric-review item for the next run (§10).
- Journal: the `revealName` wrapper (journal.js:1224-1236)
  writes a name-only entry (`journalLearn(vid, 'name', first,
  { how: 'overheard by the fire' })`), rendered in app.js:19649
  as "heard someone say it". No goal/occupation/backstory entry
  is written by this path.

## 4. Route — game code, unconditional (no flag)

The change lives in `departLaunchBeat` (win-plan.js:656), the
one fireside beat that names companions, called ONLY from
`winPlanDepartLaunchBeat` (win-plan.js:1101-1120), which gates
on needWave ≥ 4 and stamps day+target before speaking (at most
one beat per launch). After the beat line is spoken, for each
companion vid in `launched` (holder excluded by the caller;
defensively skipped again here, as is the scholar's own vid):
`if (self && typeof self.revealName === 'function')
self.revealName(vid, 'overheard')`. The `typeof` guard keeps
fixture ctxs without `revealName` (the departname proof-test
shape) from throwing. No flag gate: the coordinator's call
makes teaching the behavior, and a flag left default-off would
mean the feature never ships. The control leg is therefore the
BASE code (fix uncommitted, ctl leg run first), not a flag-off
leg — the departname-a two-phase precedent. Code identity per
seed file is `winplanSha` (the driver records it), so the legs
are provably different code.

## 5. Band — fresh (verified)

**Band: 109431–109438 (8 seeds, pilot only; confirm only if the
pilot passes — see §7).** Freshness check (seed-band skill: every
dated `.md` under `evidence/`, plus all evidence filenames,
plus `scripts/*.js`):

- The suggested band 109421–109428 is CONTAMINATED and is NOT
  used: sim-retarget-a (same Loop A run, live) owns 109411–
  109426 including 109421–109426 as its confirm half
  (`evidence/2026-11-24/sim-retarget-a-prereg.md:80-81`). Also
  109421 appears once in `evidence/2026-10-15/perseed-bankleg/
  summary.json` — checked: it is `"mealKcal": 109421`, a
  calorie total, not a seed (false positive, recorded here).
- This band 109431–109438: ZERO hits in `.md` evidence for
  `10943[0-9]` / `10944[0-9]`; ZERO `*10943*` / `*10944*`
  evidence filenames; ZERO hits in `scripts/`. Checked
  2026-11-24 ~03:00 UTC.
- Neighbor bands do not overlap: departsafe-a 107601–107616,
  planform-a 107633–107648, Loop B live 109309–109324,
  journey-deepening 109401–109403, retarget-a 109411–109426.
  None names 109431–109438.

## 6. The instrument

Copy of the proven recorder `scripts/dawnchoke-driver-a.js` →
`scripts/departteach-driver-a.js`, deltas frozen here:

1. Output evidence dir 2026-11-24 (`EVIDENCE_DATE` override),
   arm `departteach-a`, MODE `ctl` | `arm`, file names
   `departteach-a-s<seed>-departteach-a-<mode>.json`, outdir
   `perseed-departteach-a-<mode>`.
2. Policy module `scripts/policies/competent.js` (verbatim
   competent play — the same policy the departname band used).
   Substrate env, identical on both legs (the departname
   substrate): `GUNRATE=1 CELLGATE=1 SENSEEXPED=1 BOWOPEN=1
   SPEARGATE=1 VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1
   FIGHTALLY2=1`, `MODE=ctl`; `KILLBUNDLE`, `LEND`,
   `PRESENCE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4`,
   `PLANRESEED` all unset. The driver CLI refuses to run
   unless the substrate matches (same guards as the source
   driver).
3. Anchor pin: `FROZEN_BASE` = this prereg commit (filled in §0
   once committed). The CLI refuses to run unless run-time
   `git rev-parse HEAD` IS the frozen base. The fix stays
   UNCOMMITTED during both legs (node loads the working-tree
   code; HEAD does not move); the ctl leg runs first on base
   code, then the fix is applied and the arm leg runs.
   Everything commits at the end.
4. NEW recorder rows — `teachRows`: the
   `winPlanDepartLaunchBeat` wrap snapshots `knownNames`
   (Object.keys of `village.knownNames`) + `systemArrived`
   before AND after the call, and records, per companion vid
   in `launched` (holder excluded): `knownBefore`,
   `knownAfter`, `taught = !knownBefore && knownAfter`,
   plus `day`, `ordinarySpoke`, `systemArrived`,
   `holderKnownBefore/After` (scope note — the holder must
   NOT be taught by this arm; the row proves it). The snapshot
   is a pure read of state; the wrap calls the game function
   exactly once, untouched.
5. NEW recorder rows — `driftLines`: the say-wrap regex gains
   the drift shape (`/A name drifts over from the fire:/`), so
   the corpus keeps every teach line for the sense test. The
   departure-beat regex (`DEPART_BEAT_RE`) is unchanged.
6. All other wraps reused UNCHANGED (contest/prize/grant/
   corpse/volley/v4fights/v4departs/planSeeds/planCensus/
   departCalls/scorePicks/dawnPool). All wraps remain pure
   reads + driver-local writes; no game-state writes, no RNG.
   The only game-code change is the teach in
   `departLaunchBeat` (§4).

Analyzer: copy of `scripts/analyze-departname-a.js` →
`scripts/analyze-departteach-a.js`, judgment rewritten for
this arm (the departname paired-line check is kept, but runs
on DEPART_BEAT_RE lines only — the drift lines are extra say
lines, so total say counts differ by design; and the
descriptor-substitution check is kept as a regression guard:
the beat line itself must be byte-identical before vs after,
since the teach does not touch the line):

- Per seed: named beats (ordinarySpoke rows), companion slots,
  unknown-before slots, taught slots, teach rate; drift-line
  count (must equal taught slots on the arm leg, 0 on ctl);
  deaths, launches, days, endReason (identity, bar 2);
  departBeats structured rows byte-identical.
- Analyzer selftest covers the teach-row math on synthetic
  corpora (taught / already-known / post-System / holder-not-
  taught shapes).

## 7. The question

On a fresh 8-seed band under the departname substrate, does a
departure beat that names a companion teach the scholar that
companion's name through the `overheard` channel — the name
only, with no sim-outcome movement and no UI over-reveal?

## 8. Pre-registered bars (judge — GO / NO-GO)

Measured on the driver's legs (control vs arm, identical
seeds). A "companion slot" is one companion vid in one named
departure beat (`ordinarySpoke` row). "Unknown-before" means
`knownBefore === false` for that slot. "Taught" means
`knownAfter === true`.

| # | Bar | Threshold |
|---|---|---|
| 1 | PRIMARY — the beat teaches (pilot) | Arm leg: taught slots / unknown-before slots ≥ 0.80, AND control leg: taught slots = 0 (instrument sanity — the control measurement is taken immediately around the beat call, so no other channel can intervene; a non-zero control teach means the instrument is broken) |
| 2 | NO-REGRESSION — knowledge-only by design (pilot) | Per-seed deaths, wave-4 launches (`v4departs` result `launch`), days, and endReason IDENTICAL control vs arm on all 8 pilot seeds (the departname precedent: 1434→1434 deaths, 34→34 launches). Any per-seed difference is a miss — investigated in the evidence, never re-scored (the §3(b) RNG-shift coupling is the known suspect) |
| 3 | BEAT INTEGRITY — the line itself does not move (pilot) | Departure-beat lines (DEPART_BEAT_RE) identical in count, day order, and text control vs arm; `departBeats` structured rows byte-identical; drift lines: 0 on ctl, exactly equal to taught slots on arm |
| 4 | UI OVER-REVEAL — name only (audit + proof test) | §3 audit stands (nameKnown flips name rendering only; mechanics stays gated on goalsKnown/systemArrived); proof-test check: after a teach, `nameKnown` true AND a mirrored `canShow('npc', vid, 'mechanics')` false while `systemArrived` is false and `goalsKnown` unset |
| 5 | INSTRUMENT | Proof test `scripts/test-departteach-a.js` green (unit: companion taught; holder NOT taught; already-known idempotent with no drift line; post-System no-op; no-revealName ctx does not throw; name-only audit; real launch path; old-code control RED); analyzer `--selftest` green; 0 instrument errors on all pilot seed files |
| 6 | DENOMINATOR GUARD | If unknown-before companion slots total < 10 across the 8-seed pilot, DO NOT judge bar 1 on that denominator: extend the band by +8 seeds (109439–109446, freshness re-verified at amendment time), record the extension as a prereg amendment BEFORE running it, and judge on the pooled denominator |
| 7 | PILOT GATE (8 seeds 109431–109438, before any confirm spend) | Bars 1–5 (+ 6 if it triggers) on the pilot. A pilot failure stops the run (NO-GO at pilot, no confirm spend; game code reverted, driver/analyzer/test deleted or left uncommitted — nothing lands) |
| 8 | CONFIRM — GO on the pooled 16 seeds (only if the pilot passes AND the pilot denominator triggered bar 6, or the coordinator orders a confirm) | Pooled teach rate ≥ 0.80 AND pooled no-regression identity AND 0 UI over-reveal. A miss on any pooled bar is NO-GO, never re-scored against a friendlier metric mid-run |

Balanced panel (§15): after the pilot passes, run the panel
before/after (`node scripts/balance-panel.js` per leg-set,
pilot seeds, 150d; NO `--intervention-flags` — the change is
unconditional, not flag-gated) and attach the compare `.md`.
The panel is the instrument and a regression check; the frozen
bars above are the judge (cellgate precedent: a
non-`no_material_signal` panel decision with a negative
direction on wins/deaths is an investigation item before
landing, not an automatic NO-GO).

Determinism: a replay of 2 pilot seeds on the arm leg
reproduces the taught-slot count AND deaths/launches exactly.
Recorder neutrality: a replay of 2 pilot seeds with the
recorder off (`LAUNCHPARTY_RECORDER=off`) reproduces the
recorder-independent game outcomes exactly (days, launches,
deaths, standing), proving the instrument itself does not move
the game.

## 9. Pilot → confirm plan

1. Proof test + analyzer selftest green (bar 5, fixtures only).
2. Pilot: 8 seeds 109431–109438, ctl leg on base code, then
   apply the fix and run the arm leg (driver refuses to
   overwrite existing files, so resumes are safe).
3. Pilot gate (§6 bars 6–7). If it passes: determinism +
   neutrality replays on 2 pilot seeds; balanced panel
   before/after.
4. Confirm only if bar 6 triggered (denominator extension) or
   the coordinator orders it: the extension seeds, both legs.
5. Analyzer over the pilot (or pooled); evidence + sense-test
   (one taught beat read as a story, §10).

## 10. Sense-test (frozen)

Pick one taught beat on the arm leg and read its days as a
story — the departure beat line as it appears in the corpus
transcript, the drift line that follows it ("A name drifts over
from the fire: X. That's the … — now they have a name."), and
the next time that companion appears on a scholar-facing
surface (person card / conversation / corpse marker) by name
instead of descriptor. Judge whether the scholar's knowledge
grows the way a person standing at a fire learns names —
gradually, only the names actually spoken in their hearing —
or whether any beat teaches a name the scholar could not have
heard (a defect, not a pass). The verdict section names the
village and quotes it.

## 11. Wall numbers (reported every run, never judged)

Wins, national, table, wave-5 reached, wave-4 reached, median
survival, max survival, villages lost, total deaths — per leg
(control vs arm).

## 12. Metric review (to fill at evidence time, never mid-run)

- Whether the teach rate is driven by one seed/village or
  spread across the band (a single-village effect is a weaker
  GO).
- Whether the §3(b) RNG-shift coupling bit: any per-seed
  outcome difference, and whether it traces to a skipped
  gesture roll after a teach (the taught companion's first
  meeting day in the corpus) vs a genuine behavioral change.
  If it bit, propose the revision for the NEXT run (e.g. the
  gesture path draws its RNG unconditionally, or the bar
  becomes totals-identity instead of per-seed identity) — do
  NOT revise it here.
- Whether the 0.80 bar was the right strictness on a small
  denominator, and whether beat-level share (beats whose ALL
  companions are known after) would have judged differently
  from slot-level share (report both; the slot-level bar
  judges).
- Whether the holder-not-taught scope boundary reads as
  incoherent in play (the scholar hears the holder's name
  spoken too) — a follow-up design question for Steve, not a
  bar.

## 13. Freshness check (record, per the seed-band skill)

- Searched: all `evidence/**/*.md` for `10942[1-8]`,
  `10943[0-9]`, `10944[0-9]`; all evidence filenames for
  `*10942*`, `*10943*`, `*10944*`; `scripts/*.js` +
  `scripts/policies/*.js` for `10942[1-8]`.
- Suggested band 109421–109428 REJECTED: retarget-a (same Loop
  A run) owns 109411–109426 incl. 109421–109426 as its confirm
  half; the one `109421` hit in `evidence/2026-10-15/
  perseed-bankleg/summary.json` is `"mealKcal": 109421`, a
  calorie total, not a seed.
- This band 109431–109438: ZERO hits in `.md` evidence and
  filenames for 10943x/10944x; ZERO hits in scripts. Checked
  2026-11-24 ~03:00 UTC.
- Neighbor bands: departsafe-a 107601–107616, planform-a
  107633–107648, Loop B live 109309–109324, journey-deepening
  109401–109403, retarget-a 109411–109426 — none overlaps
  109431–109438.

## 14. Out of scope (recorded, not chased)

- Teaching the HOLDER's name from the beat (scope boundary,
  §1 — follow-up design question).
- The homebody-handoff line's new leader (different beat
  class; the handoff line is not SAY_RE-captured either —
  departname-a §8).
- The hold lines (villager-brain.js :736/:768) — same class,
  different finding; held departures are silent in the corpus
  (steve-call whether a hold should speak at all).
- Re-seed / expiry / re-seed-launch beats: holder-only, no
  companion to teach.
- Any change to `revealName` itself, to `knownNames` sharing,
  or to the naming rite — the channel and its consumers are
  used as found.
