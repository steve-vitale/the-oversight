# sim-aguard-a — PREREG (frozen before any judged sim)

**Arm:** sim-aguard-a · **Loop A run:** fleshout-20261118T0241Z · **Axis:** scale-onramp
**Type:** BUILD, fiction guard only, no mechanics change, no new line. One shared helper hardened.
**Branch:** `sim-aguard-a` · **Worktree:** `~/workspace/worktrees/sim-aguard-a`
**Base at arm start:** master `c043ece91` (coordinator evidence tip, sim-scale-onramp-round-0112:
holdervoice BUILD GO #2505 + handoff DIAG NO-GO + notick DIAG GO).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de4` (verified live in this tree before the judged legs).
**Band:** seeds 103461–103468 (8 seeds) · **Horizon:** 150d death-aware.
**Flags:** `PROFILEGATE=1` + `VETREENGAGE=1` (the band shape that produces blocked picks).
**Prereg:** `evidence/2026-11-17/sim-aguard-a-prereg.md` (this file, frozen).

## The question (finding #2509)

Pre-System "A" names would read "A meant to walk out with A".
`displayName` returns a stranger descriptor ("A man, maybe 20s") until
the System arrives or the name is earned socially, and `firstNameOf`
on that descriptor yields bare "A". No live line fires pre-System on
measured bands (496/496 blocked picks on the homebodyvoice-a corpus
carry real first names; the 25 holder lines on the holdervoice-b
corpus all carry real names) — nothing is broken in live play — but
the edge affects the #2499 companion line and the #2505 holder line
identically, and hierarchy.js, havenGrowth.js, convoTopics.js already
route around bare-"A" first names elsewhere. The fix is a SHARED
guard so no say() line can ever print a bare "A" name.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-17/sim-holdervoice-b.md` + prereg IN FULL — the
  #2505 line, its site (`writeCommit` in `src/js/villager-brain.js`),
  its guard, its once-per-pair dedup, its same-base no-line control
  (B4 byte-identical on 24 structural fields, 8/8 seeds), and its
  Sense-testing section, which FOUND this edge: the staged fixture
  caught it (day-0 villagers → every name "A"); the fix in THAT
  fixture was to stage the post-arrival state. The edge was filed
  there as a follow-up for "a shared name-resolution fix
  (descriptor-whole or `npcName` fallback) across both voice lines".
  This arm is that follow-up, taking the descriptor-whole option.
- `evidence/2026-11-17/sim-homebodyvoice-a.md` — the #2499 companion
  line (same site, same `firstNameOf` call shape), 496/496 blocked
  picks with real first names, 0 "A"-names.
- `docs/MEASUREMENT.md` §§9–12, 14–15 (staged method, pilot gate,
  death-aware horizons, pre-registration, metric binding, balanced
  panels). §15 panel: NOT built — this change moves no game outcome
  (B3 proves it); the same-base guard-off/guard-on control IS the
  before/after instrument for a fiction-only guard, per the holdervoice-b
  prereg's §15 reasoning.

## Canon read

- `docs/CANON.md` (read first) — the grounding rule is **"No silent
  actions. Every action narrates honestly, including failures"** and
  **"If you don't know, it doesn't show"**. A voice line that prints
  a bare "A" as a person's name violates the second: the game would
  show a name nobody knows, in a form no person has.
- `docs/CONVERSATIONS.md` — covers conversation voice; it does NOT
  cover dawn-bid narration or the name-resolution rule for say()
  lines. Not the channel used here.
- **Canon gap, recorded not invented:** no canon doc covers the
  stranger-descriptor short form for narration lines. The guard below
  is grounded in EXISTING CODE PRECEDENT, not invented canon:
  `Game.firstRef` (`src/js/game.js:17735` — "first-name-like
  reference that NEVER collapses to bare 'A'. Use this anywhere
  you'd split(' ')[0] a displayName"), the feastPlan `first()`
  (`game.js:32487` — "the whole descriptor is the honest short
  form"), `feastBuff.js` `disp()` (`feastBuff.js:780` — "never 'A'"),
  `hierarchy.js` `_repName` (`hierarchy.js:2647` — "stranger
  descriptor: use whole"), and `convoTopics.js:972` (firstRef, never
  split(' ')[0] on a descriptor). All four say the same thing: when
  the display name starts with the article "A"/"An", the WHOLE
  descriptor is the name.

## The guard — exact site, exact code (pinned by reading the code)

**Site:** `firstNameOf` in `src/js/villager-brain.js:621` — the shared
point. It is the ONLY name-resolution call on both voice lines:
companion half (`writeCommit`, lines 671–672) and holder half (lines
703–704). No other caller of `firstNameOf` exists in `src/`
(verified by grep). Hardening it guards both lines and any future
caller in the module, with no per-line patch.

**Code (frozen — the whole function):**

```js
  function firstNameOf(name) {
    try {
      var s = String(name || '');
      // AGUARD (sim-aguard-a, finding #2509): a stranger descriptor
      // ("A man, maybe 20s") is not a name — splitting off its first
      // word prints a bare "A" in say() lines ("A meant to walk out
      // with A"). Precedent (game.js feastPlan first(), feastBuff.js
      // disp(), hierarchy.js _repName, Game.firstRef): the whole
      // descriptor is the honest short form, never the article alone.
      // Real first names never start with a bare "A "/"An " token
      // (name generator: src/data/characterGen.json, 48 first names,
      // shortest 3 letters, none "A" or "An").
      if (/^an? /i.test(s)) return s;
      var f = s.split(' ')[0];
      return f || s;
    } catch (e) { return String(name || ''); }
  }
```

**Why this shape, and what it does to each input:**

- Real name ("Naran Tumen", "Nora") → first token, unchanged. The
  guard is a no-op on every live line today (proven by B2/B3, not
  assumed).
- Stranger descriptor ("A man, maybe 20s", "A woman, maybe 30s, with
  a limp") → the WHOLE descriptor. The line then reads "A man, maybe
  20s meant to walk out with A woman, maybe 30s — but A man, maybe
  20s never leaves Haven, so A man, maybe 20s stays home." — clunky
  with repetition, but honest and grammatical, and the exact form the
  feastPlan/feastBuff/hierarchy precedent already prints elsewhere.
- `displayName` always returns either a real name or a descriptor
  starting "A " (`personDescriptor`: `"A " + descriptorBase`, where
  `descriptorBase` is "woman/man/person, maybe <age>s" — never "An ").
  The `/^an? /i` test covers both articles anyway, matching the
  precedent's spelling.
- The single-token "A" input (no descriptor to fall back to) cannot
  arise through this call path: `displayName` never returns it and
  the name generator never produces a one-letter first name. It is
  documented here as unreachable, not handled — inventing a fallback
  name would be worse than the honest descriptor.

**Not changed (named so a reviewer can verify the diff is only the
guard):** the two call sites (lines 671–672, 703–704) are
BYTE-UNCHANGED — the guard lives in `firstNameOf` only. Neither
voice line's text, guard, or dedup map is edited. No commit
scheduling change; the party_launch deferral path is untouched (a
sibling arm owns it — if a rebase forces a crossing, STOP and report
instead of conflicting). `win-plan.js` untouched. No range, gate,
profile, or depart-logic change. `Game.say` consumes no RNG and
writes only the narration log; `firstNameOf` is pure string work, so
the guard cannot move a trajectory (verified by B3, not assumed).

## Band freshness (verified 2026-11-17, before this prereg)

Fresh band 103461–103468. Search scope: `grep -rn "103461" ...
"103468" evidence/*/sim-*-prereg.md` (each seed individually) and a
full-tree `grep -rn "10346[1-8]" evidence/ --include="*.md" -l`,
plus `grep -rn "10346[1-8]"` over the goal `hidden_files/`.
Result: the ONLY prereg hit is `sim-notick-a-prereg.md`, which lists
103461 among candidate bands it grep-checked and found 0 files for —
a freshness-check enumeration, not a use (its own frozen band is
103441–103448; 103461 was never run). The `hidden_files/` hits are
incidental numbers inside JSON corpora (a tribute amount `103465`,
pantry/long-ID values) — not seed namings, not a prereg, not a
forbidden list. **No prereg, forbidden list, screen, or extension
band claims 103461–103468. The band is fresh.** (Recorded here so a
later reader does not mistake notick-a's check-listing for a use.)

## Instrument (copy + adapt the holdervoice instrument, do not rebuild)

- **Driver:** `scripts/aguard-driver-20261117.js` — a copy of
  `scripts/holdervoice-driver-20261117.js` with these deltas, all
  recorded here: (a) names `aguard-a` / `perseed-aguard-a-<leg>` /
  `aguard-a-s<seed>-aguard-a-<leg>.json`; (b) the say-wrap ALSO
  captures every line matching the bare-"A" detector
  `/(^A (asked|meant) )|( with A —)|(but A never)|(so A stays)/`
  into `bareALines` (day + line) — the detector covers every bare-"A"
  position in both voice lines (subject, object, second clause);
  real first names are never "A", so a match can only be a bare-"A"
  name; (c) keeps the `homebodyLines` capture (`/never leaves
  Haven/`, both voice lines) and the `holderLines` capture
  (`/stays home\./`) AND the `blockedPicks` rows, so voice-line
  counts and line-to-pick matching are comparable across legs;
  (d) legs: TWO legs, `on` (guard in place) and `off` (guard
  temporarily reverted — `firstNameOf` restored to its base text,
  byte-restored after, sha256-verified — the holdervoice-b no-line
  control pattern); MODE must be `on` or `off`. Everything else —
  setup, the 150d death-aware run, the depart/v4 recorders — is the
  holdervoice instrument verbatim.
- **Analyzer:** none built; the judged checks are exact-match counts
  and byte comparisons over the driver output (scripted in the proof
  test), not a panel. No balanced panel is built: the change moves
  no game outcome (B3 checks that); the same-base off/on control IS
  the before/after instrument (the 2315Z lesson).
- **Proof test:** `scripts/test-aguard-a.js` — (a) static checks: the
  `src/` diff vs base is `firstNameOf` ONLY (one hunk, inside the
  function; both call sites byte-identical to base; both voice-line
  texts unchanged; `win-plan.js` untouched; no PROFILEGATE in
  `src/`); scripts diff is the aguard instrument only (2 files);
  (b) staged fixture (child process, one harness): PRE-System leg
  (`systemArrived` false — the state the finding is about): a
  range-0 holder + walkable companion scores party_launch → the
  holder line fires once with WHOLE descriptors, no bare "A"; a
  second identical score fires nothing (dedup); a BOTH-range-0 pair
  fires BOTH lines once each, companion first, no bare "A"; a
  walkable holder fires nothing. POST-System leg
  (`systemArrived = true`, fresh pairs): both lines fire with REAL
  first names in the EXACT frozen wording of #2499/#2505 — proving
  the guard is a no-op on real names; (c) live driver smoke: the
  aguard driver runs 5d on seed 103461 with 0 instrument errors;
  (d) corpus checks: B2 + B3 over the 16 judged files (see Bars).
- **Measurement lever (worktree only, reverted before commit):** skip
  the `if (prof !== 'wanderer' && prof !== 'explorer') continue;`
  check in the two `findCompanion` twins (villager-brain.js:150,
  win-plan.js:226) when `PROFILEGATE=1`, via a `profilegateOn()`
  helper mirroring the existing `vetreengageOn()` / `planfixOn()`
  pattern in win-plan.js:
  `((typeof process !== 'undefined' && process.env &&
  process.env.PROFILEGATE) === '1')`. Exactly as sim-profilegate-b /
  sim-homebodyvoice-a / sim-holdervoice-b did it. Default OFF; off in
  the browser too. The holder-side early returns
  (`expeditionCand`, `winPlanHavenTick`) are NOT bypassed — same as
  holdervoice-b. The lever is reverted before commit and the proof
  test's static checks fail the run if any PROFILEGATE reference
  remains in `src/`.

## Primary metric (frozen)

**Zero bare-"A" names in any voice line on either leg, and
guard-on/guard-off trajectories byte-identical** — the guard fires
nowhere live (no bare "A" exists to guard) AND changes nothing (the
guard is a no-op on real names). The staged fixture proves the guard
WORKS where the state exists (pre-System); the live band proves it
is INVISIBLE where it does not.

## GO bars (frozen — a miss is NO-GO, never re-scored)

1. **B1 staged fixture green.** `scripts/test-aguard-a.js` fixture:
   pre-System holder line + companion line fire with whole
   descriptors and ZERO bare-"A" matches; dedup holds (second score
   fires nothing); walkable holder silent; both-range-0 fires BOTH
   lines once each, companion first; post-System both lines match
   the EXACT frozen #2499/#2505 wording with real first names
   (guard no-op on real names, proven by exact text, not by
   assertion).
2. **B2 live band: 0 bare-"A" lines on BOTH legs, on BOTH lines.**
   Across the full frozen band (8 seeds, PROFILEGATE=1 +
   VETREENGAGE=1, 150d): `bareALines` is empty on all 8 guard-on
   legs AND all 8 guard-off legs, for both the companion line
   (`stays behind.`) and the holder line (`stays home.`). Voice-line
   counts are equal on/off per seed (the guard adds/removes no line).
3. **B3 trajectory neutrality (same-base control ONLY).** Guard-on
   vs guard-off legs (same driver, same flags, same base) are
   byte-identical on all 24 structural fields (gameDays, days,
   endReason, standing, scaleRank, maxWave, unlockedWave, won,
   villageLost, deaths, winPlanStats, dawnbidScores, dawnbidDeparts,
   dawnbidCensus, dawnbidStarts, companionPool, vetSays, v4seeds,
   v4departs, v4gates, v4encounters, launchdefSkips, daily,
   samples) on all 8 seeds, AND sayCount is identical on every
   seed, AND blockedPicks are identical. No cross-base letter check
   is pre-registered.
4. **B4 static scope.** The `src/` diff vs base is `firstNameOf`
   only (one hunk); both call sites byte-identical to base; both
   voice-line texts unchanged; `win-plan.js` untouched; no
   PROFILEGATE / profilegateOn reference remains in `src/`; the
   game-code commit carries `[needs-eyes]` (fiction lines).
5. **B5 instrument valid.** Proof test green (B1); driver runs with
   0 instrument errors on all 16 legs; `check.js --quick`
   attempted after the `src/` change and its result reported
   honestly (a killed incomplete run is recorded as incomplete,
   never as green).

Verdict is GO iff B1 + B2 + B3 + B4 + B5 all pass.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote live voice lines verbatim from the re-run
corpus (both legs) and judge whether they read as people being told
something true. For the fixture's pre-System lines, judge whether
the whole-descriptor rendering ("A man, maybe 20s meant to walk out
with A woman, maybe 30s…") reads as an honest stranger reference or
as a stutter — and whether the repetition of the full descriptor
three times in one line is acceptable, or whether the firstRef form
("the woman in her 30s") would read better as a follow-up. The
evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. The guard-off leg requires temporarily reverting `firstNameOf`
   to its base text and restoring it after, sha256-verified — the
   same pattern holdervoice-b used for its no-line control. If the
   restore verification fails, STOP and report; do not run judged
   legs on a half-restored file.
2. `git status` on the whole tree HANGS in this worktree (two
   attempts, 3.5+ min each, 0 output, killed — likely the hot-tree
   index contention the 2026-11-14 lesson records). The proof
   test's static checks therefore use scoped `git diff --name-only`
   (verified fast) and `git ls-files --others` with timeouts, never
   bare `git status`. If `safe-commit.sh` itself hangs on status,
   that is a loud failure, not a silent skip.
3. Eight seeds is a pilot. The guard's firing is deterministic
   given the state, and the state (a pre-System voice line) does
   not occur on this band at all — the live legs prove no-op-ness,
   the fixture proves the guard works. A confirm band adds nothing
   about the guard itself.
4. Loop B is live on the winnability chain
   (fleerepair2-rejudge2-b, seekgate-bandhunt-b, evadeclass-b) — do
   NOT touch its trees, arms, files, or seed bands. If a rebase
   conflicts on a file Loop B touched, stop and FAIL LOUDLY to the
   coordinator with the file names. Do NOT touch Loop B's claim or
   axis.
5. The `seq` counter leaks across seeds in one CLI process
   (homebodyvoice-a metric review): `rowSeq` is module-level in
   the driver, so multi-seed runs in one process carry the counter
   forward; cross-leg `dawnbidDeparts` comparisons that include
   `seq` will false-diff. The off/on legs must use identical
   invocation patterns (each seed its own process, same order) on
   both sides, as holdervoice-b did. NOTE: the B3 comparison in
   this arm strips `seq` before comparing `dawnbidDeparts`
   (documented, applied identically to both legs) OR uses identical
   invocation — the proof test implements the strip, and the
   evidence records which.

## Files

- Prereg: `evidence/2026-11-17/sim-aguard-a-prereg.md` (this file)
- Guard: `src/js/villager-brain.js` (`firstNameOf` only), `[needs-eyes]`
- Instrument: `scripts/aguard-driver-20261117.js`,
  `scripts/test-aguard-a.js`
- Corpus: `evidence/2026-11-17/perseed-aguard-a-on/` (8 files, judged
  legs), `perseed-aguard-a-off/` (8 files, same-base guard-off control)
- Evidence: `evidence/2026-11-17/sim-aguard-a.md`
- Disposition if NO-GO: revert the `src/` change in this tree before
  reporting (leave the instrument + evidence).
