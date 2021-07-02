let progNotiCheck = document.getElementById("progNoti");
let notiProgButton = document.getElementById("noti-prog-help");
let soundNotiCheck = document.getElementById("soundNoti");
let soundNotiButton = document.getElementById("noti-sound-help");
let siteBlockingCheck = document.getElementById("siteBlocking");
let siteBlockingButton = document.getElementById("site-blocking-help");

let notiSoundType = document.getElementById("notiSoundType");
let notiSoundTypeButton = document.getElementById("noti-sound-type-help");

let colorScheme = document.getElementById("color-scheme");
let colorSchemeButton = document.getElementById("color-scheme-help");

let headingColorInput = document.getElementById("heading-color");
let backgroundColorInput = document.getElementById("background-color");
let descriptionColorInput = document.getElementById("description-color");
let timerTextColorInput = document.getElementById("timerText-color");


let helpTexts = document.querySelectorAll(".help-text");
let colorKeys = {
  "minBlue": ["rgb(0, 0, 128)", "rgb(206, 231, 240)", "rgb(89, 87, 87)", "rgb(67, 135, 224)"],
  "midSpce": ["rgb(163, 163, 163)", "rgb(13, 13, 13)", "rgb(115, 115, 115)", "rgb(163, 163, 163)"],
  "noir": ["rgb(138, 191, 186)", "rgb(12, 13, 12)", "rgb(88, 115, 107)", "rgb(242, 242, 242)"],
  "neon": ["rgb(242, 56, 105)", "rgb(3, 2, 38)", "rgb(66, 43, 217)", "rgb(57, 255, 20)"],
  "custom": []
}


let color = {
  primaryColor: "",
  backgroundColor: "",
  defaultTextColor: "",
  timerTextColor: "",
};

let nameToPath = {
  default: "default.wav",
  positive: "positive.wav",
  ping: "ping.wav",
  arrival: "arrival.wav",
};

// setting user's Settings
function init() {
  chrome.storage.local.get(["progNoti", "soundNoti", "siteBlocking"], (res) => {
    progNotiCheck.checked = res.progNoti;
    soundNotiCheck.checked = res.soundNoti;
    siteBlockingCheck.checked = res.siteBlocking;
  });

  let select = document.getElementById("notiSoundType");
  let keys = Object.keys(nameToPath);

  for (var i = 0; i < keys.length; i++) {
    const option = document.createElement("option");
    option.value = keys[i];
    option.innerHTML = keys[i];
    select.appendChild(option);
  }

  chrome.storage.local.get(["notiSoundUrl"], (result) => {
    const userStored = result.notiSoundUrl;
    // ./audio/ping.wav to ping
    const pureName = userStored.substring(8, userStored.length - 4);

    var selectOptions = select.options.length;
    for (var i = 0; i < selectOptions; i++) {
      if (select.options[i].value == pureName) {
        select.options[i].selected = true;
        break;
      }
    }
  });

  chrome.storage.local.get(['colorScheme'], (result) => {
   

    // need to be able to store the each color key in storage b/c need to save custom

    const scheme = result.colorScheme[0];
    console.log(result.colorScheme)

    if (scheme[0] === "default") {
      updateUIDefault();
    }
    else if (scheme === "custom") {
      console.log('running custom')

      color.primaryColor = result.colorScheme[1][0];
      color.backgroundColor = result.colorScheme[1][1];
      color.defaultTextColor = result.colorScheme[1][2];
      color.timerTextColor = result.colorScheme[1][3];

      headingColorInput.value = color.primaryColor;
      backgroundColorInput.value = color.backgroundColor;
      descriptionColorInput.value = color.defaultTextColor;
      timerTextColorInput.value = color.timerTextColor;

    }
    else {
      console.log('running else')
      color.primaryColor = colorKeys[scheme][0];
      color.backgroundColor = colorKeys[scheme][1];
      color.defaultTextColor = colorKeys[scheme][2];    
      color.timerTextColor = colorKeys[scheme][3];  
    }

    let styleSelect = document.getElementById("color-scheme");
    var selectOptions = styleSelect.options.length;
    for (var i = 0; i < selectOptions; i++) {
      if (styleSelect.options[i].value == scheme) {
        styleSelect.options[i].selected = true;
        break;
      }
    }

    updateSelectBackground("color-scheme", color)
    if (scheme === 'default') {
      updateSelectBackground("color-scheme", "#339a25");
    }
    else {
      updateSelectBackground("color-scheme", color.primaryColor);
      updateUI();
    }
  })
}

init();
// event listeners for changing and clicking help texts
progNotiCheck.addEventListener("change", function () {
  // sets if the user wants notifications or not
  chrome.storage.local.get(["progNoti"], function (result) {
    if (result.progNoti) {
      chrome.storage.local.set({ progNoti: false });
    } else {
      chrome.storage.local.set({ progNoti: true });
    }
  });
});

notiProgButton.addEventListener("click", () => {
  let notiProgText = document.getElementById("noti-prog-text");
  if (notiProgText.classList.contains("hidden")) {
    notiProgText.classList.remove("hidden");
  } else {
    notiProgText.classList.add("hidden");
  }
});

soundNotiCheck.addEventListener("change", function () {
  chrome.storage.local.get(["soundNoti"], function (result) {
    if (result.soundNoti) {
      chrome.storage.local.set({ soundNoti: false });
    } else {
      chrome.storage.local.set({ soundNoti: true });
    }
  });
});

