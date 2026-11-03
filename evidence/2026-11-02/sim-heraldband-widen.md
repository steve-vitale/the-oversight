# sim-heraldband-widen — widened fight-positive herald-chain screen

Run: fleshout-20261103T0011Z, axis scale-onramp, worker sim-heraldband-widen.
Arm: instrument + judged-band only — ZERO game-code change.
Prereg: evidence/2026-11-02/sim-heraldband-widen-prereg.md (committed
8a0421261 BEFORE any judged sim), restating the pilot prereg verbatim
with the widen changes: fresh band 98201-98208, yield per called seed
alongside yield per band seed, combined 16-seed yield for context,
onward flags as national / tableDone / won / maxWave.

## Anchor (actual)

Per-seed anchorCommit: 8a0421261f75 — the prereg-commit tip. It differs
from the worktree base 1ce6d98fd by exactly one file (the prereg
itself), so no trajectory-relevant code differs from base; the anchor
correction is satisfied by recording the actual tip, not the base.
Index-clobber note: safe-commit.sh's commit was correct, but the main
index then showed the prereg as staged-deleted + untracked (the known
safe-commit clobber class). Repaired with
`git update-index --add --cacheinfo` from the HEAD blob before any sim;
verified `git status` empty and `git diff HEAD` empty afterwards.

## Canon note

docs/CANON.md read first; docs/MONSTER-WAVES.md read for wave law. No
canon doc covers the herald/titan call chain itself (herald appears in
MONSTER-WAVES / ONTOLOGY / TABLE in passing) — this arm invents no
canon and judges only recorded outcome rows, per the prereg.

## Stack (verbatim)

Policy closecommit (titanroute + musterclose + mustergap over
lead-fullseat) exactly as scripts/fightoutcome-driver-20261102.js
composes it. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 FULLSEAT=1 HERALD=1. Mode herald, 180d death-aware cap, one
process per seed. Recorder/analyzer:
scripts/fightoutcome-{recorder,driver,analyzer}-20261102.js as landed
at base. Analyzer run over the per-seed JSON only (no re-simulation).
Output-dir note: the driver writes into perseed-fightoutcome-a (shared
with the recorder pilot); this run's 8 files were MOVED into the fresh
dir perseed-heraldband-widen before analyzing, so the analyzer corpus
is exactly this band and perseed-heraldband-a and perseed-fightoutcome-a
are left as they were (verified: no 9820* files remain in
perseed-fightoutcome-a).

## Primary metric — screen usability (NOT a chain verdict)

- Analyzer problems: **0** (legs 1a/1b/1c + leg 2 complete; fought TB
  139, tbFight rows 139, missing 0, orphan 0, field fights 461, floor
  titanTb + field both true; titan TB fights 1).
- Fight-positive yield: **1** (seed 98205 only — one titan TB fight row
  joined to a slain outcome record, day 87).
- **VERDICT: SCREEN STILL THIN.** Problems = 0 but yield 1 < 2, so the
  screen is usable but too thin to justify a confirm round on this
  band. This is NOT a verdict on the herald chain. Next run: widen
  further or condition on call-age survival (see metric review) rather
  than judging the chain on one fight.

## Secondary — per-seed table (descriptive, never judged)

| seed | call day | titan class | national | table* | won | maxWave | gameDays | end |
|------|----------|-------------|----------|--------|-----|---------|----------|-----|
| 98201 | — | no-call | 1 | 1 | 1 | 5 | 90 | over-other |
| 98202 | 70 | refused-only | 0 | 0 | 0 | 4 | 90 | village-lost |
| 98203 | — | no-call | 0 | 1 | 0 | 4 | 66 | village-lost |
| 98204 | — | no-call | 0 | 0 | 0 | 3 | 46 | village-lost |
| 98205 | 86 | slain (fight d87) | 1 | 1 | 0 | 4 | 88 | village-lost |
| 98206 | 103 | still-pending-at-cap | 0 | 1 | 1 | 4 | 130 | over-other |
| 98207 | —† | refused-only | 1 | 1 | 0 | 4 | 91 | village-lost |
| 98208 | — | no-call | 0 | 1 | 0 | 4 | 68 | village-lost |

\* The recorder's `table` field is a latch (tableWaiting OR tableDone),
as in the pilot — it reads 1 even on village-lost runs. It is NOT
table reach, and it is NOT tableDone. See the instrument gap below:
this arm cannot report tableDone as a distinct flag from the landed
recorder corpus, and does not pretend otherwise. Wall numbers below
cite the latch only with this caveat.

† 98207 carries NO recorded call line (callDay null, callHeard false,
dailyTrace empty) but 23 REFUSED titan attempts on days 77–81, all on
the muster gate (have 0, need 10). Classification follows the attempts
(refused-only), not the null call field — see the proof test's 98207
fixture. Its "call day" is honestly "no call line; first refused
attempt day 77".

