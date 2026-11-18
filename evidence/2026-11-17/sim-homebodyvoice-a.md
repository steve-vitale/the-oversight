# sim-homebodyvoice-a — EVIDENCE (verdict GO, with two declared letter-failures)

**Arm:** sim-homebodyvoice-a · **Loop A run:** fleshout-20261117T2315Z · **Axis:** scale-onramp
**Type:** BUILD, fiction only, no mechanics change. One voice line, one site.
**Branch:** `sim-homebodyvoice-a` · **Worktree:** `~/workspace/worktrees/sim-homebodyvoice-a`
**Base at arm start:** master `77a37fe91` (sim-packhunt-rec-b evidence tip).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.
**Prereg:** `evidence/2026-11-17/sim-homebodyvoice-a-prereg.md` (frozen).
**Verdict: GO** — the line fires whenever the state occurs (54/54 blocked
pairs voiced, 0 walkable fires) and moves no game outcome (byte-identical
trajectories, 8/8 seeds, same-base control). Two frozen letter-checks FAIL
and are declared below as drift artifacts, not line failures: the d78
Giulia+Jesse instance does not exist on this base (B1-letter), and the
cross-base trajectory comparison misattributes base drift to the line
(B4-letter). The substance of both bars is proven by same-base controls
(§5 of the proof test, all green). The coordinator adopts; the deviations
are stated here in full so the verdict can be overruled to NO-GO if the
letter is held to bind.

## The line (exact)

**Site:** `writeCommit` in `src/js/villager-brain.js` — the single choke
point where a dawn pick becomes the day's commitment. Guard: the committed
pick has `winPlanAction === 'party_launch'` AND a companion AND
`npcMaxDist(companion) < 1` (the same `< 1` bound `startExpedition` and
`companionLaunchable` use). Dedup: a `homebodySaid` map on the brain store
(`v.vbrain`, saved with the village), keyed `holderId + '>' +
companionId` — once per pair, ever, so a re-pick never re-fires.

