window.addEventListener('load', () => {
    // check if service workers are supported
    if ('serviceWorker' in navigator) {
        // register the service worker, this will by default have access to only URLs with a path of the same directory
        // e.g. if the service worker is in /scripts/serviceworker.js it would only have control of URLs of www.name.com/scripts/
        // this can be resolved by attaching a Service-Worker-Allowed header directly to the file with your server using a value of / to give it full access
        // when using this header you also need to add a {scope: '/'} as the second parameter to the register method
        // alternatively you can host the file in your root directory which also gives access to the full scope
        navigator.serviceWorker.register('../serviceworker.js')
        .then(registered => console.log('Registered service worker with scope: ', registered.scope)) // perform actions once registered
        .catch(error => console.error('Service Wroker Error: ', error)) // catch any errors
    }
})