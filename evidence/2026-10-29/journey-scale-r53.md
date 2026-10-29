# journey-scale r53 — Lane A, leg 3 SCALE (2026-10-29)

**Run id:** oversight-playtest-loop-20261029T1145Z (scheduled 11:45 CDT).
Rotation read 3 → leg 3 SCALE; write 3→0 done at run start.
**Base:** master@ca9a7569e at worktree creation.
**Pre-register:** evidence/2026-10-29/journey-scale-r53-prereg.md (written before
any seed ran). **Zero src/js changed by this run** — measurement only, plus
one driver script (r53 driver = r52 driver, labels/EVIDIR only, plus an
env-gated CHOICELOG line added for the probe below — default off, main
runs unaffected) and evidence.
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before).
**Note on numbering:** r52 already ran today (07:45 CDT run, base
a6fa0710c, barrier pin + armor divergence). This run is r53, not a
re-run of r52: it completes the matched quad r52 left at two seeds and
pins r52's documented dialogue blank. The r52 prereg was read before
any seed ran; no r52 file was overwritten (r53 writes its own EVIDIR).

## Infrastructure notes (loud, first)
- Heartbeat loop (10-min cadence, log at
  `hidden_files/journey-scale-r53-heartbeat.log`) verified landing
  after start (16:51Z) and at each major step; registry heartbeat never
  went stale.
- Driver stdout for each seed run went to goal hidden_files logs, not
  the terminal (r50/r51 noise lesson, kept).
- Base drift r52→r53 is game-identical: `git log a6fa0710c..HEAD --
  src/js/` is EMPTY — everything between the two runs is
  evidence/tooling. That is why the 85003 probe below reproduces r52's
  day-90 Joshua talk exactly (same NPC, same opening line, same
  turn-0 choices) before the picker variant diverges it.
- The r53 driver run of 85003 (probe only, WANT_SUBJECT=1) overwrote
  its own probe files on the second, CHOICELOG run — the surviving
  day-90 transcript carries the full per-turn choice lists; the
  first probe's transcript (same lines, no choice lists) is superseded,
  not lost as a claim: both probe runs agree that subject-first does
  not surface the want (see Q2).

## Verdicts (binding questions, answered)

### 1. QUAD-ARMOR-R53: QUAD-PARTIAL — the climb survives on 1 of 4, at the wire
Armor-era quad (r52's pair + this run's pair, same policy, DAYCAP 180):
- 85001 (r52): day 138, died out, regional, national NONE, global NONE,
  lesser seat, arc 4.
- 85003 (r52): day 161, died out (pop 2/2), regional, national NONE,
  global NONE, lesser seat, arc 4.
- 85002 (r53): day 178, SCATTERED (5th hungry day, pantry 0, "Haven
  couldn't hold"), pop 2/2 left, regional, national NONE, global NONE,
  NO seat, arc 3, maxWave 4, deaths 36, covenant trusts 33/26/26.
  Pre-armor (r43): day 159, died out, GLOBAL (national 137, global
  152), arc 3, no seat, deaths 56. The seed falls from global to
  regional on the armor base — and its end is starvation-scatter, not
  a fight wipe.
- 85004 (r53): day 181, ALIVE 7/7, pantry 25,536, NATIONAL
  (nationalDay 179 — the day before the cap), global NONE, lesser
  seat, arc 4, waiting, firstCourt 178, covenant trusts 51/51/50,
  deaths 46, maxWave 4. Pre-armor (r43): day 181, alive 9/9, pantry
  61,320, REGIONAL, no national/global, lesser seat, arc 4, deaths 39.
  The seed climbs from regional to national on the armor base — but
  the national beat lands at day 179 of 180, with its first court the
  day before. Two fewer people alive, less than half the pantry.
- Armor visibly fires on both new seeds (capture lines, not
  inference): 85002 — Jian sewed a bark armor that holds, Sanne sewed
  two, Dale a hide armor, Chantal a bark armor (plus failures by Dale,
  Sanne, Jose); 85004 — Gonca sewed four that hold, Pooja two, Lerato
  three (plus one Gonca failure); 31 bark-strip lines on 85004.
- **Verdict per the prereg's fixed rule: QUAD-PARTIAL (national 1/4,
  global 0/4)** against a pre-armor quad of national 3/4, global 3/4
  (85001, 85002, 85003; 85004 neither). This is a DESCRIPTIVE count,
  not a causal armor verdict — the prereg forbids that leap, and the
  audit below is why: the two new seeds do not extend r52's armor
  attribution, they bound it.
