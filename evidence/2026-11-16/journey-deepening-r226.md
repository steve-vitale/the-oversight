# Journey deepening r226 — run note

- Run: r226, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222)
- Run id: playtest-a-20261116T0945Z (lock playtest-loop-a-2026-11-16T15:43:53Z)
- Base: master 47477d874 (worktree journey-deepening, registered 15:48Z; registration queued ~8 min on the registry lock — live reaper self-contention, same as r222)
- Policy: competent, single arm, linger-guard ON (current master; r218 settled guard stays)
- Seeds: 102301–102308 (fresh band; full check in the prereg — "102304" hit 3 medheadcount-a case JSONs, adjudicated float-substring artifacts in corpora whose recorded seed is 42)
- Driver: fork of scripts/journey-deepening-r222-20261116.js (band + tag + EVIDIR date, plus the r226 instruments: monsterWatch daily census, muster-verb wraps, titanEnd snapshot; plus the agency picker cap, see Q2). Analyzer: fork of scripts/analyze-journey-deepening-r222-20261116.js + new summarizeTitanMuster + wave-split stall fields. Proof tests: analyzer 34/34 green (29 carried + 5 new), picker 5/5 green.
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing >= 100 + readiness bars; observation channel: 2 survived encounters → trick). NO canon doc covers titans/muster — mechanism grounded in src/js/titans.js + src/data/titans.json (Herald: wave 4, minAllies 10, monster "herald"; omen needs wave >= 4 AND scaleRank regional+, 0.10/day; no_solo_titans hard-refuses startCombat without a complete muster; commit_own_is_explicit) and in r223's pinned mechanism.
- Evidence: evidence/2026-11-16/journey-deepening-r226-prereg.md (repo) + corpora in goal hidden_files/evidence/2026-11-16/ (8 seed JSONs, transcripts, analyzer log).

## Q1 — TITAN MUSTER + WAVE-4 RE-ENCOUNTERS: GO (TITAN-MUSTER-BLANK)

Verdict: **TITAN-MUSTER-BLANK**. The Herald is present on 8/8 seeds for
253 titan-days and the muster is never built — 0 muster verbs panel-wide
(sound/commit/council/selfDo all 0, no wrap errors), muster 0/10 on all 8
seeds, ready false, slain 0. Both prereg bars trip: (a) 0 verbs with the
Herald present; (b) 7/8 seeds have >= 1 wave-4 type stuck at obs=1.

- Omen stage 2 (located) on all 8 seeds, omen days 49–88. Herald present
  13–52 days per seed (titanDays). Lingerer days 0–23: on 3 seeds it was
  present 22–36 days and never a lingerer, HP untouched at 700 the whole
  time (102304/102305/102307: it stood at the treeline and nobody went near
  it).
- HP trajectories: 700→1 on 102306 (and 102302 in the pre-fix run),
  700→67 on 102301 — villagers maul it in field meetings and flee, and
  it cannot be finished without a muster. A 1-HP titan the village cannot
  kill is the sharpest image of the blank.
- w4stuck1 (wave-4 types at 1/2 observations at day 100): 7/8 seeds.
  Reunion on 5 seeds, eulogy on 4, influencer/suburb/audit/eater/
  congregation/algorithm/herald on 1–2 each. 102302 is the exception (it
  learned 'eater'). The Herald's own trick WAS learned on 102304 (and
  102301 pre-fix) — the village can learn the titan's trick from survived
  encounters while never fighting it.
- Wave-4 kills: 9 across 34 fights (r222: 6/33); 1 with the trick known at
  end, 8 without (end-state read — a trick learned after the kill still
  counts as known). Banked 2 veterans on 3 seeds; wave 5 unlocked on 3.
- The muster is not a knowledge problem (the trick pipeline flows, below)
  and not an encounter problem (the Herald is THERE for weeks) — it is a
  verb problem: nothing in the competent policy's repertoire ever sounds
  the call or commits Haven's blades. The r223 scale finding reproduces
  in deepening, earlier and longer. Next lever (per r223): the muster
  needs a policy/driver path — sound the call when the omen locates,
  commit Haven's blades — or a villager-side muster drive. The gate call
  is owed, not made here.

## Q1 comparison — r222 vs r226 (8 seeds, 100d)

| | r222 | r226 |
| w4 fights | 33 | 34 |
| w4 kills | 6 | 9 |
| kills/seed | 0.75 | 1.125 |
| banked 2 | 1 | 3 |
| unlocked w5 | 1 | 3 |
| w5 kills | 0 | 2 |
| playerDeaths | 31 | 20 |
| wild playerDeaths | 16 | 13 |
| survived | 6/8 | 8/8 |

