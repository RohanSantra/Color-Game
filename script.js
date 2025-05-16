// Colors
const colors = ['red', 'blue', 'yellow', 'green', 'pink'];
const HeadingColors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF6EC7", "#845EC2", "#00C9A7", "#FFC75F",
    "#F9F871", "#F25C54", "#B980F0", "#38B6FF", "#FF9671", "#C34A36", "#2C73D2", "#9BDEAC",
    "#FF61A6", "#00D2FC", "#FEC260", "#EA5C2B"
];

let isPaused = false;
const activeBoxIntervals = new Map(); // Map to store each box's interval using the DOM node as key

const el = {
    // Elements 
    overlay: document.querySelector('.overlay'),
    gameOverContainer: document.querySelector('.game-over-container'),
    endScore: document.querySelector('.end-score'),
    exitGameContainer: document.querySelector('.exit-game-container'),
    startScreen: document.querySelector(".start-screen"),
    heading1: document.querySelector('.title1'),
    heading2: document.querySelector('.title2'),
    catcher: document.querySelector('.catcher'),
    gameScreen: document.querySelector('.game-screen'),
    scoreEl: document.querySelector('.score'),
    livesEl: document.querySelector('.lives'),

    //buttons 
    start: document.querySelector('.start'),
    playAgainBtn: document.querySelector('.play-again'),
    exitBtn: document.querySelector('.exit'),
    closeIcon: document.querySelector('.quitIcon'),
    yesBtn: document.querySelector('.yes'),
    noBtn: document.querySelector('.no'),

    //Interval ID
    startBoxInterval: null,
    gameBoxInterval: null,
    catcherColorInterval: null,

    //default starting value
    score: 0,
    lives: 1,
    catcherColor: null

}



//========= utilty function =======//
function show(el) {
    el.classList.remove('display');
}

function hide(el) {
    el.classList.add('display');
}

function togglePause() {
    isPaused = !isPaused;
    el.exitGameContainer.classList.toggle('display');
    el.overlay.classList.toggle('display');
}

function resetToStartScreen(element) {
    isPaused = false;
    clearInterval(el.gameBoxInterval);
    clearInterval(el.catcherColorInterval);
    removeBoxes('.game-screen', el.gameScreen);
    hide(element);
    hide(el.overlay);
    hide(el.gameScreen);
    show(el.startScreen);
    el.startBoxInterval = setInterval(() => createBgBoxes(el.startScreen), 1000);
}


function removeBoxes(elementClass, element) {
    document.querySelectorAll(`${elementClass} .box`).forEach(box => {
        element.removeChild(box);
    })
}

function gameover() {
    clearInterval(el.gameBoxInterval);
    clearInterval(el.catcherColorInterval);
    removeBoxes('.game-screen', el.gameScreen);   // Remove the boxes 
    show(el.overlay);
    show(el.gameOverContainer);
    el.endScore.innerHTML = el.score;

    //clearing the map
    for (const [box, interval] of activeBoxIntervals.entries()) {
        clearInterval(interval);
        activeBoxIntervals.delete(box);
    }

}


// Game mechanics
function gameMechanices(box) {
    const boxRect = box.getBoundingClientRect();
    const catcherRect = el.catcher.getBoundingClientRect();

    const isColliding = (
        boxRect.bottom >= catcherRect.top &&
        boxRect.left < catcherRect.right &&
        boxRect.right > catcherRect.left
    );


    if (isColliding && el.catcher.style.backgroundColor == box.style.backgroundColor) {
        el.score++;
    }
    else if (isColliding && el.catcher.style.backgroundColor !== box.style.backgroundColor) {
        el.lives--;
    }
    updateUI();
}



// Function to create boxes on start screen
function createBgBoxes(element) {
    if (isPaused) return; // prevents box creation when paused
    const box = document.createElement('div');
    box.classList.add('box');
    const color = colors[Math.floor(Math.random() * colors.length)];
    box.style.backgroundColor = color;
    box.style.top = '0px';
    box.style.left = Math.random() * (element.clientWidth - 30) + 'px';
    element.appendChild(box);

    const fallInterval = setInterval(() => {
        if (isPaused) return; // Prevent falling while paused
        let top = parseInt(box.style.top);
        if (top < element.clientHeight) {
            box.style.top = (top + 5) + 'px';
        } else {
            clearInterval(fallInterval);
            activeBoxIntervals.delete(box); // Remove from map
            if (getComputedStyle(el.gameScreen).display === 'flex') {
                gameMechanices(box);
            }
            if (element.contains(box)) {
                element.removeChild(box);
            }
        }
    }, 50);

    activeBoxIntervals.set(box, fallInterval); // Save interval with box reference
}



