const puppeteer = require("puppeteer");

function diasEnUnMes(mes, año) {
  return new Date(año, mes, 0).getDate();
}

// Funcion para modificar el formato de la fecha, de acuerdo al cambo FEC_CMB
function setFecha(fecha) {
  const nuevaFecha = fecha.split("/");
  const anio = nuevaFecha[2].toString();
  const mes = nuevaFecha[1].toString();
  const dia = nuevaFecha[0].toString();
  const fechaConcatenada = `${anio}-${mes}-${dia}`;

  return fechaConcatenada;
}

function getLast5Days(fecha) {
  // Convertir a formato dia/mes/año
  const dayConvertido = fecha.slice(0, -6);
  const mesConvertido = fecha.slice(2, -4);
  const anioConvertido = fecha.slice(-4);
  fecha = `${dayConvertido}/${mesConvertido}/${anioConvertido}`;

  const fechas = [];

  for (let i = 0; i < 5; i++) {
    // Obtener dia, mes, año y la funcion con los dias por mes
    let mes = fecha.slice(3, -5);
    let anio = fecha.slice(-4);
    let day = Number(fecha.slice(0, -8));

    // Si el dia es 01, entonces se mostrará el ultimo dia del mes anterior,
    // en el caso de enero se mostrará diciembre del año anterior
    if (day === 01) {
      if (mes === "01") {
        mes = "12";
        anio = Number(anio) - 1;
        day = diasEnUnMes(mes, anio);
      } else {
        mes = (Number(mes) - 1).toString();
        day = diasEnUnMes(mes, anio);
      }
      // Si no es 01, solo restar un dia
    } else {
      day = day - 1;
    }

    const dayFormat = (day.toString()).padStart(2, "0");
    const mesFormat = (mes.toString()).padStart(2, "0");
    const anioFormat = anio.toString();
    const fechaActualizada = `${dayFormat}/${mesFormat}/${anioFormat}`;
    fechas.push(fechaActualizada);
    fecha = fechaActualizada;
  }
  return fechas;
}

// Funcion que extrae el tipo de cambio de la SBS, de acuerdo al arreglo de fechas enviado por parametro
async function getTipoCambio(fecha) {
  try {
    const tipoCambio = [];
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    }); // abrir el navegador

    const page = await browser.newPage(); // crear una nueva pagina
    await page.setDefaultTimeout(0);
    await page.goto("https://www.sbs.gob.pe/app/pp/SISTIP_PORTAL/Paginas/Publicacion/TipoCambioPromedio.aspx");

    for (let i = 0; i < fecha.length; i++) {
      await page.type("#ctl00_cphContent_rdpDate_dateInput", `${fecha[i]}`);
      await page.click("#ctl00_cphContent_btnConsultar");
      await page.waitForFunction(`document.querySelector("#ctl00_cphContent_lblFecha").innerText.includes("${fecha[i]}")`);

      const elementos = await page.evaluate(() => {
        const pruebas = {};
        const cambios = document.querySelectorAll("#ctl00_cphContent_rgTipoCambio_ctl00__0 td");
        const fecha = document.querySelector("#ctl00_cphContent_lblFecha").innerText.split(" ");
        pruebas.fecha = fecha[fecha.length - 1].toString();

        for (let i = 0; i < cambios.length; i++) {
          pruebas.moneda = cambios[0].innerText;
          pruebas.compra = cambios[1].innerText;
          pruebas.venta = cambios[2].innerText;
        }
        return pruebas;
      });

      tipoCambio.push(elementos);
    }

    await browser.close();
    let cambioActual;
    for (let i = 0; i < tipoCambio.length; i++) {
      if (tipoCambio[i].moneda === undefined) {
        cambioActual = tipoCambio[i + 1];
      } else {
        cambioActual = tipoCambio[i];
        break;
      }
    }
    return cambioActual;
  } catch (e) {
    console.log("No existe tipo de cambio para esa fecha");
  }
}

module.exports = {
  getLast5Days,
  getTipoCambio,
  setFecha,
};
