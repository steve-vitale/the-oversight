// analyze-landing-r132-nodloop.js — per-sitting nv: gesture analysis.
// Usage: node scripts/analyze-landing-r132-nodloop.js <DIR>
// Parses driver transcripts (=== seed N day D — conversation with ... ===).
// For each sitting reports: nv picks in order, max consecutive same-gesture
// streak, mime shown?, speak_back picked?, winddown surfaced (and before the
// streak hit 3?), ended-by. Gate metric LOOP: a sitting where the same nv:
// gesture is picked >=3x consecutively with no new content — no mime, no
// speak_back, and the winddown did NOT surface before the streak reached 3.
// (journey-landing r132 Q1 — the carried nod loop: Herve 5x r196, Xue 3x,
// Mariko 4x r197.)
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/analyze-landing-r132-nodloop.js <DIR>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt')).sort();
let sittings = 0, nvSittings = 0, loops = 0, mimes = 0, loopList = [];
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  // Split into sittings on the === header.
  const parts = text.split(/^=== seed /m);
  for (let i = 1; i < parts.length; i++) {
    const chunk = '=== seed ' + parts[i];
    const head = chunk.split('\n')[0];
    const m = head.match(/seed (\d+) day (\d+) — conversation with (.+?) \((\w+)\)(.*)$/);
    if (!m) continue;
    sittings++;
    const [, seed, day, name, vid, rest] = m;
    const nvSit = /deliberate nonverbal sit/.test(rest || '');
    // YOU picks in file order, with line offsets.
    const picks = [];
    const lines = chunk.split('\n');
    lines.forEach((ln, idx) => {
      const pm = ln.match(/^YOU: \[([^\]]+)\]/);
      if (pm) picks.push({ id: pm[1], line: idx });
    });
    const nvPicks = picks.filter(p => p.id.indexOf('nv:') === 0);
    if (!nvPicks.length && !nvSit) continue;
    if (!nvPicks.length) continue;
    nvSittings++;
    // Winddown-surface markers: a turn whose response is the thinning beat
    // (r19 delivery) is NOT another identical gesture — it breaks the
    // streak. Mark each pick whose turn surfaced the winddown (marker line
    // between this pick and the next pick, or after the last pick).
    const wdLines = [];
    lines.forEach((ln, idx) => { if (/nv winddown surfaced/.test(ln)) wdLines.push(idx); });
    const wdOnTurn = (pickIdx) => {
      const start = picks[pickIdx].line;
      const end = pickIdx + 1 < picks.length ? picks[pickIdx + 1].line : lines.length;
      return wdLines.some(w => w > start && w < end);
    };
    // Max consecutive same nv: gesture streak, counting only picks whose
    // response was a gesture acknowledgment (a winddown-surfaced turn
    // breaks the streak; a non-nv pick breaks it too).
    let maxStreak = 0, cur = 0, curId = null;
    picks.forEach((p, pi) => {
      if (p.id.indexOf('nv:') !== 0 || wdOnTurn(pi)) { cur = 0; curId = null; return; }
      if (p.id === curId) { cur++; } else { cur = 1; curId = p.id; }
      if (cur > maxStreak) maxStreak = cur;
    });
    const mimeShown = /They mime /i.test(chunk);
    if (mimeShown) mimes++;
    const speakBack = picks.some(p => p.id === 'speak_back');
    // Winddown surfaced at all in this sitting (info only — the streak
    // logic above already credits a surfacing turn as a break).
    const wdSurfaced = wdLines.length > 0;
    const summary = chunk.match(/nv summary: picks=(\d+) maxStreak=(\d+) offeredNv=(\d+) wdSurfacedAt=(\S+) endedByEngine=(\S+) leftViaLeave=(\S+)/);
    const isLoop = maxStreak >= 3 && !mimeShown && !speakBack;
    if (isLoop) { loops++; loopList.push(`${seed} d${day} ${vid} (${name.trim()}) streak=${maxStreak} picks=${nvPicks.map(p => p.id).join(',')}`); }
    console.log(`seed ${seed} d${day} ${vid} nvSit=${nvSit} nvPicks=${nvPicks.length} maxSameStreak=${maxStreak} mime=${mimeShown} speakBack=${speakBack} wdSurfaced=${wdSurfaced} LOOP=${isLoop}${summary ? ` [summary picks=${summary[1]} wdAt=${summary[4]} leftViaLeave=${summary[6]}]` : ''}`);
  }
}
console.log(`\nTOTAL sittings=${sittings} nvSittings=${nvSittings} mimeShown=${mimes} LOOP=${loops}`);
for (const l of loopList) console.log('LOOP: ' + l);
