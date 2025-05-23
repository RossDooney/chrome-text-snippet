let insertSearch = false
let statSearchKey = 92
let searchStartPoint = 0
let searchLength = 0
let modal = null
let previousActiveElemental = null
let selectedIndex = 0;


document.addEventListener('keydown', async function(event) {
  try {
      const currentKey = event.key;
      const activeElement = document.activeElement;
   //   const checkSelect = window.getSelection().toString(); // check to see if text is highlighted during keydown

      previousActiveElemental = document.activeElement;
      if(modal){
        const modalItems = modal.querySelectorAll(".snippetResult");

        if(event.key === "ArrowDown"){
          if(modalItems.length === 0) return;
            event.preventDefault(modalItems);
            selectedIndex = (selectedIndex + 1) % modalItems.length;
            updateSelectedElement(modalItems);
            return;
          } else if(event.key === "ArrowUp"){
          if(modalItems.length === 0) return;
            event.preventDefault(modalItems);
            selectedIndex = (selectedIndex - 1) % modalItems.length;
            updateSelectedElement(modalItems);
            return;
          } else if(event.key === "Enter" && selectedIndex >= 0){
            if(modalItems.length === 0) return;
            event.preventDefault(modalItems);

            const selectedItem = modal.querySelector(".selected");
            if(selectedItem){
              //needs to be updated to pass snippet text as well so there isn't a need to get from db.
              const snippetCode = selectedItem.querySelector(".snippetCode").textContent
              if(snippetCode){
                applySnippet(previousActiveElemental, snippetCode);
              }
              return;
            }
        }
      }

      if (activeElement.tagName !== "TEXTAREA" && activeElement.tagName !== "INPUT") {
          return;
      }
      //search not enable and search key not pressed so just exit
      if (currentKey.charCodeAt(0) !== 47 && !insertSearch) {
          return;
      }
      //if enter is pressed, use the current key code to find key value and update text field with it
      if (currentKey === "Enter" && insertSearch) {
        await applySnippet(activeElement);
        return;
      }
      //enable search
      if (currentKey.charCodeAt(0) === 47 && !insertSearch) {
          insertSearch = true;
          searchStartPoint = activeElement.selectionStart;
          cachedSnippets = await fetchAllSnippets() //replace with a cache of must used snippets later
          const rect = findCoordinates(activeElement, searchStartPoint);
          modal = createModelAtCursor(rect);
          modalUpdate(cachedSnippets);
          console.log("search enabled at: ", searchStartPoint);
          return true;
      }
      if (currentKey === "Backspace" && insertSearch) {
        if (searchLength <= 0) {
          resetSearch();
          return;
        }
        searchLength -= 1;
        try{
          searchString = await getCurrentSearchString(activeElement);
        } catch(error){
          console.error("Error on getCurrentSearchString", error.message)
        }
        try{
          snippets = await searchKeys(searchString);
          modalUpdate(snippets);
        } catch(error){
          console.error("Error on searchKeys", error.message)
        }
        return;
      }

      if(currentKey === "Escape" && modal){
        resetSearch();
      }

      if(/^[a-zA-Z0-9]$/.test(currentKey) && insertSearch){
        searchLength += 1;

        try{
          searchString = await getCurrentSearchString(activeElement);
        } catch(error){
          console.error("Error on getCurrentSearchString", error.message)
        }
        try{
          snippets = await searchKeys(searchString);
          modalUpdate(snippets);
        } catch(error){
          console.error("Error on searchKeys", error.message)
        }
      }
  } catch (error) {
    if (error instanceof Error) {
        console.error("Error in keydown event:", error);  
    } else {
        console.error("Non-Error object caught:", JSON.stringify(error, null, 2));  
    }
  }
});


document.addEventListener("mousedown", async function (event) {
  const currentElement = event.target;
  const resultDiv = currentElement.closest('.snippetResult')
  if(resultDiv){
    //needs to be updated to pass snippet text as well so there isn't a need to get from db.
    const snippetCode = resultDiv.querySelector(".snippetCode").textContent
    if(snippetCode){
 //     const searchString = resultDiv
      applySnippet(previousActiveElemental, snippetCode);
    }
    return;
  }

  if(currentElement.closest(".snippetModal")){
    return;
  }

  if(previousActiveElemental !== currentElement){
    resetSearch();
    return;
  }

});


async function applySnippet(activeElement, searchString = null){
  
  if (!searchString){
    searchString = await getCurrentSearchString(activeElement);
  }
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

function resetSearch(){
  if(modal){
    modal.remove();
  }
  
  previousActiveElemental = null;
  insertSearch = false;
  searchLength = 0;
  modal = null;
}

function updateSelectedElement(modalItems){
  modalItems.forEach(modalItem => modalItem.classList.remove("selected"));
  if (selectedIndex >= 0){
    modalItems[selectedIndex].classList.add("selected");
    modalItems[selectedIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }
}

async function fetchAllSnippets() {
  try {
    return await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ event: "get_all" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Chrome runtime error in fetchAllSnippets:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else if (response.error) {
          console.error("Error returned from get_all:", response.error);
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  } catch (error) {
    console.error("Error in fetchAllSnippets:", error);
    throw error;
  }
}

async function getCurrentSearchString(activeElement) {

  return new Promise((resolve, reject) => {
    try {
      requestAnimationFrame(() => {
        if (!activeElement || !activeElement.value) {
          resetSearch();
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

    // const modalHeader = createEle("div", {class: "modalHeader"});
    const modalBody = createEle("div", {class: "modalBody"});    
    // modalHeader.appendChild(createEle("h2", "","Search Snippet"))
    // modalHeader.appendChild(createEle("button", {class: "closeModalBtn"}, "\u00D7 "))
    
    // parentDiv.appendChild(modalHeader);
    parentDiv.appendChild(modalBody);
  
    document.body.appendChild(parentDiv);

    return parentDiv;
}

function modalUpdate(snippets){
  const modalBody = modal.querySelector('.modalBody');
  let firstElement = true
  modalBody.replaceChildren();

  console.log(snippets)

  Object.entries(snippets).forEach(([key, value]) => {
    let snippetResult;
    if (firstElement){
      snippetResult = createEle("div", {class: "snippetResult selected"})
      firstElement = false
    }
    else{
      snippetResult = createEle("div", {class: "snippetResult"})
    }

    snippetResult.appendChild(createEle("h2", {class: "snippetCode"}, value.snippetCode))
    snippetResult.appendChild(createEle("h3", {class: "snippetValue"}, value.snippetText))

    modalBody.appendChild(snippetResult);
  })
};

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