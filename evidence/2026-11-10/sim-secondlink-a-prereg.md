# Second-link road recorder — PRE-REGISTRATION (arm sim-secondlink-a)

Run: fleshout-20261110T0415Z (Loop A). The polity half of
sim-findings #2061 (named by sim-trustgrowth-b,
evidence/2026-11-09/sim-trustgrowth-b.md). Committed BEFORE any
judged computation. DIAG ONLY, zero src/js — a recorder/instrument,
no game change. Do NOT move readyDemand numbers or any win
price/deed gate. If the implied lever is a build (a second-link
road), it is NAMED in the evidence, not built here.

## Canon read before this prereg

- `docs/CANON.md` (manifest). No canon doc covers village-link
  raising or polity formation as a system; the mechanics below
  are grounded in code, not invented canon. `docs/SCALE.md` is
  the scale-ladder canon: a polity is one primary with >= 3
  SEASONED subordinates (four fires under one head); seasoned =
  30+ days old AND trust 40+ (links form at trust 30 — tending
  required); LEAD is the built realm road. The six national
  roads (LEAD / BELONG / COVENANT / TRADE / CONQUEST / REFUSE)
  are the canon shapes.
- `src/js/bond-initiation.js` (verified in code, not assumed) —
  the link-raise machine, landed 2026-11-06 (Steve 2026-11-04:
  villagers initiate bonds):
  - `stageLinkRaise(vid, villageId)`: gates — raiser alive,
    raiser person-trust >= 20, `vgoalWeights(vid).build_standing
    >= 1`, raiser personally knows the village (`villageLoreOf`),
    village not already linked (`linkWith`), no pending raise
    for that villager, no re-raise of the same (vid, village)
    within 14 days of a decision/expiry, no undelivered talk
    request for that villager, village exists in otherVillages.
    On staging it writes `state.village.linkRaises[vid]`, a
    talk request carrying the ask verbatim, and
    `tele('bond_proposed', {initiator: vid, target: villageId,
    kind: 'link', outcome: 'staged'})`.
  - `npcLinkRaiseTick()` (called daily from betrayalDaily):
    expires pendings older than 2 days (tele 'expired', 14-day
    cooldown record), then a hash-roll lottery
    (`bondRoll('linktick', day) < 0.5`) — at most one staging a
    day, picking one candidate villager (trust >= 20,
    build_standing >= 1, knows >= 1 village) and one of their
    known, unlinked, cooldown-clear villages.
  - `acceptLinkRaise(vid)`: tells the bearer the lore
    (`tellVillageLore`), then calls `proposeLink(villageId)` as
    the player (tele 'accepted'). `declineLinkRaise`: tele
    'refused'. Both write the 14-day cooldown record.
  - `proposeLink` returns the formed link (score >= 55),
    `'counter'` (35–54, staged as `pendingCounter`), or null
    (declined / shut door / unknown village). So an accepted
    raise can still fail to form a link.
  - Lore spread: the scholar tells villagers about villages
    they know when a conversation ends (`maybeTellVillageLore`,
    0.3 hash-roll); without it no villager ever knows a village
    and raises can never fire.
  - Lotteries use hash rolls (`bondRoll`), never Math.random —
    the instrument's reads must not consume the shared stream
    either (read-only calls only).
- Policy facts (verified by grep): plain `competent`
  (`scripts/policies/competent.js`) contains ZERO scale code by
  design — no `tendLink`, no `proposeLink`, no pendingCounter /
  pendingAccord handling. It DOES talk: `talkTo` + `pickTalkChoice`
  answers conversation choices, and bond/link choices are
  prepended by the `convoChoices` wrap, so `link:accept` is the
  fallback first live choice — competent answers a staged raise,
  normally by accepting. That is how the first link forms under
  competent; whether a second raise is ever staged, and what
  competent does with it, is what this probe records — not
  assumed in advance.

## The pattern, pinned from cited evidence (what it IS)

