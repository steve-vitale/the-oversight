# Journey succession r100 — SENT-VANISH MECHANISM CLOSED, KEEPSAKE BURIAL NARRATED (lane B, 2026-11-01)

Leg 7 (succession). Prereg: evidence/2026-11-01/journey-succession-r100-prereg.md
(written before any driver run). Pilot panel + one narration fix + proof
debt carried honestly. Base: worktree registered on master 9da23adc5
(Loop A 0045Z coordinator evidence, docs-only; main tree was at
56a8172f0 at pre-flight — master moved between pre-flight and
registration, see Closeout for the rebase handling).
Seeds 30161–30164, competent policy, POST_DAYS=70, EARLY_KILL_DAY=40.
30161, 30162 chain-forced (20/20/10/10 dplus); 30163, 30164 controls.
Pilot-only per the pre-declared trigger: NO expansion (see Q1 — the
same-day double is cross-iteration by code order, so the literal
same-iteration trigger did not fire; expanding on it would be a
mid-run re-scope, §14).

Slug deviation, documented: the body slug journey2-succession is
unusable (done-merged registry entry + orphan directory on disk,
same class as r83/r87/r89/r91/r94/r97). This run uses
journey2-succession-r100.

Stale-lock recovery, documented: the lane lock at run start read
run_id 2026-11-02T01:58:03Z — r99's own lock, left behind by r99's
closeout (r99 is done-merged in the registry, heartbeat
2026-11-02T02:54:55Z). No registered tree carries the lock's run_id,
so per the body's guard the previous run is DEAD (completed, not
live) and the lock was deleted; a fresh lock (2026-11-02T02:59:09Z)
was written for this run. At closeout, the lock is deleted ONLY if
it still carries this run's run_id (r97 showed another run's
closeout deletes the lane lock without checking run_id).

## Run setup — clean registration, fast seeds
- Worktree registration clean (~51s). Heartbeat landed at
  registration (03:01:39Z, verified by registry read-back) and a
  10-minute heartbeat loop ran for the whole run (loop beats
  verified in the registry, e.g. 03:11:39Z). No EPERM flap this run.
- Smoke test first, throwaway seed 30998 (5d phase A + 5d post):
  exit 0, JSON parses, first death recorded (Jude→Diego, hushwolf,
  scripted, passed), inh readable — and the smoke itself already
  showed a vanish (carpenters_square). Smoke files deleted before
  the panel (verified: no 30998 files remain).
- Panel: all 4 seeds exit 0, first attempt, all parse-verified.
  Runtimes 117s / 61s / 42s / 39s (forced seeds slower — chain
  probes + more convo checkpoints; controls faster, outputs
  complete and verified, no re-run).
- Canon: docs/CANON.md read in full before playing;
  docs/DIRECTIVES.md re-read; DEAD-LEDGER.md read (succession
  mentions only in passing). No canon doc covers succession/mantle
  — none invented. Gating freeze (2026-10-27) untouched. No gate,
  deed-bar, standing, wave, or table-price change is in scope or
  made. The one src/js change is narration-only (see BLANK
  FILLED).

## Headline

The sent-vanish mechanism is CLOSED, not merely observed again.
Across 12 handoffs, all 26 vanished items are class 'sentimental'
in src/data/items.json with corpse count 0, and every surviving
sentimental has its saving location named (another copy with the
successor, a living villager, or a stash — never the corpse).
Vanish ⟺ sentimental type + last scanned copy. The code already
said so (ledger.js DEATH PACK: sentimentals die with the owner);
what was missing was the player-facing line — a bonded keepsake
vanished silently, against the no-silent-actions canon. This run
adds that one line, proven by a standalone test with a
no-keepsake control. The fresh split case remains unobserved at
iteration resolution (see Q1), and proof (e) stays red on its
stale r91 expectation while the new structural check (e2) passes
on the identical current-master trajectory r97's control run
produced.

## VANISH-MECHANISM (binding bars V1/V2/V3 — ALL MET)

VANISH-CLASSIFY (new analyzer section, reads src/data/items.json):
handoff records inh + inh2..inh5 over 4 seeds = 12 handoffs,
26 vanished, V1-violations=0, V2-violations=0.

