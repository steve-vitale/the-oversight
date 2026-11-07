# journey-deepening r116 — the language arc, listened to (2026-11-07)

Leg 2 DEEPENING (days 40–80), DAYCAP=100, CONVO_DAYS [45, 60, 80],
policy competent. Seeds 96401–96404 (+ smoke 96400). Balanced panels:
before (r114 picker verbatim) vs after (LISTEN — in a nonverbal
sitting, after the goon pass, press `speak_back` if offered, else
`nv:listen` every turn). Game code unchanged between panels; only the
driver's picks differ.

## Pre-registration (binding; see journey-deepening-r116-prereg.md)

- Q1 (PRIMARY) — the language arc, listened to. The scholar learns the
  language, then bonds. Instruments: langArcSittings / langArcDays /
  langArcEnd / talkedSittings / goalLineDays (driver-only, both panels).
- Q2 — G-LINES: counter or goals? Join goalSnaps x goalLineDays.
- Regression watches: langGate 0 'none' offers/decisions; replay scan 0.
- Secondaries re-judged fresh: SURV-CONTROL-4, P-KEEP, RE-ASK,
  DEBRIEF-CAPTURE, B-SIT/B-FOLLOW/B-LEAD, FIZZLE-WATCH, S-TRACE,
  D-THING, G-STICK, G-SENSE, AWAY-LINE, Q1-REQUESTS, invite-replay
  watch, V-INIT, r110 nits #3/#4/#6.

Seed band: 96301–96304 (+smoke 96300) REJECTED — the file record was
clean but two sibling loops were live-sweeping SEEDS=96301–96308 at
the time. Fresh band 96401–96404 (+smoke 96400) verified: 0
word-boundary .md mentions, 0 filename hits, 0 seed-context hits, 0
sim-prereg hits, no live 964 use.

## Q1 — the language arc (PRIMARY)

### Before-panel: ARC-UNEXERCISED
6 sittings, 0 flips, 0 post-flip decisions. Elif (Turkish-only,
96401) sat 5 times, exposure 4→18 by day 101, never flipped.
Fernanda (Spanish-only, 96403) sat once, exposure 3→5. 96402 and
96404 had no 'none' holder contact (96404 has a Russian holder at
exposure 4 who was never sat — contact, not exposure, is the gap
there).

### After-panel: analyzer says ARC-FLIPS-NO-PAYOFF — corrected below
4 sittings, 1 end-state flip, 0 post-flip decisions. But the flip
the analyzer counts is NOT an arc flip: 96403 Spanish, exposure 12,
1 sitting, commAfter 'none' — the end-state Spanish level 2 is the
last bearer's own tongue (succession), not a 25-crossing. The REAL
arc flip is invisible to the analyzer, and it happened on 96401:

- Turkish exposure climbed 4→14 (day-17 sitting: open +1, 3 listens
  +3 each) →15 (day 24) →22 (day-52 sitting: 2 listens) →24 (day 60)
  →**25 on day 61 — the grant fired** (probe-logged: `PROBE-GRANT
  day=61 ... langsAfter={german:2, english:1, turkish:1}`). Ursula
  Weber, the day-58 successor, learned Turkish at level 1.
- **Two days later the payoff died with her.** Succession day 63
  (ursula_weber → gen_uuews87) reset languages to the heir's own
  ({english:2}); exposure stayed 25. The scholar died 9 times in
  this run (mantles day 22, 56, 58, 63, 63, 69, 76, 77, 77) — the
  village survived to day 100, wave 5, but the player character
  kept dying, and each death wiped the learned tongue while the
  exposure number lived on.
- A successor inheriting exposure 25 without the language can NEVER
  re-earn it: the grant only fires on a crossing (before<25), there
  is no exposure decay, and commLevel reads languages only — so
  comm stays 'none' forever on 25 exposure. The arc is single-use
  per language per lineage, and fragile to the scholar's frequent
  deaths.

Honest reading: **the arc FIRES; its payoff does not survive the
bearer.** The binding policy decision (KEEP-SITTING + listen on
ARC-FIRES) does NOT trigger — ARC-FIRES needs a flip AND a post-flip
bond/link decision at partial-or-better, and there were 0 (the bearer
died before any Turkish decision could be made, and later bearers
could not speak it). The dead `npcComm` guards stay in place this run.

### The fix (landed in this run)
`src/js/villager-build.js` — `mantleBecome` now drops `langExposure`
for tongues the heir doesn't know (tongues the heir knows keep their
exposure). Exposure is the bearer's lived learning, like languages;
the heir re-earns from zero. Proof test
`scripts/test-journey-deepening-r116-mantle-lang-20261107.js`: 8/8
(RED before the fix: 5/8 — exposure stayed 25, re-earn ran 25→50
with no grant, comm stayed 'none'; GREEN after). Fix-proof sim run
(seed 96401, after-panel): the day-24 sitting shows expBefore 0
(was 14 — the day-22 succession reset it) and the day-52 sitting
re-earns 1→8; the village was lost day 91 before a full re-flip,
so the live re-flip itself is proven by the unit test, not the sim.

