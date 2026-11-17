# sim-fightallycap-b — PREREG (frozen)

**Arm:** sim-fightallycap-b · **Loop B run:** fleshout-loop-b-20261117T1830Z
**Axis:** winnability chain (wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5 facing → full seat)
**Type:** BUILD (game-code change, env-gated default-OFF) + pilot measurement.
**Frozen:** 2026-11-17, BEFORE any pilot sims. No bar re-scored mid-run; a missed
bar is NO-GO, never re-scored against a friendlier metric. Metric review lives
in the evidence file, not here.

## The finding (measured, Loop B arm sim-partysize-b, run 1729Z)

The fight engine caps expedition fights below the launch cap. `villagerFightAllies`
returns at most 2 (`src/js/party-wiring.js`: "Capped at 2 — the fight engine takes
the first two"); `fieldFight` slices `allyVids` to 2 and models ONE ally slot
(`allyVid`/`allyHp`), joining one ally from start and one more via the single
hopeless shout (`src/js/fieldFights.js` — "One ally answers per fight"). In an
expedition fight (no `allyFromStart`) exactly ONE ally ever joins. Measured on
the frozen band: 6 size-4 parties launched on the armed leg, 5 fought meetings,
every one still fields exactly one joining ally; size-4 damage shares 2.2–5.5%
(mean 4.15%, n=4) vs a size-2 meeting on the same seed at 10.1% — nothing shows
the 4th seat adding damage, because the 4th member travels but cannot join the
fight. Raising the cap needs a second ally slot in the fight engine — no
precedent in the code; the single-ally body, gear, and wound-settlement all
assume one ally. (Finding #2496.)

## The lever (design, frozen)

A second ally slot in `fieldFight` (`src/js/fieldFights.js`), env-gated
`FIGHTALLY2=1`, default OFF, off in the browser (`process` is undefined there —
same gate pattern as the other env levers, e.g. `FIGHTOPEN`, `NODEWITNESS`).

- **Second slot, parallel state:** `ally2Vid` / `ally2Hp` / `ally2Max` /
  `ally2EntryHp` / `ally2Name` / `ally2Wb` / `ally2Armor` / `ally2StrikeMult` —
  a real villager body (entry HP from `village.health`, like ally 1), own gear
  (`villagerGearUp` + weapon/armor read, like ally 1), own strike each round on
  the same tactical formula, own wound settlement (sealed record entry +
  `hurtVillager`, like ally 1). `rec.allyDealt` stays the TOTAL across allies
  (existing telemetry keeps its meaning); `rec.ally2Dealt` / `rec.ally2Taken` /
  `rec.ally2Vid` carry the second ally's own numbers.
- **Join paths:** (a) `allyFromStart` — when the flag is on, BOTH passed allies
  join from round 1 (aid parties at the door); (b) hopeless shout — when the
  trajectory turns hopeless a second time after the first ally has joined and a
  second ally remains, the fighter shouts again and the second ally charges in.
  One shout per ally, never more than the passed `allyVids`.
- **Shared attention, not free defense:** the monster's ally hit share stays
  0.40 total (0.10 under `draw_fire`, 0 under goad) and splits between the live
  allies — the leader still takes 60% of the blows. The second ally spreads
  damage, it does not delete it.
- **Morale reads the whole party:** the hypothetical-protection-4 survival
  pool (FIGHTBLEND-B) sums leader + both allies; the hopeless/winning read is
  the party's, not the leader's alone.
- **Singular mechanics stay singular:** god-path ally hooks (`fieldAllyShare`,
  `fieldAllyDown`, `fieldAct` ally mend / `extraAlly`, Live Broadcast extra
  strike), the ward-rescue hook, and the `rec.allyVid` first-ally record stay
  wired to ally 1 — the second slot bypasses them (documented limitation, not
  a silent change). `shield_wall` / `rally` / `draw_fire` / `leech` /
  `bodyguard` generalize to "any live ally stands" (their fiction is about
  someone standing beside you, not about which one).
- **Off-mode byte-identity:** with the flag unset, every new branch is
  unreachable and no new RNG is drawn — the engine behaves exactly as today
  (exactly one ally, as today). The proof test asserts this.
- **No other files:** `villagerFightAllies` already returns up to 2 — no change
  there (one comment line updated). Loop A is live on scale-onramp with
  profilegate-b touching `villager-brain.js` and `win-plan.js` — those two files
  are NOT touched by this arm. If the build genuinely required them, the arm
  would stop and report to the coordinator instead of editing.

## Base, band, policy, legs

- **Base at freeze:** master `adad111ca` (sim-winnability-round-1729).
- **Policy:** competent verbatim (`scripts/policies/competent.js`), sha256
  `df9b7dff4de4...` (full: `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`).
- **Band:** seeds 103601–103608 (8 seeds, frozen fresh — same band as the
  partysize pilot, so the control leg is comparable). **Horizon:** 150d
  death-aware.
- **Legs:** ctl `VETREENGAGE=1` · arm `VETREENGAGE=1 FIGHTALLY2=1`. (This tree
  branches from master, so there is no PARTYSIZE4 lever here — trios are the
  measurement vehicle: the partysize pilot's control leg launched 10 trios on
  this band, and the cap binds on trios too.)
- **D2 determinism leg:** rec `VETREENGAGE=1 FIGHTALLY2=1` with the recorder OFF
  (`FIGHTALLY2_RECORDER=off`) — must be trajectory-identical to the armed leg.
- **Instrument:** adapted copy of the repaired partysize instrument
  (`scripts/fightallycap-driver-20261117.js`, from
  `scripts/partysize-driver-20261117.js` at partysize-branch commit
  `035034c9f` — post-call spawned-HP recovery, `recoverMHpStart`) +
  `scripts/analyze-fightallycap-b.js` + `scripts/build-fightallycap-b-panels-20261117.js`.
  Encounter rows additionally carry `ally2Vid`, `ally2Dealt`, `ally2Taken`,
  `allyDealt` (total), and `joiningAllies` (count of allies that joined).

## Bars (frozen)

| # | Bar | Threshold |
| --- | --- | --- |
| B1 (PRIMARY) | Second ally joins | Mean joining allies **≥ 1.5** across armed-leg expedition-origin fought meetings with `alliesN ≥ 2` AND `calledHelp` (at least one ally joined). Judged ONLY when n ≥ 3 such meetings on the armed leg; otherwise UNJUDGEABLE and the run is NO-GO (the cap fix cannot be certified on this band). Joining allies = (`allyVid` ? 1 : 0) + (`ally2Vid` ? 1 : 0). Today this mean is exactly 1.0 by construction (one ally max), so ≥ 1.5 means the second slot fires in at least half the joined fights. |
| B2 (SECONDARY) | Damage share up | Judged ONLY when ≥ 3 launched fought meetings carry a captured share on the armed leg. PASS iff their mean share **≥ 0.10** absolute. Share = `mDealt / mHpStart`; a vKill meeting shares at 1.0 by definition. (Same absolute form as the partysize addendum: the trio reference is a single meeting at 8.5% — a second ally that cannot lift a party past a trio's 8.5% has not moved the damage question.) |
| B3 (GUARDRAIL) | Expedition-death price | Expedition deaths armed ≤ control × 1.10 AND total deaths armed ≤ control × 1.10. |
| B4 | Proof green | `scripts/test-fightallycap-b.js` green on the final tip. |
| B5 | Balanced panel (§15) | `scripts/balance-panel.js compare` on the ctl→arm pseudo-panels (intervention flag `FIGHTALLY2` declared), `.md` attached to the evidence file; no uninvestigated regression. |
| Instrument | Recorder clean | All files parse, 8/8 files both legs, 0 instrument errors, every FOUGHT encounter row (rounds > 0 or dealt > 0) that is not a kill carries `mHpStart`. No-contact evades (rounds 0, dealt 0) and vKill rows correctly carry null and are not counted missing. `recMismatch` (post-call recovery vs CONTACTREC's own `rec.mHpStart`) is diagnostic only — a nonzero count is a same-run investigation item, never a verdict gate. |

**Verdict:** GO iff B1 && B3 && B4 && instrument clean && (B2 unjudged || B2 pass)
&& B5 has no uninvestigated regression. A B2 fail is NO-GO with the numbers;
per kill discipline the lever stays HELD (not killed) unless the run
establishes the lever itself is wrong.

## Drift rule

If the armed leg fields a second ally 0 times, the flag never changed behavior,
so the two legs must be trajectory-identical (same seeds, same substrate flags)
— any divergence is an instrument/code defect to investigate, never a lever
effect. (When the second slot fires, trajectories diverge by design and the
rule does not apply.)

## Pre-run scoping (read from the frozen pilot corpora, not from this run)

On the partysize pilot's frozen corpora (`perseed-partysize-b-ctl/` + `-arm/`,
same band, same policy): expedition-origin fought meetings 15 ctl / 16 arm;
ALL carried `alliesN = 2`; `calledHelp` fired in 14/15 ctl and 14/16 arm. So
the B1 population (expedition fought, `alliesN ≥ 2`, `calledHelp`) is expected
at n ≈ 14 per leg — the n ≥ 3 judging floor is comfortably clear of the
expected population, and the unconditional join distribution (0/1/2 joins) is
reported alongside the mean for honesty. This scoping does not prejudge the
result: on the pilot's legs the B1 mean is 1.0 by construction on both legs.

## Wall numbers (reported every run)

National / table / wins, wave 4–5 unlocks, median survival — from the analyzer
(`wall` block) on both legs.
