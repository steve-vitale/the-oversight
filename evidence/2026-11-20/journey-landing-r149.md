# Journey-landing r149 — run note (Lane A, leg 0 LANDING)

Run: `playtest-20261120T0945Z`, Fri 2026-11-20 03:45 CST. Leg 0 landing
(days 1–14 judged, horizon d28). Base master `6b8051ec2` (journey-scale
r246 adoption). Rotation read `0`, write `0→1` at closeout on success.
Prereg: `evidence/2026-11-20/journey-landing-r149-prereg.md`.
Seeds **1272–1281** (fresh band; see prereg for the freshness check).
Driver: `scripts/journey-landing-r149-20261120.js` (r148 driver verbatim
except header/seeds/OUTDIR). Analyzer: v3 zerodmg split
(`scripts/analyze-landing-r149-zerodmg-v3.js`) — refused-turns binds at 0,
stood-through-by-choice reported only (r148 metric-review item 1).

## Q1 — pre-registered panel (BEFORE, DAYS=28)

**Verdict: NO-GO — three binding misses.** All 10 villages alive at d28;
System contact 9×d8 + 1×d9 (1274).

| Metric | Bar | BEFORE | Verdict |
|---|---|---|---|
| M1 alive d28 | 10/10 | 10/10 | PASS |
| M2 System contact by d9 | 10/10 | 10/10 (9×d8, 1×d9) | PASS |
| M3 fight-log triggers | 0 unknown/mixed | 0 (pending-face 2, monster-approach 1) | PASS |
| refused-turns (NEW, binds) | 0 | **33** | **FAIL** |
| Practice movedCells / seeds | ≥50, 10/10 | 100, 10/10, skill0→pos 65 | PASS |
| Pocket | 0 | 0 (stuckTurns 3) | PASS |
| D1 garbled | 0 | 0 | PASS |
| HEED-V | 0 | 0 | PASS |
| M-PR1 never-offered (revised) | ≤15% | 1/19 = 5.3% | PASS |
| Bridge repeats (personal/small) | 0 | 0 | PASS |
| Goal-pool verbatim repeats | 0 | **1** (1274 d7) | **FAIL** |
| Dry lines / silentTurns | 0 / 0 | 0 / 0 | PASS |
| Scholar deaths | ≤2 | **3** | **FAIL** |
| FIGHTALLY2 | no 2+ ally zero-DMG/stuck | 1277 d21 (3 allies, zero-DMG, stuck) — same finding as refused-turns | FAIL (same) |
| Door-flee | 0 | 0 | PASS |
| Link-accept voiced + variety | voiced, no repeat streak | 38 accepts, all voiced, 21/17 | PASS |
| Counter-label guarded noun | — | 7 sampled, all noun-phrase (incl. "something") | PASS |
| Confide exit / volley-no-ammo | — | 0 occurrences / 0 events (untested, no failure) | — |
| Warned-but-unresolved | 0 | 0 | PASS |
| Nodloop LOOP | 0 | 0 (6 nv sittings) | PASS |

Panel shape: 23 fights (volatile range continues); win-plans d14 0/10,
d28 2/10 (1272, 1279 — flicker: r146 2, r147 0, r148 2, r149 2);
hungry-at-horizon 3/10 (1272: 1639, 1273: 598, 1280: 1370 kcal/person);
starvation deaths 0; R66 NOT-HUNGRY; fledBad probe fired 3× (see Q2);
R68 PARTY offered 8 / accepted 6 / spoken 8 / dry 0 — PARTY-GO; R67 case
labeling 20/20 GO; R85 rescue (kcal) 7/7 RESCUE-GO; R88 eat-on-arrival
7/7 EAT-GO; R88 ARMOR-SILENT CONTRADICTED (teleOk 10, lineMissing 2,
silentWild 1, silentHaven 2 — a line-missing craft on a scholar-haven day);
succession latencies [0,1,0]; hunt H0-ESTABLISHED (48 reps, max 7);
outing chain CHAIN-COMPLETES-FAR; together-blocked breaks 6, all "carry
0 kcal"; presshop farUnreached 2 (reported only).

### Miss 1 — refused-turns 33 (the blank this run fixes)

