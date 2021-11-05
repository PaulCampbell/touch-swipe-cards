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

  @property({ type: Element })
  card: Element;

  @property({ type: Array })
  optionValues: Array<String>;

  connectedCallback() {
    super.connectedCallback();
    const items = [...this.children].filter(
      (el) => el.getAttribute('slot') === 'item',
    );
    if (items.length != 1) {
      throw new Error(
        `touch-swipe-card Must have one "item" slot. Found ${items.length}`,
      );
    }
    this.card = [...this.children].find(
      (el) => el.getAttribute('slot') === 'item',
    );
    const options = [...this.children].filter(
      (el) => el.getAttribute('slot') === 'options',
    );
    if (options.length != 1) {
      throw new Error(
        `touch-swipe-card Must have 1 "options" slot. Found ${items.length}`,
      );
    }
    const optionValues = [...options[0].children]
      .filter((el) => el.type === 'radio')
      .map((r) => r.value);
    if (optionValues.length != 2) {
      throw new Error(
        `touch-swipe-card "options" slot must have 2 radio buttons with "value" atrtibutes. Found ${optionValues.length}`,
      );
    }
    this.optionValues = optionValues;
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
        ${this.optionValues
          ? html`<li
                class=${this.leftDropActive
                  ? 'left-drop-zone zone-active'
                  : 'left-drop-zone'}
              >
                ${this.optionValues[0]}
              </li>
              <li
                class=${this.rightDropActive
                  ? 'right-drop-zone zone-active'
                  : 'right-drop-zone'}
              >
                ${this.optionValues[1]}
              </li>`
          : ''}
      </ul>
      <div id="card-container">
        ${this.card
          ? html`<div
              id="card"
              class="${this.dragActive ? 'item active' : 'item'}"
              @mousedown="${this._handleMouseStart}"
              @mouseup="${this._handleMouseDrop}"
              @mousemove="${this._handleMouseMove}"
              @touchmove="${this._handleTouchMove}"
              @touchstart="${this._handleTouchStart}"
              @touchend="${this._handleTouchEnd}"
              style="${this._getCardPositionStyle()}"
            >
              <slot name="item"></slot>
            </div>`
          : null}
      </div>
    `;
  }

  private _getCardPositionStyle() {
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

  private async _handleMouseStart(e: MouseEvent) {
    e.preventDefault();
    this.dragActive = true;
    await new Promise((resolve) => setTimeout(resolve, 1));
    this._moveCard(e.clientX, e.clientY);
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
      this.dropLeft(this.card.getAttribute('id'));
      this.activeCardPosition = {
        x: -(this.pageWidth / 2) - 100,
        y: 0,
        direction: Direction.None,
      };
      throwAway = true;
    }

    if (xPosition > this.pageWidth - 80) {
      this.dropRight(this.card.getAttribute('id'));
      this.activeCardPosition = {
        x: this.pageWidth / 2 + 100,
        y: 0,
        direction: Direction.None,
      };
      throwAway = true;
    }

    if (throwAway) {
      this.card = null;
    }

    this.dragActive = false;

    this.activeCardPosition = { x: 0, y: 0, direction: Direction.None };
    this.rightDropActive = false;
    this.leftDropActive = false;
  }
}