- V1: every vanished id is class 'sentimental' (217 classes
  loaded). New members this panel, all sentimental: thermos,
  dead_phone, hoodie, rope_50ft, bus_map, winter_coat_button,
  tin_cup. Repeat members: trail_compass, contract_quill (again),
  carpenters_square, reading_glasses, knife_roll, dead_phone,
  field_suture_kit, mothers_ring, seed_packet, buskers_harmonica,
  home_key (survives here — see V3), dispatchers_headset.
  NO vanished non-sentimental id, NO unknown class. The gearPack /
  corpse path is healthy: non-sentimentals ride the corpse.
- V2: no sentimental id shows corpseN > 0 at any handoff snapshot
  (all 26 vanished rows read corpse=0). The code path holds:
  sentimentals never enter the gearPack.
- V3: every surviving sentimental names its saving location.
  The pattern is uniform: livingPackN / livingWornN (other copies
  held by living villagers) or succWornN (the successor already
  wore one). Examples: 30161 inh contract_quill survives via a
  living villager's copy; 30162 inh trail_compass survives via
  the successor's own worn copy plus living copies; 30162 inh5
  notebook survives via succWornN alone. The type-vs-serial
  distinction is the whole mechanism: the bearer's objects are
  buried, the type survives iff another copy exists somewhere
  scanned.
- Instrument caveat, recorded not hidden: livingPackN and
  livingWornN mirror each other on nearly every surviving row
  (e.g. livingPackN=5 / livingWornN=5) — the same copies appear
  in both the pack and worn views, so per-location COUNTS are
  presence indicators only. The V1/V2 verdicts use presence
  (all-zero vs some-nonzero) and are robust to this; do not
  over-read the counts as distinct copies.
- D+3 flips: none (no id changed vanished status between the
  handoff snapshot and the d+3 re-scan).

## Q1 — SAME-DAY DOUBLE, SPLIT CORRECTLY, BUT CROSS-ITERATION (trigger NOT fired)

Seed 30162 records TWO chain entries on detectedDay 61, both via
playerDeath, in correct order with correct causes:
- Henry -> Jorge, scriptedSecond, cause "scripted second handoff
  (r64 chain probe)" — the scripted second kill.
- Jorge -> Bidisha, organic, cause "the wild" — Jorge took the
  mantle on day 61 and died to the wild the same day.
The recorder did NOT collapse them (no Henry->Bidisha net entry,
no dropped handoff). This is the nearest fresh split evidence
since r91's day-71 collapse — same shape (scripted + organic, one
day), opposite outcome.

BUT the pre-registered trigger says same-ITERATION, and code
order proves these two deaths are in DIFFERENT driver iterations:
one iteration is one runDays(1 day) call; the scripted kill fires
AFTER that iteration's runDays, and Jorge can only die during a
LATER iteration's runDays (he does not exist as bearer before the
kill). Day stamps cannot distinguish iterations, and the chain
entries carry no iteration stamp. So the literal trigger did NOT
fire, and this run does NOT expand: expanding on a trigger that
did not fire would be a mid-run re-scope (§14). The pilot stands
at 4 seeds; all pilot bars are met without expansion.

For the next run (metric review, not a bar change here): specify
the split trigger at DAY resolution vs ITERATION resolution
explicitly, or stamp an iteration counter on chain entries so a
same-iteration double is provable from the record instead of
requiring code-order argument. The true same-iteration case
(organic death during runDays + scripted kill after that same
runDays in one iteration) remains unobserved on fresh seeds —
same status as r97, now with a same-day case on the record.

## DETECTOR + CHAIN5 + REGRESSION BARS (all MET)

- DETECTOR: chainDeaths == chainKnown on 4/4 seeds (30161 4/4,
  30162 6/6, 30163 1/1, 30164 3/3). Every chain entry on the fresh
  panel carries via=playerDeath (14/14). The bypass sweep fired 0
  times: no bearer change bypassed playerDeath on this panel.
  (Note: the analyzer prints no separate DETECTOR section header;
  the counts above are the analyzer's chainDeaths/chainKnown
  lines plus the via audit of the stdout JSONs.)
