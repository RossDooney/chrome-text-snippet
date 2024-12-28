const snippetList = document.getElementById("snippetList")
const overLay = document.getElementById("overlay")
const modalDiv = document.getElementById("modalDiv")

loadSnippets();
modalDiv.appendChild(createModal());

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
  const modals = document.querySelectorAll('.snippetModal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

document.addEventListener("click", async function (event) {
  const btnId = event.target.className;
  

  switch(btnId){
    case "createBtn":
      const modal = document.querySelector(event.target.dataset.modalTarget);
      await createSnippet(modal);
      return true;
    case "closeModalBtn":
      const parentModal = event.target.closest('.snippetModal')
      closeModal(parentModal);
      return true;
    case "loadMore":
      let result = await fetchAllSnippets();
      result.forEach(snippet => {
        console.log("Snippet: ", snippet)
        snippetList.appendChild(createSnippetRow(snippet.snippetCode, snippet.snippetText));    
      });
      return true;
    case "snipDelete":
      const parentRow = event.target.closest("tr"); 
      if(parentRow){
        const snipId = parentRow.getAttribute("data-id")
        let result = await deleteSnippet(snipId);
        console.log("Delete click result: ", result.snippetText)
      }
      else{
        console.log("Cannot find parent TR")
      }
      return true;
    case "snipEdit":
      console.log("A Edit button was clicked");
      return true;
    default:
      break;
  }
});



loadBtn.onclick = async function(){
  let result = await fetchAllSnippets();
  result.forEach(snippet => {
    console.log("Snippet: ", snippet)
    snippetList.appendChild(createSnippetRow(snippet.snippetCode, snippet.snippetText));

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

async function createSnippet(modal) {
  if (!modal) return

  modal.classList.add('active')
  overLay.classList.add('active')
}

function closeModal(modal) {
  if (!modal) return;

  modal.classList.remove('active');
  overLay.classList.remove('active');
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

  const tableRow = document.createElement("tr");
  tableRow.setAttribute('data-id', snippetCode);
  tableRow.setAttribute('class', 'snippetRow')

  tableRow.appendChild(createEle("td", {class: "snipCode"}, snippetCode));
  tableRow.appendChild(createEle("td", {class: "snipText"}, snippetText));
  tableRow.appendChild(createEle("td", {class: "sniplastUpdate"}, "Place Holder"));
  tableRow.appendChild(createEle("td", {class: "sniplastUsed"}, "Place Holder"));
  tableRow.appendChild(createEle("td", {class: "snipTimeUsed"}, "Place Holder"));

  const snipOptions = createEle("td", {class: "snipOption"});

  snipOptions.appendChild(createBtn("snipDelete", "Delete"))
  snipOptions.appendChild(createBtn("snipEdit", "Edit"))

  tableRow.appendChild(snipOptions);

  return tableRow;
}

function createModal(){ 
  const parentDiv = createEle("div", {class: "snippetModal", id: "snippetModal"});
  const modalHeader = createEle("div", {class: "modalHeader"});
  const modalBody = createEle("div", {class: "modalBody"});
  
  modalHeader.appendChild(createEle("h2", "","Create Snippet"))
  modalHeader.appendChild(createBtn("closeModalBtn", "&times;"))
  
  parentDiv.appendChild(modalHeader);
  
  parentDiv.appendChild(createEle("div", {class: "modalBody"}));

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

function createBtn(className, textContent){
  const button = document.createElement("button");
  button.setAttribute("class", className);
  button.textContent = textContent;
  return button;
}



{/* <div class="snippetModal" id="snippetModal">
<div class="modalHeader">
  <h2>Create Snippet</h2>
  <button class="closeModalBtn">&times;</button>
</div>
<div class="modalBody">
  <h3>Snippet name</h3></br>
  <input type="text" placeholder="hi">
  <h3>Snippet Content</h3>
  <textarea></textarea>
</div>
</div> */}