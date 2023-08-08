import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { SalesReportsNew, DispatchNew } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import * as moment from "moment";
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
	selector: 'app-logistics-dashborad',
	templateUrl: './logistics-dashborad.component.html',
	styleUrls: ['./logistics-dashborad.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})
export class LogisticsDashboradComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	datePickerConfig = staticValues.datePickerConfigNew;
	maxDate: Date = new Date();
	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
	role_id: any = null;
	company_id: any = null;
	page_title: any = "Logistics Dashboard";
	user: UserDetails;
	lenghtOfRecord: number = 0;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	add_transporter_bill: boolean = false;
	update_freight: boolean = false;
	statusList: any = staticValues.dispatch_report_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	uploadList: any = [];
	selectedZone: any;
	quantity: any;
	DispatchName: any
	totalAmt = 0;
	godownWise: any = [];
	truckImageCount: number = 0;
	truckImageNullCount: number = 0;
	lrCount: number = 0;
	lrNullCount: number = 0;
	podCount: number = 0;
	podNullCount: number = 0;
	lrRecCount: number = 0;
	lrRecNullCount: number = 0;
	public barChartOptions: ChartOptions = {
		responsive: true,
	};
	public barChartLabels: Label[] = ['Truck', 'LR', 'POD', 'LR Received'];
	public barChartType: ChartType = 'bar';
	public barChartLegend = true;
	public barChartPlugins = [];
	public barChartData: ChartDataSets[] = [
		{ data: [this.truckImageCount, this.lrCount, this.podCount, this.lrRecCount], label: 'Uploaded' },
		{ data: [this.truckImageNullCount, this.lrNullCount, this.podNullCount, this.lrRecNullCount], label: 'Not Uploaded' }
	];
	constructor(
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;
		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33 || this.user.userDet[0].role_id == 34 || this.user.userDet[0].role_id == 46) {
			if (this.user.userDet[0].insider_parent_id != null) {
				this.selectedZone = this.user.userDet[0].insider_parent_id;
			} else {
				this.selectedZone = this.user.userDet[0].id;
			}
		}
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

		this.add_transporter_bill = (this.links.find(x => x == 'add_transporter_bill') != null) ? true : false;
		this.update_freight = (this.links.find(x => x == 'update_freight') != null) ? true : false;
	}

	ngOnInit() {
		this.getCols();
		this.getFinanceData();

	}
	onDateChange(event) {
		if (event) {
			this.getFinanceData();
			this.getData();
			this.uploadedDetails();
		}
	}
	getFinanceData() {
		this.data = [];
		this.isLoading = true;
		let condition = {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			company_id: (this.role_id == 1) ? null : this.company_id
		}
		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33 || this.user.userDet[0].role_id == 34 || this.user.userDet[0].role_id == 46) {
			if (this.user.userDet[0].insider_parent_id != null) {
				condition["zone_id"] = this.user.userDet[0].insider_parent_id;
			} else {
				condition["zone_id"] = this.user.userDet[0].id;
			}
		}
		this.crudServices.getOne<any>(DispatchNew.getPendingDispatchesNew, condition).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data.filter(x => x.balance_quantity > 0);
					this.godownWiseData(this.data);
				}
			}
			this.table.reset();
		});
	}


	godownWiseData(data) {
		this.totalAmt = 0;
		for (let item of data) {
			this.totalAmt = this.totalAmt + item.balance_quantity;
		}
		const aggregatedData = new Map();
		data.forEach(entry => {
			const { godown_name, balance_quantity } = entry;
			if (aggregatedData.has(godown_name)) {
				const existingRecord = aggregatedData.get(godown_name);
				const balQty = existingRecord.balQty + balance_quantity;
				aggregatedData.set(godown_name, { godown_name, balQty });
			}
			else {
				const balQty = balance_quantity;
				aggregatedData.set(godown_name, { godown_name, balQty });
			}


		});
		const result = Array.from(aggregatedData.values());
		this.godownWise = result;
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesReportsNew.getDispatchReport, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			zone_id: this.selectedZone
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.transporter = (element.transporter != null) ? element.transporter : "OTHER";
						element.quantity = roundQuantity(Number(element.quantity) + Number(element.logistic_power));
						element.total_freight_load_cross = Number(element.total_freight) + Number(element.total_load_cross);
					});
					this.data = res.data;
					const aggregatedData = new Map();
					this.data.forEach(entry => {
						const { dispatched_by, truck_image_copy, lr_copy, pod_copy, lr_received_by } = entry;
						if (aggregatedData.has(dispatched_by)) {
							const existingRecord = aggregatedData.get(dispatched_by);
							const truckCount = existingRecord.truckCount + (truck_image_copy ? 1 : 0);
							const truckNullCount = existingRecord.truckNullCount + (truck_image_copy == null ? 1 : 0);
							const lrCount = existingRecord.lrCount + (lr_copy ? 1 : 0);
							const lrNullCount = existingRecord.lrNullCount + (lr_copy == null ? 1 : 0);
							const podCount = existingRecord.podCount + (pod_copy ? 1 : 0);
							const podNullCount = existingRecord.podNullCount + (pod_copy == null ? 1 : 0);
							const lrRecCount = existingRecord.lrRecCount + (lr_received_by ? 1 : 0);
							const lrRecNullCount = existingRecord.lrRecNullCount + (lr_received_by == null ? 1 : 0);
							aggregatedData.set(dispatched_by, { dispatched_by, truckCount, lrCount, podCount, lrRecCount, truckNullCount, lrNullCount, podNullCount, lrRecNullCount });
						}
						else {
							const truckCount = truck_image_copy ? 1 : 0;
							const truckNullCount = truck_image_copy == null ? 1 : 0;
							const lrCount = lr_copy ? 1 : 0;
							const lrNullCount = lr_copy == null ? 1 : 0;
							const podCount = pod_copy ? 1 : 0;
							const podNullCount = pod_copy == null ? 1 : 0;
							const lrRecCount = lr_received_by ? 1 : 0;
							const lrRecNullCount = lr_received_by == null ? 1 : 0;
							aggregatedData.set(dispatched_by, { dispatched_by, truckCount, lrCount, podCount, lrRecCount, truckNullCount, lrNullCount, podNullCount, lrRecNullCount });
						}
					});
					const result = Array.from(aggregatedData.values());
					this.data = result;
					this.isLoading = false;
				}
			}

			this.table.reset();
		});
	}


	getCols() {
		this.cols = [
			{ field: "dispatched_by", header: "Dispatch By", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'name' },
			{ field: "truckCount", header: "Truck Image", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "truckNullCount", header: "Truck Image Not Uploaded", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "lrCount", header: "L.R", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "lrNullCount", header: "L.R Not Uploaded", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "podCount", header: "P.O.D", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "podNullCount", header: "P.O.D Not Uploaded", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "lrRecCount", header: "L.R Received By", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "lrRecNullCount", header: "L.R Received By Not Uploaded", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
		];
		this.filter = ['dispatched_by'];
		this.uploadedDetails();
	}

	uploadedDetails() {
		this.uploadList = []
		this.crudServices.getOne<any>(SalesReportsNew.getDispatchReport, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			zone_id: this.selectedZone
		}).subscribe(res => {
			if (res.code == '100') {
				this.truckImageCount = 0;
				this.truckImageNullCount = 0;
				this.lrCount = 0;
				this.lrNullCount = 0;
				this.podCount = 0;
				this.podNullCount = 0;
				this.lrRecCount = 0;
				this.lrRecNullCount = 0;
				this.lenghtOfRecord = res.data.length
				if (res.data.length > 0) {
					for (const obj of res.data) {
						obj.truck_image_copy === null?this.truckImageNullCount++:this.truckImageCount++;
						obj.lr_copy === null?this.lrNullCount++:this.lrCount++;
						obj.pod_copy === null?this.podNullCount++:this.podCount++;
						obj.lr_received_by === null?this.lrRecNullCount++:this.lrRecCount++;
					}
					this.uploadList = res.data;
					this.footerTotal(this.uploadList);
					this.pushDropdown(this.uploadList);
					this.barChartData = [
						{ data: [this.truckImageCount, this.lrCount, this.podCount, this.lrRecCount], label: 'Uploaded' },
						{ data: [this.truckImageNullCount, this.lrNullCount, this.podNullCount, this.lrRecNullCount], label: 'Not Uploaded' }
					];
				}
			}
		});
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.cols.filter(col => col.filter == true);
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
		let filter_cols = this.cols.filter(col => col.footer == true);
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
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}
}
