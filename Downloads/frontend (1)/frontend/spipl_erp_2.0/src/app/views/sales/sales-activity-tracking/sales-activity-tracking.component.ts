import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { MainSubOrgService } from '../../masters/sub-org-master/main-sub-org-service';
import { OrgBankService } from '../../masters/sub-org-master/sub-org-detail/org-bank-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { FileUpload, nonNegotiable, LetterOfCredit, LetterofCreditCrud, UsersNotification, Notifications, NotificationsUserRel, SalesActivityTracking } from '../../../shared/apis-path/apis-path';
import { MessagingService } from '../../../service/messaging.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ProformaInvoiceService } from '../../forex/proforma-invoice/proforma-invoice-service';
import { CreateLcService, CreateLcList } from '../../forex/lc-creation/create-lc-service';
import { NonServiceNewService } from '../../forex/lc-in-operation-new/non-service-new.service';
import * as moment from 'moment';
import { Table } from 'primeng/table';
import { MatTableDataSource } from '@angular/material/table';
import { staticValues } from '../../../shared/common-service/common-service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-sales-activity-tracking',
  templateUrl: './sales-activity-tracking.component.html',
  styleUrls: ['./sales-activity-tracking.component.scss'],
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    DatePipe,
    SpiplBankService,
    MainSubOrgService,
    ProformaInvoiceService,
    CreateLcService,
    OrgBankService,
    NonServiceNewService,
    MessagingService,
    CrudServices
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SalesActivityTrackingComponent implements OnInit {
  // dataSource = [];
  @ViewChild("dt1", { static: false }) table1: Table;
  @ViewChild("dt2", { static: false }) table2: Table;
  @ViewChild("dt3", { static: false }) table3: Table;
  @ViewChild("dt4", { static: false }) table4: Table;
  dataSource: MatTableDataSource<any>;
  dataSourceUnfiltered = [];
  columnsToDisplay = ['name'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: null;

  public filterQuery = '';
  public filterQuery_non = '';
  filterArray = [];
  filterArray_non = [];
  selected_date_range: any = [
    new Date(moment().startOf('months').format("YYYY-MM-DD")),
    new Date(moment().format("YYYY-MM-DD"))
  ];

  companyList: any = staticValues.company_list_new;
  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to Change?';
  public popoverMessageDelete: string = 'Are you sure, you want to Delete?';
  public popoverMessageDiscard: string = 'Are you sure, you want to Discard LC?';
  public popoverMessageCancel: string = 'Are you sure, you want to Cancel LC?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'left';
  public closeOnOutsideClick: boolean = true;
  public today = new Date();
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  isCollapsed: boolean = false;
  isLoading_unsold: boolean = false;
  serverUrl: string;
  user: UserDetails;
  isLoading = false;
  links: string[] = [];
  lc_list = [];

  // filter array
  spipl_bank = [];
  funding_bank_list = [];
  paymentTermListAmmend = [];
  sub_org = [];
  bsRangeValue: any = [];
  bsRangeValue2: any = [];
  gobalFilterText: any;
  ammendValueFlag: boolean = false;
  ammendDaysFlag: boolean = false;
  ammendClauseFlag: boolean = false;
  popUpConfirmationFlag: boolean = false;
  loadingBtn: boolean = false;

  // filter variables
  supplier = 0;
  bank = 0;
  fromCreatedDate: string;
  toCreatedDate: string;
  fromOpeningDate: string;
  toOpeningDate: string;



  // form
  addNonForm: FormGroup;
  addOpenLcForm: FormGroup;
  addLcammend: FormGroup;
  addLcinsurance: FormGroup;
  updateLcCancelStatus: FormGroup;
  reviseNonForm: FormGroup;


  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  supplier_name: any;
  bank_name: any;
  lc_date: any;
  date_of_shipment: any;
  lc_detail: CreateLcList;
  lc_pi: any[];
  lc_id: any;
  addNon: boolean = false;
  lc_opening_date: any;
  tot_lc_amount = 0;
  totquantity = 0;
  spipl_bank_id: any;

  supplier_id: any;
  reset_pi_list: any[];
  pi_id_list: number[] = [];
  checkedList: number[] = [];
  docs: Array<File> = [];
  ammenddocs: Array<File> = [];
  insurancedocs: File[];
  lcCancelDocs: File[];
  moda: any;
  bank_lc_no: any;
  lc_op_date: any;
  lc_rate: any;
  lc_insurance_date: any;
  lc_cancel_date: any;

  lc_ammed_date: any;
  ammend_shipment_date: any;
  ammend_lc_expiry_date: any;
  ammend_payment_term_id: any;
  expiry_date: any;
  openingdoc = [];
  isurancedoc = [];
  ammenddoc = [];
  lcCancellation = [];
  lc_ammed_remark: any;
  lc_ammed_db_value: any;
  lc_insurance_remark: any;
  lc_cancel_remark: any;

  mainDetail = false;
  nondoc: Array<File> = [];
  Non_details = [];
  selected: number;
  lc_remark: any;
  funding_bank: any;
  third_party_lc = 0;
  ammend_value = 0;
  ammend_days = 0;
  ammend_clause = 0;
  payment_term: number;
  tolerance: number;
  toleranceper: number = 0;

  // update non
  shipmentDate: string;
  invoiceDate: string;
  receivedDate: string;
  invoiceNo: string;
  remark: string;
  nonid: number;
  date: any;
  revisedoc: File[];
  non_id: number;
  rese_lc: boolean = false;
  open_lc: boolean = false;
  lc_amend: boolean = false;
  lc_insurance: boolean = false;
  create_non: boolean = false;
  edit_non: boolean = false;
  delete_non: boolean = false;
  revise_non: boolean = false;
  lc_download: boolean = false;

  currentYear: number;
  currdate = new Date();
  total_lc_quantity_supplier: number;
  total_lc_amount_supplier: number;

  lc_cancellation_date: string;
  lc_cancellation_remark: string;

  ammendDetails = [];

  editMode: boolean = false;

  ammend_charges_id: any;

  supplier_usance_charges: any;
  manufacture_name: any;

  funding_bank_name: any;

  notification_details: any;
  notification_tokens = [];
  notification_id_users = []
  notification_users = [];
  message: any;
  port_list: any;
  datePickerConfig: any = staticValues.datePickerConfigNew;
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();
  isRange: any;
  maxDate: Date = new Date();
  selected_company: { id: any; name: any; };
  filter: string[];
  finance_cols: { field: string; header: string; sort: boolean; filter: boolean; dropdown: any[]; footer: boolean; total: number; type: string; }[];
  dispatch_cols: { field: string; header: string; sort: boolean; filter: boolean; dropdown: any[]; footer: boolean; total: number; type: string; }[];
  cancel_cols: { field: string; header: string; sort: boolean; filter: boolean; dropdown: any[]; footer: boolean; total: number; type: string; }[];
  renewed_cols: { field: string; header: string; sort: boolean; filter: boolean; dropdown: any[]; footer: boolean; total: number; type: string; }[];
  dispatchPayments: any;
  extendedOrders: any;
  cancelOrders: any;
  financePlanning: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toasterService: ToasterService,
    private permissionService: PermissionService,
    private loginService: LoginService,
    public datepipe: DatePipe,
    private SpiplService: SpiplBankService,
    private subOrgService: MainSubOrgService,
    private piService: ProformaInvoiceService,
    private createLcService: CreateLcService,
    private nonServiceNew: NonServiceNewService,
    private BankService: OrgBankService,
    private CrudServices: CrudServices,
    private fb: FormBuilder,
    private messagingService: MessagingService,
    private crudServices: CrudServices,
  ) {

    this.serverUrl = environment.serverUrl;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.user = this.loginService.getUserDetails();
    this.links = this.user.links;
    this.rese_lc = (this.links.indexOf('reset lc') > -1);
    this.open_lc = (this.links.indexOf('open lc') > -1);
    this.lc_amend = (this.links.indexOf('lc amend') > -1);
    this.lc_insurance = (this.links.indexOf('lc insurance') > -1);
    this.create_non = (this.links.indexOf('create non') > -1);
    this.edit_non = (this.links.indexOf('edit non') > -1);
    this.delete_non = (this.links.indexOf('delete non') > -1);
    this.revise_non = (this.links.indexOf('revise non') > -1);
    this.lc_download = (this.links.indexOf('lc download') > -1);

    this.selected_company = staticValues.company_list_new.find(item => item.id == this.user.userDet[0].company_id);
  }



  ngOnInit() {
    this.getCols();
    this.dataSource = new MatTableDataSource([]);
  }

  getCols() {
    this.finance_cols = [
      { field: "id", header: "ID", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "plan_quantity", header: "Plan Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "nb", header: "N.B.", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "validity_date", header: "Validity Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "freight_rate", header: "Freight", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "company_id", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null }
    ];
    this.dispatch_cols = [
      { field: "invoice_no", header: "Invoice No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "virtual_acc_no", header: "Virtual Account No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "total_amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "received_amount", header: "Received Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "balance_amount", header: "Balance Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "payment_due_date", header: "Payment Due Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "payment_received_date", header: "Payment Received Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
      { field: "company_id", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
    ];
    this.cancel_cols = [
      { field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "import_local_flag", header: "Import/Local", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "freight_rate", header: "Freight", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "nb", header: "N.B.", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "cancel_quantity", header: "Knock-Off Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "cancel_date", header: "Cancelled Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "cancel_by_name", header: "Cancelled By", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "company_id", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
    ];
    this.renewed_cols = [
      { field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "import_local_flag", header: "Import/Local", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
      { field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "freight_rate", header: "Freight", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "nb", header: "N.B.", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
      { field: "extend_days", header: "Extended Days", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
      { field: "extend_date", header: "Extended Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "extend_by_name", header: "Extended By", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "renewed_date", header: "Renewed Date", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
      { field: "renewed_con_id", header: "Renewed SO ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
      { field: "renewed_by_name", header: "Renewed By", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
      { field: "company_id", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
      { field: "renewed_remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
    ];
    this.getData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  getCompany(company_id) {
    if (company_id == 1) {
      return "PVC";
    } else if (company_id == 2) {
      return "PE & PP";
    } else if (company_id == 3) {
      return "SURISHA";
    }
  }

  getImportLocal(import_local_flag) {
    if (import_local_flag == 1) {
      return 'Import';
    } else if (import_local_flag == 2) {
      return 'Local';
    }
  }

  getData() {
    this.isLoading = true;
    this.financePlanning = [];
    this.dispatchPayments = [];
    this.extendedOrders = [];
    this.cancelOrders = [];
    let condition = {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
    }

    this.crudServices.getOne<any>(SalesActivityTracking.getSalesActivityTracking, condition).subscribe(res => {
      this.isLoading = false;
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.dataSource = res.data;
          console.log(this.dataSource);

        }
      }
    });
  }

  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.selected_date_range = dateValue.range;
  }

  clearDropdown() {
    if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
      this.uploadSuccess.emit(false);
  }

  getPiForSupplier() {
    this.piService.getPiForSupplier(this.supplier)
      .subscribe(response => {
        console.log(response);
        this.total_lc_quantity_supplier = response.data.reduce((sum, item) => sum + item.pi_quantity, 0);
        this.total_lc_amount_supplier = response.data.reduce((sum, item) => sum + item.total_pi_amount, 0);
      });

  }

  convert(str) {
    if (str) {
      const date = new Date(str),
        mnth = ('0' + (date.getMonth() + 1)).slice(-2),
        day = ('0' + date.getDate()).slice(-2);
      return [date.getFullYear(), mnth, day].join('-');
    } else {
      return '';
    }
  }

  getDetails(id: number, element?: any) {

    this.isLoading = true;
    let condition = {
      from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
      to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
      so_id: id,
      renewed_con_id: null,
      extend_days: 0
    }
    this.crudServices.getOne<any>(SalesActivityTracking.getDispatchPayments, condition).subscribe(res => {
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.dispatchPayments = res.data;
        }
        this.isLoading = false;
      }
    });

    this.crudServices.getOne<any>(SalesActivityTracking.getExtendedOrders, condition).subscribe(res => {
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.extendedOrders = res.data;
        }
      }
    });

    this.crudServices.getOne<any>(SalesActivityTracking.getFinancePlanning, condition).subscribe(res => {
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.financePlanning = res.data;
        }
      }
    });
    this.crudServices.getOne<any>(SalesActivityTracking.getCancelOrders, condition).subscribe(res => {
      if (res.code == '100') {
        if (res.data.length > 0) {
          this.cancelOrders = res.data;
        }
      }
    });
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  isActive(item) {
    return this.selected === item;
  }


  onEditLc(id: number) {
    this.router.navigate(['forex/edit-lc/' + id]);
  }

  onDeleteLc(id: number) {
    console.log(id);

    if (id) {
      if (confirm('Are you Sure ? Do you want to Delete This Lc ')) {
        this.createLcService.deleteLc(id, this.pi_id_list).subscribe((response) => {
          this.toasterService.pop(response.message, response.message, response.data);
          this.mainDetail = false;
        });
      }
    }
  }

  createNon() {
    this.getNotifications('ADD_NON_NEGOTIABLE');
    this.nonReset();
    if (this.addNon === true) {
      this.addNon = false;
    } else {
      this.addNon = true;
    }
  }

  // reset lc
  resetLc() {

    console.log(this.lc_id, this.spipl_bank_id, this.supplier_id, "ResetLc");

    this.createLcService.resetPiList(this.lc_id, this.spipl_bank_id, this.supplier_id).subscribe((result) => {
      this.reset_pi_list = result;
    });

    // this.myModal.show();
  }

  // open lc
  openLc(funding_bank) {

    this.addOpenLcForm.patchValue({
      funding_bank: funding_bank
    });
    // this.openLcModal.show();
  }
  // ammend lc
  ammendLc() {
    this.editMode = false;
    // this.lcAmmendModal.show();
  }

  // Insurance lc
  insuranceLc() {
    // this.lcInsuranceModal.show();
  }


  lcCancel() {
    // this.lcCancelModel.show();
  };


  // check if the item are selected
  checked(item) {
    if (this.checkedList.indexOf(item) !== -1) {
      return true;
    }
  }

  // when checkbox change, add/remove the item from the array
  onChange(checked, item) {

    if (checked) {
      this.checkedList.push(item);

    } else {
      this.checkedList.splice(this.checkedList.indexOf(item), 1);

    }
    // console.log(this.checkedList);
  }
  resetLcPi() {
    //  console.log(this.checkedList);
    if (this.checkedList) {
      this.createLcService.updateLcPiList(this.lc_id, this.checkedList).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        if (response.code === '100') {

          // this.myModal.hide();
          this.checkedList = [];
          this.pi_id_list = [];
          this.getDetails(this.lc_id);
        }
      });
    }
  }

  onSubmitOpenLcForm() {
    let thirdParty = 0;

    if (!this.addOpenLcForm.invalid) {


      // const formData: any = new FormData();
      // formData.append('bank_lc_no', this.addOpenLcForm.value.bank_lc_no);
      // formData.append('lc_opening_date', this.convert(this.addOpenLcForm.value.lc_opening_date));
      // formData.append('lc_rate', this.addOpenLcForm.value.lc_rate);
      // formData.append('lc_remark', this.addOpenLcForm.value.lc_remark);
      // formData.append('buyer_bank_id', this.addOpenLcForm.value.buyer_bank_id);
      // formData.append('lc_id', this.lc_id);
      // if (this.addOpenLcForm.value.third_party_lc) {
      //   thirdParty = 1;
      // }
      // formData.append('third_party_lc', thirdParty);

      if (this.addOpenLcForm.value.third_party_lc) {
        thirdParty = 1;
      }

      let formData: any = {
        bank_lc_no: this.addOpenLcForm.value.bank_lc_no,
        lc_opening_date: this.convert(this.addOpenLcForm.value.lc_opening_date),
        lc_rate: this.addOpenLcForm.value.lc_rate,
        supplier_usance_charges: this.addOpenLcForm.value.supplier_usance_charges,
        manufacture_name: this.addOpenLcForm.value.manufacture_name,
        lc_remark: this.addOpenLcForm.value.lc_remark,
        funding_bank: this.addOpenLcForm.value.funding_bank,
        buyer_bank_id: this.addOpenLcForm.value.buyer_bank_id,
        lc_id: this.lc_id,
        third_party_lc: thirdParty
      };

      const fileData = new FormData();
      const document: Array<File> = this.docs;
      if (document.length > 0) {
        for (let i = 0; i < document.length; i++) {
          fileData.append('lc_copy_path', document[i], document[i]['name']);
        }

        this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
          let files = [];
          let filesList = res.uploads.lc_copy_path;
          if (filesList.length > 0) {
            for (let i = 0; i < filesList.length; i++) {
              files.push(filesList[i].location);
            }
            formData['lc_copy_path'] = JSON.stringify(files);
            this.saveDataLcOpen(formData);
          }
        });

      } else {
        this.createLcService.lcOpen(formData).subscribe((response) => {
          this.toasterService.pop(response.message, response.message, response.data);
          if (response.code === '100') {
            // this.openLcModal.hide();
            this.addOpenLcForm.reset();
            this.getDetails(this.lc_id);
          }
        });
      }


    }

  }

  saveDataLcOpen(form) {
    this.createLcService.lcOpen(form).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      if (response.code === '100') {
        // this.openLcModal.hide();
        this.addOpenLcForm.reset();
        this.getDetails(this.lc_id);
      }
    });

  }




  addDocs(event: any) {
    this.docs = <Array<File>>event.target.files;
  }


  addAmmendDocs(event: any) {
    this.ammenddocs = <Array<File>>event.target.files;
  }

  addInsuranceDocs(event: any) {
    this.insurancedocs = <Array<File>>event.target.files;
  }

  addLcCancelDocs(event: any) {
    this.lcCancelDocs = <Array<File>>event.target.files;
  }

  addNonDocs(event: any) {
    this.nondoc = <Array<File>>event.target.files;
  }

  addRevisedCopy(event: any) {
    this.revisedoc = <Array<File>>event.target.files;
  }

  discardLcPopUp() {
    // this.discardLcPopUpConformPopUp.show();
  }

  discardLc() {
    if (this.lc_id) {
      // if (confirm('Are you Sure ? Do you want to Discard This Lc ')) {
      this.createLcService.discardLc(this.lc_id).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.getDetails(this.lc_id);
      });
      // this.discardLcPopUpConformPopUp.hide();
      // }
    }
  }

  toleranceAdjustPopUp() {
    // this.toleranceAdjustConformPopUp.show();
  }

  toleranceAdjust() {
    if (this.lc_id) {
      // if (confirm('Are you Sure ? Do you want to Adjust Tolereance for  this LC')) {
      this.createLcService.adjustTolerence(this.lc_id).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.getDetails(this.lc_id);
      });
      // }
    }
  }

  toleranceResetPopUp() {
    // this.tolerenceConformPopUp.show();
  }

  toleranceReset() {
    if (this.lc_id) {
      // if (confirm('Are you Sure ? Do you want to Reset Tolereance for  this LC')) {
      this.createLcService.tolerenceReset(this.lc_id).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.getDetails(this.lc_id);
        // this.tolerenceConformPopUp.hide();
      });
      // }
    }
  }

  c_pi_id: any;
  c_pi_qty: any;

  conformPopUpMethod(pi_id, pi_qty) {
    // this.conformPopUp.show();
    this.c_pi_id = pi_id;
    this.c_pi_qty = pi_qty;
  }

  updatePiQtyTolerance(pi_id, pi_qty) {
    // this.popUpConfirmationFlag = confirm('Are you Sure ? Do you want to Adjust Tolereance for  this PI');


    // if (this.popUpConfirmationFlag) {
    console.log('pi_id', pi_id);
    console.log('pi_qty', pi_qty);
    // this.onSubmitNon();
    this.CrudServices.postRequest<any>(LetterofCreditCrud.adjustToleranceAgainstPi, {
      pi_id: pi_id,
      pi_qty: pi_qty
    }).subscribe((response) => {
      this.toasterService.pop(response.data, response.data, response.data);
      this.getDetails(this.lc_id);
    });
    // this.conformPopUp.hide();

    // }

  }

  onSubmitLcAmmend() {

    if (!this.addLcammend.invalid) {
      // const formData: any = new FormData();
      // formData.append('ammend_remark', this.addLcammend.value.ammend_remark);
      // formData.append('lc_ammed_date', this.convert(this.addLcammend.value.lc_ammed_date));
      // formData.append('lc_id', this.lc_id);


      // let ammendValue=0;
      // if (this.addLcammend.value.ammend_value) {
      // 	ammendValue = 1;
      // }
      // let ammendDays=0;
      // if (this.addLcammend.value.ammend_days) {
      // 	ammendDays = 1;
      // }
      // let ammendClause=0;
      // if (this.addLcammend.value.ammend_clause) {
      // 	ammendClause = 1;
      // }

      let ammendValue = 0;
      if (this.ammendValueFlag) {
        ammendValue = 1;
      }

      let ammendDays = 0;
      if (this.ammendDaysFlag) {
        ammendDays = 1;
      }

      let ammendClause = 0;
      if (this.ammendClauseFlag) {
        ammendClause = 1;
      }



      let formData: any = {
        ammend_remark: this.addLcammend.value.ammend_remark,
        lc_ammed_date: this.addLcammend.value.lc_ammed_date ? this.convert(this.addLcammend.value.lc_ammed_date) : null,
        ammend_lc_value: this.addLcammend.value.ammend_lc_value,
        ammend_shipment_date: this.addLcammend.value.ammend_shipment_date ? this.convert(this.addLcammend.value.ammend_shipment_date) : null,
        ammend_lc_expiry_date: this.addLcammend.value.ammend_lc_expiry_date ? this.convert(this.addLcammend.value.ammend_lc_expiry_date) : null,
        ammend_payment_term_id: this.addLcammend.value.ammend_payment_term_id,
        ammend_value: ammendValue,
        ammend_days: ammendDays,
        ammend_clause: ammendClause,
        bank_id: this.spipl_bank_id,
        lc_id: this.lc_id
      };

      const fileData: any = new FormData();
      const document: Array<File> = this.ammenddocs;
      if (document.length > 0) {
        for (let i = 0; i < document.length; i++) {
          fileData.append('lc_ammend_copy', document[i], document[i]['name']);
        }

        this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
          let files = [];
          let filesList = res.uploads.lc_ammend_copy;
          if (filesList.length > 0) {
            for (let i = 0; i < filesList.length; i++) {
              files.push(filesList[i].location);
            }
            formData['lc_ammend_copy'] = JSON.stringify(files);

            this.saveDataAmmendment(formData);


          }
        });
      } else {
        this.saveDataAmmendment(formData);
        // if(this.editMode == true)
        // {
        // 	//edit
        // }else
        // {
        // 	//add
        // }
        // this.createLcService.lcAmmend(formData).subscribe((response) => {
        // 	this.toasterService.pop(response.message, response.message, response.data);
        // 	if (response.code === '100') {
        // 		this.lcAmmendModal.hide();
        // 		this.addLcammend.reset();
        // 		this.getDetails(this.lc_id);
        // 	}
        // });

      }
    }
  }

  saveDataAmmendment(form) {

    if (this.editMode == true) {
      //edit
      console.log(form, "Edit");
      form['ammend_charges_id'] = this.ammend_charges_id;
    } else {
      console.log(form, "add");
      //add
    }

    this.createLcService.lcAmmend(form).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      if (response.code === '100') {
        // this.lcAmmendModal.hide();
        this.addLcammend.reset();
        this.getDetails(this.lc_id);
      }
    });


  }


  onSubmitLcInsurance() {


    if (!this.addLcinsurance.invalid) {
      // const formData: any = new FormData();
      // formData.append('insurance_remark', this.addLcinsurance.value.insurance_remark);
      // formData.append('lc_insurance_date', this.convert(this.addLcinsurance.value.lc_insurance_date));
      // formData.append('lc_id', this.lc_id);

      let formData: any = {
        insurance_remark: this.addLcinsurance.value.insurance_remark,
        lc_insurance_date: this.convert(this.addLcinsurance.value.lc_insurance_date),
        lc_id: this.lc_id,
      };


      const fileData: any = new FormData();
      const document: Array<File> = this.insurancedocs;
      if (document.length > 0) {
        for (let i = 0; i < document.length; i++) {
          fileData.append('lc_insurance_copy', document[i], document[i]['name']);
        }
        this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
          let files = [];
          let filesList = res.uploads.lc_insurance_copy;
          if (filesList.length > 0) {
            for (let i = 0; i < filesList.length; i++) {
              files.push(filesList[i].location);
            }
            formData['lc_insurance_copy'] = JSON.stringify(files);
            this.saveDataLcInsurance(formData);
          }
        });

      } else {

        this.createLcService.lcInsurance(formData).subscribe((response) => {
          this.toasterService.pop(response.message, response.message, response.data);
          if (response.code === '100') {
            // this.lcInsuranceModal.hide();
            this.addLcinsurance.reset();
            this.getDetails(this.lc_id);
          }
        });

      }


    }
  }

  saveDataLcInsurance(form) {
    this.createLcService.lcInsurance(form).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      if (response.code === '100') {
        // this.lcInsuranceModal.hide();
        this.addLcinsurance.reset();
        this.getDetails(this.lc_id);
      }
    });

  }



  onSubmitlcCancel() {
    if (!this.updateLcCancelStatus.invalid) {

      let formData: any = {
        lc_cancel_remark: this.updateLcCancelStatus.value.lc_cancel_remark,
        lc_cancel_date: this.convert(this.updateLcCancelStatus.value.lc_cancel_date),
        lc_id: this.lc_id,
      };


      const fileData: any = new FormData();
      const document: Array<File> = this.lcCancelDocs;
      if (document.length > 0) {
        for (let i = 0; i < document.length; i++) {
          fileData.append('lc_cancel_documents', document[i], document[i]['name']);
        }
        this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
          let files = [];
          let filesList = res.uploads.lc_cancel_documents;
          if (filesList.length > 0) {
            for (let i = 0; i < filesList.length; i++) {
              files.push(filesList[i].location);
            }
            formData['lc_cancel_documents'] = JSON.stringify(files);
            this.saveDataLcCancel(formData);
          }
        });

      } else {

        this.createLcService.lcCancel(formData).subscribe((response) => {
          this.toasterService.pop(response.message, response.message, response.data);
          if (response.code === '100') {
            // this.lcCancelModel.hide();
            this.updateLcCancelStatus.reset();
            this.getDetails(this.lc_id);
          }
        });

      }


    }
  }

  saveDataLcCancel(form) {
    this.createLcService.lcCancel(form).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      if (response.code === '100') {
        // this.lcCancelModel.hide();
        this.updateLcCancelStatus.reset();
        this.getDetails(this.lc_id);
      }
    });

  }



  onSubmitReviseCopy() {


    if (!this.reviseNonForm.invalid) {
      // const formData: any = new FormData();
      // formData.append('discrepancy_note', this.reviseNonForm.value.discrepancy_note);
      // formData.append('id', this.non_id);

      let formData: any = {
        discrepancy_note: this.reviseNonForm.value.discrepancy_note,
        id: this.non_id
      };

      const fileData: any = new FormData();
      const document: Array<File> = this.revisedoc;
      if (document.length > 0) {
        for (let i = 0; i < document.length; i++) {
          fileData.append('non_revised_copy', document[i], document[i]['name']);
        }
        this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
          let files = [];
          let filesList = res.uploads.non_revised_copy;
          if (filesList.length > 0) {
            for (let i = 0; i < filesList.length; i++) {
              files.push(filesList[i].location);
            }
            // formData['non_revised_copy'] = JSON.stringify(files);
            formData['non_revised_copy'] = files;
            this.saveDataReviseCopy(formData);
          }
        });

      } else {
        this.nonServiceNew.updateReviseNon(formData).subscribe((response) => {
          this.toasterService.pop(response.message, response.message, response.data);
          if (response.code === '100') {
            // this.ReviseNonModal.hide();
            this.reviseNonForm.reset();
            this.getDetails(this.lc_id);
          }
        });
      }




    }
  }
  saveDataReviseCopy(form) {
    this.nonServiceNew.updateReviseNon(form).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      if (response.code === '100') {
        // this.ReviseNonModal.hide();
        this.reviseNonForm.reset();
        this.getDetails(this.lc_id);
      }
    });
  }


  public getDate(regDate: string) {
    const date = new Date(regDate);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  onSubmitNon() {
    this.loadingBtn = true;
    let status: boolean;
    const array = [];
    const pi_qty = [];
    let pi_qty_arr = [];

    pi_qty_arr = this.addNonForm.value.pidetail;
    console.log(pi_qty_arr, 'array');

    for (const val of pi_qty_arr) {
      if (Number(val.pi_id_qty) > 0 && val.pi_id_qty !== '' && val.pi_id_qty !== null) {
        array.push(val);
      }
    }


    for (let i = 0; i < array.length; i++) {

      if (array[0]['grade_id'] === array[i]['grade_id'] && array[0]['port_id'] === array[i]['port_id']) {

        status = true;
        if (Number(array[i]['pi_id_qty']) > 0) {
          pi_qty.push({
            'pi_id': array[i]['pi_id'],
            'pi_qty': array[i]['pi_id_qty'],
            'pi_rate': array[i]['pi_rate'],
            'high_seas_pi': array[i]['high_seas_pi'],
            'forward_sale_pi': array[i]['forward_sale_pi'],
            'purchase_hold_qty_flag': array[i]['purchase_hold_qty_flag']
          });
        }
      } else {

        status = false;
        break;
      }


    }


    if (status === true) {
      this.date = new Date(this.addNonForm.value.date_of_shipment);
      this.date.setDate(this.date.getDate() + this.payment_term);

      // const formData: any = new FormData();
      // formData.append('invoice_no', this.addNonForm.value.invoice_no);
      // formData.append('invoice_date', this.convert(this.addNonForm.value.invoice_date));
      // formData.append('non_received_date', this.convert(this.addNonForm.value.non_received_date));
      // formData.append('date_of_shipment', this.convert(this.addNonForm.value.date_of_shipment));
      // formData.append('payment_due_date', this.convert(this.date));
      // if (this.addNonForm.value.non_rmk) {
      //   formData.append('non_rmk', this.addNonForm.value.non_rmk);
      // } else {
      //   formData.append('non_rmk', ' ');
      // }

      // formData.append('pi_id_qty', JSON.stringify(pi_qty));
      // formData.append('grade_id', array[0]['grade_id']);
      // formData.append('port_id', array[0]['port_id']);
      // formData.append('lc_id', this.lc_id);
      // formData.append('supplier_id', this.supplier_id);
      // formData.append('spipl_bank_id', this.spipl_bank_id);

      let nonRemark = '';
      if (this.addNonForm.value.non_rmk) {
        nonRemark = this.addNonForm.value.non_rmk;

      } else {
        nonRemark = '';
      }

      let formData: any = {
        invoice_no: this.addNonForm.value.invoice_no,
        invoice_date: this.convert(this.addNonForm.value.invoice_date),
        non_received_date: this.convert(this.addNonForm.value.non_received_date),
        date_of_shipment: this.convert(this.addNonForm.value.date_of_shipment),
        payment_due_date: this.convert(this.date),
        pi_id_qty: JSON.stringify(pi_qty),
        grade_id: array[0]['grade_id'],
        port_id: array[0]['port_id'],
        lc_id: this.lc_id,
        supplier_id: this.supplier_id,
        spipl_bank_id: this.spipl_bank_id,
        non_rmk: nonRemark
      }

      const fileData = new FormData();
      const document: Array<File> = this.nondoc;
      if (document.length > 0) {
        for (let i = 0; i < document.length; i++) {
          fileData.append('non_copy', document[i], document[i]['name']);
        }

        this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
          let files = [];
          let filesList = res.uploads.non_copy;
          this.loadingBtn = false;
          if (filesList.length > 0) {
            for (let i = 0; i < filesList.length; i++) {
              files.push(filesList[i].location);
            }
            formData['non_copy'] = JSON.stringify(files);
            this.SaveNon(formData, pi_qty);
          }
        });

      } else {
        if (pi_qty.length > 0) {
          this.nonServiceNew.addNon(formData).subscribe((response) => {
            this.toasterService.pop(response.message, response.message, response.data);
            this.loadingBtn = false;
            if (response.code === '100') {
              let port = this.port_list.filter(item => item.id = formData.port_id);
              let port_name = "";
              if (port.length) {
                port_name = port[0].port_name;
              }

              let data = {
                "title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
                "body": `Non-negotiable: ${formData.invoice_no} added for ${this.supplier_name}, Port: ${port_name}`,
                "click_action": "#"
              }
              console.log(data, 'DARA');


              this.generateNotification(data, 1);
              this.nonReset();
              this.getDetails(this.lc_id);
            }
          });
        } else {
          this.toasterService.pop('error', 'error', 'Quantity Not added');
        }
      }





    } else {
      this.toasterService.pop('error', 'error', 'Grade and Port are Not Same For selected PI');
    }

  }

  SaveNon(form, pi_qty) {

    if (pi_qty.length > 0) {
      this.nonServiceNew.addNon(form).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        if (response.code === '100') {
          let port = this.port_list.filter(item => item.id = form.port_id);
          let port_name = "";
          if (port.length) {
            port_name = port[0].port_name;
          }

          let data = {
            "title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
            "body": `Non-negotiable: ${form.invoice_no} added for ${this.supplier_name}, Port: ${port_name}`,
            "click_action": "#"
          }
          this.generateNotification(data, 1);

          this.nonReset();
          this.getDetails(this.lc_id);
        }
      });
    } else {
      this.toasterService.pop('error', 'error', 'Quantity Not added');
    }

  }

  checkQuantity($e, item, i) {


    if ($e.target.value) {
      const quantityTocover = Number(item.pi_quantity) - Number(item.nonqty_cover_against_pi);
      let tolerance_percent = 0;
      if ($e.target.value) {
        if (this.tolerance) {

          if (this.tolerance === 1) {
            tolerance_percent = 0.01;
          } else if (this.tolerance === 2) {
            tolerance_percent = 0.05;
          } else if (this.tolerance === 3) {
            tolerance_percent = 0.10;
          }

          let qty_tolerance = (Number(quantityTocover * tolerance_percent)) + Number(quantityTocover);
          console.log(qty_tolerance);
          console.log(Number($e.target.value));

          if (Number($e.target.value) > qty_tolerance) {
            this.toasterService.pop('warning', 'warning', 'Quantity Excedeed to Pending Quantity with Tolerance');
            const quantity = this.addNonForm.controls.pidetail as FormArray;
            quantity.controls[i].patchValue({ pi_id_qty: 0 });
          }
        } else {
          if (Number($e.target.value) > quantityTocover) {
            this.toasterService.pop('warning', 'warning', 'Quantity Excedeed to Pending Quantity');
            const quantity = this.addNonForm.controls.pidetail as FormArray;
            quantity.controls[i].patchValue({ pi_id_qty: 0 });
          }
        }
      }
    }
  }


  nonReset() {

    this.addNonForm.controls['invoice_no'].setValue('');
    this.addNonForm.controls['invoice_date'].setValue('');
    this.addNonForm.controls['non_received_date'].setValue('');
    this.addNonForm.controls['date_of_shipment'].setValue('');
    this.addNonForm.controls['non_copy'].setValue('');
    this.addNonForm.controls['non_rmk'].setValue('');



  }


  updateNon() {
    if (this.nonid) {
      this.date = new Date(this.addNonForm.value.date_of_shipment);
      this.date.setDate(this.date.getDate() + this.payment_term);


      // const formData: any = new FormData();
      // formData.append('invoice_no', this.addNonForm.value.invoice_no);
      // formData.append('invoice_date', this.convert(this.addNonForm.value.invoice_date));
      // formData.append('non_received_date', this.convert(this.addNonForm.value.non_received_date));
      // formData.append('date_of_shipment', this.convert(this.addNonForm.value.date_of_shipment));
      // if (this.addNonForm.value.non_rmk) {
      //   formData.append('non_rmk', this.addNonForm.value.non_rmk);
      // } else {
      //   formData.append('non_rmk', ' ');
      // }
      // formData.append('payment_due_date', this.convert(this.date));
      // formData.append('id', this.nonid);


      let nonRmk = '';
      if (this.addNonForm.value.non_rmk) {
        nonRmk = this.addNonForm.value.non_rmk;
      }

      let formData: any = {
        invoice_no: this.addNonForm.value.invoice_no,
        invoice_date: this.convert(this.addNonForm.value.invoice_date),
        non_received_date: this.convert(this.addNonForm.value.non_received_date),
        date_of_shipment: this.convert(this.addNonForm.value.date_of_shipment),
        payment_due_date: this.convert(this.date),
        id: this.nonid,
        non_rmk: nonRmk
      };



      const fileData: any = new FormData();
      const document: Array<File> = this.nondoc;
      if (document.length > 0) {
        for (let i = 0; i < document.length; i++) {
          fileData.append('non_copy', document[i], document[i]['name']);
        }

        this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
          let files = [];
          let filesList = res.uploads.non_copy;
          if (filesList.length > 0) {
            for (let i = 0; i < filesList.length; i++) {
              files.push(filesList[i].location);
            }
            formData['non_copy'] = JSON.stringify(files);
            this.updateNonCopy(formData);
          }
        });

      }
      this.nonServiceNew.updateNon(formData).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, response.data);
        if (response.code === '100') {
          this.nonReset();
          // this.nonModal.hide();
          this.getDetails(this.lc_id);
        }
      });
    }
  }

  updateNonCopy(form) {
    this.nonServiceNew.updateNon(form).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      if (response.code === '100') {
        this.nonReset();
        // this.nonModal.hide();
        this.getDetails(this.lc_id);
      }
    });
  }

  onEditNon(item) {
    console.log(item, "non details");
    if (item) {
      this.shipmentDate = item['date_of_shipment'];
      this.invoiceDate = item['invoice_date'];
      this.receivedDate = item['non_received_date'];
      this.invoiceNo = item['invoice_no'];
      this.remark = item['non_rmk'];
      this.nonid = item['id'];
      // this.nonModal.show();


    }
  }

  onDeleteNon(id: number) {
    if (id) {
      this.nonServiceNew.deleteNon(id).subscribe((response) => {
        if (response.code === '100') {
          this.toasterService.pop(response.message, response.message, response.data);
          this.getDetails(this.lc_id);
        }

      });
    }

  }

  ReviseNon(item) {
    this.non_id = item.id;
    this.reviseNonForm.patchValue({
      discrepancy_note: item.discrepancy_note
    })
    // this.ReviseNonModal.show();
  }

  getDocsArray(docs: string) {
    return JSON.parse(docs);
  }

  collapsed(event: any): void {
    // console.log(event);
  }

  expanded(event: any): void {
    // console.log(event);
  }


  generateWord() {
    this.router.navigate(['forex/download-word/' + this.lc_id]);
  }

  onAmmendValue($e) {

    if ($e) {
      this.ammendValueFlag = true;
    } else {
      this.ammendValueFlag = false;
    }

  }
  onAmmendDays($e) {
    if ($e) {
      this.ammendDaysFlag = true;
    } else {
      this.ammendDaysFlag = false;
    }
  }

  onAmmendClause($e) {
    if ($e) {
      this.ammendDaysFlag = false;
      this.ammendValueFlag = false;
      this.ammendClauseFlag = true;
    } else {
      this.ammendClauseFlag = false;
    }
  }


  // delete_revise_non_path(id, path) {

  // 	console.log(id, path, "pathid");

  // 	this.CrudServices.postRequest<any>(nonNegotiable.deleteReviseNonPath, {
  // 		path: path,
  // 		id: id
  // 	}).subscribe((response) => {
  // 		this.toasterService.pop(response.message, response.message, response.data);
  // 		this.getDetails(this.lc_id);
  // 	});

  // };

  delete_revise_non_path(id) {


    this.CrudServices.postRequest<any>(nonNegotiable.deleteReviseNonPath, {
      id: id
    }).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      this.getDetails(this.lc_id);
    });

  };



  onEditAmmendment(AmmendDetails) {

    this.editMode = true;
    //console.log(AmmendDetails);
    this.lc_ammed_date = AmmendDetails.lc_ammed_date;
    this.ammendValueFlag = AmmendDetails.ammendment_value;
    this.ammendDaysFlag = AmmendDetails.ammendment_days;
    this.ammendClauseFlag = AmmendDetails.ammendment_clause;
    this.lc_ammed_db_value = AmmendDetails.ammend_lc_value;
    this.ammend_shipment_date = AmmendDetails.ammend_shipment_date;
    this.ammend_lc_expiry_date = AmmendDetails.ammend_lc_expiry_date;
    this.ammend_payment_term_id = AmmendDetails.ammend_payment_term_id;
    this.lc_ammed_remark = AmmendDetails.ammend_remark;
    this.ammend_charges_id = AmmendDetails.id;

    // this.lcAmmendModal.show();
  }

  onDeleteAmmendment(ammendmentId) {

    console.log('Ammendment Id', ammendmentId);

    this.CrudServices.postRequest<any>(LetterOfCredit.deleteLcAmmendment, {
      ammendId: ammendmentId
    }).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      this.getDetails(this.lc_id);
    });

  }

  getNotifications(name) {
    this.notification_tokens = [];
    this.notification_id_users = []
    this.notification_users = [];



    this.CrudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
      if (notification.code == '100' && notification.data.length > 0) {
        this.notification_details = notification.data[0];
        console.log(this.notification_details, "received details")
        this.CrudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
          console.log(notificationUser, 'DATA');

          if (notificationUser.code == '100' && notificationUser.data.length > 0) {
            notificationUser['data'].forEach((element) => {
              if (element.fcm_web_token) {
                this.notification_tokens.push(element.fcm_web_token);
                this.notification_id_users.push(element.id);
                console.log(this.notification_tokens, this.notification_id_users)
              }
            });
          }
        });
      }
    })





  }


  generateNotification(data, id) {
    console.log(this.notification_details, 'DIKSHA');
    if (this.notification_details != undefined) {
      let body = {
        notification: data,
        registration_ids: this.notification_tokens
      };

      console.log(body, 'BODY');


      this.messagingService.sendNotification(body).then((response) => {
        if (response) {
          console.log(response);

          this.saveNotifications(body['notification'], id)
        }
        this.messagingService.receiveMessage();
        this.message = this.messagingService.currentMessage;

      })

    }


  }

  saveNotifications(notification_body, id) {
    console.log(id, 'DATA');

    this.notification_users = [];
    for (const element of this.notification_id_users) {
      this.notification_users.push({
        notification_id: this.notification_details.id,
        reciever_user_id: element,
        department_id: 1,
        heading: notification_body.title,
        message_body: notification_body.body,
        url: notification_body.click_action,
        record_id: id,
        table_name: 'bill_of_lading',
      })
    }
    console.log(this.notification_users, "this.notification_users")
    this.CrudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
    }, (error) => console.error(error));
  }



  getMonth(month: Number) {
    switch (month) {
      case 1: {
        return 'January';
        break;
      }
      case 2: {
        return 'February';
        break;
      }
      case 3: {
        return 'March';
        break;
      }
      case 4: {
        return 'April';
        break;
      }
      case 5: {
        return 'May';
        break;
      }
      case 6: {
        return 'June';
        break;
      }
      case 7: {
        return 'July';
        break;
      }
      case 8: {
        return 'August';
        break;
      }
      case 9: {
        return 'September';
        break;
      }
      case 10: {
        return 'October';
        break;
      }
      case 11: {
        return 'November';
        break;
      }
      case 12: {
        return 'December';
        break;
      }

    }
  }
  filterLcList(textData: string) {
    this.dataSource = new MatTableDataSource(this.dataSourceUnfiltered);
    if (textData && Array.isArray(this.dataSource)) {
      console.log(this.dataSource[0]);

      textData = textData.toUpperCase();
      const keys = Object.keys(this.dataSource[0]);
      this.dataSource = new MatTableDataSource(this.dataSource.filter(v => v && keys.some(k => v[k] && v[k].toString().toUpperCase().indexOf(textData) >= 0)));
    } else {
      this.dataSource = new MatTableDataSource(this.dataSourceUnfiltered);
    }
  }
}
