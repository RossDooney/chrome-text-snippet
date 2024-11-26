const insertButton = document.getElementById("insert");
const getButton = document.getElementById("get");
const updateButton = document.getElementById("update");
const deleteButton = document.getElementById("delete");
const snippetCode = document.getElementById("snippetCode");
const snippetText = document.getElementById("snippetText");


insertButton.onclick = () => {
    const snippet = {
        snippetCode: snippetCode.value,
        snippetText: snippetText.value
    }
    
    chrome.runtime.sendMessage({ event: 'insert', snippet })
};

getButton.onclick = async function(){
    const snippet = {
        searchString: snippetCode.value,
        snippetText: snippetText.value
    }
    let result = await fetchSnippets(snippet.searchString);
    console.log("Get click reslt: ", result.snippetText)

};

updateButton.onclick = () => {
    const snippet = {
        snippetCode: snippetCode.value,
        snippetText: snippetText.value
    }

    chrome.runtime.sendMessage({ event: 'update', snippet })
};

deleteButton.onclick = () => {
    const snippet = {
        snippetCode: snippetCode.value,
        snippetText: snippetText.value
    }

    chrome.runtime.sendMessage({ event: 'delete', snippet })
};

async function fetchSnippets(searchString) {
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