# sim-fightcap-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-fightcap-a · **Loop A run:** fleshout-20261118T1415Z
**Type:** DIAG — can launched parties WIN wave-4 fights? (finding #2538,
the arrival price.) **Frozen:** 2026-11-18 ~14:40 UTC, before any new sim.
The 1015Z re-analysis below already ran — it decomposes EXISTING corpora,
it is not a judged sim; the fresh pilot it motivates is judged here.
**Branch:** `sim-fightcap-a` (worktree
`~/workspace/worktrees/sim-fightcap-a`). **Substrate:** the sense fix HELD
on branch `sim-launchparty-sense-a` (tip d01eaf0a5), merged into this
branch as its own commit (d03754334); this run's own work goes in
separate commits AFTER that merge and touches ONLY scripts/, evidence/,
and prereg files — NO src/js changes of its own. At closeout the
coordinator lands only the diag commits, never the substrate merge.
**Builds on:** `evidence/2026-11-18/sim-launchparty-sense-a.md` and
`evidence/2026-11-18/sim-launchparty-rejudge-a.md` (finding #2538:
once the sense fix makes the launch party the meeting party, the gate
stops holding them back and launched parties fight wave-4 monsters —
and die; gate avoid 71%→53%, all avoids `outmatched`, discriminator
party size not gear; 3 arm villages lost; damage share per contact
meeting falls 0.203→0.150 because the arm fights more meetings
including ones it loses).

## The 1015Z re-analysis (existing corpora, not a judged sim)

Analyzer `scripts/analyze-fightcap-a.js` (selftest 20/20) run on the
1015Z pilot-band corpora (seeds 104401–104408, sense branch):
`evidence/2026-11-18/fightcap-a-1015z-analysis.json`.

- **Trio+ engaged population** (full launched party size ≥ 3, launch
  party present, rounds > 0): arm **n=2, 0 wins** (both vFlee); ctl
  n=1, 0 wins. The trio+ pool is nearly empty on 8 seeds — most
  launched meetings are PAIR launches (arm funnel: 30 of 33 launched
  meetings have |planParty| = 1; the gate's planParty usually reflects
  a later pair re-launch, since plan.party is overwritten on every
  re-launch).
- **Pair-inclusive engaged population** (|planParty| ≥ 1, present,
  engaged): arm **n=12, wins 2 (both mFlee, 0 kills) — win share
  0.167, kill share 0.000**; ctl n=5, wins 0, kill share 0.000. No
  launched expedition party killed a wave-4 monster on either leg, in
  any population cut. The only two "wins" are 1-round Stare Down
  scare-offs (0 damage dealt, 5–9 taken) — not fight wins.
- **Damage math (arm, pair-inclusive):** mean damage share 0.163 of
  monster HP over ~5.2 rounds (~3%/round; ~30 rounds to kill a ~1100
  HP monster). Canon wave-4 is a 4–6 round fight for a godhood build
  at ~220 dmg/round; these parties deal ~25–30 dmg/round party-wide,
  ~1/8 of that. The fighter deals ~60% of parsed strike damage;
  allies ~40% combined; in one 12-round meeting the allies dealt 0
  parsed strikes (flagged, not resolved — mDealt 220 vs parsed 47,
  so multipliers/ability damage the parser misses may account for
  some of it).
- **Gate:** all 10 arm losses have gate result `null` (9) or `seek`
  (1) — ZERO losses where the gate said `avoid`. Every losing party
  passed the gate's bars (allArmed + allArmored true on all 12; party
  size 3). The gate never held back a losing party; it let them in
  and they fled or died. Gate calibration alone cannot be the fix:
  a party the gate calls ready still loses.
- **Survivability is not the binding link:** fleeing parties took
  only ~66 damage over ~5.4 rounds and fled while alive; the one
  death (maya_singh vs The Eulogy, 11 rounds, 2085 taken, 54% of
  monster HP dealt) is the exception where the fighter stayed. The
  parties flee because they are losing the damage race, not because
  they are dying.
- **Abilities do not discriminate:** losing meetings average 1.8
  abilities/member; a meeting with 3.67 abilities/member (purify,
  rage, war_cry, pack_hunt among them) still fled after 5 rounds at
  21% damage. The abilities present are mostly non-combat
  (green_whisper, beast_calm, lucky_rock) or low-impact in the fight.
- **Monster mix:** losses across audit, algorithm, strike, eulogy,
  reunion, congregation — broad, not one monster. Wins: influencer,
  eater (both 1-round scare-offs).
