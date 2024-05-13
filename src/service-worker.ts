/// <reference lib="webworker" />

(function (self: ServiceWorkerGlobalScope) { // hard cast; https://github.com/microsoft/TypeScript/issues/14877

const cacheName = 'transaction-logger';
const filesToCache = [
  './',
  './index.html',
  './assets/index.css',
  './assets/index.js',
  './assets/logo.svg',
  './manifest.json',
  './chili-256.png',
];

async function fillCache() {
  const cache = await caches.open(cacheName);
  for (const url of filesToCache) {
    //console.log(`installing ${url}`);
    await cache.add(new Request(url, {cache: 'reload'}));
  }
}

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function (e) {
  //console.log('install...');
  e.waitUntil(
    fillCache()
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  //console.log('activate');
  evt.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(name => {
          if (name !== cacheName) {
            return caches.delete(name);
          }
        })
      );
    })
  )
});

self.addEventListener('fetch', event => {
  const fetchIt = async (e: FetchEvent) => {
    const cache = await caches.open(cacheName);
    const resFromCache = await cache.match(e.request);
    if (resFromCache!==undefined) {
      //if (e.request.url.toString().search('index.html')) console.log(`fetched ${e.request.url} from the cache`);
      return resFromCache;
    }
    else {
      if (e.request.url.toString().search('index.html')) console.log(`fetching ${e.request.url} from the net`);
      return fetch(e.request);
    }
  };
  event.respondWith(fetchIt(event));
});

self.addEventListener('message', (event) => {
  if (event.data === 'REINSTALL') {
    console.log('service-worker: reinstall');
    event.waitUntil(
      fillCache().then(()=>{
        //console.log('install terminated');
        event.source?.postMessage('RESTART');        
      })
    );    
  }
  else if (event.data === 'CHECK_FOR_NEW_VERSION') {
    console.log('service-worker: check for new version');
    if (event.source!==null) {
      checkForUpdates(event.source);
    }
  }
  else if (event.data === 'SKIP_WAITING') {
    console.log('service-worker: skip waiting');
    self.skipWaiting();
  }
  else {
    console.log(`error: command ${event.data} unknown`);
    console.log("message received",event);
  }
});

async function checkForUpdates(source: Client|ServiceWorker|MessagePort) {
  const cache = await caches.open(cacheName);
  let updateAvailable = false;
  for (const fileName of filesToCache) {
    //console.log(`checking ${fileName}`);
    const resFromCache = await cache.match(fileName);
    if (resFromCache) {
      try {
        const resFromNet = await fetch(fileName);
        const dataCache = await resFromCache.text();
        const dataNet = await resFromNet.text();
        if (dataNet !== dataCache) {
          updateAvailable = true;
          console.log(`change detected for ${fileName} (${dataNet.length}, ${dataNet.length})`);
          break;
        }
        else {
          //console.log(`no change detected for ${fileName}`);
        }
      }
      catch {
        console.log(`offline while checking ${fileName}`);
        break;
      }
    }
  }  

  if (updateAvailable) {
    source?.postMessage('NEW-VERSION-DETECTED');
  }
}

})(<ServiceWorkerGlobalScope>self);