`evidence/2026-11-09/sim-trustgrowth-b.md` (same band, current
master, run fleshout-loop-b-20261110T0122Z, adopted + landed
20261110T0330Z): every seed forms exactly ONE link
(Haven-primary over Emberhold (6) or Stonebridge (2), formed
d17–d47, born trust 30–34), exactly 1 link per village on all 8
seeds; 1 seasoned link band-wide (99104, 28 days, trust 42–45);
0 polities on every road on every day; blocking 7x
never-seasoned + 1x seasoned-but-no-polity. Second links: 0
formed after the first on any seed, and "no second link raise is
visible in this corpus — the instrument records formations, not
link-raise stagings, so WHETHER a second raise was ever staged
(and declined/expired) vs never staged at all is UNMEASURED."
That is this arm's question. Sim-findings #2061 (SECOND-LINK
ROAD, 2026-11-10): "a polity needs >= 3 seasoned subordinates
and the band forms at most 1 link. Next arm: a link-raise
staging recorder (tele('bond_proposed') or pendingLinkRaise
snapshots) to learn whether second raises are never staged or
staged and lost — before any second-link build is proposed."

## Primary question

Are second link-raises never staged at all, or staged and then
lost? Answered per candidate village, per seed, with counts —
and, if never staged, WHICH gate blocks staging (lore / trust /
build_standing / cooldown / talk-request / lottery), measured
as a daily eligibility census, not guessed.

## DIAG-GO bar (binding — judge only against this)

DIAG-GO iff ALL of:
1. Every link on the band classified by raise outcome, by rule
   in the analyzer, never by hand. Classes (per candidate
   village — every village that is known to at least one
   villager or to the scholar while unlinked):
   - `raised` — a link formed via an accepted link raise for
     that village (staging event + accept event + proposeLink
     formed, in order).
   - `staged-and-lost` — at least one raise staged for that
     village, but no link ever formed for it (fate of the
     last staging reported).
   - `never-staged` — no raise ever staged for that village
     while it was a known, unlinked candidate (dominant
     blocking gate named from the census).
   A seed with zero links is classified `no-link` (a class,
   not a failure of the instrument). A village never known to
   anyone is listed `unknown` (not `never-staged` — the
   distinction is the point).
2. Second-raise stagings enumerated: count band-wide + fate of
   EACH (accepted→formed / accepted→counter /
   accepted→propose-declined / refused / expired /
   pending-at-end). "Second raise" = any link-kind staging
   whose target differs from the village's first-formed link,
   or any staging after the first link formed — both
   definitions computed and reported; they agree unless a
   raise for the first-link village re-stages after a break.
3. Neutrality, two legs on the same 8 seeds:
   (a) instrument-OFF leg reproduces the trustgrowth-b wall
   numbers: wins 0/8, national 0/8, per-seed days matching
   trustgrowth-b (132/58/132/150/109/87/150/62) on >= 7/8
   seeds exactly;
   (b) instrument-ON leg matches the OFF leg exactly on
   per-seed days AND standing totals on all 8 seeds
   (non-perturbation: the recorder does not move the game).
   Note: trustgrowth-b's evidence text reports "median 132";
   the per-seed days it lists sort to median 120.5 — the bar
   binds on the per-seed list, and the median is reported as
   computed, with the discrepancy named in metric review if
   it reappears.
4. Instrument errors 0 on all 8 seeds, both legs.
A miss on any clause is DIAG-NO-GO (reported with the partial
accounting), never re-scored against a friendlier metric
mid-run. Metric problems go under "metric review" for the NEXT
run. If the instrument cannot classify cleanly on the pilot
band (e.g. staging events and snapshots disagree with no
reconcilable cause), that is DIAG-NO-GO, not a widened bar.

## Method

- Policy: `scripts/policies/competent.js` `{competent}` verbatim,
  default env. No policy variants — this is a diag, not a lever.
