# sim-holdervoice-b — EVIDENCE (verdict GO)

**Arm:** sim-holdervoice-b · **Loop A run:** fleshout-20261118T0112Z · **Axis:** scale-onramp
**Type:** BUILD, fiction only, no mechanics change. One voice line, one site.
**Branch:** `sim-holdervoice-b` · **Worktree:** `~/workspace/worktrees/sim-holdervoice-b`
**Base at arm start:** master `3d0f5770c` (coordinator evidence tip, sim-scale-onramp-round-2315).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.
**Prereg:** `evidence/2026-11-17/sim-holdervoice-b-prereg.md` (frozen).
**Verdict: GO** — every holder-range-0 blocked pick on the frozen band
is voiced exactly once on its first day (25/25 pairs), 0 lines for
walkable holders (174 pairs), and the same-base no-line control is
byte-identical on all 24 structural fields on all 8 seeds. No frozen
letter-check failed: the prereg's state-based bars (the 2315Z lesson)
held as written, with no drift contingency needed. Finding #2505 is
FIXED by this arm.

## The line (exact)

**Site:** `writeCommit` in `src/js/villager-brain.js` — the same site as
#2499, immediately after the companion block. Guard: the committed
pick has `winPlanAction === 'party_launch'` AND a companion AND
`npcMaxDist(vid) < 1` (the same `< 1` bound the depart's holder block
uses — `vidBlock: "range-0"`, depart `"hold"`). Dedup: a separate
`holderSaid` map on the brain store (`v.vbrain`, saved with the
village), keyed `holderId + '>' + companionId` — once per pair, ever.

**Text (one line, deterministic):**
`<HolderFirst> meant to walk out with <CompFirst> — but <HolderFirst> never leaves Haven, so <HolderFirst> stays home.`
First names via `firstNameOf(displayName(...))` (the #2499 pattern);
no pronoun; no claim about the companion beyond what's true. The
opening differs from the companion line's ("asked … to walk out") on
purpose: when BOTH holder and companion are range-0, both lines fire,
and two lines starting identically would read as a stutter. Live
instance: `Naran meant to walk out with Nora — but Naran never leaves Haven, so Naran stays home.` (seed 103411, day 54).

**Why the commit, not the depart:** when the HOLDER is range-0 the
live depart returns `'hold'` before the companion's `startExpedition`
is ever called, and the holder's agency tick sometimes never reaches
`vbrainExecuteDepart` at all. The dawn COMMIT is the point where the
game knows the pick cannot walk. The legacy depart (`winPlanDepart`)
is unreachable while `vbrainOwnsDawn()` is true.

**Net `src/` diff vs base:** one file, +32 lines, the holder line only
(`src/js/villager-brain.js`: the `writeCommit` block). `win-plan.js`
untouched. The #2499 companion line is byte-unchanged (its text,
guard, and `homebodySaid` map were not edited — the holder block was
added after it). The PROFILEGATE measurement lever (env-gated skip in
both `findCompanion` twins, exactly as profilegate-b / homebodyvoice-a
did it) was re-applied in this worktree only for measurement and
REVERTED before commit — verified: no `PROFILEGATE` /
`profilegateOn` in `villager-brain.js` or `win-plan.js`.

## Before / after (identical seeds, same-base control)

The before/after is line-ON vs line-OFF on the same base, same flags
(`VETREENGAGE=1`, `PROFILEGATE=1`), same driver — the no-line legs in
`perseed-holdervoice-b-noline/` (holder-line block temporarily
removed, byte-restored after; sha256-verified
`d6e59dcaafbb4b3e2cc1bd3ee9ddc30269d998f95ecc29b9f5a2336138944ce3`).
The say stream is the only difference:

