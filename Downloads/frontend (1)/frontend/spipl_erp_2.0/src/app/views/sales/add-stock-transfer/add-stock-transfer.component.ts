import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { EmailTemplateMaster, GodownMaster, GradeMaster, Notifications, NotificationsUserRel, StockTransfer, SubOrg, UsersNotification } from "../../../shared/apis-path/apis-path";
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators,
} from "@angular/forms";
import { ToasterConfig, ToasterService } from "angular2-toaster";

import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DatePipe } from "@angular/common";
import { LoginService } from "../../login/login.service";
import { MessagingService } from "../../../service/messaging.service";
import { MustNotMatch } from "../validations";
import { staticValues } from "../../../shared/common-service/common-service";

@Component({
	selector: "app-add-stock-transfer",
	templateUrl: "./add-stock-transfer.component.html",
	styleUrls: ["./add-stock-transfer.component.css"],
	providers: [CrudServices, ToasterService, MessagingService, DatePipe],
	encapsulation: ViewEncapsulation.None,
})
export class AddStockTransferComponent implements OnInit {
	card_title = "Add New Stock Transfer"; //card Title
	addStockTransferForm: FormGroup; // Form Group
	minDate: Date;
	loadingQty: number; //Number of loading  quantity out of total quantity
	crossingQty: number; //Number of crossing   quantity out of total quantity
	editMode: boolean = false; //
	godownList: any = []; // All godown List From Master
	gradeList: any = []; //All Grade List From master
	transporterList: any = []; // List Of transporter
	companyList: any = staticValues.companies;

	loadCrossList: any = [
		{ name: "Loading", id: "1" },
		{ name: "Crossing", id: "2" },
		{ name: "Both", id: "3" },
	]; // select options for user crossing or loading

	// deliveryTermaList = staticValues.delivery_term;
	links: string[] = []; //List of links wich user have permissions
	user: any; // User Info
	bsValue: Date = new Date(); //
	dateInputFormat = "Y-m-d"; //date picker Formate
	// filesToUpload: Array<File> = [];

	submitted: false; // form Sumbite true /false
	id: number;
	recievedMinDate: Date;

