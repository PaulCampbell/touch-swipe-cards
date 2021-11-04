import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

enum Direction {
  None = 0,
  Left = 1,
  Right = 2,
}

@customElement('touch-drag-cards')
class TouchDragCards extends LitElement {
  @property({ type: Function })
  dropLeft: Function;

  @property({ type: Function })
  dropRight: Function;

  @property({ type: Array })
  _cards: Array<string> = [];

  set cards(value) {
    const oldValue = this._cards;
    this._cards = value;
    this.activeCard = this._cards[0];
    this.requestUpdate('cards', oldValue);
  } 

  get cards() { return this._cards; }

  @property({ type: String })
  activeCard: string;

  @property()
  dragActive = false;

  @property()
  activeCardPosition = { x: 0, y: 0, direction: Direction.None };

  constructor() {
    super();
  }

  static styles = css`
    ol {
      padding: 0;
      margin: 0;
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

    #drop-zones li {
      height: 100%;
      display: block;
      width: 50px;
      position: absolute;
      top: 0;
      z-index: -1;
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
      border:0px;
      background-color: rgba(0,0,0,0);
    }
    .no-cards-left h1 {
      color: #666;
      font-size: 0.5em;
    }
  `;

  render() {
    return html`
      <p>Draggable Cards</p>
      <ul id="drop-zones">
        <li class="left-drop-zone">left</li>
        <li class="right-drop-zone">right</li>
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
                style="${this.activeCard === item && this.dragActive
                  ? this._getCardPositionStyle()
                  : 'z-index:' + (99 - index)}"
              >
                <h1>${item}</h1>
              </li>
            `,
        )}
        <li class="no-cards-left"><h1>No cards left</h1></li>
      </ol>
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

  private _handleTouchStart(e: Event) {
    this.dragActive = true;
  }

  private _moveCard(x: number, y: number) {
    const cardsList = <HTMLLIElement>this.shadowRoot.getElementById('cards');
    const activeCard = <HTMLLIElement>this.shadowRoot.querySelector('.active');
    const elementWidth = activeCard.offsetWidth;
    const elementHeight = activeCard.offsetHeight;
    const xPosition = x-  (elementWidth / 2) - cardsList.offsetLeft;
    const yPosition =  y- (elementHeight /2)  - cardsList.offsetTop;

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
    if(this.dragActive) {
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
    const dropPosition = e.clientX
    this._dropCard(dropPosition);
  }

  private _handleTouchEnd(e: TouchEvent) {
    e.preventDefault();
    const dropPosition = e.changedTouches[0].clientX;
    this._dropCard(dropPosition);
  }

  private _dropCard(xPosition: number) {
    if(xPosition < 80) {
      dropLeft(this.activeCard);
      this.cards = this.cards.filter(card => card !== this.activeCard);
      this.activeCard = this.cards[0];
    }
    if(xPosition > (window.innerWidth - 80)) {
      dropRight(this.activeCard);
      this.cards = this.cards.filter(card => card !== this.activeCard);
      this.activeCard = this.cards[0];
    }
    
    this.dragActive = false;
    this.activeCardPosition = { x: 0, y: 0, direction: Direction.None };
  }
}
