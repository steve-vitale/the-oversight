# Journey establishment r268 — run note

Leg 1 (establishment, days 14–40, 42-day horizon). Run `playtest-20261122T1436Z`,
Lane A. Base master `4dc7cb454` (journey-landing r154). Fresh seed band
101971–101974 (pilot 101971, panel replayed all 4 on the final driver).
Prereg: `evidence/2026-11-22/journey-establishment-r268-prereg.md`.
Driver/analyzer: `scripts/journey-establishment-r268-20261122.js`,
`scripts/analyze-journey-establishment-r268-20261122.js`.
Panel: `.../hidden_files/evidence/2026-11-22/journey-establishment-r268-panel.log`
(322 lines), per-seed JSONs + convo transcripts in the same directory.

## Verdicts

| Bar | Result | Verdict |
|---|---|---|
| Q1 WINPLAN (fresh band ignites) | planSeeds 16, 4/4 seeds; departures 48, 4/4; fights 214 | GO |
| Q3 LAUNCHVOICE (below-wave-4 launches speak) | 45 depart beats, 4/4 seeds; beats ≤ departures every seed | GO |
| Q2 DAY-DESYNC diagnostic | 29/29 events attributed, 0 unattributed; mechanism named | ANSWERED (driver artifact, not a game-clock bug) |
| SPOTTER | 29 total (bar ≥10), 4/4 seeds >0 | GO |
| LADDER | 2/4 (bar ≥3/4) | MISS (report-only under SPOTTER GO) |
| FASTER-ID | 4/4, 65 benefit plays in 114 bump calls | GO |
| END (broken-live closes ≤2 dawns) | 8/8 | GO |
| VILLAGE (alive at d40) | 4/4 | GO |
| Q2 sittings | 0/8 CUT | GO |
| Q1b want-raise | 54/259 = 20.8%, no zero-raise seed | GO |
| Q1 favorless rate | 1/54 = 1.9% | GO |
| Q5 exile warning | 2 exiles, HEARD 1, PRESENT 1, UNHEARD 0 | GO |
| COUNTER labels | 104 lines, 0 comma-clause, 0 em-dash | PASS |
| WARN-HEED | 9 sittings, 8 delivered, 0 engaged-unnamed | GO (recovered from r265's 4/20) |
| STRANDED-CLOSE | 0/2 runs closed; 10 stranded dawns; worked-on-stranded=1 | **NO-GO** — root cause found, fix landed + proof-tested (see below) |

## Census (plain words)

Four villages, all alive at day 40. 101971 is the strongest: 11 of 12 alive,
wave 4 reached, standing 125, pantry ~17k kcal, 3 plans seeded, 9 departures,
50 party fights. 101972: 9 alive, wave 3, standing 75, pantry ~20k.
101973: 10 alive (8 at day 40), wave 3, standing 50, pantry ~15k, the
busiest planner (6 plans, 17 departures, 74 fights). 101974: 8 alive,
wave 3, standing 25, pantry ~75k (a hoard, not strength — the village is
thin and rich at once). No village reached wave 5; no trio or quad ever
departed (48 departures, all pairs) — the trio gap from r265 §6 is still
open. Villagers fought in parties, taught each other (Cattail, Ginger, Tea
Bush, Lamb's Quarters all taught in sittings), proposed bonds, and two
villagers were exiled by moot with the player present or warned. One
scholar death shape to watch: F2 scholar deaths are a standing watch, not
a bar — no new signal on this band.

## People check (8 sittings, 0 CUT, read in full)

Pilot 101971: DeAndre (pantry-run ask, away-on-road deferral, Olivia gossip,
warm close); Aisling (resumes a 6-day-old thread, Lamb's Quarters teaching,
wound-cleaning ask — "I don't need you to believe in me. I need you to
watch." — engine-ended WITH closing beats). 101972: Wyatt (personal thread,
repay want names a dead promise honestly — "About the pantry run — still
open. That promise is dead, but the need isn't."); Marcel (theft-confession
secret kept, Cattail taught, deflect accepted honestly, "The old you got
you here. The new you keeps you here."). 101973: Gladys (taken-kin pod
dreams, the player promises to ask the System — a real commitment — and
the close plants it: "If it answers — you'll tell me? Whatever it says.");
Desmond (ration-theft secret kept, Ginger taught, "A plan's just a
direction you argue with."). 101974: Gus (gossip with a named detail —
Cauã tracking a snare thief by scent — plus a delivered warning, "People
are saying things. About you."); Sadie (Tea Bush taught, invite accepted
gruffly, "My carpenter instincts keep firing at the wrong things.").
All eight have a want, options that engage or deflect it, and endings that
resolve, plant, or owe. No fabricated shared history. "Walked in like
they'd never left" appears twice, both in the pilot transcript.

## Fix 1 — LAUNCHVOICE (landed pre-panel, proof-tested)

`src/js/win-plan.js`: removed the `needWave < 4` gate in
`winPlanDepartLaunchBeat`, so below-wave-4 launches speak the ordinary
depart beat. Proof `scripts/test-launchvoice-r268.js` 19/19 (10 failed
pre-fix). `scripts/test-departbeat-b.js` updated for the deliberate design
change (wave-3 launch now speaks once) — 34/34. Also green:
test-winplandepart-b 18/18, test-winplan-wake-r265 16/16,
test-bearer-end-r265 33/33, test-winplan-departures-r265 14/14.
Panel result: 45 depart beats on 4/4 seeds. [needs-eyes] — spoken
dialogue wording.

## Q2 day-desync — diagnostic ANSWERED

Net drift −1 panel-wide, only on 101971; the other three seeds net 0
(repeat+skip pairs cancel). 29/29 events attributed. Dominant shape
(~26/29): sleep refused "Dawn's an hour off — too late for real sleep"
(the driver calls sleep with <2 batches left in the day); the next loop
day's action ticks roll the day mid-parts, then sleep rolls again — a
repeat+skip pair, net 0. 101971 d40: sleep refused "Not in the middle of
a fight." 101971 d42: sleep began ("Sleep takes you") but the day never
rolled — interrupted sleep, no dawn accounting; this one uncompensated
event is the panel's whole −1. Verdict: **driver artifact, not a
game-clock bug** — the game refuses sleep honestly and offers Rest/wait;
the driver calls sleep() once per loop day and never retries.
**Follow-up for the NEXT run (not this one — changing driver policy
mid-panel would void comparability): the driver should retry sleep after
a refusal (finish the fight / wait, then sleep again).**
Caveat: the analyzer's sleep-line join window can catch the *next* loop's
refusal line (seen on 101973 d24→d26) — named here, not over-claimed.

## STRANDED-CLOSE — NO-GO, root cause found, fix landed

Two runs stranded, neither closed. 101972 Casey (bearer Paul dead),
first stranded d35, 9 dawns; 101973 Gladys (bearer Samuel dead), first
stranded d9, 1 dawn. The ending action was ready every dawn
(`forageFavorAction` ending branch: "This outing belonged to Paul/Samuel,
who is gone..."), but the sit menu never offered `dlg:favor_cancel`.
Two mechanisms, both in the conversation/menu layer (the r265 BEARER-END
proof tested only the action layer, never a sitting):

- **Mechanism A (Casey, 9 dawns):** `ask_favor.menuOptions` returns `[]`
  for any settled favor state including 'moot' (convo-wants.js ~943), so
  the sit falls back to a generic menu. The want sat at stage 0 with the
  favor never attached, so `buildMenu`'s favor branch couldn't fire
  either. A third wrinkle: the d36 sit opened on a goal question, so the
  favor menu never got a chance that dawn. (d37 was honestly blocked by
  an active event: "Finish the current event before foraging together.")
- **Mechanism B (Gladys, 1 dawn then gone):** the sit's opener found a
  new live need (food_share), built a fresh favor, and `convoStoreFavor`
  overwrote the ledger — the stranded forage favor was destroyed before
  the menu was built. The opener spoke the honest dismissal ("Never mind
  the pantry run — we got it handled"), but the run was never closed:
  the joint ledger no longer lists it, and the stranded detector never
  saw it again. The run evaporated instead of closing.

`worked-on-stranded=1` is the work wedge's single futile forage press on
Gladys's run on d9 (moved, empty press) before the end-wedge ran — a
wedge-ordering artifact, not a second hang.

**Fix (landed in the worktree AFTER the panel — the panel ran pre-fix
code, so the NO-GO stands on panel evidence):** two menu-layer changes
in `src/js/convo-wants.js`, both reusing the existing readiness check
(`convoFavorActionMenu`), no second copy of it. (1) Stage-0 surfacing:
`convoWantMenu`'s stage-0 ask_favor branch now offers `dlg:favor_cancel`
whenever the ledger favor holds a live endable run — stranded sits live
at stage 0, and the offer does not depend on a live need. (2) Settled
menu (defense in depth): the settled-state early return in
`ask_favor.menuOptions` offers ONLY the end verb when the favor has an
endable run. Proof `scripts/test-strandedclose-menu-r268.js` **16/16**
— before the fix it fails at A2 (last menu `recap,teach,dlg:subject,
leave,silence`, no cancel); after the fix a driven sitting offers cancel
on turn 1 and pressing it closes the run honestly (0 kcal unloaded, the
dead bearer's share lost with them, favor → broken). Negative controls
hold: no run → no cancel; living bearer → no cancel. The panel is NOT
re-scored: re-verification is the next run's panel (r269), which should
re-panel the stranded bar on the fixed code.
**Follow-up blank for r269:** Mechanism B's honest close — when the
opener moots a favor that holds a live unreturned run (the r34 HONEST
MOOT path), close the run's books (returned, 0 deposited) as part of
the mooting, so the spoken "we got it handled" is true on the books
too. Design-adjacent to the r34 path; needs its own proof test, not a
rushed landing.

## Metric review (for the next run)

- **LADDER 2/4** (bar ≥3/4; r265 was 4/5): report-only under SPOTTER GO.
  The ladder is thinning on fresh bands while spotter totals hold — watch
  whether it is a band effect or a real slowdown in skill formation.
- **SILENT-ARRIVAL 7/7**: seven arrivals, seven silent — no arrival line
  names any of them. A documented blank, not landed. It keeps recurring
  (r246 had 2); the arrival line is still owed.
- **WARN-HEED recovered**: 8/9 delivered (89%) vs r265's 4/20. The §8
  watch reads recovered. The warn_you DEFLECT option still never fired
  (11th carry) — the deflect path remains untested.
- **Trio gap still open**: 48 departures, 0 trios, 0 quads. The wave-4
  gate wants trios; the panel keeps producing pairs.
- **F5 floor absent on this band**: thinnest seed 18.2%, fattest 21.7% —
  the thin<7%/fat>15% shape did not appear.
- **SETTLED/DRY2/SELFWIT quiet**: 0/0/0. r152 FIX 2 settled re-ask still
  untested (settledFavorLines 0 on all seeds).
- **Q1b/Q1 healthy**: want-raise 20.8%, favorless 1.9% — both comfortably
  inside their guards on a fresh band.
- **Q5**: 2 exiles, HEARD 1 / PRESENT 1 / UNHEARD 0. The PRESENT case
  (Mara: in the room at sentencing, no advance naming) is the honest
  middle — present, not warned in advance.
- **Canned lines**: walked-in 1 distinct / 2 raw (pilot only);
  pod-dream-open 1. Nothing else fired.

## Gate and telemetry

- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
  in the worktree (see commit message for the standing-5 adjudication).
- Telemetry check vs `telemetry-baselines/establishment.json` (spotter,
  ladder, standing, wave, pantry) — LOUD lines adjudicated before any
  baseline roll; no roll on a mismatch.

## Reachable / fun / winnable (leg 1)

Reachable: yes — plans ignite on unseen seeds, departures flow, the
below-wave-4 launch beat now speaks, and the village routines (teaching,
bonds, favors, contests) all fire. Fun: yes — the eight sittings read
like people, with secrets, debts, and jokes that land. Winnable: the
chain still stalls at the trio gap (no party of three ever departed) and
at wave 4 (one seed reached it, none passed it) — the winnability push
continues upstream of this leg. The stranded-close fix removes a real
softlock-shaped hang (an outing that could never be closed); the opener
eviction close is still owed.

## Files

- Fix: `src/js/win-plan.js` (LAUNCHVOICE), `src/js/convo-wants.js`
  (STRANDED-CLOSE menu).
- Tests: `scripts/test-launchvoice-r268.js`,
  `scripts/test-strandedclose-menu-r268.js`, `scripts/test-departbeat-b.js`
  (updated for the deliberate design change).
- Driver/analyzer: `scripts/journey-establishment-r268-20261122.js`,
  `scripts/analyze-journey-establishment-r268-20261122.js`.
- Prereg + panel evidence: `evidence/2026-11-22/` (prereg, panel log,
  per-seed JSONs, convo transcripts, per-seed logs).
