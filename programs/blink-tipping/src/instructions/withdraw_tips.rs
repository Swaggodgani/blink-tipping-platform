use crate::error::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[derive(Accounts)]
#[instruction(amount: u64, currency: Currency)]
pub struct WithdrawTips<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        has_one = creator,
        seeds = [b"creator", creator.key().as_ref()],
        bump = creator_account.bump
    )]
    pub creator_account: Account<'info, CreatorAccount>,

    #[account(mut)]
    pub creator_usdc_account: Account<'info, TokenAccount>,

    /// CHECK: This is a PDA used as a vault to hold SOL
    #[account(
        mut,
        seeds = [b"vault_sol", creator.key().as_ref()],
        bump = creator_account.sol_vault_bump
    )]
    pub sol_vault: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"vault_usdc", creator.key().as_ref()],
        bump = creator_account.usdc_vault_bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"platform_config"],
        bump = platform_config.bump
    )]
    pub platform_config: Account<'info, PlatformConfig>,

    /// CHECK: Platform authority receives fees, verified by address constraint
    #[account(
        mut,
        address = platform_config.authority
    )]
    pub platform_wallet: AccountInfo<'info>,

    #[account(mut)]
    pub platform_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}

pub fn process_withdraw_tips(
    ctx: Context<WithdrawTips>,
    amount: u64,
    currency: Currency,
) -> Result<()> {
    match currency {
        Currency::SOL => {
            let creator_account = &mut ctx.accounts.creator_account;

            // Check creator has enough tips
            require!(
                amount <= creator_account.total_tips_sol,
                ErrorCode::InsufficientBalance
            );

            // Get vault balance
            let vault_balance = ctx.accounts.sol_vault.lamports();
            require!(amount <= vault_balance, ErrorCode::InsufficientBalance);

            // Calculate fee (25 basis points = 0.25%)
            let fee = amount
                .checked_mul(ctx.accounts.platform_config.fee_basis_points as u64)
                .ok_or(ErrorCode::ArithmeticOverflow)?
                .checked_div(10000)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
            let creator_amount = amount
                .checked_sub(fee)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
            msg!(
                "Withdrawing {} lamports (fee: {}, creator: {})",
                amount,
                fee,
                creator_amount
            );

            // Prepare PDA signer seeds
            let creator_key = ctx.accounts.creator.key();
            let seeds = &[
                b"vault_sol",
                creator_key.as_ref(),
                &[creator_account.sol_vault_bump],
            ];
            let signer_seeds = &[&seeds[..]];

            // Transfer fee to platform
            let fee_transfer = system_program::Transfer {
                from: ctx.accounts.sol_vault.to_account_info(),
                to: ctx.accounts.platform_wallet.to_account_info(),
            };
            let fee_cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                fee_transfer,
                signer_seeds,
            );
            system_program::transfer(fee_cpi_ctx, fee)?;

            // Transfer to creator
            let creator_transfer = system_program::Transfer {
                from: ctx.accounts.sol_vault.to_account_info(),
                to: ctx.accounts.creator.to_account_info(),
            };
            let creator_cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                creator_transfer,
                signer_seeds,
            );
            system_program::transfer(creator_cpi_ctx, creator_amount)?;

            // Update accounts
            let creator_account = &mut ctx.accounts.creator_account;
            creator_account.total_tips_sol = creator_account
                .total_tips_sol
                .checked_sub(amount)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
            let platform_config = &mut ctx.accounts.platform_config;
            platform_config.total_fees_collected_sol = platform_config
                .total_fees_collected_sol
                .checked_add(fee)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
            msg!("Withdrawal successful!");
        }
        Currency::USDC => {
            let creator_account = &ctx.accounts.creator_account;

            // Validation
            require!(
                amount <= creator_account.total_tips_usdc,
                ErrorCode::InsufficientBalance
            );

            let vault_balance = ctx.accounts.usdc_vault.amount;
            require!(amount <= vault_balance, ErrorCode::InsufficientBalance);

            // Calculate fee
            let fee = amount
                .checked_mul(ctx.accounts.platform_config.fee_basis_points as u64)
                .ok_or(ErrorCode::ArithmeticOverflow)?
                .checked_div(10000)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
            let creator_amount = amount
                .checked_sub(fee)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
            msg!(
                "Withdrawing {} USDC (fee: {}, creator: {})",
                amount,
                fee,
                creator_amount
            );

            // Build signer seeds
            let creator_key = ctx.accounts.creator.key();
            let seeds = &[
                b"vault_usdc",
                creator_key.as_ref(),
                &[creator_account.usdc_vault_bump],
            ];
            let signer_seeds = &[&seeds[..]];

            // Transfer fee to platform
            let fee_transfer = Transfer {
                from: ctx.accounts.usdc_vault.to_account_info(),
                to: ctx.accounts.platform_usdc.to_account_info(),
                authority: ctx.accounts.usdc_vault.to_account_info(),
            };
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    fee_transfer,
                    signer_seeds,
                ),
                fee,
            )?;

            // Transfer to creator
            let creator_transfer = Transfer {
                from: ctx.accounts.usdc_vault.to_account_info(),
                to: ctx.accounts.creator_usdc_account.to_account_info(),
                authority: ctx.accounts.usdc_vault.to_account_info(),
            };
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    creator_transfer,
                    signer_seeds,
                ),
                creator_amount,
            )?;

            // Update accounts
            let creator_account = &mut ctx.accounts.creator_account;
            creator_account.total_tips_usdc = creator_account
                .total_tips_usdc
                .checked_sub(amount)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
            let platform_config = &mut ctx.accounts.platform_config;
            platform_config.total_fees_collected_usdc = platform_config
                .total_fees_collected_usdc
                .checked_add(fee)
                .ok_or(ErrorCode::ArithmeticOverflow)?;
            msg!("Withdrawal successful!");
        }
    }

    Ok(())
}
