# sim-food-economy-round-1130-b — coordinator evidence (Loop B, 2026-10-30)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1130Z.
Axis: food-economy (second non-converged axis; sibling loop A live on
scale-onramp the whole run — claim fleshout-20261030T1122Z, arms
sim-floortime-a + sim-dissolve-a, landed mid-run as 4a0a6987d, NOT
touched; a new loop A run started 1215Z during this closeout, also
NOT touched). Base at run start: 082cfa19e. All three arms DIAG ONLY:
measurement, zero game-code default changes, zero policy-default
flips. Merged locally, pending ship. No push, no version bump, no live
verification (ship loop owns deploys).

## Arm 1 — sim-rankconv-b: standing-to-rank conversion (DIAG-GO)

Branch sim-rankconv-b: prereg e578350e6, census 92d21fca9, rebased
onto 4a0a6987d as e1bca982d, proof re-run green post-rebase and on
merged master. Evidence: evidence/2026-10-30/sim-rankconv-b.md
(+ prereg). Proof: scripts/test-rankconv-b.js 7/7 GREEN (post-merge,
main tree). Answers backlog #1493.

Question: what, under competent play, converts standing into regional
rank at all? 9981 reproduction (current master, competent, 180d):
180d survived, rank village all 178 recorded days, standing 0 → 25
(day 103) → 50 (day 110) → 75 (day 159, held to day 180) =
war 75 (3 wave-3+ ledger points × 25) + diplomacy 0 + plenty 0.
Fresh band pilot 12311–12318 + confirm 12401–12412: EVERY seed
classified NO-LINK from recorded gate state (links [], all polity
fields null, networkLive false, inter-village verbs {} on every
seed). Named blocking gate: NO-LINK.

Named answer: nothing on this evidence — gates are proposals, not
standing. scaleRank() reads only networkLive/nationalLive/globalLive
(hierarchy.js:2042–2048). Conversion chain: propose a link →
accept/counter → _formLink → bond ages 21 days → _checkRegional
fires the Regional Dawn → regional rank. Competent contains no
proposeLink-family call at all, so the chain never starts; and
_foreignPolitySim returns early unless networkLive, so the BELONG
road's foreign-polity precondition can never form either. Standing
feeds wave unlocks (t4=100, t5=200); its diplomacy source counts
only seasoned regional+ links, so it presupposes the polity rank
requires. Seed 12313 passes the t5 bar (225) on feasts alone and
stays village — standing above both wave bars buys waves, not rank.

Wall (21 seeds): national 0/21, regional 0/21, table 0/21, wins
0/21, wave 4 11/21, wave 5 0/21, median 180 AT CAP (14/21 at cap).
Sense read (9981): roster/succession/deaths/trajectory human
throughout (scholar chain Rebecca Barbieri → Nia Price → Pavel
Dubinin → Omar Farouk → Tariq Mahmood; standing jumps coincide
with kill days). The one non-human behavior is inter-village: six
known neighboring villages, zero words exchanged in 180 days.

## Arm 2 — sim-axeacq-b: axe acquisition trajectory (DIAG-GO)

Branch sim-axeacq-b: prereg 345ed2e61, instruments 7be0f0d9c,
instrument v2 + addendum a6b6f0914, evidence 86ca7d006, rebased
onto e1bca982d as 2ebdf01b4, proof re-run green post-rebase and on
merged master. Evidence: evidence/2026-10-30/sim-axeacq-b.md
(+ prereg + addendum). Proof: scripts/test-axeacq-b.js 37/37 GREEN
(post-merge, main tree). Answers backlog #1510.

Question: is axe acquisition broken, unbuilt, or simply later than
day 7 on the banked-bot trajectory? Answer: LATER-THAN-DAY-7, and
for the living bot effectively UNBUILT. By day 7, 0/26 vessels
axe-tier (16 fresh + 10 bank). No vessel ever carries a hatchet at
spawn (0/26). The hatchet is the only fell-tier item in the game;
it is not craftable (absent from recipes.json), not scavengeable
(absent from ruin pools), and never granted. The only arrivals
anywhere are corpse loot (3 distinct seeds) and succession
(2 distinct seeds). Not "broken" (no attempt ever fails visibly)
and not "intended" in the ruled sense (no canon doc or code
comment states axe-less-ness is designed) — the emergent
consequence of unbuilt living-bot channels plus a carry-5 lottery
that never puts the hatchet in hand. For walktree's open question
(c): on this trajectory as built, the bot is NOT supposed to hold
an axe by day 7; if the walk-to-tree middle needs one by then,
that needs a build or a ruling, not tuning.

