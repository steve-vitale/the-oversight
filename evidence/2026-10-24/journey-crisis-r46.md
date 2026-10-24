# Journey crisis r46 — the sick-invite gate (2026-10-24, lane B)

Worker: playtest-loop-2. Worktree: journey2-crisis (registered, heartbeat ok).
Rotation: read 6 (crisis), wrote back 7. Fresh angle: **the micro-invite
pathway** — r42's sick-stay-home gates covered expedition departure + guard
companions, but nobody had checked the betrayal micro-invite channel
(npcInviteTick → betrayal:accept → trap-line walk). Completes r42's loose
ends: M6 (16 transcript sense-reads) done here; r42 gates re-verified 7/7.

## Pre-registration (docs/MEASUREMENT.md §§9–12, §14)

- **Leg question:** do the r42 sick-stay-home gates (extended r46 to the
  micro-invite pathway) hold in natural outbreak play?
- **Seeds:** 101/202/303/404 (r42 comparability). **Policy:** oracleV2
  (competent). **Horizon:** 120d (20 establish + 100 window), death-aware
  stop (pop<=1, +10d tail).
- **Staged:** day 20, v.sick injection on 3 living adults (r42's own fallback
  instrument; documented, not hidden).
- **Metrics (§14-bound):**
  - M1 (tick gate): 0 pending invites ASSIGNED to a sick villager (assignment
    day in the villager's dawn-sick day set; betrayal plot lures exempt by
    design — see design call). GO if 0.
  - M2 (accept gate): 0 invite-walk outcomes accepted by sick inviters. GO if 0.
  - M3 (away parity): 0 sick departures via v.away diff (r42 M5). GO if 0.
  - M4 (mechanism live): ≥1 pending invite assigned to a well villager per
    seed — else M1/M2 are vacuous. GO if met.
- **Interesting finding:** any M1/M2 violation → the r46 fix has a hole; fix
  in-worktree.

## What was found (1 blank, fixed + proof-tested)

**F1. FIXED — the micro-invite pathway walked the feverish out**
(src/js/betrayal.js, 16 lines + comments). r42's gates covered expedition
departure (villager-agency.js) and guard-companion selection
(villager-objectives.js) but not the betrayal micro-invite channel:
npcInviteTick() assigned pending invites to sick villagers, and
acceptInvite()/resolveInvite() walked out with no sickness check.
Transcript-verified in r42's own evidence (seed303 d4): feverish Paola
invited the player to walk her trap line, and `betrayal:accept` walked them
both out — "You walk to the trap line with Paola..."

Fix, two gates:
1. `npcInviteTick` skips sick villagers when assigning invite ideas — the
   feverish rest by the fire (r3 F1); they don't get the itch to walk the
   trap line.
2. `acceptInvite`: a pending issued before the fever hit still resolves, but
   the walk doesn't happen — the inviter's body vetoes honestly at accept
   time: `"All right —" Paola starts to stand, then sinks back down.
   "Maybe not today. The fire's got me."` Armed plot ambushes are unaffected
   (a lure is a lure).

**Design call (Steve's overrule invited): plot lures EXEMPT from the
sick-invite gates.** A sick villager can still be chosen as a betrayal
plot's lure ("whoever the target trusts most — the cruelest cut"). Rationale:
an armed scheme doesn't pause for fever; the fever is the perfect cover; the
walk is a short lure-walk in the ambush fiction, not an expedition
departure; r42 never scoped the betrayal system. Noted at armPlot().

## Played

- `scripts/journey-crisis-r46-sickinvite-20261024.js` (new instrument): 4
  seeds × 120d oracleV2, staged day-20 outbreak, wraps acceptInvite, dawn
  sick/away/pending snapshots, 16 outbreak convos driven. Evidence:
  `evidence/2026-10-24/journey-crisis-r46-sickinvite-{101,202,303,404}.json`
  + 16 transcripts.
- **All 4 seeds: M1 GO, M2 GO, M3 GO, M4 GO** (0 violations, 0 ambiguous, 0
  sick walk-accepts, 0 sick departures; 295–335 well pendings/seed).
- **Seed 303 day 49: the veto fired IN THE WILD.** Sick Paola Perez's
  pre-fever pending accepted → "Maybe not today. The fire's got me." The
  same Paola who walked the trap line feverish in r42's transcript. The
  fix's exact scenario, closed in unscripted play. (Well Joshua Baker's
  accept the same day walked out normally — the contrast is the proof.)
