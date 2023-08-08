import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadcastEmailComponent } from './broadcast-email.component';

describe('BroadcastEmailComponent', () => {
  let component: BroadcastEmailComponent;
  let fixture: ComponentFixture<BroadcastEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BroadcastEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadcastEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