| Seed | Holder lines fired | Holder-blocked pairs | Walkable-holder pairs | sayCount ON−OFF | Structural fields (24) |
| --- | --- | --- | --- | --- | --- |
| 103411 | 11 | 11 | 31 | +11 | MATCH |
| 103412 | 0 | 0 | 11 | 0 | MATCH |
| 103413 | 0 | 0 | 0 | 0 | MATCH |
| 103414 | 0 | 0 | 47 | 0 | MATCH |
| 103415 | 4 | 4 | 7 | +4 | MATCH |
| 103416 | 2 | 2 | 31 | +2 | MATCH |
| 103417 | 7 | 7 | 32 | +7 | MATCH |
| 103418 | 1 | 1 | 15 | +1 | MATCH |
| **Total** | **25** | **25** | **174** | **+25** | **MATCH 8/8** |

Structural fields compared (24): gameDays, days, endReason, standing,
scaleRank, maxWave, unlockedWave, won, villageLost, deaths,
winPlanStats, dawnbidScores, dawnbidDeparts, dawnbidCensus,
dawnbidStarts, companionPool, vetSays, v4seeds, v4departs, v4gates,
v4encounters, launchdefSkips, daily, samples — byte-identical on every
seed, including the full per-day snapshot array. sayCount differs by
exactly the holder-line firings on every seed. The companion-line
stream is untouched (the no-line legs carry the same `homebodyLines`
count minus the holder lines that also match `/never leaves Haven/` —
see Instrument notes). **The line moves no game outcome.**

## Bars (frozen — judged as written)

