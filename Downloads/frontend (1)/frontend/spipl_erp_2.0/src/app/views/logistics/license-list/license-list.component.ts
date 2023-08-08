import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, ViewChildren, NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  FormArray

} from "@angular/forms";
import { ModalDirective, getFullYear } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { LicenseMaster, LicenseInvoice, FileUpload, EmailTemplateMaster, PortMaster, SubOrg, LicenseKnockOf } from '../../../shared/apis-path/apis-path';
import { ExportService } from "../../../shared/export-service/export-service";

import * as moment from "moment";
import { staticValues } from '../../../shared/common-service/common-service';
import { elementClosest } from '@fullcalendar/core/util/dom-manip';

@Component({
  selector: 'app-license-list',
  templateUrl: './license-list.component.html',
  styleUrls: ['./license-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    DatePipe,
    CrudServices,
    ExportService,

  ]
})
export class LicenseListComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;
  @ViewChild('dt_utilize', { static: false }) table_utl: Table;
  @ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];

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

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });



  cols: { field: string; header: string; style: string; }[];
  license_list: any = [];
  utilize_license_list: any = [];
  pending_license_list: any = [];
  typeOfLic: any = [];

  // typeOfLicense:any=[{name:"Nitin",id:"1"},{name:"Nitin",id:"1"},{name:"Nitin",id:"1"}]
  //*config For Edit Billing  Stock Transfer modals
  @ViewChild("addLicenseModal", { static: false })
  public addLicenseModal: ModalDirective;

  @ViewChild("sendMailModal", { static: false })
  public sendMailModal: ModalDirective;

  @ViewChild("addModal", { static: false })
  public addModal: ModalDirective;

  @ViewChild("trasferModal", { static: false })
  public trasferModal: ModalDirective;

  @ViewChild("utilizeModal", { static: false })
  public utilizeModal: ModalDirective;

  fileData: FormData = new FormData();
  licenseForm: FormGroup;
  invoice_list: any = [];
  selectedLicenceID: any;
  mode: any = 'add';
  typeOfList: any = [
    { name: 'EDI', value: 1 },
    { name: 'TRA', value: 2 },
    { name: 'EDI Online', value: 3 },
    { name: 'MEIS', value: 4 },
    { name: 'FPS', value: 5 },
    { name: 'ROSCTL', value: 6 },
    { name: 'ROSL', value: 7 },
    { name: 'SEIS', value: 8 },
    { name: 'FMS', value: 9 },
    { name: 'VKUY', value: 10 },
    { name: 'DFIA', value: 11 },
    { name: 'RODTEP', value: 12 },
  ]



  total_lic_val: number = 0;
  total_utilize_val: number = 0;
  total_balance_val: number = 0;
  filteredValuess: any;
  filter_table_data: any = [];
  license_status = [{ label: 'All', value: 3 }, { label: 'Pending', value: 0 }, { label: 'Utilize', value: 1 }]
  selected_status = 0;
  vendorList: any = [];
  portList: any = [];


  datePickerConfig = staticValues.datePickerConfig;
  maxDate: Date = new Date(); // date range will not greater  than today
  bsRangeValue: any = []; //DatePicker range Value
  lic_add: boolean = false;
  lic_edit: boolean = false;
  lic_delete: boolean = false;
  lic_csv: boolean = false;
  lic_purchase_date: any;
  expiry_date: any;
  invoice_date: any;
  selectedPort = [];
  global_list = [];
  docs = [];
  checkedList = [];
  mailList = [];
  ccmailtext: string;
  tomailtext: string;
  tomail = [];
  ccMail = [];
  email = [];
  subject: any;
  port_name: any;
  from: any;
  template: any;
  footer: string;
  port_list: any;
  port = 1;
  knockoff_button: boolean;
  repeaterlicenseForm: FormGroup;
  count: number = 0;
  licenseArr: FormArray;
  listfilesData = [];
  progress: number;
  addenable: boolean;
  send_mail: boolean;
  knock_off: boolean;

  currentYear: number;
  date = new Date();
  isLoadingMail: boolean;
  sub_org: any;
  balance = 0;
  transfer_amount = 0;
  files: Array<File> = [];

  isLoadingUtilize: boolean = false;
  utlilization_list: any = [];
  loadingBtn: boolean;


  constructor(private toasterService: ToasterService, private fb: FormBuilder,
    private permissionService: PermissionService,
    private loginService: LoginService,
    private exportService: ExportService,
    public datepipe: DatePipe, private crudServices: CrudServices) {
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    if (this.loginService.getUserDetails()) {
      this.user = this.loginService.getUserDetails();
      this.links = this.user.links;

      this.lic_add = (this.links.indexOf('lic_add') > -1);
      this.lic_edit = (this.links.indexOf('lic_edit') > -1);
      this.lic_delete = (this.links.indexOf('lic_delete') > -1);
      this.lic_csv = (this.links.indexOf('lic_csv') > -1);
      this.send_mail = (this.links.indexOf('Logistics License Send Mail') > -1);
      this.knock_off = (this.links.indexOf('Logistics License Knock Off Manual') > -1);

    }

    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    if (this.datepipe.transform(this.date, 'MM') > '03') {
      this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    } else {
      this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
    }
    
    
      

    this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 113 }).subscribe(response => {

      if (response.length) {
        this.sub_org = response;
      }

    });

    this.crudServices.getAll<any>(PortMaster.getAll).subscribe(response => {
      this.port_list = response;
      // this.port = this.port_list[0].id;
      // this.port = 1;
      //	console.log(response);
    })


  }
  ngOnInit() {




    this.generateHeader();
    this.getInvoice();
    this.getLicense();
    this.filterStatus();
    this.generateForm();



  }



  // date filter
  onDateSelect($event, name) {
    this.table.filter(this.convert($event), name, 'equals');
  }


  convert(date) {
    return this.datepipe.transform(date, 'yyyy-MM-dd');
  }



  // status_filter(event) {
  //   this.total_lic_val = 0;
  //   this.total_utilize_val = 0;
  //   this.total_balance_val = 0;
  //   if (event == 0) {
  //     this.filter_table_data = this.license_list.map(data => {
  //       this.calculateFooterValues(data);
  //       return data;
  //     });
  //   }
  //   if (event == 1) {
  //     return this.filter_table_data = this.license_list.filter((item) => { if (item.tot_utilise < Number(item.lic_value)) { return item; } }).map(data => {
  //       this.calculateFooterValues(data)
  //       return data;
  //     })
  //   }

  //   if (event == 2) {
  //     return this.filter_table_data = this.license_list.filter((item) => { if (item.tot_utilise >= Number(item.lic_value)) { return item; } }).map(data => {
  //       this.calculateFooterValues(data)
  //       return data;
  //     })
  //   }
  // }


  generateHeader() {
    this.cols = [
      { field: 'id', header: 'Id', style: '100' },
      { field: 'port_name', header: 'License Port', style: '200' },
      { field: 'lic_purchase_date', header: 'License  Date', style: '200' },
      { field: 'expiry_date', header: 'License  Expire', style: '200' },
      { field: 'lic_no', header: 'License Number', style: '200' },
      { field: 'lic_value', header: 'License Value', style: '200' },
      { field: 'tot_utilise', header: 'License  Utilize', style: '200' },
      { field: 'balance', header: 'Balance', style: '200' },
      { field: 'vendor_name', header: 'Vendor Name', style: '200' },
      { field: 'lic_invoice_no', header: 'Invoice Number', style: '200' },
      { field: 'invoice_date', header: 'Invoice Date', style: '200' },
      { field: 'port_code', header: 'Port Code', style: '100' },
      { field: 'lic_file', header: 'License File', style: '200' },
      { field: 'lic_rate', header: 'License Rate', style: '200' },
      { field: 'transfered_status', header: 'Transfered Remark', style: '200' },
      { field: 'added_by', header: 'Added By', style: '200' },
      { field: 'added_date', header: 'Added Date', style: '200' },
      { field: 'Action', header: 'Action', style: '180' },
      { field: '', header: 'Transfer to Other', style: '200' }
    ];

  }



  generateForm() {
    //@Send Email Form Here
    this.licenseForm = this.fb.group({
      invoice_id: new FormControl(null, Validators.required),
      type_of_lic: new FormControl(null),
      lic_no: new FormControl(null, Validators.required),
      lic_purchase_date: new FormControl(null, Validators.required),
      lic_value: new FormControl(null, Validators.required),
      lic_file: new FormControl(null),
      transfer_org_id: new FormControl(null),
      transfer_amount: new FormControl(null),
      transfer_remark: new FormControl(null),
      port_code: new FormControl(null),      
    });



    this.repeaterlicenseForm = this.fb.group({
      add_invoice_id: new FormControl(null, Validators.required),
      licenseArr: this.fb.array([
        this.createItem()
      ]),
    });





  }



  //?Form Control Errors If Any
  get f() {
    return this.licenseForm.controls;
  }





  clearDate() {
    this.bsRangeValue = [];
    this.getLicense()
  }


  getInvoice() {
    this.crudServices.getAll(LicenseInvoice.getAll).subscribe((res => {


      this.invoice_list = res['data'];
    }))
  }

