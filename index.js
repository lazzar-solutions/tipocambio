const express = require("express");
const bodyParser = require("body-parser");
const apiRouter = require("./routes/tipoCambio");
const cors = require("cors");

const app = express();

app.use(cors());

// Puerto por defecto
const port = process.env.PORT || 3000;

// MIDDLEWERES
// parse application/json
// app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true }));

// Rutas que comienzen con '/user' serán enviadas a apiRouter
app.use("/tipocambio", apiRouter);
// app.use(app.router);
// apiRouter.initialize(app);

// Comenzar servidor express
app.listen(port, () => {
  console.log("Servidor iniciando en el puerto", port);
});
