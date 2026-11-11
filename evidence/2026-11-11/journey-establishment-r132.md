# Journey r132 — establishment, Lane A (2026-11-11)

Leg 1, days 14–40, 42-day horizon. Original run
`playtest-loop-a-20261111T1245Z`, adopted and finished by the
`2026-11-11T1945Z` occurrence (same schedule, same leg — see Adoption
below). Branch `journey-establishment`, base local master `3b4aa8123`
(Loop B vetphantom evidence landing) at registration; rebased onto
`3c6fb7069` (Loop B 1830Z coordinator evidence) before landing — master
had moved to `3eec28a81` and then `3c6fb7069` during the run; the rebase
used the explicit SHA read from the main tree immediately beforehand.
Policy: competent + withDelegate + HUNTSTAFF=2. Seeds 2401–2416 (fresh
band), BEFORE/AFTER pair on the same band. Prereg:
`journey-establishment-r132-prereg.md` (this directory).

## Adoption (stale-lock recovery, 13:45 CST run)

The 12:45 CST run created `playtest-loop.lock` at 18:43:35Z, registered
`journey-establishment` at 19:02:35Z, heartbeated last at 19:27:11Z, and
died in the runtime restart ~19:37Z — the same restart that interrupted
Loop B's flesh-out run. Its work survived intact in the worktree:
prereg, the game.js preserver-cap fix (uncommitted), the r132 driver /
analyzer / proof test (untracked), BEFORE seeds 2401–2404 and AFTER
seeds 2401–2403 (7 valid census JSONs + 7 convo files). No live process
and no live coordinator owned the tree (registry heartbeat 17+ min stale
at the 19:43Z check; `ps` showed only Loop B workers in other trees;
no agent in `subagent.list` owned r132). Per the overlap guard the lock
was deleted as stale, a fresh lock written (run `2026-11-11T19:47:04Z`),
and the tree heartbeated immediately on adoption; a 10-minute heartbeat
loop ran for the rest of this run. This run re-ran the missing legs
itself (BEFORE 2405–2416, AFTER 2404 + 2405–2416) and verified the
orphaned work rather than taking it on trust: all 7 inherited JSONs
re-parsed, the fix diff re-verified byte-identical against the saved
patch before the AFTER panel, the pilot re-analyzed from the files.

## The leg's question (Q1 — does the preserver grant want the cap?)

r131 judged the cook/builder cap GO (cook moves 14/16, builder 3/16,
pace03 cook+builder 0) and left the standing question: ladder-wide
pace03 on the r131 AFTER panel is 1 — Ayan the baker (seed 2312) went
preserver 0→3 on 33 XP in 42 days — and racks pay per-batch with no cap.
Diagnosis (code + r131 panel, verified pre-run): preserver XP comes from
rack resolutions at n units per batch; Ayan's 33 XP came from 13 granting
days / 18 granting resolutions (8 days x 1, 3 days x 2, 2 days x 3) —
she preserves in bursts, and the 2nd/3rd resolutions of a day carry real
units. Butcher does not race (pace03 0 on both r131 panels; kills are
rare enough that the 2:1 dial above rung 5 suffices) and was NOT capped.

## The fix (REJECTED — NO-GO, does not land)

Worktree `src/js/game.js`, preserver grant site only (+16/−1 lines):
the rack-batch grant fires only on the FIRST preserver-granting
resolution per villager per day (`foodXpDay.preserver`, same shape as the
cook/builder caps). Later resolutions still preserve food — only the
specialist XP is capped. Keyed to the grant event, not the cook
resolution: a first resolution that preserves nothing leaves the day's
grant open. Rung (5/15/30) and askSpecialist (+1) unchanged. No
threshold, bar, price, or gate change.

**Verdict: NO-GO — the fix is rejected and does NOT land on master.**
The call-level cap cuts the race but does not stop it (Q1a below), and
the prereg binds the fix to Q1a: "The fix lands ONLY if Q1a passes."
What lands from this run is the measurement (driver, analyzer, prereg,
panels, this note) — the answer to r131's standing question, with the
next dial named in Metric review. The fix's exact diff is preserved in
the Appendix so the next run can re-derive the unit-cap dial from it.
Proof test `scripts/test-journey-establishment-r132-preserver-cap.js`
(**36 passed, 0 failed** on the fix tree — source checks, analyzer
synthetics, live rung/grant events incl. same-day cap and next-day
reset, fix-isolation, det-gate) is NOT landed: it asserts the rejected
fix and would fail on master without it. It stays referenced here, not
committed.

