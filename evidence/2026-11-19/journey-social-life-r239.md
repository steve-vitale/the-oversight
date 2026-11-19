# Journey social life — r239 (Lane B, leg 5)

Run ID `2026-11-19T20:00:00Z-loop2-leg5-r239`. Base master `7e0810eea`.
Seeds 45765–45768 (fresh band; 45757–45760 rejected — timestamp coincidence,
see prereg). Driver `scripts/journey-social-life-r239-20261119.js`, analyzer
`scripts/analyze-journey-social-r239-20261119.js` (r238 verbatim except
seeds/OUTDIR). DAYCAP 140.

## Prereg (carried)

Leg question: does social life hold up across a full run — invitations
sometimes taken, bonds proposed/answered by character, moots firing,
conversations reading as people, wants surviving across sittings without
the dry line — and do the r226 F6, r231 C3d, r234 DRY2, r235 DRY3, r236
TRAILTALK, r237 OUTING-SEEK, and r238 repay-opener + F5 fall-through fixes
hold in the wild on fresh seeds? Arm: NONE — continuity panel. Metric
binding: pre-registered bars bind; a miss is NO-GO, never re-scored mid-run.

## Infra (this run was flap-shaped)

Host write flap ~19:56–20:19Z (~23 min, started minutes after a VM
replacement): 26KB writes EPERM, 1-byte writes reported OK but landed 0
bytes (silent truncation). No registration until probe-verified CLEAR
20:19:16Z (1B size 1, 26K size 26000). Registration then took 10.6 min
(checkout slow under box load ~16.7). Lock created 19:56:01Z, verified
landed. Consequence: occurrence budget spent waiting; the gate
(`check.js --quick`, ~971s per r238 adoption) goes to adoption (r238
precedent). Proof refresh round 21 already done by the r238 adoption
(`82bfbd751`) — no src/js change this run, so none owed.

## Panel (fixed code)

Exit 0, ~4.3 min. 45765 survived d142 (alive 4); 45766 survived d140
(alive 4); 45767 village-lost d90 (alive 1); 45768 village-lost d138
(alive 2). 2/4 survived. No village won or ended. Logs:
`journey-social-life-r239-panel.log`, per-seed JSONs,
`journey-social-life-r239-analysis.log` (715 lines, exit 0).

- **F6 WILD HOLD — NO-GO: dryLines=1 panel-wide (bar 0).** Breaks the
  hold the r238 adoption had just re-confirmed (0 dry on the r238 seeds).
  The single dry is seed 45766, villager `sigrun_eiriksdottir` (Sigrun),
  C-friendship, day 45 — see Headline finding below. It is a NEW site,
  not the r238 repay opener and not the F5 settled-favor branch.
- **F5 wild (analyzer counter): 3 servings, all on 45766** — V1=1 V2=2
  V3=0; 0 on the other three seeds. Wild count is report-only; the
  harness is the judge. Note V3 never served this panel.
- **TRAIL:** not extracted in-run (analyzer trail/outing lines not
  located before closeout; per-seed JSONs committed — adoption to read).
  The metric-review note stands: the distinct bar (≥6) measures press
  frequency, not pool depth; not re-scored.
- **Outing chain:** 25 attempts counted from outingArm entries
  (45765: 14, 45766: 4, 45767: 1, 45768: 6); kept/delivered + kcal
  tallies not extracted in-run (field names unverified; JSONs committed
  for the adoption to read). No outingArmErrors reported in the panel log.
- **M1 GO:** 8 plots, 8 arms, grievance-linked 8/8 by the reasons bar
  (binding judge); springs 8 (escaped 7, killed 1); 0 expired plots;
  vendetta max 3 (Liam↔Tanina, Mia↔Tariq).
- **M2 rate 0.273** (139 proposals / 510 lived days; r195 0.328, r200
  0.177 — watch only).
