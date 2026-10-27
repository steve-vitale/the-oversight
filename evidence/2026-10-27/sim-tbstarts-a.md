# sim-tbstarts-a — classify the UNSETTLED TB STARTS on the wave-4 melt band (axis scale-onramp)

Run: fleshout loop A, run fleshout-20261027T1121Z.
DIAG ONLY — zero src/js changes, zero default flips, no game lever,
no game-lever proposal. The deliverable is measurement, not a fix:
unsettled-start behavior is unchanged. No [needs-eyes] flag applies
(measurement only, no feel/combat/UI change; said explicitly).
The w4melt verdict itself is NOT re-judged here — this arm
classifies only the leftover starts w4melt named.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

Full text: evidence/2026-10-27/sim-tbstarts-a-prereg.md
(committed first, alone, before any sweep: commit 5ae68a0c4).
In brief:

- Base: coordinator-provided worktree branch sim-tbstarts-a
  (HEAD 024261db6 at prereg time, plus the prereg commit itself).
  Plain-vs-w4melt/w4funnel control comparison is REPORT-ONLY
  (this worktree's base is not the w4melt rebase tip): any
  deviation is base movement, never a gate failure. Only
  armed-vs-plain inexactness, corpus errors > 0, or a detgate
  FAIL stops the run.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4
  = The Mirror Draft, standing >= 100).
- Context read first: evidence/2026-10-27/sim-w4melt-a.md and its
  prereg, evidence/2026-10-27/sim-w4funnel-repin-a.md and its
  prereg, and the sim-findings backlog line "UNSETTLED TB STARTS".
- Substrate: seeds 73671-73678, tableseat-nowait policy
  (composed upon, never edited), 180d death-aware horizon
  (180 is the cap, not a fixed horizon). Two arms, same seeds:
  PLAIN (no recorders) runs FIRST; ARMED (tbstarts-diag NEW +
  raftdraft-diag + spawnsrc-diag verbatim) must reproduce plain
  EXACTLY on every shared field or STOP.
- Corpus-sufficiency decision (schema inspection, before any
  sweep): the w4melt corpus carries start/end counts (73675:
  61 fights / 28 settlements) but NO tbfight.id, NO startCombat
  call argument, NO pre-call live-fight identity, and NO
  tbfight=null site marker — so a corpus-only classification
  would be guessing the site. RESWEEP with the new recorder.
- DIAG-GO rule (verbatim from the prereg; ALL required):
  (a) every unsettled start on 73675 (61 starts vs 28 tbEnd in
  w4melt-diag, or the actual count on your resweep — state
  which) is assigned to exactly ONE class:
  abandoned-without-tbEnd with the code site cited,
  merged/continued under another fight id, recorder gap with
  proof, or another NAMED class. Any unclassified start =
  DIAG-NO-GO, never re-scored. (b) The cluster days
  (d113–118, d126–127, d152) are TESTED against
  raid/siege/arrival days per seed — named, not assumed; a
  shared calendar day across seeds is not a shared cause, said
  plainly whatever the per-seed answers are. (c) Impact
  statement: do unsettled starts affect any melt settlement,
  headline, or wave-4 kill count on the band? Answer from the
  classified rows, not by assertion. (d) One cluster sense-read
  in plain words (non-measured replay allowed; replay text
  never enters any count).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO

- (a) Every start on 73675 is assigned to exactly ONE class
  (see the partition table): 33 TITAN-GATE-REFUSED, 27 SETTLED,
  1 INSTANT-SETTLED, 0 refused (core live-fight), 0 dissolved,
  0 unsettled, 0 unsettled-null. The w4melt count is the
  resweep count: the resweep reproduces w4melt's 61 starts /
  28 ends on 73675 exactly, and the partition accounts for all
  61 starts and all 28 ends with nothing left over (see the
  arithmetic checks). Zero unclassified starts.
