import { PagedResult } from "../../../helpers/PagedResult";
import { UserListItemContract } from "./UserListItemContract";


export interface GetAllUsersResponseDto extends PagedResult<UserListItemContract> {
}
