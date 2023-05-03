use crate::state::poll_data_info::*;
use anchor_lang::prelude::*;

pub fn create_poll_data(ctx: Context<CreatePollData>, poll_id: Pubkey) -> Result<()> {
    let poll_data_account = &mut ctx.accounts.poll_data_account;
    poll_data_account.update(poll_id);
    Ok(())
}

#[derive(Accounts)]
pub struct CreatePollData<'info>{
    #[account(init, payer = user, space = 8 + PollDataInfo::MAXIMUM_SIZE)]
    pub poll_data_account: Account<'info, PollDataInfo>,

    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>
}