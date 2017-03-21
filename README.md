# infoclimat.fr API <span class="badge-npmversion"><a href="https://npmjs.org/package/infoclimat" title="View this project on NPM"><img src="https://img.shields.io/npm/v/infoclimat.svg" alt="NPM version" /></a></span>


Get weather from [infoclimat.fr API](http://www.infoclimat.fr/api-previsions-meteo.html?id=2988507&cntry=FR) with NodeJS or the browser.


## Installation

`npm i -S infoclimat`

## Usage

```js
var infoclimat = require('infoclimat')

infoclimat.getTodayWeatherInFrench("48.856578,2.351828").then(data => {
  // Aujourd'hui à Paris, la température sera de 8 degrés environ. Ca va pluvioter un peu. Vous ne verrez pas le ciel de la journée.
})
```

#### getWeather(location)

> Return raw API data

```js
infoclimat.getWeather("48.856578,2.351828").then(data => {
  console.log(data);
})
```
result :
```js
{
  request_state: 200,
  request_key: 'fd543c77e33d6c8a5e218e948a19e487',
  message: 'OK',
  model_run: '07',
  source: 'internal:GFS:1',
  '2017-03-21 10:00:00':
    {
      temperature: { '2m': 281.9, sol: 281.4, '500hPa': -0.1, '850hPa': -0.1 },
      pression: { niveau_de_la_mer: 101240 },
      pluie: 0.1,
      pluie_convective: 0,
      humidite: { '2m': 80.5 },
      vent_moyen: { '10m': 18.8 },
      vent_rafales: { '10m': 26.6 },
      vent_direction: { '10m': 292 },
      iso_zero: 1128,
      risque_neige: 'non',
      cape: 0,
      nebulosite: { haute: 94, moyenne: 98, basse: 4, totale: 100 }
    },
}
```

see explanations for this values on [infoclimat.fr API](http://www.infoclimat.fr/api-previsions-meteo.html?id=2988507&cntry=FR)

#### getTodayWeather(location)

> Compute average values for today values

```js
infoclimat.getTodayWeather("48.856578,2.351828").then(data => {
  console.log(data);
})
```

result

```js
{
  temperature: 8.1,
  pluie: 0.1,
  nuages: 93.75,
  vent: 14.075
}
```

#### getTodayWeatherInFrench(location)

> Create readable French 🇫🇷 text descripting today weather

```js
infoclimat.getTodayWeatherInFrench("48.856578,2.351828").then(data => {
  console.log(data);
})
```

result

> Aujourd'hui à Paris, la température sera de 8 degrés environ. Ca va pluvioter un peu. Vous ne verrez pas le ciel de la journée.


## License

MIT
