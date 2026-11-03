# Loop B coordinator evidence — run fleshout-loop-b-20261103T013651Z (axis food-economy)

## Run posture
- Loop A live on scale-onramp throughout (claim 0115Z at run start, then a new
  0203Z run with trees sim-sortie-a / sim-w5faced-a) — NOT touched.
- B worked food-economy, the second non-converged axis, taking the 0036Z
  run's named next blanks in order: (1) sensor redesign, (2) what closes a
  lateral, (4) guard-E creek-hop fidelity (69502). Blank (3), the C prereg
  metric call, is a coordinator decision and is carried, not decided here.
- Claim written before any sims; lock created at run start. Pre-flight:
  main tree clean at 90637bc7c, disk 23%, reaper removed nothing sibling-owned.
- Master moved under all three arms mid-run (Loop A landed its 0115Z round
  as 3ed85a960 plus journey-scale r73 on top). All three branches rebased
  clean in their own worktrees, proofs re-run green on rebased tips, then
  merged --ff-only. One coordinator exec call was interrupted by a service
  restart mid-proof-run; state was re-checked before any retry — the
  creekhop merge had already landed, tree clean — and proofs were re-run
  on merged master (all green). No work was repeated blindly.

## Arm 1 — sim-sensorredesign-b: PILOT-GO (merged 328de2a00)
- Prereg 7b5d2ffe6 (before any judged sim), tools 2df958669, evidence 328de2a00.
- New rule shape (e*), instrument/policy only, zero src/js, zero default flips:
  STAND-DOWN + ENVELOPE + HUNGER CORROBORATION. Within a disengaged stretch,
  peak = max pantry over the stretch (a rise raises the peak, never restarts
  the count); falls counted cumulatively, not consecutively. Fires at first
  D>S, D>=8, disengaged, hungryStreak>=1, where (E1) >=2 cumulative falls AND
  pantry <=0.90x peak, or (E2) pantry <=0.65x peak. Shape change, not a
  threshold tweak: bounce-immunity from cumulative counting + peak anchor,
  cliff-awareness from E2, cost discipline from the hunger-streak gate.
- Pilot, fresh re-run on current base, 8 seeds, 30d competent, identical
  seeds vs sensor (c): collapsing 79006/79019/79031/79064, survivors
  79001-79004. (e*) fires 4/4 collapsing (leads 1, 2, 0, 6) vs (c) 2/4;
  beats (c) strictly 4/4; fresh pilot-survivor cost 0/4 vs (c) 1/4.
  Proof scripts/test-sensorredesign-b.js 13/13 (reused gatediseng 21/21,
  confirm 11/11).
- Honest limits (from the arm evidence, not smoothed): lead >=1 holds on
  only 3/4 — 79031 is a lead-0 death-knell, not a rescue; pilot cost n=4
  is a screen, not a rate (full-band context: (e*) 9/60 = 15.0% vs (c)
  5/60 = 8.3% on the 790 screen; 2/12 = 16.7% vs 2/12 on 767, same two seeds).
  The shape was iterated on archived bands, disclosed in the prereg.
  PILOT-GO earns a fresh-band confirm only; NO deploy claim may cite this
  pilot alone.
- Substrate drift, caught loud by the base-equality control: survivor 79001
  diverges from its archived line from day 8 on the current base (fresh
  day-8 pantry 21,250 vs archived 21,600; maxWave 2 vs 3). Membership
  preserved (still a 30-day survivor), legs judged on fresh lines — but the
  drift flips both rules' readings on that seed. Base-equality control
  stays mandatory for archived-trajectory reuse.
