# Trust-growth + polity probe — PRE-REGISTRATION (arm sim-trustgrowth-b)

Run: fleshout-loop-b-20261110T0122Z (Loop B). The diplomacy half of
the standaccum-b split (sim-findings #2032). Committed BEFORE any
judged computation. DIAG ONLY, zero src/js — a recorder/instrument,
no game change. Do NOT move readyDemand numbers or any win
price/deed gate. If the implied lever is a build (trust growth,
polity formation, second-link road), it is NAMED in the evidence,
not built here.

## Canon read before this prereg

- `docs/CANON.md` (manifest). No canon doc covers link-trust
  growth or polity formation as a system; the mechanics below are
  grounded in code, not invented canon. `docs/MAP.md` (region
  registry) and `docs/CONVERSATIONS.md` are background only.
- `src/js/hierarchy.js` header (verified in code, not assumed):
  seasoned = active + 30+ days old + trust 40+ (conquered links:
  season only); `polityOf('haven')` needs >= 3 seasoned
  subordinates; national is a live state with six roads (LEAD /
  BELONG / COVENANT / TRADE / CONQUEST / REFUSE). Trust gains are
  choked through `_trustGain` (mourning blocks, gains stamp
  `lastKeptDay`); no silent side-channel gains.
- `src/js/standing.js` `_linkRegionalPlus`: a seasoned link counts
  toward diplomacy only inside a polity (LEAD via
  `polityOf('haven')`, BELONG via `polityOf(primary)`, seasoned
  covenant/trade league). A lone seasoned bond scores 0.
- Trust movers inventoried in code (hierarchy.js, all verified by
  grep before this prereg; line numbers drift, names do not):
  GAINS (all via `_trustGain`): `tendLink` +8/week (1,500 kcal,
  once per week per link); weekly tribute full pay +1, deposit-gate
  waiver +1; arrears full settlement +3; accord first gesture
  gift +10 / visit +8 / word +4 / nothing 0; demand honored
  (proportional, up to +8); prove-worth +1..6; oath +2..12;
  iron-court answers +3/+6/+8; renegotiation answers +2/+5;
  covenant/trade answers +6/+8; BELONG-direction weekly tick
  settled +1 (their tribute TO Haven is paid by the player —
  `payTribute`, +3 on a full week). LOSSES (direct writes, each
  with a `_linkNote` kind): tribute partial -1 / nothing -2 /
  BELONG-direction short -6; sabotage -4; succession haircut -8;
  demand refused -15; renegotiation/bid -5/-10; iron-court
  refusal -12; pool short -4; tariff -3/-5; neglect snap (link
  breaks; trust < 20 + no upkeep 14+ days).
- Policy facts (verified by grep): plain `competent`
  (`scripts/policies/competent.js`) contains ZERO scale code by
  design — no `tendLink`, no `proposeLink`, no
  `pendingCounter`/`pendingAccord` handling. `leadcourt.js`
  (the LEAD-road policy) tends weekly when pantry > 20,000 kcal
  and answers pending offers — competent does NOT. So under
  competent verbatim, the only trust movers are engine-side
  (weekly tribute ticks, arrears, succession, demands) plus
  whatever villagers do on their own.
- Link formation under competent (not assumed — recorded, see
  Method): villagers initiate bonds on their own (Steve ruling
  2026-11-04 22:32 CST, landed 2026-11-06; `bond-initiation.js`:
  `npcBondTick` / `npcPairBondTick` / `npcLinkRaiseTick`; an NPC
  raises a link idea and the player proposes via
  `acceptLinkRaise`). How the single link per village forms under
  competent verbatim is part of what this probe records
  (formation day, far end, direction, born trust, surrounding
  say-lines) — not assumed in advance.

## The pattern, pinned from cited evidence (what it IS)

`evidence/2026-11-09/sim-standaccum-b.md` (same band, current
master, run fleshout-loop-b-20261109T2307Z): every seed forms
exactly ONE link (maxLinkTotal 1 on all 8; Nov-4: 0 links ever),
born Haven-primary over a subordinate village at trust 30–34,
then trust DECAYS (30 → 23, 30 → 4, 30 → 26, 34 → 11, 30 → 0,
30 → 0, 30 → 17). Diplomacy reads 0 on every snapshot of every
seed. Only 99104 ever seasoned (trust 42–45, age 30–53, seasoned
d73–d100) and it scored 0 throughout because it is not-regional+:
no `polityOf('haven')` exists, and the LEAD gate needs a polity
(>= 3 seasoned subordinates). One link can never be a polity.
Sim-findings #2032 (DIPLOMACY FORMS BUT NEVER COUNTS, supersedes
#1732). Older context: #1679 (diplomacy holds or collapses, never
flickers; every drop a weakest-link trust-unseason after a
pantry-gated tending gap — LEAD-road policy, not competent),
#1680 (zombie-link trap: trust-0 link still counts as active
subordinate, no re-proposal), #1690 (tend-through prevents but
does not recover), #1733 (competent never offers a bond on any
channel — Nov-4 master; SUPERSEDED in the formation sense by the
villager-initiated bonds that now form 1 link/village).

