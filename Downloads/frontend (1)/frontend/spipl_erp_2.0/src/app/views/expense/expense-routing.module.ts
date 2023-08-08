import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { RouterModule, Routes } from '@angular/router';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { TripMasterComponent } from './trip-master/trip-master.component';
import { ExpenseCatComponent } from './expense-cat/expense-cat.component';
import { AddTripComponent } from './add-trip/add-trip.component';
import { TripDetailsComponent } from './trip-details/trip-details.component';
import { AuthGuard } from '../../_helpers/auth.guard';

const routes: Routes = [
  {
    path : '',
    data : {
      title : 'Expense'
    },
    children : [
      {
        path : '',
        redirectTo : 'expense'
      },
      {
        path : 'expense-list',
        component : ExpenseListComponent,
        canActivate: [AuthGuard],
        data : {
          title : 'Expense List'
        }
      },
      {
        path: 'add-expense',
        component: AddExpenseComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Add Expense'
        }
      },
      {
        path: 'add-expense/:id',
        component: AddExpenseComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Edit Expense'
        }
      },
      {
        path : 'trip-list',
        component : TripMasterComponent,
        canActivate: [AuthGuard],
        data : {
          title : 'Trip List'
        }
      },
      {
        path : 'expense-cat-master-list',
        component : ExpenseCatComponent,
        canActivate: [AuthGuard],
        data : {
          title : 'Expense Category List'
        }
      },
      {
        path : 'add-trip',
        component : AddTripComponent,
        canActivate: [AuthGuard],
        data : {
          title : 'Trip Add'
        }
      },
      {
        path: 'add-trip/:id',
        component: AddTripComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Edit Trip'
        }
      },
      {
        path: 'trip-details/:id',
        component: TripDetailsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Trip Details'
        }
      }
    ]
  }
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ExpenseRoutingModule { }
