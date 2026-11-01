# Journey succession r89 — FRESH-SEED GENERALIZATION OF WEEK-1 NAMING + CHAIN5 (lane B, pre-registration 2026-10-31, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at closeout
(endgame next), and VERIFY the file reads 4 afterwards (rotation writes
have repeatedly failed to stick in recent Lane B runs; the file is the
authority, not this note's claim).

Run number basis: last numbered Lane B run is r88 (crisis, landed
2026-10-31 evening CDT — closeout commit 12e07e049 verified on master,
its tree removed, its lock deleted by its own recovery agent before this
run started; no lock was present at this run's start). The 18:00 CDT
stood-down run's abandoned r89 worktree was released and its branch
deleted at the time, so r89 is free. This run is r89.

Slug deviation, two parts, both documented: (1) body slug
journey2-succession is unusable — the registry still holds a
done-merged journey2-succession entry and the orphan
journey2-succession/ directory still sits on disk (standing
disposition: untouched). Same class as r83/r87. (2) This run FIRST
registered journey2-succession-r87 by mistake (r87 already ran and
landed 2026-10-31 morning; the fresh branch from master was clean and
held zero work) — released as abandoned, worktree removed, branch
deletion EPERM-blocked on .git/packed-refs.new writes (intermittent
container flap, 3 attempts) and DEFERRED: the branch points at the
master tip with zero unique commits, so it is safe to delete later and
blocks nothing. This run uses journey2-succession-r89. Orphan dir,
r86 tree, and r87 branch untouched.

Base: local master 66239763c (Lane A deepening r77, measurement only,
zero src/js — no trajectory effect expected on grief/lately lines).
No push, no bump, no live check — ship loop owns those. Gating freeze
(2026-10-27) stands; no gate, deed-bar, standing, wave, or table-price
change is in scope. Perception law untouched: invites here are
player-chosen; no partner-selection change is in scope. No canon doc
covers succession/mantle (r54 prereg, unchanged) — none invented here.
Instrument only, zero src/js changes (same no-compete decision as
r54/r55/r56/r64/r67/r70/r72/r75/r79/r83/r87: tackle-succession owns
the succession inheritance build; this run measures master for it
and documents blanks, never fixes them here).

## The question

r87 reproduced r83 EXACTLY on the matched band 26151–26156: week-1
naming 8/28 transcripts, per-seed 2/5, 1/4, 1/5, 1/5, 0/5, 3/4, and
CHAIN5 bonds 31/31 with affinity diff 0. Exact reproduction on one
seed band does not prove the finding generalizes — the band could be
lucky. Does the same panel, run on FRESH seeds, give the same shape?

1. WEEK1-NAMING-GEN: per fresh seed, how many d+3/d+7 driven
   transcripts name the dead first bearer (sense-confirmed,
   whole-word, collisions flagged)? Pooled named/total vs r87's 8/28
   (28.6%), and naming lines per lately+mourning draw.
2. CHAIN5-GEN: on fresh chain-forced seeds, does the fifth handoff
   still record fully (relPreDeath5 + relPost5 + fifthDeath lin+mo),
   with fifth-successor bonds survived == pre and affinity diff 0?
3. SILENCE-GEN: does any fresh seed repeat 26155's silence (0 naming
   with high-trust partners)? If so, is it still draw variance
   (lately/mourning draws present but returning non-grief lines) or a
   new pattern (no draws at all, a gate, a bond effect)?
4. VOICE (people check): full sense-read of ALL fresh week-1
   transcripts — do they still satisfy the conversation bar (NPC
   wants something, options engage/deflect, endings resolve/plant/
   owe), with no fabricated shared history, filler loops, or static
   menus?

## Instrument (r87 files verbatim + renames only)

- Driver: scripts/journey-succession-r87-20261031.js cloned with ONLY
  r87→r89 renames. Verified by diff: strip r87/r89, files identical.
  CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64]; week-1 transcripts
  are the d+3/d+7 firings (top-2 by trust + bond-partner at d+3 when
  not already talked to). Transcript filing keys on ACTUAL
  days-since-death (r87 closeout fix, in the cloned scorer/test).
- Naming scorer: scripts/analyze-journey-succession-r87-naming-
  20261031.js cloned with ONLY r87→r89 renames (tag default r89).
  Verified rename-only by diff.
- Main analyzer: scripts/analyze-journey-succession-r87-20261031.js
  cloned with ONLY r87→r89 renames + seed list 26151–26156 →
  27151–27156. Verified by diff: strip r87/r89 and old/new seeds,
  files identical.
