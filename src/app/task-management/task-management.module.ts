/**
  Title: task-management-routing.module.ts
  Author: Erin Brady
  Date: 08/16/2023
  Description: Task Management Module
*/

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskManagementRoutingModule } from './task-management-routing.module';
import { TaskManagementComponent } from './task-management.component';
import { TasksComponent } from './tasks/tasks.component';


@NgModule({
  declarations: [
    TaskManagementComponent,
    TasksComponent
  ],
  imports: [
    CommonModule,
    TaskManagementRoutingModule
  ]
})

export class TaskManagementModule { }
