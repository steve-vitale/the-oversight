/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'c82fe0d23-20261120-172444';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=c82fe0d23-20261120-172444",
  "./src/js/engine/modifiers.js?v=c82fe0d23-20261120-172444",
  "./src/js/engine/calories.js?v=c82fe0d23-20261120-172444",
  "./src/js/engine/day.js?v=c82fe0d23-20261120-172444",
  "./src/js/engine/forage.js?v=c82fe0d23-20261120-172444",
  "./src/js/engine/combat.js?v=c82fe0d23-20261120-172444",
  "./src/js/audio-registry.js?v=c82fe0d23-20261120-172444",
  "./src/js/text.js?v=c82fe0d23-20261120-172444",
  "./src/js/game.js?v=c82fe0d23-20261120-172444",
  "./src/js/encounters.js?v=c82fe0d23-20261120-172444",
  "./src/js/conversation.js?v=c82fe0d23-20261120-172444",
  "./src/js/convo-mood.js?v=c82fe0d23-20261120-172444",
  "./src/js/convoTopics.js?v=c82fe0d23-20261120-172444",
  "./src/js/naming-rite.js?v=c82fe0d23-20261120-172444",
  "./src/js/convo-wants.js?v=c82fe0d23-20261120-172444",
  "./src/js/convo-dialogue.js?v=c82fe0d23-20261120-172444",
  "./src/js/convo-beats.js?v=c82fe0d23-20261120-172444",
  "./src/js/convo-scene.js?v=c82fe0d23-20261120-172444",
  "./src/js/voice-piper.js?v=c82fe0d23-20261120-172444",
  "./src/js/voice-system.js?v=c82fe0d23-20261120-172444",
  "./src/js/examine.js?v=c82fe0d23-20261120-172444",
  "./src/js/equipment.js?v=c82fe0d23-20261120-172444",
  "./src/js/journal.js?v=c82fe0d23-20261120-172444",
  "./src/js/party.js?v=c82fe0d23-20261120-172444",
  "./src/js/favor-water.js?v=c82fe0d23-20261120-172444",
  "./src/js/favor-forage.js?v=c82fe0d23-20261120-172444",
  "./src/js/favor-outing.js?v=c82fe0d23-20261120-172444",
  "./src/js/party-formal.js?v=c82fe0d23-20261120-172444",
  "./src/js/truth.js?v=c82fe0d23-20261120-172444",
  "./src/js/galactic-cast.js?v=c82fe0d23-20261120-172444",
  "./src/js/contests.js?v=c82fe0d23-20261120-172444",
  "./src/js/broadcast.js?v=c82fe0d23-20261120-172444",
  "./src/js/contestEngine.js?v=c82fe0d23-20261120-172444",
  "./src/js/alienPlayers.js?v=c82fe0d23-20261120-172444",
  "./src/js/storage.js?v=c82fe0d23-20261120-172444",
  "./src/js/perceive.js?v=c82fe0d23-20261120-172444",
  "./src/js/carexplore.js?v=c82fe0d23-20261120-172444",
  "./src/js/justice.js?v=c82fe0d23-20261120-172444",
  "./src/js/food.js?v=c82fe0d23-20261120-172444",
  "./src/js/betrayal.js?v=c82fe0d23-20261120-172444",
  "./src/js/corpses.js?v=c82fe0d23-20261120-172444",
  "./src/js/corruption.js?v=c82fe0d23-20261120-172444",
  "./src/js/lifeseed.js?v=c82fe0d23-20261120-172444",
  "./src/js/spawn-knack.js?v=c82fe0d23-20261120-172444",
  "./src/js/trial-deeds.js?v=c82fe0d23-20261120-172444",
  "./src/js/practice-deeds.js?v=c82fe0d23-20261120-172444",
  "./src/js/tracks.js?v=c82fe0d23-20261120-172444",
  "./src/js/villager-build.js?v=c82fe0d23-20261120-172444",
  "./src/js/progression.js?v=c82fe0d23-20261120-172444",
  "./src/js/waveLedger.js?v=c82fe0d23-20261120-172444",
  "./src/js/standing.js?v=c82fe0d23-20261120-172444",
  "./src/js/ladder.js?v=c82fe0d23-20261120-172444",
  "./src/js/feastBuff.js?v=c82fe0d23-20261120-172444",
  "./src/js/ledger.js?v=c82fe0d23-20261120-172444",
  "./src/js/exposure.js?v=c82fe0d23-20261120-172444",
  "./src/js/abilityActions.js?v=c82fe0d23-20261120-172444",
  "./src/js/buildarounds.js?v=c82fe0d23-20261120-172444",
  "./src/js/foodPower.js?v=c82fe0d23-20261120-172444",
  "./src/js/monsterBehaviors.js?v=c82fe0d23-20261120-172444",
  "./src/js/partyTactics.js?v=c82fe0d23-20261120-172444",
  "./src/js/sigW3a.js?v=c82fe0d23-20261120-172444",
  "./src/js/statusEffects.js?v=c82fe0d23-20261120-172444",
  "./src/js/sigW3b.js?v=c82fe0d23-20261120-172444",
  "./src/js/metaProgression.js?v=c82fe0d23-20261120-172444",
  "./src/js/sigW3c.js?v=c82fe0d23-20261120-172444",
  "./src/js/sigW4.js?v=c82fe0d23-20261120-172444",
  "./src/js/sigW5.js?v=c82fe0d23-20261120-172444",
  "./src/js/villager-agency.js?v=c82fe0d23-20261120-172444",
  "./src/js/win-plan.js?v=c82fe0d23-20261120-172444",
  "./src/js/npc-triggers.js?v=c82fe0d23-20261120-172444",
  "./src/js/fieldFights.js?v=c82fe0d23-20261120-172444",
  "./src/js/party-wiring.js?v=c82fe0d23-20261120-172444",
  "./src/js/party-bond.js?v=c82fe0d23-20261120-172444",
  "./src/js/villager-objectives.js?v=c82fe0d23-20261120-172444",
  "./src/js/villager-goals.js?v=c82fe0d23-20261120-172444",
  "./src/js/villager-brain.js?v=c82fe0d23-20261120-172444",
  "./src/js/bond-initiation.js?v=c82fe0d23-20261120-172444",
  "./src/js/villager-mapmem.js?v=c82fe0d23-20261120-172444",
  "./src/js/codex-people.js?v=c82fe0d23-20261120-172444",
  "./src/js/fallen-memorial.js?v=c82fe0d23-20261120-172444",
  "./src/js/graves.js?v=c82fe0d23-20261120-172444",
  "./src/js/membership.js?v=c82fe0d23-20261120-172444",
  "./src/js/gardenCultivation.js?v=c82fe0d23-20261120-172444",
  "./src/js/havenGrowth.js?v=c82fe0d23-20261120-172444",
  "./src/js/shelter.js?v=c82fe0d23-20261120-172444",
  "./src/js/hierarchy.js?v=c82fe0d23-20261120-172444",
  "./src/js/scaleDiscovery.js?v=c82fe0d23-20261120-172444",
  "./src/js/comms.js?v=c82fe0d23-20261120-172444",
  "./src/js/table.js?v=c82fe0d23-20261120-172444",
  "./src/js/pods.js?v=c82fe0d23-20261120-172444",
  "./src/js/titans.js?v=c82fe0d23-20261120-172444",
  "./src/js/finale-campaign.js?v=c82fe0d23-20261120-172444",
  "./src/js/godhood.js?v=c82fe0d23-20261120-172444",
  "./src/js/pantheon.js?v=c82fe0d23-20261120-172444",
  "./src/js/records.js?v=c82fe0d23-20261120-172444",
  "./src/js/table-feared.js?v=c82fe0d23-20261120-172444",
  "./src/js/table-indispensable.js?v=c82fe0d23-20261120-172444",
  "./src/js/table-beloved.js?v=c82fe0d23-20261120-172444",
  "./src/js/table-witness.js?v=c82fe0d23-20261120-172444",
  "./src/js/table-assimilated.js?v=c82fe0d23-20261120-172444",
  "./src/js/table-defiant.js?v=c82fe0d23-20261120-172444",
  "./src/js/relay-ext.js?v=c82fe0d23-20261120-172444",
  "./src/js/relay-dialogue.js?v=c82fe0d23-20261120-172444",
  "./src/js/table-relay.js?v=c82fe0d23-20261120-172444",
  "./src/js/safetynets.js?v=c82fe0d23-20261120-172444",
  "./src/js/villageAgency.js?v=c82fe0d23-20261120-172444",
  "./src/js/memdepth.js?v=c82fe0d23-20261120-172444",
  "./src/js/overtime.js?v=c82fe0d23-20261120-172444",
  "./src/js/network-campaign.js?v=c82fe0d23-20261120-172444",
  "./src/js/debug-scenarios.js?v=c82fe0d23-20261120-172444",
  "./src/js/keepsakes.js?v=c82fe0d23-20261120-172444",
  "./src/js/skill-teaching.js?v=c82fe0d23-20261120-172444",
  "./src/js/person-trust.js?v=c82fe0d23-20261120-172444",
  "./src/js/companion-score.js?v=c82fe0d23-20261120-172444",
  "./src/js/world.js?v=c82fe0d23-20261120-172444",
  "./src/js/nomad.js?v=c82fe0d23-20261120-172444",
  "./src/js/nomad-wild.js?v=c82fe0d23-20261120-172444",
  "./src/js/nomad-scenes.js?v=c82fe0d23-20261120-172444",
  "./src/js/nomad-drive.js?v=c82fe0d23-20261120-172444",
  "./src/js/temperature.js?v=c82fe0d23-20261120-172444",
  "./src/js/godpath.js?v=c82fe0d23-20261120-172444",
  "./src/js/godverbs.js?v=c82fe0d23-20261120-172444",
  "./src/js/endingKey.js?v=c82fe0d23-20261120-172444",
  "./src/js/telemetry-hooks.js?v=c82fe0d23-20261120-172444",
  "./src/js/finishLog.js?v=c82fe0d23-20261120-172444",
  "./src/js/feel.js?v=c82fe0d23-20261120-172444",
  "./src/js/build.js?v=c82fe0d23-20261120-172444",
  "./src/js/whereAreWe.js?v=c82fe0d23-20261120-172444",
  "./src/js/drama.js?v=c82fe0d23-20261120-172444",
  "./src/js/move-anim.js?v=c82fe0d23-20261120-172444",
  "./src/js/presentation.js?v=c82fe0d23-20261120-172444",
  "./src/js/sprites.js?v=c82fe0d23-20261120-172444",
  "./src/js/tile-scenes.js?v=c82fe0d23-20261120-172444",
  "./src/js/regional-audio.js?v=c82fe0d23-20261120-172444",
  "./src/js/favor-company.js?v=c82fe0d23-20261120-172444",
  "./src/js/timeSettlement.js?v=c82fe0d23-20261120-172444",
  "./src/js/app.js?v=c82fe0d23-20261120-172444",
  "./src/js/feel-audio.js?v=c82fe0d23-20261120-172444",
  "./manifest.json?v=c82fe0d23-20261120-172444",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=c82fe0d23-20261120-172444",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=c82fe0d23-20261120-172444",
  "./src/data/alienPlayers.json?v=c82fe0d23-20261120-172444",
  "./src/data/animals.json?v=c82fe0d23-20261120-172444",
  "./src/data/arrivalText.json?v=c82fe0d23-20261120-172444",
  "./src/data/background_survivors.json?v=c82fe0d23-20261120-172444",
  "./src/data/biomes.json?v=c82fe0d23-20261120-172444",
  "./src/data/books.json?v=c82fe0d23-20261120-172444",
  "./src/data/build-notes.json?v=c82fe0d23-20261120-172444",
  "./src/data/cell_defs.json?v=c82fe0d23-20261120-172444",
  "./src/data/characterGen.json?v=c82fe0d23-20261120-172444",
  "./src/data/climates.json?v=c82fe0d23-20261120-172444",
  "./src/data/contests.json?v=c82fe0d23-20261120-172444",
  "./src/data/cooking.json?v=c82fe0d23-20261120-172444",
  "./src/data/events.json?v=c82fe0d23-20261120-172444",
  "./src/data/evolutions.json?v=c82fe0d23-20261120-172444",
  "./src/data/favor-rules.json?v=c82fe0d23-20261120-172444",
  "./src/data/feast-surge.json?v=c82fe0d23-20261120-172444",
  "./src/data/foreignSpeech.json?v=c82fe0d23-20261120-172444",
  "./src/data/gardening.json?v=c82fe0d23-20261120-172444",
  "./src/data/godpaths.json?v=c82fe0d23-20261120-172444",
  "./src/data/items.json?v=c82fe0d23-20261120-172444",
  "./src/data/justiceVoice.json?v=c82fe0d23-20261120-172444",
  "./src/data/knowledge.json?v=c82fe0d23-20261120-172444",
  "./src/data/ladder-capstones.json?v=c82fe0d23-20261120-172444",
  "./src/data/lifeseeds.json?v=c82fe0d23-20261120-172444",
  "./src/data/locations.json?v=c82fe0d23-20261120-172444",
  "./src/data/monsterBehaviors.json?v=c82fe0d23-20261120-172444",
  "./src/data/monsters.json?v=c82fe0d23-20261120-172444",
  "./src/data/nameCultures.json?v=c82fe0d23-20261120-172444",
  "./src/data/originPicker.json?v=c82fe0d23-20261120-172444",
  "./src/data/pellet-boost.json?v=c82fe0d23-20261120-172444",
  "./src/data/plants.json?v=c82fe0d23-20261120-172444",
  "./src/data/presentation.json?v=c82fe0d23-20261120-172444",
  "./src/data/recipes.json?v=c82fe0d23-20261120-172444",
  "./src/data/regions.json?v=c82fe0d23-20261120-172444",
  "./src/data/relicEnhancements.json?v=c82fe0d23-20261120-172444",
  "./src/data/reward-economy.json?v=c82fe0d23-20261120-172444",
  "./src/data/schemas.json?v=c82fe0d23-20261120-172444",
  "./src/data/statusEffects.json?v=c82fe0d23-20261120-172444",
  "./src/data/synergies.json?v=c82fe0d23-20261120-172444",
  "./src/data/table-beats.json?v=c82fe0d23-20261120-172444",
  "./src/data/table-endings.json?v=c82fe0d23-20261120-172444",
  "./src/data/titans.json?v=c82fe0d23-20261120-172444",
  "./src/data/tracks.json?v=c82fe0d23-20261120-172444",
  "./src/data/villagers.json?v=c82fe0d23-20261120-172444",
  "./src/data/wave-ledger.json?v=c82fe0d23-20261120-172444"
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
