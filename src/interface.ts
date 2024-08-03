/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}
export interface LoginRequestBody {
  username: string;
  passwd: string;
}

export interface CircleRequestBody{
  // circle_id: number;
  circle_name: string;
  // active_users: string[];
}