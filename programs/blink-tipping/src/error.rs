use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient balance in vault")]
    InsufficientBalance,

    #[msg("Invalid fee basis points (must be <= 10000)")]
    InvalidFeeBasisPoints,

    #[msg("Unauthorized: Only platform authority can perform this action")]
    Unauthorized,

    #[msg("Invalid currency type")]
    InvalidCurrency,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    
    #[msg("Insufficient funds")]
    InsufficientFunds,
}
