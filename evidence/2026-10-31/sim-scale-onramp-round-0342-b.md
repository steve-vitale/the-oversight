# Loop B round 0342Z — scale-onramp triptych (coordinator evidence)

Run: fleshout-loop-b-20261031T0342Z, axis scale-onramp (topmost
non-converged; Loop A NOT live at run start — no fleshout-loop.lock,
no live claim — so B took the topmost axis per the
convergence-directed rule, as in the 0249Z run). All arms DIAG ONLY,
zero src/js, zero policy-default flips, zero edits to existing
policy files. Base at run start a1e3a01a9; master moved once under
the run (journey-landing r77 1701e30b4) before the first merge.

## Arm 1 — sim-partyvolley-b: KILLED AT PILOT (DIAG-NO-GO at pilot)

Commit 8ae5e7518 (rebased from 241b7fae1). Forced-meeting fixture
band through the real Game.fieldFight, following the volleyfix
pattern (ON/OFF pairs sharing one RNG stream). Pilot only, 32
fights; no confirm ran, per the prereg.

- Pilot gate: G1 from-start join 20/20 (100%, bar >= 90%) PASS;
  G2 median rounds 2 (bar >= 3) MISS — the kill reason; G3 median
  total damage 79.5 (bar >= 71 = 2x volleyfix lone median 35.5)
  PASS.
- P3 pilot medians: total damage 79.5 (2.24x the volleyfix lone
  ceiling of 35.5), rounds 2, sustained DPR 48 vs the #1369
  yardstick 57.25 (short ~16%, below the 57-80 cap-fit band).
  Kills/drive-offs 0/20; outcomes vDie 8 / vFlee 12.
- Hide armor converts deaths to flees (P3-HIDE 12/12 vFlee, 0 vDie)
  but buys no third round; unarmored leaders die in round 1 to
  single signature-inflated hits (congregation 105-124 vs base
  50-70; eater 112-145 vs base 45-75).
- Biggest finding: fieldFight fields at most leader + 1 ally, not
  three. allyFromStart sets helpCalled=true, and the
  hopeless-shout branch requires !helpCalled, so a second staged
  ally can never enter. Proved, not just read: shoutJoined 0/24
  from-start fights, and P2-DUAL == P3-DUAL congregation identical
  on all 4 streams. The #1369 yardstick's "2 allies 9.0"
  component is therefore unfieldable through this engine.
- Volley at party scale: median 24 (vs lone 21.5) — the party
  doesn't scale the volley. Sense-testing: 3 full transcripts
  read; narration honest throughout, including the ally going
  down and the hopeless flee at 76 HP.
- Wall numbers NOT OBSERVABLE on a fixture substrate (stated
  structurally, not as 0s); §15 panel NOT APPLICABLE (same
  rationale as volleyfix — balance-panel.js cannot express a
  fixture band; none fabricated).
- Proof: scripts/test-partyvolley-20261031.js 15/15 on the
  worker's base. On the rebased branch and on merged master it
  runs 14/15: the single failing leg is "fresh run byte-identical
  to committed corpus", and the diff is exactly one line — the
  corpus's recorded anchorCommit (a1e3a01a9 vs the rebased
  8ae5e7518). All 32 fights reproduce byte-identically on the new
  base and the pilot verdict numbers are unchanged (median
  damage 79.5, median rounds 2, DPR 48, DIAG-NO-GO). ADJUDICATED
  named-cause per the 0117Z precedent: the leg compares against a
  base-pinned anchor that a rebase necessarily changes; the
  corpus truthfully records the base its judged fights ran on
  and was NOT rewritten (rewriting it under an amend would move
  the anchor again). Verdict stands as measured on its base.
- Evidence: evidence/2026-10-31/sim-partyvolley-b.md (+ prereg).
  Corpus: evidence/2026-10-31/perseed-partyvolley-b/.

## Arm 2 — sim-stickfiber-b: DIAG-GO

Commit 188d20821 (rebased from cd5520ae1). Stick/fiber source
inventory + census on the supply band (seeds 85101-85116,
leadfeast + seatdrive + windefer + fullseat-diag stack, 200d
death-aware cap). Fight identity reproduces supply-b exactly
despite the anchor moving to a1e3a01a9.

- Pile stick/fiber: 0 on every day of all 16 seeds — 0 daily pile
  increases, 0 pocket-call pile increases, 0 end-of-run pile
  units. Stones pile 15-848; branches 0-85.
