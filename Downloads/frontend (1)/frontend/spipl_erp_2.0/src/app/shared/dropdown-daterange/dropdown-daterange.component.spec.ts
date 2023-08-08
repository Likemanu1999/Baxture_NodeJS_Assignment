import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownDaterangeComponent } from './dropdown-daterange.component';

describe('DropdownDaterangeComponent', () => {
  let component: DropdownDaterangeComponent;
  let fixture: ComponentFixture<DropdownDaterangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownDaterangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownDaterangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
