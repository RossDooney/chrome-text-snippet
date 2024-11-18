chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
      chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => !!window.isScriptInjected
      }).then((results) => {
          if (results[0].result) {
              console.log("content.js already injected");
              return;
          }
          chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ["./scripts/content.js"]
          }).then(() => {
              chrome.scripting.executeScript({
                  target: { tabId: tabId },
                  func: () => { window.isScriptInjected = true; }
              });
              console.log("content script injected");
          }).catch(err => console.log(err, "error injecting script"));
      }).catch(err => console.log(err, "error checking script"));
  }
});


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

function insertText() {
    const snippet = "Predefined Text";
    
    const activeElement = document.activeElement;
  
    if (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT") {
      activeElement.value += snippet;
    }
}

chrome.runtime.onMessage.addListener(data =>{
  const {event, snippet} = data
  switch(event){
    case "onStop":
      console.log("stop pressed");
      break;
    case "onStart":
      handleSave(snippet)
      break;
    default:
      break;
  }
})

const handleSave = (snippet) =>{
  const {snippetCode, snippetText} = snippet
  console.log("start pressed: ",  snippetText);
  chrome.storage.local.set(snippet)
}


let snippets = [{
  "snippetCode": "hi",
  "snippetText": "Hello, thank you for contacting us"
},
{
  "snippetCode": "bye",
  "snippetText": "best regards"
},
]

let db = null

function create_database(){
  const request = window.indexedDB.open('testDB');

  request.onerror = function(event){
    console.log("unable to open db")
  }

  request.onupgradeneeded = function(event){
    db = event.target.result;
    let objectStore = db.createObjectStore('snippet', {
      keypath: "snippetCode"
    });

    objectStore.transaction.oncomplete = function(event){
      console.log("Object store created");
    }
  }

  request.onsuccess = function(event){
    db = event.target.result;

    console.log("DB opened")
  }

}

function delete_database(){
  const request = window.indexedDB.deleteDatabase('testDB');

  request.onerror = function(event){
    console.log("unable to open db")
  }

  request.onsuccess = function(event){
    db = event.target.result;

    console.log("DB Deleted")
  }
}

function insert_snippet(snippet){
  if(db){
    const insert_transaction = db.transaction("snippets", "readwrite");
    const objectStore = insert_transaction.objectStore("snippets");

    insert_transaction.oncomplete = function

    snippets.forEach(snippet => {
      let request = objectStore.add(snippet)

      request.onsuccess = function(){
        console.log("AddedL ", snippet);
      }
    })
  }
}