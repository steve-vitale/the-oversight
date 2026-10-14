# journey-social r14 (2026-10-14) — leg 5 "social life"

## PRE-REGISTRATION (docs/MEASUREMENT.md §11, written BEFORE any run)

**Leg question:** Does the curious-want seed resume the SAME unanswered
question the NPC asked before the player walked away — naming it like a
person — or does it quote a generic "that question" and ask something new?
(r13 watch item 1; blank hunt.)

**Primary metric M1 (blank hunt):** `curiousResumeCoherent` = for every
curious-seed resume observed in natural play: (a) the re-hung question id ==
the id hung when the player walked away, AND (b) the opener names the actual
question (seed note = question noun phrase, not 'that question'). **GO
threshold: pre-fix pilot shows violations (resume asks a different question
and/or says "that question"); post-fix proof + natural play show 0.**

**Primary metric M2 (people check):** of 8 full transcripts spanning
stranger/friend/grief-or-favor arcs, ≥6/8 meet the conversation quality bar
(NPC wants something concrete; options genuinely engage/deflect; ending
resolves, plants a thread, or creates an obligation; zero fabricated shared
history; no filler loops; no static menus).

**Interesting finding:** the resume re-asks the identical question text with
a named reference; or a new leak class (seed note surfacing raw in other
wants); or grief threads exercising for the first time (mortality window).

**Horizon:** DAYCAP=60, death-aware stop + no dead-village ticking (r13
established social-leg pilot horizon). 60d suffices for seed plant→resume
cycles (seeds expire after 7 days; driver talks daily).

**Seeds:** 818, 929, 1040 (fresh slice; r13 used 515/626/737).

**Policy:** socialite + one full driveOne convo per villager per day (r13
pattern). Driver: answer bespoke questions with first non-opt-out answer;
prefer dlg:help/dlg:details/want: follow-ups, then t2 topics, else leave;
12-turn budget; endConvo('left') on exhaustion. The driver WALKING AWAY from
hanging questions is what plants curious seeds — natural play covers it.
Metric-review note from r13: qa.askedTotal/answeredTotal/recallHits counters
restored in this driver (r13 skipped them).

**Telemetry guard:** qa.askedTotal/qa.answeredTotal/qa.recallHits/end.day/
end.alive vs telemetry-baselines/social.json — any LOUD line is a same-run
investigation item before rolling the baseline (§13 step 9).

**§14 anti-drift:** M1/M2 thresholds above bind this run. A miss is NO-GO —
never re-scored mid-run; doubts go in "metric review" below for the next run.

## Run state

### Pilot (3 seeds × 60d, socialite + walkaway probe)

Driver: `scripts/journey-social-r14-pilot-20261014.js` — r13 pattern plus
restored qa counters (r13 metric-review note) and a day-5 walkaway probe
(one villager/seed deliberately walks away from a hanging bespoke question
so the curious seed→resume path fires in the live flow, not just the
targeted proof).

| seed | end day | alive | fallen | convos | asked/answered | recalls | curious resumes (bad) |
|------|---------|-------|--------|--------|----------------|---------|----------------------|
| 818 | 63 | 8 | 0 | 527 | 154/154 | 88 | 0 (0) |
| 929 | 63 | 7 | 0 | 442 | 88/88 | 47 | 1 (0) |
| 1040 | 54 | 9 | 0 | 492 | 134/134 | 62 | 0 (0) |
| **total** | 180 | 24 | 0 | 1461 | 376/376 | 197 | **1 (0)** |

**M1 verdict: GO.** Pre-fix violations demonstrated by the RED proof
(different question re-asked + generic "that question", 4 failures). Post-fix
proof: ALL GREEN (5 assertions). Natural play: 1 resume observed, 0
violations — seed 929, Dwayne, day 6: *"About your regrets — Any regrets? The
real kind, not the small stuff."* (q_regret → q_regret, named).

