# Win-path usage ledger — 2026-10-25 (measurement audit)

Built from existing sim corpora only. No new sims were run for this ledger.
Census rows only: sense-only replays never enter a count (they are flagged
separately where they corroborate a branch). Branch is reported only where a
source states it; everything else is branch-unstated, never inferred.

## Sources

### A. Oct 15 dashboards (6 files, 304 rows, winseat era)
Per-run rows with won / invited / sat / tablePath. No tableBranch field:
this corpus is branch-blind. Rows with tablePath but sat=false: 0, so
tablePath ⟺ sat here.
- sat = won by path: feared 61, beloved 61, relay 30, indispensable 4 (156 total)
- No defiant, assimilated, or witness rows.

### B. Oct 19 tablepaths corpus (armed arm, 16 runs, seatdrive substrate)
- sat = won by walked path/branch: feared/light 3, defiant/light 3,
  beloved/light 1, assimilated/light 2, relay/grey 1 (10/10; every sat won)
- Assigned paths: feared 4, defiant 3, assimilated 3, beloved 3, relay 3.
  Indispensable and witness were never assigned in this corpus.
- Control arm: sat 10, won 10, paths NOT recorded (path-blind).

### C. Oct 24 tablepaths-a (2115Z, seeds 73641–73648, tableseat-nowait)
- Lesser seat 3/8, wins 3/8, all feared (branch unstated in the source).
- The lesser menu offered feared, beloved, witness, assimilated, defiant,
  relay on the seated seeds. Witness was EARNED (4 exposures on 73642,
  3 on 73648) but never walked — first-option bias took feared every time.

### D. Oct 24 fullseat round (2115Z, same band)
- Baseline entered feared 2 / won feared 2 (feared/light).
- Armed entered assimilated 1 + relay 1 / won assimilated 1 (light) +
  relay 1 (grey). The two armed wins: 73642 day 160 assimilated/light,
  73648 day 105 relay/grey.
- Entered FULL 0/16. Wave 5 0/0.

### E. Oct 24 witness walk (2215Z, seeds 73671–73678, 8+8, tableseat-nowait)
- Baseline entered 4, all feared (branch unstated).
- Armed entered 4 = witness 3 + beloved 1 (branch unstated for the beloved seat).
- Witness entered/won 3/3 → GO as an instrument (default-OFF only).
  Witness branch light per the 73672 sense replay (sense-only: corroborates
  branch, adds no count). Fallback-feared seatings: 0.

### F. Path-blind corpora (rows exist, path does not)
- Oct 24 tableseat sweep (73601–73608, recorder corpus): rows carry entered /
  tableInvited / won but no tablePath.
- Winseek sweep results (60 rows): 0 won; rows carry table (bool), no tablePath.
- Journey legs (endgame r50/r51 per-seed files): walkedPath field, no tablePath.
- Oct 15 doors probe (doors.jsonl): offer telemetry only — the doors string
  lists all 7 paths' availability plus the moral ledger, and tele rows carry
  table_path / table_won for a single seed. Not a corpus.

### G. HOSTS modifier
No `hosts: true` in any Oct 1x–2x evidence file searched. THE HOSTS has
zero observed instances (it requires the Network campaign; wave 5 was never
reached in any ledger corpus).

## Consolidated measured totals (census only)

By path, all sources: feared 73, beloved 63, relay 32, indispensable 4,
witness 3, assimilated 3, defiant 3. Total 181 sats (= 181 wins: every
ledger sat won in these corpora).

Branch-stated sats: light — feared 5, defiant 3, beloved 1, assimilated 3;
grey — relay 2; dark — 0 on every path.
Branch-unstated sats: feared 7 (tablepaths-a 3 + witness-walk baseline 4),
beloved 1 (witness-walk armed), plus the Oct 15 branch-blind 156
(feared 61, beloved 61, relay 30, indispensable 4).
Cross-check: 156 + 10 + 3 + 4 + 8 = 181.

## Blind spots

1. **Dark branch — zero measured sittings or wins on any path, in any
   corpus.** This is the prime blind spot: dark endings have no usage
   telemetry at all. Competent and tablepaths policies never walk the
   moral-ledger-dark road (killed / betrayed / hoarded). Named next step:
   a dark-leaning policy/corpus that earns a dark branch, then a
   path-attributed sweep. This needs a policy, not just more seeds.
2. **THE HOSTS modifier — zero observed.** Not an instrument fix: it stays
   unmeasurable until a wave-5-reaching substrate exists.
3. **Indispensable — 4 branch-unknown sats, all Oct 15 winseat-era; zero in
   Oct 19/24 corpora.** It is FULL-seat-only and entered FULL is 0/16, so it
   is effectively unmeasured on current substrates.
4. **Relay light and relay dark cells — zero measured.** Relay is measured
   only as grey (2 stated) plus 30 branch-unknown Oct 15 rows.
5. **Control-arm path blindness (Oct 19): 10 sats/wins unattributed.**
   Future control arms must record tablePath/tableBranch or their wins
   cannot be attributed.
6. **Dashboard branch blindness: 156 sats with no branch field.** The
   largest corpus cannot speak to light/dark. Named next step: add
   tableBranch to dashboard row schema.
7. **Recorder / journey / winseek corpora are path-blind by construction**
   (tableseat sweep, winseek 60 rows, journey per-seed files). Named next
   step: emit tablePath + tableBranch in those row schemas, or their sats
   will keep arriving unattributed.
8. **No winstats-deep corpus on disk.** The §13 BALANCE VERDICT instrument
   (scripts/sweep-winstats-deep.js, scripts/analyze-winstats-deep.js) has
   no current output — its OUT default (scripts/sweep-winpath-r5-results.json)
   does not exist. The verdict is currently uncomputable; the last
   path-attributed corpus is the Oct 24 witness walk. Named next step:
   re-run winstats-deep to refresh the §13 corpus.
9. **Not blind spots (era effects, already closed):** defiant, assimilated,
   and witness are absent from Oct 15 dashboards but all three are measured
   Oct 19/24 (defiant 3, assimilated 3, witness 3).

## Method notes

- The panel ruling 665 (table counts sittings, not invitations) applies to
  this ledger: counts above are sat/won, never invitations. The Oct 19
  corpus's invited counts (12/16 both arms) are not usage.
- THE HOSTS is a modifier, not an 8th path (docs/TABLE.md 2026-10-14):
  with pg.networkFallen, every path's last choice adds THE HOSTS.
- Relay resolves on the leaning meter, not the moral ledger: light
  (tender, ≥+40) / dark (total, ≤−40) / grey (pragmatist middle).
