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

export interface Circle{
  circle_name: string;
  // 图片?
}