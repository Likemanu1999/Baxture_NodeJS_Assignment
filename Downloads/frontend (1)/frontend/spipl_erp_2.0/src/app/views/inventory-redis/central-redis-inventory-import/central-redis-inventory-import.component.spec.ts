import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentralRedisInventoryImportComponent } from './central-redis-inventory-import.component';

describe('CentralRedisInventoryImportComponent', () => {
  let component: CentralRedisInventoryImportComponent;
  let fixture: ComponentFixture<CentralRedisInventoryImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentralRedisInventoryImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentralRedisInventoryImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
