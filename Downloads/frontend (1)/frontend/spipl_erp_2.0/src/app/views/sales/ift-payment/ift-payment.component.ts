import { NgAnalyzeModulesHost, } from '@angular/compiler';
import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { SortEvent } from 'primeng/api';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { salesIftPayment } from '../../../shared/apis-path/apis-path';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { map } from 'rxjs-compat/operator/map';
import { staticValues } from '../../../shared/common-service/common-service';
import * as moment from 'moment';

@Component({
	selector: 'app-ift-payment',
	templateUrl: './ift-payment.component.html',
	styleUrls: ['./ift-payment.component.scss'],
	providers: [CrudServices, ToasterService]
})
export class IftPaymentComponent implements OnInit {
	@ViewChild('iftpaymentModal', { static: false }) public iftpaymentModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;
	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});
	page_title: any = "IFT Payment";
	iftpaymentform: FormGroup;
	data: any;
	filter: any = [];
	cols: any = [];		
	loadingBtn: boolean = false;
	isLoading: boolean = false;
	bankAccountNumber: any = '';
	ifscCode: any = '';
	DetailsData: any;
	datePickerConfig: any = staticValues.datePickerConfig;
		selected_date_range: any = [
		new Date(moment().subtract(60, 'days').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	max_date: any = new Date();
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	maxDate: Date = new Date();
	dateFormat: any;
	selected_cols: { field: string; header: string; sort: boolean; filter: boolean; dropdown: any[]; footer: boolean; total: number; type: any; }[];
	

	constructor(
		private crudServices: CrudServices,
		private http: HttpClient,
		private datepipe: DatePipe,
		private toasterService: ToasterService) { }

	ngOnInit() {
		this.initForm();
		this.getData();
		this.geVaData();
		this.getCols();
	}
	
	initForm() {
		this.iftpaymentform = new FormGroup({
			va_number: new FormControl(null, Validators.required),			
			bank_account_number: new FormControl(null, Validators.required),
			ifsc_code: new FormControl(null, Validators.required),
			amount: new FormControl(null, Validators.required),
			utr_number: new FormControl(null, Validators.required),
			date: new FormControl(null, Validators.required)
		});
	}
		
	geVaData() {
		this.crudServices.getAll<any>(salesIftPayment.getVirtualAccountData).subscribe((res: any) => {
			if (res.status == 200) {
				if (res.data.length > 0) {
					res.data.map(item => item.sub_org_name_va = `${item.sub_org_name} (${item.virtual_acc_no})`)
					this.data = res.data;
				}
				else {				
					this.toasterService.pop('error', 'Alert', 'No Virtual Account Found..!');
				}
			}
		})
	}
	
	
	getData() {
		let condition = {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
		  }		
		this.crudServices.getOne<any>(salesIftPayment.getVirtualAccountDetailsNew, condition).subscribe((res: any) => {
			if (res.status == 200) {
				if (res.data.length > 0) {
					this.DetailsData= res.data
				}
				else {							
					this.toasterService.pop('error', 'Alert', 'No Data Found..!');		
				}
				this.pushDropdown(this.DetailsData);
				this.footerTotal(this.DetailsData);
			}
			this.table.reset();
		})
	}

	getCols() {		
		this.cols = [
			{ field: "virtual_acc_no", header: "VA Number", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "bank_acc_no", header: "Bank Account Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "ifsc_code", header: "IFSC Code", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "amount", header: "Amount", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "utr_no", header: "UTR Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "payment_date", header: "Actual Payment Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "created_at", header: "System Added Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			
		];	
		this.selected_cols = [
			{ field: "virtual_acc_no", header: "VA Number", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "bank_acc_no", header: "Bank Account Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "ifsc_code", header: "IFSC Code", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "amount", header: "Amount", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "utr_no", header: "UTR Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "payment_date", header: "Actual Payment Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "created_at", header: "System Added Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
		];	
		this.filter = ['virtual_acc_no','company_name'];
		this.getData();		
	}
	
	@Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"selected_ift_payment_col",
			JSON.stringify(this.selected_cols)
		);
		return this.selected_cols;
	}

	set selectedColumns(val: any[]) {
		this.selected_cols = this.cols.filter((col) => val.includes(col));
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	getColumnPresent(col) {
		if (this.selected_cols.find((ob) => ob.field === col)) {
			return true;
		} else {
			return false;
		}
	}

	pushDropdown(arg) {	
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.selected_cols.filter(col => col.filter == true);		
		filter_cols.forEach(element => {
			let unique = data.map(item =>
				item[element.field]
			).filter((value, index, self) =>
				self.indexOf(value) === index
			);
			let array = [];
			unique.forEach(item => {
				array.push({
					value: item,
					label: item
				});
			});
			element.dropdown = array;			
		});
	}

	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.selected_cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			}

		});
	}

	customFilter(value, col, data) {				
		let res = this.table.filter(value, col, data);		
		this.footerTotal(this.data);		
	}

	onFilter(e, dt) {	
		this.footerTotal(dt.filteredValue);
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.dateFormat))
			this.uploadSuccess.emit(false);
	}
	
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

	add_new() {
		this.iftpaymentModal.show();			
	}
	
	onCloseModal() {
		this.iftpaymentModal.hide();
		this.iftpaymentform.reset();

	}
	  
	onSubmit() {
		this.loadingBtn = true;
		let dateFormat = moment(this.iftpaymentform.value.date).format('DD-MMM-YY');
		let currentTime = moment().format('h:mm:ss.SSS A');
		let dateTimeNew = dateFormat + ' ' + currentTime;
		let orgName = this.data.filter(item => item.virtual_acc_no == this.iftpaymentform.value.va_number)
		let data = {
			customerCode: "SUSHILA",
			customerName: "SUSHILA PARMAR INTERNATIONAL PRIVATE LIMITED",
			productCode: "IRTGS",
			poolingAccountNumber: "10031128205",
			transactionType: "Collections",
			dataKey: "Deposit / Reinvestment",
			batchAmt: this.iftpaymentform.value.amount,
			batchAmtCcd: "INR",
			creditDate: dateTimeNew,
			vaNumber: this.iftpaymentform.value.va_number,
			utrNo: this.iftpaymentform.value.utr_number,
			creditGenerationTime: dateTimeNew,
			remitterName: orgName[0].sub_org_name,
			remitterAccountNumber: this.iftpaymentform.value.bank_account_number,
			ifscCode: this.iftpaymentform.value.ifsc_code
		};
		this.crudServices.postRequest<any>(salesIftPayment.addData, data).subscribe((res: any) => {
			if (res.code == 100) {
				this.toasterService.pop('success', 'success', 'Successfully Added');
				this.iftpaymentform.reset();
			} else {
				this.toasterService.pop('error', 'Alert', 'Something Went Wrong..!');
			}
		});
		this.onCloseModal();
	}
	onChangeValue(e) {
		if (e != null && e != undefined) {
			this.bankAccountNumber = e.org_bank_masters[0].account_no;
			this.ifscCode = e.org_bank_masters[0].ifsc_code
		}
		else if (e == undefined) {
			this.iftpaymentform.reset()
		}
	}
}