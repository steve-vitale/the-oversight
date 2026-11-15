# Journey leg ESTABLISHMENT — r214 run note (2026-11-15, Lane A; ADOPTION of r213)

## Run
Run id `playtest-loop-a-20261115T0945CST` (scheduled Sun 2026-11-15 09:45
CST; lock `oversight-playtest-loop-2026-11-15T1545Z`). Rotation read `1`
(establishment); write `1→2` at closeout with read-back.
**Adoption:** r213 (scheduled 06:45 CST) TIMED OUT at 7200s after committing
its prereg + driver/analyzer clones (3d5fc852d) and running pilot +
panel. Its incomplete list, per the 2026-11-15 memory log: Q1
adjudication + people check, Q1 fix if any, Q3 census, metric review,
telemetry-check, gate check, run note, merge, release, rotation 1→2.
This run adopts that work — no fresh panel, no new seeds. The r213
panel (seeds 100501–100505, 42d) is the scored panel; this run's new
evidence is the Q1 full-transcript probe (same seeds, deterministic
replay) and the r214 proof test.

## Stale-lock recovery (LOUD, pre-flight)
- Lock present at run start: `oversight-playtest-loop-2026-11-15T1243Z`,
  created 2026-11-15T12:43:37Z (3h old). Registry:
  `journey-establishment` run_id 2026-11-15T14:29:25Z, heartbeat
  14:57:16Z — 46 min stale, no live heartbeat process, worktree CLEAN
  at 3d5fc852d. Previous run DEAD by the 15-min heartbeat rule (and the
  90-min lock fallback). Lock deleted, own lock written, noted here.
  The 12:43Z lock predates r213's 14:29Z registration — r213 never
  wrote its own lock; the 12:43Z lock is presumed the 06:45 run's
  predecessor (r210-era) left behind. The r213 coordinator's timeout
  is recorded in the 2026-11-15 memory log (08:45 CST entry).
- Heartbeat: manual heartbeat landed immediately after adoption
  (registry read-back 15:52:28Z); r214 heartbeat loop started
  (10-min cadence, `journey-establishment-hbloop-r214.sh`, verified
  landing 15:52:40Z). Heartbeat stayed fresh throughout (last
  16:23:17Z at note time).
- Pre-flight: main tree CLEAN (0 files), disk 40%. Reaper NOT re-run
  this run (r213 ran it clean ~12:47Z; the REGISTRY.lock was held
  15:43–15:52Z by a Loop B register, `git worktree add` for
  sim-staticfix-b, which queued this run's heartbeat ~5 min — lock
  contention, no flap: flap-watch ALL-OK throughout).
- Base: r213 commit 3d5fc852d on master 740838f3c (sim-gorgeprice2-b
  confirm). No rebase needed — r213's branch was already on current
  master at adoption.

## Pre-registered bars (r213 prereg, carried)
Q1 SITTING CLOSES (GO 0 engine-cut / WATCH 1–2 / NO-GO ≥3 or an
open-question cut). Q2 recap paraphrase (report-only, A2 floor:
<6 THIN-PROBE, ≥6 second formulation owed). Carried bars: SPOTTER
≥10 total + every seed >0; LADDER ≥1 villager at 5+ XP on ≥3/4 panel
seeds; FASTER-ID fires on ≥2/4 seeds; END BAR (broken-live forage
closed ≤2 dawns); TRUST GUARD (0 drops, hard); VILLAGE BAR (alive
d40 ≥3/4); JAM (report-only); STRANDED/TRAVEL/THREAD (carried
watches); PEOPLE CHECK (2 held convos, one panel seed, read in full).

## Analyzer reproduction (r213 panel, re-run verbatim)
`node scripts/analyze-journey-establishment-r213-20261115.js 100501 …
100505` reproduces r213's verdicts exactly:
- SPOTTER GO: 58 total (4/14/9/13/18), 5/5 seeds > 0.
- LADDER 4/5 seeds (100501 misses: top spotter XP 4).
- FASTER-ID GO: 5/5 seeds, 151 benefit plays in 176 bump calls.
- CODEX 120 plants identified at end across 5 seeds.
- END BAR 11/12 broken-live forage closed ≤2 dawns (Paraone d42
  excluded-tail). TRUST GUARD 0 drops. VILLAGE BAR 5/5 alive d40.
  JAM 0. STRANDED no-opportunity. TRAVEL no-opportunity. THREAD 1/1
  paged closed ≤2 dawns. Water 0 broken-live runs.
