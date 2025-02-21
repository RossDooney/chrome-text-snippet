let insertSearch = false
let searchString = ""
let statSearchKey = 92
let searchStartPoint = 0
let searchLength = 0
let modal = null


document.addEventListener('keydown', async function(event) {
  try {
      const currentKey = event.key;
      const activeElement = document.activeElement;

      if (activeElement.tagName !== "TEXTAREA" && activeElement.tagName !== "INPUT") {
          return;
      }

      if (currentKey.charCodeAt(0) !== 47 && !insertSearch) {
          return;
      }

      if (currentKey.charCodeAt(0) === 69 && insertSearch) {
          searchString = await getCurrentSearchString(activeElement);
          let snippet = await fetchSnippet(searchString);
          if (snippet.snippetText) {
              const insertEnd = searchStartPoint + searchString.length + 1;
              activeElement.setRangeText(snippet.snippetText, searchStartPoint, insertEnd, 'select');
              updateSnippetUsed(snippet);
              resetSearch();
              return;
          }
          console.log("Nothing found");
          resetSearch();
          return;
      }

      if (currentKey.charCodeAt(0) === 47 && !insertSearch) {
          insertSearch = true;
          searchStartPoint = activeElement.selectionStart;
          const rect = findCoordinates(activeElement, searchStartPoint);
          modal = createModelAtCursor(rect);
          console.log("search enabled at: ", searchStartPoint);
          return;
      }

      if (currentKey.charCodeAt(0) === 66 && insertSearch) {
          if (searchLength <= 0) {
              resetSearch();
              return;
          }
          searchLength -= 1;
          console.log("Search size: " + searchLength);
          return;
      }
      if(insertSearch){
          searchLength += 1;
          try{
            searchString = await getCurrentSearchString(activeElement);
          } catch(error){
            console.error("Error on getCurrentSearchString", error.message)
          }
          try{
            snippets = await searchKeys(searchString);
            console.log(snippets);
          } catch(error){
            console.error("Error on searchString", error.message)
          }
      }
  } catch (error) {
    if (error instanceof Error) {
        console.error("Error in keydown event:", error.message);  // Logs the message if it's an Error object
    } else {
        console.error("Non-Error object caught:", JSON.stringify(error, null, 2));  // If it's an object, log it properly
    }
  }
});

function resetSearch() {
  console.log(modal);
  if(modal){
    modal.remove();
  }

  insertSearch = false;
  searchString = "";
  searchLength = 0
}


async function getCurrentSearchString(activeElement) {
  return new Promise((resolve, reject) => {
    try {
      requestAnimationFrame(() => {
        if (!activeElement || !activeElement.value) {
          return reject(new Error("Invalid activeElement or value"));
        }
        
        const currentSearchString = activeElement.value.slice(searchStartPoint + 1, searchStartPoint + searchLength + 1);
        resolve(currentSearchString);
      });
    } catch (error) {
      reject(error); 
    }
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

    return parentDiv;
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
  const fontSize = parseFloat(computedStyle.fontSize);
  const lineHeight = computedStyle.lineHeight === "normal" ? fontSize * 1.3 : parseFloat(computedStyle.lineHeight * 1.1);

  div.style.top = `${activeElement.getBoundingClientRect().top + lineHeight}px`;
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