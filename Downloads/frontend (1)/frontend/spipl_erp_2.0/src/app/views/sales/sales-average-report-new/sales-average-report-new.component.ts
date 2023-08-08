import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { Table } from "primeng/table";
import { forkJoin } from "rxjs";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import {
	ProductMaster,
	SalesAverageReportNew,
	StaffMemberMaster,
	StateMaster,

} from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";

@Component({
	selector: 'app-sales-average-report-new',
	templateUrl: './sales-average-report-new.component.html',
	styleUrls: ['./sales-average-report-new.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class SalesAverageReportNewComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	datePickerConfig = staticValues.datePickerConfigNew;
	maxDate: Date = new Date();
	page_title: any = "Sales Average Report";
	user: UserDetails;
	links: string[] = [];
	company_id: any = null;
	role_id: any = null;
	isLoading: boolean = false;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	companyList: any = staticValues.company_list_new;
	selected_company: any = this.companyList[0];
	reportTypesList: any = staticValues.report_types;
	zonesList: any = [];
	statesList: any = [];
	productsList: any = [];

	selected_report_type: any = [];
	selected_zone: any = [];
	selected_state: any = [];
	selected_product: any = [];

	zoneTitle: any = "Zone Chart";
	zoneData: any = [];
	zoneCols: any = [];
	zoneFooterTotal: any = 0;
	zoneMode: any = false;
	zoneChartData: any = {};

	stateTitle: any = "State Chart";
	stateData: any = [];
	stateCols: any = [];
	stateFooterTotal: any = 0;
	stateMode: any = false;
	stateChartData: any = {};

	mainGradeTitle: any = "Main Grade Chart";
	mainGradeData: any = [];
	mainGradeCols: any = [];
	mainGradeFooterTotal: any = 0;
	mainGradeMode: any = false;
	mainGradeChartData: any = {};

	gradeTitle: any = "Grade In Details";
	gradeData: any = [];
	gradeCols: any = [];
	gradeFooterTotal: any = 0;
	gradeMode: any = false;
	gradeChartData: any = {};

	customerTitle: any = "Customer Wise Quantity & Average Rate";
	customerData: any = [];
	customerCols: any = [];
	customerFooterTotal: any = 0;
	customerMode: any = false;
	customerChartData: any = {};
	export_purchase_list: any = [];
	exportColumns: any;
	tot_qty: any;

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
	}

	ngOnInit() {
		this.getZones();
		this.getStates();
		this.getProducts();
		this.getData();
	}

	getZones() {
		this.zonesList = [];
		this.crudServices.getOne<any>(StaffMemberMaster.getMarketingPersonsArr, {
			role_ids: [5, 33, 34, 46]
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.zonesList = res.data.map(element => {
						element.full_name = element.first_name + ' ' + element.last_name;
						return element;
					});
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

	getStates() {
		this.crudServices.getAll<any>(StateMaster.getAll).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.statesList = res.data;
				}
			}
		})
	}

	getProducts() {
		this.crudServices.getAll<any>(ProductMaster.getAll).subscribe(res => {
			if (res.length > 0) {
				this.productsList = res;
			}
		});
	}

	exportData(type) {
		if (type == 'zone') {
			let final_data = null;
			if (this.table.filteredValue == null) {
				final_data = this.zoneData;
			} else {
				final_data = this.table.filteredValue;
			}
			let fileName = 'Zone-Details' + ' - ' + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
			let exportData = [];
			for (let i = 0; i < final_data.length; i++) {
				let obj = {};
				for (let j = 0; j < this.zoneCols.length; j++) {
					if (this.zoneCols[j]["field"] != "action") {
						if (this.zoneCols[j]["field"] == "quantity_import" || this.zoneCols[j]["field"] == "quantity_local" || this.zoneCols[j]["field"] == "total_quantity") {
							obj[this.zoneCols[j]["header"]] = final_data[i][this.zoneCols[j]["field"]] + " MT";
						} else {
							obj[this.zoneCols[j]["header"]] = final_data[i][this.zoneCols[j]["field"]];
						}
					}
				}
				exportData.push(obj);
			}
			let foot = {};
			for (let j = 0; j < this.zoneCols.length; j++) {
				if (this.zoneCols[j]["field"] != "action") {
					if (this.zoneCols[j]["field"] == "quantity_import" || this.zoneCols[j]["field"] == "quantity_local" || this.zoneCols[j]["field"] == "total_quantity") {
						foot[this.zoneCols[j]["header"]] = this.zoneCols[j]["total"] + " MT";
					} else if (this.zoneCols[j]["field"] == "nb_average_rate") {
						foot[this.zoneCols[j]["header"]] = this.zoneCols[j]["total"];
					} else {
						foot[this.zoneCols[j]["header"]] = "";
					}
				}
			}
			exportData.push(foot);
			let exportColumns = this.zoneCols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
		if (type == 'state') {
			let final_data = null;
			if (this.table.filteredValue == null) {
				final_data = this.stateData;
			} else {
				final_data = this.table.filteredValue;
			}
			let fileName = 'State-Details' + ' - ' + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
			let exportData = [];
			for (let i = 0; i < final_data.length; i++) {
				let obj = {};
				for (let j = 0; j < this.stateCols.length; j++) {
					if (this.stateCols[j]["field"] != "action") {
						if (this.stateCols[j]["field"] == "quantity_import" || this.stateCols[j]["field"] == "quantity_local" || this.stateCols[j]["field"] == "total_quantity") {
							obj[this.stateCols[j]["header"]] = final_data[i][this.stateCols[j]["field"]] + " MT";
						} else {
							obj[this.stateCols[j]["header"]] = final_data[i][this.stateCols[j]["field"]];
						}
					}
				}
				exportData.push(obj);
			}
			let foot = {};
			for (let j = 0; j < this.stateCols.length; j++) {
				if (this.stateCols[j]["field"] != "action") {
					if (this.stateCols[j]["field"] == "quantity_import" || this.stateCols[j]["field"] == "quantity_local" || this.stateCols[j]["field"] == "total_quantity") {
						foot[this.stateCols[j]["header"]] = this.stateCols[j]["total"] + " MT";
					} else if (this.stateCols[j]["field"] == "nb_average_rate") {
						foot[this.stateCols[j]["header"]] = this.stateCols[j]["total"];
					} else {
						foot[this.stateCols[j]["header"]] = "";
					}
				}
			}
			exportData.push(foot);
			let exportColumns = this.stateCols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
		if (type == 'grade') {
			let final_data = null;
			if (this.table.filteredValue == null) {
				final_data = this.gradeData;
			} else {
				final_data = this.table.filteredValue;
			}
			let fileName = 'Grade-Details' + ' - ' + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
			let exportData = [];
			for (let i = 0; i < final_data.length; i++) {
				let obj = {};
				for (let j = 0; j < this.gradeCols.length; j++) {
					if (this.gradeCols[j]["field"] != "action") {
						if (this.gradeCols[j]["field"] == "quantity_import" || this.gradeCols[j]["field"] == "quantity_local" || this.gradeCols[j]["field"] == "total_quantity") {
							obj[this.gradeCols[j]["header"]] = final_data[i][this.gradeCols[j]["field"]] + " MT";
						} else {
							obj[this.gradeCols[j]["header"]] = final_data[i][this.gradeCols[j]["field"]];
						}
					}
				}
				exportData.push(obj);
			}
			let foot = {};
			for (let j = 0; j < this.gradeCols.length; j++) {
				if (this.gradeCols[j]["field"] != "action") {
					if (this.gradeCols[j]["field"] == "quantity_import" || this.gradeCols[j]["field"] == "quantity_local" || this.gradeCols[j]["field"] == "total_quantity") {
						foot[this.gradeCols[j]["header"]] = this.gradeCols[j]["total"] + " MT";
					} else if (this.gradeCols[j]["field"] == "nb_average_rate") {
						foot[this.gradeCols[j]["header"]] = this.gradeCols[j]["total"];
					} else {
						foot[this.gradeCols[j]["header"]] = "";
					}
				}
			}
			exportData.push(foot);
			let exportColumns = this.gradeCols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
		if (type == 'main') {
			let final_data = null;
			if (this.table.filteredValue == null) {
				final_data = this.mainGradeData;
			} else {
				final_data = this.table.filteredValue;
			}
			let fileName = 'Main-Grade-Details' + ' - ' + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
			let exportData = [];
			for (let i = 0; i < final_data.length; i++) {
				let obj = {};
				for (let j = 0; j < this.mainGradeCols.length; j++) {
					if (this.mainGradeCols[j]["field"] != "action") {
						if (this.mainGradeCols[j]["field"] == "quantity_import" || this.mainGradeCols[j]["field"] == "quantity_local" || this.mainGradeCols[j]["field"] == "total_quantity") {
							obj[this.mainGradeCols[j]["header"]] = final_data[i][this.mainGradeCols[j]["field"]] + " MT";
						} else {
							obj[this.mainGradeCols[j]["header"]] = final_data[i][this.mainGradeCols[j]["field"]];
						}
					}
				}
				exportData.push(obj);
			}
			let foot = {};
			for (let j = 0; j < this.mainGradeCols.length; j++) {
				if (this.mainGradeCols[j]["field"] != "action") {
					if (this.mainGradeCols[j]["field"] == "quantity_import" || this.mainGradeCols[j]["field"] == "quantity_local" || this.mainGradeCols[j]["field"] == "total_quantity") {
						foot[this.mainGradeCols[j]["header"]] = this.mainGradeCols[j]["total"] + " MT";
					} else if (this.mainGradeCols[j]["field"] == "nb_average_rate") {
						foot[this.mainGradeCols[j]["header"]] = this.mainGradeCols[j]["total"];
					} else {
						foot[this.mainGradeCols[j]["header"]] = "";
					}
				}
			}
			exportData.push(foot);
			let exportColumns = this.mainGradeCols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
		if (type == 'cust') {
			let final_data = null;
			if (this.table.filteredValue == null) {
				final_data = this.customerData;
			} else {
				final_data = this.table.filteredValue;
			}
			let fileName = 'Customer_wise-Details' + ' - ' + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
			let exportData = [];
			for (let i = 0; i < final_data.length; i++) {
				let obj = {};
				for (let j = 0; j < this.customerCols.length; j++) {
					if (this.customerCols[j]["field"] != "action") {
						if (this.customerCols[j]["field"] == "quantity_import" || this.customerCols[j]["field"] == "quantity_local" || this.customerCols[j]["field"] == "total_quantity") {
							obj[this.customerCols[j]["header"]] = final_data[i][this.customerCols[j]["field"]] + " MT";
						} else {
							obj[this.customerCols[j]["header"]] = final_data[i][this.customerCols[j]["field"]];
						}
					}
				}
				exportData.push(obj);
			}
			let foot = {};
			for (let j = 0; j < this.customerCols.length; j++) {
				if (this.customerCols[j]["field"] != "action") {
					if (this.customerCols[j]["field"] == "quantity_import" || this.customerCols[j]["field"] == "quantity_local" || this.customerCols[j]["field"] == "total_quantity") {
						foot[this.customerCols[j]["header"]] = this.customerCols[j]["total"] + " MT";
					} else if (this.customerCols[j]["field"] == "nb_average_rate") {
						foot[this.customerCols[j]["header"]] = this.customerCols[j]["total"];
					} else {
						foot[this.customerCols[j]["header"]] = "";
					}
				}
			}
			exportData.push(foot);
			let exportColumns = this.customerCols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}


	getData() {
		this.isLoading = true;

		this.zoneCols = [];
		this.zoneData = [];
		this.zoneFooterTotal = 0;

		this.stateCols = [];
		this.stateData = [];
		this.stateFooterTotal = 0;

		this.mainGradeCols = [];
		this.mainGradeData = [];
		this.mainGradeFooterTotal = 0;

		this.gradeCols = [];
		this.gradeData = [];
		this.gradeFooterTotal = 0;

		this.customerCols = [];
		this.customerData = [];
		this.customerFooterTotal = 0;

		let condition = {};
		condition['start_date'] = moment(this.selected_date_range[0]).format("YYYY-MM-DD");
		condition['end_date'] = moment(this.selected_date_range[1]).format("YYYY-MM-DD");
		if (this.selected_zone.length > 0) {
			condition['zone_id'] = this.selected_zone.map(x => x.id);
		}
		if (this.selected_state.length > 0) {
			condition['state_id'] = this.selected_state.map(x => x.id)
		}
		if (this.selected_product.length > 0) {
			condition['product_id'] = this.selected_product.map(x => x.id)
		}
		condition['company_id'] = this.selected_company.id;
		let reqZone = this.crudServices.getOne(SalesAverageReportNew.getZoneWiseAverage, condition);
		let reqState = this.crudServices.getOne(SalesAverageReportNew.getStateWiseAverage, condition);
		let reqMainGrade = this.crudServices.getOne(SalesAverageReportNew.getMainGradeWiseAverage, condition);
		let reqGrade = this.crudServices.getOne(SalesAverageReportNew.getGradeWiseAverage, condition);
		let reqCustomer = this.crudServices.getOne(SalesAverageReportNew.getCustomerWiseAverage, condition);
		forkJoin([reqZone, reqState, reqMainGrade, reqGrade, reqCustomer]).subscribe((res: any) => {
			if (res.length > 0) {
				if (res[0].code == '100') {
					if (res[0].data.length > 0) {
						let result = this.calculateAverageRate(res[0].data, "ZONE");
						this.zoneData = result.data;
						let data = [];
						for (let val of this.zoneData) {
							let index = data.findIndex(item => item.zone == val.zone)
							if (index > -1) {
								if (val.import_local_flag == 1) {
									data[index].quantity_import += roundQuantity(val.quantity_import);
									data[index].nb_average_rate_import = val.nb_average_rate
								} else {
									data[index].quantity_local += roundQuantity(val.quantity_local);
									data[index].nb_average_rate = val.nb_average_rate
								}
								data[index].total_quantity = data[index].quantity_import + data[index].quantity_local;
							} else {
								if (val.import_local_flag == 1) {
									val.quantity_import = roundQuantity(val.quantity_import);
									val.nb_average_rate_import = val.nb_average_rate;
									val.nb_average_rate = 0;
									val.quantity_local = 0
								} else {
									val.quantity_local = roundQuantity(val.quantity_local);
									val.nb_average_rate = val.nb_average_rate;
									val.nb_average_rate_import = 0;
									val.quantity_import = 0
								}
								val.total_quantity = val.quantity_local + val.quantity_import;
								data.push(val);
							}
						}
						this.zoneData = data;
						this.zoneCols = [
							{ field: "zone", header: "Zone", footer: false, total: 0, type: null },
							{ field: "quantity_import", header: "Import Qty Rate", footer: true, total: 0, type: "Quantity" },
							{ field: "nb_average_rate_import", header: "Import Avg Rate", footer: true, total: 0, type: "Amount" },
							{ field: "quantity_local", header: "Local Qty", footer: true, total: 0, type: "Quantity" },
							{ field: "nb_average_rate", header: "Local Avg Rate", footer: true, total: 0, type: "Amount" },
							{ field: "total_quantity", header: "Total Quantity", footer: true, total: 0, type: "Quantity" }
						];
						this.zoneFooterTotal = result.total_average;
						this.zoneChartData = {
							labels: result.lables,
							datasets: [
								{
									label: 'Quantity (Import)',
									backgroundColor: '#42A5F5',
									data: result.total_quantity_import
								},
								{
									label: 'Quantity (Local)',
									backgroundColor: '#FFA726',
									data: result.total_quantity_local
								}
							]
						};
						this.footerTotal(this.zoneCols, this.zoneData);
					}
				}
				if (res[1].code == '100') {
					if (res[1].data.length > 0) {
						let result = this.calculateAverageRate(res[1].data, "STATE");
						this.stateData = result.data;
						this.stateCols = [
							{ field: "state_name", header: "State", footer: false, total: 0, type: null },
							{ field: "quantity_import", header: "Quantity (Import)", footer: true, total: 0, type: "Quantity" },
							{ field: "quantity_local", header: "Quantity (Local)", footer: true, total: 0, type: "Quantity" },
							{ field: "total_quantity", header: "Total Quantity", footer: true, total: 0, type: "Quantity" },
							{ field: "nb_average_rate", header: "Average Rate", footer: true, total: 0, type: "Amount" }
						];
						this.stateFooterTotal = result.total_average;
						this.stateChartData = {
							labels: result.lables,
							datasets: [
								{
									label: 'Quantity (Import)',
									backgroundColor: '#42A5F5',
									data: result.total_quantity_import
								},
								{
									label: 'Quantity (Local)',
									backgroundColor: '#FFA726',
									data: result.total_quantity_local
								}
							]
						};
						this.footerTotal(this.stateCols, this.stateData);
					}
				}
				if (res[2].code == '100') {
					if (res[2].data.length > 0) {
						let result = this.calculateAverageRate(res[2].data, "MAIN_GRADE");
						this.mainGradeData = result.data;
						this.mainGradeCols = [
							{ field: "main_grade_name", header: "Main Grade", footer: false, total: 0, type: null },
							{ field: "quantity_import", header: "Quantity (Import)", footer: true, total: 0, type: "Quantity" },
							{ field: "quantity_local", header: "Quantity (Local)", footer: true, total: 0, type: "Quantity" },
							{ field: "total_quantity", header: "Total Quantity", footer: true, total: 0, type: "Quantity" },
							{ field: "nb_average_rate", header: "Average Rate", footer: true, total: 0, type: "Amount" }
						];
						this.mainGradeFooterTotal = result.total_average;
						this.mainGradeChartData = {
							labels: result.lables,
							datasets: [
								{
									backgroundColor: ['#42A5F5', '#FF6361', '#B2EBF2', '#FFA726', '#BC5090', '#633974'],
									data: result.total_quantity_import
								},
								{
									backgroundColor: ['#42A5F5', '#FF6361', '#B2EBF2', '#FFA726', '#BC5090', '#633974'],
									data: result.total_quantity_local
								}
							]
						};
						this.footerTotal(this.mainGradeCols, this.mainGradeData);
					}
				}
				if (res[3].code == '100') {
					if (res[3].data.length > 0) {
						let result = this.calculateAverageRate(res[3].data, "GRADE");
						this.gradeData = result.data;
						this.gradeCols = [
							{ field: "grade_name", header: "Grade", footer: false, total: 0, type: null },
							{ field: "main_grade_name", header: "Main Grade", footer: false, total: 0, type: null },
							{ field: "quantity_import", header: "Quantity (Import)", footer: true, total: 0, type: "Quantity" },
							{ field: "quantity_local", header: "Quantity (Local)", footer: true, total: 0, type: "Quantity" },
							{ field: "total_quantity", header: "Total Quantity", footer: true, total: 0, type: "Quantity" },
							{ field: "nb_average_rate", header: "Average Rate", footer: true, total: 0, type: "Amount" }
						];
						this.gradeFooterTotal = result.total_average;
						this.gradeChartData = {
							labels: result.lables,
							datasets: [
								{
									label: 'Quantity (Import)',
									backgroundColor: '#42A5F5',
									data: result.total_quantity_import
								},
								{
									label: 'Quantity (Local)',
									backgroundColor: '#FFA726',
									data: result.total_quantity_local
								}
							]
						};
						this.footerTotal(this.gradeCols, this.gradeData);
					}
				}
				if (res[4].code == '100') {
					if (res[4].data.length > 0) {
						let result = this.calculateAverageRate(res[4].data, "CUSTOMER");
						this.customerData = result.data;
						this.customerCols = [
							{ field: "sub_org_name", header: "Customer Name", footer: false, total: 0, type: null },
							{ field: "quantity_import", header: "Quantity (Import)", footer: true, total: 0, type: "Quantity" },
							{ field: "quantity_local", header: "Quantity (Local)", footer: true, total: 0, type: "Quantity" },
							{ field: "total_quantity", header: "Total Quantity", footer: true, total: 0, type: "Quantity" },
							{ field: "nb_average_rate", header: "Average Rate", footer: true, total: 0, type: "Amount" }
						];
						this.customerFooterTotal = result.total_average;
						this.footerTotal(this.customerCols, this.customerData);
					}
				}
			}
			this.isLoading = false;
		});
	}

	calculateAverageRate(res_data, type) {
		let lables = [];
		let rate = [];
		let total_quantity_import = [];
		let total_quantity_local = [];
		res_data.map((element) => {
			if (type == "ZONE") {
				lables.push(element.zone);
			}
			if (type == "STATE") {
				lables.push(element.state_name);
			}
			if (type == "MAIN_GRADE") {
				lables.push(element.main_grade_name);
			}
			if (type == "GRADE") {
				lables.push(element.grade_name);
			}
			if (type == "CUSTOMER") {
				lables.push(element.sub_org_name);
			}
			rate.push(Number(element.nb_average_rate).toFixed(2));
			element.quantity_import = 0;
			element.quantity_local = 0;
			element.total_quantity = 0;
			if (element.import_local_flag == 1) {
				element.quantity_import = element.quantity;
				total_quantity_import.push(roundQuantity(element.quantity));
			}
			if (element.import_local_flag == 2) {
				element.quantity_local = element.quantity;
				total_quantity_local.push(roundQuantity(element.quantity));
			}
			element.total_quantity = Number(element.quantity_import) + Number(element.quantity_local);
			let base_amount = Number(element.total_quantity) * Number(element.nb_average_rate);
			element.base_amount = Number(Number(base_amount).toFixed(2));
		});
		let total_quantity_sum = roundQuantity(res_data.map(x => x.total_quantity).reduce((prev, next) => prev + next));
		let base_amount_sum = roundQuantity(res_data.map(x => x.base_amount).reduce((prev, next) => prev + next));
		let total_average = Number(Number(base_amount_sum) / Number(total_quantity_sum)).toFixed(2);

		let result = {
			data: res_data,
			total_average: total_average,
			total_quantity_import: total_quantity_import,
			total_quantity_local: total_quantity_local,
			lables: lables
		};
		return result;
	}

	footerTotal(cols, data) {
		let filter_cols = cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => Number(sum) + Number(item));
				let final = 0;
				if (element.type == "Quantity") {
					final = roundQuantity(total);
				} else {
					final = Number(total) / data.length;
				}
				element.total = final;
			}
		});
	}
	onChangeCompany(e: any) {
		if (e != null && e != undefined) {
			this.selected_company = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
	}

	onAction(item, type, e) {
		if (type == 'Report_Type') {
			this.selected_report_type = e;
		} else if (type == 'Zone') {
			this.selected_zone = e;
		} else if (type == 'State') {
			this.selected_state = e;
		} else if (type == 'Product') {
			this.selected_product = e;
		}
		this.getData();
	}
}
