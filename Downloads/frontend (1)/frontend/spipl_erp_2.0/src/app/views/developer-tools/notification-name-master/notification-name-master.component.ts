import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationsNameMaster, RoleMaster } from "../../../shared/apis-path/apis-path";
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';

import { CrudServices } from "../../../shared/crud-services/crud-services";
import { LoginService } from '../../login/login.service';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Subscription } from 'rxjs';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
  selector: 'app-notification-name-master',
  templateUrl: './notification-name-master.component.html',
  styleUrls: ['./notification-name-master.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [CrudServices, ToasterService, LoginService, PermissionService],
})
export class NotificationNameMasterComponent implements OnInit {
  data: any = [];
  notificationNameForm: FormGroup;
  submitted = false;

  error: any;
  public filterQuery = '';
  filterArray = ['notification_name'];
  isLoading = false;
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
  user: UserDetails;
  notificationNameList: any;
  constructor(private fb: FormBuilder,
    private crudServices: CrudServices,
    toasterService: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private permissionService: PermissionService) {
    this.user = this.loginService.getUserDetails();
  }

  ngOnInit() {
    this.initForm()
    this.getAllName()
  }
  getAllName() {
    this.crudServices.getAll(NotificationsNameMaster.getAll).subscribe(data => {
      this.notificationNameList = data['data']
    })
  }

  onSubmit() {
    this.isLoading = true
    if (this.notificationNameForm.valid) {
      let body = this.notificationNameForm.value;
      body['added_by'] = this.user.userDet[0].id
      body['added_date'] = new Date();
      this.crudServices.addData(NotificationsNameMaster.add, { data: body }).subscribe(data => {
        this.getAllName()
        this.notificationNameForm.reset();
        this.isLoading = false;
      })
    }
  }


  initForm() {
    this.notificationNameForm = this.fb.group({
      notification_name: ['', [Validators.required]],
    });
  }

  onReset() {

  }

  get f() { return this.notificationNameForm.controls; }

}
