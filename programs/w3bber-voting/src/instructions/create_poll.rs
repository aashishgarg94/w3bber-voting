use crate::state::voter_poll_data_info;
use crate::state::voter_poll_data_info::*;
use crate::state::poll_info::*;
use anchor_lang::prelude::*;

pub fn create_poll(ctx: Context<CreatePoll>, voting_deadline: u32) -> Result<()> {
    let voter_poll_data_account = &mut ctx.accounts.voter_poll_data_account;
    let poll_account = &mut ctx.accounts.poll_account;
    poll_account.create(voter_poll_data_account.poll_id, voting_deadline);
    Ok(())
}

#[derive(Accounts)]
pub struct CreatePoll<'info>{
    #[account()]
    pub voter_poll_data_account: Account<'info, VoterPollDataInfo>,

    #[account(init, payer = user, space = PollInfo::MAXIMUM_SIZE + 8, seeds = [voter_poll_data_account.poll_id.as_ref()], bump)]
    pub poll_account: Account<'info, PollInfo>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>
}