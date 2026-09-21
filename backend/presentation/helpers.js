"use strict";

const C = {
  bg:        "080810",
  bgCard:    "10101E",
  bgCard2:   "16162C",
  gold:      "C9A84C",
  goldLight: "E8C86A",
  teal:      "1A9B8C",
  tealLight: "2DC5B5",
  white:     "FFFFFF",
  muted:     "8888AA",
  border:    "1E1E35",
};

const makeShadow = () => ({
  type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.35,
});

const W = 10;      // slide width  (inches)
const H = 5.625;   // slide height (inches)

function slideBase(pres) {
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  return slide;
}

function addDecorativeBars(pres, slide) {
  // top gold bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W, h: 0.06,
    fill: { color: C.gold }, line: { color: C.gold },
  });
  // bottom teal bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: H - 0.06, w: W, h: 0.06,
    fill: { color: C.teal }, line: { color: C.teal },
  });
  // left vertical gold line
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 0, w: 0.03, h: H,
    fill: { color: C.gold }, line: { color: C.gold },
  });
}

function addTitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x !== undefined ? opts.x : 0.65,
    y: opts.y !== undefined ? opts.y : 0.18,
    w: opts.w !== undefined ? opts.w : 8.8,
    h: opts.h !== undefined ? opts.h : 0.7,
    fontFace: "Georgia",
    fontSize: opts.fontSize || 22,
    bold: true,
    color: C.gold,
    align: opts.align || "left",
    valign: "middle",
    margin: 0,
  });
}

module.exports = {
  C,
  makeShadow,
  W,
  H,
  slideBase,
  addDecorativeBars,
  addTitle
};
