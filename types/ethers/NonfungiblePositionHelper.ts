/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "./common";

export declare namespace INonfungiblePositionHelper {
  export type EasyCollectParamsStruct = {
    tokenId: BigNumberish;
    amount0Max: BigNumberish;
    amount1Max: BigNumberish;
  };

  export type EasyCollectParamsStructOutput = [
    tokenId: bigint,
    amount0Max: bigint,
    amount1Max: bigint
  ] & { tokenId: bigint; amount0Max: bigint; amount1Max: bigint };

  export type EasyCompoundParamsStruct = {
    tokenId: BigNumberish;
    amount0CollectMax: BigNumberish;
    amount1CollectMax: BigNumberish;
    amount0LiquidityMin: BigNumberish;
    amount1LiquidityMin: BigNumberish;
    deadline: BigNumberish;
  };

  export type EasyCompoundParamsStructOutput = [
    tokenId: bigint,
    amount0CollectMax: bigint,
    amount1CollectMax: bigint,
    amount0LiquidityMin: bigint,
    amount1LiquidityMin: bigint,
    deadline: bigint
  ] & {
    tokenId: bigint;
    amount0CollectMax: bigint;
    amount1CollectMax: bigint;
    amount0LiquidityMin: bigint;
    amount1LiquidityMin: bigint;
    deadline: bigint;
  };

  export type EasyDecreaseLiquidityAllCollectAllBurnParamsStruct = {
    tokenId: BigNumberish;
    deadline: BigNumberish;
  };

  export type EasyDecreaseLiquidityAllCollectAllBurnParamsStructOutput = [
    tokenId: bigint,
    deadline: bigint
  ] & { tokenId: bigint; deadline: bigint };

  export type EasyDecreaseLiquidityCollectParamsStruct = {
    tokenId: BigNumberish;
    liquidity: BigNumberish;
    amount0LiquidityMin: BigNumberish;
    amount1LiquidityMin: BigNumberish;
    amount0CollectMax: BigNumberish;
    amount1CollectMax: BigNumberish;
    deadline: BigNumberish;
  };

  export type EasyDecreaseLiquidityCollectParamsStructOutput = [
    tokenId: bigint,
    liquidity: bigint,
    amount0LiquidityMin: bigint,
    amount1LiquidityMin: bigint,
    amount0CollectMax: bigint,
    amount1CollectMax: bigint,
    deadline: bigint
  ] & {
    tokenId: bigint;
    liquidity: bigint;
    amount0LiquidityMin: bigint;
    amount1LiquidityMin: bigint;
    amount0CollectMax: bigint;
    amount1CollectMax: bigint;
    deadline: bigint;
  };

  export type EasyDecreaseLiquidityCollectAllParamsStruct = {
    tokenId: BigNumberish;
    liquidity: BigNumberish;
    amount0LiquidityMin: BigNumberish;
    amount1LiquidityMin: BigNumberish;
    deadline: BigNumberish;
  };

  export type EasyDecreaseLiquidityCollectAllParamsStructOutput = [
    tokenId: bigint,
    liquidity: bigint,
    amount0LiquidityMin: bigint,
    amount1LiquidityMin: bigint,
    deadline: bigint
  ] & {
    tokenId: bigint;
    liquidity: bigint;
    amount0LiquidityMin: bigint;
    amount1LiquidityMin: bigint;
    deadline: bigint;
  };

  export type EasyIncreaseLiquidityCollectParamsStruct = {
    tokenId: BigNumberish;
    amount0Desired: BigNumberish;
    amount1Desired: BigNumberish;
    amount0LiquidityMin: BigNumberish;
    amount1LiquidityMin: BigNumberish;
    deadline: BigNumberish;
    amount0CollectMax: BigNumberish;
    amount1CollectMax: BigNumberish;
  };

  export type EasyIncreaseLiquidityCollectParamsStructOutput = [
    tokenId: bigint,
    amount0Desired: bigint,
    amount1Desired: bigint,
    amount0LiquidityMin: bigint,
    amount1LiquidityMin: bigint,
    deadline: bigint,
    amount0CollectMax: bigint,
    amount1CollectMax: bigint
  ] & {
    tokenId: bigint;
    amount0Desired: bigint;
    amount1Desired: bigint;
    amount0LiquidityMin: bigint;
    amount1LiquidityMin: bigint;
    deadline: bigint;
    amount0CollectMax: bigint;
    amount1CollectMax: bigint;
  };

  export type EasyIncreaseLiquidityCompoundParamsStruct = {
    tokenId: BigNumberish;
    amount0LiquidityDesired: BigNumberish;
    amount1LiquidityDesired: BigNumberish;
    amount0LiquidityMin: BigNumberish;
    amount1LiquidityMin: BigNumberish;
    amount0CollectMax: BigNumberish;
    amount1CollectMax: BigNumberish;
    deadline: BigNumberish;
  };

