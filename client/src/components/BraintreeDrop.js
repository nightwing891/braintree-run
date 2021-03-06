import React, { Component } from 'react';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';
import braintree from 'braintree-web-drop-in';
import BraintreeDropin from 'braintree-dropin-react';
import BraintreeSubmitButton from './BraintreeSubmitButton';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

class BraintreeDrop extends Component {
  state = {
    loaded: false,
    token: '',
    redirect: false,
    transactionId: '',
  }

  componentDidMount() {
    axios.get('/api/braintree_token')
      .then(res => {
        const { data: token } = res;
        this.setState({ token, loaded: true })
      })
      .catch( () => {
        console.log('Error Setting Up Payments, try again')
      })
  }

  handlePaymentMethod = (payload) => {
    const { amount } = this.props

    axios.post('/api/payment', { amount, ...payload })
      .then(res => {
        const { data: transactionId } = res;
        this.setState({ redirect: true, transactionId})
      })
      .catch( () => {
        console.log('Error Postin Payment, try again')
        window.location.reload();
      })
  }

  onCreate = (instance) => {
    console.log('onCreate')
  }

  onDestroyStart = () => {
    console.log('onDestroyStart')
  }

  onDestroyEnd = () => {
    console.log('onDestroyEnd')
  }

  onError = (error) => {
    console.log('onError', error)
  }

  render() {
    const { loaded, token, redirect, transactionId } = this.state;
    if(redirect)
      return(
        <Redirect to={{
          pathname: '/payment_success',
          state: { amount: this.props.amount, transactionId }
        }}/>
      )
    if(loaded)
      return (
        <Segment basic textAlign='center'>
          <BraintreeDropin
            braintree={braintree}
            authorizationToken={token}
            handlePaymentMethod={this.handlePaymentMethod}
            renderSubmitButton={BraintreeSubmitButton}
            onCreate={this.onCreate}
          onDestroyStart={this.onDestroyStart}
          onDestroyEnd={this.onDestroyEnd}
          onError={this.onError}
          />
        </Segment>
      )
    else
      return (
        <Dimmer active>
          <Loader>Loading Payment Experience. Please Wait...</Loader>
        </Dimmer>
      )
  }

}

export default BraintreeDrop