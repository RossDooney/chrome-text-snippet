const insertButton = document.getElementById("insert");
const getButton = document.getElementById("get");
const getAllButton = document.getElementById("getAll");
const updateButton = document.getElementById("update");
const deleteButton = document.getElementById("delete");
const snippetCode = document.getElementById("snippetCode");
const snippetText = document.getElementById("snippetText");



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
    let result = await fetchSnippets(snippet.searchString);
    console.log("Get click reslt: ", result.snippetText)

};


getAllButton.onclick = async function(){
  console.log("Get all button Clicked")
  let result = await fetchSnippets();
  
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

async function fetchSnippets() {
    return new Promise((resolve, reject) => {
      console.log("1")
      chrome.runtime.sendMessage({ event: "get_all" }, (response) => {
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