Seed 1277 d21, The Paparazzo (wave 2, 72 HP), allies Dmitri / Benoit /
Owen, 5 rounds, won. The scholar stood at the grid corner (8,8) when the
Paparazzo's Flash Photography windup fired; the move_windup trick called
`beastDodgeMove`, which tried **every free interior tile nearest-first —
33 attempts in one turn** — although every tile was 5+ squares away and
the scholar had 3 squares of movement left. The game refused each one
("Too far — 3 squares left." ×2, "No path there." ×2, 29 silent);
rounds 2–4 no scholar verb; round 5 one successful move to (5,5); the
allies won (Benoit 73 dmg). Panel-wide failed moves 48 (nopath 5, toofar
2, silent-noline 41 — 33 of the 41 are this fight).

Mechanism, pinned in code (not guessed):

- Policy side: `beastDodgeMove` (`scripts/policies/competent.js`) was the
  only fight-step helper without the R140 budget stop and without a
  reachability check. `closeStep` and `beastStrikeTarget` already carry
  both. The dodge sorts every free tile nearest-first and calls
  `tbPlayerMove` on each unconditionally; the near tiles (distance 1–4
  from (8,8)) were correctly excluded as telegraph/occupied, leaving only
  unreachable far tiles to be attempted one by one.
- Game side: the 29 "silent" failures are **not** a narration defect.
  `Game.emit` dedupes consecutive identical lines (Steve 2026-10-05:
  "never say the exact same thing twice in a row") — the engine said
  "Too far — 3 squares left." once and then correctly refused to repeat
  the same sentence 29 times. The refusal happened; the player sees it
  once. No game change needed. (The r128 analyzer's "silent-noline"
  label is an instrument artifact of that dedup, not a game defect.)

Fix (this run, see below): reachability pre-check + R140 budget stop in
`beastDodgeMove`. A hopeless candidate is never attempted, so it is never
a refused turn.

### Miss 2 — goal-pool verbatim repeat 1

