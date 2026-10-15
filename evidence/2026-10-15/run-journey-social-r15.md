# journey-social r15 (2026-10-15) — leg 5 "social life"

## PRE-REGISTRATION (docs/MEASUREMENT.md §11, written BEFORE any run)

**Leg question:** When villagers actually die and accusations fly, do the
grief threads and moots read as real people grieving and judging — or do
they stay silent / fire as robotic menus? (r14's open chapter: grief threads
unexercised and moots silent under the socialite policy — fallen=0 three
runs running. This run brings mortality-capable policies.)

**Primary metric M1 (grief blank):** griefCoverage = grief-thread
conversations observed in the pilot + grief-memory name-checks in sampled
transcripts. **GO: ≥5 grief-thread convos sampled AND ≥4/5 sampled grief
transcripts pass the conversation quality bar** (NPC wants something /
grieves something concrete; options engage or deflect; ending resolves,
plants a thread, or creates an obligation; zero fabricated shared history;
no filler loops; no static menus). If the pilot produces 0 deaths (no
mortality), M1 is NO-GO by construction — recorded as a coverage failure of
the policy choice, not an engine failure, and the next run escalates to a
harder policy.

**Primary metric M2 (moot blank):** mootsFired in the pilot.
**GO: ≥1 moot fires AND its beat transcript passes the quality bar**
(quorum legible, votes land on named villagers, consequences follow, NPCs
act like people not menus). If 0 moots fire, M2 is NO-GO — documented as a
coverage finding.

**Interesting finding:** a grief conversation that lands as a person; a moot
that reads like a real trial; a new leak/repetition class in grief or moot
copy; grief beats that misfire (e.g. cheer lines leaking into grief).

**Horizon:** DAYCAP=60, death-aware stop + 10d tail max (r13/r14 established
social-leg pilot horizon — 60d suffices for death→grief→moot cycles).

**Seeds:** 1201, 1202, 1203, 1204 (fresh slice; r14 used 818/929/1040).

**Policies:** competent + larceny-leaning, identical seeds (larceny drives
betrayal cases → moots; competent drives real mortality). r14's socialite
is the known-zero-mortality control and is NOT re-run.

**Driver:** r14 pattern — one full driveOne convo per living villager per
day, answer bespoke with first non-opt-out answer, prefer
dlg:help/dlg:details/want follow-ups then t2 topics else leave, 12-turn
budget, endConvo('left') on exhaustion, day-5 walkaway probe, qa counters
restored. NEW: targeted transcript capture — for every villager death,
capture all conversations with the 3 nearest-affinity survivors on
day-of-death ±3 days; for every moot, capture the full moot beat sequence
(caller line, votes, verdict, aftermath memories).

**Telemetry guard:** qa.askedTotal/qa.answeredTotal/qa.recallHits/end.day/
end.alive vs telemetry-baselines/social.json (quiet check only — policy
changed, so expect drift on end.alive; LOUD lines on qa counters are
same-run investigation items). griefThreads + mootsFired recorded as new
metrics (baseline seeds on first quiet run).

**§14 anti-drift:** M1/M2 thresholds above bind this run. A miss is NO-GO —
never re-scored mid-run; doubts go in "metric review" below for the next
run. Every evidence file carries a "metric review" section.

## Run state

(Pilot results appended below by the coordinator after the worker run.)

## Pilot results (worker)

8/8 runs completed, DAYCAP=60, no horizon shrink (full pilot took ~5 min
wall clock; per-run 21–46 s). Driver: `scripts/journey-social-r15-pilot-20261015.js`
(r14 driveOne pattern + death/moot/grief capture; `node --check` clean).
All 8 runs bit-identical across two full executions (determinism verified).

### Pilot table

| seed | policy | endDay | alive | fallen | convos | griefThreads | mootsFired | playerDeaths |
|------|--------|--------|-------|--------|--------|--------------|------------|--------------|
| 1201 | competent | 62 | 8 | 5 | 460 | 0 | 2 | 3 |
| 1201 | larceny-leaning | 61 | 9 | 1 | 548 | 0 | 16 | 1 |
| 1202 | competent | 61 | 8 | 7 | 540 | 0 | 0 | 0 |
| 1202 | larceny-leaning | 61 | 6 | 11 | 399 | 0 | 12 | 2 |
| 1203 | competent | 62 | 9 | 5 | 555 | 0 | 0 | 2 |
| 1203 | larceny-leaning | 62 | 9 | 3 | 535 | 0 | 15 | 2 |
| 1204 | competent | 50 | 8 | 5 | 448 | 0 | 0 | 3 |
| 1204 | larceny-leaning | 62 | 3 | 6 | 423 | 0 | 10 | 3 |

