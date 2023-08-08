const express = require("express");
const mysql = require('mysql');

const app = express();

app.use(express.static("public"));
app.use(express.json());

const con = mysql.createConnection({
	host:"localhost",
	user:"root",
	password:"",
	database:"shorturls"
});
con.connect(function(error){
	console.log(error);
	if(error){
		console.log("Database connection failed");
	}
})

app.get("/",function(request,response){
	response.sendFile(__dirname + "/public/index.html");
});

app.post("/api/create-short-url",function(request,response){
	let uniqueID = Math.random().toString(36).replace(/[^a-z]+/g,'').substr(1,10);
	let sql = `INSERT INTO linkss(longurl,shorturlid) VALUES('${request.body.longurl}','${uniqueID}')`;
	con.query(sql,function(error,result){
		if(error){
			response.status(500).json({
				status:"notok",
				message:"Something went wrong"
			});
		} else {
			response.status(200).json({
				status:"ok",
				shorturlid:uniqueID
			});
		}		
	})
});

app.get("/api/get-all-short-urls", function(req, res) {
	let sql = `SELECT * FROM linkss`;
	con.query(sql, function(e, result){
		if(e){
			res.status(500).json({
				status:"notok",
				message:"Something went wrong"
			});
		}else {
			res.status(200).json(result);
		}
	})
});


app.get("/:shorturlid", function(req, res){
	let shorturlid = req.params.shorturlid;
	let sql = `SELECT * FROM linkss WHERE shorturlid='${shorturlid}' limit 1`;
	con.query(sql, function(error, result){
		if(error){
			res.status(500).json({
				status:"notok",
				message:"Something went wrong"
			});
		} else {
			sql = `UPDATE linkss SET count=${result[0].count + 1} WHERE id='${result[0].id}' LIMIT 1`;
			con.query(sql, function(error, result2){
				if(error){
					res.status(500).json({
						status:"notok",
						message:"Something went wrong"
					});
				} else {
					res.redirect(result[0].longurl);
				}
			})
		}
	})
})

app.listen(5000);
