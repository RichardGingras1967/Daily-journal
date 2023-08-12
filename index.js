//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const connectDB = async ()=> {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  });
}


const postSchema = new mongoose.Schema({
  title: String,
  text: String,
});

const listSchema = new mongoose.Schema({
  categorie: String,
  posts: [postSchema],
});

const Post = mongoose.model("Post", postSchema);
const List = mongoose.model("List", listSchema);

const composeText = fs.readFileSync("public/texts/compose.txt", "utf-8");
const viewText = fs.readFileSync("public/texts/view.txt", "utf-8");
const readText = fs.readFileSync("public/texts/read.txt", "utf-8");
const deleteText = fs.readFileSync("public/texts/delete.txt", "utf-8");
const aboutContent = fs.readFileSync("public/texts/about.txt", "utf-8");
const contactContent = fs.readFileSync("public/texts/contact.txt", "utf-8");

app.get("/compose/:categorie", function (req, res) {
  const categorie = _.capitalize(req.params.categorie);

  List.find({ categorie: categorie }).then((items) => {
    if (items.length === 0) {
      const greetingPost = new Post({
        title: "Welcome to your " + categorie + " section",
        text: "",
      });

      const list = new List({
        categorie: categorie,
        posts: [greetingPost],
      });

      list.save();
      res.redirect("/compose/" + categorie);
    } else {
      res.render("compose.ejs", { categorie: categorie });
    }
  });
});

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs", { aboutContent: aboutContent });
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs", { contactContent: contactContent });
});

app.get("/howto", (req, res) => {
  res.render("howto.ejs", {
    data: [
      { header: "Compose", text: composeText, bar: "localhost:3000/<b>compose</b>/work"},
      { header: "View", text: viewText, bar: "localhost:3000/<b>view</b>/work" },
      { header: "Read", text: readText, bar: "localhost:3000/<b>read</b>/work/6579..7yu8" },
      { header: "Delete", text: deleteText, bar: "localhost:3000/<b>delete</b>/work/6579..7yu8"},
    ]
  });
});

app.get("/categories", (req, res) => {
  const query = { categorie: { $exists: true } };

  List.find(query)
    .then((items) => {
      const categories = [];
      items.forEach((item) => {
        if (!categories.includes(item.categorie)) {
          categories.push(item.categorie);
        }
      });

      res.render("viewCategories.ejs", { categories: categories });
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

app.get("/view/:categorie", (req, res) => {
  const hidden = ["about", "contact"];
  if (hidden.includes(req.params.categorie)) {
    res.redirect("/" + req.params.categorie);
  }

  const categorie = _.capitalize(req.params.categorie);

  List.find({ categorie: categorie })
    .then((items) => {
      res.render("categorie.ejs", {
        categorie: items[0].categorie,
        posts: items[0].posts,
      });
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

app.get("/read/:categorie/:id", (req, res) => {
  const id = req.params.id;
  const categorie = req.params.categorie;

  const filter = { categorie: categorie };
  const selection = { posts: { $elemMatch: { _id: id } } };

  List.findOne(filter, selection)
    .then((item) => {
      res.render("post.ejs", {
        title: item.posts[0].title,
        text: item.posts[0].text,
      });
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

app.get("/delete/:categorie/:id", (req, res) => {
  const id = req.params.id;
  const categorie = req.params.categorie;

  const filter = { categorie: categorie };
  const update = { $pull: { posts: { _id: id } } };

  List.updateOne(filter, update)
    .then(() => {
      res.redirect("/view/" + categorie);
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

app.get("/deleteAll/:categorie", (req, res) => {
  const categorie = req.params.categorie;

  const filter = { categorie: categorie };

  List.deleteMany(filter)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

app.post("/compose/:categorie", (req, res) => {
  const categorie = req.params.categorie;
  const data = {
    title: req.body.blogTitle,
    text: req.body.blogText,
  };

  const filter = { categorie: categorie };
  const update = { $push: { posts: data } };

  List.updateOne(filter, update)
    .then(() => {
      res.redirect("/view/" + categorie);
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

app.get("*", (req, res) => {
  res.render("error.ejs", {
    pageNotFound: "/images/error404.JPG",
  });
});


connectDB()
.then(()=>{
  app.listen(3000, function () {
    console.log(`Server started on port ${PORT}`);
  });
});



