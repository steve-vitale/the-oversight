# sim-linkdrive-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-linkdrive-a · **Loop A run:**
fleshout-20261128T0815Z · **Axis:** scale-onramp (the scale wall)
**Type:** LEVER (policy-side only — one new policy file, zero src/js
changes; see §1)
**Frozen:** 2026-11-28 ~08:56 UTC, before any judged sim.
**Branch:** `sim-linkdrive-a` (worktree
`~/workspace/worktrees/sim-linkdrive-a`).
**Builds on:** `evidence/2026-11-28/sim-scalerank-a.md` (band
113301–113308: every village forms EXACTLY ONE link in 150 days —
one plain bond, birth trust 30 — then never another; LEAD needs 3
seasoned subordinates, COVENANT/TRADE need 3 seasoned peer links,
BELONG needs an oath to a 4-fire realm; diplomacy standing 0/8;
rung gate opens by day 38–72; no polity ever qualifies, no court
beat ever stages, national 0/8 is a game wall on this road, not a
bot artifact) and its prereg
`evidence/2026-11-28/sim-scalerank-a-prereg.md`. This is scalerank
§7 arm 2: the first lever that can move the binding input scalerank
named (link count).

## §0. The question, in plain words

Scalerank showed the wall is the LINK COUNT: one link per village,
never a second, so no shape of polity can even be attempted. This
arm teaches the competent policy the link verbs and asks whether
the village then builds the realm: propose the best-known unlinked
village as a subordinate to Haven once the first link seasons, and
answer the peer counters when they arrive — so the LEAD road (3
seasoned subordinates under one head) becomes reachable. If the
armed villages season three subordinates together, a polity
qualifies for the first time on the plain road; if a beat then
stages, the next arm answers it.

## §1. Design from code (frozen, not a sim)

Read before designing: `docs/CANON.md`, `docs/TABLE.md` (seat
bars: lesser 4/4/3 + 2 contests + 2 crises + regional+ + stage ≥ 2
+ sentimentTaught; full national/global + 5/5/4/3/2 + 3 + 3),
`docs/MONSTER-WAVES.md` (wave bars). **No canon doc covers the
scale-rank inputs** — scalerank measured them from code; this arm
measures a lever on those inputs, and the numbers below are this
arm's frozen design, not a canon claim. The link machinery lives
in code and is read, never re-implemented (verified by grep + read,
2026-11-28 ~08:30 UTC):

- `proposeLink(targetId, opts)` (hierarchy.js:649): knowledge-gated
  (refuses villages the scholar never heard of/visited), refuses
  when a link already exists with that village, refuses new proposes
  while `pendingCounter` sits. `judgeLink` scores the courtship:
  base 38 + rep standing/2 (max 20) + opinion/2 + allied +15 +
  as-subordinate +10 (+8 generosity when sub + tribute ≥ 3,000 +
  opinion ≥ 5) OR as-primary strength term (Haven stronger:
  min(15, diff/5); weaker: −10) + RNG ±10. Score ≥ 55 accepts,
  35–54 COUNTERS (played: accept / sweeten / walk), < 35 declines
  (−5 opinion, banks `courtshipDeclined`). A counter to an
  as-primary propose asks Haven to BOW (asSubordinate true, 5,000
  kcal/week); 'accept' forms a BELONG link, 'sweeten' spends 1,500
  kcal for a re-judgment at Haven's own terms (+12, needs ≥ 45),
  'walk' costs −3 opinion. Opinion ≤ −20: the door is shut (silence,
  no fresh insult).
- `acceptLinkRaise` (bond-initiation.js:991) calls `proposeLink`
  with NO opts — an accepted raise forms an AS-PRIMARY (LEAD)
  link by default. That is how the baseline's single link is born
  (scalerank §0): a villager raises the idea, the bot accepts it
  in conversation, the link forms with Haven primary.
