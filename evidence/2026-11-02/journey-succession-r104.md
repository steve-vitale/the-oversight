# Journey succession r104 — SAME-DAY ≠ SAME-ITERATION, KEEPSAKE LINE VERIFIED BY PROOF (lane B, 2026-11-02)

Leg 7 (succession). Prereg: evidence/2026-11-02/journey-succession-r104-prereg.md
(written before any panel play; one correction made before launch, see
below). Pilot panel + proof + no src/js change. Base: worktree
registered on master b312c404b (Loop B 0619Z coordinator evidence).
Seeds 30401–30404, competent policy, POST_DAYS=70, EARLY_KILL_DAY=40.
30401, 30402 chain-forced (20/20/10/10 dplus); 30403, 30404 controls.
Pilot-only per the pre-declared trigger: NO expansion (see Q1 — the
same-day pair is cross-iteration, so the literal same-iteration
trigger did not fire; expanding on it would be a mid-run re-scope,
§14).

Slug deviation, documented: the body slug journey2-succession is
unusable (done-merged registry entry + orphan directory on disk,
same class as r83/r87/r89/r91/r94/r97/r100). This run uses
journey2-succession-r104.

No lock file existed at run start, so no stale-lock recovery was
needed; fresh lock written (2026-11-02T07:56:10Z), to be deleted at
closeout ONLY if it still carries this run's run_id (r97 lesson).

## Run setup — clean registration, slow start, fast seeds

- Worktree registration slow (~4 min under sibling load) but clean;
  heartbeat landed at registration (07:57:42Z, verified by registry
  read-back) and a 10-minute heartbeat loop ran for the whole run
  (loop beats verified in the registry, e.g. 08:02:13Z, with a
  readable log, never /dev/null). No EPERM flap this run.
- Smoke tests first, throwaway seeds, files deleted before the
  panel (verified: no 30998/30999 files remain): SEED=30998 5d/5d
  proved the doAction wrap runs (JSON parses, seed present, first
  death recorded); SEED=30999 5d/25d SECOND_KILL_DPLUS=3 proved
  the iteration stamp on real chain entries (Jacob→June day 9
  iter 3, June→Zoe day 20 iter 14 — the second entry organic,
  stamped with the runDays iteration in which it occurred).
- Panel: all 4 seeds exit 0, first attempt, all parse-verified.
  Runtimes ~98s / 81s / ~100s / ~100s (controls ran back-to-back
  in one backgrounded call).
- Canon: docs/CANON.md read in full before playing;
  docs/DIRECTIVES.md re-read; DEAD-LEDGER.md mentions succession
  only in passing. No canon doc covers succession/mantle — none
  invented. Gating freeze (2026-10-27) untouched. No gate,
  deed-bar, standing, wave, or table-price change is in scope or
  made. Zero src/js changes this run.
- Prereg correction (before the panel launched, not mid-run):
  the draft's determinism leg said "byte-identical apart from the
  new iteration-counter field". That was wrong — the counter is a
  pure function of the loop index and the game trajectory, so it
  adds no nondeterminism, and exempting it would hide exactly
  the drift the leg exists to catch. The leg as run requires
  full byte-identity, and it passed (see below).

## Headline

