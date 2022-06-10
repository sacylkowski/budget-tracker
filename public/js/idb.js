// create variable to hold db connection
let db;
// establish a connection to IndexedDB database
const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
  };

  request.onsuccess = function(event) {
    db = event.target.result;
  
    // check if app is online, if yes run checkDatabase() function to send all local db data to api
    if (navigator.onLine) {
      uploadTransaction();
    }
  };
  
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };