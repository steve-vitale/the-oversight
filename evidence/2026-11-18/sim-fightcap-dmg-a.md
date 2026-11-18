# sim-fightcap-dmg-a — evidence

Run fleshout-20261118T1515Z, Loop A (axis scale-onramp). Branch
`sim-fightcap-dmg-a`, base master at 8bfd1874d (local master tip =
the 1415Z round closeout; origin/master behind it, pending ship).
Worktree `~/workspace/worktrees/sim-fightcap-dmg-a`. Prereg:
`evidence/2026-11-18/sim-fightcap-dmg-a-prereg.md` (frozen 2026-11-18
~10:05 CST, before any new sim). Analyzer:
`scripts/analyze-fightcap-dmg-a.js` (selftest 10/10; reuses
`legStats` from `analyze-fightcap-a.js`, selftest 20/20). Analysis:
`evidence/2026-11-18/fightcap-dmg-a-analysis.json`.

## 1. The question

**Finding #2544 (the fightcap decomposition):** a typical launched
trio deals ~50 damage/round to a ~1,200 HP wave-4 monster (~39
rounds to kill) and flees after five rounds while alive; combined
kill share 2/34 launched meetings (0.059). The only wins (Cooper's
party): a Rage fighter at 2.5x damage + bow opening + all three
hitting every round, ~111 damage/round, wins in 9–12 rounds. This
arm builds a damage-multiplier carrier in launched parties (the
holder rages like a Rage-holder vs wave-4+, even without the
ability) and MEASURES the kill share.

## 2. Verdict — NO-GO (the carrier never fired; the pilot measures a null, not the multiplier)

| Bar | ctl | arm | Requirement | Result |
|---|---|---|---|---|
| Pool floor (pair-inclusive engaged, present) | 13 | 13 | arm ≥ 10 | **PASS** |
| Kill share (pair-inclusive) | 0.000 (0/13) | 0.000 (0/13) | arm ≥ 0.25 | **FAIL** |
| Kill-share ratio | — | 0 kills | arm ≥ 2× ctl | **FAIL** (ctl 0 kills, arm 0 kills) |
| Community loss | 3/8 | 3/8 | arm ≤ ctl + 0.125 | PASS |
| Villager starvation | 0 | 0 | arm ≤ ctl + 2 | PASS (totals 0 vs 0) |
| Median survival | 150d | 150d | ratio ≥ 0.80 | PASS (1.00) |
| Instrument errors | 0 | 0 | 0 | PASS |
| Carrier fires (proxy) | 2 | 2 | arm > 0 | PASS — **but the proxy is wrong (see §5)** |

The two legs are **bit-identical on every measured number** — same
13 pair-inclusive meetings, same outcomes, same damage, same
per-seed days/standing/wave/deaths (§4). The corpora are identical
field-for-field on encounters, gates, daily rows, and deaths for all
8 seeds. The carrier fired **zero times** in the arm leg (§5). So
this pilot does NOT measure whether a damage multiplier turns
launched parties into winners — it measures a carrier that never
reached the fight. The NO-GO is frozen and stands; the mechanism
diagnosis (§5) is the finding, and the next arm is named in §10.
**No 12-seed confirm** — the prereg gates the confirm on the pilot
passing the sniff test, and it did not.

## 3. The carrier (what was built)

`src/js/game.js`, `tbVillagerAbility` RAGE block, env-gated
`FIGHTCAPDMG=1` (off = byte-identical old behavior). A launched
party's holder rages like a Rage-holder vs a wave-4+ monster even
without the ability: holder = `winPlan[vid]` with a non-empty party
AND currently on an expedition (`agencyState().exped[vid]` — the
same staleness guard the sense fix uses); nearest live monster wave
≥ 4 (`m.mdef.wave`); adjacent (d ≤ 1); not yet raged this fight.
Effect is exactly real Rage: `_vRageRounds = 3`, next 3 strikes deal
double damage, same voice line. No ability granted, no slot, no
persistence — fight-scoped, spent per strike. Proof test
`scripts/test-fightcap-dmg-a.js`: **13/13 green** — carrier fires
for a launched holder vs wave-4 with no Rage ability (and narrates),
does not fire when the flag is off / no plan / not on expedition /
wave-3 / not adjacent / empty party; the real Rage path is
unchanged; consumption is exactly ×2.0 (4 → 8) with one raging
strike spent.

