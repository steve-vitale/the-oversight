# Journey succession r119 — THE SUCCESSOR'S SECOND LIFE (lane B, pre-registration 2026-11-03, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at
closeout (succession → endgame wrap 7→4), and VERIFY the file reads
4 afterwards (rotation writes have repeatedly failed to stick in
recent Lane B runs; the file is the authority, not this note's
claim).

Run number basis: latest Lane B run overall is r118 (endgame,
2026-11-03); this run is r119. No r119 evidence exists at run
start. Slug deviation, documented: the body slug
journey2-succession is unusable (done-merged registry entry +
orphan directory on disk, same class as r117 and earlier runs);
this run registered journey2-succession-r115 (the number was
chosen at registration before the run number was established —
the 04:00Z r115 attempt died with no worktree and no panel, so
the slug is free, but the RUN number is r119 and all evidence
files carry r119; the slug/number mismatch is a naming wart,
not a second run).

Base: local master at registration (38433bc49 at pre-flight).
No push, no bump, no live check — ship loop owns those. Gating
freeze (2026-10-27) stands; no gate, deed-bar, standing, wave,
or table-price change is in scope. Perception law untouched.
No canon doc covers succession/mantle (CANON.md manifest;
DEAD-LEDGER.md mentions succession only in passing; a
DIRECTIVES.md grep finds no mantle/successor lines) — none
invented here. docs/CONVERSATIONS.md is the canon doc for the
conversation-transcript area and was read before any fix, not
just the code comment.

## Why this run (not a repeat of r117)

r117 (today) proved the mantle passes repeatedly and readably:
chain-5 bonds intact, keepsakes narrated per handoff, rolepick
lines in transcripts, invite seam closed, week-1 grief
sense-read 23/23. What r117 did NOT ask: after the handoff,
does the successor go on LIVING — or just carry the mantle as
a placeholder until the next death? And is the pick itself
legible — does the village actually choose its most-trusted
living member, as ledger.js says ("successor: the village
chooses. Trust decides", candidates = npcIds() sorted by trust
desc, candidates[0] wins)? Those are the two halves of
TACKLE-ALL item 5's unmeasured remainder (the taken-over
villager feeling purpose-made was r54/r75/r108's inventory
half; this run is the agency half).

## The questions

1. PICK-LEGIBILITY: is the first successor the highest-trust
   living NPC at the moment of the pick? Measured from the
   wrapper's PRE snapshot (trust map + npcIds() before the
   real playerDeath): rank = 1 + count of candidates with
   strictly greater pre trust. The POST snapshot is NOT the
   pick input and is never ranked: smoke seed 32999 proved
   why — the successor's trust is deliberately reset at
   handoff (Jovan 90 pre → 46 post, "you'll have to earn
   this face"), so a post rank measures the reset, not the
   pick. Caveat, stated not hidden: the agency wrapper's
   death bonus (≤ +12 per roster member) lands inside the
   real call, between pre and the core sort, so pre-rank 1
   with a >12 gap to rank 2 is proof of the pick, while
   pre-rank 1 with a ≤12 gap is consistent-with (a bonus
   tie would fall to npcIds order under stable sort).
   Bond to the dead bearer (depth/v from the pre-death bond
   map, or none) is reported for color, never scored.
2. SECOND-LIFE BONDS: between handoff (relPost) and d+14
   (relD14), does the first successor form NEW bonds (keys
   involving the successor present at relD14, absent at
   relPost)? Person-deed count change for the successor over
   the same window is reported alongside.
3. SECOND-LIFE SCHOLARSHIP: while the first successor is
   bearer, does the Codex grow (codexPlants / codexSkills /
   xpTotal deltas from scholarBase to the same-bearer ledger
   checkpoints d+7/d+14/d+30)? The ledger already records
   scholarSnap per checkpoint with the bearer name, so only
   same-bearer entries count; a checkpoint whose bearer is
   already the second successor is excluded, not counted.
4. SELFHOOD (people check): in the d+3/d+7/d+14 driven
   transcripts (the first successor speaking as player),
   does the successor ever speak as THEMSELVES — an own want,
   memory, goal, or judgment — rather than only as the
   mantle's mouthpiece grieving the dead bearer? Sense-read
   against the conversation bar (NPC wants something, options
   engage/deflect, endings resolve/plant/owe; no fabricated
   shared history, no filler loops).

## Instrument (r117 driver + ONE declared addition)

- Driver: scripts/journey-succession-r117-20261103.js cloned
  with ONLY r117→r119 renames (filename, mode
  succession-r119, transcript/tele filename patterns, fifth
  probe string) PLUS addition PICKCTX below. EVID dir
  2026-11-03 (same day, new r119 filenames — no collision
  with r117 files). POST_DAYS=70, EARLY_KILL_DAY=40 (r117
  values). CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64].
