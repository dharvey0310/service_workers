// Declare the name of our cache and the URLs we want to cache (can also be individual files)
const CacheName = 'test_cache_01'
const cacheURLs = [
    '/',
    '/scripts'
]

// handle the installation of the service worker and open the cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CacheName) // opens the cache you have defined and returns a promise (cache.open can be called more than once to open multiple caches)
        .then((cache) => {
            console.log('Cache Opened')
            return cache.addAll(cacheURLs) // add all of the files you have defined to the cache
        })                                  // if any of these files fails to cache then the whole cache fails
    )
})


// add event listener for the service worker to intercept any fetch requests
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request) // checks if the requested file has been cached and returns a promise
        .then(response => {
            if (response) {
                return response // if the cache contains the file return the cached version
            }

            // clone the request as the request is a stream it can only be consumed once and we want it consumed by both the browser and cache
            const fetchRequest = event.request.clone()

            return fetch(fetchRequest) // if no cached version exists continue with the fetch request
            .then(response => {

                // check for a valid response and a status of 200
                // we check that the response type is basic to ensure that this is a request from our origin to avoid caching third party files
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    // return the response directly to the browser
                    return response
                }

                // clone the response as this is also a stream and we want to use it with both the browser and cache
                const responseForCache = response.clone()

                // open the cache we created earlier
                caches.open(CacheName)
                .then(cache => {
                    cache.put(event.request, responseForCache) // we add the request and response to the cache
                })

                // return the response to the browser
                return response
            })
        })
    )
})


// add event listener for activate to update the service worker when it is registering as a new worker replacing your old worker
self.addEventListener('activate', (event) => {

    // set a whitelist of the cache names that were installed by the previous worker you don't want deleted
    const whitelist = ['test_cache_01']

    event.waitUntil(
        // use cache.keys to get the names of the current caches
        caches.keys().then(cacheNames => {
            // return a promise which resolves with an array of the cache without the deleted entries
            return Promise.all(
                cacheNames.map(name => {
                    // check if the cache is in the whitelist
                    if (whitelist.indexOf(name) === -1) {
                        // if the cache is not in the whitelist delete it
                        return caches.delete(name)
                    }
                })
            )
        })
    )
})

/**
 *  When using fetch by default it won't send any cookies in the request
 *  if you want cookies to be included you will need to specify this in the fetch request
 *  e.g. fetch(url, {credentials: 'include'})
 */
