# Journey succession r100 — SENT-VANISH MECHANISM + PROOF-(e) RE-BASELINE (lane B, pre-registration 2026-11-01, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at
closeout (succession → endgame wrap 7→4), and VERIFY the file reads
4 afterwards (rotation writes have repeatedly failed to stick in
recent Lane B runs; the file is the authority, not this note's
claim).

Run number basis: last numbered Lane B succession run is r97
(landed; week-1 second death FOUND, any-recent proven informative,
CHAIN5 3/3, proof (e) carried as stale-baseline debt). This run is
r100. Slug deviation, documented: the body slug journey2-succession
is unusable (done-merged registry entry + orphan directory on disk,
same class as r83/r87/r89/r91/r94/r97). This run uses
journey2-succession-r100.

Stale-lock recovery, documented: the lane lock at run start read
run_id 2026-11-02T01:58:03Z — r99's own lock, left behind by r99's
closeout (r99 is done-merged in the registry, heartbeat
2026-11-02T02:54:55Z, status done-merged). No registered tree
carries the lock's run_id, so per the body's guard the previous
run is DEAD (completed, not live) and the lock was deleted; a fresh
lock (2026-11-02T02:59:09Z) was written for this run. At closeout,
delete the lock ONLY if it still carries this run's run_id — r97
showed another run's closeout deletes the lane lock without
checking run_id, so a blind delete could remove a successor run's
lock.

Base: local master at registration. No push, no bump, no live check
— ship loop owns those. Gating freeze (2026-10-27) stands; no gate,
deed-bar, standing, wave, or table-price change is in scope.
Perception law untouched. No canon doc covers succession/mantle
(CANON.md grep: no dedicated doc; DEAD-LEDGER.md mentions
succession only in passing) — none invented here.

## Why not another full measurement panel

r97 answered the succession leg's three hunt questions (fresh
split case: none; genuine both-silence: none; week-1 second death:
FOUND). Steve 2026-11-01: deliver real changes, stop re-proving
already-proven constraints. This run therefore spends its panel on
the leg's biggest OPEN blank — the sent-vanish mechanism (r83–r97:
sentimental items vanish at some handoffs but not others,
mechanism open) — plus the proof debt r97 explicitly left for the
owning lane (proof-(e) re-baseline), plus the per-run people check.
A 4-seed pilot (not a 6-seed panel) is proportionate: vanish
classification needs handoffs, not a census.

## The question

1. SENT-VANISH MECHANISM: at each fresh handoff, which dead-bearer
   items vanish (absent from every scanned location), and what in
   the handoff code explains the split? Code-read starting point
   (ledger.js playerDeath, DEATH PACK rule, Steve 2026-10-09):
   non-sentimental inventory + worn gear goes on the corpse as
   the lootable death pack; SENTIMENTALS DIE WITH THE OWNER
   (keepsakes buried with the body — never on the corpse, never
   lootable). Hypothesis, pre-registered: vanish ⟺ the item type
   is class 'sentimental' AND the dead bearer held the only
   scanned copy — so "not universally" is the type-vs-serial
   distinction (ids are types, not serials): a sentimental type
   survives whenever another copy sits with the successor, a
   living villager, the pantry, the prep stash, or a stash.
2. PROOF-(e) RE-BASELINE: r97 proved (e)'s r91-trajectory
   expectation stale (game drift from conversation-flow landings)
   via a control run, and left the re-baseline as proof debt for
   the owning lane. This run replays seed 28152 on current master
   and records the new reference trajectory with STRUCTURAL
   integrity checks (new check (e2), below) — it does NOT silently
   rewrite (e)'s old expectations. (e) stays red-and-documented
   until a current-master seed produces a genuine same-iteration
   double handoff to split-assert on.
3. PEOPLE CHECK: full sense-read of ALL pilot week-1 transcripts
   — conversation bar (NPC wants something, options engage /
   deflect, endings resolve / plant / owe), no fabricated shared
   history, no filler loops, no static menus.

## Instrument (r97 files + renames + two declared additions)

- Driver: scripts/journey-succession-r97-20261101.js cloned with
  ONLY r97→r100 renames (filename, mode succession-r100, probe
  strings, tele/transcript filename patterns), EVID dir 2026-11-01
  (kept — same local evening), date 20261101 (kept). NO logic
  change. CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64].
  POST_DAYS=70, EARLY_KILL_DAY=40 (r97 values).
