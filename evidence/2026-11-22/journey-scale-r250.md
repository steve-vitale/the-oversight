# journey-scale r250 — RUN NOTE (lane A, leg 3 SCALE, playtest leg)

**Run id:** `playtest-20261122T1045Z`. **Leg:** SCALE, days 80–140, single arm B
(r244–r249 control policy verbatim). **Seeds:** fresh band **106259–106266**
+ probe 106267. **Base:** master `3d7a25427`. **Commit:** (see below).
**Worktree:** `~/workspace/worktrees/journey-scale`.

## Prereg (binding, written before the panel)

- Full prereg: `evidence/2026-11-22/journey-scale-r250-prereg.md` (committed).
- Q1: can a competent village reach national standing / the table approach
  in days 80–140, and what blocks it? Binding metrics: national /8, table
  offered (lesser priced) /8, full seat /8, wave-4 kills, wave-5 faced,
  standing-199 stall (BOTH measures reported, stall finding named to one),
  survival to 140d. **Interesting iff** ≥3/8 national, OR a new blocker class
  (outside r245/r246 set), OR a fixable defect in the table-approach path.
  Else QUIET. A miss is NO-GO, never re-scored mid-run.
- Q2 (descriptive): wave-5 in the scale window — faced/killed per seed,
  party sizes on wave-5 fights; does the party-of-5 kill shape recur;
  win-plan departure sizes.
- Q3 (descriptive): march-flee watch; coalition-reach; Q3 guards carried
  from r246 (spoken-raise, vetbar, trap-line, betrayal-sibling, nod-loop,
  lived-days mean within ±25% of 123, lesser priced ≥4/8).
- Q4 (people check): 2–3 full transcripts d90/110/130 + NV sittings + all
  raise talks; judge sense, not counts. Watch: closing-line duplication
  (6 sightings so far), tell-me-more echo, searcaster-volley narration,
  departbeat, warn_you heed.
- Q5: census in plain words + reachable / fun / winnable.
- Seed band: first choice 106001–106008 + probe 106009 **COLLIDED** — the
  panel band was already used by the sim-rage-setup-a pilot (2026-11-18,
  named in `evidence/2026-11-18/sim-rage-setup-a-prereg.md:204-205` and
  reused in sim-freestrike-b / sim-ragepreempt-b preregs). Replacement band
  **106259–106266 + probe 106267 verified FRESH** (freshness subagent:
  searched all dated preregs, evidence/**/*.md, scripts/**/*.js, docs/,
  goal hidden_files — 0 hits; the 106xxx region is densely used up to
  106258, next clean gap 106259–106300).
- Policy (frozen): `scalecourt-traderoad-r113-linkraise-sit` + muster ON +
  march ON, MUSTER_HOLD=sitting, STAGE_CAPSTONE=off, ANSWERMAIL off,
  Sortie INERT, SIT false, DAYCAP=140 death-aware (+10d tail). **One
  control change vs r249: march now routes around blockages**
  (COMPETENT_ROUTE_AROUND=1 for the march walk only — r249's fix, live
  this run).
- This is a PLAYTEST leg, not a lever round. One blank, fixed with a proof
  test, or documented why it cannot be fixed. Gating freeze stands: no
  win-price or deed-gate changes.

## Base delta vs r246's base `0d925556a` (recorded in prereg)

src/js 17 files, +2020/−163. Live changes: establishment r265 PLANWAKE +
BEARER-END + DEPARTCOUNT (`52bbec5e6`); searvoice-a searcaster-volley-as-gun
(`b5fb12e10`); scale r249 owed-walk fix (`59339acbb`); profilegate-b
relaxation (`84e57fcc3`); departbeat-b (`e5c8b4633`); crisis r262/r263 +
landing r152 conversation fixes (stuck-key flee counter, sitting-favor
settled-closer gate, namebeast, settled re-ask names favor); downedtwice-b
(`f11b30882`); reseedbeat-b (`9145db1ef`); succession r262 M12 escalator
cap + staged witness; doorflee2-b (`4266e6cce`); hypofloor-b env-gated OFF.
Reverted levers (instrument+evidence only): M1RANGE, SHAPE2, M2STEP2/DEPMAT
substrate, LEADSIDE, fiberfetch, evade, ammo, tier4access, tier4gate,
holdersupply. Largest diffs: win-plan.js +607, game.js +438,
fieldFights.js +424.

## Pilot (seeds 106259–106261, arm B, exit 0 in ~159s)