- **M3 GO (sometimes-taken):** lure 337 accept / 340 decline; party
  31 accept / 13 decline; bond 5 accept / 14 decline.
- **M4:** 448 transcripts, 181 nearDupFlags — same families as r234–r238:
  Haven-door positioning instruction cluster (dominant), repeated
  live-want re-asks (pantry run / creek water run), teach-lesson
  same-opening template. Instructional repeats, not conversational
  parroting. The M4 split proposal (instructional vs conversational)
  stands for the next run.
- **M5 report-only:** 3/4 past d100. **Moots 7** (mootNotes count).
- **M6 GO** (re-aligned gate definition): away-gate 0 on all four kinds;
  debates kicked/settled 158/156. Strict-definition away total 67 = known
  metric/gate discrepancy, does not fail M6.
- **M7 HOLDS:** NARR-DUP verbatimRepeats 0. **M9 HOLDS:** recap 334
  presses, 0 after cap. **M10 HOLDS / FACE HOLDS:** coach/face verbatim 0.
- **M11 GO:** recap-empty flags 0/181. **M12:** door-req flags 107/181
  (23.88%); worst sitting 7 serves (app_mgpspkzj852, D-talk-request,
  45765). **M12-native HOLDS:** threeTimes total 41, max 1 per sitting,
  0 sittings 2+, exits 102.
- **M8 SETTLED:** 3 settles, 3 link-formed, 0 BLOCKED re-raises after a
  settle.
- **B5:** 23 funerals — 19 full / 4 partial / 0 none. Funeral feasts honest.
- **B6 GO:** 415 want-resolutions, deflected-from-stage-0 = 0.
- **CONFESS:** 38 total, 13 confessed, 13 already-confessed, 4 deflected,
  6 cleared, 2 attacked, 0 double-confession sittings.
- **BOND ANSWERED:** 139 villager-initiated proposals (139 villager + 0
  scholar; 84 link, 55 person; 35 accepted, 14 refused, 60 staged, 30
  expired). Person accepted 16. End bonds per seed: 135 / 88 / 79 / 126.
- **RE-OFFER max 12** (same watch level as r236/r237/r238).
  **DROPPED-THREAD: 1 drop** (458 conversations) — the dry sitting below.
  **SCATTERING: 2/4** (45767 d90, 5 hungry days, 1 alive; 45768 d138,
  3 hungry days, 2 alive).
- **Census:** 45765: 9 successions (Esteban→…→Brian), scholar deaths 9.
  45766: 8 successions (Ruth→…→Marisol). 45767: 13 successions
  (Otto→…→Bonnie). 45768: 13 successions (Ruth→…→Julia). Scholar deaths
  (mantle passes): 43 panel-wide (9/8/13/13).

## Headline finding: ONE wild dry — new site (share_news / gossip-ask)

Sitting: Sigrun Eiriksdottir, C-friendship, day 45, seed 45766, 9 turns,
natural end, trust 59→59. Read in full:

1. NPC: "About that news I was bursting to share — Okay, so — something
   happened this morning."
2. YOU: "What happened?"
3. NPC: "That's the whole of it. Sorry." — the news thread is EMPTY: she
   opens with news to share and has nothing to share.
4. YOU: "Can I ask you something else?"
5. NPC: "Forget I said anything. What did you want?"
6. YOU: "What's the word? What should I know?"
7. NPC: "...Sorry, lost my train of thought." ← THE DRY
8. YOU: "Yeah?"
9. NPC: "They hear you out, but something in them stays guarded."
10. YOU: "Tell me more."
11. NPC: "Okay, so — Ingrid? A physical therapy aide, back before. Solid
    person. Don't say I told you." — gossip DOES flow after; the sitting
    continues naturally and ends "A comfortable quiet settles. They smile
    a little, and let it be." / "Come back anytime."

