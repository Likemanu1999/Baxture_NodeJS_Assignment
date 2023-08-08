import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryMovementNewComponent } from './inventory-movement-new.component';

describe('InventoryMovementNewComponent', () => {
  let component: InventoryMovementNewComponent;
  let fixture: ComponentFixture<InventoryMovementNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InventoryMovementNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryMovementNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
