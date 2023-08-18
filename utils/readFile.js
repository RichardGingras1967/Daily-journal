const fs = require("fs");

const composeText = fs.readFileSync("public/texts/compose.txt", "utf-8");
const viewText = fs.readFileSync("public/texts/view.txt", "utf-8");
const readText = fs.readFileSync("public/texts/read.txt", "utf-8");
const deleteText = fs.readFileSync("public/texts/delete.txt", "utf-8");
const aboutContent = fs.readFileSync("public/texts/about.txt", "utf-8");
const contactContent = fs.readFileSync("public/texts/contact.txt", "utf-8");

module.exports = { composeText, viewText, readText, deleteText, aboutContent, contactContent };