- **Transcripts (sense-testing):** 2 lost (104404 d45 vDie Eulogy;
  104407 d52 vFlee Reunion) + 2 won (104404 d38/d59 mFlee) read in
  full. They read like people — Maya rages, shouts, Kevin and
  Claudete charge in, field medicine mid-fight; Jose nocks an arrow,
  misses one, gets hit for 26, shouts, Natalia and Jack charge in.
  The math is visible in the transcript: Jose's party deals 13–26
  per strike against a 1307-HP monster and flees at 4 rounds with it
  at 90% HP. No robotic or nonsensical lines; the vDie log is
  truncated at round 5 of 11 (recorder caps log lines — instrument
  limit, noted).

**Prior (frozen here, to be replicated, not re-judged):** on the
1015Z band, launched parties essentially never kill wave-4 monsters
(0/17 engaged launched meetings across both legs, both populations)
and mostly flee after ~5 rounds having dealt ~10–16% of monster HP.
The binding link, on this evidence, is FIGHT CAPABILITY (damage
output per round vs monster HP), not gate calibration and not party
size. The fresh pilot below tests whether that replicates on new
seeds.

## Primary metric (BINDING, §14)

**Win share of engaged wave-4 meetings where the launched party
(size ≥ 3, planParty members present) fights** — the trio+
population: v4encounters row with origin `expedition`, wave ≥ 4,
joined to its v4gates row (same day+vid+mid, first match) with a
non-empty planParty, restricted to |planParty| ≥ 2 (full launched
party size ≥ 3), launched party PRESENT (corrected arrival,
piecewise: |planParty| ≤ 2 means planParty ⊆ allyVids; |planParty|
= 3 means allyVids ⊆ planParty with |allyVids| = 2 — the engine's
2-ally cap), and ENGAGED (rounds > 0; evades join nobody).

**Win** = outcome `vKill` (party kills the monster) or `mFlee`
(monster disengages, party holds the field). **Loss** = `vDie`
(fighter dies) or `vFlee` (fighter flees). Kill-only share
(vKill / n) is reported beside the win share, never substituted.

**GO threshold:** arm win share ≥ 0.50 **with n ≥ 10 meetings**
(pool floor). **Cost bars (binding guardrails, scalemetric):**
community loss (endReason village-lost / village-dead / pop-zero)
arm share ≤ ctl share + 0.125; starvation arm ≤ ctl + 2 (totals AND
villager-only); median survival arm ≥ 0.8 × ctl median.
Instrument errors 0 on all per-seed files.

**Verdict ladder (frozen):**
- Pool floor met (arm n ≥ 10) + win share ≥ 0.50 + all cost bars
  pass → **GO** (launched parties can win; the arrival price is a
  gate-calibration question, not capability).
- Pool floor met + win share < 0.50 or any cost bar fails → **NO-GO**
  (capability confirmed as the binding link; next arm is fight
  capability — damage output, ally contribution, or ability use in
  the fight, NOT another sense/gate tweak).
- Pool floor missed (arm n < 10) → **DIAG-GO** iff the
  pair-inclusive secondary population (see below) reaches n ≥ 10
  AND its win share is < 0.50 AND its kill share ≤ 0.10 — i.e. the
  decomposition answers the question decisively on the powered
  population despite the thin trio+ pool. Otherwise **NO-GO**
  (thin pool, inconclusive — the decomposition is reported but the
  question stays open).

## Secondary metrics (supporting, not binding — except as the DIAG-GO path above)

- **Pair-inclusive population:** same filters with the size floor
  lowered to |planParty| ≥ 1. Win share, kill share, loss split,
  gate × outcome crosstab, per-outcome damage/rounds/gear/abilities.
  This is where the statistical power lives (1015Z: arm n=12 vs
  trio+ n=2).
- **Per-outcome decomposition:** mean rounds, mean damage share
  (mDealt/mHpStart), mean damage taken, mean party size, mean min
  armorP, mean abilities/member, fighter damage share, per-fighter
  strike totals parsed from encounter logs — by outcome, per leg.
- **Gate question:** among LOSSES, how many had gate `avoid`
  (gate held them back but they fought anyway) vs `null`/`seek`
  (gate let them in and they lost). 1015Z: 0 avoid / 10 null+seek.
- **Monster mix by outcome;** wall numbers (reported every run):
  national / table / wins, wave-4 and wave-5 unlocks, median
  survival, per leg.
- **Table:** not instrumented by this driver — reported as null,
  never faked.

## What this pilot does NOT judge

