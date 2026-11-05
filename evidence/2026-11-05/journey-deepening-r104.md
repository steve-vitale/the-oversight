# journey-deepening r104 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-05T0957CST (lock 2026-11-05T09:57:27Z).
No prior lock existed, so no stale-lock recovery; main tree clean,
disk 32%. Base master@e938cda83 at worktree creation. Rotation read 2
-> deepening; 2->3 written at closeout (see closeout note: r103's note
claims 2->3 was written at ITS closeout, but the rotation file still
read 2 at this run's start — either that write failed or the note is
wrong; this run plays deepening per the file and writes 3 at closeout).
Lock deleted at closeout per the body's even-on-failure rule. Prereg:
evidence/2026-11-05/journey-deepening-r104-prereg.md (written BEFORE
any seed ran AND before the fix was panel-tested), plus prereg
amendment #1 (same dir — the 943xx band was contaminated; see below).
Seeds fresh **92101–92104**, competent policy (r103 driver lineage +
r104 analyzer), DAY CAP=100, death-aware stop. Smoke seed 92100 x
DAY CAP=45 proved the harness (survived day 46, wave 3, pop 9/9, 0
mislabels) and was deleted per the prereg. Main panel ran in two
parts: the first attempt completed 92101–92102, then the runtime
session was lost (process gone, no node driver running, no error
captured — a session/runtime loss, not a driver crash: 92103 ran
clean standalone afterwards); 92103–92104 were re-run in one command
(exit 0, ~68s). Heartbeats: registration, ~10:16, ~11:01:35, ~11:15,
~11:24 UTC.

## The seed-band correction (read first)

The run's first panel (seeds 94301–94304) is **superseded and does
not carry the verdict**. A same-day AGENTS.md lesson (Loop A 0915Z
dmground, 2026-11-05) corrected the freshness check: a band named in
ANY prior prereg is not fresh even with no corpus. Seeds 94301–94308
were run 2026-10-24 by sim-pantrystarve-b (8-seed pilot corpus), so
943xx is contaminated. The first-panel outputs (4 seed JSONs + 24
transcripts + README) were moved to
hidden_files/evidence/2026-11-05/superseded-r104-943xx/ (kept as
evidence, not deleted) so the analyzer reads only the fresh panel.
New band 92101–92104 verified fresh by the full check: 0 filename
hits, 0 .md mentions including all preregs, 0 hits in forbidden-band
lists. The 94xxx–97xxx ranges are saturated (944/945/947 named in
prior notes; 94601–94728 a planned casecount band with corpus files;
951 cookbulk; 961 awayration2/hurttraveler; 971 arrears/hurthome;
981 used; 881 eggroad/endgame; 99201–99208 forbidden).

For the record, the superseded 943xx panel had P-KEEP NAMED 2
(Devon 94301 d45->60 fulfilled thanks; David 94301 d45->80 broken
via the deflect beat) — reported here only so the correction is
auditable; the verdict below rests on 921xx alone.

## The fix (landed before the panel)

Root cause (code-read, before any seed ran): P-KEEP was ABSENT in
r103 NOT because the engine cannot name a promise, but because the
only path to the naming lines is seed-gated and seeds cannot survive
the sitting spacing. `ask_favor` resolve on 'promised' plants a
`repay` seed; `repay.opener` names the promise in every state
(open / fulfilled / broken) and settles on speak — but `repay.pick()`
returns 0 (seed-driven only) and `convoCheckSeeds` deletes seeds
older than 7 days, while convo days are 45/60/80 (15–20 days apart)
and favor deadlines are 0–2 days. By the next sitting the seed is
dead AND the favor is settled, and no path selects `repay` from the
favor record itself. The fix (convo-wants.js `convoSelectWant`, after
the seed check so live seeds keep priority): when the villager's
current favor is 'fulfilled', 'broken', or 'promised' with a matching
open obligation, select `repay` directly from the record — mirroring
the existing water/forage `repay` shortcuts. No new lines, no new
system; settles on speak, so each promise is named exactly once.

