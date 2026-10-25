# Journey succession r46 — CALL-SCOPED OFFICE ATTRIBUTION + ECHO V2B (lane B, pre-registration 2026-10-25)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
This run takes r45's three named next steps, on the same regime as r45 so the
comparison is apples-to-apples. No game change is proposed or expected; this
is an instrument run. If a gap closes, the NEXT run's bars change; this run's
bars below bind regardless.

## The three gaps (from r45's run note and metric review, 2026-10-25)

1. ECHO V2B (r45 metric review, THE M3 fix). r45's M3v2 stayed GO on the
   letter, but 26002's v2 count of 2 contained zero villager-talk mentions:
   one day+3 marker beat + one LOOT line ("You take unknown nuts, stick,
   stick, stick from Tanya. Your hands know what they did."). r45 proposed:
   next run reports v2b = v2 minus take/loot/inventory-transfer lines,
   alongside v2, and the M3 bar moves to v2b. Rule (fixed here, never
   adjusted mid-run): a v2 line is excluded from v2b iff it matches
   /^You take /i (an inventory-transfer line spoken in the player's voice).
   Convo echo is unchanged (villager speech, never a loot line). The
   excluded lines are reported as a sample, not hidden.
2. CALL-SCOPED OFFICE ATTRIBUTION (r45's trust-mutation trap, cut down to
   a buildable step). r45's day-line census left "other" at ~90%+ of every
   move day and named the trap-all instrument (~30 writer sites) as the next
   step. Trapping all sites in one run is still too big. This run narrows
   from the DAY to the CALL: officeDaily is already per runDays-call, so
   for every post-death runDays call this run records office before/after,
   the per-villager trust-map diff across that call, and the say lines
   emitted DURING that call (bucketed with r45's buckets). A move call's
   trust diff shows whether the move rode on one villager (deed target,
   concentrated) or the whole roster (diffuse, event-like); the call's own
   lines are the candidate mechanism, not the whole day's 500 lines. This
   is still census, never attribution — but a call census is ~10x narrower
   than a day census, and a concentrated diff + a gift/deed line in the
   same call is a far stronger candidate than a day-level co-occurrence.
   Cross-check (binding): every officeDaily move must have a matching
   callMove on the same day; a missing match is an instrument bug, not a
   game finding.
3. DIED-BETWEEN FIELD TEST (r45 gap, opportunistic). r45's diedBetween was
   empty on all 5 seeds, so the branch built for the 25003 class is still
   unexercised in the wild. It cannot be forced honestly (it needs an
   eligible voucher dying the same day as the bearer). This run keeps the
   branch and the same seed mix as r45 (2 early-kill + 3 mature), which
   maximizes eligible vouchers on the mature seeds. If it fires, the
   verdict rule is exercised for real; if it stays empty, that absence is
   reported, never treated as a pass of the branch.

## Adopted from r45 (standing permissions)

- Vouch snapshot rule unchanged (pre-death eligible set; FAIL only if an
  eligible-at-death voucher is alive post-death and silent).
- MG2 computed ONLY from the successor's own meal audit (funeral
  half-ration lines are village-wide rationing, excluded by construction).
- Day-line office census (r45 W1) is KEPT for continuity and reported
  alongside the call census — the call census does not replace it in this
  run, so r45-vs-r46 day comparisons stay valid.

## Leg question

Does narrowing office-move evidence from the day to the runDays call, plus
a loot-excluded echo bar, move the succession leg's two open instrument
questions forward — who writes office moves, and does the dead bearer
still echo in villager speech?

## What counts as an interesting finding

- C1: every officeDaily move has a callMove; call censuses sum to call
  line totals; on a majority of move calls the trust diff concentrates
  (one villager >= 5, or the office entry itself moves alone) OR the
  call lines name a mechanism — either pattern is a finding, and which
  one wins decides whether the NEXT step is deed-target trapping or
  event trapping.
- M3v2b: v2b >= 2 on >= 4/5 seeds. If a seed's v2 passes but v2b fails,
  that seed's "echo" was loot, and the run note says so plainly.
- V1, M1, M4, MG2, M5 stay green: any regression is a REAL BUG, fail
  loudly — same as every succession run.
- Any chain death lands UNKNOWN: the gap is real and named (which list
  missed it, and why).

## Binding metrics (§14)

- V1 (vouch snapshot, carried): 5/5 seeds resolve under r45's rule with
  no snapshot-timing artifact and no FAIL.
- C1 (call attribution, THE question): 100% of post-death officeDaily
  moves have a matching callMove (same day) carrying office before/after,
  a per-villager trust diff, and bucketed call lines summing to the call
  line total.
- M3v2b (social echo, v2b bar): on >= 4/5 seeds, >= 2 v2b mentions of the
  dead bearer within 7 days of death (funeral-arc lines excluded, loot
  lines excluded by the /^You take /i rule). v2 is reported alongside
  for continuity; v2 alone no longer passes M3.
- M1 (funeral arc): >= 4/5 deaths produce (a) the death beat naming the
  bearer, (b) recoverBearer <redacted> 2 days, (c) the burial act completable.
- M4 (machinery): 5/5 mantles clean (linOk + moOk).
- MG2 (meal gate): 0 violations on 5/5 seeds.
- M5 (people check): 0 identity failures across sense-read transcripts.
- Chain deaths: every chain death cause-known from fallen/lineage, or
  reported UNKNOWN with the missing list named.

## Seeds / policy / horizon

Seeds 26011–26015 (fresh band: no journey-succession evidence file uses
26011–26015; r45 used 26001–26005). Policy: competent (same as r41–r45).
Horizon: phase A competent, then 30d competent play as the successor.
Death-aware stop (+10d tail).
- 26011, 26012: EARLY_KILL_DAY=10 — the low-trust regime, same as r44/r45.
- 26013, 26014, 26015: standard 40d phase A — contrast regime.
Kill via the REAL playerDeath ('a hushwolf') unless the mantle passes
organically in phase A (honored per the standing rule).
Convo checkpoints: d+3, +7, +14, +30 (2 top-trust villagers each).

## Metric review

- (Filled at run close. If any binding metric proves wrong, the revision is
  proposed here for the NEXT run, never re-scored mid-run.)
