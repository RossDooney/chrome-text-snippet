const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

console.log("1")

startButton.onclick = () => {
    console.log("2")
    chrome.runtime.sendMessage({ event: 'onStart'})
};

stopButton.onclick = () => {
    chrome.runtime.sendMessage({ event: 'onStop'})
};
