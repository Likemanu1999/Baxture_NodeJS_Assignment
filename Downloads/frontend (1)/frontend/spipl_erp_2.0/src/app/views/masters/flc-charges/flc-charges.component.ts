import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { flcCharges } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { Params, ActivatedRoute, Router } from "@angular/router";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from "../../login/UserDetails.model";
import { DatePipe } from '@angular/common';
import { ToasterConfig, ToasterService } from 'angular2-toaster';



@Component({
  selector: 'app-flc-charges',
  templateUrl: './flc-charges.component.html',
  styleUrls: ['./flc-charges.component.scss'],
  providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService],
  encapsulation: ViewEncapsulation.None,
})
export class FlcChargesComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;
  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;

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

  flcChargesList: any = [];
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
      { field: 'edit', header: 'Edit' },
      // { field: 'lc_open_first_qtr', header: 'First Qtr (%)' },
      // { field: 'lc_open_after_qtr_per_month', header: 'After Qtr Per Month (%)' },
      // { field: 'lc_open_per_annum', header: 'Per Annum (%)' },
      // { field: 'lc_open_concession', header: 'Concession on LC Open (%)' },
      // { field: 'lc_open_concession_exceed', header: 'Concession Exceed (%)' },
      // { field: 'lc_open_at_sight_bob_first_qtr', header: 'At Sight First Qtr (%)' },
      // { field: 'lc_open_at_sight_bob_after_qtr_per_month', header: 'At Sight After Qtr Per Month(%)' },
      // { field: 'lc_ammend_clause', header: 'Ammendment Charges On  Clause (Flat)' },
      // { field: 'lc_cancellation', header: 'LC Cancellation (Flat)' },
      // { field: 'remitance', header: 'Payment Remittance (Flat)' },
      // { field: 'nonlc_remittance', header: 'NONLC Payment Remittance (%)' },
      // { field: 'nonlc_remittance_min_value', header: 'NONLC Payment Remittance MIN (Flat)' },
      // { field: 'nonlc_remittance_max_value', header: 'NONLC Payment Remittance MAX (Flat)' },
      // { field: 'supplier_remit_percentage', header: 'Supplier Remittance (%)' },
      // { field: 'supplier_remit_min', header: 'Supplier Remittance Min (Flat)' },
      // { field: 'supplier_remit_max', header: 'Supplier Remittance MAX (Flat)' },
      // { field: 'lc_open_swift', header: 'LC Open Swift (Flat)' },
      // { field: 'lc_ammend_swift', header: 'LC Ammend Swift (Flat)' },
      // { field: 'remittance_swift', header: 'Payment Remittance Swift (Flat)' },
      // { field: 'supplier_usance_swift', header: 'Supplier Usance Swift (Flat)' },
      // { field: 'nonlc_remittance_swift', header: 'NONLC Remittance Swift (Flat)' },
      // { field: 'confirmation_swift', header: 'Confirmation  Swift (Flat)' },
      // { field: 'roll_over_interest_swift', header: 'Roll Over Interest Swift (Flat)' },
      // { field: 'roll_over_remittance_swift', header: 'Roll Over Remittance Swift (Flat)' },
      // { field: 'discrepancy', header: 'Discrepancy' },
      // { field: 'sblc', header: 'SBLC' },
      // { field: 'lou', header: 'LOU' },
      // { field: 'tt', header: 'TT' },
      // { field: 'forward_booking', header: 'Forward Booking' },

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

    this.getFlcData();
  }


  getFlcData() {

    this.CrudServices.getOne<any>(flcCharges.getAll, { fromFromDate: this.fromFromDate, fromToDate: this.fromToDate, toFromDate: this.toFromDate, toToDate: this.toToDate }).subscribe((response) => {
      if (response.code === "101") {
        this.toasterService.pop(response.message, response.message, response.data);
        this.isLoading = false;
        this.flcChargesList = [];
      } else {
        this.isLoading = false;
        // this.flcChargesList = response;
        this.flcChargesList = [];
        for (let item, i = 0; item = response[i++];) {
          const bank = item.spipl_bank.bank_name;
          item.bank_name = bank;
          this.flcChargesList.push(item);

          if (!(bank in this.lookup_bank)) {
            this.lookup_bank[bank] = 1;
            this.banks.push({ 'bank_name': bank });
          }
        }
      }
    });
  }
  getDetailsCharges(flcCharges) {
    this.chargesGgetOne = flcCharges;
    this.myModal.show();

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

  // head filter for fromdate - todate called at start
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
    this.getFlcData();

  }

  addFlcCharges() {
    this.router.navigate(["/masters/add-edit-flc-charges"]);
  }

  onEdit(id) {

    this.router.navigate(["/masters/edit-flc-charges", id]);
  }

}
