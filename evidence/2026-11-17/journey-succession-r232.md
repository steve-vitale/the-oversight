# Journey succession r232 — run note (Lane B, leg 7)

Leg 7 (succession), run r232, fresh band 34341–34344 (EARLY_KILL_DAY=40,
POST_DAYS=70) + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25, standing
control). Base master `7cbef877e` at run start. Prereg:
`evidence/2026-11-17/journey-succession-r232-prereg.md`.
Panel: 5/5 seeds exit 0. Driver
`scripts/journey-succession-r232-20261117.js`, analyzer
`scripts/analyze-journey-succession-r232-20261117.js` (both r231's,
rename only, plus the relMap instrument and the REL scan over 19
mourning shapes). Panel runner
`scripts/run-journey-succession-r232-panel.sh`.
Proof test:
`scripts/test-journey-succession-r232-relationship-mourning-20261117.js`.

Adoption: the 04:01Z coordinator timed out at 3600s with the panel
complete (5/5, analyzer exit 0) but nothing committed — fix
uncommitted in the worktree, no run note, no telemetry check, no gate.
Adopted after heartbeat staleness (registry hb 04:52:41Z, stale
05:07:41Z; no live process in the tree). Fix committed, rebased onto
current master, proof re-run green on the rebased tip, gate re-run —
see Gate below. Rotation-b 7→4 written at closeout.

## Fix (REL-MOURN, src/js/convoTopics.js only)

The r231 panel's filed next build: mourning lines were varied but one
generic voice per template — they didn't know the speaker's
relationship with the dead. Now:

- Mourning events carry the dead's id (`deadId`) and the corpse's
  witnesses. The fresh-corpse branch sets both; the mantle-memory
  (successor-grief) branch mirrors `bearerId` into `deadId`.
- New gate `t2MournRel(vid, ev)`, read from live state only: bondClose
  (bond v>=20 or depth>=1 — the successor-grief push's established
  line), bothVet (a waveKillLog row for EACH of them — shared
  standing, never a claimed shared fight), witnessed (speaker's id in
  the corpse's stored witnesses).
- Six new opener variants (2 per kind: bond / veteran / witness) added
  to the mourning pool, each carrying `{mname}`, filled after the
  pick per r231 so the template dedupe sees the template. Three bond
  follow-ups (one per level: cope/next/part). Additions only — the
  generic five stay.
- KIN deliberately not built: no kin signal exists between two
  villagers (kin lives only relative to the scholar). If Steve wants
  kin mourning, kin tracking is a separate build, not a line fix.
- Multi-name relationship mourning not built: the multi-name pool
  keeps its own voice.

No game rule, price, gate, or balance number changes — line
selection only.

## Panel

| seed | handoff | mantle flips | mourning servings | dry |
|------|---------|--------------|-------------------|-----|
| 34341 | Brendan → Miguel d41 | 2 (Miguel d84 → Lily) | 9 | 0 |
| 34342 | Hans → Patricia d41 | 5 (→ Irving → Maricela → Benoit → Bao) | 3 | 0 |
| 34343 | Colin → Paolo d40 | 4 (→ Booker → Bekzat → Giulia) | 9 | 0 |
| 34344 | Sergio → Raj d41 | 2 (→ Ryan) | 9 | 0 |
| 33998 | Heinrich → Grace d6 | 1 | 4 | 0 |

34 mourning servings panel-wide, 0 dry hits. Day-skips 0 (watch
continues). Bonds kept growing after the deaths (relPost 45–58,
relEnd 51–68). Newcomers arrived on 3 of 4 fresh seeds (Fatima d+25,
Salamatu d+58, Merna d+61) and bonded.

## Verdicts (pre-registered metrics bind)

- **REL-BOND PASS**: 3 bond-variant servings, all held, 0 unheld —
  Emma d+46 for Miguel (bond 45/1), Daniyar d+53 for Miguel (38/1),
  Bekzat d+30 for Paolo (39/1). All three speakers were also both
  veterans; the bond line is what drew.
- **REL-VET FAIL (as written)**: 0 veteran-variant servings. 14
  both-veteran convos occurred, but only 6 opener draws fell in them
  (the rest served follow-ups or generics) — a roughly 1-in-5 outcome
  under even draws, not a broken gate: the proof test serves 2
  veteran openers in 7 staged sittings, and the silent case holds
  shut (0/7 when only the speaker is a veteran). No veteran variant
  fired wrongly — 0 unheld servings of any kind. The bar as written
  only allows INSUFFICIENT-DATA when no both-veteran convo occurs,
  so it records FAIL; the metric review below proposes the
  opener-draw denominator for the next run. The arm is carried, not
  waived.
- **REL-WIT INSUFFICIENT-DATA**: 0 witnessed deaths on the panel —
  no corpse carried a populated witnesses list in 34 mourning
  servings, so the witness variant was unmeasurable in the wild. The
  proof test serves 2 witness openers in 7 staged sittings and holds
  shut (0/7) when the speaker did not witness. Finding, not failure.
- **MOURN-TEMPLATE PASS**: 34 servings across the 19 shapes, 0
  same-speaker repeats, 0 village-window repeats.
- **MOURN-EXHAUST PASS**: 0 exhausted-line servings in mourning
  sittings.
- **MANTLE-FINE PASS**: 14 deaths observed, 0
  flippedImmediate=false, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips. The mantle flips synchronously at
  every observed death with a living successor.
- **DRY CENSUS PASS**: 0 dry hits of any class, 0 honest fallbacks,
  0 null-return silences on this panel.
- **WILD CHECK**: no regressions observed on the carried surfaces —
  dry 0 everywhere, no stale-favor resume, no narration-quote opener
  in the read transcripts. F5 targeted harness (r225) re-run green
  22/22 on this base.
- **C3d WILD HOLD**: 0 C3d-class erasures.
- **F5 WILD EXERCISE (revised rolling 3-panel window)**: the
  settled-favor branch did not observably fire on r232's panel; the
  window still carries r230's 2 firings, so the bar (≥1x across
  r230+r231+r232) is met, with 0 F5-class dry hits. The r225 harness
  (22/22) is the functional proof.
