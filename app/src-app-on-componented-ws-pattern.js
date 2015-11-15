import React, { Component, Children } from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider, connect } from 'react-redux';

/**
 * Action
 */
const OPENED_SOCKET = '@chat/OPENED_SOCKET';
const SEND_MESSAGE = '@chat/SEND_MESSAGE';
const SENT_MESSAGE = '@chat/SENT_MESSAGE';
const RECEIVED_MESSAGE = '@chat/RECEIVED_MESSAGE';

function openSocket() {
  return {
    type: OPENED_SOCKET
  }
}

function sendMessage(message) {
  return {
    type: SEND_MESSAGE,
    message
  };
}

function sentMessage() {
  return {
    type: SENT_MESSAGE
  };
}


/**
 * Reducer
 */
function chat(state={ log: []}, action) {
  const { log } = state;
  switch(action.type) {
    case SENT_MESSAGE:
      return Object.assign({}, state, {
        message: ''
      });
    case SEND_MESSAGE:
      return Object.assign({}, state, {
        message: action.message
      });
    case RECEIVED_MESSAGE:
      return Object.assign({}, state, {
        log: [...log, action.receivedMessage]
      });
    case OPENED_SOCKET:
    default:
      return state;
  }
}


/**
 * Store
 */
const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware
)(createStore);

const store = createStoreWithMiddleware(combineReducers({
  chat
}));


/**
 * Component
 */
class WebSocketConnect extends Component {

  componentWillReceiveProps(nextProps) {
    const { dispatch, chat: { message } } = nextProps;
    if (message && message.length > 0) {
      this._connection.send(message);
      dispatch(sentMessage());
    }
  }

  render() {
    return <div />;
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this._connection = new WebSocket('ws://localhost:3000');
    this._connection.addEventListener('message', e => {
      const { data } = e;
      dispatch({
        type: RECEIVED_MESSAGE,
        receivedMessage: data
      });
    }, false);
    dispatch(openSocket());
  }
}


class ChatFrom extends Component {

  constructor(props, context, updater) {
    super(props, context, updater);
    this.state = {
      message: ''
    };
  }

  render() {
    const { message } = this.state;
    return (
      <form onSubmit={this.onFormSubmit.bind(this)}>
        <input type="text" name="message" value={message} onChange={this.onFieldChange.bind(this)} />
        <button type="submit">送信</button>
      </form>
    );
  }

  onFormSubmit(e) {
    e.preventDefault();
    this.props.dispatch(sendMessage(this.state.message));
    this.setState({
      message: ''
    });
  }

  onFieldChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  }
}

class ChatLogList extends Component {
  render() {
    const { log } = this.props.chat;
    const logItems = log.map((row, index) => {
      return <li key={index}>{row}</li>;
    });
    return (
      <ul>{logItems}</ul>
    );
  }
}


/**
 * Container
 */
class App extends Component {
  render() {
    const props = this.props;
    return (
      <div>
        <h1>WebSocket Sample</h1>
        <ChatFrom {...props} />
        <ChatLogList {...props} />
        <WebSocketConnect {...props} />
      </div>
    );
  }
}


/**
 * EntryPoint
 */
const ConnectedApp = connect(state => state)(App);

render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('app')
);
