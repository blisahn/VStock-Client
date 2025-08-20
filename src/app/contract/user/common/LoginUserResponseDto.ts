import { BaseApiResponse } from "../../helpers/BaseApiResponse";
import { Token } from "../../token/Token";
export interface LoginUserResponseDto extends BaseApiResponse<Token> {
}