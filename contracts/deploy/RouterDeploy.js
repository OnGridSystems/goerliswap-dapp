module.exports = async function ({ ethers, getNamedAccounts, deployments }) {
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();
  const amount = ethers.utils.parseUnits('1',16)
  const token1Address = (await deployments.get("Token1")).address;
  const token2Address = (await deployments.get("Token2")).address;

  router = await deploy("Router", {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
  });

  console.log("Router address:", router.address);

  await execute(
    "Token2",
    {
      from: deployer,
      log: true,
    },
    "approve",
    router.address,
    amount
  );

  await execute(
    "Router",
    {
      from: deployer,
      log: true,
    },
    "addLiquidity",
    token1Address,
    token2Address,
    amount,
    amount
  );

  // await execute(
  //   "Router",
  //   {
  //     from: deployer,
  //     log: true,
  //     value: amount
  //   },
  //   "addLiquidityETH",
  //   token1Address,
  //   amount,
  // );
};

module.exports.tags = ["Router"];
module.exports.dependencies = ["Token1", "Token2"];
