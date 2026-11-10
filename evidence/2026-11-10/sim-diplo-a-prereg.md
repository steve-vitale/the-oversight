# Diplomacy / village links + ally-join — first numbers — PRE-REGISTRATION
(arm sim-diplo-a, run fleshout-20261110T1815Z, Loop A; Coverage Program Tier 1 #2,
Steve order 2026-11-10 11:11 CST "Measure all so we can improve on all gaps")

## What this arm is
A MEASUREMENT arm, not a lever arm. It captures the FIRST NUMBERS for
diplomacy / village links + ally-join on the standard panel: who proposes,
who decides, what gets accepted, what forms, what seasons, what becomes a
polity — under the default competent driver AND under COMPETENT_TALK=1.
Zero src/js. Gates, prices, deeds, and readyDemand untouched.

## Canon grounding (read before the judged pilot, not assumed)
- docs/CANON.md read first; docs/SCALE.md (the scale-ladder canon) read for
  the ladder: polity = one primary with ≥3 SEASONED subordinates (seasoned =
  30+ days old AND trust 40+; links form at trust 30); six national roads
  (LEAD / BELONG / COVENANT / TRADE / CONQUEST / REFUSE); national needs
  regional ≥ 30 days old; one rung per season (national ~day 61–90).
- docs/CONVERSATIONS.md covers dialogue/talk generally.
- NO canon doc covers diplomacy / link-raising as a system. Mechanics below
  are grounded in code (src/js/bond-initiation.js, src/js/hierarchy.js,
  scripts/policies/competent.js) and are stated as code facts, not canon.
- Code facts verified by reading/grep before this prereg:
  - `_formLink` has exactly four callers (grep, all of src/js): `proposeLink`
    (score ≥ 55 forms, 35–54 counters, < 35 declines), `answerCounter`
    (accept / sweeten), `answerRaid` (terms / strike), `_ladderRewardLink`
    (meta-progression stage-3 reward). No other path forms a link.
  - Link raises: `stageLinkRaise` gates (raiser alive, person-trust ≥ 20,
    `build_standing` ≥ 1, raiser personally knows the village, village
    unlinked, no pending raise, 14-day re-raise cooldown, no undelivered
    talk request); `npcLinkRaiseTick` daily, ≤1 staging/day, hash-roll
    lottery 0.5, pendings expire after 2 days; `acceptLinkRaise` tells the
    lore then calls `proposeLink`.
  - Person bonds: `proposeBond` decides through `npcInviteDecision` kind
    'bond' — temperament, goal, mood, fear, pair relationship, social need;
    chance clamped 5–95, never always/never. Every proposal, staging,
    acceptance and refusal emits tele('bond_proposed', {initiator, target,
    kind, outcome, chance}) — kind 'bond' for person bonds, 'link' for
    link raises (bond-initiation.js header).
  - Peer proposals: `proposeCovenant` / `proposeTrade` (played courtship
    bands, counter-offers via pendingCounter; require opinion ≥ 10).
    `raidVillage` / `answerRaid` is the conquest path. `tendLink` is the
    tending verb; `bidForPrimacy` is the courtship climb (one hard
    conversation per week).
  - Plain `competent` contains ZERO diplomacy verbs — grep count 0 for
    proposeLink / proposeCovenant / proposeTrade / raidVillage /
    answerCounter / answerAccord / bidForPrimacy. It talks, but `talkRound`
    opens one conversation a day and walks straight out (zero exchanges);
    held conversations (`deepTalk`, up to two sittings a day with real
    turns) run only under `COMPETENT_TALK=1`, OFF by default.
  - Foreign polities: `Game.foreignPolities()` — known, unlinked villages
    bind among themselves off-screen; Haven hears through traders.

## Definitions (binding for this arm)
- **Ally-join (LINK-JOIN):** a village becomes linked to Haven — any
  `_formLink` event, classified by formation path from the call stack:
  propose / counter / raid / ladder. Counted per seed: links formed,
  first-link day + path, links ever formed, links active at end, links
  seasoned at end (snapshotLink.seasoned), polities formed
  (polityOf('haven') non-null on any day, with shape/size).
- **Ally-join (PERSON-BOND):** a villager↔villager bond proposed by an NPC
  (tele kind 'bond'), decided by the target's character via
  npcInviteDecision — counted accept / counter / decline, with the offered
  chance band (5–24 / 25–49 / 50–74 / 75–95) and who decided (target id).
  Person bonds are the engine's only character-decided acceptance path;
  they are reported alongside link joins, never merged into them.