- Correction to supply-b's "never produced": sticks ARE produced
  — in the scholar's pack only (127 net daily stick increases
  over 115 snapshot events, 0-43/seed; fiber just 3, on seeds
  85102 and 85106). The scholar ends some runs still holding
  sticks (8/12/2 on s85101/s85104/s85108) yet never donates one:
  donateMaterial 0 calls, invite-bundle 0 fires, scholar craft
  arrow/bolt 0.
- Bow pocket calls: 36/36 material-blocked (15 stick-only, 21
  stick+fiber); 0 craft attempts, 0 arrows/bolts ever produced or
  carried. Wave-4 fights 30 (14 ranged, 0 volley shots).
- Complete inventory (zero unexamined paths): all 64 stick/fiber
  hits in src/js classified, all 5 materials-write sites, all 52
  routine-name definitions, all 14 villager duties, plus
  recipes/items/events/monsters data. Only 4 pile-write sites
  exist: betrayal bundle (fiber only), scholar-only
  donateMaterial (UI only), inflow wrap (branch/wood/bark/vine/
  hide only — structurally excludes stick/fiber), stone duty
  (stone only). No villager stick/fiber duty, no recipe makes
  stick or fiber (21 recipes consume them), no loot/trade path
  outputs them, and no villager routine writes stick/fiber into
  a pack. The Haven stash perception line doesn't even list
  stick.
- Instrument note (reported honestly): the first pilot+confirm
  pair was discarded as judged data — its counters wrapped
  addMaterial only, while scholar forage pushes directly to
  scholar.inventory. The instrument was fixed (daily
  scholar-pack snapshot), proof re-run green, and the full band
  re-run as the judged band; the judged pilot reproduces the
  discarded pilot exactly.
