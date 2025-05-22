import Grid from './grid';
import Tile, { Position } from './tile';
import DOMUpdater from './dom-updater';
import GestureManager, { IndexedList } from './gesture-manager';

export interface Directions {
  x: number[];
  y: number[];
}
//test

export interface LastPosition {
  last: Position;
  next: Position;
}

export default class Game {
  private size: number;
  private score: number = 0;
  private startTiles: number;
  private isWin: boolean = false;
  private isOver: boolean = false;
  private grid: Grid | null = null;
  private domUpdater: DOMUpdater;
  private gestureManager: GestureManager;

  constructor(size: number, startTiles: number = 2) {
    this.size = size;
    this.startTiles = startTiles;

    this.gestureManager = new GestureManager({
      gameContainer: document.querySelector('.game') as HTMLDivElement,
      retryButton: document.querySelector('.retry') as HTMLButtonElement
    });

    this.domUpdater = new DOMUpdater();

    // @ts-ignore
    this.gestureManager.on('move', this.move);
    this.gestureManager.on('restart', this.restart.bind(this));

    this.init();
  }

  private init = (): void => {
    this.grid = new Grid(this.size);
    this.score = 0;
    this.isOver = false;
    this.isWin = false;
    this.renderStartTiles();
    this.update();
  };

  private restart = (): void => {
    this.domUpdater.restart();
    this.init();
  };

  private renderStartTiles = (): void => {
    for (let i = 0; i < this.startTiles; i++) {
      this.renderTile();
    }
  };

  private renderTile = (): void => {
    if (!this.grid || !this.grid.hasCellsAvailable()) return;

    const value: number = Math.random() < 0.9 ? 2 : 4;
    const tile: Tile = new Tile(this.grid.getAvailableCell()!, value);

    this.grid.insertTile(tile);
  };

  private update = (): void => {
    if (!this.grid) return;

    this.domUpdater.update(this.grid, {
      score: this.score,
      isOver: this.isOver,
      isWin: this.isWin
    });
  };

  private updateTiles = (): void => {
    if (!this.grid) return;

    this.grid.eachCell((x: number, y: number, tile: Tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.save();
      }
    });
  };

  private moveTile = (tile: Tile, cell: Position): void => {
    if (!this.grid) return;

    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;

    tile.update(cell);
  };

  private move = (direction: number): void => {
    if (this.isOver || this.isWin || !this.grid) return;

    let isMoved: boolean = false;

    const coordinates: Position = this.getCoordinates(direction);
    const cellsInDirection: Directions = this.getCellsInDirection(coordinates);

    this.updateTiles();

    cellsInDirection.x.forEach((x: number) => {
      cellsInDirection.y.forEach((y: number) => {
        const cell = { x, y };
        const tile: Tile | null = this.grid!.getCellContent(cell);

        if (tile) {
          const positions: LastPosition = this.getLastPosition(cell, coordinates);
          const next: Tile | null = this.grid!.getCellContent(positions.next);

          if (next && next.value === tile.value && !next.mergedFrom) {
            const mergedTile: Tile = new Tile(positions.next, tile.value * 2);
            mergedTile.mergedFrom = [tile, next];

            this.grid!.insertTile(mergedTile);
            this.grid!.removeTile(tile);
            tile.update(positions.next);

            this.score += mergedTile.value;

            if (mergedTile.value === 2048) this.isWin = true;
          } else {
            this.moveTile(tile, positions.last);
          }

          if (!this.arePositionsEqual(cell, { x: tile.x, y: tile.y })) {
            isMoved = true;
          }
        }
      });
    });

    if (isMoved) {
      this.renderTile();
      if (!this.hasMovesLeft()) this.isOver = true;
      this.update();
    }
  };

  private getCoordinates = (direction: number): Position => {
    const map: IndexedList<Position> = {
      0: { x: 0, y: -1 },
      1: { x: 1, y: 0 },
      2: { x: 0, y: 1 },
      3: { x: -1, y: 0 }
    };

    return map[direction];
  };

  private getCellsInDirection = (coordinates: Position): Directions => {
    const cellsInDirection: Directions = {
      x: [...Array(this.size).keys()],
      y: [...Array(this.size).keys()]
    };

    if (coordinates.x === 1) cellsInDirection.x.reverse();
    if (coordinates.y === 1) cellsInDirection.y.reverse();

    return cellsInDirection;
  };

  private getLastPosition = (cell: Position, coordinates: Position): LastPosition => {
    if (!this.grid) throw new Error("Grid not initialized");

    let previous: Position;

    do {
      previous = cell;
      cell = { x: previous.x + coordinates.x, y: previous.y + coordinates.y };
    } while (this.grid!.isInBounds(cell) && this.grid!.isCellAvailable(cell));

    return {
      last: previous,
      next: cell
    };
  };

  private hasMovesLeft = (): boolean => {
    return !!this.grid && (this.grid.hasCellsAvailable() || this.tileMatchesAvailable());
  };

  private tileMatchesAvailable = (): boolean => {
    if (!this.grid) return false;

    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile: Tile | null = this.grid.getCellContent({ x, y });

        if (!tile) continue;

        for (let direction = 0; direction < 4; direction++) {
          const coordinates: Position = this.getCoordinates(direction);
          const cell: Position = { x: x + coordinates.x, y: y + coordinates.y };
          const other: Tile | null = this.grid.getCellContent(cell);

          if (other && other.value === tile.value) {
            return true;
          }
        }
      }
    }

    return false;
  };

  private arePositionsEqual = (first: Position, second: Position): boolean =>
    first.x === second.x && first.y === second.y;
}