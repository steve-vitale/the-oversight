# Talk-turn arm — PRE-REGISTRATION (arm sim-talkturn-a)

Run: fleshout-20261110T1215Z (Loop A). Axis: scale-onramp /
winnability chain. The open remainder of sim-findings #2061,
after sim-secondlink-a (evidence/2026-11-10/sim-secondlink-a.md,
run fleshout-20261110T0415Z). Committed BEFORE any judged
computation. Policy-side instrument only, zero src/js. Do NOT
move readyDemand numbers or any win price/deed gate.

Base: worktree tip 57547c8dd at spawn (recorded here; re-verify
at landing — if master has moved, rebase onto the explicit
current master SHA and re-run proof green).

## Canon read before this prereg

- `docs/CANON.md` (manifest). No canon doc covers village-link
  raising or polity formation as a system; the mechanics below
  are grounded in code, not invented canon. `docs/SCALE.md` is
  the scale-ladder canon: a polity is one primary with >= 3
  SEASONED subordinates; seasoned = 30+ days old AND trust 40+
  (links form at trust 30 — tending required); LEAD is the built
  realm road. `docs/CONVERSATIONS.md` covers dialogue/talk
  generally (no link-raise section) — the talk behavior below is
  grounded in `scripts/policies/competent.js` and
  `src/js/bond-initiation.js`, not in the canon doc.

## The pattern, pinned from cited evidence (what it IS)

sim-secondlink-a, band 99101–99108, competent verbatim,
COMPETENT_TALK off: 104 link-raise stagings band-wide (91
second-raisings), fates 102 expired + 2 pending-at-end, 0
accepted, 0 refused. The first link on all 8 seeds came from
the meta-progression ladder's stage-3 reward
(`_ladderRewardLink` → `_formLink`, stack-traced on 99101 d37);
`proposeLink` was never called. The expiry mechanism is zero
conversation turns: competent talks to 1 random villager/day
and walks straight out (`talkRound`: open + `endConvo 'left'`);
a raise lives 3 days. 45-day probe on 99101: 3 talks while a
raise was pending; 1 offered `link:accept` / `link:decline`
with no turn taken; 2 had no shared language so no link
choices existed. Contrast: person-bond proposals decide by
character with no conversation — 14 accepted / 17 refused on
the same band.

## Primary question

Does COMPETENT_TALK=1 (held conversations) answer pending link
raises — and do second links form?

## Code-grounded mechanism (verified by reading, not assumed)

- `COMPETENT_TALK=1` already exists as a switchable env gate in
  `scripts/policies/competent.js`: `talkOn()` (line 694) returns
  `process.env.COMPETENT_TALK === '1'`; default OFF. `deepTalk`
  (called daily, line 3332) returns immediately unless the gate
  is on. NO policy file change is needed to switch it on — the
  instrument is the flag + this driver. (If the flag had not
  been switchable, this arm would have added a default-OFF
  policy option; it is switchable, so nothing is added.)
- `deepTalk`: up to 2 held sittings/day, up to 5 real turns each
  (`holdConversation`, `convoTurn` via `chooseConversationChoice`
  + `pickTalkChoice`), closed honestly with `endConvo 'left'`.
- `pickTalkChoice` priority: `ans:*` first, then `teach`, then
  `gq:*`, then `ask`, then `live[0]` (first non-structural,
  not-yet-taken choice). `bondChoices` (bond-initiation.js:755)
  are PREPENDED to the menu (`extra.concat(base)`), so when a
  raise is pending, `link:accept` / `link:decline` are the first
  two entries and `link:accept` is the fallback first live
  choice — reached once the higher-priority choices for that
  sitting are consumed (no-repeat `seen` set) or absent.
- Target picking (`talkScore` / `pickTalkTargets`) is
  meaning-first but has NO pending-raise signal: unresolved
  want +100, grieving/scared +50, stranger, least-talked-to.
  The raiser is picked by general sociability, not by the
  pending ask — so a raise may still expire unvisited even
  with the flag on. This is part of what the pilot measures,
  not an assumption.
- Language gate: `bondChoices` returns nothing at commLevel
  'none' — a raise staged by a villager with no shared words
  is unanswerable by construction for its whole 3-day life.
- `acceptLinkRaise` tells the lore then calls `proposeLink`:
  formed (score >= 55), `'counter'` (35–54, staged as
  `pendingCounter`), or null (declined). An accepted raise can
  still fail to form a link — the pilot reports propose
  outcomes, not just accepts.
- Raises expire after 2 days (`npcLinkRaiseTick`); the
  instrument's fate classes are accepted→formed /
  accepted→counter / accepted→propose-declined / refused /
  expired / pending-at-end.

## GO / NO-GO bars (binding — judge only against this)

Primary metric: SECOND LINKS FORMED per 8 seeds (armed leg).
A second link = a link held with a village other than the
seed's first-formed link, formed on that seed (any path);
formed-via-raise reported separately.

