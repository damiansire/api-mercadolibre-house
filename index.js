const fs = require("fs");
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");

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

//Todo dividir las rutas y usar mids
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

//Todo add async
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

app.get("/news", async function (req, res) {
  try {
    const client = new Client(config);
    client.connect();
    const getElementQuery = `SELECT * FROM public.viviendas limit 20`;
    const { rows } = await client.query(getElementQuery);
    debugger;
    let response = rows.map((row) => convertToHousesJson(row));
    res.send(response);
  } catch {
    res.send([]);
  }
});

app.listen(3001, function () {
  console.log("CORS-enabled web server listening on port 3001");
});

function convertToHousesJson(apartaments) {
  const getCustomAttributesKeys = (apartamentDao) => {
    const normalAttribute = [
      "id",
      "title",
      "link",
      "calle",
      "barrio",
      "ciudad",
      "gastoscomunes",
      "pricecurrency",
      "price",
    ];

    return Object.keys(apartamentDao).filter(
      (attribute) => !normalAttribute.includes(attribute)
    );
  };

  const getCustomAttributes = (respuestaBaseDeDatos) => {
    const customAttributesKeys = getCustomAttributesKeys(respuestaBaseDeDatos);
    let customAttributesObj = {};
    for (const key of customAttributesKeys) {
      customAttributesObj[key] = respuestaBaseDeDatos[key];
    }
    return customAttributesObj;
  };

  debugger;
  return {
    id: apartaments.id,
    principal: {
      title: apartaments.title,
      link: apartaments.link,
    },
    location: {
      calle: apartaments.calle,
      barrio: apartaments.barrio,
      ciudad: apartaments.ciudad,
    },
    price: {
      gastoscomunes: apartaments.gastoscomunes,
      pricecurrency: apartaments.pricecurrency,
      price: apartaments.price,
    },
    attributes: getCustomAttributes(apartaments),
  };
}

/*
const respuestaBaseDeDatos = {
  id: "MLU604128144",
  title: "Alquiler Apartamento 1 Dormitorio Cordón Sur Montevideo E",
  link: "https://apartamento.mercadolibre.com.uy/MLU-604128144-alquiler-apartamento-1-dormitorio-cordon-sur-montevideo-e-_JM",
  calle: "Cassinoni 1200",
  barrio: "Parque Rodó",
  ciudad: "Montevideo",
  gastoscomunes: "1300 UYU",
  pricecurrency: "$",
  price: "16.000",
  superficietotal: "43 m²",
  superficie: "43 m²",
  baños: "1",
  dormitorios: "1",
  disposicion: "Contrafrente",
  orientacion: "Oeste",
  numerodepisodellaunidad: "1",
  admitemascotas: "Sí",
};
*/
