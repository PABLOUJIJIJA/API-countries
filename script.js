
const body = document.body
const countriesGrid = document.getElementById('countriesGrid');
const regionSelect = document.getElementById('region-select');
const searchInput = document.getElementById('searchInput')
const searchParams = new URLSearchParams(window.location.search)

let allCountries = [];
let currentSearchTerm = '';
let currentRegion = 'all';

let offset = 0;
let limit = 14;
let isFetching = false;
let hasMoreData = true;

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

async function loadNextCountries() {
    if (isFetching || !hasMoreData) return;
    isFetching = true;
    //Spinner-Loader
    let spinnerLoader = document.createElement('div');
    spinnerLoader.classList.add('spinner-loader');
    countriesGrid.appendChild(spinnerLoader);

    try {
        let url = `https://api.restcountries.com/countries/v5?limit=${limit}&offset=${offset}`;
        if(currentSearchTerm != ''){
            url += `&q=${currentSearchTerm}`;
        }

        if (currentRegion != 'all') {
            url += `&region=${currentRegion}`;
        }

        const respuesta = await fetch(url, {
            headers: { 'Authorization': 'Bearer rc_live_be84d26617c14bab87287f0375e26925' }
        });

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`)
        }

        const data = await respuesta.json();
        const nuevosPaises = data.data.objects;

        const esPrimeraCarga = (offset === 0);

        if (nuevosPaises.length === 0 && esPrimeraCarga) {
            hasMoreData = false;
            countriesGrid.innerHTML = '<p class="mensaje-error">No se encontraron países que coincidan con la busqueda</p>';
            return;
        }

        if(nuevosPaises.length < limit) {
            hasMoreData = false;
        } else {
            offset += limit 
        }

        showCountries(nuevosPaises,esPrimeraCarga)
    } catch(error) {
        console.error("Hubo un error al pedir los datos: ", error.message);
    } finally {
        if(countriesGrid.contains(spinnerLoader)){
            spinnerLoader.remove()
        }
        isFetching = false;
    }
}


const observer = new IntersectionObserver((entries) => {
    const ultimoElemento = entries[0];

    if (ultimoElemento.isIntersecting) {
        loadNextCountries();
    }
}, {
    rootMargin: '100px',
    threshold: 0.1
});

//Funcion para reiniciar la vista 
function showCountries(paises, limpiarGrid = false) {
    if(limpiarGrid){
        countriesGrid.innerHTML = '';
    };

    paises.forEach(country => {
        const nombre = country.names?.common || 'Desconocido';
        const bandera = country.flag?.url_svg || country.flag?.url_png || 'mapamundi.jpg';
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
            if(codigoPais === '') {
                alert(`Lo sentimos, la base de datos no tiene información detallada para ${nombre}.`);
                return;
            }
            window.open(`detalle.html?code=${codigoPais}`, '_blank');
        });

        countriesGrid.appendChild(card);
    });

    const tarjetasActuales = document.querySelectorAll('.card');
    if (tarjetasActuales.length > 0){
        observer.disconnect();
        observer.observe(tarjetasActuales[tarjetasActuales.length - 1])
    }
};

//Función para seleccionar por regiones
regionSelect.addEventListener('change', (e) => {
    currentRegion = e.target.value;

    offset = 0;
    hasMoreData = true;
    countriesGrid.innerHTML = '';
    searchParams.set('region', `${currentRegion}`);
    window.history.replaceState({},"",`${window.location.pathname}?${searchParams}`)
    loadNextCountries();
});

let debounceTimer;

//Función para buscar países
searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
        const texto = e.target.value.toLowerCase();

        if(texto === ''){
            offset = 0;
            hasMoreData = true;
            currentSearchTerm = '';
            countriesGrid.innerHTML = '';
            searchParams.delete('search');
            window.history.replaceState({},"",`${window.location.pathname}?${searchParams}`)
            loadNextCountries();
        } else {
            offset = 0;
            hasMoreData = true;
            currentSearchTerm = texto;
            countriesGrid.innerHTML = '';
            searchParams.set('search', `${texto}`);
            window.history.replaceState({},"",`${window.location.pathname}?${searchParams}`)
            loadNextCountries();
        }
    }, 500)
});

//Search-params
if(searchParams.has('search')){
    currentSearchTerm = searchParams.get('search');
    searchInput.value = currentSearchTerm
}

if(searchParams.has('region')) {
    currentRegion = searchParams.get('region');
    regionSelect.value = currentRegion;
}

loadNextCountries()