A probe finding worth recording: the answer-everything driver almost never
walks away from a hanging question (nLeft=1/220 in a 20d probe) — curious
seeds are rare in competent natural play by construction. The walkaway probe
(day 5) is what produced the single natural resume. The mechanism is proven
by the targeted proof; natural-play coverage of this path will always be
thin with a cooperative driver.

### Village assessment (census, plain words)

Three villages, 12 souls each, lived to day 54–63. **Nobody died** — fallen=0
on all three seeds, third consecutive social run with zero mortality. The
socialite policy keeps everyone fed and nobody picks fights; cohesion held
(alive 7–9 at end, no r13-style 12→1 scatter this slice).

What they knew: strangers on day 2 becoming people with trades and
old-world specifics — a mechanic "good at making things work with what's
actually here", a chef ("Why — do I look useless to you?"), sunset ratings
("Tonight's a seven. Yesterday was a nine, no notes."), grocery-store
nostalgia. NPCs ask about the player and remember answers (recall system:
197 recall hits, all matched).

What was missing: no deaths means **grief threads unexercised three runs
running** (0 grief lines in 36 sampled transcripts), and **moots silent**
(0 moot lines) — the socialite policy never stresses the village enough to
fire them. This is a policy-coverage gap, not an engine gap: the content
exists but this leg's driver can't reach it. A future run needs a mortality
capable policy to sense-read grief.

### People check (full transcripts, sense-read)

9 transcripts read in full (1040 T0/T5/T11, 818 T0/T5/T11, 929 T0/T6/T11 —
stranger arcs, a nonverbal Italian convo, day-10 relationship convos).
Verdict: **9/9 meet the quality bar** (M2 GO: ≥6/8).

Best moments:
- 818 T5 (nina_petrova): the fixed seed resume firing live — *"About your
  plan here — So what's your plan here? Just... get through it? It'll
  pass."* — and the player's thread choice naming it too (*"About your plan
  here — we never finished."*). Both surfaces fixed, in the wild.
- 929 T11 (somchai): *"We never finished talking about what's been happening
  — we wandered off it, 2 days back."* — the honest-time resume naming the
  gap. Player repeats "Slowly." twice → *"Same story, second telling. No
  crack — yet."* — the NPC notices the repeat instead of looping.
- 929 T0 (Dwayne): *"We need something to DO together. Joint work fixes more
  than joint talking."* — the NPC's want surfacing as a real point.
- 929 T6 (giulia, nonverbal Italian): gestures-only conversation with a
  "Water?" beat — complete and human with zero shared words.

Warts (minor, documented not chased):
1. engageBeat on thread-resume of an answered question (818 T0): *"Huh. I
   wouldn't have guessed that about you."* after the player merely resumed
   the "what day it is" thread — the beat implies a revelation that didn't
   happen. Driver-exaggerated (the question WAS answered earlier).
2. *"...Sorry, lost my train of thought."* when the player deliberately
   resumes a thread (818 T5) — the beat doesn't fit a deliberate return.
3. Nonverbal *"They nod back, slowly."* ×3 (929 T6) — known repetition
   class, tolerable.

Fabricated-history incidents: **0**. 'You told me' recalls fired and matched.

### Blank: curious-seed resume (r13 watch item 1)

