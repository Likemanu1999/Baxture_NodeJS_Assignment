import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralLiveStockImportLocalComponent } from './central-live-stock-import-local.component';

describe('CentralLiveStockImportLocalComponent', () => {
  let component: CentralLiveStockImportLocalComponent;
  let fixture: ComponentFixture<CentralLiveStockImportLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentralLiveStockImportLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralLiveStockImportLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
