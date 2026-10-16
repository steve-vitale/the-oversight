# Minnow placement fixture isolation

Base `fd2a16c48bdaaef5c5032b8852b8dcd3dbfdb989`. The full check during the
Table-opportunity audit failed the already documented hunter-ecology minnow
setup. No runtime had changed. Its helper retries85% crafting but supplies
only6 branches; two paid failures consume all material without making a trap.
The placement assertion then receives “don't have that trap” instead of testing
the water rule. The prior god-support audit retained320 matching seeded controls
and named75/116/142/144; all four reproduce19/20 on this exact frozen base too.

The dry-land fixture now makes one actual craft with a controlled successful
roll, verifies the real trap exists, and adds exact three-branch and32-tick
cost assertions. The existing dry-land needs-water assertion is unchanged.
All four seeds pass23/23. A separate reconstructed source disables only the
water guard; that fails the same placement assertion (22/23), demonstrating
that the repair did not hide the feature defect it is meant to detect.
Other legacy loader/setup debt is outside this narrow fixture repair.

No gameplay, crafting chance, ecology, region or policy change. No test is
quarantined. The separate invitation tooling also runs in the final full suite;
see invitation-audit.md for that complete execution log and its source scope.

```text
node evidence/2026-10-16/minnow-fixture-verify.cjs
node evidence/2026-10-16/minnow-fixture-verify.cjs --current
node evidence/2026-10-16/minnow-fixture-verify.cjs --replay <fresh-directory>
```

Replay reconstructs the pinned base, uses the shared harness RNG before the
legacy loader, compares exact outputs for four before/four after cases, then
checks the explicit runtime mutation. Its changed runtime exists only in the
retained mutation source and temporary replay root, never the published game.
