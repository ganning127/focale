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
let preList = [pre0, pre1, pre2, pre3];
let horizontalBars = document.querySelectorAll("hr");
let scheme;

// always need to add one more than options.js b/c border color
let colorKeys = {
  "minBlue": ["rgb(0, 0, 128)", "rgb(206, 231, 240)", "rgb(89, 87, 87)", "rgb(28, 79, 145)", "rgb(157, 206, 242)"],
  "midSpce": ["rgb(163, 163, 163)", "rgb(13, 13, 13)", "rgb(115, 115, 115)", "rgb(163, 163, 163)", "rgb(0, 0, 0)"],
  "noir": ["rgb(138, 191, 186)", "rgb(12, 13, 12)", "rgb(88, 115, 107)", "rgb(242, 242, 242)", "rgb(36, 38, 37)"],
  "neon": ["rgb(242, 56, 105)", "rgb(3, 2, 38)", "rgb(66, 43, 217)", "rgb(57, 255, 20)", "rgb(0, 0, 0)"]
}

let color = {
  primaryColor: "",
  backgroundColor: "",
  defaultTextColor: "",
  timerTextColor: "",
  popupBorderColor: ""
};

setPaused();

window.onload = function () {
  //popup was opened
  chrome.runtime.sendMessage(
    {
      method: "getTimeLeft",
    },
    function (res) {
      if (res.data === 0) {
        timerOutput.innerHTML = startText();
      } else if (res.data === "Start a timer below") {
        timerOutput.innerHTML = `${res.data} &#9200;`;
        chrome.storage.local.set({
          running: false,
        });
      } else {
        // timer has actually been started
        timerOutput.innerHTML = formatTime(res.data);
        startPopupInterval();
      }
    }
  );
  chrome.storage.local.get(["running"], function (result) {
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
  chrome.storage.local.get(["totalMinStudy"], function (result) {
    totalMinText.innerHTML =
      "&#8987; <span class='stand-out'>" +
      round2(result.totalMinStudy) +
      "</span> minutes total";
  });

  chrome.storage.local.get(["colorScheme"], (result) => {
    scheme = result.colorScheme;

    if (scheme === "default") {
      return;
    }
    else if (scheme[0] === "custom") {
      color.primaryColor = scheme[1][0]
      color.backgroundColor = scheme[1][1]
      color.defaultTextColor = scheme[1][2]
      color.timerTextColor = scheme[1][3]
      color.popupBorderColor = scheme[1][0]
    }
    else {
      color.primaryColor = scheme[1][0]
      color.backgroundColor = scheme[1][1]
      color.defaultTextColor = scheme[1][2]
      color.timerTextColor = scheme[1][3]
      color.popupBorderColor = colorKeys[scheme[0]][4];
    }
    
    updatePopupUI();
  });
};

startButton.addEventListener("click", function () {
  let mins = Math.floor(minuteInput.value);
  if (mins === "" || mins <= 0 || mins >= 1000) {
    errorText.classList.remove("hidden");
    return;
  }

  startConfig(mins);
});

pre0.addEventListener("click", () => {
  startConfig(pre0.innerHTML);
});

pre1.addEventListener("click", () => {
  startConfig(pre1.innerHTML);
});

pre2.addEventListener("click", () => {
  startConfig(pre2.innerHTML);
});

pre3.addEventListener("click", () => {
  startConfig(pre3.innerHTML);
});

pauseButton.addEventListener("click", function () {
  switchPaused();
  chrome.runtime.sendMessage(
    {
      method: "pauseTimer",
    },
    function (res) {
      return true;
    }
  );
});

resetButton.addEventListener("click", function () {
  chrome.runtime.sendMessage(
    {
      method: "resetTimer",
    },
    function (res) {
      return true;
    }
  );
  showInputs();
  hideControls();
  clearInterval(getInterval);
  timerOutput.innerHTML = "Timer has been reset";
  chrome.storage.local.set({
    running: false,
  });
  chrome.storage.local.set({
    timeLeft: "timerDone",
  });
});

function startConfig(mins) {
  timerOutput.innerHTML = formatTime(mins * 60);
  chrome.runtime.sendMessage(
    {
      method: "startTimer",
      data: mins,
    },
    function (res) {
      started = true;
      minuteInput.value = "";
      startPopupInterval();
    }
  );

  errorText.classList.add("hidden");
  hideInputs();
  showControls();

  chrome.storage.local.set({
    running: true,
  });
  chrome.storage.local.set(
    {
      paused: false,
    },
    function () {
      setPaused();
    }
  );

  // get the array, append the new time, set the storage as the new array
  chrome.storage.local.get(["mostUsedTimers"], (result) => {
    // code will add the time just used to the mostUsedTimers list (which is stored in chrome.storage.local)
    let times = result.mostUsedTimers;
    times.push(mins);
    chrome.storage.local.set({
      mostUsedTimers: times,
    });
  });
}

function startPopupInterval() {
  getInterval = setInterval(function () {
    chrome.storage.local.get(["timeLeft"], function (result) {
      // code gets seconds left which is stored
      if (result.timeLeft === "timerDone") {
        clearInterval(getInterval);
        showInputs();
        hideControls();
        chrome.storage.local.set({
          running: false,
        });
        timerOutput.innerHTML = startText();
      } else {
        timerOutput.innerHTML = formatTime(result.timeLeft);
      }
    });
  }, 1000);
}

function formatTime(seconds) {
  // seconds to hh:mm:ss
  dateObj = new Date(seconds * 1000);
  hours = dateObj.getUTCHours();
  minsInHours = hours * 60;
  minutes = dateObj.getUTCMinutes() + minsInHours;
  seconds = dateObj.getSeconds();
  timeString =
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0");
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
  return Math.round(num * 100) / 100;
}

function startText() {
  return "Start a timer below &#9200;";
}

function switchPaused() {
  chrome.storage.local.get(["paused"], function (result) {
    let toSetPause;
    if (result.paused) {
      // previously was paused, now is playing
      pauseButton.innerHTML = "pause";
      chrome.storage.local.set({ paused: false });
    } else {
      pauseButton.innerHTML = "resume";
      chrome.storage.local.set({ paused: true });
    }
  });
}

function setPaused() {
  chrome.storage.local.get(["paused"], function (result) {
    if (result.paused) {
      pauseButton.innerHTML = "resume";
    } else {
      pauseButton.innerHTML = "pause";
    }
  });
}

function setRecTimes() {
  chrome.storage.local.get(["mostUsedTimers"], (result) => {
    let times = result.mostUsedTimers; // ["45", "45", etc]
    let uniqueTimes = new Set(times);

    if (uniqueTimes.size >= 4) {
      // get most common times
      const timesToSet = getMostCommon(times, 4);
      createPresets(timesToSet, 4);
    } else {
      // set the 4 - size number of presets
      knownTimesLength = uniqueTimes.size;

      const timesToSet = getMostCommon(times, knownTimesLength);
      createPresets(timesToSet, knownTimesLength);
    }
  });
}

function getMostCommon(arr, items) {
  // return the most common items (#) in arr
  let itemToCount = {};
  arr.map((item) => {
    if (Object.keys(itemToCount).includes(item.toString())) {
      itemToCount[item] += 1;
    } else {
      itemToCount[item] = 1;
    }
  });

  let sortedCounts = sortKeys(itemToCount);
  console.log(sortedCounts);
  let onlyKeys = [];
  sortedCounts.map((item) => {
    onlyKeys.push(item[0]);
  });
  console.log(onlyKeys)
  // only keys has keys sorted from least --> greatest
  return onlyKeys.slice(0, items);
}

function sortKeys(dict) {
  var sortable = [];
  for (var key in dict) {
    sortable.push([key, dict[key]]);
  }

  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });
  return sortable;
}

