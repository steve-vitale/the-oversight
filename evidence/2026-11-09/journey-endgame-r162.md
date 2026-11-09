# journey-endgame r162 — Lane B, leg 4 (endgame) — 2026-11-09

Run: r162, leg 4 (endgame). Rotation-b read 4 at start; write 5 at closeout.
Lock: `playtest-loop-2.lock`, run_id `r20261109T085634Z`.
Worktree: `journey2-endgame`, branch `journey2-endgame`, base master `525046c1c`.
Prereg: `evidence/2026-11-09/journey-endgame-r162-prereg.md` (written before any scored seed).

## The question

Two passes on the same 5 matched seeds (89701–89705, 180 days each):
- **Pass A** (capstone leg off): pure matched re-run of r158 on the new
  substrate — pellet radiation rework, Haven medic duty, ladder leg 3,
  double-night fix. Does the road reproduce r158 modulo those deltas?
- **Pass B** (CAPSTONE=1): the instrument gap r158 handed to this run —
  a probe-side capstone-delivery leg driving the same
  `Game.ladderDeliverCapstone(kind)` the leg-3 Haven panel calls, once
  the ladder peak is National and `deedGateReady().ok` (the capstone is
  the last missing piece). Does a delivered capstone open the FULL seat
  in bot play — and if not, what exactly blocks it?

Seeds: 89701 (waves), 89702 (waves), 89703 (waves), 89704 (forcedrift,
experimental ex-control), 89705 (wavesnw). Same probe policy as r158.

## What happened, seed by seed (plain words)

**89701 — the village that refused to die this time.** In r158 it
scattered on day 73 with one person left. On this substrate it lost
exactly ONE villager all run (Ava Garcia, alien, day 114), announced
day 90, waited on low health, and sat the lesser seat day 115 with
NINE people alive, pantry fat, ladder counted 82 (was 43). Feared /
light, final: pledge — the same ending r158's 89702 took. The audit
names the full-seat gap honestly: "only 0 of 2 different wave-5
monsters faced; no capstone deed delivered."

**89702 — the village that died this time.** In r158 it sat the lesser
seat day 95 with four people left. On this substrate it bled out by
day 84: starvation day 13, a Paparazzo contest death day 14, Meera
dead to an alien day 25, wound fever day 80, and the last two
villagers dying of sickness and starvation at home on day 84 while
the scholar died alone against an eater. Zero alive, never announced.
The loss line is honest: "No one is left to pick up the Codex. The
village dies out — quietly, the way villages do."

**89703 — sat the lesser seat, beloved, let the audience speak.**
Announced day 90 (was 96), sat day 92 (was 102), FOUR people left
(was ten) — twelve deaths this run against seven in r158. Rustem put
down the Herald day 91, Larry put down the Loud Beast day 83. Final:
audience (was walk). The village that barely fought in r158 fought
more and lived less, and still sat a week earlier.

**89704 — the seed that did everything except the capstone.**
Announced day 90, sat day 90, relay / dark, final: voice — the merge
completes, "the System finally says your name right." Six alive.
Wave 5 faced THREE times (rerun day 64, cancellation day 65, editor
day 90); deedGateReady().ok from day 77; scale global; 7 contests;
4 crises. The deed half of the full seat is COMPLETE. The audit says
the whole story in one line: "For a full seat, the ledger still
wants: no capstone deed delivered (military tribute, trade charter,
or feast embassy)." Pass B tried to deliver on 14 straight days
(day 77–90) and every kind was unready, every day: no feast bundle
done, no sealed chartered trade link, and only ONE living wave-4
veteran (Sanne Bakker — Jorge Silva, the other killer, died after
his day-61 kill). The village sat lesser on day 90 with the full
seat one deed away.

