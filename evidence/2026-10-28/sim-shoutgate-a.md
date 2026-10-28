# sim-shoutgate-a — THE SHOUT/HOPELESS GATE (game code)

Run: fleshout loop, axis scale-onramp (blocking axis). Worker:
sim-shoutgate-a. ARM 1, game-code. Preregistration (binding,
committed BEFORE any judged sweep):
evidence/2026-10-28/sim-shoutgate-a-prereg.md (commit 3babd2f42).
VERDICT: NO-GO — the gate fix works as a mechanism (12/14 formed,
FED-NO-SHOUT substantively empty) but no wave-4 field party fought
without retreating and no wave-4 field kill happened, so the game
change is REVERTED in this branch; instruments + evidence + corpora
only, no src/js trace. No re-scoring: the armed band's strong wall
(7 wins, 8/8 national) does not rescue the failed primary, and the
median guard failure is disclosed, not hidden.

## Header (pre-registered)

- PRIMARY METRIC: at least 1 non-retreating fought wave-4 field
  party (FORMED-STRUCK with outcome vKill or mFlee) OR 1 wave-4
  field kill on the pilot band.
- GO THRESHOLD: primary >= 1 AND guards pass AND judged >= 4.
- GUARDS: median survival >= 120d; starvation deaths <= 3; no
  wave-5 unlock claimed.
- MEETING-FLOOR LEG: judged < 4 → INSUFFICIENT-OPPORTUNITY
  (neither GO nor NO-GO).
- HORIZON + WHY: 180d death-aware — the shared band's horizon,
  death-aware per MEASUREMENT §10, never a fixed 200d.
- SEEDS: pilot 75101–75108; confirm 75109–75116 ONLY on pilot GO.
- SUBSTRATE: tableseat-nowait verbatim, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, 180d death-aware, competent
  policy + outdoorcrew layer (OUTDOORCREW=1) as MEASUREMENT
  SUBSTRATE on both bands (control = substrate + base gate,
  armed = substrate + fixed gate, identical seeds). The
  substrate policy is a NO-GO variant restored from branch
  history (hash-verified identical) for measurement only and is
  DELETED at closeout whatever the verdict; it never lands.
- JUDGED SET (identical to outdoorcrew-a): wave 4, channel
  field, caller resolve/patrol/aid, leader a villager.
- SECONDARY (reported, never re-scored): FORMED, FORMED-STRUCK,
  FED-NO-SHOUT breakdown, crewed rate, wave-3 contrast, wall.

## The change (what was built, in plain words — REVERTED, see verdict)

Wild fights decide whether to shout only from round 2 on, and a
villager who dies or flees in round 1 never gets to shout at all
— even with help standing by. The fix opens the shout one round
earlier, and only for a catastrophic first exchange: if the first
blow already satisfies the existing hopeless formula (losing the
damage race) AND already took more than half the villager's
health, they shout at once instead of waiting a round to bleed
out or flee. A merely losing first exchange still waits for
round 2, exactly as before. Nothing else moved: no new round-1
flee, no winning change, no learn-withdrawal change, no monster
stat, wave gate, table gate, or spawn change, and nothing that
populates the ally list changed. Same shout line, same single
ally joining, same trust bump as the round-2 shout.