- `_formLink` (hierarchy.js:775): birth trust 30, tribute
  4,000 kcal/week default. The first-ever link stages the first
  accord (gift 2,000 kcal → +10 trust); the Regional Dawn waits
  for a bond 21+ days old. Three active Haven-primary subs say
  aloud "Three fires bow to Haven. But a realm isn't leverage —
  it's seasons" — the season (30 days + trust 40) is what makes
  them a realm.
- Seasoned (`_linkSeasoned`, hierarchy.js:234): link 30+ days old
  AND trust 40+ (conquered: the season, not the trust). Verified
  by scalerank: the driver's recomputation agreed with the game's
  own `_linkSeasoned` on every link (0 disagreements).
- `answerCounter` / `answerAccord` / `tendLink` / `payTribute` /
  `answerDemand` exist in code (hierarchy.js). `tendLink` REFUSES
  BELONG links ("tending your overlord is not this verb"); the
  holding verb for those is tribute + honored demands.
- **Known bot confound, frozen:** the competent policy
  (`scripts/policies/competent.js`) NEVER proposes a link and
  NEVER answers a staged counter unless the env flag
  `COUNTER_ANSWER=1` is set — `answerPendingCounter`
  (competent.js:724) is env-gated, default OFF, and the scalerank
  driver sets no env flags. So on the plain road a counter staged
  by a raise-accept sits unanswered forever and `proposeLink`
  refuses every new propose while it sits. The baseline's single
  link is the raise pipeline working once; whether a stuck counter
  is part of the one-link ceiling is the sibling secondlink
  diagnostic's question (scalerank §7 arm 1), not this arm's —
  but this arm's counter step (below) unblocks it, and that IS
  part of the lever: a competent player answers the table.
- **The propose verbs stay player-only** per Steve's 2026-10-26
  ruling (bond-initiation.js header). This policy calls them the
  way the staged party invites call the invite verb: as a
  measurement instrument standing in for the player, never as a
  game-code change. Whether the game itself should ask is a
  Steve-call, not a sim verdict.

**How this arm differs from sim-linkdrive-b (2026-11-07, GO):**
that arm composed onto the STAGED substrate
(competent-stageally-a.js), proposed AS-SUBORDINATE first, filled
the 3-link cap with BELONG links (23 of 41), reached regional 8/8
and lesser seats 4/8, staged a BELONG national beat on 6/8 — and
never formed the LEAD realm (at most 2 seasoned LEAD subs at
once) or held diplomacy past 34. This arm is the explicit next
blank #2 from that evidence ("Form the LEAD realm"): substrate
plain competent verbatim, direction AS-PRIMARY, gate on the first
link seasoning, counters sweetened (Haven stays primary) instead
of accepted. A different lever on a different road — not a rerun.

**THE DRIVE (frozen — do not tune), once per day each, in order,
after competent.daily:**
1. Answer a pending counter: 'sweeten' when pantry ≥ 12,000 kcal
   (keeps Haven's terms — the as-primary shape survives the
   negotiation; the engine re-judges at our terms, +12, needs
   ≥ 45), else 'walk'. Ungated: it runs even though the baseline
   never answers one. NEVER 'accept' — accepting a counter to an
   as-primary propose bows Haven and builds the other road.
   (Peer-kind counters, covenant/trade, are answered the same way
   if one ever arrives: sweeten keeps our terms, walk leaves.)
