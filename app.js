

/*
    SETUP
*/
const util = require('util');
require('util.promisify').shim();

const fs = require('fs');
const readFileAsync = util.promisify(fs.readFile);
// Express
var express = require('express');   // We are using the express library for the web server
var app = express();            // We need to instantiate an express object to interact with the server in our code
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
PORT        = 7375;                 // Set a port number at the top so it's easy to change in the future

// Database
var db = require('./database/db-connector.js')

// app.js

const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({ extname: ".hbs" }));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.

/*
    ROUTES
*/

app.get('/', function (req, res) {
    
        res.render('home');

});
app.get('/home', function (req, res) {

    res.render('home');

});

app.get('/donutsH', function (req, res) {
    let query1 = "SELECT * FROM Donuts;";            // Define our query

    db.pool.query(query1, function (error, rows, fields) {    // Execute the query

        res.render('donutsH', { data: rows });                 // Render the hbs file, and also send the renderer               
    })
    // Note the call to render() and not send(). Using render() ensures the templating engine
});

app.get('/storesH', function (req, res) {

    let query1 = "SELECT storeID, storeName, storeAddress, storePlanet FROM Stores;";               // Define our query

    db.pool.query(query1, function (error, rows, fields) {    // Execute the query

        res.render('storesH', { data: rows });                  // Render the hbs file, and also send the renderer
    })
    // Note the call to render() and not send(). Using render() ensures the templating engine
});

app.get('/suppliersH', function (req, res) {

    let query1 = "SELECT supplierID, supplierName FROM Suppliers;";               // Define our query

    db.pool.query(query1, function (error, rows, fields) {    // Execute the query

        res.render('suppliersH', { data: rows });                  // Render the hbs file, and also send the renderer
    })
    // Note the call to render() and not send(). Using render() ensures the templating engine
});

app.get('/ordersH', function (req, res) {

    let query1 = "SELECT Orders.orderID, Customers.customerFName, Donuts.donutName, Stores.storeName, Orders.totalPurchased From Orders JOIN Customers ON Orders.customerID = Customers.customerID JOIN Donuts ON Orders.donutID = Donuts.donutID JOIN Stores ON Orders.storeID = Stores.storeID LIMIT 1; ";               // Define our query
    let query2 = "SELECT Orders.* , Customers.customerFName, Donuts.donutName, Stores.storeName From Orders JOIN Customers ON Orders.customerID = Customers.customerID LEFT JOIN Donuts ON Orders.donutID = Donuts.donutID JOIN Stores ON Orders.storeID = Stores.storeID;"
    let query3 = "SELECT customerID, customerFName, customerLName FROM Customers;"
    let query4 = "Select storeID, storeName FROM Stores;"
    let query5 = "Select donutID, donutName From Donuts;"
    db.pool.query(query1, function (error, q1, fields) {    // Execute the query
        db.pool.query(query2, (error, q2, fields) => {
            db.pool.query(query3, (error, q3, fields) => {
                db.pool.query(query4, (error, q4, fields) => {
                    db.pool.query(query5, (error, q5, fields) => {
                        res.render('ordersH', { data: q1, info: q2, customerData: q3, storeData: q4, donutData: q5 });                  // Render the hbs file, and also send the renderer
                    })
                })                 
            })
        })
    })
    // Note the call to render() and not send(). Using render() ensures the templating engine
});

app.get('/customersH', function (req, res) {

    let custom = req.query.search_fname
    let query1;
    if (custom === undefined) {
        query1 = "SELECT * FROM Customers;";
    }
    else {
        query1 = `SELECT * FROM Customers WHERE customerFName LIKE "${custom}%"`;
        console.log(query1)
    }
    db.pool.query(query1, function (error, rows, fields) {    // Execute the query

        res.render('customersH', { data: rows });                  // Render the hbs file, and also send the renderer
    })
});

app.get('/suppliersStoresH', function (req, res) {

    let query1 = "SELECT SupplierStoreInter.*, Suppliers.supplierName, Stores.storeName from SupplierStoreInter Join Suppliers ON SupplierStoreInter.supplierID = Suppliers.supplierID JOIN Stores ON SupplierStoreInter.storeID = Stores.storeID Order by Suppliers.supplierID "
    let query2 = "SELECT Suppliers.supplierName, Stores.storeName from SupplierStoreInter Join Suppliers ON SupplierStoreInter.supplierID = Suppliers.supplierID JOIN Stores ON SupplierStoreInter.storeID = Stores.storeID Order by Suppliers.supplierID ASC;"
    let query3 = "SELECT storeID, storeName FROM Stores"
    let query4 = "SELECT supplierID, supplierName From Suppliers"
    db.pool.query(query1, function (error, q1, fields) {    // Execute the query
        db.pool.query(query2, (error, q2, fields) => {
            db.pool.query(query3, (error, q3, fields) => {
                db.pool.query(query4, (error, q4, fields) => {
                    res.render('suppliersStoresH', { data: q1, names: q2, storeData: q3, supplierData: q4 });                  // Render the hbs file, and also send the renderer
                })                
            })                         
        })                       
    })
});