Attribution caution: the base changed since r222 — the sim-launchdef-a
profile-gate bypass (src/js/villager-agency.js: a bid-and-selected
party_launch commit is no longer vetoed for non-wanderer/explorer
profiles) landed in master. It is the prime suspect for more party
fights/kills/unlocks and fewer scholar deaths (parties protect the
scholar), but this panel is not a matched A/B — band composition also
moves these numbers (r222's own 2→6 was band), and the sibling
winnability lane's Nov 16 1515Z round found HavenTick is the dominant
plan creator on master as-is (23/50 episodes, 19/25 launched) with
launches that DO kill wave-4 beasts — so master-as-is already had a
working plan engine under the bypass. Causation needs the launchdef
A/B, not this run. The conversation-only changes since r222
(r225 stage-0 want fix, F5 settled-favor) cannot move combat numbers.
The same sibling round found its tricklearn arm DIAG-NO-GO on power —
37 tricks learned (all at exactly obs 2), 0 taught, 0 codex, and the
gate consulted 29x with the trick unknown every time yet only 2
trick-holds: in THAT panel the teaching channel never fired. This
run's instrument shows the ask/teach channel firing (122 asks, 16
taught, 12 types) — different drivers/panels, worth a cross-instrument
look, not a contradiction to resolve here. The trick remains the
binding constraint in both readings.

Picker-fix sensitivity (same band, old picker vs fixed picker): the
pre-fix pilot read w4 22 fights / 9 kills, deaths 14/6, w5 kills 2;
the fixed-picker panel reads 34 fights / 9 kills, deaths 20/13, w5
kills 2. Shorter sittings → more field day-parts → more fights and more
wild deaths, while kills / banked / unlocked / w5 kills hold (9/3/3/2).
Both Q1 verdicts are identical across the two runs (BLANK both times;
trick FLOWS on the final corpus).

## Q1-TRICK (carried): FLOWS

- taughtRate: null — countered12 EMPTY panel-wide (0/8 seeds have a
  slain-unknown wave 1–2 countered type left untaught at day 100). Same
  as r222: the wave 1–2 pipeline is fully drained, not broken.
- learnedRate: 0.69 — 11/16 wave-3+ signature tricks learned
  (terms_of_service, gavel, focus_group, callback, spool, ad_break,
  redactor, algorithm, herald, buffering, influencer). Unlearned: strike,
  chorus_line, editor, congregation, spoiler.
- asks: 122 beasttricks asks panel-wide, 16 taught, 106 none-no-counter,
  **0 none-other** (the r92 bug class never fires).
- The pre-fix run tripped TRICK-PIPELINE-FINDING on taughtRate=0 — a
  denominator of ONE (mirror_stag on 102302: slain by villagers only,
  never fought or asked about by the scholar; the ask trigger sat on
  ad_break for 60 days). Adjudicated a denominator artifact, not a
  teaching failure: the panel taught 12 types. The final corpus reads
  taughtRate=null, which confirms the artifact reading. Metric review
  below.
- stallW12: 8× no-countered12. stallW3plus: 7 flows + 1 obs-stalled —
  102308, the fully trick-starved seed (tricksHeld 0; ad_break,
  influencer, review_drone all at 1 obs, nothing wave-3+ discovered).
  The wave-split DOES discriminate: 102308 is the one dry seed. But
  stallW3plus as defined only fires when NO wave-3+ trick was discovered
  at all — the per-type wave-4 stall (w4stuck1, 7/8 seeds) is the sharper
  instrument and already a prereg bar (metric review below).

## Q2 — PEOPLE CHECK: PASS with the lecture wart FIXED

- **Day 60 Hannah (102301, trust 2): THIN but honest for a first talk.**
  Barista opener ("Back home I was a barista. The skills don't transfer,
  but the stubbornness does."), a "Yes" that gets "Okay.", a guarded
  go-on, then leave. The curious want ends engaged with nothing engaged.
  Low-trust stranger; the thinness fits.
- **Day 80 Merna (102301, trust 100, grieving): the opening is genuinely
  human, then the sitting becomes a lecture.** "I don't know what to do
  with my hands today." The betrayal walk is quiet and right ("It's
  quiet at the cache spot. Merna doesn't say much. Sometimes that's the
  whole point."), the comfort lands ("I — yeah. It helps, hearing
  that.") — and then SIX agency picks in a row (teach, teach, places,
  places, places). The ask_favor want stays pocketed the whole sitting,
  resolution=stated with nothing stated. The closing line is beautiful
  ("Talking helps. Then it hurts. Then it helps again. It's a cycle.")
  but it belongs to a conversation that never happened — the grief was
  opened and then buried under a field guide. Same shape as r222's
  day-80 Onni (3 teaches). Reproduced twice = systematic picker bias,
  not a one-off.
