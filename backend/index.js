const express = require('express');
var cors = require('cors');
const mysql = require('promise-mysql');
const bodyParser = require('body-parser');
const app = express();

app.enable('trust proxy');

app.use(cors());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const winston = require('winston');
const {LoggingWinston} = require('@google-cloud/logging-winston');
const loggingWinston = new LoggingWinston();
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console(), loggingWinston],
});

let pool;
const createPool = async () => {
    pool = await mysql.createPool({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
        connectionLimit: 5,
        connectTimeout: 10000,
        waitForConnections: true,
        queueLimit: 0
    });
};
createPool();

// TODO: add table details
/*const ensureSchema = async () => {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS`
    );
};
ensureSchema();*/

app.get('/', (req, res) => {
    res.send('Hello World!');
});

/*saves a shopping list to the database
checks if the goods are available
changes the number of available goods
*/
app.post('/api/shoppinglist', async (req, res) => {
    const productIds = req.body.productIds;
    const quantities = req.body.quantities;
    const supermarketID = req.body.supermarketId;
    const userId = req.body.userId;
    const buyQuantityMap = new Map();
    for (let i = 0; i < productIds.length; i++) {
        buyQuantityMap.set(productIds[i], quantities[i]);
    }
    const stmt = `SELECT id, quantityInStock
        FROM product
        WHERE id IN (?);`;
    const quantityQuery = pool.query(stmt, [productIds]);
    const quantity = await quantityQuery;

    console.log(quantity);
    console.log("reading quantities successfully!");

    //determine resulting quantities and stop execution if not sufficiont goods are available
    let newQuantities = new Map();
    quantity.forEach(element => {
        newQuantities.set(element.id, element.quantityInStock - buyQuantityMap.get(element.id));
    });
    /*for (let row of quantity) {
        console.log(row);
        newQuantities.set(row.productID, row.quantityInStock - buyQuantityMap.get(row.productID));

        if( newQuantities.get(row.productID)  < 0) {
            res.send('product not available!');
            return;
        }
    }*/
    console.log(newQuantities);
    console.log("determined new quantities!");
    try {
        const stmt2 = 'INSERT INTO shoppingList (userID, supermarketID) VALUES (?, ?);'
        const shoppingListInsert = pool.query(stmt2, [userId, supermarketID]);
        const {insertId} = await shoppingListInsert;
        console.log("inserted shopping succesfully!");

        const stmt3 = 'INSERT INTO shoppingListItem (productID, shoppingListId, quantity) VALUES (?, ?, ?);';
        const quarryArray = [];
        quantity.forEach(element => {
            quarryArray.push(pool.query(stmt3, [element.id, insertId, buyQuantityMap.get(element.id)]));
        });

        const stmt4 = 'UPDATE product SET quantityInStock = ? WHERE id = ?;'
        const quarryArray2 = [];
        quantity.forEach(element => {
            quarryArray2.push(pool.query(stmt4, [newQuantities.get(element.id), element.id]));
        });
        await Promise.all(quarryArray);
        await Promise.all(quarryArray2);
    } catch(err) {
        logger.error(err);
        res.send('Unable to insert shopping list!');
        return;
    }
    res.send('success');
});

//looks up a specific shopping list
app.get('/api/shoppinglist', async (req, res) => {
    const listid = req.query.listid;
    const stmt = `SELECT product.ProductName, shoppingListItem.quantity
        FROM shoppingListItem
        INNER JOIN product
        ON shoppingListItem.productId = product.productID
        WHERE shoppingListItem.shoppingListId = ?;`;
    const shoppingListQuery = pool.query(stmt, [listid]);
    const shoppingList = await shoppingListQuery;
    res.send(shoppingList);
});

//list all supermarkets
app.get('/api/supermarkets', async (req, res) => {
    const stmt = 'SELECT id, name, city FROM supermarket';
    const supermarketQuery = pool.query(stmt);
    const supermarket = await supermarketQuery;
    res.send(supermarket);
});

//list products of a supermarket
app.get('/api/listproducts', async (req, res) => {
    const supermarketID = req.query.supermarketid;
    const stmt = 'SELECT id, productName, quantityInStock, buyPrice FROM product WHERE supermarketID = ?;';
    const productsQuery = pool.query(stmt, [supermarketID]);
    const products = await productsQuery;
    res.send(products);
});

//write username and password to database
app.post('/api/saveuser', async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    try {
        const stmt = 'INSERT INTO webuser (username, email, password) VALUES (?, ?, ?);';
        await pool.query(stmt, [name, email, password]);
    } catch (err) {
        logger.error(err);
        res.send('Unable to insert user!');
        return;
    }
    res.send('success');
});

//write supermarket details to database
app.post('/api/savemarket', async (req, res) => {
    const {name, city, postalcode, addressLine1, addressLine2} = req.body;
    try {
        const stmt = 'INSERT INTO supermarket (name, city, postalcome, addressLine1, addressLine2) VALUES (?, ?, ?, ?, ?);';
        await pool.query(stmt, [name, city, postalcode, addressLine1, addressLine2]);
    } catch (err) {
        logger.error(err);
        res.send('Unable to insert supermarket!');
        return;
    }
    res.send('success');
});

//add name, shopProductId and amount to database
app.post('/api/addproduct', async (req, res) => {
    const {productName, quantity, price, supermarketId} = req.body;
    try {
        const stmt = 'INSERT INTO product (ProductName, quantityInStock, buyPrice, supermarketID) VALUES (?, ?, ?, ?);';
        await pool.query(stmt, [productName, quantity, price, supermarketId]);
    } catch (err) {
        logger.error(err);
        res.send('Unable to insert product!');
        return;
    }
    res.send('success');
});

app.post('/api/getfreetimeslot', async (req, res) => {
    const {supermarketID} = req.body;
    const stmt = "SELECT DISTINCT slotDate, slotFromTime, slotToTime FROM timeSlots WHERE supermarketID = ? AND STRCMP(slotStatus, 'empty') = 0;";
    const timeslotQuery = pool.query(stmt, [supermarketID]);
    const timeslots = await timeslotQuery;
    res.send(timeslots);
});

app.post('/api/booktimeslot', async (req, res) => {
    const {userID, slotDate, slotFromTime, slotToTime, supermarketID} = req.body;
    const stmt = "UPDATE timeSlots SET slotStatus = 'used', userID = ? WHERE slotDate = ? AND slotFromTime = ? AND slotToTime = ? and superMarketID = ? LIMIT 1;";
    try {
        const timeslotQuery = pool.query(stmt, [userID, slotDate, slotFromTime, slotToTime, supermarketID]);
        await timeslotQuery;
    } catch (err) {
        logger.error(err);
        res.send('Unable to insert timeslot!');
        return;
    }
    res.send('success');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});