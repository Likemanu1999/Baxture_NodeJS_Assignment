import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFinanceComponent } from './add-finance.component';

describe('AddFinanceComponent', () => {
  let component: AddFinanceComponent;
  let fixture: ComponentFixture<AddFinanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFinanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
