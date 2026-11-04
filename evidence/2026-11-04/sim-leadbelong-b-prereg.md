# LEAD-vs-BELONG shape reporting — Loop B, arm sim-leadbelong-b

Axis: scale-onramp / winnability chain. DIAG-ONLY arm: scripts +
analyzer + evidence, ZERO src/js changes. This arm is the third
named next blank from Loop B run 0730Z (coordinator evidence
`evidence/2026-11-04/sim-winnability-round-0730.md`, arm sim-diplo-b):
the diplo pilot's context leg produced 12 proposals -> 12 links,
11 direct accepts plus 1 counter-accept that flipped Haven into
subordinate (a BELONG link, 99401 village_1), and its capture note
recorded a say-line over-catch (COUNTER LEARNED / keepsake-bond
lines). The open question: for every link in the diplomacy
pipeline, which side LEADs and which BELONGs — and does shape
predict anything? When a counter is accepted, how often does the
shape flip LEAD->BELONG, and does shape correlate with seasoning,
holding, or diplomacy value?

NO gate/price/deed change follows from this arm, whatever it
finds. A diagnosis names the next lever; it does not turn it.

## Canon read before this prereg

- docs/CANON.md (manifest) read first. The manifest lists no
  standing/diplomacy doc, but docs/SCALE.md EXISTS in this tree
  and is the scale canon: it is cited by src/js/hierarchy.js
  itself and by scripts/policies/belongseek.js. It is read here
  as the canon for shape, not invented from code alone.
- docs/SCALE.md, six roads (Steve approved all six 2026-10-10):
  LEAD — Haven primary of >=3 active subordinates, the built
  realm; BELONG — Haven subordinate in good standing (trust
  >=50, arrears 0, link age >=14 days) to a primary whose realm
  holds >=4 villages; COVENANT — >=3 covenant peer links, each
  seasoned; TRADE — >=3 trade peer links, each seasoned;
  CONQUEST — >=3 subordinates taken by force; REFUSE — a
  played permanent refusal of the scale. Shape priority when
  several qualify: lead -> belong -> covenant -> trade.
- Seasoning (SCALE.md + hierarchy.js + standing.js): a link
  counts toward a polity only when 30+ days old AND trust 40+
  (conquered links need the season, not the trust). Diplomacy
  standing = 34 x seasoned REGIONAL+ links. A lone seasoned
  bond with a splinter village scores 0 (courtship, not
  regional power). Regional+ per shape: LEAD — one of Haven's
  seasoned subordinate links inside Haven's polity; BELONG —
  Haven subordinate inside the primary's polity; LEAGUE — a
  seasoned covenant/trade peer link inside its league polity.
- Code shape reads (hierarchy.js link objects, as recorded by
  the diplo instrument's hierarchyState diff): primary /
  subordinate fields for subordinate links, a / b fields and
  kind ('covenant' / 'trade') for peer links, conquered flag
  for force-taken links. Shape is read from the link object,
  never from a say-line alone.

## Corpus (stored, not re-simulated)

- The sim-diplo-b stored corpus under
  `evidence/2026-11-04/perseed-diplo-b/`: leadcourt context leg
  99401-99404 (140d, death-aware) + competent long-horizon
  context leg 99405-99408 (180d cap, death-aware). All 8 files
  were listed present at prereg time; the analyzer verifies
  presence + anchorCommit on every file before judging, and
  any missing/corrupt file is re-derived with a fresh
  identical-seed run through the diplo driver — never
  invented, never filled from another seed.
- This corpus is a CONTEXT corpus (the diplo pilot's context
  legs), not a judged leg: leadcourt proposes LEAD by design
  (asSubordinate false), competent proposes nothing. Shape
  reporting therefore covers what this corpus can show
  (LEAD-intent proposals, any counter flip, any peer/conquest
  link if one appears) and states plainly what it cannot
  (BELONG-intent proposals, covenant/trade peer links, and
  conquest links are unobserved here unless the daily detail
  shows them; a BELONG-seeking policy corpus is named as the
  follow-up corpus, not simulated here).
- Horizons are the stored runs' horizons (140d / 180d cap,
  death-aware: dead villages stop). No new horizon is chosen
  and no village is simulated past its stored end.

## Shape definitions (applied uniformly by the analyzer)

- LEAD: link.primary == 'haven', link.subordinate != 'haven',
  kind null (a subordinate link Haven heads).
- BELONG: link.subordinate == 'haven', link.primary != 'haven'
  (a subordinate link Haven sits inside).
- LEAGUE: kind in ('covenant', 'trade') with peer fields
  a / b (no primary/subordinate).
- CONQUEST: any of the above with a conquered flag set
  (reported as a modifier, e.g. LEAD-conquered, not a
  separate shape, unless the link object carries no other
  shape fields — then reported as CONQUEST-unclassified).
- Splinter: the other village's stored ov record has
  isSplinter true (or id prefix village_spl_); reported as
  a flag on the link, not a shape.
- Formation day: first daily snapshot in which the link id
  appears in linkFunnel.detail. Final shape: the link's
  shape on its last appearance (a link whose primary /
  subordinate fields change mid-life is a shape-change
  event, reported separately from a counter flip).
