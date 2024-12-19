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
    const card = document.createElement("div");
    card.setAttribute('data-id', snippetCode);
    card.setAttribute('class', 'snippetCard')

    const snipCodeElement = document.createElement("h2");
    snipCodeElement.setAttribute('class', 'snipCode')
    snipCodeElement.textContent = snippetCode;

    const snipTextElement = document.createElement("p");
    snipTextElement.setAttribute('class', 'snipText')
    snipTextElement.textContent = snippetText;

    const snipDeleteElement = document.createElement("button")
    snipDeleteElement.setAttribute('class', 'snipDelete')
    snipDeleteElement.textContent = "Delete"

    const snipEditElement = document.createElement("button")
    snipEditElement.setAttribute('class', 'editDelete')
    snipEditElement.textContent = "Edit"

    card.appendChild(snipCodeElement);
    card.appendChild(snipTextElement);
    card.appendChild(snipDeleteElement);
    card.appendChild(snipEditElement);

    return card;
}