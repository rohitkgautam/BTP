//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const alert = require("alert");
//const encrypt = require("mongoose-encryption")
//const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltrounds = 10;





const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
 const userSchema = new mongoose.Schema({
   email: String,
   password: String

 })

const User = new mongoose.model("User", userSchema);

 app.post("/register", function(req,res)
{
bcrypt.hash(req.body.password, saltrounds, function(err,hash)
{

  const newUser = new User({
    email: req.body.username,
    password: hash
  });




  newUser.save(function(err)
  {
    if(err)
    console.log(err);
    else
    {
      res.render("secrets");

    }
  })

})






})


app.post("/login", function(req,res)
{
  const username = req.body.username;
  const password= req.body.password
  User.findOne({email:username},function(err, foundUser)
{
  if(err)
  console.log(err);
  else{
    if(foundUser)
    {
      bcrypt.compare(password, foundUser.password, function(err,result)
    {
      if(result==true)
      res.render("secrets");
      else
      {

        res.send('alert("incorrect password")');

     }

    })


    }
  }
})
})


app.get("/", function(req,res)
{
  res.render("home");
});

app.get("/login", function(req,res)
{
  res.render("login");
});

app.get("/register", function(req,res)
{
  res.render("register");
});







app.listen(3000, function()
{
  console.log("server chal rha guymzz");
})