Characterization (NOT a fix — filed as the next run's arm): the dry sits
at the gossip-ask ("What's the word? What should I know?"), reached right
after a share_news opener that fired with an empty news payload. The
sitting recovers, so the damage is one dead turn mid-conversation, not a
dead sitting — but the F6 bar is 0 and this is a live wild dry on the
fixed code. The r238 fix exempted only the `alive:want` branch's
last-resort fallback; this dry is in a different branch (share_news /
gossip-ask path — verify in source whether the null comes from the want
resolution, the gossip pool, or a ledger-blocked fallback, same class as
the r238 probe). Next run's arm: probe the site, build the proof test,
fix in the same class, re-panel. A second open question rides along: the
empty-news opener itself ("bursting to share" → "That's the whole of it.
Sorry.") reads as a person trailing off, but it is the trip-wire for the
dry — whether the opener should only fire when there IS news is a design
look for the same arm.

## People check (SENSE-TESTING LAW)

The dry sitting read in full above — coherent and human until the gossip
ask; she recovers and gossips about Ingrid naturally. The empty-news
opener is the only other off note in the sitting. No other sitting was
read in full this run (budget); the panel's other watches (M4 flags,
re-offer max 12, dropped-thread 1) match the r236–r238 shape.

## Standing proofs re-run on this base — all green

- repay-fallback (`test-journey-social-life-r238-repay-fallback-20261119.js`): 36/36
- F5 harness (`test-journey-social-life-r238-f5-harness-20261119.js`): 50/50
  (exhaustion [V2,V3,V1,OTHER,OTHER,OTHER], dryCount=0 — the r238 fix holds)
- F6 proof (`test-journey-social-life-r226-f6-dry-opener-20261116.js`): 49/49
- TRAILTALK proof (`test-journey-social-life-r236-trailtk-20261118.js`): 30/30

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/social.json
--current 'evidence/2026-11-19/journey-social-life-r239-*.json'
--metrics l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos,dryRate,l2prime.count`
— LOUD on all five l3.* keys + l2prime.count: the known stale-era schema
drift (driver emits `bondEnd.bonds` / `social.moots`, never `l3.*`; r237/r238
precedent). dryRate quiet. Baseline NOT rolled over schema drift.

## Verdicts

- **Reachable:** yes — social life fires across the full run on all four
  seeds (moots, bonds, confessions, outings, funerals).
- **Fun:** mostly — one wild dry at a new site (gossip-ask after an
  empty-news opener) breaks the F6 hold; the sittings otherwise read as
  people, and the F5 variants serve.
- **Winnable:** not judged on this leg.

## Metric review

- TRAIL distinct bar revision proposal stands (r238, carried): count
  distinct per press-opportunity, or raise presses per outing so the pool
  walks. Distinct FAIL as written; not re-scored.
- M4 split proposal stands (instructional vs conversational repeats).
- F5 wild count: keep report-only while the harness judges. V3 never
  served this panel (V1=1 V2=2 V3=0) — watch whether V3 is thinning.
- OUTING conversion: r238 6/15 = 40%; r239 kept/kcal not extracted in-run
  — the adoption reads them from the committed JSONs before judging the
  ≥25% watch.

## Remainders

- NEW: gossip-ask dry (Sigrun, 45766, d45) — next run's arm (probe + proof
  + fix in the r238 class + re-panel). Empty-news opener design look rides
  with it.
- Zinhle creek-pocket strand (design look, r237); Olivia triple re-ask /
  driver re-ask pestering (filed); repay.engageBeat pools (broken/open);
  M4 split; TRAIL bar revision.
- Gate: `node scripts/check.js --quick` NOT run in this occurrence
  (budget; adoption must run it solo, re-run timeouts standalone before
  attributing, expect the standing set).
- TRAIL + outing kept/kcal tallies: adoption to read from the committed
  per-seed JSONs (not extracted in-run).

## Closeout

Merged locally, pending ship (ship loop owns bump/push/live verify).
Rotation-b 5→6. Lock deleted after run_id verification.
