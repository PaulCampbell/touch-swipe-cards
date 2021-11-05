# Draggable cards lit web component

It's a Tinder cards type ui thing, built as a web component using Lit

![Cards - Demo](https://github.com/PaulCampbell/touch-swipe-cards/blob/main/withjs.gif)

This thing does the whole progressive enhancement business, so with JS disabled it looks like this:

![Cards - Demo - JS disabled](https://github.com/PaulCampbell/touch-swipe-cards/blob/main/nojs.gif)

It will work on a big screen, but it's intended for phone use really... that's where this sort of thing works better I reckon.

[Check out the demo](https://paulcampbell.github.io/touch-swipe-cards/)

## Using the Component

### A Single Card

If you just want a single card, you can just use a `touch-swipe-card` element:

```
    <touch-swipe-card>
      <div slot="item" id="cb1">
        <img width="150" slot="item" src="images/cat1.jpg" />
      </div>
      <div slot="options">
          <input type="radio" id="cat-1" name="cb1" value="cat">
          <label for="cat-1">Cat</label>
          <input type="radio" id="dog-1" name="cb1" value="dog">
          <label for="dog-1">Dog</label>
      </div>
    </touch-swipe-card>
```

### A list of cards

For multiple cards, you'll want a `touch-swipe-cards` element, which accepts a collection of `touch-swipe-card` elements:

```
    <touch-swipe-cards>
      <div slot="card">
        <touch-swipe-card>
          <div slot="item" id="item1">
            <img width="150" slot="item" src="images/cat1.jpg" />
          </div>
          <div slot="options">
              <input type="radio" id="cat-1" name="cb1" value="cat">
              <label for="cat-1">Cat</label>
              <input type="radio" id="dog-1" name="cb1" value="dog">
              <label for="dog-1">Dog</label>
          </div>
        </touch-swipe-card>
        </div>
        <div slot="card">
        <touch-swipe-card>
          <div slot="item" id="item2">
            <img width="150" slot="item" src="images/dog1.jpg" />
          </div>
          <div slot="options">
              <input type="radio" id="cat-2" name="cb2" value="cat">
              <label for="cat-2">Cat</label>
              <input type="radio" id="dog-2" name="cb2" value="dog">
              <label for="dog-2">Dog</label>
          </div>
        </touch-swipe-card>
      </div>
    </<touch-swipe-cards>>
```

## Development

### Build:

`npm run watch`

### Serve:

`npm run serve`
