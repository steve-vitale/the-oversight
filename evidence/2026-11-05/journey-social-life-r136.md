# Journey social life r136 — RUN NOTE (Lane B, 2026-11-05)

Leg 5 (social life). Base master b79821db8 (post r135 + deepening r103 +
secondkiller DIAG). Driver scripts/journey-social-life-r136-20261105.js
(r132 verbatim + bond instrument + succession-proof inviter split, see
below). Analyzer scripts/analyze-journey-social-r136-20261105.js.
Pre-reg: evidence/2026-11-05/journey-social-life-r136-prereg.md.
Rotation-b: 5 → 6 written at closeout (next: crisis).
No src/js changes this run — measurement only, per the prereg.

## Run history (why this is the second r136)

A first r136 attempt started 07:49:36Z, wrote only the prereg as a
DRAFT, and timed out 07:55:23Z before any driver/analyzer/seed ran.
The main session established death and closed it out done-abandoned
(tree+branch removed, lock deleted, rotation-b stayed 5). This run
re-executes the same pre-registration. This run's own lock:
2026-11-05T07:58:22Z. Obstacles on the way in, all recovered in-run:
a 0-byte broken ref refs/heads/probe-oexcl-now2 (flap debris, same
class as the two the main session removed at 00:53) was blocking
`git pull` — verified 0-byte + unreferenced, removed, pull clean;
worktree registration took 120s+ and the first heartbeat waited
behind a reaper's slow `git status` in the fresh worktree (cold-index
restat, three concurrent statuses) — registration heartbeat held and
the queued heartbeat landed once the reaper finished.

## Instrument correction (pre-judgment)

