import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufactureSupplyDestinationComponent } from './manufacture-supply-destination.component';

describe('ManufactureSupplyDestinationComponent', () => {
  let component: ManufactureSupplyDestinationComponent;
  let fixture: ComponentFixture<ManufactureSupplyDestinationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManufactureSupplyDestinationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManufactureSupplyDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
