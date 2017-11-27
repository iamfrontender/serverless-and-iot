'use strict';

export function script(url) {
  return new Promise((res, rej) => {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.addEventListener('load', () => res(script), false);
    script.addEventListener('error', () => rej(script), false);
    document.body.appendChild(script);
  })
}

export default {
  script
}