import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Snapshot, BaseSnapshot, UpdateSnapshot } from '../../../models/api/matching-response.dto';
import { User } from '../../../models/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matching-visualization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matching-visualization.component.html',
  styleUrls: ['./matching-visualization.component.scss']
})
export class MatchingVisualizationComponent implements OnInit, OnDestroy {

  @Input() snapshots: Snapshot[] = [];
  @Input() men: User[] = [];
  @Input() women: User[] = [];

  baseSnapshot!: BaseSnapshot;
  updates: UpdateSnapshot[] = [];
  currentMatrix: number[][] = [];
  currentStep = 0;

  hoveredBreakdown: any = null;
  hoveredMan?: User;
  hoveredWoman?: User;

  private intervalId: any = null;
  snapshotsPerSecond = 8;

  /**
   * Initialize component.
   * Sets up base snapshot and updates, resets current matrix.
   */
  ngOnInit(): void {
    this.baseSnapshot = this.snapshots.find(s => s.type === 'base') as BaseSnapshot;
    this.updates = this.snapshots.filter(s => s.type === 'update') as UpdateSnapshot[];

    if (this.baseSnapshot) {
      this.reset();
    }
  }

  /**
   * Cleanup component before destroy.
   * Clears any running playback interval.
   */
  ngOnDestroy(): void {
    this.pause();
  }

  /**
   * Apply the next update step to the matrix.
   * Updates `currentMatrix` and increments `currentStep`.
   */
  nextStep(): void {
    if (this.currentStep >= this.updates.length) return;

    const update = this.updates[this.currentStep];
    this.currentMatrix[update.row][update.col] = update.value;
    this.currentStep++;
  }

  /**
   * Reset the visualization to the base snapshot.
   * Clears all update steps.
   */
  reset(): void {
    if (this.baseSnapshot) {
      this.currentMatrix = JSON.parse(JSON.stringify(this.baseSnapshot.matrix));
      this.currentStep = 0;
    }
  }

  /**
   * Handle changes to snapshots per second input.
   * Clamps value between 1 and 60.
   *
   * @param value - The new snapshots per second value from input
   */
  onSnapshotsPerSecondChange(value: number) {
    this.snapshotsPerSecond = Math.max(1, Math.min(60, value));
  }

  /**
   * Start automatic playback of snapshots.
   * Plays updates at the interval determined by `snapshotsPerSecond`.
   */
  play(): void {
    this.pause(); // clear any previous interval

    const intervalMs = 1000 / this.snapshotsPerSecond;

    this.intervalId = setInterval(() => {
      if (this.currentStep >= this.updates.length) {
        this.pause();
        return;
      }
      this.nextStep();
    }, intervalMs);
  }

  /**
   * Pause automatic playback.
   * Clears any existing interval.
   */
  pause(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Show tooltip for a given cell.
   *
   * @param row - Row index in the matrix (corresponds to a man)
   * @param col - Column index in the matrix (corresponds to a woman)
   */
  showTooltip(row: number, col: number): void {
    const update = this.updates.find(u => u.row === row && u.col === col);
    if (!update) {
      this.hoveredBreakdown = null;
      return;
    }
    this.hoveredBreakdown = update.breakdown;

    const manId = this.baseSnapshot.rowIds[row];
    const womanId = this.baseSnapshot.colIds[col];

    this.hoveredMan = this.men.find(m => m._id === manId);
    this.hoveredWoman = this.women.find(w => w._id === womanId);
  }

  /**
   * Clear the tooltip details.
   */
  clearTooltip(): void {
    this.hoveredBreakdown = null;
  }

  /**
   * Compute background color for a cell based on score.
   *
   * @param score - The score value from the matrix
   * @returns A CSS color string (rgb). Black for forbidden pairs (<= -1000).
   */
  getHeatColor(score: number): string {
    if (score <= -1000) return '#000000';

    if (this.currentStep === 0) {
      const normalized = Math.max(0, Math.min(1, score));
      const r = Math.round(174 * (1 - normalized) + 75 * normalized);
      const g = Math.round(239 * (1 - normalized) + 0 * normalized);
      const b = Math.round(255 * (1 - normalized) + 130 * normalized);
      return `rgb(${r},${g},${b})`;
    } else {
      const matrix = this.currentMatrix;
      const values = matrix.flat().filter(v => v > -1000);

      // Dynamic minimum based on current data
      const min = values.length > 0 ? Math.min(...values) : 0;

      // Dynamic maximum capped at 1.4
      const observedMax = values.length > 0 ? Math.max(...values) : 1;
      const max = Math.min(observedMax, 1.4);

      // Handle range to avoid division by zero
      const range = (max - min) === 0 ? 1 : (max - min);

      // Clamp the score within the calculated range (min to max)
      const t = Math.max(0, Math.min(1, (score - min) / range));

      const r = Math.round(174 * (1 - t) + 75 * t);
      const g = Math.round(239 * (1 - t) + 0 * t);
      const b = Math.round(255 * (1 - t) + 130 * t);

      return `rgb(${r},${g},${b})`;
    }
  }
}
