const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "dcfbfe4d2ca8db577cda5c0d1e11b4ac";

const displayWeatherData = (cityName, data, isCurrent) => {
  const html = createWeatherCard(cityName, data, isCurrent);
  if (isCurrent) {
    currentWeatherDiv.innerHTML = html;
  } else {
    weatherCardsDiv.innerHTML = html;
  }
};

const createWeatherCard = (cityName, data, isCurrent) => {
  const temperature = Math.round(data.main.temp - 273.15); // Convert temperature to Celsius
  const windSpeed = data.wind.speed;
  const humidity = data.main.humidity;

  const weatherCard = `
    <div class="card">
      <h3>${cityName} (${isCurrent ? "Current" : "Day"})</h3>
      <h6>Temperature: ${temperature}°C</h6>
      <h6>Wind: ${windSpeed} M/S</h6>
      <h6>Humidity: ${humidity}%</h6>
    </div>
  `;
  return weatherCard;
};

async function getWeatherData(cityName, lat, lon) {
  let API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;
  if (lat && lon) {
    API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  }

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!data.coord && cityName) {
      throw new Error(`No data found for ${cityName}`);
    }

    return data;
  } catch (error) {
    alert("An error occurred while fetching the weather forecast! " + error.message);
  }
}

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;

  getWeatherData(cityName)
    .then(data => {
      if (!data.coord) {
        throw new Error(`No coordinates found for ${cityName}`);
      }
      const { lat, lon, name } = data.coord;
      return { lat, lon, name };
    })
    .then(data => getWeatherData(data.name, data.lat, data.lon))
    .then(data => displayWeatherData(data.name, data, true))
    .catch(error => {
      alert("An error occurred while fetching the coordinates! " + error.message);
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      getWeatherData(null, latitude, longitude)
        .then(data => displayWeatherData("Your Location", data, true))
        .catch(error => {
          alert("An error occurred while fetching the user's location! " + error.message);
        });
    },
    () => {
      alert("An error occurred while fetching the user's location.");
    }
  );
};

// Bind the event listeners after defining the functions
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
