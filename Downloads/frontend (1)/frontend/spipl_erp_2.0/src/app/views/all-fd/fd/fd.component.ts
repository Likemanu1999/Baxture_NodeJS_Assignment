import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { allFD, fdTypeMaster, FileUpload, SpiplBankMaster } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { staticValues } from "../../../shared/common-service/common-service";
import { PayableParameter } from '../../../shared/payable-request/payable-parameter.model';



@Component({
  selector: 'app-fd',
  templateUrl: './fd.component.html',
  styleUrls: ['./fd.component.scss'],
  providers: [ToasterService, PermissionService, ExportService, DatePipe, CrudServices],
  encapsulation: ViewEncapsulation.None
})
export class FdComponent implements OnInit {
  @ViewChild('fdModal', { static: false }) fdModal: ModalDirective;
  @ViewChild('renewFdModal', { static: false }) renewFdModal: ModalDirective
  @ViewChild('dt', { static: false }) table: Table;
  @ViewChildren('inputs') inputs: ElementRef<HTMLInputElement>[];

  add_opt: boolean = false;
  edit_opt: boolean = false;
  view_opt: boolean = false;
  del_opt: boolean = false;
  isCollapsed: boolean = false;
  serverUrl: string;
  user: UserDetails;
  links: string[] = [];

  FdAgainst: { id: number, type: string }[];
  fdStatus: { id: number, status: string }[];
  bankList: any = [];
  fdType: { id: number, type: string }[];
  selectedFdType: number;
  selectedBank: number;
  selectedFdAgainst: string;
  isLoading: boolean;
  cols: { field: string, header: string, style: string }[];
  allFDs: any = [];
  newFdForm: FormGroup;
  currentUser: UserDetails;
  subscription: Subscription;
  mode: string = "";
  popoverTitle: string = 'Warning';
  popoverMessage: string = 'Are you sure, you want to delete?';
  confirmClicked: boolean = false;
  cancelClicked: boolean = false;
  confirmText: string = 'Yes';
  cancelText: string = 'No';
  placement: string = 'right';
  closeOnOutsideClick: boolean = true;
  bsRangeValue: Date[];
  bsRangeValue2: Date[];



  /**
  * Configuring toaster.
  */
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  fd_id: number;
  fd_release_date: string;
  renew_fd: boolean = false;
  fdObj: any;
  export_data: any[];
  exportColumns: any[] = [];
  entireTotalAmt: number = 0;
  allFDsCopy: any = [];
  releaseFlag: boolean;
  fd_status: number;
  fdCreationFlag: boolean;
  fdLiquidationFlag: boolean;
  fdRenewFlag: boolean;
  excel_export: boolean;
  pdf_export: boolean;
  release_renew: boolean;
  fdCreationArr: Array<any> = [];
  fdLiquidationArr: Array<any> = [];
  fdRenewArr: Array<any> = [];
  bankIds: any[] = [];
  fd_ids: any[] = [];
  fdLcDoc: Array<File> = [];
  filteredValuess: any[];
  fd_link: boolean;
  fd_array: any;
  newFdFormRelease: FormGroup;
  fd_make_date: any;
  renew_fd_make_date: any;
  newFdFormRenew: FormGroup;
  renew_fd_maturity_dt: string;
  status: { id: number; type: string; }[];
  selected_status: number = 1;
  maturity_from: any;
  maturity_to: any;
  release_from: any;
  release_to: any;
  payablePara: PayableParameter;
  payableExit: boolean;
  company_id: any;
  payment: boolean;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private tosterService: ToasterService,
    private exportService: ExportService,
    private permissionService: PermissionService,
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
    this.fdCreationFlag = (this.links.indexOf('Fd Creation Flag') > -1);
    this.fdLiquidationFlag = (this.links.indexOf('Fd Liqidation Flag') > -1);
    this.fdRenewFlag = (this.links.indexOf('FD Renew Flag') > -1);
    this.release_renew = (this.links.indexOf('Fd Release Renew') > -1);
    this.excel_export = (this.links.indexOf('Excel Export Fd') > -1);
    this.pdf_export = (this.links.indexOf('Pdf  Export Fd') > -1);
    this.payment = (this.links.indexOf('FD Payment') > -1);

    this.company_id = this.user.userDet[0].company_id;

    this.crudServices.getAll<any>(fdTypeMaster.getAll).subscribe(res => {

      this.FdAgainst = res.data;
    })

    this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe(res => {
      this.bankList = res;
    });


    this.fdStatus = [
      { id: 1, status: 'Release' },
      { id: 2, status: 'Renew' },
    ]

