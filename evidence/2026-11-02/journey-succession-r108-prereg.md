# Journey succession r108 — KEEPSAKE-PER-HANDOFF + TOM-RECAP PROBE (lane B, pre-registration 2026-11-02, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at
closeout (succession → endgame wrap 7→4), and VERIFY the file reads
4 afterwards (rotation writes have repeatedly failed to stick in
recent Lane B runs; the file is the authority, not this note's
claim).

Run number basis: last numbered Lane B succession run is r104
(landed; same-day ≠ same-iteration PROVEN from the record,
keepsake line verified by proof but NOT per-handoff from the
panel record, Tom-recap mismatch carried OPEN). Last Lane B run
overall is r107 (crisis, wrote rotation 6 → 7). This run is r108.
Slug deviation, documented: the body slug journey2-succession is
unusable (done-merged registry entry + orphan directory on disk,
same class as r83/r87/r89/r91/r94/r97/r100/r104). This run uses
journey2-succession-r108.

Base: local master at registration (4903d44b5 at pre-flight).
No push, no bump, no live check — ship loop owns those. Gating
freeze (2026-10-27) stands; no gate, deed-bar, standing, wave,
or table-price change is in scope. Perception law untouched.
No canon doc covers succession/mantle (CANON.md manifest;
DEAD-LEDGER.md mentions succession only in passing) — none
invented here. docs/CONVERSATIONS.md is the canon doc for the
recap probe area (dialogue, talk, gossip) — read before any
recap fix, not just the code comment.

## Why this run

Steve 2026-11-01: deliver real changes, stop re-proving
already-proven constraints. r104 left exactly two open items,
and this run spends its panel on both, plus the per-run people
check: (1) the keepsake-line bar r104 judged HONESTLY
unverifiable (driver persists only sampled lines + lastSay, so
a per-handoff line verdict could not be read off the panel
record) — r104's metric-review proposal was to persist a
per-chain-entry keepsakeLineFired boolean; this run implements
it and re-judges the bar; (2) the Tom d+3 recap mismatch
(r104 seed 30402: pantry-run + theft-confession conversation
recaps as "Still on that wound care", a need never spoken in
that conversation) — this run probes it to a verdict instead
of carrying it a third time.

## The questions

1. KEEPSAKE-PER-HANDOFF: with a per-handoff keepsakeLineFired
   flag persisted on every chain entry and on the leg-death
   record, does the burial line fire on every handoff whose
   disposition record shows ≥1 vanished sentimental? A vanish
   without the line is a REGRESSION of r100's fix,
   investigated same-run. The silence direction (line fired
   with 0 vanished) is DESCRIPTIVE only, not a bar: a buried
   keepsake can survive in the disposition count via another
   copy elsewhere, so fired-with-0-vanished is a question to
   explain, not an auto-fail.
2. TOM-RECAP PROBE: construct the Tom shape with real
   machinery — an open favor of kind X (asked in a real
   conversation, still live) plus a live need of kind Y≠X
   that outranks X in the convoFindFavorNeed scan — then
   take the recap pick and read the label. If the recap names
   Y while the asked favor X is still live, the r104 wrinkle
   is a BUG (the recap answers "what were we talking about?"
   with a need never spoken in the thread) and the fix is
   attempted same-run (prefer the asked favor's kind when
   still live — convoFavorNeedLive exists — else the live
   scan, else the fallback label; this preserves r68's
   "never promise a need that isn't there" while naming the
   thread that was actually asked). If the recap names X,
   the wrinkle is CLOSED as designed, with the mechanism
   explained. If the shape cannot be constructed, the probe
   reports NO-DATA with the exact blocker, not a verdict.
3. PEOPLE CHECK: full sense-read of ALL pilot week-1
   transcripts — conversation bar (NPC wants something,
   options engage / deflect, endings resolve / plant / owe),
   no fabricated shared history, no filler loops, no static
   menus.

## Instrument (r104 files + renames + two declared additions)