app.post('/add-person-form', function (req, res) {

    let data = req.body;

    query1 = `INSERT INTO  Customers (customerFName, customerLName, customerEmail, customerAddress, customerPlanet)
                VALUES ('${data['insert-fname']}','${data['insert-lname']}','${data['insert-email']}','${data['insert-customer-address']}','${data['insert-customer-planet']}');`;

    db.pool.query(query1, function (error, rows, fields) { // Execute the query

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/customersH'); // Render the hbs file, and also send the renderer
        }
    })
})

app.post('/delete-person-form', function (req, res) {

    let data = req.body;

    query2 = `DELETE FROM Customers WHERE customerID = ${data['deleteCustomerID']}`
    db.pool.query(query2, function (error, rows, fields) {

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/customersH'); // Render the hbs file, and also send the renderer
        }
    })
});

app.post('/update-person-form', function (req, res) {

    let data = req.body;

    query1 = `UPDATE Customers SET customerFName = ${'\''+data['fname-update']+'\''
}, customerLName = ${ '\''+data['lname-update']+'\''}, customerEmail = ${ '\''+data['email-update']+'\''}, customerAddress = ${ '\''+data['address-update']+'\''}, customerPlanet = ${ '\''+data['planet-update']+'\''}
              WHERE customerID = ${data['id-update']};`;

    db.pool.query(query1, function (error, rows, fields) { // Execute the query

        if (error) {                 // Error handling
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/customersH'); // Render the hbs file, and also send the renderer
        }
    })
})

app.post('/add-donut-form', function (req, res) {

    let data = req.body;

    query1 = `INSERT INTO Donuts (donutName, donutDescription, donutPrice)
                VALUES ('${data['insert-name']}','${data['insert-description']}','${data['insert-price']}');`;

    db.pool.query(query1, function (error, rows, fields) { // Execute the query

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/donutsH'); // Render the hbs file, and also send the renderer
        }
    })
})
app.post('/delete-donut-form', function (req, res) {

    let data = req.body;

    query2 = `DELETE FROM Donuts WHERE donutID = ${data['deleteDonutID']};`
    db.pool.query(query2, function (error, rows, fields) {                  // Execute the query

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/donutsH'); // Render the hbs file, and also send the renderer
        }
    })
});
app.post('/update-donut-form', function (req, res) {

    let data = req.body;

    query1 = `UPDATE Donuts SET donutName = ${'\'' + data['name-update'] + '\''
                }, donutDescription = ${'\'' + data['description-update'] + '\''}, donutPrice = ${'\'' + data['price-update'] + '\''}
                WHERE donutID = ${data['id-update']};`;

    db.pool.query(query1, function (error, rows, fields) { // Execute the query

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/donutsH');               // Render the hbs file, and also send the renderer
        }
    })
})

app.post('/add-order-form', function (req, res) {

    let data = req.body;

    let donut = parseInt(data['inputDonut']);
    if (isNaN(donut)) {
        donut = 'NULL';
    }

    query1 = `INSERT INTO Orders (customerID,donutID,storeID,totalPurchased)
                VALUES (${data['inputCustomer']},${donut},${data['inputStore']},${data['inputCount']});`;

    db.pool.query(query1, function (error, rows, fields) { // Execute the query

        if (error) {
            console.log(error)                             // Error Handling
            res.sendStatus(400);
        }

        else {
            res.redirect('/ordersH');                   // Render the hbs file, and also send the renderer
        }
    })
})
app.post('/update-order-form', function (req, res) {

    let data = req.body;

    let donut = parseInt(data['updateDonut']);
    if (isNaN(donut)) {
        donut = 'NULL';
    }

    query1 = `UPDATE Orders SET customerID = ${data['updateCustomer']}, donutID = ${donut}, storeID = ${data['updateStore']}, totalPurchased = ${data['updateCount']}
                WHERE orderID = ${data['updateOrderID']};`;

    db.pool.query(query1, function (error, rows, fields) { // Execute the query

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/ordersH');                       // Render the hbs file, and also send the renderer
        }
    })
})
app.post('/delete-order-form', function (req, res) {

    let data = req.body;

    query1 = `DELETE FROM Orders WHERE orderID = ${data['deleteOrderID']};`

    db.pool.query(query1, function (error, rows, fields) {  // Execute the query

        if (error) {
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/ordersH');                   // Render the hbs file, and also send the renderer
        }
    })
});

