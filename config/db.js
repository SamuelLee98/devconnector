//mongo db connection

const mongoose = require('mongoose'); //what we are using to connect
const config = require('config'); //we want to grab the string we made in the config package
const db = config.get('mongoURI'); //grab the value and put into a variable.

//a function we call in our other files. this function is an asynchronous arrow function
const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      //returns a promise so we need to wait until it connects... pass in the db. second one it to prevent error message
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB; //export the method
