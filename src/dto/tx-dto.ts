export class BaseTxDto {
  txReceipt: any; // Should be replaced with 'Receipt' type later.
  contractName: string;
  funcName: string;
  input: string;
  value: bigint;
}

export class LBTxDto extends BaseTxDto {
  assetAddress: string;
  amountInWei: bigint;
}

export class PoolV2TxDto extends BaseTxDto {
  assetAAddress: string;
  assetAAmount: bigint;
  assetBAddress: string;
  assetBAmount: bigint;
  liquidityAdded: bigint;
  liquidityRemoved: bigint;
}

export class SwapV2TxDto extends BaseTxDto {
  swapInAddress: string;
  swapInAmount: bigint;
  swapOutAddress: string;
  swapOutAmount: bigint;
}

export class PoolV3TxDto extends BaseTxDto {
  token0: string;
  token1: string;
  tokenId: number;
  liquidity: bigint;
  amount0: bigint;
  amount1: bigint;
}

export class SwapV3TxDto extends BaseTxDto {
  tokenIn: string;
  tokenOut: string;
  path: string;
  amountIn: bigint;
  amountOut: bigint;
}

export class WonderStakingTxDto extends BaseTxDto {
  pid: number;
  toPid: number;
  receiverAddress: string;
  amount: bigint;
  rewardAmount: bigint;
}

export class LiquidStakingTxDto extends BaseTxDto {
  wemixAmount: bigint;
  stWemixAmount: bigint;
}
