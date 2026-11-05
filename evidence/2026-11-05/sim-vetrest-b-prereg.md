# Pre-registration — arm sim-vetrest-b (Loop B run fleshout-loop-b-20261105T1423Z)

BUILD arm. Axis: scale-onramp / winnability chain. First-killer
survival (1322Z next blank #1). The killersim2-b screen (32 fresh
seeds, 99311–99342) is the grounding evidence: ZERO days with two
living wave-4 killers; first-killer median survival 9.5d; 5 of 7
banked killers died in combat AT HAVEN; 3 of 10 wave-4 kills were
same-day kill-and-die. This arm builds the lever killersim2's
"Next blanks #1" calls for — first-killer survival — from a
code-read, not from the brief's leading shape alone.

## Canon note (read first, per the brief)

docs/CANON.md read first, then docs/MONSTER-WAVES.md (Wave 4/5
sections + "Combat readiness gates the standing unlock"). The rule
this arm touches: wave 5 needs 2 LIVING villagers with a wave-4+
kill in `state.waveKillLog` (readiness bar VETERANS,
`Game.waveCombatReadiness(5)`, src/js/standing.js). No canon doc
covers killer rest or succession. Mechanism claims below cite
code, not invented canon. No win-price / deed-gate / readiness-
demand change. No XP/gear files. No gate/price/deed change.

## CODE-READ — why blooded killers die in combat at haven (done first, per the brief)

Read before designing: `hurtVillager` (src/js/game.js:8065),
`removeVillager` (src/js/betrayal.js:1052), `playerDeath` /
succession (src/js/ledger.js:629), `resolvePatrol` /
`villagerHealCheck` / `healerRounds` (src/js/game.js:7879 /
7723 / ~7800), `tbBarrierExit` (src/js/game.js:36282),
`competent.fight` NEW-FIGHT ASSESSMENT (scripts/policies/
competent.js:~3610), `villagerFightAllies` (src/js/
party-wiring.js:37), monster `follows` flags (src/data/
monsters.json). Findings, each verified against the killersim2
corpus (evidence/2026-11-05/perseed-killersim2-b/):