- 106259: day 107, over (collapse), pop 4/4, regional, lesser seat d34,
  w4 kills 2, 14 deaths.
- 106260: day 141, alive, pop 3/3, regional, lesser seat d46, w4 kills 1,
  17 deaths (wild 11).
- 106261: day 141, alive, pop 2/2, regional, lesser seat d35, w4 kills 4,
  51 fights (42 wave-4) — the fighting village.
- Gates passed (exit 0, empty stderr, census rows present, 0 errors).
  Pilot verdict: interesting enough to expand (collapse + stall on 106259)
  → full panel.

## Panel (seeds 106262–106266, arm B, exit 0)

- 106262: day 111, over (collapse), pop 5/5, regional, lesser d41.
  106263: day 140, alive, pop 2/2, regional, lesser d34. 106264: day 141,
  alive, pop 8/8, regional, lesser d43, only 4 deaths (all wild).
  106265: day 45, over (collapse), pop 2/2, lesser never priced.
  106266: day 141, alive, pop 8/8, regional, lesser d36, tribute ready
  d127 (unpayable).
- All 8 seeds: regional (peak stage 3), lesser seat priced 7/8, full seat
  0/8, national 0/8.
- Probe seed 106267 (unscored extra): exit 0 in 38s — d141 alive, pop 7/7,
  regional, lesser seat, w4 kills 3.

## Q1 PLAYTEST PANEL VERDICT: QUIET

```
PANEL national: B=0/8 tableOffered(lesser)=7/8 fullSeat=0/8
PANEL fights: wave-4 fights=82 wave-4 kills=20 wave-5 faced=0/8
PANEL stall: standing-199 stall seeds=1/8 stallDays=49 survival=5/8
PANEL stall split (seed-level, peak-based — r249: INVALID as written, kept for continuity): stalled-while-otherwise-ready 49d on 1/8 seeds; stalled-while-not-ready 0d on 0/8 seeds
PANEL stall split (r250 per-day revision): stalled-while-ready (r5>=2 on the stalled day) 0d on 0/8 seeds; stalled-while-not-ready 49d on 1/8 seeds
PANEL blockers B: ["106259:COLLAPSE","106260:FORMATION-FEW","106261:FORMATION-FEW","106262:COLLAPSE","106263:FORMATION-FEW","106264:FORMATION-FEW","106265:COLLAPSE","106266:FORMATION-LATE"]
Q1 PLAYTEST PANEL VERDICT: QUIET — the wall stands as measured: national 0/8, table offered 7/8, full seat 0/8, wave-5 faced 0/8, stall 1/8 seeds (49d); the finding is the blocker taxonomy above
```

No new blocker class (all in the r245/r246 set); national 0/8 is below
the ≥3/8 interesting bar. First scale run with zero wave-5 faces
(r246 2/8, r247 1/8, r248 2/8, r249 1/8).

### Q1 NATIONAL (per-seed blockers)

- 106259: COLLAPSE d107 (final LEAD 1/3 seasoned, COV 0/3, TRADE 2/3).
- 106260: LEAD 2/3 seasoned (2 active) — needs 1 more seasoned.
- 106261: LEAD 2/3 seasoned (2 active) — needs 1 more seasoned.
- 106262: COLLAPSE d111 (final LEAD 0/3 seasoned, COV 0/3, TRADE 0/3).
- 106263: LEAD 1/3 seasoned (2 active) — needs 2 more seasoned.
- 106264: LEAD 2/3 seasoned (2 active) — needs 1 more seasoned.
- 106265: COLLAPSE d45 (final LEAD 0/3 seasoned, COV 0/3, TRADE 0/3).
- 106266: LEAD 1/3 seasoned (3 active) — needs 2 more seasoned; belong
  not good. The 3rd LEAD link formed d135 (late).
- The wall is still formation: the 3rd seasoned link never forms in time
  (too few, or too late) — plus 3 collapses, all scatter-hunger (see Q5).

### Q2 BLOCKER TAXONOMY

FORMATION-FEW 4, COLLAPSE 3, FORMATION-LATE 1. No TRUST-LOW, no NATIONAL,
no SNAP, no RUNG, no UNKNOWN this run. TRADE 3/3 seasoned: 0/8.

### Q2 wave-5 / party sizes — unanswerable this run

- Wave-5 fights 0 → no wave-5 party-size data; the deepening r249
  party-of-5 kill shape cannot recur-check here (nothing faced wave 5).
