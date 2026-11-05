# Rally the line — second-killer production — PRE-REGISTRATION (arm sim-bankkiller-b)

Run: fleshout-loop-b-20261105T2130Z. Axis: scale-onramp, winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Committed BEFORE any judged sim. Policy-side probe
only; zero src/js. NO gate/price/deed/readyDemand/VETSHAPE-default change.
If the probe GOes, a confirm on 12–16 FRESH seeds is the NEXT run's job,
not this one; a game-code build is a further run's arm, not a silent
addition here.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": "Standing opens the wave
  door; combat readiness decides whether the village walks through." Wave 5
  demands 2 LIVING villagers with wave-4+ kills. Wave-4 bands: damage
  35–95, HP 850–1500, pierce 0.2–0.5 — a 4–6 round fight for a godhood
  build (~220 dmg/round). No canon invented here.
- "Monster encounters are fought, not rolled" (CANON.md): the lever changes
  HOW the scholar fights a wave-4 beast (rally, then strike), never whether
  the fight is rolled. "If you don't know, it doesn't show": the rally
  reads only the fight in front of the scholar (below).

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-05/sim-killerdeath-b.md` (+ prereg): retention NO-GO.
  Retention kept killers alive longer (99136: 66d vs 2d) and still produced
  0/8 living pairs — the second killer never arrived, and retained-killer
  deaths happened AT HOME (arena, expedition) where retention does not
  reach. Next lever named: second-killer production or home/arena exposure.
- `evidence/2026-11-05/sim-secondkiller-b.md`: DIAG verdict — FINISHING
  binds (3 kills in 58 wild wave-4 fights, 5.2%; field parties deal ~3% of
  monster HP in 2–3 rounds then flee or die; scholars lose 24/28 TB
  fights dealing ~20%). Presence is NOT the binder (a would-be second
  killer is present in 58/58 fights). Post-first-blood kill rate 0/19.
- `evidence/2026-11-05/sim-killersim2-b.md`: DIAG-GO on a powered 32-seed
  screen — 0 days with two living killers on any of 6 banking seeds;
  M2 never-arrives holds on 5/6 (45 post-first-blood fights, 1 kill, 2.2%);
  M1 dies-fast (first-killer survival median 9.5d); 3 of 10 kills are
  same-day kill-and-die. Only 1/32 seeds ever bloods 2 killers.
- `evidence/2026-11-05/sim-grindfinish-b.md`: DIAG-NO — the grind chain
  works (wounds persist, lift carries them, lingerers restore at exit HP)
  but each step costs a scholar's life; TB fights end death-or-win (32
  death, 2 won, 0 fled). Next blank named: survival-per-TB-fight or
  retreat-and-refind.
- `evidence/2026-11-05/sim-vetrest-screen-b.md`: vetrest NO-GO /
  CONCEPT-DEAD (first-killer median survival 5d vs 19d bar); lever
  REVERTED. Do NOT revive it. Succession picks do not move survival.
- `evidence/2026-11-05/sim-tbretreat-refind-b.md`: policy-only pilot GO —
  early disengage from a losing wave-4+ TB fight (75/75 trigger, havenward
  + persistent chase): G1 exits 6/15 = 40%, TB survival 18.2% vs 15.0%,
  kill-rate guard 0.60×. Confirm on fresh seeds is OWED by the sibling
  arm (sim-tbretreat-refind-confirm-b) — this arm does NOT retune, re-run,
  or touch that lever.
- `evidence/2026-10-22/sim-splitkill.md`: splitkill KILLED-AT-PILOT — the
  scholar-softens/companion-closes discipline fired ZERO times in 59
  wave-4 TB fights because companions never staged into scholar TB fights
  on that substrate (partyMembers=[]). This arm is NOT splitkill: no
  hold-for-finish (the scholar strikes normally after rallying), no yield
  band, no soften/hold discipline; rally is a round-1 setup verb. The
  splitkill failure mode (empty fights) is this pilot's denominator, not
  its assumption — and on the CURRENT substrate companions DO appear in TB
  fights (companion wave-4 kills observed: Greta 99328, Sigrun 99156).
- Tracker note (1830Z review, next blank #2): "a lever on the wild death
  channel for first killers (succession picks are measured and do not move
  survival)". This arm answers it from the production side the killerdeath
  evidence names: the wild death channel is a party that breaks in 2–3
  rounds dealing ~3% — a rally that holds the line and focuses the damage
  attacks both first-killer survival in the fight and second-killer
  production. The (a)/(b) choice in the brief is exercised as (b) with (a)
  measured as a secondary (first-killer survival, TB survival).

## Mechanism map (read from the code, not invented)

- `Game.tbPlayerRally()` (src/js/game.js, RALLY THE COALITION): a
  player-facing rally verb for fights with living allies. Once per fight
  (`f.rallyUsed`), costs the action (`p.acted=true` +
  `tbAfterPlayerAction`). Three real effects, said aloud: REGROUP — every
  living ally steps toward the scholar (up to their speed, blocked cells
  and telegraph danger respected); REGAIN MORALE — stun clears,
  `rallied=3` (they HOLD THE LINE); COORDINATE — allies focus the foe
  nearest the scholar (`coordKey`, `coordRounds=3`).
- `rallied > 0` suppresses BOTH flee reads: the start-of-turn hopeless
  flee (game.js: `if (!sealed && !(v.rallied > 0) &&
  this.tbVillagerHopeless(v))`) and the reactive flee after damage
  (`tbVillagerReactiveFlee`: `if (sealed || (t.rallied || 0) > 0) return
  false`). `rallied` decrements once per round. The hopeless read itself
  (`tbFightTrajectory`) needs round ≥ 2 and fires when the villager's
  rounds-to-die are < 0.85× rounds-to-kill — the exact 2–3-round break
  secondkiller measured.
- `coordKey/coordRounds` are honored by `villagerDecide`'s prefer param:
  a rallied ally strikes the marked foe. Focus fire is the engine's own
  damage-concentration verb.
- The competent policy NEVER calls `tbPlayerRally` (zero call sites in
  scripts/policies/ — its "rally first" line is the `war_cry` ABILITY
  press in `abilityPressPlay`, a different verb: a System ability, not
  this human leadership verb). The combat bar already surfaces Rally as a
  tappable button for a human player (ability-use game-code 2026-11-03) —
  the verb is player-facing and real; the bot just never presses it. No
  prior arm has ever tested a rally policy.
- Perception law (local_perception_first skill): the rally reads ONLY the
  fight in front of the scholar — living allies in `f.fighters`, live
  wave-4+ monsters in `f.fighters`, the nearest foe. The policy never
  reads `state.waveKillLog`, no roster, no snapshot, no list-fed decision.
  The scholar rallies people standing beside them, never people from a
  list. (The INSTRUMENT reads the kill log for measurement; the POLICY
  never does — the two are separate files and the separation is pinned by
  a proof test.)

## Question

Does rallying the line at the start of a wave-4+ TB fight — holding the
allies in for 3 rounds and focusing their damage on one beast — produce a
second wave-4 killer while the first still lives?

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 98811–98818 (see seed-freshness record below), competent
  policy verbatim for the baseline, 150d death-aware horizon (dead
  villages stop simulating, +10d tail max via runDays).
- Stage 0 smoke (2 seeds, 98811–98812, to /tmp, NOT judged): instrument
  fires — rally events, killer identity, first-blood day, death day +
  split cause. The smoke runs with the proof (before judged sims); its
  counts are recorded in the proof output, never as judged numbers.
- Baseline: POLICY=baseline on 98811–98818. Armed: POLICY=rally on the
  SAME seeds (identical seeds, policy-side only).

## Rally probe — exact definition (the only probe; no mid-run improvisation)

Trigger (FROZEN): on the scholar's FIRST turn of a TB fight (the policy's
own per-fight turn counter — not `f.round`, whose semantics vary), when
the fight contains a LIVE wave-4+ monster AND ≥ 1 living ally fighter
(kind `ally` or `villager`, alive, not fled, key ≠ 'p'), and the rally
has not yet been used in this fight: call `Game.tbPlayerRally()` once.
If it returns false (no allies, already used, not the player's turn),
fall through to `competent.fight`. On every later turn the scholar
fights normally via `competent.fight` — strikes, tricks, ability presses,
and (where the base policy does it) retreats are all base behavior.

Implemented in `scripts/policies/competent-rally-bankkiller-b.js`
(competent wrapper; fight hook only; no daily/pending/contest/upkeep
change; no env gate; no `COMPETENT_SEEK_FIGHTS` change).

Scope choice (stated, not hidden): the rally fires in ALL wave-4+ TB
fights with allies present — NOT only in killer-window fights. The
mechanism is fight-level (hold the line + focus fire); restricting it to
the ~9.5-day median killer window would starve the denominator (a killer
lives through ~1–2 wave-4 fights). The chain outcome is still the judged
primary; the killer-window question is answered by the secondaries
(first-killer survival, post-first-blood kill rate), not by narrowing the
trigger.

NOT changed by the probe (stated limits): field fights (engine-driven —
the policy cannot touch a field fight's flee line; field fights are the
untouched control channel); wave 1–3 fights (base policy, unchanged);
pending encounters (no competent pending hook; harness startCombat
fallback faces them); contests (harness-driven, unavoidable by design);
NPC killers (engine agency is autonomous — the probe covers only fights
the scholar is in); the rally's own cost (the scholar's round-1 strike is
spent rallying instead of dealing damage — a real trade, caught by the
kill-rate and survival guards below, not assumed away).

Probe application is observable in-corpus two ways (independent): the
instrument wraps `Game.tbPlayerRally` (engine-call records: day, round,
allies present, result) AND the policy exports per-seed module stats
(`resetBankkillerStats` / `bankkillerStats`, refind pattern) captured by
the driver. runDays does not return the policy ctx, so ctx counters are
NOT the corpus — the instrument wrap and module stats are.

## Primary metric (binding — judge only against this)

Seeds with ≥ 2 DISTINCT wave-4 killers ever (`w4killersEver ≥ 2` from
`classifySeed` — distinct `by` in `state.waveKillLog` at wave ≥ 4).
This is the production step killersim2 names (M2 never-arrives: only 1/32
seeds ever blooded a second killer) and the precondition of the living
pair. It is chosen over the living-pair snapshot primary because on an
8-seed pilot the pair primary would read 0/8 on both legs with high
probability (killerdeath did) and say nothing about whether the lever
moves production at all. The pair is measured as a secondary and named
as such.

GO iff armed ≥ 2/8 seeds with ≥ 2 killers ever AND baseline 0/8 — or, if
baseline is nonzero, armed beats baseline by ≥ 2 seeds. Anything else is
NO-GO (a miss is NO-GO, never re-scored against a friendlier metric).
Pilot 8 seeds only; confirm 12–16 on FRESH seeds, same design, ONLY on
pilot GO. If the probe is inexpressible or the pilot is NO-GO with a clean
diagnostic census, the verdict is DIAG-NO with the census as deliverable;
the GO/NO-GO bar above still binds the pilot itself.

DENOMINATOR GUARD (THIN, refind precedent): rally fires < 8 across the
armed leg → verdict THIN (the mechanism is unmeasured — the pilot cannot
judge the lever; NOT a NO-GO; the next run re-designs the trigger). The
THIN check runs BEFORE the GO/NO-GO bar.

GUARDRAILS (bind the verdict — a failed guard is NO-GO even if the
primary holds):
- G3 kill rate not halved: armed wave-4 kill rate (kills / wild wave-4
  fights) ≥ ½ baseline kill rate. Vacuous-pass if baseline kills = 0
  (stated, not hidden).
- G4 survival not harmed: armed median survival ≥ 0.8× baseline median
  survival.

## Secondary (reported, never re-scored)

- Living-pair days: seeds with ≥ 1 daily engine snapshot day with
  readiness5.veterans ≥ 2, and reconstructed maxSimultaneous ≥ 2
  (cross-check, killerdeath shape).
- First-killer survival: median kill→death days (observed exits only),
  both legs.
- Post-first-blood kill rate: wave-4 kills in fights after first blood /
  post-first-blood wave-4 fights (secondkiller shape).
- TB survival per wave-4+ TB fight (refind G2 shape): fights ending in
  anything but the scholar's death, both legs.
- Rally mechanism: fires, fires with allies, rallied-fight outcomes
  (kill / scholar-death / flee / other, joined by day+mid — disclosed
  approximation, secondkiller's strict-match rule: a kill joins a fight
  only when the killer is among that fight's fighters; unmatched kills
  are reported, never assigned).
- Wall numbers every run: wins, national/global, table, wave 4–5 unlocks,
  wave 4–5 faced, wave-4 kills, wave-5 kills, readiness-5-ready days,
  median survival.
- Per-killer trajectories for the closest seed. Closest seed = highest
  maxSimultaneous, tie-broken by longest killer survival (alive at end
  beats any death span; else max kill-to-death days).
- Killer channel mix (player vs NPC via kill-time scholar capture).

## Seed-freshness record (per local_seed_band_freshness skill)

Chosen band: 98811–98818. Whole-token grep of every candidate seed across
ALL dated preregs (`evidence/*/sim-*-prereg.md`) plus the evidence `.md`
files, before this prereg was written:
- 98811–98818: 0 hits each in preregs AND in evidence .md files; no
  `988xx` family naming anywhere. FRESH.
- Collisions that ruled OUT the first choices (recorded so the next worker
  does not repeat them): 99411–99418 — the `994xx` family is named in
  today's preregs (8 mentions) and 99411/99412 individually; 99911–99918
  — 99912, 99916, 99917 individually named in preregs, and the `999xx`
  family is named; 98611–98618 — 98616 named in
  `evidence/2026-11-04/sim-hurthome-fix-c-prereg.md` (range 98601–98616);
  98711–98718 — 98716 named in the same hurthome prereg (range
  98701–98716). Avoided bands from the brief (991xx/992xx/993xx/995xx/
  996xx/997xx/998xx/968xx/898xx/736xx/981xx/975xx/972xx/961xx) were never
  candidates. A broad substring grep for "988" across evidence/ was
  abandoned as uninformative (it matches float values inside per-seed
  JSON corpora, e.g. fd 9.88…); the whole-token check above is the
  reservation check the skill prescribes.

## Metric review (per §14; filled at verdict time, not now)

- Whether the production primary (2 killers ever) understates the pair
  question, and whether a GO on production without a pair day should
  still earn a confirm.
- Whether the THIN threshold (8 fires) was the right power line.
- Whether rallying on round 1 (before any damage is dealt) vs rallying
  when losing changes the trade, for the next run.

## Balanced panel (§15)

INAPPLICABLE, stated not fabricated: there is no Game-root change to
compare — baseline vs armed differ ONLY in the policy (competent verbatim
vs competent + rally wrapper) on identical seeds with an identical
instrument. That policy A/B is the comparison. `scripts/balance-panel.js`
takes no corpus input and offers no two-corpus comparison (it installs its
own observer into fresh live sims under registered policies); it will be
attempted and the refusal recorded, not fabricated into a compare `.md`.

## Telemetry deviation check

Attempted at verdict time; the tool has refused recorder corpora on every
prior killer-chain arm — the refusal, if it recurs, is the result.

## Sense-testing law

Read transcripts/dialogue for at least one rallied fight and one killer's
death (fightLines/deathSays in the corpus): judge meaning, coherence,
consequences — never just counts. In particular: does the rally line read
as a person calling their line together, and do rallied allies' deaths
read as a line holding, not as bookkeeping?

## Proof (committed with this prereg, before judged sims)

`scripts/test-bankkiller-20261105.js` — fixture tests (rally trigger:
wave-4+ only, allies required, round-1 only, once per fight, rally-false
falls through, non-wave-4 delegates, ally-less delegates, sealed/arena
fights still rally — rally is not a flee; policy never reads
`state.waveKillLog` — pinned by a fake-Game test with a poisoned log),
live harness smoke (rally fires on a staged wave-4+ ally fight, 0
instrument errors), off/on neutrality leg (rally policy vs competent on a
short run with no wave-4+ ally fight: identical days, endReason, kill-log
length), determinism (same seed twice identical). Instrument:
`scripts/bankkiller-instrument-20261105.js` (killerdeath instrument +
`tbPlayerRally` wrap). Driver: `scripts/bankkiller-driver-20261105.js`.
Analyzer: `scripts/bankkiller-analyze-20261105.js` (reuses
killerdeath-analyze `classifySeed`/`killerFates`/`maxSimultaneous`/
`median` by require; adds rally splits + the GO/NO-GO/THIN verdict).
Probe policy: `scripts/policies/competent-rally-bankkiller-b.js`.

## What this arm is NOT claiming

- It does not claim rally wins fights — the guards, not the rally, judge
  the trade (a spent round-1 strike for 3 rounds of held line + focus).
- It does not claim the pair: the primary is production (2 killers ever);
  a GO earns a confirm, not a "pair solved" headline.
- It does not claim field fights move: the policy cannot touch them; they
  are the control channel.
- It does not claim the ability-use follow-up (main session's arm): no
  ability is pressed by this policy; rally is a human verb, not a System
  ability.
