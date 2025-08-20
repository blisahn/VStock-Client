import { Injectable } from '@angular/core';
import { combineLatest, debounceTime, firstValueFrom } from 'rxjs';
import { CreateUserDto } from '../../../contract/user/common/CreateUserDto';
import { CustomHttpClient } from '../../common/customhttp.service';
import { GetAllUsersResponseDto } from '../../../contract/user/admin/GetAllUsersResponseDto';
import { FetchUserDto as FetchUserDetailsDto } from '../../../contract/user/admin/FetchUserDto';
import { AssignRoleDto } from '../../../contract/user/admin/AssignRoleDto';
import { UpdateUserDto } from '../../../contract/user/admin/UpdateUserDto';
import { UpdateProfileDto } from '../../../contract/user/common/UpdateProfileDto';
import { BaseApiResponse } from '../../../contract/helpers/BaseApiResponse';
import { FetchProfileDto } from '../../../contract/user/common/FetchProfileDto';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private customHttpClient: CustomHttpClient,
  ) {

  }

  async create(user: CreateUserDto): Promise<BaseApiResponse> {
    console.log("UserService: create called with user:", user);
    try {
      console.log("UserService: sending request to create user");
      debugger;
      const observable = await this.customHttpClient.post<BaseApiResponse, CreateUserDto>({
        controller: 'users',
        action: 'createuser'
      }, user);
      debugger;
      console.log("request sent, waiting for response...");
      const res = await firstValueFrom(observable);
      console.log("UserService: create response:", res);
      return res;
    } catch (err) {
      console.error("UserService: create error:", err);
      throw err;
    }
  }

  async getUserDetails(id: string): Promise<BaseApiResponse<FetchUserDetailsDto>> {
    try {
      const request$ = this.customHttpClient.get<BaseApiResponse<FetchUserDetailsDto>>({
        controller: "users",
        action: "getuserDetails",
      }, id);
      const res = await firstValueFrom(request$);
      return res;
    } catch (err) {
      throw err;
    }
  }


  async getAllUsers(): Promise<BaseApiResponse<GetAllUsersResponseDto>> {
    const request$ = this.customHttpClient.get<BaseApiResponse<GetAllUsersResponseDto>>({
      controller: "users",
      action: "getallusers"
    });
    const res = await firstValueFrom(request$);
    return res;
  }

  async assignRole(roleRequestDto: AssignRoleDto): Promise<BaseApiResponse> {
    try {
      const observable = this.customHttpClient.put<BaseApiResponse, AssignRoleDto>({
        controller: "users",
        action: "assignRole"
      }, roleRequestDto);
      const res = await firstValueFrom(observable);
      return res;
    } catch (err) {
      throw err;
    }
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<BaseApiResponse> {
    try {
      const observable = this.customHttpClient.put<BaseApiResponse, UpdateUserDto>({
        controller: "users",
        action: "updateUser"
      }, updateUserDto);
      const res = await firstValueFrom(observable);
      return res;
    } catch (err) {
      throw err;
    }
  }
  async deleteUser(userId: string): Promise<BaseApiResponse> {
    try {
      const observable = this.customHttpClient.delete<BaseApiResponse>({
        controller: "users",
        action: "deleteuser"
      }, userId)
      return await firstValueFrom(observable);
    } catch (err) {
      throw err;
    }
  }


  async getProfileDetails(): Promise<BaseApiResponse<FetchProfileDto>> {
    try {
      const request$ = await this.customHttpClient.get<BaseApiResponse<FetchProfileDto>>({
        controller: "users",
        action: "getprofiledetails"
      });
      const res = await firstValueFrom(request$);
      return res;
    } catch (err) {
      throw err;
    }
  }

  async updateProfile(payload: UpdateProfileDto): Promise<BaseApiResponse> {
    try {
      const request$ = await this.customHttpClient.put<BaseApiResponse, UpdateProfileDto>({
        controller: "users",
        action: "updateProfile"
      }, payload);
      const res = await firstValueFrom(request$);
      return res;
    } catch (err) {
      throw err;
    }
  }







}