Transcript 1274 d7, Omar: the goal-pool bridge line "Anyway — that's my
cross to carry. What's on your mind?" served twice in one sitting (turns
8 and 16, both as the THEM response to `[dlg:subject]`). Root cause: the
goal pool held exactly **2 lines**, so `convoPickCycle`'s
without-replacement cycle is strict alternation A,B,A,B — a third draw
repeats. This is the same defect class the personal (r125), want
(r124/r146) and small (r127) pools already had fixed by expansion; goal
was the last 2-line pool that serves often enough to repeat (4 servings
this panel, 1 repeat sitting). Fix (this run, see below): 2 → 6 lines,
same voice. The sitting itself is otherwise healthy: a real secret
opening (Omar confides skimming extra food, ashamed), wind-down
surfaces, goal thread resolves stage 3, beast-naming (The Reverend /
Mister Never). Also shows the carried lead-in nit ("Huh. Let me think
about that." twice) and the quip "Extremely normal, all of it."

### Miss 3 — scholar deaths 3 (bar ≤2)

Kwame, seed 1276 d8, "the wild" → mantle Jorge d8, latency 0. Bill,
seed 1277 d25, dehydration → mantle Luigi d26, latency 1. Chester, seed
1280 d16, "the wild" → mantle Shannon d16, latency 0. All three are fair
shapes, not defects: wild deaths with full pantries (17,500 / 23,618 /
23,200 kcal), proper succession, latencies 0/1/0, Codex page + village
reaction + grave scene for Kwame. The game is hard by design; the bar
miss stands (a miss is a miss under §14) but no fix is owed — the deaths
trip the bar, they don't indicate a broken system. Bill's dehydration
has no Haven-water contradiction in the record (no R66/R88 flag fired
for him).

### Other zero-DMG fights (reported, not binding)

- S-shape, 1276 d23, Big Big (statickite, wave 2): the scholar struck 4×
  for 0 damage — "It's high overhead — out of Fire-hardened spear reach.
  Watch the mark, not the kite." The monster flies; the spear can't
  reach it; the game narrates honestly each time, Ruth dealt all 98 dmg
  and the fight was won with the scholar unharmed. Policy gap, not a
  silent-action defect: the strike path doesn't check vertical reach
  before striking, so a competent player would stop after the first
  "out of reach" and do something else. Carried as an observation — the
  fix needs engine knowledge of "high overhead" state, a bigger
  investigation than this run's blank.
- No-strikes, 1281 d24, Lockpick (wave 1): routed at start, 0 monster
  turns, 0 scholar verbs — the routed-at-start exclusion.

## Q2 — people check (read in full)

- **warn_you (Q1b — reproduces, worse than the nit).** Transcript 1278
  d11, Lucas: want=warn_you stage 0, but the warning never surfaces.
  The opener is a betrayal case (the ambush of Onni) plus a secret ("I
  don't actually know how to swim..."); the player leaves at turn 0 and
  the sitting runs tellbeast/namebeast instead; the want ends stage 3,
  resolution=unestablished, with **no danger ever named**. The r148 nit
  (the warning never names the danger) stands and extends: here the
  warning never appears at all. Carried as a dialogue-arm blank — the
  fix needs a design decision (how forcefully a pending warning should
  shape the opener), not a line tweak. Not fixed this run.
- **Mourning (strong).** Transcript 1281 d16, Aki: the player asks "How
  are you holding up? About... them." Aki: "Hunter always took the burnt
  piece. Said someone had to. I take it now." — the dead person's name
  is worn, a concrete remembered habit, and the survivor has taken it up.
  Then: "I hum one note, over and over, when the dark comes. It doesn't
  bring anyone back. It just keeps my hands from shaking." / "We bury,
  we grieve, we keep going. There's no step four." The r254
  witness-variant shape works: grief with texture, a named dead person,
  a carried habit.
- **Link-accept (holds).** 1280 d24 (Scarlett, Emberhold): accept voiced
  ("Good. What I've heard of them, I believe. Go and ask."), then a
  betrayal:decline acknowledged ("Another time, then." — pocketed), then
  a real thread ("Any regrets? The real kind, not the small stuff.").
  Panel split 21/17 — the r148 rotation fix holds in live play.
- **COUNT LIE 1274 d6 — false positive, confirmed.** "I keep meaning to
  learn everyone's name. Twelve people. It shouldn't be hard." The
  living roster IS 12 — the count is TRUE. The analyzer flags the number
  mention regardless (it prints the roster size and still flags it).
  Analyzer precision note, not a game defect.
- **Re-poses 3/3 real.** All three verbatimRepeatsExempted are "RE-POSE
  EXEMPT (resume x1, opener)" — the opener re-posed once after a resume.
  Legitimate, not a repeat defect.
- **fledBad probe — no bad flee happened.** 0 playerFled fights in the
  panel; the 1273 d26 redactor fight (flagged at 88% HP) was WON
  (scholar 88→88 HP, dealt 40 dmg). The probe samples flee
  *considerations*, not flees. The 1277 d26 spool sample (monster at 6%
  HP) has no fight record at all — the outmatched increment fired at a
  face/flee decision on a nearly-dead monster. Open curiosity about the
  outmatched trigger, not a demonstrated bad flee; needs one look next
  run, not a fix now.
- **R88 ARMOR-SILENT contradiction (carried).** teleOk 10, lineMissing 2,
  silentWild 1, silentHaven 2 — a line-missing craft on a scholar-haven
  day. Same shape as r148; carried, not re-litigated here.

## Fixes landed (this run)

### Fix 1 — dodge reachability (`scripts/policies/competent.js`)

`beastDodgeMove` now mirrors the game's own up-front pricing before
calling `tbPlayerMove` (new helper `beastDodgeReachable`: a path must
exist and its full terrain cost must fit inside moveLeft) and stops the
scan at once when moveLeft is spent (R140 budget stop, as closeStep /
beastStrikeTarget already carry). Fail-open: a Game without findPath /
tbTerrainCost attempts the candidate as before. Callers unchanged
(move_windup, sidestep); 'stuck' still records dodgeStuckTurns and ends
the turn without counting the trick (r128 semantics).

Proof test `scripts/test-journey-landing-r149-dodge-reachability-20261120.js`
(4 cases, stub Game with faithful Chebyshev geometry + the game's
up-front pricing): **RED verified** — windup-corner made 33 calls on
unfixed code (exactly the panel's 33), budget-zero 45, sidestep-corner
40; **GREEN after the fix** (0 calls on all three hopeless shapes, 1
call on the reachable control, scholar moves to (3,3), trick counted).
Neighbors green: r128 dodge-fallback, r145 door-approach, r149
zerodmg-split.

### Fix 2 — goal bridge pool (`src/js/convo-beats.js`)

`BRIDGES.goal` 2 → 6 lines, same voice (the villager steps back from
their goal/burden and hands the floor to the player), originals kept as
entries 1–2, with the established r125/r127 comment. No call-site
change.

Proof test `scripts/test-journey-landing-r149-goal-bridge-20261120.js`
(pool / window / control, mirroring r127): **RED verified** — strict
alternation A,B,A,B,A,B, distinct=2; **GREEN after the fix** (6 distinct,
no repeat in any 3-window over 12 draws). The test's extraction uses
mid-line fragments, not full lines: voiceLine may append a closer
(", friend?") before the closing quote, which breaks full-line substring
matching — found on the 6th draw during the RED run.

### Fix 3 — closeStep + beastStrikeTarget null-path skip (`scripts/policies/competent.js`)

The Fix 1+2 re-panel left one residual: **14 failed moves, all in one
fight** — seed 1277 d25 vs the Spool (wave 3, 288 HP, 9 rounds, won).
The scholar at (8,8) tried 7 tiles per round for two rounds: (7,7) "No
path there.", then (6,7), (7,6), (5,5), (5,7), (6,5), (7,5) silent
(deduped); the scholar then struck 4× for damage once the Spool closed
in and the fight was won. The v3 metric excludes them by design (the
scholar dealt damage — not a zero-DMG fight), and stuckFights=0, so no
bar tripped — but the turns are wasted on refused verbs, the same defect
family as the dodge scan.

Root cause, pinned in code: `closeStep` calls `Game.findPath` and uses
the path ONLY to truncate a too-long step — it **never checks whether
the path EXISTS**, so a null-path candidate is attempted anyway and
refused "No path there." The 7 tiles are the ring adjacent to the Spool
(which sits at ~(6,6)); (5,6) was occupied by an ally. `game.js
findPath` returns null from (8,8): the orthogonal edge neighbours
(7,8)/(8,7) are barrier walls and the diagonal is corner-cut-blocked —
the scholar is walled in at the corner. `beastStrikeTarget` has the
identical shape (a null path falls through to the full-destination
attempt). The Spool has no policy counter, so no trick fired for it and
the 14 attempts are NOT from beastDodgeMove.

Fix: one line in each helper — after `const path = Game.findPath(...)`,
`if (!path || !path.length) continue;` (R149 NO-PATH SKIP comment).
Fail-open preserved: when findPath is missing, the candidate is
attempted as before.

Proof test `scripts/test-journey-landing-r149-close-nopath-20261120.js`
(4 cases, stub Game modeling the walled-in corner): **RED verified** —
close-corner 8 calls, strike-corner 8 calls on unfixed code; **GREEN
after the fix** (0 calls on both hopeless shapes, 1 call on each
reachable control, scholar moves to (4,4)). Neighbors re-run after the
fix, all green: r128 close-fallback (13 PASS), r128 dodge-fallback (39
PASS), r127 strike-fallback (16 PASS), r149 dodge-reachability (26
PASS), r149 goal-bridge (9 PASS), r149 zerodmg-split (6 PASS), r145
door-approach (19 PASS; the file is
`test-journey-landing-r145-door-approach-20261118.js` — the plan's
bare name was wrong, not the test).

### Test-instrument hardening (same run, pre-existing flake)

The r124 want-bridge and r125 personal-bridge proof tests failed on
**pristine code** (verified by stashing the two source fixes: r124 7
FAIL lines, r125 2 — worse than with the fixes). Cause: full-line
substring extraction breaks two ways — voiceLine's random closer, and
stale line lists (r124 listed 6 of the current 10 want lines after the
r146 expansion; r125 listed 2 of the current 6 small lines after r127).
Hardened both to the same mid-line-fragment extraction as the new r149
test (assertions unchanged in strength — same distinctness / window /
control checks, only the measurement fixed). Both ALL GREEN now, stable
across a repeat run. r127/r146 tests were already green and untouched.

## Q1 — matched re-panel (AFTER-FIX, same seeds 1272–1281, DAYS=28)

**Verdict: NO-GO — one binding miss remains (scholar deaths 3, fair
shapes, no fix owed).** Both BEFORE misses that had a fix are fixed and
verified in live play. The re-panel ran on the final code (Fix 1 + Fix 2
+ Fix 3), DAYS=28, absolute OUTDIR, same 10 seeds. The timeline did NOT
diverge: same 23 fights, same three zero-DMG fights with the same
shapes, same per-seed fight counts (1277 still the fight-heavy seed at
10), same M-PR1 sittings, same link-accept split — the fixes change
refused verbs, not outcomes.

| Metric | Bar | BEFORE | AFTER-FIX | Verdict |
|---|---|---|---|---|
| M1 alive d28 | 10/10 | 10/10 | 10/10 | PASS |
| M2 System contact by d9 | 10/10 | 10/10 (9×d8, 1×d9) | 10/10 (9×d8, 1×d9) | PASS |
| M3 fight-log triggers | 0 unknown/mixed | 0 (zero-DMG subset) | 0 (full panel: 12 monster-approach, 10 pending-face, 1 contest-arena) | PASS |
| refused-turns (binds) | 0 | **33** | **0** | PASS |
| Practice movedCells / seeds | ≥50, 10/10 | 100, 10/10, skill0→pos 65 | 100, 10/10, skill0→pos 65 | PASS |
| Pocket | 0 | 0 (stuckTurns 3) | 0 (stuckTurns 0, pocketFights 0, sealedRegions 0) | PASS |
| D1 garbled | 0 | 0 | 0 | PASS |
| HEED-V | 0 | 0 | 0 | PASS |
| M-PR1 never-offered (revised) | ≤15% | 1/19 = 5.3% | 1/19 = 5.3% (same 4 unestablished excluded; statedAfterPick 2, both the honest away-guard road line) | PASS |
| Bridge repeats (personal/small) | 0 | 0 | 0 (personal servings 19, small 4) | PASS |
| Goal-pool verbatim repeats | 0 | **1** (1274 d7) | **0** (goal servings 1) | PASS |
| Dry lines / silentTurns | 0 / 0 | 0 / 0 | 0 / 0 | PASS |
| Scholar deaths | ≤2 | **3** | **3** (same three: Kwame d8, Bill d25, Chester d16) | **FAIL** |
| FIGHTALLY2 | no 2+ ally zero-DMG/stuck | 1277 d21 (3 allies, zero-DMG, stuck) | resolved — the same fight now has refusedTurns 0, stoodThroughByChoice 1 | PASS |
| Door-flee | 0 | 0 | 0 playerFled | PASS |
| Link-accept voiced + variety | voiced, no repeat streak | 38 accepts, all voiced, 21/17 | 38 accepts, all voiced, 21/17 | PASS |
| Counter-label guarded noun | — | 7 sampled, all noun-phrase | 3 lines, all noun-phrase (Highbeam Deer, Rut King, "a crow that watches too long and blinks too little") | PASS |
| Confide exit / volley-no-ammo | — | 0 / 0 (untested) | 0 / 0 (untested, no failure) | — |
| Warned-but-unresolved | 0 | 0 | 0 | PASS |
| Nodloop LOOP | 0 | 0 (6 nv sittings) | 0 (6 nv sittings) | PASS |
| React wind-down | no dlg:react at reactDryCount ≥2 | — | 0 violations (guard in convo-wants.js:2944 + convo-beats.js:488 filters dlg:react at ≥2; 238 reacts are normal exchanges) | PASS |

Failed moves (r128): BEFORE 48 (nopath 5, toofar 2, silent-noline 41);
AFTER **0 of 22 total moves** — the 14 refused approach steps in the
1277 d25 Spool fight are gone with Fix 3, and the 33 dodge refusals are
gone with Fix 1. Zero-DMG fights still 3, same shapes: S-shape 1276 d23
(Big Big, Ruth 98 dmg), B-shape 1277 d21 (Paparazzo, refusedTurns 0,
allies Dmitri/Benoit/Owen, othersDmg 120, scholarTook 29, won),
no-strikes 1281 d24 (Lockpick, routed at start).

Panel shape (unchanged): 23 fights; win-plans d14 0/10, d28 2/10 (1272,
1279 — flicker: r146 2, r147 0, r148 2, r149 2); hungry-at-horizon 3/10
(same seeds: 1272: 1639, 1273: 598, 1280: 1370 kcal/person); starvation
deaths 0; R66 NOT-HUNGRY; fledBad probe 3×, same three (1273 d26
redactor 88% HP, 1277 d13 lockpick_raccoon 34%, 1277 d26 spool 6% — all
flee *considerations*, 0 actual flees); R68 PARTY 8/6 GO; R67 20/20 GO;
R85 7/7 RESCUE-GO; R88 EAT 7/7 GO; R88 ARMOR-SILENT still CONTRADICTED
(same counts: teleOk 10, lineMissing 2, silentWild 1, silentHaven 2 —
carried); succession latencies [0,1,0]; hunt H0-ESTABLISHED; outing
chain CHAIN-COMPLETES-FAR; together-blocked breaks 6, all "carry 0
kcal"; presshop farUnreached 2 (reported only).

**Outing-chain contradiction — resolved.** The 14-day artifact (seed
1274 Aubrey, together attempt d15 with haul 1485 but no run in any
snap) was an artifact of the truncated series. On the true 28-day
panel the chain reads `rung=kept departed=true togOk=1 maxHaul=1485
delivered=1485 state=thanked` — the run DID happen and the haul was
delivered. The d15 together-blocked attempt is a LATER attempt on the
same favor after delivery, correctly refused with empty hands ("You
carry 0 kcal..."). Not a defect.

**The first fix-panel attempt ran DAYS=14** (driver default; DAYS was
not passed) and landed its corpus under a relative OUTDIR inside the
worktree — both footguns, both caught before the note was written. The
14-day numbers are NOT used anywhere in this note. **A second attempt
died in a write flap** (see Infrastructure notes): the panel exited 1
having written nothing; the corpus survived intact and the panel was
re-run clean once the flap cleared (~11:23Z). The numbers above are
from that clean re-run (1692-line analyzers log, regenerated).

## Village assessment (plain words)

Ten villages, all alive at day 28. Nobody starved; the pantries end
thin in three villages (one down to 598 kcal a person) but nobody went
without — the thin villages are the watch item, not a crisis. The
System reached every village by day 9, most by day 8. People are
learning: every village's practice moved (100 cells across the panel),
skills that started at zero are now positive in 65 cases, and the
villages are starting to plan together — two of ten have a real win-plan
seeded by day 28, the same two as before the fixes, so the fixes didn't
move the story, only the wasted turns.

The dead: three scholars, all in fair fights with the wild — Kwame on
day 8, Bill on day 25 (thirst, with a full pantry behind him), Chester
on day 16. Each was properly mourned and succeeded the same day or the
next, and the villages carried on. That is the game being hard, not
broken.

What the fixes mean in plain words: before, a fighter backed into a
corner would waste their whole turn trying to step to tiles they could
never reach — 33 wasted tries in one fight, 14 in another. Now they
stand their ground instead of flailing, and the fight plays out the
same way it should have. And a villager talking about their own goal no
longer repeats the same sentence twice in one conversation.

The people still read as people: grief has texture (Aki taking up the
dead Hunter's burnt piece), warnings still sometimes never surface
(Lucas, 1278 d11 — carried blank), and link-accepts are still voiced
and varied (38 accepts, 21/17 split). The armor-craft line still goes
missing on a scholar-haven day (carried contradiction), and the
high-flying monster still can't be hit by a spear (carried
observation).

## Reachable / fun / winnable

- **Reachable:** yes. All 10 villages reach System contact, practice,
  favors, outings, and fights in the first fortnight; two seed win-plans
  by day 28. Nothing in the leg is gated behind content the panel
  couldn't reach.
- **Fun:** yes, with the same caveats as r148. Conversations have
  meaning (real secrets, real refusals, voiced accepts), fights are real
  fights, and the two fixed blanks remove visible nonsense (a fighter
  flailing at unreachable tiles; a villager repeating herself). The
  remaining rough edges are the carried ones: the warning that never
  surfaces, the spear that can't reach a flying monster.
- **Winnable:** not yet, and this leg doesn't move it. No village
  reaches wave 4 kills, no muster, no table plan — the win chain's
  binding links are all beyond day 28, as before. The fixes remove
  wasted turns, not a win blocker. The scholar-deaths bar miss (3 vs
  ≤2) is the only NO-GO item and it is fair difficulty, not a defect —
  the run lands with the miss recorded, per §14, and the fixes in.

## Metric review (§14)

1. **refused-turns binds at 0; stood-through-by-choice reported only**
   (adopted from r148) — worked as designed: the B-shape fight's 33
   refused turns bound the run NO-GO, and the split kept the honest
   "stood through it" shape visible without punishing it. Keep.
2. **The "silent-noline" label in the r128 analyzer over-counts
   silence.** 29 of the 33 failed moves in the 1277 fight were the
   engine's intentional consecutive-duplicate dedup, not silent
   refusals. The v3 refused-turns count (which counts the attempt, not
   the line) is the binding instrument; the byReason "silent-noline"
   bucket should be read as "refused, line deduped" and not treated as
   a narration gap. Propose for r150: relabel the bucket or split it
   (deduped vs truly silent) so the next run doesn't re-litigate this.
3. **Scholar-deaths bar (≤2) tripped on fair deaths.** Three deaths,
   all fair shapes, tripped a NO-GO. The bar is a tripwire and it did
   its job (it forced the fairness read), but a bar that fires on
   healthy difficulty is noisy. Propose for r150: keep the bar, but
   record the fairness adjudication alongside it — a miss on fair
   deaths is a note, not a defect, and shouldn't by itself block a
   landing that fixes the binding defect.
4. **Goal-pool repeat is the last of its class.** Personal, want, small
   and now goal are all 6+ lines. The remaining 2-line pools (grief,
   cheer, past, village, plans, gossip) serve 0–1× per 100 sittings —
   no evidence of repeats; leave them until evidence shows one.
5. **refused-turns binds only inside zero-DMG fights — and the Spool
   fight shows the gap.** The 14 refused approach steps in the 1277
   d25 Spool fight did NOT bind (the scholar dealt damage, so the
   fight isn't zero-DMG) — the fix landed anyway because the same
   defect family showed in a non-binding fight. Propose for r150:
   extend the refused-turns count to all fights (or report a second
   "refused moves, all fights" line alongside the binding zero-DMG
   count) so a wasted-turns shape can't hide behind a damage-dealing
   scholar.

## Q3 — Telemetry

`telemetry-check.js` vs baseline `landing-split.json` (81/9/217/15/0,
re-pinned r136): **quiet** on the pre-registered panel and **quiet** on
the fix re-panel (10 files, 5 metrics, no large deviations). Baseline
NOT rolled — neither panel carries new information that moves it. No
LOUD lines.

## Q4 — Gate (adoption adjudication)

Adoption gate, run 2026-11-20 ~16:00Z on the final worktree code (Fix 1 +
Fix 2 + Fix 3): `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-playtest` — **334 passed, 10 failed in
1395s** (log `evidence/2026-11-20/journey-landing-r149-gate-adopt.log`).
**0 attributable.** The failure set is the standing profile: 9 of 10 are
identical to the r148 rebased gate (334/10, same count) — the
measurement-proof staleness pair
(`test-measurement-proof-update.js`, `test-measurement-workflow.js`),
`test-measurement-cache-flags.js`, the stale phone-frame receipt
(`test-phone-frame-proof.js`), and five 120s timeouts under a loaded
machine (load avg ~19.6 during the run:
`test-living-garden-deed-attainment.js`,
`test-occupation-panels.js`,
`test-one-person-army-deed-attainment.js`,
`test-trust-observer-neutrality.js`, `test-capable-bot-20261014.js`).
The tenth slot swaps by load flake: r148-rebased failed
`test-deathcleanup-instrument-20261117.js` (passes here) while this gate
timed out `test-synergy-stall.js` at 120.2s (its first gate appearance in
this series; a load timeout, not a code failure). No failure names
`convo-beats.js`, `competent.js`, or any landing/policy/conversation
test — all six r149 proof tests and all four neighbor tests pass
directly (26/26, 9/9, 14/14, 6/6, 9/9, 9/9; neighbors 13/13, 39/39,
16/16, 19/19). The partial gate log from the original run (197 bytes,
gate started 11:43Z, killed at timeout) is preserved in the goal
workspace as `journey-landing-r149-gate.log`; the adoption gate is the
adjudicating run.

## Infrastructure notes

- **Write flap:** one short burst at registration (onset 09:57:26Z,
  ~3 min; probes A/B/E/G/H/I EPERM; `git worktree add` wrote 105260
  files then failed "Could not reset index file to revision 'HEAD'").
  Window cleared ~10:00:34Z; re-registration clean. Same shape as the
  2026-11-19 bursts. Nothing lost.
- **Write flap, second burst (longer):** onset ~11:02:30Z, cleared
  ~11:23Z (~21 min). It killed a fix-panel re-run mid-flight
  (PANEL-EXIT=1, panel wrote nothing; the analyzers' log write was
  refused too). The corpus survived intact (all 166 files, 10:56
  mtimes) and only the two regenerable logs were lost (the good
  1692-line analyzers log was deleted by my own `rm -f` just before
  the flap hit — regenerable from the corpus, which is what happened).
  The panel + analyzers were re-run clean after the flap cleared.
  Lesson: never `rm` the good log until the replacement run has
  produced its own.
- **Heartbeat gap during the flap:** the registered heartbeat for
  journey-landing went stale at 10:47:50Z and stayed stale through the
  flap (the hbloop process was alive and cycling, but its beats
  stopped landing — the log shows only 6 lines, last write 10:47; a
  manual heartbeat during the flap failed in `atomic_write_json`
  with EPERM). Restored manually at 11:23:22Z once the flap cleared
  (two passing probes + a landed atomic write). The pre-flap gap
  (10:47→11:02, watcher ALL-OK throughout) is unexplained — the
  hbloop's `>>` append to its own log may have been refused in an
  unlogged micro-window, or the loop stalled between cycles. The tree
  was never at real risk (dirty worktree, reaper skips dirty trees),
  but a 35-minute stale heartbeat is how a live run looks dead — worth
  one look at the hbloop's silent-failure path next run.
- **OUTDIR footgun (new):** the driver takes `process.env.OUTDIR`
  verbatim when set — a relative OUTDIR lands the corpus under the
  CWD (the worktree), not under $HOME. The first fix-panel attempt
  wrote 134 files to `~/workspace/worktrees/journey-landing/workspace/...`.
  Caught by the analyzers' ENOENT, corpus moved intact to the right
  place, stray worktree `workspace/` removed. Always pass an absolute
  OUTDIR.
- **DAYS footgun (new):** the driver defaults to DAYS=14
  (`parseInt(process.env.DAYS || '14', 10)`). The first fix-panel
  attempt ran 14 days, not 28 — the d21 Paparazzo fight was never
  re-tested and every fix-panel number from that run is invalid for
  the 28-day comparison. Caught by the census `series` stopping cleanly
  at d14 on all 10 seeds (plus max transcript/fight day 14). The panel
  was re-run with DAYS=28. Always pass DAYS explicitly; check max
  series day == DAYS before trusting a panel.
- **Gate note:** the r124/r125 proof-test flake (voice-closer +
  stale line lists) is fixed in this run; see Fixes above.

## Adoption addendum (r150 occurrence, playtest-loop-a-20261120T1545Z)

The original run (`playtest-20261120T0945Z`) timed out during its gate
(the partial 197-byte gate log, started 11:43Z). Two main-session
re-adoption attempts verified the run dead and stopped (first on the
11:46Z write flap, second deferring to this live Lane A occurrence).
This occurrence adopted the stranded work: the run's own note was
already complete except Q4 (filled above from the adoption gate); the
BEFORE panel, all three fixes, all proof tests, and the AFTER-FIX panel
were verified from files, not from the run's word — diffs read,
proof/neighbor tests re-run green, after-fix numbers spot-checked
against the 1,692-line analyzer log (refusedTurns 0, goal repeats 0,
scholar deaths 3 with the same three names/days, win-plans d28 2/10,
practice 100/65), telemetry re-run quiet on both panels.

Adoption repairs and corrections (nothing else changed):
- `docs/ONTOLOGY.md` was truncated to 0 bytes by a write flap at
  14:09Z (2,199 deletions, uncommitted — not r149 work); restored from
  HEAD, verified 354,229 bytes. No other file in the worktree carried
  flap damage.
- Ruth's damage in the S-shape fight is 98, not 96, in both analyzer
  logs (BEFORE and AFTER-FIX); the note's two "96" mentions are
  corrected above. The timeline did not diverge — the number was
  transcribed wrong, in both sections.
- Heartbeat stall (carried observation, not fixed here): the hbloop's
  16:02Z beat hung ~19 min on the registry `flock` (no timeout in
  `worktree-heartbeat.sh`) behind a sibling holder; the queued beats
  landed at 16:21:30Z once the lock cleared. A flock timeout is worth
  one look next run — the r149 note flagged the same silent-failure
  shape at 10:47Z.

Closeout: commit + ff-only merge + worktree release + rotation 0→1 by
this occurrence. The scholar-deaths bar miss (3 vs ≤2, fair deaths)
stands recorded per §14; the run lands with the miss, per the metric
review's item 3.
