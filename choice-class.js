class Choice{

  dbName = 'myDB';
  dbVersion = 3;


  connect(){
    return new Promise((reslove, reject) => {

        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onupgradeneeded = () => {
            let db = request.result;

            if(!db.objectStoreNames.contains('choices')){
                db.createObjectStore('choices', {keyPath: 'id'});
            }
        }

        request.onsuccess = () => reslove(request.result);
        request.onerror = () => reject(request.error.message);
        request.onblocked = () => console.log('Storage is blocked');

    });
  }

    async accessStore(){
        let connect = await this.connect();
        let tx = connect.transaction('choices', 'readwrite');
        return tx.objectStore('choices');
    }

    async add(choise){
        let store = await this.accessStore()
        return store.add(choise);
    }

    async  delete(choiceID){
      let store = await this.accessStore();
      return store.delete(choiceID);
    }

    async all(){
      let store = await this.accessStore();
      return store.openCursor(null, 'next');
    }

    async get(choiceID){

      let store = await this.accessStore();
      return store.get(choiceID)
    }

    async clear(){
      let store = await this.accessStore();
      return store.clear();
    }

}
