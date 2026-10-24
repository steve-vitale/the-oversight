# sim-leanlink — lean courtship cap-3 no-tend on a competent substrate (scale-onramp axis)

Run: fleshout-20261024T1530Z, arm sim-leanlink. Worktree: `~/workspace/worktrees/sim-leanlink`.
Status: PRE-REGISTERED — header written before any sweep. Results appended below as they land.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/DESIGN.md` §scale: village → regional → national → global,
  transitions are moments not thresholds, never speedrunnable, verbs never change.
- `docs/MEASUREMENT.md` §§9–12, 14–15 bind this run.
- CANON GAP (stated, not invented): no canon doc covers the envoy→accord mechanism specifically.
  The mechanism comes from `src/js/hierarchy.js`, `scripts/policies/linkform.js` and `leadcourt.js`,
  read before designing anything: national is a polity — LEAD = primary of ≥3 seasoned
  subordinates; seasoned = link 30+ days old AND trust 40+ (formed at 30; tending lifts trust but
  is not the seasoning clock itself); one rung per season; proposeLink scores courtship
  (≥55 accepts, 35–54 counters with played terms, <35 declines); counter-terms played, never
  rolled; national/global beats are played with real costs and a REFUSE option; national is a
  live state (dissolve the realm and nationalLive clears).

## Why this arm exists

- sim-linkdrive (2026-10-24): LINKFORM=2 overcourt moved national 0/8 → 7/8 but was
  KILLED-AT-PILOT on the binding starvation guardrail (armed 5 vs control 1+2 allowance).
- Its mechanism notes say tends are NOT load-bearing on thin-pantry seeds (seed 73403 reached
  national with 0 tends, via proposals + accord answers alone).
- sim-envoyaccord proved the before-regional wall is no-proposal-made (50/50 envoy events,
  counterfactual judgeLink accept-certain).
- This arm tests whether dropping the tend ingredient (1,500 kcal/week/link) at a cap of 3 subs
  keeps the national gain without the starvation cost.

## Pairing — defined exactly (the crux)

- Control = `scripts/policies/competent.js` with no env levers.
- Armed = NEW file `scripts/policies/leanlink.js` with `LEANLINK=1` (env-gated, default-OFF:
  unset → daily delegates to `competent.daily`, no courtship at all).
- Do NOT modify competent.js, linkform.js, leadcourt.js, or any src/js. Policy-side ONLY.
- Armed daily = `competent.daily` + leanCourtship. THE DELTA vs LINKFORM=2 is EXACTLY:
  subordinate cap 5 → 3, and NO weekly tends at all. Nothing else changes: answers to pending
  counters (sweeten if pantry > 25,000 kcal else accept), accords (gift), national beats
  (shape-mapped pick), global beats (feast), defense calls (send if pop >= 5 else refuse);
  proposes from day 25, 1/day, 7-day per-village cooldown, pantry > 12,000 kcal,
  tribute 4,000 kcal/week.
- `competent.daily` contains NO scale verbs at all (verified in the proof test T1), so the
  delta armed-vs-control is the whole lean courtship, not just the cap/tend difference.
- Broken-status links COUNT as dissolutions here (the linkdrive correction): links.dissolved =
  vanished-from-hierarchyState + degraded-to-broken.

## Pre-registration (binding, §14 — judge against this, never re-score mid-run)

- Pilot seeds: FRESH band 73501–73508 × {control, armed} paired = 16 configs. Band verified
  unused before sweeping (no `s7350*` or `leanlink` file in `evidence/2026-10-24/`, no
  `perseed-leanlink/` dir at run start).
- Confirm ONLY on pilot GO: 73509–73516 × {control, armed}. No confirm spend on a pilot NO-GO.
- Horizon: 180d death-aware (dead villages stop; +10d tail max).
- PRIMARY GO: national armed ≥ 2/8 AND armed national > control national.
- Guardrails (binding — breach = KILLED even if the primary passes):
  - starvation deaths armed ≤ control + 2;
  - median survival armed ≥ 0.8 × control median;
  - no lever-caused death-mode spike (any cause with ≥ 3 deaths in armed and 0 in control must
    be named and judged).
- A GO verdict means GO CANDIDATE, default-OFF only — landing this as competent play is a
  coordinator/Steve call, NOT made by this arm. No default flips.
- Also reported: regional/table/wins, wave reach (1–5), median/max survival, death-cause
  shares, links formed, accords, counters, tends (=0 by design — verify), broken-status links
  COUNTED as dissolutions, and §14c co-primary non-scholar combat deaths.
- Balanced panel (§15): ATTEMPT `scripts/balance-panel.js`; if it cannot ingest this corpus,
  state the inapplicability explicitly and fall back to the identical-seed paired comparison
  judged by the bar above.
- Sense: at least one courtship transcript sequence read in EACH arm and judged below (sense
  runs are separate narration-on runs; their words only are judged, never their numbers).

## §14b pre-pilot substrate checklist (run BEFORE the pilot sweep)

Probe: armed, seed 73501, 60d, `perseed-leanlink/probe/s73501-armed.json` (NOT part of the judged
pilot corpus). All four checks PASS — the pilot is not measuring nothing, and the no-tend
instrument behaves as designed.

- Contact: PASS — proposals fired days 25, 26, 27 (3 links formed, all Haven-primary, trust 30
  at formation, cap 3 reached); 3 accords answered; tended = 0 exactly; rank reached `regional`
  by the day-49 weekly sample.
- Pool sizing: PASS — 3 subs formed (cap reached); trusts climb SLOWLY without tends
  (day 28 [40, 40, 40]; day 42 [42, 42, 46]; day 56 [52, 44, 48]) vs linkdrive's tend-lifted
  trajectory (day 56 [78, 90, 61]). Trusts still clear the 40 seasoning bar, but the hold is
  thinner — that thinness is exactly what the pilot measures. The 3-link cap is reachable in
  this seed's village pool.
- Verb existence: PASS — proposeLink and answerAccord fired in the probe; answerCounter /
  answerNationalChoice / answerGlobalChoice are code-present (leanlink.js, hierarchy.js) but not
  yet staged by day 60, which is expected (counters arrive on proposals, national/global beats
  only after a seasoned polity). hierarchyState read every day by the sweep wrapper without errors.
- Horizon fit: PASS — courtship from day 25, Regional Dawn at bond 21+ days (regional by
  ~day 49), links season at 30+ days (day-25 links season ~day 55), national needs regional +
  30 days (earliest ~day 79). 180d leaves ~100d of national window. Probe deaths: 12 in 60d —
  a live, dangerous world, not a quiet one.
- No-tend verification: the probe's court.tended = 0 AND the source proof (test T1) both hold;
  the pilot's armed tends must also total 0, or the arm's central claim fails.

## Pilot results (16 configs, anchor 34101b3cde24, 180d death-aware)

Paired per-seed table (gameDays = scholar day at end; 181 = survived the full 180d horizon —
day-count off-by-one, identical in both arms; `table` = progState tableWaiting OR tableDone;
`nat` = end-state rank national-or-global; `diss` = dissolutions with broken-status links
counted, per the linkdrive correction):

| seed | arm | days | end | rank | nat | table | wave | deaths | starv | villCombat | formed | maxSubs | finalSubs | diss |
|------|-----|------|-----|------|-----|-------|------|--------|-------|------------|--------|----------|-----------|------|
| 73501 | control | 181 | survived | village | 0 | 0 | 4 | 45 | 1 | 38 | 0 | 0 | 0 | 0 |
| 73501 | armed | 113 | village-lost | national | 1 | 0 | 4 | 30 | 2 | 19 | 3 | 3 | 3 | 0 |
| 73502 | control | 75 | village-lost | village | 0 | 0 | 4 | 30 | 0 | 15 | 0 | 0 | 0 | 0 |
| 73502 | armed | 103 | village-lost | regional | 0 | 1 | 4 | 31 | 0 | 13 | 3 | 3 | 3 | 0 |
| 73503 | control | 172 | village-lost | village | 0 | 0 | 4 | 56 | 0 | 43 | 0 | 0 | 0 | 0 |
| 73503 | armed | 145 | village-lost | regional | 0 | 0 | 4 | 37 | 0 | 28 | 3 | 3 | 3 | 0 |
| 73504 | control | 181 | survived | village | 0 | 0 | 3 | 42 | 1 | 26 | 0 | 0 | 0 | 0 |
| 73504 | armed | 111 | village-lost | regional | 0 | 1 | 4 | 42 | 0 | 25 | 4 | 3 | 3 | 1 |
| 73505 | control | 181 | survived | village | 0 | 0 | 4 | 31 | 0 | 21 | 0 | 0 | 0 | 0 |
| 73505 | armed | 133 | village-lost | regional | 0 | 0 | 4 | 36 | 0 | 18 | 3 | 3 | 3 | 0 |
| 73506 | control | 174 | village-lost | village | 0 | 0 | 3 | 34 | 0 | 23 | 0 | 0 | 0 | 0 |
| 73506 | armed | 181 | survived | national | 1 | 0 | 4 | 24 | 0 | 19 | 3 | 3 | 3 | 0 |
| 73507 | control | 181 | survived | village | 0 | 0 | 3 | 32 | 1 | 25 | 0 | 0 | 0 | 0 |
| 73507 | armed | 181 | survived | regional | 0 | 1 | 3 | 43 | 2 | 33 | 4 | 3 | 3 | 0 |
| 73508 | control | 180 | survived | village | 0 | 0 | 4 | 32 | 0 | 23 | 0 | 0 | 0 | 0 |
| 73508 | armed | 180 | survived | global | 1 | 0 | 4 | 31 | 0 | 24 | 3 | 3 | 3 | 0 |

Totals — control: national 0/8, regional 0/8, global 0/8, table 0/8, won 0/8, exiled 0/8;
waves 3:3 / 4:5; median survival 180.5d, max 181d; deaths 302 (scholar 65, villager 237,
villager-combat 214); starvation 3; links formed 0; court all 0 (pairing holds).
Totals — armed: national 3/8, regional 8/8, global 1/8, table 3/8, won 0/8, exiled 0/8;
waves 3:1 / 4:7; median survival 139d, max 181d; deaths 274 (scholar 65, villager 209,
villager-combat 179); starvation 4; links formed 26 (25 Haven-primary + 1 foreign-primary:
73507's village_0-primary link, the world forming links around the player);
dissolutions 1 (73504, broken kind, trust 19, day 107 — replaced the same day by a new
proposal, the cap counting active subs); court: counters 1, accords 23, national answers 6,
global answers 3, proposed 26, tended 0 (design invariant holds on every file),
defense calls 0. Zero sweep errors on all 16 files. Waves 1–2 universal (every config
reaches at least wave 3); wave 5 reached in 0/16 either arm — the pre-existing wave-5 wall,
not this arm's question.
Ever-reached color (NOT the judged metric — the pre-registered national flag is end-state):
weekly samples show 5/8 armed ever reached national-or-better (73501, 73503, 73505, 73506,
73508). 73505 touched global at day 119 then decayed to regional; 73502 and 73503 answered
national beats then decayed to regional. Realms rise AND fall without tends — the hold is
thinner, and end-state rank understates reach. (Appended to sim-findings.md as a measurement
note; the verdict below is judged on the pre-registered end-state flag, not this color.)

## Verdict: KILLED-AT-PILOT (binding median-survival guardrail breach; primary GO passed)

Judged against the pre-registered header, no re-scoring:

- PRIMARY GO: national armed 3/8 ≥ 2/8 AND 3 > control 0 → PASSES. Lean courtship (cap 3,
  zero tends) keeps a real national gain: 3 end-state nationals, 1 global, 8/8 regional,
  where pure competent reached 0/8 on every scale rung.
- Starvation guardrail: armed 4 ≤ control 3 + 2 = 5 → PASSES. Detail: the 73501 day-16
  scholar starvation recurs IDENTICALLY in both arms (substrate, pre-courtship). Armed-only
  starvation deaths are 3 (73501 d67 villager; 73507 d163 + d167 villagers) vs control-only 2
  (73504 d171, 73507 d50) — net +1, inside the +2 allowance. The tend ingredient's removal
  did what it was supposed to do on the starvation bar: linkdrive's breach (+4) is gone.
- Median-survival guardrail: armed 139d ≥ 0.8 × control 180.5d = 144.4d? NO — ratio 0.77 →
  BREACH. Binding rule: breach = KILLED even if the primary passes. Verdict is therefore
  KILLED-AT-PILOT. No confirm spend: pilot NO-GO means the 73509–73516 confirm band is NOT
  run, per the header.
- Spike guardrail: "the night" 3 armed / 0 control — NAMED and judged NOT lever-caused.
  All 3 are scholar deaths at night (73503 d33, 73504 d94, 73505 d85) — ambient scholar
  mortality in a dangerous world, not a courtship verb: scholar death totals are IDENTICAL
  across arms (65 vs 65), and control's scholar deaths carry other labels (combat/arena).
  The spike clause's "if lever-caused, KILLED" does not trigger on it. (Caveat: the median
  kill stands on its own regardless — this judgment only clears the spike clause.)
- Kill classification (§14a): GUARDRAIL KILL, not concept-dead on the primary and not a
  starvation kill. The concept (lean courtship moves national off 0 without the starvation
  cost) succeeded on both its own terms; the pre-registered survival bar failed. The median
  breach deserves its own honesty note: armed villages are lost EARLIER (5/8 village-lost,
  median 139d) while suffering FEWER total deaths (274 vs 302) and identical scholar deaths
  (65 vs 65). Villages are lost earlier without more villagers dying — village-lost timing
  and death counts diverge, which is why the median-vs-counts question was appended to
  sim-findings.md as an open metric question rather than answered here.
- A GO verdict would have meant GO CANDIDATE, default-OFF only. This run does not reach it:
  nothing lands as competent play, no default flips, and the leanlink policy file stays
  env-gated and default-OFF as built (it lands only as an instrument + this evidence, per
  the killed-arm rule that the lever leaves no live trace — the file itself is the
  documented instrument, inert unless LEANLINK=1).

## Mechanism: what the lean hold costs and where it bites

- Trusts climb without tends, but slower and thinner: probe trajectory day 28 [40,40,40] →
  day 56 [52,44,48] (vs linkdrive's tend-lifted [78,90,61]). The lift comes from the
  tribute-refusal (+1/week when shelves are full), fire-network food gifts (+4), and the
  First Court feast (+10 each) — visible verbatim in the sense transcript. On rich seeds
  trusts still reach 90+ (73506: [96,72,94] at day 175, survived at national). On thin seeds
  they decay: 73507 ends with trusts [4,47,1] and pantry 238 at day 168, yet survives at
  regional — a realm held by a thread, not dissolved. 73504's single broken link (trust 19)
  is the thin-hold failure made concrete — and the cap-3 replacement the same day shows the
  courtship re-filling a lost seat without tends.
- The table nuance repeats (linkdrive): all 3 armed table flags sit on final-rank REGIONAL
  seeds (73502, 73504, 73507) — the table prices the run, it is not national-gated.
  Won = 0/16 in both arms: table waiting ≠ win. No arm takes the table seat; the
  take-the-table policy remains the next blank (already in sim-findings.md from linkdrive).
- Defense calls: 0 staged in all 16 configs — that courtship ingredient is unmeasured in
  this band, not proven absent from the game (same as linkdrive).
- Counters: only 1 counter in the whole armed corpus (73507) — nearly every proposal in
  this band is accepted outright, so the counter-answering ingredient is thinly measured
  too (linkdrive had 2).

## Metric review (§14 — required; revisions apply to the NEXT run, never this one)

- Metrics held: primary + guardrails judged exactly as pre-registered; no re-scoring. The
  ever-reached color (5/8) was reported alongside but did NOT move the verdict — the
  pre-registered national flag is end-state (3/8), and 3/8 already passes the primary, so
  the color changes nothing about the outcome either way. The spike clause was applied as
  written (named + judged, not lever-caused, so non-killing).
- Proposed revisions for the NEXT run (not applied here): (1) median survival should be
  paired with a death-count view — this run's median breach with fewer total deaths shows
  the two bars can disagree, and the pre-registration should say which binds when they do
  (appended to sim-findings.md as an open question); (2) report ever-reached rank
  alongside end-state rank as a pre-registered secondary (transient realms are real reach);
  (3) starvation guardrail should count arm-only deaths (the matched 73501 d16 scholar death
  pollutes both sides, as in linkdrive); (4) table should split tableWaiting vs tableDone;
  (5) defense-call staging should be verified as a precondition before counting it as a
  courtship ingredient (0/16 here, 0/16 in linkdrive); (6) links.dissolved now counts
  broken-status links (this run's correction of linkdrive) — keep that definition.
- Balanced panel (§15): ATTEMPTED and INAPPLICABLE, mechanically proven — running
  `scripts/balance-panel.js --policies leanlink` fails before any sim with
  "Error: Unknown policy leanlink" (POLICY_REGISTRY has `competent` but no `leanlink`;
  LEANLINK env is not a panel input; panel before/after is Game-root based while this lever
  is env-based). Same finding class as the linkdrive/singletier/foreignhelp panel
  inapplicability. Fallback used, as prescribed: the identical-seed paired comparison judged
  by the pre-registered bar. No panel output was written (the attempt failed before any sim).

## Sense verdict (SENSE-TESTING LAW: meaning, coherence, relevance, consequences)

Sense runs are separate narration-on runs (seed 73501, 100d); their WORDS only are judged,
never their numbers.

- ARMED transcript (73 tight-filter lines): a coherent courtship story WITHOUT tends — and
  the transcript itself names the trade. Day 25/26/27 — "⛓️ Larisa brings it home: Emberhold
  bows to Haven — one organization, us primary. Tribute: 4,000 kcal/week. The relationship
  starts at trust 30. Everything from here is earned." Day 27 — "Three fires bow to Haven. But
  a realm isn't leverage — it's seasons. These bonds are young; tend them, keep the trust,
  and the court will come." Day 46 — Regional Dawn: "One fire was a village. Two fires is a
  NETWORK. Coordination layer: online... Try not to starve twice as fast." Day 67 — the
  succession test, with real diplomatic consequence: "Emberhold watches to see if Haven holds
  without its dead — and presses the tribute down to 3,000 kcal/week while the chair is empty.
  They'll test the link. Count on it." Day 68 — the drift warning the lean hold earns:
  "Stonebridge's fire is drifting from ours — their speaker doesn't linger at the gate the way
  they used to, and nobody over there says why. Bonds don't mend themselves; a tended fire
  remembers who fed it." Day 84 — First Court, day 85: "The shared granary opens: 5,000 kcal
  for every fire of the realm, no strings. Emberhold, Stonebridge, Thornfield count it — and
  remember who fed them first. (Trust +10 with each.)" ZERO tend-action lines in the whole
  transcript (no "Haven sends 1,500 kcal" line anywhere) — the no-tend design is visible in
  the words, not just the counters. VERDICT: SENSICAL — the courtship reads as played
  diplomacy with a named cost (drift) for skipping tends, not a meter.
- CONTROL transcript (31 tight-filter lines): ZERO Haven courtship lines — no proposes, no
  links, no tends, no court (the keyword scan's only hits are "Gossip Network," a skill
  name, not courtship). The village learns, teaches, feasts, and plays a real contest
  (The Oath, with binding-oath stakes narrated on camera, won: "your moot crowd +6"). Day 90
  — the game tells the silent village exactly what it lacks: "THE TABLE — the ring of pale
  light flickers at the edge of the sky... and does not come. Not yet. The table is being set
  for those whose deeds are done, and yours are not done. The ledger still wants: a regional
  standing; the food-thesis deeds." VERDICT: SENSICAL — and the contrast is the finding:
  the control village is told, in-world, that regional standing is the missing deed, while
  never being offered a way to earn it.
- Repetition notes (documented, not chased — the finding is already in sim-findings.md from
  linkdrive; this run CONFIRMS it with new speakers): "My kid asked if the watchers have
  favorites" repeats verbatim across Miguel, Hassan, Liam (armed) and Valentina, Candice,
  Hassan, Mia (control). Same line, different villagers, both arms.

## Village assessment (assessor's account)

- What the villages looked like: control villages stay single-fire villages — they survive
  the full 181d or die at ~75–174d, never link, never hear a court, and are told at day 90
  that the table wants a regional standing they never pursue. Armed villages become realms
  without ever sending a tend: 3 links in every seed, trusts climbing on refused tribute
  (+1/week), neighbor food gifts (+4), and the First Court feast (+10) — then most still
  lose the village (5/8 village-lost) while holding rank, and the survivors hold realms
  (73506 national, 73508 global) with trusts intact. The scale wall moved twice over: from
  "never reach national" (0/8 control here) to "reach national/global routinely" (3/8
  end-state, 5/8 ever) — but not to "hold it and live," which is where the median guardrail
  bites.
- Who thrived and why: rich-pantry realms that held trusts ≥ 40 through the seasons (73506
  survived at national with trusts to 96; 73508 survived at global with trusts 56–77).
  Who died and why: thin-pantry realms whose trusts decayed (73507's [4,47,1]) or whose
  villages were lost mid-climb (73501/73502/73503/73504/73505, days 103–145) — of combat
  attrition and scholar succession churn, not starvation (starvation is 4 deaths total).
  The dead armed villages die WITH their realms in most cases (final ranks national on
  73501, regional on the rest) — the realm outlives the village's luck, not its pantry.
- What knowledge/capabilities were missing: the win itself, again. No arm takes the table
  seat; the beat-answering policy stops at waiting (3/8 table waiting, 0/16 wins). And the
  hold: without tends, realms decay — the drift warning is honest, and 73504's broken link
  is the decay priced. The next blanks are a take-the-table policy and a hold mechanic
  cheaper than 1,500 kcal/week/link but stronger than +1/week refusals — not a stronger
  courtship drive.
- Blank filled or documented: DOCUMENTED, not fixed — and deliberately so. A kill leaves no
  live trace of the lever (leanlink.js stays env-gated, default-OFF; no src/js changes; no
  defaults flipped). What lands is the instruments + this evidence + the proof test
  documenting that (a) lean courtship moves national off 0 (3/8 end-state, 5/8 ever) with
  zero tends, (b) its starvation cost passes the bar linkdrive breached (4 vs 5 allowed),
  (c) its survival cost fails the median bar (139d vs 144.4d required), and (d) the hold
  without tends is real but thin (drift warnings, one broken link, transient realms).

## Infrastructure notes

- Writes: all 16 pilot JSONs went through the chunked writer subprocess
  (scripts/sim-postunlock2-b-writer.js, read-only reuse — hash-verified). The 73508 armed
  file failed 24 consecutive writer attempts across three runs with the container EPERM
  write flap (EPERM: operation not permitted, write) while shell/python probes passed
  between windows; it landed on the fourth run when the window passed. The flap is
  time-varying with minute-scale windows — the sweep's writer retries were raised from 8
  to 40 attempts (up to 30s backoff) so a future run outlasts a window instead of
  exhausting inside one.
- Writer bug found and FIXED (instrument, not lever): the writer chunked the body by
  UTF-16 string units, so an emoji surrogate pair straddling a 1024-unit boundary was split
  and each half encoded to U+FFFD — corrupting the file and failing the read-back hash
  deterministically. That is what killed the first two control sense runs ('hash mismatch'
  on every attempt, while smaller bodies passed). The writer now chunks by UTF-8 bytes
  (never splits a code point); verified with an adversarial body placing an emoji pair
  across every chunk boundary (byte-identical round-trip). The control sense run then
  wrote first try. Pilot corpus files are unaffected (their bodies carry no sayLines text
  and every file's hash was verified at write time; the proof test re-validated all 16
  after the writer change).
- Determinism: the 73508 armed run was executed four times (three lost to the flap, one
  landed); the landed run's numbers are the run's numbers — the sim is deterministic on
  seed+anchor, and no judged number comes from a lost attempt.
- Proof: `node scripts/test-sim-leanlink.js` — TEST-OK (T1 pairing/delta source proof,
  T2 corpus completeness, T3 recomputation; re-run green after the writer change).
- No confirm spend (pilot NO-GO). No [needs-eyes] on the landing commit: the verdict is
  KILLED, and nothing in this commit changes feel, combat, or UI (instruments + evidence +
  proof only, plus the writer byte-chunk fix, which changes no game behavior).
