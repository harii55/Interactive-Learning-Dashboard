document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startQuizBtn");
    const quizConfig = document.querySelector(".quiz_config");
    const quizBox = document.querySelector(".quiz_box");
    const infoBox = document.querySelector(".info_box");
    const resultBox = document.querySelector(".result_box");
    const questionText = document.querySelector(".que_text");
    const optionList = document.querySelector(".option_list");
    const nextBtn = document.querySelector(".next_btn");
    const totalQue = document.querySelector(".total_que");
    const timerSec = document.querySelector(".timer_sec");
    const timeLine = document.querySelector(".time_line");
    const restartBtn = document.querySelectorAll(".restart");
    const quitBtn = document.querySelectorAll(".quit");

    let category = 9;
    let difficulty = "medium";
    let questionCount = 10;
    let questions = [];
    let questionIndex = 0;
    let score = 0;
    let timeLimit = 15;
    let timer;
    let answered = false; // Track if a question has been answered

    // Tick and Cross Icons
    const tickIconTag = '<div class="icon tick"><i class="fas fa-check"></i></div>';
    const crossIconTag = '<div class="icon cross"><i class="fas fa-times"></i></div>';

    // Category Selection
    document.querySelectorAll("#category-group button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll("#category-group button").forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            category = button.getAttribute("data-value");
        });
    });

    // Difficulty Selection
    document.getElementById("difficulty").addEventListener("change", (e) => {
        difficulty = e.target.value;
    });

    // Number of Questions Selection
    document.querySelectorAll("#question-group button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll("#question-group button").forEach(btn => btn.classList.remove("selected"));
            button.classList.add("selected");
            questionCount = button.getAttribute("data-value");
        });
    });

    // Start Quiz
    startBtn.addEventListener("click", () => {
        quizConfig.style.display = "none";
        infoBox.classList.add("activeInfo");
    });

    // Continue from Info Box
    document.querySelector(".restart").addEventListener("click", async () => {
        infoBox.classList.remove("activeInfo");
        quizBox.classList.add("activeQuiz");
        await fetchQuestions();
    });

    // Quit Quiz
    quitBtn.forEach(button => button.addEventListener("click", () => {
        location.reload();
    }));

    // Fetch Questions from API
    async function fetchQuestions() {
        try {
            const url = `https://opentdb.com/api.php?amount=${questionCount}&category=${category}&difficulty=${difficulty}&type=multiple`;
            const response = await fetch(url);
            const data = await response.json();
    
            // Check if API response has questions
            if (!data.results || data.results.length === 0) {
                console.error("No questions returned from API.");
                // alert("Failed to load questions. Please try again.");
                return;
            }
    
            questions = data.results; // Assign questions
            questionIndex = 0;
            score = 0;
            loadQuestion(); // Load first question
        } catch (error) {
            console.error("Error fetching questions:", error);
            // alert("Error fetching questions. Please check your internet connection.");
        }
    }
    
    function loadQuestion() {
        if (!questions || questions.length === 0) {
            console.error("No questions available.");
            return;
        }
    
        if (questionIndex >= questions.length) {
            showResult();
            return;
        }
    
        clearInterval(timer);
        startTimer();
    
        answered = false; // Reset for the new question
        let q = questions[questionIndex];
    
        questionText.innerHTML = q.question;
        optionList.innerHTML = "";
    
        let options = [...q.incorrect_answers, q.correct_answer];
        options.sort(() => Math.random() - 0.5);
    
        options.forEach(option => {
            let div = document.createElement("div");
            div.classList.add("option");
            div.innerHTML = option;
            div.addEventListener("click", () => selectAnswer(div, q.correct_answer));
            optionList.appendChild(div);
        });
    
        totalQue.innerHTML = `${questionIndex + 1} of ${questionCount} Questions`;
    
        nextBtn.classList.remove("show"); // Hide Next button
    }
    
    function selectAnswer(selectedOption, correctAnswer) {
        if (answered) return; // Prevent multiple clicks

        answered = true;
        clearInterval(timer);

        let allOptions = document.querySelectorAll(".option");
        allOptions.forEach(option => option.classList.add("disabled"));

        if (selectedOption.innerText === correctAnswer) {
            selectedOption.classList.add("correct");
            selectedOption.insertAdjacentHTML("beforeend", tickIconTag);
            score++;
        } else {
            selectedOption.classList.add("incorrect");
            selectedOption.insertAdjacentHTML("beforeend", crossIconTag);
            highlightCorrectAnswer(correctAnswer);
        }

        nextBtn.classList.add("show"); // Show "Next" button after selection
    }

    function highlightCorrectAnswer(correctAnswer) {
        let allOptions = document.querySelectorAll(".option");
        allOptions.forEach(option => {
            if (option.innerText === correctAnswer) {
                option.classList.add("correct");
                option.insertAdjacentHTML("beforeend", tickIconTag);
            }
        });
    }

    function startTimer() {
        let timeLeft = timeLimit;
        timerSec.textContent = timeLeft;
        timeLine.style.width = "100%";

        timer = setInterval(() => {
            timeLeft--;
            timerSec.textContent = timeLeft;
            timeLine.style.width = (timeLeft / timeLimit) * 100 + "%";

            if (timeLeft <= 0) {
                clearInterval(timer);
                autoSelectCorrectAnswer();
            }
        }, 1000);
    }

    function autoSelectCorrectAnswer() {
        let allOptions = document.querySelectorAll(".option");
        let correctAnswer = questions[questionIndex]?.correct_answer;

        if (!correctAnswer) {
            console.error("Correct answer not found.");
            return;
        }

        allOptions.forEach(option => {
            option.classList.add("disabled");
            if (option.innerText === correctAnswer) {
                option.classList.add("correct");
                option.insertAdjacentHTML("beforeend", tickIconTag);
            }
        });

        nextBtn.classList.add("show"); // Show "Next" button when time runs out
    }

    function showResult() {
        quizBox.classList.remove("activeQuiz");
        resultBox.classList.add("activeResult");
        const scoreText = resultBox.querySelector(".score_text");
        let scoreTag = '';

        if (score > 3) {
            scoreTag = `<span>and congrats! 🎉, You got <p>${score}</p> out of <p>${questions.length}</p></span>`;
        } else if (score > 1) {
            scoreTag = `<span>and nice 😎, You got <p>${score}</p> out of <p>${questions.length}</p></span>`;
        } else {
            scoreTag = `<span>and sorry 😐, You got only <p>${score}</p> out of <p>${questions.length}</p></span>`;
        }

        scoreText.innerHTML = scoreTag;
    }

    restartBtn.forEach(button => button.addEventListener("click", async () => {
        resultBox.classList.remove("activeResult");
        quizBox.classList.add("activeQuiz");
        await fetchQuestions();
    }));

    // Move next button event listener outside selectAnswer
    nextBtn.addEventListener("click", () => {
        console.log("Next button clicked");
    
        if (questionIndex < questions.length - 1) {
            questionIndex++; // Increment question index
            loadQuestion();
        } else {
            showResult(); // End quiz if all questions are done
        }
    });
    
    //For the Quote
    const quoteText = document.getElementById("quote");
    const quoteAuthor = document.getElementById("author");
    const newQuoteBtn = document.getElementById("new-quote");

    const fetchQuote = async () => {
        try {
            const response = await fetch(
                "https://api.paperquotes.com/apiv1/quotes/?tags=dream,motivation&order=-likes",
                {
                    headers: {
                        Authorization: "Token YOUR_API_KEY" // Replace with your API key
                    }
                }
            );
            const data = await response.json();

            if (data.results.length > 0) {
                const randomQuote = data.results[Math.floor(Math.random() * data.results.length)];
                quoteText.textContent = `"${randomQuote.quote}"`;
                quoteAuthor.textContent = `- ${randomQuote.author}`;
            }
        } catch (error) {
            quoteText.textContent = "Oops! Something went wrong.";
            quoteAuthor.textContent = "";
            console.error("Error fetching quote:", error);
        }
    };

    // Fetch a quote when the page loads
    fetchQuote();

});
