var format = require("date-fns/format");
var isAfter = require("date-fns/is_after");
var isBefore = require("date-fns/is_before");
var startOfHour = require("date-fns/start_of_hour");
var setHours = require("date-fns/set_hours");
var addDays = require("date-fns/add_days");

// browser support
require("es6-promise").polyfill();
require("isomorphic-fetch");

const API_AUTH = "UUtSRQ9xACJRfAA3AnQHLlU9AzYBd1VyUCwDYF04Ui8Fbl4%2FBWVUMgJsVypUe1BmV3pSMVtgADBROgZ%2BWigDYlE7Uj4PZABnUT4AZQItByxVewNiASFVclA6A2RdLlI5BWBeJAVnVDYCZVcrVGVQZ1dsUi1bewA5UTYGaFo3A2FRMlI0D2wAa1E%2FAH0CLQc2VW4DNwE%2FVW9QNANgXWJSMgVnXm8FYVQ0AmlXK1RsUGZXZ1IwW2cAMVE6BmhaKAN%2FUUtSRQ9xACJRfAA3AnQHLlUzAz0Bag%3D%3D";
const API_CHECKSUM = "3822e9feae6d1e97f3f2f6cbe4f2755f";

// raw API call
const getWeather = location => {
  const protocol = (typeof window !== "undefined" &&
    window.location.protocol) ||
    "http:";
  const weatherUrl = `${protocol}//www.infoclimat.fr/public-api/gfs/json?_ll=${location}&_auth=${API_AUTH}&_c=${API_CHECKSUM}`;
  return fetch(weatherUrl).then(res => res.json()).catch(e => console.log(e));
};

const isDateString = str => str.match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/);
const useTodayWeather = () => new Date().getHours() < 12;

// extract flat meteo values from infoclimat API
const flattenData = data => Object.keys(data).filter(isDateString).reduce((
  acc,
  key
) => {
  acc.push(Object.assign({}, data[key], { date: key }));
  return acc;
}, []);

const newDate = (date, hour) => startOfHour(setHours(date, hour));
const isAcceptableData = (data, date) =>
  isAfter(data.date, newDate(date, 9)) &&
  isBefore(data.date, newDate(date, 18));

const getDayValues = date =>
  values => values.filter(v => isAcceptableData(v, date));

const getBasicValues = data => {
  return {
    temperature: data.temperature["2m"] - 273.15,
    pluie: data.pluie,
    nuages: data.nebulosite.moyenne,
    vent: data.vent_moyen["10m"]
  };
};

// filter daily data
const getDateWeather = (location, date) =>
  getWeather(location).then(flattenData).then(getDayValues(date));

const getNextWeather = location => {
  let targetDate = new Date();
  if (!useTodayWeather()) {
    targetDate = addDays(targetDate, 1);
  }
  return getDateWeather(location, targetDate)
    .then(values => values.map(getBasicValues))
    .then(makeAvgs);
};

// get today weather as a french sentence
const getNextWeatherInFrench = location => {
  const when = useTodayWeather() ? "Aujourd'hui" : "Demain";
  return getNextWeather(location)
    .then(values => valuesToFrench(values, when))
    .catch(e => console.log(e));
};

// compute averages from an array of objects
const makeAvgs = values => {
  const validValues = values.filter(v => !!v);
  const total = validValues.reduce(
    (acc, cur) => {
      Object.keys(cur).forEach(k => {
        if (!acc[k]) {
          acc[k] = 0;
        }
        acc[k] += cur[k];
      });
      return acc;
    },
    {}
  );
  return Object.keys(total).reduce((acc, cur) => {
    acc[cur] = total[cur] / validValues.length;
    return acc;
  }, {});
};

// data => french text
const valuesToFrench = (data, prefix = "Aujourd'hui") => {
  let sentence = `${prefix}, la température sera de ${parseInt(data.temperature, 10)} degrés environ.`;
  let pluie = "";
  if (data.pluie === 0) {
    pluie = "Pas de pluie prévue !";
  }
  if (data.pluie > 0) {
    pluie = "Ça va pluvioter un peu.";
  }
  if (data.pluie > 0.3) {
    pluie = "Pluies éparses.";
  }
  if (data.pluie > 0.5) {
    pluie = "Averses.";
  }
  if (data.pluie > 0.8) {
    pluie = "Pluie continue.";
  }
  let nuages = "";
  if (data.nuages === 0) {
    nuages = "Ciel de rêve.";
  }
  if (data.nuages > 0) {
    nuages = "Ciel dégagé.";
  }
  if (data.nuages > 20) {
    nuages = "Ciel légèrement couvert.";
  }
  if (data.nuages > 40) {
    nuages = "Ciel couvert.";
  }
  if (data.nuages > 80) {
    nuages = "Vous ne verrez pas le ciel de la journée.";
  }
  sentence += ` ${pluie} ${nuages}`;
  return sentence;
};

module.exports = {
  default: getWeather,
  getWeather: getWeather,
  getNextWeather: getNextWeather;,
  getNextWeatherInFrench: getNextWeatherInFrench
};
