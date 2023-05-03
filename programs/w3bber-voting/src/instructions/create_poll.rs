use crate::state::poll_data_info::*;
use crate::state::poll_info::*;
use crate::state::error_code::*;
use anchor_lang::prelude::*;

pub fn create_poll(ctx: Context<CreatePoll>, voting_deadline: u32) -> Result<()> {
    let poll_data_account = &mut ctx.accounts.poll_data_account;
    let poll_account = &mut ctx.accounts.poll_account;
    let user = &ctx.accounts.user;
    let bump = *ctx.bumps.get("poll_account").ok_or(ErrorsCode::CannotGetBump)?;
    poll_account.create(poll_data_account.poll_id, voting_deadline, user.key(), bump);
    Ok(())
}

#[derive(Accounts)]
pub struct CreatePoll<'info>{
    #[account()]
    pub poll_data_account: Account<'info, PollDataInfo>,

    #[account(init, payer = user, space = PollInfo::MAXIMUM_SIZE + 8, seeds = [poll_data_account.poll_id.as_ref()], bump)]
    pub poll_account: Account<'info, PollInfo>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>
}