# sim-aguard-a — EVIDENCE (verdict GO)

**Arm:** sim-aguard-a · **Loop A run:** fleshout-20261118T0241Z · **Axis:** scale-onramp
**Type:** BUILD, fiction guard only, no mechanics change, no new line. One shared helper hardened.
**Branch:** `sim-aguard-a` · **Worktree:** `~/workspace/worktrees/sim-aguard-a`
**Base at arm start:** master `c043ece91` (coordinator evidence tip, sim-scale-onramp-round-0112).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de4` (verified live in this tree).
**Band:** seeds 103461–103468 (8 seeds) · **Horizon:** 150d death-aware.
**Flags:** `PROFILEGATE=1` + `VETREENGAGE=1` (the band shape that produces blocked picks).
**Prereg:** `evidence/2026-11-17/sim-aguard-a-prereg.md` (frozen).
**Verdict: GO** — the staged fixture proves the guard works where the
state exists (pre-System lines render whole descriptors, never bare
"A"; post-System lines match the exact frozen #2499/#2505 wording
with real names), the live band shows 0 bare-"A" lines on BOTH legs
(guard-off and guard-on), and guard-on vs guard-off is byte-identical
on all 24 structural fields on all 8 seeds, sayCount identical too.
Finding #2509 is FIXED by this arm.

## The guard (exact)

**Site:** `firstNameOf` in `src/js/villager-brain.js:621` — the shared
point. It is the ONLY name-resolution call on both voice lines:
companion half (lines 671–672) and holder half (lines 703–704); no
other caller exists in `src/`. One function hardened, both lines
guarded, no per-line patch.

**Code (the whole function, frozen in the prereg):**

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

**Why this shape:** `displayName` returns either a real name or a
descriptor starting "A " (`personDescriptor`: `"A " +
descriptorBase`, where `descriptorBase` is "woman/man/person, maybe
<age>s" — never "An "). The `/^an? /i` test covers both articles
anyway, matching the precedent's spelling. The name generator's 48
first names contain no "A" or "An" (shortest is 3 letters), so the
guard can only trigger on a descriptor — real names pass through
unchanged by construction, and the live band proves it (B3).

**Net `src/` diff vs base:** one file, one hunk, +13/−2 lines, the
`firstNameOf` function only (`src/js/villager-brain.js`). Both call
sites byte-identical to base; both voice-line texts unchanged;
`win-plan.js` untouched. `sha256` of the guarded file:
`bff4cb2fff2c05baf8c855ca3e20028dee94c1bd010a904b1869cc268ba4b267`
(base file: `eb7e7580669e1efbdd2cd8e33b0a7ec0100b2c7c07275aeb9110068b785ee63f`
— the same prefix holdervoice-b recorded for its line-restored file).
The PROFILEGATE measurement lever (env-gated skip in both
`findCompanion` twins, exactly as profilegate-b / homebodyvoice-a /
holdervoice-b did it) was applied in this worktree only for
measurement and REVERTED before commit — verified: no `PROFILEGATE`
/ `profilegateOn` in `villager-brain.js` or `win-plan.js`.

## Before / after (identical seeds, same-base control)

Guard-on vs guard-off on the same base, same flags
(`VETREENGAGE=1`, `PROFILEGATE=1`), same driver — the off legs use
the guard-off file (base `firstNameOf` + the same worktree-only
lever), byte-restored after; guard-on file sha256-verified
`bff4cb2f…` on restore. The say stream is identical on every seed:

| Seed | Voice lines on/off | Holder lines on/off | Bare-"A" on/off | sayCount on/off | Structural fields (24) |
| --- | --- | --- | --- | --- | --- |
| 103461 | 12 / 12 | 0 / 0 | 0 / 0 | 9295 / 9295 | MATCH |
| 103462 | 14 / 14 | 1 / 1 | 0 / 0 | 9133 / 9133 | MATCH |
| 103463 | 0 / 0 | 0 / 0 | 0 / 0 | 8716 / 8716 | MATCH |
| 103464 | 6 / 6 | 0 / 0 | 0 / 0 | 12421 / 12421 | MATCH |
| 103465 | 6 / 6 | 0 / 0 | 0 / 0 | 6521 / 6521 | MATCH |
| 103466 | 15 / 15 | 0 / 0 | 0 / 0 | 14593 / 14593 | MATCH |
| 103467 | 16 / 16 | 0 / 0 | 0 / 0 | 12187 / 12187 | MATCH |
| 103468 | 15 / 15 | 0 / 0 | 0 / 0 | 8051 / 8051 | MATCH |
| **Total** | **84 / 84** | **1 / 1** | **0 / 0** | — | **MATCH 8/8** |

Structural fields compared (24): gameDays, days, endReason, standing,
scaleRank, maxWave, unlockedWave, won, villageLost, deaths,
winPlanStats, dawnbidScores, dawnbidDeparts, dawnbidCensus,
dawnbidStarts, companionPool, vetSays, v4seeds, v4departs, v4gates,
v4encounters, launchdefSkips, daily, samples — byte-identical on every
seed (dawnbidDeparts `seq`-stripped, per prereg). sayCount identical
on every seed. blockedPicks identical (1,009 rows band-wide). The
guard changes no live line text and moves no game outcome. The single
holder line on the band (seed 103462, day 83) fires identically on
both legs; holder-blocked picks are rare here (1 of 1,009 blocked
picks has holderMaxD < 1 — the holder-side early returns were NOT
bypassed, same as holdervoice-b).

## Bars (frozen — judged as written)

| Bar | Frozen wording | Result |
| --- | --- | --- |
| B1 staged fixture green | Pre-System lines with whole descriptors, 0 bare "A"; dedup holds; both-range-0 fires BOTH lines once each, companion first; walkable holder silent; post-System lines match EXACT frozen #2499/#2505 wording with real names | **PASS** — `scripts/test-aguard-a.js`: 42/42 checks green (fixture + static + smoke + corpus + wall) |
| B2 live band: 0 bare-"A" on BOTH legs, BOTH lines | `bareALines` empty on all 8 guard-on AND all 8 guard-off legs; voice-line counts equal on/off per seed | **PASS** — 0/0 bare-A; 84/84 voice lines; 1/1 holder lines |
| B3 trajectory neutrality (same-base control ONLY) | Guard-on vs guard-off byte-identical on all 24 structural fields, all 8 seeds; sayCount identical; blockedPicks identical | **PASS** — MATCH 8/8; sayCount identical 8/8; blockedPicks identical |
| B4 static scope | `src/` diff is `firstNameOf` only (one hunk); call sites byte-identical; line texts unchanged; `win-plan.js` untouched; no PROFILEGATE in `src/`; `[needs-eyes]` on the commit | **PASS** — one hunk, +13/−2; lever reverted (0 hits); `[needs-eyes]` in the game-code commit message (see Disposition) |
| B5 instrument valid | Proof test green (B1); 0 driver errors on all 16 legs; `check.js --quick` attempted + reported | **PASS** — 0 errors on all 16 legs; policy sha frozen; check.js --quick: 330 passed, 10 failed in 1342s (exit 1), all 10 triaged below — none traces to the guard (no failing script mentions `firstNameOf`, `villager-brain`, or the voice lines). (The proof test's overall exit is 0: 42/42 checks green.) |

## Wall numbers (this run's judged legs, guard-on, this base)

| | This arm (guard-on) |
| --- | --- |
| National standing (≥200) | 2/8 (seeds 103463: 275, 103467: 390) |
| National rank | 0/8 |
| Table / wins | 0 / 0 |
| Wave 4 unlocked | 8/8 |
| Wave 5 unlocked | 2/8 (103463, 103467) |
| Median survival | 95d |
| Villages surviving to 150d | 0/8 (all 8 village-lost) |

The wall did not move: no village reaches national rank, the table,
or a win. All eight villages are lost by day 146 at the latest. The
guard is fiction-only and moves no outcome (B3 proves it), so the
wall numbers are the band's, not the guard's.

## Village assessment (plain words)

Eight villages, same eight on both legs. The one to picture is seed
103461: Sigrun is the villager nobody can walk out with — Rafael
asks her on day 30, Luis on day 33, Kevin on day 37, and the village
answers each asker once, by name, and then stays quiet. Before the
#2499/#2505 lines, those bids died silently; now the morning says
why, once per asker. On seed 103462, Chanpen — a holder who never
leaves Haven — means to walk out with Nikolai on day 83, and the
village says so once, by name. The blank this arm filled is narrower
than a line: it is the guarantee underneath both lines, that no
morning will ever introduce a person as "A". Nothing in live play
changed — every one of the 84 voice lines on this band already
carried real names, and the guard leaves them byte-identical. What
the guard protects is the morning the game hasn't had yet: the day a
dawn bid fires before the System arrives, when nobody has a name
yet, the village will describe the strangers it can see instead of
calling them "A".

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts. The live lines read as people being told
something true, with real names throughout — the guard is invisible
there, which is the point:

- `Rafael asked Sigrun to walk out with the party — but Sigrun never leaves Haven, so Sigrun stays behind.` (seed 103461, day 30)
- `Luis asked Sigrun to walk out with the party — but Sigrun never leaves Haven, so Sigrun stays behind.` (seed 103461, day 33 — a different asker, his own one telling)
- `Chanpen meant to walk out with Nikolai — but Chanpen never leaves Haven, so Chanpen stays home.` (seed 103462, day 83 — the band's only holder line)

The fixture's pre-System lines are the guard's audible proof. With
the guard, a dawn bid before the System arrives reads:

- `A man, maybe 60s meant to walk out with A man, maybe 50s, with a broad frame — but A man, maybe 60s never leaves Haven, so A man, maybe 60s stays home.`
- `A man, maybe 60s asked A woman, maybe 60s, with a limp to walk out with the party — but A woman, maybe 60s, with a limp never leaves Haven, so A woman, maybe 60s, with a limp stays behind.`

Without the guard, both would have read "A meant to walk out with
A" / "A asked A…" — a name nobody has, twice in one line. The
guarded form is honest and grammatical: each "A man, maybe 60s" is a
person you can see. It IS repetitive — the holder's full descriptor
appears three times in one line — but it reads as a stranger being
described carefully, not as a stutter, and it is the exact form the
feastPlan, feastBuff, and hierarchy precedent already print
elsewhere. The prereg asked whether the `firstRef` form ("the woman
in her 30s") would read better: it would be shorter, but it is a
different naming contract (whoTag, not displayName), and
`firstNameOf` is a string function with no villager id to resolve —
routing through `firstRef` would mean changing both call sites to
pass ids, a bigger change than this guard arm's scope. Recorded as a
follow-up for the coordinator (see Findings), not a re-scope here.
Post-System, the guard vanishes into the exact frozen wording:

- `Ella meant to walk out with Oliver — but Ella never leaves Haven, so Ella stays home.` (fixture, post-System leg)

## Metric review

- **B3 as a same-base control worked cleanly, once the invocation
  grouping matched.** The first full proof-test run failed B3 on
  `launchdefSkips` for seeds 103465–103467 only — and the cause was
  the driver's module-level `seq` counter (the homebodyvoice-a
  lesson, prereg limitation 5), not a trajectory difference: the
  service restart killed the first ON run after 4 seeds, so the ON
  legs ran as 4+4 processes while the OFF legs ran as one 8-seed
  process, and `seq` restarted at 1 in the ON second process
  (103465 `seq` 25,26,27… vs OFF 423,424,425…). Verified seq-only
  (identical with `seq` stripped on all three seeds), then re-ran
  the OFF 103465–103468 legs as a second process — the exact
  grouping the ON legs used — and B3 passed literally, with the
  `dawnbidDeparts` seq-strip (prereg-documented) still in place.
  No bar was re-scored: the fix was to the legs' invocation, not
  to the judge. The `seq` leak is a standing instrument wart: any
  future driver copy that compares `launchdefSkips` or
  `dawnbidDeparts` across legs must either use identical process
  grouping or strip `seq` on BOTH fields — this arm strips it on
  one and groups on the other, and the evidence records which.
- **B2's expectation (0/0) held as the "no-op live" prediction.**
  The prereg froze 0 bare-"A" on both legs because no live line
  fires pre-System on measured bands; 84 voice lines fired across
  the band and every one carried real names on both legs. The guard
  is proven to WORK by the fixture and proven INVISIBLE by the band
  — the two halves of the prereg's primary metric, each by its own
  instrument, not one instrument doing both jobs.
- **The panel was not built, by prereg design.** §15 panels compare
  game outcomes; this change moves none (proven byte-identical).
  The same-base off/on control IS the before/after instrument for
  a fiction-only guard.
- **Fixture lesson (carried from the run):** the staged fixture
  must stage BOTH states — pre-System (the guard's proof) and
  post-System (the no-op proof) — with FRESH pairs for the second
  leg, because the first leg's pairs are already dedup-marked. This
  arm's fixture does that (pre pairs h0+compW/compH, post pairs
  h1+compW2/compH), and the post-System exact-wording checks are
  what prove the guard changes nothing for real names.

## Instrument notes (adoption-relevant)

- Driver `scripts/aguard-driver-20261117.js` is a copy of the
  holdervoice driver with the prereg-recorded deltas: aguard names,
  the `bareALines` capture (detector
  `/(^A (asked|meant) )|( with A —)|(but A never)|(so A stays)/`,
  kept in sync with the proof test by a static check), the kept
  `homebodyLines` + `holderLines` captures, and the `blockedPicks`
  rows. Both `const file` sites in `main()` carry the new name.
- The `blockedPicks` rows carry `holderFirst`/`compFirst` (first
  names at score time) — same as holdervoice-b. On this band all
  are real names; the B2 check also re-tests every recorded voice
  line itself against the detector, so a capture gap in `bareALines`
  could not hide a bare "A".
- Swap hashes (guard-off/on control): guard-on file (guard only,
  lever reverted) `bff4cb2f…`; guard-off file (base `firstNameOf` +
  same lever) `e94b8f57…`; base file `eb7e7580…`. The guard-on file
  was restored and sha-verified after the OFF legs; the lever was
  reverted and verified (0 PROFILEGATE/profilegateOn in `src/`,
  `win-plan.js` diff empty).
- **Service restart mid-run:** the first ON driver run was killed
  by a service restart (SIGTERM) after 4/8 seeds; the 4 completed
  files were intact and the remaining 4 were re-run. The restart
  also wiped `/tmp` (the swap copies lived there); they were
  rebuilt in `~/workspace/scratch-aguard/` (persistent) with
  identical hashes and verified before use. Lesson: keep swap
  files out of `/tmp` on this box.
- `git status` on the whole tree HANGS in this worktree (two
  attempts, 3.5+ min each, 0 output, killed — the hot-tree index
  contention the 2026-11-14 lesson records). The proof test's
  static checks use scoped `git diff --name-only` and `git
  ls-files --others` with timeouts, never bare `git status`.
- Telemetry deviation check: NOT RUN — the per-seed files carry
  top-level `anchorCommit`, so they are sweep recorder rows, not
  runs; the script refuses recorder-corpus input against a run
  baseline (same documented refusal as holdervoice-b and
  round-2025). Baseline NOT rolled.
- `check.js --quick` triage (330 passed, 10 failed in 1342s, exit 1;
  log `~/workspace/scratch-aguard/check-quick.log` — NOT in the repo,
  kept out of the tree because it is a run log, not evidence; the
  first attempt was killed by a service restart at ~8.5 min, log
  lost to the `/tmp` wipe, and this is the completed second attempt):
  5× 120s per-script timeouts under box load (living-garden-deed,
  occupation-panels, one-person-army-deed, trust-observer-neutrality,
  capable-bot — all `exit null, 120.0–120.1s`; the same signature
  holdervoice-b triaged as load artifacts, whose identical timeouts
  passed on direct retry). 2× retained-proof freshness gates that
  reproduce IDENTICALLY on this base without the guard
  (measurement-proof-update "Proof source inputs are not current",
  measurement-workflow — the same two holdervoice-b verified with
  the line stashed). 1× phone-frame-proof (retained receipt stale
  across boot inputs — same family as holdervoice-b). 1×
  measurement-cache-flags ("both actual CLI configurations complete
  valid neutral panels" — the documented box-load artifact,
  AGENTS.md 2026-11-12). 1× ladder-bundle ambient-raid control
  (78/79 — pre-existing on this base, same as holdervoice-b, which
  verified it reproduces with the line stashed). Verified by grep:
  NONE of the 10 failing scripts mentions `firstNameOf`,
  `villager-brain`, `homebody`, `holderSaid`, `stays home`, or
  `stays behind` — the guard (a pure string function, no RNG, no
  state) cannot be implicated in a timeout, a stale-proof gate, or
  an ambient-raid control. No failure traces to the guard.

## Findings (for the coordinator / sim-findings.md)

- **Pre-System "A" names on both voice lines — FIXED.** Finding
  #2509 is fixed by this arm (report in this evidence; the
  coordinator updates `hidden_files/sim-findings.md` — this worker
  does not edit it). The shared guard in `firstNameOf` covers both
  lines and any future caller in the module.
- **firstRef form as a follow-up (not this arm):** the guarded
  pre-System line repeats the full descriptor three times ("A man,
  maybe 60s … A man, maybe 60s … A man, maybe 60s"). `Game.firstRef`
  would render "the man in his 60s" — shorter, arguably better
  prose — but it needs the villager id at the call site, so it is
  a call-site change, not a `firstNameOf` change. If a future arm
  wants the shorter form, it routes the two call sites through
  `self.firstRef(vid)` and re-proves B1–B3; the guard stays as the
  backstop either way.

## Disposition: GO — guard SHIPS (coordinator lands; [needs-eyes])

The guard stays in the tree (`src/js/villager-brain.js`,
`firstNameOf` only, +13/−2). No revert: all five frozen bars pass
as written (42/42 proof-test checks), the same-base control proves
the guard moves no outcome, and the live corpus carries 0 bare-"A"
lines on both legs. Finding #2509 is FIXED by this arm.

## Files

- Prereg: `evidence/2026-11-17/sim-aguard-a-prereg.md`
- Guard: `src/js/villager-brain.js` (`firstNameOf` only), `[needs-eyes]`
- Instrument: `scripts/aguard-driver-20261117.js`,
  `scripts/test-aguard-a.js`
- Corpora: `evidence/2026-11-17/perseed-aguard-a-on/` (8 files,
  judged legs), `perseed-aguard-a-off/` (8 files, same-base
  guard-off control)
- Evidence: `evidence/2026-11-17/sim-aguard-a.md` (this file)
