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

export class PoolTxDto extends BaseTxDto {
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