import express from 'express'
import webPush from 'web-push'
import bodyParser from 'body-parser'

const app = express()

let users = []

// Array collecting active subscriptions
// Would be replaced with a DB in real app
// let subscriptions = []

// For testing set how often in seconds a push message should be sent
const pushInterval = 10

// set the Google Cloud Messaging Key to send messages through chrome
if (!process.env.GCM_KEY) {
    console.error('To send push messages through Google Chrome a GCM key is required from http://firebase.google.com')
} else {
    webPush.setGCMAPIKey(process.env.GCM_KEY)
}

// function to send notifications to each registered subscription and remove the endpoint from that array if there is an error
function sendNotification(user) {
    webPush.sendNotification({endpoint: user.subscription})
    .then(() => {
        console.log('Push notification sent to ' + user.subscription)
    })
    .catch((error) => {
        console.error('Unable to send push message to ' + user.subscription + '. Removing subscription.')
        console.error('ERROR', error)
        const index = users.findIndex(u => u === user)
        users[index].subscription = null
    })
}

// In a real app the messages would be sent in response to actions
// for testing a message is sent every *pushInterval* seconds
setInterval(() => {
    users.forEach(sendNotification)
}, pushInterval * 1000)

// check if the user is already subscribed
function isSubscribed(endpoint) {
    users.forEach(user => {
        return user.subscription ? user.subscription.indexOf(endpoint) >= 0 : -1
    })
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
        const index = users.findIndex(user => user.username === req.body.username)
        users[index].subscription = endpoint
    }
    res.type('js').send({success: true})
})

app.post('/login', (req, res) => {
    users.push({username: req.body.username})
    res.type('js').send({success: true})
})

app.post('/logout', (req, res) => {
    const index = users.findIndex((user) => user.username === req.body.username)
    users.splice(index, 1)
})

app.post('/unregister', (req, res) => {
    const endpoint = req.body.endpoint
    if (isSubscribed(endpoint)) {
        console.log('Subscription removed for ' + endpoint)
        const index = users.findIndex(user => endpoint === user.subscription)
        users[index].subscription = null
    }
    res.type('js').send({success: true})
})

app.listen(process.env.PORT || 4040, () => {
    console.log('Push Server running on port', process.env.PORT || 4040)
})