# journey-scale r207 — RUN NOTE (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-scale-r207-20261115T1100Z` (lock run_id
`oversight-playtest-loop-2026-11-15T04:53Z`).
**Run:** scheduled Sun 2026-11-15 04:45 CST; lock created 10:53:53Z
(2026-11-15 04:53 CST scheduled, started ~8 min late — the box was slow
this morning; worktree registration alone took ~3 min).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only.**
**Base:** worktree registered on local master `9fa74d252`. Master did not
move during the run (verify at closeout).
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 38%, lock absent (no stale-lock recovery), `git pull` already up
to date at 9fa74d252. Reap: ran clean (11/16 active; 4 dirty trees left
alone per reaper rules). Heartbeat landed 11:00:36Z; hbloop
`~/workspace/worktrees/journey-scale-hbloop-r207.sh` (10-min cadence)
launched 11:00Z, pid 30383.
**Prereg:** `evidence/2026-11-15/journey-scale-r207-prereg.md` (committed
BEFORE any judged sim: instruments commit 043109b99; safe-commit index
clobber struck and was repaired per the documented recipe —
`git ls-tree -r HEAD | git update-index --add --index-info`, status
clean after).
**Corpus:** `hidden_files/evidence/2026-11-15/journey-scale-r207-*` (goal
store — the r188 pattern).
**Driver:** `scripts/journey-scale-r207-20261115.js` (r206 clone + secret:*
ENGAGE + spotterWatch in census()).
**Analyzer:** `scripts/analyze-journey-scale-r207-20261115.js` (r206 clone
+ lived-days control re-based to the 3-band rolling mean 500 + NEW
spotter census section). **Proof:**
`scripts/test-journey-scale-r207-analyzer-20261115.js` (**47/47 green**
— r206's 43 + new spotter cases 18–19 — see §Analyzer).

## Panel (seeds 135601–135604, DAYCAP=140, policy scalecourt-traderoad-r113-linkraise-sit)

| seed | days | over | pop | rank | peakStage | lesser | wave-4 kills | wave-5 fights/kills | deaths (top cause) |
|---|---|---|---|---|---|---|---|---|---|
| 135601 | 84 | over | 0/0 | regional | 3 (d38) | d52 | 1 | 0 / 0 | 19 (the wild 12) |
| 135602 | 127 | over | 0/0 | regional | 3 (d44) | d73 | 4 | 9 / 0 | 22 (the wild 19) |
| 135603 | 136 | over | 0/0 | regional | 3 (d28) | d38 | 2 | 0 / 0 | 18 (the wild 5) |
| 135604 | 114 | over | 0/0 | regional | 3 (d47) | d55 | 5 | 22 / 0 | 22 (the wild 12) |

Lived-days 461 vs 3-band rolling mean 500 (-7.8%, guardrail 375–625:
**HOLD** — the re-base works; r206's single-band breach does not repeat).
Lesser seat priced 4/4 (bar ≥3/4: HOLD). Books close on all 4 seeds;
unattributed 0; teleOnly 0. Fights (startCombat count): 25/42/45/39 =
151; wave-4 fights 13/12/34/12 = 71; **wave-5 fights 0/9/0/22 = 31, with
0 wave-5 kills** (see §Wave-5). Tribute: military_tribute ready d97 on
135602 (**0/6 attempts — all refused veterans-short**), ready d64 on
135604 (**0/14 attempts — veterans-short**); never ready on 135601 /
135603. No delivery this band (r206 delivered once; the M23 shape is
back to its 0-delivery form).

## Q1 (PRIMARY) — NATIONAL ON-RAMP: NO-GO on the wall, blocker named per seed (interesting)

National 0/4 — no village reached national (a polity). Per the
pre-registered interesting-finding rule, 0/4 with a named per-seed blocker
IS the informative outcome. This band is harsher than r206's: **0/4
survived** (r206: 2/4), every village extinct before d140:

- **135601 (over d84, extinct):** COLLAPSE — the wild took 12 of 19;
  final road LEAD 1/3 seasoned. Died with pantry 105.
- **135602 (over d127, extinct):** COLLAPSE — the wild took 19 of 22
  (the harshest single-cause toll in the recent scale bands; two
  3-death days, d57 and d115); final road LEAD 2/3 seasoned. Died with
  pantry 2,516 — food was not the constraint.
- **135603 (over d136, extinct):** COLLAPSE — the wild 5, but the deaths
  spread across eleven causes (ambush, monster 4, The Terms of Service,
  thirst, expedition, starvation 2, stranger, night, dehydration); final
  road LEAD 2/3 seasoned (3 active), TRADE 1/3. Died with pantry 0.
- **135604 (over d114, extinct):** COLLAPSE — the wild 12 of 22,
  including a 6-death day (d84); final road LEAD 2/3 seasoned, TRADE
  2/3. Died with pantry 2,500 — again, not a food death.

The wall stands on a fresh band, and the collapse flavor is again the
wild (12 + 19 + 5 + 12 = 48 of 81 deaths). No living village exists to
hold a seasoned road — the LEAD counts above are frozen states of dead
villages, not roads that could season. Survival fell to 0/4 after two
bands at 1–2/4; the four-band sequence (r197 3/4, r204 1/4, r206 2/4,
r207 0/4) keeps moving with band composition, not with any game change
that touches survival — the four src/js landings since r206 touch
funerals, favor bookkeeping, spawn entry points, and want-thread
naming, none of them a survival lever.

## Wave-5 — the door opened wider, and nothing died: the linger moved up a wave

- **135602: 9 wave-5 fights, 0 kills. 135604: 22 wave-5 fights, 0 kills.**
  31 wave-5 fights across the band, 0 wave-5 kills — against r206's 5
  fights and 2 kills. The kill lines name no Editor, Spoiler,
  Cancellation, or Finale in any seed's capture.
- The capture names the shape, and it is r206's herald shape with the
  serial numbers filed up a wave: "Something moves out there — The
  Editor." / "You turn to leave — behind you, The Editor stirs." / "It
  followed you. The Editor is here." Editor-stirs 7× on 135602, 4× on
  135604; Spoiler-stirs 3× on 135602. "It followed you" 19–66 times per
  seed. The wave-5 monsters arrive, pace at the boundary, and are fought
  repeatedly without dying — the same unresolving encounter loop r206
  documented for the Herald, now on the wave that gates the win.
- **The Herald itself dies this band:** 1 herald kill on each of 135602,
  135603, 135604 (Olivia on 135602, Petra on 135604, both on camera as
  veteran kills). The herald flood persists as presence — 121 herald
  lines and 98 gorge-nights on 135603, Herald-stirs 20× — but the fights
  now resolve sometimes: wild wave-4 fights 105/98/131/49 with 1
  villager wave-4 kill each on 135602/135603/135604. The r206 question
  (one herald vs successive heralds) is still unanswered — the corpus
  carries no monster instance ids — but the kill side of the shape moved.
- The nightly gorge tax runs on all four seeds (24/58/98/57 gorge
  lines), across many monster types, while the flavor line still
  promises "they drift off within ~6 nights." The line repeats as new
  lingerers arrive, so it is not literally false per monster — but the
  player-facing experience is a nightly pantry tax for months on a
  village that then dies with a full pantry (135602: 2,516 kcal;
  135604: 2,500 kcal). The tax is not what killed them; the field is.

## Tribute — READY-UNPAYABLE twice, no delivery

The analyzer's M23 payability section (r206 instrument) reports:

- **135601: NEVER-READY** (0 attempts).
- **135602: READY-UNPAYABLE** — ready d97, payable=1 at ready,
  6 attempts, 0 delivered, all veterans-short. The village died d127
  with payable still 1.
- **135603: NEVER-READY** (0 attempts).
- **135604: READY-UNPAYABLE** — ready d64, payable=1 at ready,
  14 attempts, 0 delivered, all veterans-short. The village died d114
  with payable still 1.

Two ready-but-unpayable runs of 30 and 50 days. The r206 delivery
(d108, resolved by a second veteran arriving) did not repeat — no second
payable veteran arrived on either ready seed. The M23 shape is the
steady state; the delivery was the exception.

## Q2 — REGRESSION GUARDS: all GO/HOLD (exit 0)

- Spoken-raise (r134 fix): 6 talks — 4 properly answered, 2 counter,
  0 not-offered-spoken, 0 defects. GO.
- Vetbar: 0 disagreements on all 4 seeds. GO.
- Trap-line: HOLD — 1 mime (Elif 135604 d90), answered with nv:accept.
- Betrayal sibling: HOLD — 0 turn-0 offers this band (nothing to check).
- **Nod-loop (r132 re-proof): HOLD — worst 3x in 7 of 9 sittings.**
  The 3-streak is the fix WORKING, not a loop: after the 2nd identical
  nod the thin-out arms, the 3rd nod draws the wind-down line, and the
  sitting ends naturally. The uniformity (3x in 7/9; the other two
  sittings are verbal, 0x) is the mechanism's signature.
- **Lived-days HOLD: 461 vs the 3-band rolling mean 500 (-7.8%).** The
  re-base adopted this run from r206's proposal holds on its first use:
  a collapse-heavy band (0/4 survived) still lands inside 375–625.
- Lesser seat priced 4/4 (d52/d73/d38/d55). HOLD.

## Q3 — DAILY-PLAY MIME (read-only, carried)

Daily-play mimes 17 (capture 18 minus 1 driver sitting with a mime);
daily-play accepts proven 0 (walk-line lower bound; 0 off-day events in
the betray watch). The gap stands: the shared chooser never takes
`betrayal:accept` / `nv:accept` in daily play. Baraka re-check: three
comm-'none' villagers in the band — **Sanne** (German, 135602, three
sittings, no mime), **Saad** (Thai, 135603, no mime), **Elif** (Turkish,
135604, mime shown + nv:accept taken, thinking-spot walk). Lane
decision still owed: teach the shared chooser to take betrayal:accept +
nv:accept when offered, or keep proving fixes only where the driver
looks.

## Q4 — PEOPLE CHECK: PASS (all 9 transcripts + all 6 raise talks read in full)

- **Galym 135602 d90** (secret): THE BLANK, PROVEN LIVE. The NPC
  confides ("Can I tell you something? I've been sneaking out at night.
  I'm ashamed and I can't stop.") and the driver — with the r207
  secret:* ENGAGE addition — answers with a promise ("That stays
  between us."), and the NPC answers back ("I needed someone to know —
  just one person. Thank you for being that person."), the talk moves
  into curiosity ("So what's your plan here? Just... get through it?")
  and closes warm ("I'm rooting for you. Whatever you're working on.").
  Against r206's Omar walk-away, this is the fix working in the wild.
- **Rufina 135603 d90** (curious): coherent, but the opener stutters —
  "About your plan here — So what's your plan here? Just... get through
  it?" The "About X —" prefix doubles the question. Minor; carried as
  a dialogue polish note.
- **Tariq 135603 d120** (curious, trust): "Can I trust you? I mean
  really." → "I hope to earn it." → "That's the right answer. The wrong
  one would've been 'yes' too fast." Sharp and human.
- **Sanne 135602 d90-nv / d120 / d120-nv** (German, three sittings):
  all 3x nod with the thin-out visible; the d120 sitting's opener is
  the same German line as d120-nv's, and the closing line ("They press
  their palms together — thanks, or goodbye, or both.") repeats across
  d90-nv and d120-nv. Same villager, same shape, three times — the
  -nv sitting is a stable instrument, not a loop, but the closing pool
  is thin.
- **Saad 135603 d90-nv** (Thai): 3x nod, thin-out, the same "press
  their palms together" closer — the closer is the shared pool, not
  Saad's own line.
- **Elif 135604 d90** (mime answered): the thinking-spot walk — "Elif
  shows you where they go to think. 'Don't tell the others. Everyone
  needs one place.'" — the same line r206's Salvador spoke (sixth band
  running for the pool line). The mime answer itself is the r133 fix
  working.
- **Elif 135604 d90-nv**: 3x nod; closer "They wave you off gently,
  already turning away. The conversation ends where language couldn't
  reach." — the one fresh closer in the band.
- **Raise talks:** 4 accepted, 2 counter, 0 defects. No double-serve
  of the invite line in any talk — the Lane B r206 fix reads clean
  again. The formulaic "All right — let's ask them." THEM echo persists
  in all 6 accepted talks (seventh band running). Two talks carry an
  unsettled-ambush line ("There's still the matter of the ambush of
  Milagros/Ingrid. Nobody's settled it.") — the world remembering a
  death, unprompted.
- Senseless 0 for the raise-answer class. r209 deferred-ask / favor-block
  and r208 lapsed-want surfaces were NOT exercised in this band's 9
  transcripts (no favor-blocked or lapsed-want sitting appeared) —
  carried, not re-litigated.

## Q5 — CENSUS (plain words)

- **135601 — over d84, extinct.** Two ambushes early, a slow bleed, then
  the wild took twelve. They priced the lesser seat d52 and never readied
  a tribute. Healer present 13 of 83 days (duty 12) — the thinnest
  coverage in the band. What they lack: a field they can survive, and a
  second veteran.
- **135602 — over d127, extinct.** They fought the most wave-5 fights
  (9) and lost nineteen to the wild — two 3-death days — with a healer
  present 125 of 126 days. They priced the lesser seat d73, readied a
  tribute d97, and could not deliver it (one payable veteran). What they
  lack: a second veteran, and a wave-5 monster that dies.
- **135603 — over d136, extinct.** The longest-lived, the most varied
  deaths (eleven causes), the herald flood at its worst (121 herald
  lines, 98 gorge-nights) — and still a herald kill. They priced the
  lesser seat d38, the earliest in the band. What they lack: any
  seasoned road (LEAD 2/3, 3 active; TRADE 1/3) and a field that does
  not bleed them dry one death at a time.
- **135604 — over d114, extinct.** They fought 22 wave-5 fights — the
  most in the band — killed none, and lost twelve to the wild including
  a 6-death day (d84). They priced the lesser seat d55, readied a tribute
  d64, and could not deliver it (one payable veteran). What they lack:
  a second veteran, and a wave-5 kill.
- **Spotter (Q5 line, r139 wiring): NOT MEASURABLE from this corpus —
  again, for a new reason.** The r207 driver snapshots foodXp at seed
  end (the r210 end-only pattern), and all four villages are extinct, so
  the final roster is empty on every seed — spotterWatch: [] ×4. The
  end-only snapshot cannot read a collapse-heavy band. Owed to the next
  run's driver: snapshot spotterWatch mid-run (e.g. at d90, while the
  roster still lives) instead of — or in addition to — seed end. The
  instrument is sound; its timing is wrong for this leg's collapse
  shape.
- **Funeral-mend watch:** funeral lines 4–6 per capture, mourning beats
  5–8 per seed — funerals fire and are mourned on all four seeds. No
  shape change vs r206's band is visible in the capture; the mend's
  effect (if any) is below this leg's resolution. The r209
  deferred-ask/favor-block and r208 lapsed-want surfaces did not appear
  in the band's transcripts (see Q4).

## The blanks filled: secret:* picker + spotter snapshot (one proven, one timed wrong)

- **secret:* picker (r206-owed): LANDED as a driver change and PROVEN
  LIVE.** ENGAGE now takes `secret:promise` / `secret:comfort` /
  `secret:offer` (conversation.js:5109–5111). The band exercised it
  exactly once — Galym 135602 d90 — and the sitting reads as a kept
  confidence instead of a walk-away. No src/js change.
- **Spotter snapshot (r206-owed): LANDED as an instrument, UNREADABLE
  on this band.** census() now carries spotterWatch (r210 end-only
  pattern); the analyzer's SPOTTER section counts it (proof cases
  18–19). But all four villages died, so every snapshot is an empty
  roster. The fix is timing, not wiring — the next run owes a d90
  snapshot. Recorded under §Metric review, not re-built mid-panel.

## Analyzer notes

- The r207 instrument ran clean on the r207 corpus — no analyzer fix
  was needed. The proof test (47/47) covers the re-based lived-days
  control (fixture total 419 = -16.2% vs the new 500 control) and the
  spotter cases.
- **Lived-days control, first use:** 461 vs 500 (-7.8%, HOLD). The
  3-band rolling mean absorbs a 0/4-survival band that the single-band
  control would have failed (r206's 555 breached 419 by +32.5%; this
  band's 461 would have been +10.0% vs 419 — inside — so the two runs
  bracket the control's behavior from both sides; the rolling mean is
  the steadier judge).
- **135602/135604 pantry at death (2,516 / 2,500 kcal):** both villages
  died rich. The gorge tax is not the killer on this band; the field
  is. The pantry is a red herring here — worth remembering when the
  next food-economy arm reads these seeds.

## Telemetry check: 1 LOUD line, DOWN — investigated, baseline NOT rolled

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current '.../journey-scale-r207-trust-*.json' --metrics
fightsTotal,fightsByWave.4,maxGameDay` → **1 LOUD line**
(fightsByWave.4 -60%: 178 → 71), exit 1. fightsTotal QUIET (151 vs 241,
-37%, under the 60% bar); maxGameDay QUIET (461 vs 468, -1.5%).
**Investigation (before rolling):** no combat-initiation, wild-encounter,
or fight-frequency code changed since r206 (the delta is the funeral
mend, deferred-ask/favor-block, terrain-pocket, lapsed-want naming —
none touches spawn rates or combat initiation), and the driver policy is
identical apart from the secret:* ENGAGE addition (conversation-only).
The swing is band composition: all four villages collapsed early
(d84–d136), shortening the wave-4 window, while r206's band had two
villages living to d141 with herald floods driving w4 to 331. The
five-band sequence (r196 155, r197 308, r204 71, r206 331, r207 71)
shows the metric swings ±60–85% band to band with NO code change — it
is high-variance by nature on a 4-seed panel, and this band's 71 is
exactly r204's band value. The lived-days guard already catches the
same band-shape signal.
**Baseline NOT rolled:** the current baseline is the r204 3-band roll,
two runs old; rolling it to a 5-band mean on this band's evidence would
chase noise in the opposite direction from r206's roll decision (r206
was +66%/+86% high; r207 is -60% low on the same metric). The baseline
stays 241/178/468 until the panel design changes or the center proves
stable across two bands.

## Metric review

- Q1: the interesting-finding rule held as written (0/4 national + named
  per-seed blockers = informative). The 0/4-survival read is new — the
  rule names the blocker, not the survival count, so no revision is
  owed; the survival slide itself is the finding.
- Q2: the guards held as written. The lived-days re-base (single-band
  419 → 3-band rolling mean 500) held on first use — a collapse-heavy
  band lands inside 375–625. The nod-loop guard held (worst 3x, 7/9
  sittings — the mechanism's signature). The NEW spotter section held
  as written (all four snapshots read, all empty — the instrument
  reports, the band supplies nothing).
- Q3/Q4/Q5: as written. **Spotter timing revision proposed for the NEXT
  run (not applied here):** snapshot spotterWatch at d90 in addition to
  seed end — the end-only snapshot cannot read a collapse-heavy band.
  The secret:* surface held as written (1 secret sitting, answered with
  a promise).
- Telemetry: see above — investigated, baseline NOT rolled; the w4
  metric is noise-dominated on 4-seed panels.

## Verdicts

- **Reachable: YES.** Regional 4/4, ladder stage 3 on points 4/4, lesser
  seat priced 4/4, raise answers work, wave-5 monsters faced (31 fights),
  a herald killed on 3/4 seeds.
- **Fun: PARTIAL.** Conversations read as people (Galym's kept secret,
  Tariq on trust, Elif's thinking spot); the scale climb is visible —
  links form, the lesser seat prices, the fifth wave is faced. But the
  wave-5 door is a treadmill: 31 fights, 0 kills, the same linger lines
  r206 documented for the Herald now spoken by the Editor and the
  Spoiler — and every village dies before d140, so the climb ends in
  the same place four times.
- **Winnable: NO (this leg).** 0/4 national, 0/4 full seat, 0/4 survived;
  the binding constraint is survival itself this band — no village
  lived long enough for a road to season — and the wave-5-facing link
  converts 0/31.

## Gate / landing

- Proof tests: `test-journey-scale-r207-analyzer-20261115.js` **47/47
  green** (before the panel ran).
- `check.js --quick`: **335 passed, 5 failed in 931s** (gate log
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-15/journey-scale-r207-gate.log`).
  The 5: living-garden + one-person-army (both 120s load timeouts,
  seeds progressing cleanly — the box ran the gate under load, same as
  r206); phone-frame-proof (stale receipt, same as
  r189/r195/r196/r197/r204 — sixth straight run, a separate owed job
  for fresh 390×736/390×844 receipts); and a NEW pair —
  test-measurement-proof-update ("Proof source inputs are not current")
  + test-measurement-workflow ("retained neutrality proof covers the
  current Game/controller/harness inputs"). The pair is staleness, not
  this run: proof refresh round 20 closed GO on tip 3904f2b8f, and
  exactly ONE src/js change landed between that tip and this run's base
  9fa74d252 — Lane B r209's deferred-ask ledger guard + favor-block
  noBeat (af56c7b4f) — re-staling the b20 panel. This run changed no
  `src/js` and no `src/data` (scripts + evidence only; branch diff vs
  base is 4 files), so none of the 5 is attributable to this run's
  change on its face. Proof-refresh round 21 is owed on the next
  manifest change — the flesh-out loop's job, not this run's.
  **Standalone adjudication: 2/2 rc=0** (living-garden, one-person-army
  — both exit 0 standalone with a 900s budget; log
  `.../journey-scale-r207-gate-standalone.log`). The phone-frame and
  measurement-pair failures were adjudicated from their error text +
  attribution, not re-run — both are staleness classes, not flakes.
  **Gate: GO after adjudication (0 attributable).**
- Commits on branch `journey-scale`: prereg + instruments (bdbccc17f
  after rebase; originally 043109b99), run note + prereg closeout
  (a4b8fb0b0 after rebase; originally b8a98d3e6).
- Master moved during the run (9fa74d252 → 0116c16e7, four
  evidence-only H1 transplant 7brain commits). Rebased onto 0116c16e7
  clean (2/2 picks, no stops), analyzer proof re-run green (47/47),
  then merged ff-only.
- Merge/release/rotation: merged locally, pending ship (no version tag;
  the ship job reports the tag when it goes live). Worktree released,
  branch deleted, final reap run, main tree verified clean. Rotation
  written 3→0.

## Carried (not this run's to build)

Daily-play chooser never takes invites — lane decision owed; hunger
scatter 2 bands running (r197/r204, none r206/r207); sickness-without-a-
healer collapse (none this band — healerDays 13–125, thinnest on the
shortest-lived seed); tribute road gated behind a second payable veteran
(M23 revision now an instrument reading; the game rule stands; 0
deliveries this band); "left someone behind" / "Okay. You don't have to
have an answer." line-pool reuse (sixth band running); raise-talk
closers formulaic ("All right — let's ask them." echo ×6); flag-emoji
openers systematic in all -nv sittings; "Don't tell the others.
Everyone needs one place." thinking-spot line (sixth band running);
nonverbal closing pool thin ("They press their palms together..." ×3);
Rufina opener stutter ("About your plan here — So what's your plan
here?"); herald linger / wave-4 variety collapse (herald kills now
land, 3 this band — the fight side moved, the linger side did not);
**wave-5 linger (NEW): Editor/Spoiler pace at the boundary, 31 fights,
0 kills — the r206 herald shape, one wave up; spawn/encounter question
with instance ids still owed**; spotter snapshot timing (d90 snapshot
owed to the next run); OVE-48 revert-vs-keep DECIDED KEEP (Nov 14
0215Z); culpritbisect narrowed 15A–15F (tracker blanks — bisect steps,
not a journey leg); proof refresh round 20 (gate staleness pair should
be gone this run; the gate log will confirm).
