let running;
blockSite = function () {
  var url = window.location.href;
  document.documentElement.innerHTML = `Come on.... no going on ${url} while you are studying!!`;
};

chrome.storage.local.get(["running"], function (result) {
  running = result.running;
  if (running) {
    chrome.storage.local.get(["siteBlocking"], function (result) {
      if (result.siteBlocking) {
        blockSite();
      } else {
        console.log("TURN SITE BLOCKING ON LOL NO CHEATING");
      }
    });
  }
});
