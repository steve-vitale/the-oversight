# sim-muster-a — preregistration: MUSTER FORMATION (DIAG ONLY, zero src/js)

Run: fleshout-loop-a (scale-onramp), worker branch sim-muster-a.
Upstream finding (sim-titangate-a, 2026-11-01, 1235Z round): on the
vet2mfg band, 183/183 titan-gate refusals read have 0, need 10
(herald) or 12 (nielsen). No village ever formed even a partial
muster. This arm answers the upstream question: WHY does a muster
never form at all?

## Primary question

Muster formation, in order:
1. Is the call ever sounded? By whom, triggered by what (seat leg?
   titan arrival? player action? policy action? game-auto?), how
   often per seed?
2. Does muster size ever grow above 0, even by one blade? Muster
   size trajectory over time per seed (allies + haven blades,
   per titan).
3. What blocks the FIRST joiner, on every seed where the muster
   stays 0? Classification (fixed below, judged per seed).

## Stack (named exactly — numbers NEVER compared across stacks/bases)

Substrate: `scripts/policies/tableseat-nowait.js`
(`LEANLINKRESCUE=1`, `TABLESEATNOWAIT=1`) — the titangate stack,
reused because this arm's cross-check leg REQUIRES it (refusal
counts must reproduce titangate's on the pilot seeds).

Recorders, all REUSED UNMODIFIED:
- `scripts/policies/fullseat-diag.js` (`FULLSEAT=1`),
  `scripts/policies/wavegate-diag.js` (`WAVEGATE=1`),
  `scripts/policies/vet2-diag.js` (`VET2=1`),
  `scripts/policies/vet2mfg-diag.js` (`VET2MFG=1`) — end fields,
  unlock day, end snapshots only.
- `scripts/policies/muster-diag.js` (`MUSTER=1`) — herald
  refusal snapshots (C0–C9 semantics: call attempts so far,
  muster existence, allies raw/unique, haven blades, active
  links with trust/opinion/arrears/quota/free-faces/wouldYield,
  hypothetical call yield, omen stage, offered flags, ready
  check) + muster-verb counters. Reused verbatim; its
  herald-only scope is a known limit, covered by the new
  generic snapshot below.

New instrument files only (this arm; sim-muster-a prefix):
- `scripts/sim-muster-a-sweep.js` — sweep driver + sweep-side
  wrappers (pure observation: call through, never mutate game
  state, never draw RNG).
- `scripts/sim-muster-a-analyze.js` — analyzer (per-seed +
  pooled + classification).
- `scripts/test-sim-muster-a.js` — proof test (synthetic
  classifier/trajectory cases + corpus legs).

## Policy statement about the call (explicit, pre-sims)

The substrate policy NEVER sounds the call, by construction:
- `tableseat-nowait.js` contains no titan-verb call at all
  (its only "titan" mention is a comment); it is leanlinkrescue
  courtship + table-seat legs only.
- `leanlinkrescue.js` likewise contains no titan-verb call
  (grep: zero "titan" matches).
- The competent policy was NOT chosen for this arm: the
  titangate cross-check requires the titangate stack, and
  competent also contains no titan-verb call (grep: zero
  matches) — so a zero-call result under tableseat-nowait
  is not an artifact of this one policy; it is the shape of
  every current bot policy.
- Game code, read before sims (`src/js/titans.js`): the ONLY
  callers of `soundTitanCall` are the player camp verb
  `titanSelfDo('titan:call:<tid>')` (via app.js self-bar
  buttons, offered only when the omen is stage >= 2 and the
  muster is not already ready) and the finale campaign's
  reinforce path (`finaleReinforce` -> `soundTitanCall('finale')`,
  itself reached only through a player verb). `titanDawnTick`
  stages omens, escalates, and runs muster upkeep — it NEVER
  sounds the call. No NPC, no dawn tick, no omen advance
  sounds the call on its own. Haven's own blades join ONLY
  via the player's two-tap `titanCommitOwn`, never via the
  call (titans.js, 2026-10-13 note).
- Therefore the sweep's verb counters wrap ALL entry points
  (`soundTitanCall` direct, `titanSelfDo`, `titanCommitOwn`,
  `titanWarCouncil`): any call from any source — policy,
  game-auto, campaign — is caught. A zero on all four verbs
  means the call is never sounded by anything in the run,
  not merely "not by the policy".

