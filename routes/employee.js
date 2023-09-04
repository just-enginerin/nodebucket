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

// Category schema
const categorySchema = {
  type: 'object',
  properties: {
    categoryName: {type: 'string'},
    backgroundColor: {type: 'string'}
  },
  required: ['categoryName', 'backgroundColor'],
  additionalProperties: true
}


//Define a schema to validate a new task.
// TODO: Figure out why this is not preventing us from sending in additional properties.
const taskSchema = {
  type: 'object',
  properties: {
    text: { type: 'string' }, // Property 'text' must have a string value
    category: categorySchema
  },
  required: ['text', 'category'], // only accept a value from the Text and Category properties
  additionalProperties: false // deny any additional properties from being included in the request payload.
}

const tasksSchema = {
  type: 'object',
  required: ['todo', 'done'],
  additionalProperties: false,
  properties: {
    todo: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          text: { type: 'string' },
          category: categorySchema
        },
        required: ['_id', 'text', 'category'],
        additionalProperties: false
      }
    },
    done: {
      type: 'array',
      items: {
        properties: {
          _id: { type: 'string' },
          text: { type: 'string'},
          category: categorySchema
        },
        required: ['_id', 'text', 'category'],
        additionalProperties: false
      }
    }
  }
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

    // Retrieve the employee ID from the request parameters.
    let { empId } = req.params
    empId = parseInt(empId, 10)
    console.log("empId:", empId)

    // Validation: Enforce that the employee ID is a number.
    if (isNaN(empId)) {
      const err = new Error('Input must be a number.')
      err.status = 400
      console.log('Error:', err)
      next(err)
      return
    }

    // If validation passes, make a call to the database.
    mongo(async db => {
      const employee = await db.collection('employees').findOne({ empId })

      // Display an error if the employee's data was not successfully retrieved.
      if (!employee) {
        const err = new Error('Unable to find employee with empId' + empId)
        err.status = 404
        console.log('Error:', err)
        next(err)
        return
      }

      // Otherwise, send the employee data in the response.
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

      // Fetch an employee from the database that matches the provided employee ID.
      const employee = await db.collection('employees').findOne({ empId })

      console.log('Employee: ', employee)

      // If a matching employee was not found, return an error.
      if(!employee) {
        const err = new Error('Unable to find employee with empId: ' + empId)
        err.status = 404
        console.log('Error: ', err)
        next(err)
        return
      }

      // Retrieve the new task information from the request body.
      const { task } = req.body

      console.log('New Task: ', task)
      console.log('Request body: ', req.body)

      // Validate the request object.
      const validator = ajv.compile(taskSchema)
      const valid = validator(task)

      console.log('Valid?: ', valid)

      // If task validation fails, return an error.
      if(!valid) {
        const err = new Error('Bad Request: ' + validator.errors[0].message)
        err.status = 400
        err.errors = validator.errors
        console.log('Request body validation failed: ', err)
        next(err)
        return
      }

      // Build the new Task object to insert into the database.
      const newTask = {
        _id: new ObjectId(),
        text: task.text,
        category: task.category
      }

      const result = await db.collection('employees').updateOne(
        { empId },
        { $push: { todo: newTask}}
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

      res.status(201).send({ id: newTask._id })

    }, next)

  } catch (err) {
    console.log('Error: ', err)
    next(err)
  }
})

/**
 * updateTask
*/

router.put('/:empId/tasks', (req, res, next) => {
  try {

    let { empId } = req.params
    empId = parseInt(empId, 10)

    if (isNaN(empId)) {
      const err = new Error('input must be a number')
      err.status = 400
      console.log('err', err)
      next(err)
      return
    }

    mongo(async db => {

      const employee = await db.collection('employees').findOne({ empId })
      console.log('employee: ', employee)

      if (!employee) {
        const err = new Error('Unable to find employee with empId: ' + empId)
        err.status = 404
        console.log('err', err)
        next(err)
        return
      }

      const tasks = req.body
      console.log('tasks', tasks)

      const validator = ajv.compile(tasksSchema)
      const valid = validator(tasks)

      console.log('valid', valid)

      if (!valid) {
        const err = new Error('Bad Request')
        err.status = 400
        err.errors = validator.errors
        console.log('req.body validation failed: ', err)
        next(err)
        return
      }

      const result = await db.collection('employees').updateOne(
        { empId },
        { $set: { todo: tasks.todo, done: tasks.done }}
      )

      if(!result.modifiedCount) {
        const err = new Error('Unable to update tasks for empId: ' + empId)
        err.status = 404
        console.log('err', err)
        next(err)
        return
      }

      res.status(204).send()

    }, next)


  } catch(err) {
    console.log('err', err)
    next(err)
  }
})

/**
 * deleteTasks
*/
router.delete('/:empId/tasks/:taskId', (req, res, next) => {
  console.log('inside the deleteTasks function: ')

  try {

    let { empId } = req.params
    const { taskId } = req.params

    console.log(`EmpId: ${empId}, TaskId: ${taskId}`)

    empId = parseInt(empId, 10)

    if(isNaN(empId)) {
      const err = new Error('input must be a number')
      err.status = 400
      console.log('err', err)
      next(err)
      return
    }

    mongo(async db => {

      let emp = await db.collection('employees').findOne({ empId })

      console.log('emp', emp)

      if (!emp) {
        const err = new Error('Unable to find employee with empId ' + empId)
        err.status = 404
        console.log('err', err)
        next(err)
        return
      }

      // Initialize lists if they don't already exist within the record.
      if (!emp.todo) emp.todo = []
      if (!emp.done) emp.done = []

      // Filter out the designated task ID.
      const todoItems = emp.todo.filter(task => task._id.toString() !== taskId.toString())
      const doneItems = emp.done.filter(task => task._id.toString() !== taskId.toString())

      console.log(`To Do items: ${todoItems}; Done items: ${doneItems}`)

      const result = await db.collection('employees').updateOne(
        {'empId': empId},
        {$set: { todo: todoItems, done: doneItems}}
      )

      console.log('result: ', result)

      res.status(204).send()
    }, next)

  } catch(err) {
    console.log('Error: ', err)
    next(err)
  }
})

module.exports = router
