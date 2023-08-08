import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { forexReports, MainGrade } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { TooltipModule } from 'primeng/tooltip';
import { ModalDirective } from 'ngx-bootstrap';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { FormControl, FormGroup } from '@angular/forms';
import html2canvas from 'html2canvas';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';


@Component({
	selector: 'app-unsold-summary-old',
	templateUrl: './unsold-summary-old.component.html',
	styleUrls: ['./unsold-summary-old.component.css', 'unsold-summary-old.scss'],
	providers: [CrudServices, ToasterService, LoginService]
})
export class UnsoldSummaryOldComponent implements OnInit {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('myHoldModel', { static: false }) public myHoldModel: ModalDirective;
	@ViewChild('screen', { static: false }) screen: ElementRef;
	@ViewChild('canvas', { static: false }) canvas: ElementRef;
	@ViewChild('downloadLink', { static: false }) downloadLink: ElementRef;
	@ViewChild('screenDet', { static: false }) screenDet: ElementRef;
	@ViewChild('canvasDet', { static: false }) canvasDet: ElementRef;
	@ViewChild('downloadLinkDet', { static: false }) downloadLinkDet: ElementRef;

	data = {};
	Detaildata = [];
	detailView = false;
	detailView_unsold = false;
	main_grade = [{ id: 0, name: 'All' }];

	isLoading: boolean = false;
	isLoading_unsold: boolean = false;
	port_name = '';
	main_godown_id_Set: any;
	gradeDetails: any;
	grade_name_model: any;
	hold_qty: any;
	set_hold_grade_id: any;
	main_grade_ids: string[];

	all_godown_lc_not_issue = 0;
	all_godown_non_pending = 0;
	all_godown_reg_arrival = 0;
	all_godown_bond_arrival = 0;
	all_godown_stock_transfer_intransite = 0;
	all_godown_local_purchase = 0;
	all_godown_godwon_stock = 0;
	all_godown_sales_pending = 0;
	all_godown_forward_sales_pending = 0;



	one_godown_all_grade_lc_not_issue = 0;
	one_godown_all_grade_non_pending = 0;
	one_godown_all_grade_reg_arrival = 0;
	one_godown_all_grade_bond_arrival = 0;
	one_godown_all_grade_stock_transfer_intransite = 0;
	one_godown_all_grade_local_purchase = 0;
	one_godown_all_grade_godwon_stock = 0;
	one_godown_all_grade_sales_pending = 0;

	//ImgView : boolean = true;
	todayDate = Date.now();

	user: UserDetails;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	constructor(private CrudServices: CrudServices, private toasterService: ToasterService, private loginService: LoginService) {
		this.user = this.loginService.getUserDetails();
		console.log(this.user.userDet[0].role_id, this.user.userDet[0].company_master.product_masters, "this.user")

		let productsArr = this.user.userDet[0].company_master.product_masters;
		console.log(Object.values(productsArr), "DEBUG_VIEW")

		var productIds = productsArr.map(function (e) {
			return e.id;
		}).filter(function (e, i, a) {
			return a.indexOf(e) === i;
		});
		console.log(productIds, "productIds");

		if (this.user.userDet[0].role_id == 1) {
			//all product
			this.getUnsoldList();
		} else {
			//spipl
			this.CrudServices.postRequest<any>(MainGrade.getMutipleMainGrade, {
				products_ids: productIds
			}).subscribe((response) => {
				console.log(Object.values(response), "multiple");
				var mainGradeIds = response.map(function (e) {
					return e.id;
				}).filter(function (e, i, a) {
					return a.indexOf(e) === i;
				});
				this.main_grade_ids = mainGradeIds;
				this.getUnsoldList();
			});
		}
	}

