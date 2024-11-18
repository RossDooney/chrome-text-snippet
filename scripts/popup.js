const addButton = document.getElementById("add");
const snippetCode = document.getElementById("snippetCode");
const snippetText = document.getElementById("snippetText");

chrome.storage.local.get(["snippetText"], (result) =>{
    const snipText = result["snippetText"];

    if(snipText){

        snippetText.value = snipText;
    }
    if(!snipText){
        console.log("snip text empty");
    }
})

addButton.onclick = () => {
    const snippet = {
        snippetCode: snippetCode.value,
        snippetText: snippetText.value
    }

    chrome.runtime.sendMessage({ event: 'onStart', snippet })
};

