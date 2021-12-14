chrome.runtime.onMessageExternal.addListener (function(request, sender, sendResponse) {
      console.log('Hi~')
      window.localStorage.setItem(request.words, request.name)
      console.log(request) // {greeting: "hello"}
});

console.log('hi')