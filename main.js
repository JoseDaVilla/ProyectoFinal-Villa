//  !DATA.JSON

const pedirData = async () => {
    const response = await fetch("./data.json");
    const data = await response.json();
    return data
}

// Tuve que añadir todo a una funcion asincronica para que pudiera cargar la data de los vuelos y despues se ejecute el resto del codigo.

const main = async () => {

    const carritoCompras = [];
    const datosVuelo = await pedirData()

    const origenInput = document.getElementById("origin");
    const destinoInput = document.getElementById("destination");


    document.getElementById("searchFlightsButton").addEventListener("click", buscarVuelos);

    document.getElementById("results").addEventListener("click", function (evento) {
        if (!evento.target.classList.contains("botonAgregarAlCarrito")) {
            return;
        }

        const idVuelo = evento.target.getAttribute("data-id-vuelo");
        const vueloSeleccionado = datosVuelo.find((vuelo) => vuelo.id == idVuelo);

        const elementoFechaSalida = document.getElementById("departureDate");
        const fechaSalida = elementoFechaSalida.value;

        agregarAlCarrito(vueloSeleccionado, fechaSalida);

        // !OCULTAR OPCIONES
        document.getElementById("results").style.display = "none";
    });

    document.getElementById("reset").addEventListener("click", function () {
        location.reload();
    });

    function agregarAlCarrito(vuelo, fechaSalida) {
        carritoCompras.push({
            vuelo: vuelo,
            fechaSalida: fechaSalida
        });

        Toastify({
            text: `Vuelo ${vuelo.numeroVuelo} agregado al carrito.`,
            className: "success",
            duration: 1000,
        }).showToast();

        actualizarVistaCarrito();
    }

    // OCULTAR DETALLES DEL CARRITO Y BOTON 

    function actualizarVistaCarrito() {
        const contenedorItemsCarrito = document.getElementById("cartItems");
        contenedorItemsCarrito.innerHTML = "";

        if (carritoCompras.length > 0) {

            mostrarDetallesCarrito(true);
            mostrarBotonCarrito(true);

            document.getElementById("results").style.display = "none";
        } else {
            mostrarDetallesCarrito(false);
            mostrarBotonCarrito(false);

            document.getElementById("results").style.display = "flex";
        }
    }


    function mostrarBotonCarrito(mostrar) {
        const botonMostrarCarrito = document.getElementById("showCartButton");
        botonMostrarCarrito.style.display = mostrar ? "block" : "none";
    }

    function mostrarDetallesCarrito(mostrar) {
        const contenedorDetallesCarrito = document.getElementById("cartDetails");
        contenedorDetallesCarrito.style.display = mostrar ? "block" : "none";

        const contenedorDetallesContenido = document.getElementById("cartDetailsContent");
        contenedorDetallesContenido.innerHTML = "";
        let contenidoAlerta = "";

        if (carritoCompras.length > 0) {
            carritoCompras.forEach((item) => {
                const vuelo = item.vuelo;
                const fechaSalida = item.fechaSalida;

                const detalleVuelo = document.createElement("p");
                detalleVuelo.innerHTML = `
                ${new Date(fechaSalida + "T10:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                <p>Número de vuelo: ${vuelo.numeroVuelo}</p>
                <p>Origen: ${vuelo.origen}</p>
                <p>Destino: ${vuelo.destino}</p>
                <p>Salida: ${vuelo.salida}</p>
                <p>Llegada: ${vuelo.llegada}</p>
                <p>Precio: $${vuelo.precio}</p>
                <hr>`;
                contenedorDetallesContenido.appendChild(detalleVuelo);
            });
            localStorage.setItem("info-vuelo", JSON.stringify(carritoCompras));
            console.log((localStorage.getItem("info-vuelo")))

            document.getElementById("showCartButton").addEventListener("click", function () {
                contenidoAlerta = contenedorDetallesContenido.innerHTML;

                // PRECIO TOTAL DE COTIZACIÓN
                const precioTotal = carritoCompras.reduce((total, item) => total + item.vuelo.precio, 0);

                // SWEETALERT COTIZACIÓN
                Swal.fire({
                    title: 'Cotización',
                    html: `
                    ${contenidoAlerta}
                    <p class= cotizacion>El precio total de la cotización es: $${precioTotal}</p>`,
                    icon: 'info',
                    confirmButtonText: 'Cerrar'
                });
            });

        } else {
            // CARRITO NO HAY ELEMENTOS :D
            const mensajeSinDetalles = document.createElement("p");
            mensajeSinDetalles.textContent = "No hay elementos en el carrito.";
            contenedorDetallesContenido.appendChild(mensajeSinDetalles);
        }
    }

    // BUSQUEDA DE VUELOS

    function buscarVuelos() {
        const contenedorResultados = document.getElementById("results");
        contenedorResultados.style.display = "block";

        const elementoFechaSalida = document.getElementById("departureDate");
        const fechaSalida = elementoFechaSalida.value;

        if (!fechaSalida) {
            Toastify({
                text: "Por favor, seleccione la fecha de salida",
                className: "info",
                duration: 1000,
                style: {
                    background: "#00800d9d"
                }
            }).showToast();
            return;
        }

        const origen = document.getElementById("origin").value;
        const destino = document.getElementById("destination").value;

        if (!origen || !destino) {
            Toastify({
                text: "Por favor, agregue origen y destino",
                duration: 1000,
                className: "info",
            }).showToast();
            return;
        }

        const fechaSalidaLocal = new Date(fechaSalida + "T10:00:00");
        const fechaSalidaAjustada = new Date(
            fechaSalidaLocal.getTime() -
            fechaSalidaLocal.getTimezoneOffset() * 60000
        );

        const fechaSalidaFormateada = fechaSalidaAjustada.toLocaleDateString();

        const resultadosBusqueda = obtenerVuelosPorRuta(origen, destino);
        mostrarResultados(resultadosBusqueda, fechaSalidaFormateada);
    }

    function obtenerVuelosPorRuta(origen, destino) {
        return datosVuelo.filter(
            (vuelo) =>
                vuelo.origen.toLowerCase().includes(origen.toLowerCase()) &&
                vuelo.destino.toLowerCase().includes(destino.toLowerCase())
        );
    }

    function mostrarResultados(resultados, fechaSalidaFormateada) {
        const contenedorResultados = document.getElementById("results");
        contenedorResultados.innerHTML = "";

        if (resultados.length === 0) {
            contenedorResultados.innerHTML = "<p>No se encontraron vuelos.</p>";
            return;
        }

        // MOSTRAR COLOR SEGUN EL PRECIO

        resultados.forEach((resultado) => {
            const infoVuelo = document.createElement("div");
            infoVuelo.classList.add("info-vuelo");

            let colorPrecio = "";
            if (resultado.precio > 1 && resultado.precio <= 130) {
                colorPrecio = "verde";
            } else if (resultado.precio > 131 && resultado.precio <= 200) {
                colorPrecio = "amarillo";
            } else if (resultado.precio > 201) {
                colorPrecio = "rojo";
            }

            infoVuelo.innerHTML = `
            <div class=${colorPrecio}>
                
                <p>Número de vuelo: ${resultado.numeroVuelo}</p>
                <p>Origen: ${resultado.origen} - Destino: ${resultado.destino}</p>
                <p>Salida: ${resultado.salida} -Llegada: ${resultado.llegada}</p>
                <p>Precio: $${resultado.precio}</p>
                <button class="botonAgregarAlCarrito" data-id-vuelo="${resultado.id}">Seleccionar</button>
            </div>
            <hr>
        `;

            contenedorResultados.appendChild(infoVuelo);
        });
    }

    actualizarVistaCarrito();
}
main()
