/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'c917881ec-20261022-172408';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=c917881ec-20261022-172408",
  "./src/js/engine/modifiers.js?v=c917881ec-20261022-172408",
  "./src/js/engine/calories.js?v=c917881ec-20261022-172408",
  "./src/js/engine/day.js?v=c917881ec-20261022-172408",
  "./src/js/engine/forage.js?v=c917881ec-20261022-172408",
  "./src/js/engine/combat.js?v=c917881ec-20261022-172408",
  "./src/js/audio-registry.js?v=c917881ec-20261022-172408",
  "./src/js/game.js?v=c917881ec-20261022-172408",
  "./src/js/encounters.js?v=c917881ec-20261022-172408",
  "./src/js/conversation.js?v=c917881ec-20261022-172408",
  "./src/js/convo-mood.js?v=c917881ec-20261022-172408",
  "./src/js/convoTopics.js?v=c917881ec-20261022-172408",
  "./src/js/convo-wants.js?v=c917881ec-20261022-172408",
  "./src/js/convo-dialogue.js?v=c917881ec-20261022-172408",
  "./src/js/convo-beats.js?v=c917881ec-20261022-172408",
  "./src/js/convo-scene.js?v=c917881ec-20261022-172408",
  "./src/js/voice-piper.js?v=c917881ec-20261022-172408",
  "./src/js/voice-system.js?v=c917881ec-20261022-172408",
  "./src/js/examine.js?v=c917881ec-20261022-172408",
  "./src/js/equipment.js?v=c917881ec-20261022-172408",
  "./src/js/journal.js?v=c917881ec-20261022-172408",
  "./src/js/party.js?v=c917881ec-20261022-172408",
  "./src/js/favor-water.js?v=c917881ec-20261022-172408",
  "./src/js/party-formal.js?v=c917881ec-20261022-172408",
  "./src/js/truth.js?v=c917881ec-20261022-172408",
  "./src/js/galactic-cast.js?v=c917881ec-20261022-172408",
  "./src/js/contests.js?v=c917881ec-20261022-172408",
  "./src/js/broadcast.js?v=c917881ec-20261022-172408",
  "./src/js/contestEngine.js?v=c917881ec-20261022-172408",
  "./src/js/alienPlayers.js?v=c917881ec-20261022-172408",
  "./src/js/storage.js?v=c917881ec-20261022-172408",
  "./src/js/perceive.js?v=c917881ec-20261022-172408",
  "./src/js/carexplore.js?v=c917881ec-20261022-172408",
  "./src/js/justice.js?v=c917881ec-20261022-172408",
  "./src/js/food.js?v=c917881ec-20261022-172408",
  "./src/js/betrayal.js?v=c917881ec-20261022-172408",
  "./src/js/corpses.js?v=c917881ec-20261022-172408",
  "./src/js/corruption.js?v=c917881ec-20261022-172408",
  "./src/js/lifeseed.js?v=c917881ec-20261022-172408",
  "./src/js/spawn-knack.js?v=c917881ec-20261022-172408",
  "./src/js/trial-deeds.js?v=c917881ec-20261022-172408",
  "./src/js/practice-deeds.js?v=c917881ec-20261022-172408",
  "./src/js/tracks.js?v=c917881ec-20261022-172408",
  "./src/js/villager-build.js?v=c917881ec-20261022-172408",
  "./src/js/progression.js?v=c917881ec-20261022-172408",
  "./src/js/waveLedger.js?v=c917881ec-20261022-172408",
  "./src/js/standing.js?v=c917881ec-20261022-172408",
  "./src/js/feastBuff.js?v=c917881ec-20261022-172408",
  "./src/js/ledger.js?v=c917881ec-20261022-172408",
  "./src/js/exposure.js?v=c917881ec-20261022-172408",
  "./src/js/abilityActions.js?v=c917881ec-20261022-172408",
  "./src/js/buildarounds.js?v=c917881ec-20261022-172408",
  "./src/js/foodPower.js?v=c917881ec-20261022-172408",
  "./src/js/monsterBehaviors.js?v=c917881ec-20261022-172408",
  "./src/js/partyTactics.js?v=c917881ec-20261022-172408",
  "./src/js/sigW3a.js?v=c917881ec-20261022-172408",
  "./src/js/statusEffects.js?v=c917881ec-20261022-172408",
  "./src/js/sigW3b.js?v=c917881ec-20261022-172408",
  "./src/js/metaProgression.js?v=c917881ec-20261022-172408",
  "./src/js/sigW3c.js?v=c917881ec-20261022-172408",
  "./src/js/sigW4.js?v=c917881ec-20261022-172408",
  "./src/js/sigW5.js?v=c917881ec-20261022-172408",
  "./src/js/villager-agency.js?v=c917881ec-20261022-172408",
  "./src/js/fieldFights.js?v=c917881ec-20261022-172408",
  "./src/js/party-wiring.js?v=c917881ec-20261022-172408",
  "./src/js/party-bond.js?v=c917881ec-20261022-172408",
  "./src/js/villager-objectives.js?v=c917881ec-20261022-172408",
  "./src/js/villager-mapmem.js?v=c917881ec-20261022-172408",
  "./src/js/codex-people.js?v=c917881ec-20261022-172408",
  "./src/js/membership.js?v=c917881ec-20261022-172408",
  "./src/js/gardenCultivation.js?v=c917881ec-20261022-172408",
  "./src/js/havenGrowth.js?v=c917881ec-20261022-172408",
  "./src/js/shelter.js?v=c917881ec-20261022-172408",
  "./src/js/hierarchy.js?v=c917881ec-20261022-172408",
  "./src/js/scaleDiscovery.js?v=c917881ec-20261022-172408",
  "./src/js/comms.js?v=c917881ec-20261022-172408",
  "./src/js/table.js?v=c917881ec-20261022-172408",
  "./src/js/pods.js?v=c917881ec-20261022-172408",
  "./src/js/titans.js?v=c917881ec-20261022-172408",
  "./src/js/finale-campaign.js?v=c917881ec-20261022-172408",
  "./src/js/godhood.js?v=c917881ec-20261022-172408",
  "./src/js/pantheon.js?v=c917881ec-20261022-172408",
  "./src/js/records.js?v=c917881ec-20261022-172408",
  "./src/js/table-feared.js?v=c917881ec-20261022-172408",
  "./src/js/table-indispensable.js?v=c917881ec-20261022-172408",
  "./src/js/table-beloved.js?v=c917881ec-20261022-172408",
  "./src/js/table-witness.js?v=c917881ec-20261022-172408",
  "./src/js/table-assimilated.js?v=c917881ec-20261022-172408",
  "./src/js/table-defiant.js?v=c917881ec-20261022-172408",
  "./src/js/relay-ext.js?v=c917881ec-20261022-172408",
  "./src/js/relay-dialogue.js?v=c917881ec-20261022-172408",
  "./src/js/table-relay.js?v=c917881ec-20261022-172408",
  "./src/js/safetynets.js?v=c917881ec-20261022-172408",
  "./src/js/villageAgency.js?v=c917881ec-20261022-172408",
  "./src/js/memdepth.js?v=c917881ec-20261022-172408",
  "./src/js/overtime.js?v=c917881ec-20261022-172408",
  "./src/js/network-campaign.js?v=c917881ec-20261022-172408",
  "./src/js/debug-scenarios.js?v=c917881ec-20261022-172408",
  "./src/js/keepsakes.js?v=c917881ec-20261022-172408",
  "./src/js/skill-teaching.js?v=c917881ec-20261022-172408",
  "./src/js/world.js?v=c917881ec-20261022-172408",
  "./src/js/nomad.js?v=c917881ec-20261022-172408",
  "./src/js/nomad-wild.js?v=c917881ec-20261022-172408",
  "./src/js/nomad-scenes.js?v=c917881ec-20261022-172408",
  "./src/js/nomad-drive.js?v=c917881ec-20261022-172408",
  "./src/js/temperature.js?v=c917881ec-20261022-172408",
  "./src/js/godpath.js?v=c917881ec-20261022-172408",
  "./src/js/godverbs.js?v=c917881ec-20261022-172408",
  "./src/js/endingKey.js?v=c917881ec-20261022-172408",
  "./src/js/telemetry-hooks.js?v=c917881ec-20261022-172408",
  "./src/js/feel.js?v=c917881ec-20261022-172408",
  "./src/js/build.js?v=c917881ec-20261022-172408",
  "./src/js/whereAreWe.js?v=c917881ec-20261022-172408",
  "./src/js/drama.js?v=c917881ec-20261022-172408",
  "./src/js/move-anim.js?v=c917881ec-20261022-172408",
  "./src/js/presentation.js?v=c917881ec-20261022-172408",
  "./src/js/sprites.js?v=c917881ec-20261022-172408",
  "./src/js/tile-scenes.js?v=c917881ec-20261022-172408",
  "./src/js/regional-audio.js?v=c917881ec-20261022-172408",
  "./src/js/favor-company.js?v=c917881ec-20261022-172408",
  "./src/js/timeSettlement.js?v=c917881ec-20261022-172408",
  "./src/js/app.js?v=c917881ec-20261022-172408",
  "./src/js/feel-audio.js?v=c917881ec-20261022-172408",
  "./manifest.json?v=c917881ec-20261022-172408",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=c917881ec-20261022-172408",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=c917881ec-20261022-172408",
  "./src/data/alienPlayers.json?v=c917881ec-20261022-172408",
  "./src/data/animals.json?v=c917881ec-20261022-172408",
  "./src/data/arrivalText.json?v=c917881ec-20261022-172408",
  "./src/data/background_survivors.json?v=c917881ec-20261022-172408",
  "./src/data/biomes.json?v=c917881ec-20261022-172408",
  "./src/data/books.json?v=c917881ec-20261022-172408",
  "./src/data/build-notes.json?v=c917881ec-20261022-172408",
  "./src/data/cell_defs.json?v=c917881ec-20261022-172408",
  "./src/data/characterGen.json?v=c917881ec-20261022-172408",
  "./src/data/climates.json?v=c917881ec-20261022-172408",
  "./src/data/contests.json?v=c917881ec-20261022-172408",
  "./src/data/cooking.json?v=c917881ec-20261022-172408",
  "./src/data/events.json?v=c917881ec-20261022-172408",
  "./src/data/evolutions.json?v=c917881ec-20261022-172408",
  "./src/data/favor-rules.json?v=c917881ec-20261022-172408",
  "./src/data/feast-surge.json?v=c917881ec-20261022-172408",
  "./src/data/foreignSpeech.json?v=c917881ec-20261022-172408",
  "./src/data/gardening.json?v=c917881ec-20261022-172408",
  "./src/data/godpaths.json?v=c917881ec-20261022-172408",
  "./src/data/items.json?v=c917881ec-20261022-172408",
  "./src/data/justiceVoice.json?v=c917881ec-20261022-172408",
  "./src/data/knowledge.json?v=c917881ec-20261022-172408",
  "./src/data/lifeseeds.json?v=c917881ec-20261022-172408",
  "./src/data/locations.json?v=c917881ec-20261022-172408",
  "./src/data/monsterBehaviors.json?v=c917881ec-20261022-172408",
  "./src/data/monsters.json?v=c917881ec-20261022-172408",
  "./src/data/nameCultures.json?v=c917881ec-20261022-172408",
  "./src/data/originPicker.json?v=c917881ec-20261022-172408",
  "./src/data/plants.json?v=c917881ec-20261022-172408",
  "./src/data/presentation.json?v=c917881ec-20261022-172408",
  "./src/data/recipes.json?v=c917881ec-20261022-172408",
  "./src/data/regions.json?v=c917881ec-20261022-172408",
  "./src/data/relicEnhancements.json?v=c917881ec-20261022-172408",
  "./src/data/reward-economy.json?v=c917881ec-20261022-172408",
  "./src/data/schemas.json?v=c917881ec-20261022-172408",
  "./src/data/statusEffects.json?v=c917881ec-20261022-172408",
  "./src/data/synergies.json?v=c917881ec-20261022-172408",
  "./src/data/table-beats.json?v=c917881ec-20261022-172408",
  "./src/data/table-endings.json?v=c917881ec-20261022-172408",
  "./src/data/titans.json?v=c917881ec-20261022-172408",
  "./src/data/tracks.json?v=c917881ec-20261022-172408",
  "./src/data/villagers.json?v=c917881ec-20261022-172408",
  "./src/data/wave-ledger.json?v=c917881ec-20261022-172408"
];
// END GENERATED OFFLINE ASSETS

self.addEventListener('install', e => {
  // Cache everything fresh for this version, then sit in "waiting" —
  // do NOT skipWaiting here; the page decides when to switch.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Only cache successful same-origin basics; game data is versioned by CACHE.
        // AUDIO RUNTIME CACHE (2026-10-12): voice lines are 14MB — too heavy to
        // precache at install, but the fetch handler never stored them, so the
        // offline PWA lost all voice after first install. Cache audio responses
        // at runtime: play once online, then it works offline.
        try {
          const ct = resp.headers.get('content-type') || '';
          if (resp.ok && (ct.indexOf('audio/') === 0 || e.request.url.indexOf('/src/audio/') !== -1)) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          }
        } catch (err) { /* cache failure must never break playback */ }
        return resp;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline');
      });
    })
  );
});
