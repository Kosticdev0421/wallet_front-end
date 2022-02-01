import React from 'react'
import styled from 'styled-components'

import { Icon, Link, Text } from 'blockchain-info-components'

import { Props as OwnProps } from '..'

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  border-color: rgb(242, 153, 74);
  background: rgb(239 166 101);
  height: 3em;
  border-radius: 8px;
`
const OpenSeaStatusComponent: React.FC<Props> = (props) => {
  // @ts-ignore
  const seaStatus = props?.openSeaStatus?.status?.status?.description

  return (
    <div>
      {seaStatus !== '' && seaStatus !== 'All Systems Operational' && (
        <ItemWrapper>
          <Icon name='alert' color='white' size='24px' />
          <Text
            style={{
              fontFamily: 'Inter',
              marginBottom: '1px',
              marginLeft: '12px'
            }}
            color='white'
            size='16px'
            weight={600}
          >
            OpenSea is experiencing technical difficulties...
            <Link
              style={{
                color: 'inherit',
                fontFamily: 'Inter',
                marginBottom: '1px',
                marginLeft: '3px',
                textDecoration: 'underline'
              }}
              weight={400}
              size='16px'
              target='_blank'
              href='https://status.opensea.io/'
            >
              status.opensea.io
            </Link>
          </Text>
        </ItemWrapper>
      )}
    </div>
  )
}
type Props = OwnProps

export default OpenSeaStatusComponent
