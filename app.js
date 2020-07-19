const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios').default;
const bodyParser = require("body-parser");

// init'd express and database
const app = express();
const db = new sqlite3.Database(
	__dirname + "/db/database.db",
	sqlite3.OPEN_READWRITE,
	(error) => {
		if (error) {
				console.log("there's an error"); throw error;
		} else {
			console.log("welcome to database");
		}
	}
);

// config express
let port = 3000 | process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(express.static("public"));
app.set('view engine', 'ejs');

// endpoints
app.get("/", (request, response) => {
	console.log("welcome to home");

	axios.get(`http://localhost:${port}/api/home`
	).then((res) => {
		// console.log(response.data.rows);
		response.render("index.ejs", {agenda: res.data.rows});
	}).catch(error => console.log(error));
});

// api endpoints
app.get("/api/home", (request, response) => {
	let sql = "SELECT * FROM agenda;";

	db.all(sql, (error, rows) => {
		if (error) {
			console.log("there's an error.");
			console.log(error);
		} else {
			if (rows) {
				console.log("here's your data.");
				response.json({rows})
			} else {
				console.log("uh oh. no data.")
				response.json({"message": "no data"});
			}
		}	
	});
});

app.post("/add", (request, response) => {
	db.serialize(() => {
		const date = new Date(request.body.date);
		console.log(request.body.date, request.body.time);
		console.log(request.body);

		let entry = {
			name: request.body.name,
			description: request.body.description,
			date: request.body.date,
			time: request.body.time,
		};

		let sql = `INSERT INTO agenda (name, description, date, time, status) VALUES ("${entry.name}", "${entry.description}", "${entry.date}", "${entry.time}", 0);`;
		
		db.run(sql, (error) => {
			if (error) {
				console.log("there's an error");
				console.log(error);
			} else {
				console.log("your note is finally added");
				response.redirect("/");
			}
		});
	});

});

// start the server
app.listen(port, () => {
	console.log("listening into http://localhost:" + port);
});