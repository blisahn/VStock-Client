
export interface TransactionDto {
    symbol: string;
    transactionType: string;
    quantity: number;
    price: number;
}

// cashDeposit.symbol = 'USD';
// cashDeposit.transactionType = 'Deposit';
// cashDeposit.quantity = 1; // Assuming quantity is always 1 for deposits
// cashDeposit.price = cashDeposit.depositAmount; // Assuming price is the same as