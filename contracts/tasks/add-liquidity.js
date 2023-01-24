const { task } = require("hardhat/config");
const fs = require('fs');

async function addLiquidity(router, token1, token2, amount1, amount2, user) {
  const approve1 = await token1.connect(user).approve(router.address, amount1)
  const tx1 = await approve1.wait();
  console.log("Approve token1 tx:", tx1.transactionHash);
  const approve2 = await token2.connect(user).approve(router.address, amount2)
  const tx2 = await approve2.wait();
  console.log("Approve token2 tx:", tx2.transactionHash);
  const liquidity = await router.connect(user).addLiquidity(token1.address, token2.address, amount1, amount2, 1, 1, user.address, Date.now())
  return liquidity
}

async function addLiquidityETH(router, token, amount, amountETH, user) {
  const approve = await token.connect(user).approve(router.address, amount)
  const tx = await approve.wait();
  console.log("Approve tx:", tx.transactionHash);
  const liquidity = await router.connect(user).addLiquidityETH(token.address, amount, 1, 1, user.address, Date.now(), { value: amountETH})
  return liquidity
}

async function getPairAddress(factory, token1, token2) {
  const pair = await factory.getPair(token1, token2)
  return pair
}

function divideBN(hre, bn1, bn2) {
  const num1 = Number(hre.ethers.utils.formatEther(bn1))
  const num2 = Number(hre.ethers.utils.formatEther(bn2))
  const div = (num1 / num2) 
  
  return div
}

task("add-liquidity", "Add liquidity")
  .setAction(async (taskArgs, hre) => {
    const provider = new hre.ethers.providers.JsonRpcProvider("https://endpoints.omniatech.io/v1/eth/goerli/public");
    const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

    const routerAbi = JSON.parse(fs.readFileSync('./abi/UniswapRouterAbi.json', 'utf8'));
    const routerContractInstance = new hre.ethers.Contract(routerAddress, routerAbi, provider);
    const factoryAddress = await routerContractInstance.factory()
    const factoryAbi = JSON.parse(fs.readFileSync('./abi/UniswapFactoryAbi.json', 'utf8'));
    const factoryContractInstance = new hre.ethers.Contract(factoryAddress, factoryAbi, provider);
    const wethAddress = await routerContractInstance.WETH()
    const wethAbi = JSON.parse(fs.readFileSync('./abi/WethAbi.json', 'utf8'));
    const wethContractInstance = new hre.ethers.Contract(wethAddress, wethAbi, provider);

    const amount = hre.ethers.utils.parseEther("0.01");
    const token1Artifact = (await hre.deployments.get("Token1"));
    const token1 = await hre.ethers.getContractAt(token1Artifact.abi, token1Artifact.address);
    const token2Artifact = (await hre.deployments.get("Token2"));
    const token2 = await hre.ethers.getContractAt(token2Artifact.abi, token2Artifact.address);
    const signers = await hre.ethers.getSigners();
    const user = signers[0];

    // const artifact1 = await addLiquidity(routerContractInstance, token1, token2,  amount, amount, user)
    // const tx1 = await artifact1.wait();
    // console.log("Add liquidity tx:", tx1.transactionHash);

    // const artifact2 = await addLiquidityETH(routerContractInstance, token1,  amount, amount, user)
    // const tx2 = await artifact2.wait();
    // console.log("Add liquidity tx:", tx2.transactionHash);

    // const artifact3 = await addLiquidityETH(routerContractInstance, token2,  amount, amount, user)
    // const tx3 = await artifact3.wait();
    // console.log("Add liquidity tx:", tx3.transactionHash);

    const pair1 = await getPairAddress(factoryContractInstance, token1.address, token2.address)
    console.log("Pair1:", pair1);

    const pair2 = await getPairAddress(factoryContractInstance, token1.address, wethAddress)
    console.log("Pair2:", pair2);

    const pair3 = await getPairAddress(factoryContractInstance, token2.address, wethAddress)
    console.log("Pair3:", pair3);

    const pair1BalanceToken1 = await token1.balanceOf(pair1)
    const pair1BalanceToken2 = await token2.balanceOf(pair1)

    const pair2BalanceToken1 = await token1.balanceOf(pair2)
    const pair2BalanceWeth = await wethContractInstance.balanceOf(pair2)

    const pair3BalanceToken2 = await token2.balanceOf(pair3)
    const pair3BalanceWeth = await wethContractInstance.balanceOf(pair3)

    const liquidities = {};
    liquidities.pair1 = {token1: hre.ethers.utils.formatEther(pair1BalanceToken1), token2:hre.ethers.utils.formatEther(pair1BalanceToken2), weth:0};
    liquidities.pair2 =  {token1: hre.ethers.utils.formatEther(pair2BalanceToken1), token2:0, weth: hre.ethers.utils.formatEther(pair2BalanceWeth)};
    liquidities.pair3 =  {token1: 0, token2:hre.ethers.utils.formatEther(pair3BalanceToken2), weth: hre.ethers.utils.formatEther(pair3BalanceWeth)};
    console.table(liquidities);

    const coefficient = {};
    coefficient.pair1 = {'token1/token2': divideBN(hre, pair1BalanceToken1, pair1BalanceToken2), 'token2/token1':divideBN(hre, pair1BalanceToken2, pair1BalanceToken1)};
    coefficient.pair2 = {'token1/weth': divideBN(hre, pair2BalanceToken1, pair2BalanceWeth), 'weth/token1':divideBN(hre, pair2BalanceWeth, pair2BalanceToken1)};
    coefficient.pair3 = {'token2/weth': divideBN(hre, pair3BalanceToken2, pair3BalanceWeth), 'weth/token2':divideBN(hre, pair3BalanceWeth, pair3BalanceToken2)};
    console.table(coefficient);
});