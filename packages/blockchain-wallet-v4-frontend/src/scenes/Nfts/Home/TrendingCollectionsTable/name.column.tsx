import React from 'react'
import { FormattedMessage } from 'react-intl'
import styled from 'styled-components'

import { CellHeaderText, CellText } from 'components/Table'
import { actions } from 'data'
import { useMedia } from 'services/styles'

const NameCell = styled(CellText)<{ role: 'button' }>`
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
`
const Logo = styled.img`
  height: 30px;
  width: 30px;
  border-radius: 50%;
  margin-right: 8px;
`

export const getNameColumn = (routerActions: typeof actions.router) => ({
  Cell: ({ row: { original: values } }) => {
    const isMobile = useMedia('mobile')
    const isTablet = useMedia('tablet')
    return (
      <NameCell
        cursor='pointer'
        role='button'
        onClick={() => routerActions.push(`/nfts/collection/${values.slug}`)}
      >
        <Logo src={values.image_url} />
        {isMobile || isTablet
          ? values.name.length < 14
            ? values.name
            : `${values.name.slice(0, 10)}...`
          : values.name.length < 24
          ? values.name
          : `${values.name.slice(0, 20)}...`}
      </NameCell>
    )
  },
  Header: () => (
    <CellHeaderText>
      <FormattedMessage id='copy.collection' defaultMessage='Collection' />
    </CellHeaderText>
  ),
  accessor: 'name',
  disableGlobalFilter: true
})
