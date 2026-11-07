# Journey succession r147 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before play. Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout. Run number r147 follows r146 (succession,
Lane B global sequence). Base master 06b93e063 (local master contains
origin/master 82e550626; `git fetch` clean; the pre-flight reaper
blocked >8 min on the registry flock held by a sibling reaper stuck in
a slow `git status`, so the coordinator killed its own queued reaper
and proceeded — the register script enforces the cap/disk itself;
reaper re-run at closeout).

## Carried question (r146 qualifier — the blank filed, not fixed)

r146 fixed the ASK_FAVOR WANT-FIZZLE on the two reproducing seeds but
the class was NOT eliminated: three panel-seed dry lines on FIXED code,
all SAYTRACE-attributed (preRun=true, RUN-BLOCKED), all through
engageBeat, plus one adjacent case through dlg:help:

- 33803 d+14 Omar (dlg:details): key = heal_help whyLine variant 0.
- 33806 d+7 Ivy (dlg:details): key = heal_help whyLine variant 1.
- 33806 d+45 David (dlg:details): key = water_haul whyLine.
- 33806 d+53 David (dlg:help): same water_haul whyLine; no fallback.

r146's prescription: extend the guard to the engageBeat path (the
whyLine should be selected ledger-aware at the source, not per
handler), add why variants to water_haul, and give dlg:help a
fallback. Filed as finding line 1827 in
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md.

## Question

When the bearer asks about a need through ANY path that reaches the
favor's whyLine — dlg:details at any stage, dlg:help, or any other
engageBeat caller — does the NPC give a real answer (the concrete ask,
its why, or the live need named fresh) instead of the dry line or a
deflection that names no need? Two rival outcomes:
(a) REAL ANSWER everywhere: the source-level guard speaks the need on
    every reproducing dry turn — the class is closed at the source.
(b) STILL DRIES somewhere: a reproducing dry turn still dries or
    deflects despite the guard — the defect is deeper than the
    whyLine selection; filed to the builder with the mechanism, no
    src/js change claimed as a fix.

## Mechanism hypothesis (from code read BEFORE any scored seed)

- dlg:details is reachable at stage 1, not only stage ≥ 2. The r146
  guard in convo-dialogue.js covers only `w.id === 'ask_favor' &&
  w.favor && stage >= 2`; a details pick after a single dlg:more
  (stage 1) falls to the else-if `w.def.engageBeat(vid)` call, which
  returns `favor.whyLine` unguarded. CONFIRMED in the r146 Omar
  transcript (evidence/2026-11-06/...-transcript-33803-dplus14-Omar.txt):
  dlg:more -> "About this wound — the need hasn't gone anywhere. I'm
  still asking." then dlg:details -> "...Sorry, lost my train of
  thought."
- ask_favor.engageBeat (convo-wants.js) returns `favor.whyLine`
  directly when the favor has no whyLines array. heal_help /
  snare_mend / watch_shift / stay_close store ONE hash-selected
  whyLine variant (r146); the same villager re-asking re-picks the
  SAME variant, so it dries on the second ask. The whyLines-pool
  branch above it IS ledger-aware (convoPickCycle) — only the
  single-whyLine return is unguarded.
- dlg:help (convo-dialogue.js) calls engageBeat unguarded; on a
  blocked line sayLine fails and the `!said` path answers with the
  self-repeat deflection ("I just said — did you miss it?"), which
  names no need. (Correction to r146's wording: dlg:help HAS a
  fallback — it just deflects instead of naming the need.)
- water_haul: CORRECTION to r146 — it DOES carry 3 hash variants
  (whyBits[(hh >>> 1) % 3] + one fixed tail, convo-wants.js). The
  repeat ask by the same villager re-picks the same variant, so it
  dries the same way. No new variants are needed; the engageBeat
  guard covers it. The r146 prescription's "add why variants to
  water_haul" is therefore NOT taken up — recorded here so the next
  run does not re-add them.
- The fix, if the hypothesis confirms, is ONE guard at the source:
  in ask_favor.engageBeat, when returning favor.whyLine, if
  convoWouldBlock(vid, wl) then return convoFavorNeedLine(vid, favor,
  true) when that itself is not blocked; otherwise return wl and let
  the caller's existing fallback handle it (same shape as r146's
  dlg:details branch). This closes dlg:details (any stage), dlg:help,
  dlg:comfort-completing, and the conversation.js engageBeat callers
  at once. Ledgers untouched; no trust/consequence flow changes; no
  new favor state transitions. dlg:help gets NO separate fallback —
  the source guard is the fallback; a both-blocked case still
  deflects honestly, as before.

## Instrument (r146 driver verbatim + declared trace; zero src/js)

