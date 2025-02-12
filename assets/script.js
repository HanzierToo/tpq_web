document.addEventListener("DOMContentLoaded", async function () {
    console.log("JavaScript Loaded Successfully");

    let quizContainer = document.getElementById("quiz-container");
    let resultsContainer = document.getElementById("results-container");

    if (quizContainer) {
        // If the quiz container exists, we're on the quiz page
        startQuiz();
    } else if (resultsContainer) {
        // If the results container exists, we're on the results page
        displayResults();
    }

    async function loadQuestions() {
        try {
            let response = await fetch("/tpq_web/assets/questions.yml");
            if (!response.ok) throw new Error("Failed to load questions.yml");
            let data = await response.text();
            return jsyaml.load(data).questions;
        } catch (error) {
            console.error(error);
            alert("Error loading quiz questions.");
            return [];
        }
    }

    async function startQuiz() {
        let currentQuestionIndex = 0;
        let answers = [];
        let questions = await loadQuestions();
        let nextButton = document.getElementById("next-btn");

        if (questions.length === 0) {
            document.getElementById("question-title").textContent = "Error loading questions.";
            return;
        }

        function displayQuestion(question) {
            document.getElementById("question-title").textContent = question.text;
            let optionsContainer = document.getElementById("options");
            optionsContainer.innerHTML = "";

            question.options.forEach(option => {
                let btn = document.createElement("button");
                btn.textContent = option.text;
                btn.classList.add("quiz-option");
                btn.onclick = function () {
                    answers.push(option.personality);
                    nextButton.style.display = "block";
                };
                optionsContainer.appendChild(btn);
            });

            nextButton.style.display = "none";
        }

        function nextQuestion() {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                displayQuestion(questions[currentQuestionIndex]);
            } else {
                calculateResults();
            }
        }

        function calculateResults() {
            let personalityCounts = {};
            answers.forEach(answer => {
                personalityCounts[answer] = (personalityCounts[answer] || 0) + 1;
            });

            let resultType = Object.keys(personalityCounts).reduce((a, b) =>
                personalityCounts[a] > personalityCounts[b] ? a : b
            );

            // Ensure correct absolute path
            window.location.href = "/tpq_web/results?type=" + encodeURIComponent(resultType);
        }

        nextButton.addEventListener("click", nextQuestion);

        // Start the quiz with the first question
        displayQuestion(questions[currentQuestionIndex]);
    }

    async function displayResults() {
        let urlParams = new URLSearchParams(window.location.search);
        let personalityType = urlParams.get("type");

        try {
            let response = await fetch("/tpq_web/assets/personalities.yml");
            if (!response.ok) throw new Error("Failed to load personalities.yml");
            let data = await response.text();
            let personalities = jsyaml.load(data).personalities;

            let personality = personalities.find(p => p.type === personalityType);
            if (personality) {
                document.getElementById("personality-type").textContent = personality.type;
                document.getElementById("personality-desc").textContent = personality.description;
            } else {
                document.getElementById("results-container").innerHTML = "<h2>Error: Personality not found.</h2>";
            }
        } catch (error) {
            console.error(error);
            alert("Error loading personality results.");
        }
    }
});