- Proof: scripts/test-journey-succession-r87-naming-20261031.js
  cloned with ONLY r87→r89 renames (driver path, tag default).
  Verified rename-only by diff. (a) Scorer on r83's week-1
  transcripts as fixtures expects 8/28 transcripts naming, per-seed
  2/5, 1/4, 1/5, 1/5, 0/5, 3/4. (b) Wrong-name control: the same
  fixtures scored against a dead name from another seed expect 0
  naming. (c) Driver rename smoke: r89 driver on proof seed 24998
  (short config, all five kills forced) emits fifthDeath +
  d+3/d+7 transcripts filed under actual days. Proof scratch
  deleted by the test, r56 pattern.

## Seeds, regime, policy

Fresh band 27151–27156 (no prior Lane B succession use; +1000 offset
from the matched band, same shape). Competent policy, POST_DAYS=70,
mature regime for all (EARLY_KILL_DAY=40):
27151–27153 CHAIN-FORCED (SECOND_KILL_DPLUS=20,
THIRD_KILL_DPLUS=20 measured from the second death day,
FOURTH_KILL_DPLUS=10 measured from the third death day,
FIFTH_KILL_DPLUS=10 measured from the fourth death day),
27154–27156 CONTROLS (no forced kills; organic chains, if any,
still recorded and tagged scriptedSecond=false / etc.).
Pilot FIRST (27151 forced + 27154 control, full config): the panel
expands only if WEEK1-READABLE holds on both pilot seeds (see
binding metrics). If the pilot's week-1 transcripts are missing or
unreadable, that is an instrument NO-GO, not a game verdict, and
the panel does not burn.

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- WEEK1-READABLE (binds): on every panel seed, a d+3/d+7 transcript
  file exists for every d+3/d+7 convoReads entry, and death.oldFirst
  resolves. A missing transcript or unresolvable dead name is a
  NO-GO on the instrument, not on the game.
- CHAIN5-READABLE (binds, r87 bar carried): on ≥2/3 chain-forced
  seeds, a full fifth handoff record (relPreDeath5 + relPost5 +
  fifthDeath with linOk + moOk + inh5 readable). A forced seed with
  no fifthDeath is a NO-GO on the instrument/regression
  investigation item, never silently dropped.
- CHAIN5-BONDS (binds, r87 bar carried): fifth-successor bonds
  survived == pre on all forced seeds with a fifth handoff, and
  affinity pre5 vs post5 identical (diff 0). A bond drop or affinity
  drift is a REGRESSION investigation item before any other verdict.
- DEATH-LEDGER (binds, r87 bar carried): every chain death
  cause-known (forced scripted flags true; organic causes honest
  and specific). A fallback to lineage cause is a regression item.
- CARRIED REGRESSION (binds, r87 bars unchanged): C1v3 0 missing;
  S1 0 missing bearerDeltaExact; MG2v2 0 violations; M1/M4 hold;
  M3v2b reported (bar ≥ 2 on ≥ 4/6 seeds; r87's miss was a no-chain
  control — the same allowance applies, stated here, not invented
  after seeing results).
- WEEK1-NAMING-GEN (reported, NOT scored as pass/fail — pre-declared
  interpretation, §14 honest): per-seed named/total transcripts +
  naming lines per lately+mourning draw + mechanism per naming line
  (lately / mourning / react-more / other, sense-confirmed).
  Interpretation declared NOW: naming on ≥4/6 fresh seeds with ≥1
  = the driven surface acknowledges fresh death consistently on a
  new band (generalizes; r87 matched band was 5/6). 0-naming on ≥2
  fresh seeds = variance finding — name the distinguishing
  condition (partner trust, bond, draw counts) or report it as
  unexplained variance for tackle-succession, never as a game bug
  claim (want-driven convos are by design; the finding is about
  acknowledgment presence). Pooled rate is reported descriptively
  against r87's 8/28; no pass/fail threshold is set on the pooled
  rate (draw variance), EXCEPT a pooled 0 would be a regression
  investigation item. No threshold is moved after seeing results.
- INVITE SEAM (reported, r87 bars): invite outcomes spoken /
  deflected / other across driven transcripts; any sibling
  deflection joined to its SAYTRACE pool draw.
- PHANTOM5 + INH5 (descriptive, via main analyzer): per dead bearer
  (original + successors 1–4), never pooled across them; fifth
  successor's own pre-death NPC record vs post-handoff scholar state.
