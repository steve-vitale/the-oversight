# sim-huntduty-b — hunt-duty assignment audit (finding #483's named next)

Diagnostic arm, loop B food-economy axis, run fleshout-b-20261017T1537Z.
Sibling: sim-shellrevive-b (finding #479 revival, SHELLCAMP layer);
sim-cookbulk-b (finding #483 named next #2, COOKBULK layer). This arm is the
AUDIT of the hunt-duty blank: the camp-task census measured hunt duties
NEVER ASSIGNED (0/672 duty resolutions across 16 runs), even though
`Game.villagerHuntResolve` exists and resolves through the same chance
machinery the player hunts with.

## PRE-REGISTRATION (binding; written BEFORE sims)

- PRIMARY: 100% attribution of the duty-resolution stream. Every
  `resolveOneAssignment` call and every `Game.assignTask` call on the
  substrate is classified into: policy never assigns hunt duties (which
  policy gate / which call site), engine-side gate (trust gate, HP<40
  party-bond refusal, remote/in-person gate, 'rest' semantics), eligibility
  failure (no duty-eligible hunters: occupation histogram + HP floor), or
  machinery missing (delegateTasks lacks 'hunt' / resolveOneAssignment
  lacks the branch / villagerHuntResolve missing). Residual "unknown"
  bucket is named and counted; GO requires it to be empty OR a named
  residual with a documented reason.
- GO = a named fix spec (policy-side handle, file + function + gate
  conditions, safety argument for villager combat risk) OR a verdict that
  assignment is impossible on this substrate (exact reason).
- PILOT BAR (only if an honest policy-side handle exists AND is provably
  safe — hunting is villager combat, real injury/death risk): 8-seed pilot
  under the same bar as the lever arms: PRIMARY engagement >= bar,
  GUARDRAIL starvation <= control+2, no new death mode, det-gate
  byte-identical gate-off. A miss is NO-GO, never re-scored.
- SEEDS: 7611-7618 (fresh; not on the used list: 4801-4808, 4101-4108,
  6101-6108, 9701-9708, 5201-5208, 931-938, 1801-1808, 4201-4208, 3801-3808,
  107-884, 1940809, 962-969, 941-948, 951-958, 4001-4004, 1253, 2601457,
  1404-1406, 2026, 2031, 2042, 3050, 3055, 3061, 8801-8808, 8701-8708,
  8901-8908, 1707, 1060511, 1802, s967, 7101-7108, 7601-7608, 7901-7908).
- POLICIES: leadfeast, belongfeast (FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT;
  16 runs total). 180d death-aware horizons (engine tail) — no fixed 200d.
- INSTRUMENT: scripts/instrument-huntduty-b.js (read-only wraps: stack
  capture + counters only; zero RNG draws; zero state writes; zero src/js
  and zero scripts/policies changes). Classifies: every assignTask
  attempt (task, caller, outcome), every resolveOneAssignment (task in/out
  — the throttle redirect can rewrite it), every villagerHuntResolve
  (caller attribution: duty-resolve vs other), every cleanCarcass (caller
  attribution: policy vs duty — resolves the census's contradiction),
  hunt-beat ring, and a roster eligibility snapshot (hunter-competent
  occupation histogram + HP floor).
- INSTRUMENT HONESTY: scripts/test-huntduty-b.js — PART A RED-verified
  fixture (a manually assigned 'hunt' duty resolves through
  villagerHuntResolve, counted and attributed exactly; RED = no instrument
  → nothing counted), PART B det-gate byte-identical trajectories
  instrument-on vs off (4 seeds x {leadfeast,belongfeast} x 60d), SMOKE
  green.
- §15: per-seed panel-schema JSONs (schema 'huntduty-wall/1') for the wall
  metrics alongside the sweep output; if a layer is piloted, run
  scripts/balance-panel.js compare --before <control> --after <armed>
  --out <prefix> and attach the compare .md.
- Sense-testing (law): read at least one transcript day involving hunts
  or hunt duties — do villagers hunt like people or is the blank visible
  in the fiction?
- COMPLETION GATES: 16/16 runs complete, schema-clean output (required
  keys; every resolution classified), 0 instrument errors, 100%
  attribution (named residual only).

## Canon read

- docs/CANON.md: read. Human skills ≠ alien abilities (processing/hunting
  are human-skill lane — hunting is villager labor, correctly); "If you
  don't know, it doesn't show." No canon doc covers the duty-assignment
  mix; MONSTER-WAVES.md covers wave law (hunt duties feed wave-1/2
  knowledge via the village-learns-the-animal hook). No canon invention
  needed: the machinery exists; the question is only why no actor calls it.
- Duty-side prior art: villagerHuntResolve (game.js 6164, parity 2026-10-10
  — real animal from real tile wildlife, hunter occupation +20%, gear,
  tracker/game_sense, flat 0.60/0.78 cleaning, injury roll) fires only from
  resolveOneAssignment's 'hunt' branch (game.js 6360) — the SINGLE caller.
  The census's 268 cleanCarcass firings are the competent policy's dawn
  cleaning pass on the scholar's trap haul (competent.js 1557/1561) plus
  haul.js 65 — scholar-side, not hunt-duty-side. The "contradiction" in
  the assignment brief is resolved statically: the two facts are
  independent; cleanCarcass is not a duty verb.
- Task brief's expectation confirmed statically: delegateTasks() includes
  'hunt' (danger:1, game.js 5812); resolveOneAssignment has the full 'hunt'
  branch (6360); assignTask gates for hunt: not food work → trust gate 20
  (5894), trust<40 → 40% reluctant refusal (5904), HP<40 → 'wounded' refusal
  at assign (5986) and at resolution (6100), in-person only.
  taskLeads['hunt'] / challenge-for-hunt can only arise from an existing
  hunt assignment — no autonomous path.

## Results

COMPLETION GATES (pre-registered): 16/16 runs complete (8 fresh seeds
7611-7618 x {leadfeast,belongfeast}, 180d death-aware), 0 instrument
errors, 0 unattributed events (44,992/44,992 stream entries classified:
9,851 assignTask attempts + 35,141 resolveOneAssignment calls), all 16
per-seed JSONs schema-clean. Det-gate (instrument on vs off): 8/8
byte-identical 60d trajectories. RED fixture: exact. (One mid-sweep
hiccup: a service restart wiped /tmp and killed the sweep at 14/16; the
per-seed JSONs in the worktree survived; belongfeast-7617/7618 were
re-run with the same instrument module. No duplicate or partial seeds.)

### PRIMARY — 100% attribution of the duty stream

16 runs: **hunt assignTask attempts = 0; hunt duty resolutions = 0.**
The machinery is NOT missing and NO engine gate fires — the policy never
asks.

assignTask attempts (9,851, every one `policy:competent`):
| task | assigned | refused |
|---|---|---|
| fish | 3354 | 132 |
| water | 3545 | 297 |
| cook | 2026 | 126 |
| garden | 358 | 4 |
| wood | 7 | 2 |
| **hunt** | **0** | **0** |

Duty resolutions (35,141, every one `duty-resolve`):
water 10,431 | wood 3,729 | stone 3,644 | cook 5,091 | fish 1,009 (+
fish→wood 2,167, fish→water 2,184, fish→stone 1,887) | garden 191 (+
garden→wood 1,222, garden→water 1,205, garden→stone 1,488) | forage 101
(+ forage→wood 265, forage→water 258, forage→stone 269) | **hunt 0**.

The stone task is never assigned — all 3,644 stone resolutions are the
engine's PRODTHROTTLE redirect (forage/garden/fish → wood/water/stone
when the pantry holds >4 fresh days). The wood/stone resolution mass is
mostly redirected fish/garden. This is the same engine the census saw.

Named residual (assignment side only): 893 forage resolutions with NO
matching assignTask attempt. Mechanism: the engine's taskLeads path
(game.js 6079-6082: `resolveOneAssignment(leadVid, {task})` for
`v.taskLeads` entries) — contender challenges default to the forage
domain (`v.taskLeads[ch.task || 'forage']`, game.js 6124), and challenges
arise from leadershipFriction when the policy assigns duties. The
resolution-side attribution is complete (caller=duty-resolve,
taskIn=forage); the assigner is the engine's contender system, not the
policy. No hunt involvement.

### The contradiction, resolved precisely

The census's 268 cleanCarcass firings (407 on this sweep's seeds) are
attributed caller-by-caller: **407/407 `policy:competent`** — the dawn
cleaning pass on the scholar's trap haul (competent.js 1557/1561) and
the haul layer (haul.js 65). **0/407 via hunt duties.**
`Game.villagerHuntResolve` has exactly ONE caller in src/js:
`resolveOneAssignment`'s 'hunt' branch (game.js 6360, verified
programmatically). Zero hunt resolutions → zero hunt-duty cleanings.
The two facts were never in contradiction: cleanCarcass is a
scholar-side verb, villagerHuntResolve is a duty-side verb, and they do
not touch.

