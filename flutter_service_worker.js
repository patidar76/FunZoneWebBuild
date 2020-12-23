'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "app.png": "79c81e440cddb8b846b470948164b1c1",
"assets/AssetManifest.json": "4c96bdd9a0d39505ca6673a7a5d72a3a",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/images/0.png": "990add7b32330c617f907cc38ab8f453",
"assets/images/1.png": "af80a54d3617d9e16d01d7af7e98494e",
"assets/images/2.png": "36623dbe91a5169c5a30cdb9a1b277d5",
"assets/images/3.png": "67a0a4037274af61e90e016d16c0463d",
"assets/images/4.png": "6acd34e6cdbce2621875d48847cdec67",
"assets/images/5.png": "2f92ee6ebf2616f1dc978678aafd44a6",
"assets/images/6.png": "0f4754a2942a5409da347d84356ccce1",
"assets/images/7.png": "6f7dd635ef39b35b81db7fa0da02c627",
"assets/images/8.png": "8427990f903c1c75646b3696396689aa",
"assets/images/back.jpg": "aaea101d4fdc54225138b67d999f5fed",
"assets/images/back_side.png": "d1e7166ca1d8471c402b9e38950909b0",
"assets/images/blue.jpg": "ca38392460094f395243a4d36f191335",
"assets/images/bomb.png": "3485824e8120bf824b1dd767316ac1b3",
"assets/images/circle.png": "ce73c75cd3f781b26fb5614b2dc66850",
"assets/images/clubs.png": "0f6e3a5d17b96f4f2b32b994141d1327",
"assets/images/cross.png": "256ebca73a73ef6de13394b03967dd1a",
"assets/images/diamonds.png": "5853139a45543fb6a593cf068cf79f95",
"assets/images/edit.png": "7f1a230ec7b3ddb05ac03694709a4f53",
"assets/images/empty.jpg": "2edff45aa33e38ce6883cf63b88b85bc",
"assets/images/facingDown.png": "b8be3b835434ac9d15fc407b4bad30db",
"assets/images/fifteen.png": "ef72be1219031b2bce0759e51e7e1387",
"assets/images/flagged.png": "f31e6c65b9b47999d6bb69ec6926ab56",
"assets/images/four.png": "23d47db4cb653dd55157f288f8407c05",
"assets/images/hearts.png": "27e5c670f63bed4d19b19faf98bcfa94",
"assets/images/mineswapper.png": "5e6e0a51bf87a3987727720ad28a7256",
"assets/images/red.png": "b82ac357dbfbab8593e00c930a17463d",
"assets/images/solitre.png": "47a81ba969718aedab13e4b8a1838904",
"assets/images/spades.png": "0d2d54596c7befee4659a208ea1e0f80",
"assets/images/tictactoe.png": "3e84f7c4d0a89efb87c3bf9fae4cf4b0",
"assets/NOTICES": "286df8bbafa25f43d9f1ea1f994a8f1f",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"index.html": "3eac856e532e34d0a47dfe3dd6f357fc",
"/": "3eac856e532e34d0a47dfe3dd6f357fc",
"main.dart.js": "d18e3622c0215146168abc17d072e5e5",
"manifest.json": "5eed90701ae714e5c091bcec17ccc282",
"version.json": "326abb6d8cd105fa0e1b4266daa99137"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
