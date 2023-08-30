/**
  Title: tasks.component.ts
  Author: Erin Brady
  Date: 08/16/2023
  Description: Tasks Component Logic
*/

import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TaskService } from '../task.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from './employee.interface';
import { Item } from './item.interface';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})

export class TasksComponent {

  employee: Employee
  empId: number
  todo: Item[]
  done: Item[]
  errorMessage: string
  successMessage: string

  newTaskForm: FormGroup = this.fb.group({
    text: [null, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])],
    category: [null]
  })

  constructor (
    private cookieService: CookieService,
    private taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.employee = {} as Employee
    this.todo = []
    this.done = []
    this.errorMessage = ''
    this.successMessage = ''

    this.empId = parseInt(this.cookieService.get('session_user'), 10)

    this.taskService.getTask(this.empId).subscribe({
      next: (emp: any) => {
        console.log('Employee: ', emp)
        this.employee = emp
      },
      error: (err) => {
        console.log('Error: ', err)
        this.errorMessage = err.message
        this.hideAlert()
      },
      complete: () => {
        console.log('complete')

        this.todo = this.employee.todo ? this.employee.todo : []
        this.done = this.employee.done ? this.employee.done : []

        console.log('todo: ', this.todo)
        console.log('done: ', this.done)
      }
    })
  }

  // Retrieve the values from the task form.
  addTask() {
    const text = this.newTaskForm.controls['text'].value
    const category = this.newTaskForm.controls['category'].value

    if(!category) {
      this.errorMessage = 'Please provide a category.'
      this.hideAlert()
      return
    }

    let newTask = this.getTask(text, category)

    this.taskService.addTask(this.empId, newTask).subscribe({
      next: (task: any) => {
        console.log('Task added with ID: ', task.id)

        newTask._id = task.id // Set the new task._id to the task.id

        this.todo.push(newTask)
        this.newTaskForm.reset()

        this.successMessage = 'Task added successfully!'
        this.hideAlert()
      },
      error: (err) => {
        this.errorMessage = err.message
        this.hideAlert()
      }
    })
  }

  deleteTask(taskId: string) {
    console.log('Task item: ', taskId)

    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    this.taskService.deleteTask(this.empId, taskId).subscribe({
      next: (res: any) => {
        console.log('Task deleted with ID: ', taskId)

        this.todo = this.todo.filter(t => t._id?.toString() !== taskId)
        this.done = this.done.filter(t => t._id?.toString() !== taskId)

        this.successMessage = 'Task completed successfully!'
        this.hideAlert()
      },
      error: (err) => {
        console.log('err: ', err)
        this.errorMessage = err.message
        this.hideAlert()
      }
    })
  }

  // Automatically close errors after 3 seconds
  hideAlert() {
    setTimeout(() => {
      this.errorMessage = ''
      this.successMessage = ''
    }, 3000)
  }

  getTask(text: string, categoryName: string) {
    let task: Item = {} as Item

    const white = '#FFFFFF'
    const green = '#4BCE97'
    const purple = '#9F8FEF'
    const red = '#F87462'

    switch (categoryName) {
      case 'testing':
        task = {
          text: text,
          category: {
            categoryName: categoryName,
            backgroundColor: green
          }
        }
        return task

      case 'meetings':
        task = {
          text: text,
          category: {
            categoryName: categoryName,
            backgroundColor: red
          }
        }
        return task

      case 'projects':
        task = {
          text: text,
          category: {
            categoryName: categoryName,
            backgroundColor: purple
          }
        }
        return task

      case 'misc':
        task = {
          text: text,
          category: {
            categoryName: categoryName,
            backgroundColor: green
          }
        }
        return task

      default:
        task = {
          text: text,
          category: {
            categoryName: categoryName,
            backgroundColor: white
          }
        }
        return task
    }
  }

}