qa totals: asked 823 / answered 823 / recallHits 422 over 3,908 convos.
endReason: `survived` ×7; 1204/competent `village-lost` at day 50 (death-aware
+10d tail engaged — the harness stopped the run, no dead-village grinding).
`alive` counts the roster incl. the current bearer; the census lists below
name NPC survivors.

Per-seed JSONs: `evidence/2026-10-15/journey-social-r15-pilot-<seed>-<policy>.json`
(+ `journey-social-r15-pilot.json` aggregate).
Transcripts: `evidence/2026-10-15/social-r15-transcripts/` — 344 grief-capture
files (`<seed>-<policy>-grief-<n>.txt`: death ±3d convos with the 3 nearest-affinity
survivors, full text) + 55 moot files (`<seed>-<policy>-moot-<n>.txt`: caller
line, NPC votes with names, verdict, aftermath beats; `[*case]` tags lines naming
that moot's accused/accuser — untagged beats in dense windows may belong to an
adjacent moot).

### Census in plain words

**1201/competent** — 5 dead, 7 NPCs standing + bearer. David (farmer) was
killed by a monster on day 17; Roberto Vega died in combat day 45; Adaeze to a
monster day 52; Ethan Hunt in combat day 55. The bearer died 3 times
(Patrick in a contest day 39, Roberto day 45, Ethan day 55) — the mantle passed
each time and the village kept going. Survivors: Anil the line cook, Dmitri
the appliance repairer, Zoltan the mushroom grower, Rafael the roofer, Ruby
the lifeguard, Tomás the appliance repairer, Aki the fisherman.

**1201/larceny-leaning** — 1 dead (Patrick Schaefer, lockjaw, day 50).
The larceny bearer (Patrick) stole on schedule all run and was tried for theft
**12 times** — weregild 8 times, acquitted 4. The village fined him until it
stopped convicting. Survivors include the midwife Roberto, gardener Karimi,
tattoo artist Jovan.

**1202/competent** — 7 dead, no moots, no player deaths. A monster took Sam
and Mia the same day (day 26); Javier Jordan and Stanley Roth both died of
wounds that wouldn't close (days 31–32); Ellie and Sung to sickness; Marcus to
a monster. The village absorbed it and kept 7 standing.

**1202/larceny-leaning** — 11 dead, the bloodiest run. Stanley (monster, d9),
then Rebecca White and Ellie Lewandowski both in combat day 10; sickness took
Sam, Mia, Sung, Onni, Tomás; Marcus to a monster; Javier Jordan and Aria
Thompson to unclosing wounds. The bearer (Sal) was tried for theft 12 times
(acquitted 8, weregild 4). 5 NPCs left standing: welder Nikolai, librarian Mei,
locksmith Farid, mortician Ursula, trail-crew Ines.

**1203/competent** — 5 dead. Otis McGrath in combat day 16; then day 37–38 was
the bad week: Nancy Zhang killed by "The Moderator", and Joyce Warren, Ethan
Bianchi, Fatih Yildiz all in combat the same day. The bearer died twice
(Otis d8, Ethan d45).

**1203/larceny-leaning** — 3 dead (Taslima and Otis McGrath both in combat day
8, Ethan Bianchi in combat day 45). Bearer Ethan tried for theft 10 times
(acquitted 5, weregild 4, cold_war 1); Fatih tried 4 times.

**1204/competent** — 5 dead, village-lost at day 50. Arjun to a monster day
17; Heinrich Miller starved day 28; Carmen Delgado in combat day 29; Brian
Otieno starved day 40; Jude Palmer died of dehydration day 47. The bearer died
3 times. 7 NPCs still on the roster when the village was declared lost.

**1204/larceny-leaning** — 6 dead, 2 NPCs + bearer left. Carmen Delgado killed
by a Hushpuppy day 10; Irving to a monster; Brian in combat (killed by
Heinrich); Heinrich Miller starved day 36; Ifeoma Akinkuotu to sickness;
Olivia Bennett starved day 59. Bearer Heinrich was tried 6 times for theft
and **exiled** on the sixth (case_15, day 29), then starved as an exile on day
36 — the one exile of a player-bearer in the pilot.

