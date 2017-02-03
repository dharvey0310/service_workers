window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../serviceworker.js')
        .then(registered => console.log('Registered service worker with scope: ', registered.scope))
        .catch(error => console.error('Service Wroker Error: ', error))
    }
})