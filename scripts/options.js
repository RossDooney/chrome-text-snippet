const snippet_list = document.getElementById("snippet_list")
const loadBtn = document.getElementById("loadMore");

loadBtn.onclick = async function(){
    let result = await fetchAllSnippets();
    console.log("Load more click reslt: ", result[0].snippetCode)
    snippet_list.appendChild(createSnippetCard(result[0].snippetCode, result[0].snippetText));
  
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


function createSnippetCard(title, description) {
    const card = document.createElement("div");
    card.style.border = "1px solid #ccc";
    card.style.margin = "10px";
    card.style.padding = "10px";

    const titleElement = document.createElement("h2");
    titleElement.textContent = title;

    const descriptionElement = document.createElement("p");
    descriptionElement.textContent = description;

    card.appendChild(titleElement);
    card.appendChild(descriptionElement);

    return card;
}