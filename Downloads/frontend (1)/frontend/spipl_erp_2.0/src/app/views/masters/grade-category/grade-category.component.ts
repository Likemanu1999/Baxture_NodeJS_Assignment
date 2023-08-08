import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { GradeCategory } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-grade-category',
  templateUrl: './grade-category.component.html',
  styleUrls: ['./grade-category.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, PermissionService],
})
export class GradeCategoryComponent implements OnInit {
  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;
  gradeCatForm: FormGroup;
  gradeCatUpdateForm: FormGroup;
  submitted = false;
  updated = false;
  update_grade_category: string;
  error: any;
  public data: any = [];
  public filterQuery = '';
  filterArray = ['unit_type'];
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
  constructor(private fb: FormBuilder,
    private crudServices: CrudServices,
    toasterService: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService) {
    this.toasterService = toasterService;
    this.initForm();
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.getGradeCat();
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getGradeCat() {
    this.isLoading = true;
    this.subscription = this.crudServices.getAll<any>(GradeCategory.getAll).subscribe(res => {
      this.data = res;
      this.isLoading = false;
    }, // success path
      error => this.error = error // error path
    );
  }
  ngOnInit() {
  }
  initForm() {
    this.gradeCatForm = this.fb.group({
      grade_category: ['', [Validators.required]],
    });
    this.gradeCatUpdateForm = new FormGroup({
      'update_grade_category': new FormControl(null, Validators.required),
    });
  }

  get f() { return this.gradeCatForm.controls; }
  get g() { return this.gradeCatUpdateForm.controls; }
  onReset() {

    this.submitted = false;
    this.gradeCatForm.reset();

  }
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.gradeCatForm.invalid) {
      return;
    }
    this.subscription = this.crudServices.addData<any>(GradeCategory.add, {
      grade_category: this.gradeCatForm.value.grade_category
    }).subscribe((response) => {
      this.onReset();
      this.getGradeCat();
      this.toasterService.pop(response.message, 'Success', response.data);
    });
  }

  onEdit(id: number) {

    if (id != null) {
      this.id = id;
      let grade_category = '';
      this.subscription = this.crudServices.getOne<any>(GradeCategory.getOne, {
        id: this.id
      }).subscribe((response) => {
        if (response === null) {
          this.error = response;
          this.toasterService.pop('error', 'Error', 'Something Went Wrong');
        } else {
          id = response[0].id;
          grade_category = response[0].grade_category;
          this.gradeCatUpdateForm = new FormGroup({
            'update_grade_category': new FormControl(grade_category, Validators.required),
          });
        }
      }, errorMessage => {
        this.error = errorMessage.message;
      });
      this.myModal.show();
    }
  }

  onDelete(id: number) {
    if (id) {
      this.crudServices.deleteData<any>(GradeCategory.delete, {
        id: id
      }).subscribe((response) => {
        this.getGradeCat();
        this.toasterService.pop(response.message, 'Success', response.data);
      });
    }
  }

  onUpdate() {
    this.updated = true;
    if (this.gradeCatUpdateForm.invalid) {
      return;
    }
    if (this.gradeCatUpdateForm.dirty) {
      this.crudServices.updateData<any>(GradeCategory.update, {
        id: this.id,
        grade_category: this.gradeCatUpdateForm.value.update_grade_category
      }).subscribe((response) => {
        this.getGradeCat();
        this.toasterService.pop(response.message, 'Success', response.data);
        this.myModal.hide();
      });
    } else {
      this.myModal.hide();
    }
  }
}
