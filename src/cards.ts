import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

enum Direction {
  None = 0,
  Left = 1,
  Right = 2,
}

@customElement('touch-swipe-cards')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TouchSwipeCards extends LitElement {
  @property({ type: Function })
  dropLeft: (card: String) => void;

  @property({ type: Function })
  dropRight: (card: String) => void;

  @property({ type: Array })
  _cards: Array<string> = [];

  set cards(value) {
    this._cards = value;
    this.activeCard = this._cards[0];
  }

  get cards() {
    return this._cards;
  }

  @property({ type: String })
  activeCard: string;

  @property()
  dragActive = false;

  @property()
  activeCardLeftTheStage = false;

  @property()
  leftDropActive = false;

  @property()
  rightDropActive = false;

  @property()
  activeCardPosition = { x: 0, y: 0, direction: Direction.None };

  @property({ type: Number })
  pageWidth = Math.max(
    document.documentElement.scrollWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth,
  );

  constructor() {
    super();
  }

  static styles = css`
    ol {
      padding: 0;
      margin: auto;
      -webkit-user-select: none;
      position: relative;
      width: 300px;
      height: 300px;
    }
    ol li {
      list-style: none;
      background-color: white;
      padding: 0;
      margin: 0;
      border: solid 1px #dedede;
      position: absolute;
      width: 100%;
      height: 100%;
      font-size: 100px;
      color: white;
      text-align: center;
    }
    ol li h1 {
      color: black;
      font-size: 1em;
    }

    ol li.active {
      z-index: 100;
      padding: 0;
      margin: 0;
      border-color: #999;
      position: absolute;
      box-shadow: 2px 4px 5px 0px rgba(0, 0, 0, 0.23);
    }

    .animate-drop {
      left: 0px;
      top: 0px;
      transform: rotate(0deg);
      transition: 0.1s ease-in-out;
      border: solid 1px #dedede;
    }

    .zone-active {
      opacity: 0.5 !important;
    }
    #drop-zones li {
      height: 100%;
      display: block;
      width: 50px;
      position: absolute;
      top: 0;
      z-index: -1;
      opacity: 0;
    }

    .left-drop-zone {
      background-color: red;
      left: 0;
    }
    .right-drop-zone {
      background-color: green;
      position: absolute;
      right: 0px;
    }
    .no-cards-left {
      border: 0px;
      background-color: rgba(0, 0, 0, 0);
    }
    .no-cards-left h1 {
      color: #666;
      font-size: 0.5em;
    }
  `;

  render() {
    return html`
      <ul id="drop-zones">
        <li
          class=${this.leftDropActive
            ? 'left-drop-zone zone-active'
            : 'left-drop-zone'}
        ></li>
        <li
          class=${this.rightDropActive
            ? 'right-drop-zone zone-active'
            : 'right-drop-zone'}
        ></li>
      </ul>

      <ol id="cards">
        ${this.cards.map(
          (item, index) =>
            html`
              <li
                id="card-${index}"
                class="${this.activeCard === item && this.dragActive
                  ? 'active'
                  : 'animate-drop'}"
                @mousedown="${this._handleTouchStart}"
                @mouseup="${this._handleMouseDrop}"
                @mousemove="${this._handleMouseMove}"
                @touchmove="${this._handleTouchMove}"
                @touchstart="${this._handleTouchStart}"
                @touchend="${this._handleTouchEnd}"
                style="${this._getCardPositionStyle(item, index)}"
              >
                <h1>${item}</h1>
              </li>
            `,
        )}
        <li class="no-cards-left"><h1>No cards left</h1></li>
      </ol>
    `;
  }

  private _getCardPositionStyle(item: string, index: number) {
    if (this.activeCard === item) {
      if (this.activeCardLeftTheStage) {
        return `display:none;`;
      }
      let rotation = 0;
      const rotationAmount = 2;
      if (this.activeCardPosition.direction === Direction.Left)
        rotation = -rotationAmount;

      if (this.activeCardPosition.direction === Direction.Right)
        rotation = rotationAmount;

      return `
        left:${this.activeCardPosition.x}px;
        top:${this.activeCardPosition.y}px;
        transform:rotate(${rotation}deg);
        z-index: ${99 - index}
      `;
    }
    return 'z-index:' + (99 - index);
  }

  private _handleTouchStart(e: Event) {
    e.preventDefault();
    this.dragActive = true;
  }

  private _moveCard(x: number, y: number) {
    if (x < 80) {
      this.leftDropActive = true;
    } else {
      this.leftDropActive = false;
    }
    if (x > this.pageWidth - 80) {
      this.rightDropActive = true;
    } else {
      this.rightDropActive = false;
    }
    const cardsList = <HTMLLIElement>this.shadowRoot.getElementById('cards');
    const activeCard = <HTMLLIElement>this.shadowRoot.querySelector('.active');
    const elementWidth = activeCard.offsetWidth;
    const elementHeight = activeCard.offsetHeight;
    const xPosition = x - elementWidth / 2 - cardsList.offsetLeft;
    const yPosition = y - elementHeight / 2 - cardsList.offsetTop;

    let direction = Direction.None;
    if (xPosition > this.activeCardPosition.x) {
      direction = Direction.Right;
    } else {
      direction = Direction.Left;
    }
    this.activeCardPosition = {
      x: xPosition,
      y: yPosition,
      direction: direction,
    };
  }

  private _handleMouseMove(e: MouseEvent) {
    e.preventDefault();
    if (this.dragActive) {
      this._moveCard(e.clientX, e.clientY);
    }
  }

  private _handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    const touch = e.targetTouches[0];
    this._moveCard(touch.clientX, touch.clientY);
  }

  private _handleMouseDrop(e: MouseEvent) {
    e.preventDefault();
    const dropPosition = e.clientX;
    this._dropCard(dropPosition);
  }

  private _handleTouchEnd(e: TouchEvent) {
    e.preventDefault();
    const dropPosition = e.changedTouches[0].clientX;
    this._dropCard(dropPosition);
  }

  private async _dropCard(xPosition: number) {
    let throwAway = false;
    if (xPosition < 80) {
      this.dropLeft(this.activeCard);
      this.activeCardPosition = {
        x: -(this.pageWidth / 2) - 100,
        y: 0,
        direction: Direction.None,
      };
      throwAway = true;
    }

    if (xPosition > this.pageWidth - 80) {
      this.dropRight(this.activeCard);
      this.activeCardPosition = {
        x: this.pageWidth / 2 + 100,
        y: 0,
        direction: Direction.None,
      };
      throwAway = true;
    }

    this.dragActive = false;

    if (throwAway) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.activeCardLeftTheStage = true;
      this.activeCardPosition = { x: 0, y: 0, direction: Direction.None };
      await new Promise((resolve) => setTimeout(resolve, 50));
      this.activeCardLeftTheStage = false;
      this.cards = this.cards.filter((card) => card !== this.activeCard);
    }

    this.activeCardPosition = { x: 0, y: 0, direction: Direction.None };
    this.rightDropActive = false;
    this.leftDropActive = false;
  }
}