soundNotiButton.addEventListener("click", () => {
  let notiSoundText = document.getElementById("noti-sound-text");
  if (notiSoundText.classList.contains("hidden")) {
    notiSoundText.classList.remove("hidden");
  } else {
    notiSoundText.classList.add("hidden");
  }
});

siteBlockingCheck.addEventListener("change", function () {
  chrome.storage.local.get(["siteBlocking"], function (result) {
    if (result.siteBlocking) {
      chrome.storage.local.set({ siteBlocking: false }, () => {
        console.log("SET TO FALSE")
      });
    } else {
      chrome.storage.local.set({ siteBlocking: true }, () => {
        console.log("SET TO TRUE")
      });
    }
  });
});

siteBlockingButton.addEventListener("click", () => {
  let notiSoundText = document.getElementById("site-blocking-text");
  if (notiSoundText.classList.contains("hidden")) {
    notiSoundText.classList.remove("hidden");
  } else {
    notiSoundText.classList.add("hidden");
  }
});

notiSoundTypeButton.addEventListener("click", () => {
  let notiSoundTypeText = document.getElementById("noti-sound-type-text");
  if (notiSoundTypeText.classList.contains("hidden")) {
    notiSoundTypeText.classList.remove("hidden");
  } else {
    notiSoundTypeText.classList.add("hidden");
  }
});

notiSoundType.addEventListener("change", () => {
  const selectedFileName = notiSoundType.value;
  // play the sound
  const url = `./audio/${nameToPath[selectedFileName]}`;
  playSound(url);
  chrome.storage.local.set({ notiSoundUrl: url });
});

function playSound(url) {
  new Audio(url).play();
}

colorScheme.addEventListener("change", () => {
  const scheme = colorScheme.value // minBlue

  let arraySet = [];
  if (scheme === "custom") {
    document.querySelector('.custom-color').classList.remove("hidden");

    color.primaryColor = "#000000";
    color.backgroundColor = "#FFFFFF";
    color.defaultTextColor = "#808080";    
    color.timerTextColor = "#000000"; 

    headingColorInput.value = color.primaryColor;
    backgroundColorInput.value = color.backgroundColor;
    descriptionColorInput.value = color.defaultTextColor;
    timerTextColorInput.value = color.timerTextColor;

    arraySet = ["custom", [color.primaryColor, color.backgroundColor, color.defaultTextColor, color.timerTextColor]];
  }

  else {
    document.querySelector('.custom-color').classList.add('hidden');
    arraySet.push(scheme);
    arraySet.push(colorKeys[scheme])
  }

  chrome.storage.local.set({
    colorScheme: arraySet,
  });

  if (scheme !== "default" && scheme !== "custom") {
    color.primaryColor = colorKeys[scheme][0];
    color.backgroundColor = colorKeys[scheme][1];
    color.defaultTextColor = colorKeys[scheme][2];    
    color.timerTextColor = colorKeys[scheme][3]; 
  }
  

  if (scheme == "default") {
    updateUIDefault();
  }
  else {
    updateUI(); // updates options.html to match color change
  }
})



headingColorInput.addEventListener('input', () => {
  color.primaryColor = headingColorInput.value;

  setStorageCustom(0, color.primaryColor)

  
});

backgroundColorInput.addEventListener('input', () => {
  color.backgroundColor = backgroundColorInput.value;
  setStorageCustom(1, color.backgroundColor)
})

descriptionColorInput.addEventListener('input', () => {
  color.defaultTextColor = descriptionColorInput.value;
  setStorageCustom(2, color.defaultTextColor)
  updateUI();
})

timerTextColorInput.addEventListener('input', () => {
  color.timerTextColor = timerTextColorInput.value;
  setStorageCustom(3, color.timerTextColor)
  updateUI();
})


/*
Color format
[heading, background, description, timerText]
*/

function setStorageCustom(index, color) {
  chrome.storage.local.get(["colorScheme"], (res) => {
    let foundArr = res.colorScheme;

    foundArr[1][index] = color;
    console.log(foundArr)

    chrome.storage.local.set({ colorScheme: foundArr });
  });
  updateUI();

}


colorSchemeButton.addEventListener('click', () => {
  let colorSchemeText = document.getElementById("color-scheme-text");
  if (colorSchemeText.classList.contains("hidden")) {
    colorSchemeText.classList.remove("hidden");
  } else {
    colorSchemeText.classList.add("hidden");
  }
});


function updateUI() {
  document.body.style.background = color.backgroundColor;
  document.getElementById("sub-header").style.color = color.defaultTextColor;
  updateSelectBackground("color-scheme", color.primaryColor)
  changeHelpTexts(helpTexts, color.primaryColor);
  setStandOutText(color.primaryColor);
}

function updateUIDefault() {
  // reset back to default
  document.body.style.background = "";
  document.getElementById("sub-header").style.color = ""
  updateSelectBackground("color-scheme", "#339a25")
  changeHelpTexts(helpTexts, "")
  setStandOutText("white");
}

function setStandOutText(color) {
  const elementsToSet = document.querySelectorAll('.stand-out-text');

  for (var i=0; i<elementsToSet.length; i++) {
    elementsToSet[i].style.color = color
  }
}

function updateSelectBackground(element, color) {
  document.getElementById(element).style.backgroundColor = color;
}

function changeHelpTexts(helpTexts, color) {
  for (var i=0; i<helpTexts.length; i++) {
    helpTexts[i].style.color = color;
  }
}

