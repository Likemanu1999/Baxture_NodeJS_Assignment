import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { billOfLading, chacharges, GodownMaster, NonNegotiable, Notifications, NotificationsUserRel, PortMaster, shipmentType, SubOrg, UsersNotification } from '../../../shared/apis-path/apis-path';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MessagingService } from '../../../service/messaging.service';

@Component({
	selector: 'app-bill-of-lading',
	templateUrl: './bill-of-lading.component.html',
	styleUrls: ['./bill-of-lading.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		CrudServices,
		MessagingService
	]
})
export class BillOfLadingComponent implements OnInit {

	
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to Delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'right';
	public closeOnOutsideClick: boolean = true;

	user: UserDetails;
	links: string[] = [];


	addBlForm: FormGroup;
	cols: { field: string; header: string; style: string; }[];
	bl_list: any;
	isLoading: boolean = false;
	addForm: boolean;
	containerDetails: boolean;
	material_type: { id: number; value: string; }[];
	form: number;
	template: any = [];
	count: number = 0;
	godown: any = [];
	non_id: any;
	cfsdpd: any = [];
	noting: any = [];
	shipmentType: any;
	bsRangeValue: Date[];
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	bl_id: any;
	editBlForm: boolean;
	non_invoice_no: any;
	totalNonQty = 0;
	qtyValidation: string;
	totalBlQty = 0;
	high_seas: boolean;
	shipping_line: any;
	global_list: any;
	original_doc_recv_dt: any;
	material_received_flag = 0;
	exbond_details: boolean;
	inbond_date: string;
	container_details: boolean;
	bl_add: boolean;
	bl_edit: boolean;
	bl_delete: boolean;
	godown_id: any;
	materialBags: any;
	details = [];
	colsExbond: { field: string; header: string; style: string; }[];
	transporter = [];
	terminal = [];
	cha_agent = [];
	godown_bond = [];
	port_id: number;
	bl_qauntity: number;
	noc: number;
	type_cont: number;
	supplier_id: any;
	grade_id: any;
	port_name: any;
	FOB: any;

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	message: any;
	high_sea_pi_flag:any;
	ifHighSeas:any;


	constructor(private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private route: ActivatedRoute,
		private router: Router,
		private fb: FormBuilder,
		public datepipe: DatePipe,
		private messagingService: MessagingService,
		private crudServices: CrudServices) {

		const perms = this.permissionService.getPermission();

		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;

		this.bl_add = (this.links.indexOf('BL add') > -1);
		this.bl_edit = (this.links.indexOf('BL edit') > -1);
		this.bl_delete = (this.links.indexOf('BL delete') > -1);
		this.container_details = (this.links.indexOf('container Details') > -1);




		this.cols = [
			{ field: 'source', header: 'BL No/ Dt', style: '100' },
			{ field: 'status', header: 'Bl Qty', style: '100' },
			{ field: 'id', header: 'Shipment Type', style: '120' },
			{ field: 'non_received_date', header: 'Noting Of Material', style: '200' },
			{ field: 'sub_org_name', header: 'High Seas Invoice No.', style: '200' },
			{ field: 'invoice_no', header: 'High Seas Invoice Date', style: '100' },
			{ field: 'non_revised_copy', header: 'High Seas Rate', style: '100' },
			{ field: 'grade_name', header: 'CFS/DPD', style: '100' },
			{ field: 'quantity', header: 'Request Sent to CFS on Dt', style: '100' },
			{ field: 'arrival_date', header: 'All Clearing Original Doc Received Dt', style: '200' },
			{ field: '', header: 'Exchange Copy submited to bank name', style: '200' },
			{ field: '', header: 'Material In Bond', style: '180' },
			{ field: '', header: 'Material In Bond Date', style: '180' },
			{ field: '', header: 'Material EX Bond Details', style: '250' },


		];

		
		

		this.crudServices.getAll<any>(chacharges.getShipmentStatus).subscribe(response => {
			this.material_type = response;
		})
		//	this.material_type = [{ id: 1, value: "In Bond" }, { id: 2, value: "Ex Bond" }, { id: 3, value: "CFS" }, { id: 4, value: "DPD" }, { id: 5, value: "CFS-Inbond" }];





		this.addBlForm = this.fb.group({
			bill_lading_no: new FormControl(null, Validators.required),
			bl_date: new FormControl(null, Validators.required),
			bl_qauntity: new FormControl(null, Validators.required),
			shipment_type: new FormControl(null),
			material_in_bond_status: new FormControl(null),
			container_no: new FormControl(null, Validators.required),
			noting_of_material: new FormControl(null),
			cfs_dpd: new FormControl(null),
			bond_id: new FormControl(null),
			cha_id: new FormControl(null),
			fob_id: new FormControl(null),
			terminal_id: new FormControl(null),
			transporter_id: new FormControl(null),
			clear_original_doc_receive_dt: new FormControl(null),
			inbond_date: new FormControl(null),
			material_received_date_logistics: new FormControl(null),
			remark: new FormControl(null),
			high_seas_invc_no: new FormControl(null),
			high_seas_invc_dt: new FormControl(null),
			high_seas_invc_rate: new FormControl(null),
			ExBondDetails: this.fb.array([]),
		});


	}