### The assignment path, traced policy → engine

- **Policy side (the gate that fires):** no policy in the substrate ever
  calls `Game.assignTask`/`assignBest`/`assignAnother` with `'hunt'`.
  The competent policy's complete duty-assignment surface is:
  counterPlay → garden (assignBest), fish (assignAnother ×2-3), cook
  (direct assignTask); workWater → water, wood; plus a DEAD call,
  `Game.delegateTask(rid, 'garden')` (competent.js 1445) — `delegateTask`
  is undefined on Game (verified programmatically), silently swallowed
  by try/catch, and the assignBest fallback covers it. feastscale →
  leadcourt/belongseek → scalecourt → competent: the whole courtship
  substrate funnels through this one surface. It is a policy-omission
  blank, not an engine gate.
- **Engine side (all wired, verified programmatically):**
  `delegateTasks()` includes 'hunt' (danger:1); `resolveOneAssignment`
  has the full 'hunt' branch (real animal from real tile wildlife,
  hunter occupation +20%, villager gear, tracker/game_sense, flat
  0.60/0.78 cleaning into 'Game meat', injury 0.08-0.22); the fixture
  proves an assigned hunt duty resolves end-to-end and attributes
  correctly.
- **Engine gates that WOULD apply if a policy assigned hunt (named for
  the fix spec):** trust gate 20 (hunt is not food work; fish/garden
  gate at 10); 40% reluctant refusal at trust<40; HP<40 'wounded' refusal
  at assign (game.js 5986) and at resolution (6100); in-person only
  (playerAtHaven); newcomer veteran-buddy pairing (no refusal).
