# sim-leanlink-cap5-holdout — HOLDOUT for sim-leanlink-cap5 (scale-onramp axis)

Run: fleshout-20261024T1822Z, arm sim-cap5holdout. Worktree:
`~/workspace/worktrees/sim-cap5holdout`. Base anchor: `69e7cd49ace9df8c6ae50db123d614f883394a6d`
(worktree HEAD at run start; the cap5 arm's anchor was `34101b3cde24` — the holdout
re-bases onto current worktree HEAD and asserts a single anchor across its own
corpus, so anchor drift vs the pilot/confirm is stated, not hidden).

## Canon read first

- `docs/CANON.md` (manifest) then `docs/DESIGN.md` §scale: village → regional →
  national → global, transitions are moments not thresholds, never speedrunnable,
  verbs never change.
- NO canon doc covers the envoy→accord mechanism specifically — stated, not invented.
  The mechanism comes from `src/js/hierarchy.js` (read: polity_links_must_be_seasoned
  — 30+ days AND trust 40+, formed at 30; one_rung_per_season — national cannot stage
  until regional for a full season; negotiation_is_played — proposeLink scores
  courtship, ≥55 accepts, 35–54 counters with played terms, <35 declines;
  national_is_a_live_state — dissolve the realm and nationalLive clears) and from
  `scripts/policies/linkform.js`, `leadcourt.js` (read before designing anything —
  this run designs nothing new; it re-uses the cap5 instrument unchanged).
- `docs/MEASUREMENT.md` §§9–12, 14–15 bind this run.

## Pairing — defined exactly (unchanged from sim-leanlink-cap5)

- Control = `scripts/policies/competent.js` (no env levers).
- Armed = `scripts/policies/leanlinkcap5.js` with `LEANLINKCAP5=1` (env-gated,
  default OFF). Armed daily = `competent.daily` + lean courtship copied from
  linkformCourtship (LINKFORM=2 shape) with EXACTLY one delta vs LINKFORM=2: NO
  weekly tends at all. Subordinate cap stays 5. Nothing else changes.
- Policy-side ONLY: no modification to competent.js, linkform.js, leadcourt.js,
  or any src/js. No default flips. The policy file contains NO tend verb at all;
  the sweep's `court.tended` counter must read 0 on every armed row, asserted
  by the proof test, not assumed.
- Broken-link correction (from linkdrive, kept): links in `broken` status at end
  COUNT as dissolutions (`links.brokenFinal`, `links.dissolvedPlusBroken`).

## Pre-registration (binding, §14 — written BEFORE any sweep, judged against this, never re-scored mid-run)

- Holdout seeds: FRESH band 73521–73532 × {control, armed} paired = 24 configs.
  Band verified unused at run start: `find evidence/2026-10-24 -name '*7352*'`
  returned 0 files (recursive, whole date dir) before the header was written.
  The pilot band (73501–73508) and confirm band (73509–73516) are NOT reused.
- Horizon: 180d death-aware (dead villages stop; +10d tail max).
- PRIMARY GO: national armed ≥ 3/12 AND armed national > control national.
- Guardrails (binding — breach = KILLED even if the primary passes; wording
  copied exactly from the cap5 evidence header):
  - starvation deaths armed ≤ control + 2;
  - median survival armed ≥ 0.8 × control median;
  - no lever-caused death-mode spike (any cause with ≥ 3 deaths in armed and 0
    in control must be named and judged).
- A GO verdict means the pilot+confirm national gain GENERALIZES to unseen seeds
  (GO CANDIDATE, default-OFF only — landing as competent play remains a
  coordinator/Steve call, NOT made by this arm). A miss is NO-GO, never
  re-scored against a friendlier metric mid-run.
- Also reported, end-state national AND ever-reached national-or-better side by
  side (ever-reached = weekly samples showing rank national or global at any
  sampled day; the cap5 run showed end-state hides real reach and real loss):
  regional/table/wins, wave reach (1–5), median/max survival, death-cause
  shares, starvation counts, links formed, accords, counters, tends (= 0 by
  design — verified), broken-status links counted as dissolutions, and §14c
  co-primary non-scholar combat deaths.
