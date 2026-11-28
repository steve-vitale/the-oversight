# sim-callfirst-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-callfirst-a · **Loop A run:** fleshout-20261128T0015Z
**Axis:** scale-onramp (the blocking axis; standing directive applies).
**Type:** LEVER PROBE, policy-side only — no src/js changes. The lever
lives in `scripts/policies/callfirst-a.js` (env-flagged, default OFF)
and is applied by the driver wrapping `Game.villagerFightAllies`;
the game code is never edited.
**Frozen:** 2026-11-28 ~00:55 UTC, before any judged sim.
**Branch:** `sim-callfirst-a` (worktree
`~/workspace/worktrees/sim-callfirst-a`).
**Builds on:** `evidence/2026-11-27/sim-partydmg-a.md` (§§0, 2, 5, 8)
+ `evidence/2026-11-24/sim-leadworst-a.md` (Part B probe NO-GO).

## §0. The question, in plain words

The party swings about twice a round; the leader fights alone 2–3
rounds; the WEAKER ally arrives first by shout and the STRONGER
ally second (partydmg-a: ally1 20.1/strike vs ally2 35.4/strike;
damage share lead 52.4% / ally1 20.9% / ally2 26.7% / ally3 0;
0 kills in 22 fought expedition wave-4 fights at ~46 dpr vs a
~111 kill line). Leadworst-a showed the best-armed fighter often
arrives only via shout on rounds 3–4. Question: does calling the
STRONGEST available ally FIRST (reorder call-in/shout by weapon
strength descending) get more damage into the opening rounds and
produce wave-4 kills?

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/MONSTER-WAVES.md`
(wave 4: The Mirror Draft, standing ≥ 100; damage 35–95, HP
850–1500, pierce 0.2–0.5; a 4–6 round fight for a godhood build at
~220 dpr), `docs/BALANCING.md`. **No canon doc covers call-in
order, the shout ladder, or the wave-4 kill line** — the ~111/round
line is a leadworst-a measurement, not canon; the call-in order
rule below is code, not canon. Said here rather than inventing
canon. A weapon is a human weapon (CANON.md human-skills lane),
never an alien ability.

**The mechanism (frozen, read off code):**

- `Game.villagerFightAllies(vid)` (`src/js/party-wiring.js`):
  returns up to 2 ally vids (3 with ALLYSLOT3, off here) in order
  — launch party first (expedition-start order, SENSEEXPED=1),
  then outdoor crew / earshot villagers, trust-ordered. Trust
  floor 15 (launch companions bypass it). Ordered by trust,
  never by weapon — "a stranger doesn't sprint into the
  treeline for you; a friend does."
- `villager-agency.js:724` calls it and passes the list verbatim
  as `opts.allyVids` to `fieldFight`; `src/js/game.js:21456`
  (world-tick wild router) does the same. Call-in order IS list
  order.
- `fieldFights.js` shout ladder: ally1 (`allyVids.shift()`) joins
  on the first hopeless shout, ally2 on the second shout
  (FIGHTALLY2=1), ally3 on the third (ALLYSLOT3, off). Allies
  already at the door (`allyFromStart`) join round 1 in list
  order. A fighter who never gets the call never strikes.
- The folded weapon bonus is the engine's own:
  `wb = round((meleeBonus + rangedBonus)/2)`
  (`fieldFights.js:642-644`, replicated in the partydmg driver
  as `fighterKitOf`).

**The lever (frozen):** `scripts/policies/callfirst-a.js`
exports `orderByWeaponStrength(Game, vids)` — a STABLE sort of
the ally list by folded wb descending (ties keep the original
order; the fighter themself is never in the list). The driver
installs it as a wrap on `Game.villagerFightAllies` when
`CALLFIRST=1`: the original runs exactly once, only the
returned list order changes; no RNG is drawn, no game state is
written, no src/js file is touched. Env-gated, default OFF:
with the flag unset the wrap is never installed and the leg is
byte-identical to the control substrate. **Scope note:** the
wrap reorders EVERY `villagerFightAllies` return, including the
world-tick wild router read (same call-in question — intended)
and the `bond-initiation.js` read (same helper, order-only
effect — noted, not fenced; the cost bars guard against harm).
The reorder applies across the whole list: the strongest
available ally answers the first shout whoever they are, even
if a strong earshot bystander jumps ahead of a weaker launch
companion. That IS the lever as tasked ("strongest first").

**Frozen numbers carried in:** kill line ~111 dpr (leadworst-a);
partydmg band (seeds 112101–112108, same substrate): 22 fought
expedition wave-4 fights, 0 vKills (16 vFlee, 6 vDie), party
dpr mean 45.7 / median 48.4 / max 92.5, 1.83 strikes/round
combined, median fight 4 rounds, lead fights alone 2–3 rounds.
Leadworst Part B probe (best-armed lead swap): median dpr
42.8 → 53.8 (+26%), still 0 kills.

**Pre-registered expectation:** calling the strongest ally
first moves the strong ally's strikes 1–2 rounds earlier, so
median party dpr rises and the per-ally damage share flips
(ally1 > ally2), but the kill line (~111) is far above the
partydmg mean (45.7) and the gap is dominated by strike rate
(1.83/round), not by who swings first — so the kill bar (≥ 2
vKills) is expected to MISS while the dpr bar may partially
close. The falsifier: ≥ 2 armed vKills, or median dpr ≥ 1.25x
baseline with the share flipped.

## §2. Primary metric (BINDING, §14)

Two legs on IDENTICAL seeds: control (CALLFIRST unset) vs armed
(CALLFIRST=1). Population: ALL expedition-origin wave-4+
fieldFights with rounds > 0 on this band (the partydmg rich
row, unchanged). Baselines must replicate exactly
(determinism cross-check: one control seed re-run after the
pilot, hash-identical).

- **Pool floor:** fought expedition wave-4 fights ≥ 8 PER LEG.
  (Partydmg band: 22 — the floor is sized to that known density.)
- **Primary metric (all three must pass for GO):**
  1. armed wave-4 vKills ≥ 2 across the 8-seed band
     (baseline 0 expected);
  2. median party dpr (armed) ≥ 1.25x median party dpr
     (control);
  3. cost bar clean: starvation deaths (armed) ≤ control + 2
     total, AND median survival (armed) ≥ 0.8x control.
- **Instrument bars (binding):** instrument errors 0 on all
  per-seed files, both legs; the reorder check — in the armed
  leg, in every fought fight with 2+ allies at entry,
  `fighterKits[0].wb >= fighterKits[1].wb` (the wrap did what
  it claims); the control leg shows the partydmg order
  (ally1 weaker than ally2 on average) reproduced, not
  accidentally reordered.
- **Verdict:** GO when all three primary bars + instrument bars
  pass. NO-GO otherwise — classified per §14a (CONCEPT-DEAD /
  METRIC-BROKEN / SUBSTRATE-MISSING) in the evidence file. A
  miss is NO-GO, never re-scored against a friendlier metric
  mid-run. The dpr-only close (bar 2 passes, bar 1 misses) is
  still NO-GO with the mechanism named — it is not a partial GO.

**Staging sniff test (pilot gate):** the analyzer must show the
fought pool is real on this band (≥ 8 fought fights per leg)
and the reorder fired (armed-leg reorder rate > 0 with at
least one fight where the strongest ally entered first and
struck earlier than the control order would have let them)
before the verdict is read. If the armed leg never reorders
anything, the verdict is NO-GO kind SUBSTRATE-MISSING (the
lever never engaged), not a kill of the concept.

## §3. Secondary metrics (supporting, not binding)

- Rounds until first ally strike (per ally role; from
  `parseStrikes` first-strike round per fighter) — ctl vs arm.
- Per-ally damage share (lead / ally1 / ally2 / ally3) — ctl vs
  arm; the share flip is the lever's fingerprint.
- Entry-round per ally (first-strike round) and the strong
  ally's strikes in rounds 1–3 — ctl vs arm.
- Party dpr distribution (mean / median / max) per leg; fights
  reaching ≥ 111 dpr per leg.
- Reorder fire rate: `villagerFightAllies` calls where the
  wrap changed the order / total calls (armed leg).
- Wall numbers per leg: national / table / wins, wave-4 and
  wave-5 unlocks, median survival, death-cause shares. Table
  not instrumented by this driver — reported as null, never
  faked.
- Sense-testing: 2 full transcripts (the best-dpr armed fight
  and a typical armed fight), read in full — does the call-in
  order read like people making choices (the strongest friend
  runs in first), not just counts? SENSE-TESTING LAW: judge
  meaning, not counts.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as partydmg / leadworst
  bands, for comparability). Dead villages stop simulating
  (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 112201, 112202, 112203,
  112204, 112205, 112206, 112207, 112208.** Freshness check
  (skill local_seed_band_freshness, run 2026-11-28 before this
  freeze): word-boundary ripgrep over all `evidence/**/*.md`
  names 112201–112208 in NO file except the partydmg prereg +
  evidence, where they appear ONLY as the named-but-never-used
  fallback band (partydmg §6). No per-seed directory or JSON
  file carries those numbers; no dedicated forbidden /
  contaminated band list exists in the goal hidden_files
  (checked). Neighbouring used bands avoided: 112101–112108
  (partydmg), 111801–111808 (speardmg), 110721–110728
  (leadworst).
- **Policies:** competent verbatim. **Substrate (BOTH legs):**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `SPEARGATE=1`, `BOWOPEN=1` — the partydmg
  substrate, so numbers compare. The ONLY difference between
  legs is `CALLFIRST=1` on the armed leg.
- **Instrument:** `scripts/callfirst-driver-a.js` (clone of
  `scripts/partydmg-driver-a.js` — RUN=callfirst-a, OUTDIR
  `evidence/2026-11-27/perseed-callfirst-a-ctl` /
  `-arm`; the recorders, the rich rows, and the substrate are
  identical; additions: the CALLFIRST wrap install +
  `callfirstOn` / `callfirstSha` / reorder counters on the
  per-seed file; `rowSeq` reset at the start of each seed's
  `oneRun` — the partydmg §6 determinism fix, so reruns are
  byte-identical without stripping). Analyzer
  `scripts/analyze-callfirst-a.js` (new; requires
  `parseStrikes` from `scripts/analyze-speardmg-a.js` — one
  definition of the parser; the decomposition completeness /
  coverage / reconciliation bars from partydmg are re-checked
  per leg as instrument bars, not as the verdict). Per-seed
  JSONs under `evidence/2026-11-27/perseed-callfirst-a-ctl/`
  and `perseed-callfirst-a-arm/`.
- **§15 panel:** built from the per-seed JSONs by
  `scripts/build-callfirst-a-panels.js` (clone of
  `build-leadworst-a-panels.js`, pseudo-policy
  'callfirst-a'); the compare `.md` is attached to the
  evidence file. The panel is the instrument, NOT the judge
  (the frozen bars in §2 are).
- **PILOT ONLY.** Confirm 12–16 seeds ONLY on a pilot GO; a
  NO-GO kills the lever (per §14a classification) with no
  confirm spend.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on what a departing party carries into a
fight, so the fixture is the fight itself, staged by the
competent policy: a geared scholar fighting with a party,
never a fresh un-geared solo scholar. The proof test
(`scripts/test-callfirst-a.js`, GREEN before the pilot) runs
live on a loaded village: the policy orders a 3-ally list
strongest-first (stable on ties; lead never in the list; empty
list stays empty); the wrap reorders a live
`villagerFightAllies` return and fires its counter only when
the order actually changes; a staged wave-4 expedition fight
records a rich row with the reordered entry kits, and the
analyzer reads the reorder + first-strike rounds off the
fixture fight. The pilot's per-seed corpora carry the
encounter averages beside the verdict in the evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** wave-4 expedition fights occur on the substrate
   — partydmg band: 38 expedition-origin wave-4+ rows per 8
   seeds, 22 fought. The pool floor (≥ 8 fought per leg) is
   sized to that known density.
2. **Pool sizing:** see (1). The kill bar (≥ 2 vKills) is set
   against the known pool (22 fought fights on the sibling
   band): 2 kills is ~9% of the pool — reachable if the lever
   moves the needle, not a foregone miss. The dpr bar (≥ 1.25x
   median) is set against the leadworst probe's +26% median
   lift from a lead-only change — a whole-party reorder should
   clear 1.25x only if early strong strikes matter.
3. **Verb existence:** the engine HAS the verb — the shout
   ladder already calls allies in list order; the lever only
   reorders the list. No new engine behavior is staged.
4. **Horizon fit:** wave-4 fights occur days 41–148 on the
   partydmg band; the 150d horizon contains the phenomenon.

## §7. Canon

`docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md` (wave 4:
The Mirror Draft, standing ≥ 100; damage 35–95, HP 850–1500,
pierce 0.2–0.5; a 4–6 round fight for a godhood build at
~220 dpr; wave 5: standing ≥ 200 AND wave-4 faced), and
`docs/BALANCING.md` read before the run. **No canon doc covers
call-in order, the shout ladder, or the wave-4 kill line** —
the ~111/round line is a leadworst-a measurement, not canon;
the reorder rule in §1 is this arm's lever definition, frozen
here, not a canon claim. A weapon is a human weapon (CANON.md
human-skills lane), never an alien ability.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- Write-flap: probe `git update-ref refs/heads/probe HEAD` before
  every material write; if it fails, stop writing and wait for
  the clear.
- Safe-commit clobber (partydmg-a §6, leadworst-a): after every
  safe-commit, run `git status --short` to completion and repair
  the main index from HEAD blobs if it shows staged-deleted
  files; never call the tree clean on a timed-out status.
