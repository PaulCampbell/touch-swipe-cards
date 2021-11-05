import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

enum Direction {
  None = 0,
  Left = 1,
  Right = 2,
}

@customElement('touch-swipe-card')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TouchSwipeCard extends LitElement {
  @property({ type: Function })
  dropLeft: (card: String) => void;

  @property({ type: Function })
  dropRight: (card: String) => void;

  @property({ type: String })
  _card: string;

  set card(value) {
    this._card = value;
  }

  get card() {
    return this._card;
  }

  @property()
  dragActive = false;

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

  static styles = css`
    #card-container {
      text-align: center;
    }
    .item {
      display: inline-block;
      margin: auto;
      background-color: white;
      padding: 0;
      border: solid 1px #dedede;
      min-width: 50px;
      min-height: 50px;
      font-size: 100px;
      color: white;
    }
    .item h1 {
      color: black;
      font-size: 0.7em;
    }

    .active {
      position: absolute;
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
      <div id="card-container">
        ${this.card
          ? html`<div
              id="card"
              class="${this.dragActive ? 'item active' : 'item animate-drop'}"
              @mousedown="${this._handleTouchStart}"
              @mouseup="${this._handleMouseDrop}"
              @mousemove="${this._handleMouseMove}"
              @touchmove="${this._handleTouchMove}"
              @touchstart="${this._handleTouchStart}"
              @touchend="${this._handleTouchEnd}"
              style="${this._getCardPositionStyle(this.card)}"
            >
              <slot name="item"></slot>
            </div>`
          : null}
      </div>
    `;
  }

  private _getCardPositionStyle(item: string) {
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
      `;
  }

  private async _handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    this.dragActive = true;
    const touch = e.targetTouches[0];
    await new Promise((resolve) => setTimeout(resolve, 1));
    this._moveCard(touch.clientX, touch.clientY);
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
    const cardContainer = <HTMLDivElement>(
      this.shadowRoot.getElementById('card-container')
    );
    const activeCard = <HTMLDivElement>this.shadowRoot.querySelector('.active');
    const elementWidth = activeCard.offsetWidth;
    const elementHeight = activeCard.offsetHeight;
    const xPosition = x - elementWidth / 2 - cardContainer.offsetLeft;
    const yPosition = y - elementHeight / 2 - cardContainer.offsetTop;

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
      this.dropLeft(this.card);
      this.activeCardPosition = {
        x: -(this.pageWidth / 2) - 100,
        y: 0,
        direction: Direction.None,
      };
      throwAway = true;
    }

    if (xPosition > this.pageWidth - 80) {
      this.dropRight(this.card);
      this.activeCardPosition = {
        x: this.pageWidth / 2 + 100,
        y: 0,
        direction: Direction.None,
      };
      throwAway = true;
    }

    if (throwAway) {
      this._card = null;
    }

    this.dragActive = false;

    this.activeCardPosition = { x: 0, y: 0, direction: Direction.None };
    this.rightDropActive = false;
    this.leftDropActive = false;
  }
}
