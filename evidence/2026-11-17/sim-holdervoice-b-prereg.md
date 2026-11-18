# sim-holdervoice-b — PREREG (frozen before any judged sim)

**Arm:** sim-holdervoice-b · **Loop A run:** fleshout-20261118T0112Z · **Axis:** scale-onramp
**Type:** BUILD, fiction only, no mechanics change. One voice line, one site.
**Branch:** `sim-holdervoice-b` · **Worktree:** `~/workspace/worktrees/sim-holdervoice-b`
**Base at arm start:** master `3d0f5770c` (coordinator evidence tip, sim-scale-onramp-round-2315).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
(same bytes as homebodyvoice-a / profilegate-b; verified before the judged legs).
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.
**Prereg:** `evidence/2026-11-17/sim-holdervoice-b-prereg.md` (this file, frozen).

## The question (finding #2505)

The #2499 fiction line (landed `b7236b65f`, `evidence/2026-11-17/sim-homebodyvoice-a.md`)
voices only the COMPANION half: a dawn-bid pick whose companion has max
range 0. The HOLDER half is still silent: when the HOLDER is range-0 and
the picked party stays home, the morning says nothing. The selblock-a
classification (`evidence/2026-11-17/sim-selblock-a.md`, finding #2498)
is the size of the silence: **8 of the 12 selected-blocked instances are
homebody holders**, and **79 of 113 blocked selections are
inviter-range-0** — the holder's own range-0 is the most common block in
the launch funnel, and the game narrates none of it. A dawn bid by a
holder who cannot walk reads as a promise the morning breaks silently,
exactly as the companion half did before #2499.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-17/sim-homebodyvoice-a.md` + prereg — the #2499
  line, its site (`writeCommit` in `src/js/villager-brain.js`), its
  guard (`winPlanAction === 'party_launch'` + companion +
  `npcMaxDist(companion) < 1`), its once-per-pair dedup
  (`homebodySaid`, keyed `holderId + '>' + companionId`), and its
  lessons: same-base controls over frozen letter-checks (B1-letter and
  B4-letter both failed on base drift while their substance passed by
  control), role-sensitive line matching (the B2 substring bug), and
  the `seq` counter leaking across seeds in one CLI process.
- `evidence/2026-11-17/sim-selblock-a.md` + prereg — the holder-half
  numbers above (8/12 homebody holders; 79/113 inviter-range-0
  selections; `inviter-range-0` names 6 of the 12 instances) and the
  depart shape (`vidBlock: "range-0"`, depart `hold`).
- `evidence/2026-11-17/sim-scale-onramp-round-2315.md` — standing
  posture: scale-onramp converging, NOT converged; wall numbers
  national 1/8, table 0, wins 0, wave 5 unlocked 1/8 on this band.

## Canon read

- `docs/CANON.md` (read first) — the grounding rule is **"No silent
  actions. Every action narrates honestly, including failures."** A dawn
  bid by a holder who cannot walk is a failed action the game currently
  narrates not at all. The line is that narration.
- `docs/CONVERSATIONS.md` — covers conversation voice (`sayLine`,
  spoken beats, voice boundary). It does NOT cover dawn-bid narration;
  not the channel used here.
- `docs/VILLAGER-BRAIN.md`, `docs/PARTY.md` — no voice line for a
  blocked holder pick; no holder-voice rule.
- **Canon gap, recorded not invented:** no canon doc covers expedition
  companion eligibility voice, or what the game says when the picked
  party's holder cannot walk. The line below is grounded in the
  CANON.md no-silent-actions rule and the existing `Game.say`
  narration channel (`say()` = `emit(text, 'narration')`,
  `src/js/game.js`), not in an invented voice system. One line, no
  variants: deterministic by design (exact-match proof), following
  #2499.

## Steve-call #1409 — checked, no conflict

#1409 as listed (`docs/AGENT-LANES.md`, Codex executive decisions
2026-10-29 item 7): "Homebodies as blocked returns — do villagers who
stay home count as blocked returns for the returns measures?" It is
still OPEN: no ruling appears in
`docs/steve-call-decision-pack-20261024.md` (grep: no hits). The question
is about RETURNS MEASURES counting. This arm changes no measure, no
range, no gate, no profile, and no depart logic — fiction only — so
there is no ruling conflict in either direction. (Same check #2499 made.)

## The line — exact site, exact text (pinned by reading the code)

**Site:** `writeCommit` in `src/js/villager-brain.js` — the same site as
#2499, immediately after the companion block. Why here and not at
depart time: the depart is NOT a reliable site — when the HOLDER is
range-0 the live depart returns `'hold'` before the companion's
`startExpedition` is ever called (selblock-a: `vidBlock: "range-0"`),
and the holder's agency tick sometimes never reaches
`vbrainExecuteDepart` at all (the #2499 instance: Giulia has no depart
row on day 78). The dawn COMMIT is the point where the game knows the
pick cannot walk: the pick won the lottery, the holder's range is a
static fact (`npcMaxDist`), and the depart would refuse it silently.
The legacy depart (`winPlanDepart`) is unreachable while
`vbrainOwnsDawn()` is true.

**Guard (exact):** the committed pick has `winPlanAction ===
'party_launch'` AND a `companion` AND `self.npcMaxDist(vid) < 1` (the
same `< 1` bound the depart's holder block uses). A companion is
required: the line names the picked party, and a companionless
`party_launch` pick names no party to walk out with — out of scope.
The second companion (`companion2`, VETREENGAGE-only) is NOT voiced,
same as #2499.

**Text (one line, deterministic):**
`<HolderFirst> meant to walk out with <CompFirst> — but <HolderFirst> never leaves Haven, so <HolderFirst> stays home.`
First names via `firstNameOf(displayName(...))` (the #2499 pattern).
No pronoun (no gender assumption). The opening differs from the
companion line's ("asked … to walk out") on purpose: when BOTH holder
and companion are range-0, both lines fire, and two lines that start
identically would read as a stutter — these read as two facts. The
line asserts only the holder's part (the holder may still be asked
along by someone else later; the companion's own range is the
companion line's business). Live-instance shape (selblock-a instance):
`Giulia meant to walk out with Jesse — but Giulia never leaves Haven, so Giulia stays home.`

**Dedup (once per (holder, companion) pair, never spammed daily):** a
separate `holderSaid` map on the brain store (`v.vbrain`, via
`ensure(self)` — saved with the village, so once-ever survives
reloads), keyed `holderId + '>' + companionId`. **Justification for
pair-keying, following the #2499 pattern:** (1) the line names a
specific dawn bid — holder H meant to walk out with companion C — and
a different companion is a different bid the village has not yet
answered; (2) the same key shape, site, and once-ever semantics as
#2499, so both lines are reasoned about together and the proof test
groups pairs identically for both; (3) holder-alone keying was
considered and REJECTED: it would silence a second, genuinely new
promise ("Giulia meant to walk out with Sam" after "Giulia meant to
walk out with Jesse"), and the line's subject is the bid, not the
holder's biography — a homebody holder who keeps bidding with new
companions keeps making new promises, and the village answers each
once. **When both holder and companion are range-0, both lines fire**
(two true facts, each once per pair); order in the narration log is
the companion line first, then the holder line (the #2499 block sits
first in `writeCommit`).

**Not changed (named so a reviewer can verify the diff is only the
line):** no range, gate, profile, or depart-logic change;
`findCompanion` twins untouched by the shipped change (the measurement
lever below is reverted); `companionLaunchable` untouched;
`startExpedition` untouched; `winPlanDepart` untouched; the #2499
companion line untouched (its text, guard, and dedup map are not
edited — the holder block is added after it). `Game.say` consumes no
RNG and writes only the 40-line narration log; the dedup map is read
by nothing but this check, so the line cannot move a trajectory
(verified by B4, not assumed).

## Scope honesty (recorded in the prereg, not discovered later)

Holder-profile gates (`expeditionCand` in `villager-brain.js` and
`winPlanHavenTick` in `win-plan.js` both return early for
non-wanderer/explorer holders) mean a range-0 holder's `party_launch`
pick is a gate-widened-band state, like the companion pick: the line
is voiced for the state and proven on the gate-widened band, and it
will fire whenever any future pool-widening lands. The shipped line is
unconditional (no env flag): in the browser, `process` is undefined
and the line fires exactly when the state occurs. The measurement
lever (PROFILEGATE=1) is what makes the state occur in sims. Whether
the state occurs on pure master is NOT measured by this arm.

## Band freshness (verified 2026-11-17, before this prereg)

Intentional same-band reuse of the profilegate / homebodyvoice band
(103411–103418) so the live re-run is directly comparable with
homebodyvoice-a's ON leg (same villages, same dawns, one fiction line
added). This is NOT a fresh measurement band, and the reuse is by
design, recorded here. Search scope: `grep -rn "103411"
evidence/*/sim-*-prereg.md` in this tree. Result: the band is named by
`sim-launchfunnel-a-prereg.md`, `sim-part2night-a-prereg.md` (sibling
arm, shared by design), `sim-part2target-a-prereg.md` (names it as a
reference band; its own bands are 103421–103428 / 103431–103438),
`sim-poolshape-a-prereg.md`, `sim-profilegate-b-prereg.md`,
`sim-fightallycap-confirm-b-prereg.md` (lists it among taken/avoided
bands — a reference, not a use), `sim-homebodyvoice-a-prereg.md`, and
`sim-selblock-a-prereg.md` (same-band re-measurement by design). **No
other prereg names a conflicting use. Reuse is by design, recorded
here.**

## Instrument (copy + adapt the homebodyvoice instrument, do not rebuild)

- **Driver:** `scripts/holdervoice-driver-20261117.js` — a copy of
  `scripts/homebodyvoice-driver-20261117.js` with these deltas, all
  recorded here: (a) names `holdervoice-b` /
  `perseed-holdervoice-b-on` / `holdervoice-b-s<seed>-...-on.json`;
  (b) the say-wrap captures lines matching the holder marker
  `/stays home\./` into `holderLines` (the holder line's distinctive
  ending — no other `Game.say` line ends "stays home."; the two
  "stays home" hits in `src/js/` are comments in betrayal.js/comms.js,
  not say lines) AND keeps the `homebodyLines` capture matching
  `/never leaves Haven/` (both voice lines match it — used to verify
  the companion line still fires alongside and to count total voice
  lines); (c) the score wrap's `blockedPicks` row adds `holderMaxD`
  (`Game.npcMaxDist(vid)`) alongside the companion's `maxD`, so every
  holder-line firing can be matched to the exact blocked pick that
  caused it; (d) legs: ONE leg only (`on`: VETREENGAGE=1,
  PROFILEGATE=1, recorder ON) — there is no OFF leg to judge, because
  the holder line cannot fire with the gate shut on this band; the OFF
  comparison is profilegate-b's own OFF leg. Everything else — setup,
  the 150d death-aware run, the depart/v4 recorders — is the
  homebodyvoice instrument verbatim.
- **Analyzer:** none built; the judged checks are exact-match counts
  over the driver output (scripted in the proof test's live leg, see
  below), not a panel. No balanced panel is built: the change is
  fiction-only, and §15 panels compare game outcomes — the line moves
  none (B4 checks that). The same-base no-line control IS the
  before/after instrument for a fiction-only change (the 2315Z lesson:
  prefer same-base controls over frozen letter-checks against exact
  instances — base drift breaks them).
- **Proof test:** `scripts/test-holdervoice-b.js` — (a) static checks:
  the holder line site is present in `writeCommit` (guard + `holderSaid`
  dedup + `stays home` text), the #2499 companion line is UNCHANGED
  (guard + `homebodySaid` + `stays behind` text still present), the
  profile check in BOTH `findCompanion` twins is UNGUARDED (the
  measurement lever reverted), no `PROFILEGATE` reference remains in
  `src/`; (b) staged fixture (pattern copied from
  `test-homebodyvoice-a.js`'s live gate fixture): a range-0 holder +
  walkable companion scored as party_launch → the holder line fires
  exactly once, naming holder + companion + the reason; a second
  identical score (same pair) fires nothing; the same holder + a
  DIFFERENT companion fires once; a WALKABLE holder + a companion
  fires nothing; a BOTH-range-0 pair (range-0 holder + homebody
  companion) fires BOTH lines exactly once each, companion line first;
  (c) live leg: run the driver on seed 103414 (frozen band seed) and
  assert B1/B2 on its output (see Bars); (d) control leg (§5): the
  same-base no-line legs (line block temporarily removed,
  byte-restored after; sha256-verified) prove B4.
- **Measurement lever (worktree only, reverted before commit):** skip
  the `if (prof !== 'wanderer' && prof !== 'explorer') continue;`
  check in the two `findCompanion` twins when `PROFILEGATE=1`, via a
  `profilegateOn()` helper in each file mirroring the existing
  `vetreengageOn()` / `planfixOn()` pattern in win-plan.js:
  `((typeof process !== 'undefined' && process.env &&
  process.env.PROFILEGATE) === '1')`. Exactly as sim-profilegate-b /
  sim-homebodyvoice-a did it. Default OFF; off in the browser too.

## Primary metric (frozen)

**Every holder-range-0 blocked pick on the frozen band is voiced
exactly once, on its first day, and no walkable-holder pick is ever
voiced** — the line present on the holder-blocked state AND absent for
walkable picks on the same band; staged fixture green. No frozen
single-instance letter check: the 2315Z lesson is that a single
seed-day-holder-companion instance does not survive a base move, so
the bar is on the STATE, with a named live instance only as an
illustration (see Sense-testing).

## GO bars (frozen — a miss is NO-GO, never re-scored)

1. **B1 state fires, exactly once, first day.** Across the full frozen
   band (8 seeds, PROFILEGATE=1 + VETREENGAGE=1, 150d): every
   `blockedPicks` row with `holderMaxD < 1` belongs to a
   (holder, companion) pair voiced exactly once, on the pair's
   first-occurrence day, naming that holder + that companion + the
   reason; the holder-line count equals the holder-blocked pair count
   on every seed.
2. **B2 no walkable fire, no spam, no orphans.** Zero holder lines for
   any pick whose holder has `holderMaxD >= 1`; at most ONE holder
   line per (holder, companion) pair across the whole 150d run; every
   recorded holder line maps to a `blockedPicks` row (same day, same
   holder + companion, `holderMaxD < 1`) — matched by the
   role-sensitive prefix (`"<H> meant to walk out with <C>"`), never
   by bare substrings (the homebodyvoice-a B2 lesson).
3. **B3 staged fixture green.** `scripts/test-holdervoice-b.js`
   green: fire-once with holder + companion + reason named, exact
   frozen wording; no second fire for the same pair; fire for the same
   holder + a different companion; no-fire for a walkable holder;
   both-range-0 pair fires BOTH lines once each, companion line
   first; static checks green (holder line site present, companion
   line unchanged, lever reverted in both twins, no PROFILEGATE in
   `src/`).
4. **B4 trajectory neutrality (same-base control ONLY).** The line
   moves no game outcome: the live legs vs the same-base no-line
   legs (same driver, same flags, same base, holder-line block
   temporarily removed, byte-restored after) are byte-identical on
   all 24 structural fields
   (gameDays, days, endReason, standing, scaleRank, maxWave,
   unlockedWave, won, villageLost, deaths, winPlanStats,
   dawnbidScores, dawnbidDeparts, dawnbidCensus, dawnbidStarts,
   companionPool, vetSays, v4seeds, v4departs, v4gates, v4encounters,
   launchdefSkips, daily, samples) on all 8 seeds, and the sayCount
   difference equals the holder-line firings exactly on every seed.
   No cross-base letter check is pre-registered: the homebodyvoice-a
   B4-letter failure proved the first-divergence-day rule causally
   naive (drift first manifests on the day its changed code first
   matters, weeks after the base moved). A cross-base comparison
   against homebodyvoice-a's ON corpus may be run as INFORMATION
   only and reported as such, never as a bar.
5. **B5 instrument valid.** Proof test green (B3); driver runs with 0
   instrument errors on all 8 seeds; `check.js --quick` attempted
   after the `src/` change and its result reported honestly (a killed
   incomplete run is recorded as incomplete, never as green).

Verdict is GO iff B1 + B2 + B3 + B4 + B5 all pass.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote live holder lines verbatim from the re-run
corpus and at least one surrounding dawn scene. Judge whether the line
reads as a person being told something true (names, reason,
consequence) or as a system label — whether "meant to walk out with"
reads as a real intention the morning then breaks — and whether the
once-per-pair silence after the first telling reads as the village
having learned it, or as the game forgetting. Where both lines fire
for one pair, judge whether the two together read as two facts or as
a stutter. The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. The `blockedPicks` row is read AFTER the real `vbrainScorePick`
   returns (same hook shape as the homebodyvoice pool replica) — a
   same-tick re-score between the commit write and the row read would
   attribute the row to the later commit; any line firing with no
   matching blocked pick row is investigated by hand and named (B2
   fails if one is found and unexplained).
2. The line fires at COMMIT time, which can be a mid-day re-score
   (part 1–3), not only dawn part 0 — the "dawn-bid" wording covers
   the bid's commitment, whenever the scorer writes it. The day
   recorded is the commit's day.
3. Eight seeds is a pilot. The line's firing is deterministic given the
   state, so a confirm band adds nothing about the line itself — only
   about how often the state occurs, which is the gate's question, not
   this arm's.
4. Loop B is live on the winnability chain (trees sim-fleerepair2-b,
   sim-seekgate-b) — do NOT touch its trees or axis. Loop B's
   `sim-fightallycap-confirm-b` touched `win-plan.js` +
   `villager-brain.js` in a sibling tree; its branch is NOT in master
   (verified at arm start: base `3d0f5770c` carries no Loop B change).
   If a rebase conflicts on a file Loop B touched, stop and FAIL
   LOUDLY to the coordinator with the file names. Do NOT touch Loop
   B's tree, claim, or axis. Do NOT touch Loop B's live territory
   (fight-ally-cap, flee-repair #2500, recorder holes #2497/#2501/
   #2502, partysize B2).
5. The `seq` counter leaks across seeds in one CLI process (homebodyvoice-a
   metric review): `rowSeq` is module-level in the driver, so
   multi-seed runs in one process carry the counter forward;
   cross-run `dawnbidDeparts` comparisons that include `seq` will
   false-diff. The B4-control legs must use identical invocation
   patterns (same seed order, same process grouping) on both sides,
   as homebodyvoice-a did.

## Files

- Prereg: `evidence/2026-11-17/sim-holdervoice-b-prereg.md` (this file)
- Line: `src/js/villager-brain.js` (`writeCommit` only), `[needs-eyes]` on the commit
- Instrument: `scripts/holdervoice-driver-20261117.js`,
  `scripts/test-holdervoice-b.js`
- Corpus: `evidence/2026-11-17/perseed-holdervoice-b-on/` (8 files),
  `perseed-holdervoice-b-noline/` (8 files, same-base no-line control)
- Evidence: `evidence/2026-11-17/sim-holdervoice-b.md`
- Disposition if NO-GO: revert the `src/` change in this tree before
  reporting (leave the instrument + evidence).
