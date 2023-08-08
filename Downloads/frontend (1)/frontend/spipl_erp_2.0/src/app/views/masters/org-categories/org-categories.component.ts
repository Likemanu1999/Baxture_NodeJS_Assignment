import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
// import { OrgCategoryService, OrgCategoryDataList } from './org-category-service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { OrganizationCategory } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-org-categories',
  templateUrl: './org-categories.component.html',
  styleUrls: ['./org-categories.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, PermissionService],
})
export class OrgCategoriesComponent implements OnInit, OnDestroy {
  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;
  orgCategoryForm: FormGroup;
  updateOrgCategoryForm: FormGroup;
  submitted = false;
  updated = false;
  update_cont_type: string;
  error: any;
  public data: any = [];
  public filterQuery = '';
  filterArray = ['cont_type'];
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


  constructor(
    private fb: FormBuilder,
    toasterService: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
    public crudServices: CrudServices
  ) {
    this.toasterService = toasterService;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];

  }


  ngOnInit(): void {
    this.initForm();
    this.getCategories();
  }

  initForm() {
    this.orgCategoryForm = this.fb.group({
      cont_type: ['', [Validators.required]],
    });
    this.updateOrgCategoryForm = new FormGroup({
      'update_cont_type': new FormControl(null, Validators.required),
    });
  }

  getCategories() {
    this.isLoading = true;
    this.subscription = this.crudServices.getAll<any>(OrganizationCategory.getAll).subscribe(res => {
      this.data = res;
      this.isLoading = false;
    }, error => this.error = error);
  }

  // convenience getter for easy access to form fields
  get f() { return this.orgCategoryForm.controls; }
  get g() { return this.updateOrgCategoryForm.controls; }

  onReset() {
    this.submitted = false;
    this.orgCategoryForm.reset();
  }

  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.orgCategoryForm.invalid) {
      return;
    }
    this.crudServices.addData<any>(OrganizationCategory.add, {
      cont_type: this.orgCategoryForm.value.cont_type
    }).subscribe((response) => {
      this.onReset();
      this.getCategories();
      this.toasterService.pop(response.message, 'Success', response.data);

    });

  }

  onEdit(id: number) {

    if (id != null) {
      this.id = id;
      let cont_type = '';
      this.crudServices.getOne<any>(OrganizationCategory.getOne, {
        id: this.id
      }).subscribe((response) => {
        if (response === null) {
          this.error = response;
          this.toasterService.pop('error', 'Error', 'Something Went Wrong');
        } else {
          id = response['id'];
          cont_type = response[0]['cont_type'];
          this.updateOrgCategoryForm = new FormGroup({
            'update_cont_type': new FormControl(cont_type, Validators.required),
          });
        }
      }, errorMessage => {
        this.error = errorMessage.message;
      });
      this.myModal.show();
    }
  }

  onUpdate() {
    this.updated = true;
    if (this.updateOrgCategoryForm.invalid) {
      return;
    }

    if (this.updateOrgCategoryForm.dirty) {
      this.crudServices.updateData<any>(OrganizationCategory.update, {
        id: this.id,
        cont_type: this.updateOrgCategoryForm.value.update_cont_type
      }).subscribe((response) => {
        this.getCategories();
        this.toasterService.pop(response.message, 'Success', response.data);
        this.myModal.hide();
      });
    } else {
      this.myModal.hide();
    }
  }

  onDelete(id: number) {
    if (id) {
      this.crudServices.deleteData<any>(OrganizationCategory.delete, {
        id: id
      }).subscribe((response) => {
        // this.deleteRow(id);
        this.getCategories();
        this.toasterService.pop(response.message, 'Success', response.data);
      });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