**Root cause (deeper than r13's note):** TWO defects, not one. (1) The
curious opener hung a FRESH question on resume (`convoHangWantQuestion`
excludes askedQs) — the seed claimed "About that question" while asking a
different question, and the original evaporated (r13 called this "coherent";
the RED proof shows q_hope → q_skill). (2) The seed stored only the generic
note 'that question' — and the same generic label leaked through
`convoTopicLabel(vid,'want')` into the open-thread ledger, so the player's
resume choice read *"About that question — we never finished."* (seen in
r13's own transcripts).

**Fix** (src/js/convo-wants.js, src/js/conversation.js):
- `QUESTION_TOPIC` map: 36 bespoke-question ids → plain noun phrases (same
  register as r13's t2speech map).
- `curious.resolve` captures the hanging question's id (`c.pendingQ` is live
  — `convoResolveWant` runs before `endConvo` clears it) and names the note:
  seed = `{wantId:'curious', note: phrase, qid}`.
- `curious.opener` re-hangs THE SAME question on seed resume (no askedQs
  double-count, no re-gating); falls back to a fresh ask if the def is gone.
- `convoHangWantQuestion` records `c.want.qid` (the want's question
  identity, for labels even after answering).
- `convoTopicLabel(vid,'want')` names the curious question via
  `convoQuestionTopic` (want.qid → seedQid → pendingQ) instead of the
  generic map entry — fixes the ledger label, recap lines, and resume
  openers in one place.
- Seed plumbing carries `qid` through `convoPlantSeed` → `convoSelectWant`
  → `c.want.seedQid`. Legacy seeds (no qid) degrade gracefully to the old
  fresh-ask behavior.
- New Game methods `convoQuestionTopic(qid)` / `convoQuestionDef(qid)`;
  ontology header + ONTOLOGY.md updated.

**Proof:** `scripts/test-curious-seed-resume-20261014.js`.
- RED (pre-fix): q_hope → q_skill, "About that question", no qid in seed.
- GREEN (post-fix): same question re-asked, named reference, seed records
  qid, ledger label named — plus scenario 3 (answered → subject change →
  walkaway) naming the answered question. ALL GREEN.
- Observable effect: pre-fix *"About that question — What's something
  you're good at...?"*; post-fix *"About what you're hoping for — What are
  you hoping for? Not the big stuff. The small thing. It'll keep."*

### Regression suites

- `test-topic-title-leak-20261014.js` (r13) — ALL GREEN.
- `scripts/validate-ontology.js` — 96/96, release permitted.
- `node --check` on both edited files — clean.
- No jest suites in repo; no concurrent jest.

### Telemetry

`telemetry-check.js` vs `telemetry-baselines/social.json`, metrics
qa.askedTotal/qa.answeredTotal/qa.recallHits/end.day/end.alive, per-seed
files: **quiet, no LOUD lines** (3 files, 5 metrics). Baseline NOT rolled
forward (rule: only seed when none exists).

### Verdicts

- **Blank: FILLED.** Curious-seed resume now re-asks the same question and
  names it, on the NPC opener, the seed note, and the open-thread ledger
  (player's "we never finished" choice). RED→GREEN proof + 1 natural-play
  resume with 0 violations.
- **People check: PASS 9/9.** Strangers, friends, nonverbal, thread resumes,
  timed resumes all read as real people. 0 fabricated-history incidents.
- **Reachable:** yes — resumes fired in natural 54–63d play; the walkaway
  probe guarantees the path is exercised.
- **Fun:** yes — "About your regrets — ..." reads like a person picking up
  a thread, not a menu.
- **Winnable:** n/a for the social leg; nothing gates.
- Watch items for future social passes: (1) grief threads still
  unexercised — need a mortality-capable policy (3 runs, fallen=0); (2) moots
  silent under socialite — same root cause; (3) minor beat mismatches on
  thread-resume (engageBeat/lost-train) — driver-exaggerated, not chased.

### Metric review

M1 bound: pre-fix violations (RED proof: 4 failures incl. different-question
resume), post-fix proof 0 + natural play 0 violations (1 resume). Met. M2
bound: ≥6/8 transcripts pass (got 9/9). Met. Metric notes for the NEXT run:
the answer-everything driver starves the walkaway path (nLeft=1/220) — keep
the day-5 walkaway probe or the seed→resume path goes uncovered. The
`resumes` metric is coverage-thin by construction; the targeted proof is the
stronger evidence for this blank class.

### Convergence line

Social-life axis (leg 5): curious-seed resume fixed (same question + named
reference, both surfaces); transcript quality bar 9/9; no fabricated
history; telemetry quiet. Grief/moot coverage remains the open chapter —
structurally unreachable under the socialite policy (fallen=0, 3 runs).
Villager-agency axis unaffected.