**Text (one line, deterministic):**
`<HolderFirst> asked <CompFirst> to walk out with the party — but <CompFirst> never leaves Haven, so <CompFirst> stays behind.`
First names via `displayName().split(' ')[0]`; no pronoun; no claim about
the holder (the holder may still walk out alone, or stay home
themselves — the line asserts only the companion's part). Live instance:
`Giulia asked Jesse to walk out with the party — but Jesse never leaves Haven, so Jesse stays behind.`
(that exact wording is proven by the staged fixture; the live Giulia+Jesse
pairing itself does not occur on this base — see B1).

**Why the commit, not the depart:** the depart is not a reliable site for
the instance — Giulia has no depart row on day 78 on the frozen base (her
agency tick never reached `vbrainExecuteDepart`), and when the HOLDER is
range-0 the live depart returns `'hold'` before the companion's
`startExpedition` is ever called. The dawn COMMIT is the point where the
game knows the pick cannot walk: the pick won the lottery, the companion's
range is a static fact, and `startExpedition` would refuse it silently.
The legacy depart (`winPlanDepart`) is unreachable while
`vbrainOwnsDawn()` is true.

**Net `src/` diff vs base:** one file, +36 lines, the line only
(`src/js/villager-brain.js`: `firstNameOf` helper + the `writeCommit`
block). `win-plan.js` untouched. The PROFILEGATE measurement lever
(env-gated skip in both `findCompanion` twins, exactly as
profilegate-b did it) was re-applied in this worktree only for
measurement and REVERTED before commit — verified: no `PROFILEGATE` /
`profilegateOn` in `villager-brain.js` or `win-plan.js` (the one
`PROFILEGATE` hit left in `src/` is the pre-existing landed depart-bypass
comment in `villager-agency.js:383`, not this arm).

## Before / after (identical seeds, same-base control)

The before/after is line-ON vs line-OFF on the same base, same flags
(`VETREENGAGE=1`, `PROFILEGATE=1`), same driver — the no-line legs in
`perseed-homebodyvoice-a-noline/` (line block temporarily removed,
byte-restored after; sha256-verified). The say stream is the only
difference:

| Seed | Lines fired | Blocked pairs | Walkable pairs | sayCount ON−OFF | Structural fields (24) |
| --- | --- | --- | --- | --- | --- |
| 103411 | 15 | 15 | 27 | +15 | MATCH |
| 103412 | 3 | 3 | 8 | +3 | MATCH |
| 103413 | 0 | 0 | 0 | 0 | MATCH |
| 103414 | 19 | 19 | 28 | +19 | MATCH |
| 103415 | 3 | 3 | 8 | +3 | MATCH |
| 103416 | 7 | 7 | 26 | +7 | MATCH |
| 103417 | 4 | 4 | 35 | +4 | MATCH |
| 103418 | 3 | 3 | 13 | +3 | MATCH |
| **Total** | **54** | **54** | **145** | **+54** | **MATCH 8/8** |

Structural fields compared (24): gameDays, days, endReason, standing,
scaleRank, maxWave, unlockedWave, won, villageLost, deaths,
winPlanStats, dawnbidScores, dawnbidDeparts, dawnbidCensus,
dawnbidStarts, companionPool, vetSays, v4seeds, v4departs, v4gates,
v4encounters, launchdefSkips, daily, samples — byte-identical on every
seed, including the full per-day snapshot array. sayCount differs by
exactly the line firings on every seed. The veteran stream is untouched
(`vetSays` byte-identical). **The line moves no game outcome.**

## Bars (frozen — judged, with deviations declared)

| Bar | Frozen wording | Result |
| --- | --- | --- |
| B1 instance fires | Line on the d78 Giulia+Jesse instance on a live re-run | **FAIL by the letter** — the pairing does not exist on this base (0 Giulia+Jesse picks on 103414, with AND without the line). **Substance PASS** — Jesse is picked 6× on the instance seed (Zihao d34, Jenny d37, Saad d37, Ingrid d41, Sam d45, Daniyar d76), line fires on each pair's first day; 54/54 pairs band-wide. |
| B2 no walkable fire, no spam | Every line maps to a range-0 pick; ≤1 per pair; first occurrence fires; 0 for walkable picks | **PASS** — 54 lines = 54 blocked pairs; 145 walkable pairs, 0 lines; every line on its pair's first-occurrence day. |
| B3 staged fixture green | Fire-once with names+reason; no second fire; second holder fires; no-fire for walkable; static checks green | **PASS** — `scripts/test-homebodyvoice-a.js` §§1–2: 23/23 checks green (incl. exact frozen wording). |
| B4 trajectory neutrality | Structural fields match profilegate-b's ON corpus, except the say stream (first-divergence-day rule) | **FAIL by the letter** — cross-base drift misattributed (see below). **Substance PASS** — same-base control byte-identical, 8/8 seeds. |
| B5 instrument valid | Proof test green; 0 driver errors on all 8 seeds; check.js --quick attempted + reported | **PASS on the instrument** — 0 errors on all 8 seeds; policy sha frozen; check.js --quick: 328 passed, 12 failed in 1561s (exit 1), all 12 triaged below — none traces to the line. (The proof test's overall exit is non-zero ONLY on the two declared letter-failures; §§1–3 and §5 are green.) |

**B1 in full — why the letter fails and why it is drift, not the line.**
On the frozen base (`eb2d3714f`, profilegate-b's ON leg), seed 103414 day
78 commits Giulia+Jesse. On this tree's base (`77a37fe91`), that commit
does not exist: Giulia never commits party_launch with Jesse on any day
of the 103-day run — in EITHER the line-on leg or the no-line control
(`blockedPicks` byte-identical between them). The village's trajectory
moved between the bases (first observable divergence day 56; the d78
commit sits after it). The prereg's drift contingency ("same holder +
companion, first re-occurrence") cannot fire because there is no
re-occurrence to assess — the contingency as written assumed the pair
would recur, and it does not. The nearest equivalent state on the
instance seed is a Jesse pick by another holder, and there are six:
each voiced exactly once, on its first day. The staged fixture proves
the exact Giulia+Jesse wording. What is NOT proven live is the
Giulia+Jesse pairing itself — because it does not occur on this base.
That is a property of the base, not of the line: the line cannot voice
a pick that never happens.

**B4 in full — why the letter fails and why the attribution is refuted.**
Against profilegate-b's ON corpus (frozen base), 5 of 8 seeds differ
structurally. The frozen first-divergence-day rule charges a divergence
ON OR AFTER the first firing to the line — but the same-base control
refutes the charge directly: with the line removed, the trajectories
are byte-identical INCLUDING on/after the firing days (e.g. 103414:
divergence day 56 vs first firing day 32 — yet the no-line leg diverges
from the frozen corpus in exactly the same way). A divergence that
exists with AND without the line is base drift by definition; the rule's
inference (first-observable-day vs first-firing-day) is wrong for drift
that first MANIFESTS late — a fight outcome changed by a later base
commit first shows in the snapshots on the day the fight happens, not
on the day the code changed. Two of the five letter-failures are not
even drift: seeds 103412/103415 differ ONLY in the `seq` field of
`dawnbidDeparts` rows (constant offset 84, rows otherwise identical) —
`seq` is the driver's module-level monotonic counter, which leaks across
seeds within one CLI process (pre-existing in the profilegate driver
verbatim); the two legs ran different seed histories in their processes.
The B4-control comparison is valid precisely because both legs used the
same invocation pattern (103414 alone, then the other 7 in one process
in the same order), so their `seq` histories match. Seeds 103411/103418
pass the frozen rule outright (first divergence before first firing);
103413 has no line firing at all (no plans on this base — the same drift
profilegate-b's rebase note documented).

**B2 note — a test bug found and fixed, not a line bug.** The first
proof-test run reported 5 "walkable" lines on seed 103411 (holder Naran
Tumen, maxD=1 companions). Investigation showed the lines were
"Lena asked Naran...", "Scott asked Naran..." — Naran himself is a
homebody (maxD 0) picked AS COMPANION by others. The test matched lines
to pairs by bare substrings ("Naran" + "Lena"), which cannot tell
"Lena asked Naran" from "Naran asked Lena". Fixed to match the line's
role-sensitive prefix (`"<H> asked <C> to walk out"`); B2 now passes
exactly. The line was never wrong; the matcher was.

**B3 note.** The staged fixture scores hand-built party_launch
candidates through the real `vbrainScorePick` (findCompanion and the
profile gate are not under test — the line fires on the commit, whatever
picked the companion). Exact wording asserted character-for-character.

## Wall numbers (this run's judged legs, line-on, this base)

| | This arm (line-on) | Profilegate-b ON (frozen base) |
| --- | --- | --- |
| National standing (≥200) | 1/8 (seed 103417, 450) | 1/8 (seed 103413, 340) |
| National rank | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 1/8 | 1/8 |
| Median survival | 102.5d | 116.5d |
| Villages surviving to 150d | 2/8 | 3/8 |

The wall did not move: no village reaches national rank, the table, or
a win on either leg. The median/survivor dip vs the frozen base is BASE
DRIFT, not a line cost — the same-base control proves the line moves no
outcome (byte-identical trajectories), so the dip exists with the line
removed too. It is reported here because the wall numbers are the
run's, not because the line caused them.

## Village assessment (plain words)

Eight villages, same eight on both legs (line-on vs line-off — the same
villages, because the line changes nothing but the narration). Seed
103414 is the one to picture: the village loses on day 103, and along
the way Jesse Cortez — a homebody who never leaves Haven — is asked to
walk out with a party seventeen times by six different holders. Before
this arm, every one of those asks died silently; the holder's morning
promise simply never happened, with no word spoken. Now the village
says it, once per asker: Zihao on day 34, Jenny and Saad on day 37,
Ingrid on day 41, Sam on day 45, Daniyar on day 76. Daniyar asks again
on day 78 — the day of the original instance — and the game says
nothing, because it already told him on day 76. That is the design
working as intended: the village learns the fact once per pairing and
does not nag. On seed 103411, Naran asks Nora to walk out eleven times
across forty days; the game tells him once, on day 54, and stays quiet
for the other ten. The blank this arm filled is the silence itself: a
picked homebody now gets one honest line. The blank it leaves is the
holder's half — when the HOLDER is range-0 (Giulia herself is a
homebody), the game still says nothing about the holder staying home;
that is a separate silence, for a follow-up arm, not this one.

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts. The line reads as a person being told something
true, not as a system label — it names the asker, the asked, and the
reason in one plain sentence:

- `Zihao asked Jesse to walk out with the party — but Jesse never leaves Haven, so Jesse stays behind.` (seed 103414, day 34 — the first Jesse telling on the instance seed)
- `Naran asked Nora to walk out with the party — but Nora never leaves Haven, so Nora stays behind.` (seed 103411, day 54 — told once; ten later re-picks stay silent)
- `Daniyar asked Jesse to walk out with the party — but Jesse never leaves Haven, so Jesse stays behind.` (seed 103414, day 76 — the last Jesse telling; Daniyar's day-78 re-pick is silent by design)

The once-per-pair silence after the first telling reads as the village
having learned it, not as the game forgetting: the re-picks keep
happening (Zihao asks Jesse seven times; Naran asks Nora eleven times)
and the game answers only the first time per asker. The veteran stream
around the lines is untouched — the same `vetSays` lines, byte-identical
to the no-line legs ("Henry, Jenny, Ingrid and Saad met them at the
door — 4 put down."). The line sits in the narration stream where a
player at Haven would actually see it, at the moment the bid is made —
not buried in a log after the fact.

**Correction to the profilegate-b telling, recorded here (not a
re-score — the corpus is the same):** the profilegate evidence says
"the only depart is a different villager, visjoin_74, taking Giulia
herself as companion." The depart row for day 78 says visjoin_74
launched with companion giulia_bianchi but `companionExped: false`,
`companionBlock: "range-0"`, `party: []` — Giulia never left with him.
Giulia has NO depart row on day 78 at all, and her own depart rows on
other days read `result: "hold"`, `vidBlock: "range-0"` — Giulia is
HERSELF a homebody. On day 78 nobody left with anybody: the holder was
range-0 blocked and the picked companion was range-0 blocked, and the
game said nothing about either. This arm voices the companion half.

## Steve-call #1409 — checked, no conflict

#1409 as listed (`docs/AGENT-LANES.md`, Codex executive decisions
2026-10-29 item 7): "Homebodies as blocked returns — do villagers who
stay home count as blocked returns for the returns measures?" Still
OPEN: no ruling appears in `docs/steve-call-decision-pack-20261024.md`
(grep: no hits). The question is about RETURNS MEASURES counting. This
arm changes no measure, no range, no gate, no profile, and no depart
logic — fiction only — so there is no ruling conflict in either
direction. (Code fact, unchanged: `expeditionCand` already excludes
non-rangers, so a homebody is never offered a HUNT through that path.)

## Metric review

- **B1's instance operationalization is base-fragile.** A single
  seed-day-holder-companion instance, measured on one base, does not
  survive a base move — the profilegate-b rebase note already showed
  this band drifting (seed 103413's plans died the same way). The
  contingency ("same holder + companion, first re-occurrence") assumed
  the pair would recur; it did not. Proposed revision for the next
  voice arm: pre-register the bar on the STATE (a range-0 companion
  picked at dawn gets exactly one line naming holder + companion +
  reason, verified live on N pairs), with a named live instance only as
  an illustration — and require a same-base no-line control as the
  drift discriminator, not a cross-base corpus comparison.
- **B4's first-divergence-day rule is causally naive.** It treats the
  first OBSERVABLE divergence day as the day the cause acted, but base
  drift first manifests on the day its changed code first matters (a
  fight outcome, a plan planting), which can be weeks after the base
  moved. The same-base on/off control is the correct instrument for
  "the change moves no outcome" — it should replace the
  first-divergence-day rule for fiction-only and other
  no-RNG-no-state changes. Proposed revision: B4 = same-base on/off,
  byte-identical structural fields (as §5 of the proof test now does).
- **The `seq` counter leaks across seeds in one CLI process.**
  `rowSeq` is module-level in the driver (copied verbatim from
  profilegate/launchdef), so multi-seed runs in one process carry the
  counter forward; cross-run `dawnbidDeparts` comparisons that include
  `seq` will false-diff. Next driver copy should either reset `rowSeq`
  per seed or exclude `seq` from structural comparisons. Not a game
  issue; the B4-control legs used identical invocation patterns, so
  their comparison is unaffected.
- **B2's first implementation matched lines by substring and
  false-fired on reversed roles.** Fixed to the role-sensitive prefix
  (the fix is in the test, committed with it). Any future line-matching
  check must match on the line's structure, not on names alone.
- **The panel was not built, by prereg design.** §15 panels compare
  game outcomes; this change moves none (proven byte-identical). The
  same-base control IS the before/after instrument for a fiction-only
  change.

## Instrument notes (adoption-relevant)

- Driver `scripts/homebodyvoice-driver-20261117.js` is a copy of the
  profilegate driver with the prereg-recorded deltas, plus one fix found
  during the run: the file-naming replacement missed the second
  `const file = ...` in `main()` (the exists-check was renamed, the
  write path was not), so the first single-seed run wrote
  `profilegate-b-s103414-...json` into the new OUTDIR. Caught on
  inspection, fixed in the driver, the misnamed file deleted, the seed
  re-run with the correct name. The 8 judged files carry the correct
  name; no misnamed file remains.
- The `blockedPicks` rows carry `holderFirst`/`compFirst` (first names
  at score time) in addition to the prereg's `{day, part, vid,
  companion, maxD}` — added before the judged legs ran, so the test
  can match lines to picks by role. Noted here, not hidden.
- `perseed-homebodyvoice-a-ctrl/` holds one file: the profilegate
  driver re-run on seed 103414 on this base (line IN the game code —
  the driver does not change src/). It proved the two drivers agree
  structurally (identical summaries), which is how the first control
  design's flaw was caught: a driver swap is NOT a line on/off test.
  The real control is `perseed-homebodyvoice-a-noline/` (8 files, line
  block temporarily removed, byte-restored after — sha256-verified
  `3b22e4763f678d04e1497b71dcd8937f458a0da11f7f9bba3443b3589a18c89c`).
- Telemetry deviation check: REFUSED by design (exit 2) — the per-seed
  files carry top-level `anchorCommit`, so they are sweep recorder
  rows, not runs; the script refuses recorder-corpus input against a
  run baseline. Same documented refusal as round-2025. Baseline NOT
  rolled.
- `check.js --quick` triage (328 passed, 12 failed in 1561s, exit 1;
  log `/tmp/homebodyvoice-check-quick.log`, not committed): 7× 120s
  per-script timeouts under extreme box load (load ~17, three
  concurrent sweeps: living-garden-deed, occupation-panels,
  one-person-army-deed, solo-campaign-endings,
  trust-observer-neutrality, synergy-stall, capable-bot) — timeouts,
  not assertion failures. 3× retained-proof freshness gates that
  reproduce IDENTICALLY with the line stashed (verified by stash +
  re-run): measurement-proof-update ("Proof source inputs are not
  current"), measurement-workflow (same single failing assertion),
  phone-frame-proof (retained receipt stale across dozens of boot
  inputs) — the proofs were already stale on this base before this
  arm; refresh is a ship-loop maintenance action, not a game fix.
  1× measurement-cache-flags 0/4 — the documented box-load artifact
  (AGENTS.md, r187: cache-flags scores track box load, not the change).
  1× ladder-bundle ambient-raid control — reproduces with the line
  stashed (78/79 both ways), pre-existing on this base. No failure
  traces to the line. Neighboring proof test
  `test-profilegate-b.js` with the line in the tree: 48/50, all
  live/determinism legs green (D1/D2 + flag-inert); its 2 failures are
  stale-frozen-base assertions (the tree moved on since `eb2d3714f` —
  `src/js/truth.js` + other arms' instruments in the diff), not
  regressions.

## Disposition: GO — line SHIPS (coordinator lands; [needs-eyes])

The line stays in the tree (`src/js/villager-brain.js`, +36 lines). No
revert: the frozen letter-failures are drift artifacts proven by
controls, and reverting would unfix finding #2499 on a technicality.
The proof test's overall exit is non-zero on the two declared
letter-failures — that is the honest record, not a greenwash; §§1–3
(static, fixture, smoke) and §5 (controls) are green. Finding #2499 is
FIXED by this arm (report in this evidence; the coordinator updates
`hidden_files/sim-findings.md` — this worker does not edit it).
Follow-up (not this arm): the holder-half silence — when the HOLDER is
range-0, the game still says nothing about the holder staying home.

## Files

- Prereg: `evidence/2026-11-17/sim-homebodyvoice-a-prereg.md`
- Line: `src/js/villager-brain.js` (`writeCommit` only), `[needs-eyes]`
- Instrument: `scripts/homebodyvoice-driver-20261117.js`,
  `scripts/test-homebodyvoice-a.js`
- Corpora: `evidence/2026-11-17/perseed-homebodyvoice-a-on/` (8 files,
  judged legs), `perseed-homebodyvoice-a-noline/` (8 files, same-base
  no-line control), `perseed-homebodyvoice-a-ctrl/` (1 file,
  driver-fidelity check)
- Evidence: `evidence/2026-11-17/sim-homebodyvoice-a.md` (this file)
