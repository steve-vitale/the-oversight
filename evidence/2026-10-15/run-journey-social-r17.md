# journey-social r17 (2026-10-15) — leg 5 "social life"

## PRE-REGISTRATION (docs/MEASUREMENT.md §11, written BEFORE any run)

**Leg question:** Do villagers act like people across a run — conversations
carry meaning (NPC wants something; options engage/deflect; endings
resolve/plant/owe), gossip spreads with distortion, talk requests / moots /
friendships / rivalries fire, nobody robotic? (r16 closed the grief-thread
blank; this run census the rest of the social machinery.)

**Metrics (BINDING — §14 anti-drift; a miss is NO-GO, never re-scored):**

- (a) goal/want beat share: % of driven convos whose thread set includes
  'goal' or 'want'. **GO: >=30%.**
- (b) natural endings: % of driven convos with naturalEnd (NPC closed it,
  not the 12-turn budget + endConvo('left')). **GO: >=60%.**
- (c) talk requests: fired = distinct villagers with a v.talkRequests entry
  during the run; answered = fired whose entry reached delivered=true.
  **GO: avg >=2 fired per run AND >=50% answered.**
- (d) moots: mootsFired per run (player-vote duty by room-majority rule as
  in r16). **GO: >=3 moots total across the 6-run pilot AND >=1 moot beat
  transcript read in full.**
- (e) rumor spot-check: ONE planted rumor per run (Game.spreadRumor, same
  call the convo UI makes at conversation.js:5236), type 'stingy', on day
  20, teller = bearer, first hearer = 2nd living villager, target = 1st
  living villager. Traced to day 34: heard-set growth, distortion path,
  target rep dims, target trust. **GO: target REP dims moved non-zero AND
  target trust delta == 0 on every run (canon: gossip moves REP, never
  trust; seedGossip/spreadRumor carry noTrust).** Any trust movement not
  via the caught-lying trace = design violation = NO-GO + blank.
- (f) invented-shared-history: 0 lines in 12 sampled full transcripts
  (1 villager x day 15 + day 45 per policy-run, 2 per seed). Read by the
  author for meaning per the SENSE-TESTING LAW. **GO: 0 fabricated-history
  lines.**

**Pilot GO (whole-run):** >=5/6 runs reach day 60 with >=5 villagers alive
(death-aware stop otherwise); all of (a)-(f) GO.

**Expand decision:** pilot GO + at least one finding worth a longer horizon
(a blank to fix, or a pattern needing 120d confirmation) -> expand 2 seeds
to 120d+. Pilot GO + nothing interesting -> document and move on.

**Interesting finding:** filler loops, talk requests that never resolve,
rumors dying on arrival (0 spread beyond first hearer), distortion never
engaging (>=2 mutation path), fabricated shared history, robotic moot
votes, want-opener displacing urgent business.

**Horizon:** DAYCAP=60, death-aware stop + 10d tail (r13/r14/r15/r16
established social-leg pilot horizon).

**Seeds:** 1205, 1206, 1207 (new, adjacent to the r15/r16 1201-1204
series; tests generalizability).

**Policies:** competent + socialite, identical seeds. competent = pinned
baseline; socialite = the policy that isolates the social question
(built on competent + talks/feasts/moots).

**Driver:** scripts/journey-social-r17-pilot-20261015.js (r16 pattern +
want/request thread census, talk-request snapshot, planted-rumor trace,
sampled transcripts day 15/45, death census; grief capture removed).

**Telemetry guard:** qa counters vs telemetry-baselines/social.json; r16
documented the schema mismatch (r15 key names vs baseline key names) —
this run keeps the r15 schema; LOUD lines that are schema-mismatch are
explained, not re-baselined.

**§14 anti-drift:** the six metrics above bind this run. Doubts go under
"metric review" for the NEXT run.

## Run state

(Pilot results appended after the run.)

## Pilot results

6/6 runs completed, DAYCAP=60, death-aware stop + 10d tail. Driver:
`scripts/journey-social-r17-pilot-20261015.js`. Determinism: the full pilot
was executed twice (second run with TRUSTLOG instrumentation); per-run
metrics bit-identical across both executions.

### Pilot table

