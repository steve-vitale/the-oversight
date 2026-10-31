// Analyzer: pellet-timing + lesser-bar table for r62 wide band (both arms) + quad.
// Reads pelletwatch files + trust JSON censuses. No engine input.
const fs = require('fs');
function timing(dir, s) {
  const f = `${dir}/journey-scale-r62-pellet-pelletwatch-${s}.txt`;
  if (!fs.existsSync(f)) return null;
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').map(l => {
    const m = l.match(/d(\d+) pellet=(\w+) surge=(\w+) sentiment=(\w+) arc=(\d+) seat=(\S+)/);
    return m ? { day: +m[1], pellet: m[2] === 'true', surge: m[3] === 'true', sentiment: m[4] === 'true', arc: +m[5], seat: m[6] } : null;
  }).filter(Boolean);
  const first = (k) => { const r = rows.find(r => r[k]); return r ? r.day : null; };
  const pellet = first('pellet'), surge = first('surge');
  let order;
  if (pellet == null && surge == null) order = 'neither';
  else if (pellet == null) order = 'surge-only';
  else if (surge == null) order = 'pellet-only';
  else order = surge < pellet ? 'bank-before-pellet' : 'pellet-before-bank';
  return { pellet, surge, sentiment: first('sentiment'), arc4: first('arc'), order, finalArc: rows[rows.length - 1].arc, finalSeat: rows[rows.length - 1].seat };
}
function bars(dt) {
  if (!dt) return '?';
  const miss = [];
  if (dt.w1 < 4) miss.push(`w1=${dt.w1}`);
  if (dt.w2 < 4) miss.push(`w2=${dt.w2}`);
  if (dt.w3 < 3) miss.push(`w3=${dt.w3}`);
  if (dt.contestsN < 2) miss.push(`cont=${dt.contestsN}`);
  if (dt.crisesN < 2) miss.push(`cris=${dt.crisesN}`);
  if (!['regional', 'national', 'global'].includes(dt.rank)) miss.push(`rank=${dt.rank}`);
  if (dt.stage < 2) miss.push(`stage=${dt.stage}`);
  if (!dt.foodDeeds) miss.push('foodDeeds=F');
  return miss.length ? 'MISS:' + miss.join(',') : 'ALL-BARS';
}
for (const [label, dir] of [['CURRENT', 'evidence/2026-10-31/journey-scale-r62-pellet'], ['NOFETCH', 'evidence/2026-10-31/journey-scale-r62-pellet-nofetch']]) {
  console.log(`== ${label} wide ==`);
  for (const s of [85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108]) {
    const t = timing(dir, s);
    const c = JSON.parse(fs.readFileSync(`${dir}/journey-scale-r62-pellet-trust-${s}.json`, 'utf8')).census;
    const cls = !c.over ? 'ALIVE' : (c.popAlive > 0 ? 'SCATTERED' : 'DEAD');
    console.log(`${s} ${cls} d${c.day} pop${c.popAlive}/${c.popTotal} seat=${c.tableSeat} arc=${c.arcNow} pellet=${t.pellet} surge=${t.surge} order=${t.order} bars=${bars(c.tableSeatDetail)}`);
  }
}
console.log('== QUAD (pellet driver) ==');
for (const s of [85001, 85002, 85003, 85004]) {
  const t = timing('evidence/2026-10-31/journey-scale-r62-pellet', s);
  const c = JSON.parse(fs.readFileSync(`evidence/2026-10-31/journey-scale-r62-pellet/journey-scale-r62-pellet-trust-${s}.json`, 'utf8')).census;
  const cls = !c.over ? 'ALIVE' : (c.popAlive > 0 ? 'SCATTERED' : 'DEAD');
  console.log(`${s} ${cls} d${c.day} pop${c.popAlive}/${c.popTotal} seat=${c.tableSeat} arc=${c.arcNow} pellet=${t.pellet} surge=${t.surge} order=${t.order} bars=${bars(c.tableSeatDetail)}`);
}
