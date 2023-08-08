import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service';
import { DatePipe } from '@angular/common';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { Ilc_Bex } from '../../../../shared/apis-path/apis-path';
import { Table } from 'primeng/table';
import { ExportService } from '../../../../shared/export-service/export-service';


import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ConfirmationService } from 'primeng/components/common/confirmationservice';
import { UserDetails } from '../../../login/UserDetails.model';


@Component({
  selector: 'app-bill-of-exchange-list',
  templateUrl: './bill-of-exchange-list.component.html',
  styleUrls: ['./bill-of-exchange-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PermissionService,
    LoginService,
    DatePipe,
    CrudServices,
    ExportService,
    ToasterService,
    ConfirmationService

  ]
})
export class BillOfExchangeListComponent implements OnInit {
  @ViewChild('dt', { static: false }) table: Table;

  bsRangeValue: any;
  currentYear: number;
  be_date_from: string;
  be_date_to: string;
  be_date: string;
  dut_dt: string;
  conf_issue_dt: string;
  isLoading: boolean = false;

  public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;


  date = new Date();
  cols: { field: string; header: string; style: string; }[];
  data: any;
  supplier_list = [];
  bank_list = [];
  beAmount: any;
  amountCreditedToSupplier: any;
  filteredValuess: any[];
  export_list: any;
  exportColumns: { title: string; dataKey: string; }[];
  company_id: any;
	role_id: any;
	user: UserDetails;


  public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
  displayPop: boolean;

  status = [{ label: 'All', value: 3 }, { label: 'Pending', value: 0 }, { label: 'Remit', value: 1 } ]
  selected_status = 0;

  constructor(
    private permissionService: PermissionService,
    private datepipe: DatePipe,
    private crudServices: CrudServices,
    private toasterService: ToasterService,
    private exportService: ExportService,
    private confirmationService: ConfirmationService,
    private loginService: LoginService,
  ) {
    this.user = this.loginService.getUserDetails();
    this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
    this.cols = [

      { field: 'supplierName', header: 'Supplier Name', style: '200px' },
      { field: 'spiplBankName', header: 'Bank Name', style: '200px' },
      { field: 'Download Doc', header: 'Download Doc', style: '200px' },
      { field: 'bank_ref_no', header: 'Bank Reference No.', style: '150px' },
      { field: 'be_date', header: 'Bill of Exchange Date', style: '150px' },
      { field: 'be_no', header: 'Bill of Exchange Number', style: '200px' },
      { field: 'dut_dt', header: 'Bill of Exchange Due Date', style: '300px' },
      { field: 'be_amount', header: 'Amount', style: '150px' },
      { field: 'remark', header: 'Remark', style: '180px' },
      { field: 'conf_issue_dt', header: 'Bex Issue Date', style: '150px' },
      { field: 'discount_date', header: 'Bex Discount Date', style: '100px' },
      { field: 'discount_rate', header: 'Bex Discount Rate', style: '150px' },
      { field: 'margin_money', header: 'Bex Margin Money', style: '100px' },
      { field: 'amt_credit_supplier', header: 'Amount Credited to Supplier', style: '100px' },


    ];


  }


  ngOnInit() {
    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    if (this.datepipe.transform(this.date, 'MM') > '03') {

      this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

  } else {

      this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

  }
   // this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

  }
  onRangeSelect(event , type) {

    console.log(event);
    

    if(type == 1) {
      this.be_date_from = '';
      this.be_date_to = '';
      if (event !== null) {
        this.be_date_from = event[0];
        this.be_date_to = event[1];
      }
    }

    if(type == 2) {
      this.selected_status = event.value;
    }
 
    this.getList();
  }

  getList() {
    this.crudServices.getOne<any>(Ilc_Bex.getAll, {
      be_date_from: this.be_date_from,
      be_date_to: this.be_date_to,
      status : this.selected_status,
      company_id : this.role_id == 1 ? null : this.company_id 
    }).subscribe(response => {
    
      let lookupSupplier = {};
      let lookupBank = {};
      this.data = response;
      this.filteredValuess = response;
      this.beAmount = this.data.reduce((sum, item) =>
        sum + item.be_amount, 0
      );


      this.amountCreditedToSupplier = this.data.reduce((sum, item) =>
        sum + item.amt_credit_supplier, 0
      );
      for (let item, i = 0; item = response[i++];) {

        if (!(item.supplierName in lookupSupplier)) {
          lookupSupplier[item.supplierName] = 1;
          this.supplier_list.push({ 'supplierName': item.supplierName });
        }

        if (!(item.spiplBankName in lookupBank)) {
          lookupBank[item.spiplBankName] = 1;
          this.bank_list.push({ 'spiplBankName': item.spiplBankName });
        }
      }
    });
  }


