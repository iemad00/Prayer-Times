const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");

const app = express();
app.set("view engine",'ejs')
app.use(bodyParser.urlencoded())

let fajr =  "0:00"
let sunrise = "0:00"
let dhuhr =  "0:00"
let asr = "0:00"
let maghrib =  "0:00"
let isha =  "0:00"

app.get("/", function(req,res){
    res.render("prayer_times", {
        fajr: fajr,
        sunrise: sunrise,
        dhuhr: dhuhr,
        asr: asr,
        maghrib: maghrib,
        isha: isha
    })
})


app.post("/", function(req,res){
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const city = req.body.city;
    const url = 'https://api.aladhan.com/v1/calendarByCity/'+year+'/'+month+'?city='+city+'&country=Saudi%20Arabia';
    https.get(url, function(response){
        console.log(response.statusCode);
        let rawData = ''
        response.on("data", function(data){
          rawData = `${rawData}${data}`
        })
        response.on("end", function() {
          const apidata = JSON.parse(rawData)
          const timing = apidata.data[day - 1].timings;
          fajr = timing.Fajr.split(" ")[0];
          sunrise = timing.Sunrise.split(" ")[0];
          dhuhr = timing.Dhuhr.split(" ")[0];
          asr = timing.Asr.split(" ")[0];
          maghrib = timing.Maghrib.split(" ")[0];
          isha = timing.Isha.split(" ")[0];

          res.redirect("/");
        })
      })
})


app.listen(3000,function(){
    console.log("The server is running on port number 3000");
})