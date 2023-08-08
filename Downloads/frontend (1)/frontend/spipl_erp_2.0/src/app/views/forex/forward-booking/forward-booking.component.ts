import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';

import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { Currency } from '../../../shared/dropdown-services/currency';
import { SelectService } from '../../../shared/dropdown-services/select-services';
import { ForwardBookService } from './forward-book-service';



@Component({
  selector: 'app-forward-booking',
  templateUrl: './forward-booking.component.html',
  styleUrls: ['./forward-booking.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    DatePipe,
    SpiplBankService,
    SelectService,
    ForwardBookService
  ]
})
export class ForwardBookingComponent implements OnInit {

  @ViewChild('addForward', { static: false }) public addForward: ModalDirective;
  @ViewChild('updateForward', { static: false }) public updateForward: ModalDirective;


  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to Change?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'left';
  public closeOnOutsideClick: boolean = true;
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  add_forward_cover: boolean = false;
  serverUrl: string;
  user: UserDetails;
  isLoading = false;
  links: string[] = [];
  public today = new Date();


  // filter Arrays

  spipl_bank = [];
  currency: Currency;
  bsRangeValue: any = [];
  bsRangeValue1: any = [];
  currentYear: number;
  currdate = new Date();
  forward_book_date_from: string;
  forward_book_date_to: string;
  due_date_from: string;
  due_date_to: string;
  forward_list = [];
  global_forward_list = [];
  cols = [];
  forward_bank_id :any = 1;
  currency_id = 0;
  tot_amount = 0;
  tot_final_rate = 0;
  tot_spot_rate = 0;
  tot_margin = 0;
  tot_token = 0;
  tot_premium = 0;
  tot_premium_inr = 0;
  tot_final_usd = 0;
  tot_spot_inr = 0;
  tot_utilized = 0;
  tot_cancel = 0;
  tot_balance = 0;
  tot_margin_inr = 0;
  totalExpenseOnPending = 0;
  totalRevalAmount = 0;
  totalMTM = 0;