- **CONTROLS PASS**: smoke 33998 snapshot matches the standing
  control — handoff d6 Heinrich → Grace, relPost bonds 33, relD14
  50, selfId grace_obi, identical to the r231 corpus re-scan on the
  same base. Pick rank 1 and funeral INCALL true on every seed.
- **CAP-NC INSUFFICIENT-DATA**: 0/0 eligible seeds (bondedEver
  descriptive 3/3 probe-opened seeds).
- **HABIT-COLLISION PASS**: 0 same-seed same-habit servings.
  Werner (34334) and Austin (34333) confirmed different seeds — the
  r231 watch item was a cross-panel artifact no single player can
  hear. Within one village habits are unique by construction.

## Village assessment (plain words)

Five villages buried their bearer and kept going. The hardest was
34342: five mantle flips in twenty-two days — Hans to Patricia to
Irving to Maricela to Benoit to Bao — and the village still held
together, with Fatima arriving mid-collapse and bonding in. The
others handed over once or twice and steadied: Miguel held 34341 for
forty-three days before Lily took it; Paolo's line ran four deep on
34343; Raj's on 34344.

The grief now knows who it belongs to. Emma, who was close to Miguel
(bond 45), doesn't say a generic line about him — she says she knew
him, really knew him, not the fire's version, and now there's just
the fire's. Daniyar says the same in his own words a week later.
Bekzat says it about Paolo. When the bond wasn't what drew — Maricela
mourning Patricia, Diana mourning Raj — the generic lines served
honestly instead, and nothing pretended to a closeness that wasn't
there. No line ever claimed a relationship the record didn't hold:
three bond servings, all three held, zero unheld anywhere.

What didn't get said: nobody on the panel had watched their person
die — the witness lines never had a chance, because no corpse
carried witnesses. And the two veterans who stood at the same
treeline never got their line either; the draw just didn't land on it
in six chances. Both stay open, not closed.

## Blanks filled / findings

- **REL-MOURN built and landed** (see Fix above). The mourning
  lines now speak from the speaker's actual relationship with the
  dead — bond, shared veteran standing, witnessing — read from live
  state, never guessed.
- **Habit-collision watch item RESOLVED by inspection** (r231
  carry-over): cross-seed artifact, not a defect. Habits are unique
  per village by construction.
- **KIN mourning recorded as unavailable** (signal audit): no kin
  record exists between two villagers. Not built, not invented.
- **Witness variant unmeasurable in the wild this panel** (finding):
  0 witnessed deaths in 5 seeds / 34 mourning servings — the
  witnesses list is never populated on the death paths this panel
  exercised. Filed in the findings backlog; the proof test carries
  the mechanism.
- **Veteran variant engagement unproven in the wild** (metric
  review): 0 servings on 6 opener draws. Mechanism proven in
  harness; carried to the next panel with the revised denominator.
- **r231 corpus re-scan**: DRY 0, MOURN-TEMPLATE PASS, MANTLE-FINE
  PASS, HABIT-COLLISION PASS on the same base — the carried bars
  hold on old data too. (15 honest fallbacks for Sylvain on 34331
  are the standing honest-fallback behavior, not dry hits.)

