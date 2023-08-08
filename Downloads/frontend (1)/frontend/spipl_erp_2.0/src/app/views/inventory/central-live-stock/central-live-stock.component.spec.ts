import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralLiveStockComponent } from './central-live-stock.component';

describe('CentralLiveStockComponent', () => {
  let component: CentralLiveStockComponent;
  let fixture: ComponentFixture<CentralLiveStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentralLiveStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralLiveStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
