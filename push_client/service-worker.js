// listen for push events and define text to be displayed
// then display the notification
self.addEventListener('push', (event) => {
    event.waitUntil(self.registration.showNotification('Push Messaging Test', {
        body: 'This is a test Push Message!'
    }))
})

// add a listener for the pushsubscriptionchange event to watch for subscription expiration
// Subscribe again and send the new subscription endpoint to the server
// real app would also depend on user identification
self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('Subscription expired')
    event.waitUntil(
        self.registration.pushManager.subscribe({userVisibleOnly: true})
        .then(subscription => {
            console.log('Subscribed again to ', subscription.endpoint)
            return fetch('/register', 
            {
                method: 'POST',
                headers: {'ContentType': 'application/json'},
                body: JSON.stringify({
                    endpoint: subscription.endpoint
                })
            })
        })
    )
})