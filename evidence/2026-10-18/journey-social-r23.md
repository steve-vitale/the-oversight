# journey-social r23 (2026-10-18) — leg 5 "social life": the want layer learns manners

## PRE-REGISTRATION (docs/MEASUREMENT.md §11, written BEFORE the pilot ran;
## header comment in scripts/journey-social-r23-pilot-20261018.js)

**Context:** r22 (landed b2a0b6ab8 ~1h before this run) proved bond depth now
colors conversation openers + entry beats + grace beats. Its documented-not-
fixed blank #1: "the want system is bond-blind — a −69 rival still invites
you to 'walk my trap line' and accepts favors warmly ('glad it's you saying
it'). The surface marks the greeting; the want machinery doesn't know about
bonds."

**Queue jump (body allowance):** rotation-b.txt was freshly seeded at 4 by the
new lane-B cron (13:21Z), clobbering the old rotation's write of 5 (r17) and
6 (r22, "crisis next"). Endgame was played twice today (r16 wait-vs-sit,
r17 path-spread — all metrics GO, blanks landed); re-playing it has the
lowest marginal value. The most recent game-code commit (b2a0b6ab8) touched
the social bond system — explicit queue-jump trigger. Played leg 5 (social),
wrote 6 (crisis next, matching the old rotation's intent).

**Leg question:** does the INVITE layer (betrayal.js `npcInviteTick` +
conversation.js startConvo inviteBeat) and the REOPENER layer
(`convoPick 'small'` → `cg.reopeners`) respect bond depth — or do
depth ≤ −1 rivals still present warm micro-quest invites and warm
"glad it's you" reopeners?

**Interesting-finding bar:** ≥1 hostile (depth ≤ −1) villager presenting a
warm invite in the pilot = gap REAL → fix. Post-fix: 0 warm invites from
rivals; the no-repeat ledger unbroken; plot-lure invites keep traveling the
normal channel.

**Binding metrics (§14 — a miss is NO-GO, never re-scored):**
- P1 (pilot gap-invite): ≥1 warm INVITE_DEFS presentment by a depth ≤ −1
  (or v ≤ −25) villager on ≥1/2 seeds.
- P2 (pilot gap-reopener): ≥1 warm reopener spoken by a depth ≤ −1 villager
  on ≥1/2 seeds.
- M2 (post-fix surface): 0 warm invite labels presented by rivals across
  3 seeds; every rival presentment carries its inviteCold line.
- M3 (honesty): 0 fabricated shared events in new cold lines.
- M4 (people): ≥5/6 sense-read transcripts meet the conversation quality bar.
- M5 (guardrail): ≥2/3 seeds end 60d with ≥5 alive; invite volume within
  ±30% of pre-fix; conversation cost unchanged (10 kcal/open).

**Seeds:** pilot 1601, 1602 (fresh); sweep 1601, 1602, 1603. **Horizon:**
DAYCAP=60, death-aware (+10d tail). **Policy:** r22 "favorites" (competent
base + 2 favorites kind, 2 outsiders hostile/theft every 5d).

## Pilot results (pre-fix code)

- **P1 GO (gap REAL):** 8 warm rival invites across 2 seeds. Jessica
  (1602, depth −1/−2, v −33/−57): "Walk my trap line with me? Extra hands,
  extra eyes.", "Come get air with me. I need to think out loud.", "Help me
  haul something back? Too much for one." Ibrahim (1601, depth −1):
  "Come see what I found. You won't believe it." — a villager being robbed
  every 5 days warmly inviting the thief on trap lines.
- **P2 MISS:** 0 warm reopeners in the pilot — the reopener branch (well
  dry + count > 1) rarely fires under the driver. BUT the code audit shows
  the pool is structurally bond-blind (conversation.js:2931, no bond read),
  and the proof test demonstrates it behaviorally (see below). Fix proceeds
  on P1 + the structural audit.

## Blank filled: the invite layer was bond-blind

**Root cause:** `npcInviteTick` (betrayal.js) picks inviters uniformly from
the roster gated only on trust; the presentation (`startConvo` inviteBeat)
and the `betrayal:accept` menu both quoted the warm `INVITE_DEFS` label
verbatim. Nothing in the path ever read `bondGet`. The reopeners pool had
the same blindness.

**Fix (3 files, fiction-led, FIGURE-IT-OUT-YOURSELF):**
1. `src/data/characterGen.json`: `convo.inviteCold` — 5 businesslike lines
   keyed by invite defId (look/carry/air/show/traps). Feeling-level only
   (no claimed events — the bond record has no event history); e.g. traps:
   "Walk the trap line. I need the hands, not the company."
2. `src/js/betrayal.js`: `inviteLabelFor(vid, inv)` — the shared resolver:
   warm label normally, the cold line when the inviter's bond with the
   player is hostile (depth ≤ −1 or v ≤ −25, r22's rival definition).
   Rivals still invite (need is need — and a hostile lure is the betrayal
   design's sharpest tool); the label stops pretending at friendship. Plot
   lures travel the same branch, indistinguishable by design.
3. `src/js/conversation.js`: (a) the spoken inviteBeat resolves through
   `inviteLabelFor`; (b) the `betrayal:accept` menu (betrayal.js) quotes
   the SAME resolved label — the INVITATION HONESTY invariant (landing r7:
   menu quotes verbatim, so spoken and menu can never disagree) now lives
   in one place; (c) rivals skip the warm reopeners pool and fall through
   to the honest exhausted line.

**Design calls:** re-tone at PRESENTATION, not creation — invite volume is
unchanged (the trust pattern keeps banking its 3–4 honest invites; the
betrayal arc keeps its lure surface). The no-shared-language gesture path
(mimes, no words) is untouched — tone doesn't read through a mime.

**Proof** `scripts/test-invite-bond-20261018.js`: **22/22 GREEN**, RED
verified pre-fix via patch round-trip (no stash — repo-global stack):
`inviteLabelFor is not a function` + missing pool on reverted code.
Covers: rival→cold / friend→warm / stranger→warm, plot-lure→cold,
unknown-defId graceful null, spoken beat cold-for-rival, menu quotes the
spoken label verbatim for both, 70-sitting reopener drain (rival 0 warm
reopeners vs stranger 10 — the pool works, it's just bond-gated now),
no fabricated events, no System refs.

**Wild confirmation** (post-fix sweep, 3 seeds): 10 rival invites, **0
warm** (M2 GO). Jessica d17 (depth −1): "Walk the trap line. I need the
hands, not the company." Bolat d29: "Come get air. I need to think out
loud — you're just the nearest ears." Accept-path diagnostic: cold menu
label → accept → spot-aware outcome ("It's quiet at the ridge. Erich
doesn't say much.") — the whole chain is coherent.

## Village assessment (plain words)

Three villages, all alive at the death-aware stop (47/55/61d, 9/9/7
living). The favoritism driver made enemies the honest way: Ibrahim
(1601) was robbed into depth −1 and now invites the thief with clipped
business ("Come see what I found." — the "You won't believe it" warmth
gone). Jessica (1602) sank to depth −2/v −57 and her invitations read
like someone who needs hands and resents needing them. Bolat (1603)
grieves his taken kin aloud ("rows of pods. Humming." — KIN.md surfacing
unprompted) while keeping every invitation clipped. The village's
relationships are now visible in what people ASK for, not just how they
say hello — which was the whole blank.

## People check (6 transcripts sense-read, SENSE-TESTING LAW)

1. **Frieda 1601-d25** (wound-help want): "My wound needs a second pair of
   hands." Driver declines → "...Okay. I'll figure it out. They won't ask
   twice." — the decline has consequences. PASS.
2. **Jessica 1602-d17** (grief + cold trap invite): "I keep expecting to
   see them by the fire. Then I remember." → "Walk the trap line. I need
   the hands, not the company." Accept → "Jessica shows you where they go
   to think. 'Don't tell the others.'" — grief, need, no fake warmth. PASS.
3. **Jessica 1602-d19** (unfinished thread + cold air invite): real
   continuity ("we wandered off it, 4 days back") + clipped invite. One
   dry-line wart after a "Sure." (pre-existing tail-deflection class).
   PASS.
4. **Jessica 1602-d39** (cold haul invite): "Help me haul something back.
   Too much for one. That's the whole of it." Accept → "Here. I made an
   extra." (gift outcome). Need without affection, honest. PASS.
5. **Bolat 1603-d25** (taken-kin grief + clipped show invite): "Tell me
   I'm not the only one." → "Come see what I found." Accept → "You walk
   to the hollow with Bolat. Nothing much there — but they talk the whole
   way." PASS.
6. **Bolat 1603-d29** (favor thread + cold air invite): accept →
   "Bolat has been stockpiling where nobody looks. 'Take half. You've got
   the hands for it.'" (+4 wood/+4 fiber — the reward-class outcome).
   PASS.

**M4 GO 6/6.** No fabricated shared history anywhere; the failure mode
remains absence (dry lines at tails), not invention.

## Metric verdicts (§14)

- **P1: GO** (8/8 pre-fix rival invites warm). **P2: MISS** behaviorally —
  see metric review.
- **M2: GO** — 0 warm rival invites across 3 seeds (10 presentments, all
  cold).
- **M3: GO** — 0 fabricated events (proof-asserted; wild lines are the
  exact authored pool).
- **M4: GO 6/6.**
- **M5: GO** — 9/9/7 alive (3/3 ≥ 5); invite volume 31.3/seed vs 29.5
  pre-fix (within ±30% — the trust pattern banks as before); convo cost
  unchanged.

## Metric review

- P2 as pre-registered (behavioral warm reopeners in the pilot) missed
  because the reopener branch rarely fires under the driver — but the
  code audit proved the pool structurally bond-blind, and the proof test
  demonstrates it behaviorally (70 sittings: rival 0, stranger 10 warm
  reopeners). The fix is justified by the structural gap + proof, not the
  pilot miss. Future reopener metrics should drive well-draining (many
  sittings), not single sittings.
- Telemetry: **quiet** vs `telemetry-baselines/social-60d.json`
  (end.day, end.alive, convos — 3 files, no large deviations). Baseline
  NOT rolled forward (nothing deviated). New r23 metrics
  (invitesPresented, rivalInvites, warmRivalInvites: 0/10 warm) are
  first-measurement, recorded here.

## Regressions

- test-invite-bond-20261018 (new): 22/22 (RED verified pre-fix).
- test-bond-surface-r22: 25/25 · test-betrayal: 79/1 (1 pre-existing,
  pristine-verified: "no strangers before notability") ·
  test-scholar-bonds-20261013: 12/12 · test-party-bond-20261012: 45/45 ·
  test-justice: 61/61 · test-cache-theft-suspicion: 71/1 (1 pre-existing,
  pristine-verified).

## Verdict

- **Reachable: YES.** Rivalries form through the existing theft→grievance
  path; the invite layer now reads them. No new unlocks, no new gates.
- **Fun: YES.** Rivals who need your hands but won't pretend to like you
  are better drama than rivals who invite you like friends — and the
  hostile lure ("Walk the trap line. I need the hands, not the company.")
  is the betrayal design's sharpest tool, now honest.
- **Winnable: YES (guardrail).** Survival parity held; invite volume
  parity held; no new death mode.

**Land:** src/data/characterGen.json, src/js/betrayal.js,
src/js/conversation.js, scripts/test-invite-bond-20261018.js,
scripts/journey-social-r23-pilot-20261018.js,
scripts/journey-social-r23-sweep-20261018.js +
evidence/2026-10-18/ (pilot/sweep per-seed JSONs, journey-social-r23.md,
75 transcripts under social-r23-transcripts/). No [needs-eyes] —
mechanical + content, Steve's call on voice on review (r22 precedent).
Merged locally, pending ship.
