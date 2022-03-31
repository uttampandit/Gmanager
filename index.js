const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const {google}  = require('googleapis');
const router = require('./routes/allroutes')
const cookie = require('cookie-parser')
const cors = require('cors');
const mongoose = require('mongoose')
const path = require('path')
const flash = require('connect-flash');
app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cookie());
app.set('view engine',"ejs")
app.use(cors({
    origin : "*",
}))

const Dburl = process.env.dburl
app.use(router);
mongoose.connect(Dburl,{ useUnifiedTopology: true,useNewUrlParser: true })
.then(()=>{
    app.listen(PORT,(req,res)=>{
        console.log(`ported started at ${PORT}`);
    });
})
.catch(err=>{
    console.log("error generated")
    console.log(err)
})

