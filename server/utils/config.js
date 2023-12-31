/**
 * Title: config.js
 * Author: Erin Brady
 * Description: App Configuration: Environment Variables
*/

'use strict'

const {
  DB_USERNAME = 'nodebucket_user',
  DB_PASSWORD = 's3cret',
  DB_NAME = 'nodebucket'
} = process.env

const CONFIG = {
  DB_URL: `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@bellevueuniversity.nhzwaya.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
  DB_NAME: DB_NAME
}

module.exports = CONFIG
