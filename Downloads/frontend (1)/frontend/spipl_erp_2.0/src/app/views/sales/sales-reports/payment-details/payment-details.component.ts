import * as moment from "moment";

import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { DatePipe, Location } from '@angular/common';
import { SalesReports, SubOrg } from "../../../../shared/apis-path/apis-path";

import { CrudServices } from "../../../../shared/crud-services/crud-services";
import { ExportService } from "../../../../shared/export-service/export-service";
import { HttpClient } from "@angular/common/http";
import { LoginService } from "../../../login/login.service";
import { ModalDirective } from "ngx-bootstrap";
import { PermissionService } from "../../../../shared/pemission-services/pemission-service";
import { Table } from "primeng/table";
import { ToasterService } from "angular2-toaster";
import { UserDetails } from "../../../login/UserDetails.model";

@Component({
	selector: 'app-payment-details',
	templateUrl: './payment-details.component.html',
	styleUrls: ['./payment-details.component.scss'],
	providers: [PermissionService, CrudServices, ExportService, LoginService]
})

export class PaymentDetailsComponent implements OnInit {
	@ViewChild("table", { static: false }) table: Table;
	user: UserDetails;
	links: any = [];
	cols: { field: string; header: string; permission: boolean; }[];
	paymentDetails: any = [];
	customerList: any = [];
	virtualAccountList: any = [];
	isLoading: boolean;
	filteredValues: any = [];
	export_payment_list: any = [];
	total_payment_received: number = 0;
	total_payment_utilization: number = 0;
	constructor(private route: ActivatedRoute,
		private router: Router,
		private crudServices: CrudServices,
		private location: Location,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private exportService: ExportService) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		// this.dateRange = [intialDate, this.maxDate];
		if (this.user.userDet[0].role_id != 1 && this.user.userDet[0].role_id == 5) {
		}
	}

	ngOnInit() {
		this.cols = [
			{ field: "index", header: "#", permission: true },
			{ field: "sub_org_name", header: "Customer", permission: true },
			{ field: "virtual_acc_no", header: "Virtual Acc No", permission: true },
			{ field: "actual_amount", header: "Actual Amount", permission: true },
			{ field: "utilised_amount", header: "Utilised Amount", permission: true },
			{ field: "remark", header: "Remark", permission: true },
			{ field: "added_at", header: "Payment Date", permission: true },
		];

		this.loadData();
	}



	loadData() {
		this.isLoading = true;
		this.crudServices.getOne(SalesReports.getPaymentDetails, {}).subscribe(result => {
			if (result['code'] == 100 && result['data'].length > 0) {
				this.paymentDetails = result['data'].map((element) => {
					element.sub_org_name = element.sub_org_name ? element.sub_org_name : ''
					if (element && element.sub_org_name) {
						this.pushCustomer(element.sub_org_name);
					}
					if (element.virtual_acc_no) { this.pushvirtualAccount(element.virtual_acc_no); }
					this.isLoading = false;
					return element;
				});
				this.footerTotal();
			}
		})
	}


	pushvirtualAccount(virtual_acc_no) {
		if (this.virtualAccountList.length < 1) {
			this.virtualAccountList.push({ value: virtual_acc_no, label: virtual_acc_no });
		}
		else {
			let data = this.virtualAccountList.find(({ value }) => value === virtual_acc_no);
			if (!data) {
				this.virtualAccountList.push({ value: virtual_acc_no, label: virtual_acc_no });
			} else {
				return;
			}
		}
	}


	pushCustomer(subOrg) {
		if (this.customerList.length < 1) {
			this.customerList.push({ value: subOrg, label: subOrg });
		} else {
			let data = this.customerList.find(({ value }) => value === subOrg);
			if (!data) {
				this.customerList.push({ value: subOrg, label: subOrg });
			} else {
				return;
			}
		}
	}

	exportData() {
		let arr = [];
		const foot = {};
		let qty = 0;
		let amt = 0;
		if (this.filteredValues == undefined || this.filteredValues == null) {
			arr = this.paymentDetails;
		} else {
			arr = this.filteredValues;
		}
		for (let i = 0; i < arr.length; i++) {
			const export_non = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["header"] != "Actions") {
					export_non[this.cols[j]["header"]] =
						arr[i][this.cols[j]["field"]];
				}
			}
			this.export_payment_list.push(export_non);
		}
		this.export_payment_list.push(foot);
	}


	onFilter(event, dt) {
		this.filteredValues = [];
		this.total_payment_received = 0;
		this.total_payment_utilization = 0;
		this.filteredValues = event.filteredValue;
		this.footerTotal();
	}

	footerTotal() {
		let data = [];
		if (this.filteredValues.length == 0) {
			data = this.paymentDetails;
		} else {
			data = this.filteredValues;
		}
		for (let i = 0; i < data.length; i++) {
			if (data[i]["actual_amount"]) {
				this.total_payment_received =
					this.total_payment_received +
					Number(data[i]["actual_amount"]);
			}
			if (data[i]["utilised_amount"]) {
				this.total_payment_utilization =
					this.total_payment_utilization +
					Number(data[i]["utilised_amount"]);
			}
		}
	}



	exportExcel() {
		const foot = {};
		let arr = [];
		let export_list = []
		if (this.filteredValues) {
			arr = this.filteredValues;
		} else {
			arr = this.paymentDetails
		}

		for (let i = 0; i < arr.length; i++) {
			const export_planning = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["header"] != "Action") {
					export_planning[this.cols[j]["header"]] =
						arr[i][this.cols[j]["field"]];
				}
			}
			export_list.push(export_planning);
		}

		this.exportService.exportExcel(
			export_list,
			"Middleware Payment Details"
		);
	}

}
