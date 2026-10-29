# sim-staying-b — PREREGISTRATION (binding, committed BEFORE any judged run)

Run: gaps-staying arm, Oct 2026. Axis: scale-onramp (blocking axis,
converging, NOT converged). Worker: gaps-staying (STAYING/MORALE).
Assignment: root-cause the wave-4 field-party flee and test ONE new
rule — PARTY-AS-ONE-BODY — judged on kills, never on staying alone.
The tileparty-a and staying-a PILOT NO-GOs stand and are NOT re-landed:
tileparty proved joining works but does not kill (0 wave-4 kills, 2
judged tile parties, both size 2, fled rounds 2–3); staying-a proved
a round>=2 party-HP morale rule never fires where it matters (3 of 4
party fights end round 1; 5 of 9 judged wild flees are wound-floor
breaks, fleeHopeless false). This arm attacks the preemption itself:
the round-1 wound floor and the leader-only survival arithmetic that
end a party fight before any morale rule is consulted.

## Canon read first

docs/MONSTER-WAVES.md (wave-4 band: damage 35–95/round in the task
brief; data file: base attacks 30–80 by species, HP 700–1500, pierce
0–0.5; round cap 15, break line 15% for wave>=2), docs/SIMULATING.md,
docs/MEASUREMENT.md sections 9–12, 14–15, repo AGENTS.md, and the
predecessor evidence: evidence/2026-10-29/sim-scale-onramp-round-0002.md
(staying section + mechanism split), evidence/2026-10-28/sim-retreatdiag-a.md,
evidence/2026-10-28/sim-fieldability-a.md, evidence/2026-10-28/sim-sortiedpr-a.md,
evidence/2026-10-28/sim-tileparty-a.md + its game-code patch (read via
`git cat-file -p sim-tileparty-a:evidence/2026-10-28/sim-tileparty-a-game-code.patch`;
the patch is a COMPONENT reference, not a merge — see below).

## Prior art numbers (cited, not re-derived here)

- Retreatdiag-a (16 formed parties, all size 2): party DPR median 15,
  kill-rounds median 52, fresh beasts 73–77, all over the 15-round cap;
  HOPELESS-REFIRE 14, DEATH 2; median 1,547 further incoming damage at
  the moment of retreat vs ~100-HP villagers. Threshold loosening
  alone converts retreats to deaths — ranked LAST, harmful alone.
- Fieldability-a: best earnable sustained party DPR 48.25 (machete+bow
  dual + fed 1.25x + one gear-blind ally at 4.5/round); 850-HP beast
  needs 17.6 rounds, 1100-HP needs 22.8 — both over cap. Tricks are
  not damage (influencer trick-aware morale held 2 extra rounds in a
  fixture while CUTTING DPR to 15.2). Only alien-tier weapons reach
  the 57–80 band. Spear occupies the ranged slot, so spear+bow dual
  is not a real config.
- Sortiedpr-a: mustered parties median 16.0 DPR; 35 kills all of
  beasts starting <= 64 HP; healthy beasts >= 91 HP: 0 kills in 12;
  wave-4 sorties 0 kills / 0 drive-offs in 7, 4 leader deaths.
- Tileparty-a pilot (8 seeds): 215 tile-party fights all waves, sizes
  to 7, 17 kills at waves 1–2, 0 at wave 4; judged wave-4 tile parties
  2, both size 2. Lesson 1: size alone does not fix fleeing. Lesson 2
  (metric review): an all-wave rule collapses the judged wave-4 set
  (24 -> 8) through trajectory divergence — a future party arm must
  gate the rule or widen the band. Lesson 3: the morale decision
  counts only the leader — ally soaking never enters the arithmetic.
- Staying-a pilot (8 seeds): party rounds mean 1.50, party mDealt
  mean 30.3; partyHeld 0 on judged wild fights; the one field hold in
  the corpus (wave 3, 8 rounds, 181 dealt) ended in party death.
  Staying without survival converts flees to deaths, not kills.

## Root-cause decomposition (this arm's own diag, base code, before judging)

