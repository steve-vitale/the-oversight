# sim-reseedbeat-b — the #2632 launch beat: the expired-plan re-seed speaks when the hunter goes back out

**Built, proved, and observed in live play. No verdict on the combined
fix — this arm does not land it and does not re-judge any frozen bar.**
The expired-plan re-seed used to speak only at commit ("has no trail
— but the fire remembers ... was seen, and the hunt turns that way"),
a line the corpus recorder dropped (no SAY_RE token) and a line that
could be spent on a day the launch then failed. Now the commit stamps
the re-seed and the fire speaks exactly at the launch, on both
departure paths: "Amina is hunting Loud-Eyes now — the fire found a
new trail." The staged proof is 30/30 including the old-code control
(the same fixture launches silently on the pre-change code); the live
observation band (8 fresh armed seeds, 150d) caught one expiry and
its launch beat in the wild — Amina on 106705, expiry d37, beat d53.
The analyzer missed that expiry (its rule excludes expiry commits
whose companion is already out — a new row shape, filed below), so
its pooled verdict on this band is NO-GO INSTRUMENT; that is an
instrument finding, not a lever verdict, and this band judges nothing.

## 1. What was built

The beat moved from commit to launch (src/js/win-plan.js,
src/js/villager-brain.js; commit `3815f2076`):

- `winPlanCommitDeadTarget`, expired-plan branch: no longer speaks.
  It stamps `plan.reseedLaunchBeat = fresh2.id` (the new target id)
  and returns `'reseeded'` as before. The dead-target branch still
  speaks at commit ("The hunt turns to ... instead") — untouched.
  If the re-seeded target itself dies before the launch, the next
  commit clears the stamp, so the beat can never speak for a target
  the hunter never goes out after.
- New `reseedLaunchBeat(self, vid, newType)`, same voice as the
  expiry beat (holder + new type as the village knows them, SYSTEM
  wrap after arrival, deterministic, no randomness): "`<holder>` is
  hunting `<target>` now — the fire found a new trail."
- New `winPlanReseedLaunchBeat(vid)`: speaks the stamp only at a
  real launch and only while the plan still carries the stamped
  target; clears the stamp BEFORE speaking (no double-fire), reads
  the plan without creating it, flag-gated. Called from
  `winPlanDepart`'s `launchParty` (after `partyDepartures`, before
  `return true`) and from `vbrainExecuteDepart`'s party_launch
  branch (before `return 'launch'`) — the brain path is the one
  that fires in sims.
- The old commit-time expired-plan line ("has no trail ...") is
  gone: no double-speak on the common same-tick case, where the
  commit and the launch are one departure.
- `scripts/reseedexpiry-driver-b.js` SAY_RE gained `"new trail"` —
  the beat carries no older token, and the recorder must hear the
  line this arm observes. The token matches nothing else the game
  says, so no other transcript row is newly captured.

Two existing proof tests changed on purpose (the design moved the
beat): `test-reseedexpiry-b.js` A10b now asserts the commit stamps
instead of speaking, and `test-reseed-b.js` §C2 now asserts the
commit is silent and the launch speaks once. Both suites are green
below.

## 2. The staged proof — old vs new

`scripts/test-reseedbeat-b.js` **30/30**. The fixture is the Amina
shape from seed 106603 d28–d31 (expired Spool plan, Buffering rumor
from the fire, companion Diana — the veteran who killed the Spool
on camera d27). Gear is the measured shape from the dawnbid rows on
both observed launches: holder armed + armored (spear + armor),
companion likewise, party of 2 — the gear and party a player
actually has at a wave-3 hunt, never a fresh un-geared solo
scholar. The fixture drives the REAL `winPlanDepart` and the REAL
`vbrainExecuteDepart` (stubbed dawn commit).

