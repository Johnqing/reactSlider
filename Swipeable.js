var React = require('react/addons');

var Swipeable = React.createClass({
    propTypes: {
        onSwiped: React.PropTypes.func,
        onSwipingUp: React.PropTypes.func,
        onSwipingRight: React.PropTypes.func,
        onSwipingDown: React.PropTypes.func,
        onSwipingLeft: React.PropTypes.func,
        onSwipedUp: React.PropTypes.func,
        onSwipedRight: React.PropTypes.func,
        onSwipedDown: React.PropTypes.func,
        onSwipedLeft: React.PropTypes.func,
        flickThreshold: React.PropTypes.number,
        delta: React.PropTypes.number
    },

    getInitialState: function () {
        return {
            x: null,
            y: null,
            swiping: false,
            start: 0
        }
    },

    getDefaultProps: function () {
        return {
            flickThreshold: 0.6,
            delta: 10
        }
    },

    calculatePos: function (e) {
        var x = e.changedTouches[0].pageX
        var y = e.changedTouches[0].pageY

        var xd = this.state.x - x
        var yd = this.state.y - y

        var axd = Math.abs(xd)
        var ayd = Math.abs(yd)

        return {
            deltaX: xd,
            deltaY: yd,
            absX: axd,
            absY: ayd
        }
    },

    touchStart: function (e) {
        if (e.touches.length > 1) {
            return
        }
        console.log('touchStart');

        this.setState({
            start: Date.now(),
            x: e.touches[0].pageX,
            y: e.touches[0].pageY,
            swiping: false
        })
    },

    touchMove: function (e) {
        if (!this.state.x || !this.state.y || e.touches.length > 1) {
            return
        }
        // fixed Android不触发touchEnd
        e.preventDefault();

        var pos = this.calculatePos(e)

        if (pos.absX < this.props.delta && pos.absY < this.props.delta) {
            return
        }

        if (pos.absX > pos.absY) {
            if (pos.deltaX > 0) {
                if (this.props.onSwipingLeft) {
                    this.props.onSwipingLeft(e, pos.absX)
                }
            } else {
                if (this.props.onSwipingRight) {
                    this.props.onSwipingRight(e, pos.absX)
                }
            }
        } else {
            if (pos.deltaY > 0) {
                if (this.props.onSwipingUp) {
                    this.props.onSwipingUp(e, pos.absY)
                }
            } else {
                if (this.props.onSwipingDown) {
                    this.props.onSwipingDown(e, pos.absY)
                }
            }
        }

        this.setState({ swiping: true })
    },

    touchEnd: function (ev) {
        console.log('touchEnd');
        if (this.state.swiping) {
            var pos = this.calculatePos(ev)

            var time = Date.now() - this.state.start;
            var velocity = Math.sqrt(pos.absX * pos.absX + pos.absY * pos.absY) / time;
            var isFlick = velocity > this.props.flickThreshold;

            this.props.onSwiped && this.props.onSwiped(
                ev,
                pos.deltaX,
                pos.deltaY,
                isFlick
            )

            if (pos.absX > pos.absY) {
                if (pos.deltaX > 0) {
                    this.props.onSwipedLeft && this.props.onSwipedLeft(ev, pos.deltaX, isFlick)
                } else {
                    this.props.onSwipedRight && this.props.onSwipedRight(ev, pos.deltaX, isFlick)
                }
            } else {
                if (pos.deltaY > 0) {
                    this.props.onSwipedUp && this.props.onSwipedUp(ev, pos.deltaY, isFlick)
                } else {
                    this.props.onSwipedDown && this.props.onSwipedDown(ev, pos.deltaY, isFlick)
                }
            }
        }

        this.setState(this.getInitialState());
    },

    render: function () {
        return (
            <div {...this.props}
                onTouchStart={this.touchStart}
                onTouchMove={this.touchMove}
                onTouchEnd={this.touchEnd}
            >
                {this.props.children}
            </div>
        )
    }
})

module.exports = Swipeable