- **Wild ally-join: RULED OUT as a distinct engine path.** Grep of src/js
  for ally-join / join-village paths finds no code by which a wild
  villager or village spontaneously joins Haven outside (a) link formation
  via the four `_formLink` callers above, (b) person-bond proposals
  between villagers, (c) the scholar joining ANOTHER village
  (`joinVillageReal`, betrayal.js — probation, the scholar leaves Haven),
  and (d) the finale march call (finale-campaign.js — linked allies
  answering the call, not a wild join). The winnability-chain phrase
  "wild ally-join" therefore maps onto LINK-JOIN in this measurement. If
  a future arm finds another path, it must name the function.
- **Acceptance by character (link road):** an answered raise is accepted
  by the scholar picking `link:accept` in conversation, then the VILLAGE
  decides via the proposeLink score (≥55 formed, 35–54 counter, <35
  decline). Both halves are counted separately: raise accepted/refused/
  expired, then propose outcome formed/counter/declined-null. A raise
  accepted does not guarantee a link.
- **Seasoned link:** snapshotLink.seasoned (30+ days, trust 40+;
  conquered: season only). **Polity:** polityOf('haven') non-null.
  **Foreign polity:** foreignPolities() entry with ≥4 villages.

## Primary metrics (per seed, per leg)
1. proposeLink / proposeCovenant / proposeTrade / raidVillage /
   answerCounter / answerAccord / answerNationalChoice / answerGlobalChoice
   / bidForPrimacy / tendLink calls, by caller path (wrap counts +
   outcome class where the return carries one).
2. Link-raise lifecycle: staged / accepted / refused / expired /
   pending-at-end (tele kind 'link' + snapshots, secondlink-a classes).
3. Ally-join: links formed by path (propose/counter/raid/ladder),
   first-link day + path, links ever formed, links seasoned at end,
   polities formed (shape, size, first day).
4. Person-bond proposals: staged / accepted / counter / declined, by
   chance band, with decider (target) recorded.
5. Foreign polities: count, max size, first day any reaches 4+ villages.
6. Wall numbers: wins / national / table / wave-4 / wave-5 unlocks,
   median survival, standing totals, scaleRank at end.

## GO threshold (instrument validity + complete first-numbers capture)
This is a measurement arm: GO means the instrument works and the first
numbers are captured cleanly. GO iff ALL of:
1. Every link on the band classified by formation path (propose / counter /
   raid / ladder), none unclassified, none forced.
2. Every bond_proposed tele event (kind 'bond' AND 'link') reconciled
   against snapshot/wrap transitions — 0 irreconcilable.
3. Neutrality — the instrument does not perturb the game: the
   no-instrument control leg matches the instrumented control leg exactly
   on per-seed days AND standing totals (8/8 each). (Pattern from
   secondlink-a; the OFF leg is a re-run of the control leg with the
   instrument uninstalled.)
4. Instrument errors 0 on all seeds, all legs.
5. Complete first-numbers capture: per-seed tables for BOTH legs covering
   metrics 1–6 above, with the sense-test scenes (see below) quoted.
A GO verdict makes NO landing claim and spends NO confirm band: there is
no lever here to land. A confirm band is reserved only if a later build
arm needs one.

## Horizon + why
150d, death-aware (runDays ends on village death / win; +10d tail max).
Matches the secondlink-a / talkturn-a band so numbers compare directly:
talkturn-a armed 7/8 second links, 6/8 polities; control 0/8, 0/8. A
shorter horizon would cut the seasoning window (30d) and the national
window (61–90d); a longer one adds nothing at ~3–4s/seed-run cost.

