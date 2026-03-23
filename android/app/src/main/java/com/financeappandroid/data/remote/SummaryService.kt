package com.financeappandroid.data.remote

import com.financeappandroid.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

interface SummaryService {
    @GET("summary")
    suspend fun getSummary(
        @Query("month") month: String? = null
    ): Response<SummaryDto>

    @GET("summary/monthly")
    suspend fun getMonthlySummary(
        @Query("months") months: Int? = null
    ): Response<List<MonthlySummaryDto>>

    @GET("summary/by-category")
    suspend fun getByCategory(
        @Query("month") month: String? = null,
        @Query("type") type: String? = null
    ): Response<List<CategorySummaryDto>>

    @GET("summary/forecast")
    suspend fun getForecast(
        @Query("month") month: Int? = null,
        @Query("year") year: Int? = null
    ): Response<ForecastDto>
}