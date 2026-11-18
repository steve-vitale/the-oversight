# sim-homebodyvoice-a — PREREG (frozen before any judged sim)

**Arm:** sim-homebodyvoice-a · **Loop A run:** fleshout-20261117T2315Z · **Axis:** scale-onramp
**Type:** BUILD, fiction only, no mechanics change. One voice line, one site.
**Branch:** `sim-homebodyvoice-a` · **Worktree:** `~/workspace/worktrees/sim-homebodyvoice-a`
**Base at arm start:** master `77a37fe91` (sim-packhunt-rec-b evidence tip).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
(same bytes as profilegate-b; verified before the judged legs).
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.
**Prereg:** `evidence/2026-11-17/sim-homebodyvoice-a-prereg.md` (this file, frozen).

## The question (finding #2499)

A picked homebody who cannot launch gets no fiction line. Live instance
(profilegate-b, seed 103414, day 78): holder Giulia Bianchi bids at dawn
with homebody Jesse Cortez — the dawn commit WINS (`pick.kind`
EXPEDITION, `winPlanAction` party_launch, override
`win_plan:party_launch`, core pick VISIT) — and zero `vetSays` lines on
days 77–79 mark the pick, the stay, or the reason. The dawn bid reads as
a promise the morning breaks silently.

**Correction to the profilegate-b telling, from the instrument rows
(not a re-score — the corpus is the same):** the profilegate evidence
says "the only depart is a different villager, visjoin_74, taking Giulia
herself as companion." The depart row for day 78 says visjoin_74 launched
with companion giulia_bianchi but `companionExped: false`,
`companionBlock: "range-0"`, `party: []` — Giulia never left with him.
Giulia has NO depart row on day 78 at all (her agency tick never
reached `vbrainExecuteDepart` that day), and her own depart rows on
other days read `result: "hold"`, `vidBlock: "range-0"` — Giulia is
HERSELF a homebody (`holderProfile: "homebody"` in the day-78 pool row).
So on day 78 nobody left with anybody: the holder was range-0 blocked
and the picked companion was range-0 blocked, and the game said nothing
about either. This arm voices the COMPANION half only (the picked
homebody); the holder-half is a separate silence, noted in the evidence.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-17/sim-profilegate-b.md` (§Sense-testing) + prereg —
  the instance, the lever, and the exact sites. The profilegate lever
  (skip the `prof !== 'wanderer' && prof !== 'explorer'` check in the
  two `findCompanion` twins, env-gated `PROFILEGATE=1`) is REVERTED on
  master; this arm re-applies it IN THIS WORKTREE ONLY for measurement
  and reverts it before commit (see The lever).
- `evidence/2026-11-17/sim-scale-onramp-round-2025.md` — standing
  posture: scale-onramp converging, NOT converged; wall numbers
  national 1/8, table 0, wins 0, wave 5 unlocked 1/8 on this band.
- `evidence/2026-10-29/sim-homebody-a.md` — the #1409 sizing: homebody
  range blocks 2/19 funnel triples, 0/59 maxD-0 picks ever offered.

## Canon read

- `docs/CANON.md` (read first) — the grounding rule is **"No silent
  actions. Every action narrates honestly, including failures."** A dawn
  bid that cannot walk is a failed action the game currently narrates
  not at all. The line is that narration.
- `docs/CONVERSATIONS.md` — covers conversation voice (`sayLine`,
  spoken beats, voice boundary). It does NOT cover dawn-bid narration;
  not the channel used here.
- `docs/VILLAGER-BRAIN.md`, `docs/PARTY.md` — no voice line for a
  blocked pick; no homebody-voice rule.
- **Canon gap, recorded not invented:** no canon doc covers expedition
  companion eligibility voice, or what the game says when a picked
  companion cannot walk. The line below is grounded in the CANON.md
  no-silent-actions rule and the existing `Game.say` narration channel
  (`say()` = `emit(text, 'narration')`, `src/js/game.js`), not in an
  invented voice system. One line, no variants: the existing voice
  system varies some announce lines via arrays, but this line is
  deterministic by design (exact-match proof), and the brief forbids
  inventing a new variation system.

## Steve-call #1409 — checked, no conflict

#1409 as listed (`docs/AGENT-LANES.md`, Codex executive decisions
2026-10-29 item 7): "Homebodies as blocked returns — do villagers who
stay home count as blocked returns for the returns measures?" It is
still OPEN: no ruling appears in
`docs/steve-call-decision-pack-20261024.md` (grep: no hits). The question
is about RETURNS MEASURES counting. This arm changes no measure, no
range, no gate, no profile, and no depart logic — fiction only — so
there is no ruling conflict in either direction. (Code fact, unchanged:
`expeditionCand` in `villager-brain.js` already excludes non-rangers, so
a homebody is never offered a HUNT through that path; the dawn-bid
companion pick is the only route by which a homebody is picked, and it
exists only when the profile gate is widened.)

## The line — exact site, exact text (pinned by reading the code)

**Site:** `writeCommit` in `src/js/villager-brain.js` — the single choke
point where a dawn pick becomes the day's commitment (called by
`vbrainScorePick` for every pick and by `vbrainLogGate` for gates, which
carry no companion and are excluded by the guard). Why here and not at
depart time: the depart is NOT a reliable site for the instance —
Giulia has no depart row on day 78 (her tick never reached
`vbrainExecuteDepart`), and when the HOLDER is range-0 the live depart
returns `'hold'` before the companion's `startExpedition` is ever
called. The dawn COMMIT is the point where the game knows the pick
cannot walk: the pick won the lottery, the companion's range is a static
fact (`npcMaxDist`), and `startExpedition` would refuse it
(`villager-agency.js`: `if (maxD < 1) return;`, silent). The legacy
depart (`win-plan.js` `winPlanDepart`) is not a site either — it is
unreachable while `vbrainOwnsDawn()` is true, and its
`companionLaunchable` check is a depart-time gate, not a bid-time voice.

**Guard (exact):** the committed pick has `winPlanAction ===
'party_launch'` AND a `companion` AND `self.npcMaxDist(companion) < 1`
(the same `< 1` bound `startExpedition` and `companionLaunchable` use).
No other block is voiced (sick / hurt / unarmed companions are separate
silences, out of scope).

**Text (one line, deterministic):**
`<HolderFirst> asked <CompFirst> to walk out with the party — but <CompFirst> never leaves Haven, so <CompFirst> stays behind.`
First names via `self.displayName(vid).split(' ')[0]` (the established
pattern, e.g. `villager-agency.js` heal-check naming), try/catch with
the raw id as fallback. No pronoun (no gender assumption), no claim
about the holder (the holder may still walk out alone, or stay home
themselves — the line asserts only the companion's part). Live instance
reads: `Giulia asked Jesse to walk out with the party — but Jesse never
leaves Haven, so Jesse stays behind.`

**Dedup (once per blocked pick, never spammed daily):** a `homebodySaid`
map on the brain store (`v.vbrain`, via `ensure(self)` — saved with the
village, so once-ever survives reloads), keyed
`holderId + '>' + companionId`. The same pair re-picks often (Giulia +
Jesse win the commit on days 78, 85, 94, 101, 103, 105, 108, 109, 110+
on seed 103414 alone) — without the map the line would fire ~9 times
for one pair on one seed. Different holder, same companion = a different
pair = its own one line (a different promise). `Game.say` consumes no
RNG and writes only the 40-line narration log; the dedup map is read by
nothing but this check, so the line cannot move a trajectory (verified
by B4, not assumed).

**Not changed (named so a reviewer can verify the diff is only the
line):** no range, gate, profile, or depart-logic change;
`findCompanion` twins untouched by the shipped change (the measurement
lever below is reverted); `companionLaunchable` untouched;
`startExpedition` untouched; `winPlanDepart` untouched; the second
companion (`companion2`, VETREENGAGE-only) is NOT voiced — the finding
is about the dawn-bid pick, and the second companion is picked and
launched on a different path. `sayGated` (game.js) was considered and
NOT used: it throttles per-day per class, which would still spam across
days; the pair-keyed ever-dedup is the required shape.

## Scope honesty (recorded in the prereg, not discovered later)

On pure master the companion pool admits only rangers, so a homebody
pick ~never fires on master — this line is voiced for the state and
proven on the gate-widened band; it will fire whenever any future
pool-widening lands. The shipped line is unconditional (no env flag):
in the browser, `process` is undefined and the line fires exactly when
the state occurs, which on master is ~never. The measurement lever
(PROFILEGATE=1) is what makes the state occur in sims.

## Band freshness (verified 2026-11-17, before this prereg)

Intentional same-band reuse of the profilegate/poolshape/launchfunnel
band (103411–103418) so the live re-run is directly comparable with
profilegate-b's ON leg (same villages, same dawns, one fiction line
added). This is NOT a fresh measurement band, and the reuse is by
design, recorded here. Search scope: `grep -rn "103411"
evidence/*/sim-*-prereg.md` in this tree. Result: the band is named by
`sim-launchfunnel-a-prereg.md`, `sim-part2night-a-prereg.md` (sibling
arm, shared by design), `sim-part2target-a-prereg.md` (names it as a
reference band; its own bands are 103421–103428 / 103431–103438),
`sim-poolshape-a-prereg.md`, `sim-profilegate-b-prereg.md`,
`sim-fightallycap-confirm-b-prereg.md` (lists it among taken/avoided
bands — a reference, not a use), and this run's Loop A claim
(`fleshout-20261117T2315Z`, coordinator-owned; no live Loop A claim
file was visible in `hidden_files/lever-claims/` at prereg time — only
Loop B claims). **No other prereg names a conflicting use. Reuse is by
design, recorded here.**

## Instrument (copy + adapt the profilegate instrument, do not rebuild)

- **Driver:** `scripts/homebodyvoice-driver-20261117.js` — a copy of
  `scripts/profilegate-driver-20261117.js` with these deltas, all
  recorded here: (a) names `homebodyvoice-a` /
  `perseed-homebodyvoice-a-on` / `homebodyvoice-a-s<seed>-...-on.json`;
  (b) the say-wrap captures lines matching the marker
  `/never leaves Haven/` (the line's distinctive text) with day — the
  profilegate `SAY_RE` veteran filter would NOT capture this line, so
  the marker capture replaces it for the judged stream (sayCount still
  counted); (c) the dawn-score wrap records a `blockedPicks` row per
  commit: `{day, part, vid, companion, maxD}` read from
  `Game.vbrainCommit(vid)` + `Game.npcMaxDist(companion)` after the real
  score call returns — so every line firing can be matched to the exact
  blocked pick that caused it; (d) legs: ONE leg only (`on`:
  VETREENGAGE=1, PROFILEGATE=1, recorder ON) — there is no OFF leg to
  judge, because the line cannot fire with the gate shut; the OFF
  comparison is profilegate-b's own OFF leg (0 homebody picks by
  construction). Everything else — setupGame, the 150d death-aware run,
  the depart/v4 recorders — is the profilegate instrument verbatim.
- **Analyzer:** none built; the judged checks are exact-match counts
  over the driver output (scripted in the proof test's live leg, see
  below), not a panel. No balanced panel is built: the change is
  fiction-only, and §15 panels compare game outcomes — the line moves
  none (B4 checks that).
- **Proof test:** `scripts/test-homebodyvoice-a.js` — (a) static checks:
  the line site is present in `writeCommit` (guard + `homebodySaid`
  dedup + `never leaves Haven` text), the profile check in BOTH
  `findCompanion` twins is UNGUARDED (the measurement lever reverted),
  no `PROFILEGATE` reference remains in `src/`; (b) staged fixture
  (pattern copied from `test-profilegate-b.js`'s live gate fixture):
  a holder with a wave-4+ plan at Haven + a homebody companion at
  Haven with trust ≥ 15 → `vbrainScorePick` commits party_launch with
  the homebody → the line fires exactly once, naming holder first
  name + companion first name + the reason; a second identical score
  (same pair) fires nothing; a different holder + the same companion
  fires once; a holder + a WALKABLE companion (wanderer, maxD ≥ 1) →
  no line; (c) live leg: run the driver on seed 103414 (frozen band
  seed) and assert B1/B2 on its output (see Bars).
- **Measurement lever (worktree only, reverted before commit):** skip
  the `if (prof !== 'wanderer' && prof !== 'explorer') continue;`
  check in the two `findCompanion` twins when `PROFILEGATE=1`, via a
  `profilegateOn()` helper in each file mirroring the existing
  `vetreengageOn()` / `planfixOn()` pattern in win-plan.js:
  `((typeof process !== 'undefined' && process.env &&
  process.env.PROFILEGATE) === '1')`. Exactly as sim-profilegate-b did
  (its evidence §The lever). Default OFF; off in the browser too.

## Primary metric (frozen)

**The line fires on the d78 Jesse instance on a live re-run, and fires
for no pick that can walk, on the frozen band** — the line present on
the Jesse instance AND absent for walkable picks on the same band;
staged fixture green.

## GO bars (frozen — a miss is NO-GO, never re-scored)

1. **B1 instance fires.** On the live re-run (PROFILEGATE=1 +
   VETREENGAGE=1, seed 103414, 150d), a `never leaves Haven` line is
   recorded on day 78 naming Giulia + Jesse. (Drift contingency,
   pre-registered: if the day-78 commit does not reproduce on this
   tree's base — the profilegate-b rebase note shows base drift can
   move a seed's trajectory — the bar is assessed on the nearest
   equivalent blocked pick on the same seed (same holder + companion,
   first re-occurrence), and the drift is named with the first
   divergence day. The bar is NOT re-scored to a friendlier seed.)
2. **B2 no walkable fire, no spam.** Across the full frozen band
   (8 seeds, same legs): every recorded line maps to a `blockedPicks`
   row (same day, same holder + companion, `maxD < 1`); zero lines for
   any pick whose companion has `maxD ≥ 1`; at most ONE line per
   (holder, companion) pair across the whole 150d run.
3. **B3 staged fixture green.** `scripts/test-homebodyvoice-a.js`
   green: fire-once with holder + companion + reason named; no second
   fire for the same pair; fire for a second holder + same companion;
   no-fire for a walkable companion; static checks green (line site
   present, lever reverted in both twins, no PROFILEGATE in `src/`).
4. **B4 trajectory neutrality.** The line moves no game outcome: the
   live legs' structural fields (per-seed gameDays, deaths, standing,
   maxWave, dawnbidScores picks, depart rows) match profilegate-b's ON
   corpus row-for-row on the same band and flags, except the say
   stream. Pre-registered divergence rule: if any structural field
   differs, the first divergence day is compared against the first
   line-firing day on that seed — a divergence BEFORE the first firing
   is base drift (named, not charged to the line); a divergence ON OR
   AFTER the first firing is charged to the line and fails B4.
5. **B5 instrument valid.** Proof test green (B3); driver runs with 0
   instrument errors on all 8 seeds; `check.js --quick` attempted after
   the `src/` change and its result reported honestly (profilegate-b:
   the box could not finish it in ~20 min; a killed incomplete run is
   recorded as incomplete, never as green).

Verdict is GO iff B1 + B2 + B3 + B4 + B5 all pass.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote the live line verbatim from the re-run corpus
and at least one surrounding dawn scene. Judge whether the line reads
as a person being told something true (names, reason, consequence) or
as a system label — and whether the once-per-pair silence after the
first telling reads as the village having learned it, or as the game
forgetting. The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. The `blockedPicks` row is read AFTER the real `vbrainScorePick`
   returns (same hook shape as the profilegate pool replica) — a
   same-tick re-score between the commit write and the row read would
   attribute the row to the later commit; any line firing with no
   matching blocked pick row is investigated by hand and named (B2
   fails if one is found and unexplained).
2. The line fires at COMMIT time, which can be a mid-day re-score
   (part 1–3), not only dawn part 0 — the "dawn-bid" wording covers the
   bid's commitment, whenever the scorer writes it. The day recorded is
   the commit's day.
3. Eight seeds is a pilot. The line's firing is deterministic given the
   state, so a confirm band adds nothing about the line itself — only
   about how often the state occurs, which is the gate's question, not
   this arm's.
4. Loop B's `sim-fightallycap-confirm-b` is live in a sibling tree
   touching `win-plan.js` + `villager-brain.js` — the same files as this
   arm's measurement lever (not the shipped line: the line touches only
   `villager-brain.js`). Its branch is NOT in master (verified at arm
   start: base `77a37fe91` carries no Loop B change). If a rebase
   conflicts on a file Loop B touched, stop and FAIL LOUDLY to the
   coordinator with the file names. Do not touch Loop B's tree, claim,
   or axis. Do NOT touch Loop B's live territory (fight-ally-cap,
   flee-repair #2500, recorder holes #2497/#2501/#2502, partysize B2).

## Files

- Prereg: `evidence/2026-11-17/sim-homebodyvoice-a-prereg.md` (this file)
- Line: `src/js/villager-brain.js` (`writeCommit` only), `[needs-eyes]` on the commit
- Instrument: `scripts/homebodyvoice-driver-20261117.js`,
  `scripts/test-homebodyvoice-a.js`
- Corpus: `evidence/2026-11-17/perseed-homebodyvoice-a-on/` (8 files)
- Evidence: `evidence/2026-11-17/sim-homebodyvoice-a.md`
- Disposition if NO-GO: revert the `src/` change in this tree before
  reporting (leave the instrument + evidence).
