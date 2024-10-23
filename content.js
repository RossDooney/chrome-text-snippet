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
    console.log(`Keycode = ${event.key.charCodeAt(0)}`)

    if(!insertSearch)
    
    if(currentKey.charCodeAt(0) === 92 && !insertSearch){
        insertSearch = true
        return
    }



});