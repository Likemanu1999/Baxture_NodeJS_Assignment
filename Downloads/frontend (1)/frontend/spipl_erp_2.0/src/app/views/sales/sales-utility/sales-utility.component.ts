import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core";
import { ToasterConfig, ToasterService } from "angular2-toaster";
import { DatePipe } from "@angular/common";
import { Table } from "primeng/table";
import { Dispatch, SubOrg } from "../../../shared/apis-path/apis-path";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { ExportService } from "../../../shared/export-service/export-service";
import { LoginService } from "../../login/login.service";
import { PermissionService } from "../../../shared/pemission-services/pemission-service";
import { UserDetails } from "../../login/UserDetails.model";

@Component({
	selector: 'app-sales-utility',
	templateUrl: './sales-utility.component.html',
	styleUrls: ['./sales-utility.component.scss'],
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

export class SalesUtilityComponent implements OnInit {
	@ViewChildren("inputs") public inputs: ElementRef<HTMLInputElement>[];
	@ViewChild("dt", { static: false }) table: Table;

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
	total_outstanding: any;
	total_recieved: any;
	actual_payment: any;

	constructor(public datePipe: DatePipe,
		toasterService: ToasterService,
		private loginService: LoginService,
		public crudServices: CrudServices
	) {
		this.toasterService = toasterService;
		this.user = this.loginService.getUserDetails();
	}

	ngOnInit() {
		this.getCustomers()
		this.cols = [
			{ field: "customer_name", header: "Customer Name", permission: true },
			{ field: "invoice_no", header: "Invoice No", permission: true },
			{ field: "invoice_date", header: "Invoice Date", permission: true },
			{ field: "total_amount", header: "Total Amount", permission: true },
			{ field: "interest_amount", header: "Interest Amount", permission: true },
			{ field: "actual_payment", header: "Actual Payment", permission: true },
			{ field: "total_recieved", header: "Total Recieved", permission: true },
			{ field: "total_pending", header: "Total Pending", permission: true },
		];
		this.selectedColumns = this.cols;
	}

	getCustomers() {
		this.crudServices.getAll<any>(SubOrg.getDistinctCustomers).subscribe((res) => {
			if (res.data.length > 0) {
				this.customersList = res.data
			}

		});
	}

	onCustomer(event) {
		if (event) {
			if (event.sub_org_id) {
				this.loadData(event.sub_org_id)
			} else {
				this.loadData(null)
			}
		}
	}

	update(event, dispatch_id, column_name, item) {
		this.total_outstanding = 0;
		this.total_recieved = 0;
		this.actual_payment = 0;
		let body = {
			utility_used_by: this.user.userDet[0].id,
			utility_used_on: new Date(),
		};
		body[column_name] = Number(event.target.value);
		if (column_name == 'total_recieved') {
			body['total_recieved'] = Number(event.target.value);
		}
		if (column_name == 'interest_amount') {
			body['actual_payment'] = Number(event.target.value) + Number(item.total_amount);
		}

		if (body['actual_payment'] == item.total_recieved) {
			body['payment_status'] = 1;
		} else {
			body['payment_status'] = 0;
		}

		this.crudServices.updateData(Dispatch.update, { id: dispatch_id, data: body }).subscribe(data => {
			this.data.map((element) => {
				if (element.id === dispatch_id) {
					element[column_name] = Number(event.target.value);
					if (column_name == 'total_recieved') {
						element.total_recieved = Number(event.target.value);
					}
					if (column_name == 'interest_amount') {
						element.actual_payment = Number(event.target.value) + element.total_amount;
					}
					element.total_pending = Number(element.actual_payment) - Number(element.total_recieved)
				}
				this.calculate(element);
			})
			if (column_name == 'total_recieved') {
				this.toasterService.pop('success', `Total Amount Update`, 'Updated!');
			}
			if (column_name == 'interest_amount') {
				this.toasterService.pop('success', `Interest Amount Update`, 'Updated!');
			}
		});
	}

	loadData(id) {
		this.total_outstanding = 0;
		this.total_recieved = 0;
		this.actual_payment = 0;
		let body = {};
		if (id) {
			body['sub_org_id'] = id;
		}
		this.isLoading = true;
		this.crudServices.getOne<any>(Dispatch.getOne, body).subscribe((res) => {
			if (res['data'].length > 0) {
				res.data.forEach((element) => {
					element.delivery_term_name = `${element.delivery_term ? element.delivery_term.term : ''} (${element.delivery_term ? element.delivery_term.charges : ''}) `
					element.sub_org_name = element.finance_planning ? element.finance_planning.sales_consignment.sub_org_master ? element.finance_planning.sales_consignment.sub_org_master.sub_org_name : '' : null;
					element.gradeName = element.grade_master ? element.grade_master.grade_name : null;
					element.UnitType = element.grade_master ? element.grade_master.unit_mt_drum_master.name : null;
					element.marketingPerson = `${element.finance_planning ? element.finance_planning.sales_consignment.marketingPerson.first_name : ''}  ${element.finance_planning ? element.finance_planning.sales_consignment.marketingPerson.last_name : ''} `
					element.booking_date = element.finance_planning ? element.finance_planning.sales_consignment.booking_date : '';
					element.godownName = element.godown ? element.godown.godown_name : null;
					element.transporterName = element.transporterId ? element.transporterId.sub_org_name : null;
					element.billingStatus = element.invoice_no ? "Complete" : "Pending";
					element.total_pending = Number(element.actual_payment) - Number(element.total_recieved);
					element.payment_status = element.payment_status;
					this.calculate(element);
				});
				this.data = res.data;
			} else {
				this.data = [];
			}
			this.isLoading = false;
		});
	}

	calculate(number) {
		this.total_outstanding = this.total_outstanding + number.total_pending;
		this.total_recieved = this.total_recieved + number.total_recieved;
		this.actual_payment = this.actual_payment + number.actual_payment;
	}

}
