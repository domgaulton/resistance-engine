import React, { Component } from 'react';
import { ContextMessageConsumer } from "../../context/ContextMessageProvider";

class MessageBanner extends Component {
  render(){
    return (
      <div className={`message-banner ${this.props.messages.length ? 'message-banner--showing' : ''}`}>
        <div className="message-banner__content">
          {this.props.messages}
          <button className="message-banner__close" onClick={this.props.clearMessages}><i className="material-icons">close</i></button>
        </div>

      </div>
    );
  }
}

const MessageBannerUpdate = (props) => (
  <ContextMessageConsumer>
    {({ messages, clearMessages }) => (
      <MessageBanner
        // remember to spread the existing props otherwise you lose any new ones e.g. 'something' that don't come from the provider
        {...props}
        messages={messages}
        clearMessages={clearMessages}
      />
    )}
  </ContextMessageConsumer>
);

export default MessageBannerUpdate;