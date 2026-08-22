"use strict";


// Funciones generales del sitio

document.addEventListener("DOMContentLoaded", function () {
    actualizarAnnoFooter();
    inicializarControlIngreso();
    inicializarCalculoEdad();
    inicializarFormularioContacto();
    inicializarCalculoRuta();
    cargarServicios();
    cargarGaleria();
    cargarServiciosDestacados();
    inicializarConversorMedidas();
});

function actualizarAnnoFooter() {
    const elementosAnno = document.querySelectorAll(".anio-actual");
    const annoActual = new Date().getFullYear();

    elementosAnno.forEach(function (elemento) {
        elemento.textContent = annoActual;
    });
}


// Formulario de contacto

function inicializarControlIngreso() {
    const controlIngreso = document.querySelector("#ingreso");
    const salidaIngreso = document.querySelector("#valor-ingreso");

    if (controlIngreso === null || salidaIngreso === null) {
        return;
    }

    actualizarValorIngreso(controlIngreso, salidaIngreso);

    controlIngreso.addEventListener("input", function () {
        actualizarValorIngreso(controlIngreso, salidaIngreso);
    });
}

function actualizarValorIngreso(controlIngreso, salidaIngreso) {
    const ingreso = Number(controlIngreso.value);

    const formatoColones = new Intl.NumberFormat("es-CR", {
        style: "currency",
        currency: "CRC",
        maximumFractionDigits: 0
    });

    salidaIngreso.textContent = formatoColones.format(ingreso);
}


//Calculo edad

function inicializarCalculoEdad() {
    const campoFecha = document.querySelector("#fecha-nacimiento");
    const campoEdad = document.querySelector("#edad");
    const resultadoEdad = document.querySelector("#resultado-edad");

    if (
        campoFecha === null ||
        campoEdad === null ||
        resultadoEdad === null
    ) {
        return;
    }

    campoFecha.addEventListener("change", function () {
        procesarFechaNacimiento(
            campoFecha,
            campoEdad,
            resultadoEdad
        );
    });
}

function procesarFechaNacimiento(
    campoFecha,
    campoEdad,
    resultadoEdad
) {
    if (campoFecha.value === "") {
        campoEdad.value = "";
        resultadoEdad.textContent = "";
        campoFecha.setCustomValidity("");
        return;
    }

    const edad = calcularEdad(campoFecha.value);

    if (edad < 0) {
        campoEdad.value = "";
        resultadoEdad.textContent =
            "La fecha de nacimiento no puede estar en el futuro.";

        resultadoEdad.classList.remove("text-success");
        resultadoEdad.classList.add("text-danger");

        campoFecha.setCustomValidity(
            "Seleccione una fecha de nacimiento válida."
        );

        return;
    }

    campoEdad.value = edad;
    resultadoEdad.textContent = "Edad calculada: " + edad + " años.";

    resultadoEdad.classList.remove("text-danger");
    resultadoEdad.classList.add("text-success");

    campoFecha.setCustomValidity("");
}

function calcularEdad(fechaNacimiento) {
    const partesFecha = fechaNacimiento.split("-");

    const annoNacimiento = Number(partesFecha[0]);
    const mesNacimiento = Number(partesFecha[1]);
    const diaNacimiento = Number(partesFecha[2]);

    const fechaActual = new Date();

    const annoActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1;
    const diaActual = fechaActual.getDate();

    let edad = annoActual - annoNacimiento;

    const todaviaNoCumplio =
        mesActual < mesNacimiento ||
        (
            mesActual === mesNacimiento &&
            diaActual < diaNacimiento
        );

    if (todaviaNoCumplio) {
        edad--;
    }

    return edad;
}

function inicializarFormularioContacto() {
    const formulario = document.querySelector("#formulario-contacto");
    const estadoFormulario = document.querySelector("#estado-formulario");

    if (formulario === null || estadoFormulario === null) {
        return;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        procesarFormulario(formulario, estadoFormulario);
    });

    formulario.addEventListener("reset", function () {
        reiniciarFormulario(formulario, estadoFormulario);
    });
}