| Section | What it proves | Result |
|---|---|---|
| §A code pins (12) | beat wording, stamp-before-speak, flag gate, both launch hooks, SAY_RE token, no double-speak line left | pass |
| §B1 winPlanDepart | expired plan + rumor → launch, stage hunt, target buffering, exactly one line: "Amina is hunting Buffering now — the fire found a new trail."; stamp cleared; no commit-time line | pass |
| §B2 split day | commit re-seeds but the companion is away → hold, silent, stamp set; the later launch speaks exactly once | pass |
| §B3 brain path | same fixture through `vbrainExecuteDepart` → launch + one line, stamp cleared | pass |
| §B4 SYSTEM prefix | after arrival the line wraps as `📺 SYSTEM: "..."` like its siblings | pass |
| §C old-code control | the same fixture against the pre-change win-plan.js (`git show HEAD`) launches with NO launch-beat line, but DOES speak the old commit line — fail on old, pass on new | pass |
| §D negatives (5) | dead-target re-seed: commit beat only, no stamp, no launch beat; no rumor: hold, silent; second launch: no second beat; flag off: inert; re-seeded target dies pre-launch: stale stamp cleared, commit beat only | pass |

Regression suites on the rebased tip (`6ec74e210`, master
`f9ed3a851` — the task's named tip; origin/master is older, so the
local tip is current): `test-reseed-b.js` **97/97** (96 + 1 new
launch check), `test-reseedexpiry-b.js` **58/58**,
`test-reseedwide-b.js` **28/28**, analyzer selftest **57/57**.

## 3. Live observation — one 8-seed armed band, 150d

Band 106701–106708 (fresh — zero hits across preregs, findings,
tracker, corpus dir names), armed only, no control leg: this band
observes the beat; it does not re-judge any frozen bar. Substrate
SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1,
policy `1884c8852d38`, anchor `3815f2076` on all 8 files, 0
instrument errors. Corpora:
`evidence/2026-11-20/perseed-reseedbeat-b-106701-armed/`; analyzer
output `evidence/2026-11-21/reseedbeat-b-106701-analysis.json`.

**The expiry and the beat, in the wild — seed 106705, Amina:**

- d26 Amina fled a spool in the wild; d28 `gen_2b3r5r7` killed a
  spool (the last known one).
- d37, dawn commit: her Spool plan expired — pool 0, no rumor.
  The fire spoke the expiry beat (recorded):
  > `📺 SYSTEM: "Amina was ready to hunt Loud-Eyes — but the fire says that kind is already put down, and no one has seen another trail. The hunt is called off."`
  ("Loud-Eyes" is the village's knowledge-gated name for spool on
  this seed.) Two post-expiry holds the same day; then silence —
  she did not go out again for sixteen days.
- d40: `gen_2b3r5r7` evaded a spool on expedition — a live sighting
  after the kill day, so the type re-opened under the liveness rule.
- d53: the rumor pool offered spool again (firstPick spool) and
  Amina launched on it through the brain path. The launch beat
  fired exactly at the launch (recorded):
  > `📺 SYSTEM: "Amina is hunting Loud-Eyes now — the fire found a new trail."`
- 16 days expiry → launch. She had no encounter rows at all in
  the window — she did not fight again within 14 days by any
  route; her first post-expiry outing was the d53 launch.

Band counts (analyzer JSON + direct corpus reads): 1 expiry;
re-seeds 5 (106702: 3, 106705: 1, 106707: 1); dead-target launches
0 of 16; dead commits 5; pool floor min 0, median 1, distribution
{0: 1, 1: 3, 10: 1}; post-expiry targetless launches 0;
post-expiry holds 2 (both d37). The analyzer's own numbers say
expiries 0 / reseededWithin7 0 / foughtAgain14 0 — that is the
analyzer missing the expiry (see §4), not the game: the true
counts are 1 expiry, re-seeded in 16d, first outing 16d.

## 4. Instrument finding — the analyzer missed this expiry

