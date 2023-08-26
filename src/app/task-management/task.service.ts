/**
  Title: task.service.ts
  Author: Erin Brady
  Date: 08/23/2023
  Description: Task Component Services
*/

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from './tasks/item.interface';

@Injectable({
  providedIn: 'root'
})

export class TaskService {

  constructor(private http: HttpClient) { }

  getTask(empId: number) {
    return this.http.get('/api/employees/' + empId + '/tasks')
  }

  addTask(empId: number, task: Item) {
    return this.http.post('api/employees/' + empId + '/tasks', { task })
  }

}
