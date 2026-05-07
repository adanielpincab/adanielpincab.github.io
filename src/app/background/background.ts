import { Component, ViewChild, ElementRef } from '@angular/core';
import * as PIXI from 'pixi.js';
import { AsciiFilter, ConvolutionFilter, CRTFilter } from 'pixi-filters';

const CELL_SIZE = 50;
const LERP_SPEED = 0.005;
const SIM_INTERVAL_MS = 1000;
const INITIAL_STEPS = 10;

class Cell {
  public value: number;
  public target: number;

  constructor(public x: number, public y: number, alive: boolean) {
    this.x = x;
    this.y = y;
    this.value = alive ? 1 : 0;
    this.target = this.value;
  }

  get alive(): boolean {
    return this.target >= 0.5;
  }

  computeNextState(worldCells: Cell[][]): boolean {
    let aliveNeighbors = 0;
    const dirs = [
      [-1, -1], [0, -1], [1, -1],
      [-1,  0],          [1,  0],
      [-1,  1], [0,  1], [1,  1]
    ];
    for (const [dx, dy] of dirs) {
      const nx = this.x + dx;
      const ny = this.y + dy;
      if (
        nx >= 0 && nx < worldCells.length &&
        ny >= 0 && ny < worldCells[0].length &&
        worldCells[nx][ny].alive
      ) {
        aliveNeighbors++;
      }
    }
    if (this.alive) {
      return aliveNeighbors >= 2 && aliveNeighbors <= 3;
    } else {
      return aliveNeighbors === 3;
    }
  }

  /** Interpolate current value toward target */
  lerp() {
    this.value += (this.target - this.value) * LERP_SPEED;
  }

  draw(graphics: PIXI.Graphics, cellSize: number) {
    if (this.value > 0.01) {
      const alpha = this.value;
      graphics.beginFill(0xffffff, alpha);
      graphics.drawRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
      graphics.endFill();
    }
  }
}

class World {
  private cells: Cell[][];

  constructor(private width: number, private height: number, private cellSize: number) {
    this.cells = [];
    for (let x = 0; x < width; x++) {
      const column: Cell[] = [];
      for (let y = 0; y < height; y++) {
        column.push(new Cell(x, y, Math.random() < 0.5));
      }
      this.cells.push(column);
    }
    this.warmup(INITIAL_STEPS);
  }

  /** Fast-forward N generations so the board starts with formed groups */
  private warmup(steps: number) {
    for (let i = 0; i < steps; i++) {
      this.stepImmediate();
    }
    // Sync visual value to the settled state (no lerp needed)
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.cells[x][y].value = this.cells[x][y].target;
      }
    }
  }

  /** Instant step: applies next state directly (no lerp targets) */
  private stepImmediate() {
    const targets: boolean[][] = [];
    for (let x = 0; x < this.width; x++) {
      targets[x] = [];
      for (let y = 0; y < this.height; y++) {
        targets[x][y] = this.cells[x][y].computeNextState(this.cells);
      }
    }
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const alive = targets[x][y] ? 1 : 0;
        this.cells[x][y].target = alive;
        this.cells[x][y].value = alive;
      }
    }
  }

  /** Run one Game-of-Life generation: compute targets only */
  step() {
    const targets: boolean[][] = [];
    for (let x = 0; x < this.width; x++) {
      targets[x] = [];
      for (let y = 0; y < this.height; y++) {
        targets[x][y] = this.cells[x][y].computeNextState(this.cells);
      }
    }
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.cells[x][y].target = targets[x][y] ? 1 : 0;
      }
    }
  }

  /** Interpolate all cells toward their targets (called every frame) */
  lerp() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.cells[x][y].lerp();
      }
    }
  }

  draw(graphics: PIXI.Graphics) {
    this.cells.forEach(column => {
      column.forEach(cell => {
        cell.draw(graphics, this.cellSize);
      });
    });
  }

  setCellAlive(x: number, y: number) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.cells[x][y].target = 1;
    }
  }
}

@Component({
  selector: 'app-background',
  imports: [],
  templateUrl: './background.html',
  styleUrl: './background.css',
})
export class Background {
  @ViewChild('pixiContainer', { static: true }) pixiContainer!: ElementRef;
  app!: PIXI.Application;
  world!: World;
  private lastSimTime = 0;
  private filteredContainer!: PIXI.Container;
  private targetOpacity = 1;
  private currentOpacity = 1;

  async ngOnInit() {
    this.app = new PIXI.Application();

    await this.app.init({
      resizeTo: window,
      backgroundAlpha: 0,
    });
    this.app.ticker.maxFPS = 60;
    this.pixiContainer.nativeElement.appendChild(this.app.canvas);

    // Contenedor para el Game of Life
    this.filteredContainer = new PIXI.Container();
    this.app.stage.addChild(this.filteredContainer);

    // Listener de scroll para atenuar opacidad
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      // Cuando el scroll supera el hero (primera página), atenuar
      if (scrollY > viewportHeight * 0.5) {
        this.targetOpacity = 0.15;
      } else {
        this.targetOpacity = 1;
      }
    });

    let graphics = new PIXI.Graphics();
    this.filteredContainer.addChild(graphics);

    // Filtros para el fondo (Game of Life)
    let blurfilter = new PIXI.BlurFilter(5);
    let asciiFilter = new AsciiFilter(4);
    let convolutionFilter = new ConvolutionFilter([
      0, 1, 0,
      1, 0, 1,
      0, 1, 0
    ], 250);
    let crtFilter = new CRTFilter({
      curvature: 0,
      lineWidth: 4,
      lineContrast: 0.5,
      verticalLine: false,
      noise: 0
    });
    this.filteredContainer.filters = [blurfilter, convolutionFilter, asciiFilter, crtFilter];

    const screen_cell_ratio = CELL_SIZE;
    const gridWidth = Math.ceil(window.screen.width / screen_cell_ratio);
    const gridHeight = Math.ceil(window.screen.height / screen_cell_ratio);

    this.world = new World(gridWidth, gridHeight, screen_cell_ratio);

    this.world.step();
    this.lastSimTime = performance.now();

    this.app.ticker.add(() => {
      // Advance the automaton at a fixed interval
      const now = performance.now();
      if (now - this.lastSimTime >= SIM_INTERVAL_MS) {
        this.world.step();
        this.lastSimTime = now;
      }

      // Interpolar opacidad suavemente
      this.currentOpacity += (this.targetOpacity - this.currentOpacity) * 0.05;
      this.filteredContainer.alpha = this.currentOpacity;

      // Interpolate & draw every frame for smooth transitions
      graphics.clear();
      this.app.renderer.clear();
      this.world.lerp();
      this.world.draw(graphics);
    });

    document.addEventListener('mousemove', (event: MouseEvent) => {
      let cellX = Math.floor(event.clientX / CELL_SIZE);
      let cellY = Math.floor(event.clientY / CELL_SIZE);

      this.world.setCellAlive(cellX, cellY);
    });
  }
}
