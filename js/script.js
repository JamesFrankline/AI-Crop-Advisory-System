// ================================
// AI CROP RECOMMENDATION SYSTEM
// ================================


// Wait until HTML is completely loaded

document.addEventListener("DOMContentLoaded", function () {


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

    recommendButton.addEventListener("click", function () {


        // ================================
        // GET VALUES
        // ================================

        const landArea =
            parseFloat(landAreaInput.value);

        const soilType =
            soilTypeInput.value;

        const moisture =
            parseFloat(soilMoistureInput.value);

        const temperature =
            parseFloat(temperatureInput.value);

        const location =
            locationInput.value;


        console.log("Input Data:", {
            landArea,
            soilType,
            moisture,
            temperature,
            location
        });


        // ================================
        // VALIDATION
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


        // ================================
        // TEMPERATURE VALIDATION
        // ================================

        if (temperature < -10 || temperature > 60) {

            alert("Please enter a valid temperature.");

            return;

        }


        // ================================
        // DEFAULT VALUES
        // ================================

        let crop = "Millet";

        let score = 78;

        let reasons = [];


        // ================================
        // PADDY
        // ================================

        if (

            moisture >= 55 &&
            moisture <= 90 &&

            temperature >= 20 &&
            temperature <= 35 &&

            (
                soilType === "alluvial" ||
                soilType === "clay" ||
                soilType === "loamy"
            )

        ) {

            crop = "Paddy";

            score = 92;

            reasons = [

                "Suitable soil condition",

                "Good moisture level",

                "Suitable temperature"

            ];

        }


        // ================================
        // MAIZE
        // ================================

        else if (

            moisture >= 40 &&
            moisture <= 70 &&

            temperature >= 18 &&
            temperature <= 32 &&

            (
                soilType === "loamy" ||
                soilType === "red"
            )

        ) {

            crop = "Maize";

            score = 88;

            reasons = [

                "Suitable soil for maize",

                "Moderate moisture level",

                "Suitable growing temperature"

            ];

        }


        // ================================
        // COTTON
        // ================================

        else if (

            moisture >= 35 &&
            moisture <= 60 &&

            temperature >= 21 &&
            temperature <= 35 &&

            (
                soilType === "black" ||
                soilType === "red"
            )

        ) {

            crop = "Cotton";

            score = 86;

            reasons = [

                "Suitable soil condition",

                "Moderate moisture requirement",

                "Suitable temperature"

            ];

        }


        // ================================
        // GROUNDNUT
        // ================================

        else if (

            moisture >= 30 &&
            moisture <= 55 &&

            temperature >= 22 &&
            temperature <= 32 &&

            (
                soilType === "sandy" ||
                soilType === "loamy" ||
                soilType === "red"
            )

        ) {

            crop = "Groundnut";

            score = 84;

            reasons = [

                "Suitable soil drainage",

                "Good moisture range",

                "Suitable temperature"

            ];

        }


        // ================================
        // GENERAL RECOMMENDATION
        // ================================

        else {

            crop = "Millet";

            score = 78;

            reasons = [

                "Adaptable to current conditions",

                "Moderate water requirement",

                "Suitable for varied soil conditions"

            ];

        }


        // ================================
        // UPDATE CROP
        // ================================

        cropName.textContent = crop;


        // ================================
        // UPDATE SCORE
        // ================================

        suitabilityScore.textContent =
            score + "%";


        // ================================
        // UPDATE PROGRESS BAR
        // ================================

        progressFill.style.width =
            score + "%";


        // ================================
        // CLEAR OLD REASONS
        // ================================

        recommendationReasons.innerHTML = "";


        // ================================
        // ADD NEW REASONS
        // ================================

        reasons.forEach(function (reason) {

            const reasonElement =
                document.createElement("div");

            reasonElement.innerHTML =
                `<i class="fa-solid fa-check"></i> ${reason}`;

            recommendationReasons.appendChild(
                reasonElement
            );

        });


        // ================================
        // SUCCESS MESSAGE IN CONSOLE
        // ================================

        console.log(
            "Recommendation:",
            crop,
            score + "%"
        );


        // ================================
        // MOBILE SCROLL
        // ================================

        if (window.innerWidth <= 900) {

            document
                .querySelector(".result-panel")
                .scrollIntoView({

                    behavior: "smooth",

                    block: "center"

                });

        }

    });

});