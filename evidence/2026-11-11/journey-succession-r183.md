# Journey succession r183 — Lane B, leg 7 (succession) — RUN NOTE (INTERIM)

**Run:** r183 (next Lane B number after r182 endgame) ·
**Leg:** 7 succession · **Branch:** journey2-succession ·
**Base:** master aedf7f699 (batch ship c136d851d-20261111-232432) at run start ·
**Rotation-b:** 7 at run start, writes 4 (endgame next) at closeout ·
**Prereg:** evidence/2026-11-11/journey-succession-r183-prereg.md.

## Adoption (r184, this run — stale-lock recovery)

- r183's coordinator died after the gate log (01:51:38Z, 335 passed /
  5 failed on the un-rebased tip) with the panel files uncommitted and
  the lock `loop2-20261111T235602Z` still held. Registry heartbeat for
  journey2-succession was 01:40:44Z at takeover (02:55Z) — 74 min stale,
  >15 min → previous run DEAD per the overlap guard; lock deleted as
  stale, this run's lock `loop2-20261112T025720Z` created. Newest
  worktree write 01:51:38Z (>1h old) — no live worker.
- Adoption plan: commit panel files → rebase onto explicit master SHA
  → family proofs + full gate on the rebased tip → adjudicate the 5
  gate failures per the r181 precedent → ff-only merge → release →
  rotation 7→4 → lock delete → memory/tracking closeout.

## Status — PANEL COMPLETE, adoption finishes gate/merge/release

The panel COMPLETED at 00:45:35Z (all 5 seeds exit 0; analyzer exit 0).
Panel verdicts below are FINAL (coordinator-verified). What remains for
the adoption: family proofs → gate → rebase onto explicit master SHA →
merge → release → rotation 7→4 → lock delete → memory/tracking
closeout. The coordinator hit its execution limit before the gate; the
fix + panel + analysis are all committed or committable on the branch
(see commit 3bc2c4ce3 + the panel-files commit below).

Lock: `playtest-loop-2.lock` run_id `loop2-20261111T235602Z` (created
23:56:02Z) — held through adoption; delete at closeout after
verification. Registry heartbeat: landed 00:46:19Z after a 14-min
wait on the registry lock (reaper + sim-bisect-merge-a register held
it; the tree was dirty throughout, so the reaper could never remove
it). The adoption MUST heartbeat immediately on takeover
(`bash scripts/worktree-heartbeat.sh journey2-succession`) and between
steps.

## Panel verdicts (COMPLETE — analyzer evidence/2026-11-11/journey-succession-r183-analyzer.txt)

Per-seed handoffs: 34221 d41 Moshe→Chester (scripted); 34222 d41
Juan→Emmett (scripted); 34223 d15 Alejandra→Krishna (ORGANIC — the
early kill landed on its own); 34224 d41 Seymour→Darius (scripted);
smoke 33998 d6 Heinrich→Sofia (scripted). Chains: 34222 churned 9
more bearers to d98 (village-over at the end: Emmett→Kelly→Elijah→
Esperanza→Tiare→Oliver→Ablade→Boris→Henry); 34224 churned 8 more
(Carol→Gladys same-day cascade d86); 34221 2 more; 34223 2 more.

- **MANTLE-FINE (binding): PASS.** 26 deaths observed — the same count
  as r181's panel — 0 flippedImmediate=false outside VILLAGE-OVER,
  0 fineLatency>=2, 0 unexplained fineLatency==1, 0 day-skips, 0
  coarse>fine sampling gaps. One held-briefly same-day cascade bearer
  (34224 d86), classified per the r170 rules. Every bearer <redacted> with
  a living successor flipped synchronously at return.
- **DRY CENSUS (binding bars): PASS, with one reported dry line.**
  0 ask:lately fellBack (r170 fix holds — third straight panel);
  0 dlg:more fellBack; 0 AGENCY/TEACH/OPENER-DRY. 28 fellBack entries
  total, 27 of them the honest foreign-language nonverbal narration
  (Boris Polish, Camila Portuguese — r81 design, same as r181's
  Chantal). ONE dry line: 34224 d94 Naran, dlg:details — "...Sorry,
  lost my train of thought." after the warn_you opener ("About that
  warning — I keep turning it over."). Mechanism: the warning itself
  was never spoken, so details had nothing to detail. NOT caused by
  this run's fix — dlg:details never calls any function this run
  changed (verified: zero references to convoSnippetIsRealBeat /
  convoSnippetIsStageDirection / convoCloseLine / convoResumeOpener
  in convo-dialogue.js). New blank for the next run: warn-details
  dries when the warning was never spoken. The conversation recovered
  fully afterwards (mourning Camila, teaching, trap line).
