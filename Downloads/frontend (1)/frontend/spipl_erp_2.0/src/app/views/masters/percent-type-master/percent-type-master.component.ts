
import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { percentage_type } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-percent-type-master',
  templateUrl: './percent-type-master.component.html',
  styleUrls: ['./percent-type-master.component.css'] ,
  encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})
export class PercentTypeMasterComponent implements OnInit {
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
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
    public filterQuery = '';
    filterArray = [];
    isLoading = false;
  data: any;

  constructor( private fb: FormBuilder,
		private crudServices: CrudServices,
		toasterService: ToasterService,
		private permissionService: PermissionService) {
      this.toasterService = toasterService;

      const perms = this.permissionService.getPermission();
      this.add_opt = perms[0];
      this.view_opt = perms[1];
      this.edit_opt = perms[2];
      this.del_opt = perms[3];

      this.addForm = this.fb.group({
        type: ['', [Validators.required]],

          });
    }

  ngOnInit() {
    this.getType();
  }

  onSubmit() {
    if(this.id) {
      this.crudServices.updateData<any>(percentage_type.update, {
        id:this.id,
        type: this.addForm.value.type
      }).subscribe(response=> {
        this.id = 0;
        if(response.code == '100') {
          this.toasterService.pop(response.message, 'Success', response.data);
          this.addForm.reset();
          this.getType();
        } else {
          this.toasterService.pop('error', 'error', 'Something Went wrong');
        }
      })
    } else {
      this.crudServices.addData<any>(percentage_type.add, {
        type: this.addForm.value.type
      }).subscribe(response=> {
        if(response.code == '100') {
          this.toasterService.pop(response.message, 'Success', response.data);
          this.addForm.reset();
          this.getType();
        } else {
          this.toasterService.pop('error', 'error', 'Something Went wrong');
        }
      })
    }
  }

  getType() {
    this.id = 0;
    this.isLoading = true;
   this.crudServices.getAll<any>(percentage_type.getAll).subscribe(res => {
      this.data = res.data;
      this.isLoading = false;
    });
  }

  onEdit(item) {

    if (item.id != null) {
      this.id = item.id;
      this.addForm.controls.type.setValue(item.type);

    }
  }

  onDelete(id: number) {
    if (id) {
      this.crudServices.deleteData<any>(percentage_type.delete, {
        id: id
      }).subscribe((res) => {
        this.getType();
        this.toasterService.pop(res.message, 'Success', res.data);
      });
    }
  }

}
