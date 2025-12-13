import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHistoricalMessagesComponent } from './view-historical-messages.component';

describe('ViewHistoricalMessagesComponent', () => {
  let component: ViewHistoricalMessagesComponent;
  let fixture: ComponentFixture<ViewHistoricalMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewHistoricalMessagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewHistoricalMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
