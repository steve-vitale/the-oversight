# pdvalue-b-corpus — contents note (finish pass, 2026-10-24)

This directory holds PILOT files only: 64 per-seed JSONs (seeds
94001–94008 × policies {leadfeast, belongfeast} × cells
{pd0,pd1}×{dg0,dg1}) + 8 sweep summaries (sweep-<cell>-<policy>.json).
These are the verdict basis for the pilot NO-GO / KILLED-AT-PILOT in
./sim-pdvalue-b.md and ./pdvalue-b-pilot-analyzer-report.txt.

A partial confirm corpus existed here at adoption (15 per-seed JSONs,
cell pd0-dg0-leadfeast only, seeds 94011–94025, plus one 0-byte
atomic-write temp file) and was DELETED UNANALYZED in the finish pass
per MEASUREMENT.md §14: the pilot NO-GO binds, and the confirm had
been launched 37 seconds after the verdict (confirm-run.log 09:15:02Z
vs analyzer verdict 09:14:24Z). Its contents were never read for any
verdict. Do NOT reconstruct a confirm from anything here — the pilot
files are the whole corpus. Full timeline and exact record:
./sim-pdvalue-b.md, "Confirm-anomaly timeline" (finish-work addendum).
