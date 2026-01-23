use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializePlatformConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + PlatformConfig::INIT_SPACE,
        seeds = [b"platform_config"],
        bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    
    pub system_program: Program<'info, System>,
}

pub fn process_initialize_platform_config(ctx: Context<InitializePlatformConfig>) -> Result<()> {
    let platform_config = &mut ctx.accounts.platform_config;
    
    // Initialize platform config
    platform_config.authority = ctx.accounts.authority.key();
    platform_config.fee_basis_points = 25; // 0.25%
    platform_config.total_fees_collected_sol = 0;
    platform_config.total_fees_collected_usdc = 0;
    platform_config.bump = ctx.bumps.platform_config;
    
    msg!("Platform config initialized with fee: {}%", platform_config.fee_basis_points as f64 / 100.0);
    
    Ok(())
}