- No game-code lever is landed in this diag run. If the
  decomposition names a concrete lever (fight capability vs gate
  calibration), the evidence says which and what the next arm
  should test; the next arm builds it.
- The 4th seat (engine-blocked: `fieldFights.js:1230` slices
  allyVids to 2) — out of scope; the trio+ population is the
  engine's full expression.
- The rounds=0 "vKill" rows with mHpStart null and mDealt ~12–27
  (monster death attributed without a fought round — likely
  off-screen/environmental kills) are excluded by the engaged
  filter (rounds > 0) and are not counted as fight wins anywhere.
- The 12-round meeting where allies dealt 0 parsed strikes
  (104404 d87) is flagged as an open instrument question (parser
  misses multiplier/ability damage); it does not change the
  verdict — the damage-share and outcome numbers stand on mDealt.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the 1015Z band, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 104501, 104502, 104503, 104504,
  104505, 104506, 104507, 104508.** Freshness check (skill
  local_seed_band_freshness): `grep -rln "10450[1-8]"` over
  `evidence/` (`--include="*.md"`) — 0 hits; over goal
  `hidden_files/` (`--include="*.md"`) — 0 hits. Neighbouring used
  bands on 2026-11-18 (104401–104408, 104411–104418, 104421, 104424,
  104428) are avoided. No forbidden/contaminated band file exists.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `LAUNCHPARTY=1` arm only. **Ctl = same code, LAUNCHPARTY unset;
  arm = same code, LAUNCHPARTY=1.** The legs differ ONLY by env —
  no code revert between legs. The driver asserts the flag matches
  the MODE label and each corpus file records `launchpartyOn` +
  the party-wiring sha.
- **Instrument:** `scripts/launchparty-sense-driver-a.js` (unchanged
  from the sense run — the recorder already captures everything
  this decomposition needs); analyzer
  `scripts/analyze-fightcap-a.js` (`--selftest` 20/20, incl. the
  pair-inclusive population and all judge shapes); per-seed JSONs
  under `evidence/2026-11-18/perseed-fightcap-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-fightcap-panels-a.js` (adapted copy
  of the launchparty panel builder, same schema) + `node
  scripts/balance-panel.js compare`; the compare `.md` is attached
  to the evidence file. The panel is the instrument, the frozen bars
  above are the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched, so
the fixture is the encounter itself, staged by the competent policy:
a geared scholar fighting with a party, never a fresh un-geared solo
scholar. The pilot's per-seed corpora carry the encounter averages
(party size, gear, abilities) beside the verdict in the evidence
file, so a later reader can see the fixture gap without re-running
the panel. The nearest measured point for the encounter gear is the
allycap band (geared parties of three winning 5/8 arena fights at
the mirror cap; wild wave-4 parties geared by the launch gear-up);
the pilot does not re-derive gear — the competent policy plays it,
and the corpora record what it played.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   the 1015Z band yields 33 arm / 31 ctl launched meetings per 8
   seeds; the engaged pair-inclusive pool is 12 arm / 5 ctl. The
   trio+ pool is thin (2 arm / 1 ctl) — the pool floor + DIAG-GO
   path above are sized to that known thinness; a trio+ pool below
   the floor is a DIAG outcome, not a surprise.
2. **Pool sizing:** see (1). The pair-inclusive floor (n ≥ 10) is
   the powered population; the trio+ floor (n ≥ 10) is the judged
   one.
3. **Mechanism pre-check (frozen, not a sim):** the analyzer's join
   (encounter → gate row planParty) reproduces the sense analyzer's
   launched-meeting counts exactly on the 1015Z corpora (31 ctl /
   33 arm), and the analyzer `--selftest` covers the join, the
   piecewise presence rule, the pair/trio/quad shapes, evade/unjoined
   exclusions, and all judge shapes incl. the DIAG-GO thin-pool path
   and the exactly-at-bar community-loss pass. (The fought-corrected
   10/13 arm figure is the re-judge evidence's, cited in §1, not
   recomputed by this analyzer.)

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read for
this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500, pierce 0.2–0.5 — "a 4–6 round fight for a godhood build
(~220 dmg/round)". The decomposition's damage yardstick (~220
dmg/round vs the measured ~25–30) comes from that canon band, not
from invention. `docs/CONTESTS.md` was read and bears on no part of
this question (contests are the show system; these are field fights).
No canon doc covers the sim recorder or the villager launch party —
said here rather than inventing canon. The launch mechanics are
cited from code (`win-plan.js`, `villager-agency.js`,
`party-wiring.js`, `game.js`, `fieldFights.js`), not from canon.
