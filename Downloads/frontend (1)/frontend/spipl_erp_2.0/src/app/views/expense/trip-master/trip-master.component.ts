import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { TripMaster } from '../../../shared/apis-path/apis-path';

@Component({
  selector: 'app-trip-master',
  templateUrl: './trip-master.component.html',
  styleUrls: ['./trip-master.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToasterService, PermissionService, CrudServices]
})
export class TripMasterComponent implements OnInit, OnDestroy {
  isLoading = false;
  error: any;
  public filterQuery = '';
  filterArray = ['trip_name', 'sub_org_name'];
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
  id: number;

  subscription: Subscription;
  private toasterService: ToasterService;
  public data: any[];
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });

  constructor(
    toasterService: ToasterService,
    private router: Router,
    private permissionService: PermissionService,
    private crudServices: CrudServices) {
    this.toasterService = toasterService;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.getTripList();
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getTripList() {
    this.isLoading = true;


    this.subscription = this.crudServices.getAll<any>(TripMaster.getAll).subscribe((response) => {
      this.data = response.data;
      this.isLoading = false;
    });
  }

  getStatus(status: number) {
    let status_ = '';

    if (status === 0) {
      status_ = 'Pending';
    } else if (status === 1) {
      status_ = 'Completed';
    } else if (status === 2) {
      status_ = 'Cancelled';
    }
    return status_;
  }
  onDelete(id: number) {
    if (id) {

      this.crudServices.deleteData<any>(TripMaster.delete, { id: id }).subscribe((response) => {
        // this.deleteRow(id);
        this.getTripList();
        this.toasterService.pop(response.message, 'Success', response.data);
      });
    }
  }

  onAdd() {
    this.router.navigate(['expense/add-trip']);
  }
  onEdit(id) {
    if (id != null) {
      this.router.navigate(['expense/add-trip', id]);
    }
  }

  onDetailView(id) {
    if (id != null) {
      this.router.navigate(['expense/trip-details', id]);
    }
  }

}