- **taskLeads['hunt'] / challenge-for-hunt:** dead paths without a hunt
  assignment — ch.task derives from the duty being assigned at the time
  of the challenge, and no hunt assignment ever happens.

### Eligibility bucket (measured, not the cause)

Day-0 roster hunter-competent villagers across 16 seeds: **4 at 1.4x
(hunter/tracker/ranger/soldier/marine/poacher), 6 at 1.2x
(butcher/farmer/athlete), 10 HP≥40** — ~0.6 hunter-competent villagers
per 12-person roster. Eligibility is sparse but not zero; it does not
explain the 0/9,851 — the policy never asks even on the one seed with a
true hunter (leadfeast-7615, hunters14=1).

### Wall numbers (standing directive)

16 runs: national 14/16, table 16/16, wins 0/16 (pre-seat substrate — no
modal driver on this road; the census measured the same), exiled 0/16,
Arc IV 16/16, wave-4 0/16, wave-5 0/16, village starved-days 25 total.
Deaths: 790 total — combat 485, villager combat 156, monster 77,
expedition 49, contest 6; food-side deaths (sickness 1, dehydration 2,
lockjaw 2, wound-unclosed 5) are ~1%.

TELEMETRY DEVIATION CHECK: 2 LOUD lines against
telemetry-baselines/scale-wall.json (national 12→14, table 16→16;
wins baseline 16→0 flagged on the flat-key form). Triage: EXPLAINED
substrate-mismatch — the baseline is the full-stack win-side substrate
(with modalplay/seatdrive); this substrate is pre-seat r13-only
(FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT), so wins=0 is the substrate's
own control (own control 0=0; the census on the same substrate also
measured wins n/a). National 14 vs 12 is run-to-run noise on the same
substrate (census: 13/16). Baseline NOT rolled.

### Verdict: DIAGNOSTIC-GO — named fix spec, no pilot

GO met via the named fix spec. NO pilot this run — the pilot bar is not
met, and §14 binds the miss, not the wish:

1. **The engagement substrate is absent (substrate-missing kill class).**
   A safe hunt layer must gate on hunter-competent villagers (hunting is
   villager combat — wave-1 animal shock, real injury/death risk; Steve's
   law). Measured: 0.6 hunter-competent per seed; only ~2-3 of 8 pilot
   seeds would engage. "PRIMARY engagement >= bar" is unmeetable on this
   road — the fix is not a duty-policy arm, it is a roster/worldgen
   question (why do 12-person rosters generate ~0.6 hunter-competent
   villagers?).
2. **The fix is policy-omission, not a tuning blank.** A single honest
   policy handle exists: counterPlay-side hunt staffing —
   `assignBest(Game, 'hunt', ['hunter','tracker','ranger','soldier',
   'marine','poacher'])` gated on (a) lean/starvation day (the blank
   matters for food), (b) a free hunter-competent villager, HP≥40,
   trust≥40 (avoids the reluctant roll; the engine enforces the HP and
   in-person gates itself), (c) one hunter at a time. Zero game-code
   changes; a scripts/policies layer like the sibling arms.
