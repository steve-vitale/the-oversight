# Journey succession r291 — Lane B, leg 7 (succession) — EVIDENCE

Run lineage: 1855Z run (panel launched, timed out mid-seed-34605) →
2200Z adoption (panel resumed + completed 22:38Z, analyzer written, commit
attempt died) → 2300Z adoption (this run: stale-lock recovery of the
2200Z lock, fix built, post-fix panel launched, evidence committed).

- Prereg: `hidden_files/evidence/2026-11-27/journey-succession-r291-prereg.md`
  (frozen before any judged sim; seeds FRESH band 34590–34613, EARLY_KILL_DAY=40,
  POST_DAYS=70, + positive control 34403 + smoke 33998; instrument-only pilot).
- Rotation-b reads 7 (succession); advances 7 → 4 only on a landed run.
- Worktree `~/workspace/worktrees/journey2-7`, branch `journey2-7`.
- Commits this run: `07906b8ca` (fix + proof + postfix runner),
  `ff06c3199` (panel tooling). Evidence corpus commit pending (see closeout).
- Baseline corpus: `evidence/2026-11-27/journey-succession-r291-*`
  (26 stdout.json + stderr logs, ~430 transcript files, 26 tele jsons,
  analyzer txt). Post-fix corpus (separate prefix): `journey-succession-r291fix-*`.

## The leg's question (from the prereg)

REL-WIT has been INSUFFICIENT-DATA for four straight panels. The prereg's
read-only diagnosis: in `t2LatelyEvent` the NAMING DEBATE block returns
before the grief block, and its yield guards cover a severe outbreak,
weirdness, the table, and a fresh show — but NOT grief. When a naming
debate is live AND the village is grieving, the lately event is 'naming'
and the mourning branch (which carries the witness variant) never fires.

## Panel verdicts (baseline, instrument-only tip — analyzer `journey-succession-r291-analyzer.txt`)

| Bar | Verdict |
|---|---|
| DRY-CENSUS | PASS — 0 dry hits (5 honest fallbacks, 0 null-return silences) |
| MOURN-TEMPLATE | PASS — 158 servings, 0 same-speaker repeats, 0 village-window repeats |
| MOURN-EXHAUST | PASS — 0 exhausted-line servings in mourning sittings |
| REL-BOND | PASS — 7/7 held |
| REL-VETERAN | PASS — 24/24 held (72 opener draws in both-veteran convos, floor 10) |
| MANTLE-FINE | PASS — 82 deaths, 0 latency ≥2, 0 day-skips |
| CAP-NC | PASS — bonded-by-deadline 8/8 eligible seeds |
| HABIT-COLLISION | PASS — 0 same-seed collisions (6 habit servings) |
| REL-WITNESS | INSUFFICIENT-DATA — 0 servings, 0 single-fresh witness draws (3-draw floor unmet) |
| WITNESS-CENSUS | SUPPLY-ZERO — 1023 corpses (143 person, 880 monster); 0 person corpses carry witnesses in the corpse census |
| WIT-SIT | STAGED-INSUFFICIENT — 3 staged single-fresh sittings, all fired |
| LATELY-DISPLACER (descriptive) | **3/3 naming-displaced, grief live at staging in all 3** |

Smoke control 33998 matches the r279/r280 baseline exactly (handoff d6
Heinrich → Grace, relPost 33, relD14 47, relEnd 50, mourning 0, NPC-NPC 15,
selfId grace_obi). Pilot (34590–34593) agreed on every bar.

## THE ANSWER — the inversion is real and measured

All three staged witness sittings served the naming debate instead of
mourning the witnessed dead, with grief live at staging in all three:

- 34599 d+18: Theo watched Onni die in an ambush that morning; the sitting
  served the Sunbasker naming debate. Lately kind 'naming', latelyDead none.
- 34604 d+12: Grace watched Jada die in an ambush; same displacement.
- 34605 d+8: Mwirigi watched Devon die in an ambush; same displacement.