	ngOnInit() {
		this.CrudServices.getRequest<any>(MainGrade.getAll).subscribe((response) => {
			console.log(response, "main_grade");
			this.main_grade = [...this.main_grade, ...response];
			console.log(this.main_grade, "this.main_grade");
		});
		//this.getUnsoldList();

		// this.CrudServices.postRequest<any>(forexReports.getUnsoldSummaryImportLocal,{
		// 	main_grade_id_array: this.main_grade_ids
		// }).subscribe((response)=>{
		// 	console.log(response,"importLocal")
		// });

	}

	getUnsoldList() {
		this.isLoading_unsold = true;

		this.CrudServices.postRequest<any>(forexReports.getUnsoldSummary, {
			main_grade_id_array: this.main_grade_ids
		}).subscribe((response) => {
			console.log(response, "unsold");
			this.data = response;

			this.all_godown_lc_not_issue = 0;
			this.all_godown_non_pending = 0;
			this.all_godown_reg_arrival = 0;
			this.all_godown_bond_arrival = 0;
			this.all_godown_stock_transfer_intransite = 0;
			this.all_godown_local_purchase = 0;
			this.all_godown_godwon_stock = 0;
			this.all_godown_sales_pending = 0;
			this.all_godown_forward_sales_pending = 0

			for (let elem of response.port_wise_details) {
				this.all_godown_lc_not_issue = this.all_godown_lc_not_issue + elem.lc_not_issue;
				this.all_godown_non_pending = this.all_godown_non_pending + elem.non_pending;
				this.all_godown_reg_arrival = this.all_godown_reg_arrival + elem.reg_arrival;
				this.all_godown_bond_arrival = this.all_godown_bond_arrival + elem.bond_arrival;
				this.all_godown_stock_transfer_intransite = this.all_godown_stock_transfer_intransite + elem.stock_transfer_intransite;
				this.all_godown_local_purchase = this.all_godown_local_purchase + elem.local_purchase;
				this.all_godown_godwon_stock = this.all_godown_godwon_stock + elem.godwon_stock;
				this.all_godown_sales_pending = this.all_godown_sales_pending + elem.sales_pending;
				this.all_godown_forward_sales_pending = this.all_godown_forward_sales_pending + elem.forward_sales_pending;
			}

			this.isLoading_unsold = false;
			this.detailView_unsold = true;


		});
	}



	getDetailUnsold(main_godown_id, port_name) {
		this.isLoading = true;

		this.port_name = port_name;
		this.main_godown_id_Set = main_godown_id;

		this.CrudServices.postRequest<any>(forexReports.getDetailUnsoldSummary, {
			main_godown_id: main_godown_id,
			main_grade_id_array: this.main_grade_ids
		}).subscribe((response) => {

			console.log(response, "unsoldnnn");

			this.one_godown_all_grade_lc_not_issue = 0;
			this.one_godown_all_grade_non_pending = 0;
			this.one_godown_all_grade_reg_arrival = 0;
			this.one_godown_all_grade_bond_arrival = 0;
			this.one_godown_all_grade_stock_transfer_intransite = 0;
			this.one_godown_all_grade_local_purchase = 0;
			this.one_godown_all_grade_godwon_stock = 0;
			this.one_godown_all_grade_sales_pending = 0;


			for (let item of response) {
				// console.log(item[0]);
				console.log(item[1], "nh");
				let total_inhand = 0;
				let sale_pen_agn_grade = 0;
				let mainGrade;
				for (let elem of item[1]) {

					let inhand = (elem.nonpending ? elem.nonpending : 0) + (elem.reg_intransit ? elem.reg_intransit : 0) + (elem.bond_intransit ? elem.bond_intransit : 0) + (elem.local_intransit ? elem.local_intransit : 0) + (elem.stock_transfer_intransite ? elem.stock_transfer_intransite : 0) + (elem.inventory ? elem.inventory : 0);


					total_inhand = total_inhand + inhand;
					sale_pen_agn_grade = sale_pen_agn_grade + (elem.sales_pending ? elem.sales_pending : 0);
					mainGrade = elem.main_grade_name;

					this.one_godown_all_grade_lc_not_issue = this.one_godown_all_grade_lc_not_issue + (elem.lc_not_issue ? elem.lc_not_issue : 0);
					this.one_godown_all_grade_non_pending = this.one_godown_all_grade_non_pending + (elem.nonpending ? elem.nonpending : 0);
					this.one_godown_all_grade_reg_arrival = this.one_godown_all_grade_reg_arrival + (elem.reg_intransit ? elem.reg_intransit : 0);
					this.one_godown_all_grade_bond_arrival = this.one_godown_all_grade_bond_arrival + (elem.bond_intransit ? elem.bond_intransit : 0);
					this.one_godown_all_grade_stock_transfer_intransite = this.one_godown_all_grade_stock_transfer_intransite + (elem.stock_transfer_intransite ? elem.stock_transfer_intransite : 0)
					this.one_godown_all_grade_local_purchase = this.one_godown_all_grade_local_purchase + (elem.local_intransit ? elem.local_intransit : 0)
					this.one_godown_all_grade_godwon_stock = this.one_godown_all_grade_godwon_stock + (elem.inventory ? elem.inventory : 0)
					this.one_godown_all_grade_sales_pending = this.one_godown_all_grade_sales_pending + (elem.sales_pending ? elem.sales_pending : 0)
				}
				console.log(sale_pen_agn_grade, "sale_pen_agn_grade")
				item[2] = total_inhand;
				item[3] = total_inhand - sale_pen_agn_grade;
				item[4] = mainGrade;
			}

			this.Detaildata = response;

			this.isLoading = false;
			this.detailView = true;

		});

	}