Driver: scripts/journey-succession-r147-20261106.js = r146 driver
verbatim except filenames r146 -> r147 (mode string kept
'succession-r123', EVID_DIR evidence/2026-11-07, POST_DAYS=70,
EARLY_KILL_DAY=40). Analyzer:
scripts/analyze-journey-succession-r147-20261106.js = r146 analyzer
verbatim except filenames (CAP-NC scoring unchanged). The r142 d+3
stranger probe and the r143 newcomer probe are kept unchanged
(descriptive this run).

## Before-leg (unfixed code, same seeds, same driver)

- Seed 33803 through the r147 driver: Omar's d+14 transcript must
  reproduce the dlg:details dry (or the run records that it does not,
  with the SAYTRACE attribution).
- Seed 33806 through the r147 driver: Ivy d+7, David d+45
  (dlg:details) and David d+53 (dlg:help) must reproduce their dries.
- The before-leg runs BEFORE any src/js change. The fix is written
  only after the SAYTRACE attribution confirms or refutes the
  hypothesis above. A dry turn that does not reproduce drops out of
  the denominator, recorded, NOT re-scored.

## After-leg (fixed code, same seeds, same driver)

Re-run 33803 + 33806 (whichever reproduced) through the same driver
on fixed code; every reproducing dry turn must carry a real
need-naming line (no dry line, no self-repeat deflection, at that
turn).

## CAP-NC regression panel (fixed code, fresh band)

After the fix, the r143 CAP-NC panel re-runs on fresh band 33901–
33908 with the r143 stop rule (run in order, stop at 3 eligible or
after 33908). Smoke seed 33999 proves the instrument first
(EARLY_KILL_DAY=5, POST_DAYS=25). The panel judges whether the
dialogue fix regressed the succession capacity r143 established.
Panel order: fix proof first (repro seeds), CAP-NC panel second.

## Seed-band freshness (skill: local_seed_band_freshness)

- Repro seeds 33803 + 33806: DELIBERATE REUSE of the r146 panel band
  for a same-seed before/after comparison (same pattern as r146's
  deliberate reuse of the r143/r142 bands). Not a fresh-band claim;
  recorded here so no later worker mistakes the reuse for a fresh
  reservation.
- CAP-NC panel band 33901–33908 + smoke 33999: searched ALL dated
  preregs (evidence/*/sim-*-prereg.md and
  evidence/*/journey-*-prereg.md, exact patterns 33901–33908 and
  33999) — ZERO matches. Forbidden bands named in Nov preregs
  (73641–73648, 73671–73678, 78201–78208, 99351–99358, 99401–99412)
  do not intersect. Band FRESH.

## Bars (binding, §14)

- ENGAGEBEAT-GUARD (binding): on fixed code, every reproducing dry
  turn (from the before-leg denominator) carries a real need-naming
  line at that turn — no dry line, no self-repeat deflection. ALL
  reproducing turns must pass; a turn whose dry does not reproduce
  drops out of the denominator, recorded.
- CAP-NC REGRESSION (binding, carried from r143): PASS = ≥3 eligible
  seeds AND ≥3 bonded by the deadline AND bonded/eligible ≥ 2/3.
  INSUFFICIENT-DATA / CAPACITY DEFECT per r143's definitions. A miss
  is a regression note + fix-or-revert decision, never a re-score.
- PROOF TEST (binding for the fix claim):
  scripts/test-journey-succession-r147-askfavor-engage.js — unit-level,
  shared harness, extends the r146 proof (which stays green
  untouched): (1) engageBeat-direct: wounded villager, whyLine
  pre-poisoned in the run ledger; engageBeat must return the
  need-naming line, never the blocked whyLine. (2) help: same setup,
  dlg:help must speak the need, never the self-repeat deflection.
  (3) details-stage-1: same setup, dlg:more then dlg:details must
  speak the need. (4) control: no poisoning — engageBeat returns the
  whyLine itself (the fix must not change the unblocked path).
  (5) ledger: the same whyLine spoken twice in one sitting still
  dry-replaces the second (control: the no-repeat law itself is
  intact). The new cases run RED on unfixed code (verified in the
  before-leg), GREEN on fixed code.

## AMENDMENT 2 — MECHANISM CORRECTION (before the after-leg, 2026-11-07 ~06:15Z)

The before-leg + the details1 red run sharpen the hypothesis: there
are TWO unguarded routes from dlg:details to engageBeat, not one.

(a) THE ELSE-IF (stage < 2, or thread beat null): fresh opener
    (thread 'small'), details first, stage 1 → the r146 guard's
    stage>=2 condition fails → else-if calls engageBeat → blocked
    whyLine. This is the Katarina d+30 shape (water_haul, SAYTRACE
    convo-dialogue.js:724 → 866 → 911).
(b) THE THREAD BEAT (thread 'want', ANY stage): after a talk-request
    open + dlg:more, the thread flips to 'want' and the stage reaches
    2; convoThreadBeat calls engageBeat directly, and the r146 guard
    sits inside `if (!raw)` in the handler — it is BYPASSED whenever
    the thread beat is non-null, even at stage 2. Proven by the
    details1 proof case on unfixed code: stage=2, thread='want',
    reply "...Sorry, lost my train of thought." (3 failures).
    This is the Omar d+14 shape (talk-request → more → details).

