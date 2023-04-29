use crate::state::voter_poll_data_info::*;
use crate::state::voter_info::*;
use crate::state::error_code::*;
use anchor_lang::prelude::*;

pub fn create_voter(ctx: Context<CreateVoter>) -> Result<()> {
    let voter_poll_data_account = &mut ctx.accounts.voter_poll_data_account;
    let voter_info = &mut ctx.accounts.voter_account;
    let bump = *ctx.bumps.get("voter_account").ok_or(ErrorsCode::CannotGetBump)?;
    voter_info.create(voter_poll_data_account.voter_id, bump);
    Ok(())
}

#[derive(Accounts)]
pub struct CreateVoter<'info>{
    #[account()]
    pub voter_poll_data_account: Account<'info, VoterPollDataInfo>,

    #[account(init, payer = user, space = VoterInfo::MAXIMUM_SIZE + 8, seeds = [voter_poll_data_account.voter_id.as_ref()], bump)]
    pub voter_account: Account<'info, VoterInfo>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>
}