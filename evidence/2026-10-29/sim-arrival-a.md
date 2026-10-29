# sim-arrival-a — EMPTY-TILE ARRIVAL: DIAGNOSIS + DESIGN, BUILD BLOCKED ON FILE OWNERSHIP

Worker: gaps-grudge (empty-tile arrival arm). Status: DIAG COMPLETE,
DESIGN SPECIFIED, BUILD NOT STARTED — stopped per the assignment's
hard rule (below). No src/js change, no judged sim run, no pilot, no
confirm, no merge, no push, no bump, no live verification. This file
is the deliverable: the arrival diagnosis the arm was assigned, a
complete build-ready design, and a frozen draft preregistration for
the arm that builds once the ownership block clears. Nothing in here
is a judged result and nothing here may be quoted as a pilot outcome.

## The stop, plainly

The arrival fix's natural home is `src/js/villager-objectives.js`,
`objAwayStep`'s RETURN-TO-FIGHT arrival block — the exact lines that
spend the memory, stay silent, and (in the design below) would follow
a trail. The assignment forbids touching that file (fixall-map's
file) and orders: "If your design needs those files, STOP and report
to me instead of editing them."

This design needs that file. The audit below proves it rather than
asserting it:

- The arrival block is the ONLY place that knows, at the moment of
  arrival, that this villager is on a HUNT objective at its
  remembered tile with its quarry gone. No other module is called
  there with that context.
- The follow rule must run inside that block (or in its exact
  re-fire loop): it needs the objective's tightness, clock, and
  huntMid, and it must re-target the same objective. A new module
  wrapping or monkey-patching `objAwayStep` would evade the
  ownership rule instead of obeying it — the lottery audit rejected
  the same shape for `objPick`, and it is rejected here identically.
- The one piece that could live elsewhere (a trail store on the
  monster, in `game.js` `wanderWorldMonsters`) is dead data without
  the consumer: unwired state with no reader is not a landing (repo
  rule: proof before claim — a feature is done when it is called
  from game code). Building the store alone would claim progress
  while changing zero arrivals.
- The `game.js`-only alternatives were examined and rejected on
  their merits (see "Rejected"), not just on ownership — so this
  is not a case where a cleverer file choice saves the arm.

What the coordinator needs to decide (one line each, for the
record): either (a) release `villager-objectives.js` to this arm
for the single arrival-block change specified below, with
fixall-map reviewing, or (b) hand this design to the fixall-map
owner to build inside their lane, or (c) hold the arm until the
map lane lands. Until one of those is ruled, the correct state is:
diag + design + draft prereg committed, game code untouched.

## Plain words first

When a villager walks back for a beast, they arrive at a tile, not
a beast. The game teleports them onto the remembered tile the
moment they set out, and the next heartbeat checks: is the beast
still here? Nine times in ten it is not — it wandered off on the
player's footsteps, because the woods only move when the player
walks. The villager finds nothing: no tracks, no sound, no smell,
no "it was gone" line. Their memory of the fight is silently
erased, they stand around the empty tile until their trip clock
runs out, and they walk home. Nothing they could have followed
exists in the game at all — a beast leaves no trail behind it;
its old position is simply overwritten.

The departure delay is not the main killer, and that matters:
the one traced wave-4 attempt waited two days to leave, but across
the band, hunts that get picked leave within a heartbeat or two
in most cases. The killer is the wandering itself: after just 8
player steps, a beast has only a 3% chance of still being on its
old tile. Even when the beast IS still there, the fight is not
guaranteed — the beast may step away first, and then the fight
itself is a coin flip. So an arrival fix cannot be "wait longer"
or "remember harder." It has to give the hunter something at the
tile to follow — tracks on the ground they stand on, leading one
tile onward — or arrivals will stay empty no matter how many
hunts get picked.

## Diag 1 — what the villager finds on arrival: nothing at all

File: `src/js/villager-objectives.js`, `objAwayStep`, the
RETURN-TO-FIGHT arrival block. Quoted in substance (line numbers
drift; the block is the HUNT branch inside `objAwayStep`):

