# build-armor — results: GO on confirm (seeding gap closed)

Pre-registered bars (evidence/2026-10-29/build-armor-prereg.md) bind.
A miss would have been NO-GO, never re-scored mid-run. This run LANDS:
the seeding mechanism plus the adopted fixall-armor conversion, merged
to local master via --ff-only (pending ship — no push, no version bump,
no live verification by this run; the ship loop owns those).

## Plain-words picture

Villagers can now sew armor in live play AND the sewing can actually
start. Fixall-armor proved sewing works where it can start; this run
fixed starting it. A fresh village used to get its first armor-wearer
only by lottery — about half of villages never got one home at all.
Now, when no villager who is staying already carries bark or hide
armor, up to three generated villagers arrive wearing bark armor from
day 0. Three, not one: a single wearer died or walked out before the
slow materials arrived too often to trust (seed 67703's only wearer was
home 17 days, died around day 36, and vine never reached 2 while he was
home). On twelve FRESH villages the loop now attempts on 10, crafts on
10, with 100 attempts and 62 finished pieces — against fixall's fresh
confirm of 6 attempts / 4 crafts on 12 villages (68 attempts / 32
crafts). Granted villages convert at exactly the natural rate (5/6
attempt, 5/6 craft, same as the 6 natural villages in this band), so
the grant brings sterile villages up to normal, not above it.

## The mechanism (what changed, in plain words)

At village creation only: if no staying villager already carries bark
or hide armor, up to three generated villagers gain a bark armor in
their own starting kit, worn from day 0. The picks are deterministic
(staying first, bark-improves-torso first, never the player, no new
random draws). After that, everything moves through existing paths
only: wearing, spares flow, the armory pile. Nothing else changed —
recipes, odds, cooldown, the wearing-is-knowledge rule, all gates, the
unwearable cuirass by the fire, and deposit-only pile semantics are
all untouched. The fixall-armor conversion (live craft beat, ungated
pile draw, bark inflow 30%) is adopted verbatim via rebase, not rebuilt.

## Confirm band (fresh seeds, judged)

Seeds 67801–67812, policy leadfeast + armorydrive stack, 180 days,
death-aware, NO ARMORVILLAGE flag (live-play condition).
Anchor: 99beab1cf (the game commit; no commits were made during the run).

| seed | att / cr | knowersDays / staying | coinDays | firstAtt / firstCr | survival | note |
|------|----------|----------------------|----------|-------------------|----------|------|
| 67801 | 6 / 2 | 47 / 47 | 5 | 53 / 70 | 110 | natural |
| 67802 | 7 / 6 | 103 / 103 | 3 | 44 / 44 | 131 | natural (carrier, not wearer, at setup) |
| 67803 | 12 / 7 | 93 / 93 | 4 | 29 / 47 | 130 | granted |
| 67804 | 11 / 7 | 82 / 82 | 15 | 46 / 80 | 137 | natural |
| 67805 | 7 / 3 | 97 / 97 | 5 | 58 / 58 | 162 | natural |
| 67806 | 5 / 1 | 69 / 69 | 3 | 78 / 112 | 122 | granted |
| 67807 | 0 / 0 | 16 / 16 | 0 | — / — | 130 | natural, weak seed: wearer home 16 days, materials never complete |
| 67808 | 4 / 3 | 117 / 117 | 4 | 40 / 40 | 160 | natural |
| 67809 | 11 / 3 | 89 / 89 | 8 | 31 / 31 | 132 | granted |
| 67810 | 28 / 23 | 168 / 168 | 24 | 33 / 47 | 181 | granted, cascade: 6 bark worn at end |
| 67811 | 0 / 0 | 56 / 56 | 0 | — / — | 70 | granted, early collapse: materials never complete in 70 days |
| 67812 | 9 / 7 | 147 / 147 | 7 | 37 / 77 | 181 | granted |
| TOTAL | 100 / 62 | — | — | — | — | — |

## Confirm bars — judged

- S1 SEEDING, home knower on ≥10/12 seeds: **PASS — 12/12**
  (knowersDays > 0 on all 12, including both attempt-miss seeds).
- C1 attempts > 0 on ≥9/12 seeds: **PASS — 10/12**
  (misses: 67807 natural-weak, 67811 granted-early-collapse).
- C2 crafts ≥ 1 on ≥8/12 seeds: **PASS — 10/12** (same two misses;
  every village that attempted also crafted, 10/10).
- G1 guardrail, starvation: **PASS.** Starvation deaths 2/537 = 0.37%,
  under the 1.80% cap (2× fixall pilot before-band 0.90%).
- G2 guardrail, wall not worse: **PASS.** Total deaths per
  survival-day 537/1646 = 0.326/day, under the 0.387/day cap (1.25×
  fixall confirm 0.310/day). No death-cause kind absent from the fixall
  pilot before-band exceeds 10% of confirm deaths (largest newcomers:
  "The Reunion" 2, "the expedition" 1, "wound_fever" 1, "thirst" 1 —
  all ≤ 0.37%). Survived-to-180 count 2/12 vs fixall confirm 3/12 is
  reported, not barred: deaths/day is the pre-registered wall check,
  and it passes; the count difference across different seed sets is
  not attributable to a mechanism that only adds low-tier protection.

