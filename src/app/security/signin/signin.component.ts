/**
 *  Title: signin.component.css
 *  Author: Erin Brady
 *  Date: 08/16/2023
 *  Description: Sign In - user authentication logic
*/

import { Component } from '@angular/core';
import { SecurityService } from '../security.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service'

export interface SessionUser {
  empdId: number;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})

export class SigninComponent {
  errorMessage: string
  isLoading: boolean = false

  signinForm = this.fb.group({
    email: [null, Validators.compose([Validators.required, Validators.email])],
    password: [null, Validators.compose([Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$')])]
  })

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cookieService: CookieService,
    private secService: SecurityService,
    private route: ActivatedRoute
  ) {
    this.errorMessage = ''
  }

  signIn() {
    this.isLoading = true;

    let email = this.signinForm.controls['email'].value
    let password = this.signinForm.controls['password'].value

    if (!email || !password) {
      this.errorMessage = 'Please provide an email address and password.'
      this.isLoading = false
      return
    }

    this.secService.signin(email, password).subscribe({
      next: (employee: any) => {

        console.log('Employee: ', employee)

        const sessionCookie = {
          fullName: `${employee.firstName} ${employee.lastName}`,
          role: employee.role,
          empId: employee.empId
        }

        this.cookieService.set('session_user', JSON.stringify(sessionCookie), 1)

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/'

        this.isLoading = false

        this.router.navigate([returnUrl])
      },
      error: (err) => {
        this.isLoading = false
        console.log('err: ', err)

        if (err.error.status === 401) {
          this.errorMessage = err.message
          return
        }
      }
    })

    /*
    this.secService.findEmployeeById(empId).subscribe({
      next: (employee: any) => {
        this.sessionUser = employee
        this.cookieService.set('session_user', empId, 1)
        this.cookieService.set('session_name', `${employee.firstName} ${employee.lastName}`, 1)

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/'

        this.isLoading = false

        this.router.navigate([returnUrl])
      },
      error: (err) => {
        this.isLoading = false

        if(err.error.message) {
          this.errorMessage = err.error.message
          return
        }

        this.errorMessage = err.message
      }
    })
    */
  }
}