Fresh band 16101–16116 (60d cap): ACQUIRED 3/16 — 16111 loot day 31,
16105 loot day 42, 16108 succession day 50; median first-axe day
42; BLOCKED 13/16. Pool hatchet 4/16, all stashed, none carried —
and on all 4 pool-hatchet seeds the vessel NEVER held a hatchet
on any morning, although stash-equip fires for a stone_knife
(16101, morning 5). Bank re-derivation (30d, both legs): axe-tier
at stranded mornings 0/15 (guard 0/4, ON 0/11 — reproduces
walktree's 11 mornings row for row). Sense read (16111, days
29–32): PASS — two bodies stripped in sequence, each taking
marked, hatchet equipped the next morning and kept. One wrinkle:
loot lines voice no need; "The body is stripped" repeats verbatim.

Wall (fresh corpus): national 0/16, table 0/16, wins 0/16; max wave
2 (5 seeds) / 3 (11 seeds), never 4+; median 60 loop-days at cap
(15/16 survived full cap). Bank, both legs: national/table/wins
0/10; max wave 2 on all 10; median 30 at cap (10/10 survived).
No wall movement claimed — DIAG census, no lever played.

## Arm 3 — sim-vests-b: vest acquisition census (DIAG, MIXED)

Branch sim-vests-b: prereg aefeb6036, instrument 9d889b68f
(leanlink in sweep registry, panel column, additive, no behavior
change), evidence 2e6795b5a + 02d641e59, rebased onto 68ad46222
as 3b7ea0c65, proof re-run green post-rebase and on merged
master. Evidence: evidence/2026-10-30/sim-vests-b.md (+ prereg).
Proof: scripts/test-vests-b.js 25/25 GREEN (post-merge, main
tree). Answers backlog #1494 in substance.

Question: policy-behavior gap or channel-reachability gap?
Verdict: NEITHER pure form — vest acquisition is generation-luck
only. Courting adds no vest and removes none (9915/9916 identical
histories both columns; 9912 differs only by a diverged-trajectory
joiner vest, not by any courtship verb). The generation channel
fires: villagers are dealt vests and wear them from day 1, and the
scholar ends up wearing one on 2/8 seeds in both columns. But no
playable path after generation can grant one: monster loot,
contest prizes, trader wares, fan gifts all run through
rollAlienLoot, whose pool filter excludes both vest ids (proven on
the live engine, 2,400 forced draws, zero vests). On bands where
generation deals none, 180 days of competent or courting play
cannot create one.

Fresh band 9911–9918 (180d, competent vs leanlink, identical
seeds): competent everHeld 9, scholar-held seeds 2/8, vest-seeds
3/8, generation pools 3; leanlink everHeld 11, scholar-held seeds
2/8, vest-seeds 3/8, generation pools 4. Vest-seeds are 9912
(Lena Ruiz dealt military day 1, scholar wears day 116),
9915 (Grace Obi dealt swat day 1, wears day 1→180, scholar never
holds it), 9916 (Jovan Milic military day 1 → Aisha Marquez day 2
→ scholar equipped day 100 competent / day 33 leanlink). Zero
stashed vests and zero armory-pile vests on all 24 runs. Only vest
tele events anywhere: loot_taken (corpse looting of generated
vests); zero loot_dropped, zero broadcast_item_prize vest grants.

Wall-band re-run (9981–9988, competent, full census): still 0/8 —
pools 0, held 0, tele 0 — and days/wave/end/deaths reproduce
sim-wall-b exactly on all 8 seeds (death total 339, same
distribution). The wall's 0/8 was real generation absence on that
band, not instrument blindness, and it does not generalize (0/8
vs 3/8 casts dealt).

