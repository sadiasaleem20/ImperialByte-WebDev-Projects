// Quiz questions about Pakistan
const questions = [
  {
    question: "What is the capital of Pakistan?",
    options: ["Karachi", "Lahore", "Islamabad", "Peshawar"],
    answer: "Islamabad",
  },
  {
    question: "Pakistan gained independence in which year?",
    options: ["1945", "1947", "1950", "1971"],
    answer: "1947",
  },
  {
    question: "Who is known as the founder of Pakistan?",
    options: [
      "Allama Iqbal",
      "Liaquat Ali Khan",
      "Muhammad Ali Jinnah",
      "Sir Syed Ahmed Khan",
    ],
    answer: "Muhammad Ali Jinnah",
  },
  {
    question: "Which is the national language of Pakistan?",
    options: ["Punjabi", "Urdu", "Pashto", "Sindhi"],
    answer: "Urdu",
  },
  {
    question: "What is the national sport of Pakistan?",
    options: ["Cricket", "Field Hockey", "Football", "Kabaddi"],
    answer: "Field Hockey",
  },
  // {
  //   question: "Which river is the longest in Pakistan?",
  //   options: ["Chenab", "Jhelum", "Indus", "Ravi"],
  //   answer: "Indus",
  // },
  // {
  //   question: "Which is the largest city in Pakistan by population?",
  //   options: ["Lahore", "Islamabad", "Karachi", "Faisalabad"],
  //   answer: "Karachi",
  // },
  // {
  //   question: "What is the highest mountain peak in Pakistan?",
  //   options: ["Nanga Parbat", "K2", "Rakaposhi", "Tirich Mir"],
  //   answer: "K2",
  // },
  // {
  //   question: "Which province is Pakistan's largest by area?",
  //   options: ["Sindh", "Punjab", "Balochistan", "Khyber Pakhtunkhwa"],
  //   answer: "Balochistan",
  // },
  // {
  //   question: "What is the currency of Pakistan?",
  //   options: ["Rupee", "Dinar", "Taka", "Riyal"],
  //   answer: "Rupee",
  // },
];

let currentQuestion = 0;
let score = 0;

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

const questionNumberEl = document.getElementById("question-number");
const scoreDisplayEl = document.getElementById("score-display");
const progressBar = document.getElementById("progress-bar");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");

const finalScoreEl = document.getElementById("final-score");
const resultMessageEl = document.getElementById("result-message");

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", startQuiz);

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  startScreen.classList.add("d-none");
  resultScreen.classList.add("d-none");
  quizScreen.classList.remove("d-none");
  loadQuestion();
}

function loadQuestion() {
  feedback.classList.add("d-none");
  nextBtn.classList.add("d-none");

  const q = questions[currentQuestion];
  questionNumberEl.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  scoreDisplayEl.textContent = `Score: ${score}`;
  progressBar.style.width = `${(currentQuestion / questions.length) * 100}%`;

  questionText.textContent = q.question;
  optionsContainer.innerHTML = "";

  q.options.forEach((option) => {
    const btn = document.createElement("button");
    btn.classList.add("btn", "btn-outline-success");
    btn.textContent = option;
    btn.addEventListener("click", () => selectAnswer(btn, option));
    optionsContainer.appendChild(btn);
  });
}

function selectAnswer(selectedBtn, selectedOption) {
  const q = questions[currentQuestion];
  const allButtons = optionsContainer.querySelectorAll("button");

  allButtons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === q.answer) {
      btn.classList.add("option-correct");
    }
  });

  if (selectedOption === q.answer) {
    score++;
    feedback.classList.remove("d-none", "alert-danger");
    feedback.classList.add("alert-success");
    feedback.textContent = "Correct! ✅";
  } else {
    selectedBtn.classList.add("option-wrong");
    feedback.classList.remove("d-none", "alert-success");
    feedback.classList.add("alert-danger");
    feedback.textContent = `Wrong! The correct answer is "${q.answer}".`;
  }

  scoreDisplayEl.textContent = `Score: ${score}`;
  nextBtn.classList.remove("d-none");
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizScreen.classList.add("d-none");
  resultScreen.classList.remove("d-none");
  progressBar.style.width = "100%";

  finalScoreEl.textContent = score;

  let message = "";
  if (score === 5) {
    message = "Perfect score! You really know Pakistan well. 🎉";
  } else if (score >= 3) {
    message = "Great job! You know a lot about Pakistan.";
  } else if (score >= 1) {
    message = "Not bad! A little more reading and you'll ace it.";
  } else {
    message = "Keep learning — there's a lot more to discover about Pakistan!";
  }
  resultMessageEl.textContent = message;
}