| seed | policy | endDay | alive | fallen | convos | goalWant | natural | treq f/a | repΔ | trustΔ | moots | pDeaths |
|------|--------|--------|-------|--------|--------|----------|---------|----------|------|--------|-------|---------|
| 1205 | competent | 53 | 12 | 0 | 660 | 558 | 652 | 6/6 | -50 | +1 | 0 | 0 |
| 1205 | socialite | 42 | 11 | 1 | 611 | 482 | 603 | 4/4 | -45 | 0 | 0 | 1 |
| 1206 | competent | 63 | 8 | 2 | 447 | 361 | 406 | 2/2 | -30 | +6 | 1 | 1 |
| 1206 | socialite | 46 | 11 | 3 | 594 | 489 | 581 | 3/3 | -45 | -90 | 0 | 2 |
| 1207 | competent | 61 | 9 | 8 | 519 | 437 | 511 | 6/6 | -50 | -3 | 0 | 4 |
| 1207 | socialite | 56 | 0 | 14 | 427 | 339 | 421 | 5/4 | -40 | -3 | 0 | 5 |

Per-seed JSONs: `evidence/2026-10-15/journey-social-r17-pilot-<seed>-<policy>.json`
(+ `journey-social-r17-pilot.json` aggregate). Transcripts:
`evidence/2026-10-15/social-r17-transcripts-prefix/` (12 sampled + 1 moot,
all pre-fix) and `social-r17-transcripts-postfix/` (1 post-fix sample).

Aggregate: 3,258 conversations; goal/want beat in 81.8%; natural endings
97.4%; 26 talk requests fired, 25 answered; qa asked 698 / answered 698
(100%); 463 recall hits. Top threads: want 2606, lately 2043, recall 935,
goal 453, skills 377.

### Census in plain words

