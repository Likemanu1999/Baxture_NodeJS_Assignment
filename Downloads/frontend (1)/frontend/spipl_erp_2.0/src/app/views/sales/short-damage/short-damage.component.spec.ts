import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortDamageComponent } from './short-damage.component';

describe('ShortDamageComponent', () => {
  let component: ShortDamageComponent;
  let fixture: ComponentFixture<ShortDamageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortDamageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortDamageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
