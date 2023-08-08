import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';

import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { MatTabGroup } from '@angular/material/tabs';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';

import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { CountryStateCityMaster, OrganizationCategory, ProductMaster, productsTagsMaster, Search, StaffMemberMaster } from '../../../shared/apis-path/apis-path';
@Component({
  selector: 'app-org-details-search',
  templateUrl: './org-details-search.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./org-details-search.component.scss'],
  providers: [

    PermissionService,
    ExportService,
    CrudServices
  ]
})
export class OrgDetailsSearchComponent implements OnInit {
  city: any[];
  country: any[];
  products: any[];
  categories: any[];
  product_tags: any[];
  states: any[];
  staff: any[];
  isCollapsed: boolean = false;
  country_id: string;
  state_id: string;
  city_id: string;
  sales_acc_holder: string;
  purchase_acc_holder: string;
  product_ids: string[];
  categories_ids: string[];
  product_tag_ids: string[];
  company_ids: string[];
  searchResult = [];
  contactDetails: any[];
  @ViewChild('dt', { static: false }) table: Table;
  @ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;
  isLoading: boolean = false;
  search_str: string = '';
  exportColumns: any[];
  cols: any[];
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  optradio: any = '0';
  filteredValuess: any;
  filteredcontactDetails: any;
  contactCols: any[];
  companyList: any = staticValues.company_list_new;
  contactExportColumns: { title: any; dataKey: any; }[];
  BulkNumber: any;
  BulkEmail: any;
  constructor(

    private permissionService: PermissionService,
    private router: Router,
    private crudService: CrudServices,
    private exportService: ExportService) { }
  /**
   * Getting data from server for filter dropdowns.
  Initialization of columns to display & map cols for export with pdf.
  */
  ngOnInit() {
    this.crudService.getAll<any>(CountryStateCityMaster.getAllCountries).subscribe((response) => {

      this.country = response.data;
    });
    this.crudService.getAll<any>(StaffMemberMaster.getAll).subscribe((response) => {
      this.staff = response.data.map(item => {
        item.first_name = item.first_name + ' ' + item.last_name
        return item
      })

      this.staff = this.staff.filter(item => item.active_status == 1)
    });

    this.crudService.getAll<any>(ProductMaster.getAll).subscribe((response) => {
      this.products = response;
    });


    this.crudService.getAll<any>(OrganizationCategory.getAll).subscribe((response) => {
      this.categories = response;
    });

    this.crudService.getAll<any>(productsTagsMaster.getAll).subscribe((response) => {
      this.product_tags = response;
    });


    // this.orgCategoryService.getCategories().subscribe((response: OrgCategoryDataList) => {
    //   this.categories = response;
    // });
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.cols = [
      { field: 'sub_org_id', header: 'Org No.' },
      { field: 'unitName', header: 'Unit' },
      { field: 'sub_org_name', header: 'Organization' },
      { field: 'iec', header: 'IEC No' },
      { field: 'pan_no', header: 'PAN No' },
      { field: 'gst_no', header: 'GST No' },
      { field: 'pin_code', header: 'PIN Code' },
      { field: 'countryName', header: 'Country' },
      { field: 'stateName', header: 'State' },
      { field: 'location_vilage', header: 'City' },
      { field: 'salesHolderName', header: 'Sales Holder' },
      { field: 'purchaseHolder', header: 'Purchase Holder' },
      { field: 'categories', header: 'Categories' },
      { field: 'product_tags', header: 'Product Tags' },
      { field: 'products', header: 'Products' },
      { field: 'org_address', header: 'Address' },
      { field: 'oeg_contacts', header: 'Org Contacts' }
    ];
    this.contactCols = [
      { field: 'cont_id', header: 'Cont. No.' },
      { field: 'sub_org_id_cont', header: 'Sub Org Id' },
      { field: 'sub_org_name', header: 'Organization Name' },
      { field: 'profile_name', header: 'Profile' },
      { field: 'person_name', header: 'Name' },
      { field: 'email', header: 'Emails' },
      { field: 'contNumber', header: 'Contacts No' }
    ];
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));

    this.contactExportColumns = this.contactCols.map(col => ({ title: col.header, dataKey: col.field }));
  }
  /**
   *
   To get states of perticular country calling this method onchange of country dropdown.
  */
  onCountryChange($event) {
    if ($event) {
      this.crudService.getOne<any>(CountryStateCityMaster.getStates, { country_id: $event.id }).subscribe((response) => {
        this.states = response.data;
      });
    }
  }
  /**
   *
   To get cities of perticular state calling this method onchange of state dropdown.
  */
  onStateChange($event) {
    if ($event) {
      this.crudService.getOne<any>(CountryStateCityMaster.getCities, { state_id: this.state_id }).subscribe((response) => {
        this.city = response.data;
      });

    }
  }
  /**
   * To clear selection of state dropdown.
   */
  onStateClear() {
    this.city = undefined;
  }
  /**
   * To clear selection of dropdown.
  */
  onClear(control_name) {
    this[control_name] = undefined;
  }
  /**
   *
   To clear selection of country dropdown.
  */
  onCountryClear() {
    this.states = undefined;
  }
  /**
   * We can use this method on card collapsed event.
   */
  collapsed(event: any): void {
    // 
  }
  /**
   * We can use this method on card expanded event.
  */
  expanded(event: any): void {
    // 
  }

  onSearch() {
    this.searchResult = [] // To display organization details.
    this.contactDetails = [] // To display contacts details.
    this.filteredcontactDetails = []
    this.filteredValuess = []
    this.BulkNumber = [] // for only numbers to be exported.
    this.BulkEmail = [] // for only emails to be exported.
    const data = {
      country_id: this.country_id,
      state_id: this.state_id,
      city_id: this.city_id,
      sales_acc_holder: this.sales_acc_holder,
      purchase_acc_holder: this.purchase_acc_holder,
      product_ids: this.product_ids,
      categories_ids: this.categories_ids,
      product_tag_ids: this.product_tag_ids,
      company_ids: this.company_ids,
      optradio: this.optradio,

    }

    if ((this.country_id === undefined || this.country_id === null)
      && (this.state_id === undefined || this.state_id === null)
      && (this.city_id === undefined || this.city_id === null)
      && (this.sales_acc_holder === undefined || this.sales_acc_holder === null)
      && (this.purchase_acc_holder === undefined || this.purchase_acc_holder === null)
      && (this.product_ids === undefined || this.product_ids === null)
      && (this.categories_ids === undefined || this.categories_ids === null)
      && (this.product_tag_ids === undefined || this.product_tag_ids === null)) {
      alert('Please Select Atleast one filter.');
    } else {
      this.isLoading = true;
      this.isCollapsed = true;
      this.crudService.getOne<any>(Search.detail_search, data).subscribe((response) => {

        this.isLoading = false;
        this.searchResult = response['OrgnisationDetails']; // To display organization details.
        this.contactDetails = response['ContactPersonDetails']; // To display contacts details.
        this.filteredcontactDetails = response['ContactPersonDetails'];
        this.filteredValuess = response['OrgnisationDetails'];
        this.BulkNumber = response['BulkNumber']; // for only numbers to be exported.
        this.BulkEmail = response['BulkEmail']; // for only emails to be exported.

      });
    }
  }
  /**
   *
   This function is used to export data in pdf. It takes columns  to export from json and JSON array of objects with filename.
  */
  exportPdf() {
    this.exportService.exportPdf(this.exportColumns, this.filteredValuess, 'contactlist');
  }
  /**
   *
   This function is used to export data in excel. It takes JSON array of objects with filename.
  */
  exportExcel() {
    const exportArray: any = [];
    const searchResultCopy = this.filteredValuess;
    searchResultCopy.forEach(element => {
      exportArray.push(element);
    });
    this.exportService.exportExcel(exportArray, 'Details');
  }
  /**
   *
   This function is used to navigate to oganizations detail profile page on click on name of org in list.
  */
  details(sub_org_id) {
    if (sub_org_id != null) {
      this.router.navigate(['masters/sub-org-detail', sub_org_id]);
    }
  }
  /**
*
This function is called when global search of table has text.
*/
  onFilter(event, dt) {
    this.filteredValuess = event.filteredValue;
  }
  /**
  *This function is called when global search of contact list table has text.
  */
  onContactFilter(event, dt) {
    this.filteredcontactDetails = event.filteredValue;
  }

  exportContactExcel() {


    const exportArray: any = [];
    const searchResultCopy = this.filteredcontactDetails;
    for (let i = 0; i < searchResultCopy.length; i++) {
      const obj = {};
      for (let j = 0; j < this.contactCols.length; j++) {

        obj[this.contactCols[j]["header"]] =
          searchResultCopy[i][this.contactCols[j]["field"]];

      }
      exportArray.push(obj);
      // delete element['cont_id'];
      // exportArray.push(element);
    };
    this.exportService.exportExcel(exportArray, 'Details');
  }
  onlyContactExcel() {
    const exportArray: any = [];

    for (let val of this.BulkNumber) {
      if (val.contactno) {
        exportArray.push(val);
      }

    };
    this.exportService.exportExcel(exportArray, 'contactnumberlist');
  }
  onlyEmailExcel() {
    const exportArray: any = [];
    for (let val of this.BulkEmail) {
      if (val.email) {
        exportArray.push(val);
      }

    };
    this.exportService.exportExcel(exportArray, 'emaillist');
  }
  exportContactPdf() {

    this.exportService.exportPdf(this.contactExportColumns, this.filteredcontactDetails, 'contact_list');
  }

}
