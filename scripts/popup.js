const insertButton = document.getElementById("insert");
const getButton = document.getElementById("get");
const updateButton = document.getElementById("update");
const deleteButton = document.getElementById("delete");
const snippetCode = document.getElementById("snippetCode");
const snippetText = document.getElementById("snippetText");


insertButton.onclick = () => {
    const snippet = {
        snippetCode: snippetCode.value,
        snippetText: snippetText.value
    }

    chrome.runtime.sendMessage({ event: 'insert', snippet })
};

getButton.onclick = () => {
    const snippet = {
        searchString: snippetCode.value,
        snippetText: snippetText.value
    }

    chrome.runtime.sendMessage({ event: 'get', searchString })
};

updateButton.onclick = () => {
    const snippet = {
        snippetCode: snippetCode.value,
        snippetText: snippetText.value
    }

    chrome.runtime.sendMessage({ event: 'update', snippet })
};

deleteButton.onclick = () => {
    const snippet = {
        snippetCode: snippetCode.value,
        snippetText: snippetText.value
    }

    chrome.runtime.sendMessage({ event: 'delete', snippet })
};
