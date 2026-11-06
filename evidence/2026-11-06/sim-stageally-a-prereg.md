# Companion-staging + rally — second-killer production — PRE-REGISTRATION (arm sim-stageally-a)

Run: fleshout-20261106T0615Z. Axis: scale-onramp / winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Committed BEFORE any judged sim. Policy-side build
only; zero src/js. NO gate/price/deed/readyDemand change. If the probe
GOes, a confirm on 12–16 FRESH seeds is the NEXT run's job, not this one;
a game-code build is a further run's arm, not a silent addition here.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": wave 5 demands 2 LIVING
  villagers with wave-4+ kills. Wave-4 bands: damage 35–95, HP 850–1500,
  pierce 0.2–0.5. No canon invented here.
- `docs/PARTY.md`: parties are a System unlock (day 7); "Party + followers
  are placed near you on every node travel"; "Party members auto-join
  fights even beyond the normal 4-square radius"; "You ask people. Like a
  person." — the invite lives in conversation, not on a button. Cap 3 at
  unlock, 4 at day 14, 5 at day 30. Acceptance base 35 + trust×0.4,
  modified by temperament, goal, mood (the shared character decision
  `npcInviteDecision`, tackle-invite 2026-10-27: clamped 5–95, never
  always/never). Backstabbers always accept — a designed plot trap.