## Band and horizon (reused band, pilot only)

Band: pilot 8 seeds 95301–95308 — the FIRST HALF of the
vet2mfg/titangate band (16 seeds 95301–95308 + 95311–95318).
Reuse is deliberate: (a) titangate's refusal counts on these
seeds are known (95304: 29 herald gate refusals; all other
pilot seeds: 0 gate refusals), so the cross-check leg is
exact; (b) 95304 is the band's herald-contact seed, so the
first-blade blocker classification has at least one
refusal-time snapshot set to work from; (c) the other 7
seeds test whether a call/muster appears WITHOUT a refusal
(i.e. whether musters form quietly and are simply never
refused — the alternative to "never forms").
Horizon: `DAYS=180`, death-aware (runDays ends dead villages
early) — identical to titangate, and long enough to reach a
titan-gate/seat attempt (titangate shows refusals from day
143+, unlocks from day 59+ on this band).

Pilot gate: 8 seeds before ANY confirm spend. This is a DIAG
arm: NO 12–16 seed confirm unless the pilot shows a live
muster signal worth confirming (a sounded call, a muster
size > 0 on any seed, or a partial muster at any time).
If the pilot shows muster is structurally zero, that IS the
finding — document it and stop, do not burn seeds chasing it.

## Counting rules (fixed before sims)

- Call-sounding attempt: one counted invocation of
  `Game.soundTitanCall(tid)` (any caller), OR one
  `Game.titanSelfDo('titan:call:<tid>')` (counted separately
  as a verb, and joined to the soundTitanCall it triggers;
  a selfDo call that does not reach soundTitanCall — e.g.
  bad id — counts as a verb attempt but not a sounded call).
  A call is "sounded" iff soundTitanCall runs, regardless of
  how many fires answer (0 answers still counts as sounded).
- Join: one ally entry appended to `muster.allies` during a
  sounded call (measured as allies-count delta across the
  call, per titan), or one haven entry appended by
  `titanCommitOwn` (measured as haven-count delta across
  the commit). Villagers merely present in a village are NOT
  joins.
- Muster member: one entry in `muster.allies` (unique by
  villageId:vid, alive per the titans.js unique-allies rule)
  or one valid haven blade (`titanHavenBlades` rule:
  on the Haven roster, not the scholar, deduped).
- Muster size (trajectory): per titan, per dawn (snapshot
  after `titanDawnTick`): alliesRaw + havenValid, plus
  alliesUnique. The trajectory is the dawn-by-dawn series;
  the reported numbers are: max size, size at run end,
  first day size > 0 (if any), and size on each refusal day.
  A muster that forms and is stood down / slain / turned
  still counts as "formed" — its rise and fall are both in
  the trajectory.
- Refusal cross-check: herald gate refusals on the pilot
  band must equal titangate's pilot-band count (29, all on
  95304). Any deviation is an instrument-neutrality failure.
- Hypothetical call yield: at each refusal (muster-diag,
  herald) and at run end + at first omen-stage-2 day (new
  generic snapshot, all titans): replicate
  `soundTitanCall`'s per-link rules exactly (refuse iff
  trust < 25 OR opinion < -10 OR arrears > 0; quota 6 if
  trust >= 70 AND opinion >= 10 else 2; yield capped by
  free adult alive faces not already committed). The yield
  is a pure-read counterfactual — the sweep NEVER sounds
  the call itself.
- Call offered: per titan, omen stage >= 2 and not slain
  (the `titanSelfActions` offer condition, derived without
  calling `titanSelfActions`, which runs
  `titanRepairPlacements`). Commit offered: call offered
  AND havenValid < 3.

## First-blade blocker classification (one per zero-muster seed)

Every seed whose max muster size is 0 for every titan gets
exactly one class (priority order — first matching class
wins, so classes are disjoint):
- A-NO-OPPORTUNITY: no titan ever reached omen stage >= 2
  (the call button was never offered to anyone, player or
  policy) AND no refusal occurred.
- B-OFFERED-NOT-SOUNDED: at least one titan reached omen
  stage >= 2 (call offered), 0 calls sounded, 0 commits.
  Sub-report: hypothetical yield at first omen-2 day and
  at run end (would the call have produced blades?).
- C-CALLED-NO-ANSWERS: >= 1 call sounded, 0 joins on every
  call. Sub-report: per call, links active, refusals by
  reason (trust / opinion / arrears / no free faces), and
  hypothetical yield (must be 0 if the rules replicate).
