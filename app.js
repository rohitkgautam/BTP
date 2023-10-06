//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const alert = require("alert");
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const flash = require("flash");
//const encrypt = require("mongoose-encryption")
//const md5 = require("md5");
 const multer = require("multer");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));
app.use(bodyParser.json())


app.use(session({
  secret: "we help calssify ecgs",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
//mongoose.set("useCreateIndex", true);
 const userSchema = new mongoose.Schema({

   name:String,
   age:Number,
   gender:String,
   email: String,
   password: String,
    img:{data:Buffer,contentType: String},
   googleID: String,


 })




 userSchema.plugin(passportLocalMongoose);
 userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());


passport.serializeUser(function(user,done)
{
  done(null,user.id);
});



passport.deserializeUser(function(id,done)
{
  User.findById(id, function(err,user)
{
  done(err,user);
})
});

passport.use(new GoogleStrategy({
    clientID: "1013612599803-gfdad54eh6n7hve5opsoblussq0hekqn.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/auth/google/cardiocare",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {

      return cb(err, user);
    });
  }
));





 app.post("/register",  async(req,res)=>
{

const email = req.body.username;
const uniquestring = randstring();
const isvalid = false;
sendEmail(email,uniquestring);
User.register({name:req.body.name,username: req.body.username,age:req.body.age,gender:req.body.gender}, req.body.password, function(err,user)
    {
      if(err)
      {
          console.log(err);
        res.redirect("/register");
      }
      else{
        passport.authenticate("local")(req,res, function()
      {
        res.redirect("/emailsent");
      })
      }


    })
//const newuser= new User({isvalid,uniquestring,...req.body});
//await newuser.save();




})


app.post("/login", function(req,res)
{
const user = new User(
  {
    name:req.body.name,
    username:req.body.username,
    password: req.body.password,

  }
)

req.login(user, function(err)
{
  if(err)
  {
    console.log(err);
    res.redirect("/login");
  }
  else{
    passport.authenticate("local")(req,res, function()
  {
    res.redirect("/secrets");
  })
  }
})

})


app.get("/", function(req,res)
{
  res.render("home");
});

app.get("/emailsent", function(req,res)
{
  res.render("emailsent");
});

app.get('/auth/google', passport.authenticate('google', {

scope: ['profile']

}));

app.get('/auth/google/cardiocare',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

app.get("/submit", function(req,res)
{

  if(req.isAuthenticated())
  {
    res.render("submit");
  }
  else
  res.redirect("/login");

})

app.get("/login", function(req,res)
{
  res.render("login");
});

app.get("/register", function(req,res)
{
  res.render("register");
});
app.get("/profile", function(req,res)
{
  res.render("profile");
});


app.get("/secrets", function(req,res)
{
  if(req.isAuthenticated())
  {
    res.render("secrets",{
user: req.user
});
  }
  else
  res.redirect("login");
})

app.get("/logout", function(req,res)
{
  req.logout();
  res.redirect("/");
})

app.post("/update", function(req,res)
{
  User.findById(req.user.id, function (err, user) {

        // todo: don't forget to handle err

        if (!user) {
            req.flash('error', 'No account found');
            return res.redirect('/');
        }

        // good idea to trim
        var name = req.body.name;
        var age = req.body.age;
        var gender = req.body.gender;


        // validate
        if (!name || !age || !gender) { // simplified: '' is a falsey
            req.flash('error', 'One or more fields are empty');
            return res.redirect('/profile'); // modified
        }

        // no need for else since you are returning early ^
        user.name = name;

        user.age = age;
        user.gender =gender;


        // don't forget to save!
        user.save();
    });
  res.redirect("/secrets");
})

app.get("/verify/:uniquestring", async(req,res)=>
{
  const {uniquestring}= req.params;

      res.redirect("/login");









  })

  app.post("/submit", function(req,res)
{
console.log("file taken as input is");
console.log( req.body.myfile);


})




const randstring =()=>{
  const len=8;
  let randstr="";
  for(let i=0;i<len;i++)
  {
    const ch= Math.floor((Math.random()*10)+1);
    randstr+=ch;
  }
  return randstr;
}


const sendEmail =(email, uniquestring)=>
{
  var Transport = nodemailer.createTransport(
    {
    service: "Outlook365",
    host: "smtp-mail.outlook.com",
    secureConnection: false,
    port: 587,
    tls: {
       ciphers:'SSLv3'
    },
      auth:{
        user:"ananya130420@outlook.com",
        pass:"DR.madhu10071972"
      }

    }
  );


var mailOptions;
let sender="Ananya Singh";
mailOptions={
  from:sender,
  to:email,
  subject:"email-confirmation",
  html:'press <a href= "http://localhost:3000/verify/${uniquestring}"> here</a>to verify your email.Thanks'
};
Transport.sendMail(mailOptions, function(err,res)
{
  if(err)
  console.log(err);
  else
  console.log("message sent");
});


}


app.listen(3000, function()
{
  console.log("server is running");
})
