import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from './utils/debounce';
import transformProperty from './utils/transformProperty';

class ReactSiema extends Component {
    static propTypes = {
        resizeDebounce: PropTypes.number,
        duration: PropTypes.number,
        easing: PropTypes.string,
        perPage: PropTypes.oneOfType([
          PropTypes.number,
          PropTypes.object
        ]),
        startIndex: PropTypes.number,
        draggable: PropTypes.bool,
        threshold: PropTypes.number,
        loop: PropTypes.bool,
        children: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.arrayOf(PropTypes.element)
        ]),
        onInit: PropTypes.func,
        onChange: PropTypes.func,
    };

    static defaultProps = {
      resizeDebounce: 250,
      duration: 200,
      easing: 'ease-out',
      perPage: 1,
      startIndex: 0,
      draggable: true,
      threshold: 20,
      loop: false,
      onInit: () => {},
      onChange: () => {},
    };

    events = [
        'onTouchStart', 'onTouchEnd', 'onTouchMove', 'onMouseDown', 'onMouseUp', 'onMouseLeave', 'onMouseMove'
    ];

    constructor(props) {
        super(props);
        this.events.forEach((handler) => {
            this[handler] = this[handler].bind(this);
        });
    }

    componentDidMount() {
        this.currentSlide = this.props.startIndex;

        this.init();

        this.onResize = debounce(() => {
            this.resize();
            this.slideToCurrent();
        }, this.props.resizeDebounce);

        window.addEventListener('resize', this.onResize);

        if (this.props.draggable) {
            this.pointerDown = false;
            this.drag = {
                startX: 0,
                endX: 0,
                startY: 0,
                letItGo: null
            };
        }
    }

    componentDidUpdate(prevProps) {
        this.init();
        if (this.props.draggable !== prevProps.draggable) {
          if (this.props.draggable) {
            this.pointerDown = false;
            this.drag = {
              startX: 0,
              endX: 0,
              startY: 0,
              letItGo: null
            };
          } else {
            this.pointerDown = null;
            this.drag = null;
          }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }

    init() {
        this.setSelectorWidth();
        this.setInnerElements();
        this.resolveSlidesNumber();

        this.setStyle(this.sliderFrame, {
            width: `${(this.selectorWidth / this.perPage) * this.innerElements.length}px`,
            webkitTransition: `all ${this.props.duration}ms ${this.props.easing}`,
            transition: `all ${this.props.duration}ms ${this.props.easing}`
        });

        for (let i = 0; i < this.innerElements.length; i++) {
            this.setStyle(this.innerElements[i], {
                width: `${100 / this.innerElements.length}%`
            });
        }

        this.slideToCurrent();
        this.props.onInit.call(this);
    }

    setSelectorWidth() {
        this.selectorWidth = this.selector.getBoundingClientRect().width;
    }

    setInnerElements() {
        this.innerElements = [].slice.call(this.sliderFrame.children);
    }

    resolveSlidesNumber() {
        if (typeof this.props.perPage === 'number') {
            this.perPage = this.props.perPage;
        } else if (typeof this.props.perPage === 'object') {
            this.perPage = 1;
            for (let viewport in this.props.perPage) {
                if (window.innerWidth > viewport) {
                    this.perPage = this.props.perPage[viewport];
                }
            }
        }
    }

    prev() {
        if (this.currentSlide === 0 && this.props.loop) {
            this.currentSlide = this.innerElements.length - this.perPage;
        } else {
            this.currentSlide = Math.max(this.currentSlide - 1, 0);
        }
        this.slideToCurrent();
        this.props.onChange.call(this);
    }

    next() {
        if (this.currentSlide === this.innerElements.length - this.perPage && this.props.loop) {
            this.currentSlide = 0;
        } else {
            this.currentSlide = Math.min(this.currentSlide + 1, this.innerElements.length - this.perPage);
        }
        this.slideToCurrent();
        this.props.onChange.call(this);
    }

    goTo(index) {
        this.currentSlide = Math.min(Math.max(index, 0), this.innerElements.length - 1);
        this.slideToCurrent();
        this.props.onChange.call(this);
    }

    slideToCurrent() {
        this.sliderFrame.style[transformProperty] = `translate3d(-${Math.round(this.currentSlide * (this.selectorWidth / this.perPage))}px, 0, 0)`;
    }

    updateAfterDrag() {
        const movement = this.drag.endX - this.drag.startX;
        if (movement > 0 && Math.abs(movement) > this.props.threshold) {
            this.prev();
        } else if (movement < 0 && Math.abs(movement) > this.props.threshold) {
            this.next();
        }
        this.slideToCurrent();
    }

    resize() {
        this.resolveSlidesNumber();

        this.selectorWidth = this.selector.getBoundingClientRect().width;
        this.setStyle(this.sliderFrame, {
            width: `${(this.selectorWidth / this.perPage) * this.innerElements.length}px`
        });
    }

    clearDrag() {
        this.drag = {
            startX: 0,
            endX: 0,
            startY: 0,
            letItGo: null
        };
    }

    setStyle(target, styles) {
        Object.keys(styles).forEach((attribute) => {
            target.style[attribute] = styles[attribute];
        });
    }

    onTouchStart(e) {
      if (this.props.draggable) {
        e.stopPropagation();
        this.pointerDown = true;
        this.drag.startX = e.touches[0].pageX;
        this.drag.startY = e.touches[0].pageY;
    }
}

    onTouchEnd(e) {
      if (this.props.draggable) {
        e.stopPropagation();
        this.pointerDown = false;
        this.setStyle(this.sliderFrame, {
          webkitTransition: `all ${this.props.duration}ms ${this.props.easing}`,
          transition: `all ${this.props.duration}ms ${this.props.easing}`
        });
        if (this.drag.endX) {
            this.updateAfterDrag();
        }
        this.clearDrag();
      }
    }

    onTouchMove(e) {
      if (this.props.draggable) {
        e.stopPropagation();

        if (this.drag.letItGo === null) {
            this.drag.letItGo = Math.abs(this.drag.startY - e.touches[0].pageY) < Math.abs(this.drag.startX - e.touches[0].pageX);
        }

        if (this.pointerDown && this.drag.letItGo) {
            this.drag.endX = e.touches[0].pageX;

            this.setStyle(this.sliderFrame, {
                webkitTransition: `all 0ms ${this.props.easing}`,
                transition: `all 0ms ${this.props.easing}`,
                [transformProperty]: `translate3d(${(this.currentSlide * (this.selectorWidth / this.perPage) + (this.drag.startX - this.drag.endX)) * -1}px, 0, 0)`
            });
        }
      }
    }

    onMouseDown(e) {
      if (this.props.draggable) {
        e.preventDefault();
        e.stopPropagation();
        this.pointerDown = true;
        this.drag.startX = e.pageX;
      }
    }

    onMouseUp(e) {
      if (this.props.draggable) {
        e.stopPropagation();
        this.pointerDown = false;
        this.setStyle(this.sliderFrame, {
          cursor: '-webkit-grab',
          webkitTransition: `all ${this.props.duration}ms ${this.props.easing}`,
          transition: `all ${this.props.duration}ms ${this.props.easing}`
        });
        if (this.drag.endX) {
            this.updateAfterDrag();
        }
        this.clearDrag();
      }
    }

    onMouseMove(e) {
      if (this.props.draggable) {
        e.preventDefault();
        if (this.pointerDown) {
            this.drag.endX = e.pageX;
            this.setStyle(this.sliderFrame, {
                cursor: '-webkit-grabbing',
                webkitTransition: `all 0ms ${this.props.easing}`,
                transition: `all 0ms ${this.props.easing}`,
                [transformProperty]: `translate3d(${(this.currentSlide * (this.selectorWidth / this.perPage) + (this.drag.startX - this.drag.endX)) * -1}px, 0, 0)`
            });
        }
      }
    }

    onMouseLeave(e) {
      if (this.props.draggable) {
        if (this.pointerDown) {
            this.pointerDown = false;
            this.drag.endX = e.pageX;
            this.setStyle(this.sliderFrame, {
                cursor: '-webkit-grab',
                webkitTransition: `all ${this.props.duration}ms ${this.props.easing}`,
                transition: `all ${this.props.duration}ms ${this.props.easing}`
            });
            this.updateAfterDrag();
            this.clearDrag();
        }
      }
    }

    render() {
        return (
            <div
                ref={(selector) => this.selector = selector}
                style={{ overflow: 'hidden' }}
                {...this.events.reduce((props, event) => Object.assign({}, props, { [event]: this[event] }), {})}
            >
                <div ref={(sliderFrame) => this.sliderFrame = sliderFrame}>
                    {React.Children.map(this.props.children, (children, index) =>
                        React.cloneElement(children, {
                            key: index,
                            style: { float: 'left' }
                        })
                    )}
                </div>
            </div>
        );
    }
}

export default ReactSiema;
