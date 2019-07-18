function patchData(el, key, prevValue, nextValue) {
  const domPropsRE = /\W|^(?:value|checked|selected|muted)$/;
  const dataMap = new Map();

  dataMap.set('class', () => {
    if (typeof className === 'string') {
      el.className = nextValue;
    } else if (Array.isArray(nextValue)) {
      el.className = nextValue.filter(Boolean).join(' ');
    }
  });
  dataMap.set('style', () => {
    for (let [k, s] of Object.entries(prevValue || {})) {
      if (!nextValue.hasOwnProperty(k)) {
        el.style[k] = '';
      }
    }

    for (let [k, s] of Object.entries(nextValue || {})) {
      if (k === 'width' || k === 'height') {
        s = `${s}px`;
      }
      el.style[k] = s;
    }
  });
  dataMap.set(undefined, () => {
    // event
    let eventName;

    if (key[0] === 'o' && key[1] === 'n') {
      eventName = key.slice(2);
    } else if (key[0] === '@') {
      eventName = key.slice(1);
    }

    if (eventName) {
      if (prevValue) {
        el.removeEventListener(eventName, prevValue, false);
      }

      el.addEventListener(eventName, nextValue, false);

      return;
    }

    // normal props
    if (domPropsRE.test(key)) {
      el[key] = nextValue;
    } else {
      el.setAttribute(key, nextValue);
    }
  });

  if (dataMap.has(key)) {
    dataMap.get(key)();
  } else {
    dataMap.get(undefined)();
  }
}
