import { schemaMap } from './schemas'
import { FunctionInputKind } from './types'
import { encodeReplacementPattern, encodeSell } from './utils'

describe('nft utils', () => {
  it('Should correctly encode replacement patterns for ERC1155 safeTransferFrom function calls.', () => {
    const correctSalePattern =
      '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    const encodeReplacementPatternOutput = encodeReplacementPattern(
      schemaMap.ERC1155.functions.transfer({
        address: '0x0000000000000000000000000000000000000000',
        id: '71233828018837041171392158059738422347218967485013419437723375284353941635073',
        quantity: '1'
      }),
      FunctionInputKind.Replaceable,
      true
    )
    expect(encodeReplacementPatternOutput).toBe(correctSalePattern)
  })

  it('Should correctly encode calldata for an ERC1155 safeTransferFrom function call.', () => {
    const correctCalData =
      '0xf242432a0000000000000000000000009e38f81217f693367f03e7bbd583fdea1ee297e300000000000000000000000000000000000000000000000000000000000000009d7ceafa3eab6d1ffd5fd95801f106f7d19167e80000000000003e0000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000'
    const encodeSellOrderOutput = encodeSell(
      schemaMap.ERC1155,
      {
        asset_contract: {
          address: '0x495f947276749ce646f68ac8c248420045cb7b5e'
        },
        token_id: '71233828018837041171392158059738422347218967485013419437723375284353941635073'
      },
      '0x9e38F81217F693367F03e7bbd583fDEA1eE297E3'
    )
    expect(encodeSellOrderOutput.calldata).toBe(correctCalData)
  })
})
