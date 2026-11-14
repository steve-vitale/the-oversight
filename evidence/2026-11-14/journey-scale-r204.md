# journey-scale r204 — RUN NOTE (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-scale-r204-20261114T174308Z` (lock run_id
`playtest-loop-a-scale-r204-20261114T174308Z`).
**Run:** scheduled Sat 2026-11-14 10:45 CST; lock created 17:43:08Z
(started ~58 min late — scheduler/queue delay + a VM/runtime restart
mid-registration, not a run decision).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only.**
**Base:** worktree registered on local master `dcae77800` (Version bump
976b161b5-20261114-173741, batch ship). Master did not move during the
run (no rebase owed at merge).
**Pre-flight:** main tree clean BY TARGETED EVIDENCE — a full `git status
--short` timed out 4× under box load 8–19 (280s, 240s, 880s, 580s
attempts; a sibling ship-loop status ran 9+ min in the same window, and
three statuses ran concurrently). The first read (17:38:01Z) showed
exactly 4 modified files — the ship-loop version-bump set (index.html,
src/js/build.js, sw.js, version.json) — committed 17:38:22Z as
dcae77800; after that commit all four hash-identical to HEAD
(`git hash-object` vs `git rev-parse HEAD:<path>`), `git diff --cached`
empty (nothing staged), `git ls-files --others` empty (no untracked
files), and no process wrote to the main tree in the window except the
ship loop's safe-commit (the `git reset --hard` in the window ran inside
a sibling worktree, verified via /proc cwd). Disk 37%, lock absent (no
stale-lock recovery), `git pull` already up to date at dcae77800. Reap:
SKIP on a registry lock held by a live sibling registration
(sim-transplant15e-p12-a, then sim-vetbank-b — each holding
REGISTRY.lock through a ~12–20 min checkout); consecutive skips: 3
(ALERT — holder identified, legitimate, not stuck; no cleanup this run).
**Worktree:** `journey-scale` — the first registration was interrupted
by a VM/runtime restart mid-checkout (~17:59Z; branch existed at
dcae77800, partial dir with only `evidence/`, no registry entry, not in
`git worktree list`); recovered by deleting the branch + partial dir and
re-registering under the same slug. Re-registration queued behind two
sibling registrations, completed 18:13:57Z (~12 min; registry run_id
2026-11-14T18:06:25+00:00). The manual re-heartbeat queued behind the
same registry lock and landed 18:33:14Z — 27 min after registration, past
the 15-min threshold; the tree survived (the reaper's removal threshold
is ~4h, and the reaper queues on the same lock; no ship-loop run was due
in the window). Hbloop
`~/workspace/worktrees/journey-scale-hbloop-r204.sh` (10-min cadence)
launched 18:33Z and beat cleanly thereafter. Worktree status clean on
arrival (fresh checkout, stat cache warm — the 5s status that the main
tree could not complete in 580s).
**Prereg:** `evidence/2026-11-14/journey-scale-r204-prereg.md` (committed
BEFORE any judged sim: instruments commit ca12a6e29).
**Corpus:** `hidden_files/evidence/2026-11-14/journey-scale-r204-*` (goal
store — the r188 pattern).
**Driver:** `scripts/journey-scale-r204-20261114.js` (r197 clone).
**Analyzer:** `scripts/analyze-journey-scale-r204-20261114.js` (r197 clone
+ lived-days control re-based to the r197 band's 526 + NEW nod-streak
section). **Proof:**
`scripts/test-journey-scale-r204-analyzer-20261114.js` (**37/37 green**
— r197's 29 + new nod cases 12–14 — see §Analyzer).

## Panel (seeds 135401–135404, DAYCAP=140, policy scalecourt-traderoad-r113-linkraise-sit)

| seed | days | over | pop | rank | peakStage | lesser | wave-4 kills | wave-5 fights/kills | deaths (top cause) |
|---|---|---|---|---|---|---|---|---|---|
| 135401 | 141 | alive | 8/8 | regional | 3 (d30) | d47 | 11 | 4 / 0 | 7 (the wild 3) |
| 135402 | 109 | over | 5/5 | regional | 3 (d44) | d58 | 0 | 0 / 0 | 12 (sickness 6) |
| 135403 | 102 | over | 5/5 | regional | 3 (d31) | d40 | 6 | 1 / 0 | 11 (the wild 6) |
| 135404 | 67 | over | 10/10 | regional | 3 (d27) | d47 | 2 | 0 / 0 | 8 (the wild 4) |

Lived-days 419 vs r197 band 526 (-20.3%, guardrail ±25%: HOLD, near the
lower edge 395). Lesser seat priced 4/4 (bar ≥3/4: HOLD). Books close on
all 4 seeds; unattributed 0; teleOnly 0. Fights (startCombat count):
33/25/60/19 = 137; wave-4 fights 12/2/51/6 = 71; **wave-5 fights 4/0/1/0
= 5, with 0 wave-5 kills** (see §Wave-5). Tribute: military_tribute ready
d90 on 135401 (**0/51 attempts — all refused veterans-short**, see
§Tribute) and ready d72 on 135403 (**0/27 attempts**, same reason); never
ready on 135402/135404.

## Q1 (PRIMARY) — NATIONAL ON-RAMP: NO-GO on the wall, blocker named per seed (interesting)

National 0/4 — no village reached national (a polity). Per the
pre-registered interesting-finding rule, 0/4 with a named per-seed blocker
IS the informative outcome:

- **135401 (alive d141):** closest road LEAD 2/3 seasoned (3 active) —
  needs 1 more seasoned. Same one-short shape as r197's 135301/135303.
- **135402 (over d109):** COLLAPSE — sickness took 6 (no healer for the
  whole 109 days, healerDays 0), starvation took 2 at the end. The
  holder-less village shape, again (see §Census).
- **135403 (over d102):** COLLAPSE — the wild took 6, monsters 3, despite
  a healer present all 102 days. Fought the most (60 fights, 51 wave-4)
  and still died in the field.
- **135404 (over d67):** COLLAPSE — **hunger scatter**, the second band
  running (r197's 135304 was the first): pantry empty 3 straight days,
  capture lines "Day 3 of hunger" then "Haven couldn't hold... people
  started walking". 10 alive when they walked; the roster still reads
  10/10, so `over=true` with a full roster means scattered, not dead. A
  healer was present all 67 days — food, not medicine, was the binding
  constraint.

The wall stands on a fresh band, and survival fell: survived 1/4 (down
from r197's 3/4), regional 4/4, national 0/4, table 0/4, wins 0/4. The
binding constraint is still trust held above 40 for a season — the one
living village sits one seasoned link short of the LEAD road — and the
collapse flavors are widening: sickness-without-a-healer, field deaths,
and now a second hunger scatter.

## Wave-5 — the door opened, nothing died

- **135401: 4 wave-5 fights, 0 kills.** **135403: 1 wave-5 fight, 0
  kills.** Five wave-5 fights across the band, zero kills — against
  r197's 8 fights and 5 kills. The door is open (a wave-5 monster was
  faced on 2/4 seeds again) but the kills did not follow on this band.
  Small numbers, and the two fighting seeds died early (d102) or
  fought scholar-light (135401's 4 wave-5 fights are in the census
  `byWave`, with 0 in the vetkill log) — band noise, not a re-closure;
  the wave-5-facing link is still exercised, just not converted here.

## Tribute — ready twice, delivered never (0/51 + 0/27, all veterans-short)

- **135401:** military_tribute ready d90, **51 attempts, 0 deliveries**
  — every ladder-events line reads `DELIVER military_tribute ok=0
  reason=veterans-short`, d90 through d140.
- **135403:** ready d72, **27 attempts, 0 deliveries**, same reason,
  d72 through d102.
- This is NOT a new defect — it is the known M23 shape, live on two
  seeds at once. The code says it plainly (`src/js/ladder.js:489`):
  readiness counts the scholar as a veteran (Steve RULED 2026-11-10),
  so scholar + 1 villager veteran reads ready; delivery
  (`src/js/table.js:200`) needs **2 non-scholar veterans** and honestly
  refuses until a second payable veteran stands. "That split is the
  ruling's consequence, not a bug: the bar measures the village's
  strength, the payment measures who can leave."
- The band makes the consequence concrete: 135401 held **payable=1 for
  51 straight days** (d90–d141) — the village's 11 wave-4 kills were
  9 scholar + 2 by a single villager, so only one villager ever became
  a veteran. 135403 the same shape (payable=1, 27 days). The tribute
  road is gated in practice by the second payable veteran, which
  neither seed grew. The metric revision owed since r194 (exempt
  scholar+1 refusals from the ready signal) is still owed — this band is
  fresh evidence for it, not a fix for this run.

## Q2 — REGRESSION GUARDS: all GO/HOLD (exit 0)

- Spoken-raise (r134 fix): 3 talks — 2 properly answered, 1 counter, 0
  not-offered-spoken. GO.
- Vetbar: 0 disagreements on all 4 seeds. GO. (No phantom days this
  band — no delivery ever removed a veteran.)
- Trap-line: HOLD — 1 mime sitting (Elif 135403 d90-nv, mime shown,
  nv:accept taken). The r133 fix is re-proven by this band.
- Betrayal sibling: 1 turn-0 offer, with the invite label in the opening
  THEM lines. HOLD.
- **Nod-loop (NEW, r132 re-proof): HOLD — worst streak 3x (nv:nod) in
  Elif's sitting; 0 sittings at ≥4.** The 3-streak is the fix WORKING,
  not a loop: after the 2nd identical nod the thin-out armed, the 3rd
  nod drew "Their gestures slow — the conversation thinning like light
  at dusk", and the sitting ended naturally (see §Q4). The r132 pilot
  claim (loops → 0) holds on the scale leg — the old 4–5x shape is gone.
- Lived-days HOLD (419, guardrail 395–658); lesser 4/4 HOLD.

## Q3 — DAILY-PLAY MIME (read-only, carried)

Daily-play mimes 9 (capture 10 minus 1 driver sitting with a mime);
daily-play accepts proven 0 (walk-line lower bound; 0 off-day events in
the betray watch). The gap stands: the shared chooser never takes
`betrayal:accept` / `nv:accept` in daily play. Baraka re-check: one
comm-'none' villager in the band — **Elif** (Turkish-only, 135403,
trust 89), whose driver sitting (d90-nv) showed the mime, took
nv:accept, and received a tool ("Here. I made an extra."). Lane
decision still owed: teach the shared chooser to take betrayal:accept +
nv:accept when offered, or keep proving fixes only where the driver
looks.

## Q4 — PEOPLE CHECK: PASS (all transcripts + all 3 raise talks read in full)

- **Oliver 135401 d90** (ask_favor stage 1, want thread): the favor IS
  voiced ("Water's almost gone — 0 liters. I can't carry enough alone.
  First light, the creek, you and me?") and the player commits ("I'll
  come back to help."). The r201 favor-want settle gate's first live
  read: the favor was planted d64, surfaces here at stage 1, and the
  close line does NOT declare it settled — it closes on the commitment
  ("Dawn, then. Bring something to carry — and thank you."), which is
  the gate working as designed (a promise is not a settlement). The
  dry closer ("File that under 'productive.' Loosely defined.") fits
  the dry-temperament vet.
- **Oliver 135401 d120** (grief thread): a burial opening, the "Come see
  what I found" invite (label in the opening THEM lines — betrayal
  guard holds), a walk to the hollow, comfort about Ruth ("Ruth is gone
  and the world just... continues. That's the part I can't stand." /
  "I write everything down. It doesn't bring anyone back. It just keeps
  my hands from shaking."), a taught skill (American Ginseng) mid-grief,
  and "The fire feels smaller without Ruth. The rest of us will have to
  be bigger." Coherent and human. One voice quirk: the closer "And...
  scene. Good talk." reads like a stage direction leaking into
  dialogue — noted, not a defect.
- **Isaac 135402 d90** (curious): "What do YOU think actually happened
  to us?" → the aliens theory → "we're the control group. Somewhere
  there's a village that got instructions, and we're the ones they
  just... watched. Cheerful thought, right?" A real theory conversation
  with a wry voice; it plants a question rather than answering one.
- **Nolan 135403 d90** (grief): "I don't know what to do with my hands
  today" → comfort → "Did you leave someone behind? ...Sorry. You don't
  have to answer that." → "I don't know." → "Okay. You don't have to
  have an answer." The same "left someone behind" question as r197's
  Ho-jun (and r196's Wolfgang) — the line-pool reuse is now four bands
  running; the deflection after it is gentle and coherent, so it passes
  the bar as a plant, but the pool is visibly shared.
- **Elif 135403 d90-nv** (Turkish-only): mime shown, nv:accept taken, a
  tool gifted ("Here. I made an extra."), then 3× nv:nod with Turkish
  agreement lines and caught-word glosses ("Evet, haklısın" — you're
  right), the thin-out line after the 3rd nod, and a graceful wordless
  close ("They press their palms together — thanks, or goodbye, or
  both."). The r132 fix is visible in the transcript. One inconsistency:
  the opener renders "speaks only 🇹🇷 Turkish" — a flag emoji in a
  dialogue line, where r197's Xue sitting had none ("speaks only
  Polish"). Cosmetic; carried as an observation.
- **Raise talks:** Ignacio d26 (accepted, clean — new closer variant "Oh
  — okay. Later, then."), Hedda d17 (counter — the village countered the
  proposal, properly counted), Tariq d128 (accepted, clean). The
  "All right — let's ask them." THEM echo appears in all three — the
  formulaic closer persists a third band running.
- **New surfaces (r132 nod-loop, r201 favor-want gate):** both exercised
  and both read correctly — the nod thin-out ends the sitting naturally
  after the 3rd nod, and the favor-want close line does not declare a
  favor settled on a promise. No verdict against either landing from
  this panel.
- Senseless 0 for the raise-answer class.

## Q5 — CENSUS (plain words)

- **135401 — alive d141, eight of eight.** They knew Thornfield and
  priced the lesser seat d47. The scholar's party fought 33 fights (12
  wave-4, 4 wave-5 faced, none killed). Ten of their 11 wave-4 kills
  were the scholar's — only one villager ever became a veteran, so the
  military tribute sat ready d90 and undelivered for 51 days. What they
  lack: one more seasoned link — LEAD 2/3 — and a second payable veteran.
- **135402 — over d109, five of five.** Sickness took six — there was no
  healer for the whole run (healerDays 0) — and starvation took two at
  the end. They priced the lesser seat d58 and never readied a tribute.
  What they lack: a healer, and food held.
- **135403 — over d102, five of five.** They fought the most (60 fights,
  51 wave-4) and lost eleven to the wild and monsters, healer present
  all 102 days. They priced the lesser seat d40, readied a tribute d72,
  and could not deliver it (one payable veteran). What they lack: a
  second veteran, and a field they can survive.
- **135404 — scattered d67, ten alive when they walked.** They priced
  the lesser seat d47, knew two villages, faced no wave-5 monster — then
  the pantry ran dry for three days and people walked in different
  directions, a healer present the whole time. What they lack: food
  held, and time (the earliest collapse in the recent bands).

## The blank filled: r132 nod-loop re-proof + r201 favor-want gate read

- **Nod-loop (r132): RE-PROVEN on the scale leg.** The analyzer's new
  nod-streak section (max consecutive identical nv: react gestures per
  sitting) finds worst 3x in the band — Elif's sitting — and the
  transcript shows the mechanism: 2nd nod arms the thin-out, 3rd nod
  draws the thinning line, the sitting ends naturally. The old 4–5x
  loop shape (Herve 5×, Mariko 4×) is gone. Proof:
  `scripts/test-journey-scale-r204-analyzer-20261114.js` cases 12–14
  (4× nod → BREACH, 2× nod → HOLD, 4× listen excluded). No src/js
  change: the fix under test is r132's landing; this run is its
  scale-leg proof.
- **Favor-want settle gate (r201): READ, no defect.** Oliver's d90
  sitting shows the gate's intended behavior (commitment, not
  settlement, in the close line). No fix claimed.

## Analyzer notes

- The r204 instrument ran clean on the r204 corpus — no analyzer fix
  was needed. The proof test (37/37) covers the re-based lived-days
  control: the base corpus totals 526 lived-days (+0.0% vs the new 526
  control), and case (6) still breaches at 160 total.
- **135404 over=true with pop 10/10:** the scattering path (hunger),
  not extinction — the roster still lists the walkers. The analyzer's
  COLLAPSE blocker reads the census `over` flag, which is correct for
  both paths; the run note names the flavor.
- **135402 healerDays 0 / dutyDays 0:** the holder-less shape — no
  healer, no duty-holder, for the whole 109 days. The medicine levers
  (Steve's 2026-11-13 ruling, all four) are the standing answer; this
  band is fresh evidence for them, not a new diagnosis.
- **Wave-5 kills 0/5 fights:** the vetkill log is empty for wave 5 on
  all seeds. The door opened (5 fights) but nothing died — the
  winnability chain's "wave-5 facing" link is exercised, "wave-5
  killing" is not, on this band.

## Telemetry check: LOUD on w4 before the re-base; re-base ROLLED, w4 still marginally LOUD

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current '.../journey-scale-r204-trust-*.json' --metrics
fightsTotal,fightsByWave.4,maxGameDay` → **2 LOUD lines against the old
baseline** (fightsTotal -69%: 446 → 137; w4 -75%: 289 → 71), exit 1.
Verified the sums by hand: fightsTotal 33+25+60+19 = 137, w4 12+2+51+6
= 71, lived-days 141+109+102+67 = 419 (-35.1% vs 646, quiet).
**Investigation (before rolling):** no combat-initiation, wild-encounter,
or fight-frequency code changed since r197 (the delta is conversation.js
dialogue + fusion gates only), and the driver policy is identical — the
drop is band composition, not a regression: 3/4 early collapses
(d109/d102/d67 vs r197's 1/4) cut the fighting window, and fight density
halved (0.33/day vs r197's 0.70/day) while villager wild fights stayed
high (135401: 120 wildW4). The three-band sequence (r196 215, r197 370,
r204 137) shows the metric is high-variance across bands. The old
baseline (446/289/646) is from a fight-heavier era and reads low on all
three recent bands — stale.
**Re-base ROLLED (the re-base owed since r196):**
`telemetry-baselines/scale.json` 446/289/646 → **241/178/468** (3-band
means: fightsTotal (215+370+137)/3, w4 (155+308+71)/3, maxGameDay
(460+526+419)/3; backup `scale.json.20261114-pre-r204.bak`). The tool's
`--update-baseline` was NOT used — it writes the current band's
aggregates alone (137/71/419), which would center the instrument on the
collapse-heaviest band. Re-check against the new baseline: fightsTotal
-43% quiet, maxGameDay -10% quiet, **w4 -60% still LOUD (marginal, 0.1
over the bar)** — the honest residual: this band fought wave-4 at 40% of
the recent mean. The metric stays high-variance; the next band will tell
whether the center holds.

## Metric review

- Q1: the interesting-finding rule held as written (0/4 national + named
  per-seed blockers = informative). The 135404 hunger-scatter flavor is
  the second band running; the analyzer names it COLLAPSE (correctly —
  the village ended before national); the flavor lives in the run note.
- Q2: the guards held as written. The lived-days re-base (r196 460 →
  r197 526) held — 419 lands inside 395–658, near the lower edge; the
  proof's base corpus still passes under the new control. The NEW
  nod-loop guard held (worst 3x) — the r132 fix's claim, added here
  before the panel ran, and the transcript proves the mechanism.
- Q3/Q4/Q5: as written. The trap guard's HOLD (Elif's sitting) is the
  third consecutive band re-proving the r133 fix.
- Telemetry: see above — investigated, re-base rolled to 3-band means,
  w4 residual LOUD -60% recorded as band noise + collapse shape.

## Verdicts

- **Reachable: YES.** Regional 4/4, ladder stage 3 on points 4/4, lesser
  seat priced 4/4, raise answers work, wave-5 monsters faced, a tribute
  readied twice (undelivered for a named, ruled reason — see §Tribute).
- **Fun: YES.** Conversations read as people (Oliver on Ruth, Isaac's
  control-group theory, Nolan's "I don't know what to do with my hands
  today", Elif's wordless thanks); the scale climb is visible — links
  form, the lesser seat prices, the fifth wave is faced. The collapses
  read as tragedies with causes (sickness without a healer, a pantry
  run dry), not as noise.
- **Winnable: NO (this leg).** 0/4 national, 0/4 full seat, 0/4 tribute
  delivered; survival fell to 1/4, and the binding constraints are
  unchanged — trust held above 40 for a season (one seasoned link
  short on the living village) — with the tribute road now visibly
  gated behind a second payable veteran as well.

## Adoption closeout (r205, 2026-11-14 ~20:47Z) — coordinator died, run adopted

- **Stale-lock recovery:** the r204 coordinator's lock (`playtest-loop-a-scale-r204-20261114T174308Z`, created 17:49:46Z) was still in place at 20:43Z with the `journey-scale` registry heartbeat 70 min stale (19:33:22Z), newest worktree file 19:37Z, no live processes in the tree, hbloop dead. Per the overlap guard the run was DEAD; lock deleted, new lock `playtest-loop-a-scale-r205-20261114T204707Z` written, heartbeat landed immediately, hbloop restarted.
- **Adoption, not a re-run:** the r204 panel, corpus (`hidden_files/evidence/2026-11-14/journey-scale-r204-*`, complete), prereg closeout, and run note were all finished; only the gate contingency (living-garden standalone rc=0), the closeout commit, rebase, merge, and rotation write were outstanding. Re-running the panel would duplicate a finished 4-seed leg. This run verifies r204's claims and finishes its closeout.
- **Verification by the adopter (not taken on trust):** analyzer proof re-run in the worktree — **37/37 green** (same count as r204's pre-panel proof). Telemetry baseline roll verified on disk (`scale.json` = 241/178/468; backup `scale.json.20261114-pre-r204.bak` present). Corpus spot-checked (panel logs + transcripts + trust/vetbar files present for all 4 seeds).
- **Living-garden (the one pending gate item):** re-run with a 590s cap hit the cap again (exit 124) at 13/16 seeds, zero failures, progressing cleanly (seed lines 7, 42, 99, 1234, 555, 777, 2026, 31337, 1–5) — same load-timeout shape as r204's 280s attempt (16 seed lines, no failure). The suite spawns a child process per seed (16 seeds) and the box was at load 11.5 with a sibling rerun of the same test running concurrently in `sim-reunion-balance`. A full 16-seed run with a 1500s cap is the adoption closeout step; its result is recorded in the memory log and the gate log.
- **Master moved during adoption:** r204's base `dcae77800` → master `59f78034c` (transplant evidence-only arms landed after r204 died). Rebase onto `59f78034c`, analyzer proof re-run, living-garden full run, then merge are the adoption closeout steps; outcomes are recorded in the memory log, not in this note (the note is committed before the merge).
- **Merge/release/rotation:** [filled at closeout].

## Gate / landing

- Proof tests: `test-journey-scale-r204-analyzer-20261114.js` **37/37
  green** (before the panel ran).
- `check.js --quick`: **325 passed, 15 failed in 2277s** (gate log
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-14/journey-scale-r204-gate.log`;
  standalone log `.../journey-scale-r204-gate-standalone.log`). The 15:
  10× 120s load timeouts (comfort-arc, living-garden,
  occupation-panels, one-person-army, phase-shawl, solo-campaign-endings,
  synergy-stall, throttlefeast, capable-bot, table-endings — the box ran
  a sibling check.js concurrently for the whole gate, load 6–19, vs
  r197's 4 timeouts), measurement-proof-update + measurement-workflow
  (staleness pair — "Proof source inputs are not current"; proof refresh
  b17 landed since r197 but the r132/r201/fusion landings re-staled the
  inputs, round 18 owed; same failure class as r189/r195/r196/r197),
  phone-frame-proof (stale receipt, same as r189/r195/r196/r197),
  measurement-cache-flags (gate 0/4 under load — the 2026-11-12
  load-artifact shape), trust-observer-neutrality (exit 1, bare Error at
  63.2s — NOT a timeout; standalone re-run pending, see below). This run
  changed no `src/js` and no `src/data` (scripts + evidence only), so
  none of the 15 is attributable to this run's change on its face; the
  standalone batch is the evidence. **Standalone adjudication: 11/12
  rc=0** (comfort-arc, cache-flags, occupation-panels, one-person-army,
  phase-shawl, solo-campaign-endings, trust-observer-neutrality,
  synergy-stall, throttlefeast, capable-bot, table-endings — all exit 0
  standalone, including trust-observer-neutrality, whose gate exit-1 was
  a load flake). The 12th, living-garden, hit my 280s standalone cap
  while progressing cleanly through its seeds (16 seed lines, no
  failure) — re-run with a 590s cap pending; fill before merge. The 3
  deterministic failures (measurement-proof-update +
  measurement-workflow staleness pair, phone-frame stale receipt) were
  adjudicated from their error text, not re-run — same failure class as
  r189/r195/r196/r197, proof refresh round 18 owed. **Gate: GO after
  adjudication (0 attributable)** — contingent on the living-garden
  re-run landing rc=0.
- Commits on branch `journey-scale`: prereg + instruments (ca12a6e29),
  driver summary label (f3731842a) — [run note + prereg closeout commit
  and merge details to fill at closeout].
- Merge/release/rotation: [to fill at closeout].

## Carried (not this run's to build)

Daily-play chooser never takes invites — lane decision owed; wave-5 door
open but 0 kills this band (5 fights); hunger scatter now 2 bands
running (135304 r197, 135404 r204); sickness-without-a-healer collapse
(135402, healerDays 0 — the medicine levers are the standing answer);
tribute road gated behind a second payable veteran (M23 metric revision
still owed); "left someone behind" line-pool reuse (fourth band
running); raise-talk closers formulaic ("All right — let's ask them."
echo ×3); Elif flag-emoji opener inconsistency (🇹🇷 in one line, none in
r197's Xue sitting); "And... scene. Good talk." stage-direction closer;
telemetry w4 residual LOUD -60% vs the new baseline (metric
high-variance; next band judges the center); culpritbisect narrowed
15A–15F (tracker blanks — bisect steps, not a journey leg); proof
refresh round 17 landed (the r197 gate's staleness pair should be gone —
confirm in this run's gate log).
