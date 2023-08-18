/**
 * Title: security.service.ts
 * Author: Erin Brady
 * Date: 08/16/23
 * Description: findEmployeeById Service
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class SecurityService {

  constructor(private http: HttpClient) { }

  findEmployeeById(empId: number) {
    return this.http.get('/api/employees/' + empId)
  }
}