The analyzer's pooled verdict on this band is NO-GO INSTRUMENT
(`expiryRuleMismatch` 1: `planExpiries` 1 vs detected expiries 0).
The cause is a row shape its `expiriesOf` rule excludes: on the
d37 expiry commit, the dawn companion `gen_2b3r5r7` (the
spool-killer) was already out on an expedition, so the row carries
`companionExped: true` — and the rule requires `companionExped ===
false`. The commit check ran, dissolved the plan, and spoke the
expiry beat; the companion's expedition state is irrelevant to
whether the holder's plan expired. All four prior expiries had the
companion at home, so the rule never saw this shape. The
cross-check did its job — it caught the undercount instead of
silently reporting 0 expiries. The dead-commit survey DID see the
commit (pool 0, result normal), so the survey denominator is
right; only the expiry counter misses. Next arm on this question:
relax `expiriesOf` path (a) to count an expiry when the snapshot
shows a dead target + pool 0 + result normal, regardless of
`companionExped` (and re-run the analyzer selftest with a
companion-out expiry fixture). Filed as a new open finding for the
coordinator; it does not touch the beat, which the corpus proves
fired.

## 5. Wall numbers (observation band, armed only)

| | 106701–106708 armed |
|---|---|
| wins | 0 |
| national | 0 |
| table | not observed (all 8 regional) |
| wave 5 unlocked | 4/8 |
| wave 4 unlocked | 8/8 |
| standing ≥ 200 | 4 |
| standing 199 | 3/8 |
| survived 150d | 6/8 |
| median survival (gameDays) | 150.5d |
| starvation deaths | 1 of 620 (combat 102, expedition 177, villager combat 257 dominate) |

No control leg, so no guardrail judgment — this band observes the
beat, nothing else. The wall is unchanged in shape: no wins, no
national, the 199 stall on 3/8 seeds.

## 6. Metric review

- **The observation band is not a verdict, and the analyzer's
  NO-GO INSTRUMENT is not one either.** The band was run to watch
  the beat, not to judge frozen bars; the analyzer's verdict
  reflects its own expiry counter missing a real expiry (§4).
  Neither number goes into any frozen pool as a judgment. The
  beat's proof is the staged 30/30 plus the one live firing.
- **The beat fired exactly once, at the launch, on the brain
  path.** The d53 launch is the departure the sims actually use,
  and the line is in the corpus because SAY_RE now carries the
  token — the recorder fix and the game fix landed together, and
  either alone would have left the launch invisible.
- **The 16-day re-seed is the rumor supply again, not the
  mechanism.** Amina's pool was empty for sixteen days; the day a
  spool was seen alive again (d40) the trail existed, and she went
  out thirteen days later on the next party_launch commit. The
  supply's timing is what the 7-day bar measures — see §7.
- **The reseedwide driver still drops the line.** Only the
  reseedexpiry driver (the one this arm used) gained `"new
  trail"` in SAY_RE. A future wide band that wants to observe the
  beat must carry the token into `reseedwide-driver-b.js` too, or
  it will read silence where the game spoke.
- **The analyzer's `survived` count is horizon-stale at 150d in
  the same way the reseedwide arm noted at 180d** (it counts days
  ≥ 150; a village lost d151 would count as survived). The
  guardrail-free observation band is unaffected, but the next 150d
  judged arm should keep judging survival on endReason, as the
  reseedwide arm did.

## 7. Re-derived 7-day bar — proposal for the NEXT prereg

Frozen pooled data (reseedexpiry + reseedwide, 32 armed seeds):
4 expiries; re-seed days 14, 6, 3, 8 — within 7d 2/4; fought
again within 14d (launch-based) 4/4; post-expiry targetless 0.
This band adds one expiry, reported as context and NOT part of
the frozen pools: re-seeded in 16d; first outing 16d; no
encounter in the window. Extended pool: 5 expiries / 40 armed
seeds; within 7d 2/5; fought again within 14d (launch-based)
4/5; post-expiry targetless 0/5.

**Proposed revised bars for the next prereg (a design decision
for the coordinator, not a re-score of any frozen verdict):**

1. **Primary — re-seed within 14 days, ≥ 2/3, with the n ≥ 3
   floor (minExpiries 3) kept.** On the frozen pool 4/4; on the
   extended pool 4/5 = 0.800. The 14-day window measures the
   mechanism's follow-through (does the holder come back?) while
   the 7-day window measured the rumor supply's restock speed
   (2/5 — the supply gives a fast rumor about half the time and a
   slow one the rest). Keep the 7-day share as a reported
   secondary, not the judge.