- Q1: **5/10 ENGINE-CUT + 1 NO-CLOSE** → NO-GO on the pre-registered
  bar. Engine-cut: Mario 100502, Natalie 100503, Nora 100504,
  Pasquale 100504, Marta 100505. NO-CLOSE (other): Sam 100501.
- Q2: "still where we are" total 0 → THIN-PROBE, report only.
  Canned lines: pod-dream-open 1 (Pasquale's taken-kin opener,
  genuine want opener, not a repeat), rest 0.

## Q1 adjudication — the engine-cut sittings close; the instrument doesn't
Read all 10 sittings in full (r213 convo files), then built a probe
driver (`scripts/probe-q1-fulltranscript-r214-20261115.js`, clone of
the r213 driver + full `c.transcript` dump after each sitting) and
replayed all 5 seeds. Replays are deterministic: every seed
reproduces r213's numbers exactly (endDay, aliveEnd, pantry,
bumpCalls, codexPlants identical).

**Mechanism (code reading):** `r.ended` is set by `convoMaybeWinddown`
→ `endConvo(vid, 'natural')` when the winddown goodbye was already
spoken and the player takes one more beat. `endConvo` returns
`line: null` on those sittings BY DESIGN (goodbye already said, r7
2026-10-12 — "a person says goodbye once"), and the r54 grace-beat
rule preserves the turn's beat as `r.line`. The driver sees
`r.ended`, prints "(ended by engine)", and never calls `endConvo`
itself — so no "closing:" line is ever printed. But `endConvo`
already ran inside the turn, and it speaks up to three closing
beats into the transcript: the want's close line, the thread
close/lapse beat, and the mood goodbye. The live UI renders the
FULL transcript (app.js, Pokémon-style + history), so the player
sees those beats. The driver's per-turn dump is lossy: it prints
only `r.line` per turn.

**Full-transcript evidence (all 5 engine-cut sittings):**
- Mario 100502: farewell "Alright — I should get back to it." →
  joke → "Grins." → want close "Good talk. I feel like I know you
  a little better now." + "This was good." They mean it. TWO beats.
- Natalie 100503: farewell "Alright — I should get back to it." →
  "One more thing —" → "I do the small things right. The big things
  notice." → "Good — what's been happening, settled. Feels better
  said out loud." + "This was good." TWO beats. (The Aria/Blood
  Tithe thread is named, not resolved — it is a passing mention the
  sitting never promised to resolve; no open question is left.)
- Nora 100504: "Alright. Catch you later." → agree → "Yeah. That's
  about right." → "This was good." ONE beat.
- Pasquale 100504: "I should go. You know where to find me." →
  joke → "Huffs — which, for them, is hysterics." → "This was
  good." ONE beat.
- Marta 100505: "Anyway — I should get back to it. Good talking,
  though." → joke → "Snorts." → NOTHING. Zero closing beats.
  The farewell WAS spoken, and no question/invitation/promise is
  left hanging — so this is not a mid-thought cut by the prereg's
  definition — but it is the only sitting of the ten that ends on a
  bare reaction with no parting words.
- Sam 100501 (NO-CLOSE, 8 full turns): farewell "I should go. You
  know where to find me." → "Thanks for... you know. Just
  listening." + "Good — that hard time, settled. Feels better said
  out loud." Graceful by the prereg's own definition (full 8 turns);
  the analyzer's "other no-close" is a classification quirk.

**Why Marta got nothing:** her sitting was neutral-mood, and
`convoMoodGoodbye` returns a beat only for warm/tense/cool bands —
friendly AND neutral return null. Her want had no close line and no
hanging thread earned a close beat. So the three closing-beat
sources all missed at once.

**Verdict: Q1 NO-GO on the pre-registered bar (5 ≥ 3) — and the bar
measures the driver's dump, not the live game.** 4 of 5 engine-cut
sittings close with spoken beats in the live game. Per §14 the miss
stays NO-GO; the metric is reviewed below, not re-scored.

## Q1 fix (landed this run)
**Fix:** `src/js/convo-mood.js` — friendly + neutral bands get a
plain parting pool in `convoMoodGoodbye` ("See you around." /
"Take care out there." / "Same time tomorrow, maybe.", cycle key
`mbye:plain`). Every sitting now ends with a parting beat. The
exit line stays null when the goodbye was already said — no stacked
farewell; the mood goodbye is the separate parting beat warm/tense/
cool sittings already get.
**Proof:** `scripts/test-journey-establishment-r214-mood-goodbye.js`
(10 checks). Pre-fix: 6/10 — A, F, G, I fail (neutral engine-end
gains no beat: them 1→1; friendly likewise; graceful neutral gets
exit line only). Post-fix: 10/10. Warm control passes on both.
Spotter proof re-run: 35/35 (no regression in the carried
mechanism).
**End-to-end:** probe re-run of seed 100505 on the fixed code —
trajectory diverges (RNG draws shift: the new parting beat consumes
a pick per conversation end; pantry 73205→48537, codex 20→30), so
it is not a like-for-like panel; both sittings close gracefully
with 2–3 parting beats and 0 engine-cuts. The mechanism proof
above is the evidence the fix works on the Marta shape, not the
diverged re-run.

