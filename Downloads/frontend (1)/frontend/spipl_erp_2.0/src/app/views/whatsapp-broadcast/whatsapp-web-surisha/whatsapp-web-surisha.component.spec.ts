import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappWebSurishaComponent } from './whatsapp-web-surisha.component';

describe('WhatsappWebSurishaComponent', () => {
  let component: WhatsappWebSurishaComponent;
  let fixture: ComponentFixture<WhatsappWebSurishaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhatsappWebSurishaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatsappWebSurishaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
