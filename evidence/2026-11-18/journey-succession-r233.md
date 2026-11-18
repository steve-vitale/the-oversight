# Journey succession r233 — run note (Lane B, leg 7)

Leg 7 (succession), run r233, fresh band 34351–34354 (EARLY_KILL_DAY=40,
POST_DAYS=70) + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25, standing
control). Base master `c4a9ba498` at run start. Prereg:
`evidence/2026-11-18/journey-succession-r233-prereg.md`.
Panel: 5/5 seeds exit 0. Driver
`scripts/journey-succession-r233-20261118.js`, analyzer
`scripts/analyze-journey-succession-r233-20261118.js` (both r232's,
rename only, plus the corpse-witness census instrument in the driver
and the REL-VET revised denominator + WITNESS-CENSUS section in the
analyzer). Panel runner
`scripts/run-journey-succession-r233-panel.sh`.
Proof tests re-run on this base: r232 relationship-mourning (ALL GREEN)
and r225 F5 settled-favor (22/22).
No src/js change this run — measurement + tooling only.

## Panel

| seed | handoff | mantle flips | mourning servings | dry |
|------|---------|--------------|-------------------|-----|
| 34351 | Raul → Arjun d41 (scripted) | 4 (→ Carolina → Ximena → Sofia) | 4 | 0 |
| 34352 | Yesenia → Aurora d38 (organic) | 4 (→ Jacob → Asel → Zoe) | 10 | 0 |
| 34353 | Reagan → Milton d38 (organic) | 6 (→ Gloria → Larry → Nadin → Somchai → Catalina) | 10 | 0 |
| 34354 | Wei → Ruben d42 (scripted) | 1 | 6 | 0 |
| 33998 | Heinrich → Grace d6 (scripted) | 1 | 4 | 0 |

30 mourning servings panel-wide, 0 dry hits. Day-skips 0 (watch
continues). Bonds kept growing after the deaths (relEnd bonds 51–79).
Newcomers arrived on 3 of 4 fresh seeds (10 arrivals panel-wide) and
bonded (NPC-NPC new bonds 33; bondedEver 3/3 probe-opened seeds).

## Verdicts (pre-registered metrics bind)

