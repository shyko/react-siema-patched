'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _debounce = require('./utils/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _transformProperty = require('./utils/transformProperty');

var _transformProperty2 = _interopRequireDefault(_transformProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactSiema = function (_Component) {
    _inherits(ReactSiema, _Component);

    function ReactSiema(props) {
        _classCallCheck(this, ReactSiema);

        var _this = _possibleConstructorReturn(this, (ReactSiema.__proto__ || Object.getPrototypeOf(ReactSiema)).call(this, props));

        _this.events = ['onTouchStart', 'onTouchEnd', 'onTouchMove', 'onMouseDown', 'onMouseUp', 'onMouseLeave', 'onMouseMove'];

        _this.events.forEach(function (handler) {
            _this[handler] = _this[handler].bind(_this);
        });
        return _this;
    }

    _createClass(ReactSiema, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.currentSlide = this.props.startIndex;

            this.init();

            this.onResize = (0, _debounce2.default)(function () {
                _this2.resize();
                _this2.slideToCurrent();
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
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
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
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('resize', this.onResize);
        }
    }, {
        key: 'init',
        value: function init() {
            this.setSelectorWidth();
            this.setInnerElements();
            this.resolveSlidesNumber();

            this.setStyle(this.sliderFrame, {
                width: this.selectorWidth / this.perPage * this.innerElements.length + 'px',
                webkitTransition: 'all ' + this.props.duration + 'ms ' + this.props.easing,
                transition: 'all ' + this.props.duration + 'ms ' + this.props.easing
            });

            for (var i = 0; i < this.innerElements.length; i++) {
                this.setStyle(this.innerElements[i], {
                    width: 100 / this.innerElements.length + '%'
                });
            }

            this.slideToCurrent();
            this.props.onInit.call(this);
        }
    }, {
        key: 'setSelectorWidth',
        value: function setSelectorWidth() {
            this.selectorWidth = this.selector.getBoundingClientRect().width;
        }
    }, {
        key: 'setInnerElements',
        value: function setInnerElements() {
            this.innerElements = [].slice.call(this.sliderFrame.children);
        }
    }, {
        key: 'resolveSlidesNumber',
        value: function resolveSlidesNumber() {
            if (typeof this.props.perPage === 'number') {
                this.perPage = this.props.perPage;
            } else if (_typeof(this.props.perPage) === 'object') {
                this.perPage = 1;
                for (var viewport in this.props.perPage) {
                    if (window.innerWidth > viewport) {
                        this.perPage = this.props.perPage[viewport];
                    }
                }
            }
        }
    }, {
        key: 'prev',
        value: function prev() {
            if (this.currentSlide === 0 && this.props.loop) {
                this.currentSlide = this.innerElements.length - this.perPage;
            } else {
                this.currentSlide = Math.max(this.currentSlide - 1, 0);
            }
            this.slideToCurrent();
            this.props.onChange.call(this);
        }
    }, {
        key: 'next',
        value: function next() {
            if (this.currentSlide === this.innerElements.length - this.perPage && this.props.loop) {
                this.currentSlide = 0;
            } else {
                this.currentSlide = Math.min(this.currentSlide + 1, this.innerElements.length - this.perPage);
            }
            this.slideToCurrent();
            this.props.onChange.call(this);
        }
    }, {
        key: 'goTo',
        value: function goTo(index) {
            this.currentSlide = Math.min(Math.max(index, 0), this.innerElements.length - 1);
            this.slideToCurrent();
            this.props.onChange.call(this);
        }
    }, {
        key: 'slideToCurrent',
        value: function slideToCurrent() {
            this.sliderFrame.style[_transformProperty2.default] = 'translate3d(-' + Math.round(this.currentSlide * (this.selectorWidth / this.perPage)) + 'px, 0, 0)';
        }
    }, {
        key: 'updateAfterDrag',
        value: function updateAfterDrag() {
            var movement = this.drag.endX - this.drag.startX;
            if (movement > 0 && Math.abs(movement) > this.props.threshold) {
                this.prev();
            } else if (movement < 0 && Math.abs(movement) > this.props.threshold) {
                this.next();
            }
            this.slideToCurrent();
        }
    }, {
        key: 'resize',
        value: function resize() {
            this.resolveSlidesNumber();

            this.selectorWidth = this.selector.getBoundingClientRect().width;
            this.setStyle(this.sliderFrame, {
                width: this.selectorWidth / this.perPage * this.innerElements.length + 'px'
            });
        }
    }, {
        key: 'clearDrag',
        value: function clearDrag() {
            this.drag = {
                startX: 0,
                endX: 0,
                startY: 0,
                letItGo: null
            };
        }
    }, {
        key: 'setStyle',
        value: function setStyle(target, styles) {
            Object.keys(styles).forEach(function (attribute) {
                target.style[attribute] = styles[attribute];
            });
        }
    }, {
        key: 'onTouchStart',
        value: function onTouchStart(e) {
            if (this.props.draggable) {
                e.stopPropagation();
                this.pointerDown = true;
                this.drag.startX = e.touches[0].pageX;
                this.drag.startY = e.touches[0].pageY;
            }
        }
    }, {
        key: 'onTouchEnd',
        value: function onTouchEnd(e) {
            if (this.props.draggable) {
                e.stopPropagation();
                this.pointerDown = false;
                this.setStyle(this.sliderFrame, {
                    webkitTransition: 'all ' + this.props.duration + 'ms ' + this.props.easing,
                    transition: 'all ' + this.props.duration + 'ms ' + this.props.easing
                });
                if (this.drag.endX) {
                    this.updateAfterDrag();
                }
                this.clearDrag();
            }
        }
    }, {
        key: 'onTouchMove',
        value: function onTouchMove(e) {
            if (this.props.draggable) {
                e.stopPropagation();

                if (this.drag.letItGo === null) {
                    this.drag.letItGo = Math.abs(this.drag.startY - e.touches[0].pageY) < Math.abs(this.drag.startX - e.touches[0].pageX);
                }

                if (this.pointerDown && this.drag.letItGo) {
                    this.drag.endX = e.touches[0].pageX;

                    this.setStyle(this.sliderFrame, _defineProperty({
                        webkitTransition: 'all 0ms ' + this.props.easing,
                        transition: 'all 0ms ' + this.props.easing
                    }, _transformProperty2.default, 'translate3d(' + (this.currentSlide * (this.selectorWidth / this.perPage) + (this.drag.startX - this.drag.endX)) * -1 + 'px, 0, 0)'));
                }
            }
        }
    }, {
        key: 'onMouseDown',
        value: function onMouseDown(e) {
            if (this.props.draggable) {
                e.preventDefault();
                e.stopPropagation();
                this.pointerDown = true;
                this.drag.startX = e.pageX;
            }
        }
    }, {
        key: 'onMouseUp',
        value: function onMouseUp(e) {
            if (this.props.draggable) {
                e.stopPropagation();
                this.pointerDown = false;
                this.setStyle(this.sliderFrame, {
                    cursor: '-webkit-grab',
                    webkitTransition: 'all ' + this.props.duration + 'ms ' + this.props.easing,
                    transition: 'all ' + this.props.duration + 'ms ' + this.props.easing
                });
                if (this.drag.endX) {
                    this.updateAfterDrag();
                }
                this.clearDrag();
            }
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove(e) {
            if (this.props.draggable) {
                e.preventDefault();
                if (this.pointerDown) {
                    this.drag.endX = e.pageX;
                    this.setStyle(this.sliderFrame, _defineProperty({
                        cursor: '-webkit-grabbing',
                        webkitTransition: 'all 0ms ' + this.props.easing,
                        transition: 'all 0ms ' + this.props.easing
                    }, _transformProperty2.default, 'translate3d(' + (this.currentSlide * (this.selectorWidth / this.perPage) + (this.drag.startX - this.drag.endX)) * -1 + 'px, 0, 0)'));
                }
            }
        }
    }, {
        key: 'onMouseLeave',
        value: function onMouseLeave(e) {
            if (this.props.draggable) {
                if (this.pointerDown) {
                    this.pointerDown = false;
                    this.drag.endX = e.pageX;
                    this.setStyle(this.sliderFrame, {
                        cursor: '-webkit-grab',
                        webkitTransition: 'all ' + this.props.duration + 'ms ' + this.props.easing,
                        transition: 'all ' + this.props.duration + 'ms ' + this.props.easing
                    });
                    this.updateAfterDrag();
                    this.clearDrag();
                }
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                'div',
                Object.assign({
                    ref: function ref(selector) {
                        return _this3.selector = selector;
                    },
                    style: { overflow: 'hidden' }
                }, this.events.reduce(function (props, event) {
                    return Object.assign({}, props, _defineProperty({}, event, _this3[event]));
                }, {})),
                _react2.default.createElement(
                    'div',
                    { ref: function ref(sliderFrame) {
                            return _this3.sliderFrame = sliderFrame;
                        } },
                    _react2.default.Children.map(this.props.children, function (children, index) {
                        return _react2.default.cloneElement(children, {
                            key: index,
                            style: { float: 'left' }
                        });
                    })
                )
            );
        }
    }]);

    return ReactSiema;
}(_react.Component);

ReactSiema.propTypes = {
    resizeDebounce: _propTypes2.default.number,
    duration: _propTypes2.default.number,
    easing: _propTypes2.default.string,
    perPage: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.object]),
    startIndex: _propTypes2.default.number,
    draggable: _propTypes2.default.bool,
    threshold: _propTypes2.default.number,
    loop: _propTypes2.default.bool,
    children: _propTypes2.default.oneOfType([_propTypes2.default.element, _propTypes2.default.arrayOf(_propTypes2.default.element)]),
    onInit: _propTypes2.default.func,
    onChange: _propTypes2.default.func
};
ReactSiema.defaultProps = {
    resizeDebounce: 250,
    duration: 200,
    easing: 'ease-out',
    perPage: 1,
    startIndex: 0,
    draggable: true,
    threshold: 20,
    loop: false,
    onInit: function onInit() {},
    onChange: function onChange() {}
};
exports.default = ReactSiema;