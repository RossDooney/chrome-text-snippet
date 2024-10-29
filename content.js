console.log("content script running");

let insertSearch = false
let searchString = ""
let statSearchKey = 92
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
        console.log(`Searching for: ${searchString}`);
        console.log(`Last character in string: ${activeElement.value[activeElement.value.length - 1]}`);
        activeElement.value += searchString;
        insertSearch = false;
        searchString = "";

        return
    }
    
    else if(currentKey.charCodeAt(0) === 47 && !insertSearch){
        insertSearch = true
        console.log("search enabled")
        return
    }

    searchString += currentKey.charAt(0);

    console.log(`Current search string: ${searchString}`);

});