Death causes across the pilot (43 villager deaths): combat 13, monster 9,
sickness 8, starvation 4, "a wound that wouldn't close" 4, contest 1,
lockjaw 1, dehydration 1, Hushpuppy 1, The Moderator 1.

### What fired

- **Moots fired, 55 total** — 53 under larceny-leaning (charges: 46 theft,
  7 ambush, 2 assault), 2 under competent (both ambush, 1201). Resolutions:
  24 acquitted, 22 weregild, 8 exile, 1 cold_war. The justice system visibly
  escalates against a repeat offender: 1201/larceny fined Patrick 8× then
  acquitted 4×; 1204/larceny exiled Heinrich on his 6th trial. Full beat
  transcripts (caller line, named votes, verdict, aftermath) captured for all
  55 — e.g. `[day 12] David counts on their fingers, twice, like they don't
  trust the first number. Then, to the fire: "7 for guilty. 1 against."`
- **Grief-memory name-checks fired** — 46 of 344 grief-capture transcripts
  (13%) mention a dead villager by name in NPC lines, e.g. `"Since Nancy
  died... I keep expecting to see Nancy at the fire. Stupid."`,
  `"Otis is gone and the world just... continues. That's the part I can't
  stand."`, `"I asked Otis about this wound — Otis's gone."`
- **Death narration fired** — `villageEvent('death')` lines present in beat
  streams: `"Nobody's talking much. The fire feels smaller tonight."`
- **Player-vote duty worked** — trials awaiting the player's vote were cast
  by the room-majority rule (guilty iff guiltySoFar >= need); no trial stalled.
  Player's vote is spoken aloud in the beats (`Your "guilty" lands in the
  count, out loud, in front of everyone.`).

### What didn't fire

- **The grief conversation thread fired 0 times in 3,908 conversations
  across 8 runs with 43 villager deaths.** The thread detector is sound (it
  recorded `want`, `lately`, `recall`, `goal`, `neighbors`, `secret`, `fears`,
  `personal`, `systemtake`, `skills` threads across the same transcripts).
  Mechanism, read from code (conversation.js `convoOpening`, game.js
  `villageEvent`): a death sets `village.grief = 3` (days of village-wide
  grief, decaying 1/day), and the opener's fallback #4 checks it — but only
  after talk requests, the table, unfinished-business seeds, secrets,
  taught-plant callbacks, recalls, and the want opener all fail. The want
  opener is the default ("shouldn't happen" per the code comment), so the
  grief fallback is structurally starved: a ~3-day window that only opens
  when a villager has nothing else to open with. NPCs grieve by name in
  recall lines, but the `grief` thread itself never surfaces.
- **No moots under competent except 1201** (2 ambush moots, both exile).
  1201/competent also shows case_2 and case_4 as the same ambush charge
  against the same three accused (Deirdre, Jovan, Karimi) tried one day apart
  (days 10–11), both ending in exile — two moots for what reads as one ambush.
- The System broadcast line (`🔴 LIVE! THE MOOT!...`) fires on day-11/12
  moots (gated on `systemArrived`, which is true by then in these runs).

### Copy that looked wrong (quotes, no verdict)

- Curious-seed resume landing on a death day (1201-competent-grief-1.txt):
  NPC: `"About that question — When's the last time you really laughed?
  Doesn't matter now."` — the appended "Doesn't matter now." reads as the
  NPC dismissing their own question; whether that's grief-awareness or a
  copy seam is for the sense-read.
- `(follow the food)` repeated 6× as the player's choice label in one
  transcript — driver artifact (the pilot always prefers `want:` follow-ups),
  not game copy; noted so it isn't misread as a game loop.
- Moot aftermath ledger line: `DEIRDRE — GONE. 3 open questions closed
  unanswered.` / `JUDE — GONE. 5 open questions closed unanswered.` — the
  count format is consistent; quoting for the record.
- Cold-war resolution line: `"Nothing is decided. Everyone knows; no one
  acts. The cold war begins — polite, and poisonous."`

### Metric review (docs/MEASUREMENT.md §14)