  export type EasyIncreaseLiquidityCompoundParamsStructOutput = [
    tokenId: bigint,
    amount0LiquidityDesired: bigint,
    amount1LiquidityDesired: bigint,
    amount0LiquidityMin: bigint,
    amount1LiquidityMin: bigint,
    amount0CollectMax: bigint,
    amount1CollectMax: bigint,
    deadline: bigint
  ] & {
    tokenId: bigint;
    amount0LiquidityDesired: bigint;
    amount1LiquidityDesired: bigint;
    amount0LiquidityMin: bigint;
    amount1LiquidityMin: bigint;
    amount0CollectMax: bigint;
    amount1CollectMax: bigint;
    deadline: bigint;
  };

  export type EasyMintParamsStruct = {
    token0: AddressLike;
    token1: AddressLike;
    fee: BigNumberish;
    tickLower: BigNumberish;
    tickUpper: BigNumberish;
    amount0Desired: BigNumberish;
    amount1Desired: BigNumberish;
    amount0Min: BigNumberish;
    amount1Min: BigNumberish;
    deadline: BigNumberish;
  };

  export type EasyMintParamsStructOutput = [
    token0: string,
    token1: string,
    fee: bigint,
    tickLower: bigint,
    tickUpper: bigint,
    amount0Desired: bigint,
    amount1Desired: bigint,
    amount0Min: bigint,
    amount1Min: bigint,
    deadline: bigint
  ] & {
    token0: string;
    token1: string;
    fee: bigint;
    tickLower: bigint;
    tickUpper: bigint;
    amount0Desired: bigint;
    amount1Desired: bigint;
    amount0Min: bigint;
    amount1Min: bigint;
    deadline: bigint;
  };

  export type EasyStrategyChangeAllStruct = {
    tokenId: BigNumberish;
    fee: BigNumberish;
    tickLower: BigNumberish;
    tickUpper: BigNumberish;
    amount0MintDesired: BigNumberish;
    amount1MintDesired: BigNumberish;
    amount0MintMin: BigNumberish;
    amount1MintMin: BigNumberish;
    deadline: BigNumberish;
  };

  export type EasyStrategyChangeAllStructOutput = [
    tokenId: bigint,
    fee: bigint,
    tickLower: bigint,
    tickUpper: bigint,
    amount0MintDesired: bigint,
    amount1MintDesired: bigint,
    amount0MintMin: bigint,
    amount1MintMin: bigint,
    deadline: bigint
  ] & {
    tokenId: bigint;
    fee: bigint;
    tickLower: bigint;
    tickUpper: bigint;
    amount0MintDesired: bigint;
    amount1MintDesired: bigint;
    amount0MintMin: bigint;
    amount1MintMin: bigint;
    deadline: bigint;
  };

  export type IncreaseLiquidityParamsStruct = {
    tokenId: BigNumberish;
    amount0Desired: BigNumberish;
    amount1Desired: BigNumberish;
    amount0Min: BigNumberish;
    amount1Min: BigNumberish;
    deadline: BigNumberish;
  };

  export type IncreaseLiquidityParamsStructOutput = [
    tokenId: bigint,
    amount0Desired: bigint,
    amount1Desired: bigint,
    amount0Min: bigint,
    amount1Min: bigint,
    deadline: bigint
  ] & {
    tokenId: bigint;
    amount0Desired: bigint;
    amount1Desired: bigint;
    amount0Min: bigint;
    amount1Min: bigint;
    deadline: bigint;
  };
}

export interface NonfungiblePositionHelperInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "WWEMIX"
      | "approveTokens"
      | "denylistContract"
      | "easyCollect"
      | "easyCompound"
      | "easyDecreaseLiquidityAllCollectAllBurn"
      | "easyDecreaseLiquidityCollect"
      | "easyDecreaseLiquidityCollectAll"
      | "easyIncreaseLiquidityCollect"
      | "easyIncreaseLiquidityCompound"
      | "easyMint"
      | "easyStrategyChangeAll"
      | "factory"
      | "increaseLiquidity"
      | "initialize"
      | "manager"
      | "refundWEMIX"
      | "sweepToken"
      | "unwrapWWEMIX"
      | "wrapWWEMIX"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "WWEMIX", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "approveTokens",
    values: [AddressLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "denylistContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "easyCollect",
    values: [INonfungiblePositionHelper.EasyCollectParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "easyCompound",
    values: [INonfungiblePositionHelper.EasyCompoundParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "easyDecreaseLiquidityAllCollectAllBurn",
    values: [
      INonfungiblePositionHelper.EasyDecreaseLiquidityAllCollectAllBurnParamsStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "easyDecreaseLiquidityCollect",
    values: [
      INonfungiblePositionHelper.EasyDecreaseLiquidityCollectParamsStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "easyDecreaseLiquidityCollectAll",
    values: [
      INonfungiblePositionHelper.EasyDecreaseLiquidityCollectAllParamsStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "easyIncreaseLiquidityCollect",
    values: [
      INonfungiblePositionHelper.EasyIncreaseLiquidityCollectParamsStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "easyIncreaseLiquidityCompound",
    values: [
      INonfungiblePositionHelper.EasyIncreaseLiquidityCompoundParamsStruct
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "easyMint",
    values: [INonfungiblePositionHelper.EasyMintParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "easyStrategyChangeAll",
    values: [INonfungiblePositionHelper.EasyStrategyChangeAllStruct]
  ): string;
  encodeFunctionData(functionFragment: "factory", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "increaseLiquidity",
    values: [INonfungiblePositionHelper.IncreaseLiquidityParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [AddressLike, AddressLike, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "manager", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "refundWEMIX",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "sweepToken",
    values: [AddressLike, BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "unwrapWWEMIX",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "wrapWWEMIX",
    values: [BigNumberish, AddressLike]
  ): string;

  decodeFunctionResult(functionFragment: "WWEMIX", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "approveTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "denylistContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "easyCollect",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "easyCompound",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "easyDecreaseLiquidityAllCollectAllBurn",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "easyDecreaseLiquidityCollect",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "easyDecreaseLiquidityCollectAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "easyIncreaseLiquidityCollect",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "easyIncreaseLiquidityCompound",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "easyMint", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "easyStrategyChangeAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "factory", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "increaseLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "manager", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "refundWEMIX",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "sweepToken", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "unwrapWWEMIX",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "wrapWWEMIX", data: BytesLike): Result;
}

export interface NonfungiblePositionHelper extends BaseContract {
  connect(runner?: ContractRunner | null): NonfungiblePositionHelper;
  waitForDeployment(): Promise<this>;

  interface: NonfungiblePositionHelperInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  WWEMIX: TypedContractMethod<[], [string], "view">;

  approveTokens: TypedContractMethod<
    [tokens: AddressLike[]],
    [void],
    "nonpayable"
  >;

  denylistContract: TypedContractMethod<[], [string], "view">;

  easyCollect: TypedContractMethod<
    [params: INonfungiblePositionHelper.EasyCollectParamsStruct],
    [[bigint, bigint] & { amount0: bigint; amount1: bigint }],
    "payable"
  >;

  easyCompound: TypedContractMethod<
    [params: INonfungiblePositionHelper.EasyCompoundParamsStruct],
    [
      [bigint, bigint, bigint] & {
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;

  easyDecreaseLiquidityAllCollectAllBurn: TypedContractMethod<
    [
      params: INonfungiblePositionHelper.EasyDecreaseLiquidityAllCollectAllBurnParamsStruct
    ],
    [void],
    "payable"
  >;

  easyDecreaseLiquidityCollect: TypedContractMethod<
    [
      params: INonfungiblePositionHelper.EasyDecreaseLiquidityCollectParamsStruct
    ],
    [[bigint, bigint] & { amount0: bigint; amount1: bigint }],
    "payable"
  >;

  easyDecreaseLiquidityCollectAll: TypedContractMethod<
    [
      params: INonfungiblePositionHelper.EasyDecreaseLiquidityCollectAllParamsStruct
    ],
    [[bigint, bigint] & { amount0: bigint; amount1: bigint }],
    "payable"
  >;

  easyIncreaseLiquidityCollect: TypedContractMethod<
    [
      params: INonfungiblePositionHelper.EasyIncreaseLiquidityCollectParamsStruct
    ],
    [
      [bigint, bigint, bigint] & {
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;

  easyIncreaseLiquidityCompound: TypedContractMethod<
    [
      params: INonfungiblePositionHelper.EasyIncreaseLiquidityCompoundParamsStruct
    ],
    [
      [bigint, bigint, bigint] & {
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;

  easyMint: TypedContractMethod<
    [params: INonfungiblePositionHelper.EasyMintParamsStruct],
    [
      [bigint, bigint, bigint, bigint] & {
        tokenId: bigint;
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;

  easyStrategyChangeAll: TypedContractMethod<
    [params: INonfungiblePositionHelper.EasyStrategyChangeAllStruct],
    [
      [bigint, bigint, bigint, bigint] & {
        tokenId: bigint;
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;

  factory: TypedContractMethod<[], [string], "view">;

  increaseLiquidity: TypedContractMethod<
    [params: INonfungiblePositionHelper.IncreaseLiquidityParamsStruct],
    [
      [bigint, bigint, bigint] & {
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;

  initialize: TypedContractMethod<
    [
      _factory: AddressLike,
      _WWEMIX: AddressLike,
      _manager: AddressLike,
      _denylistContract: AddressLike
    ],
    [void],
    "nonpayable"
  >;

  manager: TypedContractMethod<[], [string], "view">;

  refundWEMIX: TypedContractMethod<[], [void], "payable">;

  sweepToken: TypedContractMethod<
    [token: AddressLike, amountMinimum: BigNumberish, recipient: AddressLike],
    [void],
    "payable"
  >;

  unwrapWWEMIX: TypedContractMethod<
    [amountMinimum: BigNumberish, recipient: AddressLike],
    [void],
    "payable"
  >;

  wrapWWEMIX: TypedContractMethod<
    [amountMinimum: BigNumberish, recipient: AddressLike],
    [void],
    "payable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "WWEMIX"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "approveTokens"
  ): TypedContractMethod<[tokens: AddressLike[]], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "denylistContract"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "easyCollect"
  ): TypedContractMethod<
    [params: INonfungiblePositionHelper.EasyCollectParamsStruct],
    [[bigint, bigint] & { amount0: bigint; amount1: bigint }],
    "payable"
  >;
  getFunction(
    nameOrSignature: "easyCompound"
  ): TypedContractMethod<
    [params: INonfungiblePositionHelper.EasyCompoundParamsStruct],
    [
      [bigint, bigint, bigint] & {
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;
  getFunction(
    nameOrSignature: "easyDecreaseLiquidityAllCollectAllBurn"
  ): TypedContractMethod<
    [
      params: INonfungiblePositionHelper.EasyDecreaseLiquidityAllCollectAllBurnParamsStruct
    ],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "easyDecreaseLiquidityCollect"
  ): TypedContractMethod<
    [
      params: INonfungiblePositionHelper.EasyDecreaseLiquidityCollectParamsStruct
    ],
    [[bigint, bigint] & { amount0: bigint; amount1: bigint }],
    "payable"
  >;
  getFunction(
    nameOrSignature: "easyDecreaseLiquidityCollectAll"
  ): TypedContractMethod<
    [
      params: INonfungiblePositionHelper.EasyDecreaseLiquidityCollectAllParamsStruct
    ],
    [[bigint, bigint] & { amount0: bigint; amount1: bigint }],
    "payable"
  >;
  getFunction(
    nameOrSignature: "easyIncreaseLiquidityCollect"
  ): TypedContractMethod<
    [
      params: INonfungiblePositionHelper.EasyIncreaseLiquidityCollectParamsStruct
    ],
    [
      [bigint, bigint, bigint] & {
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;
  getFunction(
    nameOrSignature: "easyIncreaseLiquidityCompound"
  ): TypedContractMethod<
    [
      params: INonfungiblePositionHelper.EasyIncreaseLiquidityCompoundParamsStruct
    ],
    [
      [bigint, bigint, bigint] & {
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;
  getFunction(
    nameOrSignature: "easyMint"
  ): TypedContractMethod<
    [params: INonfungiblePositionHelper.EasyMintParamsStruct],
    [
      [bigint, bigint, bigint, bigint] & {
        tokenId: bigint;
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;
  getFunction(
    nameOrSignature: "easyStrategyChangeAll"
  ): TypedContractMethod<
    [params: INonfungiblePositionHelper.EasyStrategyChangeAllStruct],
    [
      [bigint, bigint, bigint, bigint] & {
        tokenId: bigint;
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;
  getFunction(
    nameOrSignature: "factory"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "increaseLiquidity"
  ): TypedContractMethod<
    [params: INonfungiblePositionHelper.IncreaseLiquidityParamsStruct],
    [
      [bigint, bigint, bigint] & {
        liquidity: bigint;
        amount0: bigint;
        amount1: bigint;
      }
    ],
    "payable"
  >;
  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<
    [
      _factory: AddressLike,
      _WWEMIX: AddressLike,
      _manager: AddressLike,
      _denylistContract: AddressLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "manager"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "refundWEMIX"
  ): TypedContractMethod<[], [void], "payable">;
  getFunction(
    nameOrSignature: "sweepToken"
  ): TypedContractMethod<
    [token: AddressLike, amountMinimum: BigNumberish, recipient: AddressLike],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "unwrapWWEMIX"
  ): TypedContractMethod<
    [amountMinimum: BigNumberish, recipient: AddressLike],
    [void],
    "payable"
  >;
  getFunction(
    nameOrSignature: "wrapWWEMIX"
  ): TypedContractMethod<
    [amountMinimum: BigNumberish, recipient: AddressLike],
    [void],
    "payable"
  >;

  filters: {};
}