const apiKey = '4dcc6d7857ecd6b4b07b89d38a917d82';

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeather(cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

async function getWeather(city) {
    weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];

    const weatherHtml = `
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
    `;
    weatherInfoContainer.innerHTML = weatherHtml;
}

const hour = new Date().getHours();
document.body.style.background = hour >= 18 || hour <= 6 ? '#1e1e1e' : '#87CEEB';

// เปลี่ยนพื้นหลังตามคำอธิบายอากาศ
if (description.includes('ฝน')) {
    document.body.style.background = '#4a5568'; // ฝนตก
} else if (description.includes('แดด')) {
    document.body.style.background = '#FFD700'; // แดดออก
} else if (description.includes('เมฆ')) {
    document.body.style.background = '#708090'; // เมฆครึ้ม
} else {
    document.body.style.background = '#87CEEB'; // ฟ้าแจ่ม
}


localStorage.setItem('lastCity', city);
window.addEventListener('load', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        getWeather(lastCity);
    }
});

async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== "200") {
      throw new Error("ไม่พบข้อมูลพยากรณ์อากาศ");
    }

    if (!data.list || data.list.length === 0) {
      throw new Error("ไม่มีข้อมูลพยากรณ์อากาศ");
    }

    console.log(`พยากรณ์ ${data.list.length} รายการสำหรับเมือง ${data.city.name}`);

    // ดึงข้อมูลเที่ยงวันของแต่ละวัน
    const forecastList = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    forecastList.forEach(item => {
      console.log(`${item.dt_txt}: ${item.main.temp}°C, ${item.weather[0].description}`);
    });

    // แสดงผล หรือประมวลผลต่อไป
  } catch (error) {
    console.error(error.message);
  }
}
const city = 'Bangkok'; // เปลี่ยนเป็นชื่อเมืองที่ต้องการ
getForecast(city);
