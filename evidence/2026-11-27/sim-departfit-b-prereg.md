# sim-departfit-b — PREREG (frozen before any judged sim)

## 0. Question

Do launched parties depart with loaded bows once the village checks
fitness before launch? (Topmost next blank from the 2026-11-27 1830Z
round; launchfit DIAG-GO, evidence/2026-11-27/sim-launchfit-b.md.)

Launchfit on fresh band 111101–111108: 105 of 245 ranged carriers (43%)
depart with ZERO ammunition; the famine is per-village (seed 111101
loads 0 of 47 volley carriers, 111108 loads 1 of 12). HP is NOT the
target (median departure HP 85; the ≤20 HP Alberto tail is 1.2%).
Arming is complete (honest armed share median 1.0). The live departure
path is the brain path (`Game.vbrainExecuteDepart`; `winPlanDepart`
never fired on that band). This arm BUILDS the departure-fitness check
(arm + load before launch), ammo-first.

## 1. The lever (frozen design)

A departure-fitness check in the brain departure path only
(`vbrainExecuteDepart`, `src/js/villager-brain.js`, the `party_launch`
branch), after the dead-target re-seed check and before any
`startExpedition` call. Members: the holder + the commit's companions
(companion always; companion2 only when VETREENGAGE=1; companion3 only
when PARTYSIZE4=1 — mirroring the launch code; in this arm's sims both
flags are off, so holder + companion). The solo-EXPEDITION branch is
NOT checked (those are hunts/forage/scouts, not win-plan fight
launches); `winPlanDepart` is NOT checked (it never fired on the
launchfit band — the brain path is the live one).

Per member, in the same honest order as `startExpedition`:
1. If unarmed (`gearRead` armed=false): try `villagerGearUp(vid, true)`
   then `villagerStageBow(vid)` (env-gated inside; no-op when off),
   re-read.
2. If a ranged carrier (volley weapon: the equipped ranged def carries
   `weapon.ammo` — the launchfit convention; a spear in the ranged slot
   is NOT a ranged carrier and needs no ammo) with 0 carried ammo: try
   `villagerPocketAmmo(vid)` (own stash → communal pile → one craft
   attempt, the existing loader), re-read.
3. Still unarmed, or still an unloaded ranged carrier → HOLD: voice it
   with `holdVoice(..., 'no-ammo')` (new kind; 'kit' if the only fail is
   unarmed) and return `'hold'`. The plan stands; the dawn bid re-runs
   the check the next day, so a held launch retries its load daily.
   No HP gate anywhere (HP is not the target).