### The listen menu flips (second finding, NOT fixed this run)
A listen sitting yields 2–3 listens (+7 to +10 exposure), not the
~+19 the prereg cost model assumed. The listen response has a single
default text when the foreign pool is dry; its verbatim repeat trips
`sayLine`'s no-repeat fallback, which tags the beat `endtopic`, and
the next menu is the verbal endtopic menu (`dlg:subject` / `leave` /
`silence`) — no gestures, no `nv:listen`, for the rest of the
sitting. In the before-panel, 2 of 6 'none' sittings never offered
`nv:listen` at all (the opener line repeated the same way). Carried
to r117 as its own small fix (vary the listen response, or exempt
the listen line from the endtopic fallback).

## Q2 — G-LINES: counter or goals?

| track | before | after |
|---|---|---|
| party_up | HEALTHY (48 tops, 5 lined, capture 172) | HEALTHY (45 tops, 8 lined, capture 158) |
| gear_up | HEALTHY (0 tops, capture 10) | HEALTHY (3 tops, 1 lined, capture 11) |
| bank_veterans | NO-DATA (0 tops) | HEALTHY (0 tops, capture 2) |
| build_standing | HEALTHY (8 tops, 3 lined, capture 28) | HEALTHY (7 tops, 3 lined, capture 20) |
| food_security | HEALTHY (23 tops, 8 lined, capture 799) | HEALTHY (19 tops, 5 lined, capture 711) |
| bonds | NO-DATA (0 tops) | NO-DATA (0 tops) |
| knowledge | NO-DATA (0 tops) | NO-DATA (0 tops) |
| safety | **GOALS-FAULT** (14 tops, 1 lined, 0 capture) | **GOALS-FAULT** (7 tops, 1 lined, 0 capture) |

Safety goals top the dawn list but almost never annotate an
objective with a line, and no safety line was ever captured on a
convo day in either panel. Same shape as r114. Carried: the safety
track's goal lines need a fix, not a re-measure. Bonds/knowledge/
bank_veterans never topped on a convo day in either panel, so they
stay NO-DATA (not a fault — no tops to judge).

## Regression watches — both hold
- Lang gate: NOT-REPRODUCED both panels (before: 0 'none' decisions
  of 24; after: 0 of 26). The r114 gate holds.
- Replays: NOT-REPRODUCED both panels (0 replays; 24 / 26 decision
  sittings). The r114 clear holds.

## Secondaries
- SURV-CONTROL-4: before 4/4 survived, after 3/4 survived → funnel
  unchanged (≥2/4 rule). The after-panel's one loss is 96403
  (village-lost day 72, scholar-death-no-successor); the before/
  after trajectories for later seeds are not identical runs (see
  metric review — re-run probes diverge), so the loss is not a
  policy effect.
