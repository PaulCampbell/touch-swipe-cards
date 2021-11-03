import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {eventOptions} from 'lit/decorators.js';

@customElement('my-cards')
class Cards extends LitElement {

  @property()
  cards = ['card 1', 'card 2', 'card 3'];

  @property()
  activeCard = this.cards[0];
 
  constructor() {
    super();
  }

  render() {
    return html`
    <p>Draggable Cards</p>
    <ul>
        ${this.cards.map(
          (item) =>
            html`
              <li draggable="true" @touchmove="${this._handleTouchMove}" @touchstart="${this._handleTouchStart}">${item}</li>
            `
        )}
      </ul>
    `;
  }
  private _handleTouchStart(e: Event) { console.log(e) }

  private _handleTouchMove(e: TouchEvent) {
    const touch = e.touches[0]
    console.log(touch);
  }

  private _handleTouchEnd(e: TouchEvent) {
    const touch = e.touches[0]
    console.log(touch);
  }
}
