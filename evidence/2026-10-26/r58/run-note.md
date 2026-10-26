# Journey social r58 — THE BUILD-TRACE RUN (lane B, 2026-10-26)

Leg 5 (social life), cycle r58. Follows r57 (residual split v2:
same-pick + inBuilt=false residual 508 sampled, unexplained 396 =
78.0%; pager-owns, freshCapped corner, cache-suspect proxy, spent
all EMPTY; thread-guard 72, gated 40).

Rotation-b read 5 at run start and NOT advanced by this run:
r57 named r58's question (game-side build trace for the
residual), and leg 5 is the queue-jump system, not a rotation
leg — same standing as r57. Left for a run that actually plays
a different leg.

## PRE-REGISTER (written before any r58 seed ran — see prereg.md)

**Leg questions:** (Q1) with an exact build trace (cache-hit by
replyMenu identity, early-return path from observable state,
finalize in/out for 'ask:others', t2fresh/t2discussed membership),
what share of r57's unexplained residual is (a) thread-narrowed
early returns the r57 flags never covered (spread_rumor,
nonverbal), (b) replyMenu cache hits, (c) finalize drops,
(d) the fresh-loop topicCapMood bound, (e) still unexplained?
(Q2) does linger conversion reproduce (r57: 53.1%)?
**Arms (fresh seeds 5401-5404, smoke 5405 30d, DAYCAP=140,
death-aware):** ALL linger (control reproduced 3x, retired).
Seeded-speaker steering ON (constant, excluded from the natural
funnel, as r56-r57).

**Bindings:** T1 trace coverage 100% of subject-no-offer
probes; T2 unexplained-after-trace < 50%; R2 linger conversion
>= 25%; M1 deep2 >= 10/seed; M3 pooled late TP >= 40%; M4
same-speaker knack = 0/seed; M5 5 sense-reads, 0
fabricated-history flags, <= 1 weak; M6 report-only;
NO-REGRESSION check.js --quick at the standing profile.
Per-seed JSONs persist the FULL probe list (r57 sliced to
200/seed); shares stay comparable, counts are now a census.

## Mid-run instrument corrections (both analysis-only at first,
then a full re-run — see prereg.md amendments)

1. **Scope fix (before seeds):** the probe function
(`driveOne`) is top-level and does NOT close over runWorld's
trace variables — the first smoke run showed probeTraced=0/82
(the try/catch swallowed the ReferenceError). Fix: trace state
lives on the Game object (`Game.__r58traceState`), which
driveOne receives as a parameter. Smoke re-ran 82/82 traced.
2. **Cache reframe (after seed 5401):** every probed turn is
served from the replyMenu cache, because the driver's
top-of-loop build always re-serves the previous pick's handler
menu — that is the normal observation path, not staleness.
Cache moved from v3 path to memo (memoCacheHits /
memoOriginDiffers); finalize evidence on cache hits comes from
the origin build.
3. **Base vs delivered (after the first full run):** the trace
recorded the BASE build only, but the delivered menu passes
through four convoChoices wrappers (party-formal, truth,
betrayal, villager-agency outermost, which always ends in
convoMenuPage) after the base build — and convoMenuPage then
records the post-wrapper list as offeredReplies. So
inBuilt=false means the POST-WRAPPER list lacks 'others', not
that the base build did. First-run data (backed up in goal
hidden_files r58-first-run/) could not name the displacer, so
the run was REPEATED with delivered/full ids + inParty recorded.
Re-run seeds reproduce the first run turn-for-turn (seed lines
byte-identical), so only the new fields differ. All verdicts
below are judged on the re-run.

## Full-run results (4 seeds, full horizon, death-aware)

| seed | arm | days | alive | deep2 | unsteered | no-offer | offered | picked | late picks | lingerPicks | knackSame | condRate |
|------|-----|------|-------|-------|----------|----------|---------|--------|------------|-------------|-----------|----------|
| 5401 | linger | 142 | 8 | 32 | 414 | 235 | 179 | 82 | 9 | 82 | 0 | 72.2% |
| 5402 | linger | 90 | 3 | 19 | 245 | 137 | 103 | 70 | 0 | 70 | 0 | 73.2% |
| 5403 | linger | 141 | 9 | 26 | 414 | 241 | 170 | 83 | 22 | 83 | 0 | 83.0% |
| 5404 | linger | 141 | 9 | 24 | 414 | 181 | 233 | 146 | 50 | 146 | 0 | 95.6% |
| POOLED | | | 29 | 101 | 1487 | 794 | 685 | 381 | 81 | 381 | 0 | 84.8% |

