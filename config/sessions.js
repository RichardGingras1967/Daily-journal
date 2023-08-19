//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const oneDay = 1000 * 60 * 60 * 24;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
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
