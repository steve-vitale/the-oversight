# sim-healerbisect-b — prereg Amendment B (written + committed BEFORE any judged sweep at #14)

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1030Z · **Branch:** sim-healerbisect-mid14-b · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1) · **Supersedes:** the screen subset + screen rule of the prereg, for #14 onward only.

## Why the old screen must retire

The screen subset {53004, 53005, 53006, 53008} was chosen because all four
flipped death → 150d survival + sit between the collapsed and healed controls.
It no longer discriminates. At #9 (full-8 confirm,
`sim-healerbisect-midpoint9-full8-b.md`) 3 of the 4 subset seeds are already
healed — 53004 (150d, lesser d90), 53006 (150d, lesser d90), 53008 (150d,
lesser d141) — and only 53005 stays exactly collapsed (54d). The old screen
rule (HEALED if ≥3/4 reach 150d) would therefore fire at ANY #10..#17 point
that merely keeps those three healed, and tells us nothing about the remaining
climb: 53001 67d → 105d, 53003 45d → 65d, 53005 54d → 150d, 53007 59d → 50d
(#9 → healed control). Running a misleading screen would manufacture a false
HEALED at the first #10..#17 point and end the bisect on a lie.

A new screen subset cannot be derived honestly from the per-seed tables: the
four non-subset seeds are exactly the ones that do NOT discriminate cleanly
(53001 survives at #8 but dies at #9; 53003 lives longest at #8, dies earliest
at #9; 53007 never heals anywhere; 53002 heals only at #9). Any subset that
excludes 53005 — the one seed unhealed everywhere in #1..#9 — would hide the
hardest remaining question; any subset that includes it plus three healed
seeds re-creates the same 3/4 problem in reverse. No subset + bars exist that
both discriminate at #14 and would be passed by the healed control itself
without re-introducing the same blind spot. So no new subset is derived.

## Amendment B — full-8 at #14 directly (the recommended default)

- **Every #14..#17 screen from here on runs all 8 frozen seeds
  {53001..53008}** in one invocation, judged on the prereg's full-8 flip bars
  (unchanged): HEALED only if median ≥120d AND sits ≥4/8; COLLAPSED only if
  median ≤90d AND sits ≤2/8; anything between is AMBIGUOUS.
- **Sanity check — the healed control passes these bars:** median 145d, sits
  4/8 (fightloop full-8). The collapsed control passes the other side: median
  70.5d, sits 0/8. The bars are the same ones that already classified #8
  (100d, 2/8 → AMBIGUOUS) and #9 (108.5d, 4/8 → AMBIGUOUS), so #14 is judged
  on the identical scale as its neighbours.
- **Cost:** a full-8 sweep ran ~7 min in the 0830Z window (mid8: smoke ~58s +
  subset ~159s + non-subset ~200s) and the 0730Z 4-seed screen ran in ~50s —
  the box is quiet and the full 8 is affordable. No further subset reduction
  is needed or permitted under this amendment.
- **53005 tracked separately at every screen** (unchanged from the task
  brief): its days are reported on their own line in every per-seed table.
- **AMBIGUOUS rule (prereg rule 5) unchanged:** if #14 reads AMBIGUOUS, run
  the full 8 at the adjacent point before continuing the halving.
- **Bisect continuation unchanged:** if #14 HEALED → flip in #10..#14, next
  #12 `d333c899e`; if COLLAPSED → flip in #14..#17, next #16 `685dc9ec4`.
  The COMBINATION clause still governs if no single landing flips it.
- Nothing else in the prereg changes. The GO bars, flip bars, NO-GO rule,
  instrument, horizon (150d death-aware), policy (doorwalk BASELINE leg only),
  and frozen band stand as written; only the screen breadth for #14 onward is
  changed, disclosed here before any judged sweep at #14.

## Instrument verification for this run (before any sweep)

- Zero commits in `e9399e09e..HEAD` touch any instrument file (driver,
  doorwalk policy, analyzer, screen module, sim-harness, stageally/rally
  policies, sitstep instrument) — `git log` empty. `git diff e9399e09e HEAD`
  on the instrument files is empty: the frozen copies in this worktree are
  byte-identical to the ones used by the #5/#7/#8/#9 runs.
- Flap probe passed 10:38:22Z; worktree heartbeat landed (exit 0).
