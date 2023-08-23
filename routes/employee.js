/**
 * Title: employee.js
 * Author: Erin Brady
 * Description: Employee API Configuration.
*/

'use strict'

const express = require('express')
const router = express.Router()
const { mongo } = require('../server/utils/mongo')
const Ajv = require('ajv')
const { ObjectId } = require('mongodb')

const ajv = new Ajv() // Create a new instance of the Ajv class.

//Define a schema to validate a new task.
// TODO: Figure out why this is not preventing us from sending in additional properties.
const TaskSchema = {
  type: 'object',
  properties: {
    text: {
      type: 'string', // Property 'text' must have a string value
    }
  },
  required: ['text'], // only accept a value from the Text property
  additionalProperties: false // deny any additional properties from being included in the request payload.
}

/**
 * findEmployeeById
 * Description: Accepts values 1007 - 1012
 * @example
 * localhost:3000/api/employees/1007 - 200: Success
 * localhost:3000/api/employees/asdf - 400: Bad Request
 * localhost:3000/api/employees/1006 - 404: Not Found
 * localhost:3000/api/employees/1008 - 500: Server Error (if database is not connected)
*/
router.get('/:empId', (req, res, next) => {

  try {
    let { empId } = req.params
    empId = parseInt(empId, 10)
    console.log("empId:", empId)

    if (isNaN(empId)) {
      const err = new Error('Input must be a number.')
      err.status = 400
      console.log('Error:', err)
      next(err)
      return
    }

    mongo(async db => {
      const employee = await db.collection('employees').findOne({ empId })

      if (!employee) {
        const err = new Error('Unable to find employee with empId' + empId)
        err.status = 404
        console.log('Error:', err)
        next(err)
        return
      }

      res.send(employee)
    }, next)

  } catch(err) {
    console.log('Error: ', err)
    next(err)
  }
})

/**
 * findAllTasks - GET
 * Description: Displays all tasks that exist for the current user.
 * @example
 * localhost:3000/api/employees/1007/tasks - 200: Success
 * localhost:3000/api/employees/asdf/tasks - 400: Bad Request
 * localhost:3000/api/employees/1006/tasks - 404: Not Found
 * localhost:3000/api/employees/1008/tasks - 500: Server Error (if database is not connected)
*/
router.get('/:empId/tasks', (req, res, next) => {

  try {
    console.log('findAllTasks API')

    let { empId } = req.params // Retrieve the requested employee ID.
    empId = parseInt(empId, 10)

    // Verify that the provided Employee ID is a number.
    if (isNaN(empId)) {
      const err = new Error('Invalid Employee ID: Input must be a number.')
      err.status = 400
      console.log('Error: ', err)
      next(err)
      return
    }

    mongo( async db => {
      const tasks = await db.collection('employees').findOne(
        {empId},
        {projection: {empId: 1, todo: 1, done: 1}}
      )

      console.log('Tasks: ', tasks)

      if(!tasks) {
        const err = new Error('Unable to find tasks for empId: ' + empId)
        err.status = 404
        console.log('Error: ', err)
        next(err)
        return
      }

      res.send(tasks) // Return the Tasks array
    }, next)

  } catch (err) {
    console.log('Error: ', err)
    next(err)
  }
})

/**
 * createTask - POST
 * Description: Displays all tasks that exist for the current user.
 * @example
 * localhost:3000/api/employees/1007 - 200: Success
 * localhost:3000/api/employees/asdf - 400: Bad Request
 * localhost:3000/api/employees/1006 - 404: Not Found
 * localhost:3000/api/employees/1008 - 500: Server Error (if database is not connected)
*/

router.post('/:empId/tasks', (req, res, next) => {
  try {

    console.log('createTask API')

    let { empId } = req.params // Retrieve the requested employee ID.
    empId = parseInt(empId, 10)

    // Verify that the provided Employee ID is a number.
    if (isNaN(empId)) {
      const err = new Error('Invalid Employee ID: Input must be a number.')
      err.status = 400
      console.log('Error: ', err)
      next(err)
      return
    }

    mongo(async db => {

      const employee = await db.collection('employees').findOne({ empId })

      console.log('Employee: ', employee)

      if(!employee) {
        const err = new Error('Unable to find employee with empId: ', empId)
        err.status = 404
        console.log('Error: ', err)
        next(err)
        return
      }

      const { text } = req.body

      console.log('Request body: ', req.body)

      // Validate the request object.
      const validator = ajv.compile(TaskSchema)
      const valid = validator ({ text })

      console.log('Valid?: ', valid)

      if(!valid) {
        const err = new Error('Bad Request')
        err.status = 400
        err.errors = validator.errors
        console.log('Request body validation failed: ', err)
        next(err)
        return
      }

      const task = {
        _id: new ObjectId(),
        text
      }

      const result = await db.collection('employees').updateOne(
        { empId },
        { $push: { todo: task}}
      )

      console.log('Result: ', result)

      // If the record was not modified:
      if (!result.modifiedCount) {
        const err = new Error('Unable to create tasks for empId: ' + empId)
        err.status = 404
        console.log('Error: ', err)
        next(err)
        return
      }

      res.status(201).send({ id: task._id })

    }, next)

  } catch (err) {
    console.log('Error: ', err)
    next(err)
  }
})

module.exports = router