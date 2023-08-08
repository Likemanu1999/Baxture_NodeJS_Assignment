import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { SupplierDealService } from '../foreign-supplier-deal/supplier-deal-service';
import { ModalDirective } from 'ngx-bootstrap';
import { GradeMasterService } from '../../masters/grade-master/grade-master-service';
import { PortMasterService } from '../../masters/port-master/port-master-service';
import { AddGradeService, AddGradeList } from './add-grade-service';

import { CrudServices } from "../../../shared/crud-services/crud-services";
import { PortMaster, GradeMaster, oneForeignSupplierDeal, gradeAssortment } from "../../../shared/apis-path/apis-path";
import { staticValues } from '../../../shared/common-service/common-service';


@Component({
	selector: 'app-add-grade-port',
	templateUrl: './add-grade-port.component.html',
	styleUrls: ['./add-grade-port.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		SupplierDealService,
		DatePipe,
		GradeMasterService,
		PortMasterService,
		AddGradeService,
		CrudServices

	]
})

export class AddGradePortComponent implements OnInit {

	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;



	isLoading = false;
	count = 0;
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	user: UserDetails;
	links: string[] = [];
	serverUrl: string;
	id: number;
	filterQuery: any;
	filterArray = ['id', 'grade_name', 'port_name', 'ga_quantity', 'ga_rate'];
	searchData = [];

	add_grade_port = false;
	edit_grade_assortment = false;
	delete_grade_assortment = false;
	add_pi = false;
	sub_org_name: string;
	sub_org_id: number;
	deal_date: string;
	deal_quantity: string;
	deal_rate: string;
	shipment_month: string;
	shipment_year: string;
	balance_qty: string;
	new_bal_qty: any;
	grade_list = [];
	port_list = [];
	public data: AddGradeList;
	grades = new Array();
	unit_in_ton: number;
	unit_name: string;
	

	addGradeForm: FormGroup;
	searchTerm: string;
	searchPort: string;
	searchId: string;
	filterData = [];


	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	indent_qty: string;
	transnational_sale_pi_qty : string;
	forward_sale_pi_qty : string;
	highseas_sale_pi_qty : string;