Policy-side was ruled out in the prereg and stands: policies drive
the scholar; launched-party members are NPC villagers, and abilities
are System-granted, never taught — no policy path reaches them.

## 4. Fresh pilot — before / after on identical seeds (8 seeds, 104601–104608)

Pilot logs: `fightcap-dmg-a-{ctl,arm}.log/.err` (both exit 0, 0
instrument errors). Corpus flags verified per file: ctl
`fightcapdmgOn` false, arm true; `carrierPresent` true both legs;
`gameSha` 3c1a87cd70f6 both legs; `launchpartyOn` true both legs;
`wiringSha` 159bca02f0a0 both legs (the sense substrate present in
code). Substrate both legs: `VETREENGAGE=1 PARTYSIZE4=1
FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHPARTY=1`.

| Seed | days / standing / wave | (arm leg — identical) |
|---|---|---|
| 104601 | 62d village-lost, 150, wave 4 | identical |
| 104602 | 150d survived, 400, wave 5 | identical |
| 104603 | 150d survived, 470, wave 5 | identical |
| 104604 | 68d village-lost, 125, wave 4 | identical |
| 104605 | 150d survived, 350, wave 5 | identical |
| 104606 | 150d survived, 275, wave 5 | identical |
| 104607 | 111d village-lost, 199, wave 4 | identical |
| 104608 | 150d survived, 199, wave 4 | identical |

### 4.1 The populations

| Population | ctl n | arm n | arm wins | arm win share | arm kill share |
|---|---|---|---|---|---|
| Trio+ (size ≥ 3, present, engaged) | 1 | 1 | 0 | 0.000 | 0.000 |
| Pair-inclusive (size ≥ 2, present, engaged) | 13 | 13 | 2 | 0.154 | 0.000 |

Funnel (both legs, identical): 32 launched expedition meetings →
0 no launch plan → 0 party-absent → 19 evades excluded → 13
pair-inclusive engaged (1 trio+). The 19 evades are the same
meetings on both legs — the population is the sense substrate's,
unchanged by the carrier because it never fired.

### 4.2 The damage race — unchanged

Damage per outcome, pair-inclusive (both legs identical):

| Outcome | n | dmg/round (mDealt/rounds) | rounds (mean) | monster HP (mean) |
|---|---|---|---|---|
| vFlee | 10 | ~44 | 3.7 | ~1100 |
| vDie | 1 | ~9 | 2 | 1208 |
| mFlee (talk-downs) | 2 | 0 | 1 | — |

Same ladder as the fightcap band: typical parties deal ~40–60/
round and flee at ~4 rounds having dealt ~9% of monster HP; the
winning shape needs ~111/round. Nothing moved, because nothing
fired.

### 4.3 Losses by monster (both legs)

audit 0–4, reunion 1–2, congregation 0–1, influencer 0–2, eulogy
0–1, algorithm 1–0, eater 0–1. Broad, not one monster. The gate
never held back a loser (loss gate: null 9, avoid 0, seek 2) — same
as the fightcap band; the gate still measures size+gear, never
damage.

## 5. Why the carrier never fired — the wrong engine (the finding)

**Launched-party meetings resolve in the off-screen field-fight
engine (`fieldFights.js` + the godpath field simulator), never in
the turn-based board fight (`game.js` `tbfight`) where the carrier
lives.** The carrier hooks `tbVillagerAbility`; the measured
population never enters it.

Evidence, in order:

1. **Bit-identical legs.** The carrier is the ONLY difference
   between the legs (same code, same seeds, same substrate env; only
   `FIGHTCAPDMG` differs). If it had fired once, that fight's
   `mDealt` — and likely the trajectory — would differ. Every
   encounter, gate, daily row, and death is identical across all 8
   seeds. Fires: 0.
2. **The driver wraps `Game.fieldFight`** (driver line ~853) to
   record `v4encounters` — the measured meetings are field fights.
   The encounter log lines match the godpath field simulator's
   formats (`godpath.js` `fieldAct`: `"R1: …'s eyes go red. Next 3
   strikes hit twice as hard. (Rage)"`), not the TB engine's.
3. **Instrumented replay probe** (`/tmp/probe-carrier.js`, read-only
   wrapper around `tbVillagerAbility`, same setup/env as the pilot
   arm leg, seeds 104605 and 104602): `tbVillagerAbility` was called
   4 times in 150 days on 104605 and 177 times on 104602 (TB fights
   — player-involved — do happen), but
   `planHolderWave4Calls` was **0 on both seeds** — a launched
   holder was NEVER evaluated against a wave-4+ monster in the TB
   engine. `fired` 0 on both.
4. **Where Rage actually lives in field fights.**
   `fieldFights.js:658` calls `GPf.fieldBegin(this, vid, vAbs)`; the
   fighter's own abilities (`npcOwnedIds(vid)`) become `G.held`;
   `godpath.js` `fieldAct` fires Rage when `h.rage` (sets
   `G.nextMult = 2; G.nextN = 3`, next 3 strikes ×2) and pays the
   honest 60 kcal via `fieldPay`. The TB engine's
   `tbVillagerAbility` / `_vRageRounds` path is never consulted
   there — `fieldFights.js` has no `_vRageRounds` handling at all.

**The next arm's hook (frozen here, for the coordinator):** the
carrier belongs in the field engine — at the `fieldBegin` call site
(`fieldFights.js:658`, lead) and its ally twin (`fieldFights.js:
~1329`), or inside `fieldBegin` with a carrier parameter: a launched
holder facing a wave-4+ monster counts as holding `rage` (`held.rage
= true`), so the existing `fieldAct` Rage branch fires it through
`fieldPay` (60 kcal, honest cost — the multiplier is not free).
`fieldFight(vid, mdef, m, opts)` already has the monster def (wave)
in scope; the holder's plan/expedition checks are the same two
reads the TB carrier uses. The TB carrier (`game.js`) stays as the
mechanism reference + proof (13/13) for that port; it should NOT be
landed as a live change on its own (it changes nothing in the
measured population — see §11).

**The carrier-fire proxy is wrong — retired here.** The analyzer's
`carrier-fires` bar counted 2 meetings on BOTH legs (identical:
104605 d53 Maricela vs Influencer, 104606 d80 Soo vs Eulogy). Those
are REAL Rage, not carrier fires: the holder raged in the field
engine (their `npcOwnedIds` at fight time included `rage`), while
the analyzer's snapshot showed `['the_touch']`. The snapshots
(`samples.villagers`) are taken every 30 days and record
`npcAbilities` — up to 29 days stale, so a Rage granted between the
snapshot and the meeting is invisible to the proxy. The proxy
cannot distinguish carrier rage from real rage gained
post-snapshot; the next arm must detect carrier fires from the
field engine itself (e.g. a `carrierRage` flag on the encounter row
or the `G.held` injection point), not from snapshots. The bar
passed on both legs only because the proxy counts real Rage.

**Secondary observation (from the two real-Rage meetings):** even
where the holder DID rage (field engine, real Rage), the parties
still fled at ~24% and ~13% of monster HP — Maricela dealt 265
over 6 rounds (~44/round), Soo 129 over 4 (~32/round). A doubled
weak base adds ~30–45 damage over the fight against ~1,200 HP (~4%).
The winning shape's rage worked because Cooper's BASE strike was
already ~31 (strong weapon) at ×2.5 with a bow opening on top. A
multiplier on a typical base (~15/strike) does not close the gap by
itself — the next arm should measure the field-engine carrier AND
watch whether the base strike (weapon/gear) is the second binding
link, or stage the full winning shape (strong base + bow + three
contributors) rather than the multiplier alone.

## 6. §15 balanced panel — review_required (zero deltas)

