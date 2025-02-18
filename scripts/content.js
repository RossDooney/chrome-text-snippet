let insertSearch = false
let searchString = ""
let statSearchKey = 92
let searchStartPoint = 0
let searchLength = 0


document.addEventListener('keydown', async function(event) {

    const currentKey = event.key
    const activeElement = document.activeElement;
    const currentSearchString = () => {
      return activeElement.value.slice((searchStartPoint + 1), (searchStartPoint + searchLength + 1))
    };

    if (!activeElement.tagName === "TEXTAREA" || !activeElement.tagName === "INPUT") {
        return
    }

    if(currentKey.charCodeAt(0) != 47 && !insertSearch){
        console.log("Search not active")
        return
    }

    if(currentKey.charCodeAt(0) === 69 && insertSearch){

        searchString = currentSearchString()
        let snippet = await fetchSnippet(searchString);  //grabbing to much data, but full entry needed for updateSnippetUsed function so will keep for now.
        if(snippet.snippetText){
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
        const rect = findCoordinates(activeElement, searchStartPoint);
        createModelAtCursor(rect);
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
    snippets = await searchKeys(currentSearchString());
   
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

async function searchKeys(searchString) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ event: "search_keys", searchString }, (response) => {
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


function createModelAtCursor(rect){ 

    const parentDiv = createEle("div", {class: "snippetModal", id: "snippetModal"});
    parentDiv.style.position = "absolute";
    parentDiv.style.left = `${rect.left}px`;
    parentDiv.style.top = `${rect.top}px`;

    const modalHeader = createEle("div", {class: "modalHeader"});
    const modalBody = createEle("div", {class: "modalBody"});    
    modalHeader.appendChild(createEle("h2", "","Search Snippet"))
    modalHeader.appendChild(createEle("button", {class: "closeModalBtn"}, "\u00D7 "))
    parentDiv.appendChild(modalHeader);

    parentDiv.appendChild(modalBody);
  
    document.body.appendChild(parentDiv);
}

function createEle(elementType, attributes = {}, elementText = ""){
    const element = document.createElement(elementType);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
    if (elementText !== null && elementText !== undefined) element.textContent = elementText;
    return element;
} 

function findCoordinates(activeElement, curPos){
  const div = document.createElement("div");
  document.body.appendChild(div);
  const computedStyle = getComputedStyle(activeElement);
  div.style.cssText = `
    white-space: pre-wrap;
    word-wrap: break-word;
    visibility: hidden;
    position: absolute;
    font: ${computedStyle.font};
    letter-spacing: ${computedStyle.letterSpacing};
  `;

  div.style.top = `${activeElement.getBoundingClientRect().top}px`;
  div.style.left = `${activeElement.getBoundingClientRect().left}px`;

  const text = activeElement.value.substring(0, curPos); 
  div.textContent = text;
  
  const span = document.createElement("span");
  span.textContent = "/";
  div.appendChild(span);

  const rect = span.getBoundingClientRect();
  document.body.removeChild(div);

  return rect;
}