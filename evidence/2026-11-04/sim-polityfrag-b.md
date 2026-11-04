# Polity-fragility season test — Loop B, arm sim-polityfrag-b

Axis: scale-onramp / winnability chain. DIAG-ONLY arm: scripts +
instruments + evidence, ZERO src/js changes, ZERO policy edits.
This arm is the second next blank from Loop B run 0730Z
(coordinator evidence evidence/2026-11-04/
sim-winnability-round-0730.md; the diplo pilot it landed is
the sim-diplo-b work, evidence/2026-11-04/sim-diplo-b.md).
Gates, win prices, and deed gates stay UNTOUCHED: this arm
measures, it does not retune any door. A diagnosis names the
next lever; it does not turn it.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-polityfrag-b-prereg.md`
(commit fbb4179d07). In short:

- Question: over a full season beyond the diplo pilot's
  drops (102 → 0 the day one of three seasoned links
  drops), does diplomacy HOLD, FLICKER, or COLLAPSE — and
  after a drop, does the polity RECOVER (re-season?
  re-link?) or stay at 0? Does a drop kill wave-5 unlock
  prospects?
- Policy: `scripts/policies/leadcourt.js` `{leadcourt}`
  VERBATIM, default env. No new policy file, no policy edit.
- Seeds: 99401–99404 EXTENDED (identical seeds to the
  diplo context leg c1, same policy, longer horizon) PLUS
  fresh seeds 99409–99412 (freshness checked: no evidence
  .md, policy file, or per-seed filename uses them).
- Horizon: 300 days, death-aware. WHY 300: the observed
  drops sit at d89/d117 in 140d runs; 300d gives >= 180d
  of post-first-drop observation on survivors — six
  30-day re-seasoning windows, several pantry-recovery
  cycles, and room for a broken link to be re-proposed —
  while the death-aware stop bounds cost. "Full season"
  here means this 300d window (ten 30-day seasons), NOT
  one 30-day season: one season cannot contain both a
  drop and a recovery verdict.
- Instrument: the diplo instrument
  (scripts/diplo-instrument-20261104.js) REUSED verbatim
  via a new driver (scripts/test-polityfrag-driver-
  20261104.js, output evidence/2026-11-04/
  perseed-polityfrag-b/, RUN=polityfrag); analyzer
  scripts/test-polityfrag-analyze-20261104.js (pure
  functions: diplomacy series, drop/recovery events from
  funnel diffs, per-link trust trajectories, last-tend
  days, re-proposals, hold-share). The snapshot NEVER
  calls villageStandingTotal() or unlockedWave(); ONE
  end-of-run unlockedWave() call is reported separately
  and never counted as a natural door-open.
- PRIMARY METRIC + GO BAR: per-seed polity trajectory
  (first-diplomacy day, diplo>0 days, HOLD-SHARE =
  diplo>0 days / post-first-diplomacy snapshots, drop
  events with cause, recovery events, re-proposals).
  DIAG-GO iff trajectory + drop-cause + recovery-outcome
  FULLY CLASSIFIED on at least 6 of 8 pilot seeds,
  including at least 3 seeds that ever reached
  diplomacy > 0. Otherwise DIAG-NO-CANDIDATE.
  INSUFFICIENT-DATA only if > 2 seeds carry instrument
  errors or zero otherVillages at day 1.
- BALANCED PANEL (§15): INAPPLICABLE — pure diagnostic,
  no before/after change; the extended legs are a
  reproduction check against the diplo corpus, not a
  comparison of two game versions, and no panel
  comparison is fabricated or attached. Stated
  explicitly, not omitted silently.
- HARD LIMITS (binding, honored): no gate/price/deed
  change; no wild-router, field-fight, national-standing,
  or veteran-counting code; no food-economy code; no
  propose/tend verb added to or removed from any policy;
  no file owned by the sibling leadbelong arm touched.
  DIAG ONLY.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. docs/SCALE.md read:
  the scale ladder canon — 1 season = 30 days (Steve
  2026-10-11); a polity is one primary with >= 3 SEASONED
  subordinates; seasoned = 30+ days old AND trust 40+
  (links form at trust 30 — tending required); national
  cannot stage until Haven has been regional for a full
  season. No canon doc covers the diplomacy pipeline's
  day-to-day trust mechanics (tribute shortfalls, trust
  decay, re-seasoning) in the same detail — stated in
  the prereg instead of inventing canon; the trust
  mechanics below are read from src/js/hierarchy.js
  headers and linkTick code, not from a canon doc.
- Trust mechanics, as found in code (current anchor, not
  taken on faith): weekly linkTick for Haven-primary
  links — full tribute +1 trust, partial tribute -1 with
  the true shortfall riding as arrears, nothing at all -2
  with full arrears; tending (leadcourt policy verb, NOT
  engine) +8, weekly, gated in the POLICY on pantry >
  20,000 kcal. Speaker deaths cost a link -8 (succession
  haircut) with a 7-day mourning window in which gains
  are choked. The neglect snap kills only trust < 20
  with no upkeep for 14+ days — tending counts as upkeep.
  scaleRank() reads live flags only: globalLive →
  'global', nationalLive → 'national', networkLive →
  'regional', else 'village'.

## Anchor

Anchor: 71786e9acf08 (instruments commit; the anchorCommit
field on all 8 per-seed JSONs). The diplo anchor was
c400ae3e0cc1 — see the reproduction check below. No
other arm's numbers are pooled with this arm's numbers.

## Reproduction check (not judged): 0 mismatches

For extended seeds 99401–99404, the first-140d daily
diplomacy + link-funnel (seasoned/regional+/active/total)
series match the diplo-ctx-lead JSONs EXACTLY (95, 138,
116, 75 snapshots compared, 0 mismatches), despite the
anchor move. Death days reproduce exactly (98, 118, 76);
99402, censored at 140 in the diplo run, continues and
dies d143 — consistent continuation, not divergence.
Cross-arm comparison to the diplo corpus is therefore
safe on these seeds; the anchor move produced no
observable trajectory change.

## Pilot leg — per-seed table

Proof `scripts/test-polityfrag-20261104.js` 32/32 before
the leg (fixture tests + live harness smoke; see metric
review for the one analyzer correction made during proof
— the drop last-tend fix, committed before the leg's
analysis, not during it). 0 instrument errors on all 8
pilot seeds. Columns: days, end, scale (end-state
scaleRank), maxW, firstDiplo, diploDays, holdShare,
drops/recoveries, trajectory, wave-5 faced, ready days.

| seed | days | end | scale | maxW | firstDiplo | diploDays | holdShare | drops | recov | trajectory | w5 | ready |
|------|------|-----|-------|------|------------|-----------|-----------|-------|-------|------------|----|-------|
| 99401 | 98 | lost | regional | 4 | — | 0 | — | 0 | 0 | never (polity-shape) | no | 0 |
| 99402 | 143 | lost | regional | 5 | 60 | 29 | 0.345 | 1 | 0 | collapses | yes | 27 |
| 99403 | 118 | lost | regional | 4 | 57 | 60 | 0.968 | 1 | 0 | collapses | no | 0 |
| 99404 | 76 | lost | regional | 4 | — | 0 | — | 0 | 0 | never (never-3-seasoned) | no | 0 |
| 99409 | 111 | lost | global | 4 | 57 | 56 | 1.000 | 0 | 0 | holds-to-death | no | 0 |
| 99410 | 107 | lost | global | 4 | 57 | 51 | 1.000 | 0 | 0 | holds-to-death | no | 0 |
| 99411 | 146 | lost | regional | 4 | 58 | 78 | 0.867 | 1 | 0 | collapses | no | 0 |
| 99412 | 64 | lost | village | 4 | — | 0 | — | 0 | 0 | never (died-before-seasoning) | no | 0 |

Pooled, diplomacy seeds only (5 seeds): 274 diplo>0 days
of 343 post-first-diplomacy snapshots (hold-share 0.799);
3 drops, 0 recoveries, 0 flickers. Judge: classified 8/8
(>= 6 required) with 5 diplomacy seeds classified (>= 3
required) → DIAG-GO. No seed survived to the 300d horizon
(max 146d) — the horizon never bound; every trajectory
ends in village death, which is itself a finding about
how much season a polity ever gets to prove itself in.

## Finding 1 — diplomacy HOLDS or COLLAPSES; it never flickers

Across 5 diplomacy seeds there are exactly two shapes
and no third:

- HOLDS (2/5): 99409 and 99410 hold diplomacy 102 from
  first-diplomacy day (d57) to village death (d111/d107)
  with hold-share 1.000 — not a single zero day. Both end
  at scaleRank global with diplomacy 102 still paying.
- COLLAPSES (3/5): 99402 (hold-share 0.345, 29/84),
  99403 (0.968, 60/62), 99411 (0.867, 78/90). Each has
  exactly ONE drop event and ZERO recoveries. No seed
  anywhere in the pilot returns to diplomacy > 0 after
  reaching 0 — the flicker shape (drop → recovery → drop)
  does not occur even once.

The hold-share spread is the story, not the average:
99403's 0.968 looks like a hold until you see it died
one day after its drop — a collapse with no window, not
a hold. 99402's 0.345 is the only long post-drop life
(54 days), and it spent all 54 at diplomacy 0.

## Finding 2 — every drop is a trust-unseason of the weakest link, after a pantry-gated tending gap

All three drops name the same cause class (funnel diff,
never a say-line inference): a seasoned link's trust
falls below 40 while its siblings hold, so the seasoned
count drops below 3 and regional+ (hence diplomacy)
goes to zero in the same snapshot. In every case the
dropped link is the LOWEST-trust seasoned link, and in
every case tending had stopped weeks earlier because
the pantry sat below leadcourt's 20,000-kcal tend gate:

| seed | drop day | dropped link(s) | trust before → at drop | last pre-drop tend | gap | pantry at drop |
|------|----------|-----------------|------------------------|--------------------|-----|----------------|
| 99402 | 89 | village_2 | 43 → 38 | d49 | 40d | 10,073 |
| 99403 | 117 | village_0 + village_2 | 43 → 30, 44 → 36 | d35 | 82d | 520 |
| 99411 | 136 | village_3 | 46 → 38 | d64 | 72d | 1,147 |

No drop is a break: all dropped links stay ACTIVE (status
never leaves 'active' on any collapsing seed). No drop
is a polity-shape change: the links still span one
polity; only the trust bar fails. The decay itself is
slow — weekly shortfall charges of -1/-2 against a
starving subordinate's tribute, plus -8 succession
haircuts when speakers die — which is why the gaps run
40–82 days before the bar is crossed. The tending gate
is the mechanism: leadcourt tends weekly while the
pantry allows (99409: every week d28–d72; 99410: 14
tends per link through d72), and the moment the pantry
crashes below 20,000 and stays there, the clock starts.
Holding seeds are not luckier in kind — they tended
without a gap until d72 and carried trust buffers of
54–93 into their final pantry crash, so they died
before any link crossed 40. Collapsing seeds either
never built the buffer (99403: last tends d35, trusts
in the 50s at season, then 82 days of bleed) or had
one structurally weaker link (99402's village_2: trust
54 at season against siblings' 71/83, and the only
link to fall).

## Finding 3 — after a drop, NOTHING recovers: two distinct no-recovery modes

0 recoveries in 3 collapses, and the three cases split
into two modes that a next arm must not conflate:

- MODE A — tending never resumes (99403, 99411):
  99403's village dies d118, one day after its d117
  drop — there is no recovery window at all. 99411
  lives 10 more days (drop d136, death d146) but its
  pantry never climbs back above the 20,000 tend gate
  (d136: 1,147; d143: 0), so no tend is ever attempted
  after d64. Recovery is impossible, not failed.
- MODE B — tending resumes and still fails (99402, the
  decisive case): the pantry recovers (d110: 24,750),
  leadcourt tends again (d97, d110, d111), INCLUDING
  the dropped link (tends d110, d111 on village_2's
  link) — yet that link's trust keeps FALLING (21 →
  16 → 8 → 0 by d135). Weekly +8 tends cannot outrun
  the weekly bleed on a starving subordinate's link
  (shortfall charges plus succession haircuts, with
  mourning-choked gains in death weeks). Resumed
  tending is real, recorded, and insufficient.

And the structural trap underneath both modes: leadcourt
never re-proposes while 3 links stay active — and a
trust-0 link still counts as active. 99402's dropped
link sits at trust 0 from d135 to village death d143,
still 'active', still blocking any replacement proposal
(re-proposals on all 8 seeds: ZERO). Worse, the resumed
tends that fail to rebuild trust still count as upkeep,
so the neglect snap (trust < 20 + no upkeep 14+ days)
never fires either. The polity is a zombie: 3 active
links, 2 seasoned, diplomacy 0, no exit in any
direction — it cannot re-season (tends too weak),
cannot break (tends count as upkeep), and cannot be
replaced (still counts as a subordinate). It ends only
when the village dies.

## Finding 4 — the BELONG shape reproduces, and mixed polities never pay

99401 reproduces the diplo finding exactly (0-mismatch
reproduction): its 3 links season at d57 but span TWO
polities (2 LEAD + 1 BELONG, Haven subordinate to
village_1), so regional+ never fires and diplomacy
stays 0 for the whole run. The BELONG link is never
tended (leadcourt tends only primary==='haven' links),
decays 47 → 33 → 0, and BREAKS d97 — the only broken
link in the entire pilot — one day before the village
dies d98, so no re-proposal window exists (and none is
attempted). Two lessons ride together: a mixed-polity
season pays nothing even while all three links are
seasoned, and the untended BELONG shape's end state is
a break, not a fade.

99404 and 99412 are the other never-shapes: 99404
reaches only 2 seasoned at once before dying d76
(third link formed d47, never seasoned); 99412 forms
its links late (d45/47/49, first tend d50) and dies d64
before any link reaches 30 days. Death, not the polity
filter, is their binding constraint.

## Finding 5 — the scale ladder's timing is exact, and a drop costs the rung, not the wave

Scale-rank first-read days are uniform across the
polity seeds: regional d47, national d77, global d78
(99402, 99403, 99409, 99410; 99411 reads national d77
and global d119 — its global flag stages late, after a
long regional+ hold). The d47 → d77 step is the canon
rule playing out loud: regional for a full 30-day
season, then national. The d78 global read is the
game's own live flag (globalLive), not a completed
global campaign — reported as the flag reads, not as
"reached global" in the campaign sense.

A drop costs the rung immediately: 99402 reads global
through d89 and regional from d90; 99411 reads global
through d136 and regional from d137 — each with the
"realm came apart" line (see sense-testing). But a drop
does NOT kill wave-5 prospects in this corpus, for two
separate reasons:

- Peak ratchets: 99402's peak reaches 5 on d62 (before
  its d89 drop) and stays 5; the harness end call still
  reads wave 5 unlocked, and the village FACES wave 5
  from d114 — 25 days AFTER losing diplomacy — on war
  standing alone (end: war 200, diplomacy 0, capped 175).
- Readiness is the wave-5 gate, not diplomacy: 99402 is
  the only seed with any readiness-5-ready days (27,
  d62–d88 — all BEFORE its drop), and the only seed to
  face wave 5. 99411 ends at war 200 with diplomacy 0
  and never faces wave 5 (ready days 0) — it never had
  wave-5 prospects for a drop to kill. So the drop's
  wave-5 cost is precisely zero observed cases, while
  its scale cost is total (global → regional, "the
  climb starts over"). A future arm must not confuse
  the two: diplomacy loss demotes the village, it does
  not by itself un-win the wave.

## Wall numbers (pilot leg, not wall movement)

Wins 0/8. Villages lost 8/8, survived to horizon 0/8.
National / table: end-state scaleRank global 2/8
(99409, 99410), national 0/8 at end (collapsed seeds
fell back to regional), regional 5/8, village 1/8
(99412). Table: not instrumented by this arm (stated,
not faked); no win flag observed on any seed. Wave-5
unlocks 1/8 (99402), wave-5 faced 1/8 (99402), wave-4
faced 8/8, wave-4 unlocks 8/8. Wave reach (by maxWave):
wave 5 on 1 seed, wave 4 on 7 seeds. Arc reach: not
instrumented (stated, not faked). Readiness-5-ready
days: 27 (99402 only), 0 on all other seeds. Median
survival 109 days (sorted 64, 76, 98, 107, 111, 118,
143, 146), max 146. Deaths 543 total: villager combat
219, combat 103, expedition 80, the wild 65, monster 32,
sickness 9, the arena 4, starvation 4, a wound that
wouldn't close 4, ambush 3, contest 3, dehydration 2,
thirst 2, named beasts 9 (Choir Toad 2, Big-Eyes 2,
Highbeam Deer 1, Grief Counselor 1, Sunback 1, The Ugly
Beast 1, The Redactor 1, Performance Review 1, a
drumbeat with no drummer 1), a stranger 2. Combat
accounts for 322/543 deaths (59%) — villages die
fighting, not starving, on this band, same shape as
the diplo band.

NOTE on the pilot band's survival: median 109d here vs
diplo's judged-leg 59d and leadcourt context 76–140d.
Different seed band AND different anchor (71786e9acf08
vs diplo's c400ae3e0cc1) — but the four extended seeds
reproduce exactly, so the band difference is a seed
effect, not an anchor regression and not a before/after
claim. No leadcourt village in either leg survived to
300; the horizon question is answered by death, not by
the cap — a polity in this corpus gets at most ~146
days to prove itself, and usually far less.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

The drop narration is the best-written beat in the
corpus. Every collapse carries the same two lines on
the drop day, in the same order, and both read as
consequences of neglect rather than as system notices:

- The cooling warning, naming the drifting fire:
  "⚠️ Thornfield's fire is drifting from ours — their
  speaker doesn't linger at the gate the way they used
  to, and nobody over there says why. Bonds don't mend
  themselves; a tended fire remembers who fed it."
  (99402 d89, 99403 d117 with two fires named, 99411
  d136 naming Ashford.) It fires once per crossing by
  design (the drift watch), and it fires ON the drop
  day — the village notices at the moment the bond
  fails, not weeks later.
- The dissolution line, naming the price: "◈ The realm
  came apart — no polity answers to Haven now, and
  Haven is a free fire again. National and global no
  longer describe this village. The climb starts over."
  The "starts over" clause is the honest version of the
  finding: the ladder is a live state, and losing it
  costs the rung, not just the points.

No robotic, static, or repeated diplomacy dialogue was
found: the cooling line repeats its TEMPLATE across
seeds (same sentence, different fire named) but fires
once per link per crossing, which is the designed
voice, not a narration bug. The "bond dips, but holds"
succession-endure lines that also appear on drop days
(99402 d85–d89) are a different beat (speaker deaths),
not link narration, and they do not confuse the drop
story — if anything they sharpen it, since succession
haircuts are part of the bleed. One capture limitation
carries over from diplo (noted, not fixed here): the
instrument's say-line sample does not match tribute
shortfall lines ("tribute comes up thin", "nothing
comes from…"), so the weekly bleed itself is traced
through trust numbers and tend history, not through
its own narration — a future instrument should match
tribute lines to close that loop.

## Village assessment (plain words)

Picture eight villages that actually ask — three
proposals each, three bonds each, bonds ripening in
thirty days. Two of them hold their realm to the grave:
the fires stay fed, the trust stays high, and they die
as the head of a global polity with the diplomacy
ledger still paying 102 — the realm outlives the
village's food, if not the village. Three of them
watch it come apart. The pattern is always the same
and always slow: the pantry crashes, the tending
stops because there is nothing to tend with, and then
for forty to eighty days nothing visible happens while
the weakest bond quietly bleeds — a thin tribute here,
a dead speaker there — until one morning the bond
crosses below the line and the whole realm dissolves
in a single day, announced aloud, with the climb to
start over. And starting over never happens. On one
village the food comes back and the tending resumes,
and it still doesn't save the bond: the resumed grain
is too little against a starving subordinate's weekly
shortfall, and the bond sits at zero trust, still
counted as a subordinate, still blocking any
replacement, kept alive by the very tending that
cannot heal it. That is the season's finding: a polity
is not fragile because it breaks. It is fragile
because it fades while everyone is still holding on,
and because the rules give a faded bond no way back —
no re-seasoning strong enough, no replacement while
the faded bond still counts, no snap to clear it.
What is missing is not a lower bar. It is a way back
after the fall — or tending that never stops in the
first place.

## Metric review (§14 — no in-run re-scoring)

- The prereg's DIAG-GO legs were judged exactly as
  written; no metric moved. The verdict is DIAG-GO
  (classified 8/8 >= 6, diplomacy seeds classified 5/5
  >= 3). The hold-share metric proved its worth as a
  secondary descriptor but not as a judge: 99403's
  0.968 is a collapse, and 99409/99410's 1.000 are
  holds-to-death, so hold-share alone cannot separate
  "held" from "collapsed yesterday" — the trajectory
  class + drop/recovery counts carry the verdict, and
  hold-share only colors it. That is the metric working
  as designed (primary = trajectory classification),
  not a flaw to fix.
- Proposed revision for the NEXT run (not applied
  here): report hold-share alongside POST-DROP DAYS
  LIVED (99402: 54, 99403: 1, 99411: 10) — the recovery
  verdict needs the window length next to the share,
  or a 1-day collapse reads as a hold.
- Instrument corrections: ONE, made during proof and
  committed before analysis (commit 34cf42b23, proof
  32/32 after the fix): the analyzer's drop record
  originally reported each dropped link's last tend
  over the WHOLE run, so 99402's d89 drop would have
  shown a "last tend" of d111 — a resumed tend AFTER
  the drop masquerading as pre-drop upkeep. The fix
  restricts drop last-tend to tends at or before the
  drop day (99402's correct pre-drop last tend: d49).
  This correction is material to Finding 3's mode-B
  claim and is therefore stated, not buried: without
  it, mode B (tending resumed and failed) would read
  as mode "tending never stopped."
- Instrument limitations recorded for the next run, not
  fixed here: (1) tribute shortfall say-lines are not
  in the SAY_RE sample (see sense-testing); the weekly
  bleed is traced via trust numbers, not its own
  narration. (2) The analyzer's per-link trust
  trajectory is sampled from daily snapshots only, so
  intra-week trust moves (a haircut and a tend in the
  same week) are netted, not itemized. (3) scaleRank
  'global' is the globalLive flag read, not a
  completed global campaign — end-state global (2/8)
  must not be cited as "reached global" without that
  qualifier.
- The 300d horizon was never binding (max survival
  146d); a future season arm should either accept
  death as the horizon (and say so in its prereg) or
  pick seeds/policies that live longer, rather than
  raising the cap further for no observation gain.

## Verdict — DIAG-GO

Trajectory + drop-cause + recovery-outcome fully
classified on 8/8 pilot seeds (bar: >= 6), including
5/5 diplomacy seeds (bar: >= 3). The season answer, in
one line: diplomacy HOLDS to village death when
tending never gaps and the trust buffer is high, and
otherwise COLLAPSES exactly once per polity — never
flickers, never recovers. Every drop is a weakest-link
trust-unseason after a 40–82 day pantry-gated tending
gap; resumed tending cannot rebuild a starving link's
trust; and a trust-0 link still counts as an active
subordinate, so no replacement is ever proposed and
no snap ever clears it. A drop demotes the village
(global → regional, "the climb starts over") but did
not remove any wave-5 unlock in this corpus (99402
faced wave 5 twenty-five days after its drop, on war
standing alone).

## Next blank, precisely (no fix in this run)

The next arm is a RECOVERY arm, not a standing-price
arm: the diagnosis names two candidate levers to test
separately (never both at once, never in this arm):
(a) TEND-THROUGH — a policy that tends below the
20,000-kcal pantry gate, or tends the weakest link
first, judging whether continuous tending prevents
drops at all; (b) ZOMBIE-CLEARING — a policy that
re-proposes (or forgives arrears / calls in debt on)
a trust-0 active link, judging whether a faded polity
can be replaced or re-seasoned after a drop. Either
arm must report LEAD vs BELONG shape (99401's mixed
polity never pays) and post-drop days lived alongside
hold-share. NO gate/price/deed arm follows from this
evidence: standing clears 200 on war alone (99402),
diplomacy pays the full 102 when held, and the missing
piece is a way back after the fall, not a lower bar.
The veteran-kill narration divergence (wave-3 kills
celebrated as "veteran kills") stays in the findings
backlog from standacc; it is not re-litigated here.

## Findings for backlog (coordinator appends; not chased here)

- [open] 2026-11-04 — diplomacy — LEAD polity diplomacy
  holds to village death when tending never gaps, and
  otherwise collapses exactly once with zero recoveries:
  no flicker, no re-seasoning, no re-proposal in 5
  diplomacy seeds (this run's evidence).
- [open] 2026-11-04 — diplomacy — a trust-0 link still
  counts as an active subordinate, so it blocks
  replacement proposals forever while resumed tending
  counts as upkeep and blocks the neglect snap: the
  polity sits zombied at diplomacy 0 until village
  death (99402, this run's evidence).
- [open] 2026-11-04 — diplomacy — resumed tending after
  a drop cannot rebuild a starving subordinate link's
  trust (99402: tends d97/d110/d111, trust 21 → 0);
  tending continuity, not tending resumption, is the
  lever (this run's evidence).
- [open] 2026-11-04 — instruments — diplo/polityfrag
  say-line sample misses tribute shortfall lines; future
  instruments should match tribute lines to trace the
  weekly bleed in narration, not just in trust numbers
  (this run's capture note).

## Proof and landing

- Proof: `scripts/test-polityfrag-20261104.js` — 32/32
  PASS (drop/recovery classification incl. trust-unseason
  / broken / flicker / never-diplomacy cases, hold-share
  math, judgeGo bars incl. the diplomacy-seed floor,
  live harness smoke: snapshot shape, 2-day leadcourt
  run, 0 instrument errors).
- Arm commits on branch sim-polityfrag-b (coordinator
  merges via --ff-only; committed on branch, pending
  coordinator merge — no push, no bump, no live
  verification by this worker):
  - fbb4179d07 sim-polityfrag-b prereg (before any
    judged sim)
  - 71786e9acf08 sim-polityfrag-b instruments + proof
    31/31 (zero src/js)
  - 34cf42b23d sim-polityfrag-b analyzer fix: drop
    last-tend uses pre-drop tends only + proof 32/32
  - (this landing) sim-polityfrag-b pilot + evidence
    (zero src/js)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-polityfrag-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-polityfrag-b/` (8 files);
  scripts `test-polityfrag-driver-20261104.js`,
  `test-polityfrag-analyze-20261104.js`,
  `test-polityfrag-20261104.js` (reusing
  `diplo-instrument-20261104.js` verbatim — not
  modified, not claimed as this arm's file).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after all three
  commits (prereg + instruments + analyzer fix);
  repaired each time via HEAD-blob `update-index
  --cacheinfo` and verified `git status` empty +
  `git diff HEAD` empty. The commits themselves were
  always correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers (verified before reporting).
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence).
- Heartbeats: worktree heartbeated during the run
  (registry `sim-polityfrag-b` alive through the run).
