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
    return this.http.get('/api/tasks/' + empId + '/tasks')
  }

  addTask(empId: number, task: Item) {
    return this.http.post('api/tasks/' + empId + '/tasks', { task })
  }

  updateTask(empId: number, todo: Item[], done: Item[]) {
    return this.http.put('/api/tasks/' + empId + '/tasks', {
      todo,
      done
    })
  }

  deleteTask(empId: number, taskId: string) {
    return this.http.delete('/api/tasks/' + empId + '/tasks/' + taskId)
  }
}
