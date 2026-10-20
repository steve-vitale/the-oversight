/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'b9441dd46-20261020-172432';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=b9441dd46-20261020-172432",
  "./src/js/engine/modifiers.js?v=b9441dd46-20261020-172432",
  "./src/js/engine/calories.js?v=b9441dd46-20261020-172432",
  "./src/js/engine/day.js?v=b9441dd46-20261020-172432",
  "./src/js/engine/forage.js?v=b9441dd46-20261020-172432",
  "./src/js/engine/combat.js?v=b9441dd46-20261020-172432",
  "./src/js/audio-registry.js?v=b9441dd46-20261020-172432",
  "./src/js/game.js?v=b9441dd46-20261020-172432",
  "./src/js/encounters.js?v=b9441dd46-20261020-172432",
  "./src/js/conversation.js?v=b9441dd46-20261020-172432",
  "./src/js/convo-mood.js?v=b9441dd46-20261020-172432",
  "./src/js/convoTopics.js?v=b9441dd46-20261020-172432",
  "./src/js/convo-wants.js?v=b9441dd46-20261020-172432",
  "./src/js/convo-dialogue.js?v=b9441dd46-20261020-172432",
  "./src/js/convo-beats.js?v=b9441dd46-20261020-172432",
  "./src/js/convo-scene.js?v=b9441dd46-20261020-172432",
  "./src/js/voice-piper.js?v=b9441dd46-20261020-172432",
  "./src/js/voice-system.js?v=b9441dd46-20261020-172432",
  "./src/js/examine.js?v=b9441dd46-20261020-172432",
  "./src/js/equipment.js?v=b9441dd46-20261020-172432",
  "./src/js/journal.js?v=b9441dd46-20261020-172432",
  "./src/js/party.js?v=b9441dd46-20261020-172432",
  "./src/js/party-formal.js?v=b9441dd46-20261020-172432",
  "./src/js/truth.js?v=b9441dd46-20261020-172432",
  "./src/js/galactic-cast.js?v=b9441dd46-20261020-172432",
  "./src/js/contests.js?v=b9441dd46-20261020-172432",
  "./src/js/broadcast.js?v=b9441dd46-20261020-172432",
  "./src/js/contestEngine.js?v=b9441dd46-20261020-172432",
  "./src/js/alienPlayers.js?v=b9441dd46-20261020-172432",
  "./src/js/storage.js?v=b9441dd46-20261020-172432",
  "./src/js/perceive.js?v=b9441dd46-20261020-172432",
  "./src/js/carexplore.js?v=b9441dd46-20261020-172432",
  "./src/js/justice.js?v=b9441dd46-20261020-172432",
  "./src/js/food.js?v=b9441dd46-20261020-172432",
  "./src/js/betrayal.js?v=b9441dd46-20261020-172432",
  "./src/js/corpses.js?v=b9441dd46-20261020-172432",
  "./src/js/corruption.js?v=b9441dd46-20261020-172432",
  "./src/js/lifeseed.js?v=b9441dd46-20261020-172432",
  "./src/js/spawn-knack.js?v=b9441dd46-20261020-172432",
  "./src/js/trial-deeds.js?v=b9441dd46-20261020-172432",
  "./src/js/practice-deeds.js?v=b9441dd46-20261020-172432",
  "./src/js/tracks.js?v=b9441dd46-20261020-172432",
  "./src/js/villager-build.js?v=b9441dd46-20261020-172432",
  "./src/js/progression.js?v=b9441dd46-20261020-172432",
  "./src/js/waveLedger.js?v=b9441dd46-20261020-172432",
  "./src/js/standing.js?v=b9441dd46-20261020-172432",
  "./src/js/feastBuff.js?v=b9441dd46-20261020-172432",
  "./src/js/ledger.js?v=b9441dd46-20261020-172432",
  "./src/js/exposure.js?v=b9441dd46-20261020-172432",
  "./src/js/abilityActions.js?v=b9441dd46-20261020-172432",
  "./src/js/buildarounds.js?v=b9441dd46-20261020-172432",
  "./src/js/foodPower.js?v=b9441dd46-20261020-172432",
  "./src/js/monsterBehaviors.js?v=b9441dd46-20261020-172432",
  "./src/js/partyTactics.js?v=b9441dd46-20261020-172432",
  "./src/js/sigW3a.js?v=b9441dd46-20261020-172432",
  "./src/js/statusEffects.js?v=b9441dd46-20261020-172432",
  "./src/js/sigW3b.js?v=b9441dd46-20261020-172432",
  "./src/js/metaProgression.js?v=b9441dd46-20261020-172432",
  "./src/js/sigW3c.js?v=b9441dd46-20261020-172432",
  "./src/js/sigW4.js?v=b9441dd46-20261020-172432",
  "./src/js/sigW5.js?v=b9441dd46-20261020-172432",
  "./src/js/villager-agency.js?v=b9441dd46-20261020-172432",
  "./src/js/fieldFights.js?v=b9441dd46-20261020-172432",
  "./src/js/party-wiring.js?v=b9441dd46-20261020-172432",
  "./src/js/party-bond.js?v=b9441dd46-20261020-172432",
  "./src/js/villager-objectives.js?v=b9441dd46-20261020-172432",
  "./src/js/villager-mapmem.js?v=b9441dd46-20261020-172432",
  "./src/js/codex-people.js?v=b9441dd46-20261020-172432",
  "./src/js/membership.js?v=b9441dd46-20261020-172432",
  "./src/js/havenGrowth.js?v=b9441dd46-20261020-172432",
  "./src/js/shelter.js?v=b9441dd46-20261020-172432",
  "./src/js/hierarchy.js?v=b9441dd46-20261020-172432",
  "./src/js/scaleDiscovery.js?v=b9441dd46-20261020-172432",
  "./src/js/comms.js?v=b9441dd46-20261020-172432",
  "./src/js/table.js?v=b9441dd46-20261020-172432",
  "./src/js/pods.js?v=b9441dd46-20261020-172432",
  "./src/js/titans.js?v=b9441dd46-20261020-172432",
  "./src/js/finale-campaign.js?v=b9441dd46-20261020-172432",
  "./src/js/godhood.js?v=b9441dd46-20261020-172432",
  "./src/js/pantheon.js?v=b9441dd46-20261020-172432",
  "./src/js/records.js?v=b9441dd46-20261020-172432",
  "./src/js/table-feared.js?v=b9441dd46-20261020-172432",
  "./src/js/table-indispensable.js?v=b9441dd46-20261020-172432",
  "./src/js/table-beloved.js?v=b9441dd46-20261020-172432",
  "./src/js/table-witness.js?v=b9441dd46-20261020-172432",
  "./src/js/table-assimilated.js?v=b9441dd46-20261020-172432",
  "./src/js/table-defiant.js?v=b9441dd46-20261020-172432",
  "./src/js/relay-ext.js?v=b9441dd46-20261020-172432",
  "./src/js/relay-dialogue.js?v=b9441dd46-20261020-172432",
  "./src/js/table-relay.js?v=b9441dd46-20261020-172432",
  "./src/js/safetynets.js?v=b9441dd46-20261020-172432",
  "./src/js/villageAgency.js?v=b9441dd46-20261020-172432",
  "./src/js/memdepth.js?v=b9441dd46-20261020-172432",
  "./src/js/overtime.js?v=b9441dd46-20261020-172432",
  "./src/js/network-campaign.js?v=b9441dd46-20261020-172432",
  "./src/js/debug-scenarios.js?v=b9441dd46-20261020-172432",
  "./src/js/keepsakes.js?v=b9441dd46-20261020-172432",
  "./src/js/skill-teaching.js?v=b9441dd46-20261020-172432",
  "./src/js/world.js?v=b9441dd46-20261020-172432",
  "./src/js/nomad.js?v=b9441dd46-20261020-172432",
  "./src/js/nomad-wild.js?v=b9441dd46-20261020-172432",
  "./src/js/nomad-scenes.js?v=b9441dd46-20261020-172432",
  "./src/js/nomad-drive.js?v=b9441dd46-20261020-172432",
  "./src/js/temperature.js?v=b9441dd46-20261020-172432",
  "./src/js/godpath.js?v=b9441dd46-20261020-172432",
  "./src/js/godverbs.js?v=b9441dd46-20261020-172432",
  "./src/js/endingKey.js?v=b9441dd46-20261020-172432",
  "./src/js/telemetry-hooks.js?v=b9441dd46-20261020-172432",
  "./src/js/feel.js?v=b9441dd46-20261020-172432",
  "./src/js/build.js?v=b9441dd46-20261020-172432",
  "./src/js/whereAreWe.js?v=b9441dd46-20261020-172432",
  "./src/js/drama.js?v=b9441dd46-20261020-172432",
  "./src/js/move-anim.js?v=b9441dd46-20261020-172432",
  "./src/js/presentation.js?v=b9441dd46-20261020-172432",
  "./src/js/sprites.js?v=b9441dd46-20261020-172432",
  "./src/js/tile-scenes.js?v=b9441dd46-20261020-172432",
  "./src/js/regional-audio.js?v=b9441dd46-20261020-172432",
  "./src/js/app.js?v=b9441dd46-20261020-172432",
  "./src/js/feel-audio.js?v=b9441dd46-20261020-172432",
  "./manifest.json?v=b9441dd46-20261020-172432",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=b9441dd46-20261020-172432",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=b9441dd46-20261020-172432",
  "./src/data/alienPlayers.json?v=b9441dd46-20261020-172432",
  "./src/data/animals.json?v=b9441dd46-20261020-172432",
  "./src/data/arrivalText.json?v=b9441dd46-20261020-172432",
  "./src/data/background_survivors.json?v=b9441dd46-20261020-172432",
  "./src/data/biomes.json?v=b9441dd46-20261020-172432",
  "./src/data/books.json?v=b9441dd46-20261020-172432",
  "./src/data/build-notes.json?v=b9441dd46-20261020-172432",
  "./src/data/cell_defs.json?v=b9441dd46-20261020-172432",
  "./src/data/characterGen.json?v=b9441dd46-20261020-172432",
  "./src/data/climates.json?v=b9441dd46-20261020-172432",
  "./src/data/contests.json?v=b9441dd46-20261020-172432",
  "./src/data/cooking.json?v=b9441dd46-20261020-172432",
  "./src/data/events.json?v=b9441dd46-20261020-172432",
  "./src/data/evolutions.json?v=b9441dd46-20261020-172432",
  "./src/data/feast-surge.json?v=b9441dd46-20261020-172432",
  "./src/data/foreignSpeech.json?v=b9441dd46-20261020-172432",
  "./src/data/godpaths.json?v=b9441dd46-20261020-172432",
  "./src/data/items.json?v=b9441dd46-20261020-172432",
  "./src/data/justiceVoice.json?v=b9441dd46-20261020-172432",
  "./src/data/knowledge.json?v=b9441dd46-20261020-172432",
  "./src/data/lifeseeds.json?v=b9441dd46-20261020-172432",
  "./src/data/locations.json?v=b9441dd46-20261020-172432",
  "./src/data/monsterBehaviors.json?v=b9441dd46-20261020-172432",
  "./src/data/monsters.json?v=b9441dd46-20261020-172432",
  "./src/data/nameCultures.json?v=b9441dd46-20261020-172432",
  "./src/data/originPicker.json?v=b9441dd46-20261020-172432",
  "./src/data/plants.json?v=b9441dd46-20261020-172432",
  "./src/data/presentation.json?v=b9441dd46-20261020-172432",
  "./src/data/recipes.json?v=b9441dd46-20261020-172432",
  "./src/data/regions.json?v=b9441dd46-20261020-172432",
  "./src/data/relicEnhancements.json?v=b9441dd46-20261020-172432",
  "./src/data/reward-economy.json?v=b9441dd46-20261020-172432",
  "./src/data/schemas.json?v=b9441dd46-20261020-172432",
  "./src/data/statusEffects.json?v=b9441dd46-20261020-172432",
  "./src/data/synergies.json?v=b9441dd46-20261020-172432",
  "./src/data/table-beats.json?v=b9441dd46-20261020-172432",
  "./src/data/table-endings.json?v=b9441dd46-20261020-172432",
  "./src/data/titans.json?v=b9441dd46-20261020-172432",
  "./src/data/tracks.json?v=b9441dd46-20261020-172432",
  "./src/data/villagers.json?v=b9441dd46-20261020-172432",
  "./src/data/wave-ledger.json?v=b9441dd46-20261020-172432"
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