app.post('/add-supplierStore-form', function (req, res) {

    let data = req.body;

    query1 = `INSERT INTO SupplierStoreInter (supplierID,storeID)
                VALUES (${data['inputSupplier']},${data['inputStore']});`;

    db.pool.query(query1, function (error, rows, fields) {      // Execute the query

        if (error) {                                            // Error Handling
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/suppliersStoresH');                  // Render the hbs file, and also send the renderer
        }
    })
})
app.post('/delete-supplierStore-form', function (req, res) {

    let data = req.body;

    query1 = `DELETE FROM SupplierStoreInter WHERE supplierID = ${data['deleteSupplierID']} and storeID = ${data['deleteStoreID']};`

    db.pool.query(query1, function (error, rows, fields) {  // Execute the query

        if (error) {                                        // Error Handling
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/suppliersStoresH');              // Render the hbs file, and also send the renderer
        }
    })
});
app.post('/update-supplierStore-form', function (req, res) {

    let data = req.body;

    query1 = `UPDATE SupplierStoreInter SET supplierID = ${data['updateSupplier']}, storeID = ${data['updateStore']} WHERE supplierID = ${data['updateOriginalSuppplier']} AND storeID = ${data['updateOriginalStore']};`;

    db.pool.query(query1, function (error, rows, fields) {  // Execute the query

        if (error) {                                        // Error Handling
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/suppliersStoresH');              // Render the hbs file, and also send the renderer
        }
    })
})

app.post('/add-store-form', function (req, res) {

    let data = req.body;

    query1 = `INSERT INTO  Stores (storeName, storeAddress, storePlanet)
                VALUES ('${data['inputStoreName']}','${data['inputStoreAddress']}','${data['inputStorePlanet']}');`;

    db.pool.query(query1, function (error, rows, fields) {   // Execute the query

        if (error) {                                         // Error handling
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/storesH');                       // Render the hbs file, and also send the renderer
        }
    })
})
app.post('/update-store-form', function (req, res) {

    let data = req.body;

    query1 = `UPDATE Stores SET storeName = ${'\'' + data['updateStoreName'] + '\''
                }, storeAddress = ${'\'' + data['updateStoreAddress'] + '\''}, storePlanet = ${'\'' + data['updateStorePlanet'] + '\''}
                WHERE storeID = ${data['updateStoreID']};`;

    db.pool.query(query1, function (error, rows, fields) {  // Execute the query

        if (error) {                                        // Error Handling
            console.log(error)
            res.sendStatus(400);
        }

        else { 
            res.redirect('/storesH');                       // Render the hbs file, and also send the renderer
        }
    })
})
app.post('/delete-store-form', function (req, res) {

    let data = req.body;

    query1 = `DELETE FROM Stores WHERE storeID = ${data['deleteStoreID']};`

    db.pool.query(query1, function (error, rows, fields) {  // Execute the query 

        if (error) {                                        // Error Handling
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/storesH');                       // Render the hbs file, and also send the renderer
        }
    })
})
app.post('/add-supplier-form', function (req, res) {

    let data = req.body;

    query1 = `INSERT INTO Suppliers (supplierName)
                VALUES ('${data['inputSupplierName']}');`;

    db.pool.query(query1, function (error, rows, fields) {  // Execute the query

        if (error) {                                        // Error Handling
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/suppliersH');                    // Render the hbs file, and also send the renderer
        }
    })
})
app.post('/update-supplier-form', function (req, res) {

    let data = req.body;

    query1 = `UPDATE Suppliers SET supplierName = ${'\'' + data['updateSupplierName'] + '\''}
                WHERE supplierID = ${data['updateSupplierID']};`;

    db.pool.query(query1, function (error, rows, fields) {  // Execute the query

        if (error) {                                        // Error Handling
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/suppliersH');                    // Render the hbs file, and also send the renderer
        }
    })
})
app.post('/delete-supplier-form', function (req, res) {

    let data = req.body;

    query1 = `DELETE FROM Suppliers WHERE supplierID = ${data['deleteSupplierID']};`
    console.log(query1)
    db.pool.query(query1, function (error, rows, fields) {  // Execute the query

        if (error) {                                        // Error Handling
            console.log(error)
            res.sendStatus(400);
        }

        else {
            res.redirect('/suppliersH');                    // Render the hbs file, and also send the renderer
        }
    })
});
/*
    LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});


