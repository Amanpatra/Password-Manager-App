//jshint esversion:6

// npm modules-----------------------------------
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
// ----------------------------------------------

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/passwordKeeperDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    website: String,
    username: String,
    password: String
});
const websiteSchema = new mongoose.Schema({
    name: String
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);
const WebApp = mongoose.model("WebApp", websiteSchema);


app.post("/app/user", function(req, res) {
    const userName = req.body.username;
    const pwd = req.body.password;
    const newUser = new User({
        username: userName,
        password: pwd
    })
    newUser.save(function(err) {
        if(!err) {
            res.send({status: "Account created"});
        }
    })
})


app.post("/app/user/auth", function(req, res) {
    const userName = req.body.username;
    const pwd = req.body.password;
    User.findOne({username:userName}, function(err, foundUser) {
        if(!err) {
            if(foundUser.password == pwd) {
                res.send({
                    status: "Success",
                    userId: foundUser._id
                });
            }
            
        }
    })    
})

app.get("/app/sites/list/:user", function(req, res) {
    const userID = req.params.user;
    User.findById(userID, function(err, foundUser) {
        if(!err) {
            const websiteName = foundUser.website;
            User.find({website:websiteName}, function(err, foundUsers) {
                if(!err) {
                    res.send(foundUsers);
                }
            })
        }
    })
})

app.post("/app/sites:user", function(req, res) {
    const websiteName = req.body.website;
    const userName = req.body.username;
    const pwd = req.body.password;
    const newUser = new User({
        website: websiteName,
        username: userName,
        password: pwd
    })
    const newWebapp = new WebApp({
        name:websiteName
    })
    newWebapp.save();
    newUser.save(function(err) {
        if(!err) {
            res.send({status: "Success"});
        }
    })
})

app.listen(3000, function() {
    console.log("Server started on port 3000");
});      