# PolyLists
PolyLists is a real-time collaborative list tool built with Polymer.

## Dependencies
MongoDB is required for list storage. See _How to install_ and _How to run_ for more info.

NPM:
* **[Express](http://expressjs.com/)**
* **[socket.io](http://socket.io/)**
* **[node-uuid](https://github.com/broofa/node-uuid)**
* **[MongoDB](http://docs.mongodb.org/ecosystem/drivers/node-js/)**
* **[monk](https://github.com/Automattic/monk)**

Bower:
* **[Polymer](https://www.polymer-project.org/1.0/)**
* **[jquery](https://jquery.com/)**
* **[juicy-tile-list](https://github.com/Juicy/juicy-tile-list)**


## How to install
Download and install MongoDB, a manual is available [here](https://docs.mongodb.org/manual/).

To install the NPM dependencies, open a terminal and execute the following command :

    npm install
	
To install the Bower dependencies, install [bower](http://bower.io/) with `npm install -g bower` and then run:

    bower install

## How to run
Execute this command to run MongoDB:

    mongod --dbpath [path-to-database]
	
Create a database in MongoDB with the follwing command in the MongoDB client:

    use PolyLists

Execute this command to start the application:

    node app.js

## Demo
Check out a live demo [here](https://polylists.herokuapp.com/)!