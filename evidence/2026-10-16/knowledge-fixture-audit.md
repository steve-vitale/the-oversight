# Occupation knowledge assertion: semantic boundary

Base `bd7bdac5b112dbe84a2cc16dfff7037a2396e4e9`. During the invitation tooling
full check, the unchanged knowledge audit reported that “the person in their
30s, with grey-streaked hair” disclosed “ER nurse”. Its assertion takes the
first occupation token and searches for that substring anywhere in the tag.
The letters `er` in `person` are not an occupation disclosure. An intervening
green run did not resolve this stochastic fixture/measurement error.

The F5 case now explicitly uses a truthful ER-nurse/they profile. The old
substring assertion fails deterministically on this fixture (10 pass/1 fail).
The corrected assertion rejects any actual `, the <occupation>` clause before
knowledge; it also asserts the fixture starts without occupation knowledge.
A real `journalLearn` then must reveal `, the er nurse`. This strengthens the
positive earned-information boundary as well as avoiding an incidental letter
match. All earlier knowledge checks stay. Final result13/13, with no skip in
the retained runs. Failed audits no longer print “All green”.

Two reconstructed runtime mutation controls each fail12/13: one bypasses the
heard-occupation gate, the other suppresses the learned readout. Neither runtime
mutation is published. The repair changes only the legacy test, not knowledge,
occupations, game difficulty, data, policies or regions. No quarantine. The
legacy loader still uses wall-clock IDs, so replay verifies semantic outcomes,
not byte equality of incidental generated names/appearance.

```text
node evidence/2026-10-16/knowledge-fixture-verify.cjs
node evidence/2026-10-16/knowledge-fixture-verify.cjs --current
node evidence/2026-10-16/knowledge-fixture-verify.cjs --replay <fresh-directory>
```

Replay retains the original test, the explicit fixture with the old assertion,
the corrected test and both mutation sources. The final complete quick/full
run is shared with the separate invitation-tooling unit; its audit and logs
record the complete tested state. Historical failure evidence remains intact.
