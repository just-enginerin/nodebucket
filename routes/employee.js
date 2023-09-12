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
const bcrypt = require('bcryptjs')

const saltRounds = 10
const ajv = new Ajv() // Create a new instance of the Ajv class.

const employeeSchema = {
  type: 'object',
  properties: {
    empId: { type: 'number' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['empId', 'firstName', 'lastName', 'email', 'password'],
  additionalProperties: false
}

const updateEmployeeSchema = {
  type: 'object',
  properties: {
    empId: { type: 'number' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    role: { type: 'string' }
  },
  required: ['firstName', 'lastName', 'role'],
  additionalProperties: false
}

/**
 * findAllEmployees
*/
router.get('/', (req, res, next) => {
  try {

    mongo(async db => {
      const employees = await db.collection('employees').find(
        {},
        { projection: { empId: 1, firstName: 1, lastName: 1, email: 1, role: 1 } }
      )
      .sort({ empId: 1 })
      .toArray()

      console.log('employees', employees)

      res.send(employees)
    })

  } catch(err) {
    console.log('Error: ', err)
    next(err)
  }
})

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
      const employee = await db.collection('employees').findOne(
        { empId },
        { projection: { empId: 1, firstName: 1, lastName: 1, email: 1, role: 1 } }
      )

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
 * createEmployee
*/
router.post('/', (req, res, next) => {
  try {

    const { employee } = req.body
    console.log('employee: ', employee)

    const validator = ajv.compile(employeeSchema)
    const valid = validator(employee)

    if(!valid) {
      const err = new Error('Bad Request')
      err.status = 400
      err.errors = validator.errors
      console.log('req.body validation failed: ', err)
      next(err)
      return
    }

    employee.password = bcrypt.hashSync(employee.password, saltRounds)

    mongo (async db => {
      const result = await db.collection('employees').insertOne(employee)

      console.log('result: ', result)

      res.json({ id: result.insertedId })
    }, next)

  } catch (err) {
    console.log('err', err)
    next(err)
  }
})

/**
 * deleteEmployee
*/
router.delete('/:empId', (req, res, next) => {
  try {

    let { empId } = req.params
    empId = parseInt(empId, 10)

    if (isNaN(empId)) {
      const err = new Error('input must be a number')
      err.status = 400
      console.log('err: ', err)
      next(err)
      return
    }

    mongo(async db => {
      const result = await db.collection('employees').deleteOne({ empId })

      console.log('result: ', result)

      if(result.deletedCount !== 1) {
        const err = new Error('Not found')
        err.status = 404
        console.log('err: ', err)
        next(err)
        return
      }

      res.status(204).send()
    }, next)

  } catch (err) {
    console.log('err', err)
    next(err)
  }
})

module.exports = router
