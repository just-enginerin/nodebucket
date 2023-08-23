/**
 * Attribution
 * Title: mongo.js
 * Author: Erin Brady
 * Description: Connect to database
*/

'use strict'

const { MongoClient } = require('mongodb')
const config = require('./config')

// MongoDB URL with user credentials
const MONGO_URL = config.DB_URL //'mongodb+srv://nodebucket_user:s3cret@bellevueuniversity.nhzwaya.mongodb.net/nodebucket?retryWrites=true&w=majority'

const mongo = async(operations, next) => {
  try {
    console.log('Connecting to MongoDB Atlas...')

    // Connect to MongoDB cluster.
    const client = await MongoClient.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    // Select the database.
    const db = client.db(config.DB_NAME)
    console.log('Successfully connected to MongoDB Atlas! ', db)

    // Execute the operatons.
    await operations(db)
    console.log('Operation was successful!')

    // Close the database connection.
    client.close()
    console.log('Closing the connection to MongoDB Atlas...')

  } catch (err) {
    // Create a new error object.
    const error = new Error('Error connecting to database', err)
    error.status = 500
    // Display the error message within the console.
    console.log('Error connecting to database:', err)

    next(error) // ErrBack: callback function that passes over to the next error, standard for handling errors within a Node.js environment.
  }
}

module.exports = { mongo }
