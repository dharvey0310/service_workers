'use strict'

const usernameInput = document.getElementById('username')
let username
const subscriptionButton = document.getElementById('register')
const logInOutButton = document.getElementById('login')

// define method to get the subscription which returns a promise
function getSubscription() {
    return navigator.serviceWorker.ready
    .then(registration => {
        return registration.pushManager.getSubscription()
    })
}

// register the service worker and check the initial subscription state
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
    .then(() => {
        console.log('Service Worker registered')
        subscriptionButton.removeAttribute('disabled')
    })
    .then(setLoginButton)
}

function login() {
    console.log('Logging In')
    username = usernameInput.value
    return fetch('https://push-server-testing.herokuapp.com/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: username
        })
    })
    .then(getSubscription)
    .then(subscription => {
        if (subscription) {
            console.log('Already registered at ', subscription.endpoint)
            return fetch('https://push-server-testing.herokuapp.com/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: username,
                    endpoint: subscription.endpoint
                })
            }).then(setUnsubscribeButton)
        } else {
            setSubscribeButton()
        }
    })
    .then(setLogoutButton)
}

function logout() {
    return fetch('https://push-server-testing.herokuapp.com/logout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: username
        })
    })
    .then(setLoginButton)
}

// get the 'registration from the service worker and create a new 'subscription'
// register the subscription with the push message server by sending a POST request to the server
function subscribe() {
    navigator.serviceWorker.ready
    .then(registration => {
        return registration.pushManager.subscribe({userVisibleOnly: true})
    })
    .then(subscription => {
        console.log('Subscribed ', subscription.endpoint)
        return fetch('https://push-server-testing.herokuapp.com/register', 
        {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                endpoint: subscription.endpoint
            })
        })
    }).then(setUnsubscribeButton)
}

// get the subscription and unsubscribe it 
// send a POST request to the server to unregister the subscription from messaging
function unsubscribe() {
    getSubscription().then(subscription => {
        return subscription.unsubscribe()
        .then(() => {
            console.log('Unsubscribed ', subscription.endpoint)
            return fetch('https://push-server-testing.herokuapp.com/unregister', 
            {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify({
                    endpoint: subscription.endpoint
                })
            })
        })
    }).then(setSubscribeButton)
}

function setLoginButton() {
    logInOutButton.onclick = login
    logInOutButton.textContent = 'Login'
}

function setLogoutButton() {
    logInOutButton.onclick = logout
    logInOutButton.textContent = 'Logout'
}

function setSubscribeButton() {
    subscriptionButton.onclick = subscribe
    subscriptionButton.textContent = 'Register'
}

function setUnsubscribeButton() {
    subscriptionButton.onclick = unsubscribe
    subscriptionButton.textContent = 'Unsubscribe'
}