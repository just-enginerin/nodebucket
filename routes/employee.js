/**
 * Title: employee.js
 * Author: Erin Brady
 * Description: Configure API routes.
*/

'use strict'

const express = require('express')
const router = express.Router()
const { mongo } = require('../server/utils/mongo')

// findEmployeeById
// localhost:3000/api/employees/1007
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

module.exports = router