- GO candidate: armed >= 2/8 seeds with a second link formed,
  vs control 0/8. (A GO candidate goes to the confirm band
  150209–150216 before any landing claim.)
- NO-GO: 0/8 armed. 1/8 armed is INCONCLUSIVE (not a GO, not
  a clean kill) — reported as such with the mechanism note,
  confirm band NOT spent on it.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Metric problems go under "metric review" for the
  NEXT run.

Secondary (reported, never the judge): raises answered
(accepted + refused tele events) vs expired, per leg; first-link
source per seed (ladder vs raise — from propose calls + the
analyzer's `formedViaRaise`); talk mechanism per seed (held
sittings, turns taken, talks with a raiser while a raise was
pending, `link:` choice picks, sits that ended with the ask
still unanswered); counters staged; seasoned links; polities.

Cost bar (scalemetric deciding bar — the talk must not buy
links with lives): starvation deaths armed <= control + 2 AND
total villager deaths armed <= control total AND median
survival armed >= 0.8x control median. "Total villager deaths"
is the `tele('death')` live capture (`result.samples.deaths`,
cause verbatim); "starvation" = cause matching
/starvation|hunger/i. If the cost bar fails, a GO candidate is
held, not landed.

## Method

- Policy: `scripts/policies/competent.js` `{competent}` verbatim.
  Armed leg: `COMPETENT_TALK=1`. Control leg: the flag unset
  (identical seeds, identical code — the ONLY difference is the
  env var, set explicitly by the driver per leg so ambient env
  cannot leak across legs).
- Seeds: 150201–150208, FRESH band. Freshness check (this
  prereg, before any judged seed): full grep of all 1,040 dated
  prereg files under `evidence/` (`*prereg*.md`) for `15020` —
  zero hits; no `150201` in any `evidence/2026-11-10/*.md` or
  `scripts/*.js`; no filename anywhere under `evidence/`
  contains `150201` (the `1502` files found are seed 1502, a
  different seed). `hidden_files/` hits for the digit strings
  are incidental float substrings inside old JSON corpora
  (e.g. `17.20616531502054`), not seeds; the only genuine
  naming is this run's own claim file
  (`hidden_files/lever-claims/fleshout-20261110T1215Z.json`).
  Loop B uses 140201–140216 — not used here. Sibling arms in
  this same run's claim (sim-answermail-drive-a,
  sim-tendexact-a) also name 150201–150208 with different
  instruments in separate processes/worktrees — recorded, not
  a freshness violation: no shared state, each run is
  deterministic per seed+policy+code.
- Horizon: 150 days, death-aware (dead villages stop
  simulating; harness runDays death handling), to match
  secondlink-a.
- Instrument: reuse of the secondlink-a recorder, unchanged
  (`scripts/secondlink-instrument-20261110.js` — daily
  snapshots, method wraps, lazy `tele('bond_proposed')`
  capture). New driver (`scripts/talkturn-driver-20261110.js`,
  adapted from the secondlink driver): per-seed JSON to
  `evidence/2026-11-10/perseed-talkturn-a/` (refuses to
  overwrite); adds a talk-turn recorder — wraps `talkTo`
  (talks held, vid, day, raise pending for that villager at
  that moment) and `convoTurn` (turns taken, `link:`/`bond:`
  choice picks) — plus the harness live-death capture
  (`result.samples.deaths`: day/kind/who/cause/player) and the
  policy `ctx.deepConvos` / `ctx.deepTurns` counters; say
  sample filter adds "standing" (secondlink metric-review fix).
  New analyzer (`scripts/talkturn-analyze-20261110.js`):
  reuses `secondlink-analyze-20261110.js` `analyzeSeed` for
  classification/fates/wall, adds second-link-formed counting,
  answered-vs-expired, first-link source, talk mechanism, and
  the cost-bar comparison (armed vs control).
- Proof: `scripts/test-talkturn-a.js` — RED->GREEN: (a)
  `talkOn()` env gate on/off; (b) `pickTalkChoice` picks
  `link:accept` as the fallback first live choice and after
  the higher-priority choices are consumed, and still answers
  `ans:*` first (courtesy preserved); (c) analyzer
  second-link counting + answered-vs-expired on synthetic
  per-seed JSON; (d) live miniature: short held-conversation
  run with the flag on takes real turns (`deepTurns > 0`) with
  zero instrument errors, and the flag-off miniature is
  byte-identical to plain competent on days (deepTalk returns
  immediately).
- Sense-test (SENSE-TESTING LAW): read at least one transcript
  where a raise is answered (or expires) and judge whether the
  exchange reads like people, not just counts; quote the lines.
- Scale-wall numbers every run: national / table / wins, wave
  4–5 unlocks, median survival, seasoning count, polities.
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate
  (this 8-seed run, both legs), death-aware horizons,
  pre-registration (this file), metric binding (§14), balanced
  panel (§15 — no before/after LEVER comparison exists for a
  policy-flag probe; the armed-vs-control comparison on
  identical seeds is the instrument, the pre-registered
  threshold is the judge; no panel file is fabricated).
