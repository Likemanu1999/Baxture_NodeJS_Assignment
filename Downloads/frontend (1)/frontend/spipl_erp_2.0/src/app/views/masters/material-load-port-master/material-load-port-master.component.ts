import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { MaterialLoadPortMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-material-load-port-master',
  templateUrl: './material-load-port-master.component.html',
  styleUrls: ['./material-load-port-master.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToasterService, PermissionService, CrudServices]

})
export class MaterialLoadPortMasterComponent implements OnInit {

  loadPortForm: FormGroup;

  // public data: OrgCategoryDataList;
  public filterQuery = '';
  filterArray = [];
  isLoading = false;
  private toasterService: ToasterService;
  id: number;
  load_port_name: string;
  LoadPortData: any = [];

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
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    toasterService: ToasterService,
  ) {
    this.toasterService = toasterService;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];


  }

  ngOnInit() {
    this.loadPortForm = this.fb.group({
      load_port_name: ['', [Validators.required]],
    });

    this.getAllPorts();


  }

  getAllPorts() {
    this.isLoading = true;
    this.crudServices.getAll<any>(MaterialLoadPortMaster.getAll).subscribe(response => {
      this.LoadPortData = response.data;
      this.isLoading = false;

    });
  }

  onSubmit() {
    if (this.id !== undefined && this.id !== 0 && this.id !== null) {
      this.crudServices.updateData<any>(MaterialLoadPortMaster.update, {
        id: this.id,
        load_port: this.loadPortForm.value.load_port_name
      }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.onReset();
        this.getAllPorts();
      });

    } else {
      this.crudServices.addData<any>(MaterialLoadPortMaster.add, {
        load_port: this.loadPortForm.value.load_port_name
      }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.onReset();
        this.getAllPorts();
      });
    }

  }

  onEdit(item) {
    this.id = item.id;
    this.load_port_name = item.load_port;
  }

  onReset() {
    this.id = 0;
    this.load_port_name = '';
  }

  onDelete(id, index) {
    if (id) {
      this.crudServices.deleteData<any>(MaterialLoadPortMaster.delete, {
        id: id
      }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.LoadPortData.splice(index, 1);
        this.getAllPorts();
      });

    }
  }

}