getExpiryDate(date){
  date.setFullYear(date.getFullYear() + 1);
  return date;
}

  getLicense() {
    this.isLoading = true;
    this.total_utilize_val = 0;
    this.total_lic_val = 0;
    this.total_balance_val = 0;
    this.license_list = [];
    this.filter_table_data = [];
    this.global_list = [];
    let conditions = {};
    this.expiry_date = [];
    // if (this.selected_status == 2) {
    //   this.knockoff_button = true;
    // } else {
    //   this.knockoff_button = false;
    // }
    if (this.selected_status != 3) {
      conditions["knock_off_status"] = this.selected_status;
    }





    if (this.bsRangeValue) {
      conditions["start_date"] = this.dateFormating(this.bsRangeValue[0]);
      conditions["end_date"] = this.dateFormating(this.bsRangeValue[1]);


    }

    conditions["port_id"] = this.port;

    this.crudServices.getOne(LicenseMaster.getOne, conditions)
      .subscribe((result) => {

        this.isLoading = false;
        

        if (result['data']) {
          let tot_utilise = 0
          result['data'].map((element) => {
            const date = new Date(element.lic_purchase_date);
            element.vendor_name = element.lic_invoice_master.vendorId.sub_org_name;
            this.pushVendor(element.lic_invoice_master.vendorId.sub_org_name);
            element.vendor_id = element.lic_invoice_master.vendorId.sub_org_id;
            element.port_name = element.lic_invoice_master.port_master.port_name;    
            element.expiry_date = this.getExpiryDate(date)
            this.pushPort(element.lic_invoice_master.port_master.port_name)
            element.port_id = element.lic_invoice_master.port_master.id;
            if (element.license_utilizations) {
              tot_utilise = 0;
              element.license_utilizations.forEach((utilise) => {
                if (utilise.deleted == 0) {
                  tot_utilise = tot_utilise + Number(utilise.amount_utilize)
                }
              })
            }
            element.tot_utilise = tot_utilise;

            element.balance = Number(element.lic_value) - element.tot_utilise;
            if (element.lic_file) {
              element.lic_file = JSON.parse(element.lic_file);
            }

            if (element.lic_invoice_master.invoice_file != null) {
              element.invoice_file = JSON.parse(element.lic_invoice_master.invoice_file);
            }

            if (element.balance <= 50) {
              element.below_50 = 1;
            } else {
              element.below_50 = 0;
            }

            element.type_of_lic_id = element.type_of_lic;

            let type = this.typeOfList.find(item => item.value == element.type_of_lic);
            if (type != undefined) {
              element.type_of_lic = type.name;
            }





            element.lic_invoice_no = element.lic_invoice_master.lic_invoice_no
            element.invoice_date = element.lic_invoice_master.invoice_date
            element.lic_rate = element.lic_invoice_master.lic_rate
            
            // this.calculateFooterValues(element);


            let today = new Date();
            let noOfDays = 0;
            if (element.invoice_date) {
              const invoiceDate = moment(element.invoice_date);
              const toDate = moment(this.datepipe.transform(today, 'yyyy-MM-dd'));

              if (invoiceDate < toDate) {
                noOfDays = Math.abs(invoiceDate.diff(toDate, 'days'));
 
              }
            }

            if (noOfDays > 30) {
              element.days = noOfDays;
            }        
       
           
          
            this.license_list.push(element);
            this.global_list.push(element);
            this.filter_table_data.push(element);
          
            console.log(this.filter_table_data)
            return element
          })

        }

        //  this.global_list = this.license_list;
        //  this.selectedPort = [this.portList[0].value];

        this.filterStatus();
      })



  }
  
  

  onSelectPort($e) {

    this.port = $e;

    this.getLicense();
  }


  get getUtilize() {
    return this.license_list
  }

  // filterStatus() {
  //   this.filter_table_data = this.global_list;
  //   if (this.selected_status == 0) {

  //     this.filter_table_data = this.filter_table_data.filter(data => {
  //       return (data.knock_off_status == 0 &&  data.balance >= 10);
  //     })


  //   }
  //   if (this.selected_status == 1) {

  //     this.filter_table_data = this.filter_table_data.filter(data => {

  //       return (data.knock_off_status == 1 || data.knock_off_status == 2);
  //     })


  //   }

  //   if (this.selected_status == 2) {

  //     this.filter_table_data = this.filter_table_data.filter(data => {

  //       return (data.knock_off_status == 0 && data.balance <= 10);
  //     })


  //   }

  //   // if (this.port && this.port != null) {
  //   //   this.filter_table_data = this.filter_table_data.filter(data => data.port_id == this.port);
  //   // }
  //   this.filteredValuess =  this.filter_table_data;

  //   this.calculateTotal();



  // }
  filterStatus() {
    this.filter_table_data = this.global_list;
    if (this.selected_status == 0) {
      let dataKnokkoff = this.filter_table_data.filter(data => {
        return data.balance <= 100;
      })

      let id = dataKnokkoff.map(item => item.id)
      this.knockoffAuto(id)

      this.filter_table_data = this.filter_table_data.filter(data => {
        return (data.balance > 100);
      })

      //this.filter_table_data = filterData



    }


    // if (this.selected_status == 2) {
    //   this.filter_table_data = this.filter_table_data.filter(data => {
    //     return (data.balance <= 10);
    //   })
    // }


    this.filteredValuess = this.filter_table_data;
    this.calculateTotal();


  }

  knockoffAuto(id) {
    let data = {
      knock_off_status: 2 // knock off below 100
    }

    this.crudServices.updateData<any>(LicenseMaster.updateKnockoffstatus, { data: data, id: id }).subscribe(response => {
      if (response.code == 100) {

      }
    })
  }


  knockoff() {

    if (this.checkedList.length) {
      var r = confirm("Are You Sure !");
      if (r == true) {
        let id = [];
        let data = {
          knock_off_status: 2
        }

        for (let val of this.checkedList) {
          id.push(val.id);
        }

        this.crudServices.updateData<any>(LicenseMaster.updateKnockoffstatus, { data: data, id: id }).subscribe(response => {
          if (response.code == 100) {
            this.toasterService.pop(response.message, response.message, response.code);
            this.getLicense();
            this.closeModal();
          }
        })
      } else {
        // this.toasterService.pop('warning', 'warning', 'Please Select Data');
        this.closeModal();
      }
    } else {
      this.toasterService.pop('warning', 'warning', 'Please Select Record');
    }




  }

  updateStatus(event, id) {


    if (event != null) {
      const body = {
        data: { transfered_status: event.target.value },
        licenseID: id
      }


      this.crudServices.updateData(LicenseMaster.update, body).subscribe((result) => {
        // this.addLicenseModal.hide();
        this.getLicense()
        this.toasterService.pop(result['message'], result['message'], result['data']);
      })

    }


  }



  dateFormating(date) {
    if (date != null) {
      return moment(date).format("YYYY-MM-DD");
    }
  }

  getTransferedStatus(val) {
    if (val == 0) {
      return 'NO';
    }
    if (val == 1) {
      return 'YES';
    }
  }

  pushVendor(name) {
    if (this.vendorList.length < 1) {
      this.vendorList.push({ value: name, label: name });
    } else {
      let data = this.vendorList.find(({ value }) => value === name);
      if (!data) {
        this.vendorList.push({ value: name, label: name });
      } else {
        return;
      }
    }
  }


  pushPort(name) {
    if (this.portList.length < 1) {
      this.portList.push({ value: name, label: name });
    } else {
      let data = this.portList.find(({ value }) => value === name);
      if (!data) {
        this.portList.push({ value: name, label: name });
      } else {
        return;
      }
    }
  }




  onAddList() {
    this.addModal.show();
  }

  createItem(): FormGroup {
    this.count = this.count + 1;

    return this.fb.group({

      add_type_of_lic: new FormControl(null),
      add_lic_no: new FormControl(null, Validators.required),
      add_lic_purchase_date: new FormControl(null, Validators.required),
      add_lic_value: new FormControl(null, Validators.required),
      add_lic_file: new FormControl(null),
      port_code: new FormControl(null),
      indexcount: new FormControl(this.count),
    });
  }

  addRow(): void {


    this.licenseArr = this.repeaterlicenseForm.get('licenseArr') as FormArray;
    this.licenseArr.push(this.createItem());
  }

  delete(index: number) {
    this.licenseArr = this.repeaterlicenseForm.get('licenseArr') as FormArray;
    this.licenseArr.removeAt(index);

  }



  closeAddModal() {
    this.addModal.hide();
    this.repeaterlicenseForm.reset();
    this.count = 0;
    this.licenseArr = this.repeaterlicenseForm.get('licenseArr') as FormArray;
    this.licenseArr.controls = [];
    this.listfilesData = [];
    this.addRow();
    this.getLicense();


  }


  onAdd(mode, data) {
    this.licenseForm.reset();
    this.docs = [];



    if (mode == 'add' && data == undefined) {
      this.mode = 'add';
      this.licenseForm.get('lic_file').setValidators([Validators.required]);
      this.licenseForm.get('lic_file').updateValueAndValidity();
      this.addLicenseModal.show()
    }
    else {
      this.mode = 'edit';
      this.licenseForm.get('lic_file').clearValidators();
      this.licenseForm.get('lic_file').updateValueAndValidity();

      this.selectedLicenceID = data.id;
      console.log(data, 'test');

      this.licenseForm.patchValue({
        invoice_id: data.invoice_id,
        type_of_lic: data.type_of_lic_id,
        lic_no: data.lic_no,
        lic_purchase_date: data.lic_purchase_date ? new Date(data.lic_purchase_date) : null,
        lic_value: data.lic_value,
        port_code: data.port_code,
      });
      if (data.lic_file) {

        this.docs = data.lic_file;
      }

      this.addLicenseModal.show()
    }

  }


  deleteFile(i) {
    this.docs.splice(i, 1);


  }




  licenseFileUploadEvent(event: any) {
    let files = <Array<File>>event.target.files;
    this.fileData = new FormData();
    for (let i = 0; i < files.length; i++) {
      this.fileData.append('lic_file', files[i], files[i]['name']);
    }
  }



  fileuploadlic(event: any, count, index) {

    let files = <Array<File>>event.target.files;

    this.addenable = true;


    this.progress = 10;
    let fileData: any = new FormData();
    const document1: Array<File> = files;

    if (document1.length > 0) {
      for (let i = 0; i < document1.length; i++) {
        fileData.append('lic_file', document1[i], document1[i]['name']);
      }
    }

    this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {

      let fileDealDocs1 = [];
      let filesList1 = [];


      if (res.uploads.lic_file) {


        this.addenable = false;
        filesList1 = res.uploads.lic_file;
        for (let i = 0; i < filesList1.length; i++) {
          fileDealDocs1.push(filesList1[i].location);
        }
        this.progress = 100;

        let fileData = JSON.stringify(fileDealDocs1);

        this.listfilesData.push({ files: fileData, count: count, index: index })


      }

    })




  }


  addLicenceList() {
    let arr = this.repeaterlicenseForm.value.licenseArr;
    let add_invoice_id = this.repeaterlicenseForm.value.add_invoice_id;


    let data = [];
    for (let val of arr) {
      if (add_invoice_id && val.add_lic_purchase_date && val.add_lic_no && val.add_lic_value) {
        let lic_value = 0;
        if (val.add_lic_value.toString().indexOf(',') > -1) {
          lic_value = Number(val.add_lic_value.replace(/,/g, ''))
        } else {
          lic_value = Number(val.add_lic_value)
        }
        let license_data = {
          invoice_id: add_invoice_id,
          type_of_lic: val.add_type_of_lic,
          lic_no: val.add_lic_no,
          lic_purchase_date: val.add_lic_purchase_date ? this.dateFormating(val.add_lic_purchase_date) : null,
          lic_value: lic_value,
          port_code: val.port_code
        }

        let file = this.listfilesData.find(function (item) {
          if (item.count == val.indexcount)
            return item
        })

        if (file) {
          license_data['lic_file'] = file.files;
        }

        data.push(license_data);


      }
    }
       



    if (data.length) {
      this.crudServices.addData(LicenseMaster.add, data).subscribe(result => {
        this.closeAddModal();
        this.toasterService.pop(result['message'], result['message'], result['data']);
      });
    }
    // console.log(this.repeaterlicenseForm.value.licenseArr);

  }

  addLicence() {

    let filesLicense = [];
    if (this.docs.length > 0) {
      for (let doc of this.docs) {
        filesLicense.push(doc);

      }
    }



    let lic_value = 0;
    if (this.licenseForm.value.lic_value.toString().indexOf(',') > -1) {
      lic_value = Number(this.licenseForm.value.lic_value.replace(/,/g, ''))
    } else {
      lic_value = Number(this.licenseForm.value.lic_value)
    }
    let license_data = {
      invoice_id: this.licenseForm.value.invoice_id,
      type_of_lic: this.licenseForm.value.type_of_lic,
      lic_no: this.licenseForm.value.lic_no,
      lic_purchase_date: this.licenseForm.value.lic_purchase_date ? this.dateFormating(this.licenseForm.value.lic_purchase_date) : null,
      lic_value: lic_value,
      port_code: this.licenseForm.value.port_code
    }


    if (this.fileData.get("lic_file") != null) {
      this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
        let license_res = res.uploads.lic_file;
        if (license_res != null) {
          if (license_res.length > 0) {
            for (let i = 0; i < license_res.length; i++) {
              filesLicense.push(license_res[i].location);
            }
          }
        }
        license_data['lic_file'] = JSON.stringify(filesLicense);

        this.save(license_data)
      })
    }
    else {
      license_data['lic_file'] = JSON.stringify(filesLicense);


      this.save(license_data)
    }
  }

  save(data) {
    if (this.mode == 'add') {
      this.crudServices.addData(LicenseMaster.add, data).subscribe(result => {
        this.addLicenseModal.hide();
        this.getLicense();
        this.toasterService.pop(result['message'], result['message'], result['data']);
      });
    }
    else {
      let body = {
        data: data,
        licenseID: this.selectedLicenceID
      }
      this.crudServices.updateData(LicenseMaster.update, body).subscribe((result) => {
        this.addLicenseModal.hide();
        this.docs = [];
        this.getLicense()
        this.toasterService.pop(result['message'], result['message'], result['data']);
      })

    }
  }



  onDelete(id) {
    this.crudServices.deleteData(LicenseMaster.delete, { id: id }).subscribe((result) => {
      this.getLicense()
      this.toasterService.pop(result['message'], result['message'], result['data']);
    })
  }



  // on your component class declare
  onFilter(event, dt) {
    this.filteredValuess = [];
    this.total_utilize_val = 0;
    this.total_lic_val = 0;
    this.total_balance_val = 0;
    this.filteredValuess = event.filteredValue;
    for (let i = 0; i < this.filteredValuess.length; i++) {
      if (this.filteredValuess[i]["lic_value"]) {
        this.total_lic_val =
          this.total_lic_val +
          Number(this.filteredValuess[i]["lic_value"]);
      }
      if (this.filteredValuess[i]["tot_utilise"]) {
        this.total_utilize_val =
          this.total_utilize_val +
          Number(this.filteredValuess[i]["tot_utilise"]);
      }
      if (this.filteredValuess[i]["lic_value"]) {
        this.total_balance_val =
          this.total_balance_val +
          Number(this.filteredValuess[i]["lic_value"]) - Number(this.filteredValuess[i]["tot_utilise"]);
      }
    }
  }

  calculateTotal() {
    this.total_lic_val = 0;
    this.total_utilize_val = 0;
    this.total_balance_val = 0;

    for (let val of this.filter_table_data) {
      this.total_lic_val = this.total_lic_val + Number(val.lic_value);
      this.total_utilize_val = this.total_utilize_val + Number(val.tot_utilise);
      this.total_balance_val = this.total_balance_val + Number(val.lic_value) - Number(val.tot_utilise);
    }
  }

  calculateFooterValues(values: any) {
    if (values.lic_value) {
      this.total_lic_val = this.total_lic_val + Number(values.lic_value);
    }
    if (values.tot_utilise) {
      this.total_utilize_val = this.total_utilize_val + Number(values.tot_utilise);
    }
    this.total_balance_val = this.total_balance_val + Number(values.lic_value) - Number(values.tot_utilise);
  }


  exportExcel() {
    let arr = [];
    const foot = {};
    let export_list = []
    if (this.filteredValuess) {
      arr = this.filteredValuess;
    } else {
      arr = this.filter_table_data;
    }

    for (let i = 0; i < arr.length; i++) {
      const export_planning = {};
      for (let j = 0; j < this.cols.length; j++) {
        if (this.cols[j]["header"] != "Action") {
          export_planning[this.cols[j]["header"]] =
            arr[i][this.cols[j]["field"]];
        }
      }
      export_list.push(export_planning);
    }




    for (let j = 0; j < this.cols.length; j++) {
      if (this.cols[j]["field"] === "lic_value") {
        foot[this.cols[j]["header"]] = `Total:${this.total_lic_val}`;
      }

      else if (this.cols[j]["field"] === "tot_utilise") {
        foot[this.cols[j]["header"]] = `Total:${this.total_utilize_val}`;
      }

      else if (this.cols[j]["field"] === "balance") {
        foot[this.cols[j]["header"]] = `Total:${this.total_balance_val}`;
      }

      else {
        foot[this.cols[j]["header"]] = "";
      }
    }
    export_list.push(foot);



    this.exportService.exportExcel(
      export_list,
      "License List"

    );
  }

  onCheckAll(checked) {
    let arr = [];
    arr = this.filter_table_data;

    if (checked) {
      this.inputs.forEach(check => {
        check.nativeElement.checked = true;
      });
      for (const val of arr) {
        // this.item.push(val);
        this.onChange(true, val);
      }

    } else {
      this.inputs.forEach(check => {
        check.nativeElement.checked = false;
      });
      for (const val of arr) {
        // this.item.splice(this.item.indexOf(val), 1);
        this.onChange(false, val);
      }
    }

    // this.onChange(true, this.item);




  }


  // when checkbox change, add/remove the item from the array
  onChange(checked, item) {

    if (checked) {
      this.checkedList.push(item);

    } else {
      this.checkedList.splice(this.checkedList.indexOf(item), 1);

    }


  }

  sendMail() {
    console.log(this.invoice_list)
    let status = false;
    if (this.checkedList.length > 0) {
      for (let i = 0; i < this.checkedList.length; i++) {
        if (this.checkedList[0].port_id === this.checkedList[i].port_id) {
          status = true;
        } else {
          status = false;
          break;
        }

      }
    }

    if (status && this.checkedList.length) {
      this.mailList = this.checkedList;
      //this.email = this.mailList[0].cha_email;
      this.email = [];

      let suborg = [];
      if (this.checkedList[0].lic_invoice_master.port_master.port_chas.length > 0) {
        for (let cha of this.checkedList[0].lic_invoice_master.port_master.port_chas) {
          suborg.push(cha.cha_id);
        }

        for (let i = 0; i < this.invoice_list.length; i++) {
          if (this.invoice_list[i].port_master.id == this.port) {
            this.email = this.invoice_list[i].port_master.email.split(',');
          }
        }
      }
      this.port_name = this.mailList[0].port_name;
      this.getTemplate();
      this.sendMailModal.show();
    } else {
      this.toasterService.pop('warning', 'warning', 'Please Select Proper License');
    }

  }

  getTemplate() {
    this.template = '';
    this.subject = '';
    this.from = '';
    this.footer = '';
    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'License Mail' }).subscribe(response => {

      this.template = response[0].custom_html;
      this.subject = response[0].subject;
      this.from = response[0].from_name;

      const re = /{PORT}/gi;

      this.subject = this.subject.replace(re, this.port_name);

    })

    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
      this.footer = response[0].custom_html;

    })
  }

  compose_mail() {
    if (this.checkedList.length > 0) {

      if (this.tomailtext != null && this.tomailtext != undefined && this.tomailtext != '') {
        let to = [];
        let cc = [];
        let attachment = [];
        let html = '';
        if (this.tomailtext) {
          to = this.tomailtext.split(",");
        }

        if (this.ccmailtext) {
          cc = this.ccmailtext.split(",");
        }

        html = `${html} <table id="table" ><tr><th>Sr.No</th><th>Type of license </th><th>License No. </th><th >License Date</th><th >License Value</th><th >Port Code</th></tr>`;
        let id = [];
        for (let i = 0; i < this.mailList.length; i++) {

          id.push(this.mailList[i]['id']);
          html = `${html} <tr> <td> ${Number(i + 1)} </td><td> ${this.mailList[i]['type_of_lic']} </td><td> ${this.mailList[i]['lic_no']}</td><td> ${this.mailList[i]['lic_purchase_date']}</td><td> ${this.mailList[i]['lic_value']}</td><td> ${this.mailList[i]['port_code'] != null ? this.mailList[i]['port_code'] : ''}</td><tr>`;

          if (this.mailList[i]['lic_file'] != null) {
            const files = this.mailList[i]['lic_file'];
            for (let j = 0; j < files.length; j++) {
              const test = files[j].split('/');

              attachment.push({ 'filename': test[1], 'path': files[j] });
            }
          }


        }
        html = `${html}</table> `;


        let html2 = '';
        const re2 = /{TABLE}/gi;
        html2 = this.template.replace(re2, html);
        html2 = html2 + this.footer;


        let arr = { 'from': this.from, 'to': to, 'cc': cc, 'subject': this.subject, 'html': html2, 'attachments': attachment };

        this.isLoadingMail = true;
        this.loadingBtn = true;
        this.crudServices.postRequest<any>(LicenseMaster.sendEmail, { mail_object: arr, id: id }).subscribe(response => {
          this.isLoadingMail = false;
          this.loadingBtn = false;
          this.toasterService.pop(response.message, response.message, response.data);
          this.closeModal();
        })



      } else {
        this.toasterService.pop('warning', 'warning', 'Enter Email Address ');
      }
    }
  }


  // close all open modal with data clear
  closeModal() {
    //	this.backToList();
    this.tomail = [];
    this.ccMail = [];
    this.ccmailtext = '';
    this.tomailtext = '';
    this.checkedList = [];
    this.mailList = [];
    this.sendMailModal.hide();
    this.uncheckAll();
  }


  // uncheck all checkbox

  uncheckAll() {
    this.mailList = [];
    this.inputs.forEach(check => {
      check.nativeElement.checked = false;
    });
  }

  // set mail variable for to and cc
  mailto(check, val) {
    // console.log(check);
    this.tomailtext = '';
    if (check) {
      this.tomail.push(val);
    } else {
      this.tomail.splice(this.tomail.indexOf(val), 1);
    }

    for (let i = 0; i < this.tomail.length; i++) {
      this.tomailtext = this.tomailtext + this.tomail[i] + ',';
    }
    // console.log(this.tomail);
  }
  ccmail(check, val) {
    // console.log(check);
    this.ccmailtext = '';
    if (check) {
      this.ccMail.push(val);
    } else {
      this.ccMail.splice(this.ccMail.indexOf(val), 1);
    }

    // console.log( this.ccMail);
    for (let i = 0; i < this.ccMail.length; i++) {
      this.ccmailtext = this.ccmailtext + this.ccMail[i] + ',';
    }

  }

  ccmailvalue($e) {
    this.ccmailtext = $e.target.value;
    //  console.log(this.ccmailtext);
  }

  tomailvalue($e) {
    this.tomailtext = $e.target.value;
    // console.log(this.tomailtext);
  }

  transferedLicense() {
    if (this.checkedList.length) {
      let id = [];
      for (let val of this.checkedList) {
        id.push(val.id);
      }


      if (id.length) {
        this.crudServices.updateData<any>(LicenseMaster.update, { data: { transfered_status: 1 }, licenseID: id }).subscribe(response => {
          this.toasterService.pop(response.message, response.message, response.data);
          this.closeModal();
          this.getLicense();

        })
      } else {

        this.toasterService.pop('warning', 'warning', 'Select Record');
      }



    } else {
      this.toasterService.pop('warning', 'warning', 'Please Select Checkbox');
    }
  }

  getType(val) {

    switch (val) {
      case 1: return 'EDI'
        break;
      case 2: return 'TRA'
        break;
      case 3: return 'EDI Online'
        break;
      case 4: return 'MEIS'
        break;
      case 5: return 'FPS'
        break;
      case 6: return 'ROSCTL'
        break;
      case 7: return 'ROSL'
        break;
      case 8: return 'SEIS'
        break;
      case 9: return 'FMS'
        break;
      case 10: return 'VKUY'
        break;
      case 11: return 'DFIA'
        break;
      case 12: return 'RODTEP'
        break;

      default:
        break;
    }

  }

  transerToOrg(item) {
    this.selectedLicenceID = item.id;
    this.balance = item.balance;
    this.transfer_amount = item.transfer_amount;
    this.licenseForm.patchValue({
      transfer_org_id: item.transfer_org_id,
      transfer_amount: item.transfer_amount,
      transfer_remark: item.transfer_remark
    })
    this.trasferModal.show();
  }

  transferModalClose() {
    this.selectedLicenceID = 0;
    this.trasferModal.hide()
  }

  transferLicenseToOrg() {
    let original = Number(this.transfer_amount) + Number(this.balance);



    if (original > this.licenseForm.value.transfer_amount) {
      let amt = Number(original) - Number(this.licenseForm.value.transfer_amount);

      let data = {
        transfer_org_id: this.licenseForm.value.transfer_org_id,
        transfer_amount: this.licenseForm.value.transfer_amount,
        transfer_remark: this.licenseForm.value.transfer_remark,
        lic_value: amt
      }
      let body = {
        data: data,
        licenseID: this.selectedLicenceID
      }
      this.crudServices.updateData(LicenseMaster.update, body).subscribe((result) => {
        this.trasferModal.hide();
        this.getLicense()
        this.toasterService.pop(result['message'], result['message'], result['data']);
      })

    } else {
      this.toasterService.pop('warning', 'warning', 'Amount Exceeds');
    }




  }

  closeModalForm() {
    this.addLicenseModal.hide();
    this.licenseForm.reset();
    this.docs = [];

  }



  getUtilizationByLicenceId(id) {


    this.crudServices.getOne(LicenseKnockOf.getOne, { lic_id: id }).subscribe((response) => {
      if (response['code'] == '100') {

        this.utlilization_list = response['data'].map(data => {
          data.lic_number = data.license_master.lic_no
          data.lic_value = data.license_master.lic_value
          data.be_no = data.bill_of_entry.be_no
          data.be_copy = data.bill_of_entry.be_copy
          return data;
        })
        if (this.utlilization_list.length > 0) {
          this.utilizeModal.show()
          console.log(this.utlilization_list, 'success')
        } else {
          this.toasterService.pop('warning', 'Data Not Available', 'Data Not Available')
        }
      } else {
        this.toasterService.pop('error', 'something  went wrong', 'Data Not Available')
      }
    });
  }

  getSumOf(arraySource, field) {
    return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0);
  }

  onAction(item, type) {
    if (type == 'Download_BE_COPY') {
      let invoice_arr = JSON.parse(item);
      this.crudServices.downloadMultipleFiles(invoice_arr);
    }
  }
}
function get_po_financial_year(lic_purchase_date: any) {
  throw new Error('Function not implemented.');
}