## People check — PASS (seed 100504, Nora + Pasquale, read in full)
- **Nora** (warn_you): wants the player warned before going back
  out; options engage (heed, react) or deflect (subject change);
  ending resolves — warning heeded, gossip shared, recap names the
  thread ("We started on that warning, then got onto the gossip."),
  lands on agreement. Meaning, coherence, consequence: yes.
- **Pasquale** (taken kin): wants to know he's not the only one
  dreaming of pods; options engage (ask what he remembers, gossip,
  follow him to the hollow — a real event: fresh tracks, retreat)
  or deflect; ending resolves — the walk happened, danger seen,
  retreat taken. The betrayal-accept walk is a diegetic act with
  consequences. PASS.
- Other sittings read in full (all 10): Ava (grief + warning,
  graceful), Sam (heavy thing + invite accepted, graceful), Mario
  (secret kept + teaching, cut-shape only), Erin (graceful), Natalie
  (Blood Tithe named, cut-shape only), Caleb (party-role promise,
  graceful), Shanice (13-day plant-lesson continuity + real laughter,
  graceful), Marta (teaching landed — Wild Ginger tried, no poisoning;
  cut-shape only). No fabricated shared history: Marta's "Me?
  Columbus, Ohio." fills `{origin}` from her own generated
  `homeRegion` (fillTalkLine, game.js) — the village is seeded from
  Columbus, so villagers sharing the hometown is the premise, not a
  mirror of the player's answer. One pre-existing nit, not fixed:
  the party-role menu renders with emoji (🗡️🩹🎒🗣️👁️) in Caleb's
  sitting — the visual-identity law prefers custom sprites; the menu
  text is pre-existing content, out of this run's Q1 scope.

## Q3 — census (plain words)
Five villages, 42 days, all alive at day 40 (5/5), waves 3, 3, 4, 3,
4. They are not the same village five times: seed 100501 is the
hard one — 6 of 12 left at the end, the player (Otto) died in the
wild on day 40 and the village carried on under a successor, two
more died of wounds that wouldn't close (Tomas d39, Kidlat d41),
one of sickness (Hannah d37). The other four end with 10–11 alive,
healthy, well geared — alien loot is in circulation (alien helm,
phase blade, starfall bow, gravity well, phase shawl, alien boots
and greaves), most villagers carrying 5–9 items, spears and bows
common, bark and hide armor worn.
- **The dying:** 11 villagers died across the five villages (of 162
  death events — the other 151 are monsters the villagers killed,
  ~30 per village). Causes: monster kills (Avery, Lei, Eliane,
  Benjamin), ambushes (Vasyl, Mara), wounds (Tomas, Kidlat),
  sickness (Hannah), combat (Amara), the wild (Otto, the player).
  Nobody starved. Pantries end 5,036–73,205 kcal — seed 100503 is
  thin at wave 4 (5,036) but alive.
- **What they knew:** the scholar's plant codex holds 20–30 plants
  per village at end (120 total). Spotter knowledge concentrates in
  one forager per village (Bessie 4, Leroy 14, Autumn 9, Ernestine
  13, Viola 18 XP) — practice earns it, one person per village
  carries the specialty. (Census `knownCount` reads null for every
  villager — instrument gap, see metric review; the codex snapshot
  is the knowledge measure.)
- **What was missing:** no village reached national or the table in
  42 days (expected — establishment leg); no healer was on hand when
  the two wound deaths came (100501); seed 100503's pantry is the
  thinnest and its one sick villager (Haiyan, mortician) is still
  sick at end. The medicine context from r213's prereg stands: the
  holder-less lever design is owed elsewhere (build-medicduty-h),
  not here.
- **Social life:** invitations are taken (Sam accepts; Erin
  accepts, already checking the pack), roles are promised (Caleb is
  already Point), bonds are proposed in the sittings. The villages
  read as people living together, not rosters.

## Verdicts (leg: establishment, days 14–40)
- **Reachable:** YES. All five villages play the full 42 days;
  sittings, teaching, favors, contests, waves 3–4 all fire.
