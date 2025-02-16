// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === "complete") {

//     if (tab.url && tab.url.startsWith("chrome-extension://")) {
//       console.log("Skipping Chrome extension page:", tab.url);
//       return;
//     }
//     chrome.scripting.executeScript({
//         target: { tabId: tabId },
//         func: () => !!window.isScriptInjected
//     }).then((results) => {
//         if (results[0].result) {
//             console.log("content.js already injected");
//             return;
//         }
//         chrome.scripting.executeScript({
//             target: { tabId: tabId },
//             files: ["./scripts/content.js", "./css/modal.css"]
//         }).then(() => {
//             chrome.scripting.executeScript({
//                 target: { tabId: tabId },
//                 func: () => { window.isScriptInjected = true; }
//             });

//             console.log("content script injected");
//         }).catch(err => console.log(err, "error injecting script"));
//     }).catch(err => console.log(err, "error checking script"));
//   }
// });

chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
  try {
    switch (data.event) {
      case "open_db":
        try {
          open_db(function (error) {
            if (error) {
              sendResponse({ error: "DB connection failed to open" });
            } else {
              sendResponse({ message: "DB connection opened" });
            }
          });
        } catch (error) {
          console.error("Error in open_db:", error);
          sendResponse({ error: "An unexpected error occurred in open_db" });
        }
        return true;

      case "get":
        console.log("Snippet code to search: ", data.searchString);
        try {
          get_snippet(data.searchString, function (snippet) {
            if (snippet) {
              sendResponse(snippet);
            } else {
              sendResponse({ error: "Snippet not found" });
            }
          });
        } catch (error) {
          console.error("Error in get:", error);
          sendResponse({ error: "An unexpected error occurred in get" });
        }
        return true;

      case "snippetUsed":
        try {
          snippet_used(data.snippet);
          sendResponse({ message: "Snippet usage updated" });
        } catch (error) {
          console.error("Error in snippetUsed:", error);
          sendResponse({ error: "An unexpected error occurred in snippetUsed" });
        }
        return true;

      case "insert":
        console.log("Snippet code to insert: ", data.snippet);
        try {
          insert_snippets(data.snippet, function (snippet) {
            if (snippet) {
              sendResponse(snippet);
            } else {
              sendResponse({ error: "Snippet failed to insert" });
            }
          });
        } catch (error) {
          console.error("Error in insert:", error);
          sendResponse({ error: "An unexpected error occurred in insert" });
        }
        return true;

      case "update":
        console.log("Snippet code to Update: ", data.snippet);
        try {
          update_snippet(data.snippet, function (snippet) {
            if (snippet) {
              sendResponse(snippet);
            } else {
              sendResponse({ error: "Snippet failed to update" });
            }
            return true;
          });
        } catch (error) {
          console.error("Error in update:", error);
          sendResponse({ error: "An unexpected error occurred in update" });
        }
        return true;

      case "delete":
        console.log("Snippet code to Delete: ", data.searchString);
        try {
          delete_snippet(data.searchString, function (success) {
            if (success) {
              sendResponse({ message: "Snippet successfully deleted" });
            } else {
              sendResponse({ error: "Snippet failed to delete" });
            }
          });
        } catch (error) {
          console.error("Error in delete:", error);
          sendResponse({ error: "An unexpected error occurred in delete" });
        }
        return true;

      case "get_all":
        console.log("Getting all snippets");
        try {
          fetch_all_snippets(function (snippets) {
            if (snippets) {
              sendResponse(snippets);
            } else {
              sendResponse({ error: "Snippet not found" });
            }
          });
        } catch (error) {
          console.error("Error in get_all:", error);
          sendResponse({ error: "An unexpected error occurred in get_all" });
        }
        return true;

      case "create_db":
        console.log("Creating DB");
        try {
          create_database(function (error) {
            if (error) {
              console.error("Database creation failed:", error);
              sendResponse({ error: "Database creation failed" });
            } else {
              sendResponse({ message: "DB created" });
            }
          });
        } catch (error) {
          console.error("Error in create_db:", error);
          sendResponse({ error: "An unexpected error occurred in create_db" });
        }
        return true;

      case "delete_db":
        console.log("Deleting the database");
        try {
          delete_database(function (error) {
            if (error) {
              console.error("Database deletion failed:", error);
              sendResponse({ error: "Database deletion failed" });
            } else {
              sendResponse({ message: "DB deleted" });
            }
          });
        } catch (error) {
          console.error("Error in delete_db:", error);
          sendResponse({ error: "An unexpected error occurred in delete_db" });
        }
        return true;

      default:
        console.warn("Unhandled event:", data.event);
        sendResponse({ error: "Unhandled event type" });
        return true;
    }
  } catch (error) {
    console.error("Unexpected error in onMessage listener:", error);
    sendResponse({ error: "An unexpected error occurred in the onMessage listener" });
    return true;
  }
});

let db = null

function create_database(create_db_callback){
  const request = indexedDB.open('testDB',1);

  request.onerror = function(event){
    console.log("unable to open db", event.target.error);
    if(create_db_callback){
      create_db_callback(new Error("Database open failed"));
    }
  }

  request.onupgradeneeded = function(event){

    db = event.target.result;

    if (!db.objectStoreNames.contains('snippets')) {
      const objectStore = db.createObjectStore('snippets', { keyPath: "snippetCode" });
      objectStore.transaction.oncomplete = function () {
        console.log("Object store 'snippets' created successfully.");
      };

      objectStore.transaction.onerror = function (event) {
        console.error("Failed to create object store:", event.target.error);
      };
    } else {
      console.log("Object store 'snippets' already exists.");
    }
  };
  request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Database opened successfully.");
    if (create_db_callback) {
      create_db_callback(null, event.target.result); 
    }
  };
}