Both routes converge on the same single unguarded return in
ask_favor.engageBeat (`if (favor) return favor.whyLine;`) — which is
why the fix guards THERE, not in a third handler branch. The fix
itself is unchanged by this correction. The r146 panel dries' 724
sites are route (a); route (b) has no separate SAYTRACE site in the
panel because the thread-beat call site is conversation.js:3537
(convoThreadBeat), reached before the handler's own 724 line.

## AMENDMENT (before the fix, 2026-11-07 ~06:00Z — proof-test shape)

The `help` case (2) as preregged is UNCONSTRUCTIBLE on the current
base, found by diagnosis (scripts/diag-r147-helpmenu.js,
scripts/diag-r147-resume.js, both kept):

- After a stated ask the menu offers commit/details/cant, never
  dlg:help; after a seed followup the same. dlg:help for ask_favor
  comes only from the beat pool when the want is unengaged (stage
  0/1) and the thread is not 'want' — i.e. the resume-opener shape
  (David d+53: resume opener preempts the want opener, thread is the
  resumed topic, beat pool offers dlg:help, engageBeat finds the
  STORED favor's whyLine).
- The resume shape needs a stored favor + no live seed + an open
  thread + the 65% RNG gate. Every construction fails in the unit
  harness: leaving mid-thread plants no thread; a stated ask plants
  a seed and the competent bot refreshes it across day advances; a
  deflect plants the thread but suppresses ask_favor 3 days, and the
  competent bot consumes the thread and plants a seek_taken seed
  during the advance; an idle-policy advance HANGS (no output in 5+
  min — the day loop appears to wait on a player decision; recorded,
  not investigated further this run).
- REVISED PROOF (binding, replaces case 2): the `engage` case IS the
  dlg:help guard's proof at the source — dlg:help calls exactly this
  engageBeat and speaks its return value. The dlg:help turn itself
  is judged at the SIM level: the after-leg dry census covers every
  transcript on the panel, and any dlg:help dry on fixed code fails
  the ENGAGEBEAT-GUARD bar. The proof test keeps engage /
  details1 / control / ledger; the `help` case is dropped, with the
  reason recorded here — NOT silently. The r146 proof test stays
  green untouched.
- SELF-REQUEST REGRESSION CHECK (reported, not scored): r133 ledger
  purge holds — selfReqDayEntries == 0 on every panel seed.
- CARRIED (reported, not scored): pick-time rank == 1 on every first
  handoff with npcCalls; funeral INCALL beat present on every leg
  death. A miss is a regression note, not a re-score of r123/r127.
- PEOPLE CHECK (sense, not a count): read the fixed d+14 transcripts
  in full plus one d+14 successor transcript per CAP-NC panel seed.
  Bar: conversations have meaning per the sense-testing law; the fix
  must not introduce a new filler or a line that promises a need that
  isn't there.

## Expansion trigger

Instrument failure only: talkRequests unreadable, bondDaily empty on
a seed with a recorded handoff, bondDaily entries missing bearerId,
newcomer detection never recording _newcomerSeen, or SAYTRACE
recording no fellBack on a seed whose transcript shows a dry line
(fix instrument, re-run that seed once). A CAP-NC miss, a
no-newcomer-arrival seed, a village ending before the deadline, or a
skipped seed never triggers expansion alone — the stop rule bounds
the panel at 8 seeds.

## Metric review (to be filled after the panel)

- r146's metric review: "the next run that touches dialogue should
  judge the fix on ALL ask/details turns across the panel, not only
  the preregged repro seeds." This run does that for the engageBeat
  class: the after-leg re-runs the FULL r146 panel seeds (33803,
  33806) and the analyzer's dry-line census covers every transcript,
  not only the four named turns.
- CAP-NC kept verbatim from r143 (eligible-subset design).
- Canon note: no canon doc covers mantle/bond formation specifically
  (r127's standing note, unchanged). Governing rules used: ledger.js
  "successor: the village chooses. Trust decides"; party-bond.js
  "v.bonds built by meals/visits/feasts, +6/pair/day cap, no bonds
  with the dead or gone"; CONVERSATIONS.md structural contract ("The
  repeat ledger must not replace a successful promise with 'lost my
  train of thought.'"); CANON.md "No silent actions". Nothing
  invented, nothing changed.
- Telemetry: r146 left the succession baseline's integrationStage at
  15 (definitionally impossible; Game.integrationStage() returns
  0–3) and recommended re-seeding from per-seed means — and warned
  that --update-baseline writes SUMS, which would bake the artifact
  in. This run runs the telemetry check per step 14, investigates any
  LOUD line, and re-seeds the baseline by hand from this panel's
  per-seed means if the LOUD lines are the summation artifact; the
  checker itself is NOT changed in this run.
