// create variable to hold db connection
let db;
// establish a connection to IndexedDB database
const request = indexedDB.open("budget-tracker", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("bank_transaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    // check if app is online, if yes run checkDatabase() function to send all local db data to api
    if (navigator.onLine) {
        uploadBankTransaction();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

//this function will run if we try to submit a new tranaction and there's no internet connection
function saveRecord(record) {
    const transaction = db.transaction(["bank_transaction"], "readwrite");

    const bankObjectStore = transaction.objectStore("bank_transaction");

    // insert data to the bankObjectStore
    bankObjectStore.add(record);
}

function uploadBankTransaction() {
    const transaction = db.transaction(["bank_transaction"], "readwrite");

    // access your object store
    const bankObjectStore = transaction.objectStore("bank_transaction");

    // get all records from store and set to a variable
    const getAll = bankObjectStore.getAll();

    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    const transaction = db.transaction(["bank_transaction"], "readwrite");

                    const bankObjectStore = transaction.objectStore("bank_transaction");
                    // clear all items in your store
                    bankObjectStore.clear();

                    alert('All saved bank transactions have been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

};

window.addEventListener("online", uploadBankTransaction);