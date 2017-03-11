import express from 'express'
import webPush from 'web-push'
import bodyParser from 'body-parser'

const app = express()

let users = []

// Array collecting active subscriptions
// Would be replaced with a DB in real app
let subscriptions = []

// For testing set how often in seconds a push message should be sent
const pushInterval = 10

// set the Google Cloud Messaging Key to send messages through chrome
if (!process.env.GCM_KEY) {
    console.error('To send push messages through Google Chrome a GCM key is required from http://firebase.google.com')
} else {
    webPush.setGCMAPIKey(process.env.GCM_KEY)
}

// function to send notifications to each registered subscription and remove the endpoint from that array if there is an error
function sendNotification(endpoint) {
    webPush.sendNotification({endpoint})
    .then(() => {
        console.log('Push notification sent to ' + endpoint)
    })
    .catch((error) => {
        console.error('Unable to send push message to ' + endpoint + '. Removing subscription.')
        console.error('ERROR', error)
        subscriptions.splice(subscriptions.indexOf(endpoint), 1)
    })
}

// In a real app the messages would be sent in response to actions
// for testing a message is sent every *pushInterval* seconds
setInterval(() => {
    subscriptions.forEach(sendNotification)
}, pushInterval * 1000)

// check if the user is already subscribed
function isSubscribed(endpoint) {
    return subscriptions.indexOf(endpoint) >= 0
}

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://push-client-test.herokuapp.com')
    res.setHeader('Access-Control-Allow-Headers', 'content-type')
    return next()
})
app.use(bodyParser())

app.get('/', (req, res) => {
    res.send('It Works!!!')
})

// route to register the push message subscription
app.post('/register', (req, res) => {
    const endpoint = req.body.endpoint
    if (!isSubscribed(endpoint)) {
        console.log('Subscription Registered for ' + endpoint)
        subscriptions.push(endpoint)
    }
    res.type('js').send({success: true})
})

app.post('/login', (req, res) => {
    users.push(req.body.username)
    res.type('js').send({success: true})
})

app.post('/unregister', (req, res) => {
    const endpoint = req.body.endpoint
    if (isSubscribed(endpoint)) {
        console.log('Subscription removed for ' + endpoint)
        subscriptions.splice(subscriptions.indexOf(endpoint), 1)
    }
    res.type('js').send({success: true})
})

app.listen(process.env.PORT || 4040, () => {
    console.log('Push Server running on port', process.env.PORT || 4040)
})