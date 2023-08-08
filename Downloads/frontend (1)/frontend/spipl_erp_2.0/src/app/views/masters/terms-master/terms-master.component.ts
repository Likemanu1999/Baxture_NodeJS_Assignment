import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { CommonApis, MaterialLoadPortMaster, termMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-terms-master',
  templateUrl: './terms-master.component.html',
  styleUrls: ['./terms-master.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToasterService, PermissionService, CrudServices]
})
export class TermsMasterComponent implements OnInit {
  termForm: FormGroup;

  // public data: OrgCategoryDataList;
  public filterQuery = '';
  filterArray = [];
  isLoading = false;
  private toasterService: ToasterService;
  id: number;
  term_name: string;
  company_id: string;
  termData: any = [];
  company: any = [];

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
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
    private crudServices: CrudServices,
    toasterService: ToasterService,) {
    this.toasterService = toasterService;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];

    this.crudServices.getAll<any>(CommonApis.getCompanies).subscribe(response => {
      this.company = response.data;
    });
  }

  ngOnInit() {
    this.termForm = this.fb.group({
      term_name: [null, Validators.required],
      company_id: [null, Validators.required]
    });

    this.getAllData();
  }

  getAllData() {
    this.isLoading = true;
    this.crudServices.getAll<any>(termMaster.getAllData).subscribe(response => {
      this.termData = response.data;
      this.termData.map(item => {
        if (item.company_id == 1) {
          item.company_name = 'PVC';
        } else if (item.company_id == 2) {
          item.company_name = 'PE & PP'
        }
        else if (item.company_id == 3) {
          item.company_name = 'Surisha'
        }
      });
      this.isLoading = false;
    });
  }

  onSubmit() {
    if (this.id !== undefined && this.id !== 0 && this.id !== null) {
      this.crudServices.updateData<any>(termMaster.update, {
        id: this.id,
        term: this.termForm.value.term_name,
        company_id: this.termForm.value.company_id
      }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.onReset();
        this.termForm.reset();
        this.getAllData();
      });

    } else {
      this.crudServices.addData<any>(termMaster.add, {
        term: this.termForm.value.term_name,
        company_id: this.termForm.value.company_id
      }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.onReset();
        this.termForm.reset()
        this.getAllData();
      });
    }
  }

  onEdit(id) {
    this.id = id;
    this.crudServices.getOne<any>(termMaster.getOne, {
      id: id
    }).subscribe(res => {
      this.termForm.patchValue({
        term_name: res.data[0].term,
        company_id: res.data[0].company_id,
      });
    });
  }

  onReset() {
    this.id = 0;
    this.term_name = '';
    this.company_id = '';
  }

  onDelete(id, index) {
    if (id) {
      this.crudServices.deleteData<any>(termMaster.delete, {
        id: id
      }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.termData.splice(index, 1);
        this.getAllData();
      });
    }
  }

}
