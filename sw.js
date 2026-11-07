/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'eac2bfc4d-20261107-175416';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=eac2bfc4d-20261107-175416",
  "./src/js/engine/modifiers.js?v=eac2bfc4d-20261107-175416",
  "./src/js/engine/calories.js?v=eac2bfc4d-20261107-175416",
  "./src/js/engine/day.js?v=eac2bfc4d-20261107-175416",
  "./src/js/engine/forage.js?v=eac2bfc4d-20261107-175416",
  "./src/js/engine/combat.js?v=eac2bfc4d-20261107-175416",
  "./src/js/audio-registry.js?v=eac2bfc4d-20261107-175416",
  "./src/js/text.js?v=eac2bfc4d-20261107-175416",
  "./src/js/game.js?v=eac2bfc4d-20261107-175416",
  "./src/js/encounters.js?v=eac2bfc4d-20261107-175416",
  "./src/js/conversation.js?v=eac2bfc4d-20261107-175416",
  "./src/js/convo-mood.js?v=eac2bfc4d-20261107-175416",
  "./src/js/convoTopics.js?v=eac2bfc4d-20261107-175416",
  "./src/js/naming-rite.js?v=eac2bfc4d-20261107-175416",
  "./src/js/convo-wants.js?v=eac2bfc4d-20261107-175416",
  "./src/js/convo-dialogue.js?v=eac2bfc4d-20261107-175416",
  "./src/js/convo-beats.js?v=eac2bfc4d-20261107-175416",
  "./src/js/convo-scene.js?v=eac2bfc4d-20261107-175416",
  "./src/js/voice-piper.js?v=eac2bfc4d-20261107-175416",
  "./src/js/voice-system.js?v=eac2bfc4d-20261107-175416",
  "./src/js/examine.js?v=eac2bfc4d-20261107-175416",
  "./src/js/equipment.js?v=eac2bfc4d-20261107-175416",
  "./src/js/journal.js?v=eac2bfc4d-20261107-175416",
  "./src/js/party.js?v=eac2bfc4d-20261107-175416",
  "./src/js/favor-water.js?v=eac2bfc4d-20261107-175416",
  "./src/js/favor-forage.js?v=eac2bfc4d-20261107-175416",
  "./src/js/favor-outing.js?v=eac2bfc4d-20261107-175416",
  "./src/js/party-formal.js?v=eac2bfc4d-20261107-175416",
  "./src/js/truth.js?v=eac2bfc4d-20261107-175416",
  "./src/js/galactic-cast.js?v=eac2bfc4d-20261107-175416",
  "./src/js/contests.js?v=eac2bfc4d-20261107-175416",
  "./src/js/broadcast.js?v=eac2bfc4d-20261107-175416",
  "./src/js/contestEngine.js?v=eac2bfc4d-20261107-175416",
  "./src/js/alienPlayers.js?v=eac2bfc4d-20261107-175416",
  "./src/js/storage.js?v=eac2bfc4d-20261107-175416",
  "./src/js/perceive.js?v=eac2bfc4d-20261107-175416",
  "./src/js/carexplore.js?v=eac2bfc4d-20261107-175416",
  "./src/js/justice.js?v=eac2bfc4d-20261107-175416",
  "./src/js/food.js?v=eac2bfc4d-20261107-175416",
  "./src/js/betrayal.js?v=eac2bfc4d-20261107-175416",
  "./src/js/corpses.js?v=eac2bfc4d-20261107-175416",
  "./src/js/corruption.js?v=eac2bfc4d-20261107-175416",
  "./src/js/lifeseed.js?v=eac2bfc4d-20261107-175416",
  "./src/js/spawn-knack.js?v=eac2bfc4d-20261107-175416",
  "./src/js/trial-deeds.js?v=eac2bfc4d-20261107-175416",
  "./src/js/practice-deeds.js?v=eac2bfc4d-20261107-175416",
  "./src/js/tracks.js?v=eac2bfc4d-20261107-175416",
  "./src/js/villager-build.js?v=eac2bfc4d-20261107-175416",
  "./src/js/progression.js?v=eac2bfc4d-20261107-175416",
  "./src/js/waveLedger.js?v=eac2bfc4d-20261107-175416",
  "./src/js/standing.js?v=eac2bfc4d-20261107-175416",
  "./src/js/feastBuff.js?v=eac2bfc4d-20261107-175416",
  "./src/js/ledger.js?v=eac2bfc4d-20261107-175416",
  "./src/js/exposure.js?v=eac2bfc4d-20261107-175416",
  "./src/js/abilityActions.js?v=eac2bfc4d-20261107-175416",
  "./src/js/buildarounds.js?v=eac2bfc4d-20261107-175416",
  "./src/js/foodPower.js?v=eac2bfc4d-20261107-175416",
  "./src/js/monsterBehaviors.js?v=eac2bfc4d-20261107-175416",
  "./src/js/partyTactics.js?v=eac2bfc4d-20261107-175416",
  "./src/js/sigW3a.js?v=eac2bfc4d-20261107-175416",
  "./src/js/statusEffects.js?v=eac2bfc4d-20261107-175416",
  "./src/js/sigW3b.js?v=eac2bfc4d-20261107-175416",
  "./src/js/metaProgression.js?v=eac2bfc4d-20261107-175416",
  "./src/js/sigW3c.js?v=eac2bfc4d-20261107-175416",
  "./src/js/sigW4.js?v=eac2bfc4d-20261107-175416",
  "./src/js/sigW5.js?v=eac2bfc4d-20261107-175416",
  "./src/js/villager-agency.js?v=eac2bfc4d-20261107-175416",
  "./src/js/win-plan.js?v=eac2bfc4d-20261107-175416",
  "./src/js/npc-triggers.js?v=eac2bfc4d-20261107-175416",
  "./src/js/fieldFights.js?v=eac2bfc4d-20261107-175416",
  "./src/js/party-wiring.js?v=eac2bfc4d-20261107-175416",
  "./src/js/party-bond.js?v=eac2bfc4d-20261107-175416",
  "./src/js/villager-objectives.js?v=eac2bfc4d-20261107-175416",
  "./src/js/villager-goals.js?v=eac2bfc4d-20261107-175416",
  "./src/js/bond-initiation.js?v=eac2bfc4d-20261107-175416",
  "./src/js/villager-mapmem.js?v=eac2bfc4d-20261107-175416",
  "./src/js/codex-people.js?v=eac2bfc4d-20261107-175416",
  "./src/js/fallen-memorial.js?v=eac2bfc4d-20261107-175416",
  "./src/js/graves.js?v=eac2bfc4d-20261107-175416",
  "./src/js/membership.js?v=eac2bfc4d-20261107-175416",
  "./src/js/gardenCultivation.js?v=eac2bfc4d-20261107-175416",
  "./src/js/havenGrowth.js?v=eac2bfc4d-20261107-175416",
  "./src/js/shelter.js?v=eac2bfc4d-20261107-175416",
  "./src/js/hierarchy.js?v=eac2bfc4d-20261107-175416",
  "./src/js/scaleDiscovery.js?v=eac2bfc4d-20261107-175416",
  "./src/js/comms.js?v=eac2bfc4d-20261107-175416",
  "./src/js/table.js?v=eac2bfc4d-20261107-175416",
  "./src/js/pods.js?v=eac2bfc4d-20261107-175416",
  "./src/js/titans.js?v=eac2bfc4d-20261107-175416",
  "./src/js/finale-campaign.js?v=eac2bfc4d-20261107-175416",
  "./src/js/godhood.js?v=eac2bfc4d-20261107-175416",
  "./src/js/pantheon.js?v=eac2bfc4d-20261107-175416",
  "./src/js/records.js?v=eac2bfc4d-20261107-175416",
  "./src/js/table-feared.js?v=eac2bfc4d-20261107-175416",
  "./src/js/table-indispensable.js?v=eac2bfc4d-20261107-175416",
  "./src/js/table-beloved.js?v=eac2bfc4d-20261107-175416",
  "./src/js/table-witness.js?v=eac2bfc4d-20261107-175416",
  "./src/js/table-assimilated.js?v=eac2bfc4d-20261107-175416",
  "./src/js/table-defiant.js?v=eac2bfc4d-20261107-175416",
  "./src/js/relay-ext.js?v=eac2bfc4d-20261107-175416",
  "./src/js/relay-dialogue.js?v=eac2bfc4d-20261107-175416",
  "./src/js/table-relay.js?v=eac2bfc4d-20261107-175416",
  "./src/js/safetynets.js?v=eac2bfc4d-20261107-175416",
  "./src/js/villageAgency.js?v=eac2bfc4d-20261107-175416",
  "./src/js/memdepth.js?v=eac2bfc4d-20261107-175416",
  "./src/js/overtime.js?v=eac2bfc4d-20261107-175416",
  "./src/js/network-campaign.js?v=eac2bfc4d-20261107-175416",
  "./src/js/debug-scenarios.js?v=eac2bfc4d-20261107-175416",
  "./src/js/keepsakes.js?v=eac2bfc4d-20261107-175416",
  "./src/js/skill-teaching.js?v=eac2bfc4d-20261107-175416",
  "./src/js/world.js?v=eac2bfc4d-20261107-175416",
  "./src/js/nomad.js?v=eac2bfc4d-20261107-175416",
  "./src/js/nomad-wild.js?v=eac2bfc4d-20261107-175416",
  "./src/js/nomad-scenes.js?v=eac2bfc4d-20261107-175416",
  "./src/js/nomad-drive.js?v=eac2bfc4d-20261107-175416",
  "./src/js/temperature.js?v=eac2bfc4d-20261107-175416",
  "./src/js/godpath.js?v=eac2bfc4d-20261107-175416",
  "./src/js/godverbs.js?v=eac2bfc4d-20261107-175416",
  "./src/js/endingKey.js?v=eac2bfc4d-20261107-175416",
  "./src/js/telemetry-hooks.js?v=eac2bfc4d-20261107-175416",
  "./src/js/finishLog.js?v=eac2bfc4d-20261107-175416",
  "./src/js/feel.js?v=eac2bfc4d-20261107-175416",
  "./src/js/build.js?v=eac2bfc4d-20261107-175416",
  "./src/js/whereAreWe.js?v=eac2bfc4d-20261107-175416",
  "./src/js/drama.js?v=eac2bfc4d-20261107-175416",
  "./src/js/move-anim.js?v=eac2bfc4d-20261107-175416",
  "./src/js/presentation.js?v=eac2bfc4d-20261107-175416",
  "./src/js/sprites.js?v=eac2bfc4d-20261107-175416",
  "./src/js/tile-scenes.js?v=eac2bfc4d-20261107-175416",
  "./src/js/regional-audio.js?v=eac2bfc4d-20261107-175416",
  "./src/js/favor-company.js?v=eac2bfc4d-20261107-175416",
  "./src/js/timeSettlement.js?v=eac2bfc4d-20261107-175416",
  "./src/js/app.js?v=eac2bfc4d-20261107-175416",
  "./src/js/feel-audio.js?v=eac2bfc4d-20261107-175416",
  "./manifest.json?v=eac2bfc4d-20261107-175416",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=eac2bfc4d-20261107-175416",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=eac2bfc4d-20261107-175416",
  "./src/data/alienPlayers.json?v=eac2bfc4d-20261107-175416",
  "./src/data/animals.json?v=eac2bfc4d-20261107-175416",
  "./src/data/arrivalText.json?v=eac2bfc4d-20261107-175416",
  "./src/data/background_survivors.json?v=eac2bfc4d-20261107-175416",
  "./src/data/biomes.json?v=eac2bfc4d-20261107-175416",
  "./src/data/books.json?v=eac2bfc4d-20261107-175416",
  "./src/data/build-notes.json?v=eac2bfc4d-20261107-175416",
  "./src/data/cell_defs.json?v=eac2bfc4d-20261107-175416",
  "./src/data/characterGen.json?v=eac2bfc4d-20261107-175416",
  "./src/data/climates.json?v=eac2bfc4d-20261107-175416",
  "./src/data/contests.json?v=eac2bfc4d-20261107-175416",
  "./src/data/cooking.json?v=eac2bfc4d-20261107-175416",
  "./src/data/events.json?v=eac2bfc4d-20261107-175416",
  "./src/data/evolutions.json?v=eac2bfc4d-20261107-175416",
  "./src/data/favor-rules.json?v=eac2bfc4d-20261107-175416",
  "./src/data/feast-surge.json?v=eac2bfc4d-20261107-175416",
  "./src/data/foreignSpeech.json?v=eac2bfc4d-20261107-175416",
  "./src/data/gardening.json?v=eac2bfc4d-20261107-175416",
  "./src/data/godpaths.json?v=eac2bfc4d-20261107-175416",
  "./src/data/items.json?v=eac2bfc4d-20261107-175416",
  "./src/data/justiceVoice.json?v=eac2bfc4d-20261107-175416",
  "./src/data/knowledge.json?v=eac2bfc4d-20261107-175416",
  "./src/data/lifeseeds.json?v=eac2bfc4d-20261107-175416",
  "./src/data/locations.json?v=eac2bfc4d-20261107-175416",
  "./src/data/monsterBehaviors.json?v=eac2bfc4d-20261107-175416",
  "./src/data/monsters.json?v=eac2bfc4d-20261107-175416",
  "./src/data/nameCultures.json?v=eac2bfc4d-20261107-175416",
  "./src/data/originPicker.json?v=eac2bfc4d-20261107-175416",
  "./src/data/plants.json?v=eac2bfc4d-20261107-175416",
  "./src/data/presentation.json?v=eac2bfc4d-20261107-175416",
  "./src/data/recipes.json?v=eac2bfc4d-20261107-175416",
  "./src/data/regions.json?v=eac2bfc4d-20261107-175416",
  "./src/data/relicEnhancements.json?v=eac2bfc4d-20261107-175416",
  "./src/data/reward-economy.json?v=eac2bfc4d-20261107-175416",
  "./src/data/schemas.json?v=eac2bfc4d-20261107-175416",
  "./src/data/statusEffects.json?v=eac2bfc4d-20261107-175416",
  "./src/data/synergies.json?v=eac2bfc4d-20261107-175416",
  "./src/data/table-beats.json?v=eac2bfc4d-20261107-175416",
  "./src/data/table-endings.json?v=eac2bfc4d-20261107-175416",
  "./src/data/titans.json?v=eac2bfc4d-20261107-175416",
  "./src/data/tracks.json?v=eac2bfc4d-20261107-175416",
  "./src/data/villagers.json?v=eac2bfc4d-20261107-175416",
  "./src/data/wave-ledger.json?v=eac2bfc4d-20261107-175416"
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
