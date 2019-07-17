const renderVNode = h(
  'div',
  {
    style: { backgroundColor: 'red', width: 100, height: 100 },
    class: 'container-el'
  },
  [
    h(
      'a',
      {
        style: {
          color: 'white'
        },
        class: ['a', 'b']
      },
      'children'
    )
  ]
);

console.log(renderVNode);

render(renderVNode, document.body);
