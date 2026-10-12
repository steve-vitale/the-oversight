# Long-run sim — LEVER 9 ROUND 3: audience-trial cadence (2026-10-11)

Canon read first: docs/CANON.md, docs/SYSTEMS.md (tabulated map, stale
2026-10-05 — verified against code), docs/PROGRESSION.md. Builds on
sim-abilities.md (r1: use-log hygiene + hint honesty; synergies reachable
but acquisition-starved, 6 slots decorative) and sim-abilities-r2.md (r2:
contest prize lanes; acquisition needle barely moved — wins are the
throttle, lever 6's concern). Human≠alien lane respected: trials are a
canon System pipe ("offers, trials, System milestones" — CANON.md); the
gift pool is `system_offer` only, untouched.

## The lever: audience-trial cadence (exact numbers)

`src/js/progression.js`, two numbers, nothing else in the pipe:

1. `checkAudienceEncore` offer chance: **0.25 → 0.40 / day** (post-integ-40,
   still cooldown-gated, still no offer while a trial is pending). The
   audience is keener; the trials are not easier.
2. `completeTrial` cooldown: **trialCd +7 → +4 days**. A completed trial
   means a proven performer — the audience books the next one sooner.
   Expiry cooldown (+5, checkTrial) deliberately unchanged: failures keep
   the old rhythm.

Trial tasks, the +15 integration, the synergy-aware gift pick, the
full-slots refusal, and the tease→discover escalation are all untouched.

## The blank filled along the way (silent bug, same function)

`completeTrial`'s `recordMoment` referenced `t.name` — `t` was never bound
in that scope (`pg.trial` had just been nulled). The ReferenceError died
silently in the try/catch, so the moment never entered the journal AND its
viewership +1 never fired. Fixed: capture `const t = pg.trial` before
clearing, record `t.text` (the player-facing task line). Verified in the
proof test: moment now reads "Survived the audience's trial: Haul 1,000
kcal to the pantry within 3 days." — no "undefined" anywhere.

## Proof

`scripts/test-trial-cadence-20261011.js`: **23/23 green.**
Guards intact (no offer pre-arrival / below integ 40 / while pending /
during cooldown); offer rate 0.398 over 500 rolls (in [0.30, 0.50]);
wiring asserted against source (0.40 literal, +4 literal); completion
sets trialCd = day+4; +15 integration; synergy-aware gift (mediator held
→ diplomat gifted, legs co-held); the slot-opening gift still fills the
slot the +15 just opened (4/4 at integ 60 → 5/5, never exceeding slots);
true-full refusal at 6/6; completion narrated without a gift line; sense
read of the offer/completion copy — System voice, honest, no template
leakage.

**Regressions:** test-synergy-hygiene 9/9 (r1, still green).
test-progression.js has 5 keepsake failures — verified PRE-EXISTING on
pristine stash (untouched area). test-player-trial 78/80 (2 pre-existing
fails, same as baseline — sentencing/bribery traces, unrelated).

## Before/after (identical seeds, god policy, 200-day horizon, 12 seeds)

New harness `scripts/sweep-abilities-trials.js`: god policy + trial
telemetry (offer/complete/gift counts via method wraps — works on pristine
code, so the baseline is a true baseline) + the r1 ability snapshot.

| Metric (god policy, 12 seeds) | Before | After | Δ |
|---|---|---|---|
| Trial offers | 58 | 87 | +50% |
| Trial completions | 22 | 25 | +14% |
| Trial gifts | 21 | 23 | +10% |
| Mean offers/run | 4.83 | 7.25 | +2.42 |
| Mean abilities held | 3.42 | 3.58 | +0.16 |
| Max abilities | 6 | 6 | — |
| Synergies discovered | 7 | 10 | +3 |
| Runs with ≥1 synergy | 5/12 | 7/12 | +2 |
| Synergy ids seen | apex_sense, blood_tracker, peacemakers_voice, sun_garden | same 4 | breadth same |
| Mean synergy attempts | 2.33 | 2.50 | — |
| Mean resonance | 69.3 | 109.9 | +59% |
| Max resonance | 217 | 381 | +164 |
| Median days survived | 57 | 71 | +14 |
| Max days | 78 | 187 | +109 |
| Wins / table / Arc IV | 0 / 0 / 0 | 0 / 0 / 0 | — |
| Wave dist | 1:1 2:4 3:7 | identical | — |
| Villager abilities | 474 | 440 | −34 (noise) |

Per-seed notes: seed 7 went 39→105 days (12 offers, sun_garden discovered
where baseline had none); seed 42 added blood_tracker alongside sun_garden.
Every completion still gifts (23/25; the 2 non-gifts were full-slot
refusals — honest). Completion rate 38%→29%: the extra offers reach runs
where the trial tasks (1,000-kcal haul / 3× L3 plants in 3 days) are
harder — the TASKS are now the binding constraint, not the cadence.

Honest read: the pipe works and the cadence moved every acquisition
metric in the right direction, but mean abilities barely budged (+0.16):
with ~60-day median survival, even a keener audience only books ~7 trials
per run. The 6-slot economy is less decorative than r1 (max 6 held, gifts
are synergy-aware) but still capacity-rich. This lever is spent — the
next acquisition gains live in trial TASK reachability or survival
itself, both other levers' territory.

## Reachability verdict (updated vs r2)

- **Trials: REACHABLE and now keener.** Offers 4.83→7.25/run; every
  completion gifts; the synergy-aware pick demonstrably completes legs
  (mediator→diplomat in sims and in the scripted proof).
- **Synergies: 4 of 51 reachable in competent sims** (apex_sense,
  blood_tracker, peacemakers_voice, sun_garden) — up from r1's 1, but 47
  remain acquisition-starved. The mechanic is proven; the legs are the
  scarcity.
- **6-slot economy: filling, not full.** Slots hit 6, players hold 3–4
  mean, 6 max. Better than r1's 1.83, still not a constraint.
- **Evolution (L3 → stageEvolution): still decoration in sims.** No run
  staged an evolution; L3 needs ~18 xp at ~0.1 xp/day. Documented, not
  this lever.
- **Unlock ladder: rungs filling.** Slot moments all fire (20/40/60/70/80);
  the trial pipe is the ladder's main content feeder now.

## Villagers act like people? (trial-adjacent)

Villager godhood is still grants-only (r1's documented blank — not this
lever). New blank documented this run: **audience trials have no
village-side beat at all.** The copy says "broadcast live" / "televised";
the village canonically watches the show (r2 proved they see System
rewards on camera) — but no villager reacts to, gossips about, or gains
notability from the player's trials (`offerAudienceTrial`/`completeTrial`
are referenced nowhere outside progression.js; zero "trial" mentions in
conversation.js; no `addNotability` in the trial path). The show happens
AT the village, not WITH it. Natural follow-up for lever 3 (agency) or
lever 5 (trust/social) — not built here (one lever per run).

