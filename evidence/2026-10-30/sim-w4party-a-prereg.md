# sim-w4party-a — PRE-REGISTRATION (written BEFORE any sims, 2026-10-30)

Run: Loop A, axis scale-onramp, follow-up to sim-killconv-a
(evidence/2026-10-30/sim-killconv-a.md, read first).
Worktree: ~/workspace/worktrees/sim-w4party-a, branch sim-w4party-a.
Arm type: MEASUREMENT ONLY — no game-code change. The gating freeze
(Steve 2026-10-27/28) stands. No roster/list-fed join proposal will be
made; any join mechanism discussed must be perception-grounded
(same place / hearing distance / out together), per Steve's
2026-10-28 perception law.

## Ground facts (verified against code on THIS base, not quoted from banks)

- Killconv band (fresh, this base, 16 seeds, same policy stack as
  below): 35 villager field fights vs wave-4 beasts, 0 kills
  (vFlee 24, vDie 7, evade 4). Scholar TB fights: 3 won in 28.
  Question here: was anyone else even there at those 35 meetings?
- Field-fight party machinery (src/js/fieldFights.js): a fight takes
  opts.allies / opts.allyVids; rec.partySize = allies + 1; at most ONE
  ally ever enters — allyFromStart (round 1) or a mid-fight shout
  when hopeless (rec.shoutRound, log line "shouts for help! X charges
  in!"). A fight with no offered pool can never gain a joiner.
- Wild/patrol callers (src/js/game.js resolveWildMonsterEncounter,
  resolvePatrol) feed the FULL outdoor crew as the offered pool:
  every villager on an outdoor assignment (patrol/scout/hunt/forage)
  this part, trust-ordered, capped at 2 named allyVids — regardless
  of which node they stand on. The crew snapshot (_outdoorCrew) is
  taken at assignment resolution, not at fight time.
- Scholar TB join rule (game.js startCombat): villagers with grid
  positions within 4 squares of the scholar join, nearest 4 max —
  a position rule, not a party-membership rule. Formal party
  (docs/PARTY.md, party.js partyMembers()) is a separate concept.
- Villager position unit in sim: world NODE (npcNode, 9x9 node grid).
  Grid squares (v.positions) exist only on the scholar's node, so
  off-scholar-node fights have no observable grid proximity — node
  distance is the perception unit here, and that limit is stated,
  not papered over. npcNode defaults an unplaced villager to Haven;
  the instrument reads state.village.nodePos DIRECTLY (never calls
  npcNode, which would write the default into state) and flags
  defaulted entries, so a same-node count at Haven is reported with
  its default caveat, not as proven co-presence.
- Perception channels measured (all senses, no roster list):
  same-node sight (Chebyshev d=0 vs fighter node), earshot
  (d<=1, the party-wiring.js earshot rule), sight range (d<=2, the
  PERCEPTION.md observant distance-2 bound, generous upper bound),
  out-together (fellow outdoor-task assignee this part), shout
  (engine's offered pool + calledHelp). A villager at d>=3 with no
  crew tie and no shout heard is NOT counted as present.

## Primary metric

Per wave-4 FIELD meeting (fieldFight, base wave >= 4, all callers):
party presence at meeting time + join outcome. Each meeting is
classified into exactly one pattern:

1. SOLO — no other living villager within d<=2 of the fighter's
   node AND offered pool empty (opts.allies == 0). Nobody was
   there in any sense the engine could use.
2. NEARBY-NEVER-JOIN — at least one villager on the same node, or
   adjacent (d<=1), or in the offered pool, AND no ally entered
   the fight (rec.calledHelp false). Someone was there; nobody
   came.
3. JOIN-TOO-LATE — an ally entered (rec.calledHelp true) AND the
   fight still ended vFlee or vDie. Help came and did not save it.
   Join latency (shoutRound, or round 1 for allyFromStart) is
   reported alongside.
4. JOINED — an ally entered AND the fight ended vKill or mFlee
   (residual; expected ~0 given killconv's 0 field kills).
5. PERIPHERY — only d==2 neighbours, no offer, no join (residual:
   in sight range but out of earshot, no mechanism to call).

Binding-pattern rule: the most frequent pattern wins ONLY if it
leads the runner-up by >= 2:1 among classified meetings; otherwise
the verdict is SPLIT (no single binding pattern). Unclassified
meetings (missing entry snapshot) are counted separately and must
stay under 10% for a GO verdict.

## Secondary metrics (contrast + wall)

- Scholar TB contrast: per wave-4 TB fight, companions present at
  fight start (tbfight fighters kind villager/ally), formal party
  size (partyMembers()) at start, and overlap (companions who are
  formal party vs grid joiners). Hypothesis-free: reported, not
  judged.
- Offered-vs-colocated gap: share of offered allies (allyVids)
  standing on a DIFFERENT node than the fighter at meeting time
  (the engine's crew offer is node-blind; this measures how
  list-fed the offer is in practice).
- Wall numbers every run: national / table / wins, wave 4–5
  unlocks, median survival (game days), wave-4 field kills.

## DIAG verdict thresholds (judged against this header, never re-scored)

- DIAG-GO: classification coverage >= 90% AND a binding pattern by
  the 2:1 rule above.
- DIAG-NO-GO: SPLIT (no 2:1 leader) despite >= 90% coverage.
- INSUFFICIENT-DATA: fewer than 8 wave-4 field meetings across the
  band, or instrument errors on any seed, or pilot ff4 counts do
  NOT reproduce killconv's pilot counts exactly (0,0,1,0,0,4,1,0
  for 85101–85108) — a mismatch means the new instrument perturbed
  the sim and the band is void.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over (village
lost or won) — identical to killconv, so the 35-meeting corpus is
reproduced on identical seeds/policy rather than approximated.
200d because wave-4 door openings ran as late as day ~165 in
killconv; the death-aware stop keeps cost at survival, not cap.

## Seeds (exact literals — killconv's band, for direct comparability)

- Pilot: 85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108.
- Confirm (pilot GO only): 85109, 85110, 85111, 85112, 85113,
  85114, 85115, 85116 (16 seeds total).
- Pilot GO gate (sniff test, §9): per-seed JSONs written for all 8
  seeds, zero instrument errors, ff4 counts reproduce killconv
  pilot counts exactly, and every pilot ff4 meeting carries a
  non-empty entry snapshot (fighter node, buckets, offered pool).

## Policies (single-base measurement; no control leg by design)

Competent scale-push stack, identical every seed (policy-side only,
no game-code change):
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))` with
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 + W4PARTY=1 (this arm's read-only instrument).

## Panel (§15)

Single-base measurement: no before/after comparison exists in this
arm, so scripts/balance-panel.js does not apply. No panel compare
is attached and none is fabricated. (If a later lever arm reuses
this corpus as its baseline, that arm runs the panel then.)

## Wall numbers reported every run

national / table / wins, wave 4–5 unlocks, median survival (game
days), wave-4 field meetings by outcome, wave-4 field kills.

## Sense-testing (§4, SENSE-TESTING LAW)

Read at least one full meeting record per pattern present (entry
snapshot + fight log tail + outcome) and judge whether it reads as
a real meeting with real co-presence or absence — not just counts.
Field-fight rec.log is the blow-by-blow source (killconv's
narration-stream limit does not apply here).

## Metric review

(To be filled at end of run. Doubts about the metric go here and
apply to the NEXT run, never to re-score this one.)

## Convergence state

(One line at end of run: converging | converged | parked |
killed-at-pilot — for the scale-onramp axis measurement, not a lever.)
