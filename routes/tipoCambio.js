const router = require("express").Router();
const {
  getLast5Days,
  getTipoCambio,
  setFecha,
} = require("../controllers/tipoCambioController");

// Obtener tipo de cambio
router.get("/dolares/:id", async (req, res) => {
  const fecha = req.params.id.toString();
  const arregloFechas = getLast5Days(fecha);
  const formatoYYMMDD = setFecha(arregloFechas[0]);
  const convertToDate = new Date(formatoYYMMDD);
  const diaSemana = convertToDate.getDay(); // Obtener dia de semana
  let fechaActual = []; // 5=sabado

  // Buscar si es sabado, domingo o dia de la semana
  if (diaSemana === 5) {
    fechaActual.push(arregloFechas[1]);
  } else if (diaSemana === 6) {
    fechaActual.push(arregloFechas[2]);
  } else {
    fechaActual = arregloFechas;
  }

  if (!fechaActual) {
    return res.status(400).json({
      message: "Fecha no encontrada",
    });
  }

  const tipoCambio = await getTipoCambio(fechaActual);
  if (!tipoCambio) {
    return res.status(400).json({
      error: "Tipo de cambio no encontrado",
    });
  }

  // res.json(tipoCambio);
  res.json({
    FEC_CMB: setFecha(tipoCambio.fecha),
    TIP_CMB: Number(tipoCambio.venta),
    TIP_CMBC: Number(tipoCambio.compra),
  });
});

module.exports = router;
