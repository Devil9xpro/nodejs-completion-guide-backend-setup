const express = require('express')
const moongose = require('mongoose')
const path = require('path')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid');

const app = express()

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const feedRoutes = require('./routes/feed')

app.use(express.json())
app.use(
    multer({
        storage: fileStorage,
        fileFilter: fileFilter
    }).single('image')
)

// Handle CORS error
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE, PATCH')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/feed', feedRoutes)

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const message = error.message
    res.status(status).json({
        message: message
    })

})

moongose.connect('mongodb://127.0.0.1:27017/messages-app')
    .then(result => {
        app.listen(8080)
    })
    .catch(err => console.log(err))

