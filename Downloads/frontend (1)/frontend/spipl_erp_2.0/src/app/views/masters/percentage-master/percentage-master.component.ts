
import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { percentage_master, percentage_type } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-percentage-master',
  templateUrl: './percentage-master.component.html',
  styleUrls: ['./percentage-master.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, PermissionService, DatePipe],
})
export class PercentageMasterComponent implements OnInit {
  addForm: FormGroup;
  private toasterService: ToasterService;
  id: number;
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
  public filterQuery = '';
  filterArray = [];
  isLoading = false;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  data: any;
  percentage_type: any;

  constructor(
    private fb: FormBuilder,
    private crudServices: CrudServices,
    toasterService: ToasterService,
    private permissionService: PermissionService,
    private datePipe: DatePipe) {
    this.toasterService = toasterService;

    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];

    this.addForm = this.fb.group({
      from_date: ['', [Validators.required]],
      to_date: ['', [Validators.required]],
      type_id: ['', [Validators.required]],
      percent_value: ['', [Validators.required]],
    });

    this.crudServices.getAll<any>(percentage_type.getAll).subscribe(res => {
      this.percentage_type = res.data;

    });
  }

  ngOnInit() {
    this.getPercentage();
  }


  getPercentage() {
    this.id = 0;
    this.isLoading = true;
    this.crudServices.getAll<any>(percentage_master.getAll).subscribe(res => {
      this.data = res.data;
      this.isLoading = false;
    });
  }



  onSubmit() {

    if (this.addForm.invalid) {
      return;
    }

    if (this.id) {
      this.crudServices.updateData<any>(percentage_master.update, {
        type_id: this.addForm.value.type_id,
        from_date: this.datePipe.transform(this.addForm.value.from_date, 'yyyy-MM-dd'),
        to_date: this.datePipe.transform(this.addForm.value.to_date, 'yyyy-MM-dd'),
        percent_value: this.addForm.value.percent_value,
        id: this.id
      }).subscribe(res => {
        this.id = 0;
        if (res.code == '100') {
          this.toasterService.pop(res.message, 'Success', res.data);
          this.addForm.reset();
          this.getPercentage();
        } else {
          this.toasterService.pop('error', 'error', 'Something Went wrong');
        }

      });
    } else {
      this.crudServices.addData<any>(percentage_master.add, {
        type_id: this.addForm.value.type_id,
        from_date: this.datePipe.transform(this.addForm.value.from_date, 'yyyy-MM-dd'),
        to_date: this.datePipe.transform(this.addForm.value.to_date, 'yyyy-MM-dd'),
        percent_value: this.addForm.value.percent_value
      }).subscribe(res => {
        if (res.code == '100') {
          this.toasterService.pop(res.message, 'Success', res.data);
          this.addForm.reset();
          this.getPercentage();
        } else {
          this.toasterService.pop('error', 'error', 'Something Went wrong');
        }

      });
    }

  }
  onEdit(item) {

    if (item.id != null) {
      this.id = item.id;
      this.addForm.controls.type_id.setValue(item.type_id);
      this.addForm.controls.from_date.setValue(item.from_date);
      this.addForm.controls.to_date.setValue(item.to_date);
    }
  }

  onDelete(id: number) {
    if (id) {
      this.crudServices.deleteData<any>(percentage_master.delete, {
        id: id
      }).subscribe((res) => {
        this.getPercentage();
        this.toasterService.pop(res.message, 'Success', res.data);
      });
    }
  }


}
