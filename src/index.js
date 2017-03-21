var fs = require('fs')
var format = require('date-fns/format');
require('es6-promise').polyfill();
require('isomorphic-fetch');

const API_AUTH="UUtSRQ9xACJRfAA3AnQHLlU9AzYBd1VyUCwDYF04Ui8Fbl4%2FBWVUMgJsVypUe1BmV3pSMVtgADBROgZ%2BWigDYlE7Uj4PZABnUT4AZQItByxVewNiASFVclA6A2RdLlI5BWBeJAVnVDYCZVcrVGVQZ1dsUi1bewA5UTYGaFo3A2FRMlI0D2wAa1E%2FAH0CLQc2VW4DNwE%2FVW9QNANgXWJSMgVnXm8FYVQ0AmlXK1RsUGZXZ1IwW2cAMVE6BmhaKAN%2FUUtSRQ9xACJRfAA3AnQHLlUzAz0Bag%3D%3D"
const API_CHECKSUM="3822e9feae6d1e97f3f2f6cbe4f2755f"

// raw API call
const getWeather = location => {
  const weatherUrl = `http://www.infoclimat.fr/public-api/gfs/json?_ll=${location}&_auth=${API_AUTH}&_c=${API_CHECKSUM}`
  return fetch(weatherUrl).then(res => res.json()).catch(e => console.log(e));
}

// compute some average datas for today
const getTodayWeather = location => {
  const today = new Date();
  return getWeather(location).then(data => makeAvgs([
    getHourlyWeather(data, today, 7),
    getHourlyWeather(data, today, 10),
    getHourlyWeather(data, today, 13),
    getHourlyWeather(data, today, 16),
    getHourlyWeather(data, today, 19)
  ])).catch(e => console.log(e));
}

// get today weather as a french sentence
const getTodayWeatherInFrench = location => getTodayWeather(location).then(values => valuesToFrench(values)).catch(e => console.log(e));

// compute averages from an array of objects
const makeAvgs = (values) => {
  const validValues = values.filter(v => !!v);
  const total = validValues.reduce((acc, cur) => {
    Object.keys(cur).forEach(k => {
      if (!acc[k]) {
        acc[k] = 0;
      }
      acc[k] += cur[k];
    })
    return acc
  }, {});
  return Object.keys(total).reduce((acc, cur) => {
    acc[cur] = total[cur] / validValues.length;
    return acc
  }, {});
}

// extract basic values for a given date/hour
const getHourlyWeather = (body, date, hour) => {
  if (hour < 10) {
    hour = `0${hour}`
  }
  const dateString = format(date, `YYYY-MM-DD ${hour}:00:00`);
  const data = body[dateString];
  if (!data) {
    return null;
  }
  return {
    temperature: parseInt(data.temperature['2m'], 10) - 273.15,
    pluie: data.pluie,
    nuages: data.nebulosite.moyenne,
    vent: data.vent_moyen['10m']
  };
}

// data => french text
const valuesToFrench = data => {
  let sentence = `Aujourd'hui à Paris, la température sera de ${parseInt(data.temperature, 10)} degrés environ.`;
  let pluie = '';
  if (data.pluie > 0) {
    pluie = "Ça va pluvioter un peu."
  }
  if (data.pluie > 0.3) {
    pluie = "Pluies éparses."
  }
  if (data.pluie > 0.5) {
    pluie = "Averses."
  }
  if (data.pluie > 0.8) {
    pluie = "Pluie continue."
  }
  let nuages = '';
  if (data.nuages > 0) {
    nuages = "Ciel dégagé."
  }
  if (data.nuages > 20) {
    nuages = "Ciel légèrement couvert."
  }
  if (data.nuages > 40) {
    nuages = "Ciel couvert."
  }
  if (data.nuages > 80) {
    nuages = "Vous ne verrez pas le ciel de la journée."
  }
  sentence += ` ${pluie} ${nuages}`
  return sentence
}

module.exports = {
  default: getWeather,
  getTodayWeather: getTodayWeather,
  getTodayWeatherInFrench: getTodayWeatherInFrench,
}


