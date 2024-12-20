const snippet_list = document.getElementById("snippet_list")
const loadBtn = document.getElementById("loadMore");

loadSnippets();

async function loadSnippets(){
  await openDb();
  let result = await fetchAllSnippets();
  result.forEach(snippet => {
    console.log("Snippet: ", snippet)
    snippet_list.appendChild(createSnippetRow(snippet.snippetCode, snippet.snippetText));

  })
}

loadBtn.onclick = async function(){
  let result = await fetchAllSnippets();
  result.forEach(snippet => {
    console.log("Snippet: ", snippet)
    snippet_list.appendChild(createSnippetRow(snippet.snippetCode, snippet.snippetText));

  })
};

async function openDb(){
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ event: "open_db"}, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

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

function createSnippetRow(snippetCode, snippetText) {
  const createCell = (className, textContent = "") => {
    const cell = document.createElement("td");
    cell.setAttribute("class", className);
    cell.textContent = textContent;
    return cell;
  };

  const createButton = (className, textContent) => {
    const button = document.createElement("button");
    button.setAttribute("class", className);
    button.textContent = textContent;
    return button;
  };

  const tableRow = document.createElement("tr");
  tableRow.setAttribute('data-id', snippetCode);
  tableRow.setAttribute('class', 'snippetRow')

  tableRow.appendChild(createCell("snipCode", snippetCode));
  tableRow.appendChild(createCell("snipText", snippetText));
  tableRow.appendChild(createCell("sniplastUpdate", "Place Holder"));
  tableRow.appendChild(createCell("sniplastUsed", "Place Holder"));
  tableRow.appendChild(createCell("snipTimeUsed", "Place Holder"));

  const snipOptions = createCell("snipOption");

  snipOptions.appendChild(createButton("snipDelete", "Delete"))
  snipOptions.appendChild(createButton("snipEdit", "Edit"))

  tableRow.appendChild(snipOptions);

  return tableRow;
}