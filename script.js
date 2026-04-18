const countriesGrid = document.getElementById("countriesGrid");
const searchInput = document.getElementById("searchInput");
const regionFilter = document.getElementById("regionFilter");
const statusText = document.getElementById("status");

const { tween, styler } = window.popmotion;

let allCountries = [];

async function fetchCountries() {
  // Request only the fields needed for faster responses.
  const url =
    "https://restcountries.com/v3.1/all?fields=name,flags,capital,region,population";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const data = await response.json();

  return (
    data
      // Keep UI consistent by showing countries alphabetically.
      .sort((a, b) => a.name.common.localeCompare(b.name.common))
      .slice(1)
  );
}

function formatPopulation(number) {
  return new Intl.NumberFormat().format(number);
}

function createCountryCard(country) {
  const card = document.createElement("article");
  card.className = "country-card";

  const capital = country.capital?.[0] || "N/A";
  const flag = country.flags?.png || country.flags?.svg || "";
  const alt = country.flags?.alt || `${country.name.common} flag`;

  card.innerHTML = `
    <img src="${flag}" alt="${alt}">
    <div class="country-info">
      <h2>${country.name.common}</h2>
      <p><span class="label">Capital:</span> ${capital}</p>
      <p><span class="label">Region:</span> ${country.region || "N/A"}</p>
      <p><span class="label">Population:</span> ${formatPopulation(country.population || 0)}</p>
    </div>
  `;

  return card;
}

function animateCard(card, delay = 0) {
  const cardStyler = styler(card);

  // Stagger each card animation to create a cascading reveal effect.
  setTimeout(() => {
    tween({
      from: { opacity: 0, y: 24, scale: 0.96 },
      to: { opacity: 1, y: 0, scale: 1 },
      duration: 350,
    }).start((v) => {
      cardStyler.set(v);
    });
  }, delay);
}

function renderCountries(countries) {
  countriesGrid.innerHTML = "";

  if (countries.length === 0) {
    statusText.textContent = "No countries matched your search.";
    return;
  }

  statusText.textContent = `Showing ${countries.length} countries`;

  countries.forEach((country, index) => {
    const card = createCountryCard(country);
    countriesGrid.appendChild(card);
    animateCard(card, index * 200);
  });
}

function filterCountries() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const regionValue = regionFilter.value.toLowerCase();

  // Combine text search and region dropdown filters.
  const filtered = allCountries.filter((country) => {
    const matchesName = country.name.common.toLowerCase().includes(searchValue);
    const matchesRegion =
      regionValue === "all" ||
      (country.region || "").toLowerCase() === regionValue;

    return matchesName && matchesRegion;
  });

  renderCountries(filtered);
}

async function init() {
  try {
    statusText.textContent = "Loading countries...";
    allCountries = await fetchCountries();
    renderCountries(allCountries);
  } catch (error) {
    // Show a friendly message while logging details for debugging.
    console.error(error);
    statusText.textContent =
      "Failed to load country data. Please try again later.";
  }
}

searchInput.addEventListener("input", filterCountries);
regionFilter.addEventListener("change", filterCountries);

init();