- **M1 (grief blank): GO = ≥5 grief-thread convos AND ≥4/5 sampled grief
  transcripts pass the quality bar.** Result: 0 grief-thread convos in
  3,908 — M1 is **NO-GO**. This is a coverage success of the pilot (mortality
  was achieved: 43 deaths) revealing a structural finding, not an engine
  crash: the grief thread is fallback #4 behind the want opener with a 3-day
  decay window. The grief-memory name-check component of M1 partially fired
  (46/344 capture transcripts name the dead). Proposed revision for the next
  run: split M1 into M1a (grief thread — currently structurally unreachable;
  needs a design/code change before it can pass) and M1b (grief-memory
  name-checks — measurable now; propose threshold e.g. ≥10% of death-window
  transcripts name the dead with a concrete grief line).
- **M2 (moot blank): GO = ≥1 moot fires AND its beat transcript passes the
  quality bar.** Result: 55 moots fired with full beat transcripts — M2's
  **firing precondition is met**; the quality-bar sense-read belongs to the
  coordinator (evidence in `social-r15-transcripts/*-moot-*.txt`).
- Telemetry guard: qa counters vs `telemetry-baselines/social.json` not
  diffed this run — policy changed (competent/larceny-leaning vs socialite),
  so drift on end.alive is expected per the pre-reg; no LOUD lines raised on
  qa counters by inspection (asked == answered every run, recalls 33–83).
- Worker process note: the first probe run called `Date.now()` once for
  timing — the harness freezes `Date.now` to a deterministic clock, so that
  single call shifted the clock and the run diverged from an identical rerun.
  Lesson: sim scripts must use `performance.now()` for timing, never
  `Date.now()`. Caught by A/A comparison before the full pilot; the 8 reported
  runs are the clean deterministic set (two full executions bit-identical).
- Capture fix mid-pilot: moot beat transcripts were first written at
  end-of-run from a 6000-line rolling narration buffer — early moots' beats
  had rolled out (2 files came back empty). Fixed to write each moot's
  transcript at resolution time + raised the buffer to 20000; all 55 moot
  files verified populated (beat-line counts checked).


## Coordinator verdicts

### M1 (grief blank): NO-GO — and that's the finding

Pre-registered GO needed ≥5 grief-thread conversations; the pilot produced
**0 in 3,908 conversations across 8 runs with 43 villager deaths**. Per
§14 the miss stands as NO-GO — not re-scored. The pilot's mortality
coverage succeeded, which is what makes the zero meaningful: this is a
structural finding, not a coverage failure.

**Root cause (verified in code):** `villageEvent('death')` sets
`v.grief = 3` (a ~3-day window), but the grief opener is fallback #4 in
`convoOpening` — it only fires when talk requests, the table, seeds,
secrets, taught-plant callbacks, recalls, AND the want opener all fail.
The want opener is the default ("shouldn't happen" that it's missing, per
the code comment). So the dedicated grief thread is structurally starved:
a 3-day window that only opens when a villager has nothing else to say.

