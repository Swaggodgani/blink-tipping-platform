use anchor_lang::prelude::*;
// Declare modules
mod error;
mod instructions;
mod state;
// Import everything we need
use error::*;
use instructions::*;
use state::*;
declare_id!("Hgdc6LBYxZeXTpA3Dr53HxwxWf96wsQBX3tS1R8ArDNS");
#[program]

pub mod blink_tipping {
    use super::*;
    pub fn initialize_creator(ctx: Context<InitializeCreator>) -> Result<()> {
        instructions::initialize_creator::process_initialize_creator(ctx)
    }
    pub fn send_tip(ctx: Context<SendTip>, amount: u64, currency: Currency) -> Result<()> {
        instructions::send_tip::process_send_tip(ctx, amount, currency)
    }
    pub fn initialize_platform_config(ctx: Context<InitializePlatformConfig>) -> Result<()> {
        instructions::initialize_platform_config::process_initialize_platform_config(ctx)
    }
    pub fn withdraw_tips(
        ctx: Context<WithdrawTips>,
        amount: u64,
        currency: Currency,
    ) -> Result<()> {
        instructions::withdraw_tips::process_withdraw_tips(ctx, amount, currency)
    }
}