`scripts/build-fightcap-dmg-panels-a.js` + `node
scripts/balance-panel.js compare`. Decision:
**review_required**. 8 paired cases; screen only. Every paired
delta is exactly 0 (the legs are identical): national 0 → 0, table
win rate 0 → 0, village deaths per run 78.375 → 78.375, community
loss 0.375 → 0.375, all `no_material_signal`. The
`review_required` is the screen's default on a zero-delta panel, not
a signal. The panel is the instrument, the frozen bars (§2) are the
judge. Panel files: `fightcap-dmg-a-panel-before.json.gz`,
`fightcap-dmg-a-panel-after.json.gz`, `fightcap-dmg-a-panel.json`,
`fightcap-dmg-a-panel.md`.

## 7. Reachability verdict / wall numbers

Wave-4 meetings happen (32 launched meetings/leg); wave-5 unlocks
4/8 both legs; **national 0/8 both legs; table not instrumented
(null, never faked); wins 0/8 both legs.** Median survival 150d
both legs. The standing-199 stall persists (104607: 199, lost;
104608: 199, survived). The scale-onramp axis is still blocked
above regional. What this run adds: the capability question is
still OPEN — the multiplier was never tested in the engine where
these fights happen.

## 8. Village assessment (plain words)

When a party sets out to hunt a wave-4 monster, the party that set
out is still the party that meets it, and the fight still goes the
same way: about fifty points of damage a round against twelve
hundred hit points, and the party gives up after four rounds. This
run was supposed to test whether giving the party's leader a
battle-fury — hitting twice as hard for three strikes — turns those
fights into wins. It didn't test that at all, because the fury was
wired into the wrong fight. The village's wild fights are settled
off-screen by a fast engine that never asks the board-fight code
where the fury lives. The two legs came back identical down to the
last hit point, which is how we know the fury never fired once.

Two parties did fight with real battle-fury — the leader already
held the Rage ability — and they still lost. Their strikes doubled
from about fifteen to about thirty, which sounds like a lot until
you put it next to twelve hundred hit points: roughly forty extra
points of damage in a fight they lost by nine hundred. The winning
party from the earlier band didn't just have fury; it had a strong
fighter whose ordinary strikes were already twice as hard, plus a
bow opening, plus all three people hitting every round. Fury alone,
on an ordinary fighter, is a sparkler, not a sword.

## 9. Sense testing (what the player would see)

Read in full from the arm leg (identical on ctl): 2 Rage-token
meetings, the 1 death, 2 flee losses, 1 talk-down.

- **104605 d53 Maricela vs The Influencer (vFlee, 6 rounds):**
  *"Maricela walks straight into The Influencer. No avoiding it."*
  R1 her eyes go red, *"Maricela strikes for 32 (x2.0)"* — the
  field engine's real Rage, voiced exactly like the card. *"Maricela
  is losing — shouts for help! Carmine charges in!"* / *"…shouts
  again! Abdul charges in!"* Field medicine mid-fight. She flees
  at 24% damage dealt. Coherent throughout; the transcript itself
  shows the multiplier working and still not being enough.
- **104606 d80 Soo vs The Eulogy (vFlee, 4 rounds):** same shape —
  eyes go red R1, 32/34-point doubled strikes, shouts bring Diana
  and Nadia in, *"Soo sees how this ends — and runs while running
  still works."* The flee line is honest about the race being lost.
- **104603 d134 Ximena vs The Audit (vDie, 2 rounds):** Ximena
  strikes for 11, takes 36, strikes for 7, takes 26 and dies. No
  abilities, no allies in time — the fight was hopeless from the
  first hit. Nothing robotic; the brevity is the tragedy (a 2-round
  death reads as an ambush, not a duel). The gate said `seek` for
  this meeting — it sent her in.
- **104601 d44 Ingrid vs The Audit (vFlee, 2 rounds):** field
  medicine, then *"Diana answered Ingrid's shout, but Ingrid is
  past holding — they run while running still works."* The ally
  arrives after the decision — a small honesty gap (the shout is
  answered but the flee was already decided), worth a line, not a
  finding.
