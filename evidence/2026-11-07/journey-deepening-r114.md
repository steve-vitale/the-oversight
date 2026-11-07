# journey-deepening r114 — no shared words, no bond; the decided ask stops coming back (2026-11-07)

Leg 2 DEEPENING (days 40–80). Run r114, Lane A, run id `laneA-20261107T1345Z`.
Branch `journey-deepening`, base master `a78938a0b`. Seeds 96201–96204 (smoke 96200),
fresh by the full-scope check (all dated preregs + evidence + forbidden lists, 0 hits).
Policy competent, DAYCAP=100, CONVO_DAYS [45, 60, 80]. Rotation read 2, wrote 2→3.
Prereg: `evidence/2026-11-07/journey-deepening-r114-prereg.md`.

## Questions (preregistered)

**Q1 (PRIMARY) — Bond/link decisions without shared words.** r110 nit #2, confirmed
live in r113's after-panel: Chantal (French-only) had a bond ACCEPTED day 75; Emma
(Spanish-only) had a link ACCEPTED day 27, declined days 6/24/62. Canon
(`docs/CONVERSATIONS.md`, "Language"): no shared language → the conversation is
nonverbal (gesture choices only). But `bondChoices` prepends bond:/link: choices
whenever a proposal is pending, with no language check, and `nvOpen` returns the
full choice menu — so a 'none'-comm sitting states the barrier ("No shared words
at all") yet still offers `"Yes. Stick together."` in English. The r113 driver's
two "skip no-language holders" guards called the nonexistent `Game.npcComm` and
silently defaulted to `{level:'full'}`, so they never fired — that dead guard is
what made the defect observable. Verdicts (binding, before-panel): DEFECT-CONFIRMED
if ≥1 scholar-targeted decision at comm 'none'; NOT-REPRODUCED if 0 'none' with
≥1 decision total; NO-DECISIONS if 0 decisions. After-panel binding: 0 'none'
decisions AND ≥1 non-'none' decision = FIX-WORKS.

**Q2 — The decided ask comes back.** r113 wrinkle, proven in transcript (Grace day
27, seed 95601): the opener speaks the bond ask, the scholar declines, "Right —
another time." — then a later `goon` ("And?") in the SAME sitting re-speaks the ask
verbatim. Mechanism: the talk-request opener speaks the staged line AND stashes it
in `c.bondPending`; `convoDropUnspoken` (runs BEFORE the decision) re-stages the
queued beat as "dodged"; the decision consumes the request but nothing clears the
re-staged beat; a later `goon` speaks it verbatim. Same shape as the r40 invite
double-serve (fixed at `conversation.js:5183`); the bond path never got the matching
clear. Verdicts: REPLAY-CONFIRMED if ≥1 sitting replays a decided ask via a
continuer; NOT-REPRODUCED if 0 replays with ≥1 decision sitting. After-panel:
0 replays AND ≥1 decision sitting = FIX-WORKS.

## Before-panel (unfixed code)

4 seeds, all survived: 96201 d101 wave 4 pop 5; 96202 d100 wave 3 pop 8;
96203 d101 wave 4 pop 3; 96204 d101 wave 4 pop 7. 48 transcripts.

- **Q1: DEFECT-CONFIRMED.** offers=24, offersNone=2, decisions=20, decisionsNone=2,
  decisionsNonNone=18. Both 'none' decisions are Jovan Milic on seed 96203 —
  Ukrainian-only, trust 89: day 65 DECLINED a link raise (village_spl_27_45749),
  day 69 ACCEPTED a link raise to Stonebridge (village_1). The day-69 sitting
  states "No shared words at all" and in the same breath offers link:accept in
  English; the scholar carries a village-link proposal for a man he cannot speak
  to. Seed 96203 alone: offersNone=2, decisionsNone=2.
- **Q2: REPLAY-CONFIRMED.** replays=9 across 20 decision sittings, both kinds
  (bond 5, link 4), all four seeds. E.g. Victor day 31, seed 96201: the link ask
  opens the sitting, the scholar accepts it ("You carry the proposal to
  Emberhold."), the conversation moves on to the taken-pods want — and a later
  goon re-speaks the ask verbatim, as if never answered.
- Q1-REQUESTS: REACHED (staged=24, decided=20, expired=4, expiredTalkableUntalked=3).
- BOND-CHOICE: ANSWERED 20/20. BOND-TELEMETRY: tele=63, proposals=35, decisions=15,
  accepts=7 (47%), linkRaises=8, initiatedBonds=10, errors=0 — the system reaches
  the wild.
- Secondaries: P-KEEP PRESENT 3/5; RE-ASK orphans 7 (all fromSeed-origin);
  FIZZLE HOLDS (0 dry sittings); S-TRACE 4/4 EXPLAINED; DEBRIEF 0 losses;
  D-THING 6 pocketed, 3 testable, 2 named (2 old-rule); AWAY-LINE old 0, new 6 —
  the r113 reword holds; B-SIT 14 sittings (7 accept / 7 decline / 0 unanswered);
  B-FOLLOW 9 follow-ups, 3 with new betrayal; B-LEAD 3 lead-ins; V-INIT
  bondSittings=0 (see Carried).

## The fixes (conditional on the two CONFIRMED verdicts — built, proof 24/24)

`src/js/bond-initiation.js` only, 48 insertions / 1 deletion, commit `344b7cd2`
(`[needs-eyes]` — the words a villager hears when a bond is refused for language
are player-facing). Exactly as preregistered:

1. **Menu gate** (`bondChoices`): returns `[]` when `G.commLevel(vid).level === 'none'`.
   'partial' still offers — partial IS shared language. Fail-open if `commLevel`
   is missing. The staged proposal stays staged until its 3-day expiry; the
   honest arc is learning the language, then bonding.
2. **Defense in depth** (`bondTurn`): a bond:/link: choice that reaches the decision
   by any path bypassing the menu is refused with an honest line and NO state
   change: `'"..." No shared words yet — you cannot agree to that in a language
   neither of you speaks.'` The proposal stays pending.
3. **Decided-ask clear** (`convoTurn` wrap): after `bondTurn` returns for a bond:/
   link: choice, clear ONLY that kind's pending slot + held beats (`bondPending` +
   `bondproposal` beats for bond; `linkPending` + `linkraise` beats for link).
   Undecided asks are untouched — a dodged ask still comes back (r8 design).

Proof test `scripts/test-journey-deepening-r114-langate-20261107.js`: **24/24 green**
after the fix (was 17 passed / 7 failed on unfixed code — exactly the defect
cases: Q1 menu ×2, Q1 direct-decision ×3, Q2 planted-beat + natural-path).
Controls pass both ways: 'partial'/'full' still offer; dodged asks still re-speak.

## After-panel (same seeds, fixed code)

3/4 survived: 96201 LOST day 69 (scatter-hunger, see below); 96202 d101 wave 4 pop 7;
96203 d101 wave 4 pop 9; 96204 d101 wave 5 pop 8. 51 transcripts.

- **Q1: FIX-WORKS.** offers=22, offersNone=0, decisions=18, decisionsNone=0,
  decisionsNonNone=18. Zero no-language offers, zero no-language decisions, and
  18 legitimate decisions still happened — the gate blocks only the impossible
  ones. Jovan Milic's after-panel story is the honest arc in full: he staged link
  raises SIX times (days 61, 64, 68, 83, 87, 91) and every one expired undecided —
  the scholar sat him (days 62, 65, 69, 84, 88, 92) and the menu simply never
  offered the choice. He keeps asking; the barrier is language, not motivation.
- **Q2: FIX-WORKS.** replays=0 across 17 decision sittings (was 9/20). No decided
  ask came back through a continuer on any seed.
- Q1-REQUESTS: REACHED (staged=32, decided=18, expired=13, expiredTalkableUntalked=5).
  Expired rose 4→13 — that IS the gate working: requests that cannot be answered
  in words now expire instead of being decided in a language neither speaks.
- BOND-CHOICE: ANSWERED 17/17. BOND-TELEMETRY: tele=80, proposals=35, decisions=17,
  accepts=9 (53%), linkRaises=9, initiatedBonds=12, errors=0.
- Secondaries: P-KEEP PRESENT 4/5; RE-ASK orphans 6 (5 fromSeed-origin, 1
  true-no-thread — see Carried); FIZZLE HOLDS (0 dry); S-TRACE 4/4 EXPLAINED
  (the lost seed's trace ends at its scatter, attributed); DEBRIEF 1 loss,
  attributed=1; D-THING 7 pocketed, 5 testable, 1 named, 2 old-rule;
  AWAY-LINE old 0, new 3; B-SIT 17 sittings (9 accept / 8 decline / 0 unanswered);
  B-FOLLOW 10 follow-ups, 3 with new betrayal; B-LEAD 5 lead-ins; V-INIT
  bondSittings=0 again.

## The survival cost (flagged, not a verdict)

Seed 96201: before-panel survived to day 101 (pop 5, pantry 1398 kcal, 10 fell);
after-panel scattered from hunger day 69 (pop 4 at the end, pantry 0 kcal,
12 fell — sickness ×3, starvation ×3). The debrief attributes it (scatter-hunger).
What the fix did NOT do: 96201 had NO 'none' decisions in the before-panel (all
6 decisions non-'none'), so the Q1 gate changed nothing directly on this seed.
The divergence comes from the Q2 clear — 4 replays removed on this seed — which
changed conversation paths and RNG consumption, cascading into a village whose
food position was already thin (before-panel pantry 1398 at day 101 is a narrow
margin). SURV-CONTROL-4, 6th control point: before 4/4 → after 3/4. The
preregistered rule (≥2/4 survive → funnel unchanged) holds: **funnel unchanged**.
The loss is trajectory divergence in an already-marginal village, not a direct
gate effect — but it is the second panel in a row where a fix's after-panel dips
below its before-panel (r113: 4/4→2/4), so the control point keeps watching.

## Village assessment (plain words)

Four villages played days 40–80 and out to day 100, as a competent player trying
to survive and thrive.

- **96201 — the one that starved.** Before the fix it scraped through to day 101
  with five people and a nearly empty pantry; after the fix the same village
  scattered on day 69, four people left, nothing in the pantry, three dead of
  starvation. It knew a lot (65 Codex entries after the fix, 103 before — a
  shorter life learns less), had two seasoned village links, and fought wave 4.
  The hunger was already there in the before-panel; the after-panel just tipped
  it over.
- **96202 — the steady one.** Survived both panels (8 people before, 7 after),
  wave 3 before, wave 4 after, standing max 95 → 200. Fifty-six beasts slain
  before, 49 after. A village that holds.
- **96203 — the one that grew.** Survived both panels with only three people
  before — and nine after. Wave 4 both times, standing max 140 → 200. This is
  Jovan's village: a Ukrainian-only tattoo artist who wants his village linked
  to the world and keeps asking, in a language the scholar does not speak. Six
  unanswered asks after the fix, and the village is bigger for it, not smaller.
- **96204 — the furthest along.** Survived both panels (7 → 8 people) and
  reached **wave 5** after the fix — the only wave-5 village in this panel.
  Standing max 422 → 385. Seventy-five beasts slain before, 72 after.

Across the panel: villages reach regional standing (first regional days 32–91),
wave 4 is the norm, wave 5 was reached once. No village has banked two living
wave-4 killers and sat — the winnability chain's binding link is unchanged by
this run (this run was never about that link; it fixed how bonds are decided).

## What the transcripts showed (sense notes)

Read in full: the two Jovan sittings (before day 69, after day 65), Victor day 31
(the Q2 replay), Wei day 45 (people check). Analyzer-judged the rest (99
transcripts: 48 before, 51 after; B-SIT all answered; FIZZLE 0 dry sittings
both panels; G-SENSE 0 senseless sittings by the analyzer's pass).

- **The defect, in plain sight (before, Jovan day 69):** "Jovan speaks only
  🇺🇦 Ukrainian. No shared words at all — just eyes, hands, and patience. They
  speak. You understand none of it." Offered: `link:accept, link:decline` — in
  English. The scholar accepts and carries a proposal to Stonebridge for a man
  he cannot speak to.
- **The fix, in plain sight (after, Jovan day 65):** the same opening line, the
  same barrier — and the menu offers only `agency:ask_expedition, dlg:subject,
  leave, silence`. No bond/link choice. The scholar leaves. The request expires.
- **The replay (before, Victor day 31):** the link ask opens the sitting, the
  scholar accepts it ("You carry the proposal to Emberhold."), the conversation
  moves on — the scholar promises to ask the System about the taken pods — and a
  later "I'm listening" re-speaks the ask verbatim, as if never answered. The
  sitting is otherwise coherent; the replay is the one senseless beat. After the
  fix: 0 replays in 17 decision sittings.
- **A villager acting like a person (after, Wei day 45):** Wei the beekeeper opens
  with gratitude for food ("You came through on the food I needed. I won't
  forget it."), has an edge ("something curdled"), deflects reassurance ("...Fine.
  But I don't like owing." — the debt stays on their face), then leads the scholar
  out ("Come see what I found.") and teaches water-reading on the way, "how their
  grandmother did it." The debt isn't waved away; knowledge is freely given.
  This is what the conversation bar looks like when it works.
- **r110 nits:** not observed again — no Nathan/Christian/Denise/Irving in these
  seeds, and the stray lines ("It'll pass.", "Could be wrong, though.") appear
  0 times across all 99 transcripts.
- **All-tracks read (REWARD ALL PATHS):** dawn tops are spread — party_up,
  food_security, safety, build_standing, knowledge all appear as a villager's top
  goal. But the logged goal lines are ~75% food_security on every seed, and
  bonds / knowledge / safety / bank_veterans log **0 lines on all 8 seed-panels**
  (before and after). The goals system leans on food + partying up in what it
  records; whether the counter or the goals under-report the other tracks is a
  question for the one-brain work, not this run.

## Metric review

- The preregistered bindings held end to end: Q1 DEFECT-CONFIRMED → fix →
  FIX-WORKS; Q2 REPLAY-CONFIRMED → fix → FIX-WORKS. No metric was re-scored
  mid-run.
- The Q1-REQUESTS expired count rose after the fix (4→13). That is the gate
  working, not a reach regression — REACHED still binds on staged/decided, and
  the expired requests are now predominantly the unanswerable ones. No metric
  change proposed; the next run should expect expired to stay elevated while
  'none' holders exist.
- Instrument quirk found, not a metric change: `talkedWhileLive` is empty for
  request-holders whose decision happened in a request-sitting, because those
  sittings call `startConvo`, not `talkTo`, and the bond instrument wraps
  `talkTo`/`endConvo`. `lastSeenStaged` is likewise null for them. The verdicts
  use tele events, so they are unaffected — but the corroboration field is weak.
  Proposal for r115: record sitting days into `talkedWhileLive` in the driver.
- G-LINES under-reporting (above): bonds/knowledge/safety/bank_veterans log 0
  lines while dawn tops show safety/knowledge do get picked. Proposal for r115:
  check whether the line counter or the goals themselves are at fault.
- The langGate instrument needed two smoke-found scoping fixes before the pilot
  (see Infrastructure notes). The instrument as preregistered is what ran the
  panels; the fixes only made it record what the prereg described.

## Infrastructure notes

- **Smoke-found driver bug (fixed before the pilot):** `langGateOffers` was empty
  in the first smoke despite bond:accept being offered in 3 transcripts. Cause:
  `runConversation` is top-level and `ctx` is a per-seed local — the recording
  code threw `ReferenceError: ctx is not defined`, caught by the sitting's outer
  catch (and the catch itself referenced `ctx`, so the sitting aborted at the
  first bond: offer). A second scoping bug hid behind it: `commLevelOf` was
  defined inside `makePolicy`, so the offer recorder threw
  `commLevelOf is not defined`. Fixes (commit `b06a4b4b`): a module-level `_ctx`
  set in `policy.setup`, and `commLevelOf` moved to top level next to `gday()`.
  Re-smoke verified: offers=2, decisions=2, both comm 'full', no wrap errors,
  identical trajectory (day 45, survived, wave 4, pop 10/10).
- **Safe-commit index clobber struck on all three commits** (prereg `821f2d53`,
  driver fix `b06a4b4b`, game fix `344b7cd2`): the main index showed the committed
  file(s) as staged-deleted while worktree == HEAD. Repaired each time with the
  HEAD-blob recipe (`git ls-tree HEAD -- <paths> | git update-index --add
  --index-info`), verified `git status` empty + `git diff HEAD` empty. The
  commits themselves were always correct.
- **Registry flock jam:** a sibling reaper held `REGISTRY.lock` during the run;
  one heartbeat attempt timed out at 60s without landing (heartbeat was 9m49s
  old at the time, still valid). Heartbeat refreshed 14:26:52Z. Do NOT bypass
  the flock; queued heartbeats land when it releases.
- **After-panel slowness:** 293s for 4 seeds vs ~115s for the before-panel, with
  per-seed sim time ~2s each. Almost certainly flock contention on file writes,
  not sim slowness. The panel completed; no action.
- `git status` in the worktree is slow (evidence/ has ~82k files) — use
  `--untracked-files=no`. A broad `grep -rnw` over evidence/ dumps whole giant
  single-line JSON files — use `-l` for freshness greps.
- **Registry flock jam during the gate:** a sibling reaper + register + another
  lane's heartbeat queued on `REGISTRY.lock` for ~30 min; two heartbeat attempts
  (90s, 240s timeouts) did not land and the tree's heartbeat went 26 min stale
  (14:26:52Z → 14:52:50Z) while `check.js --quick` ran 789s. Status stayed
  `active` and the tree was not reaped (the reaper's threshold is far longer
  than the loop's 15-min liveness check — the finishersize removal was at 4.0h
  stale). Lesson for the next run: heartbeat immediately BEFORE starting the
  13-min gate, not after it, so the gate's runtime doesn't eat the window.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/deepening.json
--current '.../evidence/2026-11-07/journey-deepening-r114-after-seed*.json'
--metrics survival,wave,population,bondDecisions,linkDecisions`:
**quiet** (4 files, 5 metrics, no large deviations). No LOUD lines. The 96201
scatter is inside the survival metric's tolerance — a single-seed loss on a
4-seed panel, not a deviation the baseline flags.

## Regression

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
(789s): **284 passed, 6 failed** — all 6 in r113's known pre-existing set, none
touching bond-initiation or this run's changes:

- `test-measurement-proof-update.js` (measurement proof-update)
- `test-measurement-workflow.js` (workflow freshness / neutrality proof)
- `test-mobile-combat-cadence.js` (Continue wrap)
- `test-occupation-panels.js` (CLI workflow)
- `test-phone-frame-proof.js` (stale phone receipt)
- `test-establishment-r20-fixes-20261020.js` (voice-gate daily reset)

r113's set had 14 failures (cache-flags flaky, load timeouts among them); this
run has 6 — the others did not fail. No regressions from r114. The two new proof
tests are not on the green list; they were run directly: langate 24/24 green,
analyzer 15/15 green.

## Carried (not fixed this run)

- **Driver `npcComm` guards → r115.** The two dead guards (driver lines ~883,
  ~1282) call the nonexistent `Game.npcComm` and default to 'full'. Pointing them
  at the real `Game.commLevel` is a POLICY change, not a bug fix: the policy would
  start skipping no-language holders entirely. Whether the competent player sits
  no-language holders at all (for the nonverbal sitting, the expedition ask, the
  language-learning arc) is a preregistered decision for r115, not a silent
  change now.
- **Invite path re-stage shape.** The invite path has the same re-stage shape as
  the bond path (a different verb, not observed replaying). Out of scope for
  r114; watch r115 transcripts for an invite replay.
- **RE-ASK true-no-thread 1** (after, 96203 day 80, gen_kgwuzqb: "About the food
  I needed — I still haven't found anyone. Any chance?" with `fromSeed=false`).
  One orphan the analyzer couldn't trace to a seed thread. Watch, don't chase.
- **D-THING still mostly unnamed:** after-panel 1/5 named (2 old-rule). The
  pocketed thing gets mentioned, but usually by the old rule, not by name.
- **V-INIT bondSittings=0 both panels.** Villagers never open a bond sitting
  with the scholar — bond/link asks to the scholar arrive via `talkRequests`,
  not sittings. Is that the intended shape for villager-initiated bonds, or
  should a villager walk up and ask face-to-face? Carried question for r115.
- **SURV-CONTROL-4:** 6th control point now before 4/4 → after 3/4 (funnel
  unchanged per rule). Two panels in a row with an after-panel dip — keep
  watching; a third dip with a direct mechanism would be a finding, not noise.

## Commits (worktree branch `journey-deepening`)

- `821f2d53` — prereg + r114 driver + r114 analyzer + 2 proof tests.
- `b06a4b4b` — driver: fix langGate instrument scoping (smoke-found `_ctx` /
  `commLevelOf`).
- `344b7cd2` — game fix: language gate + decided-ask clear `[needs-eyes]`.
- (run note commit — this commit)
