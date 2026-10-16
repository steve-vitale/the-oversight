# Fixed-calendar diagnostics shared for Muse

2026-10-15. Tooling base bf28d16fa4b91bb409ecb578fee1b0338ca23275.

Adds scripts/balance-windows.js and its automatically discovered 13-assertion
counterexample test. Workflow is in SIMULATING.md and agent entry instructions.
No gameplay, policy, collector or metric-contract change. Existing neutrality
proof remains current. No src/index files are imported from Codex gameplay.

The report preserves strict game-only comparability, complete paired calendar
windows, missing-day lists, metric unknowns and competing terminal outcomes.
It cannot turn a selected surviving subset into an overall balance all-clear,
or manufacture survival after a Table ending. It uses saved panels only.

Targeted test: 13/13. Full shared suite: 822 passed / 48 failed (870 scripts).
The retained older full report was 821/47 (868 scripts). One new failing
script is test-vest-tracker-20261010.js: its closing-brace text extraction
splits on LF and compares exactly to `}`; a CRLF driver leaves `}\r`.
The unchanged bf28d16 HEAD extracted to a frozen root, with its driver checked
out as CRLF like the shared working root, reproduces the same failure/status.
See balance-windows-vest-baseline.txt. This is an existing platform-sensitive
legacy test; it is neither fixed nor quarantined here. All prior failing
script names remain. No window-analysis/measurement test failed.

The branch remains draft/red; these results do not approve a gameplay release.
The complete primary gameplay branch passed quick 161/161 and full 933/933 at
pushed d01e37eef598832c9d3e30cb466ed31ba4b915ce. It contains the independent
Relay daily-clock experiment (16 and 64 seeds per four policies), 26 exact
caregiver replays and raw fixed-window evidence in relay-clock-* artifacts.
That experiment remains mixed: higher capable wins merit challenge review;
caregiver population/community warnings remain unresolved. Its runtime is
not the regional tooling baseline and must not be substituted into a Muse
comparison. Use the same current observer and policy on both tested roots.