Witness-variant servings: 0/3. In plain words: a villager watched someone
die in front of them, sat down to talk about it, and the dead person was
never mourned in any of the three sittings. The clearest case is Mwirigi
(34605): the sitting was asked the event topic outright and served the
naming debate — "Have you heard what they're calling Rut King? Otto is
pushing 'The Big Beast'" — while Devon, dead in an ambush, went
unmentioned. Theo and Grace named the dead once each, but only as an
unsolved case ("There's still the matter of the ambush of Onni/Jada.
Nobody's settled it"), then moved on to a foraging errand and a
confession loop; both sittings ended warmly ("Come back anytime",
"Good talk"). The naming debate displaces mourning. This is the fifth
straight panel REL-WIT comes back INSUFFICIENT-DATA, and now the mechanism
is pinned, not just the symptom.

## The fix (this run — the blank, filled)

`src/js/convoTopics.js`, `t2LatelyEvent`: the grief block and the
mantle-memory block moved ABOVE the naming block (pure reorder, no logic
change; the documented priority — table comment: "below fresh grief, the
mantle..." — already put mourning above naming, the code just didn't
implement it). Yield comments added to the naming block (r291). Naming
still yields to a severe outbreak, weirdness, the table, and a fresh show
via its existing guards; grief and the mantle now outrank it.

Proof: `scripts/test-journey-succession-r291-mourn-above-naming-20261127.js`
— 4 cases, 14/14 assertions PASS on the fixed tip:
grief-beats-naming (sitting serves "Dakota always took the burnt piece.
Said someone had to. I take it now."), mantle-beats-naming,
naming-alone (control: still 'naming' — the unblocked path is unchanged),
grief-nameless (name null, nameless variants). RED verified: on the
unfixed tip both discriminating cases FAIL with `{"kind":"naming",
"mid":"sunbasker"}` — exactly the panel finding.

Carried proofs re-run on the fixed tip: r280 mourn-shape-steer ALL PASS,
r280 driftnote-stage ALL PASS. `check.js --quick` launched detached
(log `journey-succession-r291-check-quick.log`) — result pending at
evidence time; the merge gate stays closed until it is green.

Post-fix panel: `scripts/run-journey-succession-r291-postfix-panel.sh`
(PREFIX=r291fix, same band + controls) launched detached 23:16Z; it
re-runs the full panel on the fixed tip so REL-WIT can be judged after
the fix. The NEXT Lane B run reads the `r291fix` analyzer and merges.
Smoke 33998 WILL move on the fixed tip by design (the fix changes which
lately kind fires) — report the new snapshot, do not judge it against
the r279/r280 baseline.

## Village assessment (plain words — the 26 villages)

After the scholar died, every village kept going. The mantle passed to
someone new at every death — 82 deaths across the panel, and the new
bearer was in place the same day every single time, no gaps, no skipped
days. People grieved by name: 158 mourning sittings, and no two
sittings repeated the same words about different dead people. Newcomers
kept arriving (65 across the panel) and were taken in — in every village
where a newcomer arrived before the deadline, the new bearer had bonded
with them by then (8/8). Villagers formed 110 new bonds among themselves
and asked each other to talk 228 times. Veterans talked like veterans
(24 of 24 veteran-mourning servings fired exactly where both dead and
speaker had fought). Nobody's conversation ever came back empty.

The one hole was the witness's grief: three times a villager watched
someone die in front of them and then couldn't talk about it at all —
one sitting served the monster-naming debate when asked what was new,
the other two named the dead once as an unsolved case and moved on to
errands and small talk. That is what this run fixes — the dead get named
first now, and the naming argument waits until the grief passes. (The
NPCs aren't uniformly robotic: Mwirigi's "We've barely spoken. Ask me
after we've bled together" and Grace refusing to confess the same thing
twice are people pushing back. The failure is specific: grief itself has
no outlet while the debate is live.)

## People check (coordinator's own sense-read + delegated nine-transcript check)

Coordinator read in full: the three displaced witness sittings (34599 Theo,
34604 Grace, 34605 Mwirigi) and the r279 case (34546 Elif). The delegated
worker read all nine transcripts in full (displaced set + five mourning
samples: 34590 Carlos, 34590 Ivy, 34593 James, 34613 Sigrun, 34592 Pavel);
its report arrived after closeout and is folded in below.

Coordinator's read (agrees with the worker): the displacement is real and
visible in the words. Mwirigi was asked the event topic outright and
served the naming debate ("Rut King / The Big Beast") while Devon went
unmentioned; Theo and Grace named the dead once each as an unsolved case
("the ambush of Onni/Jada. Nobody's settled it") and moved on to errands
and a confession loop; both ended warmly. Elif's sitting was kitchens and
a party invite. (The NPCs aren't uniformly robotic: Mwirigi's "We've
barely spoken. Ask me after we've bled together" and Grace refusing to
confess the same thing twice are people pushing back. The failure is
specific: grief itself has no outlet while the debate is live.)

Worker's verdict: the witnesses do not act like people grieving a fresh
death — and the mourning samples prove the words are capable of it. When
a sitting actually asks "How are you holding up? About... them," villagers
answer with specific, embodied grief (the burnt piece, the empty place at
the fire). Worst lines: Theo answering "What did you see out there?" with
a herb lesson; Grace's "Good talk" closer after a guilty vote and a
confession with Jada never mourned; Mwirigi's naming-debate answer while
feverish; Elif's first-memory icebreaker after "I need something to do.
Anything. Please."

NEW findings from the worker (not in the coordinator's read):

- TEMPLATE REPETITION in the mourning lines: the grief writing is good
  but all the same syntax with the name and verb swapped — "keeping me
  steady. It doesn't work the same. I do it anyway" appears for Ivy,
  James, and Sigrun; "always took the burnt piece" for James and Pavel;
  "Nobody says [name]'s name right yet" for Sigrun and Pavel. Four
  people grieving in identical syntax reads as one voice. Next blank:
  each mourning villager needs their own sentence.
- THE SMILING CLOSER is pasted everywhere: "Good talk. I feel like I
  know you a little better now" / "This was good" / "They're smiling as
  you go" appear after grief, interrogation, guilty votes, and fever —
  earned in the mourning samples, grotesque in the displaced ones. It
  must be retired whenever grief is live.
- NPCs DROP THEIR OWN WANTS: Mwirigi never re-raises his fever, Theo
  never re-raises Onni, Grace never returns to needing to think out loud.
  Real people circle back to what hurts them; these NPCs accept whatever
  topic the player picks and never return. Next blank: the NPC re-raises
  its want when the player changes subject.
- Grace's confrontation prompt ("You said something odd the other day")
  is offered three times in a row — a filler loop; her escalating
  pushback is human, the option is not. And a UI positioning instruction
  ("Get to your partner's side of the Haven door...") is delivered in
  the NPC's voice mid-conversation about Luis (Pavel).
- Best line in all nine: Sigrun's "I believe in breakfast. In people
  showing up. Small, provable things. The big beliefs all broke — the
  small ones held."

What would have to change in the words (worker's list, endorsed): the
witness's opening must name the dead person and the death before any
other topic is offered; retire the smiling closers when grief is live;
give each mourning villager their own sentence; "What did you see out
there?" must be answered with what they saw, not a plant lesson; and the
NPC must re-raise its own want when the player changes subject. The fix
in this run (mourning above naming) gives grief the turn to speak; the
template/closer/circle-back items are the next blanks for a future
succession run — filed, not built here.

## Reachable / fun / winnable (leg 7)

- REACHABLE: yes. The mantle passes cleanly in every village; the
  successor's life is playable from the handoff (funeral beat fires,
  pick-time rank 1, successor bonds and talks). Nothing in the leg is
  gated behind an unfireable beat.
- FUN: mostly. Mourning by name lands — the lines are specific, the
  habits and owed favors make the dead feel like people. The witness
  hole was the un-fun part: watching a death and then being unable to
  speak of it reads as the village not caring. The fix targets exactly
  that.
- WINNABLE: unchanged by this run. The leg is about the mantle passing,
  not the win; the win chain (wave-4 kills → veterans → readiness-5 →
  wave-5 → full seat) is measured by the flesh-out loops, not here.

## Metric review

- The LATELY-DISPLACER tab was descriptive by prereg design; it
  diagnosed the bottleneck without re-scoring REL-WIT. That was the
  right call — the tab's 3/3 is the finding, and REL-WIT stays
  INSUFFICIENT-DATA on the baseline rather than being re-scored against
  a friendlier metric.
- WITNESS-CENSUS "SUPPLY-ZERO" needs a wording fix next run: the corpse
  census records 0 person corpses with witnesses, but the staged ambush
  deaths DO have witnesses (Theo/Grace/Mwirigi in the witSit records) —
  the census reads `corpse.witnesses` from corpses.js, which ambush
  deaths never populate. The supply is not zero; the census instrument
  reads the wrong field for staged deaths. Proposed: census counts
  witSit-staged witnesses as supply, or the ambush path books witnesses
  onto the corpse. Do NOT re-score r291 on this; the fix panel judges
  REL-WIT on the staged sittings either way.
- The pilot decision rule's first branch (≥2 naming displacements in the
  pilot seeds 34590–34593) never fired because the pilot staged ZERO
  witness sittings — the staged supply landed in seeds 34599/34604/34605.
  The rule as written couldn't trigger on the pilot; the full panel was
  run on the second branch (draws ≥3). Next run: stage the supply screen
  so the pilot seeds carry a witness sitting, or drop the pilot branch
  for this question.

## Telemetry deviation check (step 14)

Ran `telemetry-check.js` on the baseline r291 tele corpus (27 files —
24 band seeds + controls 34403/33998 + replay 34546). Two LOUD lines,
both investigated same-run, verdict EXPLAINED — baseline NOT rolled:

- `deaths.bearer <redacted> 1018%: baseline 7.6 -> current 85` and
  `census.fallen swung 1236%: baseline 14.3 -> current 191`.
- Cause, part 1 (checker artifact): the checker compares the baseline
  MEAN against the current SUM over the 27 files. On means: deaths.bearer
  3.15 (vs 7.6), census.fallen 7.07 (vs 14.3) — the LOUD percentages are
  a sum-vs-mean mismatch, not a game deviation.
- Cause, part 2 (band variance): on means the current band simply has
  fewer deaths and more survivors (census.alive mean 7.78 vs baseline
  3.8), while the shape metrics match almost exactly
  (integrationStage 3.0 vs 3.0; week2.deadBearerMentions 4.37 vs 4.2).
  A broken death/mantle path would show as MANTLE-FINE failures or
  missing mourning — MANTLE-FINE PASSED (82 deaths, 0 latency ≥2) and
  mourning fired 158 times. The baseline file carries no provenance
  (no run/seed/regime recorded), so the mean gap cannot be attributed
  further; per the prereg ("forced-chain regime — do NOT roll the
  baseline on LOUD lines, per r280") the baseline stands as-is.

## Incidents (this run)

- STALE-LOCK RECOVERY: lock `playtest-loop-2-20261127T2200Z` (created
  22:01:52Z) deleted after the full check — registry heartbeat for
  journey2-7 was 22:40:20Z (>15 min stale), no live coordinator process,
  no live subagent for this loop, no file writes after 22:38Z. The 2200Z
  run's panel had completed 22:38:03Z and the run had died before
  committing. New lock `playtest-loop-2-20261127T2300Z` created 22:59:03Z.
  The 2200Z lock was DELIBERATELY HELD by that run for this recovery
  (same sanctioned pattern as r288/r279).
- REGISTRY LOCK CONTENTION: heartbeats failed twice on "registry lock
  held > 120s" (flesh-out loop registering sim-aidammo-a, live holder —
  not stale, not broken). Heartbeat loop `journey2-7-hbloop-r291.sh`
  (pid 131529, every 5 min) keeps retrying; registry heartbeat still
  22:40:20Z at last check. Reaper threshold is ~4h staleness; no danger
  to the tree, but the next run should confirm a heartbeat lands.
- SAFE-COMMIT CLOBBER struck on BOTH commits this run (files staged as
  deleted in the index, worktree files intact; commits themselves
  correct). Repaired both times with the `git ls-tree HEAD | git
  update-index --add --index-info` pipe; verified `git diff HEAD` empty
  after each repair.
- CROSS-LOOP KILL (my fault, recorded plainly): while relaunching this
  run's `check.js --quick` with the `--cacheDirectory` flag, a
  `pkill -f "check.js --quick"` matched and killed Lane A's check run
  (pid 2244, journey-deepening worktree, running since 23:10Z) along
  with my own just-started process. No game data or commit was touched
  — only ~12 minutes of Lane A's test runtime. Lane A will need to
  re-run its check. Lesson: never `pkill -f` a bare tool name on this
  shared box; kill by exact pid only.

## Closeout state (for the next Lane B run)

- HOLD the lock and the tree: merge waits on the post-fix panel verdict.
- Post-fix panel (`r291fix`) running detached since 23:16Z (seed 34590
  first); `check.js --quick` running detached since 23:23Z. Read both
  logs before any verdict.
- Next run: (1) confirm a heartbeat landed; (2) read the `r291fix`
  analyzer — judge REL-WIT on the post-fix panel (3-draw floor) and
  record the new smoke-33998 snapshot as moved-by-design; (3) read the
  check.js log — must be green; (4) commit the baseline corpus +
  this evidence file + the postfix corpus (explicit file lists, NOT the
  whole evidence dir — the postfix files are still landing); watch for
  the safe-commit clobber and repair it the same way; (5) rebase
  journey2-7 onto current master (branch base c1ff05ed6 is behind
  master 8ee234ccc), re-run the r291 proof + carried proofs on the
  rebased tip, then `git merge --ff-only journey2-7`; (6) release the
  tree, write rotation-b 7 → 4, delete the lock.
- Telemetry check (step 14): run `node scripts/telemetry-check.js
  --baseline hidden_files/telemetry-baselines/succession.json --current
  'evidence/2026-11-27/journey-succession-r291-tele-*.json' --metrics
  deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`
  from the worktree before merging; LOUD lines are same-run
  investigation items (forced-chain regime — do NOT roll the baseline
  on LOUD lines, per r280).
