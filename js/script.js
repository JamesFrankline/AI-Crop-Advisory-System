// ================================
// AI CROP RECOMMENDATION SYSTEM
// ================================


const API_BASE_URL = "https://ai-crop-advisory-system.onrender.com";


document.addEventListener("DOMContentLoaded", function () {

    /* =================================
       RESPONSIVE NAVBAR MENU
    ================================= */

    const menuToggle = document.getElementById("menu-toggle");
    const mainNav = document.getElementById("main-nav");

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", function () {
            const isOpen = mainNav.classList.toggle("is-open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );

            menuToggle.innerHTML = isOpen
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
        });

        mainNav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                mainNav.classList.remove("is-open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Open navigation menu");
                menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 900) {
                mainNav.classList.remove("is-open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.setAttribute("aria-label", "Open navigation menu");
                menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            }
        });
    }


    // ================================
    // WEATHER ELEMENT
    // ================================

    const weatherLocation =
        document.querySelector("#weatherLocation");

    const weatherCropAdvice =
        document.querySelector("#weatherCropAdvice");

    // ================================
    // DASHBOARD ELEMENTS
    // ================================

    const dashboardMoisture =
        document.querySelector("#dashboardMoisture");

    const dashboardMoistureCircle =
        document.querySelector("#dashboardMoistureCircle");

    const dashboardTemperature =
        document.querySelector("#dashboardTemperature");

    const dashboardIrrigation =
        document.querySelector("#dashboardIrrigation");

    const dashboardCrop =
        document.querySelector("#dashboardCrop");

    const dashboardCropScore =
        document.querySelector("#dashboardCropScore");

    const dashboardLocation =
        document.querySelector("#dashboardLocation");

    const dashboardUpdated =
        document.querySelector("#dashboardUpdated");

    // ================================
    // DETAILED ADVISORY ELEMENTS
    // ================================

    const advisoryButton =
        document.querySelector(".advisory-btn");

    const advisoryModal =
        document.querySelector("#advisoryModal");

    const closeAdvisory =
        document.querySelector("#closeAdvisory");

    const advisoryCropName =
        document.querySelector("#advisoryCropName");

    const advisoryScore =
        document.querySelector("#advisoryScore");

    const advisoryTemperature =
        document.querySelector("#advisoryTemperature");

    const advisoryWater =
        document.querySelector("#advisoryWater");

    const advisorySoil =
        document.querySelector("#advisorySoil");

    const advisoryMessage =
        document.querySelector("#advisoryMessage");

    // ================================
    // GET FORM ELEMENTS
    // ================================

    const recommendButton =
        document.querySelector(".recommend-btn");

    const landAreaInput =
        document.querySelector("#landArea");

    const soilTypeInput =
        document.querySelector("#soilType");

    const soilMoistureInput =
        document.querySelector("#soilMoisture");

    const temperatureInput =
        document.querySelector("#temperature");

    const locationInput =
        document.querySelector("#location");

    const nitrogenInput =
        document.querySelector("#nitrogen");

    const phosphorusInput =
        document.querySelector("#phosphorus");

    const potassiumInput =
        document.querySelector("#potassium");

    const humidityInput =
        document.querySelector("#humidity");

    const phInput =
        document.querySelector("#ph");

    const rainfallInput =
        document.querySelector("#rainfall");




    // ================================
    // GET RESULT ELEMENTS
    // ================================

    const cropName =
        document.querySelector(".result-content h2");

    const suitabilityScore =
        document.querySelector(".suitability-top strong");

    const progressFill =
        document.querySelector(".progress-fill");

    const recommendationReasons =
        document.querySelector(".recommendation-reasons");


    // ================================
    // CHECK ELEMENTS
    // ================================

    if (!recommendButton) {

        console.error("ERROR: Recommendation button not found.");

        return;
    }


    console.log("AI Crop Advisory JavaScript Loaded Successfully");


    // ================================
    // BUTTON CLICK
    // ================================

    recommendButton.addEventListener("click", async function () {


        // ================================
        // GET VALUES
        // ================================

        const landArea =
            parseFloat(landAreaInput.value);

        const soilType =
            soilTypeInput.value.toLowerCase();

        const moisture =
            parseFloat(soilMoistureInput.value);

        const temperature =
            parseFloat(temperatureInput.value);

        const location =
            locationInput.value;

        const nitrogen =
            parseFloat(nitrogenInput.value);

        const phosphorus =
            parseFloat(phosphorusInput.value);

        const potassium =
            parseFloat(potassiumInput.value);

        const humidity =
            parseFloat(humidityInput.value);

        const ph =
            parseFloat(phInput.value);

        const rainfall =
            parseFloat(rainfallInput.value);


        // ================================
        // CONSOLE INPUT DATA
        // ================================

        console.log("Input Data:", {

            landArea,
            soilType,
            moisture,
            temperature,
            location

        });


        // ================================
        // BASIC VALIDATION
        // ================================

        if (
            isNaN(landArea) ||
            landArea <= 0 ||
            !soilType ||
            isNaN(moisture) ||
            isNaN(temperature) ||
            !location
        ) {

            alert("Please fill in all field details correctly.");

            return;
        }


        // ================================
        // MOISTURE VALIDATION
        // ================================

        if (moisture < 0 || moisture > 100) {

            alert("Soil moisture must be between 0% and 100%.");

            return;
        }

        if (humidity < 0 || humidity > 100) {
            alert("Humidity must be between 0 and 100%.");
            return;
        }

        if (ph < 0 || ph > 14) {
            alert("Soil pH must be between 0 and 14.");
            return;
        }

        if (
            isNaN(nitrogen) ||
            isNaN(phosphorus) ||
            isNaN(potassium) ||
            isNaN(humidity) ||
            isNaN(ph) ||
            isNaN(rainfall)
        ) {
            alert("Please enter all soil and weather values.");
            return;
        }

        if (
            nitrogen < 0 ||
            phosphorus < 0 ||
            potassium < 0 ||
            rainfall < 0
        ) {
            alert("N, P, K and rainfall values cannot be negative.");
            return;
        }

        // ================================
        // ML API REQUEST
        // ================================

        let mlResult;

        try {

            const mlResponse = await fetch(
                "https://ai-crop-advisory-system.onrender.com/predict",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        N: nitrogen,
                        P: phosphorus,
                        K: potassium,
                        temperature: temperature,
                        humidity: humidity,
                        ph: ph,
                        rainfall: rainfall
                    })
                }
            );


            const responseData = await mlResponse.json();


            if (!mlResponse.ok) {

                alert(
                    responseData.error ||
                    "ML prediction failed."
                );

                return;
            }


            mlResult = responseData;

            console.log(
                "ML Prediction:",
                mlResult
            );

        }

        catch (error) {

            console.error(
                "ML API Error:",
                error
            );

            alert(
                "Unable to connect to the ML server. Please make sure Flask is running."
            );

            return;
        }


        // ================================
        // TEMPERATURE VALIDATION
        // ================================

        if (temperature < -10 || temperature > 60) {

            alert("Please enter a valid temperature.");

            return;
        }


        // ================================
        // CROP DATA
        // ================================

        // ================================
        // CALCULATE CONDITION SCORE
        // ================================

        function calculateConditionScore(value, min, max) {

            const idealMin = min + (max - min) * 0.25;
            const idealMax = max - (max - min) * 0.25;

            // Excellent range
            if (value >= idealMin && value <= idealMax) {
                return 100;
            }

            // Acceptable range
            if (value >= min && value <= max) {
                return 75;
            }

            // Outside range
            return 0;
        }

        const crops = [

            {
                name: "Paddy",

                minTemperature: 20,
                maxTemperature: 35,

                minMoisture: 55,
                maxMoisture: 90,

                soils: ["alluvial", "clay", "loamy"]
            },

            {
                name: "Maize",

                minTemperature: 18,
                maxTemperature: 32,

                minMoisture: 40,
                maxMoisture: 70,

                soils: ["loamy", "red"]
            },

            {
                name: "Cotton",

                minTemperature: 21,
                maxTemperature: 35,

                minMoisture: 35,
                maxMoisture: 60,

                soils: ["black", "red"]
            },

            {
                name: "Groundnut",

                minTemperature: 22,
                maxTemperature: 32,

                minMoisture: 30,
                maxMoisture: 55,

                soils: ["sandy", "loamy", "red"]
            },

            {
                name: "Millet",

                minTemperature: 20,
                maxTemperature: 35,

                minMoisture: 20,
                maxMoisture: 50,

                soils: ["sandy", "red", "loamy", "black", "alluvial"]
            }

        ];


        // ================================
        // FIND BEST CROP
        // ================================

        let bestCrop = null;

        let highestScore = 0;

        let bestReasons = [];


        crops.forEach(function (crop) {


            // ================================
            // SCORE
            // ================================

            let score = 0;

            let reasons = [];


            // ================================
            // TEMPERATURE SCORE
            // ================================

            const temperatureScore = calculateConditionScore(
                temperature,
                crop.minTemperature,
                crop.maxTemperature
            );

            score += temperatureScore * 0.35;

            if (temperatureScore === 100) {

                reasons.push("Ideal temperature");

            }
            else if (temperatureScore === 75) {

                reasons.push("Suitable temperature");

            }


            // ================================
            // MOISTURE SCORE
            // ================================

            const moistureScore = calculateConditionScore(
                moisture,
                crop.minMoisture,
                crop.maxMoisture
            );

            score += moistureScore * 0.35;

            if (moistureScore === 100) {

                reasons.push("Ideal soil moisture");

            }
            else if (moistureScore === 75) {

                reasons.push("Suitable soil moisture");

            }


            // ================================
            // SOIL SCORE
            // ================================

            if (crop.soils.includes(soilType)) {

                score += 30;

                reasons.push("Suitable soil condition");

            }


            // ================================
            // CHECK BEST CROP
            // ================================

            if (score > highestScore) {

                highestScore = Math.round(score);

                bestCrop = crop;

                bestReasons = reasons;

            }

        });


        // ================================
        // DEFAULT RECOMMENDATION
        // ================================

        if (!bestCrop) {

            bestCrop = crops[crops.length - 1];

            highestScore = 60;

            bestReasons = [

                "Adaptable to different conditions",

                "Lower water requirement",

                "Suitable for varied soil conditions"

            ];

        }


        // ================================
        // UPDATE CROP NAME
        // ================================

        // ================================
        // ML RESULT
        // ================================

        const mlCrop =
            mlResult.recommended_crop;

        const mlConfidence =
            mlResult.confidence;

        const mlSuitability =
            mlResult.suitability;


        // UPDATE CROP NAME

        cropName.textContent =
            mlCrop;


        // UPDATE ML CONFIDENCE

        document.getElementById("mlConfidence").textContent =
            mlConfidence + "%";


        // UPDATE FIELD SUITABILITY

        suitabilityScore.textContent =
            mlSuitability + "%";


        // UPDATE PROGRESS BAR

        progressFill.style.width =
            mlSuitability + "%";


        // ================================
        // UPDATE DASHBOARD
        // ================================

        dashboardMoisture.textContent =
            moisture + "%";

        dashboardMoistureCircle.textContent =
            moisture + "%";

        dashboardTemperature.textContent =
            temperature + "°C";

        dashboardCrop.textContent =
            mlCrop;

        dashboardCropScore.textContent =
            "Suitability: " + mlSuitability + "%";

        if (dashboardLocation) {
            dashboardLocation.textContent =
                locationInput.options[locationInput.selectedIndex].text;
        }

        if (dashboardUpdated) {

            const now = new Date();

            dashboardUpdated.textContent =
                "Last updated: " +
                now.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });
        }



        // ================================
        // UPDATE WEATHER LOCATION
        // ================================

        // ================================
        // WEATHER DATA
        // ================================

        const weatherData = {

            nagapattinam: {
                name: "Nagapattinam",
                latitude: 10.7654,
                longitude: 79.8424
            },

            thanjavur: {
                name: "Thanjavur",
                latitude: 10.7870,
                longitude: 79.1378
            },

            tiruvarur: {
                name: "Tiruvarur",
                latitude: 10.7727,
                longitude: 79.6368
            },

            mayiladuthurai: {
                name: "Mayiladuthurai",
                latitude: 11.1035,
                longitude: 79.6550
            },

            coimbatore: {
                name: "Coimbatore",
                latitude: 11.0168,
                longitude: 76.9558
            },

            madurai: {
                name: "Madurai",
                latitude: 9.9252,
                longitude: 78.1198
            },

            other: {
                name: "Other Location",
                latitude: 11.0168,
                longitude: 76.9558
            }

        };



        // ================================
        // UPDATE WEATHER
        // ================================

        const weather =
            weatherData[location] || weatherData.other;

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${weather.latitude}&longitude=${weather.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=precipitation_probability_max&timezone=auto`
        );

        const liveWeather = await weatherResponse.json();

        console.log("Live Weather Data:", liveWeather);

        const currentWeather = liveWeather.current;
        const dailyWeather = liveWeather.daily;

        weather.temperature =
            Math.round(currentWeather.temperature_2m) + "°C";

        weather.humidity =
            Math.round(currentWeather.relative_humidity_2m) + "%";

        weather.wind =
            Math.round(currentWeather.wind_speed_10m) + " km/h";

        weather.rain =
            Math.round(dailyWeather.precipitation_probability_max[0]) + "%";

        if (dashboardLocation) {
            dashboardLocation.textContent = weather.name;
        }

        if (weatherCropAdvice) {

            let cropWeatherAdvice = "";

            const recommendedCrop =
                mlCrop.toLowerCase();


            if (recommendedCrop === "paddy") {

                cropWeatherAdvice =
                    "Paddy is suitable under the current weather conditions. " +
                    "Maintain adequate soil moisture and monitor rainfall.";

            }

            else if (recommendedCrop === "maize") {

                cropWeatherAdvice =
                    "Maize can perform well under the current weather conditions. " +
                    "Maintain moderate soil moisture and ensure proper drainage.";

            }

            else if (recommendedCrop === "cotton") {

                cropWeatherAdvice =
                    "Current weather conditions are suitable for cotton. " +
                    "Avoid excessive moisture and maintain good field drainage.";

            }

            else if (recommendedCrop === "groundnut") {

                cropWeatherAdvice =
                    "Groundnut can grow well under the current conditions. " +
                    "Maintain moderate moisture and ensure well-drained soil.";

            }

            else if (recommendedCrop === "coffee") {

                cropWeatherAdvice =
                    "Coffee can perform well under suitable warm and humid conditions. " +
                    "Maintain adequate soil moisture and ensure good drainage.";

            }

            else {

                cropWeatherAdvice =
                    recommendedCrop.charAt(0).toUpperCase() +
                    recommendedCrop.slice(1) +
                    " is the recommended crop based on the ML model. " +
                    "Monitor weather conditions and maintain suitable soil moisture.";

            }


            weatherCropAdvice.textContent =
                cropWeatherAdvice;
        }


        weatherLocation.textContent =
            weather.name;

        document.querySelector("#weatherTemperature").textContent =
            weather.temperature;

        document.querySelector("#weatherCondition").textContent =
            weather.condition;

        document.querySelector("#weatherHumidity").textContent =
            weather.humidity;

        document.querySelector("#weatherWind").textContent =
            weather.wind;

        document.querySelector("#weatherRain").textContent =
            weather.rain;

        document.querySelector("#weatherAdvice").textContent =
            weather.advice;

        const rainChance = parseInt(weather.rain);
        const currentTemperature = parseInt(weather.temperature);
        const currentHumidity = parseInt(weather.humidity);

        let farmingAdvice = "";

        if (rainChance >= 50) {

            farmingAdvice =
                "High chance of rain. Avoid unnecessary irrigation and monitor field drainage.";

        }
        else if (currentTemperature >= 35) {

            farmingAdvice =
                "Very high temperature detected. Provide sufficient irrigation and protect crops from heat stress.";

        }
        else if (currentTemperature >= 32) {

            farmingAdvice =
                "High temperature detected. Monitor soil moisture and provide irrigation when required.";

        }
        else if (currentHumidity >= 80) {

            farmingAdvice =
                "Very high humidity detected. Monitor the crop closely for fungal diseases and excessive moisture.";

        }
        else if (currentHumidity >= 75) {

            farmingAdvice =
                "High humidity detected. Monitor soil moisture and watch for possible fungal diseases.";

        }
        else {

            farmingAdvice =
                "Weather conditions are suitable for normal farming activities.";

        }

        document.querySelector("#weatherAdvice").textContent = farmingAdvice;

        const weatherUpdated = document.querySelector("#weatherUpdated");

        if (weatherUpdated) {
            const now = new Date();

            weatherUpdated.textContent =
                "Last updated: " +
                now.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                });
        }

        const weatherIcon = document.querySelector(".weather-icon i");

        if (weather.condition === "Sunny") {
            weatherIcon.className = "fa-solid fa-sun";
        } else if (weather.condition === "Partly Cloudy") {
            weatherIcon.className = "fa-solid fa-cloud-sun";
        } else if (weather.condition === "Cloudy") {
            weatherIcon.className = "fa-solid fa-cloud";
        } else if (weather.condition === "Rainy") {
            weatherIcon.className = "fa-solid fa-cloud-rain";
        } else {
            weatherIcon.className = "fa-solid fa-sun";
        }

        const weatherCode = currentWeather.weather_code;

        if (weatherCode === 0) {
            weather.condition = "Sunny";
        }
        else if (weatherCode <= 3) {
            weather.condition = "Partly Cloudy";
        }
        else if (weatherCode <= 48) {
            weather.condition = "Cloudy";
        }
        else if (weatherCode <= 67) {
            weather.condition = "Rainy";
        }
        else if (weatherCode <= 77) {
            weather.condition = "Rainy";
        }
        else {
            weather.condition = "Rainy";
        }

        // ================================
        // IRRIGATION STATUS
        // ================================

        // ================================


        // SMART IRRIGATION STATUS
        // ================================

        // ================================


        // SMART IRRIGATION STATUS
        // ================================

        dashboardIrrigation.classList.remove(
            "irrigation-required",
            "irrigation-recommended",
            "moisture-normal",
            "high-moisture"
        );


        if (moisture < 30) {

            dashboardIrrigation.textContent =
                "Irrigation Required";

            dashboardIrrigation.classList.add(
                "irrigation-required"
            );

        }
        else if (moisture < 50) {

            dashboardIrrigation.textContent =
                "Irrigation Recommended";

            dashboardIrrigation.classList.add(
                "irrigation-recommended"
            );

        }
        else if (moisture <= 70) {

            dashboardIrrigation.textContent =
                "Moisture Normal";

            dashboardIrrigation.classList.add(
                "moisture-normal"
            );

        }
        else {

            dashboardIrrigation.textContent =
                "High Moisture";

            dashboardIrrigation.classList.add(
                "high-moisture"
            );

        }


        // ================================
        // UPDATE PROGRESS BAR
        // ================================

        progressFill.style.width =
            mlSuitability + "%";


        // ================================
        // CLEAR OLD REASONS
        // ================================

        recommendationReasons.innerHTML = "";


        // ================================
        // ADD NEW REASONS
        // ================================

        const mlReasons = [
            "Nitrogen (N) level analyzed",
            "Phosphorus (P) level analyzed",
            "Potassium (K) level analyzed",
            "Temperature and humidity analyzed",
            "Soil pH and rainfall analyzed"
        ];

        mlReasons.forEach(function (reason) {

            const reasonElement =
                document.createElement("div");

            reasonElement.innerHTML =
                `<i class="fa-solid fa-check"></i> ${reason}`;

            recommendationReasons.appendChild(
                reasonElement
            );

        });


        // ================================
        // CONSOLE RESULT
        // ================================

        console.log(
            "Recommended Crop:",
            bestCrop.name
        );

        console.log(
            "Suitability Score:",
            highestScore + "%"
        );


        // ================================
        // MOBILE SCROLL
        // ================================

        if (window.innerWidth <= 900) {

            const resultPanel =
                document.querySelector(".result-panel");

            if (resultPanel) {

                resultPanel.scrollIntoView({

                    behavior: "smooth",

                    block: "center"

                });

            }

        }

    });

    // ================================
    // DETAILED ADVISORY BUTTON
    // ================================

    if (advisoryButton && advisoryModal) {

        advisoryButton.addEventListener("click", function () {

            const crop =
                cropName.textContent.trim().toLowerCase();

            const score =
                suitabilityScore.textContent.trim();


            // Update crop name and score

            advisoryCropName.textContent = crop;

            advisoryScore.textContent = score;


            // ================================
            // CROP DETAILS
            // ================================

            if (crop === "paddy") {

                advisoryTemperature.textContent =
                    "20–35°C";

                advisoryWater.textContent =
                    "High";

                advisorySoil.textContent =
                    "Alluvial, Clay, Loamy";

                advisoryMessage.textContent =
                    "Maintain adequate moisture and water availability during the crop growth period.";
            }

            else if (crop === "maize") {

                advisoryTemperature.textContent =
                    "18–32°C";

                advisoryWater.textContent =
                    "Moderate";

                advisorySoil.textContent =
                    "Loamy, Red";

                advisoryMessage.textContent =
                    "Maintain moderate soil moisture and provide good drainage.";
            }

            else if (crop === "cotton") {

                advisoryTemperature.textContent =
                    "21–35°C";

                advisoryWater.textContent =
                    "Moderate";

                advisorySoil.textContent =
                    "Black, Red";

                advisoryMessage.textContent =
                    "Avoid excessive moisture and maintain proper soil drainage.";
            }

            else if (crop === "groundnut") {

                advisoryTemperature.textContent =
                    "22–32°C";

                advisoryWater.textContent =
                    "Moderate";

                advisorySoil.textContent =
                    "Sandy, Loamy, Red";

                advisoryMessage.textContent =
                    "Well-drained soil and moderate moisture are important for healthy growth.";
            }

            else if (crop === "coffee") {

                advisoryTemperature.textContent =
                    "18–28°C";

                advisoryWater.textContent =
                    "Moderate";

                advisorySoil.textContent =
                    "Well-drained, Loamy, Slightly Acidic";

                advisoryMessage.textContent =
                    "Coffee performs well in warm, humid conditions. Maintain adequate soil moisture, good drainage, and suitable soil conditions.";
            }

            else {

                advisoryTemperature.textContent =
                    "20–35°C";

                advisoryWater.textContent =
                    "Low to Moderate";

                advisorySoil.textContent =
                    "Sandy, Red, Loamy, Black, Alluvial";

                advisoryMessage.textContent =
                    "This crop is adaptable to different conditions and has relatively lower water requirements.";
            }


            // Open modal

            advisoryModal.classList.add("active");

        });


        // ================================
        // CLOSE BUTTON
        // ================================

        closeAdvisory.addEventListener("click", function () {

            advisoryModal.classList.remove("active");

        });


        // ================================
        // CLOSE WHEN CLICKING OUTSIDE
        // ================================

        advisoryModal.addEventListener("click", function (event) {

            if (event.target === advisoryModal) {

                advisoryModal.classList.remove("active");

            }

        });

    }
});



// Get Started button
const getStartedBtn = document.getElementById("get-started-btn");

if (getStartedBtn) {
    getStartedBtn.addEventListener("click", function () {
        document.getElementById("crop-advisory").scrollIntoView({
            behavior: "smooth"
        });
    });
}


/* ==========================
   LOGIN POPUP FUNCTIONALITY
========================== */
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginModal = document.getElementById("login-modal");
const closeLoginBtn = document.getElementById("close-login");

if (loginBtn && loginModal && closeLoginBtn) {
    loginBtn.addEventListener("click", function () {
        loginModal.style.display = "flex";

        if (loginMessage) {
            loginMessage.textContent = "";
        }

        if (loginForm) {
            loginForm.reset();
        }
    });

    closeLoginBtn.addEventListener("click", function () {
        if (registerSection) {
            registerSection.style.display = "none";
        }

        if (loginFormSection) {
            loginFormSection.style.display = "block";
        }

        loginModal.style.display = "none";
    });

    loginModal.addEventListener("click", function (event) {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    });
}



/* ==========================
   LOGIN FORM VALIDATION
========================== */

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

if (loginForm && loginMessage) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        loginMessage.textContent = "Logging in...";
        loginMessage.style.color = "#555";

        try {
            const response = await fetch("https://ai-crop-advisory-system.onrender.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Login failed.");
            }

            loginMessage.textContent =
                "Welcome, " + result.name + "! Login successful.";
            loginMessage.style.color = "green";
            const welcomeUser = document.getElementById("welcome-user");

            if (welcomeUser) {
                welcomeUser.textContent = "Welcome, " + result.name + "!";
                welcomeUser.style.display = "inline";
            }

            loginBtn.style.display = "none";
            if (logoutBtn) {
                logoutBtn.style.display = "inline-block";
            }
            setTimeout(function () {
                loginModal.style.display = "none";
                loginForm.reset();
            }, 1500);

        } catch (error) {
            loginMessage.textContent =
                error.message === "Failed to fetch"
                    ? "Cannot connect to server. Please check Flask."
                    : error.message;

            loginMessage.style.color = "red";
        }
    });
}




/* ==========================
   REGISTER FORM TOGGLE
========================== */
const showRegisterBtn = document.getElementById("show-register");
const registerSection = document.getElementById("register-section");
const backToLoginBtn = document.getElementById("back-to-login");
const loginFormSection = document.getElementById("login-form");

if (showRegisterBtn && registerSection && backToLoginBtn && loginFormSection) {
    showRegisterBtn.addEventListener("click", function (event) {
        event.preventDefault();
        loginFormSection.style.display = "none";
        registerSection.style.display = "block";
    });

    backToLoginBtn.addEventListener("click", function () {
        registerSection.style.display = "none";
        loginFormSection.style.display = "block";
    });
}


const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");

if (registerForm && registerMessage) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;

        registerMessage.textContent = "Creating account...";
        registerMessage.style.color = "#555";

        try {
            const response = await fetch("https://ai-crop-advisory-system.onrender.com/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Registration failed.");
            }

            registerMessage.textContent = result.message;
            registerMessage.style.color = "green";
            registerForm.reset();

        } catch (error) {
            registerMessage.textContent =
                error.message === "Failed to fetch"
                    ? "Cannot connect to server. Please check Flask."
                    : error.message;

            registerMessage.style.color = "red";
        }
    });
}



if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
        try {
            const response = await fetch("https://ai-crop-advisory-system.onrender.com/logout", {
                method: "POST",
                credentials: "include"
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Logout failed.");
            }

            const welcomeUser = document.getElementById("welcome-user");

            if (welcomeUser) {
                welcomeUser.textContent = "";
                welcomeUser.style.display = "none";
            }

            if (loginBtn) {
                loginBtn.style.display = "inline-block";
            }

            logoutBtn.style.display = "none";

            alert("Logout successful!");

        } catch (error) {
            alert("Logout failed. Please check Flask server.");
            console.error(error);
        }
    });
}


async function checkLoginSession() {
    try {
        const response = await fetch(
            "https://ai-crop-advisory-system.onrender.com/check-session",
            {
                method: "GET",
                credentials: "include"
            }
        );

        const result = await response.json();

        const welcomeUser = document.getElementById("welcome-user");
        const loginBtn = document.getElementById("login-btn");
        const logoutBtn = document.getElementById("logout-btn");


        if (result.logged_in) {
            if (loginBtn) loginBtn.style.display = "none";
            if (logoutBtn) logoutBtn.style.display = "inline-block";

            const welcomeUser = document.getElementById("welcome-user");
            if (welcomeUser) {
                welcomeUser.textContent = "Welcome, " + result.name + "!";
                welcomeUser.style.display = "inline";
            }
        }
        else {
            if (loginBtn) loginBtn.style.display = "inline-block";
            if (logoutBtn) logoutBtn.style.display = "none";

            if (welcomeUser) {
                welcomeUser.textContent = "";
                welcomeUser.style.display = "none";
            }
        }
    } catch (error) {
        console.error("Session check failed:", error);
    }
}

checkLoginSession();
