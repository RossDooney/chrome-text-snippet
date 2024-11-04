let db;

function initDatabase() {
    // Create a new database
    db = new SQL.Database();
    db.run("CREATE TABLE test (id INTEGER PRIMARY KEY, value TEXT);");
}

function insertData(value) {
    const stmt = db.prepare("INSERT INTO test (value) VALUES (?)");
    stmt.run(value);
    stmt.free();
}

function fetchData() {
    const stmt = db.prepare("SELECT * FROM test;");
    let result = [];
    while (stmt.step()) {
        const row = stmt.get();
        result.push(row);
    }
    stmt.free();
    return result;
}
