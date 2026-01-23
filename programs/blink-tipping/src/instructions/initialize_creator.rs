use anchor_lang::prelude::*;
use crate::state::*;
use anchor_spl::token::{Mint, Token, TokenAccount};



#[derive(Accounts)]
pub struct InitializeCreator<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + CreatorAccount::INIT_SPACE,
        seeds = [b"creator", creator.key().as_ref()],
        bump
    )]
    pub creator_account: Account<'info, CreatorAccount>,
    
    /// SOL vault - just a system account that will hold SOL
    /// CHECK: This is safe because we're just using it as a vault
    #[account(
        mut,
        seeds = [b"vault_sol", creator.key().as_ref()],
        bump
    )]
    pub sol_vault: AccountInfo<'info>,

    /// The USDC mint address (devnet: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU)
    pub usdc_mint: Account<'info, Mint>,

    /// USDC vault - token account to hold USDC tips
    #[account(
    init,
    payer = creator,
    seeds = [b"vault_usdc", creator.key().as_ref()],
    bump,
    token::mint = usdc_mint,
    token::authority = usdc_vault,
)]
    pub usdc_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    
    pub system_program: Program<'info, System>,
}

pub fn process_initialize_creator(ctx: Context<InitializeCreator>) -> Result<()> {
    let creator_account = &mut ctx.accounts.creator_account;
    
    // Initialize creator account
    creator_account.creator = ctx.accounts.creator.key();
    creator_account.total_tips_sol = 0;
    creator_account.total_tips_usdc = 0;
    creator_account.tip_count = 0;
    creator_account.sol_vault_bump = ctx.bumps.sol_vault;
    creator_account.usdc_vault_bump = ctx.bumps.usdc_vault;
    creator_account.bump = ctx.bumps.creator_account;
    
    msg!("Creator account initialized for: {}", ctx.accounts.creator.key());
    
    Ok(())
}
