const isOverflown = ({ clientHeight, scrollHeight, scrollWidth, clientWidth } ) => {
    return scrollHeight > clientHeight || scrollWidth > clientWidth;
}

const  addRenderedTag = () => {
    // add a tag to indicate the render is finished
    var tag = document.createElement("span");
    tag.id = 'rendered';
    document.body.insertAdjacentElement('beforeend', tag);
}

// resizes a text font-size to fit a parent container both in width and height
const resizeText = ({ element, elements, minSize = 6, maxSize = 100, step = 1, unit = 'px' }) => {
  (elements || [element]).forEach(el => {
    let i = minSize;
    let overflow = false;
    const parent = el.parentNode;

    var checkNext = () => {
        el.style.fontSize = `${i}${unit}`;
        overflow = isOverflown(parent);

        if (!overflow && i< maxSize) {
            i += step
            setTimeout(checkNext, 0);
        } else{
            el.style.fontSize = `${i - step}${unit}`;
            setTimeout(() => addRenderedTag(), 100);
        }
    }

    checkNext();
  })
};