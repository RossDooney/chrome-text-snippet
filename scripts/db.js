let db = null;

export async function insert_dynamic_entry(){
    console.log("insert_dynamic_entrie hit")
    if(db){
        console.log("db live")
        return
    }
    console.log("no db connection");
    return
}