## Reachable / fun / winnable

- **Reachable**: yes — scripted handoffs, mantle chains, mourning,
  bonds, newcomers all fired in the wild on every seed. Nothing on
  this leg is gated behind content the panel never reached.
- **Fun**: the leg reads as people grieving people they knew, not
  one voice for every death. Emma's line about Miguel is the
  standout — specific, personal, true to a bond the game actually
  recorded.
- **Winnable**: this leg does not judge the win — it judges the
  mantle passing cleanly, which held on all 14 observed deaths. The
  binding wall stays upstream (wave-4 kills, veteran bar, launched-
  party damage), unchanged by this run.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/succession.json
--current 'evidence/2026-11-17/journey-succession-r232-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`:
**2 LOUD lines, both explained** — deaths.bearer +84% (baseline 7.6
→ current 14) and census.fallen +61% (baseline 14.3 → current 23).
The tool sums the 5 current files; the baseline stores means (the
documented means-vs-sum mismatch, unresolved since r229). Per-file
means this panel are BELOW baseline (bearer deaths 2.8 vs 7.6,
fallen 4.6 vs 14.3); the busiest seed (34342: 5 bearer deaths, 7
fallen) matches its 5 mantle flips in the analyzer. No real
deviation. Baseline NOT rolled.

## Metric review

1. REL-VET's positive arm needs an opener-draw denominator: the
   bar as written counts qualifying convos, but only opener servings
   can draw an opener variant — 14 convos yielded 6 opener draws.
   Proposed revision for the next run: PASS = ≥1 veteran serving on
   ≥10 opener draws in both-veteran convos AND 0 unheld servings;
   fewer than 10 draws = INSUFFICIENT-DATA. The FAIL stands as
   recorded this run; the arm is re-tested, not re-scored.
2. REL-WIT stays INSUFFICIENT-DATA by the written bar (0 witnessed
   deaths). If the next panel also sees 0, the question becomes
   whether any death path populates witnesses at all — a diagnostic
   arm, not a line fix.
3. The proof test's 7-sitting window is the honest positive window
   for a 7-template opener pool; the panel's 6 opener draws show the
   wild window is thinner than the harness window. No change — the
   panel bar carries the engagement question.
4. F5's rolling 3-panel window works as designed: a quiet panel no
   longer fails the bar when the branch fired on a neighbour. The
   window rolls next run (r231+r232+r233).
5. Proof refresh rounds 11 + 12 remain owed (not this run's).
6. Multi-name relationship mourning stays open (not built).
7. The smoke snapshot's "11/1/43" triple from S_fixed was not
   re-derived this run; the control is judged on the identical
   relPost/relD14/selfId snapshot values instead, which match the
   r231 corpus re-scan exactly.

## Gate

`node scripts/check.js --quick` in the worktree on the rebased tip
(`ef7e6d86c`), run twice:

- First run: 327 passed, 14 failed in 1842s — inflated by a second
  gate running concurrently in journey-deepening (started 05:22,
  same box, 1.5 shared CPUs); 7 of the 14 were 120s timeouts. That
  run's log was lost when the VM was replaced ~05:50Z (/tmp wiped);
  the tally survives in the adoption record.
- Clean solo re-run: **334 passed, 7 failed in 787s**. All 7 are
  the standing set, 0 attributable to this change:
  - test-measurement-proof-update.js +
    test-measurement-workflow.js — measurement-proof staleness
    pair (standing).
  - test-phone-frame-proof.js — stale phone-frame receipt
    (standing).
  - test-ladder-bundle-20261108.js — ambient-raid control, "200
    monster turns WITHOUT delivery fire the ambient raid — fires 0"
    (standing).
  - test-living-garden-deed-attainment.js,
    test-one-person-army-deed-attainment.js,
    test-capable-bot-20261014.js — 120s timeouts under load (a
    sibling gate started in sim-launchparty-b at 06:02 during this
    run's tail). Load, not code: the two runs timed out on
    *different* tests (first run: synergy-stall, throttlefeast,
    table-endings, occupation-panels; re-run: the three above) —
    tests that pass in one run and time out in the other.
- Proof test re-run green on the rebased tip (ALL GREEN), and the
  r225 F5 targeted harness green 22/22 on this base.

## Closeout

- **Adoption:** the 04:01Z coordinator timed out at 3600s with the
  panel complete but nothing committed. Adopted after heartbeat
  staleness (registry hb 04:52:41Z, stale 05:07:41Z); fix + proof
  test committed, rebased onto current master, proof re-run green
  on the rebased tip, gate re-run — see Gate above.
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 7→4 written with read-back; lock deleted at closeout
  after run_id verification.
