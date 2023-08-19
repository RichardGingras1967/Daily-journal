const { composeText, viewText, readText,
        deleteText, aboutContent, contactContent } = require("../utils/readFile");

const getAbout = function (req, res) {
  res.render("about.ejs", { aboutContent: aboutContent });
};

const getContact = function (req, res) {
  res.render("contact.ejs", { contactContent: contactContent });
};

const getHowto = function (req, res) {
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
};

const getError = function (req, res) {
  res.render("error.ejs", {
    pageNotFound: "/images/error404.JPG",
  });
};

module.exports = { getAbout, getContact, getHowto, getError };
