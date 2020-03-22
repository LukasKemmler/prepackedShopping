USE getfromsupermarket;
    
    SET FOREIGN_KEY_CHECKS=0;

    CREATE TABLE webuser(username VARCHAR(255), 
                         email VARCHAR(255), 
                         password VARCHAR(255), 
                         id INT NOT NULL AUTO_INCREMENT, 
                         PRIMARY KEY(id));

    
    CREATE TABLE shoppingListItem(productID INT, 
                                  shoppingListId INT, 
                                  quantity INT, 
                                  id INT NOT NULL AUTO_INCREMENT, 
                                  PRIMARY KEY(id), 
                                  FOREIGN KEY (shoppingListId) REFERENCES shoppingList(id),
                                  FOREIGN KEY (productID) REFERENCES product(id));

    CREATE TABLE shoppingList(userID INT,
                              supermarketID INT,
                              id INT NOT NULL AUTO_INCREMENT,
                              PRIMARY KEY(id), 
                              FOREIGN KEY(supermarketID) REFERENCES supermarket(id), 
                              FOREIGN KEY (userID) REFERENCES webuser(id));
   
    CREATE TABLE supermarket(name VARCHAR(255), 
                             city VARCHAR(255), 
                             postalcome INT, 
                             addressLine1 VARCHAR(255), 
                             addressLine2 VARCHAR(255), 
                             maxNrOfCustomer INT, 
                             id INT NOT NULL AUTO_INCREMENT, 
                             PRIMARY KEY(id));

    CREATE TABLE product(productName VARCHAR(255),
                         quantityInStock INT, 
                         buyPrice DECIMAL(5,2),
                         supermarketID INT, 
                         id INT NOT NULL AUTO_INCREMENT,  
                         PRIMARY KEY(id), 
                         FOREIGN KEY (supermarketID) REFERENCES supermarket(id));

    CREATE TABLE timeSlots(userID INT, 
                           supermarketID INT, 
                           slotDate DATE, 
                           slotFromTime INT, 
                           slotToTime INT,
                           slotStatus TEXT, 
                           id INT NOT NULL AUTO_INCREMENT, 
                           PRIMARY KEY(id), 
                           FOREIGN KEY (supermarketID) REFERENCES supermarket(id));

    CREATE TABLE timeSlotEntry(timeslotID INT, 
                               supermarketID INT, 
                               id INT NOT NULL AUTO_INCREMENT, 
                               PRIMARY KEY(id),
                               FOREIGN KEY (timeslotID) REFERENCES timeSlots(id), 
                               FOREIGN KEY (supermarketID) REFERENCES supermarket(id));
    SET FOREIGN_KEY_CHECKS=1;
