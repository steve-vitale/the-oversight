# TB retreat-and-refind — PILOT VERDICT: GO (arm sim-tbretreat-b)

Run: fleshout-loop-b-20261105T1611Z (adoption of fleshout-loop-b-20261105T1423Z,
cancelled by the platform 15:57:59Z). Axis: scale-onramp / winnability chain.
Prereg: `evidence/2026-11-05/sim-tbretreat-b-prereg.md` (committed before any
judged sim; G1–G4 binding). Lever: TBRETREAT_RESTORE — a fled TB fight against
an ordinary wild wave-4+ beast leaves the beast wounded on its own tile
instead of deleting it, so the grind can continue without another death.
Branch: sim-tbretreat-b, rebased onto master b60c42454 (commit 49c49f55c).
Corpus: `evidence/2026-11-05/perseed-tbretreat-b/` — 16 files, 8 seeds
99721–99728 × baseline/armed, 150d death-aware, competent-tbretreat-b wrapper
(frozen staypolicy 50/50 trigger, unchanged). Proof
`scripts/test-tbretreat-20261105.js`: 19/19 before the rebase AND after it.
Instrument errors: 0 in all 16 files.

## Adoption correction (coordinator brief vs disk)

The brief said the corpus held 8 files (s99723–s99726, both legs) and
s99721/s99722/s99727/s99728 were missing. Disk on adoption held 11 files:
s99721 and s99722 were already complete (both legs), s99726 baseline only.
The previous worker evidently wrote more before the 15:57:59Z cancellation
than the 16:11Z verification saw. Only 5 files were actually missing and
were run by this adoption: s99726 armed, s99727 baseline + armed, s99728
baseline + armed.

## Corpus validity check (before running new seeds)

- All 11 inherited files parse; `instrumentErrors` empty in every one.
- Determinism spot-check: s99723 baseline re-run on the rebased code
  (same driver, OUTDIR /tmp/tbretreat-detcheck) is byte-identical to the
  inherited file except `anchorCommit` (1967d4b3d6f5 → 49c49f55cb40, which
  changes by design after a rebase). KEEP path taken: the inherited corpus
  was kept and only the 5 missing files were run. No bases were mixed in
  the judged corpus.

## Verdict — pilot GO (all four gates hold)

| Gate | Bar | Result | Holds |
|---|---|---|---|
| G1 retreat survival | fled / trigger-fired wave-4 TB fights ≥ 25% (armed) | 5 exits / 11 trigger fires = **45.5%** | YES |
| G2 re-find within 7d | re-found / retreated beasts ≥ 25% (armed) | 1 / 3 = **33.3%**, gap 1 day | YES — THIN (3 retreated beasts < 4, so per the prereg the verdict rests on G1+G3+G4 + the mechanism check) |
| G3 kill rate not halved | armed wave-4 kill rate ≥ ½ baseline | baseline 1/21 = 4.8%, armed 3/25 = 12.0%, ratio **2.52×** | YES |
| G4 survival not harmed | armed median survival ≥ 0.8× baseline | baseline 63d, armed 51.5d, ratio **0.82×** | YES (barely) |

Analyzer verdict object: `{"g1":{"holds":true},"g2":{"holds":true,"thin":true},
"g3":{"holds":true},"g4":{"holds":true},"go":true}` from
`scripts/tbretreat-analyze-20261105.js <corpus> tbretreat-baseline
tbretreat-armed`. Per the brief, GO means: report GO and STOP — the 12–16
seed confirm is the coordinator's call, not started here.

## Before / after (identical seeds 99721–99728)

- Wave-4 fights: baseline 21 (14 TB + 7 field), armed 25 (21 TB + 4 field).
  Armed fought MORE TB fights because villages lived to re-meet beasts.
- Wave-4 kills (strict same-day matched): baseline 1, armed 3. Kill-log
  (unmatched included): baseline 1, armed 4 — see metric review on the
  fourth, a real kill the strict rule missed.
