

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MainSubOrgService, SubOrgList } from '../../masters/sub-org-master/main-sub-org-service';
import { SupplierDealService } from '../foreign-supplier-deal/supplier-deal-service';
import { SelectService } from '../../../shared/dropdown-services/select-services';
import { Currency } from '../../../shared/dropdown-services/currency';
import { Unit } from '../../../shared/dropdown-services/unit';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { FileUpload, SubOrg, CommonApis, foreignSupplier, oneForeignSupplierDeal,Notifications, NotificationsUserRel, UsersNotification } from '../../../shared/apis-path/apis-path';
import { MessagingService } from '../../../service/messaging.service';
import { UserDetails } from '../../login/UserDetails.model';


@Component({

	selector: 'app-edit-fs-deal',
	templateUrl: './edit-fs-deal.component.html',
	styleUrls: ['./edit-fs-deal.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		MainSubOrgService,
		SupplierDealService,
		DatePipe,
		SelectService,
		CrudServices,
		MessagingService


	]
})
export class EditFsDealComponent implements OnInit {
	box_title = 'Foreign Supplier Deal';
	month = new Array();
	serverUrl: string;
	supplierDealForm: FormGroup;
	unit_list: Unit;
	sub_org =[];
	date = new Date();
	dealDocsUpload: Array<File> = [];
	currency: Currency;
	docs: string;
	curr_year: Number;
	deal_id: number;
	sub_org_id: number;
	public today = new Date();

	public yearMask = [/\d/, /\d/, /\d/, /\d/];



	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	org_address: any;

