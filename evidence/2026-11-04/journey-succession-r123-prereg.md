# Journey succession r123 — BOND CALIBRATION + PICK-TIME BAR (lane B, pre-registration 2026-11-04, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at
closeout ONLY after a verified landing (a failed run does not advance
the leg, per r103/r104/r105/r109/r110/r118/r121 precedent), and VERIFY
the file reads 4 afterwards (rotation writes have repeatedly failed to
stick; the file is the authority, not this note's claim).

Run number basis: latest completed Lane B run is r122 (crisis,
2026-11-04); this run is r123. Slug deviation, documented: the body
slug journey2-succession is unusable (done-merged registry entry +
dirty orphan directory on disk, same class as r117/r119); this run
registered journey2-succession-r123, matching its run number.

Base: local master at registration (def4f8f40 at pre-flight).
No push, no bump, no live check — ship loop owns those. Gating
freeze (2026-10-27) stands; no gate, deed-bar, standing, wave, or
table-price change is in scope. Perception law untouched.
No canon doc covers succession/mantle (CANON.md manifest;
DEAD-LEDGER.md mentions succession only in passing; STEVE-ANSWERS.md
carries no mantle/successor lines) — none invented here.
docs/CONVERSATIONS.md is the canon doc for the conversation-
transcript area and was read before any analysis, not just code
comments. Worktree AGENTS.md read at run start (push discipline:
local merge only, never push; sim-harness rules followed).

## Why this run (not a repeat of r119)

r119 proved the successor's second life is scholarly, not social, in
the first fortnight — Codex growth on every seed, but ZERO new bonds
in 14 days on 3/3 scored seeds — and proved the pick itself sound
once measured at the moment it happens (pick-time rank 1 on 2/2
captures; the one pre-rank miss was agency-bonus reordering, not a
pick defect). What r119 did NOT answer, and left as its explicit
calibration ask: is "0 new bonds in 14 days" a succession finding
at all, or just how slowly new bonds form game-wide? And does the
window look different at d+30? This run is that calibration, plus
the pick-time bar r119 proposed (score npcCalls rank, keep pre-rank
reported).

## The questions

1. PICK-TIME (binding, revised bar per r119 metric review): on every
   first handoff with npcCalls, is the pick-time rank 1 — i.e. does
   some npcIds() call inside the death, trust-sorted, put the
   successor first, with the successor ranking 1 in that call's
   trust map? The one-call property (exactly one npcIds call inside
   the death) is verified per handoff; if several calls fire, the
   call whose sorted-first is the successor is the pick-time input
   and is named. Pre-rank and the pre→post trust delta are
   reported alongside, never scored.
2. BOND CALIBRATION (reported, not scored): relPost → relD14,
   successor-involving keys (new / lost / deepened) versus
   non-successor-pair keys (neither endpoint the first successor,
   both endpoints living at relPost) over the SAME window in the
   SAME villages. If non-successors also form ~0 new bonds in 14
   days, r119's zero is a game-wide rate, not a succession blank.
   If non-successors form bonds while successors form none, the
   blank is successor-specific and goes to a builder lane.
3. D+30 BONDS (reported, not scored): relPost → relD30, same-bearer
   only (relD30.selfId == first successor; a second handoff before
   d+30 contaminates the window and it is not scored). The
   relD14 → relD30 segment is reported alongside. New driver
   instrument RELD30 (ledger cp-30 snapshot, same pattern as
   relD14); determinism of the instrument is NOT re-proven by a
   re-run here — RELD30 is a read-only snapshot in the ledger
   loop, and any trajectory doubt is checked against r119's
   matched-seed outputs descriptively, not claimed as proof.
4. SECOND-SCHOLAR (reported, carried): same-bearer ledger
   checkpoints d+7/d+14/d+30 (codexPlants / codexSkills / xpTotal
   deltas from scholarBase).
5. SELFHOOD (people check, reported): in the d+3/d+7/d+14 driven
   transcripts (first successor speaking as player), does the
   successor ever speak as THEMSELVES — an own want, memory,
   goal, or judgment — rather than only as the mantle's
   mouthpiece? Sense-read against the conversation bar (NPC wants
   something, options engage/deflect, endings resolve/plant/owe;
   no fabricated shared history, no filler loops). Method honesty
   (r119): YOU lines are driver menu picks, so selfhood is judged
   through what the successor DOES as player and how NPCs address
   them, not through free successor dialogue.

## Instrument (r119 driver + ONE declared addition)

- Driver: scripts/journey-succession-r123-20261104.js, r119 driver
  cloned with ONLY r119→r123 renames (filename, mode
  succession-r123, transcript/tele filename patterns, EVID dir
  2026-11-04) PLUS addition RELD30 below. PICKCTX + PICKCTX2
  retained verbatim (renamed). POST_DAYS=70,
  EARLY_KILL_DAY=40 (r119 values). CONVO_DAYS unchanged
  [3, 7, 14, 30, 45, 53, 64].
- RELD30 (driver only, read-only state read, no game-state
  change): in the ledger checkpoint loop, `if (cp === 30 &&
  !rec.relD30) rec.relD30 = relSnap(Game)` beside the relD14 line.
  Tele key succession.relD30 added (1/0 presence). The full rec
  (stdout JSON) already carries relD30; no other driver change.
- Analyzer: NEW standalone
  scripts/analyze-journey-succession-r123-calibration-20261104.js
  reading the pilot stdout JSONs (pickCtxs incl. npcCalls,
  relPost, relD14, relD30, ledger, scholarBase, chainDeaths,
  m1/s1/mg2v2/m4 fields). The r119 analyzer is NOT cloned —
  pick-time scoring and calibration measures are new code on the
  same JSON shapes.
- Regression proof (no panel needed): re-run
  scripts/test-party-rolepick-transcript.js (r117's fix) on
  current master; 3/3 PASS expected. Any failure is a
  regression, investigated before landing.

## Seeds, regime, policy

Fresh band 33201–33204 (exact `"seed": 3320x` grep across prior
succession stdout JSONs empty at run start), competent policy,
mature regime (EARLY_KILL_DAY=40 — r55 finding 5: close friends
exist only on mature seeds):
33201, 33202 FORCED-DESIGN (SECOND=40, THIRD=20, FOURTH=10,
FIFTH=10); 33203, 33204 CONTROLS (no forced kills; organic
chains, if any, still recorded and tagged).
Reserves if expansion fires: 33205 (forced-design), 33206
(control).
FORCED-REGIME CAVEAT (r119 lesson, stated in advance): a forced
kill that never fires (village ends first) makes the panel
effectively organic — the note must say so, and telemetry
verdicts must not cite a forced regime that did not happen.

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- PICK-TIME (binds, scored): on every recorded first handoff with
  npcCalls, pick-time rank == 1. A handoff with NO npcCalls is a
  NO-GO on instrument (the bar cannot be evaluated), reported
  as such, not silently dropped.
- CALIBRATION / D+30 / SECOND-SCHOLAR / SELFHOOD (reported, NOT
  scored): new-bond counts successor vs non-successor, d+30
  bond counts, scholar deltas, and the sense-read verdict. A zero
  on all bond measures for a seed is a CALIBRATION datum, not a
  game fail — it is the thing being measured.
- CARRIED REGRESSION (binds, r119 bars unchanged, with r119's
  S1 correction): DETECTOR chainDeaths == chainKnown on all
  death seeds; C1v3 (m1) true; S1 boolean == !over (survived 25+
  days post-death with a bearer — the boolean is named directly,
  retiring the "missingExact" phrasing); MG2v2 true; M1/M4 true;
  rolepick proof 3/3; keepsake flag: every chainDeaths entry
  carries keepsakeLineFired=true, and every inh record (first
  handoffs, where recorded) with vanishedIds non-empty carries
  keepsakeLineFired=true — the flag is never stale-null on a
  wrapper-recorded handoff (source playerDeath-wrapper).
- SKIPPED-SEED RULE (adopted from r117/r119): a skipped seed
  (village over before any kill, death-aware stop) counts in
  denominators as "not ≥ bar" but never triggers expansion on
  its own — a skip is an absence of evidence, not a placeholder
  score.
- Expansion trigger (pre-declared): expand to 6 seeds if ANY
  first handoff scores pick-time rank != 1 (or no-npcCalls
  NO-GO), OR if NO pilot seed yields a scored same-bearer d+30
  bond window (calibration unmeasurable at d+30 on the whole
  pilot).

## What would count as an interesting finding

- A pick-time rank != 1 (the "village chooses" fiction breaking
  at the actual pick moment, not just in a pre-snapshot).
- Non-successors forming bonds in 14 days while successors form
  none (a successor-specific blank, not a game-wide rate).
- Both groups at zero in 14 days but successors gaining bonds by
  d+30 (a slow rate, not a blank — the calibration answer).
- Both groups at zero through d+30 (bond formation itself is the
  blank, game-wide, and a builder question, not a succession fix).
- A successor who visibly starts a new chapter by d+30 (new close
  bond, new skill taught, own goal voiced) — the succession story
  working on the longer window r119 could not see.

## Telemetry

Baseline `hidden_files/telemetry-baselines/succession.json`,
metrics deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions (r117/r119
precedent). A forced-design panel must NOT roll the unforced
baseline forward on forced deaths — LOUD lines from deaths that
did fire under a forced design are regime, not drift, unless
investigation shows a real bug; LOUD lines on an effectively
organic panel are reported with a verdict (r119 precedent:
NOT rolled forward, chance-vs-deadlier left open). LOUD lines
are reported with a verdict either way.

## Fix policy

No game change is pre-planned. If a blank is found and it is
small and safe (transcript/copy only, r117 class), it is fixed
same-run with a proof test; spoken-copy changes carry
[needs-eyes]. A large inheritance/agency/bond-formation rework
is NOT attempted here — it is documented with evidence for the
owning builder lane. No gate, deed, wave, or table change
under any reading of a finding (freeze stands).
