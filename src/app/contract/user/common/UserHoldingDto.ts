import { PagedResult } from "../../helpers/PagedResult";
import { UserHoldingsListItemContract } from "../admin/user/UserHoldingsListItemContract";

export interface GetUserHoldingsResponseDto extends PagedResult<UserHoldingsListItemContract> {

}