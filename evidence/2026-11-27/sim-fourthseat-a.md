# sim-fourthseat-a — EVIDENCE (DIAG — recorder only)

**Arm:** sim-fourthseat-a · **Loop A run:** fleshout-20261128T0015Z · **Branch:** `sim-fourthseat-a`
**Prereg:** this file's §0, frozen 2026-11-28 ~01:00 UTC, before any judged sim.
**Type:** DIAG (instruments + evidence only — no game-code or policy change).
**Base at prereg:** 4504aa4d4 (worktree HEAD).
**Corpus:** `evidence/2026-11-27/perseed-fourthseat-a/` (8 per-seed JSONs).
**Analysis:** `evidence/2026-11-27/fourthseat-a-analysis.json`.

## §0. Pre-registration (frozen before any judged sim)

**Question** (from sim-partydmg-a §8.3, finding #2574): why does the 4th
party seat never appear in wave-4 fights? On the partydmg band (22 fought
expedition wave-4 fights) every fight had exactly 3 fighters — damage
share lead 52.4% / ally1 20.9% / ally2 26.7% / ally3 0 — but that band ran
on a flagged substrate (FIGHTALLY2=1, PARTYSIZE4=1, VETREENGAGE=1,
SENSEEXPED=1). This arm asks the same question on **plain master, no env
flags**, and instruments every layer that could cap the seat: recruitment
(does a 4th companion even exist?), sense (does `villagerFightAllies`
ever return a 3rd id?), engine (does `fieldFight` ever take a 3rd ally?),
and call-in (does the shout ladder ever reach a 3rd join?).

**Primary metric (instrument validity):** classify EVERY fought wave-4
`fieldFight` meeting on the 8-seed band — party-size distribution,
per-seat arrival round + damage, and a named blocker for the missing
4th seat on each seed.

| Frozen bar | Bar | Measured |
|---|---|---|
| Fought wave-4 meetings (pool floor) | ≥ 8 | TBD |
| Classification coverage (fought wave-4 meetings classified) | 1.000, 0 unclassified | TBD |
| Per-seat damage reconciliation (seat dealt sums to `mDealt`) | residual 0 on every fought fight | TBD |
| Arrival-round consistency (every joined seat has a known arrival round) | 0 unknown | TBD |
| Instrument errors | 0 | TBD |

**Secondaries:** (a) does a 4th companion ever exist in these villages
(max launch party size; max expedition companions at any fight; max
`winPlan.party` length); (b) how often is the party capped by
recruitment vs by call-in (blocker-layer shares); (c) the sense ledger —
`villagerFightAllies` return-length distribution in the wild.

**Band:** seeds **112201–112208** (fresh — verified before the prereg:
word-boundary grep over all `evidence/*/sim-*-prereg.md` names them in no
prereg — partydmg-a's prereg §6 line 217 already records the fallback
112201–112208 as unused — no evidence filename contains them, and
`sim-findings.md` contains none; no dedicated forbidden/contaminated band
list exists in the goal hidden_files). **Horizon:** 150d death-aware
(reachability lever, waves 4–5; partydmg's band unlocked wave 4 on 8/8
seeds by 150d). **Policy:** competent verbatim, single leg. **Flags:**
NONE — plain master. The driver loud-stops if any of
VETREENGAGE / PARTYSIZE4 / FIGHTALLY2 / ALLYSLOT3 / SENSEEXPED /
FLEEREPAIR2 / DMGPIN / PINQUAD is set, so the corpus cannot be mislabeled
as a plain-master baseline. This corpus also serves as the determinism
cross-check for the sibling arms' baselines: per-seed fought wave-4
counts are recorded for the coordinator to compare.

**Judged population:** fought wave-4 `fieldFight` meetings, ALL origins
(expedition / world-tick / patrol / aid / other), where fought means
rounds ≥ 1. Wave-5 meetings are recorded in the same corpus and reported
as context, not judged. Evades (0 rounds) are counted, not classified
as fights. The scholar's own grid fights (`tbFight`) use a different
seat system (grid placement, party.js) and are out of scope for the seat
classification; if the scholar ever leads a `fieldFight`, the row records
`partyMembers` / `partyCap` at entry.

**Blocker taxonomy (frozen, first match wins):**
- `no-4th-companion` — no 4th companion exists at fight time: expedition
  companions sharing the lead's target < 3 AND `winPlan.party` < 3 AND no
  pinned quad of 3. (Recruitment / launch cap binds first.)
- `sense-cap-2` — a 4th companion exists, but the sense at fight time
  returned < 3 ids (`villagerFightAllies` caps at 2 on plain master).
- `call-site-cap` — the sense returned 3 but the caller passed < 3
  `allyVids` into `fieldFight`. (Should not occur; a loud finding if it does.)
- `engine-slice-2` — 3 `allyVids` passed but the engine sliced to 2
  (ALLYSLOT3 off).
- `fight-ended-first` — 3 allies were available to the engine but the
  fight ended (flee / death / kill) before the 3rd shout could fire.
- `call-in-never-reached` — 3rd seat open and fight long enough, but the
  shout ladder never called the 3rd ally.
- `unclassified` — none of the above explains the row (fails the GO bar).

**Seats:** seat 1 = lead, seat 2 = ally1 (`allyVid`), seat 3 = ally2
(`ally2Vid`), seat 4 = ally3 (`ally3Vid`). Arrival round: door join = 0
(pre-round), shout join = `rec.shoutRound` / `shout2Round` /
`shout3Round`, cross-checked against the `R<n>:`-prefixed "charges in"
log lines. Per-seat damage: lead = `mDealt - allyDealt`; ally1 =
`allyDealt - ally2Dealt - ally3Dealt`; ally2 = `ally2Dealt`; ally3 =
`ally3Dealt` (the engine feeds each ally's damage into the shared
`allyDealt` total as well as its own tally — fieldFights.js:2200,
2683, 2723, 2729).

**Pre-pilot substrate checklist (§14b):** (1) Contact — wave-4 field
fights occur on plain master (partydmg band: 38 wave-4+ meetings, 22
fought; the engine stages them without flags). (2) Pool sizing — floor
8 vs an expected ~20 fought meetings. (3) Verb existence — no new verb
needed; this is a recorder, not a lever. (4) Horizon fit — 150d
contains wave-4 unlocks on 8/8 partydmg seeds.

**Code facts to be VERIFIED by the corpus, not assumed:** sense caps at
2 off-mode (party-wiring.js — 3rd id only with ALLYSLOT3=1 AND
launch.length ≥ 3); engine slices `allyVids` to 2 off-mode and gates
the 2nd/3rd door joins and shouts on FIGHTALLY2=1 / ALLYSLOT3=1
(fieldFights.js:1358, 1395, 1410, 3022, 3058, 3081); launch picks one
companion by default, a 2nd only with VETREENGAGE=1, a 3rd only with
PARTYSIZE4=1 (villager-brain.js:196–340). The corpus must show these
in live fights, not cite them.

**Canon:** no canon doc covers the 4th party seat in wave-4 fights.
PARTY.md covers the scholar's party cap (3 → 4 day 14 → 5 day 30) and
that party members auto-join fights; MONSTER-WAVES.md covers wave-4
bands and gates. The seat caps live in code comments citing findings
(#2496, #2515, #2572, #2583, #2619), not canon — if the corpus shows a
cap the code comments misdescribe, the evidence file says so.

**Single leg, no §15 panel:** a single-leg diagnostic — there is no
before/after pair to compare, so no balanced panel is fabricated. The
frozen bars above are the judge. **No game-code or policy change lands
from this arm.**

**Convergence state:** TBD (diagnostic; `converging | converged |
parked | killed-at-pilot` per §12 — a DIAG-GO/NO-GO verdict is recorded
here at the end).

## §1. Results — TBD (corpus not yet run)

## §2. Wall numbers (scale-onramp axis) — TBD

## §3. Sense-testing — TBD

## §4. Metric review — TBD

## §5. Instrument notes — TBD

## §6. Next arm — TBD

## §7. Village assessment (plain words) — TBD
