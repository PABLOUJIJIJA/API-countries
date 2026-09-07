
const body = document.body
const countriesGrid = document.getElementById('countriesGrid');
const regionSelect = document.getElementById('region-select');
const searchInput = document.getElementById('searchInput')

let allCountries = [];

//Función para añadir la clase dark cuando es necesario
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem('darkMode');

    if (savedTheme === 'enabled') {
        body.classList.add('dark');
    }
});

//Función al darle click al botón de theme
function toggleTheme() {
    body.classList.toggle('dark');

    const isDark = body.classList.contains('dark');

    if (isDark) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled')
    }
};

//Función para recoger los datos 
async function fetchCountries() {
    let limit = 100;
    let offset = 1;
    let hayMasData = true;
    try {
        while (hayMasData) {
            const url = `https://api.restcountries.com/countries/v5?limit=${limit}&offset=${offset}`;
            const respuesta = await fetch(url, {
                headers: { 'Authorization': 'Bearer rc_live_4a0f1a29aa0c43428d43fd783f4cb019'}
            });

            if (!respuesta.ok) {
                throw new Error(`Error HTTp: ${respuesta.status}`)
            }

            const data = await respuesta.json();

            const nuevosPaises = data.data.objects;

            allCountries = [...allCountries,...nuevosPaises];

            if (nuevosPaises.length < limit) {
                hayMasData = false;
            } else {
                offset += limit;
            }
        }

        showCountries(allCountries);
    } catch (error) {
        countriesGrid.innerHTML = `<p>Hubo un error al cargar los países. Revisa tu conexión de internet.</p>`;
        console.error('Hubo un problema con la petición', error.message)
    }
}

//Función para mostrar los datos
function showCountries(data) {
    console.log(data) //info
    countriesGrid.innerHTML = '';
    
    data.forEach(country => {
        const nombre = country.names?.common || 'Desconocido';
        const bandera = country.flag?.url_svg || country.flag?.url_png || '';
        const poblacion = country.population ? country.population.toLocaleString('en-US') : 'N/A';
        const region = country.region || 'N/A';
        const codigoPais = country.codes?.alpha_3 || '';
        const capital = country.capitals && country.capitals.length > 0 ? country.capitals[0].name : 'N/A';

        const card = document.createElement('div');
        card.classList.add('card');

        card.innerHTML = `
            <img src="${bandera}" alt="Flag of ${nombre}">
            <div class="card-info">
                <h2>${nombre}</h2>
                <p><strong>Population:</strong> ${poblacion}</p>
                <p><strong>Region:</strong> ${region}</p>
                <p><strong>Capital:</strong> ${capital}</p>
            </div>
        `
        card.addEventListener('click', () => {
            window.open(`detalle.html?code=${codigoPais}`, '_blank');
        });

        countriesGrid.appendChild(card);
    });
};

//Función para seleccionar por regiones
regionSelect.addEventListener('change', (e) => {
    const region = e.target.value

    if (region === "all") {
        showCountries(allCountries);
    } else {
        const filtered = allCountries.filter(country => country.region === region)
        showCountries(filtered)
    }
});

//Función para buscar países
searchInput.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();

    const filtered = allCountries.filter(country => {
        const nombrePais = country.names?.common || '';

        return nombrePais.toLowerCase().includes(texto);
    });

    showCountries(filtered)
});

fetchCountries()
