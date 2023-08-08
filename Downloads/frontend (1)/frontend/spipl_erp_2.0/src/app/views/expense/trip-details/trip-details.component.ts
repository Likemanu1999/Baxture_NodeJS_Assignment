import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExpenseMaster, StaffMemberMaster, TripMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices]
})
export class TripDetailsComponent implements OnInit {
  expenseData: any[];
  expenseDataSingle: any[];
  tripData: any[];
  trip_id: number;

  expense_details: any;
  tripName: string;
  tripAgent: string;


  expenseCategory: string;
  expenseDate: string;
  serviceProvider: string;
  subOrgName: string;
  description: string;
  amount: number;
  reimburseAmount: number;
  refundAmount: number;
  refundableStatus: String;
  status: string;
  emp_id: any;
  addedDate: Date;
  modifiedDate: Date;
  display_content: boolean = false;
  addedBy: number;
  modified_by: number;

  newemparr: string[];
  FullName: String;

  FullNameAddedBy: string;
  FullNameModifiedBy: string;
  ExpenseCopy: [];
  CreditNote: [];

  serverUrl: string;
  selected: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private crudServices: CrudServices) {
    this.serverUrl = environment.serverUrl;
  }

  ngOnInit(): void {

    this.route.params.subscribe((params: Params) => {
      this.trip_id = +params['id'];

    });
    this.getRespectiveExpense();
    this.getTripDetails();

  }

  getRespectiveExpense() {
    this.crudServices.getOne<any>(ExpenseMaster.getTripWiseExpense, { trip_id: this.trip_id }).subscribe((response) => {
      this.expenseData = response;
    });

  }

  getTripDetails() {
    this.crudServices.getOne<any>(TripMaster.getOne, {
      id: this.trip_id
    }).subscribe((response) => {

      this.tripName = response[0].trip_name;
      this.tripAgent = response[0].sub_org_master.sub_org_name;
      this.CreditNote = JSON.parse(response[0].credit_note);

    });
  }

  getDetailsExpense(expenseId: number) {

    this.display_content = true;
    this.expense_details = expenseId;
    this.selected = expenseId;

    this.crudServices.getOne<any>(ExpenseMaster.getOne, {
      id: expenseId
    }).subscribe((response) => {


      this.expenseDataSingle = response;
      const data = response[0];

      this.expenseCategory = data.category;
      this.expenseDate = data.expense_date;
      this.serviceProvider = data.service_provider;
      this.subOrgName = data.sub_org_master.sub_org_name;
      this.description = data.description;
      this.amount = data.amount;
      this.reimburseAmount = data.reimburse_amount;
      this.refundAmount = data.refund_amount;
      this.addedBy = data.added_by;
      this.modified_by = data.modified_by;
      this.addedDate = data.added_date;
      this.modifiedDate = data.modified_date;
      this.ExpenseCopy = JSON.parse(data.expense_copy);


      if (this.addedBy !== 0) {
        this.FullNameAddedBy = data.addBy.first_name + ' ' + data.addBy.last_name;

      }

      if (this.modified_by !== 0) {
        this.FullNameModifiedBy = data.modifiedBy.first_name + ' ' + data.modifiedBy.last_name;
      }
      // Employee Full Name
      const temparr = [] = data.expense_master_employees;
      const empnamearr = [];
      temparr.forEach(element => {
        const fullName = element.staff_member_master.first_name + ' ' + element.staff_member_master.last_name;
        empnamearr.push({ name: fullName });
      });

      this.newemparr = empnamearr;



      // this.status = data.status;
      if (data.status === 0) {
        this.status = 'Pending';
      } else if (data.status === 1) {
        this.status = 'Approved';

      } else if (data.status === 2) {
        this.status = 'Rejected';
      }

      // this.refundableStatus = data.refundable_status;
      if (data.refundable_status === 0) {
        this.refundableStatus = 'Partial Refund';
      } else if (data.refundable_status === 1) {
        this.refundableStatus = 'Full Refund';
      } else if (data.refundable_status === 2) {
        this.refundableStatus = 'Non Refund';
      }
    });
  }



  isActive(item) {
    return this.selected === item;
  }

  onBack() {
    this.router.navigate(['expense/trip-list']);
  }




}
