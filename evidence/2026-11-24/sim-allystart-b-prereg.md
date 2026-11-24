# sim-allystart-b — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-allystart-b · **Loop B run:** fleshout-loop-b-20261124T1930Z
**Type:** BUILD — default-OFF lever, pilot (8 seeds, before/after on
identical seeds). **Finding:** #2600, "ALLIES NEVER START IN THE FIGHT"
(`evidence/2026-11-24/sim-basedmg-b.md`, DIAG-GO).
**Frozen:** 2026-11-24, before any judged sim.
**Branch:** `sim-allystart-b` (worktree
`~/workspace/worktrees/sim-allystart-b`). **Base master:** `6297eb21c`
(basedmg merged). Master may move under this run (sibling Loop A is
landing scale-onramp arms) — if the ff-only merge later refuses,
rebase cleanly and re-run the proof test after every rebase.

## The question

On fresh band 109501–109508, `allyFromStart` is false in 54/54
wave-4+ expedition meetings: the lead fights alone for rounds 1–2
and allies "charge in" one at a time only when the lead shouts for
help while losing. The full trio exists only from ~round 3–4 and
fights usually end (flee) around round 4–5. The basedmg evidence's
own assessment says the cheapest half of the damage gap is not
damage at all — it is getting all three fighters into the fight
from the first round instead of the third. This arm builds that
lever and prices it: kill share + damage/round, with cost bars.

## The mechanism (read from code, not invented)

- `src/js/villager-agency.js` `expeditionMonster`: `allyVids` =
  `villagerFightAllies(vid)` — the sense, launch-first with
  SENSEEXPED=1 (`src/js/party-wiring.js`: launch companions first
  in expedition-start order, then trust-ordered crew/earshot;
  capped at 2 — the engine takes the first two; the 4th seat opens
  only with ALLYSLOT3=1). `_pinDoor` is true only when PINQUAD=1
  AND three sensed allies exactly match the pinned quad — so with
  PINQUAD off (the basedmg substrate), the call at line ~916
  passes `allyFromStart: false` on every expedition meeting.