	import_type_list = staticValues.import_type;


	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private SuppDealService: SupplierDealService,
		public datepipe: DatePipe,
		private gradeService: GradeMasterService,
		private portservice: PortMasterService,
		private addGradeService: AddGradeService,
		private CrudServices: CrudServices
	) {
		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.add_grade_port = (this.links.indexOf('add grade port') > -1);
		this.edit_grade_assortment = (this.links.indexOf('edit grade assortment') > -1);
		this.delete_grade_assortment = (this.links.indexOf('delete grade assortment') > -1);

		this.add_pi = (this.links.indexOf('add pi') > -1);


		this.route.params.subscribe((params: Params) => {
			this.id = +params['id'];

		});

		// this.gradeService.getGrades().subscribe((response) => {
		//   this.grade_list = response;
		// });

		// this.portservice.getData().subscribe((response) => {
		//   this.port_list = response;
		// });

		this.CrudServices.getAll<any>(PortMaster.getAll).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.port_list = response;
			}

		});

		this.CrudServices.getAll<any>(GradeMaster.getAll).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.grade_list = response;
			}
		});



		this.getGradeAgainstOneDeal();
		this.getOneFsDealDetail();


		this.addGradeForm = new FormGroup({

			'grade_id': new FormControl(null, Validators.required),
			'ga_quantity': new FormControl(null, Validators.required),
			'ga_rate': new FormControl(null, Validators.required),
			'destination_port_id': new FormControl(null, Validators.required),
			'remark': new FormControl(null),
			'import_type': new FormControl(null),
			'id': new FormControl(null)

		});




	}

	ngOnInit() {
	}

	addNew() {
		this.onReset();
		this.myModal.show();
	}




	getGradeAgainstOneDeal() {
		this.isLoading = true;
		this.CrudServices.getOne<any>(gradeAssortment.getGaAgainstOneFs, {
			fs_deal_id: this.id
		}).subscribe((response) => {
			console.log(response,"import_type");

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.isLoading = false;
				this.data = response;
				console.log(response, "getGaAgainstOneFs");
			}
		});

		// this.addGradeService.getGaAgainstOneFs(this.id)
		//   .subscribe(
		//     (data) => {
		//       this.isLoading = false;
		//       this.data = data;
		//       console.log(data, "getGaAgainstOneFs");
		//     });
	}

	getOneFsDealDetail() {

		this.CrudServices.getOne<any>(oneForeignSupplierDeal.getOneFsDeal, {
			id: this.id
		}).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.sub_org_name = response[0]['sub_org_name'];
				this.deal_date = response[0]['deal_dt'];
				this.deal_quantity = response[0]['deal_quantity'];
				this.deal_rate = response[0]['deal_rate'];
				this.shipment_month = response[0]['shipment_month'];
				this.shipment_year = response[0]['shipment_year'];
				this.indent_qty = response[0]['indent_quantity'];
				this.transnational_sale_pi_qty = response[0]['transnational_sale_pi_qty'];
				this.forward_sale_pi_qty = response[0]['forward_sale_pi_qty'];
				this.highseas_sale_pi_qty = response[0]['highseas_sale_pi_qty'];
				//this.new_bal_qty=Number(response[0]['balance_qty'])-Number(this.indent_qty)
				this.new_bal_qty=Number(response[0]['balance_qty']);
				this.balance_qty = response[0]['balance_qty'];
				this.unit_in_ton = response[0]['unit_id'];
				this.sub_org_id = response[0]['sub_org_id'];

				if (this.unit_in_ton === 1) {
					this.unit_name = 'MT';
				} else {
					this.unit_name = 'Drum';
				}
			}

		});
		// this.SuppDealService.getOneFsDeal(this.id).subscribe((response) => {
		//   this.sub_org_name = response[0]['sub_org_name'];
		//   this.deal_date = response[0]['deal_dt'];
		//   this.deal_quantity = response[0]['deal_quantity'];
		//   this.deal_rate = response[0]['deal_rate'];
		//   this.shipment_month = response[0]['shipment_month'];
		//   this.shipment_year = response[0]['shipment_year'];
		//   this.indent_qty = response[0]['indent_quantity'];
		//   this.balance_qty = response[0]['balance_qty'];
		//   this.unit_in_ton = response[0]['unit_id'];
		//   this.sub_org_id = response[0]['sub_org_id'];

		//   if (this.unit_in_ton === 1) {
		//     this.unit_name = 'MT';
		//   } else {
		//     this.unit_name = 'Drum';
		//   }

		// });
	}

	onSubmit() {

		console.log( this.addGradeForm.value.import_type," this.addGradeForm.value.import_type")
		if (this.addGradeForm.invalid) {

		} else {

			// const formData: any = new FormData();
			// formData.append('grade_id', this.addGradeForm.value.grade_id);
			// formData.append('ga_rate', this.addGradeForm.value.ga_rate);
			// formData.append('ga_quantity', this.addGradeForm.value.ga_quantity);
			// formData.append('destination_port_id', this.addGradeForm.value.destination_port_id);
			// formData.append('remark', this.addGradeForm.value.remark);
			// formData.append('fs_deal_id', this.id);
			// formData.append('id', this.addGradeForm.value.id );


			let formData: any = {
				grade_id: this.addGradeForm.value.grade_id,
				ga_rate: this.addGradeForm.value.ga_rate,
				ga_quantity: this.addGradeForm.value.ga_quantity,
				destination_port_id: this.addGradeForm.value.destination_port_id,
				import_type: this.addGradeForm.value.import_type,
				remark: this.addGradeForm.value.remark,
				fs_deal_id: this.id,
				id: this.addGradeForm.value.id
			};


			if (this.addGradeForm.value.id) {
				this.CrudServices.getOne<any>(gradeAssortment.updateGa, formData).subscribe((response) => {
					if (response.code === "101") {
						this.toasterService.pop(response.message, response.message, response.data);
					} else {
						this.toasterService.pop(response.message, 'Success', response.data);
						this.onReset();
						this.getGradeAgainstOneDeal();
						this.getOneFsDealDetail();
						this.myModal.hide();
					}

				});

				// this.addGradeService.updateGradeAssortment(formData).subscribe((response) => {
				//   this.toasterService.pop(response.message, 'Success', response.data);
				//   this.onReset();
				//   this.getGradeAgainstOneDeal();
				//   this.getOneFsDealDetail();
				//   this.myModal.hide();
				// });

			} else {
				this.CrudServices.getOne<any>(gradeAssortment.addGradeAssortment, formData).subscribe((response) => {
					if (response.code === "101") {
						this.toasterService.pop(response.message, response.message, response.data);
					} else {
						this.toasterService.pop(response.message, 'Success', response.data);
						this.onReset();
						this.getGradeAgainstOneDeal();
						this.getOneFsDealDetail();
						this.myModal.hide();
					}

				});

				// this.addGradeService.addGradeAssortment(formData).subscribe((response) => {
				//   this.toasterService.pop(response.message, 'Success', response.data);
				//   this.onReset();
				//   this.getGradeAgainstOneDeal();
				//   this.getOneFsDealDetail();
				//   this.myModal.hide();
				// });

			}


		}
	}


	onEdit(item) {
		if (item) {
			this.myModal.show();

			let grade_list: number[];
			let destination_port_id: number[];
			let ga_quantity;
			let remark;
			let import_type;
			let ga_rate;
			grade_list = item['grade_id'];
			destination_port_id = item['destination_port_id'];

			// grade_list = item['grade_id'].split(',').map(Number);
			// destination_port_id = item['destination_port_id'].split(',').map(Number);

			ga_quantity = item['ga_quantity'];
			ga_rate = item['ga_rate'];
			remark = item['remark'];
			import_type = item['import_type'];
			this.addGradeForm.controls['grade_id'].setValue(grade_list);
			this.addGradeForm.controls['destination_port_id'].setValue(destination_port_id);
			this.addGradeForm.controls['ga_quantity'].setValue(ga_quantity);
			this.addGradeForm.controls['ga_rate'].setValue(ga_rate);
			this.addGradeForm.controls['remark'].setValue(remark);
			this.addGradeForm.controls['import_type'].setValue(import_type);
			this.addGradeForm.controls['id'].setValue(item.id);

		}

	}
	onDelete(id) {
		if (id) {

			this.CrudServices.getOne<any>(gradeAssortment.deleteGa, {
				id: id
			}).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.toasterService.pop(response.message, 'Success', response.data);
					this.getGradeAgainstOneDeal();
					this.getOneFsDealDetail();
				}
			});

			// this.addGradeService.deleteGa(id).subscribe((response) => {
			// 	this.toasterService.pop(response.message, 'Success', response.data);
			// 	this.getGradeAgainstOneDeal();
			// 	this.getOneFsDealDetail();
			// });
		}

	}

	onReset() {
		this.addGradeForm.reset();

	}

	public getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
	}

	onBack() {
		this.router.navigate(['forex/grade-assortment/' + this.sub_org_id]);
	}

	getMonth(month: any) {
		switch (month) {
			case 1: {
				return 'January';
				break;
			}
			case 2: {
				return 'February';
				break;
			}
			case 3: {
				return 'March';
				break;
			}
			case 4: {
				return 'April';
				break;
			}
			case 5: {
				return 'May';
				break;
			}
			case 6: {
				return 'June';
				break;
			}
			case 7: {
				return 'July';
				break;
			}
			case 8: {
				return 'August';
				break;
			}
			case 9: {
				return 'September';
				break;
			}
			case 10: {
				return 'October';
				break;
			}
			case 11: {
				return 'November';
				break;
			}
			case 12: {
				return 'December';
				break;
			}

		}
	}

	addPI(id: number) {
		this.router.navigate(['forex/proforma-invoice/' + id]);
	}


	getImportName(id) {

		if(id==1){
			return 'SELF'
		}else if (id==2)
		{
			return 'HighSeas'
		}else if (id==3)
		{
			return 'Indent'
		}else if (id==4)
		{
			return 'Forward'	
		}else if (id==5)
		{
			return 'Transnational'
		}else{
			return ''
		}
	}

}