- **REL-BOND PASS**: 2 bond-variant servings, both held, 0 unheld —
  Gianna d+15 for Aurora (bond 36/1): the bond-knew opener ("I knew
  Aurora. Really knew them, not the fire's version. Mine. And now
  there's just the fire's.") and the bond-watch part ("My part? I
  carry what Aurora carried. Not their work. Their watch.").
- **REL-VET PASS (revised denominator)**: 3 veteran-variant servings,
  all held, 0 unheld, on exactly 10 opener draws in both-veteran
  convos — the floor met exactly. Fernando d+30 for Asel
  (vet-club: "Asel killed the things that come at night. I did too.
  That's a small club, and it's smaller now."), Gianna d+30 for Asel
  (vet-treeline), Catalina d+7 for Reagan (vet-treeline: "We both
  stood at the treeline. Reagan held it. I keep replaying my part,
  looking for the step I missed."). The r232 FAIL is closed by the
  revised bar, not re-scored: r232's 6 draws would have been
  INSUFFICIENT-DATA under it.
- **REL-WIT INSUFFICIENT-DATA**: 0 witness servings, 0 witness
  convos. The WITNESS-CENSUS below answers why.
- **WITNESS-CENSUS SUPPLY-ZERO**: 177 corpses panel-wide (23 person,
  154 monster); person corpses with witnesses 0. Person causes:
  ambush, the expedition, the arena, the wild (×7), a wound that
  wouldn't close (×2), Gavel (×2), contest, monster (×3), a stranger,
  The Focus Group. All 154 monster corpses carry witnesses (the
  killer's id) — the mechanism works; it is the person-death paths
  that don't populate it. The one ambush corpse (34351) carried 0
  witnesses: `witnesses(6)` was empty at the scene. The witness
  variant is reachable only when a villager dies in a fight another
  villager was in (tbDamage / statusEffects / alien beam) or an
  ambush with villagers in range — none of the 23 person deaths on
  this panel qualified. Finding, filed, not fixed by inventing
  witnesses for deaths nobody saw.
- **MOURN-TEMPLATE PASS**: 30 servings across 13 shapes, 0
  same-speaker repeats, 0 village-window repeats.
- **MOURN-EXHAUST PASS**: 0 exhausted-line servings in mourning
  sittings.
- **MANTLE-FINE PASS**: 16 deaths observed, 0
  flippedImmediate=false, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips. The mantle flips synchronously at
  every observed death with a living successor — including the
  same-day cascade on 34351 (Ximena → Sofia, both d95) and the
  six-deep chain on 34353.
- **DRY CENSUS PASS**: 0 dry hits of any class, 2 honest fallbacks
  (34352), 0 null-return silences.
- **WILD CHECK**: no regressions observed on the carried surfaces —
  dry 0 everywhere, deflect_q 0, dlg:doubt 0, no stale-favor resume,
  no narration-quote opener in the read transcripts. F5 targeted
  harness (r225) green 22/22 on this base; r232 relationship-mourning
  proof test ALL GREEN.
- **C3d WILD HOLD**: 0 C3d-class erasures. Recap exchanges on the
  read transcripts named the open thread every time ("Still on that
  question." Ashanti d+3; "Still on what they confided." Gianna
  d+15; "Still on teaching them something." Fernando d+30; "Still on
  the talking-to-strangers part." Catalina d+7). The empty-log
  live-line path itself is still unobserved in the wild — the recaps
  above named live threads through the thread log, not the
  empty-log path.
- **F5 WILD EXERCISE FAIL (as written)**: the settled-favor line
  ("It's already handled. Thank you for asking.") fired 0 times on
  this panel. Same-method counts: r230 2, r231 0, r232 0, r233 0.
  The rolling 3-panel window for this run (r231+r232+r233) therefore
  carries 0 firings — r230 has rolled out. The bar as pre-registered
  requires >=1x across the window AND 0 F5-class dry hits; the dry
  arm holds (0), the exercise arm does not. The branch itself works
  (harness 22/22 green); it almost never fires in the wild because
  the trigger — a driven convo pressing dlg:help on a settled favor
  — is narrow. See metric review: the window, not the branch, is
  the question now.
- **CONTROLS PASS**: smoke 33998 snapshot matches the standing
  control exactly — handoff d6 Heinrich → Grace, relPost bonds 33,
  relD14 50, selfId grace_obi, identical to the r231 corpus re-scan
  and r232. Pick rank 1 and funeral INCALL true on every seed,
  selfReq 0 everywhere.
- **CAP-NC INSUFFICIENT-DATA**: 0/0 eligible seeds (bondedEver
  descriptive 3/3 probe-opened seeds).
- **HABIT-COLLISION PASS**: 0 same-seed same-habit servings.

## Village assessment (plain words)

Five villages buried their bearer and kept going. The hardest was
34353: six handoffs in sixty-eight days — Reagan to Milton to Gloria
to Larry to Nadin to Somchai to Catalina, the last of them killed by
a stranger on day 106 — and the village still held together, bonds
at 67 by the end. 34351 ran four deep with a same-day cascade
(Ximena and Sofia both on day 95) and steadied. 34352 lost Aurora
organically on day 38 and still grew four newcomers in. 34354 handed
over once and went quiet. The smoke village buried Heinrich on day 6
and Grace carried it.

The grief knows who it belongs to, and this panel proved it in both
directions the last run left open. Gianna, close to Aurora (bond
36), says she knew her — really knew her — and takes up her watch.
Fernando and Catalina, who stood at the treeline with Asel and
Reagan, say so in their own words, and neither line pretends to a
closeness the record doesn't hold: every veteran serving had both
names in the kill log. When the bond wasn't what drew, the generic
lines served honestly instead.

What didn't get said: nobody on the panel watched their person die.
Twenty-three people died and not one corpse carried a witness — the
deaths were the expedition, the arena, the wild, wounds, contests,
Gavel. The witness lines wait for a death somebody actually saw,
and this panel's villages never had one.

## Blanks filled / findings

- **REL-VET engagement resolved** (r232 carry-over): the veteran
  variants fire in the wild where both are veterans — 3 servings on
  exactly 10 opener draws. The revised denominator is the bar now.
- **Witness supply answered** (r232 carry-over): static audit of
  every registerDeath call site (prereg) + per-seed corpse census
  (new instrument). Supply is zero because the death paths the leg
  exercises don't populate witnesses; the only paths that do are
  witnessed combat kills and in-range ambushes. The witness variant
  stays unmeasurable until a panel stages such a death. No code
  change: inventing witnesses would fabricate.
- **F5 window exhausted**: three consecutive quiet panels after
  r230's 2 firings. The branch works (harness green); the 3-panel
  window is too short for its wild rate. Metric review proposes the
  fix for the next run; this run records the FAIL.
- **People check (transcripts read in full)**: Gianna d+15, Fernando
  d+30, Catalina d+7, Ashanti d+3. Conversations hold together —
  confidences resumed across sittings, party roles passed hand to
  hand (scout: Gianna → Fernando on 34352, Gloria → Catalina on
  34353), a party named aloud ("The Company" — Ashanti, Ruby),
  teaching in the field (Pokeweed, Yarrow). One wrinkle, not a
  defect: Gianna's opener thread reads "what I confided in Aurora"
  where the confidence was hers told TO Aurora — slightly awkward
  phrasing on a real carried thread.
- **No new src/js change**: the leg's open items are measurement
  questions now, not line fixes. This run's deliverables are the
  panel, the census instrument, and the revised REL-VET bar.

## Reachable / fun / winnable

- **Reachable**: yes — scripted and organic handoffs, mantle chains
  up to six deep, mourning in all three relationship kinds that had
  supply, bonds, newcomers all fired in the wild on every seed.
- **Fun**: the leg reads as people grieving people they knew, in
  their own words, with the village visibly carrying on around them
  — naming parties, passing roles, teaching what the dead knew.
- **Winnable**: this leg does not judge the win — it judges the
  mantle passing cleanly, which held on all 16 observed deaths. The
  binding wall stays upstream (wave-4 kills, veteran bar, launched-
  party damage), unchanged by this run.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/succession.json
--current 'evidence/2026-11-18/journey-succession-r233-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`:
**2 LOUD lines, both explained** — deaths.bearer +111% (baseline 7.6
→ current 16) and census.fallen +89% (baseline 14.3 → current 27).
The tool sums the 5 current files; the baseline stores means (the
documented means-vs-sum mismatch, unresolved since r229). Per-file
means this panel are BELOW baseline (bearer deaths 3.2 vs 7.6,
fallen 5.4 vs 14.3); the busiest seed (34353: 6 bearer deaths, 10
fallen) matches its 6 mantle flips in the analyzer. No real
deviation. Baseline NOT rolled.

## Metric review

1. F5 WILD EXERCISE: the 3-panel window is too short for a branch
   firing ~2x per 4 panels. Proposed revision for the next run:
   widen to a rolling 5-panel window (r230+r231+r232+r233+r234
   carries 2 firings), OR reclassify the wild-exercise arm as
   descriptive with the r225 harness (22/22) as the binding proof.
   The FAIL stands as recorded this run; the arm is re-judged, not
   re-scored.
2. REL-WIT stays INSUFFICIENT-DATA by the written bar. The census
   instrument stays in the analyzer as a standing diagnostic; if a
   future panel stages a witnessed combat death and the variant
   still doesn't serve, that is an engagement question for that run.
3. REL-VET's 10-draw floor was met exactly (10 draws on 26
   both-veteran convos). The floor is at the edge of the wild rate;
   keep it and watch whether it stays measurable — if the next panel
   lands at 8–9 draws, the floor, not the gate, is the question.
4. F5's rolling window rolls next run (r232+r233+r234).
5. C3d: the empty-log live-line path is still unobserved in the wild
   after four panels. The bar stays; a future panel with an
   empty-log recap would give the positive evidence none could.
6. Proof refresh rounds 11 + 12 remain owed (not this run's).
7. Multi-name relationship mourning stays open (not built).
8. KIN mourning stays unavailable (no kin signal between villagers).
9. The smoke snapshot's "11/1/43" triple from S_fixed was not
   re-derived this run; the control is judged on the identical
   relPost/relD14/selfId snapshot values instead, which match the
   r231 corpus re-scan and r232 exactly.

## Gate

`node scripts/check.js --quick` in the worktree, launched by the
coordinator via nohup and waited out by the adoption (pid 17785):
**336 passed, 8 failed in 1138s**. All 8 are the standing set, 0
attributable to this change (no src/js change this run):

- test-measurement-proof-update.js +
  test-measurement-workflow.js — measurement-proof staleness pair
  (standing).
- test-phone-frame-proof.js — stale phone-frame receipt (standing).
- test-ladder-bundle-20261108.js — ambient-raid control, "200 monster
  turns WITHOUT delivery fire the ambient raid — fires 0" (standing).
- test-living-garden-deed-attainment.js,
  test-one-person-army-deed-attainment.js,
  test-occupation-panels.js — 120s timeouts under load (standing).
- test-measurement-cache-flags.js — **verified standalone 4/4 green**
  by the adoption (exit 0); the gate failure is the documented load
  artifact (AGENTS.md r187), not a code regression.

Proof tests re-run on this base by the adoption: the r232
relationship-mourning guard **ALL GREEN**; the r225 F5 targeted
harness **22/22**.

## Closeout

PENDING — merge, release, rotation 7→4, lock deletion. (Adoption
closeout hashes filled by a follow-up commit, r241 pattern.)
