

var infoclimat = require('./src')

infoclimat.getNextWeatherInFrench("48.856578,2.351828").then(data => {
  console.log(data);
})