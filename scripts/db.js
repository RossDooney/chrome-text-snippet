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
        snippet.lastUsed = new Date().toISOString().slice(0, 19).replace("T", " ")
        snippet.lastUpdated = new Date().toISOString().slice(0, 19).replace("T", " ")
        objectStore.add(snippet)
      })
    }
    else{
      snippets.timesUsed = 0;
      snippets.lastUsed = new Date().toISOString().slice(0, 19).replace("T", " ")
      snippets.lastUpdated = new Date().toISOString().slice(0, 19).replace("T", " ")
      objectStore.add(snippets)
    }
  });
}

export async function get_snippet(snippetCode, get_callback){
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
      const result = event.target.result
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
        console.log("1")
        resolve(result);
      }else{
        resolve([]);
      }
    }
  })
  
}

export async function search_keys(snippetCode, search_keys_callback){
  if(db){   
    const search_transaction = db.transaction("snippets", "readonly");
    const objectStore = search_transaction.objectStore("snippets");
    const keys = []
    
    search_transaction.onerror = function(){
      console.log("There was an error getting records.");
      search_keys_callback(undefined);
    }

    objectStore.openCursor().onsuccess = function(event) {
      const cursor = event.target.result;
      if(cursor){
        if(cursor.key.toString().startsWith(snippetCode)){
          keys.push({snippetCode: cursor.key, snippetText: cursor.value.snippetText});          
        }
        cursor.continue();
      } else{
        search_keys_callback(keys);
      }
    }

    return true
  }
  else {
    console.log("Database is not initialized");
    try{
      await open_db(search_keys, [snippetCode, search_keys_callback]);
    } catch(error){
      console.error("Error in open_db:", error.message);
    }
  }
}

export async function update_snippet(snippet, update_callback){
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

export async function snippet_used(snippet){
  if(db){
    const put_transaction = db.transaction("snippets", "readwrite");
    const objectStore = put_transaction.objectStore("snippets");

    put_transaction.onerror = function(){
      console.log("There was an error updating.")
    }
    
    if(!snippet.timesUsed){
      snippet.timesUsed = 0;
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

export async function delete_snippet(snippetCode, delete_callback){
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
  
    request.onsuccess = function(){
      console.log("Snippet successfully deleted.");
      delete_callback(true);
    }
  }
  else {
    console.log("Database is not initialized");
    await open_db(delete_snippet, [snippetCode, delete_callback]);
  }
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