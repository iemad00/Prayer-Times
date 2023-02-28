const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const ejs = require("ejs");

const app = express();
app.set("view engine",'ejs')
app.use(bodyParser.urlencoded())
app.use(express.static("style"));

let fajr =  "0:00"
let sunrise = "0:00"
let dhuhr =  "0:00"
let asr = "0:00"
let maghrib =  "0:00"
let isha =  "0:00"
let city = "Prayer Times"
let date;

app.get("/", function(req,res){ 
    res.render("prayer_times", {
        fajr: PMorAM(fajr),
        sunrise: PMorAM(sunrise),
        dhuhr: PMorAM(dhuhr),
        asr: PMorAM(asr),
        maghrib: PMorAM(maghrib),
        isha: PMorAM(isha),
        city: city,
        date: date
    })
})

app.post("/", function(req,res){
    date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    city = capitalizeFirstLetter(req.body.city);
    var options = { weekday: 'long', month: 'long', day: 'numeric' };
    date = date.toLocaleDateString("en-US",options)
    const url = 'https://api.aladhan.com/v1/calendarByCity/'+year+'/'+month+'?city='+city+'&country=Saudi%20Arabia&method=4';
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


// Convert 24 Hour Time to AM/PM
function PMorAM(clock){
    if(clock != "0:00"){
        if(parseInt(clock.split(":")[0]) > 12){
            return (clock.split(":")[0] - 12) + ":" + clock.split(":")[1] + " PM";
        }else{
            return clock + " AM"
        }
    }
    return clock;
}

// Capitalize the first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


app.listen(3000,function(){
    console.log("The server is running on port number 3000");
})


