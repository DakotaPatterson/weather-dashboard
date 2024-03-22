
//This makes sure the code is not initiated until the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', function() {

//This is my API Key from the OpenWeatherAPI
var apiKey= '6f7b77de06152b10a5f6b5ad9330f02e';

//This function is used to retrieve the city name that is entered by the user and runs it through the APi to retreive the proper location.
function searchCity(cityName) {
    // Hide any existing error message
    var errorMessage = document.getElementById('errorMessage');
    errorMessage.classList.add('hiddenElement');

    //This fetches the name searched and runs it through the displayCurrentWeather function for the current day weather.
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
         })
        .catch(error => {
        console.error('Error:', error);
        errorMessage.classList.remove('hiddenElement');
        });

    //This fetches the name searched and runs it through the displayForecast function for the 5 day forcast using the lat and long of the city
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`)
        
        .then(response => response.json())
        .then(data => {

            if (data.length > 0) {
            var city = data[0];
            var lat = city.lat;
            var lon = city.lon;

            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&exclude=hourly&appid=${apiKey}&units=imperial`);

            }else{
                console.error('City not found');
            }
         })
         .then(response => response.json())
         .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

//This function takes the city retreived and pulls the temp, wind, humidity, and date for the current day.
function displayCurrentWeather(data) {
    var currentWeatherContainer = document.getElementById('currentWeatherContainer');
        currentWeatherContainer.innerHTML = '';

        var temperature = data.main.temp;
        var wind = data.wind.speed;
        var humidity = data.main.humidity;
        var iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
        var currentWeatherDate = new Date(data.dt * 1000);
        var currentWeatherString = formatDate(currentWeatherDate);

        //This function then creates a div to display this data retreived to browser.
        var container = document.createElement('div');
        container.classList.add("border-5");
        container.classList.add("border");
        container.classList.add("border-dark");
        container.classList.add("p-3");

        container.innerHTML = `
            <div class="currentweatcher-body">
                <h5 class="card-title">${data.name} (${currentWeatherString})<img src="${iconUrl}" alt="Weather Icon"></h5>
                <p class="card-text">Temperature: ${temperature} °F</p>
                <p class="card-text">Wind: ${wind} MPH</p>
                <p class="card-text">Humidity: ${humidity}%</p>
            </div>
        `;

        currentWeatherContainer.appendChild(container);
    }

//This function is used to take the date received by the APi and format it to be mm/dd/yyyy
function formatDate(inputDate){
    var date = new Date(inputDate.setHours(0, 0, 0, 0));
    var ops = {year: 'numeric'}; ops.month = ops.day = '2-digit'
    return `${date.toLocaleDateString(0, ops)}`;
}

//This function takes the data retrieved by the fetch in searchCity and uses it to display the 5 day forcast for the city entered.
function displayForecast(data) {
    var header = document.getElementById("5dayForecastHeader");

    //This if statement displays the 5dayForecastHeader ID once the function is called.
    if (header.classList.contains("hiddenElement")) {
        header.classList.remove("hiddenElement");
    }

    var forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    //This retrieves the forecast data for each day from the data object and groups it by date. 
    var dailyForecasts = data.list.reduce((acc, forecast) => {
        var date = new Date(forecast.dt * 1000);
        var dateKey = date.toDateString();

        if (!acc[dateKey]) {
            acc[dateKey] = forecast;
        }
        return acc;
    }, {});


    Object.values(dailyForecasts).forEach(forecast => {
        var date = new Date(forecast.dt * 1000);
        //This is used to make sure the current day is not displayed in the 5 day forcast so it starts from the next day.
        if (new Date(date.setHours(0, 0, 0, 0)).toDateString() == today.toDateString()) {
            return;
        }

        //This takes the data  from the API fetch and makes new vars for each of the requirements. (date, temp, eind, humidity and icon)
        var dateString = formatDate(date);
        var temperature = forecast.main.temp;
        var wind = forecast.wind.speed;
        var humidity = forecast.main.humidity;
        var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;

        //This creates a div that gets the card class and is used to display the 5 day forcast to the browser.
        var card = document.createElement('div');
        card.classList.add('col-lg-2');
        card.classList.add('col-md-4');
        card.classList.add('col-sm-5');
        card.classList.add('cardContainer');

        card.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${dateString}</h5>
                    <img src="${iconUrl}" alt="Weather Icon" class="card-img-top">
                    <p class="card-text">Temperature: ${temperature} °F</p>
                    <p class="card-text">Wind: ${wind} MPH</p>
                    <p class="card-text">Humidity: ${humidity}%</p>
                </div>
            </div>
        `;

        forecastContainer.appendChild(card);
    });
}

//This function is used to pull the serch history when the page is loaded.
function getSearchHistory() {
    return JSON.parse(localStorage.getItem('searchHistory')) || [];
}

function saveToSearchHistory(cityName) {
    var searchHistory = getSearchHistory();
    // Check if the city is already in the search history
    if (!searchHistory.includes(cityName)) {
        // Add the city to the beginning of the search history array
        searchHistory.unshift(cityName);
        // Limit the search history to a certain number of items, e.g., 5
        searchHistory = searchHistory.slice(0, 10);
        // Save the updated search history back to local storage
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
}

//This function is used to display the search history.
function displaySearchHistory() {
    var searchHistory = getSearchHistory();
    var searchHistoryElement = document.getElementById('searchHistory');
    // Clear previous search history
    searchHistoryElement.innerHTML = '';
    // Create list items for each city in the search history
    searchHistory.forEach(cityName => {
        var listItem = document.createElement('li');
        listItem.textContent = cityName;
        listItem.classList.add('city');
        searchHistoryElement.appendChild(listItem);
    });
}

displaySearchHistory();

//This is an event listener for the dearch button that triggers the exacution of the searchCity, saveToSearchHistory and the displaySearchHistory functions.
document.getElementById('searchButton').addEventListener('click', function(event) {
    event.preventDefault();
    var cityName = document.getElementById('userInput').value.trim();
    searchCity(cityName);
    saveToSearchHistory(cityName);
    displaySearchHistory();
  });

//This is an event listener to display the city forcast when a city name in the search history is clicked. 
 document.getElementById('searchHistory').addEventListener('click', function(event) {
     if (event.target.classList.contains('city')) {
       var cityName = event.target.textContent;
      searchCity(cityName);
    }
});

//This is an event listener that clears the search history when the clear button is clicked and removes it from LocalStorage.
document.getElementById('clearHistoryButton').addEventListener('click', function(event) {
    var searchHistoryElement2 = document.getElementById('searchHistory');
    searchHistoryElement2.innerHTML = "";
    localStorage.removeItem("searchHistory");
});

});
