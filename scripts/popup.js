const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
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

startButton.onclick = () => {
    const snippet = {
        snippetCode: snippetCode.value,
        snippetText: snippetText.value
    }

    chrome.runtime.sendMessage({ event: 'onStart', snippet })
};

stopButton.onclick = () => {
    chrome.runtime.sendMessage({ event: 'onStop'})
};
