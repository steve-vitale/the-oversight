# sim-scholarschurn-b — prereg: scholar churn in the wild (diagnostic census)

Run `fleshout-loop-b-20261112T2130Z`, Loop B, arm 3, tracker blank #6.
Instrument-only diagnostic: zero `src/js` changes (this arm measures;
it lands no game change unless a lever emerges with its own proof).

## The question

Pairarming (2026-11-12) found three scholars dying in 19 days on seed
190398 — all "the wild" — and the third death ended the wave-5 pair
because the dead scholar was a veteran. How bad is scholar churn
across the band, where does it happen, and what does each succession
cost? Measure it; name a lever only if the numbers point at one.

## Canon

No dedicated scholar/succession canon doc exists in `docs/` (checked
2026-11-12: no SCHOLAR.md / SUCCESSION.md; CANON.md's table lists
none). The mechanics live in code, read before instrumenting:

- `src/js/ledger.js` `playerDeath(cause)` — the choke point for every
  player death. Registers the death (`player: true`, cause string,
  gear goes on the corpse as a lootable death pack, keepsakes buried),
  picks the successor (highest-trust living roster member), and hands
  the mantle over. If no living candidate remains the village dies out.
- `src/js/engine/state.js` `newScholar(villagerId)` — the scholar
  record template (health 100, abilities [], base stats 5+occupation).
- `src/js/villager-build.js` `mantleBecome(oldId, newId)` — "You
  become that villager" (Steve 2026-10-14): the successor keeps THEIR
  OWN abilities/tracks/XP/skills/knowledge/gear (npcAbilities, npcXp,
  person.items/equipped/stashed); the dead bearer's abilities, XP and
  gear do NOT pass. Integration, slots, Codex, ledger, trust stay
  with the office. Playstyle/practice/passives/stats reset to the
  successor's own body (ledger.js "NEW BODY, NEW RECORD").
- `src/js/game.js:47229` — `'the wild'` is the label for a proven
  wild fight (vs `'the arena'`); the cause string is label-only.

## Base, band, policy, horizon

- **Base:** current master `bd29d8bd7`. The r131 roster-check fix is
  IN master (verified: `ROSTER CHECK` present in `src/js/standing.js`
  on this base) — NO fix-swap, no leg guard. This is the deliberate
  difference from pairarming, which ran on the r9 cut base plus a
  swapped-in fix.
- **Band:** seeds 190391–190398, **intentionally reused** — the same
  band as the r9/r10/pairarming corpora so the census is comparable
  to them. Recorded here before any sim: the reuse is prescribed by
  the run brief for comparability, not a freshness violation (same
  reasoning as the pairarming prereg).
- **Policy:** competent, verbatim (scripts/policies/competent).
- **Horizon:** 150d, death-aware (dead villages stop; +10d tail max)
  — same as pairarming; a reachability question (waves 4–5 window),
  per MEASUREMENT.md §10.

## Primary metrics (REPORTED, not judged — this is a census)

1. **Scholar death rate** per 100 scholar-days, split by location at
   death: WILD (away from Haven: `insideHaven` false at the
   playerDeath call) vs HOME (`insideHaven` true); cross-tabbed by
   cause class (wild-fight / fight / arena / contest / expedition /
   exposure / other). Co-primary per §14c: **villager (non-scholar)
   death rate** per 100 villager-days on the same seeds.
2. **Succession frequency and cost:** successions per seed, scholar
   tenure distribution (days each bearer held the mantle), and
   successor readiness — days from succession until the successor is
   armed again, holds ≥1 ability, and makes their first wave kill;
   scholar-days lived at 0 abilities.
3. **Hold-stranding:** scholar deaths falling on pair-hold /
   deferral-hold days (PA.findHoldBlocks); whether the pair ended
   within 7 days after; whether the dead scholar was a veteran.
4. **Days lost to churn:** summed days-to-armed after each succession
   (horizon-capped), plus scholar-days at 0 abilities.

## Instrument GO bar (validity ONLY — the census numbers are reported, never judged)

- Unattributed scholar deaths **0**: every scholar death has a
  playerDeath-wrap record AND a matching registerDeath row (same day,
  same villagerId); every wrap record matches a registerDeath row.
