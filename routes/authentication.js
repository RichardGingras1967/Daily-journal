const { postSchema, listSchema, userSchema, Post, List, Client } = require("../models/schemas");
const { generateFromEmail, generateUsername } = require("unique-username-generator");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const getLogin = function (req, res) {
  
  const message = req.session.message || "";
  req.session.message = null;
  res.render("login.ejs", { message: message });

};

const postLogin = function (req, res) {

  const email = req.body.username;

  Client.findOne({ email: email }).then((user) => {
    if (user != null) { //user exist
      
      bcrypt.compare(req.body.password, user.password)
      .then((granted) => {
        if (granted) {
          req.session.userId = user._id.toString();
          req.session.userName = email;
          res.redirect("/howto");
        } else {
          req.session.message = "Sorry, wrong username or password.";
          res.redirect("/login");
        }
      });

    } else {
      res.redirect("/register");
    }
  });
};

const getRegister = function (req, res) {

  const username = generateUsername("@", 0, 20);
  const message = req.session.message || "";
  req.session.message = null;

  res.render("register.ejs", {
    message: message,
    username: username + ".com",
  });

};

const postRegister = function (req, res) {

  const email = req.body.username;
  const password = req.body.password;

  Client.findOne({ email: email })
    .then((user_exist) => {
      if (user_exist != null) {
        req.session.message = "Sorry, username already taken.";
        res.redirect("/register");
      } else {
        if (password.length < 3) {
          req.session.message =
            "Sorry, choose a password with at least 3 caracters.";
          res.redirect("/register");
        } else {

          bcrypt.hash(password, saltRounds).then((hash) => {
            const newUser = new Client({
              email: email,
              password: hash,
            });

            newUser.save().then((addedUser) => {
              req.session.userId = addedUser._id.toString();
              req.session.userName = email;
              res.redirect("/howto");
            });
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/error");
    });
};

const getLogOut = function (req, res) {
  req.session.destroy((logged) => {
    console.log("user logged out");
  });
  res.redirect("/");
};

module.exports = { getLogin, postLogin, getRegister, postRegister, getLogOut };
