# sim-npcdeadfilter-confirm — npcIds() dead filter CONFIRM (run fleshout-20261102T1715Z, axis scale-onramp)

Arm: sim-npcdeadfilter-confirm. Confirms commit cc370f832
(sim-npcdeadfilter-a: src/js/betrayal.js npcIds dead filter, +27/−1).

## Verdict: CONFIRM PASS — plus one in-arm fix (dead speakers)

The filter holds where the pilot could not test it: on a
corrupt roster inside live sims, the filtered arm NEVER
installs a dead bearer (0/11 paired first successions),
while the unfiltered control installs one in 10/11 (90.9%,
bar: ≥75%). The 11th paired case (97330) is a disclosed
tie-break exception, not a filter miss — the control still
installed the dead id two deaths later in the same cascade
(see below). All guardrails hold, including a post-fix clean
re-run that is byte-identical to the pre-fix clean band.

The substrate ALSO exposed a real hole in the same family:
a dead id on the roster spoke the succession lines, because
the close line and the grave vouchers read trust keys ∩
roster membership, not npcIds(). That hole is FIXED in-arm
(src/js/ledger.js, +23/−2), with its own RED/GREEN proof
test, and the clean band re-run proves the fix changes
nothing on clean rosters. No [needs-eyes]: on clean rosters
the fix is byte-identical (proven, not asserted), so nothing
in normal play changes; the removed lines only ever fired
for a dead speaker in a corrupt-roster state.

## Prereg

evidence/2026-11-02/sim-npcdeadfilter-confirm-prereg.md,
committed (8eaf5b62) BEFORE any judged sim. No threshold was
re-scored mid-run. The judged corpus is the driver band
below; harness injection cases (the proof tests) are the
instrument checks, not the band.

## The substrate (what was built, not re-run)

For each seed, the driver (closecommit stack, verbatim from
the pilot) runs the policy sim and, at the FIRST natural
bearer death where the roster allows it (≥3 living
non-bearers), injects a corrupt-roster state through a
NON-entry-gate path: kill the highest-trust living
non-bearer via a real removeVillager('killed') death
(deadMarked true, dropped from roster), push the dead id
back onto the roster, set its trust top, and let the game's
own playerDeath succession run. The sim then CONTINUES to
the horizon under the new bearer, so the aftermath plays out.

Two arms on identical seeds, paired by construction: the
control replaces npcIds() with the pre-fix implementation
(roster-minus-bearer), which is byte-identical on a clean
roster — so pre-injection trajectories are identical (same
death day, same victim) and the first injected succession is
a true paired comparison. A third arm (clean, no injection)
is the guardrail band. Horizon: 250d cap, death-aware (dead
villages stop early; the cap is a ceiling, not a target).

Seeds (12): 97330, 97331, 97332, 97333, 97334, 97335, 97336,
97338 (pilot band) + 97339, 97340, 97341, 97342 (new).

## Primary results — paired first injected successions

11 paired cases (97332 yields none in either arm: the village
dies at 23d with zero bearer deaths). Filtered dead-installs:
0/11. Control dead-installs at the first succession: 10/11
= 90.9% (bar ≥75%). Paired-case bar (≥8) met.

| seed | inj day | victim (dead, top trust) | filtered bearer | control bearer |
|------|---------|--------------------------|-----------------|----------------|
| 97330 | d107 | Aroha | Patrick (living) | Patrick (living*) |
| 97331 | d57 | Onni | Raniera (living) | Onni (DEAD) |
| 97332 | — | — (no bearer death) | — | — |
| 97333 | d34 | Arnold | Howard (living) | Arnold (DEAD) |
| 97334 | d26 | Esmeralda | Nino (living) | Esmeralda (DEAD) |
| 97335 | d8 | Yuki | Chloe (living) | Yuki (DEAD) |
| 97336 | d77 | Susan | Nadia (living) | Susan (DEAD) |
| 97338 | d71 | Alfredo | Jian (living) | Alfredo (DEAD) |
| 97339 | d38 | Esther | Autumn (living) | Esther (DEAD) |
| 97340 | d57 | Valeria | Nino (living) | Valeria (DEAD) |
| 97341 | d8 | Sarah | Catalina (living) | Sarah (DEAD) |
| 97342 | d8 | Anna | Carmine (living) | Anna (DEAD) |

