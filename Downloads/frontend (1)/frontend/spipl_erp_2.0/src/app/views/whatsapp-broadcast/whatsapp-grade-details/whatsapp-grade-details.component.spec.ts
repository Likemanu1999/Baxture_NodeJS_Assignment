import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappGradeDetailsComponent } from './whatsapp-grade-details.component';

describe('WhatsappGradeDetailsComponent', () => {
  let component: WhatsappGradeDetailsComponent;
  let fixture: ComponentFixture<WhatsappGradeDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhatsappGradeDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatsappGradeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
