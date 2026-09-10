const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const weatherCard = document.getElementById("weatherCard");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

const cityName = document.getElementById("cityName");
const date = document.getElementById("date");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feels = document.getElementById("feels");
const weatherIcon = document.getElementById("weatherIcon");


// Search Button
searchBtn.addEventListener("click", searchCity);


// Press Enter to Search
cityInput.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        searchCity();
    }

});


// Search City
async function searchCity() {

    const city = cityInput.value.trim();

    if (city === "") {

        showError("Please enter a city name.");

        return;
    }

    try {

        showLoading();

        // Find city coordinates
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        const locationData = await locationResponse.json();

        if (!locationData.results) {

            throw new Error("City not found.");

        }

        const location = locationData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        const fullCityName =
            location.name +
            (location.country ? ", " + location.country : "");

        // Get weather
        await getWeather(
            latitude,
            longitude,
            fullCityName
        );

    } catch (err) {

        showError(err.message);

    }

}


// Get Weather
async function getWeather(latitude, longitude, locationName) {

    try {

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
        );

        const data = await response.json();

        const weather = data.current;

        // Display city
        cityName.textContent = locationName;

        // Temperature
        temperature.textContent =
            Math.round(weather.temperature_2m) + "°C";

        // Humidity
        humidity.textContent =
            weather.relative_humidity_2m + "%";

        // Wind
        wind.textContent =
            Math.round(weather.wind_speed_10m) + " km/h";

        // Feels Like
        feels.textContent =
            Math.round(weather.apparent_temperature) + "°C";

        // Weather condition
        const weatherInfo =
            getWeatherDescription(weather.weather_code);

        condition.textContent =
            weatherInfo.text;

        weatherIcon.textContent =
            weatherInfo.icon;

        // Current date
        const currentDate = new Date();

        date.textContent =
            currentDate.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

        weatherCard.style.display = "block";

        hideLoading();

    } catch (err) {

        showError("Unable to get weather data.");

    }

}


// Weather Description
function getWeatherDescription(code) {

    if (code === 0) {
        return {
            text: "Clear Sky",
            icon: "☀️"
        };
    }

    if (code === 1 || code === 2) {
        return {
            text: "Partly Cloudy",
            icon: "🌤️"
        };
    }

    if (code === 3) {
        return {
            text: "Cloudy",
            icon: "☁️"
        };
    }

    if (code >= 45 && code <= 48) {
        return {
            text: "Foggy",
            icon: "🌫️"
        };
    }

    if (code >= 51 && code <= 57) {
        return {
            text: "Drizzle",
            icon: "🌦️"
        };
    }

    if (code >= 61 && code <= 67) {
        return {
            text: "Rain",
            icon: "🌧️"
        };
    }

    if (code >= 71 && code <= 77) {
        return {
            text: "Snow",
            icon: "❄️"
        };
    }

    if (code >= 80 && code <= 82) {
        return {
            text: "Rain Showers",
            icon: "🌦️"
        };
    }

    if (code >= 95) {
        return {
            text: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        text: "Unknown Weather",
        icon: "🌍"
    };

}


// Use Current Location
locationBtn.addEventListener("click", function() {

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;
    }

    showLoading();

    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            try {

                // Get location name
                const response = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
                );

                const locationData =
                    await response.json();

                let locationName = "My Location";

                if (locationData.results) {

                    const location =
                        locationData.results[0];

                    locationName =
                        location.name +
                        (location.country
                            ? ", " + location.country
                            : "");
                }

                await getWeather(
                    latitude,
                    longitude,
                    locationName
                );

            } catch (error) {

                showError(
                    "Could not find your location."
                );

            }

        },

        function() {

            showError(
                "Location permission was denied."
            );

        }

    );

});


// Loading Function
function showLoading() {

    loading.style.display = "block";

    error.textContent = "";

}


// Hide Loading
function hideLoading() {

    loading.style.display = "none";

}


// Error Function
function showError(message) {

    loading.style.display = "none";

    error.textContent = message;

    weatherCard.style.display = "none";

}