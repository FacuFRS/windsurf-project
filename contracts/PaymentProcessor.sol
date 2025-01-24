// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PaymentProcessor is Ownable, ReentrancyGuard {
    // Estructura para almacenar información de pagos
    struct Payment {
        address payer;
        uint256 amount;
        uint256 timestamp;
        PaymentType paymentType;
        bool isDiscounted;
    }

    enum PaymentType { BNB, TOKEN }

    // Mapping de tokens aceptados
    mapping(address => bool) public acceptedTokens;
    // Mapping de descuentos por address
    mapping(address => uint256) public userDiscounts;
    // Array de todos los pagos
    Payment[] public payments;

    // Eventos
    event PaymentReceived(address indexed payer, uint256 amount, PaymentType paymentType);
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event DiscountSet(address indexed user, uint256 discount);
    event PaymentProcessed(address indexed payer, uint256 indexed amount, uint256 indexed paymentId);

    constructor() {
        // Constructor vacío ya que heredamos de Ownable
    }

    // Función para procesar pagos con ID
    function processPayment(uint256 paymentId) external payable {
        require(msg.value > 0, "El monto debe ser mayor a 0");
        _processPayment(msg.sender, msg.value, PaymentType.BNB);
        emit PaymentProcessed(msg.sender, msg.value, paymentId);
    }

    // Función para recibir BNB
    receive() external payable {
        _processPayment(msg.sender, msg.value, PaymentType.BNB);
    }

    // Función para pagar con tokens
    function payWithToken(address token, uint256 amount) external nonReentrant {
        require(acceptedTokens[token], "Token no aceptado");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transferencia fallida");
        _processPayment(msg.sender, amount, PaymentType.TOKEN);
    }

    // Función interna para procesar pagos
    function _processPayment(address payer, uint256 amount, PaymentType paymentType) internal {
        uint256 finalAmount = amount;
        bool isDiscounted = false;

        // Aplicar descuento si existe
        if (userDiscounts[payer] > 0) {
            finalAmount = amount * (100 - userDiscounts[payer]) / 100;
            isDiscounted = true;
        }

        // Registrar el pago
        payments.push(Payment({
            payer: payer,
            amount: finalAmount,
            timestamp: block.timestamp,
            paymentType: paymentType,
            isDiscounted: isDiscounted
        }));

        emit PaymentReceived(payer, finalAmount, paymentType);
    }

    // Funciones administrativas
    function addAcceptedToken(address token) external onlyOwner {
        acceptedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeAcceptedToken(address token) external onlyOwner {
        acceptedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function setDiscount(address user, uint256 discountPercent) external onlyOwner {
        require(discountPercent <= 100, "Descuento invalido");
        userDiscounts[user] = discountPercent;
        emit DiscountSet(user, discountPercent);
    }

    // Función para retirar BNB
    function withdrawBNB() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Función para retirar tokens
    function withdrawToken(address token) external onlyOwner {
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(tokenContract.transfer(owner(), balance), "Transferencia fallida");
    }

    // Función para obtener todos los pagos
    function getAllPayments() external view returns (Payment[] memory) {
        return payments;
    }

    // Función para obtener el número total de pagos
    function getPaymentCount() external view returns (uint256) {
        return payments.length;
    }
}