- CHAIN5-READABLE: 2/2 forced seeds with a full fifth handoff
  (relPreDeath5 + relPost5 + fifthDeath lin+mo true).
  30161: Amanda -> Heidi -> Alejandra -> Rafael -> Paola ->
  Haripada, fifth d+10 since 4th, d+61 since 1st (exact).
  30162: Isabella -> Enzo -> Jorge -> Emilio -> Yara -> Sanne,
  fifth d+10 since 4th, d+60 since 1st.
- CHAIN5-BONDS: fifth-successor bonds survived == pre on both
  (30161 9/9, Paola depth 3 v 100; 30162 13/13, Emilio depth 3
  v 100), affinityDiff5 = 0 on both.
- INH5: 30161 Haripada: kept 40 plants + inherited 0, kept 6
  skills + inherited 37, vanished [hoodie]. 30162 Sanne: kept 58
  + inherited 1, kept 5 + inherited 33, vanished
  [winter_coat_button]. All class=mixed (continuation, never
  reset).
- M3v2b: 4/4 seeds meet the analyzer's per-seed bar (values
  4, 2, 7, 4; bar ≥2) — pilot bar ≥3/4 MET with margin.
- C1v3 ok=true missing=[] on 4/4. S1 missingExact=0 on 4/4.
  MG2v2 true (violMeal=0) on 4/4. M1/M4 true on 4/4.
- INVITE SEAM: 22/22 invite outcomes spoken (accepts and
  declines, both with reasons), 0 deflected, 0 other. Sibling
  deflection lines in transcripts: 4, 0 invite-deflected.
- Observation (not a bar): 30162 phantomsAtEnd origBearer=1
  (one lingering dead-bearer bond entry at end on the forced
  seed with the organic interleave; 30161 reads 0). One line for
  the relationship system: a single phantom bond survives to the
  end on the seed whose chain interleaves organic deaths. Not
  investigated further here — no bar covers it, and the bonds
  bars all pass.

## WEEK1-NAMING + MIX (descriptive; r97's answers confirmed, not re-litigated)

| seed | dead first bearer | first-bearer | any-recent | draws | mix grief/debate/other/unclass | non-verbal |
|------|-------------------|--------------|------------|-------|-------------------------------|------------|
| 30161 | Amanda | 2/5 | 2/5 | 3 | 2/1/0/0 | 0 |
| 30162 | Isabella | 1/5 | 3/5 | 3 | 3/0/0/0 | 0 |
| 30163 | Erin | 4/4 | 4/4 | 4 | 4/0/0/0 | 0 |
| 30164 | Werner | 2/4 | 2/4 | 2 | 2/0/0/0 | 0 |
| pooled | | 9/18 (50%) | 11/18 (61%) | 12 | 11/1/0/0 | 0 |

- 30162 is a second week-1 second-death case: Enzo died day 46,
  five days after Isabella (day 41), inside the week-1 window —
  and any-recent exceeds first-bearer by exactly that death
  (Jorge and Bidisha name Enzo, the fresher dead). r97's
  any-recent-informative finding reproduces on a fresh seed.
- No seed is silent under BOTH metrics (minimum namedAny 2/5),
  so the both-silence expansion trigger does not fire either.
- MIX: grief 11, debate 1, other 0, unclassified 0 across 12
  draws — the phrase family covers this panel fully (with the
  r97 caveat carried: debate/other classes drew 1/0 times, so
  the family is grief-complete, not class-complete).

## VILLAGE ASSESSMENT (plain words)

Four villages, all standing at the horizon — and the mantle
passing bends none of them to breaking:

- 30161 (Amanda→Heidi→Alejandra→Rafael→Paola→Haripada): the chain
  village that grieves Amanda properly. Five handoffs recorded
  fully, ends alive with pantry standing. Its people name Amanda
  in 2/5 week-1 transcripts — the burnt piece, the smaller fire —
  and the fifth bearer inherits a full life, not a blank.
- 30162 (Isabella→Enzo→Henry→Jorge→Bidisha→Emilio→Yara→Sanne):
  the village that buried two bearers in one day and kept going.
  Seven handoffs (five scripted, two organic interleaves),
  including Jorge's single-day mantle — took it on day 61, died
  to the wild the same day — and the village still reaches the
  horizon with Sanne. Its week-1 grief follows the fresher dead:
  Enzo, not Isabella, in the any-recent lines.
