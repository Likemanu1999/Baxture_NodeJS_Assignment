import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
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
} from "@angular/forms";
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PortMaster, SubOrg, LicenseInvoice, FileUpload } from '../../../shared/apis-path/apis-path';
import { ExportService } from "../../../shared/export-service/export-service";
import * as moment from 'moment';

@Component({
  selector: 'app-licence-invoice-list',
  templateUrl: './licence-invoice-list.component.html',
  styleUrls: ['./licence-invoice-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    DatePipe,
    CrudServices,
    ExportService
  ]
})

export class LicenceInvoiceListComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;
  mode: string = 'add';

  datePickerConfig = 'dd/MM/yyyy';
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
  invoice_list: any = [];

  currentYear: number;
	date = new Date();



  //*config For Edit Billing  Stock Transfer modals
  @ViewChild("addInvoiceModal", { static: false })
  public addInvoiceModal: ModalDirective;

  fileData: FormData = new FormData();
  invoiceForm: FormGroup;

  vendorList: any = [];
  portList: any = [];
  selectedInvoiceId: any;
  vendor_filter = [];
  port_filter = [];


  statusList = [{ name: 'Pendding', value: 0 }, { name: 'Recieved', value: 1 }];
  total_invoice_amount: number = 0;
  filteredValuess: any;

  maxDate: Date = new Date(); // date range will not greater  than today
  bsRangeValue: any = []; //DatePicker range Value
  invoice_date: any;

  lic_inv_add: boolean = false;
  lic_inv_edit: boolean = false;
  lic_inv_delete: boolean = false;
  lic_inv_csv: boolean = false;




  constructor(private toasterService: ToasterService, private fb: FormBuilder,
    private permissionService: PermissionService,
    private exportService: ExportService,
    private loginService: LoginService,
    public datepipe: DatePipe, private crudServices: CrudServices) {
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
     
      
    this.lic_inv_add = (this.links.indexOf('lic_inv_add') > -1);
    this.lic_inv_edit = (this.links.indexOf('lic_inv_edit') > -1);
    this.lic_inv_delete = (this.links.indexOf('lic_inv_delete') > -1);
    this.lic_inv_csv = (this.links.indexOf('lic_inv_csv') > -1);


    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {
			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
		}


  }

  ngOnInit() {
    this.generateHeader();
    this.getPort();
    this.getVendor();
    this.getInvoice();
    this.generateForm();

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



  convertOnPatch(date) {
    return this.datepipe.transform(date, 'dd-MM-yyyy');
  }

  clearDate() {
    this.bsRangeValue = [];
    this.getInvoice()
  }


  getInvoice() {

    let conditions = {};
    this.invoice_list = []
    if (this.bsRangeValue) {
      conditions["start_date"] = this.dateFormating(this.bsRangeValue[0]);
      conditions["end_date"] = this.dateFormating(this.bsRangeValue[1]);
    }

    this.isLoading = true;

    this.crudServices.getOne(LicenseInvoice.getOne, conditions)
      .subscribe((result) => {
        this.isLoading=false;
         this.invoice_list =[];
        if (result['data']) {
          let tot_utilise = 0
          if(result['data'].length) {
            result['data'].forEach(element => {
              element.vendor_name = element.vendorId.sub_org_name;
              this.pushVendor(element.vendor_name)
              element.port_name = element.port_master.port_name;
              this.pushPort(element.port_name)
              element.invoice_file = JSON.parse(element.invoice_file);
              this.invoice_list.push(element)
              this.calculateFooterValues(element);
              
            });
          }
          // result['data'].map((element) => {
          //   element.vendor_name = element.vendorId.sub_org_name;
          //   this.pushVendor(element.vendor_name)
          //   element.port_name = element.port_master.port_name;
          //   this.pushPort(element.port_name)
          //   element.invoice_file = JSON.parse(element.invoice_file);
          //   this.invoice_list.push(element)
          //   this.calculateFooterValues(element);
          //   return element
          // })
        }
      })
  }



  pushVendor(name) {
    if (this.vendor_filter.length < 1) {
      this.vendor_filter.push({ value: name, label: name });
    } else {
      let data = this.vendor_filter.find(({ value }) => value === name);
      if (!data) {
        this.vendor_filter.push({ value: name, label: name });
      } else {
        return;
      }
    }
  }


  pushPort(name) {
    if (this.port_filter.length < 1) {
      this.port_filter.push({ value: name, label: name });
    } else {
      let data = this.port_filter.find(({ value }) => value === name);
      if (!data) {
        this.port_filter.push({ value: name, label: name });
      } else {
        return;
      }
    }
  }

  generateForm() {
    //@Send Email Form Here
    this.invoiceForm = new FormGroup({
      lic_invoice_no: new FormControl(null, Validators.required),
      invoice_date: new FormControl(null, Validators.required),
      invoice_file: new FormControl(null, Validators.required),
      lic_vendor_id: new FormControl(null, Validators.required),
      lic_rate: new FormControl(null, Validators.required),
      lic_port_id: new FormControl(null, Validators.required),
      invc_amt: new FormControl(null, Validators.required)
    });


  }


  get f() {
    return this.invoiceForm.controls;
  }



  generateHeader() {
    this.cols = [
      { field: 'id', header: 'Id', style: '100' },
      { field: 'port_name', header: 'License Port', style: '200' },
      { field: 'lic_invoice_no', header: 'Invoice Number', style: '200' },
      { field: 'invc_amt', header: 'Invoice Amount', style: '200' },
      { field: 'lic_rate', header: 'License Rate', style: '200' },
     
      { field: 'vendor_name', header: 'Vendor', style: '200' },
      { field: 'invoice_date', header: 'Invoice Date', style: '200' },
      { field: 'invoice_file', header: 'Invoice File', style: '200' },
      { field: 'added_by', header: 'Added By', style: '200' },
      { field: 'Action', header: 'Action', style: '180' }
    ];

  }

  onAdd() {
    this.mode = 'add';
    this.invoiceForm.get('invoice_file').setValidators(Validators.required);
    this.invoiceForm.get('invoice_file').updateValueAndValidity();
    this.addInvoiceModal.show();

  }


  onEdit(data) {
    this.mode = 'edit'
    this.invoiceForm.get('invoice_file').clearValidators();
    this.invoiceForm.get('invoice_file').updateValueAndValidity();
    console.log(data,'data');
    
    if (data) {
      this.selectedInvoiceId = data.id;
      this.invoiceForm.patchValue({
        lic_invoice_no: data.lic_invoice_no,
        invoice_date: new Date(data.invoice_date),
        lic_vendor_id: data.lic_vendor_id,
        lic_rate: data.lic_rate,
        lic_port_id: data.lic_port_id,
        invc_amt: data.invc_amt
      });
      this.addInvoiceModal.show();
    }

  }

  ewayBillFileUploadEvent(event: any) {
    let files = <Array<File>>event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.fileData.append('license_invoice_list', files[i], files[i]['name']);
    }
  }




  addInvoice() {

    let lic_rate=0;
    let invc_amt=0;

    if(this.invoiceForm.value.lic_rate.toString().indexOf(',') > -1){
      lic_rate=Number(this.invoiceForm.value.lic_rate.replace(/,/g, ''))
    }else{
      lic_rate=Number(this.invoiceForm.value.lic_rate)
    }


    if(this.invoiceForm.value.invc_amt.toString().indexOf(',') > -1){
      invc_amt=Number(this.invoiceForm.value.invc_amt.replace(/,/g, ''))
    }else{
      invc_amt=Number(this.invoiceForm.value.invc_amt)
    }

    let license_data = {
      lic_invoice_no: this.invoiceForm.value.lic_invoice_no,
      invoice_date: this.dateFormating(this.invoiceForm.value.invoice_date),
      lic_vendor_id: this.invoiceForm.value.lic_vendor_id,
      lic_rate:lic_rate,
      lic_port_id: this.invoiceForm.value.lic_port_id,
      invc_amt:invc_amt
    }
    if (this.fileData.get("license_invoice_list") != null) {
      this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
        let filesInvoice = [];
        let license_invoice_res = res.uploads.license_invoice_list;
        if (license_invoice_res != null) {
          if (license_invoice_res.length > 0) {
            for (let i = 0; i < license_invoice_res.length; i++) {
              filesInvoice.push(license_invoice_res[i].location);
            }
          }
          license_data['invoice_file'] = JSON.stringify(filesInvoice);
        }
        this.add(license_data)
      })
    }
    else {
      this.add(license_data)
    }
  }


  add(data) {
    if (this.invoiceForm.valid) {
      if (this.mode == 'add') {
        this.crudServices.addData(LicenseInvoice.add, data).subscribe(result => {
          this.addInvoiceModal.hide();
          this.invoiceForm.reset();
          this.toasterService.pop(result['message'], result['message'], result['data']);
          this.getInvoice()
        });
      }
      else {
        let body = {
          data: data,
          invoiceId: this.selectedInvoiceId
        }
        this.crudServices.updateData(LicenseInvoice.update, body).subscribe((result) => {
          this.toasterService.pop(result['message'], result['message'], result['data']);
          this.addInvoiceModal.hide();
          this.invoiceForm.reset();
          this.getInvoice()
        })
      }

    }
    else {
      this.toasterService.pop('Error', 'Error 1', 'Error data');
    }

  }


  onDelete(id) {
    this.crudServices.deleteData(LicenseInvoice.delete, { id: id }).subscribe((result) => {
      this.toasterService.pop(result['message'], result['message'], result['data']);
      this.getInvoice()
    })
  }


  getPort() {
    this.crudServices.getAll(PortMaster.getAll).subscribe(data => {
      this.portList = data;
    })

  }

  getVendor() {
    this.crudServices.postRequest(SubOrg.getSubOrgByCategory, { category_id:  71}).subscribe((vendor) => {
      this.vendorList = vendor;
    })
  }


  // on your component class declare
  onFilter(event, dt) {
    this.filteredValuess = [];
    this.total_invoice_amount = 0;
    this.filteredValuess = event.filteredValue;
    for (let i = 0; i < this.filteredValuess.length; i++) {
      if (this.filteredValuess[i]["invc_amt"]) {
        this.total_invoice_amount =
          this.total_invoice_amount +
          parseInt(this.filteredValuess[i]["invc_amt"]);
      }
    }
  }

  calculateFooterValues(values) {
    if (values.invc_amt) {
      this.total_invoice_amount = this.total_invoice_amount + parseInt(values.invc_amt);
    }
  }


  exportExcel() {
    let arr = [];
    const foot = {};
    let export_list = []
    if (this.filteredValuess) {
      arr = this.filteredValuess;
    } else {
      arr = this.invoice_list;

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
      if (this.cols[j]["field"] === "invc_amt") {
        foot[this.cols[j]["header"]] = `Total:${this.total_invoice_amount}`;
      }
      else {
        foot[this.cols[j]["header"]] = "";
      }
    }
    export_list.push(foot);
    this.exportService.exportExcel(export_list, "Invoice License List");
  }

}