Main-menu offers stay marginal (pooled main 3 vs subject 684;
late picks by menu: main 2, subject 79). Seed 5402's village
declined to 3 alive by day 90 (death-aware horizon; the run
stops simulating a dying village rather than ticking it to
fill the leg). Seeded cracks: 5401 Liam<>Kate (crack7 false,
serve30 true), 5402 Autumn<>Francisco (crack7 false, serve30
true), 5403 Carmine<>Nassim (crack7 false, serve30 true),
5404 Violet<>Quinn (crack7 false, serve30 true).

### T1 TRACE COVERAGE: PASS — 1.0 on all four seeds

All 1637 probes (446/304/468/419) carry a build trace with
base ids, full ids, delivered ids, and inParty. Zero noTrace.

### T2 RESIDUAL SPLIT v3: PASS — unexplained 0/1147 (0.0%)

Pooled residual (same-pick probes, inBuilt=false; full census,
not the 200/seed sample): 1147 total.

- threadGuard: 61 (5.3%) — thread==='others' blocks the
  re-list, as r57.
- gated: 78 (6.8%) — 'others' not in topic2Asks at all, as r57.
- displacedParty: 1008 (87.9%) — THE ANSWER. The base build
  HAS 'ask:others', but the post-wrapper full list does not,
  and the speaker is in the player's party on every one
  (displacedOther: 0).
- pendingQ / closing / nonverbal / ambush / invitation /
  trade / hawk / rumor / answers / finalize / freshCap /
  spent: ALL 0.
- v3unexplained: 0. The r57 bar (unexplained < 50%) passes by
  50 points; the old-chain unexplained (1008, 87.9%) is exactly
  the displacedParty count — the old chain had no displacement
  class, so it called the whole mechanism "unexplained."

**The mechanism, with a worked example (seed 5401, Valeria,
day 11, thread request):** base menu (16 items):
ask:lately, ask:you, ask:goal, ask:personal, ask:gossip,
ask:others, alive:event:tension, ask:spread_rumor, teach,
skill_teach:gossip_network, compare_maps, observe, theorize,
alive:want:curious, leave, silence. The delivered menu (7):
ask:lately, party_name, ask:you, ask:goal, ask:personal,
ask:gossip, leave. partyConvoChoices spliced party_name at
index 1 and trimmed to MAXC=7 from the end, cutting
'ask:others' (and 9 other items) — because the speaker is in
the player's party and the subject menu is long. Then
convoMenuPage recorded the trimmed list as offeredReplies, so
inBuilt=false. This is NOT a menu-cap bug in the subject
assembly (which built 'others' correctly) and NOT cache
staleness (the cached menu is the handler's menu, correctly
built) — it is the party wrapper's budget displacing a topic
ask the player never saw. Every displaced case has inParty
true; no non-party case was displaced. What r58 does NOT
settle: whether party displacement is WRONG (party naming
outranking 'others' may be intended priority) or just
unmeasured — that is a design call for a fix run (r59
candidate: protect 'ask:others' from the party trim, or rank
it above the party item, with a before/after funnel check).
No menu fix is shipped on this run: r58's job was the trace,
and the trace now names the mechanism exactly.