- 30163 (Erin→Sona→Divya): the steady village. One organic
  handoff late (day 110), ends alive. Erin is named in 4/4
  week-1 transcripts — the favor owed, the last thing said, the
  dream, the world continuing.
- 30164 (Werner→Ella→Liam→Sophia→Vasyl): the village that grieves
  and argues. Three organic handoffs, ends alive. Werner is named
  in 2/4 week-1 transcripts; its loudest thread is Sophia's
  confession, not grief.

What is missing, panel-wide: no village reaches beyond survival
in this window (no wave-5, no table — the endgame leg's window,
not this one), and the succession mechanics themselves do not
block winning: bonds survive intact, affinity does not drift,
knowledge and skills carry across five handoffs, and every
village that lived ends fed. The one real loss in this window is
the keepsake class itself — every bearer who carried a
sentimental type alone took it to the grave, silently, until
this run's line.

## PEOPLE CHECK: all 18 week-1 transcripts read in full — PASS

Every transcript satisfies the bar: the NPC wants something (a
wound cleaned, a fever seen, a haul shared, a slope-reading
lesson, news of taken kin, a confession heard, a party formed);
options engage or deflect it (invites accepted with reasons or
declined with reasons — Kelly declines feverish on d+3, accepts
recovered on d+7, which is continuity, not a flip-flop); endings
resolve, plant, or owe (lessons recalled at d+7 by name; the
thinking-place thread accepted; shoe-checks for Erin; the
taken-kin thread resumed). No fabricated shared history:
callbacks reference real driven history (d+3 closes quoted at
d+7, wound threads resumed by name). No filler loops: repeat
confrontations push back (Emilio: "I told you the truth. You can
keep poking it, but it's told."; Jorge: "We went over this. I
already told you the truth about that."; Sophia: "You're really
going to make me say it again? Fine — but it's the same truth as
last time."). Deflection works gracefully (Anthony's subject
change: "Something shutters, just slightly").

Observations (not bar failures):
- Scout duplication, 6th panel running, again with MUTUAL cases:
  Alejandra takes scout marked "(held by Paola)" and Paola d+7
  takes scout marked "(held by Alejandra)"; Anthony↔Divya the
  same mutual pair; Bidisha takes scout marked "(held by
  Jorge)". The menu warns but does not gate — most plausibly a
  driver artifact (the driver always picks scout), since a human
  could pick another role. Flagged for the party system, not
  claimed as a defect; human-play evidence would settle it.
- The driver always picks "The Company" (party_namepick:2), so
  NPC-suggested party names (The Long Walk, The Firetenders,
  The Second Try, The Hearth) never stick in driven play — a
  driver artifact, not a game finding.
- Double invite lines persist ("Want to come with us?" /
  "Want to come with me?" in every invite) — the party-vs-solo
  offer, slightly robotic in transcript form. Known edge.
