# journey-scale r132 — PRE-REGISTER (lane A, leg 3 SCALE, raise-answer template fix)

**Run id:** `playtest-loop-a-20261112T0043Z` (lock run_id `playtest-loop-a-20261112T0043Z`).
**Run:** scheduled Wed 2026-11-11 18:45 CST (00:45 UTC); this run 00:43Z–.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `f888f7ce3` (bisect-mournblooded-a evidence+corpus).
**LOUD — origin/master diverged:** known standing condition (ship loop owns).
This run works on LOCAL master only: no push, no rebase onto origin, no
divergence repair. Flagged here, not fixed here.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. The fix below changes no demand, no number, no bar:
it withholds a menu choice until the question it answers has been spoken.
**Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-10-10 17:52 CST):** no toughness/gear/ability
tuning until the fight-play census lands. This run touches dialogue-menu
code only, so the gate does not bind it (same as r129/r130/r183).
**DELIVER OVER MEASURE (2026-11-01):** this run BUILDS the fix for the
r131-carried raise-answer defect. It does not re-prove the veteran census
or the survival collapse (the Loop A/B bisect owns that).

## Standing context (read before scoring)

- **r131 scale (landed 5d16916f4, adopted 2026-11-11):** phantom-veteran
  fix; scale reachable 4/4 (regional links, ladder stage 3, lesser seat
  priced 4/4), fun yes; winnable unchanged — 0/4 full seat, national
  never live; the living-veteran pair is still the wall. Band lived-days
  409 (2 alive / 2 dead); lesser seat priced 4/4.