Instrument finding (not the wall's cause): sweep-compare's vest
read counts only the scholar and reads entry `.id`, while holdings
are `itemId`-form by construction (inventory grants; equipped
slots store {itemId, …} per equipment.js:376/393/415/443).
Fixture-proven: stdSnapshot reads 0 on a state where the census
finds scholar + villager vests. Both balanced panels inherit this:
panel vests read 0 on all 16 cases, including scholar-wearing
seeds — while panel rows reproduce census rows exactly on
days/wave/rank/national/table/entered/won (both panels valid:
sourcesStable, neutrality match, 0 warnings). Panel compare is
attached with decision "invalid" — structural, not a data failure:
the tool requires identical policy sets before/after, while this
pair differs by design; no fabricated self-comparison was made.

Wall (vests corpus): competent national 0/8, table invited 0/8,
entered 0/8, wins 0/8, wave 4 6/8, wave 5 0/8, Arc 3 8/8, median 180
AT CAP (7/8 at cap), village-lost 1/8, deaths 318. Leanlink
national 5/8, table invited 4/8, entered 0/8, wins 0/8, wave 4 6/8,
wave 5 0/8, Arc 4 4/8, median honest 173 (4/8 at cap),
village-lost 4/8, deaths 317. Tradeoff noted: courting buys scale
and costs survival on this band (lost 4/8 vs 1/8). Leanlink
seatless national seeds (9914, 9917) block on waves=false
(lesser wave bars 4/4/3 unmet), not scale.

## Village assessment (plain words)

Three villages, three closed doors. The first village knows six
neighboring villages and never knocks on a single door for six
months — not because it is weak (it climbs to standing 345 on one
seed) but because its people have no courtship drive at all; the
road to regional rank starts with a proposal nobody ever makes.
The second village's vests are birth-luck: a woman is dealt a
military vest on day one and wears it all her life, a scholar
inherits one from a dead friend and wears it to the village's
end, and five seeds never see a vest at all because no one was
born holding one — no deed, no prize, no trade in 180 days can
make one appear. The third village's woodcutter wakes beside
eight big trees with a stone knife that cannot fell them, and no
morning in the first week ever puts a hatchet in his hand — the
only axes in the world arrive over dead bodies. None of these
villages read robotic day to day; the blanks are structural
(courtship drive, earnable-vest path, living-bot tool channels),
not behavior bugs.

## Wall numbers this run (combined DIAG corpora, no lever played)

national 0/45 competent seeds (leanlink column 5/8 — courtship
instrument, not a default); table entered 0/53; wins 0/53;
wave 5 0/53; wave 4 17/45 competent; median survival at cap on
every 180d column. Latest actual wall snapshot remains the 0930Z
run's (competent, 9981–9988, 180d): national 0/8, table 0/8,
wins 0/8, wave 4 4/8, wave 5 0/8, median 180d at cap — now
re-confirmed by the vests wall-band re-run, which reproduces it
exactly.

## Telemetry deviation check (body step 10, coordinator run)

- Vests competent corpus glob (8 files): 3 LOUD lines
  (national 12→0, table 16→0, wins 16→0), exiled clean.
- Rankconv pilot glob (8 files): same 3 LOUD lines, exiled clean.
Both are the KNOWN artifact class: WINSEAT-regime baseline vs
competent / pre-seat measurement corpora — the same class
recorded by the 0830Z/0930Z/1030Z runs and investigated same-run
by both workers. Baseline NOT rolled, no investigation item.
(Axeacq corpus carries no national/table/wins fields — DIAG
census, not a wall snapshot; no check run on it, stated not
hidden.)

## Infrastructure

- Container EPERM flap on .git/checkout writes delayed registration
  (two failed attempts, one checkout-wide write failure); cleared
  on retry with no ref surgery. Loop A's floortime merge moved
  master once during setup (082cfa19e → fe1e46f53); loop A's 1122Z
  round merged mid-run (4a0a6987d); journey-endgame r73 moved
  master again during the vests landing (68ad46222). Every arm
  rebased clean onto the then-current tip with proofs re-run
  before merging, except as noted below.
- Corrupted rebase todo on the vests landing (same class as the
  2026-10-24 leg2decide landing): first rebase stopped at an
  `edit` step with the instrument pick listed as both done and
  remaining, HEAD at the prereg commit. The piped `tail` masked
  the nonzero exit, so a proof run executed mid-rebase and is NOT
  counted. Recovered per the recorded lesson: `git rebase
  --abort` (branch intact at 02d641e59), clean second rebase
  (4/4, exit 0, no pipe), proof re-run 25/25, then ff-only merge.
  Never pipe a rebase through tail when the exit code matters.
- Safe-commit index clobber hit worker commits on all three arms
  (staged deletions of byte-identical files); repaired via
  HEAD-blob cacheinfo each time, commits verified correct.
  Coordinator commit verification: `git show --stat HEAD` and
  `git status --short` checked after commit; any index-clobber
  variant repaired via HEAD-blob cacheinfo before closeout.
- check.js --quick NOT run: zero src/js (one additive 5-line
  sweep-registry entry from the vests instrument, no behavior
  change), zero policy defaults, all three proof suites green
  post-merge (7/7 + 37/37 + 25/25), sibling loops live
  (concurrent-jest rule). Worktrees released as merged, branches
  deleted. Main tree clean at closeout; reaper run at closeout
  (active 1/16, journey-landing only).

food-economy stays converging (NOT converged): three wall-adjacent
questions are now answered with named mechanisms (NO-LINK rank
block, generation-only vests, unbuilt living-bot axe channels),
but no food-economy default flipped, no balance change landed, and
the warmth-default Steve-call stays OPEN. scale-onramp stays
converging (untouched; sibling loop A lane). Next food-economy
blanks, in order: (1) Steve-call: should competent play court,
or is courtship winseek-only by design? (2) Steve-call: is
generation-dealt the intended vest design, or should vests be
earnable? (3) sweep/panel vest counter itemId fix (scholar-only
.id read blinds panels); (4) stashed-hatchet equip question;
(5) axe-by-day-7 build-or-ruling. Older open items carried:
wake-tile forage knowledge (#1513), sickness death-tele gap
(#1514), sickness tick step-up (#1516).
Claim retired to .DEAD; lock deleted. Evidence:
evidence/2026-10-30/sim-food-economy-round-1130-b.md (coordinator)
+ sim-rankconv-b.md (e1bca982d) + sim-axeacq-b.md (2ebdf01b4) +
sim-vests-b.md (3b7ea0c65). Merged locally, pending ship.
