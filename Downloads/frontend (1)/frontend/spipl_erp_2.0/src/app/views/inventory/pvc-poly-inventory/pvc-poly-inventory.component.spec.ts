import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PvcPolyInventoryComponent } from './pvc-poly-inventory.component';

describe('PvcPolyInventoryComponent', () => {
  let component: PvcPolyInventoryComponent;
  let fixture: ComponentFixture<PvcPolyInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PvcPolyInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PvcPolyInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
