import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortDamageListComponent } from './short-damage-list.component';

describe('ShortDamageListComponent', () => {
  let component: ShortDamageListComponent;
  let fixture: ComponentFixture<ShortDamageListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortDamageListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortDamageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
