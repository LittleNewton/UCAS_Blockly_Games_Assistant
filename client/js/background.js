chrome.runtime.onConnectExternal.addListener(function(port) {
      console.assert(port.name === "BG_Extension");
      port.onMessage.addListener(function(msg) {
            if (msg.joke === "Knock knock") {
                  console.log(msg.joke)
                  port.postMessage({question: "Who's there?"});
            } else if (msg.answer === "Madame") {
                  console.log(msg.answer)
                  port.postMessage({question: "Madame who?"});
            } else if (msg.answer === "Madame... Bovary") {
                  console.log(msg.answer)
                  port.postMessage({question: "I don't get it."});
            }
      });
});