- Forced seeds: SECOND_KILL_DPLUS=20, THIRD_KILL_DPLUS=20,
  FOURTH_KILL_DPLUS=10, FIFTH_KILL_DPLUS=10 (r97's 20/20/10/10).
  Controls: all four 0.
- Pilot seeds: 30161, 30162 (chain-forced), 30163, 30164
  (controls). Fresh numbers, never used by a succession panel.
- Main analyzer: r97 analyzer cloned with ONLY renames + seed
  list changes (SEEDS [30161..30164], forced [30161,30162],
  young [30161,30162], mature [30163,30164]) + ONE declared
  addition: VANISH-CLASSIFY (final section; reads
  src/data/items.json for id→class, walks rec.inh and
  rec.inh2..inh5 disposition arrays, prints per-item counts for
  vanished items and surviving sentimentals, and prints the V1 /
  V2 verdict lines). No other analyzer logic change.
- Naming analyzer: r97 file cloned with ONLY renames (defaults
  seeds 30161..30164, tag r100).
- Proof test: r97 file cloned with ONLY renames (driver path,
  scratch patterns r100-) + ONE declared addition: check (e2)
  inside the (e) replay try block, on the same replay record
  (no second replay run): chain continuity, all-via-playerDeath,
  fifthDeath/scriptedFifth consistency, tele deaths.bearer >=
  chain length, trajectory logged descriptively. (e)'s old
  r91-split expectations are NOT edited.
- Diff verification: strip r97/r100 tokens, old/new seeds, the
  VANISH-CLASSIFY block, and the (e2) block; the remaining files
  must be identical. Any other diff is a stop-and-explain item.
- Expansion trigger (pre-declared, NARROWER than r97's on
  purpose): pilot expands to 6 (adding 30165 chain-forced, 30166
  control) if ANY pilot seed shows a same-iteration double
  handoff OR scores silent under BOTH naming metrics. A week-1
  second death does NOT alone trigger expansion — r97 already
  answered that question on a fresh seed; expansion here buys
  split/silence evidence, not a second copy of an answered
  question.

## Pre-registered bars (binding, §14)

- DETECTOR: chainDeaths count == true bearer changes on 4/4
  pilot seeds (true count from game records; a collapse on any
  seed is a NO-GO for the recorder, not re-scored).
- CHAIN5-READABLE: full fifth handoff recorded on every forced
  seed that reaches its fifth-kill window; a recorder miss on
  such a seed is NO-GO (a seed that ends before the window is
  not a recorder miss — reported as such).
- CHAIN5-BONDS: fifth-successor bonds survived == pre on every
  recorded fifth handoff; affinityDiff5 = 0 on every one.
- V1 (vanish mechanism): every vanished id at a handoff snapshot
  has class 'sentimental' in src/data/items.json. A vanished
  non-sentimental id (or UNKNOWN class) is a BUG finding:
  investigate the gearPack/corpse path same-run; a fix belongs
  to this run only if root-caused, else it is carried as an open
  blank with the evidence attached.
- V2 (vanish mechanism): no sentimental id shows corpseN > 0 at
  any handoff snapshot — the code says sentimentals never enter
  the gearPack, so a corpse copy is a code-path contradiction to
  investigate, not a rounding error.
- V3 (descriptive, not a bar): for every sentimental id that does
  NOT vanish, VANISH-CLASSIFY names the saving location (another
  copy with the successor / a living villager / pantry /
  prepStash / stash). If V1+V2 hold and V3's saving locations
  account for every surviving sentimental, the mechanism is
  CLOSED as designed behavior (buried keepsakes + type-vs-serial
  copies), and the remaining question is narration, not code.
- M3v2b ≥3/4 on the pilot panel (≥4/6 if expanded), same
  allowance shape as r97.
- C1v3 ok=true missing=[]; S1 missingExact=0; MG2v2 true;
  M1/M4 true; INVITE SEAM: every invite outcome spoken.
- PROOF: (a)–(d) and (f) must pass; (e2) must pass; (e) is
  EXPECTED to fail on its stale r91 expectation (carried debt,
  not re-scored, not edited). A NEW failure in (a)–(d)/(f)/(e2)
  is a stop-and-explain item.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Metric doubts go under "metric review" for the NEXT
  run.

## Conditional blank-fix (pre-declared, not mid-run scope creep)

If V1+V2 hold and V3 accounts for every surviving sentimental
(mechanism closed as designed) AND no handoff/burial line names
the keepsakes' fate (grep playerDeath + recoverBearer say lines
for sentimental/keepsake/buried-with wording), this run adds ONE
say line at the handoff naming that keepsakes are buried with the
body, with a proof-test assertion that the line fires on a
scripted handoff. Small, in-leg, narration-only (no numbers, no
gates, no inventory behavior change). If narration already exists
anywhere on the handoff path, no fix — document where. If V1 or
V2 fails, the bug investigation takes priority and the narration
fix is deferred.

## Telemetry

node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/succession.json
--current 'evidence/2026-11-01/journey-succession-r100-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
Prereg rule (r89/r91/r94/r97 precedent): a forced-chain panel must
NOT roll the unforced baseline forward — LOUD lines from forced
deaths are regime, not drift, unless investigation shows a real
bug. Baseline NOT rolled on LOUD lines without a same-run
investigation verdict.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree after the panel. Standing pre-existing failure
families (r97: measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes) are the baseline; r99 reports the
capable-bot food-deed proof GREEN again (r97's carried NEW failure
gone via another landing) — re-observe its status here and report
it. Any NEW failure is a stop-and-explain item. The run's own
proof test is run standalone (see PROOF bars above).
