let startButton = document.getElementById("start");
let minuteInput = document.getElementById("minutes-input");
let timerOutput = document.getElementById("timer");
let resetButton = document.getElementById("reset");
let pauseButton = document.getElementById("pause");
let errorText = document.getElementById("error-text");
let totalMinText = document.getElementById("total-min");
let started;
let getInterval;
let inputsRow = document.querySelector(".inputs");
let pre30 = document.getElementById("pre30");
let pre25 = document.getElementById("pre25");
let pre60 = document.getElementById("pre60");
let pre90 = document.getElementById("pre90");

setPaused();

window.onload = function() {
    //popup was opened
    chrome.storage.local.get(['progNoti'], function(result) {
      console.log("PROG: " + result.progNoti)
    })
    chrome.runtime.sendMessage({
        method: "getTimeLeft"
    }, function(res) {
        if (res.data === 0) {
            timerOutput.innerHTML = startText();
        } else if (res.data === "Start a timer below") {
            timerOutput.innerHTML = `${res.data} &#9200;`;
            chrome.storage.local.set({
                running: false
            });
        } else {
            // timer has actually been started
            timerOutput.innerHTML = formatTime(res.data);
            startPopupInterval();
        }
    });
    chrome.storage.local.get(['running'], function(result) {
        if (result.running) {
            // timer is running
            hideInputs();
            showControls();
        } else {
            showInputs();
            hideControls();
        }
    });
    // set total amount of time studied
    chrome.storage.local.get(['totalMinStudy'], function(result) {
        totalMinText.innerHTML = "&#8987; <span class='stand-out'>" + round2(result.totalMinStudy) + "</span> minutes total"
    });
};

startButton.addEventListener('click', function() {
    // let mins = Math.floor(minuteInput.value);
    let mins = minuteInput.value;
    if (mins === "" || mins <= 0 || mins >= 1000) {
        errorText.classList.remove("hidden");
        return;
    }

    startConfig(mins);
});

pre90.addEventListener('click', () => {
  startConfig(90);
});

pre30.addEventListener('click', () => {
  startConfig(30);
});

pre25.addEventListener('click', () => {
  startConfig(25);
});

pre60.addEventListener('click', () => {
    startConfig(60);
  });

pauseButton.addEventListener('click', function() {
  debugger
    switchPaused();
    chrome.runtime.sendMessage({
        method: "pauseTimer"
    }, function(res) {
        return true;
    });
});

resetButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({
        method: "resetTimer"
    }, function(res) {
        return true;
    });
    showInputs();
    hideControls();
    clearInterval(getInterval);
    timerOutput.innerHTML = "Timer has been reset";
    chrome.storage.local.set({
        running: false
    });
    chrome.storage.local.set({
        timeLeft: "timerDone"
    });
});

function startConfig(mins) {
  timerOutput.innerHTML = formatTime(mins * 60);
  chrome.runtime.sendMessage({
      method: "startTimer",
      data: mins
  }, function(res) {
      started = true;
      minuteInput.value = "";
      startPopupInterval();
  });

  errorText.classList.add("hidden");
  hideInputs();
  showControls();

  chrome.storage.local.set({
      running: true
  });
  chrome.storage.local.set({
      paused: false
  }, function() {
    setPaused();
  });
}

function startPopupInterval() {
    getInterval = setInterval(function() {
        chrome.storage.local.get(['timeLeft'], function(result) {
            // code gets seconds left which is stored
            if (result.timeLeft === "timerDone") {
                clearInterval(getInterval);
                showInputs();
                hideControls();
                chrome.storage.local.set({
                    running: false
                });
                timerOutput.innerHTML = startText();
            } else {
                timerOutput.innerHTML = formatTime(result.timeLeft);
            }
        });
    }, 1000)
}

function formatTime(seconds) {
    // seconds to hh:mm:ss
    dateObj = new Date(seconds * 1000);
    hours = dateObj.getUTCHours();
    minsInHours = hours * 60;
    minutes = dateObj.getUTCMinutes() + minsInHours;
    seconds = dateObj.getSeconds();
    timeString = minutes.toString().padStart(2, '0') +
        ':' + seconds.toString().padStart(2, '0');
    return timeString;
}

function hideInputs() {
    inputsRow.classList.add("hidden");
}

function showInputs() {
    inputsRow.classList.remove("hidden");
}

function hideControls() {
    resetButton.classList.add("hidden");
    pauseButton.classList.add("hidden");
}

function showControls() {
    resetButton.classList.remove("hidden");
    pauseButton.classList.remove("hidden");
}

function round2(num) {
    return Math.round(num * 100) / 100
}

function startText() {
  return "Start a timer below &#9200;";
}

function switchPaused() {
  chrome.storage.local.get(['paused'], function(result) {
    let toSetPause;
    if (result.paused) {
        // previously was paused, now is playing
        pauseButton.innerHTML = "pause"
        chrome.storage.local.set({ paused: false })
    }
    else {
        pauseButton.innerHTML = "resume";
        chrome.storage.local.set({ paused: true })
    }
  });
}

function setPaused() {
  chrome.storage.local.get(['paused'], function(result) {
    if (result.paused) {
      pauseButton.innerHTML = "resume"
    }
    else {
      pauseButton.innerHTML = "pause"
    }
  });
}
