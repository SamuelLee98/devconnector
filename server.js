///Main Entry file -> for now very simple express server
const express = require('express');
const connectDB = require('./config/db'); //require is a method to load modules. we just exported this module from db.js

const app = express(); //initialize app with express

//Connect database
connectDB();

//Init Middleware
app.use(express.json({ extended: false })); //initialize middleware.

app.get('/', (req, res) => res.send('API Running')); //end point --> get request.. just sends data string to the browser.

// Define Router (access the routes)
app.use('/api/users', require('./routes/api/users')); //app.use('endpoint',pertain to users file) also /api/users pertains to the router.get's slash in users.js
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

const PORT = process.env.PORT || 5000; //look for an environment variable called port, used when uploaded to heroku. If not goes default to 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); //you want the app to listen on a port. Once it connects, it console logs.
