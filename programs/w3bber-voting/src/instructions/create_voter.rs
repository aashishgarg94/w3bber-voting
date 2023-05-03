use crate::accounts;
use crate::state::poll_data_info::*;
use crate::state::voter_info::*;
use crate::state::error_code::*;
use anchor_lang::prelude::*;

pub fn create_voter(ctx: Context<CreateVoter>) -> Result<()> {
    let voter_info = &mut ctx.accounts.voter_account;
    let user = &mut ctx.accounts.user;
    let bump = *ctx.bumps.get("voter_account").ok_or(ErrorsCode::CannotGetBump)?;
    voter_info.create(user.key(), bump);
    Ok(())
}

#[derive(Accounts)]
pub struct CreateVoter<'info>{
    #[account(init, payer = user, space = VoterInfo::MAXIMUM_SIZE + 8, seeds = [b"voter".as_ref(), user.key().as_ref()], bump)]
    pub voter_account: Account<'info, VoterInfo>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>
}