## Pilot (4 seeds, 2401–2404)

- BEFORE reproduces the race (pace03 1 — Carmine is already at 0→3
  territory on the control panel), AFTER shows the cap firing (max 1
  granting preserver resolution per villager-day; BEFORE shows 7
  multi-grant villager-days).
- **Carmine (seed 2403) races THROUGH the cap: preserver 0→3 on 31 XP
  on AFTER.** The prereg's honest-uncertainty case materialized on the
  pilot itself: a daily preserver doing ~3 batches every single day is
  fueled by units, not resolutions, so a call-level cap cannot stop her.
- Trajectories: 2401 byte-identical before/after; 2403 within 72 kcal;
  2402 diverges (pantry 82,315 → 109,615, endDay 43 → 42, alive 10/10)
  — same class as r131's 2304 divergence, one seed's trajectory moving
  when a skill change shifts an assignment. Pilot GO (cap fires,
  preserver XP > 0 on 3/3 after-seeds, convos written, invite rule
  fires) with the 2402 divergence flagged for the full-panel watch.

## Full panel (16 seeds) — VERDICT: Q1 NO-GO

| Metric | AFTER | Bar | Verdict |
|---|---|---|---|
| Q1a preserver pace03 | **1** (Carmine 2403, 0→31 XP) | 0 | **FAIL** |
| Q1b preserver moves | **11/16** | ≥6 | PASS |
| Q1c butcher moves | **4/16**, pace03 0 | ≥10, 0 | **FAIL (moves)** |
| Q1d cook / builder moves | **15/16 / 3/16**, pace03 0 | ≥10 / ≥2, 0 | PASS |
| Q1e spotter foodXp total | **0** | 0 | PASS |
| CAP CHECK multi-grant days | **0** (max/day 1); BEFORE 39 | 0 | PASS (mechanism fires) |
| BEFORE-validity | preserver pace03 **2** (Carmine 37 XP, Elena 32 XP) | ≥1 | VALID |
| Q2 invitations answered | **20/22 = 91%** | ≥80% | PASS |
| Q3 null THEM lines | **0** | 0 | PASS |
| M3 survive d42 | 16/16 | ≥12 | PASS |
| M4 zero starvation deaths | 16/16 | ≥12 | PASS |

Ladder detail: foodXp totals BEFORE 1472 → AFTER 1374. By task AFTER:
butcher 149, cook 631, preserver 446, spotter 0, builder 148 (BEFORE:
butcher 160, cook 630, preserver 534, spotter 0, builder 148). The cap
removed 88 preserver XP panel-wide (−16%) and halved the racers (BEFORE
pace03 2 → AFTER 1: Elena's 32 XP race is stopped, Carmine's 31 XP race
is not). Grant events AFTER: 289 rack resolutions granting preserver XP
(468 XP via racks, 16 seeds), 171 of 256 hunt kills granting butcher XP
(11 seeds), 685 cook grants (16 seeds), 148 mend grants (5 seeds).
Preserver moves on 11/16 seeds on BOTH panels — the entry rung is not
braked at all. First ladder move lands in d1–d14 on all 16 seeds.
Skill distribution at dEnd (AFTER): preserver skill 3 on 18 villagers
(150 at 0, 4 at 1, 8 at 2); cook skill 3 on 12; butcher skill 3 on 9.

## Metric review

