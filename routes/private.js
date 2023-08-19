const { postSchema, listSchema, userSchema, Post, List, Client } = require("../models/schemas");
const _ = require("lodash");

const getComposeCategorie = function (req, res) {
  
  if (req.session.userId) {
    const categorie = _.capitalize(req.params.categorie);

    List.find({ categorie: categorie })
    .then((items) => {
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
};

const getDeleteCategoriebyId = function (req, res) {

  const id = req.params.id;
  const categorie = req.params.categorie;

  const search = { categorie: categorie };
  const filter = { posts: { $elemMatch: { _id: id } } };
  const update = { $pull: { posts: { _id: id } } };

  List.findOne(search, filter)
    .then((found) => {
      //only the author of the post can delete it
      if (found.posts[0].author === req.session.userId) {
        List.updateOne(filter, update)
          .then(() => {
            res.redirect("/view/" + categorie);
          })
          .catch((err) => {
            res.redirect("/error");
          });
      } else {
        res.send("Unautorise action, you can't delete others post..");
      }
    })
    .catch((err) => {
      res.redirect("/error");
    });
};

const postComposeCategorie = function (req, res) {

  const categorie = req.params.categorie;
  
  const data = {
    title: req.body.blogTitle,
    text: req.body.blogText,
    author: req.session.userId,
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
};

module.exports = { getComposeCategorie, getDeleteCategoriebyId, postComposeCategorie };
