# sim-enddaybeats-fix-a — PRE-REGISTRATION (committed BEFORE any judged sim)

Worker: sim-enddaybeats-fix-a (Loop A, food-economy / narration).
Run: fleshout-20261105T2215Z. Coordinator claim:
`hidden_files/lever-claims/fleshout-20261105T2215Z.json`
(axis food-economy, arms sim-awaynaming-rereg-a + sim-enddaybeats-fix-a).
Assignment: BUILD the endDay haven-beats family fix — gate/re-voice the
ungated haven-side beats at the endDay delivery channel, in ONE family
arm, using the killer-tale prose as the model (it goes through the
sayHavenNews relay and stayed gated 0/17 in the census).
Base HEAD at prereg time: 25de3b127 (origin/master, 0 behind).

No single canon doc covers endDay position-blind narration; the design
lives in evidence/2026-11-05/sim-gossipcensus-a.md and
evidence/2026-11-05/sim-enddaybeats-a.md (+ its prereg). CANON.md was
read first; no canon is invented here. Sibling arm sim-awaynaming-rereg-a
owns the relay internals (holdNamingNews / awayNaming / sayHavenNews /
flushHavenNews / pendingHavenNews) in a separate worktree — this arm
does NOT touch relay internals. It only ADDS callers to sayHavenNews
(the public relay entry point the tale already uses) and gates say
calls elsewhere. No relay behavior changes.

## The question, precisely

For each beat in the family below: after the fix, does it still fire
inside a stranded scholar's sleep window, at what rate vs the
before-leg rate on identical seeds, and do the stranded-window hits
that remain (if any) read wrong — plus do the relayed/suppressed
lines still reach the scholar honestly (on return, or not at all
where the line is ephemeral)?

## Census facts (carried, not re-measured here)

Run fleshout-20261105T1915Z, evidence/2026-11-05/sim-enddaybeats-a.md,
verdict INSUFFICIENT-DATA (power bar missed by 3: 17 stranded sleep
windows across 5 seeds, need >= 20 across >= 4). Measured incidence
(before-leg baseline for THIS arm, to be re-run on current master on
the fresh band below — the census corpus is STALE on current master
and is never treated as a baseline):

- FRAGMENTS 14/17 stranded (82.4%) vs 46.6% non-stranded.
- PANTRY day-voice 15/17 (88.2%) vs 55.7%.
- RAID CALL 2/17 (11.8%) vs 6.2%.
- OVERHEAR 1/17 (5.9%) vs 0.8%.
- Relay-gated burst/settle/witness/tale 0/17.
- OTHER on the same 17 windows: inter-village raid lines 3/17, moot
  summons 1/17, fireside confrontation 1/17, direct-address fireside
  chatter in several windows, nightfall line 1/17.

## Code facts (read, not assumed — verified by grep on base 25de3b127)

- Relay: `sayHavenNews` (game.js ~23075) says immediately iff
  `scholarAtHaven()` (standing on the haven tile); while away it
  queues in `state.pendingHavenNews` (cap 20, oldest dropped) and
  `flushHavenNews` (~23087, called at the top of endDay ~32533)
  delivers on a night spent at Haven. `flushHavenNews` passes through
  any kind except 'word'/'debate' (dropped when the beast already has
  a villageName) and 'settled' (dropped when it has none) — a new
  kind 'raid' passes through unfiltered, so NO relay-internal change
  is needed to carry raid news. This arm does not modify the relay.
- FRAGMENTS: `spreadGossip` (game.js ~17968) runs in advancePart
  (~6622) and per travel step (~12943); the fireside say is the LAST
  thing in its innermost conditional (after the rate/distortion/tail
  RNG draws and pickFresh), followed by
  `noteTrialDeed('hear_10_rumors', 1)` (~18034). Gossip spread
  (heard/distortion), rep application, and all RNG draws run
  identically gated or not — only the say (+ the hearing count) is
  gated. The deed is 'Ten rumors through the fire-smoke. You LISTEN.'
  (trial-deeds.js:119, threshold 10, grants gossip_network) — the
  count is a hearing count, and a stranded scholar hears nothing.