The day/iteration distinction is now PROVEN FROM THE RECORD, not
argued from code order. Seed 30402 produced a same-day handoff
pair — Grace→Nora day 75 (iter 40, scripted third kill) and
Nora→Nathan day 75 (iter 41, organic death in the next
iteration's runDays) — with DIFFERENT iteration counters. A
same-day double is therefore NOT a same-iteration double, and
the r91 collapse (organic death during runDays + scripted kill
after that same runDays, one iteration) remains a different,
still-unobserved phenomenon. The split trigger must name its
resolution: same-day pairs are now the observed phenomenon;
same-iteration is still the (e)-rebaseline trigger (see Metric
review). The iteration stamp itself is verified: 11/11 panel
chain entries carry an iter, 0 missing, and the determinism
leg re-ran 30401 byte-identical including the new field.

## Panel (policy oracleV2-equivalent competent play, 70d post-death)

- 30401 (forced): Hector→Hudson d12 (organic, phase-A
  death-aware stop) → Alejandra d32 → Elena d52 → Sam d63 →
  Fatiha d65 (organic) → Gina d74 (scripted fifth) → Desmond
  d77 (organic) → Ursula d79 (organic). Ends 7 alive, pantry
  27,141, stage 3, codex 59 plants / 27 skills, trust climbed
  (office 28→72, village 21→48). 7 chain handoffs, all causes
  known.
- 30402 (forced): Jian→James d34 (organic) → Grace d55 →
  Nora d75 (scripted third) → Nathan d75 (organic, iter 41).
  Village LOST day 76: Nathan died "the wild", 0 alive, pantry
  0, 14 fallen. The fourth-kill window (day ≥85) was never
  reached — NOT a recorder miss under the pre-registered bar.
  The keepsake line fires for Nathan in the lastSay record
  ("What Nathan kept close goes into the ground with them").
- 30403 (control): Otis→David d9 (organic) → Catalina d36
  (organic). Ends 8 alive, pantry 45,906, stage 3, codex
  39/32, trust climbed (office 22→55, village 25→78).
- 30404 (control): Klaus→Jacob d15 (organic), no further
  mantle pass. Ends 9 alive, pantry 81,093, stage 3, codex
  38/18, trust climbed (office 42→82, village 30→76).

## Bars (binding, §14 — judged as pre-registered)

- DETECTOR: chainDeaths == tele succession.chainDeaths on 4/4
  (7/7, 3/3, 1/1, 0/0), chainKnown == chainDeaths on 4/4. No
  collapse. PASS.
- CHAIN5-READABLE: full fifth handoff recorded on the one
  forced seed that reached its fifth-kill window (30401:
  Fatiha→Gina, relPre5 + relPost5 true). 30402's window was
  never reached (village lost d76) — reported as such, not a
  miss. PASS.
- CHAIN5-BONDS: fifth-successor bonds survived 1/1,
  affinityDiff5 = 0. PASS.
- V1 (vanish re-confirmation): 6 handoff disposition records,
  9 vanished ids, V1-violations = 0. Every vanished id is
  class 'sentimental'. PASS.
- V2 (vanish re-confirmation): V2-violations = 0. No
  sentimental id shows corpseN > 0. PASS.
- V3 (descriptive): 17 SENTIMENTAL-SURVIVES lines, each with
  its saving location named (successor / living villager /
  pantry / prep stash / stash). Mechanism stays CLOSED as
  designed (r100's verdict holds on fresh seeds).
- M3v2b: 4, 4, 4, 3 — 4/4 seeds ≥ 2. PASS (bar ≥3/4).
- C1v3 ok=true on 4/4; S1 missingExact=0 on 4/4; MG2v2 true
  on 4/4; M1/M4 true on 4/4. PASS.
- INVITE SEAM: every invite outcome spoken — 23 INVITE-SPOKEN
  lines, zero UNSPOKEN lines in the analyzer output. PASS.
- MG2 (not a bar, reported): 30402 false (viol=1) — a
  non-meal half-ration voice on day 76, the village-lost day,
  with pantry at 0 and halfVoiceMeal false. Death-spiral
  noise on the collapse day, not a meal-gate defect; MG2v2
  (meal-line only) holds on all 4 seeds.
- KEEPSAKE-LINE: judged HONESTLY, not as a pass. The bar as
  written ("line fires on every handoff with ≥1 vanished
  sentimental") is NOT verifiable from the panel record: the
  driver persists only sampled call-bucket lines and lastSay,
  so the line survives incidentally (30401: one Hudson line
  in officeMoves[6] bearerSample; 30402: Nathan line in
  lastSay) while scripted-handoff lines are not retained per
  handoff. This is an INSTRUMENT gap, not a game failure:
  the mechanism is proven by the keepsake proof test (ALL
  GREEN — burial line fires with keepsakes, silent without,
  corpse carries torch only) and by organic samples in the
  record. The literal per-handoff bar is carried to Metric
  review (persist a per-chain-entry keepsakeLineFired flag),
  NOT re-scored as a pass.
- PROOF: keepsake proof ALL GREEN (12 PASS lines, incl. the
  separate-process control). Naming proof (a)–(d),(f)
  PASS; (e2) 4/4 PASS on the current-master 28152 trajectory
  (Petra→Violet→Latifa→Liezl→Dmitri→Ruby, fifth
  Dmitri→Ruby, tele bearer 6); (e) FAILS on its stale r91
  expectation as pre-declared (6 FAILs, all
  trajectory-expectation class: fifth Petra→Catalina,
  chain length 7→5, first six, day-71 pair, day-71 via,
  tele 8→9 vs actual 6). (e) is NOT edited and NOT
  re-baselined: the re-baseline trigger (a genuine
  same-iteration double on the fresh panel) did not occur.
- Determinism leg: 30401 re-run BYTE-IDENTICAL (stdout
  diff empty; tele sha256 unchanged after rewrite). The
  iteration-counter fork is trajectory-neutral. PASS.
- Expansion trigger: NOT fired on either prong — no
  same-iteration double (sameDayPairs=1, sameIterationPairs=0,
  missingIter=0) and no seed silent under BOTH naming metrics
  (per-seed named/namedAny: 2/4, 2/5, 2/4, 1/5). Pilot-only
  stands.

## Proof-instrument repair (this run's own work, documented)

The prereg named the (a)–(f)/(e2) proof but the initial fork
covered only the keepsake proof; the (a)–(f) proof file
(test-journey-succession-r100-naming) was forked before
closeout (renames only, diff-clean). Its first run exposed a
rename defect of MY making, not a game defect: the proof's
single EVID constant served both the old-record dir
(2026-11-01, r91 records) and the driver's scratch dir, but
the r104 driver writes to 2026-11-02 — so driver-smoke files
read 0/4 and the replay tele read threw ENOENT before (e2)
ran (first run: 37 PASS / 8 FAIL, incl. 2 scratch-dir
artifacts + 1 throw). Repair: split EVID (old records,
2026-11-01) from SCRATCH (2026-11-02) in the proof fork,
deleted the stranded scratch (24998 + 28152 files), re-ran:
43 PASS / 6 FAIL (all 6 stale-(e) class), (e2) 4/4 PASS,
scratch deleted (0 leftovers). The bar itself was unchanged;
the instrument the bar named was actually run. Lesson for
the next fork: a proof file's EVID constant may serve two
dirs — check old-record reads vs driver-write dir separately
after any date rename.

## PEOPLE CHECK — all 18 week-1 transcripts sense-read

Bar: NPC wants something, options engage/deflect, endings
resolve/plant/owe; no fabricated shared history, no filler
loops, no static menus. VERDICT: PASS, with three wrinkles
below (two cleared by code-read, one open).

What works, seed by seed:
- 30401: Alejandra d+3 opens with a real confidence (crying
  quietly at night); d+7 CALLS BACK the d+3 teach ("You were
  right, it was right where you said") — genuine continuity,
  not fabricated history. Elena d+3 opens with
  gossip-about-you ("People are saying things. About you. Is
  any of it true?") and the fear exchange lands ("The
  randomness would almost be kinder"). Grief names the true
  dead bearer (Hector) in both d+7 transcripts, including
  "Nobody says Hector's name right yet" — a new bearer
  learning names.
- 30402: Shanice's wound ask carries real stakes (festers →
  can't haul/hunt/watch) and a real requirement (same side of
  the Haven door); declining it costs ("They won't forget.
  They'll just stop asking"). Tom's confrontation yields a
  real admission ("I took 1× Stone. I won't do it again").
  Grace's d+7 grief for TOM investigated and CLEARED: the
  lately-mourning event names only fresh sapient corpses
  (dayDied within 3 days, convoTopics.js), so Tom died as an
  ordinary villager between d37 and d41 — the village grieves
  someone the player wasn't tracking, which is the system
  working, not a bug.
- 30403: Tao's belief exchange ("That's not naive. That's
  load-bearing") and his firm boundary under confrontation
  ("I told you the truth. You can keep poking it, but it's
  told"). Catalina's d+7 wound re-ask ("I hate to ask twice,
  but it's still open") — an unfulfilled ask persisting
  across days. Otis grief correctly named on both d+7
  transcripts.
- 30404: Dakota's buried cache (+1598 kcal — a gift with
  consequence) and the trust thread carried d+3→d+7 ("You
  said there's someone you don't trust... Do you trust them
  any more now?"). Renee's wound re-ask + Klaus grief. All
  endings resolve, plant (tomorrow's forage, the naming
  debate), or owe (unfulfilled wound asks).

Wrinkles:
1. OPEN — Tom d+3 recap mismatch (seed 30402): the pantry-run
   conversation (plus theft confession) recaps as "Still on
   that wound care." Mechanism traced: the recap label for
   an ask_favor thread comes from a LIVE need scan
   (convoFindFavorNeed: health < 60 → heal_help), not from
   the spoken want — so the recap can name an unspoken
   underlying need (Tom hurt) instead of the conversation's
   topic. Whether Tom was actually hurt at d37 is not in the
   panel record. Carried as an open blank with a precise
   pointer (seed 30402, Tom d+3 transcript, conversation.js
   convoThreadAbout → convo-wants.js convoFindFavorNeed);
   needs a targeted probe (hurt villager's bond convo, recap
   label vs spoken want), not a mid-run fix on speculation.
2. CLEARED — role "duplicates": Elena d+7 and Renee d+7 pick
   scout while Alejandra / Dakota hold it. assignRole
   transfers with a spoken handover ("Scout is yours now.
   There's only one of each") — the transcript just doesn't
   capture say lines, so it reads as a duplicate. Not a bug;
   the competent policy's scout-everywhere habit is a policy
   quirk, not a game defect.
3. MINOR — invite wording: the menu label reads "Want to come
   with us?" while the spoken line reads "Want to come with
   me?" (convo-beats.js:452 vs convo-dialogue.js:787). The
   transcript shows both, which reads as asking twice; in
   the UI it is one tap → one spoken line. One-word copy
   inconsistency, documented, not changed (dialogue copy is
   a Steve-eyes call, not a silent worker edit).

## Village assessment (plain words)

- 30401's village is the succession leg working as designed:
  eight bearers across 67 days, each handoff narrated and
  known, trust climbing at every step, pantry fed, and the
  line ending with Ursula holding a village that knows 59
  plants and 27 skills. The mantle is a relay, not a reset.
- 30402's village is the same leg breaking honestly: three
  handoffs, then the wild takes Nathan on day 76 and there
  is nobody left. The game says so plainly (0 alive, 0 kcal)
  instead of papering over the collapse.
- 30403 and 30404 are steady villages: one mantle pass each,
  then long competent life — pantries deep (45,906 and
  81,093), trust climbing into the 70s–80s, knowledge growing.
  Nothing missing that a player would notice; the blanks
  this run found are instrument gaps and one recap wrinkle,
  not dead ends.
- What villagers know: the dead are remembered by name in
  conversation within days (Hector, Jian, Otis, Klaus), favors
  owed outlive their makers ("Jian owed me a favor"), and
  unfulfilled wound asks come back until answered. What is
  missing: per-handoff keepsake-line retention in the panel
  record (instrument), and the Tom recap question (open).

## Reachable / Fun / Winnable (leg 7)

- REACHABLE: yes. Every panel seed reached a mantle pass
  (organic phase-A deaths on all 4 — no scripted first kill
  needed), chains ran to 7 handoffs, and the fifth-handoff
  window opened on the forced seed that survived to it.
- FUN: yes, on the evidence of the transcripts — the week
  after a death is the most human week in the game (grief
  with names, asks that persist, confessions, callbacks).
  The death itself is narrated, including keepsakes buried
  with the body.
- WINNABLE: the leg is not the win path itself, but nothing
  here blocks it — surviving villages climb trust, bank
  knowledge, and feed deep pantries; the collapsing village
  collapses for game reasons (the wild, empty pantry), not
  for succession reasons.

## Telemetry deviation check

node scripts/telemetry-check.js --baseline
.../telemetry-baselines/succession.json --current
'evidence/2026-11-02/journey-succession-r104-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions
LOUD lines (2), both VERDICT: EXPLAINED, baseline NOT rolled:
- deaths.bearer <redacted> 200%: baseline 5 -> current 15 (n=4 files) — the
  forced-chain panel deliberately kills bearers (30401: 8
  bearer deaths incl. first, 30402: 4, 30403: 2, 30404: 1 =
  15, matching the panel's own death records); regime, not
  drift (r89/r91/r94/r97/r100 precedent, prereg rule).
- census.fallen swung 190%: baseline 10 -> current 29 — same
  cause (per-seed fallen 8+14+4+3 = 29, matching tele).
Quiet: census.alive, census.integrationStage,
week2.deadBearerMentions. Baseline left untouched.

## Regression suite

node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-playtest2 in the worktree:
284 passed, 6 failed (572s) — the 6 are EXACTLY r100's
standing pre-existing families (measurement-proof-update,
measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20-fixes).
No NEW failure. The capable-bot food-deed proof ran (64s)
and is NOT in the failing list — GREEN, as r100 reported.

## Metric review (§14)

- No metric was re-scored mid-run. The expansion trigger is
  the one judgment call: the same-day pair did not meet the
  trigger's literal same-iteration wording, so the panel was
  NOT expanded — reported here with the iter-gap proof, not
  silently re-scoped.
- KEEPSAKE-LINE bar, as written, is not evaluable from the
  panel record (see Bars). Proposal for the NEXT run:
  persist a per-chain-entry keepsakeLineFired boolean (the
  wrapper can read the say lines added by the playerDeath
  call) so the bar becomes checkable; until then the proof
  test is the mechanism evidence.
- SPLIT-TRIGGER proposal for the NEXT run: expand on a
  same-day pair (reporting its iter gap), since day-resolution
  doubles are now the observed phenomenon; keep
  same-iteration as the (e)-rebaseline trigger specifically.
  The r91 collapse shape (organic + scripted inside ONE
  iteration) is still unobserved since r97 — absence
  reported as absence.
- ANALYZER-HEADLINE readability note (not a bar): the CHAIN5
  headline lists scripted-stage successors only, so on 30401
  it reads "Hector → Hudson → Alejandra → Elena → Sam →
  Gina", skipping the organic Fatiha step between Sam and
  Gina. The detailed chains line below it lists all 7
  correctly. A future run may make the headline list every
  bearer; this run leaves it (display-only, detailed record
  correct).
- V3 judged as pre-registered (descriptive): every surviving
  sentimental's saving location is named; no surviving
  sentimental lacks one.

## Closeout

- Commit 1 (d7db7577): 79 files — 5 instrument scripts
  (driver, main analyzer, naming analyzer, keepsake proof,
  naming proof) + 74 evidence files (prereg, 4 panel
  stdout/stderr, 4 tele, 58 transcripts, analyzer + naming
  outputs, 2 proof logs, checkquick log, run note).
  Post-commit index clobber (documented class, staged-deletion
  variant): all 79 files showed staged-deleted AND untracked
  with worktree bytes identical to HEAD. Repaired with
  `git update-index --add --cacheinfo` per file from HEAD
  blobs; verified `git status --short` empty + `git diff
  HEAD` empty. The commit itself was always correct.
- Commit 2 (this closeout section) + merge plan: merge
  --ff-only into master in the main tree, then release +
  remove the worktree and delete the branch, final reap,
  rotation-b verified at 4, lock deleted only if it still
  carries this run's run_id (2026-11-02T07:56:10Z).
- No push, no bump, no live check — merged locally, pending
  ship (ship loop owns version bumps, pushes, live
  verification).
- No [needs-eyes] flag: zero src/js changes, instrument +
  evidence only; nothing here changes what Steve plays.
