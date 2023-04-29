use crate::state::poll_info::*;
use anchor_lang::prelude::*;

pub fn reveal_poll(ctx: Context<RevealPoll>, result: u8) -> Result<()> {
    let poll_account = &mut ctx.accounts.poll_account;
    poll_account.reveal(result);
    Ok(())
}

#[derive(Accounts)]
pub struct RevealPoll<'info>{
    #[account(mut, constraint = user.key == &poll_account.user, seeds = [poll_account.poll_id.as_ref()], bump = poll_account.bump)]
    pub poll_account: Account<'info, PollInfo>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>
}