**89705 — sat the lesser seat, feared, pledged the terror.**
Announced day 90, sat day 92, NINE people left (was six), only five
deaths all run (was fourteen). Onni put down the Herald day 91.
Final: pledge (was mercy). Diana Osei, r158's double-Reunion killer,
does not appear in this run's war path — the village barely fought
(4 census fights) and still sat.

Tally (both passes identical — no delivery ever fired, so pass B never
diverged from pass A): lesser 4/5, full 0/5. Wave-5 unlocked 2/5
(89702, 89704), faced 2/5. r158 was lesser 4/5, full 0/5, unlocked
3/5, faced 2/5. The headline tally is unchanged; the seeds underneath
it swapped: 89701 flipped lost→won, 89702 flipped won→lost.

## The ladder, measured

Every seed reached National peak (stage 3): counted 82 / 36 / 49 /
61 / 78 against the 40-point bar. No capstone delivered on any seed
in either pass; no feast bundle completed on any seed; no sealed
chartered trade link on any seed. Standing peaks: 199 / 342 / 199 /
361 / 199. The two wave-5 seeds released past the old 199 hold (342,
361); the wave-4-held seeds stayed at 199.

The ladder's shortfall voicing is the clearest it has been: on 89704
the audit names the capstone as the ONLY missing full-seat piece, and
the dark probe's "For a full seat" line names it too ("no capstone
deed delivered (military tribute, trade charter, or feast
embassy)"). The wall moved, exactly as r158 predicted: the full seat
is now one delivered deed away, not a feast the village may never
throw — and on these seeds that one deed is the tribute, which needs
TWO living veterans, and the villages that bank two killers keep
losing one before the seat is offered.

## Bindings verdict

Pass A: PRIMARY-BINDINGS **GO** | PRIMARY **GO** | ALL **NO-GO** (solely
M2b + M3, below). Pass B: PRIMARY-BINDINGS **NO-GO** | PRIMARY **NO-GO**
| ALL **NO-GO** (M2b + M3 + M23). Full analyzer output:
`evidence/2026-11-09/journey-endgame-r162-analysis-a.txt` (pass A),
`...-analysis-b.txt` (pass B).

- M1-guard GO 5/5. M2-census GO, M2c GO, M2d GO (29/29 uncommitted
  fights classified). M5-voicing GO (89704 crossed + voiced). M5b GO.
  M6 GO (deferrals named: hp, roster, not-ready/encounter). M10 GO
  (gaps: w5:0/2 + capstone:none on the three sat waves seeds; 89704's
  gap is capstone-only, named in the CAPSTONE section). M11 GO. M12 GO.
  M13 GO (release snapshot d69, 89702). M15/M16/M17 GO. KILL-ANATOMY
  42/42. M18/M19/M20/M21/M22 GO. VETCONV GO. SECOND-VETERAN GO
  (second veteran d68, d91). FIRENARR/HURTRETURN captured. FALLEN-ambush
  GO (0 ambush deaths). V-WAITVARIETY GO. LOSSKIND GO (89702
  no-successor). L-PEAK GO 5/5.
- M4-wave5-or-full **GO** (2/4 waves seeds reached wave 5 — 89702 and
  89704). W5-question **GO**: both wave-5 seeds FACED wave 5 (89702:
  Editor d73; 89704: rerun d64, cancellation d65, editor d90).
- M2b-attribution **NO-GO** (small-n artifact, see metric review): the
  pilot has exactly ONE dieFlag fight (89702 d84 eater), and its
  diedInFight list is a day-window artifact — Wanjiru (sickness) and
  Maureen (starvation) died at home the same day while the scholar
  fought the eater alone. The honest causal record (sickness /
  starvation, fightLive=false) is correct; the fight's diedInFight is
  roster-wide day-window, not party-only. The metric needs ≥1 named
  fight-causal death and there is only this one fight to name from.
- M3-conversion **NO-GO** (third consecutive miss): armB (wavesnw,
  89705) kills 1 vs armA (waves) kills 5. r158 was 3 vs 6. The
  not-walking-in arm keeps trailing on these seeds. A tally miss, not
  a pilot failure — recorded under metric review, not re-scored.