async function open_db(open_db_callback, callback_params = []){
  return new Promise((resolve, reject) => {
    if (db){
      console.log("db already open: ", db);
      if(open_db_callback){
        open_db_callback(...callback_params);
      }
      resolve();
      return;
    }
    const request = indexedDB.open('testDB',1);
    request.onerror = function(event){
      reject(event.target.error); 
    }

    request.onsuccess = function (event) {
      db = event.target.result;
      if(open_db_callback){
        if(callback_params){
          open_db_callback(...callback_params);
        }
      }
      resolve();
    };
  });
}

function delete_database(delete_db_callback){
  db.close();
  const request = indexedDB.deleteDatabase('testDB');

  request.onerror = function(){
    delete_db_callback(new Error("Database failed to delete"));
  }

  request.onblocked = function () {
    delete_db_callback(new Error("Database failed to delete, ensure all connections are closed"));
  };

  request.onsuccess = function(event){
    db = event.target.result;
    console.log("DB Deleted")
    delete_db_callback();
  }
}

async function insert_snippets(snippets, insert_callback){
  if(db){
    const insert_transaction = db.transaction("snippets", "readwrite");
    const objectStore = insert_transaction.objectStore("snippets");

    insert_transaction.onerror = function(){
      console.log("There was an error inserting.")
    }
    
    if(Array.isArray(snippets)){
      snippets.forEach(snippet => {
        snippet.timesUsed = 0;
        snippet.lastUsed = new Date().toISOString().slice(0, 19).replace("T", " ")
        snippet.lastUpdated = new Date().toISOString().slice(0, 19).replace("T", " ")
        let request = objectStore.add(snippet)
  
        request.onsuccess = function(){
          console.log("Added ", snippet);
        }
      })
    }
    else{
      snippets.timesUsed = 0;
      snippets.lastUsed = new Date().toISOString().slice(0, 19).replace("T", " ")
      snippets.lastUpdated = new Date().toISOString().slice(0, 19).replace("T", " ")
      let request = objectStore.add(snippets)
  
      request.onerror = function(event){
        console.log("unable to add snippet: ", event.target.error);
      }

      request.onsuccess = function(event){
        insert_callback(snippets);
      }
    }
  }
  else {
    console.log("Database is not initialized");
    await open_db(insert_snippets, [snippets, insert_callback]);
  }
}

async function get_snippet(snippetCode, get_callback){
  if(db){
    const get_transaction = db.transaction("snippets", "readonly");
    const objectStore = get_transaction.objectStore("snippets");
    get_transaction.onerror = function(){
      console.log("There was an error getting records.")
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
    return true;
  }
  else {
    console.log("Database is not initialized");
    await open_db(get_snippet, [snippetCode, get_callback]);
  }
}

async function fetch_all_snippets(fetch_all_callback){
  if(db){
    const get_transaction = db.transaction("snippets", "readonly");
    const objectStore = get_transaction.objectStore("snippets");
    get_transaction.onerror = function(){
      console.log("There was an error getting records.")
    }
    
    let request = objectStore.getAll();

    request.onerror = function(){
      console.log("unable to find snippet");
    }
    request.onsuccess = function(event){
      result = event.target.result
      if(result){
        fetch_all_callback(event.target.result);
      }else{
        console.log("Not founds")
        fetch_all_callback(undefined)
      }
    }
  }
  else {
    console.log("Database is not initialized");
    await open_db(fetch_all_snippets, [fetch_all_callback]);
  }
}

async function update_snippet(snippet, update_callback){
  if(db){
   
    snippet.lastUpdated = new Date().toISOString().slice(0, 19).replace("T", " ")
    if(snippet.timesUsed === undefined || snippet.lastUsed === undefined || snippet.timesUsed === undefined){
      const snippet_data = await fetchSnippet(snippet.snippetCode);
      if(snippet_data){
        snippet.timesUsed = snippet_data.timesUsed;
        snippet.lastUsed = snippet_data.lastUsed;
        snippet.timesUsed = snippet_data.timesUsed;
      }else{
        update_callback(undefined);
        return true;
      }
    }

    const put_transaction = db.transaction("snippets", "readwrite");
    const objectStore = put_transaction.objectStore("snippets");

    put_transaction.onerror = function(){
      console.log("There was an error updating.")
    }

    let request = objectStore.put(snippet)
  
    request.onerror = function(){
      console.log("unable to update snippet");
    }
  
    request.onsuccess = function(){
      update_callback(snippet);
    }
  }
  else {
    console.log("Database is not initialized");
    await open_db(update_snippet, [snippet, update_callback]);
  }
}

async function snippet_used(snippet){
  if(db){
    const put_transaction = db.transaction("snippets", "readwrite");
    const objectStore = put_transaction.objectStore("snippets");

    put_transaction.onerror = function(){
      console.log("There was an error updating.")
    }
    
    if(!snippet.timesUsed){
      snippet.timesUsed = 1;
    }

    snippet.timesUsed += 1;
    snippet.lastUsed = new Date().toISOString().slice(0, 19).replace("T", " ")
    let request = objectStore.put(snippet)
  
    request.onerror = function(){
      console.log("unable to update snippet");
    }
  
    request.onsuccess = function(){
      return
    }
  }
  else {
    console.log("Database is not initialized");
    await open_db(snippet_used, [snippet]);
  }
  
}

async function delete_snippet(snippetCode, delete_callback){
  if(db){
    const delete_transaction = db.transaction("snippets", "readwrite");
    const objectStore = delete_transaction.objectStore("snippets");

    delete_transaction.onerror = function(){
      console.log("There was an error deleting.")
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
    await open_db(delete_snippet, [snippetCode, delete_callback]);
  }
}

async function fetchSnippet(searchString) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ event: "get", searchString }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}