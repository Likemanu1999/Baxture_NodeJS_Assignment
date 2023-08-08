import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankStatusComponent } from './bank-status.component';

describe('BankStatusComponent', () => {
  let component: BankStatusComponent;
  let fixture: ComponentFixture<BankStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
