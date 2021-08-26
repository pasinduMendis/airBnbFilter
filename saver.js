const express = require('express')
const bodyParser = require('body-parser')
const AirBnb = require('./hostDetailsSchema.js')
//const AirBnbHost = require('./hostNameSchema.js')
// const getData = require('./test')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const dbConfig = require('./databaseUrl.js')
const mongoose = require('mongoose')

mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    //const airBnb = new AirBnb()
    //airBnb.save()

    console.log('successfully connected')
  })
  .catch((err) => {
    console.log('not connected', err)
    process.exit()
  })

//app.listen(8000, () => {
//  console.log('saver is listen')
//})
