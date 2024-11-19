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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.message === 'insert'){

  }
  else if(request.message === 'insert'){

  }
  else if(request.message === 'insert'){

  }
  else if(request.message === 'insert'){

  }
})

chrome.runtime.onMessage.addListener(data =>{
  switch(data.event){
    case "insert":
      console.log("insert pressed");
      break;
    case "get":
      console.log("get pressed");
      break;
    case "update":
      console.log("update pressed");
      break;
    case "delete":
      console.log("delete pressed");
      break;    
    default:
      break;
  }
})




function insertText() {
    const snippet = "Predefined Text";
    
    const activeElement = document.activeElement;
  
    if (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT") {
      activeElement.value += snippet;
    }
}


let snippets_example = [{
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
  const request = indexedDB.open('testDB',1);

  request.onerror = function(event){
    console.log("unable to open db");
  }

  request.onupgradeneeded = function(event){
    db = event.target.result;
    let objectStore = db.createObjectStore('snippets', {
      keyPath: "snippetCode"
    });


    objectStore.transaction.oncomplete = function(event){
      console.log("Object store created");
    }
  }

  request.onsuccess = function(event){
    db = event.target.result;

    console.log("DB opened")

    insert_snippets(snippets_example)

    db.onerror = function(event){
      console.log("Failed to open DB")
    }
  }
  
}

function delete_database(){
  const request = indexedDB.deleteDatabase('testDB');

  request.onerror = function(event){
    console.log("unable to open db")
  }

  request.onsuccess = function(event){
    db = event.target.result;

    console.log("DB Deleted")
  }
}

function insert_snippets(snippet){
  if(db){
    const insert_transaction = db.transaction("snippets", "readwrite");
    const objectStore = insert_transaction.objectStore("snippets");

    insert_transaction.onerror = function(){
      console.log("There was an error inserting.")
    }
    
    insert_transaction.oncomplete = function(){
      console.log("Insert completed.")
    }


    snippets_example.forEach(snippet => {
      let request = objectStore.add(snippet)

      request.onsuccess = function(){
        console.log("Added ", snippet);
      }
    })
  }
}

function get_snippets(snippetCode){
  if(db){
    const get_transaction = db.transaction("snippets", "readonly");
    const objectStore = get_transaction.objectStore("snippets");
    console.log("asd")
    get_transaction.onerror = function(){
      console.log("There was an error getting records.")
    }
    
    get_transaction.oncomplete = function(){
      console.log("Get completed.")
    }

    let request = objectStore.get(snippetCode);

    request.onsuccess = function(event){
      console.log(event.target.result);
    }
  }
}

function update_snippe(record){
  if(db){
    const put_transaction = db.transaction("snippets", "readwrite");
    const objectStore = put_transaction.objectStore("snippets");

    put_transaction.onerror = function(){
      console.log("There was an error updating.")
    }
    
    put_transaction.oncomplete = function(){
      console.log("Update completed.")
    }

    objectStore.put(record)

  }
}

function delete_snippe(snippetCode){
  if(db){
    const delete_transaction = db.transaction("snippets", "readwrite");
    const objectStore = delete_transaction.objectStore("snippets");

    delete_transaction.onerror = function(){
      console.log("There was an error deleting.")
    }
    
    delete_transaction.oncomplete = function(){
      console.log("Delete  completed.")
    }

    objectStore.delete(snippetCode)
  }
}

delete_database()
create_database();
