document.addEventListener("DOMContentLoaded", async function () {
    let currentQuestionIndex = 0;
    let answers = [];

    console.log("JavaScript Loaded Successfully");

    async function loadQuestions() {
        let response = await fetch("/tpq_web/assets/questions.yml");
        let data = await response.text();
        let questions = jsyaml.load(data).questions;
        return questions;
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
                document.getElementById("next-btn").style.display = "block"; // Show Next button
            };
            optionsContainer.appendChild(btn);
        });

        document.getElementById("next-btn").style.display = "none"; // Hide Next until an answer is selected
    }

    async function nextQuestion() {
        let questions = await loadQuestions();
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

        window.location.href = `results.md?type=${resultType}`;
    }

    async function displayResults() {
        let urlParams = new URLSearchParams(window.location.search);
        let personalityType = urlParams.get("type");

        let response = await fetch("/tpq_web/assets/personalities.yml");
        let data = await response.text();
        let personalities = jsyaml.load(data).personalities;

        let personality = personalities.find(p => p.type === personalityType);

        if (personality) {
            document.getElementById("personality-type").textContent = personality.type;
            document.getElementById("personality-desc").textContent = personality.description;
        } else {
            document.getElementById("results-container").innerHTML = "<h2>Error: Personality not found.</h2>";
        }
    }

    // Check if we are on the quiz or results page
    if (window.location.pathname.includes("quiz.md")) {
        console.log("Quiz Page Detected");
        loadQuestions().then(questions => displayQuestion(questions[currentQuestionIndex]));
        document.getElementById("next-btn").addEventListener("click", nextQuestion);
    } else if (window.location.pathname.includes("results.md")) {
        console.log("Huh?");
        displayResults();
    }
});