- **r131 Q4 carried defects (both fired in the r131 band, documented not
  fixed — "the fix belongs to a run that can scope the raise-answer
  template"):** (1) raise-answer template answers a forage invite with a
  link proposal (Claudete, seed 131102 d120, outcome counter); (2)
  trap-line invitation swallowed (Tarek, 131102 — mimes "come with me",
  no option to answer). This run builds (1); (2) is Q2-secondary below.
- **Survival collapse (bisect, HEAD):** survivalcontrol-b verdict
  MASTER_CHANGE — 1/8 survived on current master vs 6/8 on vetphantom;
  bisect-mournblooded-a IMPLICATED suspect 13e6f40ae (mournblooded hold
  beat), 1/8 survived, 8/8 trajectories byte-identical to
  survivalcontrol. The collapse is the bisect's standing question, NOT
  this run's. This run's panel runs on the collapsed base: Q3's guardrail
  is judged with the pre-registered attribution rule below, not as a
  blind pass/fail on lived-days alone.
- **Since r131's base (b09cf584e), src/js changes landed:** r180
  (favor-requirements exits), r181 (regional ruin medicines), r183
  (place-lesson frame rotation), 13e6f40ae (mournblooded hold beat),
  r131 itself. Trajectories are NOT expected byte-identical to r131.

## The defect (read in code + transcript this run, not just inferred)

**Transcript (r131 band, seed 131102 d120, Claudete, raise-talk file
`journey-scale-r131-raisetalk-131102-2.txt`, outcome counter):**
THEM: "Never mind the food I needed — we got it handled. Thanks anyway.
The pantry's nearly bare. Forage with me tomorrow? I know the creek
bend, past the treeline."
YOU: "All right. Let's ask them."
THEM: "All right — let's ask them." You carry the proposal to The
Bloodied II.
The NPC asked to forage tomorrow; the player answered "let's ask them"
and carried a link proposal to a village never mentioned in the sitting.
The link-raise line was NEVER spoken in that sitting.

**Mechanism (read in code this run):** `bond-initiation.js bondChoices`
prepends `link:accept`/`link:decline` to EVERY menu in the sitting
whenever a link raise is pending — unconditional on what the NPC just
said. `conversation.js startConvo` speaks the pending raise as its own
beat ("the player is never asked to accept or decline something they
were never asked", INVITATION HONESTY r7) — BUT when the opener owns
the reply (`openerOwnsReply`: the opener asked a question, e.g. the
forage want line, thread 'want' stage < 3), the raise is HELD in
`c.linkPending` for the continuer instead of spoken. The menu still
offers `link:accept` on turn 1, and the linkraise policy ("picks
link:accept when it is offered", `competent-linkdrive-b.js
answerRaiseInConversation`) takes it immediately — answering the
forage ask with the link line. Canon (`docs/CONVERSATIONS.md`):
"Replies belong to the spoken exchange. A question, invitation, price
or live request owns its decision menu." The fix makes the menu obey
that law for bond/link asks.

**The good flows (must keep working — r131 band, 5/6 raise talks):**
the NPC speaks the link line as the opener/beat (`spokenBeat.tag ===
'linkraise'`), the menu offers link:accept, the player accepts. Also
the opener-carried case (talk-request opener carries the ask verbatim;
`recordStagedBeat` records tag 'linkraise') and the held-then-spoken
case (goon speaks the held beat with `{tag: 'linkraise'}`).

## The fix (one task, one commit)

Per-sitting "ask spoken" flags on the convo record, gated in
`bondChoices`:

1. `src/js/convo-beats.js` `convoRecordSpokenBeat`: when the recorded
   tag is `'linkraise'`, set `c.linkRaiseSpoken = true`; when
   `'bondproposal'`, set `c.bondProposalSpoken = true`. This is the
   single choke point every speaking path funnels through (`sayLine`
   records via it; `recordStagedBeat` calls it directly; the goon
   speaks held beats through `sayLine` with the tag). A queued-but-
   unspoken beat sets no flag — queuing is not hearing.
2. `src/js/conversation.js` `startConvo`: reset both flags alongside
   `c.spokenBeat = null` (per-sitting, like the other sitting ledgers).
3. `src/js/bond-initiation.js` `bondChoices`: offer `link:accept` /
   `link:decline` only when the pending raise exists AND
   `c.linkRaiseSpoken`; offer `bond:accept` / `bond:decline` only when
   the pending proposal exists AND `c.bondProposalSpoken`. Fail-open
   when there is no convo record at all (unknown caller, old
   behaviour); fail-closed when a record exists and the ask was not
   spoken this sitting. No demand, number, bar, or line changes; the
   raise stays pending (3-day expiry, re-spoken next sitting) when the
   player answers something else first.

## Proof (before/after, same test)

`scripts/test-journey-scale-r132-raise-answer-20261111.js` — harness
game (seed 132100), a villager with a pending link raise. Sections:
1. Raise pending, never spoken (opener is a forage want line):
   `convoChoices` contains NO `link:accept` — RED on unfixed code
   (the choice is offered), GREEN on fixed code.
2. After the raise is spoken (sayLine with tag 'linkraise'):
   `convoChoices` DOES contain `link:accept` — GREEN both engines
   (the good flow is preserved).
3. Opener-carried case (recordStagedBeat path): the choice is offered
   — GREEN both engines.
4. Held-then-spoken (goon speaks the held beat): the choice is offered
   after the goon turn, not before — RED on unfixed (offered before),
   GREEN on fixed.
5. Bond proposal mirror: `bond:accept` withheld until the proposal is
   spoken — RED on unfixed, GREEN on fixed.
6. No-pending control: no bond:/link: choices on either engine.

## The panel (fresh, on the fixed engine)

- **Driver:** `scripts/journey-scale-r132-20261111.js` (r131 driver
  cloned, labels/EVIDIR/seed list only, vetbar recorder kept as a
  regression guard). Same instruments and the same policy
  (scalecourt-traderoad-r113-linkraise-sit). Seeds one-per-process
  (r183 adoption: driver multi-seed state leak — a second seed in one
  process diverges from a fresh single-seed run).
- **Seeds: FRESH 132101–132104.** Freshness: 0 filename hits in
  `evidence/2026-11-11/`; 0 mentions in dated preregs other than this
  one; 0 mentions in `scripts/*.js`. Full-tree sweep over `evidence/` +
  `scripts/` completed 01:35Z: 10 files contain the strings, ALL false
  positives on inspection — a kcal total (`"pantryFreshAfter":132104`)
  and float substrings (`7.03613210336239`, `1777.4132101051512`, ...).
  No `.md`/`.js` file names any of 132101–132104 as a seed. These seeds
  were never played as a journey band. Fixture seed 132100: 0 mentions
  in dated preregs and no full-tree hit as a seed.
- **Horizon:** DAYCAP=140 (the leg window d80–140), death-aware stop
  (+10d tail max on a dead village — MEASUREMENT.md §10).
- **Pilot:** seed 132101 first. Pilot gates (r130's, plus vetbar):
  crash, census errors > 0, 0 census rows, reconciliation residual
  != 0, teleOnly > 0, 0 trustset rows by d60, 0 national-gate rows,
  or no vetbar rows by d60 → STOP and diagnose (INCOMPLETE, not a
  verdict).
- **Analyzer:** `scripts/analyze-journey-scale-r132-20261111.js`
  (r131 analyzer cloned: Q2 vetbar, Q3 guardrail, Q5 census) PLUS a
  raise-talk defect classifier: a raise talk is a DEFECT talk iff the
  transcript's YOU line is the link:accept label ("All right. Let's
  ask them.") while the link-raise line (matching /We should link with
  .* — we'd be stronger together\./) was never spoken before it in
  that sitting's transcript.

## Questions (binding)

- **Q1 RAISE-ANSWER FIX (primary):** the proof test is RED on unfixed
  code and GREEN on fixed code, all six sections green; the good-flow
  sections (2, 3) stay green on the unfixed engine too (no behaviour
  change where the ask was spoken). **GO: all hold.** A section
  failing after the fix is NO-GO as written — report it, do not
  re-score.
- **Q2 PANEL RAISE-TALKS:** on the fixed engine, ZERO defect talks
  across the band (r131 baseline: 1 defect talk in 6). Raises still
  get answered through the proper flow: at least 1 raise talk in the
  band ends accepted-or-countered with the raise line spoken first.
  **GO: zero defect talks AND ≥1 properly-answered talk.** Zero
  raise talks at all in the band is INCOMPLETE (no wild evidence),
  not GO — the proof test is the evidence then, and the run note says
  so. Vetbar (kept guard): zero readiness/ladder disagreements on
  the fixed engine (r131 Q2 bar, unchanged).
- **Q2-secondary TRAP-LINE (investigate, fix only if same-template +
  small):** Tarek (no shared language) mimes the trap-line invitation;
  the player gets no option to answer. Pin the code location and the
  shape (nonverbal invitation with no answer). If the fix is the same
  "spoken ask owns the menu" class and provable in the same proof
  test, build it; otherwise carry with the pinned location and do NOT
  block Q1 on it.
- **Q3 TRAJECTORY SHAPE (guardrail):** the panel's lived-days total
  stays within ±25% of the r131 band's 409, and lesser seat priced
  ≥3/4 (r131: 4/4). **Attribution rule (pre-registered, not a
  re-score):** a lived-days breach is first attributed from the
  deathcensus — if deaths match the known collapse shape (the
  bisect's mournblooded window, no death attributable to a missed or
  delayed link) the breach is recorded as COLLAPSE, not a fix
  regression, and Q3 reads GUARDRAIL-BREACHED-BY-COLLAPSE with the
  census as evidence. A breach WITH a link-attributable cause is a
  NO-GO on the fix. The fix can only delay a link answer (never
  accelerate one, never change a demand), so its trajectory effect is
  bounded by link timing.
- **Q4 PEOPLE CHECK:** read the fresh panel's d90/d120 transcripts in
  full (r125/r126/r127/r130/r131 Q4 protocol, raise-talks included);
  senseless count 0 for clean. Note whether the two carried defects
  (trap-line swallowed, Baraka unvoiced raise) fire — carried, not
  this run's to build unless Q2-secondary lands.
- **Q5 CENSUS:** plain-words village assessment per seed; ladder
  stage, lesser/full seat, national; books close on all four seeds.

## Telemetry + checks

- `telemetry-check.js` vs `scale.json` baseline, metrics fightsTotal,
  fightsByWave.4, maxGameDay (same as r125/r126/r127/r130/r131). LOUD
  lines are same-run investigation items (expect the regime-mismatch
  LOUD; EXPLAINED, baseline NOT rolled forward — the re-label is still
  owed).
- `node scripts/check.js --quick` (the fix touches src/js — mandatory).
  If the run times out at the gate, the adoption finishes it from the
  durable worktree (r131/r183 pattern); the worktree stays dirty-
  protected and the run note records exactly what is done.

## Metric review

(To fill at closeout — metrics held, or the revision proposed for the
next run. A miss is a miss; never re-score.)

## Carried (not this run's to build)

Monster-veteran +3 damage gap (Steve call / sized prereg);
`tbVillagerFalls` vp.dead lie (wider fix, needs a panel across all
vp.dead readers); Baraka unvoiced raise; guest-death (Bing) prereg;
survival-collapse cause (bisect owns it); scholar-payment open item
(steve-call); scale.json baseline regime re-label; origin/master
divergence (ship loop owns); measurement-proof refresh (b5 — the
r131 `src/js` touch re-staled it; the next refresh round re-points);
trap-line invitation swallowed (unless Q2-secondary lands it).
