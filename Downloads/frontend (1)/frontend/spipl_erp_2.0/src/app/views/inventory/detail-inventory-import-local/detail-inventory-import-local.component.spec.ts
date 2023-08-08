import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailInventoryImportLocalComponent } from './detail-inventory-import-local.component';

describe('DetailInventoryImportLocalComponent', () => {
  let component: DetailInventoryImportLocalComponent;
  let fixture: ComponentFixture<DetailInventoryImportLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailInventoryImportLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailInventoryImportLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