	getDetailGrade(grade_id, grade_name) {
		console.log(this.main_godown_id_Set, grade_id, "grade_idgrade_id");
		this.CrudServices.postRequest<any>(forexReports.getDetailUnsoldGradeWise, {
			main_godown_id: this.main_godown_id_Set,
			grade_id: grade_id
		}).subscribe((response) => {

			console.log(response, "Grade Wise Unsold");
			this.grade_name_model = grade_name;
			this.gradeDetails = response;
			this.myModal.show();
		});
	}
	holdQtyUpdate(grade_id, port_name) {

		this.port_name = port_name;
		console.log(grade_id, "grade_id")
		this.set_hold_grade_id = grade_id;
		this.CrudServices.postRequest<any>(forexReports.getHoldQty, {
			main_godown_id: this.main_godown_id_Set,
			grade_id: grade_id
		}).subscribe((response) => {
			console.log(response, "Grade Wise Unsold");
			this.hold_qty = response[0].hold_qty;
			this.myHoldModel.show();
		});
	}

	closeModal() {
		this.myModal.hide();
		this.myHoldModel.hide();
	}

	submitHold() {
		console.log(this.hold_qty, "holdtyq")
		this.CrudServices.postRequest<any>(forexReports.updateHoldQty, {
			main_godown_id: this.main_godown_id_Set,
			grade_id: this.set_hold_grade_id,
			hold_qty: this.hold_qty
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getDetailUnsold(this.main_godown_id_Set, this.port_name);
			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
			}
			this.myHoldModel.hide();
		});

	}

	onSelectMainGrade() {
		this.detailView = false;
		// this.main_grade_ids =$e;
		console.log(this.main_grade_ids);
		this.getUnsoldList();


	}

	downloadImage() {
		html2canvas(this.screen.nativeElement).then(canvas => {
			this.canvas.nativeElement.src = canvas.toDataURL();
			this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
			this.downloadLink.nativeElement.download = 'UnsoldSummary.png';
			this.downloadLink.nativeElement.click();
		});


		// this.ImgView= false;
	}

	downloadImageDet() {
		html2canvas(this.screenDet.nativeElement).then(canvasDet => {
			this.canvasDet.nativeElement.src = canvasDet.toDataURL();
			this.downloadLinkDet.nativeElement.href = canvasDet.toDataURL('image/png');
			this.downloadLinkDet.nativeElement.download = 'GradeWiseUnsold.png';
			this.downloadLinkDet.nativeElement.click();
		});
	}

}
