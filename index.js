//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
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
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
     // mongoUrl: "mongodb://127.0.0.1:27017/ComposeDB",
    }),
  })
);

const connectDB = async () => {
    mongoose.connect(process.env.MONGO_URI, {
    //mongoose.connect("mongodb://127.0.0.1:27017/ComposeDB", {
    useNewUrlParser: true,
  });
};

const postSchema = new mongoose.Schema({
  title: String,
  text: String,
  author: String,
});

const listSchema = new mongoose.Schema({
  categorie: String,
  posts: [postSchema],
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const Post = mongoose.model("Post", postSchema);
const List = mongoose.model("List", listSchema);
const Client = new mongoose.model("Client", userSchema);

const composeText = fs.readFileSync("public/texts/compose.txt", "utf-8");
const viewText = fs.readFileSync("public/texts/view.txt", "utf-8");
const readText = fs.readFileSync("public/texts/read.txt", "utf-8");
const deleteText = fs.readFileSync("public/texts/delete.txt", "utf-8");
const aboutContent = fs.readFileSync("public/texts/about.txt", "utf-8");
const contactContent = fs.readFileSync("public/texts/contact.txt", "utf-8");

app.get("/compose/:categorie", function (req, res) {
  if (req.session.user) {
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
  } else {
    res.redirect("/login");
  }
});

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/logout", (req, res) => {
  req.session.destroy((logged) => {
    console.log("user logged out");
  });
  res.redirect("/");
});

app.post("/register", (req, res) => {
  try{
    const email = req.body.username;

  bcrypt.hash(req.body.password, saltRounds).then((hash) => {
    const newUser = new Client({
      email: email,
      password: hash,
    });
    newUser
      .save()
      .then((user, err) => {
        req.session.user = user;
        res.redirect("/howto");
      })
      
  })
  .catch((err) => {
    console.log(err);
    res.redirect("/login");
  });
  }catch(err){
    console.log(err);
  }
  
});

app.post("/login", (req, res) => {
  const email = req.body.username;

  Client.findOne({ email: email }).then((user) => {
    if (user != null) {
      //user exist
      bcrypt.compare(req.body.password, user.password).then((granted) => {
        if (granted) {
          req.session.user = user;
          res.redirect("/howto");
        } else {
          res.redirect("/login");
        }
      });
    } else {
      res.redirect("/register");
    }
  });
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
      {
        header: "Compose",
        text: composeText,
        bar: "..app/<b>compose</b>/<em>category</em>",
      },
      {
        header: "View",
        text: viewText,
        bar: "..app/<b>view</b>/<em>category</em>",
      },
      {
        header: "Read",
        text: readText,
        bar: "..app/<b>read</b>/<em>category</em>/<em>post</em>",
      },
      {
        header: "Delete",
        text: deleteText,
        bar: "..app/<b>delete</b>/<em>category</em>/<em>post</em>",
      },
    ],
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

  const search = { categorie: categorie };
  const filter = { posts: { $elemMatch: { _id: id } } };
  const update = { $pull: { posts: { _id: id } } };

  List.findOne(search, filter)
    .then((found) => {
      //only the author of the post can delete it
      if (found.posts[0].author === req.session.user._id) {
        List.updateOne(filter, update)
          .then(() => {
            res.redirect("/view/" + categorie);
          })
          .catch((err) => {
            res.redirect("/error");
          });
      } else {
        res.send("Unautorise action, you can delete only yours post..");
      }
    })
    .catch((err) => {
      res.redirect("/error");
    });
});

/*app.get("/deleteAll/:categorie", (req, res) => {
  const categorie = req.params.categorie;

  const filter = { categorie: categorie };

  List.deleteMany(filter)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.redirect("/error");
    });
});*/

app.post("/compose/:categorie", (req, res) => {
  const categorie = req.params.categorie;
  const data = {
    title: req.body.blogTitle,
    text: req.body.blogText,
    author: req.session.user._id.toString(),
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

connectDB().then(() => {
  app.listen(3000, function () {
    console.log(`Server started on port ${PORT}`);
  });
});