- Succession coverage **100%**: every scholar death that does not end
  the village names a successor in the post-hook, and the next day's
  snapshot scholarId equals it.
- ScholarId chain consistency **100%**: the daily scholarId changes
  ONLY on recorded succession days (no silent swaps).
- Gear cross-check errors **0** across the band (PA instrument).
- Proof green (`scripts/test-scholarschurn-b.js`) BEFORE any judged sim.
- Analyzer exit 0.

## Sizing probe (pre-pilot substrate check, §14b — run on the pairarming corpus, not new sims)

- Contact: scholar deaths occur on all 8 seeds (prev-day rule:
  6, 11, 10, 3, 12, 8, 8, 8 = 66 across the band).
- **Samples are NOT ground truth for scholar deaths** (found in the
  sizing probe, pre-registered here): the harness `samples.deaths`
  `player: true` rows count 91 on the band vs 66 by the prev-day
  regDeath rule — the tele live-capture double-fires per death
  (e.g. seed 190391 d74: 5 player rows, 1 scholar death). The
  same-day snapshot rule UNDERCOUNTS the other way (24): succession
  happens before the daily snapshot, so the dead scholar's id is
  already gone by snapshot time (this is why pairarming's d131/d139/
  d150 deaths only show under the prev-day rule). The census
  therefore wraps `Game.playerDeath` directly — the wrap records the
  scholar id, cause, and location AT THE CALL, before succession —
  and cross-checks against vetfirst regDeath rows. A wrap record with
  no regDeath match (or vice versa) is an instrument error, never
  silently dropped.
- Pool sizing: ~66 scholar deaths expected on the band — an order of
  magnitude above the bar's needs (the bar is 0 unattributed, not a
  rate threshold).

## Method

- Driver (`scripts/scholarschurn-driver-20261112.js`): adapted from
  the pairarming driver — same vetfirst install (regDeaths, daily
  snapshots, waveKillLog), same PA gear snapshot in the same finally
  block, PLUS the scholar instrument
  (`scripts/scholarschurn-instrument-20261112.js`): a `playerDeath`
  wrap (pre: dead scholar's id/name/cause/location/hp/abilities/
  veteran/pellet/reactor; post: successor id/name/trust/was-veteran/
  abilities, over/villageLost) and a daily scholar snapshot
  (scholarId, abilities, armed/armorP/veteran from PA, insideHaven,
  insideTent, camp, roster size, ready5, capped standing, peak wave).
  Record-only: no RNG consumed, no state mutated. Per-seed JSON to
  `evidence/2026-11-12/perseed-scholarschurn-b/`, refuses to
  overwrite.
- Analyzer (`scripts/scholarschurn-analyze-20261112.js`): computes
  the census tables + GO bar; writes
  `scholarschurn-b-summary.json`; exit 0 iff complete + 0
  unattributed + 100% succession coverage + 0 instrument errors.
- Proof (`scripts/test-scholarschurn-b.js`): instrument legs
  (playerDeath wrap pre/post incl. village-lost no-successor case;
  cause/location classification incl. the 'the wild' label;
  succession diff incl. same-day double succession; scholarId chain;
  days-to-armed/ability/kill recovery; hold-stranding; GO-bar
  table; corpus completeness).

## Balanced panels (§15) and telemetry

- No before/after comparison applies: this is a diagnostic census
  with no lever change, so no `balance-panel.js` compare is built.
  Wall numbers are compared manually against the pairarming corpus
  table (same band, same policy, same horizon; different base — the
  r9 base + fix-swap vs current master — so drift is reported as a
  table, never judged as a regression).
- The loop body's telemetry deviation check is attempted on the
  census corpus and its outcome recorded (pairarming/r10/stallcut57
  were refused as recorder-corpus input; the same refusal class is
  expected here).

## Verdict shape

GO/NO-GO is the instrument bar above. The census findings are
reported with a lever named ONLY if the numbers point at one (with
mechanism + numbers); otherwise the evidence file says plainly no
lever emerged. Convergence state: diagnostic census — n/a (no lever
tuned).