On the arm's own 8-seed BASE corpus (same substrate as the pilot,
below), every fought judgedA fight gets exactly one break reason, in
this priority order (w4dpr2 taxonomy, verbatim): KILL, DRIVE-OFF
(mFlee, rounds < 15, no cap line), CAP (rounds == 15 + cap line, with
vFlee/mFlee sub-outcome), PARTY-DEATH (vDie), HOPELESS (vFlee +
fleeHopeless true), LEARN-WITHDRAWAL (vFlee + fleeLearn true +
fleeHopeless false), WOUND-FLOOR (vFlee + fleeHopeless false +
fleeLearn false), TRICK-EXIT (log-named trick exit before morale),
OTHER (must be 0 for the diag to be trusted; any OTHER fight listed
by seed/day/mid). Round-1 ends are split inside the table: round-1
vFlee is a wound-floor break by construction (hopeless needs round
>= 2, learn withdrawal needs round >= 3), round-1 vDie is a death.
Reported alongside: wound-floor share, round-1 share, party vs solo
split (base parties are shout-joined only — tile parties do not exist
on base code), leader-taken vs ally-taken per round, and the survival
gap (rounds survived vs rounds the kill required at observed DPR).
The diag is reported whether or not the pilot runs; it is not a GO
leg, it is the root-cause record the coordinator asked for.

## The ruling proposed (named, because the task requires it)

WOUND-FLOOR SCOPE RULING (proposed by this arm, NOT a Steve ruling,
NOT standing canon): when live allies stand with the leader in a
field fight, the wound floor — the "we are too hurt to stay" break —
is judged on the PARTY's shared condition, not the leader's alone.
An ally standing with you changes the break. Concretely: the floor
check compares the live party's HP fraction (leader HP + live allies'
HP, over their maxima) against the same fleeAt line, instead of the
leader's fraction alone. Leader death still ends the fight at once
(vDie, unchanged); a solo fighter's floor is unchanged by
construction (no live allies -> leader fraction, identical code
path). The same party scope applies to the two companion facets
below; together they are ONE rule, PARTY-AS-ONE-BODY, not three
levers to be tuned separately. If the pilot NO-GOs, the ruling is
withdrawn with the code — it is not banked as canon.

## Mechanism spec (ONE rule, five facets — all or nothing at pilot)

All facets activate ONLY when at least one live ally stands with the
leader in a field fight (fieldFight). Solo fights are identical by
construction: every facet reads live-allies state that is empty for
a solo, and the solo code paths are untouched. Aid-crisis fights
(aidFight) are NOT changed; tile joining does not apply to them, and
their from-start allies are recorded separately, never as tile joins.

- T — TILE JOINING (component, adapted from tileparty-a, wave-4+
  gated): in resolveWildMonsterEncounter and resolvePatrol ONLY,
  when the monster's wave >= 4, the villagers standing on the
  monster's tile at fight time (tilePresentAllies, rebuilt here:
  engine npcsOnNode read, minus the fighter, minus sheltered,
  minus post-flee-resting, minus dead — the ONLY input is
  co-presence on the tile) REPLACE the outdoor-crew list as
  allyVids with allyFromStart = true. Empty tile set = old crew
  behaviour, unchanged. Wave < 4 = old behaviour, unchanged
  (this is the tileparty lesson applied: no early-wave
  trajectory divergence, no judged-n collapse from all-wave
  changes). Aid fights keep their door party by design.
- P — PARTY WOUND FLOOR (the ruling above): the round-end floor
  check uses the live party HP fraction when live allies exist,
  the leader fraction otherwise. fleeAt itself is unchanged
  (bravery/temperament/armed/allies/bond/day-7 holdBonus as
  computed today). A downed ally leaves both the numerator and
  the denominator the next round — the dead do not drag the
  living under the floor.
