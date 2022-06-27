import { OrderWithCounter } from '@opensea/seaport-js/lib/types'

import {
  ExplorerGatewaySearchType,
  NftAsset,
  NftOrder,
  NftUserPreferencesReturnType,
  NftUserPreferencesType,
  OpenSeaStatus,
  SeaportOffersResponseType
} from './types'

export const NFT_ORDER_PAGE_LIMIT = 30

export default ({ apiUrl, get, openSeaApi, post }) => {
  const nftUrl = 'http://localhost:8081/public/nft' // local testnet only
  // const nftUrl = `${apiUrl}/nft-market-api/nft`
  const openSeaUrl = `${openSeaApi}`

  const getNftUserPreferences = (
    jwt: string
  ): { jwt: string; userPrefs: NftUserPreferencesReturnType } => {
    return get({
      endPoint: '/preferences',
      headers: {
        jwt
      },
      ignoreQueryParams: true,
      url: nftUrl
    })
  }

  const setNftUserPreferences = (
    jwt: string,
    userPrefs: NftUserPreferencesType
  ): { jwt: string; userPrefs: NftUserPreferencesReturnType } => {
    return post({
      contentType: 'application/json',
      data: {
        jwt,
        userPrefs
      },
      endPoint: '/preferences',
      ignoreQueryParams: true,
      removeDefaultPostData: true,
      url: nftUrl
    })
  }

  const getOpenSeaOffersV2 = (
    network: 'ethereum' | 'rinkeby',
    asset_contract_address: string,
    token_id: string
  ): SeaportOffersResponseType => {
    return get({
      endPoint: `/v2/orders/${network}/seaport/offers?asset_contract_address=${asset_contract_address}&token_ids=${token_id}`,
      ignoreQueryParams: true,
      url: openSeaUrl
    })
  }

  const getOpenSeaAsset = (
    collection_id: string,
    asset_number: string,
    defaultEthAddr?: string
  ): NftAsset => {
    return get({
      endPoint: `/api/v1/asset/${collection_id}/${asset_number}?include_orders=true${
        defaultEthAddr ? `&account_address=${defaultEthAddr}` : ''
      }`,
      ignoreQueryParams: true,
      url: openSeaUrl
    })
  }

  const getOpenSeaStatus = (): OpenSeaStatus => {
    return get({
      endPoint: `/status`,
      ignoreQueryParams: true,
      url: nftUrl
    })
  }

  const searchNfts = (query: string): ExplorerGatewaySearchType => {
    return post({
      contentType: 'application/json',
      data: {
        query
      },
      endPoint: `/search`,
      ignoreQueryParams: true,
      url: nftUrl
    })
  }

  const postNftOrderV1 = (
    order: NftOrder,
    asset_collection_slug: string,
    guid: string,
    jwt: string
  ) => {
    return post({
      contentType: 'application/json',
      data: { asset_collection_slug, guid, jwt, orderJson: order },
      endPoint: `/order`,
      ignoreQueryParams: true,
      removeDefaultPostData: true,
      url: nftUrl
    })
  }

  const postNftOrderV2 = ({
    guid,
    network,
    order,
    side
  }: {
    guid: string
    network: string
    order: OrderWithCounter
    side: string
  }) => {
    const chain = network === 'rinkeby' ? 'rinkeby' : 'ethereum'
    const sidePath = side === 'ask' ? 'listings' : 'offers'

    return post({
      contentType: 'application/json',
      data: {
        chain,
        guid,
        order,
        protocol: 'seaport',
        sidePath
      },
      endPoint: '/order-v2',
      ignoreQueryParams: true,
      removeDefaultPostData: true,
      url: nftUrl
    })
  }

  return {
    getNftUserPreferences,
    getOpenSeaAsset,
    getOpenSeaOffersV2,
    getOpenSeaStatus,
    postNftOrderV1,
    postNftOrderV2,
    searchNfts,
    setNftUserPreferences
  }
}