- Smoke-test catches (instrument, not metrics): v1 false-flagged a
  recover→re-sicken cycle as a violation — fixed with dawn-snapshot day
  sets; v2's "violation" carried plotId — led to the exemption design call.

## Village assessment (plain words)

- **Seed 101:** 5 alive. Six outbreak windows weathered (peak 3 sick); the
  village held.
- **Seed 202:** 6 alive. Four windows; intact.
- **Seed 303:** 8 alive. Five windows; intact. Paola's veto here.
- **Seed 404:** collapsed to a single survivor (Imani) by day 120 — six
  outbreak windows (peak 4 sick) ground the village down. Caveat: this
  instrument's census counts roster-flagged dead only; departed/dead-off-
  roster aren't distinguished, so per-seed death attribution is a gap for
  the next instrument.

## People check (SENSE-TESTING LAW)

- **Paola's veto (seed303 d49): PASS** — human, personality-consistent
  ("Arguments cost calories... Peace isn't the absence of fighting. It's the
  presence of dinner."), conversation continues coherently after the veto.
- **Sick favor arcs** (Willie, Salvatore, Joshua, Katarina, Riley): PASS —
  sev2 sickness outranks hunger (r8 F2 holding); tending wants read as real
  need ("I'm burning up and there's nothing left in me. Someone who knows
  sickness — please.").
- **Grief texture** (Ruth Goldstein on Sari, d59): "Nobody says Sari's name
  right yet. We will. Give it a few days." + picking up the dead's work
  share — PASS, genuinely human.
- **Layla Adeyemi (d6):** "I sleep in shifts now — two hours, up, listen,
  two more. My body learned it before my head agreed." — PASS.
- **Driver artifacts handled gracefully:** favor_requirements / recap /
  nv:nod loops escalate irritation ("I've told you three times now") and
  exit cleanly; betrayal:accept on a well villager walks out coherently
  mid-conversation.
- **r42 M6 (16 transcripts) sense-read: PASS** with the one FLAG that became
  this run's F1. Minor wart noted, not fixed: "And... scene. Good talk."
  (seed101 d5, Josefine) — a stage-direction leak after the requirements
  loop; documented.

## Reachable / fun / winnable (crisis leg)

- **Reachable:** yes — the gates fire through the natural v.sick pathway;
  the veto surfaced in unscripted play (seed303 d49).
- **Fun:** the feverish now behave feverish — they stay by the fire, ask for
  tending, and bow out of walks honestly instead of teleporting through
  their sickness.
- **Winnable:** unchanged difficulty; this run adds honesty, not teeth.

## Metric review (§14)

Pre-registered M1–M4 all GO on all 4 seeds. No goalposts moved. The two
pilot instrument corrections (dawn-day sets; plot-lure exemption) are
instrument fixes, not metric changes — the gates measured the same thing
throughout. The plot-lure exemption is a **design call** (above, for Steve's
overrule), not a metric relaxation: plot lures were never in r42's gate scope.

## Telemetry

New angle baseline seeded:
`hidden_files/telemetry-baselines/crisis-sickinvite.json`
(tickGateViolations 0, acceptWalkBySick 0, sickDepartures 0, wellPendings
1244, sickVetoes 1 across 4 seeds). Check quiet post-seeding. Future runs:
any violations ≥3 fire LOUD.

## Regressions

- New proof `scripts/test-sick-invite-gates-20261024.js`: **10/10 GREEN**,
  RED-verified (3 fail on pristine code — the exact gate assertions; the
  pristine accept line walks the sick villager out).
- r42 proof `scripts/test-sick-stayhome-gates-20261022.js`: **7/7 GREEN**
  (no regression on the expedition/guard gates).
- `check.js --quick`: **282 passed, 5 failed — all 5 pre-existing**, the
  stale phone-frame proof (receipts predate c0624737b/6c08dd39c/c94951675;
  verified betrayal.js + index.html hashes stale at HEAD, before my change).
  Unrelated to this run; needs a browser-receipt refresh per
  MOBILE-PLAYTEST.md — flagged for the main agent/ship loop, not fixed here
  (detached run, no browser approval path).

## Files

- Fix: `src/js/betrayal.js` (npcInviteTick sick skip + acceptInvite sick veto
  + armPlot exemption note)
- Proof: `scripts/test-sick-invite-gates-20261024.js` (10/10)
- Instrument: `scripts/journey-crisis-r46-sickinvite-20261024.js`
- Evidence: `evidence/2026-10-24/journey-crisis-r46-sickinvite-{101,202,303,404}.json`
  + 16 transcripts (`journey-crisis-r46-seed*-d*-{sick,well}.txt`)
