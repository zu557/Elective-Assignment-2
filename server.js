const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 4000;

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

console.log('API Key Status:', API_KEY ? 'Loaded' : '!!! MISSING !!!'); // This should show 'Loaded'

app.get('/weather/:city', async (req, res) => {
  const city = req.params.city;
  console.log("city ->",city)
  const url = `${BASE_URL}?q=${city}&appid=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.cod !== 200) {
      throw new Error(`API error: ${data.message}`);
    }

    // Data transformation: Parse and process
    const tempK = data.main.temp;
    const tempC = tempK - 273.15; // Convert Kelvin to Celsius
    const humidity = data.main.humidity;
    const weatherDesc = data.weather[0].description;
    const cityName = data.name;

    const transformedData = {
      city: cityName,
      temperature: `${tempC.toFixed(2)} °C`,
      humidity: `${humidity}%`,
      description: weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1)
    };

    console.log(`Successful API call for ${city}:`, transformedData);
    res.json(transformedData);
  } catch (error) {
    let statusCode = 500;
    let errorMessage = 'Unexpected error occurred';

    if (error.response) {
      // HTTP error from API
      statusCode = error.response.status;
      errorMessage = `HTTP error: ${error.response.statusText}`;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error(`Error fetching weather for ${city}: ${errorMessage}`);
    res.status(statusCode).json({ error: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});