import { ActivatedRoute, Router } from "@angular/router";
import { Component, ElementRef, EventEmitter, OnInit, ViewChild, } from "@angular/core";
import { Dashboard, DashboardNew, GradeMaster, newHoliday, ProductMaster, SubOrg } from "../../../shared/apis-path/apis-path";
import { ToasterConfig, ToasterService } from "angular2-toaster";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DatePipe } from "@angular/common";
import { LoginService } from "../../login/login.service";
import { MessagingService } from "../../../service/messaging.service";
import { PermissionService } from "../../../shared/pemission-services/pemission-service";
import { UserDetails } from "../../login/UserDetails.model";
import { forkJoin } from "rxjs";
import { staticValues } from "../../../shared/common-service/common-service";
import * as moment from "moment";
@Component({
	selector: 'app-dashboard-new',
	templateUrl: './dashboard-new.component.html',
	styleUrls: ['./dashboard-new.component.scss'],
	providers: [
		DatePipe,
		ToasterService,
		LoginService,
		CrudServices,
		PermissionService,
		MessagingService
	]
})
export class DashboardNewComponent implements OnInit {
	datePickerConfig = staticValues.datePickerConfigNew;
	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to Change?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "left";
	public closeOnOutsideClick: boolean = true;
	user: UserDetails;
	isLoading = false;
	is_holiday: any = false;
	holiday: any = [];
	private toasterService: ToasterService;
	bsRangeValue: any; //DatePicker range Value
	@ViewChild("mf", { static: false }) table: ElementRef;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	maxDate: Date = new Date(); // date range will not greater  than today
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	// barChart
	public barChartOptions: any = {
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
	colors = [
		{
			backgroundColor: [
				'#86C7F3',
				'#FFE29A',
				'#FFA1B5',
				'#E5E5E5',
				'#ffcc80',
				'#ffccbc',
				'#18ffff',
				'#81d4fa',
				'#b39ddb'
			]
		}
	];
	public doughnutOptions = {
		events: true,
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

						// Darker text color for lighter background
						if (i == 3) {
							ctx.fillStyle = '#444';
						}
						var percent = String(Math.round(dataset.data[i] / total * 100)) + "%";
						// Display percent in another line, line break doesn't work for fillText
						ctx.fillText(percent, model.x + x, model.y + y + 15);
					}
				});
			}
		}

	};
	saleConsignment: any = [];
	finalResult: any = [];
	zoneTable: any = [];
	barChartLabels: any[];
	barChartData: any[];
	doughnutChartLabels: any[];
	doughnutChartData: any[];


	total_orders: number = 0;
	total_cancelled_order: number = 0;
	total_dispatch_quantity: number = 0;
	total_logistic_power: number = 0;
	total_dispatch_with_logistic_power: number = 0;
	total_pending_order: number = 0;
	total_outstanding: number = 0;
	total_payment_due: number = 0;

	zoneWiseData: any = [];
	stateWiseData: any = [];
	productWiseData: any = [];
	gradeWiseData: any = [];
	topTenBuyersData: any = [];
	inactiveBuyersList: any = [];
	autoCancelOrdersCount: any = [];
	blacklistBuyersList: any = [];

	totalZoneConsignmentQty: number = 0;
	totalZonePlanning: number = 0;
	totalZoneKnockOfQty = 0;
	totalZoneDispatchQty: number = 0;
	// org_total_consignment: number = 0;
	// org_total_plan: number = 0;
	// org_total_dispatch: number = 0;
	// org_total_dispatch_logistic: number = 0;
	// org_total_knockout: number = 0;
	// total_outstanding: number = 0;
	// total_payment_due: number = 0;
	// org_numbers: any;
	stateTable: any = [];
	gradeTable: any = [];
	mainGradeTable: any = [];

	public productdoughnutChartLabels: string[] = [];
	public productdoughnutChartData: number[] = [];
	public productdoughnutChartType = 'doughnut';
	public gradedoughnutChartLabels: string[] = [];
	public gradedoughnutChartData: number[] = [];
	public gradedoughnutChartType = 'doughnut';
	public pieChartType: string = 'pie';

	isStateBarChart: boolean = false;
	isStateDounghnutChart: boolean = false;
	isZoneBarchart: boolean = false;
	isZoneDounghnutChart: boolean = false;
	isProductDounghnutChart: boolean = false;
	isGradeDounghnutChart: boolean = true;
	sales_dash: boolean = false;
	links: any;
	userRole: number = null
	selectedZone: any = [];
	selectedCompany: any = null;
	selectedDealType: any = null;
	selectedProduct: any = null;
	p: number = 1;
	p_zone: number = 1;
	pageOfItems: Array<any>;
	inactiveParty: any = [];
	topTenParty: any = [];
	inactive_user_link: boolean = false;
	top_ten_party_link: boolean = false;
	statewise_progress_link: boolean = false;
	zonewise_progress_link: boolean = false;
	product_chart_link: boolean = false;
	grade_chart_link: boolean = false;
	marketing_persone_analytics: boolean = false;
	org_number_link: boolean = false;
	message: any;
	block_user_list: any = [];
	block_user_list_count: any = [];
	monthlyTrendz: any = [];
	partyList: any = [];
	selectedParty: any;

	public lineChartData: Array<any> = [];
	public lineChartLabels: Array<any> = [];
	public lineChartOptions: any = {
		animation: false,
		responsive: true
	};

	public lineChartColours: Array<any> = [
		{ // grey
			backgroundColor: 'rgba(148,159,177,0.2)',
			borderColor: 'rgba(148,159,177,1)',
			pointBackgroundColor: 'rgba(148,159,177,1)',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: 'rgba(148,159,177,0.8)'
		},
		{ // dark grey
			backgroundColor: 'rgba(77,83,96,0.2)',
			borderColor: 'rgba(77,83,96,1)',
			pointBackgroundColor: 'rgba(77,83,96,1)',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: 'rgba(77,83,96,1)'
		},
		{ // grey
			backgroundColor: 'rgba(148,159,177,0.2)',
			borderColor: 'rgba(148,159,177,1)',
			pointBackgroundColor: 'rgba(148,159,177,1)',
			pointBorderColor: '#fff',
			pointHoverBackgroundColor: '#fff',
			pointHoverBorderColor: 'rgba(148,159,177,0.8)'
		}
	];
	public lineChartLegend = true;
	public lineChartType = 'line';

	selectedGrade: any
	gradeList: unknown;
	productList: any = [];

	bsInlineRangeValue: Date[];

	constructor(public datePipe: DatePipe,
		toasterService: ToasterService,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public crudServices: CrudServices,
		public messagingService: MessagingService
	) {

		var date = new Date(), y = date.getFullYear(), m = date.getMonth();
		var firstDay = new Date(y, m, 1);
		var lastDay = new Date(y, m + 1, 0);
		this.bsRangeValue = [
			new Date(moment().startOf('month').format("YYYY-MM-DD")),
			new Date(moment().format("YYYY-MM-DD"))
		];

		if (this.loginService.getUserDetails()) {
			this.user = this.loginService.getUserDetails();
			this.links = this.user.links;
			this.sales_dash = (this.links.indexOf('sales_dash') > -1);
			this.inactive_user_link = (this.links.indexOf('inactive_user_link') > -1);
			this.top_ten_party_link = (this.links.indexOf('top_ten_party_link') > -1);
			this.statewise_progress_link = (this.links.indexOf('statewise_progress_link') > -1);
			this.zonewise_progress_link = (this.links.indexOf('zonewise_progress_link') > -1);
			this.product_chart_link = (this.links.indexOf('product_chart_link') > -1);
			this.grade_chart_link = (this.links.indexOf('grade_chart_link') > -1);
			this.marketing_persone_analytics = (this.links.indexOf('marketing_persone_analytics') > -1);
			this.org_number_link = (this.links.indexOf('org_number_link') > -1);
			this.selectedCompany = (this.user.userDet[0].role_id == 1) ? null : this.user.userDet[0].company_id;

			if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
				this.selectedZone.push(this.user.userDet[0].id);
			} else {
				this.selectedZone = null;
				this.selectedCompany = null;
			}
		}
	}

	ngOnInit(): void {
		if (!this.loginService.isLoggedIn()) {
			this.router.navigate(['login']);
		}
		this.getHoliday();
		this.messagingService.requestPermissionNew()
		this.messagingService.receiveMessage();
		this.getProductsList();
		this.dashboardGetAllNumberAtOnce();
		this.getGrades();
		this.getParty();
	}

	getHoliday() {
		this.crudServices.getOne(newHoliday.getCurrentHoliday, {
			date: new Date()
		}).subscribe(res => {
			if (res['code'] == '100') {
				if (res['data'].length > 0) {
					this.is_holiday = true;
					res['data'].forEach(element => {
						element.icon_path = "../assets/img/holidays/" + element.icon + ".png";
					});
					this.holiday = res['data'][0];
				} else {
					this.is_holiday = false;
				}
			} else {
				this.is_holiday = false;
			}
		});
	}

	onDateChange(event) {
		if (event) {
			this.dashboardGetAllNumberAtOnce()
		}
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.bsRangeValue = dateValue.range;

	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.bsRangeValue))
			this.uploadSuccess.emit(false);
	}

	getAVGOf(arraySource, field) {
		return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0) / arraySource.length;
	}

	getSumOf(arraySource, field) {
		return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0);
	}

	getGrades() {
		this.crudServices.getAll(GradeMaster.getAll).subscribe((response) => {
			this.gradeList = response
		})
	}

	getParty() {
		let body = {
			category_id: 11,
			org_unit: 1,
			product_type: this.selectedCompany
		}

		if (this.selectedZone) {
			body['sales_acc_holder'] = this.selectedZone
		}

		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, body).subscribe((response) => {
			if (response) {
				this.partyList = response.map(customer => {
					customer.sub_org_name = `${customer.sub_org_name} -(${customer.location_vilage ? customer.location_vilage : ''})`
					return customer;
				});
			}
		});
	}

	onChangePage(pageOfItems: Array<any>) {
		this.pageOfItems = pageOfItems;
	}

	dateFormating(date) {
		if (date) {
			return this.datePipe.transform(date, "yyyy-MM-dd");
		} else {
			return "";
		}
	}

	productTableDounoght() { this.isProductDounghnutChart = !this.isProductDounghnutChart }
	gradeTableDounoght() { this.isGradeDounghnutChart = !this.isGradeDounghnutChart }

	onLogout() {
		this.loginService.logout();
	}

	MinusOperation(order, dispatch) {
		let result = Number(order) - Number(dispatch);
		if (result > 0) {
			return result;
		}
		else {
			return 0;
		}
	}

	goAddDeal() {
		this.router.navigate(["/sales/add-sales-order"]);
	}

	getProductsList() {
		this.crudServices.getOne(ProductMaster.getOneDataByField, {
			company_id: this.selectedCompany
		}).subscribe(res => {
			this.productList = res;
			let pe_pp_merge = {
				abbr: null,
				company_id: 2,
				deleted: 0,
				desc_goods: null,
				hsn_code: null,
				id: 0,
				name: "Olefin"
			};
			let search_product = this.productList.find(x => x.id == pe_pp_merge.id);
			if (search_product == undefined) {
				this.productList.push(pe_pp_merge);
			}
		});
	}

	dashboardGetAllNumberAtOnce() {
		let condition = {};
		this.isLoading = true;
		if (this.bsRangeValue) {
			condition['from_date'] = this.dateFormating(this.bsRangeValue[0]);
			condition['to_date'] = this.dateFormating(this.bsRangeValue[1]);
		}
		if (this.selectedZone != null && this.selectedZone != undefined && this.selectedZone != 0) {
			condition['zone_id'] = this.selectedZone;
		}
		if (this.selectedCompany) {
			condition['company_id'] = this.selectedCompany;
		}
		if (this.selectedProduct != null) {
			condition['product_id'] = this.selectedProduct;
		}
		condition['deal_type'] = 1;

		let req0 = this.crudServices.getOne(DashboardNew.getTotalOrdersData, condition);
		let req1 = this.crudServices.getOne(DashboardNew.getTotalDispatchData, condition);
		let req2 = this.crudServices.getOne(DashboardNew.getTotalOutstanding, condition);
		let req3 = this.crudServices.getOne(DashboardNew.getTotalPaymentDue, condition);
		let req4 = this.crudServices.getOne(DashboardNew.getZoneWiseData, condition);
		let req5 = this.crudServices.getOne(DashboardNew.getStateWiseData, condition);
		let req6 = this.crudServices.getOne(DashboardNew.getProductWiseData, condition);
		let req7 = this.crudServices.getOne(DashboardNew.getGradeWiseData, condition);
		let req8 = this.crudServices.getOne(DashboardNew.getTopTenBuyersData, condition);
		let req9 = this.crudServices.getOne(DashboardNew.getInactiveBuyersList, condition);
		let req10 = this.crudServices.getOne(DashboardNew.getAutoCancelOrdersCount, condition);
		let req11 = this.crudServices.getOne(DashboardNew.getBlacklistBuyersList, condition);

		forkJoin([req0, req1, req2, req3, req4, req5, req6, req7, req8, req9, req10, req11]).subscribe(res => {
			if (res.length > 0) {
				this.total_orders = res[0]['data'][0].total_orders;
				this.total_cancelled_order = res[0]['data'][0].total_cancelled_order;
				this.total_dispatch_quantity = res[1]['data'][0].total_dispatch_quantity;
				this.total_logistic_power = res[1]['data'][0].total_logistic_power;
				this.total_dispatch_with_logistic_power = Number(this.total_dispatch_quantity) + Number(this.total_logistic_power)
				this.total_pending_order = Number(this.total_orders) - Number(this.total_dispatch_quantity);
				this.total_cancelled_order = res[0]['data'][0].total_cancelled_order;
				this.total_outstanding = res[2]['data'][0].total_outstanding;
				this.total_payment_due = res[3]['data'][0].total_payment_due;
				this.zoneWiseData = res[4]['data'];
				this.stateWiseData = res[5]['data'];
				this.processMainGrade(res[6]['data']);
				this.gradeWiseData = res[7]['data'];
				this.topTenBuyersData = res[8]['data'];
				this.inactiveBuyersList = res[9]['data'];
				this.autoCancelOrdersCount = res[10]['data'];
				this.blacklistBuyersList = res[11]['data'];
				this.isLoading = false;
			}
		});
	}


	//ON SELECT SPECIFIC PRODUCT 
	onChangeProduct(product) {
		this.selectedProduct = product.id;
		this.dashboardGetAllNumberAtOnce();
	}


	//ON SELECT SPECIFIC COMAPANY 
	onChangeCompany(company) {
		this.selectedProduct = company;
		this.dashboardGetAllNumberAtOnce();
	}



	processMainGrade(data) {
		this.mainGradeTable = [];
		let qty = [];
		let rate = []
		let lable = []
		this.productdoughnutChartLabels = [];
		this.productdoughnutChartData = []

		if (data.length > 0) {
			data.map((element) => {
				if (element) {
					qty.push(element.quantity);
					element.main_grade_name = `${element.main_grade_name}`;
					lable.push(element.main_grade_name)
					this.mainGradeTable.push(element);
				}
				this.productdoughnutChartLabels = lable;
				this.productdoughnutChartData = qty;
				return element;
			})
		}

	}

	processMonthlyTrend(data) {
		this.monthlyTrendz = [];
		this.lineChartLabels = [];
		this.lineChartData = [];
		if (data && data.length > 0) {

			let quantity = []
			this.monthlyTrendz = data.map((data) => {
				quantity.push(data.quantity)
				data.quantity = data.quantity;
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

			this.lineChartData = [{ data: quantity, label: 'Quantity' }];
		}
	}

}
