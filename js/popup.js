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
let pre3 = document.getElementById("pre3");
let pre2 = document.getElementById("pre2");
let pre1 = document.getElementById("pre1");
let pre0 = document.getElementById("pre0");

setPaused();

window.onload = function() {
    //popup was opened

    // chrome.storage.local.get(['progNoti'], function(result) {
    //   console.log("PROG: " + result.progNoti)
    // })
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

pre0.addEventListener('click', () => {
  startConfig(pre0.innerHTML);
});

pre1.addEventListener('click', () => {
  startConfig(pre1.innerHTML);
});

pre2.addEventListener('click', () => {
  startConfig(pre2.innerHTML);
});

pre3.addEventListener('click', () => {
    startConfig(pre3.innerHTML);
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

  // get the array, append the new time, set the storage as the new array
  chrome.storage.local.get(['mostUsedTimers'], (result) => {
      // code will add the time just used to the mostUsedTimers list (which is stored in chrome.storage.local)
      let times = result.mostUsedTimers
      times.push(mins)
      chrome.storage.local.set({
          mostUsedTimers: times
      })
  })
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
    setRecTimes();
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

function setRecTimes() {
    chrome.storage.local.get(['mostUsedTimers'], (result) => {
        let times = result.mostUsedTimers; // ["45", "45", etc]
        let uniqueTimes = new Set(times);


        if (uniqueTimes.size >= 4) {
            // get most common times
            const timesToSet = getMostCommon(times, 4);
            createPresets(timesToSet, 4)
        }
        else {
            // set the 4 - size number of presets
            knownTimesLength = uniqueTimes.size;
            
            const timesToSet = getMostCommon(times, knownTimesLength);

            console.log(uniqueTimes)
            console.log(knownTimesLength)
            console.log(timesToSet)
            createPresets(timesToSet, knownTimesLength)
        }
    })
}

function getMostCommon(arr, items) {
    // return the most common items (#) in arr
    let itemToCount = {};
    arr.map(item => {

        if (Object.keys(itemToCount).includes(item.toString())) {
            itemToCount[item] += 1
        }
        else {
            itemToCount[item] = 1
        }
    })

    let sortedCounts = sortKeys(itemToCount);
    let onlyKeys = []
    sortedCounts.map(item =>{
        onlyKeys.push(item[0])
    });
    // only keys has keys sorted from least --> greatest

    return onlyKeys.slice(0, items)
}

function sortKeys(dict) {
    var sortable = [];
    for (var key in dict) {
        sortable.push([key, dict[key]]);
    }

    sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
    return sortable
}

function createPresets(items, number) {
    console.log("NUM: " + number)
    const holder = document.getElementById("preset-holder");
    for (var i=0; i<number; i++) {
        let button = document.getElementById(`pre${i}`)
        button.innerHTML = items[i];
    }
}



// DEV shuffle random
function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }