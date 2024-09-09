let gameMode = 'standard';
let currentLevel = 1;
let difficulty = 'easy';
let timerInterval, eliminationsNeeded = 0, eliminatedOptions = [];
let score = 0;
let backgroundMusic;

const levelElements = {
    colors: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Brown", "Black", "White"],
    animals: ["Lion", "Elephant", "Giraffe", "Zebra", "Monkey", "Tiger", "Hippo", "Rhino", "Kangaroo"],
    planets: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
    dwarfs: ["Doc", "Grumpy", "Happy", "Sleepy", "Bashful", "Sneezy", "Dopey"],
    senses: ["Sight", "Hearing", "Smell", "Taste", "Touch", "Balance"],
    elements: ["Earth", "Water", "Fire", "Air", "Spirit"],
    seasons: ["Spring", "Summer", "Autumn", "Winter"],
    rockpaperscissor: ["Rock", "Paper", "Scissors"],
    dayNight: ["Day", "Night"]
};

const backgrounds = {
    colors: "url('images/colors.jpg')",
    animals: "url('images/animals.jpg')",
    planets: "url('images/space.jpg')",
    dwarfs: "url('images/dwarfs.jpg')",
    senses: "url('images/senses.jpg')",
    elements: "url('images/space.jpg')",
    seasons: "url('images/seasons.jpg')",
    rockpaperscissor: "url('images/rockpaperscissor.jpg')",
    dayNight: "url('images/daynight.jpg')"
};

window.onload = function() {
    startBackgroundMusic();
    document.body.style.backgroundImage = "url('images/forest.jpg')";
};

function selectGameMode(mode) {
    gameMode = mode;
    hideAllContainers();
    document.querySelector('.tutorial-container').style.display = 'block';
    startTutorial();
}

const tutorialTexts = [
    "Hello New player!",
    "If you want to beat me you have to pick the element I am NOT thinking about",
    "For example if I am thinking the color Blue, if you pick Blue you lose, if you pick Red you win and go to the next level",
    "Easy right! Try beat me!"
];

let tutorialStep = 0;

function startTutorial() {
    document.getElementById('tutorial-text').textContent = tutorialTexts[0];
    document.getElementById('next-tutorial').addEventListener('click', nextTutorialStep);
}

function nextTutorialStep() {
    tutorialStep++;
    if (tutorialStep < tutorialTexts.length) {
        document.getElementById('tutorial-text').textContent = tutorialTexts[tutorialStep];
    } else {
        hideAllContainers();
        document.querySelector('.menu-container').style.display = 'block';
    }
}

function startNewGame() {
    hideAllContainers();
    document.querySelector('.game-container').style.display = 'block';
    currentLevel = 1;
    score = 0;
    updateScore(0);
    difficulty = document.getElementById('difficulty').value;
    changeBackground(currentLevel);
    initializeLevel();
}

function initializeLevel() {
    eliminationsNeeded = getEliminationsNeeded();
    eliminatedOptions = [];
    updateProgressBar();
    updateLevelDisplay();
    generateOptions();
    if (difficulty !== 'easy') {
        startTimer();
    }
}

function getEliminationsNeeded() {
    if (gameMode === 'survival') {
        switch (difficulty) {
            case 'easy': return 3;
            case 'normal': return 5;
            case 'hard': return 7;
            default: return 3;
        }
    } else { // Standard game
        return difficulty === 'hard' ? 1 : 0;
    }
}

function generateOptions() {
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    let elements;
    let currentCategory;
    if (gameMode === 'survival') {
        const categoryKeys = Object.keys(levelElements);
        currentCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
        elements = levelElements[currentCategory];
    } else { // Standard game
        const categoryKeys = Object.keys(levelElements);
        currentCategory = categoryKeys[currentLevel - 1];
        elements = levelElements[currentCategory];
    }
    changeBackground(currentCategory);
    
    const options = [...elements];
    while (options.length > (gameMode === 'survival' ? eliminationsNeeded : 11 - currentLevel)) {
        const index = Math.floor(Math.random() * options.length);
        options.splice(index, 1);
    }
    
    // Randomly select the element the owl is thinking about
    const owlThought = options[Math.floor(Math.random() * options.length)];
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => handleOptionClick(option, owlThought);
        optionsContainer.appendChild(button);
    });
}

function handleOptionClick(selectedOption, owlThought) {
    if (eliminatedOptions.includes(selectedOption)) return;
    
    if (selectedOption === owlThought) {
        // Player loses if they select what the owl is thinking
        playSound('incorrect');
        endGame(false);
        return;
    }
    
    if (difficulty === 'hard') {
        if (eliminatedOptions.length === 0) {
            // First selection in hard mode
            eliminatedOptions.push(selectedOption);
            document.querySelectorAll('#options-container button').forEach(button => {
                if (button.textContent === selectedOption) {
                    button.style.backgroundColor = '#7f8c8d';
                    button.disabled = true;
                }
            });
        } else {
            // Second selection in hard mode
            playSound('correct');
            updateScore(100 * currentLevel);
            nextLevel();
        }
    } else {
        // Easy and normal modes
        playSound('correct');
        updateScore(100 * currentLevel);
        nextLevel();
    }
}

function nextLevel() {
    currentLevel++;
    if (gameMode === 'standard' && currentLevel > 9) {
        endGame(true);
    } else {
        initializeLevel();
    }
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    let timeRemaining = getTimeLimit();
    timerElement.textContent = formatTime(timeRemaining);
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endGame(false);
        } else {
            timerElement.textContent = formatTime(timeRemaining);
        }
    }, 1000);
}

function getTimeLimit() {
    if (difficulty === 'normal') return 20;
    if (difficulty === 'hard') return 12;
    return 0; // No timer for easy mode
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${(currentLevel / (gameMode === 'standard' ? 9 : 9)) * 100}%`;
}

function changeBackground(category) {
    const backgroundUrl = backgrounds[category];
    if (backgroundUrl) {
        document.body.style.backgroundImage = backgroundUrl;
    } else {
        console.error(`Background not found for category: ${category}`);
    }
}

function endGame(success) {
    clearInterval(timerInterval);
    hideAllContainers();
    const gameOverContainer = document.querySelector('.game-over-container');
    gameOverContainer.style.display = 'block';
    document.getElementById('game-over-message').textContent = success ? 'You Win!' : 'Game Over';
    document.getElementById('final-score').textContent = `Final Score: ${score}`;
    playSound(success ? 'win' : 'lose');
}

function goToMainMenu() {
    hideAllContainers();
    document.querySelector('.game-mode-container').style.display = 'block';
    document.body.style.backgroundImage = "url('images/forest.jpg')";
}

function updateLevelDisplay() {
    document.getElementById('level-display').textContent = `Level ${currentLevel}`;
}

function playSound(soundName) {
    const audio = new Audio(`sounds/${soundName}.mp3`);
    audio.play();
}

function updateScore(points) {
    score += points;
    document.getElementById('score-display').textContent = `Score: ${score}`;
}

function startBackgroundMusic() {
    backgroundMusic = new Audio('sounds/background-music.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5; // Adjust volume as needed
    backgroundMusic.play();
}

function hideAllContainers() {
    const containers = ['.game-mode-container', '.tutorial-container', '.menu-container', '.game-container', '.game-over-container'];
    containers.forEach(container => {
        document.querySelector(container).style.display = 'none';
    });
}
