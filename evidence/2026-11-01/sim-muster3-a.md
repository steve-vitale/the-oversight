# sim-muster3-a — third-cluster muster hunt: a second refusal seed, and it BOUNDS the headline (MEASUREMENT ONLY)

Run: Loop A worker, axis scale-onramp, run fleshout-loop-a-20261101T1742Z,
arm sim-muster3-a (ADOPTED mid-run: predecessor killed by a runtime
transport error, sqlx pool timeout — not by its work; adoption verified
commit e9c73dfeb, then rebased, see Base note below).
Worktree branch: sim-muster3-a.
Base anchor: per-seed JSONs (`anchorCommit` field; sweep ran on worktree
HEAD 7f8758560 at sweep time). Base note, stated plainly: master moved
twice under this run. (1) At adoption, master had moved past the prereg
base b33a9a9a4 to 7f327aed5 (Loop B evidence + one new policy file, zero
src/js, zero changes to this arm's policy stack) — the branch was rebased
onto it BEFORE any judged sim, and proofs re-run 26/26. (2) After the
sweep, master moved to 9a765cd54 (journey-establishment r73 driver +
analyzer + heartbeat log, measurement only, zero src/js, zero policies,
zero docs — diff verified) — the branch was rebased onto it AFTER the
sweep, proofs re-run 26/26 on the new tip. The sweep numbers below are
judged on 7f8758560; the 9a765cd54 move changes no game or policy code,
so the substrate is identical, but the anchor field in the corpus still
reads 7f8758560 and that is the honest anchor for these numbers.
Pre-registration: evidence/2026-11-01/sim-muster3-a-prereg.md (committed
BEFORE any judged sims by the predecessor; judged against it below; no
bar was changed by this adoption).
Instrument: scripts/herald-instrument-20261030.js (HERALD=1, verbatim
reuse) + scripts/policies/muster-diag.js (MUSTER=1, verbatim reuse) +
scripts/muster3-screen-20261101.js + scripts/muster3-sweep-20261101.js +
scripts/muster3-split-20261101.js + scripts/muster3-analyze-20261101.js
+ NEW scripts/muster3-replay-20261101.js (post-block only, written by
the adopting worker — the predecessor's commit did not include it, and
the prereg specifies it; it prints one JSON line to stdout, split by
the idle splitter, unlike mustercall-b's replay which wrote its file
from the game process).
Proof: scripts/test-muster3-20261101.js — 26/26 green (synthetic
fixtures only; no band seeds), re-run on the rebased tip before
reporting, plus the corpus determinism leg below.
Corpus: evidence/2026-11-01/perseed-muster3/ (screen.stdout/stderr,
screen-90101-90140.json, pilot/confirm stdout+stderr, leadfeast/
s90101–s90140 judged files for the 20 selected seeds,
muster3-analysis.json, determinism.stdout/stderr,
replay-90111-postblock.json).
No game code changed. No policy file edited. No gate threshold moved.
No [needs-eyes] (measurement only, nothing player-facing). Panel (§15):
NOT APPLICABLE — single-base DIAG measurement, no before/after
comparison exists in this arm; none fabricated (same declaration as
mustercall-b/2 and heraldcontact-a).

## Verdict: DIAG-GO-SINGLE-CLUSTER (caveated GO, not full GO)

Judged exactly against the prereg's band rule:

- Completeness: 22/22 refused Herald attempts joined to complete
  muster snapshots = 100% (>= 95% required).
- Cross-check (i) game-side refused outcomes records: 22/22 join
  to a REFUSED attempt on the same titan and day = 100%
  (>= 95%).
- Cross-check (ii) ready-manual vs ready-game agreement: 22/22
  = 100% (>= 95%).
- instrumentErrors: 0 on all 20 seeds (herald + muster-diag).
- Usable judged seeds: 20 (>= 8 required).
- Refused states on exactly 1 seed (90111, pilot tier A) — so
  this is DIAG-GO-SINGLE-CLUSTER, not full DIAG-GO (which needs
  >= 2 refusal seeds in-band). The census is complete, but
  band-internal generalization stays unanswered; the cross-arm
  tally below is reported alongside, never substituted for it.
- Verdict sections (a) Q1 census, (b) Q2 asymmetry + kill-outcome
  judgment, (c) Q3 decision brief as far as the new census
  supports it (no new routing proposed — #1538 still pending),
  (d) wall numbers: all present below, with the single-seed
  caveat carried in the headline.

## Generalization bars (binding, judged here)

- G-BOUNDED (not G-GENERALIZES, not G-CONTRADICTS). Refusals on
  exactly 1 seed in this band, AND that seed's cluster rows
  differ from mustercall-b's pattern in the yield range: omen
  stage 2 with the call offered matches mustercall-b, but call
  yields are 3 on every snapshot (mustercall-b: 5 early, 9
  late), and ceilings reach 10 on ZERO refusal days
  (mustercall-b: five of nine days). The difference is named,
  not smoothed: it is free-face availability, not trust, quota,
  or arrears (see Q1). A bounded result still passes
  DIAG-GO-SINGLE-CLUSTER because the completeness bars hold;
  it bounds the headline instead of generalizing it.
- Cross-arm tally (reported alongside, never substituted for
  the band bars): distinct refusal seeds across mustercall-b
  (85106) + mustercall2-a (none) + heraldcontact-a (none) +
  this arm (90111) = 2. The hunt's underlying question — a
  second cluster seed anywhere — is now answered YES, and the
  second seed contradicts the yield range while confirming the
  omen-2/offered-button shape.

## Answer in one paragraph

The third hunt found its contacted seed — and the second cluster
seed breaks mustercall-b's yield story while confirming its
shape. On seed 90111 the Herald refuses 22 times over days
87–89, all at omen stage 2 with the call button offered, all
wild-contact, all have 0 / need 10, muster never created — but
a sounded call would bring only 3 blades, and even with all 3
Haven commits the ceiling tops out at 6, never reaching the
10-gate. The coalition looks strong on paper (three allied
villages, all trusted, all quota 6) and is empty in practice:
only Emberhold has free faces (3); Stonebridge and Thornfield
have zero free faces on all 22 snapshots, so their quota-6
tiers yield nothing. The post-block proves it is not a
snapshot-arithmetic error: sounding the call at the first
day-87 refusal brings exactly the predicted 3 allies, two
commit taps stage and commit 3 Haven blades, and the muster
still reads NOT READY at 6/10 — and zero later Herald fights
start. Mustercall-b's "offered and reachable" headline is
therefore bounded, not generalized: offered, yes, on both
seeds; reachable, only on 85106. On 90111 the gate is not
reachable by pressing the buttons at all, and the blocker is
not the gate, the button, trust, or debt — it is allied faces
not being free.

## Pilot gate (contact-gated, 8 seeds before any confirm spend)

Pilot GO — the gate passed on a real contact, not on omen
alone:

- Instrument fired on all 8 pilot seeds, instrumentErrors 0,
  per-seed JSONs valid (days > 0, census sorted).
- Herald CONTACT on >= 1 pilot seed: seed 90111 (tier A) —
  22 scholar-channel attempts (all REFUSED), 1 villager field
  fight, 22 muster snapshots, 0 muster verbs. The contact
  definition is met three ways over on one seed.
- The tightening proved its worth a second way: 6 of the 8
  pilot seeds ended at omen stage 2 with ZERO Herald contact
  (90114, 90121, 90124, 90132, 90139, 90101). Under an
  omen-accepting gate those six would have "passed" identically
  while saying nothing about contact; the contact gate is what
  singled out 90111 as the seed that could answer the census.
- Confirm therefore ran: all 12 remaining selected seeds
  (6 tier B + 6 tier C), per the prereg's "confirm = all
  remaining selected" rule — no heraldcontact-a confirm-size
  deviation recurred.

## Step 1 — longevity screen (selection probe only, NOT judged sims)

Screen policy = census policy stack exactly, NO recorders,
longevity fields only. 40 seeds (90101–90140), all usable.
Predecessor's partial screen (5 seeds, killed mid-run) was
DISCARDED, not treated as judged data; the full screen was
re-run on the rebased tip in one foreground exec
(stdout→file + stderr→file, idle splitter). Selection applied
mechanically per the prereg order (tier A seed-asc, then
tier B seed-asc, then tier C gameDays-desc):

- Tier A (un-won, >= 120d): 90111(154), 90113(201), 90114(201),
  90121(182), 90124(134), 90132(141), 90139(164) — 7 seeds.
- Tier B (won, > 120d): 90101(159), 90102(184), 90106(127),
  90117(172), 90119(157), 90126(144), 90129(135) — 7 seeds.
- Tier C (un-won, longest first): 90116(110), 90140(88),
  90127(87), 90105(52), 90118(31), 90137(25) — 6 seeds.
- Excluded (won on/before day 120): 20 seeds, 11 of them won
  on exactly day 90 — the day-90 win cluster persists on this
  stack (11/40 screen seeds), same censor as mustercall2-a
  and heraldcontact-a.
- Pilot = first 8 selected: 90111, 90113, 90114, 90121, 90124,
  90132, 90139, 90101 (7 tier A + first tier B).
- Confirm = all remaining selected: 90102, 90106, 90117,
  90119, 90126, 90129, 90116, 90140, 90127, 90105, 90118,
  90137 (6 tier B + 6 tier C).
- Screen-pool numbers (NOT judged): won 27/40, national 22/40,
  table 27/40, wave 4 reached 28/40, wave 5 reached 0/40, omen
  stage 2 at end 17/40, median survival 95 days, max 201.
- Screen-vs-sweep agreement (prereg's same-base leg):
  20/20 judged seeds agree EXACTLY on gameDays, won, national,
  table, and maxWave between the recorder-free screen and the
  recorder-carrying sweep. The recorders do not move
  trajectories on this band.
- Corpus determinism leg (prereg's same-base leg): seed 90111
  re-run through the stdout runner reproduces its judged
  pilot stdout line BYTE-IDENTICALLY (stderr summary also
  identical: 22 attempts, 22 refused, 1 field fight, same
  days/end).

## Q1 — the census: every refused scholar-channel Herald state

Policy stack on every seed (identical to mustercall-b/2):
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))`,
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200d death-aware cap. All 22 refusals: seed 90111,
caller wild-contact (monsterTurn hungry contact), reason
MUSTER-GATE, have 0 / need 10, muster never created. No other
seed refuses, fights, or field-fights the Herald at all.

Per-cluster table (cluster = seed, day, omen stage, call yield,
commit-block; ceilings = call yield + commit addition):

| Day | Omen | Call yield | Ceiling (call+commit) | Commit block | Call offered | Re-faces | Volunteers |
|---|---|---|---|---|---|---|---|
| 87 | 2 | 3 | 5–6 | UNBLOCKED | yes | 6 | 4 / 2 |
| 88 | 2 | 3 | 5 | UNBLOCKED | yes | 8 | 2 |
| 89 | 2 | 3 | 5–6 | UNBLOCKED | yes | 8 | 7 / 2 |

Totals: 22 refusals over 3 days (first day 87, last day 89);
max 8 refusals on one day (days 88, 89); median gap between
consecutive refusal days 1 day; muster events between first
and last refusal: 0. Haven blades valid: 0 on all 22 snapshots;
ready-manual: false on all 22 (the gate is unmet only because
no muster exists, not because a muster fell short — the
printed have is 0 throughout). The refusal line is
character-identical on all 22 snapshots (see Sense-testing).

Per-village quotas (same three active links on all 22
snapshots; only free-face counts move — trust/opinion/arrears
are flat across the window):

- Emberhold: trust 91, opinion 42, arrears 0, quota 6
  (trusted tier), 3 free faces, wouldYield 3 every time.
  The ONLY yielding link.
- Stonebridge: trust 84, opinion 46, arrears 0, quota 6
  (trusted tier), 0 free faces, wouldYield 0 every time.
  Trusted, entitled to send 6 — and sends nothing, because
  no face is free.
- Thornfield: trust 88, opinion 42, arrears 0, quota 6
  (trusted tier), 0 free faces, wouldYield 0 every time.
  Same story as Stonebridge.

Commit-block reasons across the 22 snapshots: UNBLOCKED 22.
NO-VOLUNTEERS: 0. NO-OMEN: 0. OMEN-STAGE-LT-2: 0. HAVEN-CAP: 0.
The commit is never blocked here — volunteers are 2–7 — but
it does not matter: 3 + 3 = 6 is the ceiling even with a
full commit, so the gate is unreachable on every refusal day,
blocked or not. That is the third distinct ceiling shape in
this census chain: muster-a's feast-drawn 2 (omen null,
buttons never offered), mustercall-b's 5→9 with ceilings
>= 10 on five days (trusted maturation + arrears refusal),
and now 90111's flat 3 with ceilings 5–6 (trusted everywhere,
faces free nowhere but Emberhold).

Is mustercall-b's "5 then 9, ceilings >= 10 on five days"
the rule or one state? BOUNDED, on this band's evidence: it
is the 85106 state, not the rule. The 90111 state shares
mustercall-b's omen-2/offered-button shape and breaks its
yield range and its reachability. Any future citation of the
muster ceiling must now carry BOTH seeds: 85106 (call 5→9,
gate met on five days with commit) and 90111 (call 3, gate
never met even with full commit). Quoting either alone as
"the" ceiling is now wrong.

## Q2 — channel asymmetry on the same band

| Channel (seed 90111, Herald only) | Attempts / fights | Outcomes |
|---|---|---|
| Scholar TB (startCombat) | 22 attempts, 0 fought, 22 refused | all MUSTER-GATE, have 0/10 |
| Villager field (fieldFight) | 1 fight | 1 vFlee, 0 vKill |
| TB kills of Herald | 0 | — |
| Field kills of Herald | 0 | — |

Field-fight detail (this band's own capture): day 92 Henry
Zhang vs the Herald ("First Omen" in the fight log), 2 rounds,
dealt 26, took 46, fled at 54 HP (Herald at 499 HP after the
fight). The field fight comes AFTER the refusal window
(days 87–89), not interleaved with it as on 85106 — the
village's one wild meeting with the beast happens once the
scholar's refusals have already stopped.

Does the asymmetry change any kill outcome? NO, on either
side of the counterfactual:

- Excluding refused TB attempts changes no kill count: TB
  Herald kills are 0 with or without the refusals (no TB
  Herald fight ever starts).
- Gating field fights the way TB is gated would change no
  kill count either: the 1 field fight would become a
  refusal (the muster is never ready in the judged run),
  and field Herald kills would stay 0. What gating the
  field would remove is real fought content — one losing
  fight in which a villager dealt damage and ran — not kills.
- The asymmetry's live effect here is therefore the same
  shape as mustercall-b's but thinner: the field channel
  lets one villager touch the beast and run, while the
  scholar channel refuses every meeting. With only one
  field fight, no HP-trajectory claim is made (contrast
  mustercall-b's 420-HP gap question — no such gap is
  measured or needed here).

FEAST-DRAW REGRESSION CHECK: 0 feast-draw Herald attempts,
0 cast-sourced Herald faces. #1550 holds on this band
(checked, not duplicated, not re-claimed).

Band-wide wave-4 context (Herald share of it is the story):
118 wave-4+ TB attempts, 51 wave-4 field fights, 13 wave-4
kills across the 20 judged seeds — wave-4 content is NOT
absent on this band. The Herald's share of all of it: 22
refused attempts, 1 field fight, 0 kills. The emptiness is
Herald-specific, as in mustercall2-a/heraldcontact-a.

## Q3 — decision brief: only as far as the new census supports it

No new routing is proposed (per the arm brief: #1538 still
pending a ruling, and this is a census, not a build). What
this census supports, ranked:

1. DIRECT REFUSED FACE (scholar's own eyes) — still the
   strongest perceivable channel, but its yield on THIS
   census is a muster that still refuses: sounding the call
   at a day-87 refusal brings 3 allies, committing all 3
   Haven blades reaches 6/10, and the next contact refuses
   again (post-block: 0 fought, 30 refused after sounding).
   The #1538 decision therefore splits in two on this
   evidence: (a) whether a refused face sounds the call —
   perception law satisfied, offer gate satisfied, as on
   85106; and (b) what a sounded-but-short muster means —
   on 90111 the routing question is not "re-sound after a
   lost fight" (no fight ever starts) but "what does the
   village do when the call it was told to sound is not
   enough?" That question did not exist on 85106 and is
   now the open one for this channel. No routing is built
   here to answer it.
2. LOCATED OMEN (scouts' report) — same states, same
   ceiling: a stage-2 call sounds to the same 3 + commit =
   6. Timing does not fix it (unlike 85106, where waiting
   for Thornfield's maturation lifted the yield): the
   90111 coalition is already fully trusted on day 87 and
   the yield never moves across days 87–89.
3. WAR COUNCIL INTEL (stage 2, camp) — SUPPORTING, not a
   call. It informs the call decision; on this band an
   honest council line would have to say "3 blades answer,
   commit 3 more, and the gate still does not open" — the
   refusal line's arithmetic ("you have 0") hides that
   shortfall exactly as it hid 85106's sufficiency.
4. VILLAGER FIELD FIGHT, VIA GOSSIP — WEAK, unverified as a
   scholar trigger (same caveat as mustercall-b: no gossip
   receipt measured). One field fight exists here (day 92,
   after the refusals), so it cannot have triggered
   anything in the refusal window anyway.
5. FEAST-DRAW FACE — CLOSED on this base, do not reuse
   (0 attempts, #1550 holds).
6. CAMPAIGN AUTO-CALL — NOT A HERALD CHANNEL (finale /
   network only, as in mustercall-b).

New upstream question for the coordinator (measurement, not
build): why do two trusted, quota-6 links show ZERO free
faces on all 22 snapshots? Faces are evidently deployed
elsewhere (or otherwise unavailable) while the coalition
looks fully mature. Free-face availability — not trust,
quota, or arrears — is the binding constraint on this
seed, and no instrument in this census chain measures where
those faces are. A future arm on this channel should
instrument face deployment before proposing any routing
that assumes a sounded call yields its quota.

## Post-block counterfactual (NOT judged, clearly separated)

Replay of seed 90111 on the full sweep stack (script
scripts/muster3-replay-20261101.js, output
perseed-muster3/replay-90111-postblock.json). HOW IT WAS
DONE, exactly: in the replay only, never in a judged sweep,
Game.startCombat was wrapped post-return so that at the
first day-87 refused Herald attempt it called
Game.soundTitanCall('herald') once and then
Game.titanCommitOwn('herald') twice, then the run continued
unmodified. No policy in this arm sounds calls; the judged
sweep never calls a muster verb (verb counters 0 on all 20
seeds).

- Predicted call yield 3 = actual allies 3 (Emberhold's 3;
  Stonebridge and Thornfield yield 0, as the snapshots
  predicted — no refusals aloud, simply no free faces).
  Snapshot arithmetic validated exactly, second seed
  running.
- Commit: first tap stages ("confirm"), second tap commits
  3 Haven blades. Haven after commit: 3 (state read; note:
  the second commit call's returned object shows an empty
  haven array while the state read gives 3 — the evidence
  quotes the state read, and ready is false under either
  reading, since 3 + 0 is still short).
- Ready after: FALSE (3 allies + 3 Haven = 6 < 10).
- Same run, later Herald attempts: 0 FOUGHT, 30 REFUSED
  (days 87–91; the replay trajectory diverges from the
  judged run, which ends village-lost day 154 with last
  refusal day 89 — the replay ends over-other day 101, and
  the replay is not a second census).
- Lesson, sharpened against mustercall-b: pressing the
  buttons works, but on this band it does not even start
  the fight. Mustercall-b's post-block proved "reachable
  once, then the question recurs after a loss"; this
  post-block proves "not reachable at all by buttons, and
  the question is what a short muster means." The muster
  object persists to the replay's end (allies 3, Haven
  blades 0 at end) without ever producing a fought Herald.

## Sense-testing: the refusal line after the first telling

Read: first-refusal say-ring slice (day 87, the instrument's
captured transcript) plus the late-repeat evidence from the
snapshots. (Instrument note, honest: the herald instrument
captures the first-refusal transcript slice only; no
second say-ring slice is captured for the late refusals.
The late-repeat judgment below rests on the snapshot
sayText field, which is character-identical on all 22
snapshots — that identity IS the late telling, even though
it is not a second transcript capture. See metric review.)

- The line is character-identical on day 87 and day 89:
  "⛔ THE HERALD does not notice you the way prey notices a
  hunter. It notices you the way weather notices a field.
  You cannot face this alone — sound the call, muster 10
  allied blades (you have 0). This is not courage. This is
  arithmetic." The numbers never move (have is always 0
  because no muster exists), the line never acknowledges
  that this is the twenty-second arrival, never mentions
  that the call button is sitting in the camp bar, never
  mentions that sounding it would bring only 3 blades
  against a need of 10.
- Between refusals the scholar waits ("You wait. The light
  changes. Nothing asks anything of you."), hauls, does
  camp chores — the same pattern herald-b and mustercall-b
  recorded.
- Judgment: the line was honest once and then a stuck
  record — and on THIS band it is a stuck record with a
  crueler edge than 85106's. On 85106 the unpressed button
  hid a sufficient remedy (9 + commit = ready); here the
  unpressed button hides an INSUFFICIENT one (3 + commit
  = 6). A person reading the twenty-second refusal would
  not think "we are too weak" or "why haven't I pressed
  the button" — she would think, if she pressed it, "we
  called, and we are still short, and the line still says
  0." The sense failure is no longer just repetition or
  just an unpressed remedy: it is a prescribed remedy whose
  insufficiency is never narrated, on either side of
  pressing it.
- What reads like people: Henry Zhang's day-92 field fight
  (fights two rounds, takes 46, runs at 54 HP) and his
  later wave-4 fights (eulogy day 116–117 fleeing at 23 then
  5 HP; reunion, influencer fights the same week) — a
  villager repeatedly fighting hurt and running while he
  still can, coherent across days. The village's wild
  fighters act sensibly; only the scholar's refusal loop
  does not learn.

## #1550 status (checked, not duplicated)

LANDED in this base: commit 72512906f, exclusion code
present in src/js/game.js castMonster in this worktree
(TITAN EXCLUSION comment + titanIds filter). Measured
holding on this band: 0 feast-draw Herald attempts, 0
cast-sourced Herald faces. This arm does NOT re-build #1550
and does NOT claim it; the holding check is the only #1550
statement made here.

## Wall numbers (judged band, this base — no old bank quoted)

- Seeds: 20 (pilot 8 + confirm 12, single policy stack above,
  200d death-aware cap; 2 seeds survived to the cap region
  at day 201).
- National: 8/20. Table reached: 7/20. Wins: 7/20. Wave 4
  unlocked: 14/20. Wave 5 unlocked: 0/20.
- Median survival: 142.5 game days. Max: 201. End reasons:
  won/over-other 7, village-lost 11, survived 2.
- Herald TB attempts by class and reason: 22 attempts, all
  REFUSED / MUSTER-GATE, 0 FOUGHT, 0 THROW. Herald field
  fights by outcome: 1 vFlee. Wave-4 kills by channel (band):
  TB 13 total across all wave-4 types, field kills counted
  in per-seed kills arrays (Herald: 0 both channels).
- Located-but-unfaced seeds (end omen stage 2, zero Herald
  contacts): 10/20 — 90101 (window 16d), 90102 (100d),
  90114 (17d), 90116 (40d), 90121 (46d), 90124 (27d),
  90126 (12d), 90129 (5d), 90132 (2d), 90139 (73d). The
  100-day window (90102: located day 84, won day 184,
  never met) and the 73-day window (90139) are genuine
  no-meeting scarcity, not censoring artifacts; the 2- and
  5-day windows (90132, 90129) are censoring-adjacent.
  Contact, not the gate, remains the scarce thing on most
  seeds — and on the one seed where contact happens, the
  gate is unreachable by buttons.
- Death causes (recorded deaths in the 20 per-seed JSONs,
  696 total): combat 289, villager combat 169, the wild 110,
  expedition 39, monster 21, sickness 10, starvation 10,
  contest 10, ambush 8, the arena 6, wound 6, dehydration 3,
  named-monster causes 6. Combat dominates the late game
  on this band, as on heraldcontact-a's pilot.
- Band comparison (NOT a before/after — different seeds,
  moved base): mustercall-b's band was national 8/16,
  table 12/16, wins 11/16, wave 4 9/16, wave 5 0/16, median
  106.5, max 139. This band is lower on table/wins and
  higher on median survival — but the bands differ in seed
  composition (longevity-selected here, contiguous there)
  and base, so no improvement or regression claim is made.
  Wave 5 remains 0 on every band in this chain.

## Village assessment (plain words)

These villages mostly climb without ever meeting the Herald:
8 reach national, 7 win, and 10 of 20 end with the beast
located and unmet — some of them for 73 or 100 days, while
they fight other wave-4 monsters and win lesser seats. The
one village that does meet it (90111) is not weak: three
trusted allies, a located lair since day 66, a camp button
offering exactly the remedy the refusal line names. What it
lacks is not strength or knowledge but free faces — its
allies' fighters are busy elsewhere, so the call it is told
to sound brings 3 blades against a need of 10, and even
sending its own people (3 Haven blades) leaves it short.
The village then does what villages in this chain always
do: it keeps refusing, one villager fights the beast alone
and runs, and the village is lost on day 154 without the
Herald ever being fought by the scholar's party. The scale
wall, seen from this band, has two faces at once: for most
seeds the first door — a meeting — never opens, and for
the seed where it opens, the second door — the muster —
does not open either, because the coalition's strength is
on paper and its faces are elsewhere.

## Metric review (applies to the NEXT run, never a re-score of this one)

1. The contact-gated pilot gate BEHAVED again — and its
   value here was selection, not spend-saving: it identified
   the one contact seed among eight (the other six
   omen-2 pilot seeds were contactless), and the confirm
   then ran on the full remaining selection. Keep the
   tightening for any future contact hunt.
2. The longevity screen predicted windows but NOT contact,
   third confirmation (heraldcontact-a, then here): tier A
   supplied the contact (90111), tiers B and C supplied
   none, and 10/20 judged seeds still ended
   located-but-unfaced. A future hunt that wants contact,
   not just window, still needs the wave-4-unlock-plus-
   Herald-position instrument heraldcontact-a proposed —
   or it will keep buying long windows and finding mostly
   empty ones.
3. The confirm = all-remaining-selected rule REMOVED the
   heraldcontact-a confirm-size deviation: 12 confirm
   seeds, exactly the remaining selection, no shortfall,
   no unselected additions. Keep the rule.
4. Transcript capture gap: the instrument records the
   first-refusal say-ring slice only, so the late-repeat
   slice in this evidence rests on snapshot sayText
   identity (22/22 identical), not on a second captured
   transcript. A future arm wanting a late say-ring slice
   needs instrument support for it; the identity argument
   is sound for the refusal LINE, but say-ring context
   around a late refusal (what else the scholar hears
   that day) is unmeasured here.
5. Replay commit-return shape quirk: the second
   titanCommitOwn return object shows an empty haven array
   while the immediate state read gives havenAfter = 3.
   This evidence quotes the state read; ready is false
   under either reading (3 + 3 = 6, or 3 + 0 = 3, both
   < 10), so the verdict does not depend on resolving it
   — but a future replay should assert the return shape
   against the state read before quoting either.
6. Base-move handling (for the coordinator): the sweep's
   anchor (7f8758560) is NOT the final branch tip after
   the post-sweep rebase (390a5d131 on master 9a765cd54).
   The move is measurement-only (verified diff: zero
   src/js, zero policies, zero docs), so the numbers
   stand on an identical substrate — but any future arm
   quoting this band must quote anchor 7f8758560, not the
   final tip, and the coordinator's merge should not
   rewrite that anchor.

## Convergence state

converging (measurement, not a lever): the scale-onramp axis
now has a SECOND refusal seed (90111) beside 85106, and the
pair bounds mustercall-b's headline instead of confirming
it — offered-and-reachable becomes offered-on-both,
reachable-on-one. The new binding constraint is free allied
faces, and the new open question is what a sounded-but-short
muster means for the #1538 routing decision. The next work
on this channel is still the #1538 decision — now with two
seeds' worth of post-block evidence (85106: reachable once,
then recurs after a loss; 90111: never reachable by buttons)
— plus the face-deployment measurement above. Not another
blind census of the same cluster shape.

## Coordinator follow-ups (not done here — coordinator owns landing)

- Merge: evidence + prereg + screen/sweep/splitter/analyzer +
  replay + proof test + corpus (all on sim-muster3-a). No
  game-code change, so "measurement only" in substance —
  but the corpus + instrument land as the baseline for the
  next lever arm on this channel.
- Telemetry deviation check (loop step 10) against
  hidden_files/telemetry-baselines/scale-wall.json — left to
  the coordinator after landing, since the baseline roll-forward
  decision belongs to the run, not the arm.
- Findings-backlog (reported, NOT appended to sim-findings.md
  by this arm): (a) second cluster seed FOUND (90111) —
  G-BOUNDED, yield 3, ceiling <= 6, gate never reachable by
  buttons; (b) free-face availability is the new binding
  constraint (two trusted quota-6 links, zero free faces
  on all 22 snapshots); (c) located-but-unfaced now 10/20
  on this band, including 100-day and 73-day windows;
  (d) post-block pair complete: 85106 reachable-once vs
  90111 never-reachable — #1538 now needs the
  sounded-but-short answer, not just the re-sound answer.
- Quotation corrections to carry forward: muster ceiling is
  NOT "5→9, gate met on five days" — that is 85106 only.
  The pair is 85106 (call 5 early / 9 late, ceilings 5–12,
  gate met on five refusal days with commit) and 90111
  (call 3 flat, ceilings 5–6, gate met on zero days even
  with full commit). Herald refusals total 57 across the
  chain (35 on 85106, 22 on 90111, 0 elsewhere). Wave 5
  remains 0 on every band in this chain.
