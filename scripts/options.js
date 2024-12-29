const snippetList = document.getElementById("snippetList")
const overLay = document.getElementById("overlay")
const modalDiv = document.getElementById("modalDiv")

loadSnippets();

async function loadSnippets(){
  await openDb();
  let result = await fetchAllSnippets();
  result.forEach(snippet => {
    console.log("Snippet: ", snippet)
    snippetList.appendChild(createSnippetRow(snippet.snippetCode, snippet.snippetText));
  })
  return;
}

overLay.addEventListener('click', ()=>{
  modalDiv.replaceChildren();
})

document.addEventListener("click", async function (event) {
  const btnId = event.target.className;
  let result;
  switch(btnId){
    case "createBtn":
      modalDiv.appendChild(createModal());
      return true;
    case "closeModalBtn":
      modalDiv.replaceChildren();
      return true;
    case "loadMore":
      result = await fetchAllSnippets();
      result.forEach(snippet => {
        console.log("Snippet: ", snippet)
        snippetList.appendChild(createSnippetRow(snippet.snippetCode, snippet.snippetText));    
      });
      return true;
    case "snipDelete":
    case "snipEdit":
      const parentRow = event.target.closest("tr"); 
      if(parentRow){
        const snipId = parentRow.getAttribute("data-id")
        if(btnId == "snipDelete") {
          let result = await deleteSnippet(snipId);
          console.log("Delete click result: ", result.snippetText)
          return true;
        }
        else{
          console.log("Editing: ", snipId)
          return true;
        }
      }
      else{
        console.log("Cannot find parent TR")
      }
      return true;
    case "saveSnip":
      const snippet = {
        snippetCode: document.getElementById("snipCode").value,
        snippetText: document.getElementById("snipText").value
      }
      console.log(snippet.snippetCode)
      result = await insertSnippets(snippet);
      console.log("Insert click result: ", result)
      return;
    default:
      console.warn(`Unhandled button action: ${btnId}`);
      break;
  }
});


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
  const tableRow = document.createElement("tr");
  tableRow.setAttribute('data-id', snippetCode);
  tableRow.setAttribute('class', 'snippetRow')

  tableRow.appendChild(createEle("td", {class: "snipCode"}, snippetCode));
  tableRow.appendChild(createEle("td", {class: "snipText"}, snippetText));
  tableRow.appendChild(createEle("td", {class: "sniplastUpdate"}, "Place Holder"));
  tableRow.appendChild(createEle("td", {class: "sniplastUsed"}, "Place Holder"));
  tableRow.appendChild(createEle("td", {class: "snipTimeUsed"}, "Place Holder"));

  const snipOptions = createEle("td", {class: "snipOption"});

  snipOptions.appendChild(createEle("button", {class: "snipDelete"}, "Delete"))
  snipOptions.appendChild(createEle("button", {class: "snipEdit"}, "Edit"))

  tableRow.appendChild(snipOptions);

  return tableRow;
}

function createModal(){ 
  const parentDiv = createEle("div", {class: "snippetModal", id: "snippetModal"});
  const modalHeader = createEle("div", {class: "modalHeader"});
  const modalBody = createEle("div", {class: "modalBody"});
  
  modalHeader.appendChild(createEle("h2", "","Create Snippet"))
  modalHeader.appendChild(createEle("button", {class: "closeModalBtn"}, "\u00D7 "))
  parentDiv.appendChild(modalHeader);
  
  modalBody.appendChild(createEle("h3", "", "Snippet name"))
  modalBody.appendChild(createEle("input", {type: "text", id: "snipCode"}))
  modalBody.appendChild(createEle("h3", "", "Snippet Content"))
  modalBody.appendChild(createEle("textarea", {id: "snipText"}))
  modalBody.appendChild(createEle("button", {class: "saveSnip"}, "Save"))
  parentDiv.appendChild(modalBody);

  return parentDiv;
}

function createEle(elementType, attributes = {}, elementText = ""){
  const element = document.createElement(elementType);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
  if(elementText) element.textContent = elementText;
  return element;
}