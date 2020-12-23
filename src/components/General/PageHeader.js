import React, { Component } from 'react';

class PageHeader extends Component {
  render(){
    return (
      <div className='page-header'>
        <h1 className='page-header__title'>{this.props.title}</h1>
      </div>
    );
  }
}

export default PageHeader;