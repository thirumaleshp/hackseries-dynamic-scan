const hre = require("hardhat");

async function main() {
  const Snake = await hre.ethers.getContractFactory("SnakeHighScore");
  const snake = await Snake.deploy();
  await snake.deployed();
  console.log(`Deployed to: ${snake.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
