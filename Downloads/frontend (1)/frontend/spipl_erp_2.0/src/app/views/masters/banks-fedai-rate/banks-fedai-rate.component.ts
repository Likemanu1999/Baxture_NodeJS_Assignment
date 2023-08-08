import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { DatePipe } from '@angular/common';
import { BanksFedaiRate, SpiplBankMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-banks-fedai-rate',
  templateUrl: './banks-fedai-rate.component.html',
  styleUrls: ['./banks-fedai-rate.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, PermissionService, DatePipe],
})
export class BanksFedaiRateComponent implements OnInit {

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
  fedaiRateForm: FormGroup;

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  banks_arr = [];
  data = [];
  public filterQuery = '';
  filterArray = [];
  isLoading: boolean;
  id: any;

  constructor(private fb: FormBuilder,
    private crudServices: CrudServices,
    toasterService: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
    private datePipe: DatePipe) {
    this.toasterService = toasterService;

    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];

    this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe(response => {
      this.banks_arr = response;
    });

  }

  ngOnInit() {
    this.fedaiRateForm = new FormGroup({
      banks_fedai_date: new FormControl(null, Validators.required),
      bank_id: new FormControl(null, Validators.required),
      rate: new FormControl(null, Validators.required)
    });

    this.getData();

  }


  getData() {
    this.isLoading = true;
    this.crudServices.getAll<any>(BanksFedaiRate.getAll).subscribe((response) => {
      this.isLoading = false;
      if (response) {
        this.data = response;
      }

    });

  }


  onSubmit() {

    const data = {
      bank_id: this.fedaiRateForm.value.bank_id,
      banks_fedai_date: this.datePipe.transform(this.fedaiRateForm.value.banks_fedai_date, 'yyyy-MM-dd'),
      rate: this.fedaiRateForm.value.rate

    }

    if (this.id != undefined && this.id != null && this.id > 0) {
      data["id"] = this.id
      this.crudServices.updateData<any>(BanksFedaiRate.update, data).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.fedaiRateForm.reset();
        this.id = null;
        this.getData();
      });
    } else {
      this.crudServices.addData<any>(BanksFedaiRate.add, data).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.fedaiRateForm.reset();
        this.getData();
      });
    }


  }

  onEdit(item) {
    let obj = {};
    this.id = item.id
    for (let key in item) {
      obj[key] = item[key];
      if (key == 'banks_fedai_date') {
        obj[key] = item[key] != null ? this.datePipe.transform(item[key], 'dd-MM-yyyy') : '';
        this.fedaiRateForm.patchValue(obj);
      } else {
        this.fedaiRateForm.patchValue(obj);
      }
    }

  }

  onDelete(id) {
    this.crudServices.deleteData<any>(BanksFedaiRate.delete, { id: id }).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      this.getData();
    });

  }


}
