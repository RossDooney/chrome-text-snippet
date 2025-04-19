import {insert_dynamic_entry} from "./db.js"
const snippetList = document.getElementById("snippetList")

loadSnippets();

async function loadSnippets(){
  try {
    await openDb();
    let result = await fetchAllSnippets();
    result.forEach(snippet => {
      console.log("Snippet: ", snippet)
      snippetList.appendChild(createSnippetRow(snippet));
    })
    return true;
  } catch (error) {
    console.error("Error in loadSnippets: ", error); 
  }
  return true;
}


document.addEventListener("click", async function (event) {
  const elemId = event.target.className;
  const modal = document.getElementById("snippetModal");
  let result;
  switch(elemId){
    case "createBtn":
      if(modal){
        modal.remove()
      }
      document.body.appendChild(createModal(elemId));
      return true;
    case "closeModalBtn":
      if(modal){
        modal.remove();
      }
      return true;
    case "snipDelete":
    case "snipEdit":
      const parentRow = event.target.closest("tr"); 
      if(parentRow){
        const snipId = parentRow.getAttribute("data-id")
        if(elemId == "snipDelete") {
          result = await deleteSnippet(snipId);
          parentRow.remove();
          console.log("Delete click result: ", result.snippetText)
          return true;
        }
        else{
          const row = event.target.closest("tr")
          const snippet = {
            snippetCode: row.querySelector(".snippetCode").querySelector("snap").textContent,
            snippetText: row.querySelector(".snippetText").querySelector("snap").textContent
          }
          if(modal){
            modal.remove();
          }
          document.body.appendChild(createModal(elemId,snippet));
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
        snippetText: document.getElementById("snipText").value,
      }
      if(elemId === "insertSnip"){
        result = await insertSnippets(snippet);
        snippetList.appendChild(createSnippetRow(result));
        return;
      } else if(elemId  === "updateSnip"){
        const element = document.querySelector('[data-id='+ snippet.snippetCode +']');
        result = await updateSnippet(snippet)
        console.log("Update click result: ", result);
        element.replaceWith(createSnippetRow(result));
        return;
      }
    case "testEntries":
      await insert_dynamic_entry();
      return true;
  
    default:
      // if(modal && !event.target.closest(".snippetModal")){
      //   modal.remove();
      //   return true;
      // }
      // console.warn(`Unhandled button action: ${elemId}`);
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
  try {
    return await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ event: "get_all" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Chrome runtime error in fetchAllSnippets:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else if (response.error) {
          console.error("Error returned from get_all:", response.error);
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  } catch (error) {
    console.error("Error in fetchAllSnippets:", error);
    throw error;
  }
}


function createSnippetRow(snippet) {
  const createTd = (attributes = {}, textContent = "") => {
    const cell = document.createElement("td");
    Object.entries(attributes).forEach(([key, value]) => {
      cell.setAttribute(key, value)
    })
    cell.appendChild(createEle("snap", "", textContent))
    return cell;
  };

  const tableRow = document.createElement("tr");
  tableRow.setAttribute('data-id', snippet.snippetCode);
  tableRow.setAttribute('class', 'snippetRow')
  tableRow.appendChild(createTd({class: "snippetCode"}, snippet.snippetCode))
  tableRow.appendChild(createTd({class: "snippetText"}, snippet.snippetText))
  tableRow.appendChild(createTd({class: "sniplastUpdate"}, snippet.lastUpdated))
  tableRow.appendChild(createTd({class: "sniplastUsed"}, snippet.lastUsed))
  tableRow.appendChild(createTd({class: "snipTimeUsed"}, snippet.timesUsed))  
  console.log("Times used: ", snippet.timesUsed)

  const snipOptions = createEle("td", {class: "snipOption"});

  snipOptions.appendChild(createEle("button", {class: "snipDelete"}, "Delete"))
  snipOptions.appendChild(createEle("button", {class: "snipEdit"}, "Edit"))

  tableRow.appendChild(snipOptions);

  return tableRow;
}

function createModal(btnId, snippet){ 

  const parentDiv = createEle("div", {class: "snippetModal", id: "snippetModal"});
  const modalHeader = createEle("div", {class: "modalHeader"});
  const modalBody = createEle("div", {class: "modalBody"});
  
  modalHeader.appendChild(createEle("h2", "","Create Snippet"))
  modalHeader.appendChild(createEle("button", {class: "closeModalBtn"}, "\u00D7 "))
  parentDiv.appendChild(modalHeader);
  
  modalBody.appendChild(createEle("h3", "", "Snippet name"))
  if (snippet){
    modalBody.appendChild(createEle("input", {type: "text", id: "snipCode", value: snippet.snippetCode, disabled: true}))
  }else{
    modalBody.appendChild(createEle("input", {type: "text", id: "snipCode"}))
  }
  modalBody.appendChild(createEle("h3", "", "Snippet Content"))
  if (snippet){
    modalBody.appendChild(createEle("textarea", {id: "snipText"}, snippet.snippetText))
  }else{
    modalBody.appendChild(createEle("textarea", {id: "snipText"}))
  }
  console.log(btnId)
  if(snippet && btnId === "snipEdit"){
    modalBody.appendChild(createEle("button", {class: "updateSnip"}, "Save"))
  }else{
    modalBody.appendChild(createEle("button", {class: "insertSnip"}, "Save"))
  }
  parentDiv.appendChild(modalBody);

  return parentDiv;
}

function createEle(elementType, attributes = {}, elementText = ""){
  const element = document.createElement(elementType);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
  if (elementText !== null && elementText !== undefined) element.textContent = elementText;
  return element;
}