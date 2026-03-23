package com.financeappandroid.data.repository

import com.financeappandroid.data.remote.SummaryService
import com.financeappandroid.domain.model.*
import com.financeappandroid.domain.repository.SummaryRepository
import javax.inject.Inject

class SummaryRepositoryImpl @Inject constructor(
    private val summaryService: SummaryService
) : SummaryRepository {

    override suspend fun getSummary(month: String?): Result<Summary> {
        return try {
            val response = summaryService.getSummary(month)
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                Result.success(
                    Summary(
                        totalIncome = body.totalIncome,
                        totalExpense = body.totalExpense,
                        balance = body.balance,
                        month = body.month,
                        byCategory = body.byCategory?.map {
                            CategorySummary(
                                categoryId = it.categoryId,
                                categoryName = it.categoryName,
                                categoryColor = it.categoryColor,
                                categoryIcon = it.categoryIcon,
                                total = it.total,
                                percentage = it.percentage
                            )
                        } ?: emptyList(),
                        recentTransactions = body.recentTransactions?.map { dto ->
                            Transaction(
                                id = dto.id,
                                description = dto.description,
                                amount = dto.amount,
                                type = TransactionType.fromString(dto.type),
                                date = dto.date,
                                categoryId = dto.categoryId,
                                subcategoryId = dto.subcategoryId,
                                paymentMethodId = dto.paymentMethodId,
                                createdAt = dto.createdAt,
                                category = dto.category?.let {
                                    Category(
                                        id = it.id,
                                        name = it.name,
                                        color = it.color,
                                        icon = it.icon,
                                        type = TransactionType.fromString(it.type),
                                        createdAt = it.createdAt
                                    )
                                },
                                subcategory = null,
                                paymentMethod = null
                            )
                        } ?: emptyList()
                    )
                )
            } else {
                Result.failure(Exception("Failed to get summary: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getMonthlySummary(months: Int?): Result<List<MonthlySummary>> {
        return try {
            val response = summaryService.getMonthlySummary(months)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.map {
                    MonthlySummary(
                        month = it.month,
                        totalIncome = it.totalIncome,
                        totalExpense = it.totalExpense,
                        balance = it.balance
                    )
                })
            } else {
                Result.failure(Exception("Failed to get monthly summary: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getByCategory(month: String?, type: TransactionType?): Result<List<CategorySummary>> {
        return try {
            val response = summaryService.getByCategory(month, type?.name?.lowercase())
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.map {
                    CategorySummary(
                        categoryId = it.categoryId,
                        categoryName = it.categoryName,
                        categoryColor = it.categoryColor,
                        categoryIcon = it.categoryIcon,
                        total = it.total,
                        percentage = it.percentage
                    )
                })
            } else {
                Result.failure(Exception("Failed to get by category: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getForecast(month: Int?, year: Int?): Result<Forecast> {
        return try {
            val response = summaryService.getForecast(month, year)
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                Result.success(
                    Forecast(
                        projectedIncome = body.projectedIncome,
                        projectedExpense = body.projectedExpense,
                        projectedBalance = body.projectedBalance,
                        daysRemaining = body.daysRemaining,
                        dailyAverageIncome = body.dailyAverageIncome,
                        dailyAverageExpense = body.dailyAverageExpense
                    )
                )
            } else {
                Result.failure(Exception("Failed to get forecast: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}