2. Answer a pending first accord: `answerAccord('gift')` — 2,000
   kcal → +10 trust (the engine's partial-pantry rule applies).
3. Answer pending link raises, IN CONVERSATION: for each pending
   raise (oldest first, at most one answer per day), the scholar
   talks to the raiser (talkTo + up to 5 real turns via
   `chooseConversationChoice` — answer their question first,
   continue their story, navigate to the subject — the linkdrive-b
   shape) and picks `link:accept` ONLY when the raised village is
   courtship-ready AS-PRIMARY (deterministic as-primary judge
   ≥ 55 — the score can never decline; worst case a played
   counter, which step 1 sweetens the next day). The raise itself
   is the perception event: the villager walked up with the idea
   and the village they personally know. NEVER the bare
   `acceptLinkRaise` verb, NEVER `link:decline` — a decline is
   the player's call, not the policy's. A raise for a
   not-yet-ready village is left pending (it expires; the
   villager may re-raise after the 14-day cooldown). A raise
   whose raiser is dead, exiled, or off-roster is skipped.
   (Competent's own talk round may already accept some raises
   during its daily — `pickTalkChoice` falls through to `live[0]`
   — so this step is also a backstop for raises competent's talks
   didn't reach. Both paths are counted separately in the stats.)
4. Propose directly, AS-PRIMARY — once per day, ONLY once the
   first link has seasoned (≥ 1 active link aged 30+ days at
   trust 40+), while active Haven-primary subs are < 3, when no
   counter / accord / national beat is pending, and pantry >
   12,000 kcal: the best courtship-ready KNOWN village
   (deterministic as-primary judge, no RNG draw; ranking score
   desc, village id asc) gets `proposeLink(vid,
   { asSubordinate: false, tributeKcalPerWeek: 4000 })`.
   Courtship-ready = deterministic as-primary score ≥ 55 (score
   ≥ 45 even at −10 RNG: counter-or-better guaranteed, never a
   cold decline). A decline costs −5 opinion and banks
   courtshipDeclined, so a declined village is not re-proposed
   within 7 days.
5. Tend LEAD links below the seasoned bar: weekly, for each
   active Haven-primary link with age < 30 days OR trust < 40,
   when pantry > 20,000 kcal: `tendLink(link.id)` (1,500 kcal →
   +8 trust). Seasoned links are NOT tended.
6. Hold BELONG links with tribute + honored demands: for each
   active Haven-subordinate link — if this week's tribute is not
   current and the pantry can cover the owed tribute,
   `payTribute(link.id)` in full; if `link.pendingDemand`,
   `answerDemand(link.id, true)`. (Under this drive a BELONG link
   can only arrive if a raise the policy never saw countered and
   was answered elsewhere — step 6 is a safety net and may never
   fire; its counts are reported honestly either way.)
7. NEVER answer `pendingNational` / `pendingGlobal` — endgame
   beats, not the ask; the baseline does not answer them either,
   so baseline parity holds. A staged beat is recorded, not
   answered. (Answering is the answercourt arm's job; the
   competent-answercourt-b policy already exists for it.)

**What it does NOT do:** no `proposeCovenant` / `proposeTrade`
(peer links are a separate corpus), no `raidVillage`, no bond
proposals for the scholar, no sweeten on a counter the drive did
not stage (step 1 covers all pending counters the same way), no
tend on seasoned links, no tribute paid when the pantry cannot
cover the full owed week, no `villageStandingTotal()` /
`unlockedWave()` calls in the policy. The only new RNG draws in
the armed leg are the engine's own (`judgeLink` inside
`proposeLink`, conversation turns) — the lever, not the
instrument. Candidate ranking is deterministic; no `Math.random`
in the policy file.

**COUNTERS:** per-run ctx counters plus module-level stats
(`resetLinkdriveStats` / `linkdriveStats`, event log capped at
400) so the driver captures per-seed numbers without reaching
into harness ctx. The `event()` helper MUST NOT let extra fields
overwrite `kind` (linkdrive-b fix b7c8db0d9 — demand-answer
events were mislabeled by demand kind).

**What already exists (the ground this lever stands on):**

- `scripts/scalerank-driver-a.js` — the harvest pattern this
  driver clones: `loadGame` + `setupGame` + `runDays`, a daily
  `snap()` wrapped around the policy, say/emit capture, fireside
  lines parsed, per-seed JSON + `--summary`. This arm's driver
  (`scripts/linkdrive-driver-a.js`) keeps that structure and adds
  a POLICY switch (`--leg base|armed`, env `LEG`): base =
  competent verbatim, armed = competent-linkdrive-a. The scale-rank
  input block is recorded UNCHANGED in both legs, plus the
  linkdrive stats per seed (`linkdriveStats()`), plus per-leg
  formation events (propose / raise-answer / counter-answer /
  tend / tribute / demand, from the policy event log — the
  analyzer reads link SHAPES from formation events, because the
  daily link rows carry no direction; linkdrive-b fix).
- The analyzer (`scripts/analyze-linkdrive-a.js`) clones
  `scripts/analyze-scalerank-a.js` (stage journey, per-shape
  recompute, reconciliation, wall numbers — reused, not
  re-derived) and adds the PAIRED before/after table: per seed,
  links ever / LEAD seasoned subs at end / max simultaneous
  seasoned LEAD subs / first-polity day / first-beat day /
  national / seats / survival / deaths, plus the linkdrive
  counters per leg. It reads the per-seed JSONs only — it never
  re-simulates.
- The panel builder (`scripts/build-linkdrive-panels-20261128.js`)
  clones `scripts/build-linkdrive-panels-20261107.js`: pseudo-panels
  in the `scripts/balance-panel.js` schema from the driver JSONs
  (before = competent, after = competent-linkdrive-a, PAIRED
  seeds), then `score.comparePanels`. The panel is the
  instrument; the pre-registered threshold (§2) is the judge.

**Pre-registered expectation:** the armed leg forms 2–3 more
links per seed than the baseline's one, all LEAD-shaped; ≥ 4/8
seeds hold 3 seasoned LEAD subs together at some point (the
polity qualifies, stage 1); a national beat stages on ≥ 1 seed
(stage 2) — which would move the wall from "no polity" to "the
bot never answers". The falsifier: armed links stay at 1/seed
(the gate never opens because the first link never seasons, or
no village is ever courtship-ready as-primary) — that moves the
question back to the secondlink diagnostic, not to a tuning knob.

## §2. Primary metric (BINDING, §14)

Paired legs (BASE competent verbatim vs ARMED
competent-linkdrive-a) on the SAME 8 seeds, 150d death-aware.
Each per-seed row carries the daily scale-rank input series, the
end-of-run mechanism stage, and the linkdrive counters.

- **Pool floor:** ≥ 6 of 8 seeds alive at day 80 in the BASELINE
  leg (same as the census/scalerank — the scale window must be
  observable; scalerank band: 8/8).
- **Primary metric:** per seed, the mechanism stage reached
  (0/1/2/3/4 + LOST) with first-day per stage, PLUS the LEAD
  input at end: seasoned Haven-primary subs vs 3, max
  simultaneous seasoned LEAD subs across the run, and the
  binding input at end (per-shape near-miss counts, rung-gate
  remainder, closest link's gap — the scalerank block).
- **GO threshold:** the armed leg meets (a) OR (b), AND the
  guards (c) and (d):
  - (a) national reached (polity qualifies + beat stages +
    answered — the answer stage can only be observed if a beat
    stages AND the policy answers it; this policy does NOT
    answer national beats, so (a) is reachable only via a
    foreign / villager-driven answer, and is recorded as such
    if it ever happens) on ≥ 2/8 seeds; OR
  - (b) LEAD seasoned subs ≥ 3 on ≥ 4/8 seeds (counted as max
    simultaneous seasoned LEAD subs ≥ 3 at any point in the run,
    from the daily snapshot series — a realm held together,
    even briefly, is the polity input; held-days are reported
    beside it, never substituted for it);
  - (c) median armed survival ≥ 0.8 × median baseline survival
    (the linkdrive-b bar);
  - (d) armed starvation deaths ≤ baseline starvation deaths + 2
    (the linkdrive-b food guard — tribute + tends + accords
    leave the pantry through this drive; a starving armed leg
    is a cost, not a win).
  Per-seed survival regressions worse than −30 days vs the
  seed's own baseline are listed per seed with an attributed
  cause in the evidence (linkdrive-b metric review #2: the
  median hides paired divergence on a fragile substrate) — a
  report, not a GO breaker at n=8.
- **Snapshot coverage (binding):** daily snapshots carrying a
  complete scale-rank input block (rank flags + polity counts +
  standing breakdown + link list, all non-null) / all daily
  snapshots ≥ 0.95, in EACH leg.
- **Reconciliation (binding):** the analyzer's per-seed
  end-of-run mechanism table equals the last snapshot's recorded
  stage on every seed (0 mismatches) in EACH leg — AND every
  count the analyzer reads (per-shape seasoned counts, diplomacy
  links) agrees with a recomputation from the snapshot's own
  recorded link list (stored-vs-recomputed, never a second
  simulation).
- **Instrument errors:** 0 on all per-seed files, both legs.
- **Determinism (binding):** one armed-leg seed re-run after the
  pilot is byte-identical to its pilot file. Per-seed JSONs carry
  no wall-clock fields; no process-position-dependent sequence is
  used (partydmg-a lesson: any per-seed row sequence is reset at
  the start of each seed's run). (The baseline leg's determinism
  is the same driver's same code path with the policy switched;
  the proof test checks the armed leg, the pilot re-run checks
  one armed seed at full horizon.)
- **MECHANISM ANSWER (binding as a finding, not a bar):** the
  evidence names what moved and what did not, per seed with
  first-stage days — how many links the drive formed, in which
  shape, how many seasoned together, whether a polity qualified,
  whether a beat staged, `nationalFirstDay` / `nationalHeldDays`
  if any seed reaches. A GO without this answer is not a GO.

**Verdict:** GO when the primary bar (a OR b) passes AND both
guards pass AND coverage / reconciliation / instrument / pool
bars pass AND the mechanism answer is written. NO-GO kind
THIN-POOL when the pool floor misses; NO-GO kind ATTRIBUTION
when coverage or reconciliation misses; NO-GO kind INSTRUMENT
when errors > 0; NO-GO (plain) when the primary bar misses with
clean instruments — the lever is killed, the evidence says why.
A miss is NO-GO, never re-scored against a friendlier metric
mid-run. The mechanism finding (which input moved, on how many
seeds) is the FINDING, reported under the verdict — it does not
flip GO to NO-GO either way when the bar is met, because the
lever's job is to move the input, not to pass it.

**Staging sniff test (pilot gate):** the analyzer must show the
scale machinery is live on this band in BOTH legs (rank reaches
regional on ≥ 1 seed AND ≥ 1 seed records ≥ 1 active link with
age/trust fields) before the verdict is read. If no link ever
forms anywhere, the verdict is NO-GO THIN-POOL with "no links
formed" as the finding.

## §3. Secondary metrics (supporting, not binding)

- Drive counters per seed (armed leg): propose calls / accepted /
  countered / declined / shut / blocked (pantry / cap / pending /
  gate-not-open) / no-candidate / not-ready; counter answers
  (sweeten / walk / failed); accord answers; raises seen /
  answered-in-conversation / linked / countered / skipped
  (not-ready / no-raiser / no-village / not-offered / talk-failed);
  raises answered by competent's own talk round (counted from
  the formation events, not the policy — the baseline's own
  raise-accepts); tends (paid kcal); tribute pays (paid kcal);
  demand answers by kind; national/global pending days.
- Death-cause recorder (folded in, own bar — scalerank §5):
  classification completeness of deaths (named cause / total
  deaths) — report the share, never fake a cause. Roster books:
  initial + joins == final + rostered deaths + leavers; any
  residual listed by name + day. Death-cause shares (named
  causes only). Starvation deaths per leg (guard (d)).
- Standing trajectory: war / diplomacy / plenty per seed at end;
  diplomacy links vs polity links (same stall, twice); diplomacy
  HELD-days, not just end state (linkdrive-b metric review #4:
  end-diplomacy is a lottery over the death day when polity
  standing flickers).
- Table timeline (carried from the census for the wall): first
  lesser-seat day, waiting days, overtime tier at end; full-seat
  shortfall ledger per seed (which bar is missing, from
  `deedGateReady()`).
- Wall numbers: national / table / wins, wave-4 and wave-5
  unlocks, median survival, death-cause shares.
- Village assessment (playtest-loop body): assessment in plain
  words per seed — who lived, who died, what they knew, what was
  missing.
- Sense-testing: 2–3 full transcripts (fireside lines about the
  table/scale + system scale lines), read in full —
  SENSE-TESTING LAW: judge meaning, not counts. In particular:
  does anyone at the fire ever talk about the second and third
  fires, the realm, the court — or does the climb stay voiceless
  even when the bot is asking?
- Reachable / fun / winnable verdict for the scale leg.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the census and
  scalerank, so the bands compare; the scale window is 80–140d
  and the table floor is day 90). Dead villages stop simulating
  (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 113501, 113502, 113503,
  113504, 113505, 113506, 113507, 113508.**
- **Band freshness (verified 2026-11-28 before this freeze):**
  word-boundary ripgrep (`rg -w --glob '*.md'`) over all
  `evidence/**/*.md` names NONE of 113501–113508. The only
  near-hit is a filename,
  `evidence/2026-10-28/sim-nighttravel-bank-b-scan-insideevening/nighttravel-b-insideevening-s11350.json`
  — seed 11350 (five digits), not a member of this band. The
  `1135xx` strings in evidence .md files are a version string
  (`79060b74b-…113520`), run IDs (fleshout-…T1135Z), and a pid
  (113588) — none is a seed band. The neighbouring block
  113401–113408 is also free, but the coordinator's candidate
  113501–113508 is taken. Neighbouring used bands avoided:
  113101–113108 (scalecensus), 113301–113308 (scalerank AND,
  per the scalerank evidence §8 correction, the sibling
  capstoneready arm — same block chosen independently in
  parallel), 112101–112108 (partydmg), 111801–111808 (speardmg),
  111101–111108 (launchfit). No evidence file names a
  forbidden/contaminated band list that contains this block.
  CAVEAT (same as scalerank §8): sibling arms' preregs live in
  their own unmerged worktrees and are not visible from here —
  sim-secondlink-a (DIAG arm 1) and sim-sitpolicy-a run in
  parallel on their own bands; if one of them froze this same
  block independently, it is not detectable at this freeze and
  will be recorded if it surfaces at closeout.
- **Policies:** competent verbatim (BASE leg) vs
  competent-linkdrive-a (ARMED leg). **No substrate flags:**
  the honest scale leg — no seat legs, no damage levers — so
  the lever is measured on the plain road.
- **Instrument:** `scripts/linkdrive-driver-a.js` (clone of the
  scalerank harvest structure — see §1; LEG=base|armed, OUTDIR
  `evidence/2026-11-28/perseed-linkdrive-a-arm`, per-seed files
  `s<seed>-base.json` / `s<seed>-armed.json`).
  Analyzer `scripts/analyze-linkdrive-a.js` (clone of the
  scalerank analyzer + paired table; reads the per-seed JSONs
  only — it never re-simulates). Panel builder
  `scripts/build-linkdrive-panels-20261128.js` (clone of the
  2026-11-07 builder; pseudo-panels + `score.comparePanels`,
  compare `.md` attached to the evidence file).
- **§15 panel:** the pseudo-panel compare IS the §15 instrument
  (same pattern as linkdrive-b): before/after on identical seeds
  through `scripts/balance-panel.js`'s compare path. Contract
  metrics mappable from the driver JSONs: won, national,
  survival30/60, communityLost, villageDeaths,
  villageDeaths100Days. PlayerDeaths is NOT instrumented by this
  driver — left null, never faked. All other contract metrics
  are null (not observed by this instrument). The panel's
  decision does NOT override the prereg verdict (§2 is the
  judge); the panel's null contract-metric signals are consistent
  with the paired story if the lever moves scale and seats, which
  the contract metrics do not price (linkdrive-b §15).
- **PILOT ONLY.** Confirm 12–16 seeds ONLY if the pilot passes
  GO; a GO earns a confirm only on the coordinator's call, with
  the per-seed regression guard carried as a binding bar.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on what villages actually build by day 80+, so
the fixture is the competent run itself: a geared scholar fighting
with a party, never a fresh un-geared solo scholar. The proof test
(`scripts/test-linkdrive-a.js`, GREEN before the pilot) runs live
on a loaded village: a staged mid-run village (day ~100,
regional, wave-4 faced) records a snapshot series whose polity
counts match the live link roll (seasoned counts equal a hand
recomputation from the recorded links, the standing breakdown
matches `villageStanding()`), the analyzer names the mechanism
stage on fixtures (no-polity / polity-qualified / beat-staged /
national-held / national-lost) and the PAIRED table on fixture
legs, and a determinism spot check (same armed seed twice →
byte-identical per-seed JSON) passes. The pilot's per-seed
corpora carry the encounter averages beside the verdict in the
evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** the scale machinery is live on competent bands —
   scalerank band: regional 8/8 (first regional days 38–72),
   lesser seat 8/8, table waiting 8/8. Links form and season on
   competent play (the first link seasons on 5/8 scalerank seeds).
2. **Pool sizing:** the addressable pool is every village the
   scholar KNOWS (knowledge-gated proposes) — the census and
   scalerank bands show the scholar knows several villages by
   mid-run (trader lines name foreign realms; other fires bind
   while Haven watches). The bar is 3 seasoned subs; the pool
   (known unlinked villages) is within an order of magnitude of
   the bar by construction. The rung gate (30 days regional) fits
   inside the 150d horizon with ~90 days to spare; the season
   (30 days) fits twice over after the first link seasons.
3. **Verb existence:** `proposeLink`, `answerCounter`,
   `answerAccord`, `tendLink`, `payTribute`, `answerDemand` all
   exist in code (hierarchy.js); the competent policy calls NONE
   of them except through its talk-round fallback and its
   env-gated counter handler — a known, frozen confound (§1),
   handled by the drive, not by pretending the verbs are missing.
4. **Horizon fit:** 150d contains the scale window (80–140d),
   the day-90 table floor, the rung gate (regional ~day 38–72 +
   30 days → national staging earliest ~day 68–102, inside the
   horizon), and two full seasons after the first link seasons
   (first link seasons ~day 46–80 on the scalerank band → two
   more links proposed ~day 50–85 season by ~day 80–115).

## §7. Canon

`docs/CANON.md` (manifest), `docs/TABLE.md` (seat bars),
`docs/MONSTER-WAVES.md` (wave bars) read before the run.
**No canon doc covers the scale-rank inputs** — this arm measures
a lever on them; the numbers in §1 are this arm's frozen design,
not a canon claim. The propose verbs are player-only per Steve's
2026-10-26 ruling; this policy is a measurement instrument
standing in for the player.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- On GO the LEAD input moved on ≥ 4/8 seeds (or national on
  ≥ 2/8), the guards held, and the mechanism answer is written
  with first-stage days; the next arm is named from that proof
  (the answercourt variant if beats stage unanswered, or a
  confirm on a fresh band if the realm forms cleanly — decided
  by the numbers, not by preference). On NO-GO the question
  stays open with the failing bar + mechanism diagnosis named.
- Write-flap: probe `git update-ref refs/heads/probe HEAD`
  before every material write; if it fails, stop writing and
  wait for the clear.
