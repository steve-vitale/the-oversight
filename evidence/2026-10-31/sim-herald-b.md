# sim-herald-b — heraldic-refusal census: what refusal IS, and what it does to the meeting counts (MEASUREMENT ONLY)

Run: Loop B worker, axis scale-onramp, follow-up to sim-killconv-a and
sim-w4field-a. Worktree branch: sim-herald-b. Base anchor: see
per-seed JSONs (`anchorCommit` field; worktree HEAD at sweep time
7a2974684 plus the prereg/instrument commit 60650da6c).
Pre-registration: evidence/2026-10-31/sim-herald-b-prereg.md (written
BEFORE any judged sims; judged against it below).
Instrument: scripts/herald-instrument-20261030.js (HERALD=1, read-only,
det-gate proven) + scripts/herald-sweep-20261030.js +
scripts/herald-analyze-20261030.js.
Proof: scripts/test-herald-20261030.js — 20/20 green (det-gate on
60d leadfeast trajectory identical with/without instrument; static
read-only scan; caller/field/muster fixtures; real-sweep gate
byte-identical re-run).
Corpus: evidence/2026-10-31/perseed-herald/leadfeast/s85101–s85116.json.
No game code changed. No policy file edited. No [needs-eyes]
(measurement only, nothing player-facing). Panel (§15): NOT
APPLICABLE — single-base measurement, no before/after comparison
exists in this arm; none fabricated (same declaration as killconv
and w4field).

## Verdict: DIAG-GO

Judged exactly against the prereg's band rule:

- Completeness: 63/63 wave-4 startCombat attempts classified FOUGHT
  or REFUSED = 100% (>= 95% required).
- Cross-check (i) tbEnd join: 27/28 fought attempts carry a tbEnd
  result = 96.4% (>= 95% required). The single miss is the second of
  two same-day same-monster (day 134 reunion) fights on seed 85109;
  that seed's 134 day-hashes are byte-identical to killconv's, and
  killconv records that fight 'lost' — so the miss is an
  instrument-join limitation (the sweep joins by (day,mid) queue,
  not by fight id), not a missing fight. See metric review.
- Cross-check (ii) game-side refused records: 35/35 join to a
  REFUSED attempt on the same titan and day = 100% (>= 95%).
- instrumentErrors: 0 on all 16 seeds.
- Wave-4 startCombat attempts in the full band: 63 (>= 30 required).
- Band verdict components (a) refusal rates, (b) corrected
  fought-only numbers, (c) the 0-field-kill headline judged on
  fought field fights only: all present below.

## Answer in one paragraph

Refusal is the titan hard gate, and only the titan hard gate: every
one of the 35 Herald startCombat attempts in the reproducible band
was refused for MUSTER-GATE (0 allied blades mustered against a need
of 10), and no non-titan wave-4 attempt was ever refused (28/28
fought). The 35 refusals are not the scholar hammering "fight" —
they are the Herald itself walking onto the scholar's tile during
its own monster turn and the engine trying to start a fight the gate
forbids, up to 9 times in a single day, while the monster stays on
the tile. Nobody in the band ever sounds the call that the refusal
line prescribes (0 muster events on all 16 seeds), so the loop
repeats until the monster wanders off or the village dies. The
published counts correct as follows: naive TB "meetings" of 63 are
really 28 fought fights; the field-fight count of 30 was never
inflated at all (refusals are a scholar-TB-channel phenomenon and
field fights bypass the gate entirely); and the 0-field-kill
headline SURVIVES the correction — 0 kills in 27 fought field
fights, exactly as in 30 meetings. The TB kill story does move:
killconv's "3 wins in 28" becomes 2 wins in 28 on the reproducible
band, because its third win sat on seed 85112, whose corpus does
not reproduce (see replay section).

## What refusal IS in code (read, not guessed)

- `Game.startCombat` (src/js/game.js, `startCombat`) has exactly one
  in-body refusal: a live fight ("Already in a fight — finish this
  one first."). It never fired in this band (0 FIGHT-LIVE refusals;
  no THROWs either — no unknown-id throws on any wave-4 attempt).
- `titanWrapCombat` (src/js/titans.js, `titanWrapCombat`, installed
  at load) wraps `Game.startCombat` and, for a titan id (keys of
  src/data/titans.json: herald, finale, nielsen, the_network),
  refuses BEFORE the original body runs when the muster is not
  ready (`titanMusterReady` false): it says the ⛔ line, logs a
  game-side `state.titans.outcomes` record
  `{outcome:'refused', gate:'muster', have, need}`, and returns
  null. Because it returns before the body, the pending encounter
  (if any) is NOT cleared and the world monster is NOT lifted — the
  monster stays exactly where it was. The campaign-entry override
  (`titanEntryGate`, finale march only) never fired here: all 35
  refusals are gate-muster, 0 campaign-gate.
