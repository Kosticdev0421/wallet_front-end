import React from 'react'
import { FormattedMessage } from 'react-intl'
import { LinkContainer } from 'react-router-bootstrap'
import { Cartridge } from '@blockchain-com/components'
import styled from 'styled-components'

import { Icon, TooltipHost, TooltipIcon } from 'blockchain-info-components'
import { ExchangeAuthOriginType } from 'data/types'
import { Destination, MenuIcon, MenuItem, Separator, Wrapper } from 'layouts/Wallet/components'

import { Props } from '.'
import Loading from './CoinList/template.loading'
import Success from './CoinList/template.success'

const HelperTipContainer = styled.div`
  position: relative;
  > div span {
    color: ${(props) => props.theme.grey400};
  }
`
const HelperTip = styled(TooltipHost)`
  position: absolute;
  left: 74px;
  top: -8px;
`
const SeparatorWrapper = styled.div<{ margin?: string }>`
  width: calc(100% - 32px);
  margin: ${(props) => (props.margin ? props.margin : '8px 16px')};
  box-sizing: border-box;
`
const ExchangeNav = styled.div`
  display: flex;
  justify-content: flex-start;
`
const ExchangeMenuItem = styled(MenuItem)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const NewCartridge = styled(Cartridge)`
  color: ${(props) => props.theme.blue600};
  background-color: ${(props) => props.theme.white};
  letter-spacing: 1px;
  margin-left: auto;
  margin-right: -4px;
  padding: 4px 4px;
  border: 1px solid ${(props) => props.theme.grey000};
  border-radius: 4px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
`

export const Divider = (props: { margin?: string }) => (
  <SeparatorWrapper {...props}>
    <Separator />
  </SeparatorWrapper>
)

type OwnProps = {
  exchangeUrl: string
}

const ExchangeNavItem = (props) => (
  <>
    <ExchangeNav>
      <MenuIcon
        className='icon'
        name='blockchain-logo'
        style={{ marginLeft: '-2px' }}
        size='21px'
      />
      <Destination style={{ marginLeft: '2px' }}>
        <FormattedMessage id='copy.exchange' defaultMessage='Exchange' />
      </Destination>
      {props.isExchangeAccountLinked && (
        <HelperTipContainer>
          <HelperTip id='exchangeSideNavConnected'>
            <TooltipIcon color='blue600' name='info' />
          </HelperTip>
        </HelperTipContainer>
      )}
    </ExchangeNav>
    <Icon name='open-in-new-tab' color='grey600' cursor size='16px' />
  </>
)

const DebitCardNavItem = () => (
  <>
    <MenuIcon className='icon' name='credit-card-sb' style={{ marginLeft: '-4px' }} size='21px' />
    <Destination style={{ marginLeft: '2px' }}>
      <FormattedMessage id='copy.debit_card' defaultMessage='Debit Card' />
    </Destination>
  </>
)

const Navigation = (props: OwnProps & Props) => {
  const { coinList, isRedesignEnabled, lockboxDevices, walletDebitCardEnabled, ...rest } = props

  return (
    <Wrapper {...rest}>
      {!isRedesignEnabled && (
        <>
          <Divider />
          <LinkContainer to='/home' activeClassName='active'>
            <MenuItem data-e2e='dashboardLink'>
              <MenuIcon className='icon' name='home' size='24px' />
              <Destination>
                <FormattedMessage id='copy.home' defaultMessage='Home' />
              </Destination>
            </MenuItem>
          </LinkContainer>
          <LinkContainer to='/prices' activeClassName='active'>
            <MenuItem data-e2e='pricesLink'>
              <MenuIcon className='icon' name='compass' size='24px' />
              <Destination>
                <FormattedMessage id='copy.prices' defaultMessage='Prices' />
              </Destination>
            </MenuItem>
          </LinkContainer>
        </>
      )}
      {coinList.cata({
        Failure: () => null,
        Loading: () => <Loading />,
        NotAsked: () => <Loading />,
        Success: (coinList) => <Success coinList={coinList} />
      })}
      <Divider margin='0 16px 8px 16px' />
      {walletDebitCardEnabled && (
        <LinkContainer to='/debitCard' activeClassName='active'>
          <MenuItem data-e2e='debitCardLink'>
            <DebitCardNavItem />
            <NewCartridge style={{ textTransform: 'uppercase' }}>
              <FormattedMessage
                id='layouts.wallet.menuleft.navigation.debit_card.order'
                defaultMessage='order'
              />
            </NewCartridge>
          </MenuItem>
        </LinkContainer>
      )}
      <LinkContainer to='/airdrops' activeClassName='active'>
        <MenuItem data-e2e='airdropLink' className='airdrop'>
          <MenuIcon className='icon' name='parachute' size='24px' />
          <Destination>
            <FormattedMessage
              id='layouts.wallet.menuleft.navigation.airdrops'
              defaultMessage='Airdrops'
            />
          </Destination>
          {/* UNCOMMENT WHEN AIRDROPS ARE IN PROGRESS */}
          {/* <NewCartridge> */}
          {/*  <Text color='green600' size='12' weight={600} uppercase> */}
          {/*    <FormattedMessage */}
          {/*      id='layouts.wallet.menuleft.navigation.airdrop.active' */}
          {/*      defaultMessage='Active' */}
          {/*    /> */}
          {/*  </Text> */}
          {/* </NewCartridge> */}
        </MenuItem>
      </LinkContainer>
      <ExchangeMenuItem
        data-e2e='exchangeLink'
        onClick={() => props.profileActions.getExchangeLoginToken(ExchangeAuthOriginType.SideMenu)}
      >
        <ExchangeNavItem {...props} />
      </ExchangeMenuItem>
      {lockboxDevices?.length > 0 ? (
        <LinkContainer to='/lockbox' activeClassName='active'>
          <MenuItem data-e2e='lockboxLink'>
            <MenuIcon className='icon' name='hardware' style={{ paddingLeft: '2px' }} size='24px' />
            <Destination style={{ marginLeft: '-2px' }}>
              <FormattedMessage
                id='layouts.wallet.menuleft.navigation.hardware'
                defaultMessage='Hardware'
              />
            </Destination>
            <HelperTipContainer>
              <HelperTip id='lockboxRequired'>
                <TooltipIcon color='blue600' name='info' />
              </HelperTip>
            </HelperTipContainer>
          </MenuItem>
        </LinkContainer>
      ) : null}
    </Wrapper>
  )
}

export default Navigation