- **104603 d51 Victor vs The Congregation (vFlee, 4 rounds):**
  steady 13–15-point strikes against 1,041 HP, both allies join on
  shouts, flee at 9% damage. Reads like people grinding a wall.
- **104602 d88 Moshe vs The Reunion (mFlee, 1 round):** *"Moshe
  has Crossbow but no arrows — the string stays drawn, useless."*
  then the Peacemaker walk-in: *"Moshe walks in open-handed,
  talking — low, steady, unafraid. And impossibly, it listens. It
  stands down."* The crossbow line is honest (a crossbow genuinely
  needs arrows — distinct from finding #2546's sling, which takes
  none). The talk-down is a win by the metric, not a fight win;
  the evidence never counts it as a kill.

No new player-facing text was added by this arm's carrier (it never
fired). The transcripts read like people throughout.

## 10. Findings filed / updated (for the coordinator to file — this arm does not edit sim-findings.md)

- **#2544 (fight capability: damage output) — REFINED, still OPEN.**
  The multiplier was never tested in the engine where launched
  parties fight. The binding question is unchanged in direction but
  the mechanism moved: the carrier belongs in the field engine
  (`fieldBegin`, godpath.js, called from fieldFights.js:658/1329),
  not the TB engine (`tbVillagerAbility`, game.js). Next arm:
  port the carrier to `fieldBegin` (launched holder vs wave-4+
  counts as holding `rage`, paid honestly via `fieldPay`) and
  re-measure kill share on the same frozen bars; detect carrier
  fires from the field engine, not from 30-day snapshots. Do NOT
  land another TB-engine tweak for this question.
- **NEW — the carrier-fire proxy is unreliable (snapshot
  staleness).** `samples.villagers` is every 30 days; a Rage granted
  after the snapshot is invisible to the analyzer, so "holder raged
  without the ability" false-fires on real Rage. Any future
  carrier-fire detection must come from the fight engine (a flag on
  the encounter row / the injection point), never from snapshots.
- **NEW — Rage on a weak base adds ~4% of a wave-4 monster's HP.**
  The two real-Rage meetings show a doubled ~15-point base strike
  contributing ~30–45 damage over the fight vs ~1,200 HP. If the
  field-engine carrier also fails to move kill share, the next
  question is the base strike (weapon/gear) or the full winning
  shape (strong base + bow + three contributors) — not a bigger
  multiplier alone.
- **NEW — test-abilityuse-twins-20261103.js consume cases fail on
  master (pre-existing).** 25 passed, 6 failed, all six CONSUME
  cases (`undefined -> undefined` — the staged villager flees
  instead of striking after accumulating fear across the many
  fights in one process). Identical 25/6 on pristine master
  (verified in the main tree, no arm changes) — NOT caused by this
  arm. The SET tests (including the Rage-adjacent twins) all pass.
  The same fear-accumulation forced this arm's proof test to run
  its CONSUME case first. Needs a harness/fixture fix (fresh
  villager per consume case, or a fear reset), not a game change.
- **#2546 (sling fiction bug) — NOT extended.** The "Crossbow but
  no arrows" line in the 104602 talk-down is honest (crossbows need
  arrows); the sling issue stands alone.
- **#2538 — unchanged.** The arrival price question is untouched
  by this arm (identical legs, no cost movement).

## 11. Blanks, limits, and things not done

- **The TB carrier commit (b9a2a295) should NOT land as a live
  change.** It is env-gated off by default and changes nothing in
  the measured population, but landing it would put a dead-code
  carrier on master. Recommendation: the coordinator lands tooling
  + evidence only (like the fightcap-a cherry-picks) and HOLDS the
  carrier commit for the field-engine port arm, which reuses the
  mechanism + proof test; revert it instead if the coordinator
  prefers a clean tree. The SUBSTRATE commit (480168a58, sense fix)
  is likewise HELD, never to land from this arm.
- **No 12–16 seed confirm** — gated off by the NO-GO (see §2).
- **No check.js run** (the round addendum owns the merged-master
  check; this arm ran the targeted suites instead: proof 13/13,
  abilityfirst 43/43, ability-gaps 16/16, analyzer selftests 10/10
  + 20/20, twins 25/6 with the 6 pre-existing on master).
