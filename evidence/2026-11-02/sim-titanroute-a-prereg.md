# Loop A 0915Z round — scale-onramp: deliberate titan routing (march + sound-the-call), POLICY ONLY

Run: fleshout-loop-a-20261102T0915Z, arm sim-titanroute-a, axis scale-onramp.
Worktree branch: sim-titanroute-a. POLICY-SIDE PROTOTYPE ONLY — zero `src/js`
changes in this arm (policy files under `scripts/policies/` + drivers/tests
under `scripts/` + this prereg + evidence). Sibling Loop B trees/branches
NOT touched. Coordinator owns tracker, claim files, lock, rotation — not
touched here.

## Canon read first

- `docs/CANON.md` read. No titan canon doc exists in `docs/` (same finding
  as prior arms 0445Z/0605Z/0725Z/0815Z) — none invented. In-code sources:
  `src/js/titans.js` + `src/data/titans.json` + `src/js/havenGrowth.js`.
- `docs/PERCEPTION.md` read (perception hints are peripheral/nearby only —
  consistent with the perception law below). `docs/MAP.md` consulted for
  travel honesty (walk tile-by-tile via `Game.travelTo`, never forced).

## Starting point (grounded, not re-derived)

Prior arm sim-locatedengage-a (evidence/2026-11-02/sim-locatedengage-a.md,
master) proved DIAG-GO: NO layer of the frozen policy stack ever aims at a
titan, lair, or monster tile. On seed 97307 the scholar visited only the
four tiles around home for 24 days while the herald orbited 1 tile away,
never sharing a tile; on contrast seed 97301 contact arrived only via the
RAID system pinning the herald to home, and attempts fired only when
detail-grid stance cells coincided at a morning snapshot (days 78/89),
both refused MUSTER-GATE because no one sounds the call. This arm is the
march + sound-the-call half of the tracker's next blank (deliberate titan
routing: some policy must gain sound-the-call + march behavior, plus the
detail/stance layer — the stance layer is NOT this arm; this arm does not
touch it).

## The prototype policy (`scripts/policies/titanroute.js`)

`withTitanRoute(base, id, desc)` wraps a base policy's `daily` (and
`setup`); `upkeep`, `fight`, and everything else delegate untouched, so
food/survival behavior is identical except for the march leg itself.

- KNOWLEDGE, perception-legitimate only. The policy NEVER reads
  `Game.worldMonsters()` or any monster roster for targeting (that would
  be a magic list feed, and anything list-fed gets reverted). It knows
  exactly two things, both heard in fiction:
  1. The lair tile, heard from the scouts' announcement line
     ("Scouts found its lair — tile x,y", `Game.say` at omen stage 1→2).
     The policy wraps `Game.say` in `setup` and records ONLY that
     anchored line (plus the CALL line for its own bookkeeping). No
     other say/sysSay content is used for decisions.
  2. Tile-sharing, seen with its own eyes: `Game.playerMonster()` (the
     engine's monster-on-your-tile read) tells the scholar it is
     standing on a monster's tile. That is seeing, not a roster.
  The march target is ALWAYS the heard lair tile (fixed, known) — never
  a live herald position, which the scholar cannot know.
- MARCH. After the base `daily` runs (food, chores, and the base's own
  go-home leg complete first), if a lair is known, the titan is not
  slain, and the scholar is fed and watered (kcal > 50% of cap,
  hydration > 45, HP > 50% — guardrail, not heroics), the policy walks
  tile-by-tile to the lair with the competent `walkTo` pattern
  (engine-offered steps only, no force) and stops there for the night.
  The next day's base `daily` runs from the lair and returns home at
  day's end, so the village alternates lair nights with home nights
  (pantry access every other day). Marching never runs while
  recovering, in combat, or on a day the scholar is already at the
  lair at `daily` time (already camped — the base leg then carries
  the scholar home, which is the honest return).
- SOUND THE CALL. On the first night the scholar ends ON the lair
  tile (arrived, not merely passing), if no muster exists yet for the
  herald, the policy calls `Game.soundTitanCall('herald')` once per
  run. It does NOT commit Haven's own blades (`titanCommitOwn` stays
  an explicit player verb — this prototype sounds the call only) and
  does NOT re-sound on later nights (one call; refusals are
  remembered by the engine, re-sounding would farm trust loss).
  Rationale for "on arrival" rather than "on tile-share": the call
  gates on presence (`titanMonsterPresent`), not on sharing, and the
  lair arrival is the first deliberate-contact moment the village
  creates; sharing, when it comes, then meets an existing muster
  instead of the MUSTER-GATE refusal the prior arm documented.
- SAFETY. If the lair is never heard, the policy is byte-identical
  to base (no march, no call). If `soundTitanCall`/`playerMonster`
  are missing, it degrades to march-only and records the fact in
  `ctx`. No RNG is consumed by the policy (no `Math.random` calls),
  so arm/baseline trajectories differ ONLY through the march/call
  actions themselves and their game consequences.

## Baseline choice (pre-registered)

