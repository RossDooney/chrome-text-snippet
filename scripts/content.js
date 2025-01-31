let insertSearch = false
let searchString = ""
let statSearchKey = 92
let searchStartPoint = 0
let searchLength = 0


document.addEventListener('keydown', async function(event) {

    const currentKey = event.key
    const activeElement = document.activeElement;

    if (!activeElement.tagName === "TEXTAREA" || !activeElement.tagName === "INPUT") {
        return
    }

    if(currentKey.charCodeAt(0) != 47 && !insertSearch){
        console.log("Search not active")
        return
    }

    if(currentKey.charCodeAt(0) === 69 && insertSearch){

        searchString = activeElement.value.slice((searchStartPoint + 1), (searchStartPoint + searchLength + 1))
        let snippet = await fetchSnippet(searchString);  //grabbing to much data, but full entry needed for updateSnippetUsed function so will keep for now.
        if(snippet.snippetText){
            console.log(snippet)
            const insertEnd = searchStartPoint + searchString.length + 1;
            activeElement.setRangeText(snippet.snippetText, searchStartPoint, insertEnd, 'select');
            updateSnippetUsed(snippet);
            resetSearch()
            return
        }

        console.log("Nothing found")
        resetSearch()
        return  
    }

    if(currentKey.charCodeAt(0) === 47 && !insertSearch){
        insertSearch = true;
        searchStartPoint = activeElement.selectionStart;
        console.log("search enabled at: ", searchStartPoint);
        return
    }

    if(currentKey.charCodeAt(0) === 66 && insertSearch){
        if(searchLength <= 0){
            resetSearch()
            return
        }
        searchLength -= 1;
        console.log("Search size: " + searchLength);
        return
    }
    searchLength += 1;
});

function resetSearch() {
    insertSearch = false;
    searchString = "";
    searchLength = 0
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

async function updateSnippetUsed(snippet) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ event: "snippetUsed", snippet }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
            resolve(response);
        }
      });
    });
}


function createModal(){ 

    const parentDiv = createEle("div", {class: "snippetModal", id: "snippetModal"});
    const modalHeader = createEle("div", {class: "modalHeader"});
    const modalBody = createEle("div", {class: "modalBody"});
    
    modalHeader.appendChild(createEle("h2", "","Search Snippet"))
    modalHeader.appendChild(createEle("button", {class: "closeModalBtn"}, "\u00D7 "))
    parentDiv.appendChild(modalHeader);
    
    modalBody.appendChild(createEle("h3", "", "Snippet name"))
    modalBody.appendChild(createEle("input", {type: "text", id: "snipCode"}))    
    modalBody.appendChild(createEle("h3", "", "Snippet Content"))

    parentDiv.appendChild(modalBody);
  
    return parentDiv;
  }
  