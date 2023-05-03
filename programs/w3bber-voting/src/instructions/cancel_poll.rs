use crate::state::poll_info::*;
use crate::state::error_code::*;
use anchor_lang::prelude::*;

pub fn cancel_poll(ctx: Context<CancelPoll>) -> Result<()> {
    let poll_account = &mut ctx.accounts.poll_account;
    match poll_account.cancel() {
        Ok(_) => Ok(()),
        Err(e) => return Err(e)
    }
}

#[derive(Accounts)]
pub struct CancelPoll<'info>{
    #[account(mut, constraint = user.key == &poll_account.user)]
    pub poll_account: Account<'info, PollInfo>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>
}