function procesarFormulario(formulario, estadoFormulario) {
    formulario.classList.add("was-validated");

    if (!formulario.checkValidity()) {
        mostrarEstadoFormulario(
            estadoFormulario,
            "Revise los campos obligatorios antes de enviar la solicitud.",
            "danger"
        );

        const primerCampoInvalido =
            formulario.querySelector(":invalid");

        if (primerCampoInvalido !== null) {
            primerCampoInvalido.focus();
        }

        return;
    }

    mostrarEstadoFormulario(
        estadoFormulario,
        "Datos validados. Se abrirá su aplicación de correo para completar el envío.",
        "success"
    );

    enviarFormularioPorCorreo(formulario);
}

function enviarFormularioPorCorreo(formulario) {
    const datosFormulario = new FormData(formulario);

    const nombre =
        datosFormulario.get("nombreCompleto");

    const correoCliente =
        datosFormulario.get("correoElectronico");

    const fechaNacimiento =
        datosFormulario.get("fechaNacimiento");

    const edad =
        datosFormulario.get("edad");

    const genero =
        datosFormulario.get("genero");

    const gradosAcademicos =
        datosFormulario.getAll("gradoAcademico");

    const mensaje =
        datosFormulario.get("mensaje");

    const salidaIngreso =
        document.querySelector("#valor-ingreso");

    let ingreso = datosFormulario.get("ingreso");

    if (salidaIngreso !== null) {
        ingreso = salidaIngreso.textContent.trim();
    }

    const gradosSeleccionados =
        gradosAcademicos.length > 0
            ? gradosAcademicos.join(", ")
            : "No indicado";

    const asunto =
        "Solicitud de cotización - " + nombre;

    const cuerpo =
        "SOLICITUD DE COTIZACIÓN\n\n" +
        "Nombre completo: " + nombre + "\n" +
        "Correo del cliente: " + correoCliente + "\n" +
        "Fecha de nacimiento: " + fechaNacimiento + "\n" +
        "Edad: " + edad + " años\n" +
        "Ingreso aproximado: " + ingreso + "\n" +
        "Género: " + genero + "\n" +
        "Grado académico: " + gradosSeleccionados + "\n\n" +
        "Descripción de la solicitud:\n" +
        mensaje;

    const correoTaller =
        "fcastillo@precisioncastillo.com";

    const enlaceCorreo =
        "mailto:" + correoTaller +
        "?subject=" + encodeURIComponent(asunto) +
        "&body=" + encodeURIComponent(cuerpo);

    window.location.href = enlaceCorreo;
}


function mostrarEstadoFormulario(
    estadoFormulario,
    mensaje,
    tipo
) {
    estadoFormulario.textContent = mensaje;

    estadoFormulario.classList.remove(
        "d-none",
        "alert-success",
        "alert-danger"
    );

    estadoFormulario.classList.add("alert-" + tipo);
}

function reiniciarFormulario(formulario, estadoFormulario) {
    window.setTimeout(function () {
        formulario.classList.remove("was-validated");

        estadoFormulario.textContent = "";
        estadoFormulario.classList.add("d-none");
        estadoFormulario.classList.remove(
            "alert-success",
            "alert-danger"
        );

        const campoEdad = document.querySelector("#edad");
        const resultadoEdad =
            document.querySelector("#resultado-edad");

        if (campoEdad !== null) {
            campoEdad.value = "";
        }

        if (resultadoEdad !== null) {
            resultadoEdad.textContent = "";
            resultadoEdad.classList.remove(
                "text-success",
                "text-danger"
            );
        }

        const controlIngreso = document.querySelector("#ingreso");
        const salidaIngreso =
            document.querySelector("#valor-ingreso");

        if (
            controlIngreso !== null &&
            salidaIngreso !== null
        ) {
            actualizarValorIngreso(
                controlIngreso,
                salidaIngreso
            );
        }
    }, 0);
}


// Página de ubicación

function inicializarCalculoRuta() {
    const botonRuta = document.querySelector("#boton-ruta");
    const enlaceRuta = document.querySelector("#enlace-ruta");
    const estadoUbicacion =
        document.querySelector("#estado-ubicacion");

    if (
        botonRuta === null ||
        enlaceRuta === null ||
        estadoUbicacion === null
    ) {
        return;
    }

    botonRuta.addEventListener("click", function () {
        solicitarUbicacion(
            botonRuta,
            enlaceRuta,
            estadoUbicacion
        );
    });
}