Voice: the new `holdVoice` kind `'no-ammo'` names the holder and the
empty quivers in plain words ("will not send out a bow with an empty
quiver — no arrows or stones left to load" shape), ending with the
holdspeak closer "— the party waits." so the hold is a decision
people made, not a ledger. Dedup/streak machinery is holdVoice's own
(once per holder-day, day-count bands).

Telemetry: `village.departFit` counters `{ checked, loadedByCheck,
heldNoAmmo, heldUnarmed }` + `departFitByVid[vid]` (last outcome), so
the driver can attribute holds and check-driven loads. The check
itself draws no new RNG (the loaders draw exactly as they do today at
departure).

KNOWN INTERACTION (documented, not hidden): the check moves the
first load attempt earlier; `startExpedition` still calls
`villagerPocketAmmo` afterwards. When the check loads a carrier to
cap, the later call is a no-op (`carried() >= cap`). When the
check's craft attempt FAILS and materials for another batch remain,
`startExpedition` attempts a second craft — the departure gets up to
two craft attempts instead of one. The driver counts `ammo_craft`
telemetry events per seed on both legs, so the double-craft magnitude
is measured, not assumed. The proof test bounds the check itself to
at most one `villagerPocketAmmo` call per member per departure.

KNOWN FAILURE MODE (guardrailed, not softened in advance): a village
with no ammo anywhere holds every launch until ammo appears; a
village with exactly one craft batch that fails burns it and then
holds until ammo is found another way. If launches collapse, the
launch-count guardrail fails and the verdict is NO-GO with a named
softer variant for the next round (e.g. hold only when ALL ranged
carriers are dry, or hold N days then launch anyway) — the hold is
NOT re-scored softer mid-run.

## 2. Frozen bars (judge only against these; a miss is NO-GO, never re-scored)

| Bar | Threshold |
|---|---|
| B1 primary — post-load loaded share | ≥ 0.80 of ranged carriers on LAUNCH departures carry ammo > 0, read AFTER the departure call (true departure loadout; see §3 stamp-timing note) |
| B2 guardrail — launches | launch count within ±25% of the baseline leg on identical seeds |
| B3 guardrail — survival | median survival (gameDays) not worse than baseline by > 10d |
| B4 guardrail — deaths | no death-cause share moves > 15pp vs baseline (from `samples.deaths[].cause`; deaths count reported alongside) |
| B5 instrument health | 0 instrument errors across both legs; determinism byte-identical on a re-run of one seed per leg |

Verdict: GO iff B1–B5 all pass (pilot); then confirm 12–16 seeds on a
fresh extension band (band picked, verified fresh, and pre-registered
before running it). NO-GO iff any bar fails — including a B1 pass
bought by a launch collapse (B2 catches it).

## 3. Method

- Seeds: 111301–111308 (8 seeds, pilot). Policy: competent verbatim
  (`scripts/policies/competent.js`, `competent()`). No policy variant,
  no env flags (BOWOPEN / VETREENGAGE / PARTYSIZE4 all off, as in the
  launchfit band). Horizon: 150 days, death-aware — dead villages stop
  simulating (+10d tail max via runDays endReason).
- Legs (paired, identical seeds, one lever apart): BASELINE = current
  master, no lever (instrument only); PILOT = + departure-fitness
  check. Baseline runs FIRST and its post-load loaded share is
  recorded before the pilot is judged.
- STAMP-TIMING NOTE (method correction vs launchfit): the launchfit
  instrument stamps BEFORE the departure call, i.e. BEFORE gear-up /
  stage-bow / pocket-ammo run inside `startExpedition` — its 57.1%
  loaded share is a PRE-load read. The true departure loadout is
  higher wherever the pile can load a carrier. This arm's instrument
  (`scripts/departfit-b-instrument.js`) stamps BOTH: the pre-call
  stamp (launchfit convention, for comparability) AND a post-call
  stamp (members re-read after the original call returns, for
  `launch` results — the true departure loadout; for `hold` results
  the post-attempt state, members keep pocketed ammo, honestly).
  The PRIMARY metric B1 is the POST-load share. The launchfit 57.1%
  is the pre-load reference, NOT the baseline — the baseline is
  measured here, on these seeds, with this instrument.
- Driver: `scripts/departfit-driver-b.js` (one process per seed,
  sim-harness `loadGame`/`runDays`, seed before eval; refuses to
  overwrite per-seed files; counts `ammo_craft` / `weapon_craft`
  telemetry events per seed by wrapping `Game.tele` after setup).
  Per-seed files:
  `evidence/2026-11-27/perseed-departfit-b-ctl/departfit-b-s<seed>.json`
  and `...-arm/...`. Wall numbers recorded per seed (wins, scaleRank,
  progState table flags, unlockedWave, gameDays/endReason, deaths with
  causes).
- Analyzer: `scripts/analyze-departfit-b.js` — reads both corpora,
  computes B1–B5, the distributions (pre- vs post-load loaded share,
  armed share, HP context, per-seed hold counts and launches-after-hold,
  departFit counters, craft-attempt counts), and the verdict.
- Proof: `scripts/test-departfit-b.js` — check on a fake Game
  (dry carrier loads from a stubbed pocketAmmo; no-ammo-anywhere
  holds with the voiced line; spear carrier needs no ammo; HP never
  gates; at most one pocketAmmo call per member; armed carrier with
  ammo passes through untouched), holdVoice 'no-ammo' line shape
  (ends "— the party waits."), analyzer on a synthetic corpus, and
  the real-corpus self-check.
- Balanced panel (§15): `scripts/build-departfit-panels-b.js` builds
  before/after panels from the paired corpora (same pseudo-panel
  schema as build-depmat-panels-a.js); `node
  scripts/balance-panel.js compare` runs over them. The panel is the
  instrument; the frozen bars are the judge.
- Telemetry deviation check at the end (`node
  scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-27/perseed-departfit-b-arm/*.json' --metrics
  national,table,wins,exiled`); any LOUD line is a same-run
  investigation item.
- `node scripts/check.js --quick` after every change (green list;
  never loosen an assertion to go green). `node
  scripts/check-wired.js` for the new game-code function.

## 4. Seed-band freshness check (run before freezing)

- Grep every dated prereg under `evidence/` for 111301–111308: ZERO
  hits. Grep all `evidence/**/*.md` for `11130[1-8]`: ZERO hits.
- No per-seed file `s11130[1-8]` exists under `evidence/`.
- Forbidden/contaminated lists named in preregs (ledgerbound
  9700–9711, 9930–9941; raidcallers 9950, 10000; fallbackfeared
  74201–74208; fullseatgate/w5block 73601–73608 et al.; launchfit
  111101–111108) name no 1113xx band.
- Band 111301–111308 is FRESH. Fallback if a collision is found on
  re-check: 111401–111408 (verify fresh before use).

## 5. Wall numbers (reported every run, not judged)

Wins, national reach, table, wave-4/5 unlocks, median survival — from
the per-seed summaries (scaleRank, progState table flags,
unlockedWave, gameDays/endReason, Game.won), both legs.

## 6. Metric review (to be filled at closeout; bars NOT re-scored)

- (filled in the evidence file)
