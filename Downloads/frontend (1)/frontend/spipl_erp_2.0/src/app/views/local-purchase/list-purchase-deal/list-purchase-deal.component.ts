import * as moment from 'moment';

import { CommonApis, Consignments, EmailTemplateMaster, FileUpload, GodownMaster, GradeMaster, LocalPurchase, MainContact, PaymentTermMaster, PercentageDetails, PortMaster, ProductMaster, StaffMemberMaster, SubOrg, orgContactPerson, Notifications, NotificationsUserRel, UsersNotification, Payables, LiftingDetails, forexReports, inventoryRedis, subOrgRespectiveBank } from '../../../shared/apis-path/apis-path';
import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';

import { CommonService, staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DatePipe } from '@angular/common';
import { ExportService } from '../../../shared/export-service/export-service';
import { GeneratePdfService } from '../../sales/generate-pdf.service';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import { LoginService } from '../../login/login.service';
import { MainContactService } from '../../masters/sub-org-master/sub-org-detail/main-contact-service';
import { MainSubOrgService } from '../../masters/sub-org-master/main-sub-org-service';
import { ModalDirective } from 'ngx-bootstrap';
import { PayableParameter } from '../../../shared/payable-request/payable-parameter.model';
import { PayableRequestModule } from '../../../shared/payable-request/payable-request.module';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Router } from '@angular/router';
import { SelectService } from '../../../shared/dropdown-services/select-services';
import { Table } from 'primeng/table';
import { UserDetails } from '../../login/UserDetails.model';
import { environment } from '../../../../environments/environment';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { MessagingService } from '../../../service/messaging.service';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-list-purchase-deal',
  templateUrl: './list-purchase-deal.component.html',
  styleUrls: ['./list-purchase-deal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    ToasterService,
    PermissionService,
    LoginService,
    SelectService,
    ExportService,
    MainSubOrgService,
    DatePipe,
    InrCurrencyPipe,
    CommonService,
    CrudServices,
    GeneratePdfService,
    MainContactService,
    MessagingService
  ]
})
export class ListPurchaseDealComponent implements OnInit {
  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;
  @ViewChild('myModalManufacturer', { static: false }) public myModalManufacturer: ModalDirective;
  @ViewChild('myExtraModal', { static: false }) public myExtraModal: ModalDirective;
  @ViewChild('myModalMail', { static: false }) public myModalMail: ModalDirective;
  @ViewChild('sendWhatappModal', { static: false }) public sendWhatappModal: ModalDirective;
  @ViewChild('myModalAdjust', { static: false }) public myModalAdjust: ModalDirective;
  @ViewChild('myModalPayment', { static: false }) public myModalPayment: ModalDirective;
  @ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];
  @ViewChild('deal', { static: false }) public deal: ElementRef<any>;
  @ViewChild('invoice', { static: false }) public invoice: ElementRef<any>;
  @ViewChild('myLiftingDetails', { static: false }) public myLiftingDetails: ModalDirective;
  @ViewChild('mySplitModal', { static: false }) public mySplitModal: ModalDirective;
  @ViewChild('myQtyKnockofModal', { static: false }) public myQtyKnockofModal: ModalDirective;
  @ViewChild('updateModeModal', { static: false }) public updateModeModal: ModalDirective;

  hideShow: boolean = true;
  liftingDetails: any;
  public popoverTitle: string = 'Warning';
  public popoverMessage: string = 'Are you sure, you want to delete?';
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = 'Yes';
  public cancelText: string = 'No';
  public placement: string = 'right';
  public closeOnOutsideClick: boolean = true;
  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  addForm: boolean = false;
  partyFlag: boolean = false;
  lift_pending_list: boolean = false;
  payment_pending_list: boolean = false;
  user: UserDetails;
  links: string[] = [];
  serverUrl: string;

  isLoading = false;
  isLoadingMail = false;

  bsRangeValue: Date[];
  cols = [];
  deal_list = [];
  _selectedColumns: any[];
  lookup = {};
  lookup_grade = {};
  lookup_port = {};
  lookup_godown = {};
  lookup_zone = {};
  lookup_st_lift = {};
  lookup_st_payment = {};
  supplier_list = [];
  lookup_garde_type = [];
  grades = [];
  grade_type = [];
  ports = [];
  godown = [];
  zones = [];
  liftStatus = [];
  paymentStatus = [];
  export_purchase_list = [];
  checkedList = [];
  payableExit: boolean = true;
  @ViewChild('dt', { static: false }) table: Table;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  fromDealDate: any;
  toDealDate: any;
  deal_date: string;
  due_date: string;
  tot_qty = 0;
  tot_rate = 0;
  filteredValuess: any[];
  tot_deal_val = 0;
  tot_lifting_done = 0;
  tot_lifting_remaining = 0;
  currentYear: number;
  date = new Date();
  exportColumns: { title: any; dataKey: any; }[];

  addPurchaseForm: FormGroup;
  addExtraPurchaseForm: FormGroup;
  addsplitForm: FormGroup;
  from_date: string;
  to_date: string;
  data: any[];
  totalAmtLocal: number;
  totalCredit: number;
  totalDebit: number;
  totalAmtExceed: boolean = false;

  // dropdowns

  grade_list = [];
  port_list = [];
  term = [];
  paymentTerm = [];
  godownList = [];
  sub_org = [];
  products = [];
  delivery_term = [];
  zone = [];
  paymentMethod = [];
  status = [];
  unsoldTotalMessage: boolean = false;
  fixedValue = 5000;

  godown_id: number;
  purchase_holder_id: number;
  supplier_id: number;
  dealDate: string;
  quantity: string;
  rate: string;
  grade_id: number;
  term_id: number;
  payment_term: number;
  delivery: number;
  dueDate: string;
  remark: string;
  cgst_percent: number;
  sgst_percent: number;
  tcs_percent: any;
  pay_id: any;
  mode_of_payment: string;
  excel_download: boolean;
  pdf_download: boolean;
  send_sms: boolean;
  payment_details: boolean;
  lifting_details: boolean;
  cancel_qty: boolean;
  lifting_status: any;
  payment_status: any;
  /* payable parameter */
  payablePara: PayableRequestModule;
  generatePiFlag: boolean = false;
  checkstatus: boolean = false;
  mode: string = 'Add';
  dealArrayForPI = [];
  global_deal_list: any[];
  totalPaymentDone: number;
  totalPaymentRemaining: number;
  gst_percentege: number = 0;
  sendHeads: any[];
  messageText: string;
  contactNumbers = [];
  towhatsapp = '';
  toWhatsappArr = [];
  MobileData: any[];
  EmailData: any[];
  defaultContactPerson: any;
  selectedEmails = [];
  selectedMobileNo = [];
  form: FormGroup;
  sub_org_id: any;
  fileData: FormData = new FormData();
  maillist = [];
  tomail = [];
  ccMail = [];
  tomailtext: string;
  ccmailtext: string;
  lifting_list: boolean;
  payment_list: boolean;
  footer: any;
  subject: string;
  template: string;
  godown_id_ori: any;
  supplier_id_ori: any;
  quantity_ori: any;
  rate_ori: any;
  grade_id_ori: any;
  payment_term_ori: any;
  delivery_ori: any;
  lifting_qty: any;
  status_lift: any;
  status_payment: any;
  add_charges: boolean;
  extra_quantity: any;
  wholeItem: any;

  vendor_ref_number: any;
  basic_amount: any;
  freight: any;
  less_cash_discount: any;
  less_mou_discount: any;

  magangementSPIPLWhatsappNumbers: any = staticValues.magangementSPIPLWhatsappNumbersLocal;
  magangementSSurishaWhatsappNumbers: any = staticValues.magangementSSurishaWhatsappNumbersLocal

  magangementEmails: any = []
  adjustList: any[];
  adjustForm: FormGroup;
  adjustDeals: FormArray;
  adjustDealsList = [];
  dealid: any;
  paymentRemain: any;
  supplierAdjust: any;
  totalAmount: number;
  loadingBtn: boolean;

  notification_details: any;
  notification_tokens = [];
  notification_id_users = []
  notification_users = [];
  message: any;
  lifting_invoices: any = [];

  deal_payment: boolean = false;
  invoice_payment: boolean = false;
  paymentInvoice: boolean;
  proccedBtn: boolean;
  sister_company_list: any = [];
  sisterCompanyId: any;
  requestAmount: any;
  payObj: any = {};
  LiftPayArr: any;
  localSummaryPayment = [];
  TotalRemain: any;
  manufacturer = [];
  addManufacturerForm: FormGroup;
  manufacture_deal: boolean;
  company_id: any;
  role_id: any;
  petro_manufacturer_grade = [];
  local_godown_allocation: boolean;
  deal_value_gst: any;
  company: { label: string; id: number; }[];
  company_filter: boolean;
  knockOff: boolean;
  TotalAdvance: any;
  isRange: any;
  fromdate: string;
  todate: string;
  uploadSuccess: EventEmitter<boolean> = new EventEmitter();

  lifting_data: any;
  liftingText: any;
  supplierFilter = [];
  updated_deal_value: number;
  splitGrades: any[];
  deal_details: any;
  tds_percent = 0.1;
  whatsappData: any;
  isLoadingSMS: boolean;
  contactArr: any = [];
  toEmailArr: any = [];
  knockOfQtyForm: FormGroup;
  modeOfPayment: any;
  changeMode: boolean;
  dealType: { label: string; id: number; }[];
  deal_type: any;
  bankTotalAmount: string;

  main_grade_master = [{ id: 0, name: 'All', company_id: 0 }];
  company_List = [{ id: 0, name: 'All' }, ...staticValues.companies];
  import_local_list = [{ id: 0, name: 'All' }, { id: 1, name: 'Import' }, { id: 2, name: 'Local' }];
  importLocalArr = [];
  importlocal_Ids: any[];
  unsoldData: any[];
  DetailUnsoldData: any[];
  main_grade_ids: any[];
  main_grade: any[];
  reslcNotIssue: any;
  resNonPending: any;
  resRegIntransite: any;
  resMaterialInBondPending: any;
  pi_flag_hold_release: boolean = false;
  totalAmt: number;
  testData: any[];
  dataFinal: any[];
  invoiceAmountForm: FormGroup;
  pvc_local_statement_value: any = staticValues.pvc_local_statement_temp_value;
  local_statement_set_date: any = staticValues.local_statement_set_date;
  local_statement_set_date_pvc: any = staticValues.local_statement_set_date_pvc;
  bank_list: any;

  constructor(
    private toasterService: ToasterService,
    private permissionService: PermissionService,
    private loginService: LoginService,
    public datepipe: DatePipe,
    private exportService: ExportService,
    private currencyPipe: InrCurrencyPipe,
    private commonService: CommonService,
    private crudServices: CrudServices,
    private GenPdfService: GeneratePdfService,
    private fb: FormBuilder,
    private router: Router,
    private messagingService: MessagingService,
    private datePipe: DatePipe
  ) {
    this.bankTotalAmount = localStorage.getItem('totalAmt');
    this.serverUrl = environment.serverUrl;
    const perms = this.permissionService.getPermission();
    this.add_opt = perms[0];
    this.view_opt = perms[1];
    this.edit_opt = perms[2];
    this.del_opt = perms[3];
    this.pi_flag_hold_release = false;

    this.user = this.loginService.getUserDetails();

    this.links = this.user.links;
    this.excel_download = (this.links.indexOf('Local Purchase Export Excel') > -1);
    this.pdf_download = (this.links.indexOf('Local Purchase Export PDF') > -1);
    this.send_sms = (this.links.indexOf('Local Purchase Deal SMS') > -1);
    this.payment_details = (this.links.indexOf('Local Purchase Payment Details') > -1);
    this.lifting_details = (this.links.indexOf('Local Purchase Lifting Details') > -1);
    this.cancel_qty = (this.links.indexOf('local purchase cancel quantity') > -1);
    this.lift_pending_list = (this.links.indexOf('Local Purchase Lifting Pending List') > -1);
    this.payment_pending_list = (this.links.indexOf('Local Purchase Payment Pending List') > -1);
    this.add_charges = (this.links.indexOf('Local Purchase Charges') > -1);
    this.manufacture_deal = (this.links.indexOf('Manufacture Deal') > -1);
    this.local_godown_allocation = (this.links.indexOf('Local godown allocation') > -1);
    this.company_filter = (this.links.indexOf('Local Company Filter') > -1);
    this.knockOff = (this.links.indexOf('Local Payment Knock off') > -1);
    this.changeMode = (this.links.indexOf('local_mode_of_payment_change') > -1);
    this.company_id = this.user.userDet[0].company_id;
    this.role_id = this.user.userDet[0].role_id;
    this.addPurchaseForm = new FormGroup({
      'godown_id': new FormControl(null, Validators.required),
      'purchase_holder_id': new FormControl(null, Validators.required),
      'supplier_id': new FormControl(null, Validators.required),
      'deal_date': new FormControl(null, Validators.required),
      'quantity': new FormControl(null, Validators.required),
      'rate': new FormControl(null, Validators.required),
      'freight': new FormControl(null),
      'grade_id': new FormControl(null, Validators.required),
      'term': new FormControl(null, Validators.required),
      'payment_term': new FormControl(null, Validators.required),
      'delivery_term': new FormControl(null, Validators.required),
      'due_date': new FormControl(null),
      'mode_of_payment': new FormControl(null, Validators.required),
      'remark': new FormControl(null),
      'cgst_percent': new FormControl(null),
      'sgst_percent': new FormControl(null),
      'tcs_percent': new FormControl(null),
      'emailMult': new FormControl(null),
      'mobileMult': new FormControl(null),
      'deal_value_gst': new FormControl(0),
      'company_id': new FormControl(this.company_id, Validators.required),
      'eta': new FormControl(null),
      'delivery_remark': new FormControl(null),
      'is_forward': new FormControl(null,Validators.required),
    });

    this.addManufacturerForm = new FormGroup({
      'godown_id': new FormControl(null, Validators.required),
      'supplier_id': new FormControl(null, Validators.required),
      'deal_date': new FormControl(null, Validators.required),
      'quantity': new FormControl(null, Validators.required),
      'rate': new FormControl(null, Validators.required),
      'grade_id': new FormControl(null, Validators.required),
      'term': new FormControl(null, Validators.required),
      'payment_term': new FormControl(null, Validators.required),
      'delivery_term': new FormControl(null, Validators.required),
      'mode_of_payment': new FormControl(null, Validators.required),
      'remark': new FormControl(null),
      'cgst_percent': new FormControl(null),
      'sgst_percent': new FormControl(null),
      'tcs_percent': new FormControl(null),
      'emailMult': new FormControl(null),
      'mobileMult': new FormControl(null),
      'basic_amount': new FormControl(null),
      'freight': new FormControl(null),
      'less_cash_discount': new FormControl(null),
      'less_mou_discount': new FormControl(null),
      'vendor_ref_number': new FormControl(null),
      'less_other_discount': new FormControl(null),
      'deal_value': new FormControl(0),
      'gst_amount': new FormControl(0),
      'invoice_amount': new FormControl(0),
      'basic_rate': new FormControl(0),
      'tds_amount': new FormControl(0),
    });

    this.invoiceAmountForm = new FormGroup({
      amount: new FormControl(null),
      bank_id: new FormControl(null, Validators.required),
      remark: new FormControl(null, Validators.required)
    })

    this.addExtraPurchaseForm = new FormGroup({
      'extra_quantity': new FormControl(0),
    });

    this.knockOfQtyForm = new FormGroup({
      'knock_of_qty': new FormControl(0),
    });

    this.addsplitForm = new FormGroup({
      'grade_id': new FormControl(null),
      'quantity': new FormControl(null),
      'emailMult': new FormControl(null),
      'mobileMult': new FormControl(null),
    });


    this.adjustForm = this.fb.group({
      adjustDeals: this.fb.array([
      ]),
    });

    this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 93 }).subscribe(response => {

      if (response.length) {
        response.map(item => {
          item.sub_org_name = `${item.sub_org_name} - (${item.org_unit_master.unit_type}) - (${item.location_vilage})`
        })
      }
      this.sub_org = response;
    });


    this.crudServices.getAll<any>(SubOrg.getManufacturerSsurisha).subscribe((response) => {
      response.map(item => {
        item.sub_org_name = `${item.sub_org_name}  - (${item.location_vilage})`
      })


      this.manufacturer = response

    })


    this.crudServices.getAll<any>(GradeMaster.getAll).subscribe((response) => {
      this.grade_list = response;

    });

    this.crudServices.getAll<any>(PortMaster.getAll).subscribe((response) => {
      this.port_list = response;
    });

    this.crudServices.getAll<any>(CommonApis.get_all_delivery_term).subscribe(response => {

      this.delivery_term = response;

    });

    this.crudServices.getOne<any>(PaymentTermMaster.getOneByType, {
      pay_type: 3
    }).subscribe((response) => {

      this.paymentTerm = response;
    });

    this.crudServices.getAll<any>(GodownMaster.getAll)
      .subscribe((response) => {
        this.godownList = response;

      });



    this.crudServices.getAll<any>(StaffMemberMaster.getLocalPurchaseZone).subscribe((response) => {
      response.map(item => item.first_name = `${item.first_name} ${item.last_name}`)
      this.zone = response;
    });

    this.crudServices.getAll<any>(ProductMaster.getAll)
      .subscribe((response) => {
        this.products = response;

      });



    this.term = [{ label: '+GST+TCS', id: 1 }, { label: '+GST+Frt+TCS', id: 2 }, { label: '+GST-TDS', id: 3 }];
    this.paymentMethod = [{ label: 'RTGS/NEFT', id: 1 }, { label: 'LC', id: 2 }];
    this.status = [{ label: 'Pending', id: 0 }, { label: 'Completed', id: 1 }];
    this.company = [{ label: 'PVC', id: 1 }, { label: 'PE & PP', id: 2 }, { label: 'SURISHA', id: 3 }];
    this.dealType = [{ label: 'Supplier Deal', id: 0 }, { label: 'Manufacturer', id: 1 }];

    if (this.lift_pending_list) {
      this.lifting_status = 0;

    }

    if (this.payment_pending_list) {
      this.payment_status = 0;
    }

    let statusLift = sessionStorage.getItem('LiftingStatus')
    if (statusLift != null && statusLift != '3') {
      this.lifting_status = Number(statusLift)
    } else if (statusLift == '3') {
      this.lifting_status = ''
    }


    let statuspay = sessionStorage.getItem('PaymentStatus')
    if (statuspay != null && statuspay != '3') {
      this.payment_status = Number(statuspay)
    } else if (statuspay == '3') {
      this.payment_status = ''
    }

    let statusCompany = sessionStorage.getItem('CompanyStatus')

    if (statusCompany != null) {
      this.company_id = Number(statusCompany)
    }


    this.cols = [
      { field: 'deal_date', header: 'Booking Date', style: '150px' },
      { field: 'id', header: 'Booking ID', style: '150px' },
      { field: 'sub_org_name', header: 'Supplier', style: '220px' },
      { field: 'quantity', header: 'Quantity', style: '100px' },
      { field: 'rate', header: 'Rate/Term', style: '150px' },
      { field: 'deal_value_gst', header: 'Deal Value', style: '100px' },
      { field: 'payment_done', header: 'Payment Done', style: '100px' },
      { field: 'payment_remaining', header: 'Payment Remaining', style: '150px' },
      { field: 'status_payment', header: 'Payment Status', style: '100px' },
      { field: 'PaymentTermName', header: 'Payment Term', style: '200px' },
      { field: 'due_date', header: 'Due Date', style: '150px' },
      { field: 'mode_of_payment', header: 'Mode Of Payment', style: '120px' },
      { field: 'lifting_done', header: 'Lifting Done', style: '100px' },
      { field: 'lifting_remaining', header: 'Lifting Remaining', style: '100px' },
      { field: 'status_lift', header: 'Lifting Status', style: '100px' },
      { field: 'maingradename', header: 'Grade', style: '180px' },
      { field: 'grade_name', header: 'Grade in Detail', style: '180px' },
      { field: 'productname', header: 'Product', style: '180px' },
      { field: 'godown_name', header: 'Godown', style: '180px' },
      { field: 'marketing_person', header: 'Zone', style: '180px' },
      { field: 'remark', header: 'Remarks', style: '150px' },
      { field: 'deliveryTerm', header: 'Delivery Term', style: '150px' },
      { field: 'delivery_remark', header: 'Delivery Remark', style: '150px' },
      { field: 'eta', header: 'ETA', style: '150px' },
      // { field: 'all_purchase_invc', header: 'Purchase Invoice No.', style: '150px' }

    ];


    if (localStorage.getItem('selected_col_local_purchase')) {
      this._selectedColumns = JSON.parse(localStorage.getItem('selected_col_local_purchase'));
    } else {
      this._selectedColumns = this.cols;
    }

    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    if (this.datepipe.transform(this.date, 'MM') > '03') {
      this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    } else {
      this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
    }

    this.fromDealDate = this.bsRangeValue[0];
    this.toDealDate = this.bsRangeValue[1];
    this.setTaxValue();


    this.crudServices.getRequest<any>(forexReports.getAllGradeWithCompanyId).subscribe((response) => {
      this.main_grade_master = [...this.main_grade_master, ...response];
      this.main_grade = this.main_grade_master.filter(val => val.company_id == 1);


      let main_grade_array = [];
      this.main_grade.forEach((element) => {
        if (element.id == 1 || element.id == 2 || element.id == 3 || element.id == 11) {
          main_grade_array.push(element.id);
        }
      })

      this.main_grade_ids = main_grade_array;

      let company_Ids = [0];

      this.getInventoryFromRdis();
    });

  }

  onSelect($e, state) {
    this.deal_list = [];

    if ($e == null && state === '1') {
      this.fromDealDate = '';
      this.toDealDate = '';
    }

    if ($e == null && state === '2') {
      this.lifting_status = '';
      sessionStorage.setItem('LiftingStatus', '3')
    }

    if ($e == null && state === '3') {
      this.payment_status = '';
      sessionStorage.setItem('PaymentStatus', '3')
    }

    if ($e == null && state === '4') {
      this.company_id = '';
      sessionStorage.setItem('CompanyStatus', '')
    }


    if ($e != null) {


      if (state === '1') {
        this.fromDealDate = this.convert($e[0]);
        this.toDealDate = this.convert($e[1]);

      } else if (state === '2') {
        this.lifting_status = $e.id;
        sessionStorage.setItem('LiftingStatus', $e.id)
      } else if (state === '3') {
        this.payment_status = $e.id;
        sessionStorage.setItem('PaymentStatus', $e.id)
      } else if (state === '4') {
        this.company_id = $e.id;
        sessionStorage.setItem('CompanyStatus', $e.id)
      }

    }
    this.getDealList();
    this.getLocalData( this.company_id);
  }

  ngOnInit() {
    this.getLocalData(this.user.userDet[0].company_id);

  }

  receiveDate(dateValue: any) {
    this.isRange = dateValue.range
    this.bsRangeValue = dateValue.range;
  }

  clearDropdown() {
    if (JSON.stringify(this.isRange) != JSON.stringify(this.bsRangeValue))
      this.uploadSuccess.emit(false);
  }

  onchangeDate() {
    if (this.bsRangeValue[0]) {
      this.fromdate = this.datePipe.transform(this.bsRangeValue[0], 'yyyy-MM-dd');
      this.todate = this.datePipe.transform(this.bsRangeValue[1], 'yyyy-MM-dd');
      this.getDealList();
    }
  }

  onChangeSupplier(event) {

    if (event) {
      this.MobileData = [];
      this.EmailData = [];
      this.selectedEmails = [];
      this.selectedMobileNo = [];
      this.addPurchaseForm.patchValue({ emailMult: [] });
      this.addPurchaseForm.patchValue({ mobileMult: [] });
      this.getAllEmailsContacts(event.sub_org_id);
      this.sub_org_id = event.sub_org_id;
      this.addPurchaseForm.patchValue({ term: 3 });
      this.onchangeQuantity();
    }
  }

  onchangeQuantity() {
    let quantity = this.addPurchaseForm.value.quantity;
    let rate = this.addPurchaseForm.value.rate;
    let amount = Number(quantity) * Number(rate);

    let deal_value_gst = 0;

    if (amount > 0) {
      const deal_gst = ((amount) * this.gst_percentege / 100);
      const deal_value_tds = ((amount) * this.tds_percent / 100);
      deal_value_gst = (amount) + deal_gst - deal_value_tds;
      this.addPurchaseForm.patchValue({ deal_value_gst: deal_value_gst });
    }
  }

  onChangeManufacturer(event) {
    if (event) {
      let petro_manufacturer = 0;
      if (event.rel_dca_cs_manufacturers.length) {
        petro_manufacturer = event.rel_dca_cs_manufacturers[0].dca_cs_against_sub_org.org_id;
        this.crudServices.getOne<any>(GradeMaster.getGradeAgainstDCA_CS, { petro_manu_org_id: petro_manufacturer }).subscribe((response) => {
          this.petro_manufacturer_grade = response;
        });
      }
      this.addManufacturerForm.patchValue({ term: 3 });
    }
  }

  getDealList() {
    this.isLoading = true;
    this.tot_qty = 0;
    this.tot_rate = 0;
    this.totalAmount = 0;
    this.tot_deal_val = 0;
    this.tot_lifting_done = 0;
    this.tot_lifting_remaining = 0;
    this.totalPaymentDone = 0;
    this.totalPaymentRemaining = 0;
    this.crudServices.getOne<any>(LocalPurchase.getAll, {
      deal_date_from: this.bsRangeValue.length ? this.bsRangeValue[0] : null,
      deal_date_to: this.bsRangeValue.length ? this.bsRangeValue[1] : null,
      status_lift: this.lifting_status,
      status_payment: this.payment_status,
      company_id: this.company_id,
      deal_type: this.deal_type
    }).subscribe((response) => {

      this.isLoading = false;
      this.global_deal_list = response;
      this.deal_list = response;
      this.filteredValuess = this.deal_list
      this.getDetails(response);
    });
  }

  getDetails(response) {
    this.tot_qty = 0;
    this.tot_rate = 0;
    this.totalAmount = 0;
    this.tot_deal_val = 0;
    this.tot_lifting_done = 0;
    this.tot_lifting_remaining = 0;
    this.totalPaymentDone = 0;
    this.totalPaymentRemaining = 0;

    for (let item, i = 0; item = response[i++];) {
      const name = item.sub_org_name;
      const grade = item.grade_name;
      const godown = item.godown_name;
      const zone = item.marketing_person;
      const quantity = item.quantity;
      const amount = item.quantity * item.rate;
      const grade_type = item.maingradename;
      const status_lift = item.status_lift;
      const status_payment = item.status_payment;
      this.tot_qty = this.tot_qty + quantity;
      this.tot_deal_val = this.tot_deal_val + item.deal_value_gst;
      this.totalAmount = this.totalAmount + amount;
      this.tot_rate = this.totalAmount / this.tot_qty;
      this.totalPaymentDone += item.payment_done;
      this.totalPaymentRemaining += item.payment_remaining;
      this.tot_lifting_done += item.lifting_done;
      this.tot_lifting_remaining += item.lifting_remaining;
      if (!(name in this.lookup)) {
        this.lookup[name] = 1;
        this.supplier_list.push({ 'sub_org_name': name });
      }

      if (!(grade_type in this.lookup_garde_type)) {
        this.lookup_garde_type[grade_type] = 1;
        this.grade_type.push({ 'maingradename': grade_type });
      }

      if (!(grade in this.lookup_grade)) {
        this.lookup_grade[grade] = 1;
        this.grades.push({ 'grade_name': grade });
      }

      if (!(godown in this.lookup_godown)) {
        this.lookup_godown[godown] = 1;
        this.godown.push({ 'godown_name': godown });
      }

      if (!(zone in this.lookup_zone)) {
        this.lookup_zone[zone] = 1;
        this.zones.push({ 'marketing_person': zone });
      }

      if (!(status_lift in this.lookup_st_lift)) {
        this.lookup_st_lift[status_lift] = 1;
        this.liftStatus.push({ value: status_lift, label: this.getstatus(status_lift) });
      }

      if (!(status_payment in this.lookup_st_payment)) {
        this.lookup_st_payment[status_payment] = 1;
        this.paymentStatus.push({ value: status_payment, label: this.getstatus(status_payment) });
      }
    }
    this.getSummary();
  }

  getSummary() {
    var result = [];
    let data = this.filteredValuess.reduce(function (res, value) {
      if (!res[value.sub_org_name]) {
        res[value.sub_org_name] = { sub_org_name: value.sub_org_name, payment_remaining: 0, advanvce_with_sup: 0 };
        result.push(res[value.sub_org_name])
      }
      res[value.sub_org_name].payment_remaining += value.payment_remaining;
      res[value.sub_org_name].advanvce_with_sup += Number(value.payment_done - value.lift_value_gst);
      return res;
    }, {});
    this.localSummaryPayment = result;
    this.TotalRemain = result.reduce((sum, item) => sum + item.payment_remaining, 0)
    this.TotalAdvance = result.reduce((sum, item) => sum + item.advanvce_with_sup, 0)
  }

  // date filter
  onDateSelect($event, name) {
    this.table.filter(this.convert($event), name, 'equals');
  }

  convertToDecimal(value) {
    return value ? parseFloat(value) : Number(value);
  }

  roundToTwo(num) {
    return Math.round(num * 100 + Number.EPSILON) / 100;
  }

  convert(date) {
    if (date) {
      return this.datepipe.transform(date, 'yyyy-MM-dd');
    } else {
      return '';
    }
  }

  // call on each filter set local storage for colums
  @Input() get selectedColumns(): any[] {
    localStorage.setItem('selected_col_local_purchase', JSON.stringify(this._selectedColumns));
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.cols.filter(col => val.includes(col));
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

  // multiselect filter
  CheckForValue(event, name) {
    this.deal_list = this.filteredValuess;
    if (event.target.value) {
      this.deal_list = this.deal_list.filter(item => item[name] <= Number(event.target.value) && item[name] > Number(event.target.value))
    }
  }

  // on your component class declare
  onFilter(event, dt) {
    this.filteredValuess = [];
    this.tot_qty = 0;
    this.tot_rate = 0;
    this.tot_deal_val = 0;
    this.tot_lifting_done = 0;
    this.tot_lifting_remaining = 0;
    this.totalPaymentDone = 0;
    this.totalPaymentRemaining = 0;
    this.filteredValuess = event.filteredValue;

    for (const item of this.filteredValuess) {
      const quantity = item.quantity;
      const amount = item.quantity * item.rate;
      const gst_percent = item.cgst_percent + item.sgst_percent;
      const tcs_percent = item.tcs_percent;
      let lift_qty = 0;

      for (const val of item.LocalPurchaseLiftingDetails) {
        lift_qty += val.quantity;
      }
      const remaining_lifting_qty = quantity - lift_qty;
      this.tot_qty = this.tot_qty + quantity;
      this.totalPaymentDone += item.payment_done;
      this.totalPaymentRemaining += item.payment_remaining;
      this.tot_lifting_done += lift_qty;
      this.tot_lifting_remaining += remaining_lifting_qty;
      this.tot_deal_val = this.tot_deal_val + item.deal_value_gst;
      this.tot_rate = this.tot_deal_val / this.tot_qty;
    }
  }

  setTaxValue() {
    this.crudServices.getOne<any>(PercentageDetails.getOne, { detail_type: 2 }).subscribe(response => {
      response.forEach(element => {
        if (element.percent_type === 'cgst') {
          this.cgst_percent = element.percent_value;
        }

        if (element.percent_type === 'sgst') {
          this.sgst_percent = element.percent_value;
        }

        if (element.percent_type === 'tcs') {
          this.tcs_percent = element.percent_value;
        }

        if (element.percent_type === 'tds') {
          this.tds_percent = element.percent_value;
        }

        if (element.percent_type === 'gst') {
          this.gst_percentege = element.percent_value;
        }
      });
    })
  }

  private getTdsTcsVal(sub_org_id, date): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.crudServices.getOne<any>(SubOrg.getTDSTCSRate, {
        sub_org_id: sub_org_id,
        date: date
      }).subscribe((res) => {
        if (res.status == 200 && res.data.length > 0) {

          resolve(res.data);

        } else {
          resolve(null);
        }
      });

    });
  }

  onAddExtraQty(item) {
    this.extra_quantity = (item.quantity - item.original_quantity);
    this.wholeItem = item;

    this.myExtraModal.show();
  }

  onLiftingShow(item) {
    this.crudServices.getOne<any>(LocalPurchase.getLifting, { id: item.id }).subscribe(response => {
      this.liftingText = `Supplier : ${item.sub_org_name} , Quantity : ${item.quantity}, Rate : ${item.rate} , Grade : ${item.grade_master.grade_name}, Delivery Term : ${item.delivery_term.term} , Payment Term : ${item.PaymentTermName}`;
      this.lifting_data = response;
      this.myLiftingDetails.show();
    })
  }

  onEdit(item) {
    this.getNotifications('EDIT_LOCAL_PURCHASE');
    if (item.deal_type == 0) {
      this.setTaxValue();
      this.onChangeSupplier({ sub_org_id: item['supplier_id'] });
      this.pay_id = item['id'];
      this.godown_id = item['godown_id'];
      this.purchase_holder_id = item['purchase_holder_id'];
      this.supplier_id = item['supplier_id'];
      this.dealDate = item['deal_date'];
      this.quantity = item['quantity'];
      this.rate = item['rate'];
      this.grade_id = item['grade_id'];
      this.term_id = item['term'];
      this.payment_term = item['payment_term'];
      this.mode_of_payment = item['mode_of_payment'];
      this.delivery = item['delivery_term_id'];
      this.dueDate = item['due_date'];
      this.remark = item['remark'];
      this.cgst_percent = item['cgst_percent'];
      this.sgst_percent = item['sgst_percent'];
      this.tcs_percent = item['tcs_percent'];
      this.godown_id_ori = item['godown_id'];
      this.supplier_id_ori = item['supplier_id'];
      this.quantity_ori = item['quantity'];
      this.rate_ori = item['rate'];
      this.grade_id_ori = item['grade_id'];
      this.payment_term_ori = item['payment_term'];
      this.delivery_ori = item['delivery_term_id'];
      this.lifting_qty = 0;
      this.status_lift = item['status_lift'];
      this.status_payment = item['status_payment'];
      this.deal_value_gst = item['deal_value_gst']

      this.addPurchaseForm.patchValue({
        godown_id: item['godown_id'],
        purchase_holder_id: item['purchase_holder_id'],
        supplier_id: item['supplier_id'],
        deal_date: item['deal_date'],
        grade_id: item['grade_id'],
        quantity: item['quantity'],
        rate: item['rate'],
        freight: item['freight'],
        term: item['term'],
        payment_term: item['payment_term'],
        delivery_term: item['delivery_term_id'],
        due_date: item['due_date'],
        mode_of_payment: item['mode_of_payment'],
        remark: item['remark'],
        cgst_percent: item['cgst_percent'],
        sgst_percent: item['sgst_percent'],
        tcs_percent: item['tcs_percent'],
        deal_value_gst: item['deal_value_gst'],
        company_id: item['company_id'],
        delivery_remark: item['delivery_remark'],
        eta: item['eta']
      })

      if (item.LocalPurchaseLiftingDetails) {
        for (let lifting of item.LocalPurchaseLiftingDetails) {
          this.lifting_qty = this.lifting_qty + lifting.quantity;
        }
      }
      if (item.LocalPurchaseLiftingDetails.length > 0 && item.TotalBexAmount > 0 || item.TotalPaymentReqAmt > 0 || item.TotalPaymentReqAmtIlc > 0) {
        this.partyFlag = true;
      }
      this.myModal.show();
    } else if (item.deal_type == 1) {

      this.setTaxValue();
      this.onChangeSupplier({ sub_org_id: item['supplier_id'] });
      this.pay_id = item['id'];
      this.cgst_percent = item['cgst_percent'];
      this.sgst_percent = item['sgst_percent'];
      this.tcs_percent = item['tcs_percent'];
      this.lifting_qty = 0;
      this.status_lift = item['status_lift'];
      this.status_payment = item['status_payment'];

      let orgArr = this.manufacturer.filter(val => val.sub_org_id == item['supplier_id'])

      if (orgArr[0].rel_dca_cs_manufacturers != undefined && orgArr[0].rel_dca_cs_manufacturers) {
        let petro_manufacturer = orgArr[0].rel_dca_cs_manufacturers[0].dca_cs_against_sub_org.org_id;

        this.crudServices.getOne<any>(GradeMaster.getGradeAgainstDCA_CS, { petro_manu_org_id: petro_manufacturer }).subscribe((response) => {
          this.petro_manufacturer_grade = response;
        });
      }

      this.addManufacturerForm.patchValue(
        {
          godown_id: item.godown_id,
          purchase_holder_id: item.purchase_holder_id,
          supplier_id: item.supplier_id,
          deal_date: item.deal_date,
          quantity: item.quantity,
          rate: item.basic_rate_new,
          term: item.term,
          payment_term: item.payment_term,
          delivery_term: item.delivery_term_id,
          grade_id: item.grade_id,
          remark: item.remark,
          mode_of_payment: item.mode_of_payment,
          basic_amount: item.basic_amount,
          freight: item.freight,
          less_cash_discount: item.less_cash_discount,
          less_mou_discount: item.less_mou_discount,
          vendor_ref_number: item.vendor_ref_number,
          less_other_discount: item.less_other_discount,
          deal_value: item.deal_value
        }
      )



      this.calculateManufacturerDealValue();

      if (item.LocalPurchaseLiftingDetails) {

        for (let lifting of item.LocalPurchaseLiftingDetails) {
          this.lifting_qty = this.lifting_qty + lifting.quantity;
        }
      }


      // this.getTCS_TDS_Per(this.supplier_id)
      if (item.LocalPurchaseLiftingDetails.length > 0 && item.TotalBexAmount > 0 || item.TotalPaymentReqAmt > 0 || item.TotalPaymentReqAmtIlc > 0) {
        this.partyFlag = true;
      }
      this.myModalManufacturer.show();

    }






  }

  onDelete(item) {

    if (item.LocalPurchaseLiftingDetails.length == 0 && (item.TotalBexAmount == null || item.TotalBexAmount == 0) && (item.TotalPaymentReqAmt == null || item.TotalPaymentReqAmt == 0) && (item.TotalPaymentReqAmtIlc == null || item.TotalPaymentReqAmtIlc == 0)) {
      this.crudServices.deleteData<any>(LocalPurchase.delete, { id: item.id, local_purchase_id: item.local_purchase_id }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.getDealList();
      });
    } else {
      this.toasterService.pop('warning', 'warning', 'Further Details are updated For this Deal');
    }
  }




  // data exported for pdf excel download
  exportData() {

    let arr = [];
    const foot = {};
    if (this.filteredValuess === undefined) {
      arr = this.deal_list;
    } else {
      arr = this.filteredValuess;
    }

    for (let i = 0; i < arr.length; i++) {
      const export_data = {};
      for (let j = 0; j < this._selectedColumns.length; j++) {
        export_data[this._selectedColumns[j]['header']] = arr[i][this._selectedColumns[j]['field']];

      }
      this.export_purchase_list.push(export_data);


    }

    for (let j = 0; j < this._selectedColumns.length; j++) {
      if (this._selectedColumns[j]['field'] === 'quantity') {
        foot[this._selectedColumns[j]['header']] = this.tot_qty;

      } else if (this._selectedColumns[j]['field'] === 'rate') {
        foot[this._selectedColumns[j]['header']] = this.tot_rate;

      } else if (this._selectedColumns[j]['field'] === 'deal_value_gst') {
        foot[this._selectedColumns[j]['header']] = this.tot_deal_val;

      } else if (this._selectedColumns[j]['field'] === 'lifting_done') {
        foot[this._selectedColumns[j]['header']] = this.tot_lifting_done;

      } else if (this._selectedColumns[j]['field'] === 'lifting_remaining') {
        foot[this._selectedColumns[j]['header']] = this.tot_lifting_remaining;

      }
      else if (this._selectedColumns[j]['field'] === 'payment_done') {
        foot[this._selectedColumns[j]['header']] = this.totalPaymentDone;

      }
      else if (this._selectedColumns[j]['field'] === 'lifting_payment_remainingremaining') {
        foot[this._selectedColumns[j]['header']] = this.totalPaymentRemaining;

      } else {
        foot[this._selectedColumns[j]['header']] = '';
      }
    }

    this.export_purchase_list.push(foot);


  }

  // download doc ,pdf , excel

  exportPdf() {
    this.export_purchase_list = [];
    this.exportData();
    this.exportColumns = this._selectedColumns.map(col => ({ title: col.header, dataKey: col.header }));
    this.exportService.exportPdf(this.exportColumns, this.export_purchase_list, 'Lifting-Details');
  }

  exportExcel() {
    this.export_purchase_list = [];
    this.exportData();
    this.exportService.exportExcel(this.export_purchase_list, 'Lifting-Details');
  }

  getPartyList(event) {


    if (event && event !== undefined) {
      this.crudServices.getOne<any>(SubOrg.get_supplier_perticular_zone, { zone_id: event.id }).subscribe(response => {
        this.sub_org = response;
      });
    } else {
      this.supplier_id = 0;
    }

  }

  getPartyListEdit(id) {

    this.crudServices.getOne<any>(SubOrg.get_supplier_perticular_zone, { zone_id: id }).subscribe(response => {
      this.sub_org = response;
    });

  }

  addNew() {
    this.getNotifications('ADD_LOCAL_PURCHASE');

    this.addPurchaseForm.patchValue({ company_id: this.company_id })
    this.myModal.show();
  }

  addManufecturer() {
    this.myModalManufacturer.show();
  }

  oncloseModal() {


    this.pay_id = '';
    this.addPurchaseForm.reset();
    this.setTaxValue();
    this.myModal.hide();
    this.myExtraModal.hide();
    this.myLiftingDetails.hide();
    this.myQtyKnockofModal.hide();
    this.partyFlag = false;

    this.deal_details = null

    this.mySplitModal.hide();
    this.addsplitForm.reset();
    this.updateModeModal.hide();

    this.addPurchaseForm.patchValue({ company_id: this.company_id })
  }

  oncloseModalManufacturer() {
    this.pay_id = '';
    this.addManufacturerForm.reset();
    this.myModalManufacturer.hide();
  }

  onExtraSubmit() {
    var item = this.wholeItem;
    item.qty = Number(this.addExtraPurchaseForm.value.extra_quantity) + Number(this.wholeItem.quantity)

    console.log(item, this.addExtraPurchaseForm.value.extra_quantity, this.extra_quantity);

    let updated_deal_value = this.calculateDealValue(item)
    this.crudServices.updateData<any>(LocalPurchase.extra_qty_add, {
      entered_qty: Number(this.addExtraPurchaseForm.value.extra_quantity),
      original_quantity: Number(this.wholeItem.original_quantity),
      quantity: Number(this.wholeItem.quantity),
      local_purchase_id: Number(this.wholeItem.id),
      deal_value: Number(updated_deal_value)
    }).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      if (response.code === '100') {
        this.addExtraPurchaseForm.reset();
        this.getDealList();
        this.oncloseModal();
      }
    });
  }

  calculateDealValue(item) {
    // this.getTCS_TDS_Per(item.supplier_id);
    let gst = item.cgst_percent + item.sgst_percent
    if (item.deal_type == 1) {
      let rate = item.rate;

      let basic_amount = item.qty * rate
      let deal_value_gst = 0;

      const deal_gst = ((basic_amount) * gst / 100);
      const deal_value_tds = ((basic_amount) * this.tds_percent / 100);
      deal_value_gst = (basic_amount) + deal_gst - deal_value_tds;

      return deal_value_gst
    } else if (item.deal_type == 0) {

      let quantity = item.qty;
      let rate = item.rate;
      let amount = Number(quantity) * Number(rate);

      let deal_value_gst = 0;

      if (amount > 0) {
        const deal_gst = ((amount) * gst / 100);
        const deal_value_tds = ((amount) * 0.1 / 100);
        deal_value_gst = (amount) + deal_gst - deal_value_tds;
      }
      return deal_value_gst
    }
  }

  pvcUnsoldTotal() {
    if (this.totalAmt >= this.fixedValue && this.addPurchaseForm.value.company_id == 1) {
      this.addPurchaseForm.controls.company_id.patchValue(null);
      this.unsoldTotalMessage = true;
    }
    else {
      this.unsoldTotalMessage = false;
    }
  }


  onSubmit() {
    if (this.company_id == 1) {
      if (this.totalAmt >= this.fixedValue && this.addPurchaseForm.value.company_id == 1) {
        this.addPurchaseForm.controls.company_id.patchValue(null);
        this.unsoldTotalMessage = true;
      }
      else {
        this.unsoldTotalMessage = false;
      }
    }
    let status = 0;
    if (this.godown_id_ori != this.addPurchaseForm.value.godown_id ||
      this.supplier_id_ori != this.addPurchaseForm.value.supplier_id ||
      this.quantity_ori != this.addPurchaseForm.value.quantity ||
      this.rate_ori != this.addPurchaseForm.value.rate ||
      this.grade_id_ori != this.addPurchaseForm.value.grade_id ||
      this.payment_term_ori != this.addPurchaseForm.value.payment_term ||
      this.delivery_ori != this.addPurchaseForm.value.delivery_term) {
      status = 1;
    }


    const data = {
      godown_id: this.addPurchaseForm.value.godown_id,
      purchase_holder_id: this.addPurchaseForm.value.purchase_holder_id,
      supplier_id: this.addPurchaseForm.value.supplier_id,
      deal_date: this.convert(this.addPurchaseForm.value.deal_date),
      quantity: this.addPurchaseForm.value.quantity,
      rate: this.addPurchaseForm.value.rate,
      freight: this.addPurchaseForm.value.freight,
      term: this.addPurchaseForm.value.term,
      payment_term: this.addPurchaseForm.value.payment_term,
      delivery_term: this.addPurchaseForm.value.delivery_term,
      grade_id: this.addPurchaseForm.value.grade_id,
      due_date: this.convert(this.addPurchaseForm.value.due_date),
      remark: this.addPurchaseForm.value.remark,
      cgst_percent: this.cgst_percent,
      sgst_percent: this.sgst_percent,
      tcs_percent: this.tcs_percent,
      mode_of_payment: this.addPurchaseForm.value.mode_of_payment,
      deal_value: this.addPurchaseForm.value.deal_value_gst,
      id: this.pay_id,
      company_id: this.addPurchaseForm.value.company_id,
      delivery_remark: this.addPurchaseForm.value.delivery_remark,
      eta: this.convert(this.addPurchaseForm.value.eta) ? this.convert(this.addPurchaseForm.value.eta) : null,
      is_forward: this.addPurchaseForm.value.is_forward
    }
    this.selectedMobileNo = this.addPurchaseForm.value.mobileMult;
    this.selectedEmails = this.addPurchaseForm.value.emailMult;


    if (this.pay_id !== '' && this.pay_id !== undefined) {
      // On Update Here check for the condition on qty change. If qty increase status should be change for lifting and payment and for qty decrease it will check for lifting and payment status
      let update_satus = 0;

      if (this.addPurchaseForm.value.quantity > this.quantity_ori) {
        if (this.status_lift == 1) {
          data['status_lift'] = 0;
        }

        if (this.status_payment == 1) {
          data['status_payment'] = 0;
        }
        update_satus = 1;
      } else if (this.addPurchaseForm.value.quantity == this.quantity_ori) {

        update_satus = 1;

      } else if (this.addPurchaseForm.value.quantity < this.quantity_ori && this.addPurchaseForm.value.quantity >= this.lifting_qty) {
        update_satus = 1;

        if (this.status_lift == 1 && this.addPurchaseForm.value.quantity > this.lifting_qty) {
          data['status_lift'] = 0;
        } else if (this.addPurchaseForm.value.quantity = this.lifting_qty) {
          data['status_lift'] = 1;
        }
      } else if (this.addPurchaseForm.value.quantity < this.quantity_ori && this.addPurchaseForm.value.quantity < this.lifting_qty) {

        update_satus = 0;
        this.toasterService.pop('info', 'info', 'Already  Lifting Done');
      } else {

        update_satus = 1;
        data['status_lift'] = this.status_lift;
      }

      this.loadingBtn = true;

      if (update_satus == 1) {
        this.crudServices.updateData<any>(LocalPurchase.update, data).subscribe((response) => {
          this.toasterService.pop(response.message, response.message, response.data);
          this.loadingBtn = false;
          if (response.code === '100') {
            let suppname = this.sub_org.find(item => item.sub_org_id == data.supplier_id)
            let notificationdata = {
              "title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
              "body": `Local Purchase updated for ${suppname ? suppname.sub_org_name : ''}, Qty: ${data.quantity}`,
              "click_action": "#"
            }


            this.generateNotification(notificationdata, data.id);
            this.getDealList();

            if (status == 1) {
              this.getDealInfoForPdf(this.pay_id, 1)
            }

            this.oncloseModal();
          }
        });
      } else {
        this.loadingBtn = false;
        this.toasterService.pop('warning', 'Error', 'Deal Not Updated');
      }


    }
    else {

      data['temp_mobile'] = (this.addPurchaseForm.value.mobileMult).toString();
      data['temp_email'] = this.addPurchaseForm.value.emailMult.toString();
      this.crudServices.addData<any>(LocalPurchase.add, data).subscribe((response) => {
        this.toasterService.pop(response.message, response.message, 'New Local Purchase Deal Added');
        if (response.code === '100') {

          let suppname = this.sub_org.find(item => item.sub_org_id == data.supplier_id)
          let notificationdata = {
            "title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
            "body": `Local Purchase added for ${suppname ? suppname.sub_org_name : ''}, Qty: ${data.quantity}`,
            "click_action": "#"
          }

          this.generateNotification(notificationdata, 1);
          this.getDealInfoForPdf(response.data, 0);
          this.getDealList();
          this.oncloseModal();
        }
      });
    }

    let body = {
      l_id: this.pay_id,
      eta_date: this.addPurchaseForm.value.eta
    }
    this.crudServices.addData<any>(LocalPurchase.updateLocalArrival, body).subscribe(response => {
    });
  }


  onSubmitManufacturer() {



    const data = {
      godown_id: this.addManufacturerForm.value.godown_id,
      purchase_holder_id: this.addManufacturerForm.value.purchase_holder_id,
      supplier_id: this.addManufacturerForm.value.supplier_id,
      deal_date: this.convert(this.addManufacturerForm.value.deal_date),
      quantity: this.addManufacturerForm.value.quantity,
      rate: this.addManufacturerForm.value.rate,
      term: this.addManufacturerForm.value.term,
      payment_term: this.addManufacturerForm.value.payment_term,
      delivery_term: this.addManufacturerForm.value.delivery_term,
      grade_id: this.addManufacturerForm.value.grade_id,
      remark: this.addManufacturerForm.value.remark,
      cgst_percent: this.cgst_percent,
      sgst_percent: this.sgst_percent,
      tcs_percent: this.tcs_percent,
      mode_of_payment: this.addManufacturerForm.value.mode_of_payment,
      basic_amount: this.addManufacturerForm.value.basic_amount,
      freight: this.addManufacturerForm.value.freight,
      less_cash_discount: this.addManufacturerForm.value.less_cash_discount ? this.addManufacturerForm.value.less_cash_discount : 0,
      less_mou_discount: this.addManufacturerForm.value.less_mou_discount ? this.addManufacturerForm.value.less_mou_discount : 0,
      vendor_ref_number: this.addManufacturerForm.value.vendor_ref_number,
      less_other_discount: this.addManufacturerForm.value.less_other_discount ? this.addManufacturerForm.value.less_other_discount : 0,
      deal_value: this.addManufacturerForm.value.deal_value,
      deal_type: 1, //Manufacturer deal 0-> Local , 1-> Manufacturer
      company_id: 2 // for ssurisha

    }

    if (this.pay_id !== '' && this.pay_id !== undefined) {
      // On Update Here check for the condition on qty change. If qty increase status should be change for lifting and payment and for qty decrease it will check for lifting and payment status
      data['id'] = this.pay_id;
      let update_satus = 0;
      if (this.addPurchaseForm.value.quantity > this.quantity_ori) {
        if (this.status_lift == 1) {
          data['status_lift'] = 0;
        }

        if (this.status_payment == 1) {
          data['status_payment'] = 0;
        }
        update_satus = 1;
      } else if (this.addPurchaseForm.value.quantity < this.quantity_ori) {
        if (this.status_lift == 1 && this.status_payment == 1) {
          this.toasterService.pop('info', 'info', 'Already Lifting/Payment Done');
          update_satus = 0;
        }
        if (this.status_lift == 0 && this.status_payment == 0) {
          let qty = this.addPurchaseForm.value.quantity - this.quantity_ori;
          if (qty > this.lifting_qty) {
            update_satus = 1;

          } else {
            update_satus = 0;
            this.toasterService.pop('info', 'info', 'Already Lifting Done');
          }

        }

      } else {
        update_satus = 1;
        data['status_lift'] = this.status_lift;
      }

      this.loadingBtn = true;

      if (update_satus == 1) {
        this.crudServices.updateData<any>(LocalPurchase.update, data).subscribe((response) => {
          this.toasterService.pop(response.message, response.message, response.data);
          this.loadingBtn = false;
          if (response.code === '100') {

            this.getDealList();

            this.oncloseModalManufacturer();
          }
        });
      }


    } else {
      this.crudServices.addData<any>(LocalPurchase.add, data).subscribe((response) => {
        this.selectedMobileNo = [];
        this.selectedEmails = [];
        if (response.code === '100') {
          this.toasterService.pop(response.message, response.message, ' Deal Added');
          this.getDealList();
          this.getDealInfoForPdf(response.data, 0); // Not to customers
          this.oncloseModalManufacturer();
        } else {
          this.toasterService.pop(response.message, response.message, response.data);
        }
      });

    }





  }

  calculateManufacturerDealValue() {



    let rate = this.addManufacturerForm.value.rate;
    let freight = this.addManufacturerForm.value.freight;
    let less_cash_discount = this.addManufacturerForm.value.less_cash_discount;
    let less_mou_discount = this.addManufacturerForm.value.less_mou_discount;

    let less_other_discount = this.addManufacturerForm.value.less_other_discount;
    let basic_rate = Number(rate) + Number(freight) - Number(less_cash_discount) - Number(less_mou_discount) - Number(less_other_discount)

    let basic_amount = this.addManufacturerForm.value.quantity * basic_rate

    let deal_value_gst = 0;
    let gst_amount = 0;
    let tds_amount = 0;
    let invoice_amount = 0;

    const deal_gst = ((basic_amount) * this.gst_percentege / 100);
    const deal_value_tds = ((basic_amount) * this.tds_percent / 100);
    deal_value_gst = (basic_amount) + deal_gst - deal_value_tds;

    gst_amount = deal_gst;
    tds_amount = deal_value_tds;
    invoice_amount = basic_amount + deal_gst;
    this.addManufacturerForm.patchValue({ basic_amount: basic_amount, deal_value: deal_value_gst, gst_amount: gst_amount, tds_amount: tds_amount, invoice_amount: invoice_amount, basic_rate: basic_rate })
  }

  getDealInfoForPdf(id, mode) {
    this.crudServices.getOne<any>(LocalPurchase.getAll, { id: id }).
      pipe(map((LocalPurchase) => {
        return LocalPurchase.map((element) => {
          if (element.deal_type == 1) {
            element.rate = Number(element.rate) + Number(element.freight) - Number(element.less_cash_discount) - Number(element.less_mou_discount) - Number(element.less_other_discount)
          }

          element.gst_percentege = this.gst_percentege ? this.gst_percentege : 0;
          element.delivery_term.term = element.delivery_term_id == 1 ? 'F.O.R. Delivered' : 'Ex-Godown';
          element.deliveryText = element.delivery_term_id == 1 ? 'Seller is liable for Eway Bill generation' : 'Buyer is liable for Eway Bill generation'
          element.tcs_percent = 0
          element.tds_percent = 0.1;
          element.unitName = element.grade_master ? element.grade_master.unit_mt_drum_master.name : null;
          element.product_name = element.product_master ? element.product_master.name : '';
          element.stateName = element.sub_org_master.state_master ? element.sub_org_master.state_master.name : '';
          element.godown_address = element.godown ? element.godown.godown_address : '';
          element.godown_gst_no = element.godown ? element.godown.gst_no : null;
          element.mode = mode,
            element.product_type_name = element.company_id == 1 ? 'PVC Resin' : element.company_id == 2 ? element.product_name + ' Granules' : '';
          return element;
        });
      })
      ).subscribe((response) => {
        let fileData = new FormData();
        this.GenPdfService.generatePOCopy(response[0], mode).then(async (pdfObj) => {
          let pdfOBjFromData = pdfObj;
          await pdfMake.createPdf(pdfOBjFromData).getBlob((pdf_data) => {
            if (pdf_data) {
              fileData.append('purchase_order_pdf', pdf_data, `PO_${id}.pdf`);
              this.pdfFileUpload(fileData, response[0])
            }
          });
        })
      })
  }

  pdfFileUpload(fileData, details) {
    this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
      let path = res.uploads.purchase_order_pdf[0].location;
      if (path) {
        let purchase_order_no = `${this.getCurrentFinancialYear()}/SPIPL/PO/${details.id}`
        this.crudServices.updateData(LocalPurchase.updatePOCopy, { id: details.id, data: { po_copy: path, purchase_order_no: purchase_order_no } }).subscribe((result) => {
          this.toasterService.pop('success', 'New Order Generated!', 'New Order Generated!')
          this.sendEmail(details);
          this.sendWhatsApp(details, path)
        });
      }
    });
  }

  getCurrentFinancialYear() {
    var financial_year = "";
    var today = new Date();
    if ((today.getMonth() + 1) <= 3) {
      financial_year = (today.getFullYear() - 1).toString().substring(2, 4) + "-" + today.getFullYear().toString().substring(2, 4);
    } else {
      financial_year = today.getFullYear().toString().substring(2, 4) + "-" + (today.getFullYear() + 1).toString().substring(2, 4)
    }
    return financial_year;
  }

  sendEmail(data) {
    let date = new Date();
    if (this.selectedEmails.length > 0) {
      this.GenPdfService.generatePOCopy(data, data.mode).then(async (pdfObj) => {
        pdfMake.createPdf(pdfObj).getBase64((data) => {
          if (data) {
            let emailBody = {
              thepdf: data,
              tomail: this.selectedEmails,
              subject: `PO ORDER- Date:${this.datepipe.transform(date, 'dd/MM/yyyy')}`,
              bodytext: `Dear Sir / Madam, 
							Good Day.
							Kindly find below the Attachment for the details of Your Purchase Order ,
							We request you to kindly update the same in your records.
							Thank you for your kind cooperation in advance.
							Regards,
							SParmar.`,
              filename: 'Purchase_order.pdf',
              company_id: data.company_id
            }
            this.crudServices.postRequest<any>(Consignments.sendReportMail, emailBody)
              .subscribe((response) => {
                this.toasterService.pop('success', 'PURCHASE ORDER MAIL SEND SUCCESS!', 'PURCHASE ORDER MAIL SEND SUCCESS!')
              });
          }
        })
      })
    }

  }

  sendWhatsApp(element, path) {

    let id = element.id;
    let mode = '';
    if (element.mode == 1) {
      mode = "(Revised)"
    }
    id += element.vendor_ref_number ? ` (${element.vendor_ref_number})` : '' + mode;

    let sendHeads = [id, element.sub_org_name, element.grade_master.grade_name, element.quantity, element.rate, element.delivery_term.term, element.godown.godown_address != null ? element.godown.godown_address : ' ', element.PaymentTermName];

    let official_numbers = []


    if (element.company_id == 1) {
      official_numbers = this.magangementSPIPLWhatsappNumbers;
    }
    if (element.company_id == 2) {
      official_numbers = this.magangementSSurishaWhatsappNumbers;
    }



    this.crudServices.postRequest<any>(LocalPurchase.sendSMS, [{
      "template_name": 'spipl_purchase_confirmation',
      "locale": "en",
      "numbers": [...this.selectedMobileNo, ...official_numbers],
      "params": sendHeads,
      'attachment': [
        {
          "caption": `${element.sub_org_name}`,
          "filename": `PO-details ${element.id}`,
          "url": path
        }
      ]
    }]).subscribe(res => {

      this.toasterService.pop('success', 'WhatsApp  Notification !', 'WhatsApp Notification !')
    })
  }



  getLiftingDetails(item) {
    this.router.navigate([]).then(result => { window.open('/#/local-purchase/local-purchase-lifting/' + item.id, '_blank'); });

  }



  getstatus(val) {
    if (val >= 100) {
      return 'Pending ';
    } else {
      return 'Completed';
    }
  }



  getTerm(id) {

    switch (id) {
      case 1: {
        return '+GST+TCS ';
        break;
      }

      case 2: {
        return '+GST+Frt+TCS ';
        break;
      }

      case 3: {
        return '+GST-TDS ';
        break;
      }
    }

  }


  cancelQty(item) {
    item.qty = item.quantity - item.lifting_remaining;
    let deal_value = this.calculateDealValue(item)
    if (item) {
      if (confirm('Are you sure to Cancel the Remaining Quantity')) {
        this.crudServices.updateData<any>(LocalPurchase.cancelDealQuantity, { local_purchase_id: item.id, deal_value: deal_value }).subscribe(response => {
          this.toasterService.pop(response.message, response.message, response.data);
          this.getDealList();
        });
      }
    }

  }

  splitQty(item) {
    this.deal_details = item;
    this.addsplitForm.patchValue({ quantity: item.lifting_remaining });
    this.getAllEmailsContactsSplit(item.supplier_id)
    this.splitGrades = this.grade_list.filter(grades => grades.grade_id != item.grade_id);
    this.mySplitModal.show()

  }

  knockOfQuantity(item) {
    this.deal_details = item;
    this.knockOfQtyForm.patchValue({ knock_of_qty: item.lifting_remaining });
    this.myQtyKnockofModal.show()

  }

  checkQtyKnockof() {
    let knock_of_qty = this.knockOfQtyForm.value.knock_of_qty;
    let remaining_qty = this.deal_details.lifting_remaining - this.knockOfQtyForm.value.knock_of_qty

    if (remaining_qty < 0) {
      this.toasterService.pop('Warning', 'warning', "Quantity Can't be more to remaining quantity");
      this.knockOfQtyForm.patchValue({ knock_of_qty: this.deal_details.lifting_remaining })
    }

  }

  onSubmitKnockOffQty() {
    var item = this.deal_details;
    let quantity = item.quantity - this.knockOfQtyForm.value.knock_of_qty
    let remaining_qty = item.lifting_remaining - this.knockOfQtyForm.value.knock_of_qty
    let data = {
      quantity: quantity,
      knock_of_qty: this.knockOfQtyForm.value.knock_of_qty
    }

    if (remaining_qty == 0) {
      data['status_lift'] = 1

    }


    this.crudServices.updateData<any>(LocalPurchase.knock_of_qty, {
      data: data, id: item.id
    }).subscribe((response) => {
      this.toasterService.pop(response.message, response.message, response.data);
      if (response.code === '100') {
        this.getDealList();
        this.oncloseModal();
      }
    });
  }

  getAllEmailsContactsSplit(suborgId) {

    this.EmailData = []
    this.MobileData = []
    this.selectedEmails = []
    this.selectedMobileNo = []
    this.defaultContactPerson = null
    this.crudServices.getOne(Consignments.getAllContactsEmailBySubOrg, { sub_org_id: suborgId }).subscribe(result => {


      if (result['data'].length > 0) {
        result['data'].map(result => {

          if (result.email_id) {
            const found = this.EmailData.some(el => el.email_id == result.email_id);
            if (!found) {
              this.EmailData.push({ email_id: result.email_id, name: result.person_name });
              this.selectedEmails.push(result.email_id);
              this.addsplitForm.patchValue({ emailMult: this.selectedEmails });

            }
          }

          if (result.is_default_person == 1) {
            this.defaultContactPerson = result;
          }
        });
      }
    });


    this.crudServices.getOne(Consignments.getAllContactsNumberBySubOrg, { sub_org_id: suborgId }).subscribe(result => {

      if (result['data'].length > 0) {
        result['data'].map(result => {
          if (result.contact_no) {
            let mobile_no = result.contact_no.trim();
            const found2 = this.MobileData.some(el => el.contact_no.trim() === mobile_no);
            if (!found2) {
              if (/^\d{10}$/.test(mobile_no)) {
                this.MobileData.push({ contact_no: mobile_no, name: result.person_name });
                this.selectedMobileNo.push(mobile_no)
                this.addsplitForm.patchValue({ mobileMult: this.selectedMobileNo });
              }
            }
          }
          if (result.is_default_person == 1) {
            this.defaultContactPerson = result;
          }
        });
      }
    });

  }



  onSplitDeal() {

    if (this.deal_details != undefined) {
      let qty_remain = this.deal_details.quantity - this.addsplitForm.value.quantity;
      this.deal_details.qty = qty_remain;


      let data = {
        quantity: qty_remain,
        split_qty: this.addsplitForm.value.quantity
      }

      if (this.deal_details.lifting_remaining == this.addsplitForm.value.quantity) {
        data['status_lift'] = 1
      }


      let deal_value = this.calculateDealValue(this.deal_details)
      if (deal_value) {
        data['deal_value'] = deal_value
      }

      this.selectedMobileNo = this.addsplitForm.value.mobileMult;
      this.selectedEmails = this.addsplitForm.value.emailMult;

      if (this.deal_details) {
        if (confirm('Are you sure to Split the Remaining Quantity')) {
          this.crudServices.updateData<any>(LocalPurchase.updateSplitDetails, { local_purchase_id: this.deal_details.id, data: data }).subscribe(response => {
            if (response.code === '100') {
              this.getDealInfoForPdf(this.deal_details.id, 0);
              this.createSplitDeal(this.deal_details)
            }

          });
        }
      }

    }

  }

  createSplitDeal(item) {


    item.qty = this.addsplitForm.value.quantity;
    let deal_value = this.calculateDealValue(item)

    const data = {
      godown_id: item.godown_id,
      purchase_holder_id: item.purchase_holder_id,
      supplier_id: item.supplier_id,
      deal_date: this.convert(item.deal_date),
      quantity: this.addsplitForm.value.quantity,
      original_quantity: this.addsplitForm.value.quantity,
      rate: item.rate,
      term: item.term,
      payment_term: item.payment_term,
      delivery_term: item.delivery_term_id,
      grade_id: this.addsplitForm.value.grade_id,
      due_date: this.convert(item.due_date),
      remark: item.remark,
      cgst_percent: item.cgst_percent,
      sgst_percent: item.sgst_percent,
      tcs_percent: item.tcs_percent,
      mode_of_payment: item.mode_of_payment,
      deal_value: deal_value,
      company_id: item.company_id,
      basic_amount: this.addsplitForm.value.quantity * item.rate,
      less_cash_discount: item.less_cash_discount,
      less_mou_discount: item.less_mou_discount,
      vendor_ref_number: item.vendor_ref_number,
      less_other_discount: item.less_other_discount,
      split_parent_id: item.id,
      deal_type: item.deal_type, //Manufacturer deal 0-> Local , 1-> Manufacturer

    }

    this.crudServices.addData<any>(LocalPurchase.add, data).subscribe((response) => {

      if (response.code === '100') {
        this.toasterService.pop(response.message, response.message, ' Deal Split');
        this.oncloseModal()
        this.getDealList();
        this.getDealInfoForPdf(response.data, 1); // Not to customers

      } else {
        this.toasterService.pop(response.message, response.message, response.data);
      }
    });


  }




  // for all check box check
  onCheckAll(checked) {

    let arr = [];
    if (this.filteredValuess === undefined) {
      arr = this.deal_list;
    } else {
      arr = this.filteredValuess;
    }
    if (checked) {
      this.inputs.forEach(check => {
        check.nativeElement.checked = true;
      });
      for (const val of arr) {
        if (val.payment_remaining > 0 && this.findInarray(val.mode_of_payment, 2)) {
          this.checkedList.push(val);
        }

      }

    } else {
      this.inputs.forEach(check => {
        check.nativeElement.checked = false;
      });
      for (const val of arr) {
        if (val.payment_remaining > 0 && this.findInarray(val.mode_of_payment, 2)) {
          this.checkedList.splice(this.checkedList.indexOf(val), 1);
        }
      }
    }

    this.checkSelection();

  }


  // set check item list
  onCheck(checked, item) {
    this.checkstatus = false;
    if (checked) {
      this.checkedList.push(item);
    } else {
      this.checkedList.splice(this.checkedList.indexOf(item), 1);
    }
    this.checkSelection();

  }

  checkSelection() {
    if (this.checkedList.length > 0) {
      for (let i = 0; i < this.checkedList.length; i++) {
        if (this.checkedList[0]['supplier_id'] === this.checkedList[i]['supplier_id']) {
          this.checkstatus = true;
        } else {
          this.checkstatus = false;
          break;
        }
      }
      if (this.checkstatus) {
        //  this.generatePiFlag = true;
      } else {
        this.toasterService.pop('error', 'warning', 'Supplier Not Same ');
      }
    }
  }


  generate_pi() {
    this.dealArrayForPI = this.checkedList;
    let status = false;
    for (let val of this.checkedList) {
      if (val.payment_remaining > 0 && (val.modeOfPaymentName == "LC" || val.modeOfPaymentName == "RTGS/NEFT,LC") && this.findInarray(val.mode_of_payment, 2)) {
        status = true;
      } else {
        status = false;
      }
    }

    if (status) {
      this.generatePiFlag = true;
    } else {
      this.uncheckAll();
      this.checkedList = [];
      this.toasterService.pop('warning', 'warning', 'Please Select LC Deals with Balance Amount')
    }
  }

  uncheckAll() {

    this.inputs.forEach(check => {
      check.nativeElement.checked = false;
    });
  }

  BackFromPi(event) {
    this.checkedList = [];
    this.generatePiFlag = event;
    this.checkstatus = false;
  }

  findInarray(modeOfPay: any[], val) {

    return modeOfPay.find(x => x === val); // three
  }

  whatsappDetails(item) {
    this.toWhatsappArr = [];
    this.toEmailArr = [];


    this.crudServices.getOne<any>(SubOrg.getSubOrgByContactEmail, { supplier_id: item.supplier_id }).subscribe(res => {


      if (res) {
        this.toWhatsappArr = res.number;
        this.toEmailArr = res.email;

        this.messageText = `Supplier : ${item.sub_org_name} ,<br> Location :${item.godown.godown_address != null ? item.godown.godown_address : ' '} , <br> Quantity : ${item.quantity}, <br> Rate : ${item.rate} , <br> Grade : ${item.grade_master.grade_name}, <br> Delivery Term : ${item.delivery_term.term} , <br> Payment Term : ${item.PaymentTermName}`;
        this.whatsappData = item

        this.sendWhatappModal.show();
      }
    })
  }


  onCloseSms() {


    this.isLoadingSMS = false;
    this.sendWhatappModal.hide();
    this.getDealList();


  }

  sendSMS() { // Manual Whastapp  Send and Email send


    this.isLoadingSMS = true
    let num = this.toWhatsappArr;
    let email = this.toEmailArr;
    let path = ''


    let element = this.whatsappData;

    let sendHeads = [element.id, element.sub_org_name, element.grade_master.grade_name, element.quantity, element.rate, element.delivery_term.term, element.godown.godown_address != null ? element.godown.godown_address : ' ', element.PaymentTermName];

    if (element.po_copy && (num.length || email.length)) {
      path = element.po_copy

      if (num.length) {
        this.crudServices.postRequest<any>(LocalPurchase.sendSMS, [{
          "template_name": 'spipl_purchase_confirmation',
          "locale": "en",
          "numbers": num,
          "params": sendHeads,
          'attachment': [
            {
              "caption": `${element.sub_org_name}`,
              "filename": `PO-details ${element.id}`,
              "url": path
            }
          ]
        }]).subscribe(res => {
          this.isLoadingSMS = false
          this.onCloseSms();
          this.toasterService.pop('success', 'WhatsApp  Notification !', 'WhatsApp Notification !')
        })
      }

      if (email.length) {
        this.sendManualMailPo(path, email, element)

      }


    } else if (element.po_copy == null || element.po_copy == '' && (num.length || email.length)) {
      element.id = element.split_parent_id ? element.split_parent_id : element.id;
      if (element.deal_type == 1) {
        element.rate = Number(element.rate) + Number(element.freight) - Number(element.less_cash_discount) - Number(element.less_mou_discount) - Number(element.less_other_discount)
      }

      element.gst_percentege = this.gst_percentege ? this.gst_percentege : 0;
      element.delivery_term.term = element.delivery_term_id == 1 ? 'F.O.R. Delivered' : 'Ex-Godown';
      element.deliveryText = element.delivery_term_id == 1 ? 'Seller is liable for Eway Bill generation' : 'Buyer is liable for Eway Bill generation'
      element.tcs_percent = 0
      element.tds_percent = 0.1;
      element.unitName = element.grade_master ? element.grade_master.unit_mt_drum_master.name : null;
      element.hsn_code = element.product_master ? element.product_master.hsn_code : null;
      element.product_name = element.product_master ? element.product_master.name : '';
      element.stateName = element.sub_org_master.state_master ? element.sub_org_master.state_master.name : '';
      element.godown_address = element.godown ? element.godown.godown_address : '';
      element.godown_gst_no = element.godown ? element.godown.gst_no : null;

      element.product_type_name = element.company_id == 1 ? 'PVC Resin' : element.company_id == 2 ? element.product_name + ' Granules' : '';

      let fileData = new FormData();
      this.GenPdfService.generatePOCopy(element, 0).then(async (pdfObj) => {
        let pdfOBjFromData = pdfObj;

        await pdfMake.createPdf(pdfOBjFromData).getBlob((pdf_data) => {
          if (pdf_data) {
            fileData.append('purchase_order_pdf', pdf_data, `PO_${element.id}.pdf`);
            this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
              let path = res.uploads.purchase_order_pdf[0].location;
              if (path) {
                this.crudServices.updateData(LocalPurchase.updatePOCopy, { id: element.id, data: { po_copy: path } }).subscribe((result) => {
                  this.toasterService.pop('success', 'PO Generated!', 'PO Generated!')

                  this.crudServices.postRequest<any>(LocalPurchase.sendSMS, [{
                    "template_name": 'spipl_purchase_confirmation',
                    "locale": "en",
                    "numbers": num,
                    "params": sendHeads,
                    'attachment': [
                      {
                        "caption": `${element.sub_org_name}`,
                        "filename": `PO-details ${element.id}`,
                        "url": path
                      }
                    ]
                  }]).subscribe(res => {
                    this.isLoadingSMS = false

                    this.toasterService.pop('success', 'WhatsApp  Notification !', 'WhatsApp Notification !')
                  })

                  if (email.length) {
                    this.sendManualMailPo(path, email, element)

                  }

                  this.onCloseSms();
                });
              }
            });
          }
        });
      })

    } else {
      this.isLoadingSMS = false
      this.toasterService.pop('warning', 'warning', 'No Number Entered')
    }

  }


  sendManualMailPo(path, email, element) {
    let html = `Dear Sir / Madam, 
    Good Day.
    Kindly find below the Attachment for the details of Your Purchase Order ,
    We request you to kindly update the same in your records.
    Thank you for your kind cooperation in advance.
    Regards,
    SParmar.`;
    let date = new Date();

    let attachment = []

    attachment.push({ 'filename': 'Purchase_order.pdf', 'path': path })
    let arr = { 'to': email, 'subject': `PO ORDER- Date:${this.datepipe.transform(date, 'dd/MM/yyyy')}`, 'html': html, attachments: attachment };

    this.isLoadingMail = true;
    this.crudServices.postRequest<any>(LocalPurchase.sendPoMail, { mail_object: arr, company_id: element.company_id }).subscribe(response => {
      this.isLoadingSMS = false
      this.onCloseSms();
      this.toasterService.pop('success', 'Email!', 'Email Sent Success !')
    })
  }



  getAllEmailsContacts(suborgId) {

    this.EmailData = []
    this.MobileData = []
    this.selectedEmails = []
    this.selectedMobileNo = []
    this.defaultContactPerson = null
    this.crudServices.getOne(Consignments.getAllContactsEmailBySubOrg, { sub_org_id: suborgId }).subscribe(result => {


      if (result['data'].length > 0) {
        result['data'].map(result => {

          if (result.email_id) {
            const found = this.EmailData.some(el => el.email_id == result.email_id);
            if (!found) {
              this.EmailData.push({ email_id: result.email_id, name: result.person_name });
              this.selectedEmails.push(result.email_id);
              this.addPurchaseForm.patchValue({ emailMult: this.selectedEmails });

            }
          }
          // if (result.contact_no) {
          //   const found2 = this.MobileData.some(el => el.contact_no === result.contact_no);
          //   if (!found2) {
          //     this.MobileData.push({ contact_no: result.contact_no, name: result.person_name });
          //     this.selectedMobileNo.push(result.contact_no);
          //     this.addPurchaseForm.patchValue({ mobileMult: this.selectedMobileNo });
          //   }
          // }
          if (result.is_default_person == 1) {
            this.defaultContactPerson = result;
          }
        });
      }
    });


    this.crudServices.getOne(Consignments.getAllContactsNumberBySubOrg, { sub_org_id: suborgId }).subscribe(result => {

      if (result['data'].length > 0) {
        result['data'].map(result => {
          if (result.contact_no) {
            let mobile_no = result.contact_no.trim();
            const found2 = this.MobileData.some(el => el.contact_no.trim() === mobile_no);
            if (!found2) {
              if (/^\d{10}$/.test(mobile_no)) {
                this.MobileData.push({ contact_no: mobile_no, name: result.person_name });
                this.selectedMobileNo.push(mobile_no)
                this.addPurchaseForm.patchValue({ mobileMult: this.selectedMobileNo });
              }
            }
          }
          if (result.is_default_person == 1) {
            this.defaultContactPerson = result;
          }
        });
      }
    });

  }

  async addNewEmails(value: string) {
    this.isLoading = true;
    await this.crudServices.getOne(Consignments.checkEmailExists, { email: value, sub_org_id: this.sub_org_id }).
      subscribe(async result => {
        if (result['code'] == 100 && result['data'].length > 0) {
          this.isLoading = false;
          this.toasterService.pop('success', 'Allready Exist ', 'Allready Exist This Email');
          return
        }
        else {
          if (this.defaultContactPerson == null || this.defaultContactPerson == undefined) {


            let body = {
              sub_org_id: this.sub_org_id,
              person_name: 'default Contact',
              designation_id: 1,
              email: value,
              is_default_person: 1,
              sales: 1,
              contact_number: []
            }
            return this.crudServices.addData(orgContactPerson.addOrgContactPersonBySalesOrPurchase, body).subscribe(contact => {
              if (contact['code'] == 100 && contact['data'].length > 0) {
                this.isLoading = false;
                this.toasterService.pop('success', 'New Email Added As a Default ');
                this.getAllEmailsContacts(this.sub_org_id);
              }
            });


          } else {

            return await this.crudServices.addData(MainContact.addEmailAgainstContactPerson, { email_id: value, contact_id: this.defaultContactPerson.cont_id, sub_org_id: this.sub_org_id, sales: 1 }).subscribe(data => {

              this.toasterService.pop('success', 'New Email  Added');
              this.isLoading = false;
              this.getAllEmailsContacts(this.sub_org_id);
            })


          }
        }
      });
  }


  async addNewMobileNumbers(value: number) {
    return await this.crudServices.getOne(Consignments.checkMobileExists, { contact_no: value, sub_org_id: this.sub_org_id }).
      subscribe(async result => {
        if (result['code'] == 100 && result['data'].length > 0) {
          this.toasterService.pop('success', 'Allready Exist ', 'Allready Exist this Number');
          return
        }
        if (this.defaultContactPerson == null || this.defaultContactPerson == undefined) {

          let body = {
            sub_org_id: this.sub_org_id,
            person_name: 'default Contact',
            designation_id: 1,
            email: null,
            contact_number: [{ contact_no: value }],
            is_default_person: 1,
            sales: 1
          }
          return this.crudServices.addData(orgContactPerson.addOrgContactPersonBySalesOrPurchase, body).subscribe(contact => {
            if (contact['code'] == 100 && contact['data'].length > 0) {
              this.getAllEmailsContacts(this.sub_org_id)
              this.toasterService.pop('success', 'New Email Added As a Default ');
            }
          })


          // await this.MainContactService.addContactPerson(this.sub_org_id, 'default Contact', '1', '', value, 1).subscribe(contact => {
          //   if (contact['code'] == 100 && contact['data'].length > 0) {
          //     this.selectedMobileNo.push(value);
          //     this.addPurchaseForm.patchValue({ mobileMult: this.selectedMobileNo });
          //     this.toasterService.pop('success', 'New Email Added As a Default ');
          //   }
          // });


        }
        else {
          return await this.crudServices.addData(MainContact.addContactNumberAgainstContactPerson, { sub_org_id: this.sub_org_id, contact_no: value, cont_id: this.defaultContactPerson.cont_id, sales: 1 }).subscribe(data => {
            if (data['code'] == 100 && data['data'].length > 0) {
              this.toasterService.pop('success', 'New Mobile Number  Added');
              this.getAllEmailsContacts(this.sub_org_id)
            }
          });
          // return await this.crudServices.addData(MainContact.addContactNumberAgainstContactPerson, { contact_no: value, cont_id: this.defaultContactPerson.cont_id }).subscribe(data => {
          //   if (data['code'] == 100 && data['data'].length > 0) {
          //     this.selectedMobileNo.push(value);
          //     this.addPurchaseForm.patchValue({ mobileMult: this.selectedMobileNo });
          //     this.toasterService.pop('success', 'New Mobile Number  Added');
          //   }
          // });
        }
      });
  }

  sendMail() {
    this.getTemplate();
    if (this.checkedList.length) {
      let status = false;
      let subId = 0;
      if (this.checkedList.length) {
        for (let i = 0; i < this.checkedList.length; i++) {
          if (this.checkedList[0]['supplier_id'] == this.checkedList[i]['supplier_id']) {
            status = true;
            subId = this.checkedList[0]['supplier_id'];
          } else {
            status = false;
            break;
          }
        }
        if (status) {
          this.crudServices.getOne<any>(SubOrg.getSubOrgByContactEmail, { supplier_id: subId }).subscribe(res => {
            if (res) {
              for (let email of res) {
                if (email.org_contact_emails != null) {
                  for (let mail of email.org_contact_emails) {
                    this.maillist.push(mail.email_id);
                  }
                }

              }
            }
          })
          // for(let val of this.checkedList) {
          //   if(val.LocalPurchaseLiftingDetails.length) {
          //     for(let lift of val.LocalPurchaseLiftingDetails) {
          //       this.lifting_list.push(lift);
          //     }
          //   }
          // }

          // for(let val of this.checkedList) {

          //   if(val.LocalPurchasePaymentDetails.length) {


          //     for(let pay of val.LocalPurchasePaymentDetails) {
          //       this.payment_list.push(pay);
          //     }
          //   }
          // }
          this.myModalMail.show();
        } else {
          this.toasterService.pop('warning', 'warning', 'Please Select Record Which is Pending')
        }

      } else {
        this.toasterService.pop('warning', 'warning', 'Please Select Record ')
      }
    }
  }

  // set mail variable for to and cc
  mailto(check, val) {
    this.tomailtext = '';
    if (check) {
      this.tomail.push(val);
    } else {
      this.tomail.splice(this.tomail.indexOf(val), 1);
    }

    for (let i = 0; i < this.tomail.length; i++) {
      this.tomailtext = this.tomailtext + this.tomail[i] + ',';
    }

  }


  ccmail(check, val) {

    this.ccmailtext = '';
    if (check) {
      this.ccMail.push(val);
    } else {
      this.ccMail.splice(this.ccMail.indexOf(val), 1);
    }

    for (let i = 0; i < this.ccMail.length; i++) {
      this.ccmailtext = this.ccmailtext + this.ccMail[i] + ',';
    }
  }

  ccmailvalue($e) {
    this.ccmailtext = $e.target.value;
  }

  tomailvalue($e) {
    this.tomailtext = $e.target.value;
  }

  closeModal() {
    this.checkedList = [];
    this.maillist = [];
    this.tomail = [];
    this.ccMail = [];
    this.subject = '';
    this.template = '';
    this.footer = '';
    this.myModal.hide();
    this.myModalMail.hide();
    this.selectedMobileNo = [];
    this.uncheckAll();
    this.getDealList();

  }

  composeMail() {

    if (this.checkedList.length > 0 && this.tomailtext !== undefined && this.tomailtext !== '') {
      let html_lift = '';
      let html_pay = '';
      let template_html = '';
      let arr = {};
      const non_id = [];
      let id = [];
      let sub_org = this.checkedList[0]['sub_org_name'];

      for (let val of this.checkedList) {
        id.push(val.id);
      }

      const to = this.tomailtext;
      const cc = this.ccmailtext;

      if (this.lifting_list) {
        html_lift += '<h4>Lifting Details</h4>'
        for (let i = 0; i < this.checkedList.length; i++) {
          let element = this.checkedList[i];
          if (element.LocalPurchaseLiftingDetails.length) {
            html_lift += `Con ID: ${element.id} , Quantity: ${element.quantity} MT , Rate: ${element.rate} , Grade: ${element.grade_name} , Destination: ${element.godown_name}`;

            html_lift = html_lift + '<table id="table"><tr><th>Sr.No</th><th>Invoice No.</th><th>Invoice Date.</th> <th>Truck No</th><th>Quantity Lift</th></tr>';
            for (let j = 0; j < element.LocalPurchaseLiftingDetails.length; j++) {


              let lift = element.LocalPurchaseLiftingDetails[j];

              html_lift = html_lift + `<tr><td> ${Number(i + 1)} </td><td> ${lift.purchase_invoice_no} </td><td> ${this.datepipe.transform(lift.purchase_invoice_date, 'dd/MM/yyyy')} </td><td> ${lift.truck_no} </td><td> ${lift.quantity} MT </td>`;
            }
            html_lift = html_lift + '</table>';
          }
        }
      }
      if (this.payment_list) {
        html_pay += '<h4>Payment Details</h4>'
        for (let i = 0; i < this.checkedList.length; i++) {
          let element = this.checkedList[i];
          if (element.LocalPurchasePaymentDetails.length) {
            html_pay += `Con ID: ${element.id} , Quantity: ${element.quantity} MT , Rate: ${element.rate} , Grade: ${element.grade_name} , Destination: ${element.godown_name}`;
            html_pay = html_pay + '<table id="table"><tr><th>Sr.No</th><th>Paid Date.</th><th>Paid Amount.</th> <th>UTR NO</th></tr>';
            for (let j = 0; j < element.LocalPurchasePaymentDetails.length; j++) {
              let pay = element.LocalPurchasePaymentDetails[j];
              html_pay = html_pay + `<tr><td> ${Number(i + 1)} </td><td> ${this.datepipe.transform(pay.paid_date, 'dd/MM/yyyy')} </td><td> ${pay.paid_amount} </td><td> ${pay.utr_no}  </td>`;
            }
            html_pay = html_pay + '</table>';
          }
        }
      }
      const TABLE_LIFT = /{TABLE_LIFT}/gi;
      const TABLE_PAYMENT = /{TABLE_PAYMENT}/gi;
      const SUBORG = /{SUBORG}/gi;
      let html2 = this.template.replace(SUBORG, sub_org);
      let html3 = html2.replace(TABLE_LIFT, html_lift);
      let html4 = html3.replace(TABLE_PAYMENT, html_pay);
      const html5 = html4 + this.footer;
      arr = { 'to': to, 'cc': cc, 'subject': this.subject, 'html': html5 };
      this.isLoadingMail = true;
      this.crudServices.postRequest<any>(LocalPurchase.sendMailPaymentLifting, { mail_object: arr, id: id }).subscribe(response => {
        this.isLoadingMail = false;
        this.closeModal();
        this.toasterService.pop(response.message, response.message, response.data);
      })
    } else {
      this.toasterService.pop('error', 'error', 'Check Email');
    }
  }

  selectLifting(event) {
    this.lifting_list = false;
    if (event) {
      this.lifting_list = true;
    }
  }

  selectPayament(event) {
    this.payment_list = false;
    if (event) {
      this.payment_list = true;
    }
  }



  getTemplate() {
    this.template = '';
    this.subject = '';
    this.footer = '';
    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Purchase Lifting Payment' }).subscribe(response => {
      this.template = response[0].custom_html;
      this.subject = response[0].subject;
    })
    this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
      this.footer = response[0].custom_html;
    })
  }

  charges(id) {
    this.router.navigate([]).then(result => { window.open('/#/local-purchase/local-purchase-charges/' + id, '_blank'); });
  }

  godown_allocation(id) {
    this.router.navigate([]).then(result => { window.open('/#/local-purchase/godown-allocation/' + id, '_blank'); });
  }

  adjustModalOpen(data) {
    this.dealid = data.id;
    this.paymentRemain = data.payment_remaining;
    this.supplierAdjust = data.sub_org_name;
    let supplierId = [];
    this.crudServices.getOne<any>(SubOrg.get_suborg_agst_main, { org_id: data.org_id }).subscribe(suppId => {
      if (suppId.length) {
        for (let val of suppId) {
          supplierId.push(val.sub_org_id)
        }
        this.crudServices.getOne<any>(LocalPurchase.getAll, {
          // deal_date_from: this.fromDealDate,
          // deal_date_to: this.toDealDate,
          status_payment: 0,
          supplier_id: supplierId
        }).subscribe((response) => {
          if (response) {
            this.adjustDealsList = response;
            const control = <FormArray>this.adjustForm.controls['adjustDeals'];
            // control.push(this.initListItem());
            // this.adjustDeals = this.adjustForm.get('adjustDeals') as FormArray;
            for (let element of response) {
              control.push(this.fb.group({
                id: new FormControl(element.id),
                amount: null

              }))
            }
            this.myModalAdjust.show();
          }
        });
      }
    })
    // this.adjustList = this.deal_list;
    // this.adjustList =  this.adjustList.filter(item => item.status_payment == 0 &&  item.supplier_id == data.supplier_id);
  }

  checkForAmount(amt, remamt, i) {
    if (amt >= remamt) {
      ((this.adjustForm.controls.adjustDeals as FormArray).at(i) as FormGroup).get('amount').patchValue(0);
      this.toasterService.pop('warning', 'warning', 'Amount Exceeded')
    }
  }

  submitArray() {
    let data = this.adjustForm.value.adjustDeals;
    let arr = [];
    let originalAmt = Math.abs(this.paymentRemain)
    for (let val of data) {
      if (val.amount > 0) {
        arr.push(val)
      }
    }
    let arrAmount = arr.reduce((sum, item) => sum + Number(item.amount), 0);
    if (arrAmount <= originalAmt) {
      this.crudServices.postRequest<any>(LocalPurchase.adjustPayment, { data: arr, arrAmount: arrAmount, id: this.dealid }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.myModalAdjust.hide();
        this.dealid = null;
        this.paymentRemain = 0;
        this.supplierAdjust = '';
        const arr = <FormArray>this.adjustForm.controls.adjustDeals;
        arr.controls = [];
        this.getDealList();

      })
    } else {
      this.toasterService.pop('warning', 'warning', 'Amount Exceeded')
    }
  }

  closeAdjust() {
    const arr = <FormArray>this.adjustForm.controls.adjustDeals;
    arr.controls = [];
    this.dealid = null;
    this.paymentRemain = 0;
    this.supplierAdjust = '';
    this.myModalAdjust.hide();
  }


  getNotifications(name) {
    this.notification_tokens = [];
    this.notification_id_users = []
    this.notification_users = [];
    this.crudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
      if (notification.code == '100' && notification.data.length > 0) {
        this.notification_details = notification.data[0];

        this.crudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {


          if (notificationUser.code == '100' && notificationUser.data.length > 0) {
            notificationUser['data'].forEach((element) => {
              if (element.fcm_web_token) {
                this.notification_tokens.push(element.fcm_web_token);
                this.notification_id_users.push(element.id);

              }
            });
          }
        });
      }
    })
  }


  generateNotification(data, id) {

    if (this.notification_details != undefined) {
      let body = {
        notification: data,
        registration_ids: this.notification_tokens
      };




      this.messagingService.sendNotification(body).then((response) => {
        if (response) {


          this.saveNotifications(body['notification'], id)
        }
        this.messagingService.receiveMessage();
        this.message = this.messagingService.currentMessage;

      })

    }


  }

  saveNotifications(notification_body, id) {

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
        table_name: 'local_purchase_deal',
      })
    }

    this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
    }, (error) => console.error(error));
  }


  //For both  Invoice and Deal wise Payment

  paymentModule(item) {
    //if(item.tds_tcs_present){
    this.payObj = item;
    this.crudServices.getOne<any>(subOrgRespectiveBank.getPerticularOrgBank, { sub_org_id: item.supplier_id }).subscribe(response => {
      this.bank_list = response;
      this.bank_list.map(result => result.bankName = result.account_no != null ? result.bank_name + " ( " + result.account_no + " ) " : result.bank_name);
    })

    if (item.org_id) {
      this.crudServices.getOne<any>(SubOrg.get_suborg_agst_main, { org_id: item.org_id }).subscribe((response) => {

        if (response.length) {
          response.map(item => {
            item.sub_org_name = `${item.sub_org_name} - (${item.org_unit_master.unit_type}) - (${item.location_vilage})`
          })
        }

        this.sister_company_list = response;
      });

    }

    this.sisterCompanyId = item.supplier_id;
    this.paymentRemain = item.payment_remaining;
    this.lifting_invoices = item.LocalPurchaseLiftingDetails

    // let amt = item.deal_value_gst / item.quantity;

    if (this.lifting_invoices.length) {

      this.lifting_invoices.map(data => {
        let invoice_value = data.invoice_value;
        data.invoice_amount = invoice_value - data.PayAmt;
        data.invoice_no = data.purchase_invoice_no;
        data.purchase_invoice_no = `${data.purchase_invoice_no} -Qty (${data.quantity} MT) - Amount(${data.invoice_amount})`;
      })
    }
    this.myModalPayment.show();
    // }else {
    //   this.toasterService.pop('error' , 'warning' , 'TDS/TCS Declaration not Present')
    // }
  }

  getMoneyInrFormat(value) {
    return this.commonService.getMoneyIndianFormat('' + value);
  }

  backFromPayable(event) {
    this.payablePara = null;
    this.payableExit = true;
  }

  CheckPaymentAgainst(event) {
    this.paymentInvoice = false;
    this.proccedBtn = false;
    this.deal_payment = false;
    this.invoice_payment = false;

    if (event.target.value == 1) {
      this.deal_payment = true;
      this.proccedBtn = true;
    } else if (event.target.value == 2) {
      this.invoice_payment = true;
      this.paymentInvoice = true;
      this.proccedBtn = false;
    }
  }

  selectInvoice(event) {
    this.proccedBtn = false;
    this.LiftPayArr = event;
    this.requestAmount = event.reduce((sum, item) => sum + item.invoice_amount, 0);
    this.invoiceAmountForm.patchValue({ amount: this.requestAmount });
    this.invoiceAmountForm.get('amount').setValidators([Validators.max(this.requestAmount)]);
    this.invoiceAmountForm.get('amount').updateValueAndValidity();
    if (this.totalAmtLocal < this.invoiceAmountForm.value.amount) {
      this.proccedBtn = false;
      this.toasterService.pop('warning', 'warning', 'Amount Insufficient')
    } else if (this.requestAmount >= this.invoiceAmountForm.value.amount) {
      this.proccedBtn = true;
    } else {
      this.proccedBtn = false;
      this.toasterService.pop('warning', 'warning', 'Check Invoice Amount ')
    }
    this.LiftPayArr.sort((a, b) => a.invoice_amount - b.invoice_amount)
  }

  CheckForInvoiceAmt() {
    this.proccedBtn = false;
    console.log(this.invoiceAmountForm.value.amount);

    if (this.totalAmtLocal < this.invoiceAmountForm.value.amount) {
      this.proccedBtn = false;
      this.toasterService.pop('warning', 'warning', 'Amount Insufficient')
    } else if (this.requestAmount >= this.invoiceAmountForm.value.amount) {
      let invoice_amt = this.LiftPayArr.reduce((sum, item) => sum + item.invoice_amount, 0);
      if (this.invoiceAmountForm.value.amount <= invoice_amt && this.invoiceAmountForm.value.amount != 0 && this.invoiceAmountForm.value.amount != null) {
        this.proccedBtn = true;
      } else {
        this.proccedBtn = false;
        this.toasterService.pop('warning', 'warning', 'Check Invoice Amount ')
      }
    }
  }

  closePayment() {
    this.paymentInvoice = false;
    this.proccedBtn = false;
    this.deal_payment = false;
    this.invoice_payment = false;
    this.payObj = {};
    this.deal.nativeElement.checked = false;
    this.invoice.nativeElement.checked = false;
    this.invoiceAmountForm.reset();
    this.sisterCompanyId = 0;
    this.paymentRemain = 0;
    this.lifting_invoices = [];
    this.myModalPayment.hide();

  }

  proceedPayment() {
    let invoice_no: string = "";
    if (this.LiftPayArr && this.LiftPayArr.length > 0) {
      invoice_no = Array.prototype.map.call(this.LiftPayArr, function (item: { invoice_no: any; }) { return item.invoice_no; }).join(",");
    }

    if (this.payObj) {
      this.payObj.supplier_id = this.sisterCompanyId;
      let name = this.sister_company_list.find(item => item.sub_org_id == this.sisterCompanyId)
      if (name) {
        this.payObj.sub_org_name = name.sub_org_name;
      }
      if (this.deal_payment) {
        this.onPaymentClick(this.payObj);
        this.closePayment();
      } else if (this.invoice_payment) {
        let liftData = [];
        let date = new Date();
        let record_id = this.payObj.id;
        const req_date = this.datepipe.transform(date, 'yyyy-MM-dd');
        let data = {
          sub_org_id: this.sisterCompanyId,
          emp_id: 0,
          record_id: record_id,
          req_date: req_date,
          req_amount: this.requestAmount,
          advanced_agnst_bill: 2,
          normal_priority: 1,
          req_flag: 1,
          company_id: this.payObj.company_id,
          invoice_no: invoice_no,
          remark: this.invoiceAmountForm.value.remark
        }
        if (this.invoiceAmountForm.value.bank_id) {
          let result = this.bank_list.find(item => item.bank_id == this.invoiceAmountForm.value.bank_id);
          data['beneficiary_bank_name'] = result.bank_name;
          data['beneficiary_account_no'] = result.account_no;
          data['beneficiary_bank_ifsc'] = result.ifsc_code;
          data['beneficiary_branch_name'] = result.branch_name;
          data['to_bank_id'] = this.invoiceAmountForm.value.bank_id;
        }
        this.crudServices.addData<any>(Payables.add_payables_request, data).subscribe((response) => {
          if (response.code == 100) {
            if (response.insertedData[0].id) {
              if (this.LiftPayArr != null) {
                this.LiftPayArr.sort((a, b) => a.invoice_amount - b.invoice_amount)
                var adjustAmt = this.requestAmount;
                for (let val of this.LiftPayArr) {
                  let amt = 0;
                  if (adjustAmt != 0 && adjustAmt > 0) {
                    if (val.invoice_amount < adjustAmt) {
                      amt = val.invoice_amount
                      adjustAmt = adjustAmt - val.invoice_amount
                    } else if (val.invoice_amount == adjustAmt) {
                      amt = val.invoice_amount;
                      adjustAmt = adjustAmt - val.invoice_amount;
                    } else if (val.invoice_amount > adjustAmt) {
                      amt = adjustAmt;
                      adjustAmt = 0
                    }
                  }
                  liftData.push({
                    deal_id: val.local_purchase_id,
                    lift_id: val.id,
                    payable_id: response.insertedData[0].id,
                    amount: amt,
                    original_amount: val.invoice_amount
                  })
                }
              }
              this.crudServices.addData<any>(LiftingDetails.addlLocalLiftingPayment, liftData).subscribe(res => {
                this.toasterService.pop(response.message, response.message, response.data);
                this.closePayment();
                this.getDealList();
              })
            }
          }
        })
      }
    }
  }


  onPaymentClick(item) {
    const record_id = item.id;
    const sub_org_id = item.supplier_id;
    const sub_org_name = item.sub_org_name;
    // const deal_rate = item.payment_remaining;
    const deal_rate = item.deal_value_gst;
    const ILc_amount = Number(item.TotalBexAmount);
    const Ilc_rtgs_amount = Number(item.TotalPaymentReqAmtIlc);
    const local_debit_amount = Number(item.other_credit_amount + item.short_credit_amount + item.damage_credit_amount);
    const port_id = item.port_id

    // const deal_rate = item.deal_value_gst;
    const rate = item.rate;
    const quantity = item.quantity;

    const req_flag = 1;
    const emp_id = 0;
    const dealRateInr = this.currencyPipe.transform(deal_rate);
    const headerMsg = 'Payment Details for Local Purchase No: ' + record_id;

    const createRequestAcess = (this.links.indexOf('Create Local Purchase Payment') > -1);
    const editRequestAcess = (this.links.indexOf('Edit Local Purchase Payment') > -1);
    this.payablePara = new PayableParameter(sub_org_id, emp_id, headerMsg, deal_rate, record_id, req_flag, sub_org_name, createRequestAcess, editRequestAcess, item.company_id, rate, quantity, ILc_amount, Ilc_rtgs_amount, local_debit_amount, port_id, item.payment_remaining);
    this.payableExit = false;
  }

  knockoff() {
    if (this.checkedList.length) {
      let ids = [];

      for (let val of this.checkedList) {
        ids.push(val.id)
      }

      this.crudServices.updateData<any>(LocalPurchase.updatePaymentKnockOff, { id: ids }).subscribe(res => {
        this.toasterService.pop(res.message, res.message, res.data);
        this.checkedList = [];
        this.getDealList();
      })
    }

  }


  getDocArr(doc) {
    if (doc) {
      return JSON.parse(doc);
    }

  }

  updateMode(item) {
    this.modeOfPayment = item.mode_of_payment;
    this.pay_id = item.id
    this.updateModeModal.show()
  }

  submitModeOfPayment() {
    if (this.modeOfPayment) {
      this.crudServices.postRequest<any>(LocalPurchase.updateMode, { id: this.pay_id, mode: this.modeOfPayment }).subscribe(response => {
        this.toasterService.pop(response.message, response.message, response.data);
        this.getDealList();
        this.oncloseModal()
      })
    }
  }


  getInventoryFromRdis() {
    this.isLoading = true;
    let tot_regular_intransite_spipl = 0;
    let tot_stock_transfer_import_instransite = 0;
    let tot_inventory_import = 0;
    let tot_sales_pending_import = 0;
    this.crudServices.postRequest<any>(inventoryRedis.getUnsoldSummaryRedis, {
      id: 1
    }).subscribe((response) => {
      let parseData = JSON.parse(response.data.data_detail);
      let data = parseData.filter(val => this.main_grade_ids.includes(val.main_grade_id));
      var helper = {};
      var result = data.reduce(function (r, o) {
        var key = o.main_godown_id;
        if (!helper[key]) {
          helper[key] = Object.assign({}, o);
          helper[key].local_purchase_import_intransite += (o.local_purchase_import_mou);
          helper[key].local_purchase_local_intransite += o.local_purchase_local_mou;
          helper[key].inventory_local += o.inventory_local_mou;
          helper[key].inventory_import += o.inventory_import_mou;
          helper[key].sales_pending_import += o.sales_pending_import_mou;
          helper[key].sales_pending_local += o.sales_pending_local_mou;
          r.push(helper[key]);
        } else {
          helper[key].lc_not_issue_spipl += o.lc_not_issue_spipl;
          helper[key].lc_not_issue_import_surisha += o.lc_not_issue_import_surisha;
          helper[key].bond_intransite_spipl += o.bond_intransite_spipl;
          helper[key].inventory_all += o.inventory_all;
          helper[key].inventory_import += o.inventory_import + o.inventory_import_mou;
          helper[key].inventory_import_surisha += o.inventory_import_surisha;
          helper[key].inventory_local += o.inventory_local + o.inventory_local_mou;
          helper[key].local_purchase_import_intransite += o.local_purchase_import_intransite + o.local_purchase_import_mou;
          helper[key].local_purchase_intransite_all += o.local_purchase_intransite_all;
          helper[key].local_purchase_local_intransite += o.local_purchase_local_intransite + o.local_purchase_local_mou;
          helper[key].non_pending_import_surisha += o.non_pending_import_surisha;
          helper[key].non_pending_spipl += o.non_pending_spipl;
          helper[key].order_in_stock += o.order_in_stock;
          helper[key].regular_intransite_import_surisha += o.regular_intransite_import_surisha;
          helper[key].regular_intransite_spipl += o.regular_intransite_spipl;
          helper[key].sales_pending_all += o.sales_pending_all;
          helper[key].sales_pending_import += o.sales_pending_import + o.sales_pending_import_mou;
          helper[key].sales_pending_import_surisha += o.sales_pending_import_surisha;
          helper[key].sales_pending_local += o.sales_pending_local + o.sales_pending_local_mou;
          helper[key].stock_transfer_import_instransite += o.stock_transfer_import_instransite;
          helper[key].stock_transfer_instransite_all += o.stock_transfer_instransite_all;
          helper[key].stock_transfer_local_instransite += o.stock_transfer_local_instransite;
        }
        return r;
      }, []);
      for (let elem of result) {
        if (elem.company_id == 1) {
          tot_stock_transfer_import_instransite = tot_stock_transfer_import_instransite + elem.local_purchase_intransite_all;
          tot_inventory_import = tot_inventory_import + elem.inventory_all;
          tot_sales_pending_import = tot_sales_pending_import + elem.sales_pending_all;
        }
      }
      this.totalAmt = (
        (tot_regular_intransite_spipl +
          tot_stock_transfer_import_instransite +
          tot_inventory_import) -
        (tot_sales_pending_import))
    });
  }

  getLocalData(companyId) {
    this.company_id = companyId
    if(this.company_id == 1){
      this.from_date = this.datePipe.transform(this.local_statement_set_date_pvc, 'yyyy-MM-dd')
    }else{
    this.from_date = this.datePipe.transform(this.local_statement_set_date, 'yyyy-MM-dd')
    }
    const today = new Date();
    this.to_date = this.datePipe.transform(today, 'yyyy-MM-dd')
    let creditAmt = 0;

    let spipl_bank_id: number;
    if (this.company_id == 1) {
      spipl_bank_id = 24;
    } else if (this.company_id == 2) {
      spipl_bank_id = 19;
    } else if (this.company_id == 3) {
      spipl_bank_id = 28;
    }
    let res1 = this.crudServices.getOne<any>(Payables.getTransferPayments, { from_date: this.from_date, to_date: this.to_date, import_local_flag: 2, company_id: this.company_id });

    let res2 = this.crudServices.getOne<any>(Payables.getCentralPayableLocal, { from_date: this.from_date, to_date: this.to_date, import_local_flag: 2, spipl_bank_id: spipl_bank_id, company_id: this.company_id });

    let res3 = this.crudServices.getOne<any>(Payables.getSalesDispatchLCPayments, { from_date: this.from_date, to_date: this.to_date, spipl_bank_id: spipl_bank_id, import_local_flag: 2, company_id: this.company_id });
    
    let res4 = this.crudServices.getOne<any>(Payables.getForwardSalesPayments, { from_date: this.from_date, to_date: this.to_date, spipl_bank_id: spipl_bank_id, company_id: this.company_id, import_local_flag: 2 });

    this.isLoading = true;
    forkJoin([res1, res2, res3, res4]).subscribe(([data1, data2, data3, data4]) => {
      this.isLoading = false
      if (data1.length) { data1.map(item => item.type = "Credit"); }
      if (data2.length) { data2.map(item => item.type = "Debit"); }
      if (data3.length) {
        data3.map(item => item.type = "Credit");
        data3.map(item => item.utr_no = "LC Payment- " + item.utr_no)
      }
      if (data4.length) {
        data4.map(item => {
          if (item.advanceamount > 0 || item.balanceamount > 0) {
            item.type = "Credit";
            item.amount = item.advanceamount ? item.advanceamount : item.balanceamount
            item.utr_no = item.company + " Forward -" + (item.invoice_no ? (' Invoice- ' + item.invoice_no) : (' Order- ' + item.so_id));
          } else {
            item.type = "Credit";
            item.amount = 0
            item.utr_no = item.company + " Forward -" + (item.invoice_no ? (' Invoice- ' + item.invoice_no) : (' Order- ' + item.so_id));
          }
        });
      }

      data4 = data4.filter(i => i.amount > 0)
      let results = [];

      if (data1.length) {
        results = [...results, ...data1];
      }
      if (data2.length > 0) {
        results = [...results, ...data2];
      }
      if (data3.length > 0) {
        results = [...results, ...data3];
      }
      if (data4.length > 0) {
        results = [...results, ...data4];
      }

      this.data = results.sort((a, b) => a.date < b.date ? 1 : -1);

      this.data.map(result => {
        if (result.type == 'Credit' && result.amount > 0) {
          creditAmt += result.amount
        } else {
          creditAmt = (creditAmt - result.amount)
        }
        result.opening_balance = creditAmt
        return result
      })
      this.calculateAmount(this.data, this.company_id);
    });
  }



  calculateAmount(data, division) {
    if (division == 1) {
      this.totalAmtLocal = this.pvc_local_statement_value;
    } else {
      this.totalAmtLocal = 0;
    }
    this.totalCredit = 0;
    this.totalDebit = 0;
    for (let item of data) {
      if (item.type == "Credit" && item.amount > 0) {
        this.totalAmtLocal = this.totalAmtLocal + item.amount
        this.totalCredit += item.amount
      } else if (item.type == "Debit") {
        this.totalAmtLocal = this.totalAmtLocal - item.amount
        this.totalDebit += item.amount
      }
    }
  }

}
