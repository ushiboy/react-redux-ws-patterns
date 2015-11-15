import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Provider, connect } from 'react-redux';

/**
 * Action
 */
const OPENED_SOCKET = '@chat/OPENED_SOCKET';
const SEND_MESSAGE = '@chat/SEND_MESSAGE';
const RECEIVED_MESSAGE = '@chat/RECEIVED_MESSAGE';

function openSocket() {
  return dispatch => {
    const connection = new WebSocket('ws://localhost:3000');
    connection.addEventListener('message', e => {
      const { data } = e;
      return dispatch({
        type: RECEIVED_MESSAGE,
        receivedMessage: data
      });
    }, false);

    return dispatch({
      type: OPENED_SOCKET,
      connection
    });
  }
}

function sendMessage(message) {
  return (dispatch, getState) => {
    const { connection } = getState().chat;
    connection.send(message);
    return dispatch({
      type: SEND_MESSAGE,
      message
    });
  };
}


/**
 * Reducer
 */
function chat(state={ log: []}, action) {
  const { log } = state;
  switch(action.type) {
    case SEND_MESSAGE:
      // とりあえずwebsocket経由で返ってきたやつを使うのでaction.messageは無視
      return state;
    case RECEIVED_MESSAGE:
      return Object.assign({}, state, {
        log: [...log, action.receivedMessage]
      });
    case OPENED_SOCKET:
      return Object.assign({}, state, {
        ...action
      });
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
      </div>
    );
  }

  componentDidMount() {
    this.props.dispatch(openSocket());
  }
}


/**
 * EntryPoint
 */
const ConnectedApp = connect(state => {
  // ここでフィルタしてWebSocketのインスタンスがViewに行かないようにする
  const { log } = state.chat;
  return Object.assign({}, state, {
    chat: {
      log
    }
  });
})(App);

render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('app')
);