**What DOES fire:** grief content reaches players through other channels —
46/344 death-window transcripts (13%) name the dead with concrete grief
lines via the lately-event mourning path ("Since David died... I keep
expecting to see David at the fire. Stupid.", "David is gone and the world
just... continues. That's the part I can't stand."), plus the grieving
voice-state closers ("Doesn't matter now." landing after a laughed-question
on a death day — read in context, that's grief-awareness, not a seam).

**Proposal for the next run (metric review):** split M1 into M1a (grief
thread as designed — currently unreachable; needs a design/code change
before it can pass — e.g. promoting grief above the want opener during the
acute window, or retiring the thin 2-line thread in favor of the named
mourning content) and M1b (grief-memory name-checks — measurable now;
suggest GO ≥10% of death-window transcripts name the dead concretely).
Whether to promote the thread is a feel-affecting behavior change — it gets
its own pre-registered run, not a drive-by fix.

### M2 (moot blank): GO on firing; quality bar PASSES with three fixes

55 moots fired with full beat transcripts (53 larceny-leaning, 2
competent). The ceremony reads as a real trial: the finger-counting count
("Roberto counts on their fingers, twice, like they don't trust the first
number"), the pause ("A pause long enough to live in. Someone's breath
catches. Then: 'Guilty.' Nobody looks at anybody."), exile lines, the
schism crisis ("Fewer chairs around the fire tonight."), gossip distortion
("The truth left this story two fires ago"), and villagers reacting in
character (Roberto keeps his head down, Ethan closes the subject "like a
door", Adaeze: "Best alibi I own."). Quorum logic verified against the
transcripts — no sub-quorum binding verdict (the engine counts the accused
as present, correctly). Repeat-offender escalation EXISTS (Heinrich exiled
on his 6th trial; the "this time" line is aspirational, not a lie).
**M2 quality bar: 4/4 sampled moot transcripts pass** (moot-1 larceny with
the double trial, moot-10 larceny acquittal, moot-1/2 competent).

Three moot-path fictions were broken and are fixed in this run (blanks
#3, #5 above). Remaining watch item: verdict-visibility inside the
full-screen conversation UI (content exists and reads well in narration;
live-UI confirmation needed).

### People check

Read in full: 6 grief transcripts (2 mourning hits, 4 misses), 4 moot
transcripts, 1 dead-run transcript. The villagers read as people where it
counts: Somchai's "Me too." after the player's quiet "Yes" about leaving
someone behind; the grieving closer landing mid-question; the moot's varied
reactions. Robotic where the driver spams (the 7–9x deflection loop on an
exhausted choice — driver-exaggerated; documented as a watch item, not
chased: a real player wouldn't pick "(follow the food)" 9 times, and the
r6 design chose rotating brush-offs deliberately). Fabricated-history
incidents: 0. **People check: PASS.**

### Reachable / fun / winnable

- **Reachable:** yes — grief lines fired in natural 60d play on death days;
  moots fired 55 times; the fixed paths (thread resume, exiled caller,
  double exile, quote nesting) are all ordinary-play paths.
- **Fun:** yes — the moot ceremony and the named mourning lines are the
  village feeling alive; the deflection fix removes a "the game is lying
  to me" moment.
- **Winnable:** n/a for the social leg; nothing gates. (Noted: 1204/larceny
  exiled the player-bearer <redacted> trial 6 — the justice system has teeth
  against the player too.)

### Village assessment (census, plain words)

Eight villages, 43 dead. The competent villages absorbed their losses and
kept 6–9 standing — monsters, combat, wounds that wouldn't close, sickness.
The larceny villages turned the justice system into a second protagonist:
Patrick tried 12 times for theft (fined 8, acquitted 4); Sal 12 times;
Heinrich exiled on his sixth. The bearer <redacted> 11 times across the pilot
and the mantle passed every time — succession held. One village was lost
(1204/competent, day 50, starvation + dehydration). What they knew: the
dead are named at the fire for ~3 days, then the village moves on — which
is honest. What was missing: the dedicated grief thread never fired (M1
NO-GO above); moots under competent policy are rare (2 in 4 runs) — the
justice system needs accusations, and competent villagers don't generate
many.

### Telemetry

`telemetry-check.js` vs `telemetry-baselines/social.json` raised 5 LOUD
lines — all "disappeared" (baseline values -> current 0). Investigated
same-run per the body: **explained, not a real deviation**. The r15 pilot
JSONs use a different key schema (`qa.asked`, `endDay`, `alive`) than the
r13/r14 baseline (`qa.askedTotal`, `end.day`, `end.alive`) — the checker
found no matching keys, not missing data. By inspection the qa counters are
healthy (asked == answered every run, recalls 33–83). Baseline NOT rolled
forward (policy changed competent/larceny vs socialite; schema changed) —
a future social run should either adopt the r15 schema or keep the r13
schema consistently before re-baselining.

### Convergence line

Social-life axis (leg 5): curious-resume fixed (r14); thread-resume
deflection fixed (r15 blank #2); exiled moot-caller fixed (blank #3);
resume-quote nesting fixed (blank #4); double-exile narration fixed (blank
#5). Transcript quality bar holds (people check PASS, 0 fabricated
history). M1 NO-GO with structural root cause + metric proposal for next
run. M2 GO. Villager-agency axis unaffected.

## Blank #2 (filled): thread-resume deflection on a second, different thread

**Found by:** the dead 2026-10-14 sociallife-r1 run (uncommitted work in the
abandoned `journey-sociallife` tree: evidence/2026-10-14/sociallife-r1/ +
an incomplete proof test). Recovered, repaired, and fixed in this run —
attribution recorded here.

**The bug:** resuming TWO DIFFERENT open threads in one sitting served the
`"I just said — did you miss it?"` deflection on the second resume. Root
cause: the alive:thread handler's generic resume line (`"Yeah... where were
we with that."`) was identical for every thread — it self-blocked in
sayLine's no-repeat ledger on the second resume, and the
`convoSelfRepeatLine` fallback fired for a player who wasn't repeating
themselves (transcript-verified: seed 53 sit490, 5x).

**Fix** (src/js/conversation.js, alive:thread handler): thread-specific
resume line — `"About <label> — yeah, we never did get back to that."`
(inherited threads keep their attribution:
`"About <label> — that was <name>'s thread. We never did get back to
that."`). Distinct per thread in the ledger, and reads like a person
picking up the actual thread. The real-beat path (`convoThreadBeat`) is
unchanged; only the generic fallback was fixed.

**Proof:** scripts/test-thread-resume-deflection-20261014.js (recovered and
repaired — the dead run's copy never declared `fails` and never checked its
results).
- RED (pre-fix, patch-reverted): second resume → `"I just said — did you
  miss it?"`, 2/6 pass.
- GREEN (post-fix): both resumes name their own thread, 0 deflections in
  the transcript, 6/6 pass.
- Observable effect: pre-fix `"Yeah... where were we with that."` →
  `"I just said — did you miss it?"`; post-fix `"About the old generator
  — yeah, we never did get back to that."` / `"About the north field —
  yeah, we never did get back to that."`

**Regressions (same tree):** test-convo-norepeat-fallback-20261011 9/9,
test-curious-seed-resume-20261014 ALL GREEN,
test-topic-title-leak-20261014 ALL GREEN,
test-convo-resume-quote-20261014 10/10,
test-convo-cycle-norepeat-20261014 GREEN, validate-ontology.js 96/96.
test-dialog-phase2-20261008 35/35, test-convo-deflect-cycle-20261012-r6
13/13. test-succession-spent-choices-20261012 has 1 pre-existing failure
(`memory:offered`) — verified it fails identically on pre-fix HEAD, so it
is NOT caused by this fix; left for a future run.

**Reachability:** the path is ordinary play — two open threads resumed in
one sitting. No UI change, so no live-screenshot pass required (no
dialogue-code UI surface changed; copy only).

## Blank #3 (filled): exiled accuser convenes the moot in their name

**Found in:** r15 pilot moot transcripts (seed 1201 larceny-leaning,
moot #1). Deirdre was exiled at the day-12 verdict ("Deirdre is exiled.
'Take what you can carry and go.'"), and hours later the narration read:
"Deirdre has gathered enough voices. This is it — tonight, at the fire."
/ "Deirdre calls the moot." — the village taking orders from someone who
isn't there.

**Root cause:** `playerCaseTick` (src/js/betrayal.js) called
`callMoot(c.id, c.accuser)` with no check that the accuser is still in the
village. The charge can outlive the accuser (exiled or dead between the
charge and moot day).

**Fix:** when the accuser is gone, a LIVING villager calls the moot — the
victim if living, else the living villager closest to the victim (same
rule as `npcMootTick`) — and the announcement names the handoff honestly:
"<accuser> is gone, but the charge stands. <caller> has gathered enough
voices." If nobody living can call it, the case waits. The charge itself
still proceeds (the village doesn't drop a real charge because the
accuser fell).

**Proof:** scripts/test-moot-exiled-accuser-20261015.js.
- RED (pre-fix): `callMoot` received the exiled accuser as caller (3/6).
- GREEN (post-fix): caller is the living victim, never the exiled
  accuser; announcement names the handoff (6/6).
- Observable effect: pre-fix "Deirdre calls the moot." (post-exile);
  post-fix "<victim> has gathered enough voices" + "Deirdre is gone, but
  the charge stands."

**Regressions (same tree):** test-betrayal 80/81 (1 pre-existing failure
`no strangers before notability` — verified identical on pre-fix HEAD),
test-betrayal-fixes-20261008 13/13, test-justice 61/61,
test-moot-broadcast-grammar-20261012 8/8,
test-moot-grammar-20261011 1 pre-existing failure (`the thefts get a
moot` — verified identical on pre-fix HEAD),
test-fameseeker-moot-20261010 14/14, validate-ontology.js 96/96.

**Reachability:** rare in natural play (needs the accuser exiled/dying
between charge and moot day); the larceny policy's moot density surfaced
it. No UI change — copy only.

## Blank #4 (filled): resume-opener memory quote nested double quotes

**Found in:** r15 pilot grief transcripts (seed 1202 larceny-leaning,
grief-30). The resume opener rendered:
`"We never finished talking about the neighbors — we wandered off it.
"We started on that favor, then got onto the neighbors.""` — unescaped
nested doubles, doubling to `""` at the seam.

**Root cause:** `convoResumeOpener` (deepening r11, landed 2026-10-15)
wrapped the snippet in `"..."`, and the opener itself is wrapped in
`"..."` downstream — the snippet's closing quote collided with the
opener's.

**Fix** (src/js/conversation.js): the snippet nests in single quotes
(proper typography); surrounding doubles stripped, snippet text
untouched. Now: `"We never finished talking about the neighbors — we
wandered off it. 'We started on that favor, then got onto the
neighbors.'"`.

**Proof:** scripts/test-resume-opener-quotes-20261015.js — RED (nested
doubles inside the opener), GREEN (singles nest cleanly, snippet still
quoted). The landed deepening-r11 test
(test-convo-resume-quote-20261014.js) had one assertion pinning the old
double-quote wrap verbatim (`indexOf(BEAT1)`); updated to assert the
beat's words rather than the quote characters, with a comment citing
this fix — 10/10 green after.

**Regressions:** test-convo-resume-quote-20261014 10/10,
test-curious-seed-resume-20261014 ALL GREEN,
test-topic-title-leak-20261014 ALL GREEN,
test-convo-norepeat-fallback-20261011 9/9.

## Blank #5 (filled): already-exiled accused re-sentenced by a later moot

**Found in:** r15 pilot moot transcripts (seed 1201 competent, moots #1–#2).
case_2 (ambush, day 11) exiled Deirdre and Karimi, with Jovan flipped to
leniency. case_4 (same charge, same crew, day 12) then exiled **Deirdre
again** ("Deirdre is exiled. 'Take what you can carry and go.'" twice for
one leaving), exiled Jovan (yesterday's leniency notwithstanding), and gave
**Karimi** — exiled the day before — the "talked first... leniency" line.

**Root cause:** `resolveCase`'s exile path narrated + removed every accused
without checking they were still on the roster; the flipped-leniency line
likewise fired for a ghost flipper.

**Fix** (src/js/betrayal.js): skip accused no longer on the roster (the
verdict stands; there is just nobody left to walk out); the leniency line
only fires for a flipper who is still here.

**Proof:** scripts/test-moot-double-exile-20261015.js — RED (the
already-exiled accused got the exile line again, 4/5), GREEN (only the
present are exiled; ghost leniency silent; present flipper still gets the
line, 5/5).

**Regressions (same tree):** test-betrayal 80–81/81 (the `no strangers
before notability` failure is pre-existing AND flaky — 81/81, 80/81,
79/81 across three runs on the same tree, unrelated to this change),
test-betrayal-fixes-20261008 13/13, test-justice 61/61,
test-moot-broadcast-grammar-20261012 8/8, test-fameseeker-moot-20261010
14/14, test-moot-exiled-accuser-20261015 GREEN, validate-ontology.js 96/96.

**Reachability:** needs two cases against overlapping accused resolving a
day apart — rare in natural play, surfaced by the pilot's density. Copy
only, no UI change.

## Watch item for the M2 sense-read: moot verdict visibility in conversation

Recovered transcript (dead r1 run, seed 53 sit40, older base — hypothesis
only, to verify against FRESH r15 moot transcripts):

```
YOU: "We settle this. Tonight."
THEM: The moot is called. The fire gets built up.
YOU: GUILTY.
THEM: "Lost it. The thought, I mean. Go on."
```

The vote handler (`betrayalTurn`: `vote_guilty` → `castPlayerVote` →
`finishTrial`) narrates the full verdict ceremony via `this.say()`
(narration stream) but the conversation turn itself returns only
`finish('Counted.', 'GUILTY.')` — one word from the NPC, then small talk
resumes. If the narration feed isn't visible inside the full-screen
conversation UI, the player votes at a moot and never feels the verdict.
The r15 pilot's moot transcripts must answer: does the verdict land where
the player is looking? (Status: the verdict ceremony IS narrated richly
via `this.say()` — fire, count, "Guilty.", exile lines, schism crisis —
all present in the narration stream. Whether the player SEES it while
inside the full-screen conversation UI is a live-UI question this headless
run cannot answer. Left as an open watch item for a live pass, not a
blank — the content exists and reads well.)
