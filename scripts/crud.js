const insertButton = document.getElementById("insert");
const getButton = document.getElementById("get");
const updateButton = document.getElementById("update");
const deleteButton = document.getElementById("delete");
const createDbBtn = document.getElementById("create_db");
const deleteDbBtn = document.getElementById("delete_db");
const snippetCode = document.getElementById("snippetCode");
const snippetText = document.getElementById("snippetText");

document.querySelector('#go-to-options').addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

createDbBtn.onclick = async function(){
  let result = await createDatabase();
  console.log("Create DB click result: ", result)
};

deleteDbBtn.onclick = async function(){
  let result = await deleteDatabase();
  console.log("Delete DB click result: ", result)
};


insertButton.onclick = async function(){
    const snippet = {
        snippetCode: snippetCode.value,
        snippetText: snippetText.value
    }
    let result = await insertSnippets(snippet);
    console.log("Insert click result: ", result)
};

getButton.onclick = async function(){
    const snippet = {
        searchString: snippetCode.value,
        snippetText: snippetText.value
    }
    let result = await fetchSnippet(snippet.searchString);
    console.log("Get click reslt: ", result.snippetText)

};


updateButton.onclick = async function() {
    const snippet = {
      snippetCode: snippetCode.value,
      snippetText: snippetText.value
    }
    let result = await updateSnippet(snippet);
    console.log("Update click result: ", result)
};

deleteButton.onclick = async function() {
    const snippet = {
      searchString: snippetCode.value,
     snippetText: snippetText.value
    }
    let result = await deleteSnippet(snippet.searchString);
    console.log("Delete click reslt: ", result.snippetText)
};

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