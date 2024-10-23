chrome.tabs.onUpdated.addListener((tabId, changeInfo, )=>{
    if(changeInfo.status === "complete"){
        chrome.scripting.executeScript({
            target: {tabId},
            files: ["./content.js"]
        }).then(() =>{
            console.log("content script injected")
        }).catch(err => console.log(err, "error injecting script"))
    }
})


chrome.commands.onCommand.addListener((command) => {
    if (command === "insert_snippet") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: insertText
        });
      });
    }
  });
  
  // Define the text snippet you want to insert
  function insertText() {
    const snippet = "Predefined Text";
    
    const activeElement = document.activeElement;
  
    if (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT") {
      activeElement.value += snippet;
    }
  }