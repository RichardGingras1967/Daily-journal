const { mongoose } = require("../config/sessions");

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


  module.exports = { postSchema, listSchema, userSchema, Post, List, Client };