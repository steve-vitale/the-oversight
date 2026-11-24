# sim-ragecarry-b — PREREG (frozen BEFORE any new sim)

**Arm:** sim-ragecarry-b · **Loop B run:** fleshout-loop-b-20261124T1430Z
**Type:** LEVER — the damage-multiplier carrier in launched parties
(finding #2544 / fightcap-a §10 candidate (a), as prescribed in the
finding: "a damage-multiplier carrier in launched parties (Rage or
equivalent), measure kill share; only then a gate arm demanding a
damage proxy"). **Frozen:** 2026-11-24 ~15:30 UTC, before any new sim.
**Branch:** `sim-ragecarry-b` (worktree
`~/workspace/worktrees/sim-ragecarry-b`). **Base master:** `003f86c9f`
(2026-11-24 14:18 UTC, sim-holdrepeat-fix-a tip).
**Builds on:** `evidence/2026-11-18/sim-fightcap-a.md` (§§2, 5, 10 —
the diagnosis + frozen population definitions + cost bars),
`evidence/2026-11-19/sim-bowopen-a.md` (frozen GO bars reused here +
the staging-failure lesson), `evidence/2026-11-14/sim-rageprecheck-b.md`
(Rage is live: `rage.unleash_rage` in `src/js/abilityActions.js`,
`rageActive.dmgMult`).

## The question

Launched parties almost never win wave-4 fights: 2 kills in 34
pair-inclusive engaged meetings across both fightcap-a bands (kill
share 0.059); the damage arm's band 0/13. Typical parties deal
~40–60 damage/round and need ~39 rounds to kill a ~1200-HP monster.
The ONLY two kills came from one party shape: Rage x2 on the fighter
+ a bow opening (~50–60 damage) + all three members hitting every
round, ~111 damage/round, wins in 9–12 rounds. This arm tests the
Rage/carrier half of that shape: can a damage-multiplier carrier be
put into launched parties and made to actually fire in the wave-4
meeting — and does it turn launched parties into winners?

## What was read first (do not re-measure what they answered)

