const hre = require("hardhat");

async function main() {
  // Obtener el contrato
  const PaymentProcessor = await hre.ethers.getContractFactory("PaymentProcessor");
  
  // Desplegar el contrato
  console.log("Desplegando PaymentProcessor...");
  const paymentProcessor = await PaymentProcessor.deploy();
  await paymentProcessor.deployed();

  console.log("PaymentProcessor desplegado en:", paymentProcessor.address);

  // Verificar el contrato en BSCScan
  console.log("Verificando contrato...");
  try {
    await hre.run("verify:verify", {
      address: paymentProcessor.address,
      constructorArguments: [],
    });
    console.log("Contrato verificado exitosamente");
  } catch (error) {
    console.log("Error al verificar el contrato:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
