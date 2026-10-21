# Time settlement and durable saves

`timeSettlement.js` installs after `Game.init` completes, around the final
synchronous `tickAction`, `advancePart`, `endDay` and `sleep` methods. Load
engine extensions before initialization, as the entry page/shared harness do.
Keep new before/after-dawn hooks inside this chain. A direct endDay call needs
the same protection as Sleep or a clock action.

Nested `Game.save()` requests still run `syncRun` normally. The storage write
is deferred until the outer successful time call has finished all hooks and
waking recovery. One complete run payload is then committed through the
ordinary Game/state saver. Readiness, costs, metabolism, healing, RNG and
Table thresholds are unchanged. A skipped/refused action with no save request
does not conjure a new checkpoint. Legitimate death/win wipes and tombstones
remain immediate; the transaction never resurrects an ended run.

Save results during time settlement:

| Result | Meaning |
| --- | --- |
| `deferred` | Requested inside time settlement; no durable write yet |
| `settlement_failed` | This in-memory state suffered an uncaught settlement failure; reload/Continue before playing further |
| `true`, `false`, `stale`, `tombstoned` | Existing saver results outside the transaction or at final commit |

Never interpret a truthy string as durable success. The app's periodic save
consumer checks explicit results and gives compact reload/Continue guidance.
A thrown time failure keeps the prior payload and blocks later autosave/unload
of that partial state. A coherent completed dawn whose storage write fails can
retry normally; quota/index errors remain distinct from partial settlement.
An invalid completed clock also refuses persistence rather than clamping time.

This protects future writes. It cannot reconstruct an already-written legacy
partial night without a known earlier checkpoint. Keep the retained day266/
part4 artifact as evidence; never replay metabolism or invent a replacement
clock to call that save recovered. Existing optional hooks that swallow their
own errors remain a separate audit; the transaction does not claim to identify
every possible semantic failure inside those hooks.

The shared-kit tests run automatically in quick/full:

- `test-time-save-settlement.js`: real pre/post-core writes, direct/part/clock/
  Sleep entry, completed recovery and Continue.
- `test-time-save-crashes.js`: five actual child-process exits, separate fresh
  recovery processes, before/after commit and before index update.
- `test-time-save-failures.js`: reported throw before/after core, refused partial
  retry, quota, stale tab, tombstone, index failure and reload/new-run recovery.

See `evidence/2026-10-20/overnight-save-audit-r1.md` for natural/prepared mobile
scope, unchanged all23 metrics, source identities and publication gates.
Persistence changes can alter a human Continue even when no numeric lever
changes; bot campaigns without reload cannot establish that boundary.