| Bar | Frozen wording | Result |
| --- | --- | --- |
| B1 state fires | Every holder-range-0 blocked pick voiced exactly once, on its first day, band-wide | **PASS** — 25 lines = 25 holder-blocked pairs; every line on its pair's first-occurrence day |
| B2 no walkable fire, no spam | 0 lines for walkable holders; ≤1 per pair; every line maps to a holder-range-0 pick | **PASS** — 174 walkable-holder pairs, 0 lines; 0 orphans; ≤1 per pair |
| B3 staged fixture green | Fire-once with names+reason; no second fire; second-companion fires; no-fire for walkable holder; both-range-0 fires BOTH lines once each, companion first; static checks green | **PASS** — `scripts/test-holdervoice-b.js`: 40/40 checks green (incl. exact frozen wording for both lines) |
| B4 trajectory neutrality | Same-base no-line control byte-identical on 24 structural fields, all 8 seeds; sayCount diff = holder-line firings | **PASS** — MATCH 8/8; sayCount diff 25 = 25 |
| B5 instrument valid | Proof test green; 0 driver errors on all 8 seeds; check.js --quick attempted + reported | **PASS** — 0 errors on all 8 seeds; policy sha frozen; check.js --quick: 334 passed, 6 failed in 581s (exit 1), all 6 triaged below — none traces to the line. (The proof test's overall exit is 0: 40/40 checks green.) |

**B1 note — the seed-103414 zero is drift, not a line failure, and
the state-based bar absorbs it.** On seed 103414 no holder-range-0
pick occurs on this base (0/91 picks; Giulia Bianchi's holderMaxD is
1 — she is a forager here). On the profilegate-b base she was a
homebody whose depart rows read `hold` / `vidBlock: "range-0"` from
day 65 to 110 (~60 rows); on this base she commits party_launch three
times (d64/d66/d70) with holderMaxD 1 and has zero depart rows. The
flip happened between the profilegate-b base (`eb2d3714f`) and the
homebodyvoice-a base (`77a37fe91`) — homebodyvoice-a already recorded
the first observable divergence on 103414 at day 56, and the
homebodyvoice-a corpus carries Giulia's identical three picks, so the
trajectory did not move again between that base and this one. The
prereg deliberately froze B1 on the STATE across the band, not on a
single instance, precisely so one drifted seed cannot void the bar:
four other seeds carry the state (103411, 103415, 103416, 103417,
103418 — five seeds, 25 pairs), and every one of those pairs is
voiced exactly once. The selblock premise (79/113 inviter-range-0)
was measured on the frozen profilegate corpus; on this base the
holder-blocked share is smaller (25 pairs vs 54 companion-blocked
pairs) because the villages' holder profiles drifted — the state is
rarer, not absent, and the line fires whenever it occurs.

## Wall numbers (this run's judged legs, line-on, this base)

| | This arm (line-on) | Homebodyvoice-a ON (same band, prev. base) |
| --- | --- | --- |
| National standing (≥200) | 1/8 (seed 103417, 450) | 1/8 (seed 103417, 450) |
| National rank | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 1/8 (103417) | 1/8 |
| Median survival | 102.5d | 102.5d |
| Villages surviving to 150d | 2/8 | 2/8 |

The wall did not move: no village reaches national rank, the table, or
a win. The wall numbers are IDENTICAL to homebodyvoice-a's — the same
trajectories, as expected for a fiction-only line (the same-base
control proves the line moves no outcome).

## Village assessment (plain words)

Eight villages, same eight on both legs. The one to picture is seed
103411: Naran Tumen is a homebody who holds a wave-4 plan and bids at
dawn again and again — eleven different companions over fifty-seven
days, Lena on day 32, Wyatt on day 33, Quinn, Yara, Dwayne, Edson,
Scott, Nora, Nikos, Aylin, Paramjit. Before this arm, every one of
those bids died silently; the morning promised a party and nothing
left Haven, with no word spoken. Now the village says it, once per
companion: Naran is told on the first day he asks for each of them,
and the ten later asks for Nora (days 63–95) stay quiet, because the
village already told him. On seed 103417, Ernestine does the same
thing seven times in her village's last three weeks (days 126–147) —
the village keeps answering once per new companion and never nags.
The blank this arm filled is the holder's half of the silence: the
person holding the plan now gets one honest line when they cannot
walk. What remains silent: a holder who is sick, hurt, or committed
too late in the day (selblock's other blocks) still gets no line —
those are separate silences, for follow-up arms, not this one.

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts. The line reads as a person being told something
true, not as a system label — it names the asker, the asked, and the
reason in one plain sentence:

- `Naran meant to walk out with Nora — but Naran never leaves Haven, so Naran stays home.` (seed 103411, day 54 — told once; ten later re-picks stay silent)
- `Nomthandazo meant to walk out with Mara — but Nomthandazo never leaves Haven, so Nomthandazo stays home.` (seed 103415, day 84 — the first of four tellings for one holder)
- `Ernestine meant to walk out with Jasper — but Ernestine never leaves Haven, so Ernestine stays home.` (seed 103417, day 147 — the last telling on the band's longest-lived village)

Where BOTH holder and companion are range-0, the two lines fire
together on the same day and read as two facts, not a stutter — four
live pairs do this (Naran>Nora d54, Naran>Aylin d78,
Nomthandazo>Zoltan d85, Nomthandazo>Sigrun d86). The day-54 dawn
scene, seed 103411:

- `Naran asked Nora to walk out with the party — but Nora never leaves Haven, so Nora stays behind.`
- `Naran meant to walk out with Nora — but Naran never leaves Haven, so Naran stays home.`
- (and, the same day, a second asker:) `Quinn asked Nora to walk out with the party — but Nora never leaves Haven, so Nora stays behind.`

The depart rows for that day back the telling: Naran `hold`,
`vidBlock: "range-0"`, `companionBlock: "range-0"` — three holds, both
blocks named, and the game now says both. Quinn's line is the
companion half only (Quinn can walk; no holder line for him), which
is the pair-keyed dedup working as designed: each asker gets their
own one telling. The once-per-pair silence after the first telling
reads as the village having learned it: Naran asks Nora eleven times
and is answered once; Ernestine asks seven companions and is answered
once each. The veteran stream around the lines is untouched
(`vetSays` byte-identical to the no-line legs).

**Pre-System "A" edge, found by the fixture and dispositioned here
(not hidden).** `displayName` returns a stranger descriptor ("A man,
maybe 20s") until the System arrives or the name is earned socially,
and `firstNameOf` on that descriptor yields bare "A" — so a line
fired pre-System would read "A meant to walk out with A". The staged
fixture caught this (its first run staged day-0 villagers and every
name came back "A"); the fix in the fixture is to stage the
post-arrival state the line actually fires in (`systemArrived = true`
— live, party_launch picks happen weeks in, and 496/496 blocked
picks on the homebodyvoice-a corpus carry real first names, 0
"A"-names; this corpus's 25 holder lines likewise all carry real
names). The edge affects the #2499 companion line identically and is
a known codebase anti-pattern (hierarchy.js, havenGrowth.js,
convoTopics.js already route around bare-"A" first names elsewhere).
It is NOT fixed in this arm: the prereg pins the #2499 name pattern
and forbids editing the companion line, and no live line on this band
exhibits it. Filed as a follow-up finding (see Findings, below) for a
shared name-resolution fix across both voice lines, not a silent
re-scope here.

## Steve-call #1409 — checked, no conflict

#1409 as listed (`docs/AGENT-LANES.md`, Codex executive decisions
2026-10-29 item 7): "Homebodies as blocked returns — do villagers who
stay home count as blocked returns for the returns measures?" Still
OPEN: no ruling appears in `docs/steve-call-decision-pack-20261024.md`
(grep: no hits). The question is about RETURNS MEASURES counting. This
arm changes no measure, no range, no gate, no profile, and no depart
logic — fiction only — so there is no ruling conflict in either
direction.

## Metric review

- **State-based bars absorbed the drift this time.** B1 was frozen
  on the state across the band (every holder-range-0 pick voiced
  exactly once), not on the Giulia+Jesse instance — so seed 103414's
  profile flip (homebody→forager between the profilegate-b and
  homebodyvoice-a bases) cost the arm one seed's worth of the state,
  not the bar. The 2315Z lesson (prefer same-base controls over frozen
  letter-checks) is validated again: the bar judged the line, not the
  base.
- **B4 as a same-base control worked cleanly.** No cross-base letter
  check was pre-registered, and none was needed: line-on vs no-line
  is byte-identical on all 24 structural fields, 8/8 seeds, with the
  sayCount difference exactly the holder-line firings. The
  informational cross-base comparison vs homebodyvoice-a's ON corpus
  shows structural diffs on 5 seeds, all confined to `dawnbidDeparts`
  — verified seq-only (identical with the `seq` field stripped), the
  documented module-level counter leak from homebodyvoice-a's metric
  review, not a trajectory difference. sayCount differs from the
  homebodyvoice-a corpus by exactly the holder-line count on every
  seed.
- **The `homebodyLines` stream is a combined stream in ON legs.** It
  matches `/never leaves Haven/`, which BOTH voice lines contain — so
  on line-on legs it counts companion + holder lines together
  (e.g. seed 103411: 26 = 15 companion + 11 holder). The proof test
  judges B1/B2 on the `holderLines` stream (`/stays home\./`) only,
  and the evidence table above separates them. A future driver copy
  should either narrow the homebody capture to `/stays behind\./` or
  document the combined counting where it is read.
- **The panel was not built, by prereg design.** §15 panels compare
  game outcomes; this change moves none (proven byte-identical). The
  same-base control IS the before/after instrument for a fiction-only
  change.
- **Fixture lesson (carried from the run, for the next voice arm):**
  the staged fixture must stage the post-System state
  (`systemArrived = true`) or every name reads "A" — the #2499
  fixture passed its exact-wording check with "A" placeholders
  because its expected names came from the same `firstOf()` helper,
  so the check was self-consistent but vacuous on names. This arm's
  fixture stages post-arrival and asserts real names (Farid, Kieran,
  Maricela, Ella, Wolfgang). Any future voice fixture should assert
  the staged names are not "A".

## Instrument notes (adoption-relevant)

- Driver `scripts/holdervoice-driver-20261117.js` is a copy of the
  homebodyvoice driver with the prereg-recorded deltas: holdervoice
  names, the `holderLines` capture (`/stays home\./`) alongside the
  kept `homebodyLines` capture (`/never leaves Haven/`), and
  `holderMaxD` added to every `blockedPicks` row. Both `const file`
  sites in `main()` carry the new name (the homebodyvoice file-naming
  bug did not recur — all 16 judged files carry the correct name).
- The `blockedPicks` rows carry `holderFirst`/`compFirst` (first names
  at score time) in addition to the prereg's `{day, part, vid,
  companion, maxD, holderMaxD}` — same as homebodyvoice-a, so the test
  can match lines to picks by role.
- `perseed-holdervoice-b-noline/` holds 8 files (line block
  temporarily removed, byte-restored after — sha256-verified
  `d6e59dcaafbb4b3e2cc1bd3ee9ddc30269d998f95ecc29b9f5a2336138944ce3`).
- The 5d live driver smoke inside the proof test records 0 holder
  lines / 0 blocked picks on seed 103411 — the first picks happen
  around day 29+, so a 5d smoke cannot see the state; it proves the
  instrument runs, not the line. The judged 150d legs are the line's
  proof.
- Telemetry deviation check: NOT RUN — the per-seed files carry
  top-level `anchorCommit`, so they are sweep recorder rows, not
  runs; the script refuses recorder-corpus input against a run
  baseline (same documented refusal as homebodyvoice-a and
  round-2025). Baseline NOT rolled.
- `check.js --quick` triage (334 passed, 6 failed in 581s, exit 1;
  log `/tmp/holdervoice-check-quick.log`, not committed): 2× 120s
  per-script timeouts under box load (living-garden-deed, through
  seed 777; one-person-army-deed, through seed 4) — BOTH PASS on
  direct retry with the line in place (garden exit 0; one-person-army
  7 passed, 0 failed), so both are load artifacts, not assertion
  failures. 2× retained-proof freshness gates that reproduce
  IDENTICALLY with the line stashed (verified by explicit-ref stash
  + re-run, stash dropped after, line restored byte-identical,
  sha256 `eb7e7580…`): measurement-proof-update ("Proof source inputs
  are not current"), measurement-workflow (same single failing
  assertion) — the proofs were already stale on this base before this
  arm; refresh is a ship-loop maintenance action, not a game fix.
  1× phone-frame-proof (retained receipt stale across boot inputs)
  — identical with the line stashed. 1× ladder-bundle ambient-raid
  control — reproduces with the line stashed (78/79 both ways),
  pre-existing on this base (same as homebodyvoice-a). No failure
  traces to the line.

## Findings (for the coordinator / sim-findings.md)

- **Pre-System "A" names on both voice lines** (see Sense-testing):
  `firstNameOf(displayName(...))` yields bare "A" for unidentified
  villagers pre-System; both the #2499 and #2505 lines would read
  "A asked A…" / "A meant to walk out with A…" if they ever fired
  before the System arrives. No live line on this band exhibits it.
  Follow-up: a shared name-resolution fix (descriptor-whole or
  `npcName` fallback) across both lines. Not this arm's scope.
- **Sick / hurt / late-commit holder blocks are still silent.**
  Selblock's other first blocks (inviter-sick, inviter-hurt,
  no-tick-after-commit) have no fiction line. The holder's half as
  voiced here covers range-0 only. Follow-up arms, not this one.

## Disposition: GO — line SHIPS (coordinator lands; [needs-eyes])

The line stays in the tree (`src/js/villager-brain.js`, +32 lines). No
revert: all five frozen bars pass as written (40/40 proof-test
checks), the same-base control proves the line moves no outcome, and
the live corpus voices every holder-blocked pick exactly once.
Finding #2505 is FIXED by this arm (report in this evidence; the
coordinator updates `hidden_files/sim-findings.md` — this worker does
not edit it).

## Files

- Prereg: `evidence/2026-11-17/sim-holdervoice-b-prereg.md`
- Line: `src/js/villager-brain.js` (`writeCommit` only), `[needs-eyes]`
- Instrument: `scripts/holdervoice-driver-20261117.js`,
  `scripts/test-holdervoice-b.js`
- Corpora: `evidence/2026-11-17/perseed-holdervoice-b-on/` (8 files,
  judged legs), `perseed-holdervoice-b-noline/` (8 files, same-base
  no-line control)
- Evidence: `evidence/2026-11-17/sim-holdervoice-b.md` (this file)
