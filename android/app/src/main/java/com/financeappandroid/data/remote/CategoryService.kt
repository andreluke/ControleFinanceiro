package com.financeappandroid.data.remote

import com.financeappandroid.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

interface CategoryService {
    @GET("categories")
    suspend fun getCategories(
        @Query("type") type: String? = null,
        @Query("include_deleted") includeDeleted: Boolean? = null
    ): Response<List<CategoryDto>>

    @POST("categories")
    suspend fun createCategory(
        @Body request: CreateCategoryRequest
    ): Response<CategoryDto>

    @PUT("categories/{id}")
    suspend fun updateCategory(
        @Path("id") id: String,
        @Body request: CreateCategoryRequest
    ): Response<CategoryDto>

    @DELETE("categories/{id}")
    suspend fun deleteCategory(@Path("id") id: String): Response<MessageResponseDto>

    @PATCH("categories/{id}/restore")
    suspend fun restoreCategory(@Path("id") id: String): Response<CategoryDto>
}