- Balanced panel (§15): ATTEMPT `scripts/balance-panel.js`; if it cannot ingest
  this corpus, state the inapplicability explicitly and fall back to the
  identical-seed paired comparison judged by the bar above (same as cap5).
- Sense: at least one armed + one control transcript sequence read and judged
  below (sense runs are separate narration-on runs; their words only are judged,
  never their numbers).

## HOLDOUT RESULTS (24 configs, anchor 69e7cd49ace9, 180d death-aware)

Paired per-seed table (gameDays = scholar day at end; 181/182 = survived the full
180d horizon — day-count off-by-one, identical in both arms; `table` = progState
tableWaiting OR tableDone; `broken` = final broken-status links, counted as
dissolutions per the linkdrive correction; `ever` = ever reached national-or-better
on any weekly sample OR end-state national — a lower bound, samples are weekly):

| seed | arm | days | end | rank | nat | ever | table | wave | deaths | starv | villCombat | formed | maxSubs | finalSubs | broken |
|------|-----|------|-----|------|-----|------|-------|------|--------|-------|------------|--------|----------|-----------|--------|
| 73521 | control | 181 | survived | village | 0 | 0 | 0 | 3 | 23 | 1 | 18 | 0 | 0 | 0 | 0 |
| 73521 | armed | 181 | survived | national | 1 | 1 | 0 | 3 | 18 | 0 | 17 | 4 | 4 | 4 | 0 |
| 73522 | control | 98 | village-lost | village | 0 | 0 | 0 | 3 | 38 | 2 | 24 | 0 | 0 | 0 | 0 |
| 73522 | armed | 96 | village-lost | regional | 0 | 0 | 0 | 3 | 39 | 2 | 26 | 3 | 3 | 3 | 0 |
| 73523 | control | 162 | village-lost | village | 0 | 0 | 0 | 4 | 52 | 0 | 33 | 0 | 0 | 0 | 0 |
| 73523 | armed | 114 | village-lost | regional | 0 | 0 | 1 | 4 | 40 | 0 | 26 | 4 | 4 | 4 | 0 |
| 73524 | control | 161 | village-lost | village | 0 | 0 | 0 | 4 | 41 | 1 | 27 | 0 | 0 | 0 | 0 |
| 73524 | armed | 123 | village-lost | regional | 0 | 1 | 0 | 4 | 29 | 3 | 16 | 5 | 5 | 5 | 0 |
| 73525 | control | 181 | survived | village | 0 | 0 | 0 | 3 | 31 | 0 | 29 | 0 | 0 | 0 | 0 |
| 73525 | armed | 180 | survived | national | 1 | 1 | 1 | 4 | 22 | 0 | 19 | 6 | 5 | 5 | 0 |
| 73526 | control | 165 | village-lost | village | 0 | 0 | 0 | 4 | 62 | 2 | 42 | 0 | 0 | 0 | 0 |
| 73526 | armed | 182 | survived | regional | 0 | 0 | 1 | 3 | 49 | 2 | 36 | 3 | 3 | 3 | 0 |
| 73527 | control | 181 | survived | village | 0 | 0 | 0 | 3 | 47 | 0 | 34 | 0 | 0 | 0 | 0 |
| 73527 | armed | 181 | survived | global | 1 | 1 | 0 | 4 | 45 | 0 | 36 | 5 | 5 | 5 | 0 |
| 73528 | control | 181 | survived | village | 0 | 0 | 0 | 3 | 33 | 0 | 26 | 0 | 0 | 0 | 0 |
| 73528 | armed | 141 | village-lost | regional | 0 | 1 | 0 | 4 | 39 | 0 | 26 | 4 | 4 | 4 | 0 |
| 73529 | control | 181 | survived | village | 0 | 0 | 0 | 3 | 33 | 0 | 25 | 0 | 0 | 0 | 0 |
| 73529 | armed | 119 | village-lost | regional | 0 | 0 | 0 | 4 | 34 | 0 | 22 | 5 | 3 | 0 | 5 |
| 73530 | control | 181 | survived | village | 0 | 0 | 0 | 3 | 47 | 1 | 42 | 0 | 0 | 0 | 0 |
| 73530 | armed | 151 | village-lost | global | 1 | 1 | 0 | 4 | 33 | 1 | 18 | 4 | 4 | 4 | 0 |
| 73531 | control | 166 | village-lost | village | 0 | 0 | 0 | 3 | 48 | 1 | 30 | 0 | 0 | 0 | 0 |
| 73531 | armed | 181 | survived | national | 1 | 1 | 0 | 4 | 31 | 0 | 19 | 5 | 5 | 5 | 0 |
| 73532 | control | 69 | village-lost | village | 0 | 0 | 0 | 4 | 30 | 0 | 21 | 0 | 0 | 0 | 0 |
| 73532 | armed | 152 | village-lost | regional | 0 | 0 | 1 | 4 | 40 | 3 | 24 | 10 | 5 | 3 | 7 |