Baseline = the prior arm's frozen stack (tribfloor leadfeast +
windefer + seatdrive + fullseat-diag, env flags FEASTSCALE_R13=1
TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1),
because that stack reproduces the diagnosed failure exactly (97307:
24 days, 0 shares, 0 attempts; 97301: raid-pin shares, attempts days
78/89 refused MUSTER-GATE). Arm = `withTitanRoute(baseline)`. The
comparison is clean (identical seeds, identical stack except the
march/call leg); plain-`competent` equivalence is NOT claimed.
Reproduction check (not band evidence): the baseline runs of 97307
and 97301 must reproduce the prior milestones (97307 lair 7,4 /
wave4 116 / stage2 129; 97301 lair 8,4 / attempts 78/89) within the
instrument's tolerance, or the pilot is void and the divergence is
reported before any GO judgement.

## Pre-registration (judged; a miss is NO-GO, never re-scored)

- PRIMARY METRIC: tile-share days — a day on which any instrument
  sample (upkeep-pre, daily-pre, daily-post) finds scholar tile ==
  herald tile (instrument reads `Game.worldMonsters()`; the DRIVER
  may read the roster, the POLICY may not — instrument/policy
  separation is the whole perception-law point).
- GO (1) ROUTING: arm reaches tile-share on ≥6/8 pilot seeds AND
  baseline reaches tile-share on 0 of the other pilot seeds, with
  ONE pre-disclosed exception: 97301's baseline share via the
  raid-pin mechanism is EXPECTED from prior evidence (days 74–81);
  if it reproduces, GO (1) is judged as arm ≥6/8 with baseline 0
  on the remaining 7. If ANY other seed's baseline shares (any
  mechanism), GO (1) fails and the mechanism is reported.
- GO (2) CALL/CONTACT: ≥1 sounded call (CALL GOES OUT line in the
  arm transcript) OR ≥1 herald combat attempt (herald instrument)
  across the arm pilot runs.
- GUARDRAIL (3) SURVIVAL: pilot median end-gameDay (death day, or
  the 180 cap if survived) for the arm within 20 days of the
  identical-seed baseline median. Routing must not suicide the
  village.
- HORIZON: death-aware, never fixed 200d. Observation cap 180 days
  (same as the prior arm; the located window on the case seeds is
  days ~50–152). Dead villages stop at death; the cap is an
  observation cap, not a horizon. Rationale: the question is
  located-window contact, and 180 covers it with margin on both
  case seeds.
- SEEDS: 8 pilot seeds = disclosed case 97307 + contrast 97301
  (never band evidence on their own) + 6 FRESH pilot seeds chosen
  by a pre-registered screening rule (below), run on IDENTICAL
  seeds baseline-vs-arm.
- SCREENING RULE (baseline-only, before judged runs): candidate
  seeds in numeric order from 97310 upward; run baseline, DAYS=180;
  a seed qualifies iff the baseline run HEARS the lair line
  (lairTile non-null in the instrument record). Take the first 6
  qualifiers. Screening uses baseline runs only and never looks
  at arm outcomes. Seeds that never locate a titan are not pilot
  seeds (the pilot question is located-titan routing, not titan
  discovery).
- PANEL: before/after comparisons run through
  `scripts/balance-panel.js` per docs/MEASUREMENT.md §15 where the
  panel can express the comparison; the panel is the instrument,
  this prereg's thresholds are the judge. The panel's policy
  registry does not include this prototype policy, so the panel
  compare (if attachable) covers the standard wall metrics
  (national/table/wins) on the pilot seeds, and the routing verdict
  itself rests on the instrumented driver records attached to the
  evidence file. Any panel limitation is reported honestly in the
  evidence file, not papered over.
- CONFIRM: if PILOT GO and time remains, a 12–16 seed confirm on
  identical seeds (same screening rule extended); otherwise the
  report states CONFIRM OWED with the exact seeds and command.
- DRIVER: `scripts/titanroute-driver-20261102.js` (one process per
  seed-arm; never two harnesses in one process). Per-seed JSON
  under `evidence/2026-11-02/perseed-titanroute-a/`.
- PROOF TESTS: `scripts/test-titanroute-prereg.js` (this prereg's
  claims as runnable checks: policy unit behavior on a synthetic
  Game stub — march targets the heard lair only, never a roster
  position; call sounds at most once; no-march without a heard
  lair; guardrails block a starving march) + the driver itself as
  the measurement proof.

## Metric review (pre-run doubts, for the NEXT run, not this one)

- The 180 cap truncates post-152 survival differences; the
  guardrail median is therefore a capped median and a large
  survival cost past day 180 would be invisible. A confirm run
  should consider a longer cap if the pilot guardrail is tight.
- Tile-share at a sample is necessary but not sufficient for a
  fight (detail-grid coincidence + stance escalation are a second
  layer this arm does not touch). GO (1) therefore proves routing,
  not combat — a GO here must not be reported as "titans now
  fought".
- The lair-heard gate means seeds where the lair line never fires
  (or fires after the run's window) show no march by design; the
  screening rule handles this for the pilot but the confirm must
  report the locate rate, not just the share rate.
