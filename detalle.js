const body = document.body

const countryDetails = document.getElementById("country-details");
const paramsString = window.location.search;
const searchParams = new URLSearchParams(paramsString)

const codigoPais = searchParams.get("code");


document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem('darkmode');

    if(savedTheme === 'enabled') {
        body.classList.add('dark')
    }
});

function toggleTheme() {
    body.classList.toggle('dark');

    const isDark = body.classList.contains('dark');

    if (isDark) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled')
    }
};

function toggleTheme() {
    body.classList.toggle('dark');

    const isDark = body.classList.contains('dark');

    if (isDark) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled')
    }
};

async function searchCountrie(codeCountrie) {
    try {
        const respuesta = await fetch(`https://api.restcountries.com/countries/v5/codes.alpha_3/${codigoPais}`, {
            headers: { 'Authorization': 'Bearer rc_live_4a0f1a29aa0c43428d43fd783f4cb019'}
        });

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`)
        }

        const data = await respuesta.json();
        const dataObjecto = data.data.objects;
        const pais = dataObjecto[0];
        
        showCountry(pais);

    } catch (error) {
        console.error("Hubo un error al pedir datos: ", error.message)
    }
};

async function showCountry(country) {
    const nombre = country.names?.common || 'Desconocido';
    const poblacion  = country.population ? country.population.toLocaleString('en-US') : 'N/A';
    const region = country.region || "N/A";
    const bandera = country.flag?.url_svg || country.flag?.url_png || '';
    const subregion = country.subregion || 'N/A';
    const capital = country.capitals && country.capitals.length > 0 ? country.capitals[0].name : 'N/A';
    const leveldomain = country.tlds && country.tlds.length > 0 ? country.tlds[0] : 'N/A';

    let nombreNativo = 'N/A';
    if (country.names?.native) {
        const idiomasNativos = Object.values(country.names.native);
        if (idiomasNativos.length > 0) {
            nombreNativo = idiomasNativos[0].common
        }
    }

    let currencies = 'N/A'
    if (country.currencies) {
        currencies = Object.values(country.currencies).map(moneda => moneda.name).join(', ');
    }

    let lenguajes = "N/A"
    if (country.languages) {
        lenguajes = Object.values(country.languages).map(lenguaje => lenguaje.name).join(', ')
    }

    let bordersHTML = '<p>No tiene fronteras terrestres</p>';
    if (country.borders && country.borders.length > 0) {
        const borderPromises = country.borders.map(async borderCode => {
            const respuesta = await fetch(`https://api.restcountries.com/countries/v5/codes.alpha_3/${borderCode}`, {
                headers: { 'Authorization': 'Bearer rc_live_4a0f1a29aa0c43428d43fd783f4cb019'}
            });

            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`)
            }

            const data = await respuesta.json();
            const dataObjecto = data.data.objects;
            const pais = dataObjecto[0];
            const nombrePaisFrontera = pais.names?.common || 'Desconocido';
            return `<a href="detalle.html?code=${borderCode}" class="border-btn" target="_blank">${nombrePaisFrontera}</a>`;
        });

        const borderLinksArray = await Promise.all(borderPromises);
        const borderLink = borderLinksArray.join('');

        bordersHTML = `
            <div class="borders-container">
                <p><strong>Fronteras:</strong></p>
                <div class="border-buttons">
                    ${borderLink}
                </div>
            </div>
        `;
    }; 

    const card = document.createElement('div');
    card.classList.add('card-details');

    card.innerHTML = `
        <div class="detail-container">
            <img src="${bandera}" alt="Bandera de ${nombre}">
            
            <div class="info-container">
                <h2>${nombre}</h2>
                <div class="info-columns">
                    <div class="col-1">
                        <p><strong>Native Name:</strong> ${nombreNativo}</p>
                        <p><strong>Population:</strong> ${poblacion}</p>
                        <p><strong>Region:</strong> ${region}</p>
                        <p><strong>Sub Region:</strong> ${subregion}</p>
                        <p><strong>Capital:</strong> ${capital}</p>
                    </div>
                    <div class="col-2">
                        <p><strong>Top Level Domain:</strong> ${leveldomain}</p>
                        <p><strong>Currencies:</strong> ${currencies}</p>
                        <p><strong>Languages:</strong> ${lenguajes}</p>
                    </div>
                </div>
                ${bordersHTML}
            </div>
        </div>
    `;

    countryDetails.innerHTML = '';
    countryDetails.appendChild(card);
};

searchCountrie(codigoPais)