3. Named pilot plan for when the substrate exists: 8 seeds ×
   {control,armed}, PRIMARY hunt-duty resolutions + hunt kcal armed > 0
   with PRIMARY engagement ≥ bar, GUARDRAILS starvation ≤ control+2,
   villager deaths ≤ control, no new death mode, det-gate gate-off
   byte-identical. The layer is specified but unbuilt — a named next,
   not a miss.

## Sense-test (law)

The fiction is FULL of hunting but the village never organizes a hunt —
the blank is visible in the fiction, not just the counters. Day 12
(leadfeast-7612): "Word came: a tired hunter of Thornfield wants to join
Haven. 'Word travels: Haven takes people in. I'm people.'" — a hunter
walks to the village and the village has no hunt for them. The System
itself orders hunts: "SYSTEM CHALLENGE: 'Catch something! Anything! We
want to see how you do it!' (Hunt an animal today for a reward.)" — a
challenge the village's labor system cannot staff. Hunter knowledge
beats ("Wind it before it reaches the burrow, or hunt the whistlers
last") circulate as trivia. The 117 hunt-flavored beats in one run are
all challenges, System fiction, and knowledge — zero are "X returns with
meat." Nobody hunts like a person here because no actor exists who
hunts; the village behaves as duty-bound foragers/fishers/gardeners who
leave the hunt verb to the scholar's own feet (the policy's own hunt
trips are scholar-side, e.g. competent.js doAction('forage') — and the
COURTKILL machinery — never a duty).

## Village assessment

These are well-fed villages from the pantry view (14/16 national,
16/16 table) where 790 people died and only ~10 of food. The duty
economy is fish/water/wood/stone/cook — the creek and the woodpile, with
the garden mostly redirected to wood/water/stone by the throttle (the
pantry is full: 8,800+ redirected resolutions). The 297 water refusals
and 126 cook refusals (trust gate) say the village is staffed by people
who don't fully trust the scholar yet — and hunt gates harder than any
of those (trust 20 + reluctant roll). Who thrived: fishers and water
crews, the safe indoor/outdoor labor. Who died: fighters — 485 combat
deaths, 156 villager-combat, 77 monster. The hunters that do exist walk
to the village (Thornfield's tired hunter) and find no work for their
hands. The blank I fill: the attribution is complete and the fix is
named — the next arm is a roster question, not a duty question.

## Metric review (mandatory)

- PRIMARY (100% attribution) answered exactly: 44,992/44,992 stream
  entries classified, 0 instrument errors, 0 unattributed, named
  residual (forage taskLeads, 893 resolutions, mechanism documented).
- Det-gate ran 60d (not 180d): the instrument's reads are
  day-invariant; a longer gate adds no information. Set before spend,
  not rescored.
- The pilot bar was pre-registered as conditional ("if an honest
  policy-side handle exists AND is provably safe"); the engagement
  substrate turned out missing, so the pilot is not run — this is the
  pre-registered fast-kill path, not a mid-run rescoring. The named fix
  spec + pilot plan is the GO deliverable.
- Panel-schema JSONs emitted per seed (evidence/2026-10-17/
  perseed-huntduty/wall-*.json); no lever was piloted, so no
  balance-panel compare was run (§15: the panel is the instrument, the
  pre-registered threshold is the judge — there is no armed side).
- No metric was re-scored mid-run. No other §14 event: this run met its
  pre-registration.

## Named next arms

1. **sim-huntroster-b (proposed audit)** — why do 12-person rosters
   generate ~0.6 hunter-competent villagers (4×1.4 + 6×1.2 across 16
   seeds)? Audit the roster/occupation generation: is hunter-background
   spawn rate a worldgen parameter, and what would raising it do to the
   engagement substrate? The hunt-duty fix is downstream of this.
2. **sim-huntstaff-b (proposed lever, when #1 shows engagement)** — the
   named fix: policy-side hunt staffing (counterPlay-adjacent, lean-day
   gated, hunter-competent + HP≥40 + trust≥40, one hunter). PRIMARY hunt
   kcal/run > 0; GUARDRAILS starvation ≤ control+2, no new death mode,
   det-gate gate-off byte-identical. Zero game-code changes.
3. **sim-foragelead-b (proposed audit)** — the 893 forage resolutions
   with no policy assigner: confirm the contender-taskLeads mechanism
   from state (v.taskLeads entries per day) and measure what the
   forage-domain leads actually produce. If they produce real food,
   the hunt-domain equivalent is another path to hunt duties.

## Findings backlog note

Appended to hidden_files/sim-findings.md:
- [open] hunt-duty attribution (this run) + named fix/pilot plan +
  huntroster-b named next.
- [open] Game.delegateTask called but undefined (competent.js:1445) —
  silent no-op swallowed by try/catch; garden staffing survives via the
  assignBest fallback. Code smell, not a blank.
