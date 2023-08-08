import { ActivatedRoute, Params, Router } from "@angular/router";
import { Component, ElementRef, Input, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core";
import { Consignments, Dispatch, StaffMemberMaster, StateMaster, billOfEntry, ProductMaster } from "../../../shared/apis-path/apis-path";
import { Observable, forkJoin } from "rxjs";
import { ToasterConfig, ToasterService } from "angular2-toaster";

import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DatePipe } from "@angular/common";
import { ExportService } from "../../../shared/export-service/export-service";
import { LoginService } from "../../login/login.service";
import { PermissionService } from "../../../shared/pemission-services/pemission-service";
import { Table } from "primeng/table";
import { UserDetails } from "../../login/UserDetails.model";
import { staticValues } from "../../../shared/common-service/common-service";




@Component({
	selector: 'app-sales-average-report',
	templateUrl: './sales-average-report.component.html',
	styleUrls: ['./sales-average-report.component.scss'],
	providers: [
		DatePipe,
		ToasterService,
		LoginService,
		CrudServices,
		PermissionService
	]
})

export class SalesAverageReportComponent implements OnInit {
	bsRangeValue: any; //DatePicker range Value
	@ViewChild("mf", { static: false }) table: ElementRef;
	user: UserDetails;
	isLoading = false;
	maxDate: Date = new Date(); // date range will not greater  than today
	links: any;
	selectedCompany: any;
	selectedZone: any = [];
	selectedState: any = [];
	selectedDealType: any;
	selectedProduct: any;

	isDetailGradeTable: boolean = true;
	isProductTable: boolean = true;
	isCompanyTable: boolean = true;

	mainGradeTable: any = [];
	mainGradeChartLabels: any[];
	mainGradeChartData: any[];
	isMainGradeTable: boolean = true;
	mainGradeChartType = 'doughnut';

	public doughnutOptions = {
		events: false,

		animation: {
			duration: 500,
			easing: "easeOutQuart",
			onComplete: function () {
				var ctx = this.chart.ctx;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'bottom';
				this.data.datasets.forEach(function (dataset) {
					for (var i = 0; i < dataset.data.length; i++) {
						var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
							total = dataset._meta[Object.keys(dataset._meta)[0]].total,
							mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2,
							start_angle = model.startAngle,
							end_angle = model.endAngle,
							mid_angle = start_angle + (end_angle - start_angle) / 2;

						var x = mid_radius * Math.cos(mid_angle);
						var y = mid_radius * Math.sin(mid_angle);

						ctx.fillStyle = '#000';

						if (i == 3) { // Darker text color for lighter background
							ctx.fillStyle = '#444';
						}
						var percent = String(Math.round(dataset.data[i] / total * 100)) + "%";
						// ctx.fillText(dataset.data[i], model.x + x, model.y + y);
						// Display percent in another line, line break doesn't work for fillText
						ctx.fillText(percent, model.x + x, model.y + y + 15);
					}
				});
			}
		}

	};

	//STATE 
	stateChartLabels: any[];
	stateChartData: { data: any[]; label: string; }[];
	stateChartType: any = 'bar';
	stateTable: any = [];
	isStateTable: boolean = true;



	zoneChartLabels: any[];
	zoneChartData: any[];
	zoneChartType: any = 'bar';
	isZoneTable: boolean = true;
	zoneTable: any = [];
	datePickerConfig = staticValues.datePickerConfig;
	public zoneChartOptions: any = {
		scaleShowVerticalLines: false,
		events: false,
		responsive: true,
		scaleShowValues: true,
		scaleValuePaddingX: 10,
		scaleValuePaddingY: 10,
		animation: {
			onComplete: function () {
				var chartInstance = this.chart,
					ctx = chartInstance.ctx;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'bottom';
				this.data.datasets.forEach(function (dataset, i) {
					var meta = chartInstance.controller.getDatasetMeta(i);
					meta.data.forEach(function (bar, index) {
						var data = dataset.data[index];
						ctx.fillText(data, bar._model.x, bar._model.y - 5);
					});
				});
			}
		}

	};
	gradeInDetailTable: any = [];
	customerAvrageTable: any = [];

