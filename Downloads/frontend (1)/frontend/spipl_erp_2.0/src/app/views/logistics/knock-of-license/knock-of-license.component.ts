import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { billOfEntry, LicenseKnockOf, LicenseMaster, NonNegotiable } from '../../../shared/apis-path/apis-path';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-knock-of-license',
  templateUrl: './knock-of-license.component.html',
  styleUrls: ['./knock-of-license.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    DatePipe,
    CrudServices
  ]
})
export class KnockOfLicenseComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;
  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;


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

  utilizeForm: FormGroup;
  non_list = [];
  utilize_list: any;
  cols: { field: string; header: string; style: string; }[];
  mode: any = 'add';
  beID: any;
  n_id: any;
  be_id: any;

  LicenseId: any;
  license_list: any;
  be_list: any;
  be_amount = 0;
  lic_val: number = 0;
  total_utilize: number = 0;
  footer_sum_utilize_val=0;
  be_number_list: any;
  selecteLic_knock: any;


  license_disable: boolean = true;
  utilize_disable: boolean = true;
  constructor(private router: Router, private toasterService: ToasterService,
    private permissionService: PermissionService,
    private loginService: LoginService,
    private route: ActivatedRoute,
    public datepipe: DatePipe, private crudServices: CrudServices) {

    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links; 

    this.cols = [
      { field: 'id', header: 'id', style: '100' },
      { field: 'utilize_date', header: 'utilize Date', style: '150' },
      { field: 'vendor', header: 'License Vendor', style: '180' },
      { field: 'ad_code', header: 'License Number', style: '200' },
      { field: 'amount_utilize', header: 'Utilize Amount', style: '200' },
      { field: 'sub_org_name', header: 'License File', style: '200' },
      { field: 'added_by', header: 'Added By', style: '150' },
      { field: 'added_date', header: 'Date Time', style: '150' },
      { field: 'remark', header: 'Remark', style: '100' },
    ];
  }


  ngOnInit() {
    this.genrateForm();
    this.route.params.subscribe((params: Params) => {
      this.be_id = +params["BE_id"];
      this.getBE();
      this.getUtilizationList()
    });
    this.getLicense();

  }

  genrateForm() {
    this.utilizeForm = new FormGroup({
      'utilize_date': new FormControl(null, Validators.required),
      'lic_id': new FormControl(null, Validators.required),
      'amount_utilize': new FormControl(null, Validators.required),
      'remark': new FormControl(null)
    })
  }

  //*Check Form control Validations
  get f() {
    return this.utilizeForm.controls;
  }




  getLicense() {
    this.crudServices.getAll(LicenseMaster.getAllTransfered).subscribe(response => {
      let tot_utilise = 0;
      this.license_list = []
      if (response['data']) {
        response['data'].forEach((element) => {
          if(element.transfered_status == 1) {
            element.vendor_id = element.lic_invoice_master.vendorId.sub_org_id;
            element.port_name = element.lic_invoice_master.port_master.port_name;
            element.port_id = element.lic_invoice_master.port_master.id;
            if (element.license_utilizations) {
              tot_utilise = 0;
              element.license_utilizations.forEach((utilise) => {
                if(utilise.deleted == 0) {
                  tot_utilise = tot_utilise + Number(utilise.amount_utilize)
                }
               
              })
            }
  
            
         
           
          
            if (element.lic_file) {
              element.lic_file = JSON.parse(element.lic_file);
            }

            element.tot_utilise = tot_utilise;
            if((element.lic_value - tot_utilise) > 100) {
              element.vendor_name = `${element.lic_invoice_master.vendorId.sub_org_name}-${element.lic_value - tot_utilise}`
              element.licenceLeble=`${element.lic_no} - (${(element.lic_value - tot_utilise).toFixed(2)})`
              this.license_list.push(element)
            }


          }

        })
      }
    })

    // this.license_list = this.crudServices.getAll(LicenseMaster.getAllTransfered).pipe(map((value) => {
      
    //   let tot_utilise = 0;
    //   if (value['data']) {
    //     value['data'].forEach((element) => {
    //       if(element.transfered_status == 1) {
    //         element.vendor_id = element.lic_invoice_master.vendorId.sub_org_id;
    //         element.port_name = element.lic_invoice_master.port_master.port_name;
    //         element.port_id = element.lic_invoice_master.port_master.id;
    //         if (element.license_utilizations) {
    //           tot_utilise = 0;
    //           element.license_utilizations.forEach((utilise) => {
    //             if(utilise.deleted == 0) {
    //               tot_utilise = tot_utilise + Number(utilise.amount_utilize)
    //             }
               
    //           })
    //         }
  
            
    //         element.tot_utilise = tot_utilise;
    //         if((element.lic_value - tot_utilise) > 100) {
    //           element.vendor_name = `${element.lic_invoice_master.vendorId.sub_org_name}-${element.lic_value - tot_utilise}`
    //           element.licenceLeble=`${element.lic_no} - (${(element.lic_value - tot_utilise).toFixed(2)})`
    //         }
           
          
    //         if (element.lic_file) {
    //           element.lic_file = JSON.parse(element.lic_file);
    //         }
    //       }
  
    //     });
    //   }

    
    //   return value['data'];
    // }));

  }




  getUtilizationList() {
  this.footer_sum_utilize_val=0;
    this.crudServices.getOne(LicenseKnockOf.getOne, { be_id: this.be_id }).subscribe((value) => {
      console.log(value['data']);
      
      if (value['data']) {
        value['data'].forEach((element) => {
          if(element.license_master != null) {
            element.lic_file =element.license_master.lic_file!= null ? JSON.parse(element.license_master.lic_file) : null;
            element.vendor_name=element.license_master.lic_invoice_master.vendorId.sub_org_name;
          } 
         
          this.footer_sum_utilize_val=this.footer_sum_utilize_val+Number(element.amount_utilize);
        })
      }
      this.utilize_list=value['data'];;
      return value['data'];
    });
  }



 


  onChangeBE(data) {
    if (data) {
      this.be_amount = 0;
      this.total_utilize = 0;
      if (this.utilize_list.length) {
        this.utilize_list.forEach(element => {
          if (element.be_id == this.be_id) {
            if (element.amount_utilize) {
              this.total_utilize = this.total_utilize + Number(element.amount_utilize);
            }
          }
        });
      }
      this.be_amount = data.bcd_license_val;
      this.license_disable = false;
    }
  }



  onChangeLicense(data) {
    this.lic_val = Number(data.lic_value) - Number(data.tot_utilise)
    this.utilize_disable = false;

    if ((Number(this.be_amount) - Number(this.total_utilize)) < Number(this.lic_val)) {
      let amount = Number(this.be_amount) - Number(this.total_utilize);
      if (this.selecteLic_knock) {
        amount = amount + Number(this.selecteLic_knock.amount_utilize)
      }
      this.utilizeForm.get('amount_utilize').setValidators([Validators.required, Validators.max(amount)]);
    }
    else {
      if (this.selecteLic_knock) {
        this.lic_val = this.lic_val + Number(this.selecteLic_knock.amount_utilize)
      }
      this.utilizeForm.get('amount_utilize').setValidators([Validators.required, Validators.max(this.lic_val)]);

    }
  }





  getBE() {
    this.be_list = []
    this.crudServices.getOne<any>(billOfEntry.getAll, { be_id: this.be_id }).subscribe(response => {
      if (response.length) {
        response.map(item => {
          this.beID = item.id;
          this.n_id = item.n_id;
          this.be_number_list = ` ${item.be_no}`
        })
        this.be_list = response;
      }
    })
  }




  onEdit(data) {
    this.mode = 'edit';
    this.selecteLic_knock = data;

    this.be_list.map(item => {
      if (item.id === this.be_id) {
        this.onChangeBE(item);
      }
    })

    this.license_list.subscribe((result) => {
      result.map(item => {
        if (item.id === data.lic_id) {
          this.onChangeLicense(item);
        }
      })
    })
    this.utilizeForm.patchValue({
      'utilize_date': data.utilize_date ? new Date (data.utilize_date ) : null,
      'lic_id': data.lic_id,
      'amount_utilize': data.amount_utilize,
      'remark': data.remark,
      'be_id': data.be_id,
    });
    this.myModal.show();
  }





  onAdd(be_data) {
    this.mode = 'add';
    this.utilizeForm.reset();
    this.selecteLic_knock = undefined;
    this.getLicense();

    this.utilizeForm.patchValue({
      'utilize_date': be_data.be_dt? new Date (be_data.be_dt) : null , 
    
    });
    this.myModal.show();
    this.onChangeBE(be_data);
  }


  addUtilization() {

   
    if (this.utilizeForm.valid) {
      let formdata = {
        'lic_id': this.utilizeForm.value.lic_id,
        'be_id': this.be_id,
        'amount_utilize': this.utilizeForm.value.amount_utilize,
        'utilize_date': this.datepipe.transform( this.utilizeForm.value.utilize_date ,"yyyy-MM-dd"),
        'remark': this.utilizeForm.value.remark,
        'n_id': this.n_id
      }

      
      if (this.mode == 'add') {
       
        this.crudServices.addData(LicenseKnockOf.add, formdata).subscribe(result => {
          if (result['code'] == '100') {
            if (Number(this.utilizeForm.value.amount_utilize)>=Number(this.lic_val)) {

              let body = {
                data: { knock_off_status: 1 },
                licenseID: this.utilizeForm.value.lic_id
              }
              this.crudServices.updateData(LicenseMaster.update, body).subscribe((result) => {
                this.toasterService.pop(result['message'], result['message'], result['data']);
                this.getUtilizationList()
                this.getLicense();
                this.myModal.hide()
              })
            }
            else {
              this.toasterService.pop(result['message'], result['message'], result['data']);
              this.getUtilizationList();
              this.getLicense();
              this.myModal.hide();
            }

          }

        })
      }
      else {
        let body = {
          data: formdata,
          id: this.selecteLic_knock.id
        }
        this.crudServices.updateData(LicenseKnockOf.update, body).subscribe((result) => {

          if (Number(this.utilizeForm.value.amount_utilize)>=Number(this.lic_val)) {

            let body = {
              data: { knock_off_status: 1 },
              licenseID: this.utilizeForm.value.lic_id
            }
            this.crudServices.updateData(LicenseMaster.update, body).subscribe((result) => {
              this.toasterService.pop(result['message'], result['message'], result['data']);
              this.getUtilizationList()
              this.getLicense();
              this.myModal.hide()
            })
          }
          else {


            let body = {
              data: { knock_off_status: 0 },
              licenseID: this.utilizeForm.value.lic_id
            }
            this.crudServices.updateData(LicenseMaster.update, body).subscribe((result) => {
              this.toasterService.pop(result['message'], result['message'], result['data']);
              this.getUtilizationList()
              this.getLicense();
              this.myModal.hide()
            })


            // this.toasterService.pop(result['message'], result['message'], result['data']);
            // this.getUtilizationList()
            // this.myModal.hide()
          }
          // this.toasterService.pop(result['message'], result['message'], result['data']);
          // this.myModal.hide();
          // this.getUtilizationList()
          // this.getLicense();
        })
      }

    }
  }


  async onDelete(data) {
     await this.crudServices.deleteData(LicenseKnockOf.delete, { id: data.id }).subscribe(async (result) => {
      if(result){
        let body = {
          data: { knock_off_status: 0 },
          licenseID: data.lic_id
        }
        await this.crudServices.updateData(LicenseMaster.update, body).subscribe((result) => {
          this.toasterService.pop(result['message'], result['message'], result['data']);
          this.getUtilizationList()
          this.getLicense();
          this.myModal.hide()
        })
      }
    })
  }

  removeLastComma(strng) {
    var n = strng.lastIndexOf(",");
    var a = strng.substring(0, n);
    return a;
  }




 
}
