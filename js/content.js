let running;
findAllURL = function (urls) {
  var current = window.location.href;
  let indexBlock;
  for (let i = 0; i < urls.length; i++) {
    if (current.startsWith(urls[i])) {
      document.documentElement.innerHTML = `Come on.... no going on ${urls[i]} while you are studying!!`;
    }
  }
};

chrome.storage.local.get(["running"], function (result) {
  running = result.running;
  chrome.storage.local.get(["siteBlocking"], function (result) {
    // console.log("BLOCKING: " + result.siteBlocking)
    if (result.siteBlocking) {
      console.log("RNNING2: " + running);
      if (running) {
        findAllURL([
          "https://www.instagram.com/",
          "https://www.facebook.com/",
          "https://www.reddit.com/",
          "https://www.whatsapp.com/",
          "https://www.messenger.com/",
          "https://www.wechat.com/",
          "https://www.tumblr.com/",
          "https://www.pinterest.com/",
        ]);
      }
    } else {
      console.log("TURN SITE BLOCKING ON LOL NO CHEATING");
    }
  });
  console.log(result.running);
});
