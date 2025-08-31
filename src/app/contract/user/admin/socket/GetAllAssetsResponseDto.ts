import { PagedResult } from "../../../helpers/PagedResult";
import { AssetListItemContract } from "./AssetListItemContract";


export interface GetALlAssetsResponseDto extends PagedResult<AssetListItemContract> {
}
