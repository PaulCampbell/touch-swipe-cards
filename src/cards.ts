import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-cards')
class Cards extends LitElement {

  @property()
  cards = ['card 1', 'card 2', 'card 3'];

  @property()
  activeCard = this.cards[0];

  @property()
  dragActive = false;

  @property()
  activeCardPosition = {}

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
          (item) =>
            html`
              <li 
                class="${this.activeCard === item && this.dragActive ? 'active' : ''}"
                @touchmove="${this._handleTouchMove}" 
                @touchstart="${this._handleTouchStart}"
                @touchend="${this._handleTouchEnd}"
                style="${this.activeCard === item && this.dragActive ? 'position: absolute; left:' + this.activeCardPosition.x + 'px' : ''}">
                  ${item}
                </li>
            `
        )}
      </ol>
    `;
  }
  private _handleTouchStart(e: Event) { 
    this.dragActive = true;
    console.log(e) 
  }

  private _handleTouchMove(e: TouchEvent) {
    const touch = e.targetTouches[0]
    this.activeCardPosition = { x: touch.clientX, y: touch.clientY }
  }

  private _handleTouchEnd(e: TouchEvent) {
    this.dragActive = false;
    const touch = e.touches[0]
    console.log(touch);
  }
}
