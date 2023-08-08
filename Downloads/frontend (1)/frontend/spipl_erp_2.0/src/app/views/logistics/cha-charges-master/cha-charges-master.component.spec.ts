import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChaChargesMasterComponent } from './cha-charges-master.component';

describe('ChaChargesMasterComponent', () => {
  let component: ChaChargesMasterComponent;
  let fixture: ComponentFixture<ChaChargesMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChaChargesMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChaChargesMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
