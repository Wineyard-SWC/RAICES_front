// components/DefaultLoading/flowerLoader.js
import { TweenMax, TimelineMax, Linear, Elastic, Expo } from 'gsap';

const LEAF_SVG = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 23.7 51.8" xml:space="preserve">
  <path d="M11.8,0c0,0-26.6,24.1,0,51.8C38.5,24.1,11.8,0,11.8,0z"/>
</svg>
`;

const Selector = {
  CENTER: '.flower__center',
  LEAF: '.flower__leaf',
  LEAF_INNER: '.flower__leaf-inner',
  LEAVES: '.flower__leaves'
};
const ClassName = {
  LEAF: 'flower__leaf'
};

export default class FlowerLoader {
  constructor(containerEl) {
    this._element = containerEl;
    this._flowerLeaves = containerEl.querySelector(Selector.LEAVES);
    this._numberOfLeaves = 7;
    this._rotation = 360 / this._numberOfLeaves;
    this._path = [
      { x: 15, y: 0 },
      { x: 16, y: -1 },
      { x: 17, y: 0 },
      { x: 16, y: 1 },
      { x: 15, y: 0 }
    ];
    this._location = { ...this._path[0] };
    this._tn1 = TweenMax.to(this._location, this._numberOfLeaves, {
      bezier: { curviness: 1.5, values: this._path },
      ease: Linear.easeNone
    });

    this._initialize();
  }

  _initialize() {
    this._addLeaves();
  }

  _addLeaves() {
    for (let i = 0; i < this._numberOfLeaves; i++) {
      const leafEl = document.createElement('div');
      leafEl.className = ClassName.LEAF;
      leafEl.innerHTML = `<div class="flower__leaf-inner">${LEAF_SVG}</div>`;
      this._tn1.time(i);

      TweenMax.set(leafEl, {
        x: this._location.x - 11,
        y: this._location.y - 37,
        rotation: (this._rotation * i) - 90
      });

      this._flowerLeaves.appendChild(leafEl);
    }
    this._animate();
  }

  _animate() {
    const leaves = this._flowerLeaves.querySelectorAll(Selector.LEAF_INNER);
    const center = this._element.querySelector(Selector.CENTER);
    const tl = new TimelineMax({ onComplete: () => tl.restart(true) });

    tl
      .fromTo(center, 1,
        { scale: 0 },
        { scale: 1, ease: Elastic.easeOut.config(1.1, .75) },
        0
      )
      .staggerTo(leaves, 1,
        { scale: 1, ease: Elastic.easeOut.config(1.1, .75) },
        0.2,
        0.3
      )
      .to(leaves, 0.3, { scale: 1.25, ease: Elastic.easeOut.config(1.5, 1) })
      .to(this._element.querySelector(Selector.LEAVES), 1.5,
        { rotation: 360, ease: Expo.easeInOut },
        1.7
      )
      .to(leaves, 0.5, { scale: 0, ease: Elastic.easeInOut.config(1.1, .75) })
      .to(center, 0.5,
        { scale: 0, ease: Elastic.easeInOut.config(1.1, .75) },
        '-=0.37'
      );
  }
}