- PANTRY: `villageEats` (~31871/~31875) calls `_depositGateDayVoice`
  (~30538) and `_plentyDepriDayVoice` (~30708) after the meal loop.
  Both set their once-per-day voice stamp (`voiceDay` /
  `standDownVoiceDay`) BEFORE the say, and pick their line
  deterministically (no RNG). Gating only the say leaves the stamp
  consumed: the village said the line at the fire; the absent scholar
  simply does not hear it. The stand-down voice (PLENTYDEPRI=2) is
  gated the same way (its pool is inert on this substrate, PLENTYDEPRI=0).
- RAID: `havenRaidTick` (havenGrowth.js ~499) runs inside endDay via
  the progDaily wrap (~968). Its says, in order: the 🐗 RAID line
  (~558), the 🐗⚠️ escalation beat, the 🕯️ raid-contest ack
  ("The treeline is still torn up from the raid...", ~594), the
  `raiseAidCrisis` call (~607), the "Nobody met X" linger line, the
  🛡️ defender report. The player-facing "One of them is coming for
  YOU" lines are ALREADY gated on `playerAtHaven` — untouched.
  `raiseAidCrisis` (comms.js ~157) sets `state.aidCrisis` (mechanics),
  says the 🚨 summons, and writes a journalNote. The live crisis
  surfaces in the Haven panel with all four call buttons
  (app.js ~325) — the return-time surface for a crisis still live.
  Only havenRaidTick + a debug scenario call raiseAidCrisis.