Proof: scripts/test-journey-deepening-r104-pkeep-20261105.js, **27/27**
(broken + fulfilled + live-seed-wins + asked-never-selects +
stale-opener case). Failing control (fix reverted to HEAD): exactly
the 6 fix-dependent assertions fail, 13/19 — and on old code the
villager opens with a FRESH ask ("I'm past hungry — have you got
anything to spare?"), the exact SILENT shape r103 documented.

Second fix, found by reading the superseded panel's transcripts:
`repay` had no `staleOpener`, so a ledger-blocked fresh opener fell
to the generic stale opener leaking the engine id — David 94301 day
80: "About repay — I keep turning it over." (same defect class as
ask_favor's r16 fix). Added a state-aware `staleOpener` to the
`repay` def (+38 lines, open / fulfilled / broken reframes naming
the favor's short). Proven by proof-test case 5. The 943xx panel
measured fix 1 only; **the 921xx re-run measures fix 1 + fix 2
combined** — state this wherever the panel is cited.

## Panel verdicts (pre-registered, no re-scoring)

- **P-KEEP (primary): ABSENT by the pre-registered metric — but the
  mechanism fires in the wild and the metric misses it. Read both
  halves.** Threads 12: NAMED 0, SILENT 5, DEAD 2, NO-LATER-SITTING
  5. Revisited-alive threads = 5, NAMED 0 — the pre-registered
  threshold (NAMED >= 1) is NOT met, so the scored verdict is
  ABSENT. The honest picture, from the transcripts themselves:
  - Ruth (92102 day45->60/80, broken pantry-run promise): day 80
    is a **`repay` sitting selected from the record** — 35 days
    after the promise, no live seed — and the opener names it:
    "About the pantry run — I keep turning it over. It's done now,
    but I haven't forgotten it." The fix works exactly as designed
    in the wild. The analyzer scores the thread SILENT because its
    regex (`/promis|missed|debt|\bowe\b|owed|forget it/i`) does not
    match the stale-opener wording ("haven't forgotten it" is not
    "forget it") nor the deflect-2 beat used ("Okay. Your call."
    — "unpaid, and counted" carries no regex word). Only 3 of the
    fix's 9 naming lines match the regex (fresh fulfilled, fresh
    broken, stale fulfilled-2 "I still owe you the thanks"); the
    other 6 — both stale open lines, stale fulfilled-1, both stale
    broken lines, fresh open — do not. The scored ABSENT understates
    the fix's reach; the metric, not the fix, is what failed here.
    Proposed revision for the NEXT run (metric review below): widen
    the regex to the stale-opener vocabulary, and/or count a later
    sitting whose want is `repay` as structural NAMED (repay only
    surfaces for an unsettled promise).
  - Adaeze (92102 day45->80, food promise): day 80 opens a NEW
    water favor, not repay — the day-45 promise did not survive to
    that sitting as the current favor. The ledger holds ONE favor
    per villager: a newer ask buries the old promise (or it was
    settled off-camera in a between-sittings conversation, which
    the instrument cannot see). Coverage bound of the fix: it can
    only name the CURRENT favor.
  - Tanya (92103, seek_taken, 3 threads): the taken-kin promise is
    re-presented at EVERY sitting (day 45, 60, 80) via its own seed
    — "About what happened to my taken kin — You talk to it -- the
    System. Have you ever asked? About the taken -- about Leo?" —
    and re-promised each time, never resolved (the bot never asks
    the System). Same instrument-boundary case as r104-943xx's Anh:
    the promise is visibly carried forward, but the wording has no
    regex word, so all 3 threads score SILENT.
  - Before/after on the same instrument: r103 0 NAMED / 2
    revisited-alive → r104 0 NAMED / 5 revisited-alive. The count
    did not move; the transcripts did (one repay sitting, promise
    named, regex-blind).
- **V-INIT-BOND (carried): 0 across the whole panel — blank stands.**
  0 of 17 sittings contain an NPC-initiated bond proposal.
  Player-side invite options offered in 6/17, betrayal invitations
  in 4/17. The fix does not touch bonds; the system-level blank (no
  engine path for NPC link proposals) still needs a builder brief,
  not a tweak.
- **G-SENSE (carried): 0 senseless sittings.** All 17 transcripts
  read in full — see people check.
- **B-SIT (carried): 4 betrayal sittings** (3 accept / 1 decline /
  0 unanswered). **B-FOLLOW: 2 follow-up sittings**, 1 with a new
  betrayal. **B-LEAD (descriptive): 2 sittings** with betrayal
  lead-ins — both Ruth ("Come see what I found.", "Walk with me?").
  Blocked-agreement clean (badBlocked=0, badRevisit=0 on all
  seeds).
- **D-THING (descriptive, r95 open item — still open):** 1 decline
  leaves a pocketed thing (Ruth 92102 day45); 0 revisited in a
  later sitting, 0 mentioned. The pocketed thing still never comes
  back. Same count method as r103.
- **S-TRACE (carried): EXPLAINED 3/4, NO-REGIONAL-DAYS 1/4**
  (92104 lost day 34, before the deepening window). G-mismatch 0
  on every seed and day (the r102 fix holds). G-STICK: 92102 stuck
  6/6, 92103 stuck 5/5 (top goals do not move across the window —
  same shape as prior runs). G-LINES: food_security dominates
  (167/202, 217/250, 202/237, 37/37); bonds 0, knowledge 0,
  build_standing 0, gear_up 0 everywhere. K-CONTEXT lessons 23/23,
  12/22, 42/52, 9/14; bot proposed a link on 3 of 4 seeds
  (propose=1 linked); diplomacy 0 everywhere, as in r102/r103;
  mislabels 0.
- **Survival (descriptive, not a winnability verdict): 2/4
  survived** (92102 day 101, 92103 day 100, both wave 4, regional);
  92101 lost day 56, wave 4; 92104 lost day 34, wave 3. Standing
  max 135/150/120/0. All seeds reached at least wave 3; none
  reached wave 5. Meat channel alive on all seeds (kills 21/30/21/
  16, tests 7/8/2/3, reveals 7/7/2/3, dinners 5/7/1/11 — 92102's
  belltoad tested POISON, as 94304's did; 92104 ate 11 monster
  dinners in its 34 days before dying).

## Village assessment, in plain words

Two villages held through the deepening window and two did not —
and the talking this time shows a villager remembering, even when
the counting does not. Ruth, a librarian, carried a broken pantry-run
promise for thirty-five days and named it out loud at the next sit-
down, without any live reminder in the engine — the first time the
deepening window has shown a promise surviving the gap between
sittings on its own record. The villages that survived still barely
link — one link each, none seasoned — and their people still mostly
ask for the same things (food, water, hands) rather than each other.
The villages that died, died early or thin: one at day 34 before the
window even opened, one at day 56 with a single last person left.

- **92101 (lost, day 56, wave 4, regional, standing max 135):** two
  sittings on day 45, then the village thinned to one person by
  day 55. Kathleen's food promise died with her (thread DEAD);
  James's water ask went 'stated' — out on the road, honestly
  deferred. Lessons 23/23 — it knew what it was taught and died
  anyway.
- **92102 (survived, day 101, wave 4, regional, standing max 150):**
  the talker — 7 sittings across the window, the panel's only repay
  sitting (Ruth day 80), a belltoad tested POISON and honestly
  recorded. One link (village_0, age 57, trust 23), unseasoned.
  Lessons 12/22, the panel's shallowest bench, and it still lived.
- **92103 (survived, day 100, wave 4, regional, standing max 120):**
  the steadiest talker — 8 sittings, Tanya asking about her taken
  kin at every one, Yuki's pantry run re-asked as a creek run.
  One link (village_0, age 72, trust 38), unseasoned. Lessons
  42/52, the deepest bench. Alive, knowledgeable, barely linked.
- **92104 (lost, day 34, wave 3):** no sittings at all — the
  village was gone before the first convo day. It still ate 11
  monster dinners in 34 days (dustboar, speedbump turtle, sweeps
  week) and tested three meats clean. A fast death with a full
  stomach.

## People check (all 17 transcripts read)

G-SENSE 0 senseless. Notes, not defects — except the one marked:

- **Ruth (92102, librarian, dry):** day 45 a pantry-run promise
  (declined walk, "A small thing, pocketed."); day 60 the promise
  re-asked via seed and re-promised, walk accepted; day 80 the
  **`repay` sitting** — "About the pantry run — I keep turning it
  over. It's done now, but I haven't forgotten it." — then the
  deflect ("Okay. Your call." They file it away — unpaid, and
  counted.) and eight turns of gossip that never loop verbatim
  ("Theo hums at the beans and they climb faster."). SENSE — and
  the fix working as designed, regex-blind. (The pocketed thing
  from day 45 is never mentioned again — D-THING still open.)
- **Adaeze (92102, ESL teacher, anxious):** day 45 shaking-hands
  hunger ("My hands shake when I try to work.") → food promise;
  day 80 a fresh water ask, the old promise buried. The hunger line
  is real; the burial is the one-favor ledger, not a voice defect.
  SENSE.
- **Tanya (92103, dentist, restless):** day 45, 60, 80 — the same
  taken-kin question every time, each time re-promised ("You'd do
  that? Ask it? ...Thank you. Really. Even asking is more than the
  silence."), each time never answered, because nobody ever asks
  the System. A person keeping a question alive across two months.
  SENSE — and a quiet indictment of the promise that never gets
  kept.
- **Yuki (92103, librarian, cautious):** day 45 curious, no favor;
  day 60 "the need hasn't gone anywhere" (pantry run, 'stated' —
  out on the road); day 80 a creek-water ask and a betrayal accept
  that ends in a secret place ("Don't tell the others. Everyone
  needs one place."). SENSE. Gossip that names real people doing
  real things ("Tanya put hands on a fever yesterday. Fever broke
  by dusk.").
- **Kathleen (92101, barber, fidgety):** day 45 a grieving "Can we
  talk?" opening, betrayal accept repaid with a gifted tool
  ("Here. I made an extra."), then a wound ask. SENSE.
- **James (92101, carpenter, steady):** day 45 water ask, commit,
  then the honest road-deflect ("I'm out on the road. I can't ask
  you to meet me at dawn when I'm miles away."). A promise that
  refuses to be made badly. SENSE.
- **Martín (92102, street artist, bold):** day 45 a wound re-ask
  ("I hate to ask twice, but it's still open.") → promised; died
  before day 60 (thread DEAD). SENSE.
- **Caleb (92103, firefighter, steady):** day 60 "About the food I
  needed — I hate to ask twice, but it's still open. Will you?"
  → promised, no later sitting. SENSE.
- **Jose (92103, butcher, mischievous):** day 45 "Never mind the
  food I needed — we got it handled. Thanks anyway." — a need that
  resolved itself off-camera, spoken plainly. SENSE.

## The blanks this run fills

1. **P-KEEP mechanism proven in the wild; the metric proven
   wrong.** The favor-record select (fix 1) + state-aware stale
   opener (fix 2) produce a repay sitting whose opener names the
   promise 35 days later with no live seed (Ruth 92102 day 80).
   The scored verdict stays ABSENT because the pre-registered
   regex does not match the stale-opener wording — a metric
   revision is proposed for the next run, not applied here.
2. **Repay stale-opener voice defect fixed (fix 2):** `repay` had
   no `staleOpener`, so a ledger-blocked fresh opener fell to the
   generic "About repay — I keep turning it over." Added a
   state-aware `staleOpener` to the `repay` def (open / fulfilled /
   broken reframes naming the favor's short). Proof test case 5
   covers it end-to-end (fresh line lodged in the run ledger →
   stale reframe names the promise, never the id, and still
   settles exactly once). Total proof: 27/27. The 921xx re-run
   measures fix 1 + fix 2 combined.
3. **r102 fix confirmation (carried):** goal mismatch 0 on all
   fresh seeds/days — the stale-goal-line reset holds on the live
   code.
4. **V-INIT-BOND blank re-confirmed on fresh seeds:** 0/17, same
   mechanism (UI-only propose functions). Still needs a system.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3, current = fresh 921xx
4-seed panel: **LOUD on two metrics — w3fights -67% (baseline 18
-> current 6) and fightsByWave.3 -67% (18 -> 6). INVESTIGATED,
EXPLAINED, no baseline roll.** Per-seed: 92101 2, 92102 2, 92103 2,
92104 0 (engagedW3 5/6/4/0, fightsTotal 45 vs baseline 60). The
same build measured 20 wave-3 encounters on the superseded 943xx
band in the same run (7/4/4/5 — essentially at baseline 18), so
the drop is not a code regression: it is seed variance plus early
deaths — 92104 lost day 34 (zero wave-3 exposure) and 92101 lost
day 56. The two surviving seeds still met only 2 wave-3 encounters
each across 100 days. The 921xx panel is a low outlier; rolling
the baseline to it would bake in a short-lived panel. No roll.

## Metric review

- **P-KEEP regex misses the fix's own lines.** Of the 9 naming
  lines the fix routes through (3 fresh opener + 6 stale opener),
  only 3 match `/promis|missed|debt|\bowe\b|owed|forget it/i`
  (fresh fulfilled, fresh broken, stale fulfilled-2 "I still owe
  you the thanks"). The 6 that do not: both stale open lines
  ("still on my mind", "I keep coming back to it"), stale
  fulfilled-1 ("I keep thinking about what you did"), both stale
  broken lines ("I keep turning it over", "haven't forgotten it"),
  fresh open ("have you had a chance?"). Ruth's day-80 repay
  sitting used stale-broken-1 + deflect-2, both non-matching — the
  one in-the-wild firing scored SILENT. Proposed revision for the
  NEXT run (not this one): widen the regex to the stale-opener
  vocabulary (`forgotten|forgot|turning it over|still on my mind|
  had a chance|owe you|keep thinking|coming back to it`), and/or
  count a later sitting whose want is `repay` as structural NAMED
  (repay only surfaces for an unsettled promise). The 943xx
  NAMEDs are not re-scored into this panel; the superseded panel
  is disclosed separately above.
- **P-KEEP undercounts two more shapes (carried from the
  superseded panel, now with fresh evidence):** seek_taken
  re-presentations (Tanya 92103 d45/60/80 — promise re-presented
  and re-promised at every sitting, wording has no regex word)
  and inherited re-asks (943xx Feryal). The verdict stands on the
  scored count; the SILENTs are explained, not re-scored.
- **Coverage bound found (not a re-score):** the one-favor-per-
  villager ledger means a newer ask buries the old promise
  (Adaeze 92102) — the fix can only name the CURRENT favor. And
  namings that happen off-camera in between-sittings conversations
  are invisible to an instrument that reads only convo-day
  transcripts.
- **D-THING stays open** (1 pocketed, 0 revisited, 0 mentioned)
  with the same count method as r103.
- **V-INIT-BOND definition held:** betrayal lead-ins stay out of
  V-INIT-BOND (B-LEAD split kept); the repay sitting this panel
  (want=repay) is not a bond proposal and was not counted as such.
- No pre-registered metric was re-scored mid-run. P-KEEP, V-INIT,
  and the carried instruments are reported exactly as pre-registered;
  the staleOpener addition is a second fix found in transcript
  reading, proven by its own proof-test case, and changes no scored
  number.

## Harness

scripts/journey-deepening-r104-20261105.js (r103 lineage: only
output filenames, header, seed band 92101–92104 changed — the
94301–94304 band in the file header was corrected to 92101–92104
after the contamination finding).
Analyzer: scripts/analyze-journey-deepening-r104-20261105.js
(r103 scans carried + filename/band changes only). Proof test:
scripts/test-journey-deepening-r104-pkeep-20261105.js (27/27).
Game change: src/js/convo-wants.js (+20 record-select lines in
convoSelectWant, +38 staleOpener lines on the repay def).
Per-seed JSONs + 17 transcripts: goal hidden_files evidence
2026-11-05 (journey-deepening-r104-seed9210*.json,
journey-deepening-r104-transcript-9210*.txt). Superseded 943xx
panel kept at hidden_files/evidence/2026-11-05/superseded-r104-943xx/.
Prereg + amendment + this note in repo evidence/2026-11-05/.

## Regression gate

`node scripts/check.js --quick` with
--cacheDirectory=/tmp/jest-cache-playtest, single run, 1204s:
**279 passed, 11 failed** — identical counts to r103's first run.
All 11 are pre-existing game tests (measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
measurement-cache-flags, phone-frame-proof,
trust-observer-neutrality, synergy-stall 120s timeout, capable-bot
120s timeout, establishment-r20-fixes, table-endings 120s timeout);
none touches the fix. Full log: /tmp/r104-checkquick-full.log.
Proof test is not on the green list (same precedent as the r102
test — do not add it).
