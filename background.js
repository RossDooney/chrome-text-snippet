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


// chrome.commands.onCommand.addListener((command) => {
//     if (command === "insert_snippet") {
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         chrome.scripting.executeScript({
//           target: { tabId: tabs[0].id },
//           function: insertText
//         });
//       });
//     }
//   });

chrome.runtime.onMessage.addListener((data, sender, sendResponse) =>{
  switch(data.event){
    case "insert":
      console.log("Snippet code to insert: ", data.snippet)
      insert_snippets(data.snippet, function(snippet) {
        if(snippet){
          const {snippetCode, snippetText} = snippet
          sendResponse({ snippetCode, snippetText });
        }else{
          console.log("Error line 46")
          sendResponse({ error: "Snippet failed to insert" });
        }
      });
      return true;
    case "get":
      console.log("Snippet code to search: ", data.searchString)
      get_snippets(data.searchString, function(snippet) {
        if(snippet){
          const {snippetCode, snippetText} = snippet
          sendResponse({ snippetCode, snippetText });
        }else{
          console.log("Error line 58")
          sendResponse({ error: "Snippet not found" });
        }
      });
      return true;
    case "update":
      console.log("Snippet code to Update: ", data.snippet)
      update_snippet(data.snippet, function(snippet) {
        if(snippet){
          const {snippetCode, snippetText} = snippet
          sendResponse({ snippetCode, snippetText });
        }else{
          console.log("Error line 70")
          sendResponse({ error: "Snippet failed to update" });
        }
      });
      return true;
    case "delete":
      console.log("Snippet code to Delete: ", data.searchString)
      delete_snippet(data.searchString, function(success) {
        if(success){
          console.log("Snippet successfully deleted");
          sendResponse({ message: "Snippet successfully deleted" });
        } else {
          console.log("Error line 82");
          sendResponse({ error: "Snippet failed to delete" });
        }
      });
      return true;
    default:
      break;
  }
})

// function insertText() {
//     const snippet = "Predefined Text";
    
//     const activeElement = document.activeElement;
  
//     if (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT") {
//       activeElement.value += snippet;
//     }
// }


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

    insert_snippets(snippets_example);
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

function insert_snippets(snippets, insert_callback){
  if(db){
    const insert_transaction = db.transaction("snippets", "readwrite");
    const objectStore = insert_transaction.objectStore("snippets");

    insert_transaction.onerror = function(){
      console.log("There was an error inserting.")
    }
    
    insert_transaction.oncomplete = function(){
      console.log("Insert completed.")
    }

    if(Array.isArray(snippets)){
      snippets.forEach(snippet => {
        let request = objectStore.add(snippet)
  
        request.onsuccess = function(){
          console.log("Added ", snippet);
        }
      })
    }
    else{
      let request = objectStore.add(snippets)
  
      request.onerror = function(){
        console.log("unable to add snippet");
      }
  
      request.onsuccess = function(event){
        result = event.target.result
        insert_callback(event.target.result);
      }
    }
  }
  else {
    console.log("Database is not initialized");
    insert_callback(undefined); 
  }
}

function get_snippets(snippetCode, get_callback){
  if(db){
    const get_transaction = db.transaction("snippets", "readonly");
    const objectStore = get_transaction.objectStore("snippets");
    get_transaction.onerror = function(){
      console.log("There was an error getting records.")
    }
    
    get_transaction.oncomplete = function(){
      console.log("Get completed.")
    }

    let request = objectStore.get(snippetCode);

    request.onerror = function(){
      console.log("unable to find snippet");
    }

    request.onsuccess = function(event){
      result = event.target.result
      if(result){
        get_callback(event.target.result);
      }else{
        console.log("Not founds")
        get_callback(undefined)
      }
    }
  }
  else {
    console.log("Database is not initialized");
    get_callback(undefined)
  }
}

function update_snippet(snippet, update_callback){
  if(db){
    const put_transaction = db.transaction("snippets", "readwrite");
    const objectStore = put_transaction.objectStore("snippets");

    put_transaction.onerror = function(){
      console.log("There was an error updating.")
    }
    
    put_transaction.oncomplete = function(){
      console.log("Update completed.")
    }

    let request = objectStore.put(snippet)
  
    request.onerror = function(){
      console.log("unable to update snippet");
    }
  
    request.onsuccess = function(event){
      result = event.target.result
      update_callback(event.target.result);
    }
  }
  else {
    console.log("Database is not initialized");
    update_callback(undefined); 
  }
}

function delete_snippet(snippetCode, delete_callback){
  if(db){
    const delete_transaction = db.transaction("snippets", "readwrite");
    const objectStore = delete_transaction.objectStore("snippets");

    delete_transaction.onerror = function(){
      console.log("There was an error deleting.")
    }
    
    delete_transaction.oncomplete = function(){
      console.log("Delete completed.")
    }

    let request = objectStore.delete(snippetCode)
  
    request.onerror = function(){
      console.log("unable to delete snippet");
      delete_callback(false);
    }
  
    request.onsuccess = function(event){
      console.log("Snippet successfully deleted.");
      delete_callback(true);
    }
  }
  else {
    console.log("Database is not initialized");
    delete_callback(false); 
  }
}

delete_database();
create_database();