- (b) Cluster days TESTED (see the cluster table): the
  d113-118 cluster follows the d111 raid that drafted the
  Herald, the d126-127 cluster follows the d118 raid that
  re-drafted it, and the d152 cluster follows the d148 raid
  that re-drafted it again — but NO cluster day is itself
  explained by a raid day (d118 falls inside the first
  cluster window, yet its refusals are the same Herald
  re-drafted that night, not a raid-day effect), and the
  clusters are the Herald walking onto the scholar's tile
  day after day while the muster gate stays shut (0 of 10
  blades on every refusal). A shared calendar day across
  seeds is not a shared cause: the band-wide table shows the
  titan-refusal shape is 73675-only, so no cross-seed cluster
  claim is made.
- (c) Impact: NONE on any melt settlement, headline, or
  wave-4 kill count. Every melt fight on the band is a SETTLED
  start (its own tbEnd row); no melt fight is a refusal, an
  instant settlement, or an unsettled start. Headlines are
  armed == plain EXACT on every shared field, and the wave-4
  kill log is byte-identical between arms. The unsettled
  starts touch no settlement, no headline, and no kill — they
  are fights that never started, counted as starts only by a
  recorder that wraps the wrapper.
- (d) Sense: the d113-118 cluster read below (census timeline,
  authoritative, plus a NON-MEASURED narration replay whose
  refusal lines match the census day-for-day in the window —
  disclosed, and the replay proves wording only).

## CONTROL GATE — PLAIN, ARMED, AND THE W4MELT BAND

Armed band reproduces plain EXACTLY on every shared field,
per seed and in total (summary gate ARMED-vs-PLAIN: EXACT,
8/8 seeds exact on days, gameDays, endReason, won, waveReach,
maxArc, finalRank, maxRank, nationalEver, nationalFinal,
table, entered, deathTotal, starvationDeaths, faced,
waveKillLog entries). Plain reproduces the 0615Z/w4melt
control band EXACTLY on every field too (summary gate
PLAIN-vs-0615: EXACT) — this worktree's base moved nothing
on the control headlines. Detgate PASS on 73675 (see below).
Corpus PASS (recorder errors 0 on all THREE recorders, no
overflow, all seeds). Validator 10/10
(scripts/test-tbstarts-a.js).

| field | plain | armed | 0615Z/w4melt reference |
|---|---|---|---|
| wins | 4/8 | 4/8 | 4/8 |
| national-ever | 7/8 | 7/8 | 7/8 |
| national-final | 5/8 | 5/8 | 5/8 |
| table invited | 5/8 | 5/8 | 5/8 |
| table entered | 4/8 | 4/8 | 4/8 |
| wave-3 reached | 8/8 | 8/8 | 8/8 |
| wave-4 reached | 5/8 | 5/8 | 5/8 |
| wave-5 reached | 0/8 | 0/8 | 0/8 |
| median survival | 130d | 130d | 130d |
| deaths | 284 | 284 | 284 |
| starvation deaths | 2 | 2 | 2 |
| wave-4 kills total | 2 (73671: 1, 73677: 1) | 2 (same) | 2 (same) |

Per-seed (both arms identical): 73671 180d survived wave-4
regional; 73672 118d won wave-4 global; 73673 32d
village-lost wave-3 village; 73674 118d won wave-3
national; 73675 169d village-lost wave-4 global; 73676
144d won wave-4 national; 73677 130d won wave-4 global;
73678 122d village-lost wave-3 regional. Identical to the
w4melt/repin per-seed table.

Death-cause shares (plain corpus, 284 deaths; armed total
identical): villager combat 123 (43.3%), villager-vs-
villager combat 70 (24.6%), player arena 34 (12.0%),
villager expedition 20 (7.0%), villager sickness 10
(3.5%), wound that wouldn't close 7 (2.5%), ambush 6
(2.1%), villager monster 5 (1.8%), player dehydration 2
(0.7%), starvation 2 (0.7%: 1 villager, 1 player), and
singles at 0.4% each: player lockjaw, The Redactor, The
Congregation, player contest, alien. Identical to w4melt.

Detgate (73675, recorders OFF vs plain): PASS — baseline
days 169, gameDays 169, tsNationalDay 77; wrapped
(recorders OFF) days 169, gameDays 169, tsNationalDay 77;
no diag surface, no wraps installed, post-setup world 0.

