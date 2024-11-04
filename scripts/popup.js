// popup.js
document.getElementById("create").addEventListener("click", function() {
    initDatabase();
    document.getElementById("output").innerText = "Database created!";
});

document.getElementById("insert").addEventListener("click", function() {
    const value = prompt("Enter a value to insert:");
    if (value) {
        insertData(value);
        document.getElementById("output").innerText = `Inserted: ${value}`;
    }
});

document.getElementById("fetch").addEventListener("click", function() {
    const results = fetchData();
    document.getElementById("output").innerText = results.length ? JSON.stringify(results) : "No data found.";
});
