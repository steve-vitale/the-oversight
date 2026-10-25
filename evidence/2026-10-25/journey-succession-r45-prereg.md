# Journey succession r45 — VOUCH SNAPSHOT + OFFICE WRITERS (lane B, pre-registration 2026-10-25)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r44's two named next steps, on the same regime as r44 so the
comparison is apples-to-apples. No game change is proposed or expected; this
is an instrument run. If a gap closes, the NEXT run's bars change; this run's
bars below bind regardless.

## The two gaps (from r44's run note, 2026-10-24)

1. VOUCH SNAPSHOT TIMING. r44's 25003 seed fired a vouch line while the
   post-death snapshot showed 0 eligible vouchers: the say dump proved Daria
   and Jorge vouched on d33 and died that same day (2 HP / 8 HP, no healer)
   before the snapshot saw a 5-person roster. r44's instruction: "Next run
   must snapshot voucher eligibility inside the playerDeath wrapper."
   r45 records the FULL eligible set BEFORE the scripted kill (living roster,
   trust >= 60, excluding the old bearer; the successor is removed
   post-hoc since the successor cannot vouch for themselves) and compares it
   against the funeral-time snapshot. A vouch line is "explained" if its
   voucher was eligible at death even if dead by funeral; a seed fails only
   if an eligible-at-death voucher is ALIVE at funeral and no vouch line
   fired. Died-in-between vouchers carry a fallen/lineage cause lookup.
   Organic phase-A deaths have no pre-death snapshot (the death already
   happened when detected); they fall back to r44's funeral snapshot and are
   flagged "organic, pre-snapshot n/a" — never silently treated as scripted.
2. OFFICE-MOVE WRITERS. r44's E3 narrowed but did not close: ZERO movement
   days carry a phoenix/broadcast/gift line; candidate channel WORD TRAVELS
   reputation talk on 3 moves; the rest pair with crisis/System/item lines
   or nothing nameable. r44's instruction: "Writer instrumentation (not more
   correlation) is the next step." r45 widens the instrument to a full
   day-line census on every move day, bucketed (bearer-name, gift/share,
   rumor/reputation, crisis/System, driven-convo, other) with sample lines,
   plus the move magnitude/direction and the village-mean delta that day
   (officeDaily now carries villageMean). Buckets are reported as a census,
   NEVER as attribution: a bucket's presence on a move day is a candidate,
   not a cause. True writer attribution would need trapping the trust
   mutations themselves; the trust map has ~30 writer sites across the
   codebase (game.js, abilityActions.js, betrayal.js, ledger.js, ...), so a
   trap-all run is a bigger instrument project, named here for a later run,
   not attempted in r45.

## Adopted from r44 (standing permissions)

- M3 uses ECHO V2 as its bar (r44: "Next run may use v2 as its M3 bar; old
  filter retired for this purpose"). r44's E1: v2 reconciliation exact 5/5,
  delta hits 5/5 genuine.
- MG2 is computed ONLY from the successor's own meal audit (lastPlayerMeal +
  "Half ration" voice on the successor's days). Funeral half-ration lines are
  village-wide rationing (voted rations, triage choice, cistern shortage),
  never the successor's gated meal (r44 artifact, confirmed closed by
  construction in r44's code and kept closed here) — they are reported, never
  counted toward MG2.

## Leg question

Do the two r44 instrument gaps close with (a) a death-time voucher snapshot
and (b) a full bucketed day-line census on office-move days — without
inventing causes or attributions the evidence does not support?

## What counts as an interesting finding

- V1: every scripted seed records a non-empty pre-death eligible set, and
  the new verdict rule resolves every seed (vouch fired / explained-by-death
  / FAIL) with no "0 eligible" artifact like 25003's. A FAIL (alive
  eligible voucher, silent funeral) is a REAL BUG, not an artifact.
- W1: 100% of move days carry a census; the analysis names the top bucket(s)
  per move direction. If rumor/reputation dominates upward moves, the WORD
  TRAVELS candidate hardens. If most moves still pair with "other" only,
  the writers list is still incomplete and the trap-all instrument is the
  named next step.
- M3v2, M1, M4, MG2, M5 stay green: any regression is a REAL BUG, fail
  loudly — same as every succession run.
- Any chain death lands UNKNOWN: the gap is real and named (which list
  missed it, and why).

## Binding metrics (§14)

- V1 (vouch snapshot, THE question): 5/5 scripted-or-organic seeds resolve
  under the new rule with no snapshot-timing artifact. FAIL = an
  eligible-at-death voucher alive at funeral with no vouch line.
- W1 (office writers, THE question): 100% of office-move days carry a
  bucketed census + magnitude + villageMean delta.
- M3v2 (social echo, v2 bar): on >= 4/5 seeds, >= 2 v2 mentions of the dead
  bearer within 7 days of death (funeral-arc lines excluded).
- M1 (funeral arc): >= 4/5 deaths produce (a) the death beat naming the
  bearer, (b) recoverBearer <redacted> 2 days, (c) the burial act completable.
- M4 (machinery): 5/5 mantles clean (linOk + moOk).
- MG2 (meal gate): 0 violations on 5/5 seeds (established successor never
  half-voiced; funeral lines excluded by construction).
- M5 (people check): 0 identity failures across sense-read transcripts.
- Chain deaths: every chain death cause-known from fallen/lineage, or
  reported UNKNOWN with the missing list named.

## Seeds / policy / horizon

Seeds 26001–26005 (fresh band: no journey-succession evidence file uses
26001–26005). Policy: competent (same as r41–r44).
Horizon: phase A competent, then 30d competent play as the successor.
Death-aware stop (+10d tail).
- 26001, 26002: EARLY_KILL_DAY=10 — the low-trust regime, same as r44.
- 26003, 26004, 26005: standard 40d phase A — contrast regime.
Kill via the REAL playerDeath ('a hushwolf') unless the mantle passes
organically in phase A (honored per the standing rule).
Convo checkpoints: d+3, +7, +14, +30 (2 top-trust villagers each).

## Metric review

- (Filled at run close. If any binding metric proves wrong, the revision is
  proposed here for the NEXT run, never re-scored mid-run.)