- Driver: scripts/journey-succession-r104-20261102.js cloned
  with ONLY r104→r108 renames (filename, mode succession-r108,
  probe strings, tele/transcript filename patterns), EVID dir
  2026-11-02, date 20261102. POST_DAYS=70, EARLY_KILL_DAY=40
  (r104 values). CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64].
  Forced seeds: SECOND_KILL_DPLUS=20, THIRD_KILL_DPLUS=20,
  FOURTH_KILL_DPLUS=10, FIFTH_KILL_DPLUS=10 (r104's 20/20/10/10).
  Controls: all four 0.
- Declared addition A (driver): keepsake-line capture. In the
  playerDeath wrapper, note sayLog.length before the original
  call and scan the lines added by that call for the burial
  substring "goes into the ground with them" (ledger.js:738);
  attach keepsakeLineFired (bool) + keepsakeLineText (matched
  line, truncated) to every chain entry recorded by that call,
  and to rec.inh for the leg death (the leg death's own
  playerDeath call is the most recent one when rec.inh is
  computed; for the organic phase-A path the same wrapper
  value is used). Additive output fields only — no game-state
  write, no RNG touch, no policy change. Determinism leg
  (below) must still hold byte-identical including the new
  fields; if the capture changes any game trajectory byte,
  that is a stop-and-explain item.
- Main analyzer: r104 analyzer cloned with ONLY renames +
  seed list changes (SEEDS [30501..30504], forced [30501,30502],
  young [30501,30502], mature [30503,30504]) + ONE declared
  addition: KEEPSAKE-PER-HANDOFF section (for every disposition
  record inh, inh2..inh5: vanishedIds + the matching
  keepsakeLineFired — inh from rec.inh, inhN from the chain
  entry carrying the matching scripted flag; chain entries
  with no disposition record printed descriptively with their
  flag and no bar applied).
- Naming analyzer: r104 file cloned with ONLY renames
  (defaults seeds 30501..30504, tag r108).
- Proof tests: r104 files cloned with ONLY renames (driver
  path, scratch patterns r108-) + keepsake-line check carried:
  the scripted-handoff line assertion from r100 stands, re-run
  against current master. NO edit to (e)'s old r91-split
  expectations UNLESS a genuine same-iteration double is
  observed on this panel — in that case, and only then, (e)
  is re-baselined on that seed's trajectory with the split
  asserted structurally, and the re-baseline is documented as
  its own commit section.
- Recap probe: NEW script scripts/probe-recap-favor-vs-need.js
  (harness-level, throwaway seeds only, writes its own
  evidence/2026-11-02/journey-succession-r108-recap-probe.*
  files, never the panel's). It drives a real favor ask, leaves
  it unfulfilled, changes the villager's live need, then takes
  the recap pick and prints the label + the favor record +
  the live scan result. No game-code change inside the probe;
  state writes are limited to the probe's own harness village
  (health value) and are reported as such.
- Diff verification: strip r104/r108 tokens, old/new seeds,
  the keepsake-capture block, and the KEEPSAKE-PER-HANDOFF
  block; the remaining files must be identical. Any other diff
  is a stop-and-explain item.
- Pilot seeds: 30501, 30502 (chain-forced), 30503, 30504
  (controls). Fresh numbers, never used by a succession panel
  (verified by succession-file grep before launch; 30505/30506
  reserved for expansion).
- Determinism leg: seed 30501 re-run BYTE-IDENTICAL (panel
  JSON, keepsake fields included — the capture is a pure
  function of the say lines and the game trajectory, so any
  byte difference is a stop-and-explain item).
- Expansion trigger (pre-declared, same shape as r104):
  pilot expands to 6 (adding 30505 chain-forced, 30506 control)
  if ANY pilot seed shows a same-iteration double handoff OR
  scores silent under BOTH naming metrics. A keepsake
  regression is investigated same-run, not an expansion
  trigger; a week-1 second death alone does NOT trigger
  expansion.

## Pre-registered bars (binding, §14)

- DETECTOR: chainDeaths count == true bearer deaths on 4/4
  pilot seeds (true count from game records; a collapse on any
  seed is a NO-GO for the recorder, not re-scored).
- CHAIN5-READABLE: full fifth handoff recorded on every forced
  seed that reaches its fifth-kill window; a recorder miss on
  such a seed is NO-GO (a seed that ends before the window is
  not a recorder miss — reported as such).
- CHAIN5-BONDS: fifth-successor bonds survived == pre on every
  recorded fifth handoff; affinityDiff5 = 0 on every one.
- V1 (vanish mechanism, re-confirmation): every vanished id at
  a handoff snapshot has class 'sentimental' in
  src/data/items.json. A vanished non-sentimental id (or
  UNKNOWN class) is a BUG finding: investigate the
  gearPack/corpse path same-run.
- V2 (vanish mechanism, re-confirmation): no sentimental id
  shows corpseN > 0 at any handoff snapshot.
- KEEPSAKE-PER-HANDOFF: on every disposition record with ≥1
  vanished sentimental, keepsakeLineFired == true. A vanish
  without the line is a REGRESSION finding, investigated
  same-run. Fired-with-0-vanished is descriptive (see Q1).
- RECAP-PROBE: verdict per Q2 criteria above — BUG, CLOSED,
  or NO-DATA with blocker. No bar is staked on the probe
  finding a bug; a CLOSED verdict is a complete outcome.
- M3v2b ≥3/4 on the pilot panel (≥4/6 if expanded), same
  allowance shape as r104.
- C1v3 ok=true missing=[]; S1 missingExact=0; MG2v2 true;
  M1/M4 true; INVITE SEAM: every invite outcome spoken.
- PROOF: (a)–(d) and (f) must pass; (e2) must pass; (e) is
  EXPECTED to fail on its stale r91 expectation (carried debt,
  not re-scored, not edited) UNLESS a genuine same-iteration
  double is observed on this panel, in which case (e) is
  re-baselined as declared above. A NEW failure in
  (a)–(d)/(f)/(e2) is a stop-and-explain item.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Metric doubts go under "metric review" for the NEXT
  run.

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-02/journey-succession-r108-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r94/r97/r100/r104 precedent): a forced-chain
panel must NOT roll the unforced baseline forward — LOUD lines
from forced deaths are regime, not drift, unless investigation
shows a real bug. Baseline NOT rolled on LOUD lines without a
same-run investigation verdict.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r104: measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes) are the baseline; re-observe the
capable-bot food-deed proof status here and report it. Any NEW
failure is a stop-and-explain item. The run's own proof tests
are run standalone (see PROOF bars above).
