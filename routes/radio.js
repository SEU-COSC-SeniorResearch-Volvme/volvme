const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const multer = require('multer')
const session = require('express-session')
const logger = require('morgan')
//Initialize Routers
const router = express.Router()


//Instantiate Middleware Services
const storage = multer.diskStorage({
    destination: function(req, file, done) {
        done(null, 'public/radio/')
    },
    filename: function(req, file, done) {
        done(null, file.fieldname + '-' + Date.now() + path)
    }
})
const upload = multer({storage: storage})

router.get('/', function(req,res) {

	return res.render('radio')
})

router.post('/upload', upload.single('radioUpload'), function(req, res) {

    const file = req.file
    if (!file) return res.status(500).send('Please upload a file')
    console.log('successful file upload')
	return res.status(200).redirect('/radio')
})

module.exports = router