- TB endings: baseline 14 TB fights → 13 deaths, 0 fled. Armed 21 TB
  fights → 13 deaths, **5 fled**. The 5 flees replaced 5 deaths; TB
  deaths did not fall in count only because armed fought 7 more TB
  fights. Scholar deaths overall: 36 → 34. Field deaths: 2 → 0.
- Damage: median damage fraction identical (0.0480 → 0.0482). The lever
  adds no damage, as the prereg said — it only stops a retreat from
  deleting the wound. Swings attempted per TB fight stayed low (41/14
  baseline, 65/21 armed).
- Trigger diagnostics (armed): 11 fires, 5 exits, 13 flee turns, 0 stuck
  fallbacks, 1 sealed fallback. Staypolicy-a measured 6 exits / 17 firings
  (35%); this band reproduces the same shape (45.5%).
- Mechanism check (the thin-G2 backstop): 5 fled TB fights → 4 with a
  tile origin → 3 restored, fidelity 3/3 (restored HP == min(pre-HP,
  primary end HP) every time). The two non-restores are by design, not
  misses: one fled fight went through the titan/lingering restore path
  (day-112 eulogy, old code owns it), one had no tile origin (day-128
  audit, a pending-live fight with no world monster to keep). The
  restore fired ~always when its conditions held.
- Chain decomposition: TB→TB pairs — baseline 8 pairs, 4 resets; armed
  13 pairs, **0 resets**, 10 continuations, 3 further-wounded. The
  restore kills the reset class outright: a fled fight no longer means
  the next fight of that kind starts fresh. Field→TB lift fidelity:
  baseline 7/9, armed 17/19.
- Re-find detail (armed, 3 retreated beasts): eulogy s99722 day 113,
  restored 528 HP at (4,4) → re-found day 114, gap 1d, TB lift, re-find
  fight ended in death, no kill, 0 later kills. Reunion s99722 day 128,
  restored 1200 HP at (3,4) → never re-found in the 22 days the village
  had left. Reunion s99723 day 48, restored 1141 HP at (3,4) → never
  re-found; the village died day 54. So the chain's payoff — re-find →
  kill — happened 0 times in this pilot.

## Per-seed table

| Seed | Leg | Days | End | W4 fights | W4 kills (matched) | Killers ever | Living killers | Standing |
|---|---|---|---|---|---|---|---|---|
| 99721 | base / armed | 23 / 23 | lost / lost | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 99722 | base / armed | 111 / **150 survived** | lost / survived | 10 / 13 | 1 / 3 | 1 / 2 | 0 / 1 | 199 / 199 |
| 99723 | base / armed | 77 / 54 | lost / lost | 11 / 12 | 0 / 0* | 0 / 1 | 0 / 0 | 145 / 125 |
| 99724 | base / armed | 44 / 44 | lost / lost | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 99725 | base / armed | 49 / 49 | lost / lost | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 99726 | base / armed | 28 / 28 | lost / lost | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 99727 | base / armed | 105 / 105 | lost / lost | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 90 / 90 |
| 99728 | base / armed | 129 / 129 | lost / lost | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 99 / 99 |

\* s99723 armed has a 4th wave-4 kill in the kill log (Xavier vs reunion,
fight day 53, logged day 54) that strict same-day matching scores
unmatched. Counting it, armed is 4/25 = 16.0%.

## Scale-wall numbers (both legs)

Wins 0 / 0, national 0 / 0, table 0 / 0, wave-4 unlocks 2 / 2, wave-4
faced 2 / 2, wave-5 unlocks 0 / 0, wave-5 faced 0 / 0, readiness-5-ready
days 0 / 0, median survival 63d / 51.5d. Only 2 of 8 seeds ever reached
wave 4 on either leg (99722, 99723); the other six died at wave 2–3.
The whole judged corpus rides on two seeds — the GO is real but thin,
and the confirm (fresh band, 12–16 seeds) has to carry the weight.