  addForm: FormGroup;

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });

  // on Edit

  book_date: string;
  bank_id: number;
  book_amt: string;
  book_curr: number;
  final_rate: string;
  spot_rate: string;
  from_date: string;
  to_date: string;
  margin: string;
  token: string;
  forward_id: any;
  cancel_amount: any;
  reval_rate: any;
  editFlag: boolean = false;

  bsValue: Date ;
  due_dt: Date ;
  spipl_banks = 1;
  _selectedColumns: any[];




  constructor(private route: ActivatedRoute,
    private router: Router,
    private toasterService: ToasterService,
    private permissionService: PermissionService,
    private loginService: LoginService,
    private SpiplService: SpiplBankService,
    public datepipe: DatePipe,
    private selectService: SelectService,
    private forwardBookService: ForwardBookService
  ) {
    this.serverUrl = environment.serverUrl;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;

    this.add_forward_cover = (this.links.indexOf('add forward covered') > -1);

    //our bank 1
    this.SpiplService.getBankListType(1).subscribe((response) => {
      this.spipl_bank = response;
    });

    this.selectService.getCurrency().subscribe((response) => {
      this.currency = response;

    });

    this.addForm = new FormGroup({

      'bank_id': new FormControl(null, Validators.required),
      'booking_date': new FormControl(null, Validators.required),
      'amount': new FormControl(null, Validators.required),
      'final_rate': new FormControl(null),
      'spot_rate': new FormControl(null),
      'from_date': new FormControl(null, Validators.required),
      'to_date': new FormControl(null, Validators.required),
      'currency_type': new FormControl(null, Validators.required),
      'margin': new FormControl(null, Validators.required),
      'token': new FormControl(null, Validators.required),
      'cancel_amount': new FormControl(null),
      'reval_rate': new FormControl(null),

    });





    this.currentYear = Number(this.datepipe.transform(this.currdate, 'yyyy'));
  //  this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    if (this.datepipe.transform(this.currdate, 'MM') > '03') {

      this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

  } else {

      this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

  }

    // this.bsRangeValue1 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

    if (this.datepipe.transform(this.currdate, 'MM') > '03') {

      this.bsRangeValue1 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

  } else {

      this.bsRangeValue1 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

  }

    this.bsValue =null;

    this.cols = [
      { field: 'CurrencyName', header: 'Currency', style: '100px' },
      { field: 'id', header: 'FID', style: '100px' },
      { field: 'booking_date', header: 'Booking Date', style: '150px' },
      { field: 'amount', header: 'Total USD', style: '150px' },
      { field: 'spot_rate', header: 'Spot Rate', style: '100px' },
      { field: '', header: 'Premium', style: '100px' },
      { field: 'margin', header: 'Margin', style: '100px' },
      { field: 'final_rate', header: 'Final Rate', style: '100px' },
      { field: '', header: 'From-To Date', style: '200px' },
      { field: '', header: 'Premium INR', style: '150px' },
      { field: '', header: 'Margin INR', style: '150px' },
      { field: '', header: 'Final Rate INR', style: '150px' },
      { field: '', header: 'Cancel Amount', style: '180px' },
      { field: '', header: 'Utilized', style: '150px' },
      { field: '', header: 'Balance', style: '180px' },
      { field: '', header: 'Total Expense', style: '180px' },
      { field: '', header: 'Days Maturity &FB', style: '180px' },
      { field: '', header: 'Reval Rate', style: '180px' },
      { field: '', header: 'Reval Amount', style: '180px' },
      { field: '', header: 'MTM', style: '180px' },
      { field: 'token', header: 'Token', style: '100px' },
    ];

    

  }

  ngOnInit() {
    this.forward_book_date_from = this.convert(this.bsRangeValue[0]);
    this.forward_book_date_to = this.convert(this.bsRangeValue[1]);



    if (this.bsValue) {
      this.due_dt = this.bsValue;
    } else {
     // this.due_dt ='';
    }
    //this.getForwardList();
  }

  onSubmit($e, variable, id) {
    console.log(variable,$e, $e[id],'gggggggggg')
    //this.forward_list = [];
    this.forward_list = this.global_forward_list;

    if ($e === undefined) {
      this[variable] = 0;
    } else {
      if(variable=='currency_id')
      {
        this[variable] = $e[id];
      }else{
        this[variable] = $e;
      }
     
    }



    if (this.currency_id && this.forward_bank_id) {
      console.log(this.forward_list,"this.forward_listthis.forward_listbefore")
      this.forward_list = this.filterCurrency(this.forward_list);
      console.log(this.forward_list,"this.forward_listthis.forward_list")
      this.forward_list = this.filterBank(this.forward_list);
     

    } else if (this.currency_id !== 0 && this.forward_bank_id === 0) {

      this.forward_list = this.filterCurrency(this.forward_list);
    

    } else if (this.currency_id === 0 && this.forward_bank_id !== 0) {

      this.forward_list = this.filterBank(this.forward_list);
      localStorage.setItem('selected_spipl_banks', $e);

    }
    
    


	

    this.calculateTotal();
  }

 

  onDateChange(event) {
    this.forward_list = [];
    
    console.log(this.bsValue,"this.bsValue");
    if (event !== null) {
      this.forward_book_date_from = this.convert(event[0]);
      this.forward_book_date_to = this.convert(event[1]);

      if (this.bsValue) {
        this.due_dt = this.bsValue;
      } else {
        //this.due_dt ='';
      }

    } else {
      this.forward_book_date_from = '';
      this.forward_book_date_to = '';
     // this.due_dt ='';
    }

    this.getForwardList();
  }


 



  filterBank(row) {
    return row.filter(data => data.bank_id === this.forward_bank_id);
  }

  filterCurrency(row) {
    console.log(this.currency_id,"this.currency_id")
   
    return row.filter(data => data.currency_type === this.currency_id);
  }



  getForwardList() {
    console.log(localStorage.getItem('selected_spipl_banks'));
    
    if(localStorage.getItem('selected_spipl_banks'))
    {
      this.forward_bank_id = Number(localStorage.getItem('selected_spipl_banks'));
    }else
    {
      this.forward_bank_id = 1;
    }


    this.forward_list = [];
    this.forwardBookService.getAllForwardBook(this.forward_book_date_from, this.forward_book_date_to, this.due_dt).subscribe((response) => {

      console.log(response,"before")
      this.forward_list =this.filterBank(response)
      
      
      console.log(this.forward_list,"after")
      console.log(this.forward_list, "forward_list");
      this.global_forward_list = response;

    
      this.calculateTotal();



    });
  }


  convert(str) {
    if (str) {
      const date = new Date(str),
        mnth = ('0' + (date.getMonth() + 1)).slice(-2),
        day = ('0' + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join('-');
    } else {
      return '';
    }
  }

  addForwardCover() {
    this.updateForward.show();
  }

  onDelete(id: number, index) {
    if (id) {
      this.forwardBookService.deleteForwardBook(id)
        .subscribe(response => {
          this.toasterService.pop(response.message, response.message, response.data);
          this.forward_list.splice(index, 1);
          this.calculateTotal();
        });
    }
  }

  calculateTotal() {
    this.tot_amount = 0;
    this.tot_final_rate = 0;
    this.tot_spot_rate = 0;
    this.tot_margin = 0;
    this.tot_token = 0;
    this.tot_premium = 0;
    this.tot_premium_inr = 0;
    this.tot_final_usd = 0;
    this.tot_spot_inr = 0;
    this.tot_cancel = 0;
    this.tot_utilized = 0;
    this.tot_balance = 0;
    this.tot_margin_inr = 0;
    this.totalExpenseOnPending = 0;
    this.totalRevalAmount = 0;
    this.totalMTM = 0;

    let premium = 0;
    let premium_inr = 0;
    let final_usd = 0;
    let spot_inr = 0;
    let margin_inr = 0;
    let balanceAmountUSD = 0;
    let totalExpense = 0;
    let dayMaturityFb = 0;
    let revalAmount = 0;
    for (const val of this.forward_list) {

      let date1 = new Date(val.booking_date);
      let date2 = new Date(val.to_date);
      let Difference_In_Time = date2.getTime() - date1.getTime();
      let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
      val.dayMaturityFb = Difference_In_Days;

      premium = Number(val.final_rate) - Number(val.spot_rate) - Number(val.margin);
      premium_inr = Number(val.amount) * Number(premium);
      margin_inr = Number(val.amount) * Number(val.margin);
      final_usd = Number(val.final_rate) * Number(val.amount);
      spot_inr = Number(val.spot_rate) * Number(val.amount);
      balanceAmountUSD = Number(val.amount) - Number(val.UtilisedAmount) - Number(val.cancel_amount);
      totalExpense = (Number(premium) + Number(val.margin)) * balanceAmountUSD;
      //console.log(Number(val.amount), Number(val.UtilisedAmount), Number(val.cancel_amount),balanceAmountUSD,totalExpense,Number(premium) , Number(val.margin) ,"nehauti")

      revalAmount = Number(val.reval_rate) * balanceAmountUSD;

      this.tot_amount = this.tot_amount + Number(val.amount);
      this.tot_final_rate = this.tot_final_rate + Number(val.final_rate);
      this.tot_spot_rate = this.tot_spot_rate + Number(val.spot_rate);
      this.tot_margin = this.tot_margin + Number(val.margin);
      this.tot_token = this.tot_token + Number(val.token);
      this.tot_premium = this.tot_premium + premium;
      this.tot_premium_inr = this.tot_premium_inr + premium_inr;
      this.tot_margin_inr = this.tot_margin_inr + margin_inr;
      this.tot_final_usd = this.tot_final_usd + final_usd;
      this.tot_spot_inr = this.tot_spot_inr + spot_inr;
      this.tot_cancel = this.tot_cancel + Number(val.cancel_amount);
      this.tot_utilized = this.tot_utilized + Number(val.UtilisedAmount);
      this.tot_balance = this.tot_balance + Number(val.amount) - Number(val.UtilisedAmount) - Number(val.cancel_amount);
      this.totalExpenseOnPending = this.totalExpenseOnPending + Number(totalExpense);
      this.totalRevalAmount = this.totalRevalAmount + Number(revalAmount);


      val.premium = premium;
      val.premium_inr = premium_inr;
      val.margin_inr = margin_inr;
      val.final_usd = final_usd;
      val.spot_inr = spot_inr;
      val.totalExpense = totalExpense;

      val.reval_amount = revalAmount;

      this.totalMTM = this.totalMTM + (Number(val.final_usd) - Number(val.reval_amount));

    }
  }

  onEdit(item) {

    this.forward_id = item.id;
    this.editFlag = true;
    // console.log(this.forward_id);
    this.bank_id = item.bank_id;
    this.book_date = item.booking_date;
    this.book_amt = item.amount;
    this.book_curr = item.currency_type;
    this.final_rate = item.final_rate;
    this.spot_rate = item.spot_rate;
    this.margin = item.margin;
    this.token = item.token;
    this.from_date = item.from_date;
    this.to_date = item.to_date;
    this.cancel_amount = item.cancel_amount;
    this.reval_rate = item.reval_rate;
    this.updateForward.show();



  }

  onAddForm() {

    if (!this.addForm.invalid) {

      // const formData: any = new FormData();
      // formData.append('bank_id', this.addForm.value.bank_id);
      // formData.append('booking_date', this.convert(this.addForm.value.booking_date));
      // formData.append('amount', this.addForm.value.amount);
      // formData.append('final_rate', this.addForm.value.final_rate);
      // formData.append('spot_rate', this.addForm.value.spot_rate);
      // formData.append('from_date', this.convert(this.addForm.value.from_date));
      // formData.append('to_date', this.convert(this.addForm.value.to_date));
      // formData.append('currency_type', this.addForm.value.currency_type);
      // formData.append('margin', this.addForm.value.margin);
      // formData.append('token', this.addForm.value.token);
      // formData.append('forward_id', this.forward_id);


      // if (this.addForm.value.cancel_amount) {
      //   formData.append('cancel_amount', this.addForm.value.cancel_amount);

      // } else {
      //   formData.append('cancel_amount', 0);
      // }


      let cancelAmount = 0;
      if (this.addForm.value.cancel_amount) {
        cancelAmount = this.addForm.value.cancel_amount
      }


      let formData: any = {
        bank_id: this.addForm.value.bank_id,
        booking_date: this.convert(this.addForm.value.booking_date),
        amount: this.addForm.value.amount,
        final_rate: this.addForm.value.final_rate,
        spot_rate: this.addForm.value.spot_rate,
        from_date: this.convert(this.addForm.value.from_date),
        to_date: this.convert(this.addForm.value.to_date),
        currency_type: this.addForm.value.currency_type,
        margin: this.addForm.value.margin,
        token: this.addForm.value.token,
        forward_id: this.forward_id,
        cancel_amount: cancelAmount,
        reval_rate: this.addForm.value.reval_rate,
      };

      //const fileData = new FormData();
      //  fileData.append('body', JSON.stringify(formData));

      let fileData = formData;


      if (this.forward_id !== undefined && this.forward_id !== '' && this.forward_id !== 0) {
        this.forwardBookService.updateForwardBook(fileData)
          .subscribe(response => {
            this.toasterService.pop(response.message, response.message, response.data);
            if (response.code === '100') {
              this.onCloseModal();
            }
          });
      } else {
        this.forwardBookService.addForwardBook(fileData)
          .subscribe(response => {
            this.toasterService.pop(response.message, response.message, response.data);
            if (response.code === '100') {
              this.onCloseModal();
            }
          });

      }



    }

  }

  onCloseModal() {
    this.forward_id = '';
    this.editFlag = false;
    this.updateForward.hide();
    // this.addForward.hide();
    this.addForm.reset();
    //this.getForwardList();
  }

  forwardCovered(id: number) {
    this.router.navigate(['forex/forward-covered/' + id]);
  }


  // on your component class declare
  onFilter(event, dt) {
    let filteredValuess = [];
    this.tot_amount = 0;
    this.tot_final_rate = 0;
    this.tot_spot_rate = 0;
    this.tot_margin = 0;
    this.tot_token = 0;
    this.tot_premium = 0;
    this.tot_premium_inr = 0;
    this.tot_final_usd = 0;
    this.tot_spot_inr = 0;
    this.tot_cancel = 0;
    this.tot_utilized = 0;
    this.tot_balance = 0;
    filteredValuess = event.filteredValue;


    let premium = 0;
    let premium_inr = 0;
    let final_usd = 0;
    let spot_inr = 0;
    // console.log( this.filteredValuess);
    for (const val of filteredValuess) {
      premium = val.final_rate - val.spot_rate - val.margin;
      premium_inr = val.amount * premium;
      final_usd = val.final_rate * val.amount;
      spot_inr = val.spot_rate * val.amount;


      this.tot_amount = this.tot_amount + Number(val.amount);
      this.tot_final_rate = this.tot_final_rate + Number(val.final_rate);
      this.tot_spot_rate = this.tot_spot_rate + Number(val.spot_rate);
      this.tot_margin = this.tot_margin + Number(val.margin);
      this.tot_token = this.tot_token + Number(val.token);
      this.tot_premium = this.tot_premium + premium;
      this.tot_premium_inr = this.tot_premium_inr + premium_inr;
      this.tot_final_usd = this.tot_final_usd + final_usd;
      this.tot_spot_inr = this.tot_spot_inr + spot_inr;
      this.tot_cancel = this.tot_cancel + Number(val.cancel_amount);
      this.tot_utilized = this.tot_utilized + Number(val.UtilisedAmount);
      this.tot_balance = this.tot_balance + Number(val.amount) - Number(val.UtilisedAmount) - Number(val.cancel_amount);
      val.premium = premium;
      val.premium_inr = premium_inr;
      val.final_usd = final_usd;
      val.spot_inr = spot_inr;
    }


  }


}