Validator (scripts/test-tbstarts-a.js): 10 PASS, 0 FAIL —
summary label/corpusOk/armedVsPlainExact, per-seed exact,
plain band equals armed band, row-file exact re-derived,
recorder errors zero (three recorders), pairing re-derived
matches summary pairing + internally consistent, 73675
starts partition exactly, 73675 ends partition exactly.

## THE PARTITION — 73675, EVERY START ACCOUNTED FOR

The resweep's pairing joins starts to ends by fight id, by
recorder token (the same fight object — direct-build
person-fights carry no tbfight.id), and by call index for
fights that end inside their own startCombat call. The
validator re-derives the partition independently
(scripts/test-tbstarts-a.js) and the summary's pairing table
matches it.

| class | count | what it is (one line each) |
|---|---|---|
| TITAN-GATE-REFUSED | 33 | titans.js wrapper returns null before core startCombat runs: muster gate, have 0 / need 10, on every one |
| SETTLED | 27 | normal start with a tbEnd row for the same fight id |
| INSTANT-SETTLED | 1 | murkcap d112: fight started and routed inside its own startCombat call (end row carries the call's index) |
| REFUSED (core live-fight) | 0 | no startCombat call was refused for a live fight on 73675 |
| DISSOLVED / INSTANT-DISSOLVED | 0 | no tbBarrierExit dissolve fired on 73675 |
| UNSETTLED | 0 | no post-call fight lacks an end/dissolve |
| UNSETTLED-NULL | 0 | no post-call-null start lacks an inside end/dissolve/refusal |
| TOTAL starts | 61 | 33 + 27 + 1 = 61 |
| TOTAL ends | 28 | 27 settled + 1 instant-settled + 0 unmatched = 28 |

The w4melt gap is fully explained by the partition: w4melt
counted 61 starts and 28 settlements, a difference of 33 —
exactly the 33 titan-gate refusals. The murkcap instant
settlement is NOT part of the gap (its end row exists in
both corpora); it only looked unsettled in the v1 recorder
read because the post-call fight was already nulled by
tbEnd's finally when the recorder read it.

## WHAT A TITAN-GATE REFUSAL IS, MECHANICALLY

1. RAID + TOLL. A raid drafts the Herald (d111, d118, d148 on
   73675); the palisade takes its 25% wall toll each time
   (700 → 525 → 350 → 175 across the three raids — the HP
   steps in the refusal rows are raid tolls, not fight
   damage: no fight ever happens).
2. UNMET → LINGER. No defender meets it, so it lingers at the
   treeline (lingering=true, lingerSince stamped with the
   raid day) and gorges nightly — the same siege shape as the
   w4melt lingerers, but for a titan.
3. HUNGRY STEP. On later days the Herald's stance machine
   steps it onto the scholar's tile (game.js monsterTurn,
   'hungry' case: stepToward, then startCombat(m.id) when it
   lands on the scholar — call stack game.js:22729 via the
   action-clock batch at game.js:19214, on every one of the
   33 rows).