- B-SIT: before 20 sittings, 10 accept / 10 decline, 0 unanswered;
  after 19, 10 / 9, 0 unanswered. B-FOLLOW: 19→9 with new betrayal
  before; 12→4 after. B-LEAD: 8 sittings with a betrayal lead-in in
  each panel, all honest ("Come get air with me", "Come see what I
  found", "Walk with me?").
- P-KEEP: before 16 threads (NAMED 6, SILENT 4, DEAD 2,
  NO-LATER-SITTING 4); after 21 (SILENT 7, DEAD 7, NO-LATER 4,
  NAMED 3).
- RE-ASK: true-no-thread 0 in both panels (5 / 8 orphans, all
  fromSeed-origin).
- FIZZLE: 0 dry sittings in both panels — the fix holds in the wild.
- V-INIT: bondSittings=0 in both panels (51 transcripts each) — no
  villager walked up and asked face-to-face. Carried question, still
  open: should a villager ask in person?
- BOND-TELEMETRY: present both panels (before: 36 proposals, 12
  decisions, 6 accepts, 7 link raises, 12 initiated bonds; after:
  36 proposals, 10 decisions, 7 accepts, 11 link raises, 11
  initiated bonds). Instrument errors 0.
- DEBRIEF: before villageLost=0; after villageLost=1, attributed=1
  (96403 scholar-death-no-successor), unclassified=0.
- D-THING: before 8 pocketed, 4 testable, 3 named (all old-rule);
  after 9 pocketed, 5 testable, 1 named. The small thing still
  gets carried and mentioned ("That small thing I pocketed — I still
  have it. Some other fire, maybe.").
- AWAY-LINE: old line 0 in both panels (new line 8 before, 5 after)
  — the reword is live.
- G-STICK: villagers' top goals are stuck — nearly every villager
  holds one top for the whole run (before: stuck 8/8, 7/8, 4/4;
  after: 1/1, 5/5, 7/7; churn near zero).
- S-TRACE: first regional day 36–47; standing at first regional is
  almost all war (war 25–125, diplomacy 0, plenty 0–40).
- Q1-REQUESTS: before 36 staged, 24 decided, 12 expired,
  expiredTalkableUntalked=1; after 35 staged, 26 decided, 9 expired,
  expiredTalkableUntalked=3. REACHED in both panels.
- r110 nits #3/#4/#6: no sightings in the read transcripts.
- Invite-replay watch (hand-read): no invite re-spoken after a
  decision in the read transcripts; BOND-CHOICE answered 24/24
  before, 26/26 after.

## Village assessment (plain words)
- **96401 — the village that kept burying its scholar.** Before:
  survived to day 101, wave 4, all 9 alive. After: survived to day
  100, reached wave 5, 8 alive — but the scholar died 9 times and
  the mantle passed hand to hand, including once to Elif herself,
  the Turkish woman nobody could talk to (she held it 6 days, then
  died). Elif's trust climbed 39→92 across the run though almost
  nobody ever spoke with her — she is the village's most-trusted
  stranger. Ji the pharmacist asked about his taken kin and got a
  promise to ask the System; the promise held.
- **96402 — the quiet one.** Survived both panels (pop 4→3, wave 4).
  Chen Wei the beekeeper kept proposing the Stonebridge link
  (accepted, declined, accepted across sittings — the village
  argues with itself about linking, in the open). No
  no-shared-language contact at all: everyone here speaks something
  the scholar knows.
- **96403 — the village that died twice, differently.** Before:
  survived to day 100 with ONE person left — David the plumber,
  alone in a village of ghosts, wave 4 reached. After: lost at day
  72, scholar dead with no successor. Same seed, two fates — the
  run-to-run wobble is real (see metric review). Fernanda the HVAC
  tech (Spanish-only) was sat once, day 12, and laughed the scholar
  through his first Spanish ("Good try! Again — Eso mismo.").
- **96404 — the strong one.** Survived both panels (pop 5→8, wave
  4). Aminah the social worker deflected a repayment she was owed
  ("They file it away — unpaid, and counted.") and turned down an
  invitation honestly. A Russian holder lives here at exposure 4
  whom the scholar never once sat down with — the arc can't fire
  without contact.

## Sense notes (full transcripts read)
- Elif day-17 after-panel: the translator is live, so the scholar
  already hears her in English — and listening hard anyway makes her
  teeth edge ("hearing them twice, once in their voice and once in
  the System's cheerful wrongness"). The line is flavor, not a
  penalty (elders alone pay −1 trust, once per sitting) — but the
  fiction is strained: why listen hard to catch words the System is
  already translating? The listen is for learning, the translate is
  for understanding; the game never says that out loud.
- Fernanda speak_back: "Fernanda laughs — with you, mostly. 'Good
  try! Again — Eso mismo. Diste en el clavo..' They walk you
  through it, patient as sunrise." Warm and right — except the
  double period ("clavo..", text nit).
- `agency:ask_expedition` is injected into EVERY nonverbal menu,
  including the endtopic menu — an English-verbal action offered
  where no shared words exist. Same class as `dlg:subject` in a
  no-shared-words sitting: the menu offers words to people who have
  none.
- Chen Wei day-14 (96402 before): after accepting a link proposal,
  the menu offered betrayal-investigation options for a case nobody
  had spoken about. The scholar can pivot to it, but a real player
  would wonder why the case is on the table mid-link-talk.
- Elif's trust 39→92 with almost no conversation (three one-turn
  leavings and wake-ups): trust is growing from somewhere the
  transcripts don't show. Worth a look, not a verdict.
- Ji day-45 (96401 before): seek_taken want, honest yes, a promise
  to ask the System, then an invitation declined honestly. The
  conversation bar, working as designed.

## Metric review (for the NEXT run)
1. **The analyzer's flip detection counts end-state languages.**
   It cannot tell an arc flip (25-crossing) from a succession-
   granted tongue (the heir's own language). r117 needs a grant-
   event signal — read the crossing from the capture/journal
   ("can get by in X now") or instrument `langExposureGain`
   directly — before judging ARC-FIRES / ARC-FLIPS-NO-PAYOFF.
2. **The LISTEN cost model overstates.** ~+19/sitting assumed a
   full budget of listens; the real cap is 2–3 (+7 to +10) because
   the listen line repeats and flips the menu. Re-cost the
   after-policy on +8/sitting.
3. **Re-run probes diverge (r109, confirmed again).** The probe
   re-run of 96403 (2nd seed in its process) survived to day 101;
   the panel's 96403 (3rd seed) died day 72 — same seed, same
   policy, different process position. `loadGame` re-seeds
   Math.random and the policy RNG per seed, so the leak is
   elsewhere (module-level state across seeds in one process).
   Before/after same-seed comparability is strongest for the
   first seed in a process and weakest for later ones. Panels
   should be run one seed per process, or the leak found.
4. **Probe tooling:** `runDays` silences `console.log` inside the
   day loop — probe hooks must log to a file (like W3TRACE does),
   not the console. An hour was spent on a silent hook before
   this was found.
5. Q1-REQUESTS expiredTalkableUntalked rose 1 → 3 after-panel;
   small numbers, watch it.

## Infrastructure notes
- Lock created 2026-11-07T20:12:16Z, run_id 2026-11-07T20:12:16Z.
  Rotation 2→3. Heartbeat kept <15 min throughout (registry flock
  contention is heavy; some heartbeats took ~100s+).
- Prereg commit 6958c864f; the safe-commit index clobber struck on
  it and was repaired with the HEAD-blob recipe (all 5 blobs
  verified, status empty).
- Proof tests green before the panels: listen 19/19, analyzer 27/27.
- The fix + proof test are committed with this note (see below).
  The fix-proof sim files are kept as
  journey-deepening-r116-fixproof-seed96401.json + 16 transcripts;
  the panel's after-96401 files were restored byte-identical
  (md5-verified) after the fix-proof run overwrote them.
- Empty-commit recovery: the first note commit (1e6215641) was EMPTY
  — the note and fix-proof files live in the goal hidden_files
  evidence dir, not the repo's evidence dir, so safe-commit found
  nothing to stage and committed air instead of failing loudly. The
  empty commit was dropped (`git reset --soft HEAD~1` on this
  private branch) and the note copied into the repo's evidence dir
  (r114 convention: preregs + run notes in the repo, raw panel
  outputs in hidden_files). safe-commit.sh should refuse an empty
  file list; carried as a tooling fix, not done here.

## Telemetry
- Baseline: hidden_files/telemetry-baselines/deepening.json (4-seed
  sums, r90 panel 93301–93304). Metrics: survival, wave,
  population, bondDecisions, linkDecisions. (See gate section for
  the check result.)

## Regression gate
- `node scripts/check.js --quick` in the worktree (see below).

## Carried
- V-INIT: bondSittings=0 both panels — should a villager walk up
  and ask face-to-face?
- Q2 safety GOALS-FAULT (both panels): safety tops exist, lines
  almost never annotate, capture 0. Needs a goal-line fix, not a
  re-measure.
- Listen-menu flip (listen line repeats → endtopic menu, 2–3
  listens/sitting): its own small fix for r117.
- `dlg:subject` / `agency:ask_expedition` offered in nonverbal
  sittings: verbal actions where no shared words exist.
- "Diste en el clavo.." double period (Fernanda speak_back line).
- Elif trust 39→92 with almost no conversation: where does it come
  from?
- r117: Q1 re-judge needs the grant-event instrument (metric
  review #1); panels one seed per process until the cross-seed
  leak is found (metric review #3); skip-vs-sit decision still
  open (no ARC-FIRES binding this run).

## Commits
- 6958c864f — r116 prereg: language arc (listen policy) + G-LINES
  counter-vs-goals; r116 driver/analyzer/proof tests.
- 3b7e2abdc — mantle keeps the language arc alive across
  succession: drop langExposure for tongues the heir doesn't know
  (villager-build.js) + proof test (8/8).
- (this commit) — this run note. Raw panel JSONs/transcripts and the
  fix-proof files stay in the goal hidden_files evidence dir (the
  repo's evidence dir holds preregs + run notes only, per the r114
  convention); the fix-proof files are
  journey-deepening-r116-fixproof-seed96401.json + 16 transcripts
  there.

## Judge: REACHABLE / FUN / WINNABLE (leg 2)
- REACHABLE: yes — wave 4 on all 8 seed-panels, wave 5 on one;
  the language arc is reachable by sitting and listening, and the
  fix keeps it reachable across successions.
- FUN: mostly — the conversations read like people (promises kept,
  repayments deflected, invitations declined honestly), but the
  no-shared-words sittings still dead-end into a menu with no
  gestures in them, and the scholar dying 9 times in one village
  makes the arc's payoff feel borrowed, not earned.
- WINNABLE: not yet — no full seat in this leg's window (expected;
  the leg ends at day 80–100 and the win is downstream), but the
  funnel is unchanged (4/4 → 3/4 survived) and the binding link
  under test — wild language learning feeding bonds — now has a
  working mechanism and a surviving payoff.
