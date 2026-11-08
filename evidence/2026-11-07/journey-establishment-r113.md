# Journey — establishment, run r113 (2026-11-07)

Lane A, leg 1 (establishment, days 14–40, 42-day horizon). Scheduled
Sat 2026-11-07 17:45 CST. Run ID / lock: `2026-11-07T23:52:56Z`.
Rotation read `1`; write `2` at closeout. Branch
`journey-establishment`, base master `a7a26a1ff` (r117 merged).
Worktree `~/workspace/worktrees/journey-establishment`.

## Pre-registration (§14 — binding)

**The question, from r112's metric review.** The specialist/foodXp
ladder is OPEN and EXERCISED (r112: 306 foodXp, 235 rack grants, 255
hunt grants) but the pace misses the bar: 6/16 seeds move specialist
0→positive (bar 8/16). The miss is PACE, not mechanism: 28 XP cells
sit at 1–9, below the 10-XP first rung, because the work spreads thin
across many hands. r112's metric review proposed the tuning for r113:
first rung at 5 XP (matching the holder rung). THIS RUN IS THAT BUILD:
lower the self-taught first rung 10 → 5 XP and judge it before/after
on the same 16-seed balanced panel.

**The fix (my design call, Steve can overrule; committed `575e5971a`
with `[needs-eyes]`).** One line in `src/js/food.js`
(`specialistSkill`): the self-taught ladder goes 10→1 / 15→2 / 20→3
to **5→1 / 10→2 / 15→3, cap 3**. Holders unchanged (+1 at 5 XP,
cap 3). The self-taught now pay the SAME first rung as holders, not
double. Grant sites unchanged (racks +1/resolution, hunts +1/kill);
cook/spotter/builder foodXp stays askSpecialist-only; bot policy
unchanged. Win prices and deed gates untouched. Canon grounding
unchanged from r112 (CANON.md "Human skills ≠ alien abilities";
PRESERVATION.md "Blind penalties teach, never stupid-make").

**Bar (binding, §14 — no re-score).** GO iff ≥1 villager moves
specialist 0→positive on ≥8/16 seeds. Guardrails M3 ≥12/16 alive at
day 42, M4 0 starvation deaths on ≥12/16. Q2 standing: 0 `(null)` THEM
lines.

**Seeds.** Matched reuse 1502, 1504, 1603, 1604 + 17101–17112 — the
SAME 16 seeds as r112 (deliberate matched reuse). No new band reserved;
the r112 freshness check stands.

**Engine identity.** `src/js/` MOVED since the r112 fix
(d6eed674e..HEAD): conversation.js (opener-skip fix, r155), game.js +
party.js + villager-build.js (r155/r154/r116), build.js (version
bump). The r112-after panel is therefore NOT a valid before-panel for
r113 on current master. r113 ran a FRESH before-panel on master (16
seeds × 42d) with the r113 driver, then the fix, then the after-panel.

**Proof test** (`scripts/test-journey-establishment-r113-ladder.js`):
49 passed, 0 failed after the fix; 43 passed, 6 failed before it —
exactly the expected before-FAILs (the new-rung gate checks: xp5→1,
xp9→1, xp10→2, xp14→2, xp15→3, raw-record xp5→1). Logs:
`journey-establishment-r113-proof-before.log`,
`...-proof-after.log`.

**Driver neutrality.** r112 driver AND r113 driver, seed 1502, 42d, on
master (HUNTSTAFF=2) — funnel keys match EXACTLY (NEUTRAL). The
r112-driver 42d run is committed as the analyzer's neutrality
reference (`journey-establishment-r112-master42-seed1502.json` +
convo); the 5d run as the proof test's det-gate reference
(`journey-establishment-r112-master5-seed1502.json`). The seed-1502
neutrality run served as the pilot gate before the full before-panel
expanded.

## Infrastructure notes (loud first)

- **Registration took ~6 min (slow checkout)** — same as r117. No
  transient-status confusion this time; verified clean before any work.