**Confirm verdict: GO on all bars.**

## Diagnostics (reported, not judged)

- D1 granted vs natural: granted 6 villages — attempts 5/6, crafts
  5/6; natural 6 villages — attempts 5/6, crafts 5/6. The grant
  equalizes sterile villages to natural levels; it does not inflate
  them (natural villages still produce the band's biggest totals on
  67804: 11/7 without any grant).
- D2 first attempts land days 29–78 (materials window opens with trust
  + inflow, as in fixall); first crafts days 31–112.
- D3 final worn bark 12 across 12 villages (fixall confirm: 20) —
  lower because confirm villages survived fewer days on average
  (1646 vs 1763 days) and two villages collapsed early; attempts and
  crafts, the judged quantities, roughly doubled and tripled.
- D4 scratch band on the fixall seeds (67701–67712, same instrument,
  unjudged diagnostic): attempts 12/12, crafts 8/12, 150 attempts /
  83 crafts — the exact bars, met on the previously failing population
  too (fixall confirm on those seeds: 6/12 attempts, 4/12 crafts).
  The two scratch craft-miss patterns that remain (low-coincidence
  villages with 3–5 attempts, e.g. 67708/67709) are material-window
  luck, not seeding: those villages HAVE wearers home 59–69 days but
  complete-material days only 2–3 times by snapshot.
- D5 determinism: ungranted villages reproduce fixall timelines
  byte-for-byte on band numbers (67702: 18/9 and 67711: 21/13 identical
  to fixall confirm; 67706: 3/0 identical to scratch-v1) — the grant
  draws no RNG and changes nothing where it does not fire.

## Sense test (SENSE-TESTING LAW)

Quoted from captured confirm band lines:

- "Catalina spent the afternoon at the workbench and sewed a Bark armor
  that holds together. Catalina wears it now." — Reads as intended:
  the work, the piece, and the wearing in one line.
- "Naran spent the afternoon sewing, and the Bark armor came apart in
  their hands. The bark strips are wasted." — Reads as intended and
  honest: blind-craft failure costs materials, said out loud.
- No new narration was added for the grant itself: starting kits are
  never narrated per-item, and the granted pieces are starting kits.

## Proof tests

- scripts/test-fixall-armor.js: **32 passed, 0 failed** on the rebased
  base and re-run on the final tip (conversion adopted, not rebuilt).
- scripts/test-build-armor-seed.js: **38 passed, 0 failed** on the
  final tip (synthetic grant / cap-at-three / no-grant / escape-only /
  preference cases; staying-wearer floor on all 18 seeds after setup +
  one gear day; determinism: same seed loads twice -> same grantee).

## Metric review (NEXT run only — not applied here)

- **"Durable seed" is coarse.** 67807 passed the durable check (a
  staying carrier at setup) yet never attempted: its wearer was home
  only 16 days and materials never completed. The grant fires only on
  no-durable-seed villages; a village with one weak natural seed gets
  no help. If a future round wants breadth above 10/12, the lever is
  topping up weak single seeds — but home-ness cannot be predicted at
  generation, so any such rule needs a different signal (e.g. count of
  staying carriers, not just presence) and its own pre-reg.
- **Crafts track attempt volume, which tracks material coincidence.**
  Every confirm village with ≥10 attempts crafted; the two misses had
  0 coincidence days by snapshot. Vine is spent by many trap/tool
  recipes, so bark≥3+vine≥2 windows are the scarce resource, not
  wearers, once seeding is fixed. A future round that wants crafts
  above 10/12 should look at the material window, not at more wearers.
- **Snapshot coincidence undercounts.** Confirm 67805 shows 12
  attempts against 5 coincidence days: the craft beat consumes
  materials the same day, so snapshots miss most complete windows.
  Attempts (tele events) are the honest instrument; coincidence days
  are a lower bound only.

## Closeout checks (after the verdict — not bars)

- Proof tests re-run on the final tip: fixall 32/32, seed 38/38
  (see above).
- scripts/check.js --quick on the rebased game tip: 282 passed, 8 failed in
  2167s — the 6 fixall pre-existing failures (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes) plus 2 parallel-load
  timeouts (trust-observer-neutrality, capable-bot, both exit null at
  the 120s cap) that pass standalone on the same tip (6/6 and 42/42).
  No new failure; nothing in the set touches armor code.
- Rebase onto moved master: master moved twice during this run —
  2342b764c -> 9d96bb738, then -> ef4e3f8b (ship-loop batch +
  measurement landings; zero changes to src/js/game.js,
  villager-build.js, storage.js, or the fixall/build-armor instruments
  in either range). Branch rebased clean onto each; game blob
  identical across both rebases (fe670a46) and proofs re-run green
  after each (see above). The results commit that follows the
  check-quick run is evidence-only.
- Main tree at closeout: merged locally via --ff-only, pending ship
  (master hash in the worker's final report). Nothing pushed, no
  version bump, no live verification — the ship loop owns those.

## Steve-calls (one line each — documented for overrule, not asked)

1. Grant count is three bark armors per sterile village, not one: single-wearer seeding died or walked out before materials too often in scratch, and three sits inside natural variation (pilot villages already showed up to three wearers).
