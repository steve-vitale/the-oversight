# Journey — crisis leg r28 (lane B): is the schism reachable?

**Pre-registration.** Leg question (named next from r25): r25 found schism fired on 0/4
competent (oracleV2) seeds. Is the schism crisis reachable at all? It fires only on
exile — moot verdict 'exile' / freeloader vote-out via `removeVillager(vid,'exiled')`,
or `exilePlayer('moot')` when the moot casts the player out. Interesting finding bar:
schism fires ≥1/4 hot seeds (reachable), or 0/4 (blank: unfireable beat).
Seeds: 7, 42, 99, 424242 (continuity with r25). Two hot arms: larcenyLeaning
(theft pressure) and pantry-drain (new policy: ~3500 kcal/day pantry takes, zero
gives — the documented exile-producing regime). Horizon: 120d death-aware (+10d tail).
Metrics: schismFires (bound: any >0 = reachable); moot firings; exile count;
case resolutions by path.

## Verdict: REACHABLE — 1/4 on the drain arm, via the freeloader vote

| arm | seeds | schism | exiles | cases |
|---|---|---|---|---|
| competent (r25) | 4 | 0 | 0 | — |
| larcenyLeaning (theft) | 7/42/99/424242 | 0 | 0 | 51 (17 acquitted, 8 weregild, 6 accused_died, 2 case-path schism, 1 cold_war, 17 open at village death) |
| pantry-drain (3500/d) | 7/42/99/424242 | **1** (seed 7, day 16) | 1 (player, freeloader vote 11-0) | 2 (seed 42, NPC-NPC ambush → cold_war) |

Seed 7 drain: freeloader clock hit stage 3 → vote "Hands: 11 for exile, 0 against."
→ `exilePlayer('moot')` → `fireCrisis('schism', {name:'You'})` → the beat fires:
"◈ CRISIS — THE SCHISM. You are cast out. The village chose, and the choosing cut
something that won't heal clean. The fire keeps burning without you." Machinery
proven end-to-end; the fiction lands.

The other 3 drain seeds fizzled honestly: the 3000/day rate bar needs ~12 sustained
days, but the pantry can't sustain 3500/day that long — seed 99 hit takeRate7=2957
(43 short of the bar), reached freeload stage 2 (warning), then the rate collapsed
and the "good stretch clears the pattern" reset fired. Seed 424242 similar
(2629, stage 2, reset). The drain then starves the village — all 4 drain villages
and all 4 larceny villages ended village-lost (violence/starvation spirals).

## What the investigation taught (tuning notes, no changes made)

- The r6-era cumulative-4000 exile path is retired: `theftConfrontation` now takes
  THIS take (single-take bar: ≥4000 or half the pantry) or the takeHist rate bar
  (≥3000/day). Communal meals are deliberately excluded from takeHist (r8) — so the
  only player route to a drain-exile is sustained deliberate `takeFromPantry` hauls.
- `takeFromPantry` requires `insideHaven` — the policy must `enterBuilding()` first;
  end-of-day policies otherwise find the pantry locked (access='none').
- The moot-conviction route produced 0 exiles in 51 hot cases: theft needs
  avgBelief < -40 (code comment: "almost never"), murder needs < -5 but murder
  charges are rare (1 NPC-NPC case in 4 runs, acquitted). The case-path 'schism'
  (weak conviction) does NOT fire the crisis — only the 'exile' path does.
- Design read: schism is the crime-path crisis and the endgame deed gate (3+ of 6)
  is reachable without it (r25: 3-4 on competent seeds), so its rarity doesn't break
  winnability. Whether the freeloader bar (3000/day × 12d) is tuned right for the
  *intended* population is a Steve/balance call — not changed here.

## The blank found + fixed: the exile refrain was a verbatim filler loop

Transcript (seed 7 drain, days 17-24): `returnToVillage()` said the identical
"You walk the old paths to the fire. Nobody meets your eyes..." paragraph on EVERY
return — 8 identical days. The cold shoulder should be silence, not a nag.

**Fix** (`src/js/game.js` returnToVillage, `src/js/betrayal.js` exilePlayer ×3):
`s.exileReturnCount` (reset on every fresh exile): 1st return = full original line
(pantry closed + amends path named); 2nd = short variant ("The old paths, the same
fire, the same averted eyes. Still exile. The way back hasn't changed: carry
something worth having."); 3rd-5th = silence; 6th/9th/... = short reminder
("Nobody meets your eyes. You know the way by now."). The `joinedVillage` estranged
line has the same verbatim shape — noted, not changed (out of leg scope).

**Proof:** `scripts/test-crisis-exile-refrain-20261019.js` — RED 1/8 on pristine,
GREEN 8/8 after fix. Post-fix pilot re-run reproduces the seed-7 schism with the
new variant firing on day 18.

## People check (sense-testing)

The schism sequence reads as people: d11 Olivia's warning ("We all eat from the same
pot. You've been taking more than you bring for a while now. That can't continue —
the village will decide.") names the grievance and the consequence; the 11-0 vote
is stark; the exile lines name concrete losses (pantry, book, membership). The
post-exile refrain was the one robotic element — fixed above. Also noted (not leg
scope): "Cheryl doesn't bother arguing anymore..." repeated verbatim 3× (d14/18/24)
— leadership beat, social lane's.

## Village assessment

Seed 7 (drain): 12 alive at exile (d16), then the exiled scholar played on as a
drifter while Haven bled out to 0 by d112 (village-lost, r25's extinction fix ends
it honestly). Seeds 42/99/424242 (drain) and all larceny seeds: villages died of
violence/starvation spirals before any exile — the hot policies are village-lethal,
which is itself honest (a thief/parasite destabilizes the commons).

## Regressions

- `scripts/test-crisis-20261009.js`: 18/18 green.
- `scripts/test-betrayal.js`: 79/1 — the 1 is pre-existing ("no strangers before notability", same on pristine).
- `scripts/test-justice.js`: 61/61 green.
- `scripts/test-break-social-r11-exile.js`: 2 failures (T3, H2b) — pre-existing on pristine main, unrelated (feast machinery).
- `node scripts/check.js --quick`: 96 passed, 1 failed in 417s — the 1 is the known pre-existing sprites failure (same as r19 baseline; unrelated to this change).

## Telemetry

Baseline `telemetry-baselines/crisis.json` tracks combat metrics — untouched by a
narration fix. The pilot's schism instrument is new (schismFires on drain seeds);
no baseline roll (deviation check N/A — first measurement of this instrument).

## Metric review

The pre-registered question is answered: schism is reachable (1/4 drain). The metric
proved sound. Revision for the next crisis run: the moot-conviction exile route
remains unproven (0/51) — a murder-spree policy could test whether avgBelief < -5
ever bites, if the lane wants to close that loop.

## Reachable / fun / winnable (crisis leg)

Reachable: yes — schism fires through the freeloader vote with full narration.
Fun: the confrontation → warning → vote → exile → crisis arc reads as a real social
consequence (theft allowed, socially punished — Steve's rule, working as designed).
Winnable: the deed gate doesn't need schism; criminal play pays the honest price.

## Files

- Fix: `src/js/game.js` (returnToVillage refrain), `src/js/betrayal.js` (exileReturnCount reset ×3)
- Proof: `scripts/test-crisis-exile-refrain-20261019.js` (8/8 GREEN)
- Instruments: `scripts/pilot-crisis-schism-20261019.js`, `scripts/policies/pantry-drain.js`
- Per-seed records: /tmp/schism-drain-{7,42,99,424242}.json, /tmp/schism-larceny-{7,42,99,424242}.json
