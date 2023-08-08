
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { MainSubOrgService, SubOrgList } from '../../masters/sub-org-master/main-sub-org-service';
import { SupplierDealService, SupplierSalesDealList } from '../foreign-supplier-deal/supplier-deal-service';
import { SelectService } from '../../../shared/dropdown-services/select-services';
import { Currency } from '../../../shared/dropdown-services/currency';
import { Unit } from '../../../shared/dropdown-services/unit';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { foreignSupplier, foreignSuppilerDeals, CommonApis } from "../../../shared/apis-path/apis-path";
import { FileUpload, Notifications, NotificationsUserRel, UsersNotification } from '../../../shared/apis-path/apis-path';
import { MessagingService } from '../../../service/messaging.service';


@Component({

    selector: 'app-add-fs-deal',
    templateUrl: './add-fs-deal.component.html',
    styleUrls: ['./add-fs-deal.component.css'],
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
export class AddFsDealComponent implements OnInit {

    public filterQuery = '';
    filterArray = ['sub_org_name', 'deal_dt', 'deal_rate', 'deal_quantity', 'shipment_month', 'added_date'];
    isLoading = false;
    fromdate: string;
    todate: string;
    public filter = [];
    value = 'deal_dt';
    bsRangeValue: any = [];
    uploadArray: any = [];

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
    month = new Array();
    serverUrl: string;
    mode = 'Add';
    box_title = 'Foreign Supplier Deal';
    supplierDealForm: FormGroup;
    unit_list: Unit;
    sub_org = [];
    date = new Date();
    dealDocsUpload: Array<File> = [];
    currency: Currency;
    docs: string;
    curr_year: Number;
    public today = new Date();


    public toasterconfig: ToasterConfig =
        new ToasterConfig({
            tapToDismiss: true,
            timeout: 5000
        });
    org_address: any;
    sub_org_id: any;

    notification_details: any;
    notification_tokens = [];
    notification_id_users = []
    notification_users = [];
    message: any;

    public yearMask = [/\d/, /\d/, /\d/, /\d/];

    constructor(
        private router: Router,
        private toasterService: ToasterService,
        private permissionService: PermissionService,
        private loginService: LoginService,
        public datepipe: DatePipe,
        private CrudServices: CrudServices,
        private MessagingService: MessagingService,

    ) {

        this.serverUrl = environment.serverUrl;
        const perms = this.permissionService.getPermission();
        this.add_opt = perms[0];
        this.view_opt = perms[1];
        this.edit_opt = perms[2];
        this.del_opt = perms[3];
        this.user = this.loginService.getUserDetails();
        this.links = this.user.links;


        this.CrudServices.getAll<any>(foreignSupplier.getAll).subscribe((response) => {

            if (response.code === "101") {
                this.toasterService.pop(response.message, response.message, response.data);
            } else {
                this.sub_org = response.map((i) => { i.sub_org_name = i.sub_org_name + ' (' + i.org_address + ' )'; return i; });
            }
        });

        this.CrudServices.getAll<any>(CommonApis.getAllCurrency).subscribe((response) => {
            if (response.code === "101") {
                this.toasterService.pop(response.message, response.message, response.data);
            } else {
                this.currency = response;
            }

        });

        this.CrudServices.getAll<any>(CommonApis.getAllUnitDrumMt).subscribe((response) => {
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
            'currency_id': new FormControl(null, Validators.required),
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
        this.getNotifications('FOREIGN_SALE_DEAL_ADD');

        this.curr_year = Number(this.datepipe.transform(this.date, 'yyyy'));

    }

    getNotifications(name) {
        this.notification_tokens = [];
        this.notification_id_users = []
        this.notification_users = [];

        this.CrudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
            if (notification.code == '100' && notification.data.length > 0) {
                this.notification_details = notification.data[0];
                console.log(this.notification_details, "received details")
                this.CrudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
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
        this.CrudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
        }, (error) => console.error(error));
    }


    public getDate(regDate: string) {
        const date = new Date(regDate);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    }

    async onSubmit() {



        if (!this.supplierDealForm.invalid) {
            this.sub_org_id = '';
            this.sub_org_id = this.supplierDealForm.value.sub_org_id;

            let formData = {
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
                remark: this.supplierDealForm.value.remark,
                deal_docs: ""
            };

            const fileData = new FormData();
            const deal_doc: Array<File> = this.dealDocsUpload;
            if (deal_doc.length > 0) {
                for (let i = 0; i < deal_doc.length; i++) {
                    fileData.append('deal_docs', deal_doc[i], deal_doc[i]["name"]);
                }
                this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
                    let files = [];
                    let filesList = res.uploads.deal_docs;
                    if (filesList.length > 0) {
                        for (let i = 0; i < filesList.length; i++) {
                            files.push(filesList[i].location);
                        }
                        formData['deal_docs'] = JSON.stringify(files);
                        this.saveData(formData);
                    }
                });


            } else {
                this.CrudServices.addData<any>(foreignSuppilerDeals.add, formData).subscribe(response => {
                    if (response.code == '100') {


                        let subOrgDetailsNew: any = [];
                        subOrgDetailsNew = this.sub_org.find(item => item.sub_org_id === this.sub_org_id);
                        let data = {
                            "title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
                            "body": `Foreign Sales Deal: Added Sales Deal Against ${subOrgDetailsNew.sub_org_name} of Quantity : ${formData.deal_quantity}, Rate: ${formData.deal_rate}  `,
                            "click_action": "#"
                        }
                        this.generateNotification(data, 1);
                        this.onReset();
                        this.toasterService.pop(response.message, response.message, response.data);
                        this.router.navigate(['forex/grade-assortment/' + this.sub_org_id]);
                    } else {
                        this.toasterService.pop(response.message, response.message, response.data);
                    }

                });

            }


        }
    }

    saveData(form) {
        this.CrudServices.addData<any>(foreignSuppilerDeals.add, form).subscribe(response => {
            if (response.code == '100') {
                console.log('I IM HERE ')

                let subOrgDetailsNew: any = [];
                subOrgDetailsNew = this.sub_org.find(item => item.sub_org_id === this.sub_org_id);
                let data = {
                    "title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
                    "body": `Foreign Sales Deal: Added Sales Deal Against ${subOrgDetailsNew.sub_org_name} of Quantity : ${form.deal_quantity}, Rate: ${form.deal_rate}  `,
                    "click_action": "#"
                }
                

                this.generateNotification(data, 1);
                this.onReset();
                this.toasterService.pop(response.message, response.message, response.data);
                this.router.navigate(['forex/grade-assortment/' + this.sub_org_id]);

                // setTimeout(() => {
                // 	this.router.navigate(['forex/grade-assortment/' + this.sub_org_id]);
                // }, 2000);


            } else {
                this.toasterService.pop(response.message, response.message, response.data);
            }
        });
    }

    dealDocs(event: any) {
        this.dealDocsUpload = <Array<File>>event.target.files;
    }

    onBack() {
        this.router.navigate(['forex/sales-contract']);
    }

    onReset() {
        this.supplierDealForm.reset();
        this.docs = '';
        this.supplierDealForm.controls['shipment_year'].setValue(this.datepipe.transform(this.date, 'yyyy'));

    }



    convert(date) {
        if (date != null) {
            return this.datepipe.transform(date, 'yyyy-MM-dd');
        } else {
            return null;
        }
    }


    getDocsArray(docs: string) {
        return JSON.parse(docs);
    }

    get_org_address($e) {
        console.log($e);

        if ($e) {
            this.org_address = $e['org_address'] + ',' + $e['location_vilage'];
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

