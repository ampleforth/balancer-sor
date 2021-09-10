import { assert } from 'chai';
import cloneDeep from 'lodash.clonedeep';
import {
    PoolDictionary,
    NewPath,
    SwapTypes,
    PoolDictionaryByMain,
} from '../src/types';
import {
    filterPoolsOfInterest,
    filterHopPools,
    getPathsUsingLinearPools,
} from '../src/routeProposal/filtering';
import { calculatePathLimits } from '../src/routeProposal/pathLimits';
import BigNumber from 'bignumber.js';
import { formatSwaps } from '../src/formatSwaps';

import subgraphPoolsLargeLinear from './testData/linearPools/subgraphPoolsLargeLinear.json';
import singleLinear from './testData/linearPools/singleLinear.json';
import { MetaStablePool } from '../src/pools/metaStablePool/metaStablePool';
import { bnum } from '../src/index';
import { getBestPaths } from '../src/router';

const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase();
const aDAI = '0xfc1e690f61efd961294b3e1ce3313fbd8aa4f85d';

describe('Linear pools tests', () => {
    it('trivial check', async () => {
        const tokenIn = DAI;
        const tokenOut = WETH;
        const swapType = SwapTypes.SwapExactIn;
        // Opción que va: DAI - USDC - 100
        const swapAmount = new BigNumber(0.1);
        const chainId = 1;

        // let paths: NewPath[], marketSp: BigNumber;
        const maxPools = 10; //
        let pools: PoolDictionary;
        let hopTokens: string[];
        let linearPoolsInfo: [PoolDictionaryByMain, MetaStablePool];
        [pools, hopTokens, linearPoolsInfo] = filterPoolsOfInterest(
            cloneDeep(subgraphPoolsLargeLinear.pools),
            tokenIn,
            tokenOut,
            maxPools,
            chainId
        );
        let pathData: NewPath[];

        [pools, pathData] = filterHopPools(tokenIn, tokenOut, hopTokens, pools);
        const pathsUsingLinear = getPathsUsingLinearPools(
            tokenIn,
            tokenOut,
            linearPoolsInfo,
            pools
        );
        pathData = pathData.concat(pathsUsingLinear);
        const [paths] = calculatePathLimits(pathData, swapType);

        let swaps: any,
            total: BigNumber,
            totalConsideringFees: BigNumber,
            marketSp: BigNumber;
        [swaps, total, marketSp, totalConsideringFees] = getBestPaths(
            cloneDeep(pools), // Need to keep original pools for cache
            paths,
            swapType,
            swapAmount,
            maxPools,
            bnum(10) // costReturnToken
        );
        console.log(swaps);

        const swapInfo = formatSwaps(
            swaps,
            swapType,
            swapAmount,
            tokenIn,
            tokenOut,
            total,
            totalConsideringFees,
            marketSp
        );

        console.log(swapInfo.swaps);
        console.log(swapInfo.tokenAddresses);
    });

    it('token > token test', async () => {
        const tokenIn = DAI;
        const tokenOut = aDAI;
        const swapType = SwapTypes.SwapExactIn;
        const swapAmount = new BigNumber(10);
        const chainId = 1;

        // let paths: NewPath[], marketSp: BigNumber;
        const maxPools = 10; //
        let pools: PoolDictionary;
        let hopTokens: string[];
        let linearPoolsInfo: [PoolDictionaryByMain, MetaStablePool];
        [pools, hopTokens, linearPoolsInfo] = filterPoolsOfInterest(
            cloneDeep(singleLinear.pools),
            tokenIn,
            tokenOut,
            maxPools,
            chainId
        );
        let pathData: NewPath[];

        [pools, pathData] = filterHopPools(tokenIn, tokenOut, hopTokens, pools);
        const pathsUsingLinear = getPathsUsingLinearPools(
            tokenIn,
            tokenOut,
            linearPoolsInfo,
            pools
        );
        pathData = pathData.concat(pathsUsingLinear);
        const [paths] = calculatePathLimits(pathData, swapType);

        let swaps: any,
            total: BigNumber,
            totalConsideringFees: BigNumber,
            marketSp: BigNumber;
        [swaps, total, marketSp, totalConsideringFees] = getBestPaths(
            cloneDeep(pools), // Need to keep original pools for cache
            paths,
            swapType,
            swapAmount,
            maxPools,
            bnum(10) // costReturnToken
        );
        console.log(swaps);

        const swapInfo = formatSwaps(
            swaps,
            swapType,
            swapAmount,
            tokenIn,
            tokenOut,
            total,
            totalConsideringFees,
            marketSp
        );

        console.log(swapInfo.swaps);
        console.log(swapInfo.tokenAddresses);
    });
});
