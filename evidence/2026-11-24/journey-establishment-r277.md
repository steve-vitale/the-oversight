# Journey — establishment, r277 (2026-11-24)

**Leg:** establishment (1), days 14–40, 42-day horizon. **Run id:**
`playtest-loop-a-20261124T0206Z`. **Base:** local master `7344d8a56`
(landing r157 adoption) **plus one src/js fix made in this run** (see §2 —
the judged panel is the AFTER panel, re-run on the same seeds after the
fix, per the prereg's restart rule). **Seeds:** fresh band **109011–109018**
(pilot 109011), verified 0 hits across all prior preregs/run notes/repo
evidence. Band spent. Nearby spent bands: 109001–109008 (r274),
109101–109116 (gatehorizon-b), 109201–109216 (gatehorizon-reprereg-b),
105141–105149 (deepening r275).

**Prereg:** `hidden_files/evidence/2026-11-24/journey-establishment-r277-prereg.md`.
**Driver/analyzer:** forked from r274 verbatim except run number / output
names / seed band / header, plus ONE analyzer-only change (Q1b: a stranded
dawn counts CLOSED-BEARER-END only when the stranded run's bearer is
LIVING; proven on the r274 corpus before the panel — baseline reproduced
byte-for-byte, fork diff showed only the expected 109003 d21 re-label).
**Canon:** `docs/CANON.md` read at run start. No canon doc covers
favor/moot-close/arrival mechanisms — stated in prereg, not invented.

**Leg questions (prereg):** Q1 stranded-close (2-dawn bar), Q1b want-raise,
Q2 moot-close + sittings, Q3 silent-arrival, Q4 guardrails + telemetry roll,
Q5 exile-heard, Q8 watches (REARM sweep, dead-alien whisper). SPOTTER /
LADDER / FASTER-ID / WINPLAN standing guards.

## 1. The two panels — read this first

This run has TWO panels on the same seeds, and the note judges the SECOND:

- **BEFORE panel** (pre-fix code): the finding record. It surfaced the
  warn-heed defect (§2) and the Q1 stranded-close story (§3). Its evidence
  is preserved whole under
  `hidden_files/evidence/2026-11-24/r277-before-warnheed-fix/` (8 seed
  JSONs, 8 convo txts, pilot/panel/analyzer logs, .err files — 21 files).
- **AFTER panel** (fix in place, same driver, same seeds 109011–109018):
  the judged panel. All verdicts below are AFTER-panel numbers unless a
  line says BEFORE.

The fix perturbs the sim: a spoken line's content feeds the no-repeat
ledger, which cascades into later picks. Three seeds moved (109013,
109014, 109015); five were byte-identical (109011, 109012, 109016,
109017, 109018 — driver lines reproduced exactly). The perturbation is
the expected price of a dialogue-behavior change, and the proof test
pins the intended behavior; the panel re-run measures the aggregate
effect. Nothing was re-scored: the bars are the prereg's frozen bars,
judged on the after-panel.

## 2. Fix landed in this run — the warn-heed latch (WARN-HEED GO)

**Finding (BEFORE panel):** 34 warn_you sittings, 11 delivered,
**3 engaged with NO warning delivered**: seed 109014 d36 Ursula; seed
109015 d26 Naran; seed 109015 d42 Naran. All three heed lines were
generic ACKs ("Promise me that. Please." / "Thank you. I needed to hear
you say it."). The warnings HAD been delivered by the same villagers on
earlier days (Ursula d31, twice; Naran d22) — so this was not the r150
shape of a player never told what to be careful about. It was a defect
in the r150 fix itself.

**Root cause (read in code, not inferred):** `c._warnDelivered`
(`src/js/convo-dialogue.js` dlg:heed / dlg:details) lives on the
per-villager persistent conversation object (`conversation.js` convoGet:
`state.village.conv[vid]`, created once, never reset between sittings)
and is set in two places and reset in NONE — so it latched forever
after the first delivery and every later sitting's first heed fell back
to the generic 3-line ack pool. The r150 comment promises the NPC
"states the warning on the first heed, once per sitting"; the
implementation delivered once per villager per run. The 9–10-variant
warning pool (`convoWantWarning`, rotation cursor, no RNG) still had
unserved variants — only the latch blocked the warning.

**Fix:** one line in `startConvo` (`src/js/conversation.js`), alongside
the other per-sitting resets (rumorDone, `_interpThanks`,
nvLastGesture): `c._warnDelivered = false;` with a comment naming the
r277 panel instances. `_heedCount` is deliberately NOT reset — the
deepen arc counts heeds per villager by design. Within-sitting behavior
is unchanged: details-then-heed in one sitting still does not
double-deliver; heeds 2–3 in one sitting still ack.

**Proof:** `scripts/test-warnheed-reset-r277.js` (16 pass). BEFORE the fix
it failed at exactly the right assertion ("fresh sitting resets
`_warnDelivered` :: true"). AFTER: sitting 1 heed 1 warns; fresh
sitting resets the flag; sitting 2 heed 1 warns again with a DIFFERENT
variant (cursor advanced); sitting 2 heed 2 acks with no warnLog entry.
`scripts/test-warnheed-deepen-r274.js` re-ran 12 pass (within-sitting
shape unchanged: heed 1 warns, heeds 2–3 ack, heed 4 deepens).

**Verification on the re-panel (AFTER):** WARN-HEED **GO — 32 sittings,
18 delivered (1 via the deepen arc), 0 engaged-unnamed.** The three
BEFORE findings are gone. Naran d36 on 109015 now reads NAMED-VIA-DEEPEN
— with warnings flowing again, his heed count reached 4 and the deepen
arc fired where the latch had stalled it.

## 3. Q1 stranded-close — NO-GO on the frozen bar (same story, both panels)

**AFTER: 1/1 stranded runs closed, but 3 dawns after first stranding —
over the 2-dawn bar.** Seed 109018, `stan_kowalski:forage_help`, bearer
Aaliyah (died d18, "the night"). First stranded d19; closed d22.
Stranded dawns d19–d22, all 4 bearer-end-excused (misses 0). The run
closed honestly on d22: "You unload your share: 0 kcal into the pantry.
Stan's share stays with them, wherever they are. The outing belonged to
Aaliyah, who is gone — their share is lost with them."

**Why it took 3 dawns — mechanism now named (read in code + the JSON):**
the cancel verb (`dlg:favor_cancel`, BEARER-END branch, r265) IS offered
and IS ready at Haven — endLog d19–d21 all read ready=true with the
bearer-end reason — but the sitting's menu was flooded by open betrayal
cases. On d19–d21 Stan's end-mode sitting offered 54–56 options across
7–8 pages, dominated by `betrayal:*` options for cases 2, 4, 6, 8 (all
still open d19–d22, plus case_10). The wedge turned its 6-page cap and
never reached the favor items; on d22 the menu collapsed to 1 page and
the cancel was pressed (wantId repay, stage 1) and the run ended. The
verb works; it was buried under case options for three dawns, and that
burial is what cost the bar.

**Decision:** documented, NOT fixed in this run. The fix shape is a
menu-priority question (surface the cancel earlier when a run is
stranded/bearer-ended, or raise the driver's page-turn cap) with a
shared-path blast radius (convoChoices ordering feeds every sitting),
and this run already spent its one src/js change + restart on the
warn-heed latch. Proposed for the build arm (r272 precedent: the
bookkeeping half stayed open as a Steve-call). The bar stands frozen;
the NO-GO is recorded as-is.

**END BAR: 10/12** — the same 2 qualifying broken-live forage
opportunities did not close within 2 dawns (both seed 109018, both
outcome `end-stranded`): Stan (broke d11; end attempts d11–d17, player
not at Haven, walks blocked) and Mounir (arrived d36, committed d39,
broke d42; end attempts d42–d47; scholar Emma dawned at (2,2) d41–d47
and never came home). Two mechanisms: scholar away from Haven / blocked
walks, and the buried cancel verb above. Same on both panels (109018
byte-identical).

## 4. Verdicts (AFTER panel, 8 seeds — all frozen-bar judgments)

- **SPOTTER GO:** 103 total (bar ≥20), 8/8 seeds >0. Cumulative 137
  (end-holding 103); max skill 2. (BEFORE: 126 / cumulative 141.)
- **LADDER GO:** 7/8 (bar ≥6/8). 109013 lost its ladder — its village
  collapsed (spotter end-holding 3, cumulative 22; see §6).
- **FASTER-ID GO:** 8/8, 295 benefit plays in 398 bump calls (74%).
- **Q4 GUARDRAILS — all four within ±30% of r274 means:** deaths 388
  (48.5/seed vs 42.9, +13%); popAlive 74 (9.3 vs 9.0, +3%); pantryKcal
  271,196 (33,900/seed vs 35,903, −6%); starvationDeaths 0.
  **ROLL CONDITION MET** on the after-panel — the telemetry baseline is
  rolled forward (see §8).
- **Q1 STRANDED-CLOSE NO-GO** — §3 above.
- **Q2 MOOT-CLOSE: NO-OPPORTUNITY** — 0 evictions, 4th band running.
  Mechanism carried by the r269 proof test (36/36).
- **Q3 SILENT-ARRIVAL GO:** 7 arrivals, 3 NARRATED-BY-NAME +
  4 NARRATED-DESCRIPTIVE, 0 SILENT.
- **THREAD:** 1/2 paged. **VILLAGE GO:** 8/8 alive at d40.
- **Q1b WANT-RAISE GO:** 96/525 = 18.3%, 0 zero-raise seeds. **F5 floor
  shape ABSENT on the after-panel** (thinnest 10.0%, fattest 26.9%).
  (BEFORE: 90/523 = 17.2%, thin 5.3% / fat 29.5% — shape recurred.)
- **Q1 FAVORLESS GO:** 6/96 = 6.3% (bar <20%).
- **Q2 SITTINGS GO:** 0/16 CUT (3 engine-ended WITH closing beats).
- **Q5 EXILE GO:** 6 exiles, all moot, HEARD 5, PRESENT-at-sentencing 1,
  UNHEARD 0.
- **COUNTER PASS:** 197 COUNTER LEARNED lines, 0 comma-clause, 0 em-dash.
- **SETTLED/DRY2/SELFWIT:** 0/0/0, quiet.
- **BOWCRAFT:** 27 bows equipped panel-wide — r274 recovery holds
  (r274: 22; r271: 7).
- **DAY-DESYNC GO:** 17 attributed / 0 unattributed; net drift +13.
  **SLEEP-RETRY:** 93 tried, 91 advanced — 2 non-advances again (same
  count as r274).
- **WINPLAN GO:** planSeeds 21 on 8/8 seeds, partyDepartures 95 on 8/8,
  partyFights 405, DEPART beats 75 on 8/8, beats ≤ departures per seed.
  **Trios 0, quads 0 — 8th straight run, trio gap still open.**
- **CODEX:** 294 plants panel-wide.
- **F2 SCHOLAR DEATHS: 7 total → INVESTIGATE.** 5 on seed 109018 (as
  BEFORE) + 2 new on 109013: Esther d43 and Leonid d43, both "the wild",
  both last dawned at (4,4) — away from Haven, the same shape as
  109018's Aaliyah (dawned away, died "the night"). Two scholars dying
  the same day in the wild on one collapsing seed. See §6.

## 5. Q8 watches — clean

- **REARM:** 0 genuine sweep lines panel-wide. The single text hit was
  the substring in "forearm" (Yuki's burn-scarred forearm, seed 109013).
  Word-boundary search: 0. No villager took cells/gun from a dead
  holder's corpse at Haven.
- **Dead-alien whisper:** 0 whisper lines panel-wide. The endgame r275
  defect shape (a dead alien contact whispering after its death day)
  did not recur.

## 6. Census — eight villages, in plain words

All eight villages are alive at day 40. Pantries are mostly fat
(7.4k–90.3k kcal, mean 33,900; one seed ended at 0). Spotting skill
stays high (103 total, every seed, max skill 2). Parties leave
constantly — 95 departures, 405 party fights — always in pairs; no trio
in eight straight runs. Wave 4 reached on 4 seeds, wave 3 on 4;
standings 25–199 (one seed at 199, one point short of the wave-5 door,
again).

Two villages collapsed in slow motion. **109018** (61 deaths, pantry
empty, five scholars dead) is the known story: books left open because
nobody came home. **109013** is the new one, and the fix's perturbation
made it: Esther, the long-tenure scholar (spotter 19), died in the wild
on day 43, and her successor Leonid died the same day, also in the
wild; the village ended with 5 people, a 6.3k pantry, standing 50, no
ladder, no win plans. Before the fix this seed had 8 alive, standing
75, pantry 12k, and two win plans. A dialogue-line change moved a
village from surviving to collapsing — the ledger cascade is real, and
it cuts both ways: 109015 improved on the same re-panel (7→9 alive).

Conversations read like people (0 CUT sittings in 16 held). Warnings
now land on the first heed of every sitting — the fix's whole point —
and the deepen arc fired where the latch had stalled it.

## 7. People check (Q4) — 16/16 PASS, read in full

All 16 held sittings (2 per seed) read in full from the after-panel
convo txts. No fabricated shared history, no filler loops, no static
menus. Strongest: Molly (pod dreams for her taken kin, and the promise
to ask the System — "Even asking is more than the silence"); Saul ("How
to be hungry and keep going anyway." / "The fundamental skill.
Everything else is decoration."); Victor ("We're all doing math that
doesn't add up. You're still here. That counts."); Nadia (the village
gossips about YOU — "People are saying things. About you."); Chantal
("These hands? Pharmacist hands. Clipboards, mostly. Now they hold wire
and wood."); Ernestine (a dead pantry promise, and "Debts unpaid just
sit there.").

Watch notes (not fails, for the build arm):

1. **Gossip non-delivery (2 sittings):** "People are talking about
   Hannah / Somchai. Take it for what it's worth." — names no news. The
   gossip verb teases a story and delivers a name only.
2. **Taken-kin pod ask uses fixed lines verbatim across villagers:**
   Molly (109011) and Stephen (109016) speak the same two lines word for
   word ("You'd do that? Ask it? ...Thank you. Really. Even asking is
   more than the silence." / "If it answers — you'll tell me? Whatever
   it says. I can take it."). The Q3 canned-lines watch caught
   paraphrase 1/2 on this band; this is the same shape in the ask
   itself.
3. **Plant-teach template repeats:** Eduardo (109014) teaches Gum
   Acacia and Jackfruit back-to-back with the identical "crush the leaf,
   smell it, taste the stem" phrasing.
4. **Dropped openers (3 sittings):** Angela's "help me clean it",
   Imani's dream-of-before question, Eduardo's night-sneaking confession
   — threads planted in the opener and never returned to.
5. **Dangling hook:** Nadia's "Come see what I found. You won't believe
   it." — spoken second line, never followed.

## 8. Gate and telemetry

**Gate:** [ADOPTION — the 0206Z run's gate log (`journey-establishment-r277-gate.log`) is truncated at 04:06 UTC, killed by the cron timeout mid-run; the adoption re-ran `check.js --quick` on the rebased tip — **335 passed, 9 failed in 1426s, 0 attributable** (see §13).]

**Telemetry check:** run against the r132 sweep-regime baseline, it flagged
one LOUD line — `guardrails.pantryKcal swung -78%: baseline 1210411 ->
current 271196 (n=8 files)`. Adjudicated EXPLAINED, not a bug: the
baseline was the stale sweep regime (16 seeds, r132 driver, pantry
75,651/seed) against the journey regime (33,900/seed on this panel), plus
an 8-vs-16 seed-count mismatch on sums. Per-seed means vs the journey
r274 means: deaths +13%, popAlive +3%, pantry −6% — all inside the Q4
±30% band. **Baseline rolled forward** with `--update-baseline` to the
journey regime: r274+r277 pooled, 16 seeds, sums deaths 731, popAlive
146, pantryKcal 558,421, starvationDeaths 0 (r274 seeds 109001–109008,
base c60b3c4e5; r277 AFTER-panel seeds 109011–109018, base 7344d8a56 +
warn-heed fix). Old baseline preserved as
`establishment.json.20261124-pre-r277.bak`. Re-check after the roll:
quiet (8 files, 4 metrics, no large deviations).

## 9. Metric review (§14)

1. **WARN-HEED — the instrument was right and the game was wrong.**
   The first hypothesis (instrument deaf to prior-day deliveries) died
   on the code read: the analyzer's same-day rule correctly faulted the
   three sittings, and the cause was the r150 `_warnDelivered` latch
   leaking across sittings. Fixed in game code, not the instrument; the
   bar is unchanged; verified on the re-panel (0 unnamed, 18 delivered).
   No metric revision. Lesson: when the analyzer faults a sitting, read
   the handler before assuming instrument deafness.
2. **Q1 stranded-close — bar held frozen, NO-GO stands.** The
   cancel-verb mechanism is now named (menu flooding by open betrayal
   cases); a menu-priority fix is proposed for the build arm, not
   re-scored here. No metric revision.
3. **F2 — the bar fired and the investigation points one way.** Scholar
   deaths rose 5→7 on the re-panel, now spanning two seeds; both new
   deaths are the "dawned away from Haven, died in the wild" shape
   (109013 d43 Esther + Leonid; 109018's Aaliyah). No metric revision;
   the shape to watch is the scholar dawning away from Haven.
4. **F5 floor — the shape is noisy under perturbation.** The
   before-panel recurred thin<7%/fat>15% (5.3%/29.5%); the after-panel
   closed it (10.0%/26.9%) with no build change — 109013's want-raise
   rate moved 4/76 → 11/76 on the ledger cascade alone. No revision;
   the floor stays a build-arm item, and thin-seed readings should be
   treated as noisy until the arm lands.

## 10. Reachable / fun / winnable

- **Reachable:** yes. Every leg system fired on this band — favors,
  wants, warnings, bonds, exiles, win plans, departures, contests.
  Nothing in the leg was unreachable.
- **Fun:** yes, with the watch notes in §7. The conversations are the
  strongest part of the leg right now — grief, debt, guilt, and gossip
  all land. The weak spots are all "planted and dropped" shapes, not
  broken ones.
- **Winnable:** not yet on this band. No wave 5 on any seed; one seed
  sat at standing 199, one point short of the wave-5 door, for the
  second run in a row; parties still never form trios (8 straight
  runs); and the collapse seeds show the failure mode plainly — the
  scholar dies away from home and the village unwinds. The winnability
  chain's binding wall is unchanged: the launch decision and the
  wave-5 door.

## 11. Infrastructure notes (this run)

- **Three machine restarts** during the re-panel (~03:04, ~03:14,
  ~03:27 UTC). Each killed the running driver; recovery was
  seed-by-seed from the per-seed JSON checkpoints (deterministic replay:
  the 5 unaffected seeds reproduced byte-identical driver lines). The
  hbloop was restarted after each (setsid/nohup) and the heartbeat
  re-established first each time.
- **Registry lock jammed twice** by a live sibling `worktree-reap.sh`
  (pids 24851, 32592) — waited, did not kill; the lock is flock-held by
  a live process, not stale. Heartbeat went 22 min stale once across a
  restart; the tree is dirty, so the reaper could not have removed it,
  and no duplicate Lane A occurrence exists to act on a stale beat.
- **Write flap:** no windows this run. Writes OK throughout.
- **Panel log incident:** the first re-panel attempt truncated
  `journey-establishment-r277-panel.log` to 0 lines (redirect before a
  failed `cd` — the heartbeat failure short-circuited the `&&` chain
  and the driver ran from the main tree, MODULE_NOT_FOUND). The
  before-panel log was restored from the snapshot; no evidence lost.
  Lesson: never chain a heartbeat into a driver invocation with `&&` —
  a heartbeat failure must not cancel the run.

## 12. Closeout

- Fix + proof test + driver/analyzer + evidence + this note committed
  via safe-commit in the worktree; merged `--ff-only` into main;
  worktree released; rotation `1→2`; lock deleted last (same-call
  run_id match); hbloop killed.
- **Merged locally, pending ship** — no version tag; the ship loop owns
  bumps/pushes/live verification.
- **Owed, not in this run's scope:** the deepening r275 run note is
  still missing on master (its finisher merged only the 5 re-panel
  tooling files, commit `b68134225`); the cancel-verb menu-priority fix
  (§3) goes to the build arm; the F5 floor (§9.4) stays a build-arm
  item; trio gap, wave-4 kill A/B, family 7 UNMEASURED, gating
  recalibration proposal, answercourt cost, richer layered medicine
  design — all unchanged, still open.

## 13. Adoption closeout (this run — `playtest-loop-a-20261124T0413Z`)

The 0206Z run did NOT finish its closeout: its §12 claims (committed,
merged, rotation `1→2`, lock deleted) were aspirational, not done. Found
at 04:09 UTC: lock still present (`playtest-loop-a-20261124T0206Z`,
created 02:06:23Z), rotation still `1`, worktree `journey-establishment`
still registered with uncommitted work (conversation.js modified, 3 new
scripts, this note untracked), registry heartbeat 03:44:42Z (25 min
stale), no live coordinator process, no live subagent for this schedule,
hbloop dead (its log shows repeated "registry lock held > 120s" FAILs).
Stale-lock recovery per the body + loop-closeout skill: lock replaced
(same-call read + run_id match) with this run's id at 04:14:43Z; the
orphaned tree was adopted, not re-run — the sims, analysis, and verdicts
above are the dead run's, verified here, not re-played.

Verified independently in this adoption (nothing taken on trust):
- Proof tests on the worktree state AND again after the rebase:
  `test-warnheed-reset-r277.js` 16/16, `test-warnheed-deepen-r274.js`
  12/12, both runs.
- Driver fork: code-identical to r274 modulo run/seed/date names
  (normalized diff). Analyzer fork: only the Q1b bearer-end excuse
  change + r274 reference numbers (normalized diff).
- Analyzer log re-read: WARN-HEED 32 sittings / 18 delivered / 0
  unnamed; GUARDRAILS deaths 388 (48.5/seed), popAlive 74 (9.3),
  pantryKcal 271,196 (33,900/seed), starvationDeaths 0 — all as §4
  states. Panel log: seed 109018 stranded=4, strandedRuns=1,
  endAttempts=18, matching §3.
- Before-panel evidence: 21 files intact in
  `hidden_files/evidence/2026-11-24/r277-before-warnheed-fix/`.
  Prereg intact. Telemetry baseline already rolled by the dead run
  (r274+r277 pooled, `.bak` preserved); adoption re-check:
  **quiet (8 files, 4 metrics)**.
- Gate: [FILLED AFTER THE GATE RUN — see below.] **Adoption gate result:
  `check.js --quick` on the rebased tip `34e1b1d95`: 335 passed, 9
  failed in 1426s, 0 attributable.** The 5 standing failures are the
  same 5 as the r157 adoption gate (339/5) and the 2130 gate (339/5),
  both run on master without this fix: measurement-proof-update +
  measurement-workflow (proof-freshness), phone-frame-proof
  (boot-input freshness), living-garden + one-person-army (120s
  timeouts). The 4 new-in-this-run failures all pass on individual
  re-run on the rebased tip — load flakiness (this gate ran 1426s vs
  614s/1018s; a sibling gate ran concurrently and the reaper held the
  registry lock for 22+ min): measurement-cache-flags 4/4,
  occupation-panels 25/25, trust-observer-neutrality 6/6, capable-bot
  40/40. Gate log:
  `hidden_files/check-r277-adopt-quick.log`.

Closeout performed by the adoption: commit `0ddb42e0a` (fix + proof +
driver/analyzer) rebased clean onto master `233163022` as `34e1b1d95`
(4 intervening commits, all sim-launchdiag-a evidence, none touching
the fix); safe-commit index-clobber repaired per the 2026-10-22 lesson;
this note committed as a second commit; merged `--ff-only` into main;
worktree released; rotation `1→2`; lock deleted last (same-call run_id
match); hbloop killed. **Merged locally, pending ship** — no version
tag; the ship loop owns bumps/pushes/live verification.