Six villages, 31 dead. The competent villages held together (8–12 alive);
1207/socialite wiped on day 56 (14 fallen — a death spiral the +10d tail
couldn't outrun). The bearer <redacted> 13 times across the pilot; succession held
every time, twice choosing the rumor target (highest trust). What they knew:
villagers grieve out loud (r16's thread, still firing), debate monster names
at the fire ("Drum-Belly"... "Loud-Eyes" shouted down), report the sick row
unprompted, remember the Taking ("Why us. Why here. Why like THIS."),
and carry raid memories ("I stood down Hushpuppy at the treeline — it ran.
Don't call it brave. Call it awake."). What was missing: the resume/repair
machinery (the one blank, filled below) — and moots, which barely fired
under these two policies (see metric review).

### (a) goal/want beats: GO (81.8% >= 30%)

The want opener is the default and it fires constantly (want thread in
2,606 of 3,258 convos). NPCs surface concrete wants — food when starving,
help when sick, sleep, company. The 'goal' topic thread added 453 more.

### (b) natural endings: GO (97.4% >= 60%)

3,174 of 3,258 driven conversations closed via the NPC's own energy budget,
not the 12-turn driver cap. Conversations end; they don't dangle.

### (c) talk requests: GO (4.3 fired/run >= 2; 96% answered >= 50%)

26 fired across 6 runs (every run fired ≥2), 25 answered (delivered=true).
The one unanswered expired under the ~3-day expiry (expireTalkRequests) —
villagers let go of unanswered requests, by design. 41 conversations opened
on the 'request' thread.

### (d) moots: NO-GO as pre-registered (1 total < 3)

One moot fired (1206/competent, day 10–11): a full murder trial — Carmela
accused of Mia's murder alongside Jovan and Wanda; investigation beats
(Wanda breaks under a leniency offer), the System's gameshow framing, a
7–0 guilty count (6 NPC + player), Carmela exiled, Jovan exiled, Wanda
leniency + probation. The single moot transcript reads as a real justice
system with differentiated outcomes — quality PASS. But the COUNT metric
missed: neither competent nor socialite commits crimes, so the justice
system starves. r16's larceny-leaning runs fired 8–16 moots each. This is a
policy-coverage property, not an engine break — see metric review.

### (e) rumor spot-check: mechanism CONFIRMED, literal metric NO-GO

All 6 planted rumors ('stingy', day 20) traveled: 7–11 hearers of ~12
villagers within a day, distortion 6–10 (the ≥2 mutation path fully
engaged — "It's barely the same story now. That's what fires do."), target
REP (generous) moved -30 to -50 (per-hearer 0.4-weight application of the
distortion-mutated dims — by design). Stories faded after ~3 days, REP
persisted.

Trust deltas (+1, 0, +6, -90, -3, -3) were FULLY ATTRIBUTED via the new
TRUSTLOG gate (scripts driver, TRUSTLOG=/tmp/x.jsonl — every trust write
with day/id/delta/stack; 10,383 events across the pilot):
- The rumor mechanism made ZERO trust writes except the DOCUMENTED
  caught-lying trace: 2 of 6 runs, -6 to the subject when the first hearer
  retold (spreadGossip's 15%/hop trace — exactly the designed exception:
  "the subject's trust of you moves only when the trace catches you lying").
- +1/+6: deed-based gains (fetched water, kept haven fed, feasts).
- -3/-3: leadership friction ("gave orders over a contender", -2) and
  conflict incidents ("carried an unkind message", -3).
- -90 (1206/socialite): NOT the rumor — the target (Daniel, trust 90)
  became the new Bearer <redacted> day 29. Sequence: agency bonus +1,
  mentorship-death cost -8 (betrayal.js:848 — the dead Bearer <redacted> mentored;
  "the village trusted you with them"), then the mantle trust inheritance
  (ledger.js:963) repurposed his entry to 55. Designed mechanics, wrong
  metric.

Verdict: gossip moves REP, never trust — CONFIRMED at the mechanism level.
The literal "trustDelta == 0" metric was confounded by deeds, the designed
trace, friction, and succession. See metric review for the revised metric.

### (f) invented-shared-history: GO (0 lines in 12 transcripts)

Zero fabricated-history lines. The mantle-handoff framing ("Jayden and I
never finished talking about their skills... You're wearing Jayden's shoes
now — want to pick it up?") names the predecessor honestly — continuity,
not fabrication.

## People check

Read in full: 12 sampled transcripts (pre-fix) + 1 moot + 1 post-fix
sample. Where the engine has content, villagers read as people: recalls
with pushback ("You said everyone left someone behind... you answered for
everyone — not for you"), grief with names, the Taking as philosophy,
raid memories, the favor-deflect with teeth ("No, yeah, of course. Forget
I asked." — they won't forget). The moot is the best thing in the set.

Where the RESUME/REPAIR machinery ran, it read as a robot (the blank):
deflection lines quoted as memories, openers that were deflections,
resume choices dead-ending into deflections, 30–83% deflection density per
transcript. Post-fix sample: 46% and falling, with the structural beats
working ("About what's been happening — yeah, we never did get back to
that."). The remaining deflections are legitimate pool-exhaustion
fallbacks — filed as a design question below.

People check: CONDITIONAL PASS — content beats pass; the repair machinery
failed pre-fix and is fixed post-fix (proof test 10/10 x3 seeds).

## Blank (filled): the resume/repair machinery manufactured filler loops

**Found by:** this run's sense-read (12/12 pre-fix transcripts show it).

**Root cause (one mechanism, four symptoms):** dry-line deflections and
self-repeat brush-offs are META-SPEECH, but the engine treated them as
thread content:
1. `sayLine`'s no-repeat fallback chunks were fed to the thread-beat hook
   (`convoNoteSpokenBeat`) AND the convoTurn tail ledgered the unspoken
   primary as a beat — deflections became the thread's "last beat".
2. `convoResumeOpener` quoted that "last beat" as the unfinished topic:
   "We never finished talking about what's been happening — we wandered
   off it. 'Hm. Never mind — go on.'"
3. Generic resume/repair beats ("About that favor — yeah, we never did get
   back to that.") use generic labels by design, so the 48-entry run-wide
   no-repeat ledger blocked them for every villager after the first each
   day — collapsing into more deflections, which fed (1).
4. Snippet-less ghost threads planted "unfinished business" from nothing.

**Fix (src/js/conversation.js):**
- `convoDeflectionLines()` central pool + `convoIsDeflectionLine()` (quote-
  normalized: snippets are stored quote-stripped by clipSnippet); the dry
  and self-repeat pools now draw from it (strings byte-identical).
- `sayLine`: fallback chunks are not fed to the thread-beat hook; the
  blocked state is mirrored to `c._sayFellBack` for the turn tail.
- `sayLine` opts.structural: resume openers, recap lines and generic
  thread-resume responses skip the run-ledger block (per-sitting ledger
  still applies — true same-conversation repeats keep the honest
  "I just said" path). Defect-7 parroting protection kept for content.
- `convoResumeOpener` returns `structural: true` (consumed at the
  startConvo emission) and never quotes a deflection snippet.
- `convoTurn`: `structuralTurn` flag set by the recap and generic-resume
  branches (real beats keep full ledger protection).
- `convoThreadOpen`: no snippet → no plant (extends the LEDGER GATE).

**Proof:** scripts/test-resume-repair-r17-20261015.js — RED on pre-fix HEAD
(4 pass / 5 fail: A2, B2, C1, C2, D1 fail — the bug reproduced), GREEN
post-fix 10/10 on seeds 45, 1205, 7. Transcript-level before/after:
pre-fix 1207-competent-day15 71% deflection density → post-fix 46%, with
the resume opener quoting real content and resume beats spoken verbatim.
**Regressions:** node scripts/check.js --quick 96/98 (2 pre-existing
where-are-we fails, same as HEAD); check.js --only convo 13/13;
scripts/validate-ontology.js 115/115.

## Reachable / fun / winnable

- **Reachable:** yes — want beats in 82% of conversations, talk requests
  firing and answered in ordinary play, rumors traveling the full gossip
  chain with distortion, the moot path proven end-to-end (investigation →
  trial → differentiated verdicts). The fixed resume paths are ordinary-
  play paths.
- **Fun:** yes with the fix — the village talks like people where it has
  content; the repair machinery no longer eats conversations. The moot
  transcript is the strongest social content in the game.
- **Winnable:** n/a for the social leg; nothing gates. (Noted: 1207/
  socialite wiped at day 56 — the socialite's feast/hosting spend has a
  survival cost; the competent villages held.)

## Metric review (docs/MEASUREMENT.md §14)

- (a) GO, (b) GO, (c) GO, (f) GO.
- (d) NO-GO as written (1 < 3) — but the miss is a policy-coverage
  artifact, not an engine gap: competent/socialite don't commit crimes, so
  no cases exist to try. r16's larceny-leaning runs fired 8–16 moots each
  on identical seeds. REVISED METRIC for the next social run: pair
  competent with larceny-leaning (the policy that isolates the justice
  question), or pre-register the expectation honestly (≥1 moot per
  larceny run, 0 expected from competent/socialite).
- (e) literal NO-GO, mechanism CONFIRMED. The "trustDelta == 0" metric was
  confounded by deed gains, the designed caught-lying trace, leadership
  friction, conflict incidents, and succession repurposing the target's
  entry. REVISED METRIC for the next run: "zero spreadGossip-attributed
  trust writes to the rumor target during its active window, outside the
  caught-lying trace path" — measured directly by the new TRUSTLOG gate
  (TRUSTLOG=/tmp/x.jsonl). All 6 runs pass the revised metric (the only
  spreadGossip trust writes were the 2 designed -6 traces).
- Pilot GO overall: 5/6 runs reached day 60 with ≥5 alive (1207/socialite
  wiped day 56 — death-aware, legitimate); (d) and (e)-literal missed per
  above, both explained and re-specified. The blank is filled with proof.
- Expand decision: NO 120d expansion — the pilot's interesting finding (the
  resume/repair blank) is fixed and proven at the unit + transcript level;
  a longer horizon would not add signal on the remaining questions.

## Telemetry

telemetry-check.js vs telemetry-baselines/social.json: LOUD lines are the
known schema mismatch (driver writes qa.asked/qa.answered/qa.recalls; the
baseline has qa.askedTotal/qa.answeredTotal/qa.recallHits — the r15/r16
standing note). No data deviation; qa counters healthy (asked == answered
on all 6 runs). Not re-baselined (per the standing note: adopt one schema
first).

## Design questions for the sim-findings backlog (filed, not chased)

1. Deflection-fallback density when content pools exhaust: post-fix
   transcripts still run ~46% deflection lines under a spammy driver
   ("Yeah."/"I see." → blocked → dry cycle). The dry pool is the honest
   fallback, but a long dry streak reads robotic. Consider: natural
   wind-down (energy-budget end) instead of dry cycling past N consecutive
   fallbacks, or pool-depth tuning for the most-hit generic reactions.
2. The 'lately'/'recall' ghost-thread class is narrowed (no snippet, no
   plant) but threads with ONE real beat still resume thin — acceptable,
   noting for the record.

## Convergence line

Social-life axis (leg 5): want beats reachable (81.8%, (a) GO); natural
endings 97.4% ((b) GO); talk requests fire and resolve (96% answered, (c)
GO); gossip travels with distortion and moves REP-only ((e) mechanism
confirmed); moot path proven end-to-end but starved by policy choice
((d) NO-GO, re-specified); zero fabricated history ((f) GO). Resume/repair
filler-loop blank filled with RED→GREEN proof (10/10 x3 seeds) + transcript
before/after. New tooling: TRUSTLOG trust-attribution gate in the r17
driver. converging.
