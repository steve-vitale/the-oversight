# Journey leg ESTABLISHMENT — r108 run note (2026-11-06, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon. Seeds 1502, 1504, 1603, 1604
(r107's four firing seeds — deliberate matched reuse, not fresh; see prereg
seed-band note). Policies: control = `competent` (r107 driver, gate-off);
ref-arm = `competent-hunt`, HUNTSTAFF=1 (r107 lever as measured); prep-arm =
`competent-hunt`, HUNTSTAFF=2 (lever + hunt-prep lesson). Base: worktree
branched from master 12cac2ec7; master has since moved to f2c4a6708
(gorgeharness narration-only commits, no RNG change — see Telemetry).

## Rebase note (after scoring)
Master moved during the run (mootgate, gorgeharness, crisis-r132 C3,
1415-coordination, killersurvive-a landings). The branch was rebased from
12cac2ec7 onto master a7a443a88 — clean, no conflicts (none of the landed
commits touch the r108 files). The proof test was re-run on the new base:
ALL GREEN, with byte-identical P2/P2b numbers to the old base
(5d gate-off == control-a == control-b at 6/12/20100; 20d ref-arm ==
prep-off at 20/10/13360, 3 assignments, 3 huntLog). The scored panel above
was run on 12cac2ec7 and stands as run; the instrument is verified neutral
on the landing base.
Second rebase: master moved again before the merge (fightinterior-b landed
5 commits, 304ced6cf — a taxonomy-string correction in closeTrace, no r108
file overlap). Rebased clean onto 304ced6cf; proof re-run ALL GREEN on the
new base (same P2/P2b numbers). Landing base: the merge commit (see git
log); pending ship.

## Run provenance (stale-lock recovery + adoption)
This run did NOT start r108. The 08:04 CST run (lock 2026-11-06T14:04:43Z,
worktree registered 14:06:30Z) built the full substrate — huntstaff.js prep,
r108 driver, analyzer, proof test, prereg — then died after writing the proof
test at 14:18Z (last heartbeat 14:22:27Z, no live process, no seed run).
This run (08:45 CST, run_id 2026-11-06T14:49:40Z) found the lock with a
21-minute-stale heartbeat, verified no live r108 process and no file activity
after 14:22Z, deleted the stale lock, adopted the `journey-establishment`
worktree + registry entry (run_id + heartbeat updated, purpose annotated),
and completed r108's prereg'd plan unchanged. No prereg change, no seed
change, no metric change — the dead run's plan is this run's plan.

## Infrastructure notes
- **EPERM flap (2026-11-06 ~14:57–15:04Z).** The pilot's first attempt lost
  all 5 legs to `EPERM: operation not permitted` on the final JSON write;
  6 retries of leg 1 all failed 14:59–15:01Z; heartbeats failed 15:01–15:02Z.
  Probes passed at 14:59:05 and 15:03:49 — the flap flips on a seconds
  timescale. Retried in the open window: all 5 pilot legs + all 9 sweep
  legs landed first-try 15:04–15:06Z. No data lost; the flap cost ~8 minutes.
