const { postSchema, listSchema, userSchema, Post, List, Client } = require("../models/schemas");
const _ = require("lodash");


const getCategories = function (req, res) {

    const query = { categorie: { $exists: true } };
    List.find(query).then((items) => {
        
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
  }
  
  
  const getViewCategories = function (req, res) {

    const hidden = ["about", "contact"];
    if (hidden.includes(req.params.categorie)) {
      res.redirect("/" + req.params.categorie);
    }
  
    const categorie = _.capitalize(req.params.categorie);
    List.find({ categorie: categorie }).then((items) => {
        
      res.render("categorie.ejs", {
          categorie: items[0].categorie,
          posts: items[0].posts,
      });

    })
    .catch((err) => {
      res.redirect("/error");
    });
  }
  

  const getReadCategories = function (req, res) {

    const id = req.params.id;
    const categorie = req.params.categorie;
  
    const filter = { categorie: categorie };
    const selection = { posts: { $elemMatch: { _id: id } } };
  
    List.findOne(filter, selection).then((item) => {

        res.render("post.ejs", {
          title: item.posts[0].title,
          text: item.posts[0].text,
        });

      })
      .catch((err) => {
        res.redirect("/error");
      });
  }


  const getHome = function (req, res) {
    res.render("home.ejs");
  }


  module.exports = { getCategories, getViewCategories, getReadCategories, getHome };