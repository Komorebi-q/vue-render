function render(vnode, container) {
  const preVNode = container.vnode;

  if (preVNode == null) {
    if (vnode) {
      mount(vnode, container);
      container.vnode = vnode;
    }
  } else {
    if (vnode) {
      patch(preVNode, vnode, container);
      container.vnode = vnode;
    } else {
      container.removeChild(preVNode);
      container.vnode = null;
    }
  }
}

const dataMap = new Map();
dataMap.set('style', (styles, el) => {
  for (let [k, s] of Object.entries(styles)) {
    if (k === 'width' || k === 'height') {
      s = `${s}px`;
    }
    el.style[k] = s;
  }
});
dataMap.set('class', (className, el) => {
  if (typeof className === 'string') {
    el.className = className;
  } else if (Array.isArray(className)) {
    el.className = className.filter(Boolean).join(' ');
  }
});

function mount(vnode, container, isSVG) {
  const { flags } = vnode;
  if (flags & VNodeFlags.ELEMENT) {
    mountElement(vnode, container, isSVG);
  } else if (flags & VNodeFlags.COMPONENT) {
    // 挂载组件
    mountComponent(vnode, container, isSVG);
  } else if (flags & VNodeFlags.TEXT) {
    // 挂载纯文本

    mountText(vnode, container);
  } else if (flags & VNodeFlags.FRAGMENT) {
    // 挂载 Fragment
    mountFragment(vnode, container, isSVG);
  } else if (flags & VNodeFlags.PORTAL) {
    // 挂载 Portal
    mountPortal(vnode, container, isSVG);
  }
}

function mountElement(vnode, container, isSVG) {
  isSVG = isSVG || vnode.flags & VNodeFlags.ELEMENT_SVG;

  const el = isSVG
    ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag)
    : document.createElement(vnode.tag);
  const childFlags = vnode.childFlags;

  vnode.el = el;

  if (vnode.data != null) {
    for (const [key, prop] of Object.entries(vnode.data)) {
      if (dataMap.has(key)) {
        dataMap.get(key)(prop, el);
      }
    }
  }

  if (vnode.children != null) {
    if (childFlags !== ChildrenFlags.NO_CHILDREN) {
      if (childFlags & ChildrenFlags.SINGLE_VNODE) {
        mount(vnode.children, el, isSVG);
      } else if (childFlags & ChildrenFlags.MULTIPLE_CHILDREN) {
        for (const [i, child] of vnode.children.entires()) {
          mount(child, el, isSVG);
        }
      }
    }
  }

  container.appendChild(el);
}

function mountText(vnode, container) {
  console.log(container);
  const innerHTML = container.innerHTML;
  container.innerHTML = `${innerHTML}${vnode.children}`;
}
