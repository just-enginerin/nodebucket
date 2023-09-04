/**
 * Title: app-routing.module.ts
 * Author: Professor Krasso
 * Date: 8/5/23
 * Description: Client-side routing configuration
 */

// imports statements
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './shared/auth.guard';
import { ContactComponent } from './contact/contact.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AboutComponent } from './about/about.component';

// routes array with a path, component, and title for each route in the application (e.g. home, about, contact, etc.)
const routes: Routes = [
  {
    path: '',
    component: BaseLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        title: 'NodeBucket: Home'
      },
      {
        path: 'home',
        component: HomeComponent,
        title: 'NodeBucket: Home'
      },
      {
        path: 'about',
        component: AboutComponent,
        title: 'NodeBucket: About'
      },
      {
        path: 'contact',
        component: ContactComponent,
        title: 'NodeBucket: Contact Us'
      },
      {
        path: 'not-found',
        component: NotFoundComponent,
        title: 'NodeBucket: 404'
      },
      {
        path: 'task-management',
        loadChildren: () => import('./task-management/task-management.module').then(m => m.TaskManagementModule),
        canActivate: [authGuard]
      }
    ]
  },
  {
    // path for the security module (e.g. login, register, forgot password, etc.)
    path: 'security',
    loadChildren: () => import('./security/security.module').then(m => m.SecurityModule)
  },
  {
    // Redirect to Not Found, if a user navigates to any of the paths not listed above.
    path: '**',
    redirectTo: 'not-found'
  }
];

@NgModule({
  // imports the RouterModule and defines the routes array and other options (e.g. useHash, enableTracing, scrollPositionRestoration)
  imports: [RouterModule.forRoot(routes, { useHash: true, enableTracing: false, scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})

export class AppRoutingModule { }