\* 97330, the tie-break exception (diagnosed, not waived):
a /tmp diagnostic replay of the control run showed the
injected trust (max 98 + 100 = 198, verified read-back)
collapsed to 100 before the successor sort — the game's
trust writes clamp to 100 (game.js:3261 pattern) and death
processing writes trust for the victim inside playerDeath's
pre-sort section — leaving a 3-way tie at 100 (Patrick,
Piya, Aroha), broken by order, where the pushed-back-last
victim loses. So succession 1 chose Patrick in BOTH arms.
The corrupt roster still fed succession a dead bearer two
deaths later in the same day-107 cascade (Piya → Aroha,
chosenDead true in the control deaths list). The control
therefore installed dead on 97330 as well — just not at the
first succession. Counting strictly by the prereg (first
succession only), C-DEAD is 10/11; counting the cascade,
the control installed dead on 11/11 injected seeds. Either
count passes the ≥75% bar. Lesson for future arms: a
"top trust" construction is NOT stable under death
processing — read the actual candidate list from the trap,
never assume the trust margin survives (see metric review).

Control aftermath (dead bearer leading): dead-bearer days by
seed — 97331: 1, 97333: 4, 97334: 73, 97335: 8, 97336: 20,
97338: 7, 97339: 1, 97340: 11, 97341: 28, 97342: 19, 97330: 0
by daily snap (same-day turnover — see metric review; the
deaths list, not the snap, is authoritative). Filtered
dead-bearer days: 0 on every seed. Filtered npcIds dead
returns: 0 calls on every seed. Control npcIds dead returns:
2 calls per injected seed (6 on 97330, cascade), 0 on 97332.

Per-seed outcomes (gameDays / endReason):

| seed | filtered | control | clean |
|------|----------|---------|-------|
| 97330 | 125d village-lost | 116d village-lost | 136d village-lost |
| 97331 | 65d village-lost | 57d village-lost | 69d village-lost |
| 97332 | 23d village-lost | 23d village-lost | 23d village-lost |
| 97333 | 46d village-lost | 53d village-lost | 92d over-other |
| 97334 | 90d over-other | 99d village-lost | 90d village-lost |
| 97335 | 90d over-other | 90d over-other | 62d village-lost |
| 97336 | 117d village-lost | 100d over-other | 110d over-other |
| 97338 | 83d village-lost | 90d over-other | 90d over-other |
| 97339 | 93d over-other | 90d over-other | 92d over-other |
| 97340 | 154d village-lost | 83d village-lost | 153d village-lost |
| 97341 | 138d village-lost | 35d village-lost | 88d village-lost |
| 97342 | 90d over-other | 89d village-lost | 90d over-other |

Post-injection divergence is the substrate working, not a
guardrail violation: the guardrail is the clean band (below),
and injected arms are EXPECTED to diverge once the bearer
differs (e.g. clean 97334 is village-lost while filtered-
injected 97334 reaches over-other, because the injected
succession replaces the natural one).

## Guardrails

G1. CLEAN-GUARDRAIL REPRODUCTION — PASS, exact. Filtered
    clean runs on the 8 pilot seeds match pilot postfix on
    gameDays, endReason, AND bearer-death counts: 97330
    136d village-lost 6 deaths; 97331 69d village-lost 1;
    97332 23d village-lost 0; 97333 92d over-other 11;
    97334 90d village-lost 4; 97335 62d village-lost 11;
    97336 110d over-other 3; 97338 90d over-other 2. The
    180d → 250d cap extension is inert here, as predicted
    (all pilot villages resolved by 136d).
G2. ZERO DEAD RETURNS, CLEAN RUNS — PASS (vacuous as in the
    pilot, disclosed: 0 dead npcIds returns on all 12 clean
    runs; the entry gates hold).
G3. NO NEW ERROR CLASS — PASS. Driver errors empty on all
    36 judged runs (12 filtered + 12 control + 12 clean).
G4. SENSE — PASS with one disclosed wrinkle (the deadspeak
    hole, fixed below). See "Sense check".

## The in-arm fix: dead speakers (DIAG, then fixed)

What the substrate exposed: in ALL 11 filtered injected
runs, at least one succession line on/after the injected
succession was spoken by the dead victim — the "you're not
her" close line — and in 5/11 runs the victim also vouched
at the grave ("At the grave, X speaks for Y"). Mechanism,
both in src/js/ledger.js playerDeath, both reading trust
keys ∩ roster membership instead of npcIds():

