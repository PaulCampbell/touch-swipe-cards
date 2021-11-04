import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

enum Direction {
  None= 0,
  Left = 1,
  Right = 2,
}

@customElement('touch-drag-cards')
class TouchDragCards extends LitElement {

  @property()
  cards = ['card 1', 'card 2', 'card 3'];

  @property()
  activeCard = this.cards[0];

  @property()
  dragActive = false;

  @property()
  activeCardPosition = { x: 0, y: 0, direction: Direction.None }

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
  ol li.active {
    z-index: 1;
    padding: 0;
    margin: 0;
    border-color: red;
    position: absolute;
    box-shadow: 2px 4px 5px 0px rgba(0, 0, 0, 0.23);
  }
  
  ol li.drag {
    
  }
  
  ol li h2 {
    font-size: 15px;
  }
  `;
 
  constructor() {
    super();
  }

  render() {
    return html`
    <p>Draggable Cards</p>
    <ol>
        ${this.cards.map(
          (item, index) =>
            html`
              <li 
                id="card-${index}"
                class="${this.activeCard === item && this.dragActive ? 'active' : ''}"
                @touchmove="${this._handleTouchMove}" 
                @touchstart="${this._handleTouchStart}"
                @touchend="${this._handleTouchEnd}"
                style="${this.activeCard === item && this.dragActive ? this._getCardPositionStyle() : ''}">
                  ${item}
                </li>
            `
        )}
      </ol>
    `;
  }

  private _getCardPositionStyle() {
    let rotation = 0;
    const rotationAmount = 4
    if(this.activeCardPosition.direction === Direction.Left)
     rotation = -rotationAmount

    if(this.activeCardPosition.direction === Direction.Right)
     rotation = rotationAmount
    
     return 'left:' + this.activeCardPosition.x + 'px; top: ' + this.activeCardPosition.y + 'px;  transform:rotate('+ rotation + 'deg);'
  }

  private _handleTouchStart(e: Event) { 
    this.dragActive = true;
  }

  private _handleTouchMove(e: TouchEvent) {
    e.preventDefault()
    const touch = e.targetTouches[0]
    const target = <HTMLLIElement>touch.target
    const elementWidth = target.offsetWidth
    const elementHeight = target.offsetHeight
    const xposition = touch.screenX - (elementWidth / 2) - 80
    let direction = Direction.None
    if(xposition > this.activeCardPosition.x) {
      direction = Direction.Right
    } else {
      direction = Direction.Left
    }
    this.activeCardPosition = { x: xposition, y: touch.clientY - (elementHeight / 2) - 80, direction: direction }
  }

  private _handleTouchEnd(e: TouchEvent) {
    this.dragActive = false;
    const touch = e.touches[0]
    console.log(touch);
    this.activeCardPosition = { x: 0, y: 0, direction: Direction.None }
  }
}