- "Monster encounters are fought, not rolled" (CANON.md): the lever changes
  HOW the scholar fights a wave-4 beast (with company, rallied), never
  whether the fight is rolled.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-05/sim-bankkiller-b.md` (+ prereg): rally THIN, not
  dead. Rally fires 7/7 when an ally is present, but allies stand beside
  the scholar in only 7/25 wave-4+ TB fights (28%). Verdict THIN;
  trigger redesign owed. The bottleneck is ally presence, not the rally.
  This arm IS that redesign: stage the ally before the fight, then rally.
- `evidence/2026-11-05/sim-killersim2-b.md`: DIAG-GO on a powered 32-seed
  screen — 0 days with two living killers on any of 6 banking seeds;
  M2 never-arrives (45 post-first-blood fights, 1 kill, 2.2%); M1
  dies-fast (first-killer survival median 9.5d); 3 of 10 kills are
  same-day kill-and-die.
- `evidence/2026-11-05/sim-secondkiller-b.md`: DIAG — FINISHING binds
  (3 kills in 58 wild wave-4 fights, 5.2%; field parties deal ~3% of
  monster HP in 2–3 rounds then flee or die; scholars lose 24/28 TB
  fights dealing ~20%). Post-first-blood kill rate 0/19.
- `evidence/2026-11-05/sim-tbretreat-refind-b.md`: policy-only pilot GO
  (retreat-and-refind confirm owed by the sibling arm) — this arm does
  NOT retune, re-run, or touch that lever. The rally here is the opposite
  direction (stand and fight with company), not a retreat variant.
- `evidence/2026-10-22/sim-splitkill.md`: splitkill KILLED-AT-PILOT —
  companions never staged into scholar TB fights on that substrate
  (partyMembers=[]). This arm is NOT splitkill: no hold-for-finish, no
  yield band, no soften/hold discipline; the scholar strikes normally
  after rallying. The splitkill failure mode (empty fights) is what the
  staging half of this probe is built to fix.

## Mechanism map (read from the code, not invented)

- `Game.startCombat` (src/js/game.js): joins roster villagers within
  Chebyshev ≤ 4 of the scholar (nearest 4) after `ensureVillagerPositions`
  (same-node, same-side-of-door villagers get a fresh square). Party
  members travel WITH the scholar — door transitions move party/followers
  (game.js "THE DOOR MOVES ONLY YOU (+ party/followers)"), and
  `npcNodeTravel` keeps `travelingWith()` villagers with the scholar — so
  a party member is on the scholar's node at fight time, inside the join
  radius (PARTY.md: "placed near you on every node travel").
- `Game.inviteToParty(vid)` (src/js/party.js): the engine-honest invite
  verb — System floor trust 20 ("you have to at least KNOW them"), party
  cap, then the shared character decision `npcInviteDecision` (kind
  'party', clamped 5–95). The conversation path (`invite_party` menu
  choice, conversation.js:4678 — offered when `hasDiscovered('party')`
  and effective trust ≥ 20, not mid-thread, inside the menu cap; and
  `dlg:invite`, convo-beats.js:452 — the dialogue-layer "Want to come
  with us?" on warm beats, which routes to the same `invite_party`
  handler, convo-dialogue.js:817) is the fiction-honest door: the scholar
  ASKS, in conversation, like a person. This arm uses the conversation
  path, never the bare verb — the decision and outcome are identical,
  the dialogue is preserved.
- `Game.tbPlayerRally()` (src/js/game.js, RALLY THE COALITION): once per
  fight, costs the action; REGROUP (allies step toward the scholar),
  REGAIN MORALE (stun clears, `rallied=3` holds the hopeless-flee line),
  COORDINATE (allies focus the foe nearest the scholar). Inherited
  verbatim from bankkiller — same trigger, same once-per-fight, same
  fall-through on false.
- **NO WAIT AT THE DOOR (design constraint found in the code read, not a
  silent narrowing):** the pending-encounter panel offers exactly one
  choice for a wanderer — "Face it" (app.js `panelFor`: `p-face`; the
  only other button, "Let the watch drive it off", exists for feast draws
  only). There is NO decline/flee verb for a pending wanderer, and the
  sim harness calls `startCombat` immediately after `policy.pending`
  returns. "Wait for a companion first" at the fight door is therefore
  INEXPRESSIBLE policy-side — delaying entry would be an abstain/flee
  variant, a different lever (w4abstain). This arm stages companions
  BEFORE fights (the party travels with the scholar) and the pending hook
  records staged-or-not at the door; it never delays a fight.
- Baseline competent NEVER parties up: a 30-day probe on seed 55001
  (this arm's band, before the prereg) shows `partyMembers=[]` at day 30
  with partyUnlocked()=true and hasDiscovered('party')=true, standing raw
  75, unlockedWave 3. The blank is real: the competent scholar fights
  wave 4 alone because nobody ever asked anyone to come along.
- Perception law (local_perception_first skill): the staging decision reads
  ONLY what the scholar can know — their own party, trust in people they
  know, who is on their node (npcNode), village standing (the player-
  visible standing line), and the wave unlock (System-announced beats).
  The policy never reads `state.waveKillLog` (pinned by a proof test with
  a poisoned log, bankkiller precedent). The instrument reads the kill log
  for measurement; the policy never does.

## Question

Does staging a companion before the fight — a fighting party that travels
with the scholar, rallied on entry — produce a second wave-4 killer while
the first still lives? The bankkiller rally works when it gets a chance
(7/7); this arm manufactures the chance.

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 55001–55008 (see seed-freshness record below), competent
  policy verbatim for the baseline, 150d death-aware horizon (dead
  villages stop simulating, +10d tail max via runDays).
- Stage 0 smoke (2 seeds, 55001–55002, to /tmp, NOT judged): instrument
  fires — party forms, invite attempts/accepts record, rally events,
  killer identity, first-blood day, death day + split cause. The smoke
  runs with the proof (before judged sims); its counts are recorded in
  the proof output, never as judged numbers.
- Baseline: POLICY=baseline on 55001–55008. Armed: POLICY=staged on the
  SAME seeds (identical seeds, policy-side only).

## Staging probe — exact definition (the only probe; no mid-run improvisation)

Policy: `scripts/policies/competent-stageally-a.js` — the bankkiller rally
policy (fight hook, trigger UNCHANGED) plus a daily staging hook and a
pending recorder. All other hooks (upkeep, contest, ...) are the base
competent policy's object, unchanged.

STAGING GATE (FROZEN): staging runs only when the party system is unlocked
(`Game.partyUnlocked()`) AND (raw village standing ≥ 75 OR
`unlockedWave() >= 4`). Rationale: invites take days (one attempt/day,
acceptance ~50–70%), so formation must start in the run-up to wave 4 or
the first wave-4 fights are solo by construction; starting at standing 75
keeps the party fresh for the wave-4 fights without spending 40 days
carrying trip rations and dying to wave-2 monsters. The gate is a policy
choice, not a game change; the unlock-only alternative is a metric-review
question for the next run, not a mid-run tuning.

TARGET (FROZEN): 2 party members. Cap is 3 at unlock (4 at day 14, 5 at
day 30) — the target leaves room for a third (e.g. a backstabber trap,
which is the game's design, not this arm's business).

ONE INVITE ATTEMPT PER DAY, AT HAVEN (FROZEN): after `competent.daily`,
if the gate is open, the scholar is at haven (`playerAtHaven()`), and the
party has < 2 members, the policy attempts ONE invite that day:
  1. Candidate eligibility (all reads scholar-knowable): alive, on the
     roster, not the scholar, not already in the party, not away
     (`v.away[vid]` absent), no assignment (`v.assignments[vid]` absent —
     do not pull the water/wood worker), on the scholar's node
     (`npcNode` == scholar's node), raw trust ≥ 20 (the System floor;
     the menu applies its own effective-trust/mood gate on top), AND
     shares a language with the scholar (`Game.commLevel(vid).level !==
     'none'` — the engine's own test; a villager the scholar cannot talk
     to cannot be asked — the conversation would be mime only).
  2. Ranking (deterministic — no RNG draws): armed first (an equipped
     melee/ranged/weapon on the person record — the scholar can see who
     carries a weapon), then trust desc, then villager id asc.
  3. The ask, in conversation: `talkTo(vid)`, then up to 5 turns. Each
     turn the scholar asks when the invite is offered (`invite_party`
     or `dlg:invite`, via the shared `chooseConversationChoice` helper,
     which pages menus); otherwise the scholar holds a real conversation
     to reach the ask — answers the villager's question first (`ans:` /
     `react:` / `gq:`, preferring a real answer over "I'd rather not
     say"; it is rude to ignore a question, and the menu only opens up
     after it is answered), continues the villager's story (`goon`), or
     once navigates to the subject menu (`dlg:subject` — the subject menu
     preserves the invite — conversation.js "PARTY INVITE survives the
     subject menu"). The scholar never accepts or declines another
     invitation for themselves (`betrayal:*` is never picked — a lure is
     the player's call, not the policy's), never mimes (`nv:*`), never
     deflects. If the invite is never offered the sitting ends and the
     attempt counts as not-offered. `endConvo(vid, 'left')` always runs
     (finally) so modal state never leaks. Turns taken and questions
     answered are recorded on the attempt event.
  4. Outcome recorded in module stats: invites attempted / accepted /
     declined / not-offered, with the candidate id and day. A refusal is a
     refusal — the same person is not re-asked within 7 days (people need
     time to change their mind; the next-best candidate is asked instead).
     The engine spends the choice per sitting anyway
     (`convoSpendChoice`).
  5. Re-invite after a party member dies or leaves: the target is
     re-checked every day the gate is open, so the party refills.

SMOKE FINDING — PRE-JUDGED CORRECTION (recorded before any judged
sim; the frozen trigger above — gate, target 2, one attempt/day, the
conversation path — is unchanged): the 40-day proof smoke on seed 55001
(proof leg only, /tmp output, NOT a judged sim) first ran the ask as
"up to 3 turns, invite-or-subject only" and produced 13 attempts, 0
accepts, 3 declines, 10 not-offered. Menu logging on the same
trajectory showed why the invite was never offered: (a) no shared
language — the menu was mime-only (`dlg:subject` / `leave` / `silence`,
then `nv:*`), which no invite can enter; (b) the villager was
mid-question — the menu was answers-only (`ans:` / `gq:`), and the old
conduct gave up instead of answering. The corrections above — the
shared-language eligibility and the answer-then-ask conduct (up to 5
turns, answer / `goon` / `dlg:subject` before the ask) — fix the probe
so the lever can be measured at all; they do not touch the GO bar, the
gate, or any threshold. The 40-day smoke numbers are not evidence and
are not carried into the judged run.

After the correction, the same 40-day smoke on seed 55001 produced 6
attempts, 0 accepts, 5 declines, 1 not-offered (proof leg, /tmp,
unjudged): the ask now REACHES the villager (not-offered 10 -> 1) but
the seed's armed pool is hostile — the two armed candidates (Henry,
Benoit) both carry the alone goal ("I work alone", -40 to the
acceptance chance), so their acceptance sits near 13-20% whatever
their trust, and the unarmed pool is away/assigned/off-node on most
days (7 of 13 staging days had no eligible candidate at all). The
armed-first ranking is KEPT: the goal is not scholar-knowable before
the ask (excluding on it would be roster-fed), the 7-day re-ask block
already encodes learning it, and on a 150-day horizon the pool rotates
past the refusers. Whether accepts land is a question for the 8-seed
judged run, not for one hostile seed's 40-day smoke — the smoke's job
is engagement (asks landing and getting answered), which the corrected
conduct now shows.

RALLY (FROZEN, bankkiller verbatim): on the scholar's FIRST turn of a TB
fight, when the fight contains a LIVE wave-4+ monster AND ≥ 1 living ally
fighter (kind `ally` or `villager`, alive, not fled, key ≠ 'p'), and the
rally has not yet been used in this fight: call `Game.tbPlayerRally()`
once. False falls through to `competent.fight`. Every later turn fights
normally via `competent.fight`.

PENDING HOOK (record-only): when a pending encounter exists, record
{day, monster id, wave, party size, party ids} into module stats. It
never delays, declines, or moves the scholar — the harness faces the
fight immediately after (see NO WAIT above).

NOT changed by the probe (stated limits): field fights (engine-driven —
the policy cannot touch a field fight's flee line; field fights are the
untouched control channel); wave 1–3 fights (base policy, unchanged,
except that a staged party travels with the scholar there too — the party
is a standing fact, not a wave-4 switch; its wave 1–3 effect is measured
by the survival guard); contests (harness-driven, unavoidable by design);
NPC killers (engine agency is autonomous — the probe covers only fights
the scholar is in); the rally's own cost (the scholar's round-1 strike is
spent rallying instead of dealing damage — a real trade, caught by the
kill-rate secondary and the survival guard, not assumed away).

Probe application is observable in-corpus three ways (independent): the
instrument wraps `Game.tbPlayerRally` (engine-call records) AND wraps
`Game.startCombat`/`Game.tbEnd` (fight-level rows: allies and party
members in the fight at entry, outcome, scholar-death-in-fight, monster
HP fraction at end) AND the policy exports per-seed module stats
(`resetStageallyStats` / `stageallyStats`, bankkiller pattern) captured
by the driver. runDays does not return the policy ctx, so ctx counters
are NOT the corpus — the instrument wraps and module stats are.

## Primary metric (binding — judge only against this)

GO iff the armed leg banks a living pair — at least 1 day with 2 living
wave-4 killers (daily engine snapshot day with readiness5.veterans ≥ 2,
the killerdeath primary; reconstructed maxSimultaneous ≥ 2 is the
cross-check) — on at least 1 seed, OR post-first-blood wave-4 kills are
at least 3 on the armed leg (baseline expectation ~1 at the measured
2.2% post-first-blood rate, killersim2). NO-GO otherwise. Pilot 8 seeds
only; confirm 12–16 on FRESH seeds, same design, ONLY on pilot GO.

GUARDRAIL (binds the verdict — a failed guard is NO-GO even if the
primary holds):
- G-survival: armed median survival ≥ baseline median survival − 10d
  (the party's trip costs — food, water, shared danger — must not buy
  the pair with the village's life).

DENOMINATOR GUARDS (THIN, bankkiller precedent — the THIN check runs
BEFORE the GO/NO-GO bar):
- T1 rally fires < 8 across the armed leg → THIN (the rally half is
  unmeasured — the pilot cannot judge the lever; NOT a NO-GO; the next
  run re-designs the trigger).
- T2 allies present in < 40% of armed-leg wave-4+ TB fights, when the
  armed leg has ≥ 10 such fights → THIN (the staging half is unmeasured:
  baseline presence is 28% (7/25); if staging cannot lift it past 40%,
  the lever never engaged and the rally denominator is still thin).
  With < 10 armed-leg wave-4+ TB fights T2 is vacuous (stated, not
  hidden) and T1 governs.

## Secondary (reported, never re-scored)

- Ally presence: share of wave-4+ TB fights with ≥ 1 ally in the fight
  at entry, both legs (instrument fight-level rows — NOT the bankkiller
  first-turn read, which is kept as a cross-check).
- Party formation: days with ≥ 1 / ≥ 2 party members (daily snapshots),
  invites attempted / accepted / declined / not-offered, party size at
  each wave-4+ pending (staged share).
- Living-pair days: snapshot days with readiness5.veterans ≥ 2, and
  reconstructed maxSimultaneous ≥ 2 (cross-check, killerdeath shape).
- First-killer survival: median kill→death days (observed exits only),
  both legs.
- Post-first-blood kill rate: wave-4 kills in fights after first blood /
  post-first-blood wave-4 fights (secondkiller shape).
- TB survival per wave-4+ TB fight (FIGHT-LEVEL via the tbEnd wrap —
  this replaces bankkiller's INVALID day-join secondary, which overcounted
  deaths: fights ending without a scholar death in that fight, both legs).
- Wave-4 kill rate (kills / wild wave-4 fights), both legs — descriptive
  only; the survival guard, not the kill rate, binds the trade.
- Wall numbers every run: wins, national/global, table, wave 4–5 unlocks,
  wave 4–5 faced, wave-4 kills, wave-5 kills, readiness-5-ready days,
  median survival.
- Per-killer trajectories for the closest seed. Closest seed = highest
  maxSimultaneous, tie-broken by longest killer survival (alive at end
  beats any death span; else max kill-to-death days).
- Killer channel mix (player vs NPC via kill-time scholar capture).

## Seed-freshness record (per local_seed_band_freshness skill)

Chosen band: 55001–55008. Whole-token grep of every candidate seed across
ALL dated preregs (`evidence/*/sim-*-prereg.md`) plus the evidence `.md`
files, before this prereg was written:
- 55001–55008: 0 hits each in preregs AND in evidence .md files. FRESH.
- Forbidden-band lists (`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/`):
  substring grep for 55001/55002 across the goal hidden_files tree hits
  10 files — ALL non-seed data values, verified by context: pantry-kcal
  figures (`"pantryFreshAfter":55002`, `"pantryKcalAtShare":55001`), a
  float (`2.3615395500212255`), and this run's own coordinator claim file
  (`lever-claims/fleshout-20261106T0615Z.json`, which names the shared
  band as the assignment). No prior prereg, forbidden-band list, or
  seed-use names 55001–55008. FRESH.
- No `550xx` family naming anywhere in the prereg/evidence check. The
  30-day probe above used seed 55001 (smoke only, unjudged, /tmp output
  — it writes no corpus and reserves nothing; the band's judged use
  starts with this prereg's baseline leg).

## Metric review (per §14; filled at verdict time, not now)

- Whether the living-pair primary (≥ 1 pair day) vs the post-first-blood
  alternative (≥ 3 kills) is the right GO shape, and whether a GO on
  post-blood kills without a pair day should still earn a confirm.
- Whether the staging gate (standing ≥ 75) vs an unlock-only gate
  changes exposure, for the next run.
- Whether the T2 40% presence line was the right power line for staging.
- Whether the party's wave 1–3 effect (it travels everywhere, not just to
  wave-4 fights) confounds the survival guard, and whether the guard's
  10d window is the right width.
- Whether the fight-level TB survival (tbEnd wrap) repairs bankkiller's
  invalid day-join secondary.

## Balanced panel (§15)

Attempted, outcome recorded honestly: there is no Game-root change to
compare — baseline vs armed differ ONLY in the policy (competent verbatim
vs competent + staging + rally wrapper) on identical seeds with an
identical instrument. That policy A/B is the comparison.
`scripts/balance-panel.js` takes no corpus input (bankkiller: `--help`
errors "Error: --out <panel-directory> required"); it will be attempted
and the refusal recorded, not fabricated into a compare `.md`.

## Telemetry deviation check

Attempted at verdict time; the tool has refused recorder corpora on every
prior killer-chain arm — the refusal, if it recurs, is the result.

## Sense-testing law

Read transcripts/dialogue for at least one armed-leg wave-4 fight and one
party invite (fightLines/deathSays + invite lines in the corpus): judge
meaning, coherence, consequences — never just counts. In particular: does
the invite read as a person asking another person to come along, does the
rally line read as a person calling their line together, and do rallied
allies' deaths read as a line holding, not as bookkeeping?

## Proof (committed with this prereg, before judged sims)

`scripts/test-stageally-20261106.js` — fixture tests (staging gate:
closed below standing 75 and wave 4 locked, open at 75, open when wave 4
unlocked; target 2; one attempt/day; candidate eligibility: away /
assigned / off-node / low-trust / already-in-party excluded; ranking
armed-first then trust; invite choice picked when offered via either
`invite_party` or `dlg:invite`; not-offered ends the sitting cleanly;
rally trigger inherited: wave-4+ only, allies required, round-1 only,
once per fight, rally-false falls through; policy never reads
`state.waveKillLog` — pinned by a fake-Game test with a poisoned log;
pending hook records and never delays — startCombat still fires after
it), live harness smoke (party forms on a staged run, 0 instrument
errors), off/on neutrality leg (staging policy vs competent on a short
run below the staging gate: identical days, endReason, kill-log length),
determinism (same seed twice identical). Instrument:
`scripts/stageally-instrument-20261106.js` (killerdeath instrument +
bankkiller rally wrap + startCombat/tbEnd fight-level rows + party
snapshot fields). Driver: `scripts/stageally-driver-20261106.js`.
Analyzer: `scripts/stageally-analyze-20261106.js` (reuses
bankkiller-analyze `perSeedExtra`/`legSummary` by require; adds staging
splits + the GO/NO-GO/THIN verdict above).
Probe policy: `scripts/policies/competent-stageally-a.js`.

## What this arm is NOT claiming

- It does not claim rally wins fights — the guard, not the rally, judges
  the trade.
- It does not claim the pair: the primary is a living-pair day OR
  post-first-blood production; a GO earns a confirm, not a "pair solved"
  headline.
- It does not claim field fights move: the policy cannot touch them; they
  are the control channel.
- It does not claim the wait-at-the-door: no engine verb declines a
  pending wanderer, so no such claim is made (see NO WAIT above).
- It does not claim the party is free: party members eat, drink, and can
  die on the road — the survival guard prices that, it is not assumed
  away.
