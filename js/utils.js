'use strict';

export function capitalise(str) {
  return str[0].toUpperCase() + str.substring(1);
}

export function svg(name) {
  return d3.select(
    document.createElementNS(d3.namespace('svg').space, name)
  );
}

export function minusHalfOf(value) {
  return -value / 2;
}

export function remove(arr, selector) {
  const toRemove = [];

  arr.forEach((el, index) => {
    if (selector(el)) {
      toRemove.push(index);
    }
  });

  toRemove.forEach((index, removed) => {
    arr.splice(index - removed, 1);
  })
}

export function polygon(x, y, radius, sides) {
  var crd = [];

  /* 1 SIDE CASE */
  if (sides == 1)
    return [[x, y]];

  /* > 1 SIDE CASEs */
  for (var i = 0; i < sides; i++) {
    crd.push([(x + (Math.sin(2 * Math.PI * i / sides) * radius)), (y - (Math.cos(2 * Math.PI * i / sides) * radius))]);
  }

  return crd;
}

export function style(root, selector, style) {
  const els = Array.from(root.querySelectorAll(selector));
  const styleKeys = Object.keys(style);

  els.forEach(el => {
    styleKeys.forEach(styleKey => el.style[styleKey] = style[styleKey]);
  });
}

export function rand(bottom, up) {
  if (up === undefined) {
    up = bottom;
    bottom = 0;
  }

  return Math.floor(bottom + Math.random() * (up - bottom));
}

export function anyOf(arr) {
  return arr[rand(arr.length)];
}