- **FIXED in this run (driver-only): the agency cap.** At most 2 agency
  picks per sitting; after 2, agency:ask_field / ask_expedition drop out
  of the ENGAGE pass for the rest of the sitting (the R92 MORE_IDS
  shape: beginSitting reset + pickChoice counter + ENGAGE filter).
  Proof test 5/5 green (cap, reaches-mourning, reset, shared cap,
  below-cap unchanged). Panel re-run with the fix: teach metrics still
  fire (TEACHFRAME PANEL: 40 frames across 24 sittings, 4 distinct
  frames, maxSameFrame=2 — no sitting is a lecture anymore; verdict
  VARIED), and the Q1 verdicts are identical to the pre-fix run.
- **Winddown triple, classified:** the closing line == the first winddown
  line in every transcript ("Talking helps..." twice). This is a
  TRANSCRIPT-CAPTURE artifact (the driver logs endR.line as 'closing
  line:' AND as the first 'winddown THEM:' entry), not a UI duplication
  — endConvo speaks the line once. Noted, not fixed.

## Q3 — census (plain words)

Eight villages, 100 days. **8/8 survived** (r222: 6/8). 67 living at end
(7–11 per village).

- **The living:** 102305 is the strong one (11 alive); 102306 holds 10
  (wave-5 killer, 52 titan-days); 102301 holds 8 (wave 5, standing 360+);
  102302 holds 8 (reached global scale, standing 376); 102307 holds 8
  (national); 102303/102304/102308 hold 7–8.
- **The dying:** ~449 deaths. Causes: villager combat 221, expedition
  104, combat 80, a wound that wouldn't close 7, the wild 13 (scholar),
  monster 6, alien 4, contest 5, the arena 2, starvation 1, Gavel 2,
  Big-Bane 1, The Reunion 1, ambush 2. The villages die fighting and on
  expeditions, not hungry — same shape as every deepening panel.
- **Scholar deaths:** 20 across the panel (13 in the wild) — down vs
  r222 (31/16) and r218-ON (30/22). Successions carried on every time;
  no village was lost for lack of a successor.
- **What they knew:** 15–39 counters known per village at end; 0–5
  wave-3 signature tricks held (102308: 0). Ladder: stage 3 on all 8
  seeds; regional routine (firstRegional days 36–54); national on 1 by
  scale (102307) and global on 1 (102302); standing max 150–385.
- **Social life:** bond telemetry — proposals 5–14 per seed, accepts
  mostly 3/3–4; requests staged 57, decided 48, expired 8 (3
  talkable-untalked); verdict REACHED on all 8 seeds. ask_favor sittings
  land (promised/stated); the r221 favorless-ask blank does not
  reproduce as a panel-level problem. Link raises are frequent
  ("I've heard good things about Emberhold. We should link with them —
  we'd be stronger together.").

## Reachable / fun / winnable

- **Reachable: YES.** Wave 4 reached 8/8, wave 5 unlocked 3/8 and faced
  on 2/3, wave-5 kills 2 (first wave-5 kills in a deepening panel).
  Regional 8/8, national+ 2/8.
- **Fun: YES, with the lecture wart fixed in the driver.** Conversations
  are the strength (Merna's opening, the cache-spot quiet); the cap
  keeps sittings from becoming field-guide lectures.
- **Winnable: NOT YET, but closer.** Wave-5 facing 2/3 unlocked seeds,
  wave-5 kills 2, full seat 0/8. The chain now reads: wave-4 kills 9 →
  veterans banked on 3 seeds → wave-5 unlocked on 3 → faced on 2 →
  killed on 2. The next choke is the titan muster (the Herald blocks
  the wave-4 titan kill the key needs) and the table approach in scale.

## Gate / telemetry

- **Gate: `node scripts/check.js --quick` in the worktree — 330 passed,
  10 failed in 1014s** (r222: 334/6). Adjudication: 6 are the standing
  set — measurement-proof staleness pair
  (test-measurement-proof-update, test-measurement-workflow),
  phone-frame staleness trio (test-phone-frame-proof, 3 sub-failures),
  2× 120s deed-attainment load timeouts (living-garden, one-person-army),
  ladder-bundle ambient-raid control (test-ladder-bundle-20261108:
  "200 monster turns WITHOUT delivery fire the ambient raid — fires 0").
  The other 4 are new 120s TIMEOUTs under parallel load, all confirmed
  as load artifacts by standalone re-runs (exit 0, 0 failed):
  test-occupation-panels 25/0, test-trust-observer-neutrality 6/0,
  test-synergy-stall 0, test-capable-bot-20261014 40/0. The gate ran
  while the box was loaded (sibling worktree registration holding the
  registry lock; 1014s vs r222's 859s). **Zero failures attributable
  to this run** — the worktree changes touch no src/ (driver, analyzer,
  proof tests, evidence only), and this run's own proof tests passed
  inside the gate.
- **Telemetry: quiet** (8 files, 3 metrics — fightsTotal, wave4,
  standing — no large deviations). The r222-known LOUD schema-mismatch
  line (driver emits no guardrails.*) did not appear this run, so no
  baseline roll was needed or made.

## Metric review

- **taughtRate denominator-of-one:** the pre-fix run's taughtRate=0 fired
  on a single villager-slain, never-asked type (mirror_stag). The bar
  needs a minimum denominator (e.g. countered12 >= 3 panel-wide) or
  should count only scholar-encountered types; otherwise a single
  unasked type reads as a pipeline failure. Next deepening prereg
  should carry the denominator floor. (The final corpus reads
  taughtRate=null — the informative value.)
- **stallW3plus is a whole-pipeline read:** it fires only when NO wave-3+
  trick was discovered at all (102308). It does not unmask the per-type
  wave-4 stall — w4stuck1 (7/8 seeds) is the sharper instrument and
  already a prereg bar. Keep stallW3plus as the whole-pipeline read;
  judge wave-4 re-encounters by w4stuck1.
- **Scholar-deaths bar:** 20 total / 13 wild vs r218-ON (30/22) — down
  on both; the establishment ≤2 bar stays misapplied to deepening (per
  r222's review).
- **Ask-trigger staleness:** on 102302 (pre-fix) the beasttricks trigger
  sat on ad_break (wave 3, unteachable) for 60 days while teachable
  types rotated underneath; villager-slain types the scholar never
  meets (mirror_stag) never enter the ask queue. Small instrument note
  for the next run, not a verdict.
- **farUnreached / scholar-deaths-watch:** unchanged from r221.

## Blanks filled / documented

- **FIXED (driver-only, proof 5/5):** agency lecture cap — max 2 agency
  picks per sitting (pickChoiceInner filter + beginSitting reset).
  Panel re-run with the fix; Q1 verdicts identical; teach frames still
  fire (40 frames, maxSameFrame 2).
- **Documented (not fixed):** titan muster blank — needs a policy/driver
  path or a villager-side muster drive; gate call owed (lever brief,
  not a bug fix). Wave-4 re-encounter starvation (7/8 seeds) — same
  lever family.
- **Documented (not fixed):** winddown/closing-line duplication is a
  transcript-capture artifact, not a UI bug.
- **Instrument landed:** summarizeTitanMuster + monsterWatch + muster-verb
  wraps + titanEnd snapshot + wave-split stall fields (proof 34/34
  analyzer, 5/5 picker).

## Infra notes

- Reaper ran pre-flight (50s): 15/16 active, no dead trees removed (all
  held by uncommitted changes or live). journey-scale-attr (owner
  oversight-playtest-loop, heartbeat 2026-11-10T06:08Z — 6 days stale,
  uncommitted changes) is a stranded tree from a Nov 10 run; the reaper
  never auto-removes dirty trees and I did not touch it. It counts
  toward the 16-tree cap — registration still succeeded (16/16).
- Worktree registration queued ~8 min on the registry lock (live reaper
  self-contention; Steve's nod on the fix still owed). Heartbeat landed
  immediately after registration and was refreshed through the run
  (panel + gate).
- Registry-lock stall mid-run: a sibling's worktree-register
  (sim-launchsurvive-a, oversight-flesh-out-loop) held REGISTRY.lock
  from ~16:38Z while its `git worktree add` sat in `git reset --hard`
  for 16+ min; my heartbeat queued behind it on flock and went stale
  (~16:37Z → 16:58Z, ~21 min). The tree was dirty (uncommitted work),
  so the reaper could not have removed it, and the heartbeat landed
  at 16:58:29Z as soon as the lock freed. No work lost. The stuck
  sibling register is not mine to kill; recorded here only.
- The analyzer log and the gate log were first written to the MAIN tree
  evidence dir by mistake (the analyzer/gate commands used the main-tree
  path); both were moved into the worktree evidence dir before commit
  and the main tree verified clean. The run note itself was written
  directly in the worktree.

## Landing

- Committed c29bdeac (8 files, 8634 insertions) in the worktree; the
  safe-commit index clobber struck (all 8 files staged-as-deleted
  after commit) and was repaired via `git ls-tree -r HEAD` +
  `update-index --add --index-info`, verified status empty + diff
  HEAD empty + hash-object == HEAD blob on all 8 files.
- Master moved during the run (sibling sim-seasoning-b landed
  35686d860); rebased clean onto it, proof tests re-run green
  (34/34 analyzer, 5/5 picker), merged ff-only as 411527596.
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 2→3 written with read-back; lock deleted at closeout.
