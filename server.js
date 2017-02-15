import express from 'express'

const app = express()

app.use('/scripts', express.static(__dirname + '/scripts'))
app.use('/service-worker.js', express.static(__dirname + '/service-worker.js'))
app.use('/manifest.json', express.static(__dirname + '/manifest.json'))
app.use('/icon.png', express.static(__dirname + '/icon.png'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

app.listen(process.env.PORT || 8080, () => {
    console.log('Server is listening on port', process.env.PORT || 8080)
})