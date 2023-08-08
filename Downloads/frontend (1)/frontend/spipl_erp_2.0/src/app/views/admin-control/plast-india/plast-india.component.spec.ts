import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlastIndiaComponent } from './plast-india.component';

describe('PlastIndiaComponent', () => {
  let component: PlastIndiaComponent;
  let fixture: ComponentFixture<PlastIndiaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlastIndiaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlastIndiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
