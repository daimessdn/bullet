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

/*
app.post("/add", (request, response) => {
	const config = {
	  method: 'post',
	  url: `http://localhost:${port}/api/home/add`,
	  headers: { 
	    'Content-Type': 'application/x-www-form-urlencoded'
	  },
	  data : JSON.stringify(request.body)
	};

	axios(config).then((res) => {
		res.data.data = data;
		console.log(res.data);
		response.redirect("/");
	}).catch(error => console.log(error));
	response.redirect("/");
});
*/

// api endpoints
app.get("/api/home/", (request, response) => {
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

app.post("/api/home/add", (request, response) => {
	db.serialize(() => {
		let entry = {
			id: randomId(15),
			name: request.body.name,
			date: request.body.date,
			time: request.body.time,
			status: request.body.status
		};

		let sql = `INSERT INTO agenda (id, name, date, time, status) VALUES ("${entry.id}", "${entry.name}", "${entry.date}", "${entry.time}", ${entry.status});`;
		
		db.run(sql, (error) => {
			if (error) {
				console.log("there's an error");
				console.log(error);
			} else {
				console.log("your note is finally added");
				response.json({
					"status": 200,
					"message": "your note is finally added",
					"data": entry
				});
			}
		});
	});
});

// start the server
app.listen(port, () => {
	console.log("listening into http://localhost:" + port);
});

// other functions
const randomId = (length) => {
   let result           = '';
   const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   const charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}