	notification_details: any;
    notification_tokens = [];
    notification_id_users = []
    notification_users = [];
    message: any;
	user: UserDetails;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private subOrgService: MainSubOrgService,
		private SuppDealService: SupplierDealService,
		public datepipe: DatePipe,
		private selectService: SelectService,
		private CrudService: CrudServices,
		private MessagingService: MessagingService,
		private loginService: LoginService,

	) {


		this.user = this.loginService.getUserDetails();

		this.CrudService.getAll<any>(foreignSupplier.getAll).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.sub_org = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.org_address + ' )'; return i; });

			}
		});

		this.CrudService.getAll<any>(CommonApis.getAllCurrency).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.currency = response;
			}

		});

		this.CrudService.getAll<any>(CommonApis.getAllUnitDrumMt).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.unit_list = response;
			}
		});




		this.month = [
			{ 'name': 'Jan', 'id': 1 },
			{ 'name': 'Feb', 'id': 2 },
			{ 'name': 'March', 'id': 3 },
			{ 'name': 'April', 'id': 4 },
			{ 'name': 'May', 'id': 5 },
			{ 'name': 'June', 'id': 6 },
			{ 'name': 'July', 'id': 7 },
			{ 'name': 'Aug', 'id': 8 },
			{ 'name': 'Sep', 'id': 9 },
			{ 'name': 'Oct', 'id': 10 },
			{ 'name': 'Nov', 'id': 11 },
			{ 'name': 'Dec', 'id': 12 },
		];


		this.supplierDealForm = new FormGroup({

			'sub_org_id': new FormControl(null, Validators.required),
			'deal_dt': new FormControl(null, Validators.required),
			'deal_quantity': new FormControl(null, Validators.required),
			'deal_rate': new FormControl(null, Validators.required),
			'unit_id': new FormControl(null, Validators.required),
			'currency_id': new FormControl(null),
			'shipment_month': new FormControl(null, Validators.required),
			'shipment_year': new FormControl(null, Validators.required),
			'deal_docs': new FormControl(null),
			'indent_quantity': new FormControl(0),
			'transnational_sale_pi_qty': new FormControl(0),
			'forward_sale_pi_qty': new FormControl(0),
			'highseas_sale_pi_qty': new FormControl(0),
			'remark': new FormControl(null),

		});


	}

	ngOnInit() {

		this.getNotifications('FOREIGN_SALE_DEAL_EDIT');

		this.curr_year = Number(this.datepipe.transform(this.date, 'yyyy'));

		this.route.params.subscribe((params: Params) => {
			this.deal_id = +params['deal_id'];
		});




		let sub_org_id: number;
		let deal_dt = '';
		let deal_quantity = '';
		let deal_rate = '';
		let unit_id = '';
		let currency_id = '';
		let shipment_month = '';
		let shipment_year = '';
		let indent_quantity = '';
		let transnational_sale_pi_qty = '';
		let forward_sale_pi_qty = '';
		let highseas_sale_pi_qty = '';
		let remark = '';
		let deal_docs = '';
		let html = '';

		this.CrudService.getOne<any>(oneForeignSupplierDeal.getOneFsDeal, {
			id: this.deal_id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				sub_org_id = response[0]['sub_org_id'];
				deal_dt = response[0]['deal_dt'];
				deal_quantity = response[0]['deal_quantity'];
				deal_rate = response[0]['deal_rate'];
				unit_id = response[0]['unit_id'];
				currency_id = response[0]['currency_id'];
				shipment_month = response[0]['shipment_month'];
				shipment_year = response[0]['shipment_year'];
				indent_quantity = response[0]['indent_quantity'];
				transnational_sale_pi_qty = response[0]['transnational_sale_pi_qty'];
				forward_sale_pi_qty = response[0]['forward_sale_pi_qty'];
				highseas_sale_pi_qty = response[0]['highseas_sale_pi_qty'];
				remark = response[0]['remark'];
				if (response[0]['deal_docs']) {
					deal_docs = JSON.parse(response[0]['deal_docs']);
				}

				this.sub_org_id = sub_org_id;


				this.supplierDealForm.controls['sub_org_id'].setValue(sub_org_id);
				this.supplierDealForm.controls['deal_dt'].setValue(deal_dt);
				this.supplierDealForm.controls['deal_quantity'].setValue(deal_quantity);
				this.supplierDealForm.controls['deal_rate'].setValue(deal_rate);
				this.supplierDealForm.controls['unit_id'].setValue(unit_id);
				this.supplierDealForm.controls['currency_id'].setValue(currency_id);
				this.supplierDealForm.controls['shipment_month'].setValue(shipment_month);
				this.supplierDealForm.controls['shipment_year'].setValue(shipment_year);
				this.supplierDealForm.controls['indent_quantity'].setValue(indent_quantity);
				this.supplierDealForm.controls['transnational_sale_pi_qty'].setValue(transnational_sale_pi_qty);
				this.supplierDealForm.controls['forward_sale_pi_qty'].setValue(forward_sale_pi_qty);
				this.supplierDealForm.controls['highseas_sale_pi_qty'].setValue(highseas_sale_pi_qty);
				this.supplierDealForm.controls['remark'].setValue(remark);

				if (deal_docs) {

					this.docs = '';
					for (const val of deal_docs) {
						html = '<a href="' + val + '" class="btn btn-outline-primary" target="_blank">Document</a>&nbsp;';
						this.docs = this.docs + html;

					}

				}
			}

		});

		// this.SuppDealService.getOneFsDeal(this.deal_id).subscribe((response) => {
		// 	sub_org_id = response[0]['sub_org_id'];
		// 	deal_dt = response[0]['deal_dt'];
		// 	deal_quantity = response[0]['deal_quantity'];
		// 	deal_rate = response[0]['deal_rate'];
		// 	unit_id = response[0]['unit_id'];
		// 	currency_id = response[0]['currency_id'];
		// 	shipment_month = response[0]['shipment_month'];
		// 	shipment_year = response[0]['shipment_year'];
		// 	indent_quantity = response[0]['indent_quantity'];
		// 	remark = response[0]['remark'];
		// 	if (response[0]['deal_docs']) {
		// 		deal_docs = JSON.parse(response[0]['deal_docs']);
		// 	}

		// 	this.sub_org_id = sub_org_id;


		// 	this.supplierDealForm.controls['sub_org_id'].setValue(sub_org_id);
		// 	this.supplierDealForm.controls['deal_dt'].setValue(deal_dt);
		// 	this.supplierDealForm.controls['deal_quantity'].setValue(deal_quantity);
		// 	this.supplierDealForm.controls['deal_rate'].setValue(deal_rate);
		// 	this.supplierDealForm.controls['unit_id'].setValue(unit_id);
		// 	this.supplierDealForm.controls['currency_id'].setValue(currency_id);
		// 	this.supplierDealForm.controls['shipment_month'].setValue(shipment_month);
		// 	this.supplierDealForm.controls['shipment_year'].setValue(shipment_year);
		// 	this.supplierDealForm.controls['indent_quantity'].setValue(indent_quantity);
		// 	this.supplierDealForm.controls['indent_quantity'].setValue(indent_quantity);
		// 	this.supplierDealForm.controls['remark'].setValue(remark);

		// 	if (deal_docs) {

		// 		this.docs = '';
		// 		for (const val of deal_docs) {
		// 			html = '<a href="' + val + '" class="btn btn-outline-primary" target="_blank">Document</a>&nbsp;';
		// 			this.docs = this.docs + html;

		// 		}

		// 	}
		// });


	}


	
    getNotifications(name) {
        this.notification_tokens = [];
        this.notification_id_users = []
        this.notification_users = [];

        this.CrudService.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
            if (notification.code == '100' && notification.data.length > 0) {
                this.notification_details = notification.data[0];
                console.log(this.notification_details, "received details")
                this.CrudService.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
                    console.log(notificationUser, 'DATA');

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

    async generateNotification(data, id) {
        console.log(this.notification_details, 'DIKSHA************');
        if (this.notification_details != undefined) {
            let body = {
                notification: data,
                registration_ids: this.notification_tokens
            };

            console.log(body, 'BODY****************');


            await this.MessagingService.sendNotification(body).then((response) => {
                if (response) {
                    console.log(response);

                    this.saveNotifications(body['notification'], id)
                }
                this.MessagingService.receiveMessage();
                this.message = this.MessagingService.currentMessage;

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
                table_name: 'foreign_supplier_deals',
            })
        }
        console.log(this.notification_users, "this.notification_users")
        this.CrudService.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
        }, (error) => console.error(error));
    }

	public getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
	}

	onSubmit() {
		if (!this.supplierDealForm.invalid) {

			// const formData: any = new FormData();
			// formData.append('sub_org_id', this.supplierDealForm.value.sub_org_id);
			// formData.append('deal_dt', this.convert(this.supplierDealForm.value.deal_dt));
			// formData.append('deal_quantity', this.supplierDealForm.value.deal_quantity);
			// formData.append('deal_rate', this.supplierDealForm.value.deal_rate);
			// formData.append('unit_id', this.supplierDealForm.value.unit_id);
			// formData.append('currency_id', this.supplierDealForm.value.currency_id);
			// formData.append('shipment_month', this.supplierDealForm.value.shipment_month);
			// formData.append('shipment_year', this.supplierDealForm.value.shipment_year);
			// formData.append('indent_quantity', this.supplierDealForm.value.indent_quantity);

			// if (this.supplierDealForm.value.remark !== null) {
			//   formData.append('remark', this.supplierDealForm.value.remark);
			// } else {
			//   formData.append('remark', '');
			// }

			// formData.append('id', this.deal_id);

			let detailData ={
				sub_org_id: this.supplierDealForm.value.sub_org_id,
				deal_dt: this.convert(this.supplierDealForm.value.deal_dt),
				deal_quantity: this.supplierDealForm.value.deal_quantity,
				deal_rate: this.supplierDealForm.value.deal_rate,
				unit_id: this.supplierDealForm.value.unit_id,
				currency_id: this.supplierDealForm.value.currency_id,
				shipment_month: this.supplierDealForm.value.shipment_month,
				shipment_year: this.supplierDealForm.value.shipment_year,
				indent_quantity: this.supplierDealForm.value.indent_quantity,
				transnational_sale_pi_qty: this.supplierDealForm.value.transnational_sale_pi_qty,
				forward_sale_pi_qty: this.supplierDealForm.value.forward_sale_pi_qty,
				highseas_sale_pi_qty: this.supplierDealForm.value.highseas_sale_pi_qty,
				remark: this.supplierDealForm.value.remark ? this.supplierDealForm.value.remark : ''

			};
			let formData: any = {
				id: this.deal_id,
				data :detailData
			};
			const fileData: any = new FormData();

			const deal_doc: Array<File> = this.dealDocsUpload;
			if (deal_doc.length > 0) {
				for (let i = 0; i < deal_doc.length; i++) {
					fileData.append('deal_docs', deal_doc[i], deal_doc[i]['name']);
				}
				this.CrudService.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let files = [];
					let filesList = res.uploads.deal_docs;
					if (filesList.length > 0) {
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}
						detailData['deal_docs'] = JSON.stringify(files);
						this.updateData(formData);
					}
				});

			} else {
				if (this.deal_id) {

					this.CrudService.getOne<any>(oneForeignSupplierDeal.updateFsDeal,formData).subscribe((response)=>{
							

						let subOrgDetailsNew: any = [];
                        subOrgDetailsNew = this.sub_org.find(item => item.sub_org_id === this.sub_org_id);
                        let data = {
                            "title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
                            "body": `Foreign Sales Deal: Updated Sales Deal Against ${subOrgDetailsNew.sub_org_name} of Quantity : ${detailData.deal_quantity}, Rate: ${detailData.deal_rate}  `,
                            "click_action": "#"
                        }
                        this.generateNotification(data, 1);

						this.toasterService.pop(response.message, response.message, response.data);
						
						//this.router.navigate(['forex/grade-assortment/' + this.sub_org_id]);
					});
					// this.SuppDealService.updateSupplierSalesDeal(formData).subscribe((response) => {

					// 	if (response.code === '100') {
					// 		this.toasterService.pop(response.message, response.message, response.data);
					// 		setTimeout(() => {
					// 			this.onBack();
					// 		}, 2000);
					// 	}
					// });
				}
			}

		}
	}

	updateData(formData) {
		if (this.deal_id) {

			this.CrudService.getOne<any>(oneForeignSupplierDeal.updateFsDeal,formData).subscribe((response)=>{

				let subOrgDetailsNew: any = [];
				subOrgDetailsNew = this.sub_org.find(item => item.sub_org_id === this.sub_org_id);
				let data = {
					"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
					"body": `Foreign Sales Deal: Updated Sales Deal Against ${subOrgDetailsNew.sub_org_name} of Quantity : ${formData.deal_quantity}, Rate: ${formData.deal_rate}  `,
					"click_action": "#"
				}
				this.generateNotification(data, 1);

				this.toasterService.pop(response.message, response.message, response.data);	
				//this.router.navigate(['forex/grade-assortment/' + this.sub_org_id]);
				
			});

			// this.SuppDealService.updateSupplierSalesDeal(formData).subscribe((response) => {

			// 	if (response.code === '100') {
			// 		this.toasterService.pop(response.message, response.message, response.data);
			// 		setTimeout(() => {
			// 			this.onBack();
			// 		}, 2000);
			// 	}
			// });
		}
	}




	dealDocs(event: any) {
		this.dealDocsUpload = <Array<File>>event.target.files;
	}

	onBack() {
		this.router.navigate(['forex/grade-assortment/' + this.sub_org_id]);
	}



	convert(str) {
		const date = new Date(str),
			mnth = ('0' + (date.getMonth() + 1)).slice(-2),
			day = ('0' + date.getDate()).slice(-2);
		return [date.getFullYear(), mnth, day].join('-');
	}


	getDocsArray(docs: string) {
		return JSON.parse(docs);
	}

	get_org_address($e, dataarr) {
		// console.log($e)
		if (dataarr && $e) {
			const status = [] = dataarr.find(s => s['sub_org_id'] === $e);
			if (status) {
				this.org_address = status['org_address'] + ',' + status['location_vilage'];
			}
		} else {
			this.org_address = '';
		}
	}



	getMonth(month: Number) {
		switch (month) {
			case 1: {
				return 'jan';
				break;
			}
			case 2: {
				return 'Feb';
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
				return 'Aug';
				break;
			}
			case 9: {
				return 'Sept';
				break;
			}
			case 10: {
				return 'Oct';
				break;
			}
			case 11: {
				return 'Nov';
				break;
			}
			case 12: {
				return 'Dec';
				break;
			}

		}
	}

}