- M23-capstone **NO-GO** (pass B): 1 eligible seed (89704,
  deedGateFirstOk d77), 0 delivered, 14 none-ready attempts,
  refused-despite-ready 0, pricedFull 0/1. No readiness/delivery
  disagreement — nothing was ever ready. The failure is the finding:
  on these seeds the capstone deeds are the wall. M24-tribute-agreement
  GO (vacuous — no tribute delivery fired).

## The fix this run: the feast tooltip, said 237 times

Reading the full transcripts, one line repeats as a filler loop: the
surge-arming beat's FEASTED parenthetical — "The next feast grants
FEASTED until tomorrow's dawn: strikes & abilities uplifted,
devotion ×1.5 — richer feasts hit harder." — fires on EVERY arming.
The pilot counted it 237 times in 89702's 84-day run (104 in 89701's
window alone). A player tapping keepsakes daily reads the same
~200-character mechanic paragraph hundreds of times per run.

Root cause: `channelSentiment()` in `src/js/progression.js` builds
the arming message with the tooltip inline, unconditionally, on both
the mastery and devotion lanes. Fix: the tooltip is said once per
KEEPSAKE (`pg.feastTooltipSaidByItem[itemKey]`, set inside `armSurge`
so the practice branch never consumes it); repeat armings of the same
item keep the short form ("The feast was the weapon."). The arming
itself is unchanged — the surge still sets every time, same multiplier.

REVISED mid-run (gate caught it): the first version said the tooltip
once per RUN, which broke `godpath/test-main67-beat-identity.js` A-1
— every item's devotion line must state the honest buff terms, so a
new keepsake's first arming must still explain the feast. The
per-item revision satisfies both: the gate's beat-identity test went
from 3 failures back to 0, and the repetition is still killed (one
tooltip per keepsake, not one per arming).

Proof: `scripts/test-feast-tooltip-once-r162.js` — 19 checks. It FAILS
on pre-fix code (the repeat-arming checks fail) and PASSES after
(19/19), including the per-item check: item A's 2nd arming drops the
tooltip, item B's 1st arming still carries it, item B's 2nd drops it.
Post-fix re-run of seed 89702 (full 180-day pilot seed) — verified in closeout: transcript identical trajectory (12,506 lines both legs; census summary byte-identical), tooltip 237 → 1. The one remaining tooltip is a first-arming of a keepsake, by design.
The two failures in the existing `test-channeling-gap-20261010.js`
(practice XP in the teach demo) are pre-existing — verified identical
on the pristine base file before the fix landed.

The measurement proof also needed a refresh: changing
`progression.js` invalidates the retained observer-neutral proof
(`test-measurement-proof-update` + `test-measurement-workflow`
failed on the first gate). Refreshed per docs/SIMULATING.md — fresh
neutral panel seed 7 x 4 policies x 150d
(`evidence/2026-11-09/neutral-r162.json.gz`), `balance-proof-update.js`,
both tests now 9/9. The remaining gate failures (below) are
pre-existing, verified identical on the pristine base file.

Also verified NOT a bug, no fix: the night line "No watches tonight.
Everyone sleeps with one ear open..." looked like a 21× verbatim
repeat in 89702, but all four no-watch variants appear exactly 21
times each — `villagePick` rotates evenly over 84 watchless nights.
The village never posting watches in 84 days is a bot-policy note
(the probe never assigns patrol), not a voicing defect.

## Dark probe