- `src/js/fieldFights.js` `fieldFight`, door block (~line 1503):
  when `opts.allyFromStart`, ally 1 joins round 1 ("is already at
  the door — charges in with …!"), ally 2 too when FIGHTALLY2=1,
  ally 3 too when ALLYSLOT3=1. Otherwise allies join only through
  the hopeless-shout ladder (~lines 2972–3037): one ally per
  hopeless round, rounds 2/3/4, only while losing.
- The aid path (`src/js/comms.js:672`) already passes
  `allyFromStart: true` — parties that arrive to help fight from
  round 1. The expedition path is the odd one out: companions who
  walked out together wait for a scream.

## The lever (ALLYSTART=1, default OFF)

`src/js/villager-agency.js`: a new pure-read helper
`allyStartAtDoor(vid, allyVids, pinDoor)` — true when the pinned
door is true OR (`process.env.ALLYSTART === '1'` AND
`allyVids.length > 0`) — and `expeditionMonster` passes
`allyFromStart: allyStartAtDoor(...)` instead of `allyFromStart:
_pinDoor`. No change to `fieldFights.js`: the door block already
knows how to start allies in the fight; the expedition router
just never asked it to. Off-mode (`ALLYSTART` unset) the helper
returns exactly `_pinDoor`, no new RNG is drawn, and the call is
byte-identical to today.

**Scope decisions (frozen):**
- **No wave gate.** The lever applies to every `expeditionMonster`
  meeting with sensed allies, not only wave 4+. The shout ladder
  it replaces is not wave-gated either, and the plain meaning —
  companions who set out together fight together from the start —
  has no wave qualifier. The judged population is wave 4+
  (the GO bar); any wave-1/2/3 movement shows in the wall numbers
  and the panel, and the cost bars catch harm.
- **Expedition route only.** The wild/patrol routers (`game.js`
  wild router) are untouched; they sense the pin but get no door,
  as today. Out of scope, said here.
- **Third seat out of scope.** With the judged substrate
  (FIGHTALLY2 on, ALLYSLOT3 off) the sense caps at 2 allies, so
  ALLYSTART puts at most lead + 2 allies in from round 1 — the
  same ceiling as the control, so the comparison prices timing
  only. The third companion can never join either leg (ALLYSLOT3
  is its own lever, finding #2515). The proof test documents the
  ALLYSLOT3 composition as a non-judged observation only.

## Primary metric (BINDING, §14)

**Kill share + median damage/round on the pair-inclusive engaged
launched wave-4+ meeting population** — the same population
basedmg judged (`scripts/analyze-fightcap-a.js` `legStats`,
`minPlanParty: 1`: v4encounters row with origin `expedition`,
wave ≥ 4, joined to its v4gates row with a non-empty planParty,
launched party PRESENT, ENGAGED — rounds > 0; evades join
nobody). Kill share = `vKill` / meetings; median dpr =
median(`mDealt` / `rounds`) across meetings. Mechanism check
reported beside the verdict (never substituted for it):
`allyFromStart` share of meetings, and round-1 striker count
(distinct fighters with a parsed strike in round 1) — the lever
fires only if allies are actually striking in round 1.

**GO bar (frozen):**
- Pool n ≥ 10, AND
- Arm kill share ≥ 0.15 vs ctl 0.000, AND
- Arm median damage/round ≥ 60 vs ctl 25.7, AND
- Instrument errors 0, proof test green, analyzer selftest green.

**Cost bars (scalemetric rule, frozen — a GO met with a cost bar
breached is NO-GO, §14):**
- Starvation deaths (legStats `isStarvation`: kind or cause
  matching /starvat/i): arm total ≤ ctl total + 2, AND arm
  villager (non-player) starvation ≤ ctl villager starvation + 2.
  ("Arm-only deaths" in the brief is read as the villager
  starvation count — the deaths the lever's extra fighting could
  plausibly cause by keeping fighters out longer; stated here so
  the phrase is not re-read after the numbers land.)
- Median survival (gameDays, legStats `medianDays`): arm ≥ 0.8×
  ctl median.

**Verdict ladder (frozen):**
- All primary + cost bars pass → **GO** (land the lever).
- Pool n < 10 → **NO-GO THIN-POOL** (numbers reported anyway).
- Any primary bar missed → **NO-GO** with the bar named and a
  §14a kill classification (CONCEPT-DEAD / METRIC-BROKEN /
  SUBSTRATE-MISSING).
- Any cost bar breached → **NO-GO COST** (same taxonomy).
- Instrument errors > 0, proof test red, or selftest red →
  **NO-GO INSTRUMENT**.

## Secondary metrics (supporting, not binding)

- Win share (vKill + mFlee) / vDie / vFlee splits by leg; rounds
  fought; `allyFromStart` share; round-1 strikers per meeting;
  strikes/round; per-outcome dpr.
- Wall numbers (reported every run): national / table / wins,
  wave-4 and wave-5 unlocks, median survival.
- Table: not instrumented by this driver — reported as null,
  never faked.
- Sense-test: read the best + worst arm meetings in full; judge
  whether allies arriving round 1 reads as people acting
  sensibly (companions who set out together fighting together),
  not just counts.
- Consistency check vs the basedmg corpus (see "Control" below).

## What this arm does NOT judge

- No 12–16 seed confirm in this run — single pilot; the
  coordinator decides any follow-up from the verdict.
- No ALLYSLOT3 change (third seat stays its own lever).
- No `check.js` gate waiver: the src/ change runs `check.js
  --quick` before landing; a red gate blocks the merge.
- No push, no version bump, no live verification — merged
  locally, pending ship.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the basedmg band, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (same 8-seed band as basedmg): 109501, 109502, 109503,
  109504, 109505, 109506, 109507, 109508.**
- **Policies:** competent verbatim (`scripts/policies/competent.js`,
  sha256 first 12 `1884c8852d38` — verify at run time; if the
  policy sha differs, record it and STOP, do not silently run a
  different policy).
- **Substrate (landed code, both legs):** `SENSEEXPED=1
  PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1` — the
  basedmg substrate exactly. Carrier flags (FIELDCAPDMG /
  RAGEFREE / FREESTRIKE) asserted OFF on both legs.
- **Arm leg only:** `ALLYSTART=1`.
- **Instrument:** `scripts/allystart-driver-b.js` (a port of
  `scripts/basedmg-driver-b.js` — the recorder is UNCHANGED, so
  the control leg is comparable to the basedmg corpus; only the
  MODE/flag asserts, the run label, and the per-file metadata
  differ: `allystartOn` + villager-agency sha recorded per file);
  analyzer `scripts/analyze-allystart-b.js` (reuses `legStats`
  from `scripts/analyze-fightcap-a.js` and the strike-line parser
  from `scripts/analyze-basedmg-b.js`; the allystart judge —
  kill share, median dpr, allyFromStart share, round-1 strikers,
  cost bars — is new here, `--selftest` incl. all judge shapes);
  proof `scripts/test-allystart-b.js`; panel builder
  `scripts/build-allystart-b-panels.js` (port of
  `build-allyslot3-rerun-b-panels.js`).
  Per-seed JSONs under `evidence/2026-11-24/perseed-allystart-b-ctl/`
  and `evidence/2026-11-24/perseed-allystart-b-arm/`.
  **§15 panel:** both legs go through `scripts/balance-panel.js`
  compare (pseudo-panels from the per-seed JSONs, paired seeds);
  the panel is the instrument, the frozen prereg bars are the
  judge. Attach the compare `.md` to the evidence file.

## Control (frozen choice)

**The judged control is a FRESH re-run** of the same 8 seeds with
this arm's driver (`MODE=ctl`, `ALLYSTART` unset) on the lever
commit. The basedmg corpus (`evidence/2026-11-24/perseed-basedmg-b-ctl/`,
control numbers kill share 0/27, median dpr 25.7, 20/27 vFlee) is
the CROSS-CHECK, not the judged control: identical driver +
identical code with the lever off is the exact pairing, and the
cross-check quantifies master drift between the basedmg base
(`c78100ff4`) and this arm's base (`6297eb21c`). If the fresh
control differs materially from the basedmg numbers, the drift is
reported and investigated in the evidence file — never smoothed
over. (Rationale for re-running rather than reusing: the lever
commit touches the exact call site under test; a fresh off-mode
leg proves off-mode byte-identity in the same breath as it
controls the arm.)

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a launched party FIGHTS as launched,
so the fixture is the encounter itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The per-seed corpora carry the encounter
averages (party size, gear, abilities) beside the verdict in the
evidence file, so a later reader can see the fixture gap without
re-running the panel.

## Pre-run substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate —
   basedmg: 27 engaged launched-party meetings / 8 seeds on this
   band. The pair-inclusive pool on this band is expected ≥ 10 on
   8 seeds.
2. **Pool sizing:** see (1). The pool floor (n ≥ 10) is the judged
   population; the trio+ pool is reported, not judged.
3. **Verb existence:** the door block exists and is exercised
   today by the aid path (`comms.js:672`) and the pinned-quad path
   — the lever asks the expedition router to use an existing verb,
   it does not invent one.
4. **Horizon fit:** wave-4 meetings occur across the 150d horizon
   on this band (basedmg days 84–147); the window contains the
   phenomenon.
5. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-allystart-b.js`, GREEN before the band) stages
   the lever in a staged field fight — allies present round 1 with
   the flag on (door lines + round-1 ally strikes), absent round 1
   with it off (no door lines, first ally strike round ≥ 2 or
   never) — plus helper unit checks (flag on + allies → true; flag
   off → pinned value only; no allies → false). The analyzer
   `--selftest` covers the join, the round-1 striker count, the
   cost bars, and all judge shapes incl. THIN-POOL and COST.

## Canon note

`docs/CANON.md` (manifest) and `docs/MONSTER-WAVES.md` were read
for this arm. MONSTER-WAVES.md: wave-4 bands are damage 35–95, HP
850–1500, pierce 0.2–0.5 — "a 4–6 round fight for a godhood build
(~220 dmg/round)". No canon doc covers ally entry timing, the
launch party, or the shout ladder — said here rather than
inventing canon. The mechanism is cited from code
(`villager-agency.js` `expeditionMonster`, `fieldFights.js` door
block + shout ladder, `party-wiring.js` `villagerFightAllies`,
`comms.js` aid path), not from canon. The design reading —
companions who set out together fight together from the start —
is a Muse call under standing intent (villagers act like people),
NOT a Steve ruling; Steve can overrule it.