- `sim-fieldcarrier-a` (Loop A, finding #2552): the carrier ported
  to the field engine (FIELDCAPDMG — a launched holder without Rage
  counts as holding Rage vs wave-4+) fires 6x, 0 kills, judged pair
  pool n=2. NO-GO THIN-POOL.
- `sim-fieldcarrier-confirm-a`: carrier + sense substrate, 6 fires,
  FIRST carrier kill (Liam d141, 906 dmg, 11 rounds), kill share
  1/7 = 0.143 < 0.25, community-loss cost bar failed. NO-GO
  THIN-POOL (pool 7 < 10).
- `sim-carriersetup-b` (Loop B, finding #2568): FREE (Rage as a free
  action striking the same round) — mechanism works, 5 fires, 0
  paired setup-deaths, damage/round 37.5 vs ctl 24.9 — but kill share
  0/9 vs ctl 0/8. FLOOR (HP≥50% + armor P≥10) — gates fires but the
  paired-death bar FAILS (Pavel d77 fired at 97% HP / P11 and died
  where his ctl twin fled). Both NO-GO THIN-POOL (ctl pair n=8).
  Next arm named there: a DAMAGE question (what lifts a launched
  party from ~38/round toward ~111/round), not a setup question.
- `sim-ragepreempt-b` (finding #2584, DIAG-GO): a turn verb pre-empts
  the free-action Rage round in 4/10 observable carrier fires
  (harmful rate 0.30). Named next step: order the free strike ahead
  of the verbs.
- `sim-freestrike-b` (finding #2584's next step): the ordering works
  (free strike first on 19/19 carrier fires, verbs preserved, 14/19
  double strikes) BUT the phenomenon is absent on the master
  substrate (0 harmful pre-emptions in 15 before-leg fires) and
  carrier-fight kill share is 0/15 before, 0/19 after, damage/round
  45.1 → 53.1. NO-GO phenomenon-absent.
- `sim-laterage-b` (finding #2614, NO-GO METRIC-BROKEN) +
  `sim-rageholder-survey-b` (GO — designated holder-rich band
  106151–106158: 33 holder-fights / 19 contact / 12 fires) +
  `sim-laterage-rerun-b` (DIAG-GO): Rage never fires late (0/12 late),
  delay is Brawler's Instinct (mean 1.5 rounds); holders DO kill
  (3x, all Luis on 106158, only 1 fought kill vs a 300-HP herald).
  The damage wall still stands.
- `sim-dmgshape-b` (NO-GO METRIC-BROKEN): pool thin (5 launches);
  the binding constraint on that band was one step upstream of
  damage — the launch decision.

## Why this arm is a NEW lever test, not a re-measurement

No prior arm measured the FULL STACK on the SENSE SUBSTRATE on the
FIGHTCAP POPULATION:

| Arm | Stack | Substrate | Judged population | Result |
|---|---|---|---|---|
| fieldcarrier-a | carrier only | none (no sense) | pair-inclusive | 0 kills, n=2 |
| fieldcarrier-confirm-a | carrier only | sense (LAUNCHPARTY) | pair-inclusive | 1/7 kills |
| carriersetup-b | carrier+free / carrier+floor | sense | pair-inclusive | 0/9, 0/7 |
| freestrike-b | carrier+free+order | master (no sense) | carrier-fights | 0/19 kills |
| **ragecarry-b (this arm)** | **carrier+free+order** | **sense (SENSEEXPED, landed)** | **pair-inclusive** | **—** |

The freestrike arm's 0/19 was measured on fights the field engine
picked up (visitors, applicants, wild joiners — its own metric
review says so), NOT on launched parties. The carrier arms'
pair-inclusive measurements were all pool-thin (n ≤ 9) and none had
the free action + strike ordering. This arm is the first powered
measurement of the best carrier as a whole, on the population the
question is about. If it NO-GOs, the carrier family is exhausted as
a kill-share lever on this evidence and the next arm is the damage
question carriersetup-b named (what lifts ~38/round toward ~111),
not another carrier variant.

## The mechanism (frozen, not a sim)

**What is built — the stacked carrier, three env-gated pieces, all
off = old behavior exactly:**

1. **FIELDCAPDMG=1** (port of held commit `e3a77c411`,
   sim-fieldcarrier-a): in `godpath.js` `fieldBegin`, a launched
   party's holder counts as holding Rage against a wave-4+ monster
   even without the ability — `held.rage = true` when the env is on,
   wave ≥ 4, the villager does NOT hold `rage`, the villager has a
   winPlan with a non-empty party, AND is currently on an expedition
   (`agencyState().exped[vid]`). Fight-scoped: no ability granted,
   no slot, no persistence. Fires through the EXISTING `fieldAct`
   Rage branch (x2, next 3 strikes, honest 60-kcal pay via
   `fieldPay`, monster-HP > 40% gate, once per fight) and is
   detected engine-side (`carrierRage` / `carrierRageFired` on the
   fight record, finding #2553 — never a snapshot). `fieldFights.js`
   passes the monster's wave into `fieldBegin` at the lead and ally
   call sites and copies the flags onto the fight record.
2. **RAGEFREE=1** (port of held commit `6198f7ea3`,
   sim-rage-setup-a): Rage as a free action — the `fieldAct` Rage
   branch returns `consumed=false` so the caller runs its normal
   strike this round, and `fieldStrike` consumes the first of the 3
   doubled strikes on that round. Multiplier (x2, 3 strikes),
   60-kcal pay, monster-HP gate, once-per-fight use unchanged.
   Applies to carrier fires and real-Rage holders alike — Rage is
   Rage.
3. **FREESTRIKE=1** (port of the src hunks of held commit
   `f490ff656`, sim-freestrike-b): on the Rage round the free strike
   executes BEFORE the verb chain is consulted — the villager strike
   is extracted into a closure called first on a Rage round when the
   free action fired, then the verb chain is still consulted; if the
   free strike drops the lead, no verb runs on a fallen monster.
   Verbs (field medicine, Walk In, aim) still fire afterwards.

**Policy-side first — answered:** policy cannot express this lever.
The launched party is formed by `win-plan.js` / `villager-agency.js`
and fought by the field engine (`fieldFights.js` +
`godpath.js` `fieldBegin`/`fieldAct`); `scripts/policies/competent.js`
plays the scholar only, and no policy hook touches launch
composition or NPC field-fight ability use. Game code is the only
expression. Legs differ ONLY by the three carrier flags (all three
on vs all three off) — no code revert between legs.

**Substrate (both legs, landed code):**
`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`
— the rageholder-survey substrate exactly. The landed SENSEEXPED
sense (launch party first from the CURRENT expedition companions)
supersedes the held LAUNCHPARTY sense fix (sim-launchparty-sense-a,
finding #2515, NO-GO, HELD); no held substrate port is needed or
made. The driver asserts the flags match the MODE label and each
corpus file records `carrierOn` (all three flags) + `senseexpedOn` +
`fieldcapdmgPresent` + the godpath/fieldFights shas.

**Telemetry (engine-side, never snapshots):** the driver records on
every wave-4+ encounter row `carrierRageHeld` / `carrierRageFired`
(from the fight record) and `rageFired` (real Rage). Carrier-fire
detection is therefore direct: a carrier fire means the injected
Rage actually went off in the meeting. Staged carriers are counted
per seed (held counts + fired counts) in the evidence file BEFORE
any kill-share judgement — the bowopen lesson: verify the carrier
actually stages before judging.

## Primary metric (BINDING, §14)

**Kill share on pair-inclusive engaged launched wave-4 meetings**
(the same population fightcap-a judged): v4encounters row with
origin `expedition`, wave ≥ 4, joined to its v4gates row (same
day+vid+mid, first match) with a non-empty planParty, restricted to
|planParty| ≥ 1 (full launched party size ≥ 2), launched party
PRESENT (corrected arrival, piecewise as fightcap-a), and ENGAGED
(rounds > 0; evades join nobody).

**Kill** = outcome `vKill` (party kills the monster). Win share
(vKill + mFlee) is reported beside it, never substituted.

**GO threshold:** arm kill share ≥ 0.25 **AND** arm
pair-inclusive mean damage/round (mDealt/rounds) ≥ 70.
The bars are the frozen bowopen bars, reused per the brief: the
typical launched party deals ~40–60/round (fightcap fresh band
vFlee 61.0, vDie 39.7; bowopen 42.4; freestrike carrier-fights
45.1 → 53.1); the winning shape dealt ~111. 70 sits ~40% above
the typical rate and ~63% of the winning rate.
**Cost bars (binding guardrails, fightcap):** community loss
(endReason village-lost / village-dead / pop-zero) arm share ≤ ctl
share + 0.125; starvation arm ≤ ctl + 2 (totals AND villager-only);
median survival arm ≥ 0.8 × ctl median. Instrument errors 0 on all
per-seed files.

**Mechanism check (bowopen lesson — explains the verdict, never
re-scores it):** a Rage-family fire (carrier `carrierRageFired`
OR real-Rage `rageFired`) on ≥ 0.50 of arm pair-inclusive engaged
meetings. Staged carriers per seed (held + fired counts) are
reported in the evidence file. If the check fails, the pilot
measures a null (the carrier never staged/fired) and the verdict
is NO-GO with the mechanism diagnosis — not a capability result.

**Verdict ladder (frozen):**
- Pool floor met (ctl pair-inclusive n ≥ 10) + kill share ≥ 0.25 +
  damage/round ≥ 70 + all cost bars pass + mechanism check passes
  → **GO** (the stacked carrier turns launched parties into
  winners at the pilot bar).
- Pool floor met + kill share < 0.25 or damage/round < 70 or any
  cost bar fails → **NO-GO** (the carrier, even stacked, does not
  close the gap; the mechanism section names how far it got).
- Pool floor missed (ctl n < 10) → **NO-GO THIN-POOL** (the
  kill-share question stays open; the pool is judged on the
  control leg's delivery, per the carriersetup metric review —
  a floor derived from control-leg behavior does not bind an arm
  that moves its own villages, and this band's control can
  under-deliver too; the arm pool is reported beside it).
- Mechanism check fails → **NO-GO** (staging null — the carrier
  never staged/fired; do NOT score it as a capability result).

## Secondary metrics (supporting, not binding)

- **Mechanism decomposition:** carrier-held / carrier-fired /
  real-Rage-fired counts per seed and per meeting; fire rate by
  outcome; non-fire attribution (tier-gate / hunger-gate /
  monster-HP gate / higher-priority turn action) where the
  recorder captures it.
- **Pair-inclusive decomposition** (fightcap-a §5 shape):
  per-outcome rounds, damage share (mDealt/mHpStart where present),
  damage taken, party size, min armorP, abilities/member, fighter
  damage share — per leg.
- **Trio+ population** (size ≥ 3, present, engaged): reported
  beside the primary, never substituted.
- **Carrier-fight cut** (freestrike comparison): kill share and
  damage/round on meetings where a Rage-family fire occurred, per
  leg — so this pilot reads against freestrike's 0/19 on the same
  cut.
- **Gate question:** among LOSSES, how many had gate `avoid` vs
  `null`/`seek`. (Fightcap-a: 0 avoids among 28 arm losses
  combined — the gate measures size+gear, never damage. This arm
  does NOT touch the gate; the gate arm comes only after a carrier
  GO, per the finding.)
- **Monster mix by outcome;** wall numbers (reported every run):
  national / table / wins, wave-4 and wave-5 unlocks, median
  survival, per leg.
- **Table:** not instrumented by this driver — reported as null,
  never faked.

## What this pilot does NOT judge

- The gate arm (damage proxy) — explicitly deferred until after a
  carrier GO, per the finding. Do NOT land a gate tweak here.
- The bow half of the winning shape (bowopen-a: staging never
  staged; the gate+source fix is its own named next arm).
- War_cry / Stoke as alternative carriers — Rage is the prescribed
  mechanism; stoke already fires as a free action in `fieldAct`
  (next 2 strikes +60%) and war_cry has no field port. Noted here,
  not tested here.
- The 4th seat (engine-blocked: `fieldFights.js` slices allyVids
  to 2) — out of scope; the trio+ population is the engine's full
  expression.
- The rounds=0 "vKill" rows with mHpStart null and mDealt ~12–27
  (likely off-screen/environmental kill attributions) are excluded
  by the engaged filter (rounds > 0) and counted as fight wins
  nowhere.
- No 12–16 seed confirm in this run — pilot only; the coordinator
  decides the confirm from the pilot verdict.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the fightcap/bowopen
  bands, for comparability). Dead villages stop simulating (+10d
  tail max).
- **Seeds (fresh 8-seed pilot band): 107801, 107802, 107803, 107804,
  107805, 107806, 107807, 107808.** Freshness check (skill
  local_seed_band_freshness): exact-seed greps over all
  `evidence/*/sim-*-prereg.md` — 0 hits for 10780x (1078xx
  entirely unnamed in preregs); `grep -rln "10780[1-8]"` over
  dated `evidence/**/*.md` — 0 hits; over `scripts/` — 0 hits;
  over goal `hidden_files/*.md` — 0 hits; filename search over
  `evidence/` + `scripts/` — no file name contains any candidate
  seed. Collisions recorded so the next worker does not repeat
  them: 107401–107408 (launchfield, Nov 22–23); 1075xx and 1076xx
  heavily named in preregs; 1073xx named. The designated
  holder-rich band 106151–106158 is deliberately NOT used: the
  carrier grants Rage to NON-holders, so holder richness does not
  power this pool — launch richness does, and fresh bands
  typically deliver 22–27 pair-inclusive meetings (fightcap 22,
  bowopen 27); the designated band's launched-meeting count cannot
  be derived from its corpora (the laterage recorder carries no
  v4gates rows).
- **Policies:** competent verbatim (`scripts/policies/competent.js`,
  sha256 first 12 `1884c8852d38`). **Substrate both legs:**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1` (all landed code). **Ctl = same code, carrier flags
  unset; arm = same code, `FIELDCAPDMG=1 RAGEFREE=1 FREESTRIKE=1`.**
  The legs differ ONLY by env — no code revert between legs. The
  driver asserts the flags match the MODE label and each corpus
  file records `carrierOn` + `senseexpedOn` + shas.
- **Instrument:** `scripts/ragecarry-driver-b.js` (adapted from
  `scripts/fightcap-dmg-driver-a.js` + the fieldcarrier driver on
  branch `sim-fieldcarrier-a` — the recorder is unchanged except
  the added carrier fields on the encounter row and the
  three-flag MODE assertion); analyzer
  `scripts/analyze-ragecarry-b.js` (adapted from
  `scripts/analyze-fightcap-a.js` + `analyze-fieldcarrier-a.js`,
  `--selftest` incl. the pair-inclusive population, the carrier-fire
  counting, and all judge shapes); per-seed JSONs under
  `evidence/2026-11-24/perseed-ragecarry-b-{ctl,arm}/`.
  **§15 panel:** `scripts/build-ragecarry-panels-b.js` (adapted copy
  of the fightcap panel builder, same schema) + `node
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
fightcap band (launched parties geared by the launch gear-up, min
armorP 17.7–28.3); the pilot does not re-derive gear — the competent
policy plays it, and the corpora record what it played.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   fightcap-a fresh band: 45 arm / 29 ctl launched meetings per 8
   seeds; bowopen-a: 82/leg; the engaged pair-inclusive pool is 22
   arm / 4 ctl (fightcap) and 27/leg (bowopen). The trio+ pool is
   thin (3 arm / 0 ctl) — the pool floor + verdict ladder above are
   sized to that known thinness, with the pool judged on the control
   leg's delivery.
2. **Pool sizing:** see (1). The pair-inclusive floor (ctl n ≥ 10)
   is the powered population; the trio+ floor is reported, not
   judged. The freestrike carrier-fight pool (15/19 on 8 seeds) is
   a second powered reading on the same cut.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-ragecarry-b.js`, GREEN before the pilot) stages
   the stack in a staged field fight — carrier injection on a
   non-holder vs a wave-4+ monster, the free-action strike landing
   in the fire round, the strike running before the verb chain —
   and proves all-three-off is byte-identical old behavior (no
   carrier injection, setup turn spent, verb chain first). The
   analyzer `--selftest` covers the join, the piecewise presence
   rule, the pair/trio shapes, evade/unjoined exclusions,
   carrier-fire counting, and all judge shapes incl. the THIN-POOL
   and staging-null paths.

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read for
this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500, pierce 0.2–0.5 — "a 4–6 round fight for a godhood build
(~220 dmg/round)". The decomposition's damage yardstick (~220
dmg/round vs the measured ~40–60) comes from that canon band, not
from invention. Rage is data, not canon prose:
`src/data/abilities.json` rage/`unleash_rage` — cost {turn: true,
kcal: 60}, "Your next three strikes deal double damage"; the field
engine is `src/js/godpath.js` `fieldBegin`/`fieldAct` (Rage branch:
x2, 3 strikes, monster-HP > 40% gate, once per fight) +
`src/js/fieldFights.js` (volley, strike fold-in, ally strikes).
No canon doc covers Rage-holder acquisition, the launch party, or
launch gear-up — said here rather than inventing canon. The launch
mechanics are cited from code (`win-plan.js`,
`villager-agency.js` `startExpedition`, `party-wiring.js`
SENSEEXPED, `fieldFights.js`), not from canon.