- Herald gate numbers (src/data/titans.json, `herald`): minAllies
  10. Monster data (src/data/monsters.json, `herald`): wave 4,
  aggression "heraldic", HP [700,900], "It does not attack. It
  ARRIVES."
- The other refusal-adjacent wrapper, `finaleWrapCombat`
  (src/js/finale-campaign.js), gates only `finale_crew` /
  `finale_opening` (march order, survivor floor). No finale or
  nielsen startCombat attempt occurs in this band at all (wave 5
  never unlocked), so no other titan's refusal is observable here.
- `monsterWavePool` excludes titans (src/js/titans.js): titans never
  spawn in the wild pool; the Herald arrives by omen and is placed
  by `titanPlace` (lair tile). It then moves under the ordinary
  monster-turn rules — its stance resolves to 'hungry' contact
  (src/js/game.js monsterTurn, the `m.mx === px && m.my === py`
  branch at game.js:23326), which calls `startCombat(m.id)` on
  contact. The 'heraldic' aggression label is data flavor: there
  is no heraldic branch in monsterTurn.

## The census (full 16-seed band, shared w4field/ammo substrate)

Policy stack on every seed:
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))`,
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200d death-aware cap.

| Class | Attempts | Fought | Refused | Refusal rate |
|---|---|---|---|---|
| All wave-4 startCombat | 63 | 28 | 35 | 55.6% |
| Herald (aggression heraldic) | 35 | 0 | 35 | 100% |
| Non-titan wave-4 | 28 | 28 | 0 | 0% |
| Titan, non-Herald | 0 | 0 | 0 | n/a (never attempted) |

By monster (attempts / fought / refused): algorithm 5/5/0, reunion
10/10/0, eulogy 3/3/0, eater 6/6/0, influencer 2/2/0, suburb 2/2/0,
herald 35/0/35. By reason: MUSTER-GATE 35, all other reason codes 0.
By caller: wild-contact (monsterTurn) 58 attempts (23 fought, 35
refused); contest 4 (all fought); feast-draw 1 (fought). Zero
policy-hunt callers: the prereg's deedHunt-repeat hypothesis is
REFUTED by the stack traces — the competent policy never calls
startCombat on the Herald in this band. All 35 refusals carry
pendingBefore=false: these are contact attempts, not pending
"Face it" attempts, so the pending-survival question is moot for
this cluster (pending is untouched because the wrapper returns
before the body, but no pending was live to survive).

Fought TB outcomes (28): won 2, lost 25, unresolved 1 (the s85109
day-134 reunion join miss described above; killconv on an identical
trajectory records it 'lost', so the fought record is 2 won / 26
lost on a fight-id join). Wave-4 kills by recordWaveKill: 2 —
seed 85102 day 84 algorithm via player, seed 85109 day 59
influencer via companion.

## Corrected w4field-style numbers (fought meetings only)

| Count | Naive (as previously quotable) | Corrected (fought only) |
|---|---|---|
| TB attempts / fights | 63 attempts | 28 fought |
| TB kills | 2 in 63 naive (3.2%) | 2 in 28 fought (7.1%) |
| Field meetings | 30 | 27 fought (3 evades removed) |
| Field kills | 0 in 30 | 0 in 27 |
| Field outcomes (fought) | — | 20 fled, 7 died, 0 killed |
| Combined fought meetings | 93 naive (63 + 30) | 55 (28 + 27) |

Field detail (this band's own capture, not quoted): 30 field
meetings = 3 evades, 20 vFlee, 7 vDie, 0 vKill — byte-for-byte the
w4field outcome split. Herald field fights: 3, all vFlee, all seed
85106 — the same three w4field recorded. Does the 0-kill headline
survive? YES, and the reason matters: refused TB attempts were
never field fights, so removing them cannot change the field
numerator or denominator except for the 3 evades, which were never
fights either. The field cliff (0 kills) is a fought-fight fact,
not a refusal artifact. What refusal DID inflate is any TB-side
"meeting" count that counted startCombat calls: 55.6% of wave-4 TB
calls never became fights, and 100% of Herald TB calls never did.

## Re-attempt behavior: one cluster, no remedy attempted

Exactly one titan-run carries refusals: seed 85106 x herald.

- 35 attempts, 35 refused, 0 fought; first day 95, last day 130,
  span 35 days; days with attempts: 95, 96, 97, 112, 125, 126, 128,
  129, 130; max 9 attempts on one day (day 129); median gap between
  consecutive attempts 0 days (same-day repeats dominate).
- Every attempt: scholar tile == Herald tile (the monster is ON
  the scholar when contact fires), muster record ABSENT (no muster
  ever created), game-side record `{gate:'muster', have:0,
  need:10}`, refusal line naming 0/10 every time.
- Muster events between first and last refusal: 0. Band-wide
  muster events (soundTitanCall / titanCommitOwn / titanWarCouncil
  calls): 0 on all 16 seeds. The driver never attempts the refusal
  line's prescribed remedy at all — no call, no council, no commit
  — so the gate's shortfall never moves from 0/10, and the only
  exits from the loop are the monster wandering off its tile or
  the village dying (seed 85106 ends village-lost, day 139).
- Herald field fights on the same seed (days 111, 113, 128) show
  the gate is scholar-channel-only: villagers meet the same beast
  in the wild through `fieldFight` — which the titan wrapper does
  not touch — and trade real blows (Second Omen, The Naming) before
  fleeing. The scholar standing on the Herald's tile cannot even
  start, while a lone villager elsewhere can fight it and lose.
  That asymmetry is the finding a future arm must carry, not a
  proposal made here (and no roster/list-fed fix is proposed for
  it, per the perception law).

## The Herald encounter as a person would experience it (sense-testing)

Two transcript stretches read in full (say-ring slices at the first
refusal, day 95, and a late repeat, day 125, seed 85106), plus all
three Herald field-fight logs from this band's own capture.

- The refusal IS narrated, and the first time it lands: "⛔ THE
  HERALD does not notice you the way prey notices a hunter. It
  notices you the way weather notices a field. You cannot face this
  alone — sound the call, muster 10 allied blades (you have 0).
  This is not courage. This is arithmetic." A person reading that
  understands why no fight starts, what is missing, and by how
  much. It satisfies the canon rule "no silent actions."
- But it never changes. Day 125's refusal is character-identical
  to day 95's: same line, same 0/10, no acknowledgment that this
  is the twentieth arrival, no escalation, no new information.
  Between refusals the scholar waits ("You wait. The light
  changes. Nothing asks anything of you."), hauls water, and does
  camp chores — the scholar neither flees the tile the Herald
  keeps arriving on nor sounds the call the line prescribes. The
  "📯 It moves." cue precedes each refusal: the thing moves, it
  arrives on you, the game refuses the fight, and life goes on.
  After 35 repetitions the line stops reading as a warning and
  starts reading as a stuck record.
- The surrounding narration does carry the stakes the refusal
  line doesn't: "🌪️ THE HERALD fed in the night — 1,815 kcal gone
  from your stores. It is eating the realm while you deliberate."
  An unanswered titan costs food while the refusals repeat — the
  cost is real, but the remedy (the call) is never taken, so the
  cost reads as weather, not consequence.
- The field fights read as real fights with consequences, and
  they make the refusal harder to accept, not easier: Yerkezhan
  trades blows with the Herald twice (37 damage, then 20, taking
  31 then 48) and runs "while running still works"; Marcelo takes
  69 from The Naming and runs at 26 HP. A lone villager CAN fight
  this thing. The scholar cannot, on the same map, because of a
  coalition count. As a person, that distinction would feel like
  a rule about which button you pressed, not a rule about the
  world — and the refusal line never acknowledges the villager
  fights happening elsewhere.
- Judgment: the refusal narration is honest and legible once,
  and then it is a loop artifact. The sense failure is not silence
  — it is repetition without change, remedy without attempt, and
  a gate that binds only the scholar's channel while the wild
  ignores it.

## Wall numbers (fresh band, this base — no old bank quoted)

- Seeds: 16 (pilot 85101–85108 + confirm 85109–85116, single policy
  stack above, 200d death-aware cap; no seed hit the cap).
- National: 8/16. Table reached: 12/16. Wins: 11/16. Wave 4
  unlocked: 9/16 (days 45–117). Wave 5 unlocked: 0/16.
- Median survival: 106.5 game days. Max: 139. End reasons: won/
  over-other 11, village-lost 5.
- These wall numbers match w4field's band exactly (8/12/11, 9/16,
  0/16, 106.5/139), and the win-seed pattern matches w4field's;
  seat class (lesser vs full) was not re-measured in this arm, so
  no new seat claim is made — w4field/killconv established the
  all-lesser pattern on this substrate, and nothing here
  contradicts it.
- Because wave 5 never unlocked, no finale/nielsen refusal is
  observable in this band: the refusal census for other titans is
  structurally empty, not zero-by-measurement. A band that reaches
  wave 5 would be needed to census finale/nielsen gates.

## Replay and the s85112 instrument flag (reported, not dropped)

- This band reproduces killconv on 15/16 seeds exactly
  (days/won/national/maxWave/TB-count/field-count identical),
  including s85106's full 35-refusal cluster and s85109's 13 TB /
  21 field fights.
- Seed 85112 does NOT reproduce killconv, and DOES reproduce
  w4field exactly: this band 90 days, won, national, 3 TB fights,
  3 field fights; w4field identical; killconv 139 days, won, NOT
  national, 8 TB fights (including 5 Herald refusals on day 77),
  8 field fights, diverging at day 49. Third instrument, same
  verdict: killconv's s85112 corpus is not reproducible on this
  base, and its 5 Herald refusals do not survive. Consequence for
  quotation: the published "40 Herald refusals" is 35
  reproducible + 5 from the irreproducible seed. Every number in
  this evidence uses the reproducible 35; the killconv total of
  40 must no longer be quoted without that correction. Killconv's
  "3 TB wins in 28" corrects the same way: its third win sat on
  s85112, so the reproducible TB record is 2 wins in 28 fought.
- This arm's own instrument avoids killconv's prime suspect for
  the s85112 perturbation (its sleep-wrapper standing/readiness
  reads): this instrument's sleep census reads unlockedWave and
  scaleRank only. Whether that was truly the cause is not proven
  by this arm — only that a third instrument without those reads
  reproduces w4field on s85112.

## Metric review (applies to the NEXT run, never a re-score of this one)

1. TB-end joining should use fight ids, not a (day,mid) queue.
   The sweep's queue join produced the single cross-check miss
   (two same-day same-monster fights on s85109). Killconv joined
   by fight id and got all 13 ends on that seed. A future census
   should join by fight id (kept in-run only, never persisted)
   and treat a null end as a join failure to investigate, not as
   a fought outcome class.
2. "EVADED" as a startCombat class was not needed: no startCombat
   attempt evades — evasion lives in fieldFight only. The prereg's
   FOUGHT/REFUSED/THROW taxonomy covered everything observed
   (63/63 classified, 0 throws). Keep evasion as a field-fight
   class, not a TB class.
3. Caller classification by stack top worked (wild-contact vs
   contest vs feast-draw separated cleanly), but the prereg's
   policy-hunt hypothesis was wrong in a useful way: the stack
   proved the repeat is engine contact, not driver hunting. Future
   preregs on refusal should hypothesize the contact path first
   when the monster is a placed world entity.
4. The muster-proxy (pure state reads, no titanMusterReady call)
   was sufficient for reason classification only because the
   game-side outcomes record carried gate+have+need. If a future
   refusal path lacks such a record, the proxy alone cannot
   distinguish muster-gate from other gates — the outcomes record
   is the ground truth, the proxy is corroboration.
5. Transcript slices (first + late refusal) were the right
   sense-test unit: the repetition finding is invisible in counts
   and obvious in the two slices side by side. Keep that pair for
   any future refusal arm.

## Convergence state

converging (measurement, not a lever): the scale-onramp axis now
has a measured answer for the refusal channel — the Herald's TB
refusal is total (35/35, muster-gate, engine-contact-driven,
remedy never attempted), the field count was never inflated, the
0-field-kill headline survives on fought fights, and the
reproducible TB record is 2 wins in 28 fought. The next work on
this channel is a lever or driver change that either sounds the
call (so the gate can be met) or resolves the scholar-channel-only
asymmetry — not another census of the same cluster.

## Coordinator follow-ups (not done here — coordinator owns landing)

- Merge: evidence + prereg + instrument + sweep + analyzer +
  proof test + corpus (all committed on sim-herald-b). No
  game-code change, so "measurement only" in substance — but the
  corpus + instrument should land as the baseline for the next
  lever arm on this channel.
- Telemetry deviation check (loop step 10) against
  hidden_files/telemetry-baselines/scale-wall.json — left to the
  coordinator after landing, since the baseline roll-forward
  decision belongs to the run, not the arm.
- Findings-backlog append (titan-gate scholar-channel-only
  asymmetry) is done in this run's goal-workspace write, not in
  the repo commit.
- Quotation corrections to carry forward: Herald refusals 35, not
  40; reproducible TB wins 2 in 28, not 3 in 28; field meetings 30
  (27 fought) with 0 kills in both counts.
