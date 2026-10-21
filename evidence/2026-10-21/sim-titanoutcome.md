# sim-titanoutcome — backlog #784: titan engagement-outcome record (2026-10-21)

Arm: sim-titanoutcome (FIX + instrument, game-code record). Worktree: sim-titanoutcome, base 2b7ec8488. Axis: scale-onramp (the blocking axis; the #749 census-split family). Answers backlog #784 (claimed by this run).

Canon: docs/CANON.md + docs/MONSTER-WAVES.md (the titan class is a FLAG in src/data/titans.json — herald / apocalypse(nielsen|finale); "no solo fights — hard gate, not a stat check"; coalition warfare with named allied faces fighting blow-by-blow). evidence/2026-10-21/sim-killdisc.md (the killdisc v2 instrument, this arm's base) and evidence/2026-10-21/sim-tabledeed-voice.md (the #784 finding: "no log records a titan retreat, so a 'fled' encounter is never voiced").

Named next this arm answers (#784): the wave-4/titan census inflates 'unresolved' because titan muster/coalition engagement outcomes (fought / fled / slain / evaded / tb-refused) have no structured record — the muster gate refusal, the coalition-break-and-run, and the stand-down are said aloud and moment-logged, but nothing joins them per encounter.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — from the arm brief, written BEFORE any sims)

**PRIMARY:** ≥95% attribution of titan coalition engagements on ≥12 wave-4-unlocked runs, 0 unexplained, 0 instrumentErrors.

**Game-code gate (the record is a src/js change):** det-gate byte-identical trajectories record-ON vs record-OFF on 4 paired seeds (the record must not perturb game state). §14: a miss is NO-GO, never re-scored mid-run; metric doubts go under "metric review".

**Corpus:** 8 FRESH seeds (64801–64808 — verified unused: zero hits in scripts/) × {leadfeast, belongfeast} = 16 runs, 180d death-aware, on the vgearconfirm substrate (VGEAR=1 FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1) + TITANOUTCOME=1 (the census instrument). Corpus: evidence/2026-10-21/perseed-titanoutcome/.

## Phase 1 — read-only detection on existing corpora (zero new sims)

Script: scripts/titanoutcome-detect-20261021.js.

- killdisc corpus (16 runs, 12 wave-4-unlocked): 35 titan TB encounters observed, ALL tb-refused (started=false), 0 unexplained → **100% read-only detection of the refused class**.
- fought / fled / slain: **ZERO instances in any existing corpus** — the capture path exists in killdisc v2 (startCombat+tbEnd wraps) but is unproven.
- evaded (titanStandDown → ledger 'titan:standdown:'): **not capturable read-only** — no corpus persists the ledger.
- slain post-hoc (state.titans.slain): **not capturable read-only** — no corpus persists final state.titans.

**Phase 1 verdict: PARTIAL → Phase 2 justified.** tb-refused is 100% detectable read-only, but the full 5-class taxonomy (fought / fled / slain / evaded / tb-refused) is NOT established read-only. The instrument-only path is insufficient; the minimal game-side record is needed.

## Phase 2 — the minimal game-side record (src/js/titans.js ONLY)

`state.titans.outcomes` — one structured record per titan muster engagement, append-only (fought records resolved in place to their terminal so the census has exactly one record per encounter):

| Outcome | Written where | Meaning |
|---|---|---|
| `refused` | startCombat wrapper, both refusal branches | hard gate fired, no fight (detail: gate muster/campaign, have/need) |
| `fought` | startCombat wrapper, fight marked | coalition fight started (detail: blades) |
| `slain` | titanResolveFight, result==='won' | titan slain by the coalition |
| `fled` | titanResolveFight, otherwise | "the coalition breaks and runs" — THE #784 GAP, now logged |
| `stood-down` | titanStandDown | muster broke before the fight (the census's evaded class) |

Pure log writes: no RNG drawn, no game logic reads `state.titans.outcomes` (proven by static audit — every `.outcomes` access outside the record functions is absent), no behavior change. Exposed on `Game._titanTest` (titanRecordOutcome / titanResolveOutcome / titanOutcomeLog) for proof tests. Constraint honored: src/js/table.js, src/js/standing.js, src/js/game.js untouched.

**Instrument** (scripts/titanoutcome-instrument-20261021.js, TITANOUTCOME=1 — adapted from killdisc v2, not modified): per-titan startCombat census (muster snapshot: omen stage, allies, haven blades, ready/need/have, started, fightId), tbEnd result matching by fightId, tbBarrierExit dissolve detection, titanStandDown wrap (evaded class), daily state.titans census. `crossCheck(Game, t)` joins instrument encounters ↔ game-side records in both directions; residuals are the attribution gate's residual.

**Analyzer**: scripts/titanoutcome-analyze-20261021.js. **Sweep**: scripts/titanoutcome-sweep-20261021.js.

## Proof (scripts/test-titanoutcome-20261021.js — ALL 38 GATES GREEN)

- (c) RED→GREEN on the real wrapped engine paths:
  - RED confirmed on base titans.js (record functions absent; refusal writes nothing; refusal still returns null — the gate behavior is unchanged).
  - F1 refusal (no muster) → null + one `refused` record {gate:'muster', have:0, need:10}.
  - F2 scripted 10-blade muster → startCombat builds the coalition fight, 10 kind:'ally' fighters injected → `fought` record at mark → tbEnd('won') → resolved in place to `slain` {result:'won'} + st.slain.herald set.
  - F3 same → tbEnd('lost') → resolved to `fled` {result:'lost'} + muster nulled.
  - F4 titanStandDown on a standing muster (omen stage 2) → `stood-down` record. (First attempt failed honestly: the fixture omitted the omen and the game correctly refused the stand-down — the fixture was fixed, not the game.)
  - Instrument classifier unit checks: evaded / tb-refused / slain / fled / open-fight→unresolved.
- (b) STATIC AUDIT: only src/js/titans.js changed under src/; added lines draw no RNG; no game logic reads state.titans.outcomes; record fns exposed on _titanTest.
- (a) DET-GATE: record-ON vs record-OFF (base titans.js from HEAD) byte-identical dayHash trajectories on 4 paired seeds (lead+belong × stable seeds, OFF-vs-OFF stability pre-check) — the record does not perturb game state. Record live on ON (sanity).
- (d) SWEEP GATE: the real sweep script on 1 seed × 1 policy — per-seed JSON written, 0 instrumentErrors, cross-check clean, re-run byte-identical.

## Corpus results (16 runs, fresh seeds 64801–64808 × {leadfeast, belongfeast}, vgear substrate, 180d death-aware)

Analyzer: scripts/titanoutcome-analyze-20261021.js. Corpus: evidence/2026-10-21/perseed-titanoutcome/ (16 per-seed JSONs + _summary.json).

Wall numbers: wins 10/16, national 7/16, table 12/16, wave-4 unlocked 12/16, wave-5 unlocked 1/16. Median gameDays 95 (endReasons: over-other 10, village-lost 4, survived 2). Herald omen reached stage 2 (placed) in 8/16 runs.

Attribution: **15/15 titan encounters = 100.0%** — classes: {tb-refused: 15}. Game-side records: 15 (all `refused` {gate:'muster', have:0, need:10}), matching the 15 instrument encounters one-for-one.
Unexplained (instrument): 0. Cross-check residuals: 0. instrumentErrors: 0.

**PRIMARY verdict: GO.** ≥95% attribution (100%) on ≥12 wave-4-unlocked runs (12), 0 unexplained, 0 instrumentErrors.

The 15 encounters all come from one run (vgear-belongfeast-s64807): the herald placed at omen stage 2, the scholar probing it on d78/84/85 — 13 refused approaches on d85 alone — each refused by the muster gate ("muster 10 allied blades (you have 0)"). The other 7 stage-2 runs never made contact before the run ended (lesser-seat wins ~d90 truncate the window — the win-truncation phenomenon). No fought/fled/slain/stood-down instances occurred naturally; those classes remain proven by the scripted real-engine fixtures.

Note: the instrument's muster snapshot records have=null when no muster object exists (call never sounded); the game-side record records have=0 in the same situation. Same meaning, different null convention — the cross-check joins on titan+day+outcome class, unaffected.

## Village assessment

The corpus villages are the vgear winning substrate's standard product: they win the lesser seat at a median d95 (10/16) on waves 1–3 deeds before the war ever starts. The herald looms in half the runs (omen stage 2 in 8/16) — scouts name it, it gets placed, it starts feeding or striking while the coalition deliberates — but the village walks past it to the table. In the one run where the scholar actually walked up to the placed titan (s64807, d78–85), the System refused them fifteen times running: "muster 10 allied blades (you have 0). This is not courage. This is arithmetic." The bot doesn't learn — thirteen approaches in a single day — but the fiction holds: each refusal is the same arithmetic, said aloud, and the record now logs each one.

Who thrives: nobody at wave-4 — there are no wave-4 fights to thrive in. The village that wins does it the bloodless way: capped standing on bread and bonds, wave-4 unlocked but never walked through, wave-5 reached once. The blank filled is the census's: every titan approach is now a structured record, so the next arm that asks "did anyone fight the herald?" gets an answer instead of a shrug.

## Sense-testing (read, not counted)

From the existing killdisc transcript (evidence/2026-10-21/killdisc-transcripts/leadfeast-s64505.txt) — a herald refusal scene:

- d64: the feast draws the Herald to the firelight; the scholar approaches and the hard gate fires: "⛔ THE HERALD does not notice you the way prey notices a hunter. It notices you the way weather notices a field. You cannot face this alone — sound the call, muster 10 allied blades (you have 0). This is not courage. This is arithmetic." The refusal is voiced in-fiction, not silent — the arithmetic line lands as System-personality, not a UI error.
- d78–79: the unanswered titan escalates — "🌪️ THE HERALD struck Thornfield in the night. They bled while the coalition talked. (trust −5 — they notice who wasn't there.)" The cost of deliberation is real and social.
- The herald also appears as a raid participant ("Nobody met The Herald — it's still out there at the treeline") — the same mid serves the wave-4 raid roster and the titan class; every startCombat('herald') goes through the titan gate, so the census's titan-mid filter is correct.

Judgment: the fiction supports the outcomes — refusal reads as the System's arithmetic, escalation reads as the price of an unanswered titan. No fled/survived-without-slaying encounter exists in any corpus to sense-test (zero coalition fights have ever started in sims) — the `fled` branch is proven by fixture only. Stated plainly, not papered over.

## Metric review (§14)

The PRIMARY as written ("≥95% attribution on ≥12 wave-4-unlocked runs") is met on the letter: 12/16 runs unlocked wave 4, 15/15 encounters attributed, 0 unexplained, 0 instrumentErrors → GO. No re-scoring was needed.

Two observations for the next run's pre-registration (not applied here):
1. The encounter denominator is thin and bursty (15 encounters in 1 run, 0 in the other 15). The 100% is real but fragile — a future run should pre-register a minimum-encounter floor (e.g. report attribution only when ≥5 encounters observed) or drive encounters deliberately.
2. The fought/fled/slain/stood-down classes have no natural corpus instances (sims never assemble the 10-blade muster — policy bots don't do coalition play). Their record behavior is proven by scripted real-engine fixtures, not by corpus. If the census ever needs corpus-proven fight outcomes, the sweep must assemble the muster, not wait for the policy.

## Blanks filled / documented

- FILLED (#784): titan engagement outcomes are now structured log records (refused/fought/slain/fled/stood-down) in state.titans.outcomes, written by titans.js alone — the wave-4/titan census and the table audit can now attribute instead of inflating 'unresolved'. The `fled` class (the audit's "titan retreat" gap from sim-tabledeed-voice) is now joinable.
- DOCUMENTED: zero coalition fights have ever started in any sim corpus — fought/fled/slain have no natural instances; the record's fight-path behavior is proven by scripted real-engine fixtures, not by corpus. Sims never assemble the 10-blade muster (policy bots don't do coalition play).
- No new game-code findings were chased mid-run.

## Throughput notes

- Proof test: 38/38 gates, ~12 min total (fixtures RED→GREEN + 6×60d det-gate trajectories + sweep gate). One honest fixture failure (F4: the fixture omitted the omen; the game correctly refused — fixture fixed, not the game) and one test bug (wrong sweep filename), both fixed same-run.
- Corpus: 16 × 180d runs, ~24 min wall (box shared with sibling sims).
- check.js --quick: first attempt starved (0:01 CPU in 20 min wall — three sibling sims saturated the box); killed and re-run after the corpus.
- Tooling committed: scripts/titanoutcome-{instrument,sweep,analyze,detect}-20261021.js, scripts/test-titanoutcome-20261021.js. Killdisc base instrument NOT modified (copied/adapted, titanoutcome prefix).
