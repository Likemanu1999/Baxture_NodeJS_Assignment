const express = require("express")
const bodyParser = require('body-parser');
const route = require("./Route/route")

const mongoose = require('mongoose')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : true }));
mongoose.connect("mongodb+srv://manish:iXN1zqLOlpx5PBN6@cluster0.cprui.mongodb.net/Task",{
    useNewUrlParser: true,
})
.then(()=> console.log("mongoodb connted"))
.catch(err => console.Console.log(err))

app.use('/',route)

app.listen(process.env.PORT || 3000 ,function(){
    console.log(`express is running on port`+ (process.env.PORT || 3000))
})