package com.financeappandroid.data.remote

import com.financeappandroid.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

interface TransactionService {
    @GET("transactions")
    suspend fun getTransactions(
        @Query("type") type: String? = null,
        @Query("category_id") categoryId: String? = null,
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null
    ): Response<TransactionListResponse>

    @GET("transactions/{id}")
    suspend fun getTransaction(@Path("id") id: String): Response<TransactionDto>

    @POST("transactions")
    suspend fun createTransaction(
        @Body request: CreateTransactionRequest
    ): Response<TransactionDto>

    @PUT("transactions/{id}")
    suspend fun updateTransaction(
        @Path("id") id: String,
        @Body request: CreateTransactionRequest
    ): Response<TransactionDto>

    @DELETE("transactions/{id}")
    suspend fun deleteTransaction(@Path("id") id: String): Response<MessageResponseDto>
}