- NEW template tics, same class as r97's Columbus secret:
  (1) the sleep-strange frame repeats verbatim across three
  villagers — Paola and Divya both "I taste the water before the
  others drink at odd hours now. Whatever gets me to morning.",
  Jorge "I greet everyone by name each morning at odd hours
  now. Whatever gets me to morning."; (2) the Rancher confession
  fires twice in one panel — Jorge ("I wasn't a pharmacist. I
  was a Rancher.") and Sophia ("I wasn't an EMT. I was a
  Rancher."), same reveal, different claimed past; (3) Columbus
  surfaces again (Sophia sings "Old songs from Columbus, Ohio")
  alongside the driver's fixed origin answer to Alejandra —
  hedged, not claimed as echo: it may be generator coincidence,
  but the driver's fixed answer propagating into NPC content is
  worth one look from the conversation system.
- Real state effects from conversation hold: Divya's slope
  lesson is freely given knowledge (the Codex notes it); plant
  lessons stick (Paola's Jewelweed recalled at d+7, Divya's
  Makhana, Anthony's Ghost Pipe).
- Retrospective weight: Jorge's d+3 transcript (first memories,
  Cuiabá, the Rancher lie) is the last conversation of a bearer
  who holds the mantle for a single day — the panel's saddest
  ordinary fact, and it reads that way only because the chain
  record is exact.

## REACHABLE / FUN / WINNABLE

- REACHABLE: yes. Week-1 grief naming fires on 4/4 fresh seeds
  without forcing (1/5 to 4/5 first-bearer, 2/5 to 4/5
  any-recent); the fifth handoff records fully on 2/2 forced
  seeds; the same-day double records as two entries, not one;
  the vanish classification runs on the panel's own records.
- FUN: yes, on the conversation evidence. Grief lines are
  specific and day-accurate (including the fresher-dead grief on
  30162); confessions push back instead of looping; a slope
  lesson is freely given and noted; a feverish decline becomes a
  recovered acceptance; a village argues about what to call the
  monsters ("Drum-Belly", "The Loud Beast" shouted down). The
  robotic edges are the known ones (double invite lines,
  driver-picked party name, scout re-picks) plus the new
  template tics (sleep-strange frame ×3, Rancher ×2).
- WINNABLE: not this leg's window to judge — no panel seed
  approaches the table. The succession mechanics themselves do
  not block winning: bonds survive intact, affinity does not
  drift, knowledge and skills carry across five handoffs, and
  all four villages that reach the horizon end alive. The one
  thing that did not survive handoffs — lone keepsakes — is now
  at least narrated.

## BLANK FILLED: keepsake burial narration (src/js, with proof)

- The blank: the DEATH PACK rule (ledger.js, Steve 2026-10-09)
  buries sentimentals with the body, but neither the death line
  nor the recoverBearer line ever said so. A player whose bearer
  carried a lone keepsake lost it with no explanation — the
  corpse's take/leave/use list simply lacked it. The panel
  proves the loss is real and systematic (26/26 vanished items
  sentimental, corpse 0), and the probe proves the silence (no
  keepsake line on current code before the fix).
- The fix (src/js/ledger.js playerDeath, narration-only — no
  numbers, no gates, no inventory behavior change): count the
  distinct sentimental objects excluded from the gearPack, and
  when the count is > 0, say one line right after the death
  line: "What ${oldFirst} kept close goes into the ground with
  them — keepsakes are buried, never taken from the body."
  It fires only when the bearer actually carried keepsakes, and
  it fires before the village-lost branch too (keepsakes are
  buried even when the village dies out). Commit message carries
  [needs-eyes]: it is a player-facing death line Steve will read
  when he plays a death.
- Proof (scripts/test-journey-succession-r100-keepsake.js, shared
  sim-harness kit, no eval-boilerplate copy): keepsake case
  (trail_compass + torch) — handoff happens, death line present,
  burial line fires with the exact wording, corpse carries torch
  only; control case (torch only, separate child process) —
  handoff happens, NO burial line, corpse still carries torch.
  ALL GREEN. Post-fix re-run of the r100 proof test: 43 PASS,
  same 6 stale-(e) FAILs only — the fix does not interact with
  the panel instrument.

## PROOF (r100 instrument) — (a)–(d), (f), (e2) PASS; (e) STALE as pre-declared

- (a) r83 fixtures 8/28, zero collisions, zero missing: PASS.
- (b) wrong-name control 0 naming: PASS.
- (c) driver smoke (seed 24998): fifthDeath scripted+passed,
  chain flags 2345 via playerDeath, d+3/d+7 files on actual-day
  names (late d+7→d+8 cases present), scratch deleted: PASS.
- (d) any-recent on r89 fixtures (27154 Jorge gain): PASS.
- (f) MIX on r91 fixtures (28152 unasked, 28154 debate+grief,
  28151 grief 2 unclassified 0, sums hold): PASS.
- (e) CHAIN-DETECTOR REPLAY: 6 FAILs, ALL on the stale r91
  expectation — EXPECTED, pre-declared, NOT edited. The
  current-master 28152 trajectory is byte-identical in shape to
  r97's control run (Petra→Violet→Ava→Latifa→Ivy→Dmitri, fifth
  Ivy→Dmitri, tele deaths.bearer 6): the replay is stable, not
  flaky, and the drift diagnosis reproduces exactly.
- (e2) REPLAY-INTEGRITY (new, same replay record): chain is a
  continuous bearer sequence, every entry via playerDeath,
  fifthDeath matches the chain's scriptedFifth entry, tele
  deaths.bearer (6) >= chain length (5): ALL PASS. Future runs
  get a green structural signal on current master while (e)
  stays red-and-documented until a current-master seed produces
  a genuine same-iteration double to split-assert on.

