import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DepartmentMaster, Notifications, NotificationsNameMaster, NotificationsUserRel } from '../../../shared/apis-path/apis-path';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';

import { CrudServices } from '../../../shared/crud-services/crud-services';
import { LoginService } from '../../login/login.service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [PermissionService, ToasterService, CrudServices, LoginService]
})
export class NotificationComponent implements OnInit {
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
  isLoading: boolean = false;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  notificationForm: FormGroup;
  data = [];
  action_data = [{ label: 'ADD', value: 'ADD' }, { label: 'EDIT', value: 'EDIT' }, { label: 'DELETE', value: 'DELETE' }];
  department_data = [];
  notifications: any;
  user: UserDetails;
  notificationNameList: any;
  public filterQuery = '';
  filterArray = ['title'];
  constructor(private permissionService: PermissionService, private loginService: LoginService, private toasterService: ToasterService, private crudServices: CrudServices) {
    this.user = this.loginService.getUserDetails();
  }

  ngOnInit() {
    this.createForm()
    this.getAllNotifications()
    this.getAllDepartment();
    this.getAllNotificationName();
  }

  getAllNotificationName() {
    this.crudServices.getAll(NotificationsNameMaster.getAll).subscribe(data => {
      this.notificationNameList = data['data'];
    })
  }

  getAllDepartment() {
    this.crudServices.getAll(DepartmentMaster.getAll).subscribe(department => {
      this.department_data = department['data'];
    })
  }


  getAllNotifications() {
    this.crudServices.getAll(Notifications.getAll).subscribe(notifications => {
      this.notifications = notifications['data'];
    })
  }

  createForm() {
    this.notificationForm = new FormGroup({
      'title': new FormControl(null, Validators.required),
      'message': new FormControl(null, Validators.required),
      'action': new FormControl(null, Validators.required),
      'department_id': new FormControl(null, Validators.required),
      'notification_name_id': new FormControl(null, Validators.required),
    })
  }

  onSubmit() {
    let body = this.notificationForm.value;
    body['added_by'] = this.user.userDet[0].id
    body['added_date'] = new Date();
    if (this.notificationForm.valid) {
      this.crudServices.addData(Notifications.add, { data: body }).subscribe(data => {
        this.getAllNotifications()
        this.notificationForm.reset();
      })
    }
  }
  onReset() {

  }
}