4. WRAPPER REFUSAL. titans.js titanWrapCombat intercepts the
   call before core startCombat: the Herald is a titan def,
   the finale-campaign entry gate does not answer
   (gateAns null), and the hard muster gate fails —
   titanMusterReady is false (0 allied blades of the 10
   required; the muster record for the Herald on 73675 has
   allies 0, turned 0, on every refusal). The wrapper says
   the ⛔ line ("It notices you the way weather notices a
   field... muster 10 allied blades (you have 0)"), records
   {titan:'herald', outcome:'refused', detail:{gate:'muster',
   have:0, need:10}} into state.titans.outcomes, and returns
   null. Core startCombat never runs: no fighters are built,
   no worldOrigin is set, the Herald is NOT lifted (lifted
   false on all 33 rows — it stays on its tile), and no
   tbEnd can ever fire for a fight that never existed.
5. REPEAT. The refusal changes nothing about the Herald's
   position or stance, so the next monster-turn batch steps
   it onto the scholar again — and again. That is the
   cluster: not 33 fights, not 33 abandoned fights, but one
   besieging titan knocking on a door that will not open
   until a muster exists, 33 times.

The discriminator that proves this (and that the w4melt
corpus could not provide) is the titan outcome-log entry
appended DURING each call: all 33 refusal rows carry a new
outcomes entry {titan:'herald', outcome:'refused',
detail:{gate:'muster', have:0, need:10}} with the call's
day, and no other start on 73675 carries one. The muster
snapshot on each row agrees independently (allies 0,
minAllies 10). The campaign-gate branch never fires on this
band (gateAns null on all 33 — the refusal is the plain
muster gate, not the finale-march override).

## THE ONE INSTANT SETTLEMENT — MURKCAP d112 (not a gap)

The d112 murkcap start is the only start on 73675 whose
fight began and ended inside its own startCombat call: the
fight's tbEnd row (d112, 'routed', id fmgpspioy_ekxveo)
carries the start's call index, and the start's post-call
fight is null because tbEnd's finally had already cleared
it when the recorder read it. In w4melt terms this start
was never unsettled (its settlement row exists); in v1
tbstarts terms it looked null only because the join key
(the post-call fight id) had already been erased by the
settlement itself. The call-index join is the fix, and it
is the reason the partition's ends arithmetic closes
(27 + 1 + 0 = 28).

## BAND-WIDE TABLE (all seeds, resweep pairing)

Starts partition per seed (settled + instant-settled +
titan-refused + refused + dissolved + unsettled +
unsettled-null = starts; settled + instant-settled +
unmatched-ends = ends). Titan refusals are 73675-only on
this band. Every other seed partitions with zero unsettled
and zero unsettled-null. The cross-day settlement shifts
seen as day-diffs in the w4melt corpus (73671, 73677,
73678) are id-joined here, not day-diffed, so they are not
unsettled: 73671's one unmatched end is a d94 'lost'
alien-player direct-build fight (player + hostile 'sarge',
encounters.js alienFight — built without startCombat, so
it has no start row; it is an unmatched END, the mirror
image of an unsettled start, and it changes no start
accounting).

| seed | starts | ends | settled | instant | titan-ref | refused | dissolved | unsettled | unsettled-null | unmatched ends |
|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 33 | 34 | 29 | 4 (d10, 18, 74, 160) | 0 | 0 | 0 | 0 | 0 | 1 (d94 alien) |
| 73672 | 17 | 17 | 17 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 73673 | 5 | 5 | 4 | 1 (d14) | 0 | 0 | 0 | 0 | 0 | 0 |
| 73674 | 14 | 14 | 11 | 3 (d52, 64, 65) | 0 | 0 | 0 | 0 | 0 | 0 |
| 73675 | 61 | 28 | 27 | 1 (d112) | 33 | 0 | 0 | 0 | 0 | 0 |
| 73676 | 13 | 13 | 12 | 1 (d67) | 0 | 0 | 0 | 0 | 0 | 0 |
| 73677 | 18 | 18 | 18 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 73678 | 27 | 27 | 25 | 2 (d16, 16) | 0 | 0 | 0 | 0 | 0 | 0 |
| TOTAL | 188 | 156 | 143 | 12 | 33 | 0 | 0 | 0 | 0 | 1 |

Band-wide, instant settlements (12) are the normal shape of
a fight that routes the moment it starts (the monster
disengages on the opening turn — tbEndCheck inside
startCombat's opening advance); they are settled fights,
not gaps, and the call-index join is what separates them
from refusals. No seed anywhere on the band has a
core live-fight refusal, a dissolve, an unsettled start,
or an unsettled-null start. The w4melt gap was a
73675-only shape, and it is now a 73675-only answer.

Raid days per seed (raftdraft, resweep corpus):
73671: 9, 17, 24, 31, 51, 65, 72, 83, 92, 99, 108, 117, 136,
145, 156, 166; 73672: 12, 21, 28, 40, 47, 54, 63, 70, 84, 95,
109; 73673: 13, 25; 73674: 7, 14, 24, 31, 38, 49, 56, 67, 75,
85, 101, 115; 73675: 19, 28, 45, 53, 60, 67, 77, 92, 100,
111, 118, 130, 139, 148, 164; 73676: 7, 21, 32, 39, 65, 75,
83, 94, 110, 122, 134, 142; 73677: 19, 46, 54, 61, 72, 86, 93,
103, 111, 121; 73678: 15, 27, 34, 42, 50, 65, 73, 84, 100,
108, 117.

## CLUSTERING VERDICT — TESTED, NOT ASSUMED

Raid days on 73675 (resweep corpus, raftdraft): 19, 28, 45,
53, 60, 67, 77, 92, 100, 111, 118, 130, 139, 148, 164.
Wave-4 arrivals on 73675 (resweep corpus, spawnsrc): herald
d101 (scripted-titan, seq 26); reunion d103; eater d106;
congregation d123; eulogy d133; eulogy + algorithm d139;
algorithm d149; suburb + eulogy d150; reunion d152; eulogy
d159; influencer d161. The Herald is the only titan arrival
on 73675, and no other seed has a titan refusal — so there
is no cross-seed cluster to claim, and none is claimed.

Per cluster, tested against those lists (fixed facts from
the 73675 rows themselves, not assumed): the Herald arrived
d101; its refusal rows carry lingerSince 111 (d113-118
cluster), 118 (d126-127 cluster), and 148 (d152 cluster);
its HP on those rows is 525, 350, and 175 — the three raid
tolls (700 → 525 after the d111 raid, → 350 after the
d118 raid, → 175 after the d148 raid).

- d113-118 cluster (18 refusals: d113×2, d114×1, d115×8,
  d116×4, d118×3; d117×0 in both the corpus and the replay):
  raid-day membership — d118 IS a raid day, d113, d114,
  d115, d116, d117 are not. The d118 refusals are not
  caused by the d118 raid: they are the same Herald,
  re-drafted that night (lingerSince re-stamped 118, HP
  350), stepping onto the scholar again the same day. The
  cluster's cause is the unmet muster gate (0/10 on every
  refusal), not the raid calendar: the d111 raid is the
  cluster's origin (the draft that first left the Herald
  lingering), and the refusals are its echo, day after day,
  until the Herald's linger ends.
