import { Component, OnInit, ViewEncapsulation, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { LoginService } from '../../../login/login.service';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { FileUpload, Ilc_Bex } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import * as moment from 'moment';

@Component({
  selector: 'app-bill-of-exchange',
  templateUrl: './bill-of-exchange.component.html',
  styleUrls: ['./bill-of-exchange.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [

    LoginService,
    DatePipe,
    ToasterService,
    CrudServices

  ]
})
export class BillOfExchangeComponent implements OnInit {

  @Input() boe_arr: any[];
  @Input() mode: string;
  @Input() bex_index: number;
  @Output() backToIlc: EventEmitter<any> = new EventEmitter<any>();
  billOfExchangeForm: FormGroup;
  boe_copy_doc: Array<File> = [];


  be_date: string;
  be_no: string;
  bank_ref_no: string;
  remark: string;
  status: number;
  dut_dt: string;
  be_copy: string;
  statuses: { id: number; label: string; }[];
  boeArray: any;
  ilc_id: number;
  bex_id: number;


  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  tolerance: any;


  constructor(
    private datePipe: DatePipe,
    private toasterService: ToasterService,
    private fb: FormBuilder, private crudServices: CrudServices) {

    this.statuses = [{ id: 0, label: 'Pending' }, { id: 1, label: 'Remit' }];

    this.billOfExchangeForm = this.fb.group({
      be_date: new FormControl(null, Validators.required),
      be_no: new FormControl(null, Validators.required),
      bank_ref_no: new FormControl(null),
      remark: new FormControl(null),
      dut_dt: new FormControl(null, Validators.required),
      be_copy: new FormControl(null),
    });


  }

  ngOnInit() {
    this.boeArray = this.boe_arr[0].pi_details;

    this.ilc_id = this.boe_arr[0].id;
    this.tolerance = this.boe_arr[0].tolerance;




    if (this.mode === 'Edit') {
      const bexDetails = this.boe_arr[0].bex_details;
      if (this.bex_index !== undefined) {
        const details = bexDetails[this.bex_index];
        this.be_date = details.be_date;
        this.be_no = details.be_no;
        this.remark = details.remark;
        this.status = details.status;
        this.dut_dt = details.dut_dt;
        this.bank_ref_no = details.bank_ref_no;
        this.bex_id = details.id;

      }
    }

  }




  onSubmitBOE() {

    const piArray = [];
    let amount = 0;
    let remainingTotalAmount = 0;
    this.boeArray.forEach(pi => {
      const deals = [];
      if (pi.deal_details) {
        pi.deal_details.forEach(deal => {
          if (deal.hasOwnProperty('entered_amount')) {
            deals.push({
              'pur_con_id': deal.con_id,
              'amount': deal.entered_amount
            });
            remainingTotalAmount += deal.amt_in_pi - deal.bex_amount_utilize;
            amount += parseFloat(deal.entered_amount);
          }
        });
      }




      if (deals.length > 0) {
        piArray.push({
          'pi_id': pi.piid,
          'deal_dt': deals
        });
      }

    });

    const toleranceAmount = remainingTotalAmount + (remainingTotalAmount * this.tolerance) / 100;
    var data = {
      be_date: this.convert(this.billOfExchangeForm.value.be_date),
      be_no: this.billOfExchangeForm.value.be_no,
      bank_ref_no: this.billOfExchangeForm.value.bank_ref_no,
      remark: this.billOfExchangeForm.value.remark,
      dut_dt: this.convert(this.billOfExchangeForm.value.dut_dt),
      ilc_id: this.ilc_id,
      bex_id: this.bex_id,
      pi_lc_details: JSON.stringify(piArray)

    }
    const fileData: any = new FormData();


    const document: Array<File> = this.boe_copy_doc;
    if (document.length > 0) {
      for (let i = 0; i < document.length; i++) {
        fileData.append('local_purchase_bex', document[i], document[i]['name']);
      }
    }

    if(this.mode === 'Add') {
      if (toleranceAmount >= amount && amount != 0) {
        this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
          let fileDealDocs = [];
          let filesList = res.uploads.local_purchase_bex;
  
          if (res.uploads.local_purchase_bex) {
            for (let i = 0; i < filesList.length; i++) {
              fileDealDocs.push(filesList[i].location);
            }
            data['be_copy'] = JSON.stringify(fileDealDocs);
          }
  
          if (piArray.length > 0) {
            this.crudServices.addData<any>(Ilc_Bex.add, data)
              .subscribe(response => {
                this.toasterService.pop(response.message, response.message, response.data);
                this.onBack();
              });
          } else {
            this.toasterService.pop('error', 'error', 'Amount Not Added');
          }
  
         
        });
      } else {
        this.toasterService.pop('error', 'error', 'Amount Exceeds to Remaining amount with tolerance');
      }
    } else if(this.mode === 'Edit') {
      this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
        let fileDealDocs = [];
        let filesList = res.uploads.local_purchase_bex;

        if (res.uploads.local_purchase_bex) {
          for (let i = 0; i < filesList.length; i++) {
            fileDealDocs.push(filesList[i].location);
          }
          data['be_copy'] = JSON.stringify(fileDealDocs);
        }
      });


          this.crudServices.updateData<any>(Ilc_Bex.update, data)
            .subscribe(response => {
              this.toasterService.pop(response.message, response.message, response.data);
              this.onBack();
            });
        

    }


    // if (toleranceAmount >= amount && amount != 0) {
    //   this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
    //     let fileDealDocs = [];
    //     let filesList = res.uploads.local_purchase_bex;

    //     if (res.uploads.local_purchase_bex) {
    //       for (let i = 0; i < filesList.length; i++) {
    //         fileDealDocs.push(filesList[i].location);
    //       }
    //       data['be_copy'] = JSON.stringify(fileDealDocs);
    //     }



    //     if (this.mode === 'Add') {
    //       if (piArray.length > 0) {
    //         this.crudServices.addData<any>(Ilc_Bex.add, data)
    //           .subscribe(response => {
    //             this.toasterService.pop(response.message, response.message, response.data);
    //             this.onBack();
    //           });
    //       } else {
    //         this.toasterService.pop('error', 'error', 'Amount Not Added');
    //       }
    //     } else if (this.mode === 'Edit') {

    //       this.crudServices.updateData<any>(Ilc_Bex.update, data)
    //         .subscribe(response => {
    //           this.toasterService.pop(response.message, response.message, response.data);
    //           this.onBack();
    //         });
    //     }

    //   });
    // } else {
    //   this.toasterService.pop('error', 'error', 'Amount Exceeds to Remaining amount with tolerance');
    // }





  }

  boe_copy(event: any) {
    this.boe_copy_doc = <Array<File>>event.target.files;
  }

  convert(date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }
  /** new key is added on amount entered to the boeArray , same json array  */
  getPiArray(item, sub_item, amount, event) {


    const indexOfMainArray = this.boeArray.indexOf(item);
    const indexOfDealArray = this.boeArray[indexOfMainArray].deal_details.indexOf(sub_item);


    this.boeArray[indexOfMainArray].deal_details[indexOfDealArray]['entered_amount'] = amount;


    // if (Number(this.boeArray[indexOfMainArray].deal_details[indexOfDealArray]['amt_in_pi']) - Number(this.boeArray[indexOfMainArray].deal_details[indexOfDealArray]['bex_amount_utilize']) >= amount) {

    // 	this.boeArray[indexOfMainArray].deal_details[indexOfDealArray]['entered_amount'] = amount;
    // } else {
    // 	this.toasterService.pop('error', 'error', 'Amount Exceeds to Remaining amount');
    // 	event.target.value = 0;

    // }
  }


  onBack() {
    this.backToIlc.emit(false);
  }

  calculateDueDate(date) {
    const days = (this.boeArray[0].deal_details) ? this.boeArray[0].deal_details[0].pay_val : 0;
    // var startdate = startdate.format("DD-MM-YYYY");
    // var new_date = moment(date, "DD-MM-YYYY").add(5, 'days');

    if (date) {
      var futureDate = new Date(date);
      futureDate.setDate(futureDate.getDate() + days);
      if (futureDate) {
        this.dut_dt = this.convert(futureDate);
      }
    }


  }








}
