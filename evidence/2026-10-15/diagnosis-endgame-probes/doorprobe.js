// REPO=<worktree> SEED=7 DAYS=150 [POLICY=capable] node doorprobe.js -> one JSON line
// Records the doors as priced at the moment the Table offers them, the
// branch per door, the ledger, the key, and the path chain the bot walked.
const path = require('path');
const REPO = process.env.REPO;
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts/sim-harness'));
const { capable } = require(path.join(REPO, 'scripts/policies/capable'));
(async () => {
  const seed = +process.env.SEED || 7, days = +process.env.DAYS || 150;
  const { Game, manifest } = await loadGame({ seed, mode: 'doorprobe', fullTelemetry: false });
  await setupGame(Game);
  const out = { seed, offers: [], picks: [], tele: [] };
  const _op = Game.tableOfferPaths;
  Game.tableOfferPaths = function () {
    try {
      const eps = this.tableEarnedPaths();
      out.offers.push({ day: this.state.scholar.day, doors: eps.map(p => p.id + (p.earned ? ':' + p.strength + ':' + this.tableBranch(p.id).branch : ':x')).join(' '), ledger: this.ledger ? this.ledger() : null, key: this.endingKeyLive ? this.endingKeyLive() : null, god: ((this.state.scholar.godhood || {}).active || []).join(',') });
    } catch (e) { out.offers.push({ err: e.message }); }
    return _op.apply(this, arguments);
  };
  const _co = Game.chooseTableOption;
  Game.chooseTableOption = function (id) {
    try { const T = this.tableState(); out.picks.push((T.phase || '?') + ':' + id); } catch (e) { out.picks.push('err'); }
    return _co.apply(this, arguments);
  };
  const _tele = Game.tele;
  Game.tele = function (type, d) {
    if (/^table_/.test(type)) { try { out.tele.push(type + ':' + JSON.stringify(d || {}).slice(0, 300)); } catch (e) { out.tele.push(type); } }
    return _tele.apply(this, arguments);
  };
  const r = await runDays(Game, Object.assign({}, capable), { days, manifest, sampleEvery: 10 });
  out.days = r.days; out.end = r.endReason;
  console.log(JSON.stringify(out));
})();