- d126-127 cluster (11 refusals: d126×7, d127×4): raid-day
  membership — neither day is a raid day. The preceding
  raid is d118 (the re-draft, lingerSince 118, HP 350).
  Same gate, same Herald, second echo.
- d152 cluster (4 refusals, all d152): raid-day membership
  — d152 is not a raid day. The preceding raid is d148
  (the re-draft, lingerSince 148, HP 175). Same gate, same
  Herald, third echo. Note d152 is also the arrival day of
  the reunion (seq 38, tile-entry) — a coincidence of the
  same day, not a shared cause: the reunion's own fight
  history (settled lost fights d167-169) is separate from
  the Herald's refusals, and nothing joins them but the
  calendar.

Siege days: there is NO single named siege-event day in the
corpus vocabulary (lingering gorges happen nightly) — no
"siege cluster" is claimed, per the prereg. Cross-seed: a
shared calendar day across seeds is not a shared cause, said
plainly whatever the per-seed answers are — and on this
band there is no cross-seed cluster to claim (titan refusals
are 73675-only, and no other seed's refusal days overlap
the 73675 clusters by any shared mechanism).

## IMPACT STATEMENT (leg (c) — from the classified rows)

- Melt settlements: every melt fight on the band (the 5
  w4melt melts, all after lost TB fights) appears in the
  tbstarts corpus as a SETTLED start with its own tbEnd row
  ('lost' in all 5): 73671 reunion d167 (callIdx 28, seq 47,
  lingerSince 166); 73675 eater d145 (callIdx 45, seq 28,
  lingerSince 139); 73675 eulogy d145 (callIdx 46, seq 31,
  lingerSince 139); 73675 suburb d167 (callIdx 54, seq 36,
  lingerSince 164); 73677 suburb d123 (callIdx 15, seq 42,
  lingerSince 121). No melt fight is a refusal, an instant
  settlement, or an unsettled start. The refusals touch no
  melt settlement because a refusal creates no fight and
  therefore no settlement to touch.