Classes: no-call = 4 seeds (98201, 98203, 98204, 98208); refused-only =
2 seeds (98202: call d70, 26 refusals d71–72, muster have 6 / need 10;
98207: no call line, 23 refusals d77–81, muster have 0 / need 10);
slain = 98205; still-pending-at-cap = 98206 (call d103, herald still
present on the last traced day d130, zero titan attempts in 27 days,
game won d130); departed-silent-or-pending = 0 seeds on this band.

## Yield, three ways (judged on band alone)

- Yield per band seed: **1/8**.
- Yield per called seed (callDay non-null: 98202, 98205, 98206): **1/3**.
- Yield per herald-contacted seed (called + 98207's refused attempts):
  **1/4**.
- Combined with the pilot band (98101–98108, yield 1) for context:
  **2/16** per band seed; combined called seeds 5 (pilot 2 + widen 3),
  combined yield per called **2/5**. GO was judged on this band alone
  per the prereg; the combined numbers change no verdict.

## Wall numbers for the band (honestly limited)

National 3/8, table-latch 6/8 (see caveat — NOT table reach), won 2/8,
wave-4 unlocks 7/8, wave-5 unlocks 1/8, median survival 89 days
(survivals 46, 66, 68, 88, 90, 90, 91, 130; arithmetic median 89 — the
analyzer prints 90 because it indexes survivals[floor(n/2)], an
upper-median on an even band; both figures are reported here so
neither is mistaken for the other). These are 8 screened-band seeds,
not a scale-wall measurement — but two movements from the pilot band
(0/8 national, 0/8 wave-5) are worth naming plainly: three villages
here reached national standing (98201, 98205, 98207) and one unlocked
wave 5 (98201, which also won). The wall picture is therefore NOT
unchanged on this band: national reach and a wave-5 unlock both appear
for the first time on a herald screen, while the full seat stays
unproven (no tableDone flag exists in this corpus to prove it with)
and no wave-5 monster was fought in the wild on any seed.

## Sense-read — seed 98205 titan fight, day 87 (SENSE-TESTING LAW)

Read the fight row's sayLines end-to-end: kept head 150 + tail 150,
middle 180 dropped and counted — the transcript is honest about its
gap. Verdict: the row and the transcript MATCH, and the fight reads as
a real coalition kill with a real price — with the same two blemishes
as the pilot, second sighting.

What matches: the row opens "10 allies join you on the field"; the
outcome record is slain with detail blades 10 — the same 10. The call
line (day 86: "THE CALL GOES OUT — THE HERALD must fall, and no one
fire can do it") is answered the same day by three named fires, and
the named marchers match the fight roster exactly: Emberhold answers
(Ruth Osei, Zoe Nguyen, Zoe Kowalski, Andre Moreau), Thornfield
answers (Nora Nguyen, Ben Rossi, Grace Fischer, Omar Garcia), The
Hungry Road answers (Kira Reyes, Ben Osei) — "trust holds — they are
counting on you" each time. The Herald (700 HP) is beaten to 0 and the
kept tail ends "The Herald falls." — a slain, and the row says slain.
The coalition price is concrete alongside: muster hunger "1,100 of
10,000 kcal fed" on day 87, and the night before, "THE HERALD fed in
the night — 2,400 kcal gone from your stores. It is eating the realm
while you deliberate."

The price is legible: 2 of the 10 allies die (Omar Garcia, Kira
Reyes); the 8 survivors end at 4–100 HP (Andre Moreau 4, Ben Rossi 24,
Ben Osei 26, Ruth Osei 29, Nora Nguyen 32, Grace Fischer 39, both Zoes
untouched at 100). The Herald's blows land hard (27–37 per attack,
plus repeated "The Naming!" AoEs, plus Codex lessons for First Omen
and Second Omen firing mid-fight).

Blemishes, judged as a player would feel them:
1. The player ("You") never acts and never takes damage in the kept
   transcript — the only "You" lines are the two Codex lessons — and
   ends untouched at 100/100 while 2 allies die. Second sighting after
   the pilot's fled fight: the bearer <redacted> in titan fights is
   a standing finding, not a one-off.
2. "No path there." appears 34 times in the kept 300 lines — fewer
   than the pilot's 112, but still the fight's most repeated
   non-combat line. Allies repeatedly cannot reach the Herald while
   its AoEs do the work.
3. The grind reads long: ally hits are mostly 2–4 damage (121 kept
   lines at 2–4) against 700 HP, as harries/strikes patter. A
   coalition kill that takes this many small hits feels like attrition
   more than a heroic blow — though the kill itself lands cleanly.

Sense verdict: PASS on row/transcript match and coalition meaning;
FLAG the untouched bearer and the pathing repetition as findings, not
as arm failures. Counts alone did not pass this arm — the transcript
did, with blemishes named.

## Telemetry

node scripts/telemetry-check.js against
hidden_files/telemetry-baselines/scale-wall.json, narrow glob
`perseed-heraldband-widen/fo-*.json` only (no broad glob, no analysis
file swept in — the pilot's first-invocation mistake, avoided):
**REFUSAL, exit 2** — "refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs." This is the EXPECTED refusal class.
Baseline NOT rolled. No LOUD line stands.

## Metric review

- Departed-silent-or-pending vs still-pending-at-cap: the departed
  class remains UNEXERCISED (0 seeds, second band running) — it cannot
  be validated or retired from this run either. Still-pending IS
  exercised, but in a new flavor: 98206 waited 27 days after its call
  (d103→d130) with ZERO titan attempts while the herald stayed
  present, then won its game. Pending-at-cap therefore covers two
  very different stories (pilot 98107: 1 day, no time to fight; widen
  98206: 27 days, never attempted) and the next screen should split
  "pending, no attempts" from "pending, attempts refused" — 98206 is
  the former, 98202/98207 the latter.
- Yield >= 2 as confirm gate: HELD for this run (yield 1 correctly
  blocks a confirm on a single fight), but yield per called (1/3)
  reframes the thinness: the chain is not only rarely called (3/8
  recorded calls, 4/8 contacted) — when called, the muster gate
  refuses most contacts (6/10 and 0/10 on the two refused seeds).
  Proposal for the NEXT run (not a mid-run rescore): widen further
  AND report yield per called as a co-primary screen figure, so a
  band of short-lived or gate-blocked runs cannot masquerade as a
  thin chain; consider building a confirm band from fight-positive
  seeds only if yield per called stays ≥ 1/3 across bands.
- tableDone instrument gap (new): the landed recorder collapses
  tableWaiting OR tableDone into one latch field, so this arm's brief
  ("report tableDone, NOT the latch") cannot be satisfied from this
  corpus at all. The next screen that needs tableDone must split the
  recorder field first (a recorder change, not a game change) — until
  then, every herald-screen table figure must carry the latch caveat
  or not be cited.

## Findings noted for the coordinator backlog (NOT appended by this worker)

- Untouched bearer, second sighting: player ends 100/100 in the
  98205 slain fight while 2/10 allies die, never acting (evidence:
  perseed-heraldband-widen/fo-closecommit-s98205-r1.json).
- Titan-fight pathing persists: "No path there." ×34 in the kept 300
  lines of the 98205 fight (pilot: ×112) — same class, lower count.
- Muster-gate refusals dominate contacts: 98202 (6/10, 26 refusals),
  98207 (0/10, 23 refusals with NO call line recorded — callHeard
  false, dailyTrace empty). Refused attempts without a CALL line need
  a classification ruling for future screens (this run: refused-only
  by attempts, call day reported as null honestly).
- Pending without attempts: 98206 called d103, herald present d130,
  zero titan attempts in 27 days, game won — pending ≠ marching.
- Recorder gap: tableDone is not separately recorded (latch only);
  split the field before any screen needs tableDone.
- Scale-wall movement, descriptive only: national 3/8 (pilot 0/8),
  wave-5 unlock 1/8 (98201, national + won, no call); full seat still
  unproven on this corpus; no wave-5 monster fought in the wild.
- Titan kill does not save the village: 98205 reached national, slew
  the Herald d87, and died d88 (village-lost) — run-length pressure
  continues past the titan.

## Village assessment (plain words)

Eight villages, same coalition-seeking policy. Three reached national
standing and one of those unlocked wave 5 and won its game — the
first time a herald screen has shown either — but none of that came
through the Herald: the wave-5 village never heard the call at all.
Only one village actually fought the Herald: ten allies from three
fires marched the day after the call, two died, and the 700-health
beast was ground down to nothing while the player stood untouched —
a real coalition kill that reads heroic in its price and shaky in
its pathing. Two more villages heard the call or its echo and got
nowhere: one was refused at the muster gate (six blades where ten
were needed), the other waited 27 days with the Herald still standing
nearby and never even attempted a march before winning its own game.
The other four villages lived and died without the call ever sounding.
The blank this run fills is narrow but real: the fight recorder holds
up on a second fresh band (zero problems), the Herald chain produces
a joinable, readable kill when it fires — and it fires rarely, and
when it fires the gate, not the fight, is usually what stops it.

## Proof

scripts/test-heraldband-widen-20261103.js: **13 passed, 0 failed**
(corpus-shape fixtures: joins, classes incl. the 98207 refused-without-
call shape, orphan/unjoined non-yield, yield per called/per band/
combined, wall numbers + even median, one-seed-counts-once). No
game-code change; no [needs-eyes] (instrument-only arm; the pathing/
bearer findings are backlog items, not feel changes by this arm).
