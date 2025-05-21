/**
 * @jest-environment jsdom
 */
import Game from '../src/scripts/game';

describe('Game Constructor', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="game"></div>
      <button class="retry"></button>
      <div class="best-score"></div>        <!-- hinzufügen -->
      <div class="score"></div>             <!-- optional -->
      <div class="end" style="display: none;"></div> <!-- optional -->
    `;
    localStorage.setItem('best-score', '0'); // falls abgefragt
  });

  it('should initialize Game with default startTiles', () => {
    const game = new Game(4);

    expect(game).toBeInstanceOf(Game);
    expect((game as any).size).toBe(4);
    expect((game as any).startTiles).toBe(2);
  });

  it('should initialize Game with custom startTiles', () => {
    const game = new Game(5, 8);

    expect((game as any).size).toBe(5);
    expect((game as any).startTiles).toBe(8);
  });

  
  it('should call init() and initialize internal state', () => {
    const game = new Game(4);

    expect((game as any).grid).toBeDefined();
    expect((game as any).score).toBe(0);
    expect((game as any).isOver).toBe(false);
    expect((game as any).isWin).toBe(false);
  });
});