- Headlines: armed == plain EXACT on every shared field
  (8/8 seeds exact; band totals identical, see the control
  table). The refusals move no headline: they change no
  death, no rank, no national/table/wave field — the armed
  band that records them is identical to the plain band
  that does not.
- Wave-4 kill counts: the wave-4 kill log is byte-identical
  between arms (logEntries compared in the exactness gate),
  with 2 wave-4 kills on the band (73671 congregation d121,
  73677 influencer d113) — the same 2 as w4melt. The Herald
  is alive at the end of 73675 (finalPresent, hp 175) — a
  refused titan is never killed, never counted, and never
  melts. The refusals add zero kills and remove zero kills.
- What the refusals DO cost (measured, not asserted): the
  Herald's nightly gorge while it lingers (the census shows
  gorge lines of ~630–1,712 kcal/night on the cluster days in
  the sense replay window — replay wording only, not a
  count) plus the scholar's repeated wasted approaches. That
  cost is the siege's cost, not a counting cost: the refusal
  rows themselves change no number in any headline, melt, or
  kill total.

## SENSE-TESTING READ — THE d113-118 CLUSTER (plain words)

The census timeline is the authoritative thread; the replay
(scripts/test-tbstarts-sense.js, SEED=73675 DAYS=120, window
d111-120, saved as perseed-tbstarts-a/sense-73675.txt, 92
lines) matches it on the cluster days and is used for wording
only.

Day 111: a raid hits Haven in the night — three raiders,
Murkcap, The Herald, Hushpuppy, drawn by the smell of the
pantry. The palisade takes its toll. Nobody meets any of
them. The fiction says it three times, once per raider:
"Nobody met The Herald — it's still out there at the
treeline. It'll gorge every night until it's driven off."
And then it does: night after night the gorge lines come —
1,455, 1,548, 630, 1,440, 1,260 kcal — and the game tells
the village the price and the choice every night: endure it
(they drift off within ~6 nights) or send a sortie.

Day 112: the Herald follows the scholar — "It followed you.
The Herald is here." — twice, and the murkcap fight from
the same raid starts and routes in the same breath (the
instant settlement: a real fight, over before the day
notices). The Herald itself does not fight that day.

Days 113-118: the Herald keeps walking onto the scholar,
and the game keeps answering with the same honest refusal:
"⛔ THE HERALD does not notice you the way prey notices a
hunter. It notices you the way weather notices a field. You
cannot face this alone — sound the call, muster 10 allied
blades (you have 0). This is not courage. This is
arithmetic." Twice on d113, once on d114, eight times on
d115, four times on d116, three times on d118 — the
refusal lines in the replay match the census counts on
those days exactly (the replay proves wording and presence
here, not counts; the counts are the corpus rows). On d117
there is no refusal in either record — the Herald follows
and paces, but does not step onto the scholar that day.
On d118 a new raid re-drafts the Herald (with Big Big and
Flashbulb Moth), the toll takes another quarter of its
health, and the refusals resume the same day.

Sense judgment: the cluster reads as a siege the village is
losing slowly, not a bug the player trips over. The fiction
never promises the Herald can be fought solo — it says, on
the first refusal and every one after, exactly what is
missing (10 allied blades) and exactly how many exist (0).
A player who lives those days learns the door's price
without counting: the monster at the treeline is not a
fight waiting to happen, it is an army waiting to be built.
The unsettled-start mystery dissolves on the same reading:
there was never a fight to settle. The 33 rows are the
game saying no, 33 times, in the same words, while the
pantry bleeds a thousand kcal a night. That is coherent as
a system (the gate is legible once you see it) and legible
as a story (the refusal line is the fiction, not a gap in
it) — the opposite of the w4melt melts, which were honest
in the census and silent in the fiction. Here the fiction
is the census.

NON-MEASURED replay note: the replay's trajectory matches
the census on the cluster days (refusal lines on d113, d114,
d115, d116, d118 with the census day counts; no refusal on
d117 in either record; the d111 raid composition and the
d112 murkcap fight both present), but replay text never
enters any count above — the partition tables come from
the corpus rows (tbstarts starts/ends/dissolves), and the
replay proves wording and presence only.

