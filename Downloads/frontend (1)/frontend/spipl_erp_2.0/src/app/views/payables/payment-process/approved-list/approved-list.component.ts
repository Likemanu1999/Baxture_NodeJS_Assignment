import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { PaymentRequestRes } from '../../payment-request-list/payment-request-res.model';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { Payables, SpiplBankMaster } from '../../../../shared/apis-path/apis-path';


@Component({
  selector: 'app-approved-list',
  templateUrl: './approved-list.component.html',
  styleUrls: ['./approved-list.component.scss'],
  providers: [DatePipe, ToasterService, CrudServices],
  encapsulation: ViewEncapsulation.None,
})

/**
* Showing all approved payment requests.
*/
export class ApprovedListComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;
  paymentReqList: PaymentRequestRes[];
  beforeFilterList: PaymentRequestRes[];
  isLoading: boolean = true;
  bsRangeValue: any = [];
  cols: { field: string; header: string; width: string; }[];
  totalAmount: number;
  spiplBankList: any;
  postArray: any = [];
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 10000
    });
  orgEmpDistinct = [];
  listStatus: number = 1;
  status: { id: number; name: string; }[];
  afterFilterList: PaymentRequestRes[];

  companyDistinctArr = [];
  filteredValuess = [];
  catArr = [];
  request_by = [];



  constructor(private datePipe: DatePipe,
    private toasterService: ToasterService, private crudServices: CrudServices) {
    this.cols = [
      { field: 'id', header: 'Req.No.', width: '100px' },
      { field: 'company_name', header: 'Company Name', width: '100px' },
      { field: 'record_id', header: 'Reference ID', width: '100px' },
      { field: 'category', header: 'Category.', width: '100px' },
      { field: 'org_emp_name', header: 'Beneficiary', width: '100px' },
      { field: 'req_amount', header: 'Amount', width: '100px' },
      { field: 'advanced_agnst_bill', header: 'Payment Type', width: '100px' },
      { field: 'normal_priority', header: 'Priority', width: '100px' },
      { field: 'remark', header: 'Remark', width: '100px' },
      { field: 'added_date', header: 'Added Date', width: '100px' },
      { field: 'added_by_name', header: 'Request By', width: '100px' },
      { field: 'approved_date', header: 'Approve Date', width: '100px' },
      { field: 'approved_by_name', header: 'Approve By', width: '100px' },
      { field: 'spipl_bank_id', header: 'Bank', width: '200px' },
      { field: 'paid_amount', header: 'Paying Amount', width: '200px' },
      { field: 'application_status', header: 'Application', width: '100px' },
    ];

    this.status = [{ id: 1, name: "Pending" }, { id: 2, name: "Submited" }]

  }
  /**
  * Getting all approved request from the server & bank from bank master.
  * Creating distinct array by call createDistinct().
  */
  ngOnInit() {
    this.isLoading = true;
    const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.bsRangeValue = [new Date(today), new Date(today)];
    const fromdate = this.datePipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd');
    const todate = this.datePipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd');
    this.crudServices.getOne<any>(SpiplBankMaster.bankType, { bank_type: 1 }).subscribe((res) => {
      this.spiplBankList = res;      
    });

    this.crudServices.getOne<any>(Payables.payable_list, {
      req_date_from: fromdate,
      req_date_to: todate
    }).subscribe((response) => {
      this.beforeFilterList = response;
      this.paymentReqList = this.beforeFilterList.filter((data) => data.request_status === 1 ); //data.request_status === 1 && data.utr_no === null => Removing utr no condition for quick fix 
      this.afterFilterList = this.paymentReqList
      this.totalAmount = this.paymentReqList.reduce((previousValue, currentValue) => previousValue + (currentValue['req_amount'] || 0), 0);
      this.isLoading = false;    
      this.createDistinct(this.paymentReqList);      
      this.filterList();
    });
  }
  /**
  * Creating distinct array of beneficiary list for filter.
  */
  createDistinct(items) {
    let lookup = {};
    let lookup_company = {};
    let lookupcat = {};
    let lookupRequest = {};
    let result = [];
    for (let item, i = 0; item = items[i++];) {
      const name = item.org_emp_name;
      const requestby = item.added_by_name;
      if (item.company_id == 1) {
        item.company_name = 'PVC';
      } else if (item.company_id == 2) {
        item.company_name = 'PE & PP';
      }
      const company_name = item.company_name
      const category = item.category
      if (!(name in lookup)) {
        lookup[name] = 1;
        this.orgEmpDistinct.push({ 'org_emp_name': name });
      }

      if (!(company_name in lookup_company)) {
        lookup_company[company_name] = 1;
        this.companyDistinctArr.push({ 'company_name': company_name });
      }

      if (!(category in lookupcat)) {
        lookupcat[category] = 1;
        this.catArr.push({ 'category': category });
      }
      if (!(requestby in lookupRequest)) {
        lookupRequest[requestby] = 1;
        this.request_by.push({ 'added_by_name': requestby });
      }
    }
  }

  filterList() {
    if (this.listStatus == 1) {
      this.paymentReqList = this.afterFilterList.filter((data) => data.paid_amount == null);
    } else if (this.listStatus == 2) {
      this.paymentReqList = this.afterFilterList.filter((data) => data.paid_amount != null);
    }
    else {
      this.paymentReqList = this.afterFilterList;
    }

    this.totalAmount = this.paymentReqList.reduce((previousValue, currentValue) => previousValue + (currentValue['req_amount'] || 0), 0);
  }

  getcompany(company_id) {
    if (company_id == 1) {
      return "PVC";
    } else if (company_id == 2) {
      return "PE & PP";
    }    else if (company_id == 3) {
      return "Surisha";
    }
  }

  getRequestText(val) {
    if (val === 1) {
      return 'Advanced';
    } else if (val === 2) {
      return 'Against Bill';
    }
  }
  getPriorityText(val) {
    if (val === 1) {
      return 'Normal';
    } else if (val === 2) {
      return 'High';
    }
  }
  /**
  * we are updating banks & amount as per user selection to the specific request.
  */
  updateList(item, controlname, value, index, $event?) {
    let i = this.paymentReqList.findIndex(function (val, i) {
      return val.id === item.id
    });
    if ($event) {
      const text = $event.target.options[$event.target.options.selectedIndex].text;
      this.paymentReqList[i]['spiplbank'] = text;
    }
    this.paymentReqList[i][controlname] = value;

    if (controlname == 'paid_amount') {
      if (item.req_amount >= value) {
        this.paymentReqList[i][controlname] = value;
      } else {
        this.paymentReqList[i][controlname] = item.req_amount;
        this.toasterService.pop('warning', 'warning', 'Amount Exceeded');
        // this.paymentReqList[index]['paid_amount'] = null;
      }
    }
  }
  /**
  * On submit this methods gets executed & build request object to send the server using service.
  * For updating request with SPIPL Bank, Paid Amount.
  */
  updateAll() {
    this.postArray = [];
    this.paymentReqList.forEach(element => {
      if (element.spipl_bank_id !== 0 && element.spipl_bank_id !== null && element.paid_amount !== null && element.paid_amount > 0 && element.paid_amount !== undefined) {
        this.postArray.push({ id: element.id, spipl_bank_id: element.spipl_bank_id, paid_amount: element.paid_amount, application_status: element.application_status });
      }
    });
    if (this.postArray.length > 0) {
      this.afterFilterList = this.paymentReqList;
      this.crudServices.updateData<any>(Payables.update_sb_paid_amount, {
        req_details_arr: this.postArray
      }).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.filterList();
      });
    } else {
      this.toasterService.pop('error', 'error', 'Please Select Bank and Enter Amount');
    }

  }
  /**
  * This method is used to filter the requests by beneficiary.
  */
  onchange(event, name) {
    const arr = [];
    if (event.value.length > 0) {
      for (let i = 0; i < event.value.length; i++) {
        arr.push(event.value[i][name]);
      }
      this.table.filter(arr, name, 'in');

    } else {
      this.table.filter('', name, 'in');
    }
  }


  onFilter(event, dt) {
    this.filteredValuess = event.filteredValue;

    this.totalAmount = this.filteredValuess.reduce((previousValue, currentValue) => previousValue + (currentValue['req_amount'] || 0), 0);
  }
}

