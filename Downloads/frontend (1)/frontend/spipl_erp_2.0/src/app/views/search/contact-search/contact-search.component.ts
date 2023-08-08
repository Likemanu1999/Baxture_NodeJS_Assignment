import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SearchService, SearchResultList } from '../search-service';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { Search } from '../../../shared/apis-path/apis-path';
@Component({
  selector: 'app-contact-search',
  templateUrl: './contact-search.component.html',
  styleUrls: ['./contact-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [SearchService, PermissionService, LoginService, ExportService, CrudServices]
})
export class ContactSearchComponent implements OnInit {
  isLoading: boolean = false;
  search_str: string = '';
  searchResult: SearchResultList;
  exportColumns: any[];
  cols: any[];
  inputCss: string;
  @ViewChild('dt', { static: false }) table: Table;
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  constructor(
    private search: SearchService, private router: Router,
    private permissionService: PermissionService, private loginService: LoginService,
    private exportService: ExportService, private crudServices: CrudServices) {
    /**
     * Using Permission service to get current URL's permission for user who is logged in.
     */
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
  }
  /**
   * Initialization of columns  to display & map cols for export with pdf.
   */
  ngOnInit() {
    this.cols = [
      { field: 'person_name', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'contact_no', header: 'Contact No' },
      { field: 'sub_org_name', header: 'Organization' },
      { field: 'org_address', header: 'Address' },
    ];
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
  }
  /**
   * On enter key or search button click events this function gets called and take search term from two way binding (search_str) string will send to server for searching records and return response which assign to searchResult.
   */
  searchData() {
    if (this.search_str.trim().length > 0) {
      this.inputCss = '';
      this.isLoading = true;
      this.crudServices.getOne<any>(Search.getAllContact, { search_str: this.search_str }).subscribe((response: SearchResultList) => {
        this.isLoading = false;

        this.searchResult = response['data'];

      });
    } else {
      this.inputCss = 'Red';
    }
  }
  /**
   * This function is used to export data in pdf. It takes columns  to export from json and JSON array of objects with filename.
   */
  exportPdf() {
    this.exportService.exportPdf(this.exportColumns, this.searchResult, 'contactlist');
  }
  /**
   * This function is used to export data in excel. It takes JSON array of objects with filename.
   */
  exportExcel() {
    this.exportService.exportExcel(this.searchResult, 'contactlist');
  }
  /**
   * This function is used to navigate to oganizations detail profile page on click on name of org in list.
   */
  details(sub_org_id) {
    if (sub_org_id != null) {
      this.router.navigate(['masters/sub-org-detail', sub_org_id]);
    }
  }

}
