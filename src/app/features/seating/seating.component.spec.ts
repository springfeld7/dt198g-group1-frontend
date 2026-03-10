import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatingComponent } from './seating.component';

describe('SeatingComponentComponent', () => {
  let component: SeatingComponent;
  let fixture: ComponentFixture<SeatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
