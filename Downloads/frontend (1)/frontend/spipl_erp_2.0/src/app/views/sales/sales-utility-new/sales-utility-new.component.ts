import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core";
import { ToasterConfig, ToasterService } from "angular2-toaster";
import { DatePipe } from "@angular/common";
import { Table } from "primeng/table";
import { Dispatch, DispatchPayments, SalesUtility, SubOrg } from "../../../shared/apis-path/apis-path";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ExportService } from "../../../shared/export-service/export-service";
import { LoginService } from "../../login/login.service";
import { PermissionService } from "../../../shared/pemission-services/pemission-service";
import { UserDetails } from "../../login/UserDetails.model";
import { staticValues } from "../../../shared/common-service/common-service";
import { ModalDirective } from "ngx-bootstrap";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";


@Component({
	selector: 'app-sales-utility-new',
	templateUrl: './sales-utility-new.component.html',
	styleUrls: ['./sales-utility-new.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ExportService,
		DatePipe,
		ToasterService,
		LoginService,
		CrudServices,
		PermissionService
	]
})
export class SalesUtilityNewComponent implements OnInit {
	@ViewChildren("inputs") public inputs: ElementRef<HTMLInputElement>[];
	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild("viewModal", { static: false }) public viewModal: ModalDirective;
	@ViewChild("amountModal", { static: false }) public amountModal: ModalDirective;
	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	user: UserDetails;
	isLoading = false;
	cols: any = [];
	selectedColumns: any = [];
	data: any = [];
	customersList: any = [];
	viewData: any = [];
	viewName: any = [];
	total_outstanding: any;
	total_recieved: any;
	actual_payment: any;
	role_id: any;
	company_id: any;
	companyList: any = staticValues.company_list_new;
	selected_company: any;
	customers: any;
	links: any;
	company_filter: boolean;
	recievedAmountForm : FormGroup
	recordId: any;
	datePickerConfig: any = staticValues.datePickerConfig;
	totalPending: any;
	amountExceed:boolean = false;
	
	bsRangeValue2: any = [];
	currentYear: number;
	currdate = new Date();
	isRange: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	fromDate: string;
	toDate: string;
	subOrgId: any = 0;
	maxDate: any = new Date();
	invoices = [];
	type_list = [];
	lookup = {};
	lookupType = {};
	constructor(public datePipe: DatePipe,
		toasterService: ToasterService,
		private loginService: LoginService,
		public crudServices: CrudServices,
		public datepipe: DatePipe,
	) {

		
		this.currentYear = Number(this.datepipe.transform(this.currdate, 'yyyy'));
		if (this.datepipe.transform(this.currdate, 'MM') > '03') {

			this.bsRangeValue2 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.bsRangeValue2 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

		}

		this.toasterService = toasterService;
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.company_filter = (this.links.find(x => x == 'sales_utility_company_filter') != null) ? true : false;
		this.user = this.loginService.getUserDetails();
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;
		if (this.role_id != 1 && this.company_filter == false) {
			this.selected_company = this.company_id
		}
	}

	ngOnInit() {
		this.fromDate = this.bsRangeValue2[0];
		this.toDate = this.bsRangeValue2[1];
		this.getCustomers();
		this.recievedAmountForm = new FormGroup({
			received_amount: new FormControl(null, Validators.required),
			total_amount: new FormControl(null),
			editedDate : new FormControl(null,Validators.required)
			
		});
		this.cols = [
			{ field: "customer", header: "Customer Name", permission: true },
			{ field: "virtual_acc_no", header: "Virtual Account Number", permission: true },
			{ field: "invoice_no", header: "Invoice No", permission: true },
			{ field: "added_date", header: "Dispatch Date", permission: true },
			{ field: "payment_due_date", header: "Payment Due  Date", permission: true },
			{ field: "total_amount", header: "Total Amount", permission: true },
			{ field: "received_amount", header: "Total Recieved", permission: true },
			{ field: "payment_type", header: "Payment Type", permission: true },
			{ field: "total_pending", header: "Total Pending", permission: true },
			{ field: "status", header: "Status", permission: true },
			{ field: "payment_received_date", header: "Recieved Date", permission: true },
			{ field: "import_local_flag", header: "Import/Local", permission: true },
			{ field: "utility_used_by", header: "Utility Used By", permission: true }
		];
		this.selectedColumns = this.cols;
	}

	getData(){

	}

