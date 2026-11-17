# Journey leg ESTABLISHMENT — r230 run note (2026-11-16, Lane A)

## Run
Run id `playtest-loop-a-20261116T2239Z` (scheduled Mon 2026-11-16
15:45 CST). Rotation read `1` (establishment); write `1→2` at
closeout with read-back. **Base:** local master `63fa44d6c`
(landing r140). Heartbeat loop running (10-min cadence,
`journey-establishment-hbloop-r230.sh`, pid 45741); registration
heartbeat landed 22:43:39Z; re-heartbeat 23:10:07Z (the first
post-registration heartbeat took ~13.5 min in the registry-lock
queue — the standing <15-min rule was breached by lock contention,
not by idling; the queue has since drained and heartbeats land on
cadence). Pre-flight: main tree CLEAN, disk 45%. Lock created by
this run 2026-11-16T22:40:24Z. No push (ship loop owns pushes).
Registration took ~14 min (queued behind the reaper's registry lock
+ a Loop B registration — same shape as r225's ~5.6 min, longer
under box load).

## Pre-registered bars (r230 prereg)
Q1 FAVORLESS-ASK RE-MEASURE (r225's named next Q1). Q1b WANT-RAISE,
regression guard. Q2 SITTING CLOSES (standing bar). Q3 recap
paraphrase, REVISED to per-sitting presence (r225 metric review).
Carried bars: SPOTTER, LADDER, FASTER-ID, END BAR, TRUST GUARD,
VILLAGE BAR, JAM, STRANDED/TRAVEL/THREAD watches, PEOPLE CHECK,
SCHOLAR-DEATH standing metric, ROSTER-RECONCILIATION watch (r225
anomaly). Pilot gate passed first try (see below).

## Pilot (seed 101201, 42d)
Ran clean in ~45s: endDay 43, aliveEnd 10, aliveAt40 10, wave 3,
pantryEnd 34,121, wedgeSits 74, committed 3, bumpCalls 61,
bumpBenefit 51, codexPlants 20. Gate: 2 sittingCloses records, 69
social sits, 587 picks with wantIds, 69/69 traceStart sits with
all Q1 trace fields, bumpLog 61 with 51 benefit plays — all pilot
conditions met, panel proceeded on the same driver.

## Analyzer verdicts (r230 panel, seeds 101201–101205, 42d)
- **Q1 FAVORLESS ASK: NO-GO — 26/74 raised asks (35.1%) never
  materialized into a committable favor (r225: 19/58 = 32.8%).**
  Rate ≥ 32.8% trips the pre-registered NO-GO. But the shape of
  the miss matters, and the analyzer's new instruments split it:
  - **Stage-0-deflected: 0.** The r225 defect (an unvoiced want
    resolved as refused unheard) is GONE — no `dlg:cant` /
    `deflect_q` resolution at stage 0 anywhere in the panel. The
    r225 fix holds in the wild.
  - **All 26 favorless sits are class E1 (opener NEVER RAN),
    100%.** Same mechanism as r225, undiminished: a resume/recall/
    case thread pre-empted the opening, the fresh ask_favor want
    waited at stage 0 (stage max 0 on all 26), and no favor ever
    attached. C3c (crisis r228's stale-favor resume-opener change)
    did NOT change the shape — the class mix is identical to
    r225's E1 19/19, so the rate miss is not a C3c effect.
  - **Stage-0-surfaced: 5/26.** Only 5 of the 26 villagers later
    raised a kinded ask_favor (Gladys d26, Carlos d34, Ava d18,
    Ethan d16, Kate d24) — the want mostly does NOT re-surface on
    its own (r225's old-code proxy: 8/19). The need persists, but
    the ask stays unvoiced sitting after sitting.
  - Needs in the favorless sits: forage_help/u2 dominates, with
    heal_help/u4 and food_share/u4 among them — including urgent
    (u4) needs. Repeats: Nino ×5, Chantal ×3, Miriam ×3,
    Rayan ×2, Ethan ×2. Contentless re-seeds after favorless
    sits: 0/26 (no-seed-after on all 26 — the want doesn't even
    plant a contentless seed; it just never happens).
  - The rate rose slightly (32.8% → 35.1%) while the harmful
    consequence vanished. The honest reading: the r225 fix cured
    the false refusal, not the unvoiced ask. The ask itself was
    never reachable in these sittings — that is the defect this
    run fixes (below). The panel verdict stands NO-GO on the base
    code; the fix's effect is for the NEXT establishment run to
    re-measure.
- **Q1b WANT-RAISE: GO — 74/310 social sits raised ask_favor
  (23.9%); any-want sits 290/310; zero-raise seeds 0/5.** Kinds:
  forage_help 30, (no-kind) 26, heal_help 8, food_share 7,
  sick_help 2, stay_close 1.
- **Q2 SITTING CLOSES: 0/10 CUT — GO.** 3 engine-ended sittings
  WITH closing beats; 0 other no-close. The r224 F4a/F4b/F4c
  dry-line fixes, r228 C3c/F2 fixes, and r226 F6 dry-opener guard
  hold in the wild (0 recurrences in their classes).
- **Q3:** recap paraphrase distinct 2/10 sittings (raw 4) —
  report-only, no second formulation owed (bar: ≥6 distinct).
  Canned lines (distinct/raw): walked-in 0/0, recap-stitch 0/0,
  slope-reading 0/0, take-it 0/0, stew-bowl 0/0, pod-dream 0/0,
  pod-dream-open 0. Parting pool: 0 serves this panel (see/care/
  tomorrow all 0 — down from r225's tomorrow 1/1; report-only).
- **SPOTTER GO:** 60 total (17/14/10/15/4), 5/5 seeds > 0.
- **LADDER 4/5** (bar ≥3/4). Seed 101205 misses pace (Ruth 4 XP)
  — the thin end again: spotter XP tracks foraging volume, not
  time (same mechanism as r210/r217/r221/r225).
- **FASTER-ID GO:** 5/5 seeds, 172 benefit plays in 249 bump calls.
- **CODEX 122** plants identified at end across 5 seeds.
- **END BAR 14/14** broken-live forage closed ≤2 dawns (every one
  closed same-day). TRUST GUARD 0 drops. VILLAGE BAR 5/5 alive
  d40. JAM 0. STRANDED no-opportunity. TRAVEL no-opportunity.
  THREAD 1/1 paged closed ≤2 dawns (Miriam 101204 d10, PAGED).
  Water 0 broken-live runs.

## The fix (landed this run — the blank, filled)
**THE MENU NEVER OFFERED THE ASK.** A stage-0 ask_favor want is
unreachable, not just unvoiced:
- `convoWantMenu` returns `[]` at stage 0 AND on non-want threads,
  so in a resume-owned sitting the menu never offers the want's
  engage verb. The startConvo comment claims "the menu surfaces it
  once the old thread settles" — false in practice: a staged
  natural E1 sitting (resume fires, want stage 0, live sick need)
  offered `dlg:help` on 0 of 10 goon-pressed turns; the thread
  stayed 'recall' the whole sitting and never "settled". The want
  ended the sitting unvoiced (stage 0→3 'unestablished' at close).
- The surfacing path already EXISTS and works: pressing `dlg:help`
  runs ask_favor's engageBeat, whose deferred-after-resume branch
  states the ask ("I'm feverish, a cut gone hot and angry. Will
  you help me?"), stage 0→2, favor attached. Forcing the call in
  the staged probe proved it. The defect was purely that the menu
  never offered the verb.
- `src/js/convo-wants.js` (+30/−0): `convoWantMenu` now offers
  ONLY `dlg:help` for a stage-0 ask_favor want with a live need
  (gated on `convoFindFavorNeed` returning a need — no need, no
  offer). No commit/cant at stage 0: deciding an ask the player
  never heard is the phantom-promise / false-refusal shape. The
  player can still ignore it and stay on the resumed thread. The
  question-hang gate still applies (answers come first). Other
  wants keep the stage-0 gate (scope preserved — a stage-0
  `curious` want still gets no menu).
- `src/js/convo-dialogue.js` (+2/−2, comment only): the r225 comment anchoring the live
  definition to "convoWantMenu returns [] at stage 0" now names
  the r230 surfacing exception (dlg:help only, engages rather
  than decides), so the anchor stays honest.
- Probe re-run on the fix: turn-0 menu leads with `dlg:help`
  (`[dlg:help, dlg:react, dlg:subject, leave, silence]`); the
  wedge's own pick rule (goon first, else first unseen) presses
  it on turn 0 (no goon offered early) and the want surfaces
  (stage 0→2 by turn 1). The ask is reachable through the actual
  player model, not just a forced call.
- Proof test
  `scripts/test-journey-establishment-r230-stage0-help-20261116.js`
  **13/13 PASS on the fix; 10 pass / 3 fail on the base** (stash
  round-trip — the 3 failures are exactly the menu-offer
  discriminators C/C2/C3: menu `[]` at stage 0 on base; D/D2/D3
  pass on base too, honestly — the engage path already existed,
  the fix is the menu offer). Carried proof tests re-run green
  on the fixed code: r225 stage0-cant 16/16, r214 mood-goodbye
  10/10, r139 spotter 35/35, r221 want-raise 7/7.
- Analyzer instruments proven on the r225 corpus BEFORE the panel
  (symlinked r225 JSONs/txts under r230 names): SPOTTER 72,
  LADDER 4/5, FASTER-ID 5/5 (198/240), Q2 0/10, Q1 19/58 E1 19
  with stage-0-deflected 4 naming exactly Ruby d22/d31, Stan
  d34, Aki d32, Q3 distinct 4 (raw 8) — every known number
  reproduced exactly. The r230 panel's Q1 numbers above come
  from proven instruments.

## Q4 — census (plain words)
Five villages, 42 days, all alive at day 40 (5/5), wave 3 on all
five. They are not the same village five times: seed 101202 is
the fat one (pantry 94,369 kcal, 12 of 12 alive, nobody died);
seed 101203 is the thin one (pantry 16,999 kcal, 12 of 12 alive
anyway — thin but nobody died); seeds 101204 and 101205 each
lost three people and ended with 9 alive.
- **The dying:** 6 named villagers died across the five villages
  (of 184 death events — the rest are monsters the villagers
  killed, ~30–40 per village). Causes: Esmeralda d10 sickness
  (101204), Wei d31 monster (101204), Emmett d36 Gavel (101204),
  Ivan d22 Loud-Eyes (101205), Miles d33 the arena (101205),
  Chantal d35 monster (101205). Nobody starved. No scholar died
  on any seed (0/5 — inside the standing WATCH bar, and the
  first panel in the r137–r225 run at zero).
- **The vanishing (roster watch, RECURRING):** seed 101201 lost
  two villagers on d16 with NO death record of any kind — the
  end census is missing two still-unnamed villagers ("A person,
  maybe 60s", "A woman, maybe 60s") while the deaths list holds
  only monster kills. This is the r225 101101 anomaly (Morgan +
  Naran) a second time: 2 of 6 seeds across r225+r230 lose
  villagers without a trace. The other three seeds reconcile
  exactly (101204/101205: 3 missing = 3 named deaths each).
  Either two deaths were recorded as monster kills, or two
  villagers departed unrecorded. Still no departure record
  anywhere in the panel data. Carried as a finding, not a
  defect claim: the census instrument needs a departure/death
  record before anyone claims the count is complete. (Owed to
  a future establishment run's driver: capture the full end
  roster with dead flags, not just the living.)
- **What they knew:** the scholar's plant codex holds 20–31
  plants per village at end (122 total). Spotter knowledge
  concentrates in one forager per village (Hazel 17, Clarence
  14, Ernesto 10, Marvin 15, Ruth 4) — practice earns it, one
  person per village carries the specialty. Seed 101205's Ruth
  (4 XP) is the thin end.
- **What they carried:** joint favors are all forage_help (4–8
  commits per seed; 30 total — same as r225's 30). Pantries end
  16,999–94,369 kcal. No wave-4 kills and no party launches in
  the instrumented records — the villages fight wave 3 and hold;
  party launches are not instrumented by this driver (sim lane's
  territory).
- **Social life:** wants are raised in 94% of social sits
  (290/310). The gap this run closes is the other side of r225's
  fix: a villager with a live need can now actually be asked
  "How can I help?" — and will answer.

## People check — PASS (seed 101203, Seymour + Victor, read in full)
- **Seymour** (carpenter): opens resuming a plant lesson from 2
  days back. The player invites him along; he accepts ("Okay.
  Yeah. I trust you."). Recap brings the paraphrase ("that plant
  lesson — that's still where we are"). Then a real question —
  "What scares you most about what's happening?" — the player
  answers honestly ("That it's intentional..."), Seymour: "Yeah.
  Me too. The randomness would almost be kinder." Then "That
  we're interesting to it. Being watched means being kept. I'd
  rather be boring to the sky. Boring things get left alone." —
  characterful, coherent, dark. Subject change to personal: the
  hardest part is "not knowing if anyone else made it." Ends
  "Okay. We'll pick this up later." + "Good talk. I feel like I
  know you a little better now." + "This was good." They mean it.
  PASS. Nit, not a defect: the resume opener quotes a stray
  wind-down fragment ("'The moment passes without landing. Not
  yet.'") that doesn't fit a plant lesson — the snippet quoted
  inside the resume opener doesn't always match the thread.
- **Victor** (appliance repair tech): opens resuming "that
  personal stuff" with a cellar-of-jars snippet. Invite: "Alright.
  But I'm not carrying your stuff." Recap: "Like I said — we're
  still on that personal stuff." Then a pause, "something else
  entirely" — "Do you still sing? ...Sorry — weird question. I
  just realized I haven't heard anyone sing." The player's
  shower/creek joke lands ("Ha! The creek concerts. I've heard
  those. Keep going."). "Old songs from Columbus, Ohio. The words
  are half gone but the tune holds. Tunes outlast everything." —
  beautiful. Subject change → field question → "an old trapline
  — remember the shape of it. It's real, and it's worth knowing."
  Close: "Good talk." + "Good — that personal stuff, settled.
  Feels better said out loud." + "They're smiling as you go.
  'Come back anytime.'" PASS. Note: Victor IS one of this panel's
  favorless sits (101203 d41, heal_help/u4, class E1) — in a
  different sitting he needed healing help and never got to ask.
  That is the Q1 finding in human terms.

## Verdicts (leg: establishment, days 14–40)
- **Reachable:** YES. All five villages play the full 42 days;
  sittings, teaching, favors, contests, waves 3 all fire.
- **Fun:** YES. Conversations land, close, and resolve; the
  villages feel inhabited; Seymour's sky-watching dread and
  Victor's creek concerts are the game at its best.
- **Winnable:** ON TRACK for the leg, with the Q1 NO-GO standing
  as the leg's open item. Villages survive, gear up, kill ~30–40
  monsters each, bank spotter skill, and reach wave 3 on 5/5
  seeds. No village reached national/table — expected at day 42.
  The binding watch is now a fix with a proof: a villager asking
  for help will be offered "How can I help?" instead of waiting
  unvoiced — the next establishment run re-measures the rate.

## Metric review (§14)
- **Q1 RE-MEASURE BAR WORKS, and it caught the real shape.** The
  rate (35.1%) and the stage-0-deflected count (0) split the
  verdict honestly: the r225 fix cured the false refusal while
  the ask stayed unreachable. The NO-GO stands as printed — the
  run does NOT re-score it because a fix landed mid-run. The
  next establishment run's Q1 is the re-measure of THIS fix:
  does the favorless rate fall, and do stage-0 wants now surface
  as kinded asks (the analyzer's stage-0-surfaced proxy: 5/26
  this panel, 8/19 on r225's old code).
- **Q1b bar WORKS.** 23.9% panel rate (up from r225's 16.8%),
  no zero-raise seed. Keep as written.
- **Q2 bar WORKS on the new base.** 0/10 CUT with the r228/r226
  fixes in the game. Keep as written.
- **Q3 — REVISED INSTRUMENT PROVEN.** Per-sitting presence
  counts 2 distinct (raw 4) this panel; on the r225 corpus it
  reproduces the hand-corrected 4 (raw 8) exactly, and walked-in
  3 (raw 6). The revision is the metric now; the raw counts
  stay printed as the audit trail. Threshold ≥6 distinct stands
  for the next run.
- **Scholar deaths 0/5 — first zero in the r137–r225 run**
  (which sat at 2, 2, 2, 2, 1). No investigation triggered;
  report the break in the streak.
- **LADDER pace read, again:** the thin seed (101205, Ruth 4 XP)
  misses pace while foraging least — spotter XP tracks foraging
  volume, not time. Not a bar failure.
- **101201 roster anomaly (RECURRING, upgraded from watch):**
  two villagers vanish d16 with no death record — second
  occurrence in two runs (r225 101101, r230 101201). The census
  instrument is owed a departure/death record; the next
  establishment run's driver should capture the full end roster
  with dead flags.
- **Death telemetry names:** the known limitation stands (most
  death events name monsters as "Someone"); the census can say
  how many monsters died and name the villager deaths that carry
  kind 'villager'/'person', but combat deaths that record only
  as monster kills leave the two 101201 villagers unnamed. Not
  a finding beyond the roster watch above.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/establishment.json`
(metrics guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths):
- LOUD: guardrails.deaths 604 → 0; guardrails.popAlive 178 → 0;
  guardrails.pantryKcal 1210411 → 0.
- Adjudicated: the KNOWN schema mismatch (prereg-predicted) —
  the driver never emits `guardrails.*` fields, so the checker
  reads missing paths as 0. Not a game change; the r230 panel's
  deaths / pantry are all in-band in the analyzer (5/5 alive
  d40, pantries 16,999–94,369, 0 starvation deaths).
  Baseline NOT rolled (prereg: never roll on a mismatch).

## Gate check

Adoption re-run (the coordinator's 328/12 count has no log on disk):
`node scripts/check.js --quick` in the worktree, log
`evidence/2026-11-16/journey-establishment-r230-gate.log` —
**330 passed, 10 failed in 1391s, 0 attributable.**

- 5 exact-120s timeouts, all PASS standalone WITH logs:
  occupation-panels (25/25), living-garden (8/8), one-person-army
  (7/7), comfort-arc (9/9), trust-observer-neutrality (6/6 — the
  load-crash seen in the Lane B r230 adoption did NOT reproduce here
  on a quieter box, confirming the load-artifact reading).
- 5 standing failures: measurement-proof-update +
  measurement-workflow (staleness pair), phone-frame-proof (stale
  receipt), ladder-bundle (standing control failure: "200 monster
  turns WITHOUT delivery fire the ambient raid — fires 0"),
  measurement-cache-flags (0/4 in-gate; 0/4 standalone twice in the
  Lane B r230 adoption AND 0/4 on master — pre-existing load class,
  not attributable).
- Standing profile matches r225/r226/r229/r230-Lane-B modulo the
  load-artifact rotation. Gate GO for adoption.

## Closeout

Adoption by the main session (coordinator timed out before closeout;
its gate count 328/12 has no log on disk — re-run by the adoption,
330/10, 0 attributable). Fix committed [needs-eyes] (dialogue-behavior
change, r140 precedent); evidence committed separately. Rebased onto
current master, proof 13/13 re-run on the rebased tip, ff-merged,
tree released, branch deleted. Rotation-a 1->2. Lock
`playtest-loop.lock` (run `loop-a-20261117T004410Z`) deleted at
closeout after run_id verification. Adoption notes: the coordinator's
19:45 occurrence stood down on a provably orphaned hbloop (pid 45741,
PPID 1 — coordinator dead, loop alone kept the heartbeat fresh);
the hbloop was killed by exact PID and the tree re-heartbeated by the
adoption. Telemetry LOUD on guardrails.* = the known schema mismatch
(driver never emits those fields), baseline NOT rolled.