2. **"Fought again" split in two.** Keep the launch-based
   re-engagement share (4/5) as a reported secondary. Do NOT
   promote the encounter-based bar (a fought encounter row,
   rounds > 0, within 14d) to a GO bar: on the extended pool it
   is 0/5 — no holder in five had a blow-by-blow fight with the
   re-seeded target within 14d (Emmett met his and fled d45; the
   rest fled, evaded, or met nothing). That bar measures the
   fight funnel, not the re-seed, and no re-seed lever can pass
   it. Report it as a diagnostic.
3. **Analyzer fix first.** The next judged arm on this question
   needs the `expiriesOf` companion-out fix (§4) in its prereg,
   or its expiry denominator will undercount exactly when a
   holder's companion is away — the common case, since the
   companion is often the killer.

## 8. SENSE-TEST — does the beat read like the fire speaking?

The two beats as the player hears them, sixteen days apart:

> d37: "Amina was ready to hunt Loud-Eyes — but the fire says that kind is already put down, and no one has seen another trail. The hunt is called off."
>
> d53: "Amina is hunting Loud-Eyes now — the fire found a new trail."

It reads like the fire speaking — same cadence, same "the fire
says / the fire found" voice, holder named, the new trail named
as the village knows it. The line lands at the right moment: the
player was told the hunt was called off, and is now told the
hunter is out again, without being told twice (the old commit
line is gone, so d53 carries exactly one line). Two honest
readings, stated plainly:

- **The repeated name is true but unexplained.** "Loud-Eyes"
  is both the kind that was put down and the kind now hunted —
  because a spool was seen alive again on d40, the kind came
  back. The line says the trail is new, which is true, but it
  never says the kind was seen again — a player who remembers
  the d37 call-off could read the d53 line as a contradiction
  ("you said it was put down"). The mechanism is correct; the
  wording leaves the re-sighting implicit. A future wording pass
  could carry it ("...the fire found a new trail — Loud-Eyes was
  seen again"), but that is a voice tweak for the next arm, not a
  defect in this one.
- **The sixteen days of silence are honest.** Between d37 and
  d53 Amina held at Haven with no trail and no beat — the hold
  is silent by design (she was already told), and the game does
  not pretend she was doing something. The silence is the
  correct narration of waiting for a rumor.

## 9. Blanks and next step

- **Finding #2632 — the beat is built and observed, not landed.**
  The combined fix (reseed + expiry + beat) is re-judged by the
  NEXT run under the re-derived bar (§7). This arm does not land
  it, does not merge, and does not re-judge the frozen NO-GO
  (expiry half) or GO (combined) verdicts.
- **New instrument finding filed** (analyzer `expiriesOf`
  companion-out blind spot, §4) — the next arm on this question
  fixes the counter before judging.
- **Branch:** `sim-reseedexpiry-b`, build commit `3815f2076`
  (rebased onto master `f9ed3a851`, clean 9/9, new tip
  `6ec74e210` before the build), evidence commit `770b01212`,
  corpora commit `befe2af92`, test-pin commit `e9edc1cd8`
  (branch tip). HELD unmerged, as instructed.
- **No check.js --quick on this branch:** sibling gates were
  running at closeout; the discipline forbids a third concurrent
  run. The arm's own gates (proof 30/30, reseed 97/97,
  reseedexpiry 58/58, reseedwide 28/28, analyzer selftest 57/57,
  live band 8/8 files, 0 instrument errors) all pass, and the
  src/js change is two small hooks plus one beat function.
- **Safe-commit index clobber (once this run):** after the build
  commit, the worktree's main index showed the committed files
  as staged-as-deleted (the known clobber class). The commit was
  verified correct by hash (`3815f2076`, 6 files) and the index
  repaired with `git ls-tree -r HEAD -- <paths> | git
  update-index --add --index-info`; verified `git status
  --short` empty + `git diff HEAD` empty.