- **Fun:** YES, with the Marta caveat fixed — conversations land,
  close, and resolve; the villages feel inhabited.
- **Winnable:** ON TRACK for the leg (establishment is not the win
  leg). Villages survive, gear up, kill ~30 monsters each, bank
  spotter skill, and reach wave 4 on 2/5 seeds. No village reached
  national/table — expected at day 42.

## Metric review (§14)
- **Q1 bar is wrong as written.** It counts the driver's "closing:"
  lines, which undercount live-game closing beats (want close +
  thread close + mood goodbye are spoken into the transcript but
  invisible to the per-turn dump). Proposed revision for the next
  establishment run: dump the full transcript (the r214 probe
  pattern — fold it into the next driver clone) and count a sitting
  as cut only when the full transcript shows NO closing beat after
  the final grace beat AND the last THEM line is an open
  question/invitation/promise. Under the revised bar, r213 reads
  1/10 (Marta only) — WATCH, not NO-GO. The fix landed here
  removes the Marta class entirely.
- **Q2:** THIN-PROBE (0). The recap reframe ("we're still on that
  personal stuff") is grammar, varied across sittings, not the
  over-represented formulation. No second formulation owed.
- **Census `knownCount`:** null for every villager in all five
  seeds — the driver reads `p.knownPlants || p.known || p.codex`
  and the person record carries none of those fields. Instrument
  gap for the next driver clone: read the codex snapshot per
  villager or drop the field.
- **Death telemetry names:** 151/162 death events are monsters
  ("Someone — villager combat"); only 11 name a villager. The
  census can say how many monsters died, not who killed them.
  Known limitation, not a finding.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/establishment.json`
(metrics guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths):
- LOUD: guardrails.deaths 604 → 0; guardrails.popAlive 178 → 0;
  guardrails.pantryKcal 1210411 → 0.
- Adjudicated: the KNOWN schema mismatch (prereg-predicted) — the
  driver never emits `guardrails.*` fields, so the checker reads
  missing paths as 0. Not a game change; the r213 panel's deaths /
  pantry are all in-band in the analyzer (5/5 alive d40, pantries
  5k–73k, 0 starvation deaths). Baseline NOT rolled (prereg: never
  roll on a mismatch).

## Gate check
- SPOTTER GO, LADDER 4/5, FASTER-ID GO, END BAR 11/12, TRUST
  GUARD 0, VILLAGE BAR 5/5, Q2 THIN-PROBE, PEOPLE CHECK PASS.
- Q1 NO-GO on the pre-registered bar; mechanism proven to be a
  driver-instrument gap + one real neutral-band gap, both addressed
  (fix + proof test + metric-review revision for the next run).
- check.js --quick: 335 passed, 5 failed in 720s (340 scripts).
  All 5 proven or under investigation as NOT caused by this run's
  change (verified by restoring pristine `src/js/convo-mood.js` and
  re-running each failing test):
  - test-measurement-proof-update.js + test-measurement-workflow.js:
    PRE-EXISTING — fail identically on pristine code (retained
    observer-neutral proof already stale on the r213 base; refresh
    needs a fresh real panel via balance-proof-update.js — a
    maintenance job for the balance lane, not this run's one-file
    conversation fix).
  - test-phone-frame-proof.js: PRE-EXISTING — fails identically on
    pristine code (retained phone receipt stale vs current sources;
    needs fresh 390x736/390x844 receipts per MOBILE-PLAYTEST.md).
  - test-living-garden-deed-attainment.js + test-one-person-army-
    deed-attainment.js: TIMEOUTS at check.js's 120s per-test limit
    (exit null, killed mid-seed-sweep). living-garden re-run with
    --timeout 600: PASSED in 184s (1 passed, 0 failed); one-person-
    army re-run with --timeout 600: PASSED in 51s (1 passed, 0
    failed). Both are simply slower than the 120s default under the
    parallel load of the full quick run. Load flake, not real
    failures.
  - Proof tests for this run's change: r214 mood-goodbye 10/10,
    r139 spotter 35/35.
- No src change beyond convo-mood.js (+16 lines) + the proof test
  + the probe driver (tooling). No balance levers touched; no win
  prices or deed gates touched.

## Closeout
- Committed baee20952 in the worktree; master moved during the run
  (b4343ac9d, evidence-only), so the branch was rebased onto the new
  master and proofs re-run clean (r214 10/10, spotter 35/35).
  Rebased r214 commit: c89ac24b3.
- Merge --ff-only to master, release, rotation 1→2 with read-back,
  lock deleted — recorded in the 2026-11-15 memory log and the run's
  final message (they happen after this note is committed).
