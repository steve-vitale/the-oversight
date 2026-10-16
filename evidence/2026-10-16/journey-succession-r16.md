# journey-succession r16 (2026-10-16): "the revolving door"

## Pre-registration (§11; binding per §14)

- **Question:** the mantle passes on every death — proven through r15. What
  happens when the Codex passes THREE times in five days? Does the handoff
  fiction hold when the new bearer <redacted> bearer <redacted> 2 days? Does the village
  grieve three fresh deaths, or only the last? Do the burial beats stack
  sanely? Does trust inheritance behave across fast chains, or go
  pathological? (flesh-out loop B's sim-succdeath-b census today covered the
  statistics of fast deaths; this run covers the PLAYED experience.)
- **Substrate:** r15's scripted-death substrate (r14's 16d competent +
  scripted hushwolf deaths), 3 deaths at d18/d20/d22 + 18d tail → ~d41
  horizon. Fresh seeds 841, 842, 843. 9 successions total.
- **Policy:** scripts/policies/competent.js.
- **Metrics (BINDING — a miss is NO-GO, never re-scored):**
  - (a) mantle fires on every scripted death: **GO 9/9.**
  - (b) handoff-beat completeness per death — death line, codex sync beat,
    MANTLE TRANSFER system line, turns-a-page, orientation ("You wake up
    somebody else"), bring-home burial: **GO 9/9 complete.** ("you're not
    her" + vouch + own-record lines are conditional — captured, not scored.)
  - (c) people-check: 3 full transcripts per seed (highest-trust living
    villagers, as the final bearer): PASS/FAIL on the conversation quality
    bar; **GO 3/3 seeds PASS** (borderline judged in note, never re-scored).
  - (d) NEW — multi-death mourning: count mourning-topic lines naming >1
    fresh corpse across 3 convos/seed + a direct `t2LatelyEvent` probe with
    fresh corpses. INTERESTING-FINDING threshold: 0 multi-name lines AND
    probe shows only-last-corpse → the multi-mourning fix is justified
    (implement + RED→GREEN proof); else document, leave the pools alone.
- **Interesting-finding bar:** a handoff line that reads wrong for a 2-day
  bearer; overlapping/duplicating burial beats; trust inheritance going
  pathological (floor/hit-cap surprises); grief not stacking; the village
  naming the chain — or never noticing it.
- **What this run does NOT re-prove:** self-card (r14), death-cause (r14),
  promise release + re-ask (r11), mourning chains (r11/r14), snippet clip
  (r13), own-record handoff line (r15), grief-skeleton wrinkle (2026-10-13,
  unaddressed).
- **Telemetry:** flat dotted-key schema incl. the 5 succession.json keys +
  r16 keys (deaths.chain3, handoff.completeness, mourning.multiName,
  trust.inheritChain, week2.deadBearerMentions).

## Metric review

- (a): GO 9/9 — the mantle fired on every scripted death, no exceptions.
- (b): GO 9/9 — all 6 core beats fired on all 9 deaths. Conditional beats
  behaved as designed: "you're not her" fired only on 842 (the one seed
  with close villagers at trust>55 in the office); vouch fired 3/9
  (841/d22, 842/d18, 842/d22); own-record fired 9/9 (every 2-day bearer <redacted>
  a real villager record from before the chain).
- (c): GO 3/3 seeds — 9/9 transcripts PASS, 3 borderline (Ivy, Miroslava,
  Sari: honest drift/distraction, no fabricated history, no filler loops).
- (d): threshold MET pre-fix → fix implemented and proven (see Blank).
  Procedure note: the 9 people-check convos ran at d41, outside the 3-day
  acute grief window (the tail is 18d) — so `mourning.multiName: 0` in
  telemetry is a procedure artifact, not a finding. The direct
  `t2LatelyEvent` probes (run at d19/d21/d23 with 1–3 fresh corpses) are the
  decisive evidence: pre-fix they named only the last corpse, twice a
  monster ('Dustboar', 'Big Big'); post-fix they name every fresh sapient
  corpse. Not re-scored; the metric did its job.
- week2.deadBearerMentions: 0 — same procedure artifact (convos 19 days
  after the chain; the 10-day mantle-memory tail expired honestly).

## Results

### Pilot table (3 seeds × 3 scripted deaths, ~d41 horizon)

| seed | chain | trust inherit | alive | fallen | complete |
|------|-------|---------------|-------|--------|----------|
| 841 | Ingrid→Alex (d18) →Mason (d20) →Angela (d22) →Nadia (d30†) →Dmitri (d37†) | 15→42, 42→41, 41→44 | 8 | 6 | 3/3 |
| 842 | Ricardo→Sandra (d18) →Vikram (d20) →Kyle (d22) | 11→39, 39→44, 44→48 | 8 | 4 | 3/3 |
| 843 | Gilberto→Barbara (d18) →Denise (d20) →Booker (d22) | 0→36, 36→39, 39→40 | 9 | 6 | 3/3 |

(† natural deaths in the tail — the mantle kept working unscripted.)

**Trust inheritance across fast chains: stable, not pathological.** The
r15 formula (office×0.4 + own×0.4 + vouch, floor 10) converges to ~40
within one hop and stays there: 42→41→44, 39→44→48, 36→39→40. The
floor-10 rule never bound (lowest inherit 36). A 2-day bearer's "own
record" is their long villager record — honest, and the fiction names it
("The fire knew Kyle — solid ground, earned at this fire." fired 9/9).

**The handoff fiction holds on a 2-day bearer.** 842/d22 in full:
"🕯️ Vikram Qian is dead — a hushwolf..." → "Vikram's gone." Olivia:
"You're not Vikram." → Codex sync → "MANTLE TRANSFER DETECTED..."
→ "The Codex turns a page: Vikram Qian, 22 days. The mantle passes to
Kyle Santos." → "🪞 You wake up somebody else. Kyle Santos, 30 — an ER
nurse." → "At the grave, Olivia speaks for Kyle — 'Vikram trusted them.
We saw it.'" → "The fire knew Kyle — solid ground, earned at this
fire." Nothing reads wrong for a 2-day reign; the beats are about the
office and the village, not the length of the tenure.

**Burials stack sanely.** Each death queues its own pendingBurials entry;
recoverBearer processes each when day > p.day (the 2nd endDay after the
death — a timing subtlety the driver's first slice missed, corrected).
"That night, they bring Ingrid home..." fired for all 3 scripted deaths
on every seed. No overlaps, no duplicates.

### Census (day 41)

- 841: Dmitri Sokolov (trust 53), 8 alive, 6 fallen, pantry 92k kcal,
  codex breadth 85, integration 3, epithet "the Feared". mantleOf chain of
  5 (2 natural tail deaths).
- 842: Víctor Chourio, 8 alive, 4 fallen, epithet n/a.
- 843: Booker Miao, 9 alive, 6 fallen.

## Village assessment (plain words)

Three villages lived through the revolving door — three bearers in five
days — and kept being villages. On 841 the chain didn't even stop at the
script: Angela (d22's successor) died in combat d30, Nadia d37, and the
mantle passed twice more unscripted, no drama, no breakage. The fire
grieved each bearer by name while the grief was fresh (Aki: "Nadia is
gone and the world just... continues."; Carlos: "Nobody says Nadia's
name right yet. We will."; Ivy: "The fire feels smaller without Nadia."),
then moved on — by day 41 the scripted chain is 19 days past and nobody
mentions Ingrid or Alex or Mason, which is honest: the 10-day
mantle-memory tail expired. What was missing before this run: the acute
grief topic could only name ONE corpse — with three fresh dead the
village grieved one at a time, and twice named a monster instead
("Since Dustboar died..."). Fixed this run (see Blank). What remains
unproven: a calm season under a successor — every run is still brutal,
but that's the world, not the succession system.

## People check (SENSE-TESTING LAW — 9 full transcripts read)

All 9 PASS against the conversation quality bar; 3 borderline (honest
drift, not failures).

- **841/Aki (79):** want (teach me, think out loud) + grief ("Nadia is
  gone and the world just... continues." / "I keep turning over the last
  thing Nadia said to me."). Natural ending. PASS.
- **841/Carlos (70):** grief by name ("Since Nadia died... I keep
  expecting to see Nadia at the fire. Stupid." / "Nobody says Nadia's
  name right yet. We will."). "This was good. They mean it." PASS.
- **841/Ivy (60):** withdrawn, deflection-heavy, but real beats (the
  funny-story laugh, "The fire feels smaller without Nadia. The rest of
  us will have to be bigger."). Party-invite refusal honest at trust 60.
  BORDERLINE-PASS.
- **842/Miroslava (90):** trap-line want, naming debate. Ends flat
  ("...Sorry, lost my train of thought.") but not a loop.
  BORDERLINE-PASS.
- **842/Olivia (77):** regret want, grief ("everyone's carrying one of
  those"), naming debate with opinions, teach beat (Jerusalem Artichoke),
  "You're family now. Chosen family." PASS.
- **842/Sari (63):** thin — the driver deflected her want ("Still
  figuring everyone out") and she drifted ("...Where was I? Gone.").
  Honest distraction, no fabrication. BORDERLINE-PASS.
- **843/Gabriela (90):** trap-line want, the Hide-and-Seek abduction
  discussed ("They took Hassan and Vasyl — on the screens. The whole
  fire watched."), teach beat (Wild Onion). PASS.
- **843/Hassan (90):** the abduction survivor's own story ("They took
  me... I'm still turning it over."), "Same as always: we endure."
  PASS.
- **843/Miguel (49):** guarded but real ("You're alright. I think. Ask
  me again in a week." / "I've changed my mind about people before.
  Usually it takes getting hurt first."). PASS.

**No fabricated shared history in any transcript.** The dead are spoken
of in third person; the new face is never confused with them.

## Blank (filled): the village grieved one at a time

**Found by:** (d) metric — pre-fix probes with 1–3 fresh villager corpses
returned only the last corpse's name; twice the "last corpse" was a
monster ('Dustboar' on 841/d18 with Ingrid + Jayden fresh-dead;
'Big Big' on 843/d22), producing "Since Dustboar died... I keep
expecting to see Dustboar at the fire. Stupid."

**Root cause:** `t2LatelyEvent`'s acute-grief branch read
`corpses[corpses.length - 1]` — a single corpse of any kind, no
freshness check, no kind filter. (Per Steve's 2026-10-16 root-cause
rule: one representation problem, not a new system.)

**Fix** (src/js/convoTopics.js, two spots):
1. Acute-grief branch: collect fresh SAPIENT corpses
   (`corpseIsPerson`: 'person' + 'villager' kinds — the first draft used
   only 'villager' and regressed test-mourning-name-r8, which uses
   kind:'person'; the canonical helper fixed it) with dayDied within the
   3-day acute window. Monsters are never mourned by name. The event now
   carries `names` (all fresh dead, oldest first) with `name` = most
   recent (the {mname} substitution is unchanged).
2. `case 'mourning'` lines: multi-name templates —
   "We lost A, B and C this week. I keep setting out extra portions.
   Stupid." / "A is gone, B is gone, and C is gone and the world
   just... continues." Single-name lines and tone preserved exactly;
   nameless fallback preserved; sickDeath names the most recent.

**Proof:** scripts/test-mourning-multi-20261016.js — RED 7/16 on
pristine → GREEN 16/16 post-fix (all three named; monster displaced;
single-corpse tone preserved; stale corpses excluded; rendered lines
name everyone). Wild validation: post-fix probes name every fresh dead
(['Jayden','Ingrid'], ['Alex','Néstor','Mason'], ['Ricardo','Sandra'],
['Aitana','Gilberto','Katarina'], ['Barbara','Denise']) — no monsters.

**Regressions:** test-mourning-name-r8 7/7, test-mourning-pools-20261013
81/81, test-lately-pools-20261013 243/243, test-grief-window-days 6/6,
test-grief-promotion 8/8, proof 16/16. test-mantle-memory-20261012: 4
fails — verified PRE-EXISTING on pristine via patch-swap (no stash, per
the hot-tree rule). check.js --quick: 96 passed, 1 failed — the failure is
scripts/test-sprites-valid-20261014.js (dustboar/sunback/sweeps_week/
cliffhanger calm/aggro sprites), which does not touch convoTopics and is
outside this run's diff (asset issue, pre-existing relative to this run).

## Reachable / fun / winnable

- **Reachable:** yes — the revolving door is the extreme case and every
  beat fired; ordinary single deaths are the common case and r11–r15
  proved them.
- **Fun:** yes — the handoff is still the best-written sequence in the
  game, and now the village grieves a bad week the way people do ("We
  lost A, B and C this week.").
- **Winnable:** the mantle never blocks it — Codex, slots, arc,
  integration, ledger persist; trust converges to a workable ~40 rather
  than collapsing; nothing in the transfer blocks progression.

## Telemetry

telemetry-check.js vs telemetry-baselines/succession.json:
- **LOUD: `census.fallen` swung 167%: baseline 6 → current 16.** Verdict:
  EXPLAINED, not a bug. The baseline was built on a natural-death
  substrate (2 fallen/run); r16 scripts 3 bearer <redacted> per seed by design
  (9 scripted + 7 natural = 16). Not rolling the baseline forward: the
  substrate changed deliberately this run.
- **LOUD: `week2.deadBearerMentions` disappeared: baseline 3 → current 0.**
  Verdict: EXPLAINED, not a bug. The people-check convos ran at d41 — 19
  days after the chain, outside both the 3-day acute grief window and the
  10-day mantle-memory tail, so zero mentions is the honest reading. The
  baseline's 3 came from conversations closer to the deaths. Not rolling
  the baseline forward.
- Quiet: census.alive 25 vs 28, census.integrationStage 9 vs 9,
  deaths.bearer 9 vs 6 (scripted, explained above).

## Files

- Driver: `scripts/journey-succession-r16-20261016.js` (r15 substrate +
  3 scripted deaths + per-death handoff audit + mourning probes +
  people-check convos; telemetry in the flat dotted-key schema)
- Proof: `scripts/test-mourning-multi-20261016.js` (16/16, RED-verified)
- Fix: `src/js/convoTopics.js` (acute-grief branch + mourning lines)
- Evidence: `evidence/2026-10-16/journey-succession-r16.md` (this file),
  `evidence/2026-10-16/journey-succession-r16-seeds.jsonl` (full records +
  transcripts), `evidence/2026-10-16/journey-succession-r16-run.log`

## Flags for other loops

- test-mantle-memory-20261012's 4 failures are pre-existing on pristine
  (verified via patch-swap this run) — the convo loop may want to look:
  day-5 mantle-memory expectations vs the acute branch's current shape.
- Driver note: recoverBearer fires when `day > p.day` (the 2nd endDay
  after death), not the 1st — any future handoff-capture slicing must
  allow 2 days per death.