	onchange(event, name) {
		const arr = [];
		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			// console.log(arr);
			this.table.filter(arr, name, 'in');

		} else {
			this.table.filter('', name, 'in');
		}
	}

	viewUtility(item){
		this.crudServices.getOne<any>(SalesUtility.getOne, { Sub_org_id: item.sub_org_id, invoice_no: item.invoice_no }).subscribe((res) => {
			if(res.data.length > 0){
				this.viewData = res.data;
			this.viewName = item.name;
				this.viewModal.show();
			}
			else{
				this.toasterService.pop('warning', `No Data Found`, '');
			}	
		});
	
	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.bsRangeValue2))
			this.uploadSuccess.emit(false);
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.bsRangeValue2 = dateValue.range;
		// this.selected_date_range = dateValue.range;

	}

	closeModal() {
		this.viewModal.hide();
		this.amountModal.hide();
	}

	getCustomers() {
		let condition = {}
		this.customersList = [];
		this.customers = null;
		this.data = [];
		if (this.selected_company != null && this.selected_company != undefined) {
			condition['product_type'] = this.selected_company;
		}
		this.crudServices.getOne<any>(DispatchPayments.getDistinctCustomersFromDispatchPayment, condition).subscribe((res) => {
			if (res.data.length > 0) {
				this.customersList = res.data
			}
		});
		
	}
	updateAmount(item){
		this.recordId = item,
		this.totalPending = Number(item.total_amount) - Number(item.received_amount)
		this.recievedAmountForm.patchValue({
			total_amount: this.totalPending.toFixed(2)
		})
		this.amountModal.show();
	}
	updateAmountData(e){
		this.update(e, this.recievedAmountForm.value,"received_amount", this.recordId) 
		
	}

	onCustomer(event) {
		
		if (event) {
			if (event.sub_org_id) {
				this.subOrgId = event.sub_org_id;
				this.loadPaymentData()
			} else {
				this.data = []
				// this.loadPaymentData(null)
			}
		}
	}

	update(event,updatedData, column_name, item) {
		let body = {
			utility_used_by: this.user.userDet[0].id,
			utility_used_date:updatedData.editedDate,
		};

		if (column_name == 'received_amount') {
			body['received_amount'] = Number(updatedData.received_amount) + Number(item.received_amount);
			if (body['received_amount'] == item.total_amount) {
				body['status'] = 1;
			} else {
				body['status'] = 0;
			}
		}
		this.amountModal.hide();
		this.crudServices.updateData(DispatchPayments.update, { data: body, id: item.id }).subscribe(result => {
			this.toasterService.pop('success', `${column_name} Updated`, 'Updated!');
			this.loadPaymentData();
		})

		let data = {
			utility_used_by: this.user.userDet[0].id,
			utility_used_date: updatedData.editedDate,
			dispatch_id:item.dispatch_id,
			dispatch_payment_id:item.id,
			invoice_no:item.invoice_no,
			sub_org_id:item.sub_org_id,
			total_amount:item.total_amount,
			received_amount : item.received_amount
		};
		if (column_name == 'received_amount') {
			data['received_amount'] = Number(updatedData.received_amount);
			if (data['received_amount'] == item.total_amount) {
				data['status'] = 1;
			} else {
				data['status'] = 0;
			}
		}


		this.crudServices.addData(SalesUtility.add,{
			data:data, 
		 }).subscribe((data) => {
		}, (error) => console.error(error));
		this.recievedAmountForm.reset();
	}

	loadPaymentData() {
		let condition = {
			sub_org_id: this.subOrgId,
			fromDate: this.bsRangeValue2[0],
			toDate: this.bsRangeValue2[1]
		}
		this.crudServices.getOne(DispatchPayments.getDispatchPaymentsBySuborg, condition).subscribe(result => {
			if (result['data'].length > 0) {
				this.data = result['data'];
				for(let val of this.data){
					if (!(val.invoice_no in this.lookup)) {
						this.lookup[val.invoice_no] = 1;
						this.invoices.push({ 'invoice_no': val.invoice_no });
					}
					if (!(val.import_local_flag in this.lookupType)) {
						this.lookupType[val.import_local_flag] = 1;
						this.type_list.push({ 'import_local_flag': val.import_local_flag });
					}
				}
			}else{
				this.data = [];
			}
		})
	}

	checkLimit() {
		this.totalPending = this.recordId.total_amount - this.recordId.received_amount;
		const enteredAmt = this.recievedAmountForm.controls.received_amount.value;
		if(enteredAmt > this.totalPending){
			this.amountExceed = true;
			this.recievedAmountForm.controls.received_amount.patchValue(null);
		}else{
			this.amountExceed = false;
		}
	  }

	calculate(number) {
		this.total_outstanding = this.total_outstanding + number.total_pending;
		this.total_recieved = this.total_recieved + number.total_recieved;
		this.actual_payment = this.actual_payment + number.actual_payment;
	}
	getMinusOperation(total, received) {
		return Number(total) - Number(received);
	}

	getSumOf(arraySource, field) {
		return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0);
	}
}