- Win-plan departure sizes NOT instrumented on the scale leg (no
  `winPlanEnd` in the scale driver/trust JSON; regional JSON `partySize`
  values are all 0 and unrelated) — record as a limit. Tooling note for
  r251 (not a game change): add the deepening `winPlanEnd` snapshot to
  the scale driver so departures are measurable on this leg too.

### Standing-199 reconciliation (deepening r249's handoff — RESOLVED)

Deepening r249's daily trace showed 0 days at exactly 199 while its end
deed snapshot still showed 199 on 2 seeds. Root cause, read in
`src/js/standing.js`: the two measures call different functions. The
daily trace reads `villageStanding()` (raw live total: war + diplomacy +
plenty). The deed snapshot reads `villageStandingTotal()` (the gated
number: holds at t5−1 = 199 while the plenty cap binds or the
combat-readiness deferral binds — wave-5 demand: armored 4 @ P≥15,
armed 6, tricks 3, veterans 2; t5=200; monotonic peak ratchet once
released). Verified on the deepening corpus: 105076 deedLog 199 on
d70/85/100 vs trace 322/245/270 on the same days; 105078 deed 199 d100
vs trace 215; 105071/105073 agree exactly on every deed day. Both
measures are correct readings of different functions; the stall is real.
**The scale stall finding rests on phantomDays5 only.** The scale corpus
has no daily standing trace and no deedLog standingTotal, so it cannot
reproduce the deepening discrepancy.

The stall split: the per-day revision (adopted r249 metric-review
revision) counts a stalled day ready iff its own r5 ≥ 2 living wave-4
killers. On 106259 (stalled d59–107, maxR5=1, never held two living
veterans): ready 0d / not-ready 49d. The peak-based split says the exact
inverse (49 ready / 0 not-ready) — it counts a seed ready for ALL its
stalled days if a veteran lived at ANY point (`maxR5 > 0`, or maxR4 ≥ 2,
or national days > 0). It reproduces r249's correction on fresh data and
stays labeled invalid.

## Q5 CENSUS (plain words)

- 8 villages, 967 lived days (mean 120.9/seed), 97 deaths. Biggest
  killers: the wild 44, monsters 25, strangers 4, contests 3, starvation 2.
