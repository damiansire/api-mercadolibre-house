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

    const getImageQuery = ` select * from public.imagenes as i where i.viviendaid = 'https://apartamento.mercadolibre.com.uy/MLU-604088353-alquiler-apartamento-punta-carretas-reciclado-amplio-1-dorm-_JM'`;

    res.send(rows);
  } catch {
    res.send([]);
  }
});

app.get("/houses/img/:id", async function (req, res) {
  try {
    const client = new Client(config);
    client.connect();
    const viviendaId = req.params.id;
    //Ojo con la inyeccion sql
    const getImagesQuery = `select * from public.imagenes i where i.viviendaid = '${viviendaId}'`;
    const { rows } = await client.query(getImagesQuery);
    res.send(rows);
  } catch {
    res.send([]);
  }
});

app.listen(3001, function () {
  console.log("CORS-enabled web server listening on port 3001");
});