- D-PARTIAL-THEN-LOST: max size > 0 but the muster never
  reached need — NOT a zero-muster seed, so this class
  should not occur in the zero set; if it does, the seed
  is reclassified out of the zero set and reported as the
  live-muster signal that triggers confirm consideration.
- E-FORMED-THEN-STOOD-DOWN: muster reached need (>= minAllies)
  then fell (standdown / slain / turned) — likewise NOT a
  zero-muster seed; same reclassification rule as D.
Seeds with max size > 0 are reported individually (trajectory
+ what happened to the muster), never folded into the zero
set. A seed with refusals but no muster gets its refusal-time
muster-diag snapshots reported alongside its class.

## Sense-testing (mandatory)

Read the say transcript around: (a) the first omen-stage-2
line per seed ("Scouts found its lair ... Sound the call."),
(b) the first refusal line if any, (c) any call line if any.
Judge: does the fiction present the call as an action the
player can take, and does anything in the transcript explain
why nobody takes it? The ring buffer (last 12 say lines)
is dumped at each of these first-events. If no call is ever
sounded, the sense finding is the gap between the omen-2
line's imperative ("Sound the call.") and the absence of
any actor who sounds it — stated as a finding, not filled
with invented dialogue.

## Pre-registered DIAG-GO bars (judge exactly against this)

DIAG-GO iff ALL of:
1. 8 pilot seeds, each complete (verb counters + trajectory
   + end fields present, capture errors 0 on every seed).
2. 100% of call attempts classified (every counted
   soundTitanCall / titanSelfDo / commit / council verb has
   a titan id and a day; zero unclassified verb records).
3. Muster trajectory recorded on 8/8 seeds (dawn snapshots
   present for every titan with an omen, or an explicit
   no-omen record; no seed with a missing trajectory).
4. First-blade blocker classified on EVERY zero-muster seed
   (classes A/B/C only, or D/E reclassification with a
   trajectory — zero unclassified zero-muster seeds).
5. Cross-check leg: herald gate refusals on the pilot band
   == 29 (titangate's pilot-band count), all on 95304.
6. Recorder-neutrality leg: ON vs OFF end fields identical
   (days, gameDays, won, national/table flags, maxWave,
   endScaleRank, endReason) on 1 pilot seed (95304 — the
   contact seed; the instrument must not move the run).
7. Determinism leg: one judged seed re-run to a scratch dir
   is byte-identical to its judged JSON.
8. Proof test `scripts/test-sim-muster-a.js` green
   (synthetic classifier + trajectory + hypothetical-yield
   cases + corpus legs re-deriving the verdict gates from
   the judged corpus).
9. Sense-test: at least one first-event transcript beat read
   for meaning in the evidence file (omen-2 beat on the
   contact seed at minimum; call beat if any call exists).

Panel (MEASUREMENT.md §15): NOT APPLICABLE — single-base DIAG
census, no before/after comparison exists in this arm; none
fabricated.

## Canon note

No dedicated titan/muster canon doc exists in docs/CANON.md's
manifest (checked 2026-11-01): the governing sources read
before sims are `src/js/titans.js`'s header (Titan class,
2026-10-11/12) and docs/MONSTER-WAVES.md (wave 4/5 gates,
titan flags in src/data/titans.json: herald need 10, nielsen
need 12, finale/network need 20, coalition quotas base 2 /
trusted 6). Nothing in this arm invents canon; the call
rules above are transcribed from titans.js, not designed.

## Metric review (mandatory section in the evidence file)

Doubts go here, never into a re-score. Known in advance:
(a) muster-diag's refusal snapshots are herald-only; the
new generic snapshot covers all titans but replicates the
call rules rather than calling them, so a rule drift in
titans.js would show as a yield mismatch, not a silent
pass — any mismatch between a real call's joins and the
hypothetical yield on the same state is reported, not
smoothed. (b) Dawn snapshots miss intra-day muster changes
(a call sounded and stood down between dawns would still
show in verb counters + end state, but its trajectory peak
could be missed — the verb counters are the guard: any
call/commit verb triggers a same-day trajectory note).
(c) "Offered" is derived, not read from titanSelfActions,
because calling it runs titanRepairPlacements (a mutator);
the derivation is the exact offer condition from that
function (omen stage >= 2, not slain).
