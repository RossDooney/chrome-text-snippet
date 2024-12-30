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
          result = await deleteSnippet(snipId);
          console.log("Delete click result: ", result.snippetText)
          return true;
        }
        else{
          const row = event.target.closest("tr")
          const snippet = {
            snippetCode: row.querySelector(".snippetCode").querySelector("snap").textContent,
            snippetText: row.querySelector(".snippetText").querySelector("snap").textContent
          }

          modalDiv.appendChild(createModal(snippet));
          return true;
        }
      }
      else{
        console.log("Cannot find parent TR")
      }
      return true;
    case "insertSnip":
    case "updateSnip":
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
  const createTd = (attributes = {}, textContent = "") => {
    const cell = document.createElement("td");
    Object.entries(attributes).forEach(([key, value]) => {
      cell.setAttribute(key, value)
    })
    cell.appendChild(createEle("snap", "", textContent))
    return cell;
  };

  const tableRow = document.createElement("tr");
  tableRow.setAttribute('data-id', snippetCode);
  tableRow.setAttribute('class', 'snippetRow')

  tableRow.appendChild(createTd({class: "snippetCode"}, snippetCode))
  tableRow.appendChild(createTd({class: "snippetText"}, snippetText))
  tableRow.appendChild(createTd({class: "sniplastUpdate"}, "Please Holder"))
  tableRow.appendChild(createTd({class: "sniplastUsed"}, "Please Holder"))
  tableRow.appendChild(createTd({class: "snipTimeUsed"}, "Please Holder"))  

  const snipOptions = createEle("td", {class: "snipOption"});

  snipOptions.appendChild(createEle("button", {class: "snipDelete"}, "Delete"))
  snipOptions.appendChild(createEle("button", {class: "snipEdit"}, "Edit"))

  tableRow.appendChild(snipOptions);

  return tableRow;
}

function createModal(snippet){ 

  const parentDiv = createEle("div", {class: "snippetModal", id: "snippetModal"});
  const modalHeader = createEle("div", {class: "modalHeader"});
  const modalBody = createEle("div", {class: "modalBody"});
  
  modalHeader.appendChild(createEle("h2", "","Create Snippet"))
  modalHeader.appendChild(createEle("button", {class: "closeModalBtn"}, "\u00D7 "))
  parentDiv.appendChild(modalHeader);
  
  modalBody.appendChild(createEle("h3", "", "Snippet name"))
  if (snippet){
    modalBody.appendChild(createEle("input", {type: "text", id: "snipCode", value: snippet.snippetCode, readonly: true}))
  }else{
    modalBody.appendChild(createEle("input", {type: "text", id: "snipCode"}))
  }
  modalBody.appendChild(createEle("h3", "", "Snippet Content"))
  if (snippet){
    modalBody.appendChild(createEle("textarea", {id: "snipText"}, snippet.snippetText))
  }else{
    modalBody.appendChild(createEle("textarea", {id: "snipText"}))
  }
  modalBody.appendChild(createEle("button", {class: "insertSnip"}, "Save"))
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