Telemetry deviation check: ATTEMPTED. `telemetry-check.js` refused the
corpus: "refusing recorder-corpus input: all 16 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs."
No compare was fabricated; wall numbers above are reported directly.
(The scale-wall baseline is itself a winseat-regime file whose note
warns against comparing pre-seat substrates to it, so forcing a compare
would have fired a spurious LOUD in any case.)

Balanced panel (§15): ATTEMPTED, cannot run on this corpus.
`balance-panel.js` runs its own sweep-compare registry children with
registered policies (capable, risk-aware, socialite, winseek) and accepts
no two-corpus comparison and no unregistered probe policy
(competent-tbretreat-b is not in its registry). Running it would re-run
different policies on different seeds and answer nothing about this
arm's before/after. No compare `.md` exists; none is fabricated. The
analyzer's two-leg compare above is the before/after instrument for
this arm.

## Village assessment (plain words)

Two villages in eight ever got far enough to meet a wave-4 beast, and
both stories are the same story: a handful of people throwing themselves
at one monster, one after another, until the village runs out of people.

Seed 99722 is the one that lived. Leo Martin banked the village's first
two wave-4 kills on day 85 (strike, then influencer), then walked into
the eulogy on day 112, hurt it down to 528 of 900, and slipped away at
40% health — the old lingering path kept that wound. He died that same
day out in the wild anyway, which is the part the lever cannot touch:
a retreat saves you from the beast, not from the wild. The next day a
new scholar found the same eulogy at exactly 528, dealt no damage in
four rounds, and slipped away too — this time the new restore kept it,
and the line in the transcript says so plainly: "You slip away — it
stays where you left it, bleeding. You know the ground; you can find it
again." The day after, Sigrun went back with an ally beside her, found
it still at 528, hurt it to 438, and died with her ally. The wound
survived three fights and two deaths. The kill never came. That village
still survived to day 150 — the only survivor in the band — with one
living wave-4 killer at the end, standing 199, one short of the 200 the
fifth wave asks for.

Seed 99723 is the grind with the price tag still attached. Nine scholars
fed themselves to one reunion beast across days 48–53, grinding it from
1200 down to 3 health, and Xavier finally finished it at 3 health on
day 53. The restore's one contribution there was a 1141-health reunion
kept on its tile on day 48; the village died on day 54 before anyone
could go back for it. The other six seeds never met a wave-4 beast at
all — they starved, sickened, or bled out at wave 2–3 between days 23
and 129, exactly alike on both legs (five of the six are byte-identical
in days and standing between baseline and armed, because the lever
never fires before wave 4).

So: the lever does what it says. A retreat no longer erases the wound,
and a village that goes back finds the same hurt beast where it left
it. It does not make the village able to finish the beast — damage per
fight is unchanged, the re-find fight still ended in two deaths, and
no re-find in this pilot ended in a kill. The funnel's next binding
link is still damage and finishing, not the wound surviving.

## Sense-testing (read end to end, seed 99722 armed, days 112–114)

The eulogy sequence reads like people, not counters. Leo hurts the
beast, judges himself beaten at 40% health, and leaves through the
barrier. A stranger the next day meets the same beast at the same
wound, tries nothing — zero swings in four rounds, one rage spent —
and leaves the same way. Sigrun returns the day after with a companion
and dies trying to finish what two people started. The village buries
Leo, then Jason, then Sigrun, one grave after another, and the Codex
turns its own page each time. The restore line is honest and does the
work the prereg asked for: the village knows the beast is still out
there, bleeding, on ground it knows.

One fiction crack, named as a finding (not a verdict input): the generic
barrier-exit line still says "(You left the fight — it melts back into
the wilds.)" on the same day the restore line says the beast stays
bleeding on its tile. Both lines fire on day 113. When the restore
keeps the beast, the barrier line is a lie about it. The barrier line
is engine text, not this arm's — fixing it belongs to a follow-up, but
a player who reads both lines back to back will notice.

## Metric review (§14)