function solicitarUbicacion(
    botonRuta,
    enlaceRuta,
    estadoUbicacion
) {
    if (!navigator.geolocation) {
        mostrarEstadoUbicacion(
            estadoUbicacion,
            "Este navegador no permite obtener su ubicación.",
            "danger"
        );

        return;
    }

    botonRuta.disabled = true;

    mostrarEstadoUbicacion(
        estadoUbicacion,
        "Solicitando permiso para obtener su ubicación...",
        "info"
    );

    navigator.geolocation.getCurrentPosition(
        function (posicion) {
            prepararRuta(
                posicion,
                botonRuta,
                enlaceRuta,
                estadoUbicacion
            );
        },
        function (error) {
            procesarErrorUbicacion(
                error,
                botonRuta,
                estadoUbicacion
            );
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function prepararRuta(
    posicion,
    botonRuta,
    enlaceRuta,
    estadoUbicacion
) {
    const latitudUsuario = posicion.coords.latitude;
    const longitudUsuario = posicion.coords.longitude;

    const destinoTaller =
        "9.9694992,-84.2243598";

    const origen =
        latitudUsuario + "," + longitudUsuario;

    const urlRuta =
        "https://www.google.com/maps/dir/?api=1" +
        "&origin=" + encodeURIComponent(origen) +
        "&destination=" + encodeURIComponent(destinoTaller) +
        "&travelmode=driving";

    enlaceRuta.href = urlRuta;
    botonRuta.disabled = false;

    mostrarEstadoUbicacion(
        estadoUbicacion,
        "Ubicación obtenida. Presione “Abrir Google Maps” para consultar la ruta.",
        "success"
    );
}

function procesarErrorUbicacion(
    error,
    botonRuta,
    estadoUbicacion
) {
    let mensaje;

    switch (error.code) {
        case error.PERMISSION_DENIED:
            mensaje =
                "No se concedió permiso para utilizar la ubicación.";
            break;

        case error.POSITION_UNAVAILABLE:
            mensaje =
                "No fue posible determinar su ubicación actual.";
            break;

        case error.TIMEOUT:
            mensaje =
                "La solicitud de ubicación tardó demasiado tiempo.";
            break;

        default:
            mensaje =
                "Ocurrió un error al solicitar la ubicación.";
    }

    botonRuta.disabled = false;

    mostrarEstadoUbicacion(
        estadoUbicacion,
        mensaje,
        "danger"
    );
}

function mostrarEstadoUbicacion(
    estadoUbicacion,
    mensaje,
    tipo
) {
    estadoUbicacion.textContent = mensaje;

    estadoUbicacion.classList.remove(
        "alert-secondary",
        "alert-info",
        "alert-success",
        "alert-danger"
    );

    estadoUbicacion.classList.add("alert-" + tipo);
}


// Servicios cargados desde JSON


async function cargarServicios() {
    const contenedorServicios =
        document.querySelector("#lista-servicios");

    if (contenedorServicios === null) {
        return;
    }

    try {
        const respuesta = await fetch("datos/servicios.json");

        if (!respuesta.ok) {
            throw new Error(
                "No fue posible cargar servicios.json."
            );
        }

        const servicios = await respuesta.json();

        if (!Array.isArray(servicios)) {
            throw new Error(
                "El contenido del JSON no es una lista."
            );
        }

        mostrarServicios(servicios, contenedorServicios);
    } catch (error) {
        mostrarErrorServicios(contenedorServicios);
        console.error("Error al cargar los servicios:", error);
    }
}

function mostrarServicios(servicios, contenedorServicios) {
    if (servicios.length === 0) {
        contenedorServicios.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info mb-0" role="status">
                    No hay servicios disponibles actualmente.
                </div>
            </div>
        `;

        return;
    }

    const tarjetasServicios = servicios.map(function (servicio) {
        return crearTarjetaServicio(servicio);
    });

    contenedorServicios.innerHTML =
        tarjetasServicios.join("");
}

function crearTarjetaServicio(
    servicio,
    centrarContenido = false
) {
    const claseAlineacion =
        centrarContenido ? " text-center" : "";

    return `
        <div class="col-12 col-md-6 col-lg-4">
            <article
                class="card tarjeta-servicio h-100
                       shadow-sm${claseAlineacion}">

                <div class="card-body p-4">
                    <i
                        class="bi ${servicio.icono} icono-servicio"
                        aria-hidden="true">
                    </i>

                    <h3 class="card-title h4 mt-3">
                        ${servicio.nombre}
                    </h3>

                    <p class="card-text text-secondary">
                        ${servicio.descripcion}
                    </p>
                </div>
            </article>
        </div>
    `;
}

function mostrarErrorServicios(contenedorServicios) {
    contenedorServicios.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger mb-0" role="alert">
                No fue posible cargar los servicios.
                Intente actualizar la página.
            </div>
        </div>
    `;
}

// Galería cargada desde JSON

async function cargarGaleria() {
    const contenedorGaleria =
        document.querySelector("#lista-galeria");

    if (contenedorGaleria === null) {
        return;
    }

    try {
        const respuesta = await fetch("datos/galeria.json");

        if (!respuesta.ok) {
            throw new Error(
                "No fue posible cargar galeria.json."
            );
        }

        const trabajos = await respuesta.json();

        if (!Array.isArray(trabajos)) {
            throw new Error(
                "El contenido del JSON no es una lista."
            );
        }

        mostrarGaleria(trabajos, contenedorGaleria);
    } catch (error) {
        mostrarErrorGaleria(contenedorGaleria);
        console.error("Error al cargar la galería:", error);
    }
}

function mostrarGaleria(trabajos, contenedorGaleria) {
    if (trabajos.length === 0) {
        contenedorGaleria.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info mb-0" role="status">
                    No hay trabajos disponibles en la galería.
                </div>
            </div>
        `;

        return;
    }

    const tarjetasGaleria = trabajos.map(function (trabajo) {
        return crearTarjetaGaleria(trabajo);
    });

    contenedorGaleria.innerHTML =
        tarjetasGaleria.join("");
}

function crearTarjetaGaleria(trabajo) {
    return `
        <div class="col-12 col-sm-6 col-lg-4">
            <figure
                class="card tarjeta-galeria h-100
                       border-0 shadow-sm overflow-hidden mb-0">

                <div class="ratio ratio-4x3">
                    <img
                        src="${trabajo.imagen}"
                        class="w-100 h-100 object-fit-cover"
                        alt="${trabajo.alt}"
                        loading="lazy">
                </div>

                <figcaption class="card-body">
                    <h3 class="card-title h5">
                        ${trabajo.titulo}
                    </h3>

                    <p class="card-text text-secondary mb-0">
                        ${trabajo.descripcion}
                    </p>
                </figcaption>
            </figure>
        </div>
    `;
}

function mostrarErrorGaleria(contenedorGaleria) {
    contenedorGaleria.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger mb-0" role="alert">
                No fue posible cargar la galería.
                Intente actualizar la página.
            </div>
        </div>
    `;
}

//Cargar servicios index

async function cargarServiciosDestacados() {
    const contenedorDestacados =
        document.querySelector("#servicios-destacados");

    if (contenedorDestacados === null) {
        return;
    }

    try {
        const respuesta = await fetch("datos/servicios.json");

        if (!respuesta.ok) {
            throw new Error(
                "No fue posible cargar los servicios destacados."
            );
        }

        const servicios = await respuesta.json();

        if (!Array.isArray(servicios)) {
            throw new Error(
                "El contenido del JSON no es una lista."
            );
        }

        const serviciosDestacados =
            servicios.filter(function (servicio) {
                return servicio.destacado === true;
            });

        mostrarServiciosDestacados(
            serviciosDestacados,
            contenedorDestacados
        );
    } catch (error) {
        mostrarErrorServicios(contenedorDestacados);

        console.error(
            "Error al cargar los servicios destacados:",
            error
        );
    }
}

function mostrarServiciosDestacados(
    servicios,
    contenedorDestacados
) {
    if (servicios.length === 0) {
        contenedorDestacados.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info mb-0" role="status">
                    No hay servicios destacados actualmente.
                </div>
            </div>
        `;

        return;
    }

    const tarjetas = servicios.map(function (servicio) {
        return crearTarjetaServicio(servicio, true);
    });

    contenedorDestacados.innerHTML = tarjetas.join("");
}


// Conversor de pulgadas a milímetros mediante API REST


function inicializarConversorMedidas() {
    const formularioConversor =
        document.querySelector("#formulario-conversor");

    const campoPulgadas =
        document.querySelector("#valor-pulgadas");

    const botonConvertir =
        document.querySelector("#boton-convertir");

    const resultadoConversion =
        document.querySelector("#resultado-conversion");

    if (
        formularioConversor === null ||
        campoPulgadas === null ||
        botonConvertir === null ||
        resultadoConversion === null
    ) {
        return;
    }

    formularioConversor.addEventListener(
        "submit",
        async function (evento) {
            evento.preventDefault();

            formularioConversor.classList.add(
                "was-validated"
            );

            if (!formularioConversor.checkValidity()) {
                mostrarEstadoConversion(
                    resultadoConversion,
                    "Ingrese una medida válida en pulgadas.",
                    "danger"
                );

                campoPulgadas.focus();
                return;
            }

            const pulgadas = campoPulgadas.valueAsNumber;

            if (!Number.isFinite(pulgadas) || pulgadas < 0) {
                mostrarEstadoConversion(
                    resultadoConversion,
                    "La medida debe ser un número mayor o igual que cero.",
                    "danger"
                );

                campoPulgadas.focus();
                return;
            }

            await convertirPulgadas(
                pulgadas,
                botonConvertir,
                resultadoConversion
            );
        }
    );
}

async function convertirPulgadas(
    pulgadas,
    botonConvertir,
    resultadoConversion
) {
    const textoOriginalBoton = botonConvertir.innerHTML;

    botonConvertir.disabled = true;

    botonConvertir.innerHTML = `
        <span
            class="spinner-border spinner-border-sm me-1"
            aria-hidden="true">
        </span>

        Convirtiendo...
    `;

    mostrarEstadoConversion(
        resultadoConversion,
        "Consultando el servicio de conversión...",
        "info"
    );

    try {
        const expresion = pulgadas + " inch in mm";

        const url =
            "https://api.mathjs.org/v4/?expr=" +
            encodeURIComponent(expresion) +
            "&precision=14";

        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error(
                "La API respondió con el estado " +
                respuesta.status
            );
        }

        const resultado = await respuesta.text();

        mostrarEstadoConversion(
            resultadoConversion,
            pulgadas + " pulgadas equivalen a " + resultado + ".",
            "success"
        );
    } catch (error) {
        mostrarEstadoConversion(
            resultadoConversion,
            "No fue posible realizar la conversión. Intente nuevamente.",
            "danger"
        );

        console.error(
            "Error al consultar la API de conversión:",
            error
        );
    } finally {
        botonConvertir.disabled = false;
        botonConvertir.innerHTML = textoOriginalBoton;
    }
}

function mostrarEstadoConversion(
    resultadoConversion,
    mensaje,
    tipo
) {
    resultadoConversion.textContent = mensaje;

    resultadoConversion.classList.remove(
        "alert-secondary",
        "alert-info",
        "alert-success",
        "alert-danger"
    );

    resultadoConversion.classList.add("alert-" + tipo);
}

// Botón Volver arriba mediante jQuery

jQuery(function ($) {
    const botonVolverArriba = $("<button>", {
        id: "boton-volver-arriba",
        type: "button",
        class:
            "btn btn-primary rounded-circle " +
            "d-inline-flex align-items-center " +
            "justify-content-center boton-volver-arriba",
        "aria-label": "Volver al inicio de la página"
    });

    botonVolverArriba.html(`
        <i
            class="bi bi-arrow-up"
            aria-hidden="true">
        </i>
    `);

    botonVolverArriba.appendTo("body");

    $(window).on("scroll", function () {
        controlarBotonVolverArriba(
            botonVolverArriba
        );
    });

    botonVolverArriba.on("click", function () {
        $("html, body").animate(
            {
                scrollTop: 0
            },
            500
        );
    });

    controlarBotonVolverArriba(
        botonVolverArriba
    );
});

function controlarBotonVolverArriba(
    botonVolverArriba
) {
    const desplazamiento = $(window).scrollTop();

    if (desplazamiento > 300) {
        botonVolverArriba.stop(true, true).fadeIn(200);
    } else {
        botonVolverArriba.stop(true, true).fadeOut(200);
    }
}