- Ranked next arm: (1) a villager deadfall/brush source duty
  modeled on the stone duty — deadfall needs no tool, so the axe
  gate does not apply (felling would, and is not the
  recommended shape); (2) the sensed home pocket-call design
  (ammo-a's follow-up); (3) NOT a scholar-donate nudge, which
  fixes the player's bag, not the village's supply.
- Wall: national 8/16, table 12/16, wins 11/16, wave 4 unlocked
  9/16, wave 5 unlocked 0/16, median survival 111d, max 139d.
  §15 panel not applicable (measurement-only census, no
  before/after comparison); none fabricated.
- Proof: scripts/test-stickfiber-20261031.js 20/20 on the
  rebased branch and on merged master (requires the env set
  documented in the script header: FEASTSCALE_R13, TRIBFLOOR,
  WINPURSUIT, WINDEFER, SEATDRIVE, FULLSEAT, AMMODIAG,
  SUPPLYDIAG, STICKFIBERDIAG all =1).
- Evidence: evidence/2026-10-31/sim-stickfiber-b.md (+ prereg).
  Corpus: evidence/2026-10-31/perseed-stickfiber-b/.

## Arm 3 — sim-mustercall-b: DIAG-GO

Commits 83d89ff38 (prereg) / fe7d75e6a (instrument) / f2a7b9fc8
(analyzer + replay) / ae15fd8f1 (evidence + corpus), rebased
from 575b534c6 / 1d7986526 / b1fd283f5 / 119d946ff. Muster-call
decision census on the herald band (same 85101-85116 substrate).

- Census completeness 35/35 = 100% (all refused Herald attempts
  joined to complete muster snapshots); game-side outcomes
  cross-check 35/35; ready-manual vs ready-game agreement 35/35;
  instrument errors 0 on all 16 seeds. Proof 21/21 green
  (synthetic fixtures only), on the rebased branch and on merged
  master.
- Muster-a's "2 blades vs need 10" is ONE state, not the rule.
  All 35 refusals sit on seed 85106, all at omen stage 2 with
  the call button OFFERED — the opposite of muster-a's
  feast-drawn state (omen null, never offered). A sounded call
  yields 5 blades (days 95-97) then 9 (days 112-130); with Haven's
  commit the ceiling reaches or passes the 10-blade gate on five
  of nine refusal days (112, 125, 128, 129, 130). Call alone
  never reaches 10 (max 9). Re-faces per day: 2, 3, 3, 6, 4, 4,
  1, 9, 3.
- Why the yield grows: Thornfield's trust crosses the trusted
  threshold mid-window (68 -> 74, quota 2 -> 6). Emberhold
  refuses throughout on arrears 3000 (never yields; paying the
  debt would add 2 blades — the swing factor). Commit blocked
  only by NO-VOLUNTEERS on 7 snapshots (days 97, 126); never by
  the omen gate.
- Channel asymmetry: scholar TB 35 refused / 0 fought vs
  villager field 3 fights, all fled, 0 kills either channel.
  Gating field fights like TB would change 0 kills — it would
  only remove three real losing fights. Herald entity HP fell
  525/700 -> 105/700 across the window, but the three captured
  field fights explain only 70 of that 420-HP drop; the
  remaining 350 is flagged open, not claimed (appended to the
  findings backlog by this round).
- Post-block proof (not judged): sounding the call at the first
  day-112 refusal brings exactly the predicted 9 allies; +1
  Haven commit = ready 10/10; the Herald is FOUGHT the same day
  and lost; the muster is gone afterward and later contacts
  refuse again. Pressing the buttons works once — the routing
  question recurs after a loss.
- #1550 status: LANDED, not duplicated. Commit 72512906f is in
  this base and measured holding: 0 feast-draw Herald attempts,
  0 cast-sourced Herald faces. #1538 steve-call still pending —
  the brief's decision is whether a direct refused face at omen
  2 sounds the call, and whether to re-sound after a lost
  muster-fight.
- Sense-testing: the refusal line is character-identical on day
  95 and day 125. Worse than a stuck record now: it says "you
  have 0" while the village has 9 answerable blades and an
  offered button — the prescribed remedy is offered, reachable,
  and never taken, with no narration of the not-taking.
- Wall (fresh band): national 8/16, table 12/16, wins 11/16,
  wave 4 9/16, wave 5 0/16, median survival 106.5d, max 139d —
  byte-identical to herald-b on all 16 seeds' compared keys.
  Panel §15 not applicable (single-base DIAG, no before/after);
  none fabricated.
- Evidence: evidence/2026-10-31/sim-mustercall-b.md (+ prereg).
  Corpus: evidence/2026-10-31/perseed-mustercall/.
- Backlog: the worker updated the titan-gate item (#1591) in
  hidden_files/sim-findings.md (census + brief delivered,
  decision still pending) and the #1550 holding note. This round
  appended three further items: the 2-fighter engine cap, the
  scholar-only stick production correction, and the unexplained
  Herald HP drop.

## Wall (observable bands)

national 8/16, table 12/16, wins 11/16, wave 4 9/16, wave 5 0/16,
median survival 106.5-111d, max 139d (stickfiber + mustercall
bands; partyvolley is a fixture band with no wall numbers).
Overall wall UNCHANGED: full seat 0 on the wave-4 question that
matters here (no wave-4 field kill anywhere, fought-only or
otherwise), wave 5 reached 0 stands. The decomposition sharpens
with ceilings: party+gear buys 2.24x lone damage but still 0
kills in 2 rounds; sticks exist only in the scholar's pack, so
no bow volley is producible at village level; and a sounded
muster call would reach the titan gate on five refusal days —
but nobody ever sounds it, and the one sounded fight is lost.

## Telemetry deviation check

`node scripts/telemetry-check.js` on the stickfiber corpus:
REFUSED by the tool itself (recorder rows with anchorCommit —
same class as w4field/ammo/herald in the 0249Z run). No
comparison performed, no LOUD lines, baseline NOT rolled.

## Infrastructure

Master moved once under the run (journey-landing r77
1701e30b4); all three branches rebased clean, proofs re-run
after every rebase and on merged master (partyvolley 14/15 with
the one adjudicated anchor leg above; stickfiber 20/20;
mustercall 21/21). Safe-commit index clobber hit all three
workers' commits (all worker-repaired, commits verified
correct). Coordinator evidence landed via its own branch
(coord-0342-b) merged --ff-only, per repo AGENTS.md push
discipline — no direct master commit, no push. check.js --quick
NOT re-run (zero src/js, zero policy-default flips; arm proofs
green on merged master). Worktrees released as merged,
branches deleted: sim-partyvolley-b, sim-stickfiber-b,
sim-mustercall-b. Claim retired to .DEAD; lock deleted.
Merged locally, pending ship.

## Next blanks, in order

1. The engine-cap design decision (is leader+1 the intended
   field-fight cap?) — before any party-size lever.
2. A signature-hit measurement arm (one-shot round-1 kills vs
   base damage bands).
3. The villager deadfall/brush source duty (stick/fiber supply,
   modeled on the stone duty).
4. The #1538 ruling (route on refused face? re-sound after a
   lost muster-fight?) before any muster-routing build; plus a
   second cluster seed to generalize the single-seed (85106)
   mustercall census.
5. Still open, not chased: ammo wording nits (#1592), s85112
   irreproducibility (#1578), the unexplained 350-HP Herald drop.

scale-onramp stays converging (NOT converged): the wave-4 wall
is now priced at party scale, at village supply level, and at
the muster gate — but no fix landed and no default flipped.
food-economy stays converging (untouched; sibling Loop A lane's
prior axis — this run worked scale-onramp because Loop A was
not live).
