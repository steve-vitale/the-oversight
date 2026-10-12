# Long-run sim — LEVER 6 ROUND 8: repeat-winner adaptation audit (2026-10-12)

Canon read first: docs/CANON.md, docs/CONTESTS.md ("Contests are played,
not RNG"; "Prizes must be worth the fear"; the fear design — countdown
dread, mandatory teleport, death on the table). Steve 2026-10-11: "win
rate must drop for repeat winners; first-timers stay fair."

Harness: scripts/sweep-contests-r8.js (extends the r7 census with an
adaptation census: _cxApplyAdaptation fires with phase-sig diff,
_cxStipulationFor kinds, _cxShowTwist, per-participant outcomes with
heat-before-bump + appearance index, hardened scalings, rival-hot,
pilot timing, fan-club growth). 16 seeds × competent + riskAware × 200d,
identical seeds before/after.

## The audit (BEFORE, pristine)

32 runs × 200d: 218 contests, 130 shows, 22 ratings summons, 3 contest
deaths, 154 care packages, 0 club votes.

- **First-timer win rate 82.2% (n=157); repeat (app 2–3) 68.8% (n=16).**
  By policy: competent (choice-0, always plays) first-timer 84.4%, repeat
  **87.5%** (n=8) — NO drop for the naive replay-everything player.
  riskAware first-timer 80%, repeat 50% (n=8).
- **heat-1 win rate 81.8% == heat-0 win rate 81.8%.** The heat→hardened
  mechanism shows no win-rate dent at heat 1.
- **The "hardened is GENUINELY different" claim does NOT verify:**
  20 distinct hardened contests, only **3 with genuinely different
  phases** (15%). The other 17 were phase-identical to plain — while the
  System said "some of your old lines won't work. The tapes don't lie."
  (the old byte-identical blank, plus a lie).
- **Stipulations: 0 firings in 218 contests. Show twists: 0 in 130
  shows. Rival-hot: 0 in 210 outcomes.** All three systems gate on
  same-contest repeat wins (bans need 2 wins; stipulations need 2 wins +
  boredom 2; rival needs 3 blood wins; twists need 3 airings of one
  show) — which almost never happens across a ~50-contest / ~20-show
  pool. In live play they are decoration. (Documented, not fixed this
  round — redesigning the gates is a bigger call than one lever; the
  dossier/heat lines + heat→hardened DO fire regularly.)
- **Show-format reachability: all 6 formats aired** (why_eat 6,
  moot_show 10, break_room 5, mouth_race 7, ask_human 6, death_reel 4).
  Pilot median day 16 (min 14) — the pilot guarantee holds.
- **Fan clubs:** showbiz avg 17.5, fight 2.0 — but **0 club votes in
  32 runs** (gate 25+ never reached); care packages fire freely (154).
  Votes are the unreachable half of the fan-club loop — documented blank.
- **Villagers act like people** in contest context (transcript sample,
  32 runs): "The village holds its breath" (98×), "You cheer until
  your throat hurts. Emma hears it", "The village winces on their
  behalf. They'll be kind about it. And they will never, ever let it
  go.", winner's-share pantry lines, post-win "the show has started
  calling you 'the strong one of Haven'", "You notice the village gives
  you room on the path now. Not fear, exactly. Room." All System-voiced
  collective reactions — coherent, consequential, human. **Gap:**
  no individual villager voices react to countdowns (design says "people
  avoid the eligible, or cling to them") — filed for lever 3 (villager
  agency), not this round.

## Sense-testing (transcripts read, not just counts)

scripts/sense-adapt-r8.js drives a full hardened blood contest (3 wins,
heat 3, boredom 2) and a stale show, capturing all say/sysSay.

Contest transcript verdict: the adaptation copy lands — "Third win in
The Pit. The System has studied the tapes. Your favorite moves are...
unavailable tonight.", "MAIN EVENT. Your heat is through the roof — the
galaxy didn't come to see a contest, it came to see YOU survive one.",
countdown dread ("It is today. You dreamed about the cameras. Everyone
did. The village is very quiet."), veteran coaching ("The beast feints
first, commits second..."), co-star ("Taken with you: James. Different
lights. Same cameras.").

Bugs found by reading:
1. **(FIXED this round)** "You take the Hunting spear. It feels honest.
   It's yours now." immediately followed by "You take the spear. It feels
   honest." — grantWeapon's generic line + the choice's bespoke do.note
   both fired. Now the generic line is skipped when a note exists.
2. **(FIXED this round)** the stipulation/MAIN-EVENT beat phase was
   UNREACHABLE — _cxInsertPhase shifted phase-0's nexts past the beat
   (phase 0 → old phase 1, beat orphaned at index 1, its next pointed at
   index 3 skipping a phase). Its entry damage NEVER applied, on any
   path, since the system landed. Tollbooth semantics restored: phase 0
   → beat → old phase 1.
3. (not a bug) "TONIGHT: WHY DO THEY EAT?. undefined" — my sense script
   passed an incomplete show object; the pool has descs. Script artifact.
4. (out of lever — filed) `Luz: "undefined"` — a villager dialogue line
   rendering undefined in the day-cycle transcript (conversation.js).
   For the conversation loop.

Show transcript verdict: the stale-show twist fires when forced
("MYSTERY INGREDIENT... The audience is bored of the rerun."), showbiz
fans +3, "Fan art of your grandmother's dish is already circulating."
Reads true. (Twists never fired organically in 32 runs — see above.)

## Lever played — heat→win-rate calibration: the MAIN-EVENT beat (exact)

src/js/contests.js, _cxApplyAdaptation + _cxStipulationPhase + _cxInsertPhase:

1. **Every hardened variant (heat≥1) now inserts a genuinely different
   beat phase at index 1** (was: only heat≥2, and the beat was
   unreachable). Kind selection is honest: 'no_repeat' only when the
   dossier really banned moves (br.banned > 0); otherwise the **handicap
   beat** — a real entry cost, said aloud.
2. **Exact numbers:** handicap entry cost dmg [4+2h, 8+3h], trauma 1+h
   (heat 1: [6,11] dmg + 2 trauma; heat 2: [8,14] + 3; heat 3: [10,17]
   + 4). First-timers (heat 0, wins 0) never reach the branch.
3. **Copy honesty:** the dishonest "some of your old lines won't work.
   The tapes don't lie." is GONE. Hardened-driven beats say MAIN EVENT
   ("the arena runs hotter tonight..."); crowd-voted beats keep the
   crowd-vote framing ("They've voted a HANDICAP" /
   "your greatest hits are BANNED tonight"). No phantom crowd votes.
4. **Tollbooth fix** (_cxInsertPhase): choices pointing AT the insertion
   index now address the new phase; the new phase's own nexts are
   post-insert coordinates. The beat is reachable and forwards correctly.
5. Ontology `hardened_real` rule extended (validator 85/85 green).

Commit carries [needs-eyes] (feel/combat-adjacent: entry damage + new
System copy on the contest path).

## Proof

- scripts/test-contest-hardened-r8.js **20/20** (×1 seed; mechanism,
  honesty, reachability, first-timer preservation, crowd-vote
  preservation). **RED-checked on pristine: 10 fail** (R1/R2/R2b/R2c/R4/
  R4b/R4d/R4e/R5b/R5c), 10 preserved-behavior pass.
- Regressions: test-contest-adapt-20261011.js 27/27, 
...[truncated 1986 chars]
