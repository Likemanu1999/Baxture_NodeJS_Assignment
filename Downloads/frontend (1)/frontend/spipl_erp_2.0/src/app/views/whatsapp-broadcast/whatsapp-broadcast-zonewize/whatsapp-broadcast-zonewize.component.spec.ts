import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappBroadcastZonewizeComponent } from './whatsapp-broadcast-zonewize.component';

describe('WhatsappBroadcastZonewizeComponent', () => {
  let component: WhatsappBroadcastZonewizeComponent;
  let fixture: ComponentFixture<WhatsappBroadcastZonewizeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhatsappBroadcastZonewizeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatsappBroadcastZonewizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