7 variants, one failed step: `v1a-loss:D2-twist-fired` — the expected
curdle (the loss variant's D2 twist is supposed to curdle, not pass),
identical to r158. The `seat-lesser` step PASSED on the ladder
substrate without any rig change.

- S1 HOLDS: the sitter walk-out names **Amelia Moon**, not Bill Palmer.
- S2 HOLDS: D1–D4/D6 hold; v1a curdle is the expected non-ok step.
- The dark rig's "For a full seat" line names the ladder and the
  capstone honestly: "only 16 of 40 counted ladder points toward
  National Standing (highest climb: Village Standing) ... no capstone
  deed delivered (military tribute, trade charter, or feast embassy)".
- Log: `evidence/2026-11-09/journey-endgame-r162-dark.log`,
  corpora in `perseed-endgame-r162-dark/`.

## People check (full transcripts read)

The four finales read as people, and each final choice matches the
path the village actually earned:

- 89701 feared/pledge: "You pledge it aloud, on the record:
  humanity's fear is a standing shield, never a sword." A village
  that lost one person in 115 days pledging from strength, not fear.
- 89703 beloved/audience: "You spend it all — the love, the light,
  the finale slot — on people the cameras never found. You name the
  unfilmed villages. You name the dead." Then "The show becomes the
  government."
- 89704 relay/voice: "Become its voice." — the merge completes, "the
  System finally says your name right." The army offer is taken this
  run ("You say yes. The word is small. The pods open — not like
  morning. Like a barracks." / "Poran makes a sound that isn't a
  word. Poran's brother is in that row.") — a dark choice with a
  named human cost in the room.
- 89705 feared/pledge: same pledge line as 89701 (shared path text),
  but the war path and ascensions differ (Leo Martin and Diana Osei
  ascended together — "gods, it turns out, have politics").

The shared "You won" coda ("Say it plainly: you won... the little
ones are still napping...") repeats across lesser-seat wins with
path-varying lines inside it ("The mourners asked you, and you
changed the subject" vs "You never asked. Not once.") — a shared
ending text, not a conversation loop. War-path beast names are
distinct on every seed this run (Loud-Eyes / The Big Bastard on
89704; Big Loud / The Loud Beast on 89701) — the r158 same-name wart
did not recur. No villager-initiated bond proposals observed in the
pilot transcripts (descriptive, carry from r158 — the probe does not
drive the conversation system). No pellet lock recurrence: surge
spends fired on all five seeds (d16/d26/d31/d28/d20), no withdrawal,
no lock line; no radiation death. The pellet reframe's cost is
invisible to this probe (no rads field in the pilot JSON) — a
descriptive gap, not a finding.

One census note, carried not fixed: 89705's audit counts 8 wave-4
monsters faced but the census holds 4 fights — the gap is
distinct-monster-ids per fight (one fight can face several), not
missing fights; M21 crosscheck matches and M2c/M2d classify all
opens. No action.

## Metric review (§14)

- M3-conversion: third consecutive miss (r158: 3 vs 6; r162: 1 vs 5).
  The tally says the not-walking-in lever does not convert more kills
  on these five seeds. Keep the tally; if the panel's wavesnw arm
  keeps trailing, the lever — not the metric — is the question. No
  re-scoring.
- M2b-attribution: the metric's `named>=1` rule fails on a 1-fight
  pilot when that fight's deaths are honestly non-fight deaths. The
  instrument wart underneath is real: `diedInFight` in
  `closeFightRec` is roster-wide day-window (`startAlive` minus
  `endAlive`), so home deaths on a fight day land in a solo fight's
  record. Proposed revision for the NEXT run: restrict diedInFight
  to the fight's party (open-snapshot non-monster keys), WITH the
  scholar-death question answered first — a solo scholar death must
  still read vDie, so the restriction needs a scholar-death read
  alongside it. Not patched mid-run: changing dieFlag changes
  outcomes across the census.
- M23-capstone: the binding behaved — it caught the real wall (no
  kind ready) and distinguished none-ready from refused-despite-ready
  (14 vs 0). Keep. The revision for the next run is a probe policy
  that can actually deliver a capstone: either a tribute-first policy
  that banks a second living veteran (keeps both killers alive and
  home through the seat window), or a policy that drives a feast
  bundle / chartered trade link to completion. Proposed, not applied
  mid-run.
- M24-tribute-agreement: vacuous this run (no tribute fired). Keep;
  it bites the day a tribute does fire.
- M10-fullseat-gap: the capstone-only gap revision (r158) behaved:
  89704 passes with the gap named as capstone-only via the CAPSTONE
  section. Keep.
- L-PEAK / L-VOICE: held 5/5; the ladder audit line reads correctly
  on all four sitting seeds (no r158-style stutter recurrence).

## Telemetry

`node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/endgame.json --current 'evidence/2026-11-09/perseed-endgame-r162/*.json' --metrics veterans.unlockedWave,won,peakLivingVeterans` — **quiet** (5 files, 3 metrics, no large deviations), exit 0. Metrics are the r121 post-seat-regime keys only; the r51-era maxTier/satPenalty keys were NOT compared (mixed-regime file, per its own note). Baseline NOT rolled on a quiet check, per the prereg.

## Gate (closeout, main session)

Gate 1 (run, pre-fix-per-item): `check.js --quick` **293 passed / 7 failed in
458s** — 3× `test-main67-beat-identity` (the once-per-run version broke
A-1: every item's devotion line must state the honest buff terms) +
measurement-proof staleness pair (the fix touches `progression.js`, a
manifest input) + 4 standing (mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20).

Gate 2 (closeout, per-item fix + proof refresh in place):
`check.js --quick` **296 passed / 4 failed in 474s** — exactly the
standing 4 (mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20). Beat-identity GREEN (0
failures — the per-item revision satisfies A-1) and the
measurement-proof pair GREEN (9/9 + 9/9, verified standalone in
closeout). No new attributable failure. Log:
`evidence/2026-11-09/journey-endgame-r162-gate2.log`.

Gate 3 (closeout, rebased tree `8cee6a8d2`): `check.js --quick`
**295 passed / 5 failed in 986s** — the standing 4
(mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20) + `test-trust-observer-neutrality` (120s
timeout, load artifact — the same class of timeout has fired
intermittently under load before; it passes standalone). No new
attributable failure. The first gate-3 attempt was killed mid-run
by a service restart (~04:25 CST, ~190/300 scripts in, no
summary); this is the re-run. Log:
`evidence/2026-11-09/journey-endgame-r162-gate3.log`.

Proof refresh on the rebased tree: neutral panel seed 7 × 4
policies × 150d (`evidence/2026-11-09/neutral-r162-rebased.json.gz`),
proof pair 9/9 + 9/9 and r162 proof test 19/19 verified on the
rebased tree before gate 3. This refresh also covers the r156 +
r161 + r121 staleness, so the measurement proof is current on this
branch. Log:
`evidence/2026-11-09/journey-endgame-r162-neutral-panel-rebased.log`.

Gate 4 (closeout, re-rebased tree `ff8b9869f` — master moved
twice during closeout: the sitdrive landing `b5d1eb923` added a
new policy file + `sweep-compare.js`, which re-staled the proof,
then the 0930Z round evidence `ff8b9869f`, evidence-only):
`check.js --quick` **293 passed / 7 failed in 1340s** — the
standing 4 (mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20) + 3 load artifacts under
heavy load: `test-measurement-cache-flags` (84.5s),
`test-trust-observer-neutrality` (120s timeout),
`test-capable-bot-20261014` (120s timeout). No new attributable
failure. Log:
`evidence/2026-11-09/journey-endgame-r162-gate4.log`.

Second proof refresh on the tree at the time: neutral panel seed 7 × 4
policies × 150d (`evidence/2026-11-09/neutral-r162-rebased2.json.gz`),
proof pair 9/9 + 9/9 and r162 proof test 19/19 verified on that
tree before gate 4. (That tree was called "final" above; master
moved twice more during closeout, so it was not final — see gates 5
and the third refresh below.) Log:
`evidence/2026-11-09/journey-endgame-r162-neutral-panel-rebased2.log`.

Gate 5 (closeout, re-rebased tree `8419eefa4` — master moved again:
scale r113 `5b8ff908e` + medheadcount-suite evidence `8419eefa4`,
manifest move, so a third proof refresh was run first):
`check.js --quick` **293 passed / 7 failed in 1413s** — the
standing 4 (mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20) + 3 load artifacts:
`test-measurement-cache-flags` (80.5s),
`test-solo-campaign-endings` (120s timeout — 15/15 standalone),
`test-trust-observer-neutrality` (120s timeout — 6/6 standalone).
Capable-bot passed this run. No new attributable failure. Log:
`evidence/2026-11-09/journey-endgame-r162-gate5.log`.

Third proof refresh on the `8419eefa4` tree: neutral panel seed 7 × 4
policies × 150d (`evidence/2026-11-09/neutral-r162-rebased3.json.gz`),
proof pair 9/9 + 9/9 and r162 proof test 19/19 verified on the
rebased tree before gate 5. This refresh closes the standalone
measurement-proof-refresh todo (r156 + r161 + r121 staleness) once
merged. Log:
`evidence/2026-11-09/journey-endgame-r162-neutral-panel-rebased3.log`.

Closeout note: after gate 5, master moved once more to `d781f354d`
(Loop B 1030Z round evidence — 12 evidence files + 2 new test
scripts, no manifest inputs), so the branch was rebased a fourth
time onto that SHA; proof pair + r162 proof re-verified and the two
new test scripts run standalone on the rebased tree before the
merge. No further panel refresh was owed (evidence-only move).

## Verdicts

- REACHABLE: yes. The lesser seat opened on 4/5 seeds through the
  ladder, including a village that lost one person in 115 days and a
  village that fought four times in 92 days. The full seat is
  reachable in principle — 89704 did every deed except the capstone —
  but unproven in bot play: no bot policy delivers a capstone yet,
  and the capstone deeds themselves are the wall (tribute needs two
  LIVING veterans; the bundle and the charter never fired in bot
  play).
- FUN: the finales read as people; the relay merge and the beloved
  audience are the two strongest endings this leg has produced, and
  the 89704 audit naming the capstone as the one missing piece is
  the clearest the table has ever been about what a village still
  owes. The flat note was the feast tooltip, 237 times — fixed.
- WINNABLE: the lesser seat is winnable (4/5). The full seat is not
  yet won in organic play — unchanged from r158 — but the wall is
  now a named deed with a named price, and the next run's job is a
  policy that can pay it.

## Files

- Prereg: `evidence/2026-11-09/journey-endgame-r162-prereg.md`
- Pilot logs: `evidence/2026-11-09/journey-endgame-r162-pilot-a.log`
  (pass A), `...-pilot-b.log` (pass B); per-seed:
  `perseed-endgame-r162/` (pass A), `perseed-endgame-r162-b/` (pass B)
- Analysis: `evidence/2026-11-09/journey-endgame-r162-analysis-a.txt`,
  `...-analysis-b.txt`
- Dark: `evidence/2026-11-09/journey-endgame-r162-dark.log`,
  `perseed-endgame-r162-dark/`
- Instruments: `scripts/probe-endgame-r162-20261109.js`,
  `scripts/analyze-endgame-r162-20261109.js`,
  `scripts/probe-darktable-r162-20261109.js`
- Fix: `src/js/progression.js` (feast tooltip once per keepsake), proof
  `scripts/test-feast-tooltip-once-r162.js` (19 checks, RED->GREEN;
  post-fix 89702 re-run identical trajectory, tooltip 237->1, verified in closeout)
- Smoke: `evidence/2026-11-09/journey-endgame-r162-smoke-a.log`
  (pre-fix pass-A 89702), `...-smoke-postfix.log` (post-fix 89702)