- Seeds: 99101–99108, the gearbar/vetbar/standaccum/trustgrowth
  band re-run on CURRENT master (worktree tip 91650a90f).
  RE-USE is recorded here and is NOT claimed as freshness:
  trajectories WILL drift with base moves since 2026-11-09;
  judge on THIS run alone.
- Horizon: 150 days, death-aware (dead villages stop
  simulating; +10d tail max via the harness's runDays death
  handling), to match trustgrowth-b / standaccum-b.
- Instrument: new recorder
  (`scripts/secondlink-instrument-20261110.js`,
  `scripts/secondlink-driver-20261110.js`,
  `scripts/secondlink-analyze-20261110.js`), zero src/js:
  - Daily snapshots per seed: pending raises
    (`state.village.linkRaises`: vid, villageId, day, line) +
    decided/expired record (`state.village.linkRaiseState`) +
    full active link roll (standaccum `snapshotLink`) + per-day
    raise-eligibility census (per roster villager: alive,
    person-trust, `build_standing` weight, villages known via
    `villageLoreOf`, known-but-unlinked villages, cooldown
    villages, has-pending-raise, talk-request-blocked,
    eligible boolean + blocking-gate list) + known-village
    roll (otherVillages: id, name, opinion, linked?) +
    scholar lore keys + `bondRoll('linktick', day)` lottery
    value for the day (read-only hash roll, no RNG consumed)
    + scaleRank / standing total / `polityOf('haven')` /
    pendingCounter / pendingAccord.
  - Method wraps (call original, return its value unchanged,
    record only — never alter state, never consume RNG):
    `stageLinkRaise` (call + return), `acceptLinkRaise`,
    `declineLinkRaise`, `proposeLink` (return class:
    formed / counter / declined-null, plus whether a link
    appeared in the roll), `npcLinkRaiseTick` (call count).
  - `tele('bond_proposed')` capture via a lazy wrap installed
    on the first daily call (the harness installs its own
    `Game.tele` wrapper inside `runDays`, AFTER the instrument
    installs — so the instrument chains onto the live wrapper
    at first daily, not at install time; the wrap calls the
    live tele and returns its value). Cross-check: every
    link-kind tele event must reconcile with a snapshot
    transition (staged = appears in linkRaises; accepted /
    refused / expired = leaves linkRaises with the matching
    linkRaiseState entry); irreconcilable events are listed,
    not hidden.
  - Say sample: lines matching /link|bond|raise|polity|realm|
    season|tribute|trust/i (cap 200) for the sense-test.
  - Instrument-OFF leg: the same driver with
    `SECONDLINK_MODE=off` — no instrument, no wraps, no
    snapshots; end-of-run wall numbers only.
- Analyzer: per-village classification by the precedence rule
  above; per-staging fate from the event chain + snapshots;
  per-seed gate census (eligible-raiser-days, blocking-gate
  day counts, lottery pass rate on eligible days); band table
  vs the trustgrowth-b corpus (headline numbers only, not a
  balance-panel comparison — no before/after LEVER comparison
  exists for a diag, so none is fabricated; `balance-panel.js`
  runs sweep comparisons, not recorder corpora — bandfreeze-b
  §15).
- Sense-test (SENSE-TESTING LAW): read the link-raise lines
  the recorder captures and the say-lines around every staging
  and every formation; judge whether a raise reads like a
  person asking (a named villager, a village they know, a
  reason) or like a number; read the link history notes as the
  village's own record. Quote lines, don't just count them.
- Scale-wall numbers every run: national / table / wins, wave
  4–5 unlocks, median survival, seasoning count, polities
  (scaleRank, unlockedWave, runDays result, won/over flags).
- Staging per docs/MEASUREMENT.md §§9–12, 14–15: pilot gate
  (this 8-seed run + neutrality leg), death-aware horizons,
  pre-registration (this file), metric binding (§14), balanced
  panel (§15 — see above).
