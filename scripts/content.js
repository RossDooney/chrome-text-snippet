console.log("content script running");

let insertSearch = false
let searchString = ""
let statSearchKey = 92
let searchStartPoint = 0
let searchLength = 0

const snippetExamples={
    hi: "Hello, thank you for contacting us",
    bye: "best regards"
}

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
        let x = await fetchSnippets(searchString);  
        console.log("Results: ", x)
        if(!snippetExamples[searchString]){
            console.log("Not a valid search string");
            resetSearch()
            return
        }
        const insertEnd = searchStartPoint + searchString.length + 1;
        activeElement.setRangeText(snippetExamples[searchString], searchStartPoint, insertEnd, 'select');
        
        //activeElement.value = activeElement.value.slice(0, -(searchString.length + 1)) + snippetExamples[searchString];
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