- S — SHARED BLOWS: the monster's hit each round targets
  uniformly among the live fighters (leader + live allies)
  instead of leader 60% / single-ally 40%. Total damage per
  round is unchanged — only WHO takes it changes. Fiction:
  the beast faces several people standing on its tile; it hits
  whoever is in front of it. With one live ally this is 50/50
  (vs 60/40 today); with more, the leader's share falls
  further. The choice draw fires only when 2+ live fighters
  stand (tileparty's RNG-stream discipline, kept).
- H — PARTY HOPELESSNESS: a party does not hopeless-flee.
  When the trajectory turns hopeless and live allies stand,
  Rally (if held and available) fires as today, War Cry (if
  available) fires as today, and otherwise the party HOLDS
  for this round — the floor check below, not hopelessness,
  decides whether they break. Log line once per fight
  ("looks at [allies] standing with them — and does not run.
  Not while they stand."). Solo hopeless flight is unchanged.
  This facet is the threshold change retreatdiag ranked harmful
  alone; it is ONLY tested inside this rule, paired with P+S+M,
  and guarded by the party-death cost bar below. If parties
  merely die more, the pilot NO-GOs on the cost bar even if
  rounds extend.
- M — SIMULTANEITY (party phase): when live allies stand at
  the START of a round, the party strikes before the monster
  acts that round (acted = party, then monster), instead of
  initiative order. The party that starts a round alive lands
  its blows that round; a monster-first leader death before
  any strike cannot end the round's damage. Solo rounds keep
  initiative order. This is the "simultaneity as a damage
  lever" blank from the 0002Z round note, tested as part of
  the rule, not as a separate damage buff: no strike number
  changes, only the order of a round both sides already act in.

Perception law (Steve 2026-10-28, absolute): no roster or list
feeds any decision here. T reads only tile co-presence at fight
time; P, S, H, M read only the fighters actually in the fight
(live allies list, built from T joins and the existing shout /
from-start joins). No outdoor-crew list, no co-departure stamp,
no "who is around" feed. Any facet found to read a list is
removed, not patched.

Gating freeze (Steve 2026-10-27, clarified 10-28): NO gate
retunes. The wave>=4 scope of T is a fight-rule scope (which
fights the joining rule applies to), not a scale, wave, or seat
gate change — no unlockedWave, deedGate, table, or ledger value
moves. If a reviewer reads it as a gate change, the arm stops
and reports to the coordinator instead of arguing.

Trick-aware morale: EVALUATED AND NOT EXTENDED. Fieldability
proved tricks cost strikes (influencer DPR 28.1 -> 15.2) and the
existing trick-aware hold (hold while HP > 25% when tricking)
already covers trick performers, parties included. Extending a
trick-hold to non-tricking parties would be H under another
name; it is not a separate facet.

## Fixture gate (Stage 0/1, BEFORE any pilot sweep — binding)

The pilot runs ONLY if the full rule passes this gate on proof
fixtures. The gate is fixed here, not fitted to fixture results.
Fixture shape (scripts/test-staying-b.js, same harness discipline
as fieldability: FULL src/js list in index.html order minus
DOM-only app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js,
seed Math.random BEFORE eval, window stubbed then deleted, never
stub Game.save): leader kitted machete+bow, fed, hide armor;
exactly ONE tile ally (the wild wave-4 shape tileparty measured:
size 2), hide armor; vs four wave-4 species (herald, influencer,
audit, eater) at two beast states:

- WOUNDED cell: beast at 300 HP (the judged-set typical wounded
  level: retreatdiag faced beasts at 241–362 HP among others),
  10 seeds per species, 40 fights.
- FRESH cell: beast at its minimum roll (herald 700, influencer
  850, audit 1100, eater 950), 10 seeds per species, 40 fights.

GATE (all three legs, full rule only — no facet shopping):
(a) WOUNDED kills >= 20/40 (50%) — a rule that cannot kill half
of optimally-kitted 300-HP fixture fights will not kill wild
fights, where leaders are worse kitted and DPR runs ~15–30, not
~50; (b) FRESH median party survival >= 4 rounds (mechanism
fires: parties outlast the base ~2–3-round shape); (c) SOLO
IDENTITY: solo fixtures (same beasts, same seeds, no tile ally)
produce outcomes byte-identical to base code (proves the
solo-identical-by-construction claim, not just asserts it).
Ablation is reported for the record as STAGED implementation
fixtures: the same fixture script is run after each build
stage (T, T+P, T+P+S, T+P+S+H, full) and each stage's output
is saved, so a gate failure still says WHICH facet did the
work — but ablation never selects a different pilot combo.
(CORRECTION, recorded before any fixture or judged run:
the original draft promised "fixtures with facets removed one
at a time"; that would need test-only switches inside shipped
game code, which this repo does not carry. Staged-build
fixtures measure the same thing without test scaffolding in
the game. No judged run has happened; no bar changed.)
If the gate fails, the arm is NO-GO at fixture stage: NO pilot
sweep is spent, the game code is killed (reverted), evidence +
scripts stay, and the report says so with fixture numbers.
That is a completed arm, not an unfinished one.

Sense leg (fixtures, before pilot): >= 2 fixture transcripts
read and quoted (one party hold + one party flee/death), judged
as played fights: does a party holding read as people standing
together, or as a delayed death? A hold that reads as a delayed
death is reported as such even if the gate passes — sense is a
report leg, not a veto, because the pilot's kill + cost bars
are the judge.

## Pilot (ONLY on a fixture-gate PASS)

Substrate (verbatim, both legs): scripts/policies/tableseat-nowait.js
VERBATIM, LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1
(fieldparty-form-diag recorder VERBATIM) PLUS the new staying-b
recorder (scripts/policies/staying-b-diag.js, observational only:
copies rec.tileJoined / rec.alliesJoined / rec.partySizeAchieved /
rec.allyTaken / rec.vHpLeft / rec.mHpLeft alongside the fieldparty
row, joined by fight-order index and verified on seed/day/mid/vid;
pure pre/post-reads, no game writes, no RNG draws, never throws
into the engine). 180d death-aware, competent policy, seeds
75101–75108 (the staying-a / tileparty pilot band, verbatim).
BASE leg first: the same sweep on unmodified code must reproduce
the control shape EXACTLY (meetings 1272, judgedA 24, kills 0,
wall won 3, natEver 7, entered 3, median 146d, deaths 286) —
else the instruments are broken, not the game, and no armed
sweep is judged. ARMED leg second, identical seeds.

Judged set (verbatim from chainkill/returns/staying-a): wave == 4,
channel field, caller in {resolve, patrol, aid}, leader NOT the
scholar. PRIMARY counts only tile parties: vKill with
tileJoined >= 1. Aid joins are fromTile = false and never count
toward the primary, even when an aid party kills.

PILOT GO requires ALL legs (a miss is NO-GO, never re-scored):
- PRIMARY: >= 3 judgedA party kills (vKill, tileJoined >= 1).
  Drive-offs (mFlee) are NEVER success, reported separately.
- MECHANISM: median survival rounds on judged party fights
  (tileJoined >= 1) >= 4 (vs base party mean ~1.5–3).
- SOLO CONTROL: solo wild fights (tileJoined == 0, no shout
  ally either — the pure-solo cut) show vDie <= control solo
  vDie + 2 AND median solo rounds within ±1 of control. A
  breach means the "solo identical" claim failed in the wild
  and the arm stops for diagnosis, not for a verdict.
- COST BARS: starvation deaths <= control + 2 on the band;
  judged party vDie <= control judged vDie + 2; median
  survival >= control median − 20d. (Per the 0002Z metric
  review, national-ever is DIAGNOSTIC on pilot bands, not a
  deciding leg — reported, never gated.)
- SENSE: >= 1 pilot-corpus party fight transcript read and
  quoted in the pilot evidence.

Confirm (ONLY on pilot GO): seeds 75101–75116, same substrate,
same bars scaled to the wider band: PRIMARY >= 6 judgedA party
kills (tileJoined >= 1); mechanism median party rounds >= 4;
same solo-control and cost bars (starvation <= control+2 on
the 16-seed band, judged party vDie <= control+2, median
survival >= control median − 20d). No confirm spend on a pilot
NO-GO, per MEASUREMENT section 9.

## Cost, safety, and reporting rules (binding on this arm)

- Kill-only frame throughout: drive-off never success, never
  pooled with kills, never described as a kill in any table.
- Balanced panel or identical-seed paired tables per section 15
  substitute (panel has no census-ingest mode, standing
  exception as in prior rounds). Say so; never fake a panel
  artifact.
- No src/js/storage.js, src/js/villager-build.js,
  src/js/villager-objectives.js, or docs/MAP.md edits (other
  workers' files). No merge, no push, no version bump, no live
  verification — the coordinator merges and verifies. Branch
  tip + evidence paths go in the final report.
- No new src/js module and no provides-header change is
  planned; if one becomes necessary, run
  node scripts/validate-ontology.js and include the regenerated
  docs/ONTOLOGY.md, otherwise leave it alone.
- After game-code changes: node scripts/check.js --quick with
  --cacheDirectory=/tmp/jest-cache-gaps-staying, distinct cache
  dir, --only field first; never loosen an assertion to go
  green; never run two jest processes against the same repo.
- Safe-commit only: bash scripts/safe-commit.sh "<message>" --
  <explicit files> (message first, then --, then files, never
  directories); [needs-eyes] in combat-adjacent/feel commit
  messages. After EVERY safe-commit, git status --short FIRST
  and repair any index clobber via HEAD-blob
  git update-index --cacheinfo after verifying worktree bytes
  match the HEAD blob — never git reset. If safe-commit
  refuses a game-code commit on its stale-tree guard (as it
  did for tileparty-a: >50 deleted src lines), do NOT force
  it and do NOT game the guard by splitting hunks: run the
  pilot from the worktree, preserve the game diff as an
  evidence patch, revert src, and report the refusal +
  patch path to the coordinator for a force decision. A
  pilot NO-GO makes the refusal moot (code killed anyway).
- Evidence under evidence/2026-10-29/ in this worktree. No
  /tmp outputs that must survive. EPERM flap: wait and retry,
  never force, never manual ref edits; preserve everything
  and report if a run aborts on it.
- If the pilot NO-GOs (or the fixture gate fails): kill the
  game code, keep evidence + scripts, report held-with-reason
  with the numbers that killed it. Staying as anything but a
  kill lever has no GO bar on this arm, so kills are the bar.

## Metric review (to be filled at judging time)

- (to be filled when the fixture gate / pilot runs)
