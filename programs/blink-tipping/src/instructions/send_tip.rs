use crate::error::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[derive(Accounts)]
#[instruction(amount: u64, currency: Currency)]
pub struct SendTip<'info> {
    #[account(mut)]
    pub tipper: Signer<'info>,

    /// CHECK: We only need the creator's pubkey for PDA derivation
    pub creator: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"creator", creator.key().as_ref()],
        bump
    )]
    pub creator_account: Account<'info, CreatorAccount>,

    /// CHECK: This is a PDA used as a vault to hold SOL
    #[account(
        mut,
        seeds = [b"vault_sol", creator.key().as_ref()],
        bump
    )]
    pub sol_vault: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"vault_usdc", creator.key().as_ref()],
        bump = creator_account.usdc_vault_bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    /// CHECK: Only used for USDC tips, can be uninitialized for SOL tips
    #[account(mut)]
    pub tipper_usdc_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}

pub fn process_send_tip(ctx: Context<SendTip>, amount: u64, currency: Currency) -> Result<()> {
    match currency {
        Currency::SOL => {
            let cpi_accounts = system_program::Transfer {
                from: ctx.accounts.tipper.to_account_info(),
                to: ctx.accounts.sol_vault.to_account_info(),
            };

            let cpi_program = ctx.accounts.system_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            system_program::transfer(cpi_ctx, amount)?;

            // Update creator account
            let creator_account = &mut ctx.accounts.creator_account;
            creator_account.total_tips_sol = creator_account
                .total_tips_sol
                .checked_add(amount)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
            creator_account.tip_count = creator_account
                .tip_count
                .checked_add(1)
                .ok_or(ErrorCode::ArithmeticOverflow)?;

            msg!(
                "Tip sent: {} lamports to {}",
                amount,
                ctx.accounts.creator.key()
            );
        }
        Currency::USDC => {
            // Transfer USDC
            let transfer_accounts = Transfer {
                from: ctx.accounts.tipper_usdc_account.to_account_info(),
                to: ctx.accounts.usdc_vault.to_account_info(),
                authority: ctx.accounts.tipper.to_account_info(),
            };

            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    transfer_accounts,
                ),
                amount,
            )?;

            // Update total
            ctx.accounts.creator_account.total_tips_usdc = ctx
                .accounts
                .creator_account
                .total_tips_usdc
                .checked_add(amount)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
            ctx.accounts.creator_account.tip_count = ctx
                .accounts
                .creator_account
                .tip_count
                .checked_add(1)
                .ok_or(ErrorCode::ArithmeticOverflow)?;

            msg!(
                "Tip sent: {} USDC to {}",
                amount,
                ctx.accounts.creator.key()
            );
        }
    }
    Ok(())
}