- At the hunt tile with the quarry gone, the memory is spent —
  `objDropMonsterSighting(rid, huntMid, tx, ty)` — with no `say`,
  no beat, no "it was gone" line. Proven by fixture (see "Probe"):
  arrival-step emit lines `[]`, memory gone, objective still
  `'out'`.
- The spend condition is an id mismatch, not an absence: if ANY
  other beast is on the tile, the memory is spent too (fixture
  Case 3: gallowdeer on an influencer tile spends the influencer
  memory). Arriving to "a beast" is not arriving to "your beast."
- If the quarry IS still there (matching id), the memory is kept
  (fixture Case 2) — the comment says the world tick may start
  the real fight from here, and that fight records a fresh memory
  of its own. Keeping the memory is the only arrival outcome that
  preserves a future.
- The block re-fires every part the hunter stands on the tile:
  that is why the corpus has 911 drop calls but only 297 true
  spends — after the first spend, later calls return false. The
  re-fire loop is also why a follow rule placed in this block
  would naturally re-check each part (see "Design").
- There is NO track, sign, sound, freshness, or scent signal
  anywhere on the arrival path. Searched: no `track`/`footprint`/
  `scent`/`trail` read in `objAwayStep` or the arrival block;
  `mapmemNoticeNode` notices corpses on the node, never beast
  passage; `touchTileScene` only refreshes tile visuals. The
  monster object itself carries no history (see Diag 6).

## Diag 2 — the clock that matters is player steps, not days

- `wanderWorldMonsters` (game.js): each world monster moves to an
  adjacent tile with probability 0.35 per `worldTick`, never onto
  a safe tile or an occupied tile. Empirical fixture (Case 5):
  647/1000 stays (64.7%) at an interior tile with all four
  neighbours valid — the code rate, confirmed, not assumed.
- `worldTick` runs ONLY on player tile entry (`checkEncounter`
  calls `worldTick()` first; `advancePart` does NOT call it).
  So "days since the fight" is the wrong clock: a beast's move
  count is the player-bot's step count between the fight and the
  arrival. A 2-day departure lag with a still player costs the
  beast zero moves; a same-day arrival after a marathon player
  walk costs it dozens.
- Still-there probability after k worldTicks (upper bound —
  blocked/edge moves only raise it): k=1: 65.0%, k=2: 42.3%,
  k=4: 17.9%, k=8: 3.2%, k=16: 0.1%, k=32: ~0%. At the band's
  91% empty rate, the implied typical k is ~6–8 ticks — a
  handful of player steps, not a saga. Any design that assumes
  the beast "probably" stayed put is wrong by arithmetic.
- Even a present beast is not a meeting. Order inside `worldTick`
  is wander FIRST, then `villagerMonsterTick`, and that tick
  fights a co-located villager only on a 50% roll (and skips
  sheltered / post-flee-resting villagers). So P(fight on a given
  worldTick | co-located at tick start) ≤ 0.65 × 0.50 = 32.5%.
  The hunter can stand on the beast's tile and still watch it
  step away before the fight roll, or lose the roll and stand
  there unfought while the next tick moves it again.

## Diag 3 — departure lag: real, small, and mostly NOT the killer

