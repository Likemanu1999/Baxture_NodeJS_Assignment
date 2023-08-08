import { Component, OnInit, ViewEncapsulation, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormBuilder, FormControl, Validators } from "@angular/forms";
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { billOfEntry, EmailTemplateMaster, FileUpload, PortMaster } from '../../../shared/apis-path/apis-path';
import { ExportService } from "../../../shared/export-service/export-service";
import * as moment from "moment";
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
  selector: 'app-bill-of-entry-email',
  templateUrl: './bill-of-entry-email.component.html',
  styleUrls: ['./bill-of-entry-email.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToasterService, PermissionService, LoginService, DatePipe, CrudServices, ExportService]
})

export class BillOfEntryEmailComponent implements OnInit {
  @ViewChildren("inputs") public inputs: ElementRef<HTMLInputElement>[];
  @ViewChild('dt', { static: false }) table: Table;
  @ViewChild("mailModal", { static: false }) public mailModal: ModalDirective;
  @ViewChild("uploadTr6Modal", { static: false }) public uploadTr6Modal: ModalDirective;


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
  serverUrl: string;
  user: UserDetails;
  isLoading = false;

  links: string[] = [];

  private toasterService: ToasterService; // Toast Service Object and config
  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000,
  });

  cols = [];
  be_list: any = [];

  lc_date: any;
  be_date: any;

  orgList: any = []
  bankList: any = []

  checkedList: any = [];
  filteredValues = [];




  selectedEmails: any = []; //selecte list of mail wich useer selected from checkbox
  emailTempleteDetails: any; //selected email templet  in this case stock transfer templets
  emailFooterTemplete: any; // common footer template
  emailBodyTemplete: any; //body html custome
  emailSubject: any;
  emailFrom: any;
  selectedEmailscc: any = [];

  datePickerConfig = staticValues.datePickerConfig;
  maxDate: Date = new Date(); // date range will not greater  than today
  bsRangeValue: any = []; //DatePicker range Value

  lc_types = [{ label: 'LC BE', value: 1 }, { label: 'NON-LC', value: 2 }]
  payment_types = [{ label: 'Pending', value: 1 },{ label: 'To Acknowledge', value: 2 } ,{ label: 'Completed', value: 3 }]
  selected_lc_type: number = 1;
  selected_pay_type: number ;

  emailForm: FormGroup;

  send_mail: boolean = false;
  get_be: boolean = false;
  be_csv: boolean = false;

  currentYear: number;
	date = new Date();
  fileData: FormData = new FormData();
  be_id: any;
  be_no: string;
  tr6_upload: boolean;
  isMailLoader: boolean;
  duty_total: number;
  payment_date: any;
  payment_filter: boolean;
  payment_column: boolean;
  tr6_column: boolean;
  payment_ack: boolean;
  payment_pending_list: boolean;
  payment_ack_list: boolean;
  port_list: any;
  port: number;
  filter_table_data = [];
  port_list_flag: boolean;
  totQty: any;
  totDutyAmt: any;


  constructor(toasterService: ToasterService, private fb: FormBuilder,
    private permissionService: PermissionService,
    private loginService: LoginService,
    private exportService: ExportService,
    public datepipe: DatePipe, private crudServices: CrudServices) {
    this.toasterService = toasterService;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.send_mail = (this.links.indexOf('send_mail') > -1);
    this.get_be = (this.links.indexOf('get_be') > -1);
    this.be_csv = (this.links.indexOf('be_csv') > -1);
    this.tr6_upload = (this.links.indexOf('TR6 Upload') > -1);
    this.payment_filter = (this.links.indexOf('BE Detail Payment Status Filter') > -1);
    this.payment_column = (this.links.indexOf('BE Detail Payment Detail Column') > -1);
    this.tr6_column = (this.links.indexOf('BE Details TR6 Column') > -1);
    this.payment_ack= (this.links.indexOf('BE Details Payment Acknowledge') > -1);
    this.payment_pending_list= (this.links.indexOf('BE Details Payment Pending') > -1);
    this.payment_ack_list= (this.links.indexOf('BE Details Payment For Acknowledge') > -1);
    this.port_list_flag= (this.links.indexOf('BE Detail Port List') > -1);

    

    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {
			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
		}


    if(this.payment_pending_list) {
      this.selected_pay_type = 1;
    }

    if(this.payment_ack_list) {
      this.selected_pay_type = 2;
    }

    if(this.port_list_flag) {
      this.crudServices.getAll<any>(PortMaster.getAll).subscribe(response => {
        this.port_list = response;
        // this.port = this.port_list[0].id;
        //this.port = 1;
        //	console.log(response);
      })
    }

    

  }




  ngOnInit() {
    this.getBE();
    this.getTemplate();
    //@Send Email Form Here
    this.emailForm = this.fb.group({
      emailMult: new FormControl(null, Validators.required),
      emailMultcc: new FormControl(null),
    });
  }


  clearDate() {
    this.bsRangeValue = [];
    this.getBE()
  }


  viewEmailModal() {
    let status= false;
    for (let index = 0; index < this.checkedList.length; index++) {
    
      if(this.checkedList[0]['bank_id'] == this.checkedList[index]['bank_id'])  {
        status = true
      } else {
        status = false;
        break;
      }
      
    }

    if(status) {
    this.mailModal.show();
  } else {
    this.toasterService.pop('error', 'Error', 'Please Select Same Bank');
    this.uncheckAll();
    this.checkedList= [];
  }

  }

  //*on Check Box  checked / unchecked  Add Or Remove Email from  To email List
  onCheckboxChange(e) {
    if (e.target.checked) {
      this.selectedEmails.push(e.target.value);
    } else {
      this.selectedEmails = this.selectedEmails.filter((email) => {
        if (email === e.target.value) {
          return email !== e.target.value;
        } else {
          return email;
        }
      });
    }
  }


  //*on Check Box  checked / unchecked  Add Or Remove Email from  To email List
  onCheckboxChangeCC(e) {
    if (e.target.checked) {
      this.selectedEmailscc.push(e.target.value);
    } else {
      this.selectedEmailscc = this.selectedEmailscc.filter((email) => {
        if (email === e.target.value) {
          return email !== e.target.value;
        } else {
          return email;
        }
      });
    }
  }




  getTemplate() {
    this.emailSubject = '';
    this.emailFooterTemplete = '';
    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'BE Mail' }).subscribe(response => {
      if (response[0]) {
        this.emailBodyTemplete = response[0].custom_html;
        this.emailSubject = response[0].subject;
        this.emailFrom = response[0].from_name;
      }

    })
    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
      if (response.code == 100) {
        if(response[0]) {
          this.emailFooterTemplete = response[0].custom_html; 
        }
      
      }

    })
  }


  getBE() {
    this.be_list = [];
    this.checkedList = []
    let conditions = {};
    this.cols = [];
    this.duty_total = 0;
    this.isLoading = true;
    this.totQty = 0;
    this.totDutyAmt = 0;
    if (this.selected_lc_type == 1) {
      conditions["pi_flag"] = 1;
      this.cols = [
      
        { field: 'port_name', header: 'Port', style: '100' },
        { field: 'invoice_no', header: '	Invocie No.', style: '200' },


        { field: 'org_name', header: 'Party Name', style: '200' },
        { field: 'be_no', header: '	BE No', style: '200' },
        { field: 'covered_bl_qty', header: 'Quantity', style: '100' },
        { field: 'bank_name', header: 'Bank Name', style: '200' },
       
        { field: 'bank_lc_no', header: 'LC No', style: '200' },
        { field: 'lc_date', header: 'LC Date', style: '200' },
        { field: 'docs', header: 'Doc Ref No.', style: '200' },
        
       
        { field: 'be_dt', header: 'BE Date', style: '200' },
        { field: 'total_cost', header: 'Duty Amount', style: '200' },
        { field: 'load_charge', header: 'Load Charge', style: '200' },
       
      ];
      

    }
    if (this.selected_lc_type == 2) {
      conditions["pi_flag"] = 2;
      this.cols = [
       
       
        { field: 'port_name', header: 'Port', style: '100' },
        { field: 'invoice_no', header: '	Invocie No.', style: '200' },
        { field: 'org_name', header: 'Party Name', style: '200' },
        { field: 'be_no', header: '	BE No', style: '200' },
        { field: 'covered_bl_qty', header: 'Quantity', style: '100' },
        
        { field: 'bank_name', header: 'Bank Name', style: '200' },
       
        { field: 'swalRef', header: 'TT No.', style: '200' },
        { field: 'swalDate', header: 'TT DATE', style: '200' },
       
        { field: 'be_dt', header: 'BE Date', style: '200' },
        { field: 'total_cost', header: 'Duty Amount', style: '200' },
        { field: 'load_charge', header: 'Load Charge', style: '200' },
       

      ];
    }


    if (this.bsRangeValue) {
      conditions["start_date"] = this.convert(this.bsRangeValue[0]);
      conditions["end_date"] = this.convert(this.bsRangeValue[1]);
    }

    if(this.payment_filter) {
      conditions["payment_filter"] = this.selected_pay_type;
    }

    console.log(conditions);
    

    this.crudServices.getOne<any>(billOfEntry.getEmailData, conditions).subscribe(response => {
      this.be_list = [];
     this.isLoading = false;
    
      if (response) {
        console.log(response,"response")
        response.map((element) => {
          let swalRef = '';
          let swalDate = '';
          let totalQty = 0;
          let lic_amount_utilize = 0;
          let pi_invoice_amount = 0;
          let doc_ref_no = '';
          if (this.selected_lc_type == 1) {
            if (element.non_negotiable['letter_of_credit']) {
              element.bank_lc_no = element.non_negotiable['letter_of_credit'].bank_lc_no;
              element.lc_date = element.non_negotiable['letter_of_credit'].lc_date;
              element.lc_amount = element.non_negotiable['letter_of_credit'].lc_amount;
              element.lc_copy_path = element.non_negotiable['letter_of_credit'].lc_copy_path;
            }
          }

          if(element.non_negotiable.nonPi != null) {
            for(let val of element.non_negotiable.nonPi) {
              pi_invoice_amount+= val.amount;
            }
        

          }

          if(element.non_negotiable.rel_non_payments != null) {
            
            for(let val of element.non_negotiable.rel_non_payments) {
              if(val.payment_status == 0 || val.payment_status == 1 ) {
                doc_ref_no = val.doc_ref_no;
                swalRef = swalRef + val.nonlc_swift_ref_no + ',';
                swalDate = swalDate + this.datepipe.transform(val.payment_paid_date , 'dd-MM-yyyy') + ',';
                
              }
             
            }
          }
          element.pi_flag = element.non_negotiable.nonPi['0'].flc_proforma_invoice.pi_flag;
          if (element.send_mail == 1) {
            element.mail_status = `Mail Send\n ${this.convert(element.mail_date)}`
          }

       
          element.non_negotiable.nonPi.map(non => {
            if (non.flc_proforma_invoice.non_lc_swift_details) {
              non.flc_proforma_invoice.non_lc_swift_details.forEach(swal => {
                swalRef = swalRef + swal.non_lc_swift_ref_no + ',';
                swalDate = swalDate + this.datepipe.transform(swal.non_lc_swift_date , 'dd-MM-yyyy') + ',';
              });
            }
          })

          element.non_be_bls.map(bl => {
            if(bl.covered_bl_qty >0) {
              totalQty = totalQty + bl.covered_bl_qty
            } else {
              totalQty = totalQty + bl.original_qty
            }
           
          })

          element.covered_bl_qty = totalQty;
          if (swalRef != '' && swalDate != '') {
            element.swalRef = this.removeLastComma(swalRef);
            element.swalDate = this.removeLastComma(swalDate);
          }



          element.pi_qty = element.non_negotiable.nonPi['0'].pi_qty;
          element.pi_invoice_amount =pi_invoice_amount;
          element.doc_ref_no =doc_ref_no;
          element.bank_name = element.non_negotiable.spipl_bank!=null ? element.non_negotiable.spipl_bank.bank_name : null;
          element.bank_id = element.non_negotiable.spipl_bank!= null? element.non_negotiable.spipl_bank.id : null;
          element.bank_email =element.non_negotiable.spipl_bank!=null? element.non_negotiable.spipl_bank.bank_email : null;
          element.invoice_no = element.non_negotiable.invoice_no;
          element.org_name =  element.non_negotiable.sub_org_master!=null ? element.non_negotiable.sub_org_master.sub_org_name : null;
          element.port_name =  element.non_negotiable.port_master!=null ? element.non_negotiable.port_master.port_name : null;
          element.port_id =  element.non_negotiable.port_master!=null ? element.non_negotiable.port_master.id : null;
          if(element.be_copy != null){
            element.be_copy= JSON.parse(element.be_copy);

          }
         
          if(element.license_utilizations != null) {
            lic_amount_utilize = element.license_utilizations.reduce((sum,item)=> sum +  item.deleted!=1?  Number(item.amount_utilize):0 ,0);
          
          }

          element.igst_amt = element.igst_amt!= null ? Math.round(element.igst_amt): ""
          element.sws_val = element.sws_val!= null ? Math.round(element.sws_val) : ""
          element.custom_interest_amt = element.custom_interest_amt!= null ? Math.round(element.custom_interest_amt): ""
          element.anti_dumping_val = element.anti_dumping_val!= null ? Math.round(element.anti_dumping_val): ""
          element.bcd_cash_val = element.bcd_cash_val!= null ? Math.round(element.bcd_cash_val): ""
          element.custom_fine_amt = element.custom_fine_amt!= null ? Math.round(element.custom_fine_amt): ""
          element.custom_duty_amt = element.custom_duty_amt!= null ? Math.round(element.custom_duty_amt): ""

        


          element.total_cost = element.custom_duty_amt + lic_amount_utilize
          element.lic_amount_utilize = lic_amount_utilize;
          this.pushSupplyer(element.org_name)
          this.pushbank(element.bank_name)
          this.be_list.push(element);
         
          return element
        })

        console.log(this.be_list);
        

        this.filteredValues =  this.be_list;
        this.filter_table_data =  this.be_list;

        this.totQty = this.be_list.reduce((sum,item )=> sum + item.covered_bl_qty , 0 );
        this.totDutyAmt = this.be_list.reduce((sum,item )=> sum + item.custom_duty_amt , 0 );

        if(this.port_list_flag){
          this.onSelectPort(this.port)
        }
        
      }
    })
  }

  onSelectPort($e) {
   console.log($e);
   
    this.port = $e;
    this.be_list = this.filter_table_data;
    if (this.port && this.port != null) {
      this.be_list = this.be_list.filter(data => data.port_id == this.port);
    }
    this.filteredValues =  this.be_list;
  }




  removeLastComma(strng) {
    var n = strng.lastIndexOf(",");
    var a = strng.substring(0, n);
    return a;
  }
  exportExcel() {
    let arr = [];
    const foot = {};
    let export_list = []
    if (this.filteredValues) {
      arr = this.filteredValues;
    } else {
      arr = this.be_list;
    }
    for (let i = 0; i < arr.length; i++) {
      const export_be = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]["header"] != "Action") {
          export_be[this.cols[j]["header"]] =
            arr[i][this.cols[j]["field"]];
        }
      }
      export_list.push(export_be);
    }

    // 	for (let j = 0; j < this.cols.length; j++) {
    // 		if (this.cols[j]["field"] === "lic_value") {
    // 			foot[this.cols[j]["header"]] = `Total:${this.total_lic_val}`;
    // 		} 
    //     else if (this.cols[j]["field"] === "tot_utilise") {
    // 			foot[this.cols[j]["header"]] = `Total:${this.total_utilize_val}`;
    // 		} 
    //     else if (this.cols[j]["field"] === "balance") {
    // 			foot[this.cols[j]["header"]] = `Total:${this.total_balance_val}`;
    // 		}
    //     else {
    // 			foot[this.cols[j]["header"]] = "";
    // 		}
    // 	}
    // export_list.push(foot);
    this.exportService.exportExcel(
      export_list,
      "BE Email List"
    );
  }






  onFilter(event, dt) {
    this.filteredValues= [];

		this.filteredValues = event.filteredValue;
    this.totQty = this.filteredValues.reduce((sum,item )=> sum + item.covered_bl_qty , 0 );
    this.totDutyAmt = this.filteredValues.reduce((sum,item )=> sum + item.custom_duty_amt , 0 );


  }
  // date filter
  onDateSelect($event, name) {
    this.table.filter(this.convert($event), name, 'equals');
  }


  convert(date) {
    return this.datepipe.transform(date, 'yyyy-MM-dd');
  }

  dateFormating(date) {
    if (date != null) {
      return moment(date).format("YYYY-MM-DD");
    }
  }

  pushSupplyer(name) {
    if (this.orgList.length < 1) {
      this.orgList.push({ value: name, label: name });
    } else {
      let data = this.orgList.find(({ value }) => value === name);
      if (!data) {
        this.orgList.push({ value: name, label: name });
      } else {
        return;
      }
    }
  }

  pushbank(name) {
    if (this.bankList.length < 1) {
      this.bankList.push({ value: name, label: name });
    } else {
      let data = this.bankList.find(({ value }) => value === name);
      if (!data) {
        this.bankList.push({ value: name, label: name });
      } else {
        return;
      }
    }
  }

	onCheck(checked, item) {
		if (checked) {
			this.checkedList.push(item);
		} else {
			this.checkedList.splice(this.checkedList.indexOf(item), 1);
		}

    this.calculateDutyTotal();
	}


  // set check item list
  // onCheck(checked, item) {
  //   if (checked) {
  //     if (this.checkedList.length > 0) {
  //       this.checkedList.forEach(element => {
  //         if (element.bank_id == item.bank_id) {
  //           this.checkedList.push(item);
  //         } else {
  //           this.inputs.forEach((check) => {
  //             check.nativeElement.checked = false;
  //           });
  //           for (const val of this.checkedList) {
  //             this.checkedList.splice(this.checkedList.indexOf(val), 1);
  //           }
  //           this.toasterService.pop('error', 'Error', 'Please Select Same Bank')
  //         }
  //       });
  //     } else {
  //       this.checkedList.push(item);
  //     }
  //   } else {
  //     this.checkedList.splice(this.checkedList.indexOf(item), 1);
  //   }
  // }


  getFileExtension(filename) {
    const extension = filename.split('.').pop();
    return extension;
  }

  getType(val) {
    if (val == 1) {
        return "Lc PI";
    }

    if (val == 2) {
        return "Non Lc PI";
    }

    if (val == 3) {
        return "Indent PI";
    }
}
  onSendEmail() {
    
      let html = '';
      let template_html = '';
      const attachment = [];
      let arr = {};
      let be_ids = []
      html = `${html}  <table id="table">`;
  
      if (this.selected_lc_type == 1) {
        html =`${html} <tr>
                <th>Sr.No</th>
                <th>LC No</th>
                <th>LC Date</th>
                <th>Invoice No</th>
                <th>Invoice Amount</th>
                <th>BE Amount</th>
                <th>Doc Ref No</th>
                <th>BE No.</th>
                <th>BE Date</th>
                </tr>`;
        for (let i = 0; i < this.checkedList.length; i++) {
          be_ids.push(this.checkedList[i].id)

          
           
          html = `${html} <tr>
          <td> ${Number(i + 1)} </td>
          <td> ${this.checkedList[i]['bank_lc_no']} </td>
          <td> ${this.checkedList[i]['lc_date'] ? this.datepipe.transform(this.checkedList[i]['lc_date'] ,'dd/MM/yyyy')  : ''} </td>
          <td> ${this.checkedList[i]['invoice_no']}</td>
          <td> ${this.checkedList[i]['pi_invoice_amount']} </td>
          <td> ${this.checkedList[i]['custom_duty_amt']} </td>
          <td> ${this.checkedList[i]['doc_ref_no']} </td>
          <td> ${this.checkedList[i]['be_no'] }</td>
          <td> ${this.checkedList[i]['be_dt'] ? this.datepipe.transform(this.checkedList[i]['be_dt'] ,'dd/MM/yyyy')  : ''} </td>
          </tr>`;
         
        }
      }
      else {
        html = `${html}<tr>
        <th>Sr.No</th>
        <th>Invoice No</th>
        <th>TT REF NO</th>
        <th>TT REF DATE</th>
        <th>Invoice No</th>
        <th>Invoice Amount</th>
        <th>Doc Ref No</th>
        <th>BOE No.</th>
        <th>BOE Date</th>
        </tr>`;
        for (let i = 0; i < this.checkedList.length; i++) {
          be_ids.push(this.checkedList[i].id)
          html =`${html}<tr>
          <td>${Number(i + 1) }</td>
          <td> ${this.checkedList[i]['invoice_no']} </td>
          <td> ${this.checkedList[i]['swalRef'] != undefined ? this.checkedList[i]['swalRef'] : ''} </td>
          <td> ${this.checkedList[i]['swalDate'] != undefined ? this.checkedList[i]['swalDate']   : ''} </td>
          <td> ${this.checkedList[i]['pi_invoice_amount']} </td>
          <td> ${this.checkedList[i]['custom_duty_amt']} </td>
          <td> ${this.checkedList[i]['doc_ref_no']} </td>
          <td>${this.checkedList[i]['be_no']} </td>
          <td> ${this.checkedList[i]['be_dt'] ? this.datepipe.transform(this.checkedList[i]['be_dt'] ,'dd/MM/yyyy')  : ''} </td>
        
          </tr>`;
        }
      }
      html = `${html} </table>`;
      let html2 = '';
      const re2 = "{TABLE}";
      template_html = this.emailBodyTemplete;
      html2 = template_html.replace(re2, html);
      html2 = html2 + this.emailFooterTemplete;
  
      for (let i = 0; i < this.checkedList.length; i++) {
        if (this.checkedList[i]['be_copy']) {
          const files = this.checkedList[i]['be_copy'];
          for (let j = 0; j < files.length; j++) {
            const test = files[j].split('/');
            attachment.push({ 'filename': `${this.checkedList[i]['invoice_no']}.${this.getFileExtension(files[j])}`, 'path': files[j] });
          }
        }
      }
  
  
  
  
  
      let emailBody = {
        from: this.emailFrom,
        to: this.emailForm.value.emailMult,
        cc: this.emailForm.value.emailMultcc,
        subject: this.emailSubject,
        html: html2,
        attachments: attachment
      };
  
  
  
      let body = {
        mail_object: emailBody,
        be_ids: be_ids
      };

      console.log(this.emailForm.value.emailMult);
      this.isMailLoader = true;
  
      this.crudServices
        .postRequest<any>(billOfEntry.sendEmail, body)
        .subscribe((response) => {
          this.isMailLoader = false;
          this.mailModal.hide();
          this.inputs.forEach((check) => {
            check.nativeElement.checked = false;
          });
          for (const val of this.checkedList) {
            this.checkedList.splice(this.checkedList.indexOf(val), 1);
          }
          this.toasterService.pop(
            response.message,
            response.message,
            response.data
          );
          this.emailForm.reset();
          this.getBE();
        });
 
   
  }


  addTr6File(event: any) {
    this.fileData = new FormData();
    let files = <Array<File>>event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.fileData.append('tr6_copy', files[i], files[i]['name']);
    }
  }

  openUploadTr6() {
    this.be_id = [];
    this.be_no = '';
    this.duty_total = 0;
    this.checkedList.forEach(element => {
      this.be_id.push(element.id);
      this.be_no+= element.be_no +', ';
      this.duty_total += element.custom_duty_amt

    });

    this.uploadTr6Modal.show();

  }

  enterdToTally() {
    if(confirm("Continue to this payment")) {
      this.be_id = [];
      this.checkedList.forEach(element => {
        this.be_id.push(element.id);
      });
  
      if(this.be_id.length ) {
        let data = {};
        data['payment_entered_tally'] = 1;
  
         console.log(this.be_id);
         
        this.crudServices.updateData<any>(billOfEntry.update, {details : data , id: this.be_id}).subscribe(response => {
          this.toasterService.pop(response.message ,response.message , response.data );
          this.closeUploadModal();
         
        }) 
  
      }
    } 
    
  }

  calculateDutyTotal(){
    this.duty_total = 0;
    this.checkedList.forEach(element => {
      this.duty_total += element.custom_duty_amt

    });
    
  }

  uploadFile() {
    if (this.fileData.get("tr6_copy") != null) {
      this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
        let filesInvoice = [];
        let data = {};
        let tr6_copy = res.uploads.tr6_copy;
        if (tr6_copy != null) {
          if (tr6_copy.length > 0) {
            for (let i = 0; i < tr6_copy.length; i++) {
              filesInvoice.push(tr6_copy[i].location);
            }
          }
          data['tr6_copy'] = JSON.stringify(filesInvoice);
          data['duty_payment_done_date'] = this.payment_date;
          data['duty_payment_tot_amt'] = this.duty_total;
          

          this.crudServices.updateData<any>(billOfEntry.update, {details : data , id: this.be_id}).subscribe(response => {
            this.toasterService.pop(response.message ,response.message , response.data );
            this.closeUploadModal();
           
          }) 
        }
        
      })
    }
  }

  onCheckAll(checked) {
    let arr = [];
    this.checkedList = [];
    arr = this.filteredValues;
    console.log(arr , 'DATA');
    

    if (checked) {
      this.inputs.forEach(check => {
        check.nativeElement.checked = true;
      });
      for (const val of arr) {
        // this.item.push(val);
        this.onCheck(true, val);
      }

    } else {
      this.inputs.forEach(check => {
        check.nativeElement.checked = false;
      });
      for (const val of arr) {
        // this.item.splice(this.item.indexOf(val), 1);
        this.onCheck(false, val);
      }
    }



  }


 


  uncheckAll() {
    this.checkedList = []
    this.inputs.forEach(check => {
      check.nativeElement.checked = false;
    });
  }

  closeUploadModal() {
    this.checkedList=[];
    this.uncheckAll();
    this.uploadTr6Modal.hide();
    this.duty_total=0;
    this.payment_date= null;
    this.getBE();
  }

  getDocArr(doc) {
    return JSON.parse(doc);
  }

  deleteDoc(arr, doc, name , id) {
		if(confirm("Are You Sure!")) {
			const index = arr.indexOf(doc);
    
      let index2 = this.be_list.findIndex(x => x.id === id);
      console.log(index2);
      
			let data = {};
	
			if (index > -1) {
				arr.splice(index, 1);
			}
			data[name] = JSON.stringify(arr);
		//	data['id'] = id;
      this.be_list[index2][name] =  JSON.stringify(arr)
      

      
			this.crudServices.updateData<any>(billOfEntry.update, {details:data , id : id}).subscribe(response => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.message, response.data);
				//	this.getList();
	
				} else {
					this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
	
				}
			})
		}
	
	}

}
