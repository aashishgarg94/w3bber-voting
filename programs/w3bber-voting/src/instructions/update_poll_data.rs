use crate::state::poll_data_info::*;
use anchor_lang::prelude::*;

pub fn update_poll_data(ctx: Context<UpdatePollData>, poll_id: Pubkey) -> Result<()> {
    let poll_data = &mut ctx.accounts.poll_data_account;
    poll_data.update(poll_id);
    Ok(())
}

#[derive(Accounts)]
pub struct UpdatePollData<'info>{
    #[account(mut)]
    pub poll_data_account: Account<'info, PollDataInfo>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>
}