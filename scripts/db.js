let db = null;

async function open_db(open_db_callback, callback_params = []){
    return new Promise((resolve, reject) => {
      if (db){
        console.log("db already open: ", db);
        if(open_db_callback){
          Promise.resolve(open_db_callback(...callback_params)).then(resolve).catch(reject);
        } else{
          resolve();
        }
      }
      const request = indexedDB.open('testDB',1);
      request.onerror = function(event){
        reject(event.target.error); 
      }
      request.onupgradeneeded = function(event){
        db = event.target.result;
        console.log("onupgrade called")
        setup_schema();
      };
  
      request.onsuccess = function (event) {
        db = event.target.result;
        if(open_db_callback){
          Promise.resolve(open_db_callback(...callback_params)).then(resolve).catch(reject);
        } else{
          resolve();
        }
      };
    });
}

export async function insert_snippets(snippets){
  if (!db) {
    console.log("Database is not initialized, opening...");
    await open_db();
  }

  const insert_transaction = db.transaction("snippets", "readwrite");
  const objectStore = insert_transaction.objectStore("snippets");
  const currentDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");

  return new Promise((resolve, reject) => {
    insert_transaction.oncomplete = function() {
      console.log("All snippets inserted successfully.");
      resolve(); 
    };
    insert_transaction.onerror = function(event) {
      console.error("Transaction error:", event.target.error);
      reject(event.target.error); 
    };
    if(Array.isArray(snippets)){
      snippets.forEach(snippet => {
        snippet.timesUsed = 0;
        snippet.lastUsed = currentDateTime;
        snippet.lastUpdated = currentDateTime;
        objectStore.add(snippet)
      })
    }
    else{
      snippets.timesUsed = 0;
      snippets.lastUsed = currentDateTime;
      snippets.lastUpdated = currentDateTime;
      objectStore.add(snippets)
    }
  });
}

export async function get_snippet(snippetCode){
  if (!db) {
    console.log("Database is not initialized, opening...");
    await open_db();
  }
  const get_transaction = db.transaction("snippets", "readonly");
  const objectStore = get_transaction.objectStore("snippets");
  const request = objectStore.get(snippetCode);

  return await new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result) {
        resolve(result);
      } else {
        console.log("Snippet not found.");
        reject(null);
      }
    };
    request.onerror = (event) => {
      console.error("Failed to get snippet.", event);
      reject(event);
    };
  });
}

export async function fetch_all_snippets(){
  if (!db) {
    console.log("Database is not initialized, opening...");
    await open_db();
  }
  const get_transaction = db.transaction("snippets", "readonly");
  const objectStore = get_transaction.objectStore("snippets");

  return new Promise((resolve, reject) => {
    const request = objectStore.getAll();

    request.onerror = function(){
      reject("Unable to find records")
    }
    request.onsuccess = function(event){
      const result = event.target.result;
      if(result){
        resolve(result);
      }else{
        resolve([]);
      }
    }
  })
  
}

export async function search_keys(snippetCode){

  if (!db) {
    console.log("Database is not initialized, opening...");
    await open_db();
  }

  const search_transaction = db.transaction("snippets", "readonly");
  const objectStore = search_transaction.objectStore("snippets");
  const keys = []
  
  return new Promise((resolve, reject) => {
    search_transaction.onerror = function(){
      console.log("There was an error getting records.");
      reject(undefined);
    }

    objectStore.openCursor().onsuccess = function(event) {
      const cursor = event.target.result;
      if(cursor){
        if(cursor.key.toString().startsWith(snippetCode)){
          keys.push({snippetCode: cursor.key, snippetText: cursor.value.snippetText});          
        }
        cursor.continue();
      } else{
        resolve(keys);
      }
    }
  });
}

export async function update_snippet(snippet){
  if (!db) {
    console.log("Database is not initialized, opening...");
    await open_db();
  }
  snippet.lastUpdated = new Date().toISOString().slice(0, 19).replace("T", " ")
  if(snippet.timesUsed === undefined || snippet.lastUsed === undefined || snippet.timesUsed === undefined){
    const snippet_data = await fetchSnippet(snippet.snippetCode);
    if(snippet_data){
      snippet.timesUsed = snippet_data.timesUsed;
      snippet.lastUsed = snippet_data.lastUsed;
      snippet.timesUsed = snippet_data.timesUsed;
    }else{
      return true;
    }
  }

  const put_transaction = db.transaction("snippets", "readwrite");
  const objectStore = put_transaction.objectStore("snippets");
  const update_request = objectStore.put(snippet)
  return new Promise((resolve, reject) => {
    update_request.onsuccess = function() {
      console.log("Snippet updated");
      resolve(); 
    };
    update_request.onerror = function(event){
      console.log("Update failed for snippet: ", snippet);
      reject(event.target.error);
    };
    put_transaction.onerror = function(event){
      console.error("Transaction error:", event.target.error);
    };
  });
}

export async function snippet_used(snippet){

  if (!db) {
    console.log("Database is not initialized, opening...");
    await open_db();
  }

  const put_transaction = db.transaction("snippets", "readwrite");
  const objectStore = put_transaction.objectStore("snippets");

  return new Promise((resolve, reject) => {
    put_transaction.onerror = function(){
      reject("There was an error updating.");
    }

    put_transaction.onsuccess = function(){
      resolve();
    }
    
    if(!snippet.timesUsed){
      snippet.timesUsed = 0;
    }

    snippet.timesUsed += 1;
    snippet.lastUsed = new Date().toISOString().slice(0, 19).replace("T", " ")
    objectStore.put(snippet)
  });
}

export async function delete_snippet(snippetCode){
  if (!db) {
    console.log("Database is not initialized, opening...");
    await open_db();
  }
  
  const delete_transaction = db.transaction("snippets", "readwrite");
  const objectStore = delete_transaction.objectStore("snippets");
  const delete_request = objectStore.delete(snippetCode)

  return new Promise((resolve, reject) => {
    delete_request.onsuccess = function(){
      resolve(snippetCode);
    }
    delete_request.onerror = function(event) {
      console.log("Error deleting snippet", event);
      reject("There was an error deleting: " + snippetCode);
    };

    delete_transaction.onerror = function(event) {
      console.error("Transaction error", event);
    };
  });
}

export async function fetchSnippet(searchString) {
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