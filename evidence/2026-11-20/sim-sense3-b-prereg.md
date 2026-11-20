# sim-sense3-b — FROZEN prereg (Loop B 1830Z run, arm sim-sense3-b)

**Frozen:** 2026-11-20 ~19:15 UTC, BEFORE any judged sim. Base master
`d352834ef2ce37b161994ece3b6bffbd26ac1e46` (Loop A lend landing —
instrument/evidence only, zero src/js or policy change on that
commit). Branch `sim-sense3-b`. Worktree
`~/workspace/worktrees/sim-sense3-b`.
**Diagnostic:** instrument-only — ZERO `src/js` game-code changes,
no default flipped, no lever built. The instrument is a renamed
driver copy + a new analyzer + a proof test in `scripts/` (pure
reads of the fight record `rec` and of the frozen dmgshape corpus);
the game is untouched. The ALLYSLOT3 slot is NOT ported to this
branch: the gate is read from the held port commit `a1cd6cdc0`
(sim-dmgshape-b, cherry-pick of `f4d1100ee`) via `git show`, never
applied. This arm answers the sense question on master as-is.

## The question (finding #2619; sim-findings.md #2623)

The third ally never reaches a live wave-4+ fight. 6 quad launches
on the designated band 106181–106188, ALLYSLOT3 ported and
staged-proven (test-allyslot3-b.js 18/18), but 0/156 recorded
wave-4+ encounters carry ally3Vid and ally3Dealt is 0 across the
whole dmgshape-b corpus. The slot works when a launched quad's
sense returns a third companion; live play never returns one — or
so the finding was filed. This arm re-opens that premise: under
what conditions does a launched quad's sense return a third
companion, which sense inputs does the gate need, and which
condition is never met in the 156-encounter corpus?

## What the brief-ordered corpus read already shows (hypothesis, not verdict)