function createPresets(items, number) {
  for (var i = 0; i < number; i++) {
    let button = document.getElementById(`pre${i}`);
    console.log(items)
    if (typeof items[i] !== 'undefined') {
      button.innerHTML = items[i];
    }
    else {
      button.innerHTML = 30;
    }
  }
}

function updatePopupUI() {  
  setBackgroundColor(document.body, color.backgroundColor);
  setColor(document.querySelector(".headers h1"), color.primaryColor);
  setBackgroundColors(horizontalBars, color.primaryColor);
  setColor(timerOutput, color.timerTextColor);

  if (scheme == "minBlue") {
    setBackgroundColor(totalMinText, rgbToRgba(color.timerTextColor, 0.6));
    setBackgroundColor(document.querySelector("footer"), rgbToRgba(color.timerTextColor, 0.5));
  }
  else {
    setBackgroundColor(totalMinText, rgbToRgba(color.backgroundColor, 0.6));
  setBackgroundColor(document.querySelector("footer"), rgbToRgba(color.backgroundColor, 0.5));
  }
  

  setBackgroundColors(preList, "transparent");
  setBorders(preList, color.primaryColor);
  setColors(preList, color.primaryColor);

  setBackgroundColor(minuteInput, rgbToRgba(color.primaryColor, 0.3));

  setBorder(minuteInput, `1px solid ${rgbToRgba(color.primaryColor, 0.8)}`);

  setColor(pauseButton, color.primaryColor);
  setBorder(pauseButton, `1px solid ${color.primaryColor}`);
  setColor(resetButton, color.primaryColor);
  setBorder(resetButton, `1px solid ${color.primaryColor}`)
  setBackgroundColor(startButton,`${rgbToRgba(color.primaryColor, 0.3)}`);
  setBorder(startButton, `1px solid ${color.primaryColor}`);
  setBorder(document.body, `10px solid ${color.popupBorderColor}`)
}

function setColor(element, color) {
  element.style.color = color;
}

function setBackgroundColor(element, color) {
  element.style.background = color;
}

function setBorder(element, borderStyle) {
  element.style.border = borderStyle;
}

function setBackgroundColors(elements, color) {
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.backgroundColor = color;
  }
}

function setBorders(elements, color) {
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.border = `1px solid ${color}`;
  }
}

function setColors(elements, color) {
  for (var i = 0; i < elements.length; i++) {
    elements[i].style.color = color;
  }
}

function rgbToRgba(rgb, opacity) {
  let rgbaColor = rgb.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
  return rgbaColor
}