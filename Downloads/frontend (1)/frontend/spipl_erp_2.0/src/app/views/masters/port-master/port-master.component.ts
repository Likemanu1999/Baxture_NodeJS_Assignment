import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';

import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PortMaster, SubOrg } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-port-master',
  templateUrl: './port-master.component.html',
  styleUrls: ['./port-master.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToasterService, PermissionService, LoginService, CrudServices],
})
export class PortMasterComponent implements OnInit {
  portForm: FormGroup;
  public filterQuery = '';
  filterArray = ['port_name', 'port_full_name', 'abbr', 'port_address'];
  isLoading = false;
  submitted = false;
  private toasterService: ToasterService;
  id: number;
  subscription: Subscription;
  subscriptionConfirm: Subscription;
  count = 0;
  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to delete?';
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
  user: UserDetails;
  links: string[] = [];
  data: any[];

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  cha_list: any;
  size: string;
  constructor(

    toasterService: ToasterService,
    private permissionService: PermissionService,
    private loginService: LoginService,
    private crudServices: CrudServices
  ) {
    this.size = "col-md-8"
    this.toasterService = toasterService;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];

    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;


    this.portForm = new FormGroup({
      'port_name': new FormControl(null, Validators.required),
      'gst_no': new FormControl(null),
      'port_address': new FormControl(null),
      'port_full_name': new FormControl(null),
      'abbr': new FormControl(null),
      'email': new FormControl(null),
      'email_coa': new FormControl(null),
      'email_delivery': new FormControl(null),
      'cha_id': new FormControl(null),
      'id': new FormControl(null)
    });

    this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 16 }).subscribe(response => {
      this.cha_list = response;
    })
    this.getPort();
  }

  ngOnInit() {
  }

  getPort() {
    this.isLoading = true;
    this.subscription = this.crudServices.getAll<any>(PortMaster.getAll)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.data = data;

        });
  }

  onEdit(id: number) {
    if (id) {
      let port_name = '';
      let port_full_name = '';
      let abbr = '';
      let port_address = '';
      let gst_no = '';
      let email = '';
      let email_coa = '';
      let email_delivery = '';
      this.crudServices.getOne<any>(PortMaster.getOne, {
        id: id
      }).subscribe((response) => {
        port_name = response[0]['port_name'];
        port_full_name = response[0]['port_full_name'];
        abbr = response[0]['abbr'];
        port_address = response[0]['port_address'];
        gst_no = response[0]['gst_no'];
        email = response[0]['email'];
        email_coa = response[0]['email_coa'];
        email_delivery = response[0]['email_delivery'];

        let cha = [];
        if (response[0].port_chas.length > 0) {
          for (let val of response[0].port_chas) {
            cha.push(val.cha_id);
          }
        }
        this.portForm.controls['port_name'].setValue(port_name);
        this.portForm.controls['port_full_name'].setValue(port_full_name);
        this.portForm.controls['abbr'].setValue(abbr);
        this.portForm.controls['port_address'].setValue(port_address);
        this.portForm.controls['gst_no'].setValue(gst_no);
        this.portForm.controls['email'].setValue(email);
        this.portForm.controls['email_coa'].setValue(email_coa);
        this.portForm.controls['email_delivery'].setValue(email_delivery);
        this.portForm.controls['id'].setValue(id);
        this.portForm.controls['cha_id'].setValue(cha);

      });

    }
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.portForm.invalid) {
      return;
    } else {

      if (this.portForm.value.id) {
        this.crudServices.updateData<any>(PortMaster.update, {
          id: this.portForm.value.id,
          port_name: this.portForm.value.port_name,
          port_full_name: this.portForm.value.port_full_name,
          abbr: this.portForm.value.abbr,
          port_address: this.portForm.value.port_address,
          gst_no: this.portForm.value.gst_no,
          cha_id: this.portForm.value.cha_id,
          email: this.portForm.value.email,
          email_coa: this.portForm.value.email_coa,
          email_delivery: this.portForm.value.email_delivery,
        }).subscribe((response) => {
          this.onReset();
          this.getPort();
          this.toasterService.pop(response.message, 'Success', response.data);

        });

      } else {
        this.crudServices.addData<any>(PortMaster.add, {
          port_name: this.portForm.value.port_name,
          port_full_name: this.portForm.value.port_full_name,
          abbr: this.portForm.value.abbr,
          port_address: this.portForm.value.port_address,
          gst_no: this.portForm.value.gst_no,
          cha_id: this.portForm.value.cha_id,
          email: this.portForm.value.email,
          email_coa: this.portForm.value.email_coa,
          email_delivery: this.portForm.value.email_delivery,
        }).subscribe((response) => {
          this.onReset();
          this.getPort();
          this.toasterService.pop(response.message, 'Success', response.data);

        });
      }
    }
  }

  onDelete(id: number) {
    if (id) {
      this.crudServices.deleteData<any>(PortMaster.delete, {
        id: id
      }).subscribe((response) => {
        this.getPort();
        this.toasterService.pop(response.message, 'Success', response.data);
      });

    }
  }

  viewfullscreen() {
    this.add_opt = !this.add_opt;
    this.size = (this.add_opt == true) ? 'col-md-8' : 'col-md-12';
  }
  onReset() {
    this.portForm.reset();
    this.submitted = false;
  }

}