Read first, before freezing (brief: "examine the existing
dmgshape-b corpus first"): `evidence/2026-11-20/sim-dmgshape-b.md`
+ this prereg's sibling + `sim-dmgsurvey-b.md` +
`src/js/party-wiring.js` + the port diff `a1cd6cdc0`. The read
produced a HYPOTHESIS to test, not a verdict:

1. **The premise is wrong at the sense level.** The sense DOES
   return a third companion for launched quads: 8/156 encounters
   carry 3 `allyVids` (the sense's return, recorded from `opts`
   by the driver), including the d133 Eulogy fight where all
   three launch companions (daniyar, jorge, sofia) are in the
   passed-in list. What never happens is the third companion
   ENTERING the fight (`ally3Vid` null, `ally3Dealt` 0).
2. **Entry path 1 — at the door — is closed by construction.**
   The engine's third-ally door block sits inside
   `if (opts.allyFromStart ...)` (fieldFights.js:1404). The only
   setter of `allyFromStart` in src is `aidFight` (comms.js:672),
   and it OVERWRITES `opts.allyVids` with the crisis's foreign
   aid parties. A launch companion can never be at the door.
   Corpus: `allyFromStart` false on all 156 encounters.
3. **Entry path 2 — the third shout — needs three hopeless
   rounds.** The shout ladder is an else-if chain (fieldFights.js
   2635/2671/2694 + the ported third branch): one branch per
   round's break check, hopeless first evaluated at round ≥ 2
   (line 2538). Shout 1 earliest round 2, shout 2 earliest
   round 3, shout 3 earliest round 4. In the 8 three-vid
   encounters the fights produced at most ONE hopeless round:
   2 no-fight (evade), 1 contact-finish kill (0 rounds), 2
   signature exits in round 1 (Suburb navigation, Timeslot
   peacemaker), 2 low-HP flees in the same break check as the
   first shout ("past holding"), 1 death the round after the
   first shout. Eulogy trick rounds suppress hopeless outright
   while the fighter is above 25% HP (COUNTERWIRE, lines
   2579–2593); after shout 1 the party-pool morale can suppress
   the next hopeless round too.
4. **The ladder itself works when fights last.** Corpus-wide,
   42/47 fights of ≥ 4 rounds fired shout 2 (ally2Vid set).
   The constraint is rounds, not the sense.
5. **Router caps (secondary, not binding for quads):** the
   expedition route passes the full sense return uncapped
   (villager-agency.js:662, `allies: allyVids.length`); the
   wild router slices to 2 on master (game.js ~21144, cap 3
   only with the port); the patrol router slices to 2 even
   with the port (game.js ~8411, `pAllyVids.length < 2`
   untouched by `a1cd6cdc0`). On master, only the expedition
   route can deliver 3 vids to a fight.

**Falsifiers (what would kill this hypothesis):** a fresh-leg
three-vid fight firing 2 shouts; the live-shape staged fixture
firing 2 shouts; a three-vid fight reaching round 4+ without a
third hopeless round (ladder structure wrong); any
`allyFromStart: true` row in either corpus (door path live).

## Corpora to examine

- **PRIMARY (frozen, already run):** `evidence/2026-11-20/
  perseed-dmgshape-b/` — 8 seeds 106181–106188, 150d,
  slot PORTED (base 0d925556a + a1cd6cdc0), policy
  150229eda010, 156 wave-4+ encounters. The finding's corpus.
  Re-analyzed through the NEW sense3 analyzer (reproduction
  check, §B of the proof test) — not re-run.
- **REPLICATION (this run, fresh band):** 8 seeds
  106251–106258, 150d death-aware, competent verbatim on THIS
  base, slot ABSENT. Fresh-band verification per the survey
  protocol (below).
- **NOT a corpus for this question:** the dmgsurvey
  designated-band corpora — the survey driver slices
  `allyVids` to 2 and records no `ally2Vid`, so it is blind
  to the sense question by construction (verified: 0 three-vid
  rows, 0 ally2Vid across 171 encounters — an instrument
  artifact, not a live fact). Named here so no one cites it
  against the sense census.

## Band freshness (verified 2026-11-20, before this prereg)

Candidate band 106251–106258 (next band after strikeband-b's
106241–106248, which is used and therefore NOT fresh).
Search scope per the survey protocol: (1) `grep -rln` over
`evidence/*/sim-*-prereg.md`; (2) `rg -P` bounded-pattern
search (standalone 6-digit, not preceded/followed by a digit)
over the worktree (contents + filenames) and over goal
`hidden_files/`; (3) targeted seed-field checks:
`"seed": 10625[1-8]`, `SEEDS=...10625[1-8]`, `s10625[1-8]`,
dated `sim-*.md` mentions. Result: **zero hits naming any
of the 8 seeds as a sim seed anywhere.** Every apparent hit
was adjudicated by hand, all the same false-positive class
the survey documented (bare numbers in telemetry/census JSON:
pantry/kcal values, tick counts, daily metric rows such as
`106252` in pipe-delimited daily tables) — none a seed use.
No candidate in any `SEEDS=` line, no candidate in any dated
`.md` as a seed, no exact-seed filename, no candidate in any
prereg, tracker, findings, or claim file. **Band FRESH.**

## Substrate (frozen)

- Flags: SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 LAUNCHSURVIVE=1. **ALLYSLOT3 deliberately
  UNSET** — this leg measures the sense on master as-is; the
  slot is absent from src (verified: zero `ALLYSLOT3` /
  `ally3Vid` in `src/js/`, `grep -rn`). The driver enforces
  SLOT_ABSENT and records `allyslot3InSrc: false` per corpus
  file (dmgsurvey precedent); if the slot ever lands, the
  driver STOPS rather than silently re-scoping.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — the policy ON THIS BASE. It
  DIFFERS from the dmgshape leg's `150229eda010`: journey-landing
  r149 fight-step fixes (beastDodgeMove reachability, closeStep
  no-path skip — the scholar's own fight-step helpers only;
  villager fights run no policy). Recorded here, not hidden:
  the fresh leg is comparable for the sense question, and the
  difference is confined to scholar movement. If the policy
  moves before the judged leg, record it and STOP (frozen-base
  check, do not silently proceed).
- Horizon: 150d, death-aware (dead villages stop, +10d tail max).
- Policies: competent verbatim only.
- Seeds: **106251–106258, the FULL fresh band, never a subset.**
- Base: master `d352834ef` (recorded as the base; the worktree
  branched from `e103a64cc` and was rebased onto `d352834ef`
  at arm start — the rebase fast-forwarded, no conflicts).

## Primary metric (BINDING, §14)

**The sense-condition census of wave-4+ encounters** — for
every `v4encounters` row, the analyzer records: sense return
`len(allyVids)`; shouts fired = count of non-null
`allyVid`/`ally2Vid`/`ally3Vid` (each shout IS one hopeless
round — else-if chain, one branch per round); `shoutRound` /
`shout2Round` / `shout3Round` from the engine's SHOUTREC
fields; `allyFromStart`; rounds; outcome; end cause from
outcome + log (evade / contact-finish / signature-exit /
low-HP flee / death / monster-flee / killed).

**GO requires ALL of:**

- (M1) **Reproduction:** the sense3 analyzer reproduces the
  frozen dmgshape census exactly: 8 three-vid encounters,
  0 with `ally3Vid`, max shouts fired in three-vid fights = 1,
  `allyFromStart` 0/156, shout-2 rate in rounds≥4 fights
  42/47. (The instrument reads the frozen corpus correctly.)
- (M2) **Ladder proof (staged fixture, proof test §2):** on
  master, a geared quad vs a wave-4 monster with 3 vids and
  no `allyFromStart` fires shout 1 on round 2 and shout 2
  on round 3 — one shout per hopeless round — and no third
  shout exists to fire (`ally3Vid` null, no "shouts a third
  time" line). The ladder is rounds-bound, not sense-bound.
- (M3) **Fresh-leg replication:** (a) `allyFromStart` 0 on
  every fresh-leg encounter; (b) among fresh-leg three-vid
  encounters, IF ANY, shouts fired ≤ 1 each — if the fresh
  band yields ZERO three-vid encounters, clause (b) is
  recorded as "no replication possible on this band"
  (vacuous, not a pass, not a refutation); (c) ladder-works
  control: in fresh-leg fights of ≥ 4 rounds, shout 2 fires
  in ≥ 75% (dmgshape reference 42/47 = 89%).
- (M4) **Door closure (code-read + corpus):** the
  `allyFromStart` setter is unique to `aidFight` (comms.js)
  and `aidFight` overwrites `opts.allyVids` with foreign
  parties (lines cited in the evidence) — verified by grep,
  not assumed — AND `allyFromStart` is 0/156 on the dmgshape
  corpus and 0/N on the fresh leg.
- (M5) **Deliverable:** a NAMED mechanism (the binding sense
  condition, with encounter-level evidence) AND a concrete
  next lever shape for the following arm, both in the
  evidence file.

A miss on any of M1–M4 is NO-GO, never re-scored against a
friendlier metric. A missing M5 (no mechanism named, or no
lever shape) is NO-GO kind UNANSWERED. If a falsifier fires
(fresh-leg three-vid fight with 2 shouts; live-shape fixture
with 2 shouts; a round-4+ three-vid fight with no third
hopeless round), the hypothesis is WRONG and the verdict is
NO-GO kind HYPOTHESIS-REFUTED with the refuting encounter
named.

## Secondary (REPORTED, not binding)

- Per-seed launch map (launches, quad launches, three-vid
  encounters, shouts fired) on the fresh band.
- End-cause taxonomy of all fresh-leg three-vid fights
  (evade / contact-finish / signature-exit / low-HP flee /
  death), with log lines.
- Wall numbers for the fresh corpus (national / table / wins,
  wave 4–5 unlocks, median survival, community loss,
  standing ≥ 200) reported every run and compared against
  the dmgshape designated-band corpus as a reproducibility
  reference (different band, moved base + policy — the
  comparison is descriptive, never a lever before/after).
- Router census: three-vid encounters by origin (expedition /
  world-tick / patrol / aid) — on master only the expedition
  route can deliver 3 vids (wild + patrol slice to 2).

## Design

- Driver: `scripts/sense3-driver-b.js` — a copy of
  `scripts/dmgshape-driver-b.js` with ONLY these changes:
  header comment, `arm` string `sense3-b`, default RUN
  `sense3-b`, default OUTDIR `perseed-sense3-b`, MODE guard
  `MODE=sense3`, corpus file prefix `sense3-b-s<seed>`, the
  two stack-skip filename strings, and the slot handling:
  LEVER_PRESENT replaced by SLOT_ABSENT (enforced — the leg
  stops if slot code ever appears), ALLYSLOT3 required UNSET.
  Two additions, both pure reads from the fight record:
  each encounter row also carries `intent` and the SHOUTREC
  shout rounds (`shoutRound` / `shout2Round` /
  `shout3Round`). All other recorder logic byte-identical in
  behavior. Corpus: `evidence/2026-11-20/perseed-sense3-b/`
  (8 files).
- Analyzer: `scripts/analyze-sense3-b.js` — NEW, small:
  sense-condition census over a corpus dir (any of: the
  frozen dmgshape corpus, the fresh sense3 corpus),
  classifying every encounter by sense return / shouts fired
  / allyFromStart / rounds / outcome / end cause, with a
  selftest (§A synthetic rows + §B dmgshape-corpus
  reproduction fixtures).
- Proof test: `scripts/test-sense3-b.js` — §0 base + slot-absent
  + policy-sha checks; §1 analyzer selftest; §2 staged
  ladder-structure fixture (geared quad, 3 vids, no
  allyFromStart — proves one-shout-per-hopeless-round on
  master); §3 staged live-shape fixture (fighter at the live
  median entry HP 84 + corpus-average gear vs a wave-4
  monster — the corpus taxonomy's prediction, recorded as
  observed); §4 driver smoke (one 30d seed on the fresh
  band, exit 0, 0 instrument errors, slot-absent recorded);
  §5 corpus-reproduction check over the FROZEN dmgshape
  corpus through the new analyzer.
- Panel: none — this is a sense-side diagnostic, not a
  lever before/after; the wall-number comparison against
  the dmgshape corpus is the reproducibility reference.
  Telemetry: `node scripts/telemetry-check.js` attempted
  against the fresh corpus; if it refuses recorder corpora,
  record the refusal verbatim and report wall numbers
  directly (dmgshape-b §4 precedent).

## Expectation (not a bar)

A launch-thin fresh band (strikeband-b: 9 launches / 24 seeds
on fresh bands vs 16 / 8 on the designated band): expect
~2–4 launches, ~1 quad, 0–2 three-vid encounters. The
verdict does NOT depend on the fresh band delivering a
three-vid fight — M1+M2+M4 carry it, M3(b) is vacuous-ok.
Do not drop dead seeds or re-scope the band.

## Fixture (encounter-gear rule, Steve 2026-11-13)

Staged fixtures stage a GEARED villager quad, never a fresh
un-geared scholar alone. Gear is taken from the live corpus:
launched-quad gate rows (v4gates) show all members armed +
armored, armor P 8–30 (median ~18–24). The staged party is
equipped to that standard (hunting_spear + hide_armor class,
measured back through `S.equipment.armorOf` /
`weaponBonusOf` in the test — the test asserts the measured
P lands in the live 8–30 range). Fighter entry HP: §2 ladder
fixture uses a 200-HP holder (the allyslot3 staged shape —
the fixture isolates the ladder's round structure, and the
HP is stated as a probe parameter, not a live claim); §3
live-shape fixture uses the live median entry HP 84. Both
fixtures fight a wave-4 monster (audit for §3; gavel is
wave-3 and is used ONLY in §2 to reproduce the allyslot3
staged ladder shape byte-for-byte — recorded as such, not
as a wave-4 claim).

## Metric review (for the NEXT run — this run is judged as frozen)

- The hypothesis was formed from the brief-ordered corpus
  read, BEFORE this prereg froze — the fresh leg is a
  confirmatory replication, not an exploration. The bars
  above are the confirmation tests; a falsifier is a NO-GO,
  not a re-score.
- "Hopeless rounds" are counted via shouts fired, not
  re-derived: each shout IS one hopeless round (else-if
  chain, one branch per round's break check, hopeless first
  evaluated at round ≥ 2). The SHOUTREC fields
  (`shoutRound` / `shout2Round`) are the engine's own record
  of them; the analyzer cross-checks shouts fired against
  the shout lines in the log.
- Target matching is by TYPE id, not monster instance (the
  recorder carries no instance id) — same caveat as the
  dmgshape family; the evidence names the target type beside
  every three-vid fight so this stays auditable.
- The dmgsurvey corpus is explicitly NOT a sense corpus
  (allyVids sliced to 2, no ally2Vid) — do not cite its 0/171
  as evidence about the sense; it is an instrument artifact.
- The policy moved between the dmgshape leg and this base
  (r149 scholar fight-step fixes). The fresh leg is not a
  before/after vs dmgshape; it is a replication of the sense
  mechanism under the current policy. The wall-number
  comparison is descriptive only.
- Counted vs distinct: three-vid encounters are counted per
  encounter row (a launch's first fight and a later meeting
  with the same target type are different rows); the
  mechanism is judged per ENCOUNTER, not per launch, because
  the shout ladder is a per-fight property.
