//set up empty array for history
var searchHistory = [];
//set up openweather API and key
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = 'e7c18c7a2692c89d279349d1653aec75';


//get elements from HTML doc
var searchForm = document.getElementById('search-form');
var searchInput = document.getElementById('search-input');
var todayContainer = document.getElementById('today');
var forecastContainer = document.getElementById('forecast');
var searchHistoryContainer = document.getElementById('history');

//day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

//function to load search history
function loadHistory() {
    searchHistoryContainer.innerHTML = '';
    
    let buttonAttributes = {
        type: 'button',
        class: 'history-btn btn-history waves-effect waves-light btn col s12 blue lighten-4 blue-text text-darken-4',
        textContent: searchHistory[i],
    }
  
    for (var i = searchHistory.length - 1; i >= 0; i--) {
      var btn = Object.assign(document.createElement('button'), {buttonAttributes});
 
      btn.setAttribute('aria-controls', 'today forecast');
  
      btn.setAttribute('data-search', searchHistory[i]);
    
      searchHistoryContainer.append(btn);
    }
  };


  //function to add previous searches to history
  function addToHistory(search) {
    if (searchHistory.indexOf(search) !== -1) {
      return;
    }
    searchHistory.push(search);
  
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    loadHistory();
  };



  function initSearchHistory() {
    var storedHistory = localStorage.getItem('search-history');
    if (storedHistory) {
      searchHistory = JSON.parse(storedHistory);
    }
    loadHistory();
  };
  
  //function to create elements for today's weather and populate with values from API
  function loadCurrentWeather(city, weather) {
    var date = dayjs().format('M/D/YYYY');
    var tempF = weather.main.temp;
    var windMph = weather.wind.speed;
    var humidity = weather.main.humidity;
    var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    var iconDescription = weather.weather[0].description || weather[0].main;
  
    var card = Object.assign(document.createElement('div'),{
      class: 'card'
    });
    var cardBody = Object.assign(document.createElement('div'),{
      class: 'card-body'
    });
    var heading = Object.assign(document.createElement('h2'),{
      class: 'h3 card-title',
      textContent: `${city} (${date})`
    });
    var weatherIcon = Object.assign(document.createElement('img'),{
      src: iconUrl,
      class: 'weather-img',
      alt: iconDescription
    });
    var tempEl = Object.assign(document.createElement('p'),{
      class: 'card-text',
      textContent: `Temp: ${tempF}°F`
    });
    var windEl = Object.assign(document.createElement('p'),{
      class: 'card-text',
      textContent: `Wind: ${windMph} MPH`
    });
    var humidityEl = Object.assign(document.createElement('p'),{
      class: 'card-text',
      textContent: `Humidity: ${humidity} %`
    });
  
    card.append(cardBody);
  
    heading.append(weatherIcon);
    
    cardBody.append(heading, tempEl, windEl, humidityEl);
  
    todayContainer.innerHTML = '';
    todayContainer.append(card);
  };

//function to create cards for 5 day forecast
  function createForecastCard(forecast) {
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDescription = forecast.weather[0].description;
  var tempF = forecast.main.temp;
  var humidity = forecast.main.humidity;
  var windMph = forecast.wind.speed;

  // Create elements for a card
  var col = Object.assign(document.createElement('div'),{
    class: 'col-md five-day-card'
  });
  var card = Object.assign(document.createElement('div'),{
    class: 'card small col s2'
  });
  var cardBody = Object.assign(document.createElement('div'),{
    class: 'card-body p-2'
  });
  var cardTitle = Object.assign(document.createElement('h5'),{
    class: 'card-title',
    textContent: dayjs(forecast.dt_txt).format('M/D/YYYY')
  });
  var weatherIcon = Object.assign(document.createElement('img'),{
    src: iconUrl,
    alt: iconDescription
  });
  var tempEl = Object.assign(document.createElement('p'),{
    class: 'card-text',
    textContent: `Temp: ${tempF} °F`
  });
  var windEl = Object.assign(document.createElement('p'),{
    class: 'card-text',
    textContent: `Wind: ${windMph} MPH`
  });
  var humidityEl = Object.assign(document.createElement('p'),{
    class: 'card-text',
    textContent: `Humidity: ${humidity} %`
  });

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);
  forecastContainer.append(col);
};


//function to populate values of forecast cards using day.js
function renderForecast(dailyForecast) {
    var startDt = dayjs().add(1, 'day').startOf('day').unix();
    var endDt = dayjs().add(6, 'day').startOf('day').unix();
  
    var headingCol = Object.assign(document.createElement('div'), {
      class: "col-12"
    });
    var heading = Object.assign(document.createElement('h4'),{
      textContent: '5-Day Forecast:'
    });
  
    headingCol.append(heading);
  
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
  
    for (var i = 0; i < dailyForecast.length; i++) {
  
      
      if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
  
        if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
          createForecastCard(dailyForecast[i]);
        }
      }
    }
  };


  function renderItems(city, data) {
  loadCurrentWeather(city, data.list[0], data.city.timezone);
  renderForecast(data.list);
};

//convert location to latitude and longitute
function getWeather(location) {
    var { lat } = location;
    var { lon } = location;
    var city = location.name;
  
    var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;
  
    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        renderItems(city, data);
      })
      .catch(function (err) {
        console.error(err);
      });
  };

  //use coordinates to search weather
  function getCoords(search) {
    var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;
  
    fetch(apiUrl)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data[0]) {
          alert('Location not found');
        } else {
          addToHistory(search);
          getWeather(data[0]);
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  };

  function handleSearchFormSubmit(e) {
    // Don't continue if there is nothing in the search form
    if (!searchInput.value) {
      return;
    }
  
    e.preventDefault();
    var search = searchInput.value.trim();
    getCoords(search);
    searchInput.value = '';
  };
  
  function handleSearchHistoryClick(e) {
    // Don't do search if current elements is not a search history button
    if (!e.target.matches('.btn-history')) {
      return;
    }
  
    var btn = e.target;
    var search = btn.getAttribute('data-search');
    getCoords(search);
  }
  
  //load elements after correct events
  initSearchHistory();
  searchForm.addEventListener('submit', handleSearchFormSubmit);
  searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);