package com.financeappandroid.data.remote

import com.financeappandroid.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

interface AuthService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequestDto): Response<AuthResponseDto>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequestDto): Response<AuthResponseDto>

    @POST("auth/logout")
    suspend fun logout(): Response<MessageResponseDto>

    @POST("auth/refresh-token")
    suspend fun refreshToken(): Response<RefreshTokenResponseDto>

    @GET("auth/me")
    suspend fun getMe(): Response<AuthResponseDto>
}