Totals — control: national 0/12 (end-state) and 0/12 ever, regional 0/12, global
0/12, table 0/12, won 0/12, exiled 0/12; waves 3:8 / 4:4 / 5:0; median survival
173.5d, max 181d; deaths 485 (scholar 83, villager 402, villager-combat 351);
starvation 8; links formed 0; court all 0 (pairing holds).
Totals — armed: national 5/12 end-state (73521, 73525, 73527, 73530, 73531) and
7/12 ever (adds transient 73524 and 73528, both ending regional); regional-or-better
12/12; global 2/12 end-state (73527, 73530); table 4/12; won 0/12; exiled 0/12;
waves 3:3 / 4:9 / 5:0; median survival 151.5d, max 182d; deaths 419 (scholar 96,
villager 323, villager-combat 285); starvation 11; links formed 58, vanished 0,
broken-final 12 (dissolvedPlusBroken 12); court: counters 7, accords 48, national
answers 7, global answers 3, proposed 59, tended 0 (verified on every row),
defense calls 0. Zero sweep errors on all 24 files. Waves 1–2 universal (not
tabulated); wave 5 reached in 0/24 either arm — the pre-existing wave-5 wall,
not this arm's question.

## Verdict against the header (no re-scoring): NO-GO — KILLED on the starvation guardrail

- PRIMARY GO: national armed 5/12 ≥ 3/12 AND 5 > control 0 → PASSES. The national
  gain generalizes in direction and size: 5/12 here vs 4/8 pilot and 4/8 confirm.
  Ever-reached national-or-better is 7/12 armed vs 0/12 control.
- Median guardrail: armed 151.5d ≥ 0.8 × control 173.5d = 138.8d (ratio 0.873)
  → PASSES.
- Starvation guardrail: armed 11 ≤ control 8 + 2 = 10 → FAILS, by exactly 1
  death. Breach = KILLED even though the primary passes. Verdict: NO-GO.
- Spike guardrail: no cause with ≥ 3 armed deaths and 0 control deaths → PASSES
  (armed-only causes Dustboar, Big Ugly, The Congregation sit at 1 each).
- Overall verdict: NO-GO (KILLED on starvation guardrail). This does NOT erase
  the primary finding — the gain replicated on unseen seeds — but the header as
  written bars a GO verdict, and §14 forbids re-scoring the run against a
  friendlier metric. The correct read is: the effect is real AND the cost is
  real on this band. Landing as competent play remains a coordinator/Steve call;
  this arm's verdict is NO-GO, not a landing recommendation.

## Starvation detail (why the guardrail bites, and what does NOT rescue it)

- This band is hungrier overall than the pilot/confirm bands: control starvation
  alone is 8 here (vs 3 pilot, 1 confirm). The guardrail is absolute as written
  (armed ≤ control + 2), not relative, so a hungry band leaves no headroom.