- **RAFAEL FIX (binding): PASS in the wild.** Zero "weren't there for
  that one" lines in any panel transcript. Inherited resumes render
  in the new form: "Chester and I never did finish talking about that
  plant lesson — that was 8 days back. Want to hear where it left
  off?" and "Emmett and I never did finish talking about grief — that
  was 12 days back. Want to hear where it left off?" — no presence
  claim anywhere. "Settled" lines fired 3×, all on 'lately' threads;
  the one verified (34222 d+15 Esperanza) was EARNED — the sitting
  shared the Emmett grief beat ("Since Emmett died... I keep
  expecting to see Emmett at the fire.") before the recap and the
  close. The gate works in the wild.
- **CAP-NC (descriptive): INSUFFICIENT-DATA (0/0 eligible)** — third
  straight panel. Non-denominator: no-newcomer-arrival ×3,
  second-handoff-before-deadline ×2. **bondedEver 2/2 again** — both
  probe-opened pairs bonded eventually (Oliver 34222, Vasyl 34224).
  That is now three straight panels at 2/2 (r177/r181/r183): the
  capacity signal keeps strengthening while the denominator stays
  starved by arrivals (6/9 seeds with no newcomer in r181; 3/5 with
  none here) and by bearer survival to the +14 deadline.
  CAP-D14: bonded-d14 on 34223 (Daniyar) and smoke 33998 (Ashanti).
- **CONTROLS (binding): PASS.** Smoke 33998 headlines 1/11/1/3/2
  EXACT (deaths 1, alive 11, fallen 1, stage 3, mentions 2 — tele
  file verified). Pick rank 1 + funeral INCALL true on all 5 seeds.
  selfReq 0 everywhere. Second-order smoke counters moved again
  (pantryEnd 21052→10760, deedCalls 25→38, bumpCalls 722→721,
  callMovesWithDonation 1→4) — expected under the revised bar
  (headlines only); the fix touches conversation.js, so
  dialogue-ledgering movement is expected, not a defect.
- **Day-skips:** 0 across the panel (sleep rolls 110/98/85/110/30).
  Combined with r166/r169/r170/r177/r181, that is now SIX straight
  panels with zero day-skips (~168 deaths / 30 seeds / ~1600 sleeps)
  and still no deterministic staging path. JUDGMENT (metric review):
  **drop the day-skip instrument correction to a watch.** Five
  panels of nothing to detect was already the question; six settles
  it — the correction is not worth building while the instrument
  keeps reporting zero. If a future panel ever records a day-skip,
  the watch re-opens the build question. The MANTLE-FINE bar keeps
  its 0-day-skips clause as the watch.

## People check (transcripts read in full — DONE)

- Dieter d+3 (34221, trust 91): a real confession (from Columbus, not
  Denver — ashamed of the truth), honest pushback on the driver's
  triple confrontation ("I told you the truth. You can keep poking it,
  but it's told."), a recap ("Still on that news."), a warm close.
  No dry line, no fabricated history.
- Oliver d+15 newcomer-probe (34222, trust 20): a stranger who reads
  as a person — deflects the sleep question, mourns Emmett ("Emmett
  owed me a favor. I keep thinking about collecting. Stupid."),
  accepts an invite ("Someone should watch your back. Might as well
  be me."), grief detail ("I sit apart to eat. It doesn't bring
  anyone back."). One slightly theatrical closer ("And... scene. Good
  talk.") — noted, not a defect.
- Esperanza d+15 (34222, trust 93): the 'lately' thread earned its
  "settled" (see above); Scout role handoff with a real beat
  ("Elijah nods, stepping back. 'Scout is yours now.'"); favor
  requirements honest ("Stand beside your partner first — same side
  of the Haven door — then help.").
- Naran d+53 (34224, trust 85): the panel's one dry line (warn-details,
  see above) inside an otherwise rich sitting — mourning Camila,
  teaching Jerusalem Artichoke, trap line, "My part? I remember them.
  Someone has to do it properly."
- No transcript on this panel fabricated shared history or looped
  filler. The conversation quality bar holds, with the single
  warn-details dry line as the filed exception.

## Village assessment (plain words)

Five villages, one story with different endings. Four held together
through their handoffs — the mantle passed hand to hand without a
stumble, 26 bearer deaths, every one handed over cleanly to someone
still living, including a same-day cascade (Carol→Gladys→Quinn on
34224) and a nine-deep chain on 34222 that ended with the village
itself giving out at d98 (Henry the last bearer, village-over). The
newcomer Oliver arrived on 34222, bonded, and TOOK the mantle at d84
— the succession the CAP-NC probe exists to measure, happening
organically. On 34223 the first bearer died on her own at d15
(Alejandra in the wild) and the village carried on to three bearers.
What the villages knew: the dead are mourned by name (Emmett, Camila),
the trap line is walked, roles are promises kept hand to hand. What
was missing: newcomers are still rare (none on 3 of 5 seeds in 70
days), and the villages that bleed fastest still cannot bank a second
living killer before the next death — the winnability chain, unchanged
by this run.

## Reachable / fun / winnable (succession leg)

REACHABLE: yes — every death on the panel handed the mantle to a
living successor synchronously, including through a 9-deep chain, a
same-day cascade, and a village-ending collapse. FUN: yes — the
successor's second life plays: mourning, teaching, roles, invites,
honest refusals, and now honest resume openers all fire in the
transcripts. WINNABLE: the leg does not block the win path —
succession itself is not the choke; the villages that survive their
handoff keep playing toward the table. (No full-seat attempts fall
inside this leg's window; the win chain is judged on the endgame leg.)

## Telemetry (DONE — coordinator)

Two LOUD lines, both the KNOWN summation artifact (r151–r181
precedent — the checker sums across files while the baseline holds
per-seed means): deaths.bearer <redacted> (baseline 7.6 → current 24, n=4)
and census.fallen 138% (baseline 14.3 → current 34, n=4). Per-seed
means: bearer <redacted>, alive 5.8, fallen 8.5, stage 3.0, mentions 4.0 —
against baseline 7.6 / 3.8 / 14.3 / 3.0 / 4.2. The alive/fallen moves
are band variance (34222 village-over with 16 fallen, 34224's
9-death cascade); stage and mentions match the baseline exactly.
No real deviation; baseline NOT rolled forward.

## Carried (for the next run, not this one)

- **Warn-details dry line** (34224 d94 Naran): warn_you details dries
  when the warning was never spoken. Investigate + fix next run.
- **Recap-prefixed memory quotes** (new watch): a recap line with a
  discourse prefix ("Can I be honest? Still on that plant lesson.",
  "If I may — Still on the big questions.") passes the real-beat test
  (the /^Still on/ anchor misses it) and quotes as the thread's
  memory. Honest (the NPC did say it) but not substantive. Candidate
  for a future quote-hygiene pass; NOT changed mid-panel (would break
  panel comparability).
- **CAP-NC decisive denominator**: still starved (0/0 eligible, third
  straight panel). A decisive verdict needs a longer panel or a band
  with earlier arrivals — still a future run's question.
- **Q6 gorge-after** (crisis r181 carry): zero through r190 re-judge
  — untouched by this run.

## Gate (adoption r184 — on the rebased tip 1e5df4127)

Family proofs on the rebased tip (ALL GREEN): r183 proof 21/21,
inherited-thread-resume 6/6, resume-opener-quotes 3/3,
succession-opener-coherence 9 checks × two arms, fusion-mantle 9/9,
snippet-stage-direction PASS, resume-quote-hygiene 10/10,
crisis-r176-resume-quote 15/15, resume-memory-sense ALL GREEN,
resume-hook-quote 13 assertions.

Standing failures, adjudicated (r181 precedent — identical failures on
the rebased tip, re-run standalone above):
- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  (measurement-proof staleness pair): retained neutrality proof covers
  pre-change Game/controller/harness inputs; any Game change (here
  conversation.js) invalidates it until `balance-proof-update.js`
  re-runs the maintenance proof. Standing, not blocking; refresh is a
  separate maintenance step, not a journey-run fix.
- `test-phone-frame-proof.js` (stale receipt): the branch touches NONE
  of the 6 listed inputs (index.html, foreignSpeech.json, regions.json,
  statusEffects.json, table-endings.json, alienPlayers.js) — the
  receipt predates master's changes to those files. Pre-existing
  staleness on master, not caused by this branch. Standing, not
  blocking.

Load artifacts (re-run standalone green — see below): the two deed
tests time out at check.js's 120s cap but pass standalone:
- `test-living-garden-deed-attainment.js`: standalone 8 passed,
  0 failed (log /tmp/garden-standalone.log; ran ~5 min).
- `test-one-person-army-deed-attainment.js`: standalone 7 passed,
  0 failed (log /tmp/army-standalone.log; ran ~3 min).
Both are slow suites, not defects. (Provenance note: the two
standalone runs were executed at 03:00–03:08Z by an unidentified
concurrent exec session in this worktree, not by this run's
coordinator; the outputs were verified by reading the logs — both
end with a complete JSON panel and an explicit "N passed, 0 failed"
summary. The 120s check.js timeouts reproduce the same shape as the
r183 gate log, so the verdict does not depend on who launched them.)

Full `node scripts/check.js --quick` on the rebased tip: **334 passed,
6 failed in 796s** (log
evidence/2026-11-11/journey-succession-r184-gate.log; r183's gate on
the old tip was 335/5 in 697s). All six failures adjudicated:
- 3 standing (above): measurement-proof pair + phone-frame receipt.
- 3 load artifacts, all green standalone: living-garden 8/8,
  one-person-army 7/7, `test-capable-bot-20261014.js` 42/42 (exit 0,
  76s standalone; it ran 91s on r183's gate and crossed the 120s cap
  this time under the loaded box — killed mid-run with all assertions
  so far ok, no failing assertion). GATE: GO.

## Metric review (DONE — coordinator, adoption to confirm)

- MANTLE-FINE under the revised r170 rules is CONFIRMED on a THIRD
  fresh panel (26/26 synchronous handoffs, 0 real deferrals,
  0 day-skips). The revised bar stands.
- DRY CENSUS: binding bars PASS; the descriptive "0 dry lines
  anywhere" watch records 1 instance (warn-details, filed above).
  The ask:lately fix holds a third straight panel (0 fellBack).
- CAP-NC: denominator 0/0 a third straight panel; bondedEver 2/2 a
  third straight panel — capacity confirmed, denominator starved.
- SMOKE BAR REVISION (r177-proposed, r181-adopted): HOLDS — headlines
  1/11/1/3/2 exact while second-order counters move again.
- DAY-SKIP JUDGMENT: drop the instrument correction to a watch (six
  straight panels at zero, no staging path). See above.
- Same-class dry sites (convoThreadBeat `exh` closers, base `more`
  choice): dry-free for the fifth straight panel.

## Rotation

7 -> 4 (endgame next). Advance at closeout; verify the file reads 4.

## The fix — Rafael resume-opener defect (crisis r181 carry, DONE)

Crisis r181 filed one dialogue defect (seed 14411 d57, Rafael Mendez):
the resume opener garbled a thread three ways — it attributed Rafael's
own confession ("Before the scattering, I froze when it mattered") to
Theo ("what *they* confided"), falsely claimed "You weren't there for
that one" when the player was there in d43 (as Theo), then declared the
thread "settled" after two recap loops in which nothing new was said.
Root causes found in code review (`src/js/conversation.js`):

1. **Attribution:** the base labels speak of the NPC in third person
   ("what they confided", "their past") — honest while the speaker is
   the only named person, but the inherited opener names the predecessor
   first ("{pred} and I..."), so "they"/"their" re-binds to the
   predecessor. Fix: in the inherited branch, NPC-self threads take
   first-person labels — `secret` → "what I confided in {pred}",
   `past` → "my past", `personal` → "my story". All three pred
   branches (ago>7, ago>1, same-day) use the re-anchored label.
2. **Presence claim:** the stale branch (ago>7) claimed "You weren't
   there for that one — {pred} was." Every open thread was planted in
   a conversation with the player (endConvo / subject-change only), so
   an inherited thread is always one the player sat in — as the
   predecessor. The claim is false in every case it can fire. Fix: the
   stale branch drops the claim entirely ("{pred} and I never did
   finish talking about {label} — that was {ago} back. Want to hear
   where it left off?"), matching the recent branches, which never
   claimed absence.
3. **"Settled" gating:** `convoCloseLine` fired whenever a hanging
   thread was noted as discussed this sitting — and every turn's line
   is noted as a beat on the current thread, including recap lines
   ("Still on X."). Fix: the closer now requires a REAL beat on the
   thread in this sitting's thread log (per-sitting; reset at
   startConvo). The resume opener itself never counts (its scaffolding
   fails `convoSnippetIsRealBeat`), nor do reframes or recap lines.
   Without a real beat, the closer is withheld and lastClosed cleared
   — the thread closes quietly, never declared settled on nothing.
   Supporting change: `convoSnippetIsStageDirection` now also rejects
   the remaining recap forms as grammar — "We started on X, then got
   onto Y.", "We were talking about X.", "X — that's still where we
   are.", "We're going in circles — still on X.", "As/Like I said —
   we're still on / we started on / we were talking about X." — so
   recap lines can neither quote as memories nor earn a "settled".

## Proof (DONE, all green on the branch)

- NEW `scripts/test-journey-succession-r183-rafael-resume-20261111.js`:
  **21/21 PASS.** Real succession via `playerDeath`; stale inherited
  secret resume reads "Luis and I never did finish talking about what
  I confided in Luis — that was 8 days back. Want to hear where it
  left off? 'Before the scattering, I froze when it mattered.'"
  Recap-only sitting earns no "settled"; sitting with a real new beat
  still earns it; resume opener alone earns none; all 7 recap forms
  fail the real-beat test; a real confession still passes it.
- `scripts/test-inherited-thread-resume-20261015.js` (REPAIRED +
  UPDATED): 6/6 PASS. The test was unrunnable — hardcoded paths to
  the deleted `journey-landing2` worktree — now uses relative paths.
  Its "owns the gap" check asserted the OLD "You weren't there" line;
  updated to the r183 behavior (design changed on purpose per the
  crisis r181 filing; the new line still names the dead, owns the gap
  by naming + inviting, never claims absence).
- `scripts/test-resume-opener-quotes-20261015.js` (UPDATED): 3/3 PASS.
  The r183 stage-direction extension made its planted recap snippet
  unquotable (regression caught by the before/after baseline run);
  the test pins the QUOTING (single quotes, no nested doubles), not
  recap quotability, so its snippet is now a substantive beat with a
  header note explaining the change.
- Green-listed, unaffected: `test-succession-opener-coherence.js`
  (9 checks, two arms) and `test-fusion-mantle-20261015.js` (9 passed).
- `test-snippet-stage-direction.js`, `test-resume-quote-hygiene-20261019.js`
  (10 pass), `test-journey-crisis-r176-resume-quote.js` (15 passed),
  `test-resume-memory-sense-20261016.js` (ALL GREEN),
  `test-resume-hook-quote-20261018.js` (13 assertions) — all green
  with the fix.
- Pre-existing failures, IDENTICAL before/after the fix (verified by
  stashing `src/js/conversation.js` and re-running): 
  `test-convo-resume-quote-20261014.js` (6 pass, 4 fail),
  `test-resume-nesting-r18-20261016.js` (1 pass, 2 fail),
  `test-resume-repair-r17-20261015.js` (9 pass, 1 fail). None is in
  the green list; all three fail on unmodified master the same way.
  Filed as known-stale in sim-findings.md (this run). NOT gate items.
- `test-conversation-coherence-20261007.js` is also stale on master
  (fails at `Game.init()` — `Game.state` null; not in the green list).
  Its close-line assertion (fabricated ledger, no thread log) is
  superseded by the r183 proof test's driven arms. Filed likewise.

## Adoption — superseded sections (removed at adoption)

The pre-panel placeholder blocks ("Panel (RUNNING)", "People check (TODO)",
"Village assessment (TODO)", "Telemetry (TODO)", "Gate (TODO)",
"Metric review (TODO)") lived here. All six are COMPLETE in the sections
above — Panel verdicts, People check DONE, Village assessment, Telemetry
DONE, Metric review DONE — and the Gate section above carries the
adoption's gate result. Removed so the record does not contradict itself.

## Rotation

7 -> 4 (endgame next). Advance at closeout; verify the file reads 4.