## VILLAGE ASSESSMENT (plain words)

The eight villages' fates on this base are the w4melt
villages, unmoved (plain band == w4melt control EXACT):
four won (73672, 73674, 73676, 73677), one survived to the
180d cap (73671, regional), three village-lost (73673 at
32d, 73675 at 169d, 73678 at 122d). 73675's story is the
refusal story: a village that absorbed the whole Mirror
Draft as weather (13 arrivals, 3 melted after lost fights,
10 still standing at the end, 0 killed — w4melt's census),
plus a titan it could not fight at all, knocking 33 times.
The villages that won did so with this door mostly shut;
the refusal shape is a 73675-only tax, not a band-wide
wall — but it is the same wall in miniature: the content
(a titan fight) is gated on a muster the village never
built, so the titan is weather, not a fight, for the whole
run. The other seven villages never even meet the gate:
no titan steps onto their scholars while muster-less, so
their start counts partition cleanly into settled fights
and instant settlements, with no refusal rows at all.

## BLANKS FILLED OR DOCUMENTED

- FILLED (answered, with numbers): what the 33 unsettled TB
  starts on 73675 ARE — 33 titan-gate refusals (muster gate,
  have 0 / need 10, outcome-log entry per call, call stack
  game.js:22729 hungry step-onto-tile), plus the 1 instant
  settlement that only looked unsettled in a post-call read
  (murkcap d112, routed inside its own startCombat call).
  Partition closes exactly: 61 starts, 28 ends, 0 unclassified,
  0 unmatched ends.
- FILLED (clustering, tested): d113-118 / d126-127 / d152
  clusters are one Herald, three raids (d111 / d118 / d148),
  one unmet muster gate — not raid-day events, not a shared
  cross-seed cause.
- FILLED (impact, from rows not assertion): refusals touch no
  melt settlement, no headline, and no wave-4 kill count
  (armed == plain exact; melt fights all SETTLED starts).
- OVERTURNED (plausible readings that do not stand): the
  starts are NOT fights abandoned without tbEnd (0/61 — no
  fight ever started for the 33 refusals, and the murkcap
  fight DID settle); NOT core live-fight refusals (0/61 —
  no live fight existed at any refusal call); NOT
  tbBarrierExit dissolves (0/61 — no dissolve fired); NOT
  recorder loss (0/61 — errs 0, and every refusal carries its
  own outcome-log proof; the v1 null-post-call read was a
  join-key artifact, not data loss).
- DOCUMENTED, NOT FIXED (named next blanks): whether the
  repeated refusal should cost the scholar anything beyond
  the gorge (a Steve design ruling — this arm classifies, it
  does not propose the lever; the refusal loop is honest but
  free to repeat, and a muster-less village can be knocked
  on forever); the Herald's HP steps (700 → 525 → 350 →
  175) are raid tolls, so a Herald re-drafted often enough
  arrives at the scholar's tile nearly dead without ever
  being fought — a reachability note for the titan content,
  not a counting error.
- CARRIED (not chased here): the titan-muster content itself
  (how a village ever musters 10 allied blades — the gate
  the refusals name) is a scale-onramp question for a
  later arm, not this classification.

## INFRASTRUCTURE NOTES

- Sweep: scripts/test-tbstarts-diag-sweep.js (plain arm, armed
  arm with THREE recorders, summary gate armed-vs-plain exact
  + tbstarts pairing print). Corpus:
  evidence/2026-10-27/perseed-tbstarts-a/ (16 rows +
  summary.json + sense-73675.txt, 3.1 MB). Validator:
  scripts/test-tbstarts-a.js (10 PASS, 0 FAIL). Sense:
  scripts/test-tbstarts-sense.js (NON-MEASURED replay only).
  New instrument: scripts/policies/tbstarts-diag.js
  (TBSTARTS=1, v2 after the smoke — see below).
