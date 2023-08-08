import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { Table } from 'primeng/table';
import { currencyConvert } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
  selector: 'app-currency-convert',
  templateUrl: './currency-convert.component.html',
  styleUrls: ['./currency-convert.component.scss'],
  providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService],
  encapsulation: ViewEncapsulation.None,
})



export class CurrencyConvertComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;

  cols: { field: string; header: string; }[];
  isLoading: boolean = true;
  chargesGgetOne: any;

  mode: string;
  editmode: boolean = false;

  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  add_flc_charges: boolean = false;
  edit_flc_charges: boolean = false;
  view_flc_charges: boolean = false;
  user: UserDetails;
  links: any = [];
  lookup_bank = {};
  banks = [];
  _selectedColumns: any[];

  fromFromDate: any;
  fromToDate: any;
  toFromDate: any;
  toToDate: any;
  bsRangeValue: Date[];
  bsRangeValue2: Date[];
  currentYear: number;
  date = new Date();
  flag1: string;
  flag2: string;
  public toasterconfig: ToasterConfig = new ToasterConfig({
    tapToDismiss: true,
    timeout: 5000,
  });

  currencyConvertList: any = [];

  constructor(private CrudServices: CrudServices,
    private router: Router,
    private permissionService: PermissionService,
    private loginService: LoginService,
    public datepipe: DatePipe,
    private toasterService: ToasterService,) {
    this.cols = [
      // { field: 'id', header: 'id' },
      { field: 'bank_name', header: 'Bank Name' },
      { field: 'from_date', header: 'From Date' },
      { field: 'to_date', header: 'To date' },

      { field: 'amt_range_from', header: 'Amount Range From' },
      { field: 'amt_range_to', header: 'Amount Range To' },
      { field: 'variable_charges', header: 'Variable Charges' },
      { field: 'min_charges', header: 'Min Charges' },
      { field: 'max_charges', header: 'Max Charges' },
      { field: 'edit', header: 'Edit' },
    ];


    this._selectedColumns = this.cols;

    this.mode = "Add New";
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];

    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.add_flc_charges = this.links.indexOf("add flc charges") > -1;
    this.edit_flc_charges = this.links.indexOf("edit flc charges") > -1;
    this.view_flc_charges = this.links.indexOf("view flc charges") > -1;

    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    this.bsRangeValue = [];
    this.bsRangeValue2 = [];


    this.fromFromDate = this.bsRangeValue[0];
    this.fromToDate = this.bsRangeValue[1];

    this.toFromDate = this.bsRangeValue2[0];
    this.toToDate = this.bsRangeValue2[1];


  }

  ngOnInit() {
    this.isLoading = true;

    this.getCurrencyConvertData();
  }

  getCurrencyConvertData() {
    this.CrudServices.getOne<any>(currencyConvert.getAll, { fromFromDate: this.fromFromDate, fromToDate: this.fromToDate, toFromDate: this.toFromDate, toToDate: this.toToDate }).subscribe((response) => {
      if (response.code === "101") {
        this.toasterService.pop(response.message, response.message, response.data);
        this.isLoading = false;
        this.currencyConvertList = [];
      } else {
        this.isLoading = false;
        //this.currencyConvertList = response;
        this.currencyConvertList = [];

        for (let item, i = 0; item = response[i++];) {
          const bank = item.spipl_bank.bank_name;
          item.bank_name = bank;
          this.currencyConvertList.push(item);

          if (!(bank in this.lookup_bank)) {
            this.lookup_bank[bank] = 1;
            this.banks.push({ 'bank_name': bank });
          }
        }
      }
    });
  }

  onSelect($e, state) {

    if ($e) {
      if (state === '1') {
        this.flag1 = '1';
        this.fromFromDate = $e[0];
        this.fromToDate = $e[1];
      }
      if (state === '2') {
        this.flag2 = '2';
        this.toFromDate = $e[0];
        this.toToDate = $e[1];
      }

    }
    this.getCurrencyConvertData();

  }

  getColumnPresent(name) {

    if (this._selectedColumns.find(ob => ob['field'] === name)) {
      return true;
    } else {
      return false;
    }
  }

  // multiselect filter
  onchange(event, name) {
    const arr = [];
    if (event.value.length > 0) {
      for (let i = 0; i < event.value.length; i++) {
        arr.push(event.value[i][name]);
      }
      this.table.filter(arr, name, 'in');

    } else {
      this.table.filter('', name, 'in');
    }
  }

  onFilter(event, dt) {
  }

  addCurrencyConvert() {
    this.router.navigate(["/masters/add-edit-currency-conversion"]);
  }

  onEdit(id) {

    this.router.navigate(["/masters/edit-currency-conversion", id]);
  }
}
