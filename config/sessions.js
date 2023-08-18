require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");

const MongoStore = require("connect-mongo");

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  sessions({
    secret: process.env.SECRET,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      
    }),
  })
);

module.exports = { app, mongoose, PORT };
