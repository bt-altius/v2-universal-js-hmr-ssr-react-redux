import React from 'react';

function asyncRoute(getComponent) {
    return class AsyncComponent extends React.Component {
        state = {
            Component: null
        };

        componentDidMount() {
            if (this.state.Component === null) {
                getComponent().then((Component) => {
                    this.setState({ Component: Component });
                })
            }
        }

        render() {
            const {
                Component
            } = this.state;

            if (Component) {
                return (<Component {...this.props} />);
            }
            
            // or <div /> with a loading spinner, etc..
            return (<div>loading...</div>);
        }
    }
}

export const Home = asyncRoute(() => {
    return import('../components/Home/Home.js');
});

export const Counter = asyncRoute(() => {
    return import('../modules/counter/containers/Counter/CounterContainer.js');
});
