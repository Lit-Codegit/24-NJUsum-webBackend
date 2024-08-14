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

export interface Circle {
  circle_id: number;
  icon_url: string;
  circle_name: string;
  active_users: Array<{ name: string; point: string }>;
  posts_cnt: number;
}

export interface Post{
  post_id: string;
  owner: string;
  title: string;
  content: string;
  images: string[];
  thumbs: number;
  comments: string[];
}