1. THE SCHOLAR CANNOT DECLINE A HAVEN FIGHT. A monster that
   reaches haven becomes a pending encounter; `startCombat` is
   the single pending-clearer (game.js:34487, "the pending dies
   here on EVERY startCombat") — there is no decline path, and
   clearing the pending from policy code would be harness
   manipulation, not a game action. Inside the TB fight, the
   policy ALREADY flees outmatched wave-4 fights on turn 1
   (competent.fight NEW-FIGHT ASSESSMENT: totalMhp > 2.5*pmax
   is true for any wave-4 monster vs a ~100-HP scholar) — and
   the flee fails: the walk to the edge takes multiple exposed
   turns while the monster attacks, barrier pushes get consumed,
   chasers pursue across the barrier (tbBarrierExit chase
   continuation), and the directional flee HOLDS at haven (no
   push leads toward safety). Measured: the fleerepair confirm
   (2026-11-04) found verbatim baseline 0 fled in 53 TB
   exposures, 47 fighter-died. CONCLUSION: the brief's leading
   shape as a policy-side TB-fight rule ("the blooded killer
   sits out haven defense") is a NO-OP against the baseline
   for wave-4 fights — competent already tries exactly that
   flee — and making flee-from-haven work is TB-fight-flow
   work owned by Loop A's sim-tbretreat-b. Per the brief's
   guard, that shape is STOPPED here, not built. It is
   reported to the coordinator as needing the sibling lane,
   not edited here. (This arm builds the other half of the
   leading shape instead — see §Lever.)
2. THE MANTLE PASSES BY TRUST — AND A KILL BUYS TRUST.
   Succession (ledger.js playerDeath): `candidates.sort((a,b)
   => trust[b]-trust[a]); const newId = candidates[0]` — the
   highest-trust living NPC becomes the scholar. A wave-4 kill
   grants +5 trust (resolvePatrol vKill path, game.js) plus a
   'hero' memory. A blooded NPC killer is systematically the
   MOST likely next scholar — and the scholar is the one who
   fights every haven TB fight. Corpus proof: Valeria (99316)
   killed as a companion d54, became scholar d65, died d65 in
   a TB fight at haven; Greta (99328) killed as a companion
   d54, became scholar d87, died d87 in a TB fight at haven.
   Both died as scholar ON THE DAY THEY INHERITED, during
   multi-death haven assault chains (99316: scholar deaths
   d64, d64, d65, d65, d66, d67, d68). The village hands the
   Codex to its killer in the middle of a siege, and the
   killer walks into the same haven fight that killed their
   predecessor. The other 5 banked-killer deaths were
   scholar-at-kill (already scholar when they killed) and are
   NOT addressable by this lever — stated as a pool limit
   below (§14b).
3. NPCS HAVE A REST PATH THE SCHOLAR LACKS. `villagerHealCheck`
   (<70 HP → pharmacy, then +25 from a camp healer, else
   SIT OUT: "They rest today instead of ranging out") gates
   patrols and expeditions, and `healerRounds` (+15/day) treats
   the most-hurt villager — but EXCLUDES the scholar
   (`if (id === this.villagerId) continue`). The designated
   fighter is the one person the healer never treats. The
   NPC phase is survivable: Greta lived 33 days as an NPC
   (d54→d87); Valeria 11 days (d54→d65). Both died within a
   day of becoming scholar.
4. OUT OF REACH (stated, not chased): arena/contest deaths
   (contests are unavoidable by canon — the contest
   interruption principle; 2 of the 10 kills' killers died in
   the arena) and same-day kill-and-die (3 of 10 kills — the
   killer dies INSIDE the kill fight; no post-kill rest can
   reach it). The herald's `follows` field is a string ("it
   does not follow. It precedes.") — truthy, so the engine
   treats it as a chaser; noted as an out-of-scope data
   quirk, not chased (see sim-findings.md).
5. PERCEPTION LAW (local_perception_first): the lever below
   reads `state.waveKillLog` — the village's own record of
   kills it witnessed (kills are cheered on camera, the killer
   gets a hero memory, witnesses are stamped via
   stampKillWitnesses). The village knows who just bled
   because it SAW the kill. No roster scan: the rule keys on
   the succession candidates' own witnessed kills, never on
   a list-fed pick. The decision is the village's own (the
   fiction already says "the village chooses. Trust decides.")
   reading its own lived record.

## §14b substrate checklist (before the pilot)

1. CONTACT: yes — same-day inherit-and-die occurs on the
   measurement substrate (2/7 banked killers, killersim2).
2. POOL SIZING — THE HONEST LIMIT, STATED BEFORE THE RUN:
   the mantle-skip addresses NPC-at-kill first killers only:
   2 of 7 banked killers in killersim2 (29%). The brief's
   median bar (≥19d) needs the scholar-at-kill cases (5/7)
   to move too, which this lever cannot do — the pool is
   ~3.5x smaller than the bar's demand. The pilot is still
   worth running: whether the skip fires, whether skipped
   killers outlive their baseline counterparts (PAIRED,
   identical seeds), whether pairs form, and whether the
   skip costs the village (weak-successor risk) are all
   genuinely unknown — none is predictable from killersim2.
   If the pilot NO-GOs on the median while the mechanism
   fires, the kill is classified METRIC-BROKEN (§14a), not
   CONCEPT-DEAD, and the corrected metric goes to the next
   run. The bar is NOT re-scored mid-run.
3. VERB EXISTENCE: yes — succession is a single choke point
   (ledger.js playerDeath); the skip is a filter on the
   trust-sorted candidate list with a fallback (never
   strands the village with no successor).
4. HORIZON FIT: yes — inherit-and-die happens within days
   of the kill; the 150d horizon contains it many times over.

## LEVER — VETREST mantle-skip (the better mechanism from the code-read)

One behavior change, game-code, default-OFF:
at succession, the village does NOT hand the Codex to a fresh
wave-4 killer — they rest while the next-most-trusted leads.

- FLAG: `VETREST_MANTLE_SKIP=1` (node env only; browsers
  never set it — default OFF, byte-identical off-mode).
  Read in ledger.js playerDeath, guarded `typeof process`.
- RULE: after the trust sort, if the top candidate has a
  wave-4+ kill in `state.waveKillLog` with 0 <= (today -
  killDay) <= 45, skip them and take the next-most-trusted
  candidate who is NOT a fresh killer. If every candidate
  is a fresh killer (or there is only one), fall back to the
  unfiltered top — the mantle MUST pass. Window 45d: covers
  both observed same-day inherit-and-die cases (11d and
  33d after the kill) with margin; the retention probe's
  30d window would have missed Greta's by 3 days.
- NARRATION (no silent actions): when the skip changes the
  pick, the village says so on camera (one line: the village
  looks to the blooded killer, "not yet", and names the
  one who takes the Codex instead). Only when the flag is
  on and the pick actually changes.
- TRACE (observability): each skip appends
  `{day, skipped, picked}` to `state.village.vetrestSkips`
  (cap 50), flag-gated only. The driver copies it into the
  per-seed JSON; the analyzer counts skips per seed.
- WHAT IT IS NOT: not a number buff; not a gate/price/deed
  change; not XP/gear; not retention-by-location (killerdeath
  kept scholars home — this changes WHO becomes scholar);
  not vetrestage shelter/triage/escort (that arm excluded
  the scholar and was policy-side; this is succession,
  game-code). It does not touch TB fight flow, flee,
  sim-fleerepair-a files, or build-finish-instrument files.

## Corpus

- Fresh band: 99711–99718 (8 seeds). Freshness verified by
  whole-token grep BEFORE any judged sim (see Freshness check
  below): no 99711–99718 token in any dated prereg
  (evidence/*/sim-*-prereg.md), no 99711–99718 token in any
  dated evidence .md, no 99711–99718 perseed filename. The
  only whole-token 99711–99718 hits anywhere are old-Oct JSON
  corpora values that are NOT seeds (`"pantry":99711`,
  `"pantry":99713`, `"pantry":99716`, hash fragment
  `142:142|100|2400|6|99717|0|54`), verified by context.
  Never reuse 991xx/992xx/993xx/996xx/897xx/736xx bands.
- Policy: competent policy VERBATIM on BOTH legs (no policy
  variant — the lever is game-code). Baseline leg:
  VETREST_MANTLE_SKIP unset. Armed leg:
  VETREST_MANTLE_SKIP=1. Instrument reused verbatim:
  scripts/killerdeath-instrument-20261105.js (killsLive,
  scholarDeaths with at-haven/in-combat context, killerTrack,
  daily with readiness5) + driver reads of exiles and
  vetrestSkips at finalize. Driver:
  scripts/vetrest-driver-20261105.js (killersim-driver
  pattern: say-capture, daily snapshots, 150d death-aware).
- Horizon: 150d death-aware (dead villages stop simulating,
  +10d tail max), same as killersim-a / killersim2 /
  killerdeath. Staged (§§9–12): PILOT first — the 8 seeds
  run baseline then armed; instrument errors (0 required),
  determinism and off/on-neutrality legs run in the proof
  BEFORE the pilot is judged. Confirm (12–16 FRESH seeds,
  new band, same verification) ONLY on pilot GO.
- The analyzer reads the fresh corpus only for judged numbers.
  The 99311–99342 corpus is CONTEXT ONLY (its banking
  distribution sizes the pool — see §14b), never the verdict.

## Freshness check (run 2026-11-05, before this prereg was committed)

- `rg -o '\b9971[1-8]\b' evidence/*/sim-*-prereg.md`: zero
  hits. Same tokens against evidence/*/sim-*.md: zero hits.
- `find evidence -name '*99711*' ... '*99718*'`: zero files.
  (The only `9971*` filenames are seed 9971, four digits,
  not this band.)
- `rg -o '\b9971[1-8]\b' evidence/`: 35 hits in 25 files,
  EVERY one verified by context to be a non-seed number
  (pantry kcal values 99711/99713/99716 in Oct journey-scale
  corpora; hash/telemetry fragments containing 99717 in
  Oct ambient corpora). No JSON hit is a seed.
- Same tokens against the goal hidden_files: hits only in
  archived Oct JSON corpora (pantryBefore 99716, ambient
  hash fragments) — non-seeds, same class. No prereg, no
  forbidden-band list names this band.

## Definitions (fixed before any judged sim)

- Killer / first killer / BANKING SEED: killersim2's
  definitions, unchanged (killer = vid with >= 1 wave-4+
  kill in waveKillLog; banking seed = >= 1 wave-4 kill AND
  the killer alive at end of the kill day — same-day
  kill-and-exit does NOT bank).
- Living on day d / L(d) / L>=2 day: killersim2's,
  unchanged.
- First-killer survival: exitDay - firstDay (death and exile
  both end survival); censored (still living at village end)
  first killers are reported separately and EXCLUDED from
  the median; a median is reported only if >= 3 observed
  exits exist (killersim2's rule).
- SKIP: a succession where the flag is on, the top-trust
  candidate is a fresh killer (window 45d), and the pick
  goes to the next-most-trusted non-fresh candidate.
  Counted from vetrestSkips (driver-copied) AND cross-
  checked against daily scholarId (the skipped vid must
  not appear as scholarId on any snapshot day inside its
  window — reported, not silently resolved).
- PAIRED SURVIVAL (mechanism measure): on banking seeds,
  first-killer survival armed vs baseline, same seed, side
  by side. The trajectories diverge only after the first
  skip fires, so the early kill is usually identical.
- DEATH CHANNELS: killersim2's deathChannel, unchanged
  (contest/arena vs wild vs other, from the killerdeath
  split vocabulary).
- COST BARS (from the corpus fields, fixed here):
  - median village survival: median of per-seed run days.
  - starvation deaths: teleDeaths rows with cause exactly
    'starvation' (any player flag), total across the band.
  - village losses: seeds with villageLost true.
  - ROSTER CO-PRIMARY (§14c): non-scholar fallen count =
    fallen entries whose villagerId never appears as a
    scholarDeath scholarId, per seed. (The scale wall lives
    in the roster: a skip that protects the killer while
    the village dies around them must show up here.)
- WALL NUMBERS: wins / national / table (unobserved, never
  inferred) / wave-4 unlocks / wave-4 faced / wave-4 kills /
  wave-5 unlocks / wave-5 faced / wave-5 kills /
  readiness-5-ready days / median survival — per leg.

## Pre-registered metrics (binding — a miss is NO-GO, never re-scored)

- PRIMARY (brief's bar, binding): on BANKING seeds,
  first-killer median survival (observed exits only,
  >= 3 required to report) >= 19d (2x the 9.5d baseline)
  AND >= 1 banking seed with >= 1 day of 2 living killers
  AND cost bars hold:
  (i) median village survival armed >= 0.8 x baseline;
  (ii) starvation deaths armed <= baseline + 2;
  (iii) village losses armed <= baseline + 1;
  (iv) ROSTER CO-PRIMARY (§14c): median non-scholar fallen
  armed <= baseline median + 2.
- Verdict GO iff ALL of: the pilot is powered (see Power
  rule) AND the primary holds in full. If pilot GO →
  confirm on 12–16 FRESH seeds (new band, same
  verification) + balanced panel (§15, see below) before
  any landing claim.
- Verdict NO-GO iff powered and any primary clause misses.
  A NO-GO on the median clause with the mechanism firing
  (skips > 0 AND paired survival up on >= 1 banking seed)
  is classified METRIC-BROKEN (§14a — the bar was
  unachievable for this mechanism: pool ~29% vs a bar
  needing the scholar-at-kill majority to move), not
  CONCEPT-DEAD. A NO-GO with zero skips firing is
  CONCEPT-DEAD (the mechanism never engaged) or
  SUBSTRATE-MISSING (if the engine did not stage a
  succession inside a killer's window — stated, not
  assumed). On NO-GO the instrument is reverted so no
  src/js trace remains, and the kill is reported honestly.
- POWER RULE (pre-registered, house pattern from
  killersim2): the pilot is UNDERPOWERED (not NO-GO) iff
  fewer than 2 banking seeds across BOTH legs, or fewer
  than 3 observed first-killer exits for the median. An
  underpowered pilot reports the mechanism measures and
  proposes the 32-seed screen as the next run — it claims
  no GO/NO-GO.
- INSUFFICIENT-DATA iff > 2 of the 16 legs carry
  instrument errors.
- MECHANISM MEASURES (pre-registered, reported not
  verdicted except as the kill-classification input above):
  skips fired per leg (count + seeds); skipped killers'
  paired survival (armed vs baseline, same seed); L>=2
  days per banking seed per leg; second-killer production
  (banking seeds with >= 2 killers ever; post-first-blood
  fights/kills); death channels per dead killer.
- REPRODUCTION / SANITY (not judged): instrument errors 0
  on judged legs; the proof's live determinism + off/on
  neutrality legs pass (same seed twice identical;
  instrument-off trajectory unchanged at 30d; flag-off
  trajectory identical to pristine baseline at 30d).
- BALANCED PANEL (§15): runs ONLY on pilot GO (before
  confirm) — a panel is not owed on a killed arm. Build on
  the base commit, then with the lever applied (flag ON in
  the after panel's environment); attach the compare .md
  to the evidence file. If the panel tool cannot carry a
  game-code env flag cleanly, that is stated in the
  evidence (as the fleerepair confirm did) and the per-seed
  paired comparison stands as the evidence — never a
  fabricated panel compare.

## Sense-testing

At least one villager transcript/dialogue sample read from
this arm's own corpus and judged for meaning (not counts):
for the banking seed with the longest-lived first killer
(or the seed where the skip fires, if any), quote what the
village is TOLD about its veterans and about the succession
— the "veteran kill" cheers, the skip line (if it fires),
the readiness hold beats — and judge whether the story
makes sense for a village whose killers rest while others
take the Codex. If retained veterans die away from combat,
note it and move on — do NOT chase it.

## What this arm will NOT do

No lever on the TB-fight flee path (Loop A's sim-tbretreat-b
owns TB fight flow — the leading shape is STOPPED here per
the code-read, §1 above); no retention-by-location rebuild
(killerdeath's probe stands); no vetrestage rebuild; no
gate/price/deed/readyDemand/VETSHAPE change; no XP/gear
files; no re-judging of 99311–99342; no rebuild of the
ability-use follow-up (main-session owned). The release
question stays a future arm's question.
