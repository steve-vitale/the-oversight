# sim-diplo-verb-b — PREREG (DIAG arm: which leadfeast verb seasons a link)

Run: fleshout-loop-b-20261114T1130Z (Loop B), arm sim-diplo-verb-b
Axis: winnability chain. This arm decomposes a MEASURED divergence — it
changes nothing in the game.
Branch: sim-diplo-verb-b — worktree ~/workspace/worktrees/sim-diplo-verb-b
Base: master 237fb445f
Date: 2026-11-14

## The finding (#2321 follow-up, sim-capablewinpath-b §3)

Competent's diplomacy standing is **0 on 16/16 runs** (even the two
150-day survivors), while capable reaches **median 102 at the win**
(14/16 non-zero; multiples of 34, i.e. 3–6 seasoned regional+ links).
Competent reaches regional scale (via links) but its links never season
into regional+ polities, so they score no diplomacy standing. Open
mechanism question: **which leadfeast verb seasons a link — tend? feast?
devotion channel?** — and what does competent do differently that it
never seasons one? This DIAG is the prerequisite for the scale-climb
lever (next blank #2 in the 1030Z round): the scale-climb lever must not
be built on an unmeasured mechanism.
Grounding: evidence/2026-11-14/sim-capablewinpath-b.md §3 and
evidence/2026-11-14/perseed-capablewinpath-b/ (32 per-seed JSONs).

## CORRECTION (2026-11-14, before the pilot judged — background fact, bars unchanged)

The "already known" section above misstates the engine mail drive: it
says `_answermailDriveDaily()` auto-answers the accord and auto-tends
Haven-primary links "for EVERY policy". WRONG. The drive is DEFAULT-OFF
(`src/js/hierarchy.js:3892-3894`: fires ONLY when `ANSWERMAIL_DRIVE=1`;
sim-diplo-a 2026-11-10, sim-findings line 2091: "the only engine caller,
_answermailDriveDaily, fires only when ANSWERMAIL_DRIVE=1 (off by
default). In default play the Regional Dawn's opening gift never
happens"). This pilot runs env defaults (ANSWERMAIL_DRIVE unset), so
there are NO engine tends and NO auto-accord answers on either leg —
`state.answermailDrive` will be null throughout, and every tend / accord
answer the recorder sees is policy-side (capable) vs none (competent).
Consequences for the guesses:
- H4's premise is FALSE under default env: the first link does NOT get
  +10 at formation for both policies — it gets it only if the POLICY
  answers the accord (capable's leadCourtship does; competent never
  does). If competent's first link never reaches 40, the missing accord
  gift is part of the mechanism, not a shared baseline.
- H3's "engine auto-tend both policies get" is FALSE — delete it. The
  pantry-gated auto-tend exists only when the drive is armed; under
  defaults the ONLY tend source is the policy (leadfeast, pantry >
  20,000 kcal). Competent's zero is then a pure policy gap: no propose,
  no tend, no accord answer — plus whatever the formation side shows.
- Prior art agrees: sim-trustgrowth-b (2026-11-09/10, sim-findings line
  2032) attributed trust growth under competent play to aid + tribute
  ONLY (tend 0, accord 0, renegotiation 0); sim-secondlink-a (line 2061)
  proved the first link comes from the meta-progression ladder stage-3
  reward (`_ladderRewardLink` → `_formLink`), not from a raise — the
  recorder's formation `via` field must confirm or refute that on this
  band (ladder reward logs as `engine-direct`).
No GO bar moves: G1/G2 still require full attribution and a named
mechanism; the correction only fixes which side of the ledger the
accord/tend verbs sit on.

## What is already known (read before the run — code, not guess)

- Diplomacy arithmetic (`src/js/standing.js` `villageStanding()`):
  diplomacy = 34 × (seasoned REGIONAL+ links). A link counts only when
  BOTH hold: seasoned (`hierarchy.js` `_linkSeasoned`: 30+ days old AND
  trust 40+, conquered links need the season only) AND regional+
  (`_linkRegionalPlus`): LEAD — one of Haven's seasoned subordinates
  while `polityOf('haven')` exists (≥3 seasoned subordinates, a realm);
  BELONG — Haven subordinate while `polityOf(primary)` exists; LEAGUE —
  a seasoned covenant/trade peer inside its league polity. A lone
  seasoned bond scores 0. Capable median 102 = exactly 3 counted links.
- Links form at trust 30 (`hierarchy.js` `_formLink`: "The relationship
  starts at trust 30. Everything from here is earned."). Seasoning needs
  +10 trust held for 30 days.
- The trust verbs (engine, `src/js/hierarchy.js`):
  - `tendLink(linkId)` — "send grain": 1,500 kcal → +8 trust via
    `_trustGain`, once per week per link (`tendedWeek`), Haven-primary
    links AND covenant/trade peer links; BELONG links refuse. Refuses
    during their mourning; refuses when the pantry is bare.
  - `answerAccord('gift')` — the first gesture: 2,000 kcal → +10 trust,
    once, on the FIRST link only (`stageFirstAccord`, `pendingAccord`).
    The engine's own `_answermailDriveDaily()` (inside `hierarchyDaily`,
    runs for EVERY policy) auto-answers the accord with 'gift' AND
    auto-tends Haven-primary links weekly when pantry > 20,000 kcal
    (`state.answermailDrive`: `tends`, `tendsBlockedPantry`,
    `accordAnswers`). So competent's links ARE tended by the engine —
    when its pantry clears 20k.
  - Weekly tribute tick: a Haven-primary subordinate paying in full
    +1 trust/week; partial −1; nothing −2 (arrears accrue). A
    Haven-subordinate link paying its own tribute in full +1/week;
    shortfall −6. Demands refused −15; renegotiation gift answers
    restore. Succession haircut −8 per link; neglect snap breaks a link
    at trust < 20 + neglected.
  - `payTribute` — Haven-as-subordinate tribute (BELONG road); does not
    raise trust by itself (the +1 is the weekly tick's full-payment
    credit).
- The policy verbs (both policies share the competent base):
  - Capable = leadfeast = leadcourt + r13 feast layer
    (`scripts/policies/feastscale.js`, `leadcourt.js`): answers accords /
    counters / national / global beats; **tends Haven-primary links
    weekly when pantry > 20,000 kcal** (same verb, same bar as the
    engine drive); **proposes villages as subordinates from day 25**,
    one/day, pantry > 12,000 kcal, until 3 subs stand; answers defense
    calls. `proposeLink` score ≥55 forms the link, 35–54 stages a
    counter, <35 declines.
  - Competent (`scripts/policies/competent.js`) contains ZERO scale
    code by design (the scale-free baseline): it never proposes, never
    tends, never answers accords. Its ONLY link verbs are the ones the
    engine and the conversation force on it: `answerPendingCounter`
    (env-gated COUNTER_ANSWER, default OFF) and accepting villager
    link-raises in conversation (`bond-initiation.js`
    `acceptLinkRaise` → `proposeLink`; the menu owns only
    `link:accept`/`link:decline`/`leave`/`silence` once the raise is
    spoken, and competent's `pickTalkChoice` falls through to `live[0]`).
    Competent also channels devotion (106× on 98801) and feasts
    (4× on 98801) — both food verbs, no link effect in code.
  - `channelDevotion` (competent.js:419): practices a keepsake toward
    the devotion lane — arms the feast surge (`prog.feastSurge`). No
    link/trust effect anywhere in code. `hostFeast` feeds the plenty
    standing source (quality feasts), not trust.
- Competent 98801 (capablewinpath corpus): first regional day 76, seat
  lesser day 76, end day 147 survived-regional, standing raw 355
  (war 275 / diplomacy 0 / plenty 80), `standing.links` 0 at end.
  Capable 98801: diplomacy 102, `standing.links` 3 at the win (day 90).
  The capable win truncates its leg at ~day 90; the competent leg runs
  to 150d or death. Diplomacy is read at the win for capable and at
  end-of-run for competent — both reads dated in the evidence.

## Prior guesses (to test, not to assume)

- H1 — THE VERB IS TEND: `tendLink` (+8/week, the only repeatable
  trust source that moves a link 30 → 40 inside one season) seasons
  links; the accord gift (+10, first link only) and the tribute tick
  (+1/week) are too small or too narrow to carry a link alone. Feast
  and devotion channel do NOT touch links (feast → plenty; devotion →
  feast surge) — the recorder must show zero link-trust deltas
  attributable to them.
- H2 — THE COUNT IS THE POLITY GATE, NOT SEASONING ALONE: competent
  may season 1–2 links but never 3 simultaneously, so diplomacy stays
  0 even when a link seasons — the polity needs 3 seasoned subs at
  once, and the recorder must say per link whether it seasoned and
  whether a polity ever stood.
- H3 — COMPETENT'S FAILURE IS FORMATION + PANTRY, NOT TENDING
  ABSENCE: competent forms links only when a villager raises one in
  conversation (late, few, one at a time), while capable proposes from
  day 25 until 3 subs stand; AND the engine auto-tend both policies
  get is pantry-gated (>20k kcal), so competent's tends are blocked
  exactly when its pantry runs thin — its links then decay on tribute
  shortfalls (−1/−2/week) and break or sit under 40.
- H4 — THE ACCORD GIFT IS NOT THE DIFFERENCE: the engine auto-answers
  the first accord with 'gift' (+10) for BOTH policies, so the first
  link reaches 40 on formation day for both — if competent's first
  link still never counts, the failure is later (decay, break, or the
  3-sub polity gate), not the opening gift.

## Primary metric + GO bars (binding, §14)

The primary is ATTRIBUTION COMPLETENESS — this is a DIAG arm, not a
lever: there is no before/after and no win-rate bar to move.

- G1 INSTRUMENT VALIDITY — GO iff the recorder captures a full per-day
  link roll on all 16 configs (8 seeds × competent/capable), 0
  instrument errors, EVERY diplomacy point on the capable leg is
  attributed to a named link + the verbs that seasoned it (0
  unattributed points), and EVERY link on both legs is classified
  (seasoned-and-counted / seasoned-but-no-polity / broke-<reason> /
  never-seasoned-<bar> / still-young-at-end) — zero UNCLASSIFIED links.
  Any instrument error, unattributed diplomacy point, or unclassified
  link = NO-GO.
- G2 ATTRIBUTION — GO iff the evidence file carries a VERB ATTRIBUTION
  TABLE (per verb: calls, trust deltas, links seasoned, diplomacy
  points carried) with per-seed numbers on all 8 seeds, names THE verb
  that seasons links, and names THE mechanism for competent's zero
  (formation gap / pantry-blocked tends / decay / break / polity gate —
  whichever the numbers show, with per-seed counts). A table without
  per-seed numbers, or a mechanism named without the numbers behind it
  = NO-GO.
- G3 INSTRUMENT-ONLY — GO iff zero `src/js` changes in the branch diff
  and the proof test (`scripts/test-diploverb-b.js`) is green. Any
  src/js change = NO-GO.

Guardrail (§14c): villager (non-scholar) combat deaths are a co-primary
read on every seed — a decomposition that ignores the roster is
incomplete even if G1–G3 pass.

## Method (staged, §§9–12, 14–15)

- STAGE 0 SMOKE (2 seeds × 2 policies): does the recorder capture a
  full daily link roll, do the verb wrappers log trust deltas, does the
  classifier assign every link? Fix wiring, not thresholds.
- STAGE 1 PILOT (8 seeds × 2 policies = 16 configs, 150d death-aware,
  identical seeds): the judged run. Horizon 150d because the finding's
  band is 150d and capable wins ~d90 while competent grinds to 150d or
  dies (§10: reachability lever, 150–200d). Seeds (exact literals):
  98801, 98802, 98803, 98804, 98805, 98806, 98807, 98808 (the
  capablewinpath band). Policies: competent verbatim vs capable,
  identical seeds, same process shape as
  scripts/capablewinpath-driver-20261114.js.
- ENV: defaults, matching the capablewinpath reproduction run —
  COUNTER_ANSWER unset (competent answered 0 counters on 16/16 seeds
  in that corpus), COMPETENT_FLEE_REPAIR unset. No other env.
- CONFIRM (12–16 seeds) ONLY if the pilot attributes cleanly (G1+G2
  hold on 8 seeds). Otherwise the pilot IS the result and the evidence
  says so.
- RECORDER (driver-side only, in scripts/): reuses the capablewinpath
  driver pattern (policy wrapper snapshot after each `daily()`, deduped
  by game day; `Game.say` capture). NEW for this arm, daily snapshot
  adds the LIVE link roll: `Game.hierarchyState()` per link (id, other
  village, kind, primary, subordinate, status, trust, formed day, age,
  conquered, tribute/week, arrears, tendedWeek, pendingDemand,
  pendingRenegotiation, seasoned via `Game._linkSeasoned`,
  regional+ via `Game._linkRegionalPlus`), `Game.polityOf('haven')`
  (shape/size or null), `Game._havenPolity()` shape, `Game.scaleRank()`,
  `state.networkLiveDay`, `state.answermailDrive` totals (engine tends,
  blocked tends, accord answers), `state.pendingCounter` presence.
  VERB WRAPPERS (log call + before/after trust + result + caller tag:
  policy-daily vs engine-daily, via an in-daily flag on the policy
  wrapper): `tendLink`, `payTribute`, `proposeLink`, `answerCounter`,
  `answerAccord`, `answerNationalChoice`, `answerGlobalChoice`,
  `answerRenegotiation`, `answerDemand`, `proposeCovenant`,
  `proposeTrade`, `bidForPrimacy`, `raidVillage`, `hostFeast`,
  `breakLink` (log breaks with reason + age/trust at break),
  `_formLink` / `_formPeerLink` (log formations with the forming verb's
  context). `villageStanding()` raw split read daily (pure read).
  `villageStandingTotal()` read ONCE at end-of-run (rageprecheck
  precedent — never called daily). Zero `src/js`.
- LINK CLASSIFICATION (per link, at end of run): seasoned-and-counted
  (seasoned AND in a polity at some day — diplomacy points carried,
  counted) / seasoned-but-no-polity (seasoned, never in a polity) /
  broke-<reason> (breakLink reason + age/trust at break) /
  never-seasoned-<bar> (the bar that never cleared: age <30 at end, or
  trust <40 at end — named from the last snapshot) / still-young-at-end
  (formed <30 days before the run ended). A link matching none of these
  is UNCLASSIFIED and fails G1.
- NO BALANCED PANEL (§15, methodology note from the rageloop finding):
  `scripts/balance-panel.js` compare refuses policy/harness changes,
  so a policy contrast cannot be judged through the compare path —
  the driver's identical-seed numbers are the deciding instrument, not
  the panel compare. Corroboration instead: the pilot's end-state
  columns (days, endReason, won, maxWave, standing, waveKills) checked
  against the capablewinpath corpus
  (evidence/2026-11-14/perseed-capablewinpath-b/) on the same 8 seeds;
  exact match is NOT required — the check is evidence, never the judge.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures in this
  arm — the recorder observes the policies' own play; nothing is staged.

## Verb attribution the recorder must rank (per-seed numbers each)

1. Per link: formation day/kind/formed-by (policy propose / villager
   link-raise accept / counter answer / ladder reward / peer proposal),
   trust trajectory (day trust crossed 40, day it seasoned, day it
   un-seasoned if it did), break day + reason if it broke.
2. Per verb: calls, trust deltas summed, links moved 30→40 by it,
   diplomacy points carried. Verbs: tendLink (policy vs engine drive,
   split), answerAccord gift, tribute tick +1s, demand/renegotiation
   answers, payTribute, hostFeast, devotion channels (counted from ctx
   — must show 0 link deltas).
3. Polity days: first day `polityOf('haven')` (or any `_havenPolity`)
   stood, shape, size; diplomacy points by day (the day each +34
   landed and which link carried it).
4. Competent's zero, decomposed per seed: links formed (count + days),
   links seasoned (count), links broken (count + reasons), max
   simultaneous seasoned subs, engine tends vs blocked tends
   (pantry), policy tends (0 by design — verify).
5. Raw standing split (war/diplomacy/plenty) AND the day read — at
   first-seat day AND at end-of-run/win day, both policies.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival — reported
for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the tending / seasoning / polity lines the recorder captures
(the tend line, the "Three fires bow" line, the drift warning, the
break line) and judge whether the courtship reads like a played
relationship or a silent meter. Read villager dialogue in the captured
lines where present; judge meaning and coherence, never just counts.

## Evidence

- Prereg: this file.
- Driver: scripts/diploverb-driver-20261114.js (new).
- Analyzer: scripts/analyze-diploverb-b.js (new).
- Proof: scripts/test-diploverb-b.js (new; static + game sections).
- Per-seed JSON: evidence/2026-11-14/perseed-diploverb-b/ (16 files).
- Evidence: evidence/2026-11-14/sim-diplo-verb-b.md (per-seed tables,
  verb attribution table, wall numbers, sense-testing, metric review).
- Reproduction check: against perseed-capablewinpath-b/ on seeds
  98801–98808.

## Convergence state

DIAG — no lever, no convergence verdict. The arm documents; the fix
(if any) is a later arm's prereg. If the verb is pinned, annotate
finding #2321's diplomacy-0 follow-up in hidden_files/sim-findings.md
as ANSWERED.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did G1/G2/G3 measure the attribution,
or did the metric prove wrong (bad proxy, blind channel)?
