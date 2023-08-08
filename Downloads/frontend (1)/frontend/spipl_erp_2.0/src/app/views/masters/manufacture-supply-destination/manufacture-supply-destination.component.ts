import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryStateCityMaster, MainOrg, manufactureSupplyStation } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-manufacture-supply-destination',
  templateUrl: './manufacture-supply-destination.component.html',
  styleUrls: ['./manufacture-supply-destination.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, PermissionService],
})
export class ManufactureSupplyDestinationComponent implements OnInit {
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
  private toasterService: ToasterService;
  manuSupplyStationForm: FormGroup;

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  sub_org = [];
  data = [];
  public filterQuery = '';
  filterArray = [];
  isLoading: boolean;
  id: any;
  petroChemicalManufature = [];
  allIndiaCities = [];

  constructor(private fb: FormBuilder,
    private CrudServices: CrudServices,
    toasterService: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
  ) {

    this.toasterService = toasterService;

    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];

    this.CrudServices.getRequest<any>(MainOrg.getAllPetrochemicalManutacture).subscribe((response) => {
      this.petroChemicalManufature = response.data;
    });

    this.CrudServices.getRequest<any>(CountryStateCityMaster.getAllIndiaCity).subscribe((response) => {
      this.allIndiaCities = response.data;
    });



  }

  ngOnInit() {

    this.manuSupplyStationForm = new FormGroup({
      org_id: new FormControl(null, Validators.required),
      city_id: new FormControl(null, Validators.required)
    });

    this.getData();

  }

  getData() {
    this.isLoading = true;
    this.CrudServices.getAll<any>(manufactureSupplyStation.getAll).subscribe((response) => {
      this.isLoading = false;
      if (response) {

        response.map(item => {
          item.org_name = item.main_org_master.org_name;
          item.city_name = item.city_master.name;
          item.org_id = item.manu_org_id;
          item.state_name = item.city_master.state_master.name;
        })

        this.data = response
      }


    });

  }

  onSubmit() {

    const data = {
      org_id: this.manuSupplyStationForm.value.org_id,
      city_id: this.manuSupplyStationForm.value.city_id
    }


    if (this.id != undefined && this.id != null && this.id > 0) {
      data["id"] = this.id;
      this.CrudServices.updateData<any>(manufactureSupplyStation.updateData, data).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.manuSupplyStationForm.reset();
        this.id = null;
        this.getData();
      });
    } else {
      this.CrudServices.addData<any>(manufactureSupplyStation.addData, data).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.manuSupplyStationForm.reset();
        this.getData();
      });
    }





  }

  onEdit(item) {
    let obj = {};
    this.id = item.id
    for (let key in item) {
      obj[key] = item[key];
      this.manuSupplyStationForm.patchValue(obj);
    }

  }

  onDelete(id) {
    this.CrudServices.deleteData<any>(manufactureSupplyStation.delete, { id: id }).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      this.getData();
    });

  }

}
