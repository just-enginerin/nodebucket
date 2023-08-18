/**
  Title: task-management-routing.component.ts
  Author: Erin Brady
  Date: 08/16/2023
  Description: Task Management Routing
*/

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskManagementComponent } from './task-management.component';
import { TasksComponent } from './tasks/tasks.component';

const routes: Routes = [
  {
    path: '',
    component: TaskManagementComponent,
    children: [
      {
      path: 'my-tasks',
      component: TasksComponent,
      title: 'NodeBucket: My Tasks'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TaskManagementRoutingModule { }
