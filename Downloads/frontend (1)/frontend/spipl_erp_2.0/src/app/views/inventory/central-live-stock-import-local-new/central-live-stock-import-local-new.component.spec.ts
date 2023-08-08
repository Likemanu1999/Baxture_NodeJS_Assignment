import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralLiveStockImportLocalNewComponent } from './central-live-stock-import-local-new.component';

describe('CentralLiveStockImportLocalNewComponent', () => {
  let component: CentralLiveStockImportLocalNewComponent;
  let fixture: ComponentFixture<CentralLiveStockImportLocalNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentralLiveStockImportLocalNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralLiveStockImportLocalNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
