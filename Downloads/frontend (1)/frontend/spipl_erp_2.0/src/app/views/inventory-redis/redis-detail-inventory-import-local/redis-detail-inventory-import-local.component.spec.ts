import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedisDetailInventoryImportLocalComponent } from './redis-detail-inventory-import-local.component';

describe('RedisDetailInventoryImportLocalComponent', () => {
  let component: RedisDetailInventoryImportLocalComponent;
  let fixture: ComponentFixture<RedisDetailInventoryImportLocalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedisDetailInventoryImportLocalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedisDetailInventoryImportLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
