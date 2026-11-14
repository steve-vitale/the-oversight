# journey-scale r197 — RUN NOTE (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-20261114T1032Z` (lock run_id `playtest-loop-a-20261114T103250Z`).
**Run:** scheduled Sat 2026-11-14 03:45 CST; lock created 10:32:50Z (started
~48 min late — scheduler/queue delay). Pre-flight: main tree clean, disk
39%, lock absent (no stale-lock recovery), `git pull` already up to date at
b81fde1c5. Reap: SKIP on a registry lock held by another reaper run (1
consecutive skip); no cleanup this run.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only.**
**Base:** worktree registered on local master `b81fde1c5` (journey-deepening
r191); master moved to `2042cb96c` during registration
(sim-transplant15d-a STOP evidence, evidence-only) — rebase owed at merge.
**Worktree:** `journey-scale` (registered 10:34Z, completed 11:06Z, ~23
min — registry-lock queue behind a live sim-transplant15a-narrowed-a
registration, then a slow checkout under box load 11–17; no half-checked-out
recovery needed). Heartbeat at registration (11:06:45Z) + hbloop
`~/workspace/worktrees/journey-scale-hbloop-r197.sh` (10-min cadence).
The first hbloop (PID 66556) died in a service restart before its first
beat; restarted as PID 6145 at ~11:15Z. The manual re-heartbeat queued
behind a live reaper scan (started 11:08Z) and landed 11:20:20Z — 13.5 min
after the previous beat, inside the 15-min threshold; the tree survived
the reaper scan (clean, registry entry fresh).
**Prereg:** `evidence/2026-11-14/journey-scale-r197-prereg.md` (committed
BEFORE any judged sim: instruments commit 4c091e4a2).
**Corpus:** `hidden_files/evidence/2026-11-14/journey-scale-r197-*` (goal
store — moved from the repo evidence subdir to follow the r188 pattern).
**Driver:** `scripts/journey-scale-r197-20261114.js` (r196 clone).
**Analyzer:** `scripts/analyze-journey-scale-r197-20261114.js` (r196 clone
+ lived-days control re-based to the r196 band's 460). **Proof:**
`scripts/test-journey-scale-r197-analyzer-20261114.js` (29/29 green — see
§Analyzer).

## Panel (seeds 135301–135304, DAYCAP=140, policy scalecourt-traderoad-r113-linkraise-sit)

| seed | days | over | pop | rank | peakStage | lesser | wave-4 kills | wave-5 fights/kills | deaths (top cause) |
|---|---|---|---|---|---|---|---|---|---|
| 135301 | 141 | alive | 3/3 | regional | 3 (d43) | d40 | 4 | 0 / 0 | 21 (the wild 10) |
| 135302 | 141 | alive | 8/8 | regional | 3 (d15) | d37 | 4 | 1 / 1 (Editor d87) | 8 (a stranger 3) |
| 135303 | 140 | alive | 8/8 | regional | 3 (d41) | d51 | 5 | 0 / 0 | 4 (one each) |
| 135304 | 104 | over (scattered) | 11/11 | regional | 3 (d45) | d35 | 5 | 7 / 4 (Cancellation ×2, Spoiler, Editor) | 9 (monster 4) |

Lived-days 526 vs r196 band 460 (+14.3%, guardrail ±25%: HOLD). Lesser
seat priced 4/4 (bar ≥3/4: HOLD). Books close on all 4 seeds;
unattributed 0; teleOnly 0. Fights (startCombat count): 62/56/140/112 =
370; wave-4 fights 45/40/124/99 = 308; **wave-5 fights 0/1/0/7 = 8, with
5 wave-5 kills** (see §Wave-5). Tribute: military_tribute ready d138 on
135301 (not delivered — 0 attempts in the window), ready d85 and
**delivered d96 on 135302** (1/1 attempts); ready d60 on 135304 (not
delivered before the scatter).

## Q1 (PRIMARY) — NATIONAL ON-RAMP: NO-GO on the wall, blocker named per seed (interesting)

National 0/4 — no village reached national (a polity). Per the
pre-registered interesting-finding rule, 0/4 with a named per-seed blocker
IS the informative outcome:

- **135301 (alive d141):** closest road LEAD 2/3 seasoned (2 active) —
  needs 1 more seasoned. Tribute ready d138, undelivered.
- **135302 (alive d141):** closest road TRADE 1/3 seasoned (2 active) —
  needs 2 more seasoned. Delivered a military tribute d96.
- **135303 (alive d140):** closest road LEAD 2/3 seasoned (2 active) —
  needs 1 more seasoned. Fought the most (140 fights, 124 wave-4) and
  killed nothing past wave 4 — the fightingest village is still one
  seasoned link short.
- **135304 (over d104):** COLLAPSE — village over before national (final:
  LEAD 0/3 seasoned). **New collapse flavor this band:** not a combat
  wipeout — the village SCATTERED from hunger (pantry empty 3 straight
  days, capture lines "Day 1/2/3 of hunger" then "Haven couldn't hold...
  people started walking"). 11 people were alive when it scattered; the
  roster still reads 11/11, so `over=true` with a full roster means
  scattered, not dead. The first hunger-driven scale-leg collapse in the
  recent bands (r196's were combat-driven, "living seeds end with food
  in hand").

The wall stands on a fresh band: survived 3/4 (up from r196's 2/4),
regional 4/4, national 0/4, table 0/4, wins 0/4. The binding constraint
is still trust held above 40 for a season — two living villages sit one
seasoned link short of the LEAD road.

## Wave-5 — the door opened (first time on the scale leg in recent bands)

- **135304: 7 wave-5 fights, 4 kills** — The Cancellation (d71, d87),
  The Spoiler (d75), The Editor (d92). The Finale was announced ("Every
  season needs its climax. This one is yours."). Kills by grace_obi
  (companion) and gen_qhhi07d (player-involved).
- **135302: 1 wave-5 fight, 1 kill** — The Editor d87 (gen_y89ksn7,
  player-involved; capture: "⚔ THE EDITOR! You're on your own.").
- r195/r196: 0 wave-5 fights on all seeds. This band the door opened on
  2/4 seeds and villages are killing wave-5 monsters while still
  regional. The winnability chain's "wave-5 facing" link is being
  exercised; national is still the binding wall, not the wave-5 door.

## Tribute — delivered again (135302)

- military_tribute ready d85, **delivered d96, 1/1 attempts** (deliveriesOk
  1, attempts 1). Second consecutive scale run with a delivery (r196:
  1/11; r197: 1/1) — the r195 0/7 echo is gone for good on this evidence.
- 135301 ready d138 but 0 attempts before the window closed; 135304
  ready d60 but the village scattered d104 before delivering.

## Q2 — REGRESSION GUARDS: all GO/HOLD (exit 0)

- Spoken-raise (r134 fix): 6 talks — 3 properly answered, 3
  not-offered-unspoken (correct holds), 0 not-offered-spoken. GO.
- Vetbar: 0 disagreements on all 4 seeds. GO. (Phantom-day note: 135302
  shows phantomDays d96–d140 on both r4 and r5 — the shadow counter
  tracks kill history, not the living roster, so after the d96 tribute
  delivery removed 2 veterans it stays elevated for the rest of the run.
  The guard is disagreements-only (0) — not a defect, but the phantom
  metric loses meaning after a delivery; recorded here.)
- Trap-line: HOLD — 1 mime sitting in driver transcripts (Xue 135301
  d120-nv, mime shown, nv:accept taken). The r134 fix is re-proven by
  this band, unlike r196's SILENT band.
- Betrayal sibling: 3 turn-0 offers, all with the invite label in the
  opening THEM lines. HOLD.
- Lived-days HOLD; lesser 4/4 HOLD.

## Q3 — DAILY-PLAY MIME (read-only, carried)

Daily-play mimes 25 (capture 26 minus 1 driver sitting with a mime);
daily-play accepts proven 0 (walk-line lower bound; 0 off-day events in
the betray watch). The gap stands: the shared chooser never takes
`betrayal:accept` / `nv:accept` in daily play. Baraka re-check: two
comm-'none' villagers in the band — **Xue** (Mandarin-only, 135301,
trust 90), whose driver sitting (d120-nv) showed the mime, took
nv:accept, and shared a secret place; **Mariko** (Japanese-only, 135303,
trust 90), whose driver sitting (d90-nv) showed no mime and no answer —
4× nv:nod (see Q4). Lane decision still owed: teach the shared chooser
to take betrayal:accept + nv:accept when offered, or keep proving fixes
only where the driver looks.

## Q4 — PEOPLE CHECK: PASS (all transcripts + all 6 raise talks read in full)

- **Caleb 135302 d90** (grief thread): "Have you — sorry. I keep
  thinking about them." → walk → comfort ("Nobody's asked me that in a
  while... I'm alright. Getting there.") → first-memory exchange (Miami
  — "heat on pavement, someone's hand huge around mine", the same
  first-memory template Wolfgang used in r196 with Columbus; a shared
  line pool with city variation, not a defect).
- **Ho-jun 135302 d120** (curious): "Did you leave someone behind?
  ...Sorry. You don't have to answer that." — "Yes." — "Yeah." A long
  quiet. "Me too." — the same question Wolfgang answered in r196; the
  deflection after ("I don't talk about that... Someday. Not today.")
  plants for later. The strongest exchange in the band.
- **Fernando 135303 d90** (ask_favor stage 2, goal thread): "Healing
  isn't just bodies..." → "Come see what I found" → torn-up ground,
  hand on sleeve → healing aphorisms ("I'm not a miracle worker. I'm a
  witness who brings bandages." / "Hurt people hurt people."). The favor
  itself is never asked — the r196 pattern, now refined: ask_favor
  surfaces on the WANT thread (Ava d90, Fernando d120) but not on the
  GOAL thread (Fernando d90). The sitting plants ("Good. We've got a
  plan forming."), so it passes the bar as a plant.
- **Fernando 135303 d120** (ask_favor stage 1, want thread): the favor
  IS voiced ("The cistern's nearly dry — 0 liters left...") and the
  player commits; Fernando is away on the road ("Catch me when I'm
  back") — a deferral with a reason; then a haul invite, accepted, then
  fresh tracks and a quiet retreat. Real stakes, coherent.
- **Ava 135301 d90** (ask_favor stage 2, want thread): the favor IS
  voiced ("About the sickness I'm fighting — the need hasn't gone
  anywhere. I'm still asking.") and the player commits ("I'll come back
  to help."). The r195-social favor surface (dlg:favor_requirements)
  was offered in the turn-0 menu. First band where the surface is
  exercised in a driver sitting.
- **Rawiri 135301 d120** (secret thread): a real confession ("I've been
  skimming extra food. I'm ashamed and I can't stop.") → "Come get air
  with me" → the stockpile shared (+4 wood, +4 fiber). Coherent; the
  invite label is in the opening THEM lines (betrayal guard holds).
- **Greta 135304 d90** (curious): "Do you still count the days? I lost
  track days ago." → "I count meals, not days. Three meals since the
  rain. Two since the alarm. Days are for people with calendars. I have
  a stomach." Sardonic, specific — and it foreshadows the village's
  hunger scatter 14 days later. The fiction holds together.
- **Xue 135301 d120-nv** (Mandarin-only): mime shown, nv:accept taken,
  secret place shared ("Don't tell the others. Everyone needs one
  place."), then 3× nv:nod with Mandarin agreement lines, ending in a
  wordless promise close. The nod loop persists (3×) but follows a real
  exchange and ends gracefully. The "Shit." line — proud of the one
  English they know — is voice, funny, human.
- **Mariko 135303 d90-nv** (Japanese-only, one-direction translation):
  NO mime shown (turn0 offers only nod/smile/pointself/listen) and 4×
  nv:nod with agreement lines — the purest filler shape this band. The
  "Talk to ME, not through it" line is a real beat (irritated at the
  live translation), and the close is graceful ("The conversation ends
  where language couldn't reach."), but four identical nods with no mime
  and no progression is a filler loop. Carried observation, third band
  running (Herve 5× r196, Xue 3×, Mariko 4×).
- **Raise talks:** Samat d10 (accepted, clean), Elif d17 (accepted,
  clean + an unprompted planted thread: "There's still the matter of
  the murder of Sam. Nobody's settled it."), Omar d10–d12 ×3
  (not-offered-unspoken, correct holds — an Arabic-only villager raised
  three days running with no shared words; sensible holds, but the
  policy keeps asking someone who can't answer), Petra d13 (accepted,
  clean). Closers are formulaic ("All right — let's ask them." echo ×3,
  "Sure. I'll be around.") but sensible.
- **New surfaces (r191 stage-0 guard reorder, r131 HEED fix):** no
  sitting in this band exercises a stage-0 guard re-ask or a warn_you
  HEED engagement visibly — no verdict from this panel; the landings'
  own proofs cover them.
- Senseless 0 for the raise-answer class.

## Q5 — CENSUS (plain words)

- **135301 — alive d141, three of three.** They knew Thornfield and
  priced the lesser seat d40. The scholar's party fought 62 fights (45
  wave-4). Ten of twenty-one deaths were "the wild". What they lack: one
  more seasoned link — LEAD 2/3, tribute ready d138 but undelivered.
- **135302 — alive d141, eight of eight.** They delivered a military
  tribute d96 and killed a wave-5 Editor d87. They fought the least (56
  fights) and lost the fewest (8 deaths). What they lack: seasoned links
  on the TRADE road (1/3).
- **135303 — alive d140, eight of eight.** They fought the most (140
  fights, 124 wave-4) and lost the fewest besides (4 deaths), priced the
  lesser seat late (d51). What they lack: one more seasoned link — LEAD
  2/3, with the third road TRADE at 2/3.
- **135304 — scattered d104, eleven alive when they walked.** They knew
  village_2 (link raised d10–d13), priced the lesser seat d35, killed
  four wave-5 monsters (two Cancellations, a Spoiler, an Editor) — then
  the pantry ran dry for three days and people walked in different
  directions. What they lack: food held, and a seasoned link (LEAD 0/3).

## The blank filled: ladder-line caps display — diagnosed + rendering fixed

- **Diagnosis (r196's owed follow-up read):** the caps field COLLAPSES
  after any delivery — the other two did NOT deliver silently. Proof:
  r196 seed 135203's census names one delivery
  (capstoneDelivered kind=military_tribute d140) and capstoneReady shows
  the other two were never ready (trade_charter null, feast_embassy
  null). Root cause: `Game.ladderCapstoneReady(kind)` in src/js/ladder.js
  returns `{reason: 'delivered'}` for EVERY kind once any capstone is
  delivered — the delivery is one-shot by design (table.js refuses a
  second delivery), so the engine's reason means "the capstone road is
  closed", which is true for all three kinds and correct for the UI's
  "A capstone is already delivered — the seat is open" line. The
  misleading part was only the driver's ladder-file `caps:` rendering,
  which printed the per-kind reason verbatim as if it were per-kind
  delivery state — on the same line whose `delivered=` field named the
  one real delivery.
- **Fix (driver + new module, scripts-only):**
  `scripts/ladder-caps-render.js` (new) renders the caps column honestly
  — the delivered kind reads `delivered`, any other kind whose reason is
  `delivered` reads `seat-open`; `scripts/journey-scale-r197-20261114.js`
  uses it for the ladder file. Re-rendering the real r196 d140 row now
  gives `trade_charter=seat-open,feast_embassy=seat-open,
  military_tribute=delivered`. Proof:
  `scripts/test-ladder-caps-render.js` 8/8 green (r196 d140 shape,
  ready-kind, all-short, missing capstones/row/kind, trade_charter
  delivered flip). No src/js change: the engine behavior is deliberate;
  only the instrument rendering was fixed. The r197 panel ran on the old
  rendering (the fix landed after the panel); r197's ladder files still
  show the old collapse where a delivery happened (135302 d96+) — the
  census JSONs are authoritative there, as before.

## Analyzer notes

- The r197 instrument ran clean on the r197 corpus — no analyzer fix
  was needed. The proof test (29/29) covers the re-based lived-days
  control: the base corpus totals 471 lived-days (+2.4% vs the new 460
  control, still HOLD), and case (6) still breaches at 160 total.
- **Phantom days 135302 d96–d140:** after the d96 tribute delivery
  removed 2 veterans, shadow4/shadow5 stay elevated (45 days) — the
  shadow counter tracks kill history, not the living roster, so it never
  forgets departed veterans. Guard is disagreements only (0) — not a
  defect, recorded here.
- **135304 over=true with pop 11/11:** the scattering path (hunger),
  not extinction — the roster still lists the walkers. The analyzer's
  COLLAPSE blocker reads the census `over` flag, which is correct for
  both paths; the run note names the flavor.

## Telemetry check: QUIET — no LOUD lines, baseline NOT rolled

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current '.../journey-scale-r197-trust-*.json' --metrics
fightsTotal,fightsByWave.4,maxGameDay` → quiet (4 files, 3 metrics).
Verified the sums by hand: fightsTotal 370 (-17.0% vs 446), w4 308
(+6.6% vs 289), maxGameDay 526 (-18.6% vs 646) — all under the tool's
60% LOUD bar, so quiet is correct. The w4 direction flipped vs r196
(-46.4% then, +6.6% now) on the fight-heavy 135303/135304 seeds — band
noise, not a change (no combat code changed). Baseline NOT rolled — the
re-base on a larger panel is still owed, not this run.

## Metric review

- Q1: the interesting-finding rule held as written (0/4 national + named
  per-seed blockers = informative). The 135304 hunger-scatter flavor is
  a new blocker flavor the analyzer names as COLLAPSE (correctly — the
  village ended before national); the flavor lives in the run note.
- Q2: the guards held as written. The lived-days re-base (r195 392 →
  r196 460) held — 526 lands inside 345–575, and the proof's base corpus
  still passes under the new control. The re-base itself was recorded in
  the prereg before the panel ran.
- Q3/Q4/Q5: as written. The trap guard's HOLD (vs r196's SILENT) is a
  coverage gain — the r134 fix is re-proven by Xue's sitting.
- Telemetry: see above — quiet under the 60% bar; the fightsTotal
  baseline re-base stays owed.

## Verdicts

- **Reachable: YES.** Regional 4/4, ladder stage 3 on points 4/4, lesser
  seat priced 4/4, raise answers work, a military tribute delivered,
  wave-5 monsters faced and killed.
- **Fun: YES.** Conversations read as people (Ho-jun's "Me too.", Greta
  counting meals, Fernando's witness-with-bandages, Xue's one English
  word); the scale climb is visible — links form, tribute arrives, the
  lesser seat prices, and two villages faced the fifth wave while still
  climbing.
- **Winnable: NO (this leg).** 0/4 national, 0/4 full seat; the binding
  constraint is still trust held above 40 for a season — two living
  villages sit one seasoned link short, and the fourth scattered from
  hunger before it could season any.

## Gate / landing

- Proof tests: `test-journey-scale-r197-analyzer-20261114.js` 29/29 green
  (before the panel ran); `test-ladder-caps-render.js` 8/8 green (after
  the panel; the fix it proves is driver-only).
- `check.js --quick`: **332 passed, 8 failed in 1259s — GO after
  adjudication (0 attributable; log
  `~/workspace/worktrees/journey-scale-r197-gate.log`, standalone log
  `~/workspace/worktrees/journey-scale-r197-gate-standalone.log`).** The
  8 failures: measurement-proof-update + measurement-workflow (staleness
  pair — "Proof source inputs are not current", proof refresh round 15
  owed; same failure as r189/r195/r196 on master), phone-frame-proof
  (stale receipt, same as r189/r195/r196), test-measurement-cache-flags
  (gate 0/4 under box load 11–17, standalone 4/4 — the 2026-11-12
  load-artifact shape, not a code failure), 4× 120s load timeouts
  (living-garden, occupation-panels, one-person-army,
  trust-observer-neutrality — ALL exit 0 standalone: living-garden rc=0,
  occupation-panels 25/25, one-person-army rc=0, trust-observer-neutrality
  6/6). This run changed no `src/js` (scripts + evidence only).
- Commits on branch `journey-scale`: fae9feb25 (prereg + instruments),
  f04a8fa6e (caps-render fix + proof), 5bb57af95 (run note + prereg
  closeout) + this addendum — rebased clean onto eb6360801 (Lane B r200
  adoption) and then e7c6861bf (Loop B capable-win-path DIAG), both proofs
  re-run green on the final tip (analyzer 29/29, caps 8/8).
- Merge/release/rotation: merged `--ff-only` onto e7c6861bf; tree released
  done-merged, worktree removed, branch deleted; rotation-a 3→0; lock
  deleted; hbloop killed. Merged locally, pending ship. (This section
  filled by the addendum commit on the same branch, merged ff-only right
  after; final tip hash in the memory log.)

## Carried (not this run's to build)

Daily-play chooser never takes invites — lane decision owed; wave-5 door
NOW OPEN (2/4 seeds, 5 kills) but national still the wall; hunger scatter
(135304) as a collapse flavor alongside combat wipeouts; nod loop 3×–4×
(Xue 3× after a real exchange, Mariko 4× with no mime — third band
running); ask_favor goal-thread non-voicing (Fernando d90 — refined:
surfaces on want thread, not goal thread); Omar 3-day repeat raise with
no shared words; first-memory + "left someone behind" line-pool reuse
across villagers; raise-talk closers formulaic; post-delivery phantom
persistence (shadow counter tracks kill history); telemetry fightsTotal
baseline re-base (next run); culpritbisect narrowed 15A–15F (tracker
blanks — bisect steps, not a journey leg); proof refresh round 15 (owed
after the next manifest change).
