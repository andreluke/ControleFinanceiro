package com.financeappandroid.domain.repository

import com.financeappandroid.domain.model.*

interface SummaryRepository {
    suspend fun getSummary(month: String? = null): Result<Summary>
    suspend fun getMonthlySummary(months: Int? = null): Result<List<MonthlySummary>>
    suspend fun getByCategory(month: String? = null, type: TransactionType? = null): Result<List<CategorySummary>>
    suspend fun getForecast(month: Int? = null, year: Int? = null): Result<Forecast>
}