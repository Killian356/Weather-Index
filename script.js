
    const apiKey = "d1ed7be948d11ed8ac35d1aa806592ad";
    const apiUrl = 'https://api.openweathermap.org/data/2.5/';
    const onecall = 'onecall?';
    const weather = 'weather?';
    const currentWeatherDetail = document.querySelector('#cw-detail');
    const searchForm = document.querySelector('#search-form');
    const cities = document.querySelector('#city-list');
    const forecasts = document.querySelector('#forecast-list');
    const momentfmt = 'M/D/YYYY';
    const historyStorageKey = 'cities';
    
    let lastRes = null;
    
    const initHistory = () => {
      localStorage[historyStorageKey] = JSON.stringify([]);
      cities.innerHTML = '';
    }
    
    if (localStorage.getItem(historyStorageKey) === null) {
      initHistory();
    }
    
    const getCities = () => JSON.parse(localStorage[historyStorageKey]);
    
    const hasCity = (cityName) => getCities().some(c => c.name === cityName);
    
    const pushCity = (cityName, coord) => {
      let cs = getCities();
      if (cs.every(c => c.name !== cityName)) 
        cs.push({name: cityName, coords: coord});
      localStorage[historyStorageKey] = JSON.stringify(cs);
    }
    
    const updateHistory = () => {
      let cs = getCities();
      cities.innerHTML = '';
      for (c of cs) {
        let li = document.createElement('li');
        let b = document.createElement('button');
        b.textContent = c.name;
        b.classList.add('cityB');
        li.appendChild(b);
        cities.appendChild(li);
        li.style.listStyleType = "none";
      }
    }
    
    updateHistory();
    
    const uviTier = (uv) =>
      `<span class='uv uv-${(uv<3)?'favorable':(uv<6)?'moderate':'severe'}'>${uv}</span>`
    
    const displayCurrentWeather = (cityName, date, temp, wind, humidity, uv) => {
      let wHead = document.querySelector('#cw-header');
      wHead.textContent = `${cityName} (${date})`;
      let pTemp = document.createElement('p');
      pTemp.textContent = `Temp: ${temp}°F`;
      let pWind = document.createElement('p');
      pWind.textContent = `Wind: ${wind} MPH`;
      let pHumid = document.createElement('p');
      pHumid.textContent = `Humidity: ${humidity} %`;
      let pUVi = document.createElement('p');
      pUVi.innerHTML = `UV Index: ${uviTier(uv)}`;
    
      currentWeatherDetail.innerHTML = '';
      currentWeatherDetail.appendChild(pTemp);
      currentWeatherDetail.appendChild(pWind);
      currentWeatherDetail.appendChild(pHumid);
      currentWeatherDetail.appendChild(pUVi);
    }
    
    const forecast = (lat, lon) => {
      return fetch(apiUrl + onecall +
        [
          'lat=' + lat,
          'lon=' + lon,
          'exclude=' + ['minutely', 'hourly', 'alerts'].join(','),
          'units=imperial',
          'appid=' + apiKey].join('&')
      ).then(res => res.json()
      ).then(json => {
        console.log(json);
        lastRes = json;
        return json;
      })
    }
    
    const weatherCall = function (cityName) {
      return fetch(apiUrl + weather +
        [
          `q=${cityName}`,
          `appid=${apiKey}`
        ].join('&'))
        .then(res => res.json())
        .then(o => {
          lastRes = o;
          console.log(o);
          return o;
        })
    }
    
    const showDaily = days => {
      forecasts.innerHTML = '';
      for (d of days) {
        let card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `<h4>${moment(d.dt * 1000).format(momentfmt)}</h4>
        <p><img src=https://openweathermap.org/img/w/${d.weather[0].icon}.png></p>
        <p>Temp: ${d.temp.day}</p>
        <p>Wind: ${d.wind_speed}</p>
        <p>Humidity: ${d.humidity} %</p>`;
        forecasts.appendChild(card);
      }
    }
    
    const showForecast = (lat, lon, cityName) => {
      forecast(lat, lon).then(blob => {
        let c = blob.current;
        displayCurrentWeather(cityName, moment().format(momentfmt), c.temp, c.wind_speed, c.humidity, c.uvi);
        showDaily(blob.daily.slice(1,6));
      });
    }
    
    cities.addEventListener('click', ev => {
      ev.preventDefault();
      if (ev.target.classList.contains('cityBtn')) {
        let cs = getCities();
        let d = cs.find(c => c.name === ev.target.textContent);
        showForecast(d.coords.lat, d.coords.lon, d.name);
      }
    })
    
    searchForm.querySelector('button').addEventListener('click', (ev) => {
      ev.preventDefault();
      console.log(this);
      let sTerm = searchForm.querySelector('input').value;
      console.log(`search term: ${sTerm}`);
      weatherCall(sTerm)
      .then(json => {
        pushCity(json.name, json.coord);
        updateHistory();
        showForecast(json.coord.lat, json.coord.lon, json.name);
      });
     });
    
     document.querySelector('#clear-button').addEventListener('click', ev => {
       initHistory();
     })

    
