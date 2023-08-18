const { app, mongoose, PORT} = require("./config/sessions");

const connectDB = async () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
  });
};

const { getLogin, postLogin, getRegister, postRegister, getLogOut } = require("./routes/authentication");
const { getAbout, getContact, getHowto, getError } = require("./routes/info");
const { getCategories, getViewCategories, getReadCategories, getHome } = require("./routes/public")
const { getComposeCategorie, getDeleteCategoriebyId, postComposeCategorie} = require("./routes/private");

app.get("/", getHome);
app.get("/login", getLogin);
app.get("/register", getRegister); 
app.get("/logout", getLogOut);
app.get("/about", getAbout);
app.get("/contact", getContact);
app.get("/howto", getHowto);
app.get("/categories", getCategories);
app.get("/view/:categorie", getViewCategories); 
app.get("/read/:categorie/:id", getReadCategories); 
app.get("/compose/:categorie", getComposeCategorie);
app.get("/delete/:categorie/:id", getDeleteCategoriebyId); 

app.post("/login", postLogin);
app.post("/register", postRegister);
app.post("/compose/:categorie", postComposeCategorie); 

app.get("*", getError);

connectDB().then(() => {
  app.listen(3000, function () {
    console.log(`Server started on port ${PORT}`);
  });
});