	loadingCharges: number = 0;
	crossingCharges: number = 0;
	private toasterService: ToasterService; // Toast Service Object and config
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});
	maxDate: Date = new Date();
	selectedToGodown: any;
	selectedFromGodown: any;
	selectedTransporter: any;
	selectedGrade: any;
	emailSubject: string;
	emailFooterTemplete: string;
	emailBodyTemplete: any;
	emailFrom: any;


	notification_details: any;
	notification_tokens = [];//?FCM TIKENS ARRAY
	notification_id_users = []//?STAFF IDS 
	notification_users = [];//?USERS NOTIFICATION ARRAY TO STORE INSIDE DATABASE
	message: any;

	import_local_flag: any = [{ name: "Import", value: "1" }, { name: "Local", value: "2" }];
	role_id: any;
	company_id: any;

	constructor(
		toasterService: ToasterService,
		private crudServices: CrudServices,
		private route: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private formBuilder: FormBuilder,
		private datePipe: DatePipe,
		private messagingService: MessagingService
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;
		this.toasterService = toasterService;
	}



	//?initialize Form and Apply valivadtion Here
	initForm() {
		this.addStockTransferForm = this.formBuilder.group(
			{
				from_godown: new FormControl(null, Validators.required),
				to_godown: new FormControl(null, Validators.required),
				grade: new FormControl(null, Validators.required),
				quantity: new FormControl(null, Validators.required),
				transfer_date: new FormControl(new Date(), Validators.required),
				// received_date: new FormControl(),
				lr_number: new FormControl(null),
				lr_date: new FormControl(new Date(), Validators.required),
				transporter: new FormControl(null, Validators.required),
				load_cross: new FormControl(null, Validators.required),
				loading_qty: new FormControl(),
				crossing_qty: new FormControl(),
				loading_charges: new FormControl(),
				crossing_charges: new FormControl(),
				freight_rate: new FormControl(),
				total_freight_amount: new FormControl(),
				total_load_cross_amount: new FormControl(),
				total_amount_of_freight_load_cross: new FormControl(),
				billing_rate: new FormControl(null),
				truck_number: new FormControl(null, Validators.required),
				eway_bill_flag: new FormControl(null),
				remark: new FormControl(),
				import_local_flag: new FormControl(null, Validators.required),
				dispatch_from: new FormControl(null),
				bill_from: new FormControl(null),
				ship_to: new FormControl(null),
				bill_to: new FormControl(null),
				company_id: new FormControl(this.company_id, Validators.required)




			},
			{
				validator: MustNotMatch("from_godown", "to_godown"), //here is custom validation to check source or destination of  godown must diffrent
			}
		);
	}


	//?Get All Grade List From Master
	getGrade() {
		this.crudServices.getAll(GradeMaster.getAll).subscribe((response) => {
			this.gradeList = response
		})


	}


	//?Get All Godown List From Master
	getGodown() {
		this.crudServices
			.getAll<any>(GodownMaster.getAll)
			.subscribe((godown) => {
				this.godownList = godown;
			});
	}

	//?Get All Transporter List From Master

	getTransporter() {
		let body = {
			category_id: 103,
			// product_type: (this.company_id == 1) ? 1 : 2
		}
		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, body).subscribe(response => {
			if (response.code != "101") {
				this.transporterList = response.map((result) => {
					if (this.company_id == 2) {
						result.sub_org_name = `${result.sub_org_name} - ${result.location_vilage}`;
					} else {
						result.sub_org_name = `${result.sub_org_name} - ${result.org_address}`;
					}
					return result;
				});
			} else {
				this.transporterList = [];
			}
		});
		this.loadingCharges = 0;
	}
	// getTransporter() {
	//   let trans=[]
	//   this.crudServices
	//     .getAll<any>(SubOrg.getTransporter)
	//     .subscribe((transporter) => {
	//       if(transporter){
	//         transporter.map(data=>{
	//           trans.push(data.sub_org_master)
	//         })
	//       }
	//       this.transporterList=trans;
	//     });
	//   this.loadingCharges = 0;
	// }


	//?Form Control Errors If Any
	get f() {
		return this.addStockTransferForm.controls;
	}

	//? Set min Date validation to recieved date It must Grater or equal to transfer date
	onTransDateValueChange(event) {
		this.recievedMinDate = new Date(event);
	}


	ngOnInit(): void {

		this.getGrade();
		this.getGodown();
		this.getTransporter();
		this.initForm();
		this.generateEmailTemplete();
		this.getNotifications()
	}

	onToGodownSelect(event) {
		this.selectedToGodown = event;
	}

	onTransporterSelect(event) {
		this.selectedTransporter = event
	}

	onGradeSelect(event) {
		this.selectedGrade = event;
		if (this.company_id == 2) {
			this.crudServices.getOne<any>(GradeMaster.getGradePrice, {
				grade_id: event.grade_id,
				godown_id: this.addStockTransferForm.value.from_godown
			}).subscribe(res => {
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.addStockTransferForm.patchValue({
							billing_rate: Number(res.data[0].rate)
						});
					} else {
						this.addStockTransferForm.patchValue({
							billing_rate: 0
						});
					}
				} else {
					this.addStockTransferForm.patchValue({
						billing_rate: 0
					});
				}
			});
		}
	}
	//?Aply Loading And Crossing charges on select of from godown
	onFormGodownSelect(event) {
		this.selectedFromGodown = event
		// const selectedFromGodown = this.godownList.filter((data) => data.id === this.addStockTransferForm.value.from_godown);
		this.loadingCharges = event.load_charges;
		this.crossingCharges = event.cross_charges;
		this.addStockTransferForm.patchValue({
			freight_rate: 0
		})
		if (this.addStockTransferForm.value.load_cross) {
			this.onSelectLoading({ id: this.addStockTransferForm.value.load_cross })
		}

	}


	/**
	 *
	 * @param str
	 * !Convert Date In Formate DD-MM-YYYY
	 */
	convert(str) {
		const date = new Date(str),
			mnth = ("0" + (date.getMonth() + 1)).slice(-2),
			day = ("0" + date.getDate()).slice(-2);
		return [date.getFullYear(), mnth, day].join("-");
	}

	onSubmit() {
		//?stop here if form is invalid
		if (this.addStockTransferForm.invalid) {
			return;
		}
		let quantity_value = 0;

		quantity_value = Number(this.addStockTransferForm.value.quantity.toString().replace(/,/g, ''));



		let FormData = {
			from_godown: this.addStockTransferForm.value.from_godown,
			to_godown: this.addStockTransferForm.value.to_godown,
			outward_date: this.convert(this.addStockTransferForm.value.transfer_date),
			quantity: Number(quantity_value / 1000),
			grade_id: this.addStockTransferForm.value.grade,
			remark: this.addStockTransferForm.value.remark ? this.addStockTransferForm.value.remark : null,
			added_by: this.user.userDet[0].id,
			added_date: new Date(),
			lr_no: this.addStockTransferForm.value.lr_number ? this.addStockTransferForm.value.lr_number : 0,
			lr_date: this.addStockTransferForm.value.lr_date ? this.convert(this.addStockTransferForm.value.lr_date) : null,
			transport_id: this.addStockTransferForm.value.transporter,
			load_cross_status: this.addStockTransferForm.value.load_cross,
			load_qty: this.addStockTransferForm.value.loading_qty ? Number(this.addStockTransferForm.value.loading_qty) / 1000 : 0,
			load_charges: this.addStockTransferForm.value.loading_charges ? Number(this.addStockTransferForm.value.loading_charges) : 0,
			cross_qty: Number(this.addStockTransferForm.value.crossing_qty) ? Number(this.addStockTransferForm.value.crossing_qty) / 1000 : 0,
			cross_charges: this.addStockTransferForm.value.crossing_charges ? this.addStockTransferForm.value.crossing_charges : 0,
			load_cross_charges: Number(this.addStockTransferForm.value.total_load_cross_amount),
			frt_rate: this.addStockTransferForm.value.freight_rate ? Number(this.addStockTransferForm.value.freight_rate) : 0,
			tot_frt: this.addStockTransferForm.value.total_freight_amount ? Number(this.addStockTransferForm.value.total_freight_amount) : 0,
			tot_frt_ld_cs: Number(this.addStockTransferForm.value.total_amount_of_freight_load_cross),
			truc_no: this.addStockTransferForm.value.truck_number.toUpperCase(),
			invoice_num: "",
			invoice_date: null,
			bill_copy: "",
			eway_bill_copy: "",
			billing_remark: " ",
			billing_done_by: null,
			billing_done_on: null,
			email_flag: 0,
			billing_flag: 1,
			billing_rate: Number(this.addStockTransferForm.value.billing_rate),
			eway_bill_flag: this.addStockTransferForm.value.eway_bill_flag ? 1 : 0,
			import_local_flag: Number(this.addStockTransferForm.value.import_local_flag),
			dispatch_from: this.addStockTransferForm.value.dispatch_from,
			bill_from: this.addStockTransferForm.value.bill_from,
			ship_to: this.addStockTransferForm.value.ship_to,
			bill_to: this.addStockTransferForm.value.bill_to,
			company_id: this.addStockTransferForm.value.company_id,
		};


		this.save(FormData);
	}

	//?Save Stock Transfer Entry in Database
	save(formData) {
		this.crudServices
			.addData<any>(StockTransfer.add, formData)
			.subscribe(async (response) => {
				if (response.code == "100") {
					this.sendNotification({
						grade_name: this.selectedGrade.grade_name,
						from_godown: this.selectedFromGodown.godown_name,
						to_godown: this.selectedToGodown.godown_name,
						quantity: formData.quantity,
						date: formData.outward_date,
						truck_number: formData.truc_no
					})
					let html = "";
					this.toasterService.pop(
						response.message,
						response.message,
						response.data
					);
					if (this.emailFooterTemplete && this.emailBodyTemplete) {
						html = `${html} <table id="table"><tr>
            <td>From Godown</td>
            <td>To Godown</td>
            <td>Transporter</td>
            <td>Grade</td>
            <td>Quantity</td>
            <td>Outward Date</td>
            <td>Truck nUmber</td> </tr>`;

						html = `${html}<tr><td>${this.selectedFromGodown.godown_name}</td><td>${this.selectedToGodown.godown_name}</td>
            <td>${this.selectedTransporter.sub_org_name}</td>
            <td>${this.selectedGrade.grade_name}</td>
            <td>${formData.quantity}</td>
            <td>${formData.outward_date}</td>
            <td>${formData.truc_no}</td> </tr>`
						html = `${html} </table>`;

						let html2 = '';
						const re2 = "{TABLE}";
						let template_html = this.emailBodyTemplete;

						html2 = template_html.replace(re2, html);
						html2 = html2 + this.emailFooterTemplete;
						let emailBody = {
							from: this.selectedFromGodown.godown_email,
							to: this.selectedToGodown.godown_email,
							subject: this.emailSubject,
							html: html2,
						};

						await this.onSendEmail(emailBody)
					}


					this.onBack();
				}
			});

	}


	async onSendEmail(emailBody) {

		let body = {
			mail_object: emailBody

		};
		await this.crudServices
			.postRequest<any>(StockTransfer.sendEmail, body)
			.subscribe((response) => {
				this.toasterService.pop(
					response.message,
					response.message,
					response.data
				);
			});
	}


	onReset() {
		this.submitted = false;
		this.addStockTransferForm.reset();
	}


	generateEmailTemplete() {
		this.emailSubject = '';
		this.emailFooterTemplete = '';
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Stock Godown Mail' }).subscribe(body_temp => {
			if (body_temp.length > 0) {
				this.emailBodyTemplete = body_temp[0].custom_html;
				this.emailSubject = body_temp[0].subject;
				this.emailFrom = body_temp[0].from_name;
			}
		})
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(footer_temp => {
			if (footer_temp.code == 100) {
				this.emailFooterTemplete = footer_temp[0].custom_html;
			}
		})
	}
	onBack() {
		this.router.navigate(["sales/stock-transfer"]);
	}




	//Freightrate calculation on enter
	onFreightrateChange(Freightrate) {
		let totalFreightAmount =
			(Number(this.addStockTransferForm.controls.quantity.value.toString().replace(/,/g, '')) / 1000 * Number(Freightrate));
		this.addStockTransferForm.patchValue({
			total_freight_amount: Math.round(totalFreightAmount),
			total_amount_of_freight_load_cross:
				Math.round(totalFreightAmount +
					Number(this.addStockTransferForm.controls.total_load_cross_amount.value)),
		});
	}

	//?ON ENTER LOADING QUANTITY
	onLoadingQtyChange(LoadingQty) {


		let loadingValue = ((LoadingQty / 1000) * Number(this.addStockTransferForm.controls.loading_charges.value));
		let cossingvalue = ((Number(this.addStockTransferForm.controls.crossing_qty.value) / 1000) * Number(this.addStockTransferForm.controls.crossing_charges.value));
		;
		let total = loadingValue + cossingvalue;
		this.addStockTransferForm.patchValue({
			total_load_cross_amount: total,
			total_amount_of_freight_load_cross:
				total + Number(this.addStockTransferForm.controls.total_freight_amount.value),
		});
	}


	//?On Crossing ENTER CROSSING QUANTITY
	onCrossQtyChange(crossingQty) {
		let cossingvalue = ((crossingQty / 1000) * this.addStockTransferForm.controls.crossing_charges.value);
		let loadingValue =
			((this.addStockTransferForm.controls.loading_qty.value / 1000) * this.addStockTransferForm.controls.loading_charges.value);
		let total = loadingValue + cossingvalue;
		this.addStockTransferForm.patchValue({
			total_load_cross_amount: total,
			total_amount_of_freight_load_cross:
				total + this.addStockTransferForm.controls.total_freight_amount.value,
		});
	}

	onSelectLoading(event) {
		//!when we select Loading Then we take Default quantity and loading charges we
		// !have and also desable/radonly condition true , also we set 0 value to crossing
		/**
		 * ?id=1 is loading Option
		 * ?id=2crossing
		 * ?id=3 loading + crossing
		 *
		 */
		if (event.id == "1") {

			this.addStockTransferForm.patchValue({
				loading_qty: Number(this.addStockTransferForm.controls.quantity.value.toString().replace(/,/g, '')),
				loading_charges: Number(this.loadingCharges),
				crossing_qty: 0,
				crossing_charges: 0,
				total_load_cross_amount: (Number(this.addStockTransferForm.controls.quantity.value.toString().replace(/,/g, '')) / 1000) * Number(this.loadingCharges),
				total_amount_of_freight_load_cross: (((Number(this.addStockTransferForm.controls.quantity.value.toString().replace(/,/g, '')) / 1000) * Number(this.loadingCharges)) + Number(this.addStockTransferForm.controls.total_freight_amount.value)),
			});
		} else if (event.id == "2") {
			this.addStockTransferForm.patchValue({
				loading_qty: 0,
				loading_charges: 0,
				crossing_qty: Number(this.addStockTransferForm.controls.quantity.value.toString().replace(/,/g, '')),
				crossing_charges: Number(this.crossingCharges),
				total_load_cross_amount:
					((Number(this.addStockTransferForm.controls.quantity.value.toString().replace(/,/g, '')) / 1000) * Number(this.crossingCharges)),
				total_amount_of_freight_load_cross:
					((Number(this.addStockTransferForm.controls.quantity.value.toString().replace(/,/g, '')) / 1000) * Number(this.crossingCharges)) + Number(this.addStockTransferForm.controls.total_freight_amount.value),
			});
		} else if (event.id == "3") {
			this.addStockTransferForm.patchValue({
				loading_qty: null,
				loading_charges: Number(this.loadingCharges),
				crossing_qty: null,
				crossing_charges: Number(this.crossingCharges),
				total_load_cross_amount: 0,
			});
		} else {
			alert("Select Valid Load Or cross");
		}
	}



	//? NOTIFICATION LOGIC START FROM HERE ONLY


	getNotifications() {
		this.crudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: 'NEW_STOCK_TRANSFER_ADDED' }).subscribe((notification: any) => {
			if (notification.code == '100' && notification.data.length > 0) {
				this.notification_details = notification.data[0];
				this.crudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
					if (notificationUser.code == '100' && notificationUser.data.length > 0) {
						notificationUser['data'].forEach((element) => {
							if (element.fcm_web_token) {
								this.notification_tokens.push(element.fcm_web_token);
								this.notification_id_users.push(element.id);
							}
						});
					}
				});
			} else {
				this.notification_details = undefined;
			}
		})
	}

	saveNotifications(notification_body) {
		this.notification_users = [];
		for (const element of this.notification_id_users) {
			this.notification_users.push({
				notification_id: this.notification_details.id,
				reciever_user_id: element,
				department_id: 1,
				heading: notification_body.title,
				message_body: notification_body.body,
				url: notification_body.click_action,
				record_id: 1,
				table_name: 'stock_transfer',
			})
		}

		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	}

	sendNotification(deal_details) {
		if (this.notification_details != undefined && this.notification_details != null) {
			let body = {
				notification: {
					"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  ${this.notification_details ? this.notification_details.title : ''}`,
					"body": `stock starnsfer deal ${deal_details.grade_name} 0f  ${deal_details.quantity} MT from ${deal_details.from_godown}  to  ${deal_details.to_godown}  on ${deal_details.date}`,
					"click_action": "#"
				},
				registration_ids: this.notification_tokens
			};

			this.messagingService.sendNotification(body).then((response) => {
				if (response) {
					this.saveNotifications(body['notification'])
				}
				this.messagingService.receiveMessage();
				this.message = this.messagingService.currentMessage;
			})
		}

	}
}