Sense read of the trial beats themselves: "◈ TRIAL COMPLETE — the
audience applauds, which sounds like static. (+15 integration, gift:
Diplomat)" / "◈ AUDIENCE TRIAL — SYSTEM: 'The audience wants an encore.
A trial, then — smaller this time, but televised.'" — coherent System
voice, honest about the reward, no robotic leakage.

## Village assessment (plain words)

Twelve villages, all village-lost (median 57→71 days). The System's
audience is visibly keener: more trials offered, more gifts handed out,
more synergies warming up — seed 7's scholar ran mediator+diplomat into
peacemakers_voice territory and lived to day 105, the longest godhood
arc we've measured. Who thrived: scholars who completed hauls (the
pantry-feeding loop and the trial loop are the same loop — the competent
policy's donations ARE trial completions). Who died: everyone, to combat
and hunger on the usual schedule; godhood is still a sidecar on a
survival run. Missing: trial-task reachability for struggling villages
(the identify-3-L3 task is near-dead in sims), any village reaction to
the show, and L3 evolution content.

## Files

- src/js/progression.js — checkAudienceEncore 0.25→0.40; completeTrial
  trialCd +7→+4; recordMoment silent-bug fix (t.text)
- scripts/sweep-abilities-trials.js — new harness: god policy + trial
  telemetry + r1 ability snapshot (baseline-capable via wraps)
- scripts/test-trial-cadence-20261011.js — proof, 23/23
- evidence/2026-10-11/sim-abilities-r3.md — this file

Raw sweep JSON: /tmp/trials-base12.json (pristine), /tmp/trials-after12.json
(with cadence). Baselines were run via `git stash push
src/js/progression.js` — the only diff between the two columns is this
run's change.
