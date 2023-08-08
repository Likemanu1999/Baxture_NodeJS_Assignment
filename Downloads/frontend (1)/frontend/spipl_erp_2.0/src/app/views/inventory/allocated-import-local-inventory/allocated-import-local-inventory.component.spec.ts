import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocatedImportLocalInventoryComponent } from './allocated-import-local-inventory.component';

describe('AllocatedImportLocalInventoryComponent', () => {
  let component: AllocatedImportLocalInventoryComponent;
  let fixture: ComponentFixture<AllocatedImportLocalInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllocatedImportLocalInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllocatedImportLocalInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