## Primary questions

1. What, if anything, moves link trust UP under competent play?
   (Per link-day: every positive trust delta attributed to a
   cause — tend / tribute / waiver / arrears / accord / demand /
   oath / court / renegotiation / other — or marked unattributed
   with a count.)
2. What forms a polity (or why does none form)? (Per village:
   links formed, seasoned count, `polityOf('haven')` ever,
   covenant/trade/belong polities ever, scale rank reached.)

## DIAG-GO bar (binding — judge only against this)

DIAG-GO iff ALL of:
1. All 8 seeds' links classified by trust-trajectory class
   (precedence-ordered list below; the analyzer assigns by rule,
   never by hand). A seed with zero links is classified
   `no-link` (a class, not a failure of the instrument).
2. Every trust-up event attributed: for every link-day with
   positive trust delta, the logged `_trustGain` applications
   that day reconcile with the delta (sum == delta, or the
   discrepancy is listed with its reason, e.g. trust cap 100),
   AND every gain event carries a cause label from the cause
   list below or the label `unattributed`, with counts reported
   per cause. Unattributed gains are counted, not hidden.
   (Negative deltas are attributed the same way via the link's
   same-day history entries; unattributed downs are counted too,
   but the bar binds on ups.)
3. The polity-formation question is answered with counts: links
   formed per village, seasoned links per village, villages with
   a polity ever (`polityOf('haven')` / belong / covenant /
   trade), and the single blocking reason per village (too few
   links / links never season / seasoned but no polity / other),
   computed by rule from the daily snapshots.
4. Instrument errors 0 on all 8 seeds.
A miss on any clause is NO-GO (reported as DIAG-NO-CANDIDATE
with the partial accounting, exactly as standaccum-b's split
was), never re-scored against a friendlier metric mid-run.
Metric problems go under "metric review" for the NEXT run.

## Trajectory classes (per LINK, precedence order — first match wins)

1. `seasoned` — seasoned ever (age >= 30 AND trust >= 40 on
   some daily snapshot).
2. `rises` — peak trust >= born trust + 10, never seasoned.
3. `decays` — end trust <= born trust − 10 (end = last observed
   trust while active; a link broken before the horizon end uses
   its last active trust).
4. `holds` — everything else (never climbed 10, never fell 10).
Born trust = trust on the first snapshot where the link appears
(normally 30). A seed's classification is the multiset of its
links' classes (normally one link; if a village forms more, all
are listed). Link breaks are recorded separately (broke day +
last trust + history 'broken' note), not as a class.

## Cause list (gain events, from the `_trustGain` call stack)

`tend` (tendLink), `tribute-full` (weekly full pay +1),
`tribute-waiver` (deposit-gate waiver +1), `arrears-settle`
(+3), `accord-gift` / `accord-visit` / `accord-word`,
`demand-honor`, `prove-worth`, `oath`, `iron-court`,
`renegotiation-answer`, `covenant-answer`, `trade-answer`,
`belong-tribute` (BELONG-direction weekly settled +1),
`paytribute-full` (+3), `succession-grace`, `other-named`
(stack names a Game method outside the list — named in the
report), `unattributed` (stack unparseable or no caller found).
Down causes (from same-day history kinds): `tribute-thin`,
`tribute-nothing`, `arrears-short`, `sabotage`, `revolt`,
`succession`, `demand-refused`, `pool-short`, `tariff`,
`renegotiation`, `iron-court-refusal`, `drift` (note only, no
trust move — never counted as a cause), `unattributed-down`.