## Telemetry deviation check

node scripts/telemetry-check.js --baseline
.../telemetry-baselines/succession.json
--current 'evidence/2026-11-01/journey-succession-r100-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
LOUD lines (2), both VERDICT: EXPLAINED, baseline NOT rolled:
- deaths.bearer 260%: baseline 5 -> current 18 (n=4 files) — the
  forced-chain panel deliberately kills bearers (30161: 5, 30162:
  7, 30163: 2, 30164: 4 = 18, matching the panel's own death
  records exactly); regime, not drift (r89/r91/r94/r97 precedent,
  prereg rule: forced panel must not roll the unforced baseline).
- census.fallen swung 120%: baseline 10 -> current 22 — same
  cause (per-seed fallen 5+8+2+7 = 22, matching the panel's own
  tele records exactly).
Quiet: census.alive, census.integrationStage,
week2.deadBearerMentions (no LOUD line). Baseline left untouched.

## Metric review (§14)

- DETECTOR / CHAIN5-READABLE / CHAIN5-BONDS / V1 / V2 / M3v2b /
  C1v3 / S1 / MG2v2 / M1 / M4 / INVITE SEAM judged as
  pre-registered. No metric was re-scored mid-run. The expansion
  trigger is the one judgment call: the same-day double did not
  meet the trigger's literal same-iteration wording, so the
  panel was NOT expanded — reported here with the code-order
  proof, not silently re-scoped.
- V3 judged as pre-registered (descriptive): every surviving
  sentimental's saving location is named in the analyzer output;
  no surviving sentimental lacks one.
- PROOF judged as pre-registered: (a)–(d)/(f)/(e2) pass, (e)
  fails on its stale expectation (carried debt, not re-scored,
  not edited). The (e2) addition is a declared instrument change
  from the prereg, not a mid-run assertion edit.
- Interpretation refinements, not bar changes: (1) the
  living-pack/worn count mirroring means per-location counts are
  presence indicators only — future VANISH-CLASSIFY reads must
  not sum them as distinct copies. (2) The split trigger needs
  day-vs-iteration resolution (see Q1) before another run claims
  it fired. (3) The 30162 origBearer=1 phantom bond is a new
  observation class for the relationship system, not a bar.
- Carried (unchanged): F1 favor 'no longer available' blank
  (crisis leg, stays OPEN); dead discoverer's orphaned fireside
  entry (r51, Steve's call); unfed marches proceed (r50, Steve's
  call); stare-down cost as a class (Steve's call); phoenix
  per-event cascade (Steve-call); armor causation (needs a
  control arm); telemetry mapping proposal defenderFights ->
  defendedFights (crisis leg); gating freeze (2026-10-27)
  untouched; proof (e) stale baseline (carried debt, now with a
  passing (e2) structural signal alongside it).
- NEW for the next run / for Steve: (1) the scout-duplication
  question now has mutual cases on two consecutive panels — a
  human-play check (pick scout twice, see whether the game
  gates) would settle it better than another driven panel;
  (2) the sleep-strange frame (×3) and Rancher confession (×2)
  are template-frequency questions for the conversation system,
  same class as r97's Columbus secret; (3) the Columbus
  recurrence (Sophia's songs) deserves one look at whether the
  driver's fixed origin answer propagates into NPC content;
  (4) the keepsake burial line is the run's [needs-eyes] item —
  one death line, worth his eyes when he next plays a death.

## Regression suite

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2
in the worktree (log: evidence/2026-11-01/journey-succession-r100-
checkquick.log): 284 passed, 6 failed in 598s — EXACTLY r99's
counts (284/6). The six failures are exactly r99's six standing
families — measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes — and r99's report holds: the capable-bot
food-deed proof (test-capable-bot-20261014.js) is GREEN again
(absent from the FAIL list), so r97's carried NEW failure stays
stood down. Zero failures attributable to r100: the run's one
src/js change is a single conditional say line in playerDeath,
none of the six failing tests touches it, and the run's own proof
tests (r100 instrument proof + keepsake proof) pass standalone.
The new r100 scripts never ran inside check (fixed 290-script
list, same as r97) — their standalone runs are the proof.

## Closeout

[PENDING — fill in after merge: commit hash, rebase/merge record,
rotation verification, lock handling.]