- closeId (line 856): `Object.keys(trust).filter(id =>
  id !== newId && liveRoster.has(id) && trust > 55)` —
  liveRoster is roster MEMBERSHIP, not liveness, despite the
  "DEAD NEVER SPEAK" comment above it ("Only the living
  roster can look at you"). A pushed-back dead id qualifies.
- Grave vouchers (line 1136): `(v.roster).filter(id =>
  id !== newId && liveRoster.has(id) && trust >= 60)` — same
  pattern. Worse than narration: vouchers feed vouchBonus
  (+4 each, capped +16) into the successor's inherited trust,
  so a dead voucher inflated the successor's trust number.

The fix (+23/−2, ledger.js playerDeath): a deadMarked guard
with the inline triple-source fallback (same shape as the
npcIds filter, for the same load-order/partial-harness
reason), applied to both filters. Code intent now matches
its own comment. No new narration, no feel/combat/UI change.

Proof (scripts/npcdeadfilter-confirm-deadspeak-test.js, seed
42, live harness): RED pre-fix — 7 passed, 2 failed, exactly
the two D1 assertions (dead victim delivered the close line
AND vouched at the grave; D2 living guardrail passed both
sides, as it must). GREEN post-fix — 9 passed, 0 failed
(D1: dead victim speaks neither line, successor living; D2:
a living 90-trust id still delivers both lines while a
100-trust living id inherits — the fix silences no living
speaker). Restoration discipline: the RED run restored HEAD's
ledger.js from a /tmp backup copy and the fix was restored
from that backup afterwards (diff re-verified, all suites
re-run green); no checkout-as-restore trap.

Clean-band re-verification post-fix: all 12 clean runs
re-run AFTER the fix are BYTE-IDENTICAL (full JSON files,
cmp) to the pre-fix clean runs. The fix is a proven no-op on
clean rosters at full-trajectory level.

## Proof results (all post-fix, unless stated)

- scripts/npcdeadfilter-confirm-test.js (substrate in
  miniature, 3 driven successions): 18 passed, 0 failed.
  Includes the control positive control (patched npcIds
  DOES install the dead id) and the filtered restore.
- scripts/npcdeadfilter-confirm-deadspeak-test.js: RED
  pre-fix (7/2, D1 only), GREEN post-fix (9/9).
- scripts/test-npcdeadfilter-a.js (pilot proof): 14/14.
- scripts/test-rosterreturn-a.js: 29/29.
- scripts/test-membership-20261007.js (green-listed): 43/43.
- check.js --quick: NOT green, NOT failed — two attempts
  stalled under sibling load (first killed by a 240s timeout
  with one unidentified F in the progress stream and no
  summary line; second killed by me at ~9 min with no
  output yet). Same stall class the pilot reported. Not
  claimed. The arm's verification rests on the proof tests,
  the 36 judged sweep runs, and the neighbouring suites
  above, all of which ran clean.

## Sense check (transcript, SENSE-TESTING LAW)

Filtered 97331, day 57 (Diego dies, victim Onni, successor
Raniera) reads like people, in order: the village stops,
somebody screams, somebody digs, keepsakes go into the
ground, the neighbours press tribute while the chair is
empty, Onni's line (the pre-fix wrinkle — dead Onni speaks
here), the Codex syncs to Raniera, "You wake up somebody
else. Raniera Thomas, 42 — a teacher," the quarrel dies
with Diego ("the sentence doesn't cross the grave"), and
the grave speaker vouches. Post-fix, the same sequence
runs with a living speaker in Onni's place — the human
shape is unchanged, the corpse just stops talking.

Control 97334's aftermath reads as quiet corruption, not
farce: after Esmeralda (dead) takes the mantle on day 26,
the village keeps going for 73 more days — meals, triage,
hurt villagers, jokes by the fire — with no line ever
noting the bearer <redacted> dead while acting. The dead-bearer
state is visible only in accounting (bearerDead), never in
fiction. That is exactly why the filter matters: without it,
the game would silently play on under a corpse and nobody
in the fiction would ever say so.

## Reachability verdict

This arm adds no content and blocks no content. The
installation filter is now confirmed in live sims, and the
succession narration is closed to dead speakers. Scale
reachability is unchanged by either change on clean
rosters (byte-identical clean band). The scale wall itself
is untouched — no new national/table/win path is opened.

## Wall numbers (diagnosis corpus context, NOT a reach claim)

