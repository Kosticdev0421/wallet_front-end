import {
  Icon,
  Image,
  TabMenu,
  TabMenuItem,
  Text
} from 'blockchain-info-components'
import { model } from 'data'
import React, { useState } from 'react'
import styled from 'styled-components'

import { FlyoutWrapper } from 'components/Flyout'
import { Form, InjectedFormProps, reduxForm } from 'redux-form'
import { FormattedMessage } from 'react-intl'
import {
  getCoinFromPair,
  getFiatFromPair
} from 'data/components/simpleBuy/model'
import { Props as OwnProps, SuccessStateType } from '../index'
import { SBPairType } from 'core/types'
import CryptoItem from './CryptoItem'
import SellBanner from './SellBanner'

const { SB_CRYPTO_SELECTION } = model.components.simpleBuy

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 100%;
`
const CloseContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`
const TabsContainer = styled.div`
  margin-top: 36px;
  display: inline-block;
`
const Currencies = styled.div`
  border-top: 1px solid ${props => props.theme.grey000};
`
const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`
const TopText = styled(Text)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`
const SubTitleText = styled(Text)`
  margin-top: 0;
`
const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;

  span {
    margin-left: 8px;
  }
`

export type Props = OwnProps & SuccessStateType

const CryptoSelector: React.FC<InjectedFormProps<{}, Props> &
  Props> = props => {
  const [orderType, setOrderType] = useState(props.orderType)
  const showWelcome = props.isFirstLogin

  const handleSubmit = (pair: SBPairType) => {
    const currentTier = props.userData?.tiers?.current

    // if first time user, send to verify email step which is required future SDD check
    if (!props.emailVerified && currentTier !== 2 && currentTier !== 1) {
      return props.simpleBuyActions.setStep({
        step: 'VERIFY_EMAIL',
        orderType: orderType,
        cryptoCurrency: getCoinFromPair(pair.pair),
        fiatCurrency: getFiatFromPair(pair.pair),
        pair
      })
    }

    // if SDD user has already placed on order, force them to Gold upgrade
    if (currentTier !== 3 && props.sbOrders?.length > 0) {
      return props.simpleBuyActions.setStep({
        step: 'UPGRADE_TO_GOLD'
      })
    }

    // default continue to enter amount step
    return props.simpleBuyActions.setStep({
      step: 'ENTER_AMOUNT',
      orderType: orderType,
      cryptoCurrency: getCoinFromPair(pair.pair),
      fiatCurrency: getFiatFromPair(pair.pair),
      pair
    })
  }

  return (
    <Wrapper>
      <Form>
        <FlyoutWrapper>
          <CloseContainer>
            <Icon
              cursor
              data-e2e='sbCloseModalIcon'
              name='close'
              size='20px'
              color='grey600'
              role='button'
              onClick={props.handleClose}
            />
          </CloseContainer>
          {showWelcome && (
            <Header>
              <Image name='intro-hand' width='28px' height='28px' />
              <Text color='grey600' size='20px' weight={600}>
                <FormattedMessage
                  id='modals.wallet.tour.wallet.tour'
                  defaultMessage='Welcome to Blockchain!'
                />
              </Text>
            </Header>
          )}
          <Top>
            {!showWelcome && (
              <Icon cursor name='cart-filled' size='32px' color='blue600' />
            )}
          </Top>
          {!showWelcome && (
            <>
              <TopText color='grey800' size='20px' weight={600}>
                <FormattedMessage
                  id='modals.simplebuy.cryptoselect'
                  defaultMessage='Buy Crypto. Sell for Cash.'
                />
              </TopText>
              <SubTitleText color='grey600' weight={500}>
                <FormattedMessage
                  id='modals.simplebuy.select_crypto'
                  defaultMessage='Easily buy and sell Crypto straight from your Wallet.'
                />
              </SubTitleText>
            </>
          )}

          {showWelcome && (
            <>
              <TopText color='grey800' size='20px' weight={600}>
                <FormattedMessage
                  id='modals.simplebuy.buy_crypto_now'
                  defaultMessage='Buy Crypto Now'
                />
              </TopText>
              <SubTitleText color='grey600' weight={500}>
                <FormattedMessage
                  id='modals.simplebuy.select_and_verify'
                  defaultMessage='Select the crypto you want to buy, verify your identity and buy crypto.'
                />
              </SubTitleText>
            </>
          )}

          {!showWelcome && (
            <TabsContainer>
              <TabMenu>
                <TabMenuItem
                  role='button'
                  selected={orderType === 'BUY'}
                  onClick={() => {
                    setOrderType('BUY')
                    props.analyticsActions.logEvent('SB_BUY_BUTTON')
                  }}
                  data-e2e='sbBuyButton'
                >
                  <FormattedMessage
                    id='buttons.buy_crypto'
                    defaultMessage='Buy Crypto'
                  />
                </TabMenuItem>
                <TabMenuItem
                  role='button'
                  selected={orderType === 'SELL'}
                  onClick={() => {
                    setOrderType('SELL')
                    props.analyticsActions.logEvent('SB_SELL_BUTTON')
                  }}
                  data-e2e='sbSellButton'
                >
                  <FormattedMessage
                    id='buttons.sell_crypto'
                    defaultMessage='Sell Crypto'
                  />
                </TabMenuItem>
              </TabMenu>
            </TabsContainer>
          )}
        </FlyoutWrapper>
        <Currencies>
          {props.pairs.map((value, index) => (
            <CryptoItem
              key={index}
              orderType={orderType}
              fiat={getFiatFromPair(value.pair)}
              coin={getCoinFromPair(value.pair)}
              onClick={() => handleSubmit(value as SBPairType)}
            />
          ))}
        </Currencies>
      </Form>
      {orderType === 'SELL' && <SellBanner />}
    </Wrapper>
  )
}

export default reduxForm<{}, Props>({
  form: SB_CRYPTO_SELECTION,
  destroyOnUnmount: false
})(CryptoSelector)
