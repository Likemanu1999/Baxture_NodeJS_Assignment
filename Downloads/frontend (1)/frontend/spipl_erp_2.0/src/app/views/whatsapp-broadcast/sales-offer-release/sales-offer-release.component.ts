import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { LoginService } from '../../login/login.service';
import { CountryStateCityMaster, FileUpload, Marketing, StaffMemberMaster, SubOrg, SurishaBroadcast, foreignSupplier, salesTemplate } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import { InrCurrencyPipe } from '../../../shared/currency/currency.pipe';
import { UserDetails } from '../../login/UserDetails.model';
import { MessageService } from 'primeng/api';
import { ModalDirective } from 'ngx-bootstrap';
import { staticValues } from '../../../shared/common-service/common-service';
@Component({
  selector: 'app-sales-offer-release',
  templateUrl: './sales-offer-release.component.html',
  styleUrls: ['./sales-offer-release.component.scss'],
  providers: [CrudServices, ToasterService, DatePipe, InrCurrencyPipe, LoginService, MessageService],
  encapsulation: ViewEncapsulation.None
})
export class SalesOfferReleaseComponent implements OnInit {
  @ViewChild('myModal', { static: false }) public myModal: ModalDirective;
  public popoverTitle: string = "Warning";
  public popoverMessage: string = "Are you sure, you want to Send?";
  public confirmClicked: boolean = false;
  public cancelClicked: boolean = false;
  public confirmText: string = "Yes";
  public cancelText: string = "No";
  public placement: string = "left";
  public closeOnOutsideClick: boolean = true;
  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });
  isLoading: boolean;

  addForm: FormGroup;
  user: UserDetails;
  company_id: any;
  page_title = 'Sales Offer Release'
  supplier: any = [];
  preview_data: string;
  division: any = staticValues.company_list;
  states: any = [];
  marketingList: any = [];

  state: any[];
  marketing: any
  contact_no_list: any = [];
  show_mail_list: boolean;
  image: string;
  loadingImage: boolean;
  imageUrl: any;
  imported: boolean;
  products: any = [];
  selectedProduct: any = [];
  template: any[]
  selectedTemplate: boolean = false;
  showoffer: boolean;
  templateSubType: any = [];
  fields: any;
  whataspp_template_name: any;
  template_type: any;
  accept: string;
  template_name: any;
  templateType: any = null;
  templateContent: any = null;
  user_company_id: any;


  constructor(private crudServices: CrudServices,
    toasterService: ToasterService,
    private datePipe: DatePipe,
    private loginService: LoginService,
    private messageService: MessageService) {
      this.toasterService = toasterService;
      this.user = this.loginService.getUserDetails();
      this.company_id = this.user.userDet[0].company_id;
      this.user_company_id =  this.user.userDet[0].company_id;
     }

  ngOnInit() {
    this.getSupplier()
    this.getStates();
    this.getMarketingPerson();
    this.getProducts();
    this.getTemplateType();
  }

  getSupplier() {
    this.crudServices.getAll<any>(foreignSupplier.getAll).subscribe(response => {
      this.supplier = response
    })
  }

  getStates() {
    this.crudServices.postRequest<any>(CountryStateCityMaster.getStates, { country_id: 101 }).subscribe(response => {
      console.log(response);
      if (response.data) {
        this.states = response.data
      }

    })
  }

  getMarketingPerson() {
  

    this.crudServices.postRequest<any>(StaffMemberMaster.getMarketingPersonsNew, { company_id: this.company_id }).subscribe(response => {
      console.log(response);
      if (response.data) {
        response.data.map(item => item.first_name = item.first_name + ' ' + item.last_name)
        this.marketingList = response.data
      }

    })
  }

  getProducts() {
    this.crudServices.getAll<any>(Marketing.getProducts).subscribe(res => {
      this.products = res.data
    });
  }

  getTemplateType() {
    
    this.crudServices.getAll<any>(salesTemplate.getTemplate).subscribe(res => {
      this.template = res.data
    });
  }

  getSubTemplate(val) {
    this.templateSubType = []
    this.fields = []
    this.addForm = new FormGroup({})
    this.templateContent = null;

    this.selectedTemplate = false
    if(val.id) {
      this.crudServices.postRequest<any>(salesTemplate.getTemplateContent , {type_id : val.id }).subscribe(res => {
        this.templateSubType = res.data
      });
    } else {
      this.templateSubType = [null]
      this.fields = []
      this.addForm = new FormGroup({})
      this.selectedTemplate = false;
      this.templateContent = null;

    }
    
  }

  getFormFeilds(val) {
    if(val.id) {
      console.log(val);
      
      this.selectedTemplate = false
      this.whataspp_template_name =  val.template_whastapp_name
      this.template_type = val.template_type;
      this.template_name = val.template_name;
      if(val.template_type == 1){
        this.accept = 'image/png, image/jpeg'
      }
      this.crudServices.postRequest<any>(salesTemplate.getTemplateForm , {temp_id : val.id }).subscribe(res => {
        this.selectedTemplate = true
        if(res.data) {
          this.fields = res.data
          let form ={}
          for(let i =0 ; i< res.data.length ; i++) {
            form[res.data[i].field_name]=  new FormControl(null, Validators.required)
          }
          form['imported_data']=new FormControl(null)
          this.addForm = new FormGroup(form)
          }
         
       
         
        
        
       
      });
    } else {
      this.selectedTemplate = false
    }
   
  }

  getItems(val) {
    return this[val]
  }

  preview() {
    this.preview_data  = ''
    if(this.fields.length) {
      for(let val of this.fields) {
      
        this.preview_data  += `
        <b>${val.label} </b> : ${this.addForm.value[val.field_name]} <br>
      `
     
      }
      
    }


    console.log(this.addForm.value.imported_data);

    if (this.company_id != null && !this.addForm.value.imported_data) {
      this.getContactNo()
    } else if (this.addForm.value.imported_data) {
      this.imported = true
    }

    this.myModal.show()
  }

  getContactNo() {
    this.crudServices.postRequest<any>(SubOrg.getOrgContactsList, { category_id: 11, company_id: this.company_id, contact_type: 2, zone_id: this.marketing, state_id: this.state ? this.state.toString() : null }).subscribe(response => {
      if (response.data) {
        let contact_no = response.data.map(item => item.contact_no.trim())
        console.log(contact_no);
        this.contact_no_list = contact_no
      }
    })
  }

  getImportedContacts() {
    if (this.company_id) {
      
        
      this.crudServices.postRequest<any>(Marketing.getData, { company_id: this.company_id }).subscribe(res => {
        if (res.data) {
          let contactArr = []
          for (let val of res.data) {
            let contacts = val.contacts.split(',');
            if (contacts.length) {
              for (let cont of contacts) {
                let mobile = cont.trim();
                if (/^\d{10}$/.test(mobile)) {
                  const found = contactArr.some(el => el === mobile)
                  if (!found) {
                    contactArr.push(mobile)
                  }

                }
              }
            }

          }
          this.contact_no_list = contactArr


        }

      });
    } else {
      this.contact_no_list = []
    }

    console.log(this.selectedProduct);

  }

  clearAll() {
    this.contact_no_list = []
  }

  addDocs(event: any) {
    this.loadingImage = true
    let attachmentDoc = <Array<File>>event.target.files;
    let fileToUpload = attachmentDoc[0]
    let fileData: FormData = new FormData();

    if (attachmentDoc.length > 0) {
      for (let i = 0; i < attachmentDoc.length; i++) {
        fileData.append('raw_org_data', attachmentDoc[i], attachmentDoc[i]['name']);
      }
    }


    this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
      this.loadingImage = false



      let filesList1 = [];


      if (res.uploads.raw_org_data) {

        filesList1 = res.uploads.raw_org_data;
        this.image = filesList1[0].location;



      }
      if(this.template_type ==1) {
        let reader = new FileReader();
        reader.onload = (event: any) => {
          this.imageUrl = event.target.result;
        }
        reader.readAsDataURL(fileToUpload);
  
  
      }
     


    })


  }

  sendWhatsapp() {

    if (this.contact_no_list && this.image) {
      console.log(this.contact_no_list);

      this.isLoading = true
      let data = []
      let params=[]
      if(this.whataspp_template_name) {
        
        for(let param of this.fields) {
          params.push(this.addForm.value[param.field_name])
        }

        console.log(params);
        let url = null
        if(this.template_type == 1) {
           url = SurishaBroadcast.surishaSaleOfferWhastappImg
          data = [
            {
              "template_name": this.whataspp_template_name,
              "locale": "en",
              "numbers": this.contact_no_list,
              "params": params,
              "image_url": this.image,
               "company_id" : this.company_id
            }
          ]
        } 

        if(this.template_type == 2) {
          url = SurishaBroadcast.surishaSaleOfferWhastappAttachment
          data = [
            {
              "template_name": this.whataspp_template_name,
              "locale": "en",
              "numbers": this.contact_no_list,
              "params": params,
              'attachment': [
                {
                  "caption": this.template_name,
                  "filename": this.template_name,
                  "url": this.image
                }
              ],
              "company_id" : this.company_id
              
            }
          ]
        }

        if(url != null) {
          this.crudServices.postRequest<any>(url,data).subscribe(res => {
            this.isLoading = false
            this.onClose();
            this.toasterService.pop('success', 'WhatsApp  Notification !', 'WhatsApp Notification !')
          })
        }
     
    }
       
      } else {
        this.toasterService.pop('Warning', 'Warning !', 'Please Add Contact No And Attachment')
      }

    




  }

  onChangeToggle(event) {

    if (event.checked == true) {
      this.show_mail_list = true
    } else if (event.checked == false) {
      this.show_mail_list = false
    }

  }

  onClose() {
    this.show_mail_list = false;
    this.myModal.hide();
    this.contact_no_list = [];
    this.state = null;
    this.marketing = null;
    this.image = null;
    this.imageUrl = null;
    this.imported = false;
    this.products = [];
    this.fields = []
    this.addForm = new FormGroup({})
    this.templateSubType = []
    this.selectedTemplate = false;
    this.templateContent = null;
    this.templateType = null;
    this.company_id = this.user_company_id
  }

}
