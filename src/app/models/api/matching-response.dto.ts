/**
 * @fileoverview
 * DTO for matching response from the backend.
 * Represents the matched pairs and step-by-step snapshot data for visualization.
 */

export interface SnapshotBreakdown {
  interest: number;
  happy: number;
  age: number;
}

export interface BaseSnapshot {
  type: "base";
  step: number;
  rowIds: string[]; // IDs of men corresponding to rows
  colIds: string[]; // IDs of women corresponding to columns
  matrix: number[][];
}

export interface UpdateSnapshot {
  type: "update";
  step: number;
  row: number; // row index in matrix
  col: number; // column index in matrix
  value: number; // final score for this cell
  breakdown?: SnapshotBreakdown; // optional per-cell contributions
}

export type Snapshot = BaseSnapshot | UpdateSnapshot;

export interface MatchedPair {
  man: string;   // user ID of man
  woman: string; // user ID of woman
}

export interface MatchingResponseDto {
  message: string;
  matchedPairs: MatchedPair[];
  snapshots: Snapshot[];
}
