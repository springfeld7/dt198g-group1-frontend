import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchingVisualizationComponent } from './matching-visualization.component';

describe('MatchingVisualizationComponent', () => {
  let component: MatchingVisualizationComponent;
  let fixture: ComponentFixture<MatchingVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchingVisualizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchingVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