- **First-divergence audit vs r43 (same method as r52): NOT
  armor-attributed for these seeds.** r52's audit (same driver
  lineage, r51→r52) found byte-identical captures for ~2,470 lines
  and a first divergence in the stash fork. Here, against r43 (an
  older driver lineage; no same-lineage pre-armor reference exists
  for 85002/85004 — r44–r51 all ran pilots only), the first
  divergences are week-1 ambient lines, not the stash: 85002 line
  488 (fireside gossip / water-run lines differ), 85004 line 430
  (naming/starvation/meal lines reorder). Same policy
  (scalecourt-nogate), mode string is manifest-only (not RNG), so the
  early fork is real game/driver drift between Oct 27 and Oct 29, but
  its mechanism is UNPINNED — it is reported as unexplained drift,
  NOT attributed to armor. r52's armor attribution (same-lineage
  pair) stands untouched; this run neither extends nor overturns it.
  What the quad DOES establish, without attribution: on the current
  base, the scale climb is thinner and later — three seeds never
  reach national, and the one that does reaches it at the wire.
  The on/off panel r52 named is still the instrument a causal armor
  claim needs; this run does not build it.

### 2. SEEK-TAKEN-PIN: PINNED — stage 0 is silent, stage 1 speaks (same NPC, same day)
r52's documented blank was 85003 d90 Joshua (seek_taken stage 0):
eight turns of leadership aphorisms, no want, "Good talk", nothing
changed. This run pins it in three steps, all on the same NPC
(Joshua, gen_ywl213c), seed 85003, day 90:
- **Code:** seek_taken HAS full engageable content in convo-wants.js
  — opener (3 variants: "Have you heard anything? About the taken.
  The pods. Anything at all."), engageBeat (the kin story, with a
  repeat-ack), menuOptions (dlg:more, dlg:commit "I'll ask the System
  about the pods.", dlg:cant), commitBeat (records the promise; the
  table reunion remembers who asked). Content is not missing.
- **Probe 1 (subject-first picker, WANT_SUBJECT=1):** reproduces
  r52's talk exactly (same opening leadership line, same turn-0
  choices including dlg:subject and dlg:invite), takes dlg:subject —
  and the want STILL does not surface. The talk goes to gossip and
  water runs instead.
- **Probe 2 (subject-first + CHOICELOG, full per-turn choice lists):**
  the turn-1 subject menu offers: confront, alive:event:show,
  ask:others, ask:gossip, ask:spread_rumor, menu:more, leave,
  silence. NO want item. No alive:want:seek_taken, no commit, nothing
  about the pods. The menu is where a live want should be offered,
  and at stage 0 it is not there.
