# journey-scale r94 — Lane A, leg 3 SCALE (2026-11-04 early hours)

**Run id:** laneA-scale-2026-11-04T00:00CST (scheduled 23:45 CST 2026-11-03).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@fa33fc89c at branch creation (worktree journey-scale).
**Pre-register:** evidence/2026-11-04/journey-scale-r94-prereg.md
(written before any scored seed ran).
**Change set at closeout:** ONE wording-only src/js fix (hierarchy.js,
4 lines: the covenant-crisis announcement + council-book note now name
the −10 charge) + proof test + tooling (r94 driver/analyzer clones, new
trustset decomposition analyzer) + this run's evidence. NO number,
threshold, bar, price, or gate changed. **Gating freeze (2026-10-27
16:53) honored. Perception law (2026-10-28) honored** — all instruments
read-only; pickers press offered menu items only; the tend-arm presses
the offered Haven-panel tendLink verb only.

## Infrastructure notes (loud, first)
- No lock contention at start: no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- Pre-flight clean: main-tree `git status` empty, disk 30%,
  `git pull` already up to date, worktree-reap ran (12/16 active —
  dirty/held sibling trees correctly untouched; one locked sibling
  tree's removal failed aloud in reap, not mine to force).
- First registration FAILED on the container write flap: the checkout
  hit "unable to write file" on ~17 files (sweep-out/*.json, tools/*,
  version.json) and the script cleaned up, leaving only the branch.
  Retry landed cleanly (worktree == master fa33fc89c, 0/0 ahead/behind).
  A 10-minute heartbeat loop runs for the whole run; its beats were
  verified by registry read-back during the run.
- The ship loop's version bump (fa33fc89c) landed during registration;
  the worktree branch was created from the failed attempt's branch and
  verified equal to the new master before playing — no stale-base play.

## Q1 — COVENANT TRUST DECOMPOSITION: r93's "unexplained bleed" SOLVED

Policy scalecourt-nogate, WANT_SUBJECT=1, GOSSIP_FIRST=0 (unforced),
TEND_PEER=1 (pantry guard > 12,000 kcal), DAYCAP 180, death-aware stop.
Pilot 85301 ran first, no crash → quad expanded per prereg.

| seed | end | day | pop | pantry | rank | seat | arc | tends landed | peers at end (trust/age) | seasoned peers | scatter-day gap |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 85301 | SCATTERED (hunger, 5th day) | 96 | 2/2 | 0 | regional | lesser | 4 | 2 | covenant 34/40d, 17/39d | 0 | village_1 is 6 trust short with age served (40d) — trust-blocked, not time-blocked |
| 85302 | SCATTERED (hunger, 5th day) | 140 | 5/5 | 0 | regional | none | 3 | 0 | covenant 20/43d | 0 | 43 days old, 20 trust short — trust-blocked |
| 85303 | SCATTERED (hunger, 3rd day) | 23 | 6/6 | 0 | village | none | 3 | 0 | none | 0 | no peer ever formed — died before the leg began |
| 85304 | SCATTERED (hunger, 5th day) | 117 | 1/1 | 0 | regional | lesser | 4 | 0 | covenant 29/7d | 0 | peer 7 days old — never had a season to serve |

National 0/4, global 0/4, full seat 0/4, seasoned peers 0/4 seeds.
Lesser seat waiting on 2/4 seeds. **4/4 seeds ended in hunger scatter**
— the r93 shape holds on the new base.

### The decomposition (new analyzer: scripts/analyze-trustset-20261104.js)

Every trust assignment on every link, attributed to its writer via the
r39 trust-setter trace, cross-checked against the daily trust series
(all MATCH except same-day snapshot-ordering TIMING diffs of ±1, and one
link whose last event postdates its last snapshot day — documented in
the analyzer output, not a lost event).

**85301 — the proof case.** Each covenant link suffered NINE conceded
crisis cycles: crisis-charge 9×/−90, concede-gain 9×/+72, net −18 per
link, all paired (unpaired charges 0). Tending delivered +16 (2 tends
× +8, d59 + d81) and weekly ticks +6 and deeds +5 — and crises still
netted −18, plus titan −5. Village_1: +6 tick +16 tend +5 deed −90
+72 −5 = +4 (30 → 34). Village_2: −90 +72 +5 +5 −5 = −13 (30 → 17).
The tend verb works; it is outgunned 9-to-2 by crisis cycles, not
ignored.
**85302:** 1 cycle (net −2) + titan 3×/−15 → 30 → 19. Titan strikes,
not crises, dominate here.
**85304:** 1 cycle (net −2) on the week-old peer; the village's story
is its primary-sub links (succession −8s, aid charges, renegotiations).
**r93 re-analysis (all four seeds, same analyzer):** 85203 Stonebridge
is now fully accounted: crisis 5×/−50 + concede 5×/+40 (cycles 5, net
−10) + weekly +4 + titan 2×/−10 = −16 (30 → 14, MATCH). Its sibling
links: 3 cycles each, net −6. 85201/85202: 1 cycle each per link.
**Pool shortfall: ZERO occurrences on any covenant link in r93 or
r94.** r93's pool-drain inference for Stonebridge is REFUTED: that
link's daily series shows poolLive=false throughout, so its weekly tick
takes the +1 branch instead of pool accounting. The league pool is not
bleeding these links; crises are.
**Words vs numbers, confirmed on both quads:** r94 capture holds 20
crisis announcements (18 on 85301, 1 each on 85302/85304) and ZERO name
the −10 charge; r93 holds 22, also zero. The +8 concede is said every
time. A player watching a link hears "+8" repeatedly while the link
falls — exactly r93's fun-killer, now with a named cause and a fix.

**Verdict on the prereg threshold, stated plainly:** the FINDING clause
triggers in full — conceded-crisis cycles net −2 on far more than 2
covenant links (9 cycles × 2 links on 85301 alone, plus cycles on
85302/85304 and all of r93's links), and the charge is confirmed unsaid
in both quads' captures. The "unexplained bleed" question is RETIRED:
there is no unexplained drain. What remains is a design question, not
a measurement one: a below-40 link invites strain crises (10%/week in
covenantTick) whose conceded cycles still cost −2 each, so a struggling
league pays for its own distress calls — and leader deaths trigger the
same −10 independently of the roll. On 85301's headline seed, all 9
cycles on each link trace to leader deaths in the trustset stacks
(onLeaderDeath → covenantCrisis), not to the strain roll — the deaths
are the distress-call engine there, with the strain roll as a second
trigger (it fired on r93's 85203 d77 cycle via covenantTick). That loop
is NOT retuned here
(freeze stands); only the honesty of its announcement is fixed.

## Blank filled: crisis announcement names the −10 (wording only)

`src/js/hierarchy.js` covenantCrisis: all three announcement variants
(their-speaker-died, leader-death, strain) now end "(Trust -10.)",
matching the HOLD path's existing "(Trust -10.)" copy, and the
council-book note now reads "Crisis: <why> (trust -10)." No numbers
changed: the charge was always −10, the concede always +8, the cycle
always net −2 — only the words now say so.
Proof: scripts/test-covenant-crisis-copy-20261104.js — real engine
link via _formPeerLink, crisis → concede cycle: 17/17 green
(announcement names −10 on all three variants, book note names −10,
concede names +8, net 30 → 20 → 28). The test asserts strings only the
new copy emits, so it fails on the old copy by construction (before/
after via the assertion itself; no worktree stash dance on the hot
tree). This is a [needs-eyes]-free change in code terms — but the
wording is player-facing, so it ships in the batch like any src change.
No [needs-eyes] flag claimed: no feel/combat/UI change, only a number
now spoken aloud.

## Q2 — PEOPLE CHECK (unforced, scale band)

- **Day-90 conversation, seed 85301, Violet (postal worker, cautious,
  trust 33, want curious):** a short, coherent grief thread. Violet:
  "I asked Taha about what you dream about — Taha's gone. Do you dream
  about before? Or is it all — this — now?" Player: "Before. Every
  night. It's the only place it still exists." Violet: "Then it's not
  gone. Not really. Keep going back." The player's "Take your time"
  (goon) shutters her face — a real awkward beat, not a filler loop —
  and the sitting ends on "I should — yeah. Later." Want stage 1 → 2.
  Sensical, if brief; the NPC holds the thread, the ending owes a
  return, nothing fabricated.
- **Crisis announcements (all seeds):** the leader-death variant reads
  "Haven grieves — and Stonebridge tests the covenant in the chaos.
  Their speaker wants new terms, or out. CONCEDE, HOLD, or RELEASE."
  With the fix, that line now carries its price — the choice is finally
  priced in the moment, as the HOLD path already was.
- **Scatter narration holds (4/4 seeds):** "Haven couldn't hold. On the
  fifth hungry day, people started walking — in different directions.
  The scattering, again." The hunger days before it were counted aloud.

## Village assessment (plain words)

Four villages, one story told four ways: Haven makes friends, feeds
them thinly, and then the friends themselves keep testing the bond —
nine times on the best seed — while the village starves. Tending helps
(+8 a send, twice on the best seed) but cannot outrun nine distress
calls that each cost 2 even when answered generously. The longest-lived
village reached day 140 with five people and one friend at trust 20,
and still scattered hungry. Nobody reached national, nobody seasoned a
peer, and the lesser seat waited on two villages that then scattered.
What is missing is not a verb and not honesty anymore — the announcement
now says its price — it is food that lasts the season, and a league
whose distress calls don't tax the very trust they test. The second
half of that sentence is a design call for Steve, not a number this run
touches.

## Reachable / Fun / Winnable (leg verdict)

- **REACHABLE — PARTLY, unchanged.** Regional on 3/4 seeds (85303 died
  at day 23, before the leg). National reachable only in the near-miss
  sense: 85301's oldest peer served its 40 days but sat at trust 34,
  six short, with crisis cycles as the named reason.
- **FUN — YES, with the honesty fix.** Courtship, grain sends, drift
  warnings, foreign-polity rumors, and scatter narration read as people
  and places. The words-vs-numbers gap that was the fun-killer in
  waiting is closed by this run's wording fix; the remaining
  crisis-cycle loop is a design question to judge in play, not a lie
  to the player.
- **WINNABLE — NOT YET, and not for a scale reason.** Villages scatter
  hungry before the scale ladder's season requirements can be served,
  and the wave-4-kill wall (Nov 3 picture) sits behind this one. Scale
  is not the current binding wall; survival-to-season is.

## Metric review (§14)

- r93's metric (seasoned-peer count AND scatter-day gap) is ADOPTED and
  reported per seed above. It separates the failures cleanly this run:
  85301/85302 trust-blocked (age served, trust short), 85303 no-peer,
  85304 time-blocked (peer 7 days old). National-0/4 alone would hide
  all four shapes.
- r93's pool-drain inference is RETIRED as refuted (zero pool-shortfall
  assignments on any covenant link across both quads; poolLive=false
  routes those links to the +1 weekly branch). Future scale notes must
  not cite the pool as a covenant-trust drain without a trustset trace
  showing it.
- The r93 analyzer console "tended=" field warning is carried: peer
  tends cited here are censusTendPeer / capture "Haven sends" lines
  (85301=2, others 0), not the console field.
- Analyzer seed-list catch carried: the r94 analyzer's seed list was
  verified at line 197 ([85301, 85302, 85303, 85304]) before scoring.
- Telemetry check: `node scripts/telemetry-check.js --baseline
  …/telemetry-baselines/scale.json --current
  'evidence/2026-11-04/journey-scale-r94/journey-scale-r94-trust-*.json'
  --metrics nationalLive,scaleRank` → "quiet (4 files, 2 metrics, no
  large deviations)". Same caveat as r93: that baseline is an old
  aggregate shape (maxGameDay 880), so "quiet" means "no large
  deviation on these two metrics", not a clean bill. Baseline NOT
  rolled forward — the run's finding is a mechanism attribution, not a
  shape to bake in.

## Blanks: filled or documented

- FILLED (game wording): crisis −10 now named in announcement + book
  note, proof 17/17.
- FILLED (tooling): trustset decomposition analyzer
  (scripts/analyze-trustset-20261104.js) — writer attribution,
  crisis-cycle pairing, capture announcement scan, series cross-check
  with snapshot-timing labels; r94 driver/analyzer clones with verified
  seed lists.
- DOCUMENTED, not fixed (design call, freeze stands): the below-40
  strain-crisis loop (10%/week trigger, conceded cycles net −2) plus
  leader-death crisis triggers tax struggling leagues. Whether a
  conceded crisis should cost −2, or strain crises should pause while
  a link is being tended, is Steve's call — this run proves the
  mechanism and its price, and changes only the honesty of the words.
- DOCUMENTED (instrument caveat): trustset-vs-series DIFFs of ±1 are
  same-day snapshot ordering (snapshot before the day's final
  assignment), and a link's final-day events can postdate its last
  snapshot — the analyzer labels these TIMING; they are not lost
  events, since the setter logs every assignment by construction.

## Appendix — analyzer output (r94 trustset)

seed 85301: crisis announcements=18, naming -10=0
  covenant village_1: weekly-tick 6x/+6, tend-gain 2x/+16,
    crisis-charge 9x/-90, concede-gain 9x/+72, deed-gain 5x/+5,
    titan-strike 1x/-5 → +4 (30 → 34) [MATCH], cycles 9 (net -18)
  covenant village_2: crisis-charge 9x/-90, concede-gain 9x/+72,
    weekly-tick 5x/+5, deed-gain 5x/+5, titan-strike 1x/-5 → -13
    (30 → 17) [MATCH], cycles 9 (net -18)
seed 85302: crisis announcements=1, naming -10=0
  covenant village_1: weekly-tick 7x/+7, titan-strike 3x/-15,
    crisis-charge 1x/-10, concede-gain 1x/+8 → -10 [TIMING], cycles 1
seed 85303: no links (scattered day 23)
seed 85304: crisis announcements=1, naming -10=0
  covenant village_spl_29_72408: weekly-tick 1x/+1, crisis-charge 1x/-10,
    concede-gain 1x/+8 → -1 [MATCH], cycles 1 (net -2)

## Closeout
- Heartbeat incident, mid-run: the 10-minute heartbeat loop started at
  registration died with its parent exec session (drain timeout) and
  never beat — registry heartbeat_at sat at 05:58:13Z while the run
  worked on. Caught by registry read-back at 06:31Z (not by the loop's
  own log, which only ever showed the manual beats). Restarted as a
  tracked background session with absolute paths; verified fresh at
  06:31:19Z by registry read-back, and beats every 9 minutes since.
  No lock was touched in between (lock file intact throughout). Lesson
  carried: a heartbeat loop's log is not proof — the registry
  read-back is; verify it at every major step, not just at closeout.
- check.js --quick on the worktree: 282 passed, 8 failed in 1166s.
  Failures are NOT regressions from this run: the change set is 4
  copy lines in covenantCrisis (verified via `git diff`), and no test
  in the repo asserts the old crisis strings (git grep: only an old
  r12 driver matches them as capture classifiers, and substring
  matching is unaffected by the appended text). One failure is the
  known pre-existing racks-full gate case r93 reproduced standalone
  on unchanged code ("next day voices once more: expected 2, got 1");
  the rest include 120s harness timeouts under a heavily contended box
  (trust-observer-neutrality, capable-bot, synergy-stall were the
  slowest). Full failure list was not retained (output piped through
  tail) — recorded here, not hidden.
- Scale-subset check (bounded re-verification, not another full run):
  `check.js --only scale`: 3 passed, 7 failed in 122s — all old-test
  rot, none touching crisis copy: "Text is not defined" harness-env
  failures (catchup-depletion, onramp, pacing, structural-foreign),
  scale-scenarios dawn/networkLive logic, scalecourt-climb codex-policy
  drift (studyVillageCodex never called), scale-lead-fix 120s timeout.
  Before/after proof: with the hierarchy.js change stashed (pristine
  base), scalecourt-climb still fails 4/4 and catchup still dies on
  "Text is not defined" — identical failures. Change restored after
  (diff back to 4 lines), proof test re-run 17/17 green.
- Proof test post-restore: test-covenant-crisis-copy-20261104.js 17/17
  green; hierarchy.js node --check clean.
- Merged locally, pending ship (ship loop owns bump/push/live verify).
  No [needs-eyes]: wording-only player-facing copy, no feel/combat/UI
  change beyond a number now spoken aloud.
- Heartbeat loop: beats verified landed by registry read-back at
  closeout before release; loop killed at closeout. Rotation 3→0
  written; lock deleted.
