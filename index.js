var express = require("express");
var cors = require("cors");
var app = express();

require("dotenv").config();

const { Client } = require("pg");

const config = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false,
  },
};

app.use(cors());

app.get("/houses/today", async function (req, res) {
  try {
    const client = new Client(config);
    client.connect();
    const getElementQuery = `SELECT * FROM public.viviendas limit 20`;
    const { rows } = await client.query(getElementQuery);
    res.send(rows);
  } catch {
    res.send([]);
  }
});

app.listen(3001, function () {
  console.log("CORS-enabled web server listening on port 3001");
});