- Sense: 79019 day 18 and 79064 day 19 firings land on the thinnest pack
  lines yet ("You keep a day's food (270 kcal)…" / "(90 kcal) — nothing
  extra for the pantry this time") — the village noticing in time, in its
  own words. 79006 day 22 cliff firing lands in total pantry-voice silence
  (0 lines that evening) — the warning's job there is to break a silence.
  79031 day 20 lands alongside the hunger voice on the very evening people
  starve — real, but tardy, matching lead 0.

## Arm 2 — sim-lateralclose-b: GO (merged e4363ed60)
- Prereg 634e866de + pre-judged amendment 8f5957bfd, evidence e4363ed60.
  DIAG-only, zero game change.
- Question answered: what closes a lateral? Stock turnover under the
  village's hands. Two named mechanisms, both inside the stock class:
  (S-A STRIP) a lateral-chain link's stock stripped to 0 — single-tile
  proof 69803 tile 6,5 <- 5,5 stripped 2->0 alone reproduces the flip;
  pair proof 69805 cluster (0,7/1,6/1,7/0,8) needs {0,5->0, 1,6->0} together
  (0,5 alone does NOT reproduce — the sim reroutes). (S-B REGROWTH HIJACK)
  a regrown tile becomes the sim's new first-picked lateral candidate and
  leads the chain into the 4-leg cap — single-tile proof 69804 tile 4,7 <-
  3,5 regrowing 0->1 alone reproduces the flip.
- Flip ledger: 10 flips / 792 primary tile-probes (1.3%) across 8 pilot
  seeds; every flip reproduced by the STOCK class alone in counterfactual
  replay (determinism True on all 10). Durations are a regrowth race:
  6 of 10 reopened the next morning, 3 held to window end, 1 closed twice.
- Candidate-by-candidate: C1 single-tile strip CONFIRMED; C2 whole-chain
  strip CONFIRMED; C3 reveal greedy trap NOT OBSERVED (44 reveal events,
  revealed-alone replay never reproduces); C4 reroute CONFIRMED with a stock
  trigger (69804); C5 bridge washout 0 occurrences; C6 new blockage 0 (the
  2 terrain changes were rubble CLEARS); C7 monsters excluded on code
  evidence; C8 pantry/village events excluded except via foraging channels;
  C9 haven moves 0; C10 swimmer 0 changes in pilot; C11 beyond generation 0;
  C12 type change 0; C13 vigor/pressure as sustainer CONFIRMED as the reopen
  clock (stripped tiles regrew 0->1 next morning).
- Attribution limit, stated in the evidence: stripGround has three callers
  (scholar sweep, NPC villager depletion, village/neighbor commons takes),
  so the snapshot cannot say whose hands stripped a given tile. The
  mechanism is proven; the hand is not.
- Proof scripts/test-lateralclose-b.js 10/10 on branch tip and on merged
  master.
- Sense: say-tee replay of 69803, SENSE-CHECK PASS (all 13 probe snapshots
  identical to the judged leg). Day 12 reads as a living village — water
  runs, foraging returns, gossip, a Hushpuppy trailing the scholar's night
  forage, a Stonebridge runner complaining "Your foragers are stripping our
  side of the southeast ground." Honest limits: the say stream never names
  tile 5,5 or the lateral — E(D) is a guard instrument, not a game concept,
  so a closing has no dialogue trace by construction; and every morning
  probe on every pilot leg showed the scholar at haven — under plain
  competent play nobody sleeps out, so witnessed camped closings need a
  camping policy, not competent.daily. Morning probes also miss intraday
  transient closings on unvisited tiles.
- Note for future arms: 69806 probes 11->12 both read gameDay 12 (one
  iteration's sleep did not advance scholar.day). Flips are defined between
  consecutive probes so the verdict is unaffected, but gameDay-keyed
  analysis would mislabel that pair.

## Arm 3 — sim-guarde-creekhop-b: DIAG, mechanism named (merged 7286d5caa)
- Prereg 322510096 (before any judged leg), instruments 1f21cd833,
  evidence 7286d5caa. Recorder + analyzer + proof only; zero src/js,
  zero guard-policy edits, zero default flips.
- 69502 REPRODUCED exactly on base 90637bc7c: day-5 start (4,4), forced
  moved-pattern 5 ok + 1 refused, hop (7,2)->(7,1) E pass (via direct) +
  engine refused. Entry blockers [{7,1,'creek'}], engine block creek,
  destination tile creek / needsBridge true / bridged false / swimmer
  false, say line "The creek runs fast here — no crossing without a bridge
  or a swim."
- Control gate PASS 8/8: recorder legs reproduce the prior homewardac
  shadow legs hop-for-hop on all 8 pilot seeds. No substrate drift here.
- Pilot fidelity (fresh recorder legs, seeds 69501-69508, shape-A route,
  34 forced hops): E-pass fidelity 24/28 = 85.71% (E-pass moved 24,
  E-pass refused 4); E-fail hops 6, all moved (pocket entries on
  69501/69504 — guard would veto on armed legs, as homewardac showed);
  E-fail + refused 0. Guard hop model (checkHop, explicit origin) vs
  engine outcome: 34/34 agreement. Refusal census: 3x creek (69502
  (7,2)->(7,1); 69503 and 69508 (4,4)->(5,4), all needsBridge-unbridged,
  swimmer false), 1x washed_out (69507 (5,4)->(6,4), scholar HAS swimmer
  — swimming correctly does not help a washout). Unclassified refusals 0.
- Verdict vs prereg: DIAG — mechanism named: ENTRY-BLINDNESS. Fidelity
  85.71% < 95% GO bar, every disagreement entry-blocked. E(D) evaluates
  escape FROM the destination and never checks entry INTO it, so it allows
  hops the engine refuses. NOT a model error: the hop model itself is
  faithful. The origin-asymmetry hypothesis from homewardac is REFUTED:
  checkHop with explicit origin matches the engine on all 34 hops — the
  engine's d=1 check defaults origin to the live tile, which IS the hop
  origin. Prior veto verdicts stand (entry-blindness touches only allows).
  Fix shape named, NOT landed: a pre-allow entry check reusing the guard's
  own checkHop (34/34 faithful) would not change any veto.
- Proof scripts/test-guarde-creekhop-b.js 17/17 on branch tip and on
  merged master.
- Sense: the refusal reads sensibly — wadable creeks crossed without
  comment, then the fast creek refused with obstacle + remedy in one line;
  washout line names the obstacle. The guard's silence is honest, not
  misleading; the gap is analytic (model scope), not narrative.
  Corroborating wrinkle: after the 69502 refusal, competent.daily retries
  the blocked tile 3 more times the same day — same retry-loop class as
  cband 69706; belongs to walk-home, not the guard.

## Village assessment (plain words)
The village's food warning can now see two of its blind spots: a pantry
that falls off a cliff instead of sliding, and a pantry that bounces up
and down while really draining. The new warning shape catches all four
known collapsing villages in the pilot, a day or more earlier than the
old warning on three of them, and stays quiet on the pilot survivors —
but on one village it only speaks on the evening people already starve,
so it is a better alarm, not a rescue. Separately, the hidden paths
villagers use to slip home sideways (laterals) do close — not because of
monsters or weather, but because the village itself eats the ground
bare, or because a regrown patch lures the path into a dead end; most
such closings heal by the next morning when the ground regrows. And the
homeward guard's map of creek crossings is honest about danger but blind
to entry: it judges whether you can leave the far bank without ever
checking whether you can step onto it, so it waves through crossings a
fast creek will refuse. None of these three arms changes the game itself
— all are instruments and measurements — so no villager's lived game
changed this run; what changed is what the next fix can aim at.

## Reachability / wall (in-window only, honestly limited)
- Sensor pilot: 8 seeds, 30d competent. Lateral probes: 8/8 survived the
  12-day probe legs; maxWave 2 on six seeds, 1 on 69802/69805.
  Creekhop recorder: 8/8 legs reached the day-5 walk-out by design.
- In-window: national 0, table 0, wins 0, wave 5 reached 0 — expected for
  these short instrument windows, NOT a regression and NOT wall movement.
  Wall numbers as last measured stand (full seat 0 / wave 5 reached 0 on
  the Loop A lane).

## Metric review
- Sensor (e*) prereg needs a lead >= 1 leg alongside beats-(c) next time:
  79031's lead-0 firing passes beats-(c) legs but is not "in time" in any
  playable sense (arm finding, carried).
- Lateralclose: morning probes miss intraday transient closings on
  unvisited tiles, and competent.daily never sleeps out — a camping policy
  is the instrument for witnessed camped closings, not a metric change.
- Creekhop: the 95% GO bar did its job — fidelity 85.71% is a clean DIAG,
  not a near-miss to re-score.
- Balanced panel (§15): vacuous for these DIAG/instrument arms by design;
  no compare file fabricated. Sensor pilot is a before/after on identical
  seeds through its own analyzer, judged against its prereg.

## Telemetry deviation check
- Prescribed invocation on the sensor pilot jsonl returned one LOUD line,
  a parse refusal (multi-line jsonl fails at line 2) — the known
  input-format limitation precedent, NOT a deviation signal. Baseline
  NOT rolled, no investigation item.

## Infrastructure
- Safe-commit index clobber hit all three workers' commits (repaired via
  HEAD-blob cacheinfo each time, commits verified correct) and was
  checked for on the coordinator commit below.
- Worktree registrations slow (~9 min total for three trees) under
  sibling load; rebases fast and clean (zero file overlap with Loop A).
- check.js --quick NOT re-run: zero src/js, zero default flips, zero
  green-list files; standing 280/7 pre-existing profile.
- Findings appended: 11 items to hidden_files/sim-findings.md
  (1677 -> 1688, verified, no duplicates): 4 sensor + 4 lateral + 3 creekhop.

## Next blanks, in order
1. Sensor (e*) fresh-band CONFIRM (pilot-GO only; prereg must add a
   lead >= 1 leg; deploy wording must be peak-anchored, never
   stand-down-anchored).
2. C prereg metric call (carried): does "fences shape C" include outward
   attempt vetoes.
3. Guard-E entry check as a fix shape (pre-allow entry check reusing
   checkHop) — DIAG only so far, needs its own prereg before landing.
4. Pocket persistence mechanism (69501 day-12 opening).
5. Guard->succession cascade (69604).
6. Then (7)-(25) as listed in the 1730Z entry, unchanged.

## Landing
Merged locally, pending ship (sensorredesign 328de2a00 + lateralclose
e4363ed60 + guarde-creekhop 7286d5caa + this coordinator evidence).
No push, no version bump, no live verification — ship loop owns deploys.
