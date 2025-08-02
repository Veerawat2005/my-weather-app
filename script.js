const apiKey = '69df9ace38872fda3c377894709c9738';

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');
const container = document.querySelector('.app-container');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const cityName = cityInput.value.trim();
    if (cityName) {
        getWeather(cityName);
    } else {
        alert('กรุณาใส่ชื่อเมือง');
    }
});

async function getWeather(city) {
    localStorage.setItem('lastCity', city);

    weatherInfoContainer.classList.remove('show');
    weatherInfoContainer.innerHTML = `<p>กำลังดึงข้อมูล...</p>`;

    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        if (!currentRes.ok || !forecastRes.ok) throw new Error('ไม่พบเมืองหรือเกิดข้อผิดพลาด');

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        displayWeather(currentData, forecastData.list);
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
        weatherInfoContainer.classList.add('show');
    }
}

function displayWeather(current, forecastList) {
    const { name, main, weather } = current;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];

    // ตรวจสอบกลางวันหรือกลางคืนจาก icon (ตัวท้าย d=day, n=night)
    const isDay = icon.includes('d');

    // ลบคลาสสีพื้นหลังเก่า
    container.classList.remove('cold', 'mild', 'hot', 'day', 'night');

    // ตั้งพื้นหลังตามอุณหภูมิ + กลางวัน/คืน
    if (temp < 10) container.classList.add('cold');
    else if (temp <= 25) container.classList.add('mild');
    else container.classList.add('hot');

    container.classList.add(isDay ? 'day' : 'night');

    let html = `
        <h2>${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
        <h3>พยากรณ์อากาศล่วงหน้า 5 วัน</h3>
        <div class="forecast-container">
    `;

    const daily = forecastList.filter(f => f.dt_txt.includes("12:00:00"));
    daily.forEach(f => {
        const date = new Date(f.dt_txt);
        const iconUrl = `https://openweathermap.org/img/wn/${f.weather[0].icon}.png`;
        html += `
            <div class="forecast-item">
               <p>${date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                <img src="${iconUrl}" alt="${f.weather[0].description}">
                <p>${f.main.temp.toFixed(0)}°C</p>
            </div>
        `;
    });

    html += `</div>`;
    weatherInfoContainer.innerHTML = html;

    setTimeout(() => {
        weatherInfoContainer.classList.add('show');
    }, 10);
}

// โหลดข้อมูลเมืองล่าสุดเมื่อเปิดหน้าเว็บ
window.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        getWeather(lastCity);
    }
});

function setWeatherBackground(weatherMain, icon) {
    // ลบคลาสเก่าก่อน
    container.classList.remove('clear', 'clouds', 'rain', 'snow', 'thunderstorm', 'night');

    const isNight = icon.includes('n');

    if (isNight) {
        container.classList.add('night');
        return;
    }

    switch(weatherMain.toLowerCase()) {
        case 'clear':
            container.classList.add('clear');
            break;
        case 'clouds':
            container.classList.add('clouds');
            break;
        case 'rain':
        case 'drizzle':
            container.classList.add('rain');
            break;
        case 'snow':
            container.classList.add('snow');
            break;
        case 'thunderstorm':
            container.classList.add('thunderstorm');
            break;
        default:
            container.classList.add('clear');
    }
}
