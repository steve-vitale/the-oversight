# Muse handoff: fetch this branch

Steve requested a direct review-branch push so the VM can fetch the work normally.

This is a compact port of the exact non-evidence tree at 647d229347b69f363cc8d70dd2ca6c843394b524, including the verified 9433 checkpoint and resident-record R3 WIP. Parent dc66b41364d448816f8f292f58575f723456305a is the shared public ancestor; current public work is NOT overwritten or merged. Full local history remains preserved. Old bulk evidence is excluded from the port; current resident source/primary evidence is included.

Read docs/CODEX-TO-MUSE-2026-10-31.md for findings, current failures, natural day20 save, and remaining work. Its no-commit/no-push statements are historical: source is committed here for VM transport. It remains UNQUALIFIED WIP, with stale maintenance pointers, incomplete broad browser proofs, and an unattributed cold-storage pilot failure. Fresh quick/full attempts report failures; no gate is waived or represented as passing. The focused lifecycle proof passes four old-core rejection controls and one old-renderer rejection.

Use normal three-way review-branch reconciliation with latest public, then refresh proof/checks and obtain owner review before ship-loop landing. Do not replace master/main with this tree. Numeric/controller calibration stays Muse-owned. No deployment was requested or performed.
