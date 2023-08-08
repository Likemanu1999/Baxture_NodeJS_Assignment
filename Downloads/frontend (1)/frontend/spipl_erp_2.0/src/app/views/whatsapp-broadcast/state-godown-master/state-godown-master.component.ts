import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { staticValues } from "../../../shared/common-service/common-service";
import { GodownMaster, StateMaster, stateGodownMaster, CountryStateCityMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-state-godown-master',
  templateUrl: './state-godown-master.component.html',
  styleUrls: ['./state-godown-master.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, PermissionService],


})
export class StateGodownMasterComponent implements OnInit {

  zone_type: any = staticValues.zone_type;
  addForm: FormGroup;
  data: any = [];
  public filterQuery = '';
  public filterQuery2 = '';
  filterArray = [];
  filterArray2 = [];
  isLoading = false;
  mode = 'Add';
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
  stateList = [];
  godownList = [];
  state_zone_add: boolean;
  state_id: any;
  zone_id: any;
  stateName: any;


  constructor(private fb: FormBuilder,
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
      godown_id: new FormControl(null, Validators.required),
      state_id: new FormControl(null, Validators.required),

    });
  }


  ngOnInit() {

    this.getState();
    this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(res => {

      this.godownList = res;
    })
    this.getData();
  }


  getState() {
    this.crudServices.getOne<any>(CountryStateCityMaster.getStates, { country_id: 101 }).subscribe(res => {
      res.data.map(data => {
        data.zone = '';
        if (data.zone_id != 0) {
          let zone = this.zone_type.find(item => item.id == data.zone_id)
          if (zone != undefined && zone) {
            data.zone = zone.name;
          }

        }
        // return res;

      })
      this.stateList = res.data;
    })
  }
  getData() {
    this.mode = 'Add';
    this.id = 0;
    // this.isLoading = true;
    this.crudServices.getAll<any>(stateGodownMaster.getAll).subscribe(res => {
      res.map(item => {

        item.godown = item.godown.godown_name;
        item.state = item.state_master.name;
        return item
      })

      this.data = res;

      // this.isLoading = false;
    });
  }

  onSubmit() {
    if (this.addForm.invalid) {
      return;
    }

    if (this.id) {
      this.crudServices.updateData<any>(stateGodownMaster.update, {
        godown_id: this.addForm.value.godown_id,
        state_id: this.addForm.value.state_id,
        id: this.id
      }).subscribe(res => {
        if (res.code == '100') {
          this.toasterService.pop(res.message, 'Success', res.data);
          this.addForm.reset();
          this.getData();
        } else {
          this.toasterService.pop('error', 'error', 'Somethimg Went wrong');
        }
      });
    } else {
      this.crudServices.addData<any>(stateGodownMaster.add, {
        godown_id: this.addForm.value.godown_id,
        state_id: this.addForm.value.state_id,
      }).subscribe(res => {
        if (res.code == '100') {
          this.toasterService.pop(res.message, 'Success', res.data);
          this.addForm.reset();
          this.getData();
        } else {
          this.toasterService.pop('error', 'error', 'Somethimg Went wrong');
        }

      });
    }
  }

  onEdit(item) {
    this.mode = 'Edit';
    if (item.id != null) {
      this.id = item.id;
      this.addForm.patchValue({
        godown_id: item.godown_id,
        state_id: item.state_id
      });
    }
  }

  onDelete(id: number) {
    if (id) {
      this.crudServices.deleteData<any>(stateGodownMaster.delete, {
        id: id
      }).subscribe((res) => {
        this.getData();
        this.toasterService.pop(res.message, 'Success', res.data);
      });
    }


  }

  onAddZone(item) {
    this.state_zone_add = true;
    this.stateName = item.name;
    this.state_id = item.id;
    this.zone_id = item.zone_id
  }

  hide() {
    this.state_zone_add = false;
    this.state_id = '';
    this.zone_id = '';
    this.stateName = '';
  }

  updateZone() {

    this.crudServices.updateData<any>(StateMaster.update, { data: { zone_id: this.zone_id }, id: this.state_id }).subscribe(res => {
      this.toasterService.pop(res.message, 'Success', res.data);
      this.getState();
      this.hide();
    })
  }




}
