export interface BaseApiResponse<T = any> {
    succeeded: boolean;
    message: string;
    errors: string[];
    data?: T
}