- Departure is a teleport, not a walk. `objDepart` calls
  `npcSetNode(vid, obj.tx, obj.ty)`: the hunter is placed ON the
  remembered tile at departure. The "walk" after that is
  `objAwayStep` area-work around the tile. Consequence, proven
  by corpus: departure → true-drop lag is median 1 part
  (259/291 matched arrivals within 2 parts) — the next part's
  `objAwayStep` fires the arrival block, because the hunter is
  already standing there. Long "walks" in the join (4 matches
  over 13 parts, max 262) cannot be single trips: the trip clock
  is `partsLeft = 2*dist + 3` parts, so they are cross-trip
  misattribution (an early departure that never arrived
  consuming a later trip's drop in the greedy join — see Diag 4).
- Pick → departure lag, wave-4 picks only (the funnel pick
  recorder covers wave-4-memory-holder picks ONLY, n=9 picks,
  n=5 joined to a departure): median 1 part, mean 2.0, max 8
  parts (2 days — the visjoin_115 case). The 2-day lag is the
  MAXIMUM in the band, not the norm. Fixing departure lag alone
  would move the band's arrival rate by almost nothing: most
  hunts depart promptly and still arrive empty, because the
  beast moved on player steps, not on the departure delay.
- Which gates DELAY vs DESTROY a pick (fixture Case 4, all
  proven, not read off):
  - DANGER converts, never delays. `objDanger` verdicts `ask` /
    `tighten` / `defer` route a HUNT through `objTightenOrDefer`,
    which only tightens FORAGE/WATER/TRAPS — every other kind,
    including HUNT, is rewritten to indoor HAVEN_CHORE. Fixture
    4a (gossip attacks + rain, score 5, `tighten`): the ready
    HUNT became HAVEN_CHORE. A danger-blocked hunt is a dead
    hunt, not a late hunt.
  - HEAL sat-out DELAYS. A hurt villager with no medicine and no
    healer sits out the day (`villagerHealCheck` returns sat-out;
    `objHealGate` blocks `objDepart`; `objMaybeDepart` skips
    the villager for the rest of that day) and the ready HUNT
    survives to the next day (fixture 4b: HUNT/ready, still
    home). Caveat from fixture 4d: when a healer exists (this
    fixture village has one, fatima_hassan), the hurt villager
    is patched +25 and departs the same day — the delay path
    needs hurt AND no help, not hurt alone.
  - SICK delays (fixture 4c: HUNT/ready, still home).
  - ENGAGED (conversation), expedition ledger, and night parts
    (night is dayPart 3 only, so 3 of 4 parts per day still try)
    also skip departure without touching the objective, by code
    reading — same delay class, not separately fixtured.
- The visjoin_115 2-day lag (pick d135 → depart d137) therefore
  CANNOT be danger (danger would have killed the pick — proven
  above), and its exact cause is NOT attributable from the
  corpus (no heal/sick/engaged records exist for it). Candidates,
  in no ranked order: repeated heal sat-out days, sick days, an
  expedition ledger hold, engaged days. The building arm's
  recorder must log the blocking gate per delayed departure, or
  the next lag question will be unanswerable the same way.

## Diag 4 — after an empty arrival: linger, clock out, go home, forget

- The empty arrival changes NOTHING except the memory spend.
  Objective stays `'out'` (fixture Case 1); the trip is not
  closed, the hunter is not sent home, no new decision is taken.
- Linger: while the trip clock runs, `objAwayStep`'s at-site
  branch works the area (50%/part, within Manhattan ≤ 2 of the
  target, pulled back by pursuit). Corpus: after a true drop,
  median 2 further false drop calls on the tile in the next 40
  parts (mean 2.3, max 14) — a lower bound on linger parts, since
  area-work moves the hunter off the tile on some parts and the
  block only fires on-tile.
- Linger's second chance is real but thin: if the beast wanders
  BACK onto the tile during linger, `villagerMonsterTick` may
  still fight it (50% roll per worldTick, wander-first). The
  corpus cannot measure this channel (no position track), and
  the random-walk return probability within a ~4-part linger
  window is small. It is a consolation, not a mechanism.
- Return: when `partsAway >= away.duration`, `npcNodeTravel`
  teleports the hunter home and deletes the away entry. The
  objective is then stale (`'out'` with no away entry), so
  `objTick` marks it done/idle and the villager re-picks — with
  the memory already spent, so that beast is never re-offered
  unless a new fight re-records it. The full arc — pick, delay,
  empty tile, linger, home, forget — is one spent memory for
  zero meetings, and it reads nowhere.
- Cost of the arc in needs: the walk charges +3 hunger / −4
  energy per away part (fixture Case 1: hunger 24→27, energy
  64→60 on the single arrival part). Linger burns the same
  charge per part while standing on an empty tile. An arrival
  fix that extends trips without a clock bound manufactures
  hunger — the design below therefore keeps the clock unchanged.

## Diag 5 — corpus re-analysis (read-only; the 91% stands)

Tool: `scripts/analyze-arrival-a.js` over the sim-funnel-a corpus
(16 rows, `evidence/2026-10-29/perseed-funnel-a/`), no new sim.
Headline discipline: returns-a's distinct-record count is the
band truth; join counts are reported only with their artifact
note, never as a revision.

- HUNT departures (all waves): 326. Distinct true drops
  (empty-tile arrivals): 297 = 91.1% — returns-a's 91% STANDS,
  not revised. Greedy join matched 291 departures to drops with
  6 true drops unmatched: the join artifact is fully explained
  (a departure that never arrived steals a later trip's drop;
  a double-drop after a re-fight leaves a drop no departure
  consumes). Any future arrival analysis must count distinct
  drops AND join with consumption, and must say which number it
  is quoting — the returns-a "911 calls vs 297 spends" trap has
  now grown a second edge.
- Wave-4 slice, unchanged: 1 departure, 1 drop, 0 meetings.
  Departure → meeting: 0/1. The band's only wave-4 attempt still
  ends at an empty tile.
- Present-arrival fights (no-drop departures with a same-beast
  meeting within 10 parts — the plausible present-arrival set):
  4, ALL waves 1–3 (gavel wave-3, paparazzo wave-2,
  nightlight_catfish wave-1, hushwolf wave-1), ZERO wave-4.
  Even the arrivals that find a beast almost never convert to
  a wave-4 meeting — consistent with Diag 2's ≤32.5%/tick fight
  gate, though n=4 cannot prove the split between
  wandered-first and roll-lost.
- Need state at arrival is NOT computable from any corpus: the
  funnel pick records carry gates only (armed / sheltered /
  postFleeResting / maxD), and departure/drop records carry no
  need fields at all. This is the grudge-audit recorder gap,
  confirmed again from the other side. Fixture + code reading
  (Diag 4) is the only need-at-arrival evidence this arm has;
  the building arm's arrival recorder must capture hunger,
  energy, fear, pantry, and waterDays at departure AND at drop,
  or its cost bars will be unverifiable.

## Diag 6 — perception-lawful signals: what COULD exist, ranked

Nothing exists today. The monster record (`spawnWorldMonster`)
is `{id, tx, ty, wave, mx, my, size, hp, maxHp, stance,
fearTurns, veteran, variant, lostSight}` — no previous tile, no
trail, no last-seen stamp. `wanderWorldMonsters` overwrites
`tx/ty` without history. Any following design must first STORE
something; the question is only what storage is sense-lawful.

1. TRACKS / FOLLOWING (first). The hunter stands ON the tile
   the beast left. Ground sign at their feet is a same-tile
   sense — the same class as `mapmemNoticeNode` noticing what
   is on the node they stand on. If the beast's last few tiles
   are stored (ordered, newest last), the hunter can step to the
   tile AFTER their own tile in the trail: one tile onward,
   learned from the ground, never from a list. Bounded by
   construction (trail cap, follow cap, clock unchanged,
   tightness respected, keyed to huntMid only). This is the
   design below.
2. SOUND / ADJACENT HEARING (second). A beast on an adjacent
   tile could be heard — but the code has no monster-noise
   events and no sound radius, so this is a new perception rule
   (adjacent-tile check keyed to huntMid), not a read of an
   existing signal. Weaker than tracks (no direction history;
   four adjacent tiles, no trail to choose between) and it
   still needs the forbidden arrival block to act. Viable as a
   fallback if tracks prove unworkable; not the first build.
3. ASKING (third). Gossip today carries actions and days, never
   tiles — there is no position-gossip channel to ask through.
   A villager telling the hunter where THEY saw the beast would
   be lawful second-hand knowledge (people talk), but it is a
   new social channel plus the same forbidden arrival-block
   re-target. Most machinery for least certainty; last.
- REJECTED, explicitly (so the building arm does not smuggle
  them in): (a) `nearestWorldMonster` live lookup — the helper
  exists in game.js (used by patrols) and handing it to the
  hunter's decision would be a radar: the beast's live position
  with no sense behind it. Perception law forbids it. (b)
  Longer linger without signal — more standing on empty tiles
  at +3 hunger/−4 energy per part. (c) Not spending the memory
  on empty arrival — the same empty trip re-offers forever.
  (d) Slowing beast wander globally — the living world retuned
  to fix one errand, with unmeasured side effects everywhere.
  (e) Reaching past the 3-day freshness gate or the roaming
  range to "fix" arrivals — gating freeze; not an arrival fix.

## Design — the trail-follow (build-ready, for the owning lane)

Two pieces, frozen together. Neither alone is a landing.

PIECE A — trail store (game.js, `wanderWorldMonsters` +
`spawnWorldMonster`; the only piece outside the forbidden file,
and useless alone): each world monster carries `trail`, an
ordered list of the last 3 tiles it occupied (newest last),
updated on every wander step (and on mFlee relocation, same
shape — a fled beast also leaves ground sign). No timestamps
are needed: freshness is trail length, not wall time — if the
hunter's tile is not in the trail, the trail has aged out and
there is nothing to follow. Cap 3 keeps the store trivial and
the follow bounded. `removeWorldMonster` drops the trail with
the beast; dead beasts leave corpses (existing system), not
trails.

PIECE B — follow rule (`villager-objectives.js`, `objAwayStep`
arrival block; THE forbidden file — this is the stop): on the
arrival block, when the quarry is gone, BEFORE spending the
memory:

- Find the hunter's tile in the quarry's trail (the quarry is
  found by huntMid in the world list — NOT by live position:
  the trail is read from the beast's record only to extend a
  hunt the villager already owns; the hunter never learns a
  tile they did not stand on or follow to. If the beast is dead
  or despawned, there is no trail and the rule does not fire).
- If found AND a next tile exists in the trail AND follows-used
  this trip < 2 AND the next tile is within the objective's
  tightness of haven AND the trip clock still runs: re-target
  the objective to the next tile (`o.tx/o.ty = next`,
  `followsUsed++`), narrate the follow (below), and do NOT
  spend the memory — the hunt continues. The arrival block's
  re-fire loop then checks the new tile on later parts, so a
  second follow (cap 2) works the same way.
- Otherwise (no trail, trail aged out, follow cap hit, next
  tile out of tightness, clock expired): spend the memory
  exactly as today AND narrate the gone beat (below). The
  spend rule is unchanged in every case the follow cannot fire
  — today's behavior is the fallback, not a removed path.
- Bounds that must not be re-tuned mid-run (prereg-frozen):
  trail cap 3, follows cap 2 per trip, trip clock UNCHANGED
  (`partsLeft` is never extended by a follow — a follow that
  never ends is a starvation trap), tightness respected (a
  follow never walks beyond the radius the pick allowed),
  huntMid-keyed only (the hunter follows THEIR beast's trail,
  never any beast's), no gate retune anywhere (3-day freshness,
  roaming range, departure gates all untouched).
- Narration (design text; the lines live in the same forbidden
  block, so they travel with it): follow — `"The ground here
  is churned — it went that way. Following."` (descriptor for
  the beast, never the true name pre-System, same knowledge
  gate as the departure line); gone — `"Nothing here. It was
  here — the ground says so — and now it isn't."` Honest
  limitation, stated now so it cannot be re-scored away: `say`
  lines are heard by a haven-present player (same limitation
  as the departure line — returns-a narration blank, unchanged
  by this arm). The ghost/narration arm owns absent-player
  audibility; this arm owns the decision, not the broadcast.

What this design deliberately does NOT do:

- No live-position use: the trail is history, never the beast's
  current tile handed over. A hunter who follows to a trail
  tile the beast has since left finds the same empty-tile
  logic again (trail aged out → spend + gone beat). Follows
  raise the meeting chance; they never guarantee it.
- No lottery change, no weight change, no gate change. This arm
  moves arrivals, not picks — the lottery arm's held design is
  a separate decision, and if it lands first, wave-4 departures
  (and therefore wave-4 arrival conversions) will rise for
  reasons this prereg must not claim.
- No party change, no damage change, no kill-side change. A
  follow that meets a beast still needs a party that can
  finish it (returns-a rank #3, unchanged).

## Draft preregistration (UNJUDGED — for the building arm)

Ready to be committed verbatim as the building arm's prereg
BEFORE its pilot. It is NOT in effect now: no judged run has
been made under it, and this arm will not run one. If the
building arm changes any line, it must re-freeze and re-commit
before its first judged row; a miss under it is NO-GO, never
re-scored.

- Substrate: tableseat-nowait, 180d death-aware, as in
  returns-a / funnel-a.
- Pilot band: seeds 75101–75108 (8 seeds). Confirm band if
  pilot GO: seeds 75101–75116 (16 seeds). Control =
  identical-seed paired tables on the pre-change code
  (MEASUREMENT.md §15 substitute; balance-panel has no
  census-ingest mode — no panel artifact to be faked).
- Game change (frozen): Piece A + Piece B above and nothing
  else; trail cap 3, follows cap 2 per trip, clock unchanged,
  tightness respected, huntMid-keyed only; no gate, weight,
  pre-gate, wander-rate, or fight-roll change anywhere.
  Proof tests before pilot: (i) trail-store fixture (wander
  steps append in order, cap 3, dead beast drops trail);
  (ii) arrival fixture (empty+trail → follow re-target, no
  spend; empty+no-trail → spend + gone beat; present → memory
  kept; different-beast → spend; follow cap → spend on third
  empty; clock never extended by a follow); (iii)
  `node scripts/check.js --quick` green (with the
  --cacheDirectory rule from the assignment).
- Recorder (required before pilot — current recorders cannot
  see follows): extend the returns/funnel recorders (or a new
  arrival recorder) to log per HUNT trip: departure (needs at
  departure), each arrival-block firing (tile, beast present?,
  trail length, follow taken? to where, follows-used), each
  spend (with needs at drop), and each same-beast meeting
  within 10 parts of an arrival/follow (the DELIBERATE test
  joins travel + memory as in returns-a, never from outcome).
  Without this, the primary below is unmeasurable — the
  building arm must not judge from drop counts alone.
- PRIMARY (pilot GO requires ALL): (i) deliberate meetings
  arising from arrivals on the pilot band EXCEED the control
  band count (identical seeds; "arising from arrivals" = a
  DELIBERATE-class meeting per returns-a, with a recorded
  arrival or follow for that beast within the 10 preceding
  parts); (ii) at least one such meeting is DELIBERATE-class
  (travel intent + prior memory, both pre-meeting — never
  inferred from outcome). Judged on ALL waves: wave-4
  departures on 8 seeds may be ~0–1 while the lottery arm is
  held, so a wave-4-only primary would be untestable through
  no fault of arrival — wave-4 conversions are reported
  diagnostically, and the coordinator may, BEFORE committing
  this prereg, split the primary (all-waves leg vs wave-4
  leg) in the open. That is a coordinator call, not a mid-run
  revision.
- COST BARS (pilot GO requires ALL): starvation deaths ≤
  control + 2 on band totals; zero need-override behavior
  attributable to the change (a follow extends no trip clock
  — verified in proof test (ii) — and no follow step is taken
  from a departure the pre-gates would have blocked;
  mid-trip follows cannot override a pick-time pre-gate by
  construction, verified from the recorder's need fields);
  wall not worse than control on wins and on national-ever.
- DIAGNOSTIC (reported, not deciding): empty-tile arrival rate
  (distinct true drops / HUNT departures — must fall only via
  follows that meet, never via redefinition of a drop);
  follow rate and follow→meeting conversion; arrival→meeting
  conversion by wave; linger parts per empty arrival; need
  state at departure vs at drop (hunger/energy deltas).
- Honest warning, recorded before any run so it cannot be
  re-scored away: follows raise arrival→meeting conversion;
  they do not guarantee meetings (trail tiles go stale the
  same way remembered tiles do, and the ≤32.5%/tick fight gate
  still applies on arrival). If the pilot moves follows
  clearly but meetings stay 0, the verdict under this prereg
  is still NO-GO on the primary, and the correct next step is
  the adjacent-hearing fallback (Diag 6, rank 2) or the
  lottery arm landing first — not a bigger trail cap. The
  coordinator may choose, BEFORE committing this prereg, to
  add a follows-taken leg as a secondary GO — that is a
  coordinator call to make in the open, not a mid-run revision.
- CONFOUND (standing, from the assignment): Loop A's lottery
  lever may land on master mid-run and move departure/take
  rates. If master moves under the building arm, it rebases
  onto the new master, re-runs proofs, and re-checks its
  arrival baseline before judging — never judge arrival
  numbers across a lottery change without saying so. The same
  applies to any fixall-map landing touching `objAwayStep`
  (the file owner): rebase, re-run proofs, re-check baseline.

## What was NOT done (so the coordinator is not misled)

- No `src/js` diff on this branch from this arm (verify with
  git status / git diff before merging the evidence + probe +
  analyzer below). The branch's only prior src-adjacent content
  is the lottery arm's probe + evidence (rebased onto current
  master this run — see "Rebase note").
- No pilot, no confirm, no wall numbers, no conversion claim
  beyond the corpus re-analysis above (which re-reads the
  funnel corpus, not a new sim band — its percentages describe
  the band as recorded, not a changed game) and the fixture
  probe below (single-villager, single-memory audit fixtures,
  not sim bands).
- No funnel/returns re-run (the corpora were read, not
  reproduced). No sim-w4dpr2 or sim-lottery-a recovery, no
  touch of any other worker's tree or branch, no merge, no
  push, no version bump, no live check.
- No change to any forbidden file, no change to docs/MAP.md,
  no change to storage.js or villager-build.js.

## Rebase note (confound check, this run)

Master moved under this arm during the run (journey r63
032dff51c and establishment r56 74419616c landed, among
others). Per the assignment, the branch was rebased onto
current master before any new work: the rebase replayed the
single lottery-arm commit cleanly (new tip d33636400, same
message), the tree verified clean, and the arrival diag was
re-checked against the new master. Two findings: (1) NO Loop A
lottery landing is on master (master log grep for lottery
shows only the old killed sim-huntfix-b) — the confound has
not fired yet; (2) master's `villager-objectives.js` change
since the branch base is ONLY the fixall-map slice-2
beyond-board meander guard (home-board walkers keep their
exact old wander; only beyond-board returners skip meander) —
the arrival block, the departure teleport, and every number
cited here are unchanged on current master. Baseline for the
building arm is therefore the returns-a/funnel-a band as
cited, not a moved target.

## Files in this delivery (worktree gaps-grudge)

- scripts/test-arrival-a.js — diag probe (ARRIVAL-DIAG PASS:
  Case 1 empty arrival silent + memory spent + objective stays
  out + teleport departure; Case 2 present arrival keeps
  memory; Case 3 different-beast arrival spends; Case 4a danger
  converts HUNT to HAVEN_CHORE, 4b heal sat-out delays, 4c sick
  delays, 4d heal-check report; Case 5 wander 647/1000 stays
  + 0.65^k table; node --check clean).
- scripts/analyze-arrival-a.js — read-only corpus re-analysis
  (distinct true drops 297/326 = 91.1%; join-matched 291 with 6
  unmatched + long-lag misattribution explained; walk lag
  median 1 part; wave-4 pick→depart median 1 part, max 8, n=5;
  4 soon-meetings, all waves 1–3, 0 wave-4; node --check clean).
- evidence/2026-10-29/sim-arrival-a.md — this file (diag +
  design + draft prereg).

## Commits

- Branch tip and hashes are in the worker's report to the
  coordinator (this file + probe + analyzer commits together);
  the tip at report time is the authority.