- Matched-substrate deaths (identical day + person-class in both arms, same class
  as cap5's pilot 73501 day-16 scholar): 73522 day-13 scholar + day-29 villager
  (both arms), 73524 day-21 scholar (both arms), 73526 day-13 scholar (both arms),
  73530 day-15 villager (both arms) — 5 matched deaths.
- Arm-only count (the fairer count proposed in cap5's metric review, reported
  here descriptively, NOT used to re-score): armed-only 6 (73524 day-122 scholar
  + villager; 73526 day-97 scholar; 73532 day-90 villager, day-125 villager,
  day-151 scholar) vs control-only 3 (73521 day-96 villager; 73526 day-32 villager;
  73531 day-165 villager) — diff +3, still above the +2 allowance. The breach
  survives even the proposed fairer count; this is not an artifact of matched
  deaths. The next run's metric revision (if adopted) would need a different
  allowance, not just a different count — and that is a Steve/coordinator call
  for the NEXT run, not this one.
- Where the armed-only starvation sits: two of the six are 73532's late collapse
  (a churn seed: 10 links formed, 11 proposed, 7 broken-final, realm ending with
  3 subs after 5 broken — the tribute load of a churning courtship, not a single
  bad week), and two are 73524's day-122 pair (scholar + villager together, a
  village-wide thin day, not a lone death). 73529 is the other churn warning:
  5 links formed, all 5 broken-final, final subs 0 — a realm that formed and
  dissolved entirely while the village still died of combat, not starvation.
- Death shares otherwise: armed villages die LESS overall (419 vs 485 deaths)
  despite a lower median — shorter armed runs accumulate fewer deaths; the
  dominant causes in both arms are combat/arena/expedition, not starvation.
  Villager-combat is LOWER armed (285 vs 351), so the armed cost is not a combat
  story on this band; it is the starvation tail plus earlier village loss
  (armed lost 7/12 villages vs control 5/12, with armed losses at 96–152d).

## Mechanism notes (holdout vs pilot/confirm)

- Headroom expressed everywhere: all 12 armed seeds have ≥3 known villages and
  9/12 reach maxSubs 5 (73525, 73527, 73531, 73532 hit 5; 73524 hits 5 with all
  held). 73532's 10 formed links against a 5-cap is the churn form of headroom:
  room to re-propose after breaks, which the village used — and paid for.
- Transient national repeats: 73524 and 73528 touched national-or-better on
  weekly samples and ended regional (cap5's 73507/73513 pattern, third and
  fourth sightings). End-state national 5/12 understates reach (7/12 ever) and
  overstates hold — national remains a live state that cools.
- Table still ≠ win: armed table 4/12 (73523, 73525, 73526, 73532 — three of
  them at regional rank) with won 0/12. The table prices the run; it is not a
  national prize, and no arm takes the seat. The win chain remains the next
  blank, not this arm's.
- Defense calls: 0 staged in all 24 judged configs — that courtship ingredient
  remains unmeasured in this band, not proven absent from the game.
- Combined evidence across all three bands (pilot + confirm + holdout, 40 judged
  armed configs): armed national 13/28 end-state (8/16 + 5/12) vs control 0/28;
  ever-reached higher still. The direction is consistent; the holdout's
  contribution is the guardrail warning, not a reversal.

## Sense verdict (SENSE-TESTING LAW: meaning, coherence, relevance, consequences)

Sense runs are separate narration-on runs (seed 73521, 100d); their WORDS only are
judged, never their numbers.

- ARMED transcript (67 tight-filter lines): a coherent no-tend courtship story.
  Days 37/39/40/41 — "Hunter brings it home: Emberhold / Stonebridge / Thornfield /
  The Red Table bows to Haven — one organization, us primary. Tribute: 4,000
  kcal/week. The relationship starts at trust 30. Everything from here is earned."
  Day 40 — "Three fires bow to Haven. But a realm isn't leverage — it's seasons.
  These bonds are young; tend them, keep the trust, and the court will come."
  (The "tend them" counsel is addressed to the player — tending exists as a
  choice the policy doesn't take — coherent, as in cap5.) Weekly — "Tribute wagons
  from [village] turn at the gate — our shelves are full past tomorrow. 'Eat well,'
  we send back. 'That IS your tribute this week.' (Trust +1.)" Day 40 — a real gift
  with a name and tears: "You give Emberhold 1,500 kcal from Haven's bins — real
  food, honestly counted. Fatima weeps, openly. 'The fire network. That's what it's
  FOR.' (Trust +4.)" Day 55 — Ibrahim of Stonebridge walks in with pack-mules and
  2,317 kcal "no tribute, no ceremony." Day 58 — Regional Dawn: "One fire was a
  village. Two fires is a NETWORK. Coordination layer: online... Try not to starve
  twice as fast." Day 88 — First Court with a real choice (feast / host / cold ink /
  REFUSE the scale itself); the policy feasts (day 89: shared granary opens, +10
  with each fire). Day 88 — "Four fires. One head. GOVERNANCE LAYER: online...
  You built a realm. Try not to lose it the way you found it." Day 90 — the table
  not yet: "THE TABLE — the ring of pale light flickers at the edge of the sky...
  and does not come. Not yet... The ledger still wants: wave-3 monsters faced; the
  food-thesis deeds." Day 91 — Fatima, disbelieving: "Speakers rode in, ate our
  grain, and called us a realm. A REALM. I keep saying it to hear how it sounds."
  No tend line appears anywhere — correctly absent. VERDICT: SENSICAL — played
  diplomacy with the slow trust climb visible in the words (+1s and +4s, never a
  +8 tend line). Two observations, not bugs: the "Three fires" line repeats
  verbatim on day 41 after the fourth link bows (the line counts three fires when
  four have bowed — stale wording on the fourth formation); the Arena glyph block
  appears twice per arena day (sys + say duplication, a filter artifact also
  present in control).
