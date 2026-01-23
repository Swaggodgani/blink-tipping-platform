use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct CreatorAccount {
    /// Creator's wallet address
    pub creator: Pubkey,
    /// Total SOL tips received (in lamports)
    pub total_tips_sol: u64,
    /// Total USDC tips received (in token amount)
    pub total_tips_usdc: u64,
    /// Number of tips received
    pub tip_count: u64,
    /// SOL vault PDA bump
    pub sol_vault_bump: u8,
    /// USDC vault PDA bump
    pub usdc_vault_bump: u8,
    /// Creator account PDA bump
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct PlatformConfig {
    /// Platform authority (owner)
    pub authority: Pubkey,
    /// Fee in basis points (25 = 0.25%)
    pub fee_basis_points: u16,
    /// Total fees collected in SOL
    pub total_fees_collected_sol: u64,
    /// Total fees collected in USDC
    pub total_fees_collected_usdc: u64,
    /// Platform config PDA bump
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Currency {
    SOL,
    USDC,
}