- Instrument notes (stated, not hidden): (1) Recorder v2: the
  first smoke run (armed 73675, v1 fields) showed 34 starts
  with a null post-call fight and no live pre-call fight —
  a shape v1 could not split. V2 adds exactly two
  discriminators: the titan outcome-log diff per call and
  the active-start call index on end/dissolve rows. The v1
  smoke corpus was overwritten by the v2 rerun of the same
  seed (same 61/28 counts, now partitioned: 33 titan
  refusals + 27 settled + 1 instant-settled); the smoke is
  disclosed here, not hidden, and no verdict rests on v1
  numbers. (2) The prereg's class list anticipated this
  outcome under "another NAMED class" — TITAN-GATE-REFUSED
  is that named class, defined in the evidence before use,
  and the prereg's DIAG-GO rule is otherwise untouched.
  (3) The pairing joins by fight id, by recorder token (the
  same fight object — needed because direct-build
  person-fights carry no tbfight.id), and by call index for
  inside-call settlements; day proximity is never used as a
  join. (4) Safe-commit index clobber hit the prereg commit
  (5ae68a0c4) — the known class: the commit itself correct,
  the main index showing a bogus staged deletion after.
  Repaired via HEAD-blob cacheinfo, verified with git status
  --short empty + git diff HEAD empty + worktree files
  intact, before any further work.
- Wall times (file mtimes, not stopwatch): the band's
  chained job wrote its first plain row 11:41:10 UTC and its
  summary 11:47:36 UTC (8 plain + 7 armed seed-runs +
  summary; the 73675 armed row is the v2 smoke row, written
  earlier the same morning and reused, not re-run). Detgate
  + validator together took 54s. Sense replay (120d) took
  34s. No EPERM flap blocked this run's writes.
- Commits (this worktree, coordinator merges): prereg
  5ae68a0c4 (alone, before any sweep); instruments + corpus
  97f64c1b (22 files: recorder, sweep, validator, sense,
  16 corpus rows + summary + sense replay); evidence
  TO-FILL-EVIDENCE-HASH (this file, after the sweep).

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

Judged exactly against the four pre-registered DIAG-GO legs:
(a) every unsettled start on 73675 assigned to exactly one
class — achieved: the resweep count IS the w4melt count
(61 starts / 28 ends on 73675), partitioned as 33
titan-gate-refused + 27 settled + 1 instant-settled + 0
refused + 0 dissolved + 0 unsettled + 0 unsettled-null,
with the ends partitioned as 27 + 1 + 0 unmatched; zero
unclassified starts, so no re-scoring was needed or done.
(b) cluster days TESTED against raid/siege/arrival days per
seed — achieved: raid membership named per cluster day
(d118 the only cluster day that is itself a raid day, and
its refusals are the re-drafted Herald, not a raid-day
effect); siege days named as non-existent in the corpus
vocabulary (no siege cluster claimed); cross-seed
no-shared-cause statement made plainly, with the
titan-refusal shape proven 73675-only band-wide. (c)
impact statement from the classified rows — achieved: all
5 melt fights are SETTLED starts, headlines armed == plain
EXACT, wave-4 kill log byte-identical (2 kills, both arms).
(d) one cluster sense-read in plain words — achieved: the
d113-118 cluster, census timeline + replay note (replay
text never entered any count). Gates: armed-vs-plain EXACT
(8/8 seeds), corpus PASS (three recorders, errs 0, no
overflow), detgate PASS on 73675 (169d/169 gameDays both,
tsNationalDay 77 both, no diag surface, no wraps),
validator 10/10. Two method notes, neither a revision:
(1) Recorder v2 (outcome-log diff + call-index join) was
added after a smoke run showed v1 could not split
null-post-call starts — the classes and thresholds never
changed, and the v2 rerun reproduces the v1 counts (61/28)
while partitioning them; the smoke is disclosed in the
infrastructure notes. (2) The telemetry-check and balanced
panel were NOT run, per the standing exception for recorder
rows (panel cannot ingest per-seed recorder corpora —
carried from w4funnel-repin-a and w4melt-a). The
sweep-compare table + validator output are the comparison
of record. The telemetry baseline was NOT rolled. No game
code changed in this run; no [needs-eyes] flag applies
(DIAG-only, no narration or behavior added — the sense
script only READS beats on a replay, it adds none to the
game).
