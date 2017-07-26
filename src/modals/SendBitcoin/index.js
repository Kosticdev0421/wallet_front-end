import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, compose } from 'redux'
import { actions as reduxFormActions, formValueSelector } from 'redux-form'
import { isNil, equals } from 'ramda'

import { wizardForm } from 'components/providers/FormProvider'
import { actions, selectors } from 'data'
import FirstStep from './FirstStep'

class SendBitcoinContainer extends React.Component {
  componentWillReceiveProps (nextProps) {
    if (!isNil(nextProps.feeValues) && !equals(nextProps.feeValues, this.props.feeValues)) {
      this.props.reduxFormActions.change('sendBitcoin', 'fee', nextProps.feeValues.regular)
    }
  }

  componentWillMount () {
    this.props.reduxFormActions.initialize('sendBitcoin', this.props.initialValues)
    this.props.feeActions.fetchFee()
  }

  render () {
    const { step, ...rest } = this.props

    switch (step) {
      default:
        return <FirstStep {...rest} />
    }
  }

  componentWillUnmount () {
    this.props.feeActions.deleteFee()
  }
}

const mapStateToProps = (state, ownProps) => {
  const selector = formValueSelector('sendBitcoin')
  const initialValues = {
    from: {
      xpub: selectors.core.wallet.getDefaultAccountXpub(state),
      index: selectors.core.wallet.getDefaultAccountIndex(state)
    }
  }
  return {
    initialValues,
    feeValues: selectors.core.fee.getFee(state),
    fee: selector(state, 'fee'),
    to: selector(state, 'to'),
    from: selector(state, 'from'),
    amount: selector(state, 'amount'),
    effectiveBalance: selector(state, 'effetiveBalance'),
    message: selector(state, 'message')
  }
}

const mapDispatchToProps = (dispatch) => ({
  feeActions: bindActionCreators(actions.core.fee, dispatch),
  modalActions: bindActionCreators(actions.modals, dispatch),
  paymentActions: bindActionCreators(actions.core.payment, dispatch),
  reduxFormActions: bindActionCreators(reduxFormActions, dispatch),
  transactionActions: bindActionCreators(actions.core.transactions, dispatch)
})

const enhance = compose(
  wizardForm('sendBitcoin', 2),
  connect(mapStateToProps, mapDispatchToProps)
)

export default enhance(SendBitcoinContainer)