	isZoneLogin: boolean = false;
	reportType = staticValues.sales_average_report_type;
	selectedReportType: number = undefined;
	zoneList: any;
	stateList: any;
	productList: any = [];
	topTenParty: any = [];
	monthlyTrendz: any = [];
	lineChartLabels: any = [];
	lineChartData: any = [];
	inActiveUsers: any = [];

	constructor(public datePipe: DatePipe, private router: Router, private permissionService: PermissionService, private loginService: LoginService, public crudServices: CrudServices) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		if (this.user.userDet[0].role_id != 1 && this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33 || this.user.userDet[0].role_id == 34) {
			this.getAllZone()
			this.selectedZone.push(this.user.userDet[0].id)
			this.isZoneLogin = true;
		}

	}








	ngOnInit() {
		this.dashboardGetAllNumberAtOnce()
	}



	getAllZone() {
		this.crudServices.getOne<any>(StaffMemberMaster.getMarketingPersonsArr, {
			role_ids: staticValues.marketing_role_ids
		}).subscribe(response => {
			this.zoneList = response.data.map(zone => {
				zone.fullname = `${zone.title} ${zone.first_name} ${zone.middle_name}  ${zone.last_name}`;
				return zone;
			});
		});
	}


	getState() {
		this.crudServices.getAll(StateMaster.getAll).subscribe(response => {
			this.stateList = response['data'];
		})
	}

	getReportTypeList() {
		if (this.selectedReportType == 1) {
			this.getAllZone()
		}
		if (this.selectedReportType == 2) {
			this.getState()
		}
	}
	setFinanceYear() {
		let date = new Date();
		let nextyr
		let currentYear
		if (new Date().getMonth() >= 3) {
			nextyr = new Date(date.getFullYear() + 1, 2, 31);
			currentYear = new Date(date.getFullYear(), 3, 1)
		} else {
			nextyr = new Date(date.getFullYear(), 2, 31);
			currentYear = new Date(date.getFullYear() - 1, 3, 1)
		}
		this.bsRangeValue = [
			new Date(currentYear),
			new Date(nextyr),
		];
	}




	onDateChange() {
		if (this.bsRangeValue != null && this.bsRangeValue != undefined) {
			this.dashboardGetAllNumberAtOnce();
		}
	}

	getAVGOf(arraySource, field) {
		return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0) / arraySource.length;
	}

	getSumOf(arraySource, field) {
		return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0);
	}

	dateFormating(date) {
		if (date) {
			return this.datePipe.transform(date, "yyyy-MM-dd");
		} else {
			return "";
		}
	}



	dashboardGetAllNumberAtOnce() {
		let condition = {};
		this.isLoading = true;
		if (this.bsRangeValue) {
			condition["start_date"] = this.dateFormating(this.bsRangeValue[0]);
			condition["end_date"] = this.dateFormating(this.bsRangeValue[1]);
		}

		if (this.selectedZone.length > 0) {
			condition['zone_id'] = this.selectedZone;
		}
		if (this.selectedCompany) {
			condition['company_id'] = this.selectedCompany;
		}

		if (this.selectedDealType) {
			condition['deal_type'] = this.selectedDealType;
		}
		if (this.selectedProduct) {
			condition['product_id'] = this.selectedProduct;
		}

		if (this.selectedState.length > 0) {
			condition['state_id'] = this.selectedProduct;
		}

		let reqZoneWiseAvg = this.crudServices.getOne(Consignments.getDashboardZoneWiseAvg, condition);
		let reqStateWiseAvg = this.crudServices.getOne(Consignments.getDashboardStateWiseAvg, condition);
		let reqGradeWiseAvg = this.crudServices.getOne(Consignments.getDashboardGradeWiseAvg, condition);
		let reqMainGradeWiseAvg = this.crudServices.getOne(Consignments.getDashboardMainGradeWiseAvg, condition);
		let reqInActiveUser = this.crudServices.getOne(Consignments.getDashboardInActiveUser, condition);
		let reqTopTenParty = this.crudServices.getOne(Consignments.getDashboardTopTenParty, condition);
		let reqCustomerWiseTrends = this.crudServices.getOne(Consignments.getDashboardCustomerWiseTrends, condition);
		let reqDataByField = this.crudServices.getOne(ProductMaster.getOneDataByField, condition);
		let reqcustomerWiseAvrage = this.crudServices.getOne(Consignments.getDashboardCustomerWiseAvg, condition);

		forkJoin([reqZoneWiseAvg, reqStateWiseAvg, reqGradeWiseAvg, reqMainGradeWiseAvg, reqDataByField, reqcustomerWiseAvrage, reqInActiveUser, reqTopTenParty, reqCustomerWiseTrends]).subscribe(result => {
			if (result.length > 0) {
				this.processZone(result[0]['data']);
				this.processState(result[1]['data']);
				this.processGradeInDetailTable(result[2]['data']);
				this.processMainGrade(result[3]['data']);
				this.productList = result[4];
				this.processCustomerAvrageTable(result[5]['data']);
				this.inActiveUsers = result[6]['data'];
				this.topTenParty = result[7]['data']
				this.processMonthlyTrend(result[8]['data']);
				this.isLoading = false;
			}
		});
	}

	processGradeInDetailTable(data) {
		this.gradeInDetailTable = [];
		data.map((element) => {
			if (element) {
				element.quantity_import = 0;
				element.quantity_local = 0;
				if (element.import_local_flag == 1) {
					element.quantity_import = element.quantity;
				}
				if (element.import_local_flag == 2) {
					element.quantity_local = element.quantity;
				}
				this.gradeInDetailTable.push(element);
			}
			return element;
		})
	}

	processCustomerAvrageTable(data) {
		this.customerAvrageTable = [];
		data.map((element) => {
			if (element) {
				element.quantity_import = 0;
				element.quantity_local = 0;
				if (element.import_local_flag == 1) {
					element.quantity_import = element.quantity;
				}
				if (element.import_local_flag == 2) {
					element.quantity_local = element.quantity;
				}
				this.customerAvrageTable.push(element);
			}
			return element;
		})
	}

	processMainGrade(data) {
		this.mainGradeTable = [];
		let total_quantity_import = [];
		let total_quantity_local = [];
		let rate = []
		let lable = []
		data.map((element) => {
			if (element) {
				element.quantity_import = 0;
				element.quantity_local = 0;
				if (element.import_local_flag == 1) {
					element.quantity_import = element.quantity;
					total_quantity_import.push(Number(element.quantity).toFixed(3));
				}
				if (element.import_local_flag == 2) {
					element.quantity_local = element.quantity;
					total_quantity_local.push(Number(element.quantity).toFixed(3));
				}
				element.grade_category_name = `${element.name}`;
				lable.push(element.grade_category_name)
				this.mainGradeTable.push(element);
			}
			this.mainGradeChartLabels = lable;
			this.mainGradeChartData = total_quantity_local; // total_quantity_import
			return element;
		})
	}

	processState(data) {
		let total_quantity_import = [];
		let total_quantity_local = [];
		this.stateTable = [];
		let label = []
		let rate = []
		if (data.length > 0) {
			data.map(element => {
				element.quantity_import = 0;
				element.quantity_local = 0;
				if (element.import_local_flag == 1) {
					element.quantity_import = element.quantity;
					total_quantity_import.push(Number(element.quantity).toFixed(3));
				}
				if (element.import_local_flag == 2) {
					element.quantity_local = element.quantity;
					total_quantity_local.push(Number(element.quantity).toFixed(3));
				}
				rate.push(element.nb_average_rate.toFixed(2));
				label.push(element.name)
				this.stateTable.push(element);
			})
			this.stateChartLabels = label;
			this.stateChartData = [
				{ data: total_quantity_import, label: 'Quantity (Import) : ' },
				{ data: total_quantity_local, label: 'Quantity (Local) : ' },
				{ data: rate, label: 'Average Rate : ' }
			];
		}
	}

	processZone(data) {
		this.zoneTable = [];
		let total_quantity_import = [];
		let total_quantity_local = [];
		let lable = []
		let rate = []
		if (data.length > 0) {
			data.map(element => {
				element.quantity_import = 0;
				element.quantity_local = 0;
				if (element.import_local_flag == 1) {
					element.quantity_import = element.quantity;
					total_quantity_import.push(Number(element.quantity).toFixed(3));
				}
				if (element.import_local_flag == 2) {
					element.quantity_local = element.quantity;
					total_quantity_local.push(Number(element.quantity).toFixed(3));
				}
				lable.push(element.marketing_person);
				rate.push(Number(element.nb_average_rate).toFixed(2));
				this.zoneTable.push(element);
			});
			this.zoneChartLabels = lable;
			this.zoneChartData = [
				{ data: total_quantity_import, label: 'Quantity (Import) : ' },
				{ data: total_quantity_local, label: 'Quantity (Local) : ' },
				{ data: rate, label: 'Rate : ' }
			];
		}

	}

	processMonthlyTrend(data) {
		this.monthlyTrendz = [];
		this.lineChartLabels = [];
		this.lineChartData = [];
		if (data && data.length > 0) {

			let total_quantity_import = [];
			let total_quantity_local = [];

			this.monthlyTrendz = data.map((data) => {
				// quantity.push(data.quantity);
				data.quantity_import = 0;
				data.quantity_local = 0;

				if (data.import_local_flag == 1) {
					data.quantity_import = data.quantity;
					total_quantity_import.push(Number(data.quantity).toFixed(3));
				}
				if (data.import_local_flag == 2) {
					data.quantity_local = data.quantity;
					total_quantity_local.push(Number(data.quantity).toFixed(3));
				}

				// data.quantity = data.quantity;
				if (data.months == 1) {
					data.month_label = `JAN - ${data.years.toString().slice(2)}`
				}
				if (data.months == 2) {
					data.month_label = `FEB - ${data.years.toString().slice(2)}`
				}
				if (data.months == 3) {
					data.month_label = `MAR - ${data.years.toString().slice(2)}`
				}
				if (data.months == 4) {
					data.month_label = `APR - ${data.years.toString().slice(2)}`
				}
				if (data.months == 5) {
					data.month_label = `MAY - ${data.years.toString().slice(2)}`
				}
				if (data.months == 6) {
					data.month_label = `JUN - ${data.years.toString().slice(2)}`
				}
				if (data.months == 7) {
					data.month_label = `JUL - ${data.years.toString().slice(2)}`
				}
				if (data.months == 8) {
					data.month_label = `AUG - ${data.years.toString().slice(2)}`
				}
				if (data.months == 9) {
					data.month_label = `SEP - ${data.years.toString().slice(2)}`
				}
				if (data.months == 10) {
					data.month_label = `OCT - ${data.years.toString().slice(2)}`
				}
				if (data.months == 11) {
					data.month_label = `NOV - ${data.years.toString().slice(2)}`
				}
				if (data.months == 12) {
					data.month_label = `DEC - ${data.years.toString().slice(2)}`
				}
				this.lineChartLabels.push(data.month_label);

				return data;
			});
			this.lineChartData = [
				{ data: total_quantity_import, label: 'Quantity (Import) : ' },
				{ data: total_quantity_local, label: 'Quantity (Local) : ' }
			];
		}
	}

	switchView(view) {
		if (view == 'STATE') { this.isStateTable = !this.isStateTable; }
		if (view == 'ZONE') { this.isZoneTable = !this.isZoneTable; }
		if (view == 'MAINGRADE') { this.isMainGradeTable = !this.isMainGradeTable }
		if (view == 'MAINGRADE') { }
		if (view == 'GRADEINDETAILS') { this.isDetailGradeTable = !this.isDetailGradeTable }
	}
}