Clean band (12 seeds, the least-substrate numbers):
national 1/12 (97339 national; no global in clean),
Game.won 5/12 (97333, 97336, 97338, 97339, 97342 — see the
won-flag caveat below), table: NOT separately instrumented
in this driver (no table-sit state flag was found; won is
the terminal flag recorded), wave 4 unlocked 10/12, wave 5
0/12, median survival 90d, max 153d.
Filtered band: national-or-higher 2/12 (97334 national,
97339 global), won 4/12, wave 4+ 11/12, median 91.5d.
Control band: national-or-higher 2/12 (97330 national,
97334 global), won 4/12, wave 4+ 10/12, median 89.5d.
No substrate flag is cited as reach (pilot discipline).

WON-FLAG CAVEAT (for the coordinator, backlog item below):
Game.won=true appears with endReason over-other on 5/12
clean seeds. The pilot did not capture won, so there is no
pilot comparison — but a win flag sitting alongside a
non-win end reason needs clarification before anyone cites
these as wins. This arm reports the flag as recorded and
claims nothing from it.

## Village assessment (plain words)

The village's bookkeeping had two holes in the same page.
The first is now proven closed in real villages, not just
in staged cases: when a dead person's name somehow gets
back on the roster and the leader dies, the village no
longer hands the leadership to the corpse — it picks the
most-trusted living person instead, eleven villages out of
eleven. Without the filter, ten of those eleven villages
handed the job straight to the dead person, and one more
did it two deaths later in a day of cascading funerals —
then carried on for weeks with a corpse holding the office
while daily life went on as if nothing had happened. The
second hole was in the funeral itself: the dead person
kept speaking at their own successor's handover — "you're
not her," and vouching at the grave — because the lines
that speak there checked who was on the roster, not who
was alive. That is closed too, and villages with no dead
names on their lists play day-for-day exactly as before.
The wall itself hasn't moved: villages still reach the
wider world rarely (one in twelve clean villages here),
waves still stop at four, and nobody in this corpus sat
the full table — but the succession the climb depends on
no longer silently corrupts.

## Metric review (for the NEXT run, not this verdict)

- "Top trust" is not a stable substrate construction: death
  processing rewrites trust (clamped to 100, boosted) inside
  playerDeath's pre-sort section, so a max+100 margin
  collapses to a tie broken by order. Future corrupt-roster
  arms should set the victim's trust AND read the actual
  candidate list from the trap to confirm ordering, rather
  than assuming the margin survives — or design for ties
  (victim last in roster order loses ties; victim first
  wins them).
- deadBearerDays (daily snap) misses same-day dead-bearer
  turnovers (97330 control: dead installed and replaced
  within one day, 0 snap days). The deaths list
  (chosenDead) is authoritative for installation; snaps are
  for duration only.
- G2 stays vacuous on clean bands by design (entry gates
  hold); the judged evidence for any membership filter is
  the corrupt-roster band, not clean seeds.
- Panel: no panel compare attached, for the reason carried
  from the pilot prereg — balance-panel.js runs its own
  registry policies and cannot express the closecommit
  stack, so it cannot judge this filter; the driver corpus
  is the judged instrument. Per the standing warning, no
  panel number re-scores this verdict.

## Canon

docs/CANON.md read first. No canon doc covers npcIds(),
succession ordering, or membership intake specifically
(MONSTER-WAVES.md covers wave law, not membership). The
fix aligns code with its own stated intent (the "DEAD
NEVER SPEAK" comment in playerDeath) rather than inventing
canon. No new narration was added; two lines simply stop
firing for dead speakers.

## Files (this arm, to be committed on branch sim-npcdeadconf)

- src/js/ledger.js — the deadspeak fix (closeId + grave
  vouchers dead check, +23/−2). The cc370f832 npcIds filter
  itself is UNCHANGED — this arm confirms it, it does not
  re-edit it.
- scripts/npcdeadfilter-confirm-driver-20261102.js — the
  corrupt-roster band instrument (filtered/control/clean).
- scripts/npcdeadfilter-confirm-test.js — substrate proof
  (filtered/control/filtered-restored, 18/18).
- scripts/npcdeadfilter-confirm-deadspeak-test.js — dead-
  speaker proof (RED pre-fix, GREEN post-fix, 9/9).
- evidence/2026-11-02/sim-npcdeadfilter-confirm-prereg.md
  (already committed, 8eaf5b62).
- evidence/2026-11-02/sim-npcdeadfilter-confirm.md (this file).
- evidence/2026-11-02/perseed-npcdeadfilter-confirm/cf-s<seed>-
  <filtered|control|clean>.json (36 judged runs; clean files
  are the post-fix re-run, byte-identical to pre-fix).
