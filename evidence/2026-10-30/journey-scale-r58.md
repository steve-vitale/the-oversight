# journey-scale r58 — Lane A, leg 3 SCALE (2026-10-30)

**Run id:** oversight-playtest-loop-20261030T1820Z (scheduled 12:45 CDT; lock created 18:20:14Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@1555c5dfa at worktree creation (deepening r71 merge).
**Pre-register:** evidence/2026-10-30/journey-scale-r58-prereg.md (written before
any seed ran). **Zero src/js changed by this run** — measurement plus one
driver + one analyzer (labels/EVIDIR only), and evidence.
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Heartbeat:** 10-min background loop (log at
  `hidden_files/journey-scale-r58-heartbeat.log`) plus manual heartbeat at
  registration; registry heartbeat verified landed after loop start
  (18:31:27Z) and re-verified fresh during the run (18:41:27Z).
- **Registration:** queued behind the registry lock briefly (~3 min),
  then succeeded; worktree verified by `ls` before proceeding.
- **Driver-copy discipline (r57 lesson) kept:** copies made with absolute
  worktree paths, verified 577 lines non-empty, `node --check` clean,
  zero remaining r57 labels in driver or analyzer; the one history
  comment the sed relabeled (the r57 pellet-fix credit) was restored
  by hand to its correct provenance.
- **Consistency checks built into the arms:** the Q2 control-probe arm's
  d90 transcript is BYTE-IDENTICAL to the quad's d90 transcript, and
  the Q3 subject-first arm's d90 transcript differs from the quad's
  ONLY in the `picker:` header line — both arms reproduce the quad
  exactly through d90, so every probe difference after d90 is
  attributable to the probe sittings / picker, not to arm drift.
- **No concurrent jest:** a sibling (sim-sickstale-b) was running
  `check.js --quick` when this run reached its test step, so this
  run's suite waited for the sibling to finish first (see Tests).

## Verdicts (binding questions, answered)

### 1. QUAD-CURRENT-R58: PARITY BROKEN ON ALL FOUR SEEDS — base drift moved every scale fate
Same 4 seeds, control picker, policy scalecourt-nogate UNCHANGED, DAYCAP 180.
Pilot gate passed (85001 ran clean, pilgrimages 4, not 0). Per the prereg
rule, ANY scalar difference triggers the first-divergence audit before
any attribution — done below; nothing here is called noise.

| seed | r57 | r58 | moved |
|---|---|---|---|
| 85001 | d144, died 2/2, GLOBAL nat121 glob122 court102, lesser arc4, deaths41, cov38/37/30, pilg4, fusion T, abil iron_stomach/squirrel_friend/lucky_rock | d135, died 0/0, GLOBAL nat77 glob92 court76, lesser arc4, deaths44, cov34/40/32, pilg4, fusion T, abil iron_stomach | climb ~30–45d earlier, dies harder |
| 85002 | d178, ALIVE 8/8, pantry 18,308, GLOBAL nat104 glob105 court103, lesser arc4, deaths43, cov69/90/74, pilg10, fusion T, abil 6 | d132, died 0/0, REGIONAL (no nat/glob/court), lesser arc4, deaths62, cov 2 (one link, trust 2), pilg54, fusion T, abil bloodhound/cornered_rat | the village that held together now dies at regional |
| 85003 | d88, died 5/5, regional, lesser arc4, deaths39, cov NONE, pilg5, fusion F, abil beast_calm/war_cry/scream_cheese | d134, died 1/1, regional, lesser arc4, deaths44, cov30/34/34, pilg6, fusion F, abil iron_stomach | lives 46d longer, still dies out, now with covenants |
| 85004 | d181, ALIVE 4/4, pantry700, regional, lesser arc4, deaths48, cov12/28/30, pilg14, fusion T, abil green_whisper | d178, died 0/0, regional nat94 glob117 court93, seat NONE arc3, deaths47, cov58/31/22, pilg5, fusion F, abil green_whisper/dowsing/echo_location | loses even the lesser seat (arc 3, not 4) |

Descriptive quad count, changed from r57: alive at end 0/4 (was 2/4),
global-final 1/4 (was 2/4), lesser seat waiting 3/4 (was 4/4),
full seat 0/4 (unchanged), wave 5 reached 0/4 (unchanged, maxWave 4
on all four seeds).

**First-divergence audit (r52 rule, all four seeds):** the capture
diffs' first hunks are the SAME class on 4/4 seeds — two ADDED lines
at the end of day 1, the player fetching stashed gear at haven:
- 85001: Sling + Deep Earth Boots (lines 52–53; first 51 lines
  byte-identical to r57).
- 85002: Crossbow + Denim Jacket, then `Equipped Denim Jacket
  (torso)`, then `Armor absorbs 4` in combat.
- 85003: Crowbar + Flannel Shirt, then both Equipped lines, then
  `Armor absorbs 2`.
- 85004: Hunting spear + Work Gloves, then both Equipped lines.
Attribution, via `git log -S "rides in your pack now"` on the range:
the lines live in src/js/villager-build.js and were introduced by
21efcdcb2 (sim-stashfetch-b: vessel fetches own stashed weapon once
a day at haven) and 3e94b55cc (sim-armorfetch-b: vessel fetches own
stashed armor once a day at haven). The r57→r58 range's ONLY src/js
changes are those two landings plus 15ab6d463 (gapscomp-hide: hide
armor enters the world) and 06b502d53 (sim-contestdeath-b: contest
deaths recorded via registerDeath + fallen). The fetch lines are the
range's FIRST mover on 4/4 seeds; the trajectories re-roll from
there. What is NOT established: which of the four landings, singly
or jointly, produces the worse endings — that needs a decomposition
arm (e.g. fetches disabled), not a claim from this quad. The honest
statement is: the range moved every fate, and on this quad the
direction is uniformly worse endings (0/4 alive, 1/4 global, one
seed losing the lesser seat). The gear-fetch landings do not, on
this evidence, help villages climb or survive — but four seeds
cannot convict a mechanic; the decomposition is the open item.

### 2. IRVING REPEAT-DISPLACEMENT: ONE-SITTING-ONLY (Q2 PASS by the prereg count)
Seed 85001, control picker, DAYCAP 110, PROBE_VID=gen_oqbl010 (Irving),
PROBE_DAYS=91,93,97,105. The d90 sitting reproduces the displacement
class on the new base (see People Check): goal-thread opener, pending
betrayal invitation owns the turn-0 menu, seeded ask_favor want
(stage 0, planted d85) never surfaces, stage 0 at pre-close.
- **d91 (first probe sitting): the favor SURFACES and COMMITS.**
  ask_favor stage 2, want-thread opener ("About the creek water run
  — I still haven't found anyone. Any chance?"), picker commits
  ("I'll come back to help"), Irving sets place and time ("Dawn,
  then. Bring something to carry"), pre-close stage 3.
- d93/d97 are the repay follow-ups of that commitment (repay stage 1;
  d97 resolves "we're square", with a react-loop blemish noted below).
- d105 is a SECOND, independent ask_favor (wound, "Eli's gone") that
  also surfaces and commits (stage 2→3).
Prereg count: 1/1 at the first probe sitting — displacement is
ONE-SITTING-ONLY. Design call leans "accept displacement as the price
of invitation honesty" (r57's documented option), NOT the re-surface
fix — with one stated caveat: the d91 want carries a d91 planting
stamp, not d85, so instance identity (same want vs. re-planted favor)
is NOT proven from the transcript header; what is proven is that the
favor CONTENT (the creek water run) re-presents the next day and
commits. The one sitting's chance (d90) is still lost; the favor is
not lost.
- The d120 quad sitting bounds the story from the other side: by
  d120 Irving holds a (fresh, fromSeed=false) ask_favor that engages
  and commits — but it is NOT counted as a probe success (outside
  the probe set, different instance stamp).

### 3. IRVING SUBJECT-RE-ENTRY: THE SUBJECT MENU IS A TOPIC SWITCH, NOT A RE-ENTRY (Q3 answered, r57 design input CORRECTED)
Seed 85001, WANT_SUBJECT=1, DAYCAP 110, same probe days/vid.
- **d90: prediction holds.** dlg:subject is NOT offered at turn 0
  (invitation owns the menu); the transcript is identical to the
  quad's except the picker header. Subject-first cannot rescue the
  displaced sitting itself.
- **d91: turn 0 DOES offer dlg:subject — and taking it SHELVES the
  want.** Irving: "Forget I said anything. What did you want?" The
  talk becomes a mourning talk about August ("I do push-ups at dawn
  for August, now") — real and moving, but it is NOT the favor talk.
  No alive:want:ask_favor choice is picked at any turn (the picker
  takes alive:event:mourning; alive:want items sit in the ENGAGE
  list, which the picker checks BEFORE the mourning item — so had
  alive:want:ask_favor been offered, it would have been picked).
  Pre-close: want ask_favor stage 2, thread lately.
- **d93: same pattern.** "Sorry — I shouldn't load that on you."
  Mourning talk ("August is gone and the world just... continues"),
  want stays stage 2. The talk even acknowledges the repeat ("I
  answered that once — back when the answer was simpler") — honest
  about it.
- d97/d105 under subject-first likewise never commit (stage 2→2).
Verdict: the r57 note's hoped-for re-entry path ("via the
alive:want / subject menu") does NOT exist in this trace — at d90
the subject menu isn't offered, and at d91+ taking it diverts AWAY
from the want rather than into it. Correction to the r57 design
input, stated plainly. The subject-first policy's non-commitment is
a picker-policy artifact with an honest reading (you changed the
subject, so the ask waits) — not a game bug. The want system's own
resilience (Q2) is what recovers the favor, not the subject menu.

### 4. PEOPLE CHECK (sense law — all 8 quad transcripts + all 8 probe transcripts read in full)
Quad, per transcript, plain words:
- 85001 d90 Irving — goal-thread grief talk (lost family: "If
  they're out there, they're looking for me too. I have to be
  findable"); the betrayal invitation is accepted and the talk
  becomes the thinking-place beat, ending by leave without the
  invitation resolving into going anywhere. Seeded ask_favor
  displaced, same mechanism as r57, new words. Coherent and
  complete as a talk; the want is the casualty.
- 85001 d120 Irving — favor asked, committed, thanked ("I won't
  forget who fed me when it mattered"). Real, small, complete.
- 85002 d90 Jian — legacy talk ("I don't need a statue. I need one
  good story that outlives me"), field lesson ("Saw things with too
  many joints. Give them room"). Complete as a talk; the seeded
  curious want stays stage 0 — goal-thread dominance displaces a
  young want even without an invitation. Not scored as a defect
  (stage 0 wants are young), noted descriptively.
- 85002 d120 Sanne — food favor re-asked ("I hate to ask twice"),
  committed, thanked. Real, small, complete.
- 85003 d90 Henry — belief question, answered straight ("I believe
  in breakfast. In people showing up. Small, provable things. The
  big beliefs all broke — the small ones held"). The leg's best
  talk this run. Curious advances 1→2.
- 85003 d120 Thabo — WEAKEST talk this run. Opener withdraws its own
  want ("Never mind the sickness I'm fighting — we got it handled.
  Thanks anyway."), then the menu offers only goon/subject/leave/
  silence; one goon yields a generic line ("You can feel the history
  in how they greet you"), then leave. The closing line lampshades
  it: "Well. That was almost a conversation. We're improving."
  Coherent as news (the sickness got handled elsewhere), thin as a
  conversation. Documented as the run's one blank-ish beat; no fix
  without a mechanism (why a stage-1 want opens with a withdrawal
  and no follow-up ask is unmeasured).
- 85004 d90 Marisol — pantry-run favor, committed with place and
  time ("Where the muscadine grapes grows thick, at sunup. Pack and
  knife. We travel light"). Real, complete. Tiny text blemish:
  "grapes grows" (subject-verb agreement in game text).
- 85004 d120 Meera — grief opener ("Every laugh out there feels
  wrong today"), comfort engages ("Just needed a minute where I
  didn't have to be fine"), then drifts into referent-free gossip
  ("Word is you told it straight" — who told what is never fixed),
  ends gracefully ("I should go. You know where to find me").
  seek_comfort advances 0→2. Real opening, soft middle, graceful end.
Probe transcripts (Irving, 85001):
- d91 control: favor commits (see Q2). d93 control: repay check-in;
  picker leaves (no ENGAGE choice offered — favor_requirements and
  subject were the only non-leave options; a real player could have
  pressed favor_requirements; picker artifact, not a game bug).
  d97 control: repay resolves ("we're square", "They look lighter
  for it") BUT the middle loops on dlg:react five times ("Don't
  mention it" / "We're square" alternating, verbatim repeat
  flagged) — a picker-amplified filler loop; a real player stops
  after 1–2 reacts, and the talk does end via goon. Flagged as a
  minor blemish: repay-resolution talks have no progressing beat
  after the first react.
- d105 control: wound favor commits (see Q2). Subject d91/d93:
  mourning talks, want shelved (see Q3); both real grief talks.
Tally: 4/8 quad talks fully real and complete, 2/8 coherent with a
displaced or unengaged want, 2/8 thin (Thabo withdrawal-only,
Meera gossip drift). No fabricated shared history, no static menus,
no softlocks. Boris nod-loop class: NOT observed this run — no
Boris transcript arose (the roster pick differs on the new base),
so the class is unre-tested, not fixed and not recurred.

### 5. TABLE-APPROACH (standing, report-only)
85001 lesser waiting (arc 4, global reached); 85002 lesser waiting
(arc 4, regional only — never reached national); 85003 lesser
waiting (arc 4, regional); 85004 NO seat, arc 3 (reached national
day 94 / global day 117, but the seat never priced to lesser). No
seat-taker choice voiced in-window on any seed; no full-seat offer;
full seat unwon (w5 0 on all 4). Continuity with r57 except 85004,
which falls a stage short of the table it reached in r57.

### 6. BARRIER PIN (standing instrument, re-confirmed)
sayOncePerFight calls: 85001 d42/d133, 85002 d91/d131/d132,
85003 d56/d130, 85004 d113/d177 — ALL the sleep "Not in the middle
of a fight." family (inCombat=true, tbfight=true, over=false),
except 85003 d130 "Not mid-fight — finish it first." from boilWater
during upkeep, which is the same refusal-narration class. ZERO
barrier lines of the guard-broken class; the pin stays in its r55
form (guard-holds, not guard-broken). Days differ from r57, as
expected — the trajectories diverged on day 1.

## Village assessment (plain words)
- **85001 — the village that climbed faster, then died harder.**
  Reached GLOBAL by day 92 and first court by day 76 (26–30 days
  earlier than r57), lesser seat waiting at arc 4 — but died out
  completely by day 135 (0/0), nine days earlier and with nobody
  left at all, where r57 left two people standing. 44 deaths.
- **85002 — the village that pilgrimaged instead of climbing.**
  54 pilgrimages (r57: 10) and exactly one covenant link at trust 2
  (r57: 69/90/74). It never reached national, never held a court,
  and died out at day 132 with 62 deaths — where r57's version held
  eight people alive to day 178 with a pantry of 18,308. The
  pilgrimage machine ran; the climb never started.
- **85003 — the village that lasted longer and still died.**
  Lived to day 134 (r57: 88), built three covenants (30/34/34;
  r57: none), and still died out with one person left. A longer
  regional story with the same ending.
- **85004 — the village that reached the world and lost the table.**
  Reached national (day 94) and global (day 117), but the seat never
  priced even to lesser (arc 3, seat none) and the village died out
  at day 178 — where r57's version lived to day 181 with four
  people and a lesser seat waiting. The climb happened; the table
  didn't follow.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: the climb's machinery still fires (courts, covenants,
  pilgrimages, priced table voicing on 3/4 seeds) — but every fate
  moved under the new base, so "reachable" now means reachable-to-
  a-different-ending. The r57 continuity result is superseded, not
  extended: this quad measures the new base, and the new base's
  scale story is harsher.
- FUN: unchanged in kind — the table voicing and the seed loop's
  memory are still the leg's best writing (Jian's legacy talk,
  Henry's breakfast belief, Irving's push-ups for August), and the
  Irving displacement story now has an ending (one sitting lost,
  favor recovered next day). The thin spots are Thabo's
  withdrawal-only talk and the d97 react loop — blemishes, not
  breaks.
- WINNABLE: not shown, again, and further away on this quad. The
  lesser seat waits on 3/4 seeds (was 4/4); the full seat stays
  unwon (w5 0); and this run adds a sharper question for the next
  decomposition: does the day-1 gear fetch help or hurt the long
  climb? Four seeds say the endings got worse; they do not say why.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores).
- r57's FULL PARITY verdict is SUPERSEDED, not re-scored: r58 shows
  0/4 scalar parity under the same fixed rule (any scalar difference
  → first-divergence audit). The audit was performed (fetch lines,
  day 1, 4/4 seeds) before any attribution, and no scalar was
  re-scored against a friendlier metric.
- r57's Irving-displacement mechanism STANDS and generalizes (new
  transcript, same owns-rule mechanism); its open item (repeat
  displacement) is now ANSWERED: one sitting only (Q2).
- r57's subject-menu re-entry hope is CORRECTED by Q3: the subject
  menu shelves the want, it does not re-enter it.
- r57's Boris nod-loop stands UNRE-TESTED (no Boris transcript
  arose); r56's chooseAbility-unguarded note stands (no duplicate
  ability id in any control seed's abilitiesHeld — all 4 lists are
  distinct); r52's barrier pin stands in its r55 form.
- No metric was re-scored mid-run.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-30/journey-scale-r58/journey-scale-r58-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ 3 LOUD lines, all "newly appeared: baseline 0 → current N"
(census.day 579 = 135+132+134+178; census.maxWave 16 = 4×4;
census.pilgrimages 69 = 4+54+6+5). The mirror image of r57's
"disappeared" lines: the baseline file carries markerCounts.* /
tableTele / fights* keys that the journey trust JSONs do not have,
and the census.* metrics are not in the baseline — there is NO
shared metric between baseline and current, so the comparison is
vacuous in both directions. Verdict: NOT a real deviation. NOT
rolled. Proposal for the NEXT run (not done mid-run): seed a
separate scale-census baseline from r58's quad census aggregates so
the check compares like with like; do not overwrite scale.json's
keys, which belong to a different instrument.

## Tests
- `node --check` clean on the r58 driver (at creation) and the r58
  analyzer (at creation).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **284 passed, 6 failed in 381s** (290 scripts). Output logged whole
  to goal hidden_files/journey-scale-r58-checkquick.log, not piped
  through tail (r69 lesson). Run sequentially: a sibling
  (sim-sickstale-b) was running the same suite when this run reached
  its test step, so this run waited — the sibling finished 284/6
  in 451s first.
- The 6 are EXACTLY r57's 6 pre-existing assertion-failure scripts,
  same families, same signatures — measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, and the establishment-r20 family
  (test-establishment-r20-fixes-20261020.js). No quick-list test
  imports this run's scripts (verified by the failure list matching
  r57's, not by grep — the failing scripts are all godpath/phase-0
  and establishment-r20, none of them the r58 driver or analyzer),
  and this run's change set is driver + analyzer + evidence with
  ZERO src/js, so it cannot have caused any of the 6.
- Suite side effect, discarded not committed: the suite modified
  docs/ONTOLOGY.md (one Provides line gaining vesselArmorFetch(),
  the armorfetch landing's entry). That is another landing's
  documentation, not this run's work — reverted with
  `git checkout -- docs/ONTOLOGY.md` before committing, so the
  commit holds only this run's files.
- Zero src/js changes, so no game-code regression surface exists in
  this run's change set; the suite above is the standing proof, not
  a response to a suspected regression.
Verdict: zero regressions attributable to this run.

## Landing (filled at closeout)
Master at worktree creation: 1555c5dfa. Master did NOT move during
the run (verified 1555c5dfa still HEAD at closeout) — no rebase
needed. Proof re-run after the suite: `node --check` on driver +
analyzer still clean; measured files untouched by the suite (only
docs/ONTOLOGY.md was suite-touched, reverted above).
Merged locally, pending ship (no bump, no push, no live verify —
ship loop owns those).

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**284 passed, 6 failed in 381s** (290 scripts).
The 6 are EXACTLY r57's 6 pre-existing assertion-failure scripts,
same families, same signatures — measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, and the establishment-r20 family.
Verdict: zero regressions attributable to this run.
Worktree status after the suite: only this run's entries (driver +
analyzer + prereg + run note + three evidence dirs) — the one
suite-touched file (docs/ONTOLOGY.md) was reverted, not committed.

## TELEMETRY (filled at closeout)
3 LOUD lines, all vacuous shape mismatch (see Telemetry section above).
Baseline NOT rolled.