	ngOnInit() {

		this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(response => {
			this.godown = response;

			this.godown_bond = response.filter(data => data.head_godown == 2);

		})

		this.crudServices.getAll<any>(shipmentType.getAll).subscribe(response => {
			this.shipmentType = response;

		})

		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 110 }).subscribe(response => {
			console.log(response);
			
			this.cfsdpd = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.location_vilage + ' )'; return i; });
			// this.cfsdpd = response;

		})

		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 97 }).subscribe(response => {
			//this.terminal = response;
			this.terminal = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.location_vilage + ' )'; return i; });

			

		})

		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 114 }).subscribe(response => {
			//this.terminal = response;
			this.FOB = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.location_vilage + ' )'; return i; });

			

		})


		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 111 }).subscribe(response => {
			this.transporter = response;

		})



		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 62 }).subscribe(response => {
		//	this.noting = response;
			this.noting = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.location_vilage + ' )'; return i; });

		})

		this.route.params.subscribe((params: Params) => {
			this.non_id = +params['id'];


		});

		this.crudServices.getOne<any>(NonNegotiable.get_one_non, { id: this.non_id }).subscribe(response => {
             console.log(response,"oneNon");
			 
			this.high_sea_pi_flag = response[0].high_seas_pi;
			if(this.high_sea_pi_flag==1){
				this.ifHighSeas=2;
				this.high_seas=true;
			}else{
				this.ifHighSeas=0;
				this.high_seas=false;
			}
			console.log(this.ifHighSeas,"this.ifHighSeas")
			this.non_invoice_no = response[0].invoice_no;
			this.grade_id = response[0].grade_id;
			this.supplier_id = response[0].supplier_id;
			this.totalNonQty = response[0].totalNonQty;
			this.port_id = response[0].port_id;
			if (response[0].shippingLine) {
				this.shipping_line = response[0].shippingLine.sub_org_name;
			}

			this.port_name = response[0].port_master != null? response[0].port_master.port_name : null;

			this.original_doc_recv_dt = response[0].original_doc_received_date;
			this.material_received_flag = response[0].material_received_flag;
			if (response[0].port_master.godowns.length) {
				this.godown_id = response[0].port_master.godowns[0].id;

			}

			if (response[0].materialBags) {
				this.materialBags = response[0].materialBags;
			}
			let cha_agent = [];
			this.crudServices.getOne<any>(PortMaster.getOne, { id: this.port_id }).subscribe(port => {

				if (port[0].port_chas != null) {

					port[0].port_chas.forEach(element => {
						cha_agent.push(element.sub_org_master);
					});


				}

				if (cha_agent.length > 0) {
					this.cha_agent = cha_agent;
				}




			})



		})

		this.getList();

	}

	getList() {
		this.isLoading = true;
		this.totalBlQty = 0;
		this.crudServices.getOne<any>(billOfLading.getData, { id: this.non_id }).subscribe(response => {
			console.log(response);



			this.isLoading = false;
			this.bl_list = response;
			this.global_list = response;

			for (let val of response) {
				this.totalBlQty = this.totalBlQty + val.bl_qauntity;

			}

		})
	}

	addRow() {

		this.template.push({
			godown_id: this.godown_id,
			exbond_qty: null,
			exbond_date: null,
			short_qty : null,
			short_remark : null,
			damage_qty: null,
			damage_remark: null,
			short_deb_credit_no: null,
			damage_deb_credit_no: null,
			id: null
			

		});

		this.count = this.count + 1;
		const exbond = this.addBlForm.controls.ExBondDetails as FormArray;
		exbond.controls = [];
		if (this.template.length > 0) {
			for (const val of this.template) {
				exbond.push(this.fb.group({
					godown_id: new FormControl(val.godown_id),
					exbond_qty: new FormControl(val.exbond_qty),
					exbond_date: new FormControl(val.exbond_date),
					short_qty: new FormControl(val.short_qty),
					short_remark: new FormControl(val.short_remark),
					damage_qty: new FormControl(val.damage_qty),
					damage_remark: new FormControl(val.damage_remark),
					short_deb_credit_no: new FormControl(val.short_deb_credit_no),
					damage_deb_credit_no: new FormControl(val.damage_deb_credit_no),
					idVal: new FormControl(val.id)

				}));
			}
		}
	}

	deleteRow(index) {

		this.template.splice(index, 1);
		this.count = this.count - 1;
		const exbond = this.addBlForm.controls.ExBondDetails as FormArray;
		exbond.controls = [];
		console.log(this.template);
		if (this.template.length > 0) {
			for (const val of this.template) {
				exbond.push(this.fb.group({
					godown_id: new FormControl(val.godown_id),
					exbond_qty: new FormControl(val.exbond_qty),
					exbond_date: new FormControl(val.exbond_date),
					short_qty: new FormControl(val.short_qty),
					short_remark: new FormControl(val.short_remark),
					damage_qty: new FormControl(val.damage_qty),
					damage_remark: new FormControl(val.damage_remark),
					short_deb_credit_no: new FormControl(val.short_deb_credit_no),
					damage_deb_credit_no: new FormControl(val.damage_deb_credit_no),
					idVal: new FormControl(val.id)
				}));
			}
		}

		this.checkExbondQty(index);


	}

	onShipmentChange(event) {

		if (event) {
			if (event.id == 2) {
				this.high_seas = true;
			} else {
				this.high_seas = false;
			}

		} else {
			this.high_seas = false;
		}
	}

	checkQty(event) {

		if (event) {
			const remainingQty = this.totalNonQty - this.totalBlQty;


			if (event.target.value > remainingQty || event.target.value == 0) {
				console.log(remainingQty);
				this.qtyValidation = '<span>Quantity Exceed to Non Quantity</span>';
				this.addBlForm.patchValue({ bl_qauntity: null });
			} else {
				this.qtyValidation = '';
			}
		}
	}

	checkExbondQty(i) {
		//if(event) {
		const exBond = this.addBlForm.value.ExBondDetails;
		let total = 0;
		for (let val of exBond) {
			total += Number(val.exbond_qty);
		}

		if (total > this.addBlForm.value.bl_qauntity) {
			((this.addBlForm.controls.ExBondDetails as FormArray).at(i) as FormGroup).get('exbond_qty').patchValue(null);
			this.toasterService.pop('warning', 'warning', 'Quantity Exceed to Bl Quantity');
		}

	}



	onSubmit() {

		const exBond = this.addBlForm.value.ExBondDetails;
		let shipment_type = 0;
		if(!this.addBlForm.value.shipment_type || this.addBlForm.value.shipment_type == undefined || this.addBlForm.value.shipment_type == null) {
			shipment_type = 1
		} else {
			shipment_type = this.addBlForm.value.shipment_type 
		}


		const data = {
			n_id: this.non_id,
			grade_id: this.grade_id,
			supplier_id: this.supplier_id,
			bill_lading_no: this.addBlForm.value.bill_lading_no,
			bl_date: this.datepipe.transform(this.addBlForm.value.bl_date, 'yyyy-MM-dd'),
			bl_qauntity: this.addBlForm.value.bl_qauntity,
			shipment_type: shipment_type,
			remark: this.addBlForm.value.remark,
			material_in_bond_status: this.addBlForm.value.material_in_bond_status,
			high_seas_invc_no: this.addBlForm.value.high_seas_invc_no,
			high_seas_invc_dt: this.datepipe.transform(this.addBlForm.value.high_seas_invc_dt, 'yyyy-MM-dd'),
			high_seas_invc_rate: this.addBlForm.value.high_seas_invc_rate,
			noting_of_material: this.addBlForm.value.noting_of_material,
			cfs_dpd: this.addBlForm.value.cfs_dpd,
			fob_id: this.addBlForm.value.fob_id,
			inbond_date: this.datepipe.transform(this.addBlForm.value.inbond_date, 'yyyy-MM-dd'),
			material_received_date_logistics: this.datepipe.transform(this.addBlForm.value.material_received_date_logistics, 'yyyy-MM-dd'),


		}

		if (this.addBlForm.value.container_no) {

			const containerString = this.addBlForm.value.container_no;
			const containerArr = containerString.split('\n');
			console.log(containerArr);

			// const qty_per_contr = this.addBlForm.value.bl_qauntity / containerArr.length;
			// let setflag = 0;
			 let containerDetails = [];
			// if (qty_per_contr <= 20) {
			// 	// 20 ft.
			// 	setflag = 1;
			// } else {   //40 ft.
			// 	setflag = 2;
			// }
			//Total Quantity In KG
			// const wt_bag_per_contr = qty_per_contr * 1000;
			// let no_bags_per_contr = 0;
			//Bags Per Containers  each bag 25 kg
			// if (this.materialBags) {
			// 	no_bags_per_contr = wt_bag_per_contr / this.materialBags;  //bags per conatiners

			// }
			// const replace = containerString.replace(/\s/g, "");
			// const containerArr = replace.match(/.{1,11}/g);
			if (containerArr.length > 0) {

				let count = 0
				let qty_per_contr = 0;
				let setflag = 0;
				let no_bags_per_contr = 0;
				for(let cnt of containerArr) {
					const cntn = cnt.replace(/\s+/g, ' ').trim();
					if(cntn != "") {
						count= count + 1
					}

				
				
				}

				if(count >= 1) {
					 qty_per_contr = this.addBlForm.value.bl_qauntity / count;
					
					let containerDetails = [];
					if (qty_per_contr <= 20) {
						// 20 ft.
						setflag = 1;
					} else {   //40 ft.
						setflag = 2;
					}
					//Total Quantity In KG
					const wt_bag_per_contr = qty_per_contr * 1000;
					
					//Bags Per Containers  each bag 25 kg
					console.log(this.materialBags,'testtt');
					
					if (this.materialBags) {
						no_bags_per_contr = wt_bag_per_contr / this.materialBags;  //bags per conatiners
		
					}
				}







				for (let val of containerArr) {
					const cntn = val.replace(/\s+/g, ' ').trim();
					if (cntn != "") {
						containerDetails.push({
							container_number: cntn,
							godown_id: this.godown_id,
							net_wt: qty_per_contr,
							type_cont: setflag,
							bags_per_cont: no_bags_per_contr
						})
					}


				}
				data["containerArr"] = containerDetails;
			}

		}



		let exBondDet = [];
		if (exBond.length > 0) {

			exBond.forEach(element => {
				if (element.godown_id != null && element.exbond_qty != null && element.exbond_date != null && element.godown_id != undefined && element.exbond_qty != 0 && element.exbond_date != undefined) {

					element.exbond_date = this.datepipe.transform(element.exbond_date, 'yyyy-MM-dd');
					exBondDet.push(element);
				}
			});
			if (this.addBlForm.value.inbond_date) {

				if (exBondDet.length > 0) {
					data['exBondDet'] = exBondDet
				}


			} else {
				this.toasterService.pop('warning', 'warning', 'Enter In Bond Date First');
			}
		}



		if (this.bl_id) {
			data['id'] = this.bl_id;
			data['bond_id'] = this.addBlForm.value.bond_id;
			data['terminal_id'] = this.addBlForm.value.terminal_id;
			data['cha_id'] = this.addBlForm.value.cha_id;
			data['transporter_id'] = this.addBlForm.value.transporter_id;
			data['port_id'] = this.port_id;
			data['type_cont'] = this.type_cont;
			data['noc'] = this.noc;


			this.crudServices.updateData<any>(billOfLading.update, data).subscribe(response => {

				if (response.code = 100) {

					let data = {
						"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
						"body": `Bill of lading updated for Invoice : ${this.non_invoice_no} `,
						"click_action": "#"
					  }
					this.generateNotification(data,this.bl_id);
					this.toasterService.pop(response.message, response.message, response.data);
					this.reset();
					this.addForm = false;
					this.getList();

				}

			})
		} else {
			this.crudServices.addData<any>(billOfLading.add, data).subscribe(response => {


				if (response.code = 100) {
					let data = {
						"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
						"body": `Bill of lading added for Invoice : ${this.non_invoice_no} `,
						"click_action": "#"
					  }
					this.generateNotification(data,1);
					this.toasterService.pop(response.message, response.message, response.data);
					this.reset();
					this.addForm = false;
					this.getList();
				}

			})
		}


	}



	addBl() {
		this.getNotifications('ADD_BILL_OF_LADING');
		this.addForm = true;
		this.reset();
		this.addBlForm.patchValue({ clear_original_doc_receive_dt: this.original_doc_recv_dt });
	}

	backBl() {
		this.addForm = false;
		this.reset();
	}

	reset() {
		this.addBlForm.get('container_no').setValidators([Validators.required]);
		this.editBlForm = false;
		this.template = [];
		this.addBlForm.reset();
		this.bl_id = 0;
	}


	editBl(item) {
		console.log(item , 'Diksha');
		this.getNotifications('EDIT_BILL_OF_LADING')



		if (item) {

			let transporter_id = [];
			if (item.bl_transporters.length > 0) {
				item.bl_transporters.forEach(transporter => {
					transporter_id.push(transporter.transporter_id)
				});
			}



			this.addForm = true;
			this.bl_id = item.id;
			this.addBlForm.get('container_no').setValidators(null);
			this.editBlForm = true;
			this.bl_qauntity = item.bl_qauntity;
			if (item.container_details != null) {
				this.noc = item.container_details.length;
				this.type_cont = item.container_details[0].type_cont;
			}

			//console.log(item);
			if (item.shipment_type == 2) {
				this.high_seas = true;
			}
			if (item.exbond_details.length > 0) {
				const exbond = this.addBlForm.controls.ExBondDetails as FormArray;
				exbond.controls = [];
				this.template = item.exbond_details;

				for (const val of item.exbond_details) {
					exbond.push(this.fb.group({
						godown_id: new FormControl(val.godown_id),
						exbond_qty: new FormControl(val.exbond_qty),
						exbond_date: new FormControl(new Date(val.exbond_date)),
						short_qty: new FormControl(val.short_qty),
						short_remark: new FormControl(val.short_remark),
						damage_qty: new FormControl(val.damage_qty),
						damage_remark: new FormControl(val.damage_remark),
						short_deb_credit_no: new FormControl(val.short_deb_credit_no),
						damage_deb_credit_no: new FormControl(val.damage_deb_credit_no),
						idVal: new FormControl(val.id)

					}));
				}

			}
			let object = {};
			for (let key in item) {


				object[key] = item[key]

				if (key == 'bl_date') {

					let date = item[key];
					object[key] = item[key] ? new Date(date) : null;

				}
				if (key == 'high_seas_invc_dt') {
					let date = item[key];
					object[key] = item[key] ? new Date(date) : null;

				} if (key == 'inbond_date') {
					if (item[key] != null) {
						this.exbond_details = true;
						let date = item[key];
						object[key] = new Date(date);
					}

				}

				if(key == 'material_received_date_logistics') {
					let date = item[key];
					object[key] = item[key] ? new Date(date) : null;
				}

				// else {
				// 	object[key] = item[key]
				// }

			}

			
			
			this.addBlForm.patchValue({ clear_original_doc_receive_dt: this.original_doc_recv_dt });
			this.addBlForm.patchValue(object);
			this.addBlForm.patchValue({ 'transporter_id': transporter_id });

			this.ifHighSeas = item.shipment_type


			   
			if(item.staff_member_master.fcm_web_token != null) {
				this.notification_tokens.push(item.staff_member_master.fcm_web_token) ;
				this.notification_users.push(item.staff_member_master.id) ;
			  }
			//  console.log(this.notification_tokens,this.notification_users);
			  
		}
	}

	changeStatus(event , id) {
		console.log(event);
		
		this.crudServices.updateData<any>(billOfLading.updateBondFlag, { bl_id: id , data: {to_be_bond : event? 1 : 0}}).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data);
		})
	}

	onBack() {
		this.router.navigate(['logistics/material-arrival-chart']);
	}

	getContainerDetails(item) {
		this.router.navigate(['logistics/container-details/' + item.id]);
	}

	getType(val) {
		switch (val) {
			case 2: return 'Inbond';
				break;

			case 1: return 'Exbond';
				break;

			case 4: return 'CFS';
				break;

			case 5: return 'DPD';
				break;

			case 3: return 'CFS-Inbond';
				break;
		}


	}

	deleteBl(item) {
		if (item.id) {
			this.crudServices.deleteData<any>(billOfLading.delete, { id: item.id, n_id: item.n_id }).subscribe(response => {
				this.getList();
				this.toasterService.pop(response.message, response.message, response.data);
			})
		}
	}

	filterShipment(event) {
		

		this.bl_list = this.global_list;

		if (event != null && event && event != undefined) {
			this.bl_list = this.bl_list.filter(data => data.shipment_type == event.id)
		} else {
			this.bl_list = this.global_list;
		}
	}

	enableExBond(event) {

		this.exbond_details = false;
		if (event != undefined && event !== null && event !== '') {
			this.exbond_details = true;
		}
	}

	addCharges(id) {
		if (id) {
			this.router.navigate(['logistics/add-charges/' + id]);
		}
	}


	
	getNotifications(name) {
		this.notification_tokens = [];
		this.notification_id_users = []
		this.notification_users = [];
	
	
	    
		this.crudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
			console.log(notification);
			
		  if (notification.code == '100' && notification.data.length > 0) {
			this.notification_details = notification.data[0];
			console.log(this.notification_details, "received details")
			this.crudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
				console.log(notificationUser ,'DATA');
				
			  if (notificationUser.code == '100' && notificationUser.data.length > 0) {
				notificationUser['data'].forEach((element) => {
				  if (element.fcm_web_token) {
					this.notification_tokens.push(element.fcm_web_token);
					this.notification_id_users.push(element.id);
					console.log(this.notification_tokens, this.notification_id_users)
				  }
				});
			  }
			});
		  }
		})
	
	
	
	
	
	  }
	
	
	  generateNotification(data,id) {
		console.log(this.notification_details,'DIKSHA');
		if (this.notification_details != undefined) {
		  let body = {
			notification: data,
			registration_ids: this.notification_tokens
		  };
	
		  console.log(body,'BODY');
		  
	
		  this.messagingService.sendNotification(body).then((response) => {
			if (response) {
			  console.log(response);
			  
			  this.saveNotifications(body['notification'],id)
			}
			this.messagingService.receiveMessage();
			this.message = this.messagingService.currentMessage;
	
		  })
	
		}
	
	
	  }
	
	  saveNotifications(notification_body, id) {
		console.log(id, 'DATA');
	
		this.notification_users = [];
		for (const element of this.notification_id_users) {
		  this.notification_users.push({
			notification_id: this.notification_details.id,
			reciever_user_id: element,
			department_id: 1,
			heading: notification_body.title,
			message_body: notification_body.body,
			url: notification_body.click_action,
			record_id: id,
			table_name: 'bill_of_lading',
		  })
		}
		console.log(this.notification_users, "this.notification_users")
		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	  }

	  deliveryType(value)
	  {
		if(value.type=='CFS'){
		console.log("type >>",value.type);
		this.addBlForm.get('remark').setValidators(Validators.required);
		 this.addBlForm.get('remark').updateValueAndValidity();
		}
		else if(value == null || value.type != 'CFS'){
			this.addBlForm.get('remark').clearValidators();
			this.addBlForm.get('remark').updateValueAndValidity();   
		}
	  }





}