// Function to create span elements inside heading ,so that we can apply events 
function creatingSpan(heading) {
    const headingText = heading.innerHTML;
    heading.innerHTML = '';
    for (let i = 0; i < headingText.length; i++) {
        const span = document.createElement('span');
        span.innerHTML = headingText[i];
        heading.appendChild(span)
    }

    const spans = document.querySelectorAll('span');
    colorChanger(spans);
}


// Function to change color of headings
function colorChanger(spans) {
    setInterval(() => {
        const span = spans[Math.floor(Math.random() * spans.length)];
        const HeadingColor = HeadingColors[Math.floor(Math.random() * HeadingColors.length)];
        span.style.transition = 'color 0.3s ease';
        span.style.color = HeadingColor;
    }, 500);

    spans.forEach(span => {
        span.addEventListener('mouseenter', () => {
            span.style.color = 'aliceblue';
        })
    });
}


function catchColorChanger() {
    el.catcherColor = colors[Math.floor(Math.random() * colors.length)];
    el.catcher.style.backgroundColor = el.catcherColor;
}

//To start the game
function startGame() {
    el.startBoxInterval = setInterval(createBgBoxes, 500, el.startScreen);
    el.start.addEventListener('click', () => {
        clearInterval(el.startBoxInterval);                          // stop start screen box creating
        removeBoxes('.start-screen', el.startScreen);                // Remove the boxes 
        hide(el.startScreen);                                        // Hide the start screen
        show(el.gameScreen);                                         // Show the game area
        el.score = 0;
        el.lives = 1;
        updateUI();                                                  // Update the score 

        // Creating boxes for game area
        el.gameBoxInterval = setInterval(createBgBoxes, 1000, el.gameScreen);
        el.catcher.style.backgroundColor = 'red';
        el.catcherColorInterval = setInterval(() => {
            if (isPaused) return;
            catchColorChanger();
        }, 10000);

    })
}

// To update the scores and lives
function updateUI() {
    el.scoreEl.innerHTML = el.score;
    el.livesEl.innerHTML = el.lives;
    if (el.lives <= 0) {
        gameover();
        return;
    }
}

function setup() {
    hide(el.gameScreen);
    hide(el.overlay);
    hide(el.gameOverContainer);
    hide(el.exitGameContainer);

    // Adding click event play again button
    el.playAgainBtn.addEventListener('click', () => {
        hide(el.gameOverContainer);
        hide(el.overlay);
        el.score = 0;
        el.lives = 1;
        updateUI();
        el.gameBoxInterval = setInterval(createBgBoxes, 1000, el.gameScreen);
        el.catcherColorInterval = setInterval(catchColorChanger, 10000);
    });

    // Toggle on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && getComputedStyle(el.gameScreen).display === 'flex') {
            togglePause();
        }
    });

    // Adding click event exit button
    el.exitBtn.addEventListener('click', () => {
        resetToStartScreen(el.gameOverContainer)
    });

    // Adding click event yes button
    el.yesBtn.addEventListener('click', () => {
        resetToStartScreen(el.exitGameContainer)
    });

    // Adding click event close icon and no btn 
    el.closeIcon.addEventListener('click', togglePause);
    el.noBtn.addEventListener('click', togglePause);

    history.pushState({ page: 1 }, "", "");
    window.onpopstate = (event) => {
        togglePause();
        window.history.pushState({ page: 1 }, "", "");
    };

}


// function for constrols 
function controls() {
    document.addEventListener('keydown', (e) => {
        const left = parseInt(getComputedStyle(el.catcher).left);
        if (e.key === 'ArrowLeft' && left > 0) {
            el.catcher.style.left = (left - 20) + 'px';
        } else if (e.key === 'ArrowRight' && left < el.gameScreen.clientWidth - 60) {
            el.catcher.style.left = (left + 20) + 'px';
        }
    })
}

function mobileControls() {
    let touchStartX = null;
    el.gameScreen.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    });

    el.gameScreen.addEventListener('touchmove', e => {
        if (!touchStartX) return;
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - touchStartX;

        const left = parseInt(getComputedStyle(el.catcher).left);
        if (deltaX < -30 && left > 0) {
            el.catcher.style.left = (left - 20) + 'px';
            touchStartX = null;
        } else if (deltaX > 30 && left < el.gameScreen.clientWidth - 60) {
            el.catcher.style.left = (left + 20) + 'px';
            touchStartX = null;
        }
    });
}




//=========== Setting up the Home Screen =============//
creatingSpan(el.heading1);
creatingSpan(el.heading2);

//=========== Initialize game =============//
startGame();
setup();

//=========== controls for pc,tablet and mobile phone =============//
controls();
mobileControls();
