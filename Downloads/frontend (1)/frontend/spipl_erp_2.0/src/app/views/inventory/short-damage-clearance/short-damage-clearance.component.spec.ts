import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortDamageClearanceComponent } from './short-damage-clearance.component';

describe('ShortDamageClearanceComponent', () => {
  let component: ShortDamageClearanceComponent;
  let fixture: ComponentFixture<ShortDamageClearanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortDamageClearanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortDamageClearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
