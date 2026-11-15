# journey-scale r206 — RUN NOTE (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-scale-r206-20261115T0417Z` (lock run_id
`oversight-playtest-loop-2026-11-15T04:17Z`).
**Run:** scheduled Sat 2026-11-14 21:45 CST; lock created 04:17:30Z
(2026-11-15 03:45 UTC scheduled, started on time).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only.**
**Base:** worktree registered on local master `2a0c9b0d6` (ove48-mech
evidence). Master did not move during the run (no rebase owed at merge
— verify at closeout).
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 37%, lock absent (no stale-lock recovery), `git pull` already up
to date at 2a0c9b0d6. Reap: SKIP on a registry lock held by a live
sibling registration (consecutive skips: 1; holder legitimate, not
stuck; no cleanup this run).
**Worktree:** `journey-scale` — registration completed 04:18:10Z
(registry run_id 2026-11-15T04:18:10+00:00). The heartbeat script's
first two writes were refused by the host write flap (EPERM on
REGISTRY.json, 04:20–04:24Z; flap-watch probe confirms the window);
manual heartbeat landed 04:24:58Z, hbloop
`~/workspace/worktrees/journey-scale-hbloop-r206.sh` (10-min cadence)
launched 04:25Z and beat cleanly thereafter.
**Prereg:** `evidence/2026-11-15/journey-scale-r206-prereg.md` (committed
BEFORE any judged sim: instruments commit a38c3cd0c).
**Corpus:** `hidden_files/evidence/2026-11-15/journey-scale-r206-*` (goal
store — the r188 pattern).
**Driver:** `scripts/journey-scale-r206-20261115.js` (r204 clone).
**Analyzer:** `scripts/analyze-journey-scale-r206-20261115.js` (r204
clone + lived-days control re-based to the r204 band's 419 + NEW
tribute-payability section). **Proof:**
`scripts/test-journey-scale-r206-analyzer-20261115.js` (**43/43 green**
— r204's 37 + new tribute cases 15–17 — see §Analyzer).

## Panel (seeds 135501–135504, DAYCAP=140, policy scalecourt-traderoad-r113-linkraise-sit)

| seed | days | over | pop | rank | peakStage | lesser | wave-4 kills | wave-5 fights/kills | deaths (top cause) |
|---|---|---|---|---|---|---|---|---|---|
| 135501 | 137 | over | 0/0 | regional | 3 (d57) | d72 | 2 | 0 / 0 | 16 (the wild 12) |
| 135502 | 136 | over | 0/0 | regional | 3 (d34) | d62 | 3 | 0 / 0 | 14 (the wild 12) |
| 135503 | 141 | alive | 9/9 | regional | 3 (d38) | d46 | 10 | 3 / 1 | 10 (the wild 4) |
| 135504 | 141 | alive | 8/8 | regional | 3 (d32) | d48 | 10 | 2 / 1 | 14 (the wild 6) |

Lived-days 555 vs r204 band 419 (+32.5%, guardrail ±25%: **BREACH** —
see §Metric review; the breach is on the LONG side, two villages lived
to d141). Lesser seat priced 4/4 (bar ≥3/4: HOLD). Books close on all
4 seeds; unattributed 0; teleOnly 0. Fights (startCombat count):
38/191/135/36 = 400; wave-4 fights 29/179/106/17 = 331; **wave-5
fights 0/0/3/2 = 5, with 2 wave-5 kills** (see §Wave-5). Tribute:
military_tribute ready d115 on 135502 (**0/9 attempts — all refused
veterans-short**), ready d107 on 135503 (**delivered d108**, 1/2
attempts), ready d120 on 135504 (**0/1 attempts — veterans-short**);
never ready on 135501.

## Q1 (PRIMARY) — NATIONAL ON-RAMP: NO-GO on the wall, blocker named per seed (interesting)

National 0/4 — no village reached national (a polity). Per the
pre-registered interesting-finding rule, 0/4 with a named per-seed blocker
IS the informative outcome:

- **135501 (over d137, extinct):** COLLAPSE — the wild took 12, six in a
  single day (d136: Valentina, Elijah, Cheryl, Andreina, Ray, Huong),
  pantry 480 at the end. Final road: LEAD 2/3 seasoned.
- **135502 (over d136, extinct):** COLLAPSE — the wild took 12; the
  village fought wave-4 heralds 167 times and still died in the field
  (see §Herald). Final road: LEAD 0/3 (no active lead links left).
- **135503 (alive d141):** closest road LEAD 0/3 seasoned (2 active) —
  needs 3 more seasoned. The village delivered its tribute and killed a
  wave-5 monster, but holds no seasoned road.
- **135504 (alive d141):** closest road LEAD 0/3 seasoned (1 active) —
  needs 3 more seasoned; belong not good (village_1: trust 20, arrears
  67,500 kcal, link age 11 days — a late d129 link already drowning in
  arrears).

The wall stands on a fresh band, and survival rose: survived 2/4 (up
from r204's 1/4), regional 4/4, national 0/4, table 0/4, wins 0/4. The
binding constraint is still trust held above 40 for a season — the two
living villages hold ZERO seasoned links on any road — and the collapse
flavor is again the wild (12 + 12 on the two dead seeds).

## Wave-5 — the door opened, and this time something died

- **135503: 3 wave-5 fights, 1 kill** — spoiler killed d122 by
  gen_ym10qcm (the scholar's party). **135504: 2 wave-5 fights, 1 kill**
  — editor killed d129 by jesse_cortez (the scholar's party). Two more
  wave-5 fights (rerun ×2 on 135503, editor d132 on 135504) ended
  without a kill.
- Five wave-5 fights across the band, 2 kills — against r204's 5 fights
  and 0 kills. The wave-5-facing link is exercised AND converted this
  band, both kills by the scholar's party in the field (not the arena,
  not wild villagers).

## Tribute — the M23 revision reads, and a tribute DELIVERED

The analyzer's new payability section (the r194-owed revision, this
run's blank) reports per seed:

- **135501: NEVER-READY** (0 attempts).
- **135502: READY-UNPAYABLE** — ready d115, payable=1 at ready,
  9 attempts, 0 delivered, all veterans-short. The r204 shape, again:
  the bar read ready (scholar + 1 villager veteran) while the payment
  needed a second payable veteran that never arrived; the village died
  d136 with payable still 1.
- **135503: DELIVERED** — ready d107 (payable=1), attempt refused
  veterans-short; **d108 a second villager became a veteran
  (legacy 1→2, payable 1→2) and the delivery landed** (ladderevents
  d108 DELIVER ok=1; the ladder daily row marks it d109). The first
  tribute delivery since r197's 135302. The revision's value is visible
  here: ready-but-unpayable lasted exactly one day, and the section
  shows why it resolved — a second veteran arrived, not a re-score.
- **135504: READY-UNPAYABLE** — ready d120, payable=1, 1 attempt,
  0 delivered, veterans-short; the village is alive at d141 with
  payable still 1.

The M23 shape is now an instrument reading, not a run-note
interpretation: READY-UNPAYABLE vs DELIVERED vs NEVER-READY, with the
payable count at ready printed beside the attempts. No game code
changed; the ready signal still reads as the engine reports it.

## Herald — wave-4 variety collapses to one monster (the run's second finding)

- **135502: 167 of its 191 fights were herald** (wave 4), d60–d111 —
  ~3 herald fights a day for seven weeks, 1 herald kill in the
  waveKillLog. **135503: 96 of 135 fights were herald**, d79–d105.
  On the two quiet seeds herald is 14/38 and 4/36.
- The capture names the shape: a Herald lingers at the treeline, gorges
  the pantry nightly, and keeps re-engaging ("Something pads into the
  clearing — The Herald. It's here." / "You turn to leave — behind you,
  The Herald stirs." / "It followed you."). One lair line per seed
  (tile 7,4 on 135502). The scholar's party fought it ~3×/day for weeks
  and killed it once — the fights don't resolve.
- The lingering-gorge mechanic runs nearly every night on the fighting
  seeds (114 gorge-nights on 135502, 120 on 135503, across many monster
  types — Buffering, Chorus Line, The Big Beast) while the flavor line
  promises "they drift off within ~6 nights." The line repeats nightly
  as new lingerers arrive, so it is not literally false per monster —
  but the player-facing experience is a nightly pantry tax for months
  (135502 died with pantry 0; 1,200 kcal/night on the herald alone).
- Kill-attribution contrast: 135502 fought 179 wave-4 fights and the
  ladder attributes 3 wave-4 kills total (1 scholar, 2 villager). The
  corpus carries no monster instance ids, so one herald fought 167
  times vs successive heralds cannot be distinguished here — carried
  as a spawn/encounter question for the next run or the bisect, not a
  defect claim. It is, however, the mechanism behind the telemetry
  w4 swing (see §Telemetry).

## Q2 — REGRESSION GUARDS: one BREACH (lived-days), the rest GO/HOLD (exit 1)

- Spoken-raise (r134 fix): 8 talks — 6 properly answered, 1 counter, 1
  not-offered-unspoken, 0 not-offered-spoken. GO.
- Vetbar: 0 disagreements on all 4 seeds. GO. (Phantom days on 135503
  d109–140 — see §Analyzer — are the shadow column doing its job, not
  a disagreement.)
- Trap-line: HOLD — 2 mimes (Isaac 135502 d120-nv, Sophie 135504
  d90-nv), both answered. The r133 fix is re-proven by this band.
- Betrayal sibling: 1 turn-0 offer (Salvador 135502 d90), with the
  invite label in the opening THEM lines. HOLD.
- **Nod-loop (r132 re-proof): HOLD — worst 3x in all 7 -nv sittings.**
  The 3-streak is the fix WORKING, not a loop: after the 2nd identical
  nod the thin-out arms, the 3rd nod draws the wind-down line ("They
  glance toward their own thoughts", "A final shared look", "Their
  gestures slow — the conversation thinning like light at dusk"), and
  the sitting ends naturally (see §Q4). The uniformity (3x in 7/7) is
  the mechanism's signature.
- **Lived-days BREACH: 555 vs the r204 band's 419 (+32.5%, guardrail
  314–524).** The breach is on the long side: two villages lived to
  d141 (r204 had one), and the two collapses came late (d137, d136 —
  r204's came at d109/d102/d67). Per §14 the metric binds: the run is
  NO-GO on this guard, and it is NOT re-scored. See §Metric review for
  the proposal.
- Lesser seat priced 4/4 (d72/d62/d46/d48). HOLD.

## Q3 — DAILY-PLAY MIME (read-only, carried)

Daily-play mimes 46 (capture 48 minus 2 driver sittings with mimes);
daily-play accepts proven 0 (walk-line lower bound; 0 off-day events in
the betray watch). The gap stands: the shared chooser never takes
`betrayal:accept` / `nv:accept` in daily play. Baraka re-check: five
comm-'none' villagers in the band — **Yuki** (Japanese, 135501, mime
shown, never answered — the sitting had no mime to answer), **Isaac**
(French, 135502, mime shown + nv:accept taken, stockpile gifted),
**Stepan** (Russian, 135502, no mime), **Tashi** (Hindi, 135503, no
mime), **Sophie** (German, 135504, mime shown + nv:accept taken, cache
walk). Lane decision still owed: teach the shared chooser to take
betrayal:accept + nv:accept when offered, or keep proving fixes only
where the driver looks.

## Q4 — PEOPLE CHECK: PASS (all 15 transcripts + all 8 raise talks read in full)

- **Ray 135501 d90** (just_company): the thinnest sitting in the band —
  the want is company and the NPC has little to say beyond "This is
  nice. Just — being around people." The picker cycles dlg:react
  through the same two replies ("Yeah. Hey." / "Sure. Sit.") and
  "Anyway." repeats verbatim (driver-flagged). The r195 filler shape,
  second band running. Observation, not a defect class.
- **Andreina 135501 d120** (ask_favor, water haul): the favor IS voiced
  ("We're down to 0 liters of clean water... Will you come?"), the
  player commits ("I'll come back to help."), and the NPC answers she
  is away on the road — "find me when I'm back and we'll set it then."
  The r201 settle gate holds: the close line ("We're done here. Don't
  make it weird.") does NOT declare the favor settled — a promise is
  not a settlement. The 0 liters is the d137 collapse arriving.
- **Salvador 135502 d90** (grief + betrayal invite): a burial opening,
  the "Come see what I found" invite label in the opening THEM lines,
  accept → a buried food cache (+1406 kcal), comfort ("You're kind.
  Don't let this place change that."), gossip about the cameras ("You
  won Hardened Impress Us"), a lost waterskin found by Grace in an
  hour. Layered and human.
- **Salvador 135502 d120** (seek_taken): "I asked Autumn about what
  happened to my taken kin — Autumn's gone. Have you heard anything?
  About the taken. The pods." → "I don't know." → "Okay. You don't have
  to have an answer." → a promise to ask → "Walk with me?" → a quiet
  thinking spot ("Don't tell the others. Everyone needs one place.").
  The "Okay. You don't have to have an answer." line is the same pool
  line as r204's Nolan — line-pool reuse, fifth band running.
- **Ursula 135503 d90** (curious, mortician): "I can do making do. Not
  well — well enough that nobody's died from it yet. That's my whole
  résumé now: nobody's died from it yet." Dark, voiced, hers.
- **Omar 135503 d120** (secret): "Can I tell you something? I'm saving
  a candy bar for when things get better. I haven't told anyone." — and
  the player leaves immediately, because the driver's picker has NO
  secret:* handling (secret:promise/comfort are in none of its lists),
  so the sitting ends on the confidence: "Well. That happened." A
  driver artifact, not a game defect — the transcript reads coherently
  as a walked-away confidence — but the picker gap is real. Proposed
  for the next run: add secret:promise/comfort to ENGAGE (with a proof
  run); carried, not built here — the panel already ran and the fix
  needs its own proof.
- **Gina 135504 d90** (goal/leadership): "People need to know someone's
  got a plan. Even if the plan is 'we'll figure it out.'" → "Leadership
  isn't a title. It's the person who stays up wondering if everyone
  ate." The scale leg's theme, spoken by a villager stepping toward it.
- **Mateo 135504 d120** (curious, fight): "Have you ever hurt someone?
  Since all this started." → "Yes. I don't want to talk about the
  details. But yes." → "I don't keep score on that. Score-keeping is
  how you stop sleeping." Weighty and honest.
- **Nonverbal sittings (7):** all 3x nod with the thin-out visible; two
  mimes answered (Isaac's stockpile gift, Sophie's cache walk — "You
  walk to the cache spot with Sophie. Nothing much there — but they
  talk the whole way, and you learn the shape of them a little
  better."). Sophie's d120 sitting shows Ursula translating her German
  ("— Ursula translates: 'Well said. Exactly right.'") — the village's
  bilingual members bridge the gap. Tashi's d90 sitting shows the
  extended-mind translation variant, System cheer and all ("(Emotional
  content: HIGH! Great for ratings!)"). All 7 openers carry a flag
  emoji (🇯🇵🇷🇺🇫🇷🇮🇳🇩🇪) — systematic now, not the r204 one-off; the
  opener template includes the flag. Cosmetic; carried.
- **Raise talks:** 6 accepted, 1 counter, 1 not-offered-unspoken
  (Trang d120: a regrets conversation — "I regret the ordinary days I
  rushed through... I'd pay anything for one annoyed morning now." —
  the raise was never spoken, correct hold). No double-serve of the
  invite line in any talk — the Lane B r206 fix reads clean. The
  formulaic "All right — let's ask them." THEM echo persists in all 6
  accepted talks (sixth band running). Ursula's counter-labeled talk
  (135504 d128) reads as an accept in the transcript — the counter is
  in the engine's link negotiation, not the words; observation, not a
  defect.
- Senseless 0 for the raise-answer class.

## Q5 — CENSUS (plain words)

- **135501 — over d137, extinct.** Two ambushes early (d7, d14 — Rafael
  among them), a slow bleed, then the wild took six in one day (d136)
  and the last villager the next morning. They priced the lesser seat
  d72 and never readied a tribute. What they lack: a field they can
  survive, and a second veteran.
- **135502 — over d136, extinct.** They fought the most — 191 fights,
  167 of them herald — and lost fourteen to the wild, healer present
  133 of 136 days. They priced the lesser seat d62, readied a tribute
  d115, and could not deliver it (one payable veteran). What they lack:
  a second veteran, and a herald that dies.
- **135503 — alive d141, nine of nine.** They delivered the tribute
  d108, killed a wave-5 spoiler d122, fought 135 fights, and lost ten
  (the wild 4, a stranger 1, Gavel 1). They priced the lesser seat d46.
  What they lack: any seasoned road — LEAD 0/3 with 2 active links.
- **135504 — alive d141, eight of eight.** They killed a wave-5 editor
  d129, priced the lesser seat d48, readied a tribute d120 and could
  not deliver it (one payable veteran). A foreign polity reached 6
  fires, but Haven's late d129 link to village_1 sits at trust 20 with
  67,500 kcal arrears — the BELONG road is closed. What they lack: a
  second veteran, and a seasoned road.
- **Spotter (Q5 line, r139 wiring): NOT MEASURABLE from this corpus.**
  The r139 wiring grants spotter XP silently — no "spotter" line
  appears in any capture — and no instrument snapshots foodXp. The
  wiring itself was proved by r139's own tests; this leg cannot read
  it. Owed to the next run's driver: snapshot foodXp/spotter skill per
  villager (or the r139 instrument, if one exists).

## The blank filled: M23 tribute-payability metric revision + herald characterization

- **M23 revision (r194-owed): LANDED as an instrument.** The analyzer
  now reports tribute state per seed (READY-UNPAYABLE / DELIVERED /
  NEVER-READY) with ready day, attempts, deliveries, reason tally, and
  payable-at-ready. Proof: `scripts/test-journey-scale-r206-analyzer-20261115.js`
  cases 15–17 (READY-UNPAYABLE 51 attempts, DELIVERED 1/1, NEVER-READY).
  The band exercises all three states, and the DELIVERED case shows
  the revision's value: ready-but-unpayable for one day, resolved by a
  second veteran arriving — not by re-scoring. No src/js change.
- **Herald (new finding, not a fix):** wave-4 variety collapses to
  herald on the fighting seeds (167/191 and 96/135 fights, ~3/day for
  7 and 4 weeks, 1 kill each). Documented with spans, kill
  attribution, and the nightly gorge tax; carried as a spawn/encounter
  question (instance ids would settle one-herald vs successive
  heralds).

## Analyzer notes

- The r206 instrument ran clean on the r206 corpus — no analyzer fix
  was needed. The proof test (43/43) covers the re-based lived-days
  control: the base corpus totals 419 lived-days (+0.0% vs the new 419
  control).
- **135503 phantom days d109–140 (vetbar shadow4/shadow5 = 3 while
  r4/l3 = 1):** the mechanism, characterized. d107: ready, payable 1.
  d108: a second villager veteran arrives (payable 2), delivery lands.
  d109: roster 10→8 (the two villager veterans left with the tribute),
  fixed readiness falls to 1 (the scholar), while the shadow old-rule
  count stays 3 — the old vp-only liveness test still counts the
  delivered veterans as living. The shadow column is doing its job:
  it shows exactly what the pre-fix engine would have misread. The
  fixed engine never disagrees with the ladder (0 disagreements). This
  is the post-delivery phantom persistence carried since r194, now
  visible with a date and a cause — and it confirms the tribute
  "honestly strips BLOODED the same day" shape (Steve's owed decision
  item: paying veterans away before the wave-5 finale).
- **135504 belong arrears 67,500:** the d129 link to village_1 carries
  arrears of 67,500 kcal at trust 20–26 — Haven as subordinate, already
  drowning 11 days after the link formed. The BELONG road's good-
  standing bar (trust ≥50, arrears 0) is nowhere near met. The arrears
  figure itself (67.5k in 11 days) is worth a look by whoever owns the
  tribute-arrears math — carried, not this run's question.
- **135501/135502 over=true with pop 0/0:** extinction, not scatter —
  the death census closes the books (16/14 deaths, rostered 16/13).

## Telemetry check: 2 LOUD lines, both UP — investigated, baseline NOT rolled

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current '.../journey-scale-r206-trust-*.json' --metrics
fightsTotal,fightsByWave.4,maxGameDay` → **2 LOUD lines**
(fightsTotal +66%: 241 → 400; w4 +86%: 178 → 331), exit 1. maxGameDay
QUIET (555 vs 468, +18.6%).
**Investigation (before rolling):** no combat-initiation, wild-encounter,
or fight-frequency code changed since r204 (the delta is spotter wiring,
the invite-small fix, Reunion arena balance, and the holdbuild revert —
none touches spawn rates or combat initiation), and the driver policy is
identical — the swing is band composition + the herald flood: 135502
(191 fights, 167 herald) and 135503 (135 fights, 96 herald) dominate,
while r204's band had 137 fights total. The four-band sequence
(r196 215, r197 370, r204 137, r206 400; w4 155, 308, 71, 331) shows
the metric swings ±60–85% band to band with NO code change — it is
high-variance by nature on a 4-seed panel.
**Baseline NOT rolled:** the current baseline is the r204 3-band roll,
one run old; rolling it to a 4-band mean (280/216/490) on this band's
evidence would chase noise in the opposite direction from r204's roll
(r204 was -43%/-60% low; r206 is +66%/+86% high). The baseline stays
241/178/468 until the panel design changes or the center proves
stable across two bands. The w4 residual question from r204 is
answered in kind: the center does not hold — the metric is noise-
dominated, and the lived-days guard already catches the same
band-shape signal.

## Metric review

- Q1: the interesting-finding rule held as written (0/4 national + named
  per-seed blockers = informative). The 135504 belong-arrears flavor is
  new; the analyzer names it as "belong not good" with the figures.
- Q2: the guards held as written except lived-days, which BREACHED on
  the long side (555 vs 419, +32.5%). Per §14 the miss is NO-GO, never
  re-scored. **Proposal for the NEXT run (not applied here):** re-base
  the lived-days control from the single most-recent band to a 3-band
  rolling mean (r197 526 + r204 419 + r206 555)/3 = 500, guardrail
  375–625 — the single-band control is too volatile (460 → 526 → 419
  → 555 across four bands; ±25% bands barely overlap), and a
  longer-lived band should not fail the same way a collapse-heavy band
  passes. The nod-loop guard held (worst 3x, 7/7 sittings — the
  mechanism's signature). The NEW tribute section held as written (all
  three states exercised).
- Q3/Q4/Q5: as written. The spotter census line is unmeasurable from
  this corpus (see §Q5) — the next run's driver owes a foodXp snapshot.
- Telemetry: see above — investigated, baseline NOT rolled; the
  fightsTotal/w4 metrics are noise-dominated on 4-seed panels.

## Verdicts

- **Reachable: YES.** Regional 4/4, ladder stage 3 on points 4/4, lesser
  seat priced 4/4, raise answers work, wave-5 monsters faced AND killed
  (2), a tribute delivered (the first since r197).
- **Fun: YES.** Conversations read as people (Ursula the mortician's
  résumé, Gina on leadership, Mateo on having hurt someone, Salvador's
  buried cache and taken kin, Sophie's wordless promise); the scale
  climb is visible — links form, the lesser seat prices, the fifth wave
  is faced and killed. The collapses read as tragedies with causes (the
  wild taking twelve, a herald that won't die), not as noise.
- **Winnable: NO (this leg).** 0/4 national, 0/4 full seat; survival
  rose to 2/4 but the binding constraint is unchanged — no seasoned
  road on either living village (LEAD 0/3 on both) — and the tribute
  road still needs a second payable veteran on 2 of the 3 seeds that
  readied it.

## Gate / landing

- Proof tests: `test-journey-scale-r206-analyzer-20261115.js` **43/43
  green** (before the panel ran).
- `check.js --quick`: **337 passed, 3 failed in 950s** (gate log
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-15/journey-scale-r206-gate.log`).
  The 3: living-garden + one-person-army (both 120s load timeouts,
  seeds progressing cleanly — the box ran the gate under load, vs
  r204's 10 timeouts) and phone-frame-proof (stale receipt, same as
  r189/r195/r196/r197/r204). Notably GONE vs r204: the
  measurement-proof staleness pair (proof refresh round 19 landed),
  cache-flags, and trust-observer-neutrality — the cleanest gate in
  the recent scale bands. This run changed no `src/js` and no `src/data`
  (scripts + evidence only), so none of the 3 is attributable to this
  run's change on its face. **Standalone adjudication: 2/2 rc=0**
  (living-garden, one-person-army — both exit 0 standalone with a 900s
  budget). The phone-frame failure was adjudicated from its error text,
  not re-run — same failure class as five straight runs, a separate
  owed job (fresh 390×736/390×844 receipts). **Gate: GO after
  adjudication (0 attributable).**
- Commits on branch `journey-scale`: prereg + instruments (a38c3cd0c),
  driver header fix (98b59f5bf), run note + prereg closeout [hash at
  closeout].
- Master moved during the run (2a0c9b0d6 → 7ba58d326, one evidence-only
  commit: sim-scale-onramp-round-0215, OVE-48 KEEP decision). Rebased
  onto 7ba58d326, analyzer proof re-run green, then merged ff-only.
- Merge/release/rotation: [to fill at closeout].

## Carried (not this run's to build)

Daily-play chooser never takes invites — lane decision owed; hunger
scatter 2 bands running (r197/r204, none this band); sickness-without-
a-healer collapse (none this band — healerDays 133–140 on all 4);
tribute road gated behind a second payable veteran (M23 revision now an
instrument reading; the game rule stands); "left someone behind" /
"Okay. You don't have to have an answer." line-pool reuse (fifth band
running); raise-talk closers formulaic ("All right — let's ask them."
echo ×6); flag-emoji openers now systematic in all -nv sittings;
"And... scene. Good talk." closer not seen this band; driver picker has
no secret:* handling (Omar d120 walk-away — fix proposed for the next
run); just_company filler loop (Ray d90); herald linger / wave-4 variety
collapse (167 + 96 fights, 1 kill each — spawn/encounter question);
135504 belong arrears 67,500 in 11 days (tribute-arrears math worth a
look); spotter skill unmeasurable from this corpus (foodXp snapshot
owed); OVE-48 revert-vs-keep DECIDED KEEP (Nov 14 0215Z — causal path
proven negative); culpritbisect narrowed 15A–15F (tracker blanks —
bisect steps, not a journey leg); proof refresh round 19 GO (landed
Nov 14 0310Z — the gate's staleness pair should be gone this run;
the gate log will confirm).
