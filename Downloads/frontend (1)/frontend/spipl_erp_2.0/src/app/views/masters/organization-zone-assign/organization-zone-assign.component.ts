import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { MatTabGroup } from '@angular/material/tabs';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { StaffMemberMaster, SubOrg } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';

@Component({
  selector: 'app-organization-zone-assign',
  templateUrl: './organization-zone-assign.component.html',
  styleUrls: ['./organization-zone-assign.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PermissionService,
    ExportService,
    CrudServices,
    LoginService,
    ToasterService
  ]
})
export class OrganizationZoneAssignComponent implements OnInit {
  staff = [];
  zone: any;
  party: any;
  cols: { field: string; header: string; }[];
  searchResult = [];
  partyList = [];
  isLoading: boolean;

  user: UserDetails;
  links: string[] = [];
  edit_opt: boolean = false;
  view_opt: boolean = false;
  role_id: any = null;
  company_id: any = null;
  selectedTabIndex: number;
  private toasterService: ToasterService;

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  show_both_company: boolean;


  constructor(
    private permissionService: PermissionService,
    private router: Router,
    private crudService: CrudServices,
    private exportService: ExportService,
    private loginService: LoginService,
    toasterService: ToasterService,
  ) {
    this.toasterService = toasterService;
    const perms = this.permissionService.getPermission();
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    // this.add_sub_org = (this.links.indexOf('add sub org') > -1);
    // this.show_both_company = (this.links.indexOf('org both company list') > -1);
    // this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];


    this.company_id = this.user.userDet[0].company_id;
    this.role_id = this.user.userDet[0].role_id;
    this.show_both_company = (this.links.indexOf('Company filter org zone list') > -1);


    this.cols = [
      { field: 'sub_org_name', header: 'Buyer Name' },
      { field: 'org_address', header: 'Address' },
      { field: 'zone_name', header: 'Zone' },

    ];







  }


  ngOnInit() {
    this.selectedTabIndex = this.company_id == 1 ? 0 : 1;
    this.getZone();
  }
  getZone() {
    this.crudService.getAll<any>(StaffMemberMaster.getAll).subscribe((response) => {
      response.data.map(data => data.first_name = `${data.first_name} ${data.last_name}`);
      this.staff = response.data.filter(data => data.company_id == this.company_id && data.active_status == 1 && (data.role_id == 5 || data.role_id == 33 || data.role_id == 34));
    });
  }

  getParty() {
    this.isLoading = true;
    let body = {
      category_id: 11,
      org_unit: Number(1)
    }

    if (this.zone) {
      body['sales_acc_holder'] = this.zone
    }

    this.crudService.getOne<any>(SubOrg.getSubOrgByCategory, body).subscribe((response) => {
      this.isLoading = false
      if (response) {
        this.searchResult = response.map(customer => {
          customer.sub_org_name = `${customer.sub_org_name} -(${customer.location_vilage ? customer.location_vilage : ''})`;
          customer.zone_name = `${customer.salesAccHolder.first_name} ${customer.salesAccHolder.last_name}`
          return customer;
        });
      }
    });
  }

  onClear() {
    this.searchResult = [];
    this.zone = [];

  }

  onChangtab(event) {
    const tab = event.tab.textLabel;
    this.onClear()

    if (tab == 'PVC') {
      this.company_id = 1
      this.getZone();
    }
    if (tab == 'PE & PP') {
      this.company_id = 2
      this.getZone();
    }

  }

  updateOrganization(event, id) {
    if (event.target.value) {
      this.crudService.updateData<any>(SubOrg.updateOrg, { sub_org_id: id, sales_acc_holder: event.target.value }).subscribe(response => {
        if (response) {

          // this.toasterService.pop('success' , 'success' , 'Data Updated')

          this.toasterService.pop(response.message, response.message, response.data)
          this.getParty();
        }
      })

    }

  }

  exportExcel() {
    let exportData = [];
    this.searchResult.forEach(element => {
      let data = {
        'Buyer': element.sub_org_name,
        'Buyer Address': element.org_address,
        'Zone': element.zone_name,
      };
      exportData.push(data);
    });
    this.exportService.exportExcel(exportData, 'Buyers Zone List');
  }




}