    this.fdType = [
      { id: 1, type: 'Close' },
      { id: 2, type: 'Open' },
    ]

    this.status = [
      { id: 1, type: 'Pending' },
      { id: 2, type: 'Completed' },
    ]
    this.cols = [
      { field: '', header: 'FD Link', style: '90px' },
      { field: '', header: 'Operation', style: '150px' },
      { field: 'status', header: 'Status', style: '100px' },
      { field: 'fd_make_date', header: 'FD Date', style: '100px' },
      { field: 'fd_no', header: 'FD No', style: '100px' },
      { field: 'bank_name', header: 'Bank', style: '100px' },
      { field: 'fd_amt', header: 'FD Amount', style: '100px' },
      { field: 'fd_maturity_date', header: 'Maturity Date', style: '100px' },
      { field: 'fd_in_days', header: 'FD Days', style: '100px' },
      { field: 'roi', header: 'Rate Int%', style: '100px' },
      { field: 'gross_interest', header: 'Gross Interest', style: '100px' },
      { field: 'tds_percent', header: 'TDS Per%', style: '100px' },
      { field: 'tds_amt', header: 'TDS Amount', style: '100px' },
      { field: 'net_interest', header: 'Net Interest', style: '100px' },
      { field: 'total_amt', header: 'Total Amount', style: '100px' },
      { field: 'fd_release_date', header: 'Release Date', style: '100px' },
      { field: 'release_fd_in_days', header: 'Release FD Days', style: '100px' },
      { field: 'release_roi', header: 'Release Rate Int%', style: '100px' },
      { field: 'release_gross_interest', header: 'Release Gross Interest', style: '100px' },
      { field: 'release_tds_percent', header: 'Release TDS Per%', style: '100px' },
      { field: 'release_tds_amt', header: 'Release TDS Amount', style: '100px' },
      { field: 'release_net_interest', header: 'Release Net Interest', style: '100px' },
      { field: 'release_total_amt', header: 'Release Total Amount', style: '100px' },
      { field: 'added_by_name', header: 'Added By', style: '100px' },
      { field: 'modified_by_name', header: 'Modified By', style: '100px' },

    ]
  }

  ngOnInit(): void {

    this.currentUser = this.loginService.getUserDetails();

    this.initForm();

    this.getAllFds();
    // this.getFdTotalAmt();

  }

  initForm() {


    this.newFdForm = this.formBuilder.group({
      bk_id: [null, Validators.required],
      fd_make_dt: [this.datePipe.transform(new Date(), 'yyyy-MM-dd'), Validators.required],
      fd_no: [null],
      fd_amt: [0, [Validators.required]],
      fd_maturity_dt: [null, Validators.required],
      fd_release_date: [null],
      fd_in_days: [0],
      rate_of_interest: [0],
      gross_interest: [0],
      tds_per: [0],
      tds_amt: [0],
      net_interest: [0],
      total_amt: [0],
      fd_type: [null],
      fd_copy: [null],

    });

    this.newFdFormRelease = this.formBuilder.group({
      fd_release_date: [null],
      release_fd_amt: [null],
      release_roi: [null],
      release_fd_in_days: [null],
      release_gross_interest: [null],
      release_tds_percent: [null],
      release_tds_amt: [null],
      release_net_interest: [null],
      release_total_amt: [null],
      renew_fd: [null],
    })

    this.newFdFormRenew = this.formBuilder.group({

      fd_make_dt: [this.datePipe.transform(new Date(), 'yyyy-MM-dd'), Validators.required],
      fd_no: [null],
      fd_amt: [0, [Validators.required]],
      fd_maturity_dt: [null, Validators.required],
      fd_release_date: [null],
      fd_in_days: [0],
      roi: [0],
      gross_interest: [0],
      tds_percent: [0],
      tds_amt: [0],
      net_interest: [0],
      total_amt: [0],
      fd_type: [null],
      fd_copy: [null],

    });

  }

  openReleaseOrRenewFdModal(fd) {
    this.fdObj = fd;
    this.fd_status = fd.status;
    let data = {}
    let data2 = {}

    if (this.fdObj.release_total_amt > 0 && this.fdObj.fd_release_date != null) {

      data['release_fd_in_days'] = this.fdObj.release_fd_in_days;
      data['release_fd_amt'] = this.fdObj.release_fd_amt;
      data['release_gross_interest'] = this.fdObj.release_gross_interest;
      data['release_tds_amt'] = this.fdObj.release_tds_amt;
      data['release_net_interest'] = this.fdObj.release_net_interest;
      data['release_total_amt'] = this.fdObj.release_total_amt;
      data['release_roi'] = this.fdObj.release_roi;
      data['release_tds_percent'] = this.fdObj.release_tds_percent;
      // data['fd_release_date'] = this.fd_release_date;
      this.fd_release_date = this.fdObj.fd_release_date;

    } else {
      data['release_fd_amt'] = this.fdObj.fd_amt;
      data['release_roi'] = this.fdObj.roi;
      data['release_tds_percent'] = this.fdObj.tds_percent;
      this.fd_release_date = this.fdObj.fd_maturity_date;

    }

    this.renew_fd_make_date = this.fdObj.fd_maturity_date;
    this.renew_fd_maturity_dt = (moment(this.renew_fd_make_date).add(this.fdObj.fd_in_days, 'd')).format('YYYY-MM-DD').toString();
    data2['fd_amt'] = this.fdObj.fd_amt;
    data2['roi'] = this.fdObj.roi;
    data2['fd_in_days'] = this.fdObj.fd_in_days;
    data2['gross_interest'] = this.fdObj.gross_interest;
    data2['tds_percent'] = this.fdObj.tds_percent;
    data2['tds_amt'] = this.fdObj.tds_amt;
    data2['net_interest'] = this.fdObj.net_interest;
    data2['total_amt'] = this.fdObj.total_amt;

    this.newFdFormRelease.patchValue(data);
    this.newFdFormRenew.patchValue(data2);



    this.renew_fd = false;
    this.renewFdModal.show();
  }

  setReleaseData() {

    if (this.fd_release_date) {
      const fdReleaseDate = moment(this.fd_release_date);
      const fdMakingDate = moment(this.fdObj.fd_make_date);

      const noOfDays = Math.abs(fdMakingDate.diff(fdReleaseDate, 'days'));
      if (!isNaN(noOfDays)) {
        var data = {};
        let amount = this.newFdFormRelease.value.release_fd_amt;
        let roi = this.newFdFormRelease.value.release_roi;
        let tds_per = this.newFdFormRelease.value.release_tds_percent;

        data['release_fd_in_days'] = noOfDays;
        data['release_gross_interest'] = (((amount * (roi / 100)) / 365) * noOfDays).toFixed(2);
        data['release_tds_amt'] = (data['release_gross_interest'] * (tds_per / 100)).toFixed(2);
        data['release_net_interest'] = (data['release_gross_interest'] - data['release_tds_amt']).toFixed(2);
        data['release_total_amt'] = Number(amount) + Number(data['release_net_interest']);
        data['release_roi'] = roi;
        data['release_tds_percent'] = tds_per;

        this.newFdFormRelease.patchValue(data)

      }
    }

  }

  setRenewData() {


    const fdMaturity = moment(this.renew_fd_maturity_dt);
    const fdMakingDate = moment(this.renew_fd_make_date);

    const noOfDays = Math.abs(fdMakingDate.diff(fdMaturity, 'days'));
    if (!isNaN(noOfDays)) {
      var data = {};
      let amount = Number(this.newFdFormRenew.value.fd_amt);
      let roi = Number(this.newFdFormRenew.value.roi);
      let tds_per = Number(this.newFdFormRenew.value.tds_percent);

      data['fd_in_days'] = noOfDays;
      data['gross_interest'] = (((amount * (roi / 100)) / 365) * noOfDays).toFixed(2);
      data['tds_amt'] = (data['gross_interest'] * (tds_per / 100)).toFixed(2);
      data['net_interest'] = (data['gross_interest'] - data['tds_amt']).toFixed(2);
      data['total_amt'] = Number(amount) + Number(data['net_interest']);
      data['roi'] = roi;
      data['tds_per'] = tds_per;

      this.newFdFormRenew.patchValue(data)

    }


  }

  onReleaseOrRenewFd() {
    if (!this.renew_fd) {
      if (this.fd_release_date) {
        const fdReleaseDate = moment(this.fd_release_date);
        const fdMakingDate = moment(this.fdObj.fd_make_date);

        const noOfDays = Math.abs(fdMakingDate.diff(fdReleaseDate, 'days'));
        if (!isNaN(noOfDays)) {
          var data = {};

          data['fd_id'] = this.fdObj.id;
          data['release_fd_in_days'] = this.newFdFormRelease.value.release_fd_in_days;
          data['release_fd_amt'] = this.newFdFormRelease.value.release_fd_amt;
          data['release_gross_interest'] = this.newFdFormRelease.value.release_gross_interest;
          data['release_tds_amt'] = this.newFdFormRelease.value.release_tds_amt;
          data['release_net_interest'] = this.newFdFormRelease.value.release_net_interest;
          data['release_total_amt'] = this.newFdFormRelease.value.release_total_amt;
          data['release_roi'] = this.newFdFormRelease.value.release_roi;
          data['release_tds_percent'] = this.newFdFormRelease.value.release_tds_percent;
          data['fd_release_date'] = this.fd_release_date;
          data['status'] = this.fdStatus[0].id;
          data['message'] = 'FD Release ';

          this.crudServices.updateData<any>(allFD.update, data).subscribe(
            (response) => {
              if (response.code == '100') {
                this.tosterService.pop(response.message, response.message, response.data);
                this.renewFdModal.hide();
                this.getAllFds();
              } else if (response.code == '101') {
                this.renewFdModal.hide();
                this.tosterService.pop('error', 'error', 'Something Went Wrong !!!');
              }

            })
        }
      }
    } else {
      if (this.fdObj.fd_maturity_date === this.renew_fd_make_date) {
        var data = {};
        data['status'] = this.fdStatus[1].id;
        data['fd_id'] = this.fdObj.id;
        data['message'] = 'FD Renewed ';

        this.crudServices.updateData<any>(allFD.update, data).subscribe(
          response => {

            if (response.code == '100') {



              //  let date2 = {
              //     spipl_bank_id:this.fdObj.spipl_bank_id,
              //     fd_make_dt: this.datePipe.transform( this.renew_fd_make_date,'yyyy-MM-dd'),
              //     fd_no:this.fdObj.fd_no,
              //     fd_amt: this.newFdFormRenew.value.fd_amt,
              //     fd_maturity_dt: this.datePipe.transform(this.renew_fd_maturity_dt,'yyyy-MM-dd'),
              //     fd_in_days: this.newFdFormRenew.value.fd_in_days,
              //     roi:this.newFdFormRenew.value.roi,
              //     gross_interest:this.newFdFormRenew.value.gross_interest,
              //     tds_percent:this.newFdFormRenew.value.tds_percent,
              //     tds_amt:this.newFdFormRenew.value.tds_amt,
              //     net_interest:this.newFdFormRenew.value.net_interest,
              //     total_amt: this.newFdFormRenew.value.total_amt,
              //     fd_type:this.fdObj.fd_type,
              //     fd_copy:this.fdObj.fd_copy,
              //   }







              this.fdObj.fd_make_date = this.datePipe.transform(this.renew_fd_make_date, 'yyyy-MM-dd');
              this.fdObj.fd_maturity_date = this.datePipe.transform(this.renew_fd_maturity_dt, 'yyyy-MM-dd');
              this.fdObj.fd_id = null;
              this.fdObj.status = 0;
              this.fdObj.fd_amt = this.newFdFormRenew.value.fd_amt;
              this.fdObj.roi = this.newFdFormRenew.value.roi;
              this.fdObj.fd_in_days = this.newFdFormRenew.value.fd_in_days;
              this.fdObj.gross_interest = this.newFdFormRenew.value.gross_interest;
              this.fdObj.tds_percent = this.newFdFormRenew.value.tds_percent;
              this.fdObj.tds_amt = this.newFdFormRenew.value.tds_amt;
              this.fdObj.net_interest = this.newFdFormRenew.value.net_interest;
              this.fdObj.total_amt = this.newFdFormRenew.value.total_amt;
              this.crudServices.addData<any>(allFD.add, this.fdObj).subscribe(
                response => {
                  this.tosterService.pop(response.message, response.message, response.data);
                  this.renewFdModal.hide();
                  this.getAllFds();
                })
            } else if (response.code == '101') {
              this.renewFdModal.hide();
              this.tosterService.pop('error', 'error', 'Something Went Wrong !!!');
            }

          })
      }
    }
  }


  // onReleaseOrRenewFd() {
  //   if (!this.renew_fd) {
  //     if (this.fd_release_date) {
  //       const fdReleaseDate = moment(this.fd_release_date);
  //       const fdMakingDate = moment(this.fdObj.fd_make_date);

  //       const noOfDays = Math.abs(fdMakingDate.diff(fdReleaseDate, 'days'));
  //       if (!isNaN(noOfDays)) {
  //         var data = {};

  //         data['fd_id'] = this.fdObj.id;
  //         data['release_fd_in_days'] = noOfDays;
  //         data['release_gross_interest'] = (((this.fdObj.fd_amt * (this.fdObj.roi / 100)) / 365) * noOfDays).toFixed(2);
  //         data['release_tds_amt'] = (data['release_gross_interest'] * (this.fdObj.tds_percent / 100)).toFixed(2);
  //         data['release_net_interest'] = (data['release_gross_interest'] - data['release_tds_amt']).toFixed(2);
  //         data['release_total_amt'] = Number(this.fdObj.fd_amt) + Number(data['release_net_interest']);
  //         data['release_roi'] = this.fdObj.roi;
  //         data['release_tds_percent'] = this.fdObj.tds_percent;
  //         data['fd_release_date'] = this.fd_release_date;
  //         data['status'] = this.fdStatus[0].id;
  //         data['message'] = 'FD Release ';

  //         this.crudServices.updateData<any>(allFD.update, data).subscribe(
  //           (response) => {
  //             if (response.code == '100') {
  //               this.tosterService.pop(response.message, response.message, response.data);
  //               this.renewFdModal.hide();
  //               this.getAllFds();
  //             } else if (response.code == '101') {
  //               this.renewFdModal.hide();
  //               this.tosterService.pop('error', 'error', 'Something Went Wrong !!!');
  //             }

  //           })
  //       }
  //     }
  //   } else {
  //     if (this.fdObj.fd_maturity_date === this.fd_release_date) {
  //       var data = {};
  //       data['status'] = this.fdStatus[1].id;
  //       data['fd_id'] = this.fdObj.id;
  //       data['message'] = 'FD Renewed ';

  //       this.crudServices.updateData<any>(allFD.update, data).subscribe(
  //         response => {
  //           if (response.code == '100') {
  //             this.fdObj.fd_make_date = this.fd_release_date;
  //             this.fdObj.fd_maturity_date = (moment(this.fd_release_date).add(this.fdObj.fd_in_days, 'd')).format('YYYY-MM-DD').toString();
  //             this.fdObj.fd_id = null;
  //             this.fdObj.status = 0;
  //             this.crudServices.addData<any>(allFD.add, this.fdObj).subscribe(
  //               response => {
  //                 this.tosterService.pop(response.message, response.message, response.data);
  //                 this.renewFdModal.hide();
  //                 this.getAllFds();
  //               })
  //           } else if (response.code == '101') {
  //             this.renewFdModal.hide();
  //             this.tosterService.pop('error', 'error', 'Something Went Wrong !!!');
  //           }

  //         })
  //     }
  //   }
  // }

  onFdEdit(fd) {
    this.fd_id = fd.id;
    this.mode = "Edit New FD";
    this.fdModal.show();
    this.newFdForm.controls['bk_id'].patchValue(fd.spipl_bank_id);
    this.newFdForm.controls['fd_make_dt'].patchValue(fd.fd_make_date);
    this.newFdForm.controls['fd_no'].patchValue(fd.fd_no);
    this.newFdForm.controls['fd_amt'].patchValue(fd.fd_amt);
    this.newFdForm.controls['fd_maturity_dt'].patchValue(fd.fd_maturity_date);
    this.newFdForm.controls['fd_in_days'].patchValue(fd.fd_in_days);
    this.newFdForm.controls['rate_of_interest'].patchValue(fd.roi);
    this.newFdForm.controls['tds_per'].patchValue(fd.tds_percent);
    this.newFdForm.controls['net_interest'].patchValue(fd.net_interest);
    this.newFdForm.controls['total_amt'].patchValue(fd.total_amt);
    this.newFdForm.controls['fd_type'].patchValue(fd.fd_type_id);

  }

  get f() {
    return this.newFdForm.controls;
  }

  calculatePeriodOfFd() {
    const maturityDate = moment(this.newFdForm.get('fd_maturity_dt').value);
    const fdMakingDate = moment(this.newFdForm.get('fd_make_dt').value);

    if (maturityDate && fdMakingDate) {
      const noOfDays = Math.abs(fdMakingDate.diff(maturityDate, 'days'));
      if (!isNaN(noOfDays)) {
        this.f.fd_in_days.setValue(noOfDays);
        this.calculateGrossInterest();
      }

    }

  }

  calculateGrossInterest() {
    const fdAmt = this.newFdForm.get('fd_amt').value;
    const tds_per = this.newFdForm.get('tds_per').value;
    const rateOfInterest = this.newFdForm.get('rate_of_interest').value;
    const noOfDays = this.newFdForm.get('fd_in_days').value;
    const grossInterest = ((fdAmt * (rateOfInterest / 100)) / 365) * noOfDays;
    this.f.gross_interest.setValue(+grossInterest.toFixed(2));
    const tdsAmt = grossInterest * (tds_per / 100);
    this.f.tds_amt.setValue(+tdsAmt.toFixed(2));

    this.calculateNetInterest();
  }

  getLimitedDecimalNum(num: number) {
    return num.toFixed(2);
  }

  calculateTdsAmt() {
    const grossInterest = this.newFdForm.get('gross_interest').value;
    const tdsPer = this.newFdForm.get('tds_per').value;
    const tdsAmt = grossInterest * (tdsPer / 100);
    this.f.tds_amt.setValue(+tdsAmt.toFixed(2));

    this.calculateNetInterest();
  }

  calculateNetInterest() {
    const grossInterest = this.f.gross_interest.value;
    const tdsAmt = this.f.tds_amt.value;
    const netInterest = grossInterest - tdsAmt;
    this.f.net_interest.setValue(+netInterest.toFixed(2));
    this.calculateTotalAmt();
  }

  calculateTotalAmt() {
    const fdAmt = this.f.fd_amt.value;
    const netInterest = this.f.net_interest.value;
    const totalAmt = Number(fdAmt) + Number(netInterest);
    this.f.total_amt.setValue(+totalAmt.toFixed(2));
  }

  onFdDelete(fdId) {

    this.crudServices.deleteData<any>(allFD.delete, { id: fdId }).subscribe(
      response => {
        if (response.code == '100') {
          this.tosterService.pop(response.message, response.message, response.data);
          this.getAllFds();
        } else if (response.code == '101') {
          this.tosterService.pop('error', 'error', 'Something Went Wrong !!!');
        }

      }
    )
  }

  onCheckAll(checked) {

    let fdArr = [];
    fdArr = this.allFDs;
    if (checked) {
      this.inputs.forEach(checkbox => checkbox.nativeElement.checked = true);
      for (const fd of fdArr) {
        this.onSingleCheck(true, fd);
      }

    } else {
      this.inputs.forEach(checkbox => checkbox.nativeElement.checked = false);
      for (const fd of fdArr) {
        this.onSingleCheck(false, fd);
      }
    }
  }


  uncheckAll() {
    this.fdCreationArr = [];
    this.inputs.forEach(check => {
      check.nativeElement.checked = false;
    });
    this.fdLiquidationFlag = true;
  }


  onSingleCheck(checked, fd) {

    this.bankIds.push(fd.spipl_bank_id);
    this.fd_ids.push(fd.id);
    let status: boolean = true;

    if (checked) {
      this.fdCreationArr.push(fd);

    } else {
      this.fdCreationArr.splice(this.fdCreationArr.indexOf(fd), 1);
    }

    if (this.fdCreationArr.length > 0) {
      for (let i = 0; i < this.fdCreationArr.length; i++) {
        if (this.fdCreationArr[i].fd_no !== null) {
          status = true;
        } else {
          status = false;
          break;
        }
      }
    }

    this.fdLiquidationFlag = status;



  }

  onFdCreationRequest() {
    if (this.fdCreationArr.length > 0) {
      this.router.navigate(['fd/download-word/' + 1], { state: this.fdCreationArr, queryParams: { fd_status: 'creation', fd_ids: this.fd_ids } });
    } else {
      this.tosterService.pop('warning', 'warning', 'Fd Not Selected for Application Creation');
    }

  }

  onFdLiquidationRequest() {

    if (this.fdCreationArr.length > 0) {
      this.router.navigate(['fd/download-word/' + 1], { state: this.fdCreationArr, queryParams: { fd_status: 'liquidation', fd_ids: this.fd_ids } });
    } else {
      this.tosterService.pop('warning', 'warning', 'Fd Not Selected for Application Creation');
    }

  }

  onFdRenewRequest() {


    if (this.fdCreationArr.length > 0) {
      this.router.navigate(['fd/download-word/' + 1], { state: this.fdCreationArr, queryParams: { fd_status: 'renew', fd_ids: this.fd_ids } });
    } else {
      this.tosterService.pop('warning', 'warning', 'Fd Not Selected for Application Creation');
    }

  }

  onSubmit() {
    if (this.newFdForm.invalid) return;

    const data = {
      spipl_bank_id: this.newFdForm.value.bk_id,
      fd_make_date: this.convert(this.newFdForm.value.fd_make_dt),
      fd_no: this.newFdForm.value.fd_no,
      fd_amt: this.newFdForm.value.fd_amt,
      fd_maturity_date: this.convert(this.newFdForm.value.fd_maturity_dt),
      fd_in_days: this.newFdForm.value.fd_in_days,
      roi: this.newFdForm.value.rate_of_interest,
      gross_interest: this.newFdForm.value.gross_interest,
      tds_percent: this.newFdForm.value.tds_per,
      tds_amt: this.newFdForm.value.tds_amt,
      net_interest: this.newFdForm.value.net_interest,
      total_amt: this.newFdForm.value.total_amt,
      fd_type_id: this.newFdForm.value.fd_type,
      fd_id: this.fd_id,

    }



    const fileData: any = new FormData();
    const doc: Array<File> = this.fdLcDoc;
    if (doc.length > 0) {
      for (let i = 0; i < doc.length; i++) {
        fileData.append('fd_copy', doc[i], doc[i]['name']);
      }
    }



    this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {

      let fileDealDocs = [];
      let filesList = res.uploads.fd_copy;

      if (res.uploads.fd_copy) {
        for (let i = 0; i < filesList.length; i++) {
          fileDealDocs.push(filesList[i].location);
        }
        data['fd_copy'] = JSON.stringify(fileDealDocs);
      }
      this.saveData(data);
    })
  }

  saveData(formData) {

    if (!this.fd_id) {

      this.crudServices.addData<any>(allFD.add, formData).subscribe(
        (response => {

          if (response.code == '100') {
            this.tosterService.pop(response.message, response.message, response.data);
            this.fdModal.hide();
            this.getAllFds();
          } else {
            this.tosterService.pop('error', 'error', 'Something Went Wrong !!!');
          }

        })
      )
    } else {
      formData.message = "Fd Updated";
      this.crudServices.updateData<any>(allFD.update, formData).subscribe(
        (response => {
          if (response.code == '100') {
            this.tosterService.pop(response.message, response.message, response.data);
            this.fdModal.hide();
            this.getAllFds();
          } else {
            this.tosterService.pop('error', 'error', 'Something Went Wrong !!!');
          }

        })
      )
    }
  }

  convert(date) {
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }



  lcCopy(event: any) {
    this.fdLcDoc = <Array<File>>event.target.files;
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  filterFd() {



    this.allFDs = this.allFDsCopy

    if (this.selectedFdAgainst != null && this.selectedFdAgainst != undefined) {

      this.allFDs = this.allFDs.filter(fd => fd.fd_type_id === this.selectedFdAgainst);
    }

    if (this.selectedBank != null && this.selectedBank != undefined) {
      this.allFDs = this.allFDs.filter(fd => fd.spipl_bank_id === this.selectedBank);
    }

    if (this.selectedFdType != null && this.selectedFdType != undefined) {
      if (this.selectedFdType === 2) {
        this.allFDs = this.allFDs.filter(fd => fd.fd_release_date === null);

      } else {
        this.allFDs = this.allFDs.filter(fd => fd.fd_release_date !== null);
      }

    }

    if (this.selected_status != null && this.selected_status != undefined) {
      if (this.selected_status === 1) {
        this.allFDs = this.allFDs.filter(fd => (fd.fd_amt - fd.fd_linking_amt) > 0);

      } else if (this.selected_status === 2) {
        this.allFDs = this.allFDs.filter(fd => (fd.fd_amt - fd.fd_linking_amt) <= 0);
      }

    }

    let openFdAmt = 0;
    let closeFdAmt = 0;
    this.entireTotalAmt = this.allFDs.reduce((prev, curr) => {
      if (curr['fd_release_date'] == null) {

        if (curr['status'] != 2) {
          openFdAmt = openFdAmt + curr['fd_amt'];
          return openFdAmt;
        } else {
          openFdAmt = openFdAmt + 0;
          return openFdAmt;
        }

      } else {
        closeFdAmt = closeFdAmt + curr['fd_amt'];
        return closeFdAmt;
      }
    }, 0);
  }

  dateSelect(date, state) {
    if (state == 1 && date != null) {
      this.maturity_from = this.convert(date[0]);
      this.maturity_to = this.convert(date[1]);

    }

    if (state == 1 && date == null) {
      this.maturity_from = '';
      this.maturity_to = '';

    }

    if (state == 2 && date != null) {
      this.release_from = this.convert(date[0]);
      this.release_to = this.convert(date[1]);

    }

    if (state == 2 && date == null) {
      this.release_from = '';
      this.release_to = '';

    }
    this.getFD();



  }

  getFD() {

    this.entireTotalAmt = 0;
    this.crudServices.getOne<any>(allFD.getAll, { maturity_from: this.maturity_from, maturity_to: this.maturity_to, release_from: this.release_from, release_to: this.release_to }).subscribe(res => {
      this.allFDs = res;
      this.allFDsCopy = res;
      this.filterFd();
    })




  }

  getAllFds() {
    this.isLoading = true;
    this.entireTotalAmt = 0;
    this.crudServices.getOne<any>(allFD.getAll, { maturity_from: this.maturity_from, maturity_to: this.maturity_to, release_from: this.release_from, release_to: this.release_to }).subscribe(res => {
      this.isLoading = false;
      this.allFDs = res;
      this.allFDsCopy = res;
      this.filterFd();
    })
  }


  openNewFdModal() {
    this.mode = 'Add New FD';
    this.newFdForm.reset();
    this.fd_id = null;
    this.initForm();
    this.fdModal.show();
  }

  onClose() {
    this.fdModal.hide();
  }

  exportData() {
    let total = 0;
    this.export_data = [];
    let arr = [];
    let count = 0;
    if (this.filteredValuess !== undefined && this.filteredValuess.length > 0) {
      arr = this.filteredValuess;
    } else {
      arr = this.allFDs
    }
    for (const fd of arr) {
      count++;
      const export_list = {
        'Sr No': count,
        'FD Date': fd.fd_make_date,
        'FD No': fd.fd_no,
        'Bank Name': fd.bank_name,
        'FD Amount': fd.fd_amt,
        'Maturity Date': fd.fd_maturity_date,
        'FD Days': fd.fd_in_days,
        'Rate Int%': fd.roi,
        'Gross Interest': fd.gross_interest,
        'TDS Per%': fd.tds_percent,
        'TDS Amount': fd.tds_amt,
        'Net Interest': fd.net_interest,
        'Total Amount': fd.total_amt,
        'Release Date': fd.fd_release_date,
        'Release FD Days': fd.release_fd_in_days,
        'Release Rate Int%': fd.release_rate_of_interest,
        'Release Gross Interest': fd.release_gross_interest,
        'Release TDS Per%': fd.release_tds_per,
        'Release TDS Amount': fd.release_tds_amt,
        'Release Net Interest': fd.release_net_interest,
        'Release Total Amount': fd.release_total_amt
      };
      this.export_data.push(export_list);

      if (fd.status != 2) {
        total = total + fd.fd_amt;
      } else {
        total = total + 0;
      }

    }

    const foot = {
      'FD Date': 'Total Amount',
      'FD Amount': total
    };
    this.export_data.push(foot);
  }


  exportPdf() {
    this.exportData();
    for (let col of this.cols) {
      if (col.header !== 'Edit' && col.header !== 'Delete' && col.header !== 'Action') {
        this.exportColumns.push({ title: col.header, dataKey: col.header });
      }
      // }else{
      //   return {title: col.header, dataKey: col.header}
      // }
    }
    // this.exportColumns = this.cols.filter((col,index) => {
    //       if(col.header == 'Edit' || col.header == 'Delete' || col.header == 'Action' ){

    //       }else{
    //         return {title: col.header, dataKey: col.header}
    //       }
    // });
    this.exportService.exportPdf(this.exportColumns, this.export_data, 'FD-List');
  }



  exportExcel() {
    this.exportData();
    this.exportService.exportExcel(this.export_data, 'FD-List');
  }

  // conver string to array
  getDocsArray(docs: string) {
    return JSON.parse(docs);
  }


  // on your component class declare
  onFilter(event, dt) {
    this.filteredValuess = [];
    // this.allFDs = [];
    this.entireTotalAmt = 0;

    this.filteredValuess = event.filteredValue;
    // this.allFDs =  this.filteredValuess;
    if (this.filteredValuess.length > 0) {
      let openFdAmt = 0;
      let closeFdAmt = 0;
      this.entireTotalAmt = this.filteredValuess.reduce((prev, curr) => {
        if (curr['fd_release_date'] == null) {
          if (curr['status'] != 2) {
            openFdAmt = openFdAmt + curr['fd_amt'];
            return openFdAmt;
          } else {
            openFdAmt = openFdAmt + 0;
            return openFdAmt;
          }

        } else {
          closeFdAmt = closeFdAmt + curr['fd_amt'];
          return closeFdAmt;
        }
      }, 0);
    }



  }

  onRefresh() {
    this.selectedFdAgainst = null;
    this.selectedBank = null;
    this.selectedFdType = null;
    this.getAllFds();
  }

  onFdLink(item) {
    this.fd_link = true;
    this.fd_array = item;
  }

  BackFromParent(event) {
    this.fd_link = false;
    this.fd_array = [];
    this.getAllFds();
  }

  onPaymentClick(item) {

    const record_id = item.id;
    const sub_org_id = 7935;
    const sub_org_name = 'SPIPL - Sushila Parmar International Pvt. Ltd. ';
    // const deal_rate = item.payment_remaining;
    const amount = item.total_amt;



    const req_flag = staticValues.payable_req_flag[0].FD;
    const emp_id = 0;

    const headerMsg = 'Payment Details for FD No: ' + record_id;



    this.payablePara = new PayableParameter(sub_org_id, emp_id, headerMsg, amount, record_id, req_flag, sub_org_name, true, true, this.company_id);
    this.payableExit = false;
  }

  backFromPayable(event) {
    this.payablePara = null;
    this.payableExit = true;
  }


}
