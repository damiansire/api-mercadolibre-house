const fs = require("fs");
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
require("dotenv").config();
const { Pool } = require("pg");

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

const pool = new Pool(config);

app.use(cors());

app.get("/houses/filters", function (req, res) {
  const filters = [
    { name: "superficietotal", type: "Number" },
    { name: "superficie", type: "Number" },
    { name: "baños", type: "Number" },
    { name: "dormitorios", type: "Number" },
    { name: "ambientes", type: "Number" },
    { name: "tipo", type: "Number" },
    { name: "calle", type: "Number" },
    { name: "barrio", type: "Number" },
    { name: "ciudad", type: "Number" },
    { name: "gastoscomunes", type: "Number" },
    { name: "disposicion", type: "Number" },
    { name: "antiguedad", type: "Number" },
    { name: "orientacion", type: "Number" },
    { name: "cocheras", type: "Number" },
    { name: "numerodepisodellaunidad", type: "Number" },
    { name: "admitemascotas", type: "Number" },
    { name: "apartamentosporpiso", type: "Number" },
    { name: "cantidaddepisos", type: "Number" },
    { name: "bodegas", type: "Number" },
  ];

  res.send(filters);
});

//Todo dividir las rutas y usar mids
app.get("/houses/today", async function (req, res) {
  try {
    const getElementQuery = `SELECT * FROM public.viviendas limit 20`;
    const { rows } = await pool.query(getElementQuery);
    res.send(rows);
  } catch {
    res.send([]);
  }
});

//Todo add async
app.get("/houses/img/:id", async function (req, res) {
  try {
    const viviendaId = req.params.id;
    //Ojo con la inyeccion sql
    const getImagesQuery = `select * from public.imagenes i where i.viviendaid = '${viviendaId}'`;
    const { rows } = await pool.query(getImagesQuery);
    res.send(rows);
  } catch {
    res.send([]);
  }
});

//No esta adaptado para mas de un usuario todavia
app.get("/houses/news", async function (req, res) {
  try {
    const getElementQuery = `SELECT * FROM public.viviendas AS v where v.id NOT IN (select viviendaid from estado) limit 20`;
    const { rows } = await pool.query(getElementQuery);
    let response = rows.map((row) => convertToHousesJson(row));
    res.send(response);
  } catch {
    res.send([]);
  }
});

app.get("/like/:apartamentId", async function (req, res) {
  try {
    const viviendaId = req.params.apartamentId;
    await saveHouseStatus(viviendaId, 1);
    res.send(true);
  } catch {
    res.send(false);
  } finally {
  }
});

app.get("/dislike/:apartamentId", async function (req, res) {
  try {
    const viviendaId = req.params.apartamentId;
    await saveHouseStatus(viviendaId, 0);
    res.send(true);
  } catch {
    res.send(false);
  } finally {
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
      if (respuestaBaseDeDatos[key] != null) {
        customAttributesObj[key] = respuestaBaseDeDatos[key];
      }
    }
    return customAttributesObj;
  };

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
    expenses: {
      gastoscomunes: apartaments.gastoscomunes,
      currency: apartaments.pricecurrency,
      price: apartaments.price,
    },
    attributes: getCustomAttributes(apartaments),
  };
}

// 0 = dislike, 1 = like
async function saveHouseStatus(houseId, state) {
  try {
    const values = [houseId, state, "damiansire"];
    const query = `INSERT INTO public.estado (viviendaid, estado, userid) VALUES($1, $2, $3) RETURNING *;`;
    const res = await pool.query(query, values);
    console.log("Ha funcionado correctamente");
  } catch (err) {
    console.error(`${err.name} : ${err.message}`);
    throw new Error(`Problemas con el apartamento: ${apartamentData.link}`);
  }
}