## Method

- Policy: `scripts/policies/competent.js` `{competent}` verbatim,
  default env. No policy variants — this is a diag, not a lever.
  (Leadcourt is deliberately NOT used: the question is what
  moves trust under competent play, the baseline the winnability
  chain is measured against.)
- Seeds: 99101–99108, the gearbar/vetbar/standaccum band re-run
  on CURRENT master (worktree tip 74debf969). RE-USE is recorded
  here and is NOT claimed as freshness: trajectories WILL drift
  with base moves since 2026-11-09 (standaccum-b landed in the
  2330Z round); judge on THIS run alone. Band-level pairing
  with the standaccum-b corpus, not trajectory-identical pairing.
- Horizon: 150 days, death-aware (dead villages stop simulating;
  +10d tail max via the harness's runDays death handling), to
  match standaccum-b.
- Instrument: new recorder
  (`scripts/trustgrowth-instrument-20261109.js`,
  `scripts/trustgrowth-driver-20261109.js`,
  `scripts/trustgrowth-analyze-20261109.js`), DAILY snapshots
  per active link: far end, kind, primary/subordinate, age,
  trust, seasoned?, regional+?, reason it does not count,
  arrears, tributePaidWeek, lastKeptDay, mourningUntil,
  tendedWeek, theirSpeaker, FULL history entries new since the
  last snapshot (link.history is capped at 40 and shifts — the
  instrument snapshots incrementally so nothing is lost) +
  broken-link roll (keys that left the active roll, with break
  day) + daily polity state (`polityOf('haven')` member count,
  belong/covenant/trade polity presence, scaleRank, nationalLive)
  + formation events (new link keys: day, far end, direction,
  born trust) + pending-offer presence
  (pendingCounter/pendingAccord/pendingNational) per day.
  The instrument ALSO wraps `Game._trustGain`: every call logs
  {day, link key, requested n, applied n, caller stack (top
  frames)}. Gains are the only positive trust moves by design
  (the choke); the wrap records, never alters — it calls the
  original and returns its value. The say sample records lines
  matching /trust|tribute|tend|bond|polity|realm|season|link/i
  (cap 200) for the sense-test around formation/tending.
  Trust deltas are derived by the analyzer from consecutive
  daily snapshots; gain events and history entries are the
  attribution sources — that derivation is stated here, not
  hidden.
- Analyzer: per-link trajectory classification by the precedence
  rule above; per-link-day delta reconciliation (gains vs delta,
  history kinds vs down-delta); per-cause gain/down counts;
  per-village polity blocking reason by rule; band table vs the
  standaccum-b corpus (headline numbers only, not a balance-panel
  comparison — no before/after LEVER comparison exists for a
  diag, so none is fabricated; `balance-panel.js` runs sweep
  comparisons, not recorder corpora — bandfreeze-b §15).
- Sense-test (SENSE-TESTING LAW): read say-lines around link
  formation and around the largest trust moves on each seed and
  judge whether link behavior reads like people (a bond that
  cools, a tribute that comes up thin, a speaker who dies) or
  like numbers; read the link history notes as the village's own
  record. Quote lines, don't just count them.
- Scale-wall numbers every run: national / table / wins, wave
  4–5 unlocks, median survival (scaleRank, unlockedWave,
  runDays result, won/over flags).
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate
  (this 8-seed run), death-aware horizons, pre-registration
  (this file), metric binding (§14), balanced panel (§15 — see
  above).

## Metric review (placeholder — filled in the evidence file, §14)

- To be written after the run: whether the trajectory classes,
  the gain-attribution reconciliation, and the polity blocking
  rule held up; whether the `_trustGain` stack classification
  named every caller or left `unattributed`/`other-named`
  residue; whether the say filter captured formation/tending
  lines or filled with noise.
