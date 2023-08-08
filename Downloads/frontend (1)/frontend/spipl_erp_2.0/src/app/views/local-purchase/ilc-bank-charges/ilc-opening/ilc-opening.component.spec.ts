import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IlcOpeningComponent } from './ilc-opening.component';

describe('IlcOpeningComponent', () => {
  let component: IlcOpeningComponent;
  let fixture: ComponentFixture<IlcOpeningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IlcOpeningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IlcOpeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
