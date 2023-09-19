/**
 * Title: security.js
 * Author: Erin Brady
 * Description: Sign In API Configuration.
*/

'use strict'

const express = require('express')
const { mongo } = require('../utils/mongo')
const bcrypt = require('bcryptjs')
const Ajv = require('ajv')

const router = express.Router()
const ajv = new Ajv()

const signinSchema = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['email', 'password'],
  additionalProperties: false
}

/** Sign In POST request */
router.post('/signin', (req, res, next) => {
  try {
    const signin = req.body
    console.log('Sign in object: ', signin)

    const validator = ajv.compile(signinSchema)
    const valid = validator(signin)

    if (!valid) {
      const err = new Error('Bad Request')
      err.status = 400
      err.errors = validator.errors
      console.log('signin validation failed', validator.errors)
      next(err)
      return
    }

    mongo(async db => {
      const employee = await db.collection('employees').findOne(
        { email: signin.email }
      )

      if (!employee) {
        const err = new Error('Not Found')
        err.status = 401
        err.message = 'Unauthorized: The email or password you entered is invalid.'
        console.log('Unauthorized: The email or password you entered is invalid: ', signin.email)
        next(err)
        return
      }

      // compareSync(value from signin page, stored encrypted password)
      let passwordIsValid = bcrypt.compareSync(signin.password, employee.password)

      if (!passwordIsValid) {
        const err = new Error('Unauthorized')
        err.status = 401
        err.message = 'Unauthorized: Invalid password'
        console.log('Unauthorized: Invalid password', err)
        next(err)
        return
      }

      res.send(employee)
    }, next)

  } catch (err) {
    console.log('err: ', err)
    next(err)
  }
})