- **Safe-commit index clobber struck on ALL FOUR commits** (prereg,
  before-evidence, fix, after-evidence — the known class, now 4-for-4
  this run). Repaired each time per the recorded recipe (`git ls-tree
  HEAD` + `git update-index --add --index-info`); verified `git status`
  clean (0 lines), `git diff HEAD` empty, blobs match HEAD after each
  repair. Every commit itself is correct.
- **Registry-lock queue, twice.** The 00:22Z `sim-doublenight-a`
  registration held REGISTRY.lock ~17 min while its `git worktree add`
  ran; my 00:30Z heartbeat queued behind it (plus a reap and several
  sibling heartbeats) and landed 00:40:23Z — 17 min after the previous
  heartbeat, past the 15-min staleness threshold. No reap could fire:
  the reaper itself was queued behind the same lock, and the queue
  drained in order with no intervention. A second queue (~6 min) hit
  the 00:48Z heartbeat the same way. No data lost, no tree removed.
  Watch item: a slow register can now hold the lock long enough to
  push every queued heartbeat past staleness — the reaper queueing
  behind the same lock is what saves it, and that ordering is luck, not
  design.
- **Pre-flight clean.** Main tree clean, disk 25%, `git pull` already
  up to date. Reaper removed nothing; active trees 3/16 at pre-flight
  (plus this run's). **No lock existed at start.** Lock created
  23:52Z, run_id `2026-11-07T23:52:56Z`. Deleted at closeout after
  read-back of run_id.
- **Context (not this run's work):** Steve 2026-11-07 17:55 CST RULED
  the pellet passes to hungrier hands (MEMORY.md) — a pellet-pass
  build is owed elsewhere (a `build-pellet-pass` worktree appeared
  during this run); this run measures master as-is and does not touch
  it. The alien expansion + Reunion mirror cap builds are still running
  in parallel worktrees.

## Verdicts

- **Q1: NO-GO — the ladder moves on only 7/16 seeds (bar 8/16).**
  Per §14 this stands; do not re-score. But the tuning moved it: 6
  seeds → 7, 8 moves → 12 moves. The before-panel (10-XP rung, on
  master) reproduces r112 exactly: 6 seeds with moves (1504, 1604,
  17102, 17104, 17110, 17111). The after-panel (5-XP rung): 7 seeds
  (1502, 1504, 17102, 17104, 17108, 17110, 17111).
- **The moves** (all 12, after-panel):
  - 1502 Chen preserver 0→1 (XP 5) — NEW seed, the exact 5-XP fruit
  - 1504 Caroline butcher 0→2 (XP 13), preserver 0→2 (XP 10); Pavel
    butcher 0→1 (XP 6)
  - 17102 Helga preserver 0→3 (XP 15)
  - 17104 Ruth butcher 0→3 (XP 21), preserver 0→3 (XP 22); Wanjiru
    butcher 0→1 (XP 6)
  - 17108 Tymofiy preserver 0→1 (XP 8); Theo butcher 0→1 (XP 8) —
    NEW seed
  - 17110 Mateo butcher 0→3 (XP 60)
  - 17111 Marcus preserver 0→3 (XP 19)
- **No-move seeds and why (the diagnosis, in plain words).** The rung
  now converts the marginal workers — but the remaining no-move seeds
  split into three shapes, and the rung height is no longer the binding
  constraint on any of them:
  - **Holders monopolize the work (17101, 17103).** 17101's Anjali
    (hunting guide) makes 80 of the village's 86 kills and holds 80
    butcher XP + 20 preserver XP — at cap 3 already, buying nothing.
    The grant pays the worker, and the worker is the holder. 17103 is
    the same shape (Lucia the fishing guide holds 14 preserver XP at
    skill 3; Hassan the Butcher holds butcher 3 with 0 XP). The
    self-taught rung can only fire for non-holders who do the work —
    and the work goes to the holders. Lowering the rung further does
    not touch these seeds.
  - **Thin villages with almost no XP at all (17105: 4, 17106: 4,
    17107: 0, 17109: 7).** 17105/17107/17111 kill nothing (0 hunt
    kills); 17106 kills twice. Their cooks barely work the racks.
    17107 earns ZERO foodXp for the third panel running (r112,
    r113-before, r113-after) — its hunters kill nothing and its cooks
    never preserve. A lower rung cannot convert XP that never accrues.
  - **Death erases the move (1604).** The before-panel's move is gone
    in the after-panel because the XP holders died: aliveEnd 9→6, a
    d28–42 bloodbath (12 "villager combat" deaths, Sarah d29 and
    Daniyar d32 to monsters, Rahul and Juan d41). The death causes are
    the SAME class before and after (24 vs 27 "villager combat"), so
    this is trajectory divergence, not a fix-induced red flag — but the
    ladder count is survivor-filtered by construction (d1→dEnd on
    villagers present in both snapshots), and a move that dies with its
    mover vanishes from the count.
- **The mechanism works, the pace moved, the bar missed by one.**
  foodXp BEFORE 405 → AFTER 393 (slightly LOWER — trajectories
  diverge through real skill effects: 17102's hunts fall 35→9 kills,
  1504's 27→19; better preservation changes duty choices). Grant
  events AFTER: 241 rack resolutions granting preserver XP (r112:
  235), 233 hunt kills all granting butcher XP (r112: 255). The wasted
  shadow shrinks 28 → 23 cells (all now at 1–4 XP, below the rung).
  plus1pool=7, stepped=6 — holders step up too. Skill distribution at
  dEnd: butcher skill-3: 10 villagers, preserver skill-3: 12 — the
  "every cook a master preserver" risk did NOT materialize (12 of ~149
  villagers at preserver 3). Median time-to-first-move: d1–d14 on 10
  seeds, d14–d28 on 6.
- **Guardrails hold:** M3 16/16 alive at day 42, M4 16/16 zero
  starvation deaths.
- **Q2: FIXED** — 0 null THEM lines across the panel (navTurns 3).
- **Practice (continuity):** d1–d14: 82 moved cells, d14–d28: 126,
  d28–dEnd: 71 — 279 total (r112: 275), all attributed, on 16/16,
  16/16, 15/16 seeds. skill0→pos (all windows) = 61 (r112: 59).
  Practice reps at dEnd = 6,282 (r112: 6,076). Same chores shape
  (wood/stone/water/deadfall/cook), plus hunt 5 cells and fish 3 — the
  first hunt practice moves in the establishment window (Caroline hunt
  1→1.2 on 1504, d28–dEnd).
- **Teaching chain still nearly empty:** lesson attempts=3,
  lessons_ok=2 (Daniela taught Nicole on 17110 — the same pair as
  r112), already_holds=20, no-teacher rows=43 (35
  no-teacher-anywhere, 6 teacher-away, 2 teacher-unseeded, 1 words).
  Same shape as r112 (38/3/2). No-teacher-anywhere is still the
  binding constraint.
- **Held/notheld kcal ratio (all huntLog kills, field_dressing held
  vs not):** 135 held kills, 1,065,656 kcal vs 98 not-held,
  294,835 kcal — ratio 3.61. (Method note: r111/r112 quoted a
  same-animal cut; this is the panel-wide split — the next run should
  use one method and say which.)
- **Use-classification:** field_dressing USED (29 holders, 135 uses);
  triage USED (56 holders, 46 uses); diplomat (20), herbal_remedy
  (31), preserve_food (32), wound_care (56) all HELD-UNUSED — the same
  four inert skills as r112. Care: 671 care ticks, 311 tends, 48
  medics seen, 187 healer rounds, 6 treat changes.
- **Cook/racks:** 661 cook-duty calls, 270 rack events, 368
  spec-cooks, 156 holder-cooks, 61 holder-blind, 169 keeps-weeks,
  73 keeps-couple.
- **17102 divergence (r112 watch item):** the r112 pantry −59k did NOT
  recur (pantry 40,007 → 38,753, −1.3k). What moved instead is the
  hunt: 35 → 9 kills, all by Hajime alone. Trajectory divergence
  through skill effects, reported not chased.
- **17107 zero foodXp (r112 watch item):** recurs a third panel. 0
  kills, 26 cook calls, 0 XP. The village hunts and preserves
  nothing — the grants never fire there at all. Documented, not fixed:
  the question is whether the village truly has nothing to hunt/cook,
  or the duties never resolve there.

## Village assessment (plain words)

All 16 villages were alive at day 42, with 6–12 people each. Nobody
starved. Pantries ran from tight (~6,500 kcal, seed 17105) to fat
(~190,000 kcal, seed 17101). Waves 3–4 reached everywhere. Deaths
across the leg ran 23–84 per village as the roster churned, with 6–12
alive at the end.

What they know: villagers are learning to do the work themselves now.
Chen the pharmacist — sick for most of the leg, asking for help with
standing on the same side of the Haven door — becomes the village's
first self-taught preserver on exactly 5 XP. Caroline the dispatcher
learns butchering and preserving both, twice over. Ruth the pharmacist
becomes a master butcher and a master preserver in the same six weeks.
The cooks who work the smoke racks every day get there; the hunters
who kill every day get there. But the villages' best hunters are
already the people who knew how before all this started — Anjali makes
80 of her village's 86 kills and her 80 XP buys her nothing she doesn't
already have, because she's already a master. And three villages kill
nothing at all, so their people learn nothing at all. One village,
1604, loses six people in the last fortnight to the fighting in the
wild, and the learning dies with them.

What's missing: the teaching chain is still nearly empty — 43 times a
hunter needed a teacher and there was nobody in the village who could
teach, and only 2 lessons worked. Four skills sit in villagers' heads
unused — diplomat, herbal remedy, preserve_food, wound care — while
field dressing and triage do real work every day. The villages are
alive, social, and mostly fed — and this panel, the story is that the
ladder finally pays the people who do the work, but the work itself
belongs to the few who already knew how, and the villages that do
nothing learn nothing.

Pops end 10, 10, 9, 6, 10, 10, 9, 9, 9, 10, 9, 9, 8, 12, 11, 8
(seeds 1502–17112). Monster kills per seed (after-panel): 3, 19, 4, 1,
86, 9, 6, 27, 0, 2, 0, 8, 3, 63, 0, 2 (total 233; before-panel 255).
Starvation deaths per seed: 0 on all 16 seeds. **Seed 17101 is the
hunting village:** 86 kills, pantry 190,765, 10 alive — and its
learning is all in one woman's hands. **Seed 17110 is the same shape:**
Mateo 60 of 63 kills, pantry 147,320, 12 alive, nobody lost. **Seed
1604 is the bleeding village:** 6 alive at the end, 43 deaths, the
learning erased by the dying. **Seed 17107 is the silent village:** 0
kills, 0 foodXp, pantry 111,970 — fed and unlearning.

## People check (transcripts read in full — 4 matched seeds; 12 new seeds scanned)

Villagers act like people. All 16 after-panel convo files: 0 null THEM
lines, 0 genuine stalls (4 "no pick" hits are all winding-down clean
endings), 64 held conversations.

- **1502:** Chen is sick and asks for help with a real condition —
  stand on the same side of the Haven door (and he is the one who
  becomes a preserver this panel). Dwayne gossips about Omar eating
  grey meat raw and walking away whistling. Ezequiel grieves Delfina,
  taken, and asks the player to ask the System about the pods — a
  promise that plants a debt. Quinn the bartender worries about being
  alive now instead of being on time, and asks the player to walk her
  trap line.
- **1504:** DeShawn confides he has been lying about his age, then
  teaches Spicebush by the fire. Paloma is down to 0 liters of clean
  water and asks for a dawn haul — and refuses honestly when she is out
  on the road ("find me when I'm back"). Caroline's taken sister is
  Wanda, nineteen, and the pods get into her sleep. Sebastian proposes
  the Emberhold link and it is accepted; then the Gauntlet takes
  DeShawn and brings him back "like nothing happened. It wasn't
  nothing."
- **1603:** Paolo's taken grandfather is Kwame, who "survived two wars
  and a famine. Not interesting enough, apparently." Simran speaks only
  Hindi — the laugh when the player tries her Hindi back, "Good try!
  Again — हाँ, हाँ, बिल्कुल," patient as sunrise. Ella the ESL teacher
  wants "a door I can close. Not to keep people out — to know I could."
  Zoltan counts the stars and names them after people.
- **1604:** Emma the vet — "I can do making do. Not well — well enough
  that nobody's died from it yet." Giulia keeps working because they'd
  tell her to keep working. Tashi speaks only Hindi, and his one
  English is "Fuck you," grinned proudly. Mara the army medic regrets
  the ordinary mornings she rushed through in San Diego and would pay
  anything for one annoyed morning now.
- **12 new seeds (scanned):** openings are all real wants — wounds
  ("About this wound — still need hands"), water ("We're down to 0
  liters"), taken kin ("Have you heard anything? About the taken"),
  food, sickness, forage invitations. One language-barrier villager per
  several seeds (Hulya Turkish, Ayelech Amharic, Vasyl Ukrainian).
  Template openers recur across seeds ("Never mind the sickness I'm
  fighting — we got it handled" on 17101/17103/17107; "Before the
  scattering, I froze when it mattered" on 17103/17109) — the known
  pool behavior, same as r112's taken-kin recurrence: the system
  working as designed, not a new defect.
- **Driver quirk (third sighting, not a content defect):** the driver
  picks once AFTER the goodbye is spoken — 1504 DeShawn ("Gotta run.
  Literally. Bye!" → [joke] → laugh), 1603 Paolo ("I should get back
  to it" → [agree] → "Yes! Exactly!"). Same class as r112's Paolo.
  The engine ends the conversation right after; the content is fine.

## Blank filled / documented

- **Filled:** the r112 blank — the pace question is ANSWERED, not just
  measured: the 5-XP rung converts the marginal workers (7 seeds, 12
  moves, up from 6/8) and the "every cook a master" risk does not
  materialize (12 preserver-3 of ~149). The NO-GO is a real verdict on
  the bar, and the diagnosis names the next binding constraint: work
  concentration (holders monopolize the kills and the racks) and thin
  villages with no XP at all — not the rung height.
- **Documented, not fixed:** the teaching chain is nearly empty
  (no-teacher-anywhere dominates, 35/43); four held-unused skills;
  seed 17107 zero foodXp (third panel); seed 1604's survivor-filtered
  ladder count; seed 17102's hunt collapse (35→9 kills); the
  driver-pick-after-goodbye quirk (third sighting). Wanda-beat /
  teach-restate repeats stay Loop B-owned. Menu:more standing check
  stays "0 null THEM lines".

## Reachable / fun / winnable

- **Reachable: yes.** The ladder is reached through ordinary village
  work (cooking, hunting) — no special action needed; it fires on 13
  of 16 seeds (foodXp accrues), and converts on 7.
- **Fun: yes, in the establishment sense.** The villages read as
  alive — grief for the taken, gossip about raw grey meat, party
  invitations, language barriers played straight, a pharmacist who
  learns preserving while sick. The learning itself is visible: a cook
  who works the racks daily becomes a preserver, a hunter who kills
  daily becomes a butcher.
- **Winnable: no movement claimed.** This leg is establishment (days
  14–40); the win chain lives in later legs. The ladder feeds the
  winnability chain (roles forming from lived experience) but 7/16 is
  below bar; the next step is a different dial (see Metric review),
  not a win claim.

## Metric review (for the NEXT run)

- **The rung is not the binding constraint anymore.** 7/16 with the
  5-XP rung, and the no-move seeds are holder-monopoly (17101, 17103),
  no-XP-at-all (17105, 17106, 17107, 17109), or death-erased (1604).
  Dropping the rung to 3 XP would convert a few thin cells (17109's 3
  wasted cells at 1–4 XP) but touches none of the three shapes. The
  next dial is the one r112 named second: **+1 XP per batch preserved
  instead of per resolution** — it accelerates the cook side, where
  the work is daily and spread across whoever cooks. The hunt side
  needs a different answer (the work concentrates in one holder per
  village by design of the hunt assignments) — that is a policy
  question, not a rung question.
- **The ladder count is survivor-filtered.** Moves are counted d1→dEnd
  on villagers present in both snapshots; a move that dies with its
  mover vanishes (1604). The next run should report moves by window
  (d1→d14, d14→d28, d28→dEnd) alongside the d1→dEnd count, so a
  mid-leg move that dies still counts.
- **firstMove fires on foodXp moves too** (skill_moves counts foodXp
  0→positive as a move). Every seed shows a first-move window even
  with spec0pos=0. The next run should split the first-move window
  into specialist-move vs foodXp-only, or the line misleads.
- **Held/notheld kcal ratio needs one method.** This run quotes the
  panel-wide split (3.61); r111/r112 quoted a same-animal cut. Pick
  one and say which.
- **Words rung:** attempts 3, ok 2, already-holds 20, no-teacher 43
  (35 anywhere / 6 away / 2 unseeded / 1 words). Report as a standing
  line.
- **Menu:more** standing check stays "0 null THEM lines" (FIXED this
  run; keep watching).
- **Seed 17107 zero foodXp** is now a three-panel pattern — the next
  run should check whether its hunters ever get assigned and its
  racks ever fire, or whether the village truly has nothing to
  hunt/cook.
- **Wanda-beat / teach-restate repeats** stay Loop B-owned.

## Regression + telemetry

- Proof tests (this run): r113 ladder proof 49/49 after the fix;
  43/49 before (exactly the expected before-FAILs). Det-gate PASS
  (r113 driver 5d seed 1502 reproduces the r112-driver-on-master
  funnel keys at day 6). Event proofs (rack/hunt grants) PASS
  unchanged — the grant sites are untouched by this fix. Menu:more
  proofs PASS.
- **check.js --quick ran once on the branch tip (worktree AGENTS.md
  requires it before push; the ship loop runs the full check before
  pushing).** 282 passed, 8 failed in 1089s — vs r112/r117's 284/6.
  The 2 extra failures are BOTH proven load artifacts, re-run alone
  on the same branch tip and green: test-measurement-cache-flags.js
  (4/4 alone; failed 3 assertions in the loaded parallel run) and
  test-trust-observer-neutrality.js (6/6 alone; TIMEOUT-killed at
  120s in the parallel run after passing its first 3 assertions).
  The box was heavily loaded (total 1089s vs r112's 612–655s, load
  average ~9.5). The remaining 6 failures are exactly r112/r117's
  known pre-existing set: test-measurement-proof-update.js,
  test-measurement-workflow.js (retained neutrality proof),
  test-mobile-combat-cadence.js (Continue round-wrap),
  test-occupation-panels.js (real CLI workflow),
  test-phone-frame-proof.js (retained browser inputs vs current
  source), test-establishment-r20-fixes-20261020.js (racks-full voice
  gate). None touches the ladder, the practice instrument, the
  analyzer, or any file this branch changed — the branch introduces
  zero src/js changes beyond the one-line threshold and no new
  failure. Full output: `/tmp/r113-check-quick.log` (kept on this VM;
  the ship loop re-runs the full check before pushing). Isolated
  re-run logs: `/tmp/r113-cacheflags-alone.log`,
  `/tmp/r113-trust-alone.log`.
- **Telemetry deviation check:** ran `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/establishment.json --current
  'evidence/2026-11-07/journey-establishment-r113-after-seed*.json'
  --metrics systemDay,monsterKills`. Quiet: 16 files, 2 metrics, no
  large deviations. Baseline NOT rolled (no LOUD line).

## Next run (no r114 driver prepared)

Rotation advances to 2 (deepening) — the next three Lane A runs are
other legs, so no establishment r114 driver is prepared here. The next
establishment run prepares its own driver from the r113 driver and
re-verifies its seed band fresh across all dated preregs (same 16
seeds are the matched panel; contaminated bands stay excluded: 897–906,
1301–1304, 917–926, 1001–1010, 1101–1110, 1201–1210, 2001–2010,
3001–3010, 1033–1042, 1043–1052, 1053–1062, 1063–1072, 1073–1082,
1083–1092).
Carried to the next establishment run: the practice snapshot is a
standing instrument (report d1→d14 and d1→d28 side by side, PLUS the
rep totals — reps-below-rung vs reps-zero are different stories); the
r113 analyzer is the standing instrument (report moves by window as
well as d1→dEnd; split first-move into specialist vs foodXp-only); the
invariant test is the standing after-proof; M-PR1 per-seed (≥3-turn
rule) + adjudication and M-PR2 revised are the standing lines for the
landing leg (not this leg); the skill0->pos count splits into foodXp
vs specialistSkill; the next dial is the per-batch grant (+1 XP per
batch preserved) — the rung question is settled; the hunt-side
concentration (one holder does all the killing) is a policy question;
seed 17107's zero-foodXp pattern needs an assignment/rack-fire check;
the driver-pick-after-goodbye quirk is a third sighting — fix the
driver to stop picking after the goodbye line, or document it as
accepted.

## Closeout note

- **Registration took ~6 min (slow checkout).**
- **Rebase:** master moved during the run (a7a26a1ff → 2bc17d793:
  alien expansion + sim-pairoverlap-b ×4). `git fetch origin master`
  first: origin sits at 0ce76898f — local master is AHEAD of origin
  (merge-base is origin itself; no divergence). The src/js/ delta is
  ONLY alienPlayers.js (+233/−8) — no overlap with this run's food.js
  change. Rebased the branch onto the explicit SHA 2bc17d793. Clean,
  all five picks applied, no sequencer stop. Branch tip is now
  7d23eac1f on 2bc17d793. `git log master..HEAD` shows exactly five
  commits. No conflicts, no force, nothing dropped.
- **Proof re-run on the rebased tip (all PASS):** r113 ladder proof
  49/49 (log `/tmp/r113-proof-rebased.log`); the fix is intact at
  food.js:1252 (threshold 5).
- **check.js --quick on the branch tip:** 282 passed, 8 failed in
  1089s — the 2 extra failures vs r112/r117's 284/6 are proven load
  artifacts (both pass alone on the same tip: cache-flags 4/4,
  trust-observer-neutrality 6/6); the other 6 are the known
  pre-existing set. Zero new failures from this branch.
- **Telemetry:** quiet, baseline NOT rolled.
- **Index clobber struck on ALL FIVE safe-commit.sh commits** (known
  class — this run: prereg, before-evidence, fix, after-evidence,
  run note). Repaired via HEAD-blob `ls-tree` + `update-index --add
  --index-info`; verified status clean + diff HEAD empty + blobs match
  after each repair.
- **Registry-lock queue (twice):** heartbeats queued ~6–17 min behind
  a sibling's slow registration; the reaper queued behind the same
  lock, so no reap could fire. No intervention taken.
- **Rotation re-verified at closeout: reads `2`.**
- Lock (`2026-11-07T23:52:56Z`, created 23:52Z) and heartbeat loop are
  removed at closeout after the merge, once run_id is read back; see
  `~/memory/2026-11-07.md` for the closeout record.
