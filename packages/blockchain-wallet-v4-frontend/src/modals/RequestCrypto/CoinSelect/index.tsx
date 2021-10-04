import React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect, ConnectedProps } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList as List } from 'react-window'
import { bindActionCreators, compose } from 'redux'
import { Field } from 'redux-form'
import styled from 'styled-components'

import { Icon, Text } from 'blockchain-info-components'
import { StickyHeaderFlyoutWrapper } from 'components/Flyout'
import { StepHeader } from 'components/Flyout/SendRequestCrypto'
import { CoinAccountListOption, TextBox } from 'components/Form'
import { actions } from 'data'
import { SwapAccountType, SwapBaseCounterTypes } from 'data/components/swap/types'

import { Props as OwnProps } from '..'
import { REQUEST_FORM } from '../model'
import { RequestSteps } from '../types'
import { getData } from './selectors'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  .coin-account-option {
    border-top: ${(props) => `1px solid ${props.theme.grey000}`};
  }
`
const Header = styled(StepHeader)`
  margin-bottom: 40px;
`
const HeaderContent = styled.div`
  position: relative;
`
const ResultsText = styled(Text)`
  position: absolute;
  bottom: -24px;
  left: 0;
`
const InputContainer = styled.div`
  margin-top: 24px;
  position: relative;
`
const StyledIcon = styled(Icon)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
`
const NoAccountsText = styled.div`
  border-top: ${(props) => `1px solid ${props.theme.grey000}`};
  padding: 40px 40px 0;
  text-align: center;
`
class RequestCoinSelect extends React.PureComponent<Props> {
  render() {
    const { data, formActions, formValues, handleClose, setStep, walletCurrency } = this.props

    const Row = ({ data: rowData, index, key, style }) => {
      const account = rowData[index]

      return (
        <div style={style}>
          <CoinAccountListOption
            key={key}
            account={account}
            coin={account.coin}
            onClick={() => {
              if (account.type === SwapBaseCounterTypes.CUSTODIAL && !data.isAtLeastTier1) {
                setStep(RequestSteps.IDV_INTRO)
              } else {
                formActions.change(REQUEST_FORM, 'selectedAccount', account)
                formActions.change(REQUEST_FORM, 'step', RequestSteps.SHOW_ADDRESS)
              }
            }}
            walletCurrency={walletCurrency}
          />
        </div>
      )
    }

    return (
      <Wrapper>
        <StickyHeaderFlyoutWrapper>
          <Header spaceBetween>
            <Icon name='arrow-bottom-right' color='blue600' size='24px' />
            <Icon
              name='close'
              color='grey600'
              role='button'
              data-e2e='close'
              size='24px'
              cursor
              onClick={handleClose}
            />
          </Header>
          <HeaderContent>
            <Text size='24px' color='grey900' weight={600}>
              <FormattedMessage
                id='modals.requestcrypto.coinselect.title'
                defaultMessage='Receive Crypto'
              />
            </Text>
            <Text size='16px' color='grey600' weight={500} style={{ marginTop: '10px' }}>
              <FormattedMessage
                id='modals.requestcrypto.coinselect.subtitle'
                defaultMessage='Select and share your address or QR code to receive crypto from anyone around the world.'
              />
            </Text>
            <InputContainer>
              <Field name='coinSearch' type='text' placeholder='Search' component={TextBox} />
              <StyledIcon color='grey200' name='magnifier' />
            </InputContainer>
            {formValues.coinSearch && (
              <ResultsText size='12px' color='grey600' weight={600}>
                {data.accounts.length ? (
                  <>
                    {data.accounts.length}{' '}
                    <FormattedMessage id='copy.results' defaultMessage='Results' />
                  </>
                ) : (
                  <FormattedMessage id='copy.no_results' defaultMessage='No Results' />
                )}
              </ResultsText>
            )}
          </HeaderContent>
        </StickyHeaderFlyoutWrapper>
        <AutoSizer>
          {({ height, width }) => (
            <List
              className='List'
              height={height}
              itemData={data.accounts}
              itemCount={data.accounts.length}
              itemSize={74}
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
        {data.accounts.length === 0 && (
          <NoAccountsText>
            <Text size='16px' color='grey900' weight={500} style={{ marginTop: '10px' }}>
              <FormattedMessage
                id='modals.requestcrypto.coinselect.noaccounts'
                defaultMessage='Currently there are no receivable accounts for the selected crypto.'
              />
            </Text>
          </NoAccountsText>
        )}
      </Wrapper>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  data: getData(state, ownProps)
})

const mapDispatchToProps = (dispatch) => ({
  modalActions: bindActionCreators(actions.modals, dispatch)
})

const connector = connect(mapStateToProps, mapDispatchToProps)
const enhance = compose(connector)

type Props = ConnectedProps<typeof connector> &
  OwnProps & {
    handleAccountChange: (account: SwapAccountType) => void
    handleClose: () => void
    setStep: (step: RequestSteps) => void
  }

export default enhance(RequestCoinSelect)
