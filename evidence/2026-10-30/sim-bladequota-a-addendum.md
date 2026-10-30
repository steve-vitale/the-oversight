# sim-bladequota-a — POST-PILOT ADDENDUM (written after the pilot, before confirm spend)

This addendum does NOT edit the frozen prereg (sim-bladequota-a-prereg.md).
It records a design decision the pilot forced, and the extra leg it adds.
The prereg headline (competent 16-seed sounded-call yield >= 10 rate) and
its DIAG thresholds are unchanged.

## Pilot result that forced this
Competent pilot 76101–76108: 8/8 seeds, ZERO active links on every
simulated day, ZERO Herald omens, peak allied yield 0, peak total 3
(Haven-only, capped at 3). Rank stayed village on all 8; wave 4 unlocked
on 6/8, wave 5 on 0/8. Instrument errors: 0.

## Correction to the prereg's rationale (recorded, not hidden)
The prereg called competent "an UPPER-ish bound for wild play" on links.
That is WRONG, and the code says so plainly: scripts/policies/leadcourt.js
documents that "plain `competent` contains zero scale code by design (it
stays pinned as the scale-free baseline...)". Competent never calls
proposeLink at all (verified by grep: no proposeLink/tendLink in
competent.js). The competent leg therefore measures the SCALE-FREE
baseline — what happens when nobody courts links — not the ceiling of
link formation. Its zero-link result is a finding about that baseline,
not proof that links cannot form in the wild.

## Consequence for DIAG
Under the prereg's classifiability rule (>= 1 active link, or a Herald
omen), the competent leg scores 0/8 classifiable at pilot. If the
confirm leg (76109–76116) repeats that, the competent headline is
DIAG-NO-GO for the quota/trust/free-face decomposition specifically:
there is no linked population on which quota mechanics can be judged.
The link-count + omen-gating finding itself (0 links, 0 omens on the
scale-free baseline) stands regardless — it is measured, not inconclusive.

## Added leg (decided here, before confirm spend)
A leadcourt leg on the SAME 8 pilot seeds (76101–76108): leadcourt is
competent + the LEAD-road courtship (propose + tend through the engine's
own verbs, real pantry costs), i.e. the canonical scale-playing policy.
It answers the decomposition the competent leg cannot: on a linked
population, what binds — link count, base quota 2, trust below 70,
free faces, or omen gating? It also tests omen offerability, since
leadcourt can reach regional/national where Herald omens become possible
(wave 4 + regional+).
- Corpus: evidence/2026-10-30/perseed-bladequota-a-leadcourt/.
- The leadcourt leg is reported SEPARATELY from the competent headline;
  it does not retroactively change the prereg thresholds or re-score the
  competent leg. Its own verdict uses the same DIAG rule (classifiable
  >= 12/16 would need a 16-seed leadcourt band; this 8-seed leg is
  reported as a pilot-grade decomposition, not a headline rate, unless
  extended — see evidence).
- Transcript target change: the prereg named seed 76101 for the sense
  read, but 76101 has no muster-age content on competent (no links, no
  omen). The sense read moves to the most-linked leadcourt seed (or, if
  leadcourt also links nothing, to the leadcourt seed with the most
  link/courtship lines), because the sense question needs a village
  that actually faces the call. The substitution is recorded here, not
  silently made.

## No-comparison statement, extended
Both legs are single-base measurements on the same base; there is still
no game-code lever and no before/after comparison, so no balanced-panel
file is fabricated. The competent-vs-leadcourt contrast is a POLICY
contrast on identical seeds, reported as such.