- **/tmp full.** The proof test's P2 legs write driver output via mkdtemp
  under /tmp (512M tmpfs, 100% full — `/tmp/base-b13016733`, 510M, belongs
  to Lane B's live crisis r132 run; NOT touched). Re-ran the proof with
  TMPDIR=~/workspace/tmp-r108. Proof is green (below). Standing fragility:
  any proof/driver that writes to /tmp breaks while a sibling parks a base
  copy there.
- Registry-lock contention: the pre-flight reap took ~7 min (two concurrent
  reaps + heartbeats queueing on REGISTRY.lock). Reap removed nothing;
  active 6/16.

## M0 INSTRUMENT-NEUTRALITY — PASS (pilot seed 1502, 42d)
- gate-off (r108 driver, HUNTSTAFF unset) == same-base control exactly:
  endDay 42, aliveEnd 9, pantryKcalEnd 27733, skill_lesson sets identical
  (20 lessons each).
- prep-off (r108 driver, HUNTSTAFF=1) == ref-arm exactly: endDay 42,
  aliveEnd 11, pantryKcalEnd 22975, skill_lesson sets identical (17 each),
  huntLog 9 == 9. prepLog empty, prepOn false on both off-legs.
- Same-base control reproduces r107's numbers exactly on all four seeds
  (1502 42/9/27733, 1504 42/8/34272, 1603 43/6/13367, 1604 43/10/25833) —
  base stability confirmed for these seeds.

## Proof test — ALL GREEN
`scripts/test-journey-establishment-r108-huntprep.js`: P1 11/11 fixture
checks (gate-off delegates, HUNTSTAFF=1 staffs with no prep, HUNTSTAFF=2
teaches before assigning, no-teacher / teacher-away / already-holds /
today cases, refusals stay honest); P2 5d det-gate (gate-off == control-a
== control-b); P2b 20d prep-off parity (ref-arm == prep-off on scalars,
lessons, assignLog); P3 capture shape (guardrails/c3/prepLog present).

## M1 PREP-DELIVERY — PREP-PARTIAL (the leg question)
Per-seed prep-arm vs ref-arm (endDay / alive / pantry guardrails):

| seed | prep | ref | ctl | hunts prep/ref | kills | field_dressing fires |
|------|------|-----|-----|----------------|-------|----------------------|
| 1502 | 43/8/30373 | 42/11/22975 | 42/9/27733 | 7/9 | 6/7 | **5** (ref 0) |
| 1504 | 43/11/22663 | 43/11/22663 | 42/8/34272 | 3/3 | 2/2 | 0 (ref 0) |
| 1603 | 43/8/24313* | 43/8/24313 | 43/6/13367 | 1/1 | 1/1 | 0 (ref 0) |
| 1604 | 43/10/19875 | 43/10/19875 | 43/10/25833 | 3/3 | 3/3 | 0 (ref 0) |

\* 1603 guardrails.pantryKcal 24313 vs pantryKcalEnd 26239 — the people-check
payout (Ella's cache +1926) lands after the guardrails snapshot; M1 pantry
is judged on the guardrails number per the prereg's r107 metric-review fix.

Prep panel (14 evaluations): lessons attempted 3, ok 1, already-holds 5,
no-teacher 6; whys: no-teacher 6, words 2. Success rate where a lesson was
attempted: 1/3 (33%). The ladder needs fires ≥1 on ≥2 seeds AND ≥50%
success where a teacher existed — neither bar is met. Verdict:
**PREP-PARTIAL** (fires ≥1 on exactly 1 seed).

The one working seed, 1502, is a clean demonstration: d15 no-teacher
(no holder home yet), d19 Ezequiel teaches Ethan field_dressing (ok),
d20–d26 already-holds ×5 — and Ethan then kills 5 held: owl 904 kcal,
snakes 753 ×4. Same-animal held-vs-notheld: snake 753 vs 378, owl 904 vs
517 — the held frac pays ~1.75–2.0× on the same animal, ABOVE the prereg's
predicted ~1.3× (0.78/0.60). The mechanism works and pays more than
predicted when the lesson lands.

Why the other three seeds never fire — the prepLog names the gate per seed:
- **1504 (Pavel, 3 assignments): no-teacher ×3 (d27/d33/d41).** The village
  has NO field_dressing holder at any point in 42 days — no lesson rows,
  no end-state holder. The roster (tailor, paramedic, dry cleaner,
  dispatcher, sign painter, welder, ESL teacher, locksmith, fisherman,
  firefighter, bush pilot) holds no veterinarian / mortician / butcher.
  There is nothing to teach with. The prep's ceiling here is absolute.
- **1603 (Ethan, 1 assignment): no-teacher ×1 (d7).** The village's only
  eventual holder, Ursula the mortician, holds the skill by end-state but
  nothing datable puts it in her hands at d7 (no lesson row, no telemetry
  row — she gains it later by track XP, after the single d7 hunt). The
  hunt window (one assignment, d7) closes before the holder exists.
- **1604 (Juan, 3 assignments): no-teacher d31, then lessons FAILED on
  'words' d37 (Emma→Juan) and d38 (Aki→Juan).** Holders exist from d1
  (Emma) and d36 (Aki), both at home — but Juan shares no language with
  either. The lesson needs shared words; the engine's gate is the last
  word, and it says no. (Emma taught Aki field_dressing d36 via the
  autonomous chain — the skill spreads, just not to the hunter.)

Funnel deltas (DESCRIPTIVE only — re-roll confound bars them from the
verdict): prep-vs-control pantry guardrails 1502 +2640, 1504 −11609,
1603 +10946, 1604 −5958; survival prep 8/11/8/10 vs control 9/8/6/10.
Note 1502's prep arm lost 3 more villagers than its ref-arm (deaths 30
vs 27, endDay 43 vs 42) — a trajectory fork after the d19 lesson (different
lean days, 7 hunts vs 9), reported descriptively, not charged to the prep.

Per the prereg's ladder, PREP-PARTIAL means the delivery repair is NOT the
fix: document which gate held and move on. No bigger panel, no funnel
re-judgment. The huntstaff FUNNEL verdict stays parked (r107 HUNT-MIXED)
behind the separate-RNG-stream Steve-call. What the next attempt would
have to solve is not timing but supply: a village with no holder, a holder
who arrives after the hunt, and a hunter who shares no language with the
holder are three different gates, and this prep only ever addressed the
first one's timing.

## M1b USE CLASSIFICATION — HOLDINGS-DECORATIVE (unchanged shape)
field_dressing USED (5 uses, all 1502 Ethan); triage USED (10 reach-2
uses, DeShawn 6× on 1504). diplomat / herbal_remedy / preserve_food /
wound_care HELD-UNUSED and STRUCTURALLY-INERT (no villager-aware read
site): 8 / 2 / 7 / 13 holders, 0 uses. Same shape as r107.

## M2 CARE-VISIBILITY (descriptive)
careTicks 168, tends 89, medics seen 14, healerRounds 75, treatTicks 168
(treatChanged 0). Triage reach-2 fired 10×. Care is visible and named:
Chen→George 28→43HP, Maureen→Ethan 54→69HP and 11→26HP, DeShawn's
reach-2 tends on 1504. 1503's zero-tend seed (1603 care 42 calls, 0 tends)
is the thin village with no medic on duty, not a silent system.

## M3 SURVIVAL-42 — 4/4 PASS (bar 3/4)
All four prep-arm seeds alive at 42 (aliveEnd 8/11/8/10).

## M4 PANTRY-GUARDRAIL — 4/4 PASS (bar 3/4)
starvationDeaths 0 on all four prep-arm seeds (c3, corrected keywords).

## M5 PEOPLE — PASS (8 held convos read in full)
- 1502 George (roofer): wants a plan; shares his (one useful thing a
  week, field medicine); trap-line walk accepted, resolves with a small
  bond moment; burned farmhouse offered on the map. The triple
  "I'm listening" goon is repetitive but each turn advances. PASS.
- 1502 Chen (pharmacist): dreams of pods, sister Ruth taken at 19, wants
  the System asked about the pods; you commit; he thanks you. Gossip
  (Quinn foraging) is real; the confrontation deflects honestly; the
  invite is accepted ("Someone should watch your back"). The strongest
  convo of the set. PASS.
- 1504 DeShawn (paramedic): opens with a wound favor whose target is
  unclear — "They are out on the road, miles from here" never resolves
  who "they" is. Gossip is grounded (Pavel ran to the treeline when
  Paloma screamed). One unclear referent; otherwise coherent. PASS with
  a note.
- 1504 Paloma (dry cleaner): trust question, earned approval, teaches
  Porcini then Chanterelle (real field knowledge), invite accepted with
  character ("Alright. But I'm not carrying your stuff."). PASS.
- 1603 Ursula (mortician): a thin closed beat — "we got it handled",
  a confrontation that goes nowhere ("We went over this"), silence, and
  the exchange stalls with no pick. Not incoherent, but the NPC wants
  nothing here and the ending fizzles. WEAK — a closed beat with no hook.
- 1603 Ella (ESL teacher): a secret in the woods, a buried cache dug up
  (+1926 kcal, a real consequence — the r107-noted people-check payout),
  Ghost Pipe taught, invite accepted ("This had better be worth it"),
  a real answer to "who are you" ("not knowing if anyone else made
  it"). PASS — the best of the set alongside Chen.
- 1604 Nora (sign painter): four confrontation picks in a row is the
  driver hammering, not a natural conversation — but the content is
  strong: a theft confession ("I dug it up. I was starving and your hole
  was right there") and status anxiety ("the only nobody in a camp of
  somebodies"). PASS with a driver-hygiene note (confront-spam).
- 1604 Eduardo (dry cleaner): mid-thought opening, hollow walk accepted,
  comfort lands, gossip about Tashi and Emma (real names, real village),
  ends on a ghost of a laugh. Light but coherent. PASS.

Driver hygiene (carried, prereg): the people-check driver picks goon-first
and may accept betrayal verdicts while sampling (George's and Eduardo's
walks, Ella's cache — all read fine, but the accept label is a sampling
artifact). The "We went over this" deflections on Ursula/Nora are the
engine handling a repeated/ungrounded confrontation honestly, not
fabricated history — the driver sampled mid-relationship.

## Village assessment (plain words)
Four villages, 42 days each, 33 people still alive at the end of 133
between them. The shape is the same on every seed: monsters do the
killing (26–42 of 27–47 deaths per seed are monster kills) and the village
bleeds down to a core of 8–11.
- **1502** (8 alive): the prep village. Maureen the veterinarian (HP100)
  holds the skill from day 1; Ezequiel the postal worker teaches Ethan
  on d19; Ethan the trail-crew lead becomes the hunt champion — 6 kills,
  5 of them dressed properly, and the pantry ends best in the panel
  (30,373). George the roofer is wounded (HP42) but standing; Chen the
  pharmacist keeps people alive. The village survives on Ethan's
  hunting and Maureen's medicine.
- **1504** (11 alive): the village with no teacher. Pavel the bush pilot
  kills a mink and a goose (2,218 kcal — the single biggest unheld kill),
  but nobody in the village knows field_dressing and nobody ever learns
  it. Carlos the fisherman is at HP1, Pavel at HP11, DeShawn at HP24 —
  three people one bad day from death. DeShawn the paramedic tends the
  wounded; Paloma teaches mushrooms. It survives despite the prep, not
  because of it.
- **1603** (8 alive): the bloodiest seed — 47 dead of ~55. Ethan's single
  coyote (7,728 kcal) is the whole hunt story; Ursula the mortician
  survives but her skill arrives too late for the one d7 hunt. Ella's
  buried cache (+1,926) is the difference between eating and not. Zoltan
  the mushroom grower cooks at the racks; the village is held together by
  foraging and one dead coyote.
- **1604** (10 alive): the village where the teacher exists but the words
  don't. Emma the veterinarian has held the skill since day 1 and even
  teaches Aki the fisherman on d36 — but Juan the exterminator shares no
  language with either, so his three kills (snakes 378, owl 454) are all
  undressed. Nora confesses a theft; Eduardo walks the hollow. It is the
  most socially alive village and the clearest proof that the prep's
  binding gate is language, not willingness.

What is missing, across all four: no village has a second hunter (the
hunt-champion pattern — one person does all the hunting); no village
teaches field_dressing to anyone but the hunter's chain; armor lessons
never appear as skill_lesson rows (r105 limit, unchanged); the diplomat
"incident" half is still unimplemented (r105, out of scope).

## Reachable / Fun / Winnable (establishment leg)
- **REACHABLE — yes.** Hunts staff on the firing seeds, contests fire
  2–5 times per seed, triage and teaching happen in normal play. The
  prep lesson itself fires whenever a same-language holder is home — the
  gate is the village's supply, not the layer's reach.
- **FUN — yes, with the known caveat.** The leg's drama is real (Ethan's
  arc, Ella's cache, Nora's confession, Chen's pods). The caveat is the
  establishment brutality: 26–42 monster deaths per seed, villages
  bleeding to a core of 8–11 by day 42. That is the standing wave-2
  pressure, not new to this run.
- **WINNABLE — not judged here.** The establishment leg is not the win
  leg; its contribution is pantry + veterans + knowledge. The prep adds
  pantry on the one seed where it fires (+2,640 vs control) and nothing
  elsewhere. The wave-4 chain (wild kills → veterans → release) is
  upstream work for the scale/endgame legs.

## Telemetry
- Baseline re-seeded (prereg owed item): the r40-era
  `telemetry-baselines/establishment.json` (deaths 41) no longer described
  the current death-tele regime. Re-seeded from this run's 4-seed CONTROL
  panel (sums: deaths 123, popAlive 33, pantryKcal 101205,
  starvationDeaths 0); old file preserved as
  `establishment.json.20261106-pre-r108.bak`; `_instrument` re-labeled
  with the regime-change note. The re-seed run printed one LOUD line
  (deaths swung 200%: 41 → 123) — that IS the regime change being
  recorded, investigated and explained, not a new deviation.
- Deviation check (prep-arm vs fresh baseline): **quiet, exit 0** — deaths
  133 vs 123 (+8%), popAlive 37 vs 33 (+12%), pantryKcal 99150 vs 101205
  (−2%), starvationDeaths 0 vs 0. No LOUD lines.

## Metric review (for the NEXT run, not this one)
- The M1 ladder's "≥50% success where a teacher existed" counts a
  teacher as existing when the prep finds one at home — but on 1604 the
  teacher existed and the lesson failed on 'words' twice. A future ladder
  should separate "teacher at home" from "teacher able to teach" (shared
  language) — they are different gates with different fixes.
- The predicted held frac (~1.3×) understates the observed same-animal
  effect (~1.75–2.0×). The same-animal held/notheld kcal ratio is the
  better instrument for the frac's value; the pooled held/notheld mean is
  confounded by animal size (prep held mean 783 vs notheld 1725 — the
  notheld kills include the 7,728 coyote).
- The prepLog's 'no-teacher' conflates "no holder in the village" with
  "holder away / holder not yet seeded". A future instrument should split
  it (no-holder-anywhere vs holder-away vs holder-unseeded) — on 1504 vs
  1603 the fix is different (recruit/teach a holder vs wait for one).
- Holder-since dating still has a hole: Ursula (1603) holds the skill at
  end with no datable acquisition row (no lesson, no telemetry row). The
  prereg's known limit stands; a future analyzer should read the
  holdings snapshots per dawn, not just lesson rows.
- The people-check driver still accepts betrayal verdicts while sampling
  and spams confrontations (Nora ×4). Driver hygiene, noted not fixed
  (driver parity with r107 is what M0 needed).
- Ursula's thin closed beat ("we got it handled" → stall) is worth a
  look in a future dialogue pass: a villager with nothing to ask for
  should offer something (a task, a rumor, a goodbye) rather than
  stalling to no-pick.

## Files
- Prereg: `evidence/2026-11-06/journey-establishment-r108-prereg.md`
- This note: `evidence/2026-11-06/journey-establishment-r108.md`
- Analysis: `scripts/analyze-journey-establishment-r108-20261106.py`
  (full output kept at `~/workspace/tmp-r108/analysis-r108.txt`)
- Prep-arm per-seed JSONs + convos:
  `evidence/2026-11-06/journey-establishment-r108-seed{1502,1504,1603,1604}.json`
  (+ `-convo-seed*.txt`)
- Control / ref-arm per-seed JSONs (NOT committed — goal workspace):
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence-2026-11-06-control-r108/`
  and `.../evidence-2026-11-06-refarm-r108/`
- Pilot parity scratch (NOT committed):
  `~/workspace/tmp-r108/pilot-gateoff/`, `~/workspace/tmp-r108/pilot-prepoff/`
- Baseline re-seed (goal workspace):
  `hidden_files/telemetry-baselines/establishment.json`
  (+ `.20261106-pre-r108.bak`)
