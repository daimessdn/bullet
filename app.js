const express = require("express");
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');

// routing
app.get("/", (request, response) => {
	response.render("index.ejs");
});

// start the server
app.listen(3000, () => {
	console.log("listening into localhost:3000");
});