The first full panel (seeds 41701–41704, driver as pre-registered)
showed every party decision as NPC-invited — and that read was WRONG.
Seed 41701's smoke (5d) scholar was Jordan, the panel (26d) scholar
was Jae, Jordan fell d20 "the wild", and the d8 party decision names
Jordan as inviter: the mantle passes mid-run, so comparing the
inviter against the END-of-run scholar mislabels bearer-invited
decisions. Code census: party.js:206 is the ONLY party-kind call
site and always passes villagerId, so every party decision is
bearer-initiated by construction; lure decisions come from
betrayal.js:4217 with the plot inviter. CORRECTION (read-only, no
Game call changes, no RNG): the npcInviteDecision wrap now records
bearer (villagerId at call time) and inviterWasBearer per decision,
and the daily wrapper tracks successions {day, from, to}. The
analyzer splits on inviterWasBearer. The first panel's JSONs were
DISCARDED as verdict inputs (their trajectories are quoted in the
run note only as the bug's evidence) and the panel was RE-RUN with
the corrected driver. Metrics M1–M5 unchanged — only the instrument.
Prereg addendum records this. Known cosmetic defect left for r137:
initialBearer records null in the evidence (the capture line sits
before the ctxShared literal in the driver, so the assignment is
swallowed by its try/catch); the successions list is complete and
the initial bearer is readable as the first succession's "from"
(or the scholar, if no succession). No verdict depends on it.

## Determinism proof (corrected driver)

Seed 41701 re-run to a scratch dir: the two JSONs differ in exactly
ONE field — `ms` ("9s" vs "11s", wall-clock runtime). A field-level
walk finds every trajectory field identical (days, endReason,
census, transcripts, decisions, arms, springs, bonds, samples).
The proof's INTENT (trajectory-neutrality of the read-only wraps)
is satisfied; its LETTER (byte-identical) fails only on a
wall-clock stamp that varies on every re-run by construction —
including for the unmodified r132 driver, which emits the same
`ms` field. Proceeded to judge the panel on that diagnosis.
Next-run proposal: the determinism proof should compare with `ms`
stripped (or drop `ms` from the evidence schema).

## Rebase onto new master (closeout)

Master moved during the run (13 commits: Loop A pantrymealword /
bankadded evidence, sim-postblood-b DIAG, journey-scale r98).
The only src/js change in range: game.js +19/−1, a wording-only
change (pantrymealword stranded-night line). Per the loop rules the
branch was rebased onto master 11d6789c1 (clean, single pick,
2214ef016) and the panel RE-RUN on the new base: all four seeds
reproduce their trajectories EXACTLY — the only differences in
the JSONs are manifest.commit (b79821db8 → 2214ef016) and the
`ms` wall-clock field. The determinism proof was re-run on the
rebased base too: the two 41701 JSONs differ only in `ms`
("7s" vs "15s"). Verdicts stand unchanged on the new base. The
re-run JSONs are committed as a second commit below; the run
note's numbers are the same either way.

- **M1 arming motive: GO — 6/6 grievance-linked at arming.**
  Every plot armed with motive 'grievance' (scores 38–80):
  41701 Jae→Quinn d12 (gT->L 48), 41702 Keltoum→Karim d8 (48.8),
  41703 Dehua→Daniyar d7 (49.6), 41704 Katarina→Aki d7 (53.6),
  Aki→Katarina d11 (50.4) and d13 (48.8). Accomplices again NOT
  grievance-driven (9× motive 0, 3× motive 25 'ambition'): hot
  leader + cold friends, sixth panel running. Drought bound holds:
  0 plots after d30 (all armed d7–d13).
- **M2 villager-initiated bonds: COUNT — still open (fourth
  datapoint), now with the inviter split.** propose* calls: 0
  across all four seeds (proposeLink/Covenant/Trade all wrapped,
  all true, zero calls) — the formal bond verbs are player-only
  by construction (no NPC caller exists in src/js) and were never
  invoked in wild sim play. Lure/party split, succession-proof:
  party 15/15 PLAYER-initiated (9 accept / 6 decline), lure 17/17
  NPC-initiated (5 accept / 12 decline). So villagers DO initiate
  invitations — but only lures (plot bait); every party invitation
  in the panel came from the player-character's side, via the
  driver picking the invite_party conversation choice. End bonds
  58/75/121/81 per seed; the engine records NO initiator on bonds
  (samples: {v, depth, day, dayGain} + combat) — informal bonds
  form in volume through shared meals/visits/feasts/fights (a
  system accumulation with a +6/pair/day cap, party-bond.js), not
  through a proposal event with an initiator. Q1 as ruled
  (villagers initiating a LINK/covenant/trade proposal): still
  0 in the wild, four panels running.
- **M3 invite refusal: party 9 accept / 6 decline; lures 5
  accept / 12 decline.** Refusal still the norm for lures; party
  invites tilt accept. No threshold — counts carried only.
  (Correction note: r132's unsplit 13/22 + 4/9 counts were all
  read the same way; the split is new this run.)
- **M4 sense: GO.** Three reads pass the bar. (1) 41702 d15
  friendship (Colton): "There's still the matter of the ambush of
  Karim. Nobody's settled it." — the NPC brings an unsettled
  ambush unprompted, the player investigates (witnesses, bribery
  trail with escalating honest non-answers), ends warmly ("This
  was good."). (2) 41703 d11 talk-request: opens by remembering
  what the player said ("You said one day at a time..."), raises
  "the murder of Daniyar. Nobody's settled it.", and d12 the same
  villager comes back with "Can we talk? We need to discuss how
  things are run here." → case work → the player votes GUILTY →
  "Counted." (3) 41703 d46 Jesse, grief thread: "Valeria always
  took the burnt piece. Said someone had to. I take it now." /
  "My part? I remember them. Someone has to do it properly." —
  a villager keeping a dead person's memory as a role. Driver
  artifact, same class as r125/r132: the bribery press repeats
  ("Follow the food") 4–6 times per sitting, but the NPC answers
  vary with honest escalation, so it reads as persistence.
  OBSERVATION (not a fix — documented design tradeoff): the
  betrayal case-frame line ("There's still the matter of the
  ambush of Aki. Nobody's settled it.") re-speaks VERBATIM every
  new sitting while a case's actions stay offered — 41704's same
  villager says it on d12, d13, d14 and d15, including after the
  case was acquitted (heard d11). betrayal.js:4301 + the comment
  above it: "a new sitting re-frames" and the frame "cannot [be
  dried] away" by the no-repeat ledgers, because it is
  load-bearing for menu honesty. The tradeoff is real: menu
  honesty buys verbatim repetition across days. A fix direction
  (gate the frame on case status, or vary it) is a design call
  for Steve, not a change this run invents. Recorded here so the
  next run does not re-open it as an unknown.
- **M5 census guardrail: NO-GO — 0/4 past d100 (best d83).**
  Third panel in the sequence 1/4 (r125), 1/4 (r132), 0/4 — a
  step DOWN, not a third 1/4. Per binding, dark-channel verdicts
  stay within-window only. Death shapes: the wild 29, monsters
  15, starvation 5 (all 41701, by d26), ambush 2, sickness 2,
  wounds 2, Gavel 1, expedition 1, Choir Toad 1, betrayal 1,
  stranger 1, arena 1, thirst 1 — 62 fallen across the panel, no
  ≥3/day cluster anywhere. Villages: d26, d55, d83, d70.

## Village assessment, in plain words

Four villages, none long-lived. 41701 starves by day 26 — five
dead of hunger, the first scholar Jordan dead in the wild on day
20, the mantle passing to Jae, who promptly leads a plot to
ambush Quinn (the player-character as plot leader, not just
witness). 41702 burns through TEN bearers — Paloma to Molly to
Colton to Keltoum to Karim to Chantal to Ella to Patricio to
James to Jack to Pavel, six of them in the last six days — while
Keltoum's ambush of Karim escapes and is tried and acquitted.
41703 is the vendetta's echo: Dehua has Daniyar killed on day 8,
the case is tried and acquitted, and the village talks about the
murder for weeks ("Nobody's settled it") while monsters take ten
more and Fatima ends alone on day 83, still warm, still trusting
(69). 41704 is the revenge arc: Katarina ambushes Aki, Aki
escapes, then Aki plots against Katarina TWICE (days 11 and 13)
— the second fizzles and expires unheard on day 18 — while the
village bleeds out and the mantle passes six times in the last
ten days. The social layer is loud everywhere (178 full
conversations, 164 natural ends, 31 feasts, 5 moots); the
villages underneath it still mostly don't last, and the mantle
passes 27 times across the four runs — the "player character" is
a relay baton, and in the endgame days it changes hands almost
daily.

## Reachable / fun / winnable (leg 5)

- Reachable: bright layer fully reachable (conversations, feasts,
  moots in volume on every seed). Dark layer reachable in week
  one plus revenge echoes; every spring this panel — all five —
  surfaced through its case to the player, and the one expired
  plot stayed silent as designed (r132 M2x). Party invitations
  are reachable through conversation (the driver picks them);
  formal bond proposals were never reached because nothing in
  sim play invokes them.
- Fun: conversations read as real people (M4); the ambush victim
  and the village keep the unresolved case alive in talk; a
  revenge arc fires twice against the same woman; grief is
  carried as a role ("I remember them. Someone has to do it
  properly."). The verbatim case re-framing across days is the
  one sour note, and it is documented, not hidden.
- Winnable: not assessable on this leg's horizon — no village
  lived past day 83, and M5's threshold fails for the third panel
  running, now at 0/4. The direction moved DOWN this panel.

## Fixes this run

- None in src/js, deliberately: no finding names a concrete
  inconsistency with its own proof test. The case re-framing
  repetition is a documented design tradeoff (see M4), not a
  defect to fix unilaterally.
- **Tooling (new):** scripts/journey-social-life-r136-20261105.js
  (r132 verbatim + bond instrument + succession-proof inviter
  split + succession tracking), scripts/analyze-journey-social-
  r136-20261105.js (BOND section on inviterWasBearer). The
  succession-proof split is the durable method correction: any
  future inviter split that compares against the end-of-run
  scholar is wrong the moment the mantle passes, and the mantle
  passes constantly.

## Regression check

- `node scripts/check.js --quick` in the worktree, run TWICE (the
  first run's output was tail-truncated, so it was re-run with a
  full log): 284 passed, 6 failed in 604s, then 284 passed,
  6 failed in 537s. The 6 are EXACTLY the 6 standing families
  from r125/r132 (log at
  evidence/2026-11-05/journey-social-life-r136-checkquick.log):
  test-measurement-proof-update, test-measurement-workflow,
  test-mobile-combat-cadence, test-occupation-panels,
  test-phone-frame-proof, test-establishment-r20-fixes. No new
  failures; this run changed no src/js, so no regression is
  attributable here. r132's 4 load-timeouts and flaky
  measurement-cache-flags did NOT recur in either run.

## Metric review (§14)

- M5's threshold (2/4) did its job a third time, now at 0/4:
  1/4, 1/4, 0/4. The r132 question (threshold vs survival
  story) sharpens into a step-down: survival itself worsened
  this panel (best d83 after d112). This is a next-run proposal,
  not a mid-run re-score — report it, do not re-score it.
- M2's instrument is now succession-proof; the corrected split
  (party player / lure NPC) supersedes r132's unsplit counts for
  any inviter claim. The flawed first panel is not verdict
  input.
- Determinism proof: letter (byte-identical) fails on the `ms`
  wall-clock field only; intent (trajectory-neutrality) proven
  by field walk. Next run should strip `ms` before comparing.
- initialBearer null (driver ordering defect, cosmetic): fix in
  the r137 driver by capturing after the ctxShared literal.
- Telemetry check (closeout): ran against the social.json
  baseline plus the r136 per-seed JSONs with the r125/r132 l3.*
  keys — all five legacy keys LOUD-disappeared (bonds 318,
  deepBonds 168, betrayalCases 8, mootsConvened 7, gossipConvos
  99 → current 0), the same schema drift r112/r113/r120/r125/
  r132 established: the social driver never emits l3.* fields,
  so the tool reads absence, not a game deviation. Verdict:
  explained, not a bug. Baseline NOT rolled forward.

## Evidence

- evidence/2026-11-05/journey-social-life-r136-prereg.md
- evidence/2026-11-05/journey-social-life-r136-41701.json
- evidence/2026-11-05/journey-social-life-r136-41702.json
- evidence/2026-11-05/journey-social-life-r136-41703.json
- evidence/2026-11-05/journey-social-life-r136-41704.json
- evidence/2026-11-05/journey-social-life-r136-analysis.txt
- evidence/2026-11-05/journey-social-life-r136-checkquick.log
- scripts/journey-social-life-r136-20261105.js
- scripts/analyze-journey-social-r136-20261105.js