- OVERHEAR: the ledger endDay wrap (ledger.js ~1732) calls
  `ledgerBeat()` + `flushLedgerBeats()` after base endDay.
  `_fireBeat` (~362) marks fired, then prefixes the FIRST gossip-kind
  beat with 'You overhear it at the fire, and stop pretending not to
  listen. ' (only while `!pg.selfTalkedAbout`), says it, and logs it
  to `pg.legendBeats`. `_checkDimBeats` (~386) fires immediately when
  the gate passes and not in combat, else queues (cap 12, oldest
  dropped). `_fireBeat` is called ONLY from `_checkDimBeats` and
  `flushLedgerBeats` — gating at those two call sites covers every
  path. LEDGER_BEATS gossip texts themselves ("Riders from X are
  telling the deer story again...") name no fire; only the first-beat
  prefix claims the fire. `distantVillageName()` consumes one R()
  draw inside `beat.text()` — see RNG note below.
- VILLAGE RAID: `commonsRaid` (game.js ~22204) says the 🌙 line after
  the garden/pantry take and trust move; called from the commons
  daily tick (~22165) when tension >= 70, trust < 15, 8% roll.
- CONFRONTATION: `exposureFireTick` (exposure.js ~107) says the 🔥
  line, then applies the rep dent (-10 honest), trust (-8), memory,
  and exposure record. Hooked into endDay ("The fire hears it: daily
  beat, hooked into the day's end", ~249).
- MOOT: "The moot turns to you" in betrayal.js conductTrial (~1920)
  and villageAgency.js petition moot (~802); both set
  `awaitingPlayerVote = true` and return awaiting the vote. Trial
  votes have no app.js surface found (only petition vote buttons,
  app.js ~320). The moot is a live decision, not narration alone.
- NIGHTFALL: "Night settles. The fire is the whole world now."
  (advancePart dayPart-3 line) — the sleep loop's own prose, not a
  haven-side beat.
- WORD TRAVELS (`ledgerBeat`, ledger.js ~293): "riders from X bring
  talk of Haven" — riders bring talk; no fire claim. Left.

## Fix direction per beat (pre-registered — the decision, with reason)

Two honest shapes only: GATE (hold/suppress until return — the line
is never said while away) vs RELAY (sayHavenNews queue — the news
waits and is said at the fire on return) vs LEAVE (with reason).
Suppression is used ONLY for ephemeral lines (a same-day voice, a
fireside scene); news is always relayed, never suppressed.

| Beat | Direction | Reason |
|---|---|---|
| FRAGMENTS | GATE-suppress (no queue) | Ambient fireside chatter, ephemeral; up to 8/night would flood the shared 20-cap relay and evict real news — the exact failure mode that killed the gossipfix arm (12-entry cap dropping lines). The village talks again; the scholar hears it when present. Gate the say + the hear_10_rumors hearing note (hearing requires presence); gossip spread/rep/RNG untouched. |
| PANTRY deposit + plenty (+ stand-down) | GATE-suppress (no queue) | Same-day village voice ("Dinner's on me tonight, then") — stale by return. Voice stamp still consumed (the village said it; the absent scholar doesn't hear it). |
| RAID CALL 🚨 | GATE-suppress (no queue) | A summons is actionable ONLY at Haven. Queued delivery would arrive stale — the village already fought (defender beat) or the crisis resolved 'fought'/'moved-on' — and would invite action on a dead crisis. The crisis state + journalNote are untouched, and a crisis still live on return surfaces in the Haven panel with all four call buttons (app.js ~325). |
| RAID NEWS 🐗 + escalation 🐗⚠️ + contest-ack 🕯️ + defender 🛡️ + "Nobody met" linger | RELAY via sayHavenNews, kind 'raid' | News stays true on return; queued and said at the fire on the next Haven night (flushHavenNews, top of endDay). Mechanics untouched: draft, palisade damage, defender fights, lingering, crisis. |
| OVERHEAR | GATE-hold in the existing ledger queue | The FIRST gossip-kind beat only — the one carrying the "You overhear it at the fire" prefix: in `_checkDimBeats` treat away+would-carry-prefix as a queue condition (like inCombat); in `flushLedgerBeats` skip firing it while away, leaving it queued. It fires with its prefix on return. Later gossip beats carry no fire claim in their text; left. The queue already exists; no new queue, no new cap. |
| VILLAGE RAID 🌙 (commonsRaid) | RELAY via sayHavenNews, kind 'raid' | News (gardens trampled / pantry carried off); mechanics (plots, draw, trust -10, seedGossip) untouched. |
| FIRESIDE CONFRONTATION 🔥 (exposureFireTick) | GATE-suppress (no queue) | A scene at the fire, ephemeral; rep/trust/memory/record consequences untouched. |
| KILLER TALE / BURST / SETTLE / WITNESS | NO FIX (controls) | Relay-gated already; 0/17 in the census; re-measured as controls. Do NOT touch. |
| MOOT summons ("The moot turns to you") | LEAVE | Coupled to awaitingPlayerVote state: gating the say alone would hide a pending decision with no return-time surface (no trial-vote surface found in app.js). The honest fix needs the trial to proceed without the absent scholar (the exiled precedent: "The moot doesn't wait for the exiled") or a return-time vote surface — a mechanics design for a follow-up arm, not a narration gate. |
| NIGHTFALL line | LEAVE | Sleep loop's own advancePart prose, not a haven-side beat; the honest fix is a wild-case re-voice ("Night settles. You're alone out here..."), not a gate — follow-up. |
| DIRECT-ADDRESS chatter (💬/🗣️/👀) | LEAVE as a class | Diffuse call sites, no single channel; needs its own census — follow-up item. |
| WORD TRAVELS (ledgerBeat) | LEAVE | Riders bring talk; no fire claim. |
| Raid-aftermath 🕯️ | RELAY (covered) | The census's aftermath line ("The treeline is still torn up...") IS the contest-ack line in havenRaidTick — same relay treatment as the raid news. |

The raid call decision, thought through (per the assignment): gating
the summons until return is wrong for the SUMMONS (it would arrive
stale and unanswerable) and re-voicing it as dawn relay prose would
duplicate the 🐗 news line that already says what happened. The split
is the honest shape: the 🐗 news relays (information flows), the 🚨
summons gates (an unanswerable call is not made), and the defender
report relays (the outcome flows). A crisis still live on return is
surfaced by the Haven panel, not by a stale summons.

## Primary metric (per beat, sleep comparison)

Same window machinery as the census (strandnarr-diag recorder +
enddaybeats-diag classifiers, reused verbatim): stranded night = a
loop-day evening whose nighttravel outcome is `travel-refused` or
`out-of-reach` AND the scholar is not inside Haven at daily exit.
PRIMARY per beat K: stranded sleep windows containing >= 1 K line /
stranded sleep windows, AFTER vs BEFORE on identical seeds, with
verbatim quotes of every residual stranded-window hit. Raid events
collapse the 🐗 line + 🚨 call (as in the census). Upkeep windows are
a MECHANISM CHECK only (expected 0 for every beat), never part of
the verdict.

- POWER BAR (pre-registered, per the census's instruction, applied
  to EACH leg): >= 20 stranded sleep windows observed across >= 4
  stranding seeds, in the BEFORE leg AND in the AFTER leg (pooled
  pilot + screen + extension if triggered). If either leg fails, the
  verdict for the affected beats is INSUFFICIENT-DATA, never
  re-scored. The "other" enumeration is read off the same powered
  windows; LEAVE beats need no separate bar.
- VERDICT RULE (pre-registered): GO per beat iff the after leg is
  powered AND the beat's stranded-sleep incidence is 0 windows
  (fragments, pantry-deposit, pantry-plenty, raid-call, raid-line,
  raid-aftermath, overhear, village-raid, confrontation) AND the
  controls stay 0 (tale, burst, settle, witness) AND guardrail (i)
  passes AND the relayed beats' return delivery reads true in the
  sense test. A residual hit is NO-GO for that beat, quoted verbatim
  with the missed path named. The family verdict is GO only if every
  GATE/RELAY beat is GO; otherwise the verdict names the failing
  beats and the family stays open.
- GUARDRAILS (pre-registered):
  (i) NO SILENCING of non-stranded delivery — judged by the LEDGER,
  not by the non-stranded sleep rate alone (the awaynaming-cap
  lesson: moving a delivery sleep→daily reads as a rate drop
  without being silencing). For SUPPRESSED beats (fragments,
  pantry, confrontation): non-stranded sleep-window rate before vs
  after within ±3pp (the gate fires only while away, so
  non-stranded delivery is untouched by construction). For RELAYED
  beats (raid-line, raid-aftermath, overhear, village-raid): total
  per-beat line counts across the band before vs after within ±5%
  (relayed lines are still said, just later — a rise in the
  non-stranded sleep rate is a phase shift, not silencing); any
  shortfall must be explained line by line (e.g. queued news never
  delivered because the village was lost while the scholar was
  away — the news is moot then, and the count is reported, not
  hidden). Held-volume accounting: the driver records
  `pendingHavenNews` depth per evening (read-only); report
  max/mean depth per seed and the count of queued items never
  delivered at run end.
  (ii) DET-GATE: instrument ON vs OFF identical on seed 17021
  (before leg, driver proof) and on the fixed code (after leg,
  proof test). Any divergence = instrument contamination; stop.
  (iii) TRAJECTORY IDENTITY: daysAlive per seed before vs after
  reported; a narration-only change should leave most identical.
  Divergences are attributed, not hidden — the KNOWN one-draw RNG
  shift is the deferred first gossip beat (see RNG note).
  (iv) NO gate/price/deed-RULE change: the fix touches only say
  calls plus the hear_10_rumors hearing count (disclosed above —
  a count correction, not a threshold or rule change). The
  balanced-panel compare decision must be `no_material_signal`,
  or any signal is investigated and explained before landing.
- SENSE TEST (SENSE-TESTING LAW): every residual stranded-window
  hit is quoted verbatim with its full sleep window read; every
  relayed delivery on return is read (does the queued raid line
  read true at the fire on return, or stale?); per beat:
  reads-true / gated / relayed-true / still-wrong.

## RNG note (trajectory divergence, disclosed in advance)

All gates sit AFTER their RNG draws or on deterministic text, so the
RNG stream is identical before vs after EXCEPT ONE place: a deferred
first gossip beat defers its `beat.text()` call, which consumes one
R() draw inside `distantVillageName()`. A before/after pair can
therefore diverge from the first deferred gossip beat onward (same
kind of shift as the existing combat-deferral queue). The
before/after comparison is same-SEED, not same-trajectory, past that
point; the verdict is judged on pooled rates, not paired windows.
Fragments, pantry, raid, village-raid, and confrontation gates
consume no RNG on either path.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days (same substrate as the census; dead villages
  stop simulating, so 60 is a cap, not a sentence).
- Policies: bankfood(warmed(woodcarry(nighttravel))) over competent,
  env gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1
  (the census leg, verbatim). PLENTYDEPRI=0 means the plenty pantry
  pool cannot fire — the classifier still matches it, and a 0 there
  is reported as gate-off, not as absence. DEPOSITGATE=1 means the
  deposit-gate pantry pool is live.
- PILOT (8 seeds, judged first, before any confirm spend):
  46001–46008. Expected from the census rate (~0.55 stranded
  windows/seed): ~4–5 stranded windows — the pilot is expected to
  MISS the power bar by construction and trigger the pre-registered
  screen below. The pilot is still judged (its incidence is
  reported, not hidden).
- SCREEN / CONFIRM (pre-registered, runs ONLY after the pilot):
  the same driver over 46009–46040 (32 fresh seeds). Every seed in
  the band runs, stranding or not, so the screen cannot inflate the
  rate by selection.
- EXTENSION RULE (pre-registered): if either leg's pooled
  pilot+screen stranded windows are < 20 (or < 4 stranding seeds),
  extend BOTH legs with 46041–46064 (24 fresh seeds, verified fresh
  below) and re-pool. No cherry-picking, no other seeds.
- SEQUENCING (pre-registered, because the fix changes the code the
  before leg runs on): (1) prereg commit; (2) driver copy commit
  (no src/js); (3) BEFORE pilot → judge baseline; (4) BEFORE screen;
  (5) BEFORE balanced panel; (6) implement fix → proof test green;
  (7) AFTER pilot → judge; (8) AFTER screen; (9) AFTER balanced
  panel; (10) panel compare + evidence. The before leg is fully
  spent before the fix exists; the after leg mirrors it seed for
  seed.
- BALANCED PANEL (§15): before/after comparisons run through
  `scripts/balance-panel.js` — the panel is the instrument, the
  pre-registered threshold is the judge. Panel invocation (both
  legs): `node scripts/balance-panel.js --out <panel-dir> --seeds
  46001,46002,46003,46004,46005,46006,46007,46008 --policies
  capable,risk-aware,socialite,winseek --days 60`, then
  `node scripts/balance-panel.js compare --before <before-panel>/
  panel.json.gz --after <after-panel>/panel.json.gz --out <prefix>`.
  The compare .md is attached to the evidence file. Decision must
  be `no_material_signal` (guardrail (iv)).

## Band freshness (verified BEFORE any judged sim)

Fresh band 46001–46040 (pilot + screen), extension 46041–46064.
Search scope and result (whole-token grep, run 2026-11-05 ~22:56Z):

- ALL dated preregs (evidence/*/sim-*-prereg.md): ZERO 46xxx
  tokens of any kind. The 46xxx range is entirely absent from every
  dated prereg.
- ALL evidence .md (evidence/ --include='*.md'): ZERO tokens in
  46001–46064. The only 46xxx tokens anywhere in evidence are
  46221 and 46553, both outside the band.
- sim-findings.md: ZERO tokens in 46001–46064.
- scripts/ + docs/: ZERO tokens in 46001–46064.
- Forbidden-band lists (99201–99248, named in the 2026-11-04
  preregs sim-standacc-b, sim-diplo-b, sim-tendfloor-guard-b,
  sim-tendbelow-b): the band does not touch them.
- REJECTED candidates, verified used: 22001–22024 (sim-rotdiff-b,
  evidence/2026-10-20, seeds 22001–22008 + proof 22011/22012/22021
  — found by grepping evidence files, NOT preregs; the prereg-only
  check would have missed this); 23001–23016 (sim-draworder-b);
  24001–24004 (journey-succession-r43-laneb). A prereg-only check
  is NOT a freshness check — this band was verified across preregs
  AND all evidence, sim-findings, scripts, and docs.
- 18xxx warning discharged: 18088/18151 are game.js LINE citations
  in the gossipcensus prereg (spreadGossip end, gossip line), and
  18795/18997 occur only as substrings of commit hashes
  (e.g. d6723d3f...518795...). None is a seed.
- The census band 17001–17024 is NOT reused for the extension (it
  is the census substrate).

## Det-gate (instrument honesty)

Seed 17021, 60 loop-days, instrument ON vs OFF: bankfood evening
records, morning records, first-upkeep kcal series, and daily-entry
scholar kcal must be identical. Any divergence = instrument
contamination; the run stops and the instrument is fixed first.
The fix driver adds ONE read-only observation (pendingHavenNews
depth per evening — a length read, no state edit, no RNG) alongside
the census markers; the det-gate covers the whole driver.

## Anchor reproduction (judged in the proof test, before the pilot)

- 17021 CURRENT-SUBSTRATE FACTS (re-pin, verify — do not assume):
  the census re-pin says 17021 is 60d SURVIVED on current master.
  The proof test asserts the fix driver reproduces 60d survived on
  17021 on THIS master, pre-fix. If it does not, that is reported
  as a finding (substrate drift), not silently re-anchored.
- Known non-stranded sleep-window gossip hit: seed 15003 loop-day 7
  (strandnarr-a §2). The proof test asserts the fix driver captures
  a `Word gets around the haven` line inside the loop-day-7 sleep
  window on seed 15003, classified non-stranded sleep with the
  scholar inside Haven at fire time. If the exact loop-day does not
  reproduce, that is reported as a finding (substrate drift), not
  silently re-anchored.
- The census stranded hits are NOT proof anchors: the census corpus
  is stale on current master, so those trajectories may not
  reproduce. Stranded windows are established by the pilot+screen
  itself.

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO /
INSUFFICIENT-DATA per the rules above, never re-scored against a
friendlier metric mid-run. If a metric proves wrong, it goes under
"metric review" in the evidence file with a revision proposed for
the NEXT run. Every evidence file carries a "metric review" section.

## Wall numbers (carried, NOT re-measured)

This is a narration fix corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct seeds):
wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24.

## Deliverables

- evidence/2026-11-05/sim-enddaybeats-fix-a-prereg.md (this file,
  committed BEFORE any judged sim)
- evidence/2026-11-05/sim-enddaybeats-fix-a.md (verdict per beat,
  rates with denominators, every stranded-window hit quoted
  verbatim, sense verdict per beat, metric review, "other"
  enumeration, panel compare attached)
- evidence/2026-11-05/sim-enddaybeats-fix-a-corpus/before/ and
  .../after/ (per-seed JSON: judged windows + every classified
  line + per-loop-day counts; stranded sleep windows kept in full
  transcript; pendingHavenNews depth series)
- scripts/policies/enddaybeats-diag.js (REUSED verbatim from the
  census — no changes)
- scripts/enddaybeats-fix-trace-a.js (driver: the census driver
  with ONLY the disclosed changes — OUTDIR/prefix for the fix
  corpus, plus the read-only pendingHavenNews depth observation)
- scripts/test-enddaybeats-fix-a.js (proof: unit classifiers +
  per-beat gate unit scenarios + det-gate + anchors)
- src/js fixes, one commit with [needs-eyes] (narration/feel):
  game.js (fragments gate, pantry gates, commonsRaid relay),
  havenGrowth.js (raid-news relay), comms.js (raid-call gate),
  ledger.js (overhear hold), exposure.js (confrontation gate).
  No relay-internal change, no gate/price/deed-rule change, no
  push, no bump, no live verification (coordinator merges via
  --ff-only; ship loop owns deploys).
