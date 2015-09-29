var React = require('react/addons');
var Grid = require('./grid');
var Swipeable = require('./swipeable');
var prefix = "slider";

var Slider = React.createClass({
    displayName: 'Slider',
    //mixins: [React.addons.PureRenderMixin],
    propTypes: {
        items: React.PropTypes.array.isRequired,
        showThumbnails: React.PropTypes.bool,
        showBullets: React.PropTypes.bool,
        autoPlay: React.PropTypes.bool,
        lazyLoad: React.PropTypes.bool,
        placeholderSrc: React.PropTypes.string,
        slideInterval: React.PropTypes.number,
        onSlide: React.PropTypes.func
    },
    getInitialState: function() {
        return {
            currentIndex: 0,
            translateX: 0,
            containerWidth: 0,
            count: 0
        };
    },
    setContainerWidth: function(){
        if (!this.refs.item) {
            return;
        }

        var node = this.refs.item.getDOMNode();
        var len = this.props.items.length;
        var itemWidth = node.offsetWidth;
        var containerWidth = itemWidth * (this.props.isLoop ? len + 2 : len);

        this.setState({
            translateX: itemWidth,
            containerWidth: containerWidth
        })

    },
    componentDidMount: function(){
        if(!this.props.items.length){
            return;
        }

        this.setContainerWidth();
        
        if (this.props.autoPlay) {
            this.play();
        }
    },
    play: function(){
        if (this._intervalId) {
            return;
        }
        this._intervalId = window.setInterval(function() {
            if (!this.state.hovering) {
                this.slideToIndex(this.state.currentIndex + 1);
            }
        }.bind(this), this.props.slideInterval);

    },
    slideToIndex: function(index, event) {

        var node = this.refs.silderContent.getDOMNode();
        var outerContaierWidth = node.offsetWidth;

        if ( outerContaierWidth > this.state.containerWidth) {
            return false;
        }

        var slideCount = this.props.items.length - 1;

        if(index < 0){
            if(!this.props.isLoop){
                index = slideCount;
            }else{
                index = index - 1;
            }
        }

        if(index > slideCount){
            if(!this.props.isLoop){
                index = 0;
            }else{
                index = slideCount + 1;
            }
        }

        this.animate(index, slideCount);
    },

    animate: function(index, slideCount){
        var _self = this;
        var node = this.refs.container.getDOMNode();
        var currIndex = index;
        if(this.props.isLoop){
            currIndex = index <= -1 ? 0 : index + 1;
        }

        node.style.webkitTransform = `translateX(-${currIndex * this.state.translateX}px)`;
        node.style.transitionDuration = `600ms`;
        // 循环轮播的补丁
        if(index >= (slideCount+1)){
            setTimeout(function(){
                node.style.webkitTransform = `translateX(${0 - _self.state.translateX}px)`;
                node.style.transitionDuration = `0ms`;
            }, 600);
            index = 0;
        }else if(index <= -1){
            setTimeout(function(){
                node.style.webkitTransform = `translateX(${(0 - slideCount - 1) * _self.state.translateX}px)`;
                node.style.transitionDuration = `0ms`;
            }, 600);
            index = slideCount;
        }

        this.setState({
            count: this.state.count + 1,
            currentIndex: index
        });

        if (event) {
            if (this._intervalId) {
                // user event, reset interval
                this.pause();
                this.play();
            }
            event.preventDefault();
        }
    },
    pause: function(){
        if (this._intervalId) {
            window.clearInterval(this._intervalId);
            this._intervalId = null;
        }
    },
    getSliderList: function(){
        var currentIndex = this.state.currentIndex;
        var slides = [];
        var bullets = [];
        var items = this.props.items;
        // 遍历图片列表
        items.map(function(item, index){
            var __item = this.props.createItem(item, index, this.state.count);

            slides.push(
                <div
                    ref={index === 0 ? `item` : ''}
                    //key={index}
                    className={'ui-slider'}>
                    {__item}
                </div>
            );

            // 生成小点儿导航
            if (this.props.showBullets) {
                bullets.push(
                    <li
                        key={index}
                        className={'ui-slider-bullet ' + (currentIndex === index ? 'active' : '')}
                        onTouchStart={this.slideToIndex.bind(this, index)}
                        onClick={this.slideToIndex.bind(this, index)}>
                    </li>
                );
            }

        }.bind(this));

        if(this.props.isLoop) {
            var first = (
                <div
                    className={'ui-slider'}>
                    {this.props.createItem(items[0], 0, this.state.count)}
                </div>
            );
            var lenLast = items.length - 1;
            var last = (
                <div
                    className={'ui-slider'}>
                    {this.props.createItem(items[lenLast], lenLast, this.state.count)}
                </div>
            );
            slides.push(first);
            slides = [last].concat(slides);
        }

        return {
            slides: slides,
            bullets: bullets
        };
    },
    render: function(){
        var items = this.props.items;
        if(!items.length){
            return <div className="hide"></div>
        }

        var currentIndex = this.state.currentIndex;
        var list = this.getSliderList();
        var slides = list.slides;
        var bullets = list.bullets;

        var swipePrev = this.slideToIndex.bind(this, currentIndex - 1);
        var swipeNext = this.slideToIndex.bind(this, currentIndex + 1);

        var nav = function(){
            return (
                <div>
                    <a className='ui-slider-left-nav'
                       onTouchStart={swipePrev}
                       onClick={swipePrev}/>

                    <a className='ui-slider-right-nav'
                       onTouchStart={swipeNext}
                       onClick={swipeNext}/>
                </div>
            )
        };

        var classNames = ['ui-slider-slides'];
        if(this.props.isLoop){
            classNames.push('ui-slider-loop');
        }

        return (
            <Grid className="ui-slider-box">
                <div className="ui-slider-content" ref="silderContent">

                    {
                        this.props.showNav && nav()
                    }

                    <Swipeable
                        onSwipedLeft={swipeNext}
                        onSwipedRight={swipePrev}>
                        <div className={classNames.join(' ')} ref="container" style={{width:`${this.state.containerWidth < 5 ? '100%' : this.state.containerWidth + 'px'}`}}>
                            {slides}
                        </div>
                    </Swipeable>

                    {
                        this.props.showBullets &&
                        <div className='ui-slider-bullets'>
                            <ul className='ui-slider-bullets-container'>
                                {bullets}
                            </ul>
                        </div>
                    }

                </div>
            </Grid>
        );
    }
});

module.exports = Slider;