- **Q1a — the call-level cap is the wrong dial for the race.** The cap
  does exactly what it says (0 multi-grant villager-days on AFTER vs 39
  on BEFORE) and still Carmine reaches skill 3 on 31 XP, because she
  preserves ~3 batches on the FIRST resolution of most days. The fuel is
  units per day, not resolutions per day. The next dial is the one the
  prereg named: a **per-day UNIT cap** on the preserver grant (e.g. only
  the first N batches' worth of XP per villager per day counts). The
  number N is pinned by the next run's prereg from this panel's
  cookLog (fx deltas per resolution) — not re-scored here.
- **Q1c — the butcher bar was band-wrong, not a fix regression.** The
  bar (≥10/16) was inherited from r131's 13/16. On THIS band the
  control itself is 5/16 (BEFORE: Vasyl 2402, Ae-ri + Caleb 2403,
  Emilio + Lucas + Caleb 2404, Theo 2409, Caleb 2416); AFTER is 4/16 —
  the only difference is Vasyl on seed 2402, the same seed whose
  trajectory diverged (pantry +27k). Butcher is untouched by the fix
  (no grant-site change, foodXp 160 → 149 is the trajectory noise on
  256 kills vs r131's 319). Per §14 the miss stands as a miss, but the
  attribution is a metric issue: the next run should bar butcher moves
  against the control panel (after within a few of before), not against
  r131's band. Q1c's pace03 half (0) passed.
- **Q1b is the good news the NO-GO hides:** preserver moves 11/16 on
  both panels — capping the top never touched the entry rung. A unit cap
  must be judged against the same bar (≥6/16): if it brakes the entry
  rung while stopping Carmine, it is the wrong dial too.
- **Trajectory divergence is panel noise, not fix harm:** 13 of 16
  AFTER headlines are byte-identical to BEFORE (same endDay, alive,
  pantry). The three movers cut both ways — 2402 pantry up 27k, 2404
  alive 10 → 12 with pantry down 58k, 2413 pantry down 8k — and the
  wave distribution is identical (wave 2: 1, wave 3: 8, wave 4: 7 on
  both panels). M3/M4 are 16/16. No systematic harm signal.
- **Q2's two unanswered invites** are the denominator working as
  designed: Mai (2403, "Come get air with me") and Jacob (2414, "Walk
  my trap line with me?") both offer, then the conversation closes
  without an answer. Declines all came at trust 10–31, accepts at
  trust 41–92 — villagers choose by character, as ruled.
- Two seeds ran to endDay 44 (r131's quirk recurs); M3 reads aliveAt40,
  so no verdict is affected.

## Village assessment (plain words)

Sixteen villages, all alive at day 42 — nobody scattered, nobody
starved (0 starvation deaths on every seed). Deaths run 19–72 per
village over the leg, 9–12 people still standing at day 40, pantries
from ~6.7k kcal (seed 2407, the lean one — 11 alive, wave 3 reached)
to ~136k (seed 2410). Seven villages reached wave 4, eight sat at wave
3, one at wave 2. The fix changed almost nothing about how villages
*live*: 13 of 16 AFTER headlines are byte-identical to BEFORE, and the
wave distribution is identical. What changed is who the people become:
11 of 16 villages end the leg with a self-taught preserver, 15 with a
self-taught cook, 3 with a self-taught builder — and one village in
sixteen still ends it with a preserver who raced to skill 3 in 42 days
on daily rack work alone. Carmine the blacksmith (seed 2403) is that
villager: she cooks, she preserves, she does it every day, and the
first-session-of-the-day rule cannot slow her down, because her first
session already carries three batches. The ladder pays for doing the
work every day; it does not yet pay attention to how MUCH work one day
holds. That is the next build. What the leg still doesn't give anyone
is the spotter's job — a villager can stare at the wild all day and
learn nothing from it, because "faster ID" is still a comment, not an
effect. That blank stands from r131.

## People check (all 16 AFTER convo files read in full, 64 convos)

Conversations hold up as people talking: wants are real (a wound that
needs a second pair of hands, water at 0–9 liters, a taken nephew to
ask the System about, a bond proposal, a secret kept), answers engage
or deflect, endings resolve or plant. The deflection mechanics are the
best thing in the panel: refusing or deflecting visibly cools the NPC
— Tomas (2411) shutters, Keiner (2411) holds you at arm's length,
Sabrina (2415) drops the subject clean, Hector (2415) closes the
favour for good ("They won't raise it again"). The non-verbal
conversations land again (Matteo in Italian, João in Portuguese,
Guillermo in Spanish — the "one English they know" beat recurs:
"Food?", "Water?"). New peaks: the lie-catching gossip (Francesca
2407: Joseph claimed paramedic, was a glazier — "Everyone knew");
the chronicler (Elías 2414: "I record the arguments too... A hundred
years from now someone should know we were here and what it cost");
the joy-forager (Pablo 2416: "Joy is a resource. I'm foraging for
it... I laugh at the System's expense. It's the only currency it
can't tax"); the belonging arc (Hanh 2408: "Home is where they save
you a seat. I'm looking for my seat"); a villager-initiated bond
(Linda 2413: "You and me — we should be bonded. Not just
neighbors."); the theorizing (Kelsey/Marvin: "an experiment someone
forgot to label... nobody's coming to check the results"). Party
naming works and the System's suggestion rotates (THE PROTAGONISTS,
THE NIGHT SHIFT, FINAL GIRLS CLUB, APEX SNACKS); roles assign
(Clarence is Point now). The buried-cache outcome recurs (Farid +1231
kcal, Angelo +1791 kcal) — same outcome, different hands, real
consequence both times.

Still repeating — carried to the next run (deepening, r133):

- **"Something in them almost softens — then doesn't. Not yet." — 9×**
  (r131: 8×). The top canned line, still rising.
- **"They hear the warmth in it." — 8×** (r131: 6×).
- **The taken-kin telling is one template with slots.** The dream
  sentence comes in three wordings (5× "dream about the pods — rows of
  them, humming", 2× "Row on row of them, humming like a held note",
  2× "The pods get into my sleep some nights"), but two NEW kin
  details break the mold: Brayden/Māui's nephew ("The System says the
  little ones are cozy. I do not know what cozy means at that scale.")
  and Emilio's niece Ingrid ("Seven years old and napping. She was
  never boring."), plus Willie's "We had plans. Stupid, small,
  beautiful plans." and Jacob's grandfather James ("He survived two
  wars and a famine. Not interesting enough, apparently."). The frame
  repeats; the kin keep getting more specific.
- **Deflect pivot "Sorry — I shouldn't load that on you. What's up?" —
  4×** (r131: 6×, down). **Gossip closer "Take it for what it's
  worth." — 4×** (r131: 8×, down). **Field-teaching closer
  "Remember the leaf, the stem, the smell — that's the whole of it." —
  3×** (r131: 9×, down sharply). **Quiet-place walk outcome "shows
  you where they go to think. 'Don't tell the others. Everyone needs
  one place.'" — 1×** (r131: 6×). **Stockpile outcome "Take half.
  You've got the hands for it." — 0×** (r131: 2×, gone). The
  repetition is thinning on most lines — except the top two, which are
  climbing.

New sense nits (not pre-registered, documented not fixed):

- **Accept-then-back-out (1×):** Gilberto (2404) accepts a walk
  ("All right. Let's go.") and the outcome immediately says "Maybe
  not today. The fire's got me." — the same line as r131's Hassan /
  Magnus cases, third instance overall. Mitigating context this time:
  Gilberto is SICK (his favor is about being achy and barely keeping
  food down), so backing out of a walk is character-consistent — but
  the line never says he's too ill to walk, so it still reads as a
  contradiction rather than a reason.
- **Stitched fragment (1×):** Heinrich (2414) gossip: "Okay, but what
  about Shanice is back. Walked in like they'd never left." — the
  question fragment "Okay, but what about" glued to a statement; the
  clean form appears in Owen (2415): "I left. Walked back in like I'd
  never left, apparently." Same return-gossip, one stitched, one clean.
- **Recap stutter (1×):** Layla (2415): "We started on that visit,
  then got onto that visit." — the recap names the topic twice.
- **Small stitches:** "Funny thing: Honest. I can work with honest."
  (Sam 2405); "Funny thing: Still on what you miss most." (Marta
  2410); "Can I just say — Anger's a fire..." (Brayden 2406);
  "I hum one note, over and over, when the dark comes when the fire
  gets loud." (Clarence 2408); "It's -- never mind. Forget I said
  anything." (Kelsey 2408).
- The q_think, q_system_fear, q_song, q_change, q_miss, q_first_memory
  and alone-time answers are templates with place/occupation slots —
  the same wording recurs across NPCs (e.g. the experiment-forgot-to-
  label theorizing from both Kelsey and Marvin; the singing answer in
  Columbus / Caracas / Wellington). The slots vary; the frame doesn't.

## Reachable / fun / winnable

- **Reachable:** the ladder pays for work villagers already do —
  preserving the day's catch, cooking the daily meal, mending gear.
  A player watching their preserver will see skill 1 arrive in the
  first fortnight on 11 of 16 villages. Reachable by construction.
- **Fun:** the villages feel lived-in; the deflection consequences,
  the non-verbal convos, the party naming and the lie-catching gossip
  are the fun peaks. The repetition lines at the top ("almost
  softens" 9×, "hear the warmth" 8×) are the drag — hearing the same
  beat from the ninth villager is where the illusion thins.
- **Winnable:** this run doesn't move the win chain (no wave-5, no seat
  work) — it answers whether the ladder's pace can be capped without
  braking it, and the answer splits: the entry rung is safe, the top
  rung is not capped. The race that remains (Carmine) is the next pace
  question, not this run's, and it stands on the same rung the chain
  stands on: villagers who preserve, cook and build are villagers who
  can keep a village fed and geared long enough to face wave 4.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
on the FIX tree (fix in, proof test present): **325 passed, 15 failed**
(813s, exit 1). Log
`evidence/2026-11-11/journey-establishment-r132-gate.log`. Adjudication
by serial re-run of every failing suite on the same tree:
- **12 flakes — all pass standalone:** human-combat-parity (69/0),
  measurement-flags (5/0), measurement-source-text (4/0),
  measurement-cache-flags (4/0), occupation-panels (25/0),
  prepared-runner-custody (4/0), proof-text-identity (9/0),
  telemetry-check-recorder (8/0), foodpower (30/0 — its (g) ontology
  check also passes standalone via `validate-ontology.js`),
  sw-audio-cache (7/7 — gate failure was the EPERM copyfile flap),
  living-garden-deed-attainment and one-person-army-deed-attainment
  (both 120s timeouts in the gate under concurrent load with Loop B's
  own `check.js` run; both pass alone). Several gate failures show the
  EPERM write flap explicitly (`operation not permitted, write /
  copyfile`) — the same flap that hit this run's pre-flight.
- **3 real standing failures (all in r131's 7 too):**
  measurement-proof-update + measurement-workflow — the staleness pair
  ("Proof source inputs are not current"; retained neutrality proof
  does not cover current inputs — the owed refresh since r129, see
  below); phone-frame-proof (3 assertions — retained browser input
  stale).
**No lever-attributable failure. Gate adjudicated GO.** The landed
commit contains no `src/js` change (the fix is rejected), so it is
strictly closer to master than the gated tree. Note: the gate run
truncated `docs/ONTOLOGY.md` to 0 bytes (write-flap artifact, same
class as the 2026-10-30 registry loss) — restored byte-identical from
HEAD with `git checkout` before committing; the file is not part of
this commit.

## Telemetry

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/establishment.json --current
'evidence/2026-11-11/journey-establishment-r132-before-seed*.json'
--metrics guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,
c3.starvationDeaths` — **quiet (16 files, 4 metrics, no large
deviations)**. No LOUD lines. Baseline rolled forward to the r132
BEFORE panel (deaths 604, popAlive 178, pantryKcal 1,210,411,
starvationDeaths 0; previous r131 baseline preserved as
`establishment.json.20261111-pre-r132.bak`, provenance label
prepended). Deaths 604 vs the r131 baseline's 879 (−31%) is band
variation within the quiet band (deviation rule needs ≥60% for LOUD),
not a regime move — same driver, same policy, fresh seeds.

## Measurement-proof refresh

Owed since r129. **Still owed.** `scripts/balance-proof-update.js`
takes a retained real observer-neutral panel as its argument — it
validates and installs one, it does not generate one — and no fresh
retained panel exists yet: sim-proofrefresh-b4's panel is still in
flight (tree `sim-proofrefresh-b4` live, heartbeat fresh at the 19:43Z
check; its panel was NOT the one this run's pre-flight reaper removed
— that was the older `sim-proofrefresh-b` tree at master HEAD, branch
kept). Current `scripts/balance-proof.json` still points at the Nov 10
panel (`evidence/2026-11-10/neutral-r172social-panel/panel.json.gz`).
Do not run a competing panel in this lane; the refresh completes when
sim-proofrefresh-b4 retains its panel.

## Closeout

- Commit 1 `eb1865b27` (measurement set, 69 files), rebased to
  `b1e3f4f34` onto explicit master SHA `3c6fb7069`; analyzer re-run
  post-rebase with identical verdicts; fix verified absent from the
  rebased tree. Commit 2 (this note's closeout + header correction).
- Index-clobber repair: after commit 1 the main index showed all 69
  committed files staged-as-deleted (safe-commit private-index class);
  repaired with `git ls-tree -r HEAD -- <dirs> | git update-index
  --add --index-info`, verified status empty + diff HEAD empty.
  Lesson: `git ls-tree` does NOT expand glob pathspecs (returns 0
  lines silently) — the first repair attempt with quoted globs fixed
  only the 5 explicitly-named files; directory pathspecs with `-r`
  are the repair shape.
- Merge: `git merge --ff-only journey-establishment` from the main
  tree; verify ancestor; release worktree; rotation 1→2; delete the
  lock. Report: "merged locally, pending ship" — no version tag; the
  ship job reports the tag when it goes live. The fix does NOT land
  (NO-GO); nothing in this merge touches `src/js`.
- Standing pre-flight deviations (LOUD): write-flap episode 18:46–
  19:01Z at the 12:45 run's pre-flight (registry write EPERM; 8×
  registration failures on `.git/refs/heads/journey-establishment.lock`;
  probe-gated, FLAP_CLEAR 19:01:52Z); the 12:45 run died in the runtime
  restart ~19:37Z (adopted by this run, see Adoption). Gate-run EPERM
  flakes + the 0-byte `docs/ONTOLOGY.md` truncation (restored from HEAD).
- Heartbeat: 10-minute loop for the whole run; tree heartbeated
  immediately on adoption and at every phase boundary.

## Appendix — the rejected fix (for the next run's unit-cap dial)

```diff
--- a/src/js/game.js
+++ b/src/js/game.js
@@ -7403,7 +7403,22 @@
             // across whoever cooks, so the grant now pays the work done,
             // not the visit. The same XP askSpecialist grants; the skill
             // it buys is specialistSkill's self-taught ladder (5 XP -> 1).
-            try { this.grantFoodXpCredit(person, 'preserver', n); } catch (e) {}
+            // PER-DAY CAP (establishment r132 2026-11-11: the preserver
+            // race): racks pay per batch with no cap, so a dedicated
+            // preserver races to skill 3 in 42 days (r131: Ayan 0->33 XP
+            // on 13 granting days, preserving in bursts — 2-3 granting
+            // resolutions on 5 of those days). Only the FIRST
+            // preserver-granting resolution each day grants
+            // (foodXpDay.preserver — same shape as the cook/builder caps);
+            // later resolutions still preserve food, only the specialist
+            // XP is capped. Keyed to the grant event, not the cook
+            // resolution: a first resolution that preserves nothing leaves
+            // the day's grant open for a later one that does.
+            try {
+              const _pday = (this.state.scholar || {}).day || 1;
+              person.foodXpDay = person.foodXpDay || {};
+              if (person.foodXpDay.preserver !== _pday) { person.foodXpDay.preserver = _pday; this.grantFoodXpCredit(person, 'preserver', n); }
+            } catch (e) {}
```

Proof test `scripts/test-journey-establishment-r132-preserver-cap.js`
(36 passed, 0 failed on the fix tree) is not landed with the fix and is
not committed anywhere: it asserts the rejected fix and would fail on
master without it. Its check-list is described in the prereg
(§Proof test) and its 36/36 pass is recorded here; the next run
re-derives its proof test from r131's, as r132 did from r131's. The
analyzer's verdict logic (Q1a–Q1e, cap check, Q2/Q3) was exercised on
the real 16-seed panel in this run, not only on synthetics.