- **Control from history (r43's identical NPC/day):** r43's 85003 d90
  Joshua talk has want seek_taken STAGE 1 — and the opening line IS
  the want opener ("About what happened to my taken kin — Have you
  heard anything? About the taken. The pods. Anything at all."),
  engaging to dlg:commit and the promise ("Even asking is more than
  the silence."). Same NPC, same seed, same day: stage 1 speaks,
  stage 0 does not.
- **Verdict: STAGE-0 SURFACING GAP, not a picker artifact and not
  missing content.** At stage 0 the want is assigned (c.want says so)
  but has no path to the player: not in the opening, not in the
  subject menu, under either picker variant. The control picker
  (r52) is exonerated as the cause — the subject-first picker fails
  identically, for a menu reason, not a picker reason. No src/js fix
  follows from this run: whether stage-0 silence is intended ripening
  (the want is not ripe yet) or a missing on-ramp (a stage-0 teaser
  line) is a DESIGN call, and a worker inventing either would be
  inventing behavior. The blank is now pinned to a stage rule, not a
  mystery — the next step belongs to a design decision, or to a
  dialogue run that maps what moves a want from stage 0 to stage 1
  (r43→r52 shifted this same NPC from stage 1 to stage 0 for day 90;
  that shift's mechanism is named as an open thread, not claimed).
- Probe census (picker-variant, NOT part of the quad): 85003
  subject-first ends day 156, over, pop 1/1, regional, lesser seat,
  arc 4, waiting — near r52's control (day 161, pop 2/2), diverged
  after day 90 as expected when the conversation path changes RNG
  consumption. Not a finding; the probe's finding is the menu.

### 3. TABLE-APPROACH SENSE: ANSWERED — priced wait on both seeds, no seat taken
Quoted from THIS run's want files (not r52's):
- 85002: NO seat, arc 3 — but the table IS voiced, priced: "The table
  is being set for those whose deeds are done, and yours are not
  done. The ledger still wants: wave-3 monsters faced." The village
  also takes the FUSION REACTOR pellet ("You will never be hungry
  again. One reactor per world: yours. It does not come out.").
- 85004: lesser seat, arc 4, waiting + announced. The pellet's price
  is then voiced back, hard: "WE PRICED THE RUN. NO HUNGER ON THE
  RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD BE. NO FEAST, NO
  SURGE, NOTHING HERE WE CAN PRICE. A COLD SPOT AT EVERY TABLE: THE
  WORDS WERE ON THE WRAPPER." And: "The ledger still wants: the
  food-thesis deeds (no feast can carry the surge while the pellet
  hums). The mantle may pass to hungrier hands; the table will still
  be here." Plus the standing lesser-seat line: "The table is being
  set — a lesser seat, priced for what you built. They are watching
  to see who comes to it." And fireside: "The table's set. The ring
  of pale light — it's just sitting there. Waiting on them."
Neither seed voices a seat-taker choice or a full-seat offer
in-window; neither sits. The wait reads as PRICED (a named deed gap
on both, a named seat on 85004, and a named self-inflicted block —
the pellet — on 85004), not a silent stall. The full seat stays
unwon (w5 0 both, as ever).

### 4. PEOPLE CHECK (sense law — full transcripts read, not counted)
- 85002 d90, Nora (tailor, gentle, trust 22), want curious stage 1:
  the opening names the want ("About curious — I keep turning it
  over.") but turn-0 choices offer NO engage path — only dlg:invite,
  dlg:subject, leave, silence — and the control picker, which never
  takes subject/invite, leaves at once. Thin but honest (leaving is
  a valid ending); the structural note is the same as Q2's: the want
  lives behind the subject menu, and this picker never goes there.
- 85002 d120, Keisha (musician, sardonic, trust 90), want ask_favor
  stage 2: "About the pantry run — the need hasn't gone anywhere.
  I'm still asking." Player commits ("I'll come back to help.");
  "Then it's set. The creek bend, past the treeline, morning, early.
  Two packs between us." A want, an engage, a resolution with a
  place and a time. Real.
- 85004 d90, Joaquim (teacher, sardonic, trust 37), want none: NO
  shared language — Portuguese only, mime, nodding. The mime IS a
  want ("come with me," pointed at the ridge) but the menu offers
  only nonverbal nods + leave, so it can never be followed through
  the menu. The scene is honest about the barrier (five nods, "a
  promise without words"), and its thinness is the barrier's, not a
  fabrication's. A real player in this scene also has only nods.
- 85004 d120, Zhanibek (roofer, mischievous, trust 90), want curious
  stage 1: "Is there someone here you don't trust? Be honest."
  Player tells without naming; "Noted. I'll watch too." — a small
  plant (shared watchfulness). Then goon: "The warmth pulls back a
  notch. They're weighing something." — a consequence for
  overstaying, legible. Closes "Good talk." Real, small, complete.
Verdict: 3 of 4 read as people with wants and consequences; Nora d90
is thin-by-menu (not by content); Joaquim d90 is honest about its
barrier. The structural finding across all four + Q2: wants live
behind dlg:subject, and the control picker never opens that door —
so sim transcripts systematically under-sample engaged wants. That
is a measurement-coverage note for future people checks, not a game
verdict: a real player taps "Can I ask you something else?" and the
menu (Q2's probe) is where the answer lives or fails.

### 5. FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: yes for the climb's machinery — courts, covenants,
  pilgrimages, first courts, and priced table voicing all fire in
  ordinary play on the current base. But the climb's DESTINATION got
  thinner: national arrives on 1 of 4 armor-era seeds, and at the
  wire (day 179). A player climbing now should expect a late, thin
  national, not the r51 picture (national by ~day 100–140).
- FUN: mixed, same mix as r52 with one sharpening. The table voicing
  is the leg's best writing — the pellet's price ("THE WORDS WERE ON
  THE WRAPPER") is a real consequence for a real choice, and the
  fireside table talk reads as story told back. The texture problem
  is now pinned, not vague: stage-0 wants go silent (Q2), and sim
  people-checks under-sample engaged wants because the picker never
  opens the subject menu. Neither is a missing system.
- WINNABLE: not shown, again. The lesser seat waits, priced, on 3 of
  the 4 armor-era quad seeds (85002 has no seat at all); the full
  seat stays unwon (w5 0). The scale leg's win path remains the
  standing open question, now with two confounds named for the next
  measurement: armor (needs the on/off panel) and the pellet (a
  player choice that prices the run out of feast deeds).

## Village assessment (plain words)
- **85002 — the village that ate the future and then scattered.**
  It climbs to arc 3, takes the fusion pellet (never hungry again —
  and the table notices), sews real armor (Jian, Sanne twice, Dale,
  Chantal), holds three covenants at middling trusts (33/26/26) —
  and still ends scattered on day 178, pantry empty on the fifth
  hungry day, two people left walking in different directions. What
  was missing was not gear or deeds (waves to 4, contests in the
  ledger); it was food in the pantry at the end, and enough people
  to hold the fire. The pellet's irony is legible: never hungry
  personally, starving as a village.
- **85004 — the village that climbs at the wire.** Seven of seven
  alive at the day-181 cap, pantry 25,536, national since day 179
  (first court day 178), three covenants strong (51/51/50), lesser
  seat waiting at arc 4, armor sewn and worn all over (Gonca four,
  Pooja two, Lerato three). It also took the pellet, and the table
  told it plainly that no feast can carry the surge while the pellet
  hums. This is the picture of a village that could sit a lesser
  seat — priced, warned, and still standing. What it could not do,
  on any seed this cycle, is reach the full seat.
- **Barrier pin (standing instrument, re-confirmed):** barrier line
  count 0 on both new seeds; sayOncePerFight calls are all real
  mid-fight non-barrier refusals (85002: boilWater "finish it first"
  d81, sleep d161; 85004: sleep d26/d67/d127/d142/d143). The r52 pin
  stays closed — no barrier call logged on any seed this run.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant trusts).
- Barrier instrument is standing telemetry, not a new metric. The
  CHOICELOG line added to the driver for the Q2 probe is env-gated
  (default off) and logs only menu choices the engine already
  offered; it changes no engine input.
- The quad count is a new descriptive summary, not a re-score of any
  prior verdict: r52's DIVERGED stands, r52's armor attribution
  (same-lineage pair) stands, the barrier pin stays closed unless a
  run logs a barrier call (none did).
- No metric was re-scored mid-run. Q2's probe runs were ADDITIONAL
  measurements for the prereg's NEEDS-PROBE branch (the probe
  instrument already existed as WANT_SUBJECT=1 in the driver, and
  the CHOICELOG line was added before the probe ran, not after its
  result was known) — they answer the prereg's question with
  evidence instead of leaving it specified-but-unrun. The verdict
  rule (CONTENT-EXISTS / CONTENT-GAP / NEEDS-PROBE) was applied to
  the probe's result, not changed to fit it.
- Q1's audit rule was applied as written: first divergence not in
  the stash class → reported as unexplained drift, NOT attributed
  to armor, even though the census moved in the same direction as
  r52's armor move.

## Telemetry deviation check (step 14 — NOT rolled, thirteenth confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-29/journey-scale-r53/journey-scale-r53-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=3 files)" —
the same vacuous shape mismatch as r42–r52 (the journey trust JSONs do
not carry those fields at all; n=3 here because the 85003 probe's
trust JSON is a third file). Verdict: NOT a real deviation. NOT rolled.

## Tests
- `node --check` clean on the r53 driver (at creation, and again after
  the CHOICELOG line was added, before the probe ran).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  (filled at closeout — see CHECK-QUICK section below.)
- Zero src/js changes, so no game-code regression surface exists in
  this run's change set; the suite below is the standing proof, not a
  response to a suspected regression.

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**284 passed, 6 failed in 515s** (290 scripts — IDENTICAL profile to
r52's 284/6). The 6 in-suite failures are the SAME six r52 recorded as
pre-existing (measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-racks-full) — and this run's change set is one driver
script plus evidence, zero src/js, and no quick-list test imports the
new script, so nothing here can have caused them.
Verdict: zero regressions attributable to this run.
Worktree status after the suite: only this run's entries — no
suite-touched ontology or stray evidence writes.
