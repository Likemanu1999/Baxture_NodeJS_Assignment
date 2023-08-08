import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappTemplateTypeMasterComponent } from './whatsapp-template-type-master.component';

describe('WhatsappTemplateTypeMasterComponent', () => {
  let component: WhatsappTemplateTypeMasterComponent;
  let fixture: ComponentFixture<WhatsappTemplateTypeMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhatsappTemplateTypeMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatsappTemplateTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
