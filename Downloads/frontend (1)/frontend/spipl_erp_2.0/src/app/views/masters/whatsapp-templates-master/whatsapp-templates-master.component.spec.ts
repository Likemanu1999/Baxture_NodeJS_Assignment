import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappTemplatesMasterComponent } from './whatsapp-templates-master.component';

describe('WhatsappTemplatesMasterComponent', () => {
  let component: WhatsappTemplatesMasterComponent;
  let fixture: ComponentFixture<WhatsappTemplatesMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhatsappTemplatesMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatsappTemplatesMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
