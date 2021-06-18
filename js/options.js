let progNotiCheck = document.getElementById("progNoti");
let notiProgButton = document.getElementById("noti-prog-help");
let soundNotiCheck = document.getElementById("soundNoti");
let soundNotiButton = document.getElementById("noti-sound-help");
let siteBlockingCheck = document.getElementById("siteBlocking");
let siteBlockingButton = document.getElementById("site-blocking-help");

let notiSoundType = document.getElementById("notiSoundType");
let notiSoundTypeButton = document.getElementById("noti-sound-type-help");

let colorScheme = document.getElementById("color-scheme");

console.log(notiSoundTypeButton);

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

    console.log(userStored);
    console.log(pureName);

    var selectOptions = select.options.length;
    for (var i = 0; i < selectOptions; i++) {
      if (select.options[i].value == pureName) {
        select.options[i].selected = true;
        break;
      }
    }
  });

  chrome.storage.local.get(['colorScheme'], (result) => {
    const scheme = result.colorScheme;
    if (scheme == "default") {
      updateUIDefault();
    }
    else if (scheme == "minBlue") {
      updateUIBlue();
    }

    let styleSelect = document.getElementById("color-scheme");
    var selectOptions = styleSelect.options.length;
    for (var i = 0; i < selectOptions; i++) {
      if (styleSelect.options[i].value == scheme) {
        styleSelect.options[i].selected = true;
        break;
      }
    }
    const color = scheme == "default" ? "#339a25" : "#000080"
    updateSelectBackground("color-scheme", color)
  })
}

init();
// event listeners for changing and clicking help texts
progNotiCheck.addEventListener("change", function () {
  // sets if the user wants notifications or not
  chrome.storage.local.get(["progNoti"], function (result) {
    if (result.progNoti) {
      chrome.storage.local.set({ progNoti: false }, () => {
        console.log("SET TO FALSE");
      });
    } else {
      chrome.storage.local.set({ progNoti: true }, () => {
        console.log("SET TO True");
      });
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
      chrome.storage.local.set({ siteBlocking: false });
    } else {
      chrome.storage.local.set({ siteBlocking: true });
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
  console.log("CLK");
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
  chrome.storage.local.set({
    colorScheme: scheme,
  });
  if (scheme == "minBlue") {
    updateUIBlue();
  }
  else if (scheme == "default") {
    updateUIDefault();
  }
  // update this page to match
})

function updateUIBlue() {
  console.log("BLUE")
  document.body.style.background = "#CEE7F0";
  document.getElementById("sub-header").style.color = "#595757";
  updateSelectBackground("color-scheme", "#000080")
  setStandOutText("#000080");
}

function updateUIDefault() {
  // reset back to default
  console.log("WHITE")
  document.body.style.background = "";
  document.getElementById("sub-header").style.color = ""
  updateSelectBackground("color-scheme", "#339a25")
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
  console.log(color)
}

/*
BLUE UI
Primary Pink/Red: #CEE7F0

  POPUP TITLE: #000080
  Other text: #595757

  FORM INPUT: [Primary pink/red], Opacity 0.2
  PRESET & START BUTTONS: [Primary pink/red], Opacity 0.5

  FOOTER 
    -total minutes bkg: #fb7aa1, Opacity 0.5

*/