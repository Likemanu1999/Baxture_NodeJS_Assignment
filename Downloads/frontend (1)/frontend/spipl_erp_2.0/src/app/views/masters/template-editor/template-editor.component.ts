import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { EmailTemplateMaster } from '../../../shared/apis-path/apis-path';


@Component({
  selector: 'app-template-editor',
  templateUrl: './template-editor.component.html',
  styleUrls: ['./template-editor.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ToasterService, PermissionService, CrudServices],
})
export class TemplateEditorComponent implements OnInit {
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000
    });

  ckeConfig: any;
  mycontent: string;
  template_id: any;



  @ViewChild('myEditor', { static: false }) myEditor: any;
  templates: any;
  selection: boolean;
  name: string;
  template_name: any;
  subject: any;
  from: any;
  keys: any;
  mode = 'Add New';

  constructor(
    private toasterService: ToasterService,
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
    private crudServices: CrudServices
  ) {
    this.ckeConfig = {
      height: 400,
      language: 'en',
      allowedContent: true,
    };
  }

  ngOnInit() {
    this.get_list_template();
  }

  get_list_template() {
    this.crudServices.getAll<any>(EmailTemplateMaster.getAll).subscribe(response => {
      this.templates = response;
    });

  }

  get_template(event) {
    if (event) {
      this.mycontent = event['custom_html'];
      this.template_name = event['template_name'];
      this.subject = event['subject'];
      this.from = event['from_name'];
      this.keys = event['key_name'];
    } else {
      this.name = '';
      this.template_name = '';
      this.template_id = null;
      this.subject = '';
      this.from = '';
      this.keys = '';
      this.mycontent = '';
    }

  }

  update(id, html, template_name, name, subject, from, keys) {
    if (id && (name === '' || name === undefined)) {
      this.crudServices.updateData<any>(EmailTemplateMaster.update, {
        id: id,
        html: html,
        template_name: template_name,
        subject: subject,
        from: from,
        keys: keys
      }).subscribe(response => {
        this.mycontent = '';
        this.name = '';
        this.template_id = null;
        this.template_name = '';
        this.subject = '';
        this.from = '';
        this.keys = '';
        this.toasterService.pop(response.message, response.message, response.data);
        this.get_list_template();
      });
    }
    if (name !== '' && name !== undefined) {
      this.crudServices.addData<any>(EmailTemplateMaster.add, {
        template_name: name,
        html: html,
        subject: subject,
        from: from,
        keys: keys
      }).subscribe(response => {
        this.mycontent = '';
        this.name = '';
        this.template_name = '';
        this.template_id = null;
        this.subject = '';
        this.from = '';
        this.keys = '';
        this.toasterService.pop(response.message, response.message, response.data);
        this.get_list_template();
      });
    }
  }

  inputField() {
    this.mycontent = '';
    this.name = '';
    this.template_name = '';
    this.template_id = null;
    this.subject = '';
    this.from = '';
    this.keys = '';
    if (this.selection === true) {
      this.selection = false;
      this.mode = 'Add New';
    } else {
      this.selection = true;
      this.mode = 'Edit';
    }
  }

}