**Cache memos (not paths):** memoCacheHits 1147/1147 — every
residual probe is cache-served, which is the normal driver
observation (top call re-serves the handler's menu), not a
mechanism. memoOriginDiffers 85/1147 (7.4%): the ONLY
differing recorded field is heldBeats (0 vs 1) — explained,
not staleness: queueTraderIntro pushes a held beat inside
buildMenu before key computation, so the pre-call snapshot
differs while the cache keys match (that is why they are
cache hits). All 85 were already classified by other paths.

### R2 CONVERSION: PASS (linger reproduction)

Pooled linger: 381/685 = 55.6% (>= 25% bar; r57: 53.1%).
Late picks 81 total (0-50 per seed). Attribution exact:
lingerPicks == picked on all four seeds.

### M1 formation: GO — 32/19/26/24, all >= 10
### M3-cond: GO — pooled late TP 217/256 = 84.8% (>= 40%), lateNull 0
### M4 same-speaker knack: GO — 0 on all seeds (cross-speaker retells 3/3/5/2, circulation only)
### M5 people: GO on flags, PASS on floor (1 weak, at the <= 1 limit)
- 0 fabricated-history flags across all 5 reads.
- Strong: s5404-late-d100-Rafael (honest empty "that's
  everything I've got," teach line "Saw things with too many
  joints. Give them room," recap "Still on who you left
  behind," warm close); s5401-bondy-1-Valeria d6 (Taking
  opener "Something took us. Something big," Ivy deflection
  then "Ivy was a journalist, before," "Give Ivy time. We're
  all still becoming whoever we are now").
- Medium-strong: s5402-seeded-d19-Autumn (dated grievance
  "Francisco. — yesterday — Some doors stay closed. I still
  haven't forgiven them for what happened on the trail" —
  the seeded Autumn<>Francisco pair; gossip "Elif is back"
  thin but honest, "Who told you that?" honestly dodged).
- Weak (1): s5401-late-d100-Ivy — stall open ("lost my train
  of thought") + a driver-driven recap loop ("Wait — what
  were we talking about?" x4, answered with honest
  escalating impatience: "As I said," "Like I said,"
  "I've told you three times now"). NOT a fabricated-history
  flag: the condolence "I know you and Kate were close. I'm
  sorry" is grounded — Kate Robertson died day 96 of
  dehydration, 4 days earlier, and the player talked with her
  (bondy-2-Kate exists).
- Weak-ish (not counted): s5403-late-d100-Masego — stall
  open, gossip "People are talking about Tashi" thin,
  'others' answered "That's all I've got on that one. For
  now" (honest empty, not fabricated).
- Carried tax, not a flag: a stall beat ("lost my train of
  thought" / "Where was I?") appears in ALL FIVE reads, once
  each — the same stall class r56-r57 noted as brief. It is
  now the most frequent wart in the read set; a future run
  should measure stall frequency per conversation rather
  than re-noting it per read.
- Carried nits, not re-litigated: Nino double-invite echo,
  Omar unanchored favor callback, Carlos loop wart, Stan
  gossip treadmill, Isa third-person self-reference (r57) —
  none surfaced in this read set.
### M6 guardrail (report-only): villages alive at horizon
(8/3/9/9). 5402 declined to 3 alive by day 90; no scatters,
no arena-wipe. Death causes are the standing survival mix.

## Village assessment (plain words)

Four villages, same warm player, all talking about each other
— because the offer is weighed (linger converts at 55.6%).
Seed 5401's eight kept 32 deep friendships and talked about
each other 82 times without being steered; 5402's three, 70
times before the village faded; 5403's nine, 83 times;
5404's nine, 146 times. The talk itself is the village
remembering: who died of thirst four days ago, who still
hasn't forgiven whom on the trail, who saw things with too
many joints and lived to teach it. What changed since r53 is
not the menu — the menu builds 'others' correctly — it is
that the conversation goes where the offer points, except
when the speaker travels with you: party members' long
subject menus get trimmed to seven slots for the party
item, and 'ask:others' is what gets cut. That is the
remaining surface question, now with a name and a worked
example instead of a 78% mystery.

## Reachable / fun / winnable (social leg)

- **Reachable:** 'others' converts at 55.6% when weighed and
  offered. The no-offer surface (794/1487 unsteered turns)
  is now mechanistically explained: party displacement
  (1008 residual probes, all in-party), thread-guard, and
  gating — not an unknown menu gap.
- **Fun:** the transcripts are the evidence — Rafael's
  too-many-joints lesson, Valeria's journalist Ivy, Autumn's
  dated trail grievance, Ivy's real condolence for Kate.
  The fun tax is the once-per-conversation stall beat.
- **Winnable:** not this leg's question; 4/4 villages kept
  social fabric intact to their horizons (M1/M3/M4 all GO).

## Metric review (§14)

- T1: PASS (trace coverage 1.0, all seeds; delivered/full
  ids present on every residual probe after correction #3).
- T2: PASS (v3unexplained 0/1147 = 0.0% < 50%; r57's R1 bar
  finally passes with the displacement class added — the bar
  was not re-scored, the instrument was fixed to see the
  mechanism, as preregistered: "the NEXT run carries the
  fix or the follow-up question").
- R2: PASS (55.6% >= 25%).
- M1/M3/M4: GO. M5: GO on flags (0), PASS on floor (1 weak
  at the limit).
- F1-picks retired (r56 metric review, adopted): not judged.
- Proposed revision for the NEXT run (r59): add a
  displacement-fix arm — protect 'ask:others' from the
  party trim (or rank it above the party item) and measure
  the before/after funnel on matched seeds; the bar should
  be displacedParty share + linger conversion, not a
  re-scored unexplained rate. Whether the displacement is
  wrong at all (party business outranking village talk) is
  a design call, not a measurement conclusion.

## Telemetry

Deviation check vs telemetry-baselines/social.json
(r58-telemetry.log, metrics l3.bonds, l3.deep2, dryRate —
r57's metric set):
- Result: 1 LOUD line — l3.deep2 newly appeared (baseline 0
  -> current pooled 101, n=4 files).
- Verdict: EXPLAINED schema artifact, not a bug — deep2 is
  the current formation key the old baseline predates (same
  practice as r54-r57: baseline NOT rolled). l3.bonds and
  dryRate quiet.
- Note: a first telemetry run with two extra metrics
  (l3.mootsConvened, l3.gossipConvos) produced 2 spurious
  LOUD "disappeared" lines — those keys live outside l3 in
  the current per-seed schema, so they are a metric-selection
  error, not a deviation. Re-ran with r57's exact metric set;
  the log on file is the corrected run.

## Regressions

- NO src/js change in this run (driver + analyzer + proof
  of instrument only), so no game regression is possible
  from this run's files.
- check.js --quick (recovery run by parent after the 3600s timeout,
  1265s): 278 passed, 9 failed — count matches the standing 278/9
  profile exactly; visible failures are standing-profile members
  (parity-20261014, establishment-r20-fixes). This run touches zero
  src/js, so it introduces no new failure surface. NO-REGRESSION
  certified at the standing profile.

## Files landed (tooling + evidence, zero src/js)

- `scripts/journey-social-r58-20261026.js` (driver: all-linger
  arms, build-trace wraps incl. base/delivered/full ids +
  inParty, full probe census)
- `scripts/analyze-journey-social-r58-funnel-20261026.js`
  (residual split v3: owns/threadGuard/gated/finalize/
  displacedParty/displacedOther/freshCap/spent/unexplained)
- `evidence/2026-10-26/r58/` (prereg incl. 3 amendments,
  4 per-seed JSONs incl. full probe lists + trace records,
  r58-verdicts.json, r58-funnel-analysis.json,
  r58-telemetry.log, summaries, transcripts incl. all 5 M5
  reads, run-note.md)
- First-run backup (base-only trace): goal hidden_files
  r58-first-run/ (4 per-seed JSONs + verdicts) — NOT in the
  repo; the re-run overwrote the repo copies with identical
  villages + enriched fields (seed lines byte-identical).

## Infra notes (for the next run)

- Heartbeat loop: 5-min nohup loop with logging (goal
  hidden_files journey2-social-r58-heartbeat.log); no
  staleness gap this run (registry heartbeat stayed <5 min
  old throughout — the r57 lesson applied).
- Lane A / lever loops landed 2 commits mid-run
  (journey-landing r58, sim-w4dmg-a) after this run's branch
  point — rebase required before landing (see landing
  record below); neither touches this run's files (zero
  src/js here, new script + evidence paths only), so the
  rebase is expected clean.
- Driver log: goal hidden_files
  journey2-social-r58-driver.log (smoke PASS 82/82 traced +
  4 SEED lines + DONE r58, 0 lost to EPERM flap on all
  flushes). First-run log kept as
  journey2-social-r58-driver-first-run.log.
- Rotation-b NOT advanced (still 5) — deliberate, see top.
- exec sessions that launch background node jobs hang the
  session (the shell waits on the disowned child) — check
  progress via fresh execs reading the log files, not via
  the launcher session.
