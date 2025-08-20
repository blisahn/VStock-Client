import { PagedResult } from "../helpers/PagedResult";
import { GetTransactionDetailResponse as GetTransactionDetailContract } from "./GetTransactionDetailResponse";

export interface GetUserTransactionResponse extends PagedResult<GetTransactionDetailContract> {

}