- CONTROL transcript (11 lines): ZERO courtship lines — no proposes, no links, no
  tends, no court. The village lives a village life instead: Gossip Network
  learned (day 3), arena glyphs (days 21–22, duplicated sys+say as in armed), a
  System gift (Gravity hook, day 23), a feast line (day 25), and the repeated
  villager line "My kid asked if the watchers have favorites" across three
  speakers (Fatima day 40, Logan day 74, Hunter day 96 — the same repetition
  already in the findings backlog from linkdrive/cap5; no duplicate appended).
  VERDICT: SENSICAL — and the contrast with the armed transcript is itself the
  finding: a village that never proposes never hears the scale game at all,
  while its pantry climbs 30,912 → 76,408 across the same 100 days (rich enough
  to court, never told how).
- Villagers acting like people (beyond courtship): allies send food when they hear
  the bins are echoing, with a reason and a name; a dead leader's succession is
  felt in the roster (scholar changes gen_xyqdqnk → wanjiru_kamau in control);
  villagers wonder aloud about the watchers. Goals, routines, reactions —
  present, not robotic.

## Village assessment (assessor's account)

- What the villages looked like: control villages stay single-fire villages on
  every seed — they survive or die at village rank, never link, never hear a
  court. Armed villages become realms in every seed (3–10 allies formed,
  regional-or-better 12/12, national end-state 5/12, global 2/12, courts held)
  — and then most still die (7/12 village-lost) of combat attrition, with two
  (73530 global, 73525 national) dying/surviving WITH their realms intact.
  The scale wall moved on unseen seeds exactly as it did on the pilot/confirm
  bands; the price on this band is a starvation tail the guardrail catches.
- Who thrived and why: rich holders that kept trusts ≥ 40 through the seasons
  (73521, 73525, 73527, 73531 survived at national/global). Who died and why:
  churning realms (73532: 10 formed, 7 broken) and thin-pantry realms (73524's
  day-122 pair) starved at the margin, while the rest died of combat attrition
  with their realms intact or cooling.
