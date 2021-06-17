let timerInfo = {
    minutes: "",
    secRemain: "",
    secComplete: 0
};
let interval; // interval ID for the countdown
let paused = false; // bool for paused or not
let totalMin;
let progNoti;
let notiOne = false;
let notiTwo = false;
let notiThree = false;
let soundNoti = true;
let notiSoundUrl;

chrome.runtime.onInstalled.addListener(() => {
  // set how many minutes the user has studied so far only once, on installation.
  chrome.storage.local.set({
      totalMinStudy: 0
  });
  chrome.storage.local.set({
      paused: false
  });
  chrome.storage.local.set({
      progNoti: true
  });
  chrome.storage.local.set({
      soundNoti: true
  });

  chrome.storage.local.set({
      siteBlocking: true
  });

  chrome.storage.local.set({
    notiSoundUrl: "./audio/default.wav"
});
})

chrome.runtime.onStartup.addListener(function () {
  // when the browser closes and opens
  chrome.storage.local.set({
      running: false
  });
});

chrome.storage.local.set({
    timeLeft: "Start a timer below"
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === "pauseTimer") {
        paused = paused ? false : true;
        sendResponse({
            data: "timerPaused"
        });
    } else if (request.method === "resetTimer") {
        timerInfo.secComplete = 0;
        timerInfo.secRemain = 0;
        sendResponse({
            data: "timerReset"
        });
        clearInterval(interval);
    }

    if (request.method === "startTimer") {
        // user clicked "start" button for timer
        timerInfo.minutes = request.data
        startTimer(timerInfo.minutes)
        sendResponse({
            data: timerInfo.secRemain
        });
        paused = false;
    } else if (request.method === "getTimeLeft") {
        // user clicked on popup
        if (interval) {
            // if a timer is already ongoing, send back how many seconds left
            sendResponse({
                data: timerInfo.secRemain
            });
        } else {
            // no timer going, send back message prompting user to start timer
            sendResponse({
                data: "Start a timer below"
            })
        }
    }
});

function startTimer(minutes) {
    if (interval) {
        clearInterval(interval);
    }

    timerInfo.secRemain = seconds = minutes * 60; // seconds remaining
    interval = setInterval(function() {
        console.log(timerInfo.secComplete)
        if (timerInfo.secRemain <= 0) {
            // timer has reached 0
            timerInfo.secComplete = 0;
            timerInfo.secRemain = 0;
            clearInterval(interval);
            sendDoneNoti();
            // total minutes the user has studied
            chrome.storage.local.get(['totalMinStudy'], function(result) {
                totalMin = parseFloat(result.totalMinStudy) + parseFloat(timerInfo.minutes);

                chrome.storage.local.set({
                    totalMinStudy: totalMin
                });
            });
            chrome.storage.local.set({
                timeLeft: "timerDone"
            });
            chrome.storage.local.set({
                running: false
            });
            return;
        }

        // createProgNoti();
        createProgNoti()

        chrome.storage.local.set({
            timeLeft: timerInfo.secRemain
        });
        if (!paused) {
            timerInfo.secRemain -= 1; // decreasing timer remaining seconds
            timerInfo.secComplete += 1;
        }
        chrome.storage.local.set({
            running: true
        });
    }, 1000)

    chrome.storage.local.get(['progNoti'], function(result) {
      console.log("MIN: " + timerInfo.minutes)
      if (parseFloat(timerInfo.minutes) >= 0.1) {
          // DEV change to 30 min when release
          progNoti = result.progNoti;
          console.log(progNoti)
      }
      else {
        progNoti = false;
      }
      // progNoti stores whether or not the user wants progress notifications
       notiOne = false;
       notiTwo = false;
       notiThree = false;
    });

    chrome.storage.local.get(['soundNoti'], (result) => {
      soundNoti = result.soundNoti;
    })


}

function round2(num) {
    return Math.round(num * 100) / 100;
}

function createPercent(decimal) {
  return round2(decimal * 100);
}

function playSound() {
  // get url from storage and play
  chrome.storage.local.get(['notiSoundUrl'], (result)=> {
    const audio = new Audio(result.notiSoundUrl);
    audio.play();
  })
  
}

function createProgNoti() {
  if (progNoti) {
    let percentDone = createPercent(timerInfo.secComplete/(timerInfo.minutes*60));

    if (percentDone > 95) {
      if (!notiOne) {
        sendNoti(95)
        notiOne = true;
      }
    }
    else if (percentDone > 75) {
      if (!notiTwo) {
        sendNoti(75)
        notiTwo = true;
      }
    }
    else if (percentDone > 50) {
      if (!notiThree) {
        sendNoti(50)
        notiThree = true;
      }
    }
  }
}

function sendNoti(percentUse) {
  let title;
  title = `${percentUse}% done with ${round2(timerInfo.minutes)} minute timer!`

    fetch("https://type.fit/api/quotes")
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        let index = Math.floor(Math.random() * 1500 + 0);
        quote = data[index].text;
        console.log("SENDING NOTI")
        chrome.notifications.create('progress', {
            type: "basic",
            iconUrl: 'img/favicon48.png',
            title: title,
            message: quote,
            priority: 2
        });
      })
}

function sendDoneNoti() {
  chrome.notifications.create('complete', {
      type: 'progress',
      'progress': 100,
      iconUrl: 'img/favicon48.png',
      title: `Focale ${round2(timerInfo.minutes)} minute timer complete! `,
      message: getRestTime(timerInfo.minutes),
      priority: 2
  });
  if (soundNoti) {
      playSound();
  }
}

function getRestTime(studyTime) {
  switch (true) {
    case (studyTime < 5):
      return "No break, set another timer!";
    case (studyTime < 20):
      return "Take a 2 minute break!";
    case (studyTime < 40):
      return "Take a 5 minute break!";
    case (studyTime == 52):
      return "Take a 17 minute break!";
    case (studyTime < 55):
      return "Take a 10 minute break!";
    case (studyTime < 70):
      return "Take a 15 minute break!";
    default:
      return "Take a 25 minute break!"
  }
}
