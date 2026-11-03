# sim-guarde-entry-deploy-b — Guard-E entry-checked allow DEPLOYED into the live guard

Arm: gap round 2026-11-02, item 7 (gameplay build, [needs-eyes] — veto
wording is player-facing text).
Worktree: gap-guardedeploy, branch gap-guardedeploy, base a63ffc8c9.
This worker does NOT merge, push, bump, or verify live; the coordinator
merges. No jest, no check.js run (coordinator runs check.js --quick
serialized at merge, per brief).

## What was built

The entry-checked allow validated as an instrument in sim-guarde-entry-b
is now the LIVE veto rule in the guard-E path
(scripts/policies/competent-homewardstep-b.js, installGuard):

- BEFORE: a guarded step was vetoed only when the escape check E (can
  you get home from the destination?) failed.
- AFTER: a guarded step is vetoed when E fails OR when the step into
  the destination itself is blocked (checkHop blockers non-empty).
  The veto rule is allow' = E ok AND entry clear, computed by the new
  exported core allowFromParts / allowPrimeForHop, which the proof
  test exercises through the live module — not through a second copy
  of the rule.

Two deploy decisions the instrument arm deliberately left open, now
decided and built:

1. VETO WORDING (player-facing, hence [needs-eyes]). An entry veto
   names the barrier on the step itself; the escape line is kept
   verbatim for escape vetoes only:
   - escape (E fails): "You don't walk there — you couldn't get home
     from there." (unchanged)
   - entry creek: "You don't step there — the creek runs fast here,
     with no bridge and no swim."
   - entry washed_out: "You don't step there — the path is washed out."
   - entry rubble (credit already spent, see below): "You don't step
     there — rubble chokes the path."
   - entry fallen_tree: "You don't step there — a fallen tree blocks
     the way in."
   - other/unknown entry: "You don't step there — you can't get in
     that way."
   Veto memory is unchanged: the first veto of a destination speaks,
   repeats are silent, whatever the cause. The hop log now records
   allowPrime, entryBlockers, carveOutUsed and vetoCause, and a new
   ctx counter homewardstepEntryCreditUses counts carve-out allows.

2. ROADWORK CREDIT-POOL CARVE-OUT. The entry check SHARES E's one
   roadwork credit; it does not create a second one. A rubble-only,
   single-tile entry blockage passes only when E's evaluation spent
   no credit (esc.creditUsed === 0). When E already spent the credit
   on the way home, the rubble entry vetoes. Creek, washed_out,
   fallen_tree and multi-tile entries never use the carve-out, and
   the carve-out never rescues an E failure. Rationale: rubble is the
   one barrier the game lets a scholar clear by roadwork, and E's
   model already counts exactly one such clearing per evaluation —
   so the entry step and the way home together still cost at most
   one clearing job, never two.

UNCHANGED, by design: E itself, its lateral legs, its thresholds
(gating freeze — no threshold was touched, none needed changing),
veto memory, all passthroughs (self-call, combat, force, game over),
the sibling guard copies (outwardonly, latescape), the variant
instrument module, competent.js, the creekhop recorder, and src/js
(zero src/js changes). No default flips: the guard file IS the live
guard-E path (registered in sweep-compare's policy registry and used
by the homewardstep drivers); no policy-default file was changed.

## Proof (node, no new sims)

scripts/test-guarde-entry-deploy-b.js — 33/33 PASS.

Before/after on identical scenarios: the validated sim-guarde-entry-b
corpora replayed through the LIVE record function
(allowPrimeFromRecordLive), A band 69501-69508 + C band 69606-69607:

| Measure | Before (E alone) | After (live allow') |
|---|---|---|
| Allow-pass fidelity (allowed hops that moved) | 24/28 A, 1/3 C | 25/25 pooled (A 24/24, C 1/1) |
| E-fail hops still vetoed | 6 | 6/6, 0 veto changes |
| Entry agreement (entry clear iff engine moved) | — | 37/37 |
| Allow-to-veto conversions | — | 6, all engine-refused (5 creek, 1 washed_out) |
| Live allow vs validated allow' | — | identical on all 37 hops |
| Carve-out fires on validated corpus | — | 0 times (no rubble entry occurs there) |

Live installGuard on stub Games: clean hop allowed with no line;
creek / washed_out / fallen_tree entries vetoed with their entry
lines (never the escape line); escape failure vetoed with the
escape line verbatim; rubble entry allowed via the carve-out when E
spent no credit (log carveOutUsed, ctx counter 1); veto memory
still silences the second veto of a destination (2 vetoes, 1
spoken). Shared-pool rule at unit level: rubble entry vetoes when E
spent the credit, creek entry never passes on credit, two-tile
rubble and mixed rubble+creek entries veto.

Predecessor proof re-run as a regression check:
scripts/test-guarde-entry-b.js 29/30 — the single failure is its
reused-files-unmodified check naming competent-homewardstep-b.js,
which this deploy intentionally edits. Every fidelity, veto and
entry number in that proof still passes (24/24 allow', 34/34 entry,
0 veto changes). That check was the instrument arm's "no live change"
guard; it is superseded by this deploy by design, not broken by
accident. The coordinator should expect it red on this branch and
decide the green-list disposition at merge — this arm does not edit
predecessor proofs.

## Plain words (what a player / guard experiences)

Before, the guard would wave a scholar onto a step the land itself
refuses — a fast creek with no bridge, a washed-out path — and the
scholar would be turned back by the land with no guard voice at all.
Now the guard fences those steps first, and when it does, it says
plainly why that step can't be taken ("the creek runs fast here",
"the path is washed out") instead of blaming the way home. Steps
that could strand the scholar — no way home from beyond them — are
still fenced exactly as before, with the same old line. And a step
blocked only by rubble is still allowed when the scholar hasn't
already spent their one roadwork clearing on the way home: rubble
is work, not a wall. Nothing else about the guard changes — no new
barriers, no easier or harder thresholds, no new voice where the
guard used to stay silent.

## Held / open (not built, with reason)

- NOTHING held for threshold reasons: deploy required no threshold
  change, so the gating freeze never triggered.
- Carried open question (from sim-guarde-entry-b, out of this arm's
  scope): should the guard speak when an ALLOWED hop is
  engine-refused? This deploy only fixes the wording of vetoes the
  guard itself makes; allowed-hop refusals still speak only the
  engine's lines, as before.
- Haven-entry note: a step INTO haven that the engine itself would
  refuse is now vetoed like any other refused step (the old "arriving
  home is never vetoed" was a property of E alone). This is not a
  new stranding — the step could not have happened anyway — and no
  validated hop exercises it.

## Files changed (this commit)

- scripts/policies/competent-homewardstep-b.js (live guard deploy)
- scripts/test-guarde-entry-deploy-b.js (proof, 33/33)
- evidence/2026-11-02/sim-guarde-entry-deploy-b.md (this file)
