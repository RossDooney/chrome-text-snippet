const snippet_list = document.getElementById("snippet_list")
const loadBtn = document.getElementById("loadMore");

loadBtn.onclick = async function(){
    let result = await fetchAllSnippets();
    result.forEach(snippet => {
      console.log("Snippet: ", snippet)
      snippet_list.appendChild(createSnippetCard(snippet.snippetCode, snippet.snippetText));

    })

  
};

async function fetchAllSnippets() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ event: "get_all"}, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
}


function createSnippetCard(snippetCode, snippetText) {
    const tableRow = document.createElement("tr");
    tableRow.setAttribute('data-id', snippetCode);
    tableRow.setAttribute('class', 'snippetCard')

    const snipCodeElement = document.createElement("td");
    snipCodeElement.setAttribute('class', 'snipCode')
    snipCodeElement.textContent = snippetCode;

    const snipTextElement = document.createElement("td");
    snipTextElement.setAttribute('class', 'snipText')
    snipTextElement.textContent = snippetText;

    const snipLastUpdate = document.createElement("td");
    snipLastUpdate.setAttribute('class', 'sniplastUpdate')
    snipLastUpdate.textContent = "Place Holder";

    const snipLastUsed = document.createElement("td");
    snipLastUsed.setAttribute('class', 'sniplastUsed')
    snipLastUsed.textContent = "Place Holder";

    const snipTimesUsed = document.createElement("td");
    snipTimesUsed.setAttribute('class', 'snipTimeUsed')
    snipTimesUsed.textContent = "Place Holder";

    const snipOptions = document.createElement("td");
    snipOptions.setAttribute('class', 'snipOption')

    const snipDeleteElement = document.createElement("button")
    snipDeleteElement.setAttribute('class', 'snipDelete')
    snipDeleteElement.textContent = "Delete"

    const snipEditElement = document.createElement("button")
    snipEditElement.setAttribute('class', 'editDelete')
    snipEditElement.textContent = "Edit"

    snipOptions.appendChild(snipDeleteElement)
    snipOptions.appendChild(snipEditElement)

    tableRow.appendChild(snipCodeElement);
    tableRow.appendChild(snipTextElement);
    tableRow.appendChild(snipLastUpdate);
    tableRow.appendChild(snipLastUsed);
    tableRow.appendChild(snipTimesUsed);
    tableRow.appendChild(snipOptions);


    return tableRow;
}