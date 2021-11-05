import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

enum Direction {
  None = 0,
  Left = 1,
  Right = 2,
}

@customElement('touch-swipe-cards')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TouchSwipeCards extends LitElement {
  static styles = css`
    .cards {
      position: relative;
      min-height: 250px;
    }

    ::slotted(*) {
      position: absolute;
      top: 0;
      margin: auto;
      width: 100%;
    }
  `;

  render() {
    return html`
      <div class="cards">
        <slot name="card"> </slot>
      </div>
    `;
  }
}