- G3 as a no-harm bar was the honest primary for a retreat lever: the
  lever cannot add damage, and it didn't (damage fraction 0.0480 →
  0.0482). The bar held with room (2.52×), but on 1 vs 3 matched kills
  — the "improvement" is noise on a tiny denominator, not a damage
  claim, and the evidence must not be read as one.
- The 50/50 trigger fired where specified (11 fires, all on the line:
  scholar HP 0.28–0.43, monster HP 0.50–1.00 at fire). Its lateness
  shows up again: 6 of 11 firings did not exit (1 sealed fallback, 5
  died mid-retreat or stayed open — the day-114 re-find fight's trigger
  fired at turn 5 and the fight stayed open to a double death). The
  earlier-line variant is still staypolicy's named follow-up, not this
  arm's.
- 8 seeds / 150d gave only 3 retreated beasts — G2 was thin, as the
  guard anticipated. Six seeds never reached wave 4, so the pilot's
  judged population is really 2 seeds. The confirm needs a band where
  more seeds reach wave 4, or more seeds, or both; a 12–16 seed confirm
  on the same kind of band will still mostly measure villages dying
  before wave 4.
- The strict re-find rule (exact-HP equality) did not exclude any real
  re-meet here: the one re-find matched exactly (528 → 528), and the
  two un-refound beasts simply were never met again. No looser link
  would change any verdict input.
- The day-boundary kill-matching limitation is CONFIRMED real and
  one-sided here: the s99723 armed reunion kill was fought on day 53
  (Xavier, 3 HP, won) but logged on day 54, so strict matching scored
  it unmatched. The ±1-day join should be proposed for the next run:
  with it, armed wave-4 kills are 4/25 = 16.0% instead of 3/25. It
  changes no verdict input (G3 holds either way), but the next arm
  that judges kills on a thin band should not lose a real kill to
  midnight.
- G4 held at 0.82× but the armed median is LOWER (51.5d vs 63d),
  driven by s99723 armed dying at 54d vs 77d baseline — the same seed
  that fought 12 wave-4 TB fights armed vs 11 baseline and banked the
  midnight kill. Survival is not the lever's claim; the bar is no-harm,
  and it passed, but only just. A confirm that lands under 0.8× would
  be a real question, not a rounding error.

## Named next blank

The re-find → kill payoff: 0 of 1 re-find fights killed, and the
restored beasts that were never re-found died with their villages.
The restore makes the grind survivable in principle; nothing in this
pilot shows a village converting a re-find into a kill, because damage
per fight and finishing are unchanged. The next arm is the one
staypolicy already named: damage/survival per round and an earlier
disengage line — or, if the confirm first proves the restore holds at
scale, a follow-up that pairs the restore with the thing that actually
finishes a wounded beast. Also named: the barrier line contradicting
the restore line ("melts back into the wilds" vs "stays where you left
it, bleeding") — a one-line fiction fix for a follow-up, not this arm.

## Findings backlog

- [open] 2026-11-05 — fiction — barrier-exit line "(You left the fight
  — it melts back into the wilds.)" contradicts the TBRETREAT_RESTORE
  say line on the same day when the beast is restored to its tile
  (s99722 armed day 113). (sim-tbretreat-b evidence.)
- [open] 2026-11-05 — measurement — strict same-day kill matching
  loses real kills that span midnight (s99723 armed reunion kill fought
  day 53, logged day 54); propose a ±1-day join for the next run.
  (sim-tbretreat-b evidence.)

## Run notes (adoption)

- Proof 19/19 before rebase and after rebase onto master b60c42454.
- Rebase clean, no conflicts. Master moved 6 commits since the branch
  base 1de41ff6f (brief said 5; the 6th is the gossipcensus recovery
  commit 4309d42a0, evidence-only).
- Heartbeat sim-tbretreat-b succeeded (exit 0) during the run.
- No src/js change beyond the committed lever (game.js TBRETREAT_RESTORE,
  flag-gated, default OFF). No policy change beyond the committed
  wrapper. Nothing to revert: pilot GO, lever stays.
- Confirm NOT started: 12–16 seeds on a fresh band is the
  coordinator's call.
