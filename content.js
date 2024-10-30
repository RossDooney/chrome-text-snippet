console.log("content script running");

let insertSearch = false
let searchString = ""
let statSearchKey = 92
let searchStartPoint = 0
const snippetExamples={
    hi: "Hello, thank you for contacting us",
    bye: "best regards"
}

document.addEventListener('keydown', function(event) {

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
        console.log(`Searching for: ${snippetExamples[searchString]}`);
        event.preventDefault();
        if(!snippetExamples[searchString]){
            console.log("Not a valid search string");
            insertSearch = false;
            searchString = "";
            return
        }
        const insertEnd = searchStartPoint + searchString.length + 1;
        console.log("Insert Start: ", searchStartPoint);
        console.log("Insert end: ", insertEnd);
        activeElement.setRangeText(snippetExamples[searchString], searchStartPoint, insertEnd, 'select')
        //activeElement.value = activeElement.value.slice(0, -(searchString.length + 1)) + snippetExamples[searchString];
        insertSearch = false;
        searchString = "";

        return
    }
    
    else if(currentKey.charCodeAt(0) === 47 && !insertSearch){
        insertSearch = true;
        searchStartPoint = activeElement.selectionStart;
        console.log("search enabled at: ", searchStartPoint);
        return
    }

    searchString += currentKey.charAt(0);

    console.log(`Current search string: ${searchString}`);

});