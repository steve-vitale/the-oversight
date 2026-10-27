/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'e33315442-20261027-112424';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=e33315442-20261027-112424",
  "./src/js/engine/modifiers.js?v=e33315442-20261027-112424",
  "./src/js/engine/calories.js?v=e33315442-20261027-112424",
  "./src/js/engine/day.js?v=e33315442-20261027-112424",
  "./src/js/engine/forage.js?v=e33315442-20261027-112424",
  "./src/js/engine/combat.js?v=e33315442-20261027-112424",
  "./src/js/audio-registry.js?v=e33315442-20261027-112424",
  "./src/js/text.js?v=e33315442-20261027-112424",
  "./src/js/game.js?v=e33315442-20261027-112424",
  "./src/js/encounters.js?v=e33315442-20261027-112424",
  "./src/js/conversation.js?v=e33315442-20261027-112424",
  "./src/js/convo-mood.js?v=e33315442-20261027-112424",
  "./src/js/convoTopics.js?v=e33315442-20261027-112424",
  "./src/js/naming-rite.js?v=e33315442-20261027-112424",
  "./src/js/convo-wants.js?v=e33315442-20261027-112424",
  "./src/js/convo-dialogue.js?v=e33315442-20261027-112424",
  "./src/js/convo-beats.js?v=e33315442-20261027-112424",
  "./src/js/convo-scene.js?v=e33315442-20261027-112424",
  "./src/js/voice-piper.js?v=e33315442-20261027-112424",
  "./src/js/voice-system.js?v=e33315442-20261027-112424",
  "./src/js/examine.js?v=e33315442-20261027-112424",
  "./src/js/equipment.js?v=e33315442-20261027-112424",
  "./src/js/journal.js?v=e33315442-20261027-112424",
  "./src/js/party.js?v=e33315442-20261027-112424",
  "./src/js/favor-water.js?v=e33315442-20261027-112424",
  "./src/js/party-formal.js?v=e33315442-20261027-112424",
  "./src/js/truth.js?v=e33315442-20261027-112424",
  "./src/js/galactic-cast.js?v=e33315442-20261027-112424",
  "./src/js/contests.js?v=e33315442-20261027-112424",
  "./src/js/broadcast.js?v=e33315442-20261027-112424",
  "./src/js/contestEngine.js?v=e33315442-20261027-112424",
  "./src/js/alienPlayers.js?v=e33315442-20261027-112424",
  "./src/js/storage.js?v=e33315442-20261027-112424",
  "./src/js/perceive.js?v=e33315442-20261027-112424",
  "./src/js/carexplore.js?v=e33315442-20261027-112424",
  "./src/js/justice.js?v=e33315442-20261027-112424",
  "./src/js/food.js?v=e33315442-20261027-112424",
  "./src/js/betrayal.js?v=e33315442-20261027-112424",
  "./src/js/corpses.js?v=e33315442-20261027-112424",
  "./src/js/corruption.js?v=e33315442-20261027-112424",
  "./src/js/lifeseed.js?v=e33315442-20261027-112424",
  "./src/js/spawn-knack.js?v=e33315442-20261027-112424",
  "./src/js/trial-deeds.js?v=e33315442-20261027-112424",
  "./src/js/practice-deeds.js?v=e33315442-20261027-112424",
  "./src/js/tracks.js?v=e33315442-20261027-112424",
  "./src/js/villager-build.js?v=e33315442-20261027-112424",
  "./src/js/progression.js?v=e33315442-20261027-112424",
  "./src/js/waveLedger.js?v=e33315442-20261027-112424",
  "./src/js/standing.js?v=e33315442-20261027-112424",
  "./src/js/feastBuff.js?v=e33315442-20261027-112424",
  "./src/js/ledger.js?v=e33315442-20261027-112424",
  "./src/js/exposure.js?v=e33315442-20261027-112424",
  "./src/js/abilityActions.js?v=e33315442-20261027-112424",
  "./src/js/buildarounds.js?v=e33315442-20261027-112424",
  "./src/js/foodPower.js?v=e33315442-20261027-112424",
  "./src/js/monsterBehaviors.js?v=e33315442-20261027-112424",
  "./src/js/partyTactics.js?v=e33315442-20261027-112424",
  "./src/js/sigW3a.js?v=e33315442-20261027-112424",
  "./src/js/statusEffects.js?v=e33315442-20261027-112424",
  "./src/js/sigW3b.js?v=e33315442-20261027-112424",
  "./src/js/metaProgression.js?v=e33315442-20261027-112424",
  "./src/js/sigW3c.js?v=e33315442-20261027-112424",
  "./src/js/sigW4.js?v=e33315442-20261027-112424",
  "./src/js/sigW5.js?v=e33315442-20261027-112424",
  "./src/js/villager-agency.js?v=e33315442-20261027-112424",
  "./src/js/npc-triggers.js?v=e33315442-20261027-112424",
  "./src/js/fieldFights.js?v=e33315442-20261027-112424",
  "./src/js/party-wiring.js?v=e33315442-20261027-112424",
  "./src/js/party-bond.js?v=e33315442-20261027-112424",
  "./src/js/villager-objectives.js?v=e33315442-20261027-112424",
  "./src/js/villager-mapmem.js?v=e33315442-20261027-112424",
  "./src/js/codex-people.js?v=e33315442-20261027-112424",
  "./src/js/fallen-memorial.js?v=e33315442-20261027-112424",
  "./src/js/graves.js?v=e33315442-20261027-112424",
  "./src/js/membership.js?v=e33315442-20261027-112424",
  "./src/js/gardenCultivation.js?v=e33315442-20261027-112424",
  "./src/js/havenGrowth.js?v=e33315442-20261027-112424",
  "./src/js/shelter.js?v=e33315442-20261027-112424",
  "./src/js/hierarchy.js?v=e33315442-20261027-112424",
  "./src/js/scaleDiscovery.js?v=e33315442-20261027-112424",
  "./src/js/comms.js?v=e33315442-20261027-112424",
  "./src/js/table.js?v=e33315442-20261027-112424",
  "./src/js/pods.js?v=e33315442-20261027-112424",
  "./src/js/titans.js?v=e33315442-20261027-112424",
  "./src/js/finale-campaign.js?v=e33315442-20261027-112424",
  "./src/js/godhood.js?v=e33315442-20261027-112424",
  "./src/js/pantheon.js?v=e33315442-20261027-112424",
  "./src/js/records.js?v=e33315442-20261027-112424",
  "./src/js/table-feared.js?v=e33315442-20261027-112424",
  "./src/js/table-indispensable.js?v=e33315442-20261027-112424",
  "./src/js/table-beloved.js?v=e33315442-20261027-112424",
  "./src/js/table-witness.js?v=e33315442-20261027-112424",
  "./src/js/table-assimilated.js?v=e33315442-20261027-112424",
  "./src/js/table-defiant.js?v=e33315442-20261027-112424",
  "./src/js/relay-ext.js?v=e33315442-20261027-112424",
  "./src/js/relay-dialogue.js?v=e33315442-20261027-112424",
  "./src/js/table-relay.js?v=e33315442-20261027-112424",
  "./src/js/safetynets.js?v=e33315442-20261027-112424",
  "./src/js/villageAgency.js?v=e33315442-20261027-112424",
  "./src/js/memdepth.js?v=e33315442-20261027-112424",
  "./src/js/overtime.js?v=e33315442-20261027-112424",
  "./src/js/network-campaign.js?v=e33315442-20261027-112424",
  "./src/js/debug-scenarios.js?v=e33315442-20261027-112424",
  "./src/js/keepsakes.js?v=e33315442-20261027-112424",
  "./src/js/skill-teaching.js?v=e33315442-20261027-112424",
  "./src/js/world.js?v=e33315442-20261027-112424",
  "./src/js/nomad.js?v=e33315442-20261027-112424",
  "./src/js/nomad-wild.js?v=e33315442-20261027-112424",
  "./src/js/nomad-scenes.js?v=e33315442-20261027-112424",
  "./src/js/nomad-drive.js?v=e33315442-20261027-112424",
  "./src/js/temperature.js?v=e33315442-20261027-112424",
  "./src/js/godpath.js?v=e33315442-20261027-112424",
  "./src/js/godverbs.js?v=e33315442-20261027-112424",
  "./src/js/endingKey.js?v=e33315442-20261027-112424",
  "./src/js/telemetry-hooks.js?v=e33315442-20261027-112424",
  "./src/js/feel.js?v=e33315442-20261027-112424",
  "./src/js/build.js?v=e33315442-20261027-112424",
  "./src/js/whereAreWe.js?v=e33315442-20261027-112424",
  "./src/js/drama.js?v=e33315442-20261027-112424",
  "./src/js/move-anim.js?v=e33315442-20261027-112424",
  "./src/js/presentation.js?v=e33315442-20261027-112424",
  "./src/js/sprites.js?v=e33315442-20261027-112424",
  "./src/js/tile-scenes.js?v=e33315442-20261027-112424",
  "./src/js/regional-audio.js?v=e33315442-20261027-112424",
  "./src/js/favor-company.js?v=e33315442-20261027-112424",
  "./src/js/timeSettlement.js?v=e33315442-20261027-112424",
  "./src/js/app.js?v=e33315442-20261027-112424",
  "./src/js/feel-audio.js?v=e33315442-20261027-112424",
  "./manifest.json?v=e33315442-20261027-112424",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=e33315442-20261027-112424",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=e33315442-20261027-112424",
  "./src/data/alienPlayers.json?v=e33315442-20261027-112424",
  "./src/data/animals.json?v=e33315442-20261027-112424",
  "./src/data/arrivalText.json?v=e33315442-20261027-112424",
  "./src/data/background_survivors.json?v=e33315442-20261027-112424",
  "./src/data/biomes.json?v=e33315442-20261027-112424",
  "./src/data/books.json?v=e33315442-20261027-112424",
  "./src/data/build-notes.json?v=e33315442-20261027-112424",
  "./src/data/cell_defs.json?v=e33315442-20261027-112424",
  "./src/data/characterGen.json?v=e33315442-20261027-112424",
  "./src/data/climates.json?v=e33315442-20261027-112424",
  "./src/data/contests.json?v=e33315442-20261027-112424",
  "./src/data/cooking.json?v=e33315442-20261027-112424",
  "./src/data/events.json?v=e33315442-20261027-112424",
  "./src/data/evolutions.json?v=e33315442-20261027-112424",
  "./src/data/favor-rules.json?v=e33315442-20261027-112424",
  "./src/data/feast-surge.json?v=e33315442-20261027-112424",
  "./src/data/foreignSpeech.json?v=e33315442-20261027-112424",
  "./src/data/gardening.json?v=e33315442-20261027-112424",
  "./src/data/godpaths.json?v=e33315442-20261027-112424",
  "./src/data/items.json?v=e33315442-20261027-112424",
  "./src/data/justiceVoice.json?v=e33315442-20261027-112424",
  "./src/data/knowledge.json?v=e33315442-20261027-112424",
  "./src/data/lifeseeds.json?v=e33315442-20261027-112424",
  "./src/data/locations.json?v=e33315442-20261027-112424",
  "./src/data/monsterBehaviors.json?v=e33315442-20261027-112424",
  "./src/data/monsters.json?v=e33315442-20261027-112424",
  "./src/data/nameCultures.json?v=e33315442-20261027-112424",
  "./src/data/originPicker.json?v=e33315442-20261027-112424",
  "./src/data/plants.json?v=e33315442-20261027-112424",
  "./src/data/presentation.json?v=e33315442-20261027-112424",
  "./src/data/recipes.json?v=e33315442-20261027-112424",
  "./src/data/regions.json?v=e33315442-20261027-112424",
  "./src/data/relicEnhancements.json?v=e33315442-20261027-112424",
  "./src/data/reward-economy.json?v=e33315442-20261027-112424",
  "./src/data/schemas.json?v=e33315442-20261027-112424",
  "./src/data/statusEffects.json?v=e33315442-20261027-112424",
  "./src/data/synergies.json?v=e33315442-20261027-112424",
  "./src/data/table-beats.json?v=e33315442-20261027-112424",
  "./src/data/table-endings.json?v=e33315442-20261027-112424",
  "./src/data/titans.json?v=e33315442-20261027-112424",
  "./src/data/tracks.json?v=e33315442-20261027-112424",
  "./src/data/villagers.json?v=e33315442-20261027-112424",
  "./src/data/wave-ledger.json?v=e33315442-20261027-112424"
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
