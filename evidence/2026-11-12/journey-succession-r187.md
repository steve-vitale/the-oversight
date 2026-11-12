# Journey succession r187 — Lane B, leg 7 (succession) — RUN NOTE (INTERIM)

**Run:** r187 (next Lane B number after r186 crisis) ·
**Leg:** 7 succession · **Branch:** journey2-succession ·
**Base:** master 5c5fbafc2 (sim-winnability-round-1430 adoption evidence) at run start ·
**Rotation-b:** 7 at run start, writes 4 (endgame next) at closeout ·
**Prereg:** evidence/2026-11-12/journey-succession-r187-prereg.md.

## Pre-flight

- Lock: no lock file at run start; created `playtest-loop-2.lock`
  run_id `2026-11-12T16:55:42Z`. Heartbeat loop (5 min) running for the
  whole run (restarted once after a service restart killed it, 17:40Z).
- Main tree dirty at first check: one untracked file
  (`evidence/2026-11-12/sim-winnability-round-1430.md`) from the
  fleshout-loop-b adoption run, actively being written (9,468 → 11,769
  bytes, 16:55–16:58Z). Per the loop rules ("sibling mid-landing: wait
  10m, re-check") waited through prep reads; the sibling committed it
  as 5c5fbafc2 at 16:58:40Z. Re-checked 16:59Z: tree clean. Proceeded.
- Disk 37% (fine). `git pull`: already up to date. `worktree-reap.sh`:
  9/16 active, no dead trees removed (all active trees hold
  uncommitted changes — reaper correctly refuses).
- Worktree `journey2-succession` registered + heartbeated 17:01:31Z.

## The fix — confront dry-replacement (crisis r186 carry, DONE)

Crisis r186 filed one dialogue defect (seed 14421 d124, Yara Haddad):
the second confront in one sitting dry-replaced with "...Sorry, lost
my train of thought." right after a real confession on another thread —
same class as the warn-details defect, different surface (confront,
not warning). Root cause found in code review + live reproduction:

- The second press takes the ONE-CONFESSION-PER-SITTING branch (r172)
  or the already-confessed stale branch and draws a `staleConfessed`
  pool line via `drawTruthLine`. That draw has per-game no-repeat but
  knows nothing about sayLine's 48-entry run ledger: once the 4-line
  pool recycles, a freshly drawn variant can already sit in the ledger
  (spoken by another villager recently) and sayLine blocks it — the
  dry line answers the accusation instead of the honest content.
- Reproduced exactly in the proof test (RED): the SAYTRACE shows the
  blocked key was staleConfessed[0] ("We went over this," ... "I
  already told you the truth about that."), preRun=true, sites
  truth.js:2137 (the confront handler's sayLine call).
- Full transcript archaeology, settled by the repro: the wild turn-2
  showed only [label, dry line] because the stale branch returns
  BEFORE the windup (no windup beats), the handler's "I need to ask
  you something." was the only new 'you' entry, and the
  villager-agency wrapper's finally block rewrote it to the menu label.
  No missing handler, no lost beats — the dry line was the whole story.
- Fix (src/js/truth.js): new `drawTruthLineUnblocked(poolKey, vid,
  vars)` — draws variants and returns the first `convoWouldBlock`
  would NOT refuse; null when every variant is blocked, so the caller
  falls to its honest hardcoded line. Same shape as the r186
  warn-details pool-picker. RNG: the common path spends exactly one
  drawTruthLine call — the same as the code it replaces, so seeded
  trajectories are unchanged where nothing was blocked; extra draws
  happen ONLY on the blocked path (where the old code produced the dry
  line). Swapped at all 11 confrontation-outcome draw sites in
  `confrontDoubt` + `confrontTheft` (staleConfessed x3, mootLead,
  pressed, clears, deflectSmooth/Clumsy x2, attacks x2, theftConfess),
  each with an honest fallback (fresh text, never pool text).
  The windup face/coach lines bypass sayLine (direct transcript push,
  r167/r179 same-sitting guards) and need no change; the composed
  confession line is unique per lie and cannot collide.
- NOT fixed here (watch): the hardcoded refusal line ("Not this
  again." — one fixed string, no pool) can dry-replace the same way
  when ledger-blocked. It needs variant fiction + its own proof; filed
  below for the next run.

## Proof (DONE)

- NEW `scripts/test-journey-succession-r187-confront-dry-20261112.js`:
  **11/11 PASS.** RED verified first (second confront spoke the dry
  line, SAYTRACE preRun=true on staleConfessed[0]); GREEN after the
  fix (second confront speaks staleConfessed[1] — "That again? ...
  I confessed that already..." — zero sayLine fallbacks on either turn).
- Family proofs, all green on the branch (adoption re-ran each):
  inherited-thread-resume 6/6, resume-opener-quotes 3/3,
  succession-opener-coherence 10 + 9 checks (two arms, both green),
  fusion-mantle 9/9, warn-details 12/12, Rafael resume 21/21.
- `test-detective-breakit-20261009.js` crashes identically on the
  pristine base (`Text is not defined` in its own old eval boilerplate
  — verified by stashing the fix): pre-existing, not caused by this
  run, not a gate item.

## Panel (COMPLETE — adoption-verified)

- Driver: scripts/journey-succession-r187-20261112.js (r183 driver,
  rename only) + analyzer scripts/analyze-journey-succession-r187-20261112.js.
- Seeds: FRESH BAND 34231–34234 (EARLY_KILL_DAY=40, POST_DAYS=70)
  + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25).
- Pilot 34231: exit 0, valid JSON (723KB). 5 chain deaths, village
  alive at end; 6 mantleFine rows, all flippedImmediate=true same-day
  (incl. a d107 same-day cascade of 3); 0 dry lines in 17 transcripts;
  1 sayTrace fellBack — the HONEST foreign-language nonverbal
  narration (Tashi Hindi line, r81 design), not a dry line. Newcomer
  Ivy arrived d+63, probe opened (trust 25, want curious, deadline
  d+77) — CAP-NC candidate.
- Full panel: all 5 seeds exit 0 (34232 17:40:15Z, 34233 17:40:58Z,
  34234 17:41:09Z, 33998 17:42:36Z), PANEL COMPLETE 17:43:12Z,
  analyzer exit 0. Adoption re-verified the analyzer output and the
  raw stdout JSONs independently (see Panel verdicts).

## Panel verdicts

- **MANTLE-FINE (binding): PASS.** 17 deaths observed (34231: 6,
  34232: 2, 34233: 2, 34234: 5, 33998: 2) — 0 flippedImmediate=false
  outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips. The d107 same-day cascade of 3 on
  34231 and the 34233 starvation row (fineLatency 1, rollCover) are
  both classified SAMPLING-or-CLEAN under the r170 rules.
- **DRY CENSUS (binding): PASS.** 0 ask:lately fellBack, 0 warn_you
  dry-replacements, 0 confront dry-replacements on the panel.
  Exactly 2 sayTrace fellBack entries in all 5 stdout JSONs,
  both inspected in the raw data: (1) Tashi d111 (34231) — the Hindi
  line falling back to the honest nonverbal narration (r81 design,
  not a defect); (2) Desmond d48 (34234), pick `deflect_q` — the dry
  line "...Sorry, lost my train of thought." (see Carried — the next
  fix item). Same-class carried sites (exh closers, base `more`)
  dry-free; 0 AGENCY-DRY / TEACH-DRY / OPENER-DRY.
- **CONFRONT FIX (binding): PASS.** Proof test 11/11 GREEN
  (re-run by the adoption, exit 0, "RESULT: 11 pass, 0 fail"; RED
  verified first by the run). Panel confirms 0 confront
  dry-replacements in the wild.
- **CAP-NC (descriptive): INSUFFICIENT-DATA.** bonded-by-deadline
  2/2 eligible (Hinemoa 34233, Elena 34234) — denominator < 3.
  Descriptive bondedEver 2/3 probe-opened seeds (Ivy 34231: village
  ended before her d+77 deadline). Fourth straight panel with the
  bondedEver signal strengthening while the denominator stays starved.
- **CONTROLS (binding): HEADLINES MISS — STALE BAR, FIX EXONERATED.**
  Smoke 33998 headlines 2/9/3/3/2 vs the bar's 1/11/1/3/2
  (deaths.bearer 2, census.alive 9, census.fallen 3, stage 3,
  mentions 2). The adoption proved the cause is base drift since
  r183, NOT this run's fix: the smoke seed re-run on the PRISTINE
  base (truth.js stashed) gives byte-identical headlines 2/9/3/3/2,
  and the base-vs-fix stdout JSONs differ ONLY in three bumpLog
  call-site line numbers (the fix's line shift) — the fix spends
  zero extra draws on this seed (0 fellBack) and changes no outcome.
  The bar's numbers describe r183's base (pre-r186 convo-wants.js
  pool-picker, which consumes RNG differently). See Metric review:
  the smoke bar needs re-derivation on the current base. The
  control's MACHINERY checks all hold: MANTLE-FINE clean on smoke
  (d6 scripted + d11 wild, both flippedImmediate), pick rank 1,
  funeral INCALL true, selfReq 0 on every seed.
- **OPP (descriptive):** unbonded talk-requests 2 (Antonella d68
  34234, Esteban d5 33998); FIRST-bearer new bonds on undriven days
  1; NPC-NPC new bonds 31; newcomer arrivals 9; FIRST-bearer
  newcomer bonds 2 vs pre-existing 2; selfReqDayEntries 0 (r133
  purge regression check holds).
- **Day-skips:** 0 across the panel (sleep rolls 110/110/64/110/30)
  — seventh straight panel at zero; the watch stays a watch.

## People check (read in full by the adoption)

- Wanjiru d+14 (34231, trust 100) — honest resume opener ("We never
  did finish talking about grief — that was 11 days back"),
  trapline/cellar teaching ("It's real, I've stood there"),
  "Roles. Not ranks — promises.", Scout already held, Sassafras
  teaching lands. One mild jump (ask:lately answered with "You saw
  it too, right? Hardened Duel") reads as a villager volunteering
  news, not a defect. No dry line; no fabricated history.
- Ivy newcomer d+63 (34231, trust 25) — a stranger who reads as a
  person: pointed trust question, watches the fire, deflects the
  confront ("Nope. No."), declines the party with a real reason
  ("I don't do parties. ...It's not you. It's the party."). No dry
  line; no fabricated history.
- Verdict: both read as people. The leg's conversation machinery
  holds on the fresh panel.

## Village assessment

- 34231 (Domingo→Gilberto→Declan→Inci→Wanjiru→Liam→Chantal):
  the mantle churned through 6 bearers, 3 in one day (d107), and the
  village still ended with 5 alive. The most succession-dense village
  on the panel — the handoff machinery got its hardest workout here
  and never deferred.
- 34232 (Bessie→Dakota→Larry): the healthiest village — 10 alive,
  2 fallen, 2 bearer deaths. Succession is a quiet background fact
  here, not a crisis.
- 34233 (Deirdre→Katarina→Hinemoa): nearly wiped — 1 alive, 13
  fallen, including a starvation bearer death (d58). The village
  kept its succession chain intact even as it emptied.
- 34234 (Raul→Gus→Nino→Werner→Liv→Karuna): nearly wiped — 1 alive,
  18 fallen, 5 bearer deaths, but the liveliest social life on the
  panel (15 NPC-NPC bonds, 18 talk-requests, 6 newcomer arrivals).
  People kept arriving and bonding while the village died around
  them.
- 33998 smoke (Heinrich→Sofia→Ruby): 9 alive, 3 fallen at d32 —
  the scripted d6 handoff clean, a wild d11 bearer death handled
  synchronously, one further death by d32.
- What is missing: two of four fresh villages ended with a single
  living villager. Succession works mechanically, but a one-person
  village is not a village — the leg measures the handoff, not
  whether anything survives to hand off to. That is a survival
  question for the winnability chain, not a succession defect.

## Reachable / fun / winnable

- REACHABLE: yes — the mantle passes synchronously at every observed
  death on the fresh band; the player inherits a living bearer with
  their threads intact (resume openers, inherited threads, Rafael
  resume all green in family proofs).
- FUN: yes, with one wart fixed and one left — the confront
  non-sequitur that broke the moment a player presses a liar is
  gone (proof 11/11, panel-clean); the deflect_q dry line (Desmond
  d48) is the same wart on a neighboring surface and is the next
  fix. The Wanjiru/Ivy transcripts show the leg's conversations
  landing as people talking, not menus.
- WINNABLE: the leg does not block the win — succession is a
  handoff, not a gate. The CAP-NC denominator stays starved, so the
  newcomer-bond question is still undecided, but that is a
  measurement problem (longer panel or earlier-arrival band), not a
  leg failure.

## Telemetry

- `telemetry-check.js` vs succession.json: exit 1 with two LOUD
  lines — deaths.bearer +124% (baseline 7.6 → current 17) and
  census.fallen +215% (baseline 14.3 → current 45).
- INVESTIGATED, EXPLAINED, NOT A DEVIATION: the baseline file stores
  PER-SEED MEANS (7.6, 3.8, 14.3, 4.2 — non-integers), while the tool
  SUMS the current files (line 206) — the tool's own header warns
  this class of cross-regime compare prints false LOUD lines.
  Like-for-like per-seed means are quiet: bearer 3.4 vs 7.6 (-55%),
  fallen 9.0 vs 14.3 (-37%), alive 5.2 vs 3.8 (+37%, under the 60%
  LOUD threshold), stage 3.0 exact, mentions 4.2 exact. Baseline
  NOT rolled — its provenance (which panel, which config) is
  unclear and the r187 panel is quiet on the honest comparison.

## Carried (for the next run, not this one)

- **DEFLECT_Q DRY LINE (next fix item — found on this panel):**
  Desmond d48, seed 34234, pick `deflect_q`, key `"Okay."
  Something shutters, just slightly.` — preRun=true, fellBack=true,
  returned the dry line. Sites: conversation.js:7609:19,
  conversation.js:8713:23, convo-dialogue.js:943:21. Same class as
  the warn-details / confront defects, new surface: the deflection
  QUESTION answer has no pool-picker / honest fallback. Fix shape:
  pool-picker or variant fiction for deflect_q answers + its own
  proof test (RED first), panel re-run. Add deflect_q to the DRY
  CENSUS bars for the next run.
- **Hardcoded refusal line** ("Not this again." — confrontDoubt +
  confrontTheft guards): one fixed string, no pool — a ledger block
  dry-replaces it the same way the confront lines did. Needs variant
  fiction + its own proof; the panel's DRY CENSUS will show if it ever
  fires.
- **Recap-prefixed memory quotes** (r183 watch, carried): a recap line
  with a discourse prefix passes the real-beat test and quotes as the
  thread's memory. Candidate for a future quote-hygiene pass.
- **CAP-NC decisive denominator**: still starved in expectation; this
  panel's Ivy arrival (34231) may finally give it one eligible seed.
- **Q6 gorge-after** (crisis r181 carry): zero through r190 re-judge —
  untouched by this run.

## Gate — GO (329 passed, 11 failed in 1246s; clean single run PID 29187, log journey-succession-r187-gate.log)

All 11 failures adjudicated as non-regressions; every one re-run standalone:

- **Staleness pair (expected):** measurement-proof-update + measurement-workflow exit 1 "Proof source inputs are not current" — src/js/truth.js changed, so the proof refresh is owed at landing (round 10, sim-proofrefresh-b10 already running).
- **phone-frame-proof (pre-existing):** stale receipt — "Phone receipt source is stale or missing: index.html" + src/js/alienPlayers.js among listed inputs.
- **measurement-cache-flags — STANDALONE GREEN 4/4, load artifact (verified twice):** gate 0/4; first standalone batch 3/4; a second fix-branch run under the proofrefresh panel's load 1/4; then a discriminating A/B on a quiet box after the VM replacement — pristine base 4/4 AND fix branch 4/4 (fix3 log, exit 0). The failing sub-check ("both actual CLI configurations complete valid neutral panels") tracks panel-completion under the test's spawn/timeout budget, which collapses under load (gate load ~9, concurrent check.js; proofrefresh panel running). The fix is exonerated; baseline NOT rolled.
- **Seven exact-120s timeouts — ALL standalone-green (load artifacts):** living-garden-deed-attainment 8/8, occupation-panels (exit 0), one-person-army-deed-attainment 7/7, trust-observer-neutrality (exit 0), synergy-stall (exit 0), capable-bot-20261014 (exit 0), table-endings-20261014 (exit 0). Note: the first deed-attainment re-runs hit my own script bug (a `||` fallback overwrote the log with a MODULE_NOT_FOUND for a wrong path); the clean re-runs with 900s timeouts and the correct godpath path both passed.

Gate-run discipline: the first two gate attempts were started during Lane A contention and killed; only the third (PID 29187) counts. Killing a check.js parent orphans its worker children — kill the whole tree and verify `pgrep -af "node scripts/check.js"` is empty before restarting.

## Metric review

- **SMOKE BAR (binding, needs revision for the next run):** the
  1/11/1/3/2 headlines describe r183's base, not the current one.
  The adoption proved the drift is base movement (pristine-base smoke
  re-run: identical 2/9/3/3/2), not this run's fix. Proposed revision:
  re-derive the headlines from a fresh smoke run on the current base
  at the next succession run (proposed 2/9/3/3/2), OR drop the
  end-census numbers from the bar and keep only the at-death snapshot
  (chainDeaths 1, death.alive 11, death.fallen 1) + the machinery
  checks (MANTLE-FINE clean, pick rank 1, incall true, selfReq 0) —
  the machinery is what the smoke control actually guards.
- **DRY CENSUS bars:** add deflect_q (this panel's one dry line) to
  the binding census for the next run, alongside ask:lately,
  warn_you, confront, exh closers, base more.
- **TELEMETRY BASELINE:** succession.json stores per-seed means
  while telemetry-check.js sums the current files — the tool's LOUD
  lines on this panel are a comparison artifact. Either the baseline
  should store totals, or the check should compare means. Do not roll
  the baseline until that is settled; the honest per-seed comparison
  is quiet.
- **CAP-NC:** no revision — the denominator stays starved by design
  (longer panel or earlier-arrival band, per r183's judgment).

## Rotation

7 -> 4 (endgame next). Advance at closeout; verify the file reads 4.
