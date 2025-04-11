const createDbBtn = document.getElementById("create_db");
const deleteDbBtn = document.getElementById("delete_db");
const getAllBtn = document.getElementById("getAll");


document.addEventListener("click", async function (event) {
  const elemId = event.target.id;
  console.log(elemId)

  switch(elemId){
    case "go-to-options":
      chrome.runtime.openOptionsPage();
      return true;
    case "create_db":
      await createDatabase();
      return true;
    case "delete_db":
      console.log("1")
      await deleteDatabase();
      return true;
    default:
      return true;    
  }


  if(elemId === "go-to-options"){
    chrome.runtime.openOptionsPage();
  } else if(elemId === "create_db"){
    console.log("0")
    await createDatabase();
  }
})

async function createDatabase() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ event: "create_db"}, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

async function deleteDatabase() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ event: "delete_db"}, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
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

async function fetchAllSnippets() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ event: "get_all"}, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

async function insertSnippets(snippet) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ event: "insert", snippet}, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
}

async function updateSnippet(snippet) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ event: "update", snippet}, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

async function deleteSnippet(searchString) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ event: "delete", searchString }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}