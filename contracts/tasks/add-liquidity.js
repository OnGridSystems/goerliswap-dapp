const { task } = require("hardhat/config");

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

task("add-liquidity", "Add liquidity")
  .setAction(async (taskArgs, hre) => {
    const provider = new hre.ethers.providers.JsonRpcProvider("https://endpoints.omniatech.io/v1/eth/goerli/public");
    const routerAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const fs = require('fs');
    const abi = JSON.parse(fs.readFileSync('./abi/Abi.json', 'utf8'));
    const routerContractInstance = new hre.ethers.Contract(routerAddress, abi, provider);

    const amount = hre.ethers.utils.parseEther("0.01");
    const token1Artifact = (await hre.deployments.get("Token1"));
    const token1 = await hre.ethers.getContractAt(token1Artifact.abi, token1Artifact.address);
    const token2Artifact = (await hre.deployments.get("Token2"));
    const token2 = await hre.ethers.getContractAt(token2Artifact.abi, token2Artifact.address);
    const signers = await hre.ethers.getSigners();
    const user = signers[0];

    const artifact1 = await addLiquidity(routerContractInstance, token1, token2,  amount, amount, user)
    const tx1 = await artifact1.wait();
    console.log("Add liquidity tx:", tx1.transactionHash);

    const artifact2 = await addLiquidityETH(routerContractInstance, token1,  amount, amount, user)
    const tx2 = await artifact2.wait();
    console.log("Add liquidity tx:", tx2.transactionHash);

    const artifact3 = await addLiquidityETH(routerContractInstance, token2,  amount, amount, user)
    const tx3 = await artifact3.wait();
    console.log("Add liquidity tx:", tx3.transactionHash);
});