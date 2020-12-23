import React, { Component } from 'react';

const Context = React.createContext();
export const ContextMessageConsumer = Context.Consumer;

class MessageProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      addMessage: message => this.handleAddMessage(message),
      clearMessages: () => this.handleClearMessages(),
    };
  }

  handleAddMessage = message => {
    this.setState({
      messages: [message]
    })
    setTimeout(() => {
      this.handleClearMessages();
    }, 3000)
  }

  handleClearMessages = () => {
    this.setState({
      messages: []
    })
  }

  render(){
    return (
      <Context.Provider value={this.state}>
        {this.props.children}
      </Context.Provider>
    );
  }

}

export default MessageProvider;