- **Table sittings not instrumented** by this driver — reported as
  null, never faked. The panel shows table-entry/sitting rates as
  `not_observed`.
- **Encounter logs cap at ~20 lines** — fights longer than ~4
  rounds are truncated; all damage-rate claims use mDealt/rounds,
  never parsed totals.
- **mHpStart is null on some meetings** (recorder gap, known from
  fightcap-a) — damage-share means use the meetings where it is
  present; damage/round uses mDealt/rounds throughout.
- **The probe scripts** (`/tmp/probe-carrier.js`) are scratch in
  /tmp, not committed — the diagnosis is reproducible from §5's
  four numbered points (bit-identical legs + driver wrap +
  `fieldBegin`/`fieldAct` + the probe counts quoted there).
- **Telemetry deviation check:** `node scripts/telemetry-check.js
  --baseline …/telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-18/perseed-fightcap-dmg-a-arm/*.json' --metrics
  national,table,wins,exiled` — REFUSED recorder-corpus input (all
  8 rows carry top-level anchorCommit; exit 0 with the refusal
  message) — same documented refusal as the 1415Z run. Recorder
  corpora are compared with sweep-compare tables, never against a
  run baseline here. Baseline NOT rolled.

## 12. Metric review

- The frozen bars judged as written; the NO-GO stands and is not
  re-scored. The pair-inclusive primary performed as designed
  (pool floor met at n=13/arm) — the trio+ floor would have failed
  again (n=1), confirming the fightcap metric review.
- The `carrier-fires` bar is RETIRED as written: the snapshot proxy
  cannot detect carrier fires (30-day staleness; it false-fires on
  real Rage). The next arm's prereg must define carrier-fire
  detection from the field engine, not from snapshots, and must
  pre-register it as a mechanism check, not a verdict bar — the
  kill share is the verdict; the fire count explains it.
- The kill-share bars (≥0.25, ≥2× ctl) were the right bars for the
  question as staged; they now apply unchanged to the field-engine
  port. No metric is re-scored here.

## 13. Files

- Prereg: `evidence/2026-11-18/sim-fightcap-dmg-a-prereg.md`
  (7aef4eb2d)
- Substrate (HELD): `src/js/party-wiring.js`,
  `src/js/villager-brain.js` (480168a58 — sense fix from
  sim-launchparty-sense-a d01eaf0a5)
- Carrier + proof: `src/js/game.js` (tbVillagerAbility RAGE block),
  `scripts/test-fightcap-dmg-a.js` 13/13 (b9a2a295)
- Tooling: `scripts/fightcap-dmg-driver-a.js`,
  `scripts/analyze-fightcap-dmg-a.js` (selftest 10/10),
  `scripts/build-fightcap-dmg-panels-a.js` (499a34522)
- This evidence: `evidence/2026-11-18/sim-fightcap-dmg-a.md`
- Analysis: `evidence/2026-11-18/fightcap-dmg-a-analysis.json`
- Corpora: `evidence/2026-11-18/perseed-fightcap-dmg-a-ctl/` (8
  files), `evidence/2026-11-18/perseed-fightcap-dmg-a-arm/` (8 files)
- Pilot logs: `evidence/2026-11-18/fightcap-dmg-a-{ctl,arm}.log/.err`
- Panel: `evidence/2026-11-18/fightcap-dmg-a-panel-{before,after}.json.gz`,
  `fightcap-dmg-a-panel.json`, `fightcap-dmg-a-panel.md`
- Tests: `scripts/test-fightcap-dmg-a.js` (13/13),
  `scripts/analyze-fightcap-dmg-a.js --selftest` (10/10),
  `scripts/analyze-fightcap-a.js --selftest` (20/20),
  `scripts/test-abilityfirst-a.js` (43/43),
  `scripts/test-ability-gaps.js` (16/16),
  `scripts/test-abilityuse-twins-20261103.js` (25/6, 6 pre-existing
  on master — verified in the main tree)
