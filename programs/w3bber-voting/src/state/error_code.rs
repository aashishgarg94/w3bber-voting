use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorsCode {
    #[msg("Cannot get bump")]
    CannotGetBump,
}