var React = require('react/addons');
var prefix = "grid";

var Grid = React.createClass({
    displayName: 'Grid',
    propTypes: {
        children: React.PropTypes.any,
        className: React.PropTypes.string,
        style: React.PropTypes.object
    },
    render: function(){
        return (
            <div style={this.props.style} className={this.props.className}>
                {this.props.children}
            </div>
        );
    }
});


module.exports = Grid;
