document.addEventListener("DOMContentLoaded", function () {
    let currentQuestionIndex = 0;
    let answers = [];

    console.log("JavaScript Loaded Successfully");

    async function loadQuestions() {
        let response = await fetch("questions.yml");
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
            btn.onclick = function () {
                answers.push(option.personality);
                nextQuestion();
            };
            optionsContainer.appendChild(btn);
        });
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

        window.location.href = `results.html?type=${resultType}`;
    }

    async function displayResults() {
        let urlParams = new URLSearchParams(window.location.search);
        let personalityType = urlParams.get("type");

        let response = await fetch("personalities.yml");
        let data = await response.text();
        let personalities = jsyaml.load(data).personalities;

        let personality = personalities.find(p => p.type === personalityType);

        document.getElementById("personality-type").textContent = personality.type;
        document.getElementById("personality-desc").textContent = personality.description;
    }

    if (window.location.pathname.includes("quiz.html")) {
        loadQuestions().then(questions => displayQuestion(questions[currentQuestionIndex]));
    } else if (window.location.pathname.includes("results.html")) {
        displayResults();
    }
});