- Counter flip: a proposal whose intent shape (from opts:
  asSubordinate false = LEAD intent, true = BELONG intent;
  proposeCovenant / proposeTrade = LEAGUE intent) differs
  from the resulting link's shape at formation, where the
  link was formed through a counter (proposal ret ==
  'counter' followed by answerCounter accept producing the
  link). Direct accepts cannot flip by this definition.
  Both directions are checked (LEAD->BELONG and
  BELONG->LEAD); LEAGUE-intent counters are reported if any.

## Pre-registration (committed before any judged analysis)

- Question: (a) what shape is every link in the corpus, per
  seed per day; (b) when a counter is accepted, how often
  does the shape flip; (c) does shape correlate with
  seasoning (seasoned-ever), holding (active at run end vs
  broken/lost), or diplomacy value (diplomacy standing
  while the link is seasoned-regional+, and the seed's
  regional+ days / max diplomacy)?
- Analyzer: `scripts/leadbelong-analyze-20261104.js` (reads
  ONLY the 8 stored JSONs; writes a per-seed, per-link,
  per-day shape table + a summary JSON). Proof:
  `scripts/test-leadbelong-20261104.js` (fixture tests:
  shape classifier LEAD / BELONG / LEAGUE / splinter flag /
  counter-flip detection both directions / direct-accept
  no-flip / seasoned-ever + held-to-end + regional+-ever
  rollups / say-line strict-vs-overcatch classifier).
  Proof must pass before the judged analyzer run.
- PRIMARY METRIC: reporting completeness + quantified flip
  rate. Per seed: every link ever formed gets a shape at
  formation and at end; zero-link seeds are reported
  explicitly (0 links, shape table empty by observation,
  not omitted). Flip rate is reported with ALL THREE
  denominators: flips / accepted counters, flips /
  proposals, flips / links formed.
- DIAG BAR (binding): DIAG iff ALL of: (1) 8/8 corpus seeds
  carry a per-seed shape table (including explicit 0-link
  tables); (2) every link id ever formed carries exactly
  one shape at formation and one shape at end, with no
  unclassified link; (3) the flip rate is quantified with
  all three denominators stated and every accepted counter
  traced to its resulting link or to no-link; (4) every
  link carries seasoned-ever, held-to-end, regional+-ever,
  and the seed's diplomacy value while it was
  seasoned-regional+. Otherwise DIAG-NO-CANDIDATE. A miss
  is NO-GO on the reporting claim, never re-scored against
  a friendlier completeness rule mid-run.
- PREDICTION RULE (binding, separate from the DIAG bar):
  shape-vs-outcome is reported as a raw cross-tab only.
  NO "shape predicts X" claim is made unless at least 3
  BELONG links AND at least 3 LEAD links exist with
  divergent outcomes on the same measure; below that, the
  evidence states "no predictive claim possible on this
  corpus" and names the corpus that could settle it (a
  BELONG-intent proposing policy panel, e.g. belongseek,
  at panel scale, plus peer-link policies for LEAGUE).
  Correlation coefficients are NOT computed on a
  single-digit minority shape — a coefficient on n=1
  would be decoration, not measurement.
- SAY-LINE OVER-CATCH CHECK: the stored sayLines (the
  diplo instrument's SAY_RE capture, capped 400/seed) are
  re-classified by a STRICT rule: a line counts as
  diplomacy-relevant only if it names a proposal /
  counter-negotiation / decline / polity / codex-study
  event concerning another village, or a "Word will
  travel" opinion line. Everything else the SAY_RE caught
  is over-catch, itemized by pattern class: COUNTER
  LEARNED, keepsake bond, "proposed relief" journal
  (internal-village relief, not diplomacy), gossip
  "opinions" lines, and other. The check reports
  over-catch count / captured count per seed and pooled,
  plus the strict diplomacy line count. If a seed's
  stored sayLines are absent, that seed is recorded
  unmeasurable for this check (not zero).
- SECONDARY (reported, not judged): wall numbers for the
  8-seed corpus — wins, national / table (scaleRank),
  wave 4-5 unlocks (maxWave / peak) and facing
  (w4faced / w5faced daily flags), median survival,
  readiness-5-ready days, death end-reasons. Arc reach:
  not instrumented by this corpus — stated, not faked.
- SENSE-TEST (SENSE-TESTING LAW): read the strict
  diplomacy say-lines and the courtship events around
  each proposal/counter/flip; judge whether the shape
  story reads as consequences of things villagers did
  (a counter answered, a realm gained or lost), and flag
  anything robotic, static, or repeated. Where the corpus
  produces no diplomacy dialogue (competent seeds), the
  silence is reported as the finding, not filled in.
- BALANCED PANEL (§15): INAPPLICABLE — pure diagnostic,
  no before/after change; no comparison is fabricated
  and none is attached. Stated explicitly, not omitted
  silently.
- TELEMETRY DEVIATION CHECK: the coordinator runs it
  after evidence; noted, not run by this arm.
- HARD LIMITS (binding, honored): zero src/js changes;
  no gate/price/deed change; no new sims except the
  missing/corrupt-file re-derivation path above; no
  files owned by the sibling polityfrag arm; no other
  worktree touched; no push, no bump, no live
  verification by this worker.

## Metric review (placeholder — completed in the evidence file, §14)

- The evidence file carries the completed metric review:
  what the metric proved, what it missed, and any revision
  proposed for the NEXT run (never applied in-run).