- PICKCTX (driver wrapper only, read-only state reads, no
  game-state change): inside the Game.playerDeath wrapper,
  before the real call, snapshot {trust map copy, npcIds()
  list, dead-bearer bond entries}; after the real call,
  snapshot {trust map copy, npcIds() list} again; when the
  call actually changes the bearer (the same condition the
  call actually changes the bearer — gated on the bearer
  change ONLY, not on chainRecording, because the first
  (organic, phase-A) death fires before the chain recorder
  arms — push one pickCtx record {deadId, newId, pre, post}
  onto rec.pickCtxs. Copies only — the wrapper writes
  nothing back into Game state.
- Forced seeds: SECOND_KILL_DPLUS=40 (not r117's 20), so
  the first successor's solo window covers the d+7/d+14/d+30
  ledger checkpoints and the d+30 driven convo; THIRD=20,
  FOURTH=10, FIFTH=10 (r117 spacing after the second kill).
- Analyzer: NEW standalone
  scripts/analyze-journey-succession-r119-secondlife-20261103.js
  reading the pilot stdout JSONs (pickCtxs, relPost, relD14,
  ledger, scholarBase, chainDeaths, m1/s1/mg2v2/m4 fields).
  The r117 analyzer is NOT cloned — second-life measures are
  all computable from the JSONs above.
- Regression proof (no panel needed): re-run
  scripts/test-party-rolepick-transcript.js (r117's fix) on
  current master; 3/3 PASS expected. Any failure is a
  regression, investigated before landing.

## Seeds, regime, policy

Fresh band 32201–32204 (exact `"seed": 3220x` grep across
succession stdout JSONs empty at run start — the numbers
also occur as unrelated counters inside older corpora, which
is not a seed collision), competent policy, mature regime
(EARLY_KILL_DAY=40 — r55 finding 5: close friends exist
only on mature seeds):
32201, 32202 CHAIN-FORCED (SECOND=40, THIRD=20, FOURTH=10,
FIFTH=10); 32203, 32204 CONTROLS (no forced kills; organic
chains, if any, still recorded and tagged).
Reserves if expansion fires: 32205 (forced), 32206 (control).

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- PICK (binds, scored): on every recorded first handoff with
  a pickCtx, PRE-snapshot rank == 1. The pre→post trust
  delta for the successor (the handoff reset) is reported
  descriptively; a post rank is never scored, per the
  smoke-seed correction above.
- SECOND-BONDS / SECOND-SCHOLAR / SELFHOOD (reported, NOT
  scored): new-bond counts, deed-count deltas, scholar
  deltas, and the sense-read verdict. A zero on all three
  for a seed is a PLACEHOLDER finding, not a game fail —
  it triggers the expansion below, and only a repeated
  placeholder pattern across the expanded panel would be
  carried as a blank for a builder run.
- CARRIED REGRESSION (binds, r117 bars unchanged):
  DETECTOR chainDeaths == chainKnown on all death seeds;
  C1v3 ok=true missing=[]; S1 missingExact=0; MG2v2 true;
  M1/M4 true; rolepick proof 3/3; keepsake flag: every
  chainDeaths entry carries keepsakeLineFired=true, and
  every inh record (first handoffs, where recorded) with
  vanishedIds non-empty carries keepsakeLineFired=true —
  the flag is never stale-null on a wrapper-recorded
  handoff (r117's keepsakeLineSource must read
  playerDeath-wrapper).
- SKIPPED-SEED RULE (adopted from r117's metric review):
  a skipped seed (village over before any kill, death-aware
  stop) counts in denominators as "not ≥ bar" but never
  triggers expansion on its own — a skip is an absence of
  evidence, not a placeholder score.
- Expansion trigger (pre-declared): expand to 6 seeds if ANY
  pilot seed shows pre-rank != 1 OR scores placeholder on
  all three second-life measures (zero new bonds AND zero
  scholar growth to its last same-bearer checkpoint AND no
  selfhood line in its d+3/d+7/d+14 transcripts).

## What would count as an interesting finding

- A pick that is NOT the top-trust living NPC (the "village
  chooses" fiction breaking against its own code).
- A successor who gains nothing in 14–30 days: no new bond,
  no Codex growth, no deed — the mantle as placeholder.
- A successor who talks only about the dead bearer for two
  weeks — grief crowding out selfhood, the r117 silence
  finding's mirror image.
- The opposite: a successor who visibly starts a new
  chapter (new close bond, new skill taught, own goal
  voiced) — the succession story working as designed.

## Telemetry

Baseline `hidden_files/telemetry-baselines/succession.json`,
metrics deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions (r117
precedent). A forced-chain panel must NOT roll the
unforced baseline forward — LOUD lines from forced deaths
are regime, not drift, unless investigation shows a real
bug. LOUD lines are reported with a verdict.

## Fix policy

No game change is pre-planned. If a blank is found and it
is small and safe (transcript/copy only, r117 class), it is
fixed same-run with a proof test; spoken-copy changes carry
[needs-eyes]. A large inheritance/agency rework is NOT
attempted here — it is documented with evidence for the
owning builder lane. No gate, deed, wave, or table change
under any reading of a finding (freeze stands).

## Addendum (mid-run corrections — history above untouched, §11/§14)

- PICK snapshot correction (from smoke seed 32999, before the
  panel): the POST snapshot must never be ranked — the
  successor's trust is deliberately reset at handoff
  (90 → 46), so post rank measures the reset, not the pick.
  The binding bar was corrected pre-panel from post-rank to
  PRE-rank (see Q1/binding text above, edited before any
  panel seed ran).
- S1 wording correction (from control seeds 32203/32204):
  the driver's s1 field is a survival boolean
  (village not over AND bearer alive AND dayAdv >= 25), not
  the older "missingExact" count the prereg's carried bar
  named. On seeds whose village dies out, s1=false is the
  expected reading, not a regression. Judged here as
  s1 == !over; the "missingExact" phrasing is retired for
  this run and the next run's prereg should name the
  boolean directly.
- PICKCTX2 decomposition instrument (added after the
  control seeds, before any verdict): the driver wrapper
  now also captures every npcIds() call inside the real
  death call with the trust map at that moment, so the
  exact pick-time input can be identified (the call whose
  trust-sorted list puts the successor first). This does
  NOT re-score the pre-registered PICK bar: a pre-rank miss
  stays a NO-GO on that bar, and the pick-time result is
  reported as decomposition (bonus reordering vs real pick
  defect), with any bar revision proposed for the NEXT run
  only. Seed 32203 is re-run on the PICKCTX2 driver as a
  determinism check (trajectory must match its panel
  record apart from the added instrument data).
