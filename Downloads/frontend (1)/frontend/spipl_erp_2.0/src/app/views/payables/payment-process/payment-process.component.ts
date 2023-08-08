import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { Payables } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'app-payment-process',
  templateUrl: './payment-process.component.html',
  styleUrls: ['./payment-process.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    LoginService,
    CrudServices
  ]
})
export class PaymentProcessComponent implements OnInit {
  secondStepFlag: boolean = false;
  firstStepFlag: boolean = true;
  thirdStepFlag: boolean = false;
  selectedIndex: number;
  user: UserDetails;
  role_id: any;
  isPastPayments: boolean;
  constructor(private loginService: LoginService, private crudServices: CrudServices, private datePipe: DatePipe) {
    this.user = this.loginService.getUserDetails();
    this.role_id = this.user.userDet[0].role_id;
  }

  changeStatus(status: any) {
    this.isPastPayments = status.disable;
	}

  ngOnInit() {
    if (this.role_id == 24) {
      this.secondStepFlag = true;
    }
 
    const fromdate = new Date(moment().format('YYYY-06-15'));
    const todate =  new Date(moment().subtract(1, "days").format("YYYY-MM-DD"));
    this.crudServices.getOne<any>(Payables.pending_process_payment_list, {
      req_date_from : fromdate,
      req_date_to: todate
    }).subscribe((response) => {
      if (response.length > 0) {
        this.isPastPayments = true;
        this.firstStepFlag = false;
        this.secondStepFlag = true;
        this.setIndex({selectedIndex : 1});
      }
    });
  }
  /**
  * On step click we are loading component with the help of flags.
  */
  setIndex(event) {
    this.selectedIndex = event.selectedIndex;
    if (this.selectedIndex === 0) {
      this.firstStepFlag = true;
    } else {
      this.firstStepFlag = false;
    }
    if (this.selectedIndex === 1) {
      this.secondStepFlag = true;
    } else {
      this.secondStepFlag = false;
    }

    if (this.selectedIndex === 2) {
      this.thirdStepFlag = true;
    } else {
      this.thirdStepFlag = false;
    }
  }
}
