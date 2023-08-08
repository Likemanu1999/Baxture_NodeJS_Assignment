import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankChargesListComponent } from './bank-charges-list.component';

describe('BankChargesListComponent', () => {
  let component: BankChargesListComponent;
  let fixture: ComponentFixture<BankChargesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankChargesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankChargesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
