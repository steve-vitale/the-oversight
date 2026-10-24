# sim-scalemetric — MEASUREMENT DIAG on the scale-onramp axis: end-state vs ever-reached, median vs death counts

Run: fleshout-20261024T1822Z, arm sim-scalemetric. Worktree: `~/workspace/worktrees/sim-scalemetric`.
Status: PRE-REGISTERED — this header was written BEFORE the recomputation verdict below.
Analysis only: no new sweeps. All corpora below were already landed on master; had any
corpus file been missing, this run would have stopped and said so rather than inventing data.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/DESIGN.md` §scale: village → regional → national →
  global, transitions are moments not thresholds, never speedrunnable, verbs never change.
- `docs/MEASUREMENT.md` §§9–12, 14–15 bind this run (§14: pre-registered metrics bind;
  revisions apply to the NEXT run, never this one; §15: balanced panel is the instrument —
  ATTEMPTED below and, as with the three leanlink arms, expected inapplicable to
  policy-side env-gated corpora; the identical-seed paired recomputation is the fallback).
- CANON GAP (stated, not invented): no canon doc covers the envoy→accord mechanism
  specifically. The mechanism comes from `src/js/hierarchy.js` and
  `scripts/policies/linkform.js`, `leadcourt.js`, which were read before designing anything:
  national is a polity — LEAD = primary of ≥3 seasoned subordinates; seasoned = link 30+
  days old AND trust 40+ (formed at 30); one rung per season; proposeLink scores courtship
  (≥55 accepts, 35–54 counters with played terms, <35 declines); national/global beats are
  played with real costs and a REFUSE option; national is a live state (dissolve the realm
  and nationalLive clears).
- `docs/SCALE.md` exists but does not document envoy→accord staging (noted by the
  rescue arm; confirmed, not re-litigated here).

## The two questions (both marked claimed for this run)

1. END-STATE vs EVER-REACHED: leanlink end-state national reads 3/8 armed but weekly
   samples show 5/8 ever reached national-or-better (73505 touched global day 119 then
   decayed to regional; 73502/73503 answered national beats then decayed). For EVERY
   leanlink-family arm (leanlink pilot, leanlink-rescue pilot, leanlink-cap5 pilot AND
   confirm), recompute per seed: end-state rank vs ever-reached rank, and list every decay
   event (seed, peak rank, day reached, final rank). State plainly whether end-state
   reporting understates reach, and by how much per arm.
2. MEDIAN vs DEATH COUNTS: leanlink armed median survival 139d vs control 180.5d breaches
   the 0.8x guardrail while armed total deaths are FEWER (274 vs 302) and scholar deaths
   identical (65 vs 65). For every arm, recompute per seed: median survival, total deaths,
   scholar deaths, starvation deaths, and village-lost timing (what "lost earlier" actually
   means in the data — which end-state or event marks a village lost, and whether it tracks
   deaths at all). Then PRE-REGISTER (here, before computing the verdict) ONE deciding cost
   bar for future scale arms, as a single binding sentence: the bar must separate the KILLED
   leanlink arm from the GO cap5/rescue arms if the data supports any separation, keep
   starvation binding, and say explicitly what happens to the median guardrail (kept as
   binding, kept as advisory, or replaced — and by what). If the data supports NO
   separation, say so plainly instead of forcing one: the honest verdict is "no deciding
   bar exists in this corpus" plus what a future run must measure instead. Judge against
   the decision rule below; never re-score mid-analysis.

## Corpus inventory (verified present before any computation; probe/sense/log files excluded)

- leanlink pilot: `evidence/2026-10-24/perseed-leanlink/s73501–s73508-{control,armed}.json`
  (16 files; evidence `evidence/2026-10-24/sim-leanlink.md`).
- leanlink-rescue pilot: `evidence/2026-10-24/perseed-leanlinkrescue/s73501–s73508-{control,armed}.json`
  (16 files; evidence `evidence/2026-10-24/sim-leanlink-rescue.md`).
- leanlink-cap5 pilot: `evidence/2026-10-24/perseed-leanlinkcap5/s73501–s73508-{control,armed}.json`
  (16 files) + confirm `s73509–s73516-{control,armed}.json` (16 files; evidence
  `evidence/2026-10-24/sim-leanlink-cap5.md`). Confirm band filter is exactly
  73509–73516 (the cap5 arm's own filter-trap note: 73509 belongs to the 7350x family).
- All files share anchor `34101b3cde24` (asserted by the proof test, not assumed).
- No corpus file was missing. No new sweep was run. (Per the task: had a corpus file been
  missing, this run would have stopped and said so.)

## Method (fixed before computing; the analyzer re-derives every number from the files)

- End-state rank = file `scaleRank`. Ever-reached rank = maximum rank over the file's
  `trustWeekly` weekly samples (order village < regional < national < global). Weekly
  sampling granularity: samples every 7 days from day 7, so a "day reached" is the FIRST
  sample day at the peak rank — an upper bound on the true reach day, ±7d. A decay event
  = ever-reached rank strictly above end-state rank. Court beats answered
  (`court.courtNational`, `court.courtGlobal`) are reported as corroboration only, never
  as rank evidence on their own (a beat answered is not a rank held).
- Median survival = median of file `gameDays` across the 8 seeds of an arm-band (even n:
  mean of the two middle values — the same convention the three arms used).
- Total deaths = `deathTotals.total`; scholar deaths = `deathTotals.scholar` (the sweep's
  definition: deaths with `player:true`, i.e. tele death events from the scholar's own
  death path per `scripts/sim-harness.js` — the sampler's scholar-death key, NOT a
  recount of roster deaths); starvation deaths = `deathTotals.byCause.starvation` (0 if
  absent). Villager-combat deaths = `deathTotals.villagerCombat` (§14c co-primary).
- Arm-only starvation: a starvation death is MATCHED (substrate) when the paired seed's
  other arm also records a starvation death on the SAME day (same seed, same day, same
  cause); arm-only = total starvation minus matched starvation. The known matched case is
  pilot 73501 day-16 (recurs identically in both arms of all three pilot corpora — the
  same substrate seed, so the same match is expected in all three; verified, not assumed).
- Village-lost timing: `endReason` (`village-lost` vs `survived`), `gameDays` at end,
  `finalRoster`, last-death day from the `deaths` list, gap = end day − last-death day,
  last weekly sample's pantry + rank. "Lost earlier" is judged on the engine's own
  game-over event, whose three paths were read in code (not inferred from counts):
  (a) SCATTER — `src/js/game.js:30365`: pantry empty ≥ famineLimit days (3, or 5 with
  grace) → `over=true, villageLost=true`; (b) EXTINCTION — `src/js/game.js:31183`:
  zero living villagers; (c) NO-SUCCESSOR — `src/js/ledger.js:805`: scholar dies with no
  candidates. Per-seed path labels below are CONSISTENCY flags (last weekly pantry == 0
  is scatter-consistent; finalRoster == 0 is extinction-consistent), never proven paths —
  the corpus does not record which branch fired.
- Exposure check (pre-registered as the deaths-divergence diagnostic, not a guardrail):
  deaths per lived day = total deaths ÷ sum of `gameDays` in the band. Total-death counts
  across arms with different survival are exposure-censored by construction: a village lost
  at day 103 stops accumulating deaths, while a survivor accumulates them through day 181.
  This check decides whether "fewer deaths" means "safer" or "shorter exposure".

## PRE-REGISTERED candidate cost bars and decision rule (written BEFORE the verdict)

Candidates, computed identically for every arm-band (leanlink pilot, rescue pilot, cap5
pilot, cap5 confirm — confirm is the replication band, not a second pilot):

- B1 MEDIAN (status quo): median survival armed ≥ 0.8 × control median.
- B2 LOST-EXCESS: armed village-lost count ≤ control village-lost count + 1.
- B3 STARVATION (binding in every outcome below): armed starvation ≤ control + 2
  (totals) AND arm-only starvation ≤ control arm-only + 2.
- B4 SCHOLAR: armed scholar deaths ≤ control scholar deaths + 5.
- B5 DEATH-RATE (exposure-adjusted): armed deaths per lived day ≤ control × 1.10.

DECISION RULE (applied in order; no re-scoring, no candidate added mid-analysis):

1. SEPARATION TEST: a candidate separates iff it FAILS leanlink-pilot AND PASSES
   rescue-pilot AND cap5-pilot AND cap5-confirm. (Control bands are the pilot/confirm
   controls of the same corpus; the leanlink arm has no confirm band because its pilot
   NO-GO barred confirm spend.)
2. If B1 separates: the median guardrail is a separating bar. The deaths divergence is
   then judged by the exposure check + lost-timing semantics: if total deaths are shown
   exposure-censored and village-lost tracks the engine game-over event rather than death
   totals, the deciding bar KEEPS median as binding, KEEPS starvation binding (B3), and
   DEMOTES total-death counts to diagnostic-only (never a guardrail, never a tiebreak).
   The deciding sentence is then the B1+B3 conjunction.
3. If B1 does NOT separate but some other candidate does: the first separating candidate
   in the order B2, B4, B5 REPLACES median as the binding cost bar; median becomes
   ADVISORY (reported, never killing); starvation stays binding (B3). The deciding
   sentence is the replacement+B3 conjunction.
4. If NO candidate separates: the verdict is "no deciding bar exists in this corpus",
   median becomes ADVISORY until a future run measures a separator, starvation stays
   binding (B3 is a guardrail, not a separator — it passes everywhere here), and the
   evidence states what a future run must measure instead (named explicitly: a
   per-seed paired cost that varies within pairs, e.g. paired lost-day deltas or a
   scatter/extinction/no-successor path census, rather than band totals).
5. Q1 DECISION (separate from the cost bar): end-state understates reach iff
   ever-reached national-or-better exceeds end-state national-or-better on at least one
   armed band. The gap is reported per band as (ever − end-state) in seeds; decay events
   are listed per seed regardless of the verdict.

## Balanced panel (§15)

ATTEMPTED: `scripts/balance-panel.js` cannot ingest these corpora — same mechanical
finding as all three leanlink arms (panel `compare` requires `--before`/`--after`
panel.json.gz files produced by the panel's OWN driver with its own policy registry;
`leanlink`/`leanlinkrescue`/`leanlinkcap5` are absent from sweep-compare's
POLICY_REGISTRY, and the panel driver cannot run an env-gated policy arm). Fallback, as
prescribed: the identical-seed paired recomputation below, judged by the pre-registered
rule above. No panel output was written.

## Sense note (SENSE-TESTING LAW)

This is a measurement diag on landed corpora; no new transcripts were generated and no
transcript is cited for numbers. The sense verdicts of the three arms stand as written
(all three armed transcripts read as played diplomacy with named costs; all three control
transcripts read as villages told the table wants a regional standing they never pursue).
Nothing in this diag re-scores those verdicts.

---

## RESULTS (appended after the pre-registration above; every number re-derived from corpus files by scripts/analyze-scale-costbar.js and asserted by scripts/test-sim-scalemetric.js)

### Q1 — end-state vs ever-reached: YES, end-state understates reach in EVERY armed band

Per-band counts (national-or-better; global in parentheses). Control is 0/8 on end-state,
ever-reached, and beats in all four bands — there is no understatement where nothing
was reached.

| band | end-state nat (glob) | sampled-ever nat (glob) | gap | decays |
|------|---------------------|------------------------|-----|--------|
| leanlink pilot (armed) | 3/8 (1) | 5/8 (2) | +2 | 2 |
| leanlink-rescue pilot (armed) | 2/8 (2) | 6/8 (4) | +4 | 4 |
| leanlink-cap5 pilot (armed) | 4/8 (1) | 5/8 (2) | +1 | 1 |
| leanlink-cap5 confirm (armed) | 4/8 (4) | 5/8 (4) | +1 | 1 |
| leanlink-cap5 combined (armed) | 8/16 (5) | 10/16 (6) | +2 | 2 |

Every decay event (peak = first weekly sample at the peak rank; decay window = last
sample at peak → first sample below peak; weekly granularity ±7d):

| band | seed | peak | first sampled | held through | decayed by | final rank | end | beats answered |
|------|------|------|---------------|--------------|------------|------------|-----|----------------|
| leanlink pilot | 73503 | national | d126 | d133 | d140 | regional | village-lost d145 | nat 1 |
| leanlink pilot | 73505 | global | d84 | d119 | d126 | regional | village-lost d133 | nat 1, glob 1 |
| rescue pilot | 73501 | national | d77 | d133 | d140 | regional | survived d180 | nat 1, glob 1 |
| rescue pilot | 73504 | national | d84 | d105 | d112 | regional | village-lost d123 | nat 1 |
| rescue pilot | 73505 | global | d84 | d154 | d161 | regional | village-lost d167 | nat 2, glob 2 |
| rescue pilot | 73506 | global | d119 | d175 | d181 (unobserved tail) | regional | survived d181 | nat 3, glob 2 |
| cap5 pilot | 73507 | global | d119 | d126 | d133 | regional | village-lost d145 | nat 2, glob 1 |
| cap5 confirm | 73513 | national | d77 | d133 | d140 | regional | village-lost d174 | nat 1 |

Two corrections/refinements to the prior evidence, from recomputation (not from recollection):

1. CORRECTION — leanlink 73505's global touch: `sim-leanlink.md` says "73505 touched
   global day 119 then decayed to regional." The weekly series reads global d84–d119,
   regional d126. Day 119 is the LAST global sample, not the first touch: the village
   reached global by d84, held it five weeks, and decayed in the d119→d126 window. The
   reach claim (5/8 ever) is unaffected; the day was misread.
2. REFINEMENT — the sampled ever-reached is itself a LOWER bound. Two seeds answered
   national/global beats without ever sampling above regional: leanlink 73502 (nat beat 1,
   glob beat 1, sampled ever regional all 14 samples) and rescue 73502 (same pattern);
   rescue 73501 answered a global beat while sampling only up to national. A beat answered
   is played diplomacy at that rung, so played reach exceeds sampled reach: leanlink
   played national-or-better 6/8 (not 5/8), rescue 7/8 (not 6/8). Weekly sampling misses
   sub-week transients — a realm can stage, answer, and lose a beat between samples. (Beats
   are corroboration, not rank proof: they do not change the end-state verdicts, which
   were judged on rank as pre-registered.)
3. Decay is NOT death. Rescue 73501 and 73506 decayed to regional and then SURVIVED
   (d180, d181) at regional — a living village holding a smaller realm. Conversely most
   decays end village-lost, but the realm fell first (decay window precedes the loss day
   in every village-lost decay above). End-state reporting therefore hides TWO things:
   reach (villages that climbed) and loss (realms that fell while the village lived on).

Q1 verdict, plainly: end-state reporting understates reach in all four armed bands —
by 2 seeds (leanlink), 4 seeds (rescue), 1 seed (cap5 pilot), 1 seed (cap5 confirm).
Future scale runs must report end-state AND sampled-ever AND beats-answered, or they
will keep undercounting the wall's movement. The rescue gap (+4) is the largest because
rescue-tend holds are the most transient: 4 of its 6 ever-national villages decayed.

### Q2 — median vs death counts: what "lost earlier" actually means, and the deciding bar

Per-band recomputation (all 8 seeds per arm; median = mean of middle two `gameDays`):

| band | arm | median | lost | deaths | scholar | starv (arm-only) | villCombat | deaths/lived-day |
|------|-----|--------|------|--------|---------|------------------|------------|------------------|
| leanlink pilot | control | 180.5 | 3/8 | 302 | 65 | 3 (2) | 214 | 0.228 |
| leanlink pilot | armed | 139 | 5/8 | 274 | 65 | 4 (3) | 179 | 0.239 |
| rescue pilot | control | 180.5 | 3/8 | 302 | 65 | 3 (2) | 214 | 0.228 |
| rescue pilot | armed | 173.5 | 4/8 | 313 | 63 | 3 (2) | 220 | 0.250 |
| cap5 pilot | control | 180.5 | 3/8 | 302 | 65 | 3 (2) | 214 | 0.228 |
| cap5 pilot | armed | 162.5 | 4/8 | 286 | 60 | 3 (2) | 202 | 0.231 |
| cap5 confirm | control | 181 | 1/8 | 278 | 51 | 1 (1) | 210 | 0.203 |
| cap5 confirm | armed | 178 | 4/8 | 334 | 63 | 3 (3) | 242 | 0.258 |

Starvation pairings (same-seed same-day = matched substrate; the rest is arm-only):

- leanlink pilot: matched 73501 d16, same villager (`gen_sg7n41m`) in both arms.
  Armed-only: 73501 d67, 73507 d163, 73507 d167 (3). Control-only: 73504 d171,
  73507 d50 (2). Totals 4 vs 3, arm-only 3 vs 2 — both pass the +2 allowance.
- rescue pilot: matched 73501 d16 (same villager). Armed-only: 73501 d67, d157 (2).
  Control-only: 2. Totals 3 vs 3, arm-only 2 vs 2 — a tie on both counts.
- cap5 pilot: matched 73501 d16 (same villager). Armed-only: 73501 d67, 73504 d142 (2).
  Control-only: 2. Totals 3 vs 3, arm-only 2 vs 2 — a tie on both counts.
- cap5 confirm: NO matched starvation death (control's only starvation death, 73511
  d153, has no armed same-day counterpart; armed deaths 73509 d109, 73512 d109,
  73513 d167). Totals 3 vs 1 + 2 = 3, arm-only 3 vs 1 + 2 = 3 — passes EXACTLY at the
  allowance on both counts, with zero headroom. Stated plainly, not hidden.

What "lost earlier" means (the mechanism, read in code — `src/js/game.js:30365`
scatter, `:31183` extinction, `src/js/ledger.js:805` no-successor):

- Village-lost is the engine's game-over event (`Game.over && Game.villageLost`), NOT a
  death total. It fires on exactly three paths: (a) SCATTER — pantry empty for
  famineLimit days (3, or 5 with grace); (b) EXTINCTION — zero living villagers;
  (c) NO-SUCCESSOR — the scholar dies and no candidate exists. Final roster counts and
  death totals do not appear in any of the three branches.
- Consistency flags on leanlink's 5 armed losses (last weekly pantry + final roster,
  both observed within 7 days of the loss): extinction-consistent 3 (73501 roster 0 with
  pantry 51,428; 73504 roster 0, pantry 26,390; 73505 roster 0, pantry 14,913) and
  scatter-consistent 2 (73502 last pantry 0, roster 1; 73503 last pantry 0, roster 4).
  A village can therefore be "lost" with a full pantry (extinction) or with villagers
  alive (scatter) — neither is a death-count story.
- Loss does NOT track deaths at all. Mean deaths of lost vs survived seeds, per band:
  leanlink armed 35.2 vs 32.7; rescue armed 38.8 vs 39.5; cap5 pilot armed 35.0 vs 36.5;
  cap5 confirm armed 44.0 vs 39.5 (and control confirm 44.0 vs 33.4 — the same pattern
  with NO lever). A lost village's death count (30–42 in leanlink armed) sits inside
  the survived range (24–53). Death totals cannot tell you which villages were lost.
- Why armed deaths are FEWER while villages are lost EARLIER: exposure censoring. A
  village lost at d103 stops accumulating deaths; a survivor accumulates them through
  d181. Leanlink armed lived 1,147 village-days vs control's 1,325 — and per lived day
  armed villages actually died FASTER (0.239 vs 0.228 deaths/day). "Fewer deaths" is a
  shorter-exposure artifact, not evidence of safety. Scholar deaths are the same story
  in miniature: totals identical (65 vs 65) while per-seed scholar deaths swing wildly
  (leanlink 73506: armed 1 vs control 8; 73504: armed 15 vs control 13) — a total that
  coincides while its components diverge is not tracking village-lost either.
- Why the median breaches while the counts don't: the median is driven by the CLUSTER
  of mid-run losses. Leanlink armed loss days: 103, 111, 113, 133, 145 (five losses
  before d150) vs control: 75, 172, 174 (one early, two late). The median (139) sits
  inside the armed loss cluster; the control median (180.5) sits inside its survivor
  block. The median is measuring loss-timing concentration, which is exactly what a
  survival guardrail should measure — and exactly what death totals cannot see.

Candidate-bar evaluation against the pre-registered decision rule (§1: fails leanlink
pilot AND passes rescue pilot, cap5 pilot, cap5 confirm):

| candidate | leanlink pilot | rescue pilot | cap5 pilot | cap5 confirm | separates? |
|-----------|---------------|--------------|------------|--------------|------------|
| B1 median ≥ 0.8×control | 0.770 FAIL | 0.961 pass | 0.900 pass | 0.983 pass | YES |
| B2 lost ≤ control+1 | 5 vs 4 FAIL | 4 vs 4 pass | 4 vs 4 pass | 4 vs 2 FAIL | NO |
| B4 scholar ≤ control+5 | 65 vs 70 pass | 63 vs 70 pass | 60 vs 70 pass | 63 vs 56 FAIL | NO |
| B5 death-rate ≤ control×1.10 | 1.048 pass | 1.096 pass | 1.015 pass | 1.272 FAIL | NO |
| B3 starvation ≤ control+2 (totals + arm-only) | pass | pass | pass | pass (exactly) | n/a — guardrail, not separator |

B2, B4, and B5 all fail the separation test on the SAME band: cap5 confirm, a GO arm
by its own pre-registered verdict. A bar that fails a GO arm cannot be the deciding bar —
adopting any of them would retro-kill cap5's replicated GO. Only B1 separates.

Caveat, stated honestly alongside the rule's outcome: the median passes cap5 confirm
(0.983) while lost-excess (+3), scholar (+12), and death-rate (1.272) all fail there —
the median is insensitive to LATE losses (confirm armed losses at d99, d123, d174, d175
still leave median 178). Keeping median binding is the decision rule's outcome, not a
claim that median sees everything: future runs must still REPORT lost-count, scholar
deaths, and deaths-per-lived-day as diagnostics (watchlist, never binding), so a
late-loss cost pattern like confirm's is visible even when the median passes.

### THE DECIDING COST BAR (one binding sentence, per the pre-registration)

**For future scale arms, GO requires armed starvation deaths ≤ control + 2 on totals
AND on arm-only deaths, AND armed median survival ≥ 0.8 × control median; total-death
counts, scholar-death totals, and deaths-per-lived-day are diagnostic only and never kill
or save an arm.**

Consequences, per the decision rule: the median guardrail is KEPT AS BINDING (it is the
separator); starvation is KEPT AS BINDING (totals + arm-only, both counts, no
matched-substrate discount hidden); total-death counts are DEMOTED to diagnostic-only
(the leanlink "fewer deaths" paradox is exposure censoring, and a death total that cannot
distinguish lost from survived villages must not judge a survival bar). This is NOT a
"no deciding bar exists" verdict — the corpus supports exactly one separator, B1, and the
rule names it rather than forcing a second one.

### Wall numbers (this diag adds no new sims; the scale-wall state is unchanged)

No run has yet shown a win, and wave 5 stays 0 everywhere in this corpus (0/64 armed
+ control configs across the four bands; table waiting ≠ win: armed table 3/8 leanlink,
6/8 rescue, 4/8 cap5 pilot, 6/8 cap5 confirm, wins 0/64). The standing directive stands:
scale-onramp remains the blocking axis until a run shows national/table/wins in sims
with the win flag itself reached.

### Metric review (§14 — required; revisions apply to the NEXT run, never this one)

- Metrics held: this diag judged nothing mid-analysis — the header's candidate bars and
  decision rule were written before the verdict computation, and the verdict follows
  rule §2 mechanically (B1 separates → median binding, starvation binding, death counts
  diagnostic). No candidate was added after seeing the numbers.
- Proposed revisions for the NEXT run (not applied here):
  1. REPORT THREE RANKS, not one: end-state rank, sampled-ever rank (weekly), and
     beats-answered (national/global beat counts) — end-state alone understates reach
     by 1–4 seeds per band here, and sampled-ever alone misses sub-week transients
     (73502 in two arms). A future "national reached" claim must name which tier it
     means.
  2. The deciding cost bar above REPLACES the old guardrail set for scale arms: median
     + starvation bind; lost-count, scholar deaths, death-rate, and total deaths are
     diagnostics. The old "no lever-caused death-mode spike" clause is unaffected (it
     is a spike rule, not a cost bar) and stays as written.
  3. Starvation must be counted BOTH ways (totals and arm-only, same-seed same-day
     matching) — cap5 confirm passes exactly at the allowance on both, and a totals-only
     count would have hidden whether the allowance was spent on substrate deaths.
  4. Weekly rank sampling should move to a finer cadence or event-logged rank changes
     if a future run needs transient-duration claims — weekly samples bound reach days
     to ±7d and miss sub-week realms entirely (73502).
  5. Village-lost timing should be reported with its consistency flags (last pantry +
     final roster + last-death gap), not as a bare day count — the three engine paths
     (scatter / extinction / no-successor) are different failures, and a future run that
     wants to fix "lost earlier" must know which path fired. The corpus does not record
     the branch; a future instrument should.
  6. The 73505 day-119 correction above should be propagated if any downstream note
     cites it as a first-touch day — it is a last-held day.
- Balanced panel (§15): inapplicable as pre-registered (panel driver cannot run
  env-gated policy arms; see header). Fallback used: identical-seed paired recomputation
  judged by the pre-registered rule. The panel's absence changes nothing about the
  verdict — it means the panel is the wrong tool for a policy-side courtship corpus.

### Village assessment (assessor's account, in plain words)

- What the villages looked like: the same story in all three arms, told four times with
  different endings. Control villages never leave the village rung — they live or die as
  single fires. Armed villages climb: regional in nearly every seed, national or global
  in half to three-quarters — and then, in the lean arms especially, the realm cools
  and falls while the village is still alive, or the village itself hits a game-over
  threshold (empty pantry, or nobody left) in the middle of the run. The scale wall did
  not move on "can villages climb" — it moved on "can they hold what they climbed, and
  can they live through holding it."
- Who thrived and why: villages whose realms held to the end (cap5 73506/73508,
  rescue 73503/73508) — rich pantries, trusts that stayed warm. Who died and why: not
  starvation (3–4 deaths per band) and not a death-count excess — game-over thresholds
  reached mid-climb, in a cluster (leanlink's five losses between days 103–145) that
  the median catches and the death totals miss.
- What knowledge/capabilities were missing: the win itself, again (0/64), and the hold
  — what keeps a 3-link polity seasoned when trusts cool and beats decay. The deciding
  bar above is the measurement half of that blank; the design half (a hold mechanic
  cheaper than full tends) is still the next blank, not this diag's.
- Blank filled or documented: FILLED, as measurement. The two claimed backlog items
  (lines 914–915) are settled by this diag — replacement lines below — and the
  instruments (`scripts/analyze-scale-costbar.js`, `scripts/test-sim-scalemetric.js`)
  let any future run re-derive these numbers from the corpora instead of re-trusting
  prose.

### Exact replacement lines for the two backlog items (for the coordinator to mark fixed)

- `- [fixed] 2026-10-24 — scale-onramp/measurement — END-STATE NATIONAL MISSES TRANSIENT REALMS (flesh-out loop arm sim-scalemetric, run fleshout-20261024T1822Z, evidence/2026-10-24/sim-scalemetric.md): recomputed from the landed corpora — end-state understates sampled-ever reach in every leanlink-family band: leanlink pilot 3/8 → 5/8 (+2 decays: 73503 national d126–d133, 73505 global d84–d119), rescue pilot 2/8 → 6/8 (+4 decays), cap5 pilot 4/8 → 5/8 (+1: 73507 global d119–d126), cap5 confirm 4/8 → 5/8 (+1: 73513 national d77–d133); sampled-ever is itself a lower bound (leanlink/rescue 73502 answered national+global beats without ever sampling above regional). Deciding rule going forward: report end-state AND sampled-ever AND beats-answered. Correction: 73505's global first touch is d84, not d119 (d119 is the last global sample).`
- `- [fixed] 2026-10-24 — measurement — MEDIAN-SURVIVAL GUARDRAIL VS DEATH COUNTS DIVERGE (flesh-out loop arm sim-scalemetric, run fleshout-20261024T1822Z, evidence/2026-10-24/sim-scalemetric.md): settled by the pre-registered deciding bar — GO requires starvation ≤ control+2 on totals AND arm-only deaths AND median survival ≥ 0.8 × control median; total-death counts are diagnostic only. Why: village-lost is the engine game-over event (scatter / extinction / no-successor), not a death total — lost seeds' mean deaths ≈ survived seeds' in every band — and armed "fewer deaths" is exposure censoring (leanlink armed lived 1,147 days vs control 1,325; deaths per lived day actually higher, 0.239 vs 0.228). Only the median separates the KILLED leanlink arm (0.770) from the GO arms (rescue 0.961, cap5 pilot 0.900, cap5 confirm 0.983); lost-excess, scholar, and death-rate all fail cap5 confirm and cannot be the bar.`

### Proof

- `node scripts/test-sim-scalemetric.js` — TEST-OK (T1 corpus completeness + anchor,
  T2 recomputation matches all three arms' published totals, T3 decision-rule evaluation,
  T4 decay inventories + beat-without-rank cases, T5 analyzer-vs-independent-recount
  agreement). No game load was needed (corpus analysis only); no jest run (no game-code
  change, no jest-eligible surface touched). No [needs-eyes]: measurement-only work,
  no feel/combat/UI change.
- No new sweeps, no src/js changes, no policy changes, no default flips. Commit set:
  this evidence file + `scripts/analyze-scale-costbar.js` + `scripts/test-sim-scalemetric.js`.

