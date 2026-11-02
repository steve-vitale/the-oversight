# sim-mustergap-b PREREG ADDENDUM (committed BEFORE any gap2 run)

The gap1 arm (commit 1413fdc19 semantics: one titanCommitOwn tap per
daily) is measured and preserved, not rewritten. Its finding forces a
second arm: the two-tap confirm is NOT a two-day action. titanCommitOwn
recomputes its volunteer set on every call and keys the pending confirm
to that exact set (titanId + ':' + cands.join(',')); when the pool churns
between taps, the second tap resets pending instead of committing. A
player double-tapping the button in one sitting commits immediately (no
state moves between the two taps); a policy tapping once per daily does
not simulate that verb — gap1 on 97338 stuttered 13 days and committed
only 1 blade, and on 97330 took 3 confirms over 4 days. Gap1 therefore
measures a weaker, non-player action, and its numbers must not be cited
as "what Haven adds if committed."

## New arm: gap2 (button-faithful commit episode)

Same seeds, same stack, same DAYS=180 cap, same GO (audit + lever naming
unchanged — this addendum changes only the prototype's tap cadence, not
the judged metric). Gap2 policy (scripts/policies/mustergap.js, new
commit): after the call sounds, on the first daily where the sounded
coalition still stands and the gate is unmet, fire ONE commit episode:
call titanCommitOwn twice in the SAME daily (tap + confirm, as the
button offers), then stop — one episode per muster, no daily re-taps
(the gap1 daily null-line spam was itself un-player-like). If the verb
reports nothing free, the episode ends with that answer recorded.
Per-seed records: evidence/2026-11-02/perseed-mustergap-b/mg-gap2-s<seed>.json.
Driver: scripts/mustergap-driver-20261102.js, ARM=gap2.

Expected button-faithful what-if (from route call-day volunteer counts):
97330: 3 vols -> 9 total; 97338: 3 vols -> 9 total; 97342: 0 vols -> 6
total (commit leg worthless there); 97301/97310: gate already met, leg
idle. Gap2 verifies these, not assumes them.