- Fighting: 164 fights total; wave-4 fights 82, kills 20 (kill rate 24%,
  vs r249's 40%). No wave-5 fights on any seed. Living-veteran peak 5
  (106262, 106266). The fighting village is 106261 (51 fights, 42 wave-4,
  4 kills, 15 deaths); the quiet survivor is 106264 (19 fights, 4 deaths,
  all wild, 8/8 alive at d141) — fighting is not the bottleneck; forming
  the national road is.
- Wave-4 fight slide watch: 231 → 168 → 101 → 62 → 82 (r246–r250).
  Partial recovery from r249's 62 toward ~100; kills 20 (vs 25/23/31/27).
  Watch continues; no defect claim.
- Collapses — all scatter-hunger (capture lines: "Haven couldn't hold.
  On the fifth/third hungry day, people started walking…"): 106259 d107
  (5th hungry day), 106262 d111 (5th), 106265 d45 (3rd hungry day —
  threshold varies; note it). All three end with pantry 0. The trust-JSON
  `overCause` field is null on all three (instrument gap — the driver
  reads `_G.overCause`, the game doesn't set it here).
- Muster: 3 titans slain, 4 fought, 31 refused meetings, 16 committed,
  6 committed deaths, 1 fled. March: 3 slain on-march, 20 arrived of 25
  march days; held `blocked-at:4,4` ×2 (106263 d70–71, herald at lair 4,3
  adjacent — route-around works, residual is destination-adjacent refusal;
  r249's shape was 28 days). March-flee: 1 fled (106259 muster outcomes
  fled=1; deepening r249 had 2 at full HP; arrived-no-fight is fixed).
- Tribute: 7/8 NEVER-READY, 1/8 READY-UNPAYABLE (106266, ready d127, 11
  attempts, all veterans-short); 0 delivered — breaks the 4-run delivery
  streak (r247/r248/r249 each 2/8 delivered).
- W5-INSTANCE: all 8 UNANSWERED, 0 wave-5 fights, live wave-5 entities
  max 1/day on 1/140 days (106260). ANSWERMAIL 0/8 (off by design).
  SUBCAP fired 1/8 (106266), 101 skipped — control behavior.
- Spotter: 1 villager/village with spotter XP at d90 on most seeds;
  106265's d90 row empty (village already over).

## Q3 REGRESSION GUARDS — all HOLD/GO

- VETBAR: GO (0 disagreements across all 8 seeds).
- Lived-days: HOLD (mean 120.9 vs control 123, −1.7%, guardrail ±25%).
- Lesser seat priced: HOLD (7/8, bar ≥4/8).
- SPOKEN-RAISE: GO (18 talks: 9 properly-answered, 1 counter,
  0 not-offered-spoken [defect], 8 not-offered-unspoken [correct hold]).
- BETRAYAL SIBLING: HOLD (1 turn-0 offer, 0 defects).
- NOD-LOOP: HOLD (0 sittings ≥4 identical nv:react streak; worst 3x —
  three sittings at exactly 3x).
- TRAP-LINE: HOLD (1 answered sitting, 18 mimes in capture).
- DAILY-PLAY MIME (read-only): 17 daily-play mimes in the capture, 0
  driver-sitting accepts proven in daily play; lane decision still owed
  (teach the shared chooser to take betrayal:accept + nv:accept when
  offered, or keep proving fixes only where the driver looks).

## Q4 PEOPLE CHECK — transcripts pass; the raise talks fail on sense

Read in full (worker + coordinator): all 15 transcripts and all 18 raise
talks, plus targeted greps of the captures/betray files for the carried
items. Per-transcript verdicts: **10 GOOD / 5 WEAK**. No 106265 transcript
exists (seed collapsed d45).

GOOD, with citations:

- **Sigrun, 106259 d90 (ask_favor):** commit → "Come see what I found"
  accepted → quiet hollow walk payoff ("It's quiet at the hollow. Sigrun
  doesn't say much. Sometimes that's the whole point.").
- **Daniyar, 106261 d120 (ask_favor):** haul accepted, pays +4 wood/+4
  fiber ("Daniyar has been stockpiling where nobody looks. 'Take half.
  You've got the hands for it.'").
- **Atlas, 106264 d120 (goal/air): best in run.** A sardonic truck driver:
  "Most fights start because nobody asked what the other person actually
  wanted. I ask." / "Hold it together. That's my whole philosophy." /
  "Peace isn't the absence of fighting. It's the presence of dinner."
  The ridge walk pays off with talk.
- **LaToya, 106266 d120 (seek_taken):** the walk teaches slope-reading
  for water ("how they read a slope for water, how their grandmother did
  it. (Knowledge, freely given. The Codex notes it.)").
- **Luigi, 106263 d90 (ask_favor): the owed-walk fix in the wild.** Fever
  vetoes the accepted haul with the r249 line: "Maybe not today. The
  fire's got me. Tomorrow, when it lets me go — same walk?" The re-offer
  half is untestable here, not absent: Luigi dies d118, so no later Luigi
  sitting exists.
- **Dmitri, 106260 d120 (seek_comfort):** real comfort ("You know what's
  worst? The quiet parts. When the fire's the only one talking."), the
  trap-line invitation pays off with a gift ("Here. I made an extra.").
  The stay loop deepens at stay 4 by design (`convo-dialogue.js:875-930`:
  stays 1–3 cycle 7 stay lines, stay 4 picks one of 5 grief lines and
  resolves as 'comforted') — the driver's 4 taps are what the mechanic
  wants, not a loop defect. The two stay labels cycling is the menu's
  only 2 labels, not a verbatim repeat.
- **Seamus, 106261 d90 / Atlas, 106264 d90 / LaToya, 106266 d90
  (seek_taken):** the promise beat lands ("You'd do that? Ask it? ...
  Thank you. Really. Even asking is more than the silence.") — verbatim
  identical across all three, a shared want-def line.
- **Omar, 106262 d90 (curious/grief):** "When's the last time you really
  laughed?" hangs as the driver leaves — thin end, honest beat.
- **Paraone, 106263 d120 (ask_favor/grief):** the water-haul ask is real
  ("We're down to 2 liters of clean water. Haul the creek with me at
  dawn?"), gossip has a voice ("Tom's story has a fresh coat of paint...
  Just don't scrape it in front of them.").

WEAK:

- **Thabo, 106260 d90:** one line then leave ("Never mind this wound —
  we got it handled. Thanks anyway."); the stage-1 want never engages.
  Driver left immediately; the brush-off itself is coherent.
- **Ines, 106260 d90-nv / Víctor, 106266 d90-nv / Víctor, 106266 d120-nv
  (nonverbal):** the NV 3-nod loop persists (nod, nod, nod, winddown;
  d120-nv is walk-then-nod: accepted mime-walk → secret-place line →
  nod-nod-nod tail). BUT each nod gets a distinct line (Ines: "Concordo
  contigo." → "É verdade. Absolutamente verdade." → winddown; Víctor's
  lines come via Chaska's translation), the third nod triggers winddown,
  and the closings are distinct and good ("A final nod. They touch their
  chest, then point at you — a promise without words."). The driver
  hammers one button; the game handles it gracefully. Carried flat spot,
  not a defect — not this run's blank.
- **Paraone, 106263 d120:** the 2-liter water-haul ask dies unanswered;
  no closing line.

The counts (Q6 watch):

- **Closing-line duplication: 0 new.** No transcript's closing line equals
  its final winddown THEM line verbatim. Running count stays **6**.
  (Near-miss only: 106262-d90 "I need a minute. A long minute." vs
  closing "Sorry. I need a minute." — similar, not verbatim.)
- **No closing line: 2/15** — Dmitri (ends "Well. My social battery is
  officially dead.") and Paraone (ends "Okay. That's — I need a minute.
  A long minute."). Both end right after a natural-end signal line, as in
  r249 (was 3/17). **This is by design, not a defect:** `endConvo`
  returns `line: null` when the winddown beat was already spoken
  (GOODBYE-ALREADY-SAID, `conversation.js:8560-8563`) — the winddown
  line WAS the goodbye; a second one would stack.
- **"Tell me more" echo: 0 hits.** Only one gossip pick in the whole
  corpus (Paraone d120: "Tom's story…" then "Sigrun headed out to
  forage." — two different templates, not an echo).
- **Searcaster-volley-as-gun: 0.** "volley" appears nowhere in transcripts,
  raise talks, or any capture.
- **Departbeat: 0.** "depart" matches only "the ratings department".
- **warn_you heed: CONFIRMED, many voices.** The heed speaks in the NPC's
  voice after contact: Nina 106259, Dmitri 106260, Somchai 106261 (six
  repeats), Omar 106262, Mario + Tariq 106263, Earl 106264, Chloe 106265,
  Karen 106266. Caveat: the heed line itself is verbatim identical every
  time ("Dreamed again. They showed me teeth. Lots of teeth. Be ready to
  fight soon.") — as is the contact line ("Tell the human to watch the
  northern treeline.").
- **Secret-place line verbatim reuse 3× across sittings** ("shows you
  where they go to think. 'Don't tell the others. Everyone needs one
  place.'" — LaToya d90, Atlas d90, Víctor d120-nv). By design: 1 of a
  3-line `small` pool in `betrayal.js:672-677`, random pick with a
  per-sitting no-repeat guard (r206 fix). Cross-sitting repeats are
  expected with a 3-line pool; the line itself is good.
- **Orphaned invitations in raise talks: 10/18** — worst rate yet (r249:
  4/24). In all 8 not-offered talks the probe deflects with "Can I ask
  you something else?" and the NPC drops the ask; the "something else"
  is never asked — the talk winds down into filler closings ("This was
  good.", "Take care out there.").
- **Raise-opener variety: regressed.** Offered raises 10 (9 accepted + 1
  counter): **2 distinct openers**, modal "I've heard good things about
  X. We should link with them — we'd be stronger together." **9/10
  (90%)** vs r249's 9/15 (60%). Accept replies: "Good. What I've heard
  of them, I believe. Go and ask." 9× vs "Good — the word on them is
  kind. Go and ask." 1×.
- **Settled-help naming the favor: no repay sitting in corpus.**
  "repay"/"pocketed" appear nowhere in transcripts or captures;
  "settled" in captures is only beast-naming.
- **Counter-outcome accept text (secondary, NOT a defect):**
  raisetalk-106266-3 (Chaska, outcome counter) gets the accept reply
  "Good. What I've heard of them, I believe. Go and ask." That is
  coherent: Chaska accepted the proposal; the COUNTER is the target
  village's move, staged after the accept (`pendingCounter`). The talk
  reads as an accept because it IS one.
- **Deflection dead-end (ruled out as a game defect):** the raise-talk
  driver (`competent-linkdrive-b.js:195-260`) picks `dlg:subject` once
  and then leaves — but the subject menu EXISTS after the bridge
  (`choosingSubject` lists uncovered topics plainly,
  `conversation.js:8134`). The policy just doesn't pick a subject. A
  human player would. Driver artifact, not a game blank.

**Q4 overall verdict: FAIL on sense.** Transcripts pass on their own
(10/15 GOOD, and the GOODs include real payoffs — haul goods, a gift
tool, a taught skill, the ridge-walk philosophy). But the raise-talk
half of the corpus fails the sense law on a majority of talks: 10/18
leave an invitation/ask unanswered with no follow-up, the deflection
option is a dead end in all 8 not-offered talks (driver-side), and
link-opener variety regressed to 2 distinct / 90% modal. The NV flat
spot also persists unchanged.

## THE BLANK — filled: a broken favor's need resolves with no account

**Defect (root cause, located precisely).** The player promises Daniyar
the creek water run d120 ("I'll come back to help." → "Dawn, then.
Bring something to carry — and thank you.", stage 3). The promise breaks
(deadline passes). d128 Daniyar names it honestly: "About the creek
water run — still open. That promise is dead, but the need isn't."
d129, water having arrived overnight, the same NPC says: "You said you'd
help with the creek water run. ...It's done now. Forget it." — open →
done in one day with nothing in between the player saw, and no word on
HOW it got done. Verified against the world record: the water log shows
the cistern dry d127–d128 and no dry entries after (water arrived
between d128 and d129), so the need genuinely died — the NPC just voids
the broken promise with no bridge. The r240 false-settlement guard fixed
the live-need case ("don't call a live need done"); the dead-need case
still collapsed "need met" and "promise settled" into one flat "done".
The same evaporation pattern is the rule in this corpus: every deflected
ask in the 8 not-offered talks is dropped the same way (Daniyar's food
ask d130, water ask d138, Yeliz's forage d19 and pantry d20).

The flat phrase lives in four places in `src/js/convo-wants.js`, all in
the `broken` + need-not-live branch family: repay opener (L1113),
repay staleOpener pool (L1158-1161), repay engageBeat pool (L1240-1242),
`convoFavorFollowup` (L~2583).

**Fix** (`src/js/convo-wants.js`): new helper
`convoFavorResolvedWithoutYou(favor)` (next to `convoFavorNeedLive`)
that names HOW the need resolved from what the engine knows — "The run
got done without you." when the outing completed
(`waterRun.returned` / `forageRun.returned`), "It's handled now, not by
you." when the need simply passed (metric crossed) — and all four
call sites use it. The promise stays broken: the settle to
'acknowledged' still records as before (the NEED is gone, the PROMISE
stays broken). No logic change, no state change — wording only, in the
same phrase family. The deflectBeat settled pool was deliberately left
alone: there "It's done now" describes a SETTLED debt, which is honest.

**Proof test**
(`scripts/test-convo-broken-favor-resolved-r250-20261122.js`, seeds
5001–5006, six fresh games):
- Part A (r240 regression guard): need LIVE (no run, water 2) → opener
  still says "It's still open — but that promise is dead." Unchanged.
- Part B (core, fail-before/pass-after): run returned + water 50 → opener
  now "The run got done without you. Forget it."
- Part C: staleOpener → "About the creek water run — I keep turning it
  over. The run got done without you."
- Part D: followup → same as B.
- Part E (metric-crossed, no run, water 50) → "It's handled now, not by
  you. Forget it." — and does NOT claim the run got done.
- Part F: engageBeat (dlg:help) → same as B.
- Verified FAIL on unfixed code (9 failures: the exact wild lines
  "It's done now. Forget it." / "It's done now, but I haven't
  forgotten it.") via running the test before the fix; **PASS: 0 failed
  after**. `node --check` clean on convo-wants.js.
- **Flagged `[needs-eyes]`:** the fix changes spoken dialogue wording
  (NPC lines, not player menu options) — Steve should see the lines.

**What was NOT fixed:** the NV 3-nod flat spot (handled gracefully, not
a defect); raise-opener variety (90% modal — a lore-distribution fact:
most raisers know the village by rumor; new opener lines per `how`
would be content work, and the modal line itself is good); the
secret-place / seek_taken cross-sitting reuse (small pools by design).

## Reachable / Fun / Winnable (the leg verdict)

- **Reachable:** YES, to regional and the lesser seat (7/8 priced) — but
  NO to national in this leg (0/8). The road to national is formation
  (plus 3 scatter-hunger collapses): villages fight well enough (20
  wave-4 kills) but cannot form the 3rd seasoned link in time, and three
  villages starve out before day 112.
- **Fun:** MOSTLY. The people are the fun — Atlas's dinner philosophy,
  LaToya's taught slope-reading, Luigi's owed walk, Dmitri's comfort
  exchange read like people. The blank was the one place the game stopped
  feeling like people (a promise voided overnight with no account); it is
  fixed and proved. The raise talks are the thin half: 10/18 orphaned
  asks, 90% modal openers.
- **Winnable:** NO, not in this leg — 0/8 national, 0/8 full seat, 0
  wave-5 faces, 0 wins. Nothing in this run changes a win price or a
  deed gate (gating freeze stands); the winnability wall is the formation
  bottleneck plus the scatter-hunger collapses named above.

## Metric review

- Q1's interesting bar (≥3/8 national) held: 0/8 is QUIET, not noise.
- The standing-199 stall instrument behaved as preregistered: 1/8 seeds
  (106259, 49 days, its last 49 days before collapse) — the stall is real
  and this run it is entirely a not-ready stall (0 ready days under the
  per-day revision). The peak-based split again says the exact inverse
  (49 ready / 0 not-ready), reproducing r249's correction on fresh data.
- The lived-days control (123) held at −1.7%.
- The Q2 taxonomy is the finding: formation + collapse, not trust, is the
  control wall this run.
- The analyzer proof test passed before the panel (145 passed, 0 failed)
  and was re-run green after the seed re-point.

## Gate result

- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r250-gate`
  on build commit `92f38507e`: **333 passed, 11 failed in 1349s**
  (gate exit 1). Log:
  `journey-scale-r250-gate.log` (goal hidden_files evidence dir).
- **Attribution of the 11:**
  - Standing set (5, as expected): 2× deed-attainment 120s timeouts
    (`test-living-garden-deed-attainment.js`,
    `test-one-person-army-deed-attainment.js`), measurement-proof staleness
    pair (`test-measurement-proof-update.js`,
    `test-measurement-workflow.js` — "retained neutrality proof covers
    the current Game/controller/harness inputs"), phone-frame stale
    receipt (`test-phone-frame-proof.js` — retained browser inputs vs
    current source, incl. `index.html`).
  - Attributable to this run (1): `test-repay-broken-live-need.js`
    (r240 guard), case B opener — it pins the OLD dead-need wording
    ("It's done now") that the r250 blank fix deliberately replaces.
    **Fixed after the gate** by updating the control assertion to the
    new wording ("handled now, not by you") with an r250 comment; the
    settle behavior it guards is unchanged (favor → 'acknowledged').
    Re-run standalone: **17 passed, 0 failed**. (Design changed on
    purpose → test updated in the gate-record commit, per repo rule.)
  - Load flakes (5, all re-verified green standalone):
    `test-measurement-cache-flags.js` (4/0 in 17s standalone; failed in
    the gate after 70.4s), `test-occupation-panels.js` (25/0),
    `test-trust-observer-neutrality.js` (6/0), `test-synergy-stall.js`
    (exit 0 in ~23s), `test-capable-bot-20261014.js` (40/0). The four
    timeouts hit the 120s per-script cap in the gate under extreme load
    (machine freshly restarted mid-gate, load avg ~9, sibling loops).
    None touches convo-wants.js or the r250 fix.
- **Gate verdict: 333/11, 0 attributable after the test update.**
  The gate ran on `92f38507e` (before the test update); the gate-record
  commit changes only one test file's assertion wording plus this note,
  and the updated test is verified green standalone — no full re-gate
  (parent can re-run if it wants a fresh stamp on the final tree).
- The analyzer proof test passed before the gate (145 passed, 0 failed)
  and the broken-favor proof test passed on seeds 5001–5006.

## Telemetry verdict

- Baseline: `telemetry-baselines/scale.json`
  (`fightsTotal 241, fightsByWave.4 178, maxGameDay 468`, 2026-11-14).
- Current (per-seed rows built from the trust JSONs — the only corpus
  files carrying all three metrics at top level — 8 rows in
  `journey-scale-r250-telemetry-row-*.json`; aggregate source
  `journey-scale-r250-telemetry-rows.json`):
  fightsTotal 164, fightsByWave.4 82, maxGameDay 967 (sums across rows).
- Tool verdict: **one LOUD line** —
  `maxGameDay swung 107%: baseline 468 -> current 967`.
  fightsTotal and fightsByWave.4 are quiet per the tool.
- **Investigation (before any roll-forward):** the LOUD line is a regime
  difference, not a defect. The tool sums maxGameDay across rows, so the
  baseline 468 is the 2026-11-14 run's 8 seeds living 468 days total
  (mean ~58.5d/seed); this run's 8 seeds lived 967 days (mean 120.9d)
  because the leg runs to DAYCAP 140 with 5/8 surviving to the cap —
  the prereg's own lived-days guardrail confirms this regime (120.9 vs
  control 123, HOLD). The fight counts are lower this run (164 vs 241)
  for the same regime reason in reverse: fewer fights per lived day on
  this band (82 wave-4 fights vs r246's 231), which is the wave-4 slide
  watch, not a telemetry anomaly. No anomaly in the game code.
- **Baseline NOT rolled forward.** The baseline file records no provenance
  (which run/daycap produced 468), and silently rebasing the reference
  on a regime difference would hide the comparison. Rolling it forward is
  a coordinator decision, not an automatic step.

## Infrastructure notes (for the parent)

- **VM restart at ~11:31Z** (`uptime` 1 min when checked 11:32:48Z):
  killed the first gate run (SIGTERM after ~89s, 0 output, no gate log
  file created) and the hbloop (pid 42941). Recovered per AGENTS.md:
  hbloop restarted with setsid nohup (new pid 1911, same
  `/tmp/hbloop-scale.log`), writes probed OK, gate re-run from scratch
  (1349s, completed). Commit `92f38507e` was already landed and intact
  (worktree status clean after the restart). No work lost. The run note's
  earlier "No VM restart" line is corrected here — the restart happened
  AFTER the panel + commit, DURING the gate.
- **Registry lock stuck at gate-record time:** the manual heartbeat and
  the hbloop's last two cycles both skipped with "registry lock held >
  120s" (checked ~12:00Z, load avg ~9). Same stuck-registry-lock
  infrastructure issue other loops hit today. The hbloop (pid 1911)
  keeps retrying every 10 min; the lock was NOT touched (live-coordinator
  check first, per AGENTS.md — a sibling registration may hold it).
  **Parent action:** confirm the journey-scale heartbeat is landing
  again before/during closeout; the work itself is committed and safe.
- **Machine heavily loaded by sibling loops:** `git status` once hung
  3.5+ min and was killed; the gate's 4 extra 120s timeouts are load,
  not game failures (all re-verified green standalone — see Gate).
- **Index clobber on the build commit:** after `safe-commit.sh` created
  `92f38507e`, `git status` showed the 6 new files as staged-deleted and
  `convo-wants.js` as MM. Repaired with the documented recipe
  (`git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`); status clean, diff HEAD empty, commit verified
  (7 files, +4882/−7).
- **Stray file note (worker):** a `journey-scale-r250-b-capture-106267.txt`
  exists with no matching transcript or raise talk for probe seed 106267
  (the probe ran, no convo days were sampled for it). Not an error.
- **Merge not yet done at note time:** it waits on the parent's closeout.
  Branch `journey-scale` is on base `3d7a25427`.

## Commit

- `92f38507e` — "journey-scale r250: scale leg panel (seeds 106259–106266)
  + broken-favor resolution lines [needs-eyes]" (driver + analyzer +
  analyzer proof test + prereg + run note + convo-wants.js fix +
  broken-favor proof test).
- Gate-record commit (this note's gate section + the r240 test update):
  (hash to be recorded after safe-commit).

## Evidence paths

- Run note: worktree `evidence/2026-11-22/journey-scale-r250.md`
- Prereg (committed): worktree `evidence/2026-11-22/journey-scale-r250-prereg.md`
- Analysis: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-22/journey-scale-r250-analysis.txt`
- Pilot log: `.../evidence/2026-11-22/journey-scale-r250-pilot-b.log`
- Panel logs: `.../evidence/2026-11-22/journey-scale-r250-panel-b1.log`,
  `.../evidence/2026-11-22/journey-scale-r250-panel-b2.log`
- Probe log: `.../evidence/2026-11-22/journey-scale-r250-probe-b.log`
- Gate log: `.../evidence/2026-11-22/journey-scale-r250-gate.log`
- Analyzer proof test: worktree `scripts/test-journey-scale-r250-analyzer-20261122.js` (145 pass)
- Fix proof test: worktree `scripts/test-convo-broken-favor-resolved-r250-20261122.js` (seeds 5001–5006 green)
- Telemetry rows: `.../evidence/2026-11-22/journey-scale-r250-telemetry-row-*.json`