Files (REVERTED — see verdict): src/js/fieldFights.js (one
round-1 branch + one branch condition, 31 insertions, 1
deletion). No canon doc covers the shout gate itself
(docs/PARTY.md is the player-party system, not the wild shout);
the design record is the fieldFights.js PARTY-UP comment (Steve
2026-10-09: "when the trajectory turns hopeless and help is
near, they shout instead of scattering"), which this change
preserves and only accelerates.

## Canon — perception law (Steve 2026-10-28 12:48 CDT)

RULING (recorded here as canon, per the coordinator update;
first noted in the prereg when it landed mid-run): NO MAGIC
LISTS / PERCEPTION LAW. Villagers are real people with eyes —
they know who's around only through their own senses: seeing
someone in the same place, hearing a shout, following someone
they've seen. No global roster or "who is around" list fed
into a decision. The field-feed fix was that pattern and stays
reverted; list-feed arms stop. Party formation must be solved
through perception, not lists. This fits his standing "if you
don't know, it doesn't show."

COMPLIANCE OF THIS ARM (verified at closeout + re-verified
for this canon amendment, 2026-10-28):
- The field-feed change was NOT revived: the reverted game
  change touched ONLY the fieldFights.js morale block (one
  round-1 branch + one branch condition, 31 insertions, 1
  deletion — commit 8d4b45af) and its proof test. It added no
  feed, no roster read, no presence function.
- No presentFightAllies-style feed was reintroduced or built
  on: zero presentFightAllies references in src/js in the
  final tree, and zero src/js diff vs the branch base
  (3f3275a0d) — the branch ends evidence + instruments only.
- The shout itself is legitimate perception under the ruling:
  a shout that is actually heard is hearing, not a list. The
  gate fix is feed-agnostic — it only changes WHEN the
  existing shout fires, given allies the engine already
  names (aidFight's at-the-door joins, raid defense, player
  party, or any future perception-based formation). Its proof
  drove fieldFight directly with explicit opts — no feed
  involved. Investigating/fixing the hopeless-shout branch
  stays in scope on this reading, and this arm stayed inside
  it.
- The measurement substrate is disclosed, not hidden: the
  pilot/control bands rode on the engine's PRE-EXISTING crew
  snapshot (_outdoorCrew → wild PARTY-UP), populated for
  measurement by the outdoorcrew policy. That snapshot IS
  list-mediated as implemented — it names everyone assigned
  an outdoor task, trust-sorted and capped, with no proximity
  check — so a villager on the far side of the map can be
  named as an ally. The policy was scaffolding only, deleted
  at closeout, never proposed to land. But the disclosure
  cuts both ways (see below).

PERCEPTION-BLOCKED ASSESSMENT (coordinator update's NO-GO
rule, applied to this arm):
- The game-change verdict is NO-GO on its primary already
  (0 non-retreating parties/kills), so no landing is at stake
  here and the perception question does not change the
  verdict.
- For any FUTURE arm that wants to land this gate fix: the
  fix itself is not perception-blocked, but its effect in
  WILD meetings currently depends on a list-mediated ally
  supply (the base-code crew snapshot). Until party formation
  is solved through perception — allies the leader actually
  saw, heard, or walked out with, on the tile, not a snapshot
  roster — a landed gate fix would be a dead letter in the
  wild: the shout would be legitimate, but there would be no
  legitimate hearer standing by. That ally-discovery half is
  perception-blocked and must be solved first; the gate fix
  (in git history at 8d4b45af) can then be re-applied as
  substrate behind a perception-based formation arm. A future
  arm must NOT shortcut this by reviving a list feed and
  calling it perception.
- The prereg's earlier wording ("moot for this arm since the
  change is reverted") is superseded by this section: the
  question is not moot, it is answered — gate legitimate,
  wild ally supply blocked, landing requires a perception
  formation first.

## Proof (on the armed code, before revert)

scripts/test-shoutgate-a-proof.js — PROOF-GREEN, direct
fieldFight fixtures with isolated fight RNG (deterministic):
(A) catastrophic round 1 (wave-4 influencer, ally present) →
shout in ROUND 1, ally joined, ally struck (allyDealt 5),
fight ends vFlee round 2; (B) same fixture, no ally → no shout
at all, vFlee round 1; (C) non-catastrophic round 1 (wave-1
deer, ally present) → no round-1 shout (shout at round 2, the
pre-existing behavior). The round-1 gate is narrow by
construction: it fires only on a catastrophic first exchange.
Targeted combat suites on the armed code: party-wiring 10/10,
aid-fight-wired 9/9, break-monsters3-fieldfights 26/26.
monsterknowledge (1743 assertions) was NOT re-run on the armed
code (disclosed, not hidden); the change touches only the
morale block and the three fieldfight suites pass.

## Control band (substrate + base gate, seeds 75101–75108)

Corpus PASS, census valid (8/8 rows, 0 unclassified, recorder
errors 0). DET-GATE PASS: this band reproduces outdoorcrew-a
EXACTLY on every number — 907 meetings, 19 judged, 17 crewed,
0 formed, FED-NO-SHOUT 17 (R1 13 / R2 4, all neverHopeless),
wall won 2, natEver 6, natFinal 4, table 3, entered 2, wave-4
7, wave-5 0, median 118d, starvation 1, deaths 306, per-seed
rows identical. The restored policy plus unchanged base code
replays identically, so the control is uncontaminated and the
armed comparison is clean. Corpus:
evidence/2026-10-28/perseed-shoutgate-a/ (s<seed>-control.json
+ summary-control.json).

## Pilot band (substrate + fixed gate, seeds 75101–75108)

Corpus PASS, census valid (8/8 rows, 0 unclassified, recorder
errors 0). Trajectories diverged from control (as policy/code
arms do): judged meetings concentrate on 75106 (13) + 75108
(1), where control had 75103 (14) + 75105 (3) + 75107 (1) +
75108 (1). Before/after here means identical seed inputs, not
identical trajectories — the meeting-level mechanism numbers
do not depend on which seed hosts them.

- PRIMARY: FAIL — NON-RETREATING 0, FIELD-KILLS 0.
- MECHANISM: judged 14 (floor leg met: >= 4, so this is a real
  NO-GO, not INSUFFICIENT-OPPORTUNITY), crewed 14/14, FORMED
  12/14 (vs control 0/17), FORMED-STRUCK 10/12, crewed
  all-waves 745/1037 meetings. The gate fix fires: where the
  base gate formed nothing, the fixed gate forms on nearly
  every crewed meeting.
- FORMED OUTCOMES (12): vFlee 10, vDie 2. Every formed party
  retreated or died; none killed, none drove the beast off.
  The two FORMED-but-unstruck meetings (allyDealt 0) are
  shout-then-flee/die before the ally's first strike — counted
  as FORMED per the predecessor definition, excluded from
  FORMED-STRUCK and from the primary, honestly.
- FED-NO-SHOUT (REQUIRED BREAKDOWN): n=2, byRound R1:2,
  byHopeless neverHopeless:2, split R1/neverHopeless:2 — and
  both are rounds=0 mFlee meetings (75106 d123 + d125,
  herald, aid-routed): the fight ended BEFORE round 1 (the
  pre-round drive-off branch), so no shout could ever fire.
  The gate-failure class is EMPTY in substance: 17 → 2, and
  the 2 are pre-round endings, not gate failures. The shout
  gate, as a gate, is closed by this fix.
- WAVE-3 CONTRAST: 32 field meetings, 16 formed (control: 16
  meetings, 8 formed) — the round-1 shout fires at wave 3 too,
  as designed (catastrophic first exchanges exist there too).
- GUARDS: median 109d FAIL (>= 120d); starvation 0 PASS
  (<= 3); wave-5 0. The median failure is disclosed AND
  contextualized (not re-scored): the armed band won 7/8
  (vs control 2/8), and wins end runs — a faster-winning band
  pulls median days down. AND the bar itself is above the
  control band's own median (118 < 120), so this absolute bar
  cannot pass on this substrate band even without the change
  (see metric review). Either way the verdict is NO-GO on the
  primary regardless of the guard reading.
- WALL (armed vs control): national ever 8/8 (vs 6/8), final
  8/8 (vs 4/8); table invited 7/8 (vs 3/8), entered 7/8 (vs
  2/8); wins 7/8, all lesser (vs 2/8), full seat 0/8 both;
  wave-4 reach 8/8 (vs 7/8); wave-5 0/8 both; median 109d (vs
  118d); deaths 279 (vs 306); starvation 0 (vs 1). A favorable
  wall cannot rescue a failed primary — no re-scoring. The
  wall improvement is reported as a secondary observation:
  earlier, more frequent party formation coincides with
  faster lesser wins, not with field kills.
- Per-seed: 75101: 92d won; 75102: 103d won; 75103: 104d won;
  75104: 90d won; 75105: 130d won; 75106: 142d, 13 judged, 11
  formed; 75107: 180d; 75108: 109d won, 1 judged, 1 formed.
  Corpus: evidence/2026-10-28/perseed-shoutgate-a/
  (s<seed>-armed.json + summary-armed.json).

## Verdict: NO-GO

Primary 0 with judged 14 >= 4 → NO-GO (sub-class:
formed-but-retreated — the gate now works, the party still
cannot win a wave-4 field fight). No confirm band: a failed
pilot spends nothing further (kill-fast rule in the prereg).
Per NO-GO discipline the game change is REVERTED fully before
the final commit, the proof test for the reverted feature is
deleted (proof lives in git history at 8d4b45af), and the
substrate policy is deleted — leaving instruments + evidence +
corpora only. The coordinator must NOT merge the game change
from this branch — there is none left to merge.

## Sense note (SENSE-TESTING LAW — read, not counted)

Same-seed replay of 75106 on the armed code reproduced the
band's d109 audit meeting exactly. The log reads like people:

- R1: Anthony takes aim (Take Aim — next shot 2.5x). The audit
  hits for 30 (70 left; armor absorbed 11). No shout — 70 is
  not below half, so the narrow round-1 rule correctly stays
  shut on a merely bad first exchange.
- R2: Anthony strikes aimed for 28 (1072 left on an 1100-HP
  beast). The audit hits for 30 (40 left).
- "Anthony is losing — shouts for help! Sandile charges in!"
- R3: Anthony strikes for 12, Sandile strikes for 5 (1055
  left). The audit hits Anthony for 31 (9 left).
- "Anthony sees how this ends — and runs while running still
  works." (vFlee, party intact.)

The pair's combined damage (17/round) against 1055 HP left is
visibly hopeless, and the fiction shows the judgment, not just
the mechanism: aim, trade, call, one shared round, retreat
together at 9 HP rather than dying for pride. What it does NOT
change is the outcome class: a formed party is a rescue, not a
victory. The sense verdict matches the mechanism verdict —
the gate was never the win condition; party damage and
survivability are.

## Reachability verdict

- Wave-4 field parties: REACHABLE AND NOW FORMING — 12/14 on
  the pilot band (vs 0/17 control). The shout gate blank is
  closed as a mechanism.
- Wave-4 field kills: still 0 on every band (control, armed).
  Parties form, strike, and retreat; they do not convert.
- Wave 5: 0 everywhere, as expected — not the metric here.
- Table / wins: wins move (7/8 lesser on armed vs 2/8 control)
  but in kind only — all lesser, full seat 0/8 everywhere.
  The gate fix moves field-fight shape and coincides with
  faster lesser wins; it does not touch the full seat.

## Village assessment in plain words

The village can now call for help in time: where a villager
used to die silently in round 1 with a friend standing by,
twelve times a friend charged in, landed a blow, and the two
got out alive together (ten retreats, two deaths even with
help). That is people-like, and it is the whole story of this
arm — because nobody yet wins. The beasts have 700–1500 HP
and the pair deals about 17 a round; the math of the retreat
is written into the fight before the shout. Who thrived:
villagers with company nearby — they got help and walked
away, and their villages won the lesser seat faster. Who
died: solo villagers meeting wave-4 beasts with nobody in
earshot (unchanged), and two leaders who died even after the
shout. Missing capability, still: a party that can actually
HURT a wave-4 beast enough to finish it — damage and
survivability, not timing. That is the next blank, in order.

## Metric review (for the NEXT run — never a mid-run re-score)

- THE PRIMARY IS MECHANISM-IMPOSSIBLE FOR A GATE-ONLY FIX:
  a party dealing ~17/round cannot reach the 85% mFlee line
  (595+ damage) on a 700+ HP beast in 15 rounds, let alone a
  kill. The next arm must own party damage/survivability
  (1628 blank #2, formed-but-retreated), not the gate — and
  its prereg must define its primary on that axis (e.g.
  damage dealt, rounds held, or a kill), not on a
  non-retreating party a gate cannot produce.
- THE GATE BLANK IS CLOSED: FED-NO-SHOUT went 17 → 2, and the
  2 are pre-round endings. No future arm needs to re-prove
  the shout gate; it needs the reverted fix re-applied (it
  lives in git history at 8d4b45af) as the substrate for a
  damage/survivability arm, with its own prereg.
- MEDIAN GUARD MISCALIBRATION: the task's absolute 120d bar
  fails even on the control band (118d). The NEXT run should
  pre-register a control-relative median leg (e.g. armed
  >= control − 15d) alongside any floor, and report the
  faster-wins reading (wins end runs) explicitly.
- PANEL NOTE (standing): scripts/balance-panel.js has no
  census-ingest mode (its compare mode spawns its own
  observer sim runs; it cannot ingest per-seed meeting
  censuses). Paired before/after tables (control band vs
  armed band, identical seeds) are the §15 substitute, as in
  1415Z/1528Z/1628Z. No panel artifact faked, no panel verdict
  claimed.
- TELEMETRY DEVIATION CHECK (loop body step 10): corpus path
  for the coordinator's check is
  evidence/2026-10-28/perseed-shoutgate-a/*.json (metrics
  national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in 1528Z/1628Z:
  the baseline's regime does not match this substrate, and
  per-seed rows carry nationalEver/entered/won, not
  top-level national/table/wins paths. Baseline NOT rolled
  by this arm; the coordinator judges any LOUD lines.

## Blanks filled or documented

- FILLED (mechanism, not landed): the shout/hopeless gate —
  a catastrophic first exchange now shouts in round 1 (proven
  by proof test + 12/14 formed on the pilot band), and the
  FED-NO-SHOUT class is substantively empty. Reverted per
  the NO-GO verdict; the fix lives in git history for a
  future damage/survivability arm to re-apply as substrate.
- DOCUMENTED (for the findings backlog, not chased here):
  formed-but-retreated is now the binding blank — party
  damage (~17/round combined) vs 700–1500 HP beasts with a
  15% break line; two formed parties still ended vDie; the
  median guard's absolute bar fails on the control band
  itself.
- The 1628Z blank #1 (shout/hopeless gate) is answered in the
  mechanism sense and closed; 1628Z blank #2
  (formed-but-retreated) is now the next blank in order.

## Test and infrastructure notes

- `node --check` clean on the edited fieldFights.js; targeted
  combat suites green on the armed code (see Proof above).
- Safe-commit index clobber hit every commit in this run
  (staged-deletion twins of byte-identical files); repaired
  each time via HEAD-blob `git update-index --add
  --cacheinfo` with hash verification, never `git reset`.
  The revert commit below was verified the same way
  (worktree files hash-match HEAD blobs).
- The control band ran BEFORE the game edit (base code) and
  the armed band AFTER (committed armed code); the only code
  diff between bands is the gate fix (verified by git
  diff --stat at armed time: fieldFights.js only).
- No push, no bump, no live verification (ship-loop line).
  Ready for coordinator merge, pending ship — via the
  coordinator (this branch merges evidence + instruments
  only; the game change is reverted).

## Commits

- 3babd2f42 prereg (before any judged sweep).
- 9e37c0b9a instruments (substrate policy + sweep + analyzer).
- 8d4b45af game change + proof test — REVERTED below, must
  NOT ship.
- Control + armed corpora + sense script + this evidence:
  final commits on this branch (hashes in the run report to
  the coordinator).
- Revert commit: restores fieldFights.js byte-identical to
  its pre-change state, deletes the proof test, the substrate
  policy, and the scratch probe — verified: shoutNow refs 0,
  node --check clean, worktree contains only committed work.
