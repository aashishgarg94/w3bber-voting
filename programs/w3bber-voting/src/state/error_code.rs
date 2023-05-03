use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorsCode {
    #[msg("Cannot get bump")]
    CannotGetBump,

    #[msg("Poll already finished")]
    PollAlreadyFinished,

    #[msg("Poll already cancelled")]
    PollAlreadyCancelled,

    #[msg("Vote too long")]
    VoteTooLong
}