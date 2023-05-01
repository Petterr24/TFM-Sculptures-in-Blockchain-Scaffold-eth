const path = require("path");
const fs = require("fs");
const { run, deployments, getNamedAccounts } = require('hardhat');
const express = require('express');

const app = express();
const port = 5000;

app.post('/deploy', async (req, res) => {
  try {
    await deployContracts();
    res.send('Smart contracts deployed successfully');
  } catch (error) {
    console.log('Error deploying contracts: ', error);
    res.status(500).send('Error deploying contracts');
  }
});

const deployContracts = async () => {
  try {
    // Compile the contracts
    await run("compile");

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log(`Deployer: ${deployer}`);

    // Deploy the UserAuthorisation contract
    const userAuthorisationInstance = await deploy("UserAuthorisation", {
      // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
      from: deployer,
      // args: [ "Hello", ethers.utils.parseEther("1.5") ],
      log: true,
      //waitConfirmations: 5,
    });

    console.log(`UserAuthorisation address: ${userAuthorisationInstance.address}`);

    // Deploy the SculptureFactory
    const sculptureFactoryInstance = await deploy("SculptureFactory", {
      // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
      from: deployer,
      args: [ userAuthorisationInstance.address ],
      log: true,
      //waitConfirmations: 5,
    });

    console.log(`SculptureFactory address: ${sculptureFactoryInstance.address}`);

    // Creating a copy of the Sculpture json file (ABI)
    const sourcePath = path.join(__dirname, '../artifacts/contracts/SculptureFactory.sol/Sculpture.json');
    const destPath = path.join(__dirname, '../../react-app/src/contracts/Sculpture.json');
    fs.copyFileSync(sourcePath, destPath);

    console.log(`Sculpture abi stored in: ${destPath}`);

    // Show a success message to the user
    console.log("Smart Contracts deployed successfully!");
  } catch (error) {
    console.log("Error deploying contracts: ", error);
  }
};

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Export a function that deploys the contracts when called
module.exports = deployContracts;