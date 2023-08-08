import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustSuspenseAmountComponent } from './adjust-suspense-amount.component';

describe('AdjustSuspenseAmountComponent', () => {
  let component: AdjustSuspenseAmountComponent;
  let fixture: ComponentFixture<AdjustSuspenseAmountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdjustSuspenseAmountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustSuspenseAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