  getDocsArray(doc) {
    return JSON.parse(doc);
  }

  // date filter
  onDateSelect($event, name) {
    this.table.filter(this.convert($event), name, 'equals');
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


  convert(date) {
    if (date) {
      return this.datepipe.transform(date, 'yyyy-MM-dd');
    } else {
      return '';
    }
  }

  // on your component class declare
  onFilter(event, dt) {
    this.filteredValuess = [];
    this.filteredValuess = event.filteredValue;
    this.beAmount = this.filteredValuess.reduce((sum, item) =>
      sum + item.be_amount, 0
    );
    this.amountCreditedToSupplier = this.filteredValuess.reduce((sum, item) =>
      sum + item.amt_credit_supplier, 0
    );
  }


  // data exported for pdf excel download
  exportData() {

    let arr = [];
    const foot = {};
    if (this.filteredValuess === undefined) {
      arr = this.data;
    } else {
      arr = this.filteredValuess;
    }

    for (let i = 0; i < arr.length; i++) {
      const exportData = {};
      for (let j = 0; j < this.cols.length; j++) {
        exportData[this.cols[j]['header']] = arr[i][this.cols[j]['field']];
      }

      this.export_list.push(exportData);

    }

    for (let j = 0; j < this.cols.length; j++) {
      if (this.cols[j]['field'] === 'be_amount') {
        foot[this.cols[j]['header']] = this.beAmount;
      } else if (this.cols[j]['field'] === 'amt_credit_supplier') {
        foot[this.cols[j]['header']] = this.amountCreditedToSupplier;
      } else {
        foot[this.cols[j]['header']] = '';
      }

    }

    this.export_list.push(foot);

  }

  // download doc ,pdf , excel

  exportPdf() {
    this.export_list = [];
    this.exportData();
    // console.log(this.export_lifting_list);
    this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.header }));
    this.exportService.exportPdf(this.exportColumns, this.export_list, 'Bill-Of-Exchange-List');
  }

  exportExcel() {
    this.export_list = [];
    this.exportData();
    this.exportService.exportExcel(this.export_list, 'Bill-Of-Exchange-List');
  }

  getStatus(val) {
     if(val == 0) {
       return '<span class="badge badge-danger">Pending</span>'
     } else  if(val == 1) {
      return '<span class="badge badge-success">Remit</span>'
    }
  }

  updateStatus(event , id) {
    console.log(id);
    
    if(event.target.value != '') {
      const msg = '<strong>Change Status</strong>';

    this.confirmationService.confirm({
        message: msg,
        header: 'Are You Sure to change status ?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.crudServices.updateData<any>(Ilc_Bex.updateStatus , {status : event.target.value , id : id}).subscribe(response => {
            console.log(response);


            if(response.code == 100) {

              this.toasterService.pop(response.message, response.message, response.data);
              this.getList();

            } else {
              this.toasterService.pop('error', 'error', 'Something Went Wrong');
            }
          })
        },
    });

    } else {
      this.toasterService.pop('error', 'error', 'Select Status');
    }

  }

  onReject() {
    this.displayPop = false;
  }

  bexDocDownload(item) {

    let date = new Date();
    let Today = this.datepipe.transform(date, 'dd.MM.yyyy');
    const newstr = '<html>\n' +
      '<head>\n' +
      '	<title></title>\n' +
      '</head>\n' +
      '<body>\n' +
      '<table class="Table" style="border:undefined">\n' +
      '	<tbody>\n' +
      '		<tr>\n' +
      '			<td>\n' +
      '			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">Date:- ' + Today + '</span></span></span></span></span></p>\n' +
      '			</td>\n' +
      '		</tr>\n' +
      '		<tr>\n' +
      '			<td>\n' +
      '			<p style="margin-left:0in; margin-right:0in"><br />\n' +
      '			<span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">To,<br />\n' +
      '			The Assistant General Manager,<br />\n' +
      '			' + item.spiplBankName + ',</span></span></span></span></span></p>\n' +
      '\n' +
      '			<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">' + item.spiplBankAddress + '</span></span></span></span></span></p>\n' +
      '			</td>\n' +
      '		</tr>\n' +
      '		<tr>\n' +
      '			<td>\n' +
      '			<p style="margin-left:0in; margin-right:0in"><br />\n' +
      '			<span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">Dear Sir,</span></span></span></span></span></p>\n' +
      '			</td>\n' +
      '		</tr>\n' +
      '		<tr>\n' +
      '			<td>\n' +
      '			<p style="margin-left:0in; margin-right:0in"><br />\n' +
      '			<span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">This is reference to the LC No.' + item.ilcNo + 'dtd. ' + item.ilcOpeningDate + ' established in favour of ' + item.supplierName + '</span></span></span></span></span></p>\n' +
      '			</td>\n' +
      '		</tr>\n' +
      '		<tr>\n' +
      '			<td>\n' +
      '			<p style="margin-left:0in; margin-right:0in">&nbsp;</p>\n' +
      '\n' +
      '			<table class="Table" style="border:undefined; width:100.0%">\n' +
      '				<tbody>\n' +
      '					<tr>\n' +
      '						<td>\n' +
      '						<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif">BOE NO.</span></span></span></span></p>\n' +
      '						</td>\n' +
      '						<td>\n' +
      '						<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif">DATE</span></span></span></span></p>\n' +
      '						</td>\n' +
      '						<td>\n' +
      '						<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif">Amount</span></span></span></span></p>\n' +
      '						</td>\n' +
      '						<td>\n' +
      '						<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif">Due Date</span></span></span></span></p>\n' +
      '						</td>\n' +
      '					</tr>\n' +
      '					<tr>\n' +
      '						<td>\n' +
      '						<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif">' + item.be_no + '</span></span></span></span></p>\n' +
      '						</td>\n' +
      '						<td>\n' +
      '						<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif">' + this.datepipe.transform(item.be_date, 'dd.MM.yyyy') + '</span></span></span></span></p>\n' +
      '						</td>\n' +
      '						<td>\n' +
      '						<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif">' + item.be_amount + '</span></span></span></span></p>\n' +
      '						</td>\n' +
      '						<td>\n' +
      '						<p style="margin-left:0in; margin-right:0in"><span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif">' + this.datepipe.transform(item.dut_dt, 'dd.MM.yyyy') + '</span></span></span></span></p>\n' +
      '						</td>\n' +
      '					</tr>\n' +
      '				</tbody>\n' +
      '			</table>\n' +
      '\n' +
      '			<p style="margin-left:0in; margin-right:0in">&nbsp;</p>\n' +
      '			</td>\n' +
      '		</tr>\n' +
      '		<tr>\n' +
      '			<td>\n' +
      '			<p style="margin-left:0in; margin-right:0in"><br />\n' +
      '			<span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">The documents under the above LC is acceptable to us. Discrepancies if any are also acceptable.</span></span></span></span></span></p>\n' +
      '			</td>\n' +
      '		</tr>\n' +
      '		<tr>\n' +
      '			<td>\n' +
      '			<p style="margin-left:0in; margin-right:0in"><br />\n' +
      '			<span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">We hereby authorize you to debit our CC A/C No.' + item.spiplBankAccNo + ' for the above mentioned amount on respective due dates.</span></span></span></span></span></p>\n' +
      '			</td>\n' +
      '		</tr>\n' +
      '		<tr>\n' +
      '			<td>\n' +
      '			<p style="margin-left:0in; margin-right:0in"><br />\n' +
      '			<br />\n' +
      '			<span style="font-size:11pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:10.0pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">Thanking you.<br />\n' +
      '			<br />\n' +
      '			Yours faithfully</span></span></span></span></span></p>\n' +
      '			</td>\n' +
      '		</tr>\n' +
      '	</tbody>\n' +
      '</table>\n' +
      '</body>\n' +
      '</html>\n' +
      '\n';;
    let html_document = '<!DOCTYPE html><html><head><title></title>';
    html_document += '</head><body>' + newstr + '</body></html>';
    let converted = htmlDocx.asBlob(html_document, { orientation: 'potrait' });
    saveAs(converted, 'Bex Document');
  }






}
