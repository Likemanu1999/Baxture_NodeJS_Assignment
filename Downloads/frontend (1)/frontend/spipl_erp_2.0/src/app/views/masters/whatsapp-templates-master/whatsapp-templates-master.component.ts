import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { whatsappTemplateMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-whatsapp-templates-master',
  templateUrl: './whatsapp-templates-master.component.html',
  styleUrls: ['./whatsapp-templates-master.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, PermissionService],
})
export class WhatsappTemplatesMasterComponent implements OnInit {

  whatsappForm: FormGroup;

  submitted = false;
  updated = false;
  error: any;
  public data: any = [];
  public filterQuery = '';
  filterArray = ['name'];
  isLoading = false;
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

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  mode: string = "Add";

  constructor(private fb: FormBuilder,
    private crudServices: CrudServices,
    toasterService: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService
  ) {
    this.toasterService = toasterService;
    this.initForm();
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.getData();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  getData() {
    this.isLoading = true;
    this.subscription = this.crudServices.getAll<any>(whatsappTemplateMaster.getAll).subscribe(res => {
      this.data = res.data;
      console.log(this.data);
      this.isLoading = false;
    }, // success path
      error => this.error = error // error path
    );
  }
  ngOnInit() {
  }
  initForm() {

    this.whatsappForm = new FormGroup({
      'name': new FormControl(null, Validators.required),
    });
  }
  // convenience getter for easy access to form fields
  get f() { return this.whatsappForm.controls; }
  get g() { return this.whatsappForm.controls; }
  onReset() {

    this.submitted = false;
    this.id = 0;
    this.mode = 'Add';
    this.whatsappForm.reset();

  }

  onSubmit() {
    this.submitted = true;
    if (this.whatsappForm.invalid) {
      return;
    }

    if (this.id != undefined && this.id) {
      this.crudServices.updateData<any>(whatsappTemplateMaster.update, {
        id: this.id,
        template_name: this.whatsappForm.value.template_name,
        body:this.whatsappForm.value.body
      }).subscribe((response) => {
        this.getData();
        this.onReset();
        this.toasterService.pop(response.message, 'Success', response.data);

      });
    } else {
      this.subscription = this.crudServices.addData<any>(whatsappTemplateMaster.add, {
        template_name: this.whatsappForm.value.template_name,
        body:this.whatsappForm.value.body
      }).subscribe((response) => {
        this.onReset();
        this.getData();
        this.toasterService.pop(response.message, 'Success', response.data);

      });

    }

  }
  onEdit(item) {
    this.mode = "Edit"
    this.id = item.id;
    this.whatsappForm.patchValue({
      name: item.name
    })

  }
  onDelete(id: number) {
    if (id) {
      this.crudServices.deleteData<any>(whatsappTemplateMaster.delete, {
        id: id
      }).subscribe((response) => {
        this.getData();
        this.toasterService.pop(response.message, 'Success', response.data);
      });
    }
  }


}