## Seeds
Band: **170201–170208** (8 seeds, pilot). Seed-band freshness verified
at spawn per the local_seed_band_freshness skill: no dated evidence .md
file (evidence/2026-11-09/*.md, evidence/2026-11-10/*.md) and no perseed
filename names any seed 170201–170208. Recent bands in use and avoided:
150201–150208 (talkturn/raiserseat/tendexact/scholarcount),
150209–150216 (RESERVED for the talkturn re-judge — NOT spent here),
140201–140208 (vetcount), 160201–160208 (roleform-b), 99101–99108
(secondlink/trustgrowth), 110001–110016 (wallbase).
Confirm band (if a later build arm needs one): 170209–170216, NOT spent
by this measurement arm.

## Policies (TWO legs on identical seeds)
- **control:** competent verbatim, default env (COMPETENT_TALK unset).
  The default leg is degenerate on talk turns (0 turns taken) — it is
  kept because it is the base driver, and it reproduces the secondlink-a
  picture (raises staged, none answered).
- **armed:** competent with `COMPETENT_TALK=1` (held conversations).
  The flag is set/deleted explicitly per leg by the driver so ambient env
  cannot leak. This is the leg on which raises can be answered.
- **neutrality leg:** control policy, instrument OFF (no wraps, no
  snapshots; end-of-run wall numbers only), same seeds — must match the
  instrumented control leg on days + standing.
No other policy change. No src/js change.

## Instrument (new, reusing what exists — do NOT rewrite it)
- Reuse UNCHANGED: scripts/secondlink-instrument-20261110.js (daily
  snapshots + link-raise wraps + lazy tele capture) and the talkturn
  talk recorder (talkTo/convoTurn wraps: talks held, turns taken,
  link:/bond: choice picks, talks with a raiser while a raise was
  pending) — copy the recorder into the diplo driver as talkturn-a did,
  or require it if it is importable; do not fork its counting logic.
- NEW scripts/diplo-instrument-20261110.js (thin extension, wraps only):
  wrap `_formLink` (record target + caller path from the stack:
  proposeLink / answerCounter / answerRaid / _ladderRewardLink / other),
  wrap `proposeCovenant`, `proposeTrade`, `raidVillage`, `answerCounter`,
  `answerAccord`, `answerNationalChoice`, `answerGlobalChoice`,
  `bidForPrimacy`, `tendLink` (call counts + outcome class where the
  return carries one), and add a daily diplo snapshot:
  foreignPolities() (count, max size, any ≥4), nationalLive/globalLive
  flags, pendingNational/pendingGlobal shape, link-kind roll from the
  secondlink snapshot (reused, not re-read). All wraps record-only:
  call the original, return its value unchanged, never alter state,
  never consume RNG, never throw into the game (record-path failures
  logged to instrumentErrors, never thrown).
- NEW scripts/diplo-driver-20261110.js (two policy legs + neutrality leg;
  per-seed JSON to evidence/2026-11-10/perseed-diplo-a/; refuses to
  overwrite), scripts/diplo-analyze-20261110.js (per-seed + pooled
  tables, reconciliation, neutrality check; writes
  evidence/2026-11-10/diplo-summary-diplo-pilot.json), and
  scripts/test-diplo-a.js proving the instrument.
- Say-sample filter: /link|bond|raise|polity|realm|season|tribute|trust|
  standing|covenant|trade|raid|primacy|court|oath/i (adds "standing",
  "covenant", "trade", "raid", "primacy", "court", "oath" to the
  secondlink filter — the secondlink-a metric review named the
  "standing" gap; the ladder reward's announcement line must enter the
  corpus this time).

## Proof (scripts/test-diplo-a.js, RED->GREEN where a behavior is asserted)
- `_formLink` wrap classifies each of the four caller paths on fixtures
  (stack-derived path; "other" is a failure, not a class).
- Analyzer fixtures: link formed via propose vs ladder; counter staged
  then answered; bond proposal accept/decline by chance band; foreign
  polity ≥4 detected; neutrality comparison (identical days+standing
  passes, differing fails).
- Live legs: a short determinism miniature (same seed twice, byte-
  identical diplo counters), and a neutrality miniature (ON vs OFF on a
  short horizon, days + standing identical).
- Live install/shape/tele/wrap legs: every wrapped method exists on the
  loaded Game, tele capture sees kind 'bond' and kind 'link' events.
- KNOWN WRAP RISK (from secondlink-a): a wrap records nothing if the
  engine calls the closure instead of the Game method (stageLinkRaise
  was dead that way). The proof must verify EACH wrapped method's call
  path is live (a live call observed in the miniature, or the wrap is
  marked dead in the evidence and its zero is never treated as evidence).
  `_formLink` is the backstop for formation provenance: if the propose/
  counter/raid wraps are dead, formation is still classified from the
  `_formLink` stack.

## Sense-testing (SENSE-TESTING LAW)
Read transcripts / dialogue around link events — judge meaning and
coherence, not just counts. Quote: the first link formation scene per
leg where one exists; one answered raise (if any on the control leg,
none expected); one counter-offer exchange (if any); one foreign-polity
rumor line (if any reaches the corpus). Flag template repetition (the
rumor-variant raise line was identical on every seed in secondlink-a
and talkturn-a) and any robotic/static/repeated villager behavior.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)
Every evidence file carries one. Known candidates going in: the
talkturn-a cost bar is already known-wrong (raw-total deaths punish
longer survival; deaths per village-day is the proposed revision) — this
arm carries NO cost bar and does not re-judge it; the secondlink-a
"standing" say-filter gap is fixed in this instrument (see above); the
stageLinkRaise dead-wrap lesson is carried into the proof (see above).

## Findings discipline
Do NOT chase findings outside this arm mid-run. APPEND any to
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md
in its format: `- [open] YYYY-MM-DD — area — observation (your run/evidence).`

## Base + landing
Base at spawn: master e5c19e54e. If master moves before the run ends,
rebase onto the explicit master SHA read immediately before rebasing
and re-run proof green. Commit the prereg FIRST (this file), then the
instrument + proof, then the corpus + evidence. Do NOT push, do NOT
bump versions, do NOT verify live. Do NOT merge — the coordinator merges
with --ff-only. Leave branch + worktree clean and committed.