- What knowledge/capabilities were missing: the win itself (0/28 across bands
  for this policy family); a routine trust repair that isn't the tend verb for
  cooled/churned realms (73529's fully-broken realm has no visible way back);
  and a starvation-safe courtship shape — the holdout's question for the next
  arm is whether a tribute-light or churn-capped variant keeps 5/12 national
  without the +3 starvation tail.
- Blank filled or documented: DOCUMENTED, not fixed — deliberately. The holdout
  documents that the cap5 gain generalizes (5/12, ever 7/12, vs 0/12) AND that
  its cost generalizes too (starvation breach on a hungry band, surviving the
  fairer arm-only count). No default flips, no policy changes, no game-code
  changes. The instrument + this evidence + the proof test are what land.

## Metric review (§14 — required; revisions apply to the NEXT run, never this one)

- Metrics held: primary + guardrails judged exactly as pre-registered; no
  re-scoring. The spike clause was applied as written (no spikes).
- The median-guardrail question is contested by the sibling measurement arm
  (their position, as briefed to this run: the median guardrail as written may
  misjudge arms whose villages die earlier with fewer total deaths — armed
  median 151.5d vs control 173.5d passes here at ratio 0.873, while armed total
  deaths are LOWER, 419 vs 485, which cuts against reading the median gap as
  harm). This contest is NOT applied to this run's verdict: the median leg
  passes as written, and the verdict turns on starvation, not the median.
  Carried as an open question for the next run's header, not resolved here.
- Proposed revisions for the NEXT run (not applied here): (1) starvation
  guardrail should be re-examined, not just re-counted — the arm-only count
  (6 vs 3, diff +3) fails the same +2 allowance, so a future header needs a
  different allowance or a per-seed framing, decided by the coordinator/Steve;
  (2) keep reporting touched-ever national alongside end-state (73524/73528
  here, 73507/73513 before — the transient is now a four-time pattern, not an
  anecdote); (3) keep splitting tableWaiting vs tableDone (waiting ≠ win);
  (4) keep counting broken-status links as dissolutions (73529/73532 prove the
  correction load-bearing: vanished-only would report 0 dissolutions for two
  collapsed realms).
- Balanced panel (§15): ATTEMPTED and found inapplicable, stated explicitly —
  same finding as cap5. The panel's `compare` mode requires `--before`/`--after`
  panel.json.gz files produced by the panel's OWN driver, which runs its own
  observer harness with its own policy registry — and `leanlinkcap5` is absent
  from sweep-compare's POLICY_REGISTRY (grep count 0), so the panel driver cannot
  run this arm at all without registry + observer work that would be a different
  instrument, not a comparison of this corpus. Fallback (as the task anticipates,
  same as cap5): the identical-seed paired comparison judged by the
  pre-registered bar above. The panel's absence changes nothing about the
  verdict — it means the panel is the wrong tool for a policy-side courtship
  arm, not that the measurement is missing.

## Infrastructure notes (loud, for the coordinator)

- EPERM write flap (known container class): the flap hit the sense/control write
  path persistently across this run's tail — the chunked writer subprocess fails
  with `WRITER-FAIL: EPERM: operation not permitted, write` on every attempt
  (verified directly: a 1-line probe through the writer fails the same way in
  this directory, while the judged corpus's 24/24 writes succeeded earlier in
  the same run). The sweep's stdout fallback (24 attempts, then the
  byte-identical JSON between LEANLINK-JSON-BODY markers) is what the sense
  recovery uses: the control sense file in this commit was reconstructed from
  that fallback body — content-verified (parses; seed/arm/sense/days/gameDays/
  rank/death counts/sayLines all match the logged body and CONFIG line), though
  re-formatted (key order/compaction differ from the fallback body's
  pretty-print, so no byte-sha match is claimed). No judged-corpus file comes
  from a stdout reconstruction.
- First full-band sweep attempt died silently after 7 control seeds (background
  session vanished with no completion; same class as cap5's lost background
  command). The sweep's resume logic (skip valid existing files) made the
  chunked re-run clean; no data lost. Separately, exec invocations that redirect
  the sweep's stdout straight to a file (`> file`) failed instantly and
  silently (exit 1, empty file) on three attempts while the identical command
  piped through grep/cat ran — pattern noted, cause unknown; piped invocations
  were used for all judged runs.
- Sense runs are excluded from the judged corpora (separate `sense/` subdir;
  the proof test's filename filter reads top-level files only) and their numbers
  are never judged — words only.

## File inventory (this arm's commit set)

- scripts/test-sim-leanlink-cap5-holdout.js (NEW — proof test, TEST-OK)
- evidence/2026-10-24/sim-leanlink-cap5-holdout.md (this file)
- evidence/2026-10-24/perseed-leanlinkcap5-holdout/*.json (24 judged configs)
- evidence/2026-10-24/perseed-leanlinkcap5-holdout/sense/*.json (2 sense runs)
- No src/js changes. No changes to competent.js, linkform.js, leadcourt.js,
  leanlinkcap5.js, or any sweep/analyzer script. The policy and sweep are
  re-used unchanged from the cap5 arm.

