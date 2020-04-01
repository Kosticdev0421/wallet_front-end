import { actions } from 'data'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { getData } from './selectors'
import {
  LoanType,
  NabuApiErrorType,
  OfferType,
  RemoteDataType,
  SupportedCoinsType
} from 'core/types'
import { RatesType, UserDataType } from 'data/types'
import React, { Component } from 'react'
import styled from 'styled-components'
import Success from './template.success'

const History = styled.div`
  margin-top: 72px;
  max-width: 1200px;
`

export type SuccessStateType = {
  borrowHistory: Array<LoanType>
  offers: Array<OfferType>
  rates: RatesType
  showLoanDetails: (loan: LoanType, offer: OfferType) => void
  supportedCoins: SupportedCoinsType
  userData: UserDataType
}
type LinkStatePropsType = {
  data: RemoteDataType<NabuApiErrorType, SuccessStateType>
}
export type LinkDispatchPropsType = {
  borrowActions: typeof actions.components.borrow
  modalActions: typeof actions.modals
}
type Props = LinkStatePropsType & LinkDispatchPropsType

class BorrowHistory extends Component<Props> {
  state = {}

  showLoanDetails = (loan: LoanType, offer: OfferType) => {
    this.props.borrowActions.setStep({ step: 'DETAILS', loan, offer })
    this.props.modalActions.showModal('BORROW_MODAL')
  }

  render () {
    return (
      <History>
        {this.props.data.cata({
          Success: val => (
            <Success {...val} showLoanDetails={this.showLoanDetails} />
          ),
          Failure: () => null,
          Loading: () => null,
          NotAsked: () => null
        })}
      </History>
    )
  }
}

const mapStateToProps = (state): LinkStatePropsType => ({
  data: getData(state)
})

const mapDispatchToProps = (dispatch: Dispatch): LinkDispatchPropsType => ({
  borrowActions: bindActionCreators(actions.components.borrow, dispatch),
  modalActions: bindActionCreators(actions.modals, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BorrowHistory)
